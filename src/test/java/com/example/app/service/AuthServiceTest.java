package com.example.app.service;

import com.example.app.dto.request.LoginRequest;
import com.example.app.dto.request.RegisterRequest;
import com.example.app.dto.response.AuthResponse;
import com.example.app.entity.User;
import com.example.app.exception.BusinessException;
import com.example.app.repository.UserRepository;
import com.example.app.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService 单元测试")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest validRegisterRequest;
    private LoginRequest validLoginRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        validRegisterRequest = new RegisterRequest();
        validRegisterRequest.setUsername("testuser");
        validRegisterRequest.setPassword("Test@1234");
        validRegisterRequest.setNickname("TestUser");

        validLoginRequest = new LoginRequest();
        validLoginRequest.setUsername("testuser");
        validLoginRequest.setPassword("Test@1234");

        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .password("encodedPassword")
                .nickname("TestUser")
                .enabled(true)
                .build();
    }

    @Test
    @DisplayName("注册 - 成功")
    void register_ShouldReturnAuthResponse_WhenValidRequest() {
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(passwordEncoder.encode("Test@1234")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtTokenProvider.generateToken(any(User.class))).thenReturn("testToken");
        when(jwtTokenProvider.getExpirationInSeconds()).thenReturn(86400L);

        AuthResponse response = authService.register(validRegisterRequest);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("Bearer", response.getTokenType());
        assertNotNull(response.getUser());
        assertEquals("testuser", response.getUser().getUsername());
        
        verify(userRepository, times(1)).existsByUsername("testuser");
        verify(userRepository, times(1)).save(any(User.class));
        verify(jwtTokenProvider, times(1)).generateToken(any(User.class));
    }

    @Test
    @DisplayName("注册 - 用户已存在")
    void register_ShouldThrowException_WhenUsernameExists() {
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            authService.register(validRegisterRequest);
        });

        assertEquals("用户名已存在", exception.getMessage());
        verify(userRepository, times(1)).existsByUsername("testuser");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("注册 - 密码太短")
    void register_ShouldThrowException_WhenPasswordTooShort() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setPassword("Ab1");

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            authService.register(request);
        });

        assertEquals("密码长度至少8位", exception.getMessage());
    }

    @Test
    @DisplayName("注册 - 密码缺少大写字母")
    void register_ShouldThrowException_WhenPasswordMissingUpperCase() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setPassword("test1234");

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            authService.register(request);
        });

        assertEquals("密码需包含至少一个大写字母", exception.getMessage());
    }

    @Test
    @DisplayName("注册 - 密码缺少小写字母")
    void register_ShouldThrowException_WhenPasswordMissingLowerCase() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setPassword("TEST1234");

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            authService.register(request);
        });

        assertEquals("密码需包含至少一个小写字母", exception.getMessage());
    }

    @Test
    @DisplayName("注册 - 密码缺少数字")
    void register_ShouldThrowException_WhenPasswordMissingNumber() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setPassword("TestAbc");

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            authService.register(request);
        });

        assertEquals("密码需包含至少一个数字", exception.getMessage());
    }

    @Test
    @DisplayName("登录 - 成功")
    void login_ShouldReturnAuthResponse_WhenValidCredentials() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("Test@1234", "encodedPassword")).thenReturn(true);
        when(jwtTokenProvider.generateToken(any(User.class))).thenReturn("testToken");
        when(jwtTokenProvider.getExpirationInSeconds()).thenReturn(86400L);

        AuthResponse response = authService.login(validLoginRequest);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("Bearer", response.getTokenType());
        
        verify(userRepository, times(1)).findByUsername("testuser");
        verify(passwordEncoder, times(1)).matches("Test@1234", "encodedPassword");
    }

    @Test
    @DisplayName("登录 - 用户不存在")
    void login_ShouldThrowException_WhenUserNotFound() {
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        LoginRequest request = new LoginRequest();
        request.setUsername("nonexistent");
        request.setPassword("password");

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            authService.login(request);
        });

        assertEquals("用户名或密码错误", exception.getMessage());
    }

    @Test
    @DisplayName("登录 - 密码错误")
    void login_ShouldThrowException_WhenInvalidPassword() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrong", "encodedPassword")).thenReturn(false);

        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("wrong");

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            authService.login(request);
        });

        assertEquals("用户名或密码错误", exception.getMessage());
    }

    @Test
    @DisplayName("登录 - 用户被禁用")
    void login_ShouldThrowException_WhenUserDisabled() {
        User disabledUser = User.builder()
                .id(1L)
                .username("testuser")
                .password("encodedPassword")
                .enabled(false)
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(disabledUser));
        when(passwordEncoder.matches("Test@1234", "encodedPassword")).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            authService.login(validLoginRequest);
        });

        assertEquals("用户已被禁用", exception.getMessage());
    }
}