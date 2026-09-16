import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import VehicleIntelligence from './pages/VehicleIntelligence'
import ANPRPage from './pages/ANPRPage'
import TrajectoriesPage from './pages/TrajectoriesPage'

type Page = 'vehicle-intelligence' | 'anpr' | 'trajectories'

export default function App() {
  const [activePage, setActivePage] = useState<Page>('vehicle-intelligence')

  const pageInfo: Record<Page, { title: string; subtitle: string }> = {
    'vehicle-intelligence': {
      title: 'Vehicle Intelligence',
      subtitle: 'Search and inspect vehicles detected across the camera network.',
    },
    anpr: {
      title: 'Automatic Number Plate Recognition',
      subtitle: 'Real-time license plate detection and OCR monitoring.',
    },
    trajectories: {
      title: 'Vehicle Trajectory',
      subtitle: 'Reconstruct vehicle movement across multiple cameras.',
    },
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0a0e1a' }}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar title={pageInfo[activePage].title} subtitle={pageInfo[activePage].subtitle} />
        <main className="flex-1 overflow-auto p-6" style={{ backgroundColor: '#0a0e1a' }}>
          {activePage === 'vehicle-intelligence' && <VehicleIntelligence />}
          {activePage === 'anpr' && <ANPRPage />}
          {activePage === 'trajectories' && <TrajectoriesPage />}
        </main>
      </div>
    </div>
  )
}
