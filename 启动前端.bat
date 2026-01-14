@echo off
chcp 65001 >nul
echo ========================================
echo   快递柜系统 - 前端服务启动
echo ========================================
echo.

cd frontend

echo 正在检查Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

echo 正在检查依赖...
if not exist "node_modules" (
    echo 首次运行，正在安装依赖...
    echo 这可能需要几分钟时间，请耐心等待...
    call npm install --registry=https://registry.npmmirror.com
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
)

echo 正在启动前端服务...
echo 提示：前端应用将在 http://localhost:3000 启动
echo 按 Ctrl+C 可以停止服务
echo.

call npm run dev

pause

