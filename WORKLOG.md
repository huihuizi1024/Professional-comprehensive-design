# 个人工作内容记录（框架搭建阶段）

## 工作概述

- 完成快递柜综合应用系统的最小可运行版本框架搭建，形成前后端分离工程、数据库初始化与一键启动能力，支持在新电脑快速拉起并演示核心流程。

## 主要工作内容

### 1) 工程结构与基础环境

- 完成工程目录结构与基础配置梳理：
  - `backend/`：Spring Boot 后端
  - `frontend/`：React + Vite 前端
  - `database/`：MySQL 初始化脚本
- 明确后端配置入口：`backend/src/main/resources/application.yml`（端口、数据源、JWT 等）。

### 2) 数据库与初始化脚本

- 基于 MySQL 8.0 设计并初始化核心业务表：
  - `users`、`cabinets`、`compartments`、`express_orders`
- 提供 `database/init.sql`，包含建库建表与演示数据/测试账号，保证新环境可快速初始化并演示。

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

