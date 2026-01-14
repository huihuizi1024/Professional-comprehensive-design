# 快速开始指南

## 一、环境准备

### 1. 安装必要软件

- **JDK 1.8+**: 下载地址：https://www.oracle.com/java/technologies/downloads/
- **Maven 3.6+**: 下载地址：https://maven.apache.org/download.cgi
- **Node.js 16+**: 下载地址：https://nodejs.org/
- **MySQL 8.0+**: 下载地址：https://dev.mysql.com/downloads/mysql/

### 2. 验证安装

打开命令行（Windows: PowerShell 或 CMD，Mac/Linux: Terminal），执行以下命令验证：

```bash
java -version
mvn -version
node -v
npm -v
mysql --version
```

## 二、数据库配置

### 1. 启动MySQL服务

确保MySQL服务正在运行。

### 2. 创建数据库

使用MySQL客户端（如MySQL Workbench、Navicat或命令行）执行：

```sql
CREATE DATABASE express_cabinet DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 导入初始化数据

执行 `database/init.sql` 文件：

**方式一：命令行**
```bash
mysql -u root -p express_cabinet < database/init.sql
```

**方式二：MySQL客户端**
- 打开MySQL客户端
- 连接到数据库
- 打开并执行 `database/init.sql` 文件

### 4. 修改数据库配置

编辑 `backend/src/main/resources/application.yml`，修改以下配置：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/express_cabinet?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root        # 修改为你的MySQL用户名
    password: root        # 修改为你的MySQL密码
```

## 三、启动后端服务

### 1. 进入后端目录

```bash
cd backend
```

### 2. 编译项目（首次运行）

```bash
mvn clean install
```

### 3. 启动后端

```bash
mvn spring-boot:run
```

或者：

```bash
java -jar target/express-cabinet-backend-1.0.0.jar
```

### 4. 验证后端启动

打开浏览器访问：http://localhost:8080/api/cabinets

如果看到JSON响应（可能是空数组），说明后端启动成功。

## 四、启动前端服务

### 1. 打开新的命令行窗口

保持后端服务运行，打开新的命令行窗口。

### 2. 进入前端目录

```bash
cd frontend
```

### 3. 安装依赖（首次运行）

```bash
npm install
```

如果下载速度慢，可以使用国内镜像：

```bash
npm install --registry=https://registry.npmmirror.com
```

### 4. 启动前端开发服务器

```bash
npm run dev
```

### 5. 访问应用

打开浏览器访问：http://localhost:3000

## 五、登录系统

使用以下测试账号登录：

- **用户名**: admin
- **密码**: 123456

## 六、常见问题

### 1. 后端启动失败

**问题**: 端口8080被占用
**解决**: 
- 修改 `backend/src/main/resources/application.yml` 中的 `server.port` 为其他端口（如8081）
- 或关闭占用8080端口的程序

**问题**: 数据库连接失败
**解决**:
- 检查MySQL服务是否启动
- 检查数据库用户名密码是否正确
- 检查数据库是否已创建

### 2. 前端启动失败

**问题**: npm install 失败
**解决**:
- 检查网络连接
- 使用国内镜像：`npm install --registry=https://registry.npmmirror.com`
- 删除 `node_modules` 文件夹后重新安装

**问题**: 端口3000被占用
**解决**:
- 修改 `frontend/vite.config.js` 中的 `server.port` 为其他端口

### 3. 前端无法连接后端

**问题**: API请求失败
**解决**:
- 确保后端服务正在运行
- 检查 `frontend/vite.config.js` 中的代理配置
- 检查后端端口是否与配置一致

### 4. 数据库相关错误

**问题**: 表不存在
**解决**:
- 确保已执行 `database/init.sql`
- 检查数据库名称是否正确

**问题**: 字符编码问题
**解决**:
- 确保数据库使用 utf8mb4 字符集
- 检查连接URL中的字符编码参数

## 七、项目结构说明

```
源代码/
├── backend/              # Spring Boot后端项目
│   ├── src/main/java/   # Java源代码
│   ├── src/main/resources/  # 配置文件
│   └── pom.xml          # Maven依赖配置
├── frontend/            # React前端项目
│   ├── src/            # React源代码
│   ├── package.json    # npm依赖配置
│   └── vite.config.js  # Vite构建配置
├── database/           # 数据库脚本
│   └── init.sql       # 初始化SQL脚本
├── README.md          # 项目说明文档
└── QUICKSTART.md      # 本文件
```

## 八、开发建议

1. **IDE推荐**:
   - 后端：IntelliJ IDEA 或 Eclipse
   - 前端：VS Code 或 WebStorm

2. **代码格式化**:
   - 后端：使用IDE的格式化功能
   - 前端：可以使用 Prettier

3. **API测试**:
   - 推荐使用 Postman 或 Apifox 测试API接口

4. **数据库管理**:
   - 推荐使用 MySQL Workbench 或 Navicat

## 九、下一步开发

完成基础框架后，可以继续开发：

1. 完善用户管理功能
2. 开发快递员端应用
3. 开发普通用户端应用
4. 集成第三方服务（短信、快递查询等）
5. 添加更多业务功能

祝开发顺利！

