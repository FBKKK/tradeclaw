import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/Toast'
import api from '../api/client'

type AuthMode = 'login' | 'register'

interface AuthFormData {
  email: string
  password: string
  confirmPassword?: string
}

export function AuthPage() {
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const [mode, setMode] = useState<AuthMode>('login')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          showError('密码不匹配')
          setLoading(false)
          return
        }
        if (formData.password.length < 8) {
          showError('密码至少需要8个字符')
          setLoading(false)
          return
        }
      }

      const data = mode === 'login'
        ? await api.login(formData.email, formData.password)
        : await api.register(formData.email, formData.password)

      // Store tokens
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))

      success(mode === 'login' ? '登录成功' : '注册成功')

      // Check if onboarding needed
      const isNewUser = mode === 'register' || !localStorage.getItem('onboardingCompleted')
      if (isNewUser) {
        navigate('/onboarding')
      } else {
        navigate('/')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '网络错误，请稍后重试'
      showError(message)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setFormData({ email: '', password: '', confirmPassword: '' })
  }

  return (
    <div className="min-h-full flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(31,119,255,0.15),_transparent_50%),linear-gradient(180deg,_rgba(13,17,23,1),_rgba(7,9,15,1))] p-4">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/15 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight text-text">TradeClaw</h1>
          <p className="text-sm text-text-muted mt-1">您的 AI 交易助手</p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-border/60 bg-bg-secondary/80 p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-text mb-1">
            {mode === 'login' ? '登录账户' : '创建账户'}
          </h2>
          <p className="text-sm text-text-muted mb-6">
            {mode === 'login'
              ? '欢迎回来！请登录您的账户'
              : '注册新账户，开始您的交易之旅'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-text mb-1.5">邮箱</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-2.5 bg-bg text-text border border-border rounded-xl text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-text mb-1.5">密码</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full px-4 py-2.5 bg-bg text-text border border-border rounded-xl text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/60 transition-colors"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm text-text mb-1.5">确认密码</label>
                <input
                  type="password"
                  value={formData.confirmPassword || ''}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 bg-bg text-text border border-border rounded-xl text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/60 transition-colors"
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <button type="button" className="text-xs text-accent hover:text-accent/80">
                  忘记密码？
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  处理中...
                </span>
              ) : (
                mode === 'login' ? '登录' : '注册'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-text-muted">
              {mode === 'login' ? '还没有账户？' : '已有账户？'}
            </span>
            <button
              type="button"
              onClick={switchMode}
              className="ml-1 text-sm text-accent hover:text-accent/80 font-medium"
            >
              {mode === 'login' ? '立即注册' : '去登录'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted mt-6">
          登录即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  )
}
