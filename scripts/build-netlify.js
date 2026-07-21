const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const outputDir = path.join(rootDir, 'dist-netlify');
const rawBackendUrl = String(process.env.SOP_BACKEND_URL || '').trim().replace(/\/+$/, '');
const placeholderBackendPattern = /^https?:\/\/(?:url-real-do-backend|url-do-backend|url-backend|backend-url)(?:\/.*)?$/i;
const backendUrl = placeholderBackendPattern.test(rawBackendUrl) ? '' : rawBackendUrl;

if (!fs.existsSync(publicDir)) {
  throw new Error(`Pasta public nao encontrada: ${publicDir}`);
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.cpSync(publicDir, outputDir, { recursive: true });

const runtimeConfig = {
  apiBaseUrl: '',
  realtimeEnabled: false,
  deployedOn: 'netlify'
};

fs.writeFileSync(
  path.join(outputDir, 'runtime-config.js'),
  `window.SOP_CONFIG = ${JSON.stringify(runtimeConfig, null, 2)};\n`,
  'utf8'
);

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
  console.warn('SOP_BACKEND_URL nao configurada. O frontend sera publicado, mas login/API nao funcionarao ate informar a URL do backend.');
}

console.log(`Build Netlify gerado em: ${outputDir}`);
