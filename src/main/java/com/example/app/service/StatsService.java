package com.example.app.service;

import com.example.app.dto.response.StatsResponse;
import com.example.app.entity.User;
import com.example.app.repository.TimerRecordRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class StatsService {
    private final TimerRecordRepository timerRecordRepository;
    
    public StatsService(TimerRecordRepository timerRecordRepository) {
        this.timerRecordRepository = timerRecordRepository;
    }
    
    public StatsResponse getAnonymousStats() {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        LocalDate weekEnd = today.with(DayOfWeek.SUNDAY);
        
        List<StatsResponse.DailyStatItem> dailyStats = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        for (LocalDate date = weekStart; !date.isAfter(weekEnd); date = date.plusDays(1)) {
            dailyStats.add(StatsResponse.DailyStatItem.builder()
                    .date(date.format(formatter))
                    .minutes(0)
                    .sessions(0)
                    .build());
        }
        
        return StatsResponse.builder()
                .todayMinutes(0)
                .weekMinutes(0)
                .monthMinutes(0)
                .totalSessions(0L)
                .streakDays(0)
                .dailyStats(dailyStats)
                .build();
    }
    
    public StatsResponse getUserStats(User user) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        LocalDate weekEnd = today.with(DayOfWeek.SUNDAY);
        LocalDate monthStart = YearMonth.from(today).atDay(1);
        
        Integer todayMinutes = timerRecordRepository.sumDurationByUserIdAndDate(user.getId(), today);
        Integer weekMinutes = timerRecordRepository.sumDurationByUserIdAndDateRange(user.getId(), weekStart, weekEnd);
        Integer monthMinutes = timerRecordRepository.sumDurationByUserIdAndDateRange(user.getId(), monthStart, today);
        Long totalSessions = timerRecordRepository.countByUserId(user.getId());
        
        int streakDays = calculateStreakDays(user);
        
        List<StatsResponse.DailyStatItem> dailyStats = getWeeklyStats(user, weekStart, weekEnd);
        
        return StatsResponse.builder()
                .todayMinutes(todayMinutes != null ? todayMinutes : 0)
                .weekMinutes(weekMinutes != null ? weekMinutes : 0)
                .monthMinutes(monthMinutes != null ? monthMinutes : 0)
                .totalSessions(totalSessions)
                .streakDays(streakDays)
                .dailyStats(dailyStats)
                .build();
    }
    
    private int calculateStreakDays(User user) {
        List<Object[]> dailyMinutes = timerRecordRepository.getDailyMinutesByUserId(user.getId());
        if (dailyMinutes.isEmpty()) return 0;
        
        int streak = 0;
        LocalDate today = LocalDate.now();
        
        for (int i = 0; i < dailyMinutes.size(); i++) {
            LocalDate recordDate = (LocalDate) dailyMinutes.get(i)[0];
            LocalDate expectedDate = today.minusDays(i);
            
            if (recordDate.equals(expectedDate)) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }
    
    private List<StatsResponse.DailyStatItem> getWeeklyStats(User user, LocalDate weekStart, LocalDate weekEnd) {
        List<StatsResponse.DailyStatItem> stats = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        for (LocalDate date = weekStart; !date.isAfter(weekEnd); date = date.plusDays(1)) {
            Integer minutes = timerRecordRepository.sumDurationByUserIdAndDate(user.getId(), date);
            
            stats.add(StatsResponse.DailyStatItem.builder()
                    .date(date.format(formatter))
                    .minutes(minutes != null ? minutes : 0)
                    .sessions(0)
                    .build());
        }
        
        return stats;
    }
}
