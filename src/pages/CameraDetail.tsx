import { useState, useEffect } from 'react';
import { useCameraFeed } from '../services/websocket';
import { useApp } from '../context/AppContext';
import { getVehicles, getAnprReads } from '../services/api';
import type { Vehicle, AnprRead } from '../services/api';

// ── Event timeline from WebSocket metadata ────────────────────────────────────
interface EventEntry {
  time: string;
  event: string;
  type: 'detection' | 'anpr' | 'alert' | 'warning' | 'exit';
  id: string;
}

// ── Bounding box overlay from WebSocket detections ────────────────────────────
interface BBoxAnnotation {
  x: number; y: number; w: number; h: number;
  id: string; type: string; conf: number; plate?: string;
  color: string; flagged: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  SUV: '#ef4444', Car: '#3b82f6', Bus: '#22c55e', Truck: '#f59e0b',
  Motorcycle: '#a855f7', Auto: '#06b6d4', default: '#3b82f6',
};

function CVBox({ ann }: { ann: BBoxAnnotation }) {
  const shadow = ann.flagged ? '0 0 12px rgba(239,68,68,0.6)' : `0 0 8px ${ann.color}40`;
  return (
    <div
      className="absolute"
      style={{ left: `${ann.x}%`, top: `${ann.y}%`, width: `${ann.w}%`, height: `${ann.h}%`,
        border: `2px solid ${ann.color}`, boxShadow: shadow, background: `${ann.color}08` }}
    >
      {[['top-0 left-0', 'border-l border-t'], ['top-0 right-0', 'border-r border-t'],
        ['bottom-0 left-0', 'border-l border-b'], ['bottom-0 right-0', 'border-r border-b']].map(([pos, bdr], i) => (
        <div key={i} className={`absolute w-3 h-3 ${pos} ${bdr}`} style={{ borderColor: ann.color }} />
      ))}
      <div className="absolute -top-6 left-0 flex items-center gap-1">
        {ann.flagged && <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-[#ef4444] text-white font-bold">⚠ FLAGGED</span>}
        <span className="text-[8px] font-mono px-1 py-0.5 rounded font-bold" style={{ background: ann.color, color: '#000' }}>{ann.id}</span>
        <span className="text-[8px] font-mono text-[#8899b4]">{ann.type}</span>
        <span className="text-[8px] font-mono text-[#4d607a]">{ann.conf}%</span>
      </div>
      {ann.plate && (
        <div className="absolute -bottom-5 left-0 flex items-center gap-1">
          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-[#1a2a40] border text-[#60a5fa]"
            style={{ borderColor: ann.flagged ? '#ef4444' : '#3b82f6' }}>{ann.plate}</span>
        </div>
      )}
    </div>
  );
}

// ── Main CameraDetail ─────────────────────────────────────────────────────────
export default function CameraDetail({ cameraId, onBack }: { cameraId: string; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'anpr' | 'timeline'>('vehicles');
  const [showOverlays, setShowOverlays] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [anprReads, setAnprReads] = useState<AnprRead[]>([]);
  const [timeline, setTimeline] = useState<EventEntry[]>([]);

  const { cameras } = useApp();
  const cam = cameras.find(c => c.id === cameraId) || cameras[0];

  // Map frontend cam id (e.g. CAM-001) to backend WS id
  const wsId = cam?.id || cameraId || 'CAM-001';
  const { frameUrl, metadata, connected, timestamp } = useCameraFeed(wsId, true);

  // Build bbox annotations from WebSocket metadata detections
  const annotations: BBoxAnnotation[] = (metadata?.detections || []).map((d, i) => ({
    x: 8 + (i * 30) % 60, y: 30 + (i * 15) % 30, w: 20 + (i % 3) * 4, h: 18 + (i % 2) * 10,
    id: d.id || `#${100 + i}`,
    type: d.type || 'Car',
    conf: Math.round((d.confidence || 0.85) * 100),
    plate: d.plate,
    color: TYPE_COLORS[d.type || 'Car'] || TYPE_COLORS.default,
    flagged: !!metadata?.alerts?.some(a => a.plate_text === d.plate),
  }));

  // Append WS alerts to local timeline
  useEffect(() => {
    if (!metadata?.alerts?.length) return;
    const newEntries: EventEntry[] = metadata.alerts.map(a => ({
      time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      event: `Alert: ${a.type || 'Watchlist Hit'} — ${a.plate_text || ''}`,
      type: 'alert',
      id: a.plate_text || 'ALT',
    }));
    setTimeline(prev => [...newEntries, ...prev].slice(0, 50));
  }, [metadata?.alerts]);

  // Load historical vehicles + ANPR for this camera
  useEffect(() => {
    getVehicles({ camera: cameraId, limit: 20 }).then(d => setVehicles(d.vehicles)).catch(() => {});
    getAnprReads({ camera: cameraId, limit: 20 }).then(d => setAnprReads(d.reads)).catch(() => {});
  }, [cameraId]);

  const statusDot = !cam ? 'bg-[#4d607a]' :
    cam.status === 'online' ? 'bg-[#22c55e] animate-pulse' :
    cam.status === 'warning' ? 'bg-[#f59e0b] animate-pulse' : 'bg-[#ef4444]';
  const statusText = !cam ? 'text-[#4d607a]' :
    cam.status === 'online' ? 'text-[#4ade80]' :
    cam.status === 'warning' ? 'text-[#fbbf24]' : 'text-[#f87171]';
  const trafficColor = !cam ? 'text-[#4d607a]' :
    cam.traffic === 'high' ? 'text-[#f87171]' :
    cam.traffic === 'moderate' ? 'text-[#fbbf24]' : 'text-[#4ade80]';

  const eventColors: Record<string, string> = {
    detection: '#3b82f6', anpr: '#a855f7', alert: '#ef4444', warning: '#f59e0b', exit: '#4d607a',
  };

  const hasFlaggedAlert = metadata?.alerts && metadata.alerts.length > 0;

  return (
    <div className="flex-1 overflow-y-auto bg-[#080d18]">
      <div className="p-5">
        {/* Back breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-[10px] text-[#4d607a] hover:text-[#8899b4] transition-colors">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Live Cameras
          </button>
          <span className="text-[#1a2a40]">/</span>
          <span className="text-[10px] text-[#8899b4] font-mono">{cam?.id || cameraId}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Video + tables */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video area */}
            <div className="bg-[#0c1220] border border-[#1a2a40] rounded-lg overflow-hidden">
              {/* Video header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1a2a40]">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${statusDot}`} />
                  <span className="text-[11px] font-mono font-semibold text-[#e2eaf3]">{cam?.id || cameraId}</span>
                  <span className="text-[10px] text-[#4d607a]">•</span>
                  <span className="text-[10px] text-[#4d607a]">{cam?.name || 'Camera'}</span>
                  {wsId && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${connected ? 'text-[#4ade80] bg-[#0a1a0e]' : 'text-[#f87171] bg-[#1a0808]'}`}>
                      {connected ? 'WS CONNECTED' : 'RECONNECTING...'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowOverlays(v => !v)}
                    className={`text-[9px] px-2 py-0.5 border rounded transition-colors ${showOverlays ? 'border-[#3b82f6] text-[#60a5fa]' : 'border-[#1a2a40] text-[#4d607a]'}`}
                  >
                    Overlays {showOverlays ? 'ON' : 'OFF'}
                  </button>
                  <button className="text-[#4d607a] hover:text-[#8899b4] p-1 transition-colors">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293-2.293a1 1 0 11-1.414 1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Video feed */}
              <div className="camera-feed relative" style={{ aspectRatio: '16/9' }}>
                {/* Scanline */}
                <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-15">
                  <div style={{ width: '100%', height: '2px', background: 'rgba(59,130,246,0.5)',
                    animation: 'scan-line 5s linear infinite', position: 'absolute', top: 0 }} />
                </div>

                {/* Live frame from WebSocket or static SVG placeholder */}
                {frameUrl && wsId ? (
                  <img src={frameUrl} alt="Live camera feed" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  /* Road SVG placeholder when backend is offline / no WS feed */
                  <svg viewBox="0 0 100 60" className="absolute inset-0 w-full h-full opacity-25" preserveAspectRatio="none">
                    <rect width="100" height="60" fill="#080d18" />
                    <line x1="0" y1="60" x2="30" y2="28" stroke="#1e3050" strokeWidth="0.4" />
                    <line x1="100" y1="60" x2="70" y2="28" stroke="#1e3050" strokeWidth="0.4" />
                    <line x1="0" y1="60" x2="50" y2="32" stroke="#1e3050" strokeWidth="0.3" />
                    <line x1="100" y1="60" x2="50" y2="32" stroke="#1e3050" strokeWidth="0.3" />
                    {[38, 44, 50, 56].map(y => (
                      <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#0f1a2e" strokeWidth="0.2" />
                    ))}
                    <rect x="47" y="38" width="6" height="1.5" fill="#0f1a2e" />
                    <rect x="47" y="44" width="6" height="1.5" fill="#0f1a2e" />
                    <rect x="47" y="50" width="6" height="1.5" fill="#0f1a2e" />
                    <text x="50" y="20" textAnchor="middle" fill="#2a3a50" fontSize="4" fontFamily="monospace">
                      {wsId ? 'CONNECTING...' : 'PREVIEW FEED — BACKEND OFFLINE'}
                    </text>
                  </svg>
                )}

                {/* CV Overlays */}
                {showOverlays && annotations.map((ann, i) => <CVBox key={i} ann={ann} />)}

                {/* HUD corners */}
                <div className="absolute top-2 left-2 w-5 h-5 border-l-2 border-t-2 border-[#3b82f6] border-opacity-60 pointer-events-none" />
                <div className="absolute top-2 right-2 w-5 h-5 border-r-2 border-t-2 border-[#3b82f6] border-opacity-60 pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-5 h-5 border-l-2 border-b-2 border-[#3b82f6] border-opacity-60 pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-5 h-5 border-r-2 border-b-2 border-[#3b82f6] border-opacity-60 pointer-events-none" />

                {/* LIVE badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1 badge-live px-2 py-0.5 rounded text-[9px] font-bold font-mono z-20">
                  <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[#ef4444] animate-pulse' : 'bg-[#4d607a]'}`} />
                  {connected ? 'LIVE' : 'OFFLINE'}
                </div>

                {/* Stats overlay */}
                <div className="absolute top-3 right-3 bg-[#070c17] bg-opacity-80 border border-[#1a2a40] rounded px-2 py-1.5 text-[9px] font-mono z-20">
                  <div className="text-[#4d607a]">VEHICLES</div>
                  <div className="text-[#60a5fa] font-bold text-sm">{cam?.vehicles ?? 0}</div>
                </div>

                {/* Timestamp bottom */}
                <div className="absolute bottom-3 left-3 text-[9px] font-mono text-[#4d607a] bg-[#070c17] bg-opacity-80 px-1.5 py-0.5 rounded z-20">
                  {timestamp || new Date().toLocaleTimeString('en-IN', { hour12: false })} IST • {cam?.fps ?? 0} FPS
                </div>

                {/* Alert indicator */}
                {hasFlaggedAlert && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[#1a0a0a] border border-[#ef4444] border-opacity-50 rounded px-2 py-1 z-20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" />
                    <span className="text-[9px] font-mono text-[#f87171]">
                      {metadata?.alerts?.[0]?.plate_text ? `BLACKLISTED: ${metadata.alerts[0].plate_text}` : 'WATCHLIST HIT'}
                    </span>
                  </div>
                )}

                {/* Backend offline notice for non-WS cameras */}
                {!wsId && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="bg-[#0c1220] border border-[#1a2a40] rounded-lg px-4 py-3 text-center">
                      <div className="text-[10px] text-[#4d607a] font-mono mb-1">PREVIEW MODE</div>
                      <div className="text-[11px] text-[#8899b4]">Live WebSocket feed available for</div>
                      <div className="text-[10px] text-[#60a5fa] font-mono">CAM-001 and CAM-002</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs: Vehicles / ANPR / Timeline */}
            <div className="bg-[#0c1220] border border-[#1a2a40] rounded-lg overflow-hidden">
              <div className="flex items-center border-b border-[#1a2a40]">
                {[
                  { id: 'vehicles', label: 'Detected Vehicles', count: vehicles.length },
                  { id: 'anpr', label: 'Recent ANPR Reads', count: anprReads.length },
                  { id: 'timeline', label: 'Event Timeline', count: timeline.length },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-[10px] font-medium transition-colors border-b-2 -mb-px
                      ${activeTab === tab.id
                        ? 'border-[#3b82f6] text-[#60a5fa]'
                        : 'border-transparent text-[#4d607a] hover:text-[#8899b4]'}`}
                  >
                    {tab.label}
                    <span className="text-[8px] bg-[#1a2a40] text-[#4d607a] rounded-full px-1.5 py-0.5 font-mono">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Detected Vehicles table */}
              {activeTab === 'vehicles' && (
                <div className="overflow-x-auto">
                  {vehicles.length === 0 ? (
                    <div className="p-6 text-center text-[10px] text-[#4d607a]">No vehicles detected for this camera yet.</div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#0f1a2e]">
                          {['Vehicle ID', 'Type', 'Plate', 'Confidence', 'Track', 'Timestamp'].map(h => (
                            <th key={h} className="px-4 py-2 text-left text-[9px] text-[#4d607a] uppercase tracking-wider font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {vehicles.map((v, i) => (
                          <tr key={i} className={`border-b border-[#0f1a2e] ${v.flagged ? 'bg-[#1a0808]' : ''}`}>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1.5">
                                {!!v.flagged && <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" />}
                                <span className="text-[10px] font-mono text-[#e2eaf3]">{v.vehicle_id}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-[10px] text-[#8899b4]">{v.type}</td>
                            <td className="px-4 py-2.5">
                              <span className={`text-[10px] font-mono ${v.plate === '—' ? 'text-[#4d607a]' : v.flagged ? 'text-[#f87171]' : 'text-[#60a5fa]'}`}>{v.plate}</span>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono text-[#8899b4]">{Math.round(v.confidence)}%</span>
                                <div className="progress-bar w-12">
                                  <div className="progress-bar-fill bg-[#3b82f6]" style={{ width: `${v.confidence}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded
                                ${v.track_status === 'Tracked' ? 'text-[#4ade80] bg-[#0a1a0e]' :
                                  v.track_status === 'Lost' ? 'text-[#f87171] bg-[#1a0808]' :
                                  'text-[#4d607a] bg-[#0c1220]'}`}>
                                {v.track_status}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-[10px] font-mono text-[#4d607a]">{v.timestamp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* ANPR Reads */}
              {activeTab === 'anpr' && (
                <div className="overflow-x-auto">
                  {anprReads.length === 0 ? (
                    <div className="p-6 text-center text-[10px] text-[#4d607a]">No ANPR reads for this camera yet.</div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#0f1a2e]">
                          {['Plate Number', 'Time', 'Confidence', 'Status'].map(h => (
                            <th key={h} className="px-4 py-2 text-left text-[9px] text-[#4d607a] uppercase tracking-wider font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {anprReads.map((r, i) => (
                          <tr key={i} className={`border-b border-[#0f1a2e] ${r.flagged ? 'bg-[#1a0808]' : ''}`}>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                {!!r.flagged && <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-[#ef4444] text-white font-bold">⚠</span>}
                                <span className={`text-[11px] font-mono font-semibold ${r.flagged ? 'text-[#f87171]' : 'text-[#60a5fa]'}`}>{r.plate}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-[10px] font-mono text-[#4d607a]">{r.timestamp}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono text-[#8899b4]">{Math.round(r.confidence)}%</span>
                                <div className="progress-bar w-16">
                                  <div className="progress-bar-fill" style={{ width: `${r.confidence}%`, background: r.confidence > 90 ? '#22c55e' : '#f59e0b' }} />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={`text-[9px] font-mono ${r.flagged ? 'text-[#f87171]' : 'text-[#4ade80]'}`}>
                                {r.flagged ? 'BLACKLISTED' : 'Clear'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Event Timeline (from WebSocket metadata) */}
              {activeTab === 'timeline' && (
                <div className="p-4 space-y-2 max-h-64 overflow-y-auto scrollbar-hidden">
                  {timeline.length === 0 ? (
                    <div className="text-center text-[10px] text-[#4d607a] py-4">
                      {connected ? 'Waiting for events...' : 'Connect camera feed to see live events.'}
                    </div>
                  ) : (
                    timeline.map((ev, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5" style={{ background: eventColors[ev.type] }} />
                          {i < timeline.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: '#1a2a40', minHeight: 16 }} />}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-[#4d607a]">{ev.time}</span>
                            <span className="text-[9px] font-mono px-1 py-0.5 rounded"
                              style={{ background: `${eventColors[ev.type]}18`, color: eventColors[ev.type] }}>
                              {ev.type.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#8899b4] mt-0.5">{ev.event}</div>
                          <div className="text-[9px] font-mono text-[#2a3a50] mt-0.5">{ev.id}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Camera info panel */}
          <div className="space-y-4">
            {/* Camera Details */}
            <div className="bg-[#0c1220] border border-[#1a2a40] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1a2a40]">
                <div className="text-sm font-semibold text-[#e2eaf3]" style={{ fontFamily: 'Outfit, sans-serif' }}>Camera Details</div>
              </div>
              <div className="p-4 space-y-3">
                {cam ? (
                  <>
                    {[
                      { label: 'Camera ID', value: cam.id, mono: true },
                      { label: 'Location', value: cam.name },
                      { label: 'Zone', value: cam.location },
                    ].map(row => (
                      <div key={row.label}>
                        <div className="text-[9px] text-[#4d607a] uppercase tracking-wider mb-0.5">{row.label}</div>
                        <div className={`text-[11px] text-[#e2eaf3] ${row.mono ? 'font-mono font-semibold' : ''}`}>{row.value}</div>
                      </div>
                    ))}
                    <div>
                      <div className="text-[9px] text-[#4d607a] uppercase tracking-wider mb-0.5">Status</div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                        <span className={`text-[11px] font-mono font-semibold uppercase ${statusText}`}>{cam.status}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-[10px] text-[#4d607a]">Loading camera info...</div>
                )}
              </div>
            </div>

            {/* Live Stats */}
            <div className="bg-[#0c1220] border border-[#1a2a40] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1a2a40]">
                <div className="text-sm font-semibold text-[#e2eaf3]" style={{ fontFamily: 'Outfit, sans-serif' }}>Live Statistics</div>
              </div>
              <div className="grid grid-cols-2 gap-px bg-[#0f1a2e]">
                {[
                  { label: 'FPS', value: cam?.fps ? cam.fps.toString() : '—', color: '#60a5fa' },
                  { label: 'Vehicles', value: cam?.vehicles?.toString() ?? '0', color: '#e2eaf3' },
                  { label: 'ANPR Reads', value: anprReads.length.toString(), color: '#60a5fa' },
                  { label: 'Traffic', value: cam?.traffic ?? '—', color: cam?.traffic === 'high' ? '#f87171' : cam?.traffic === 'moderate' ? '#fbbf24' : '#4ade80' },
                ].map(stat => (
                  <div key={stat.label} className="bg-[#0c1220] px-4 py-3">
                    <div className="text-[9px] text-[#4d607a] uppercase tracking-wider mb-1">{stat.label}</div>
                    <div className="text-sm font-bold font-mono capitalize" style={{ color: stat.color, fontFamily: 'Outfit, sans-serif' }}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connection */}
            <div className="bg-[#0c1220] border border-[#1a2a40] rounded-lg p-4">
              <div className="text-[10px] font-semibold text-[#4d607a] uppercase tracking-wider mb-3">Connection</div>
              <div className="space-y-2 text-[10px] font-mono">
                {[
                  { label: 'Stream', value: wsId ? (connected ? 'WS/JPEG Live' : 'ReconnectingΓÇª') : 'Preview', color: wsId && connected ? '#4ade80' : '#f87171' },
                  { label: 'WS Channel', value: wsId || 'N/A', color: '#8899b4' },
                  { label: 'Latency', value: connected ? '~40ms' : '—', color: '#8899b4' },
                  { label: 'AI Model', value: cam?.ai_model || 'YOLOv8m', color: '#a78bfa' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-[#4d607a]">{row.label}</span>
                    <span style={{ color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#0c1220] border border-[#1a2a40] rounded-lg p-4">
              <div className="text-[10px] font-semibold text-[#4d607a] uppercase tracking-wider mb-3">Actions</div>
              <div className="space-y-2">
                {[
                  { label: 'View Fullscreen', icon: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4' },
                  { label: 'Download Snapshot', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' },
                  { label: 'Report Issue', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
                ].map(action => (
                  <button key={action.label} className="w-full flex items-center gap-2 px-3 py-2 text-[10px] text-[#8899b4] border border-[#1a2a40] rounded hover:border-[#3b82f6] hover:text-[#60a5fa] transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-3.5 h-3.5 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                    </svg>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
