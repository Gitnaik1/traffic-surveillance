import type { Page } from "../App";

const navItems: { id: Page | string; label: string; icon: string; isPage?: boolean }[] = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "live-cameras", label: "Live Cameras", icon: "◉" },
  { id: "vehicle-intelligence", label: "Vehicle Intelligence", icon: "◈" },
  { id: "anpr", label: "ANPR", icon: "⬢" },
  { id: "trajectories", label: "Trajectories", icon: "⟳" },
  { id: "traffic-analytics", label: "Traffic Analytics", icon: "▦" },
  { id: "alerts", label: "Alerts", icon: "⚑" },
  { id: "watchlist", label: "Watchlist", icon: "◎" },
  { id: "camera-management", label: "Camera Management", icon: "⊞", isPage: true },
  { id: "reports", label: "Reports", icon: "▤", isPage: true },
  { id: "system-health", label: "System Health", icon: "♡", isPage: true },
  { id: "settings", label: "Settings", icon: "⚙", isPage: true },
];

interface Props {
  activePage: Page;
  onNavigate: (p: Page) => void;
  open: boolean;
}

export default function Sidebar({ activePage, onNavigate, open }: Props) {
  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-30 flex flex-col w-60 shrink-0
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      style={{ background: "#0d1322", borderRight: "1px solid #1e2d45" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "#1e2d45" }}>
        <div
          className="w-8 h-8 rounded flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #3b82f6, #22d3ee)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" fillOpacity="0.9" />
            <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="#0d1322" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-bold tracking-wide" style={{ color: "#f1f5f9" }}>
            UrbanTrax<span style={{ color: "#3b82f6" }}> AI</span>
          </div>
          <div className="text-xs" style={{ color: "#64748b", fontFamily: "var(--font-mono)", fontSize: "10px" }}>
            SIH26127
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <div className="mb-1 px-3 py-1.5">
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#64748b" }}>
            Operations
          </span>
        </div>
        {navItems.slice(0, 8).map((item) => (
          <NavItem
            key={item.id}
            item={item}
            active={activePage === item.id}
            onClick={() => item.isPage && onNavigate(item.id as Page)}
            disabled={!item.isPage}
          />
        ))}
        <div className="mb-1 mt-3 px-3 py-1.5">
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#64748b" }}>
            Management
          </span>
        </div>
        {navItems.slice(8).map((item) => (
          <NavItem
            key={item.id}
            item={item}
            active={activePage === item.id}
            onClick={() => item.isPage && onNavigate(item.id as Page)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t" style={{ borderColor: "#1e2d45" }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22c55e" }} />
          <span className="text-xs" style={{ color: "#64748b", fontFamily: "var(--font-mono)" }}>
            All Systems Operational
          </span>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  item,
  active,
  onClick,
  disabled,
}: {
  item: { label: string; icon: string };
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 mb-0.5 group"
      style={{
        background: active ? "rgba(59,130,246,0.15)" : "transparent",
        borderLeft: active ? "2px solid #3b82f6" : "2px solid transparent",
        color: active ? "#60a5fa" : disabled ? "#334155" : "#94a3b8",
        cursor: disabled ? "default" : "pointer",
      }}
    >
      <span className="w-5 text-center text-sm leading-none shrink-0">{item.icon}</span>
      <span className="text-sm font-medium">{item.label}</span>
    </button>
  );
}
