import { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { Card, Section, Field, inputClass } from '../components/form'
import { Toggle } from '../components/Toggle'
import { useToast } from '../components/Toast'

function TradingSettings() {
  const { success } = useToast()

  return (
    <div className="space-y-4">
      <Section title="交易配置" description="设置默认交易参数">
        <Field label="默认交易所">
          <select className={inputClass}>
            <option value="binance">Binance</option>
            <option value="bybit">Bybit</option>
            <option value="okx">OKX</option>
            <option value="alpaca">Alpaca</option>
          </select>
        </Field>

        <Field label="默认合约类型">
          <select className={inputClass}>
            <option value="spot">现货</option>
            <option value="futures">期货</option>
          </select>
        </Field>

        <Field label="模拟交易">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">默认使用模拟账户交易</span>
            <Toggle checked={true} onChange={() => success('设置已保存')} size="sm" />
          </div>
        </Field>
      </Section>

      <Section title="风险控制" description="设置交易风险参数">
        <Field label="单笔最大仓位">
          <input type="number" defaultValue="1000" className={inputClass} />
        </Field>

        <Field label="每日最大亏损">
          <input type="number" defaultValue="5000" className={inputClass} />
        </Field>

        <Field label="冷却时间">
          <input type="number" defaultValue="60" className={inputClass} />
          <p className="text-[12px] text-text-muted/60 mt-1">两次交易之间的最小间隔（秒）</p>
        </Field>
      </Section>
    </div>
  )
}

function AlertSettings() {
  const { success } = useToast()
  const [notifications, setNotifications] = useState({
    email: true,
    telegram: false,
    browser: true,
  })

  return (
    <div className="space-y-4">
      <Section title="通知设置" description="配置预警通知方式">
        <Field label="邮件通知">
          <Toggle
            checked={notifications.email}
            onChange={(v) => {
              setNotifications((prev) => ({ ...prev, email: v }))
              success('设置已保存')
            }}
          />
        </Field>

        <Field label="Telegram 通知">
          <Toggle
            checked={notifications.telegram}
            onChange={(v) => {
              setNotifications((prev) => ({ ...prev, telegram: v }))
              success('设置已保存')
            }}
          />
        </Field>

        <Field label="浏览器通知">
          <Toggle
            checked={notifications.browser}
            onChange={(v) => {
              setNotifications((prev) => ({ ...prev, browser: v }))
              success('设置已保存')
            }}
          />
        </Field>
      </Section>

      <Section title="预警规则" description="设置全局预警规则">
        <Field label="默认冷却时间">
          <input type="number" defaultValue="60" className={inputClass} />
        </Field>
      </Section>
    </div>
  )
}

function ApiKeysSettings() {
  const { success, error } = useToast()
  const [apiKeys, setApiKeys] = useState([
    { id: '1', exchange: 'binance', label: 'Main API', hasKey: true },
    { id: '2', exchange: 'alpaca', label: 'Stock Trading', hasKey: false },
  ])

  const addApiKey = () => {
    success('API Key 添加功能开发中')
  }

  const deleteApiKey = (id: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id))
    success('API Key 已删除')
  }

  return (
    <div className="space-y-4">
      <Section title="API Keys" description="管理交易所 API Keys">
        <div className="space-y-2">
          {apiKeys.map((key) => (
            <div key={key.id} className="flex items-center justify-between p-3 bg-bg rounded-lg">
              <div>
                <div className="text-sm font-medium text-text">{key.exchange}</div>
                <div className="text-xs text-text-muted">{key.label}</div>
              </div>
              <div className="flex items-center gap-2">
                {key.hasKey ? (
                  <span className="px-2 py-0.5 bg-green/10 text-green text-xs rounded">已配置</span>
                ) : (
                  <span className="px-2 py-0.5 bg-bg-tertiary text-text-muted text-xs rounded">未配置</span>
                )}
                <button
                  onClick={() => deleteApiKey(key.id)}
                  className="px-2 py-1 text-xs text-red hover:bg-red/10 rounded transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addApiKey}
          className="w-full mt-3 px-4 py-2 border border-dashed border-border rounded-lg text-sm text-text-muted hover:text-text hover:border-text-muted transition-colors"
        >
          + 添加 API Key
        </button>
      </Section>
    </div>
  )
}

function AISettings() {
  const { success } = useToast()

  return (
    <div className="space-y-4">
      <Section title="AI 配置" description="配置 AI 助手行为">
        <Field label="AI 模型">
          <select className={inputClass}>
            <option value="claude">Claude</option>
            <option value="gpt4">GPT-4</option>
          </select>
        </Field>

        <Field label="回复详细程度">
          <select className={inputClass}>
            <option value="brief">简洁</option>
            <option value="normal">普通</option>
            <option value="detailed">详细</option>
          </select>
        </Field>

        <Field label="自动执行交易">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">AI 建议是否自动执行</span>
            <Toggle checked={false} onChange={() => success('设置已保存')} size="sm" />
          </div>
        </Field>
      </Section>
    </div>
  )
}

const SETTINGS_NAV = [
  { path: '/settings', label: '交易配置', exact: true },
  { path: '/settings/alerts', label: '预警管理' },
  { path: '/settings/apikeys', label: 'API Keys' },
  { path: '/settings/ai', label: 'AI 配置' },
]

export function SettingsPage() {
  const location = useLocation()

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader title="设置" description="配置 TradeClaw" />

      <div className="flex flex-1 min-h-0">
        {/* Settings Navigation */}
        <div className="w-[180px] border-r border-border p-4 shrink-0">
          <nav className="space-y-0.5">
            {SETTINGS_NAV.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  location.pathname === item.path
                    ? 'bg-bg-tertiary/60 text-text'
                    : 'text-text-muted hover:text-text hover:bg-bg-tertiary/40'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <Routes>
            <Route index element={<TradingSettings />} />
            <Route path="alerts" element={<AlertSettings />} />
            <Route path="apikeys" element={<ApiKeysSettings />} />
            <Route path="ai" element={<AISettings />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
