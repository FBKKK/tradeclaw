# TradeClaw

AI-powered trading assistant with real-time market data integration.

## 项目结构

```
packages/
├── core/          # 核心模块：数据模型、API 客户端 (SosoValue)
├── agent/         # Agent 逻辑：Skills 系统、工具定义
├── server/        # Hono 后端：API 路由、认证、中间件
├── ui/            # React 前端：Vite + TailwindCSS
├── exchange-adapters/  # 交易所适配器 (Alpaca, CCXT)
├── monitor/      # 价格监控服务
└── mcp-server/   # MCP 协议服务
```

## 技术栈

- **前端**: React 18, Vite, TailwindCSS, React Router, Zustand
- **后端**: Hono, Node.js, TypeScript
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **数据源**: SosoValue API (加密货币市场数据)

## 核心功能

### 1. Chat 对话 (AI 交易助手)

**实现状态**: 已完成，使用真实市场数据

- `/api/chat` - 非流式对话
- `/api/chat/stream` - SSE 流式对话
- 多轮工具调用支持 (Agentic AI)
- Skills 渐进式披露系统

**Skills 系统** (`packages/agent/src/skills/index.ts`):

| Skill | Level | 工具 |
|-------|-------|------|
| market_query | basic | search_tokens, get_global_market, get_token_list, get_hot_sectors, get_news |
| alerts | basic | create_alert, list_alerts, delete_alert |
| index_analysis | intermediate | get_index_info, get_etf_data, get_chart_data |
| trading | intermediate | get_strategies, create_strategy, backtest_strategy, execute_trade, get_positions |
| reports | intermediate | generate_daily_report, generate_weekly_report, generate_monthly_report |
| on_chain_analysis | advanced | get_chain_stats, get_btc_holdings, get_crypto_stocks |

### 2. SosoValue API 集成

**文件**: `packages/core/src/sosovalue.ts`

- 20+ API 端点
- 市场数据、指数、ETF、加密股票、链上数据、新闻、搜索
- 自动处理响应格式 (`code: '0'`, `'200'`, `'00000'` 都是成功)

### 3. Auth 认证

- JWT token 认证
- localStorage 存储 accessToken/refreshToken
- `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`

## 环境配置

### 开发环境
```bash
pnpm install
pnpm dev        # 并行启动所有包的 dev 模式
```

- Server: http://localhost:3000
- UI: http://localhost:5173 (proxy 到 server)

### 生产环境 (Vercel)

**前端**: https://tradeclaw.vercel.app
- `vercel.json` 配置 buildCommand 和 VITE_API_URL
- SPA rewrites 配置

**后端 API**: https://tradeclaw-api.onrender.com
- 部署在 Render.com

### Vite 环境变量

```bash
VITE_API_URL=https://tradeclaw-api.onrender.com/api
```

## 关键文件

| 文件 | 说明 |
|------|------|
| `packages/server/src/routes/chat.ts` | Chat 路由，多轮 tool calling |
| `packages/agent/src/skills/index.ts` | Skills 定義和工具執行 |
| `packages/core/src/sosovalue.ts` | SosoValue API 客戶端 |
| `packages/ui/src/hooks/useChat.ts` | Chat UI 状态管理 |
| `packages/ui/src/api/client.ts` | API 客户端，配置 VITE_API_URL |

## 测试

```bash
# 本地测试 chat API
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "查询 BTC 价格"}'

# 流式测试
curl -X POST http://localhost:3000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}'
```

## 部署

```bash
# 推送到 GitHub 触发 Vercel 自动部署
git push origin main

# 或手动部署
vercel --prod
```

## 待完成

1. [ ] 用户认证后端完整实现 (当前使用 mock)
2. [ ] 真实交易执行 (当前为 paper trading)
3. [ ] 数据库集成 (当前使用 in-memory store)
4. [ ] MCP Server stdio 模式连接
5. [ ] 价格预警触发通知

## Git

- `origin` = `FBKKK/tradeclaw`
- 开发分支: `main`
- **不要 force push 到 main**
