import { useState, useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from '../routerContext'
import { WizardProgressBar } from '../components/wizard/WizardProgressBar'
import { LiveSummaryPanel } from '../components/wizard/LiveSummaryPanel'
import { Step1ProjectDetails } from '../components/wizard/Step1ProjectDetails'
import { Step2PlotInfo } from '../components/wizard/Step2PlotInfo'
import { Step3Rooms } from '../components/wizard/Step3Rooms'
import { Step4Budget } from '../components/wizard/Step4Budget'
import { Step5AIPrompt } from '../components/wizard/Step5AIPrompt'
import { useWizardDraft, loadDraft, saveDraft } from '../hooks/useWizardDraft'

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
export interface ProjectData {
  // Step 1
  projectName: string
  description: string
  houseStyle: string
  // Step 2
  plotWidth: string
  plotLength: string
  plotUnit: 'feet' | 'meters'
  plotShape: string
  // Step 3
  rooms: string[]
  bedroomCount: number
  bathroomCount: number
  // Step 4
  budget: number
  constructionPriority: string
  features: string[]
  // Step 5
  aiPrompt: string
}

const INITIAL_DATA: ProjectData = {
  projectName: '',
  description: '',
  houseStyle: '',
  plotWidth: '',
  plotLength: '',
  plotUnit: 'feet',
  plotShape: '',
  rooms: [],
  bedroomCount: 3,
  bathroomCount: 2,
  budget: 500000,
  constructionPriority: '',
  features: [],
  aiPrompt: '',
}

export const STEPS = [
  { id: 1, label: 'Project Details',    icon: '🏠' },
  { id: 2, label: 'Plot Information',   icon: '📐' },
  { id: 3, label: 'House Requirements', icon: '🛏' },
  { id: 4, label: 'Budget',             icon: '💰' },
  { id: 5, label: 'AI Prompt',          icon: '✦'  },
]

/* ─────────────────────────────────────────────────────────────
   STEP COMPLETION  (0–100%)
   Each step contributes 20% of the total 100%
───────────────────────────────────────────────────────────── */
export function stepCompletion(data: ProjectData, step: number): number {
  switch (step) {
    case 1: {
      let pct = 0
      if (data.projectName.trim()) pct += 12
      if (data.description.trim()) pct += 4
      if (data.houseStyle)         pct += 4
      return pct
    }
    case 2: {
      let pct = 0
      if (data.plotWidth)  pct += 6
      if (data.plotLength) pct += 6
      if (data.plotShape)  pct += 8
      return pct
    }
    case 3: {
      let pct = 0
      if (data.bedroomCount > 0)  pct += 8
      if (data.bathroomCount > 0) pct += 4
      if (data.rooms.length > 0)  pct += 8
      return Math.min(pct, 20)
    }
    case 4: {
      let pct = 0
      if (data.budget > 0)               pct += 8
      if (data.constructionPriority)     pct += 6
      if (data.features.length > 0)      pct += 6
      return Math.min(pct, 20)
    }
    case 5: {
      return data.aiPrompt.trim().length > 20 ? 20 : Math.round((data.aiPrompt.trim().length / 20) * 20)
    }
    default: return 0
  }
}

export function overallCompletion(data: ProjectData): number {
  return Math.min(
    stepCompletion(data, 1) +
    stepCompletion(data, 2) +
    stepCompletion(data, 3) +
    stepCompletion(data, 4) +
    stepCompletion(data, 5),
    100
  )
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function CreateProjectPage() {
  const { navigate } = useRouter()

  // ── Restore draft on mount ──
  const restored = useRef(false)
  const [step, setStep]     = useState<number>(() => {
    if (!restored.current) {
      const draft = loadDraft()
      if (draft) { restored.current = true; return draft.step }
    }
    return 1
  })
  const [data, setData]     = useState<ProjectData>(() => {
    const draft = loadDraft()
    return draft ? draft.data : INITIAL_DATA
  })
  const [direction, setDir] = useState<1 | -1>(1)
  const [showDraftBanner, setShowDraftBanner] = useState(() => !!loadDraft())

  const { lastSaved, justSaved, manualSave } = useWizardDraft(data, step)

  const update = useCallback(<K extends keyof ProjectData>(key: K, value: ProjectData[K]) => {
    setData(prev => ({ ...prev, [key]: value }))
  }, [])

  // Also persist on every step change
  useEffect(() => {
    saveDraft(data, step)
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => { setDir(1);  setStep(s => Math.min(s + 1, 5)) }
  const prev = () => { setDir(-1); setStep(s => Math.max(s - 1, 1)) }

  const currentStep = STEPS[step - 1]
  const totalPct    = overallCompletion(data)
  const stepPct     = stepCompletion(data, step)

  return (
    <div style={S.root}>
      <style>{CSS}</style>

      {/* ── Background orbs ── */}
      <div style={S.orb1} />
      <div style={S.orb2} />
      <div style={S.orb3} />

      {/* ── Draft restored banner ── */}
      <AnimatePresence>
        {showDraftBanner && (
          <motion.div
            style={S.draftBanner}
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            <span style={{ fontSize: '16px' }}>💾</span>
            <span style={S.draftBannerText}>Draft restored — you can continue where you left off.</span>
            <button
              style={S.draftDismiss}
              onClick={() => setShowDraftBanner(false)}
            >✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP BAR ── */}
      <header style={S.topBar}>
        <button style={S.backBtn} className="cpw-back-btn" onClick={() => navigate('dashboard')}>
          <span style={S.backArrow}>←</span>
          <span>Back to Dashboard</span>
        </button>

        <div style={S.topBarCenter}>
          <div style={S.logoWrap}>
            <div style={S.logoIcon}>🏠</div>
            <span style={S.logoText}>DreamScape AI</span>
          </div>
        </div>

        {/* Save Draft button */}
        <motion.button
          style={{ ...S.saveDraftBtn, ...(justSaved ? S.saveDraftBtnSaved : {}) }}
          className="cpw-save-draft-btn"
          onClick={manualSave}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
        >
          <AnimatePresence mode="wait">
            {justSaved ? (
              <motion.span key="saved" style={S.saveDraftInner} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                <span>✓</span> Saved!
              </motion.span>
            ) : (
              <motion.span key="idle" style={S.saveDraftInner} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                <span>💾</span> Save Draft
                {lastSaved && <span style={S.lastSavedHint}>{formatTime(lastSaved)}</span>}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </header>

      {/* ── Overall completion bar (thin strip under topbar) ── */}
      <div style={S.overallBar}>
        <motion.div
          style={S.overallFill}
          animate={{ width: `${totalPct}%` }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={S.layout} className="cpw-layout">

        {/* ── LEFT: WIZARD ── */}
        <div style={S.wizardCol}>

          {/* Progress bar */}
          <WizardProgressBar step={step} steps={STEPS} completionPct={totalPct} />

          {/* Step heading + per-step completion badge */}
          <div style={S.stepHeading}>
            <motion.span
              key={step}
              style={S.stepEmoji}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            >
              {currentStep.icon}
            </motion.span>
            <div style={{ flex: 1 }}>
              <p style={S.stepCount}>Step {step} of 5</p>
              <h1 style={S.stepTitle}>{currentStep.label}</h1>
            </div>
            {/* Per-step completion badge */}
            <motion.div
              style={{
                ...S.stepBadge,
                background: stepPct >= 20
                  ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.1))'
                  : 'rgba(139,92,246,0.1)',
                border: stepPct >= 20
                  ? '1px solid rgba(16,185,129,0.35)'
                  : '1px solid rgba(139,92,246,0.25)',
              }}
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 0.3 }}
              key={stepPct}
            >
              <span style={{
                ...S.stepBadgePct,
                color: stepPct >= 20 ? '#10b981' : '#a78bfa',
              }}>
                {stepPct >= 20 ? '✓' : `${Math.round((stepPct / 20) * 100)}%`}
              </span>
              <span style={S.stepBadgeLabel}>
                {stepPct >= 20 ? 'Step done' : 'this step'}
              </span>
            </motion.div>
          </div>

          {/* Step content with slide animation */}
          <div style={S.stepWrap}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {step === 1 && <Step1ProjectDetails data={data} update={update} onNext={next} />}
                {step === 2 && <Step2PlotInfo       data={data} update={update} onNext={next} onPrev={prev} />}
                {step === 3 && <Step3Rooms          data={data} update={update} onNext={next} onPrev={prev} />}
                {step === 4 && <Step4Budget         data={data} update={update} onNext={next} onPrev={prev} />}
                {step === 5 && <Step5AIPrompt       data={data} update={update} onPrev={prev} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT: LIVE SUMMARY ── */}
        <div style={S.summaryCol}>
          <LiveSummaryPanel data={data} currentStep={step} />
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/* ─────────────────────────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────────────────────────── */
const slideVariants = {
  enter:  (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
const S: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: '#080b14',
    fontFamily: "'Space Grotesk', sans-serif",
    color: '#f1f5f9',
    position: 'relative',
    overflowX: 'hidden',
  },
  orb1: {
    position: 'fixed', width: '700px', height: '700px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)',
    top: '-200px', right: '-100px', pointerEvents: 'none', zIndex: 0,
  },
  orb2: {
    position: 'fixed', width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)',
    bottom: '-100px', left: '10%', pointerEvents: 'none', zIndex: 0,
  },
  orb3: {
    position: 'fixed', width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(236,72,153,0.04) 0%, transparent 70%)',
    top: '30%', left: '30%', pointerEvents: 'none', zIndex: 0,
  },
  draftBanner: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1))',
    borderBottom: '1px solid rgba(16,185,129,0.3)',
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    padding: '10px 24px',
    display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center',
  },
  draftBannerText: { fontSize: '13px', color: '#a7f3d0', fontWeight: 500 },
  draftDismiss: {
    background: 'transparent', border: 'none', color: '#64748b',
    cursor: 'pointer', fontSize: '14px', marginLeft: '8px', padding: '2px 6px',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  topBar: {
    position: 'sticky', top: 0, zIndex: 40,
    background: 'rgba(8,11,20,0.88)',
    backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
    borderBottom: '1px solid rgba(139,92,246,0.12)',
    padding: '12px 32px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '16px',
  },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: '10px', color: '#94a3b8', fontSize: '13px', fontWeight: 500,
    padding: '8px 14px', cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif", transition: 'all 0.2s',
    flexShrink: 0,
  },
  backArrow: { fontSize: '16px', color: '#8b5cf6' },
  topBarCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: {
    width: '36px', height: '36px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', boxShadow: '0 0 20px rgba(139,92,246,0.4)',
  },
  logoText: {
    fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '18px',
    background: 'linear-gradient(135deg, #a78bfa, #67e8f9)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  saveDraftBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'rgba(139,92,246,0.1)',
    border: '1px solid rgba(139,92,246,0.25)',
    borderRadius: '10px', color: '#94a3b8', fontSize: '13px', fontWeight: 600,
    padding: '8px 16px', cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif", transition: 'all 0.2s',
    flexShrink: 0,
  },
  saveDraftBtnSaved: {
    background: 'rgba(16,185,129,0.15)',
    border: '1px solid rgba(16,185,129,0.35)',
    color: '#10b981',
  },
  saveDraftInner: { display: 'flex', alignItems: 'center', gap: '6px' },
  lastSavedHint: {
    fontSize: '10px', color: '#475569', marginLeft: '4px', fontWeight: 400,
  },
  overallBar: {
    height: '3px', background: 'rgba(139,92,246,0.1)', position: 'relative', zIndex: 39,
  },
  overallFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #8b5cf6, #06b6d4, #10b981)',
    backgroundSize: '200% 100%',
    borderRadius: '0 2px 2px 0',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    gap: '32px',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '36px 32px 60px',
    position: 'relative', zIndex: 1,
    alignItems: 'start',
  },
  wizardCol: { display: 'flex', flexDirection: 'column', gap: '0' },
  summaryCol: { position: 'sticky', top: '90px' },
  stepHeading: {
    display: 'flex', alignItems: 'center', gap: '16px',
    marginBottom: '28px',
  },
  stepEmoji: { fontSize: '36px', lineHeight: 1 },
  stepCount: {
    fontSize: '12px', fontWeight: 600, color: '#8b5cf6',
    letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px',
  },
  stepTitle: {
    fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: 800,
    background: 'linear-gradient(135deg, #f1f5f9 0%, #a78bfa 60%, #67e8f9 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    lineHeight: 1.1,
  },
  stepBadge: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '8px 14px', borderRadius: '12px', flexShrink: 0,
    transition: 'all 0.3s',
  },
  stepBadgePct: {
    fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 800, lineHeight: 1,
  },
  stepBadgeLabel: {
    fontSize: '10px', color: '#475569', fontWeight: 500, marginTop: '2px',
  },
  stepWrap: { overflow: 'hidden' },
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

  .cpw-back-btn:hover {
    background: rgba(139,92,246,0.15) !important;
    border-color: rgba(139,92,246,0.4) !important;
    color: #a78bfa !important;
  }
  .cpw-save-draft-btn:hover {
    background: rgba(139,92,246,0.18) !important;
    border-color: rgba(139,92,246,0.45) !important;
    color: #c4b5fd !important;
  }

  @media (max-width: 1100px) {
    .cpw-layout { grid-template-columns: 1fr !important; }
    .cpw-summary-col { position: static !important; }
  }
  @media (max-width: 640px) {
    .cpw-layout { padding: 20px 16px 60px !important; }
  }
`
