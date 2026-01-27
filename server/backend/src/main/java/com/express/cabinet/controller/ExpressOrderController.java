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
    public ApiResponse<List<ExpressOrder>> getAllOrders(HttpServletRequest request) {
        if (isAdmin(request)) {
            return ApiResponse.success(expressOrderService.getAllOrders());
        }
        Long userId = (Long) request.getAttribute(JwtAuthInterceptor.REQ_ATTR_USER_ID);
        User user = userService.getById(userId);
        if (user.getUserType() != null && user.getUserType() == 1) {
            return ApiResponse.success(expressOrderService.getOrdersByCourierId(userId));
        }
        return ApiResponse.success(expressOrderService.getOrdersByReceiverUserId(userId));
    }

    @GetMapping("/phone/{phone}")
    public ApiResponse<List<ExpressOrder>> getOrdersByPhone(HttpServletRequest request, @PathVariable String phone) {
        if (isAdmin(request)) {
            return ApiResponse.success(expressOrderService.getOrdersByReceiverPhone(phone));
        }
        Long userId = (Long) request.getAttribute(JwtAuthInterceptor.REQ_ATTR_USER_ID);
        User courier = userService.getById(userId);
        if (courier.getUserType() == null || courier.getUserType() != 1) {
            throw new ForbiddenException("仅管理员或快递员可访问该接口");
        }
        return ApiResponse.success(expressOrderService.getOrdersByCourierIdAndReceiverPhone(userId, phone));
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<ExpressOrder>> getOrdersByUserId(HttpServletRequest request, @PathVariable Long userId) {
        if (!isAdmin(request)) {
            throw new ForbiddenException("仅管理员可访问该接口");
        }
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
    public ApiResponse<List<ExpressOrder>> getOrdersByCabinetId(HttpServletRequest request, @PathVariable Long cabinetId) {
        if (!isAdmin(request)) {
            throw new ForbiddenException("仅管理员可访问该接口");
        }
        return ApiResponse.success(expressOrderService.getOrdersByCabinetId(cabinetId));
    }

    @GetMapping("/status/{status}")
    public ApiResponse<List<ExpressOrder>> getOrdersByStatus(HttpServletRequest request, @PathVariable Integer status) {
        if (!isAdmin(request)) {
            throw new ForbiddenException("仅管理员可访问该接口");
        }
        return ApiResponse.success(expressOrderService.getOrdersByStatus(status));
    }

    @GetMapping("/pick-code/{pickCode}")
    public ApiResponse<ExpressOrder> getOrderByPickCode(HttpServletRequest request, @PathVariable String pickCode) {
        try {
            ExpressOrder order = expressOrderService.getOrderByPickCode(pickCode);
            if (isAdmin(request)) {
                return ApiResponse.success(order);
            }

            Long userId = (Long) request.getAttribute(JwtAuthInterceptor.REQ_ATTR_USER_ID);
            User user = userService.getById(userId);
            if (user.getUserType() != null && user.getUserType() == 1) {
                if (order.getCourierId() != null && order.getCourierId().equals(userId)) {
                    return ApiResponse.success(order);
                }
                throw new ForbiddenException("仅可查看自己投递的订单");
            }

            if (!orderBelongsToUser(order, user)) {
                throw new ForbiddenException("仅可查看自己的订单");
            }
            return ApiResponse.success(order);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/verify-pick-code")
    public ApiResponse<ExpressOrder> verifyPickCode(HttpServletRequest httpServletRequest, @RequestBody Map<String, String> request) {
        try {
            String pickCode = request.get("pickCode");
            ExpressOrder order = expressOrderService.verifyPickCode(pickCode);
            if (isAdmin(httpServletRequest)) {
                return ApiResponse.success("核验成功", order);
            }

            Long userId = (Long) httpServletRequest.getAttribute(JwtAuthInterceptor.REQ_ATTR_USER_ID);
            User user = userService.getById(userId);
            if (user.getUserType() != null && user.getUserType() == 1) {
                if (order.getCourierId() != null && order.getCourierId().equals(userId)) {
                    return ApiResponse.success("核验成功", order);
                }
                throw new ForbiddenException("仅可核验自己投递的订单");
            }

            if (!orderBelongsToUser(order, user)) {
                throw new ForbiddenException("仅可核验自己的订单");
            }
            return ApiResponse.success("核验成功", order);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping
    public ApiResponse<ExpressOrder> createOrder(HttpServletRequest request, @RequestBody ExpressOrder order) {
        try {
            if (!isAdmin(request)) {
                throw new ForbiddenException("仅管理员可访问该接口");
            }
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
    public ApiResponse<ExpressOrder> pickUpOrder(HttpServletRequest httpServletRequest, @RequestBody Map<String, String> request) {
        try {
            String pickCode = request.get("pickCode");
            if (!isAdmin(httpServletRequest)) {
                Long userId = (Long) httpServletRequest.getAttribute(JwtAuthInterceptor.REQ_ATTR_USER_ID);
                User user = userService.getById(userId);
                ExpressOrder order = expressOrderService.getOrderByPickCode(pickCode);
                if (!orderBelongsToUser(order, user)) {
                    throw new ForbiddenException("仅可取走自己的订单");
                }
            }
            return ApiResponse.success("取件成功", expressOrderService.pickUpOrder(pickCode));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    private boolean isAdmin(HttpServletRequest request) {
        String username = (String) request.getAttribute(JwtAuthInterceptor.REQ_ATTR_USERNAME);
        return "admin".equals(username);
    }

    private boolean orderBelongsToUser(ExpressOrder order, User user) {
        if (order == null || user == null) {
            return false;
        }
        if (order.getReceiverUserId() != null && order.getReceiverUserId().equals(user.getId())) {
            return true;
        }
        return order.getReceiverPhone() != null && user.getPhone() != null && order.getReceiverPhone().equals(user.getPhone());
    }
}

