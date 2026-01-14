@echo off
setlocal enabledelayedexpansion
title 启动快递柜综合设计项目

set ROOT_DIR=%~dp0

echo.
echo 正在检查必需环境...
where mvn >nul 2>nul
if errorlevel 1 (
  echo 未找到 Maven 命令，請先安裝 Maven 並配置環境變量。
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo 未找到 Node.js，請先安裝 Node.js 並配置環境變量。
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo 未找到 npm，請確認 Node.js 安装完整。
  pause
  exit /b 1
)

echo.
echo 正在检查前端依賴...
if not exist "%ROOT_DIR%frontend\node_modules" (
  echo 未檢測到 node_modules，正在為前端安裝依賴，請稍候...
  cd /d "%ROOT_DIR%frontend"
  npm install
  if errorlevel 1 (
    echo npm install 執行失敗，請檢查網絡或npm源配置。
    pause
    exit /b 1
  )
  cd /d "%ROOT_DIR%"
)

echo.
echo [1/2] 啟動後端服務...
start "backend" cmd /k "cd /d %ROOT_DIR%backend && mvn spring-boot:run"

echo.
echo [2/2] 啟動前端服務...
start "frontend" cmd /k "cd /d %ROOT_DIR%frontend && npm run dev"

echo.
echo 所有服務已啟動，如無自動打開瀏覽器，請手動訪問:
echo 前端: http://localhost:5173
echo 後端: http://localhost:8080/api
echo.
pause
