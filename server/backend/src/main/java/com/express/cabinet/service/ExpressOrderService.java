package com.express.cabinet.service;

import com.express.cabinet.entity.Compartment;
import com.express.cabinet.entity.ExpressOrder;
import com.express.cabinet.entity.Cabinet;
import com.express.cabinet.repository.CabinetRepository;
import com.express.cabinet.repository.CompartmentRepository;
import com.express.cabinet.repository.ExpressOrderRepository;
import com.express.cabinet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpressOrderService {
    private final ExpressOrderRepository expressOrderRepository;
    private final CompartmentRepository compartmentRepository;
    private final CabinetRepository cabinetRepository;
    private final UserRepository userRepository;
    private final Random random = new Random();

    public List<ExpressOrder> getAllOrders() {
        return expressOrderRepository.findAll();
    }

    public List<ExpressOrder> getOrdersByReceiverPhone(String phone) {
        return expressOrderRepository.findByReceiverPhone(phone);
    }

    public List<ExpressOrder> getOrdersByReceiverUserId(Long userId) {
        return expressOrderRepository.findByReceiverUserId(userId);
    }

    public List<ExpressOrder> getOrdersByReceiverUserIdAndStatus(Long userId, Integer status) {
        if (status == null) {
            return getOrdersByReceiverUserId(userId);
        }
        return expressOrderRepository.findByReceiverUserIdAndStatus(userId, status);
    }

    public List<ExpressOrder> getOrdersByCourierId(Long courierId) {
        return expressOrderRepository.findByCourierId(courierId);
    }

    public List<ExpressOrder> getOrdersByCourierIdAndStatus(Long courierId, Integer status) {
        if (status == null) {
            return getOrdersByCourierId(courierId);
        }
        return expressOrderRepository.findByCourierIdAndStatus(courierId, status);
    }

    public List<ExpressOrder> getOrdersByCourierIdAndReceiverPhone(Long courierId, String receiverPhone) {
        if (courierId == null) {
            throw new RuntimeException("快递员ID不能为空");
        }
        if (receiverPhone == null || receiverPhone.trim().isEmpty()) {
            throw new RuntimeException("手机号不能为空");
        }
        String phone = receiverPhone.trim();
        return expressOrderRepository.findByCourierId(courierId).stream()
                .filter(o -> o.getReceiverPhone() != null && o.getReceiverPhone().equals(phone))
                .collect(Collectors.toList());
    }

    public List<ExpressOrder> getOrdersByCabinetId(Long cabinetId) {
        return expressOrderRepository.findByCabinetId(cabinetId);
    }

    public List<ExpressOrder> getOrdersByStatus(Integer status) {
        return expressOrderRepository.findByStatus(status);
    }

    public ExpressOrder getOrderByPickCode(String pickCode) {
        ExpressOrder order = expressOrderRepository.findByPickCode(pickCode)
                .orElseThrow(() -> new RuntimeException("取件码不存在"));
        if (order.getStatus() != null && order.getStatus() == 0 && order.getExpireTime() != null && order.getExpireTime().isBefore(LocalDateTime.now())) {
            order.setStatus(2);
            expressOrderRepository.save(order);
        }
        return order;
    }

    public ExpressOrder verifyPickCode(String pickCode) {
        ExpressOrder order = getOrderByPickCode(pickCode);
        
        if (order.getStatus() == 1) {
            throw new RuntimeException("快递已被取走");
        }
        
        if (order.getStatus() == 2) {
            throw new RuntimeException("快递已超时");
        }

        if (order.getExpireTime() != null && order.getExpireTime().isBefore(LocalDateTime.now())) {
            order.setStatus(2);
            expressOrderRepository.save(order);
            throw new RuntimeException("快递已超时");
        }
        
        return order;
    }

    @Transactional
    public ExpressOrder createOrder(ExpressOrder order) {
        if (order == null) {
            throw new RuntimeException("参数不能为空");
        }
        if (order.getOrderNo() == null || order.getOrderNo().trim().isEmpty()) {
            throw new RuntimeException("订单号不能为空");
        }
        order.setOrderNo(order.getOrderNo().trim());
        if (expressOrderRepository.findByOrderNo(order.getOrderNo()).isPresent()) {
            throw new RuntimeException("订单号已存在");
        }
        if (order.getCabinetId() == null) {
            throw new RuntimeException("快递柜ID不能为空");
        }
        if (order.getCompartmentId() == null) {
            throw new RuntimeException("仓门ID不能为空");
        }
        if (order.getReceiverName() == null || order.getReceiverName().trim().isEmpty()) {
            throw new RuntimeException("收件人不能为空");
        }
        order.setReceiverName(order.getReceiverName().trim());
        if (order.getReceiverPhone() == null || order.getReceiverPhone().trim().isEmpty()) {
            throw new RuntimeException("收件人手机号不能为空");
        }
        order.setReceiverPhone(order.getReceiverPhone().trim());
        if (order.getOrderType() == null) {
            throw new RuntimeException("订单类型不能为空");
        }

        if (order.getReceiverUserId() == null && order.getReceiverPhone() != null) {
            userRepository.findByPhone(order.getReceiverPhone()).ifPresent(u -> order.setReceiverUserId(u.getId()));
        }

        Cabinet cabinet = cabinetRepository.findById(order.getCabinetId())
                .orElseThrow(() -> new RuntimeException("快递柜不存在"));
        if (cabinet.getStatus() != null && cabinet.getStatus() == 0) {
            throw new RuntimeException("快递柜已禁用，无法创建订单");
        }

        // 检查仓门是否可用
        Compartment compartment = compartmentRepository.findById(order.getCompartmentId())
                .orElseThrow(() -> new RuntimeException("仓门不存在"));
        if (!order.getCabinetId().equals(compartment.getCabinetId())) {
            throw new RuntimeException("仓门与快递柜不匹配");
        }
        
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
        order.setCompartmentNo(compartment.getCompartmentNo());

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

        if (order.getExpireTime() != null && order.getExpireTime().isBefore(LocalDateTime.now())) {
            order.setStatus(2);
            expressOrderRepository.save(order);
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

