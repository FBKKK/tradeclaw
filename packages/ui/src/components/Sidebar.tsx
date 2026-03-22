import { type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { Page } from '../App'
import { ROUTES } from '../App'

interface SidebarProps {
  sseConnected: boolean
  open: boolean
  onClose: () => void
}

const Chevron = ({ expanded }: { expanded: boolean }) => (
  <svg
    width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={`transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

interface NavLeaf {
  page: Page
  label: string
  icon: (active: boolean) => ReactNode
}

interface NavGroup {
  prefix: string
  label: string
  icon: (active: boolean) => ReactNode
  children: { page: Page; label: string }[]
}

type NavItem = NavLeaf | NavGroup
const isGroup = (item: NavItem): item is NavGroup => 'children' in item

const NAV_ITEMS: NavItem[] = [
  {
    page: 'chat',
    label: '对话',
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    page: 'tasks',
    label: '我的任务',
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M9 11l2 2 4-4" />
        <path d="M9 17h6" />
      </svg>
    ),
  },
  {
    page: 'market',
    label: '策略市场',
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7h18" />
        <path d="M6 3v8" />
        <path d="M18 3v8" />
        <path d="M5 21h14" />
        <path d="M7 11l2 6 3-4 3 3 2-5" />
      </svg>
    ),
  },
  {
    page: 'arena',
    label: 'Arena',
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3h8" />
        <path d="M9 3v4l-4 3v3a7 7 0 1 0 14 0v-3l-4-3V3" />
        <path d="M9 14h6" />
      </svg>
    ),
  },
  {
    page: 'portfolio',
    label: '资产',
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 10l3-3 2 2 5-5" />
      </svg>
    ),
  },
  {
    page: 'settings',
    label: '设置',
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

const PRIMARY_NAV_PAGES: Page[] = ['chat', 'tasks', 'market', 'arena', 'portfolio', 'settings']

const getSidebarActivePage = (pathname: string): Page => {
  if (pathname === '/') return 'chat'
  if (pathname.startsWith('/tasks')) return 'tasks'
  if (pathname.startsWith('/market')) return 'market'
  if (pathname.startsWith('/arena')) return 'arena'
  if (pathname.startsWith('/portfolio')) return 'portfolio'
  if (pathname.startsWith('/settings')) return 'settings'
  return 'chat'
}

export function Sidebar({ sseConnected, open, onClose }: SidebarProps) {
  const location = useLocation()
  const currentPage = getSidebarActivePage(location.pathname)
  const navItems = NAV_ITEMS.filter((item) => !('page' in item) || PRIMARY_NAV_PAGES.includes(item.page))

  return (
    <>
      {/* Backdrop — mobile only */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`
          w-[220px] h-full flex flex-col bg-bg-secondary border-r border-border shrink-0
          fixed z-50 top-0 left-0 transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0 md:z-auto md:transition-none
        `}
      >
        {/* Branding */}
        <div className="px-5 py-4 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <h1 className="text-[15px] font-semibold text-text">TradeClaw</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-0.5 px-2">
          {navItems.map((item) => {
            if (isGroup(item)) {
              const expanded = location.pathname.startsWith(`/${item.prefix}`)
              return (
                <div key={item.prefix}>
                  <Link
                    to={ROUTES[item.children[0].page]}
                    onClick={onClose}
                    className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                      expanded
                        ? 'text-text bg-bg-tertiary/60'
                        : 'text-text-muted hover:text-text hover:bg-bg-tertiary/40'
                    }`}
                  >
                    {expanded && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-accent" />}
                    <span className="flex items-center justify-center w-5 h-5">{item.icon(expanded)}</span>
                    <span className="flex-1">{item.label}</span>
                    <Chevron expanded={expanded} />
                  </Link>

                  <div
                    className={`overflow-hidden transition-all duration-150 ${
                      expanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    {item.children.map((child) => {
                      const isActive = currentPage === child.page
                      return (
                        <Link
                          key={child.page}
                          to={ROUTES[child.page]}
                          onClick={onClose}
                          className={`relative w-full flex items-center pl-11 pr-3 py-1.5 rounded-lg text-[13px] transition-colors text-left ${
                            isActive
                              ? 'bg-bg-tertiary/60 text-text'
                              : 'text-text-muted hover:text-text hover:bg-bg-tertiary/40'
                          }`}
                        >
                          {isActive && <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-accent" />}
                          {child.label}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            }

            const isActive = currentPage === item.page
            return (
              <Link
                key={item.page}
                to={ROUTES[item.page]}
                onClick={onClose}
                className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                  isActive
                    ? 'bg-bg-tertiary/60 text-text'
                    : 'text-text-muted hover:text-text hover:bg-bg-tertiary/40'
                }`}
              >
                {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-accent" />}
                <span className="flex items-center justify-center w-5 h-5">{item.icon(isActive)}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* SSE Connection Status */}
        <div className="mt-auto px-4 py-3 border-t border-border">
          <div className="flex items-center gap-2 text-[12px] text-text-muted">
            <span className="relative flex h-2 w-2">
              {sseConnected ? (
                <span className="w-2 h-2 rounded-full bg-green" />
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red" />
                </>
              )}
            </span>
            <span>{sseConnected ? '已连接' : '正在重连...'}</span>
          </div>
        </div>
      </aside>
    </>
  )
}
