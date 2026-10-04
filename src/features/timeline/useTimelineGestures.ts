import { useCallback, useEffect, useRef, useState } from 'react'
import { itemEnd } from './ops'
import type {
  Seconds,
  TimelineDocument,
  TimelineItem,
  TimelineTool,
  TrimEdge,
} from './types'

export type GesturePhase = 'start' | 'update' | 'end' | 'cancel'

export interface GestureCallbacks {
  onSelect: (itemId: string, additive: boolean) => void
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
  onSplitAt: (payload: { itemId: string; time: Seconds }) => void
}

interface GestureInputs extends GestureCallbacks {
  doc: TimelineDocument
  pxPerSecond: number
  snapEnabled: boolean
  playheadTime: Seconds
  markIn: Seconds | null
  markOut: Seconds | null
  selectedIds: string[]
  tool: TimelineTool
}

const SNAP_PIXELS = 8
const DRAG_THRESHOLD_PIXELS = 3

interface ActiveGesture {
  kind: 'move' | 'trim'
  itemId: string
  edge?: TrimEdge
  startX: number
  origin: Seconds
  duration: Seconds
  started: boolean
}

export function useTimelineGestures(inputs: GestureInputs) {
  const ref = useRef(inputs)
  const [snapGuide, setSnapGuide] = useState<Seconds | null>(null)
  const active = useRef<ActiveGesture | null>(null)

  useEffect(() => {
    ref.current = inputs
  })

  const snapCandidates = useCallback((excludeId: string): Seconds[] => {
    const { doc, playheadTime, markIn, markOut } = ref.current
    const points = [0, playheadTime]
    if (markIn !== null) points.push(markIn)
    if (markOut !== null) points.push(markOut)
    for (const item of doc.items) {
      if (item.id === excludeId) continue
      points.push(item.start, itemEnd(item))
    }
    return points
  }, [])

  const snap = useCallback(
    (
      times: Seconds[],
      excludeId: string,
    ): { delta: number; guide: Seconds | null } => {
      const { snapEnabled, pxPerSecond } = ref.current
      if (!snapEnabled) return { delta: 0, guide: null }
      const threshold = SNAP_PIXELS / pxPerSecond
      let best: { delta: number; guide: Seconds } | null = null
      for (const time of times) {
        for (const point of snapCandidates(excludeId)) {
          const delta = point - time
          if (
            Math.abs(delta) <= threshold &&
            (!best || Math.abs(delta) < Math.abs(best.delta))
          ) {
            best = { delta, guide: point }
          }
        }
      }
      return best ?? { delta: 0, guide: null }
    },
    [snapCandidates],
  )

  const finish = useCallback((phase: 'end' | 'cancel') => {
    const gesture = active.current
    active.current = null
    setSnapGuide(null)
    if (!gesture || !gesture.started) return
    const { onItemDrag, onItemTrim } = ref.current
    if (gesture.kind === 'move') {
      onItemDrag({ itemId: gesture.itemId, start: gesture.origin, phase })
    } else if (gesture.edge) {
      onItemTrim({
        itemId: gesture.itemId,
        edge: gesture.edge,
        time: gesture.origin,
        phase,
      })
    }
  }, [])

  useEffect(() => {
    function onMove(event: PointerEvent) {
      const gesture = active.current
      if (!gesture) return
      const { pxPerSecond, onItemDrag, onItemTrim } = ref.current
      const dx = event.clientX - gesture.startX
      if (!gesture.started) {
        if (Math.abs(dx) < DRAG_THRESHOLD_PIXELS) return
        gesture.started = true
        if (gesture.kind === 'move') {
          onItemDrag({
            itemId: gesture.itemId,
            start: gesture.origin,
            phase: 'start',
          })
        } else if (gesture.edge) {
          onItemTrim({
            itemId: gesture.itemId,
            edge: gesture.edge,
            time: gesture.origin,
            phase: 'start',
          })
        }
      }
      const raw = gesture.origin + dx / pxPerSecond
      if (gesture.kind === 'move') {
        const { delta, guide } = snap(
          [raw, raw + gesture.duration],
          gesture.itemId,
        )
        setSnapGuide(guide)
        onItemDrag({
          itemId: gesture.itemId,
          start: Math.max(0, raw + delta),
          phase: 'update',
        })
      } else if (gesture.edge) {
        const { delta, guide } = snap([raw], gesture.itemId)
        setSnapGuide(guide)
        onItemTrim({
          itemId: gesture.itemId,
          edge: gesture.edge,
          time: Math.max(0, raw + delta),
          phase: 'update',
        })
      }
    }
    function onUp() {
      finish('end')
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && active.current) finish('cancel')
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('keydown', onKey)
    }
  }, [finish, snap])

  const beginMove = useCallback(
    (item: TimelineItem, event: React.PointerEvent) => {
      if (event.button !== 0) return
      const { doc, tool, selectedIds, pxPerSecond, onSelect, onSplitAt } =
        ref.current
      const track = doc.tracks.find(
        (candidate) => candidate.id === item.trackId,
      )
      if (tool === 'razor') {
        const lane = (event.currentTarget as HTMLElement).parentElement
        if (lane && !track?.locked) {
          const rect = lane.getBoundingClientRect()
          onSplitAt({
            itemId: item.id,
            time: (event.clientX - rect.left) / pxPerSecond,
          })
        }
        return
      }
      if (!selectedIds.includes(item.id)) {
        onSelect(item.id, event.shiftKey || event.metaKey || event.ctrlKey)
      }
      if (track?.locked) return
      active.current = {
        kind: 'move',
        itemId: item.id,
        startX: event.clientX,
        origin: item.start,
        duration: item.duration,
        started: false,
      }
    },
    [],
  )

  const beginTrim = useCallback(
    (item: TimelineItem, edge: TrimEdge, event: React.PointerEvent) => {
      if (event.button !== 0) return
      event.stopPropagation()
      const { doc, onSelect, selectedIds } = ref.current
      if (doc.tracks.find((candidate) => candidate.id === item.trackId)?.locked)
        return
      if (!selectedIds.includes(item.id)) onSelect(item.id, false)
      active.current = {
        kind: 'trim',
        itemId: item.id,
        edge,
        startX: event.clientX,
        origin: edge === 'in' ? item.start : itemEnd(item),
        duration: item.duration,
        started: false,
      }
    },
    [],
  )

  return { snapGuide, beginMove, beginTrim }
}
