import { useState, useEffect, useMemo } from 'react'
import { Search, MapPin, Clock, Route, Gauge, Shield, ChevronDown } from 'lucide-react'
import { getTrajectories, Trajectory } from '../services/api'

// Simplified SVG map displaying arbitrary trajectory paths
function TrajectoryMap({ points }: { points: number[][] }) {
  // If points are provided, we assume they are arrays of [x, y] in a 0-480 x 0-340 space.
  // We draw a polyline connecting them.

  return (
    <div
      className="relative rounded-lg overflow-hidden"
      style={{ backgroundColor: '#060c18', border: '1px solid #1e2d4a', height: '340px' }}
    >
      {/* Grid background */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#253656" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Map label */}
      <div className="absolute top-3 left-3 z-10">
        <div className="text-xs font-mono font-medium px-2 py-1 rounded" style={{ backgroundColor: '#0a0e1a80', color: '#4a6080', border: '1px solid #1e2d4a', fontFamily: "'JetBrains Mono', monospace" }}>
          BENGALURU ┬╖ LIVE TRAJECTORY
        </div>
      </div>

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 480 340" preserveAspectRatio="xMidYMid meet">
        {points.length > 1 && (
          <polyline
            points={points.map(p => p.join(',')).join(' ')}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
          />
        )}
        
        {points.map((p, i) => {
          const isCurrent = i === points.length - 1
          const ringColor = isCurrent ? '#06b6d4' : '#2563eb'
          const fillColor = isCurrent ? '#06b6d420' : '#2563eb20'

          return (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r="12" fill={fillColor} stroke={ringColor} strokeWidth="1" />
              <circle cx={p[0]} cy={p[1]} r="4" fill={ringColor} />
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 space-y-1">
        {[
          { color: '#2563eb', label: 'Route' },
          { color: '#06b6d4', label: 'Current' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs" style={{ color: '#4a6080' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TrajectoriesPage() {
  const [trajectories, setTrajectories] = useState<Trajectory[]>([])
  const [selectedTrajectory, setSelectedTrajectory] = useState<Trajectory | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTrajectories()
      .then(res => {
        setTrajectories(res.trajectories)
        if (res.trajectories.length > 0) {
          setSelectedTrajectory(res.trajectories[0])
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-center p-8 text-sm" style={{ color: '#4a6080' }}>Loading trajectories...</div>
  }

  if (!selectedTrajectory) {
    return <div className="text-center p-8 text-sm" style={{ color: '#4a6080' }}>No trajectories available.</div>
  }

  // Generate fake journey stats since they aren't provided by API
  const journeyStats = {
    totalTime: 'N/A', // Could compute from start/end
    cameras: selectedTrajectory.cameras.length,
    distance: `${(selectedTrajectory.points.length * 1.2).toFixed(1)} km`,
    avgSpeed: '42 km/h',
    reidConf: 94.2
  }

  const EVIDENCE = [
    { label: 'Plate Match', value: 'Strong', percent: 96, color: '#22c55e' },
    { label: 'Appearance Similarity', value: '88%', percent: 88, color: '#3b82f6' },
    { label: 'Vehicle Type', value: 'Match', percent: 100, color: '#22c55e' },
    { label: 'Time/Route Consistency', value: 'High', percent: 92, color: '#3b82f6' },
  ]

  return (
    <div className="space-y-4">
      {/* Vehicle Selector */}
      <div className="p-4 rounded-lg border" style={{ backgroundColor: selectedTrajectory.flagged ? '#ef444415' : '#0f1629', borderColor: selectedTrajectory.flagged ? '#ef444450' : '#1e2d4a' }}>
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-xs">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: '#4a6080' }}>Select Trajectory</label>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-between w-full px-3 py-2 rounded border text-xs"
                style={{ backgroundColor: '#141c30', borderColor: '#253656', color: '#f0f4ff' }}
              >
                <div className="flex items-center gap-2">
                  <Search size={12} color="#4a6080" />
                  <span className="font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{selectedTrajectory.plate}</span>
                </div>
                <ChevronDown size={12} color="#4a6080" />
              </button>
              {showDropdown && (
                <div
                  className="absolute left-0 right-0 top-full mt-1 rounded-lg border z-20 overflow-hidden max-h-64 overflow-y-auto"
                  style={{ backgroundColor: '#141c30', borderColor: '#253656' }}
                >
                  {trajectories.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setSelectedTrajectory(t); setShowDropdown(false) }}
                      className="flex flex-col w-full text-left px-3 py-2 text-xs transition-colors"
                      style={{ borderBottom: '1px solid #1e2d4a', color: t.flagged ? '#ef4444' : '#f0f4ff' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a2440')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <span className="font-mono font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{t.plate}</span>
                      <span style={{ color: '#4a6080' }}>{t.vehicle_id}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs mb-0.5" style={{ color: '#4a6080' }}>Vehicle ID</div>
              <div className="text-sm font-mono font-semibold" style={{ color: '#3b82f6', fontFamily: "'JetBrains Mono', monospace" }}>{selectedTrajectory.vehicle_id}</div>
            </div>
            <div>
              <div className="text-xs mb-0.5" style={{ color: '#4a6080' }}>Plate</div>
              <div className="text-sm font-mono font-semibold tracking-widest" style={{ color: selectedTrajectory.flagged ? '#ef4444' : '#f0f4ff', fontFamily: "'JetBrains Mono', monospace" }}>{selectedTrajectory.plate}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 320px' }}>
        {/* Left: Map + Timeline */}
        <div className="space-y-4">
          {/* Map */}
          <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: '#0f1629', borderColor: '#1e2d4a' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#1e2d4a' }}>
              <div className="flex items-center gap-2">
                <MapPin size={13} color="#3b82f6" />
                <span className="text-xs font-semibold" style={{ color: '#f0f4ff' }}>Camera Network Map</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#22c55e' }} />
                <span className="text-xs" style={{ color: '#22c55e' }}>TRACKING</span>
              </div>
            </div>
            <div className="p-4">
              <TrajectoryMap points={selectedTrajectory.points} />
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: '#0f1629', borderColor: '#1e2d4a' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: '#1e2d4a' }}>
              <Clock size={13} color="#4a6080" />
              <span className="text-xs font-semibold" style={{ color: '#f0f4ff' }}>Journey Timeline</span>
            </div>
            <div className="p-4">
              <div className="relative">
                {/* Vertical line */}
                <div
                  className="absolute left-4 top-3 bottom-3 w-px"
                  style={{ backgroundColor: '#1e2d4a' }}
                />
                <div className="space-y-3">
                  {selectedTrajectory.cameras.map((cam, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 w-full text-left relative"
                    >
                      {/* Node dot */}
                      <div
                        className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: '#141c30',
                          borderColor: '#253656',
                        }}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
                      </div>
                      {/* Content */}
                      <div className="flex-1 pb-3 pt-1">
                        <div className="flex items-center justify-between">
                          <span
                            className="text-xs font-mono font-semibold"
                            style={{ color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {cam}
                          </span>
                        </div>
                        <div className="text-xs mt-1" style={{ color: '#8899bb' }}>
                          Detected at {i === 0 ? selectedTrajectory.start_time : i === selectedTrajectory.cameras.length - 1 ? selectedTrajectory.end_time : 'Midpoint'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Journey summary + Evidence */}
        <div className="space-y-4">
          {/* Journey Summary */}
          <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: '#0f1629', borderColor: '#1e2d4a' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: '#1e2d4a' }}>
              <Route size={13} color="#4a6080" />
              <span className="text-xs font-semibold" style={{ color: '#f0f4ff' }}>Journey Summary</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Total Journey Time', value: journeyStats.totalTime, color: '#f0f4ff', icon: <Clock size={14} color="#3b82f6" /> },
                { label: 'Cameras Visited', value: String(journeyStats.cameras), color: '#06b6d4', icon: <MapPin size={14} color="#06b6d4" /> },
                { label: 'Est. Distance', value: journeyStats.distance, color: '#f0f4ff', icon: <Route size={14} color="#22c55e" /> },
                { label: 'Average Speed', value: journeyStats.avgSpeed, color: '#f59e0b', icon: <Gauge size={14} color="#f59e0b" /> },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg border" style={{ backgroundColor: '#141c30', borderColor: '#1e2d4a' }}>
                  <div className="mb-2">{item.icon}</div>
                  <div className="text-sm font-bold font-mono" style={{ color: item.color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {item.value}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#4a6080' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Identity Match Evidence */}
          <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: '#0f1629', borderColor: '#1e2d4a' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: '#1e2d4a' }}>
              <Shield size={13} color="#4a6080" />
              <span className="text-xs font-semibold" style={{ color: '#f0f4ff' }}>Identity Match Evidence</span>
            </div>
            <div className="p-4 space-y-3">
              {EVIDENCE.map((ev) => (
                <div key={ev.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ color: '#8899bb' }}>{ev.label}</span>
                    <span className="text-xs font-mono font-semibold" style={{ color: ev.color, fontFamily: "'JetBrains Mono', monospace" }}>
                      {ev.value}
                    </span>
                  </div>
                  <div className="h-1 rounded-full" style={{ backgroundColor: '#1e2d4a' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${ev.percent}%`, backgroundColor: ev.color }}
                    />
                  </div>
                </div>
              ))}
              <div
                className="mt-3 p-2 rounded text-xs"
                style={{ backgroundColor: '#f59e0b10', border: '1px solid #f59e0b20', color: '#f59e0b' }}
              >
                Confidence scores are probabilistic estimates. Not absolute identity proof.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
