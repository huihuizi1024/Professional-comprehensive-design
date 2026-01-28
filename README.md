# 快递柜综合应用系统

## 项目简介

这是一个现代化的快递柜综合管理系统，采用前后端分离架构，打通了 **Web 管理端**、**用户端小程序** 和 **快递员端小程序** 三端。系统旨在解决最后一百米的物流派送与寄存问题，提供高效、安全的自助存取服务。

## 核心功能模块

### 1. Web 管理平台 (`web`)
面向管理员的后台管理系统。
- **快递柜管理**：查看柜体状态、格口使用情况、新增/编辑柜机。
- **用户管理**：管理普通用户和快递员账号，审核快递员资质。
- **数据统计**：可视化展示系统运行数据。

### 2. 用户端小程序 (`user_xcx`)
面向普通用户的使用端。
- **查找柜机**：查看附近快递柜及空闲格口。
- **取件服务**：输入取件码或扫码一键取件。
- **寄件服务**：在线下单寄件，预约格口。
- **个人中心**：查看历史订单、个人信息管理。

### 3. 快递员端小程序 (`app_server`)
面向快递员的作业端。
- **投递服务**：扫描/选择柜体，快速投递包裹。
- **格口管理**：查看格口状态，控制柜门开启。
- **订单管理**：查看已投递订单状态。

## 技术栈

### 后端 (`server/backend`)
- **框架**：Spring Boot 2.7.14
- **ORM**：Spring Data JPA
- **数据库**：MySQL 8.0
- **安全认证**：JWT (JSON Web Token) + BCrypt 加密
- **构建工具**：Maven

### Web 前端 (`web`)
- **框架**：React 18
- **构建工具**：Vite
- **UI 组件库**：Ant Design 5
- **路由**：React Router 6
- **HTTP 客户端**：Axios

### 小程序 (`user_xcx` / `app_server`)
- **平台**：微信小程序原生开发
- **语言**：WXML, WXSS, JavaScript
- **组件**：原生组件 + 自定义导航栏

## 项目结构

```
源代码/
├── web/                    # Web 管理端（React + Vite）
│   ├── src/
│   │   ├── pages/         # 页面组件 (CabinetManagement, UserManagement...)
│   │   ├── components/    # 通用组件
│   │   ├── context/       # AuthContext 等状态管理
│   │   └── utils/         # Request 封装等
├── user_xcx/               # 用户端小程序
│   ├── pages/             # 页面 (cabinets, pick-up, orders...)
│   └── utils/             # 工具函数
├── app_server/             # 快递员端小程序
│   ├── pages/             # 页面 (deliver, scan, compartments...)
│   └── utils/             # 工具函数
├── server/                 # 服务端
│   ├── backend/            # Spring Boot 后端源码
│   │   ├── src/main/java/com/express/cabinet/...
│   │   └── src/main/resources/application.yml
│   └── database/           # 数据库脚本
│       └── init.sql        # 包含建表语句和初始数据
└── start.js                # 一键启动脚本
```

## 快速开始

### 环境要求

- **JDK**：1.8+（推荐 JDK 11 或 17）
- **Node.js**：16+
- **Docker Desktop**：用于快速启动 MySQL 8.0（强烈推荐）

### 一键启动（推荐）

我们在项目根目录提供了一个自动化脚本，可以一键准备环境并启动所有服务。

```bash
# 在项目根目录下执行
node start.js
```

该脚本会自动执行以下操作：
1.  **环境检查**：检查 Docker、Port 占用情况。
2.  **数据库准备**：启动/创建名为 `express-mysql` 的 Docker 容器，并自动执行 `init.sql` 初始化数据。
    - 默认账号：`root`
    - 默认密码：`123456`
    - 端口映射：`3306:3306`
3.  **后端启动**：使用 Maven Wrapper 启动 Spring Boot 应用。
4.  **前端启动**：安装依赖并启动 React Web 端。
5.  **冒烟测试**：自动检测接口连通性。

启动成功后，控制台会输出访问地址：
- **Web 管理端**：http://localhost:5173
- **后端 API**：http://localhost:8080/api

### 小程序运行

使用 **微信开发者工具** 分别导入以下目录即可运行：
- **用户端**：导入 `user_xcx` 目录。
- **快递员端**：导入 `app_server` 目录。

注意：需在开发者工具中开启“不校验合法域名”选项，以便连接本地 `localhost:8080` 后端。

### 手动启动（高级）

如果你不使用 `start.js`，也可以手动分步启动：

1.  **启动数据库**：
    ```bash
    docker run --name express-mysql \
      -e MYSQL_ROOT_PASSWORD=123456 \
      -p 3306:3306 \
      -v "$(pwd)/server/database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro" \
      -d mysql:8.0
    ```

2.  **启动后端**：
    ```bash
    cd server/backend
    ./mvnw spring-boot:run
    ```

3.  **启动 Web 端**：
    ```bash
    cd web
    npm install
    npm run dev
    ```

## 默认账号

- **管理员**：
    - 用户名：`admin`
    - 密码：`123456`
- **普通用户/快递员**：
    - 可在小程序端注册，或查看数据库 `users` 表中的测试数据。
