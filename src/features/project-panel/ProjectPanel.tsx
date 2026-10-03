import { FolderOpen, Plus, Type } from 'lucide-react'
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
      className="flex h-full min-h-0 flex-col bg-surface-1"
    >
      <Tabs defaultValue="media" className="flex h-full min-h-0 flex-col gap-0">
        <TabsList className="h-9 w-full shrink-0 justify-start rounded-none border-b border-border bg-transparent px-1">
          <TabsTrigger value="media" className="text-[12px]">
            Media
          </TabsTrigger>
          <TabsTrigger value="text" className="text-[12px]">
            Text
          </TabsTrigger>
          <TabsTrigger value="audio" className="text-[12px]">
            Audio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="media" className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-3 p-3">
              {visual.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <FolderOpen
                    className="size-8 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="text-[13px] font-medium">No media yet</p>
                  <p className="max-w-52 text-[12px] text-muted-foreground">
                    Import clips to start building your vertical video.
                  </p>
                  <ImportDropzone onImportFiles={onImportFiles} />
                </div>
              ) : (
                <>
                  <ImportDropzone compact onImportFiles={onImportFiles} />
                  <ul className="grid grid-cols-2 gap-2">
                    {visual.map((asset) => (
                      <li key={asset.id}>
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
            <ul className="flex flex-col gap-2 p-3">
              {TEXT_PRESETS.map((preset) => (
                <li key={preset}>
                  <Button
                    variant="outline"
                    className="h-10 w-full justify-start gap-2 text-[13px]"
                    onClick={onAddTextItem}
                  >
                    <Type aria-hidden="true" /> {preset}
                    <Plus className="ml-auto" aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="audio" className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-3 p-3">
              <ImportDropzone compact onImportFiles={onImportFiles} />
              <ul className="flex flex-col gap-1">
                {audio.map((asset) => (
                  <li key={asset.id}>
                    <Button
                      variant="ghost"
                      className="h-9 w-full justify-start gap-2 text-[12px]"
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
