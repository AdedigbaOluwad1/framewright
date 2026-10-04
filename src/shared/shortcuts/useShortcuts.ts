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

const SPACE_OWNER_SELECTOR =
  'button, a, [role="slider"], [role="tab"], [role="option"], [role="menuitem"], [role="switch"], [role="checkbox"], [role="radio"], [role="dialog"], [role="menu"]'

const ARROW_OWNER_SELECTOR =
  '[role="slider"], [role="tab"], [role="option"], [role="menuitem"], [role="listbox"], [role="separator"], [role="radio"], [role="radiogroup"], [role="dialog"], [role="menu"]'

const RETAIN_FOCUS_SELECTOR =
  '[role="dialog"], [role="menu"], [role="menubar"], [role="listbox"], [role="tablist"], [role="combobox"]'

const ARROW_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'Home', 'End'])

function isMouseFocusedControl(target: HTMLElement): boolean {
  const control = target.closest('button, a')
  return control !== null && !control.matches(':focus-visible')
}

function targetOwnsKey(event: KeyboardEvent): boolean {
  if (!(event.target instanceof HTMLElement)) return false
  if (event.key === ' ') {
    if (isMouseFocusedControl(event.target)) return false
    return event.target.closest(SPACE_OWNER_SELECTOR) !== null
  }
  if (ARROW_KEYS.has(event.key))
    return event.target.closest(ARROW_OWNER_SELECTOR) !== null
  return false
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
    function releaseFocusAfterMouseClick(event: MouseEvent) {
      if (event.detail === 0 || !(event.target instanceof HTMLElement)) return
      const button = event.target.closest('button')
      if (!button || button.closest(RETAIN_FOCUS_SELECTOR)) return
      requestAnimationFrame(() => button.blur())
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('click', releaseFocusAfterMouseClick)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('click', releaseFocusAfterMouseClick)
    }
  }, [enabled])
}
