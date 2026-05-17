import Timer from './modules/Timer.js';
import Todo from './modules/Todo.js';
import Stats from './modules/Stats.js';
import Profile from './modules/Profile.js';
import store from './utils/store.js';
import Api from './utils/api.js';

class App {
    constructor() {
        this.timer = null;
        this.todo = null;
        this.stats = null;
        this.profile = null;
        this.currentTab = 'timer';
        this.isLoggedIn = false;
        this.init();
    }

    async init() {
        this.isLoggedIn = store.isLoggedIn();
        this.initAuthButtons();
        this.initTabNavigation();
        this.initTabChangeEvent();
        await this.initModules();
        this.checkAuthStatus();
    }
    
    initTabChangeEvent() {
        document.addEventListener('tab-change', (e) => {
            this.switchTab(e.detail.tab);
        });
    }

    checkAuthStatus() {
        if (!this.isLoggedIn) {
            this.showLoginPrompt();
        }
    }

    showLoginPrompt() {
        const loginModal = document.getElementById('auth-modal');
        const title = document.getElementById('auth-modal-title');
        const submitBtn = document.getElementById('auth-submit');
        
        title.textContent = '请登录';
        submitBtn.textContent = '登录';
        document.getElementById('auth-password-confirm').style.display = 'none';
        document.getElementById('auth-nickname').style.display = 'none';
        
        submitBtn.onclick = () => {
            const username = document.getElementById('auth-username').value;
            const password = document.getElementById('auth-password').value;
            this.handleLogin(username, password);
        };
        
        document.getElementById('auth-cancel').onclick = () => {
            this.closeAuthModal();
            this.restrictAccess();
        };
        document.getElementById('auth-modal-close').onclick = () => {
            this.closeAuthModal();
            this.restrictAccess();
        };
        
        loginModal.classList.add('active');
    }

