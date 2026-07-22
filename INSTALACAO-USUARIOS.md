# Instalacao nas maquinas dos usuarios

O S&OP esta publicado na internet pelo Netlify e grava os dados no PostgreSQL do Render.

Para as maquinas dos usuarios, nao instale o servidor local nem o banco. O recomendado e criar um atalho para o link oficial:

```text
https://symphonious-quokka-707211.netlify.app
```

## Instalador simples

Envie a pasta:

```text
instalador-usuarios
```

Na maquina do usuario, executar:

```text
Instalar S&OP MGE.cmd
```

Esse instalador cria atalhos em:

- Area de Trabalho
- Menu Iniciar > MGE

O atalho abre o S&OP em modo aplicativo pelo Edge ou Chrome quando disponivel.

## Onde os dados ficam salvos

Tudo que o usuario alterar usando esse atalho sera salvo no banco online:

```text
PostgreSQL do Render
```

O usuario nao grava dados na propria maquina.

## Remocao

Para remover os atalhos, executar:

```text
Remover S&OP MGE.cmd
```

## Sobre arquivo .exe

E possivel empacotar esse instalador em `.exe`, mas um executavel sem assinatura digital pode ser bloqueado pelo Windows SmartScreen. Para distribuicao profissional, o ideal e:

- criar um instalador assinado digitalmente;
- ou usar Intune/GPO/TI para distribuir o atalho;
- ou orientar o usuario a instalar como PWA pelo navegador.
