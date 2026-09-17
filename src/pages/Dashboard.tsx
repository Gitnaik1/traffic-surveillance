import { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  kpiData as initialKpiData, alerts as initialAlerts, trafficVolumeData, vehicleDistribution,
  cameraTrafficData, cameras, systemStatus
} from '../data/mockData';
import { api } from '../services/api';

type ChartFilter = '15m' | '1h' | 'today' | 'custom';

// ── KPI Card ────────────────────────────────────────────────────────────────
function KPICard({ accent, icon, title, primary, sub, trend, badge }: {
  accent: string; icon: React.ReactNode; title: string;
  primary: string; sub: string; trend?: number; badge?: { label: string; color: string };
}) {
  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;
  return (
    <div className={`bg-[#0c1220] border border-[#1a2a40] rounded-lg p-4 flex flex-col gap-3 card-accent-${accent} hover:border-[#243348] transition-colors`}>
      <div className="flex items-start justify-between">
        <div className={`w-8 h-8 rounded-md flex items-center justify-center`}
          style={{ background: `rgba(${accentRgb(accent)}, 0.12)` }}>
          <div style={{ color: accentHex(accent) }}>{icon}</div>
        </div>
        {badge && (
          <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider"
            style={{ background: `rgba(${accentRgb(badge.color)}, 0.15)`, color: accentHex(badge.color) }}>
            {badge.label}
          </span>
        )}
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-[10px] font-mono
            ${trendPositive ? 'text-[#4ade80]' : trendNegative ? 'text-[#f87171]' : 'text-[#8899b4]'}`}>
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
              {trendPositive
                ? <path d="M8 4l4 4H4z" />
                : <path d="M8 12l4-4H4z" />}
            </svg>
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <div className="text-[10px] text-[#4d607a] uppercase tracking-wider mb-1">{title}</div>
        <div className="text-xl font-bold text-[#e2eaf3] leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>{primary}</div>
        <div className="text-[10px] text-[#4d607a] mt-1.5">{sub}</div>
      </div>
    </div>
  );
}

function accentHex(name: string) {
  const map: Record<string, string> = {
    blue: '#3b82f6', cyan: '#06b6d4', green: '#22c55e',
    amber: '#f59e0b', red: '#ef4444', purple: '#a855f7',
  };
  return map[name] || '#3b82f6';
}
function accentRgb(name: string) {
  const map: Record<string, string> = {
    blue: '59,130,246', cyan: '6,182,212', green: '34,197,94',
    amber: '245,158,11', red: '239,68,68', purple: '168,85,247',
  };
  return map[name] || '59,130,246';
}

// ── Create camera marker icons ──────────────────────────────────────────
function createCameraIcon(status: string, isSelected: boolean) {
  const color = isSelected ? '#3b82f6' :
    status === 'online' ? '#22c55e' :
    status === 'warning' ? '#f59e0b' : '#ef4444';
  const size = isSelected ? 28 : 20;
  const pulseRing = isSelected
    ? `<circle cx="14" cy="14" r="13" fill="none" stroke="${color}" stroke-width="1" opacity="0.4"><animate attributeName="r" from="10" to="16" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite"/></circle>`
    : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 28 28">
    ${pulseRing}
    <circle cx="14" cy="14" r="8" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="1.5"/>
    <circle cx="14" cy="14" r="4" fill="${color}"/>
    <path d="M10 12.5l-3-1.5v6l3-1.5M10 12v4a1 1 0 001 1h4a1 1 0 001-1v-4a1 1 0 00-1-1h-4a1 1 0 00-1 1z" fill="none" stroke="white" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
  </svg>`;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// ── Map fly-to helper ───────────────────────────────────────────────────
function FlyToCamera({ cam }: { cam: typeof cameras[number] | undefined }) {
  const map = useMap();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!cam) return;
    // Skip flying on first render — map is already centered
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      map.flyTo([cam.lat, cam.lng], 14, { duration: 0.8 });
    } catch {
      // Map not ready yet, silently ignore
    }
  }, [cam, map]);
  return null;
}

// ── City Map (Leaflet) ──────────────────────────────────────────────────
function CityMap({ onSelectCamera, selectedCam }: { onSelectCamera: (id: string) => void; selectedCam: string | null }) {
  const selectedCamera = cameras.find(c => c.id === selectedCam);

  return (
    <div className="bg-[#0c1220] border border-[#1a2a40] rounded-lg flex flex-col overflow-hidden" style={{ height: 440 }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2a40]">
        <div>
          <div className="text-sm font-semibold text-[#e2eaf3]" style={{ fontFamily: 'Outfit, sans-serif' }}>Bangalore Traffic Network</div>
          <div className="text-[10px] text-[#4d607a] mt-0.5">Live camera placements at traffic signals</div>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-[#4d607a]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#22c55e]" />Online</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b]" />Warning</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444]" />Offline</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#3b82f6]" />Selected</span>
        </div>
      </div>
      <div className="relative flex-1" style={{ height: '100%' }}>
        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={12}
          scrollWheelZoom={true}
          zoomControl={false}
          attributionControl={false}
          style={{ height: '100%', width: '100%', background: '#070c17' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <FlyToCamera cam={selectedCamera} />
          {cameras.map(cam => (
            <Marker
              key={cam.id}
              position={[cam.lat, cam.lng]}
              icon={createCameraIcon(cam.status, selectedCam === cam.id)}
              eventHandlers={{
                click: () => onSelectCamera(cam.id),
              }}
            >
              <Popup>
                <div style={{
                  background: '#111827',
                  border: '1px solid #243348',
                  borderRadius: '8px',
                  padding: '12px',
                  minWidth: '180px',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#e2eaf3',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: cam.status === 'online' ? '#22c55e' : cam.status === 'warning' ? '#f59e0b' : '#ef4444',
                    }} />
                    <span style={{ fontWeight: 700, fontSize: '13px' }}>{cam.id}</span>
                  </div>
                  <div style={{ color: '#8899b4', fontSize: '11px', marginBottom: '8px' }}>{cam.name}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '10px' }}>
                    <span style={{ color: '#4d607a' }}>FPS</span>
                    <span style={{ color: '#e2eaf3', fontWeight: 600 }}>{cam.fps}</span>
                    <span style={{ color: '#4d607a' }}>Vehicles</span>
                    <span style={{ color: '#e2eaf3', fontWeight: 600 }}>{cam.vehicles}</span>
                    <span style={{ color: '#4d607a' }}>Traffic</span>
                    <span style={{
                      fontWeight: 600, textTransform: 'capitalize',
                      color: cam.traffic === 'high' ? '#f87171' : cam.traffic === 'moderate' ? '#fbbf24' : '#4ade80',
                    }}>{cam.traffic}</span>
                    <span style={{ color: '#4d607a' }}>Location</span>
                    <span style={{ color: '#e2eaf3', fontWeight: 600, fontSize: '9px' }}>{cam.location}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Selected camera info card overlay */}
        {selectedCam && (() => {
          const cam = cameras.find(c => c.id === selectedCam);
          if (!cam) return null;
          return (
            <div className="absolute top-3 right-3 z-[1000] bg-[#111827]/95 backdrop-blur-sm border border-[#243348] rounded-md p-3 text-[11px] min-w-[170px]">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cam.status === 'online' ? 'bg-[#22c55e]' : cam.status === 'warning' ? 'bg-[#f59e0b]' : 'bg-[#ef4444]'}`} />
                <span className="font-semibold text-[#e2eaf3]">{cam.id}</span>
              </div>
              <div className="text-[#4d607a] text-[10px]">{cam.name}</div>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                <span className="text-[#4d607a]">FPS</span><span className="text-[#8899b4] font-mono">{cam.fps}</span>
                <span className="text-[#4d607a]">Vehicles</span><span className="text-[#8899b4] font-mono">{cam.vehicles}</span>
                <span className="text-[#4d607a]">Traffic</span>
                <span className={`capitalize font-mono text-[10px] ${cam.traffic === 'high' ? 'text-[#f87171]' : cam.traffic === 'moderate' ? 'text-[#fbbf24]' : 'text-[#4ade80]'}`}>
                  {cam.traffic}
                </span>
                <span className="text-[#4d607a]">Coords</span>
                <span className="text-[#8899b4] font-mono text-[9px]">{cam.lat.toFixed(3)}, {cam.lng.toFixed(3)}</span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ── Alerts Panel ─────────────────────────────────────────────────────────
function AlertsPanel({ alerts }: { alerts: any[] }) {
  const sevClass = (s: string) =>
    s === 'critical' ? 'severity-critical' :
    s === 'warning' ? 'severity-warning' :
    s === 'high' ? 'severity-warning' : 'severity-info';
  const sevColor = (s: string) =>
    s === 'critical' ? '#f87171' : (s === 'warning' || s === 'high') ? '#fbbf24' : '#60a5fa';

  return (
    <div className="bg-[#0c1220] border border-[#1a2a40] rounded-lg flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2a40]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#e2eaf3]" style={{ fontFamily: 'Outfit, sans-serif' }}>Live Alerts</span>
          <span className="text-[9px] bg-[#ef4444] text-white rounded-full px-1.5 py-0.5 font-bold">{alerts.length}</span>
        </div>
        <button className="text-[10px] text-[#3b82f6] hover:text-[#60a5fa]">View All →</button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hidden divide-y divide-[#0f1a2e]">
        {alerts.length === 0 && (
          <div className="p-4 text-center text-[10px] text-[#4d607a]">No recent alerts</div>
        )}
        {alerts.map(alert => (
          <div key={alert.id} className={`p-3 ${sevClass(alert.severity)} transition-colors hover:opacity-90`}>
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: sevColor(alert.severity) }}>
                {alert.type}
              </span>
              <span className="text-[9px] text-[#4d607a] font-mono whitespace-nowrap">
                {alert.timestamp ? (typeof alert.timestamp === 'number' ? new Date(alert.timestamp * 1000).toLocaleTimeString() : alert.timestamp) : alert.time}
              </span>
            </div>
            <div className="text-[11px] text-[#c8d6e8] font-semibold font-mono">{alert.plate_text || alert.subject}</div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[9px] text-[#4d607a]">{alert.camera_id || alert.camera}</span>
              <button className="text-[9px] px-2 py-0.5 border border-[#243348] rounded text-[#8899b4] hover:border-[#3b82f6] hover:text-[#60a5fa] transition-colors">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Charts ────────────────────────────────────────────────────────────────
function ChartFilterBar({ active, onChange }: { active: ChartFilter; onChange: (f: ChartFilter) => void }) {
  const opts: { label: string; value: ChartFilter }[] = [
    { label: '15m', value: '15m' }, { label: '1h', value: '1h' },
    { label: 'Today', value: 'today' }, { label: 'Custom', value: 'custom' },
  ];
  return (
    <div className="flex items-center gap-1">
      {opts.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={`text-[10px] px-2 py-0.5 rounded transition-colors
            ${active === o.value
              ? 'bg-[#1d3a6e] text-[#60a5fa] border border-[#3b82f6]'
              : 'text-[#4d607a] hover:text-[#8899b4] border border-transparent'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

const CustomTooltipDark = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111827] border border-[#1a2a40] rounded px-3 py-2 text-[11px]">
      <div className="text-[#4d607a] mb-1 font-mono">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[#8899b4]">{p.name}:</span>
          <span className="text-[#e2eaf3] font-mono font-medium">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// ── System Status ──────────────────────────────────────────────────────────
function SystemStatus() {
  const statusDot = (s: string) =>
    s === 'healthy' || s === 'connected' ? 'bg-[#22c55e] animate-pulse-green' : 'bg-[#f59e0b] animate-pulse-amber';
  const statusText = (s: string) =>
    s === 'healthy' ? 'Healthy' : s === 'connected' ? 'Connected' : 'Degraded';
  const statusColor = (s: string) =>
    s === 'healthy' || s === 'connected' ? 'text-[#4ade80]' : 'text-[#fbbf24]';

  return (
    <div className="bg-[#0c1220] border border-[#1a2a40] rounded-lg px-4 py-3">
      <div className="text-[11px] font-semibold text-[#8899b4] mb-3 uppercase tracking-wider">Live System Status</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {systemStatus.map(s => (
          <div key={s.name} className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot(s.status)}`} />
            <div>
              <div className="text-[10px] text-[#4d607a]">{s.name}</div>
              <div className={`text-[10px] font-semibold font-mono ${statusColor(s.status)}`}>
                {statusText(s.status)} <span className="text-[#2a3a50]">· {s.latency}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────
export default function Dashboard({ onCameraSelect }: { onCameraSelect: (id: string) => void }) {
  const [chartFilter, setChartFilter] = useState<ChartFilter>('15m');
  const [selectedCam, setSelectedCam] = useState<string | null>('CAM-001');
  const [kpiData, setKpiData] = useState<any>(initialKpiData);
  const [liveAlerts, setLiveAlerts] = useState<any[]>(initialAlerts);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const overview = await api.getOverview();
        setKpiData((prev: any) => ({ ...prev, ...overview }));
        const alertsData = await api.getAlerts();
        setLiveAlerts(alertsData.alerts || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCamSelect = (id: string) => {
    setSelectedCam(id);
  };

  const kpis = [
    {
      accent: 'green', title: 'Active Cameras',
      primary: `${kpiData.activeCameras.online} / ${kpiData.activeCameras.total}`,
      sub: `${kpiData.activeCameras.total - kpiData.activeCameras.online} offline`,
      badge: { label: 'Online', color: 'green' },
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
        </svg>
      ),
    },
    {
      accent: 'blue', title: 'Vehicles Detected',
      primary: kpiData.vehiclesDetected.value.toLocaleString(),
      sub: 'Total detections today', trend: kpiData.vehiclesDetected.trend,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      accent: 'cyan', title: 'Currently Tracked',
      primary: kpiData.vehiclesTracked.value.toString(),
      sub: 'Active trajectories', trend: kpiData.vehiclesTracked.trend,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    {
      accent: 'purple', title: 'ANPR Reads',
      primary: kpiData.anprReads.value.toLocaleString(),
      sub: 'Plates read today', trend: kpiData.anprReads.trend,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 4V2a1 1 0 00-1-1H4a1 1 0 00-1 1v2M7 4H5M7 4h2m8-2v2m0-2a1 1 0 011-1h2a1 1 0 011 1v2m0 0h-2m0 0h-2M3 10h18M3 6h18M3 14h18M3 18h18" />
        </svg>
      ),
    },
    {
      accent: 'red', title: 'Active Alerts',
      primary: kpiData.activeAlerts.value.toString(),
      sub: `${kpiData.activeAlerts.critical} critical · ${kpiData.activeAlerts.warning} warning`,
      badge: { label: 'Live', color: 'red' },
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      accent: 'amber', title: 'Current Congestion',
      primary: kpiData.congestion.level,
      sub: `Congestion index: ${kpiData.congestion.score}/100`, trend: kpiData.congestion.trend,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden bg-[#080d18]">
      <div className="p-5 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {kpis.map(k => <KPICard key={k.title} {...k} />)}
        </div>

        {/* Map + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: 340 }}>
          <div className="lg:col-span-2">
            <CityMap onSelectCamera={handleCamSelect} selectedCam={selectedCam} />
          </div>
          <AlertsPanel alerts={liveAlerts} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Traffic Volume */}
          <div className="lg:col-span-2 bg-[#0c1220] border border-[#1a2a40] rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-[#e2eaf3]" style={{ fontFamily: 'Outfit, sans-serif' }}>Traffic Volume Over Time</div>
                <div className="text-[10px] text-[#4d607a] mt-0.5">Vehicles detected vs ANPR reads</div>
              </div>
              <ChartFilterBar active={chartFilter} onChange={setChartFilter} />
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={trafficVolumeData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradVehicles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradAnpr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#0f1a2e" />
                <XAxis dataKey="time" tick={{ fill: '#4d607a', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <YAxis tick={{ fill: '#4d607a', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Tooltip content={<CustomTooltipDark />} />
                <Area type="monotone" dataKey="vehicles" name="Vehicles" stroke="#3b82f6" strokeWidth={2} fill="url(#gradVehicles)" dot={false} />
                <Area type="monotone" dataKey="anpr" name="ANPR Reads" stroke="#06b6d4" strokeWidth={2} fill="url(#gradAnpr)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Vehicle Distribution donut */}
          <div className="bg-[#0c1220] border border-[#1a2a40] rounded-lg p-4">
            <div className="text-sm font-semibold text-[#e2eaf3] mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Vehicle Distribution</div>
            <div className="text-[10px] text-[#4d607a] mb-3">By vehicle type today</div>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={vehicleDistribution} cx="50%" cy="50%" innerRadius={38} outerRadius={60}
                  dataKey="value" paddingAngle={2} strokeWidth={0}>
                  {vehicleDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltipDark />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-1 gap-1 mt-1">
              {vehicleDistribution.map(v => (
                <div key={v.name} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: v.color }} />
                    <span className="text-[#4d607a]">{v.name}</span>
                  </div>
                  <span className="text-[#8899b4] font-mono">{v.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar + Congestion row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Camera Traffic Volume */}
          <div className="bg-[#0c1220] border border-[#1a2a40] rounded-lg p-4">
            <div className="text-sm font-semibold text-[#e2eaf3] mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Camera Traffic Volume</div>
            <div className="text-[10px] text-[#4d607a] mb-3">Current vehicles per camera</div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={cameraTrafficData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0f1a2e" vertical={false} />
                <XAxis dataKey="cam" tick={{ fill: '#4d607a', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
                <YAxis tick={{ fill: '#4d607a', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
                <Tooltip content={<CustomTooltipDark />} />
                <Bar dataKey="vehicles" name="Vehicles" radius={[2, 2, 0, 0]}>
                  {cameraTrafficData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Congestion distribution */}
          <div className="bg-[#0c1220] border border-[#1a2a40] rounded-lg p-4">
            <div className="text-sm font-semibold text-[#e2eaf3] mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Congestion Distribution</div>
            <div className="text-[10px] text-[#4d607a] mb-4">Traffic level across all cameras</div>
            {[
              { label: 'Clear', count: 2, pct: 17, color: '#22c55e' },
              { label: 'Low', count: 2, pct: 17, color: '#4ade80' },
              { label: 'Moderate', count: 4, pct: 33, color: '#f59e0b' },
              { label: 'High', count: 4, pct: 33, color: '#ef4444' },
            ].map(row => (
              <div key={row.label} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: row.color }} />
                    <span className="text-[10px] text-[#8899b4]">{row.label}</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#4d607a]">{row.count} cameras · {row.pct}%</div>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${row.pct}%`, background: row.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <SystemStatus />
      </div>
    </div>
  );
}
