# 微信开发者工具配置指南

## 问题：网络错误

小程序显示"网络错误"是因为微信开发者工具默认会拦截对 `localhost` 的请求。

## 解决方案

### 方法1：在微信开发者工具中配置（推荐）

#### 步骤1：打开详情设置
1. 在微信开发者工具中，点击右上角的 **"详情"** 按钮
2. 选择 **"本地设置"** 标签

#### 步骤2：勾选不校验选项
在"本地设置"中，勾选以下选项：
- ✅ **不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书**
- ✅ **不校验安全域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书**

#### 步骤3：重新编译
1. 点击工具栏的 **"编译"** 按钮
2. 等待编译完成
3. 再次尝试登录/注册

### 方法2：修改项目配置文件

在 `project.config.json` 中添加配置：

```json
{
  "setting": {
    "urlCheck": false,
    "es6": true,
    "postcss": true,
    "minified": true
  }
}
```

### 方法3：使用真实IP地址（不推荐）

如果上述方法不行，可以使用真实IP：

1. 查看本机IP：
```bash
ipconfig
```

2. 修改小程序API配置：
```javascript
// user_xcx/utils/api.js
const BASE_URL = 'http://192.168.x.x:8080/api'  // 替换为你的真实IP
```

3. 在微信开发者工具中配置：
- 详情 -> 本地设置 -> 勾选"不校验合法域名"

## 验证配置是否生效

### 1. 检查控制台日志
在微信开发者工具的"Console"标签中，查看是否有网络请求日志。

### 2. 测试API连接
在小程序的Console中输入：
```javascript
wx.request({
  url: 'http://localhost:8080/api/cabinets',
  method: 'GET',
  success: (res) => {
    console.log('请求成功:', res)
  },
  fail: (err) => {
    console.log('请求失败:', err)
  }
})
```

### 3. 查看Network标签
在"Network"标签中查看请求是否成功发送。

## 常见问题

### Q1：勾选后仍然报错
**A**：尝试以下步骤：
1. 完全关闭微信开发者工具
2. 重新打开项目
3. 重新勾选"不校验合法域名"
4. 点击"清除缓存" -> "清除全部缓存"
5. 重新编译

### Q2：显示"request:fail"
**A**：检查：
1. 后端服务是否正在运行（http://localhost:8080）
2. 端口是否正确（8080）
3. 是否勾选了"不校验合法域名"

### Q3：显示"不在以下 request 合法域名列表中"
**A**：这是正常的，因为localhost不是合法域名。需要勾选"不校验合法域名"。

### Q4：后端日志显示跨域错误
**A**：检查后端跨域配置，确保允许所有来源：
```java
config.addAllowedOriginPattern("*");
```

## 完整配置示例

### 微信开发者工具本地设置

```
□ 不使用任何的服务，直接使用 https://协议访问
☑ 不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书
☑ 不校验安全域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书
☑ 启用调试
☑ 启用 ES6 转 ES5
☑ 启用增强编译
☑ 启用代码压缩
```

### 项目配置文件 (project.config.json)

```json
{
  "description": "快递柜小程序",
  "packOptions": {
    "ignore": [],
    "include": []
  },
  "setting": {
    "urlCheck": false,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true,
    "newFeature": false,
    "coverView": true,
    "nodeModules": false,
    "autoAudits": false,
    "showShadowRootInWxmlPanel": true,
    "scopeDataCheck": false,
    "uglifyFileName": false,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "compileHotReLoad": true,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    },
    "enableEngineNative": false,
    "bundle": false,
    "useIsolateContext": true,
    "useCompilerModule": true,
    "userConfirmedUseCompilerModuleSwitch": false,
    "userConfirmedBundleSwitch": false,
    "packNpmManually": false,
    "packNpmRelationList": [],
    "minifyWXSS": true
  },
  "compileType": "miniprogram",
  "libVersion": "3.0.0",
  "appid": "touristappid",
  "projectname": "user_xcx",
  "condition": {}
}
```

## 快速测试步骤

1. 打开微信开发者工具
2. 点击右上角"详情"
3. 勾选"不校验合法域名"
4. 点击"编译"
5. 在小程序中点击"登录"
6. 输入测试账号：admin / 123456
7. 点击"登录"按钮

## 后续步骤

如果配置成功后仍然无法连接：

1. 检查防火墙设置
2. 检查杀毒软件是否拦截
3. 尝试使用真实IP地址
4. 查看微信开发者工具Console中的详细错误信息

## 联系支持

如果以上方法都无法解决问题，请提供以下信息：
- 微信开发者工具版本
- 基础库版本
- Console中的完整错误信息
- Network标签中的请求详情
