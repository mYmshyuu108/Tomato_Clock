package com.example.app.service;

import com.example.app.dto.request.TimerRecordRequest;
import com.example.app.dto.response.TimerRecordResponse;
import com.example.app.entity.TimerRecord;
import com.example.app.entity.User;
import com.example.app.repository.TimerRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TimerService {
    private static final Logger log = LoggerFactory.getLogger(TimerService.class);
    
    private final TimerRecordRepository timerRecordRepository;
    
    public TimerService(TimerRecordRepository timerRecordRepository) {
        this.timerRecordRepository = timerRecordRepository;
    }
    
    public TimerRecordResponse createRecord(User user, TimerRecordRequest request) {
        TimerRecord record = TimerRecord.builder()
                .user(user)
                .duration(request.getDuration())
                .date(request.getDate() != null ? request.getDate() : LocalDate.now())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();
        
        record = timerRecordRepository.save(record);
        log.info("Timer record created for user {}: {} minutes", user.getUsername(), record.getDuration());
        
        return toResponse(record);
    }
    
    public List<TimerRecordResponse> getUserRecords(User user) {
        return timerRecordRepository.findByUserIdOrderByDateDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }
    
    public List<TimerRecordResponse> getUserRecordsByDate(User user, LocalDate date) {
        return timerRecordRepository.findByUserIdAndDate(user.getId(), date)
                .stream()
                .map(this::toResponse)
                .toList();
    }
    
    public List<TimerRecordResponse> getUserRecordsByDateRange(User user, LocalDate startDate, LocalDate endDate) {
        return timerRecordRepository.findByUserIdAndDateBetween(user.getId(), startDate, endDate)
                .stream()
                .map(this::toResponse)
                .toList();
    }
    
    public void deleteRecord(User user, Long recordId) {
        TimerRecord record = timerRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("记录不存在"));
        
        if (!record.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("无权限删除此记录");
        }
        
        timerRecordRepository.delete(record);
        log.info("Timer record deleted: {}", recordId);
    }
    
    private TimerRecordResponse toResponse(TimerRecord record) {
        return TimerRecordResponse.builder()
                .id(record.getId())
                .duration(record.getDuration())
                .date(record.getDate())
                .startTime(record.getStartTime())
                .endTime(record.getEndTime())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
