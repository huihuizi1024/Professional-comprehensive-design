# 用户端小程序 (user_xcx) 代码导读指南

这份指南是为了帮助你在答辩时能够流畅地讲解用户端小程序的代码逻辑、核心功能以及回答老师可能提出的技术问题。

## 一、 项目整体结构

首先，向老师展示整个小程序的骨架。

### 1. 入口与全局配置
*   **[app.json](app.json)**：**全局配置文件**。
    *   **作用**：定义了小程序的所有页面路径 (`pages`) 和底部的导航栏 (`tabBar`)。
    *   **重点**：展示 `tabBar` 配置，说明小程序分为四个主要功能区：快递柜 (`cabinets`)、发快递 (`send-express`)、取件 (`pick-up`)、我的 (`profile`)。
*   **[app.js](app.js)**：**全局逻辑文件**。
    *   **作用**：管理小程序的生命周期和全局数据。
    *   **重点**：`globalData` 对象存储了 `token`、`userInfo` 和 `userId`。
    *   **逻辑**：在 `onLaunch` 生命周期中，代码会自动尝试从本地缓存 (`wx.getStorageSync`) 读取 Token，实现“自动登录”或“状态保持”。

## 二、 核心模块讲解 (答辩重点)

### 1. 网络请求层 (封装思想)
如果被问到“前后端如何交互”，请展示 `utils` 目录。

*   **基础封装 [utils/api.js](utils/api.js)**
    *   这里对微信原生的 `wx.request` 进行了 Promise 封装。
    *   **关键点**：请求拦截器。在 `header` 中自动添加 `'Authorization': Bearer token`，这是后端识别用户身份的关键。
    *   **亮点**：`filterParams` 函数会自动过滤掉 `null` 或 `undefined` 的参数，保证发送给后端的数据是干净的。
*   **业务接口 [utils/service.js](utils/service.js)**
    *   将 API 请求按业务模块分类：`auth` (认证)、`cabinet` (柜子)、`order` (订单)、`user` (用户)。
    *   **话术**：“我采用了分层架构，将网络请求单独封装，提高了代码的复用性和可维护性。”

### 2. 登录流程
*   **文件**：**[pages/login/login.js](pages/login/login.js)**
*   **流程**：
    1.  用户输入用户名密码 -> 触发 `handleLogin`。
    2.  调用 `service.auth.login` 发送请求。
    3.  成功后拿到 `token`。
    4.  **关键动作**：调用 `app.setToken(token)`，同时更新全局变量和写入本地缓存 (`Storage`)。

### 3. 查看快递柜 (LBS与状态)
*   **文件**：**[pages/cabinets/cabinets.js](pages/cabinets/cabinets.js)**
*   **核心逻辑**：
    *   **定位**：`getCurrentLocation` 调用 `wx.getLocation` 获取用户经纬度。
    *   **附近推荐**：`loadNearbyCabinets` 将经纬度传给后端，后端计算距离并返回附近的柜子。
    *   **实时状态**：在 `processCabinets` 中，会遍历获取到的柜子列表，并二次调用 `getAvailableCompartments` 接口，实时显示每个柜子还有多少个空格口。

### 4. 发快递 (表单与逻辑)
*   **文件**：**[pages/send-express/send-express.js](pages/send-express/send-express.js)**
*   **核心逻辑**：
    1.  **选择资源**：先选柜子 (`cabinetId`)，再选该柜子下的空格口 (`compartmentId`)。
    2.  **数据验证**：`validateForm` 函数中使用正则 `/^1[3-9]\d{9}$/` 严格校验手机号格式。
    3.  **提交订单**：`handleSubmit` 调用 `service.order.create` 创建订单。
    4.  **扫码功能**：`handleScan` 调用 `wx.scanCode`，支持扫描柜子二维码自动填入柜子信息。

### 5. 取件功能 (多种方式)
*   **文件**：**[pages/pick-up/pick-up.js](pages/pick-up/pick-up.js)**
*   **亮点**：实现了三种互补的取件方式。
    1.  **取件码取件**：输入6位数字 -> `handlePickUp` -> 验证通过后开锁。
    2.  **扫码取件**：`handleScan` 识别二维码内容，如果是取件码则自动填入，如果是柜子码则跳转。
    3.  **人脸识别**：`handleFaceRecognition`。
        *   **注意**：代码中使用 `setTimeout` 模拟了识别过程（真实人脸识别需要企业资质）。答辩时如实说明：“这里演示了人脸识别通过后的业务逻辑闭环。”

## 三、 答辩常见问题 (Q&A)

**Q1：你的 Token 存在哪里？**
> **A**: 登录成功后，Token 被存储在微信小程序的 `Storage` 本地缓存中，同时也同步在 `App.globalData` 内存中。每次发请求时，`api.js` 会自动读取并放入 Header。

**Q2：如果网络请求失败了怎么办？**
> **A**: 我在 `utils/api.js` 中做了统一的错误拦截。如果 HTTP 状态码或业务状态码 (`code`) 异常，会统一调用 `wx.showToast` 提示用户“网络错误”或具体错误信息，防止程序崩溃。

**Q3：怎么保证用户选的格口没被别人占用？**
> **A**: 
> 1.  **前端**：用户选择柜子时，会实时请求 `getAvailableCompartments` 刷新最新状态。
> 2.  **后端**：虽然我是负责前端的，但我知道后端在创建订单时会有数据库事务锁或状态检查，确保不会重复占用。

**Q4：你的扫码功能是怎么做的？**
> **A**: 使用了微信小程序的原生 API `wx.scanCode`。拿到扫描结果字符串后，我会在前端进行解析（例如判断是否包含 `cabinet_` 前缀），从而区分是扫描了柜子还是取件码。
