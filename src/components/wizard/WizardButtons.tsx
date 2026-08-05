import { motion } from 'framer-motion'

interface Props {
  onNext: () => void
  onPrev: () => void
  showPrev: boolean
  nextLabel?: string
  nextDisabled?: boolean
}

export function WizardButtons({ onNext, onPrev, showPrev, nextLabel = 'Next →', nextDisabled }: Props) {
  return (
    <div style={S.wrap}>
      {showPrev && (
        <motion.button
          style={S.prevBtn}
          className="cpw-prev-btn"
          onClick={onPrev}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          ← Previous
        </motion.button>
      )}
      <motion.button
        style={{ ...S.nextBtn, ...(nextDisabled ? S.nextBtnDisabled : {}) }}
        className="cpw-next-btn"
        onClick={onNext}
        disabled={nextDisabled}
        whileHover={nextDisabled ? {} : { scale: 1.02, y: -1 }}
        whileTap={nextDisabled ? {} : { scale: 0.97 }}
      >
        {nextLabel}
      </motion.button>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex', gap: '12px', alignItems: 'center',
    paddingTop: '12px',
  },
  prevBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '13px 22px',
    background: 'rgba(139,92,246,0.08)',
    border: '1.5px solid rgba(139,92,246,0.2)',
    borderRadius: '14px', color: '#94a3b8',
    fontSize: '14px', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif",
    flexShrink: 0,
  },
  nextBtn: {
    flex: 1, padding: '14px 32px',
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    border: 'none', borderRadius: '14px', color: '#fff',
    fontSize: '15px', fontWeight: 700, cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif",
    boxShadow: '0 0 24px rgba(139,92,246,0.4)',
    transition: 'all 0.2s',
  },
  nextBtnDisabled: {
    opacity: 0.5, cursor: 'not-allowed', boxShadow: 'none',
  },
}
