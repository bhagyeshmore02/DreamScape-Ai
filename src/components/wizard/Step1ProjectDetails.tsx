import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ProjectData } from '../../pages/CreateProjectPage'
import { WizardButtons } from './WizardButtons'

interface Props {
  data: ProjectData
  update: <K extends keyof ProjectData>(key: K, value: ProjectData[K]) => void
  onNext: () => void
}

const HOUSE_STYLES = [
  { id: 'Modern',       emoji: '🏙', desc: 'Clean lines, glass & steel',         color: '#06b6d4', glow: 'rgba(6,182,212,0.25)'   },
  { id: 'Luxury',       emoji: '🏛', desc: 'Opulent finishes & grandeur',         color: '#f59e0b', glow: 'rgba(245,158,11,0.25)'  },
  { id: 'Minimalist',   emoji: '⬜', desc: 'Less is more philosophy',             color: '#94a3b8', glow: 'rgba(148,163,184,0.25)' },
  { id: 'Traditional',  emoji: '🏡', desc: 'Classic architectural elements',      color: '#10b981', glow: 'rgba(16,185,129,0.25)'  },
  { id: 'Contemporary', emoji: '🏗', desc: 'Current trends & innovation',         color: '#8b5cf6', glow: 'rgba(139,92,246,0.25)'  },
  { id: 'Scandinavian', emoji: '🌿', desc: 'Warm, functional simplicity',         color: '#34d399', glow: 'rgba(52,211,153,0.25)'  },
  { id: 'Industrial',   emoji: '🔩', desc: 'Raw materials & urban edge',          color: '#fb923c', glow: 'rgba(251,146,60,0.25)'  },
]

