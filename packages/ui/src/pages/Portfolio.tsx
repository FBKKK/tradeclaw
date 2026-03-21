import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/form'

interface Position {
  id: string
  symbol: string
  exchange: string
  side: 'long' | 'short'
  quantity: number
  entryPrice: number
  currentPrice: number
  unrealizedPnl: number
  unrealizedPnlPercent: number
}

interface Account {
  id: string
  exchange: string
  accountType: 'live' | 'paper' | 'simulation'
  totalValue: number
  dayPnl: number
  dayPnlPercent: number
}

export function PortfolioPage() {
  const [accounts] = useState<Account[]>([
    {
      id: '1',
      exchange: 'Binance',
      accountType: 'paper',
      totalValue: 50000,
      dayPnl: 1250.50,
      dayPnlPercent: 2.56,
    },
    {
      id: '2',
      exchange: 'Alpaca',
      accountType: 'paper',
      totalValue: 25000,
      dayPnl: -320.75,
      dayPnlPercent: -1.27,
    },
  ])

  const [positions] = useState<Position[]>([
    {
      id: '1',
      symbol: 'BTC/USD',
      exchange: 'binance',
      side: 'long',
      quantity: 0.5,
      entryPrice: 65000,
      currentPrice: 67500,
      unrealizedPnl: 1250,
      unrealizedPnlPercent: 3.85,
    },
    {
      id: '2',
      symbol: 'ETH/USD',
      exchange: 'binance',
      side: 'long',
      quantity: 5,
      entryPrice: 3200,
      currentPrice: 3450,
      unrealizedPnl: 1250,
      unrealizedPnlPercent: 7.81,
    },
    {
      id: '3',
      symbol: 'SOL/USD',
      exchange: 'bybit',
      side: 'short',
      quantity: 100,
      entryPrice: 150,
      currentPrice: 145,
      unrealizedPnl: 500,
      unrealizedPnlPercent: 3.33,
    },
  ])

  const totalValue = accounts.reduce((sum, a) => sum + a.totalValue, 0)
  const totalDayPnl = accounts.reduce((sum, a) => sum + a.dayPnl, 0)
  const totalDayPnlPercent = (totalDayPnl / (totalValue - totalDayPnl)) * 100

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader
        title="资产"
        description="查看持仓和账户资金"
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <div className="text-xs text-text-muted mb-1">总资产</div>
            <div className="text-xl font-semibold text-text">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </Card>
          <Card>
            <div className="text-xs text-text-muted mb-1">今日盈亏</div>
            <div className={`text-xl font-semibold ${totalDayPnl >= 0 ? 'text-green' : 'text-red'}`}>
              {totalDayPnl >= 0 ? '+' : ''}{totalDayPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              <span className="text-sm ml-1">({totalDayPnlPercent >= 0 ? '+' : ''}{totalDayPnlPercent.toFixed(2)}%)</span>
            </div>
          </Card>
        </div>

        {/* Accounts */}
        <div>
          <h3 className="text-sm font-medium text-text mb-2 px-1">账户</h3>
          <div className="space-y-2">
            {accounts.map((account) => (
              <Card key={account.id} className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text">{account.exchange}</span>
                    <span className="px-2 py-0.5 bg-bg-tertiary text-text-muted text-[10px] rounded">
                      {account.accountType === 'paper' ? '模拟' : account.accountType}
                    </span>
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    ${account.totalValue.toLocaleString()}
                  </div>
                </div>
                <div className={`text-right text-sm font-medium ${account.dayPnl >= 0 ? 'text-green' : 'text-red'}`}>
                  {account.dayPnl >= 0 ? '+' : ''}{account.dayPnl.toFixed(2)}
                  <div className="text-xs text-text-muted font-normal">
                    {account.dayPnlPercent >= 0 ? '+' : ''}{account.dayPnlPercent.toFixed(2)}%
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Positions */}
        <div>
          <h3 className="text-sm font-medium text-text mb-2 px-1">持仓</h3>
          <div className="space-y-2">
            {positions.map((position) => (
              <Card key={position.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text">{position.symbol}</span>
                    <span className={`px-2 py-0.5 text-[10px] rounded ${
                      position.side === 'long' ? 'bg-green/10 text-green' : 'bg-red/10 text-red'
                    }`}>
                      {position.side === 'long' ? '多' : '空'}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${position.unrealizedPnl >= 0 ? 'text-green' : 'text-red'}`}>
                    {position.unrealizedPnl >= 0 ? '+' : ''}${position.unrealizedPnl.toFixed(2)}
                    <span className="text-xs text-text-muted ml-1">
                      ({position.unrealizedPnlPercent >= 0 ? '+' : ''}{position.unrealizedPnlPercent.toFixed(2)}%)
                    </span>
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-text-muted">
                  <div>
                    <span>数量</span>
                    <div className="text-text mt-0.5">{position.quantity}</div>
                  </div>
                  <div>
                    <span>入场价</span>
                    <div className="text-text mt-0.5">${position.entryPrice.toLocaleString()}</div>
                  </div>
                  <div>
                    <span>当前价</span>
                    <div className="text-text mt-0.5">${position.currentPrice.toLocaleString()}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
