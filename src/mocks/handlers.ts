import { toast } from 'sonner'
import type { EditorHandlers } from '@/features/app-shell/handlers'

export function createUnwiredHandlers(): EditorHandlers {
  return new Proxy({} as EditorHandlers, {
    get:
      (_target, name: string) =>
      (...args: unknown[]) => {
        console.debug(`[unwired] ${name}`, ...args)
        toast(`${name} is not wired yet`, { id: name })
      },
  })
}
