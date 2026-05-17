package com.example.app.controller;

import com.example.app.dto.response.ApiResponse;
import com.example.app.dto.response.StatsResponse;
import com.example.app.entity.User;
import com.example.app.service.StatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class StatsController {
    private final StatsService statsService;
    
    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<StatsResponse>> getUserStats(@AuthenticationPrincipal User user) {
        StatsResponse response;
        if (user == null) {
            response = statsService.getAnonymousStats();
        } else {
            response = statsService.getUserStats(user);
        }
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}