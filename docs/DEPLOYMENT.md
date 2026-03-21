# Vercel 部署指南

## 方案一：前端 Vercel + 后端 Railway（推荐）

### 1. 前端部署到 Vercel

```bash
cd packages/ui
vercel
```

环境变量：
```
VITE_API_URL=https://your-railway-app.railway.app/api
```

### 2. 后端部署到 Railway

```bash
# 在 railway.app 创建新项目
# 连接 GitHub 仓库
# 添加环境变量：
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret
```

## 方案二：纯 Vercel（需要改造）

如果坚持用 Vercel，需要改造：

### 改造内容

1. **数据库**：用 `@vercel/postgres` 替代 `pg`
2. **缓存**：用 `@vercel/kv` 替代 `ioredis`
3. **SSE**：改用 Cron + 轮询（Serverless 不支持长连接）
4. **WebSocket**：用 Pusher/Ably 替代

### 安装 Vercel 适配包

```bash
pnpm add @vercel/postgres @vercel/kv
```

### 数据库 Schema（Vercel Postgres）

```sql
-- 使用 Vercel Postgres 的管理界面创建表
-- 或使用 drizzle-kit push
```

### API 路由改造（可选）

如果想用 Vercel Serverless Functions 作为 API：

```
packages/
└── api/
    └── [route]/route.ts    # Hono 适配 Vercel
```

---

## 快速开始

### 前端仅部署

```bash
cd packages/ui
vercel --prod
```

环境变量：
- `VITE_API_URL` - 指向你的后端 API 地址

### 完整部署

1. Railway/Render 部署后端
2. Vercel 部署前端
3. 设置 `VITE_API_URL` 环境变量
