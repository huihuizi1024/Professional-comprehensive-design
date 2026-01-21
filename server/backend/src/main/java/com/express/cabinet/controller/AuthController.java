package com.express.cabinet.controller;

import com.express.cabinet.dto.ApiResponse;
import com.express.cabinet.dto.LoginRequest;
import com.express.cabinet.dto.RegisterRequest;
import com.express.cabinet.entity.User;
import com.express.cabinet.service.AuthService;
import com.express.cabinet.service.UserService;
import com.express.cabinet.config.JwtAuthInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/register")
    public ApiResponse<Map<String, Object>> register(@Validated @RequestBody RegisterRequest request) {
        try {
            Map<String, Object> result = authService.register(request);
            return ApiResponse.success("注册成功", result);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@Validated @RequestBody LoginRequest request) {
        try {
            Map<String, Object> result = authService.login(request);
            return ApiResponse.success("登录成功", result);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/sms/send")
    public ApiResponse<Map<String, Object>> sendSms(@RequestBody Map<String, Object> body) {
        try {
            String phone = body == null ? null : String.valueOf(body.get("phone"));
            Map<String, Object> result = authService.sendSmsCode(phone);
            return ApiResponse.success("验证码已发送", result);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/me")
    public ApiResponse<Map<String, Object>> me(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtAuthInterceptor.REQ_ATTR_USER_ID);
        User user = userService.getById(userId);
        Map<String, Object> data = new HashMap<>();
        data.put("userId", user.getId());
        data.put("username", user.getUsername());
        data.put("phone", user.getPhone());
        data.put("realName", user.getRealName());
        data.put("userType", user.getUserType());
        data.put("status", user.getStatus());
        return ApiResponse.success(data);
    }
}
