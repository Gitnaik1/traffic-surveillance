import { useState, useEffect } from "react";
import { Card, Badge, KpiCard, SectionHeader } from "../components/ui";
import { getSystemHealth } from "../services/api";
import type { SystemHealth as SystemHealthType } from "../services/api";

const sevColor = (s: string): "red" | "amber" | "blue" | "green" => {
  const lower = s.toLowerCase();
  if (lower === "degraded" || lower === "warning") return "amber";
  if (lower === "offline" || lower === "critical") return "red";
  if (lower === "healthy" || lower === "online") return "green";
  return "blue";
};

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#1e2d45" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
        />
      </div>
      <span className="text-xs w-10 text-right" style={{ color: "#94a3b8", fontFamily: "var(--font-mono)" }}>
        {value.toFixed(1)}%
      </span>
    </div>
  );
}

export default function SystemHealth() {
  const [healthData, setHealthData] = useState<SystemHealthType | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchHealth = async () => {
    try {
      const data = await getSystemHealth();
      setHealthData(data);
      setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch (err) {
      console.error("Failed to fetch system health:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !healthData) {
    return <div style={{ padding: "24px", color: "#94a3b8" }}>Loading system health...</div>;
  }

  // Use cached data if failed to load fresh
  if (!healthData) {
    return <div style={{ padding: "24px", color: "#ef4444" }}>Backend offline ΓÇö showing cached data</div>;
  }

  const { services, cameras, stats, resources } = healthData;
  const isHealthy = services.every((s) => s.status === "healthy") && cameras.offline === 0;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="System Health"
        subtitle="Monitor the health of AI processing and platform infrastructure."
        action={
          <div
            className="flex items-center gap-3 px-4 py-2 rounded-lg border"
            style={{ 
              background: isHealthy ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.08)", 
              borderColor: isHealthy ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.25)" 
            }}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${isHealthy ? 'animate-pulse' : ''}`} style={{ background: isHealthy ? "#22c55e" : "#f59e0b" }} />
            <div>
              <span className="text-sm font-semibold" style={{ color: isHealthy ? "#22c55e" : "#f59e0b" }}>
                {isHealthy ? "System Healthy" : "System Degraded"}
              </span>
              <span className="text-xs ml-2" style={{ color: "#64748b" }}>Updated {lastUpdated}</span>
            </div>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Services" value={services.length.toString()} sub={`${services.filter(s => s.status === 'healthy').length} healthy`} accent="#22c55e" />
        <KpiCard label="Active Cameras" value={cameras.online.toString()} sub={`of ${cameras.total} total`} accent="#60a5fa" />
        <KpiCard label="API Requests" value={stats.total_vehicles.toString()} sub="vehicles tracked" accent="#a855f7" />
        <KpiCard label="Active Alerts" value={stats.active_alerts.toString()} sub="unacknowledged" accent={stats.active_alerts > 0 ? "#ef4444" : "#22d3ee"} />
      </div>

      {/* Services */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>Registered Services</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {services.map((svc) => (
            <Card key={svc.name} className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: "#f1f5f9" }}>{svc.name}</span>
                <Badge color={sevColor(svc.status)}>{svc.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs" style={{ color: "#64748b" }}>Latency</div>
                  <div className="text-sm font-semibold" style={{ color: "#f1f5f9", fontFamily: "var(--font-mono)" }}>{svc.latency_ms}ms</div>
                </div>
                <div>
                  <div className="text-xs" style={{ color: "#64748b" }}>Uptime</div>
                  <div className="text-sm font-semibold" style={{ color: "#f1f5f9", fontFamily: "var(--font-mono)" }}>{svc.uptime_pct}%</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cameras Status Overview */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>Camera Fleet Status</p>
          <Card className="divide-y" style={{ borderColor: "#1e2d45" }}>
            <div className="flex items-center justify-between px-4 py-3.5" style={{ borderColor: "#1e2d45" }}>
              <div>
                <div className="text-sm font-medium" style={{ color: "#f1f5f9" }}>Total Registered</div>
                <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>All configured cameras</div>
              </div>
              <div className="text-lg font-bold" style={{ color: "#f1f5f9" }}>{cameras.total}</div>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5" style={{ borderColor: "#1e2d45" }}>
              <div>
                <div className="text-sm font-medium" style={{ color: "#f1f5f9" }}>Online Streaming</div>
                <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>Healthy RTSP feeds</div>
              </div>
              <Badge color="green">{cameras.online} Online</Badge>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5" style={{ borderColor: "#1e2d45" }}>
              <div>
                <div className="text-sm font-medium" style={{ color: "#f1f5f9" }}>Warning State</div>
                <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>High latency or drops</div>
              </div>
              <Badge color="amber">{cameras.warning} Warning</Badge>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5" style={{ borderColor: "#1e2d45" }}>
              <div>
                <div className="text-sm font-medium" style={{ color: "#f1f5f9" }}>Offline</div>
                <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>No heartbeat</div>
              </div>
              <Badge color={cameras.offline > 0 ? "red" : "green"}>{cameras.offline} Offline</Badge>
            </div>
          </Card>
        </div>

        {/* Resource monitoring */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>Hardware Resources</p>
          <Card className="p-4 flex flex-col gap-4">
            {[
              { label: "CPU Usage", value: resources.cpu_pct, color: resources.cpu_pct > 80 ? "#ef4444" : resources.cpu_pct > 60 ? "#f59e0b" : "#22c55e" },
              { label: "Memory Usage", value: resources.memory_pct, color: resources.memory_pct > 85 ? "#ef4444" : resources.memory_pct > 70 ? "#f59e0b" : "#22c55e" },
              { label: "GPU Usage", value: resources.gpu_pct, color: resources.gpu_pct > 90 ? "#ef4444" : "#3b82f6" },
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
                  { label: "Total ANPR Reads", value: stats.total_anpr_reads.toString(), unit: "" },
                  { label: "Disk Used", value: resources.disk_gb_used.toFixed(1), unit: "GB" },
                  { label: "Disk Total", value: resources.disk_gb_total.toFixed(0), unit: "GB" },
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
    </div>
  );
}
