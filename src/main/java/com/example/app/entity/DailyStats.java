package com.example.app.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "daily_stats")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "date", nullable = false, unique = true)
    private LocalDate date;
    
    @Column(name = "total_minutes", nullable = false)
    @Builder.Default
    private Integer totalMinutes = 0;
    
    @Column(name = "completed_sessions", nullable = false)
    @Builder.Default
    private Integer completedSessions = 0;
}