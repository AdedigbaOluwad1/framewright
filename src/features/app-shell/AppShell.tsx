import { useMemo, useState } from 'react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/shared/ui/resizable'
import { Toaster } from '@/shared/ui/sonner'
import { usePanelRef } from 'react-resizable-panels'
import {
  ExportDialog,
  type ExportEstimate,
} from '@/features/export/ExportDialog'
import type { ExportSettings, ExportStatus } from '@/features/export/types'
import { InspectorPanel } from '@/features/inspector/InspectorPanel'
import {
  MonitorPanel,
  type PlaybackState,
} from '@/features/monitor/MonitorPanel'
import { ProjectPanel } from '@/features/project-panel/ProjectPanel'
import {
  TIMELINE_MAX_ZOOM,
  TIMELINE_MIN_ZOOM,
  TimelinePanel,
} from '@/features/timeline/TimelinePanel'
import type {
  MediaAsset,
  TimelineDocument,
  TimelineTool,
} from '@/features/timeline/types'
import { useTheme } from '@/shared/hooks/useTheme'
import type { ActionHandlers } from '@/shared/shortcuts/registry'
import { useShortcuts } from '@/shared/shortcuts/useShortcuts'
import { CommandPalette } from './CommandPalette'
import type { EditorHandlers } from './handlers'
import { StatusBar } from './StatusBar'
import { TopBar } from './TopBar'
import type { Diagnostics, Workspace } from './types'

export interface AppShellProps {
  doc: TimelineDocument
  media: MediaAsset[]
  playback: PlaybackState
  diagnostics: Diagnostics
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  exportStatus: ExportStatus
  exportEstimate: ExportEstimate | null
  onEstimateRequest: (settings: ExportSettings) => void
  handlers: EditorHandlers
}

const DEFAULT_ZOOM = 24

