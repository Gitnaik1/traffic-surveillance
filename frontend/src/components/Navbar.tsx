import { useState, useEffect } from "react";

interface Props {
  title: string;
  onMenuClick: () => void;
}

export default function Navbar({ title, onMenuClick }: Props) {
  const [time, setTime] = useState(new Date());
  const [notifications] = useState(3);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const fmtDate = time.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  return (
    <header
      className="flex items-center gap-4 px-4 lg:px-6 py-3 shrink-0 border-b"
      style={{ background: "#0d1322", borderColor: "#1e2d45", minHeight: "56px" }}
    >
      {/* Menu (mobile) */}
      <button
        className="lg:hidden p-1.5 rounded"
        style={{ color: "#94a3b8" }}
        onClick={onMenuClick}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
          <rect y="2" width="18" height="2" rx="1" />
          <rect y="8" width="18" height="2" rx="1" />
          <rect y="14" width="18" height="2" rx="1" />
        </svg>
      </button>

      {/* Title */}
      <div className="font-semibold text-base" style={{ color: "#f1f5f9" }}>{title}</div>

      {/* Search */}
      <div className="flex-1 max-w-xs ml-2 hidden md:block">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: "#111827", border: "1px solid #1e2d45" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="#64748b" strokeWidth="1.5" />
            <path d="M9.5 9.5L12 12" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Global search..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-slate-600"
            style={{ color: "#94a3b8", fontFamily: "var(--font-sans)" }}
          />
        </div>
      </div>

      <div className="flex-1" />

      {/* System status */}
      <div
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
        style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}
      >
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e" }} />
        <span className="text-xs font-medium" style={{ color: "#22c55e" }}>System Online</span>
      </div>

      {/* Notification */}
      <button className="relative p-2 rounded-lg" style={{ color: "#94a3b8" }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 2a5 5 0 0 0-5 5v3l-1.5 2H15.5L14 10V7a5 5 0 0 0-5-5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M7.5 15.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {notifications > 0 && (
          <span
            className="absolute top-1 right-1 w-4 h-4 rounded-full text-white flex items-center justify-center"
            style={{ background: "#ef4444", fontSize: "9px", fontWeight: 700 }}
          >
            {notifications}
          </span>
        )}
      </button>

      {/* DateTime */}
      <div className="hidden lg:flex flex-col items-end">
        <span className="text-xs font-medium" style={{ color: "#f1f5f9", fontFamily: "var(--font-mono)" }}>{fmt}</span>
        <span className="text-xs" style={{ color: "#64748b" }}>{fmtDate}</span>
      </div>

      {/* Profile */}
      <div className="flex items-center gap-2 pl-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: "linear-gradient(135deg, #3b82f6, #22d3ee)", color: "#fff" }}
        >
          OP
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-medium" style={{ color: "#f1f5f9" }}>Operator</span>
          <span className="text-xs" style={{ color: "#64748b" }}>Admin</span>
        </div>
      </div>
    </header>
  );
}
