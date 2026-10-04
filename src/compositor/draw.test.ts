import { describe, expect, it } from 'vitest'
import { placeVideo } from './draw'

const base = { x: 0, y: 0, scale: 1 }

describe('placeVideo', () => {
  it('fits a landscape clip inside a portrait canvas without cropping', () => {
    const p = placeVideo(
      {
        sourceWidth: 1920,
        sourceHeight: 1080,
        transform: { ...base, fit: 'fit' },
      },
      1080,
      1920,
    )
    expect(p.width).toBeCloseTo(1080)
    expect(p.height).toBeCloseTo(607.5)
    expect(p.y).toBeCloseTo((1920 - 607.5) / 2)
  })

  it('fills the canvas with a landscape clip by covering', () => {
    const p = placeVideo(
      {
        sourceWidth: 1920,
        sourceHeight: 1080,
        transform: { ...base, fit: 'fill' },
      },
      1080,
      1920,
    )
    expect(p.height).toBeCloseTo(1920)
    expect(p.width).toBeCloseTo(3413.33, 1)
  })

  it('clamps crop panning so no black edges appear', () => {
    const p = placeVideo(
      {
        sourceWidth: 1920,
        sourceHeight: 1080,
        transform: { x: 5, y: 5, scale: 1, fit: 'crop' },
      },
      1080,
      1920,
    )
    expect(p.x).toBeLessThanOrEqual(0.001)
    expect(p.x + p.width).toBeGreaterThanOrEqual(1080 - 0.001)
  })

  it('applies position offsets as a fraction of the canvas', () => {
    const centred = placeVideo(
      {
        sourceWidth: 1080,
        sourceHeight: 1920,
        transform: { ...base, fit: 'fit' },
      },
      1080,
      1920,
    )
    const moved = placeVideo(
      {
        sourceWidth: 1080,
        sourceHeight: 1920,
        transform: { x: 0.1, y: 0, scale: 1, fit: 'fit' },
      },
      1080,
      1920,
    )
    expect(moved.x - centred.x).toBeCloseTo(108)
  })
})
