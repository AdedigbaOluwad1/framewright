import { useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Progress } from '@/shared/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { cn } from '@/shared/lib/utils'
import { formatBytes, formatDuration } from '@/shared/lib/timecode'
import type { Capabilities } from '@/engine/capabilities'
import { FPS_OPTIONS, PRESETS, RESOLUTIONS } from './presets'
import type { ExportSettings, ExportStatus, PlatformPreset } from './types'

export interface ExportEstimate {
  sizeBytes: number
  seconds: number
}

export interface ExportDialogProps {
  open: boolean
  projectName: string
  duration: number
  status: ExportStatus
  estimate: ExportEstimate | null
  capabilities: Capabilities | null
  onEstimateRequest: (settings: ExportSettings) => void
  onOpenChange: (open: boolean) => void
  onExport: (settings: ExportSettings) => void
  onCancelExport: () => void
  onDownload: () => void
  onReset: () => void
}

const PLATFORMS: {
  id: Exclude<PlatformPreset, 'custom'>
  name: string
  icon: string
}[] = [
  { id: 'shorts', name: 'YouTube Shorts', icon: 'hugeicons:youtube' },
  { id: 'reels', name: 'Instagram Reels', icon: 'hugeicons:instagram' },
  { id: 'tiktok', name: 'TikTok', icon: 'hugeicons:tiktok' },
]

function describe(settings: Omit<ExportSettings, 'fileName'>): string {
  return `${settings.width}×${settings.height} · ${settings.fps} fps · ${(settings.videoBitrateKbps / 1000).toFixed(0)} Mbps`
}

function describeLines(
  settings: Omit<ExportSettings, 'fileName'>,
): [string, string] {
  return [
    `${settings.width}×${settings.height}`,
    `${settings.fps} fps · ${(settings.videoBitrateKbps / 1000).toFixed(0)} Mbps`,
  ]
}

function initialSettings(projectName: string): ExportSettings {
  return { ...PRESETS.shorts, fileName: projectName }
}

