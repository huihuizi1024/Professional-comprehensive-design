package com.express.cabinet.service;

import com.express.cabinet.dto.LoginRequest;
import com.express.cabinet.dto.RegisterRequest;
import com.express.cabinet.entity.User;
import com.express.cabinet.repository.UserRepository;
import com.express.cabinet.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final JwtUtil jwtUtil;

    @Transactional
    public Map<String, Object> register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("手机号已存在");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRealName(request.getRealName());
        user.setUserType(request.getUserType() != null ? request.getUserType() : 0);
        user.setStatus(1);

        user = userRepository.save(user);

        Map<String, Object> result = new HashMap<>();
        result.put("userId", user.getId());
        result.put("username", user.getUsername());
        result.put("userType", user.getUserType());
        result.put("token", jwtUtil.generateToken(user.getId(), user.getUsername()));

        return result;
    }

    public Map<String, Object> login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("用户名或密码错误"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }

        if (user.getStatus() == 0) {
            throw new RuntimeException("账户已被禁用");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("userId", user.getId());
        result.put("username", user.getUsername());
        result.put("userType", user.getUserType());
        result.put("token", jwtUtil.generateToken(user.getId(), user.getUsername()));

        return result;
    }
}

