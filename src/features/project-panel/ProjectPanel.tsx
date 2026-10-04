import { memo } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { formatDuration } from '@/shared/lib/timecode'
import type { TextPreset } from '@/features/editor/store'
import type { MediaAsset } from '@/features/timeline/types'
import { ImportDropzone } from './ImportDropzone'
import { MediaCard } from './MediaCard'

export interface ProjectPanelProps {
  media: MediaAsset[]
  onImportFiles: (files: File[]) => void
  onAddMediaToTimeline: (mediaId: string, track?: 'audio' | 'music') => void
  onAddTextItem: (preset: TextPreset) => void
}

const TEXT_PRESETS: {
  id: TextPreset
  label: string
  sample: string
  className: string
}[] = [
  {
    id: 'title',
    label: 'Title',
    sample: 'Big title',
    className: 'text-2xl font-semibold',
  },
  {
    id: 'subtitle',
    label: 'Subtitle',
    sample: 'A supporting line',
    className: 'text-lg font-medium',
  },
  {
    id: 'caption',
    label: 'Caption',
    sample: 'Lower-third caption',
    className: 'text-sm font-medium',
  },
]

function ProjectPanelView({
  media,
  onImportFiles,
  onAddMediaToTimeline,
  onAddTextItem,
}: ProjectPanelProps) {
  const visual = media.filter((asset) => asset.kind !== 'audio')
  const audio = media.filter((asset) => asset.kind === 'audio')

  return (
    <section
      aria-label="Project panel"
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-sm"
    >
      <Tabs defaultValue="media" className="flex h-full min-h-0 flex-col gap-0">
        <TabsList className="h-11 w-full shrink-0 justify-start rounded-none border-b border-border bg-transparent px-1">
          <TabsTrigger value="media" className="text-[0.9rem]">
            Media
          </TabsTrigger>
          <TabsTrigger value="text" className="text-[0.9rem]">
            Text
          </TabsTrigger>
          <TabsTrigger value="audio" className="text-[0.9rem]">
            Audio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="media" className="min-h-0 flex-1">
          {visual.length === 0 ? (
            <EmptyState
              icon="hugeicons:folder-open"
              title="No media yet"
              description="Import clips to start building your vertical video."
            >
              <ImportDropzone onImportFiles={onImportFiles} />
            </EmptyState>
          ) : (
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-4 p-4">
                <ImportDropzone compact onImportFiles={onImportFiles} />
                <ul className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-3">
                  {visual.map((asset) => (
                    <li key={asset.id} className="min-w-0">
                      <MediaCard
                        asset={asset}
                        onAddToTimeline={onAddMediaToTimeline}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="text" className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <ul className="flex flex-col gap-3 p-4">
              {TEXT_PRESETS.map((preset) => (
                <li key={preset.id}>
                  <button
                    type="button"
                    onClick={() => onAddTextItem(preset.id)}
                    className="group flex w-full flex-col gap-2 rounded-xl border border-border bg-surface-2 p-4 text-left outline-none transition-colors hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Add ${preset.label} text at the playhead`}
                  >
                    <span className="flex items-center justify-between text-[0.8rem] text-muted-foreground">
                      {preset.label}
                      <Icon
                        icon="hugeicons:add-01"
                        className="size-4"
                        aria-hidden="true"
                      />
                    </span>
                    <span className={preset.className}>{preset.sample}</span>
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="audio" className="min-h-0 flex-1">
          {audio.length === 0 ? (
            <EmptyState
              icon="hugeicons:music-note-01"
              title="No audio yet"
              description="Import music or a voice-over to layer under your video."
            >
              <ImportDropzone onImportFiles={onImportFiles} />
            </EmptyState>
          ) : (
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-4 p-4">
                <ImportDropzone compact onImportFiles={onImportFiles} />
                <ul className="flex flex-col gap-2">
                  {audio.map((asset) => (
                    <li
                      key={asset.id}
                      className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 p-2 pl-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.9rem] font-medium">
                          {asset.name}
                        </p>
                        <p className="tabular text-[0.8rem] text-muted-foreground">
                          {formatDuration(asset.duration)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label={`Add ${asset.name} as audio at the playhead`}
                        onClick={() => onAddMediaToTimeline(asset.id, 'audio')}
                      >
                        Voice
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label={`Add ${asset.name} as music at the playhead`}
                        onClick={() => onAddMediaToTimeline(asset.id, 'music')}
                      >
                        Music
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </section>
  )
}

export const ProjectPanel = memo(ProjectPanelView)
