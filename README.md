# TradeClaw - Multi-User Trading Assistant Platform

A comprehensive multi-user trading assistant platform built with React 19, Hono, and TypeScript.

## Features

- **Financial Q&A** - Ask questions about finance and trading
- **Scheduled Tasks** - Generate daily, weekly reports (Cron-based)
- **Price Alerts** - Get notified when prices hit targets
- **Strategy System** - Create, backtest, and apply trading strategies
- **Multi-Exchange Trading** - Support for Binance, Bybit, OKX (CCXT) and Alpaca (stocks)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS |
| Backend | Hono + TypeScript |
| Database | PostgreSQL + Redis |
| Agent | Claude Agent SDK + MCP Server |
| Real-time | WebSocket + SSE |
| Trading | CCXT + Alpaca |

## Project Structure

```
tradeclaw/
├── packages/
│   ├── core/              # Core types and models
│   ├── server/            # Hono API server
│   ├── agent/             # Agent prompts and configuration
│   ├── mcp-server/        # MCP protocol server
│   ├── exchange-adapters/ # CCXT and Alpaca adapters
│   ├── monitor/           # Price monitoring service
│   └── ui/                # React frontend
├── schema.sql             # Database schema
├── docker-compose.yaml     # PostgreSQL and Redis
└── railway.json           # Railway deployment config
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker (for PostgreSQL and Redis)

### Setup

1. Clone and install dependencies:
```bash
cd tradeclaw
pnpm install
```

2. Start infrastructure (PostgreSQL + Redis):
```bash
docker compose up -d
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Start development servers:
```bash
pnpm dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all packages in development mode |
| `pnpm build` | Build all packages |
| `pnpm test` | Run tests |
| `pnpm typecheck` | TypeScript type checking |

## Deployment

### Railway (Backend) + Vercel (Frontend)

#### 1. Deploy Backend to Railway

```bash
# Go to railway.app
# Create new project → Deploy from GitHub
# Select this repo
# Railway auto-detects Node.js
```

Add environment variables in Railway dashboard:
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secure-secret
CORS_ORIGIN=https://your-frontend.vercel.app
```

#### 2. Deploy Frontend to Vercel

```bash
cd packages/ui
vercel
```

Set environment variable:
```
VITE_API_URL=https://your-railway-app.up.railway.app/api
```

#### 3. Update CORS

In Railway, set:
```
CORS_ORIGIN=https://your-frontend.vercel.app
```

---

### Local Development

```bash
# Start infrastructure
docker compose up -d

# Start server
cd packages/server
pnpm dev

# Start UI (another terminal)
cd packages/ui
pnpm dev
```

## Development

### Packages

- **@tradeclaw/core** - Shared types, models, and Zod schemas
- **@tradeclaw/server** - REST API server with Hono
- **@tradeclaw/ui** - React frontend application
- **@tradeclaw/mcp-server** - MCP protocol server for AI tools
- **@tradeclaw/exchange-ccxt** - CCXT exchange adapter
- **@tradeclaw/exchange-alpaca** - Alpaca stock trading adapter
- **@tradeclaw/monitor** - Price monitoring and alert engine
- **@tradeclaw/agent** - Agent prompts and configuration

### API Endpoints

| Category | Endpoints |
|----------|-----------|
| Auth | POST /api/auth/register, /api/auth/login, /api/auth/refresh |
| Users | GET /api/users/me, PATCH /api/users/me |
| Strategies | CRUD at /api/strategies, POST /api/strategies/:id/backtest, /apply |
| Alerts | CRUD at /api/alerts |
| Trades | GET /api/accounts, POST /api/trades, DELETE /api/trades/:id |
| Reports | GET /api/reports/scheduled, POST /api/reports/generate |
| Market | GET /api/market/price/:exchange/:symbol |

## Design System

The UI follows the GitHub Dark theme with these CSS variables:

```css
--color-bg: #0d1117;
--color-bg-secondary: #161b22;
--color-bg-tertiary: #21262d;
--color-border: #30363d;
--color-text: #e6edf3;
--color-text-muted: #8b949e;
--color-accent: #58a6ff;
--color-green: #3fb950;
--color-red: #f85149;
```

## License

Private - All rights reserved
