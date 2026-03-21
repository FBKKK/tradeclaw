import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { ToastProvider } from './components/Toast'
import { AuthGate, GuestGate } from './components/AuthGate'
import { AuthPage } from './pages/Auth'
import { OnboardingPage } from './pages/Onboarding'
import { ChatPage } from './pages/Chat'
import { TasksPage } from './pages/Tasks'
import { StrategiesPage } from './pages/Strategies'
import { AlertsPage } from './pages/Alerts'
import { PortfolioPage } from './pages/Portfolio'
import { ReportsPage } from './pages/Reports'
import { SettingsPage } from './pages/Settings'

export type Page = 'chat' | 'tasks' | 'market' | 'arena' | 'portfolio' | 'settings'

export const ROUTES: Record<Page, string> = {
  chat: '/',
  tasks: '/tasks',
  market: '/market',
  arena: '/arena',
  portfolio: '/portfolio',
  settings: '/settings',
}

// Protected app layout with sidebar
function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sseConnected] = useState(true)

  return (
    <div className="h-full flex bg-bg text-text">
      <Sidebar
        sseConnected={sseConnected}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/strategies" element={<StrategiesPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings/*" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  )
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-full flex items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-text-muted">加载中...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* Guest-only routes (login, register) */}
        <Route
          path="/auth"
          element={
            <GuestGate>
              <AuthPage />
            </GuestGate>
          }
        />

        {/* Onboarding */}
        <Route
          path="/onboarding"
          element={
            <AuthGate fallback={<LoadingFallback />}>
              <OnboardingPage />
            </AuthGate>
          }
        />

        {/* Protected app routes */}
        <Route
          path="/*"
          element={
            <AuthGate fallback={<LoadingFallback />}>
              <AppLayout />
            </AuthGate>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  )
}

export default App
