# S&OP

Sistema local S&OP para controle de pedidos de venda, com login, servidor HTTP e base central no servidor. Por padrao usa SQLite; para varios usuarios simultaneos, pode rodar com PostgreSQL.

## Arquitetura

- `src/server.js`: servidor HTTP, rotas de API, login e sessoes.
- `src/database.js`: camada de dados SQLite em arquivo local no servidor.
- `src/postgres-database.js`: camada PostgreSQL para uso multiusuario.
- `public/`: interface web protegida por login.
- `data/erp.sqlite`: banco SQLite criado automaticamente na primeira instalacao.
- `data/postgresql.env`: conexao PostgreSQL criada pelo script de migracao.

## Instalacao no servidor local

1. Instale o Node.js 22 LTS, ou superior, na máquina que será o servidor.
2. Copie esta pasta para o servidor.
3. Execute `instalar-windows.cmd`.
4. Execute `iniciar-servidor.cmd`.
5. Acesse no servidor: `http://localhost:3010`.

Tambem é possível iniciar pelo executável:

`ERP-Pedidos-Vendas.exe`

Ele inicia o servidor local e abre o navegador automaticamente.

Se a porta `3010` também estiver ocupada, o executável tenta iniciar na próxima porta livre, como `3011`.

Depois de atualizar o sistema, use `reiniciar-erp.cmd` para fechar qualquer servidor antigo ainda aberto e iniciar a versão nova.

Para virar o banco para PostgreSQL, execute `migrar-para-postgresql.cmd` com o servidor parado. Depois inicie com `iniciar-servidor-postgresql.cmd`.

Administradores veem o menu `Cadastros`, onde é possível incluir, editar e excluir status, clientes e usuários. No cadastro de usuários existe a permissão `Editar pedidos`, que libera criar pedidos, editar campos, excluir pedidos e anexar fotos.

No cadastro de status, cada status pode ser classificado como `Produção` ou `Processos auxiliares`. O card `Máquinas em produção` usa todos os pedidos cujo status está classificado como `Produção`.

Cada status tambem possui uma `Sequencia` numerica e um tipo de fluxo: `Fluxo normal` ou `Desvio`. Ao alterar status pelo botao `Status`, o sistema bloqueia saltos fora da sequencia normal. Para pular etapas, o usuario deve marcar desvio e informar o motivo; status cadastrados como `Desvio` podem ser usados como excecao controlada.

Login inicial:

- Usuário: `admin`
- Senha: `admin123`

## Acesso por outras maquinas

As estacoes da rede devem acessar o IP do servidor:

`http://IP-DO-SERVIDOR:3010`

Nesta maquina, o IP detectado durante o teste foi:

`http://192.168.114.187:3010`

Para descobrir o endereço correto, execute:

`mostrar-endereco-rede.cmd`

Se o Windows bloquear o acesso, execute o PowerShell como Administrador dentro desta pasta e rode:

`.\configurar-firewall.ps1`

## Campos do pedido de venda

O módulo de pedidos contém:

- Nº Pedido de venda
- Responsável comercial
- Cliente
- SKU
- Tipo do item
- OP
- Pedido de compra
- Capacidade (TR)
- Linha de produto
- Equipamento
- Tensão
- Quantidade
- Lead Time
- Data entrada
- Data entrega Original
- Data entrega Produção
- Dias em atraso
- Data finalização
- Status
- Observações

`Dias em atraso` é calculado automaticamente pela diferença entre o dia atual e a `Data entrega Original`. Se a data original ainda não venceu, o valor fica `0`.

A OP pode ficar em branco na abertura do pedido. Na tabela, o botão da coluna `OP` permite inserir ou alterar a OP posteriormente.

O campo `Tipo do item` diferencia `Produção` de `Peças compradas`. Para peças compradas, a coluna `Pedido compra` permite inserir posteriormente o número do pedido de compra.

Os cabeçalhos da tabela podem ser clicados para ordenar por data, cliente, SKU, OP, status e demais colunas. As colunas da tela de pedidos podem ser arrastadas pelo cabeçalho para mudar a ordem no navegador do usuário. A primeira coluna possui caixas de marcação para selecionar pedidos, e os botões `Editar` e `Status` ficam no cabeçalho da tela. O filtro `Situação` separa pedidos ativos, em produção, cancelados e concluídos.

O menu lateral tem ordem fixa para todos os usuários.

A tela de pedidos possui uma barra de rolagem horizontal no topo da tabela, sincronizada com a rolagem inferior e presa ao topo da tela durante a navegação vertical, para facilitar a navegação entre colunas.

Na tabela de pedidos, as linhas usam cores por situação: azul escuro para itens em status de produção, amarelo para pedidos com pendência PCP aberta, cinza para itens fora de produção e verde para itens com data de entrega de produção preenchida aguardando liberação para faturamento.

