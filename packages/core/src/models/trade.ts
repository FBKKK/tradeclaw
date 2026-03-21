import { z } from 'zod'

export const TradeSide = z.enum(['buy', 'sell', 'long', 'short'])
export type TradeSide = z.infer<typeof TradeSide>

export const TradeStatus = z.enum([
  'pending',
  'submitted',
  'filled',
  'partial_fill',
  'cancelled',
  'rejected',
  'failed',
])

export type TradeStatus = z.infer<typeof TradeStatus>

export const TradeSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  strategyId: z.string().uuid().optional(),
  exchange: z.string().min(1).max(50),
  symbol: z.string().min(1).max(50),
  side: TradeSide,
  quantity: z.number().positive(),
  price: z.number().nonnegative().nullable(),
  status: TradeStatus,
  simulation: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().optional(),
  filledAt: z.date().optional(),
})

export type Trade = z.infer<typeof TradeSchema>

export const TradeCreateSchema = z.object({
  strategyId: z.string().uuid().optional(),
  exchange: z.string().min(1).max(50),
  symbol: z.string().min(1).max(50),
  side: TradeSide,
  quantity: z.number().positive(),
  price: z.number().nonnegative().optional(),
  simulation: z.boolean().default(true),
})

export type TradeCreate = z.infer<typeof TradeCreateSchema>

export const PositionSchema = z.object({
  id: z.string(),
  accountId: z.string().uuid(),
  exchange: z.string(),
  symbol: z.string(),
  side: z.enum(['long', 'short']),
  quantity: z.number(),
  entryPrice: z.number(),
  currentPrice: z.number(),
  unrealizedPnl: z.number(),
  realizedPnl: z.number().default(0),
  updatedAt: z.date(),
})

export type Position = z.infer<typeof PositionSchema>

export const AccountSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  exchange: z.string().min(1).max(50),
  accountType: z.enum(['live', 'simulation', 'paper']),
  apiKeyEncrypted: z.string(),
  apiSecretEncrypted: z.string(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().optional(),
})

export type Account = z.infer<typeof AccountSchema>

export const AccountCreateSchema = z.object({
  exchange: z.string().min(1).max(50),
  accountType: z.enum(['live', 'simulation', 'paper']),
  apiKey: z.string(),
  apiSecret: z.string(),
})

export type AccountCreate = z.infer<typeof AccountCreateSchema>
