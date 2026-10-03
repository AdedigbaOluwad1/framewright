import { Headphones, Lock, LockOpen, Volume2, VolumeX } from 'lucide-react'
import { IconButton } from '@/shared/ui/icon-button'
import type { Track, TrackToggle } from './types'

interface TrackHeaderProps {
  track: Track
  onToggle: (trackId: string, toggle: TrackToggle) => void
}

export function TrackHeader({ track, onToggle }: TrackHeaderProps) {
  return (
    <div
      role="group"
      aria-label={`${track.name} controls`}
      className="flex h-full items-center gap-1 border-r border-b border-border bg-surface-2 px-2.5"
    >
      <span
        className="tabular w-11 shrink-0 truncate text-[0.8rem] font-semibold text-foreground"
        title={track.name}
      >
        {track.label}
      </span>
      <IconButton
        label={track.muted ? `Unmute ${track.name}` : `Mute ${track.name}`}
        pressed={track.muted}
        onClick={() => onToggle(track.id, 'muted')}
        icon={
          track.muted ? (
            <VolumeX className="size-4" />
          ) : (
            <Volume2 className="size-4" />
          )
        }
      />
      <IconButton
        label={track.solo ? `Unsolo ${track.name}` : `Solo ${track.name}`}
        pressed={track.solo}
        onClick={() => onToggle(track.id, 'solo')}
        icon={<Headphones className="size-4" />}
      />
      <IconButton
        label={track.locked ? `Unlock ${track.name}` : `Lock ${track.name}`}
        pressed={track.locked}
        onClick={() => onToggle(track.id, 'locked')}
        icon={
          track.locked ? (
            <Lock className="size-4" />
          ) : (
            <LockOpen className="size-4" />
          )
        }
      />
    </div>
  )
}
