import { Hono } from 'hono'
import { v4 as uuid } from 'uuid'
import { authMiddleware, getAuthUser } from '../middleware/auth.js'
import { TradeCreateSchema } from '@tradeclaw/core'

export const tradeRoutes = new Hono()

tradeRoutes.use('/*', authMiddleware)

// In-memory stores (replace with DB)
const accounts = new Map<string, {
  id: string
  userId: string
  exchange: string
  accountType: 'live' | 'simulation' | 'paper'
  isActive: boolean
  createdAt: Date
}>()

const trades = new Map<string, {
  id: string
  userId: string
  strategyId?: string
  exchange: string
  symbol: string
  side: string
  quantity: number
  price: number | null
  status: string
  simulation: boolean
  createdAt: Date
  updatedAt?: Date
  filledAt?: Date
}>()

const positions = new Map<string, {
  id: string
  accountId: string
  exchange: string
  symbol: string
  side: 'long' | 'short'
  quantity: number
  entryPrice: number
  currentPrice: number
  unrealizedPnl: number
  realizedPnl: number
  updatedAt: Date
}>()

// Get accounts
tradeRoutes.get('/accounts', (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  const userAccounts = Array.from(accounts.values())
    .filter((a) => a.userId === user.id)
    .map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    }))

  return c.json({
    success: true,
    data: userAccounts,
  })
})

// Add account
tradeRoutes.post('/accounts', async (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  try {
    const body = await c.req.json()
    const { exchange, accountType } = body

    const account = {
      id: uuid(),
      userId: user.id,
      exchange,
      accountType: accountType || 'paper',
      isActive: true,
      createdAt: new Date(),
    }

    accounts.set(account.id, account)

    return c.json({
      success: true,
      data: {
        ...account,
        createdAt: account.createdAt.toISOString(),
      },
    }, 201)
  } catch (err) {
    return c.json({ success: false, error: 'Failed to add account' }, 400)
  }
})

// Get positions for account
tradeRoutes.get('/accounts/:id/positions', (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  const accountId = c.req.param('id')
  const account = accounts.get(accountId)
  if (!account || account.userId !== user.id) {
    return c.json({ success: false, error: 'Account not found' }, 404)
  }

  const accountPositions = Array.from(positions.values())
    .filter((p) => p.accountId === accountId)
    .map((p) => ({
      ...p,
      updatedAt: p.updatedAt.toISOString(),
    }))

  return c.json({
    success: true,
    data: accountPositions,
  })
})

// Execute trade
tradeRoutes.post('/', async (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  try {
    const body = await c.req.json()
    const validated = TradeCreateSchema.parse(body)

    const trade = {
      id: uuid(),
      userId: user.id,
      strategyId: validated.strategyId,
      exchange: validated.exchange,
      symbol: validated.symbol,
      side: validated.side,
      quantity: validated.quantity,
      price: validated.price ?? null,
      status: 'submitted',
      simulation: validated.simulation ?? true,
      createdAt: new Date(),
      filledAt: undefined as Date | undefined,
    }

    trades.set(trade.id, trade)

    // Simulate fill for paper/simulation trades
    if (trade.simulation) {
      setTimeout(() => {
        const t = trades.get(trade.id)
        if (t) {
          t.status = 'filled'
          t.price = t.price ?? 100 // Simulated price
          t.filledAt = new Date()
          t.updatedAt = new Date()
          trades.set(t.id, t)
        }
      }, 100)
    }

    return c.json({
      success: true,
      data: {
        ...trade,
        createdAt: trade.createdAt.toISOString(),
        filledAt: trade.filledAt?.toISOString(),
      },
    }, 201)
  } catch (err) {
    console.error('Execute trade error:', err)
    return c.json({ success: false, error: 'Failed to execute trade' }, 400)
  }
})

// Cancel trade
tradeRoutes.delete('/:id', (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  const trade = trades.get(c.req.param('id'))
  if (!trade || trade.userId !== user.id) {
    return c.json({ success: false, error: 'Trade not found' }, 404)
  }

  if (trade.status === 'filled') {
    return c.json({ success: false, error: 'Cannot cancel filled trade' }, 400)
  }

  trade.status = 'cancelled'
  trade.updatedAt = new Date()
  trades.set(trade.id, trade)

  return c.json({ success: true, message: 'Trade cancelled' })
})

// Get trade history
tradeRoutes.get('/', (c) => {
  const user = getAuthUser(c)
  if (!user) return c.json({ success: false, error: 'Unauthorized' }, 401)

  const userTrades = Array.from(trades.values())
    .filter((t) => t.userId === user.id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt?.toISOString(),
      filledAt: t.filledAt?.toISOString(),
    }))

  return c.json({
    success: true,
    data: userTrades,
  })
})
