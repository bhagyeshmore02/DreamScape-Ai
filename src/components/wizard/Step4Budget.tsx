import { motion } from 'framer-motion'
import type { ProjectData } from '../../pages/CreateProjectPage'
import { WizardButtons } from './WizardButtons'

interface Props {
  data: ProjectData
  update: <K extends keyof ProjectData>(key: K, value: ProjectData[K]) => void
  onNext: () => void
  onPrev: () => void
}

const PRIORITIES = [
  { id: 'Budget Friendly', icon: '💰', desc: 'Cost-effective construction',        color: '#10b981', glow: 'rgba(16,185,129,0.25)' },
  { id: 'Luxury',          icon: '👑', desc: 'Premium materials & finishes',        color: '#f59e0b', glow: 'rgba(245,158,11,0.25)'  },
  { id: 'Energy Efficient',icon: '⚡', desc: 'Low energy footprint design',         color: '#06b6d4', glow: 'rgba(6,182,212,0.25)'   },
]

const FEATURES = [
  { id: 'Eco Friendly',      icon: '🌿', color: '#10b981', glow: 'rgba(16,185,129,0.2)'  },
  { id: 'Vastu Compliant',   icon: '🧭', color: '#f59e0b', glow: 'rgba(245,158,11,0.2)'  },
  { id: 'Smart Home Ready',  icon: '🤖', color: '#8b5cf6', glow: 'rgba(139,92,246,0.2)'  },
]

const BUDGET_MARKS = [
  { value: 100000,   label: '$100K' },
  { value: 500000,   label: '$500K' },
  { value: 1000000,  label: '$1M'   },
  { value: 2000000,  label: '$2M'   },
  { value: 5000000,  label: '$5M+'  },
]

