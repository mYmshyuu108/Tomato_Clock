package com.example.app.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TimerRecordRequest {
    @NotNull(message = "时长不能为空")
    @Min(value = 1, message = "时长至少为1分钟")
    private Integer duration;
    
    private LocalDate date;
    
    private LocalDateTime startTime;
    
    private LocalDateTime endTime;

    public TimerRecordRequest() {
    }

    public TimerRecordRequest(Integer duration, LocalDate date, LocalDateTime startTime, LocalDateTime endTime) {
        this.duration = duration;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
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

    public static TimerRecordRequestBuilder builder() {
        return new TimerRecordRequestBuilder();
    }

    public static class TimerRecordRequestBuilder {
        private Integer duration;
        private LocalDate date;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        
        public TimerRecordRequestBuilder duration(Integer duration) {
            this.duration = duration;
            return this;
        }
        
        public TimerRecordRequestBuilder date(LocalDate date) {
            this.date = date;
            return this;
        }
        
        public TimerRecordRequestBuilder startTime(LocalDateTime startTime) {
            this.startTime = startTime;
            return this;
        }
        
        public TimerRecordRequestBuilder endTime(LocalDateTime endTime) {
            this.endTime = endTime;
            return this;
        }
        
        public TimerRecordRequest build() {
            return new TimerRecordRequest(duration, date, startTime, endTime);
        }
    }
}
