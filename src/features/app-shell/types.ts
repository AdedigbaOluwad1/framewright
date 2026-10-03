export type EngineKind = 'webcodecs' | 'ffmpeg-wasm'

export interface Diagnostics {
  engine: EngineKind
  crossOriginIsolated: boolean
  memoryHint: string
}

export type ThemeMode = 'dark' | 'light'

export const WORKSPACES = ['Editing', 'Audio', 'Captions'] as const
export type Workspace = (typeof WORKSPACES)[number]
