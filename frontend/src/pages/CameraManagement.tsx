import { useState } from "react";
import {
  Card, Badge, KpiCard, TableWrapper, Th, Td, Btn, SectionHeader,
  InputField, Input, Select, Toggle
} from "../components/ui";
import { useApp } from "../context/AppContext";
import { updateCamera } from "../services/api";

const statusColor = (s: string): "green" | "red" | "amber" | "gray" =>
  s === "online" ? "green" : s === "offline" ? "red" : "amber";

const healthColor = (h: string): "green" | "red" | "amber" | "gray" =>
  h === "online" ? "green" : h === "offline" ? "red" : "amber";

interface AddCameraForm {
  cameraId: string; name: string; location: string;
  latitude: string; longitude: string; streamUrl: string;
  cameraType: string; status: string;
}

export default function CameraManagement() {
  const { cameras, refreshCameras, camerasLoading } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState<typeof cameras[0] | null>(null);
  const [form, setForm] = useState<AddCameraForm>({
    cameraId: "", name: "", location: "",
    latitude: "", longitude: "", streamUrl: "",
    cameraType: "Fixed", status: "Online",
  });

  const handleToggleEnable = async (id: string, currentEnabled: number) => {
    try {
      await updateCamera(id, { enabled: currentEnabled === 1 ? false : true });
      refreshCameras();
    } catch (e) {
      console.error(e);
      alert("Failed to update camera status. Backend might be offline.");
    }
  };

  const filtered = cameras.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || c.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const total = cameras.length;
  const online = cameras.filter((c) => c.status === "online").length;
  const offline = cameras.filter((c) => c.status === "offline").length;
  const warning = cameras.filter((c) => c.status === "warning").length;

  if (camerasLoading && cameras.length === 0) {
    return <div className="text-white p-6">Loading cameras...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Camera Management"
        subtitle="Manage registered traffic cameras and monitor their health."
        action={
          <Btn onClick={() => setShowAdd(true)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Add Camera
          </Btn>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Cameras" value={total} sub="Registered" accent="#60a5fa" />
        <KpiCard label="Online" value={online} sub="Streaming" accent="#22c55e" />
        <KpiCard label="Offline" value={offline} sub="Not responding" accent="#ef4444" />
        <KpiCard label="Warning" value={warning} sub="Degraded" accent="#f59e0b" />
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-48"
            style={{ background: "#0b0f1a", border: "1px solid #1e2d45" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="#64748b" strokeWidth="1.5" />
              <path d="M9.5 9.5L12 12" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cameras..."
              className="bg-transparent text-sm outline-none w-full placeholder:text-slate-600"
              style={{ color: "#f1f5f9" }}
            />
          </div>
          {["All", "Online", "Offline", "Warning"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: statusFilter === s ? "rgba(59,130,246,0.15)" : "transparent",
                border: statusFilter === s ? "1px solid rgba(59,130,246,0.4)" : "1px solid #1e2d45",
                color: statusFilter === s ? "#60a5fa" : "#64748b",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "#1e2d45" }}>
          <div>
            <span className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Camera Registry</span>
            <span className="ml-2 text-xs" style={{ color: "#64748b" }}>{filtered.length} cameras</span>
          </div>
        </div>
        <TableWrapper>
          <thead>
            <tr>
              <Th>Camera ID</Th>
              <Th>Camera Name</Th>
              <Th>Location</Th>
              <Th>Status</Th>
              <Th>Enabled</Th>
              <Th>FPS</Th>
              <Th>Vehicles Today</Th>
              <Th>Traffic Level</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cam) => (
              <tr
                key={cam.id}
                className="hover:bg-slate-800/20 transition-colors cursor-pointer"
                onClick={() => setShowDetail(cam)}
              >
                <Td mono><span style={{ color: "#60a5fa" }}>{cam.id}</span></Td>
                <Td><span style={{ color: "#f1f5f9", fontWeight: 500 }}>{cam.name}</span></Td>
                <Td>{cam.location}</Td>
                <Td>
                  <Badge color={statusColor(cam.status)}>
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "currentColor" }} />
                    <span className="capitalize">{cam.status}</span>
                  </Badge>
                </Td>
                <Td>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Toggle checked={cam.enabled === 1} onChange={() => handleToggleEnable(cam.id, cam.enabled)} />
                  </div>
                </Td>
                <Td mono>{cam.fps > 0 ? `${Math.round(cam.fps)} FPS` : "—"}</Td>
                <Td mono>{(cam.vehicles || 0).toLocaleString()}</Td>
                <Td><Badge color={cam.traffic === "high" ? "red" : cam.traffic === "moderate" ? "amber" : "green"}><span className="capitalize">{cam.traffic || "clear"}</span></Badge></Td>
                <Td>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Btn size="sm" variant="secondary" onClick={() => setShowDetail(cam)}>View</Btn>
                    <Btn size="sm" variant="ghost">Edit</Btn>
                  </div>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <Td colSpan={9}>
                  <div className="text-center py-6 text-slate-500 text-sm">No cameras found.</div>
                </Td>
              </tr>
            )}
          </tbody>
        </TableWrapper>
      </Card>

      {/* Add Camera Modal */}
      {showAdd && (
        <Modal title="Add Camera" onClose={() => setShowAdd(false)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Camera ID" help="Unique identifier e.g. CAM-009">
              <Input placeholder="CAM-009" value={form.cameraId} onChange={(v) => setForm({ ...form, cameraId: v })} />
            </InputField>
            <InputField label="Camera Name">
              <Input placeholder="Junction Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            </InputField>
            <InputField label="Location">
              <Input placeholder="Area / Road" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
            </InputField>
            <InputField label="Camera Type">
              <Select
                value={form.cameraType}
                onChange={(v) => setForm({ ...form, cameraType: v })}
                options={[
                  { value: "Fixed", label: "Fixed" },
                  { value: "PTZ", label: "PTZ" },
                  { value: "Fisheye", label: "Fisheye" },
                ]}
              />
            </InputField>
            <InputField label="Latitude">
              <Input placeholder="12.9716" value={form.latitude} onChange={(v) => setForm({ ...form, latitude: v })} />
            </InputField>
            <InputField label="Longitude">
              <Input placeholder="77.5946" value={form.longitude} onChange={(v) => setForm({ ...form, longitude: v })} />
            </InputField>
            <InputField label="Stream URL" help="RTSP or HTTP stream configured on backend">
              <Input placeholder="rtsp://..." value={form.streamUrl} onChange={(v) => setForm({ ...form, streamUrl: v })} />
            </InputField>
            <InputField label="Initial Status">
              <Select
                value={form.status}
                onChange={(v) => setForm({ ...form, status: v })}
                options={[
                  { value: "Online", label: "Online" },
                  { value: "Offline", label: "Offline" },
                ]}
              />
            </InputField>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-4" style={{ borderColor: "#1e2d45" }}>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={() => setShowAdd(false)}>Add Camera</Btn>
          </div>
        </Modal>
      )}

      {/* Camera Detail Modal */}
      {showDetail && (
        <Modal title={`${showDetail.id} — ${showDetail.name}`} onClose={() => setShowDetail(null)} wide>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview */}
            <div>
              <div
                className="w-full rounded-lg flex items-center justify-center"
                style={{ background: "#0b0f1a", border: "1px solid #1e2d45", aspectRatio: "16/9" }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">≡ƒô╖</div>
                  <p className="text-xs" style={{ color: "#64748b" }}>Camera Preview</p>
                  <p className="text-xs mt-1" style={{ color: "#3b82f6" }}>{showDetail.id}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Btn size="sm">View Camera</Btn>
                <Btn size="sm" variant="secondary">Edit</Btn>
                <Btn size="sm" variant="ghost">Restart</Btn>
                <Btn size="sm" variant="danger" onClick={() => { handleToggleEnable(showDetail.id, showDetail.enabled); setShowDetail(null); }}>
                  {showDetail.enabled === 1 ? "Disable" : "Enable"}
                </Btn>
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Camera ID", value: showDetail.id },
                  { label: "Location", value: showDetail.location },
                  { label: "FPS", value: `${Math.round(showDetail.fps)} FPS` },
                  { label: "Status", value: showDetail.status },
                  { label: "Vehicles Today", value: (showDetail.vehicles || 0).toLocaleString() },
                  { label: "Traffic", value: showDetail.traffic || "clear" },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg p-3" style={{ background: "#0b0f1a", border: "1px solid #1e2d45" }}>
                    <div className="text-xs" style={{ color: "#64748b" }}>{item.label}</div>
                    <div className="text-sm font-semibold mt-1 capitalize" style={{ color: "#f1f5f9", fontFamily: "var(--font-mono)" }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Health metrics */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#64748b" }}>Health Metrics</div>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Stream", ok: showDetail.status === "online" },
                    { label: "Detection", ok: showDetail.status !== "offline" },
                    { label: "Tracking", ok: showDetail.status !== "offline" },
                    { label: "OCR", ok: showDetail.status !== "offline" },
                    { label: "API Connection", ok: true },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: "#0b0f1a" }}>
                      <span className="text-sm" style={{ color: "#94a3b8" }}>{m.label}</span>
                      <Badge color={m.ok ? "green" : "red"}>{m.ok ? "OK" : "Error"}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div
        className={`w-full rounded-2xl ${wide ? "max-w-3xl" : "max-w-lg"}`}
        style={{ background: "#111827", border: "1px solid #1e2d45", maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#1e2d45" }}>
          <h2 className="text-base font-semibold" style={{ color: "#f1f5f9" }}>{title}</h2>
          <button onClick={onClose} className="p-1 rounded" style={{ color: "#64748b" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
