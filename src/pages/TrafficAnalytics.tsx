import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getTrafficStats, TrafficStats } from "../services/api";
import { useApp } from "../context/AppContext";

// ΓöÇΓöÇ Mock Data (Fallback) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

const MOCK_TRAFFIC_STATS: TrafficStats = {
  kpi: {
    active_cameras: { online: 24, total: 26 },
    vehicles_detected: 12482,
    vehicles_tracked: 4210,
    anpr_reads: 8920,
    active_alerts: 12,
    congestion_score: 68,
  },
  time_series: [
    { time: "06:00", vehicles: 320, anpr: 100 }, { time: "07:00", vehicles: 890, anpr: 200 },
    { time: "08:00", vehicles: 1450, anpr: 300 }, { time: "09:00", vehicles: 1120, anpr: 400 },
    { time: "10:00", vehicles: 780, anpr: 200 }, { time: "11:00", vehicles: 640, anpr: 250 },
    { time: "12:00", vehicles: 720, anpr: 350 }, { time: "13:00", vehicles: 810, anpr: 400 },
    { time: "14:00", vehicles: 700, anpr: 300 }, { time: "15:00", vehicles: 760, anpr: 350 },
    { time: "16:00", vehicles: 1050, anpr: 500 }, { time: "17:00", vehicles: 1380, anpr: 600 },
    { time: "18:00", vehicles: 1820, anpr: 800 }, { time: "19:00", vehicles: 1530, anpr: 700 },
    { time: "20:00", vehicles: 980, anpr: 450 }, { time: "21:00", vehicles: 540, anpr: 200 },
    { time: "22:00", vehicles: 310, anpr: 100 },
  ],
  vehicle_types: [
    { name: "Cars", value: 6840, color: "#2563eb" },
    { name: "2-Wheelers", value: 3210, color: "#06b6d4" },
    { name: "Buses", value: 890, color: "#10b981" },
    { name: "Trucks", value: 640, color: "#f59e0b" },
    { name: "Autos", value: 902, color: "#8b5cf6" },
  ],
  camera_traffic: [
    { cam: "CAM-001", vehicles: 1840, traffic: "high" }, { cam: "CAM-002", vehicles: 2210, traffic: "high" },
    { cam: "CAM-003", vehicles: 2950, traffic: "severe" }, { cam: "CAM-004", vehicles: 1650, traffic: "moderate" },
    { cam: "CAM-005", vehicles: 1290, traffic: "moderate" }, { cam: "CAM-006", vehicles: 980, traffic: "low" },
    { cam: "CAM-007", vehicles: 2100, traffic: "high" }, { cam: "CAM-008", vehicles: 1760, traffic: "moderate" },
  ]
};

const travelTimeData = [
  { t: "06:00", time: 8 }, { t: "08:00", time: 22 }, { t: "10:00", time: 14 },
  { t: "12:00", time: 12 }, { t: "14:00", time: 11 }, { t: "16:00", time: 18 },
  { t: "18:00", time: 34 }, { t: "20:00", time: 19 }, { t: "22:00", time: 9 },
];

const congestionData = [
  { t: "06:00", level: 12 }, { t: "07:00", level: 45 }, { t: "08:00", level: 78 },
  { t: "09:00", level: 62 }, { t: "10:00", level: 35 }, { t: "11:00", level: 28 },
  { t: "12:00", level: 32 }, { t: "13:00", level: 40 }, { t: "14:00", level: 30 },
  { t: "15:00", level: 38 }, { t: "16:00", level: 55 }, { t: "17:00", level: 72 },
  { t: "18:00", level: 88 }, { t: "19:00", level: 74 }, { t: "20:00", level: 44 },
];

const speedData = [
  { t: "06:00", speed: 48 }, { t: "07:00", speed: 28 }, { t: "08:00", speed: 18 },
  { t: "09:00", speed: 24 }, { t: "10:00", speed: 38 }, { t: "11:00", speed: 42 },
  { t: "12:00", speed: 39 }, { t: "13:00", speed: 36 }, { t: "14:00", speed: 41 },
  { t: "15:00", speed: 37 }, { t: "16:00", speed: 26 }, { t: "17:00", speed: 20 },
  { t: "18:00", speed: 14 }, { t: "19:00", speed: 22 }, { t: "20:00", speed: 34 },
];

