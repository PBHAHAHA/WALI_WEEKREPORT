# 📅 Wali WeekReport

> 一个现代化的智能周报管理系统，基于 Nuxt 4 + NestJS 构建

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D8.0.0-orange)](https://pnpm.io/)

## 🌐 在线演示

- [在线演示](https://your-demo-url.com)

## ✨ 特性

- 🤖 **AI 辅助生成**: 基于日报内容智能生成周报
- 📝 **富文本编辑**: 支持 Markdown 和富文本编辑器
- 📋 **模板管理**: 自定义周报模板，提高效率
- 👥 **用户系统**: 完整的用户注册、登录、认证功能
- 🎨 **现代化 UI**: 基于 TailwindCSS 的精美界面
- 🚀 **高性能**: Nuxt 4 SSR + NestJS 后端，快速响应
- 📦 **Monorepo 架构**: 基于 pnpm workspace 的现代化工程化


## 📦 项目结构

```
report/
├── apps/
│   ├── week_report/              # 前端项目 (@week-report/web)
│   │   ├── app/                  # Nuxt 应用目录
│   │   │   ├── components/       # Vue 组件
│   │   │   ├── composables/      # Vue Composables
│   │   │   ├── layouts/          # 布局组件
│   │   │   ├── middleware/       # 路由中间件
│   │   │   ├── pages/            # 页面组件
│   │   │   └── utils/            # 工具函数
│   │   ├── public/               # 静态资源
│   │   ├── nuxt.config.ts        # Nuxt 配置
│   │   └── package.json
│   └── week_report_server/       # 后端项目 (@week-report/server)
│       ├── src/                  # NestJS 源码
│       │   ├── auth/             # 认证模块
│       │   ├── daily-logs/       # 日报模块
│       │   ├── weekly-reports/   # 周报模块
│       │   ├── templates/        # 模板模块
│       │   └── users/            # 用户模块
│       ├── test/                 # 测试文件
│       └── package.json
├── pnpm-workspace.yaml           # pnpm workspace 配置
├── package.json                  # 根 package.json
├── LICENSE                       # MIT 许可证
├── CONTRIBUTING.md               # 贡献指南
└── README.md
```

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 环境变量配置

#### 前端配置

在 `apps/week_report/` 目录下创建 `.env` 文件：

```bash
cd apps/week_report
cp .env.example .env
```

编辑 `.env` 文件：

```env
# API Configuration
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

#### 后端配置

在 `apps/week_report_server/` 目录下创建 `.env` 文件：

```bash
cd apps/week_report_server
cp .env.example .env
```

编辑 `.env` 文件：

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=week_report

# JWT
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Server
PORT=3001
```

### 安装依赖

在项目根目录执行：

```bash
pnpm install
```

这会自动安装所有子包的依赖。

### 开发模式

#### 同时启动前后端

```bash
pnpm dev
```

#### 单独启动前端

```bash
pnpm dev:web
```

前端将运行在 `http://localhost:3000`

#### 单独启动后端

```bash
pnpm dev:server
```

后端 API 将运行在 `http://localhost:3001`

### 构建

#### 构建所有项目

```bash
pnpm build
```

#### 单独构建前端

```bash
pnpm build:web
```

#### 单独构建后端

```bash
pnpm build:server
```

### 生产环境运行

```bash
pnpm start
```

## 📝 子包说明

### @week-report/web (前端)

- **框架**: Nuxt 3 (Vue 3)
- **样式**: TailwindCSS 4.x
- **编辑器**: Tiptap (ProseMirror)
- **图标**: Lucide Icons
- **语言**: TypeScript
- **端口**: 3000
- **目录**: `apps/week_report/`

### @week-report/server (后端)

- **框架**: NestJS
- **ORM**: TypeORM
- **数据库**: MySQL
- **认证**: JWT + Passport
- **邮件**: Resend
- **语言**: TypeScript
- **端口**: 3001
- **目录**: `apps/week_report_server/`

## 🛠️ 常用命令

```bash
# 安装依赖
pnpm install

# 开发模式（前后端同时启动）
pnpm dev

# 单独启动前端
pnpm dev:web

# 单独启动后端
pnpm dev:server

# 构建所有项目
pnpm build

# 代码检查
pnpm lint

# 清理所有 node_modules 和构建产物
pnpm clean
```

## � 数据库设置

### MySQL 安装

1. 安装 MySQL 8.0+
2. 创建数据库：

```sql
CREATE DATABASE week_report CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. 创建用户并授权：

```sql
CREATE USER 'week_report_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON week_report.* TO 'week_report_user'@'localhost';
FLUSH PRIVILEGES;
```

## 📝 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 👏 致谢

- [Nuxt](https://nuxt.com/) - 直观的 Vue 框架
- [NestJS](https://nestjs.com/) - 渐进式的 Node.js 框架
- [TailwindCSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Tiptap](https://tiptap.dev/) - 无头富文本编辑器
- [Lucide](https://lucide.dev/) - 美丽的开源图标
