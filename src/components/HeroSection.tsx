export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden animated-gradient"
    >
      {/* Radial glow orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Left — Text */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="fade-in-up inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-indigo-300 text-sm font-medium tracking-wide">
                Now in Early Access
              </span>
            </div>

            <h1 className="fade-in-up fade-in-up-delay-1 text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight text-white mb-6">
              Dream it.{' '}
              <span className="gradient-text">Generate it.</span>
              <br />
              <span className="text-slate-300">Own it.</span>
            </h1>

            <p className="fade-in-up fade-in-up-delay-2 text-lg sm:text-xl text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10">
              DreamScape AI transforms your imagination into breathtaking visuals, immersive stories,
              and interactive worlds — powered by state-of-the-art generative AI.
            </p>

            {/* CTA Buttons */}
            <div className="fade-in-up fade-in-up-delay-3 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                id="hero-cta-primary"
                className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 active:translate-y-0"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                Start Creating Free
              </button>

              <button
                id="hero-cta-secondary"
                className="inline-flex items-center gap-2.5 glass hover:bg-white/8 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 hover:-translate-y-1"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
                </svg>
                Watch Demo
              </button>
            </div>

            {/* Social proof */}
            <div className="fade-in-up mt-10 flex items-center gap-4 justify-center lg:justify-start">
              <div className="flex -space-x-2.5">
                {['#818cf8', '#a78bfa', '#c084fc', '#f472b6'].map((color, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-surface-900 flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: color }}
                  >
                    {['A', 'B', 'C', 'D'][i]}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="text-white font-semibold">12,000+</span>
                <span className="text-slate-500 ml-1">dreamers already creating</span>
              </div>
            </div>
          </div>

          {/* Right — Illustration */}
          <div className="flex-1 flex items-center justify-center w-full overflow-visible">
            <div className="relative w-full max-w-lg">
              {/* Main card */}
              <div className="relative glass rounded-3xl p-1.5 glow-brand">
                <div className="rounded-[22px] overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 aspect-[4/3]">
                  {/* Simulated AI canvas */}
                  <div className="w-full h-full relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-purple-700/20 to-transparent" />
                    <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                      <div className="flex gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-500/70" />
                        <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                        <span className="w-3 h-3 rounded-full bg-green-500/70" />
                      </div>
                      <span className="text-xs text-slate-500 font-mono">dreamscape.ai/canvas</span>
                    </div>
                    {/* Orbs inside card */}
                    <div className="absolute w-32 h-32 bg-indigo-500/40 rounded-full blur-2xl top-16 left-12" />
                    <div className="absolute w-24 h-24 bg-purple-500/40 rounded-full blur-2xl bottom-16 right-12" />
                    <div className="absolute w-16 h-16 bg-pink-500/30 rounded-full blur-xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

                    <div className="relative text-center px-8">
                      <p className="text-slate-400 text-sm font-mono mb-3">Generating dreamscape…</p>
                      <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mx-auto">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          style={{ width: '72%' }}
                        />
                      </div>
                      <p className="text-slate-600 text-xs font-mono mt-2">72% complete</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 glass rounded-2xl px-4 py-2.5 shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 text-lg">✨</span>
                  <div>
                    <p className="text-white text-xs font-semibold">AI-Powered</p>
                    <p className="text-slate-500 text-xs">Real-time generation</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 glass rounded-2xl px-4 py-2.5 shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-lg">🎨</span>
                  <div>
                    <p className="text-white text-xs font-semibold">Unlimited Styles</p>
                    <p className="text-slate-500 text-xs">Any aesthetic, yours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <span className="text-slate-500 text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-slate-500 to-transparent animate-pulse" />
      </div>
    </section>
  )
}
