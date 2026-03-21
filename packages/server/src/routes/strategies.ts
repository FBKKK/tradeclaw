import { Hono } from 'hono'
import { v4 as uuid } from 'uuid'
import { authMiddleware, getAuthUser } from '../middleware/auth.js'
import { StrategyCreateSchema, StrategyUpdateSchema } from '@tradeclaw/core'

export const strategyRoutes = new Hono()

strategyRoutes.use('/*', authMiddleware)

// In-memory store (replace with DB)
const strategies = new Map<string, {
  id: string
  userId: string
  name: string
  description?: string
  config: unknown
  isActive: boolean
  createdAt: Date
  updatedAt?: Date
}>()

// List strategies
strategyRoutes.get('/', (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  const userStrategies = Array.from(strategies.values())
    .filter((s) => s.userId === user.id)
    .map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt?.toISOString(),
    }))

  return c.json({
    success: true,
    data: userStrategies,
  })
})

// Get strategy by ID
strategyRoutes.get('/:id', (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  const strategy = strategies.get(c.req.param('id'))
  if (!strategy || strategy.userId !== user.id) {
    return c.json({ success: false, error: 'Strategy not found' }, 404)
  }

  return c.json({
    success: true,
    data: {
      ...strategy,
      createdAt: strategy.createdAt.toISOString(),
      updatedAt: strategy.updatedAt?.toISOString(),
    },
  })
})

// Create strategy
strategyRoutes.post('/', async (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  try {
    const body = await c.req.json()
    const validated = StrategyCreateSchema.parse(body)

    const strategy = {
      id: uuid(),
      userId: user.id,
      name: validated.name,
      description: validated.description,
      config: validated.config,
      isActive: false,
      createdAt: new Date(),
    }

    strategies.set(strategy.id, strategy)

    return c.json({
      success: true,
      data: {
        ...strategy,
        createdAt: strategy.createdAt.toISOString(),
      },
    }, 201)
  } catch (err) {
    console.error('Create strategy error:', err)
    return c.json({ success: false, error: 'Failed to create strategy' }, 400)
  }
})

// Update strategy
strategyRoutes.patch('/:id', async (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  const existing = strategies.get(c.req.param('id'))
  if (!existing || existing.userId !== user.id) {
    return c.json({ success: false, error: 'Strategy not found' }, 404)
  }

  try {
    const body = await c.req.json()
    const validated = StrategyUpdateSchema.parse(body)

    const updated = {
      ...existing,
      ...validated,
      updatedAt: new Date(),
    }

    strategies.set(existing.id, updated)

    return c.json({
      success: true,
      data: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt?.toISOString(),
      },
    })
  } catch (err) {
    return c.json({ success: false, error: 'Failed to update strategy' }, 400)
  }
})

// Delete strategy
strategyRoutes.delete('/:id', (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  const strategy = strategies.get(c.req.param('id'))
  if (!strategy || strategy.userId !== user.id) {
    return c.json({ success: false, error: 'Strategy not found' }, 404)
  }

  strategies.delete(c.req.param('id'))

  return c.json({ success: true, message: 'Strategy deleted' })
})

// Backtest strategy
strategyRoutes.post('/:id/backtest', async (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  const strategy = strategies.get(c.req.param('id'))
  if (!strategy || strategy.userId !== user.id) {
    return c.json({ success: false, error: 'Strategy not found' }, 404)
  }

  // Simulated backtest result
  const backtestResult = {
    strategyId: strategy.id,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
    totalTrades: 15,
    winningTrades: 10,
    losingTrades: 5,
    winRate: 0.667,
    totalProfit: 1250.50,
    maxDrawdown: 5.2,
    sharpeRatio: 1.45,
    trades: [],
  }

  return c.json({
    success: true,
    data: backtestResult,
  })
})

// Apply strategy
strategyRoutes.post('/:id/apply', async (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  const strategy = strategies.get(c.req.param('id'))
  if (!strategy || strategy.userId !== user.id) {
    return c.json({ success: false, error: 'Strategy not found' }, 404)
  }

  // Activate the strategy
  strategy.isActive = true
  strategy.updatedAt = new Date()
  strategies.set(strategy.id, strategy)

  return c.json({
    success: true,
    message: 'Strategy activated',
    data: {
      ...strategy,
      createdAt: strategy.createdAt.toISOString(),
      updatedAt: strategy.updatedAt?.toISOString(),
    },
  })
})
