package com.express.cabinet.controller;

import com.express.cabinet.dto.ApiResponse;
import com.express.cabinet.repository.CabinetRepository;
import com.express.cabinet.repository.CompartmentRepository;
import com.express.cabinet.repository.ExpressOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
public class StatsController {
    private final CabinetRepository cabinetRepository;
    private final CompartmentRepository compartmentRepository;
    private final ExpressOrderRepository expressOrderRepository;

    @GetMapping
    public ApiResponse<Map<String, Object>> getStats() {
        long totalCabinets = cabinetRepository.count();
        long enabledCabinets = cabinetRepository.countByStatus(1);
        long disabledCabinets = cabinetRepository.countByStatus(0);

        long totalCompartments = compartmentRepository.count();
        long faultCompartments = compartmentRepository.countByStatus(0);
        long occupiedCompartments = compartmentRepository.countByHasItem(1);

        long totalOrders = expressOrderRepository.count();
        long pendingOrders = expressOrderRepository.countByStatus(0);
        long completedOrders = expressOrderRepository.countByStatus(1);
        long timeoutOrders = expressOrderRepository.countByStatus(2);

        BigDecimal totalPowerConsumption = cabinetRepository.findAll().stream()
                .map(c -> c.getPowerConsumption() == null ? BigDecimal.ZERO : c.getPowerConsumption())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> data = new HashMap<>();
        data.put("totalCabinets", totalCabinets);
        data.put("enabledCabinets", enabledCabinets);
        data.put("disabledCabinets", disabledCabinets);
        data.put("totalCompartments", totalCompartments);
        data.put("faultCompartments", faultCompartments);
        data.put("occupiedCompartments", occupiedCompartments);
        data.put("totalPowerConsumption", totalPowerConsumption);
        data.put("totalOrders", totalOrders);
        data.put("pendingOrders", pendingOrders);
        data.put("completedOrders", completedOrders);
        data.put("timeoutOrders", timeoutOrders);
        return ApiResponse.success(data);
    }
}

