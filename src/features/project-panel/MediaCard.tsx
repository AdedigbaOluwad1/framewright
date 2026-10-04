import { Icon } from '@iconify/react'
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
  onAddToTimeline: (mediaId: string, track?: 'audio' | 'music') => void
}

const ICONS = {
  video: 'hugeicons:film-01',
  audio: 'hugeicons:audio-wave-01',
  image: 'hugeicons:image-01',
} as const

export function MediaCard({ asset, onAddToTimeline }: MediaCardProps) {
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
          className="group flex w-full min-w-0 flex-col gap-1.5 rounded-xl border border-border bg-surface-2 p-1.5 text-left hover:bg-accent-soft focus-visible:outline-2"
          onDoubleClick={() => onAddToTimeline(asset.id)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onAddToTimeline(asset.id)
          }}
        >
          <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-surface-0 text-muted-foreground">
            {asset.thumbnailUrl ? (
              <img
                src={asset.thumbnailUrl}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <Icon
                icon={ICONS[asset.kind]}
                className="size-7"
                aria-hidden="true"
              />
            )}
            <Badge
              variant="secondary"
              className="tabular absolute right-1 bottom-1 h-5 rounded-md px-1.5 text-[0.7rem]"
            >
              {formatDuration(asset.duration)}
            </Badge>
          </div>
          <span className="truncate px-0.5 text-[0.9rem] font-medium">
            {asset.name}
          </span>
          <span className="truncate px-0.5 text-[0.8rem] text-muted-foreground">
            {meta}
          </span>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => onAddToTimeline(asset.id)}>
          <Icon icon="hugeicons:add-01" aria-hidden="true" /> Add to timeline
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
