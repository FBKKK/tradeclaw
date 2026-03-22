const API_BASE = import.meta.env.VITE_API_URL || 'https://tradeclaw-api.onrender.com/api'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
  }

  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'API request failed')
    }

    return data.data as T
  }

  // Auth endpoints
  async register(email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: { email, password },
    })
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
  }

  async refresh(refreshToken: string) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    })
  }

  // User endpoints
  async getCurrentUser() {
    return this.request('/users/me')
  }

  async updateUser(updates: Record<string, unknown>) {
    return this.request('/users/me', {
      method: 'PATCH',
      body: updates,
    })
  }

  // Strategy endpoints
  async getStrategies() {
    return this.request('/strategies')
  }

  async getStrategy(id: string) {
    return this.request(`/strategies/${id}`)
  }

  async createStrategy(data: Record<string, unknown>) {
    return this.request('/strategies', {
      method: 'POST',
      body: data,
    })
  }

  async updateStrategy(id: string, data: Record<string, unknown>) {
    return this.request(`/strategies/${id}`, {
      method: 'PATCH',
      body: data,
    })
  }

  async deleteStrategy(id: string) {
    return this.request(`/strategies/${id}`, { method: 'DELETE' })
  }

  async backtestStrategy(id: string, startDate: string, endDate: string) {
    return this.request(`/strategies/${id}/backtest`, {
      method: 'POST',
      body: { startDate, endDate },
    })
  }

  async applyStrategy(id: string) {
    return this.request(`/strategies/${id}/apply`, { method: 'POST' })
  }

  // Alert endpoints
  async getAlerts() {
    return this.request('/alerts')
  }

  async getAlert(id: string) {
    return this.request(`/alerts/${id}`)
  }

  async createAlert(data: Record<string, unknown>) {
    return this.request('/alerts', {
      method: 'POST',
      body: data,
    })
  }

  async updateAlert(id: string, data: Record<string, unknown>) {
    return this.request(`/alerts/${id}`, {
      method: 'PATCH',
      body: data,
    })
  }

  async deleteAlert(id: string) {
    return this.request(`/alerts/${id}`, { method: 'DELETE' })
  }

  // Trade endpoints
  async getAccounts() {
    return this.request('/accounts')
  }

  async addAccount(data: { exchange: string; accountType: string; apiKey: string; apiSecret: string }) {
    return this.request('/accounts', {
      method: 'POST',
      body: data,
    })
  }

  async getPositions(accountId: string) {
    return this.request(`/accounts/${accountId}/positions`)
  }

  async executeTrade(data: Record<string, unknown>) {
    return this.request('/trades', {
      method: 'POST',
      body: data,
    })
  }

  async cancelTrade(id: string) {
    return this.request(`/trades/${id}`, { method: 'DELETE' })
  }

  async getTrades() {
    return this.request('/trades')
  }

  // Report endpoints
  async getScheduledReports() {
    return this.request('/reports/scheduled')
  }

  async createScheduledReport(data: Record<string, unknown>) {
    return this.request('/reports/scheduled', {
      method: 'POST',
      body: data,
    })
  }

  async updateScheduledReport(id: string, data: Record<string, unknown>) {
    return this.request(`/reports/scheduled/${id}`, {
      method: 'PATCH',
      body: data,
    })
  }

  async deleteScheduledReport(id: string) {
    return this.request(`/reports/scheduled/${id}`, { method: 'DELETE' })
  }

  async generateReport(type: string) {
    return this.request('/reports/generate', {
      method: 'POST',
      body: { type },
    })
  }

  // Market endpoints
  async getPrice(exchange: string, symbol: string) {
    return this.request(`/market/price/${exchange}/${symbol}`)
  }

  async getPrices(exchange: string) {
    return this.request(`/market/prices/${exchange}`)
  }

  async getOrderBook(exchange: string, symbol: string) {
    return this.request(`/market/orderbook/${exchange}/${symbol}`)
  }

  async getKlines(exchange: string, symbol: string, interval?: string, limit?: number) {
    const params = new URLSearchParams()
    if (interval) params.set('interval', interval)
    if (limit) params.set('limit', String(limit))
    return this.request(`/market/klines/${exchange}/${symbol}?${params}`)
  }

  async getExchanges() {
    return this.request('/market/exchanges')
  }
}

export const api = new ApiClient()
export default api
