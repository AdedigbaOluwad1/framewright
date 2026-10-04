import { Icon } from '@iconify/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Progress } from '@/shared/ui/progress'
import { formatBytes } from '@/shared/lib/timecode'
import type { Capabilities } from '@/engine/capabilities'

interface DiagnosticsDialogProps {
  open: boolean
  capabilities: Capabilities | null
  onOpenChange: (open: boolean) => void
}

type Row = { label: string; value: string; ok: boolean | null; hint?: string }

function rows(c: Capabilities): Row[] {
  return [
    {
      label: 'Engine',
      value:
        c.engine === 'webcodecs'
          ? 'WebCodecs (hardware or software)'
          : 'ffmpeg.wasm fallback',
      ok: c.engine === 'webcodecs',
      hint:
        c.engine === 'webcodecs'
          ? undefined
          : 'WebCodecs encoding is unavailable here. The ffmpeg.wasm fallback is not bundled in this build, so export will not work.',
    },
    {
      label: 'H.264 encoding',
      value: c.h264 ? 'Supported' : 'Not supported',
      ok: c.h264,
    },
    {
      label: 'VP9 encoding',
      value: c.vp9 ? 'Supported' : 'Not supported',
      ok: c.vp9,
    },
    {
      label: 'AAC audio',
      value: c.aac ? 'Supported' : 'Not supported',
      ok: c.aac,
    },
    {
      label: 'Opus audio',
      value: c.opus ? 'Supported' : 'Not supported',
      ok: c.opus,
    },
    {
      label: 'Cross-origin isolated',
      value: c.crossOriginIsolated ? 'Yes' : 'No',
      ok: c.crossOriginIsolated,
      hint: c.crossOriginIsolated
        ? undefined
        : 'Needed for multithreaded ffmpeg.wasm. The WebCodecs path does not need it.',
    },
    {
      label: 'Local storage (OPFS)',
      value: c.opfs ? 'Available' : 'Unavailable',
      ok: c.opfs,
    },
    { label: 'CPU threads', value: String(c.cores), ok: null },
    {
      label: 'Device memory',
      value: c.deviceMemoryGb
        ? `${c.deviceMemoryGb} GB or more`
        : 'Not reported',
      ok: null,
    },
  ]
}

export function DiagnosticsDialog({
  open,
  capabilities,
  onOpenChange,
}: DiagnosticsDialogProps) {
  const storage = capabilities?.storage
  const percent =
    storage && storage.quota > 0
      ? Math.min(100, (storage.usage / storage.quota) * 100)
      : 0
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[34rem]">
        <header className="flex flex-col gap-1.5 border-b border-border px-7 pt-6 pb-5">
          <DialogTitle className="text-lg font-semibold">
            Diagnostics
          </DialogTitle>
          <DialogDescription className="text-[0.9rem]">
            What this browser and device can do, measured on startup.
          </DialogDescription>
        </header>
        <div className="flex max-h-[62vh] flex-col gap-6 overflow-y-auto px-7 py-6">
          {capabilities ? (
            <>
              <ul className="flex flex-col">
                {rows(capabilities).map((row) => (
                  <li
                    key={row.label}
                    className="flex flex-col gap-1 border-b border-border py-3 last:border-b-0"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[0.95rem]">{row.label}</span>
                      <span className="flex items-center gap-2 text-[0.9rem] text-muted-foreground">
                        {row.ok === null ? null : (
                          <Icon
                            icon={
                              row.ok
                                ? 'hugeicons:checkmark-circle-02'
                                : 'hugeicons:cancel-circle'
                            }
                            className={
                              row.ok
                                ? 'size-4 text-success'
                                : 'size-4 text-warning'
                            }
                            aria-hidden="true"
                          />
                        )}
                        {row.value}
                      </span>
                    </div>
                    {row.hint ? (
                      <p className="text-[0.85rem] text-muted-foreground">
                        {row.hint}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
              {storage ? (
                <section
                  className="flex flex-col gap-2"
                  aria-label="Browser storage"
                >
                  <div className="flex items-center justify-between text-[0.9rem]">
                    <span>Browser storage used</span>
                    <span className="tabular text-muted-foreground">
                      {formatBytes(storage.usage)} of{' '}
                      {formatBytes(storage.quota)}
                    </span>
                  </div>
                  <Progress
                    value={percent}
                    aria-label="Storage used"
                    className="h-2"
                  />
                </section>
              ) : null}
            </>
          ) : (
            <p className="text-[0.95rem] text-muted-foreground">
              Still detecting capabilities…
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
