import { useState, useEffect } from "react";
import { Card, Badge, KpiCard, TableWrapper, Th, Td, SectionHeader } from "../components/ui";

const AI_SERVICES = [
  { name: "Vehicle Detection (YOLOv8)", status: "Healthy", latency: "18ms", fps: "28.4", updated: "10:48:23" },
  { name: "Multi-Object Tracking", status: "Healthy", latency: "12ms", fps: "30.0", updated: "10:48:22" },
  { name: "ANPR Plate Detection", status: "Healthy", latency: "24ms", fps: "25.6", updated: "10:48:20" },
  { name: "Plate OCR Recognition", status: "Healthy", latency: "31ms", fps: "22.1", updated: "10:48:19" },
  { name: "Deep Vehicle Re-ID (512-D ONNX)", status: "Healthy", latency: "14ms", fps: "30.0", updated: "10:48:25" },
];

const BACKEND_SERVICES = [
  { name: "API Server", status: "Healthy", detail: "v2.4.1 — 12ms avg" },
  { name: "Database", status: "Healthy", detail: "PostgreSQL 15 — 4ms" },
  { name: "WebSocket", status: "Connected", detail: "47 active connections" },
  { name: "Cache", status: "Healthy", detail: "Redis 7.2 — 0.3ms" },
];

const EVENTS = [
  { time: "10:47:55", service: "Re-ID", severity: "Warning", message: "Inference latency exceeded 80ms threshold", status: "Active" },
  { time: "10:32:10", service: "CAM-005", severity: "Critical", message: "Camera stream disconnected unexpectedly", status: "Resolved" },
  { time: "10:15:44", service: "OCR", severity: "Info", message: "Model reloaded after config update", status: "Resolved" },
  { time: "09:58:23", service: "API Server", severity: "Warning", message: "Request queue depth exceeded 200", status: "Resolved" },
  { time: "09:12:44", service: "CAM-005", severity: "Critical", message: "Camera offline — no heartbeat for 5 minutes", status: "Active" },
];

const sevColor = (s: string): "red" | "amber" | "blue" | "green" => {
  if (s === "Critical") return "red";
  if (s === "Warning") return "amber";
  if (s === "Info") return "blue";
  return "green";
};

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#1e2d45" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-xs w-10 text-right" style={{ color: "#94a3b8", fontFamily: "var(--font-mono)" }}>
        {value}%
      </span>
    </div>
  );
}

