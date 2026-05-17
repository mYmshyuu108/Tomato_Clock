package com.example.app.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TimerRecordResponse {
    private Long id;
    private Integer duration;
    private LocalDate date;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createdAt;

    public TimerRecordResponse() {
    }

    public TimerRecordResponse(Long id, Integer duration, LocalDate date, LocalDateTime startTime,
                              LocalDateTime endTime, LocalDateTime createdAt) {
        this.id = id;
        this.duration = duration;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public static TimerRecordResponseBuilder builder() {
        return new TimerRecordResponseBuilder();
    }

    public static class TimerRecordResponseBuilder {
        private Long id;
        private Integer duration;
        private LocalDate date;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private LocalDateTime createdAt;
        
        public TimerRecordResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }
        
        public TimerRecordResponseBuilder duration(Integer duration) {
            this.duration = duration;
            return this;
        }
        
        public TimerRecordResponseBuilder date(LocalDate date) {
            this.date = date;
            return this;
        }
        
        public TimerRecordResponseBuilder startTime(LocalDateTime startTime) {
            this.startTime = startTime;
            return this;
        }
        
        public TimerRecordResponseBuilder endTime(LocalDateTime endTime) {
            this.endTime = endTime;
            return this;
        }
        
        public TimerRecordResponseBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }
        
        public TimerRecordResponse build() {
            return new TimerRecordResponse(id, duration, date, startTime, endTime, createdAt);
        }
    }
}