O botão `Editar` abre o pedido marcado quando há exatamente um item selecionado. O botão `Status` altera o status de todos os pedidos marcados.

Quando o status do pedido estiver como `Producao concluida`, a linha mostra o botao `Liberar fat.`. Esse botao envia o item para a aba `Faturamento`.

Na aba `Faturamento`, o financeiro informa altura, largura, comprimento, peso e volume da maquina. Ao clicar em `Faturado`, o item sai do faturamento e passa para `Aguardando carregamento`.

Na aba `Aguardando carregamento`, o responsavel clica em `Carregado`. O pedido fica como `Concluido` e a movimentacao fica registrada no historico.

Itens carregados e seus dimensionais continuam salvos no pedido original, na tabela `sales_orders` do banco central, com etapa `billing_stage = loaded` e campos de altura, largura, comprimento, peso liquido, peso bruto e volume. Ao marcar como carregado, os dimensionais tambem sao registrados nas observacoes do pedido para manter o historico visivel.

Ao lado do status há um ícone de fotos. Todos os usuários logados podem visualizar as fotos das máquinas; somente usuários com permissão de editar pedidos podem anexar ou excluir fotos pelo formulário de edição do pedido.

O botão `Baixar atalho` gera um arquivo `Atalho-SOP.url` para salvar na área de trabalho dos usuários. O atalho abre o S&OP pelo endereço do servidor e acessa o mesmo banco central.

Na parte superior do módulo de pedidos há cards de resumo com:

- Quantidade de pedidos de venda
- Quantidade de equipamentos em pedidos de venda
- Lead time médio das entregas, calculado pelo histórico dos pedidos
- Quantidade de máquinas no status selecionado; sem filtro, considera status de produção

## Abas analíticas

- `Produtos`: tabela por código de produto com quantidade de pedidos, máquinas vendidas, lead time médio e intervalo médio entre pedidos.
- `Faturamento`: itens liberados para faturar, com cadastro dos dimensionais da maquina.
- `Aguardando carregamento`: itens faturados aguardando carregamento.
- `Relatórios`: histórico das atividades executadas no sistema, incluindo pedidos, status e clientes.
- `Dashboard`: gráficos com Plotly para máquinas vendidas por mês, máquinas finalizadas por mês, lead time mensal, pontualidade de entrega, média mensal de máquinas vendidas por ano e média mensal de itens produzidos por ano.

O sistema tenta carregar o Plotly pela internet. Se a estação estiver sem acesso externo, há um gráfico local simplificado para manter o dashboard visível.

Pontualidade de entrega = quantidade finalizada no prazo / quantidade finalizada, agrupada pelo mes da data de finalizacao. O prazo usa `Data entrega Original`.

## Observacoes importantes

- O banco fica centralizado na maquina servidora: `data/erp.sqlite` no modo SQLite ou PostgreSQL no modo multiusuario.
- As estacoes nao devem copiar o banco; elas apenas acessam o servidor pelo navegador.
- Para trocar a senha inicial ou criar novos acessos, use `Cadastros > Usuários` com login de administrador.
- Para recriar o executavel, execute `gerar-executavel.cmd`.

## Melhorias profissionais adicionadas

- A tela de pedidos usa paginacao no servidor para carregar melhor quando houver muitos registros.
- Alteracoes feitas por outros usuarios sao avisadas por WebSocket; a tela aberta atualiza os dados sem depender de F5 manual.
- A aba `Cadastros > Sistema` mostra saude do servidor, banco, sessoes, clientes em tempo real, ultimo backup e versao.
- O sistema cria backup diario automatico em `data\backups` e permite backup/restauracao manual pela tela administrativa.
- Logs tecnicos ficam em `data\logs\technical.log`.
- O S&OP possui manifesto PWA e service worker, permitindo instalar no celular pelo navegador quando acessado pela rede local.
- O cadastro de usuarios possui perfis claros: Administrador, Comercial, Producao, Financeiro, Consulta e Usuario personalizado.
- A marca visual foi ajustada para MGE no topo e no icone do sistema.

## Inicializacao automatica no Windows

Para iniciar o servidor automaticamente junto com o Windows, abra o PowerShell como Administrador nesta pasta e execute:

`.\instalar-servico-windows.ps1`

Ou execute `instalar-servico-windows.cmd`.

Para remover a inicializacao automatica:

`.\remover-servico-windows.ps1`

Ou execute `remover-servico-windows.cmd`.

## HTTPS e banco multiusuario

O servidor aceita HTTPS quando as variaveis `HTTPS_KEY_FILE` e `HTTPS_CERT_FILE` apontam para o certificado e chave.

Para migrar de SQLite para PostgreSQL, execute `migrar-para-postgresql.cmd` com o servidor parado. O script cria backup do SQLite, aplica `postgresql\schema.sql`, importa os dados e grava `data\postgresql.env`. Depois inicie o servidor com `iniciar-servidor-postgresql.cmd`.
