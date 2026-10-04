import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/shared/ui/button'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { useViewportWidth } from '@/shared/hooks/useViewportWidth'

export const MIN_SCREEN_WIDTH = 1024

export function useIsLargeScreen(): boolean {
  return useMediaQuery(`(min-width: ${MIN_SCREEN_WIDTH}px)`)
}

export function SmallScreenNotice() {
  const width = useViewportWidth()
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main
      role="alert"
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-7 overflow-y-auto bg-background px-8 py-10 text-center"
    >
      <div className="relative flex size-28 items-center justify-center rounded-[22%] bg-tile ring-1 ring-border">
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
        <span className="absolute -top-2 -right-2 flex size-9 items-center justify-center rounded-full bg-foreground text-lg font-semibold text-background">
          !
        </span>
      </div>

      <div className="flex max-w-sm flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Oops, we need a bigger screen
        </h1>
        <p className="text-[1rem] leading-relaxed text-muted-foreground">
          We tried to squeeze a timeline, a monitor and a few panels in here,
          and the timeline is not having it. Open Framewright on a laptop,
          desktop or large tablet and we&apos;ll get cutting.
        </p>
      </div>

      <dl className="flex items-center gap-6 rounded-xl border border-border bg-surface-2 px-6 py-3 text-[0.9rem]">
        <div className="flex flex-col items-center gap-0.5">
          <dt className="text-[0.8rem] text-muted-foreground">Your screen</dt>
          <dd className="tabular font-medium">{width}px</dd>
        </div>
        <div className="h-8 w-px bg-border" aria-hidden="true" />
        <div className="flex flex-col items-center gap-0.5">
          <dt className="text-[0.8rem] text-muted-foreground">Needed</dt>
          <dd className="tabular font-medium">{MIN_SCREEN_WIDTH}px+</dd>
        </div>
      </dl>

      <div className="flex flex-col items-center gap-3">
        <Button size="lg" onClick={copyLink}>
          <Icon
            icon={copied ? 'hugeicons:tick-02' : 'hugeicons:link-01'}
            aria-hidden="true"
          />
          {copied ? 'Link copied' : 'Copy link for later'}
        </Button>
        <p className="max-w-xs text-[0.85rem] text-muted-foreground">
          Everything runs on your device, so nothing is waiting for you
          elsewhere. Just open the link on a bigger screen.
        </p>
      </div>
    </main>
  )
}
