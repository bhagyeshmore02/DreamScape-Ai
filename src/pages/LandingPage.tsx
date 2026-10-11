import { useState, useEffect, useRef } from 'react'
import { useRouter } from '../routerContext'

/* ===================================================
   INLINE STYLES — Design System
=================================================== */
const styles: Record<string, React.CSSProperties> = {
  /* Layout */
  page: {
    minHeight: '100vh',
    background: '#080b14',
    fontFamily: "'Space Grotesk', sans-serif",
    overflowX: 'hidden',
    position: 'relative',
  },

  /* ---- NAV ---- */
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: '0 5%',
    height: '72px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.3s ease',
  },
  navScrolled: {
    background: 'rgba(8, 11, 20, 0.9)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0,
    boxShadow: '0 0 20px rgba(139,92,246,0.4)',
  },
  logoText: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 800,
    fontSize: '20px',
    background: 'linear-gradient(135deg, #a78bfa, #67e8f9)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '36px',
    listStyle: 'none',
  },
  navLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'color 0.2s',
    cursor: 'pointer',
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  btnOutline: {
    padding: '8px 20px',
    borderRadius: '8px',
    border: '1px solid rgba(139,92,246,0.4)',
    background: 'transparent',
    color: '#a78bfa',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  btnPrimary: {
    padding: '8px 22px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: "'Space Grotesk', sans-serif",
    boxShadow: '0 0 20px rgba(139,92,246,0.3)',
  },

  /* ---- HERO ---- */
  hero: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: '120px 5% 80px',
    overflow: 'hidden',
  },

  /* Glow orbs */
  orbPurple: {
    position: 'absolute',
    width: '700px',
    height: '700px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
    top: '-200px',
    left: '-200px',
    pointerEvents: 'none',
    animation: 'pulse-glow 5s ease-in-out infinite',
  },
  orbCyan: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)',
    bottom: '0px',
    right: '-150px',
    pointerEvents: 'none',
    animation: 'pulse-glow 7s ease-in-out infinite 2s',
  },
  orbPink: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)',
    top: '30%',
    right: '15%',
    pointerEvents: 'none',
    animation: 'pulse-glow 9s ease-in-out infinite 4s',
  },

  /* Grid overlay */
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    pointerEvents: 'none',
  },

  heroContent: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    maxWidth: '900px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '28px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    borderRadius: '100px',
    background: 'rgba(139,92,246,0.12)',
    border: '1px solid rgba(139,92,246,0.3)',
    fontSize: '13px',
    color: '#a78bfa',
    fontWeight: 500,
    animation: 'fadeInUp 0.6s ease-out forwards',
  },
  badgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#8b5cf6',
    animation: 'pulse-glow 2s ease-in-out infinite',
  },
  heroHeading: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 'clamp(42px, 7vw, 88px)',
    fontWeight: 900,
    lineHeight: 1.05,
    letterSpacing: '-2px',
    color: '#f1f5f9',
    animation: 'fadeInUp 0.8s ease-out 0.2s forwards',
    opacity: 0,
  },
  heroHeadingGradient: {
    background: 'linear-gradient(135deg, #a78bfa 0%, #67e8f9 40%, #f9a8d4 80%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    backgroundSize: '200% auto',
    animation: 'shimmer 3s linear infinite, fadeInUp 0.8s ease-out 0.2s forwards',
    display: 'inline-block',
    opacity: 1,
  },
  heroSubtitle: {
    fontSize: 'clamp(16px, 2vw, 20px)',
    color: '#94a3b8',
    maxWidth: '620px',
    lineHeight: 1.7,
    animation: 'fadeInUp 0.8s ease-out 0.4s forwards',
    opacity: 0,
  },

  /* Prompt Box */
  promptBox: {
    width: '100%',
    maxWidth: '680px',
    background: 'rgba(15, 21, 33, 0.8)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(139,92,246,0.25)',
    borderRadius: '16px',
    padding: '6px 6px 6px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 0 60px rgba(139,92,246,0.1), 0 20px 60px rgba(0,0,0,0.4)',
    animation: 'fadeInUp 0.8s ease-out 0.6s forwards',
    opacity: 0,
    transition: 'border-color 0.3s, box-shadow 0.3s',
  },
  promptInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#f1f5f9',
    fontSize: '15px',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 400,
    minWidth: 0,
  },
  generateBtn: {
    padding: '12px 24px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 60%, #6d28d9 100%)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif",
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
    boxShadow: '0 0 24px rgba(139,92,246,0.4)',
    flexShrink: 0,
  },

  heroStats: {
    display: 'flex',
    gap: '40px',
    animation: 'fadeInUp 0.8s ease-out 0.8s forwards',
    opacity: 0,
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  statValue: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 800,
    fontSize: '28px',
    background: 'linear-gradient(135deg, #a78bfa, #67e8f9)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  statLabel: {
    color: '#64748b',
    fontSize: '13px',
    fontWeight: 500,
  },
  statDivider: {
    width: '1px',
    height: '40px',
    background: 'linear-gradient(to bottom, transparent, rgba(139,92,246,0.3), transparent)',
  },

  /* ---- GALLERY ---- */
  gallerySection: {
    position: 'relative',
    zIndex: 10,
    padding: '20px 0 80px',
    overflow: 'hidden',
  },
  galleryTrack: {
    display: 'flex',
    gap: '16px',
    width: 'max-content',
    animation: 'scroll-gallery 40s linear infinite',
  },
  galleryCard: {
    width: '260px',
    height: '320px',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(139,92,246,0.15)',
    flexShrink: 0,
    position: 'relative',
    cursor: 'pointer',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },
  galleryCardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },
  galleryCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '20px 14px 14px',
    background: 'linear-gradient(to top, rgba(8,11,20,0.95), transparent)',
  },
  galleryCardLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#e2e8f0',
    lineHeight: 1.3,
  },
  galleryCardStyle: {
    fontSize: '11px',
    color: '#8b5cf6',
    fontWeight: 500,
    marginTop: '3px',
  },

  /* ---- FEATURES ---- */
  featuresSection: {
    padding: '100px 5%',
    position: 'relative',
  },
  sectionLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    borderRadius: '100px',
    background: 'rgba(6,182,212,0.1)',
    border: '1px solid rgba(6,182,212,0.25)',
    fontSize: '12px',
    color: '#67e8f9',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 'clamp(32px, 4vw, 52px)',
    fontWeight: 800,
    color: '#f1f5f9',
    lineHeight: 1.1,
    marginBottom: '16px',
  },
  sectionSubtitle: {
    color: '#94a3b8',
    fontSize: '17px',
    maxWidth: '500px',
    lineHeight: 1.7,
    marginBottom: '60px',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  featureCard: {
    background: 'rgba(15, 21, 33, 0.6)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(139,92,246,0.12)',
    borderRadius: '20px',
    padding: '28px',
    transition: 'all 0.3s ease',
    cursor: 'default',
  },
  featureIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
    marginBottom: '18px',
  },
  featureTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700,
    fontSize: '18px',
    color: '#f1f5f9',
    marginBottom: '10px',
  },
  featureDesc: {
    color: '#64748b',
    fontSize: '14px',
    lineHeight: 1.7,
  },

  /* ---- CTA ---- */
  ctaSection: {
    padding: '80px 5%',
    display: 'flex',
    justifyContent: 'center',
  },
  ctaCard: {
    width: '100%',
    maxWidth: '900px',
    borderRadius: '32px',
    padding: '80px 60px',
    background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(6,182,212,0.08) 50%, rgba(236,72,153,0.08) 100%)',
    border: '1px solid rgba(139,92,246,0.2)',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  ctaHeading: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 'clamp(32px, 4vw, 54px)',
    fontWeight: 900,
    color: '#f1f5f9',
    lineHeight: 1.1,
    marginBottom: '16px',
  },
  ctaSubtitle: {
    color: '#94a3b8',
    fontSize: '17px',
    marginBottom: '40px',
    lineHeight: 1.6,
  },
  ctaBtns: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  btnLarge: {
    padding: '16px 36px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif",
    boxShadow: '0 0 30px rgba(139,92,246,0.4)',
    transition: 'all 0.2s',
  },
  btnLargeOutline: {
    padding: '15px 36px',
    borderRadius: '12px',
    border: '1px solid rgba(139,92,246,0.4)',
    background: 'transparent',
    color: '#a78bfa',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif",
    transition: 'all 0.2s',
  },

  /* ---- FOOTER ---- */
  footer: {
    borderTop: '1px solid rgba(139,92,246,0.1)',
    padding: '40px 5%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '20px',
  },
  footerLinks: {
    display: 'flex',
    gap: '24px',
    listStyle: 'none',
  },
  footerLink: {
    color: '#475569',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  footerCopy: {
    color: '#334155',
    fontSize: '13px',
  },
}

