import type { ExportSettings, PlatformPreset } from './types'

export const PRESET_LABELS: Record<PlatformPreset, string> = {
  shorts: 'YouTube Shorts',
  reels: 'Instagram Reels',
  tiktok: 'TikTok',
  custom: 'Custom',
}

export const PRESETS: Record<
  Exclude<PlatformPreset, 'custom'>,
  Omit<ExportSettings, 'fileName'>
> = {
  shorts: {
    preset: 'shorts',
    width: 1080,
    height: 1920,
    fps: 30,
    videoBitrateKbps: 8000,
    audioBitrateKbps: 128,
    codec: 'h264',
  },
  reels: {
    preset: 'reels',
    width: 1080,
    height: 1920,
    fps: 30,
    videoBitrateKbps: 6000,
    audioBitrateKbps: 128,
    codec: 'h264',
  },
  tiktok: {
    preset: 'tiktok',
    width: 1080,
    height: 1920,
    fps: 30,
    videoBitrateKbps: 6000,
    audioBitrateKbps: 128,
    codec: 'h264',
  },
}

export const RESOLUTIONS = [
  { label: '720×1280', width: 720, height: 1280 },
  { label: '1080×1920', width: 1080, height: 1920 },
]

export const FPS_OPTIONS = [24, 30, 60]
