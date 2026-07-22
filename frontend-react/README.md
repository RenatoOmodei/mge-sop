# Frontend React/TypeScript

Base paralela para migrar o frontend legado de `public/app.js` para React sem interromper producao.

Comandos, quando as dependencias forem instaladas:

```powershell
Set-Location -LiteralPath '.\frontend-react'
npm install
npm run dev
```

Plano:

1. Migrar componentes compartilhados: cards, modais, tabelas e filtros.
2. Migrar Pedidos de venda com tabela virtualizada.
3. Migrar Dashboard e graficos.
4. Migrar Faturamento, PCP, Sequenciamento e APS.
5. Trocar o build Netlify para publicar React quando houver equivalencia funcional.
