export type ActionId =
  | 'playPause'
  | 'shuttleReverse'
  | 'shuttleStop'
  | 'shuttleForward'
  | 'stepBack'
  | 'stepForward'
  | 'jumpToStart'
  | 'jumpToEnd'
  | 'markIn'
  | 'markOut'
  | 'split'
  | 'delete'
  | 'rippleDelete'
  | 'bringToFront'
  | 'bringForward'
  | 'sendBackward'
  | 'sendToBack'
  | 'undo'
  | 'redo'
  | 'commandPalette'
  | 'zoomIn'
  | 'zoomOut'
  | 'toolSelect'
  | 'toolRazor'
  | 'toggleSnap'
  | 'toggleLoop'
  | 'export'

export type ActionGroup = 'Playback' | 'Edit' | 'Timeline' | 'App'

export interface KeyChord {
  keys: string[]
  mod?: boolean
  shift?: boolean
  alt?: boolean
}

export interface ShortcutDefinition {
  id: ActionId
  label: string
  group: ActionGroup
  chords: KeyChord[]
  display: string
  allowInTextFields?: boolean
}

export const SHORTCUTS: Record<ActionId, ShortcutDefinition> = {
  playPause: {
    id: 'playPause',
    label: 'Play / Pause',
    group: 'Playback',
    chords: [{ keys: [' '] }],
    display: 'Space',
  },
  shuttleReverse: {
    id: 'shuttleReverse',
    label: 'Shuttle reverse',
    group: 'Playback',
    chords: [{ keys: ['j'] }],
    display: 'J',
  },
  shuttleStop: {
    id: 'shuttleStop',
    label: 'Shuttle stop',
    group: 'Playback',
    chords: [{ keys: ['k'] }],
    display: 'K',
  },
  shuttleForward: {
    id: 'shuttleForward',
    label: 'Shuttle forward',
    group: 'Playback',
    chords: [{ keys: ['l'] }],
    display: 'L',
  },
  stepBack: {
    id: 'stepBack',
    label: 'Step back one frame',
    group: 'Playback',
    chords: [{ keys: ['ArrowLeft'] }],
    display: '←',
  },
  stepForward: {
    id: 'stepForward',
    label: 'Step forward one frame',
    group: 'Playback',
    chords: [{ keys: ['ArrowRight'] }],
    display: '→',
  },
  jumpToStart: {
    id: 'jumpToStart',
    label: 'Jump to start',
    group: 'Playback',
    chords: [{ keys: ['Home'] }],
    display: 'Home',
  },
  jumpToEnd: {
    id: 'jumpToEnd',
    label: 'Jump to end',
    group: 'Playback',
    chords: [{ keys: ['End'] }],
    display: 'End',
  },
  toggleLoop: {
    id: 'toggleLoop',
    label: 'Toggle loop',
    group: 'Playback',
    chords: [{ keys: ['l'], mod: true }],
    display: 'Mod+L',
  },
  markIn: {
    id: 'markIn',
    label: 'Mark in',
    group: 'Timeline',
    chords: [{ keys: ['i'] }],
    display: 'I',
  },
  markOut: {
    id: 'markOut',
    label: 'Mark out',
    group: 'Timeline',
    chords: [{ keys: ['o'] }],
    display: 'O',
  },
  split: {
    id: 'split',
    label: 'Split at playhead',
    group: 'Timeline',
    chords: [{ keys: ['s'] }],
    display: 'S',
  },
  delete: {
    id: 'delete',
    label: 'Delete',
    group: 'Edit',
    chords: [{ keys: ['Delete', 'Backspace'] }],
    display: 'Delete',
  },
  rippleDelete: {
    id: 'rippleDelete',
    label: 'Ripple delete',
    group: 'Edit',
    chords: [{ keys: ['Delete', 'Backspace'], shift: true }],
    display: 'Shift+Delete',
  },
  bringToFront: {
    id: 'bringToFront',
    label: 'Bring to front',
    group: 'Edit',
    chords: [{ keys: [']', '}'], mod: true, shift: true }],
    display: 'Mod+Shift+]',
  },
  bringForward: {
    id: 'bringForward',
    label: 'Bring forward',
    group: 'Edit',
    chords: [{ keys: [']'], mod: true }],
    display: 'Mod+]',
  },
  sendBackward: {
    id: 'sendBackward',
    label: 'Send backward',
    group: 'Edit',
    chords: [{ keys: ['['], mod: true }],
    display: 'Mod+[',
  },
  sendToBack: {
    id: 'sendToBack',
    label: 'Send to back',
    group: 'Edit',
    chords: [{ keys: ['[', '{'], mod: true, shift: true }],
    display: 'Mod+Shift+[',
  },
  undo: {
    id: 'undo',
    label: 'Undo',
    group: 'Edit',
    chords: [{ keys: ['z'], mod: true }],
    display: 'Mod+Z',
  },
  redo: {
    id: 'redo',
    label: 'Redo',
    group: 'Edit',
    chords: [{ keys: ['z'], mod: true, shift: true }],
    display: 'Mod+Shift+Z',
  },
  toolSelect: {
    id: 'toolSelect',
    label: 'Select tool',
    group: 'Timeline',
    chords: [{ keys: ['v'] }],
    display: 'V',
  },
  toolRazor: {
    id: 'toolRazor',
    label: 'Razor tool',
    group: 'Timeline',
    chords: [{ keys: ['c'] }],
    display: 'C',
  },
  toggleSnap: {
    id: 'toggleSnap',
    label: 'Toggle snapping',
    group: 'Timeline',
    chords: [{ keys: ['n'] }],
    display: 'N',
  },
  zoomIn: {
    id: 'zoomIn',
    label: 'Zoom timeline in',
    group: 'Timeline',
    chords: [{ keys: ['+', '='] }],
    display: '+',
  },
  zoomOut: {
    id: 'zoomOut',
    label: 'Zoom timeline out',
    group: 'Timeline',
    chords: [{ keys: ['-', '_'] }],
    display: '-',
  },
  commandPalette: {
    id: 'commandPalette',
    label: 'Command palette',
    group: 'App',
    chords: [{ keys: ['k'], mod: true }],
    display: 'Mod+K',
    allowInTextFields: true,
  },
  export: {
    id: 'export',
    label: 'Export…',
    group: 'App',
    chords: [{ keys: ['e'], mod: true }],
    display: 'Mod+E',
    allowInTextFields: true,
  },
}

export type ActionHandlers = Record<ActionId, () => void>

export const isMac =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

export function formatShortcut(display: string): string {
  if (isMac) {
    return display
      .replace('Mod', '⌘')
      .replace('Shift', '⇧')
      .replace('Alt', '⌥')
      .replace(/\+/g, '')
  }
  return display.replace('Mod', 'Ctrl')
}
