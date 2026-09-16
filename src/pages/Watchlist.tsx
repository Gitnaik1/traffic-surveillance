import { useState, useEffect } from "react";
import Badge from "../components/Badge";


interface WatchlistEntry {
  id: string;
  plate_number: string;
  vehicle_id: string;
  description: string;
  reason: string;
  priority: "critical" | "high" | "medium" | "low";
  created_at: string;
  last_seen: string;
  last_camera: string;
  active: boolean;
  alert_count: number;
}

const INITIAL_WATCHLIST: WatchlistEntry[] = [
  {
    id: "WL-0021", plate_number: "KA01AB1234", vehicle_id: "VH-8821",
    description: "Black Maruti Swift · KA01AB1234",
    reason: "Suspected in robbery case · Bengaluru North",
    priority: "critical", created_at: "2025-09-10", last_seen: "2025-09-16 10:35",
    last_camera: "CAM-003", active: true, alert_count: 7,
  },
  {
    id: "WL-0020", plate_number: "DL3CAB2244", vehicle_id: "VH-9910",
    description: "White Toyota Innova · DL3CAB2244",
    reason: "Reported stolen vehicle",
    priority: "high", created_at: "2025-09-12", last_seen: "2025-09-16 08:52",
    last_camera: "CAM-006", active: true, alert_count: 3,
  },
  {
    id: "WL-0019", plate_number: "MH12EF9012", vehicle_id: "VH-3312",
    description: "Silver Honda City · MH12EF9012",
    reason: "ANPR mismatch detected multiple times",
    priority: "medium", created_at: "2025-09-08", last_seen: "2025-09-15 14:20",
    last_camera: "CAM-001", active: true, alert_count: 5,
  },
  {
    id: "WL-0018", plate_number: "KA05CD5678", vehicle_id: "VH-5520",
    description: "Red Hyundai i20 · KA05CD5678",
    reason: "Traffic violation repeat offender",
    priority: "low", created_at: "2025-09-05", last_seen: "2025-09-14 09:10",
    last_camera: "CAM-007", active: true, alert_count: 2,
  },
  {
    id: "WL-0017", plate_number: "TN01GH3456", vehicle_id: "VH-2201",
    description: "Blue Tata Nexon · TN01GH3456",
    reason: "Suspicious movement pattern",
    priority: "medium", created_at: "2025-09-01", last_seen: "2025-09-13 17:05",
    last_camera: "CAM-005", active: false, alert_count: 1,
  },
  {
    id: "WL-0016", plate_number: "KA02PQ7788", vehicle_id: "VH-1105",
    description: "Grey Renault Kwid · KA02PQ7788",
    reason: "Under intelligence observation",
    priority: "high", created_at: "2025-08-28", last_seen: "2025-09-12 11:30",
    last_camera: "CAM-002", active: false, alert_count: 4,
  },
];

const WATCHLIST_MATCH = {
  plate: "KA01AB1234",
  camera: "CAM-003",
  time: "10:35:08",
  confidence: 94,
  status: "critical",
};

