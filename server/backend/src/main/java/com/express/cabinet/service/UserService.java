package com.express.cabinet.service;

import com.express.cabinet.dto.UpdateMeRequest;
import com.express.cabinet.entity.User;
import com.express.cabinet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User getById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }

    @Transactional
    public User updateMe(Long userId, UpdateMeRequest request) {
        if (request == null) {
            throw new RuntimeException("参数不能为空");
        }
        User user = getById(userId);

        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            String phone = request.getPhone().trim();
            if (!phone.equals(user.getPhone()) && userRepository.existsByPhone(phone)) {
                throw new RuntimeException("手机号已存在");
            }
            user.setPhone(phone);
        }

        if (request.getRealName() != null) {
            String realName = request.getRealName().trim();
            user.setRealName(realName.isEmpty() ? null : realName);
        }

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            String password = request.getPassword().trim();
            user.setPassword(passwordEncoder.encode(password));
        }

        return userRepository.save(user);
    }
}

