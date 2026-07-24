const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const reactBuildDir = path.join(rootDir, 'dist-react');
const outputDir = path.resolve(process.env.NETLIFY_REACT_OUTPUT_DIR || path.join(rootDir, 'dist-netlify-react'));
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
