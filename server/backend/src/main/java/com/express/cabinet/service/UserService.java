package com.express.cabinet.service;

import com.express.cabinet.dto.CreateUserRequest;
import com.express.cabinet.dto.UpdateMeRequest;
import com.express.cabinet.dto.UpdateUserRequest;
import com.express.cabinet.entity.User;
import com.express.cabinet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User getById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }

    public List<User> listUsers(Integer userType, Integer status, String keyword) {
        String trimmedKeyword = keyword == null ? null : keyword.trim();
        return userRepository.findAll().stream()
                .filter(u -> userType == null || Objects.equals(u.getUserType(), userType))
                .filter(u -> status == null || Objects.equals(u.getStatus(), status))
                .filter(u -> {
                    if (trimmedKeyword == null || trimmedKeyword.isEmpty()) {
                        return true;
                    }
                    return (u.getUsername() != null && u.getUsername().contains(trimmedKeyword))
                            || (u.getPhone() != null && u.getPhone().contains(trimmedKeyword))
                            || (u.getRealName() != null && u.getRealName().contains(trimmedKeyword));
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public User createUser(CreateUserRequest request) {
        if (request == null) {
            throw new RuntimeException("参数不能为空");
        }
        String username = request.getUsername() == null ? null : request.getUsername().trim();
        String phone = request.getPhone() == null ? null : request.getPhone().trim();
        String password = request.getPassword() == null ? null : request.getPassword().trim();

        if (username == null || username.isEmpty()) {
            throw new RuntimeException("用户名不能为空");
        }
        if (password == null || password.isEmpty()) {
            throw new RuntimeException("密码不能为空");
        }
        if (phone == null || phone.isEmpty()) {
            throw new RuntimeException("手机号不能为空");
        }

        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("用户名已存在");
        }
        if (userRepository.existsByPhone(phone)) {
            throw new RuntimeException("手机号已存在");
        }

        Integer userType = request.getUserType() == null ? 0 : request.getUserType();
        if (userType != 0 && userType != 1) {
            throw new RuntimeException("用户类型不合法");
        }
        Integer status = request.getStatus() == null ? 1 : request.getStatus();
        if (status != 0 && status != 1) {
            throw new RuntimeException("状态不合法");
        }

        User user = new User();
        user.setUsername(username);
        user.setPhone(phone);
        user.setPassword(passwordEncoder.encode(password));
        if (request.getRealName() != null) {
            String realName = request.getRealName().trim();
            user.setRealName(realName.isEmpty() ? null : realName);
        }
        user.setUserType(userType);
        user.setStatus(status);
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(Long userId, UpdateUserRequest request) {
        if (request == null) {
            throw new RuntimeException("参数不能为空");
        }
        User user = getById(userId);
        boolean isAdminUser = "admin".equals(user.getUsername());

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

        if (request.getUserType() != null) {
            Integer userType = request.getUserType();
            if (userType != 0 && userType != 1) {
                throw new RuntimeException("用户类型不合法");
            }
            if (isAdminUser && userType != user.getUserType()) {
                throw new RuntimeException("管理员账户不允许修改用户类型");
            }
            user.setUserType(userType);
        }

        if (request.getStatus() != null) {
            Integer status = request.getStatus();
            if (status != 0 && status != 1) {
                throw new RuntimeException("状态不合法");
            }
            if (isAdminUser && status == 0) {
                throw new RuntimeException("管理员账户不允许禁用");
            }
            user.setStatus(status);
        }

        return userRepository.save(user);
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

