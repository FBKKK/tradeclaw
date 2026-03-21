import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/form'
import { Toggle } from '../components/Toggle'
import { useToast } from '../components/Toast'

interface Task {
  id: string
  name: string
  type: 'report' | 'alert' | 'strategy'
  schedule: string
  enabled: boolean
  lastRun?: Date
  nextRun?: Date
}

export function TasksPage() {
  const { success } = useToast()
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      name: '每日交易报告',
      type: 'report',
      schedule: '0 9 * * *',
      enabled: true,
      lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
      nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000),
    },
    {
      id: '2',
      name: 'BTC 价格预警',
      type: 'alert',
      schedule: '实时监控',
      enabled: true,
    },
    {
      id: '3',
      name: '网格策略',
      type: 'strategy',
      schedule: '持续运行',
      enabled: false,
    },
  ])

  const toggleTask = (id: string) => {
    success('任务状态已更新')
  }

  const getTaskIcon = (type: Task['type']) => {
    switch (type) {
      case 'report':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'alert':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        )
      case 'strategy':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader
        title="我的任务"
        description="管理定时任务和自动化"
        right={
          <button className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
            创建任务
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              task.type === 'report' ? 'bg-purple-dim text-purple' :
              task.type === 'alert' ? 'bg-notification-bg text-notification-border' :
              'bg-accent-dim text-accent'
            }`}>
              {getTaskIcon(task.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-text">{task.name}</div>
              <div className="text-xs text-text-muted mt-0.5">
                {task.schedule}
                {task.lastRun && ` · 上次运行: ${task.lastRun.toLocaleDateString()}`}
              </div>
            </div>

            <Toggle
              checked={task.enabled}
              onChange={() => toggleTask(task.id)}
              size="sm"
            />
          </Card>
        ))}
      </div>
    </div>
  )
}
