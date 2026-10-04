export type Seconds = number
export type Frames = number

export type TrackKind = 'video' | 'text' | 'audio' | 'music'

export interface Track {
  id: string
  kind: TrackKind
  label: string
  name: string
  muted: boolean
  locked: boolean
  solo: boolean
}

export type FitMode = 'fit' | 'fill' | 'crop'

export interface Transform {
  x: number
  y: number
  scale: number
  fit: FitMode
}

interface ItemBase {
  id: string
  trackId: string
  start: Seconds
  duration: Seconds
}

export interface VideoClip extends ItemBase {
  kind: 'video'
  mediaId: string
  name: string
  sourceIn: Seconds
  sourceOut: Seconds
  speed: number
  volume: number
  muted: boolean
  transform: Transform
  z?: number
}

export interface AudioClip extends ItemBase {
  kind: 'audio'
  mediaId: string
  name: string
  sourceIn: Seconds
  sourceOut: Seconds
  speed: number
  volume: number
  muted: boolean
}

export interface TextItem extends ItemBase {
  kind: 'text'
  text: string
  fontFamily: string
  fontSize: number
  color: string
  position: { x: number; y: number }
  z?: number
}

export type TimelineItem = VideoClip | AudioClip | TextItem

export type MediaKind = 'video' | 'audio' | 'image'

export interface MediaAsset {
  id: string
  name: string
  kind: MediaKind
  duration: Seconds
  width?: number
  height?: number
  sizeBytes: number
  hasAudio: boolean
  mimeType?: string
  peaks?: number[]
  thumbnailUrl?: string
}

export interface TimelineDocument {
  id: string
  name: string
  fps: number
  width: number
  height: number
  duration: Seconds
  tracks: Track[]
  items: TimelineItem[]
}

export type TimelineTool = 'select' | 'razor'

export type TrackToggle = 'muted' | 'locked' | 'solo'

export type TrimEdge = 'in' | 'out'
