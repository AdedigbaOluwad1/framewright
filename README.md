# Framewright

A private, no-account, no-watermark short-form video editor that runs entirely in the browser. Footage is never uploaded: decoding, editing and encoding all happen on your device.

> Status: early development (M0 spike). Not usable yet.

## Why

Several open-source browser editors on ffmpeg.wasm exist. Framewright differentiates on:

- **Hybrid engine:** WebCodecs by default, ffmpeg.wasm as fallback and specialist, with published benchmarks.
- **Focused workflow:** a polished 9:16 flow for TikTok, Reels and Shorts.
- **Privacy:** no uploads, no account, everything local.

## Architecture

An `EngineRouter` picks the cheapest capable path per job:

1. **WebCodecs:** native demux, decode and encode, hardware accelerated where available.
2. **Remux then WebCodecs:** unreadable containers are losslessly remuxed with ffmpeg.wasm first.
3. **ffmpeg.wasm:** full encode fallback, plus audio mixing, filters, GIF and odd formats.

Preview and export share one canvas compositor so that what you see is what you export. The timeline is a serializable JSON document and the single source of truth.

```
src/
  engine/       engine router and capability detection
  workers/      probing, decoding, encoding, ffmpeg.wasm workers
  compositor/   shared canvas renderer for preview and export
  timeline/     timeline document model and operations
  store/        Zustand store and undo/redo history
  storage/      IndexedDB, OPFS, File System Access
  ui/           React components
```

## Stack

React, Vite, TypeScript, Tailwind CSS, Zustand, Immer, mediabunny, `@ffmpeg/ffmpeg`, Vitest, oxlint, Prettier.

## Getting started

Requires Node 22+ and desktop Chrome or Edge.

```sh
npm install
npm run dev
```

| Script           | Purpose                    |
| ---------------- | -------------------------- |
| `npm run dev`    | Start the dev server       |
| `npm run build`  | Type-check and build       |
| `npm run lint`   | Lint with oxlint           |
| `npm run format` | Format with Prettier       |
| `npm run test`   | Run unit tests with Vitest |

The dev and preview servers send COOP/COEP headers so `crossOriginIsolated` is true, which multithreaded ffmpeg.wasm needs. Self-host fonts and assets, since cross-origin isolation blocks most third-party embeds.

## Roadmap

- [ ] M0: spike (import, decode to canvas, WebCodecs encode, ffmpeg.wasm hello-world, first benchmark)
- [ ] M1: core editing (timeline, trim/split/reorder, preview with audio sync, undo/redo)
- [ ] M2: export (engine router, presets, progress/cancel, parity tests)
- [ ] M3: creator features (text, music, 9:16 fit/fill/crop, speed)
- [ ] M4: persistence and polish (local projects, diagnostics, landing page, benchmarks)

## Benchmarks

Coming with M0.

## Known limitations

- Desktop Chrome and Edge are the supported targets for v1.
- ffmpeg.wasm has a memory ceiling of around 2 GB, so input sizes are capped.

## Licensing

FFmpeg is LGPL or GPL depending on the build. Framewright ships the LGPL core and avoids GPL-only encoders such as libx264.
