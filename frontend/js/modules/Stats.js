import store from '../utils/store.js';
import Format from '../utils/format.js';

class Stats {
    constructor() {
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        document.addEventListener('timerComplete', () => {
            this.refresh();
        });
    }

    async refresh() {
        await this.render();
    }

    async render() {
        await this.renderSummary();
        await this.renderDailyChart();
    }

    async renderSummary() {
        const stats = await store.getStats();
        
        const todayMinutesEl = document.getElementById('today-minutes');
        const weekMinutesEl = document.getElementById('week-minutes');
        const totalSessionsEl = document.getElementById('total-sessions');
        const streakDaysEl = document.getElementById('streak-days');
        
        if (todayMinutesEl) todayMinutesEl.textContent = stats.todayMinutes;
        if (weekMinutesEl) weekMinutesEl.textContent = stats.weekMinutes;
        if (totalSessionsEl) totalSessionsEl.textContent = stats.totalSessions;
        if (streakDaysEl) streakDaysEl.textContent = stats.streakDays;
    }

    async renderDailyChart() {
        const stats = await store.getStats();
        const weekDays = Format.getWeekDays();
        const dailyChartEl = document.getElementById('daily-chart');
        
        if (!dailyChartEl) return;
        
        let maxMinutes = 0;
        if (stats.dailyStats) {
            maxMinutes = Math.max(...stats.dailyStats.map(d => d.minutes), 1);
        } else {
            maxMinutes = Math.max(...weekDays.map(day => Format.getMinutesByDate([], day.date)), 1);
        }
        
        const dailyData = stats.dailyStats || weekDays.map(day => ({
            date: day.date,
            minutes: 0,
            sessions: 0
        }));
        
        const chartHTML = dailyData.map((day, index) => {
            const minutes = day.minutes || 0;
            const height = (minutes / maxMinutes) * 100;
            var label = '';
            if (weekDays[index]) {
                label = weekDays[index].label || '';
            }
            
            return `
                <div class="chart-bar-container">
                    <div class="chart-bar" style="height: ${Math.max(height, 5)}%"></div>
                    <div class="chart-label">${label}</div>
                    <div class="chart-label" style="font-size: 10px">${minutes}m</div>
                </div>
            `;
        }).join('');
        
        dailyChartEl.innerHTML = chartHTML;
    }
}

export default Stats;