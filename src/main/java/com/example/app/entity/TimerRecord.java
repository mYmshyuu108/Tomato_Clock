package com.example.app.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "timer_records")
public class TimerRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "duration", nullable = false)
    private Integer duration;
    
    @Column(name = "date", nullable = false)
    private LocalDate date;
    
    @Column(name = "start_time")
    private LocalDateTime startTime;
    
    @Column(name = "end_time")
    private LocalDateTime endTime;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (date == null) {
            date = LocalDate.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static TimerRecordBuilder builder() {
        return new TimerRecordBuilder();
    }

    public static class TimerRecordBuilder {
        private final TimerRecord record = new TimerRecord();
        
        public TimerRecordBuilder id(Long id) {
            record.id = id;
            return this;
        }
        
        public TimerRecordBuilder user(User user) {
            record.user = user;
            return this;
        }
        
        public TimerRecordBuilder duration(Integer duration) {
            record.duration = duration;
            return this;
        }
        
        public TimerRecordBuilder date(LocalDate date) {
            record.date = date;
            return this;
        }
        
        public TimerRecordBuilder startTime(LocalDateTime startTime) {
            record.startTime = startTime;
            return this;
        }
        
        public TimerRecordBuilder endTime(LocalDateTime endTime) {
            record.endTime = endTime;
            return this;
        }
        
        public TimerRecord build() {
            return record;
        }
    }
}
