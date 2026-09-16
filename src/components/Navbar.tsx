import { useState, useEffect } from 'react'
import { Search, Bell, CheckCircle, User } from 'lucide-react'

interface Props {
  title: string
  subtitle: string
}

export default function Navbar({ title, subtitle }: Props) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <header
      className="flex items-center gap-4 px-6 py-3 border-b shrink-0"
      style={{ backgroundColor: '#0f1629', borderColor: '#1e2d4a' }}
    >
      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold truncate" style={{ color: '#f0f4ff' }}>
          {title}
        </h1>
        <p className="text-xs truncate" style={{ color: '#4a6080' }}>
          {subtitle}
        </p>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded border w-48"
        style={{ backgroundColor: '#141c30', borderColor: '#1e2d4a' }}
      >
        <Search size={12} color="#4a6080" />
        <input
          className="bg-transparent text-xs outline-none w-full placeholder:text-xs"
          style={{ color: '#8899bb' }}
          placeholder="Global search..."
        />
      </div>

      {/* System status */}
      <div className="flex items-center gap-1.5">
        <CheckCircle size={12} color="#22c55e" />
        <span className="text-xs font-medium" style={{ color: '#22c55e' }}>
          All Systems Online
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-4" style={{ backgroundColor: '#1e2d4a' }} />

      {/* Notifications */}
      <button className="relative" style={{ color: '#4a6080' }}>
        <Bell size={16} />
        <span
          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: '#ef4444', fontSize: '9px' }}
        >
          3
        </span>
      </button>

      {/* Timestamp */}
      <div
        className="text-xs font-mono tabular-nums"
        style={{ color: '#4a6080', fontFamily: "'JetBrains Mono', monospace" }}
      >
        {time.toLocaleTimeString('en-IN', { hour12: false })}
      </div>

      {/* Profile */}
      <div
        className="flex items-center justify-center w-7 h-7 rounded-full border"
        style={{ backgroundColor: '#1a2440', borderColor: '#253656' }}
      >
        <User size={13} color="#8899bb" />
      </div>
    </header>
  )
}
