# 🍅 番茄钟 - 专注学习助手

一个基于 Spring Boot + 原生 JavaScript 开发的番茄钟专注学习应用，帮助用户提高学习效率。

## ✨ 功能特性

### 核心功能
- **番茄钟计时器** - 支持专注、休息、长休息三种模式
- **待办清单** - 创建、编辑、删除待办任务，支持截止日期提醒
- **学习统计** - 每日/每周学习时长统计，连续打卡记录
- **用户管理** - 注册、登录、个人资料管理

### 特色功能
- 🎯 任务关联 - 将待办任务关联到计时器，完成番茄后自动更新进度
- 🔥 连续打卡 - 记录连续学习天数
- 📊 可视化图表 - 展示每日学习记录
- 🔔 截止日期提醒 - 任务到期前提醒用户
- 🗑️ 垃圾站 - 误删任务可恢复

## 🛠️ 技术栈

### 后端
- **语言**: Java 21
- **框架**: Spring Boot 3.2.x
- **数据库**: MySQL 8.0+ / H2 (开发环境)
- **缓存**: Redis
- **认证**: JWT
- **API文档**: Swagger

### 前端
- **语言**: HTML5 / CSS3 / JavaScript ES6+
- **样式**: 响应式设计，自定义主题
- **数据存储**: LocalStorage + API

## 📁 项目结构

```
├── src/main/java/com/example/app/
│   ├── controller/          # REST API 控制层
│   ├── service/             # 业务逻辑层
│   ├── repository/          # 数据访问层
│   ├── entity/              # 数据库实体
│   ├── dto/                 # 数据传输对象
│   ├── security/            # 安全认证
│   ├── config/              # 配置类
│   └── exception/           # 异常处理
├── src/main/resources/
│   ├── application.yml      # 应用配置
│   ├── application-dev.yml  # 开发环境配置
│   └── application-prod.yml # 生产环境配置
├── frontend/                # 前端静态资源
│   ├── css/                 # 样式文件
│   ├── js/                  # JavaScript 代码
│   └── index.html           # 主页面
└── pom.xml                  # Maven 依赖
```

## 🚀 快速开始

### 环境要求
- JDK 21+
- Maven 3.8+
- MySQL 8.0+ / Redis 6.0+

### 1. 克隆项目

```bash
git clone <repository-url>
cd new-code
```

### 2. 配置数据库

创建 MySQL 数据库：
```sql
CREATE DATABASE tomato_clock CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 修改配置文件

编辑 `src/main/resources/application-dev.yml`：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/tomato_clock?useSSL=false&serverTimezone=Asia/Shanghai
    username: your_username
    password: your_password
  redis:
    host: localhost
    port: 6379
```

### 4. 启动后端服务

```bash
mvn spring-boot:run
```

服务启动后访问: `http://localhost:8090`

### 5. 启动前端服务

```bash
cd frontend
python -m http.server 8081
```

前端页面: `http://localhost:8081`

## 🔌 API 接口

### 认证接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| GET | `/api/auth/check-username` | 检查用户名是否可用 |
| GET | `/api/auth/check-nickname` | 检查昵称是否可用 |

### 计时器接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/timer/records` | 创建计时记录 |
| GET | `/api/timer/records` | 获取计时记录列表 |
| DELETE | `/api/timer/records/{id}` | 删除计时记录 |

### 待办接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/todos` | 创建待办任务 |
| GET | `/api/todos` | 获取待办列表 |
| PUT | `/api/todos/{id}` | 更新待办任务 |
| PATCH | `/api/todos/{id}/toggle` | 切换完成状态 |
| DELETE | `/api/todos/{id}` | 删除待办任务 |

### 统计接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/stats` | 获取统计数据 |

### 用户接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/profile` | 获取用户信息 |
| PUT | `/api/profile` | 更新用户信息 |

## 📖 使用说明

### 1. 注册登录
- 点击右上角「注册」按钮创建账号
- 用户名需要至少2个字符，密码需要满足安全要求（8位以上，包含大小写字母和数字）

### 2. 使用番茄钟
- 设置专注时长（默认25分钟）
- 点击「开始」按钮开始计时
- 完成一个番茄后可选择继续或休息

### 3. 管理待办
- 在「个人中心」添加待办任务
- 设置截止日期，系统会提前提醒
- 完成任务后自动显示鼓励语

### 4. 查看统计
- 在「个人中心」查看学习统计
- 包括今日学习时长、本周学习时长、完成番茄数、连续打卡天数
- 柱状图展示每日学习记录

## 🎨 界面预览

### 专注页面
- 大数字计时器显示
- 当前模式标识（专注/休息/长休息）
- 今日完成统计卡片
- 任务关联功能

### 个人中心
- 用户信息展示（头像、昵称、签名等）
- 学习统计面板
- 待办任务列表
- 编辑资料弹窗

## 🔧 开发说明

### 运行测试

```bash
mvn test
```

### 构建生产版本

```bash
mvn clean package
java -jar target/tomato-clock-1.0.0.jar
```

### Swagger API 文档

启动后访问: `http://localhost:8090/swagger-ui.html`

## 📝 更新日志

### v1.0.0
- 基础番茄钟功能
- 待办清单管理
- 用户注册登录
- 学习统计展示
- 响应式设计

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**专注学习，高效生活！** 🍅✨
