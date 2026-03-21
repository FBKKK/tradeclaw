import { Hono } from 'hono'
import { v4 as uuid } from 'uuid'
import { authMiddleware, getAuthUser } from '../middleware/auth.js'
import { AlertCreateSchema, AlertUpdateSchema } from '@tradeclaw/core'

export const alertRoutes = new Hono()

alertRoutes.use('/*', authMiddleware)

// In-memory store (replace with DB)
const alerts = new Map<string, {
  id: string
  userId: string
  symbol: string
  exchange: string
  conditionType: string
  targetValue: number | null
  indicator?: string
  indicatorPeriod?: number
  enabled: boolean
  cooldownSeconds: number
  createdAt: Date
  updatedAt?: Date
  lastTriggeredAt?: Date
}>()

// List alerts
alertRoutes.get('/', (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  const userAlerts = Array.from(alerts.values())
    .filter((a) => a.userId === user.id)
    .map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt?.toISOString(),
      lastTriggeredAt: a.lastTriggeredAt?.toISOString(),
    }))

  return c.json({
    success: true,
    data: userAlerts,
  })
})

// Get alert by ID
alertRoutes.get('/:id', (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  const alert = alerts.get(c.req.param('id'))
  if (!alert || alert.userId !== user.id) {
    return c.json({ success: false, error: 'Alert not found' }, 404)
  }

  return c.json({
    success: true,
    data: {
      ...alert,
      createdAt: alert.createdAt.toISOString(),
      updatedAt: alert.updatedAt?.toISOString(),
      lastTriggeredAt: alert.lastTriggeredAt?.toISOString(),
    },
  })
})

// Create alert
alertRoutes.post('/', async (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  try {
    const body = await c.req.json()
    const validated = AlertCreateSchema.parse(body)

    const alert = {
      id: uuid(),
      userId: user.id,
      symbol: validated.symbol,
      exchange: validated.exchange,
      conditionType: validated.conditionType,
      targetValue: validated.targetValue ?? null,
      indicator: validated.indicator,
      indicatorPeriod: validated.indicatorPeriod,
      enabled: true,
      cooldownSeconds: validated.cooldownSeconds ?? 60,
      createdAt: new Date(),
    }

    alerts.set(alert.id, alert)

    return c.json({
      success: true,
      data: {
        ...alert,
        createdAt: alert.createdAt.toISOString(),
      },
    }, 201)
  } catch (err) {
    console.error('Create alert error:', err)
    return c.json({ success: false, error: 'Failed to create alert' }, 400)
  }
})

// Update alert
alertRoutes.patch('/:id', async (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  const existing = alerts.get(c.req.param('id'))
  if (!existing || existing.userId !== user.id) {
    return c.json({ success: false, error: 'Alert not found' }, 404)
  }

  try {
    const body = await c.req.json()
    const validated = AlertUpdateSchema.parse(body)

    const updated = {
      ...existing,
      ...validated,
      updatedAt: new Date(),
    }

    alerts.set(existing.id, updated)

    return c.json({
      success: true,
      data: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt?.toISOString(),
        lastTriggeredAt: updated.lastTriggeredAt?.toISOString(),
      },
    })
  } catch (err) {
    return c.json({ success: false, error: 'Failed to update alert' }, 400)
  }
})

// Delete alert
alertRoutes.delete('/:id', (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  const alert = alerts.get(c.req.param('id'))
  if (!alert || alert.userId !== user.id) {
    return c.json({ success: false, error: 'Alert not found' }, 404)
  }

  alerts.delete(c.req.param('id'))

  return c.json({ success: true, message: 'Alert deleted' })
})
