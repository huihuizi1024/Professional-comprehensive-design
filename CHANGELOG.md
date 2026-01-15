# 更新日志

## 2026-01-15

- 新增全平台一键启动脚本 `start.js`：自动启动 MySQL（Docker）+ 后端 + 前端
- 一键脚本增加实时进度输出、错误提醒、冒烟测试与最终端口/访问地址汇总
- 移除旧启动脚本：`start.sh`、`一键启动.bat`
- 完善项目文档：补充 API 文档、数据库表结构与核心方法说明

## 2026-01-14

- 新增跨平台启动脚本 start.sh（macOS/Linux）
- 优化 Windows 启动脚本 一键启动.bat（环境检查、自动安装前端依赖）
- 修复 MySQL 连接报错（allowPublicKeyRetrieval）
- 修复测试账号密码与 BCrypt 校验不一致问题（更新 init.sql 哈希）