export function AppShell({
  doc,
  media,
  playback,
  diagnostics,
  canvasRef,
  exportStatus,
  exportEstimate,
  onEstimateRequest,
  handlers,
}: AppShellProps) {
  const { theme, toggleTheme } = useTheme('dark')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [tool, setTool] = useState<TimelineTool>('select')
  const [snapEnabled, setSnapEnabled] = useState(true)
  const [pxPerSecond, setPxPerSecond] = useState(DEFAULT_ZOOM)
  const [workspace, setWorkspace] = useState<Workspace>('Editing')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  const projectPanel = usePanelRef()
  const inspectorPanel = usePanelRef()
  const timelinePanel = usePanelRef()

  const selectedItems = useMemo(
    () => doc.items.filter((item) => selectedIds.includes(item.id)),
    [doc.items, selectedIds],
  )

  function changeSelection(ids: string[]) {
    setSelectedIds(ids)
    setAnnouncement(
      `${ids.length} ${ids.length === 1 ? 'item' : 'items'} selected`,
    )
    handlers.onSelectionChange(ids)
  }

  function changeTool(next: TimelineTool) {
    setTool(next)
    setAnnouncement(`${next === 'razor' ? 'Razor' : 'Select'} tool active`)
    handlers.onSelectTool(next)
  }

  function changeSnap(enabled: boolean) {
    setSnapEnabled(enabled)
    setAnnouncement(`Snapping ${enabled ? 'on' : 'off'}`)
    handlers.onToggleSnap(enabled)
  }

  function changeZoom(next: number) {
    const clamped = Math.min(
      TIMELINE_MAX_ZOOM,
      Math.max(TIMELINE_MIN_ZOOM, next),
    )
    setPxPerSecond(clamped)
    handlers.onTimelineZoomChange(clamped)
  }

  function togglePanel(panel: 'project' | 'inspector' | 'timeline') {
    const ref = {
      project: projectPanel,
      inspector: inspectorPanel,
      timeline: timelinePanel,
    }[panel]
    if (ref.current?.isCollapsed()) ref.current.expand()
    else ref.current?.collapse()
  }

  function openExport() {
    setExportOpen(true)
  }

  const actions: ActionHandlers = {
    playPause: handlers.onPlayPause,
    shuttleReverse: () => handlers.onShuttle('reverse'),
    shuttleStop: () => handlers.onShuttle('stop'),
    shuttleForward: () => handlers.onShuttle('forward'),
    stepBack: () => handlers.onStepFrame(-1),
    stepForward: () => handlers.onStepFrame(1),
    jumpToStart: handlers.onJumpToStart,
    jumpToEnd: handlers.onJumpToEnd,
    markIn: handlers.onMarkIn,
    markOut: handlers.onMarkOut,
    split: handlers.onSplit,
    delete: () => handlers.onDelete({ ripple: false }),
    rippleDelete: () => handlers.onDelete({ ripple: true }),
    undo: handlers.onUndo,
    redo: handlers.onRedo,
    commandPalette: () => setPaletteOpen((open) => !open),
    zoomIn: () => changeZoom(pxPerSecond * 1.25),
    zoomOut: () => changeZoom(pxPerSecond / 1.25),
    toolSelect: () => changeTool('select'),
    toolRazor: () => changeTool('razor'),
    toggleSnap: () => changeSnap(!snapEnabled),
    toggleLoop: () => handlers.onToggleLoop(!playback.loop),
    export: openExport,
  }

  useShortcuts(actions, !exportOpen)

  return (
    <div className="flex h-full flex-col bg-background text-[0.95rem]">
      <a
        href="#timeline-region"
        className="sr-only focus:not-sr-only focus:absolute focus:top-1 focus:left-1 focus:z-50 focus:rounded focus:bg-primary focus:px-2 focus:py-1 focus:text-primary-foreground"
      >
        Skip to timeline
      </a>
      <TopBar
        projectName={doc.name}
        workspace={workspace}
        theme={theme}
        actions={actions}
        onRenameProject={handlers.onRenameProject}
        onNewProject={handlers.onNewProject}
        onSaveProject={handlers.onSaveProject}
        onClearLocalData={handlers.onClearLocalData}
        onImportFiles={handlers.onImportFiles}
        onWorkspaceChange={(next) => {
          setWorkspace(next)
          handlers.onWorkspaceChange(next)
        }}
        onToggleTheme={toggleTheme}
        onTogglePanel={togglePanel}
      />

      <main className="min-h-0 flex-1 px-3 pb-1">
        <ResizablePanelGroup orientation="vertical" id="workspace-rows">
          <ResizablePanel id="top-row" defaultSize="58" minSize="30">
            <ResizablePanelGroup
              orientation="horizontal"
              id="workspace-columns"
            >
              <ResizablePanel
                id="project"
                panelRef={projectPanel}
                defaultSize="22"
                minSize="14"
                collapsible
                collapsedSize="0"
              >
                <ProjectPanel
                  media={media}
                  onImportFiles={handlers.onImportFiles}
                  onAddMediaToTimeline={handlers.onAddMediaToTimeline}
                  onAddTextItem={handlers.onAddTextItem}
                />
              </ResizablePanel>
              <ResizableHandle
                aria-label="Resize project panel"
                className="w-3 bg-transparent after:w-full hover:bg-accent-soft aria-[orientation=horizontal]:h-3 rounded-full"
              />
              <ResizablePanel id="monitor" defaultSize="52" minSize="25">
                <MonitorPanel
                  canvasRef={canvasRef}
                  canvasWidth={doc.width}
                  canvasHeight={doc.height}
                  fps={doc.fps}
                  duration={doc.duration}
                  playback={playback}
                  onPlayPause={handlers.onPlayPause}
                  onStepFrame={handlers.onStepFrame}
                  onJumpToStart={handlers.onJumpToStart}
                  onJumpToEnd={handlers.onJumpToEnd}
                  onToggleLoop={handlers.onToggleLoop}
                />
              </ResizablePanel>
              <ResizableHandle
                aria-label="Resize inspector"
                className="w-3 bg-transparent after:w-full hover:bg-accent-soft aria-[orientation=horizontal]:h-3 rounded-full"
              />
              <ResizablePanel
                id="inspector"
                panelRef={inspectorPanel}
                defaultSize="26"
                minSize="16"
                collapsible
                collapsedSize="0"
              >
                <InspectorPanel
                  selection={selectedItems}
                  onUpdateItem={handlers.onUpdateItem}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle
            aria-label="Resize timeline"
            className="w-3 bg-transparent after:w-full hover:bg-accent-soft aria-[orientation=horizontal]:h-3 rounded-full"
          />
          <ResizablePanel
            id="timeline"
            panelRef={timelinePanel}
            defaultSize="42"
            minSize="20"
            collapsible
            collapsedSize="0"
          >
            <div
              id="timeline-region"
              tabIndex={-1}
              className="h-full outline-none"
            >
              <TimelinePanel
                doc={doc}
                playheadTime={playback.currentTime}
                selectedIds={selectedIds}
                tool={tool}
                snapEnabled={snapEnabled}
                pxPerSecond={pxPerSecond}
                onSeek={handlers.onSeek}
                onStepFrame={handlers.onStepFrame}
                onJumpToStart={handlers.onJumpToStart}
                onJumpToEnd={handlers.onJumpToEnd}
                onSelectionChange={changeSelection}
                onSelectTool={changeTool}
                onToggleSnap={changeSnap}
                onZoomChange={changeZoom}
                onSplit={handlers.onSplit}
                onRippleDelete={() => handlers.onDelete({ ripple: true })}
                onToggleTrack={(trackId, toggle) =>
                  handlers.onToggleTrack({ trackId, toggle })
                }
                onClipPointerDown={handlers.onClipPointerDown}
                onTrimHandlePointerDown={handlers.onTrimHandlePointerDown}
                onKeyboardTrim={(itemId, edge, deltaFrames) =>
                  handlers.onTrimClip({ itemId, edge, deltaFrames })
                }
                onKeyboardMove={(itemId, deltaFrames) =>
                  handlers.onMoveClip({ itemId, deltaFrames })
                }
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      <StatusBar
        diagnostics={diagnostics}
        timelineZoomPercent={Math.round((pxPerSecond / DEFAULT_ZOOM) * 100)}
      />

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        actions={actions}
      />
      <ExportDialog
        open={exportOpen}
        projectName={doc.name}
        status={exportStatus}
        estimate={exportEstimate}
        onEstimateRequest={onEstimateRequest}
        onOpenChange={setExportOpen}
        onExport={handlers.onExport}
        onCancelExport={handlers.onCancelExport}
      />
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
      <Toaster theme={theme} />
    </div>
  )
}
