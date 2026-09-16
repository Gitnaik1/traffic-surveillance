import { useState, useEffect } from 'react'
import { ScanLine, CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react'
import ConfidenceBadge from '../components/ConfidenceBadge'
import StatusBadge from '../components/StatusBadge'
import { getAnprReads, AnprRead } from '../services/api'
import { useApp } from '../context/AppContext'

const PAGE_SIZE = 8

interface ModalProps {
  record: AnprRead
  onClose: () => void
}

function ANPRModal({ record, onClose }: ModalProps) {
  const rawOCR = record.plate.replace(/([A-Z]{2})(\d{2})([A-Z]{2})(\d{4})/, '$1 $2 $3 $4')
  const normalized = record.plate.replace(/[^A-Z0-9?]/g, '')
  const status = record.confidence > 85 ? 'Verified' : record.confidence > 60 ? 'Low Confidence' : 'Unreadable'

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ backgroundColor: '#00000080' }} onClick={onClose}>
        <div
          className="relative rounded-xl border overflow-hidden w-full max-w-lg mx-4"
          style={{ backgroundColor: '#0f1629', borderColor: '#1e2d4a' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#1e2d4a' }}>
            <div>
              <div className="text-xs font-mono" style={{ color: '#4a6080', fontFamily: "'JetBrains Mono', monospace" }}>{record.id}</div>
              <div className="text-sm font-semibold mt-0.5" style={{ color: '#f0f4ff' }}>ANPR Detail</div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded border" style={{ backgroundColor: '#141c30', borderColor: '#253656', color: '#8899bb' }}>
              <X size={15} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Vehicle image area */}
            <div className="h-36 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0a0e1a', border: '1px solid #1e2d4a' }}>
              <div className="text-center">
                <div className="text-xs" style={{ color: '#2d3f5a' }}>VEHICLE IMAGE ┬╖ {record.camera}</div>
                <div className="text-xs mt-1" style={{ color: '#1e2d4a' }}>{record.timestamp}</div>
              </div>
            </div>

            {/* Plate crop */}
            <div
              className="px-6 py-3 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#0a0e1a', border: '2px solid #253656' }}
            >
              <span
                className="text-2xl font-bold tracking-widest"
                style={{ color: record.confidence > 60 ? '#f0f4ff' : '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}
              >
                {record.plate}
              </span>
            </div>

            {/* OCR results */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border" style={{ backgroundColor: '#141c30', borderColor: '#1e2d4a' }}>
                <div className="text-xs mb-1" style={{ color: '#4a6080' }}>Raw OCR Result</div>
                <div className="font-mono text-sm font-medium" style={{ color: '#8899bb', fontFamily: "'JetBrains Mono', monospace" }}>
                  {rawOCR}
                </div>
              </div>
              <div className="p-3 rounded-lg border" style={{ backgroundColor: '#141c30', borderColor: '#1e2d4a' }}>
                <div className="text-xs mb-1" style={{ color: '#4a6080' }}>Normalized Plate</div>
                <div className="font-mono text-sm font-semibold" style={{ color: '#f0f4ff', fontFamily: "'JetBrains Mono', monospace" }}>
                  {normalized}
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'OCR Confidence', node: <ConfidenceBadge value={record.confidence} /> },
                { label: 'Status', node: <StatusBadge status={status as any} /> },
                { label: 'Camera', value: record.camera, mono: true, accent: '#06b6d4' },
                { label: 'Timestamp', value: record.timestamp, mono: true },
                { label: 'Vehicle ID', value: record.vehicle_id || 'ΓÇö', mono: true, accent: '#3b82f6' },
                { label: 'Flagged', value: record.flagged ? 'Yes' : 'No', accent: record.flagged ? '#ef4444' : '#8899bb' },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg border" style={{ backgroundColor: '#141c30', borderColor: '#1e2d4a' }}>
                  <div className="text-xs mb-1" style={{ color: '#4a6080' }}>{item.label}</div>
                  {item.node ?? (
                    <div className="text-xs font-medium" style={{ color: item.accent ?? '#8899bb', fontFamily: item.mono ? "'JetBrains Mono', monospace" : undefined }}>
                      {item.value}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-xs p-2 rounded" style={{ backgroundColor: '#f59e0b10', border: '1px solid #f59e0b20', color: '#f59e0b' }}>
              OCR results are probabilistic estimates and may not be accurate for all plate conditions.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function ANPRPage() {
  const { cameras } = useApp()
  const [page, setPage] = useState(1)
  const [modalRecord, setModalRecord] = useState<AnprRead | null>(null)
  
  const [reads, setReads] = useState<AnprRead[]>([])
  const [loading, setLoading] = useState(true)
  const [cameraFilter, setCameraFilter] = useState<string>('All')

  const fetchReads = async () => {
    try {
      const res = await getAnprReads({ limit: 100 })
      setReads(res.reads)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReads()
    const int = setInterval(fetchReads, 5000)
    return () => clearInterval(int)
  }, [])

  const filteredReads = reads.filter(r => cameraFilter === 'All' || r.camera === cameraFilter)
  const totalPages = Math.max(1, Math.ceil(filteredReads.length / PAGE_SIZE))
  const paged = filteredReads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const successfulCount = reads.filter(r => r.confidence > 60).length
  const failureCount = reads.length - successfulCount
  const accRate = reads.length ? ((successfulCount / reads.length) * 100).toFixed(1) : '0.0'

  const KPI = [
    { label: 'Plates Detected', value: reads.length.toString(), icon: <ScanLine size={18} />, color: '#3b82f6', sub: 'Total in cache' },
    { label: 'Successful OCR', value: successfulCount.toString(), icon: <CheckCircle size={18} />, color: '#22c55e', sub: `${accRate}% of detections` },
    { label: 'OCR Accuracy', value: `${accRate}%`, icon: <CheckCircle size={18} />, color: '#06b6d4', sub: 'Current window' },
    { label: 'Unknown / Unreadable', value: failureCount.toString(), icon: <XCircle size={18} />, color: '#ef4444', sub: 'Below threshold' },
  ]

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {KPI.map((kpi) => (
          <div key={kpi.label} className="p-4 rounded-lg border" style={{ backgroundColor: '#0f1629', borderColor: '#1e2d4a' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: '#4a6080' }}>{kpi.label}</span>
              <span style={{ color: kpi.color }}>{kpi.icon}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: kpi.color, fontFamily: "'JetBrains Mono', monospace" }}>
              {kpi.value}
            </div>
            <div className="text-xs mt-1" style={{ color: '#4a6080' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Camera Filter & ANPR Table */}
      <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: '#0f1629', borderColor: '#1e2d4a' }}>
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#1e2d4a' }}>
          <div className="flex items-center gap-2">
            <ScanLine size={14} color="#3b82f6" />
            <span className="text-xs font-semibold" style={{ color: '#f0f4ff' }}>Live ANPR Feed</span>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse ml-1" style={{ backgroundColor: '#22c55e' }} />
            <span className="text-xs" style={{ color: '#22c55e' }}>LIVE</span>
          </div>
          <div>
            <select
              value={cameraFilter}
              onChange={(e) => { setCameraFilter(e.target.value); setPage(1) }}
              className="bg-transparent border text-xs rounded px-2 py-1 outline-none"
              style={{ borderColor: '#1e2d4a', color: '#f0f4ff', backgroundColor: '#141c30' }}
            >
              <option value="All">All Cameras</option>
              {cameras.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {loading && !reads.length ? (
          <div className="p-8 text-center text-sm" style={{ color: '#4a6080' }}>Loading ANPR data...</div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: '#141c30', borderBottom: '1px solid #1e2d4a' }}>
                {['Timestamp', 'Plate', 'Camera', 'Type', 'OCR Confidence', 'Vehicle ID', 'Status', 'Evidence'].map((h) => (
                  <th key={h} className="px-3 py-3 text-left font-medium uppercase" style={{ color: '#4a6080', fontSize: '10px', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((r, i) => {
                const status = r.confidence > 85 ? 'Verified' : r.confidence > 60 ? 'Low Confidence' : 'Unreadable'
                return (
                  <tr
                    key={r.id}
                    className="cursor-pointer transition-colors"
                    style={{ 
                      borderBottom: i < paged.length - 1 ? '1px solid #1e2d4a' : 'none',
                      backgroundColor: r.flagged ? '#ef444420' : 'transparent'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = r.flagged ? '#ef444430' : '#141c30')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = r.flagged ? '#ef444420' : 'transparent')}
                    onClick={() => setModalRecord(r)}
                  >
                    <td className="px-3 py-2.5 font-mono" style={{ color: '#8899bb', fontFamily: "'JetBrains Mono', monospace" }}>{r.timestamp}</td>
                    <td className="px-3 py-2.5 font-mono font-semibold" style={{ color: r.flagged ? '#ef4444' : '#f0f4ff', fontFamily: "'JetBrains Mono', monospace" }}>{r.plate}</td>
                    <td className="px-3 py-2.5">
                      <span className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: '#06b6d415', color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace" }}>{r.camera}</span>
                    </td>
                    <td className="px-3 py-2.5" style={{ color: '#8899bb' }}>{r.vehicle_type || 'Unknown'}</td>
                    <td className="px-3 py-2.5"><ConfidenceBadge value={r.confidence} label={false} /></td>
                    <td className="px-3 py-2.5 font-mono text-xs" style={{ color: !r.vehicle_id ? '#2d3f5a' : '#3b82f6', fontFamily: "'JetBrains Mono', monospace" }}>{r.vehicle_id || 'ΓÇö'}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={status as any} /></td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); setModalRecord(r) }}
                        className="flex items-center gap-1 px-2 py-1 rounded border text-xs"
                        style={{ backgroundColor: '#141c30', borderColor: '#253656', color: '#8899bb' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.borderColor = '#2563eb50' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#8899bb'; e.currentTarget.style.borderColor = '#253656' }}
                      >
                        <Eye size={11} />
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: '#1e2d4a' }}>
          <span className="text-xs" style={{ color: '#4a6080' }}>{filteredReads.length} records ┬╖ Page {page} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded border" style={{ backgroundColor: '#141c30', borderColor: '#1e2d4a', color: page === 1 ? '#2d3f5a' : '#8899bb' }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)} className="w-6 h-6 rounded border text-xs" style={{ backgroundColor: n === page ? '#2563eb' : '#141c30', borderColor: n === page ? '#2563eb' : '#1e2d4a', color: n === page ? 'white' : '#8899bb' }}>{n}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 rounded border" style={{ backgroundColor: '#141c30', borderColor: '#1e2d4a', color: page === totalPages ? '#2d3f5a' : '#8899bb' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {modalRecord && <ANPRModal record={modalRecord} onClose={() => setModalRecord(null)} />}
    </div>
  )
}
