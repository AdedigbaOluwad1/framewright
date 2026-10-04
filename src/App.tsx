import { AppLoader } from '@/features/app-shell/AppLoader'
import { AppShell } from '@/features/app-shell/AppShell'
import { useBoot } from '@/features/app-shell/useBoot'
import { useEditorController } from '@/features/editor/useEditorController'

export default function App() {
  const controller = useEditorController()
  const booted = useBoot({ ready: controller.hydrated })

  return (
    <>
      <div className="h-full" inert={!booted}>
        <AppShell
          doc={controller.doc}
          media={controller.media}
          selectedIds={controller.selectedIds}
          playback={controller.playback}
          markIn={controller.markIn}
          markOut={controller.markOut}
          canUndo={controller.canUndo}
          canRedo={controller.canRedo}
          capabilities={controller.capabilities}
          saveStatus={controller.saveStatus}
          canvasRef={controller.canvasRef}
          exportStatus={controller.exportStatus}
          exportEstimate={controller.exportEstimate}
          onEstimateRequest={controller.onEstimateRequest}
          handlers={controller.handlers}
        />
      </div>
      <AppLoader done={booted} />
    </>
  )
}
