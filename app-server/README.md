# 快递员端微信小程序 (app-server)

本项目为快递柜综合应用系统的快递员端小程序，主要用于快递员登录、查询附近柜机、投递快递以及查看历史投递记录。

## 目录结构说明

### 根目录
- **`app.js`**: 小程序逻辑入口。负责全局生命周期管理（如 `onLaunch`），以及全局数据 `globalData` 的维护。
- **`app.json`**: 小程序全局配置。包括页面路径注册 (`pages`)、窗口外观 (`window`)、底部导航栏等配置。
- **`app.wxss`**: 全局样式表。定义了通用的 CSS 样式。
- **`project.config.json`**: 项目配置文件。包含项目名称、AppID、编译配置等信息。
- **`sitemap.json`**: 站点地图配置。用于微信搜索索引。

### `utils/` - 工具类
- **`request.js`**: **核心网络请求封装**。
    - 封装了 `wx.request`，统一配置了后端 API 基准地址 (`http://localhost:8080/api`)。
    - 实现了请求拦截：自动在 Header 中添加 JWT Token (`Authorization: Bearer ...`)。
    - 实现了响应拦截：统一处理 `401` 未登录跳转、业务错误提示等。
- **`util.js`**: 基础工具函数（如时间格式化等，小程序模板自带）。

### `pages/` - 页面模块

#### 1. `pages/login/` - 登录页
- **`login.wxml`**: 登录界面结构，包含账号、密码输入框和登录按钮。
- **`login.js`**: 处理登录逻辑。调用后端 `/api/auth/login` 接口，校验快递员身份 (`userType=1`)，并将 Token 存入本地存储。
- **`login.wxss`**: 登录页样式。

#### 2. `pages/index/` - 首页 (工作台)
- **`index.wxml`**: 展示快递员个人信息（工号、姓名）和功能入口（投递快递、我的投递）。
- **`index.js`**: 首页逻辑。检查登录态，处理菜单跳转和退出登录功能。
- **`index.wxss`**: 首页样式，采用卡片式布局。

#### 3. `pages/cabinets/` - 快递柜模块
- **`list` (快递柜列表)**:
    - **`list.js`**: 调用 `/api/cabinets/nearby` 获取附近快递柜列表。
    - **`list.wxml`**: 展示柜机编号、位置、状态（正常/维护）及总格口数。
- **`detail` (仓门选择)**:
    - **`detail.js`**: 根据柜机 ID 获取仓门列表 (`/api/cabinets/{id}/compartments`)。
    - **`detail.wxml`**: 以网格形式展示仓门，通过颜色区分状态（绿色-空闲，红色-占用，灰色-故障）。仅允许点击空闲仓门进入投递页。

#### 4. `pages/deliver/` - 投递模块
- **`form` (投递表单)**:
    - **`form.wxml`**: 显示当前选中的柜机和仓门号。提供快递单号（支持扫码）、收件人手机、姓名的输入表单。
    - **`form.js`**: 处理投递提交。调用 `/api/orders/courier/deliver` 接口完成投递，并模拟开门提示。

#### 5. `pages/history/` - 历史记录
- **`history.wxml`**: 列表展示该快递员的投递记录，包括单号、收件人信息、取件码及当前状态。
- **`history.js`**: 调用 `/api/orders/courier/me` 获取历史订单，支持下拉刷新。

#### 6. `pages/logs/` - 日志 (模板自带)
- 用于展示启动日志，非核心业务功能。

## 快速开始

1.  确保后端服务已启动 (`http://localhost:8080`)。
2.  使用 **微信开发者工具** 导入本目录 (`app-server`).
3.  使用测试账号登录：
    -   账号：`courier1`
    -   密码：`123456`
