import type { Trade, TradeSide, TradeStatus } from '@tradeclaw/core'
import { z } from 'zod'

const AlpacaConfigSchema = z.object({
  keyId: z.string(),
  secretKey: z.string(),
  paperTrading: z.boolean().default(true),
  baseUrl: z.string().optional(),
})

export type AlpacaConfig = z.infer<typeof AlpacaConfigSchema>

export interface AlpacaPosition {
  symbol: string
  quantity: number
  side: 'long' | 'short'
  entryPrice: number
  currentPrice: number
  unrealizedPnl: number
  unrealizedPnlPercent: number
  marketValue: number
}

export interface AlpacaAccount {
  id: string
  equity: number
  cash: number
  buyingPower: number
  status: 'ACTIVE' | 'DAY_TRADE' | 'PM_ZERO_BALANCE'
  currency: 'USD'
}

export class AlpacaPlatform {
  private config: AlpacaConfig
  private baseUrl: string

  constructor(config: AlpacaConfig) {
    this.config = AlpacaConfigSchema.parse(config)
    this.baseUrl = config.baseUrl || (config.paperTrading
      ? 'https://paper-api.alpaca.markets'
      : 'https://api.alpaca.markets')
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      'APCA-API-KEY-ID': this.config.keyId,
      'SECRET-API-KEY': this.config.secretKey,
      'Content-Type': 'application/json',
      ...options.headers,
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`Alpaca API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getAccount(): Promise<AlpacaAccount> {
    const data = await this.request<{
      id: string
      equity: string
      cash: string
      buying_power: string
      status: string
      currency: string
    }>('/v2/account')

    return {
      id: data.id,
      equity: parseFloat(data.equity),
      cash: parseFloat(data.cash),
      buyingPower: parseFloat(data.buying_power),
      status: data.status as 'ACTIVE' | 'DAY_TRADE' | 'PM_ZERO_BALANCE',
      currency: data.currency as 'USD',
    }
  }

  async getPositions(): Promise<AlpacaPosition[]> {
    const data = await this.request<Array<{
      symbol: string
      qty: string
      side: string
      avg_entry_price: string
      current_price: string
      unrealized_pl: string
      unrealized_plpc: string
      market_value: string
    }>>('/v2/positions')

    return data.map((p) => ({
      symbol: p.symbol,
      quantity: parseFloat(p.qty),
      side: p.side as 'long' | 'short',
      entryPrice: parseFloat(p.avg_entry_price),
      currentPrice: parseFloat(p.current_price),
      unrealizedPnl: parseFloat(p.unrealized_pl),
      unrealizedPnlPercent: parseFloat(p.unrealized_plpc) * 100,
      marketValue: parseFloat(p.market_value),
    }))
  }

  async getPosition(symbol: string): Promise<AlpacaPosition | null> {
    try {
      const data = await this.request<{
        symbol: string
        qty: string
        side: string
        avg_entry_price: string
        current_price: string
        unrealized_pl: string
        unrealized_plpc: string
        market_value: string
      }>(`/v2/positions/${symbol}`)

      return {
        symbol: data.symbol,
        quantity: parseFloat(data.qty),
        side: data.side as 'long' | 'short',
        entryPrice: parseFloat(data.avg_entry_price),
        currentPrice: parseFloat(data.current_price),
        unrealizedPnl: parseFloat(data.unrealized_pl),
        unrealizedPnlPercent: parseFloat(data.unrealized_plpc) * 100,
        marketValue: parseFloat(data.market_value),
      }
    } catch {
      return null
    }
  }

  async placeOrder(
    symbol: string,
    side: TradeSide,
    quantity: number,
    type: 'market' | 'limit' = 'market',
    limitPrice?: number
  ): Promise<Trade> {
    const orderSide = side === 'buy' || side === 'long' ? 'buy' : 'sell'

    const data = await this.request<{
      id: string
      symbol: string
      side: string
      qty: string
      type: string
      limit_price: string | null
      status: string
      filled_at: string | null
      created_at: string
    }>('/v2/orders', {
      method: 'POST',
      body: JSON.stringify({
        symbol,
        side: orderSide,
        qty: quantity,
        type,
        limit_price: limitPrice,
        time_in_force: 'day',
      }),
    })

    return {
      id: data.id,
      userId: '',
      exchange: 'alpaca',
      symbol: data.symbol,
      side,
      quantity: parseFloat(data.qty),
      price: data.limit_price ? parseFloat(data.limit_price) : null,
      status: this.mapOrderStatus(data.status),
      simulation: this.config.paperTrading,
      createdAt: new Date(data.created_at),
      filledAt: data.filled_at ? new Date(data.filled_at) : undefined,
    }
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      await this.request(`/v2/orders/${orderId}`, {
        method: 'DELETE',
      })
      return true
    } catch {
      return false
    }
  }

  async getOrder(orderId: string): Promise<Trade | null> {
    try {
      const data = await this.request<{
        id: string
        symbol: string
        side: string
        qty: string
        type: string
        limit_price: string | null
        status: string
        filled_at: string | null
        created_at: string
      }>(`/v2/orders/${orderId}`)

      return {
        id: data.id,
        userId: '',
        exchange: 'alpaca',
        symbol: data.symbol,
        side: data.side as TradeSide,
        quantity: parseFloat(data.qty),
        price: data.limit_price ? parseFloat(data.limit_price) : null,
        status: this.mapOrderStatus(data.status),
        simulation: this.config.paperTrading,
        createdAt: new Date(data.created_at),
        filledAt: data.filled_at ? new Date(data.filled_at) : undefined,
      }
    } catch {
      return null
    }
  }

  async getOrders(status: 'open' | 'closed' | 'all' = 'open'): Promise<Trade[]> {
    const data = await this.request<Array<{
      id: string
      symbol: string
      side: string
      qty: string
      type: string
      limit_price: string | null
      status: string
      filled_at: string | null
      created_at: string
    }>>(`/v2/orders?status=${status}`)

    return data.map((o) => ({
      id: o.id,
      userId: '',
      exchange: 'alpaca',
      symbol: o.symbol,
      side: o.side as TradeSide,
      quantity: parseFloat(o.qty),
      price: o.limit_price ? parseFloat(o.limit_price) : null,
      status: this.mapOrderStatus(o.status),
      simulation: this.config.paperTrading,
      createdAt: new Date(o.created_at),
      filledAt: o.filled_at ? new Date(o.filled_at) : undefined,
    }))
  }

  private mapOrderStatus(status: string): TradeStatus {
    const statusMap: Record<string, TradeStatus> = {
      pending: 'pending',
      new: 'submitted',
      partially_filled: 'partial_fill',
      filled: 'filled',
      done_for_day: 'filled',
      cancelled: 'cancelled',
      expired: 'cancelled',
      rejected: 'rejected',
      suspended: 'pending',
      awaiting_qty: 'pending',
    }
    return statusMap[status] || 'pending'
  }
}

export default AlpacaPlatform
