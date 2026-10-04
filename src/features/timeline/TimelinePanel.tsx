import { useEffect, useMemo, useRef } from 'react'
import { formatTimecode } from '@/shared/lib/timecode'
import { ClipBlock } from './ClipBlock'
import { TimeRuler } from './TimeRuler'
import { TimelineToolbar } from './TimelineToolbar'
import { TrackHeader } from './TrackHeader'
import {
  useTimelineGestures,
  type GestureCallbacks,
} from './useTimelineGestures'
import type {
  MediaAsset,
  Seconds,
  TimelineDocument,
  TimelineTool,
  TrackToggle,
  TrimEdge,
} from './types'

export const TIMELINE_MIN_ZOOM = 8
export const TIMELINE_MAX_ZOOM = 160

export interface TimelinePanelProps extends Omit<GestureCallbacks, 'onSelect'> {
  doc: TimelineDocument
  media: MediaAsset[]
  playheadTime: Seconds
  isPlaying: boolean
  markIn: Seconds | null
  markOut: Seconds | null
  selectedIds: string[]
  tool: TimelineTool
  snapEnabled: boolean
  pxPerSecond: number
  canUndo: boolean
  canRedo: boolean
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
  onDelete: () => void
  onUndo: () => void
  onRedo: () => void
  onToggleTrack: (trackId: string, toggle: TrackToggle) => void
  onKeyboardTrim: (itemId: string, edge: TrimEdge, deltaFrames: number) => void
  onKeyboardMove: (itemId: string, deltaFrames: number) => void
}

const HEADER_WIDTH = 176
const TAIL_SECONDS = 8
const MIN_VISIBLE_SECONDS = 30

export function TimelinePanel({
  doc,
  media,
  playheadTime,
  isPlaying,
  markIn,
  markOut,
  selectedIds,
  tool,
  snapEnabled,
  pxPerSecond,
  canUndo,
  canRedo,
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
  onDelete,
  onUndo,
  onRedo,
  onToggleTrack,
  onKeyboardTrim,
  onKeyboardMove,
  onItemDrag,
  onItemTrim,
  onSplitAt,
}: TimelinePanelProps) {
  const visibleDuration = Math.max(
    doc.duration + TAIL_SECONDS,
    MIN_VISIBLE_SECONDS,
  )
  const laneWidth = visibleDuration * pxPerSecond
  const selected = useMemo(() => new Set(selectedIds), [selectedIds])
  const scrollRef = useRef<HTMLDivElement>(null)
  const rulerRef = useRef<HTMLDivElement>(null)
  const scrubbing = useRef(false)

  function handleSelect(itemId: string, additive: boolean) {
    if (!additive) return onSelectionChange([itemId])
    onSelectionChange(
      selected.has(itemId)
        ? selectedIds.filter((id) => id !== itemId)
        : [...selectedIds, itemId],
    )
  }

  const { snapGuide, beginMove, beginTrim } = useTimelineGestures({
    doc,
    pxPerSecond,
    snapEnabled,
    playheadTime,
    markIn,
    markOut,
    selectedIds,
    tool,
    onSelect: handleSelect,
    onItemDrag,
    onItemTrim,
    onSplitAt,
  })

  function timeFromPointer(clientX: number): Seconds {
    const rect = rulerRef.current?.getBoundingClientRect()
    if (!rect) return 0
    return Math.max(0, (clientX - rect.left) / pxPerSecond)
  }

  function handleScrubDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    scrubbing.current = true
    onSeek(timeFromPointer(event.clientX))
  }

  function handleScrubMove(event: React.PointerEvent<HTMLDivElement>) {
    if (scrubbing.current) onSeek(timeFromPointer(event.clientX))
  }

  function handleScrubUp() {
    scrubbing.current = false
  }

  function handlePlayheadKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowLeft') onStepFrame(-1)
    else if (event.key === 'ArrowRight') onStepFrame(1)
    else if (event.key === 'Home') onJumpToStart()
    else if (event.key === 'End') onJumpToEnd()
    else return
    event.preventDefault()
  }

  useEffect(() => {
    if (!isPlaying) return
    const container = scrollRef.current
    if (!container) return
    const x = playheadTime * pxPerSecond
    const viewStart = container.scrollLeft
    const viewEnd = container.scrollLeft + container.clientWidth - HEADER_WIDTH
    if (x > viewEnd - 40) container.scrollLeft = Math.max(0, x - 80)
    else if (x < viewStart) container.scrollLeft = Math.max(0, x - 80)
  }, [isPlaying, playheadTime, pxPerSecond])

  const playheadX = playheadTime * pxPerSecond

  return (
    <section
      aria-label="Timeline"
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-sm"
    >
      <TimelineToolbar
        tool={tool}
        snapEnabled={snapEnabled}
        pxPerSecond={pxPerSecond}
        minZoom={TIMELINE_MIN_ZOOM}
        maxZoom={TIMELINE_MAX_ZOOM}
        hasSelection={selectedIds.length > 0}
        canUndo={canUndo}
        canRedo={canRedo}
        onSelectTool={onSelectTool}
        onSplit={onSplit}
        onRippleDelete={onRippleDelete}
        onDelete={onDelete}
        onUndo={onUndo}
        onRedo={onRedo}
        onToggleSnap={onToggleSnap}
        onZoomChange={onZoomChange}
      />
      <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-auto">
        <div
          className="relative"
          style={{ width: HEADER_WIDTH + laneWidth, minWidth: '100%' }}
        >
          <div className="sticky top-0 z-20 flex">
            <div
              className="sticky left-0 z-30 flex shrink-0 items-center border-r border-b border-border bg-surface-2 px-2"
              style={{ width: HEADER_WIDTH, height: 'var(--ruler-height)' }}
            >
              <span className="tabular text-[0.8rem] text-muted-foreground">
                {formatTimecode(playheadTime, doc.fps)}
              </span>
            </div>
            <div
              ref={rulerRef}
              className="relative touch-none"
              onPointerDown={handleScrubDown}
              onPointerMove={handleScrubMove}
              onPointerUp={handleScrubUp}
              onPointerCancel={handleScrubUp}
            >
              <TimeRuler
                duration={visibleDuration}
                pxPerSecond={pxPerSecond}
                markIn={markIn}
                markOut={markOut}
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
                    if (event.target === event.currentTarget)
                      onSelectionChange([])
                  }}
                >
                  {items.map((item) => (
                    <ClipBlock
                      key={item.id}
                      item={item}
                      track={track}
                      asset={
                        item.kind === 'text'
                          ? undefined
                          : media.find((asset) => asset.id === item.mediaId)
                      }
                      pxPerSecond={pxPerSecond}
                      selected={selected.has(item.id)}
                      tabbable={item.id === tabbableId}
                      tool={tool}
                      onSelect={handleSelect}
                      onBeginMove={beginMove}
                      onBeginTrim={beginTrim}
                      onKeyboardTrim={onKeyboardTrim}
                      onKeyboardMove={onKeyboardMove}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {doc.items.length === 0 ? (
            <p
              className="pointer-events-none absolute z-[4] flex items-center gap-2 text-[0.9rem] text-muted-foreground"
              style={{
                left: HEADER_WIDTH + 24,
                top: 'calc(var(--ruler-height) + 20px)',
              }}
            >
              Double-click a clip in the Media panel, or drop files anywhere, to
              start your timeline.
            </p>
          ) : null}
          {snapGuide !== null ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 bottom-0 z-[6] w-px bg-foreground"
              style={{ left: HEADER_WIDTH + snapGuide * pxPerSecond }}
            />
          ) : null}
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
