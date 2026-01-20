# API 接口文档

## 基本约定

- 基础路径：`/api`
- 返回结构：`{ code: number, message: string, data: any }`
- 请求头（登录后）：`Authorization: Bearer <token>`
- code 说明：
  - `200`：成功
  - `401`：未登录或 token 无效/过期
  - `403`：已登录但无权限（例如快递员专属接口）
  - `500`：业务异常或参数错误（message 为错误原因）

注意：
- 当前实现中业务异常可能仍返回 HTTP 200，但 `code=500`；客户端应以 `code` 判断业务成功/失败（Web 端已做统一拦截处理）。
- 后端已对除 `/api/auth/login`、`/api/auth/register` 外的接口做统一鉴权拦截；请求需携带 `Authorization: Bearer <token>`，否则返回 `code=401`。

## 数据字典

### 用户类型（userType）

| 值 | 含义 |
|---|---|
| 0 | 普通用户 |
| 1 | 快递员 |

### 用户状态（status）

| 值 | 含义 |
|---:|---|
| 0 | 禁用 |
| 1 | 启用 |

### 快递柜/仓门状态

| 字段 | 值 | 含义 |
|---|---:|---|
| Cabinet.status | 0 | 禁用 |
| Cabinet.status | 1 | 启用 |
| Compartment.status | 0 | 故障/禁用 |
| Compartment.status | 1 | 正常 |
| Compartment.hasItem | 0 | 空仓 |
| Compartment.hasItem | 1 | 有物品 |

### 订单状态与类型

| 字段 | 值 | 含义 |
|---|---:|---|
| ExpressOrder.status | 0 | 待取件 |
| ExpressOrder.status | 1 | 已取件 |
| ExpressOrder.status | 2 | 已超时 |
| ExpressOrder.orderType | 0 | 快递入柜（快递员投递） |
| ExpressOrder.orderType | 1 | 用户寄存 |
| ExpressOrder.orderType | 2 | 用户发件 |

## 认证接口

| 接口名称 | 方法 | 路径 | 是否需要登录 | 请求参数（JSON） | 返回 data |
|---|---|---|---|---|---|
| 用户注册 | POST | `/api/auth/register` | 否 | `username`(必填)、`password`(必填)、`phone`(必填)、`realName`(可选)、`userType`(可选，0普通用户/1快递员) | `userId`、`username`、`userType`、`token` |
| 用户登录 | POST | `/api/auth/login` | 否 | `username`(必填)、`password`(必填) | `userId`、`username`、`userType`、`token` |
| 获取当前登录用户 | GET | `/api/auth/me` | 是 | 无 | `userId`、`username`、`phone`、`realName`、`userType`、`status` |

### 用户登录示例

请求：

```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

响应：

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "userId": 1,
    "username": "admin",
    "userType": 0,
    "token": "eyJhbGciOiJIUzUxMiJ9..."
  }
}
```

## 快递柜接口

| 接口名称 | 方法 | 路径 | 是否需要登录 | 路径/请求参数 | 返回 data |
|---|---|---|---|---|---|
| 获取快递柜列表 | GET | `/api/cabinets` | 是 | 无 | `Cabinet[]` |
| 获取快递柜详情 | GET | `/api/cabinets/{id}` | 是 | `id`(路径参数) | `Cabinet` |
| 按编号查询快递柜 | GET | `/api/cabinets/code/{cabinetCode}` | 是 | `cabinetCode`(路径参数) | `Cabinet` |
| 获取仓门列表 | GET | `/api/cabinets/{cabinetId}/compartments` | 是 | `cabinetId`(路径参数) | `Compartment[]` |
| 获取可用仓门 | GET | `/api/cabinets/{cabinetId}/compartments/available` | 是 | `cabinetId`(路径参数) | `Compartment[]` |
| 创建快递柜 | POST | `/api/cabinets` | 是 | JSON：`cabinetCode`(必填)、`location`(可选)、`latitude`(可选)、`longitude`(可选)、`totalCompartments`(可选，默认8)、`powerConsumption`(可选，默认0)、`status`(可选，默认1) | `Cabinet` |
| 更新快递柜信息 | PUT | `/api/cabinets/{id}` | 是 | 路径：`id`；JSON：`location`(可选)、`powerConsumption`(可选) | `Cabinet` |
| 更新快递柜状态 | PUT | `/api/cabinets/{id}/status` | 是 | 路径：`id`；JSON：`status`(必填，0/1) | `Cabinet` |
| 删除快递柜 | DELETE | `/api/cabinets/{id}` | 是 | `id`(路径参数) | `string`（固定为“删除成功”） |
| 查询附近快递柜 | GET | `/api/cabinets/nearby` | 是 | Query：`latitude`(必填)、`longitude`(必填)、`radius`(可选，默认5.0km) | `Cabinet[]` |
| 按距离排序快递柜 | GET | `/api/cabinets/sort-by-distance` | 是 | Query：`latitude`(必填)、`longitude`(必填) | `Cabinet[]` |
| 更新仓门状态 | PUT | `/api/cabinets/compartments/{compartmentId}/status` | 是 | 路径：`compartmentId`；JSON：`status`(必填，0故障/1正常) | `Compartment` |
| 远程开仓（模拟） | POST | `/api/cabinets/compartments/{compartmentId}/open` | 是 | `compartmentId`(路径参数) | `string`（固定为“开仓成功”） |

