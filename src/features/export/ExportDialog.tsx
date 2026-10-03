import { useState } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'
import { formatBytes, formatDuration } from '@/shared/lib/timecode'
import { FPS_OPTIONS, PRESETS, PRESET_LABELS, RESOLUTIONS } from './presets'
import type { ExportSettings, ExportStatus, PlatformPreset } from './types'

export interface ExportEstimate {
  sizeBytes: number
  seconds: number
}

export interface ExportDialogProps {
  open: boolean
  projectName: string
  status: ExportStatus
  estimate: ExportEstimate | null
  onEstimateRequest: (settings: ExportSettings) => void
  onOpenChange: (open: boolean) => void
  onExport: (settings: ExportSettings) => void
  onCancelExport: () => void
}

function initialSettings(projectName: string): ExportSettings {
  return { ...PRESETS.shorts, fileName: projectName }
}

export function ExportDialog({
  open,
  projectName,
  status,
  estimate,
  onEstimateRequest,
  onOpenChange,
  onExport,
  onCancelExport,
}: ExportDialogProps) {
  const [settings, setSettings] = useState(() => initialSettings(projectName))
  const running = status.phase === 'running'

  function apply(next: ExportSettings) {
    setSettings(next)
    onEstimateRequest(next)
  }

  function choosePreset(preset: PlatformPreset) {
    if (preset === 'custom') return apply({ ...settings, preset })
    apply({ ...PRESETS[preset], fileName: settings.fileName })
  }

  function patch(partial: Partial<ExportSettings>) {
    apply({ ...settings, ...partial, preset: 'custom' })
  }

  const progress =
    status.phase === 'running' ? Math.round(status.progress * 100) : 0

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (!running || next) && onOpenChange(next)}
    >
      <DialogContent
        className="max-w-md gap-4"
        onEscapeKeyDown={(event) => running && event.preventDefault()}
        onInteractOutside={(event) => running && event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Export video</DialogTitle>
          <DialogDescription>
            Rendered on your device. Nothing is uploaded.
          </DialogDescription>
        </DialogHeader>

        <fieldset disabled={running} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-[12px]">Platform preset</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              aria-label="Platform preset"
              value={settings.preset}
              onValueChange={(value) =>
                value && choosePreset(value as PlatformPreset)
              }
              className="w-full"
            >
              {(Object.keys(PRESET_LABELS) as PlatformPreset[]).map(
                (preset) => (
                  <ToggleGroupItem
                    key={preset}
                    value={preset}
                    className="flex-1 text-[12px]"
                  >
                    {PRESET_LABELS[preset]}
                  </ToggleGroupItem>
                ),
              )}
            </ToggleGroup>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px]">Resolution</Label>
              <Select
                value={`${settings.width}x${settings.height}`}
                onValueChange={(value) => {
                  const [width, height] = value.split('x').map(Number)
                  patch({ width, height })
                }}
              >
                <SelectTrigger
                  aria-label="Resolution"
                  size="sm"
                  className="h-8 text-[12px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOLUTIONS.map((r) => (
                    <SelectItem key={r.label} value={`${r.width}x${r.height}`}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px]">Frame rate</Label>
              <Select
                value={String(settings.fps)}
                onValueChange={(value) => patch({ fps: Number(value) })}
              >
                <SelectTrigger
                  aria-label="Frame rate"
                  size="sm"
                  className="h-8 text-[12px]"
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="export-bitrate" className="text-[12px]">
                Video bitrate (kbps)
              </Label>
              <Input
                id="export-bitrate"
                type="number"
                min={500}
                step={500}
                value={settings.videoBitrateKbps}
                className="tabular h-8 text-[12px]"
                onChange={(event) =>
                  patch({ videoBitrateKbps: Number(event.target.value) })
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px]">Codec</Label>
              <Select
                value={settings.codec}
                onValueChange={(codec) =>
                  patch({ codec: codec as ExportSettings['codec'] })
                }
              >
                <SelectTrigger
                  aria-label="Codec"
                  size="sm"
                  className="h-8 text-[12px]"
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="export-name" className="text-[12px]">
              File name
            </Label>
            <Input
              id="export-name"
              value={settings.fileName}
              className="h-8 text-[12px]"
              onChange={(event) =>
                setSettings({ ...settings, fileName: event.target.value })
              }
            />
          </div>
        </fieldset>

        <dl className="grid grid-cols-2 gap-2 rounded-[var(--radius)] border border-border bg-surface-2 p-3 text-[12px]">
          <div>
            <dt className="text-muted-foreground">Estimated size</dt>
            <dd className="tabular font-medium">
              {estimate ? formatBytes(estimate.sizeBytes) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Estimated time</dt>
            <dd className="tabular font-medium">
              {estimate ? formatDuration(estimate.seconds) : '—'}
            </dd>
          </div>
        </dl>

        {status.phase !== 'idle' ? (
          <div className="flex flex-col gap-1.5">
            {running ? (
              <>
                <Progress value={progress} aria-label="Export progress" />
                <div className="tabular flex justify-between text-[12px] text-muted-foreground">
                  <span>{progress}%</span>
                  <span>{formatDuration(status.etaSeconds)} remaining</span>
                </div>
              </>
            ) : null}
            <p
              role="status"
              aria-live="polite"
              className="text-[12px] data-[phase=error]:text-danger"
              data-phase={status.phase}
            >
              {status.phase === 'running' && `Exporting, ${progress} percent`}
              {status.phase === 'done' &&
                `Export complete, ${formatBytes(status.sizeBytes)}`}
              {status.phase === 'cancelled' && 'Export cancelled'}
              {status.phase === 'error' && `Export failed: ${status.message}`}
            </p>
          </div>
        ) : null}

        <DialogFooter>
          {running ? (
            <Button variant="outline" onClick={onCancelExport}>
              <X aria-hidden="true" /> Cancel export
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={() => onExport(settings)}>
                <Download aria-hidden="true" /> Export
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
