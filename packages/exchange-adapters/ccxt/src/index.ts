import { Exchange, type Market, type Order, type Position } from 'ccxt'
import type { Trade, TradeSide, TradeStatus } from '@tradeclaw/core'

export interface CcxtAccount {
  id: string
  exchangeId: string
  apiKey: string
  apiSecret: string
  passphrase?: string // For some exchanges like Coinbase
}

export interface CcxtConfig {
  enableRateLimit: boolean
  options?: Record<string, unknown>
}

const DEFAULT_CONFIG: CcxtConfig = {
  enableRateLimit: true,
}

export class CcxtPlatform {
  private exchanges: Map<string, Exchange> = new Map()
  private config: CcxtConfig

  constructor(config: Partial<CcxtConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  async loadExchange(exchangeId: string, account: CcxtAccount): Promise<Exchange> {
    const exchange = new Exchange({
      id: exchangeId,
      options: {
        defaultType: 'spot',
        ...this.config.options,
      },
    } as any)

    await exchange.loadMarkets()

    // Set credentials (would need actual API keys)
    // exchange.apiKey = account.apiKey
    // exchange.secret = account.apiSecret
    // if (account.passphrase) exchange.password = account.passphrase

    this.exchanges.set(exchangeId, exchange)
    return exchange
  }

  async getBalance(exchangeId: string): Promise<Record<string, number>> {
    const exchange = this.exchanges.get(exchangeId)
    if (!exchange) throw new Error(`Exchange ${exchangeId} not loaded`)

    const balance = await exchange.fetchBalance()
    return balance.total as Record<string, number>
  }

  async getMarkets(exchangeId: string): Promise<Market[]> {
    const exchange = this.exchanges.get(exchangeId)
    if (!exchange) throw new Error(`Exchange ${exchangeId} not loaded`)

    return Object.values(exchange.markets) as Market[]
  }

  async getPrice(exchangeId: string, symbol: string): Promise<number> {
    const exchange = this.exchanges.get(exchangeId)
    if (!exchange) throw new Error(`Exchange ${exchangeId} not loaded`)

    const ticker = await exchange.fetchTicker(symbol)
    return ticker.last || 0
  }

  async getOrderBook(exchangeId: string, symbol: string, limit = 20): Promise<{ bids: [number, number][]; asks: [number, number][] }> {
    const exchange = this.exchanges.get(exchangeId)
    if (!exchange) throw new Error(`Exchange ${exchangeId} not loaded`)

    const orderbook = await exchange.fetchOrderBook(symbol, limit)
    return {
      bids: orderbook.bids as [number, number][],
      asks: orderbook.asks as [number, number][],
    }
  }

  async getKlines(
    exchangeId: string,
    symbol: string,
    timeframe = '1h',
    since?: number,
    limit = 100
  ): Promise<Array<{ timestamp: number; open: number; high: number; low: number; close: number; volume: number }>> {
    const exchange = this.exchanges.get(exchangeId)
    if (!exchange) throw new Error(`Exchange ${exchangeId} not loaded`)

    const klines = await exchange.fetchOHLCV(symbol, timeframe, since, limit)
    return klines.map((k) => ({
      timestamp: k[0],
      open: k[1],
      high: k[2],
      low: k[3],
      close: k[4],
      volume: k[5],
    }))
  }

  async placeOrder(
    exchangeId: string,
    symbol: string,
    side: TradeSide,
    quantity: number,
    price?: number
  ): Promise<Trade> {
    const exchange = this.exchanges.get(exchangeId)
    if (!exchange) throw new Error(`Exchange ${exchangeId} not loaded`)

    const orderType = price ? 'limit' : 'market'
    const orderSide = side === 'buy' || side === 'long' ? 'buy' : 'sell'

    const order = await exchange.createOrder(symbol, orderType, orderSide, quantity, price)

    return {
      id: order.id,
      userId: '',
      exchange: exchangeId,
      symbol,
      side,
      quantity,
      price: order.price || price || null,
      status: this.mapOrderStatus(order.status),
      simulation: false,
      createdAt: new Date(order.timestamp),
    }
  }

  async cancelOrder(exchangeId: string, orderId: string, symbol: string): Promise<boolean> {
    const exchange = this.exchanges.get(exchangeId)
    if (!exchange) throw new Error(`Exchange ${exchangeId} not loaded`)

    try {
      await exchange.cancelOrder(orderId, symbol)
      return true
    } catch {
      return false
    }
  }

  async getOpenOrders(exchangeId: string, symbol?: string): Promise<Order[]> {
    const exchange = this.exchanges.get(exchangeId)
    if (!exchange) throw new Error(`Exchange ${exchangeId} not loaded`)

    return await exchange.fetchOpenOrders(symbol)
  }

  async getPositions(exchangeId: string): Promise<Position[]> {
    const exchange = this.exchanges.get(exchangeId)
    if (!exchange) throw new Error(`Exchange ${exchangeId} not loaded`)

    // Note: Position fetching is exchange-specific and may require different endpoints
    try {
      return await exchange.fetchPositions()
    } catch {
      return []
    }
  }

  private mapOrderStatus(status: string): TradeStatus {
    const statusMap: Record<string, TradeStatus> = {
      open: 'submitted',
      closed: 'filled',
      canceled: 'cancelled',
      rejected: 'rejected',
    }
    return statusMap[status] || 'pending'
  }

  // Supported exchanges
  static readonly SUPPORTED_EXCHANGES = [
    'binance',
    'bybit',
    'okx',
    'coinbase',
    'kraken',
    'kucoin',
    'huobi',
    'gateio',
  ] as const

  static isSupported(exchangeId: string): boolean {
    return this.SUPPORTED_EXCHANGES.includes(exchangeId as any)
  }
}

export default CcxtPlatform
