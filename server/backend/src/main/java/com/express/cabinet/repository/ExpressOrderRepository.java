package com.express.cabinet.repository;

import com.express.cabinet.entity.ExpressOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpressOrderRepository extends JpaRepository<ExpressOrder, Long> {
    Optional<ExpressOrder> findByOrderNo(String orderNo);
    Optional<ExpressOrder> findByPickCode(String pickCode);
    List<ExpressOrder> findByReceiverPhone(String receiverPhone);
    List<ExpressOrder> findByReceiverUserId(Long receiverUserId);
    List<ExpressOrder> findByReceiverUserIdAndStatus(Long receiverUserId, Integer status);
    List<ExpressOrder> findByCourierId(Long courierId);
    List<ExpressOrder> findByCourierIdAndStatus(Long courierId, Integer status);
    List<ExpressOrder> findByCabinetId(Long cabinetId);
    List<ExpressOrder> findByStatus(Integer status);
    long countByStatus(Integer status);
}

