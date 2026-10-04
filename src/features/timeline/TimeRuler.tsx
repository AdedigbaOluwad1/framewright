import { formatDuration } from '@/shared/lib/timecode'
import type { Seconds } from './types'

interface TimeRulerProps {
  duration: Seconds
  pxPerSecond: number
  markIn: Seconds | null
  markOut: Seconds | null
}

const MAJOR_STEPS = [1, 2, 5, 10, 15, 30, 60]

export function TimeRuler({
  duration,
  pxPerSecond,
  markIn,
  markOut,
}: TimeRulerProps) {
  const majorStep = MAJOR_STEPS.find((step) => step * pxPerSecond >= 64) ?? 60
  const majorCount = Math.ceil(duration / majorStep) + 1
  const width = duration * pxPerSecond
  const rangeStart = markIn ?? 0
  const rangeEnd = markOut ?? duration

  return (
    <div
      role="presentation"
      className="relative h-[var(--ruler-height)] cursor-text overflow-hidden border-b border-border bg-surface-2"
      style={{ width }}
    >
      {markIn !== null || markOut !== null ? (
        <div
          aria-hidden="true"
          className="absolute inset-y-0 bg-accent-soft"
          style={{
            left: rangeStart * pxPerSecond,
            width: Math.max(2, (rangeEnd - rangeStart) * pxPerSecond),
          }}
        >
          {markIn !== null ? (
            <div className="absolute inset-y-0 left-0 w-0.5 bg-foreground" />
          ) : null}
          {markOut !== null ? (
            <div className="absolute inset-y-0 right-0 w-0.5 bg-foreground" />
          ) : null}
        </div>
      ) : null}
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
