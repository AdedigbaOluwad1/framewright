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
      <div className="flex size-24 items-center justify-center rounded-[22%] bg-tile ring-1 ring-border">
        <svg
          viewBox="0 0 64 64"
          className="size-3/4 text-tile-foreground"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M24.21 54.24V27.39H19.23V19.93H24.21V18.32Q24.21 11.51 27.98 8.26Q31.74 5 39.13 5H44.11V12.83H38.4Q36.13 12.83 34.93 14.04Q33.72 15.24 33.72 17.44V19.93H44.77V27.39H33.72V44.73Z"
          />
          <path
            className="loader-foot"
            fill="currentColor"
            d="M24.21 59 33.72 49.49V59Z"
          />
        </svg>
      </div>
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
