import store from '../utils/store.js';
import Format from '../utils/format.js';

class Timer {
    constructor() {
        this.settings = store.getTimerSettings();
        this.currentMode = 'focus';
        this.timeLeft = this.settings.focusDuration * 60;
        this.isRunning = false;
        this.intervalId = null;
        this.completedSessions = 0;
        this.audioContext = null;
        this.startTime = null;
        this.hasUnsavedTime = false;
        this.connectedTask = null;
        this.taskPomodoros = 0;
        this.totalPomodoros = 1;
        
        this.timeDisplay = document.getElementById('timer-time');
        this.labelDisplay = document.getElementById('timer-label');
        this.progressBar = document.getElementById('progress-bar');
        this.btnStart = document.getElementById('btn-start');
        this.btnReset = document.getElementById('btn-reset');
        this.btnSettings = document.getElementById('btn-settings');
        
        this.sessionsDisplay = document.getElementById('timer-sessions');
        this.modeDisplay = document.getElementById('timer-mode');
        this.todaySessionsDisplay = document.getElementById('today-sessions');
        this.todayMinutesDisplay = document.getElementById('today-minutes');
        this.streakDaysDisplay = document.getElementById('streak-days');
        
        this.btnAddTask = document.getElementById('btn-add-task');
        this.btnSkipBreak = document.getElementById('btn-skip-break');
        this.btnPomodoroStats = document.getElementById('btn-go-profile');
        
        this.taskSection = document.getElementById('timer-task-section');
        this.taskCard = document.getElementById('timer-task-card');
        this.taskCardTitle = document.getElementById('task-card-title');
        this.taskCardDate = document.getElementById('task-card-date');
        this.taskCardProgress = document.getElementById('task-card-progress');
        this.taskCardDescription = document.getElementById('task-card-description');
        this.btnRemoveTask = document.getElementById('btn-remove-task');
        
        this.init();
    }

    async init() {
        await this.loadCompletedSessions();
        this.updateDisplay();
        await this.updateStats();
        this.bindEvents();
        this.setupBeforeUnload();
    }

    async loadCompletedSessions() {
        const records = await store.getTimerRecords();
        const today = Format.getTodayString();
        this.completedSessions = records.filter(r => r.date === today).length;
    }

    bindEvents() {
        this.btnStart.addEventListener('click', () => this.toggle());
        this.btnReset.addEventListener('click', () => this.reset());
        this.btnSettings.addEventListener('click', () => this.openSettings());
        
        this.btnAddTask.addEventListener('click', () => this.handleAddTask());
        this.btnSkipBreak.addEventListener('click', () => this.skipBreak());
        this.btnPomodoroStats.addEventListener('click', () => this.goToStats());
        
        this.btnRemoveTask.addEventListener('click', () => this.removeConnectedTask());
        
        document.addEventListener('task-connected', (e) => {
            this.connectTask(e.detail.task);
        });
    }

    setupBeforeUnload() {
        window.addEventListener('beforeunload', (event) => {
            if (this.hasUnsavedTime && this.currentMode === 'focus') {
                const studiedSeconds = this.getStudiedSeconds();
                if (studiedSeconds >= 60) {
                    event.preventDefault();
                    event.returnValue = '';
                }
            }
        });

        window.addEventListener('unload', () => {
            if (this.hasUnsavedTime && this.currentMode === 'focus') {
                const studiedSeconds = this.getStudiedSeconds();
                if (studiedSeconds >= 60) {
                    this.savePartialRecord(studiedSeconds);
                }
            }
        });
    }

    getStudiedSeconds() {
        if (!this.startTime) return 0;
        const elapsed = Date.now() - this.startTime;
        return Math.floor(elapsed / 1000);
    }

    async savePartialRecord(seconds) {
        const minutes = Math.floor(seconds / 60);
        if (minutes < 1) return;
        
        const record = {
            id: Date.now(),
            date: Format.getTodayString(),
            duration: minutes,
            timestamp: Date.now()
        };
        await store.addTimerRecord(record);
    }