/* ===================================================
   GALLERY DATA — house project cards
=================================================== */
const GALLERY_ITEMS = [
  { label: 'Modern Villa', style: 'Contemporary', beds: 4, floors: 2, area: '320 m²' },
  { label: 'Luxury Duplex', style: 'Luxury', beds: 5, floors: 2, area: '450 m²' },
  { label: 'Smart Apartment', style: 'Minimalist', beds: 2, floors: 1, area: '95 m²' },
  { label: 'Eco Cottage', style: 'Traditional', beds: 3, floors: 1, area: '160 m²' },
  { label: 'Beach House', style: 'Coastal', beds: 4, floors: 2, area: '280 m²' },
  { label: 'Minimalist Home', style: 'Minimalist', beds: 3, floors: 1, area: '200 m²' },
  { label: 'Garden Bungalow', style: 'Traditional', beds: 3, floors: 1, area: '180 m²' },
  { label: 'Urban Penthouse', style: 'Luxury', beds: 3, floors: 1, area: '240 m²' },
]

const GALLERY_BG_PATTERNS = [
  'linear-gradient(160deg, #1e3a5f 0%, #2d6a9f 100%)',
  'linear-gradient(160deg, #3b2a6b 0%, #6d4fc4 100%)',
  'linear-gradient(160deg, #0f3d2e 0%, #1a7a57 100%)',
  'linear-gradient(160deg, #1a2e4a 0%, #2c5282 80%, #3b82f6 100%)',
  'linear-gradient(160deg, #2d1b69 0%, #5b21b6 60%, #7c3aed 100%)',
  'linear-gradient(160deg, #14293d 0%, #1e4976 100%)',
  'linear-gradient(160deg, #1b3a2d 0%, #166534 80%, #22c55e 100%)',
  'linear-gradient(160deg, #1e1b4b 0%, #3730a3 100%)',
]

