import { toast } from 'sonner'
import { useEditorStore } from '@/features/editor/store'
import type { MediaAsset } from '@/features/timeline/types'
import {
  ImportError,
  computePeaks,
  makeThumbnail,
  probeFile,
  registerFile,
} from './mediaLibrary'
import { persistMediaFile } from '@/storage/projectStorage'

export interface ImportOutcome {
  added: MediaAsset[]
  failures: { name: string; message: string; hint: string }[]
}

export async function importFiles(files: File[]): Promise<ImportOutcome> {
  const outcome: ImportOutcome = { added: [], failures: [] }
  const store = useEditorStore.getState()

  for (const file of files) {
    try {
      const probe = await probeFile(file)
      const asset: MediaAsset = {
        id: crypto.randomUUID(),
        name: file.name,
        kind: probe.kind,
        duration: probe.duration,
        width: probe.width,
        height: probe.height,
        sizeBytes: file.size,
        hasAudio: probe.hasAudio,
        mimeType: file.type,
      }
      registerFile(asset.id, file)
      store.addMedia(asset)
      outcome.added.push(asset)
      void persistMediaFile(asset.id, file)
      void makeThumbnail(file, asset).then((thumbnailUrl) => {
        if (thumbnailUrl)
          useEditorStore.getState().patchMedia(asset.id, { thumbnailUrl })
      })
      if (probe.hasAudio) {
        void computePeaks(file, probe.duration).then((peaks) => {
          if (peaks) useEditorStore.getState().patchMedia(asset.id, { peaks })
        })
      }
    } catch (error) {
      const failure =
        error instanceof ImportError
          ? { name: file.name, message: error.message, hint: error.hint }
          : {
              name: file.name,
              message: `Couldn't import ${file.name}`,
              hint: 'Try a different file.',
            }
      outcome.failures.push(failure)
    }
  }

  for (const failure of outcome.failures) {
    toast.error(failure.message, { description: failure.hint, duration: 8000 })
  }
  if (outcome.added.length > 0) {
    toast.success(
      outcome.added.length === 1
        ? `Imported ${outcome.added[0].name}`
        : `Imported ${outcome.added.length} files`,
    )
  }
  return outcome
}
