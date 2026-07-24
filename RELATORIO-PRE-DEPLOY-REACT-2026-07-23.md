# Relatorio pre-deploy React - 2026-07-23

## Objetivo

Validar os pontos restantes antes do primeiro deploy React em producao:

- WebSocket / tempo real;
- teste assistido com usuario final;
- rollback para versao legada.

## WebSocket

Status: OK.

Comando executado:

```powershell
npm run test:realtime
```

Resultado validado:

- login local com `admin`;
- conexao autenticada em `ws://127.0.0.1:3010/api/realtime`;
- recebimento da mensagem `connected`;
- criacao de cliente temporario local;
- recebimento da mensagem `data-change`;
- escopos recebidos: `admin`, `orders`, `reports`;
- remocao do cliente temporario com status `200`.

Script criado para repetir o teste:

```powershell
npm run test:realtime
```

Atalho Windows:

```powershell
.\testar-websocket-local.cmd
```

Observacao: este teste foi feito no backend local em `homolog-local`, sem alterar o PostgreSQL do Render.

## Teste assistido com usuario final

Status: roteiro pronto; execucao com usuario final ainda depende de agenda com as areas.

Arquivo criado:

```text
ROTEIRO-TESTE-ASSISTIDO-USUARIO-REACT.md
```

Perfis que devem validar:

- Administrador;
- Comercial;
- Producao / PCP;
- Financeiro;
- Consulta.

Telas cobertas pelo roteiro:

- Pedidos de Venda;
- Pendencias PCP;
- Faturamento;
- Aguardando Carregamento;
- Dashboard;
- Produtos / Previsao;
- Terceiros;
- Qualidade;
- RNC / A3;
- Sequenciamento;
- APS;
- Cadastros.

## Rollback

Status: OK.

Comando executado sem deploy:

```powershell
$env:SOP_BACKEND_URL='https://mge-sop-api.onrender.com'
npm run rollback:build
```

Resultado:

- `dist-netlify` gerado a partir da versao legada;
- validado que o pacote usa `/app.js`;
- validado que nao e pacote React isolado;
- validado manifest PWA;
- validado service worker versionado;
- validado redirect `/api/*` para backend real do Render.

Comando de rollback real, caso necessario:

```powershell
.\rollback-netlify-legado.cmd
```

Observacao: rollback de frontend nao altera o banco PostgreSQL.

## Checks adicionais

Comandos executados:

```powershell
node --check scripts\test-realtime-websocket.js
node --check scripts\verify-legacy-build.js
npm run check
```

Resultado: OK.

## Pendencia antes de publicar React

A unica pendencia operacional restante e executar o teste assistido com usuarios reais das areas e registrar aprovacao.

Depois disso, o primeiro deploy React pode ser feito com rollback preparado.
