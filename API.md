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

响应（示例）：

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
| 创建快递柜 | POST | `/api/cabinets` | 是 | JSON：`cabinetCode`(必填)、`location`(可选)、`totalCompartments`(可选，默认8)、`powerConsumption`(可选，默认0)、`status`(可选，默认1；0禁用/1启用) | `Cabinet` |
| 更新快递柜信息 | PUT | `/api/cabinets/{id}` | 是 | 路径：`id`；JSON：`location`(可选)、`powerConsumption`(可选) | `Cabinet` |
| 更新快递柜状态 | PUT | `/api/cabinets/{id}/status` | 是 | 路径：`id`；JSON：`status`(必填，0/1) | `Cabinet` |
| 删除快递柜 | DELETE | `/api/cabinets/{id}` | 是 | `id`(路径参数) | `string`（固定为“删除成功”） |
| 更新仓门状态 | PUT | `/api/cabinets/compartments/{compartmentId}/status` | 是 | 路径：`compartmentId`；JSON：`status`(必填，0故障/1正常) | `Compartment` |
| 远程开仓（模拟） | POST | `/api/cabinets/compartments/{compartmentId}/open` | 是 | `compartmentId`(路径参数) | `string`（固定为“开仓成功”） |

### 获取快递柜列表示例

请求：

```bash
curl "http://localhost:8080/api/cabinets" \
  -H "Authorization: Bearer <token>"
```

响应（示例）：

