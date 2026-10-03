import { formatDuration } from '@/shared/lib/timecode'
import type { Seconds } from './types'

interface TimeRulerProps {
  duration: Seconds
  pxPerSecond: number
  onSeek: (time: Seconds) => void
}

const MAJOR_STEPS = [1, 2, 5, 10, 15, 30, 60]

export function TimeRuler({ duration, pxPerSecond, onSeek }: TimeRulerProps) {
  const majorStep = MAJOR_STEPS.find((step) => step * pxPerSecond >= 64) ?? 60
  const majorCount = Math.ceil(duration / majorStep) + 1
  const width = duration * pxPerSecond

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    onSeek(Math.max(0, (event.clientX - rect.left) / pxPerSecond))
  }

  return (
    <div
      role="presentation"
      className="relative h-[var(--ruler-height)] cursor-text border-b border-border bg-surface-2"
      style={{ width }}
      onPointerDown={handlePointerDown}
    >
      {Array.from({ length: majorCount }, (_, i) => {
        const time = i * majorStep
        return (
          <div
            key={time}
            aria-hidden="true"
            className="absolute inset-y-0"
            style={{ left: time * pxPerSecond }}
          >
            <div className="absolute bottom-0 h-3 w-px bg-border-strong" />
            <span className="tabular absolute top-0.5 left-1 text-[0.7rem] text-muted-foreground">
              {formatDuration(time)}
            </span>
            {Array.from({ length: 3 }, (_, m) => (
              <div
                key={m}
                className="absolute bottom-0 h-1.5 w-px bg-border"
                style={{ left: ((m + 1) * majorStep * pxPerSecond) / 4 }}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
