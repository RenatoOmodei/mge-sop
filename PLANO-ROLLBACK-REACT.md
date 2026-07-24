# Plano de rollback da migracao React

Este plano existe para manter a versao atual do S&OP funcionando e permitir retorno rapido caso a versao React apresente problema em producao.

## Regra principal

- A versao atual/legada continua em `public/`.
- A homologacao React continua em `frontend-react/`.
- O banco PostgreSQL do Render nao deve ser alterado durante rollback de frontend.
- Enquanto a migracao React nao estiver equivalente, o Netlify oficial deve publicar `npm run build:netlify`.

## Antes de publicar React em producao

1. Fazer backup do banco do Render:

```powershell
.\backup-render-postgresql.cmd
```

2. Confirmar que a versao legada ainda gera pacote valido:

```powershell
Set-Location -LiteralPath 'C:\Users\Planejamento\Documents\Codex\2026-07-06\c\outputs\[MGE] S&OP'
$env:SOP_BACKEND_URL='https://mge-sop-api.onrender.com'
npm run rollback:build
```

3. Criar um ponto de referencia no Git:

```powershell
git tag prod-legado-antes-react
git push origin prod-legado-antes-react
```

4. Anotar o deploy atual do Netlify que esta funcionando:

- Netlify > Deploys > Published deploy
- Guardar commit, data/hora e URL unica do deploy.

## Rollback rapido pelo Netlify

Este e o metodo mais rapido quando o problema esta apenas no frontend.

1. Acessar Netlify.
2. Abrir o site `symphonious-quokka-707211`.
3. Ir em `Deploys`.
4. Abrir o ultimo deploy estavel da versao legada.
5. Clicar em `Publish deploy`.
6. Validar login, pedidos, PCP, faturamento e dashboard.

## Rollback por comando local

Use quando quiser republicar a versao legada atual que esta na pasta `public/`.

```powershell
Set-Location -LiteralPath 'C:\Users\Planejamento\Documents\Codex\2026-07-06\c\outputs\[MGE] S&OP'
.\rollback-netlify-legado.cmd
```

O comando:

- usa o backend `https://mge-sop-api.onrender.com`;
- gera `dist-netlify` a partir da versao legada;
- valida se o pacote nao e React;
- publica em producao no Netlify.

## Rollback do backend Render

Use somente se o problema estiver no servidor/API.

1. Acessar Render.
2. Abrir o servico `mge-sop-api`.
3. Ir em `Deploys`.
4. Selecionar o ultimo deploy estavel.
5. Usar `Rollback` ou `Redeploy` conforme a opcao exibida pelo Render.
6. Nao restaurar banco sem necessidade.

## Rollback do banco

Restaurar banco e uma acao critica. Use apenas se uma migracao de dados ou estrutura corromper informacoes.

Antes de restaurar:

- baixar um backup novo do estado atual;
- guardar o horario do incidente;
- confirmar que o problema nao e apenas frontend ou API;
- validar o arquivo de backup que sera restaurado.

Backups locais do Render ficam em:

```text
C:\Users\Planejamento\Documents\Codex\2026-07-06\c\outputs\[MGE] S&OP\data\render-backups
```

## Checklist apos rollback

- Login com usuario administrador.
- Abrir Pedidos de Venda.
- Editar um pedido de teste.
- Validar Dashboard.
- Validar Pendencias PCP.
- Validar Faturamento.
- Validar que o PWA atualizou apos fechar e abrir novamente.
