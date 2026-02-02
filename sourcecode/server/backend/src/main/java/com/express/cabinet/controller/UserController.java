package com.express.cabinet.controller;

import com.express.cabinet.config.JwtAuthInterceptor;
import com.express.cabinet.dto.ApiResponse;
import com.express.cabinet.dto.CreateUserRequest;
import com.express.cabinet.dto.UpdateMeRequest;
import com.express.cabinet.dto.UpdateUserRequest;
import com.express.cabinet.entity.User;
import com.express.cabinet.service.UserService;
import com.express.cabinet.util.ForbiddenException;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/admin/list")
    public ApiResponse<List<Map<String, Object>>> listUsersForAdmin(
            HttpServletRequest request,
            @RequestParam(required = false) Integer userType,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String keyword
    ) {
        requireAdmin(request);
        List<User> users = userService.listUsers(userType, status, keyword);
        List<Map<String, Object>> data = users.stream().map(this::toUserMap).collect(Collectors.toList());
        return ApiResponse.success(data);
    }

    @PostMapping("/admin")
    public ApiResponse<Map<String, Object>> createUserForAdmin(
            HttpServletRequest request,
            @Validated @RequestBody CreateUserRequest body
    ) {
        requireAdmin(request);
        User created = userService.createUser(body);
        return ApiResponse.success("创建成功", toUserMap(created));
    }

    @PutMapping("/admin/{id}")
    public ApiResponse<Map<String, Object>> updateUserForAdmin(
            HttpServletRequest request,
            @PathVariable("id") Long id,
            @Validated @RequestBody UpdateUserRequest body
    ) {
        requireAdmin(request);
        if (id == null) {
            throw new RuntimeException("用户ID不能为空");
        }
        User updated = userService.updateUser(id, body);
        return ApiResponse.success("更新成功", toUserMap(updated));
    }

    @PutMapping("/me")
    public ApiResponse<Map<String, Object>> updateMe(HttpServletRequest httpServletRequest, @Validated @RequestBody UpdateMeRequest request) {
        Long userId = (Long) httpServletRequest.getAttribute(JwtAuthInterceptor.REQ_ATTR_USER_ID);
        User updated = userService.updateMe(userId, request);
        return ApiResponse.success("更新成功", toUserMap(updated));
    }

    private void requireAdmin(HttpServletRequest request) {
        String username = (String) request.getAttribute(JwtAuthInterceptor.REQ_ATTR_USERNAME);
        if (!"admin".equals(username)) {
            throw new ForbiddenException("仅管理员可访问该接口");
        }
    }

    private Map<String, Object> toUserMap(User user) {
        Map<String, Object> data = new HashMap<>();
        data.put("userId", user.getId());
        data.put("username", user.getUsername());
        data.put("phone", user.getPhone());
        data.put("realName", user.getRealName());
        data.put("userType", user.getUserType());
        data.put("status", user.getStatus());
        data.put("createdAt", user.getCreatedAt());
        data.put("updatedAt", user.getUpdatedAt());
        return data;
    }
}

