import { useState } from 'react'
import { Icon } from '@iconify/react'
import { formatTimecode } from '@/shared/lib/timecode'
import { IconButton } from '@/shared/ui/icon-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import type { Seconds } from '@/features/timeline/types'

export interface PlaybackState {
  isPlaying: boolean
  currentTime: Seconds
  loop: boolean
}

export interface MonitorPanelProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  canvasWidth: number
  canvasHeight: number
  fps: number
  duration: Seconds
  playback: PlaybackState
  onPlayPause: () => void
  onStepFrame: (delta: -1 | 1) => void
  onJumpToStart: () => void
  onJumpToEnd: () => void
  onToggleLoop: (loop: boolean) => void
}

const ZOOM_OPTIONS = ['fit', '25', '50', '100'] as const
type MonitorZoom = (typeof ZOOM_OPTIONS)[number]

export function MonitorPanel({
  canvasRef,
  canvasWidth,
  canvasHeight,
  fps,
  duration,
  playback,
  onPlayPause,
  onStepFrame,
  onJumpToStart,
  onJumpToEnd,
  onToggleLoop,
}: MonitorPanelProps) {
  const [zoom, setZoom] = useState<MonitorZoom>('fit')
  const [safeArea, setSafeArea] = useState(false)
  const [grid, setGrid] = useState(false)

  const frameStyle =
    zoom === 'fit'
      ? { height: '100%', aspectRatio: `${canvasWidth} / ${canvasHeight}` }
      : {
          height: (canvasHeight * Number(zoom)) / 100,
          aspectRatio: `${canvasWidth} / ${canvasHeight}`,
        }

  return (
    <section
      aria-label="Program monitor"
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-sm"
    >
      <div className="flex h-11 shrink-0 items-center gap-1.5 border-b border-border px-3">
        <span className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground uppercase">
          Program
        </span>
        <div className="ml-auto flex items-center gap-1">
          <IconButton
            label="Safe area guides"
            pressed={safeArea}
            onClick={() => setSafeArea((value) => !value)}
            icon={<Icon icon="hugeicons:scan" className="size-4" />}
          />
          <IconButton
            label="Grid guides"
            pressed={grid}
            onClick={() => setGrid((value) => !value)}
            icon={<Icon icon="hugeicons:grid3x3" className="size-4" />}
          />
          <Select value={zoom} onValueChange={(v) => setZoom(v as MonitorZoom)}>
            <SelectTrigger
              aria-label="Monitor zoom"
              size="sm"
              className="h-9 w-20 text-[0.9rem]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fit">Fit</SelectItem>
              <SelectItem value="25">25%</SelectItem>
              <SelectItem value="50">50%</SelectItem>
              <SelectItem value="100">100%</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-surface-0 p-5">
        <div
          className="relative shrink-0 bg-black shadow-[0_0_0_1px_var(--border)]"
          style={frameStyle}
        >
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            role="img"
            aria-label="Program preview canvas"
            className="block h-full w-full"
          />
          {safeArea ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
            >
              <div className="absolute inset-[5%] border border-dashed border-white/80" />
              <div className="absolute inset-x-0 bottom-0 h-[20%] border-t border-dashed border-white/60 bg-white/5" />
              <div className="absolute inset-y-[20%] right-0 w-[14%] border-l border-dashed border-white/60 bg-white/5" />
            </div>
          ) : null}
          {grid ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgb(255_255_255/0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.35)_1px,transparent_1px)] [background-size:33.333%_20%]"
            />
          ) : null}
        </div>
      </div>

      <div
        role="toolbar"
        aria-label="Transport controls"
        className="flex h-14 shrink-0 items-center justify-between gap-2 border-t border-border px-3"
      >
        <div
          className="tabular text-[0.95rem] text-foreground"
          aria-label="Current time"
        >
          {formatTimecode(playback.currentTime, fps)}
        </div>
        <div className="flex items-center gap-1">
          <IconButton
            label="Jump to start"
            shortcut="Home"
            onClick={onJumpToStart}
            icon={<Icon icon="hugeicons:previous" className="size-4" />}
          />
          <IconButton
            label="Step back one frame"
            shortcut="←"
            onClick={() => onStepFrame(-1)}
            icon={<Icon icon="hugeicons:step-back" className="size-4" />}
          />
          <IconButton
            label={playback.isPlaying ? 'Pause' : 'Play'}
            shortcut="Space"
            variant="default"
            className="size-8"
            onClick={onPlayPause}
            icon={
              playback.isPlaying ? (
                <Icon icon="hugeicons:pause" className="size-4" />
              ) : (
                <Icon icon="hugeicons:play" className="size-4" />
              )
            }
          />
          <IconButton
            label="Step forward one frame"
            shortcut="→"
            onClick={() => onStepFrame(1)}
            icon={<Icon icon="hugeicons:step-forward" className="size-4" />}
          />
          <IconButton
            label="Jump to end"
            shortcut="End"
            onClick={onJumpToEnd}
            icon={<Icon icon="hugeicons:next" className="size-4" />}
          />
          <IconButton
            label="Loop playback"
            shortcut="Mod+L"
            pressed={playback.loop}
            onClick={() => onToggleLoop(!playback.loop)}
            icon={<Icon icon="hugeicons:repeat" className="size-4" />}
          />
        </div>
        <div
          className="tabular text-[0.95rem] text-muted-foreground"
          aria-label="Total duration"
        >
          {formatTimecode(duration, fps)}
        </div>
      </div>
    </section>
  )
}
