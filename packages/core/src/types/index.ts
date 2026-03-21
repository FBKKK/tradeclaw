// Shared types for the TradeClaw platform

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface StreamEvent {
  type: string
  data: unknown
  timestamp: string
}

// Auth types
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthUser {
  id: string
  email: string
  role: string
}

// Exchange types
export interface ExchangeInfo {
  id: string
  name: string
  supportedFeatures: string[]
  tradingFee: number
  minOrderSize: number
}

export interface MarketData {
  symbol: string
  exchange: string
  price: number
  volume24h: number
  change24h: number
  high24h: number
  low24h: number
  timestamp: number
}

export interface OrderBook {
  symbol: string
  exchange: string
  bids: Array<[number, number]>
  asks: Array<[number, number]>
  timestamp: number
}

// WebSocket types
export interface PriceUpdate {
  symbol: string
  exchange: string
  price: number
  timestamp: number
}

export interface AlertTriggered {
  alertId: string
  symbol: string
  exchange: string
  conditionType: string
  targetValue: number
  currentValue: number
  triggeredAt: string
}

// MCP tool types
export interface ToolCall {
  name: string
  arguments: Record<string, unknown>
}

export interface ToolResult {
  name: string
  success: boolean
  result?: unknown
  error?: string
}
