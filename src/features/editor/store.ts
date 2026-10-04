import {
  applyPatches,
  enablePatches,
  produce,
  produceWithPatches,
  type Patch,
} from 'immer'
import { create } from 'zustand'
import {
  addItem,
  arrangeItems,
  isVisual,
  type ArrangeAction,
  createEmptyDocument,
  deleteItems,
  isItemLocked,
  itemEnd,
  moveItem,
  renameDocument,
  splitItem,
  toFrame,
  toggleTrack,
  trimItem,
  updateItem,
  type ItemPatchInput,
  type Mutator,
  type OpContext,
} from '@/features/timeline/ops'
import type {
  MediaAsset,
  Seconds,
  TimelineDocument,
  TimelineItem,
  TrackToggle,
  TrimEdge,
} from '@/features/timeline/types'

enablePatches()

const HISTORY_LIMIT = 200
const COALESCE_WINDOW_MS = 900

interface HistoryEntry {
  patches: Patch[]
  inverse: Patch[]
  key?: string
  at: number
}

export type TextPreset = 'title' | 'subtitle' | 'caption'

const TEXT_PRESETS: Record<
  TextPreset,
  { text: string; fontSize: number; y: number; duration: number }
> = {
  title: { text: 'Title', fontSize: 110, y: 0.5, duration: 3 },
  subtitle: { text: 'Subtitle', fontSize: 68, y: 0.62, duration: 3 },
  caption: { text: 'Caption', fontSize: 46, y: 0.82, duration: 3 },
}

export interface EditorState {
  doc: TimelineDocument
  media: MediaAsset[]
  selectedIds: string[]
  markIn: Seconds | null
  markOut: Seconds | null
  past: HistoryEntry[]
  future: HistoryEntry[]
  gestureBase: TimelineDocument | null
  revision: number
  hydrated: boolean

  setSelection: (ids: string[]) => void
  setMarks: (markIn: Seconds | null, markOut: Seconds | null) => void
  commit: (mutator: Mutator, options?: { coalesceKey?: string }) => void
  beginGesture: () => void
  previewGesture: (mutator: Mutator) => void
  endGesture: () => void
  cancelGesture: () => void
  undo: () => void
  redo: () => void

  addMedia: (asset: MediaAsset) => void
  patchMedia: (mediaId: string, patch: Partial<MediaAsset>) => void
  replaceProject: (doc: TimelineDocument, media: MediaAsset[]) => void
  setHydrated: () => void

  splitAtPlayhead: (time: Seconds) => number
  splitItemAt: (itemId: string, time: Seconds) => boolean
  deleteSelected: (ripple: boolean) => void
  trimByFrames: (itemId: string, edge: TrimEdge, deltaFrames: number) => void
  moveByFrames: (itemId: string, deltaFrames: number) => void
  trimTo: (itemId: string, edge: TrimEdge, time: Seconds) => void
  moveTo: (itemId: string, start: Seconds) => void
  addMediaToTimeline: (
    mediaId: string,
    options: { track?: 'audio' | 'music'; atTime: Seconds },
  ) => string | null
  addText: (preset: TextPreset, atTime: Seconds) => string
  arrangeSelected: (action: ArrangeAction) => void
  toggleTrackFlag: (trackId: string, toggle: TrackToggle) => void
  updateSelectedItem: (itemId: string, patch: ItemPatchInput) => void
  rename: (name: string) => void
  newProject: () => void
}

function contextFor(doc: TimelineDocument, media: MediaAsset[]): OpContext {
  return {
    fps: doc.fps,
    maxSourceSeconds: (item: TimelineItem) => {
      if (item.kind === 'text') return Infinity
      const asset = media.find((candidate) => candidate.id === item.mediaId)
      if (!asset || asset.kind === 'image') return Infinity
      return asset.duration
    },
  }
}

function trackEnd(doc: TimelineDocument, trackId: string): Seconds {
  return doc.items
    .filter((item) => item.trackId === trackId)
    .reduce((max, item) => Math.max(max, itemEnd(item)), 0)
}

