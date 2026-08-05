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

interface RoomDef {
  id: string
  label: string
  icon: string
  color: string
  glow: string
  countable?: boolean
}

const ROOMS: RoomDef[] = [
  { id: 'bedroom',     label: 'Bedroom',      icon: '🛏',  color: '#a78bfa', glow: 'rgba(139,92,246,0.25)', countable: true },
  { id: 'bathroom',    label: 'Bathroom',     icon: '🚿',  color: '#67e8f9', glow: 'rgba(6,182,212,0.25)',  countable: true },
  { id: 'livingroom',  label: 'Living Room',  icon: '🛋',  color: '#f59e0b', glow: 'rgba(245,158,11,0.25)' },
  { id: 'kitchen',     label: 'Kitchen',      icon: '👨‍🍳', color: '#f97316', glow: 'rgba(249,115,22,0.25)'  },
  { id: 'diningroom',  label: 'Dining Room',  icon: '🍽',  color: '#ec4899', glow: 'rgba(236,72,153,0.25)'  },
  { id: 'garage',      label: 'Garage',       icon: '🚗',  color: '#94a3b8', glow: 'rgba(148,163,184,0.25)' },
  { id: 'balcony',     label: 'Balcony',      icon: '🌅',  color: '#fbbf24', glow: 'rgba(251,191,36,0.25)'  },
  { id: 'garden',      label: 'Garden',       icon: '🌳',  color: '#10b981', glow: 'rgba(16,185,129,0.25)'  },
  { id: 'swimmingpool',label: 'Swimming Pool', icon: '🏊',  color: '#06b6d4', glow: 'rgba(6,182,212,0.25)'  },
  { id: 'homeoffice',  label: 'Home Office',  icon: '💼',  color: '#818cf8', glow: 'rgba(129,140,248,0.25)' },
  { id: 'prayerroom',  label: 'Prayer Room',  icon: '🕌',  color: '#c084fc', glow: 'rgba(192,132,252,0.25)' },
  { id: 'storeroom',   label: 'Store Room',   icon: '📦',  color: '#78716c', glow: 'rgba(120,113,108,0.25)' },
  { id: 'laundry',     label: 'Laundry',      icon: '🧺',  color: '#38bdf8', glow: 'rgba(56,189,248,0.25)'  },
  { id: 'terrace',     label: 'Terrace',      icon: '🌇',  color: '#fb923c', glow: 'rgba(251,146,60,0.25)'  },
]

function Counter({ value, min = 1, max = 10, onChange }: { value: number; min?: number; max?: number; onChange: (n: number) => void }) {
  return (
    <div style={S.counter}>
      <button
        style={{ ...S.counterBtn, ...(value <= min ? S.counterBtnDisabled : {}) }}
        onClick={e => { e.stopPropagation(); onChange(Math.max(min, value - 1)) }}
        disabled={value <= min}
      >−</button>
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          style={S.counterVal}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.15 }}
        >{value}</motion.span>
      </AnimatePresence>
      <button
        style={{ ...S.counterBtn, ...(value >= max ? S.counterBtnDisabled : {}) }}
        onClick={e => { e.stopPropagation(); onChange(Math.min(max, value + 1)) }}
        disabled={value >= max}
      >+</button>
    </div>
  )
}

