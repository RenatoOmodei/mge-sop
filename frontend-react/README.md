# Frontend React/TypeScript

Base paralela para migrar o frontend legado de `public/app.js` para React sem interromper producao.

## Estado atual

O primeiro modulo da migracao ja esta implementado:

- login com `/api/login`;
- recuperacao de sessao com `/api/me`;
- logout com `/api/logout`;
- alteracao de senha com `/api/change-password`;
- layout base com sidebar, topbar e menu por modulos;
- visibilidade por usuario usando `visibleTabs` e `editableTabs`;
- central de alertas usando `/api/notifications`;
- saude do backend usando `/api/render-health`;
- Pedidos de Venda com tabela paginada no servidor, filtros salvos por usuario e exportacao da pagina;
- telas React conectadas para Dashboard, Produtos, Relatorios, Faturamento, Carregamento, Terceiros, PCP, Sequenciamento, APS, Qualidade/RNC e Cadastros;
- script separado para gerar Netlify em React sem trocar a producao atual: `npm run build:netlify:react`.

Comandos, quando as dependencias forem instaladas:

```powershell
Set-Location -LiteralPath '.\frontend-react'
npm install
npm run dev
```

Na pasta principal tambem existem atalhos:

```powershell
npm run react:install
npm run react:dev
npm run react:build
npm run build:netlify:react
```

Plano:

1. Evoluir formulários complexos: pedido, status, documentos, dimensionais, faturamento detalhado e terceiros.
2. Substituir graficos CSS temporarios por Plotly no Dashboard/Produtos/APS.
3. Compilar `frontend-react` com Vite e validar em homologacao.
4. Trocar o build Netlify padrao para `build:netlify:react` quando houver equivalencia funcional.
