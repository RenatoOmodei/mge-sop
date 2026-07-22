# Backup local do PostgreSQL Render

Esta rotina baixa os dados do PostgreSQL do Render e cria um backup local em:

```text
data\render-backups
```

O backup gerado e um arquivo `.sql` com `TRUNCATE` e `INSERT` das tabelas principais do S&OP.

## Backup manual

Execute:

```powershell
.\backup-render-postgresql.cmd
```

Na primeira execucao, cole a **External Database URL** do Render. A conexao sera salva em:

```text
data\render-backup.env
```

Esse arquivo fica dentro de `data\`, que nao deve ser enviado para o GitHub.

## Agendar backup diario

Execute:

```powershell
.\instalar-backup-render-diario.cmd
```

Por padrao, a tarefa criada chama-se:

```text
MGE-SOP-Backup-Render
```

Ela roda diariamente as 18:00 e mantem backups dos ultimos 30 dias.

Para alterar o horario ou retencao:

```powershell
.\instalar-backup-render-diario.ps1 -DailyAt "20:00" -RetentionDays 60
```

## Remover agendamento

Execute:

```powershell
.\remover-backup-render-diario.cmd
```

## Observacoes

- Use sempre a **External Database URL** para backup a partir da sua maquina.
- A **Internal Database URL** so funciona entre servicos dentro do Render.
- No plano Free do Render, o PostgreSQL nao possui backup gerenciado. Esta rotina local reduz o risco, mas para producao critica o ideal e usar plano pago com PITR e manter copia externa.
