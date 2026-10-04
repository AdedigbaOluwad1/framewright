import { useSyncExternalStore } from 'react'

function subscribe(notify: () => void) {
  window.addEventListener('resize', notify)
  return () => window.removeEventListener('resize', notify)
}

export function useViewportWidth(): number {
  return useSyncExternalStore(
    subscribe,
    () => window.innerWidth,
    () => 1280,
  )
}
