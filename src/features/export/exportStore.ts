import { create } from 'zustand'
import { toast } from 'sonner'
import { exportProject, ExportCancelled, ExportError } from '@/engine/exporter'
import { previewEngine } from '@/engine/preview'
import { useEditorStore } from '@/features/editor/store'
import type { ExportEstimate } from './ExportDialog'
import type { ExportSettings, ExportStatus } from './types'

const SPEED_KEY = 'fw:export-fps'
const DEFAULT_FRAMES_PER_SECOND = 45

function savedSpeed(): number {
  try {
    const stored = Number(localStorage.getItem(SPEED_KEY))
    return Number.isFinite(stored) && stored > 1
      ? stored
      : DEFAULT_FRAMES_PER_SECOND
  } catch {
    return DEFAULT_FRAMES_PER_SECOND
  }
}

function rememberSpeed(framesPerSecond: number) {
  try {
    const blended = (savedSpeed() + framesPerSecond) / 2
    localStorage.setItem(SPEED_KEY, String(Math.round(blended)))
  } catch {
    return
  }
}

export function estimateExport(
  settings: ExportSettings,
  duration: number,
): ExportEstimate {
  const bits =
    (settings.videoBitrateKbps + settings.audioBitrateKbps) * 1000 * duration
  const frames = duration * settings.fps
  return {
    sizeBytes: bits / 8,
    seconds: Math.max(2, frames / savedSpeed() + 1.5),
  }
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

interface ExportStore {
  status: ExportStatus
  lastFile: { blob: Blob; fileName: string } | null
  controller: AbortController | null
  start: (settings: ExportSettings) => Promise<void>
  cancel: () => void
  download: () => void
  reset: () => void
}

export const useExportStore = create<ExportStore>()((set, get) => ({
  status: { phase: 'idle' },
  lastFile: null,
  controller: null,

  start: async (settings) => {
    if (get().status.phase === 'running') return
    previewEngine.pause()
    const controller = new AbortController()
    set({
      controller,
      lastFile: null,
      status: {
        phase: 'running',
        progress: 0,
        etaSeconds: 0,
        label: 'Starting',
      },
    })
    const { doc, media } = useEditorStore.getState()
    try {
      const result = await exportProject({
        doc,
        media,
        settings,
        signal: controller.signal,
        onProgress: (progress) =>
          set({ status: { phase: 'running', ...progress } }),
      })
      rememberSpeed(result.framesPerSecond)
      set({
        controller: null,
        lastFile: { blob: result.blob, fileName: result.fileName },
        status: {
          phase: 'done',
          sizeBytes: result.sizeBytes,
          fileName: result.fileName,
        },
      })
      triggerDownload(result.blob, result.fileName)
      toast.success('Export finished', { description: result.fileName })
    } catch (error) {
      if (error instanceof ExportCancelled) {
        set({ controller: null, status: { phase: 'cancelled' } })
        return
      }
      const message =
        error instanceof ExportError || error instanceof Error
          ? error.message
          : 'The export failed for an unknown reason.'
      set({ controller: null, status: { phase: 'error', message } })
    }
  },
  cancel: () => get().controller?.abort(),
  download: () => {
    const file = get().lastFile
    if (file) triggerDownload(file.blob, file.fileName)
  },
  reset: () => set({ status: { phase: 'idle' }, lastFile: null }),
}))
