interface WaveformProps {
  seed: string
  bars?: number
}

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

export function Waveform({ seed, bars = 120 }: WaveformProps) {
  const heights = seededHeights(seed, bars)
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
