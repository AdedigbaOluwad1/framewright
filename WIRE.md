# How the editor is wired

Everything in the UI is now connected to real behaviour. This file maps each user action to the code that runs it, so you can read the flow end to end.

## Layers

| Layer          | Where                                                          | What it owns                                                                                                 |
| -------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| UI shell       | `src/features/app-shell` and sibling feature folders           | Layout, dialogs, UI-only state (tool, snap, zoom, workspace, theme, open dialogs). Pure props and callbacks. |
| Controller     | `src/features/editor/useEditorController.ts`                   | Builds the `EditorHandlers` object. The only place the UI meets the engines.                                 |
| Editor store   | `src/features/editor/store.ts`                                 | The timeline document, media list, selection, marks and undo history (Immer patches).                        |
| Timeline logic | `src/features/timeline/ops.ts`                                 | Pure functions: split, trim, move, ripple delete, overlap resolution, item updates. Unit tested.             |
| Gestures       | `src/features/timeline/useTimelineGestures.ts`                 | Pointer drag, trim and snapping geometry. Reports absolute times to handlers.                                |
| Compositor     | `src/compositor/draw.ts`                                       | Draws one frame from layers. Shared by preview and export, so they cannot drift.                             |
| Preview engine | `src/engine/preview.ts`                                        | Playback clock, scrubbing, A/V sync, loop, shuttle. Drives the monitor canvas.                               |
| Media          | `src/engine/mediaLibrary.ts`, `importer.ts`                    | Probing, thumbnails, waveform peaks, size caps and error hints.                                              |
| Export         | `src/engine/exporter.ts`, `src/features/export/exportStore.ts` | WebCodecs encode via mediabunny, audio mixdown, progress, cancel.                                            |
| Persistence    | `src/storage/projectStorage.ts`                                | IndexedDB project JSON, OPFS media files, autosave, clear.                                                   |
| Capabilities   | `src/engine/capabilities.ts`                                   | Detects encoders and storage at startup for the status bar and diagnostics.                                  |

## Action to code

| Action                                       | Handler                                                                          | Runs                                                                                                                                   |
| -------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Import (browse, drop anywhere, File menu)    | `onImportFiles`                                                                  | `importFiles` probes with mediabunny, caps size at 2 GB, registers the file, makes a thumbnail and waveform, stores the file in OPFS   |
| Add clip, text, music                        | `onAddMediaToTimeline`, `onAddTextItem`                                          | `addMediaToTimeline` appends video and images to the end of V1 and places audio at the playhead. `addText` places text at the playhead |
| Play, pause, shuttle, step, seek, jump, loop | `onPlayPause`, `onShuttle`, `onStepFrame`, `onSeek`, `onJumpTo*`, `onToggleLoop` | `previewEngine` methods                                                                                                                |
| Mark in and out                              | `onMarkIn`, `onMarkOut`                                                          | `setMarks`. With loop on, playback stays inside the marks                                                                              |
| Select                                       | `onSelectionChange`                                                              | `setSelection`                                                                                                                         |
| Split, razor click                           | `onSplit`, `onSplitAt`                                                           | `splitAtPlayhead` (selected clips under the playhead, otherwise all) and `splitItemAt`                                                 |
| Delete, ripple delete                        | `onDelete`                                                                       | `deleteSelected`. Ripple closes the gap on each track                                                                                  |
| Drag to move or reorder                      | `onItemDrag`                                                                     | gesture on the store: `beginGesture`, `moveTo` while dragging, one `endGesture` for a single undo step                                 |
| Drag a trim handle                           | `onItemTrim`                                                                     | same gesture flow with `trimTo`, bounded by source length and neighbours                                                               |
| Keyboard trim and move                       | `onTrimClip`, `onMoveClip`                                                       | `trimByFrames`, `moveByFrames`                                                                                                         |
| Track mute, lock, solo                       | `onToggleTrack`                                                                  | `toggleTrackFlag`. Locked tracks reject edits. Mute and solo affect preview and export audio                                           |
| Inspector fields                             | `onUpdateItem`                                                                   | `updateItem` in `ops.ts`. Rapid slider changes merge into one undo step                                                                |
| Undo, redo                                   | `onUndo`, `onRedo`                                                               | Applies stored Immer patches                                                                                                           |
| Export                                       | `onExport`, `onCancelExport`, `onDownloadExport`, `onResetExport`                | `useExportStore` calls `exportProject` and downloads the file                                                                          |
| New project, clear local data                | `onNewProject`, `onClearLocalData`                                               | Asks for confirmation in the shell, then replaces the project and clears storage                                                       |
| Save                                         | `onSaveProject`                                                                  | `saveProjectNow`. Autosave also runs 0.8 s after any change                                                                            |
| Workspace                                    | `onWorkspaceChange`                                                              | The shell resizes the panel groups (Editing, Audio, Titles)                                                                            |

## Timeline model rules

- `start` and `duration` are in timeline seconds, snapped to whole frames. `sourceIn`, `sourceOut` and `speed` describe the source range. `duration` is kept equal to `(sourceOut - sourceIn) / speed` for clips.
- Layer order is decided by each visual item's `z` (video defaults to 0, text to 1, so text sits above video). Track order only breaks ties.
- Items on a track never overlap. Moving one over a neighbour reorders them by pushing the neighbour along (`settle` in `ops.ts`).
- Transform `x` and `y` are fractions of the canvas, so `0.1` is 10%. Text `position` is the centre as a fraction. Fit is contain, Fill is cover, Crop is cover with a pan that cannot reveal black edges.

## Shortcuts

Single typed registry in `src/shared/shortcuts/registry.ts`. `useShortcuts` matches key events and fires the actions built in `AppShell`. The command palette and the Keyboard shortcuts dialog both read the same registry.

| Action                            | Keys                                       |
| --------------------------------- | ------------------------------------------ |
| Play and pause                    | Space                                      |
| Shuttle reverse, stop, forward    | J, K, L (repeat to double speed, up to 4x) |
| Step frame                        | Left, Right                                |
| Jump to start and end             | Home, End                                  |
| Loop                              | Mod+L                                      |
| Mark in, out                      | I, O                                       |
| Split                             | S                                          |
| Delete, ripple delete             | Delete, Shift+Delete                       |
| Undo, redo                        | Mod+Z, Mod+Shift+Z                         |
| Select tool, razor tool, snapping | V, C, N                                    |
| Zoom timeline                     | +, -                                       |
| Command palette, export           | Mod+K, Mod+E                               |

On a focused clip: Alt+Left and Alt+Right move it one frame, Alt+Shift+Left and Right trim the end, Ctrl or Cmd+Alt+Left and Right trim the start. A mouse click on a button releases its focus, so Space plays rather than re-pressing the button.

## Screen size

The editor needs at least 1024px of viewport width (large tablets in landscape and up). Below that, `ScreenGate` shows a friendly "we need a bigger screen" notice, hides the editor and makes it inert, and brings the editor back live if the window is resized wider. The threshold is `MIN_SCREEN_WIDTH` in `src/features/app-shell/ScreenGate.tsx`.

## Known limits

- Containers mediabunny cannot read (AVI, FLV) are rejected with a hint. The ffmpeg.wasm remux fallback from the spec is not built.
- If WebCodecs cannot encode, the status bar says so and export is blocked. There is no ffmpeg.wasm encode fallback.
- Export runs on the main thread (it yields every frame). Moving it to a worker is the next step.
- Preview decodes through hidden media elements, so it is not frame-exact while playing. Export uses exact decoded frames.
- Estimated export size is an upper bound from the bitrate.
