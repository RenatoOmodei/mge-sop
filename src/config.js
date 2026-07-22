const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dataDir = process.env.DATA_DIR || path.join(rootDir, 'data');

function readArg(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : '';
}

module.exports = {
  appName: 'S&OP',
  appVersion: '2026-07-22-auto-update-render-cleanup-v60',
  rootDir,
  publicDir: path.join(rootDir, 'public'),
  dataDir,
  backupDir: path.join(dataDir, 'backups'),
  logsDir: path.join(dataDir, 'logs'),
  dbProvider: 'sqlite',
  requestedDbProvider: process.env.DB_PROVIDER || 'sqlite',
  dbFile: process.env.DB_FILE || path.join(dataDir, 'erp.sqlite'),
  databaseUrl: process.env.DATABASE_URL || '',
  postgresSsl: process.env.POSTGRES_SSL === 'true',
  httpsKeyFile: process.env.HTTPS_KEY_FILE || '',
  httpsCertFile: process.env.HTTPS_CERT_FILE || '',
  host: readArg('host') || process.env.HOST || '0.0.0.0',
  port: Number(readArg('port') || process.env.PORT || 3010),
  sessionCookieName: 'erp_session',
  adminUsername: process.env.ADMIN_USER || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  resetAdminPasswordOnStart: process.env.RESET_ADMIN_PASSWORD_ON_START === 'true'
    || process.env.FORCE_ADMIN_PASSWORD_RESET === 'true'
};
