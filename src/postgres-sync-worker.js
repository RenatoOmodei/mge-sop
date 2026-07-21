const fs = require('fs');
const { parentPort, workerData } = require('worker_threads');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: workerData.databaseUrl,
  ssl: workerData.ssl ? { rejectUnauthorized: false } : false,
  max: 4
});

parentPort.on('message', async (message) => {
  const signal = new Int32Array(message.signal);
  try {
    const result = await pool.query(message.sql, message.params || []);
    fs.writeFileSync(message.responseFile, JSON.stringify({
      ok: true,
      rows: result.rows || [],
      rowCount: result.rowCount || 0
    }), 'utf8');
  } catch (error) {
    fs.writeFileSync(message.responseFile, JSON.stringify({
      ok: false,
      error: error.message,
      sql: message.sql
    }), 'utf8');
  } finally {
    Atomics.store(signal, 0, 1);
    Atomics.notify(signal, 0, 1);
  }
});

process.on('exit', () => {
  pool.end().catch(() => {});
});
