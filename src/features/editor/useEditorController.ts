import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  detectCapabilities,
  refreshStorageEstimate,
  useCapabilities,
} from '@/engine/capabilities'
import { importFiles } from '@/engine/importer'
import { previewEngine, usePlaybackStore } from '@/engine/preview'
import { ensureFontsLoaded } from '@/compositor/draw'
import type { EditorHandlers } from '@/features/app-shell/handlers'
import { estimateExport, useExportStore } from '@/features/export/exportStore'
import type { ExportSettings } from '@/features/export/types'
import {
  clearLocalData,
  hydrateFromStorage,
  saveProjectNow,
  startAutosave,
  useSaveStatus,
} from '@/storage/projectStorage'
import { useEditorStore } from './store'

export function useEditorController() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const doc = useEditorStore((state) => state.doc)
  const media = useEditorStore((state) => state.media)
  const selectedIds = useEditorStore((state) => state.selectedIds)
  const markIn = useEditorStore((state) => state.markIn)
  const markOut = useEditorStore((state) => state.markOut)
  const canUndo = useEditorStore((state) => state.past.length > 0)
  const canRedo = useEditorStore((state) => state.future.length > 0)
  const hydrated = useEditorStore((state) => state.hydrated)
  const playback = usePlaybackStore()
  const capabilities = useCapabilities((state) => state.capabilities)
  const saveStatus = useSaveStatus()
  const exportStatus = useExportStore((state) => state.status)
  const [exportEstimate, setExportEstimate] = useState(() =>
    estimateExport(
      {
        preset: 'shorts',
        width: 1080,
        height: 1920,
        fps: 30,
        videoBitrateKbps: 8000,
        audioBitrateKbps: 128,
        codec: 'h264',
        fileName: '',
      },
      0,
    ),
  )

  useEffect(() => {
    previewEngine.attach(canvasRef.current)
    return () => previewEngine.attach(null)
  }, [])

  useEffect(() => {
    if (saveStatus.state === 'saved') void refreshStorageEstimate()
  }, [saveStatus.state, saveStatus.at])

  useEffect(() => {
    void ensureFontsLoaded()
    void detectCapabilities()
    void hydrateFromStorage()
    return startAutosave()
  }, [])

  const handlers: EditorHandlers = useMemo(() => {
    const store = () => useEditorStore.getState()
    return {
      onNewProject: () => {
        previewEngine.pause()
        previewEngine.seek(0)
        void clearLocalData()
        store().newProject()
        useExportStore.getState().reset()
        toast('Started a new project')
      },
      onSaveProject: () => {
        saveProjectNow().then(
          () => toast.success('Project saved'),
          () =>
            toast.error('Could not save the project', {
              description: 'Browser storage may be full or blocked.',
            }),
        )
      },
      onRenameProject: (name) => store().rename(name),
      onClearLocalData: () => {
        previewEngine.pause()
        previewEngine.seek(0)
        void clearLocalData().then(() => toast.success('Local data cleared'))
        store().newProject()
        useExportStore.getState().reset()
      },
      onWorkspaceChange: () => undefined,

      onImportFiles: (files) => {
        void importFiles(files)
      },
      onAddMediaToTimeline: (mediaId, track) => {
        store().addMediaToTimeline(mediaId, {
          track,
          atTime: previewEngine.getTime(),
        })
      },
      onAddTextItem: (preset) => {
        store().addText(preset, previewEngine.getTime())
      },

      onPlayPause: () => previewEngine.toggle(),
      onShuttle: (direction) => previewEngine.shuttle(direction),
      onStepFrame: (delta) => previewEngine.step(delta),
      onSeek: (time) => previewEngine.seek(time),
      onJumpToStart: () => previewEngine.jumpToStart(),
      onJumpToEnd: () => previewEngine.jumpToEnd(),
      onToggleLoop: (loop) => previewEngine.setLoop(loop),
      onMarkIn: () => {
        const time = previewEngine.getTime()
        const { markOut: out } = store()
        store().setMarks(time, out !== null && out > time ? out : null)
      },
      onMarkOut: () => {
        const time = previewEngine.getTime()
        const { markIn: inPoint } = store()
        store().setMarks(
          inPoint !== null && inPoint < time ? inPoint : null,
          time,
        )
      },

      onSelectionChange: (ids) => store().setSelection(ids),
      onSplit: () => {
        if (store().splitAtPlayhead(previewEngine.getTime()) === 0) {
          toast('Nothing to split here', {
            description: 'Move the playhead over a clip on an unlocked track.',
          })
        }
      },
      onSplitAt: ({ itemId, time }) => {
        store().splitItemAt(itemId, time)
      },
      onDelete: ({ ripple }) => store().deleteSelected(ripple),
      onUndo: () => store().undo(),
      onRedo: () => store().redo(),
      onTrimClip: ({ itemId, edge, deltaFrames }) =>
        store().trimByFrames(itemId, edge, deltaFrames),
      onMoveClip: ({ itemId, deltaFrames }) =>
        store().moveByFrames(itemId, deltaFrames),
      onItemDrag: ({ itemId, start, phase }) => {
        if (phase === 'start') store().beginGesture()
        else if (phase === 'update') store().moveTo(itemId, start)
        else if (phase === 'end') store().endGesture()
        else store().cancelGesture()
      },
      onItemTrim: ({ itemId, edge, time, phase }) => {
        if (phase === 'start') store().beginGesture()
        else if (phase === 'update') store().trimTo(itemId, edge, time)
        else if (phase === 'end') store().endGesture()
        else store().cancelGesture()
      },
      onToggleTrack: ({ trackId, toggle }) =>
        store().toggleTrackFlag(trackId, toggle),

      onUpdateItem: (itemId, patch) =>
        store().updateSelectedItem(itemId, patch),

      onExport: (settings) => {
        void useExportStore.getState().start(settings)
      },
      onCancelExport: () => useExportStore.getState().cancel(),
      onDownloadExport: () => useExportStore.getState().download(),
      onResetExport: () => useExportStore.getState().reset(),
    }
  }, [])

  return {
    canvasRef,
    doc,
    media,
    selectedIds,
    markIn,
    markOut,
    canUndo,
    canRedo,
    hydrated,
    playback,
    capabilities,
    saveStatus,
    exportStatus,
    exportEstimate,
    onEstimateRequest: (settings: ExportSettings) =>
      setExportEstimate(
        estimateExport(settings, useEditorStore.getState().doc.duration),
      ),
    handlers,
  }
}
