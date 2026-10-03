export type PlatformPreset = 'shorts' | 'reels' | 'tiktok' | 'custom'

export interface ExportSettings {
  preset: PlatformPreset
  width: number
  height: number
  fps: number
  videoBitrateKbps: number
  audioBitrateKbps: number
  codec: 'h264' | 'vp9'
  fileName: string
}

export type ExportStatus =
  | { phase: 'idle' }
  | { phase: 'running'; progress: number; etaSeconds: number }
  | { phase: 'done'; sizeBytes: number }
  | { phase: 'cancelled' }
  | { phase: 'error'; message: string }
