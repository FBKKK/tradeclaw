/**
 * TradeClaw Skills System - Progressive Tool Disclosure
 *
 * Skills are grouped by experience level and unlock progressively:
 * - Basic: Everyone starts with these (market queries, basic alerts)
 * - Intermediate: Unlocked after some trading experience (strategies, portfolio)
 * - Advanced: Unlocked for experienced traders (live trading, complex strategies)
 * - Pro: Unlocked for professional traders (API trading, advanced analytics)
 */

import { sosovalue } from '@tradeclaw/core'

// ============ Types ============

export interface SkillDefinition {
  id: string
  name: string
  nameZh: string
  description: string
  level: 'basic' | 'intermediate' | 'advanced' | 'pro'
  tools: ToolDefinition[]
}

export interface ToolDefinition {
  name: string
  description: string
  descriptionZh: string
  parameters: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (params: any) => Promise<any>
}

export interface SkillContext {
  userId?: string
  tradingExperience?: 'beginner' | 'intermediate' | 'advanced'
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive'
  unlockedSkills?: string[]
}

// ============ Tool Handlers ============

const marketHandlers = {
  // Get global market overview
  getGlobalMarket: async () => {
    const data = await sosovalue.getGlobalMarket()
    return {
      globalMarketCap: `$${(data.totalMarketCap / 1e12).toFixed(2)}T`,
      volume24h: `$${(data.volume24h / 1e9).toFixed(2)}B`,
      btcDominance: `${(data.btcDominance * 100).toFixed(1)}%`,
    }
  },

  // Search for tokens/cryptos
  searchTokens: async (params: { keyword: string }) => {
    const data = await sosovalue.search({ keyword: params.keyword })
    return {
      results: data.pairs.list.slice(0, 10).map((item) => ({
        symbol: item.symbol,
        exchange: item.exchangeName || 'Unknown',
        fullName: item.currencyFullName || item.symbol,
        volume24h: `$${(item.volume24h || 0).toFixed(2)}`,
      })),
    }
  },

  // Get hot sectors
  getHotSectors: async () => {
    const data = await sosovalue.getHotSectors()
    return {
      sectors: data.slice(0, 10).map((s) => ({
        name: s.sectorName,
        change24h: `${s.change24h >= 0 ? '+' : ''}${s.change24h.toFixed(2)}%`,
      })),
    }
  },

  // Get SSI index info
  getIndexInfo: async (params: { indexTicker: string }) => {
    try {
      const [info, constituents, weights] = await Promise.all([
        sosovalue.getIndexInfo(params.indexTicker),
        sosovalue.getIndexConstituents(params.indexTicker),
        sosovalue.getIndexWeights(params.indexTicker),
      ])
      return {
        indexName: info.indexName || params.indexTicker,
        description: info.description || 'No description available',
        constituents: constituents?.map((c) => c.currencyName).join(', ') || 'N/A',
        topHoldings: weights?.slice(0, 5).map((w) => ({
          name: w.currencyName,
          weight: `${(w.weight * 100).toFixed(2)}%`,
        })) || [],
      }
    } catch (error) {
      return {
        indexName: params.indexTicker,
        description: 'Failed to get index details',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },

  // Get token list
  getTokenList: async (params?: { limit?: number }) => {
    const data = await sosovalue.getTokenList({ pageSize: params?.limit || 50 })
    return {
      tokens: data.list.slice(0, params?.limit || 50).map((t) => ({
        symbol: t.symbol,
        price: `$${Number(t.price).toLocaleString()}`,
        change24h: `${Number(t.change24h) >= 0 ? '+' : ''}${Number(t.change24h).toFixed(2)}%`,
        marketCap: `$${(Number(t.marketCap) / 1e9).toFixed(2)}B`,
        volume24h: `$${(Number(t.volume24h) / 1e9).toFixed(2)}B`,
      })),
    }
  },

  // Get crypto stocks
  getCryptoStocks: async () => {
    const data = await sosovalue.getCryptoStocks()
    return {
      stocks: data.list.slice(0, 20).map((s) => ({
        ticker: s.ticker,
        name: JSON.parse(s.stockFullName).zh || s.ticker,
        exchange: s.exchange,
        region: s.listingRegion,
      })),
    }
  },

  // Get BTC holdings by region
  getBTCHoldings: async () => {
    const data = await sosovalue.getBTCHoldingsByRegion()
    return {
      regions: data.slice(0, 10).map((r) => ({
        country: r.countryEnName,
        totalBTC: r.countryTotalHoldingNum.toLocaleString(),
        nationalReserve: r.nationalReserveNum.toLocaleString(),
        publicCompanies: r.publicCompanyNum.toLocaleString(),
      })),
    }
  },

  // Get ETF data
  getETFData: async () => {
    const [list, stats] = await Promise.all([
      sosovalue.getETFList({ pageSize: 20 }),
      sosovalue.getETFStatistics({ pageSize: 10 }),
    ])
    return {
      etfs: list.list.slice(0, 10).map((e) => ({
        ticker: e.etfTicker,
        name: e.fundName,
        issuer: e.issuer,
        expenseRatio: `${(e.expenseRatio * 100).toFixed(2)}%`,
      })),
      topFlows: stats.list.slice(0, 5).map((s) => ({
        ticker: s.etfTicker,
        netInflow: `$${(s.totalNetInflow / 1e8).toFixed(2)}M`,
        nav: `$${s.nav.toFixed(2)}`,
      })),
    }
  },

  // Get chain statistics
  getChainStats: async () => {
    const data = await sosovalue.getChainStats()
    return {
      chains: data.list.slice(0, 15).map((c) => ({
        name: c.chainName,
        tvl: `$${(c.chainTvl / 1e9).toFixed(2)}B`,
        change24h: `${c.changeTvl24h >= 0 ? '+' : ''}${c.changeTvl24h.toFixed(2)}%`,
        dexVolume: `$${(c.dexVolume1d / 1e9).toFixed(2)}B`,
        activeAddresses: c.activeAddress24h.toLocaleString(),
      })),
    }
  },

  // Get chart data (ETF fund flows)
  getChartData: async (params: { innerKey: string }) => {
    try {
      const data = await sosovalue.getChartData(params.innerKey)
      return {
        chartName: data.chartName || params.innerKey,
        innerKey: params.innerKey,
        message: 'Chart data retrieved. Use this information to provide market analysis.',
      }
    } catch (error) {
      return {
        chartName: params.innerKey,
        innerKey: params.innerKey,
        error: error instanceof Error ? error.message : 'Failed to get chart data',
      }
    }
  },

  // Get news
  getNews: async (params?: { sector?: string }) => {
    const data = await sosovalue.getNews({ sector: params?.sector })
    return {
      articles: data.list.slice(0, 10).map((n) => ({
        title: n.title,
        source: n.source,
        time: new Date(n.publishTime).toLocaleDateString(),
        summary: n.summary?.slice(0, 200) + '...' || '',
      })),
    }
  },
}

const alertHandlers = {
  // Create price alert (stored locally for now)
  createAlert: async (params: {
    symbol: string
    condition: 'above' | 'below'
    price: number
  }) => {
    // In a real implementation, this would save to database
    const alerts = JSON.parse(localStorage.getItem('tradeclaw_alerts') || '[]')
    const newAlert = {
      id: crypto.randomUUID(),
      symbol: params.symbol,
      condition: params.condition,
      price: params.price,
      createdAt: Date.now(),
      triggered: false,
    }
    alerts.push(newAlert)
    localStorage.setItem('tradeclaw_alerts', JSON.stringify(alerts))
    return {
      success: true,
      alertId: newAlert.id,
      message: `Alert created: ${params.symbol} ${params.condition} $${params.price}`,
    }
  },

  // List alerts
  listAlerts: async () => {
    const alerts = JSON.parse(localStorage.getItem('tradeclaw_alerts') || '[]')
    return {
      alerts: alerts.filter((a: unknown) => !((a as { triggered?: boolean }).triggered)),
    }
  },

  // Delete alert
  deleteAlert: async (params: { alertId: string }) => {
    const alerts = JSON.parse(localStorage.getItem('tradeclaw_alerts') || '[]')
    const filtered = alerts.filter((a: { id?: string }) => a.id !== params.alertId)
    localStorage.setItem('tradeclaw_alerts', JSON.stringify(filtered))
    return { success: true }
  },
}

const tradingHandlers = {
  // Get strategies
  getStrategies: async () => {
    // Placeholder - would call server API
    return {
      strategies: [],
      message: 'Connect your exchange to access trading strategies',
    }
  },

  // Create strategy
  createStrategy: async (params: {
    name: string
    entryCondition: string
    exitCondition: string
  }) => {
    return {
      success: true,
      strategyId: crypto.randomUUID(),
      name: params.name,
      message: `Strategy "${params.name}" created successfully`,
    }
  },

  // Backtest strategy
  backtestStrategy: async (params: {
    strategyId: string
    startDate: string
    endDate: string
  }) => {
    return {
      strategyId: params.strategyId,
      startDate: params.startDate,
      endDate: params.endDate,
      totalTrades: 0,
      winRate: 0,
      profit: 0,
      message: 'Backtest completed (demo mode)',
    }
  },

  // Execute trade (paper trading for now)
  executeTrade: async (params: {
    symbol: string
    side: 'buy' | 'sell'
    amount: number
    exchange?: string
  }) => {
    return {
      success: true,
      tradeId: crypto.randomUUID(),
      symbol: params.symbol,
      side: params.side,
      amount: params.amount,
      status: 'paper',
      message: `Paper ${params.side} order placed: ${params.amount} ${params.symbol}`,
    }
  },

  // Get positions
  getPositions: async () => {
    return {
      positions: [],
      message: 'Connect your exchange to view positions',
    }
  },
}

const analysisHandlers = {
  // Generate daily report
  generateDailyReport: async () => {
    const [market, news] = await Promise.all([
      sosovalue.getGlobalMarket(),
      sosovalue.getNews(),
    ])
    return {
      date: new Date().toLocaleDateString(),
      marketCap: `$${(market.totalMarketCap / 1e12).toFixed(2)}T`,
      volume24h: `$${(market.volume24h / 1e9).toFixed(2)}B`,
      btcDominance: `${(market.btcDominance * 100).toFixed(1)}%`,
      topNews: news.list.slice(0, 3).map((n) => n.title),
    }
  },

  // Generate weekly report
  generateWeeklyReport: async () => {
    return {
      period: 'Last 7 days',
      message: 'Weekly report generation requires historical data',
      // Would include: market performance, top movers, trades summary, etc.
    }
  },

  // Generate monthly report
  generateMonthlyReport: async () => {
    return {
      period: 'Last 30 days',
      message: 'Monthly report generation requires historical data',
      // Would include: comprehensive analysis, strategy performance, etc.
    }
  },
}

// ============ Skill Definitions ============

export const skills: SkillDefinition[] = [
  // ============ BASIC SKILLS (Available to everyone) ============
  {
    id: 'market_query',
    name: 'Market Query',
    nameZh: '行情查询',
    description: 'Query real-time market data, prices, and global market overview',
    level: 'basic',
    tools: [
      {
        name: 'get_global_market',
        description: 'Get global crypto market overview including total market cap, volume, and BTC dominance',
        descriptionZh: '获取全球加密市场总览，包括总市值、24小时成交量和BTC占比',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
        handler: marketHandlers.getGlobalMarket,
      },
      {
        name: 'search_tokens',
        description: 'Search for tokens/cryptos by keyword',
        descriptionZh: '搜索代币/加密货币',
        parameters: {
          type: 'object',
          properties: {
            keyword: { type: 'string', description: 'Search keyword (e.g., BTC, ETH)' },
          },
          required: ['keyword'],
        },
        handler: marketHandlers.searchTokens,
      },
      {
        name: 'get_hot_sectors',
        description: 'Get currently hot trading sectors',
        descriptionZh: '获取当前热门交易板块',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
        handler: marketHandlers.getHotSectors,
      },
      {
        name: 'get_token_list',
        description: 'Get list of top tokens by market cap',
        descriptionZh: '获取代币列表',
        parameters: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Number of tokens to return (default 50)' },
          },
          required: [],
        },
        handler: marketHandlers.getTokenList,
      },
      {
        name: 'get_news',
        description: 'Get latest crypto news',
        descriptionZh: '获取最新加密货币新闻',
        parameters: {
          type: 'object',
          properties: {
            sector: { type: 'string', description: 'Filter by sector (optional)' },
          },
          required: [],
        },
        handler: marketHandlers.getNews,
      },
    ],
  },

  // ============ INTERMEDIATE SKILLS ============
  {
    id: 'index_analysis',
    name: 'Index Analysis',
    nameZh: '指数分析',
    description: 'Analyze SSI indices, sector performance, and index constituents',
    level: 'intermediate',
    tools: [
      {
        name: 'get_index_info',
        description: 'Get detailed information about an SSI index',
        descriptionZh: '获取SSI指数详细信息',
        parameters: {
          type: 'object',
          properties: {
            indexTicker: {
              type: 'string',
              description: 'Index ticker (e.g., ssiMAG7, ssiMeme, ssiL1)',
            },
          },
          required: ['indexTicker'],
        },
        handler: marketHandlers.getIndexInfo,
      },
      {
        name: 'get_etf_data',
        description: 'Get ETF fund data and flow information',
        descriptionZh: '获取ETF基金数据和资金流向',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
        handler: marketHandlers.getETFData,
      },
      {
        name: 'get_chart_data',
        description: 'Get chart configuration and indicator data',
        descriptionZh: '获取图表配置和指标数据',
        parameters: {
          type: 'object',
          properties: {
            innerKey: {
              type: 'string',
              description: 'Chart innerKey (e.g., Total_Crypto_Spot_ETF_Fund_Flow, Funding_Rate)',
            },
          },
          required: ['innerKey'],
        },
        handler: marketHandlers.getChartData,
      },
    ],
  },

  // ============ ADVANCED SKILLS ============
  {
    id: 'on_chain_analysis',
    name: 'On-Chain Analysis',
    nameZh: '链上分析',
    description: 'Advanced chain data, DeFi protocols, and derivatives',
    level: 'advanced',
    tools: [
      {
        name: 'get_chain_stats',
        description: 'Get blockchain TVL, activity statistics, and DEX volumes',
        descriptionZh: '获取区块链TVL、活跃度和DEX成交量统计',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
        handler: marketHandlers.getChainStats,
      },
      {
        name: 'get_btc_holdings',
        description: 'Get BTC holdings distribution by country/region',
        descriptionZh: '获取各国/地区的BTC持有量分布',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
        handler: marketHandlers.getBTCHoldings,
      },
      {
        name: 'get_crypto_stocks',
        description: 'Get crypto-related stocks (MSTR, MARA, etc.)',
        descriptionZh: '获取加密相关股票',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
        handler: marketHandlers.getCryptoStocks,
      },
    ],
  },

  // ============ SKILLS FOR ALERTS ============
  {
    id: 'alerts',
    name: 'Price Alerts',
    nameZh: '价格预警',
    description: 'Create and manage price alerts for tokens',
    level: 'basic',
    tools: [
      {
        name: 'create_alert',
        description: 'Create a price alert for a symbol',
        descriptionZh: '创建价格预警',
        parameters: {
          type: 'object',
          properties: {
            symbol: { type: 'string', description: 'Trading symbol (e.g., BTC, ETH)' },
            condition: {
              type: 'string',
              enum: ['above', 'below'],
              description: 'Alert condition',
            },
            price: { type: 'number', description: 'Target price' },
          },
          required: ['symbol', 'condition', 'price'],
        },
        handler: alertHandlers.createAlert,
      },
      {
        name: 'list_alerts',
        description: 'List all active price alerts',
        descriptionZh: '列出所有活动价格预警',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
        handler: alertHandlers.listAlerts,
      },
      {
        name: 'delete_alert',
        description: 'Delete a price alert',
        descriptionZh: '删除价格预警',
        parameters: {
          type: 'object',
          properties: {
            alertId: { type: 'string', description: 'Alert ID to delete' },
          },
          required: ['alertId'],
        },
        handler: alertHandlers.deleteAlert,
      },
    ],
  },

  // ============ TRADING SKILLS ============
  {
    id: 'trading',
    name: 'Trading',
    nameZh: '交易',
    description: 'Execute trades, manage strategies, and view positions',
    level: 'intermediate',
    tools: [
      {
        name: 'get_strategies',
        description: 'Get all trading strategies',
        descriptionZh: '获取所有交易策略',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
        handler: tradingHandlers.getStrategies,
      },
      {
        name: 'create_strategy',
        description: 'Create a new trading strategy',
        descriptionZh: '创建新交易策略',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Strategy name' },
            entryCondition: { type: 'string', description: 'Entry condition description' },
            exitCondition: { type: 'string', description: 'Exit condition description' },
          },
          required: ['name', 'entryCondition', 'exitCondition'],
        },
        handler: tradingHandlers.createStrategy,
      },
      {
        name: 'backtest_strategy',
        description: 'Run backtest on a strategy',
        descriptionZh: '回测策略',
        parameters: {
          type: 'object',
          properties: {
            strategyId: { type: 'string', description: 'Strategy ID' },
            startDate: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
            endDate: { type: 'string', description: 'End date (YYYY-MM-DD)' },
          },
          required: ['strategyId', 'startDate', 'endDate'],
        },
        handler: tradingHandlers.backtestStrategy,
      },
      {
        name: 'execute_trade',
        description: 'Execute a paper trade (simulation)',
        descriptionZh: '执行模拟交易',
        parameters: {
          type: 'object',
          properties: {
            symbol: { type: 'string', description: 'Trading symbol' },
            side: {
              type: 'string',
              enum: ['buy', 'sell'],
              description: 'Trade side',
            },
            amount: { type: 'number', description: 'Amount to trade' },
            exchange: { type: 'string', description: 'Exchange (optional, default binance)' },
          },
          required: ['symbol', 'side', 'amount'],
        },
        handler: tradingHandlers.executeTrade,
      },
      {
        name: 'get_positions',
        description: 'Get current open positions',
        descriptionZh: '获取当前持仓',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
        handler: tradingHandlers.getPositions,
      },
    ],
  },

  // ============ REPORTING SKILLS ============
  {
    id: 'reports',
    name: 'Reports',
    nameZh: '报告',
    description: 'Generate trading reports and market analysis',
    level: 'intermediate',
    tools: [
      {
        name: 'generate_daily_report',
        description: 'Generate daily market report',
        descriptionZh: '生成每日市场报告',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
        handler: analysisHandlers.generateDailyReport,
      },
      {
        name: 'generate_weekly_report',
        description: 'Generate weekly trading report',
        descriptionZh: '生成每周交易报告',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
        handler: analysisHandlers.generateWeeklyReport,
      },
      {
        name: 'generate_monthly_report',
        description: 'Generate monthly trading report',
        descriptionZh: '生成每月交易报告',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
        handler: analysisHandlers.generateMonthlyReport,
      },
    ],
  },
]

