import type { Draft } from 'immer'
import type {
  Seconds,
  TimelineDocument,
  TimelineItem,
  Track,
  TrackToggle,
  TrimEdge,
} from './types'

export type Mutator = (draft: Draft<TimelineDocument>) => void

export interface OpContext {
  fps: number
  maxSourceSeconds: (item: TimelineItem) => Seconds
}

export interface ItemPatchInput {
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
  transform?: {
    x?: number
    y?: number
    scale?: number
    fit?: 'fit' | 'fill' | 'crop'
  }
}

export const MIN_SPEED = 0.5
export const MAX_SPEED = 2
export const MAX_VOLUME = 2

export function toFrame(time: Seconds, fps: number): Seconds {
  return Math.round(time * fps) / fps
}

export function itemEnd(item: { start: Seconds; duration: Seconds }): Seconds {
  return item.start + item.duration
}

export function documentDuration(items: readonly TimelineItem[]): Seconds {
  return items.reduce((max, item) => Math.max(max, itemEnd(item)), 0)
}

export function findItem(doc: TimelineDocument, itemId: string) {
  return doc.items.find((item) => item.id === itemId)
}

export function findTrack(
  doc: TimelineDocument,
  trackId: string,
): Track | undefined {
  return doc.tracks.find((track) => track.id === trackId)
}

export function isItemLocked(doc: TimelineDocument, itemId: string): boolean {
  const item = findItem(doc, itemId)
  if (!item) return false
  return findTrack(doc, item.trackId)?.locked ?? false
}

export function trackItems(
  doc: TimelineDocument,
  trackId: string,
): TimelineItem[] {
  return doc.items
    .filter((item) => item.trackId === trackId)
    .sort((a, b) => a.start - b.start)
}

function hasSource(
  item: TimelineItem,
): item is Exclude<TimelineItem, { kind: 'text' }> {
  return item.kind !== 'text'
}

export function settle(
  draft: Draft<TimelineDocument>,
  trackId: string,
  pinnedId?: string,
) {
  const items = draft.items.filter((item) => item.trackId === trackId)
  items.sort((a, b) => {
    const centreA = a.start + a.duration / 2
    const centreB = b.start + b.duration / 2
    if (Math.abs(centreA - centreB) < 1e-9) {
      if (a.id === pinnedId) return -1
      if (b.id === pinnedId) return 1
    }
    return centreA - centreB
  })
  let cursor = 0
  for (const item of items) {
    if (item.start < cursor) item.start = cursor
    cursor = item.start + item.duration
  }
  draft.duration = documentDuration(draft.items)
}

export function addItem(draft: Draft<TimelineDocument>, item: TimelineItem) {
  draft.items.push(item)
  settle(draft, item.trackId, item.id)
}

export function splitItem(
  draft: Draft<TimelineDocument>,
  itemId: string,
  time: Seconds,
  newId: string,
  fps: number,
): boolean {
  const item = draft.items.find((candidate) => candidate.id === itemId)
  if (!item) return false
  const at = toFrame(time, fps)
  const min = 1 / fps
  if (at - item.start < min - 1e-9 || itemEnd(item) - at < min - 1e-9)
    return false
  const original = JSON.parse(JSON.stringify(item)) as TimelineItem
  const originalEnd = itemEnd(original)
  const firstDuration = at - item.start
  item.duration = firstDuration
  if (hasSource(item)) {
    item.sourceOut = item.sourceIn + firstDuration * item.speed
  }
  const second = original
  second.id = newId
  second.start = at
  second.duration = originalEnd - at
  if (hasSource(second)) {
    const originalSource = original as typeof second
    second.sourceIn =
      originalSource.sourceIn + firstDuration * originalSource.speed
  }
  draft.items.push(second)
  draft.duration = documentDuration(draft.items)
  return true
}

export function deleteItems(
  draft: Draft<TimelineDocument>,
  itemIds: readonly string[],
  ripple: boolean,
) {
  const ids = new Set(itemIds)
  const removed = draft.items.filter((item) => ids.has(item.id))
  draft.items = draft.items.filter((item) => !ids.has(item.id))
  if (ripple) {
    for (const item of draft.items) {
      let shift = 0
      for (const gone of removed) {
        if (gone.trackId === item.trackId && gone.start < item.start) {
          shift += gone.duration
        }
      }
      if (shift > 0) item.start = Math.max(0, item.start - shift)
    }
  }
  draft.duration = documentDuration(draft.items)
}

export function moveItem(
  draft: Draft<TimelineDocument>,
  itemId: string,
  start: Seconds,
  fps: number,
) {
  const item = draft.items.find((candidate) => candidate.id === itemId)
  if (!item) return
  item.start = Math.max(0, toFrame(start, fps))
  settle(draft, item.trackId, item.id)
}

