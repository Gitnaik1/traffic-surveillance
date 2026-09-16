interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "live-cameras", label: "Live Cameras", icon: "◉" },
  { id: "vehicle-intelligence", label: "Vehicle Intelligence", icon: "◈" },
  { id: "anpr", label: "ANPR", icon: "▣" },
  { id: "trajectories", label: "Trajectories", icon: "↗" },
  { id: "traffic-analytics", label: "Traffic Analytics", icon: "▲" },
  { id: "alerts", label: "Alerts", icon: "⚠" },
  { id: "watchlist", label: "Watchlist", icon: "◎" },
  { id: "camera-management", label: "Camera Management", icon: "⊕" },
  { id: "reports", label: "Reports", icon: "≡" },
  { id: "system-health", label: "System Health", icon: "♡" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        background: "#0d1420",
        borderRight: "1px solid #1e2d45",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 18px 16px",
          borderBottom: "1px solid #1e2d45",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #2563eb, #06b6d4)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              fontFamily: "JetBrains Mono, monospace",
              flexShrink: 0,
            }}
          >
            UT
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#f1f5f9",
                letterSpacing: "0.02em",
                lineHeight: 1.2,
              }}
            >
              UrbanTrax AI
            </div>
            <div
              style={{
                fontSize: 9,
                color: "#64748b",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              SIH26127
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {navItems.map((item) => {
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "8px 10px",
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
                background: active
                  ? "rgba(37, 99, 235, 0.18)"
                  : "transparent",
                color: active ? "#60a5fa" : "#64748b",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                textAlign: "left",
                marginBottom: 2,
                transition: "all 0.15s",
                borderLeft: active ? "2px solid #2563eb" : "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(37, 99, 235, 0.08)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
                }
              }}
            >
              <span
                style={{
                  width: 18,
                  textAlign: "center",
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
              {item.id === "alerts" && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 10,
                    padding: "1px 6px",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  5
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Status */}
      <div
        style={{
          padding: "12px 18px",
          borderTop: "1px solid #1e2d45",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 6px #10b981",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 11, color: "#64748b" }}>
            All systems operational
          </span>
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 10,
            color: "#475569",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          v2.4.1 · 24 cameras online
        </div>
      </div>
    </aside>
  );
}
