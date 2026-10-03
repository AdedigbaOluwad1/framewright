import { Icon } from '@iconify/react'
import { IconButton } from '@/shared/ui/icon-button'
import { Separator } from '@/shared/ui/separator'
import { Slider } from '@/shared/ui/slider'
import type { TimelineTool } from './types'

interface TimelineToolbarProps {
  tool: TimelineTool
  snapEnabled: boolean
  pxPerSecond: number
  minZoom: number
  maxZoom: number
  hasSelection: boolean
  onSelectTool: (tool: TimelineTool) => void
  onSplit: () => void
  onRippleDelete: () => void
  onToggleSnap: (enabled: boolean) => void
  onZoomChange: (pxPerSecond: number) => void
}

export function TimelineToolbar({
  tool,
  snapEnabled,
  pxPerSecond,
  minZoom,
  maxZoom,
  hasSelection,
  onSelectTool,
  onSplit,
  onRippleDelete,
  onToggleSnap,
  onZoomChange,
}: TimelineToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Timeline tools"
      className="flex h-11 shrink-0 items-center gap-1 border-b border-border bg-surface-1 px-3"
    >
      <IconButton
        label="Select tool"
        shortcut="V"
        pressed={tool === 'select'}
        onClick={() => onSelectTool('select')}
        icon={<Icon icon="hugeicons:cursor-01" className="size-4" />}
      />
      <IconButton
        label="Razor tool"
        shortcut="C"
        pressed={tool === 'razor'}
        onClick={() => onSelectTool('razor')}
        icon={<Icon icon="hugeicons:knife-01" className="size-4" />}
      />
      <Separator orientation="vertical" className="mx-2 h-6" />
      <IconButton
        label="Split at playhead"
        shortcut="S"
        onClick={onSplit}
        icon={<Icon icon="hugeicons:scissor" className="size-4" />}
      />
      <IconButton
        label="Ripple delete"
        shortcut="Shift+Delete"
        disabled={!hasSelection}
        onClick={onRippleDelete}
        icon={<Icon icon="hugeicons:delete-02" className="size-4" />}
      />
      <Separator orientation="vertical" className="mx-2 h-6" />
      <IconButton
        label="Snapping"
        shortcut="N"
        pressed={snapEnabled}
        onClick={() => onToggleSnap(!snapEnabled)}
        icon={<Icon icon="hugeicons:magnet-01" className="size-4" />}
      />
      <div className="ml-auto flex items-center gap-2">
        <IconButton
          label="Zoom timeline out"
          shortcut="-"
          onClick={() => onZoomChange(Math.max(minZoom, pxPerSecond / 1.25))}
          icon={<Icon icon="hugeicons:zoom-out" className="size-4" />}
        />
        <Slider
          aria-label="Timeline zoom"
          className="w-28"
          min={minZoom}
          max={maxZoom}
          step={1}
          value={[pxPerSecond]}
          onValueChange={([value]) => onZoomChange(value)}
        />
        <IconButton
          label="Zoom timeline in"
          shortcut="+"
          onClick={() => onZoomChange(Math.min(maxZoom, pxPerSecond * 1.25))}
          icon={<Icon icon="hugeicons:zoom-in" className="size-4" />}
        />
      </div>
    </div>
  )
}
