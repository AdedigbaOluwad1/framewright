import { create } from 'zustand'
import { drawFrame, type FrameLayer } from '@/compositor/draw'
import { useEditorStore } from '@/features/editor/store'
import { itemEnd, itemsAt, toFrame } from '@/features/timeline/ops'
import type {
  MediaAsset,
  Seconds,
  TimelineDocument,
  TimelineItem,
} from '@/features/timeline/types'
import { getFile, getObjectUrl } from './mediaLibrary'

export interface PlaybackState {
  time: Seconds
  isPlaying: boolean
  rate: number
  loop: boolean
}

export const usePlaybackStore = create<PlaybackState>()(() => ({
  time: 0,
  isPlaying: false,
  rate: 1,
  loop: false,
}))

const PUBLISH_INTERVAL_MS = 33
const DRIFT_TOLERANCE_S = 0.3
const PRELOAD_WINDOW_S = 1
const IDLE_DISPOSE_MS = 6000
const SEEK_TIMEOUT_MS = 700

interface Runtime {
  itemId: string
  mediaId: string
  element?: HTMLVideoElement | HTMLAudioElement
  bitmap?: ImageBitmap
  gain?: GainNode
  primed: boolean
  lastUsed: number
}

function seekElement(element: HTMLMediaElement, time: number): Promise<void> {
  const limit = Number.isFinite(element.duration)
    ? element.duration - 0.001
    : time
  const target = Math.max(0, Math.min(time, limit))
  if (
    element.readyState >= 2 &&
    !element.seeking &&
    Math.abs(element.currentTime - target) < 0.002
  ) {
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    const finish = () => {
      element.removeEventListener('seeked', finish)
      window.clearTimeout(timer)
      resolve()
    }
    const timer = window.setTimeout(finish, SEEK_TIMEOUT_MS)
    element.addEventListener('seeked', finish)
    element.currentTime = target
  })
}

function sourceTime(
  item: Exclude<TimelineItem, { kind: 'text' }>,
  time: Seconds,
): Seconds {
  return item.sourceIn + (time - item.start) * item.speed
}

class PreviewEngine {
  private canvas: HTMLCanvasElement | null = null
  private runtimes = new Map<string, Runtime>()
  private audio: AudioContext | null = null
  private time = 0
  private playing = false
  private rate = 1
  private loop = false
  private lastTick = 0
  private lastPublish = 0
  private lastGc = 0
  private forceResync = true
  private renderToken = 0
  private reverseBusy = false
  private raf = 0
  private refreshQueued = false
  private unsubscribe: (() => void) | null = null

  attach(canvas: HTMLCanvasElement | null) {
    this.canvas = canvas
    this.unsubscribe?.()
    this.unsubscribe = null
    if (!canvas) return
    this.unsubscribe = useEditorStore.subscribe((state, previous) => {
      if (state.revision !== previous.revision) this.refresh()
    })
    this.refresh()
  }

  getTime(): Seconds {
    return this.time
  }

  isPlaying(): boolean {
    return this.playing
  }

  private doc(): TimelineDocument {
    return useEditorStore.getState().doc
  }

  private media(mediaId: string): MediaAsset | undefined {
    return useEditorStore.getState().media.find((asset) => asset.id === mediaId)
  }

  private publish(force = false) {
    const now = performance.now()
    if (!force && now - this.lastPublish < PUBLISH_INTERVAL_MS) return
    this.lastPublish = now
    usePlaybackStore.setState({
      time: this.time,
      isPlaying: this.playing,
      rate: this.rate,
      loop: this.loop,
    })
  }

  private range(): { start: Seconds; end: Seconds } {
    const { markIn, markOut } = useEditorStore.getState()
    const duration = this.doc().duration
    if (this.loop && markIn !== null && markOut !== null && markOut > markIn) {
      return { start: markIn, end: Math.min(markOut, duration) }
    }
    return { start: 0, end: duration }
  }

  private audioContext(): AudioContext {
    if (!this.audio) this.audio = new AudioContext()
    return this.audio
  }

  private runtimeFor(item: TimelineItem): Runtime | null {
    if (item.kind === 'text') return null
    let runtime = this.runtimes.get(item.id)
    if (runtime && runtime.mediaId !== item.mediaId) {
      this.disposeRuntime(item.id)
      runtime = undefined
    }
    if (!runtime) {
      const asset = this.media(item.mediaId)
      if (!asset) return null
      runtime = {
        itemId: item.id,
        mediaId: item.mediaId,
        primed: false,
        lastUsed: performance.now(),
      }
      if (asset.kind === 'image') {
        const file = getFile(asset.id)
        if (file) {
          const pending = runtime
          void createImageBitmap(file).then((bitmap) => {
            pending.bitmap = bitmap
            if (!this.playing) this.refresh()
          })
        }
      } else {
        const url = getObjectUrl(asset.id)
        if (!url) return null
        const element = document.createElement(
          asset.kind === 'video' ? 'video' : 'audio',
        )
        element.preload = 'auto'
        element.src = url
        if (element instanceof HTMLVideoElement) element.playsInline = true
        const context = this.audioContext()
        const source = context.createMediaElementSource(element)
        const gain = context.createGain()
        source.connect(gain).connect(context.destination)
        runtime.element = element
        runtime.gain = gain
      }
      this.runtimes.set(item.id, runtime)
    }
    runtime.lastUsed = performance.now()
    return runtime
  }

