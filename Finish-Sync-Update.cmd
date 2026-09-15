@echo off
title Study Tool - GitHub Sync
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File "%~dp0finish-sync-update.ps1" %*
set "SYNC_FINISH_EXIT=%ERRORLEVEL%"
echo.
if not "%SYNC_FINISH_EXIT%"=="0" echo Sync failed. The error and log path are shown above.
pause
exit /b %SYNC_FINISH_EXIT%