function WatchlistMatchBanner({ match }: { match: typeof WATCHLIST_MATCH }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div
      style={{
        background: "rgba(239,68,68,0.1)",
        border: "1px solid rgba(239,68,68,0.4)",
        borderRadius: 10,
        padding: "14px 18px",
        marginBottom: 18,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          background: "rgba(239,68,68,0.2)",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        ⚠
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "JetBrains Mono, monospace" }}>
            WATCHLIST MATCH
          </span>
          <span style={{ fontSize: 10, background: "rgba(239,68,68,0.2)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 4, padding: "2px 8px", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, letterSpacing: "0.08em" }}>
            CRITICAL
          </span>
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>Plate · </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", fontFamily: "JetBrains Mono, monospace" }}>{match.plate}</span>
          </div>
          <div>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>Detected at · </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#22d3ee", fontFamily: "JetBrains Mono, monospace" }}>{match.camera}</span>
          </div>
          <div>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>Time · </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", fontFamily: "JetBrains Mono, monospace" }}>{match.time}</span>
          </div>
          <div>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>Confidence · </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#34d399", fontFamily: "JetBrains Mono, monospace" }}>{match.confidence}%</span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #ef4444",
            background: "rgba(239,68,68,0.18)",
            color: "#f87171",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          View Alert
        </button>
        <button
          onClick={() => setVisible(false)}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #1e2d45",
            background: "transparent",
            color: "#64748b",
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

function AddVehicleModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (entry: Partial<WatchlistEntry>) => void;
}) {
  const [form, setForm] = useState({
    plate_number: "",
    description: "",
    reason: "",
    priority: "medium",
    notes: "",
  });

  const handleSubmit = () => {
    if (!form.plate_number.trim()) return;
    onAdd({
      ...form,
      priority: form.priority as WatchlistEntry["priority"],
      id: `WL-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      vehicle_id: `VH-${Math.floor(Math.random() * 9000) + 1000}`,
      created_at: new Date().toISOString().slice(0, 10),
      last_seen: "—",
      last_camera: "—",
      active: true,
      alert_count: 0,
    });
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />
      <div
        style={{
          position: "relative",
          width: 480,
          background: "#111827",
          border: "1px solid #1e2d45",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #1e2d45",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>Add to Watchlist</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Register a vehicle for active monitoring</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid #1e2d45",
              color: "#64748b",
              borderRadius: 6,
              width: 30,
              height: 30,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: "20px" }}>
          {[
            { label: "License Plate *", key: "plate_number", placeholder: "e.g. KA01AB1234", mono: true },
            { label: "Vehicle Description", key: "description", placeholder: "Color, make, model" },
            { label: "Reason", key: "reason", placeholder: "Why this vehicle is being monitored" },
            { label: "Notes", key: "notes", placeholder: "Additional notes" },
          ].map(({ label, key, placeholder, mono }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, color: "#94a3b8", marginBottom: 6, fontWeight: 500 }}>
                {label}
              </label>
              <input
                value={(form as Record<string, string>)[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 6,
                  border: "1px solid #1e2d45",
                  background: "#0d1420",
                  color: "#f1f5f9",
                  fontSize: 13,
                  fontFamily: mono ? "JetBrains Mono, monospace" : "Inter, sans-serif",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#2563eb"; }}
                onBlur={(e) => { e.target.style.borderColor = "#1e2d45"; }}
              />
            </div>
          ))}

          {/* Priority */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, color: "#94a3b8", marginBottom: 6, fontWeight: 500 }}>
              Priority
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["critical", "high", "medium", "low"] as const).map((p) => {
                const colors: Record<string, string> = { critical: "#ef4444", high: "#f59e0b", medium: "#06b6d4", low: "#94a3b8" };
                return (
                  <button
                    key={p}
                    onClick={() => setForm((f) => ({ ...f, priority: p }))}
                    style={{
                      flex: 1,
                      padding: "7px 8px",
                      borderRadius: 6,
                      border: `1px solid ${form.priority === p ? colors[p] : "#1e2d45"}`,
                      background: form.priority === p ? `rgba(${p === "critical" ? "239,68,68" : p === "high" ? "245,158,11" : p === "medium" ? "6,182,212" : "148,163,184"},0.15)` : "transparent",
                      color: form.priority === p ? colors[p] : "#64748b",
                      fontSize: 11,
                      fontWeight: form.priority === p ? 700 : 400,
                      cursor: "pointer",
                      textTransform: "capitalize",
                      fontFamily: "JetBrains Mono, monospace",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid #1e2d45",
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px",
              borderRadius: 6,
              border: "1px solid #1e2d45",
              background: "transparent",
              color: "#64748b",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: "8px 18px",
              borderRadius: 6,
              border: "1px solid #2563eb",
              background: "#2563eb",
              color: "#fff",
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

function WatchlistDetail({ entry, onClose }: { entry: WatchlistEntry; onClose: () => void }) {
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
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
      <div
        className="drawer-enter"
        style={{
          position: "relative",
          width: 400,
          height: "100%",
          background: "#111827",
          borderLeft: "1px solid #1e2d45",
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #1e2d45", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", fontFamily: "JetBrains Mono, monospace", marginBottom: 4 }}>
              {entry.plate_number}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Badge severity={entry.priority} />
              <Badge severity={entry.active ? "active" : "inactive"} />
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "1px solid #1e2d45", color: "#64748b", borderRadius: 6, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "18px 20px" }}>
          {[
            ["Watchlist ID", entry.id],
            ["Vehicle ID", entry.vehicle_id],
            ["Description", entry.description],
            ["Reason", entry.reason],
            ["Priority", entry.priority.toUpperCase()],
            ["Created Date", entry.created_at],
            ["Last Seen", entry.last_seen],
            ["Last Camera", entry.last_camera],
          ].map(([key, val]) => (
            <div key={key} style={{ padding: "10px 0", borderBottom: "1px solid #1a2438", display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "JetBrains Mono, monospace" }}>{key}</span>
              <span style={{ fontSize: 13, color: "#f1f5f9", fontFamily: ["Watchlist ID", "Vehicle ID", "Last Camera"].includes(key as string) ? "JetBrains Mono, monospace" : "Inter, sans-serif" }}>
                {val}
              </span>
            </div>
          ))}

          {/* Alert history */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "JetBrains Mono, monospace", marginBottom: 10 }}>
              Alert History ({entry.alert_count} alerts)
            </div>
            {Array.from({ length: Math.min(entry.alert_count, 4) }).map((_, i) => (
              <div
                key={i}
                style={{
                  padding: "9px 12px",
                  background: "#0f1829",
                  border: "1px solid #1e2d45",
                  borderRadius: 6,
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: i === 0 ? "#ef4444" : i === 1 ? "#f59e0b" : "#06b6d4", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    {["Blacklisted Vehicle", "ANPR Mismatch", "Suspicious Vehicle", "Unusual Traffic"][i % 4]}
                  </div>
                  <div style={{ fontSize: 10, color: "#475569", fontFamily: "JetBrains Mono, monospace" }}>
                    CAM-00{i + 1} · 2025-09-{10 + i} {String(8 + i).padStart(2, "0")}:30
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "14px 20px", borderTop: "1px solid #1e2d45", display: "flex", gap: 8 }}>
          <button style={{ flex: 1, padding: "8px", borderRadius: 6, border: "1px solid #1e2d45", background: "transparent", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>
            {entry.active ? "Deactivate" : "Activate"}
          </button>
          <button style={{ flex: 1, padding: "8px", borderRadius: 6, border: "1px solid #ef4444", background: "rgba(239,68,68,0.1)", color: "#f87171", fontSize: 12, cursor: "pointer" }}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Watchlist() {
  const [entries, setEntries] = useState<WatchlistEntry[]>(INITIAL_WATCHLIST);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<WatchlistEntry | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  useEffect(() => {
    fetch("http://localhost:8000/api/watchlist")
      .then((res) => res.json())
      .then((data) => {
        // data.watchlist is: ["KA01AB1234", "MH12DE5678", "DL03C9999"]
        if (data && data.watchlist) {
          // Convert the backend plates into watchlist table entries
          const backendEntries: WatchlistEntry[] = data.watchlist.map((plate: string, idx: number) => ({
            id: `WL-BE-${idx + 1}`,
            plate_number: plate,
            vehicle_id: `VH-${1000 + idx}`,
            description: `Tracked plate · ${plate}`,
            reason: "Monitored via AI Surveillance Engine",
            priority: "high",
            created_at: new Date().toISOString().split("T")[0],
            last_seen: "Just now",
            last_camera: "CAM_01",
            active: true,
            alert_count: 1,
          }));
          // Update the table with live backend entries!
          setEntries(backendEntries);
        }
      })
      .catch((err) => console.error("Error fetching watchlist:", err));
  }, []);

  const filtered = entries.filter((e) => {
    if (filterStatus === "active") return e.active;
    if (filterStatus === "inactive") return !e.active;
    return true;
  });

  const handleAdd = (entry: Partial<WatchlistEntry>) => {
    setEntries((prev) => [entry as WatchlistEntry, ...prev]);
    if (entry.plate_number) {
      fetch("http://localhost:8000/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plate_number: entry.plate_number }),
      }).catch((err) => console.error("Error adding to backend:", err));
    }
  };

  return (
    <div style={{ padding: "24px", overflowY: "auto", height: "100%", background: "#0b0f1a" }}>
      {/* Watchlist match banner */}
      <WatchlistMatchBanner match={WATCHLIST_MATCH} />

      {/* Header actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        {/* Status filter */}
        <div style={{ display: "flex", gap: 4, background: "#141c2e", border: "1px solid #1e2d45", borderRadius: 7, padding: 4 }}>
          {(["all", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: "5px 14px",
                borderRadius: 5,
                border: "none",
                background: filterStatus === s ? "rgba(37,99,235,0.2)" : "transparent",
                color: filterStatus === s ? "#60a5fa" : "#64748b",
                fontSize: 12,
                fontWeight: filterStatus === s ? 600 : 400,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <span style={{ fontSize: 12, color: "#64748b", fontFamily: "JetBrains Mono, monospace" }}>
          {filtered.length} vehicles · {entries.filter((e) => e.active).length} active
        </span>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button
            style={{
              padding: "8px 16px",
              borderRadius: 7,
              border: "1px solid #1e2d45",
              background: "transparent",
              color: "#64748b",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Export CSV
          </button>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              padding: "8px 16px",
              borderRadius: 7,
              border: "1px solid #2563eb",
              background: "#2563eb",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Add Vehicle
          </button>
        </div>
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
              {["Plate", "Vehicle ID", "Description", "Reason", "Priority", "Added Date", "Last Seen", "Status", "Actions"].map((col) => (
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
            {filtered.map((entry, i) => (
              <tr
                key={entry.id}
                onClick={() => setSelected(entry)}
                style={{
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                  cursor: "pointer",
                  transition: "background 0.15s",
                  borderLeft: entry.priority === "critical" ? "2px solid #ef4444" : entry.priority === "high" ? "2px solid #f59e0b" : "2px solid transparent",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "rgba(37,99,235,0.06)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)"; }}
              >
                <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: "#f1f5f9", fontFamily: "JetBrains Mono, monospace", whiteSpace: "nowrap" }}>
                  {entry.plate_number}
                </td>
                <td style={{ padding: "11px 14px", fontSize: 11, color: "#94a3b8", fontFamily: "JetBrains Mono, monospace" }}>
                  {entry.vehicle_id}
                </td>
                <td style={{ padding: "11px 14px", fontSize: 12, color: "#94a3b8", maxWidth: 180 }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.description}</div>
                </td>
                <td style={{ padding: "11px 14px", fontSize: 12, color: "#94a3b8", maxWidth: 200 }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.reason}</div>
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <Badge severity={entry.priority} />
                </td>
                <td style={{ padding: "11px 14px", fontSize: 11, color: "#64748b", fontFamily: "JetBrains Mono, monospace", whiteSpace: "nowrap" }}>
                  {entry.created_at}
                </td>
                <td style={{ padding: "11px 14px", fontSize: 11, color: "#64748b", fontFamily: "JetBrains Mono, monospace", whiteSpace: "nowrap" }}>
                  {entry.last_seen}
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <Badge severity={entry.active ? "active" : "inactive"} />
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelected(entry); }}
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
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEntries((prev) => prev.map((en) => en.id === entry.id ? { ...en, active: !en.active } : en));
                      }}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 5,
                        border: "1px solid #1e2d45",
                        background: "transparent",
                        color: entry.active ? "#f87171" : "#34d399",
                        fontSize: 11,
                        cursor: "pointer",
                      }}
                    >
                      {entry.active ? "Deact." : "Act."}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals / Drawers */}
      {showAdd && <AddVehicleModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
      {selected && <WatchlistDetail entry={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
