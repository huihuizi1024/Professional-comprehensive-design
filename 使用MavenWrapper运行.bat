@echo off
chcp 65001 >nul
echo ========================================
echo   使用 Maven Wrapper 启动后端
echo   （无需全局安装Maven）
echo ========================================
echo.

cd backend

if not exist "mvnw.cmd" (
    echo [错误] 未找到 mvnw.cmd 文件
    echo 请确保在 backend 目录中运行此脚本
    pause
    exit /b 1
)

echo 正在使用 Maven Wrapper 启动后端服务...
echo 提示：首次运行会自动下载Maven（约5MB）
echo 后端服务将在 http://localhost:8080 启动
echo 按 Ctrl+C 可以停止服务
echo.

call mvnw.cmd spring-boot:run

pause

