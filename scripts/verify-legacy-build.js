const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist-netlify');
const requireBackend = process.argv.includes('--require-backend');

const checks = [];

function addCheck(name, passed, detail = '') {
  checks.push({ name, passed, detail });
}

function read(fileName) {
  const file = path.join(distDir, fileName);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

const indexHtml = read('index.html');
const runtimeConfig = read('runtime-config.js');
const redirects = read('_redirects');
const serviceWorker = read('service-worker.js');
const manifest = read('manifest.webmanifest');

addCheck('dist-netlify existe', fs.existsSync(distDir), distDir);
addCheck('index.html existe', Boolean(indexHtml), 'dist-netlify/index.html');
addCheck('frontend legado usa app.js', indexHtml.includes('<script src="/app.js"></script>'));
addCheck('frontend legado tem botao de instalacao', indexHtml.includes('id="downloadShortcut"'));
addCheck('nao e pacote React isolado', !indexHtml.includes('id="root"') || indexHtml.includes('<script src="/app.js"></script>'));
addCheck('runtime-config gerado', runtimeConfig.includes('window.SOP_CONFIG'));
addCheck('manifest PWA gerado', manifest.includes('"display": "standalone"'));
addCheck('service worker versionado', /mge-sop-shell-(?!dev')[^']+'/.test(serviceWorker));

if (requireBackend) {
  addCheck('redirect /api aponta para backend real', /\/api\/\*\s+https:\/\/.+\/api\/:splat\s+200/.test(redirects));
}

const failed = checks.filter((check) => !check.passed);

for (const check of checks) {
  const status = check.passed ? 'OK' : 'FALHOU';
  const detail = check.detail ? ` - ${check.detail}` : '';
  console.log(`${status}: ${check.name}${detail}`);
}

if (failed.length) {
  console.error(`\nPacote legado invalido para rollback: ${failed.length} verificacao(oes) falharam.`);
  process.exit(1);
}

console.log('\nPacote legado validado para rollback.');
