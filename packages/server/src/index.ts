import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'

import { authRoutes } from './routes/auth.js'
import { userRoutes } from './routes/users.js'
import { strategyRoutes } from './routes/strategies.js'
import { alertRoutes } from './routes/alerts.js'
import { tradeRoutes } from './routes/trades.js'
import { reportRoutes } from './routes/reports.js'
import { marketRoutes } from './routes/market.js'
import { chatRoutes } from './routes/chat.js'
import { errorHandler } from './middleware/error.js'
import { authMiddleware } from './middleware/auth.js'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://tradeclaw.vercel.app'],
  credentials: true,
}))

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// API routes
app.route('/api/auth', authRoutes)
app.route('/api/users', userRoutes)
app.route('/api/strategies', strategyRoutes)
app.route('/api/alerts', alertRoutes)
app.route('/api/trades', tradeRoutes)
app.route('/api/reports', reportRoutes)
app.route('/api/market', marketRoutes)
app.route('/api/chat', chatRoutes)

// Protected routes (require auth)
app.use('/api/*', authMiddleware)

// Error handling
app.onError(errorHandler)

// 404 handler
app.notFound((c) => c.json({ success: false, error: 'Not found' }, 404))

// Start server
const port = parseInt(process.env.PORT || '3000', 10)

console.log(`Starting TradeClaw server on port ${port}...`)

serve({
  fetch: app.fetch,
  port,
})

console.log(`TradeClaw server running on http://localhost:${port}`)