    restrictAccess() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.5';
        });
        
        document.getElementById('btn-start').style.pointerEvents = 'none';
        document.getElementById('btn-start').style.opacity = '0.5';
        document.getElementById('btn-settings').style.pointerEvents = 'none';
        document.getElementById('btn-settings').style.opacity = '0.5';
        document.getElementById('btn-reset').style.pointerEvents = 'none';
        document.getElementById('btn-reset').style.opacity = '0.5';
        
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 2rem;">🔐</div>
                <h2 style="font-size: 2rem; margin-bottom: 1rem;">请先登录</h2>
                <p style="color: #666; margin-bottom: 2rem;">登录后才能使用番茄钟、待办清单等功能</p>
                <button class="btn btn-primary" onclick="document.getElementById('btn-login').click()">立即登录</button>
                <p style="color: #999; margin-top: 1rem;">还没有账号？点击右上角注册</p>
            </div>
        `;
    }

    initAuthButtons() {
        const loginBtn = document.getElementById('btn-login');
        const registerBtn = document.getElementById('btn-register');
        const logoutBtn = document.getElementById('btn-logout');
        const userInfo = document.getElementById('user-info');
        
        if (this.isLoggedIn) {
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
            userInfo.style.display = 'block';
            this.enableAccess();
        } else {
            loginBtn.style.display = 'block';
            registerBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
            userInfo.style.display = 'none';
        }
        
        logoutBtn.addEventListener('click', () => this.handleLogout());
        loginBtn.addEventListener('click', () => this.openLoginModal());
        registerBtn.addEventListener('click', () => this.openRegisterModal());
    }

    enableAccess() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
        });
        
        const startBtn = document.getElementById('btn-start');
        const settingsBtn = document.getElementById('btn-settings');
        const resetBtn = document.getElementById('btn-reset');
        if (startBtn) {
            startBtn.style.pointerEvents = 'auto';
            startBtn.style.opacity = '1';
        }
        if (settingsBtn) {
            settingsBtn.style.pointerEvents = 'auto';
            settingsBtn.style.opacity = '1';
        }
        if (resetBtn) {
            resetBtn.style.pointerEvents = 'auto';
            resetBtn.style.opacity = '1';
        }
    }

    async handleLogout() {
        store.logout();
        this.isLoggedIn = false;
        this.initAuthButtons();
        this.restrictAccess();
        alert('已退出登录');
    }

    async handleLogin(username, password) {
        try {
            await store.login(username, password);
            this.isLoggedIn = true;
            this.initAuthButtons();
            this.closeAuthModal();
            window.location.reload();
        } catch (error) {
            alert('登录失败: ' + error.message);
        }
    }

    async handleRegister(username, password, nickname) {
        try {
            await store.register(username, password, nickname);
            this.isLoggedIn = true;
            this.initAuthButtons();
            this.closeAuthModal();
            window.location.reload();
        } catch (error) {
            alert('注册失败: ' + error.message);
        }
    }

    openLoginModal() {
        const modal = document.getElementById('auth-modal');
        const title = document.getElementById('auth-modal-title');
        const submitBtn = document.getElementById('auth-submit');
        
        title.textContent = '登录';
        submitBtn.textContent = '登录';
        document.getElementById('auth-password-confirm').style.display = 'none';
        document.getElementById('auth-nickname').style.display = 'none';
        
        submitBtn.onclick = () => {
            const username = document.getElementById('auth-username').value;
            const password = document.getElementById('auth-password').value;
            this.handleLogin(username, password);
        };
        
        document.getElementById('auth-cancel').onclick = () => this.closeAuthModal();
        document.getElementById('auth-modal-close').onclick = () => this.closeAuthModal();
        
        modal.classList.add('active');
    }

    openRegisterModal() {
        const modal = document.getElementById('auth-modal');
        const title = document.getElementById('auth-modal-title');
        const submitBtn = document.getElementById('auth-submit');
        const passwordInput = document.getElementById('auth-password');
        const passwordStrength = document.getElementById('password-strength');
        const usernameInput = document.getElementById('auth-username');
        const nicknameInput = document.getElementById('auth-nickname-input');
        const usernameGroup = usernameInput.parentElement;
        const nicknameGroup = nicknameInput.parentElement;
        const passwordGroup = passwordInput.parentElement;
        
        let usernameTimeout = null;
        let nicknameTimeout = null;
        
        title.textContent = '注册';
        submitBtn.textContent = '注册';
        document.getElementById('auth-password-confirm').style.display = 'block';
        document.getElementById('auth-nickname').style.display = 'block';
        
        passwordStrength.style.display = 'none';
        
        usernameInput.addEventListener('input', (e) => {
            const username = e.target.value.trim();
            
            if (usernameTimeout) {
                clearTimeout(usernameTimeout);
            }
            
            if (username.length >= 2) {
                usernameTimeout = setTimeout(async () => {
                    await this.checkUsernameAvailability(username, usernameGroup);
                }, 300);
            } else {
                this.showFieldHint('username-hint', '', '');
                usernameGroup.classList.remove('error', 'success');
            }
        });
        
        nicknameInput.addEventListener('input', (e) => {
            const nickname = e.target.value.trim();
            
            if (nicknameTimeout) {
                clearTimeout(nicknameTimeout);
            }
            
            if (nickname.length >= 2) {
                nicknameTimeout = setTimeout(async () => {
                    await this.checkNicknameAvailability(nickname, nicknameGroup);
                }, 300);
            } else {
                this.showFieldHint('nickname-hint', '', '');
                nicknameGroup.classList.remove('error', 'success');
            }
        });
        
        passwordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            
            if (password.length > 0) {
                passwordStrength.style.display = 'block';
            } else {
                passwordStrength.style.display = 'none';
            }
            
            this.validatePassword(password);
        });
        
        passwordInput.addEventListener('blur', (e) => {
            const password = e.target.value;
            const isValid = this.validatePassword(password);
            if (password && !isValid) {
                passwordGroup.classList.add('error');
                passwordGroup.classList.remove('success');
            } else if (password && isValid) {
                passwordGroup.classList.add('success');
                passwordGroup.classList.remove('error');
            }
        });
        
        submitBtn.onclick = async () => {
            const username = document.getElementById('auth-username').value.trim();
            const password = document.getElementById('auth-password').value;
            const confirmPassword = document.getElementById('auth-password-confirm-input').value;
            const nickname = document.getElementById('auth-nickname-input').value.trim();
            
            if (!username) {
                this.showFieldHint('username-hint', '请输入用户名', 'error');
                usernameGroup.classList.add('error');
                return;
            }
            
            const isUsernameAvailable = await this.checkUsernameAvailability(username, usernameGroup);
            if (!isUsernameAvailable) {
                return;
            }
            
            if (nickname && !await this.checkNicknameAvailability(nickname, nicknameGroup)) {
                return;
            }
            
            if (!this.validatePassword(password)) {
                passwordStrength.style.display = 'block';
                alert('请确保密码满足所有安全要求');
                passwordGroup.classList.add('error');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('两次输入的密码不一致');
                return;
            }
            
            this.handleRegister(username, password, nickname);
        };
        
        document.getElementById('auth-cancel').onclick = () => this.closeAuthModal();
        document.getElementById('auth-modal-close').onclick = () => this.closeAuthModal();
        
        modal.classList.add('active');
    }
    
    async checkUsernameAvailability(username, formGroup) {
        const hint = document.getElementById('username-hint');
        
        if (!username) {
            hint.classList.remove('visible', 'error', 'success');
            formGroup.classList.remove('error', 'success');
            return true;
        }
        
        try {
            const available = await Api.checkUsername(username);
            
            if (available) {
                this.showFieldHint('username-hint', '✓ 用户名可用', 'success');
                formGroup.classList.add('success');
                formGroup.classList.remove('error');
                return true;
            } else {
                this.showFieldHint('username-hint', '✗ 用户名已被注册', 'error');
                formGroup.classList.add('error');
                formGroup.classList.remove('success');
                return false;
            }
        } catch (error) {
            console.error('Check username error:', error);
            return true;
        }
    }
    
    async checkNicknameAvailability(nickname, formGroup) {
        const hint = document.getElementById('nickname-hint');
        
        if (!nickname) {
            hint.classList.remove('visible', 'error', 'success');
            formGroup.classList.remove('error', 'success');
            return true;
        }
        
        try {
            const available = await Api.checkNickname(nickname);
            
            if (available) {
                this.showFieldHint('nickname-hint', '✓ 昵称可用', 'success');
                formGroup.classList.add('success');
                formGroup.classList.remove('error');
                return true;
            } else {
                this.showFieldHint('nickname-hint', '✗ 昵称已被使用', 'error');
                formGroup.classList.add('error');
                formGroup.classList.remove('success');
                return false;
            }
        } catch (error) {
            console.error('Check nickname error:', error);
            return true;
        }
    }
    
    showFieldHint(id, message, type) {
        const hint = document.getElementById(id);
        hint.textContent = message;
        hint.classList.remove('visible', 'error', 'success');
        if (type && type.trim()) {
            hint.classList.add('visible', type);
        }
    }
    
    validatePassword(password) {
        const hasLength = password.length >= 8;
        const hasLetters = /[A-Z]/.test(password) && /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        
        this.updateRequirement('req-length', hasLength);
        this.updateRequirement('req-letters', hasLetters);
        this.updateRequirement('req-number', hasNumber);
        
        const fulfilledCount = [hasLength, hasLetters, hasNumber].filter(Boolean).length;
        this.updateStrengthBar(fulfilledCount);
        
        return hasLength && hasLetters && hasNumber;
    }
    
    updateRequirement(id, fulfilled) {
        const element = document.getElementById(id);
        const icon = element.querySelector('.req-icon');
        
        if (fulfilled) {
            element.classList.add('fulfilled');
            icon.textContent = '✓';
        } else {
            element.classList.remove('fulfilled');
            icon.textContent = '✗';
        }
    }
    
    updateStrengthBar(count) {
        const bar = document.getElementById('strength-bar-fill');
        
        bar.classList.remove('weak', 'fair', 'strong');
        
        switch (count) {
            case 0:
                bar.style.width = '0%';
                break;
            case 1:
                bar.classList.add('weak');
                break;
            case 2:
                bar.classList.add('fair');
                break;
            case 3:
                bar.classList.add('strong');
                break;
        }
    }

    closeAuthModal() {
        document.getElementById('auth-modal').classList.remove('active');
        document.getElementById('auth-username').value = '';
        document.getElementById('auth-password').value = '';
        document.getElementById('auth-password-confirm-input').value = '';
        document.getElementById('auth-nickname-input').value = '';
        
        document.getElementById('password-strength').style.display = 'none';
        
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error', 'success');
        });
        
        document.querySelectorAll('.field-hint').forEach(hint => {
            hint.classList.remove('visible', 'error', 'success');
        });
        
        document.querySelectorAll('.requirement').forEach(req => {
            req.classList.remove('fulfilled');
            req.querySelector('.req-icon').textContent = '✗';
        });
        
        const bar = document.getElementById('strength-bar-fill');
        bar.classList.remove('weak', 'fair', 'strong');
        bar.style.width = '0%';
    }

    initTabNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.isLoggedIn) {
                    alert('请先登录');
                    return;
                }
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    switchTab(tab) {
        if (this.currentTab === tab) return;
        
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-tab="' + tab + '"]').classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(tab).classList.add('active');
        
        this.currentTab = tab;
        
        if (tab === 'profile') {
            this.profile.refresh();
        }
    }

    async initModules() {
        this.timer = new Timer();
        this.todo = new Todo();
        this.stats = new Stats();
        this.profile = new Profile();
    }

    async refreshModules() {
        await this.todo.render();
        await this.stats.refresh();
        await this.timer.loadCompletedSessions();
        await this.timer.updateStats();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

window.toggleTodo = async function(todoId) {
    await fetch('http://localhost:8090/api/todos/' + todoId + '/toggle', {
        method: 'PATCH',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    
    if (window.app?.profile) {
        window.app.profile.refresh();
    }
    
    if (window.app?.todo) {
        await window.app.todo.render();
    }
};
