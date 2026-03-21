import { Hono } from 'hono'
import { v4 as uuid } from 'uuid'
import { authMiddleware, getAuthUser } from '../middleware/auth.js'
import { ScheduledReportCreateSchema, ScheduledReportUpdateSchema } from '@tradeclaw/core'

export const reportRoutes = new Hono()

reportRoutes.use('/*', authMiddleware)

// In-memory stores (replace with DB)
const scheduledReports = new Map<string, {
  id: string
  userId: string
  name: string
  type: string
  scheduleCron: string
  enabled: boolean
  createdAt: Date
  updatedAt?: Date
  lastRunAt?: Date
  nextRunAt?: Date
}>()

const reports = new Map<string, {
  id: string
  userId: string
  scheduledReportId?: string
  type: string
  content: Record<string, unknown>
  generatedAt: Date
}>()

// List scheduled reports
reportRoutes.get('/scheduled', (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  const userReports = Array.from(scheduledReports.values())
    .filter((r) => r.userId === user.id)
    .map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt?.toISOString(),
      lastRunAt: r.lastRunAt?.toISOString(),
      nextRunAt: r.nextRunAt?.toISOString(),
    }))

  return c.json({
    success: true,
    data: userReports,
  })
})

// Create scheduled report
reportRoutes.post('/scheduled', async (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  try {
    const body = await c.req.json()
    const validated = ScheduledReportCreateSchema.parse(body)

    // Calculate next run time based on cron
    const nextRunAt = new Date(Date.now() + 60 * 60 * 1000) // Simplified

    const report = {
      id: uuid(),
      userId: user.id,
      name: validated.name,
      type: validated.type,
      scheduleCron: validated.scheduleCron,
      enabled: validated.enabled ?? true,
      createdAt: new Date(),
      nextRunAt,
    }

    scheduledReports.set(report.id, report)

    return c.json({
      success: true,
      data: {
        ...report,
        createdAt: report.createdAt.toISOString(),
        nextRunAt: report.nextRunAt?.toISOString(),
      },
    }, 201)
  } catch (err) {
    console.error('Create scheduled report error:', err)
    return c.json({ success: false, error: 'Failed to create scheduled report' }, 400)
  }
})

// Update scheduled report
reportRoutes.patch('/scheduled/:id', async (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  const existing = scheduledReports.get(c.req.param('id'))
  if (!existing || existing.userId !== user.id) {
    return c.json({ success: false, error: 'Scheduled report not found' }, 404)
  }

  try {
    const body = await c.req.json()
    const validated = ScheduledReportUpdateSchema.parse(body)

    const updated = {
      ...existing,
      ...validated,
      updatedAt: new Date(),
    }

    if (validated.scheduleCron) {
      updated.nextRunAt = new Date(Date.now() + 60 * 60 * 1000)
    }

    scheduledReports.set(existing.id, updated)

    return c.json({
      success: true,
      data: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt?.toISOString(),
        lastRunAt: updated.lastRunAt?.toISOString(),
        nextRunAt: updated.nextRunAt?.toISOString(),
      },
    })
  } catch (err) {
    return c.json({ success: false, error: 'Failed to update scheduled report' }, 400)
  }
})

// Delete scheduled report
reportRoutes.delete('/scheduled/:id', (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  const report = scheduledReports.get(c.req.param('id'))
  if (!report || report.userId !== user.id) {
    return c.json({ success: false, error: 'Scheduled report not found' }, 404)
  }

  scheduledReports.delete(c.req.param('id'))

  return c.json({ success: true, message: 'Scheduled report deleted' })
})

// Generate report on demand
reportRoutes.post('/generate', async (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  try {
    const body = await c.req.json()
    const { type = 'daily' } = body

    // Generate simulated report content
    const content = {
      date: new Date().toISOString().split('T')[0],
      type,
      accountSummary: {
        totalValue: 50000,
        dayPnl: 250.50,
        dayPnlPercent: 0.5,
      },
      positions: [
        { symbol: 'BTC/USD', quantity: 0.5, entryPrice: 45000, currentPrice: 46500, unrealizedPnl: 750 },
        { symbol: 'ETH/USD', quantity: 5, entryPrice: 2500, currentPrice: 2600, unrealizedPnl: 500 },
      ],
      trades: [],
      performance: {
        totalTrades: 15,
        winningTrades: 10,
        losingTrades: 5,
        winRate: 0.667,
      },
    }

    const report = {
      id: uuid(),
      userId: user.id,
      type,
      content,
      generatedAt: new Date(),
    }

    reports.set(report.id, report)

    return c.json({
      success: true,
      data: {
        ...report,
        generatedAt: report.generatedAt.toISOString(),
      },
    }, 201)
  } catch (err) {
    console.error('Generate report error:', err)
    return c.json({ success: false, error: 'Failed to generate report' }, 400)
  }
})
