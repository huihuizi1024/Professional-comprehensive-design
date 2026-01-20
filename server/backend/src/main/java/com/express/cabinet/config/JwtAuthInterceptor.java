package com.express.cabinet.config;

import com.express.cabinet.util.JwtUtil;
import com.express.cabinet.util.UnauthorizedException;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
@RequiredArgsConstructor
public class JwtAuthInterceptor implements HandlerInterceptor {
    public static final String REQ_ATTR_USER_ID = "authUserId";
    public static final String REQ_ATTR_USERNAME = "authUsername";

    private final JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String uri = request.getRequestURI();
        if (uri.startsWith("/api/auth/login") || uri.startsWith("/api/auth/register")) {
            return true;
        }

        String authorization = request.getHeader("Authorization");
        if (authorization == null || authorization.trim().isEmpty()) {
            throw new UnauthorizedException("未登录");
        }

        String prefix = "Bearer ";
        if (!authorization.startsWith(prefix)) {
            throw new UnauthorizedException("无效的登录信息");
        }

        String token = authorization.substring(prefix.length()).trim();
        if (token.isEmpty()) {
            throw new UnauthorizedException("无效的登录信息");
        }
        if (jwtUtil.isTokenExpired(token)) {
            throw new UnauthorizedException("登录已过期，请重新登录");
        }

        Claims claims;
        try {
            claims = jwtUtil.parseToken(token);
        } catch (Exception e) {
            throw new UnauthorizedException("无效的登录信息");
        }

        Object userId = claims.get("userId");
        Object username = claims.get("username");
        if (userId == null || username == null) {
            throw new UnauthorizedException("无效的登录信息");
        }

        request.setAttribute(REQ_ATTR_USER_ID, Long.valueOf(userId.toString()));
        request.setAttribute(REQ_ATTR_USERNAME, username.toString());
        return true;
    }
}