export default function SystemHealth() {
  const [cpu, setCpu] = useState(62);
  const [mem, setMem] = useState(71);
  const [gpu, setGpu] = useState(84);
  const [fps, setFps] = useState(27.4);
  const [apiLat, setApiLat] = useState(12);
  const [wsConn, setWsConn] = useState(47);
  const [lastUpdated, setLastUpdated] = useState("10:48:23");

  useEffect(() => {
    const interval = setInterval(() => {
      setCpu((v) => Math.min(95, Math.max(40, v + (Math.random() - 0.5) * 6)));
      setMem((v) => Math.min(90, Math.max(55, v + (Math.random() - 0.5) * 3)));
      setGpu((v) => Math.min(98, Math.max(70, v + (Math.random() - 0.5) * 4)));
      setFps((v) => Math.min(30, Math.max(20, v + (Math.random() - 0.5) * 1.5)));
      setApiLat((v) => Math.min(40, Math.max(6, v + (Math.random() - 0.5) * 4)));
      setWsConn((v) => Math.max(30, Math.min(60, v + Math.floor((Math.random() - 0.5) * 4))));
      setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="System Health"
        subtitle="Monitor the health of AI processing and platform infrastructure."
        action={
          <div
            className="flex items-center gap-3 px-4 py-2 rounded-lg border"
            style={{ background: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.25)" }}
          >
            <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "#22c55e" }} />
            <div>
              <span className="text-sm font-semibold" style={{ color: "#22c55e" }}>System Healthy</span>
              <span className="text-xs ml-2" style={{ color: "#64748b" }}>Updated {lastUpdated}</span>
            </div>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="AI Services" value="5/5" sub="All online" accent="#22c55e" />
        <KpiCard label="Backend Services" value="4/4" sub="All healthy" accent="#22c55e" />
        <KpiCard label="Active Cameras" value="6" sub="of 8 streaming" accent="#60a5fa" />
        <KpiCard label="Avg Latency" value={`${apiLat}ms`} sub="API response" accent="#22d3ee" />
      </div>

      {/* AI Services */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>AI Services</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {AI_SERVICES.map((svc) => (
            <Card key={svc.name} className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: "#f1f5f9" }}>{svc.name}</span>
                <Badge color={svc.status === "Healthy" ? "green" : "amber"}>{svc.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs" style={{ color: "#64748b" }}>Latency</div>
                  <div className="text-sm font-semibold" style={{ color: "#f1f5f9", fontFamily: "var(--font-mono)" }}>{svc.latency}</div>
                </div>
                <div>
                  <div className="text-xs" style={{ color: "#64748b" }}>FPS</div>
                  <div className="text-sm font-semibold" style={{ color: "#f1f5f9", fontFamily: "var(--font-mono)" }}>{svc.fps}</div>
                </div>
              </div>
              <div className="text-xs" style={{ color: "#64748b" }}>Updated {svc.updated}</div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backend services */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>Backend Services</p>
          <Card className="divide-y" style={{ borderColor: "#1e2d45" }}>
            {BACKEND_SERVICES.map((svc) => (
              <div
                key={svc.name}
                className="flex items-center justify-between px-4 py-3.5"
                style={{ borderColor: "#1e2d45" }}
              >
                <div>
                  <div className="text-sm font-medium" style={{ color: "#f1f5f9" }}>{svc.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#64748b", fontFamily: "var(--font-mono)" }}>{svc.detail}</div>
                </div>
                <Badge color={svc.status === "Healthy" ? "green" : svc.status === "Connected" ? "cyan" : "amber"}>
                  {svc.status}
                </Badge>
              </div>
            ))}
          </Card>
        </div>

        {/* Resource monitoring */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>Resource Monitoring</p>
          <Card className="p-4 flex flex-col gap-4">
            {[
              { label: "CPU Usage", value: Math.round(cpu), color: cpu > 80 ? "#ef4444" : cpu > 60 ? "#f59e0b" : "#22c55e" },
              { label: "Memory Usage", value: Math.round(mem), color: mem > 85 ? "#ef4444" : mem > 70 ? "#f59e0b" : "#22c55e" },
              { label: "GPU Usage", value: Math.round(gpu), color: gpu > 90 ? "#ef4444" : "#3b82f6" },
            ].map((r) => (
              <div key={r.label} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>{r.label}</span>
                </div>
                <MiniBar value={r.value} color={r.color} />
              </div>
            ))}

            <div className="border-t pt-3" style={{ borderColor: "#1e2d45" }}>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Inference FPS", value: fps.toFixed(1), unit: "fps" },
                  { label: "API Latency", value: apiLat.toFixed(0), unit: "ms" },
                  { label: "WS Connections", value: wsConn.toString(), unit: "" },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg p-3" style={{ background: "#0b0f1a", border: "1px solid #1e2d45" }}>
                    <div className="text-xs" style={{ color: "#64748b" }}>{m.label}</div>
                    <div className="text-base font-bold mt-1" style={{ color: "#f1f5f9", fontFamily: "var(--font-mono)" }}>
                      {m.value}<span className="text-xs ml-0.5" style={{ color: "#64748b" }}>{m.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Error events */}
      <Card>
        <div className="px-4 py-3 border-b" style={{ borderColor: "#1e2d45" }}>
          <span className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Error Events</span>
          <span className="ml-2 text-xs" style={{ color: "#64748b" }}>Last 24 hours</span>
        </div>
        <TableWrapper>
          <thead>
            <tr>
              <Th>Time</Th>
              <Th>Service</Th>
              <Th>Severity</Th>
              <Th>Message</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {EVENTS.map((ev, i) => (
              <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                <Td mono>{ev.time}</Td>
                <Td><span style={{ color: "#60a5fa" }}>{ev.service}</span></Td>
                <Td><Badge color={sevColor(ev.severity)}>{ev.severity}</Badge></Td>
                <Td><span style={{ color: "#94a3b8", fontSize: "13px" }}>{ev.message}</span></Td>
                <Td><Badge color={ev.status === "Active" ? "amber" : "green"}>{ev.status}</Badge></Td>
              </tr>
            ))}
          </tbody>
        </TableWrapper>
      </Card>
    </div>
  );
}
