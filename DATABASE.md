# 数据库文档

## 总览

- 数据库：MySQL 8.0
- 默认库名：`express_cabinet`
- 初始化脚本：`server/database/init.sql`（字符集 `utf8mb4`）
- 后端连接配置：`server/backend/src/main/resources/application.yml`

## 快速初始化（Docker）

在项目根目录执行：

```bash
docker run --name express-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -p 3306:3306 \
  -v "$(pwd)/server/database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro" \
  -d mysql:8.0
```

验证是否初始化成功：

```bash
docker exec express-mysql mysql -uroot -proot -e "SHOW DATABASES; USE express_cabinet; SHOW TABLES;"
```

## 表结构

### users（用户表）

| 字段 | 类型 | 约束/默认 | 说明 |
|---|---|---|---|
| id | BIGINT | PK，自增 | 主键 |
| username | VARCHAR(50) | UNIQUE，NOT NULL | 用户名 |
| password | VARCHAR(255) | NOT NULL | 密码（BCrypt） |
| phone | VARCHAR(20) | UNIQUE，NOT NULL | 手机号 |
| real_name | VARCHAR(50) | 可空 | 真实姓名 |
| user_type | TINYINT | NOT NULL，默认 0 | 用户类型：0普通用户，1快递员 |
| status | TINYINT | NOT NULL，默认 1 | 状态：0禁用，1启用 |
| created_at | DATETIME | 默认当前时间 | 创建时间 |
| updated_at | DATETIME | 默认当前时间，自动更新 | 更新时间 |

### cabinets（快递柜表）

| 字段 | 类型 | 约束/默认 | 说明 |
|---|---|---|---|
| id | BIGINT | PK，自增 | 主键 |
| cabinet_code | VARCHAR(50) | UNIQUE，NOT NULL | 快递柜编号 |
| location | VARCHAR(200) | 可空 | 位置 |
| status | TINYINT | NOT NULL，默认 1 | 状态：0禁用，1启用 |
| total_compartments | INT | NOT NULL，默认 8 | 总仓数 |
| power_consumption | DECIMAL(10,2) | 默认 0 | 日用电量（度） |
| created_at | DATETIME | 默认当前时间 | 创建时间 |
| updated_at | DATETIME | 默认当前时间，自动更新 | 更新时间 |

### compartments（仓门表）

| 字段 | 类型 | 约束/默认 | 说明 |
|---|---|---|---|
| id | BIGINT | PK，自增 | 主键 |
| cabinet_id | BIGINT | NOT NULL，FK→cabinets.id | 快递柜ID |
| compartment_no | INT | NOT NULL，(cabinet_id, compartment_no) 唯一 | 仓门编号 |
| status | TINYINT | NOT NULL，默认 1 | 状态：0故障/禁用，1正常 |
| has_item | TINYINT | NOT NULL，默认 0 | 是否有物品：0无，1有 |
| temperature | DECIMAL(5,2) | 可空 | 温度（部分仓有） |
| humidity | DECIMAL(5,2) | 可空 | 湿度（部分仓有） |
| created_at | DATETIME | 默认当前时间 | 创建时间 |
| updated_at | DATETIME | 默认当前时间，自动更新 | 更新时间 |

### express_orders（快递订单表）

| 字段 | 类型 | 约束/默认 | 说明 |
|---|---|---|---|
| id | BIGINT | PK，自增 | 主键 |
| order_no | VARCHAR(50) | UNIQUE，NOT NULL | 快递单号 |
| cabinet_id | BIGINT | NOT NULL，FK→cabinets.id | 快递柜ID |
| compartment_id | BIGINT | NOT NULL，FK→compartments.id | 仓门ID |
| sender_name | VARCHAR(50) | 可空 | 发件人姓名 |
| sender_phone | VARCHAR(20) | 可空 | 发件人手机号 |
| receiver_name | VARCHAR(50) | NOT NULL | 收件人姓名 |
| receiver_phone | VARCHAR(20) | NOT NULL | 收件人手机号 |
| receiver_user_id | BIGINT | 可空，FK→users.id | 收件人用户ID |
| courier_id | BIGINT | 可空，FK→users.id | 快递员ID |
| pick_code | VARCHAR(10) | NOT NULL | 取件码 |
| order_type | TINYINT | NOT NULL，默认 0 | 订单类型：0入柜，1寄存，2发件 |
| status | TINYINT | NOT NULL，默认 0 | 状态：0待取件，1已取件，2已超时 |
| put_in_time | DATETIME | 可空 | 放入时间 |
| pick_up_time | DATETIME | 可空 | 取件时间 |
| expire_time | DATETIME | 可空 | 过期时间 |
| created_at | DATETIME | 默认当前时间 | 创建时间 |
| updated_at | DATETIME | 默认当前时间，自动更新 | 更新时间 |
