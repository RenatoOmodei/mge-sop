# Hospedar backend/API do S&OP

Este guia publica o backend Node do S&OP em uma URL HTTPS real e usa PostgreSQL online.

## 1. Publicar o codigo em um repositorio

Render precisa acessar o codigo por um repositorio Git.

Opcoes comuns:

- GitHub
- GitLab
- Bitbucket

Suba a pasta do sistema como projeto/repo:

```text
C:\Users\Planejamento\Documents\Codex\2026-07-06\c\outputs\[MGE] S&OP
```

## 2. Criar backend no Render

1. Acesse o Render.
2. Crie um Blueprint usando o repositorio do S&OP.
3. O Render vai ler o arquivo:

```text
render.yaml
```

4. Informe a senha inicial do administrador quando o Render pedir:

```text
ADMIN_PASSWORD
```

5. Aguarde o deploy do serviço `mge-sop-api`.

Ao finalizar, o Render vai mostrar uma URL semelhante a:

```text
https://mge-sop-api.onrender.com
```

Essa sera a URL real do backend.

## 3. Rebuild do Netlify apontando para o backend

No PowerShell:

```powershell
Set-Location -LiteralPath 'C:\Users\Planejamento\Documents\Codex\2026-07-06\c\outputs\[MGE] S&OP'
$env:SOP_BACKEND_URL="https://mge-sop-api.onrender.com"
npm run build:netlify
Get-Content .\dist-netlify\_redirects
netlify deploy --prod --dir dist-netlify
```

O arquivo `_redirects` precisa ficar parecido com:

```text
/api/* https://mge-sop-api.onrender.com/api/:splat 200
/* /index.html 200
```

## 4. Observacao sobre plano gratis

O `render.yaml` esta configurado com `plan: free` para evitar cobranca automatica.

Para producao real 24h, altere no painel do Render:

- Web service: plano pago, como Starter.
- PostgreSQL: plano pago, como Basic.

O plano gratis e util para teste, mas pode hibernar e o PostgreSQL gratis pode expirar.

