import { useCallback, useEffect, useRef, useState } from 'react'
import type { ExportEstimate } from '@/features/export/ExportDialog'
import type { ExportSettings, ExportStatus } from '@/features/export/types'

export function mockEstimate(
  settings: ExportSettings,
  duration: number,
): ExportEstimate {
  const bits =
    (settings.videoBitrateKbps + settings.audioBitrateKbps) * 1000 * duration
  return { sizeBytes: bits / 8, seconds: Math.max(3, duration * 0.4) }
}

export function useMockExport() {
  const [status, setStatus] = useState<ExportStatus>({ phase: 'idle' })
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearInterval(timer.current), [])

  const start = useCallback(() => {
    let progress = 0
    setStatus({ phase: 'running', progress, etaSeconds: 20 })
    timer.current = window.setInterval(() => {
      progress += 0.04
      if (progress >= 1) {
        window.clearInterval(timer.current)
        setStatus({ phase: 'done', sizeBytes: 28_400_000 })
        return
      }
      setStatus({
        phase: 'running',
        progress,
        etaSeconds: Math.round((1 - progress) * 20),
      })
    }, 500)
  }, [])

  const cancel = useCallback(() => {
    window.clearInterval(timer.current)
    setStatus({ phase: 'cancelled' })
  }, [])

  return { status, start, cancel }
}
