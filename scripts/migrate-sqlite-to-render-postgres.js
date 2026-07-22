#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const { Pool } = require('pg');

const rootDir = path.resolve(__dirname, '..');
const dbFile = process.env.DB_FILE || path.join(rootDir, 'data', 'erp.sqlite');
const schemaFile = process.env.POSTGRES_SCHEMA_FILE || path.join(rootDir, 'postgresql', 'schema.sql');
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
  if (!fs.existsSync(dbFile)) {
    throw new Error(`Banco SQLite nao encontrado: ${dbFile}`);
  }
  if (!fs.existsSync(schemaFile)) {
    throw new Error(`Schema PostgreSQL nao encontrado: ${schemaFile}`);
  }

  const sqlite = new DatabaseSync(dbFile, { readOnly: true });
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
    max: 1
  });

  try {
    const client = await pool.connect();
    try {
      console.log(`SQLite origem: ${dbFile}`);
      console.log(`PostgreSQL destino: ${redactDatabaseUrl(databaseUrl)}`);
      console.log(`SSL PostgreSQL: ${sslEnabled ? 'sim' : 'nao'}`);

      await client.query(fs.readFileSync(schemaFile, 'utf8'));

      const existingTables = tables.filter((table) => tableExists(sqlite, table));
      if (!existingTables.length) {
        throw new Error('Nenhuma tabela conhecida encontrada no SQLite.');
      }

      await client.query('BEGIN');
      await client.query(`TRUNCATE TABLE ${existingTables.map(quoteIdent).join(', ')} CASCADE`);

      for (const table of existingTables) {
        const sourceColumns = tableColumns(sqlite, table);
        const targetColumns = await postgresColumns(client, table);
        const columns = sourceColumns.filter((column) => targetColumns.has(column));
        const ignored = sourceColumns.filter((column) => !targetColumns.has(column));

        if (!columns.length) {
          console.log(`${table}: sem colunas compativeis.`);
          continue;
        }

        const rows = sqlite
          .prepare(`SELECT ${columns.map(quoteIdent).join(', ')} FROM ${quoteIdent(table)}`)
          .all();

        console.log(`${table}: importando ${rows.length} registro(s)${ignored.length ? `; ignoradas: ${ignored.join(', ')}` : ''}.`);
        if (!rows.length) continue;

        const columnList = columns.map(quoteIdent).join(', ');
        const placeholders = columns
          .map((column, index) => table === 'quality_rnc_state' && column === 'payload'
            ? `$${index + 1}::jsonb`
            : `$${index + 1}`)
          .join(', ');
        const insertSql = `INSERT INTO ${quoteIdent(table)} (${columnList}) VALUES (${placeholders})`;

        for (const row of rows) {
          await client.query(insertSql, columns.map((column) => normalizeValue(row[column])));
        }
      }

      await client.query('COMMIT');
      console.log('Migracao concluida com sucesso.');
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch (_) {
        // Ignore rollback errors and report the original failure.
      }
      throw error;
    } finally {
      client.release();
    }
  } finally {
    sqlite.close();
    await pool.end();
  }
}

function tableExists(db, table) {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(table);
  return Boolean(row);
}

function tableColumns(db, table) {
  return db
    .prepare(`PRAGMA table_info(${quoteIdent(table)})`)
    .all()
    .map((column) => column.name);
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
  return new Set(result.rows.map((row) => row.column_name));
}

function quoteIdent(identifier) {
  return `"${String(identifier).replace(/"/g, '""')}"`;
}

function normalizeValue(value) {
  if (value === undefined) return null;
  if (typeof value === 'string') return value.replace(/\u0000/g, '');
  return value;
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
