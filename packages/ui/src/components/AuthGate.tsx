import { useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../hooks/useAuth'

interface AuthGateProps {
  children: ReactNode
  fallback?: ReactNode
}

export function AuthGate({ children, fallback }: AuthGateProps) {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    const verify = async () => {
      if (!isAuthenticated) {
        const valid = await checkAuth()
        if (!valid) {
          navigate('/auth')
        }
      }
    }
    verify()
  }, [isAuthenticated, checkAuth, navigate])

  if (isLoading) {
    return fallback || (
      <div className="min-h-full flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-muted">加载中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return fallback || null
  }

  return <>{children}</>
}

export function GuestGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Check if onboarding is needed
      const onboardingCompleted = localStorage.getItem('onboardingCompleted')
      if (!onboardingCompleted) {
        navigate('/onboarding')
      } else {
        navigate('/')
      }
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-muted">加载中...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return <>{children}</>
}
