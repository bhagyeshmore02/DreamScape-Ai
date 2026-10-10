import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from '../routerContext'
import { createUserWithEmailAndPassword, signInWithPopup, type AuthError, updateProfile } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { useAuth } from '../AuthContext'

/* ── Google SVG ── */
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

/* ─────────── validation ─────────── */
function valName(v: string) {
  if (!v.trim()) return 'Full name is required'
  if (v.trim().length < 2) return 'Name must be at least 2 characters'
  return ''
}
function valEmail(v: string) {
  if (!v) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address'
  return ''
}
function valPassword(v: string) {
  if (!v) return 'Password is required'
  if (v.length < 8) return 'Password must be at least 8 characters'
  return ''
}
function valConfirm(v: string, pw: string) {
  if (!v) return 'Please confirm your password'
  if (v !== pw) return 'Passwords do not match'
  return ''
}

/* ─────────── password strength ─────────── */
function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '#1e293b' }
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' }
  if (score <= 2) return { score, label: 'Fair', color: '#f59e0b' }
  if (score <= 3) return { score, label: 'Good', color: '#06b6d4' }
  return { score, label: 'Strong', color: '#10b981' }
}

export default function SignupPage() {
  const { navigate } = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      navigate('dashboard')
    }
  }, [user, navigate])

  const strength = getStrength(password)

  const validate = () => ({
    name: valName(name),
    email: valEmail(email),
    password: valPassword(password),
    confirm: valConfirm(confirm, password),
    agree: agree ? '' : 'You must accept the terms to continue',
  })

  const handleBlur = (field: string, value: string) => {
    setTouched(t => ({ ...t, [field]: true }))
    let err = ''
    if (field === 'name') err = valName(value)
    if (field === 'email') err = valEmail(value)
    if (field === 'password') err = valPassword(value)
    if (field === 'confirm') err = valConfirm(value, password)
    setErrors(e => ({ ...e, [field]: err }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    setTouched({ name: true, email: true, password: true, confirm: true, agree: true })
    if (Object.values(errs).some(Boolean)) return
    setSubmitting(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, { displayName: name })
      setSubmitted(true)
      setTimeout(() => navigate('dashboard'), 2000)
    } catch (error) {
      const err = error as AuthError
      let msg = 'Failed to create account'
      if (err.code === 'auth/email-already-in-use') msg = 'Email is already registered'
      else if (err.code === 'auth/weak-password') msg = 'Password is too weak'
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

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    padding: '13px 16px',
    borderRadius: '12px',
    border: `1.5px solid ${touched[field] && errors[field] ? 'rgba(239,68,68,0.6)' : 'rgba(139,92,246,0.2)'}`,
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
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{background-position:0% center} 100%{background-position:200% center} }

        .auth-input:focus { border-color:rgba(139,92,246,0.6) !important; box-shadow:0 0 0 3px rgba(139,92,246,0.12), 0 0 20px rgba(139,92,246,0.1) !important; }
        .auth-input.error:focus { border-color:rgba(239,68,68,0.6) !important; box-shadow:0 0 0 3px rgba(239,68,68,0.1) !important; }
        .auth-btn-primary:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 0 40px rgba(139,92,246,0.5) !important; background:linear-gradient(135deg, #9d6ef8 0%, #8b5cf6 60%, #7c3aed 100%) !important; }
        .auth-btn-google:hover { background:rgba(255,255,255,0.06) !important; border-color:rgba(139,92,246,0.4) !important; }
        .auth-link:hover { color:#a78bfa !important; }
        .show-pw:hover { color:#a78bfa !important; }
        .benefit-item { animation: float 5s ease-in-out infinite; }
        .benefit-item:nth-child(2) { animation-delay:1.5s; }
        .benefit-item:nth-child(3) { animation-delay:3s; }

        /* custom checkbox */
        .custom-checkbox {
          width:20px; height:20px; border-radius:6px;
          border:1.5px solid rgba(139,92,246,0.3);
          background:rgba(15,21,33,0.7);
          cursor:pointer; appearance:none; -webkit-appearance:none;
          display:inline-flex; align-items:center; justify-content:center;
          flex-shrink:0; transition:all 0.2s; margin-top:2px;
        }
        .custom-checkbox:checked {
          background:linear-gradient(135deg, #8b5cf6, #7c3aed);
          border-color:#8b5cf6;
        }
        .custom-checkbox:checked::after { content:'✓'; color:#fff; font-size:13px; font-weight:700; }
        .custom-checkbox:focus { box-shadow:0 0 0 3px rgba(139,92,246,0.2); outline:none; }
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
        {/* Orbs */}
        <div style={{ position:'absolute', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', top:'-150px', left:'-150px', pointerEvents:'none', animation:'pulse-glow 6s ease-in-out infinite' }} />
        <div style={{ position:'absolute', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', bottom:'-100px', right:'-100px', pointerEvents:'none', animation:'pulse-glow 8s ease-in-out infinite 2s' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)', backgroundSize:'50px 50px', pointerEvents:'none' }} />

        {/* Logo */}
        <div style={{ position:'relative', zIndex:2, display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' }} onClick={() => navigate('landing')}>
          <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'linear-gradient(135deg, #8b5cf6, #06b6d4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', boxShadow:'0 0 20px rgba(139,92,246,0.4)' }}>✦</div>
          <span style={{ fontFamily:"'Outfit', sans-serif", fontWeight:800, fontSize:'20px', background:'linear-gradient(135deg, #a78bfa, #67e8f9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>DreamScape AI</span>
        </div>

        {/* Center */}
        <div style={{ position:'relative', zIndex:2, flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:'36px' }}>
          <div>
            <h2 style={{ fontFamily:"'Outfit', sans-serif", fontSize:'36px', fontWeight:900, color:'#f1f5f9', lineHeight:1.1, marginBottom:'12px' }}>
              Design Your<br />
              <span style={{ background:'linear-gradient(135deg, #f9a8d4, #a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Dream Home.</span>
            </h2>
            <p style={{ color:'#64748b', fontSize:'15px', lineHeight:1.7 }}>
              Create AI-powered house designs, explore interactive 3D walkthroughs, receive intelligent layout suggestions, and save unlimited home projects.
            </p>
          </div>

          {/* Benefits */}
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {[
              { icon:'🏠', title:'AI House Generation', desc:'Describe and generate detailed homes' },
              { icon:'📐', title:'Smart Floor Planning', desc:'Automatically optimize layouts' },
              { icon:'🚶', title:'Interactive 3D Walkthrough', desc:'Step inside your generated home' },
              { icon:'🛋️', title:'AI Interior Suggestions', desc:'Get smart furniture & decor tips' },
              { icon:'💰', title:'Cost Estimation', desc:'Instant accurate cost breakdowns' },
              { icon:'📄', title:'Export PDF Blueprint', desc:'Download plans for contractors' },
            ].map((b, i) => (
              <div key={i} className="benefit-item" style={{ display:'flex', alignItems:'flex-start', gap:'14px', padding:'14px 16px', borderRadius:'14px', background:'rgba(15,21,33,0.6)', border:'1px solid rgba(139,92,246,0.12)', backdropFilter:'blur(16px)' }}>
                <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'rgba(139,92,246,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>{b.icon}</div>
                <div>
                  <div style={{ color:'#e2e8f0', fontSize:'14px', fontWeight:600 }}>{b.title}</div>
                  <div style={{ color:'#475569', fontSize:'12px', marginTop:'2px' }}>{b.desc}</div>
                </div>
                <div style={{ marginLeft:'auto', width:'20px', height:'20px', borderRadius:'50%', background:'rgba(16,185,129,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ color:'#10b981', fontSize:'11px', fontWeight:700 }}>✓</span>
                </div>
              </div>
            ))}
          </div>

          {/* Stats bar */}
          <div style={{ display:'flex', gap:'24px' }}>
            {[['25K+', 'Homes'], ['12K+', 'Designers'], ['4.9★', 'Rated']].map(([val, lbl]) => (
              <div key={lbl} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:"'Outfit', sans-serif", fontWeight:800, fontSize:'22px', background:'linear-gradient(135deg, #a78bfa, #67e8f9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{val}</div>
                <div style={{ color:'#475569', fontSize:'12px', fontWeight:500 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position:'relative', zIndex:2 }}>
          <p style={{ color:'#1e293b', fontSize:'12px' }}>© 2026 DreamScape AI, Inc.</p>
        </div>
      </div>

      {/* ═══════════ RIGHT PANEL ═══════════ */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 32px', background:'#080b14', overflowY:'auto', minHeight:'100vh' }}>
        <div style={{ width:'100%', maxWidth:'460px', animation:'fadeInUp 0.7s ease-out forwards' }}>

          {/* Header */}
          <div style={{ marginBottom:'32px' }}>
            <h1 style={{ fontFamily:"'Outfit', sans-serif", fontSize:'32px', fontWeight:900, color:'#f1f5f9', marginBottom:'8px' }}>Create your account</h1>
            <p style={{ color:'#64748b', fontSize:'15px' }}>
              Already have an account?{' '}
              <button onClick={() => navigate('login')} style={{ background:'none', border:'none', padding:0, color:'#8b5cf6', fontSize:'15px', fontWeight:600, cursor:'pointer', fontFamily:"'Space Grotesk', sans-serif" }} className="auth-link">Sign in</button>
            </p>
          </div>

          {submitted ? (
            <div style={{ padding:'32px', borderRadius:'16px', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', textAlign:'center' }}>
              <div style={{ fontSize:'48px', marginBottom:'12px' }}>🎉</div>
              <h3 style={{ fontFamily:"'Outfit', sans-serif", fontSize:'22px', fontWeight:800, color:'#f1f5f9', marginBottom:'8px' }}>Account created!</h3>
              <p style={{ color:'#94a3b8', fontSize:'14px', lineHeight:1.6 }}>Welcome to DreamScape AI, {name.split(' ')[0]}!<br />Setting up your canvas…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate style={{ display:'flex', flexDirection:'column', gap:'18px' }}>

              {/* Firebase Error */}
              {errors.firebase && (
                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⚠</span> {errors.firebase}
                </div>
              )}

              {/* Google */}
              <button id="google-signup-btn" type="button" onClick={handleGoogle} disabled={submitting} className="auth-btn-google" style={{ width:'100%', padding:'13px', borderRadius:'12px', border:'1.5px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.03)', color:'#e2e8f0', fontSize:'15px', fontWeight:600, cursor:submitting ? 'not-allowed' : 'pointer', fontFamily:"'Space Grotesk', sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', transition:'all 0.2s', opacity: submitting ? 0.7 : 1 }}>
                <GoogleIcon />
                Continue with Google
              </button>

              {/* Divider */}
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ flex:1, height:'1px', background:'rgba(139,92,246,0.15)' }} />
                <span style={{ color:'#334155', fontSize:'13px', fontWeight:500 }}>or create with email</span>
                <div style={{ flex:1, height:'1px', background:'rgba(139,92,246,0.15)' }} />
              </div>

              {/* Full Name */}
              <div>
                <label style={{ display:'block', color:'#94a3b8', fontSize:'13px', fontWeight:600, marginBottom:'8px', letterSpacing:'0.02em' }}>FULL NAME</label>
                <input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); if (touched.name) setErrors(er => ({ ...er, name: valName(e.target.value) })) }}
                  onBlur={() => handleBlur('name', name)}
                  placeholder="Jane Doe"
                  className={`auth-input${touched.name && errors.name ? ' error' : ''}`}
                  style={inputStyle('name')}
                  autoComplete="name"
                />
                {touched.name && errors.name && <div style={{ color:'#ef4444', fontSize:'12px', marginTop:'6px', display:'flex', alignItems:'center', gap:'5px' }}><span>⚠</span> {errors.name}</div>}
              </div>

              {/* Email */}
              <div>
                <label style={{ display:'block', color:'#94a3b8', fontSize:'13px', fontWeight:600, marginBottom:'8px', letterSpacing:'0.02em' }}>EMAIL ADDRESS</label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (touched.email) setErrors(er => ({ ...er, email: valEmail(e.target.value) })) }}
                  onBlur={() => handleBlur('email', email)}
                  placeholder="you@example.com"
                  className={`auth-input${touched.email && errors.email ? ' error' : ''}`}
                  style={inputStyle('email')}
                  autoComplete="email"
                />
                {touched.email && errors.email && <div style={{ color:'#ef4444', fontSize:'12px', marginTop:'6px', display:'flex', alignItems:'center', gap:'5px' }}><span>⚠</span> {errors.email}</div>}
              </div>

              {/* Password */}
              <div>
                <label style={{ display:'block', color:'#94a3b8', fontSize:'13px', fontWeight:600, marginBottom:'8px', letterSpacing:'0.02em' }}>PASSWORD</label>
                <div style={{ position:'relative' }}>
                  <input
                    id="signup-password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); if (touched.password) setErrors(er => ({ ...er, password: valPassword(e.target.value) })) }}
                    onBlur={() => handleBlur('password', password)}
                    placeholder="Min. 8 characters"
                    className={`auth-input${touched.password && errors.password ? ' error' : ''}`}
                    style={{ ...inputStyle('password'), paddingRight:'48px' }}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)} className="show-pw" style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#475569', fontSize:'18px', padding:'2px', transition:'color 0.2s', lineHeight:1 }}>
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>
                {touched.password && errors.password && <div style={{ color:'#ef4444', fontSize:'12px', marginTop:'6px', display:'flex', alignItems:'center', gap:'5px' }}><span>⚠</span> {errors.password}</div>}

                {/* Strength meter */}
                {password && (
                  <div style={{ marginTop:'10px' }}>
                    <div style={{ display:'flex', gap:'4px', marginBottom:'5px' }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{ flex:1, height:'3px', borderRadius:'2px', background: i <= strength.score ? strength.color : 'rgba(30,41,59,0.8)', transition:'background 0.3s' }} />
                      ))}
                    </div>
                    {strength.label && (
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontSize:'11px', color:'#475569' }}>Password strength</span>
                        <span style={{ fontSize:'11px', fontWeight:700, color: strength.color }}>{strength.label}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display:'block', color:'#94a3b8', fontSize:'13px', fontWeight:600, marginBottom:'8px', letterSpacing:'0.02em' }}>CONFIRM PASSWORD</label>
                <div style={{ position:'relative' }}>
                  <input
                    id="signup-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); if (touched.confirm) setErrors(er => ({ ...er, confirm: valConfirm(e.target.value, password) })) }}
                    onBlur={() => handleBlur('confirm', confirm)}
                    placeholder="Repeat your password"
                    className={`auth-input${touched.confirm && errors.confirm ? ' error' : ''}`}
                    style={{ ...inputStyle('confirm'), paddingRight:'48px' }}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowConfirm(s => !s)} className="show-pw" style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#475569', fontSize:'18px', padding:'2px', transition:'color 0.2s', lineHeight:1 }}>
                    {showConfirm ? '🙈' : '👁'}
                  </button>
                </div>
                {touched.confirm && errors.confirm && <div style={{ color:'#ef4444', fontSize:'12px', marginTop:'6px', display:'flex', alignItems:'center', gap:'5px' }}><span>⚠</span> {errors.confirm}</div>}
                {!errors.confirm && confirm && confirm === password && (
                  <div style={{ color:'#10b981', fontSize:'12px', marginTop:'6px', display:'flex', alignItems:'center', gap:'5px' }}>
                    <span>✓</span> Passwords match
                  </div>
                )}
              </div>

              {/* Agree */}
              <div>
                <label style={{ display:'flex', alignItems:'flex-start', gap:'10px', cursor:'pointer', userSelect:'none' }}>
                  <input
                    id="signup-agree"
                    type="checkbox"
                    checked={agree}
                    onChange={e => { setAgree(e.target.checked); setErrors(er => ({ ...er, agree: e.target.checked ? '' : 'You must accept the terms to continue' })) }}
                    className="custom-checkbox"
                  />
                  <span style={{ color:'#64748b', fontSize:'13px', lineHeight:1.6, marginTop:'1px' }}>
                    I agree to DreamScape AI's{' '}
                    <span style={{ color:'#8b5cf6', cursor:'pointer' }}>Terms of Service</span> and{' '}
                    <span style={{ color:'#8b5cf6', cursor:'pointer' }}>Privacy Policy</span>
                  </span>
                </label>
                {touched.agree && errors.agree && <div style={{ color:'#ef4444', fontSize:'12px', marginTop:'6px', display:'flex', alignItems:'center', gap:'5px' }}><span>⚠</span> {errors.agree}</div>}
              </div>

              {/* Submit */}
              <button id="signup-submit-btn" type="submit" disabled={submitting} className="auth-btn-primary" style={{ width:'100%', padding:'15px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg, #8b5cf6, #7c3aed)', color:'#fff', fontSize:'16px', fontWeight:700, cursor:submitting ? 'not-allowed' : 'pointer', fontFamily:"'Space Grotesk', sans-serif", boxShadow:'0 0 30px rgba(139,92,246,0.35)', transition:'all 0.2s', opacity: submitting ? 0.8 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
                {submitting ? (
                  <>
                    <span style={{ width:'18px', height:'18px', border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }} />
                    Creating account…
                  </>
                ) : 'Create Account ✦'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
