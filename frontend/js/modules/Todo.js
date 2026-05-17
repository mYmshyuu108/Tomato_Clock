import store from '../utils/store.js';
import Format from '../utils/format.js';

class Todo {
    constructor() {
        this.todos = [];
        this.trash = [];
        this.currentFilter = 'all';
        this.showTrash = false;
        
        this.todoList = document.getElementById('todo-list');
        this.btnAddTodo = document.getElementById('btn-add-todo');
        this.btnEmptyTrash = document.getElementById('btn-empty-trash');
        this.btnViewTrash = document.getElementById('btn-view-trash');
        this.btnBackToList = document.getElementById('btn-back-to-list');
        
        this.encouragements = [
            '太棒了！继续加油！💪',
            '完成得漂亮！🎉',
            '你真厉害！🌟',
            '效率很高嘛！🔥',
            '又完成一项！👏',
            '做得好！✨',
            '继续保持！💯',
            '完美！💖'
        ];
        
        this.bindEvents();
        this.render();
        this.checkDueDateReminders();
    }

    bindEvents() {
        if (this.btnAddTodo) {
            this.btnAddTodo.addEventListener('click', () => this.openAddModal());
        }
        
        if (this.btnViewTrash) {
            this.btnViewTrash.addEventListener('click', () => this.showTrashList());
        }
        
        if (this.btnBackToList) {
            this.btnBackToList.addEventListener('click', () => this.hideTrashList());
        }
        
        if (this.btnEmptyTrash) {
            this.btnEmptyTrash.addEventListener('click', () => this.confirmEmptyTrash());
        }
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
    }

    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        this.render();
    }

    getFilteredTodos() {
        let filtered = [...this.todos];
        
        switch (this.currentFilter) {
            case 'completed':
                filtered = filtered.filter(t => t.completed);
                break;
            case 'pending':
                filtered = filtered.filter(t => !t.completed);
                break;
        }
        
        return filtered.sort((a, b) => {
            const dateA = a.dueDate || '9999-12-31';
            const dateB = b.dueDate || '9999-12-31';
            return dateA.localeCompare(dateB);
        });
    }

    async render() {
        if (!this.todoList) return;
        
        if (this.showTrash) {
            await this.renderTrash();
            return;
        }
        
        this.todos = await store.getTodos();
        const filtered = this.getFilteredTodos();
        
        if (filtered.length === 0) {
            this.todoList.innerHTML = `
                <div class="empty-state">
                    <p>暂无待办事项</p>
                    <p>点击上方按钮添加</p>
                </div>
            `;
            return;
        }
        
        this.todoList.innerHTML = filtered.map(todo => this.createTodoElement(todo)).join('');
        
        this.todoList.querySelectorAll('.todo-checkbox').forEach((checkbox, index) => {
            checkbox.addEventListener('change', (e) => this.toggleComplete(filtered[index].id, e.target.checked, e.target.closest('.todo-card')));
        });
        
        this.todoList.querySelectorAll('.todo-action-btn.edit').forEach((btn, index) => {
            btn.addEventListener('click', () => this.openEditModal(filtered[index]));
        });
        
        this.todoList.querySelectorAll('.todo-action-btn.delete').forEach((btn, index) => {
            btn.addEventListener('click', () => this.deleteTodo(filtered[index].id));
        });
        
        this.todoList.querySelectorAll('.todo-action-btn.connect').forEach((btn, index) => {
            btn.addEventListener('click', () => this.connectToTimer(filtered[index]));
        });
    }
    
    connectToTimer(todo) {
        document.dispatchEvent(new CustomEvent('task-connected', {
            detail: { task: todo }
        }));
        
        document.dispatchEvent(new CustomEvent('tab-change', {
            detail: { tab: 'timer' }
        }));
        
        alert(`已将「${todo.title}」关联到计时器！`);
    }

    async renderTrash() {
        this.trash = store.getTrash();
        
        const trashHeader = document.querySelector('.todo-header');
        const trashFilters = document.querySelector('.todo-filters');
        
        if (trashHeader) {
            trashHeader.innerHTML = `
                <h2>🗑️ 垃圾站</h2>
                <div class="trash-actions">
                    <button class="btn btn-secondary" id="btn-back-to-list">← 返回列表</button>
                    <button class="btn btn-danger" id="btn-empty-trash">清空垃圾站</button>
                </div>
            `;
        }
        
        if (trashFilters) {
            trashFilters.style.display = 'none';
        }
        
        if (this.trash.length === 0) {
            this.todoList.innerHTML = `
                <div class="empty-state">
                    <p>🗑️ 垃圾站是空的</p>
                </div>
            `;
            return;
        }
        
        this.todoList.innerHTML = this.trash.map(todo => this.createTrashElement(todo)).join('');
        
        this.todoList.querySelectorAll('.trash-action-btn.restore').forEach((btn, index) => {
            btn.addEventListener('click', () => this.restoreFromTrash(this.trash[index].id));
        });
        
        this.todoList.querySelectorAll('.trash-action-btn.delete').forEach((btn, index) => {
            btn.addEventListener('click', () => this.deleteFromTrash(this.trash[index].id));
        });
        
        var backBtn = document.getElementById('btn-back-to-list');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.hideTrashList());
        }
        var emptyBtn = document.getElementById('btn-empty-trash');
        if (emptyBtn) {
            emptyBtn.addEventListener('click', () => this.confirmEmptyTrash());
        }
    }

    showTrashList() {
        this.showTrash = true;
        this.render();
    }

    hideTrashList() {
        this.showTrash = false;
        
        const trashHeader = document.querySelector('.todo-header');
        const trashFilters = document.querySelector('.todo-filters');
        
        if (trashHeader) {
            trashHeader.innerHTML = `
                <h2>待办清单</h2>
                <div class="todo-header-actions">
                    <button class="btn btn-secondary" id="btn-view-trash">🗑️ 垃圾站</button>
                    <button class="btn btn-primary" id="btn-add-todo">+ 添加</button>
                </div>
            `;
            document.getElementById('btn-add-todo').addEventListener('click', () => this.openAddModal());
            document.getElementById('btn-view-trash').addEventListener('click', () => this.showTrashList());
        }
        
        if (trashFilters) {
            trashFilters.style.display = 'flex';
        }
        
        this.render();
    }

    createTodoElement(todo) {
        const dueDate = todo.dueDate ? Format.formatDate(todo.dueDate) : '';
        const isOverdue = todo.dueDate && todo.dueDate < Format.getTodayString() && !todo.completed;
        const daysRemaining = this.getDaysRemaining(todo.dueDate);
        const pomodoroProgress = todo.completedPomodoros !== undefined && todo.totalPomodoros !== undefined 
            ? `(${todo.completedPomodoros}/${todo.totalPomodoros}番茄)` : '';
        
        let dueDateClass = '';
        if (daysRemaining !== null) {
            if (daysRemaining <= 3 && daysRemaining > 0) {
                dueDateClass = 'due-urgent';
            } else if (daysRemaining === 0) {
                dueDateClass = 'due-today';
            } else if (daysRemaining < 0) {
                dueDateClass = 'due-overdue';
            }
        }
        
        return `
            <div class="todo-card ${todo.completed ? 'completed' : ''}">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <div class="todo-info">
                    <div class="todo-title">${todo.title} ${pomodoroProgress}</div>
                    <div class="todo-meta">
                        ${todo.description ? `<span>${todo.description}</span>` : ''}
                        ${dueDate ? `<span class="${dueDateClass}">📅 ${dueDate}</span>` : ''}
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="todo-action-btn connect" title="关联到计时器">🔗</button>
                    <button class="todo-action-btn edit">✏️</button>
                    <button class="todo-action-btn delete">🗑️</button>
                </div>
            </div>
        `;
    }

    createTrashElement(todo) {
        const dueDate = todo.dueDate ? Format.formatDate(todo.dueDate) : '';
        const daysInTrash = this.getDaysInTrash(todo.deletedAt);
        
        return `
            <div class="trash-card">
                <div class="trash-icon">🗑️</div>
                <div class="trash-info">
                    <div class="trash-title">${todo.title}</div>
                    <div class="trash-meta">
                        ${todo.description ? `<span>${todo.description}</span>` : ''}
                        ${dueDate ? `<span>📅 ${dueDate}</span>` : ''}
                        <span class="days-in-trash">已删除 ${daysInTrash} 天</span>
                    </div>
                </div>
                <div class="trash-actions">
                    <button class="trash-action-btn restore">🔄 恢复</button>
                    <button class="trash-action-btn delete">🗑️ 删除</button>
                </div>
            </div>
        `;
    }

    getDaysRemaining(dueDate) {
        if (!dueDate) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        const diffTime = due - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getDaysInTrash(deletedAt) {
        if (!deletedAt) return 0;
        const diffTime = Date.now() - deletedAt;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    async addTodo(todo) {
        const newTodo = {
            id: Date.now(),
            title: todo.title,
            description: todo.description || '',
            dueDate: todo.dueDate || null,
            completed: false,
            createdAt: Date.now(),
            inTrash: false,
            deletedAt: null,
            completedPomodoros: 0,
            totalPomodoros: 1
        };
        
        await store.addTodo(newTodo);
        await this.render();
    }

    async updateTodo(id, updates) {
        await store.updateTodo(id, updates);
        await this.render();
    }

    async toggleComplete(id, completed, cardElement) {
        if (completed && cardElement) {
            cardElement.classList.add('completing');
            
            setTimeout(() => {
                cardElement.style.transform = 'scale(0.8)';
                cardElement.style.opacity = '0';
                cardElement.style.filter = 'blur(10px)';
            }, 10);
            
            setTimeout(async () => {
                await store.toggleTodo(id, completed);
                await this.render();
                this.showEncouragement();
            }, 500);
        } else {
            await store.toggleTodo(id, completed);
            await this.render();
        }
    }

    showEncouragement() {
        const encouragement = this.encouragements[Math.floor(Math.random() * this.encouragements.length)];
        
        const toast = document.createElement('div');
        toast.className = 'encouragement-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-emoji">🎊</span>
                <span class="toast-text">${encouragement}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 500);
        }, 3000);
    }

    async deleteTodo(id) {
        if (confirm('确定要删除这个待办吗？')) {
            await store.moveToTrash(id);
            await this.render();
        }
    }

    async restoreFromTrash(id) {
        await store.restoreFromTrash(id);
        await this.render();
    }

    async deleteFromTrash(id) {
        if (confirm('确定要永久删除这个任务吗？')) {
            await store.deleteFromTrash(id);
            await this.render();
        }
    }

    confirmEmptyTrash() {
        if (confirm('确定要清空垃圾站吗？所有任务将被永久删除！')) {
            this.emptyTrash();
        }
    }

    async emptyTrash() {
        await store.emptyTrash();
        await this.render();
    }

    checkDueDateReminders() {
        const today = Format.getTodayString();
        const lastChecked = localStorage.getItem('lastReminderDate');
        
        if (lastChecked === today) {
            return;
        }
        
        store.getTodos().then(todos => {
            const pendingTodos = todos.filter(t => !t.completed && t.dueDate);
            const reminders = [];
            
            pendingTodos.forEach(todo => {
                const daysRemaining = this.getDaysRemaining(todo.dueDate);
                
                if (daysRemaining === 15 || daysRemaining === 10 || daysRemaining === 7) {
                    reminders.push({ todo, daysRemaining, type: 'warning' });
                } else if (daysRemaining >= 1 && daysRemaining <= 3) {
                    reminders.push({ todo, daysRemaining, type: 'urgent' });
                }
            });
            
            if (reminders.length > 0) {
                this.showDueDateReminders(reminders);
            }
            
            localStorage.setItem('lastReminderDate', today);
        });
    }

    showDueDateReminders(reminders) {
        let message = '📅 截止日期提醒：\n\n';
        
        reminders.forEach(({ todo, daysRemaining }) => {
            let prefix = '';
            if (daysRemaining === 15) {
                prefix = '🔔 还有15天 ';
            } else if (daysRemaining === 10) {
                prefix = '⏰ 还有10天 ';
            } else if (daysRemaining === 7) {
                prefix = '📆 还有7天 ';
            } else if (daysRemaining === 3) {
                prefix = '⚠️ 还有3天 ';
            } else if (daysRemaining === 2) {
                prefix = '❗ 还有2天 ';
            } else if (daysRemaining === 1) {
                prefix = '🔥 明天截止 ';
            }
            message += `${prefix}「${todo.title}」\n`;
        });
        
        message += '\n加油！💪';
        
        alert(message);
    }

    openAddModal() {
        this.openModal(null);
    }

    openEditModal(todo) {
        this.openModal(todo);
    }

    openModal(todo) {
        const modal = document.getElementById('todo-modal');
        const title = document.getElementById('todo-modal-title');
        const todoTitle = document.getElementById('todo-title');
        const todoDescription = document.getElementById('todo-description');
        const todoDueDate = document.getElementById('todo-due-date');
        
        if (todo) {
            title.textContent = '编辑待办';
            todoTitle.value = todo.title;
            todoDescription.value = todo.description || '';
            todoDueDate.value = todo.dueDate || '';
        } else {
            title.textContent = '添加待办';
            todoTitle.value = '';
            todoDescription.value = '';
            todoDueDate.value = '';
        }
        
        modal.classList.add('active');
        
        document.getElementById('btn-todo-save').onclick = () => {
            if (!todoTitle.value.trim()) {
                alert('请输入待办标题');
                return;
            }
            
            const data = {
                title: todoTitle.value.trim(),
                description: todoDescription.value.trim(),
                dueDate: todoDueDate.value || null
            };
            
            if (todo) {
                this.updateTodo(todo.id, data);
            } else {
                this.addTodo(data);
            }
            
            this.closeModal();
        };
        
        document.getElementById('btn-todo-cancel').onclick = () => this.closeModal();
        document.getElementById('todo-modal-close').onclick = () => this.closeModal();
    }

    closeModal() {
        document.getElementById('todo-modal').classList.remove('active');
    }
}

export default Todo;