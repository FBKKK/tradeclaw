import type { AlertTriggered } from '@tradeclaw/core'

export type NotificationChannel = 'email' | 'telegram' | 'webhook' | 'browser'

export interface NotificationConfig {
  channel: NotificationChannel
  enabled: boolean
  config: Record<string, unknown>
}

export interface NotificationDispatcher {
  dispatch(alert: AlertTriggered, channels: NotificationChannel[]): Promise<void>
}

export class NotificationDispatcherImpl implements NotificationDispatcher {
  private channels: Map<NotificationChannel, NotificationChannelHandler> = new Map()

  registerChannel(channel: NotificationChannel, handler: NotificationChannelHandler): void {
    this.channels.set(channel, handler)
    console.log(`Notification channel registered: ${channel}`)
  }

  async dispatch(alert: AlertTriggered, channels: NotificationChannel[]): Promise<void> {
    const results = await Promise.allSettled(
      channels.map(async (channel) => {
        const handler = this.channels.get(channel)
        if (!handler) {
          console.warn(`Notification channel not registered: ${channel}`)
          return
        }
        await handler.send(alert)
      })
    )

    const failures = results.filter((r) => r.status === 'rejected')
    if (failures.length > 0) {
      console.error(`Failed to send ${failures.length} notifications`)
    }
  }
}

export interface NotificationChannelHandler {
  send(alert: AlertTriggered): Promise<void>
}

export class EmailNotificationHandler implements NotificationChannelHandler {
  constructor(private config: { smtpHost: string; smtpPort: number; from: string; to: string[] }) {}

  async send(alert: AlertTriggered): Promise<void> {
    // Would integrate with email service (nodemailer, SendGrid, etc.)
    console.log(`[Email] Alert triggered: ${alert.symbol} at ${alert.currentValue}`)
    // await sendEmail({ to: this.config.to, subject: `Alert: ${alert.symbol}`, body: ... })
  }
}

export class TelegramNotificationHandler implements NotificationChannelHandler {
  constructor(private config: { botToken: string; chatId: string }) {}

  async send(alert: AlertTriggered): Promise<void> {
    // Would integrate with Telegram Bot API
    console.log(`[Telegram] Alert triggered: ${alert.symbol} at ${alert.currentValue}`)
    // await fetch(`https://api.telegram.org/bot${this.config.botToken}/sendMessage`, ...)
  }
}

export class WebhookNotificationHandler implements NotificationChannelHandler {
  constructor(private config: { url: string; secret?: string }) {}

  async send(alert: AlertTriggered): Promise<void> {
    // Would POST to webhook URL
    console.log(`[Webhook] Alert triggered: ${alert.symbol} at ${alert.currentValue}`)
    // await fetch(this.config.url, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', 'X-Webhook-Secret': this.config.secret },
    //   body: JSON.stringify(alert),
    // })
  }
}

export class BrowserNotificationHandler implements NotificationChannelHandler {
  async send(alert: AlertTriggered): Promise<void> {
    // Would use browser Notification API
    if ('Notification' in window) {
      const permission = Notification.permission
      if (permission === 'granted') {
        new Notification(`TradeClaw Alert: ${alert.symbol}`, {
          body: `${alert.conditionType} ${alert.targetValue} (current: ${alert.currentValue})`,
          icon: '/favicon.ico',
        })
      }
    }
    console.log(`[Browser] Alert triggered: ${alert.symbol} at ${alert.currentValue}`)
  }
}

export default NotificationDispatcherImpl
