@echo off
setlocal
cd /d "%~dp0"

set "NODE_EXE=%~dp0runtime\node.exe"
if not exist "%NODE_EXE%" (
  where node >nul 2>nul
  if errorlevel 1 (
  echo Node.js nao encontrado.
  echo Instale o Node.js 22 LTS, ou superior, nesta maquina antes de continuar.
  pause
  exit /b 1
  )
  set "NODE_EXE=node"
)

"%NODE_EXE%" -e "process.exit(Number(process.versions.node.split('.')[0]) >= 22 ? 0 : 1)"
if errorlevel 1 (
  echo Esta aplicacao requer Node.js 22 ou superior.
  echo Versao atual:
  "%NODE_EXE%" -v
  pause
  exit /b 1
)

if not exist data mkdir data
set NODE_OPTIONS=--no-warnings=ExperimentalWarning
"%NODE_EXE%" src\server.js --init-only

echo.
echo Instalacao concluida.
echo Usuario inicial: admin
echo Senha inicial: admin123
echo.
echo Para iniciar o servidor, execute iniciar-servidor.cmd.
pause
