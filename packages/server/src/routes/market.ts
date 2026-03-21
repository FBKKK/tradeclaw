import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth.js'

export const marketRoutes = new Hono()

marketRoutes.use('/*', authMiddleware)

// Simulated market data
const marketData: Record<string, { price: number; volume24h: number; change24h: number }> = {
  'BTC/USD': { price: 67500, volume24h: 28000000000, change24h: 2.5 },
  'ETH/USD': { price: 3450, volume24h: 15000000000, change24h: 1.8 },
  'SOL/USD': { price: 145, volume24h: 3000000000, change24h: -0.5 },
}

// Get price for symbol
marketRoutes.get('/price/:exchange/:symbol', (c) => {
  const exchange = c.req.param('exchange')
  const symbol = c.req.param('symbol')
  const key = `${symbol}`

  const data = marketData[key]
  if (!data) {
    return c.json({ success: false, error: 'Symbol not found' }, 404)
  }

  return c.json({
    success: true,
    data: {
      symbol,
      exchange,
      price: data.price,
      volume24h: data.volume24h,
      change24h: data.change24h,
      timestamp: Date.now(),
    },
  })
})

// Get all prices (for a specific exchange)
marketRoutes.get('/prices/:exchange', (c) => {
  const exchange = c.req.param('exchange')

  const prices = Object.entries(marketData).map(([symbol, data]) => ({
    symbol,
    exchange,
    price: data.price,
    volume24h: data.volume24h,
    change24h: data.change24h,
    timestamp: Date.now(),
  }))

  return c.json({
    success: true,
    data: prices,
  })
})

// Get order book
marketRoutes.get('/orderbook/:exchange/:symbol', (c) => {
  const symbol = c.req.param('symbol')
  const exchange = c.req.param('exchange')

  // Simulated order book
  const midPrice = marketData[`${symbol}`]?.price || 100
  const spread = midPrice * 0.001

  return c.json({
    success: true,
    data: {
      symbol,
      exchange,
      bids: [
        [midPrice - spread, 10],
        [midPrice - spread * 2, 5],
        [midPrice - spread * 3, 3],
      ],
      asks: [
        [midPrice + spread, 8],
        [midPrice + spread * 2, 4],
        [midPrice + spread * 3, 2],
      ],
      timestamp: Date.now(),
    },
  })
})

// Get klines/candlestick data
marketRoutes.get('/klines/:exchange/:symbol', (c) => {
  const symbol = c.req.param('symbol')
  const exchange = c.req.param('exchange')
  const interval = c.req.query('interval') || '1h'
  const limit = parseInt(c.req.query('limit') || '100', 10)

  const basePrice = marketData[`${symbol}`]?.price || 100
  const now = Date.now()

  // Generate simulated klines
  const klines = Array.from({ length: limit }, (_, i) => {
    const time = now - (limit - i) * 60 * 60 * 1000
    const variance = basePrice * 0.02
    const open = basePrice + (Math.random() - 0.5) * variance
    const close = open + (Math.random() - 0.5) * variance
    const high = Math.max(open, close) + Math.random() * variance * 0.5
    const low = Math.min(open, close) - Math.random() * variance * 0.5

    return {
      time,
      open,
      high,
      low,
      close,
      volume: Math.random() * 1000,
    }
  })

  return c.json({
    success: true,
    data: {
      symbol,
      exchange,
      interval,
      klines,
    },
  })
})

// Get supported exchanges
marketRoutes.get('/exchanges', (c) => {
  return c.json({
    success: true,
    data: [
      { id: 'binance', name: 'Binance', supportedFeatures: ['spot', 'futures'] },
      { id: 'bybit', name: 'Bybit', supportedFeatures: ['spot', 'derivatives'] },
      { id: 'okx', name: 'OKX', supportedFeatures: ['spot', 'futures'] },
      { id: 'alpaca', name: 'Alpaca', supportedFeatures: ['stock', 'crypto'] },
    ],
  })
})
