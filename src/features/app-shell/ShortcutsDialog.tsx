import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/ui/dialog'
import { ScrollArea } from '@/shared/ui/scroll-area'
import {
  SHORTCUTS,
  formatShortcut,
  type ActionGroup,
} from '@/shared/shortcuts/registry'

const GROUPS: ActionGroup[] = ['Playback', 'Edit', 'Timeline', 'App']

interface ShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function Keys({ display }: { display: string }) {
  const formatted = formatShortcut(display)
  const parts = formatted.includes('+') ? formatted.split('+') : [formatted]
  return (
    <span className="flex items-center gap-1">
      {parts.map((part) => (
        <kbd
          key={part}
          className="tabular min-w-6 rounded-md border border-border-strong/50 bg-surface-3 px-1.5 py-0.5 text-center text-[0.8rem]"
        >
          {part}
        </kbd>
      ))}
    </span>
  )
}

export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  const definitions = Object.values(SHORTCUTS)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[34rem]">
        <header className="flex flex-col gap-1.5 border-b border-border px-7 pt-6 pb-5">
          <DialogTitle className="text-lg font-semibold">
            Keyboard shortcuts
          </DialogTitle>
          <DialogDescription className="text-[0.9rem]">
            Every action is also available from the command palette.
          </DialogDescription>
        </header>
        <ScrollArea className="max-h-[60vh]">
          <div className="flex flex-col gap-7 px-7 py-6">
            {GROUPS.map((group) => (
              <section
                key={group}
                aria-label={group}
                className="flex flex-col gap-2"
              >
                <h3 className="text-[0.8rem] font-semibold tracking-wide text-muted-foreground uppercase">
                  {group}
                </h3>
                <ul className="flex flex-col">
                  {definitions
                    .filter((def) => def.group === group)
                    .map((def) => (
                      <li
                        key={def.id}
                        className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0"
                      >
                        <span className="text-[0.95rem]">{def.label}</span>
                        <Keys display={def.display} />
                      </li>
                    ))}
                </ul>
              </section>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
