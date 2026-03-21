import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/form'
import { useToast } from '../components/Toast'

interface ScheduledReport {
  id: string
  name: string
  type: 'daily' | 'weekly' | 'monthly'
  scheduleCron: string
  enabled: boolean
  nextRun?: Date
}

export function ReportsPage() {
  const { success } = useToast()
  const [scheduledReports] = useState<ScheduledReport[]>([
    {
      id: '1',
      name: '每日交易报告',
      type: 'daily',
      scheduleCron: '0 9 * * *',
      enabled: true,
      nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000),
    },
    {
      id: '2',
      name: '每周策略总结',
      type: 'weekly',
      scheduleCron: '0 10 * * 1',
      enabled: true,
      nextRun: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  ])

  const generateReport = () => {
    success('报告生成中...')
    setTimeout(() => {
      success('报告已生成')
    }, 2000)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader
        title="报告"
        description="生成和管理交易报告"
        right={
          <button
            onClick={generateReport}
            className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            生成报告
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick Report Generation */}
        <Card>
          <h3 className="text-sm font-medium text-text mb-3">快速报告</h3>
          <div className="flex gap-2">
            <button
              onClick={generateReport}
              className="px-4 py-2 bg-bg-tertiary hover:bg-border text-text text-sm rounded-lg transition-colors"
            >
              今日报告
            </button>
            <button
              onClick={generateReport}
              className="px-4 py-2 bg-bg-tertiary hover:bg-border text-text text-sm rounded-lg transition-colors"
            >
              本周报告
            </button>
            <button
              onClick={generateReport}
              className="px-4 py-2 bg-bg-tertiary hover:bg-border text-text text-sm rounded-lg transition-colors"
            >
              本月报告
            </button>
          </div>
        </Card>

        {/* Scheduled Reports */}
        <div>
          <h3 className="text-sm font-medium text-text mb-2 px-1">定时报告</h3>
          <div className="space-y-2">
            {scheduledReports.map((report) => (
              <Card key={report.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text">{report.name}</span>
                      <span className="px-2 py-0.5 bg-purple-dim text-purple text-[10px] rounded">
                        {report.type === 'daily' ? '每日' : report.type === 'weekly' ? '每周' : '每月'}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted mt-0.5">
                      {report.scheduleCron}
                      {report.nextRun && ` · 下次: ${report.nextRun.toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${report.enabled ? 'bg-green' : 'bg-text-muted'}`} />
                    <span className="text-xs text-text-muted">
                      {report.enabled ? '已启用' : '已禁用'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div>
          <h3 className="text-sm font-medium text-text mb-2 px-1">最近报告</h3>
          <Card>
            <div className="text-center py-6 text-text-muted text-sm">
              暂无生成的报告
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
