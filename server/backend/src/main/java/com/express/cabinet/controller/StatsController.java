package com.express.cabinet.controller;

import com.express.cabinet.dto.ApiResponse;
import com.express.cabinet.repository.CabinetRepository;
import com.express.cabinet.repository.ExpressOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
public class StatsController {
    private final CabinetRepository cabinetRepository;
    private final ExpressOrderRepository expressOrderRepository;

    @GetMapping
    public ApiResponse<Map<String, Object>> getStats() {
        long totalCabinets = cabinetRepository.count();
        long totalOrders = expressOrderRepository.count();
        long pendingOrders = expressOrderRepository.countByStatus(0);
        long completedOrders = expressOrderRepository.countByStatus(1);
        long timeoutOrders = expressOrderRepository.countByStatus(2);

        Map<String, Object> data = new HashMap<>();
        data.put("totalCabinets", totalCabinets);
        data.put("totalOrders", totalOrders);
        data.put("pendingOrders", pendingOrders);
        data.put("completedOrders", completedOrders);
        data.put("timeoutOrders", timeoutOrders);
        return ApiResponse.success(data);
    }
}

