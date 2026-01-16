package com.express.cabinet.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "express_orders")
@Data
public class ExpressOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_no", unique = true, nullable = false, length = 50)
    private String orderNo;

    @Column(name = "cabinet_id", nullable = false)
    private Long cabinetId;

    @Column(name = "compartment_id", nullable = false)
    private Long compartmentId;

    @Column(name = "sender_name", length = 50)
    private String senderName;

    @Column(name = "sender_phone", length = 20)
    private String senderPhone;

    @Column(name = "receiver_name", nullable = false, length = 50)
    private String receiverName;

    @Column(name = "receiver_phone", nullable = false, length = 20)
    private String receiverPhone;

    @Column(name = "receiver_user_id")
    private Long receiverUserId;

    @Column(name = "courier_id")
    private Long courierId;

    @Column(name = "pick_code", nullable = false, length = 10)
    private String pickCode;

    @Column(name = "order_type", nullable = false)
    private Integer orderType; // 0-快递入柜，1-用户寄存，2-用户发快递

    @Column(nullable = false)
    private Integer status; // 0-待取件，1-已取件，2-已超时

    @Column(name = "put_in_time")
    private LocalDateTime putInTime;

    @Column(name = "pick_up_time")
    private LocalDateTime pickUpTime;

    @Column(name = "expire_time")
    private LocalDateTime expireTime;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (putInTime == null) {
            putInTime = LocalDateTime.now();
        }
        if (expireTime == null) {
            expireTime = LocalDateTime.now().plusDays(3); // 默认3天过期
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

