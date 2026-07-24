const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend-react');
const command = process.argv[2];
const extraArgs = process.argv.slice(3);
const reactPort = Number(process.env.REACT_PORT || 5173);

const tools = {
  tsc: path.join(frontendDir, 'node_modules', 'typescript', 'bin', 'tsc'),
  vite: path.join(frontendDir, 'node_modules', 'vite', 'bin', 'vite.js'),
  viteApi: path.join(frontendDir, 'node_modules', 'vite', 'dist', 'node', 'index.js'),
  reactPlugin: path.join(frontendDir, 'node_modules', '@vitejs', 'plugin-react', 'dist', 'index.js'),
};

function npmCliPath() {
  const candidates = [
    process.env.npm_execpath,
    path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    process.env.APPDATA && path.join(process.env.APPDATA, 'npm', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate));
}

function ensureTool(name) {
  if (!fs.existsSync(tools[name])) {
    console.error(`Ferramenta React nao encontrada: ${name}. Execute: npm run react:install`);
    process.exit(1);
  }
}

async function viteConfig() {
  ensureTool('viteApi');
  ensureTool('reactPlugin');
  const vite = await import(pathToFileURL(tools.viteApi).href);
  const reactModule = await import(pathToFileURL(tools.reactPlugin).href);
  const react = reactModule.default || reactModule;

  return {
    vite,
    config: {
      configFile: false,
      root: frontendDir,
      plugins: [react()],
      publicDir: path.join(rootDir, 'public'),
      server: {
        host: '0.0.0.0',
        port: reactPort,
        strictPort: process.env.REACT_STRICT_PORT === 'true',
        proxy: {
          '/api': 'http://localhost:3010',
        },
      },
      preview: {
        host: '0.0.0.0',
        port: 4173,
      },
      build: {
        outDir: path.join(rootDir, 'dist-react'),
        emptyOutDir: true,
      },
    },
  };
}

function run(executable, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd: options.cwd || frontendDir,
      env: process.env,
      shell: false,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Comando finalizou com erro (${code}): ${executable} ${args.join(' ')}`));
    });
  });
}

async function main() {
  if (!command) {
    console.error('Informe o comando: install, dev, build, preview, tsc ou vite.');
    process.exit(1);
  }

  if (command === 'install') {
    const npmCli = npmCliPath();
    if (!npmCli) {
      console.error('Nao foi possivel localizar o npm-cli.js para instalar dependencias React.');
      process.exit(1);
    }
    await run(process.execPath, [npmCli, 'install', ...extraArgs], { cwd: frontendDir });
    return;
  }

  if (command === 'tsc') {
    ensureTool('tsc');
    await run(process.execPath, [tools.tsc, ...(extraArgs.length ? extraArgs : ['--noEmit'])]);
    return;
  }

  if (command === 'vite') {
    ensureTool('vite');
    await run(process.execPath, [tools.vite, ...extraArgs]);
    return;
  }

  if (command === 'build') {
    ensureTool('tsc');
    await run(process.execPath, [tools.tsc, '--noEmit']);
    const { vite, config } = await viteConfig();
    await vite.build(config);
    return;
  }

  if (command === 'dev') {
    const { vite, config } = await viteConfig();
    const server = await vite.createServer(config);
    await server.listen();
    server.printUrls();
    await new Promise(() => {});
    return;
  }

  if (command === 'preview') {
    const { vite, config } = await viteConfig();
    const server = await vite.preview(config);
    server.printUrls();
    await new Promise(() => {});
    return;
  }

  console.error(`Comando React desconhecido: ${command}`);
  process.exit(1);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
