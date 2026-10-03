import { useMemo } from 'react'
import { formatTimecode } from '@/shared/lib/timecode'
import { ClipBlock } from './ClipBlock'
import { TimeRuler } from './TimeRuler'
import { TimelineToolbar } from './TimelineToolbar'
import { TrackHeader } from './TrackHeader'
import type {
  Seconds,
  TimelineDocument,
  TimelineTool,
  TrackToggle,
  TrimEdge,
} from './types'

export const TIMELINE_MIN_ZOOM = 8
export const TIMELINE_MAX_ZOOM = 160

export interface TimelinePanelProps {
  doc: TimelineDocument
  playheadTime: Seconds
  selectedIds: string[]
  tool: TimelineTool
  snapEnabled: boolean
  pxPerSecond: number
  onSeek: (time: Seconds) => void
  onStepFrame: (delta: -1 | 1) => void
  onJumpToStart: () => void
  onJumpToEnd: () => void
  onSelectionChange: (itemIds: string[]) => void
  onSelectTool: (tool: TimelineTool) => void
  onToggleSnap: (enabled: boolean) => void
  onZoomChange: (pxPerSecond: number) => void
  onSplit: () => void
  onRippleDelete: () => void
  onToggleTrack: (trackId: string, toggle: TrackToggle) => void
  onClipPointerDown: (itemId: string, event: React.PointerEvent) => void
  onTrimHandlePointerDown: (
    itemId: string,
    edge: TrimEdge,
    event: React.PointerEvent,
  ) => void
  onKeyboardTrim: (itemId: string, edge: TrimEdge, deltaFrames: number) => void
  onKeyboardMove: (itemId: string, deltaFrames: number) => void
}

const HEADER_WIDTH = 148
const TAIL_SECONDS = 8

export function TimelinePanel({
  doc,
  playheadTime,
  selectedIds,
  tool,
  snapEnabled,
  pxPerSecond,
  onSeek,
  onStepFrame,
  onJumpToStart,
  onJumpToEnd,
  onSelectionChange,
  onSelectTool,
  onToggleSnap,
  onZoomChange,
  onSplit,
  onRippleDelete,
  onToggleTrack,
  onClipPointerDown,
  onTrimHandlePointerDown,
  onKeyboardTrim,
  onKeyboardMove,
}: TimelinePanelProps) {
  const visibleDuration = doc.duration + TAIL_SECONDS
  const laneWidth = visibleDuration * pxPerSecond
  const selected = useMemo(() => new Set(selectedIds), [selectedIds])

  function handleSelect(itemId: string, additive: boolean) {
    if (!additive) return onSelectionChange([itemId])
    onSelectionChange(
      selected.has(itemId)
        ? selectedIds.filter((id) => id !== itemId)
        : [...selectedIds, itemId],
    )
  }

  function handlePlayheadKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowLeft') onStepFrame(-1)
    else if (event.key === 'ArrowRight') onStepFrame(1)
    else if (event.key === 'Home') onJumpToStart()
    else if (event.key === 'End') onJumpToEnd()
    else return
    event.preventDefault()
  }

  const playheadX = playheadTime * pxPerSecond

  return (
    <section
      aria-label="Timeline"
      className="flex h-full min-h-0 flex-col bg-surface-1"
    >
      <TimelineToolbar
        tool={tool}
        snapEnabled={snapEnabled}
        pxPerSecond={pxPerSecond}
        minZoom={TIMELINE_MIN_ZOOM}
        maxZoom={TIMELINE_MAX_ZOOM}
        hasSelection={selectedIds.length > 0}
        onSelectTool={onSelectTool}
        onSplit={onSplit}
        onRippleDelete={onRippleDelete}
        onToggleSnap={onToggleSnap}
        onZoomChange={onZoomChange}
      />
      <div className="relative min-h-0 flex-1 overflow-auto">
        <div
          className="relative"
          style={{ width: HEADER_WIDTH + laneWidth, minWidth: '100%' }}
        >
          <div className="sticky top-0 z-20 flex">
            <div
              className="sticky left-0 z-30 flex shrink-0 items-center border-r border-b border-border bg-surface-2 px-2"
              style={{ width: HEADER_WIDTH, height: 'var(--ruler-height)' }}
            >
              <span className="tabular text-[11px] text-muted-foreground">
                {formatTimecode(playheadTime, doc.fps)}
              </span>
            </div>
            <div className="relative">
              <TimeRuler
                duration={visibleDuration}
                pxPerSecond={pxPerSecond}
                onSeek={onSeek}
              />
              <div
                role="slider"
                tabIndex={0}
                aria-label="Playhead"
                aria-orientation="horizontal"
                aria-valuemin={0}
                aria-valuemax={doc.duration}
                aria-valuenow={playheadTime}
                aria-valuetext={formatTimecode(playheadTime, doc.fps)}
                className="absolute top-0 z-10 h-[var(--ruler-height)] w-4 -translate-x-1/2 cursor-ew-resize outline-none"
                style={{ left: playheadX }}
                onKeyDown={handlePlayheadKeyDown}
              >
                <div className="mx-auto mt-0.5 h-3 w-3 rounded-b-sm bg-playhead [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]" />
              </div>
            </div>
          </div>

          {doc.tracks.map((track) => {
            const items = doc.items
              .filter((item) => item.trackId === track.id)
              .sort((a, b) => a.start - b.start)
            const tabbableId =
              items.find((item) => selected.has(item.id))?.id ?? items[0]?.id
            return (
              <div
                key={track.id}
                className="flex"
                style={{ height: 'var(--track-height)' }}
              >
                <div
                  className="sticky left-0 z-10 shrink-0"
                  style={{ width: HEADER_WIDTH }}
                >
                  <TrackHeader track={track} onToggle={onToggleTrack} />
                </div>
                <div
                  role="listbox"
                  aria-multiselectable="true"
                  aria-label={`${track.name} clips`}
                  className="relative border-b border-border bg-surface-0/60"
                  style={{ width: laneWidth }}
                  onPointerDown={(event) => {
                    if (event.target === event.currentTarget) {
                      onSelectionChange([])
                    }
                  }}
                >
                  {items.map((item) => (
                    <ClipBlock
                      key={item.id}
                      item={item}
                      track={track}
                      pxPerSecond={pxPerSecond}
                      selected={selected.has(item.id)}
                      tabbable={item.id === tabbableId}
                      tool={tool}
                      onSelect={handleSelect}
                      onPointerDown={onClipPointerDown}
                      onTrimHandlePointerDown={onTrimHandlePointerDown}
                      onKeyboardTrim={onKeyboardTrim}
                      onKeyboardMove={onKeyboardMove}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 bottom-0 z-[5] w-px bg-playhead"
            style={{ left: HEADER_WIDTH + playheadX }}
          />
        </div>
      </div>
    </section>
  )
}
