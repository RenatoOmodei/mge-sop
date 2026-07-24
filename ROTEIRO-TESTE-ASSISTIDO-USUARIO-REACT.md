# Roteiro de teste assistido - React

Este roteiro serve para validar a versao React com um usuario final antes de trocar o frontend oficial do Netlify.

## Ambiente

- Usar homologacao local.
- Nao usar o banco PostgreSQL de producao.
- Nao publicar no Netlify durante este teste.
- Antes de iniciar, confirmar que o rollback legado continua validado.

Comandos recomendados:

```powershell
Set-Location -LiteralPath 'C:\Users\Planejamento\Documents\Codex\2026-07-06\c\outputs\[MGE] S&OP'
npm run react:build
npm run test:realtime
npm run rollback:build
```

## Usuarios para testar

| Perfil | Objetivo |
| --- | --- |
| Administrador | Validar acesso total, cadastros, permissoes e acoes criticas. |
| Comercial | Validar pedidos, consulta e edicao permitida. |
| Producao / PCP | Validar pendencias, sequenciamento, APS e status de producao. |
| Financeiro | Validar faturamento, NF e aguardando carregamento. |
| Consulta | Validar bloqueios de edicao e visualizacao limitada. |

## Checklist geral

| Item | Esperado | OK | Observacao |
| --- | --- | --- | --- |
| Login | Usuario entra sem erro. |  |  |
| Menu lateral | Mostra apenas modulos permitidos. |  |  |
| Permissoes | Botoes proibidos aparecem bloqueados ou ocultos. |  |  |
| WebSocket | Alteracao feita por outro usuario aparece sem F5. |  |  |
| PWA | Botao instalar aparece e app abre como aplicativo. |  |  |
| Logout | Sessao encerra corretamente. |  |  |

## Pedidos de Venda

| Teste | Esperado | OK | Observacao |
| --- | --- | --- | --- |
| Abrir tela | Cards, filtros e tabela carregam. |  |  |
| Filtrar por texto | Lista muda conforme pedido, cliente ou SKU. |  |  |
| Filtrar por situacao | Ativos, em producao, cancelados e concluidos funcionam. |  |  |
| Filtrar vencimento | Campo de dias mostra pedidos no periodo. |  |  |
| Ordenar coluna | Clicar no titulo altera a ordem. |  |  |
| Selecionar linha | Botoes Editar, Status, OP, PC, Dimensional e Documentos habilitam. |  |  |
| Abrir resumo | Clique na linha mostra resumo objetivo. |  |  |
| Editar pedido | Modal abre com dados corretos. |  |  |
| Status sequencial | Nao permite pular status sem motivo de desvio. |  |  |
| Pendencia PCP | Icone de alerta mostra pendencias do pedido. |  |  |
| Qualidade | Icone de alerta de qualidade fica diferente do PCP. |  |  |
| Exportar Excel/CSV | Arquivo baixa corretamente. |  |  |

## Pendencias PCP

| Teste | Esperado | OK | Observacao |
| --- | --- | --- | --- |
| Abrir tela | Tabela, filtros e classificacao carregam. |  |  |
| Nova pendencia | Formulario abre com pedido, componente, tipo, motivo e data prevista. |  |  |
| Tipo Compras | Campo de pedido de compra fica disponivel. |  |  |
| Data vencida | Linha fica destacada em vermelho. |  |  |
| Resolver pendencia | Status muda e historico registra. |  |  |

## Faturamento

| Teste | Esperado | OK | Observacao |
| --- | --- | --- | --- |
| Abrir tela | Aguardando faturamento e historico carregam. |  |  |
| Filtros historico | Filtra por origem, data, NF e texto. |  |  |
| Consultar faturado | Abre dados fiscais, transportadora, dimensoes e NF. |  |  |
| NF | Permite visualizar ou baixar NF quando houver arquivo. |  |  |
| Recolher historico | Lista historica recolhe/expande. |  |  |

## Aguardando Carregamento

