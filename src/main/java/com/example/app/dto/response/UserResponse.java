package com.example.app.dto.response;

public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String nickname;
    private String avatar;

    public UserResponse() {
    }

    public UserResponse(Long id, String username, String email, String nickname, String avatar) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.nickname = nickname;
        this.avatar = avatar;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public static UserResponseBuilder builder() {
        return new UserResponseBuilder();
    }

    public static class UserResponseBuilder {
        private Long id;
        private String username;
        private String email;
        private String nickname;
        private String avatar;
        
        public UserResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }
        
        public UserResponseBuilder username(String username) {
            this.username = username;
            return this;
        }
        
        public UserResponseBuilder email(String email) {
            this.email = email;
            return this;
        }
        
        public UserResponseBuilder nickname(String nickname) {
            this.nickname = nickname;
            return this;
        }
        
        public UserResponseBuilder avatar(String avatar) {
            this.avatar = avatar;
            return this;
        }
        
        public UserResponse build() {
            return new UserResponse(id, username, email, nickname, avatar);
        }
    }
}
