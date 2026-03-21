import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/form'
import { Toggle } from '../components/Toggle'
import { useToast } from '../components/Toast'

interface Alert {
  id: string
  symbol: string
  exchange: string
  conditionType: string
  targetValue: number
  currentValue?: number
  enabled: boolean
  cooldownSeconds: number
  lastTriggered?: Date
}

export function AlertsPage() {
  const { success } = useToast()
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      symbol: 'BTC/USD',
      exchange: 'binance',
      conditionType: 'price_above',
      targetValue: 70000,
      currentValue: 67500,
      enabled: true,
      cooldownSeconds: 300,
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '2',
      symbol: 'ETH/USD',
      exchange: 'binance',
      conditionType: 'price_below',
      targetValue: 3000,
      currentValue: 3450,
      enabled: true,
      cooldownSeconds: 600,
    },
    {
      id: '3',
      symbol: 'SOL/USD',
      exchange: 'bybit',
      conditionType: 'price_above',
      targetValue: 200,
      enabled: false,
      cooldownSeconds: 300,
    },
  ])

  const toggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    )
    success('预警状态已更新')
  }

  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
    success('预警已删除')
  }

  const getConditionLabel = (type: string) => {
    switch (type) {
      case 'price_above': return '价格上穿'
      case 'price_below': return '价格下穿'
      case 'price_crosses_above': return '价格上穿'
      case 'price_crosses_below': return '价格下穿'
      default: return type
    }
  }

  const getConditionColor = (alert: Alert) => {
    if (!alert.currentValue) return 'text-text-muted'
    switch (alert.conditionType) {
      case 'price_above':
        return alert.currentValue >= alert.targetValue ? 'text-green' : 'text-text-muted'
      case 'price_below':
        return alert.currentValue <= alert.targetValue ? 'text-red' : 'text-text-muted'
      default:
        return 'text-text-muted'
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader
        title="预警"
        description="设置和管理价格预警"
        right={
          <button className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
            创建预警
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {alerts.map((alert) => (
          <Card key={alert.id} className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text">{alert.symbol}</span>
                  <span className="px-2 py-0.5 bg-bg-tertiary text-text-muted text-[10px] rounded">
                    {alert.exchange}
                  </span>
                </div>
                <div className="text-xs text-text-muted mt-1">
                  {getConditionLabel(alert.conditionType)} ${alert.targetValue.toLocaleString()}
                </div>
              </div>
              <Toggle
                checked={alert.enabled}
                onChange={() => toggleAlert(alert.id)}
                size="sm"
              />
            </div>

            {alert.currentValue && (
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-text-muted">当前价格</span>
                  <div className={`font-medium mt-0.5 ${getConditionColor(alert)}`}>
                    ${alert.currentValue.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-text-muted">目标价格</span>
                  <div className="text-text font-medium mt-0.5">
                    ${alert.targetValue.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-text-muted">冷却时间</span>
                  <div className="text-text font-medium mt-0.5">
                    {alert.cooldownSeconds}s
                  </div>
                </div>
              </div>
            )}

            {alert.lastTriggered && (
              <div className="text-xs text-text-muted">
                上次触发: {alert.lastTriggered.toLocaleString()}
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-border/50">
              <button className="px-3 py-1.5 text-xs text-red hover:bg-red/10 rounded-md transition-colors">
                删除
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
