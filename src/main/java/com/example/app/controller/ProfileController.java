package com.example.app.controller;

import com.example.app.dto.response.ApiResponse;
import com.example.app.dto.response.UserResponse;
import com.example.app.entity.User;
import com.example.app.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final ProfileService profileService;
    
    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(@AuthenticationPrincipal User user) {
        UserResponse response = profileService.getProfile(user);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PutMapping
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String nickname,
            @RequestParam(required = false) String avatar) {
        UserResponse response = profileService.updateProfile(user, nickname, avatar);
        return ResponseEntity.ok(ApiResponse.success("更新成功", response));
    }
}
