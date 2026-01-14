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
├── backend/                 # 后端项目
│   ├── src/
│   │   └── main/
│   │       ├── java/com/express/cabinet/
│   │       │   ├── controller/    # 控制器层
│   │       │   ├── service/       # 服务层
│   │       │   ├── repository/    # 数据访问层
│   │       │   ├── entity/        # 实体类
│   │       │   ├── dto/           # 数据传输对象
│   │       │   ├── util/          # 工具类
│   │       │   └── config/        # 配置类
│   │       └── resources/
│   │           └── application.yml
│   └── pom.xml
├── frontend/               # 前端项目
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   ├── components/    # 通用组件
│   │   ├── context/       # 上下文
│   │   ├── utils/         # 工具函数
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── database/              # 数据库脚本
    └── init.sql
```

## 快速开始

### 环境要求

- JDK 1.8+
- Maven 3.6+
- Node.js 16+
- MySQL 8.0+（或使用 Docker 运行 MySQL）

### 数据库配置

推荐使用 Docker（无需本机安装 MySQL），会自动执行初始化脚本。

```bash
cd Professional-comprehensive-design
docker run --name express-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -p 3306:3306 \
  -v "$(pwd)/database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro" \
  -d mysql:8.0
```

验证数据库与表是否创建成功：

```bash
docker exec express-mysql mysql -uroot -proot -e "SHOW DATABASES; USE express_cabinet; SHOW TABLES;"
```

### 后端启动

方式一：一键启动（推荐）

- macOS / Linux：

```bash
chmod +x start.sh
./start.sh
```

- Windows：双击 `一键启动.bat`

方式二：手动启动后端

```bash
cd backend
mvn spring-boot:run
```

后端服务将在 `http://localhost:8080` 启动。

### 前端启动

手动启动前端：

```bash
cd frontend
npm install
npm run dev
```

前端应用将在 `http://localhost:3000` 启动。

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

## API接口文档

### 基本约定

- 基础路径：`/api`
- 返回结构：`{ code: number, message: string, data: any }`
- 请求头（登录后）：`Authorization: Bearer <token>`

### 认证接口

| 接口名称 | 方法 | 路径 | 是否需要登录 | 请求参数（JSON） | 返回 data |
|---|---|---|---|---|---|
| 用户注册 | POST | `/api/auth/register` | 否 | `username`(必填)、`password`(必填)、`phone`(必填)、`realName`(可选)、`userType`(可选，0普通用户/1快递员) | `userId`、`username`、`userType`、`token` |
| 用户登录 | POST | `/api/auth/login` | 否 | `username`(必填)、`password`(必填) | `userId`、`username`、`userType`、`token` |

### 快递柜接口

| 接口名称 | 方法 | 路径 | 是否需要登录 | 路径/请求参数 | 返回 data |
|---|---|---|---|---|---|
| 获取快递柜列表 | GET | `/api/cabinets` | 是 | 无 | `Cabinet[]` |
| 获取快递柜详情 | GET | `/api/cabinets/{id}` | 是 | `id`(路径参数) | `Cabinet` |
| 按编号查询快递柜 | GET | `/api/cabinets/code/{cabinetCode}` | 是 | `cabinetCode`(路径参数) | `Cabinet` |
| 获取仓门列表 | GET | `/api/cabinets/{cabinetId}/compartments` | 是 | `cabinetId`(路径参数) | `Compartment[]` |
| 获取可用仓门 | GET | `/api/cabinets/{cabinetId}/compartments/available` | 是 | `cabinetId`(路径参数) | `Compartment[]` |
| 创建快递柜 | POST | `/api/cabinets` | 是 | JSON：`cabinetCode`(必填)、`location`(可选)、`totalCompartments`(必填)、`powerConsumption`(可选)、`status`(可选，0禁用/1启用) | `Cabinet` |
| 更新快递柜状态 | PUT | `/api/cabinets/{id}/status` | 是 | 路径：`id`；JSON：`status`(必填，0/1) | `Cabinet` |
| 更新仓门状态 | PUT | `/api/cabinets/compartments/{compartmentId}/status` | 是 | 路径：`compartmentId`；JSON：`status`(必填，0故障/1正常) | `Compartment` |
| 远程开仓（模拟） | POST | `/api/cabinets/compartments/{compartmentId}/open` | 是 | `compartmentId`(路径参数) | `string`（固定为“开仓成功”） |

### 订单接口

| 接口名称 | 方法 | 路径 | 是否需要登录 | 路径/请求参数 | 返回 data |
|---|---|---|---|---|---|
| 按手机号查询订单 | GET | `/api/orders/phone/{phone}` | 是 | `phone`(路径参数) | `ExpressOrder[]` |
| 按用户ID查询订单 | GET | `/api/orders/user/{userId}` | 是 | `userId`(路径参数) | `ExpressOrder[]` |
| 按取件码查询订单 | GET | `/api/orders/pick-code/{pickCode}` | 是 | `pickCode`(路径参数) | `ExpressOrder` |
| 创建订单 | POST | `/api/orders` | 是 | JSON：`orderNo`(必填)、`cabinetId`(必填)、`compartmentId`(必填)、`receiverName`(必填)、`receiverPhone`(必填)、`receiverUserId`(可选)、`courierId`(可选)、`senderName`(可选)、`senderPhone`(可选)、`orderType`(必填，0入柜/1寄存/2发件) | `ExpressOrder`（后端生成 `pickCode` 等字段） |
| 取件 | POST | `/api/orders/pick-up` | 是 | JSON：`pickCode`(必填) | `ExpressOrder` |

