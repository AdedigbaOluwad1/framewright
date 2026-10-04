import {
  ALL_FORMATS,
  AudioBufferSink,
  AudioBufferSource,
  BlobSource,
  BufferTarget,
  CanvasSink,
  CanvasSource,
  Input,
  Mp4OutputFormat,
  Output,
  Quality,
  WebMOutputFormat,
  getFirstEncodableAudioCodec,
  getFirstEncodableVideoCodec,
  type AudioCodec,
  type VideoCodec,
  type WrappedCanvas,
} from 'mediabunny'
import {
  drawFrame,
  ensureFontsLoaded,
  type FrameLayer,
} from '@/compositor/draw'
import type { ExportSettings } from '@/features/export/types'
import { itemEnd, itemsAt, sortForCompositing } from '@/features/timeline/ops'
import type {
  MediaAsset,
  TimelineDocument,
  TimelineItem,
  VideoClip,
} from '@/features/timeline/types'
import { getFile } from './mediaLibrary'

export class ExportCancelled extends Error {
  constructor() {
    super('Export cancelled')
    this.name = 'ExportCancelled'
  }
}

export class ExportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ExportError'
  }
}

export interface ExportProgress {
  progress: number
  etaSeconds: number
  label: string
}

export interface ExportRequest {
  doc: TimelineDocument
  media: MediaAsset[]
  settings: ExportSettings
  signal: AbortSignal
  onProgress: (progress: ExportProgress) => void
}

export interface ExportResult {
  blob: Blob
  fileName: string
  sizeBytes: number
  framesPerSecond: number
}

const AUDIO_SAMPLE_RATE = 48000
const AUDIO_SHARE = 0.1
const FINALIZE_SHARE = 0.03

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw new ExportCancelled()
}

function isAudible(doc: TimelineDocument, item: TimelineItem): boolean {
  if (item.kind === 'text' || item.muted) return false
  const track = doc.tracks.find((candidate) => candidate.id === item.trackId)
  const anySolo = doc.tracks.some((candidate) => candidate.solo)
  if (!track || track.muted) return false
  return !anySolo || track.solo
}

async function mixAudio(
  request: ExportRequest,
  onStep: (fraction: number) => void,
): Promise<AudioBuffer | null> {
  const { doc, media, signal } = request
  const sources = doc.items.filter(
    (item): item is Exclude<TimelineItem, { kind: 'text' }> =>
      item.kind !== 'text' &&
      isAudible(doc, item) &&
      (media.find((asset) => asset.id === item.mediaId)?.hasAudio ?? false),
  )
  if (sources.length === 0) return null

  const length = Math.ceil(doc.duration * AUDIO_SAMPLE_RATE)
  const context = new OfflineAudioContext(2, length, AUDIO_SAMPLE_RATE)
  let scheduled = 0

  for (const [index, item] of sources.entries()) {
    throwIfAborted(signal)
    const file = getFile(item.mediaId)
    if (!file) continue
    const input = new Input({
      source: new BlobSource(file),
      formats: ALL_FORMATS,
    })
    try {
      const track = await input.getPrimaryAudioTrack()
      if (!track) continue
      const sink = new AudioBufferSink(track)
      const chunks: { buffer: AudioBuffer; timestamp: number }[] = []
      for await (const wrapped of sink.buffers(item.sourceIn, item.sourceOut)) {
        throwIfAborted(signal)
        chunks.push(wrapped)
      }
      if (chunks.length === 0) continue
      const rate = chunks[0].buffer.sampleRate
      const sourceLength = Math.max(
        1,
        Math.ceil((item.sourceOut - item.sourceIn) * rate),
      )
      const channels = Math.min(2, chunks[0].buffer.numberOfChannels)
      const combined = context.createBuffer(channels, sourceLength, rate)
      for (const { buffer, timestamp } of chunks) {
        const offset = Math.round((timestamp - item.sourceIn) * rate)
        for (let channel = 0; channel < channels; channel++) {
          const data = buffer.getChannelData(channel)
          const target = combined.getChannelData(channel)
          for (let i = 0; i < data.length; i++) {
            const position = offset + i
            if (position >= 0 && position < sourceLength)
              target[position] = data[i]
          }
        }
      }
      const node = context.createBufferSource()
      node.buffer = combined
      node.playbackRate.value = item.speed
      const gain = context.createGain()
      gain.gain.value = item.volume
      node.connect(gain).connect(context.destination)
      node.start(item.start)
      node.stop(item.start + item.duration)
      scheduled++
    } finally {
      input.dispose()
    }
    onStep((index + 1) / sources.length)
  }

  if (scheduled === 0) return null
  throwIfAborted(signal)
  return context.startRendering()
}

