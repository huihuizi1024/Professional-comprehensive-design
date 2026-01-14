@echo off
chcp 65001 >nul
echo ========================================
echo   测试数据库连接
echo ========================================
echo.

echo [1] 检查MySQL服务状态...
sc query MySQL80 >nul 2>&1
if errorlevel 1 (
    sc query MySQL >nul 2>&1
    if errorlevel 1 (
        echo    ⚠️  未找到MySQL服务（可能服务名不同）
    ) else (
        echo    ✅ 找到MySQL服务
        sc query MySQL | findstr "RUNNING" >nul
        if errorlevel 1 (
            echo    ⚠️  MySQL服务未运行
        ) else (
            echo    ✅ MySQL服务正在运行
        )
    )
) else (
    echo    ✅ 找到MySQL服务
    sc query MySQL80 | findstr "RUNNING" >nul
    if errorlevel 1 (
        echo    ⚠️  MySQL服务未运行
        echo    提示：请启动MySQL服务
    ) else (
        echo    ✅ MySQL服务正在运行
    )
)
echo.

echo [2] 测试数据库连接...
echo    请输入MySQL root密码：
mysql -u root -p -e "USE express_cabinet; SHOW TABLES;" 2>nul
if errorlevel 1 (
    echo    ❌ 无法连接到数据库
    echo.
    echo    可能的原因：
    echo    1. MySQL服务未启动
    echo    2. 数据库 express_cabinet 未创建
    echo    3. 用户名或密码错误
    echo    4. MySQL未配置环境变量
    echo.
    echo    请检查：
    echo    - MySQL服务是否启动
    echo    - 是否已创建数据库（执行 database/init.sql）
    echo    - application.yml 中的数据库配置是否正确
) else (
    echo    ✅ 数据库连接成功！
    echo    ✅ 数据库 express_cabinet 存在
    echo    ✅ 表结构已创建
)
echo.

echo ========================================
echo   检查完成
echo ========================================
pause

