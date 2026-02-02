# 快递柜小程序运行指南

## 运行前准备

### 1. 安装必要软件
- ✅ Java 17 或更高版本（已安装：Java 21）
- ✅ Maven（已包含在项目中）
- ⚠️ MySQL 8.0 或更高版本（需要安装并启动）
- ⚠️ 微信开发者工具（需要安装）

### 2. 启动MySQL数据库

#### Windows系统：
```bash
# 启动MySQL服务
net start MySQL80

# 或者通过服务管理器启动
# Win + R -> services.msc -> 找到MySQL服务 -> 右键启动
```

#### 验证MySQL是否运行：
```bash
mysql -u root -p
# 输入密码：root
```

### 3. 初始化数据库

在MySQL中执行以下命令：

```bash
mysql -u root -p < e:\professional_design\project3\Professional-comprehensive-design\server\database\init.sql
```

或者在MySQL命令行中：
```sql
source e:\professional_design\project3\Professional-comprehensive-design\server\database\init.sql
```

### 4. 启动后端服务

```bash
cd e:\professional_design\project3\Professional-comprehensive-design\server\backend
.\mvnw.cmd spring-boot:run
```

等待看到类似以下日志表示启动成功：
```
Started ExpressCabinetApplication in X.XXX seconds
```

### 5. 添加小程序图标（必须）

小程序需要8个图标文件才能正常显示tabBar：

#### 方案1：快速创建占位图标（推荐用于测试）
1. 打开画图工具或任何图片编辑器
2. 创建81x81像素的PNG图片
3. 保存到 `user_xcx/images/` 目录

需要的文件：
- `images/cabinet.png` - 快递柜图标（灰色）
- `images/cabinet-active.png` - 快递柜图标（紫色）
- `images/pickup.png` - 取件图标（灰色）
- `images/pickup-active.png` - 取件图标（紫色）
- `images/order.png` - 订单图标（灰色）
- `images/order-active.png` - 订单图标（紫色）
- `images/profile.png` - 个人中心图标（灰色）
- `images/profile-active.png` - 个人中心图标（紫色）

#### 方案2：临时禁用tabBar
如果暂时不想添加图标，可以修改 `app.json`，注释掉tabBar配置部分。

### 6. 在微信开发者工具中打开小程序

1. 打开微信开发者工具
2. 选择"小程序"项目
3. 项目目录选择：`e:\professional_design\project3\Professional-comprehensive-design\user_xcx`
4. AppID：选择"测试号"或填入你的小程序AppID
5. 点击"导入"

### 7. 配置服务器域名（正式环境）

在微信小程序管理后台配置：
- 登录微信公众平台：https://mp.weixin.qq.com
- 开发 -> 开发管理 -> 开发设置 -> 服务器域名
- 添加 `request` 合法域名：`http://localhost:8080`（开发环境）

**注意**：开发工具中可以勾选"不校验合法域名"来跳过此步骤。

## 测试账号

数据库中已预置测试账号：

| 用户名 | 密码 | 手机号 | 类型 |
|--------|------|--------|------|
| admin | 123456 | 13800138000 | 普通用户 |
| courier1 | 123456 | 13800138001 | 快递员 |
| user1 | 123456 | 13800138002 | 普通用户 |

## 功能测试流程

### 1. 用户注册/登录
- 打开小程序，进入登录页面
- 使用测试账号登录，或注册新账号

### 2. 查看快递柜
- 进入"快递柜"页面
- 查看所有可用的快递柜
- 点击快递柜查看详情和格口状态

### 3. 存件测试
- 选择一个快递柜
- 点击空闲格口
- 填写快递信息
- 获取取件码

### 4. 取件测试
- 进入"取件"页面
- 输入6位取件码
- 确认取件

### 5. 查看订单
- 进入"订单"页面
- 查看所有订单记录

## 常见问题

### 问题1：后端启动失败 - 无法连接数据库
**解决方法**：
- 检查MySQL服务是否启动
- 检查数据库用户名和密码是否正确（默认：root/root）
- 检查数据库是否已创建

### 问题2：小程序网络请求失败
**解决方法**：
- 确保后端服务正在运行（http://localhost:8080）
- 在微信开发者工具中勾选"不校验合法域名"
- 检查 `utils/api.js` 中的 `BASE_URL` 配置

### 问题3：tabBar不显示
**解决方法**：
- 确保已添加8个图标文件到 `images/` 目录
- 图标尺寸必须是81x81像素
- 图标格式必须是PNG

### 问题4：Java版本不兼容
**解决方法**：
- 已更新pom.xml支持Java 17
- 如果仍有问题，请安装Java 17或Java 11

## 项目结构

```
Professional-comprehensive-design/
├── server/
│   ├── backend/              # Spring Boot后端
│   │   ├── src/
│   │   └── pom.xml
│   └── database/
│       └── init.sql         # 数据库初始化脚本
├── user_xcx/               # 微信小程序前端
│   ├── pages/              # 页面
│   ├── components/         # 组件
│   ├── utils/             # 工具类
│   ├── images/            # 图片资源（需要添加）
│   ├── app.js
│   ├── app.json
│   └── app.wxss
└── web/                  # Web管理端（未使用）
```

## 开发说明

### 修改API地址
如果后端地址不是 `localhost:8080`，请修改：
```javascript
// user_xcx/utils/api.js
const BASE_URL = 'http://your-backend-url:port/api'
```

### 修改数据库配置
如果数据库配置不同，请修改：
```yaml
# server/backend/src/main/resources/application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/express_cabinet
    username: root
    password: your_password
```

## 后续优化建议

1. 添加地图定位功能
2. 添加扫码功能
3. 添加消息推送
4. 优化UI设计
5. 添加帮助文档
6. 添加用户反馈功能

## 联系方式

如有问题，请联系开发团队。
