import { useState } from 'react'
import { Search, MapPin, Clock, Route, Gauge, Shield, ChevronDown } from 'lucide-react'

const TRAJECTORY_EVENTS = [
  { time: '10:21:14', camera: 'CAM-001', location: 'MG Road Junction', event: 'Vehicle Detected', confidence: 91.2, lat: 12.9716, lng: 77.5946 },
  { time: '10:35:08', camera: 'CAM-003', location: 'Brigade Rd Crossing', event: 'Vehicle Re-identified', confidence: 93.4, lat: 12.9719, lng: 77.6064 },
  { time: '10:43:52', camera: 'CAM-007', location: 'Residency Rd', event: 'Vehicle Detected', confidence: 94.6, lat: 12.9731, lng: 77.6145 },
  { time: '10:47:22', camera: 'CAM-004', location: 'Richmond Rd', event: 'Currently Tracking', confidence: 94.6, lat: 12.9722, lng: 77.6091 },
]

const JOURNEY = { totalTime: '22m 38s', cameras: 3, distance: '7.2 km', avgSpeed: '31 km/h', reidConf: 91.4 }

const EVIDENCE = [
  { label: 'Plate Match', value: 'Strong', percent: 96, color: '#22c55e' },
  { label: 'Appearance Similarity', value: '88%', percent: 88, color: '#3b82f6' },
  { label: 'Vehicle Type', value: 'Match', percent: 100, color: '#22c55e' },
  { label: 'Color', value: 'Match', percent: 94, color: '#22c55e' },
  { label: 'Time/Route Consistency', value: 'High', percent: 92, color: '#3b82f6' },
  { label: 'Overall Match Confidence', value: '91.4%', percent: 91.4, color: '#06b6d4' },
]

const VEHICLES = [
  { id: 'UTX-VH-00124', plate: 'KA01AB1234' },
  { id: 'UTX-VH-00127', plate: 'TN09EF3456' },
  { id: 'UTX-VH-00130', plate: 'GJ05KL3344' },
]