### 附近快递柜示例

请求：

```bash
curl "http://localhost:8080/api/cabinets/nearby?latitude=39.9042&longitude=116.4074&radius=10" \
  -H "Authorization: Bearer <token>"
```

响应：

```json
{
  "code": 200,
  "message": "成功",
  "data": [
    {
      "id": 1,
      "cabinetCode": "CAB001",
      "location": "北京市朝阳区XX街道XX号",
      "latitude": 39.904200,
      "longitude": 116.407400,
      "status": 1,
      "totalCompartments": 8
    }
  ]
}
```

## 订单接口

| 接口名称 | 方法 | 路径 | 是否需要登录 | 路径/请求参数 | 返回 data |
|---|---|---|---|---|---|
| 获取订单列表 | GET | `/api/orders` | 是 | 无 | `ExpressOrder[]` |
| 按手机号查询订单 | GET | `/api/orders/phone/{phone}` | 是 | `phone`(路径参数) | `ExpressOrder[]` |
| 按用户ID查询订单 | GET | `/api/orders/user/{userId}` | 是 | `userId`(路径参数) | `ExpressOrder[]` |
| 我的订单列表 | GET | `/api/orders/me` | 是 | Query：`status`(可选，0待取/1已取/2超时) | `ExpressOrder[]` |
| 我的派送订单 | GET | `/api/orders/courier/me` | 是 | Query：`status`(可选) | `ExpressOrder[]`（需要 `userType=1`） |
| 按快递柜查询订单 | GET | `/api/orders/cabinet/{cabinetId}` | 是 | `cabinetId`(路径参数) | `ExpressOrder[]` |
| 按状态查询订单 | GET | `/api/orders/status/{status}` | 是 | `status`(路径参数) | `ExpressOrder[]` |
| 按取件码查询订单 | GET | `/api/orders/pick-code/{pickCode}` | 是 | `pickCode`(路径参数) | `ExpressOrder` |
| 取件码核验 | POST | `/api/orders/verify-pick-code` | 是 | JSON：`pickCode`(必填) | `ExpressOrder` |
| 创建订单 | POST | `/api/orders` | 是 | JSON：`orderNo`(必填)、`cabinetId`(必填)、`compartmentId`(必填)、`receiverName`(必填)、`receiverPhone`(必填)、`receiverUserId`(可选)、`courierId`(可选)、`senderName`(可选)、`senderPhone`(可选)、`orderType`(必填) | `ExpressOrder` |
| 快递员投递（入柜） | POST | `/api/orders/courier/deliver` | 是 | JSON：同创建订单（`orderType`固定为0） | `ExpressOrder`（需要 `userType=1`） |
| 取件 | POST | `/api/orders/pick-up` | 是 | JSON：`pickCode`(必填) | `ExpressOrder` |

### 取件码核验示例

请求：

```bash
curl -X POST "http://localhost:8080/api/orders/verify-pick-code" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"pickCode": "123456"}'
```

响应：

```json
{
  "code": 200,
  "message": "核验成功",
  "data": {
    "id": 1,
    "orderNo": "ORD202601200001",
    "pickCode": "123456",
    "status": 0,
    "cabinetId": 1,
    "compartmentId": 1,
    "receiverName": "张三",
    "receiverPhone": "13800138000"
  }
}
```

## 统计接口

| 接口名称 | 方法 | 路径 | 是否需要登录 | 路径/请求参数 | 返回 data |
|---|---|---|---|---|---|
| 获取系统统计 | GET | `/api/stats` | 是 | 无 | 见下方示例 |

### 统计数据示例

响应：

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "totalCabinets": 10,
    "enabledCabinets": 8,
    "disabledCabinets": 2,
    "totalCompartments": 80,
    "faultCompartments": 1,
    "occupiedCompartments": 15,
    "totalPowerConsumption": 123.45,
    "totalOrders": 100,
    "pendingOrders": 10,
    "completedOrders": 85,
    "timeoutOrders": 5
  }
}
```

## 用户/快递员管理接口（Web 管理端）

| 接口名称 | 方法 | 路径 | 是否需要登录 | 路径/请求参数 | 返回 data |
|---|---|---|---|---|---|
| 管理员查询用户列表 | GET | `/api/users/admin/list` | 是 | Query：`userType`(可选)、`status`(可选)、`keyword`(可选) | `User[]` |
| 管理员新增用户 | POST | `/api/users/admin` | 是 | JSON：`username`(必填)、`password`(必填)、`phone`(必填)、`realName`(可选)、`userType`(可选)、`status`(可选) | `User` |
| 管理员更新用户 | PUT | `/api/users/admin/{id}` | 是 | 路径：`id`；JSON：`phone`(可选)、`realName`(可选)、`password`(可选)、`userType`(可选)、`status`(可选) | `User` |

### 管理员新增用户示例

请求：

```bash
curl -X POST "http://localhost:8080/api/users/admin" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "courier2",
    "password": "password123",
    "phone": "13900139000",
    "realName": "李四",
    "userType": 1,
    "status": 1
  }'
```

响应：

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "userId": 5,
    "username": "courier2",
    "phone": "13900139000",
    "realName": "李四",
    "userType": 1,
    "status": 1,
    "createdAt": "2026-01-20T14:30:00"
  }
}
```
