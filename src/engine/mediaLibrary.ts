import {
  ALL_FORMATS,
  AudioBufferSink,
  BlobSource,
  CanvasSink,
  Input,
} from 'mediabunny'
import type { MediaAsset, MediaKind } from '@/features/timeline/types'

export const MAX_FILE_BYTES = 2 * 1024 ** 3
export const DEFAULT_IMAGE_SECONDS = 5
const PEAKS_PER_SECOND = 10
const PEAKS_MAX_SECONDS = 900
const SUPPORTED_HINT =
  'Supported: MP4, MOV, WebM, MKV for video; MP3, WAV, AAC, OGG, FLAC for audio; PNG, JPG, WebP for images.'

export class ImportError extends Error {
  hint: string

  constructor(message: string, hint: string) {
    super(message)
    this.name = 'ImportError'
    this.hint = hint
  }
}

const files = new Map<string, File>()
const urls = new Map<string, string>()

export function registerFile(mediaId: string, file: File) {
  files.set(mediaId, file)
}

export function getFile(mediaId: string): File | undefined {
  return files.get(mediaId)
}

export function getObjectUrl(mediaId: string): string | undefined {
  const existing = urls.get(mediaId)
  if (existing) return existing
  const file = files.get(mediaId)
  if (!file) return undefined
  const url = URL.createObjectURL(file)
  urls.set(mediaId, url)
  return url
}

export function releaseAllMedia() {
  for (const url of urls.values()) URL.revokeObjectURL(url)
  urls.clear()
  files.clear()
}

export interface ProbeResult {
  kind: MediaKind
  duration: number
  width?: number
  height?: number
  hasAudio: boolean
}

function describeBytes(bytes: number): string {
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`
}

export function validateFile(file: File) {
  if (file.size === 0) {
    throw new ImportError(
      `${file.name} is empty`,
      'Pick a file that has content.',
    )
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new ImportError(
      `${file.name} is too large (${describeBytes(file.size)})`,
      `Files over ${describeBytes(MAX_FILE_BYTES)} would exhaust browser memory. Trim or compress it first.`,
    )
  }
}

export async function probeFile(file: File): Promise<ProbeResult> {
  validateFile(file)

  if (file.type.startsWith('image/')) {
    try {
      const bitmap = await createImageBitmap(file)
      const result = {
        kind: 'image' as const,
        duration: DEFAULT_IMAGE_SECONDS,
        width: bitmap.width,
        height: bitmap.height,
        hasAudio: false,
      }
      bitmap.close()
      return result
    } catch {
      throw new ImportError(
        `Couldn't read the image ${file.name}`,
        SUPPORTED_HINT,
      )
    }
  }

  const input = new Input({
    source: new BlobSource(file),
    formats: ALL_FORMATS,
  })
  try {
    const video = await input.getPrimaryVideoTrack()
    const audio = await input.getPrimaryAudioTrack()
    if (!video && !audio) {
      throw new ImportError(
        `${file.name} has no audio or video`,
        SUPPORTED_HINT,
      )
    }
    if (video && !(await video.canDecode())) {
      throw new ImportError(
        `This browser can't decode the video in ${file.name}`,
        'The codec (for example HEVC) is not supported here. Re-export it as H.264 MP4 or WebM.',
      )
    }
    if (!video && audio && !(await audio.canDecode())) {
      throw new ImportError(
        `This browser can't decode the audio in ${file.name}`,
        'Re-export it as MP3, WAV or AAC.',
      )
    }
    const duration = await input.computeDuration()
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new ImportError(
        `${file.name} has no readable duration`,
        SUPPORTED_HINT,
      )
    }
    return {
      kind: video ? 'video' : 'audio',
      duration,
      width: video?.displayWidth,
      height: video?.displayHeight,
      hasAudio: audio !== null,
    }
  } catch (error) {
    if (error instanceof ImportError) throw error
    throw new ImportError(
      `Couldn't read ${file.name}`,
      `${SUPPORTED_HINT} AVI and FLV need converting first.`,
    )
  } finally {
    input.dispose()
  }
}

export async function makeThumbnail(
  file: File,
  asset: MediaAsset,
): Promise<string | undefined> {
  if (asset.kind === 'image') return URL.createObjectURL(file)
  if (asset.kind !== 'video') return undefined
  const input = new Input({
    source: new BlobSource(file),
    formats: ALL_FORMATS,
  })
  try {
    const track = await input.getPrimaryVideoTrack()
    if (!track) return undefined
    const sink = new CanvasSink(track, { width: 360, fit: 'contain' })
    const first = await track.getFirstTimestamp()
    const wrapped = await sink.getCanvas(
      first + Math.min(0.5, asset.duration / 4),
    )
    if (!wrapped) return undefined
    const canvas = wrapped.canvas
    const blob =
      canvas instanceof OffscreenCanvas
        ? await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 })
        : await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', 0.8),
          )
    return blob ? URL.createObjectURL(blob) : undefined
  } catch {
    return undefined
  } finally {
    input.dispose()
  }
}

export async function computePeaks(
  file: File,
  duration: number,
): Promise<number[] | undefined> {
  if (duration > PEAKS_MAX_SECONDS) return undefined
  const input = new Input({
    source: new BlobSource(file),
    formats: ALL_FORMATS,
  })
  try {
    const track = await input.getPrimaryAudioTrack()
    if (!track) return undefined
    const bins = Math.max(1, Math.ceil(duration * PEAKS_PER_SECOND))
    const peaks = new Array<number>(bins).fill(0)
    const sink = new AudioBufferSink(track)
    for await (const { buffer, timestamp } of sink.buffers()) {
      const data = buffer.getChannelData(0)
      const rate = buffer.sampleRate
      for (let i = 0; i < data.length; i += 64) {
        const bin = Math.min(
          bins - 1,
          Math.floor((timestamp + i / rate) * PEAKS_PER_SECOND),
        )
        const value = Math.abs(data[i])
        if (value > peaks[bin]) peaks[bin] = value
      }
    }
    return peaks.map((value) => Math.round(Math.min(1, value) * 100) / 100)
  } catch {
    return undefined
  } finally {
    input.dispose()
  }
}
