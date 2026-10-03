import { Icon } from '@iconify/react'
import { Button } from '@/shared/ui/button'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { formatDuration } from '@/shared/lib/timecode'
import type { MediaAsset } from '@/features/timeline/types'
import { ImportDropzone } from './ImportDropzone'
import { MediaCard } from './MediaCard'

export interface ProjectPanelProps {
  media: MediaAsset[]
  onImportFiles: (files: File[]) => void
  onAddMediaToTimeline: (mediaId: string) => void
  onAddTextItem: () => void
}

const TEXT_PRESETS = ['Title', 'Subtitle', 'Caption']

export function ProjectPanel({
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
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-4 p-4">
              {visual.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <Icon
                    icon="hugeicons:folder-open"
                    className="size-8 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="text-[0.95rem] font-medium">No media yet</p>
                  <p className="max-w-52 text-[0.9rem] text-muted-foreground">
                    Import clips to start building your vertical video.
                  </p>
                  <ImportDropzone onImportFiles={onImportFiles} />
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="text" className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <ul className="flex flex-col gap-2.5 p-4">
              {TEXT_PRESETS.map((preset) => (
                <li key={preset}>
                  <Button
                    variant="outline"
                    className="h-12 w-full justify-start gap-2 text-[0.95rem]"
                    onClick={onAddTextItem}
                  >
                    <Icon icon="hugeicons:text-font" aria-hidden="true" />{' '}
                    {preset}
                    <Icon
                      icon="hugeicons:add-01"
                      className="ml-auto"
                      aria-hidden="true"
                    />
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="audio" className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-4 p-4">
              <ImportDropzone compact onImportFiles={onImportFiles} />
              <ul className="flex flex-col gap-1">
                {audio.map((asset) => (
                  <li key={asset.id}>
                    <Button
                      variant="ghost"
                      className="h-11 w-full justify-start gap-2 text-[0.9rem]"
                      aria-label={`Add ${asset.name} to timeline`}
                      onClick={() => onAddMediaToTimeline(asset.id)}
                    >
                      <span className="truncate">{asset.name}</span>
                      <span className="tabular ml-auto text-muted-foreground">
                        {formatDuration(asset.duration)}
                      </span>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </section>
  )
}
