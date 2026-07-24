@echo off
setlocal
cd /d "%~dp0"

if "%SOP_TEST_HOST%"=="" set "SOP_TEST_HOST=127.0.0.1"
if "%SOP_TEST_PORT%"=="" set "SOP_TEST_PORT=3010"
if "%SOP_TEST_USER%"=="" set "SOP_TEST_USER=admin"
if "%SOP_TEST_PASSWORD%"=="" set "SOP_TEST_PASSWORD=admin123"

echo.
echo Testando WebSocket do S^&OP em ws://%SOP_TEST_HOST%:%SOP_TEST_PORT%/api/realtime
echo Usuario: %SOP_TEST_USER%
echo.

node scripts\test-realtime-websocket.js
if errorlevel 1 (
  echo.
  echo Falha no teste de WebSocket.
  exit /b 1
)

echo.
echo WebSocket validado com sucesso.
