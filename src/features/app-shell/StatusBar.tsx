import { CheckCircle2, Cpu, MemoryStick, XCircle } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import type { Diagnostics } from './types'

interface StatusBarProps {
  diagnostics: Diagnostics
  timelineZoomPercent: number
}

const ENGINE_LABEL = {
  webcodecs: 'WebCodecs',
  'ffmpeg-wasm': 'ffmpeg.wasm',
} as const

export function StatusBar({
  diagnostics,
  timelineZoomPercent,
}: StatusBarProps) {
  const isolated = diagnostics.crossOriginIsolated
  return (
    <footer
      aria-label="Status bar"
      className="flex h-8 shrink-0 items-center gap-3 px-4 text-[0.8rem] text-muted-foreground"
    >
      <Badge
        variant="outline"
        className="h-4 gap-1 rounded px-1.5 text-[0.8rem] text-foreground"
      >
        <Cpu className="size-3" aria-hidden="true" />
        Engine: {ENGINE_LABEL[diagnostics.engine]}
      </Badge>
      <Badge
        variant="outline"
        className="h-4 gap-1 rounded px-1.5 text-[0.8rem] text-foreground"
      >
        {isolated ? (
          <CheckCircle2 className="size-3 text-success" aria-hidden="true" />
        ) : (
          <XCircle className="size-3 text-warning" aria-hidden="true" />
        )}
        Cross-origin isolated: {isolated ? 'yes' : 'no'}
      </Badge>
      <span className="flex items-center gap-1">
        <MemoryStick className="size-3" aria-hidden="true" />
        {diagnostics.memoryHint}
      </span>
      <span className="tabular ml-auto">
        Timeline zoom {timelineZoomPercent}%
      </span>
    </footer>
  )
}
