import { useEffect, useRef, useCallback, useState } from 'react'
import type { ProjectData } from '../pages/CreateProjectPage'

const DRAFT_KEY  = 'dreamscape_wizard_draft'
const STEP_KEY   = 'dreamscape_wizard_step'
const SAVE_INTERVAL_MS = 30_000

/* ── Read from localStorage (returns null if nothing saved) ── */
export function loadDraft(): { data: ProjectData; step: number } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    const stp = localStorage.getItem(STEP_KEY)
    if (!raw) return null
    return { data: JSON.parse(raw) as ProjectData, step: stp ? parseInt(stp) : 1 }
  } catch {
    return null
  }
}

/* ── Persist to localStorage ── */
export function saveDraft(data: ProjectData, step: number): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data))
    localStorage.setItem(STEP_KEY, String(step))
  } catch { /* storage full — silently skip */ }
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY)
  localStorage.removeItem(STEP_KEY)
}

/* ── Hook: auto-save every 30 s + return manual save ── */
export function useWizardDraft(data: ProjectData, step: number) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [justSaved, setJustSaved] = useState(false)
  const dataRef = useRef(data)
  const stepRef = useRef(step)

  // Keep refs current so interval closure always sees latest values
  useEffect(() => { dataRef.current = data }, [data])
  useEffect(() => { stepRef.current = step }, [step])

  // Auto-save every 30 s
  useEffect(() => {
    const id = setInterval(() => {
      saveDraft(dataRef.current, stepRef.current)
      setLastSaved(new Date())
    }, SAVE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  const manualSave = useCallback(() => {
    saveDraft(dataRef.current, stepRef.current)
    setLastSaved(new Date())
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }, [])

  return { lastSaved, justSaved, manualSave }
}