    async confirmSaveTime() {
        if (!this.hasUnsavedTime || this.currentMode !== 'focus') return;
        
        const studiedSeconds = this.getStudiedSeconds();
        if (studiedSeconds < 60) return;
        
        const minutes = Math.floor(studiedSeconds / 60);
        const secondsRemaining = studiedSeconds % 60;
        
        const message = `您已专注学习 ${minutes}分${secondsRemaining > 0 ? secondsRemaining + '秒' : ''}，是否将这段时间计入学习记录？`;
        if (confirm(message)) {
            await this.savePartialRecord(studiedSeconds);
            await this.updateStats();
        }
        
        this.hasUnsavedTime = false;
        this.startTime = null;
    }

    toggle() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }

    start() {
        this.isRunning = true;
        this.startTime = Date.now();
        this.hasUnsavedTime = true;
        this.btnStart.textContent = '⏸️ 暂停';
        
        this.intervalId = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            this.updateProgress();
            
            if (this.timeLeft <= 0) {
                this.completeSession();
            }
        }, 1000);
    }

    async pause() {
        this.isRunning = false;
        this.btnStart.textContent = '▶️ 继续';
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        if (this.currentMode === 'focus' && this.hasUnsavedTime) {
            await this.confirmSaveTime();
        }
    }

    async reset() {
        if (this.currentMode === 'focus' && this.hasUnsavedTime) {
            await this.confirmSaveTime();
        }
        
        this.pause();
        this.timeLeft = this.getModeDuration() * 60;
        this.updateDisplay();
        this.progressBar.style.width = '0%';
        this.startTime = null;
        this.hasUnsavedTime = false;
    }

    skipBreak() {
        if (!this.isRunning && this.currentMode !== 'focus') {
            this.currentMode = 'focus';
            this.timeLeft = this.settings.focusDuration * 60;
            this.updateDisplay();
            this.progressBar.style.width = '0%';
        }
    }

    goToStats() {
        document.dispatchEvent(new CustomEvent('tab-change', {
            detail: { tab: 'profile' }
        }));
    }

    handleAddTask() {
        document.dispatchEvent(new CustomEvent('tab-change', {
            detail: { tab: 'profile' }
        }));
        
        setTimeout(() => {
            var addTodoBtn = document.getElementById('btn-add-todo-from-profile');
            if (addTodoBtn) {
                addTodoBtn.click();
            }
        }, 100);
    }
    
    connectTask(task) {
        this.connectedTask = task;
        this.taskPomodoros = task.completedPomodoros || 0;
        this.totalPomodoros = task.totalPomodoros || 1;
        this.updateTaskCard();
    }
    
    removeConnectedTask() {
        this.connectedTask = null;
        this.taskPomodoros = 0;
        this.totalPomodoros = 1;
        this.taskCard.style.display = 'none';
        this.taskSection.style.display = 'flex';
    }
    
    updateTaskCard() {
        if (this.connectedTask) {
            this.taskCardTitle.textContent = this.connectedTask.title;
            this.taskCardDescription.textContent = this.connectedTask.description || '暂无描述';
            this.taskCardDate.textContent = this.connectedTask.dueDate ? `截止日期: ${this.connectedTask.dueDate}` : '无截止日期';
            this.taskCardProgress.textContent = `进度: ${this.taskPomodoros}/${this.totalPomodoros} 番茄`;
            
            this.taskSection.style.display = 'none';
            this.taskCard.style.display = 'block';
        }
    }

    updateDisplay() {
        this.timeDisplay.textContent = Format.formatTime(this.timeLeft);
        
        const labels = {
            focus: '专注时间',
            break: '休息时间',
            longBreak: '长休息时间'
        };
        this.labelDisplay.textContent = labels[this.currentMode];
        
        const modeLabels = {
            focus: '专注模式',
            break: '短休息',
            longBreak: '长休息'
        };
        this.modeDisplay.textContent = modeLabels[this.currentMode];
        
        this.sessionsDisplay.textContent = `第 ${this.completedSessions + 1} 个番茄`;
    }

    updateProgress() {
        const totalSeconds = this.getModeDuration() * 60;
        const progress = ((totalSeconds - this.timeLeft) / totalSeconds) * 100;
        this.progressBar.style.width = `${progress}%`;
    }

    async updateStats() {
        const stats = await store.getStats();
        this.todaySessionsDisplay.textContent = stats.todayMinutes > 0 ? Math.floor(stats.todayMinutes / this.settings.focusDuration) : 0;
        this.todayMinutesDisplay.textContent = stats.todayMinutes;
        this.streakDaysDisplay.textContent = stats.streakDays;
    }

    getModeDuration() {
        switch (this.currentMode) {
            case 'focus': return this.settings.focusDuration;
            case 'break': return this.settings.breakDuration;
            case 'longBreak': return this.settings.longBreakDuration;
            default: return this.settings.focusDuration;
        }
    }

    async completeSession() {
        this.pause();
        this.playNotificationSound();
        
        if (this.currentMode === 'focus') {
            this.completedSessions++;
            await this.saveRecord();
            await this.updateStats();
            
            if (this.connectedTask) {
                this.taskPomodoros++;
                await store.updateTodo(this.connectedTask.id, { 
                    completedPomodoros: this.taskPomodoros,
                    updatedAt: Date.now()
                });
                this.updateTaskCard();
                
                if (this.taskPomodoros >= this.totalPomodoros) {
                    await store.updateTodo(this.connectedTask.id, { completed: true });
                }
            }
            
            if (this.completedSessions % this.settings.longBreakInterval === 0) {
                this.currentMode = 'longBreak';
            } else {
                this.currentMode = 'break';
            }
        } else {
            this.currentMode = 'focus';
        }
        
        this.timeLeft = this.getModeDuration() * 60;
        this.updateDisplay();
        this.progressBar.style.width = '0%';
        this.startTime = null;
        this.hasUnsavedTime = false;
    }

    async saveRecord() {
        const record = {
            id: Date.now(),
            date: Format.getTodayString(),
            duration: this.settings.focusDuration,
            timestamp: Date.now()
        };
        await store.addTimerRecord(record);
    }

    playNotificationSound() {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio notification not supported');
        }
    }

    openSettings() {
        const modal = document.getElementById('settings-modal');
        modal.classList.add('active');
        
        document.getElementById('focus-duration').value = this.settings.focusDuration;
        document.getElementById('break-duration').value = this.settings.breakDuration;
        document.getElementById('long-break-duration').value = this.settings.longBreakDuration;
        document.getElementById('long-break-interval').value = this.settings.longBreakInterval;
        
        document.getElementById('btn-save').onclick = () => this.saveSettings();
        document.getElementById('btn-cancel').onclick = () => this.closeSettings();
        document.getElementById('modal-close').onclick = () => this.closeSettings();
    }

    closeSettings() {
        document.getElementById('settings-modal').classList.remove('active');
    }

    saveSettings() {
        this.settings = {
            focusDuration: parseInt(document.getElementById('focus-duration').value) || 25,
            breakDuration: parseInt(document.getElementById('break-duration').value) || 5,
            longBreakDuration: parseInt(document.getElementById('long-break-duration').value) || 15,
            longBreakInterval: parseInt(document.getElementById('long-break-interval').value) || 4
        };
        
        store.saveTimerSettings(this.settings);
        
        if (!this.isRunning && this.currentMode === 'focus') {
            this.timeLeft = this.settings.focusDuration * 60;
            this.updateDisplay();
        }
        
        this.closeSettings();
    }

    destroy() {
        this.pause();
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

export default Timer;