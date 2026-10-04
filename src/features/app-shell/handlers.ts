import type { ExportSettings } from '@/features/export/types'
import type { GesturePhase } from '@/features/timeline/useTimelineGestures'
import type { Seconds, TrackToggle, TrimEdge } from '@/features/timeline/types'
import type { ItemPatchInput } from '@/features/timeline/ops'
import type { TextPreset } from '@/features/editor/store'
import type { Workspace } from './types'

export type { GesturePhase }

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

export type ItemPatch = ItemPatchInput

export interface EditorHandlers {
  onNewProject: () => void
  onSaveProject: () => void
  onRenameProject: (name: string) => void
  onClearLocalData: () => void
  onWorkspaceChange: (workspace: Workspace) => void

  onImportFiles: (files: File[]) => void
  onAddMediaToTimeline: (mediaId: string, track?: 'audio' | 'music') => void
  onAddTextItem: (preset: TextPreset) => void

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
  onSplitAt: (payload: { itemId: string; time: Seconds }) => void
  onDelete: (options: { ripple: boolean }) => void
  onUndo: () => void
  onRedo: () => void
  onTrimClip: (payload: TrimPayload) => void
  onMoveClip: (payload: MovePayload) => void
  onItemDrag: (payload: {
    itemId: string
    start: Seconds
    phase: GesturePhase
  }) => void
  onItemTrim: (payload: {
    itemId: string
    edge: TrimEdge
    time: Seconds
    phase: GesturePhase
  }) => void
  onToggleTrack: (payload: TrackTogglePayload) => void

  onUpdateItem: (itemId: string, patch: ItemPatch) => void

  onExport: (settings: ExportSettings) => void
  onCancelExport: () => void
  onDownloadExport: () => void
  onResetExport: () => void
}
