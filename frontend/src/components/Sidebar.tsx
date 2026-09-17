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
  X,
} from 'lucide-react'

type Page = 
  | 'dashboard' 
  | 'live-cameras' 
  | 'vehicle-intelligence' 
  | 'anpr' 
  | 'trajectories' 
  | 'traffic-analytics' 
  | 'alerts' 
  | 'watchlist' 
  | 'camera-management' 
  | 'reports' 
  | 'system-health' 
  | 'settings'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  page?: Page
  disabled?: boolean
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, page: 'dashboard' },
  { id: 'live-cameras', label: 'Live Cameras', icon: <Video size={16} />, page: 'live-cameras' },
  { id: 'vehicle-intelligence', label: 'Vehicle Intelligence', icon: <Car size={16} />, page: 'vehicle-intelligence' },
  { id: 'anpr', label: 'ANPR', icon: <ScanLine size={16} />, page: 'anpr' },
  { id: 'trajectories', label: 'Trajectories', icon: <Route size={16} />, page: 'trajectories' },
  { id: 'analytics', label: 'Traffic Analytics', icon: <BarChart3 size={16} />, page: 'traffic-analytics' },
  { id: 'alerts', label: 'Alerts', icon: <Bell size={16} />, page: 'alerts' },
  { id: 'watchlist', label: 'Watchlist', icon: <BookMarked size={16} />, page: 'watchlist' },
  { id: 'cameras', label: 'Camera Management', icon: <Camera size={16} />, page: 'camera-management' },
  { id: 'reports', label: 'Reports', icon: <FileText size={16} />, page: 'reports' },
  { id: 'system-health', label: 'System Health', icon: <Activity size={16} />, page: 'system-health' },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} />, page: 'settings' },
]

interface Props {
  activePage: Page
  onNavigate: (page: Page) => void
  isOpen?: boolean
  onClose?: () => void
  alertCount?: number
}

export default function Sidebar({ activePage, onNavigate, isOpen, onClose, alertCount = 0 }: Props) {
  return (
    <aside
      className={`flex flex-col w-64 md:w-56 shrink-0 border-r fixed md:relative inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
      style={{ backgroundColor: '#0a0e1a', borderColor: '#1e2d4a' }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b shrink-0" style={{ borderColor: '#1e2d4a' }}>
        <div className="flex items-center gap-2.5">
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
        
        {/* Mobile Close Button */}
        <button 
          className="md:hidden p-1 rounded-md transition-colors"
          style={{ color: '#8899bb' }}
          onClick={onClose}
        >
          <X size={20} />
        </button>
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
              <span className="text-xs font-medium flex-1">{item.label}</span>
              {item.id === 'alerts' && alertCount > 0 && (
                <span
                  className="text-white rounded-full px-1.5 py-0.5"
                  style={{ backgroundColor: '#ef4444', fontSize: '9px', fontWeight: 700, minWidth: 16, textAlign: 'center' }}
                >
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
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