export function trimItem(
  draft: Draft<TimelineDocument>,
  itemId: string,
  edge: TrimEdge,
  time: Seconds,
  ctx: OpContext,
) {
  const item = draft.items.find((candidate) => candidate.id === itemId)
  if (!item) return
  const min = 1 / ctx.fps
  const siblings = draft.items
    .filter((other) => other.trackId === item.trackId && other.id !== item.id)
    .sort((a, b) => a.start - b.start)
  const end = itemEnd(item)
  const at = toFrame(time, ctx.fps)

  if (edge === 'in') {
    const previous = siblings
      .filter((other) => itemEnd(other) <= item.start + 1e-9)
      .pop()
    let lower = previous ? itemEnd(previous) : 0
    if (hasSource(item))
      lower = Math.max(lower, item.start - item.sourceIn / item.speed)
    const next = Math.min(Math.max(at, lower), end - min)
    const delta = next - item.start
    item.start = next
    item.duration = end - next
    if (hasSource(item))
      item.sourceIn = Math.max(0, item.sourceIn + delta * item.speed)
  } else {
    const following = siblings.find((other) => other.start >= end - 1e-9)
    let upper = following ? following.start : Infinity
    if (hasSource(item)) {
      const available =
        (ctx.maxSourceSeconds(item) - item.sourceIn) / item.speed
      upper = Math.min(upper, item.start + available)
    }
    const next = Math.max(Math.min(at, upper), item.start + min)
    item.duration = next - item.start
    if (hasSource(item))
      item.sourceOut = item.sourceIn + item.duration * item.speed
  }
  draft.duration = documentDuration(draft.items)
}

export function updateItem(
  draft: Draft<TimelineDocument>,
  itemId: string,
  patch: ItemPatchInput,
  ctx: OpContext,
) {
  const item = draft.items.find((candidate) => candidate.id === itemId)
  if (!item) return
  let layoutChanged = false

  if (patch.name !== undefined && hasSource(item)) item.name = patch.name
  if (patch.start !== undefined) {
    item.start = Math.max(0, toFrame(patch.start, ctx.fps))
    layoutChanged = true
  }

  if (item.kind === 'text') {
    if (patch.text !== undefined) item.text = patch.text
    if (patch.fontFamily !== undefined) item.fontFamily = patch.fontFamily
    if (patch.fontSize !== undefined)
      item.fontSize = Math.max(8, Math.min(400, patch.fontSize))
    if (patch.color !== undefined) item.color = patch.color
    if (patch.position) {
      item.position = {
        x: Math.max(0, Math.min(1, patch.position.x)),
        y: Math.max(0, Math.min(1, patch.position.y)),
      }
    }
    if (patch.duration !== undefined) {
      item.duration = Math.max(1 / ctx.fps, toFrame(patch.duration, ctx.fps))
      layoutChanged = true
    }
  } else {
    if (patch.volume !== undefined)
      item.volume = Math.max(0, Math.min(MAX_VOLUME, patch.volume))
    if (patch.muted !== undefined) item.muted = patch.muted
    if (patch.speed !== undefined) {
      item.speed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, patch.speed))
      item.duration = Math.max(
        1 / ctx.fps,
        (item.sourceOut - item.sourceIn) / item.speed,
      )
      layoutChanged = true
    }
    if (patch.duration !== undefined) {
      const maxDuration =
        (ctx.maxSourceSeconds(item) - item.sourceIn) / item.speed
      item.duration = Math.max(
        1 / ctx.fps,
        Math.min(toFrame(patch.duration, ctx.fps), maxDuration),
      )
      item.sourceOut = item.sourceIn + item.duration * item.speed
      layoutChanged = true
    }
    if (item.kind === 'video' && patch.transform) {
      const { x, y, scale, fit } = patch.transform
      if (x !== undefined) item.transform.x = Math.max(-2, Math.min(2, x))
      if (y !== undefined) item.transform.y = Math.max(-2, Math.min(2, y))
      if (scale !== undefined)
        item.transform.scale = Math.max(0.1, Math.min(4, scale))
      if (fit !== undefined) item.transform.fit = fit
    }
  }

  if (layoutChanged) settle(draft, item.trackId, item.id)
}

export function toggleTrack(
  draft: Draft<TimelineDocument>,
  trackId: string,
  toggle: TrackToggle,
) {
  const track = draft.tracks.find((candidate) => candidate.id === trackId)
  if (track) track[toggle] = !track[toggle]
}

export function renameDocument(draft: Draft<TimelineDocument>, name: string) {
  draft.name = name.trim() === '' ? 'Untitled project' : name.trim()
}

export function createEmptyDocument(): TimelineDocument {
  return {
    id: crypto.randomUUID(),
    name: 'Untitled project',
    fps: 30,
    width: 1080,
    height: 1920,
    duration: 0,
    tracks: [
      {
        id: 't-v1',
        kind: 'video',
        label: 'V1',
        name: 'Video 1',
        muted: false,
        locked: false,
        solo: false,
      },
      {
        id: 't-t1',
        kind: 'text',
        label: 'T1',
        name: 'Text 1',
        muted: false,
        locked: false,
        solo: false,
      },
      {
        id: 't-a1',
        kind: 'audio',
        label: 'A1',
        name: 'Audio 1',
        muted: false,
        locked: false,
        solo: false,
      },
      {
        id: 't-m1',
        kind: 'music',
        label: 'Music',
        name: 'Music',
        muted: false,
        locked: false,
        solo: false,
      },
    ],
    items: [],
  }
}

export function itemsAt(doc: TimelineDocument, time: Seconds): TimelineItem[] {
  return doc.items.filter(
    (item) => time >= item.start - 1e-9 && time < itemEnd(item) - 1e-9,
  )
}
