package com.express.cabinet.controller;

import com.express.cabinet.dto.ApiResponse;
import com.express.cabinet.config.JwtAuthInterceptor;
import com.express.cabinet.entity.ExpressOrder;
import com.express.cabinet.entity.User;
import com.express.cabinet.service.ExpressOrderService;
import com.express.cabinet.service.UserService;
import com.express.cabinet.util.ForbiddenException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class ExpressOrderController {
    private final ExpressOrderService expressOrderService;
    private final UserService userService;

    @GetMapping
    public ApiResponse<List<ExpressOrder>> getAllOrders() {
        return ApiResponse.success(expressOrderService.getAllOrders());
    }

    @GetMapping("/phone/{phone}")
    public ApiResponse<List<ExpressOrder>> getOrdersByPhone(@PathVariable String phone) {
        return ApiResponse.success(expressOrderService.getOrdersByReceiverPhone(phone));
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<ExpressOrder>> getOrdersByUserId(@PathVariable Long userId) {
        return ApiResponse.success(expressOrderService.getOrdersByReceiverUserId(userId));
    }

    @GetMapping("/me")
    public ApiResponse<List<ExpressOrder>> getMyOrders(HttpServletRequest request, @RequestParam(required = false) Integer status) {
        Long userId = (Long) request.getAttribute(JwtAuthInterceptor.REQ_ATTR_USER_ID);
        return ApiResponse.success(expressOrderService.getOrdersByReceiverUserIdAndStatus(userId, status));
    }

    @GetMapping("/courier/me")
    public ApiResponse<List<ExpressOrder>> getMyCourierOrders(HttpServletRequest request, @RequestParam(required = false) Integer status) {
        Long courierId = (Long) request.getAttribute(JwtAuthInterceptor.REQ_ATTR_USER_ID);
        User courier = userService.getById(courierId);
        if (courier.getUserType() == null || courier.getUserType() != 1) {
            throw new ForbiddenException("仅快递员可访问该接口");
        }
        return ApiResponse.success(expressOrderService.getOrdersByCourierIdAndStatus(courierId, status));
    }

    @GetMapping("/cabinet/{cabinetId}")
    public ApiResponse<List<ExpressOrder>> getOrdersByCabinetId(@PathVariable Long cabinetId) {
        return ApiResponse.success(expressOrderService.getOrdersByCabinetId(cabinetId));
    }

    @GetMapping("/status/{status}")
    public ApiResponse<List<ExpressOrder>> getOrdersByStatus(@PathVariable Integer status) {
        return ApiResponse.success(expressOrderService.getOrdersByStatus(status));
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

    @PostMapping("/courier/deliver")
    public ApiResponse<ExpressOrder> courierDeliver(HttpServletRequest request, @RequestBody ExpressOrder order) {
        Long courierId = (Long) request.getAttribute(JwtAuthInterceptor.REQ_ATTR_USER_ID);
        User courier = userService.getById(courierId);
        if (courier.getUserType() == null || courier.getUserType() != 1) {
            throw new ForbiddenException("仅快递员可访问该接口");
        }
        order.setCourierId(courierId);
        order.setOrderType(0);
        return ApiResponse.success("创建订单成功", expressOrderService.createOrder(order));
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

