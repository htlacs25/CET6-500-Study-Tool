@echo off
chcp 65001 >nul
where node >nul 2>nul
if errorlevel 1 goto openpage
node "%~dp0app\scripts\sync-daily-content.mjs" >"%~dp0logs\last-launch-sync.json" 2>&1
:openpage
start "" "%~dp0六级学习工具.html"
