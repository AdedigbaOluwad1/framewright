import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/shared/ui/command'
import {
  SHORTCUTS,
  formatShortcut,
  type ActionGroup,
  type ActionHandlers,
} from '@/shared/shortcuts/registry'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  actions: ActionHandlers
}

const GROUP_ORDER: ActionGroup[] = ['Playback', 'Edit', 'Timeline', 'App']

export function CommandPalette({
  open,
  onOpenChange,
  actions,
}: CommandPaletteProps) {
  const definitions = Object.values(SHORTCUTS)
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command…" />
      <CommandList>
        <CommandEmpty>No matching commands.</CommandEmpty>
        {GROUP_ORDER.map((group) => (
          <CommandGroup key={group} heading={group}>
            {definitions
              .filter((def) => def.group === group)
              .map((def) => (
                <CommandItem
                  key={def.id}
                  value={`${def.label} ${def.group}`}
                  onSelect={() => {
                    onOpenChange(false)
                    if (def.id !== 'commandPalette') actions[def.id]()
                  }}
                >
                  {def.label}
                  <CommandShortcut>
                    {formatShortcut(def.display)}
                  </CommandShortcut>
                </CommandItem>
              ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
