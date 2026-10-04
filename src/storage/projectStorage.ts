import { create } from 'zustand'
import {
  releaseAllMedia,
  registerFile,
  makeThumbnail,
} from '@/engine/mediaLibrary'
import { useEditorStore } from '@/features/editor/store'
import type { MediaAsset, TimelineDocument } from '@/features/timeline/types'

const DB_NAME = 'framewright'
const STORE_NAME = 'projects'
const PROJECT_KEY = 'current'
const MEDIA_DIR = 'media'
const SAVE_DEBOUNCE_MS = 800

interface PersistedProject {
  version: 1
  doc: TimelineDocument
  media: Omit<MediaAsset, 'thumbnailUrl'>[]
  savedAt: number
}

export interface SaveStatus {
  state: 'idle' | 'saving' | 'saved' | 'error'
  at: number | null
  message?: string
}

export const useSaveStatus = create<SaveStatus>()(() => ({
  state: 'idle',
  at: null,
}))

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDatabase()
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = run(
        db.transaction(STORE_NAME, mode).objectStore(STORE_NAME),
      )
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

async function mediaDirectory(
  create: boolean,
): Promise<FileSystemDirectoryHandle | null> {
  if (!navigator.storage?.getDirectory) return null
  try {
    const root = await navigator.storage.getDirectory()
    return await root.getDirectoryHandle(MEDIA_DIR, { create })
  } catch {
    return null
  }
}

export async function persistMediaFile(
  mediaId: string,
  file: File,
): Promise<void> {
  const dir = await mediaDirectory(true)
  if (!dir) return
  try {
    const handle = await dir.getFileHandle(mediaId, { create: true })
    const writable = await handle.createWritable()
    await writable.write(file)
    await writable.close()
  } catch {
    return
  }
}

async function readMediaFile(
  asset: Omit<MediaAsset, 'thumbnailUrl'>,
): Promise<File | null> {
  const dir = await mediaDirectory(false)
  if (!dir) return null
  try {
    const handle = await dir.getFileHandle(asset.id)
    const stored = await handle.getFile()
    return new File([stored], asset.name, { type: asset.mimeType ?? '' })
  } catch {
    return null
  }
}

export async function saveProjectNow(): Promise<void> {
  const { doc, media } = useEditorStore.getState()
  useSaveStatus.setState({ state: 'saving' })
  try {
    const persisted: PersistedProject = {
      version: 1,
      doc,
      media: media.map(({ thumbnailUrl: _thumbnail, ...rest }) => rest),
      savedAt: Date.now(),
    }
    await withStore('readwrite', (store) => store.put(persisted, PROJECT_KEY))
    useSaveStatus.setState({
      state: 'saved',
      at: persisted.savedAt,
      message: undefined,
    })
  } catch (error) {
    useSaveStatus.setState({
      state: 'error',
      message: error instanceof Error ? error.message : 'Could not save',
    })
    throw error
  }
}

export async function clearLocalData(): Promise<void> {
  releaseAllMedia()
  await withStore('readwrite', (store) => store.clear()).catch(() => undefined)
  if (navigator.storage?.getDirectory) {
    try {
      const root = await navigator.storage.getDirectory()
      await root.removeEntry(MEDIA_DIR, { recursive: true })
    } catch {
      return
    }
  }
  useSaveStatus.setState({ state: 'idle', at: null, message: undefined })
}

export async function removeStoredMedia(mediaId: string): Promise<void> {
  const dir = await mediaDirectory(false)
  if (!dir) return
  try {
    await dir.removeEntry(mediaId)
  } catch {
    return
  }
}

export async function hydrateFromStorage(): Promise<void> {
  try {
    const persisted = await withStore<PersistedProject | undefined>(
      'readonly',
      (store) => store.get(PROJECT_KEY),
    )
    if (persisted && persisted.version === 1) {
      const media: MediaAsset[] = []
      for (const entry of persisted.media) {
        const file = await readMediaFile(entry)
        if (!file) continue
        registerFile(entry.id, file)
        media.push(entry)
      }
      const available = new Set(media.map((asset) => asset.id))
      const doc: TimelineDocument = {
        ...persisted.doc,
        items: persisted.doc.items.filter(
          (item) => item.kind === 'text' || available.has(item.mediaId),
        ),
      }
      useEditorStore.getState().replaceProject(doc, media)
      useSaveStatus.setState({ state: 'saved', at: persisted.savedAt })
      for (const asset of media) {
        const file = await readMediaFile(asset)
        if (!file) continue
        void makeThumbnail(file, asset).then((thumbnailUrl) => {
          if (thumbnailUrl)
            useEditorStore.getState().patchMedia(asset.id, { thumbnailUrl })
        })
      }
    }
  } catch {
    useSaveStatus.setState({ state: 'idle' })
  } finally {
    useEditorStore.getState().setHydrated()
  }
}

let timer: number | undefined
let lastRevision = -1

export function startAutosave(): () => void {
  lastRevision = useEditorStore.getState().revision
  const unsubscribe = useEditorStore.subscribe((state) => {
    if (!state.hydrated || state.revision === lastRevision) return
    lastRevision = state.revision
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      void saveProjectNow().catch(() => undefined)
    }, SAVE_DEBOUNCE_MS)
  })
  return () => {
    unsubscribe()
    window.clearTimeout(timer)
  }
}

export async function storageEstimate(): Promise<{
  usage: number
  quota: number
} | null> {
  if (!navigator.storage?.estimate) return null
  const estimate = await navigator.storage.estimate()
  return { usage: estimate.usage ?? 0, quota: estimate.quota ?? 0 }
}
