interface TopNavProps {
  title: string;
  subtitle: string;
}

export default function TopNav({ title, subtitle }: TopNavProps) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <header
      style={{
        height: 58,
        background: "#0d1420",
        borderBottom: "1px solid #1e2d45",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 16,
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Titles */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#f1f5f9",
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>
          {subtitle}
        </div>
      </div>

      {/* Live indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          borderRadius: 6,
          padding: "4px 10px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#10b981",
          }}
          className="live-blink"
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#10b981",
            fontFamily: "JetBrains Mono, monospace",
            letterSpacing: "0.06em",
          }}
        >
          LIVE
        </span>
      </div>

      {/* Clock */}
      <div
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 12,
          color: "#94a3b8",
          textAlign: "right",
        }}
      >
        <div style={{ color: "#f1f5f9", fontWeight: 500 }}>{timeStr}</div>
        <div style={{ fontSize: 10, color: "#64748b" }}>{dateStr}</div>
      </div>

      {/* Camera status */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "#141c2e",
          border: "1px solid #1e2d45",
          borderRadius: 6,
          padding: "6px 12px",
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#10b981",
          }}
        />
        <span style={{ fontSize: 11, color: "#94a3b8" }}>24 / 26 cameras</span>
      </div>

      {/* User */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #2563eb, #06b6d4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          color: "#fff",
          cursor: "pointer",
        }}
      >
        OP
      </div>
    </header>
  );
}
