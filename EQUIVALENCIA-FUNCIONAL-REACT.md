# Equivalencia funcional da homologacao React

Conferencia realizada em 2026-07-23, comparando a versao atual em `public/app.js` com a homologacao React em `frontend-react`.

Status usado:

- OK: funcionalidade coberta na versao React.
- PARCIAL: existe cobertura, mas ainda depende de validacao manual ou tem diferenca conhecida.
- PENDENTE: lacuna funcional identificada.

## Matriz por modulo

| Modulo | Status | Cobertura React | Observacoes |
| --- | --- | --- | --- |
| Pedidos de Venda | OK | Login/permissao, tabela paginada no servidor, filtros, classificacao, filtro por vencimento, escopo ativo/cancelado/concluido/producao, colunas configuraveis, cabecalho/colunas congeladas, linha por status/atraso/PCP, icones de PCP e qualidade, resumo ao clicar, novo/editar/excluir, alterar status com desvio, OP, pedido de compra, dimensional, documentos, etapas LM/Serpentina/Projetos, liberar faturamento e exportar CSV. | Corrigido nesta etapa: exclusao de pedido na tela React. |
| Dashboard | OK | Cards, graficos Plotly, metas, filtro por ano, liberacao por mes, tabela de maquinas liberadas por status, IA operacional S&OP e atualizacao por sinal em tempo real. | O pacote Plotly ainda e grande; otimizar com carregamento sob demanda em etapa de performance. |
| Produtos | OK | Estatisticas, previsao de demanda, filtros, classificacao, graficos, cards, analise S&OP e preferencias por usuario no backend. | Preferencias antigas do navegador sao usadas apenas como migracao inicial. |
| Faturamento | OK | Itens liberados, historico de faturados, filtros, dimensional completo, peso liquido/bruto, dados fiscais, transportadora, NF anexada, abrir/baixar NF, origem cliente ou beneficiamento. | Fluxo integrado com Pedidos e Terceiros. |
| Aguardando Carregamento | OK | Itens faturados, filtros por pedido/transportadora/origem/NF/data, colunas NF/acoes separadas, baixar/abrir NF e marcar carregado. | Atualiza por sinal em tempo real. |
| Pendencias PCP | OK | Inserir nova pendencia, tipos Compras/Engenharia/Retrabalho, motivos cadastraveis, pedido de compra para compras, data prevista editavel, destaque em vermelho para atraso, filtros e classificacao por coluna. | Motivos sao cadastrados dentro da propria tela PCP. |
| Sequenciamento | OK | Lista por atividade LM/Serpentina/Projeto Mecanico/Projeto Eletrico, sequencia manual, tempo estimado, Gantt, relatorio impresso e exportacao CSV/Excel. | Atualiza por sinal em tempo real. |
| APS | OK | Centros de trabalho, operacoes vindas dos status, operadores, habilidades, capacidade, simulacao, Gantt APS, analise de gargalo/atraso e exportacao. | Algoritmo ainda e heuristico local; IA generativa fica para etapa posterior. |
| Terceiros | OK | Romaneio, vinculo com pedido de venda, pedido de compra posterior, liberar faturamento somente apos PC, consulta, excluir, retorno, NF de itens faturados, abrir/baixar NF. | Integrado ao faturamento como beneficiamento. |
| Qualidade | OK | Alertas de qualidade em tabela, novo/editar/resolver/excluir, fotos jeito errado/certo, detalhe do alerta, icones diferenciados em Pedidos, ciencia de alerta e tela RNC/A3 separada. | RNC/A3 React ja salva no banco central via `quality/rnc-state`. |
| Cadastros | OK | Admin restrito, usuarios, permissoes por abas, status com sequencia/categoria/fluxo, clientes, motivos PCP, backups, teste/restauracao com confirmacao `RESTAURAR` e saude do sistema. | Motivos PCP tambem continuam disponiveis na tela PCP para agilidade operacional. |
| Relatorios | OK | Historico de atividades, agrupamento, filtros por coluna, classificacao, exportacao CSV/Excel e preferencias por usuario no backend. | Preferencias antigas do navegador sao usadas apenas como migracao inicial. |

## Itens transversais

| Item | Status | Observacoes |
| --- | --- | --- |
| Login e troca de senha | OK | React usa `/api/login`, `/api/logout`, `/api/me` e `/api/change-password`. |
| Permissoes por perfil/aba | OK | Menu, botoes e funcoes internas respeitam `visibleTabs`, `editableTabs` e `canEditOrders`. Acoes de editar, faturar, carregar, cadastrar, alterar status, sequenciar, configurar APS, qualidade, terceiros, PCP e cadastros administrativos ficam bloqueadas no React quando o usuario nao tem permissao. |
| Atualizacao em tempo real | OK | React conecta em `/api/realtime` quando `realtimeEnabled` esta ativo, interpreta escopos do WebSocket e atualiza a tela relacionada. Pedidos, Faturamento, PCP e Alertas/Qualidade recarregam sem F5; notificacoes tambem sao atualizadas por evento. |
| PWA/instalacao | OK | Botao de instalar app, fallback de atalho antigo e aviso de nova versao via service worker. |
| Saude do sistema | OK | Painel mostra servidor, banco, HTTPS, WebSocket, sessoes, versao e ultimo backup. |
| Preferencias por usuario | OK | Pedidos salva filtros, ordenacao, paginacao, visibilidade, posicao e largura de colunas no backend por usuario. Produtos, Relatorios, PCP, Faturamento, Carregamento, Terceiros, Sequenciamento e APS salvam preferencias/filtros no backend por usuario, com cache local separado por usuario como fallback. |
| Deploy oficial | PENDENTE | Homologacao React ainda nao deve substituir o frontend oficial no Netlify ate os testes manuais serem aprovados. |

## Proxima etapa recomendada

Executar teste manual assistido das telas criticas em homologacao local: Pedidos de Venda, Pendencias PCP, Faturamento, Dashboard, Cadastros, Produtos/Previsao e Terceiros.
