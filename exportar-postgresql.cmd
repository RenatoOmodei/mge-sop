@echo off
setlocal
cd /d "%~dp0"

set "NODE_EXE=%~dp0runtime\node.exe"
if not exist "%NODE_EXE%" set "NODE_EXE=node"

"%NODE_EXE%" "%~dp0scripts\export-sqlite-to-postgres.js"
pause
