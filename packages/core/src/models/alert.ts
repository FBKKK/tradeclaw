import { z } from 'zod'

export const AlertConditionType = z.enum([
  'price_above',
  'price_below',
  'price_crosses_above',
  'price_crosses_below',
  'volume_above',
  'indicator_above',
  'indicator_below',
])

export type AlertConditionType = z.infer<typeof AlertConditionType>

export const AlertSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  symbol: z.string().min(1).max(50),
  exchange: z.string().min(1).max(50),
  conditionType: AlertConditionType,
  targetValue: z.number().nullable(),
  indicator: z.string().optional(),
  indicatorPeriod: z.number().optional(),
  enabled: z.boolean().default(true),
  cooldownSeconds: z.number().default(60),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().optional(),
  lastTriggeredAt: z.date().optional(),
})

export type Alert = z.infer<typeof AlertSchema>

export const AlertCreateSchema = z.object({
  symbol: z.string().min(1).max(50),
  exchange: z.string().min(1).max(50),
  conditionType: AlertConditionType,
  targetValue: z.number().nullable().optional(),
  indicator: z.string().optional(),
  indicatorPeriod: z.number().optional(),
  cooldownSeconds: z.number().min(0).default(60),
})

export type AlertCreate = z.infer<typeof AlertCreateSchema>

export const AlertUpdateSchema = z.object({
  conditionType: AlertConditionType.optional(),
  targetValue: z.number().nullable().optional(),
  indicator: z.string().optional(),
  indicatorPeriod: z.number().optional(),
  enabled: z.boolean().optional(),
  cooldownSeconds: z.number().min(0).optional(),
})

export type AlertUpdate = z.infer<typeof AlertUpdateSchema>

export interface AlertWithContext extends Alert {
  currentPrice?: number
  indicatorValue?: number
}
