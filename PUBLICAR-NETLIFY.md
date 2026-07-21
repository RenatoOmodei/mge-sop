# Publicar S&OP no Netlify

Este projeto esta preparado para publicar o frontend no Netlify e usar um backend/API separado.

## Pre-requisitos

1. Backend do S&OP publicado em uma URL HTTPS, por exemplo:

   `https://sop-api.suaempresa.com`

2. Banco PostgreSQL online configurado no backend.
3. Conta Netlify com permissao para criar/publicar site.
4. Netlify CLI instalado na maquina.

Para hospedar o backend, siga primeiro:

```text
HOSPEDAR-BACKEND.md
```

## Instalar Netlify CLI

Abra o PowerShell fora do Codex, preferencialmente como Administrador:

```powershell
npm install -g netlify-cli
netlify login
```

## Gerar build apontando para o backend

No PowerShell:

```powershell
cd "C:\Users\Planejamento\Documents\Codex\2026-07-06\c\outputs\[MGE] S&OP"
$env:SOP_BACKEND_URL="https://URL-DO-BACKEND"
npm run build:netlify
```

O build sera criado em:

```text
dist-netlify
```

## Publicar no Netlify

Para criar/publicar o site:

```powershell
netlify deploy --prod --dir dist-netlify
```

Na primeira publicacao, o Netlify CLI pedira para escolher o time e criar ou vincular um site.

## Observacao importante

Sem `SOP_BACKEND_URL`, o Netlify publica a tela, mas login e dados nao funcionam, porque a API do S&OP fica no backend.
