import { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { useGroupRef, usePanelRef } from 'react-resizable-panels'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/shared/ui/resizable'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Toaster } from '@/shared/ui/sonner'
import type { Capabilities } from '@/engine/capabilities'
import type { PlaybackState } from '@/engine/preview'
import {
  ExportDialog,
  type ExportEstimate,
} from '@/features/export/ExportDialog'
import type { ExportSettings, ExportStatus } from '@/features/export/types'
import { InspectorPanel } from '@/features/inspector/InspectorPanel'
import { MonitorPanel } from '@/features/monitor/MonitorPanel'
import { ProjectPanel } from '@/features/project-panel/ProjectPanel'
import {
  TIMELINE_MAX_ZOOM,
  TIMELINE_MIN_ZOOM,
  TimelinePanel,
} from '@/features/timeline/TimelinePanel'
import { rootFontPx, timelineFitHeight } from '@/features/timeline/layout'
import type {
  MediaAsset,
  Seconds,
  TimelineDocument,
  TimelineTool,
} from '@/features/timeline/types'
import { useTheme } from '@/shared/hooks/useTheme'
import { SHORTCUTS, type ActionHandlers } from '@/shared/shortcuts/registry'
import { useShortcuts } from '@/shared/shortcuts/useShortcuts'
import type { SaveStatus } from '@/storage/projectStorage'
import { CommandPalette, type PaletteCommand } from './CommandPalette'
import { DiagnosticsDialog } from './DiagnosticsDialog'
import type { EditorHandlers } from './handlers'
import { ShortcutsDialog } from './ShortcutsDialog'
import { StatusBar } from './StatusBar'
import { TopBar } from './TopBar'
import { WORKSPACES, type Workspace } from './types'

export interface AppShellProps {
  doc: TimelineDocument
  media: MediaAsset[]
  selectedIds: string[]
  playback: PlaybackState
  markIn: Seconds | null
  markOut: Seconds | null
  canUndo: boolean
  canRedo: boolean
  capabilities: Capabilities | null
  saveStatus: SaveStatus
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  exportStatus: ExportStatus
  exportEstimate: ExportEstimate | null
  onEstimateRequest: (settings: ExportSettings) => void
  handlers: EditorHandlers
}

const DEFAULT_ZOOM = 24

const LAYOUTS: Record<
  Workspace,
  { rows: Record<string, number>; columns: Record<string, number> }
> = {
  Editing: {
    rows: { 'top-row': 62, timeline: 38 },
    columns: { project: 22, monitor: 52, inspector: 26 },
  },
  Audio: {
    rows: { 'top-row': 44, timeline: 56 },
    columns: { project: 24, monitor: 44, inspector: 32 },
  },
  Titles: {
    rows: { 'top-row': 64, timeline: 36 },
    columns: { project: 18, monitor: 48, inspector: 34 },
  },
}

const PALETTE_GROUPS = [
  'Playback',
  'Edit',
  'Timeline',
  'Project',
  'View',
  'Help',
]

export function AppShell({
  doc,
  media,
  selectedIds,
  playback,
  markIn,
  markOut,
  canUndo,
  canRedo,
  capabilities,
  saveStatus,
  canvasRef,
  exportStatus,
  exportEstimate,
  onEstimateRequest,
  handlers,
}: AppShellProps) {
  const { theme, toggleTheme } = useTheme('dark')
  const [tool, setTool] = useState<TimelineTool>('select')
  const [snapEnabled, setSnapEnabled] = useState(true)
  const [pxPerSecond, setPxPerSecond] = useState(DEFAULT_ZOOM)
  const [workspace, setWorkspace] = useState<Workspace>('Editing')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false)
  const [confirm, setConfirm] = useState<'new' | 'clear' | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const [dragDepth, setDragDepth] = useState(0)

  const [timelineFitPx] = useState(() => timelineFitHeight(4, rootFontPx()))
  const rowsGroup = useGroupRef()
  const columnsGroup = useGroupRef()
  const projectPanel = usePanelRef()
  const inspectorPanel = usePanelRef()
  const timelinePanel = usePanelRef()

  const selectedItems = useMemo(
    () => doc.items.filter((item) => selectedIds.includes(item.id)),
    [doc.items, selectedIds],
  )

  function changeTool(next: TimelineTool) {
    setTool(next)
    setAnnouncement(`${next === 'razor' ? 'Razor' : 'Select'} tool active`)
  }

  function changeSnap(enabled: boolean) {
    setSnapEnabled(enabled)
    setAnnouncement(`Snapping ${enabled ? 'on' : 'off'}`)
  }

  function changeZoom(next: number) {
    setPxPerSecond(
      Math.min(TIMELINE_MAX_ZOOM, Math.max(TIMELINE_MIN_ZOOM, next)),
    )
  }

  function changeWorkspace(next: Workspace) {
    setWorkspace(next)
    const rows = { ...LAYOUTS[next].rows }
    if (next === 'Editing') {
      const total = document.getElementById('workspace-rows')?.clientHeight ?? 0
      if (total > 0) {
        const timeline = Math.min(60, (timelineFitPx / total) * 100)
        rows.timeline = timeline
        rows['top-row'] = 100 - timeline
      }
    }
    rowsGroup.current?.setLayout(rows)
    columnsGroup.current?.setLayout(LAYOUTS[next].columns)
    setAnnouncement(`${next} workspace`)
    handlers.onWorkspaceChange(next)
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

  function requestNewProject() {
    if (doc.items.length === 0 && media.length === 0) handlers.onNewProject()
    else setConfirm('new')
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
    bringToFront: () => handlers.onArrange('front'),
    bringForward: () => handlers.onArrange('forward'),
    sendBackward: () => handlers.onArrange('backward'),
    sendToBack: () => handlers.onArrange('back'),
    undo: handlers.onUndo,
    redo: handlers.onRedo,
    commandPalette: () => setPaletteOpen((open) => !open),
    zoomIn: () => changeZoom(pxPerSecond * 1.25),
    zoomOut: () => changeZoom(pxPerSecond / 1.25),
    toolSelect: () => changeTool('select'),
    toolRazor: () => changeTool('razor'),
    toggleSnap: () => changeSnap(!snapEnabled),
    toggleLoop: () => handlers.onToggleLoop(!playback.loop),
    export: () => setExportOpen(true),
  }

  const anyDialogOpen =
    exportOpen || shortcutsOpen || diagnosticsOpen || confirm !== null
  useShortcuts(actions, !anyDialogOpen)

  const commands: PaletteCommand[] = (() => {
    const fromRegistry: PaletteCommand[] = Object.values(SHORTCUTS)
      .filter((def) => def.id !== 'commandPalette' && def.id !== 'export')
      .map((def) => ({
        id: def.id,
        label: def.label,
        group: def.group === 'App' ? 'Project' : def.group,
        shortcut: def.display,
        run: actions[def.id],
      }))
    return [
      ...fromRegistry,
      {
        id: 'export',
        label: 'Export video…',
        group: 'Project',
        shortcut: SHORTCUTS.export.display,
        run: actions.export,
      },
      {
        id: 'new',
        label: 'New project',
        group: 'Project',
        run: requestNewProject,
      },
      {
        id: 'save',
        label: 'Save project now',
        group: 'Project',
        run: handlers.onSaveProject,
      },
      {
        id: 'clear',
        label: 'Clear local data…',
        group: 'Project',
        run: () => setConfirm('clear'),
      },
      {
        id: 'theme',
        label:
          theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        group: 'View',
        run: toggleTheme,
      },
      {
        id: 'panel-project',
        label: 'Toggle project panel',
        group: 'View',
        run: () => togglePanel('project'),
      },
      {
        id: 'panel-inspector',
        label: 'Toggle inspector',
        group: 'View',
        run: () => togglePanel('inspector'),
      },
      {
        id: 'panel-timeline',
        label: 'Toggle timeline',
        group: 'View',
        run: () => togglePanel('timeline'),
      },
      ...WORKSPACES.map((name) => ({
        id: `workspace-${name}`,
        label: `Workspace: ${name}`,
        group: 'View',
        run: () => changeWorkspace(name),
      })),
      {
        id: 'shortcuts',
        label: 'Keyboard shortcuts',
        group: 'Help',
        run: () => setShortcutsOpen(true),
      },
      {
        id: 'diagnostics',
        label: 'Diagnostics',
        group: 'Help',
        run: () => setDiagnosticsOpen(true),
      },
    ]
  })()

  function hasFiles(event: React.DragEvent) {
    return Array.from(event.dataTransfer.types).includes('Files')
  }

  return (
    <div
      className="relative flex h-full flex-col bg-background text-[0.95rem]"
      onDragEnter={(event) => {
        if (hasFiles(event)) setDragDepth((depth) => depth + 1)
      }}
      onDragLeave={(event) => {
        if (hasFiles(event)) setDragDepth((depth) => Math.max(0, depth - 1))
      }}
      onDragOver={(event) => {
        if (hasFiles(event)) event.preventDefault()
      }}
      onDrop={(event) => {
        if (!hasFiles(event)) return
        event.preventDefault()
        setDragDepth(0)
        handlers.onImportFiles(Array.from(event.dataTransfer.files))
      }}
    >
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
        onNewProject={requestNewProject}
        onSaveProject={handlers.onSaveProject}
        onClearLocalData={() => setConfirm('clear')}
        onImportFiles={handlers.onImportFiles}
        onWorkspaceChange={changeWorkspace}
        onToggleTheme={toggleTheme}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onOpenDiagnostics={() => setDiagnosticsOpen(true)}
        onTogglePanel={togglePanel}
      />

      <main className="min-h-0 flex-1 px-3 pb-1">
        <ResizablePanelGroup
          orientation="vertical"
          id="workspace-rows"
          groupRef={rowsGroup}
        >
          <ResizablePanel id="top-row" minSize="30">
            <ResizablePanelGroup
              orientation="horizontal"
              id="workspace-columns"
              groupRef={columnsGroup}
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
                className="w-3 rounded-full bg-transparent after:w-full hover:bg-accent-soft aria-[orientation=horizontal]:h-3"
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
                className="w-3 rounded-full bg-transparent after:w-full hover:bg-accent-soft aria-[orientation=horizontal]:h-3"
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
                  onArrange={handlers.onArrange}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle
            aria-label="Resize timeline"
            className="w-3 rounded-full bg-transparent after:w-full hover:bg-accent-soft aria-[orientation=horizontal]:h-3"
          />
          <ResizablePanel
            id="timeline"
            panelRef={timelinePanel}
            defaultSize={`${timelineFitPx}px`}
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
                media={media}
                playheadTime={playback.time}
                isPlaying={playback.isPlaying}
                markIn={markIn}
                markOut={markOut}
                selectedIds={selectedIds}
                tool={tool}
                snapEnabled={snapEnabled}
                pxPerSecond={pxPerSecond}
                canUndo={canUndo}
                canRedo={canRedo}
                onSeek={handlers.onSeek}
                onStepFrame={handlers.onStepFrame}
                onJumpToStart={handlers.onJumpToStart}
                onJumpToEnd={handlers.onJumpToEnd}
                onSelectionChange={handlers.onSelectionChange}
                onSelectTool={changeTool}
                onToggleSnap={changeSnap}
                onZoomChange={changeZoom}
                onSplit={handlers.onSplit}
                onRippleDelete={() => handlers.onDelete({ ripple: true })}
                onDelete={() => handlers.onDelete({ ripple: false })}
                onUndo={handlers.onUndo}
                onRedo={handlers.onRedo}
                onToggleTrack={(trackId, toggle) =>
                  handlers.onToggleTrack({ trackId, toggle })
                }
                onKeyboardTrim={(itemId, edge, deltaFrames) =>
                  handlers.onTrimClip({ itemId, edge, deltaFrames })
                }
                onKeyboardMove={(itemId, deltaFrames) =>
                  handlers.onMoveClip({ itemId, deltaFrames })
                }
                onItemDrag={handlers.onItemDrag}
                onItemTrim={handlers.onItemTrim}
                onSplitAt={handlers.onSplitAt}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      <StatusBar
        capabilities={capabilities}
        saveStatus={saveStatus}
        timelineZoomPercent={Math.round((pxPerSecond / DEFAULT_ZOOM) * 100)}
        onOpenDiagnostics={() => setDiagnosticsOpen(true)}
      />

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        commands={commands}
        groupOrder={PALETTE_GROUPS}
      />
      <ExportDialog
        open={exportOpen}
        projectName={doc.name}
        duration={doc.duration}
        status={exportStatus}
        estimate={exportEstimate}
        capabilities={capabilities}
        onEstimateRequest={onEstimateRequest}
        onOpenChange={(open) => {
          setExportOpen(open)
          if (
            !open &&
            exportStatus.phase !== 'running' &&
            exportStatus.phase !== 'idle'
          ) {
            handlers.onResetExport()
          }
        }}
        onExport={handlers.onExport}
        onCancelExport={handlers.onCancelExport}
        onDownload={handlers.onDownloadExport}
        onReset={handlers.onResetExport}
      />
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      <DiagnosticsDialog
        open={diagnosticsOpen}
        capabilities={capabilities}
        onOpenChange={setDiagnosticsOpen}
      />
      <ConfirmDialog
        open={confirm === 'new'}
        title="Start a new project?"
        description="This replaces the current project and removes its imported media from this browser. Your original files are not touched."
        confirmLabel="Start new project"
        destructive
        onOpenChange={(open) => !open && setConfirm(null)}
        onConfirm={handlers.onNewProject}
      />
      <ConfirmDialog
        open={confirm === 'clear'}
        title="Clear local data?"
        description="This deletes the saved project and every cached media file stored in this browser. Your original files are not touched. This cannot be undone."
        confirmLabel="Clear local data"
        destructive
        onOpenChange={(open) => !open && setConfirm(null)}
        onConfirm={handlers.onClearLocalData}
      />

      {dragDepth > 0 ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3 z-40 flex items-center justify-center rounded-2xl border-2 border-dashed border-foreground bg-background/80"
        >
          <div className="flex flex-col items-center gap-3">
            <Icon icon="hugeicons:upload-01" className="size-8" />
            <p className="text-lg font-semibold">Drop to import</p>
            <p className="text-[0.9rem] text-muted-foreground">
              Video, audio and images stay on your device.
            </p>
          </div>
        </div>
      ) : null}
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
      <Toaster theme={theme} />
    </div>
  )
}
