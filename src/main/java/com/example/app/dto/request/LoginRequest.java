package com.example.app.dto.request;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank(message = "用户名不能为空")
    private String username;
    
    @NotBlank(message = "密码不能为空")
    private String password;

    public LoginRequest() {
    }

    public LoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public static LoginRequestBuilder builder() {
        return new LoginRequestBuilder();
    }

    public static class LoginRequestBuilder {
        private String username;
        private String password;
        
        public LoginRequestBuilder username(String username) {
            this.username = username;
            return this;
        }
        
        public LoginRequestBuilder password(String password) {
            this.password = password;
            return this;
        }
        
        public LoginRequest build() {
            return new LoginRequest(username, password);
        }
    }
}
