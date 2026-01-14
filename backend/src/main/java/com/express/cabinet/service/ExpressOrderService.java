package com.express.cabinet.service;

import com.express.cabinet.entity.Compartment;
import com.express.cabinet.entity.ExpressOrder;
import com.express.cabinet.repository.CompartmentRepository;
import com.express.cabinet.repository.ExpressOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class ExpressOrderService {
    private final ExpressOrderRepository expressOrderRepository;
    private final CompartmentRepository compartmentRepository;
    private final Random random = new Random();

    public List<ExpressOrder> getOrdersByReceiverPhone(String phone) {
        return expressOrderRepository.findByReceiverPhone(phone);
    }

    public List<ExpressOrder> getOrdersByReceiverUserId(Long userId) {
        return expressOrderRepository.findByReceiverUserId(userId);
    }

    public ExpressOrder getOrderByPickCode(String pickCode) {
        return expressOrderRepository.findByPickCode(pickCode)
                .orElseThrow(() -> new RuntimeException("取件码不存在"));
    }

    @Transactional
    public ExpressOrder createOrder(ExpressOrder order) {
        // 检查仓门是否可用
        Compartment compartment = compartmentRepository.findById(order.getCompartmentId())
                .orElseThrow(() -> new RuntimeException("仓门不存在"));
        
        if (compartment.getStatus() == 0) {
            throw new RuntimeException("仓门故障，无法使用");
        }
        
        if (compartment.getHasItem() == 1) {
            throw new RuntimeException("仓门已有物品");
        }

        // 生成取件码
        String pickCode = generatePickCode();
        order.setPickCode(pickCode);
        order.setStatus(0);
        order.setPutInTime(LocalDateTime.now());
        order.setExpireTime(LocalDateTime.now().plusDays(3));

        ExpressOrder saved = expressOrderRepository.save(order);

        // 更新仓门状态
        compartment.setHasItem(1);
        compartmentRepository.save(compartment);

        return saved;
    }

    @Transactional
    public ExpressOrder pickUpOrder(String pickCode) {
        ExpressOrder order = getOrderByPickCode(pickCode);
        
        if (order.getStatus() == 1) {
            throw new RuntimeException("快递已被取走");
        }
        
        if (order.getStatus() == 2) {
            throw new RuntimeException("快递已超时");
        }

        order.setStatus(1);
        order.setPickUpTime(LocalDateTime.now());
        ExpressOrder saved = expressOrderRepository.save(order);

        // 更新仓门状态
        Compartment compartment = compartmentRepository.findById(order.getCompartmentId())
                .orElseThrow(() -> new RuntimeException("仓门不存在"));
        compartment.setHasItem(0);
        compartmentRepository.save(compartment);

        return saved;
    }

    private String generatePickCode() {
        // 生成6位数字取件码
        int code = 100000 + random.nextInt(900000);
        String pickCode = String.valueOf(code);
        
        // 检查是否重复
        while (expressOrderRepository.findByPickCode(pickCode).isPresent()) {
            code = 100000 + random.nextInt(900000);
            pickCode = String.valueOf(code);
        }
        
        return pickCode;
    }
}

