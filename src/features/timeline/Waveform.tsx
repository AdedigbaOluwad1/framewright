interface WaveformProps {
  seed: string
  peaks?: number[]
  from?: number
  to?: number
}

const PEAKS_PER_SECOND = 10

function seededHeights(seed: string, count: number): number[] {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return Array.from({ length: count }, () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    const unit = ((h >>> 0) % 1000) / 1000
    return 0.2 + unit * 0.8
  })
}

function sliceHeights(peaks: number[], from: number, to: number): number[] {
  const first = Math.floor(from * PEAKS_PER_SECOND)
  const last = Math.max(first + 1, Math.ceil(to * PEAKS_PER_SECOND))
  const count = Math.min(240, Math.max(8, last - first))
  const heights: number[] = []
  for (let i = 0; i < count; i++) {
    const start = first + Math.floor((i / count) * (last - first))
    const end = Math.max(
      start + 1,
      first + Math.floor(((i + 1) / count) * (last - first)),
    )
    let max = 0
    for (let j = start; j < end && j < peaks.length; j++)
      max = Math.max(max, peaks[j])
    heights.push(Math.max(0.06, Math.min(1, max * 1.4)))
  }
  return heights
}

export function Waveform({ seed, peaks, from = 0, to = 0 }: WaveformProps) {
  const heights =
    peaks && peaks.length > 0 && to > from
      ? sliceHeights(peaks, from, to)
      : seededHeights(seed, 120)
  const bars = heights.length
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-[calc(100%-24px)] w-full opacity-60"
      viewBox={`0 0 ${bars} 20`}
      preserveAspectRatio="none"
    >
      {heights.map((height, i) => (
        <rect
          key={i}
          x={i + 0.15}
          y={10 - height * 10}
          width={0.7}
          height={height * 20}
          fill="currentColor"
        />
      ))}
    </svg>
  )
}
