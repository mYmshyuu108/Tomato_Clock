package com.example.app.service;

import com.example.app.dto.request.LoginRequest;
import com.example.app.dto.request.RegisterRequest;
import com.example.app.dto.response.AuthResponse;
import com.example.app.dto.response.UserResponse;
import com.example.app.entity.User;
import com.example.app.exception.BusinessException;
import com.example.app.repository.UserRepository;
import com.example.app.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final long LOCK_DURATION_MS = 5 * 60 * 1000;
    
    private final Map<String, LoginAttempt> loginAttempts = new ConcurrentHashMap<>();
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }
    
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    public boolean existsByNickname(String nickname) {
        return userRepository.existsByNickname(nickname);
    }
    
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw BusinessException.of("用户名已存在");
        }
        
        validatePassword(request.getPassword());
        
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname() != null ? request.getNickname() : request.getUsername())
                .enabled(true)
                .build();
        
        user = userRepository.save(user);
        log.info("User registered: {}", user.getUsername());
        
        return createAuthResponse(user);
    }
    
    public AuthResponse login(LoginRequest request) {
        String username = request.getUsername();
        
        checkLoginLock(username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    recordFailedAttempt(username);
                    return BusinessException.of("用户名或密码错误");
                });
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            recordFailedAttempt(username);
            throw BusinessException.of("用户名或密码错误");
        }
        
        if (!user.getEnabled()) {
            throw BusinessException.of("用户已被禁用");
        }
        
        clearLoginAttempts(username);
        
        log.info("User logged in: {}", user.getUsername());
        return createAuthResponse(user);
    }
    
    private void checkLoginLock(String username) {
        LoginAttempt attempt = loginAttempts.get(username);
        if (attempt != null && attempt.isLocked()) {
            long remainingSeconds = (attempt.getLockEndTime() - System.currentTimeMillis()) / 1000;
            throw BusinessException.of("账户已锁定，请" + remainingSeconds + "秒后重试");
        }
    }
    
    private void recordFailedAttempt(String username) {
        LoginAttempt attempt = loginAttempts.computeIfAbsent(username, k -> new LoginAttempt());
        attempt.incrementAttempts();
        
        if (attempt.getAttempts() >= MAX_LOGIN_ATTEMPTS) {
            attempt.lock();
            log.warn("Account locked for user: {}", username);
        }
    }
    
    private void clearLoginAttempts(String username) {
        loginAttempts.remove(username);
    }
    
    private static class LoginAttempt {
        private int attempts = 0;
        private long lockEndTime = 0;
        
        public int getAttempts() {
            return attempts;
        }
        
        public void incrementAttempts() {
            this.attempts++;
        }
        
        public boolean isLocked() {
            return System.currentTimeMillis() < lockEndTime;
        }
        
        public void lock() {
            this.lockEndTime = System.currentTimeMillis() + LOCK_DURATION_MS;
        }
        
        public long getLockEndTime() {
            return lockEndTime;
        }
    }
    
    private AuthResponse createAuthResponse(User user) {
        String token = jwtTokenProvider.generateToken(user);
        
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationInSeconds())
                .user(UserResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .nickname(user.getNickname())
                        .avatar(user.getAvatar())
                        .build())
                .build();
    }
    
    private void validatePassword(String password) {
        if (password == null || password.isEmpty()) {
            throw BusinessException.of("密码不能为空");
        }
        
        if (password.length() < 8) {
            throw BusinessException.of("密码长度至少8位");
        }
        
        if (!password.matches(".*[A-Z].*")) {
            throw BusinessException.of("密码需包含至少一个大写字母");
        }
        
        if (!password.matches(".*[a-z].*")) {
            throw BusinessException.of("密码需包含至少一个小写字母");
        }
        
        if (!password.matches(".*\\d.*")) {
            throw BusinessException.of("密码需包含至少一个数字");
        }
        
        if (!password.matches("^[a-zA-Z0-9@#$%^&+=]*$")) {
            throw BusinessException.of("密码只能包含字母、数字和特殊字符(@#$%^&+=)");
        }
    }
}