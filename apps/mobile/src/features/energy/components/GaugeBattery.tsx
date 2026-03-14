import { useState, useEffect, useMemo, type FC } from 'react'

interface GaugeProps {
  capacity: number
  current: number
  label?: string
}

const GaugeBattery: FC<GaugeProps> = ({ capacity = 100, current = 75, label }) => {
  const [animatedFill, setAnimatedFill] = useState(0)
  const percentage = Math.max(0, Math.min(100, (current / capacity) * 100))

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedFill(percentage), 80)
    return () => clearTimeout(timeout)
  }, [percentage])

  const { color, glow, bg, label: levelLabel } = useMemo(() => {
    if (percentage <= 10)
      return { color: '#ef4444', glow: 'rgba(239,68,68,0.4)',   bg: 'rgba(239,68,68,0.08)',  label: 'Kritisk' }
    if (percentage <= 25)
      return { color: '#f97316', glow: 'rgba(249,115,22,0.35)', bg: 'rgba(249,115,22,0.07)', label: 'Lav' }
    if (percentage <= 50)
      return { color: '#eab308', glow: 'rgba(234,179,8,0.3)',   bg: 'rgba(234,179,8,0.06)',  label: 'Middels' }
    if (percentage <= 75)
      return { color: '#22c55e', glow: 'rgba(34,197,94,0.3)',   bg: 'rgba(34,197,94,0.06)',  label: 'Bra' }
    return   { color: '#10b981', glow: 'rgba(16,185,129,0.35)', bg: 'rgba(16,185,129,0.07)', label: 'Full' }
  }, [percentage])

  return (
    <div className="flex flex-col items-center gap-5 select-none pt-4">
      {label && (
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
          {label}
        </p>
      )}

      <div className="relative flex flex-row items-center">
        <div
          className="relative h-24 rounded-2xl overflow-hidden"
          style={{
            width: '300px',
            background: '#0c0c0f',
            border: '2px solid rgba(255,255,255,0.06)',
            boxShadow: `0 0 40px ${glow}, inset 0 0 30px rgba(0,0,0,0.5)`,
          }}
        >
          <div
            className="absolute inset-1 rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div
              className="absolute bottom-0 left-0 top-0"
              style={{
                width: `${animatedFill}%`,
                transition: 'width 1s cubic-bezier(0.22, 1, 0.36, 1)',
                background: `linear-gradient(to right, ${color}dd, ${color})`,
                boxShadow: `0 -6px 24px ${glow}, inset 0 1px 12px rgba(255,255,255,0.12)`,
              }}
            >
              <div
                className="absolute top-0 left-0 bottom-0 h-0.5"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              />
            </div>
          </div>
        </div>
        <div
          className="h-10 w-3.5 rounded-r-md"
          style={{
            background: `linear-gradient(to right, ${color}44, ${color}22)`,
            border: `2px solid ${color}33`,
            borderBottom: 'none',
          }}
        />
      </div>

      <div className="flex flex-row items-center gap-2.5">
        <div className="text-center">
          <span
            className="text-2xl font-black tabular-nums"
            style={{
              fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', monospace",
              color,
              textShadow: `0 0 18px ${glow}`,
            }}
          >
            {current}
          </span>
          <span className="text-muted-foreground/60 text-base font-medium mx-1">/</span>
          <span
            className="text-base font-bold tabular-nums text-muted-foreground"
            style={{ fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', monospace" }}
          >
            {capacity}
          </span>
        </div>
        <div
          className="px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]"
          style={{ color, background: bg, border: `1px solid ${color}33` }}
        >
          {levelLabel}
        </div>
      </div>
    </div>
  )
}

export default GaugeBattery
