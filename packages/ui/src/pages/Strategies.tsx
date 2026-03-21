import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Card, inputClass } from '../components/form'
import { Toggle } from '../components/Toggle'
import { useToast } from '../components/Toast'

interface Strategy {
  id: string
  name: string
  description: string
  isActive: boolean
  totalTrades: number
  winRate: number
  pnl: number
}

export function StrategiesPage() {
  const { success, error } = useToast()
  const [strategies, setStrategies] = useState<Strategy[]>([
    {
      id: '1',
      name: '趋势跟踪策略',
      description: '基于MA均线的趋势跟踪策略，适用于趋势行情',
      isActive: true,
      totalTrades: 156,
      winRate: 0.62,
      pnl: 2340.50,
    },
    {
      id: '2',
      name: '网格策略',
      description: '在震荡行情中自动高抛低吸',
      isActive: false,
      totalTrades: 423,
      winRate: 0.58,
      pnl: 1890.25,
    },
  ])

  const toggleStrategy = (id: string) => {
    setStrategies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    )
    success('策略状态已更新')
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader
        title="策略"
        description="创建、管理和回测交易策略"
        right={
          <button className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
            新建策略
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {strategies.map((strategy) => (
          <Card key={strategy.id} className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-text">{strategy.name}</h3>
                  {strategy.isActive && (
                    <span className="px-2 py-0.5 bg-green/10 text-green text-[10px] rounded-full">
                      运行中
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-1">{strategy.description}</p>
              </div>
              <Toggle
                checked={strategy.isActive}
                onChange={() => toggleStrategy(strategy.id)}
                size="sm"
              />
            </div>

            <div className="flex gap-6 text-xs">
              <div>
                <span className="text-text-muted">交易次数</span>
                <div className="text-text font-medium mt-0.5">{strategy.totalTrades}</div>
              </div>
              <div>
                <span className="text-text-muted">胜率</span>
                <div className="text-text font-medium mt-0.5">{(strategy.winRate * 100).toFixed(1)}%</div>
              </div>
              <div>
                <span className="text-text-muted">盈亏</span>
                <div className={`font-medium mt-0.5 ${strategy.pnl >= 0 ? 'text-green' : 'text-red'}`}>
                  ${strategy.pnl.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border/50">
              <button className="px-3 py-1.5 text-xs text-text-muted hover:text-text hover:bg-bg-tertiary rounded-md transition-colors">
                回测
              </button>
              <button className="px-3 py-1.5 text-xs text-text-muted hover:text-text hover:bg-bg-tertiary rounded-md transition-colors">
                编辑
              </button>
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