const peakData = [
  { slot: "6ΓÇô7 AM", vehicles: 890 }, { slot: "7ΓÇô8 AM", vehicles: 1450 },
  { slot: "8ΓÇô9 AM", vehicles: 1120 }, { slot: "12ΓÇô1 PM", vehicles: 810 },
  { slot: "5ΓÇô6 PM", vehicles: 1380 }, { slot: "6ΓÇô7 PM", vehicles: 1820 },
  { slot: "7ΓÇô8 PM", vehicles: 1530 }, { slot: "8ΓÇô9 PM", vehicles: 980 },
];

const PIE_COLORS = ["#2563eb", "#06b6d4", "#10b981", "#f59e0b", "#8b5cf6"];

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: "#141c2e",
    border: "1px solid #1e2d45",
    borderRadius: 8,
    color: "#f1f5f9",
    fontSize: 12,
    fontFamily: "JetBrains Mono, monospace",
  },
  labelStyle: { color: "#94a3b8", fontSize: 11 },
};

// ΓöÇΓöÇ Road nodes for mock heatmap ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

const HEATMAP_SEGMENTS = [
  // MG Road (horizontal, center)
  { x1: 10, y1: 50, x2: 90, y2: 50, level: "severe", label: "MG Road" },
  // Brigade Road (diagonal)
  { x1: 50, y1: 50, x2: 65, y2: 70, level: "high", label: "Brigade Rd" },
  // Residency Road
  { x1: 50, y1: 50, x2: 50, y2: 20, level: "moderate", label: "Residency Rd" },
  // Hosur Road
  { x1: 65, y1: 70, x2: 85, y2: 90, level: "high", label: "Hosur Rd" },
  // Outer Ring Road
  { x1: 10, y1: 20, x2: 90, y2: 20, level: "low", label: "Outer Ring Rd" },
  // Bellary Road
  { x1: 25, y1: 20, x2: 25, y2: 90, level: "moderate", label: "Bellary Rd" },
  // Bannerghatta Rd
  { x1: 50, y1: 70, x2: 50, y2: 90, level: "severe", label: "Bannerghatta Rd" },
  // Sarjapur Rd
  { x1: 65, y1: 30, x2: 80, y2: 70, level: "moderate", label: "Sarjapur Rd" },
  // Old Airport Rd
  { x1: 65, y1: 30, x2: 90, y2: 30, level: "low", label: "Old Airport Rd" },
];

const CAMERAS = [
  { cx: 50, cy: 50, id: "CAM-003" },
  { cx: 25, cy: 50, id: "CAM-001" },
  { cx: 75, cy: 50, id: "CAM-002" },
  { cx: 65, cy: 70, id: "CAM-004" },
  { cx: 50, cy: 20, id: "CAM-005" },
  { cx: 80, cy: 70, id: "CAM-007" },
  { cx: 25, cy: 20, id: "CAM-006" },
];

const LEVEL_COLOR: Record<string, string> = {
  low: "#10b981",
  moderate: "#f59e0b",
  high: "#ef4444",
  severe: "#dc2626",
};

const LEVEL_WIDTH: Record<string, number> = {
  low: 2, moderate: 3.5, high: 5, severe: 6.5,
};

// ΓöÇΓöÇ Subcomponents ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

