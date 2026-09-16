import { useState, useEffect } from 'react';

interface TopNavProps {
  title: string;
  subtitle?: string;
  alertCount?: number;
}

export default function TopNav({ title, subtitle, alertCount = 12 }: TopNavProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
  const dateStr = time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <header className="flex items-center gap-4 px-5 border-b border-[#1a2a40] bg-[#070c17] min-h-[56px]">
      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-[#e2eaf3] leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-[10px] text-[#4d607a] mt-0.5 leading-none">{subtitle}</p>
        )}
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-[#0c1525] border border-[#1a2a40] rounded-md px-3 py-1.5 w-56">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 text-[#4d607a] flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search cameras, plates..."
          className="bg-transparent text-[11px] text-[#8899b4] placeholder-[#2a3a50] outline-none w-full"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
        <kbd className="text-[8px] text-[#2a3a50] border border-[#1a2a40] rounded px-1 font-mono">⌘K</kbd>
      </div>

      {/* Status pill */}
      <div className="hidden lg:flex items-center gap-1.5 bg-[#0a1a0e] border border-[#1a3a20] rounded-full px-3 py-1">
        <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse-green" />
        <span className="text-[10px] text-[#22c55e] font-mono">SYSTEM NOMINAL</span>
      </div>

      {/* Alerts bell */}
      <button className="relative p-1.5 text-[#4d607a] hover:text-[#8899b4] transition-colors">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {alertCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#ef4444] flex items-center justify-center text-[8px] text-white font-bold">
            {alertCount}
          </span>
        )}
      </button>

      {/* Date / time */}
      <div className="hidden sm:flex flex-col items-end">
        <span className="text-xs text-[#c8d6e8] font-mono tabular-nums">{timeStr}</span>
        <span className="text-[9px] text-[#4d607a]">{dateStr}</span>
      </div>

      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-[#1a2a40] border border-[#243348] flex items-center justify-center cursor-pointer">
        <span className="text-[10px] text-[#60a5fa] font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>AK</span>
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
