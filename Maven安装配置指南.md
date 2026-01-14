# Maven 安装配置指南

## 问题说明

当前系统检测到 Maven 未安装或未配置环境变量，需要先安装 Maven 才能运行后端项目。

## 解决方案一：安装 Maven（推荐）

### 步骤1：下载 Maven

1. 访问 Maven 官网：https://maven.apache.org/download.cgi
2. 下载最新版本的二进制文件（Binary zip archive）
   - 推荐下载：`apache-maven-3.9.x-bin.zip`
   - 注意：不要下载 Source zip archive

### 步骤2：解压 Maven

1. 将下载的 zip 文件解压到一个固定位置
   - 推荐路径：`C:\Program Files\Apache\maven`
   - 或者：`D:\tools\maven`
   - **重要**：路径中不要有中文和空格

2. 解压后的目录结构应该是：
   ```
   C:\Program Files\Apache\maven\
   ├── bin\
   ├── boot\
   ├── conf\
   ├── lib\
   └── ...
   ```

### 步骤3：配置环境变量

#### Windows 10/11 配置步骤：

1. **打开环境变量设置**
   - 右键"此电脑" → "属性"
   - 点击"高级系统设置"
   - 点击"环境变量"

2. **添加 MAVEN_HOME 变量**
   - 在"系统变量"区域点击"新建"
   - 变量名：`MAVEN_HOME`
   - 变量值：Maven 解压路径（例如：`C:\Program Files\Apache\maven`）
   - 点击"确定"

3. **修改 Path 变量**
   - 在"系统变量"中找到 `Path` 变量
   - 点击"编辑"
   - 点击"新建"
   - 添加：`%MAVEN_HOME%\bin`
   - 点击"确定"保存所有更改

4. **验证安装**
   - 关闭所有命令行窗口
   - 打开新的 PowerShell 或 CMD
   - 执行：`mvn -version`
   - 如果显示版本信息，说明配置成功

### 步骤4：配置 Maven 镜像（可选，但推荐）

为了加快依赖下载速度，可以配置国内镜像：

1. 打开 Maven 配置文件：
   ```
   C:\Program Files\Apache\maven\conf\settings.xml
   ```

2. 在 `<mirrors>` 标签内添加：
   ```xml
   <mirror>
     <id>aliyun</id>
     <mirrorOf>central</mirrorOf>
     <name>Aliyun Maven</name>
     <url>https://maven.aliyun.com/repository/public</url>
   </mirror>
   ```

## 解决方案二：使用 Maven Wrapper（无需全局安装）

如果不想全局安装 Maven，可以使用 Maven Wrapper。让我为你创建 Maven Wrapper 文件。

### 优点：
- 不需要全局安装 Maven
- 项目自带 Maven，版本统一
- 团队成员环境一致

### 使用方法：
运行 `mvnw.cmd` 代替 `mvn` 命令即可。

## 快速验证

安装完成后，运行以下命令验证：

```bash
mvn -version
```

应该看到类似输出：
```
Apache Maven 3.9.x
Maven home: C:\Program Files\Apache\maven
Java version: 17.0.14
...
```

## 常见问题

### 问题1：命令提示"不是内部或外部命令"

**原因**：环境变量未生效

**解决**：
1. 检查环境变量配置是否正确
2. 确保 Path 中添加了 `%MAVEN_HOME%\bin`
3. **重启命令行窗口**（重要！）
4. 如果还不行，重启电脑

### 问题2：Maven 下载依赖很慢

**解决**：配置国内镜像（见步骤4）

### 问题3：权限问题

**解决**：
- 以管理员身份运行命令行
- 或者将 Maven 安装到用户目录（如：`C:\Users\你的用户名\maven`）

## 安装完成后

安装并配置好 Maven 后：

1. 重新运行 `检查环境.bat` 确认 Maven 已安装
2. 运行 `启动后端.bat` 启动后端服务

## 需要帮助？

如果安装过程中遇到问题，可以：
1. 查看 Maven 官方文档：https://maven.apache.org/install.html
2. 搜索相关错误信息
3. 确保 Java 已正确安装（已确认：Java 17.0.14 ✅）