| Teste | Esperado | OK | Observacao |
| --- | --- | --- | --- |
| Abrir tela | Lista carregada com transportadora e NF. |  |  |
| Filtrar | Filtra por pedido, NF ou transportadora. |  |  |
| Baixar NF | Botao baixar aparece na coluna Arquivo NF. |  |  |
| Carregado | Acao fica na coluna Acoes. |  |  |

## Dashboard

| Teste | Esperado | OK | Observacao |
| --- | --- | --- | --- |
| Abrir tela | Cards e graficos carregam. |  |  |
| Ano | Segmentacao por ano altera todos os graficos. |  |  |
| Metas | Linha/meta aparece nos graficos. |  |  |
| Tabelas inferiores | Maquinas liberadas por status e liberacao por mes aparecem abaixo dos graficos. |  |  |
| Itens comprados | Graficos consideram apenas itens de producao onde aplicavel. |  |  |

## Produtos / Previsao

| Teste | Esperado | OK | Observacao |
| --- | --- | --- | --- |
| Abrir tela | Tabelas, graficos e analise S&OP carregam. |  |  |
| Filtrar previsao | Filtros por linha/capacidade funcionam. |  |  |
| Ordenar | Classificacao por coluna funciona. |  |  |
| Previsao | Valores fazem sentido para linha/capacidade conhecida. |  |  |

## Terceiros

| Teste | Esperado | OK | Observacao |
| --- | --- | --- | --- |
| Abrir tela | Tabela de remessas carrega. |  |  |
| Nova remessa | Formulario abre com romaneio, pedido vinculado e nome cliente/fornecedor. |  |  |
| Pedido de compra | So libera faturamento apos informar PC. |  |  |
| Consulta | Abre dados do romaneio e NF quando faturado. |  |  |
| Excluir | Exclui apenas itens permitidos. |  |  |

## Qualidade

| Teste | Esperado | OK | Observacao |
| --- | --- | --- | --- |
| Alertas | Tabela abre com novo, editar, resolver e excluir. |  |  |
| Novo alerta | Formulario abre com cabecalho e fotos jeito errado/certo. |  |  |
| Pedido com SKU alerta | Pedidos mostra icone vermelho. |  |  |
| Cliente/linha/capacidade alerta | Pedidos mostra icone amarelo. |  |  |
| Ciencia | Usuario consegue dar ciencia e ocultar notificacao. |  |  |
| RNC / A3 | Tela carrega e salva estado no banco central. |  |  |

## Sequenciamento e APS

| Teste | Esperado | OK | Observacao |
| --- | --- | --- | --- |
| Sequenciamento | Lista pendencias por LM, serpentina, projetos. |  |  |
| Tempo estimado | Permite informar tempo por operacao. |  |  |
| Gantt | Cronograma mostra datas e horas. |  |  |
| Exportar/Imprimir | Relatorios saem corretamente. |  |  |
| APS | Operacoes, centros e operadores carregam. |  |  |
| Simulacao APS | Gantt e gargalos aparecem. |  |  |

## Cadastros

| Teste | Esperado | OK | Observacao |
| --- | --- | --- | --- |
| Status | Sequencia, tipo Producao/Processos auxiliares e desvio salvam. |  |  |
| Clientes | Cadastro e edicao funcionam. |  |  |
| Usuarios | Permissoes por modulo e edicao por aba funcionam. |  |  |
| Motivos PCP | Motivos por tipo carregam na tela PCP. |  |  |
| Backup | Criar backup e testar restauracao funcionam sem restaurar producao. |  |  |
| Saude | Banco, servidor, WebSocket e ultimo backup aparecem. |  |  |

## Criterio para aprovar React em producao

React so deve substituir o frontend oficial quando:

- todos os itens criticos acima estiverem aprovados;
- ao menos um usuario de cada area validar sua rotina;
- `npm run test:realtime` passar;
- `npm run rollback:build` passar;
- existir backup recente do Render;
- o responsavel aprovar o deploy React.
