package com.express.cabinet.controller;

import com.express.cabinet.dto.ApiResponse;
import com.express.cabinet.entity.ExpressOrder;
import com.express.cabinet.service.ExpressOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class ExpressOrderController {
    private final ExpressOrderService expressOrderService;

    @GetMapping("/phone/{phone}")
    public ApiResponse<List<ExpressOrder>> getOrdersByPhone(@PathVariable String phone) {
        return ApiResponse.success(expressOrderService.getOrdersByReceiverPhone(phone));
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<ExpressOrder>> getOrdersByUserId(@PathVariable Long userId) {
        return ApiResponse.success(expressOrderService.getOrdersByReceiverUserId(userId));
    }

    @GetMapping("/pick-code/{pickCode}")
    public ApiResponse<ExpressOrder> getOrderByPickCode(@PathVariable String pickCode) {
        try {
            return ApiResponse.success(expressOrderService.getOrderByPickCode(pickCode));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping
    public ApiResponse<ExpressOrder> createOrder(@RequestBody ExpressOrder order) {
        try {
            return ApiResponse.success("创建订单成功", expressOrderService.createOrder(order));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/pick-up")
    public ApiResponse<ExpressOrder> pickUpOrder(@RequestBody Map<String, String> request) {
        try {
            String pickCode = request.get("pickCode");
            return ApiResponse.success("取件成功", expressOrderService.pickUpOrder(pickCode));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}