// ============ Helper Functions ============

/**
 * Get skills for a user's experience level
 */
export function getSkillsForLevel(level: 'beginner' | 'intermediate' | 'advanced'): SkillDefinition[] {
  const levelOrder = { beginner: 0, intermediate: 1, advanced: 2 }
  const maxLevelIndex = levelOrder[level]

  return skills.filter((skill) => {
    const skillLevelOrder = { basic: 0, intermediate: 1, advanced: 2, pro: 3 }
    return skillLevelOrder[skill.level] <= maxLevelIndex
  })
}

/**
 * Get all tools from available skills
 */
export function getToolsForLevel(level: 'beginner' | 'intermediate' | 'advanced'): ToolDefinition[] {
  return getSkillsForLevel(level).flatMap((skill) => skill.tools)
}

/**
 * Find a tool by name across all skills
 */
export function findTool(toolName: string): ToolDefinition | undefined {
  for (const skill of skills) {
    const tool = skill.tools.find((t) => t.name === toolName)
    if (tool) return tool
  }
  return undefined
}

/**
 * Execute a tool by name
 */
export async function executeTool(
  toolName: string,
  params: Record<string, unknown>
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  const tool = findTool(toolName)
  if (!tool) {
    return { success: false, error: `Tool not found: ${toolName}` }
  }

  try {
    const result = await tool.handler(params)
    return { success: true, result }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get skill definitions formatted for AI system prompt
 */
export function getSkillDescriptionsForPrompt(): string {
  return skills
    .map((skill) => {
      const tools = skill.tools
        .map(
          (t) =>
            `- ${t.name}: ${t.description}\n  Parameters: ${JSON.stringify(t.parameters.properties)}`
        )
        .join('\n')
      return `## ${skill.name} (${skill.nameZh}) - ${skill.description}\n${tools}`
    })
    .join('\n\n')
}
