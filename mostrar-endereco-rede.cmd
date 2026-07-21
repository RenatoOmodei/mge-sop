@echo off
setlocal
cd /d "%~dp0"

set PORTA=3010

echo.
echo Enderecos provaveis para acessar o ERP pela rede:
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ips = Get-CimInstance Win32_NetworkAdapterConfiguration | Where-Object { $_.IPEnabled } | ForEach-Object { $_.IPAddress } | Where-Object { $_ -match '^\d+\.\d+\.\d+\.\d+$' -and $_ -notlike '127.*' -and $_ -notlike '169.254.*' }; if (-not $ips) { Write-Host 'Nenhum IP de rede local encontrado.'; exit 0 }; foreach ($ip in $ips) { Write-Host ('http://' + $ip + ':%PORTA%') }"

echo.
echo Se nao abrir em outro computador/celular:
echo 1. Confirme que o ERP-Pedidos-Vendas.exe esta aberto no servidor.
echo 2. Confirme que todos estao na mesma rede/Wi-Fi.
echo 3. Execute configurar-firewall.ps1 como Administrador.
echo.
pause
