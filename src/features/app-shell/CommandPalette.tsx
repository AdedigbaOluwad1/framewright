import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/shared/ui/command'
import { formatShortcut } from '@/shared/shortcuts/registry'

export interface PaletteCommand {
  id: string
  label: string
  group: string
  shortcut?: string
  run: () => void
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  commands: PaletteCommand[]
  groupOrder: string[]
}

function Keys({ display }: { display: string }) {
  const formatted = formatShortcut(display)
  const parts = formatted.includes('+') ? formatted.split('+') : [formatted]
  return (
    <span
      data-slot="command-shortcut"
      className="ml-auto flex items-center gap-1"
    >
      {parts.map((part) => (
        <kbd
          key={part}
          className="tabular min-w-6 rounded-md border border-border-strong/50 bg-surface-3 px-1.5 py-0.5 text-center text-[0.75rem] text-muted-foreground"
        >
          {part}
        </kbd>
      ))}
    </span>
  )
}

export function CommandPalette({
  open,
  onOpenChange,
  commands,
  groupOrder,
}: CommandPaletteProps) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      className="top-[22%] border border-border sm:max-w-xl"
    >
      <Command className="rounded-2xl! bg-popover p-0">
        <CommandInput placeholder="Search commands…" className="text-[1rem]" />
        <CommandList className="max-h-[22rem] px-2 pt-1 pb-2">
          <CommandEmpty>No matching commands.</CommandEmpty>
          {groupOrder.map((group, index) => {
            const items = commands.filter((command) => command.group === group)
            if (items.length === 0) return null
            return (
              <div key={group}>
                {index > 0 ? <CommandSeparator className="my-1" /> : null}
                <CommandGroup heading={group}>
                  {items.map((command) => (
                    <CommandItem
                      key={command.id}
                      value={`${command.label} ${command.group}`}
                      className="h-11 gap-3 rounded-lg px-3 text-[0.95rem]"
                      onSelect={() => {
                        onOpenChange(false)
                        command.run()
                      }}
                    >
                      {command.label}
                      {command.shortcut ? (
                        <Keys display={command.shortcut} />
                      ) : null}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            )
          })}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
