# Framewright

A private, no-account, no-watermark short-form video editor that runs entirely in the browser. Footage is never uploaded: decoding, editing and encoding all happen on your device.

> Status: working editor. Import, edit, preview, export and local saving all run in the browser.

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

React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Iconify (Hugeicons), Zustand, Immer, mediabunny, `@ffmpeg/ffmpeg`, Vitest, oxlint, Prettier.

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

## What works

- Import video, audio and images by browsing, dropping anywhere, or the File menu. Files stay on your device.
- Single-timeline editing: trim, split, razor, drag to reorder, ripple delete, snapping, keyboard nudging, undo and redo.
- Layer ordering with bring to front, forward, backward and send to back.
- Text overlays, music and voice-over, per-clip volume and speed, fit, fill and crop framing.
- Preview with synced audio, scrubbing, loop with in and out marks, J K L shuttle.
- Export to MP4 (H.264 and AAC) or WebM (VP9 and Opus) with Shorts, Reels and TikTok presets, progress and cancel.
- Autosave to IndexedDB and OPFS, restored on reload, with a clear local data control.

See [WIRE.md](WIRE.md) for how every action is wired and the known limits.

## Deploying to Cloudflare Workers

The app is a static single-page build, so it deploys as an assets-only Worker. `wrangler.jsonc` points at `dist`, falls back to `index.html` for unknown routes, and `public/_headers` sends the cross-origin isolation headers (COOP and COEP) that the editor expects.

```sh
npx wrangler login
npm run deploy
```

`npm run preview:worker` builds and serves the Worker locally with Wrangler. To use a custom domain, add a `routes` entry with `custom_domain` set to `true` in `wrangler.jsonc`.

## Roadmap

- [x] Core editing: timeline, trim, split, reorder, preview with audio sync, undo and redo
- [x] Export: presets, progress and cancel (WebCodecs path)
- [x] Creator features: text, music, fit, fill and crop, speed
- [x] Persistence: local project, diagnostics
- [ ] ffmpeg.wasm fallback and remux for AVI and FLV
- [ ] Export in a worker and preview and export parity tests
- [ ] Benchmarks and landing page

## Benchmarks

Not measured yet.

## Known limitations

- Desktop Chrome and Edge are the supported targets for v1. The editor needs a viewport at least 1024px wide; smaller screens see a notice instead.
- ffmpeg.wasm has a memory ceiling of around 2 GB, so input sizes are capped.

## Licensing

FFmpeg is LGPL or GPL depending on the build. Framewright ships the LGPL core and avoids GPL-only encoders such as libx264.
