import { produce } from 'immer'
import { describe, expect, it } from 'vitest'
import {
  addItem,
  arrangeItems,
  itemZ,
  sortForCompositing,
  createEmptyDocument,
  deleteItems,
  moveItem,
  splitItem,
  trimItem,
  updateItem,
  type OpContext,
} from './ops'
import type { TimelineDocument, VideoClip } from './types'

const ctx: OpContext = { fps: 30, maxSourceSeconds: () => 20 }

function clip(
  id: string,
  start: number,
  duration: number,
  sourceIn = 0,
): VideoClip {
  return {
    id,
    kind: 'video',
    trackId: 't-v1',
    mediaId: 'm',
    name: id,
    start,
    duration,
    sourceIn,
    sourceOut: sourceIn + duration,
    speed: 1,
    volume: 1,
    muted: false,
    transform: { x: 0, y: 0, scale: 1, fit: 'fill' },
  }
}

function docWith(...clips: VideoClip[]): TimelineDocument {
  return produce(createEmptyDocument(), (draft) => {
    for (const item of clips) addItem(draft, item)
  })
}

describe('splitItem', () => {
  it('splits a clip and keeps source continuity', () => {
    const doc = produce(docWith(clip('a', 0, 10, 2)), (d) => {
      splitItem(d, 'a', 4, 'b', 30)
    })
    const [first, second] = doc.items as VideoClip[]
    expect(first.duration).toBeCloseTo(4)
    expect(first.sourceOut).toBeCloseTo(6)
    expect(second.start).toBeCloseTo(4)
    expect(second.duration).toBeCloseTo(6)
    expect(second.sourceIn).toBeCloseTo(6)
    expect(second.sourceOut).toBeCloseTo(12)
    expect(doc.duration).toBeCloseTo(10)
  })

  it('accounts for speed when splitting', () => {
    const base = clip('a', 0, 5, 0)
    base.speed = 2
    base.sourceOut = 10
    const doc = produce(docWith(base), (d) => {
      splitItem(d, 'a', 2, 'b', 30)
    })
    const second = doc.items[1] as VideoClip
    expect(second.sourceIn).toBeCloseTo(4)
  })

  it('refuses to split at an edge', () => {
    const doc = docWith(clip('a', 0, 10))
    const next = produce(doc, (d) => {
      expect(splitItem(d, 'a', 0, 'b', 30)).toBe(false)
      expect(splitItem(d, 'a', 10, 'b', 30)).toBe(false)
    })
    expect(next.items).toHaveLength(1)
  })
})

describe('deleteItems', () => {
  it('leaves a gap on a plain delete', () => {
    const doc = produce(
      docWith(clip('a', 0, 5), clip('b', 5, 5), clip('c', 10, 5)),
      (d) => {
        deleteItems(d, ['b'], false)
      },
    )
    expect(doc.items.map((i) => i.id)).toEqual(['a', 'c'])
    expect(doc.items[1].start).toBeCloseTo(10)
  })

  it('closes the gap on a ripple delete', () => {
    const doc = produce(
      docWith(clip('a', 0, 5), clip('b', 5, 5), clip('c', 10, 5)),
      (d) => {
        deleteItems(d, ['b'], true)
      },
    )
    expect(doc.items[1].start).toBeCloseTo(5)
    expect(doc.duration).toBeCloseTo(10)
  })
})

describe('moveItem', () => {
  it('reorders by pushing neighbours right', () => {
    const doc = produce(docWith(clip('a', 0, 5), clip('b', 5, 5)), (d) => {
      moveItem(d, 'b', 0, 30)
    })
    const byId = Object.fromEntries(doc.items.map((i) => [i.id, i.start]))
    expect(byId.b).toBeCloseTo(0)
    expect(byId.a).toBeCloseTo(5)
  })

  it('never overlaps and never goes below zero', () => {
    const doc = produce(docWith(clip('a', 0, 5), clip('b', 6, 5)), (d) => {
      moveItem(d, 'a', -3, 30)
    })
    expect(doc.items.find((i) => i.id === 'a')!.start).toBe(0)
  })
})

