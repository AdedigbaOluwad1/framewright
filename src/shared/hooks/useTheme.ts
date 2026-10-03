import { useCallback, useEffect, useState } from 'react'
import type { ThemeMode } from '@/features/app-shell/types'

export function useTheme(initial: ThemeMode = 'dark') {
  const [theme, setTheme] = useState<ThemeMode>(initial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = useCallback(
    () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    [],
  )

  return { theme, setTheme, toggleTheme }
}
