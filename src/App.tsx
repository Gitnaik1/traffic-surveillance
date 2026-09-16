import { useState } from 'react'
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

export default function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard')

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
      case 'dashboard': return <Dashboard />
      case 'live-cameras': return <LiveCameras />
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
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar title={pageInfo[activePage].title} subtitle={pageInfo[activePage].subtitle} />
        <main className="flex-1 overflow-auto p-6" style={{ backgroundColor: '#0a0e1a' }}>
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