export const useEditorStore = create<EditorState>()((set, get) => {
  function apply(next: TimelineDocument, entry: HistoryEntry | null) {
    set((state) => {
      let past = state.past
      if (entry) {
        const last = past[past.length - 1]
        const canMerge =
          entry.key !== undefined &&
          last?.key === entry.key &&
          entry.at - last.at < COALESCE_WINDOW_MS &&
          state.future.length === 0
        past = canMerge
          ? [
              ...past.slice(0, -1),
              {
                patches: [...last.patches, ...entry.patches],
                inverse: [...entry.inverse, ...last.inverse],
                key: entry.key,
                at: entry.at,
              },
            ]
          : [...past, entry].slice(-HISTORY_LIMIT)
      }
      const ids = new Set(next.items.map((item) => item.id))
      return {
        doc: next,
        past,
        future: entry ? [] : state.future,
        selectedIds: state.selectedIds.filter((id) => ids.has(id)),
        revision: state.revision + 1,
      }
    })
  }

  function commit(mutator: Mutator, options?: { coalesceKey?: string }) {
    const { doc } = get()
    const [next, patches, inverse] = produceWithPatches(doc, mutator)
    if (patches.length === 0) return
    apply(next, { patches, inverse, key: options?.coalesceKey, at: Date.now() })
  }

  function ctx() {
    const { doc, media } = get()
    return contextFor(doc, media)
  }

  return {
    doc: createEmptyDocument(),
    media: [],
    selectedIds: [],
    markIn: null,
    markOut: null,
    past: [],
    future: [],
    gestureBase: null,
    revision: 0,
    hydrated: false,

    setSelection: (ids) => set({ selectedIds: ids }),
    setMarks: (markIn, markOut) => set({ markIn, markOut }),
    commit,

    beginGesture: () => {
      if (get().gestureBase === null) set({ gestureBase: get().doc })
    },
    previewGesture: (mutator) => {
      const base = get().gestureBase
      if (!base) return
      set((state) => ({
        doc: produce(base, mutator),
        revision: state.revision + 1,
      }))
    },
    endGesture: () => {
      const { gestureBase, doc } = get()
      if (!gestureBase) return
      set({ gestureBase: null })
      if (gestureBase === doc) return
      const [next, patches, inverse] = produceWithPatches(
        gestureBase,
        (draft) => {
          draft.items = doc.items as typeof draft.items
          draft.duration = doc.duration
        },
      )
      if (patches.length === 0) return
      apply(next, { patches, inverse, at: Date.now() })
    },
    cancelGesture: () => {
      const { gestureBase } = get()
      if (!gestureBase) return
      set((state) => ({
        doc: gestureBase,
        gestureBase: null,
        revision: state.revision + 1,
      }))
    },

    undo: () => {
      const { past, doc, future } = get()
      const entry = past[past.length - 1]
      if (!entry) return
      const next = applyPatches(doc, entry.inverse)
      apply(next, null)
      set({ past: past.slice(0, -1), future: [...future, entry] })
    },
    redo: () => {
      const { future, doc, past } = get()
      const entry = future[future.length - 1]
      if (!entry) return
      const next = applyPatches(doc, entry.patches)
      apply(next, null)
      set({
        future: future.slice(0, -1),
        past: [...past, { ...entry, key: undefined }],
      })
    },

    addMedia: (asset) =>
      set((state) => ({
        media: [...state.media, asset],
        revision: state.revision + 1,
      })),
    patchMedia: (mediaId, patch) =>
      set((state) => ({
        media: state.media.map((asset) =>
          asset.id === mediaId ? { ...asset, ...patch } : asset,
        ),
        revision: state.revision + 1,
      })),
    replaceProject: (doc, media) =>
      set((state) => ({
        doc,
        media,
        selectedIds: [],
        markIn: null,
        markOut: null,
        past: [],
        future: [],
        gestureBase: null,
        revision: state.revision + 1,
      })),
    setHydrated: () => set({ hydrated: true }),

    splitAtPlayhead: (time) => {
      const { doc, selectedIds } = get()
      const fps = doc.fps
      const at = toFrame(time, fps)
      const underPlayhead = doc.items.filter(
        (item) =>
          at > item.start + 1e-9 &&
          at < itemEnd(item) - 1e-9 &&
          !isItemLocked(doc, item.id),
      )
      const selectedUnder = underPlayhead.filter((item) =>
        selectedIds.includes(item.id),
      )
      const candidates =
        selectedUnder.length > 0 ? selectedUnder : underPlayhead
      if (candidates.length === 0) return 0
      const created: string[] = []
      commit((draft) => {
        for (const item of candidates) {
          const id = crypto.randomUUID()
          if (splitItem(draft, item.id, at, id, fps)) created.push(id)
        }
      })
      set({ selectedIds: created })
      return created.length
    },
    splitItemAt: (itemId, time) => {
      const { doc } = get()
      if (isItemLocked(doc, itemId)) return false
      let done = false
      const id = crypto.randomUUID()
      commit((draft) => {
        done = splitItem(draft, itemId, time, id, doc.fps)
      })
      if (done) set({ selectedIds: [id] })
      return done
    },
    deleteSelected: (ripple) => {
      const { doc, selectedIds } = get()
      const ids = selectedIds.filter((id) => !isItemLocked(doc, id))
      if (ids.length === 0) return
      commit((draft) => deleteItems(draft, ids, ripple))
    },
    trimByFrames: (itemId, edge, deltaFrames) => {
      const { doc } = get()
      const item = doc.items.find((candidate) => candidate.id === itemId)
      if (!item || isItemLocked(doc, itemId)) return
      const base = edge === 'in' ? item.start : itemEnd(item)
      const time = base + deltaFrames / doc.fps
      commit((draft) => trimItem(draft, itemId, edge, time, ctx()), {
        coalesceKey: `trim:${itemId}:${edge}`,
      })
    },
    moveByFrames: (itemId, deltaFrames) => {
      const { doc } = get()
      const item = doc.items.find((candidate) => candidate.id === itemId)
      if (!item || isItemLocked(doc, itemId)) return
      commit(
        (draft) =>
          moveItem(draft, itemId, item.start + deltaFrames / doc.fps, doc.fps),
        {
          coalesceKey: `move:${itemId}`,
        },
      )
    },
    trimTo: (itemId, edge, time) => {
      const { doc } = get()
      if (isItemLocked(doc, itemId)) return
      const context = ctx()
      get().previewGesture((draft) =>
        trimItem(draft, itemId, edge, time, context),
      )
    },
    moveTo: (itemId, start) => {
      const { doc } = get()
      if (isItemLocked(doc, itemId)) return
      get().previewGesture((draft) => moveItem(draft, itemId, start, doc.fps))
    },

    addMediaToTimeline: (mediaId, options) => {
      const { doc, media } = get()
      const asset = media.find((candidate) => candidate.id === mediaId)
      if (!asset) return null
      const id = crypto.randomUUID()
      if (asset.kind === 'audio') {
        const trackId = options.track === 'music' ? 't-m1' : 't-a1'
        const duration = toFrame(asset.duration, doc.fps)
        commit((draft) =>
          addItem(draft, {
            id,
            kind: 'audio',
            trackId,
            mediaId,
            name: asset.name,
            start: toFrame(options.atTime, doc.fps),
            duration,
            sourceIn: 0,
            sourceOut: asset.duration,
            speed: 1,
            volume: options.track === 'music' ? 0.4 : 1,
            muted: false,
          }),
        )
      } else {
        const duration = toFrame(asset.duration, doc.fps)
        const landscape = (asset.width ?? 0) > (asset.height ?? 0)
        commit((draft) =>
          addItem(draft, {
            id,
            kind: 'video',
            trackId: 't-v1',
            mediaId,
            name: asset.name,
            start: toFrame(trackEnd(doc, 't-v1'), doc.fps),
            duration,
            sourceIn: 0,
            sourceOut: asset.duration,
            speed: 1,
            volume: 1,
            muted: false,
            transform: {
              x: 0,
              y: 0,
              scale: 1,
              fit: landscape ? 'fit' : 'fill',
            },
          }),
        )
      }
      set({ selectedIds: [id] })
      return id
    },
    addText: (preset, atTime) => {
      const { doc } = get()
      const config = TEXT_PRESETS[preset]
      const id = crypto.randomUUID()
      commit((draft) =>
        addItem(draft, {
          id,
          kind: 'text',
          trackId: 't-t1',
          start: toFrame(atTime, doc.fps),
          duration: config.duration,
          text: config.text,
          fontFamily: 'Geist',
          fontSize: config.fontSize,
          color: '#ffffff',
          position: { x: 0.5, y: config.y },
        }),
      )
      set({ selectedIds: [id] })
      return id
    },
    arrangeSelected: (action) => {
      const { doc, selectedIds } = get()
      const ids = doc.items
        .filter(
          (item) =>
            selectedIds.includes(item.id) &&
            isVisual(item) &&
            !isItemLocked(doc, item.id),
        )
        .map((item) => item.id)
      if (ids.length === 0) return
      commit((draft) => arrangeItems(draft, ids, action))
    },
    toggleTrackFlag: (trackId, toggle) =>
      commit((draft) => toggleTrack(draft, trackId, toggle)),
    updateSelectedItem: (itemId, patch) => {
      const context = ctx()
      commit((draft) => updateItem(draft, itemId, patch, context), {
        coalesceKey: `update:${itemId}:${Object.keys(patch).sort().join(',')}`,
      })
    },
    rename: (name) => commit((draft) => renameDocument(draft, name)),
    newProject: () => get().replaceProject(createEmptyDocument(), []),
  }
})
