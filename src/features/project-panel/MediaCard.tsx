import { AudioLines, Film, Image as ImageIcon, Plus } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/shared/ui/context-menu'
import { formatBytes, formatDuration } from '@/shared/lib/timecode'
import type { MediaAsset } from '@/features/timeline/types'

interface MediaCardProps {
  asset: MediaAsset
  onAddToTimeline: (mediaId: string) => void
}

const ICONS = { video: Film, audio: AudioLines, image: ImageIcon } as const

export function MediaCard({ asset, onAddToTimeline }: MediaCardProps) {
  const Icon = ICONS[asset.kind]
  const meta =
    asset.width && asset.height
      ? `${asset.width}×${asset.height} · ${formatBytes(asset.sizeBytes)}`
      : formatBytes(asset.sizeBytes)

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${asset.name}, ${asset.kind}, ${formatDuration(asset.duration)}. Press Enter to add to timeline`}
          className="group flex flex-col gap-1 rounded-[var(--radius)] border border-border bg-surface-2 p-1 text-left hover:bg-accent-soft focus-visible:outline-2"
          onDoubleClick={() => onAddToTimeline(asset.id)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onAddToTimeline(asset.id)
          }}
        >
          <div className="relative flex aspect-video items-center justify-center rounded-[calc(var(--radius)-2px)] bg-surface-0 text-muted-foreground">
            <Icon className="size-6" aria-hidden="true" />
            <Badge
              variant="secondary"
              className="tabular absolute right-1 bottom-1 h-4 rounded px-1 text-[10px]"
            >
              {formatDuration(asset.duration)}
            </Badge>
          </div>
          <span className="truncate px-0.5 text-[12px] font-medium">
            {asset.name}
          </span>
          <span className="truncate px-0.5 text-[11px] text-muted-foreground">
            {meta}
          </span>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => onAddToTimeline(asset.id)}>
          <Plus aria-hidden="true" /> Add to timeline
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