const PROMPTS = [
  'Design a modern 2-floor villa with 4 bedrooms, swimming pool and open kitchen…',
  'Create a luxury duplex with 5 bedrooms, home office, rooftop terrace…',
  'Generate a minimalist smart apartment with 2 bedrooms and open living space…',
  'Design an eco-friendly cottage with garden, solar panels and 3 bedrooms…',
  'Build a coastal beach house with panoramic sea views and 4 bedrooms…',
]

/* ===================================================
   FEATURES DATA
=================================================== */
const FEATURES = [
  {
    icon: '🏠',
    bg: 'rgba(139,92,246,0.15)',
    title: 'AI House Generation',
    desc: 'Describe your dream home in plain language and get a fully detailed architectural design in under 10 seconds, ready to explore.',
  },
  {
    icon: '📐',
    bg: 'rgba(6,182,212,0.15)',
    title: 'Intelligent Floor Planning',
    desc: 'Automatically generate optimized floor plans with smart room placement, natural light analysis, and space efficiency scoring.',
  },
  {
    icon: '🔲',
    bg: 'rgba(236,72,153,0.15)',
    title: 'Interactive 3D Walkthrough',
    desc: 'Step inside your generated home with an immersive real-time 3D walkthrough before a single brick is laid.',
  },
  {
    icon: '🛋️',
    bg: 'rgba(245,158,11,0.15)',
    title: 'AI Interior Design',
    desc: 'Get intelligent furniture placement suggestions, color palette recommendations, and material selections tailored to your style.',
  },
  {
    icon: '💰',
    bg: 'rgba(16,185,129,0.15)',
    title: 'Construction Cost Estimation',
    desc: 'Receive instant, accurate cost breakdowns for materials, labor, and finishing — localized to your region and budget.',
  },
  {
    icon: '📄',
    bg: 'rgba(139,92,246,0.15)',
    title: 'Export PDF Blueprint',
    desc: 'Download print-ready architectural blueprints, floor plans, and 3D renders in PDF format to share with your contractor.',
  },
]

