import { EventEmitter } from 'events'
import type { Alert, AlertConditionType, PriceUpdate } from '@tradeclaw/core'

export interface PriceMonitorConfig {
  updateIntervalMs: number
  maxSymbols: number
}

export class PriceMonitor extends EventEmitter {
  private prices: Map<string, number> = new Map()
  private symbols: Set<string> = new Set()
  private intervalMs: number
  private intervalId?: NodeJS.Timeout
  private isRunning = false

  constructor(config: Partial<PriceMonitorConfig> = {}) {
    super()
    this.intervalMs = config.updateIntervalMs || 5000
  }

  start(): void {
    if (this.isRunning) return
    this.isRunning = true
    this.intervalId = setInterval(() => this.pollPrices(), this.intervalMs)
    console.log(`PriceMonitor started (interval: ${this.intervalMs}ms)`)
  }

  stop(): void {
    if (!this.isRunning) return
    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
    console.log('PriceMonitor stopped')
  }

  subscribe(symbol: string): void {
    this.symbols.add(symbol)
    console.log(`Subscribed to ${symbol}`)
  }

  unsubscribe(symbol: string): void {
    this.symbols.delete(symbol)
    this.prices.delete(symbol)
    console.log(`Unsubscribed from ${symbol}`)
  }

  getPrice(symbol: string): number | undefined {
    return this.prices.get(symbol)
  }

  getAllPrices(): Map<string, number> {
    return new Map(this.prices)
  }

  private async pollPrices(): Promise<void> {
    for (const symbol of this.symbols) {
      try {
        const price = await this.fetchPrice(symbol)
        const previousPrice = this.prices.get(symbol)
        this.prices.set(symbol, price)

        const update: PriceUpdate = {
          symbol,
          exchange: 'binance', // Would be determined per-symbol
          price,
          timestamp: Date.now(),
        }

        this.emit('priceUpdate', update)

        // Check alerts if price changed
        if (previousPrice !== undefined && previousPrice !== price) {
          this.emit('priceChange', {
            symbol,
            previousPrice,
            currentPrice: price,
            change: price - previousPrice,
            changePercent: ((price - previousPrice) / previousPrice) * 100,
          })
        }
      } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error)
      }
    }
  }

  private async fetchPrice(symbol: string): Promise<number> {
    // Simulated price fetching
    // In production, this would call exchange APIs or a price aggregation service
    const currentPrice = this.prices.get(symbol) || 100
    const variance = currentPrice * 0.01
    return currentPrice + (Math.random() - 0.5) * variance * 2
  }

  isActive(): boolean {
    return this.isRunning
  }
}

export default PriceMonitor
