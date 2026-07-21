const fs = require('fs');
const os = require('os');
const path = require('path');
const { Worker } = require('worker_threads');
const { spawnSync } = require('child_process');
const { LocalDatabase } = require('./database');

class PostgresDatabase extends LocalDatabase {
  constructor(settings) {
    super(settings);
    this.settings = { ...settings, dbProvider: 'postgres' };
    this.file = this.settings.databaseUrl ? 'postgres' : '';
  }

  init() {
    if (!this.settings.databaseUrl) {
      throw new Error('DATABASE_URL nao configurada para usar PostgreSQL.');
    }

    this.db = new PostgresCompatDatabase({
      databaseUrl: this.settings.databaseUrl,
      ssl: this.settings.postgresSsl,
      tempDir: path.join(this.settings.dataDir || os.tmpdir(), 'pg-sync')
    });

    this.createSchema();
    this.ensureMeta();
    this.ensureAdmin();
    this.ensureSequencingUserAccessBackfill();
    this.ensureApsUserAccessBackfill();
    this.ensureSeedOrders();
    this.ensureReferenceData();
    this.ensureStatusReleaseHistoryBackfill();
    this.ensureLoadedDimensionNotes();
  }

  createSchema() {
    const schemaFile = path.join(this.settings.rootDir || path.resolve(__dirname, '..'), 'postgresql', 'schema.sql');
    this.db.exec(fs.readFileSync(schemaFile, 'utf8'));
  }

