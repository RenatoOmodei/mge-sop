# Migracao de banco e seguranca

Este pacote continua funcionando com SQLite local em `data/erp.sqlite`. Para muitos usuarios acessando ao mesmo tempo, a recomendacao e migrar para PostgreSQL ou SQL Server Express.

## Recomendacao

- PostgreSQL: recomendado para servidor local do S&OP quando a prioridade for estabilidade, custo zero, backup simples e boa concorrencia.
- SQL Server Express: recomendado quando a empresa ja usa padrao Microsoft/SQL Server e possui rotina de administracao nessa plataforma.

## Passos de migracao recomendados

1. Fazer backup pelo menu `Cadastros > Sistema > Criar backup agora`.
2. Parar o servidor do S&OP.
3. Instalar PostgreSQL ou SQL Server Express no computador servidor.
4. Criar banco dedicado, usuario dedicado e senha forte.
5. Migrar as tabelas atuais do SQLite para o novo banco.
6. Instalar o driver Node.js adequado no pacote do sistema:
   - PostgreSQL: pacote `pg`.
   - SQL Server: pacote `mssql`.
7. Trocar a camada `src/database.js` por um adaptador do banco escolhido.
8. Validar login, pedidos, anexos de fotos, faturamento, PCP, dashboards e restauracao de backup em uma copia antes de liberar aos usuarios.

## Plano pratico para PostgreSQL

O pacote ja possui a camada PostgreSQL pronta para uso:

- `src\postgres-database.js`: adaptador PostgreSQL usado pelo servidor quando `DB_PROVIDER=postgres`.
- `postgresql\schema.sql`: cria a estrutura equivalente do banco no PostgreSQL.
- `scripts\export-sqlite-to-postgres.js`: exporta os dados do SQLite atual para SQL compativel com PostgreSQL.
- `migrar-para-postgresql.cmd`: cria/atualiza banco e usuario, aplica schema, exporta SQLite e importa dados.
- `iniciar-servidor-postgresql.cmd`: inicia o S&OP usando o arquivo `data\postgresql.env`.

Para fazer a virada:

1. Avise os usuarios e pare o servidor do S&OP.
2. Confirme que o PostgreSQL esta instalado e rodando no servidor.
3. Execute `migrar-para-postgresql.cmd`.
4. Informe a senha do usuario administrador do PostgreSQL, normalmente `postgres`.
5. Informe uma senha forte para o usuario do S&OP, normalmente `mge_sop_app`.
6. Aguarde a criacao do banco `mge_sop`, aplicacao do schema e importacao dos dados.
7. Inicie o sistema com `iniciar-servidor-postgresql.cmd`.
8. Acesse `Cadastros > Sistema` e confirme que o provedor do banco aparece como `postgres`.
9. Valide:

- total de pedidos;
- total de pendencias PCP abertas;
- total de usuarios;
- total de fotos;
- dashboards;
- faturamento/carregamento;
- historico de atividades.

O script cria um backup automatico do SQLite antes da importacao em `data\backups\pre-postgresql-*.sqlite` e grava a conexao em `data\postgresql.env`.

Tambem e possivel fazer a importacao manual:

```powershell
.\runtime\node.exe .\scripts\export-sqlite-to-postgres.js
psql -h 127.0.0.1 -p 5432 -U mge_sop_app -d mge_sop -f .\postgresql\schema.sql
psql -h 127.0.0.1 -p 5432 -U mge_sop_app -d mge_sop -f .\data\postgres-export\mge-sop-data.sql
```

Faca a virada em horario sem usuarios usando esta sequencia:

- backup final do SQLite;
- parar servidor;
- migrar dados finais;
- iniciar servidor conectado ao PostgreSQL;
- validar login e tela de saude;
- liberar o link aos usuarios.

O PostgreSQL deve ser o banco central. As estacoes continuam acessando apenas o endereco do servidor pelo navegador/PWA.

## HTTPS

O servidor ja aceita HTTPS quando estes caminhos forem configurados no ambiente antes de iniciar:

```powershell
$env:HTTPS_KEY_FILE='C:\Certificados\sop.key'
$env:HTTPS_CERT_FILE='C:\Certificados\sop.crt'
```

Sem esses arquivos o sistema sobe em HTTP, mantendo a instalacao atual funcionando.

## Senhas

As senhas dos usuarios sao salvas com hash e salt no banco. A senha original nao fica gravada em texto aberto.

## Servidor iniciando com o Windows

Execute o PowerShell como Administrador dentro da pasta do sistema e rode:

```powershell
.\instalar-servico-windows.ps1
```

Isso cria a tarefa `MGE-SOP-Servidor`, iniciando o servidor automaticamente junto com o Windows.

Para remover:

```powershell
.\remover-servico-windows.ps1
```

## Backup

O sistema cria backup diario automatico em `data\backups` e tambem permite backup/restauracao manual na tela administrativa `Cadastros > Sistema`.

Antes de restaurar, avise os usuarios para sair do sistema. Depois da restauracao, reinicie o servidor para garantir que todos trabalhem na mesma base restaurada.
