const Storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    clear() {
        localStorage.clear();
    },

    has(key) {
        return localStorage.getItem(key) !== null;
    },

    getTodos() {
        return this.get('todos', []);
    },

    saveTodos(todos) {
        return this.set('todos', todos);
    },

    getTimerSettings() {
        return this.get('timerSettings', {
            focusDuration: 25,
            breakDuration: 5,
            longBreakDuration: 15,
            longBreakInterval: 4
        });
    },

    saveTimerSettings(settings) {
        return this.set('timerSettings', settings);
    },

    getTimerRecords() {
        return this.get('timerRecords', []);
    },

    saveTimerRecords(records) {
        return this.set('timerRecords', records);
    },

    addTimerRecord(record) {
        const records = this.getTimerRecords();
        records.push(record);
        return this.saveTimerRecords(records);
    },

    getTrash() {
        return this.get('trash', []);
    },

    saveTrash(trash) {
        return this.set('trash', trash);
    }
};

export default Storage;