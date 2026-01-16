-- 创建数据库
CREATE DATABASE IF NOT EXISTS express_cabinet DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE express_cabinet;

SET NAMES utf8mb4;

SET NAMES utf8mb4;

-- 用户表（普通用户和快递员）
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    phone VARCHAR(20) UNIQUE NOT NULL COMMENT '手机号',
    real_name VARCHAR(50) COMMENT '真实姓名',
    user_type TINYINT NOT NULL DEFAULT 0 COMMENT '用户类型：0-普通用户，1-快递员',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_user_type (user_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 快递柜表
CREATE TABLE IF NOT EXISTS cabinets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cabinet_code VARCHAR(50) UNIQUE NOT NULL COMMENT '快递柜编号',
    location VARCHAR(200) COMMENT '位置',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    total_compartments INT NOT NULL DEFAULT 8 COMMENT '总仓数',
    power_consumption DECIMAL(10,2) DEFAULT 0 COMMENT '日用电量（度）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cabinet_code (cabinet_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='快递柜表';

-- 仓门表
CREATE TABLE IF NOT EXISTS compartments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cabinet_id BIGINT NOT NULL COMMENT '快递柜ID',
    compartment_no INT NOT NULL COMMENT '仓门编号（1-8）',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-故障/禁用，1-正常',
    has_item TINYINT NOT NULL DEFAULT 0 COMMENT '是否有物品：0-无，1-有',
    temperature DECIMAL(5,2) COMMENT '温度（部分仓有）',
    humidity DECIMAL(5,2) COMMENT '湿度（部分仓有）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_cabinet_compartment (cabinet_id, compartment_no),
    FOREIGN KEY (cabinet_id) REFERENCES cabinets(id) ON DELETE CASCADE,
    INDEX idx_cabinet_id (cabinet_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='仓门表';

-- 快递表
CREATE TABLE IF NOT EXISTS express_orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '快递单号',
    cabinet_id BIGINT NOT NULL COMMENT '快递柜ID',
    compartment_id BIGINT NOT NULL COMMENT '仓门ID',
    sender_name VARCHAR(50) COMMENT '发件人姓名',
    sender_phone VARCHAR(20) COMMENT '发件人手机号',
    receiver_name VARCHAR(50) NOT NULL COMMENT '收件人姓名',
    receiver_phone VARCHAR(20) NOT NULL COMMENT '收件人手机号',
    receiver_user_id BIGINT COMMENT '收件人用户ID',
    courier_id BIGINT COMMENT '快递员ID',
    pick_code VARCHAR(10) NOT NULL COMMENT '取件码',
    order_type TINYINT NOT NULL DEFAULT 0 COMMENT '订单类型：0-快递入柜，1-用户寄存，2-用户发快递',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-待取件，1-已取件，2-已超时',
    put_in_time DATETIME COMMENT '放入时间',
    pick_up_time DATETIME COMMENT '取件时间',
    expire_time DATETIME COMMENT '过期时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cabinet_id) REFERENCES cabinets(id),
    FOREIGN KEY (compartment_id) REFERENCES compartments(id),
    FOREIGN KEY (receiver_user_id) REFERENCES users(id),
    FOREIGN KEY (courier_id) REFERENCES users(id),
    INDEX idx_order_no (order_no),
    INDEX idx_pick_code (pick_code),
    INDEX idx_receiver_phone (receiver_phone),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='快递订单表';

-- 插入测试数据
INSERT INTO users (username, password, phone, real_name, user_type, status) VALUES
('admin', '$2b$10$SIuQXUW2IH7NxO57b/EPjulaEN7tlu3zy6nVPgW2gJKBPiQTwhIh.', '13800138000', '管理员', 0, 1),
('courier1', '$2b$10$SIuQXUW2IH7NxO57b/EPjulaEN7tlu3zy6nVPgW2gJKBPiQTwhIh.', '13800138001', '快递员1', 1, 1),
('user1', '$2b$10$SIuQXUW2IH7NxO57b/EPjulaEN7tlu3zy6nVPgW2gJKBPiQTwhIh.', '13800138002', '用户1', 0, 1);

-- 密码都是：123456

INSERT INTO cabinets (cabinet_code, location, status, total_compartments) VALUES
('CAB001', '北京市朝阳区XX街道XX号', 1, 8),
('CAB002', '北京市海淀区XX街道XX号', 1, 8);

INSERT INTO compartments (cabinet_id, compartment_no, status, has_item) VALUES
(1, 1, 1, 0), (1, 2, 1, 0), (1, 3, 1, 0), (1, 4, 1, 0),
(1, 5, 1, 0), (1, 6, 1, 0), (1, 7, 1, 0), (1, 8, 1, 0),
(2, 1, 1, 0), (2, 2, 1, 0), (2, 3, 1, 0), (2, 4, 1, 0),
(2, 5, 1, 0), (2, 6, 1, 0), (2, 7, 1, 0), (2, 8, 1, 0);
