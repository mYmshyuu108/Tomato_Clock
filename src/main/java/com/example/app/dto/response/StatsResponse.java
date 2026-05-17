package com.example.app.dto.response;

import java.util.List;

public class StatsResponse {
    private Integer todayMinutes;
    private Integer weekMinutes;
    private Integer monthMinutes;
    private Long totalSessions;
    private Integer streakDays;
    private List<DailyStatItem> dailyStats;

    public StatsResponse() {
    }

    public StatsResponse(Integer todayMinutes, Integer weekMinutes, Integer monthMinutes,
                        Long totalSessions, Integer streakDays, List<DailyStatItem> dailyStats) {
        this.todayMinutes = todayMinutes;
        this.weekMinutes = weekMinutes;
        this.monthMinutes = monthMinutes;
        this.totalSessions = totalSessions;
        this.streakDays = streakDays;
        this.dailyStats = dailyStats;
    }

    public Integer getTodayMinutes() {
        return todayMinutes;
    }

    public void setTodayMinutes(Integer todayMinutes) {
        this.todayMinutes = todayMinutes;
    }

    public Integer getWeekMinutes() {
        return weekMinutes;
    }

    public void setWeekMinutes(Integer weekMinutes) {
        this.weekMinutes = weekMinutes;
    }

    public Integer getMonthMinutes() {
        return monthMinutes;
    }

    public void setMonthMinutes(Integer monthMinutes) {
        this.monthMinutes = monthMinutes;
    }

    public Long getTotalSessions() {
        return totalSessions;
    }

    public void setTotalSessions(Long totalSessions) {
        this.totalSessions = totalSessions;
    }

    public Integer getStreakDays() {
        return streakDays;
    }

    public void setStreakDays(Integer streakDays) {
        this.streakDays = streakDays;
    }

    public List<DailyStatItem> getDailyStats() {
        return dailyStats;
    }

    public void setDailyStats(List<DailyStatItem> dailyStats) {
        this.dailyStats = dailyStats;
    }

    public static StatsResponseBuilder builder() {
        return new StatsResponseBuilder();
    }

    public static class StatsResponseBuilder {
        private Integer todayMinutes;
        private Integer weekMinutes;
        private Integer monthMinutes;
        private Long totalSessions;
        private Integer streakDays;
        private List<DailyStatItem> dailyStats;
        
        public StatsResponseBuilder todayMinutes(Integer todayMinutes) {
            this.todayMinutes = todayMinutes;
            return this;
        }
        
        public StatsResponseBuilder weekMinutes(Integer weekMinutes) {
            this.weekMinutes = weekMinutes;
            return this;
        }
        
        public StatsResponseBuilder monthMinutes(Integer monthMinutes) {
            this.monthMinutes = monthMinutes;
            return this;
        }
        
        public StatsResponseBuilder totalSessions(Long totalSessions) {
            this.totalSessions = totalSessions;
            return this;
        }
        
        public StatsResponseBuilder streakDays(Integer streakDays) {
            this.streakDays = streakDays;
            return this;
        }
        
        public StatsResponseBuilder dailyStats(List<DailyStatItem> dailyStats) {
            this.dailyStats = dailyStats;
            return this;
        }
        
        public StatsResponse build() {
            return new StatsResponse(todayMinutes, weekMinutes, monthMinutes, 
                                   totalSessions, streakDays, dailyStats);
        }
    }

    public static class DailyStatItem {
        private String date;
        private Integer minutes;
        private Integer sessions;

        public DailyStatItem() {
        }

        public DailyStatItem(String date, Integer minutes, Integer sessions) {
            this.date = date;
            this.minutes = minutes;
            this.sessions = sessions;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public Integer getMinutes() {
            return minutes;
        }

        public void setMinutes(Integer minutes) {
            this.minutes = minutes;
        }

        public Integer getSessions() {
            return sessions;
        }

        public void setSessions(Integer sessions) {
            this.sessions = sessions;
        }

        public static DailyStatItemBuilder builder() {
            return new DailyStatItemBuilder();
        }

        public static class DailyStatItemBuilder {
            private String date;
            private Integer minutes;
            private Integer sessions;
            
            public DailyStatItemBuilder date(String date) {
                this.date = date;
                return this;
            }
            
            public DailyStatItemBuilder minutes(Integer minutes) {
                this.minutes = minutes;
                return this;
            }
            
            public DailyStatItemBuilder sessions(Integer sessions) {
                this.sessions = sessions;
                return this;
            }
            
            public DailyStatItem build() {
                return new DailyStatItem(date, minutes, sessions);
            }
        }
    }
}
