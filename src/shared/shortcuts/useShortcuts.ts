import { useEffect, useRef } from 'react'
import {
  SHORTCUTS,
  type ActionHandlers,
  type KeyChord,
  type ShortcutDefinition,
} from './registry'

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  )
}

const NAVIGATION_KEYS = new Set([' ', 'ArrowLeft', 'ArrowRight', 'Home', 'End'])

const KEY_OWNER_SELECTOR =
  'button, a, [role="slider"], [role="tab"], [role="option"], [role="menuitem"], [role="listbox"], [role="separator"], [role="switch"], [role="checkbox"], [role="radio"], [role="dialog"], [role="menu"]'

function targetOwnsKey(event: KeyboardEvent): boolean {
  if (!NAVIGATION_KEYS.has(event.key)) return false
  if (!(event.target instanceof HTMLElement)) return false
  return event.target.closest(KEY_OWNER_SELECTOR) !== null
}

function matchesChord(event: KeyboardEvent, chord: KeyChord): boolean {
  const mod = event.metaKey || event.ctrlKey
  if (Boolean(chord.mod) !== mod) return false
  if (Boolean(chord.shift) !== event.shiftKey) {
    const isSymbol = chord.keys.some((k) => k === '+' || k === '_')
    if (!isSymbol) return false
  }
  if (Boolean(chord.alt) !== event.altKey) return false
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
  return chord.keys.includes(key)
}

function findDefinition(event: KeyboardEvent): ShortcutDefinition | undefined {
  const defs = Object.values(SHORTCUTS)
  const matches = defs.filter((def) =>
    def.chords.some((chord) => matchesChord(event, chord)),
  )
  return matches.sort(
    (a, b) =>
      Number(Boolean(b.chords[0].shift)) - Number(Boolean(a.chords[0].shift)),
  )[0]
}

export function useShortcuts(handlers: ActionHandlers, enabled = true) {
  const handlersRef = useRef(handlers)
  useEffect(() => {
    handlersRef.current = handlers
  })

  useEffect(() => {
    if (!enabled) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) return
      if (targetOwnsKey(event)) return
      const def = findDefinition(event)
      if (!def) return
      if (!def.allowInTextFields && isEditableTarget(event.target)) return
      event.preventDefault()
      handlersRef.current[def.id]()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled])
}