  private disposeRuntime(itemId: string) {
    const runtime = this.runtimes.get(itemId)
    if (!runtime) return
    if (runtime.element) {
      runtime.element.pause()
      runtime.element.removeAttribute('src')
      runtime.element.load()
    }
    runtime.gain?.disconnect()
    runtime.bitmap?.close()
    this.runtimes.delete(itemId)
  }

  private collectGarbage() {
    const now = performance.now()
    if (now - this.lastGc < 1000) return
    this.lastGc = now
    const ids = new Set(this.doc().items.map((item) => item.id))
    for (const [itemId, runtime] of this.runtimes) {
      if (!ids.has(itemId) || now - runtime.lastUsed > IDLE_DISPOSE_MS)
        this.disposeRuntime(itemId)
    }
  }

  private audible(doc: TimelineDocument, item: TimelineItem): boolean {
    if (item.kind === 'text') return false
    const track = doc.tracks.find((candidate) => candidate.id === item.trackId)
    const anySolo = doc.tracks.some((candidate) => candidate.solo)
    if (!track || track.muted || item.muted) return false
    return !anySolo || track.solo
  }

  private applyGain(
    runtime: Runtime,
    doc: TimelineDocument,
    item: TimelineItem,
  ) {
    if (!runtime.gain || item.kind === 'text') return
    const target = this.audible(doc, item) ? item.volume : 0
    if (runtime.gain.gain.value !== target) runtime.gain.gain.value = target
  }

  private syncPlayback(time: Seconds) {
    const doc = this.doc()
    const active = itemsAt(doc, time)
    const activeIds = new Set(active.map((item) => item.id))

    for (const item of active) {
      if (item.kind === 'text') continue
      const runtime = this.runtimeFor(item)
      if (!runtime?.element) continue
      const element = runtime.element
      const expected = sourceTime(item, time)
      this.applyGain(runtime, doc, item)
      if (this.rate > 0) {
        const wanted = Math.max(0.0625, Math.min(16, item.speed * this.rate))
        if (element.playbackRate !== wanted) element.playbackRate = wanted
        if (element.paused || this.forceResync) {
          if (Math.abs(element.currentTime - expected) > 0.04)
            element.currentTime = expected
          void element.play().catch(() => undefined)
        } else if (
          Math.abs(element.currentTime - expected) > DRIFT_TOLERANCE_S
        ) {
          element.currentTime = expected
        }
      } else {
        element.pause()
      }
      runtime.primed = false
    }

    for (const [itemId, runtime] of this.runtimes) {
      if (activeIds.has(itemId)) continue
      runtime.element?.pause()
      const item = doc.items.find((candidate) => candidate.id === itemId)
      if (
        item &&
        item.kind !== 'text' &&
        this.rate > 0 &&
        !runtime.primed &&
        item.start > time &&
        item.start - time < PRELOAD_WINDOW_S &&
        runtime.element
      ) {
        runtime.element.currentTime = item.sourceIn
        runtime.primed = true
      }
    }

    if (this.rate > 0) {
      for (const item of doc.items) {
        if (item.kind === 'text' || activeIds.has(item.id)) continue
        if (item.start > time && item.start - time < PRELOAD_WINDOW_S)
          this.runtimeFor(item)
      }
    }
    this.forceResync = false
  }

  private layers(time: Seconds): FrameLayer[] {
    const doc = this.doc()
    const order = new Map(doc.tracks.map((track, index) => [track.id, index]))
    const active = itemsAt(doc, time).sort(
      (a, b) => (order.get(b.trackId) ?? 0) - (order.get(a.trackId) ?? 0),
    )
    const layers: FrameLayer[] = []
    for (const item of active) {
      const track = doc.tracks.find(
        (candidate) => candidate.id === item.trackId,
      )
      if (item.kind === 'text') {
        if (!track?.muted) layers.push({ kind: 'text', item })
        continue
      }
      if (item.kind !== 'video') continue
      const runtime = this.runtimes.get(item.id)
      if (!runtime) continue
      if (runtime.bitmap) {
        layers.push({
          kind: 'video',
          source: runtime.bitmap,
          sourceWidth: runtime.bitmap.width,
          sourceHeight: runtime.bitmap.height,
          transform: item.transform,
        })
      } else if (
        runtime.element instanceof HTMLVideoElement &&
        runtime.element.readyState >= 2
      ) {
        layers.push({
          kind: 'video',
          source: runtime.element,
          sourceWidth: runtime.element.videoWidth,
          sourceHeight: runtime.element.videoHeight,
          transform: item.transform,
        })
      }
    }
    return layers
  }

