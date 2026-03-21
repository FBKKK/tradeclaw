import { z } from 'zod'

export const ReportType = z.enum(['daily', 'weekly', 'monthly', 'custom'])
export type ReportType = z.infer<typeof ReportType>

export const ScheduledReportSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(255),
  type: ReportType,
  scheduleCron: z.string().min(1).max(100),
  enabled: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().optional(),
  lastRunAt: z.date().optional(),
  nextRunAt: z.date().optional(),
})

export type ScheduledReport = z.infer<typeof ScheduledReportSchema>

export const ScheduledReportCreateSchema = z.object({
  name: z.string().min(1).max(255),
  type: ReportType,
  scheduleCron: z.string().min(1).max(100),
  enabled: z.boolean().default(true),
})

export type ScheduledReportCreate = z.infer<typeof ScheduledReportCreateSchema>

export const ScheduledReportUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: ReportType.optional(),
  scheduleCron: z.string().min(1).max(100).optional(),
  enabled: z.boolean().optional(),
})

export type ScheduledReportUpdate = z.infer<typeof ScheduledReportUpdateSchema>

export const ReportSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  scheduledReportId: z.string().uuid().optional(),
  type: ReportType,
  content: z.record(z.unknown()),
  generatedAt: z.date().default(() => new Date()),
})

export type Report = z.infer<typeof ReportSchema>

export interface DailyReportData {
  date: string
  accountSummary: {
    totalValue: number
    dayPnl: number
    dayPnlPercent: number
  }
  positions: Array<{
    symbol: string
    quantity: number
    entryPrice: number
    currentPrice: number
    unrealizedPnl: number
  }>
  trades: Array<{
    id: string
    symbol: string
    side: string
    quantity: number
    price: number
    executedAt: string
  }>
  performance: {
    totalTrades: number
    winningTrades: number
    losingTrades: number
    winRate: number
  }
}