### 数据库表结构

数据库初始化脚本：[init.sql](file:///Users/hhhh/Desktop/课程资料/专业综合设计/Professional-comprehensive-design/database/init.sql)（字符集 `utf8mb4`）。

#### users（用户表）

| 字段 | 类型 | 约束/默认 | 说明 |
|---|---|---|---|
| id | BIGINT | PK，自增 | 主键 |
| username | VARCHAR(50) | UNIQUE，NOT NULL | 用户名 |
| password | VARCHAR(255) | NOT NULL | 密码（BCrypt） |
| phone | VARCHAR(20) | UNIQUE，NOT NULL | 手机号 |
| real_name | VARCHAR(50) | 可空 | 真实姓名 |
| user_type | TINYINT | NOT NULL，默认 0 | 用户类型：0普通用户，1快递员 |
| status | TINYINT | NOT NULL，默认 1 | 状态：0禁用，1启用 |
| created_at | DATETIME | 默认当前时间 | 创建时间 |
| updated_at | DATETIME | 默认当前时间，自动更新 | 更新时间 |

#### cabinets（快递柜表）

| 字段 | 类型 | 约束/默认 | 说明 |
|---|---|---|---|
| id | BIGINT | PK，自增 | 主键 |
| cabinet_code | VARCHAR(50) | UNIQUE，NOT NULL | 快递柜编号 |
| location | VARCHAR(200) | 可空 | 位置 |
| status | TINYINT | NOT NULL，默认 1 | 状态：0禁用，1启用 |
| total_compartments | INT | NOT NULL，默认 8 | 总仓数 |
| power_consumption | DECIMAL(10,2) | 默认 0 | 日用电量（度） |
| created_at | DATETIME | 默认当前时间 | 创建时间 |
| updated_at | DATETIME | 默认当前时间，自动更新 | 更新时间 |

#### compartments（仓门表）

| 字段 | 类型 | 约束/默认 | 说明 |
|---|---|---|---|
| id | BIGINT | PK，自增 | 主键 |
| cabinet_id | BIGINT | NOT NULL，FK→cabinets.id | 快递柜ID |
| compartment_no | INT | NOT NULL，(cabinet_id, compartment_no) 唯一 | 仓门编号 |
| status | TINYINT | NOT NULL，默认 1 | 状态：0故障/禁用，1正常 |
| has_item | TINYINT | NOT NULL，默认 0 | 是否有物品：0无，1有 |
| temperature | DECIMAL(5,2) | 可空 | 温度（部分仓有） |
| humidity | DECIMAL(5,2) | 可空 | 湿度（部分仓有） |
| created_at | DATETIME | 默认当前时间 | 创建时间 |
| updated_at | DATETIME | 默认当前时间，自动更新 | 更新时间 |

#### express_orders（快递订单表）

| 字段 | 类型 | 约束/默认 | 说明 |
|---|---|---|---|
| id | BIGINT | PK，自增 | 主键 |
| order_no | VARCHAR(50) | UNIQUE，NOT NULL | 快递单号 |
| cabinet_id | BIGINT | NOT NULL，FK→cabinets.id | 快递柜ID |
| compartment_id | BIGINT | NOT NULL，FK→compartments.id | 仓门ID |
| sender_name | VARCHAR(50) | 可空 | 发件人姓名 |
| sender_phone | VARCHAR(20) | 可空 | 发件人手机号 |
| receiver_name | VARCHAR(50) | NOT NULL | 收件人姓名 |
| receiver_phone | VARCHAR(20) | NOT NULL | 收件人手机号 |
| receiver_user_id | BIGINT | 可空，FK→users.id | 收件人用户ID |
| courier_id | BIGINT | 可空，FK→users.id | 快递员ID |
| pick_code | VARCHAR(10) | NOT NULL | 取件码 |
| order_type | TINYINT | NOT NULL，默认 0 | 订单类型：0入柜，1寄存，2发件 |
| status | TINYINT | NOT NULL，默认 0 | 状态：0待取件，1已取件，2已超时 |
| put_in_time | DATETIME | 可空 | 放入时间 |
| pick_up_time | DATETIME | 可空 | 取件时间 |
| expire_time | DATETIME | 可空 | 过期时间 |
| created_at | DATETIME | 默认当前时间 | 创建时间 |
| updated_at | DATETIME | 默认当前时间，自动更新 | 更新时间 |

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

## 许可证

本项目仅用于学习和教学目的。
