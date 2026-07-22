#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const rootDir = path.resolve(__dirname, '..');
const dbFile = process.env.DB_FILE || path.join(rootDir, 'data', 'erp.sqlite');
const outputFile = process.env.POSTGRES_EXPORT_FILE
  || path.join(rootDir, 'data', 'postgres-export', 'mge-sop-data.sql');

const tables = [
  'app_meta',
  'users',
  'user_preferences',
  'order_statuses',
  'customers',
  'sales_orders',
  'activity_log',
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

if (!fs.existsSync(dbFile)) {
  console.error(`Banco SQLite nao encontrado: ${dbFile}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true });

const db = new DatabaseSync(dbFile, { readOnly: true });

try {
  db.exec('PRAGMA wal_checkpoint(PASSIVE);');
} catch (error) {
  // Banco aberto por outro processo pode impedir checkpoint; a leitura continua.
}

const existingTables = tables.filter((table) => tableExists(table));
const lines = [
  '-- S&OP SQLite to PostgreSQL data export',
  `-- Source: ${dbFile}`,
  `-- Generated: ${new Date().toISOString()}`,
  '',
  'BEGIN;',
  '',
  existingTables.length
    ? `TRUNCATE TABLE ${existingTables.map(quoteIdent).join(', ')} CASCADE;`
    : '-- Nenhuma tabela conhecida encontrada para truncar.',
  ''
];

for (const table of existingTables) {
  const columns = tableColumns(table);
  if (!columns.length) {
    lines.push(`-- ${table}: sem colunas detectadas.`);
    lines.push('');
    continue;
  }

  const selectSql = `SELECT ${columns.map(quoteIdent).join(', ')} FROM ${quoteIdent(table)}`;
  const rows = db.prepare(selectSql).all();
  lines.push(`-- ${table}: ${rows.length} registro(s)`);
  lines.push(`-- colunas: ${columns.join(', ')}`);

  if (!rows.length) {
    lines.push('');
    continue;
  }

  const columnList = columns.map(quoteIdent).join(', ');
  for (const row of rows) {
    const values = columns.map((column) => sqlValue(row[column], table, column)).join(', ');
    lines.push(`INSERT INTO ${quoteIdent(table)} (${columnList}) VALUES (${values});`);
  }
  lines.push('');
}

lines.push('COMMIT;');
lines.push('');

fs.writeFileSync(outputFile, lines.join('\n'), 'utf8');
db.close();

console.log(`Exportacao PostgreSQL criada em: ${outputFile}`);
console.log('Use postgresql/schema.sql para criar a estrutura antes de importar os dados.');

function tableExists(table) {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(table);
  return Boolean(row);
}

function tableColumns(table) {
  return db
    .prepare(`PRAGMA table_info(${quoteIdent(table)})`)
    .all()
    .map((column) => column.name);
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

  const text = String(value).replace(/\u0000/g, '').replace(/'/g, "''");
  if (table === 'quality_rnc_state' && column === 'payload') {
    return `'${text}'::jsonb`;
  }
  return `'${text}'`;
}