describe('trimItem', () => {
  it('trims the in edge and advances the source in point', () => {
    const doc = produce(docWith(clip('a', 2, 6, 1)), (d) => {
      trimItem(d, 'a', 'in', 4, ctx)
    })
    const item = doc.items[0] as VideoClip
    expect(item.start).toBeCloseTo(4)
    expect(item.duration).toBeCloseTo(4)
    expect(item.sourceIn).toBeCloseTo(3)
  })

  it('cannot extend the out edge past the source or a neighbour', () => {
    const doc = produce(docWith(clip('a', 0, 5, 0), clip('b', 8, 4)), (d) => {
      trimItem(d, 'a', 'out', 15, ctx)
    })
    expect(
      (doc.items.find((i) => i.id === 'a') as VideoClip).duration,
    ).toBeCloseTo(8)
  })

  it('cannot extend the in edge before the start of the source', () => {
    const doc = produce(docWith(clip('a', 3, 5, 1)), (d) => {
      trimItem(d, 'a', 'in', 0, ctx)
    })
    const item = doc.items[0] as VideoClip
    expect(item.sourceIn).toBeCloseTo(0)
    expect(item.start).toBeCloseTo(2)
  })

  it('keeps a minimum of one frame', () => {
    const doc = produce(docWith(clip('a', 0, 5)), (d) => {
      trimItem(d, 'a', 'out', -10, ctx)
    })
    expect(doc.items[0].duration).toBeCloseTo(1 / 30)
  })
})

describe('updateItem', () => {
  it('recomputes duration from the source range when speed changes', () => {
    const doc = produce(docWith(clip('a', 0, 10)), (d) => {
      updateItem(d, 'a', { speed: 2 }, ctx)
    })
    expect(doc.items[0].duration).toBeCloseTo(5)
  })

  it('clamps volume and speed', () => {
    const doc = produce(docWith(clip('a', 0, 10)), (d) => {
      updateItem(d, 'a', { volume: 9, speed: 9 }, ctx)
    })
    const item = doc.items[0] as VideoClip
    expect(item.volume).toBe(2)
    expect(item.speed).toBe(2)
  })
})

describe('arrange', () => {
  function layered(): TimelineDocument {
    const base = createEmptyDocument()
    return produce(base, (draft) => {
      addItem(draft, clip('v', 0, 10))
      addItem(draft, {
        id: 't1',
        kind: 'text',
        trackId: 't-t1',
        start: 0,
        duration: 5,
        text: 'one',
        fontFamily: 'Geist',
        fontSize: 60,
        color: '#fff',
        position: { x: 0.5, y: 0.5 },
      })
      addItem(draft, {
        id: 't2',
        kind: 'text',
        trackId: 't-t1',
        start: 5,
        duration: 5,
        text: 'two',
        fontFamily: 'Geist',
        fontSize: 60,
        color: '#fff',
        position: { x: 0.5, y: 0.5 },
      })
    })
  }

  it('draws text above video by default', () => {
    const doc = layered()
    expect(sortForCompositing(doc, doc.items).map((i) => i.id)).toEqual([
      'v',
      't1',
      't2',
    ])
  })

  it('sends text behind the video and brings it back to the front', () => {
    const doc = layered()
    const back = produce(doc, (d) => arrangeItems(d, ['t1'], 'back'))
    expect(sortForCompositing(back, back.items).map((i) => i.id)[0]).toBe('t1')
    const front = produce(back, (d) => arrangeItems(d, ['t1'], 'front'))
    const order = sortForCompositing(front, front.items).map((i) => i.id)
    expect(order[order.length - 1]).toBe('t1')
  })

  it('moves one step among items that overlap in time', () => {
    const doc = layered()
    const down = produce(doc, (d) => arrangeItems(d, ['t1'], 'backward'))
    const order = sortForCompositing(down, down.items).map((i) => i.id)
    expect(order.indexOf('t1')).toBeLessThan(order.indexOf('v'))
    expect(itemZ(down.items.find((i) => i.id === 't2')!)).toBe(1)
  })

  it('does nothing for audio items', () => {
    const doc = layered()
    const same = produce(doc, (d) => arrangeItems(d, ['missing'], 'front'))
    expect(same).toBe(doc)
  })
})
