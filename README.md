# 快递柜综合应用系统

## 项目简介

这是一个前后端分离的快递柜综合应用管理系统，包含Web管理平台、快递员端和普通用户端功能。

## 技术栈

### 后端
- Spring Boot 2.7.14
- Spring Data JPA
- MySQL 8.0
- JWT认证
- Maven

### 前端
- React 18
- Vite
- Ant Design 5
- React Router
- Axios

## 项目结构

```
源代码/
├── web/                    # Web 管理端（React + Vite）
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   ├── components/    # 通用组件
│   │   ├── context/       # 上下文
│   │   ├── utils/         # 工具函数
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── app-user/               # 用户端小程序（预留目录）
├── app-server/             # 快递员端小程序（预留目录）
└── server/                 # 服务端（共享后端 + 数据库脚本）
    ├── backend/            # Spring Boot 后端
    │   ├── src/main/java/com/express/cabinet/...
    │   ├── src/main/resources/application.yml
    │   └── pom.xml
    └── database/           # MySQL 初始化脚本
        └── init.sql
```

## 快速开始

### 环境要求

- JDK 1.8+（建议 8/11/17 之一）
- Node.js 16+
- Docker Desktop（用于启动 MySQL 8.0）

说明：
- 后端使用 Maven Wrapper 启动，不强依赖本机 Maven
- 配置文件默认连接本机 `localhost:3306/express_cabinet`，脚本会在每台电脑上自动创建并初始化匹配的 MySQL

### 数据库配置

推荐使用 Docker（无需本机安装 MySQL），会自动执行初始化脚本。

```bash
cd Professional-comprehensive-design
docker run --name express-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -p 3306:3306 \
  -v "$(pwd)/server/database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro" \
  -d mysql:8.0
```

验证数据库与表是否创建成功：

```bash
docker exec express-mysql mysql -uroot -proot -e "SHOW DATABASES; USE express_cabinet; SHOW TABLES;"
```

### 一键启动（全平台推荐）

在项目根目录执行：

```bash
node start.js
```

它会自动完成：
- 检查 Docker 环境
- 创建/启动 MySQL 容器 `express-mysql`，并执行 `server/database/init.sql` 初始化库表与测试数据
- 启动后端（Spring Boot）与前端（Vite）
- 运行冒烟测试（登录 + 调用核心接口）
- 最后输出所有服务的端口与访问地址

### 手动启动（可选）

#### 1) 启动 MySQL（Docker）

```bash
docker run --name express-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -p 3306:3306 \
  -v "$(pwd)/server/database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro" \
  -d mysql:8.0
```

#### 2) 启动后端

```bash
cd server/backend
mvn spring-boot:run
```

后端服务将在 `http://localhost:8080` 启动。

#### 3) 启动前端

```bash
cd web
npm install
npm run dev
```

前端应用将在 `http://localhost:3000` 启动。

## 配置说明

### 数据库连接配置

后端数据库连接配置文件位置：
- `server/backend/src/main/resources/application.yml`

默认配置：
- 主机：`localhost`
- 端口：`3306`
- 数据库：`express_cabinet`
- 用户名/密码：`root/root`

如果你希望“配置文件不改、每台电脑自动匹配”，就保持上面配置不动，并使用 `node start.js` 启动即可。

### 前端代理配置

前端开发环境通过 Vite Proxy 将 `/api` 转发到后端：
- `web/vite.config.js` 中的 `server.proxy['/api']`

## 功能模块

### 1. 用户认证
- 用户注册
- 用户登录
- JWT Token认证

### 2. 快递柜管理
- 快递柜列表查看
- 快递柜新增/编辑
- 快递柜状态管理（启用/禁用）
- 仓门管理
- 远程开仓功能

### 3. 订单管理
- 订单列表查看
- 订单搜索（按手机号）
- 订单状态查看
- 取件码管理

### 4. Web管理平台
- 仪表盘统计
- 快递柜管理
- 订单管理
- 用户管理

## 测试账号

系统初始化时会创建以下测试账号：

| 用户名 | 密码 | 类型 | 说明 |
|--------|------|------|------|
| admin | 123456 | 普通用户 | 管理员账号 |
| courier1 | 123456 | 快递员 | 快递员账号 |
| user1 | 123456 | 普通用户 | 普通用户账号 |

## 文档

- API 接口文档：[`API.md`](./API.md)
- 数据库文档（初始化、连接、表结构）：[`DATABASE.md`](./DATABASE.md)
- 个人工作内容记录：[`WORKLOG.md`](./WORKLOG.md)

## 核心代码与方法说明

### 后端（Spring Boot）