interface VideoSource {
  item: VideoClip
  bitmap?: ImageBitmap
  input?: Input
  frames?: AsyncGenerator<WrappedCanvas | null, void, unknown>
}

function activeFrameTimes(
  item: VideoClip,
  fps: number,
): { time: number; source: number }[] {
  const first = Math.max(0, Math.ceil(item.start * fps - 1e-9))
  const last = Math.ceil(itemEnd(item) * fps - 1e-9)
  const times: { time: number; source: number }[] = []
  for (let frame = first; frame < last; frame++) {
    const time = frame / fps
    if (time < item.start - 1e-9 || time >= itemEnd(item) - 1e-9) continue
    times.push({
      time,
      source: item.sourceIn + (time - item.start) * item.speed,
    })
  }
  return times
}

async function openVideoSource(
  item: VideoClip,
  asset: MediaAsset,
  fps: number,
): Promise<VideoSource> {
  const file = getFile(item.mediaId)
  if (!file)
    throw new ExportError(`The source file for ${asset.name} is missing.`)
  if (asset.kind === 'image') {
    return { item, bitmap: await createImageBitmap(file) }
  }
  const input = new Input({
    source: new BlobSource(file),
    formats: ALL_FORMATS,
  })
  const track = await input.getPrimaryVideoTrack()
  if (!track) {
    input.dispose()
    throw new ExportError(`${asset.name} has no video track.`)
  }
  const sink = new CanvasSink(track, { poolSize: 2 })
  const timestamps = activeFrameTimes(item, fps).map((entry) => entry.source)
  return { item, input, frames: sink.canvasesAtTimestamps(timestamps) }
}

