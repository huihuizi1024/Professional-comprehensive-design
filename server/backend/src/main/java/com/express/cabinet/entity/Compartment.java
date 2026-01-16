package com.express.cabinet.entity;

import lombok.Data;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "compartments")
@Data
public class Compartment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cabinet_id", nullable = false)
    private Long cabinetId;

    @Column(name = "compartment_no", nullable = false)
    private Integer compartmentNo;

    @Column(nullable = false)
    private Integer status; // 0-故障/禁用，1-正常

    @Column(name = "has_item", nullable = false)
    private Integer hasItem; // 0-无，1-有

    @Column(precision = 5, scale = 2)
    private BigDecimal temperature;

    @Column(precision = 5, scale = 2)
    private BigDecimal humidity;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

