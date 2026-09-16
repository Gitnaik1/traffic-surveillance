type Severity = "critical" | "high" | "medium" | "low" | "active" | "inactive" | "acknowledged" | "resolved" | "moderate" | "severe" | "warning" | "info";

const config: Record<Severity, { bg: string; color: string; border: string; label: string }> = {
  critical: { bg: "rgba(239,68,68,0.15)", color: "#f87171", border: "rgba(239,68,68,0.3)", label: "CRITICAL" },
  high: { bg: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "rgba(245,158,11,0.3)", label: "HIGH" },
  warning: { bg: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "rgba(245,158,11,0.3)", label: "WARNING" },
  medium: { bg: "rgba(6,182,212,0.15)", color: "#22d3ee", border: "rgba(6,182,212,0.3)", label: "MEDIUM" },
  info: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "rgba(59,130,246,0.3)", label: "INFO" },
  low: { bg: "rgba(148,163,184,0.12)", color: "#94a3b8", border: "rgba(148,163,184,0.2)", label: "LOW" },
  active: { bg: "rgba(16,185,129,0.15)", color: "#34d399", border: "rgba(16,185,129,0.3)", label: "ACTIVE" },
  inactive: { bg: "rgba(100,116,139,0.15)", color: "#94a3b8", border: "rgba(100,116,139,0.25)", label: "INACTIVE" },
  acknowledged: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "rgba(59,130,246,0.3)", label: "ACK" },
  resolved: { bg: "rgba(16,185,129,0.15)", color: "#34d399", border: "rgba(16,185,129,0.3)", label: "RESOLVED" },
  moderate: { bg: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "rgba(245,158,11,0.3)", label: "MODERATE" },
  severe: { bg: "rgba(239,68,68,0.15)", color: "#f87171", border: "rgba(239,68,68,0.3)", label: "SEVERE" },
};

interface BadgeProps {
  severity: Severity;
  label?: string;
}

export default function Badge({ severity, label }: BadgeProps) {
  const c = config[severity];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.08em",
        fontFamily: "JetBrains Mono, monospace",
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {label ?? c.label}
    </span>
  );
}
