import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from '../routerContext'
import { signInWithEmailAndPassword, signInWithPopup, type AuthError } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { useAuth } from '../AuthContext'

/* ── tiny reusable Google SVG ── */
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

/* ─────────── validation ─────────── */
function validateEmail(v: string) {
  if (!v) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address'
  return ''
}
function validatePassword(v: string) {
  if (!v) return 'Password is required'
  if (v.length < 6) return 'Password must be at least 6 characters'
  return ''
}

export default function LoginPage() {
  const { navigate } = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; firebase?: string }>({})
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      navigate('dashboard')
    }
  }, [user, navigate])

  const validate = () => ({
    email: validateEmail(email),
    password: validatePassword(password),
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    setTouched({ email: true, password: true })
    if (errs.email || errs.password) return
    setSubmitting(true)
    
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setSubmitted(true)
    } catch (error) {
      const err = error as AuthError
      let msg = 'Failed to sign in'
      if (err.code === 'auth/invalid-credential') msg = 'Invalid email or password'
      else if (err.code === 'auth/too-many-requests') msg = 'Too many attempts. Try again later.'
      setErrors(e => ({ ...e, firebase: msg }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    setSubmitting(true)
    try {
      await signInWithPopup(auth, googleProvider)
      setSubmitted(true)
    } catch (error) {
      const err = error as AuthError
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrors(e => ({ ...e, firebase: err.message }))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleBlur = (field: 'email' | 'password') => {
    setTouched(t => ({ ...t, [field]: true }))
    setErrors(e => ({
      ...e,
      [field]: field === 'email' ? validateEmail(email) : validatePassword(password),
    }))
  }

  const inputStyle = (hasErr: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '13px 16px',
    borderRadius: '12px',
    border: `1.5px solid ${hasErr ? 'rgba(239,68,68,0.6)' : 'rgba(139,92,246,0.2)'}`,
    background: 'rgba(15,21,33,0.7)',
    color: '#f1f5f9',
    fontSize: '15px',
    fontFamily: "'Space Grotesk', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Space Grotesk', sans-serif", background: '#080b14' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-glow { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes shimmer { 0%{background-position:0% center} 100%{background-position:200% center} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .auth-input:focus {
          border-color: rgba(139,92,246,0.6) !important;
          box-shadow: 0 0 0 3px rgba(139,92,246,0.12), 0 0 20px rgba(139,92,246,0.1) !important;
        }
        .auth-input.error:focus {
          border-color: rgba(239,68,68,0.6) !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.1) !important;
        }
        .auth-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 0 40px rgba(139,92,246,0.5) !important;
          background: linear-gradient(135deg, #9d6ef8 0%, #8b5cf6 60%, #7c3aed 100%) !important;
        }
        .auth-btn-google:hover {
          background: rgba(255,255,255,0.06) !important;
          border-color: rgba(139,92,246,0.4) !important;
        }
        .auth-link:hover { color: #a78bfa !important; }
        .show-pw:hover { color: #a78bfa !important; }
        .preview-card { animation: float 4s ease-in-out infinite; }
        .preview-card:nth-child(2) { animation-delay: 1.5s; }
        .preview-card:nth-child(3) { animation-delay: 3s; }
      `}</style>

      {/* ═══════════ LEFT PANEL ═══════════ */}
      <div style={{
        width: '44%',
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0f0826 0%, #0a1628 40%, #080b14 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '40px 48px',
        flexShrink: 0,
      }}>
        {/* Ambient orbs */}
        <div style={{ position:'absolute', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', top:'-150px', left:'-150px', pointerEvents:'none', animation:'pulse-glow 6s ease-in-out infinite' }} />
        <div style={{ position:'absolute', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', bottom:'-100px', right:'-100px', pointerEvents:'none', animation:'pulse-glow 8s ease-in-out infinite 2s' }} />
        {/* Grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)', backgroundSize:'50px 50px', pointerEvents:'none' }} />

        {/* Logo */}
        <div style={{ position:'relative', zIndex:2, display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' }} onClick={() => navigate('landing')}>
          <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'linear-gradient(135deg, #8b5cf6, #06b6d4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', boxShadow:'0 0 20px rgba(139,92,246,0.4)' }}>✦</div>
          <span style={{ fontFamily:"'Outfit', sans-serif", fontWeight:800, fontSize:'20px', background:'linear-gradient(135deg, #a78bfa, #67e8f9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>DreamScape AI</span>
        </div>

        {/* Center content */}
        <div style={{ position:'relative', zIndex:2, flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:'40px' }}>
          <div>
            <h2 style={{ fontFamily:"'Outfit', sans-serif", fontSize:'36px', fontWeight:900, color:'#f1f5f9', lineHeight:1.1, marginBottom:'12px' }}>
              Design Your<br />
              <span style={{ background:'linear-gradient(135deg, #a78bfa, #67e8f9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Dream Home.</span>
            </h2>
            <p style={{ color:'#64748b', fontSize:'15px', lineHeight:1.7 }}>
              Generate beautiful AI-powered house designs, explore immersive 3D walkthroughs, save projects, and receive intelligent design recommendations.
            </p>
          </div>

          {/* Floating house project preview cards */}
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {[
              { bg:'linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)', icon:'🏡', label:'Modern Villa', style:'Contemporary — 4 beds, 2 floors, 320 m²' },
              { bg:'linear-gradient(135deg, #3b2a6b 0%, #6d4fc4 100%)', icon:'💎', label:'Luxury Duplex', style:'Luxury — 5 beds, 2 floors, 450 m²' },
              { bg:'linear-gradient(135deg, #0f3d2e 0%, #1a7a57 100%)', icon:'🌿', label:'Eco Cottage', style:'Traditional — 3 beds, 1 floor, 160 m²' },
            ].map((card, i) => (
              <div key={i} className="preview-card" style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px', borderRadius:'14px', background:'rgba(15,21,33,0.7)', border:'1px solid rgba(139,92,246,0.15)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)' }}>
                <div style={{ width:'48px', height:'48px', borderRadius:'10px', background:card.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>{card.icon}</div>
                <div>
                  <div style={{ color:'#e2e8f0', fontSize:'13px', fontWeight:600 }}>{card.label}</div>
                  <div style={{ color:'#8b5cf6', fontSize:'11px', fontWeight:500, marginTop:'2px' }}>{card.style}</div>
                </div>
                <div style={{ marginLeft:'auto', fontSize:'11px', color:'#334155', fontWeight:500 }}>Just now</div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ display:'flex' }}>
              {['#8b5cf6','#06b6d4','#ec4899','#f59e0b'].map((c,i) => (
                <div key={i} style={{ width:'28px', height:'28px', borderRadius:'50%', background:c, border:'2px solid #080b14', marginLeft: i > 0 ? '-8px' : '0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', color:'#fff', fontWeight:700 }}>{['A','B','C','D'][i]}</div>
              ))}
            </div>
            <div>
              <div style={{ color:'#94a3b8', fontSize:'13px', fontWeight:500 }}>Trusted by <span style={{ color:'#a78bfa', fontWeight:700 }}>thousands</span> of homeowners, architects &amp; designers.</div>
              <div style={{ color:'#f59e0b', fontSize:'12px' }}>★★★★★ 4.9 / 5 rating</div>
            </div>
          </div>
        </div>

        <div style={{ position:'relative', zIndex:2 }}>
          <p style={{ color:'#334155', fontSize:'12px', fontStyle:'italic' }}>&ldquo;The most powerful AI home design tool I&rsquo;ve ever used.&rdquo;</p>
          <p style={{ color:'#1e293b', fontSize:'11px', marginTop:'4px' }}>&mdash; Featured in Dezeen, ArchDaily, and The Verge</p>
        </div>
      </div>

      {/* ═══════════ RIGHT PANEL ═══════════ */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 32px', background:'#080b14', overflowY:'auto', minHeight:'100vh' }}>
        <div style={{ width:'100%', maxWidth:'440px', animation:'fadeInUp 0.7s ease-out forwards' }}>

          {/* Header */}
          <div style={{ marginBottom:'36px' }}>
            <h1 style={{ fontFamily:"'Outfit', sans-serif", fontSize:'32px', fontWeight:900, color:'#f1f5f9', marginBottom:'8px' }}>Welcome back</h1>
            <p style={{ color:'#64748b', fontSize:'15px' }}>
              Don't have an account?{' '}
              <button onClick={() => navigate('signup')} style={{ background:'none', border:'none', padding:0, color:'#8b5cf6', fontSize:'15px', fontWeight:600, cursor:'pointer', fontFamily:"'Space Grotesk', sans-serif" }} className="auth-link">Create one free</button>
            </p>
          </div>

          {/* Success state */}
          {submitted ? (
            <div style={{ padding:'32px', borderRadius:'16px', background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.3)', textAlign:'center' }}>
              <div style={{ fontSize:'48px', marginBottom:'12px' }}>✦</div>
              <h3 style={{ fontFamily:"'Outfit', sans-serif", fontSize:'20px', fontWeight:700, color:'#f1f5f9', marginBottom:'8px' }}>Signed in!</h3>
              <p style={{ color:'#94a3b8', fontSize:'14px' }}>Redirecting you to your dashboard…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

              {/* Firebase Error */}
              {errors.firebase && (
                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⚠</span> {errors.firebase}
                </div>
              )}

              {/* Google button */}
              <button id="google-login-btn" type="button" onClick={handleGoogle} disabled={submitting} className="auth-btn-google" style={{ width:'100%', padding:'13px', borderRadius:'12px', border:'1.5px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.03)', color:'#e2e8f0', fontSize:'15px', fontWeight:600, cursor:submitting ? 'not-allowed' : 'pointer', fontFamily:"'Space Grotesk', sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', transition:'all 0.2s', opacity: submitting ? 0.7 : 1 }}>
                <GoogleIcon />
                Continue with Google
              </button>

              {/* Divider */}
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ flex:1, height:'1px', background:'rgba(139,92,246,0.15)' }} />
                <span style={{ color:'#334155', fontSize:'13px', fontWeight:500 }}>or sign in with email</span>
                <div style={{ flex:1, height:'1px', background:'rgba(139,92,246,0.15)' }} />
              </div>

              {/* Email */}
              <div>
                <label style={{ display:'block', color:'#94a3b8', fontSize:'13px', fontWeight:600, marginBottom:'8px', letterSpacing:'0.02em' }}>EMAIL ADDRESS</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (touched.email) setErrors(er => ({ ...er, email: validateEmail(e.target.value) })) }}
                  onBlur={() => handleBlur('email')}
                  placeholder="you@example.com"
                  className={`auth-input${touched.email && errors.email ? ' error' : ''}`}
                  style={inputStyle(!!(touched.email && errors.email))}
                  autoComplete="email"
                />
                {touched.email && errors.email && (
                  <div style={{ color:'#ef4444', fontSize:'12px', marginTop:'6px', display:'flex', alignItems:'center', gap:'5px' }}>
                    <span>⚠</span> {errors.email}
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                  <label style={{ color:'#94a3b8', fontSize:'13px', fontWeight:600, letterSpacing:'0.02em' }}>PASSWORD</label>
                  <button type="button" onClick={() => navigate('forgot-password')} style={{ background:'none', border:'none', padding:0, color:'#8b5cf6', fontSize:'13px', fontWeight:500, cursor:'pointer', fontFamily:"'Space Grotesk', sans-serif" }} className="auth-link">Forgot password?</button>
                </div>
                <div style={{ position:'relative' }}>
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); if (touched.password) setErrors(er => ({ ...er, password: validatePassword(e.target.value) })) }}
                    onBlur={() => handleBlur('password')}
                    placeholder="••••••••"
                    className={`auth-input${touched.password && errors.password ? ' error' : ''}`}
                    style={{ ...inputStyle(!!(touched.password && errors.password)), paddingRight:'48px' }}
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)} className="show-pw" style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#475569', fontSize:'18px', padding:'2px', transition:'color 0.2s', lineHeight:1 }}>
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <div style={{ color:'#ef4444', fontSize:'12px', marginTop:'6px', display:'flex', alignItems:'center', gap:'5px' }}>
                    <span>⚠</span> {errors.password}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button id="login-submit-btn" type="submit" disabled={submitting} className="auth-btn-primary" style={{ width:'100%', padding:'15px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg, #8b5cf6, #7c3aed)', color:'#fff', fontSize:'16px', fontWeight:700, cursor:submitting ? 'not-allowed' : 'pointer', fontFamily:"'Space Grotesk', sans-serif", boxShadow:'0 0 30px rgba(139,92,246,0.35)', transition:'all 0.2s', opacity: submitting ? 0.8 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
                {submitting ? (
                  <>
                    <span style={{ width:'18px', height:'18px', border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }} />
                    Signing in…
                  </>
                ) : 'Sign In ✦'}
              </button>

              {/* Terms note */}
              <p style={{ color:'#334155', fontSize:'12px', textAlign:'center', lineHeight:1.6 }}>
                By continuing, you agree to our{' '}
                <span style={{ color:'#8b5cf6', cursor:'pointer' }}>Terms of Service</span> and{' '}
                <span style={{ color:'#8b5cf6', cursor:'pointer' }}>Privacy Policy</span>.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