  private paint(time: Seconds) {
    if (!this.canvas) return
    const ctx = this.canvas.getContext('2d', { alpha: false })
    if (!ctx) return
    const doc = this.doc()
    drawFrame(
      ctx,
      {
        width: this.canvas.width,
        height: this.canvas.height,
        designWidth: doc.width,
      },
      this.layers(time),
    )
  }

  private async renderStill() {
    const token = ++this.renderToken
    const time = this.time
    const doc = this.doc()
    const seeks: Promise<void>[] = []
    for (const item of itemsAt(doc, time)) {
      if (item.kind === 'text') continue
      const runtime = this.runtimeFor(item)
      if (runtime?.element) {
        this.applyGain(runtime, doc, item)
        runtime.element.pause()
        if (item.kind === 'video')
          seeks.push(seekElement(runtime.element, sourceTime(item, time)))
      }
    }
    await Promise.all(seeks)
    if (token !== this.renderToken) return
    this.paint(time)
  }

  refresh() {
    if (this.refreshQueued) return
    this.refreshQueued = true
    requestAnimationFrame(() => {
      this.refreshQueued = false
      if (this.playing) return
      const duration = this.doc().duration
      if (this.time > duration) {
        this.time = duration
        this.publish(true)
      }
      void this.renderStill()
    })
  }

  private tick = (now: number) => {
    if (!this.playing) return
    const delta = Math.min(0.1, (now - this.lastTick) / 1000)
    this.lastTick = now
    const { start, end } = this.range()
    let next = this.time + delta * this.rate

    if (this.rate > 0 && next >= end) {
      if (this.loop && end > start) {
        next = start
        this.forceResync = true
      } else {
        this.time = end
        this.pause()
        return
      }
    } else if (this.rate < 0 && next <= start) {
      this.time = start
      this.pause()
      return
    }

    this.time = next
    this.syncPlayback(next)
    if (this.rate < 0) {
      if (!this.reverseBusy) {
        this.reverseBusy = true
        void this.renderStill().finally(() => {
          this.reverseBusy = false
        })
      }
    } else {
      this.paint(next)
    }
    this.publish()
    this.collectGarbage()
    this.raf = requestAnimationFrame(this.tick)
  }

  play(rate = 1) {
    const doc = this.doc()
    if (doc.duration <= 0) return
    void this.audioContext().resume()
    const { start, end } = this.range()
    if (rate > 0 && this.time >= end - 1e-3) this.time = start
    if (rate < 0 && this.time <= start + 1e-3) this.time = end
    this.rate = rate
    this.playing = true
    this.forceResync = true
    this.lastTick = performance.now()
    this.publish(true)
    cancelAnimationFrame(this.raf)
    this.raf = requestAnimationFrame(this.tick)
  }

  pause() {
    cancelAnimationFrame(this.raf)
    this.playing = false
    this.rate = 1
    for (const runtime of this.runtimes.values()) runtime.element?.pause()
    this.publish(true)
    void this.renderStill()
  }

  toggle() {
    if (this.playing) this.pause()
    else this.play(1)
  }

  seek(time: Seconds) {
    const duration = this.doc().duration
    this.time = Math.max(0, Math.min(time, duration))
    this.forceResync = true
    this.publish(true)
    if (!this.playing) void this.renderStill()
  }

  step(deltaFrames: number) {
    if (this.playing) this.pause()
    const fps = this.doc().fps
    this.seek(toFrame(this.time, fps) + deltaFrames / fps)
  }

  jumpToStart() {
    this.seek(0)
  }

  jumpToEnd() {
    this.seek(this.doc().duration)
  }

  setLoop(loop: boolean) {
    this.loop = loop
    this.publish(true)
  }

  shuttle(direction: 'reverse' | 'stop' | 'forward') {
    if (direction === 'stop') {
      if (this.playing) this.pause()
      return
    }
    if (direction === 'forward') {
      const next =
        this.playing && this.rate > 0 ? Math.min(this.rate * 2, 4) : 1
      this.play(next)
    } else {
      const next =
        this.playing && this.rate < 0 ? Math.max(this.rate * 2, -4) : -1
      this.play(next)
    }
  }

  end(): Seconds {
    return this.doc().items.reduce(
      (max, item) => Math.max(max, itemEnd(item)),
      0,
    )
  }
}

export const previewEngine = new PreviewEngine()
