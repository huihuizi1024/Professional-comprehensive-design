# API 接口文档

## 基本约定

- 基础路径：`/api`
- 返回结构：`{ code: number, message: string, data: any }`
- 请求头（登录后）：`Authorization: Bearer <token>`
- code 说明：
  - `200`：成功
  - `500`：业务异常或参数错误（message 为错误原因）

说明：
- 当前版本已生成 JWT token，但后端未对所有接口做统一的鉴权拦截；前端页面访问控制主要由前端路由守卫实现。后续如补齐服务端鉴权，建议统一在后端增加拦截器/过滤器校验 `Authorization`。

## 认证接口

| 接口名称 | 方法 | 路径 | 是否需要登录 | 请求参数（JSON） | 返回 data |
|---|---|---|---|---|---|
| 用户注册 | POST | `/api/auth/register` | 否 | `username`(必填)、`password`(必填)、`phone`(必填)、`realName`(可选)、`userType`(可选，0普通用户/1快递员) | `userId`、`username`、`userType`、`token` |
| 用户登录 | POST | `/api/auth/login` | 否 | `username`(必填)、`password`(必填) | `userId`、`username`、`userType`、`token` |

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
| 创建快递柜 | POST | `/api/cabinets` | 是 | JSON：`cabinetCode`(必填)、`location`(可选)、`totalCompartments`(必填)、`powerConsumption`(可选)、`status`(可选，0禁用/1启用) | `Cabinet` |
| 更新快递柜状态 | PUT | `/api/cabinets/{id}/status` | 是 | 路径：`id`；JSON：`status`(必填，0/1) | `Cabinet` |
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
| 按手机号查询订单 | GET | `/api/orders/phone/{phone}` | 是 | `phone`(路径参数) | `ExpressOrder[]` |
| 按用户ID查询订单 | GET | `/api/orders/user/{userId}` | 是 | `userId`(路径参数) | `ExpressOrder[]` |
| 按取件码查询订单 | GET | `/api/orders/pick-code/{pickCode}` | 是 | `pickCode`(路径参数) | `ExpressOrder` |
| 创建订单 | POST | `/api/orders` | 是 | JSON：`orderNo`(必填)、`cabinetId`(必填)、`compartmentId`(必填)、`receiverName`(必填)、`receiverPhone`(必填)、`receiverUserId`(可选)、`courierId`(可选)、`senderName`(可选)、`senderPhone`(可选)、`orderType`(必填，0入柜/1寄存/2发件) | `ExpressOrder`（后端生成 `pickCode` 等字段） |
| 取件 | POST | `/api/orders/pick-up` | 是 | JSON：`pickCode`(必填) | `ExpressOrder` |

### 创建订单与取件流程说明

创建订单：
- `POST /api/orders` 创建订单时，后端会为订单生成 `pickCode`（取件码），并将对应仓门的 `hasItem` 标记为 1
- 订单默认过期时间为 3 天

取件：
- `POST /api/orders/pick-up` 提交 `pickCode`，取件成功后会更新订单状态，并释放仓门（hasItem 置回 0）

