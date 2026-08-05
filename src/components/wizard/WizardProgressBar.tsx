import { motion } from 'framer-motion'

interface Step { id: number; label: string; icon: string }

interface Props {
  step: number
  steps: Step[]
  completionPct: number   // 0-100 overall completion passed from parent
}

export function WizardProgressBar({ step, steps, completionPct }: Props) {
  return (
    <div style={S.wrap}>
      {/* ── Completion label ── */}
      <div style={S.topRow}>
        <span style={S.overallLabel}>Overall Progress</span>
        <motion.span
          key={completionPct}
          style={S.overallPct}
          animate={{ scale: [1.08, 1] }}
          transition={{ duration: 0.25 }}
        >
          {completionPct}%
        </motion.span>
      </div>

      {/* Connector line underneath the dots */}
      <div style={S.track}>
        <motion.div
          style={S.fill}
          animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>

      {/* Step dots */}
      <div style={S.dots}>
        {steps.map(s => {
          const done    = s.id < step
          const active  = s.id === step
          const pending = s.id > step
          return (
            <div key={s.id} style={S.dotWrap}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Pulse ring for active step */}
                {active && (
                  <motion.div
                    style={S.pulse}
                    animate={{ scale: [1, 1.7, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <motion.div
                  style={{
                    ...S.dot,
                    ...(done    ? S.dotDone    : {}),
                    ...(active  ? S.dotActive  : {}),
                    ...(pending ? S.dotPending : {}),
                  }}
                  animate={done ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {done ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <span style={{ fontSize: active ? '14px' : '12px' }}>{s.icon}</span>
                  )}
                </motion.div>
              </div>
              <span style={{
                ...S.label,
                ...(active  ? S.labelActive  : {}),
                ...(done    ? S.labelDone    : {}),
                ...(pending ? S.labelPending : {}),
              }}>
                {s.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  wrap: {
    position: 'relative', marginBottom: '36px', paddingTop: '4px',
  },
  topRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '14px',
  },
  overallLabel: {
    fontSize: '11px', fontWeight: 600, color: '#475569', letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  overallPct: {
    fontSize: '13px', fontWeight: 700,
    background: 'linear-gradient(135deg, #a78bfa, #67e8f9)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  track: {
    position: 'absolute',
    top: '58px',
    left: '24px',
    right: '24px',
    height: '2px',
    background: 'rgba(139,92,246,0.12)',
    borderRadius: '2px',
    zIndex: 0,
  },
  fill: {
    height: '100%',
    background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
    borderRadius: '2px',
  },
  dots: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1,
  },
  dotWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
    flex: 1,
  },
  dot: {
    width: '48px', height: '48px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', zIndex: 2, transition: 'all 0.3s ease',
  },
  dotDone: {
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    boxShadow: '0 0 20px rgba(139,92,246,0.5)',
    border: '2px solid transparent',
  },
  dotActive: {
    background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.1))',
    border: '2px solid #8b5cf6',
    boxShadow: '0 0 24px rgba(139,92,246,0.4), inset 0 0 16px rgba(139,92,246,0.1)',
  },
  dotPending: {
    background: 'rgba(15,21,33,0.8)',
    border: '2px solid rgba(139,92,246,0.2)',
  },
  pulse: {
    position: 'absolute',
    width: '48px', height: '48px', borderRadius: '50%',
    border: '2px solid rgba(139,92,246,0.6)',
    zIndex: 1,
  },
  label: {
    fontSize: '11px', fontWeight: 500,
    textAlign: 'center', lineHeight: 1.3,
    maxWidth: '80px',
  },
  labelActive:  { color: '#a78bfa', fontWeight: 700 },
  labelDone:    { color: '#67e8f9' },
  labelPending: { color: '#475569' },
}
