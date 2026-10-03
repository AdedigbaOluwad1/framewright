import { useEffect, useState } from 'react'

interface BootOptions {
  ready?: boolean
  minDurationMs?: number
}

export function useBoot({
  ready = true,
  minDurationMs = 1800,
}: BootOptions = {}) {
  const [minElapsed, setMinElapsed] = useState(false)
  const [fontsReady, setFontsReady] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setMinElapsed(true), minDurationMs)
    return () => window.clearTimeout(timer)
  }, [minDurationMs])

  useEffect(() => {
    let cancelled = false
    document.fonts.ready.then(() => {
      if (!cancelled) setFontsReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return ready && minElapsed && fontsReady
}