function formatBudget(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

export function Step4Budget({ data, update, onNext, onPrev }: Props) {
  const min = 50_000
  const max = 5_000_000
  const pct = ((data.budget - min) / (max - min)) * 100

  const toggleFeature = (id: string) => {
    const features = data.features.includes(id)
      ? data.features.filter(f => f !== id)
      : [...data.features, id]
    update('features', features)
  }

  return (
    <div style={S.wrap}>

      {/* ── Budget Slider ── */}
      <motion.div style={S.sliderSection} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div style={S.sliderHeader}>
          <label style={S.groupLabel}>Estimated Budget</label>
          <motion.div
            style={S.budgetBadge}
            key={data.budget}
            animate={{ scale: [1.05, 1] }}
            transition={{ duration: 0.15 }}
          >
            {formatBudget(data.budget)}
          </motion.div>
        </div>

        {/* Custom slider */}
        <div style={S.sliderWrap}>
          <div style={S.sliderTrack}>
            <motion.div
              style={{ ...S.sliderFill, width: `${pct}%` }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.1 }}
            />
            {/* Thumb */}
            <motion.div
              style={{ ...S.thumb, left: `calc(${pct}% - 14px)` }}
              animate={{ left: `calc(${pct}% - 14px)` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <input
            id="budget-slider"
            type="range"
            min={min}
            max={max}
            step={25000}
            value={data.budget}
            onChange={e => update('budget', parseInt(e.target.value))}
            style={S.sliderInput}
            className="cpw-range"
          />
        </div>

        {/* Marks */}
        <div style={S.marksRow}>
          {BUDGET_MARKS.map(m => (
            <button
              key={m.value}
              style={{
                ...S.markBtn,
                ...(Math.abs(data.budget - m.value) < 50000 ? S.markBtnActive : {}),
              }}
              onClick={() => update('budget', m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Budget hint */}
        <div style={S.budgetHint}>
          <span style={{ fontSize: '13px' }}>ℹ️</span>
          <span style={S.budgetHintText}>
            {data.budget < 300_000
              ? 'Suitable for a compact home with smart space planning'
              : data.budget < 800_000
              ? 'Great for a comfortable 3–4 bedroom family home'
              : data.budget < 2_000_000
              ? 'Ideal for a premium villa with luxury finishes'
              : 'Ultra-luxury — the sky is your limit!'}
          </span>
        </div>
      </motion.div>

      {/* ── Construction Priority ── */}
      <motion.div style={S.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <label style={S.groupLabel}>Construction Priority</label>
        <p style={S.groupHint}>What matters most in your build?</p>
        <div style={S.priorityGrid}>
          {PRIORITIES.map((p, i) => {
            const sel = data.constructionPriority === p.id
            return (
              <motion.button
                key={p.id}
                id={`priority-${p.id.toLowerCase().replace(/ /g, '-')}`}
                style={{ ...S.priorityCard, ...(sel ? { ...S.priorityCardSel, border: `1.5px solid ${p.color}60`, boxShadow: `0 0 24px ${p.glow}` } : {}) }}
                className={`cpw-priority-card${sel ? ' selected' : ''}`}
                onClick={() => update('constructionPriority', sel ? '' : p.id)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
              >
                {sel && (
                  <div style={{ ...S.priorityGlow, background: `radial-gradient(circle at 50% 0%, ${p.glow} 0%, transparent 70%)` }} />
                )}
                <span style={{ fontSize: '28px' }}>{p.icon}</span>
                <span style={{ ...S.priorityLabel, ...(sel ? { color: p.color } : {}) }}>{p.id}</span>
                <span style={S.priorityDesc}>{p.desc}</span>
                {sel && (
                  <motion.div
                    style={{ ...S.checkBadge, background: p.color }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >✓</motion.div>
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* ── Special Features ── */}
      <motion.div style={S.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <label style={S.groupLabel}>Special Features</label>
        <p style={S.groupHint}>Add-ons that matter to you</p>
        <div style={S.featuresRow}>
          {FEATURES.map((f, i) => {
            const sel = data.features.includes(f.id)
            return (
              <motion.button
                key={f.id}
                id={`feature-${f.id.toLowerCase().replace(/ /g, '-')}`}
                style={{
                  ...S.featureChip,
                  ...(sel
                    ? { background: f.glow, border: `1.5px solid ${f.color}60`, color: f.color, boxShadow: `0 0 16px ${f.glow}` }
                    : {}),
                }}
                className={`cpw-feature-chip${sel ? ' selected' : ''}`}
                onClick={() => toggleFeature(f.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.07 }}
              >
                <span style={{ fontSize: '18px' }}>{f.icon}</span>
                <span>{f.id}</span>
                {sel && <span style={{ fontSize: '12px' }}>✓</span>}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      <WizardButtons onNext={onNext} onPrev={onPrev} showPrev />
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '28px' },
  section: { display: 'flex', flexDirection: 'column', gap: '8px' },
  sliderSection: { display: 'flex', flexDirection: 'column', gap: '12px' },
  sliderHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  groupLabel: { fontSize: '14px', fontWeight: 600, color: '#cbd5e1' },
  groupHint: { fontSize: '12px', color: '#475569' },
  budgetBadge: {
    fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800,
    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  sliderWrap: {
    position: 'relative', height: '40px',
    display: 'flex', alignItems: 'center',
  },
  sliderTrack: {
    position: 'absolute', left: 0, right: 0, height: '6px',
    background: 'rgba(139,92,246,0.15)',
    borderRadius: '6px', overflow: 'visible',
  },
  sliderFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
    borderRadius: '6px',
    position: 'relative',
  },
  thumb: {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: '28px', height: '28px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #a78bfa, #67e8f9)',
    border: '3px solid #080b14',
    boxShadow: '0 0 16px rgba(139,92,246,0.6), 0 2px 8px rgba(0,0,0,0.4)',
    zIndex: 2, pointerEvents: 'none',
  },
  sliderInput: {
    position: 'absolute', left: 0, right: 0,
    width: '100%', opacity: 0, cursor: 'pointer',
    height: '40px', zIndex: 3,
  },
  marksRow: { display: 'flex', justifyContent: 'space-between', gap: '4px' },
  markBtn: {
    fontSize: '11px', fontWeight: 600, color: '#475569',
    background: 'transparent', border: 'none', cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif",
    padding: '4px 6px', borderRadius: '6px', transition: 'all 0.2s',
  },
  markBtnActive: { color: '#8b5cf6', background: 'rgba(139,92,246,0.1)' },
  budgetHint: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 14px',
    background: 'rgba(15,21,33,0.6)',
    border: '1px solid rgba(139,92,246,0.1)',
    borderRadius: '12px',
  },
  budgetHintText: { fontSize: '12px', color: '#64748b', lineHeight: 1.5 },
  priorityGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
  },
  priorityCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '6px', padding: '18px 12px',
    background: 'rgba(15,21,33,0.8)',
    border: '1.5px solid rgba(139,92,246,0.15)',
    borderRadius: '16px', cursor: 'pointer',
    transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  priorityCardSel: {
    background: 'rgba(15,21,33,0.9)',
  },
  priorityGlow: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
  },
  priorityLabel: { fontSize: '12px', fontWeight: 700, color: '#e2e8f0', transition: 'color 0.2s', textAlign: 'center' },
  priorityDesc: { fontSize: '10px', color: '#475569', textAlign: 'center', lineHeight: 1.4 },
  checkBadge: {
    position: 'absolute', top: '8px', right: '8px',
    width: '18px', height: '18px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '10px', color: '#fff', fontWeight: 700,
  },
  featuresRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  featureChip: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '10px 18px',
    background: 'rgba(15,21,33,0.8)',
    border: '1.5px solid rgba(139,92,246,0.15)',
    borderRadius: '30px', cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '13px', fontWeight: 600, color: '#94a3b8',
    transition: 'all 0.2s',
  },
}
