import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/Toast'

interface OnboardingAnswers {
  tradingExperience: string
  preferredExchanges: string[]
  riskTolerance: string
  notificationMethods: string[]
}

const STEPS = [
  { id: 'experience', title: '交易经验', subtitle: '您有多少交易经验？' },
  { id: 'exchanges', title: '交易平台', subtitle: '您使用哪些交易所？' },
  { id: 'risk', title: '风险偏好', subtitle: '您的风险承受能力？' },
  { id: 'notifications', title: '通知方式', subtitle: '您希望如何收到通知？' },
]

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: '新手', description: '刚接触交易，了解甚少' },
  { value: 'intermediate', label: '有经验', description: '有一些实战经验' },
  { value: 'advanced', label: '专业', description: '多年交易经验，熟悉各种策略' },
]

const EXCHANGE_OPTIONS = [
  { value: 'binance', label: 'Binance', icon: '₿' },
  { value: 'bybit', label: 'Bybit', icon: '◈' },
  { value: 'okx', label: 'OKX', icon: '◎' },
  { value: 'alpaca', label: 'Alpaca', icon: '🦬' },
]

const RISK_OPTIONS = [
  { value: 'conservative', label: '保守', description: '优先保本，少量尝试' },
  { value: 'moderate', label: '稳健', description: '适度追求收益' },
  { value: 'aggressive', label: '激进', description: '愿意承担高风险追求高收益' },
]

const NOTIFICATION_OPTIONS = [
  { value: 'email', label: '邮件', icon: '✉' },
  { value: 'telegram', label: 'Telegram', icon: '✈' },
  { value: 'browser', label: '浏览器', icon: '🌐' },
]

function ProgressIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <span
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === currentStep
              ? 'w-8 bg-accent'
              : i < currentStep
                ? 'w-4 bg-accent/60'
                : 'w-2 bg-white/20'
          }`}
        />
      ))}
      <span className="ml-2 text-xs text-text-muted">
        {currentStep + 1} / {totalSteps}
      </span>
    </div>
  )
}

function OptionCard({
  selected,
  onClick,
  children,
  variant = 'default',
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  variant?: 'default' | 'compact'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left rounded-xl border transition-all duration-200
        ${variant === 'compact'
          ? 'p-3 border-border/60 hover:border-border'
          : 'p-4 border-border/60 hover:border-accent/40'
        }
        ${selected
          ? 'border-accent/50 bg-accent/10'
          : 'bg-bg-secondary/40 hover:bg-bg-secondary/60'
        }
      `}
    >
      {children}
    </button>
  )
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const { success } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    tradingExperience: '',
    preferredExchanges: [],
    riskTolerance: '',
    notificationMethods: [],
  })
  const [completing, setCompleting] = useState(false)

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return answers.tradingExperience !== ''
      case 1:
        return answers.preferredExchanges.length > 0
      case 2:
        return answers.riskTolerance !== ''
      case 3:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setCompleting(true)
    try {
      // Save onboarding answers
      localStorage.setItem('onboardingAnswers', JSON.stringify(answers))
      localStorage.setItem('onboardingCompleted', 'true')

      // Save user preferences to API
      const token = localStorage.getItem('accessToken')
      if (token) {
        await fetch('/api/users/me', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ preferences: answers }),
        }).catch(() => {})
      }

      success('设置完成！')
      navigate('/')
    } catch {
      // Still navigate even if API fails
      navigate('/')
    } finally {
      setCompleting(false)
    }
  }

  const toggleArrayValue = <T extends string>(arr: T[], val: T): T[] => {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]
  }

  return (
    <div className="min-h-full flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(31,119,255,0.15),_transparent_50%),linear-gradient(180deg,_rgba(13,17,23,1),_rgba(7,9,15,1))] p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/15 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-text">让我们先了解一下您</h1>
          <p className="text-sm text-text-muted mt-1">这将帮助我们为您定制最佳的交易体验</p>
        </div>

        {/* Progress */}
        <ProgressIndicator currentStep={currentStep} totalSteps={STEPS.length} />

        {/* Step Content */}
        <div className="bg-bg-secondary/80 rounded-2xl border border-border/60 p-6 shadow-xl">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wider text-accent mb-1">{STEPS[currentStep].title}</p>
            <h2 className="text-lg font-semibold text-text">{STEPS[currentStep].subtitle}</h2>
          </div>

          {/* Step 1: Experience */}
          {currentStep === 0 && (
            <div className="space-y-3">
              {EXPERIENCE_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  selected={answers.tradingExperience === option.value}
                  onClick={() => setAnswers({ ...answers, tradingExperience: option.value })}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-text">{option.label}</div>
                      <div className="text-xs text-text-muted mt-0.5">{option.description}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers.tradingExperience === option.value
                        ? 'border-accent bg-accent'
                        : 'border-border'
                    }`}>
                      {answers.tradingExperience === option.value && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </div>
                  </div>
                </OptionCard>
              ))}
            </div>
          )}

          {/* Step 2: Exchanges */}
          {currentStep === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {EXCHANGE_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  selected={answers.preferredExchanges.includes(option.value)}
                  onClick={() =>
                    setAnswers({
                      ...answers,
                      preferredExchanges: toggleArrayValue(answers.preferredExchanges, option.value),
                    })
                  }
                  variant="compact"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{option.icon}</span>
                    <div className="text-sm font-medium text-text">{option.label}</div>
                  </div>
                </OptionCard>
              ))}
            </div>
          )}

          {/* Step 3: Risk */}
          {currentStep === 2 && (
            <div className="space-y-3">
              {RISK_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  selected={answers.riskTolerance === option.value}
                  onClick={() => setAnswers({ ...answers, riskTolerance: option.value })}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-text">{option.label}</div>
                      <div className="text-xs text-text-muted mt-0.5">{option.description}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers.riskTolerance === option.value
                        ? 'border-accent bg-accent'
                        : 'border-border'
                    }`}>
                      {answers.riskTolerance === option.value && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </div>
                  </div>
                </OptionCard>
              ))}
            </div>
          )}

          {/* Step 4: Notifications */}
          {currentStep === 3 && (
            <div className="space-y-3">
              {NOTIFICATION_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  selected={answers.notificationMethods.includes(option.value)}
                  onClick={() =>
                    setAnswers({
                      ...answers,
                      notificationMethods: toggleArrayValue(answers.notificationMethods, option.value),
                    })
                  }
                  variant="compact"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{option.icon}</span>
                    <div className="text-sm font-medium text-text">{option.label}</div>
                    {answers.notificationMethods.includes(option.value) && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto text-accent">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                </OptionCard>
              ))}
              <p className="text-xs text-text-muted mt-2">
                您可以随时在设置中更改通知偏好
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={currentStep === 0 ? () => navigate('/') : handleBack}
              className="px-4 py-2 text-sm text-text-muted hover:text-text transition-colors"
            >
              {currentStep === 0 ? '跳过' : '返回'}
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-6 py-2 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                下一步
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                disabled={completing}
                className="px-6 py-2 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {completing ? '完成中...' : '完成设置'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
