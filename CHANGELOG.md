# 更新日志

## 2026-01-14

- 新增跨平台启动脚本 start.sh（macOS/Linux）
- 优化 Windows 启动脚本 一键启动.bat（环境检查、自动安装前端依赖）
- 修复 MySQL 连接报错（allowPublicKeyRetrieval）
- 修复测试账号密码与 BCrypt 校验不一致问题（更新 init.sql 哈希）

## 2026-01-15

- 新增全平台一键启动脚本 `start.js`：自动启动 MySQL（Docker）+ 后端 + 前端
- 一键脚本增加实时进度输出、错误提醒、冒烟测试与最终端口/访问地址汇总
- 移除旧启动脚本：`start.sh`、`一键启动.bat`
- 完善项目文档：补充 API 文档、数据库表结构与核心方法说明

## 2026-01-16

- 调整工程目录结构：`web/`（管理端）、`app-user/`（用户端预留）、`app-server/`（快递员端预留）、`server/`（后端+数据库脚本）
- 同步更新一键启动脚本 `start.js` 以适配新目录路径

## 2026-01-17

- **前端架构修复**：
  - 修复目录重构后 `web/src` 下组件与页面的相对路径引用错误。
  - 调整 `vite.config.js` 配置，优化构建输出路径。
- **接口连通性验证**：
  - 配置后端 `WebMvcConfig` 以允许跨域请求（CORS），解决前端 `Axios` 请求被拦截问题。
  - 使用 Postman 测试 Web 端核心接口，确保 `ApiResponse` 结构符合预期。
- **文档建设**：
  - 整理前后端接口文档，明确 User/Cabinet 实体字段定义与数据类型。

## 2026-01-18

- 修复新增快递柜未落库：后端补默认值与参数校验；前端补充字段并规范提交
- 前端 Axios 响应拦截器支持 ApiResponse 业务错误（code!=200 进入失败流程）
- 排查 Docker MySQL init.sql 挂载错误路径并修复（重建容器绑定 `server/database/init.sql`）
- 快递柜管理支持“查看仓门”弹窗，展示仓门详细信息与开仓操作

## 2026-01-19

- **安全认证模块设计**：
  - 引入 `jjwt` 库，设计基于 JWT (JSON Web Token) 的无状态身份认证流程。
  - 集成 `BCryptPasswordEncoder` 到 `AuthService`，实现用户密码的加盐哈希存储与校验。
- **权限控制规划**：
  - 规划 `JwtAuthenticationFilter` 拦截器，定义公共接口（如登录/注册）与受保护接口的访问策略。

## 2026-01-20

- 完善 Web 端 token 登录态持久化：启动恢复 localStorage 中的 token/user，并设置 Axios 默认 Authorization
- 增加 JWT 过期校验与自动清理：token 过期时清除缓存并回到未登录态
- 修复前端 Vite 编译失败：解决 AuthContext 中重复声明 helper 函数导致的 `Identifier has already been declared`
- 优化路由守卫：增加 loading 状态避免刷新/打开时误跳转到登录页
- 后端补齐 JWT 鉴权拦截：除登录/注册外接口统一校验 Authorization
- 新增认证接口：`GET /api/auth/me`
- 新增订单/统计接口：`GET /api/orders`、`GET /api/orders/cabinet/{cabinetId}`、`GET /api/orders/status/{status}`、`GET /api/stats`
- 新增用户/快递员管理接口（管理员）：`GET /api/users/admin/list`、`POST /api/users/admin`、`PUT /api/users/admin/{id}`
- 统计接口增强：`GET /api/stats` 增加禁用柜组、仓门故障、在库仓门、总日用电量等指标
- Web 端新增“用户与快递员管理”页面，并在管理员菜单中展示入口
- 公网部署配置支持环境变量覆盖：DB/JWT/CORS 等敏感配置不再依赖写死默认值
- 新增快递柜接口：`PUT /api/cabinets/{id}`、`DELETE /api/cabinets/{id}`
- 新增地理位置接口：`GET /api/cabinets/nearby`（附近搜索）、`GET /api/cabinets/sort-by-distance`（距离排序），支持经纬度计算
- 新增取件码核验接口：`POST /api/orders/verify-pick-code`
- 数据库变更：`cabinets` 表新增 `latitude` 和 `longitude` 字段
- 统一异常返回：鉴权失败/参数校验异常统一包装为 `ApiResponse`
- 收紧 CORS 配置：按 `application.yml` 白名单来源放行
- 文档补齐接口状态与数据字典，并更新仪表盘改用 `GET /api/stats`