export function Step1ProjectDetails({ data, update, onNext }: Props) {
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const nameError = touched.projectName && !data.projectName.trim()
    ? 'Project name is required to continue'
    : ''

  const handleNext = () => {
    setTouched({ projectName: true })
    if (!data.projectName.trim()) return
    onNext()
  }

  return (
    <div style={S.wrap}>
      {/* ── Project Name ── */}
      <motion.div style={S.field} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <label style={S.label} htmlFor="project-name">
          Project Name <span style={S.required}>*</span>
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="project-name"
            style={{ ...S.input, ...(nameError ? S.inputError : {}) }}
            className="cpw-input"
            placeholder="e.g. My Dream Villa"
            value={data.projectName}
            onChange={e => update('projectName', e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, projectName: true }))}
            maxLength={60}
            autoFocus
          />
          <AnimatePresence>
            {data.projectName && (
              <motion.span
                style={{
                  ...S.charCount,
                  color: data.projectName.length > 50 ? '#f59e0b' : '#475569',
                }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                {data.projectName.length}/60
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {nameError && (
            <motion.div
              style={S.errorBanner}
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span style={{ fontSize: '13px' }}>⚠️</span>
              <span style={S.errorText}>{nameError}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Description ── */}
      <motion.div style={S.field} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <label style={S.label} htmlFor="project-description">
          Project Description <span style={S.optional}>(optional)</span>
        </label>
        <textarea
          id="project-description"
          style={S.textarea}
          className="cpw-input"
          placeholder="Briefly describe your dream home vision…"
          value={data.description}
          onChange={e => update('description', e.target.value)}
          rows={3}
          maxLength={300}
        />
      </motion.div>

      {/* ── House Style ── */}
      <motion.div style={S.field} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <label style={S.label}>House Style</label>
        <p style={S.fieldHint}>Choose the architectural style that speaks to you</p>
        <div style={S.stylesGrid}>
          {HOUSE_STYLES.map((style, i) => {
            const selected = data.houseStyle === style.id
            return (
              <motion.button
                key={style.id}
                id={`style-${style.id.toLowerCase()}`}
                style={{
                  ...S.styleCard,
                  ...(selected ? {
                    background: style.glow.replace('0.25', '0.12'),
                    border: `1.5px solid ${style.color}60`,
                    boxShadow: `0 0 24px ${style.glow}`,
                  } : {}),
                }}
                className={`cpw-style-card ${selected ? 'selected' : ''}`}
                onClick={() => update('houseStyle', selected ? '' : style.id)}
                /* Enhanced animation on selection */
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.96 }}
                initial={{ opacity: 0, y: 14, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.055, type: 'spring', stiffness: 220, damping: 18 }}
              >
                {/* Background glow on selection */}
                <AnimatePresence>
                  {selected && (
                    <motion.div
                      style={{
                        ...S.selectedGlow,
                        background: `radial-gradient(circle at 50% 10%, ${style.glow} 0%, transparent 70%)`,
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.25 }}
                    />
                  )}
                </AnimatePresence>

                {/* Emoji with bounce on selection */}
                <motion.span
                  style={S.styleEmoji}
                  animate={selected ? { scale: [1, 1.3, 1], rotate: [0, -8, 8, 0] } : {}}
                  transition={{ duration: 0.4, type: 'spring' }}
                >
                  {style.emoji}
                </motion.span>

                <span style={{ ...S.styleLabel, ...(selected ? { color: style.color } : {}) }}>
                  {style.id}
                </span>
                <span style={S.styleDesc}>{style.desc}</span>

                {/* Checkmark badge */}
                <AnimatePresence>
                  {selected && (
                    <motion.div
                      style={{ ...S.checkmark, background: style.color }}
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 30 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 16 }}
                    >
                      ✓
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </div>

        {/* Selected style confirmation */}
        <AnimatePresence>
          {data.houseStyle && (
            <motion.div
              style={S.styleConfirm}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <span style={{ fontSize: '14px' }}>
                {HOUSE_STYLES.find(s => s.id === data.houseStyle)?.emoji}
              </span>
              <span style={S.styleConfirmText}>
                <strong style={{ color: '#a78bfa' }}>{data.houseStyle}</strong> style selected
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <WizardButtons onNext={handleNext} showPrev={false} onPrev={() => {}} />
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '28px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: 600, color: '#cbd5e1', letterSpacing: '0.2px' },
  required: { color: '#8b5cf6' },
  optional: { fontSize: '12px', color: '#475569', fontWeight: 400 },
  fieldHint: { fontSize: '12px', color: '#475569', marginTop: '-4px' },
  input: {
    width: '100%', padding: '14px 18px',
    background: 'rgba(15,21,33,0.8)',
    border: '1.5px solid rgba(139,92,246,0.2)',
    borderRadius: '14px', color: '#f1f5f9',
    fontSize: '15px', fontFamily: "'Space Grotesk', sans-serif",
    outline: 'none', transition: 'all 0.2s',
    boxSizing: 'border-box',
  },
  inputError: {
    border: '1.5px solid rgba(239,68,68,0.55)',
    boxShadow: '0 0 0 3px rgba(239,68,68,0.08)',
  },
  textarea: {
    width: '100%', padding: '14px 18px',
    background: 'rgba(15,21,33,0.8)',
    border: '1.5px solid rgba(139,92,246,0.2)',
    borderRadius: '14px', color: '#f1f5f9',
    fontSize: '15px', fontFamily: "'Space Grotesk', sans-serif",
    outline: 'none', transition: 'all 0.2s',
    resize: 'vertical', lineHeight: 1.6,
    boxSizing: 'border-box',
  },
  charCount: {
    position: 'absolute', right: '14px', bottom: '14px',
    fontSize: '11px', transition: 'color 0.2s',
  },
  errorBanner: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 14px', overflow: 'hidden',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '10px',
  },
  errorText: { fontSize: '12px', color: '#f87171', fontWeight: 500 },
  stylesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(138px, 1fr))',
    gap: '12px',
  },
  styleCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '6px', padding: '18px 12px',
    background: 'rgba(15,21,33,0.8)',
    border: '1.5px solid rgba(139,92,246,0.15)',
    borderRadius: '16px', cursor: 'pointer',
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
    position: 'relative', overflow: 'hidden',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  selectedGlow: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  styleEmoji: { fontSize: '28px', lineHeight: 1, display: 'block' },
  styleLabel: {
    fontSize: '13px', fontWeight: 700, color: '#e2e8f0', transition: 'color 0.2s',
  },
  styleDesc: { fontSize: '10px', color: '#475569', textAlign: 'center', lineHeight: 1.4 },
  checkmark: {
    position: 'absolute', top: '8px', right: '8px',
    width: '18px', height: '18px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '10px', color: '#fff', fontWeight: 700,
  },
  styleConfirm: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 14px',
    background: 'rgba(139,92,246,0.07)',
    border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: '12px', marginTop: '4px',
  },
  styleConfirmText: { fontSize: '13px', color: '#94a3b8' },
}
