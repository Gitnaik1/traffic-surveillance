interface Props {
  value: number | string
  label?: boolean
}

export default function ConfidenceBadge({ value, label = true }: Props) {
  const num = typeof value === 'string' ? parseFloat(value) : value

  const color =
    num >= 85 ? '#22c55e' : num >= 65 ? '#f59e0b' : '#ef4444'
  const tier = num >= 85 ? 'High' : num >= 65 ? 'Medium' : 'Low'

  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-mono font-medium"
      style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      {num.toFixed(1)}%{label && <span className="opacity-60 text-xs"> {tier}</span>}
    </span>
  )
}
