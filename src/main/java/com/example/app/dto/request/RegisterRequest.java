package com.example.app.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度必须在3-50之间")
    private String username;
    
    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 100, message = "密码长度必须在6-100之间")
    private String password;
    
    private String nickname;

    public RegisterRequest() {
    }

    public RegisterRequest(String username, String password, String nickname) {
        this.username = username;
        this.password = password;
        this.nickname = nickname;
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

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public static RegisterRequestBuilder builder() {
        return new RegisterRequestBuilder();
    }

    public static class RegisterRequestBuilder {
        private String username;
        private String password;
        private String nickname;
        
        public RegisterRequestBuilder username(String username) {
            this.username = username;
            return this;
        }
        
        public RegisterRequestBuilder password(String password) {
            this.password = password;
            return this;
        }
        
        public RegisterRequestBuilder nickname(String nickname) {
            this.nickname = nickname;
            return this;
        }
        
        public RegisterRequest build() {
            return new RegisterRequest(username, password, nickname);
        }
    }
}