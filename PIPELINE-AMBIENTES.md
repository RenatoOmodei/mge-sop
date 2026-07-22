# Pipeline e Ambientes S&OP

## Ambientes

- `local`: pasta de homologacao na maquina do PCP, normalmente com SQLite.
- `homolog`: Render + PostgreSQL separados para teste com usuarios internos.
- `production`: Render + PostgreSQL oficial e frontend Netlify usado pelos usuarios.

## GitHub -> Render / Netlify

O repositório possui dois workflows:

- `.github/workflows/ci.yml`: valida sintaxe e build a cada push/pull request.
- `.github/workflows/deploy.yml`: publica Netlify e chama Render por deploy hook quando os secrets existirem.

Secrets recomendados no GitHub:

- `SOP_PRODUCTION_BACKEND_URL`: URL publica do backend Render de producao.
- `SOP_HOMOLOG_BACKEND_URL`: URL publica do backend Render de homologacao.
- `NETLIFY_AUTH_TOKEN`: token de deploy do Netlify.
- `NETLIFY_SITE_ID`: ID do site Netlify.
- `RENDER_DEPLOY_HOOK`: deploy hook do servico Render `mge-sop-api`.

Se Render e Netlify estiverem conectados diretamente ao GitHub com Auto Deploy ligado, o `git push origin main` ja publica automaticamente. Nesse caso, os workflows funcionam como validacao e alternativa controlada.

## Homologacao

Para criar ambiente separado no Render, use `render-homolog.yaml` como Blueprint. Ele cria:

- `mge-sop-api-homolog`
- `mge-sop-db-homolog`

Nunca use o banco de producao para testes estruturais. Primeiro valide em homologacao, depois promova para `main`.

## React/TypeScript

A migracao para React deve ser feita por modulo:

1. Criar shell React/Vite em paralelo.
2. Migrar componentes compartilhados: tabela, filtros, modal, cards, graficos.
3. Migrar Pedidos de venda.
4. Migrar Dashboard, Faturamento, PCP e APS.
5. Desativar o frontend legado somente quando os modulos principais estiverem equivalentes.

## Backup e restauracao

O sistema agora possui teste de backup pela tela administrativa. Em SQLite ele abre uma copia temporaria do backup. Em PostgreSQL ele valida integridade do dump SQL. Para teste completo em PostgreSQL, crie um banco descartavel e restaure o dump com `psql` antes de usar em producao.
