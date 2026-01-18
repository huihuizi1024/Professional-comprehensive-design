# 个人工作内容记录（框架搭建阶段）

## 工作概述

- 完成快递柜综合应用系统的最小可运行版本框架搭建，形成前后端分离工程、数据库初始化与一键启动能力，支持在新电脑快速拉起并演示核心流程。

## 主要工作内容

### 1) 工程结构与基础环境

- 完成工程目录结构与基础配置梳理：
  - `server/backend/`：Spring Boot 后端
  - `web/`：Web 管理端（React + Vite）
  - `server/database/`：MySQL 初始化脚本
  - `app-user/`：用户端小程序（预留目录）
  - `app-server/`：快递员端小程序（预留目录）
- 明确后端配置入口：`server/backend/src/main/resources/application.yml`（端口、数据源、JWT 等）。

### 2) 数据库与初始化脚本

- 基于 MySQL 8.0 设计并初始化核心业务表：
  - `users`、`cabinets`、`compartments`、`express_orders`
- 提供 `server/database/init.sql`，包含建库建表与演示数据/测试账号，保证新环境可快速初始化并演示。

### 3) 后端（Spring Boot + JPA）核心模块

- 完成分层结构与基础骨架（Controller / Service / Repository / Entity / DTO / Util）。
- 统一接口返回结构：`ApiResponse<T>`，固定 `{ code, message, data }`。
- 完成核心接口能力：
  - 认证：注册/登录（BCrypt 密码加密 + JWT token 生成）
  - 快递柜：列表/详情/状态切换、仓门查询、可用仓门筛选、模拟开仓
  - 订单：按手机号/用户查询、创建订单（生成取件码并占用仓门）、取件（释放仓门）

### 4) 前端（React + Vite + Ant Design）管理端

- 完成基础路由与页面框架：
  - 登录页、仪表盘、快递柜管理、订单管理
  - 路由守卫：未登录自动跳转登录页
- 完成接口请求封装与登录态管理：
  - Axios 实例（`baseURL: /api`）与 401 拦截处理
  - token/user 写入 localStorage，并设置默认 Authorization

### 5) 跨平台一键启动脚本

- 提供 `start.js` 作为统一启动入口：
  - 自动检查 Node.js / npm / Docker 环境
  - 自动启动/创建 MySQL 容器并执行初始化脚本
  - 自动启动后端（Maven Wrapper）与前端（Vite）
  - 等待服务就绪后进行冒烟测试（登录 + 调用核心接口）
  - 汇总输出服务端口与访问地址，降低部署与演示成本

## 自测与验证

- 后端：构建/测试通过（`mvnw test`）
- 前端：构建通过（`npm run build`）
- 一键启动：能完成数据库初始化、前后端启动与接口可用性校验

## 文档工作

- 拆分文档结构，便于团队查阅与后续维护：
  - `README.md`：项目说明、技术栈、启动方式、核心方法说明
  - `API.md`：接口文档
  - `DATABASE.md`：数据库文档

## 2026-01-16 前端界面更新记录

- 修复“快递柜管理/智能柜组管理”页面位置列乱码显示：
  - 定位根因：MySQL 会话连接字符集为 latin1，导致初始化脚本中的中文写入后变为乱码
  - 修复方式：初始化脚本增加 `SET NAMES utf8mb4`，并对已落库的乱码数据进行修复还原
  - 修复结果：后端接口返回 `location` 为正常中文，前端表格位置列显示正常

## 2026-01-18 功能修复与体验优化

- 修复“新增快递柜”提交后前端提示成功但数据库未落库的问题：
  - 后端：`CabinetService.createCabinet` 增加参数校验，并为 `status/totalCompartments/powerConsumption` 设置默认值，避免非空字段为 null 导致事务回滚
  - 前端：创建请求补齐 `status/powerConsumption`，并对 `cabinetCode` 做 trim，减少输入误差
- 统一前端对业务错误的处理：Axios 响应拦截器基于 `ApiResponse.code` 判断成功与否（code!=200 视为失败），避免后端业务异常返回 HTTP 200 时前端误报“创建成功”
- 排查并定位 Docker 启动 MySQL 容器失败（init.sql 挂载 not a directory）：结论为旧容器绑定了错误的宿主机路径（`.../database/init.sql`），处理方式为删除旧容器并按正确路径 `server/database/init.sql` 重新创建