/* ===================================================
   COMPONENT
=================================================== */
export default function LandingPage() {
  const { navigate } = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [promptText, setPromptText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const promptRef = useRef<HTMLInputElement>(null)

  // Scroll handler
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Animated placeholder typing effect
  useEffect(() => {
    const phrases = PROMPTS
    let currentIdx = 0
    let charIdx = 0
    let direction = 1
    let timer: ReturnType<typeof setTimeout>

    const animate = () => {
      const phrase = phrases[currentIdx]
      if (direction === 1) {
        charIdx++
        setPromptText(phrase.slice(0, charIdx))
        if (charIdx >= phrase.length) {
          direction = -1
          timer = setTimeout(animate, 2000)
          return
        }
      } else {
        charIdx--
        setPromptText(phrase.slice(0, charIdx))
        if (charIdx === 0) {
          direction = 1
          currentIdx = (currentIdx + 1) % phrases.length
          timer = setTimeout(animate, 300)
          return
        }
      }
      timer = setTimeout(animate, direction === 1 ? 45 : 25)
    }

    setIsTyping(true)
    timer = setTimeout(animate, 1000)
    return () => clearTimeout(timer)
  }, [])

  const galleryDoubled = [...GALLERY_ITEMS, ...GALLERY_ITEMS]

  return (
    <div style={styles.page}>
      {/* ---- GLOBAL STYLES INJECTION ---- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scroll-gallery {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes sparkle-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .nav-link-hover:hover { color: #a78bfa !important; }
        .footer-link:hover { color: #a78bfa !important; }

        .gallery-track {
          display: flex;
          gap: 16px;
          width: max-content;
          animation: scroll-gallery 50s linear infinite;
        }
        .gallery-track:hover {
          animation-play-state: paused;
        }

        .gallery-card:hover .gallery-img {
          transform: scale(1.06);
        }

        .feature-card:hover {
          background: rgba(21, 29, 46, 0.8) !important;
          border-color: rgba(139,92,246,0.3) !important;
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 30px rgba(139,92,246,0.1);
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 30px rgba(139,92,246,0.5) !important;
        }
        .btn-outline:hover {
          background: rgba(139,92,246,0.1) !important;
          border-color: rgba(139,92,246,0.6) !important;
        }
        .btn-large:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 40px rgba(139,92,246,0.5) !important;
        }
        .btn-large-outline:hover {
          background: rgba(139,92,246,0.1) !important;
        }

        .generate-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 32px rgba(139,92,246,0.6) !important;
          background: linear-gradient(135deg, #9d6ef8 0%, #8b5cf6 60%, #7c3aed 100%) !important;
        }

        .prompt-box:focus-within {
          border-color: rgba(139,92,246,0.5) !important;
          box-shadow: 0 0 80px rgba(139,92,246,0.15), 0 20px 60px rgba(0,0,0,0.4) !important;
        }

        .hero-section {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .sparkle {
          position: absolute;
          pointer-events: none;
          font-size: 14px;
          animation: float 3s ease-in-out infinite;
          opacity: 0.6;
        }

        input::placeholder {
          color: transparent;
        }

        .cursor-blink::after {
          content: '|';
          animation: blink 1s step-end infinite;
          color: #8b5cf6;
          font-weight: 300;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      {/* ================= NAVBAR ================= */}
      <nav style={{ ...styles.nav, ...(scrolled ? styles.navScrolled : {}) }}>
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>✦</div>
          <span style={styles.logoText}>DreamScape AI</span>
        </div>

        {/* Links */}
        <ul style={styles.navLinks}>
          {['Designs', 'Generate', 'Gallery', 'Pricing', 'Docs'].map(link => (
            <li key={link}>
              <a style={styles.navLink} className="nav-link-hover">{link}</a>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div style={styles.navActions}>
          <button id="nav-login-btn" style={styles.btnOutline} className="btn-outline" onClick={() => navigate('login')}>Log In</button>
          <button id="nav-signup-btn" style={styles.btnPrimary} className="btn-primary" onClick={() => navigate('signup')}>
            Get Started Free ✦
          </button>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section style={styles.hero} className="hero-section">
        {/* Ambient orbs */}
        <div style={styles.orbPurple} />
        <div style={styles.orbCyan} />
        <div style={styles.orbPink} />
        {/* Grid */}
        <div style={styles.grid} />

        {/* Floating sparkles */}
        <span className="sparkle" style={{ top: '18%', left: '12%', animationDelay: '0s' }}>✦</span>
        <span className="sparkle" style={{ top: '35%', left: '88%', animationDelay: '1s', fontSize: '10px' }}>◆</span>
        <span className="sparkle" style={{ top: '72%', left: '8%', animationDelay: '2s', fontSize: '18px', color: '#67e8f9' }}>✦</span>
        <span className="sparkle" style={{ top: '20%', right: '20%', animationDelay: '0.5s', fontSize: '10px', color: '#f9a8d4' }}>◆</span>
        <span className="sparkle" style={{ bottom: '25%', right: '10%', animationDelay: '1.5s', color: '#a78bfa' }}>✦</span>

        <div style={styles.heroContent}>
          {/* Badge */}
          <div style={styles.badge}>
            <span style={styles.badgeDot} />
            Now with 3D Walkthrough · 25,000+ Homes Designed
          </div>

          {/* Heading */}
          <h1 style={styles.heroHeading}>
            Design Your Dream Home<br />
            <span style={styles.heroHeadingGradient}>with AI</span>
          </h1>

          {/* Subtitle */}
          <p style={styles.heroSubtitle}>
            Describe your dream home in natural language. DreamScape AI instantly generates
            interactive 3D house designs, intelligent floor plans, AI-powered design
            suggestions, and immersive virtual walkthroughs.
          </p>

          {/* Prompt Box */}
          <div id="prompt-input-box" style={styles.promptBox} className="prompt-box">
            <span style={{ fontSize: '18px', flexShrink: 0 }}>✦</span>
            <span
              style={{
                flex: 1,
                fontSize: '15px',
                color: promptRef.current?.value ? '#f1f5f9' : '#94a3b8',
                fontFamily: "'Space Grotesk', sans-serif",
                lineHeight: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              className={isTyping ? 'cursor-blink' : ''}
            >
              {promptRef.current?.value || promptText || 'Example: Design a modern 2-floor villa with 4 bedrooms, a swimming pool, garden, home office, and open kitchen.'}
            </span>
            <input
              ref={promptRef}
              type="text"
              style={{ ...styles.promptInput, position: 'absolute', opacity: 0, pointerEvents: 'none' }}
              placeholder=""
            />
            <button
              id="generate-btn"
              type="button"
              style={styles.generateBtn}
              className="generate-btn"
              onClick={() => navigate('create-project')}
            >
              Generate House ✦
            </button>
          </div>

          {/* Suggested prompts */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', opacity: 0, animation: 'fadeInUp 0.8s ease-out 0.7s forwards' }}>
            {['🏡 Modern Villa', '🏖️ Beach House', '🌿 Eco Cottage', '🏙️ Smart Apartment', '💎 Luxury Duplex'].map(tag => (
              <span key={tag} style={{
                padding: '5px 12px',
                borderRadius: '100px',
                background: 'rgba(139,92,246,0.08)',
                border: '1px solid rgba(139,92,246,0.18)',
                fontSize: '12px',
                color: '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div style={styles.heroStats}>
            {[
              { value: '25K+', label: 'Houses Generated' },
              { value: '12K+', label: 'Active Users' },
              { value: '~10s', label: 'Avg. Gen Time' },
              { value: '4.9★', label: 'User Rating' },
            ].map((s, i) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                <div style={styles.stat}>
                  <span style={styles.statValue}>{s.value}</span>
                  <span style={styles.statLabel}>{s.label}</span>
                </div>
                {i < 3 && <div style={styles.statDivider} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= GALLERY STRIP ================= */}
      <section style={styles.gallerySection}>
        {/* Fade edges */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '120px', zIndex: 2,
          background: 'linear-gradient(to right, #080b14, transparent)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '120px', zIndex: 2,
          background: 'linear-gradient(to left, #080b14, transparent)',
          pointerEvents: 'none',
        }} />

        <div style={{ overflow: 'hidden', padding: '10px 0' }}>
          <div className="gallery-track">
            {galleryDoubled.map((item, i) => (
              <div
                key={i}
                className="gallery-card"
                style={{
                  ...styles.galleryCard,
                  transform: hoveredCard === i ? 'scale(1.03)' : 'scale(1)',
                  boxShadow: hoveredCard === i ? '0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(139,92,246,0.2)' : 'none',
                }}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Gradient house visual */}
                <div style={{ width: '100%', height: '100%', background: GALLERY_BG_PATTERNS[i % GALLERY_BG_PATTERNS.length], position: 'relative' }} className="gallery-img">
                  {/* House silhouette */}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '72px', opacity: 0.18 }}>
                    {['🏠', '🏡', '🏗️', '🏘️', '🏰', '🏢', '🏚️', '🏛️'][i % 8]}
                  </div>
                  {/* Overlay texture */}
                  <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.08\'/%3E%3C/svg%3E")', opacity: 0.4 }} />
                  {/* Specs badge */}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', padding: '4px 10px', borderRadius: '100px', background: 'rgba(8,11,20,0.7)', border: '1px solid rgba(139,92,246,0.3)', fontSize: '11px', color: '#a78bfa', fontWeight: 600, backdropFilter: 'blur(8px)' }}>
                    {item.style}
                  </div>
                </div>
                <div style={styles.galleryCardOverlay}>
                  <div style={styles.galleryCardLabel}>{item.label}</div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: '#67e8f9', fontWeight: 500 }}>🛏 {item.beds} beds</span>
                    <span style={{ fontSize: '11px', color: '#a78bfa', fontWeight: 500 }}>🏗 {item.floors} fl.</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>📐 {item.area}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section style={styles.featuresSection}>
        {/* Left aligned header */}
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={styles.sectionLabel}>🏠 PLATFORM FEATURES</div>
          <h2 style={styles.sectionTitle}>
            Everything you need to<br />
            <span style={{ background: 'linear-gradient(135deg, #a78bfa, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              design without limits
            </span>
          </h2>
          <p style={styles.sectionSubtitle}>
            DreamScape AI brings together the most powerful home design tools into one seamless, intelligent platform.
          </p>

          <div style={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="feature-card"
                style={{
                  ...styles.featureCard,
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div style={{ ...styles.featureIcon, background: f.bg }}>
                  {f.icon}
                </div>
                <div style={styles.featureTitle}>{f.title}</div>
                <div style={styles.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaCard}>
          {/* Background glow */}
          <div style={{
            position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
            width: '600px', height: '300px',
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏠</div>
            <h2 style={styles.ctaHeading}>
              Start Designing Your<br />
              <span style={{ background: 'linear-gradient(135deg, #a78bfa, #67e8f9, #f9a8d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Dream Home Today
              </span>
            </h2>
            <p style={styles.ctaSubtitle}>
              Join thousands of homeowners, architects &amp; designers.<br />
              No credit card required. Start free forever.
            </p>
            <div style={styles.ctaBtns}>
              <button id="cta-start-btn" style={styles.btnLarge} className="btn-large" onClick={() => navigate('signup')}>
                Create Your First House ✦
              </button>
              <button id="cta-gallery-btn" style={styles.btnLargeOutline} className="btn-large-outline">
                Browse Designs →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer style={styles.footer}>
        <div style={styles.logo}>
          <div style={{ ...styles.logoIcon, width: '30px', height: '30px', fontSize: '14px' }}>✦</div>
          <span style={{ ...styles.logoText, fontSize: '16px' }}>DreamScape AI</span>
        </div>

        <ul style={styles.footerLinks}>
          {['Privacy', 'Terms', 'API', 'Blog', 'Careers', 'Status'].map(l => (
            <li key={l}>
              <span style={styles.footerLink} className="footer-link">{l}</span>
            </li>
          ))}
        </ul>

        <span style={styles.footerCopy}>© 2026 DreamScape AI, Inc.</span>
      </footer>
    </div>
  )
}
