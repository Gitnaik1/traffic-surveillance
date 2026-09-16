const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Active: { bg: '#2563eb18', text: '#3b82f6', dot: '#3b82f6' },
  Tracked: { bg: '#22c55e18', text: '#22c55e', dot: '#22c55e' },
  Completed: { bg: '#4a608018', text: '#8899bb', dot: '#8899bb' },
  Alert: { bg: '#ef444418', text: '#ef4444', dot: '#ef4444' },
  Verified: { bg: '#22c55e18', text: '#22c55e', dot: '#22c55e' },
  'Low Confidence': { bg: '#f59e0b18', text: '#f59e0b', dot: '#f59e0b' },
  Unreadable: { bg: '#ef444418', text: '#ef4444', dot: '#ef4444' },
  'Manual Review': { bg: '#8b5cf618', text: '#a78bfa', dot: '#a78bfa' },
}

export default function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] ?? { bg: '#1e2d4a', text: '#8899bb', dot: '#8899bb' }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.dot }} />
      {status}
    </span>
  )
}
