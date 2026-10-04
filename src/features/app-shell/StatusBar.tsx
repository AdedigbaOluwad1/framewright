import { Icon } from '@iconify/react'
import { Badge } from '@/shared/ui/badge'
import { formatBytes } from '@/shared/lib/timecode'
import type { Capabilities } from '@/engine/capabilities'
import type { SaveStatus } from '@/storage/projectStorage'

interface StatusBarProps {
  capabilities: Capabilities | null
  saveStatus: SaveStatus
  timelineZoomPercent: number
  onOpenDiagnostics: () => void
}

const ENGINE_LABEL = {
  webcodecs: 'WebCodecs',
  'ffmpeg-wasm': 'ffmpeg.wasm',
} as const

function saveLabel(status: SaveStatus): string {
  if (status.state === 'saving') return 'Saving…'
  if (status.state === 'error') return 'Save failed'
  if (status.state === 'saved' && status.at) {
    return `Saved ${new Date(status.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }
  return 'Not saved yet'
}

export function StatusBar({
  capabilities,
  saveStatus,
  timelineZoomPercent,
  onOpenDiagnostics,
}: StatusBarProps) {
  const isolated = capabilities?.crossOriginIsolated ?? false
  const storage = capabilities?.storage
  return (
    <footer
      aria-label="Status bar"
      className="flex h-8 shrink-0 items-center gap-3 px-4 text-[0.8rem] text-muted-foreground"
    >
      <button
        type="button"
        onClick={onOpenDiagnostics}
        className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open diagnostics"
      >
        <Badge
          variant="outline"
          className="h-5 gap-1 rounded px-1.5 text-[0.8rem] text-foreground"
        >
          <Icon icon="hugeicons:cpu" className="size-3" aria-hidden="true" />
          Engine:{' '}
          {capabilities ? ENGINE_LABEL[capabilities.engine] : 'Detecting…'}
        </Badge>
        <Badge
          variant="outline"
          className="h-5 gap-1 rounded px-1.5 text-[0.8rem] text-foreground"
        >
          <Icon
            icon={
              isolated
                ? 'hugeicons:checkmark-circle-02'
                : 'hugeicons:cancel-circle'
            }
            className={isolated ? 'size-3 text-success' : 'size-3 text-warning'}
            aria-hidden="true"
          />
          Cross-origin isolated: {isolated ? 'yes' : 'no'}
        </Badge>
      </button>
      {storage ? (
        <span className="flex items-center gap-1">
          <Icon
            icon="hugeicons:memory-stick"
            className="size-3"
            aria-hidden="true"
          />
          Storage: {formatBytes(storage.usage)} of {formatBytes(storage.quota)}
        </span>
      ) : null}
      <span role="status" className="ml-auto">
        {saveLabel(saveStatus)}
      </span>
      <span className="tabular">Timeline zoom {timelineZoomPercent}%</span>
    </footer>
  )
}
