@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title 启动快递柜综合设计项目

set ROOT_DIR=%~dp0

echo.
echo 正在检查必需环境...
where mvn >nul 2>nul
if errorlevel 1 (
  echo 未找到 Maven 命令，请先安装 Maven 并配置环境变量。
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo 未找到 Node.js，请先安装 Node.js 并配置环境变量。
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo 未找到 npm，请确认 Node.js 安装完整。
  pause
  exit /b 1
)

echo.
echo 正在检查前端依赖...
if not exist "%ROOT_DIR%frontend\node_modules" (
  echo 未检测到 node_modules，正在为前端安装依赖，请稍候...
  cd /d "%ROOT_DIR%frontend"
  npm install
  if errorlevel 1 (
    echo npm install 执行失败，请检查网络或 npm 源配置。
    pause
    exit /b 1
  )
  cd /d "%ROOT_DIR%"
)

echo.
echo [1/2] 启动后端服务...
start "backend" cmd /k "cd /d %ROOT_DIR%backend && mvn spring-boot:run"

echo.
echo [2/2] 启动前端服务...
start "frontend" cmd /k "cd /d %ROOT_DIR%frontend && npm run dev"

echo.
echo 所有服務已啟動，如無自動打開瀏覽器，請手動訪問:
echo 前端: http://localhost:3000
echo 後端: http://localhost:8080/api
echo.
pause
