import { useState } from "react";
import { Card, Badge, TableWrapper, Th, Td, Btn, SectionHeader, Select } from "../components/ui";

const REPORT_TYPES = [
  { id: "daily-traffic", label: "Daily Traffic Report", icon: "▦", desc: "Hourly vehicle counts, speed, lane distribution across all cameras." },
  { id: "vehicle-movement", label: "Vehicle Movement Report", icon: "◈", desc: "Origin-destination patterns, route frequency, trajectory clusters." },
  { id: "anpr", label: "ANPR Report", icon: "⬢", desc: "Plate reads, recognition confidence, manual review queue." },
  { id: "congestion", label: "Congestion Report", icon: "⚑", desc: "Bottleneck detection, LOS metrics, temporal congestion heatmaps." },
  { id: "camera-performance", label: "Camera Performance Report", icon: "◉", desc: "Uptime, FPS stability, detection accuracy per camera." },
  { id: "alert", label: "Alert Report", icon: "⬡", desc: "Alert summary by type, camera, severity and resolution time." },
];

const HISTORY = [
  { id: "RPT-2024-1048", type: "Daily Traffic Report", range: "Sep 15, 2026", generated: "10:30:00", by: "Operator", status: "Completed" },
  { id: "RPT-2024-1047", type: "ANPR Report", range: "Sep 14, 2026", generated: "09:15:22", by: "Admin", status: "Completed" },
  { id: "RPT-2024-1046", type: "Congestion Report", range: "Sep 13–14, 2026", generated: "08:45:10", by: "Operator", status: "Generating" },
  { id: "RPT-2024-1045", type: "Camera Performance Report", range: "Sep 1–7, 2026", generated: "Yesterday", by: "Admin", status: "Completed" },
  { id: "RPT-2024-1044", type: "Vehicle Movement Report", range: "Sep 10, 2026", generated: "Yesterday", by: "Operator", status: "Failed" },
  { id: "RPT-2024-1043", type: "Alert Report", range: "Sep 1–14, 2026", generated: "2 days ago", by: "Admin", status: "Completed" },
];

const statusColor = (s: string): "green" | "amber" | "red" | "blue" | "gray" =>
  s === "Completed" ? "green" : s === "Generating" ? "blue" : "red";

export default function Reports() {
  const [selected, setSelected] = useState("daily-traffic");
  const [camera, setCamera] = useState("all");
  const [area, setArea] = useState("all");
  const [vehicleType, setVehicleType] = useState("all");

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Traffic Intelligence Reports"
        subtitle="Generate and review analytical reports for city traffic data."
      />

      {/* Report type selection */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>Select Report Type</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REPORT_TYPES.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r.id)}
              className="text-left p-4 rounded-xl border transition-all duration-150"
              style={{
                background: selected === r.id ? "rgba(59,130,246,0.1)" : "#111827",
                borderColor: selected === r.id ? "#3b82f6" : "#1e2d45",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg" style={{ color: selected === r.id ? "#60a5fa" : "#64748b" }}>{r.icon}</span>
                <span className="text-sm font-semibold" style={{ color: selected === r.id ? "#60a5fa" : "#f1f5f9" }}>
                  {r.label}
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>{r.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Filters + generate */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Report Filters</h3>
          <Badge color="blue">{REPORT_TYPES.find((r) => r.id === selected)?.label}</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "#94a3b8" }}>Date Range</label>
            <input
              type="date"
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "#0b0f1a", border: "1px solid #1e2d45", color: "#f1f5f9" }}
              defaultValue="2026-09-15"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "#94a3b8" }}>Camera</label>
            <Select
              value={camera}
              onChange={setCamera}
              options={[
                { value: "all", label: "All Cameras" },
                { value: "CAM-001", label: "CAM-001 — MG Road" },
                { value: "CAM-002", label: "CAM-002 — Brigade Road" },
                { value: "CAM-003", label: "CAM-003 — Silk Board" },
                { value: "CAM-004", label: "CAM-004 — Hebbal" },
              ]}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "#94a3b8" }}>Area</label>
            <Select
              value={area}
              onChange={setArea}
              options={[
                { value: "all", label: "All Areas" },
                { value: "central", label: "Central Bangalore" },
                { value: "south", label: "South Bangalore" },
                { value: "north", label: "North Bangalore" },
                { value: "east", label: "East Bangalore" },
              ]}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "#94a3b8" }}>Vehicle Type</label>
            <Select
              value={vehicleType}
              onChange={setVehicleType}
              options={[
                { value: "all", label: "All Types" },
                { value: "car", label: "Car" },
                { value: "truck", label: "Truck/HCV" },
                { value: "two-wheeler", label: "Two-Wheeler" },
                { value: "bus", label: "Bus" },
              ]}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Btn>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Generate Report
          </Btn>
          <Btn variant="secondary">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4 5h6M4 7.5h6M4 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Export PDF
          </Btn>
          <Btn variant="ghost">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 4l5-3 5 3M2 4v7l5 3 5-3V4M7 1v13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export CSV
          </Btn>
        </div>
      </Card>

      {/* Report history */}
      <Card>
        <div className="px-4 py-3 border-b" style={{ borderColor: "#1e2d45" }}>
          <span className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Report History</span>
          <span className="ml-2 text-xs" style={{ color: "#64748b" }}>{HISTORY.length} reports</span>
        </div>
        <TableWrapper>
          <thead>
            <tr>
              <Th>Report ID</Th>
              <Th>Report Type</Th>
              <Th>Date Range</Th>
              <Th>Generated At</Th>
              <Th>Generated By</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {HISTORY.map((r) => (
              <tr key={r.id} className="hover:bg-slate-800/20 transition-colors">
                <Td mono><span style={{ color: "#60a5fa" }}>{r.id}</span></Td>
                <Td><span style={{ color: "#f1f5f9" }}>{r.type}</span></Td>
                <Td mono>{r.range}</Td>
                <Td mono>{r.generated}</Td>
                <Td>{r.by}</Td>
                <Td>
                  <Badge color={statusColor(r.status)}>
                    {r.status === "Generating" && (
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: "currentColor" }} />
                    )}
                    {r.status}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex gap-1">
                    <Btn size="sm" variant="secondary" disabled={r.status !== "Completed"}>View</Btn>
                    <Btn size="sm" variant="ghost" disabled={r.status !== "Completed"}>Download</Btn>
                    <Btn size="sm" variant="danger">Delete</Btn>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrapper>
      </Card>
    </div>
  );
}
