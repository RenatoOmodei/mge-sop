# Relatorio de homologacao React - 2026-07-23

## Ambiente testado

- Backend local: `http://localhost:3010`
- Ambiente do backend: `homolog-local`
- Banco local: SQLite
- Frontend React testado: `http://localhost:5180`
- Motivo do uso da porta `5180`: as portas `5173` e `5174` estavam ocupadas por outro sistema local com titulo `MES Platform`.
- Producao nao foi alterada.
- PostgreSQL do Render nao foi alterado.

Para permitir o teste, a senha do usuario `admin` foi redefinida somente no SQLite local para `admin123`.

## Validacoes executadas

| Area | Resultado | Evidencias |
| --- | --- | --- |
| Build React | OK | `npm run react:build` executado com sucesso. |
| Login | OK | Login com `admin/admin123`; perfil Administrador carregado. |
| Pedidos de Venda | OK | Cards, filtros, tabela com 750 pedidos, selecao de linha, botoes Editar/Status/OP/PC/Dimensional/Documentos habilitados, modal de edicao abriu e fechou sem erro. |
| Pendencias PCP | OK | Tabela carregada, filtros/classificacao visiveis, botao `Inserir nova pendencia` abriu cadastro com pedido, componente, tipo, motivo, pedido de compra, data prevista e observacoes. |
| Faturamento | OK | Itens aguardando e historico faturado carregaram, filtros visiveis, consulta de item faturado abriu dados fiscais/dimensionais sem erro. |
| Dashboard | OK | Cards, metas, 8 graficos Plotly e tabelas carregaram sem erro visivel. |
| Cadastros | OK | Tela admin carregou com backups, status, clientes, motivos PCP e usuarios/permissoes. Botao `Cadastrar status` visivel. |
| Produtos | OK | Estatisticas, previsao, filtros, tabelas e 8 graficos carregaram. |
| Terceiros | OK | Tabela carregada; `Nova remessa` abriu formulario com romaneio, pedido vinculado, nome cliente/fornecedor, peca, quantidade, datas e observacoes. |
| Qualidade - Alertas | OK | Tabela carregada; `Inserir novo alerta` abriu formulario com pedido, cliente, linha, SKU, capacidade, quantidade e quadros de foto/descricao. |
| Qualidade - RNC / A3 | OK | Tela RNC/A3 carregou com lista, campos do formulario e acoes. |
| APS | OK | Tela carregou com operacoes, centros, operadores, tabelas e botoes de exportacao/impressao. |
| Sequenciamento | OK | Tela carregou com lista de pendencias, tempo estimado, Gantt e botoes de exportacao/impressao. |
| Aguardando carregamento | OK | Tabela carregou com filtros, consultar, baixar NF e acao `Carregado`. |
| Relatorios | OK | Historico de atividades carregou com filtros, classificacao e paginacao. |

## Erros encontrados

- Nenhuma tela apresentou `Rota nao encontrada`.
- Nenhuma tela apresentou erro visivel de falha de API durante a navegacao.
- Nenhum erro de console foi capturado durante a varredura principal.

## Observacoes

- O teste foi feito sem gravar novos registros operacionais. Foram abertos formularios e consultas, mas botoes de salvar/faturar/carregar/restaurar nao foram acionados.
- Como a porta `5173` estava ocupada por outro sistema, esta rodada nao testou exatamente `http://localhost:5173`; testou o build React equivalente em `http://localhost:5180`.
- O servidor estatico de homologacao usado neste teste deixou o WebSocket desabilitado. A navegacao e as APIs HTTP foram validadas; a atualizacao em tempo real deve ser testada em uma rodada separada com o Vite proxy ou com ambiente publicado de homologacao.
- O build React ainda emite alerta de bundle grande por causa do Plotly. Nao impediu o carregamento, mas continua sendo ponto de performance para otimizar.

## Conclusao

A homologacao manual das telas criticas foi aprovada para navegacao, carregamento de dados, abertura de formularios e ausencia de erros aparentes.

Antes de trocar o frontend oficial no Netlify para React, ainda recomenda-se:

- liberar a porta `5173` ou padronizar uma porta oficial de homologacao;
- validar WebSocket em tempo real;
- fazer um teste assistido com usuario final em Pedidos, PCP, Faturamento e Dashboard;
- manter o plano de rollback pronto para o primeiro deploy React em producao.
