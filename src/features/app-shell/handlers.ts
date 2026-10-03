import type { ExportSettings } from '@/features/export/types'
import type {
  FitMode,
  Seconds,
  TimelineTool,
  TrackToggle,
  TrimEdge,
} from '@/features/timeline/types'

export interface TrimPayload {
  itemId: string
  edge: TrimEdge
  deltaFrames: number
}

export interface MovePayload {
  itemId: string
  deltaFrames: number
}

export interface TrackTogglePayload {
  trackId: string
  toggle: TrackToggle
}

export interface ItemPatch {
  start?: Seconds
  duration?: Seconds
  name?: string
  volume?: number
  muted?: boolean
  speed?: number
  text?: string
  fontFamily?: string
  fontSize?: number
  color?: string
  position?: { x: number; y: number }
  transform?: { x?: number; y?: number; scale?: number; fit?: FitMode }
}

export interface EditorHandlers {
  onNewProject: () => void
  onSaveProject: () => void
  onRenameProject: (name: string) => void
  onClearLocalData: () => void
  onWorkspaceChange: (workspace: string) => void

  onImportFiles: (files: File[]) => void
  onAddMediaToTimeline: (mediaId: string) => void
  onAddTextItem: () => void

  onPlayPause: () => void
  onShuttle: (direction: 'reverse' | 'stop' | 'forward') => void
  onStepFrame: (delta: -1 | 1) => void
  onSeek: (time: Seconds) => void
  onJumpToStart: () => void
  onJumpToEnd: () => void
  onToggleLoop: (loop: boolean) => void
  onMarkIn: () => void
  onMarkOut: () => void

  onSelectionChange: (itemIds: string[]) => void
  onSplit: () => void
  onDelete: (options: { ripple: boolean }) => void
  onUndo: () => void
  onRedo: () => void
  onSelectTool: (tool: TimelineTool) => void
  onToggleSnap: (enabled: boolean) => void
  onTimelineZoomChange: (pxPerSecond: number) => void
  onTrimClip: (payload: TrimPayload) => void
  onMoveClip: (payload: MovePayload) => void
  onClipPointerDown: (itemId: string, event: React.PointerEvent) => void
  onTrimHandlePointerDown: (
    itemId: string,
    edge: TrimEdge,
    event: React.PointerEvent,
  ) => void
  onToggleTrack: (payload: TrackTogglePayload) => void

  onUpdateItem: (itemId: string, patch: ItemPatch) => void

  onExport: (settings: ExportSettings) => void
  onCancelExport: () => void
}
