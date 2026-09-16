import { useState, useEffect } from "react";
import Badge from "../components/Badge";

type AlertSeverity = "critical" | "high" | "medium" | "low";
type AlertStatus = "active" | "acknowledged" | "resolved";

interface Alert {
  id: string;
  type: string;
  severity: AlertSeverity;
  vehicle_id: string;
  plate_number: string;
  camera_id: string;
  location: string;
  timestamp: string;
  status: AlertStatus;
  confidence: number;
  isNew?: boolean;
}

const INITIAL_ALERTS: Alert[] = [
  {
    id: "ALT-0041", type: "Blacklisted Vehicle", severity: "critical",
    vehicle_id: "VH-8821", plate_number: "KA01AB1234", camera_id: "CAM-003",
    location: "MG Road Junction", timestamp: "2025-09-16 10:35:08", status: "active", confidence: 97,
  },
  {
    id: "ALT-0040", type: "ANPR Mismatch", severity: "high",
    vehicle_id: "VH-5520", plate_number: "KA05CD5678", camera_id: "CAM-007",
    location: "Hosur Road Toll", timestamp: "2025-09-16 10:28:45", status: "active", confidence: 83,
  },
  {
    id: "ALT-0039", type: "Heavy Congestion", severity: "high",
    vehicle_id: "—", plate_number: "—", camera_id: "CAM-002",
    location: "Brigade Road", timestamp: "2025-09-16 10:15:22", status: "acknowledged", confidence: 99,
  },
  {
    id: "ALT-0038", type: "Suspicious Vehicle", severity: "medium",
    vehicle_id: "VH-3312", plate_number: "MH12EF9012", camera_id: "CAM-001",
    location: "Residency Road", timestamp: "2025-09-16 09:58:11", status: "active", confidence: 74,
  },
  {
    id: "ALT-0037", type: "Camera Offline", severity: "medium",
    vehicle_id: "—", plate_number: "—", camera_id: "CAM-009",
    location: "Koramangala 5th Block", timestamp: "2025-09-16 09:41:30", status: "active", confidence: 100,
  },
  {
    id: "ALT-0036", type: "Unusual Traffic", severity: "low",
    vehicle_id: "—", plate_number: "—", camera_id: "CAM-004",
    location: "Bannerghatta Road", timestamp: "2025-09-16 09:10:00", status: "acknowledged", confidence: 68,
  },
  {
    id: "ALT-0035", type: "Blacklisted Vehicle", severity: "critical",
    vehicle_id: "VH-9910", plate_number: "DL3CAB2244", camera_id: "CAM-006",
    location: "Outer Ring Road", timestamp: "2025-09-16 08:52:18", status: "resolved", confidence: 95,
  },
  {
    id: "ALT-0034", type: "ANPR Mismatch", severity: "medium",
    vehicle_id: "VH-2201", plate_number: "TN01GH3456", camera_id: "CAM-005",
    location: "Sarjapur Road", timestamp: "2025-09-16 08:30:50", status: "resolved", confidence: 79,
  },
];