#### 1) 启动入口

- 启动类：`server/backend/src/main/java/com/express/cabinet/ExpressCabinetApplication.java`
- 说明：启动 Spring Boot 应用，加载 `application.yml` 中的数据源、端口、JWT 等配置

#### 2) 统一返回结构

- `server/backend/src/main/java/com/express/cabinet/dto/ApiResponse.java`
- 作用：对所有接口返回进行统一封装
  - 成功：`ApiResponse.success(data)` 或 `ApiResponse.success(message, data)`
  - 失败：`ApiResponse.error(message)`（当前默认业务错误统一返回 code=500，HTTP 状态码仍可能为 200，建议客户端以 code 判断业务成功/失败）

#### 3) 认证模块

- 控制器：`server/backend/src/main/java/com/express/cabinet/controller/AuthController.java`
  - `POST /api/auth/register`：调用 `AuthService.register` 完成注册并返回 token
  - `POST /api/auth/login`：调用 `AuthService.login` 完成登录并返回 token
- 服务：`server/backend/src/main/java/com/express/cabinet/service/AuthService.java`
  - `register(RegisterRequest request)`
    - 校验用户名/手机号是否存在（Repository 的 existsByXxx）
    - 使用 BCrypt 对密码加密后入库
    - 生成 JWT 并返回 `{ userId, username, userType, token }`
  - `login(LoginRequest request)`
    - 通过用户名查询用户
    - 使用 BCrypt 校验密码
    - 校验用户状态（status=0 禁用）
    - 生成 JWT 并返回 `{ userId, username, userType, token }`
- JWT 工具：`server/backend/src/main/java/com/express/cabinet/util/JwtUtil.java`
  - `generateToken(userId, username)`：生成 HS512 签名的 token（claims 包含 userId/username）
  - `parseToken(token)`：解析 token 得到 claims（未做统一鉴权拦截时，主要用于扩展）
  - `getUserIdFromToken(token)`：从 token 中取出 userId
  - `isTokenExpired(token)`：判断 token 是否过期（解析异常视为过期）

#### 4) 快递柜模块

- 控制器：`server/backend/src/main/java/com/express/cabinet/controller/CabinetController.java`
  - `GET /api/cabinets`：查询快递柜列表（JPA findAll）
  - `GET /api/cabinets/{id}`：按 ID 查询（不存在抛异常，返回 code=500）
  - `GET /api/cabinets/code/{cabinetCode}`：按编号查询
  - `GET /api/cabinets/{cabinetId}/compartments`：查询该柜的全部仓门
  - `GET /api/cabinets/{cabinetId}/compartments/available`：查询可用仓门（status=1 且 hasItem=0）
  - `POST /api/cabinets`：创建快递柜，并按 totalCompartments 自动生成仓门记录
  - `PUT /api/cabinets/{id}/status`：启用/禁用快递柜
  - `PUT /api/cabinets/compartments/{compartmentId}/status`：设置仓门状态（故障/正常）
  - `POST /api/cabinets/compartments/{compartmentId}/open`：模拟开仓（仅校验仓门状态）
- 服务：`server/backend/src/main/java/com/express/cabinet/service/CabinetService.java`
  - `createCabinet(Cabinet cabinet)`
    - 检查 cabinetCode 唯一性
    - 保存快递柜
    - 依据 totalCompartments 创建 N 个仓门（1..N），并初始化 status=1、hasItem=0
  - `getAvailableCompartments(cabinetId)`
    - 先按 cabinetId + status=1 查询
    - 再用 stream 过滤 hasItem=0
  - `openCompartment(compartmentId)`
    - 仓门不存在：抛异常
    - 仓门 status=0：抛异常
    - 其余情况：视为“模拟开仓成功”（真实硬件可在这里对接）

#### 5) 订单模块

- 控制器：`server/backend/src/main/java/com/express/cabinet/controller/ExpressOrderController.java`
  - `GET /api/orders/phone/{phone}`：按收件人手机号查订单
  - `GET /api/orders/user/{userId}`：按收件人用户 ID 查订单
  - `GET /api/orders/pick-code/{pickCode}`：按取件码查订单
  - `POST /api/orders`：创建订单（后端生成 pickCode，且占用仓门）
  - `POST /api/orders/pick-up`：取件（更新订单状态，释放仓门）
- 服务：`server/backend/src/main/java/com/express/cabinet/service/ExpressOrderService.java`
  - `createOrder(ExpressOrder order)`
    - 校验仓门存在、status=1、hasItem=0
    - 生成 6 位数字取件码（避免重复）
    - 设置订单状态 status=0、放入时间、过期时间（默认 +3 天）
    - 保存订单后将仓门 hasItem 置为 1
  - `pickUpOrder(pickCode)`
    - 校验取件码存在
    - 已取件/已超时：抛异常
    - 更新订单为 status=1，并写入取件时间
    - 将对应仓门 hasItem 置回 0

