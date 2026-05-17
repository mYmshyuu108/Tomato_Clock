const API_BASE_URL = 'http://localhost:8090/api';

const Api = {
    token: null,

    initToken() {
        if (this.token === null) {
            this.token = localStorage.getItem('token') || null;
        }
        return this.token;
    },

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    },

    removeToken() {
        this.token = null;
        localStorage.removeItem('token');
    },

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    },

    async request(method, url, data = null) {
        try {
            const options = {
                method,
                headers: this.getHeaders()
            };
            
            if (data) {
                options.body = JSON.stringify(data);
            }
            
            const response = await fetch(`${API_BASE_URL}${url}`, options);
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || '请求失败');
            }
            
            return result.data;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    },

    async register(username, password, nickname) {
        return await this.request('POST', '/auth/register', {
            username,
            password,
            nickname
        });
    },
    
    async checkUsername(username) {
        return await this.request('GET', `/auth/check-username?username=${encodeURIComponent(username)}`);
    },
    
    async checkNickname(nickname) {
        return await this.request('GET', `/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`);
    },

    async login(username, password) {
        const result = await this.request('POST', '/auth/login', {
            username,
            password
        });
        if (result.token) {
            this.setToken(result.token);
        }
        return result;
    },

    async getProfile() {
        return await this.request('GET', '/profile');
    },

    async updateProfile(nickname, avatar) {
        return await this.request('PUT', `/profile?nickname=${encodeURIComponent(nickname || '')}&avatar=${encodeURIComponent(avatar || '')}`);
    },

    async createTodo(title, description, dueDate) {
        return await this.request('POST', '/todos', {
            title,
            description,
            dueDate
        });
    },

    async getTodos(completed = null) {
        const url = completed !== null ? `/todos?completed=${completed}` : '/todos';
        return await this.request('GET', url);
    },

    async updateTodo(id, title, description, dueDate) {
        return await this.request('PUT', `/todos/${id}`, {
            title,
            description,
            dueDate
        });
    },

    async toggleTodo(id) {
        return await this.request('PATCH', `/todos/${id}/toggle`);
    },

    async deleteTodo(id) {
        return await this.request('DELETE', `/todos/${id}`);
    },

    async createTimerRecord(duration, date, startTime, endTime) {
        return await this.request('POST', '/timer/records', {
            duration,
            date,
            startTime,
            endTime
        });
    },

    async getTimerRecords() {
        return await this.request('GET', '/timer/records');
    },

    async deleteTimerRecord(id) {
        return await this.request('DELETE', `/timer/records/${id}`);
    },

    async getStats() {
        return await this.request('GET', '/stats');
    }
};

export default Api;