export async function exportProject(
  request: ExportRequest,
): Promise<ExportResult> {
  const { doc, media, settings, signal, onProgress } = request
  if (doc.duration <= 0) {
    throw new ExportError('There is nothing on the timeline to export yet.')
  }
  await ensureFontsLoaded()

  const isWebM = settings.codec === 'vp9'
  const format = isWebM ? new WebMOutputFormat() : new Mp4OutputFormat()
  const preferred: VideoCodec[] = isWebM ? ['vp9'] : ['avc']
  const videoBitrate = settings.videoBitrateKbps * 1000
  const videoCodec = await getFirstEncodableVideoCodec(
    format
      .getSupportedVideoCodecs()
      .filter((codec) => preferred.includes(codec)),
    {
      width: settings.width,
      height: settings.height,
      bitrate: videoBitrate,
      frameRate: settings.fps,
    },
  )
  if (!videoCodec) {
    throw new ExportError(
      `This browser can't encode ${isWebM ? 'VP9' : 'H.264'} at ${settings.width}×${settings.height}. Try another codec or a lower resolution.`,
    )
  }
  const audioPreferred: AudioCodec[] = isWebM ? ['opus'] : ['aac']
  const audioCodec = await getFirstEncodableAudioCodec(
    format
      .getSupportedAudioCodecs()
      .filter((codec) => audioPreferred.includes(codec)),
    { numberOfChannels: 2, sampleRate: AUDIO_SAMPLE_RATE },
  )

  const startedAt = performance.now()
  onProgress({ progress: 0, etaSeconds: 0, label: 'Preparing audio' })
  const mixed = audioCodec
    ? await mixAudio(request, (fraction) =>
        onProgress({
          progress: fraction * AUDIO_SHARE,
          etaSeconds: 0,
          label: 'Preparing audio',
        }),
      )
    : null
  throwIfAborted(signal)

  const canvas = new OffscreenCanvas(settings.width, settings.height)
  const context = canvas.getContext('2d', { alpha: false })
  if (!context)
    throw new ExportError('Could not create a drawing surface for export.')

  const output = new Output({ format, target: new BufferTarget() })
  const videoSource = new CanvasSource(canvas, {
    codec: videoCodec,
    quality: new Quality({ bitrate: videoBitrate }),
    keyFrameInterval: 2,
  })
  output.addVideoTrack(videoSource, { frameRate: settings.fps })
  const audioSource =
    mixed && audioCodec
      ? new AudioBufferSource({
          codec: audioCodec,
          quality: new Quality({ bitrate: settings.audioBitrateKbps * 1000 }),
        })
      : null
  if (audioSource) output.addAudioTrack(audioSource)

  const sources = new Map<string, VideoSource>()
  const outputDoc = { ...doc, fps: settings.fps }
  try {
    await output.start()
    const audioTask =
      audioSource && mixed
        ? audioSource.add(mixed).then(
            () => null,
            (error: unknown) => error,
          )
        : null

    for (const item of doc.items) {
      if (item.kind !== 'video') continue
      const asset = media.find((candidate) => candidate.id === item.mediaId)
      if (!asset)
        throw new ExportError(
          'A clip refers to media that is no longer available.',
        )
      sources.set(item.id, await openVideoSource(item, asset, settings.fps))
    }

    const totalFrames = Math.ceil(doc.duration * settings.fps - 1e-9)
    const frameStart = performance.now()
    const size = {
      width: settings.width,
      height: settings.height,
      designWidth: doc.width,
    }

    for (let frame = 0; frame < totalFrames; frame++) {
      throwIfAborted(signal)
      const time = frame / settings.fps
      const active = sortForCompositing(outputDoc, itemsAt(outputDoc, time))
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
        const source = sources.get(item.id)
        if (!source) continue
        if (source.bitmap) {
          layers.push({
            kind: 'video',
            source: source.bitmap,
            sourceWidth: source.bitmap.width,
            sourceHeight: source.bitmap.height,
            transform: item.transform,
          })
        } else if (source.frames) {
          const next = await source.frames.next()
          const wrapped = next.done ? null : next.value
          if (wrapped) {
            layers.push({
              kind: 'video',
              source: wrapped.canvas,
              sourceWidth: wrapped.canvas.width,
              sourceHeight: wrapped.canvas.height,
              transform: item.transform,
            })
          }
        }
      }
      drawFrame(context, size, layers)
      await videoSource.add(time, 1 / settings.fps)

      const done = (frame + 1) / totalFrames
      const elapsed = (performance.now() - frameStart) / 1000
      onProgress({
        progress: AUDIO_SHARE + done * (1 - AUDIO_SHARE - FINALIZE_SHARE),
        etaSeconds:
          done > 0.02 ? Math.max(0, (elapsed / done) * (1 - done)) : 0,
        label: 'Encoding video',
      })
    }

    throwIfAborted(signal)
    onProgress({
      progress: 1 - FINALIZE_SHARE,
      etaSeconds: 0,
      label: 'Finalizing file',
    })
    videoSource.close()
    const audioFailure = await audioTask
    audioSource?.close()
    if (audioFailure) throw audioFailure
    await output.finalize()
  } catch (error) {
    if (output.state !== 'finalized' && output.state !== 'canceled') {
      await output.cancel().catch(() => undefined)
    }
    if (error instanceof ExportCancelled || signal.aborted)
      throw new ExportCancelled()
    if (error instanceof ExportError) throw error
    throw new ExportError(
      error instanceof Error
        ? error.message
        : 'The export failed for an unknown reason.',
    )
  } finally {
    for (const source of sources.values()) {
      source.bitmap?.close()
      await source.frames?.return(undefined).catch(() => undefined)
      source.input?.dispose()
    }
  }

  const buffer = output.target.buffer
  if (!buffer) throw new ExportError('The encoder produced no data.')
  const mimeType = isWebM ? 'video/webm' : 'video/mp4'
  const extension = isWebM ? 'webm' : 'mp4'
  const safeName =
    settings.fileName.trim().replace(/[\\/:*?"<>|]+/g, '-') || doc.name
  const blob = new Blob([buffer as BlobPart], { type: mimeType })
  const seconds = Math.max(0.001, (performance.now() - startedAt) / 1000)
  return {
    blob,
    fileName: `${safeName}.${extension}`,
    sizeBytes: blob.size,
    framesPerSecond: (doc.duration * settings.fps) / seconds,
  }
}
