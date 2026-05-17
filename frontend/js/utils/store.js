import Storage from './storage.js';
import Api from './api.js';
import Format from './format.js';

Api.initToken();

class Store {
    constructor() {
        this.recordsCache = null;
        this.todosCache = null;
        this.TRASH_RETENTION_DAYS = 30;
        this.useApi = Api.token !== null;
    }

    setUseApi(enable) {
        this.useApi = enable;
        if (!enable) {
            this.recordsCache = null;
            this.todosCache = null;
        }
    }

    isUsingApi() {
        return this.useApi && Api.token;
    }

    async getTodos() {
        if (this.isUsingApi()) {
            try {
                this.todosCache = await Api.getTodos();
                return this.todosCache;
            } catch {
                return Storage.getTodos();
            }
        }
        return Storage.getTodos();
    }

    async saveTodos(todos) {
        if (this.isUsingApi()) {
            try {
                for (const todo of todos) {
                    if (todo.id && todo._saved !== true) {
                        await Api.updateTodo(todo.id, todo.title, todo.description, todo.dueDate);
                        todo._saved = true;
                    }
                }
                this.todosCache = todos;
            } catch {}
        }
        Storage.saveTodos(todos);
    }

    async addTodo(todo) {
        if (this.isUsingApi()) {
            try {
                const result = await Api.createTodo(todo.title, todo.description, todo.dueDate);
                todo.id = result.id;
                todo._saved = true;
            } catch {}
        }
        const todos = Storage.getTodos();
        todos.push(todo);
        Storage.saveTodos(todos);
        return todo;
    }

    async updateTodo(id, updates) {
        const todos = Storage.getTodos();
        const index = todos.findIndex(t => t.id === id);
        if (index !== -1) {
            todos[index] = { ...todos[index], ...updates };
            todos[index]._saved = false;
            await this.saveTodos(todos);
        }
    }

    async toggleTodo(id, completed) {
        if (this.isUsingApi()) {
            try {
                await Api.toggleTodo(id);
            } catch {}
        }
        const todos = Storage.getTodos();
        const todo = todos.find(t => t.id === id);
        if (todo) {
            todo.completed = completed;
            todo._saved = false;
            Storage.saveTodos(todos);
        }
    }

    async moveToTrash(id) {
        const todos = Storage.getTodos();
        const todoIndex = todos.findIndex(t => t.id === id);
        if (todoIndex !== -1) {
            const todo = todos[todoIndex];
            todo.deletedAt = Date.now();
            todo.inTrash = true;
            
            todos.splice(todoIndex, 1);
            Storage.saveTodos(todos);
            
            const trash = this.getTrash();
            trash.push(todo);
            Storage.saveTrash(trash);
            
            this.cleanupOldTrash();
        }
    }

    getTrash() {
        return Storage.getTrash();
    }

    async restoreFromTrash(id) {
        const trash = this.getTrash();
        const trashIndex = trash.findIndex(t => t.id === id);
        if (trashIndex !== -1) {
            const todo = trash[trashIndex];
            todo.inTrash = false;
            todo.deletedAt = null;
            todo.completed = false;
            
            trash.splice(trashIndex, 1);
            Storage.saveTrash(trash);
            
            const todos = Storage.getTodos();
            todos.push(todo);
            Storage.saveTodos(todos);
        }
    }

    async deleteFromTrash(id) {
        const trash = this.getTrash().filter(t => t.id !== id);
        Storage.saveTrash(trash);
    }

    async emptyTrash() {
        Storage.saveTrash([]);
    }

    cleanupOldTrash() {
        const trash = this.getTrash();
        const cutoffTime = Date.now() - (this.TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000);
        const filtered = trash.filter(t => t.deletedAt > cutoffTime);
        Storage.saveTrash(filtered);
    }

    async deleteTodo(id) {
        if (this.isUsingApi()) {
            try {
                await Api.deleteTodo(id);
            } catch {}
        }
        const todos = Storage.getTodos().filter(t => t.id !== id);
        Storage.saveTodos(todos);
    }

    getTimerSettings() {
        return Storage.getTimerSettings();
    }

    saveTimerSettings(settings) {
        Storage.saveTimerSettings(settings);
    }

    async getTimerRecords() {
        if (this.isUsingApi()) {
            try {
                this.recordsCache = await Api.getTimerRecords();
                return this.recordsCache;
            } catch {
                return Storage.getTimerRecords();
            }
        }
        return Storage.getTimerRecords();
    }

    async addTimerRecord(record) {
        if (this.isUsingApi()) {
            try {
                await Api.createTimerRecord(record.duration, record.date, record.startTime, record.endTime);
            } catch {}
        }
        Storage.addTimerRecord(record);
    }

    async getStats() {
        if (this.isUsingApi()) {
            try {
                return await Api.getStats();
            } catch {}
        }
        const records = Storage.getTimerRecords();
        const today = Format.getTodayString();
        const weekDays = Format.getWeekDays();
        
        const todayMinutes = Format.getMinutesByDate(records, today);
        const weekMinutes = Format.getWeekMinutes(records);
        const totalSessions = Format.getTotalSessions(records);
        const streakDays = Format.calculateDaysStreak(records);

        const dailyStats = weekDays.map(day => ({
            date: day.date,
            minutes: Format.getMinutesByDate(records, day.date),
            sessions: 0
        }));

        return {
            todayMinutes,
            weekMinutes,
            monthMinutes: 0,
            totalSessions,
            streakDays,
            dailyStats
        };
    }

    async login(username, password) {
        const result = await Api.login(username, password);
        this.setUseApi(true);
        return result;
    }

    async register(username, password, nickname) {
        const result = await Api.register(username, password, nickname);
        this.setUseApi(true);
        return result;
    }

    logout() {
        Api.removeToken();
        this.setUseApi(false);
        this.recordsCache = null;
        this.todosCache = null;
    }

    isLoggedIn() {
        return Api.token !== null;
    }
}

const store = new Store();
export default store;