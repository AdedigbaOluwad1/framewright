import { Icon } from '@iconify/react'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import type { ItemPatch } from '@/features/app-shell/handlers'
import type { FitMode, TimelineItem } from '@/features/timeline/types'
import { NumberField, Section, SliderField } from './Field'

export interface InspectorPanelProps {
  selection: TimelineItem[]
  onUpdateItem: (itemId: string, patch: ItemPatch) => void
}

const FONTS = ['Geist', 'Geist Mono', 'Georgia', 'Impact']

export function InspectorPanel({
  selection,
  onUpdateItem,
}: InspectorPanelProps) {
  const item = selection.length === 1 ? selection[0] : undefined

  return (
    <aside
      aria-label="Inspector"
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-sm"
    >
      <div className="flex h-11 shrink-0 items-center border-b border-border px-3">
        <h2 className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground uppercase">
          Inspector
        </h2>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        {!item ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center text-muted-foreground">
            <Icon
              icon="hugeicons:mouse-pointer-click"
              className="size-6"
              aria-hidden="true"
            />
            <p className="text-[0.9rem]">
              {selection.length > 1
                ? `${selection.length} items selected. Select one to edit.`
                : 'Select a clip or text item to edit its properties.'}
            </p>
          </div>
        ) : (
          <ItemEditor item={item} onUpdateItem={onUpdateItem} />
        )}
      </ScrollArea>
    </aside>
  )
}

function ItemEditor({
  item,
  onUpdateItem,
}: {
  item: TimelineItem
  onUpdateItem: InspectorPanelProps['onUpdateItem']
}) {
  const update = (patch: ItemPatch) => onUpdateItem(item.id, patch)

  return (
    <div>
      {item.kind === 'video' ? (
        <Section title="Transform">
          <NumberField
            label="Position X"
            value={item.transform.x}
            onCommit={(x) => update({ transform: { x } })}
          />
          <NumberField
            label="Position Y"
            value={item.transform.y}
            onCommit={(y) => update({ transform: { y } })}
          />
          <SliderField
            label="Scale"
            value={item.transform.scale}
            min={0.1}
            max={4}
            step={0.05}
            format={(v) => `${Math.round(v * 100)}%`}
            onCommit={(scale) => update({ transform: { scale } })}
          />
          <div className="flex items-center gap-2">
            <Label className="w-16 shrink-0 text-[0.9rem] text-muted-foreground">
              Framing
            </Label>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              aria-label="Framing mode"
              value={item.transform.fit}
              onValueChange={(fit) => {
                if (fit) update({ transform: { fit: fit as FitMode } })
              }}
            >
              <ToggleGroupItem value="fit" className="text-[0.9rem]">
                Fit
              </ToggleGroupItem>
              <ToggleGroupItem value="fill" className="text-[0.9rem]">
                Fill
              </ToggleGroupItem>
              <ToggleGroupItem value="crop" className="text-[0.9rem]">
                Crop
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </Section>
      ) : null}

      {item.kind === 'text' ? (
        <Section title="Text">
          <Label
            htmlFor="inspector-text"
            className="text-[0.9rem] text-muted-foreground"
          >
            Content
          </Label>
          <Textarea
            id="inspector-text"
            key={item.id}
            defaultValue={item.text}
            className="min-h-16 text-[0.9rem]"
            onBlur={(event) => {
              if (event.target.value !== item.text)
                update({ text: event.target.value })
            }}
          />
          <div className="flex items-center gap-2">
            <Label className="w-16 shrink-0 text-[0.9rem] text-muted-foreground">
              Font
            </Label>
            <Select
              value={item.fontFamily}
              onValueChange={(fontFamily) => update({ fontFamily })}
            >
              <SelectTrigger
                aria-label="Font family"
                size="sm"
                className="h-9 flex-1 text-[0.9rem]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <NumberField
            label="Size"
            value={item.fontSize}
            suffix="px"
            onCommit={(fontSize) => update({ fontSize })}
          />
          <div className="flex items-center gap-2">
            <Label
              htmlFor="inspector-color"
              className="w-16 shrink-0 text-[0.9rem] text-muted-foreground"
            >
              Colour
            </Label>
            <Input
              id="inspector-color"
              type="color"
              value={item.color}
              className="h-9 w-12 p-0.5"
              onChange={(event) => update({ color: event.target.value })}
            />
            <span className="tabular text-[0.9rem] text-muted-foreground">
              {item.color}
            </span>
          </div>
          <NumberField
            label="Position X"
            value={item.position.x}
            step={0.05}
            onCommit={(x) => update({ position: { x, y: item.position.y } })}
          />
          <NumberField
            label="Position Y"
            value={item.position.y}
            step={0.05}
            onCommit={(y) => update({ position: { x: item.position.x, y } })}
          />
        </Section>
      ) : null}

      <Section title="Timing">
        <NumberField
          label="Start"
          value={item.start}
          step={0.1}
          suffix="s"
          onCommit={(start) => update({ start })}
        />
        <NumberField
          label="Duration"
          value={item.duration}
          step={0.1}
          suffix="s"
          onCommit={(duration) => update({ duration })}
        />
      </Section>

      {item.kind !== 'text' ? (
        <>
          <Section title="Audio">
            <SliderField
              label="Volume"
              value={item.volume}
              min={0}
              max={2}
              step={0.01}
              format={(v) => `${Math.round(v * 100)}%`}
              onCommit={(volume) => update({ volume })}
            />
            <div className="flex items-center justify-between">
              <Label
                htmlFor="inspector-mute"
                className="text-[0.9rem] text-muted-foreground"
              >
                Mute
              </Label>
              <Switch
                id="inspector-mute"
                checked={item.muted}
                onCheckedChange={(muted) => update({ muted })}
              />
            </div>
          </Section>
          <Section title="Speed">
            <SliderField
              label="Speed"
              value={item.speed}
              min={0.5}
              max={2}
              step={0.05}
              format={(v) => `${v.toFixed(2)}×`}
              onCommit={(speed) => update({ speed })}
            />
          </Section>
        </>
      ) : null}
    </div>
  )
}