#### 6) 跨域（CORS）

- `server/backend/src/main/java/com/express/cabinet/config/CorsConfig.java`
- 说明：当前配置为允许所有来源/头/方法（开发环境方便调试）。如需更严格控制，可按域名白名单配置并结合 Spring Security 做统一鉴权。

### 前端（React + Vite）

#### 1) 路由与访问控制

- `web/src/App.jsx`
  - `PrivateRoute`：若无 user（未登录）则跳转 `/login`
  - 主布局路由：`/` 下包含仪表盘、快递柜管理、订单管理页面

#### 2) 登录态与请求封装

- `web/src/utils/api.js`
  - 创建 Axios 实例：`baseURL: '/api'`（由 Vite Proxy 转发到后端）
  - 响应拦截：当 `ApiResponse.code != 200` 视为业务失败并抛出错误；遇到 401 清理 token 并跳转登录页
- `web/src/context/AuthContext.jsx`
  - `login(username, password)`：调用 `/auth/login` 获取 token，写入 localStorage，并设置默认请求头 Authorization
  - `logout()`：清理本地登录信息并移除默认 Authorization

#### 3) 页面功能概览

- `web/src/pages/Dashboard.jsx`
  - 并发请求快递柜列表与“示例手机号订单”，计算统计卡片数据
- `web/src/pages/CabinetManagement.jsx`
  - 快递柜列表 + 仓门列表（展开行）
  - 新增快递柜：提交表单调用 `POST /cabinets`
  - 启用/禁用：调用 `PUT /cabinets/{id}/status`
  - 开仓：调用 `POST /cabinets/compartments/{id}/open`
- `web/src/pages/OrderManagement.jsx`
  - 按手机号查询订单：调用 `GET /orders/phone/{phone}`
  - 默认展示初始化脚本中的示例手机号订单数据（便于演示）

### 一键启动脚本（start.js）

- 位置：项目根目录 `start.js`
- 工作流（从上到下）：
  - 检查 Node.js、npm、Docker 是否可用
  - 若前端未安装依赖则自动执行 `npm install`
  - 创建/启动 MySQL 容器 `express-mysql`（数据卷持久化，挂载 `server/database/init.sql` 自动初始化）
  - 启动后端（Maven Wrapper：Windows 使用 `mvnw.cmd`，macOS/Linux 使用 `sh mvnw`）
  - 启动前端（Vite dev server）
  - 等待后端与前端 HTTP 就绪后执行冒烟测试（登录 + 访问核心接口）
  - 最后汇总输出 MySQL/后端/前端的端口与访问地址

## 开发计划

### 已完成功能
- [x] 用户认证系统
- [x] 快递柜基础管理
- [x] 订单基础管理
- [x] Web管理平台基础功能

### 待开发功能
- [ ] 快递员端应用（Android/小程序）
- [ ] 普通用户端应用（Android/小程序）
- [ ] 快递单号查询接口集成
- [ ] 短信通知功能
- [ ] 人脸识别开柜功能
- [ ] 温湿度传感器数据采集
- [ ] 电表数据采集
- [ ] 统计分析功能完善

## 注意事项

1. 本项目为最小化实现版本，主要用于演示前后端分离架构和核心功能。
2. 硬件功能（如开仓、传感器数据）均通过软件模拟实现。
3. 生产环境部署需要配置HTTPS、完善安全措施等。
4. 数据库密码等敏感信息请勿提交到版本控制系统。

## 常见问题排查

1. MySQL 启动失败 / 3306 端口被占用  
   - 停止本机已安装的 MySQL 服务或其它占用 3306 的容器/服务
   - 使用 `docker ps` 查看是否已有 MySQL 容器在运行

2. Docker MySQL 启动失败（init.sql 挂载报错 not a directory）  
   - 常见原因：旧容器绑定了错误的宿主机路径或文件/目录类型不匹配
   - 处理方式：删除旧容器并重建（不会删除数据卷）：`docker rm -f express-mysql`，然后重新执行 `node start.js`
   - 确认初始化脚本路径为：`server/database/init.sql`

3. 后端启动报错 `JAVA_HOME not found`  
   - 配置系统环境变量 `JAVA_HOME` 并重启终端

4. 前端依赖安装慢或失败  
   - 可切换 npm 源或使用更稳定的网络环境后重试

## 许可证

本项目仅用于学习和教学目的。
