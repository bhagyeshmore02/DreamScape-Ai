import { motion, AnimatePresence } from 'framer-motion'
import type { ProjectData } from '../../pages/CreateProjectPage'
import { overallCompletion } from '../../pages/CreateProjectPage'
import { estimateBudget, getRecommendations } from '../../utils/budgetEstimator'

interface Props {
  data: ProjectData
  currentStep: number
}

const CURRENCY = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
function fmt(n: number) { return CURRENCY.format(n) }

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={S.row}>
      <span style={S.rowLabel}>{label}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          style={{ ...S.rowValue, ...(color ? { color } : {}) }}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.18 }}
        >
          {value || <span style={S.empty}>—</span>}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

export function LiveSummaryPanel({ data, currentStep }: Props) {
  const plotLabel = data.plotWidth && data.plotLength
    ? `${data.plotWidth} × ${data.plotLength} ${data.plotUnit}`
    : ''

  const roomList = [
    data.bedroomCount > 0 ? `${data.bedroomCount} Beds` : '',
    data.bathroomCount > 0 ? `${data.bathroomCount} Baths` : '',
    ...data.rooms.filter(r => !['bedroom', 'bathroom'].includes(r)),
  ].filter(Boolean)

  const featureTags = data.features.length > 0 ? data.features : []

  // ── Completion (driven by CreateProjectPage's logic) ──
  const completionPct = overallCompletion(data)

  // ── Dynamic budget estimate ──
  const estimate = estimateBudget(data)

  // ── AI recommendations ──
  const recommendations = getRecommendations(data)

  const confidenceColor = { low: '#f59e0b', medium: '#06b6d4', high: '#10b981' }[estimate.confidence]

  return (
    <motion.div
      style={S.panel}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <style>{PANEL_CSS}</style>

      {/* ── Header ── */}
      <div style={S.panelHeader}>
        <div style={S.panelHeaderLeft}>
          <div style={S.headerIcon}>📋</div>
          <div>
            <p style={S.panelTitle}>Live Summary</p>
            <p style={S.panelSub}>Updates as you fill in details</p>
          </div>
        </div>
        {/* Completion ring */}
        <div style={S.ringWrap}>
          <svg width="52" height="52" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="3" />
            <motion.circle
              cx="26" cy="26" r="22" fill="none"
              stroke="url(#ring-grad)" strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 22}`}
              strokeDashoffset={2 * Math.PI * 22 * (1 - completionPct / 100)}
              transform="rotate(-90 26 26)"
              animate={{ strokeDashoffset: 2 * Math.PI * 22 * (1 - completionPct / 100) }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <motion.span
            style={S.ringPct}
            key={completionPct}
            animate={{ scale: [1.1, 1] }}
            transition={{ duration: 0.2 }}
          >
            {completionPct}%
          </motion.span>
        </div>
      </div>

      <div style={S.divider} />

      {/* ── Project Info ── */}
      <div style={S.section}>
        <p style={S.sectionLabel}>PROJECT INFO</p>
        <Row label="Name"  value={data.projectName} color="#a78bfa" />
        <Row label="Style" value={data.houseStyle} />
      </div>

      <div style={S.divider} />

      {/* ── Plot ── */}
      <div style={S.section}>
        <p style={S.sectionLabel}>PLOT</p>
        <Row label="Size"  value={plotLabel} />
        <Row label="Shape" value={data.plotShape} />
      </div>

      <div style={S.divider} />

      {/* ── Rooms ── */}
      <div style={S.section}>
        <p style={S.sectionLabel}>ROOMS</p>
        <div style={S.tagWrap}>
          <AnimatePresence>
            {roomList.length > 0 ? (
              roomList.map(r => (
                <motion.span
                  key={r}
                  style={S.tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.18 }}
                >
                  {r}
                </motion.span>
              ))
            ) : (
              <span style={S.empty}>Not selected</span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div style={S.divider} />

      {/* ── Budget ── */}
      <div style={S.section}>
        <p style={S.sectionLabel}>BUDGET</p>
        <Row label="Set Budget" value={fmt(data.budget)} color="#f59e0b" />
        {data.constructionPriority && (
          <Row label="Priority" value={data.constructionPriority} />
        )}
      </div>

      {/* ── Features ── */}
      {featureTags.length > 0 && (
        <>
          <div style={S.divider} />
          <div style={S.section}>
            <p style={S.sectionLabel}>FEATURES</p>
            <div style={S.tagWrap}>
              <AnimatePresence>
                {featureTags.map(f => (
                  <motion.span
                    key={f}
                    style={{ ...S.tag, ...S.tagFeature }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.18 }}
                  >
                    {f}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}

      <div style={S.divider} />

      {/* ── Dynamic Budget Estimate ── */}
      <motion.div
        style={S.estimateCard}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div style={S.estimateHeader}>
          <span style={{ fontSize: '14px' }}>🏗</span>
          <p style={S.estimateTitle}>Construction Estimate</p>
          <span style={{ ...S.confidenceBadge, background: `${confidenceColor}20`, color: confidenceColor, border: `1px solid ${confidenceColor}40` }}>
            {estimate.confidence}
          </span>
        </div>
        <div style={S.estimateRange}>
          <div style={S.estimateRangeItem}>
            <span style={S.rangeLabel}>Low</span>
            <motion.span style={{ ...S.rangeValue, color: '#10b981' }} key={estimate.low} animate={{ scale: [1.05, 1] }} transition={{ duration: 0.2 }}>
              {fmt(estimate.low)}
            </motion.span>
          </div>
          <div style={S.estimateRangeMid}>
            <span style={S.rangeLabel}>Recommended</span>
            <motion.span style={S.rangeMidValue} key={estimate.mid} animate={{ scale: [1.05, 1] }} transition={{ duration: 0.2 }}>
              {fmt(estimate.mid)}
            </motion.span>
          </div>
          <div style={S.estimateRangeItem}>
            <span style={S.rangeLabel}>High</span>
            <motion.span style={{ ...S.rangeValue, color: '#f59e0b' }} key={estimate.high} animate={{ scale: [1.05, 1] }} transition={{ duration: 0.2 }}>
              {fmt(estimate.high)}
            </motion.span>
          </div>
        </div>
        {estimate.area > 0 && (
          <p style={S.estimateSub}>
            ~{estimate.area.toLocaleString()} sqft · ${estimate.perSqft}/sqft base rate
          </p>
        )}
      </motion.div>

      <div style={S.divider} />

      {/* ── AI Recommendations ── */}
      <div style={S.aiCard}>
        <div style={S.aiCardHeader}>
          <div style={S.aiIcon}>✦</div>
          <p style={S.aiTitle}>AI Recommendations</p>
        </div>
        <AnimatePresence mode="popLayout">
          {recommendations.map((rec, i) => (
            <motion.div
              key={rec.text}
              style={S.aiTip}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              layout
            >
              <span style={S.aiTipIcon}>{rec.icon}</span>
              <p style={S.aiTipText}>{rec.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── CTA hint on step 5 ── */}
      {currentStep === 5 && (
        <motion.div
          style={S.ctaHint}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span style={{ fontSize: '16px' }}>✨</span>
          <p style={S.ctaText}>Ready to generate your dream home!</p>
        </motion.div>
      )}
    </motion.div>
  )
}

const S: Record<string, React.CSSProperties> = {
  panel: {
    background: 'rgba(12,16,28,0.92)',
    backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: '24px', padding: '24px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.05)',
  },
  panelHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '20px',
  },
  panelHeaderLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  headerIcon: {
    width: '40px', height: '40px', borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.1))',
    border: '1px solid rgba(139,92,246,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', flexShrink: 0,
  },
  panelTitle: {
    fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '16px',
    color: '#f1f5f9', marginBottom: '2px',
  },
  panelSub: { fontSize: '11px', color: '#475569' },
  ringWrap: {
    position: 'relative', width: '52px', height: '52px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  ringPct: {
    position: 'absolute', fontSize: '11px', fontWeight: 700,
    color: '#a78bfa', lineHeight: 1,
  },
  divider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.15), transparent)',
    margin: '14px 0',
  },
  section: { marginBottom: '4px' },
  sectionLabel: {
    fontSize: '10px', fontWeight: 700, color: '#475569',
    letterSpacing: '1.5px', marginBottom: '10px',
  },
  row: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '8px',
  },
  rowLabel: { fontSize: '12px', color: '#64748b', fontWeight: 500 },
  rowValue: { fontSize: '13px', fontWeight: 600, color: '#cbd5e1', textAlign: 'right', maxWidth: '55%', wordBreak: 'break-word' },
  tagWrap: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  tag: {
    fontSize: '11px', fontWeight: 600,
    padding: '4px 10px', borderRadius: '20px',
    background: 'rgba(139,92,246,0.12)',
    border: '1px solid rgba(139,92,246,0.25)',
    color: '#a78bfa',
  },
  tagFeature: {
    background: 'rgba(6,182,212,0.1)',
    border: '1px solid rgba(6,182,212,0.25)',
    color: '#67e8f9',
  },
  empty: { color: '#334155', fontStyle: 'italic', fontSize: '12px' },

  // ── Estimate card ──
  estimateCard: {
    background: 'linear-gradient(135deg, rgba(245,158,11,0.07), rgba(139,92,246,0.06))',
    border: '1px solid rgba(245,158,11,0.18)',
    borderRadius: '16px', padding: '14px',
  },
  estimateHeader: {
    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px',
  },
  estimateTitle: {
    fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '13px',
    color: '#f1f5f9', flex: 1,
  },
  confidenceBadge: {
    fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
    letterSpacing: '0.5px', textTransform: 'capitalize',
  },
  estimateRange: {
    display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr',
    gap: '8px', textAlign: 'center',
  },
  estimateRangeItem: { display: 'flex', flexDirection: 'column', gap: '3px' },
  estimateRangeMid: {
    display: 'flex', flexDirection: 'column', gap: '3px',
    background: 'rgba(139,92,246,0.08)', borderRadius: '10px', padding: '6px 4px',
  },
  rangeLabel: { fontSize: '10px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
  rangeValue: { fontSize: '12px', fontWeight: 700 },
  rangeMidValue: {
    fontSize: '13px', fontWeight: 800,
    background: 'linear-gradient(135deg, #a78bfa, #67e8f9)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  estimateSub: {
    fontSize: '10px', color: '#475569', marginTop: '10px', textAlign: 'center',
  },

  // ── AI card ──
  aiCard: {
    background: 'linear-gradient(135deg, rgba(139,92,246,0.07), rgba(6,182,212,0.05))',
    border: '1px solid rgba(139,92,246,0.18)',
    borderRadius: '16px', padding: '14px',
  },
  aiCardHeader: {
    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px',
  },
  aiIcon: {
    width: '28px', height: '28px', borderRadius: '8px',
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', color: '#fff', fontWeight: 700, flexShrink: 0,
  },
  aiTitle: {
    fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '13px', color: '#f1f5f9',
  },
  aiTip: {
    display: 'flex', alignItems: 'flex-start', gap: '8px',
    padding: '8px 0',
    borderBottom: '1px solid rgba(139,92,246,0.08)',
  },
  aiTipIcon: { fontSize: '14px', flexShrink: 0, marginTop: '1px' },
  aiTipText: {
    fontSize: '12px', color: '#94a3b8', lineHeight: 1.5,
  },

  ctaHint: {
    marginTop: '14px',
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.08))',
    border: '1px solid rgba(139,92,246,0.25)',
    borderRadius: '14px', padding: '14px',
  },
  ctaText: {
    fontSize: '13px', fontWeight: 600,
    background: 'linear-gradient(135deg, #a78bfa, #67e8f9)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
}

const PANEL_CSS = `
  .lsp-ai-tip:last-child { border-bottom: none !important; }
`
