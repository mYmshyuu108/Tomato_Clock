const Format = {
    padZero(num, length = 2) {
        return String(num).padStart(length, '0');
    },

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${this.padZero(mins)}:${this.padZero(secs)}`;
    },

    formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = this.padZero(d.getMonth() + 1);
        const day = this.padZero(d.getDate());
        return `${year}-${month}-${day}`;
    },

    formatDateTime(date) {
        const d = new Date(date);
        return `${this.formatDate(d)} ${this.padZero(d.getHours())}:${this.padZero(d.getMinutes())}`;
    },

    getTodayString() {
        return this.formatDate(new Date());
    },

    getWeekDays() {
        const days = ['日', '一', '二', '三', '四', '五', '六'];
        const result = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            result.push({
                date: this.formatDate(date),
                label: days[date.getDay()]
            });
        }
        return result;
    },

    calculateDaysStreak(records) {
        if (!records || records.length === 0) return 0;
        
        const dates = [...new Set(records.map(r => r.date))].sort().reverse();
        let streak = 0;
        const today = this.getTodayString();
        const yesterday = this.formatDate(new Date(Date.now() - 86400000));
        
        if (!dates.includes(today) && !dates.includes(yesterday)) return 0;
        
        for (let i = 0; i < dates.length; i++) {
            const expectedDate = new Date(Date.now() - i * 86400000);
            if (dates[i] === this.formatDate(expectedDate)) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    },

    getMinutesByDate(records, date) {
        return records
            .filter(r => r.date === date)
            .reduce((sum, r) => sum + r.duration, 0);
    },

    getWeekMinutes(records) {
        const weekDays = this.getWeekDays();
        return weekDays.reduce((sum, day) => sum + this.getMinutesByDate(records, day.date), 0);
    },

    getTodayMinutes(records) {
        return this.getMinutesByDate(records, this.getTodayString());
    },

    getTotalSessions(records) {
        return records.length;
    }
};

export default Format;