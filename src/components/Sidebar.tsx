import {
  LayoutDashboard,
  Video,
  Car,
  ScanLine,
  Route,
  BarChart3,
  Bell,
  BookMarked,
  Camera,
  FileText,
  Activity,
  Settings,
  Cpu,
} from 'lucide-react'

type Page = 'vehicle-intelligence' | 'anpr' | 'trajectories'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  page?: Page
  disabled?: boolean
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, disabled: true },
  { id: 'live-cameras', label: 'Live Cameras', icon: <Video size={16} />, disabled: true },
  { id: 'vehicle-intelligence', label: 'Vehicle Intelligence', icon: <Car size={16} />, page: 'vehicle-intelligence' },
  { id: 'anpr', label: 'ANPR', icon: <ScanLine size={16} />, page: 'anpr' },
  { id: 'trajectories', label: 'Trajectories', icon: <Route size={16} />, page: 'trajectories' },
  { id: 'analytics', label: 'Traffic Analytics', icon: <BarChart3 size={16} />, disabled: true },
  { id: 'alerts', label: 'Alerts', icon: <Bell size={16} />, disabled: true },
  { id: 'watchlist', label: 'Watchlist', icon: <BookMarked size={16} />, disabled: true },
  { id: 'cameras', label: 'Camera Management', icon: <Camera size={16} />, disabled: true },
  { id: 'reports', label: 'Reports', icon: <FileText size={16} />, disabled: true },
  { id: 'system-health', label: 'System Health', icon: <Activity size={16} />, disabled: true },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} />, disabled: true },
]

interface Props {
  activePage: Page
  onNavigate: (page: Page) => void
}

export default function Sidebar({ activePage, onNavigate }: Props) {
  return (
    <aside
      className="flex flex-col w-56 shrink-0 border-r"
      style={{ backgroundColor: '#0a0e1a', borderColor: '#1e2d4a' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b" style={{ borderColor: '#1e2d4a' }}>
        <div
          className="flex items-center justify-center w-8 h-8 rounded"
          style={{ backgroundColor: '#2563eb' }}
        >
          <Cpu size={16} color="white" />
        </div>
        <div>
          <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#f0f4ff', letterSpacing: '0.12em' }}>
            UrbanTrax
          </div>
          <div className="text-xs font-medium" style={{ color: '#2563eb', letterSpacing: '0.06em' }}>
            AI
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.page && item.page === activePage
          const isDisabled = item.disabled

          return (
            <button
              key={item.id}
              onClick={() => item.page && !isDisabled && onNavigate(item.page)}
              disabled={isDisabled}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors relative"
              style={{
                color: isActive ? '#f0f4ff' : isDisabled ? '#2d3f5a' : '#8899bb',
                backgroundColor: isActive ? '#1a2440' : 'transparent',
                cursor: isDisabled ? 'default' : 'pointer',
              }}
            >
              {isActive && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-0.5"
                  style={{ backgroundColor: '#2563eb' }}
                />
              )}
              <span style={{ color: isActive ? '#3b82f6' : isDisabled ? '#1e2d4a' : '#4a6080' }}>
                {item.icon}
              </span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t" style={{ borderColor: '#1e2d4a' }}>
        <div className="text-xs font-mono" style={{ color: '#2d3f5a' }}>
          SIH26127
        </div>
        <div className="text-xs mt-0.5" style={{ color: '#2d3f5a' }}>
          v2.4.1-beta
        </div>
      </div>
    </aside>
  )
}