## 2026-01-21

- **用户管理模块开发**：
  - 前端开发 `UserManagement.jsx`，集成 Ant Design `Table` 组件展示用户列表。
  - 实现基于角色的筛选功能（用户/快递员/管理员）与分页查询。
- **后端权限调试**：
  - 调试 `UserService` 中的管理员权限校验逻辑，确保非管理员无法操作用户数据。

## 2026-01-22

- **Web UI/UX 优化**：
  - 在 `AuthContext` 中引入全局 `loading` 状态，解决页面刷新时因 Token 校验延迟导致的闪烁问题。
  - 优化 Web 端在移动设备上的响应式布局，修复表格溢出问题。
- **小程序登录对接**：
  - 在小程序 `app.js` 中封装 `wx.login`，实现与后端 `AuthService.login` 的 Token 交换逻辑。

## 2026-01-23

- **快递员功能开发**：
  - 开发 `pages/deliver/deliver.wxml` 页面，实现快递员投递流程。
  - 集成 `wx.scanCode` API 模拟扫码开柜，调用后端 `CabinetService.openCompartment` 接口。
- **后端单元测试**：
  - 编写 `CabinetServiceTest`，覆盖“开柜”、“占用状态更新”等核心业务逻辑。

## 2026-01-24

- **功能探索与数据库调整**：
  - 尝试在 `CabinetService` 中实现基于物品体积的智能推荐柜门算法（因复杂度过高暂时搁置）。
  - 修改数据库 `compartments` 表，预留 `size_type` 字段（SMALL/MEDIUM/LARGE），为未来功能做准备。
- **日志优化**：
  - 优化全局异常处理器 `GlobalExceptionHandler`，增加详细的错误堆栈与请求参数日志。

## 2026-01-25

- **性能调优**：
  - 数据库优化：为 `orders` 表的高频查询字段 `status` 和 `cabinet_id` 添加索引，提升查询效率。
  - 代码优化：重构 `StatsService` 中的统计 SQL，将多次单表查询合并为聚合查询。
- **代码清理**：
  - 移除前端项目中冗余的 `console.log` 调试语句，规范代码风格。

## 2026-01-26

- **小程序体验优化**：
  - 完善 `pages/orders/orders` 页面，增加顶部 Tab 栏切换订单状态（待取件/已完成）。
  - 修复自定义 TabBar (`custom-tab-bar`) 在不同页面间切换时图标选中状态不更新的问题。
- **部署文档**：
  - 编写项目部署文档初稿，记录 Docker 环境搭建与 Nginx 反向代理配置要点。

## 2026-01-27

- **全链路测试**：
  - 执行集成测试：模拟完整流程（用户注册 -> 快递员投递 -> 用户收到通知 -> 用户取件）。
- **问题发现**：
  - 发现快递员端“待取件”列表中，`senderName` 等字段显示为 `NULL`，定位到后端 DTO 映射问题。
- **版本规划**：
  - 记录现有 Bug 与未完成特性，决定进行一次代码回退与重构，以稳固核心功能。

## 2026-01-28

- **核心架构调整**：
  - 回退代码至稳定版本（Commit: `239938e4`），确保“Web端 + 用户端小程序 + 快递员端小程序”三端核心功能互通。
  - 清理冗余代码与不可用的实验性功能（如未完成的尺寸推荐逻辑），保证系统稳定性。

- **缺陷修复**：
  - **启动脚本修复**：修正 `start.js` 中数据库连接密码与 `application.yml` 不一致的问题（统一为 `123456`），解决后端无法启动的故障。
  - **快递员小程序修复**：解决“待取件订单”列表中发件人信息显示 `null` 的问题。针对快递投递的订单（OrderType=0），改为优先显示收件人信息，优化信息展示逻辑。

- **文档更新**：
  - 重构 `README.md`：
    - 更新项目结构说明，明确标识 `user_xcx`（用户端）和 `app_server`（快递员端）目录。
    - 补充最新的技术栈说明（Spring Boot 2.7 + React 18 + 微信小程序原生）。
    - 更新一键启动与手动启动的详细步骤，修正数据库默认密码说明。
  - 更新 `CHANGELOG.md` 记录本次维护内容。
