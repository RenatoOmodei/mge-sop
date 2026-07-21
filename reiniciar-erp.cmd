@echo off
setlocal
cd /d "%~dp0"

echo Fechando instancias antigas do ERP nas portas 3010 a 3050...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ports = 3010..3050; foreach ($port in $ports) { $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue; foreach ($conn in $connections) { $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue; if ($proc -and ($proc.ProcessName -eq 'node' -or $proc.ProcessName -eq 'ERP-Pedidos-Vendas')) { Write-Host ('Encerrando processo ' + $proc.ProcessName + ' na porta ' + $port); Stop-Process -Id $proc.Id -Force } } }"

echo.
echo Abrindo S&OP atualizado pelo servidor local...
set "NODE_EXE=%~dp0runtime\node.exe"
if not exist "%NODE_EXE%" set "NODE_EXE=node"
set NODE_OPTIONS=--no-warnings=ExperimentalWarning
start "S&OP Servidor" /D "%~dp0" "%NODE_EXE%" "src\server.js"

echo.
echo Se o navegador nao abrir automaticamente, acesse:
echo http://localhost:3010
echo.
pause
