import { canEncodeAudio, canEncodeVideo } from 'mediabunny'
import { create } from 'zustand'

export interface Capabilities {
  engine: 'webcodecs' | 'ffmpeg-wasm'
  webCodecs: boolean
  h264: boolean
  vp9: boolean
  aac: boolean
  opus: boolean
  crossOriginIsolated: boolean
  cores: number
  deviceMemoryGb: number | null
  opfs: boolean
  storage: { usage: number; quota: number } | null
}

export const useCapabilities = create<{ capabilities: Capabilities | null }>()(
  () => ({
    capabilities: null,
  }),
)

async function safe(check: () => Promise<boolean>): Promise<boolean> {
  try {
    return await check()
  } catch {
    return false
  }
}

export async function detectCapabilities(): Promise<Capabilities> {
  const webCodecs = 'VideoEncoder' in window && 'VideoDecoder' in window
  const [h264, vp9, aac, opus] = webCodecs
    ? await Promise.all([
        safe(() => canEncodeVideo('avc', { width: 1080, height: 1920 })),
        safe(() => canEncodeVideo('vp9', { width: 1080, height: 1920 })),
        safe(() =>
          canEncodeAudio('aac', { numberOfChannels: 2, sampleRate: 48000 }),
        ),
        safe(() =>
          canEncodeAudio('opus', { numberOfChannels: 2, sampleRate: 48000 }),
        ),
      ])
    : [false, false, false, false]
  const estimate = navigator.storage?.estimate
    ? await navigator.storage.estimate()
    : null
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory
  const capabilities: Capabilities = {
    engine: webCodecs && (h264 || vp9) ? 'webcodecs' : 'ffmpeg-wasm',
    webCodecs,
    h264,
    vp9,
    aac,
    opus,
    crossOriginIsolated: window.crossOriginIsolated,
    cores: navigator.hardwareConcurrency ?? 1,
    deviceMemoryGb: memory ?? null,
    opfs: typeof navigator.storage?.getDirectory === 'function',
    storage: estimate
      ? { usage: estimate.usage ?? 0, quota: estimate.quota ?? 0 }
      : null,
  }
  useCapabilities.setState({ capabilities })
  return capabilities
}

export async function refreshStorageEstimate(): Promise<void> {
  if (!navigator.storage?.estimate) return
  const estimate = await navigator.storage.estimate()
  useCapabilities.setState((state) =>
    state.capabilities
      ? {
          capabilities: {
            ...state.capabilities,
            storage: { usage: estimate.usage ?? 0, quota: estimate.quota ?? 0 },
          },
        }
      : state,
  )
}
