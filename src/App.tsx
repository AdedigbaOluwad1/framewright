import { AppLoader } from '@/features/app-shell/AppLoader'
import { AppShell } from '@/features/app-shell/AppShell'
import {
  SmallScreenNotice,
  useIsLargeScreen,
} from '@/features/app-shell/ScreenGate'
import { useBoot } from '@/features/app-shell/useBoot'
import { useEditorController } from '@/features/editor/useEditorController'

export default function App() {
  const controller = useEditorController()
  const booted = useBoot({ ready: controller.hydrated })
  const largeScreen = useIsLargeScreen()

  return (
    <>
      <div
        className={largeScreen ? 'h-full' : 'hidden'}
        inert={!booted || !largeScreen}
        aria-hidden={!largeScreen}
      >
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
      {largeScreen ? <AppLoader done={booted} /> : <SmallScreenNotice />}
    </>
  )
}
