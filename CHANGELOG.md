# 更新日志

## 2026-01-20

- 完善 Web 端 token 登录态持久化：启动恢复 localStorage 中的 token/user，并设置 Axios 默认 Authorization
- 增加 JWT 过期校验与自动清理：token 过期时清除缓存并回到未登录态
- 修复前端 Vite 编译失败：解决 AuthContext 中重复声明 helper 函数导致的 `Identifier has already been declared`
- 优化路由守卫：增加 loading 状态避免刷新/打开时误跳转到登录页
- 后端补齐 JWT 鉴权拦截：除登录/注册外接口统一校验 Authorization
- 新增认证接口：`GET /api/auth/me`
- 新增订单/统计接口：`GET /api/orders`、`GET /api/orders/cabinet/{cabinetId}`、`GET /api/orders/status/{status}`、`GET /api/stats`
- 新增快递柜接口：`PUT /api/cabinets/{id}`、`DELETE /api/cabinets/{id}`
- 统一异常返回：鉴权失败/参数校验异常统一包装为 `ApiResponse`
- 收紧 CORS 配置：按 `application.yml` 白名单来源放行
- 文档补齐接口状态与数据字典，并更新仪表盘改用 `GET /api/stats`

## 2026-01-18

- 修复新增快递柜未落库：后端补默认值与参数校验；前端补充字段并规范提交
- 前端 Axios 响应拦截器支持 ApiResponse 业务错误（code!=200 进入失败流程）
- 排查 Docker MySQL init.sql 挂载错误路径并修复（重建容器绑定 `server/database/init.sql`）
- 快递柜管理支持“查看仓门”弹窗，展示仓门详细信息与开仓操作

## 2026-01-16

- 调整工程目录结构：`web/`（管理端）、`app-user/`（用户端预留）、`app-server/`（快递员端预留）、`server/`（后端+数据库脚本）
- 同步更新一键启动脚本 `start.js` 以适配新目录路径

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
