import type { TextItem, Transform } from '@/features/timeline/types'

export type Context2D =
  CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

export interface VideoLayer {
  kind: 'video'
  source: CanvasImageSource
  sourceWidth: number
  sourceHeight: number
  transform: Transform
}

export interface TextLayer {
  kind: 'text'
  item: TextItem
}

export type FrameLayer = VideoLayer | TextLayer

export interface FrameSize {
  width: number
  height: number
  designWidth: number
}

export const FONT_STACKS: Record<string, string> = {
  Geist: '"Geist Variable", system-ui, sans-serif',
  'Geist Mono': '"Geist Mono Variable", ui-monospace, monospace',
  Georgia: 'Georgia, "Times New Roman", serif',
  Impact: 'Impact, "Arial Black", sans-serif',
}

export const FONT_FAMILIES = Object.keys(FONT_STACKS)

export async function ensureFontsLoaded(): Promise<void> {
  const loads = [
    '600 48px "Geist Variable"',
    '600 48px "Geist Mono Variable"',
  ].map((descriptor) => document.fonts.load(descriptor).catch(() => []))
  await Promise.all(loads)
}

export interface Placement {
  x: number
  y: number
  width: number
  height: number
}

export function placeVideo(
  layer: Pick<VideoLayer, 'sourceWidth' | 'sourceHeight' | 'transform'>,
  width: number,
  height: number,
): Placement {
  const { sourceWidth, sourceHeight, transform } = layer
  const fitScale = Math.min(width / sourceWidth, height / sourceHeight)
  const coverScale = Math.max(width / sourceWidth, height / sourceHeight)
  const base = transform.fit === 'fit' ? fitScale : coverScale
  const zoom =
    transform.fit === 'crop' ? Math.max(1, transform.scale) : transform.scale
  const scale = base * zoom
  const drawWidth = sourceWidth * scale
  const drawHeight = sourceHeight * scale
  let offsetX = transform.x
  let offsetY = transform.y
  if (transform.fit === 'crop') {
    const limitX = Math.max(0, (drawWidth - width) / 2 / width)
    const limitY = Math.max(0, (drawHeight - height) / 2 / height)
    offsetX = Math.max(-limitX, Math.min(limitX, offsetX))
    offsetY = Math.max(-limitY, Math.min(limitY, offsetY))
  }
  return {
    x: width / 2 + offsetX * width - drawWidth / 2,
    y: height / 2 + offsetY * height - drawHeight / 2,
    width: drawWidth,
    height: drawHeight,
  }
}

function wrapLines(ctx: Context2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(/\s+/).filter(Boolean)
    if (words.length === 0) {
      lines.push('')
      continue
    }
    let current = words[0]
    for (const word of words.slice(1)) {
      const candidate = `${current} ${word}`
      if (ctx.measureText(candidate).width <= maxWidth) current = candidate
      else {
        lines.push(current)
        current = word
      }
    }
    lines.push(current)
  }
  return lines
}

export function drawText(ctx: Context2D, item: TextItem, size: FrameSize) {
  if (item.text.trim() === '') return
  const pixelSize = item.fontSize * (size.width / size.designWidth)
  const stack = FONT_STACKS[item.fontFamily] ?? FONT_STACKS.Geist
  ctx.save()
  ctx.font = `600 ${pixelSize}px ${stack}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  const lines = wrapLines(ctx, item.text, size.width * 0.9)
  const lineHeight = pixelSize * 1.2
  const startY =
    item.position.y * size.height - ((lines.length - 1) * lineHeight) / 2
  const x = item.position.x * size.width
  ctx.lineWidth = pixelSize * 0.14
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)'
  ctx.fillStyle = item.color
  lines.forEach((line, index) => {
    const y = startY + index * lineHeight
    ctx.strokeText(line, x, y)
    ctx.fillText(line, x, y)
  })
  ctx.restore()
}

export function drawFrame(
  ctx: Context2D,
  size: FrameSize,
  layers: readonly FrameLayer[],
) {
  ctx.save()
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, size.width, size.height)
  ctx.imageSmoothingQuality = 'high'
  for (const layer of layers) {
    if (layer.kind === 'video') {
      const place = placeVideo(layer, size.width, size.height)
      ctx.drawImage(layer.source, place.x, place.y, place.width, place.height)
    } else {
      drawText(ctx, layer.item, size)
    }
  }
  ctx.restore()
}