function KpiCard({ label, value, sub, color = "#2563eb" }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div
      style={{
        background: "#141c2e",
        border: "1px solid #1e2d45",
        borderRadius: 10,
        padding: "16px 18px",
        flex: 1,
        minWidth: 140,
      }}
    >
      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8, fontFamily: "JetBrains Mono, monospace" }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function ChartCard({ title, children, span = 1 }: { title: string; children: React.ReactNode; span?: number }) {
  return (
    <div
      style={{
        background: "#141c2e",
        border: "1px solid #1e2d45",
        borderRadius: 10,
        padding: "18px 20px",
        gridColumn: `span ${span}`,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function CongestionHeatmap() {
  const [hoveredCam, setHoveredCam] = useState<string | null>(null);
  return (
    <div
      style={{
        background: "#0f172a",
        borderRadius: 10,
        border: "1px solid #1e2d45",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <svg viewBox="0 0 100 100" style={{ width: "100%", height: 340, display: "block" }}>
        {/* Background grid */}
        <rect x="0" y="0" width="100" height="100" fill="#0b1120" />
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="#1e2d45" strokeWidth="0.3" />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="#1e2d45" strokeWidth="0.3" />
        ))}

        {/* Road segments */}
        {HEATMAP_SEGMENTS.map((seg, i) => (
          <g key={i}>
            <line
              x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
              stroke={LEVEL_COLOR[seg.level]}
              strokeWidth={LEVEL_WIDTH[seg.level]}
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Glow */}
            <line
              x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
              stroke={LEVEL_COLOR[seg.level]}
              strokeWidth={LEVEL_WIDTH[seg.level] + 3}
              strokeLinecap="round"
              opacity="0.12"
            />
          </g>
        ))}

        {/* Road labels */}
        {HEATMAP_SEGMENTS.map((seg, i) => {
          const mx = (seg.x1 + seg.x2) / 2;
          const my = (seg.y1 + seg.y2) / 2;
          return (
            <text key={`lbl${i}`} x={mx} y={my - 1.5} fontSize="2.2" fill="#94a3b8" textAnchor="middle">
              {seg.label}
            </text>
          );
        })}

        {/* Camera points */}
        {CAMERAS.map((cam) => (
          <g
            key={cam.id}
            onMouseEnter={() => setHoveredCam(cam.id)}
            onMouseLeave={() => setHoveredCam(null)}
            style={{ cursor: "pointer" }}
          >
            <circle cx={cam.cx} cy={cam.cy} r="3.5" fill="#0b1120" stroke="#2563eb" strokeWidth="1" />
            <circle cx={cam.cx} cy={cam.cy} r="1.5" fill="#2563eb" />
            {hoveredCam === cam.id && (
              <text x={cam.cx} y={cam.cy - 5} fontSize="2.5" fill="#60a5fa" textAnchor="middle">
                {cam.id}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          background: "rgba(11,15,26,0.9)",
          border: "1px solid #1e2d45",
          borderRadius: 8,
          padding: "8px 12px",
          display: "flex",
          gap: 14,
          fontSize: 10,
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        {Object.entries(LEVEL_COLOR).map(([level, color]) => (
          <div key={level} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 16, height: 3, borderRadius: 2, background: color }} />
            <span style={{ color: "#94a3b8", textTransform: "capitalize" }}>{level}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", border: "1.5px solid #2563eb", background: "#0b1120" }} />
          <span style={{ color: "#94a3b8" }}>Camera</span>
        </div>
      </div>
    </div>
  );
}

// ΓöÇΓöÇ Main Page ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

const FILTERS_TIME = ["Last 15 min", "Last hour", "Today", "Yesterday", "Custom"];
const FILTERS_CAMERA = ["All Cameras", "CAM-001", "CAM-002", "CAM-003", "CAM-004", "CAM-005"];
const FILTERS_AREA = ["All Areas", "MG Road", "Brigade Rd", "Koramangala", "Whitefield"];
const FILTERS_VEHICLE = ["All Vehicles", "Cars", "2-Wheelers", "Buses", "Trucks"];

export default function TrafficAnalytics() {
  const [timeFilter, setTimeFilter] = useState("Today");
  const [stats, setStats] = useState<TrafficStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { backendOnline } = useApp();

  useEffect(() => {
    setLoading(true);
    getTrafficStats()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load traffic stats", err);
        setStats(MOCK_TRAFFIC_STATS);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: "24px", overflowY: "auto", height: "100%", background: "#0b0f1a" }}>
      {!backendOnline && (
        <div style={{ background: "#2a1a1a", border: "1px solid #ef4444", color: "#f87171", padding: "10px 16px", borderRadius: 8, fontSize: 14, marginBottom: 20 }}>
          Backend offline ΓÇö showing cached data
        </div>
      )}

      {/* Filter Bar */}
      <div
        style={{
          background: "#141c2e",
          border: "1px solid #1e2d45",
          borderRadius: 10,
          padding: "12px 16px",
          marginBottom: 20,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Time preset buttons */}
        <div style={{ display: "flex", gap: 4 }}>
          {FILTERS_TIME.map((t) => (
            <button
              key={t}
              onClick={() => setTimeFilter(t)}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                border: "1px solid",
                borderColor: timeFilter === t ? "#2563eb" : "#1e2d45",
                background: timeFilter === t ? "rgba(37,99,235,0.18)" : "transparent",
                color: timeFilter === t ? "#60a5fa" : "#64748b",
                fontSize: 12,
                fontWeight: timeFilter === t ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: "#1e2d45" }} />

        {/* Dropdowns */}
        {[["Camera", FILTERS_CAMERA], ["Area", FILTERS_AREA], ["Vehicle Type", FILTERS_VEHICLE]].map(([label, opts]) => (
          <select
            key={label as string}
            style={{
              padding: "5px 10px",
              borderRadius: 6,
              border: "1px solid #1e2d45",
              background: "#0d1420",
              color: "#94a3b8",
              fontSize: 12,
              cursor: "pointer",
              outline: "none",
            }}
          >
            {(opts as string[]).map((o) => <option key={o}>{o}</option>)}
          </select>
        ))}

        <button
          style={{
            marginLeft: "auto",
            padding: "5px 14px",
            borderRadius: 6,
            border: "1px solid #2563eb",
            background: "rgba(37,99,235,0.18)",
            color: "#60a5fa",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Apply Filters
        </button>
      </div>

      {loading || !stats ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
          <div style={{ width: 24, height: 24, border: "2px solid #2563eb", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <KpiCard label="Total Vehicles" value={stats.kpi.vehicles_detected.toLocaleString()} sub="Tracking Live" color="#60a5fa" />
            <KpiCard label="ANPR Reads" value={stats.kpi.anpr_reads.toLocaleString()} sub="Plates Recognized" color="#22d3ee" />
            <KpiCard label="Active Alerts" value={stats.kpi.active_alerts} sub="Needs Attention" color="#f59e0b" />
            <KpiCard label="Congestion Score" value={stats.kpi.congestion_score} sub="/ 100 Index" color="#fbbf24" />
            <KpiCard label="Active Cameras" value={`${stats.kpi.active_cameras.online}/${stats.kpi.active_cameras.total}`} sub="Online / Total" color="#34d399" />
            <KpiCard label="Most Congested" value="MG Road" sub="CAM-003 ┬╖ 94% confidence" color="#f87171" />
          </div>

          {/* Charts grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 14,
              marginBottom: 20,
            }}
          >
            <ChartCard title="Traffic Volume Over Time" span={2}>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={stats.time_series}>
                  <defs>
                    <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                  <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="vehicles" stroke="#2563eb" fill="url(#volGrad)" strokeWidth={2} name="Vehicles" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Vehicle Type Distribution">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={stats.vehicle_types} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {stats.vehicle_types.map((entry, i) => (
                      <Cell key={i} fill={entry.color || PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10, color: "#94a3b8" }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Traffic by Camera">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stats.camera_traffic}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                  <XAxis dataKey="cam" tick={{ fill: "#64748b", fontSize: 9 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="vehicles" fill="#06b6d4" radius={[3, 3, 0, 0]} name="Vehicles" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Congestion Trend">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={congestionData}>
                  <defs>
                    <linearGradient id="congGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                  <XAxis dataKey="t" tick={{ fill: "#64748b", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="level" stroke="#ef4444" fill="url(#congGrad)" strokeWidth={2} name="Congestion %" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Average Speed (km/h)">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={speedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                  <XAxis dataKey="t" tick={{ fill: "#64748b", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="speed" stroke="#10b981" strokeWidth={2} dot={false} name="Speed km/h" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Average Travel Time (min)">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={travelTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                  <XAxis dataKey="t" tick={{ fill: "#64748b", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="time" stroke="#f59e0b" strokeWidth={2} dot={false} name="Travel Time (min)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Heatmap + Insights */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
                Congestion Heatmap ΓÇö Bengaluru City
              </div>
              <CongestionHeatmap />
            </div>

            {/* Insights panel */}
            <div
              style={{
                background: "#141c2e",
                border: "1px solid #1e2d45",
                borderRadius: 10,
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                gap: 0,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 }}>
                Analytics Insights
              </div>

              {[
                { label: "Peak Traffic Period", value: "6:00 PM ΓÇô 7:00 PM", color: "#f87171" },
                { label: "Highest Traffic Camera", value: "CAM-003", color: "#60a5fa" },
                { label: "Current Congestion", value: "Moderate", color: "#fbbf24" },
                { label: "Average Speed", value: "31.4 km/h", color: "#22d3ee" },
                { label: "Average Travel Time", value: "15m 42s", color: "#a78bfa" },
                { label: "Vehicles Today", value: stats.kpi.vehicles_detected.toLocaleString(), color: "#34d399" },
                { label: "Busiest Junction", value: "MG Road ├ù Brigade", color: "#f87171" },
                { label: "Cameras Online", value: `${stats.kpi.active_cameras.online} / ${stats.kpi.active_cameras.total}`, color: "#34d399" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px solid #1a2438",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div style={{ fontSize: 10, color: "#64748b", fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: item.color }}>
                    {item.value}
                  </div>
                </div>
              ))}

              {/* Peak bar chart mini */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 10, color: "#64748b", fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                  Peak Traffic Periods
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={peakData} margin={{ top: 0, right: 0, bottom: 0, left: -28 }}>
                    <XAxis dataKey="slot" tick={{ fill: "#64748b", fontSize: 8 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 8 }} />
                    <Tooltip {...CHART_TOOLTIP_STYLE} />
                    <Bar dataKey="vehicles" fill="#2563eb" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
