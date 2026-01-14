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

### 认证接口

#### 用户注册
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "test",
  "password": "123456",
  "phone": "13800138000",
  "realName": "测试用户",
  "userType": 0
}
```

#### 用户登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}
```

### 快递柜接口

#### 获取所有快递柜
```
GET /api/cabinets
Authorization: Bearer {token}
```

#### 获取快递柜详情
```
GET /api/cabinets/{id}
Authorization: Bearer {token}
```

#### 创建快递柜
```
POST /api/cabinets
Authorization: Bearer {token}
Content-Type: application/json

{
  "cabinetCode": "CAB003",
  "location": "北京市朝阳区XX街道XX号",
  "totalCompartments": 8
}
```

#### 更新快递柜状态
```
PUT /api/cabinets/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": 0
}
```

#### 获取可用仓门
```
GET /api/cabinets/{cabinetId}/compartments/available
Authorization: Bearer {token}
```

#### 远程开仓
```
POST /api/cabinets/compartments/{compartmentId}/open
Authorization: Bearer {token}
```

### 订单接口

#### 根据手机号获取订单
```
GET /api/orders/phone/{phone}
Authorization: Bearer {token}
```

#### 根据取件码获取订单
```
GET /api/orders/pick-code/{pickCode}
Authorization: Bearer {token}
```

#### 创建订单
```
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderNo": "SF1234567890",
  "cabinetId": 1,
  "compartmentId": 1,
  "receiverName": "张三",
  "receiverPhone": "13800138000",
  "orderType": 0
}
```

#### 取件
```
POST /api/orders/pick-up
Authorization: Bearer {token}
Content-Type: application/json

{
  "pickCode": "123456"
}
```

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
