import { z } from 'zod'

export const StrategyConfigSchema = z.object({
  entryConditions: z.array(z.object({
    type: z.enum(['price_above', 'price_below', 'volume_above', 'indicator']),
    symbol: z.string(),
    exchange: z.string(),
    value: z.number(),
    indicator: z.string().optional(),
    period: z.number().optional(),
  })),
  exitConditions: z.array(z.object({
    type: z.enum(['price_above', 'price_below', 'stop_loss', 'take_profit', 'indicator']),
    value: z.number(),
    indicator: z.string().optional(),
  })),
  positionSize: z.object({
    type: z.enum(['fixed', 'percentage', 'risk_based']),
    value: z.number(),
  }),
  riskManagement: z.object({
    maxDrawdown: z.number().optional(),
    maxPositionSize: z.number().optional(),
    cooldownSeconds: z.number().default(60),
  }).optional(),
})

export type StrategyConfig = z.infer<typeof StrategyConfigSchema>

export const StrategySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  config: StrategyConfigSchema,
  isActive: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().optional(),
})

export type Strategy = z.infer<typeof StrategySchema>

export const StrategyCreateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  config: StrategyConfigSchema,
})

export type StrategyCreate = z.infer<typeof StrategyCreateSchema>

export const StrategyUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  config: StrategyConfigSchema.optional(),
  isActive: z.boolean().optional(),
})

export type StrategyUpdate = z.infer<typeof StrategyUpdateSchema>

export const BacktestResultSchema = z.object({
  strategyId: z.string().uuid(),
  startDate: z.date(),
  endDate: z.date(),
  totalTrades: z.number(),
  winningTrades: z.number(),
  losingTrades: z.number(),
  winRate: z.number(),
  totalProfit: z.number(),
  maxDrawdown: z.number(),
  sharpeRatio: z.number().optional(),
  trades: z.array(z.object({
    entryDate: z.date(),
    exitDate: z.date().optional(),
    symbol: z.string(),
    side: z.enum(['long', 'short']),
    entryPrice: z.number(),
    exitPrice: z.number().optional(),
    quantity: z.number(),
    profit: z.number(),
  })),
})

export type BacktestResult = z.infer<typeof BacktestResultSchema>
