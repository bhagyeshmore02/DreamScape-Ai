import { useState } from 'react'
import { useRouter } from '../routerContext'

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type NavItem = { id: string; icon: string; label: string; badge?: number }
type StatCard = { icon: string; label: string; value: string; sub: string; color: string; glow: string }
type Project  = { id: number; title: string; style: string; beds: number; baths: number; floors: number; area: string; modified: string; thumb: string; accent: string }
type Activity = { id: number; icon: string; text: string; time: string; color: string }

/* ─────────────────────────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────────────────────────── */
const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    icon: '⊞',  label: 'Dashboard' },
  { id: 'projects',    icon: '📂', label: 'My Projects',       badge: 8 },
  { id: 'create',      icon: '✦',  label: 'Create New Project' },
  { id: 'saved',       icon: '⭐', label: 'Saved Designs',     badge: 3 },
  { id: 'suggestions', icon: '🤖', label: 'AI Suggestions',    badge: 5 },
  { id: 'settings',    icon: '⚙',  label: 'Settings' },
]

const STATS: StatCard[] = [
  { icon: '🏠', label: 'Houses Generated', value: '142',  sub: '+12 this month',   color: '#a78bfa', glow: 'rgba(139,92,246,0.35)' },
  { icon: '📂', label: 'Projects',         value: '38',   sub: '4 active',         color: '#06b6d4', glow: 'rgba(6,182,212,0.35)'  },
  { icon: '⭐', label: 'Saved Designs',    value: '27',   sub: '3 added recently', color: '#f59e0b', glow: 'rgba(245,158,11,0.35)' },
  { icon: '🤖', label: 'AI Suggestions',   value: '215',  sub: '18 unreviewed',    color: '#ec4899', glow: 'rgba(236,72,153,0.35)' },
]

const PROJECTS: Project[] = [
  {
    id: 1, title: 'Modern Villa',   style: 'Contemporary',
    beds: 5, baths: 4, floors: 2, area: '4,200 sq ft', modified: '2 hours ago',
    thumb: '🏛', accent: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
  },
  {
    id: 2, title: 'Luxury Duplex', style: 'Art Deco',
    beds: 6, baths: 5, floors: 2, area: '5,800 sq ft', modified: 'Yesterday',
    thumb: '🏢', accent: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
  },
  {
    id: 3, title: 'Eco Cottage',   style: 'Scandinavian',
    beds: 3, baths: 2, floors: 1, area: '1,650 sq ft', modified: '3 days ago',
    thumb: '🌿', accent: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
  },
]