  listBackups() {
    const dir = this.backupDir();
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((name) => /^sop-backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.sql$/.test(name))
      .map((name) => {
        const fullPath = path.join(dir, name);
        const stat = fs.statSync(fullPath);
        return {
          name,
          size: stat.size,
          createdAt: stat.mtime.toISOString()
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  createBackup(label = 'manual') {
    const pgDump = this.findPostgresTool('pg_dump.exe');
    if (!pgDump) {
      return null;
    }

    const dir = this.backupDir();
    fs.mkdirSync(dir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/\..+$/, '').replace(/:/g, '-');
    const fileName = `sop-backup-${timestamp}.sql`;
    const fullPath = path.join(dir, fileName);
    const result = spawnSync(pgDump, [this.settings.databaseUrl, '--file', fullPath], {
      windowsHide: true,
      encoding: 'utf8'
    });
    if (result.status !== 0) {
      throw new Error(result.stderr || result.stdout || 'Falha ao gerar backup PostgreSQL.');
    }

    const stat = fs.statSync(fullPath);
    this.setMetaIfMissing('backupDir', dir);
    this.db
      .prepare('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)')
      .run('lastBackup', JSON.stringify({ name: fileName, label: String(label || 'manual'), createdAt: stat.mtime.toISOString(), size: stat.size }));
    return this.latestBackup();
  }

  restoreBackup() {
    throw new Error('Restauracao automatica PostgreSQL deve ser feita via psql/pg_restore com o servidor parado.');
  }

  safeBackupPath(fileName) {
    const cleanName = path.basename(String(fileName || ''));
    if (!/^sop-backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.sql$/.test(cleanName)) {
      throw new Error('Arquivo de backup invalido.');
    }

    const dir = this.backupDir();
    const fullPath = path.resolve(dir, cleanName);
    const resolvedDir = path.resolve(dir);
    if (!fullPath.startsWith(`${resolvedDir}${path.sep}`)) {
      throw new Error('Arquivo de backup invalido.');
    }
    return fullPath;
  }

  findPostgresTool(toolName) {
    const candidates = [
      path.join('C:\\Program Files\\PostgreSQL\\17\\bin', toolName),
      path.join('C:\\Program Files\\PostgreSQL\\16\\bin', toolName),
      path.join('C:\\Program Files\\PostgreSQL\\15\\bin', toolName),
      path.join('C:\\Program Files\\PostgreSQL\\14\\bin', toolName)
    ];
    return candidates.find((candidate) => fs.existsSync(candidate)) || '';
  }
}

class PostgresCompatDatabase {
  constructor({ databaseUrl, ssl = false, tempDir }) {
    this.databaseUrl = databaseUrl;
    this.tempDir = tempDir || path.join(os.tmpdir(), 'mge-sop-pg-sync');
    fs.mkdirSync(this.tempDir, { recursive: true });
    this.worker = new Worker(path.join(__dirname, 'postgres-sync-worker.js'), {
      workerData: { databaseUrl, ssl }
    });
    this.worker.unref?.();
    this.query('SELECT 1 AS ok', []);
  }

  prepare(sql) {
    const translatedSql = translateSql(sql);
    return {
      all: (...params) => this.query(translatedSql, params).rows,
      get: (...params) => this.query(translatedSql, params).rows[0],
      run: (...params) => {
        const result = this.query(translatedSql, params);
        return { changes: result.rowCount };
      }
    };
  }

  exec(sql) {
    const translatedSql = translateSql(sql);
    if (!translatedSql) return;
    this.query(translatedSql, []);
  }

  query(sql, params) {
    const responseFile = path.join(this.tempDir, `${Date.now()}-${Math.random().toString(16).slice(2)}.json`);
    const signal = new SharedArrayBuffer(4);
    const signalView = new Int32Array(signal);
    this.worker.postMessage({ sql, params, responseFile, signal });
    const waitResult = Atomics.wait(signalView, 0, 0, 120000);
    if (waitResult === 'timed-out') {
      throw new Error('Tempo esgotado ao consultar PostgreSQL.');
    }

    const payload = JSON.parse(fs.readFileSync(responseFile, 'utf8'));
    fs.rmSync(responseFile, { force: true });
    if (!payload.ok) {
      const detail = payload.sql ? ` SQL: ${payload.sql}` : '';
      throw new Error(`${payload.error}${detail}`);
    }
    return payload;
  }

  close() {
    this.worker.terminate();
  }
}

function translateSql(sql) {
  let text = String(sql || '').trim();
  if (!text) return '';
  if (/^PRAGMA\b/i.test(text)) return '';

  let addDoNothing = false;
  text = text.replace(/INSERT\s+OR\s+IGNORE\s+INTO/i, () => {
    addDoNothing = true;
    return 'INSERT INTO';
  });
  text = text.replace(
    /INSERT\s+OR\s+REPLACE\s+INTO\s+app_meta\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i,
    'INSERT INTO app_meta ($1) VALUES ($2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value'
  );

  text = text
    .replace(/GROUP_CONCAT\s*\(/gi, 'STRING_AGG(')
    .replace(/char\((\d+)\)/gi, 'chr($1)')
    .replace(/(\b[a-zA-Z_][a-zA-Z0-9_]*\b)\s+GLOB\s+'\?\?\?\?-\?\?-\?\?'/g, (_match, column) => `${column} ~ '^\\d{4}-\\d{2}-\\d{2}$'`)
    .replace(/julianday\(original_delivery_date\)\s*-\s*julianday\(entry_date\)/gi, '(original_delivery_date::date - entry_date::date)')
    .replace(/julianday\(date\('now',\s*'localtime'\)\)\s*-\s*julianday\(original_delivery_date\)/gi, '(CURRENT_DATE - original_delivery_date::date)')
    .replace(/date\('now',\s*'localtime',\s*\?\)/gi, "to_char((CURRENT_DATE + (?::text)::interval), 'YYYY-MM-DD')")
    .replace(/date\('now',\s*'localtime'\)/gi, "to_char(CURRENT_DATE, 'YYYY-MM-DD')")
    .replace(/\bexcluded\./g, 'EXCLUDED.');

  text = replaceQuestionPlaceholders(text);

  if (addDoNothing && !/\bON\s+CONFLICT\b/i.test(text)) {
    text = `${text.replace(/;+\s*$/, '')} ON CONFLICT DO NOTHING`;
  }

  return text;
}

function replaceQuestionPlaceholders(sql) {
  let index = 0;
  let inSingleQuote = false;
  let result = '';

  for (let position = 0; position < sql.length; position += 1) {
    const char = sql[position];
    const next = sql[position + 1];
    if (char === "'") {
      result += char;
      if (inSingleQuote && next === "'") {
        result += next;
        position += 1;
        continue;
      }
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (char === '?' && !inSingleQuote) {
      index += 1;
      result += `$${index}`;
      continue;
    }

    result += char;
  }

  return result;
}

module.exports = {
  PostgresDatabase,
  PostgresCompatDatabase,
  translateSql
};
