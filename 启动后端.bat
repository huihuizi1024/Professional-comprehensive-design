@echo off
chcp 65001 >nul
echo ========================================
echo   快递柜系统 - 后端服务启动
echo ========================================
echo.

cd backend

echo 正在检查Maven...
mvn -version >nul 2>&1
if errorlevel 1 (
    echo [提示] 未找到全局Maven，尝试使用Maven Wrapper...
    if exist "mvnw.cmd" (
        echo 找到Maven Wrapper，使用它来启动...
        echo.
        echo 正在启动后端服务...
        echo 提示：后端服务将在 http://localhost:8080 启动
        echo 按 Ctrl+C 可以停止服务
        echo.
        call mvnw.cmd spring-boot:run
        goto :end
    ) else (
        echo [错误] 未找到Maven，请先安装Maven并配置环境变量
        echo 或者确保 mvnw.cmd 文件存在于backend目录中
        echo.
        echo 详细安装指南请查看：Maven安装配置指南.md
        pause
        exit /b 1
    )
)

echo 正在启动后端服务...
echo 提示：后端服务将在 http://localhost:8080 启动
echo 按 Ctrl+C 可以停止服务
echo.

mvn spring-boot:run

:end

pause