```json
{
  "code": 200,
  "message": "成功",
  "data": [
    {
      "id": 1,
      "cabinetCode": "CAB001",
      "location": "北京市朝阳区XX街道XX号",
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
| 我的订单列表（当前登录用户） | GET | `/api/orders/me` | 是 | Query：`status`(可选，0待取/1已取/2超时) | `ExpressOrder[]` |
| 我的派送订单（快递员） | GET | `/api/orders/courier/me` | 是 | Query：`status`(可选，0待取/1已取/2超时) | `ExpressOrder[]`（需要 `userType=1`，否则 `code=403`） |
| 按快递柜查询订单 | GET | `/api/orders/cabinet/{cabinetId}` | 是 | `cabinetId`(路径参数) | `ExpressOrder[]` |
| 按状态查询订单 | GET | `/api/orders/status/{status}` | 是 | `status`(路径参数，0待取/1已取/2超时) | `ExpressOrder[]` |
| 按取件码查询订单 | GET | `/api/orders/pick-code/{pickCode}` | 是 | `pickCode`(路径参数) | `ExpressOrder` |
| 创建订单 | POST | `/api/orders` | 是 | JSON：`orderNo`(必填)、`cabinetId`(必填)、`compartmentId`(必填)、`receiverName`(必填)、`receiverPhone`(必填)、`receiverUserId`(可选)、`courierId`(可选)、`senderName`(可选)、`senderPhone`(可选)、`orderType`(必填，0入柜/1寄存/2发件) | `ExpressOrder`（后端生成 `pickCode` 等字段） |
| 快递员创建投递订单（入柜） | POST | `/api/orders/courier/deliver` | 是 | JSON：同创建订单，但 `orderType` 会固定为 0 且 `courierId` 取当前用户 | `ExpressOrder`（需要 `userType=1`，否则 `code=403`） |
| 取件 | POST | `/api/orders/pick-up` | 是 | JSON：`pickCode`(必填) | `ExpressOrder` |

### 创建订单与取件流程说明

创建订单：
- `POST /api/orders` 创建订单时，后端会为订单生成 `pickCode`（取件码），并将对应仓门的 `hasItem` 标记为 1
- 创建订单会做关键校验：订单号唯一性、快递柜启用状态、仓门归属一致、仓门可用（`status=1` 且 `hasItem=0`）
- 订单默认过期时间为 3 天

取件：
- `POST /api/orders/pick-up` 提交 `pickCode`，取件成功后会更新订单状态，并释放仓门（hasItem 置回 0）

## 统计接口

| 接口名称 | 方法 | 路径 | 是否需要登录 | 路径/请求参数 | 返回 data |
|---|---|---|---|---|---|
| 获取系统统计 | GET | `/api/stats` | 是 | 无 | `totalCabinets`、`totalOrders`、`pendingOrders`、`completedOrders`、`timeoutOrders` |

## 用户端 App 接口（已实现）

| 接口名称 | 方法 | 路径 | 是否需要登录 | 路径/请求参数 | 返回 data |
|---|---|---|---|---|---|
| 获取个人信息 | GET | `/api/auth/me` | 是 | 无 | `userId`、`username`、`phone`、`realName`、`userType`、`status` |
| 修改个人信息 | PUT | `/api/users/me` | 是 | JSON：`phone`(可选)、`realName`(可选)、`password`(可选) | `userId`、`username`、`phone`、`realName`、`userType`、`status` |
| 我的订单列表 | GET | `/api/orders/me` | 是 | Query：`status`(可选) | `ExpressOrder[]` |
| 根据取件码查询订单 | GET | `/api/orders/pick-code/{pickCode}` | 是 | `pickCode`(路径参数) | `ExpressOrder` |
| 用户取件 | POST | `/api/orders/pick-up` | 是 | JSON：`pickCode`(必填) | `ExpressOrder` |
| 用户寄件/寄存下单 | POST | `/api/orders` | 是 | JSON：创建订单参数（`orderType`=1 寄存 / 2 发件） | `ExpressOrder` |
| 查询快递柜列表 | GET | `/api/cabinets` | 是 | 无 | `Cabinet[]` |
| 查询某柜可用仓门 | GET | `/api/cabinets/{cabinetId}/compartments/available` | 是 | `cabinetId`(路径参数) | `Compartment[]` |

## 用户端 App 接口（未实现）

| 接口名称 | 方法 | 路径 | 是否需要登录 | 路径/请求参数 | 返回 data |
|---|---|---|---|---|---|
| 查询附近快递柜 | GET | `/api/cabinets/nearby` | 是 | Query：`latitude`(必填)、`longitude`(必填)、`radius`(可选) | `Cabinet[]` |
| 按距离排序快递柜 | GET | `/api/cabinets/sort-by-distance` | 是 | Query：`latitude`(必填)、`longitude`(必填) | `Cabinet[]` |

## 骑手/快递员端 App 接口（已实现）

| 接口名称 | 方法 | 路径 | 是否需要登录 | 路径/请求参数 | 返回 data |
|---|---|---|---|---|---|
| 获取个人信息 | GET | `/api/auth/me` | 是 | 无 | `userId`、`username`、`phone`、`realName`、`userType`、`status` |
| 我的派送订单 | GET | `/api/orders/courier/me` | 是 | Query：`status`(可选) | `ExpressOrder[]` |
| 按手机号/收件人查询 | GET | `/api/orders/phone/{phone}` | 是 | `phone`(路径参数) | `ExpressOrder[]` |
| 快递员创建投递订单（入柜） | POST | `/api/orders/courier/deliver` | 是 | JSON：创建订单参数（`orderType` 固定为 0） | `ExpressOrder` |
| 查询某柜可用仓门 | GET | `/api/cabinets/{cabinetId}/compartments/available` | 是 | `cabinetId`(路径参数) | `Compartment[]` |
| 远程开仓（投递/取回） | POST | `/api/cabinets/compartments/{compartmentId}/open` | 是 | `compartmentId`(路径参数) | `string` |
| 仓门故障上报/恢复 | PUT | `/api/cabinets/compartments/{compartmentId}/status` | 是 | JSON：`status`(0故障/1正常) | `Compartment` |
| 快递柜启用/禁用（管理能力） | PUT | `/api/cabinets/{id}/status` | 是 | 路径：`id`；JSON：`status`(0/1) | `Cabinet` |

## 骑手/快递员端 App 接口（未实现）

| 接口名称 | 方法 | 路径 | 是否需要登录 | 路径/请求参数 | 返回 data |
|---|---|---|---|---|---|
| 扫码/取件码核验取件 | POST | `/api/orders/verify-pick-code` | 是 | JSON：`pickCode`(必填) | `ExpressOrder` |

