# Homologacao React local do S&OP

A homologacao React deve rodar somente na maquina local.

Producao continua usando:

- Frontend oficial: Netlify do sistema atual em `public/`
- Backend oficial: Render `mge-sop-api`
- Banco oficial: PostgreSQL do Render

Homologacao local usa:

- Frontend React: `frontend-react/`
- Backend local: `http://localhost:3010`
- Banco local: SQLite em `data/erp.sqlite`

Assim, testes React nao alteram dados oficiais.

## Iniciar homologacao local

Use o atalho:

```powershell
Set-Location -LiteralPath 'C:\Users\Planejamento\Documents\Codex\2026-07-06\c\outputs\[MGE] S&OP'
.\iniciar-homologacao-react-local.cmd
```

Ele abre duas janelas:

- Backend local em `http://localhost:3010`
- Frontend React em `http://localhost:5173`

## Rodar manualmente

Terminal 1:

```powershell
Set-Location -LiteralPath 'C:\Users\Planejamento\Documents\Codex\2026-07-06\c\outputs\[MGE] S&OP'
$env:DB_PROVIDER="sqlite"
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
$env:POSTGRES_SSL="false"
$env:APP_ENV="homolog-local"
$env:PORT="3010"
npm start
```

Terminal 2:

```powershell
Set-Location -LiteralPath 'C:\Users\Planejamento\Documents\Codex\2026-07-06\c\outputs\[MGE] S&OP'
npm run react:dev
```

Acesse:

```text
http://localhost:5173
```

## Publicacao oficial

Somente depois de validar localmente:

1. Integrar as mudancas aprovadas no frontend oficial.
2. Subir para GitHub.
3. Render/Netlify publicam somente a versao oficial.
