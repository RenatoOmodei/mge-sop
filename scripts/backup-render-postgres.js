#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const rootDir = path.resolve(__dirname, '..');
const backupDir = process.env.RENDER_BACKUP_DIR || path.join(rootDir, 'data', 'render-backups');
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_DATABASE_URL || '';
const sslEnabled = process.env.POSTGRES_SSL !== 'false';

const tables = [
  'app_meta',
  'users',
  'user_preferences',
  'order_statuses',
  'customers',
  'activity_log',
  'sales_orders',
  'sales_order_photos',
  'third_party_parts',
  'order_status_history',
  'pcp_pending_issues',
  'pcp_pending_motives',
  'order_stage_sequences',
  'quality_rnc_state',
  'quality_alerts',
  'quality_alert_acknowledgements'
];

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

async function main() {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL nao configurada. Use a External Database URL do Render.');
  }

  fs.mkdirSync(backupDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/\..+$/, '').replace(/:/g, '-');
  const outputFile = path.join(backupDir, `render-postgres-backup-${timestamp}.sql`);

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
    max: 1
  });

  try {
    const client = await pool.connect();
    try {
      console.log(`PostgreSQL origem: ${redactDatabaseUrl(databaseUrl)}`);
      console.log(`Arquivo destino: ${outputFile}`);
      console.log(`SSL PostgreSQL: ${sslEnabled ? 'sim' : 'nao'}`);

      const existingTables = [];
      for (const table of tables) {
        if (await tableExists(client, table)) {
          existingTables.push(table);
        }
      }

      if (!existingTables.length) {
        throw new Error('Nenhuma tabela conhecida encontrada no PostgreSQL.');
      }

      const lines = [
        '-- S&OP Render PostgreSQL backup',
        `-- Source: ${redactDatabaseUrl(databaseUrl)}`,
        `-- Generated: ${new Date().toISOString()}`,
        '',
        'SET client_encoding = \'UTF8\';',
        'BEGIN;',
        '',
        `TRUNCATE TABLE ${existingTables.map(quoteIdent).join(', ')} CASCADE;`,
        ''
      ];

      for (const table of existingTables) {
        const columns = await postgresColumns(client, table);
        if (!columns.length) {
          lines.push(`-- ${table}: sem colunas detectadas.`);
          lines.push('');
          continue;
        }

        const result = await client.query(`SELECT ${columns.map(quoteIdent).join(', ')} FROM ${quoteIdent(table)}`);
        lines.push(`-- ${table}: ${result.rows.length} registro(s)`);
        lines.push(`-- colunas: ${columns.join(', ')}`);

        if (!result.rows.length) {
          lines.push('');
          continue;
        }

        const columnList = columns.map(quoteIdent).join(', ');
        for (const row of result.rows) {
          const values = columns.map((column) => sqlValue(row[column], table, column)).join(', ');
          lines.push(`INSERT INTO ${quoteIdent(table)} (${columnList}) VALUES (${values});`);
        }
        lines.push('');
      }

      lines.push('COMMIT;');
      lines.push('');

      fs.writeFileSync(outputFile, lines.join('\n'), 'utf8');
      console.log('Backup concluido com sucesso.');
      console.log(outputFile);
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

async function tableExists(client, table) {
  const result = await client.query(
    `
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = $1
      LIMIT 1
    `,
    [table]
  );
  return result.rowCount > 0;
}

async function postgresColumns(client, table) {
  const result = await client.query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position
    `,
    [table]
  );
  return result.rows.map((row) => row.column_name);
}

function quoteIdent(identifier) {
  return `"${String(identifier).replace(/"/g, '""')}"`;
}

function sqlValue(value, table = '', column = '') {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'NULL';
  }

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }

  const text = typeof value === 'object'
    ? JSON.stringify(value)
    : String(value);
  const escaped = text.replace(/\u0000/g, '').replace(/'/g, "''");

  if (table === 'quality_rnc_state' && column === 'payload') {
    return `'${escaped}'::jsonb`;
  }
  return `'${escaped}'`;
}

function redactDatabaseUrl(value) {
  try {
    const url = new URL(value);
    if (url.password) url.password = '***';
    return url.toString();
  } catch (_) {
    return '<DATABASE_URL invalida para exibicao>';
  }
}
