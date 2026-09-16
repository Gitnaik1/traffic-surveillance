import { X, Camera, Clock, Car, Shield } from 'lucide-react'
import type { Vehicle } from '../data/vehicles'
import ConfidenceBadge from './ConfidenceBadge'
import StatusBadge from './StatusBadge'

interface Props {
  vehicle: Vehicle
  onClose: () => void
}

const DETECTION_HISTORY = [
  { time: '10:21:14', camera: 'CAM-001', location: 'MG Road Junction', event: 'Initial Detection', confidence: 91.2 },
  { time: '10:35:08', camera: 'CAM-003', location: 'Brigade Rd Crossing', event: 'Re-identified', confidence: 93.4 },
  { time: '10:43:52', camera: 'CAM-007', location: 'Residency Rd', event: 'Vehicle Detected', confidence: 94.6 },
]

function ConfidenceBar({ label, value, color = '#3b82f6' }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs" style={{ color: '#8899bb' }}>{label}</span>
        <span className="text-xs font-mono font-medium" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>
          {value}%
        </span>
      </div>
      <div className="h-1.5 rounded-full" style={{ backgroundColor: '#1e2d4a' }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function VehicleDrawer({ vehicle, onClose }: Props) {
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40" style={{ backgroundColor: '#00000060' }} onClick={onClose} />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden border-l"
        style={{ width: '480px', backgroundColor: '#0f1629', borderColor: '#1e2d4a' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: '#1e2d4a' }}
        >
          <div>
            <div className="text-xs font-mono font-semibold" style={{ color: '#3b82f6', fontFamily: "'JetBrains Mono', monospace" }}>
              {vehicle.id}
            </div>
            <div className="text-lg font-bold tracking-widest mt-0.5" style={{ color: '#f0f4ff', fontFamily: "'JetBrains Mono', monospace" }}>
              {vehicle.plate}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded border"
            style={{ backgroundColor: '#141c30', borderColor: '#253656', color: '#8899bb' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Vehicle image placeholder */}
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#141c30', border: '1px solid #1e2d4a' }}>
            <div className="h-40 flex items-center justify-center" style={{ backgroundColor: '#0a0e1a' }}>
              <div className="text-center">
                <Car size={40} color="#1e2d4a" />
                <p className="text-xs mt-2" style={{ color: '#2d3f5a' }}>Vehicle Image Feed</p>
                <p className="text-xs" style={{ color: '#1e2d4a', fontFamily: "'JetBrains Mono', monospace" }}>FRAME · {vehicle.currentCamera}</p>
              </div>
            </div>
            {/* Plate crop */}
            <div
              className="mx-4 my-3 px-4 py-2 rounded flex items-center justify-center"
              style={{ backgroundColor: '#0a0e1a', border: '1px solid #253656' }}
            >
              <span
                className="text-xl font-bold tracking-widest"
                style={{ color: '#f0f4ff', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em' }}
              >
                {vehicle.plate}
              </span>
            </div>
          </div>

          {/* Core attributes */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Vehicle Type', value: vehicle.type },
              { label: 'Color', value: vehicle.color },
              { label: 'Current Camera', value: vehicle.currentCamera, mono: true, accent: '#06b6d4' },
              { label: 'Cameras Visited', value: String(vehicle.camerasVisited) },
              { label: 'Status', value: null, node: <StatusBadge status={vehicle.status} /> },
              { label: 'Identity Confidence', value: null, node: <ConfidenceBadge value={vehicle.confidence} /> },
            ].map((attr) => (
              <div key={attr.label} className="p-3 rounded-lg border" style={{ backgroundColor: '#141c30', borderColor: '#1e2d4a' }}>
                <div className="text-xs mb-1" style={{ color: '#4a6080' }}>{attr.label}</div>
                {attr.node ?? (
                  <div
                    className="text-sm font-medium"
                    style={{ color: attr.accent ?? '#f0f4ff', fontFamily: attr.mono ? "'JetBrains Mono', monospace" : undefined }}
                  >
                    {attr.value}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border" style={{ backgroundColor: '#141c30', borderColor: '#1e2d4a' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={11} color="#4a6080" />
                <span className="text-xs" style={{ color: '#4a6080' }}>First Seen</span>
              </div>
              <div className="text-sm font-mono font-semibold" style={{ color: '#22c55e', fontFamily: "'JetBrains Mono', monospace" }}>
                {vehicle.firstSeen}
              </div>
            </div>
            <div className="p-3 rounded-lg border" style={{ backgroundColor: '#141c30', borderColor: '#1e2d4a' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={11} color="#4a6080" />
                <span className="text-xs" style={{ color: '#4a6080' }}>Last Seen</span>
              </div>
              <div className="text-sm font-mono font-semibold" style={{ color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace" }}>
                {vehicle.lastSeen}
              </div>
            </div>
          </div>

          {/* Detection history */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Camera size={13} color="#4a6080" />
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4a6080' }}>Camera History</h3>
            </div>
            <div className="space-y-2">
              {DETECTION_HISTORY.map((d, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border" style={{ backgroundColor: '#141c30', borderColor: '#1e2d4a' }}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: '#2563eb' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-medium" style={{ color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace" }}>{d.camera}</span>
                      <span className="text-xs font-mono" style={{ color: '#4a6080', fontFamily: "'JetBrains Mono', monospace" }}>{d.time}</span>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#8899bb' }}>{d.location}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs" style={{ color: '#4a6080' }}>{d.event}</span>
                      <ConfidenceBadge value={d.confidence} label={false} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Identity evidence */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={13} color="#4a6080" />
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4a6080' }}>Identity Evidence</h3>
            </div>
            <div className="p-4 rounded-lg border space-y-3" style={{ backgroundColor: '#141c30', borderColor: '#1e2d4a' }}>
              <ConfidenceBar label="Plate Match" value={96} color="#22c55e" />
              <ConfidenceBar label="Appearance Similarity" value={88} color="#3b82f6" />
              <ConfidenceBar label="Vehicle Type" value={100} color="#22c55e" />
              <ConfidenceBar label="Color Match" value={94} color="#3b82f6" />
              <ConfidenceBar label="Re-ID Confidence" value={vehicle.confidence} color={vehicle.confidence >= 85 ? '#22c55e' : vehicle.confidence >= 65 ? '#f59e0b' : '#ef4444'} />
              <div
                className="pt-2 mt-2 border-t text-xs"
                style={{ borderColor: '#1e2d4a', color: '#4a6080' }}
              >
                Confidence scores are probabilistic estimates. Identity is not absolute proof.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
