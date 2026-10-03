import { useEffect, useState } from 'react'

const MESSAGES = [
  'Initializing…',
  'Sharpening the razor…',
  'Warming up the encoder…',
  'Keeping everything on your device…',
  'Counting frames…',
  'Almost done…',
]

const MESSAGE_INTERVAL_MS = 650
const FADE_MS = 300

interface AppLoaderProps {
  done: boolean
}

export function AppLoader({ done }: AppLoaderProps) {
  const [index, setIndex] = useState(0)
  const [mounted, setMounted] = useState(true)

  useEffect(() => {
    if (done) return
    const timer = window.setInterval(
      () => setIndex((i) => Math.min(i + 1, MESSAGES.length - 1)),
      MESSAGE_INTERVAL_MS,
    )
    return () => window.clearInterval(timer)
  }, [done])

  useEffect(() => {
    if (!done) return
    const timer = window.setTimeout(() => setMounted(false), FADE_MS)
    return () => window.clearTimeout(timer)
  }, [done])

  if (!mounted) return null

  return (
    <div
      role="status"
      aria-busy={!done}
      data-done={done || undefined}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-background transition-opacity duration-300 data-[done]:pointer-events-none data-[done]:opacity-0"
    >
      <span className="sr-only">Loading Framewright</span>
      <svg
        viewBox="0 0 64 64"
        className="size-20 text-brand"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M14 5L50 5L50 17L26 17L26 25L43 25L43 37L26 37L26 42L14 54Z"
        />
        <path
          className="loader-foot"
          fill="currentColor"
          d="M14 60L26 60L26 48Z"
        />
      </svg>
      <p
        key={index}
        aria-hidden="true"
        className="loader-message h-6 text-[0.95rem] text-muted-foreground"
      >
        {MESSAGES[index]}
      </p>
    </div>
  )
}
