# Wiring guide

The UI is presentational. Every real behaviour is a typed seam you connect yourself. Seams are not marked with `// WIRE:` comments because this repo forbids inline comments. Instead, every seam is one member of `EditorHandlers` in `src/features/app-shell/handlers.ts`, and each is listed below.

## How it is connected today

- `src/App.tsx` renders `AppShell` with mock data from `src/mocks` and `createUnwiredHandlers()`.
- `createUnwiredHandlers()` returns a Proxy that shows a toast and `console.debug` for every call, so you can see which seam fired and with what payload.
- To wire a seam, replace its entry in the `handlers` object in `App.tsx`. Search for `handlers=` there.
- Export is already driven by `useMockExport` in `src/mocks/export.ts`. Replace it with your real progress state.

## Inputs you provide (props of `AppShell`)

| Prop             | Type                                          | Purpose                                                                                                                   |
| ---------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `doc`            | `TimelineDocument`                            | Single source of truth. Items need `start` and `duration` (timeline time) plus `sourceIn`, `sourceOut`, `speed` for clips |
| `media`          | `MediaAsset[]`                                | Project panel library                                                                                                     |
| `playback`       | `{ isPlaying, currentTime, loop }`            | Drives the playhead, timecode and transport                                                                               |
| `canvasRef`      | `RefObject<HTMLCanvasElement>`                | Canvas the compositor draws into. Intrinsic size is `doc.width` x `doc.height`                                            |
| `diagnostics`    | `{ engine, crossOriginIsolated, memoryHint }` | Status bar badges                                                                                                         |
| `exportStatus`   | `ExportStatus`                                | Export dialog state: idle, running, done, cancelled, error                                                                |
| `exportEstimate` | `{ sizeBytes, seconds } \| null`              | Estimated size and time. Recomputed via `onEstimateRequest(settings)`                                                     |

UI-only state kept inside `AppShell`: selection, active tool, snap flag, timeline zoom, workspace, theme, dialog and palette open state, panel layout.

## Callbacks (`EditorHandlers`)

| Callback                                              | Payload                                              | Fired by                                                              |
| ----------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------- |
| `onNewProject` / `onSaveProject` / `onClearLocalData` | none                                                 | File menu                                                             |
| `onRenameProject`                                     | `name: string`                                       | Project name field                                                    |
| `onWorkspaceChange`                                   | `workspace: string`                                  | Workspace switcher                                                    |
| `onImportFiles`                                       | `files: File[]`                                      | Dropzone, File > Import                                               |
| `onAddMediaToTimeline`                                | `mediaId`                                            | Media card (double-click, Enter, context menu), audio list            |
| `onAddTextItem`                                       | none                                                 | Text tab                                                              |
| `onPlayPause`                                         | none                                                 | Transport, Space                                                      |
| `onShuttle`                                           | `'reverse' \| 'stop' \| 'forward'`                   | J / K / L                                                             |
| `onStepFrame`                                         | `-1 \| 1`                                            | Transport, arrow keys, playhead                                       |
| `onSeek`                                              | `time: Seconds`                                      | Click on the ruler (x / pxPerSecond)                                  |
| `onJumpToStart` / `onJumpToEnd`                       | none                                                 | Transport, Home / End                                                 |
| `onToggleLoop`                                        | `loop: boolean`                                      | Transport, Mod+L                                                      |
| `onMarkIn` / `onMarkOut`                              | none                                                 | I / O                                                                 |
| `onSelectionChange`                                   | `itemIds: string[]`                                  | Clip click or Enter, empty lane click                                 |
| `onSplit`                                             | none                                                 | Toolbar, S                                                            |
| `onDelete`                                            | `{ ripple: boolean }`                                | Delete, Shift+Delete, toolbar                                         |
| `onUndo` / `onRedo`                                   | none                                                 | Edit menu, Mod+Z, Mod+Shift+Z                                         |
| `onSelectTool`                                        | `'select' \| 'razor'`                                | Toolbar, V / C                                                        |
| `onToggleSnap`                                        | `enabled: boolean`                                   | Toolbar, N                                                            |
| `onTimelineZoomChange`                                | `pxPerSecond: number`                                | Slider, buttons, + / -                                                |
| `onTrimClip`                                          | `{ itemId, edge: 'in' \| 'out', deltaFrames }`       | Keyboard only: Shift+Alt+Arrow trims out, Ctrl/Cmd+Alt+Arrow trims in |
| `onMoveClip`                                          | `{ itemId, deltaFrames }`                            | Keyboard only: Alt+Arrow on a focused clip                            |
| `onClipPointerDown`                                   | `itemId, PointerEvent`                               | Pointer down on a clip. Implement drag and razor click here           |
| `onTrimHandlePointerDown`                             | `itemId, edge, PointerEvent`                         | Pointer down on a trim handle. Implement trim drag here               |
| `onToggleTrack`                                       | `{ trackId, toggle: 'muted' \| 'locked' \| 'solo' }` | Track headers                                                         |
| `onUpdateItem`                                        | `itemId, ItemPatch`                                  | Every inspector field                                                 |
| `onExport`                                            | `ExportSettings`                                     | Export dialog                                                         |
| `onCancelExport`                                      | none                                                 | Export dialog                                                         |

Pointer drag and scrub are not implemented. The UI only reports the initial `pointerdown`. Attach your own `pointermove` and `pointerup` listeners, and use `setPointerCapture`.

## Shortcut registry

Single source: `src/shared/shortcuts/registry.ts`. `useShortcuts` matches key events and fires the `ActionHandlers` map built in `AppShell`. The command palette lists the same registry.

| Action                          | Keys                  | Calls                           |
| ------------------------------- | --------------------- | ------------------------------- |
| playPause                       | Space                 | `onPlayPause`                   |
| shuttleReverse / Stop / Forward | J / K / L             | `onShuttle`                     |
| stepBack / stepForward          | Left / Right          | `onStepFrame`                   |
| jumpToStart / jumpToEnd         | Home / End            | `onJumpToStart` / `onJumpToEnd` |
| toggleLoop                      | Mod+L                 | `onToggleLoop`                  |
| markIn / markOut                | I / O                 | `onMarkIn` / `onMarkOut`        |
| split                           | S                     | `onSplit`                       |
| delete / rippleDelete           | Delete / Shift+Delete | `onDelete`                      |
| undo / redo                     | Mod+Z / Mod+Shift+Z   | `onUndo` / `onRedo`             |
| toolSelect / toolRazor          | V / C                 | `onSelectTool`                  |
| toggleSnap                      | N                     | `onToggleSnap`                  |
| zoomIn / zoomOut                | + / -                 | `onTimelineZoomChange`          |
| commandPalette                  | Mod+K                 | opens palette                   |
| export                          | Mod+E                 | opens export dialog             |

Shortcuts are ignored in text fields (except Mod+K and Mod+E), and navigation keys are ignored when a button, slider, tab, menu or clip option has focus so widgets keep their native keyboard behaviour.

## Design tokens

All colours, radii and track sizes are CSS variables in `src/index.css`: surfaces `--surface-0..3`, `--accent-solid`, state colours, `--playhead`, and clip colours `--clip-video`, `--clip-caption`, `--clip-audio`, `--clip-music` (each with an `-fg` pair). The token for text clips is named `caption` because Tailwind already owns the `bg-clip-text` utility.
