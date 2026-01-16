package com.express.cabinet.entity;

import lombok.Data;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cabinets")
@Data
public class Cabinet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cabinet_code", unique = true, nullable = false, length = 50)
    private String cabinetCode;

    @Column(length = 200)
    private String location;

    @Column(nullable = false)
    private Integer status; // 0-禁用，1-启用

    @Column(name = "total_compartments", nullable = false)
    private Integer totalCompartments;

    @Column(name = "power_consumption", precision = 10, scale = 2)
    private BigDecimal powerConsumption;

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

