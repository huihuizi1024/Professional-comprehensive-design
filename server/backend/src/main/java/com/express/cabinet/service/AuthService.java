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
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final JwtUtil jwtUtil;
    private static final long SMS_CODE_TTL_MS = 5 * 60 * 1000;
    private static final Map<String, SmsCodeState> SMS_CODE_STORE = new ConcurrentHashMap<>();

    @Transactional
    public Map<String, Object> register(RegisterRequest request) {
        String phone = request.getPhone() == null ? null : request.getPhone().trim();
        if (phone == null || phone.isEmpty()) {
            throw new RuntimeException("手机号不能为空");
        }
        if (!verifySmsCode(phone, request.getSmsCode())) {
            throw new RuntimeException("验证码错误或已过期");
        }
        if (userRepository.existsByPhone(phone) || userRepository.existsByUsername(phone)) {
            throw new RuntimeException("手机号已存在");
        }

        User user = new User();
        user.setUsername(phone);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(phone);
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
        String input = request.getUsername() == null ? "" : request.getUsername().trim();
        boolean isPhone = input.matches("^1[3-9]\\d{9}$");
        User user = (isPhone ? userRepository.findByPhone(input) : userRepository.findByUsername(input))
                .orElseThrow(() -> new RuntimeException("手机号或密码错误"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("手机号或密码错误");
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

    public Map<String, Object> sendSmsCode(String phone) {
        String normalized = phone == null ? null : phone.trim();
        if (normalized == null || normalized.isEmpty()) {
            throw new RuntimeException("手机号不能为空");
        }
        if (!normalized.matches("^1[3-9]\\d{9}$")) {
            throw new RuntimeException("手机号格式不正确");
        }
        String code = String.format("%06d", ThreadLocalRandom.current().nextInt(0, 1000000));
        long expiresAt = System.currentTimeMillis() + SMS_CODE_TTL_MS;
        SMS_CODE_STORE.put(normalized, new SmsCodeState(code, expiresAt));
        Map<String, Object> result = new HashMap<>();
        result.put("phone", normalized);
        result.put("code", code);
        result.put("expireSeconds", SMS_CODE_TTL_MS / 1000);
        return result;
    }

    private boolean verifySmsCode(String phone, String smsCode) {
        if (smsCode == null || smsCode.trim().isEmpty()) {
            return false;
        }
        SmsCodeState state = SMS_CODE_STORE.get(phone);
        if (state == null) {
            return false;
        }
        if (System.currentTimeMillis() > state.expiresAt) {
            SMS_CODE_STORE.remove(phone);
            return false;
        }
        boolean matched = state.code.equals(smsCode.trim());
        if (matched) {
            SMS_CODE_STORE.remove(phone);
        }
        return matched;
    }

    private static final class SmsCodeState {
        private final String code;
        private final long expiresAt;

        private SmsCodeState(String code, long expiresAt) {
            this.code = code;
            this.expiresAt = expiresAt;
        }
    }
}
