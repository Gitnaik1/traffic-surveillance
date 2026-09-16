import { useState, Component, type ReactNode, type ErrorInfo } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'

import Dashboard from './pages/Dashboard'
import LiveCameras from './pages/LiveCameras'
import VehicleIntelligence from './pages/VehicleIntelligence'
import ANPRPage from './pages/ANPRPage'
import TrajectoriesPage from './pages/TrajectoriesPage'
import TrafficAnalytics from './pages/TrafficAnalytics'
import Alerts from './pages/Alerts'
import Watchlist from './pages/Watchlist'
import CameraManagement from './pages/CameraManagement'
import Reports from './pages/Reports'
import SystemHealth from './pages/SystemHealth'
import Settings from './pages/Settings'

export type Page = 
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

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled UI Error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#0a0e1a] text-[#f0f4ff] p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[#ef444420] border border-[#ef4444] flex items-center justify-center text-[#ef4444] mb-4 text-xl font-bold">
            !
          </div>
          <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
          <p className="text-xs text-[#8899bb] max-w-md mb-6 font-mono bg-[#141c30] p-3 rounded border border-[#1e2d4a]">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            className="px-4 py-2 rounded-lg bg-[#2563eb] text-white text-xs font-semibold hover:bg-[#1d4ed8] transition-colors"
          >
            Reload UrbanTrax AI
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

function AppShell() {
  const [activePage, setActivePage] = useState<Page>('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { backendOnline, unacknowledgedCount } = useApp()

  const pageInfo: Record<Page, { title: string; subtitle: string }> = {
    'dashboard': { title: 'Dashboard', subtitle: 'System overview and key metrics.' },
    'live-cameras': { title: 'Live Cameras', subtitle: 'Real-time video feeds from the network.' },
    'vehicle-intelligence': { title: 'Vehicle Intelligence', subtitle: 'Search and inspect vehicles detected across the camera network.' },
    'anpr': { title: 'Automatic Number Plate Recognition', subtitle: 'Real-time license plate detection and OCR monitoring.' },
    'trajectories': { title: 'Vehicle Trajectory', subtitle: 'Reconstruct vehicle movement across multiple cameras.' },
    'traffic-analytics': { title: 'Traffic Analytics', subtitle: 'Insights and trends from vehicle data.' },
    'alerts': { title: 'Alerts', subtitle: 'System and security alerts.' },
    'watchlist': { title: 'Watchlist', subtitle: 'Monitored vehicles and plates.' },
    'camera-management': { title: 'Camera Management', subtitle: 'Configure and monitor camera nodes.' },
    'reports': { title: 'Reports', subtitle: 'Traffic Intelligence Reports.' },
    'system-health': { title: 'System Health', subtitle: 'Platform services and hardware status.' },
    'settings': { title: 'System Settings', subtitle: 'Global configuration and preferences.' },
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard onCameraSelect={(id) => { console.log('Camera selected:', id); setActivePage('live-cameras'); }} />
      case 'live-cameras': return <LiveCameras onSelectCamera={(id) => console.log('Camera selected:', id)} />
      case 'vehicle-intelligence': return <VehicleIntelligence />
      case 'anpr': return <ANPRPage />
      case 'trajectories': return <TrajectoriesPage />
      case 'traffic-analytics': return <TrafficAnalytics />
      case 'alerts': return <Alerts />
      case 'watchlist': return <Watchlist />
      case 'camera-management': return <CameraManagement />
      case 'reports': return <Reports />
      case 'system-health': return <SystemHealth />
      case 'settings': return <Settings />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0a0e1a' }}>
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        activePage={activePage} 
        onNavigate={(page) => {
          setActivePage(page)
          setIsSidebarOpen(false)
        }} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        alertCount={unacknowledgedCount}
      />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Navbar 
          title={pageInfo[activePage].title} 
          subtitle={pageInfo[activePage].subtitle} 
          onMenuClick={() => setIsSidebarOpen(true)}
          backendOnline={backendOnline}
          alertCount={unacknowledgedCount}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6" style={{ backgroundColor: '#0a0e1a' }}>
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </ErrorBoundary>
  )
}
