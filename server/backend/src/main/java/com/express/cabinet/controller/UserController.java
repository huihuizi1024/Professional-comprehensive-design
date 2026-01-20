package com.express.cabinet.controller;

import com.express.cabinet.config.JwtAuthInterceptor;
import com.express.cabinet.dto.ApiResponse;
import com.express.cabinet.dto.UpdateMeRequest;
import com.express.cabinet.entity.User;
import com.express.cabinet.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PutMapping("/me")
    public ApiResponse<Map<String, Object>> updateMe(HttpServletRequest httpServletRequest, @Validated @RequestBody UpdateMeRequest request) {
        Long userId = (Long) httpServletRequest.getAttribute(JwtAuthInterceptor.REQ_ATTR_USER_ID);
        User updated = userService.updateMe(userId, request);
        Map<String, Object> data = new HashMap<>();
        data.put("userId", updated.getId());
        data.put("username", updated.getUsername());
        data.put("phone", updated.getPhone());
        data.put("realName", updated.getRealName());
        data.put("userType", updated.getUserType());
        data.put("status", updated.getStatus());
        return ApiResponse.success("更新成功", data);
    }
}