function AlertDetailDrawer({ alert, onClose, onStatusChange }: {
  alert: Alert;
  onClose: () => void;
  onStatusChange: (id: string, status: AlertStatus) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }}
      />

      {/* Drawer */}
      <div
        className="drawer-enter"
        style={{
          position: "relative",
          width: 420,
          height: "100%",
          background: "#111827",
          borderLeft: "1px solid #1e2d45",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #1e2d45",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", fontFamily: "JetBrains Mono, monospace" }}>
                {alert.id}
              </span>
              <Badge severity={alert.severity} />
              <Badge severity={alert.status} />
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>{alert.type}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid #1e2d45",
              color: "#64748b",
              borderRadius: 6,
              width: 32,
              height: 32,
              cursor: "pointer",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {/* Evidence Images */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e2d45" }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10, fontFamily: "JetBrains Mono, monospace" }}>
            Evidence
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {["Vehicle", "Plate", "Camera Frame"].map((label) => (
              <div key={label}>
                <div
                  style={{
                    height: 80,
                    background: "#0d1420",
                    border: "1px solid #1e2d45",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: "#475569",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  [{label}]
                </div>
                <div style={{ fontSize: 9, color: "#475569", textAlign: "center", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Alert details */}
        <div style={{ padding: "16px 20px", flex: 1 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12, fontFamily: "JetBrains Mono, monospace" }}>
            Alert Details
          </div>

          {[
            ["Alert ID", alert.id],
            ["Type", alert.type],
            ["Vehicle ID", alert.vehicle_id],
            ["Plate Number", alert.plate_number],
            ["Camera", alert.camera_id],
            ["Location", alert.location],
            ["Timestamp", alert.timestamp],
            ["Confidence", `${alert.confidence}%`],
          ].map(([key, val]) => (
            <div
              key={key}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "9px 0",
                borderBottom: "1px solid #1a2438",
              }}
            >
              <span style={{ fontSize: 12, color: "#64748b" }}>{key}</span>
              <span
                style={{
                  fontSize: 12,
                  color: "#f1f5f9",
                  fontFamily: key === "Plate Number" || key === "Alert ID" || key === "Camera" ? "JetBrains Mono, monospace" : "Inter, sans-serif",
                  fontWeight: key === "Plate Number" ? 600 : 400,
                }}
              >
                {val}
              </span>
            </div>
          ))}

          {/* Confidence bar */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "#64748b" }}>Detection Confidence</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: alert.confidence > 90 ? "#34d399" : alert.confidence > 70 ? "#fbbf24" : "#f87171" }}>
                {alert.confidence}%
              </span>
            </div>
            <div style={{ height: 4, background: "#1e2d45", borderRadius: 2 }}>
              <div
                style={{
                  height: "100%",
                  width: `${alert.confidence}%`,
                  background: alert.confidence > 90 ? "#10b981" : alert.confidence > 70 ? "#f59e0b" : "#ef4444",
                  borderRadius: 2,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid #1e2d45",
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {alert.status === "active" && (
            <button
              onClick={() => onStatusChange(alert.id, "acknowledged")}
              style={{
                padding: "8px 14px",
                borderRadius: 6,
                border: "1px solid #2563eb",
                background: "rgba(37,99,235,0.18)",
                color: "#60a5fa",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Acknowledge
            </button>
          )}
          <button
            style={{
              padding: "8px 14px",
              borderRadius: 6,
              border: "1px solid #06b6d4",
              background: "rgba(6,182,212,0.12)",
              color: "#22d3ee",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Investigate
          </button>
          {alert.status !== "resolved" && (
            <button
              onClick={() => onStatusChange(alert.id, "resolved")}
              style={{
                padding: "8px 14px",
                borderRadius: 6,
                border: "1px solid #10b981",
                background: "rgba(16,185,129,0.12)",
                color: "#34d399",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Resolve
            </button>
          )}
          <button
            style={{
              padding: "8px 14px",
              borderRadius: 6,
              border: "1px solid #f59e0b",
              background: "rgba(245,158,11,0.12)",
              color: "#fbbf24",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Add to Watchlist
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [selected, setSelected] = useState<Alert | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [lastUpdate, setLastUpdate] = useState<string>("just now");

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor(Math.random() * 30) + 5;
      setLastUpdate(`${seconds} seconds ago`);

      // Occasionally add new alert
      if (Math.random() < 0.3) {
        const types = ["ANPR Mismatch", "Suspicious Vehicle", "Unusual Traffic"];
        const newAlert: Alert = {
          id: `ALT-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          type: types[Math.floor(Math.random() * types.length)],
          severity: "medium",
          vehicle_id: `VH-${Math.floor(Math.random() * 9000) + 1000}`,
          plate_number: `KA${String(Math.floor(Math.random() * 99)).padStart(2, "0")}XY${Math.floor(Math.random() * 9000) + 1000}`,
          camera_id: `CAM-00${Math.floor(Math.random() * 7) + 1}`,
          location: ["MG Road", "Brigade Road", "Sarjapur Road", "Hosur Road"][Math.floor(Math.random() * 4)],
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
          status: "active",
          confidence: Math.floor(Math.random() * 30) + 65,
          isNew: true,
        };
        setAlerts((prev) => [newAlert, ...prev.slice(0, 19)]);
        setTimeout(() => {
          setAlerts((prev) => prev.map((a) => a.id === newAlert.id ? { ...a, isNew: false } : a));
        }, 3000);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = (id: string, status: AlertStatus) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    if (selected?.id === id) setSelected((s) => s ? { ...s, status } : null);
  };

  const counts = {
    critical: alerts.filter((a) => a.severity === "critical").length,
    high: alerts.filter((a) => a.severity === "high").length,
    medium: alerts.filter((a) => a.severity === "medium").length,
    low: alerts.filter((a) => a.severity === "low").length,
  };

  const filtered = alerts.filter((a) => {
    if (filterSeverity !== "all" && a.severity !== filterSeverity) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    return true;
  });

  return (
    <div style={{ padding: "24px", overflowY: "auto", height: "100%", background: "#0b0f1a" }}>
      {/* Live status bar */}
      <div
        style={{
          background: "#141c2e",
          border: "1px solid #1e2d45",
          borderRadius: 8,
          padding: "10px 16px",
          marginBottom: 18,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 8px #10b981",
            }}
            className="live-blink"
          />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.06em" }}>
            LIVE
          </span>
        </div>
        <span style={{ fontSize: 12, color: "#64748b" }}>WebSocket connected · New alert received {lastUpdate}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {(["active", "acknowledged", "resolved"] as AlertStatus[]).map((s) => (
            <span key={s} style={{ fontSize: 11, color: "#64748b" }}>
              <span style={{ color: s === "active" ? "#f87171" : s === "acknowledged" ? "#60a5fa" : "#34d399", fontWeight: 600 }}>
                {alerts.filter((a) => a.status === s).length}
              </span>{" "}
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Critical", count: counts.critical, color: "#ef4444", glow: "rgba(239,68,68,0.2)" },
          { label: "High", count: counts.high, color: "#f59e0b", glow: "rgba(245,158,11,0.2)" },
          { label: "Medium", count: counts.medium, color: "#06b6d4", glow: "rgba(6,182,212,0.2)" },
          { label: "Low", count: counts.low, color: "#94a3b8", glow: "rgba(148,163,184,0.15)" },
        ].map((k) => (
          <div
            key={k.label}
            onClick={() => setFilterSeverity(filterSeverity === k.label.toLowerCase() ? "all" : k.label.toLowerCase())}
            style={{
              flex: 1,
              background: "#141c2e",
              border: `1px solid ${filterSeverity === k.label.toLowerCase() ? k.color : "#1e2d45"}`,
              borderRadius: 10,
              padding: "16px 18px",
              cursor: "pointer",
              transition: "all 0.15s",
              boxShadow: filterSeverity === k.label.toLowerCase() ? `0 0 16px ${k.glow}` : "none",
            }}
          >
            <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "JetBrains Mono, monospace", marginBottom: 6 }}>
              {k.label}
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.count}</div>
          </div>
        ))}
      </div>

      {/* Filter row */}
      <div
        style={{
          background: "#141c2e",
          border: "1px solid #1e2d45",
          borderRadius: 8,
          padding: "10px 14px",
          marginBottom: 14,
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap" }}>Filter:</span>
        {[
          { label: "All", value: "all", type: "severity" },
          { label: "Critical", value: "critical", type: "severity" },
          { label: "High", value: "high", type: "severity" },
          { label: "Medium", value: "medium", type: "severity" },
          { label: "Low", value: "low", type: "severity" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterSeverity(f.value)}
            style={{
              padding: "4px 10px",
              borderRadius: 5,
              border: "1px solid",
              borderColor: filterSeverity === f.value ? "#2563eb" : "#1e2d45",
              background: filterSeverity === f.value ? "rgba(37,99,235,0.15)" : "transparent",
              color: filterSeverity === f.value ? "#60a5fa" : "#64748b",
              fontSize: 11,
              cursor: "pointer",
              fontWeight: filterSeverity === f.value ? 600 : 400,
            }}
          >
            {f.label}
          </button>
        ))}
        <div style={{ width: 1, height: 18, background: "#1e2d45" }} />
        {(["all", "active", "acknowledged", "resolved"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: "4px 10px",
              borderRadius: 5,
              border: "1px solid",
              borderColor: filterStatus === s ? "#2563eb" : "#1e2d45",
              background: filterStatus === s ? "rgba(37,99,235,0.15)" : "transparent",
              color: filterStatus === s ? "#60a5fa" : "#64748b",
              fontSize: 11,
              cursor: "pointer",
              fontWeight: filterStatus === s ? 600 : 400,
              textTransform: "capitalize",
            }}
          >
            {s === "all" ? "All Status" : s}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#64748b", fontFamily: "JetBrains Mono, monospace" }}>
          {filtered.length} alerts
        </span>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#141c2e",
          border: "1px solid #1e2d45",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0f1829" }}>
              {["Alert ID", "Type", "Severity", "Vehicle", "Plate", "Camera", "Location", "Timestamp", "Status", "Action"].map((col) => (
                <th
                  key={col}
                  style={{
                    padding: "11px 14px",
                    textAlign: "left",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    fontFamily: "JetBrains Mono, monospace",
                    borderBottom: "1px solid #1e2d45",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((alert, i) => (
              <tr
                key={alert.id}
                className={alert.isNew ? "alert-new" : ""}
                onClick={() => setSelected(alert)}
                style={{
                  background: alert.isNew ? "rgba(37,99,235,0.08)" : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                  cursor: "pointer",
                  transition: "background 0.15s",
                  borderLeft: alert.severity === "critical" ? "2px solid #ef4444" : "2px solid transparent",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "rgba(37,99,235,0.06)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = alert.isNew ? "rgba(37,99,235,0.08)" : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)"; }}
              >
                <td style={{ padding: "10px 14px", fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#60a5fa", whiteSpace: "nowrap" }}>
                  {alert.isNew && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#10b981", marginRight: 6, verticalAlign: "middle" }} />}
                  {alert.id}
                </td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "#f1f5f9", whiteSpace: "nowrap" }}>{alert.type}</td>
                <td style={{ padding: "10px 14px" }}><Badge severity={alert.severity} /></td>
                <td style={{ padding: "10px 14px", fontSize: 11, color: "#94a3b8", fontFamily: "JetBrains Mono, monospace" }}>{alert.vehicle_id}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "#f1f5f9", fontFamily: "JetBrains Mono, monospace", fontWeight: 600 }}>{alert.plate_number}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "#22d3ee", fontFamily: "JetBrains Mono, monospace" }}>{alert.camera_id}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>{alert.location}</td>
                <td style={{ padding: "10px 14px", fontSize: 11, color: "#64748b", fontFamily: "JetBrains Mono, monospace", whiteSpace: "nowrap" }}>{alert.timestamp.slice(11)}</td>
                <td style={{ padding: "10px 14px" }}><Badge severity={alert.status} /></td>
                <td style={{ padding: "10px 14px" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelected(alert); }}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 5,
                      border: "1px solid #1e2d45",
                      background: "transparent",
                      color: "#94a3b8",
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    View →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alert Drawer */}
      {selected && (
        <AlertDetailDrawer
          alert={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
