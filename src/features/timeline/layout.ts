export const TOOLBAR_REM = 2.75
export const RULER_PX = 30
export const TRACK_PX = 60
export const PANEL_BORDER_PX = 2

export function timelineFitHeight(
  trackCount: number,
  rootFontPx: number,
): number {
  return Math.ceil(
    TOOLBAR_REM * rootFontPx +
      RULER_PX +
      trackCount * TRACK_PX +
      PANEL_BORDER_PX,
  )
}

export function rootFontPx(): number {
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
}