const ACTIVITY: Activity[] = [
  { id: 1, icon: '✨', text: 'AI optimized kitchen layout in Modern Villa',   time: '10 min ago',  color: '#a78bfa' },
  { id: 2, icon: '📐', text: 'Bedroom enlarged by 18 sq ft in Luxury Duplex', time: '1 hour ago',  color: '#06b6d4' },
  { id: 3, icon: '🌳', text: 'Garden & landscaping added to Eco Cottage',     time: '3 hours ago', color: '#10b981' },
  { id: 4, icon: '💰', text: 'Construction estimate updated — $1.24M total',  time: 'Yesterday',   color: '#f59e0b' },
  { id: 5, icon: '🤖', text: 'AI generated 6 new design variants',            time: '2 days ago',  color: '#ec4899' },
]

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { navigate } = useRouter()
  const [activeNav, setActiveNav]         = useState('dashboard')
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [notifOpen, setNotifOpen]         = useState(false)
  const [profileOpen, setProfileOpen]     = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [hoveredCard, setHoveredCard]     = useState<number | null>(null)
  const [hoveredStat, setHoveredStat]     = useState<number | null>(null)
  const [hoveredNav, setHoveredNav]       = useState<string | null>(null)

  const handleLogout = () => navigate('landing')

  return (
    <div style={S.root}>
      <style>{CSS}</style>

      {/* ══════════════════════ SIDEBAR ══════════════════════ */}
      <aside
        style={{ ...S.sidebar, ...(sidebarOpen ? S.sidebarOpen : {}) }}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div style={S.sidebarOrb} />

        {/* Logo */}
        <div style={S.logoWrap} onClick={() => navigate('landing')}>
          <div style={S.logoIcon}>🏠</div>
          <div style={S.logoTextWrap}>
            <span style={S.logoText}>DreamScape</span>
            <span style={S.logoBadge}>AI</span>
          </div>
        </div>

        <div style={S.sidebarDivider} />
        <p style={S.sidebarLabel}>NAVIGATION</p>

        <nav style={S.nav}>
          {NAV_ITEMS.map(item => {
            const isActive  = activeNav === item.id
            const isHovered = hoveredNav === item.id
            return (
              <button
                key={item.id}
                style={{
                  ...S.navItem,
                  ...(isActive  ? S.navItemActive  : {}),
                  ...(isHovered && !isActive ? S.navItemHover : {}),
                }}
                onClick={() => {
                  if (item.id === 'create') { navigate('create-project'); return }
                  setActiveNav(item.id)
                }}
                onMouseEnter={() => setHoveredNav(item.id)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                {isActive && <div style={S.navActivePill} />}
                <span style={S.navIcon}>{item.icon}</span>
                <span style={S.navLabel}>{item.label}</span>
                {item.badge != null && (
                  <span style={{ ...S.navBadge, ...(isActive ? S.navBadgeActive : {}) }}>
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div style={{ flex: 1 }} />
        <div style={S.sidebarDivider} />

        {/* Upgrade card */}
        <div style={S.upgradeCard} className="upgrade-card">
          <div style={S.upgradeGlow} />
          <p style={S.upgradeTitle}>Upgrade to Pro</p>
          <p style={S.upgradeSub}>Unlock unlimited AI generations &amp; 3D exports</p>
          <button style={S.upgradeBtn} className="upgrade-btn">Upgrade Now ✦</button>
        </div>

        <div style={S.sidebarDivider} />

        <button style={S.logoutBtn} className="logout-btn" onClick={handleLogout}>
          <span style={{ fontSize: '16px' }}>⬡</span>
          <span>Logout</span>
        </button>
      </aside>

      {/* Sidebar toggle (mobile) */}
      <button
        style={S.sidebarToggle}
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(v => !v)}
      >☰</button>

      {/* ══════════════════════ MAIN ══════════════════════ */}
      <main style={S.main}>

        {/* ── TOP BAR ── */}
        <header style={S.topbar}>
          <div style={{ ...S.searchWrap, ...(searchFocused ? S.searchWrapFocus : {}) }}>
            <span style={S.searchIcon}>🔍</span>
            <input
              style={S.searchInput}
              placeholder="Search projects, designs, styles…"
              className="search-input"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <span style={S.searchKbd}>⌘K</span>
          </div>

          <div style={S.topbarRight}>
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                style={S.iconBtn}
                className="icon-btn"
                onClick={() => { setNotifOpen(v => !v); setProfileOpen(false) }}
              >
                🔔
                <span style={S.notifDot} />
              </button>
              {notifOpen && (
                <div style={S.dropdown} className="animate-fadeIn">
                  <p style={S.dropdownTitle}>Notifications</p>
                  {[
                    { icon: '✨', text: 'AI finished optimizing Modern Villa', time: '5m ago' },
                    { icon: '🏠', text: 'New design variant ready to review',  time: '1h ago' },
                    { icon: '💰', text: 'Cost estimate updated to $1.24M',     time: '3h ago' },
                  ].map((n, i) => (
                    <div key={i} style={S.notifItem} className="notif-item">
                      <span style={S.notifIcon}>{n.icon}</span>
                      <div>
                        <p style={S.notifText}>{n.text}</p>
                        <p style={S.notifTime}>{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile */}
            <div style={{ position: 'relative' }}>
              <button
                style={S.avatarBtn}
                className="avatar-btn"
                onClick={() => { setProfileOpen(v => !v); setNotifOpen(false) }}
              >
                <div style={S.avatar}>A</div>
                <div style={S.avatarInfo}>
                  <span style={S.avatarName}>Alex Rivera</span>
                  <span style={S.avatarPlan}>Pro Member</span>
                </div>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>▾</span>
              </button>
              {profileOpen && (
                <div style={{ ...S.dropdown, right: 0, left: 'auto', minWidth: '180px' }} className="animate-fadeIn">
                  {['My Profile', 'Billing', 'Team', 'API Keys'].map(item => (
                    <div key={item} style={S.profileItem} className="notif-item">{item}</div>
                  ))}
                  <div style={S.dropdownDivider} />
                  <div
                    style={{ ...S.profileItem, color: '#f87171' }}
                    className="notif-item"
                    onClick={handleLogout}
                  >Sign out</div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── SCROLLABLE CONTENT ── */}
        <div style={S.content}>
          <div style={S.orb1} />
          <div style={S.orb2} />

          {/* ── WELCOME ── */}
          <section style={S.welcomeSection} className="animate-fadeInUp">
            <div style={S.welcomeText}>
              <div style={S.welcomeBadge}>
                <span style={S.welcomeBadgeDot} />
                AI Engine Online
              </div>
              <h1 style={S.welcomeTitle}>Welcome back, Alex 👋</h1>
              <p style={S.welcomeSub}>
                Continue designing your dream home with AI. Your latest project is 78% complete.
              </p>
              <div style={S.welcomeActions}>
                <button style={S.btnPrimary} className="btn-primary" onClick={() => navigate('create-project')}>
                  <span>✦</span> Create New Project
                </button>
                <button style={S.btnSecondary} className="btn-secondary">
                  <span>▶</span> Continue Last Project
                </button>
              </div>
            </div>
            <div style={S.welcomeVisual}>
              <div style={S.houseCard} className="house-card-float">
                <div style={S.houseCardGlow} />
                <div style={S.houseEmoji}>🏛</div>
                <div style={S.houseCardInfo}>
                  <p style={S.houseCardTitle}>Modern Villa</p>
                  <div style={S.houseProgressWrap}>
                    <div style={S.houseProgressBar}>
                      <div style={S.houseProgressFill} className="progress-fill" />
                    </div>
                    <span style={S.houseProgressPct}>78%</span>
                  </div>
                  <p style={{ ...S.houseCardSub, marginTop: '4px' }}>AI design in progress…</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── STATS ── */}
          <section style={S.statsGrid}>
            {STATS.map((stat, i) => (
              <div
                key={i}
                style={{
                  ...S.statCard,
                  ...(hoveredStat === i
                    ? { ...S.statCardHover, boxShadow: `0 20px 60px ${stat.glow}, 0 4px 24px rgba(0,0,0,0.4)` }
                    : {}),
                }}
                onMouseEnter={() => setHoveredStat(i)}
                onMouseLeave={() => setHoveredStat(null)}
                className="stat-card"
              >
                <div style={S.statCardInner}>
                  <div style={{
                    ...S.statIconWrap,
                    background: stat.glow.replace('0.35', '0.15'),
                    boxShadow: `0 0 20px ${stat.glow}`,
                  }}>
                    <span style={S.statIcon}>{stat.icon}</span>
                  </div>
                  <div>
                    <p style={{ ...S.statValue, color: stat.color }}>{stat.value}</p>
                    <p style={S.statLabel}>{stat.label}</p>
                  </div>
                </div>
                <div style={S.statSub}>
                  <span style={{ color: '#10b981', fontSize: '12px' }}>↑</span>
                  <span style={S.statSubText}>{stat.sub}</span>
                </div>
                <div style={{ ...S.statAccentLine, background: stat.color }} />
              </div>
            ))}
          </section>

          {/* ── BOTTOM GRID ── */}
          <div style={S.bottomGrid}>

            {/* Recent Projects */}
            <section style={S.projectsSection}>
              <div style={S.sectionHeader}>
                <div>
                  <h2 style={S.sectionTitle}>Recent Projects</h2>
                  <p style={S.sectionSub}>Your latest AI-generated house designs</p>
                </div>
                <button style={S.seeAllBtn} className="see-all-btn">View all →</button>
              </div>
              <div style={S.projectsGrid}>
                {PROJECTS.map(proj => (
                  <div
                    key={proj.id}
                    style={{
                      ...S.projectCard,
                      ...(hoveredCard === proj.id ? S.projectCardHover : {}),
                    }}
                    onMouseEnter={() => setHoveredCard(proj.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Thumbnail */}
                    <div style={{ ...S.projectThumb, background: proj.accent }}>
                      <span style={S.projectThumbEmoji}>{proj.thumb}</span>
                      <div style={S.projectThumbOverlay} />
                      <div style={S.projectStyleBadge}>{proj.style}</div>
                    </div>

                    {/* Body */}
                    <div style={S.projectBody}>
                      <div style={S.projectTitleRow}>
                        <h3 style={S.projectTitle}>{proj.title}</h3>
                        <button style={S.projectMenuBtn} className="icon-btn">⋯</button>
                      </div>

                      <div style={S.specsGrid}>
                        {[
                          { icon: '🛏', val: String(proj.beds),   lbl: 'Beds'   },
                          { icon: '🚿', val: String(proj.baths),  lbl: 'Baths'  },
                          { icon: '🏗', val: String(proj.floors), lbl: 'Floors' },
                          { icon: '📐', val: proj.area,            lbl: 'Area'   },
                        ].map(s => (
                          <div key={s.lbl} style={S.spec}>
                            <span style={S.specIcon}>{s.icon}</span>
                            <span style={S.specValue}>{s.val}</span>
                            <span style={S.specLabel}>{s.lbl}</span>
                          </div>
                        ))}
                      </div>

                      <div style={S.projectFooter}>
                        <span style={S.projectModified}>🕐 {proj.modified}</span>
                        <button style={S.openProjectBtn} className="open-project-btn">
                          Open Project →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Right column */}
            <aside style={S.rightColumn}>

              {/* Quick Actions */}
              <div style={S.panel}>
                <div style={S.panelHeader}>
                  <h2 style={S.sectionTitle}>Quick Actions</h2>
                </div>
                <div style={S.quickActionsGrid}>
                  {[
                    { icon: '✦', label: 'Generate House',    desc: 'AI from prompt',   color: '#8b5cf6', glow: 'rgba(139,92,246,0.2)' },
                    { icon: '📥', label: 'Import Floor Plan', desc: 'Upload PDF/DXF',   color: '#06b6d4', glow: 'rgba(6,182,212,0.2)'  },
                    { icon: '⭐', label: 'Saved Projects',    desc: 'View 27 designs',  color: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
                    { icon: '🤖', label: 'AI Suggestions',    desc: '18 waiting',       color: '#ec4899', glow: 'rgba(236,72,153,0.2)' },
                  ].map((qa, i) => (
                    <button key={i} style={S.qaBtn} className="qa-btn">
                      <div style={{ ...S.qaIcon, background: qa.glow, boxShadow: `0 0 16px ${qa.glow}` }}>
                        <span style={{ fontSize: '20px' }}>{qa.icon}</span>
                      </div>
                      <div style={S.qaInfo}>
                        <span style={{ ...S.qaLabel, color: qa.color }}>{qa.label}</span>
                        <span style={S.qaDesc}>{qa.desc}</span>
                      </div>
                      <span style={S.qaArrow}>→</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div style={{ ...S.panel, marginTop: '20px' }}>
                <div style={S.panelHeader}>
                  <h2 style={S.sectionTitle}>Recent Activity</h2>
                  <button style={S.seeAllBtn} className="see-all-btn">All →</button>
                </div>
                <div style={S.activityList}>
                  {ACTIVITY.map((act, idx) => (
                    <div key={act.id} style={S.activityItem}>
                      {idx < ACTIVITY.length - 1 && (
                        <div style={{
                          ...S.activityLine,
                          background: `linear-gradient(to bottom, ${act.color}60, transparent)`,
                        }} />
                      )}
                      <div style={{ ...S.activityDot, background: act.color, boxShadow: `0 0 10px ${act.color}80` }}>
                        <span style={{ fontSize: '10px' }}>{act.icon}</span>
                      </div>
                      <div style={S.activityText}>
                        <p style={S.activityDesc}>{act.text}</p>
                        <p style={S.activityTime}>{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
const S: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    background: '#080b14',
    fontFamily: "'Space Grotesk', sans-serif",
    color: '#f1f5f9',
    position: 'relative',
    overflow: 'hidden',
  },
  sidebar: {
    width: '260px',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0c1020 0%, #080b14 100%)',
    borderRight: '1px solid rgba(139,92,246,0.12)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 50,
    transition: 'transform 0.3s ease',
    overflowY: 'auto',
  },
  sidebarOpen: { transform: 'translateX(0)' },
  sidebarOrb: {
    position: 'absolute',
    width: '300px', height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
    top: '-100px', left: '-100px',
    pointerEvents: 'none',
  },
  logoWrap: {
    display: 'flex', alignItems: 'center', gap: '10px',
    cursor: 'pointer', padding: '4px 8px', borderRadius: '12px',
    transition: 'background 0.2s', position: 'relative', zIndex: 2,
  },
  logoIcon: {
    width: '38px', height: '38px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', boxShadow: '0 0 20px rgba(139,92,246,0.5)', flexShrink: 0,
  },
  logoTextWrap: { display: 'flex', flexDirection: 'column', lineHeight: 1.2 },
  logoText: {
    fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '17px',
    background: 'linear-gradient(135deg, #a78bfa, #67e8f9)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  logoBadge: { fontSize: '10px', fontWeight: 700, color: '#8b5cf6', letterSpacing: '2px' },
  sidebarDivider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent)',
    margin: '16px 0',
  },
  sidebarLabel: {
    fontSize: '10px', fontWeight: 700, color: '#475569',
    letterSpacing: '2px', marginBottom: '8px', paddingLeft: '8px',
  },
  nav: { display: 'flex', flexDirection: 'column', gap: '2px' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '11px 12px', borderRadius: '10px',
    background: 'transparent', border: 'none', color: '#94a3b8',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    textAlign: 'left', width: '100%', transition: 'all 0.2s ease',
    position: 'relative', fontFamily: "'Space Grotesk', sans-serif",
  },
  navItemActive: {
    background: 'rgba(139,92,246,0.15)', color: '#a78bfa',
    border: '1px solid rgba(139,92,246,0.2)',
  },
  navItemHover: { background: 'rgba(139,92,246,0.08)', color: '#c4b5fd' },
  navActivePill: {
    position: 'absolute', left: '-16px', top: '50%',
    transform: 'translateY(-50%)', width: '3px', height: '60%',
    borderRadius: '0 3px 3px 0',
    background: 'linear-gradient(180deg, #8b5cf6, #06b6d4)',
  },
  navIcon: { fontSize: '16px', width: '20px', textAlign: 'center', flexShrink: 0 },
  navLabel: { flex: 1 },
  navBadge: {
    background: 'rgba(139,92,246,0.2)', color: '#a78bfa',
    fontSize: '11px', fontWeight: 700, padding: '2px 7px',
    borderRadius: '20px', border: '1px solid rgba(139,92,246,0.3)',
  },
  navBadgeActive: { background: 'rgba(139,92,246,0.35)', color: '#c4b5fd' },
  upgradeCard: {
    background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(6,182,212,0.1) 100%)',
    border: '1px solid rgba(139,92,246,0.25)', borderRadius: '14px',
    padding: '16px', position: 'relative', overflow: 'hidden', marginBottom: '8px',
  },
  upgradeGlow: {
    position: 'absolute', width: '120px', height: '120px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
    top: '-40px', right: '-40px', pointerEvents: 'none',
  },
  upgradeTitle: { fontSize: '14px', fontWeight: 700, color: '#a78bfa', marginBottom: '4px' },
  upgradeSub: { fontSize: '12px', color: '#64748b', lineHeight: 1.4, marginBottom: '12px' },
  upgradeBtn: {
    width: '100%', padding: '9px',
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    border: 'none', borderRadius: '8px', color: '#fff',
    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif", transition: 'all 0.2s',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '11px 12px', borderRadius: '10px',
    background: 'transparent', border: 'none', color: '#64748b',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
    width: '100%', textAlign: 'left',
    fontFamily: "'Space Grotesk', sans-serif", transition: 'all 0.2s',
  },
  sidebarToggle: {
    display: 'none', position: 'fixed',
    top: '16px', left: '16px', zIndex: 100,
    background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)',
    borderRadius: '8px', color: '#a78bfa', fontSize: '18px',
    padding: '6px 10px', cursor: 'pointer',
  },
  main: {
    flex: 1, marginLeft: '260px',
    display: 'flex', flexDirection: 'column', minHeight: '100vh',
  },
  topbar: {
    position: 'sticky', top: 0, zIndex: 40,
    background: 'rgba(8,11,20,0.85)',
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(139,92,246,0.12)',
    padding: '12px 32px', display: 'flex',
    alignItems: 'center', gap: '16px', justifyContent: 'space-between',
  },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'rgba(15,21,33,0.7)',
    border: '1.5px solid rgba(139,92,246,0.15)', borderRadius: '12px',
    padding: '9px 16px', width: '100%', maxWidth: '480px', transition: 'all 0.2s',
  },
  searchWrapFocus: {
    border: '1.5px solid rgba(139,92,246,0.5)',
    boxShadow: '0 0 0 3px rgba(139,92,246,0.1), 0 0 20px rgba(139,92,246,0.1)',
  },
  searchIcon: { fontSize: '14px', flexShrink: 0, opacity: 0.5 },
  searchInput: {
    background: 'transparent', border: 'none', outline: 'none',
    color: '#f1f5f9', fontSize: '14px',
    fontFamily: "'Space Grotesk', sans-serif", flex: 1, minWidth: 0,
  },
  searchKbd: {
    fontSize: '11px', color: '#475569',
    background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: '5px', padding: '2px 6px', flexShrink: 0,
  },
  topbarRight: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
  iconBtn: {
    width: '40px', height: '40px', borderRadius: '10px',
    background: 'rgba(15,21,33,0.7)', border: '1px solid rgba(139,92,246,0.15)',
    color: '#94a3b8', fontSize: '16px', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
  },
  notifDot: {
    position: 'absolute', top: '8px', right: '8px',
    width: '7px', height: '7px', borderRadius: '50%',
    background: '#ef4444', border: '1.5px solid #080b14',
  },
  avatarBtn: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '6px 12px 6px 6px',
    background: 'rgba(15,21,33,0.7)', border: '1px solid rgba(139,92,246,0.15)',
    borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  avatar: {
    width: '32px', height: '32px', borderRadius: '8px',
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0,
  },
  avatarInfo: { display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.2 },
  avatarName: { fontSize: '13px', fontWeight: 600, color: '#f1f5f9' },
  avatarPlan: { fontSize: '11px', color: '#8b5cf6', fontWeight: 500 },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', right: '0',
    background: 'rgba(12,16,32,0.95)',
    backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(139,92,246,0.2)', borderRadius: '14px',
    padding: '12px', minWidth: '280px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(139,92,246,0.1)',
    zIndex: 200,
  },
  dropdownTitle: {
    fontSize: '13px', fontWeight: 700, color: '#64748b',
    letterSpacing: '0.5px', marginBottom: '8px', paddingLeft: '4px',
  },
  notifItem: {
    display: 'flex', alignItems: 'flex-start', gap: '10px',
    padding: '10px', borderRadius: '10px',
    cursor: 'pointer', transition: 'background 0.2s',
  },
  notifIcon: { fontSize: '18px', flexShrink: 0 },
  notifText: { fontSize: '13px', color: '#e2e8f0', lineHeight: 1.4, marginBottom: '2px' },
  notifTime: { fontSize: '11px', color: '#475569' },
  profileItem: {
    padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', color: '#94a3b8', transition: 'background 0.2s', fontWeight: 500,
  },
  dropdownDivider: { height: '1px', background: 'rgba(139,92,246,0.15)', margin: '6px 0' },
  content: { padding: '32px', flex: 1, position: 'relative' },
  orb1: {
    position: 'fixed', width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
    top: '-200px', right: '-100px', pointerEvents: 'none', zIndex: 0,
  },
  orb2: {
    position: 'fixed', width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)',
    bottom: '-150px', left: '20%', pointerEvents: 'none', zIndex: 0,
  },
  welcomeSection: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(6,182,212,0.04) 100%)',
    border: '1px solid rgba(139,92,246,0.15)', borderRadius: '20px',
    padding: '40px 48px', marginBottom: '28px',
    position: 'relative', overflow: 'hidden', zIndex: 1,
  },
  welcomeText: { flex: 1 },
  welcomeBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: '20px', padding: '4px 12px', fontSize: '12px',
    color: '#10b981', fontWeight: 600, marginBottom: '16px', letterSpacing: '0.3px',
  },
  welcomeBadgeDot: {
    width: '6px', height: '6px', borderRadius: '50%',
    background: '#10b981', display: 'inline-block',
  },
  welcomeTitle: {
    fontFamily: "'Outfit', sans-serif", fontSize: '34px', fontWeight: 800,
    background: 'linear-gradient(135deg, #f1f5f9 0%, #a78bfa 60%, #67e8f9 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    marginBottom: '10px', lineHeight: 1.2,
  },
  welcomeSub: {
    fontSize: '15px', color: '#94a3b8', marginBottom: '28px',
    maxWidth: '420px', lineHeight: 1.6,
  },
  welcomeActions: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '13px 28px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    border: 'none', borderRadius: '12px', color: '#fff',
    fontSize: '14px', fontWeight: 700, cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif", transition: 'all 0.2s',
    boxShadow: '0 0 24px rgba(139,92,246,0.4)',
  },
  btnSecondary: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '13px 24px',
    background: 'rgba(139,92,246,0.1)', border: '1.5px solid rgba(139,92,246,0.3)',
    borderRadius: '12px', color: '#a78bfa',
    fontSize: '14px', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif", transition: 'all 0.2s',
  },
  welcomeVisual: { flexShrink: 0, marginLeft: '40px' },
  houseCard: {
    background: 'rgba(15,21,33,0.8)', border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: '16px', padding: '20px', width: '220px',
    position: 'relative', overflow: 'hidden',
  },
  houseCardGlow: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(6,182,212,0.04) 100%)',
    pointerEvents: 'none',
  },
  houseEmoji: { fontSize: '48px', marginBottom: '12px', display: 'block', textAlign: 'center' },
  houseCardInfo: { position: 'relative', zIndex: 1 },
  houseCardTitle: { fontSize: '15px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' },
  houseCardSub: { fontSize: '12px', color: '#64748b' },
  houseProgressWrap: { display: 'flex', alignItems: 'center', gap: '8px' },
  houseProgressBar: {
    flex: 1, height: '5px',
    background: 'rgba(139,92,246,0.15)', borderRadius: '10px', overflow: 'hidden',
  },
  houseProgressFill: {
    height: '100%', width: '78%',
    background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)', borderRadius: '10px',
  },
  houseProgressPct: { fontSize: '12px', fontWeight: 700, color: '#8b5cf6', flexShrink: 0 },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px', marginBottom: '28px', position: 'relative', zIndex: 1,
  },
  statCard: {
    background: 'rgba(12,16,28,0.9)', border: '1px solid rgba(139,92,246,0.12)',
    borderRadius: '16px', padding: '22px', cursor: 'pointer',
    transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden',
  },
  statCardHover: { transform: 'translateY(-4px)', border: '1px solid rgba(139,92,246,0.3)' },
  statCardInner: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' },
  statIconWrap: {
    width: '48px', height: '48px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  statIcon: { fontSize: '22px' },
  statValue: {
    fontFamily: "'Outfit', sans-serif", fontSize: '30px',
    fontWeight: 800, lineHeight: 1, marginBottom: '2px',
  },
  statLabel: { fontSize: '12px', color: '#64748b', fontWeight: 500 },
  statSub: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#475569' },
  statSubText: { color: '#64748b' },
  statAccentLine: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '2px', opacity: 0.6, transition: 'opacity 0.3s',
  },
  bottomGrid: {
    display: 'grid', gridTemplateColumns: '1fr 340px',
    gap: '20px', position: 'relative', zIndex: 1, alignItems: 'start',
  },
  projectsSection: { display: 'flex', flexDirection: 'column', gap: '16px' },
  sectionHeader: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionTitle: {
    fontFamily: "'Outfit', sans-serif", fontSize: '18px',
    fontWeight: 700, color: '#f1f5f9', marginBottom: '2px',
  },
  sectionSub: { fontSize: '13px', color: '#64748b' },
  seeAllBtn: {
    background: 'transparent', border: 'none', color: '#8b5cf6',
    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif",
    padding: '4px 8px', borderRadius: '6px', transition: 'all 0.2s',
  },
  projectsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px',
  },
  projectCard: {
    background: 'rgba(12,16,28,0.95)', border: '1px solid rgba(139,92,246,0.12)',
    borderRadius: '18px', overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'default',
  },
  projectCardHover: {
    transform: 'translateY(-5px)', border: '1px solid rgba(139,92,246,0.3)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(139,92,246,0.15)',
  },
  projectThumb: {
    height: '140px', position: 'relative',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  projectThumbEmoji: {
    fontSize: '52px',
    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
    position: 'relative', zIndex: 2,
  },
  projectThumbOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to bottom, transparent 50%, rgba(12,16,28,0.8) 100%)',
  },
  projectStyleBadge: {
    position: 'absolute', top: '12px', right: '12px',
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
    padding: '3px 10px', fontSize: '11px', color: '#f1f5f9', fontWeight: 600, zIndex: 3,
  },
  projectBody: { padding: '18px' },
  projectTitleRow: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: '14px',
  },
  projectTitle: {
    fontSize: '16px', fontWeight: 700, color: '#f1f5f9',
    fontFamily: "'Outfit', sans-serif",
  },
  projectMenuBtn: {
    background: 'transparent', border: 'none', color: '#475569',
    fontSize: '18px', cursor: 'pointer', padding: '0 4px', transition: 'color 0.2s',
  },
  specsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px',
  },
  spec: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.1)',
    borderRadius: '10px', padding: '8px 4px', gap: '2px',
  },
  specIcon: { fontSize: '14px' },
  specValue: { fontSize: '13px', fontWeight: 700, color: '#e2e8f0', lineHeight: 1 },
  specLabel: { fontSize: '10px', color: '#475569', fontWeight: 500 },
  projectFooter: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: '14px', borderTop: '1px solid rgba(139,92,246,0.1)',
  },
  projectModified: { fontSize: '12px', color: '#475569' },
  openProjectBtn: {
    padding: '7px 14px', background: 'rgba(139,92,246,0.15)',
    border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px',
    color: '#a78bfa', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif", transition: 'all 0.2s',
  },
  rightColumn: { display: 'flex', flexDirection: 'column' },
  panel: {
    background: 'rgba(12,16,28,0.95)', border: '1px solid rgba(139,92,246,0.12)',
    borderRadius: '18px', padding: '20px',
  },
  panelHeader: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: '16px',
  },
  quickActionsGrid: { display: 'flex', flexDirection: 'column', gap: '8px' },
  qaBtn: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
    background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.1)',
    borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
    fontFamily: "'Space Grotesk', sans-serif", width: '100%', textAlign: 'left',
  },
  qaIcon: {
    width: '40px', height: '40px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  qaInfo: { display: 'flex', flexDirection: 'column', gap: '1px', flex: 1 },
  qaLabel: { fontSize: '13px', fontWeight: 700 },
  qaDesc: { fontSize: '11px', color: '#475569' },
  qaArrow: { fontSize: '14px', color: '#475569', transition: 'all 0.2s' },
  activityList: { display: 'flex', flexDirection: 'column', gap: '0' },
  activityItem: {
    display: 'flex', alignItems: 'flex-start', gap: '12px',
    padding: '10px 0', position: 'relative',
  },
  activityLine: {
    position: 'absolute', left: '16px', top: '36px',
    width: '2px', height: 'calc(100% - 4px)', zIndex: 0,
  },
  activityDot: {
    width: '32px', height: '32px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, position: 'relative', zIndex: 1,
  },
  activityText: { flex: 1, paddingTop: '4px' },
  activityDesc: { fontSize: '13px', color: '#cbd5e1', lineHeight: 1.4, marginBottom: '3px' },
  activityTime: { fontSize: '11px', color: '#475569' },
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

  @keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
  @keyframes fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes houseFloat { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
  @keyframes shimmerSlide { 0%{background-position:-200% center} 100%{background-position:200% center} }

  .animate-fadeInUp { animation: fadeInUp 0.7s ease-out forwards; }
  .animate-fadeIn   { animation: fadeIn   0.2s ease-out forwards; }
  .house-card-float { animation: houseFloat 5s ease-in-out infinite; }
  .progress-fill    { animation: progressGrow 1.2s ease-out forwards 0.4s; width:0%; }
  @keyframes progressGrow { from{width:0%} to{width:78%} }

  .search-input::placeholder { color: #475569; }

  .btn-primary:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 0 40px rgba(139,92,246,0.6) !important;
    background: linear-gradient(135deg, #9d6ef8 0%, #8b5cf6 100%) !important;
  }
  .btn-secondary:hover {
    background: rgba(139,92,246,0.18) !important;
    border-color: rgba(139,92,246,0.5) !important;
  }
  .icon-btn:hover {
    background: rgba(139,92,246,0.15) !important;
    border-color: rgba(139,92,246,0.35) !important;
    color: #a78bfa !important;
  }
  .avatar-btn:hover {
    background: rgba(139,92,246,0.12) !important;
    border-color: rgba(139,92,246,0.35) !important;
  }
  .notif-item:hover { background: rgba(139,92,246,0.08) !important; }
  .qa-btn:hover {
    background: rgba(139,92,246,0.1) !important;
    border-color: rgba(139,92,246,0.25) !important;
    transform: translateX(3px);
  }
  .open-project-btn:hover {
    background: rgba(139,92,246,0.3) !important;
    border-color: rgba(139,92,246,0.5) !important;
    transform: translateX(2px);
  }
  .upgrade-btn:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(139,92,246,0.4);
  }
  .logout-btn:hover {
    background: rgba(239,68,68,0.08) !important;
    color: #f87171 !important;
  }
  .see-all-btn:hover { background: rgba(139,92,246,0.1) !important; }

  .upgrade-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(110deg, transparent 30%, rgba(139,92,246,0.08) 50%, transparent 70%);
    background-size: 200% auto;
    animation: shimmerSlide 4s linear infinite;
    border-radius: 14px;
    pointer-events: none;
  }

  @media (max-width: 1200px) {
    .bottom-grid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 900px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .welcome-section { flex-direction: column !important; }
    .welcome-visual { margin-left: 0 !important; margin-top: 24px !important; }
  }
  @media (max-width: 768px) {
    .ds-sidebar { transform: translateX(-100%) !important; }
    .ds-sidebar.open { transform: translateX(0) !important; }
    .ds-sidebar-toggle { display: flex !important; }
    .ds-main { margin-left: 0 !important; }
  }
  @media (max-width: 520px) {
    .stats-grid { grid-template-columns: 1fr 1fr !important; }
    .projects-grid { grid-template-columns: 1fr !important; }
    .content { padding: 16px !important; }
  }
`
