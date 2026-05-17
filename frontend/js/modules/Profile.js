import { provinces, cities, districts } from '../data/location.js';
import Storage from '../utils/storage.js';
import ImageCropper from './ImageCropper.js';
import Store from '../utils/store.js';

class Profile {
    constructor() {
        this.profileData = {};
        this.cropper = null;
        this.init();
    }

    init() {
        this.setupLocationSelectors();
        this.loadProfileData();
        this.setupEditProfileModal();
        this.setupAvatarUpload();
        this.setupAddTodoButton();
        this.initCropper();
        this.loadStats();
        this.loadTodos();
    }

    initCropper() {
        this.cropper = new ImageCropper({
            onComplete: (croppedData) => this.handleCropComplete(croppedData)
        });
    }

    loadProfileData() {
        const user = Storage.get('user', null);
        this.profileData = Storage.get('profile', {
            nickname: user?.nickname || user?.username || '',
            age: '',
            gender: '',
            province: '',
            city: '',
            district: '',
            signature: '',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
        });
        
        this.fillDisplay();
        this.fillEditForm();
    }

    fillDisplay() {
        const user = Storage.get('user', null);
        const token = localStorage.getItem('token');
        
        let displayUsername = '用户名';
        if (user?.username) {
            displayUsername = user.username;
        } else if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.sub) {
                    displayUsername = payload.sub;
                }
            } catch {}
        }
        
        document.getElementById('profile-username').textContent = displayUsername;
        document.getElementById('profile-nickname-display').textContent = this.profileData.nickname || '暂无昵称';
        document.getElementById('profile-signature-display').textContent = this.profileData.signature || '分享你的个性签名...';
        document.getElementById('profile-age-display').textContent = this.profileData.age || '-';
        
        const genderMap = { female: '女', male: '男', other: '其他' };
        document.getElementById('profile-gender-display').textContent = genderMap[this.profileData.gender] || '-';
        
        const location = [this.profileData.province, this.profileData.city, this.profileData.district]
            .filter(Boolean).join(' ');
        document.getElementById('profile-location-display').textContent = location || '-';
        
        if (this.profileData.avatar) {
            document.getElementById('profile-avatar').src = this.profileData.avatar;
        }
    }

    fillEditForm() {
        document.getElementById('edit-profile-nickname').value = this.profileData.nickname || '';
        document.getElementById('edit-profile-age').value = this.profileData.age || '';
        document.getElementById('edit-profile-signature').value = this.profileData.signature || '';
        
        if (this.profileData.gender) {
            const genderRadio = document.querySelector('input[name="edit-gender"][value="' + this.profileData.gender + '"]');
            if (genderRadio) {
                genderRadio.checked = true;
            }
        }
        
        if (this.profileData.province) {
            document.getElementById('edit-profile-province').value = this.profileData.province;
            this.updateEditCities(this.profileData.province);
            
            if (this.profileData.city) {
                document.getElementById('edit-profile-city').value = this.profileData.city;
                this.updateEditDistricts(this.profileData.province, this.profileData.city);
                
                if (this.profileData.district) {
                    document.getElementById('edit-profile-district').value = this.profileData.district;
                }
            }
        }
    }

    setupLocationSelectors() {
        const provinceSelect = document.getElementById('edit-profile-province');
        const citySelect = document.getElementById('edit-profile-city');
        const districtSelect = document.getElementById('edit-profile-district');
        
        provinces.forEach(function(province) {
            const option = document.createElement('option');
            option.value = province;
            option.textContent = province;
            provinceSelect.appendChild(option);
        });
        
        provinceSelect.addEventListener('change', function(e) {
            this.updateEditCities(e.target.value);
            citySelect.value = '';
            districtSelect.innerHTML = '<option value="">请选择区县</option>';
        }.bind(this));
        
        citySelect.addEventListener('change', function(e) {
            this.updateEditDistricts(provinceSelect.value, e.target.value);
            districtSelect.value = '';
        }.bind(this));
    }

    updateEditCities(province) {
        const citySelect = document.getElementById('edit-profile-city');
        citySelect.innerHTML = '<option value="">请选择城市</option>';
        
        const cityList = cities[province] || [];
        cityList.forEach(function(city) {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }

    updateEditDistricts(province, city) {
        const districtSelect = document.getElementById('edit-profile-district');
        districtSelect.innerHTML = '<option value="">请选择区县</option>';
        
        const provinceDistricts = districts[province];
        if (provinceDistricts) {
            const districtList = provinceDistricts[city] || [];
            districtList.forEach(function(district) {
                const option = document.createElement('option');
                option.value = district;
                option.textContent = district;
                districtSelect.appendChild(option);
            });
        }
    }

    setupEditProfileModal() {
        const editBtn = document.getElementById('btn-edit-profile');
        const closeBtn = document.getElementById('edit-profile-modal-close');
        const cancelBtn = document.getElementById('btn-cancel-edit');
        const saveBtn = document.getElementById('btn-save-edit');
        const modal = document.getElementById('edit-profile-modal');
        
        editBtn.addEventListener('click', () => this.openEditModal());
        closeBtn.addEventListener('click', () => this.closeEditModal());
        cancelBtn.addEventListener('click', () => this.closeEditModal());
        saveBtn.addEventListener('click', () => this.saveProfileFromModal());
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeEditModal();
            }
        });
    }

    openEditModal() {
        this.fillEditForm();
        document.getElementById('edit-profile-modal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeEditModal() {
        document.getElementById('edit-profile-modal').style.display = 'none';
        document.body.style.overflow = '';
    }

    saveProfileFromModal() {
        const genderRadio = document.querySelector('input[name="edit-gender"]:checked');
        const genderValue = genderRadio ? genderRadio.value : '';
        
        const formData = {
            nickname: document.getElementById('edit-profile-nickname').value.trim(),
            age: document.getElementById('edit-profile-age').value,
            gender: genderValue,
            province: document.getElementById('edit-profile-province').value,
            city: document.getElementById('edit-profile-city').value,
            district: document.getElementById('edit-profile-district').value,
            signature: document.getElementById('edit-profile-signature').value.trim(),
            avatar: this.profileData.avatar
        };
        
        Storage.set('profile', formData);
        this.profileData = formData;
        this.fillDisplay();
        this.closeEditModal();
        alert('✓ 个人资料保存成功！');
    }

    setupAvatarUpload() {
        const uploadInput = document.getElementById('avatar-upload');
        const changeAvatarBtn = document.getElementById('btn-change-avatar');
        
        const triggerUpload = () => {
            uploadInput.click();
        };
        
        changeAvatarBtn.addEventListener('click', triggerUpload);
        
        uploadInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const imageData = event.target.result;
                    this.cropper.open(imageData);
                }.bind(this);
                reader.readAsDataURL(file);
            }
            uploadInput.value = '';
        }.bind(this));
    }

    handleCropComplete(croppedData) {
        document.getElementById('profile-avatar').src = croppedData;
        this.profileData.avatar = croppedData;
        Storage.set('profile', this.profileData);
        alert('✓ 头像上传成功！');
    }

    setupAddTodoButton() {
        const addBtn = document.getElementById('btn-add-todo-from-profile');
        addBtn.addEventListener('click', () => {
            const modal = document.getElementById('todo-modal');
            const title = document.getElementById('todo-modal-title');
            const todoTitle = document.getElementById('todo-title');
            const todoDescription = document.getElementById('todo-description');
            const todoDueDate = document.getElementById('todo-due-date');
            
            title.textContent = '添加待办';
            todoTitle.value = '';
            todoDescription.value = '';
            todoDueDate.value = '';
            
            modal.classList.add('active');
        });
    }

    async loadStats() {
        const stats = await Store.getStats();
        document.getElementById('profile-today-minutes').textContent = stats.todayMinutes;
        document.getElementById('profile-week-minutes').textContent = stats.weekMinutes;
        document.getElementById('profile-completed-sessions').textContent = stats.totalSessions || stats.completedPomodoros || 0;
        document.getElementById('profile-streak-days').textContent = stats.streakDays;
        
        const dailyData = stats.dailyStats || stats.dailyRecords || [];
        this.renderDailyChart(dailyData);
    }

    renderDailyChart(dailyData) {
        const days = ['一', '二', '三', '四', '五', '六', '日'];
        const chartContainer = document.getElementById('profile-daily-chart');
        
        if (!dailyData || dailyData.length === 0) {
            chartContainer.innerHTML = '<div class="empty-state"><p>暂无学习记录</p></div>';
            return;
        }
        
        const allMinutes = dailyData.map(r => r.minutes || r.duration || 0);
        const maxMinutes = Math.max(...allMinutes);
        const minBase = 25;
        const chartMax = Math.max(maxMinutes, minBase);
        
        chartContainer.innerHTML = `
            <div class="chart-bars">
                ${dailyData.map((record, index) => {
                    const minutes = record.minutes || record.duration || 0;
                    const height = chartMax > 0 ? Math.max((minutes / chartMax) * 100, 2) : 2;
                    return `
                        <div class="chart-bar-item">
                            <div class="bar-container">
                                <div class="bar" style="height: ${height}%"></div>
                            </div>
                            <div class="bar-label">${days[index] || '?'}</div>
                            <div class="bar-value">${minutes}m</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    async loadTodos() {
        const todos = await Store.getTodos();
        const pendingTodos = todos.filter(t => !t.completed);
        const list = document.getElementById('profile-todo-list');
        
        if (pendingTodos.length === 0) {
            list.innerHTML = '<div class="empty-state"><p>📝 暂无待办任务</p></div>';
            return;
        }
        
        list.innerHTML = pendingTodos.slice(0, 5).map(todo => `
            <div class="todo-item">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                    onclick="toggleTodo(${todo.id})">
                <span>${todo.title}</span>
                <span class="todo-due">${todo.dueDate || ''}</span>
            </div>
        `).join('');
    }

    refresh() {
        this.loadProfileData();
        this.loadStats();
        this.loadTodos();
    }
}

export default Profile;