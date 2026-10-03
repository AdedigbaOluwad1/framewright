import { useMemo, useRef, useState } from 'react'
import { AppLoader } from '@/features/app-shell/AppLoader'
import { AppShell } from '@/features/app-shell/AppShell'
import { useBoot } from '@/features/app-shell/useBoot'
import type { Diagnostics } from '@/features/app-shell/types'
import type { ExportSettings } from '@/features/export/types'
import { mockDocument, mockMedia } from '@/mocks/data'
import { mockEstimate, useMockExport } from '@/mocks/export'
import { createUnwiredHandlers } from '@/mocks/handlers'

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const booted = useBoot()
  const handlers = useMemo(() => createUnwiredHandlers(), [])
  const exportMock = useMockExport()
  const [estimate, setEstimate] = useState(() =>
    mockEstimate(
      {
        preset: 'shorts',
        width: 1080,
        height: 1920,
        fps: 30,
        videoBitrateKbps: 8000,
        audioBitrateKbps: 128,
        codec: 'h264',
        fileName: '',
      },
      mockDocument.duration,
    ),
  )

  const diagnostics: Diagnostics = {
    engine: 'VideoEncoder' in window ? 'webcodecs' : 'ffmpeg-wasm',
    crossOriginIsolated: window.crossOriginIsolated,
    memoryHint: 'Memory: ~2 GB wasm ceiling',
  }

  return (
    <>
      <div className="h-full" inert={!booted}>
        <AppShell
          doc={mockDocument}
          media={mockMedia}
          playback={{ isPlaying: false, currentTime: 6.4, loop: false }}
          diagnostics={diagnostics}
          canvasRef={canvasRef}
          exportStatus={exportMock.status}
          exportEstimate={estimate}
          onEstimateRequest={(settings: ExportSettings) =>
            setEstimate(mockEstimate(settings, mockDocument.duration))
          }
          handlers={{
            ...handlers,
            onExport: exportMock.start,
            onCancelExport: exportMock.cancel,
          }}
        />
      </div>
      <AppLoader done={booted} />
    </>
  )
}
