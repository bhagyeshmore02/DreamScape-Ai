import { useState, type FormEvent } from 'react'
import { useRouter } from '../routerContext'
import { sendPasswordResetEmail, type AuthError } from 'firebase/auth'
import { auth } from '../firebase'

function valEmail(v: string) {
  if (!v) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address'
  return ''
}

export default function ForgotPasswordPage() {
  const { navigate } = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const err = valEmail(email)
    setError(err)
    setTouched(true)
    if (err) return
    setSubmitting(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setSent(true)
    } catch (err) {
      const error = err as AuthError
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#080b14', fontFamily:"'Space Grotesk', sans-serif", padding:'32px 20px', position:'relative', overflow:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-glow { 0%,100%{opacity:.4} 50%{opacity:.8} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes shimmer { 0%{background-position:0% center} 100%{background-position:200% center} }

        .fp-input:focus {
          border-color:rgba(139,92,246,0.6) !important;
          box-shadow:0 0 0 3px rgba(139,92,246,0.12) !important;
          outline:none;
        }
        .fp-input.error:focus {
          border-color:rgba(239,68,68,0.6) !important;
          box-shadow:0 0 0 3px rgba(239,68,68,0.1) !important;
        }
        .fp-btn:hover:not(:disabled) {
          transform:translateY(-1px);
          box-shadow:0 0 40px rgba(139,92,246,0.5) !important;
          background:linear-gradient(135deg, #9d6ef8, #8b5cf6) !important;
        }
        .fp-back:hover { color:#a78bfa !important; }

        .fp-card {
          padding: 48px 44px;
        }
        @media (max-width: 600px) {
          .fp-card {
            padding: 28px 18px !important;
            border-radius: 20px !important;
          }
        }
      `}</style>

      {/* Background orbs */}
      <div style={{ position:'absolute', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', top:'-200px', left:'-200px', pointerEvents:'none', animation:'pulse-glow 6s ease-in-out infinite' }} />
      <div style={{ position:'absolute', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', bottom:'-150px', right:'-150px', pointerEvents:'none', animation:'pulse-glow 8s ease-in-out infinite 2s' }} />
      {/* Grid */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)', backgroundSize:'60px 60px', pointerEvents:'none' }} />

      {/* Card */}
      <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:'460px', animation:'fadeInUp 0.7s ease-out forwards' }}>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginBottom:'40px', cursor:'pointer' }} onClick={() => navigate('landing')}>
          <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'linear-gradient(135deg, #8b5cf6, #06b6d4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', boxShadow:'0 0 20px rgba(139,92,246,0.4)' }}>✦</div>
          <span style={{ fontFamily:"'Outfit', sans-serif", fontWeight:800, fontSize:'20px', background:'linear-gradient(135deg, #a78bfa, #67e8f9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>DreamScape AI</span>
        </div>

        <div className="fp-card" style={{ background:'rgba(15,21,33,0.8)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', border:'1px solid rgba(139,92,246,0.18)', borderRadius:'24px', boxShadow:'0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.05)' }}>

          {sent ? (
            /* Success state */
            <div style={{ textAlign:'center' }}>
              {/* Animated envelope */}
              <div style={{ width:'80px', height:'80px', borderRadius:'20px', background:'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))', border:'1px solid rgba(139,92,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'36px', margin:'0 auto 24px', animation:'float 3s ease-in-out infinite' }}>
                📧
              </div>
              <h2 style={{ fontFamily:"'Outfit', sans-serif", fontSize:'26px', fontWeight:900, color:'#f1f5f9', marginBottom:'12px' }}>Check your email</h2>
              <p style={{ color:'#94a3b8', fontSize:'15px', lineHeight:1.7, marginBottom:'8px' }}>
                We've sent password reset instructions to
              </p>
              <p style={{ color:'#a78bfa', fontSize:'15px', fontWeight:600, marginBottom:'28px' }}>{email}</p>
              <p style={{ color:'#475569', fontSize:'13px', lineHeight:1.6, marginBottom:'32px' }}>
                Didn't receive it? Check your spam folder or{' '}
                <button onClick={() => setSent(false)} style={{ background:'none', border:'none', padding:0, color:'#8b5cf6', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:"'Space Grotesk', sans-serif" }} className="fp-back">
                  try again
                </button>
              </p>
              <button
                id="fp-back-login-btn"
                onClick={() => navigate('login')}
                style={{ width:'100%', padding:'14px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg, #8b5cf6, #7c3aed)', color:'#fff', fontSize:'15px', fontWeight:700, cursor:'pointer', fontFamily:"'Space Grotesk', sans-serif", boxShadow:'0 0 24px rgba(139,92,246,0.35)', transition:'all 0.2s' }}
                className="fp-btn"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              {/* Icon */}
              <div style={{ width:'64px', height:'64px', borderRadius:'16px', background:'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.15))', border:'1px solid rgba(139,92,246,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', marginBottom:'24px' }}>
                🔑
              </div>

              <h1 style={{ fontFamily:"'Outfit', sans-serif", fontSize:'28px', fontWeight:900, color:'#f1f5f9', marginBottom:'8px' }}>Forgot password?</h1>
              <p style={{ color:'#64748b', fontSize:'14px', lineHeight:1.7, marginBottom:'32px' }}>
                No worries — enter your email and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} noValidate style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
                <div>
                  <label style={{ display:'block', color:'#94a3b8', fontSize:'13px', fontWeight:600, marginBottom:'8px', letterSpacing:'0.02em' }}>EMAIL ADDRESS</label>
                  <input
                    id="fp-email"
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (touched) setError(valEmail(e.target.value)) }}
                    onBlur={() => { setTouched(true); setError(valEmail(email)) }}
                    placeholder="you@example.com"
                    className={`fp-input${touched && error ? ' error' : ''}`}
                    style={{
                      width:'100%',
                      padding:'13px 16px',
                      borderRadius:'12px',
                      border:`1.5px solid ${touched && error ? 'rgba(239,68,68,0.6)' : 'rgba(139,92,246,0.2)'}`,
                      background:'rgba(15,21,33,0.7)',
                      color:'#f1f5f9',
                      fontSize:'16px',
                      fontFamily:"'Space Grotesk', sans-serif",
                      transition:'border-color 0.2s, box-shadow 0.2s',
                      boxSizing:'border-box',
                    }}
                    autoComplete="email"
                    autoFocus
                  />
                  {touched && error && (
                    <div style={{ color:'#ef4444', fontSize:'12px', marginTop:'6px', display:'flex', alignItems:'center', gap:'5px' }}>
                      <span>⚠</span> {error}
                    </div>
                  )}
                </div>

                <button
                  id="fp-submit-btn"
                  type="submit"
                  disabled={submitting}
                  className="fp-btn"
                  style={{ width:'100%', padding:'15px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg, #8b5cf6, #7c3aed)', color:'#fff', fontSize:'16px', fontWeight:700, cursor:submitting ? 'not-allowed' : 'pointer', fontFamily:"'Space Grotesk', sans-serif", boxShadow:'0 0 28px rgba(139,92,246,0.35)', transition:'all 0.2s', opacity: submitting ? 0.8 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}
                >
                  {submitting ? (
                    <>
                      <span style={{ width:'18px', height:'18px', border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }} />
                      Sending link…
                    </>
                  ) : 'Send Reset Link ✦'}
                </button>

                {/* Divider */}
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ flex:1, height:'1px', background:'rgba(139,92,246,0.12)' }} />
                </div>

                {/* Back */}
                <button
                  id="fp-back-btn"
                  type="button"
                  onClick={() => navigate('login')}
                  className="fp-back"
                  style={{ background:'none', border:'none', padding:'10px', color:'#475569', fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:"'Space Grotesk', sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'color 0.2s', borderRadius:'10px' }}
                >
                  ← Back to Sign In
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer note */}
        <p style={{ textAlign:'center', color:'#1e293b', fontSize:'12px', marginTop:'24px' }}>
          Remember your password?{' '}
          <span style={{ color:'#334155', cursor:'pointer' }} onClick={() => navigate('login')}>Sign In</span>
          {' · '}
          <span style={{ color:'#334155', cursor:'pointer' }} onClick={() => navigate('signup')}>Create account</span>
        </p>
      </div>
    </div>
  )
}