// Simplified SVG map with camera nodes
function TrajectoryMap({ activeEvent }: { activeEvent: number }) {
  // Normalized positions for the 4 cameras in SVG space
  const nodes = [
    { id: 'CAM-001', x: 80, y: 200, time: '10:21:14', label: 'MG Road Jn.' },
    { id: 'CAM-003', x: 220, y: 140, time: '10:35:08', label: 'Brigade Rd' },
    { id: 'CAM-007', x: 360, y: 100, time: '10:43:52', label: 'Residency Rd' },
    { id: 'CAM-004', x: 280, y: 220, time: '10:47:22', label: 'Richmond Rd' },
  ]

  const routes = [
    [nodes[0], nodes[1]],
    [nodes[1], nodes[2]],
    [nodes[2], nodes[3]],
  ]

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
          BENGALURU · LIVE TRAJECTORY
        </div>
      </div>

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 480 340" preserveAspectRatio="xMidYMid meet">
        {/* Route lines */}
        {routes.map(([a, b], i) => {
          const isActive = i < activeEvent
          return (
            <g key={i}>
              <line
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={isActive ? '#2563eb' : '#1e2d4a'}
                strokeWidth={isActive ? 2 : 1}
                strokeDasharray={isActive ? '0' : '4,4'}
              />
              {isActive && (
                <>
                  {/* Arrow at midpoint */}
                  <circle
                    cx={(a.x + b.x) / 2}
                    cy={(a.y + b.y) / 2}
                    r="3"
                    fill="#2563eb"
                    opacity="0.8"
                  />
                </>
              )}
            </g>
          )
        })}

        {/* Camera nodes */}
        {nodes.map((node, i) => {
          const isCurrent = i === 3
          const isVisited = i < activeEvent
          const isActive = i === activeEvent - 1

          const ringColor = isCurrent ? '#06b6d4' : isActive ? '#22c55e' : isVisited ? '#2563eb' : '#253656'
          const fillColor = isCurrent ? '#06b6d420' : isActive ? '#22c55e20' : isVisited ? '#2563eb20' : '#1e2d4a'

          return (
            <g key={node.id}>
              {/* Outer ring */}
              <circle cx={node.x} cy={node.y} r="18" fill={fillColor} stroke={ringColor} strokeWidth="1.5" />
              {/* Inner dot */}
              <circle cx={node.x} cy={node.y} r="5" fill={ringColor} />

              {/* Camera label */}
              <text x={node.x} y={node.y - 24} textAnchor="middle" fontSize="9" fill={ringColor} fontFamily="JetBrains Mono, monospace" fontWeight="600">
                {node.id}
              </text>
              <text x={node.x} y={node.y - 14} textAnchor="middle" fontSize="8" fill="#4a6080" fontFamily="JetBrains Mono, monospace">
                {node.time}
              </text>
              <text x={node.x} y={node.y + 32} textAnchor="middle" fontSize="8" fill="#4a6080">
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 space-y-1">
        {[
          { color: '#22c55e', label: 'Detected' },
          { color: '#06b6d4', label: 'Current' },
          { color: '#2563eb', label: 'Route' },
          { color: '#253656', label: 'Pending' },
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
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLES[0])
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeEvent, setActiveEvent] = useState(TRAJECTORY_EVENTS.length)

  return (
    <div className="space-y-4">
      {/* Deep ReID Engine Status Banner */}
      <div className="p-3.5 rounded-lg border flex items-center justify-between flex-wrap gap-3" style={{ backgroundColor: '#0f1629', borderColor: '#1e2d4a' }}>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Deep Vehicle Re-ID Engine (ResNet-50 512-D)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ONNX RUNTIME ACTIVE
              </span>
            </div>
            <div className="text-[11px] text-[#4a6080]">
              Trained on 15,485 crops across 417 identities · Hard Triplet & CE loss · 512-D L2 Embeddings
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <span className="text-[#4a6080] block text-[10px]">INFERENCE LATENCY</span>
            <span className="font-mono font-bold text-cyan-400">14.2 ms</span>
          </div>
          <div className="text-right">
            <span className="text-[#4a6080] block text-[10px]">MATCH ACCURACY</span>
            <span className="font-mono font-bold text-emerald-400">96.8%</span>
          </div>
        </div>
      </div>

      {/* Vehicle Selector */}
      <div className="p-4 rounded-lg border" style={{ backgroundColor: '#0f1629', borderColor: '#1e2d4a' }}>
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-xs">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: '#4a6080' }}>Vehicle Search</label>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-between w-full px-3 py-2 rounded border text-xs"
                style={{ backgroundColor: '#141c30', borderColor: '#253656', color: '#f0f4ff' }}
              >
                <div className="flex items-center gap-2">
                  <Search size={12} color="#4a6080" />
                  <span className="font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{selectedVehicle.plate}</span>
                </div>
                <ChevronDown size={12} color="#4a6080" />
              </button>
              {showDropdown && (
                <div
                  className="absolute left-0 right-0 top-full mt-1 rounded-lg border z-20 overflow-hidden"
                  style={{ backgroundColor: '#141c30', borderColor: '#253656' }}
                >
                  {VEHICLES.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => { setSelectedVehicle(v); setShowDropdown(false) }}
                      className="flex flex-col w-full text-left px-3 py-2 text-xs transition-colors"
                      style={{ borderBottom: '1px solid #1e2d4a', color: '#f0f4ff' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a2440')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <span className="font-mono font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{v.plate}</span>
                      <span style={{ color: '#4a6080' }}>{v.id}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs mb-0.5" style={{ color: '#4a6080' }}>Vehicle</div>
              <div className="text-sm font-mono font-semibold" style={{ color: '#3b82f6', fontFamily: "'JetBrains Mono', monospace" }}>{selectedVehicle.id}</div>
            </div>
            <div>
              <div className="text-xs mb-0.5" style={{ color: '#4a6080' }}>Plate</div>
              <div className="text-sm font-mono font-semibold tracking-widest" style={{ color: '#f0f4ff', fontFamily: "'JetBrains Mono', monospace" }}>{selectedVehicle.plate}</div>
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
              <TrajectoryMap activeEvent={activeEvent} />
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
                  {TRAJECTORY_EVENTS.map((ev, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveEvent(i + 1)}
                      className="flex items-start gap-4 w-full text-left relative"
                    >
                      {/* Node dot */}
                      <div
                        className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-colors"
                        style={{
                          backgroundColor: i < activeEvent ? '#2563eb20' : '#141c30',
                          borderColor: i < activeEvent ? '#2563eb' : '#253656',
                        }}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: i < activeEvent ? '#3b82f6' : '#253656' }} />
                      </div>
                      {/* Content */}
                      <div className="flex-1 pb-3">
                        <div className="flex items-center justify-between">
                          <span
                            className="text-xs font-mono font-semibold"
                            style={{ color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {ev.camera}
                          </span>
                          <span
                            className="text-xs font-mono"
                            style={{ color: '#4a6080', fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {ev.time}
                          </span>
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: '#8899bb' }}>{ev.location}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs" style={{ color: '#4a6080' }}>{ev.event}</span>
                          <span
                            className="text-xs font-mono"
                            style={{ color: ev.confidence >= 85 ? '#22c55e' : '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {ev.confidence}%
                          </span>
                        </div>
                      </div>
                    </button>
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
                { label: 'Total Journey Time', value: JOURNEY.totalTime, color: '#f0f4ff', icon: <Clock size={14} color="#3b82f6" /> },
                { label: 'Cameras Visited', value: String(JOURNEY.cameras), color: '#06b6d4', icon: <MapPin size={14} color="#06b6d4" /> },
                { label: 'Est. Distance', value: JOURNEY.distance, color: '#f0f4ff', icon: <Route size={14} color="#22c55e" /> },
                { label: 'Average Speed', value: JOURNEY.avgSpeed, color: '#f59e0b', icon: <Gauge size={14} color="#f59e0b" /> },
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
            <div className="px-4 pb-4">
              <div className="p-3 rounded-lg border" style={{ backgroundColor: '#141c30', borderColor: '#1e2d4a' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: '#4a6080' }}>Re-ID Confidence</span>
                  <span className="text-sm font-bold font-mono" style={{ color: '#22c55e', fontFamily: "'JetBrains Mono', monospace" }}>
                    {JOURNEY.reidConf}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: '#1e2d4a' }}>
                  <div className="h-full rounded-full" style={{ width: `${JOURNEY.reidConf}%`, backgroundColor: '#22c55e' }} />
                </div>
              </div>
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
