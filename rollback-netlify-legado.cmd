@echo off
setlocal

cd /d "%~dp0"

if "%SOP_BACKEND_URL%"=="" (
  if "%SOP_PRODUCTION_BACKEND_URL%"=="" (
    set "SOP_BACKEND_URL=https://mge-sop-api.onrender.com"
  ) else (
    set "SOP_BACKEND_URL=%SOP_PRODUCTION_BACKEND_URL%"
  )
)

set "SOP_ENV=production"

echo.
echo ============================================================
echo  ROLLBACK S^&OP - PUBLICAR FRONTEND LEGADO NO NETLIFY
echo ============================================================
echo Backend: %SOP_BACKEND_URL%
if "%ROLLBACK_DRY_RUN%"=="1" echo Modo teste: nao vai publicar no Netlify.
echo.
echo Este comando vai publicar a versao atual/legada em producao.
echo Use apenas se a versao React apresentar problema em producao.
echo.
choice /C SN /M "Continuar com o rollback para producao"
if errorlevel 2 (
  echo Rollback cancelado.
  exit /b 1
)

call npm run rollback:build
if errorlevel 1 (
  echo.
  echo Falha ao gerar ou validar pacote legado.
  exit /b 1
)

if "%ROLLBACK_DRY_RUN%"=="1" (
  echo.
  echo Teste concluido. Pacote legado gerado e validado, sem deploy.
  exit /b 0
)

call netlify deploy --prod --dir dist-netlify
if errorlevel 1 (
  echo.
  echo Falha no deploy do rollback no Netlify.
  exit /b 1
)

echo.
echo Rollback publicado no Netlify.
echo Abra o sistema e valide login, pedidos, dashboard e faturamento.
