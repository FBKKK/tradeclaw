import { WebSocketServer, WebSocket } from 'ws'
import { PriceMonitor } from './PriceMonitor.js'
import { AlertEngine } from './AlertEngine.js'
import {
  NotificationDispatcherImpl,
  BrowserNotificationHandler,
  type NotificationChannel,
} from './NotificationDispatcher.js'
import type { Alert, PriceUpdate, AlertTriggered } from '@tradeclaw/core'

export interface MonitorServerConfig {
  port: number
  priceUpdateIntervalMs: number
  alertCheckIntervalMs: number
}

export class MonitorServer {
  private priceMonitor: PriceMonitor
  private alertEngine: AlertEngine
  private notificationDispatcher: NotificationDispatcherImpl
  private wss?: WebSocketServer
  private wsClients: Set<WebSocket> = new Set()
  private config: MonitorServerConfig

  constructor(config: Partial<MonitorServerConfig> = {}) {
    this.config = {
      port: config.port || 8080,
      priceUpdateIntervalMs: config.priceUpdateIntervalMs || 5000,
      alertCheckIntervalMs: config.alertCheckIntervalMs || 5000,
    }

    this.priceMonitor = new PriceMonitor({ updateIntervalMs: this.config.priceUpdateIntervalMs })
    this.alertEngine = new AlertEngine()
    this.notificationDispatcher = new NotificationDispatcherImpl()

    this.setupEventHandlers()
  }

  private setupEventHandlers(): void {
    // Connect price monitor to alert engine
    this.alertEngine.setPriceProvider((symbol) => this.priceMonitor.getPrice(symbol))

    // Handle price updates
    this.priceMonitor.on('priceUpdate', (update: PriceUpdate) => {
      this.broadcast({ type: 'priceUpdate', data: update })
    })

    // Handle price changes
    this.priceMonitor.on('priceChange', (change: { symbol: string; previousPrice: number; currentPrice: number; change: number; changePercent: number }) => {
      this.broadcast({ type: 'priceChange', data: change })
    })

    // Handle alert triggers
    this.alertEngine.on('alertTriggered', async (alert: AlertTriggered) => {
      this.broadcast({ type: 'alertTriggered', data: alert })
      await this.notificationDispatcher.dispatch(alert, ['browser', 'webhook'])
    })
  }

  start(): void {
    // Start price monitor
    this.priceMonitor.start()

    // Start alert engine
    this.alertEngine.start(this.config.alertCheckIntervalMs)

    // Register default notification handlers
    this.notificationDispatcher.registerChannel('browser', new BrowserNotificationHandler())

    // Start WebSocket server
    this.wss = new WebSocketServer({ port: this.config.port })

    this.wss.on('connection', (ws) => {
      this.wsClients.add(ws)
      console.log('WebSocket client connected')

      ws.on('message', (message) => {
        this.handleMessage(ws, message.toString())
      })

      ws.on('close', () => {
        this.wsClients.delete(ws)
        console.log('WebSocket client disconnected')
      })

      // Send current state
      ws.send(JSON.stringify({
        type: 'connected',
        data: { prices: Object.fromEntries(this.priceMonitor.getAllPrices()) },
      }))
    })

    console.log(`MonitorServer started on ws://localhost:${this.config.port}`)
  }

  stop(): void {
    this.priceMonitor.stop()
    this.alertEngine.stop()
    this.wss?.close()
    console.log('MonitorServer stopped')
  }

  private handleMessage(ws: WebSocket, message: string): void {
    try {
      const { type, data } = JSON.parse(message)

      switch (type) {
        case 'subscribe':
          if (data.symbol) {
            this.priceMonitor.subscribe(data.symbol)
            ws.send(JSON.stringify({ type: 'subscribed', data: { symbol: data.symbol } }))
          }
          break

        case 'unsubscribe':
          if (data.symbol) {
            this.priceMonitor.unsubscribe(data.symbol)
            ws.send(JSON.stringify({ type: 'unsubscribed', data: { symbol: data.symbol } }))
          }
          break

        case 'addAlert':
          if (data.alert) {
            this.alertEngine.addAlert(data.alert)
            ws.send(JSON.stringify({ type: 'alertAdded', data: { alertId: data.alert.id } }))
          }
          break

        case 'removeAlert':
          if (data.alertId) {
            this.alertEngine.removeAlert(data.alertId)
            ws.send(JSON.stringify({ type: 'alertRemoved', data: { alertId: data.alertId } }))
          }
          break

        default:
          console.warn('Unknown message type:', type)
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error)
    }
  }

  private broadcast(message: { type: string; data: unknown }): void {
    const payload = JSON.stringify(message)
    for (const client of this.wsClients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload)
      }
    }
  }

  // Public API for managing subscriptions
  subscribeSymbol(symbol: string): void {
    this.priceMonitor.subscribe(symbol)
  }

  unsubscribeSymbol(symbol: string): void {
    this.priceMonitor.unsubscribe(symbol)
  }

  addAlert(alert: Alert): void {
    this.alertEngine.addAlert(alert)
  }

  removeAlert(alertId: string): void {
    this.alertEngine.removeAlert(alertId)
  }

  getAlerts(): Alert[] {
    return this.alertEngine.getAlerts()
  }

  getPrices(): Map<string, number> {
    return this.priceMonitor.getAllPrices()
  }
}

export default MonitorServer
