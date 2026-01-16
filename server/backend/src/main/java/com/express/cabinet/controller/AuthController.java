package com.express.cabinet.controller;

import com.express.cabinet.dto.ApiResponse;
import com.express.cabinet.dto.LoginRequest;
import com.express.cabinet.dto.RegisterRequest;
import com.express.cabinet.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

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
}