export function ExportDialog({
  open,
  projectName,
  duration,
  status,
  estimate,
  capabilities,
  onEstimateRequest,
  onOpenChange,
  onExport,
  onCancelExport,
  onDownload,
  onReset,
}: ExportDialogProps) {
  const [settings, setSettings] = useState(() => initialSettings(projectName))
  const [advanced, setAdvanced] = useState(false)
  const running = status.phase === 'running'
  const idle = status.phase === 'idle'

  const settingsRef = useRef(settings)
  const estimateRef = useRef(onEstimateRequest)

  useEffect(() => {
    settingsRef.current = settings
    estimateRef.current = onEstimateRequest
  })

  useEffect(() => {
    if (!open) return
    const next = { ...settingsRef.current, fileName: projectName }
    setSettings(next)
    estimateRef.current(next)
  }, [open, projectName, duration])

  function apply(next: ExportSettings) {
    setSettings(next)
    onEstimateRequest(next)
  }

  function choosePreset(preset: Exclude<PlatformPreset, 'custom'>) {
    apply({ ...PRESETS[preset], fileName: settings.fileName })
  }

  function patch(partial: Partial<ExportSettings>) {
    apply({ ...settings, ...partial, preset: 'custom' })
  }

  const progress =
    status.phase === 'running' ? Math.round(status.progress * 100) : 0
  const empty = duration <= 0
  const unsupported =
    capabilities && settings.codec === 'h264' && !capabilities.h264
      ? 'This browser cannot encode H.264. Switch the codec to VP9 under advanced settings.'
      : capabilities && settings.codec === 'vp9' && !capabilities.vp9
        ? 'This browser cannot encode VP9. Switch the codec to H.264 under advanced settings.'
        : null

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (!running || next) && onOpenChange(next)}
    >
      <DialogContent
        showCloseButton={!running}
        className="max-h-[92vh] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[34rem]"
        onEscapeKeyDown={(event) => running && event.preventDefault()}
        onInteractOutside={(event) => running && event.preventDefault()}
      >
        <div className="flex max-h-[92vh] flex-col">
          <header className="flex flex-col gap-1.5 border-b border-border px-7 pt-6 pb-5">
            <DialogTitle className="text-lg font-semibold">
              Export video
            </DialogTitle>
            <DialogDescription className="text-[0.9rem]">
              Rendered on your device. Nothing is uploaded.
            </DialogDescription>
          </header>

          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-7 py-6">
            {idle ? (
              <>
                <section
                  aria-labelledby="export-platform"
                  className="flex flex-col gap-3"
                >
                  <h3
                    id="export-platform"
                    className="text-[0.85rem] font-medium"
                  >
                    Platform
                  </h3>
                  <div
                    role="radiogroup"
                    aria-labelledby="export-platform"
                    className="grid grid-cols-3 gap-3"
                  >
                    {PLATFORMS.map((platform) => {
                      const selected = settings.preset === platform.id
                      return (
                        <button
                          key={platform.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => choosePreset(platform.id)}
                          className={cn(
                            'flex flex-col items-start gap-3 rounded-xl border p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                            selected
                              ? 'border-foreground bg-accent-soft'
                              : 'border-border bg-surface-2 hover:bg-accent-soft',
                          )}
                        >
                          <span className="flex w-full items-center justify-between">
                            <Icon
                              icon={platform.icon}
                              className="size-6"
                              aria-hidden="true"
                            />
                            {selected ? (
                              <Icon
                                icon="hugeicons:checkmark-circle-02"
                                className="size-5"
                                aria-hidden="true"
                              />
                            ) : null}
                          </span>
                          <span className="flex flex-col gap-1">
                            <span className="text-[0.95rem] font-medium">
                              {platform.name}
                            </span>
                            <span className="flex flex-col text-[0.8rem] leading-snug text-muted-foreground">
                              {describeLines(PRESETS[platform.id]).map(
                                (line) => (
                                  <span key={line}>{line}</span>
                                ),
                              )}
                            </span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  {settings.preset === 'custom' ? (
                    <p className="text-[0.85rem] text-muted-foreground">
                      Custom settings: {describe(settings)}
                    </p>
                  ) : null}
                </section>

                <section className="flex flex-col gap-4">
                  <button
                    type="button"
                    aria-expanded={advanced}
                    onClick={() => setAdvanced((value) => !value)}
                    className="flex items-center gap-2 self-start rounded-md text-[0.85rem] font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon
                      icon="hugeicons:arrow-right-01"
                      className={cn(
                        'size-4 transition-transform',
                        advanced && 'rotate-90',
                      )}
                      aria-hidden="true"
                    />
                    Advanced settings
                  </button>
                  {advanced ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                      <div className="flex flex-col gap-2">
                        <Label className="text-[0.85rem]">Resolution</Label>
                        <Select
                          value={`${settings.width}x${settings.height}`}
                          onValueChange={(value) => {
                            const [width, height] = value.split('x').map(Number)
                            patch({ width, height })
                          }}
                        >
                          <SelectTrigger
                            aria-label="Resolution"
                            className="h-10 w-full"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {RESOLUTIONS.map((r) => (
                              <SelectItem
                                key={r.label}
                                value={`${r.width}x${r.height}`}
                              >
                                {r.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-[0.85rem]">Frame rate</Label>
                        <Select
                          value={String(settings.fps)}
                          onValueChange={(value) =>
                            patch({ fps: Number(value) })
                          }
                        >
                          <SelectTrigger
                            aria-label="Frame rate"
                            className="h-10 w-full"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FPS_OPTIONS.map((fps) => (
                              <SelectItem key={fps} value={String(fps)}>
                                {fps} fps
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label
                          htmlFor="export-bitrate"
                          className="text-[0.85rem]"
                        >
                          Video bitrate (kbps)
                        </Label>
                        <Input
                          id="export-bitrate"
                          type="number"
                          min={500}
                          max={50000}
                          step={500}
                          value={settings.videoBitrateKbps}
                          className="tabular h-10"
                          onChange={(event) =>
                            patch({
                              videoBitrateKbps: Number(event.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-[0.85rem]">Codec</Label>
                        <Select
                          value={settings.codec}
                          onValueChange={(codec) =>
                            patch({ codec: codec as ExportSettings['codec'] })
                          }
                        >
                          <SelectTrigger
                            aria-label="Codec"
                            className="h-10 w-full"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="h264">H.264 (MP4)</SelectItem>
                            <SelectItem value="vp9">VP9 (WebM)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : null}
                </section>

                <section className="flex flex-col gap-2">
                  <Label htmlFor="export-name" className="text-[0.85rem]">
                    File name
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="export-name"
                      value={settings.fileName}
                      className="h-10"
                      onChange={(event) =>
                        setSettings({
                          ...settings,
                          fileName: event.target.value,
                        })
                      }
                    />
                    <span className="tabular text-[0.85rem] text-muted-foreground">
                      .{settings.codec === 'vp9' ? 'webm' : 'mp4'}
                    </span>
                  </div>
                </section>

                <dl className="grid grid-cols-3 gap-3">
                  {[
                    ['Duration', empty ? '—' : formatDuration(duration)],
                    [
                      'Estimated size',
                      estimate && !empty
                        ? `Up to ${formatBytes(estimate.sizeBytes)}`
                        : '—',
                    ],
                    [
                      'Estimated time',
                      estimate && !empty
                        ? formatDuration(estimate.seconds)
                        : '—',
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-border bg-surface-2 px-4 py-3"
                    >
                      <dt className="text-[0.8rem] text-muted-foreground">
                        {label}
                      </dt>
                      <dd className="tabular mt-1 text-[1rem] font-medium">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                {empty ? (
                  <Callout icon="hugeicons:information-circle">
                    Nothing to export yet. Add clips to the timeline first.
                  </Callout>
                ) : null}
                {unsupported ? (
                  <Callout icon="hugeicons:alert-02" tone="warning">
                    {unsupported}
                  </Callout>
                ) : null}
              </>
            ) : null}

            {status.phase === 'running' ? (
              <div className="flex flex-col gap-5 py-4">
                <div className="flex items-end justify-between">
                  <span className="tabular text-5xl font-semibold tracking-tight">
                    {progress}%
                  </span>
                  <span className="pb-1 text-[0.9rem] text-muted-foreground">
                    {status.label}
                  </span>
                </div>
                <Progress
                  value={progress}
                  aria-label="Export progress"
                  className="h-2"
                />
                <p className="tabular text-[0.85rem] text-muted-foreground">
                  {status.etaSeconds > 0
                    ? `About ${formatDuration(status.etaSeconds)} remaining`
                    : 'Working…'}
                </p>
              </div>
            ) : null}

            {status.phase === 'done' ? (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft">
                  <Icon
                    icon="hugeicons:checkmark-circle-02"
                    className="size-8 text-success"
                    aria-hidden="true"
                  />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="text-lg font-semibold">Export complete</p>
                  <p className="text-[0.9rem] text-muted-foreground">
                    {status.fileName} · {formatBytes(status.sizeBytes)}
                  </p>
                  <p className="text-[0.85rem] text-muted-foreground">
                    The file was saved to your downloads folder.
                  </p>
                </div>
              </div>
            ) : null}

            {status.phase === 'cancelled' ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft">
                  <Icon
                    icon="hugeicons:cancel-circle"
                    className="size-8 text-muted-foreground"
                    aria-hidden="true"
                  />
                </span>
                <p className="text-lg font-semibold">Export cancelled</p>
                <p className="text-[0.9rem] text-muted-foreground">
                  Nothing was saved.
                </p>
              </div>
            ) : null}

            {status.phase === 'error' ? (
              <Callout icon="hugeicons:alert-02" tone="danger">
                <span className="font-medium">Export failed.</span>{' '}
                {status.message}
              </Callout>
            ) : null}
          </div>

          <footer className="flex items-center justify-end gap-3 border-t border-border bg-surface-2 px-7 py-4">
            {running ? (
              <Button variant="outline" size="lg" onClick={onCancelExport}>
                Cancel export
              </Button>
            ) : status.phase === 'done' ? (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
                <Button variant="outline" size="lg" onClick={onDownload}>
                  <Icon icon="hugeicons:download-01" aria-hidden="true" />{' '}
                  Download again
                </Button>
              </>
            ) : status.phase === 'cancelled' || status.phase === 'error' ? (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
                <Button size="lg" onClick={onReset}>
                  Back to settings
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="lg"
                  disabled={
                    empty ||
                    Boolean(unsupported) ||
                    settings.fileName.trim() === ''
                  }
                  onClick={() => onExport(settings)}
                >
                  <Icon icon="hugeicons:download-01" aria-hidden="true" />{' '}
                  Export
                </Button>
              </>
            )}
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Callout({
  icon,
  tone = 'info',
  children,
}: {
  icon: string
  tone?: 'info' | 'warning' | 'danger'
  children: React.ReactNode
}) {
  return (
    <div
      role={tone === 'info' ? 'note' : 'alert'}
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3 text-[0.9rem]',
        tone === 'danger' && 'border-danger/50 bg-danger/10',
        tone === 'warning' && 'border-warning/50 bg-warning/10',
        tone === 'info' && 'border-border bg-surface-2',
      )}
    >
      <Icon icon={icon} className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <p>{children}</p>
    </div>
  )
}
