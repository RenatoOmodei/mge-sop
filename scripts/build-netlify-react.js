const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const reactBuildDir = path.join(rootDir, 'dist-react');
const outputDir = path.resolve(process.env.NETLIFY_REACT_OUTPUT_DIR || path.join(rootDir, 'dist-netlify-react'));
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const netlifyContext = String(process.env.CONTEXT || '').trim();
const appEnvironment = String(process.env.SOP_ENV || (netlifyContext === 'production' ? 'production' : 'homolog')).trim();
const environmentBackendUrl = appEnvironment === 'production'
  ? process.env.SOP_PRODUCTION_BACKEND_URL
  : process.env.SOP_HOMOLOG_BACKEND_URL;
const rawBackendUrl = String(environmentBackendUrl || process.env.SOP_BACKEND_URL || '').trim().replace(/\/+$/, '');
const placeholderBackendPattern = /^https?:\/\/(?:url-real-do-backend|url-do-backend|url-backend|backend-url)(?:\/.*)?$/i;
const backendUrl = placeholderBackendPattern.test(rawBackendUrl) ? '' : rawBackendUrl;

if (!fs.existsSync(path.join(reactBuildDir, 'index.html'))) {
  throw new Error(`Build React nao encontrado em ${reactBuildDir}. Rode npm run react:build antes.`);
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.cpSync(reactBuildDir, outputDir, { recursive: true });

const runtimeConfig = {
  apiBaseUrl: '',
  realtimeEnabled: false,
  deployedOn: 'netlify-react',
  environment: appEnvironment,
  version: packageJson.version,
  builtAt: new Date().toISOString()
};
const buildId = String(process.env.COMMIT_REF || process.env.DEPLOY_ID || runtimeConfig.builtAt)
  .replace(/[^a-zA-Z0-9_-]/g, '-')
  .slice(0, 80);

fs.writeFileSync(
  path.join(outputDir, 'runtime-config.js'),
  `window.SOP_CONFIG = ${JSON.stringify(runtimeConfig, null, 2)};\n`,
  'utf8'
);

stampServiceWorkerCache(outputDir, buildId);

const redirects = [];
if (backendUrl) {
  redirects.push(`/api/* ${backendUrl}/api/:splat 200`);
}
redirects.push('/* /index.html 200');

fs.writeFileSync(path.join(outputDir, '_redirects'), `${redirects.join('\n')}\n`, 'utf8');

configureEnvironmentAssets(outputDir, appEnvironment);

if (rawBackendUrl && !backendUrl) {
  console.warn(`SOP_BACKEND_URL parece ser um exemplo e foi ignorada: ${rawBackendUrl}`);
}

if (!backendUrl) {
  console.warn('SOP_BACKEND_URL nao configurada. O frontend React sera publicado, mas login/API nao funcionarao ate informar a URL do backend.');
}

console.log(`Build Netlify React gerado em: ${outputDir}`);

function stampServiceWorkerCache(dir, id) {
  const serviceWorkerFile = path.join(dir, 'service-worker.js');
  if (!fs.existsSync(serviceWorkerFile)) return;
  const source = fs.readFileSync(serviceWorkerFile, 'utf8');
  fs.writeFileSync(
    serviceWorkerFile,
    source.replace(/const CACHE_NAME = 'mge-sop-shell-[^']+';/, `const CACHE_NAME = 'mge-sop-shell-${id}';`),
    'utf8'
  );
}

function configureEnvironmentAssets(dir, environment) {
  const isProduction = environment === 'production';
  const iconStem = isProduction ? 'pwa-icon-production' : 'pwa-icon-homolog';
  const themeColor = isProduction ? '#172033' : '#7f1d1d';
  const appName = isProduction ? 'Synapse' : 'Synapse Homologacao';
  const shortName = isProduction ? 'Synapse' : 'Synapse HML';

  for (const size of ['192', '512']) {
    const source = path.join(dir, `${iconStem}-${size}.png`);
    const target = path.join(dir, `pwa-icon-${size}.png`);
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, target);
    }
  }

  const manifestPath = path.join(dir, 'manifest.webmanifest');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.name = appName;
    manifest.short_name = shortName;
    manifest.theme_color = themeColor;
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  }

  const indexPath = path.join(dir, 'index.html');
  if (fs.existsSync(indexPath)) {
    const title = isProduction ? 'Synapse' : 'Synapse - Homologacao';
    const html = fs.readFileSync(indexPath, 'utf8')
      .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
      .replace(/<meta name="theme-color" content="[^"]*">/, `<meta name="theme-color" content="${themeColor}">`)
      .replace(/<meta name="msapplication-TileColor" content="[^"]*">/, `<meta name="msapplication-TileColor" content="${themeColor}">`);
    fs.writeFileSync(indexPath, html, 'utf8');
  }
}
