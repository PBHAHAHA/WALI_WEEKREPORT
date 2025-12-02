# Week Report System - Monorepo

基于 pnpm workspace 的周报系统 Monorepo 架构。

## 📦 项目结构

```
report/
├── packages/
│   ├── week_report/          # 前端项目 (@week-report/web)
│   │   ├── app/              # Nuxt 应用目录
│   │   ├── public/           # 静态资源
│   │   └── package.json
│   └── week_report_server/   # 后端项目 (@week-report/server)
│       ├── src/              # NestJS 源码
│       ├── test/             # 测试文件
│       └── package.json
├── pnpm-workspace.yaml       # pnpm workspace 配置
├── package.json              # 根 package.json
└── README.md
```

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 环境变量配置

在前端项目目录下创建 `.env` 文件：

```bash
cd packages/week_report
cp .env.example .env
```

编辑 `.env` 文件配置 API 地址：

```env
# API Configuration
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
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

- **技术栈**: Nuxt 3, Vue 3, TailwindCSS, TypeScript
- **端口**: 3000
- **目录**: `packages/week_report/`

### @week-report/server (后端)

- **技术栈**: NestJS, TypeORM, MySQL, TypeScript
- **端口**: 3001
- **目录**: `packages/week_report_server/`

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

## 🔧 Monorepo 优势

1. **统一依赖管理**: 所有子包共享依赖，减少磁盘占用
2. **代码共享**: 可以轻松在前后端之间共享类型定义和工具函数
3. **统一脚本**: 通过根目录的脚本统一管理所有子包
4. **版本一致性**: 确保所有子包使用相同版本的共享依赖

## 📚 更多信息

- [pnpm workspace 文档](https://pnpm.io/workspaces)
- [Nuxt 3 文档](https://nuxt.com/)
- [NestJS 文档](https://nestjs.com/)
