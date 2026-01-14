@echo off
chcp 65001 >nul
echo ========================================
echo   环境检查工具
echo ========================================
echo.

echo [1] 检查 Java...
java -version 2>&1 | findstr "version" >nul
if errorlevel 1 (
    echo    ❌ 未安装或未配置环境变量
) else (
    echo    ✅ 已安装
    java -version 2>&1 | findstr "version"
)
echo.

echo [2] 检查 Maven...
mvn -version >nul 2>&1
if errorlevel 1 (
    echo    ❌ 未安装或未配置环境变量
) else (
    echo    ✅ 已安装
    mvn -version | findstr "Apache Maven"
)
echo.

echo [3] 检查 Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo    ❌ 未安装或未配置环境变量
) else (
    echo    ✅ 已安装
    echo    版本: 
    node -v
)
echo.

echo [4] 检查 npm...
npm -v >nul 2>&1
if errorlevel 1 (
    echo    ❌ 未安装
) else (
    echo    ✅ 已安装
    echo    版本: 
    npm -v
)
echo.

echo [5] 检查 MySQL...
mysql --version >nul 2>&1
if errorlevel 1 (
    echo    ❌ 未安装或未配置环境变量
    echo    提示: 如果已安装MySQL但未配置环境变量，可以忽略此错误
) else (
    echo    ✅ 已安装
    mysql --version
)
echo.

echo ========================================
echo   检查完成
echo ========================================
echo.
echo 如果看到 ❌，请先安装对应的软件
echo 详细说明请查看"运行指南.md"
echo.
pause

