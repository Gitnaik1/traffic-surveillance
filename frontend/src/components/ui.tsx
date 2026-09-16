import type { ReactNode, CSSProperties } from "react";

export function Card({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`rounded-xl border ${className}`}
      style={{ background: "#111827", borderColor: "#1e2d45", ...style }}
    >
      {children}
    </div>
  );
}

export function Badge({ color, children }: { color: "green" | "red" | "amber" | "blue" | "cyan" | "gray"; children: ReactNode }) {
  const palette = {
    green: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", text: "#22c55e" },
    red: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", text: "#ef4444" },
    amber: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", text: "#f59e0b" },
    blue: { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)", text: "#60a5fa" },
    cyan: { bg: "rgba(34,211,238,0.1)", border: "rgba(34,211,238,0.3)", text: "#22d3ee" },
    gray: { bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.3)", text: "#94a3b8" },
  }[color];

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border"
      style={{ background: palette.bg, borderColor: palette.border, color: palette.text }}
    >
      {children}
    </span>
  );
}

export function Dot({ color }: { color: "green" | "red" | "amber" | "blue" | "cyan" }) {
  const c = { green: "#22c55e", red: "#ef4444", amber: "#f59e0b", blue: "#3b82f6", cyan: "#22d3ee" }[color];
  return <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: c }} />;
}

export function KpiCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "#64748b" }}>{label}</span>
        {icon && <span style={{ color: accent ?? "#3b82f6" }}>{icon}</span>}
      </div>
      <div className="text-2xl font-bold" style={{ color: accent ?? "#f1f5f9", fontFamily: "var(--font-mono)" }}>
        {value}
      </div>
      {sub && <div className="text-xs" style={{ color: "#64748b" }}>{sub}</div>}
    </Card>
  );
}

export function TableWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
        {children}
      </table>
    </div>
  );
}

export function Th({ children }: { children: ReactNode }) {
  return (
    <th
      className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
      style={{ color: "#64748b", borderBottom: "1px solid #1e2d45", whiteSpace: "nowrap" }}
    >
      {children}
    </th>
  );
}

export function Td({ children, mono }: { children: ReactNode; mono?: boolean }) {
  return (
    <td
      className="px-4 py-3"
      style={{
        color: "#94a3b8",
        borderBottom: "1px solid #1a2236",
        fontFamily: mono ? "var(--font-mono)" : undefined,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </td>
  );
}

export function Btn({
  children,
  variant = "primary",
  size = "md",
  onClick,
  type = "button",
  className = "",
  disabled,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
}) {
  const base = "inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-150 cursor-pointer border";
  const sz = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const variants = {
    primary: { background: "#3b82f6", borderColor: "#3b82f6", color: "#fff" },
    secondary: { background: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.3)", color: "#60a5fa" },
    ghost: { background: "transparent", borderColor: "#1e2d45", color: "#94a3b8" },
    danger: { background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" },
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sz} ${className}`}
      style={{ ...variants, opacity: disabled ? 0.5 : 1 }}
    >
      {children}
    </button>
  );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex w-10 h-5.5 rounded-full transition-colors duration-200 shrink-0"
      style={{
        background: checked ? "#3b82f6" : "#1e2d45",
        width: "40px",
        height: "22px",
        border: "none",
        cursor: "pointer",
      }}
    >
      <span
        className="absolute top-0.5 rounded-full transition-transform duration-200"
        style={{
          background: "#fff",
          width: "18px",
          height: "18px",
          transform: checked ? "translateX(19px)" : "translateX(2px)",
        }}
      />
    </button>
  );
}

export function InputField({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: "#f1f5f9" }}>{label}</label>
      {children}
      {help && <p className="text-xs" style={{ color: "#64748b" }}>{help}</p>}
    </div>
  );
}

export function Input({
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
      style={{
        background: "#0b0f1a",
        border: "1px solid #1e2d45",
        color: "#f1f5f9",
        fontFamily: "var(--font-sans)",
      }}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
      style={{
        background: "#0b0f1a",
        border: "1px solid #1e2d45",
        color: "#f1f5f9",
        fontFamily: "var(--font-sans)",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "#f1f5f9" }}>{title}</h1>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