export function Step3Rooms({ data, update, onNext, onPrev }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)

  const toggle = (id: string) => {
    const rooms = data.rooms.includes(id)
      ? data.rooms.filter(r => r !== id)
      : [...data.rooms, id]
    update('rooms', rooms)
  }

  return (
    <div style={S.wrap}>
      <motion.p style={S.hint} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
        Select rooms for your dream home. Bedrooms and bathrooms are always included — set the count below.
      </motion.p>

      <div style={S.grid}>
        {ROOMS.map((room, i) => {
          const isCountable = room.countable
          const count       = room.id === 'bedroom' ? data.bedroomCount : data.bathroomCount
          const selected    = isCountable ? true : data.rooms.includes(room.id)
          const isHov       = hovered === room.id

          return (
            <motion.div
              key={room.id}
              id={`room-${room.id}`}
              style={{
                ...S.card,
                ...(selected && !isCountable ? S.cardSelected : {}),
                ...(isCountable ? S.cardCountable : {}),
                ...(isHov && !selected && !isCountable ? S.cardHover : {}),
              }}
              className={`cpw-room-card${selected ? ' selected' : ''}`}
              onClick={() => !isCountable && toggle(room.id)}
              onMouseEnter={() => setHovered(room.id)}
              onMouseLeave={() => setHovered(null)}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.04 + i * 0.03, type: 'spring', stiffness: 200, damping: 20 }}
              whileHover={!isCountable ? { scale: 1.02, y: -2 } : {}}
              whileTap={!isCountable ? { scale: 0.97 } : {}}
            >
              {/* Glow bg */}
              {selected && !isCountable && (
                <motion.div
                  style={{ ...S.cardGlow, background: `radial-gradient(circle at 50% 0%, ${room.glow} 0%, transparent 70%)` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}

              {/* Icon */}
              <div style={{
                ...S.iconWrap,
                background: selected ? room.glow.replace('0.25', '0.15') : 'rgba(15,21,33,0.8)',
                border: `1px solid ${selected ? room.color + '50' : 'rgba(139,92,246,0.12)'}`,
                boxShadow: selected ? `0 0 16px ${room.glow}` : 'none',
              }}>
                <span style={{ fontSize: '22px' }}>{room.icon}</span>
              </div>

              <span style={{ ...S.cardLabel, ...(selected ? { color: room.color } : {}) }}>
                {room.label}
              </span>

              {/* Counter for bedrooms/bathrooms */}
              {isCountable && (
                <Counter
                  value={count}
                  onChange={n => {
                    if (room.id === 'bedroom')  update('bedroomCount', n)
                    if (room.id === 'bathroom') update('bathroomCount', n)
                  }}
                />
              )}

              {/* Checkmark for selectable rooms */}
              {!isCountable && (
                <motion.div
                  style={{
                    ...S.check,
                    ...(selected ? S.checkSel : S.checkUnsel),
                    borderColor: selected ? room.color : 'rgba(139,92,246,0.2)',
                    background:  selected ? room.glow.replace('0.25', '0.2') : 'transparent',
                  }}
                  animate={selected ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.25 }}
                >
                  {selected && <span style={{ fontSize: '10px', color: room.color }}>✓</span>}
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Selected count */}
      <motion.div
        style={S.selectedCount}
        animate={{ opacity: 1 }}
      >
        <span style={{ fontSize: '14px' }}>🏠</span>
        <span style={S.selectedText}>
          <strong style={{ color: '#a78bfa' }}>{data.bedroomCount}</strong> Beds ·{' '}
          <strong style={{ color: '#67e8f9' }}>{data.bathroomCount}</strong> Baths ·{' '}
          <strong style={{ color: '#f59e0b' }}>{data.rooms.length}</strong> Additional Rooms Selected
        </span>
      </motion.div>

      <WizardButtons onNext={onNext} onPrev={onPrev} showPrev />
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '20px' },
  hint: { fontSize: '13px', color: '#64748b', lineHeight: 1.6 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: '12px',
  },
  card: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '8px', padding: '16px 10px',
    background: 'rgba(15,21,33,0.8)',
    border: '1.5px solid rgba(139,92,246,0.12)',
    borderRadius: '18px', cursor: 'pointer',
    transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  cardSelected: {
    background: 'rgba(139,92,246,0.08)',
    border: '1.5px solid rgba(139,92,246,0.4)',
    boxShadow: '0 0 20px rgba(139,92,246,0.15)',
  },
  cardCountable: {
    cursor: 'default',
    background: 'rgba(15,21,33,0.9)',
    border: '1.5px solid rgba(139,92,246,0.35)',
    boxShadow: '0 0 20px rgba(139,92,246,0.1)',
  },
  cardHover: {
    background: 'rgba(139,92,246,0.05)',
    border: '1.5px solid rgba(139,92,246,0.25)',
  },
  cardGlow: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
  },
  iconWrap: {
    width: '52px', height: '52px', borderRadius: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.25s',
  },
  cardLabel: {
    fontSize: '12px', fontWeight: 700, color: '#94a3b8',
    textAlign: 'center', transition: 'color 0.2s', lineHeight: 1.3,
  },
  counter: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'rgba(15,21,33,0.6)',
    border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: '30px', padding: '4px 8px',
    marginTop: '2px',
  },
  counterBtn: {
    width: '22px', height: '22px', borderRadius: '50%',
    background: 'rgba(139,92,246,0.15)',
    border: '1px solid rgba(139,92,246,0.3)',
    color: '#a78bfa', fontSize: '14px', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.15s', padding: 0,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  counterBtnDisabled: { opacity: 0.3, cursor: 'not-allowed' },
  counterVal: {
    minWidth: '18px', textAlign: 'center',
    fontSize: '14px', fontWeight: 700, color: '#f1f5f9',
  },
  check: {
    width: '22px', height: '22px', borderRadius: '50%',
    border: '2px solid rgba(139,92,246,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s',
    marginTop: '2px',
  },
  checkSel: {},
  checkUnsel: {},
  selectedCount: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 16px',
    background: 'rgba(139,92,246,0.06)',
    border: '1px solid rgba(139,92,246,0.15)',
    borderRadius: '14px',
  },
  selectedText: { fontSize: '13px', color: '#64748b' },
}
