import { useState, useMemo } from "react";
import Badge from "../components/Badge";
import { useApp } from "../context/AppContext";
import type { WatchlistEntry, Alert } from "../services/api";

function WatchlistMatchBanner({ alert, onDismiss }: { alert: Alert; onDismiss: () => void }) {
  if (!alert) return null;
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
            <span style={{ fontSize: 10, color: "#94a3b8" }}>Plate • </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", fontFamily: "JetBrains Mono, monospace" }}>{alert.plate || "UNKNOWN"}</span>
          </div>
          <div>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>Detected at • </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#22d3ee", fontFamily: "JetBrains Mono, monospace" }}>{alert.camera}</span>
          </div>
          <div>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>Time • </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", fontFamily: "JetBrains Mono, monospace" }}>{alert.timestamp}</span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onDismiss}
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
  onAdd: (data: { plate_number: string; description: string; reason: string; priority: string; notes: string }) => Promise<void>;
}) {
  const [form, setForm] = useState({
    plate_number: "",
    description: "",
    reason: "",
    priority: "medium",
    notes: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const plate = form.plate_number.trim().toUpperCase();
    if (!plate) {
      setError("License plate number is required.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await onAdd({ ...form, plate_number: plate });
      onClose();
    } catch {
      setError("Failed to add vehicle. Please try again.");
      setIsSaving(false);
    }
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
      <div onClick={!isSaving ? onClose : undefined} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />
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
            disabled={isSaving}
            style={{
              background: "transparent",
              border: "1px solid #1e2d45",
              color: "#64748b",
              borderRadius: 6,
              width: 30,
              height: 30,
              cursor: isSaving ? "not-allowed" : "pointer",
              fontSize: 14,
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: "20px" }}>
          {error && (
            <div style={{ marginBottom: 14, padding: "8px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, color: "#f87171", fontSize: 12 }}>
              {error}
            </div>
          )}
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
                disabled={isSaving}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 6,
                  border: "1px solid #1e2d45",
                  background: isSaving ? "#0a101c" : "#0d1420",
                  color: "#f1f5f9",
                  fontSize: 13,
                  fontFamily: mono ? "JetBrains Mono, monospace" : "Inter, sans-serif",
                  outline: "none",
                  transition: "border-color 0.15s",
                  opacity: isSaving ? 0.6 : 1,
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { if (!isSaving) e.target.style.borderColor = "#2563eb"; }}
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
                    disabled={isSaving}
                    style={{
                      flex: 1,
                      padding: "7px 8px",
                      borderRadius: 6,
                      border: `1px solid ${form.priority === p ? colors[p] : "#1e2d45"}`,
                      background: form.priority === p ? `rgba(${p === "critical" ? "239,68,68" : p === "high" ? "245,158,11" : p === "medium" ? "6,182,212" : "148,163,184"},0.15)` : "transparent",
                      color: form.priority === p ? colors[p] : "#64748b",
                      fontSize: 11,
                      fontWeight: form.priority === p ? 700 : 400,
                      cursor: isSaving ? "not-allowed" : "pointer",
                      textTransform: "capitalize",
                      fontFamily: "JetBrains Mono, monospace",
                      letterSpacing: "0.05em",
                      opacity: isSaving ? 0.6 : 1,
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
            disabled={isSaving}
            style={{
              padding: "8px 18px",
              borderRadius: 6,
              border: "1px solid #1e2d45",
              background: "transparent",
              color: "#64748b",
              fontSize: 12,
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            style={{
              padding: "8px 18px",
              borderRadius: 6,
              border: "1px solid #2563eb",
              background: isSaving ? "#1d4ed8" : "#2563eb",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.8 : 1,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {isSaving ? (
              <>
                <span style={{ display: "inline-block", width: 10, height: 10, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Adding...
              </>
            ) : "Add to Watchlist"}
          </button>
        </div>
      </div>
    </div>
  );
}

function WatchlistDetail({ entry, onClose, onToggle, onRemove }: { entry: WatchlistEntry; onClose: () => void; onToggle: () => void; onRemove: () => void; }) {
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
            ["Priority", (entry.priority || "medium").toUpperCase()],
            ["Created Date", entry.created_at ? (entry.created_at.length >= 10 ? entry.created_at.slice(0, 10) : entry.created_at) : "—"],
            ["Last Seen", entry.last_seen || "—"],
            ["Last Camera", entry.last_camera || "—"],
          ].map(([key, val]) => (
            <div key={key} style={{ padding: "10px 0", borderBottom: "1px solid #1a2438", display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "JetBrains Mono, monospace" }}>{key}</span>
              <span style={{ fontSize: 13, color: "#f1f5f9", fontFamily: ["Watchlist ID", "Vehicle ID", "Last Camera"].includes(key as string) ? "JetBrains Mono, monospace" : "Inter, sans-serif" }}>
                {val}
              </span>
            </div>
          ))}
        </div>

        <div style={{ padding: "14px 20px", borderTop: "1px solid #1e2d45", display: "flex", gap: 8 }}>
          <button onClick={() => { onToggle(); onClose(); }} style={{ flex: 1, padding: "8px", borderRadius: 6, border: "1px solid #1e2d45", background: "transparent", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>
            {entry.active ? "Deactivate" : "Activate"}
          </button>
          <button onClick={() => { onRemove(); onClose(); }} style={{ flex: 1, padding: "8px", borderRadius: 6, border: "1px solid #ef4444", background: "rgba(239,68,68,0.1)", color: "#f87171", fontSize: 12, cursor: "pointer" }}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Watchlist() {
  const { alerts, watchlist, watchlistLoading, addPlateToWatchlist, removePlateFromWatchlist, toggleWatchlistActive } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<WatchlistEntry | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const filtered = watchlist.filter((e) => {
    if (filterStatus === "active") return !!e.active;
    if (filterStatus === "inactive") return !e.active;
    return true;
  });

  const activeAlert = useMemo(() => {
    if (bannerDismissed) return null;
    let match = alerts.find(a => a.severity === 'critical' && !a.acknowledged && watchlist.some(w => w.plate_number === a.plate));
    if (!match) {
      match = alerts.find(a => a.severity === 'critical' && !a.acknowledged);
    }
    return match;
  }, [alerts, watchlist, bannerDismissed]);

  const handleAdd = async (data: { plate_number: string; description: string; reason: string; priority: string; notes: string }): Promise<void> => {
    await addPlateToWatchlist(data);
  };

  if (watchlistLoading) {
    return (
      <div style={{ padding: "24px", color: "#94a3b8" }}>Loading watchlist...</div>
    );
  }

  return (
    <div style={{ padding: "24px", overflowY: "auto", height: "100%", background: "#0b0f1a" }}>
      {/* Watchlist match banner */}
      {activeAlert && <WatchlistMatchBanner alert={activeAlert} onDismiss={() => setBannerDismissed(true)} />}

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
          {filtered.length} vehicles • {watchlist.filter((e) => e.active).length} active
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: "40px 14px", textAlign: "center", color: "#475569", fontSize: 13 }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {watchlist.length === 0 ? "No vehicles on watchlist" : `No ${filterStatus === "all" ? "" : filterStatus + " "}entries`}
                  </div>
                  <div style={{ fontSize: 11, color: "#334155" }}>
                    {watchlist.length === 0 ? 'Click "+ Add Vehicle" to add the first entry.' : "Try changing the status filter."}
                  </div>
                </td>
              </tr>
            ) : filtered.map((entry, i) => (
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
                  {entry.vehicle_id || "—"}
                </td>
                <td style={{ padding: "11px 14px", fontSize: 12, color: "#94a3b8", maxWidth: 180 }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.description || "—"}</div>
                </td>
                <td style={{ padding: "11px 14px", fontSize: 12, color: "#94a3b8", maxWidth: 200 }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.reason || "—"}</div>
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <Badge severity={entry.priority || "medium"} />
                </td>
                <td style={{ padding: "11px 14px", fontSize: 11, color: "#64748b", fontFamily: "JetBrains Mono, monospace", whiteSpace: "nowrap" }}>
                  {entry.created_at ? (entry.created_at.length >= 10 ? entry.created_at.slice(0, 10) : entry.created_at) : "—"}
                </td>
                <td style={{ padding: "11px 14px", fontSize: 11, color: "#64748b", fontFamily: "JetBrains Mono, monospace", whiteSpace: "nowrap" }}>
                  {entry.last_seen || "—"}
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
                        toggleWatchlistActive(entry.id, !entry.active);
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
      {selected && (
        <WatchlistDetail
          entry={selected}
          onClose={() => setSelected(null)}
          onToggle={() => toggleWatchlistActive(selected.id, !selected.active)}
          onRemove={() => removePlateFromWatchlist(selected.plate_number)}
        />
      )}
    </div>
  );
}
