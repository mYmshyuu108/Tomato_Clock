package com.example.app.controller;

import com.example.app.dto.request.TimerRecordRequest;
import com.example.app.dto.response.ApiResponse;
import com.example.app.dto.response.TimerRecordResponse;
import com.example.app.entity.User;
import com.example.app.service.TimerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timer")
public class TimerController {
    private final TimerService timerService;
    
    public TimerController(TimerService timerService) {
        this.timerService = timerService;
    }
    
    @PostMapping("/records")
    public ResponseEntity<ApiResponse<TimerRecordResponse>> createRecord(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody TimerRecordRequest request) {
        TimerRecordResponse response = timerService.createRecord(user, request);
        return ResponseEntity.ok(ApiResponse.success("记录创建成功", response));
    }
    
    @GetMapping("/records")
    public ResponseEntity<ApiResponse<List<TimerRecordResponse>>> getUserRecords(@AuthenticationPrincipal User user) {
        List<TimerRecordResponse> records = timerService.getUserRecords(user);
        return ResponseEntity.ok(ApiResponse.success(records));
    }
    
    @DeleteMapping("/records/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRecord(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        timerService.deleteRecord(user, id);
        return ResponseEntity.ok(ApiResponse.success("删除成功", null));
    }
}
