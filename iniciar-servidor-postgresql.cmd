@echo off
setlocal
cd /d "%~dp0"

set "ENV_FILE=%~dp0data\postgresql.env"
if not exist "%ENV_FILE%" (
  echo Arquivo de conexao PostgreSQL nao encontrado:
  echo %ENV_FILE%
  echo.
  echo Execute migrar-para-postgresql.cmd primeiro ou crie esse arquivo com:
  echo DB_PROVIDER=postgres
  echo DATABASE_URL=postgres://usuario:senha@127.0.0.1:5432/mge_sop
  pause
  exit /b 1
)

for /f "usebackq tokens=1* delims==" %%A in ("%ENV_FILE%") do (
  if not "%%A"=="" set "%%A=%%B"
)
set "DB_PROVIDER=postgres"

set "NODE_EXE=%~dp0runtime\node.exe"
if not exist "%NODE_EXE%" set "NODE_EXE=node"

set NODE_OPTIONS=--no-warnings=ExperimentalWarning
"%NODE_EXE%" src\server.js
pause
