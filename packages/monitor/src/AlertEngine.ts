import { EventEmitter } from 'events'
import type { Alert, AlertConditionType, AlertTriggered } from '@tradeclaw/core'

export interface AlertEngineConfig {
  checkIntervalMs: number
}

export interface CheckedAlert extends Alert {
  lastCheckedAt?: Date
  consecutiveTriggers?: number
}

export class AlertEngine extends EventEmitter {
  private alerts: Map<string, CheckedAlert> = new Map()
  private priceProvider?: (symbol: string) => number | undefined
  private intervalId?: NodeJS.Timeout
  private isRunning = false

  constructor() {
    super()
  }

  setPriceProvider(provider: (symbol: string) => number | undefined): void {
    this.priceProvider = provider
  }

  start(intervalMs = 5000): void {
    if (this.isRunning) return
    this.isRunning = true
    this.intervalId = setInterval(() => this.checkAlerts(), intervalMs)
    console.log(`AlertEngine started (interval: ${intervalMs}ms)`)
  }

  stop(): void {
    if (!this.isRunning) return
    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
    console.log('AlertEngine stopped')
  }

  addAlert(alert: Alert): void {
    this.alerts.set(alert.id, { ...alert })
    console.log(`Alert added: ${alert.symbol} ${alert.conditionType} ${alert.targetValue}`)
  }

  removeAlert(alertId: string): void {
    this.alerts.delete(alertId)
    console.log(`Alert removed: ${alertId}`)
  }

  updateAlert(alertId: string, updates: Partial<Alert>): void {
    const existing = this.alerts.get(alertId)
    if (existing) {
      this.alerts.set(alertId, { ...existing, ...updates })
    }
  }

  getAlerts(): Alert[] {
    return Array.from(this.alerts.values())
  }

  getAlertsBySymbol(symbol: string): Alert[] {
    return Array.from(this.alerts.values()).filter((a) => a.symbol === symbol)
  }

  private checkAlerts(): void {
    if (!this.priceProvider) return

    for (const alert of this.alerts.values()) {
      if (!alert.enabled) continue

      // Check cooldown
      if (alert.lastTriggeredAt) {
        const cooldownMs = alert.cooldownSeconds * 1000
        if (Date.now() - alert.lastTriggeredAt.getTime() < cooldownMs) {
          continue
        }
      }

      const currentPrice = this.priceProvider(alert.symbol)
      if (currentPrice === undefined) continue

      const triggered = this.evaluateCondition(alert, currentPrice)

      if (triggered) {
        this.triggerAlert(alert, currentPrice)
      }
    }
  }

  private evaluateCondition(alert: CheckedAlert, currentPrice: number): boolean {
    const targetValue = alert.targetValue
    if (targetValue === null || targetValue === undefined) return false

    switch (alert.conditionType) {
      case 'price_above':
        return currentPrice > targetValue

      case 'price_below':
        return currentPrice < targetValue

      case 'price_crosses_above':
        // Would need previous price tracking
        return currentPrice > targetValue

      case 'price_crosses_below':
        // Would need previous price tracking
        return currentPrice < targetValue

      default:
        return false
    }
  }

  private triggerAlert(alert: CheckedAlert, currentPrice: number): void {
    const triggeredAt = new Date()

    // Update alert state
    alert.lastTriggeredAt = triggeredAt
    alert.consecutiveTriggers = (alert.consecutiveTriggers || 0) + 1
    this.alerts.set(alert.id, alert)

    const triggerEvent: AlertTriggered = {
      alertId: alert.id,
      symbol: alert.symbol,
      exchange: alert.exchange,
      conditionType: alert.conditionType,
      targetValue: alert.targetValue!,
      currentValue: currentPrice,
      triggeredAt: triggeredAt.toISOString(),
    }

    console.log(`Alert triggered: ${alert.symbol} ${alert.conditionType} (current: ${currentPrice}, target: ${alert.targetValue})`)

    this.emit('alertTriggered', triggerEvent)
  }

  isActive(): boolean {
    return this.isRunning
  }
}

export default AlertEngine
