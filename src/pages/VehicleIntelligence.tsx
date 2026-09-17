import { useState, useMemo, useEffect } from 'react'
import { Search, Filter, ChevronLeft, ChevronRight, X, Eye } from 'lucide-react'
import ConfidenceBadge from '../components/ConfidenceBadge'
import StatusBadge from '../components/StatusBadge'
import { getVehicles, Vehicle } from '../services/api'
import VehicleDrawer from '../components/VehicleDrawer'

const VEHICLE_TYPES = ['Car', 'Motorcycle', 'Bus', 'Truck', 'Auto', 'Other']
const STATUSES = ['Tracked', 'Lost', 'Exited']
const CONFIDENCE_TIERS = ['High', 'Medium', 'Low']

const PAGE_SIZE = 8

// Note: Using a simplified Vehicle interface for the drawer if needed,
// but relying on the API Vehicle type.
export default function VehicleIntelligence() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [confFilter, setConfFilter] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Vehicle | null>(null)

  useEffect(() => {
    getVehicles({ limit: 100 })
      .then(res => setVehicles(res.vehicles))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const q = search.toLowerCase()
      if (q && !v.id.toLowerCase().includes(q) && !v.plate.toLowerCase().includes(q) && !v.camera.toLowerCase().includes(q)) return false
      if (typeFilter.length && !typeFilter.includes(v.type)) return false
      if (statusFilter.length && !statusFilter.includes(v.track_status)) return false
      if (confFilter.length) {
        const tier = v.confidence >= 85 ? 'High' : v.confidence >= 65 ? 'Medium' : 'Low'
        if (!confFilter.includes(tier)) return false
      }
      return true
    })
  }, [vehicles, search, typeFilter, statusFilter, confFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function toggleFilter(arr: string[], setArr: (a: string[]) => void, val: string) {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val])
    setPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div
        className="rounded-lg p-4 border"
        style={{ backgroundColor: '#0f1629', borderColor: '#1e2d4a' }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded border flex-1 min-w-48"
            style={{ backgroundColor: '#141c30', borderColor: '#1e2d4a' }}
          >
            <Search size={13} color="#4a6080" />
            <input
              className="bg-transparent text-xs outline-none w-full"
              style={{ color: '#f0f4ff' }}
              placeholder="Search plate, vehicle ID, camera..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X size={12} color="#4a6080" />
              </button>
            )}
          </div>

          {/* Filter groups */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <Filter size={12} color="#4a6080" />
              <span className="text-xs" style={{ color: '#4a6080' }}>Type:</span>
              {VEHICLE_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleFilter(typeFilter, setTypeFilter, t)}
                  className="px-2 py-0.5 rounded text-xs border transition-colors"
                  style={{
                    backgroundColor: typeFilter.includes(t) ? '#2563eb20' : '#141c30',
                    color: typeFilter.includes(t) ? '#3b82f6' : '#4a6080',
                    borderColor: typeFilter.includes(t) ? '#2563eb50' : '#1e2d4a',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: '#4a6080' }}>Status:</span>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleFilter(statusFilter, setStatusFilter, s)}
                  className="px-2 py-0.5 rounded text-xs border transition-colors"
                  style={{
                    backgroundColor: statusFilter.includes(s) ? '#2563eb20' : '#141c30',
                    color: statusFilter.includes(s) ? '#3b82f6' : '#4a6080',
                    borderColor: statusFilter.includes(s) ? '#2563eb50' : '#1e2d4a',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: '#4a6080' }}>Confidence:</span>
              {CONFIDENCE_TIERS.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleFilter(confFilter, setConfFilter, c)}
                  className="px-2 py-0.5 rounded text-xs border transition-colors"
                  style={{
                    backgroundColor: confFilter.includes(c) ? '#2563eb20' : '#141c30',
                    color: confFilter.includes(c) ? '#3b82f6' : '#4a6080',
                    borderColor: confFilter.includes(c) ? '#2563eb50' : '#1e2d4a',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{ backgroundColor: '#0f1629', borderColor: '#1e2d4a' }}
      >
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: '#4a6080' }}>Loading vehicles...</div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: '#141c30', borderBottom: '1px solid #1e2d4a' }}>
                {['Vehicle ID', 'License Plate', 'Type', 'Camera', 'Confidence', 'Status', 'Timestamp', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-left font-medium tracking-wide uppercase"
                    style={{ color: '#4a6080', fontSize: '10px', letterSpacing: '0.08em' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((v, i) => (
                <tr
                  key={v.id}
                  className="transition-colors cursor-pointer"
                  style={{ 
                    borderBottom: i < paged.length - 1 ? '1px solid #1e2d4a' : 'none',
                    backgroundColor: v.flagged ? '#ef444420' : 'transparent'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = v.flagged ? '#ef444430' : '#141c30')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = v.flagged ? '#ef444420' : 'transparent')}
                  onClick={() => setSelected(v)}
                >
                  <td className="px-3 py-2.5 font-mono font-medium" style={{ color: '#3b82f6', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>
                    {v.vehicle_id}
                  </td>
                  <td className="px-3 py-2.5 font-mono font-semibold" style={{ color: v.flagged ? '#ef4444' : '#f0f4ff', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>
                    {v.plate}
                  </td>
                  <td className="px-3 py-2.5" style={{ color: '#8899bb' }}>{v.type}</td>
                  <td className="px-3 py-2.5">
                    <span className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: '#06b6d415', color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace" }}>
                      {v.camera}
                    </span>
                  </td>
                  <td className="px-3 py-2.5"><ConfidenceBadge value={v.confidence} label={false} /></td>
                  <td className="px-3 py-2.5"><StatusBadge status={v.track_status as any} /></td>
                  <td className="px-3 py-2.5 font-mono" style={{ color: '#8899bb', fontFamily: "'JetBrains Mono', monospace" }}>{v.timestamp}</td>
                  <td className="px-3 py-2.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelected(v) }}
                      className="flex items-center gap-1 px-2 py-1 rounded border text-xs transition-colors"
                      style={{ backgroundColor: '#141c30', borderColor: '#253656', color: '#8899bb' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.borderColor = '#2563eb50' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#8899bb'; e.currentTarget.style.borderColor = '#253656' }}
                    >
                      <Eye size={11} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div
          className="flex items-center justify-between px-4 py-3 border-t"
          style={{ borderColor: '#1e2d4a' }}
        >
          <span className="text-xs" style={{ color: '#4a6080' }}>
            {filtered.length} vehicles • Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded border transition-colors"
              style={{ backgroundColor: '#141c30', borderColor: '#1e2d4a', color: page === 1 ? '#2d3f5a' : '#8899bb' }}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className="w-6 h-6 rounded border text-xs transition-colors"
                style={{
                  backgroundColor: n === page ? '#2563eb' : '#141c30',
                  borderColor: n === page ? '#2563eb' : '#1e2d4a',
                  color: n === page ? 'white' : '#8899bb',
                }}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-1 rounded border transition-colors"
              style={{ backgroundColor: '#141c30', borderColor: '#1e2d4a', color: page === totalPages ? '#2d3f5a' : '#8899bb' }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Drawer (assuming it handles the Api Vehicle type or can degrade gracefully) */}
      {selected && <VehicleDrawer vehicle={selected as any} onClose={() => setSelected(null)} />}
    </div>
  )
}
