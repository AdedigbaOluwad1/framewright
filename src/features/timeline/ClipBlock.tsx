import { memo } from 'react'
import { Icon } from '@iconify/react'
import { cn } from '@/shared/lib/utils'
import { formatDuration } from '@/shared/lib/timecode'
import { Waveform } from './Waveform'
import type {
  MediaAsset,
  TimelineItem,
  TimelineTool,
  Track,
  TrimEdge,
} from './types'

export interface ClipBlockProps {
  item: TimelineItem
  track: Track
  asset?: MediaAsset
  pxPerSecond: number
  selected: boolean
  tabbable: boolean
  tool: TimelineTool
  onSelect: (itemId: string, additive: boolean) => void
  onBeginMove: (item: TimelineItem, event: React.PointerEvent) => void
  onBeginTrim: (
    item: TimelineItem,
    edge: TrimEdge,
    event: React.PointerEvent,
  ) => void
  onKeyboardTrim: (itemId: string, edge: TrimEdge, deltaFrames: number) => void
  onKeyboardMove: (itemId: string, deltaFrames: number) => void
}

const KIND_STYLES = {
  video: 'bg-clip-video text-clip-video-fg',
  text: 'bg-clip-caption text-clip-caption-fg',
  audio: 'bg-clip-audio text-clip-audio-fg',
  music: 'bg-clip-music text-clip-music-fg',
} as const

const KIND_ICONS = {
  video: 'hugeicons:film-01',
  text: 'hugeicons:text-font',
  audio: 'hugeicons:audio-wave-01',
  music: 'hugeicons:music-note-01',
} as const

function itemLabel(item: TimelineItem): string {
  return item.kind === 'text' ? item.text : item.name
}

function ClipBlockView({
  item,
  track,
  asset,
  pxPerSecond,
  selected,
  tabbable,
  tool,
  onSelect,
  onBeginMove,
  onBeginTrim,
  onKeyboardTrim,
  onKeyboardMove,
}: ClipBlockProps) {
  const label = itemLabel(item)
  const muted = item.kind !== 'text' && item.muted
  const locked = track.locked

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const mod = event.metaKey || event.ctrlKey
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(item.id, event.shiftKey || mod)
      return
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const direction = event.key === 'ArrowLeft' ? -1 : 1
    if (event.altKey && !locked) {
      if (mod) onKeyboardTrim(item.id, 'in', direction)
      else if (event.shiftKey) onKeyboardTrim(item.id, 'out', direction)
      else onKeyboardMove(item.id, direction)
      return
    }
    const sibling =
      direction === 1
        ? event.currentTarget.nextElementSibling
        : event.currentTarget.previousElementSibling
    if (sibling instanceof HTMLElement) sibling.focus()
  }

  const showThumbnail = item.kind === 'video' && asset?.thumbnailUrl

  return (
    <div
      role="option"
      aria-selected={selected}
      aria-label={`${label}, ${track.name}, starts ${item.start.toFixed(1)} seconds, ${item.duration.toFixed(1)} seconds long${locked ? ', locked' : ''}${muted ? ', muted' : ''}`}
      tabIndex={tabbable ? 0 : -1}
      data-selected={selected || undefined}
      data-locked={locked || undefined}
      className={cn(
        'group absolute top-1.5 bottom-1.5 overflow-hidden rounded-[calc(var(--radius)*0.7)] border border-black/25 text-[0.8rem] leading-4 outline-none select-none',
        KIND_STYLES[track.kind],
        tool === 'razor'
          ? 'cursor-crosshair'
          : locked
            ? 'cursor-not-allowed'
            : 'cursor-grab',
        'hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-surface-1',
        'data-[selected]:z-[1] data-[selected]:ring-2 data-[selected]:ring-foreground',
        locked &&
          'opacity-70 [background-image:repeating-linear-gradient(135deg,transparent_0_6px,rgb(0_0_0/0.12)_6px_8px)]',
      )}
      style={{
        left: item.start * pxPerSecond,
        width: Math.max(4, item.duration * pxPerSecond),
      }}
      onClick={(event) =>
        onSelect(item.id, event.shiftKey || event.metaKey || event.ctrlKey)
      }
      onPointerDown={(event) => onBeginMove(item, event)}
      onKeyDown={handleKeyDown}
    >
      <div className="relative z-[1] flex h-6 items-center gap-1.5 px-2 font-medium">
        <Icon
          icon={KIND_ICONS[track.kind]}
          className="size-3.5 shrink-0"
          aria-hidden="true"
        />
        <span className="truncate">{label}</span>
        {muted ? (
          <Icon
            icon="hugeicons:volume-mute-01"
            className="size-3 shrink-0"
            aria-hidden="true"
          />
        ) : null}
        {locked ? (
          <Icon
            icon="hugeicons:square-lock-02"
            className="size-3 shrink-0"
            aria-hidden="true"
          />
        ) : null}
        <span className="tabular ml-auto shrink-0 opacity-80">
          {formatDuration(item.duration)}
        </span>
      </div>
      {item.kind === 'video' ? (
        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-x-0 bottom-0 h-[calc(100%-24px)]',
            !showThumbnail &&
              'opacity-40 [background-image:repeating-linear-gradient(90deg,currentColor_0_1px,transparent_1px_30px)]',
          )}
          style={
            showThumbnail
              ? {
                  backgroundImage: `url(${asset.thumbnailUrl})`,
                  backgroundSize: 'auto 100%',
                  backgroundRepeat: 'repeat-x',
                  opacity: 0.85,
                }
              : undefined
          }
        />
      ) : null}
      {item.kind === 'audio' ? (
        <Waveform
          seed={item.id}
          peaks={asset?.peaks}
          from={item.sourceIn}
          to={item.sourceOut}
        />
      ) : null}
      {!locked ? (
        <>
          <TrimHandle edge="in" item={item} onBeginTrim={onBeginTrim} />
          <TrimHandle edge="out" item={item} onBeginTrim={onBeginTrim} />
        </>
      ) : null}
    </div>
  )
}

function TrimHandle({
  edge,
  item,
  onBeginTrim,
}: {
  edge: TrimEdge
  item: TimelineItem
  onBeginTrim: ClipBlockProps['onBeginTrim']
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'absolute inset-y-0 z-[2] w-2 cursor-ew-resize bg-foreground/0 opacity-0 transition-opacity group-hover:bg-foreground/70 group-hover:opacity-100 group-data-[selected]:bg-foreground/70 group-data-[selected]:opacity-100 group-focus-visible:opacity-100',
        edge === 'in'
          ? 'left-0 rounded-l-[calc(var(--radius)*0.7)]'
          : 'right-0 rounded-r-[calc(var(--radius)*0.7)]',
      )}
      onPointerDown={(event) => onBeginTrim(item, edge, event)}
    />
  )
}

export const ClipBlock = memo(ClipBlockView)
