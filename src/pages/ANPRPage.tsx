import { useState } from 'react'
import { ScanLine, CheckCircle, AlertTriangle, XCircle, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react'
import ConfidenceBadge from '../components/ConfidenceBadge'
import StatusBadge from '../components/StatusBadge'

interface ANPRRecord {
  id: string
  timestamp: string
  plate: string
  camera: string
  location: string
  vehicleType: string
  ocrConfidence: number
  vehicleId: string
  status: 'Verified' | 'Low Confidence' | 'Unreadable' | 'Manual Review'
}

const ANPR_DATA: ANPRRecord[] = [
  { id: 'ANPR-8821', timestamp: '10:59:43', plate: 'KA01AB1234', camera: 'CAM-004', location: 'MG Road Junction', vehicleType: 'SUV', ocrConfidence: 97.3, vehicleId: 'UTX-VH-00124', status: 'Verified' },
  { id: 'ANPR-8820', timestamp: '10:58:11', plate: 'MH12CD5678', camera: 'CAM-007', location: 'Residency Rd', vehicleType: 'Sedan', ocrConfidence: 89.1, vehicleId: 'UTX-VH-00125', status: 'Verified' },
  { id: 'ANPR-8819', timestamp: '10:57:04', plate: '??01??1234', camera: 'CAM-002', location: 'Brigade Rd', vehicleType: 'Motorcycle', ocrConfidence: 38.2, vehicleId: '—', status: 'Unreadable' },
  { id: 'ANPR-8818', timestamp: '10:55:30', plate: 'AP39IJ1122', camera: 'CAM-006', location: 'Hosur Rd', vehicleType: 'Auto', ocrConfidence: 73.9, vehicleId: 'UTX-VH-00129', status: 'Low Confidence' },
  { id: 'ANPR-8817', timestamp: '10:54:18', plate: 'TN09EF3456', camera: 'CAM-009', location: 'Outer Ring Rd', vehicleType: 'Bus', ocrConfidence: 98.6, vehicleId: 'UTX-VH-00127', status: 'Verified' },
  { id: 'ANPR-8816', timestamp: '10:52:44', plate: 'TS07RS990?', camera: 'CAM-002', location: 'Domlur Flyover', vehicleType: 'Motorcycle', ocrConfidence: 61.4, vehicleId: '—', status: 'Manual Review' },
  { id: 'ANPR-8815', timestamp: '10:51:09', plate: 'GJ05KL3344', camera: 'CAM-003', location: 'Ulsoor Rd', vehicleType: 'Car', ocrConfidence: 93.7, vehicleId: 'UTX-VH-00130', status: 'Verified' },
  { id: 'ANPR-8814', timestamp: '10:49:55', plate: 'KL08TU1234', camera: 'CAM-007', location: 'Koramangala', vehicleType: 'Car', ocrConfidence: 95.2, vehicleId: 'UTX-VH-00134', status: 'Verified' },
  { id: 'ANPR-8813', timestamp: '10:47:22', plate: 'KA01AB1234', camera: 'CAM-004', location: 'Richmond Rd', vehicleType: 'SUV', ocrConfidence: 96.1, vehicleId: 'UTX-VH-00124', status: 'Verified' },
  { id: 'ANPR-8812', timestamp: '10:44:19', plate: 'RJ14MN5566', camera: 'CAM-008', location: 'Jayanagar 4th Block', vehicleType: 'SUV', ocrConfidence: 80.3, vehicleId: 'UTX-VH-00131', status: 'Low Confidence' },
]

const PAGE_SIZE = 8

const KPI = [
  { label: 'Plates Detected', value: '1,842', icon: <ScanLine size={18} />, color: '#3b82f6', sub: 'Last hour' },
  { label: 'Successful OCR', value: '1,729', icon: <CheckCircle size={18} />, color: '#22c55e', sub: '93.9% of detections' },
  { label: 'OCR Accuracy', value: '93.9%', icon: <CheckCircle size={18} />, color: '#06b6d4', sub: '+1.2% vs yesterday' },
  { label: 'Unknown / Unreadable', value: '113', icon: <XCircle size={18} />, color: '#ef4444', sub: '6.1% failure rate' },
]

interface ModalProps {
  record: ANPRRecord
  onClose: () => void
}

function ANPRModal({ record, onClose }: ModalProps) {
  const rawOCR = record.plate.replace(/([A-Z]{2})(\d{2})([A-Z]{2})(\d{4})/, '$1 $2 $3 $4')
  const normalized = record.plate.replace(/[^A-Z0-9?]/g, '')

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
                <div className="text-xs" style={{ color: '#2d3f5a' }}>VEHICLE IMAGE · {record.camera}</div>
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
                style={{ color: record.ocrConfidence > 60 ? '#f0f4ff' : '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}
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
                { label: 'OCR Confidence', node: <ConfidenceBadge value={record.ocrConfidence} /> },
                { label: 'Status', node: <StatusBadge status={record.status} /> },
                { label: 'Camera', value: record.camera, mono: true, accent: '#06b6d4' },
                { label: 'Location', value: record.location },
                { label: 'Timestamp', value: record.timestamp, mono: true },
                { label: 'Vehicle ID', value: record.vehicleId, mono: true, accent: '#3b82f6' },
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
  const [page, setPage] = useState(1)
  const [modalRecord, setModalRecord] = useState<ANPRRecord | null>(null)

  const totalPages = Math.ceil(ANPR_DATA.length / PAGE_SIZE)
  const paged = ANPR_DATA.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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

      {/* ANPR Table */}
      <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: '#0f1629', borderColor: '#1e2d4a' }}>
        <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: '#1e2d4a' }}>
          <ScanLine size={14} color="#3b82f6" />
          <span className="text-xs font-semibold" style={{ color: '#f0f4ff' }}>Live ANPR Feed</span>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse ml-1" style={{ backgroundColor: '#22c55e' }} />
          <span className="text-xs" style={{ color: '#22c55e' }}>LIVE</span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ backgroundColor: '#141c30', borderBottom: '1px solid #1e2d4a' }}>
              {['Timestamp', 'Plate', 'Camera', 'Location', 'Type', 'OCR Confidence', 'Vehicle ID', 'Status', 'Evidence'].map((h) => (
                <th key={h} className="px-3 py-3 text-left font-medium uppercase" style={{ color: '#4a6080', fontSize: '10px', letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((r, i) => (
              <tr
                key={r.id}
                className="cursor-pointer transition-colors"
                style={{ borderBottom: i < paged.length - 1 ? '1px solid #1e2d4a' : 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#141c30')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                onClick={() => setModalRecord(r)}
              >
                <td className="px-3 py-2.5 font-mono" style={{ color: '#8899bb', fontFamily: "'JetBrains Mono', monospace" }}>{r.timestamp}</td>
                <td className="px-3 py-2.5 font-mono font-semibold" style={{ color: '#f0f4ff', fontFamily: "'JetBrains Mono', monospace" }}>{r.plate}</td>
                <td className="px-3 py-2.5">
                  <span className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: '#06b6d415', color: '#06b6d4', fontFamily: "'JetBrains Mono', monospace" }}>{r.camera}</span>
                </td>
                <td className="px-3 py-2.5" style={{ color: '#8899bb' }}>{r.location}</td>
                <td className="px-3 py-2.5" style={{ color: '#8899bb' }}>{r.vehicleType}</td>
                <td className="px-3 py-2.5"><ConfidenceBadge value={r.ocrConfidence} label={false} /></td>
                <td className="px-3 py-2.5 font-mono text-xs" style={{ color: r.vehicleId === '—' ? '#2d3f5a' : '#3b82f6', fontFamily: "'JetBrains Mono', monospace" }}>{r.vehicleId}</td>
                <td className="px-3 py-2.5"><StatusBadge status={r.status} /></td>
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
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: '#1e2d4a' }}>
          <span className="text-xs" style={{ color: '#4a6080' }}>{ANPR_DATA.length} records · Page {page} of {totalPages}</span>
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
