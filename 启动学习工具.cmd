@echo off
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0启动学习工具.ps1"
if errorlevel 1 (
  echo.
  echo 启动已停止：今天的课程没有通过检查，请先完成同步，避免打开重复或过期内容。
  pause
  exit /b 1
)
