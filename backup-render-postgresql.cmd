@echo off
setlocal
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0backup-render-postgresql.ps1" -SaveConnection
echo.
pause
