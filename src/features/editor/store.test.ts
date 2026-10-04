import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyDocument } from '@/features/timeline/ops'
import type { MediaAsset } from '@/features/timeline/types'
import { useEditorStore } from './store'

const asset: MediaAsset = {
  id: 'm1',
  name: 'clip.mp4',
  kind: 'video',
  duration: 10,
  width: 1080,
  height: 1920,
  sizeBytes: 1,
  hasAudio: true,
}

beforeEach(() => {
  useEditorStore.getState().replaceProject(createEmptyDocument(), [asset])
})

describe('editor store', () => {
  it('adds a clip and undoes and redoes it', () => {
    const s = useEditorStore.getState()
    s.addMediaToTimeline('m1', { atTime: 0 })
    expect(useEditorStore.getState().doc.items).toHaveLength(1)
    useEditorStore.getState().undo()
    expect(useEditorStore.getState().doc.items).toHaveLength(0)
    useEditorStore.getState().redo()
    expect(useEditorStore.getState().doc.items).toHaveLength(1)
  })

  it('appends consecutive clips to the end of V1', () => {
    const s = useEditorStore.getState()
    s.addMediaToTimeline('m1', { atTime: 0 })
    useEditorStore.getState().addMediaToTimeline('m1', { atTime: 0 })
    const items = useEditorStore.getState().doc.items
    expect(items[1].start).toBeCloseTo(10)
    expect(useEditorStore.getState().doc.duration).toBeCloseTo(20)
  })

  it('splits the selected clip at the playhead and undoes in one step', () => {
    const s = useEditorStore.getState()
    s.addMediaToTimeline('m1', { atTime: 0 })
    expect(useEditorStore.getState().splitAtPlayhead(4)).toBe(1)
    expect(useEditorStore.getState().doc.items).toHaveLength(2)
    useEditorStore.getState().undo()
    expect(useEditorStore.getState().doc.items).toHaveLength(1)
  })

  it('splits every clip under the playhead when the selection is elsewhere', () => {
    const s = useEditorStore.getState()
    s.addMediaToTimeline('m1', { atTime: 0 })
    useEditorStore.getState().addMediaToTimeline('m1', { atTime: 0 })
    expect(useEditorStore.getState().selectedIds).toHaveLength(1)
    expect(useEditorStore.getState().splitAtPlayhead(4)).toBe(1)
    expect(useEditorStore.getState().doc.items).toHaveLength(3)
  })

  it('does not edit locked tracks', () => {
    const s = useEditorStore.getState()
    s.addMediaToTimeline('m1', { atTime: 0 })
    useEditorStore.getState().toggleTrackFlag('t-v1', 'locked')
    expect(useEditorStore.getState().splitAtPlayhead(4)).toBe(0)
    useEditorStore.getState().deleteSelected(false)
    expect(useEditorStore.getState().doc.items).toHaveLength(1)
  })

  it('commits a gesture as a single undo step', () => {
    const s = useEditorStore.getState()
    s.addMediaToTimeline('m1', { atTime: 0 })
    const id = useEditorStore.getState().doc.items[0].id
    const depth = useEditorStore.getState().past.length
    useEditorStore.getState().beginGesture()
    useEditorStore.getState().moveTo(id, 1)
    useEditorStore.getState().moveTo(id, 2)
    useEditorStore.getState().moveTo(id, 3)
    useEditorStore.getState().endGesture()
    expect(useEditorStore.getState().doc.items[0].start).toBeCloseTo(3)
    expect(useEditorStore.getState().past.length).toBe(depth + 1)
    useEditorStore.getState().undo()
    expect(useEditorStore.getState().doc.items[0].start).toBeCloseTo(0)
  })

  it('coalesces rapid slider edits into one history entry', () => {
    const s = useEditorStore.getState()
    s.addMediaToTimeline('m1', { atTime: 0 })
    const id = useEditorStore.getState().doc.items[0].id
    const depth = useEditorStore.getState().past.length
    for (const volume of [0.9, 0.8, 0.7, 0.6]) {
      useEditorStore.getState().updateSelectedItem(id, { volume })
    }
    expect(useEditorStore.getState().past.length).toBe(depth + 1)
    useEditorStore.getState().undo()
    const item = useEditorStore.getState().doc.items[0]
    expect(item.kind === 'video' && item.volume).toBe(1)
  })

  it('adds text at the playhead', () => {
    useEditorStore.getState().addText('title', 2)
    const text = useEditorStore.getState().doc.items[0]
    expect(text.kind).toBe('text')
    expect(text.start).toBeCloseTo(2)
  })
})
