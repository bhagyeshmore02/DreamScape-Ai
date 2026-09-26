import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ProjectData } from '../../pages/CreateProjectPage'
import { WizardButtons } from './WizardButtons'
import ReactMarkdown from 'react-markdown'

interface Props {
  data: ProjectData
  update: <K extends keyof ProjectData>(key: K, value: ProjectData[K]) => void
  onPrev: () => void
}

const PLACEHOLDER = `Design a modern luxury villa with 4 bedrooms, rooftop garden, swimming pool, home office, open kitchen, natural lighting and smart home automation.`

const EXAMPLE_PROMPTS = [
  { icon: '🏛', text: 'Modern luxury villa with 4 bedrooms, pool & rooftop terrace' },
  { icon: '🌿', text: 'Eco-friendly Scandinavian home with open plan & large windows' },
  { icon: '🏙', text: 'Industrial loft apartment with exposed brick & smart automation' },
]

const CURRENCY = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function Step5AIPrompt({ data, update, onPrev }: Props) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [charCount, setCharCount] = useState(data.aiPrompt.length)
  const [aiResult, setAiResult] = useState('')

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch('http://127.0.0.1:8000/api/projects/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_name: data.projectName,
          description: data.description,
          house_style: data.houseStyle,

          plot_width: Number(data.plotWidth),
          plot_length: Number(data.plotLength),
          plot_unit: data.plotUnit,
          plot_shape: data.plotShape,

          bedrooms: data.bedroomCount,
          bathrooms: data.bathroomCount,

          additional_rooms: data.rooms,

          budget: data.budget,
          construction_priority: data.constructionPriority,

          special_features: data.features,

          ai_prompt: data.aiPrompt,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create project')
      }

      const result = await response.json()

      console.log('Backend response:', result)

      setAiResult(result.ai_design)

    } catch (error) {
      console.error('Error:', error)
      alert('Failed to connect to backend.')
    } finally {
      setIsGenerating(false)
    }
  }

  const insertExample = (text: string) => {
    update('aiPrompt', text)
    setCharCount(text.length)
  }

  const roomList = [
    data.bedroomCount > 0 ? `${data.bedroomCount} Bedrooms` : '',
    data.bathroomCount > 0 ? `${data.bathroomCount} Bathrooms` : '',
    ...data.rooms.map(r => r.charAt(0).toUpperCase() + r.slice(1)),
  ].filter(Boolean)

  return (
    <div style={S.wrap}>

      {/* Example prompts */}
      <motion.div style={S.examplesWrap} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <p style={S.examplesLabel}>✦ Quick examples — click to use:</p>
        <div style={S.examples}>
          {EXAMPLE_PROMPTS.map((ex, i) => (
            <motion.button
              key={i}
              style={S.exampleChip}
              className="cpw-example-chip"
              onClick={() => insertExample(ex.text)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
            >
              <span style={{ fontSize: '16px' }}>{ex.icon}</span>
              <span style={S.exampleText}>{ex.text}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Prompt textarea */}
      <motion.div style={S.promptWrap} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div style={S.promptHeader}>
          <label style={S.label}>Your AI Design Prompt</label>
          <span style={S.charCount}>{charCount} / 1000</span>
        </div>
        <div style={S.textareaContainer}>
          <div style={S.promptGlow} />
          <textarea
            id="ai-prompt"
            style={S.textarea}
            className="cpw-textarea"
            placeholder={PLACEHOLDER}
            value={data.aiPrompt}
            onChange={e => {
              update('aiPrompt', e.target.value)
              setCharCount(e.target.value.length)
            }}
            maxLength={1000}
            rows={6}
          />
          <div style={S.promptFooter}>
            <span style={S.promptTip}>💡 Be as detailed as possible — mention styles, materials, special requirements</span>
          </div>
        </div>
      </motion.div>

      {/* Live Summary Card */}
      <motion.div style={S.summaryCard} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div style={S.summaryHeader}>
          <span style={{ fontSize: '20px' }}>🏠</span>
          <div>
            <p style={S.summaryTitle}>Project Summary</p>
            <p style={S.summarySub}>Review before generating</p>
          </div>
        </div>
        <div style={S.summaryGrid}>
          <SummaryRow icon="✏️" label="Project Name" value={data.projectName || '—'} accent="#a78bfa" />
          <SummaryRow icon="📐" label="Plot Size" value={data.plotWidth && data.plotLength ? `${data.plotWidth} × ${data.plotLength} ${data.plotUnit}` : '—'} />
          <SummaryRow icon="🛏" label="Bedrooms" value={String(data.bedroomCount)} accent="#67e8f9" />
          <SummaryRow icon="🚿" label="Bathrooms" value={String(data.bathroomCount)} />
          <SummaryRow icon="💰" label="Budget" value={CURRENCY.format(data.budget)} accent="#f59e0b" />
          <SummaryRow icon="🏗" label="House Style" value={data.houseStyle || '—'} />
        </div>
        {roomList.length > 0 && (
          <>
            <div style={S.summaryDivider} />
            <p style={S.tagLabel}>Rooms & Features</p>
            <div style={S.tagWrap}>
              {roomList.map(r => (
                <span key={r} style={S.tag}>{r}</span>
              ))}
              {data.features.map(f => (
                <span key={f} style={{ ...S.tag, ...S.tagCyan }}>{f}</span>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* Generate button + Prev */}
      <motion.div style={S.actionsRow} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <motion.button
          style={S.prevBtn}
          className="cpw-prev-btn"
          onClick={onPrev}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          ← Previous
        </motion.button>

        <motion.button
          id="generate-dream-home"
          style={{ ...S.generateBtn, ...(isGenerating ? S.generateBtnLoading : {}) }}
          className="cpw-generate-btn"
          onClick={handleGenerate}
          disabled={isGenerating}
          whileHover={isGenerating ? {} : { scale: 1.02, y: -2 }}
          whileTap={isGenerating ? {} : { scale: 0.97 }}
        >
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.span key="loading" style={S.generateInner} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span style={S.spinner} className="cpw-spinner" />
                Generating…
              </motion.span>
            ) : (
              <motion.span key="idle" style={S.generateInner} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span style={{ fontSize: '18px' }}>✨</span>
                Generate Dream Home
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {aiResult && (
          <div
            style={{
              marginTop: '24px',
              padding: '24px',
              borderRadius: '16px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <h3
              style={{
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: 700,
              }}
            >
              ✨ AI Design Recommendation
            </h3>

            <ReactMarkdown
              components={{
                h3: ({ children }) => (
                  <h3
                    style={{
                      marginTop: '20px',
                      marginBottom: '10px',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#1e293b',
                    }}
                  >
                    {children}
                  </h3>
                ),

                p: ({ children }) => (
                  <p
                    style={{
                      marginBottom: '12px',
                      lineHeight: 1.7,
                      color: '#475569',
                    }}
                  >
                    {children}
                  </p>
                ),

                li: ({ children }) => (
                  <li
                    style={{
                      marginBottom: '6px',
                      lineHeight: 1.6,
                      color: '#475569',
                    }}
                  >
                    {children}
                  </li>
                ),
              }}
            >
              {aiResult}
            </ReactMarkdown>
          </div>
        )}

      </motion.div>
    </div>
  )
}

function SummaryRow({ icon, label, value, accent }: { icon: string; label: string; value: string; accent?: string }) {
  return (
    <div style={SR.row}>
      <div style={SR.iconWrap}><span style={{ fontSize: '13px' }}>{icon}</span></div>
      <span style={SR.label}>{label}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          style={{ ...SR.value, ...(accent ? { color: accent } : {}) }}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2 }}
        >{value}</motion.span>
      </AnimatePresence>
    </div>
  )
}

const SR: Record<string, React.CSSProperties> = {
  row: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' },
  iconWrap: {
    width: '28px', height: '28px', borderRadius: '8px',
    background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  label: { flex: 1, fontSize: '13px', color: '#64748b', fontWeight: 500 },
  value: { fontSize: '13px', fontWeight: 700, color: '#e2e8f0' },
}

const S: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '24px' },
  examplesWrap: {},
  examplesLabel: { fontSize: '12px', color: '#475569', marginBottom: '10px', fontWeight: 600 },
  examples: { display: 'flex', flexDirection: 'column', gap: '8px' },
  exampleChip: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 16px',
    background: 'rgba(15,21,33,0.8)',
    border: '1px solid rgba(139,92,246,0.15)',
    borderRadius: '12px', cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif",
    textAlign: 'left', transition: 'all 0.2s',
  },
  exampleText: { fontSize: '13px', color: '#94a3b8', lineHeight: 1.4 },
  promptWrap: {},
  promptHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '8px',
  },
  label: { fontSize: '14px', fontWeight: 600, color: '#cbd5e1' },
  charCount: { fontSize: '11px', color: '#475569' },
  textareaContainer: {
    position: 'relative', borderRadius: '16px', overflow: 'hidden',
    border: '1.5px solid rgba(139,92,246,0.25)',
    background: 'rgba(15,21,33,0.85)',
  },
  promptGlow: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
    background: 'linear-gradient(90deg, #8b5cf6, #06b6d4, #ec4899)',
    pointerEvents: 'none', zIndex: 2,
  },
  textarea: {
    width: '100%', padding: '20px',
    background: 'transparent',
    border: 'none', color: '#f1f5f9',
    fontSize: '14px', fontFamily: "'Space Grotesk', sans-serif",
    outline: 'none', resize: 'vertical', lineHeight: 1.7,
    boxSizing: 'border-box',
  },
  promptFooter: {
    padding: '10px 20px 14px',
    borderTop: '1px solid rgba(139,92,246,0.1)',
  },
  promptTip: { fontSize: '11px', color: '#475569' },
  summaryCard: {
    background: 'rgba(12,16,28,0.95)',
    border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: '20px', padding: '20px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  },
  summaryHeader: {
    display: 'flex', alignItems: 'center', gap: '12px',
    marginBottom: '16px',
  },
  summaryTitle: {
    fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '16px', color: '#f1f5f9',
  },
  summarySub: { fontSize: '11px', color: '#475569' },
  summaryGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px',
    borderTop: '1px solid rgba(139,92,246,0.1)', paddingTop: '12px',
  },
  summaryDivider: {
    height: '1px', background: 'rgba(139,92,246,0.1)', margin: '14px 0 10px',
  },
  tagLabel: { fontSize: '11px', color: '#475569', marginBottom: '8px', fontWeight: 600 },
  tagWrap: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  tag: {
    fontSize: '11px', fontWeight: 600,
    padding: '4px 10px', borderRadius: '20px',
    background: 'rgba(139,92,246,0.12)',
    border: '1px solid rgba(139,92,246,0.25)',
    color: '#a78bfa',
  },
  tagCyan: {
    background: 'rgba(6,182,212,0.1)',
    border: '1px solid rgba(6,182,212,0.25)',
    color: '#67e8f9',
  },
  actionsRow: {
    display: 'flex', gap: '12px', alignItems: 'center',
  },
  prevBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '14px 24px',
    background: 'rgba(139,92,246,0.08)',
    border: '1.5px solid rgba(139,92,246,0.2)',
    borderRadius: '14px', color: '#94a3b8',
    fontSize: '14px', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif",
    flexShrink: 0,
  },
  generateBtn: {
    flex: 1, padding: '16px 32px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #06b6d4 100%)',
    backgroundSize: '200% auto',
    border: 'none', borderRadius: '14px', color: '#fff',
    fontSize: '16px', fontWeight: 700, cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
    boxShadow: '0 0 32px rgba(139,92,246,0.45), 0 8px 24px rgba(0,0,0,0.3)',
    transition: 'all 0.3s',
  },
  generateBtnLoading: {
    opacity: 0.8, cursor: 'not-allowed',
  },
  generateInner: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
  },
  spinner: {
    display: 'inline-block',
    width: '18px', height: '18px', borderRadius: '50%',
    border: '2.5px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
  },
}
