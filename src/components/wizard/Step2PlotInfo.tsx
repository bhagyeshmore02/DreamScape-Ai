import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ProjectData } from '../../pages/CreateProjectPage'
import { WizardButtons } from './WizardButtons'

interface Props {
  data: ProjectData
  update: <K extends keyof ProjectData>(key: K, value: ProjectData[K]) => void
  onNext: () => void
  onPrev: () => void
}

const UNITS = [
  { id: 'feet',   label: 'Feet',   icon: '🇺🇸' },
  { id: 'meters', label: 'Meters', icon: '🌍' },
]

const SHAPES = [
  { id: 'Rectangle',   icon: '▬', desc: 'Standard rectangular plot' },
  { id: 'Square',      icon: '⬛', desc: 'Equal width & length' },
  { id: 'Corner Plot', icon: '📐', desc: 'L-shaped corner site' },
  { id: 'Irregular',   icon: '🔷', desc: 'Non-standard boundaries' },
]

export function Step2PlotInfo({ data, update, onNext, onPrev }: Props) {
  const [showError, setShowError] = useState(false)

  const handleNext = () => {
    if (!data.plotWidth.trim() || !data.plotLength.trim()) {
      setShowError(true)
      return
    }
    setShowError(false)
    onNext()
  }

  return (
    <div style={S.wrap}>
      {/* Dimensions row */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <label style={S.groupLabel}>Plot Dimensions</label>
        <p style={S.groupHint}>Enter your plot measurements</p>
        <div style={S.dimRow}>
          <div style={S.dimField}>
            <label style={S.label}>Width</label>
            <div style={S.inputWrap}>
              <input
                id="plot-width"
                type="number"
                min="0"
                style={S.input}
                className="cpw-input"
                placeholder="e.g. 40"
                value={data.plotWidth}
                onChange={e => update('plotWidth', e.target.value)}
              />
              <span style={S.inputUnit}>{data.plotUnit}</span>
            </div>
          </div>
          <div style={S.dimMultiply}>×</div>
          <div style={S.dimField}>
            <label style={S.label}>Length</label>
            <div style={S.inputWrap}>
              <input
                id="plot-length"
                type="number"
                min="0"
                style={S.input}
                className="cpw-input"
                placeholder="e.g. 60"
                value={data.plotLength}
                onChange={e => update('plotLength', e.target.value)}
              />
              <span style={S.inputUnit}>{data.plotUnit}</span>
            </div>
          </div>
        </div>

        {/* Calculated area */}
        {data.plotWidth && data.plotLength && (
          <motion.div
            style={S.areaDisplay}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span style={{ fontSize: '14px' }}>📐</span>
            <span style={S.areaText}>
              Total Area:{' '}
              <strong style={{ color: '#a78bfa' }}>
                {(parseFloat(data.plotWidth) * parseFloat(data.plotLength)).toLocaleString()} {data.plotUnit}²
              </strong>
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Units */}
      <motion.div style={S.field} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <label style={S.groupLabel}>Measurement Unit</label>
        <div style={S.unitRow}>
          {UNITS.map(u => {
            const sel = data.plotUnit === u.id
            return (
              <motion.button
                key={u.id}
                id={`unit-${u.id}`}
                style={{ ...S.unitBtn, ...(sel ? S.unitBtnSel : {}) }}
                className={`cpw-unit-btn${sel ? ' selected' : ''}`}
                onClick={() => update('plotUnit', u.id as 'feet' | 'meters')}
                whileTap={{ scale: 0.97 }}
              >
                <span style={{ fontSize: '20px' }}>{u.icon}</span>
                <span style={{ ...S.unitLabel, ...(sel ? { color: '#a78bfa' } : {}) }}>{u.label}</span>
                {sel && <div style={S.unitCheck}>✓</div>}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Plot Shape */}
      <motion.div style={S.field} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <label style={S.groupLabel}>Plot Shape</label>
        <div style={S.shapesGrid}>
          {SHAPES.map((shape, i) => {
            const sel = data.plotShape === shape.id
            return (
              <motion.button
                key={shape.id}
                id={`shape-${shape.id.toLowerCase().replace(' ', '-')}`}
                style={{ ...S.shapeCard, ...(sel ? S.shapeCardSel : {}) }}
                className={`cpw-shape-card${sel ? ' selected' : ''}`}
                onClick={() => update('plotShape', sel ? '' : shape.id)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
              >
                {sel && (
                  <div style={S.shapeGlow} />
                )}
                <span style={S.shapeIcon}>{shape.icon}</span>
                <span style={{ ...S.shapeLabel, ...(sel ? { color: '#a78bfa' } : {}) }}>{shape.id}</span>
                <span style={S.shapeDesc}>{shape.desc}</span>
                {sel && (
                  <motion.div style={S.shapeCheck} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                    ✓
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      <AnimatePresence>
        {showError && (
          <motion.div
            style={S.errorBanner}
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span>⚠️</span>
            <span style={S.errorText}>Please enter both plot width and length to continue.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <WizardButtons onNext={handleNext} onPrev={onPrev} showPrev />
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '28px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  groupLabel: { fontSize: '14px', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '4px' },
  groupHint: { fontSize: '12px', color: '#475569', marginBottom: '12px' },
  label: { fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', display: 'block' },
  dimRow: { display: 'flex', alignItems: 'flex-end', gap: '12px' },
  dimMultiply: {
    fontSize: '20px', color: '#475569', fontWeight: 700,
    paddingBottom: '14px', flexShrink: 0,
  },
  dimField: { flex: 1, display: 'flex', flexDirection: 'column' },
  inputWrap: { position: 'relative' },
  input: {
    width: '100%', padding: '14px 50px 14px 18px',
    background: 'rgba(15,21,33,0.8)',
    border: '1.5px solid rgba(139,92,246,0.2)',
    borderRadius: '14px', color: '#f1f5f9',
    fontSize: '15px', fontFamily: "'Space Grotesk', sans-serif",
    outline: 'none', transition: 'all 0.2s',
    boxSizing: 'border-box',
  },
  inputUnit: {
    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
    fontSize: '12px', color: '#475569', fontWeight: 500,
  },
  areaDisplay: {
    marginTop: '12px',
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 16px',
    background: 'rgba(139,92,246,0.08)',
    border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: '12px',
  },
  areaText: { fontSize: '13px', color: '#94a3b8' },
  unitRow: { display: 'flex', gap: '12px' },
  unitBtn: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '6px', padding: '16px',
    background: 'rgba(15,21,33,0.8)',
    border: '1.5px solid rgba(139,92,246,0.15)',
    borderRadius: '14px', cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: "'Space Grotesk', sans-serif",
    position: 'relative',
  },
  unitBtnSel: {
    background: 'rgba(139,92,246,0.12)',
    border: '1.5px solid rgba(139,92,246,0.45)',
    boxShadow: '0 0 20px rgba(139,92,246,0.18)',
  },
  unitLabel: { fontSize: '13px', fontWeight: 700, color: '#e2e8f0', transition: 'color 0.2s' },
  unitCheck: {
    position: 'absolute', top: '8px', right: '8px',
    width: '18px', height: '18px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '10px', color: '#fff', fontWeight: 700,
  },
  shapesGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px',
  },
  shapeCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '6px', padding: '20px 12px',
    background: 'rgba(15,21,33,0.8)',
    border: '1.5px solid rgba(139,92,246,0.15)',
    borderRadius: '16px', cursor: 'pointer',
    transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  shapeCardSel: {
    background: 'rgba(139,92,246,0.12)',
    border: '1.5px solid rgba(139,92,246,0.5)',
    boxShadow: '0 0 24px rgba(139,92,246,0.2)',
  },
  shapeGlow: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(circle at 50% 20%, rgba(139,92,246,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  shapeIcon: { fontSize: '28px', lineHeight: 1 },
  shapeLabel: { fontSize: '13px', fontWeight: 700, color: '#e2e8f0', transition: 'color 0.2s' },
  shapeDesc: { fontSize: '11px', color: '#475569', textAlign: 'center' },
  shapeCheck: {
    position: 'absolute', top: '8px', right: '8px',
    width: '18px', height: '18px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '10px', color: '#fff', fontWeight: 700,
  },
  errorBanner: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 14px', overflow: 'hidden',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '10px',
  },
  errorText: { fontSize: '12px', color: '#f87171', fontWeight: 500 },
}

