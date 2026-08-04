import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Bell, LayoutGrid, LineChart, MousePointer2, Package, Palette,
  Ruler, Search, ShieldCheck, Table2, Tag, TextCursorInput, Type,
} from 'lucide-react'
import {
  Drawer, EmptyState, PatientAvatar, ProgressBar, ProgressRing, Sparkline,
  StatCard, StatusChip, Tabs,
} from '../ui'
import './ds.css'

/* The gallery renders LIVE values: every hex shown is read from the running
   tokens.css at mount, so this page cannot drift from the code. */

const RAMPS: { name: string; steps: string[]; note: string }[] = [
  { name: 'orange', steps: ['600', '500', '400', '300', '200', '100'], note: 'Primary. 500 = the one primary action; hover 600; pressed 300 fill with 600 ink.' },
  { name: 'teal', steps: ['600', '500', '400', '300', '200', '100'], note: 'Secondary. Links, selection, sidebar; 100 is the app canvas.' },
  { name: 'gray', steps: ['600', '500', '400', '300', '200', '100'], note: 'Neutrals. 600/500/400 are ink; light steps re-struck cool for the teal canvas.' },
  { name: 'green', steps: ['300', '200', '100'], note: 'Sentiment · success. 300 is icon/border only — never text.' },
  { name: 'yellow', steps: ['300', '200', '100'], note: 'Sentiment · warning. 300 is icon/border only — never text.' },
  { name: 'red', steps: ['300', '200', '100'], note: 'Sentiment · error. 300 is icon/border only — never text.' },
]

const ALIASES: { token: string; role: string; dark?: boolean; ring?: boolean }[] = [
  { token: '--canvas', role: 'App background (teal 100)' },
  { token: '--surface', role: 'Cards — always pure white' },
  { token: '--surface-sunken', role: 'Inner panels (white; hairlines separate)' },
  { token: '--ink-strong', role: 'Headings' },
  { token: '--ink', role: 'Body text' },
  { token: '--ink-soft', role: 'Secondary text' },
  { token: '--line', role: 'Hairlines' },
  { token: '--line-strong', role: 'Input borders' },
  { token: '--accent', role: 'THE primary action (orange 500)' },
  { token: '--accent-hover', role: 'Primary hover (orange 600)' },
  { token: '--link', role: 'Links (teal 500)' },
  { token: '--status-good', role: 'Success icon/border' },
  { token: '--status-warn', role: 'Readable warning ink' },
  { token: '--status-bad', role: 'Error icon/border' },
  { token: '--sidebar-bg', role: 'Dark teal shell panel', dark: true },
  { token: '--focus-ring', role: 'Focus visible everywhere', ring: true },
  { token: '--viz-1', role: 'Chart series 1 (validated pair)' },
  { token: '--viz-2', role: 'Chart series 2 (validated pair)' },
]

const SECTIONS = [
  { id: 'colour', label: 'Colour', icon: Palette },
  { id: 'type', label: 'Typography', icon: Type },
  { id: 'space', label: 'Space · radius · elevation', icon: Ruler },
  { id: 'buttons', label: 'Buttons', icon: MousePointer2 },
  { id: 'chips', label: 'Chips & status', icon: Tag },
  { id: 'kit', label: 'Kit components', icon: Package },
  { id: 'forms', label: 'Forms', icon: TextCursorInput },
  { id: 'tables', label: 'Tables', icon: Table2 },
  { id: 'patterns', label: 'Layout patterns', icon: LayoutGrid },
  { id: 'viz', label: 'Data visualisation', icon: LineChart },
]

function useLiveTokens(): (token: string) => string {
  const cache = useMemo(() => {
    const style = getComputedStyle(document.documentElement)
    return (token: string) => style.getPropertyValue(token).trim() || '—'
  }, [])
  return cache
}

export default function DesignSystemScreen() {
  const resolve = useLiveTokens()
  const [active, setActive] = useState('colour')
  const [tab, setTab] = useState('overview')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('.ds-section[id]'))
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) setActive(visible[0].target.id)
      },
      { rootMargin: '0px 0px -75% 0px' },
    )
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const jump = (id: string) => {
    // Instant scrolling only — smooth silently no-ops on this app's scrollers.
    document.getElementById(id)?.scrollIntoView({ block: 'start' })
  }

  return (
    <div className="ds-page">
      <header className="ds-header">
        <div className="ds-header-brand">
          <img src="/logomark-orange.png" alt="" aria-hidden />
          <div>
            <div className="ds-header-title">Design system</div>
            <div className="ds-header-sub">
              Care Indeed Home Health EHR · living reference for tokens, components and patterns
            </div>
          </div>
        </div>
        <Link className="btn btn-teal btn-sm" to="/today">
          <ArrowLeft size={14} strokeWidth={2.25} aria-hidden />
          Back to the EHR
        </Link>
      </header>

      <div className="ds-banner" role="note">
        <ShieldCheck size={15} strokeWidth={2} aria-hidden />
        Every colour value on this page is read from the live tokens.css at load, and every
        component is a real instance from src/ui — the gallery cannot drift from the code.
      </div>

      <div className="ds-scroll">
        <div className="ds-shell">
          <nav className="ds-nav" aria-label="On this page">
            <div className="ds-nav-kicker">On this page</div>
            <ul className="ds-nav-list">
              {SECTIONS.map(s => (
                <li key={s.id}>
                  <button
                    className={'ds-nav-link' + (active === s.id ? ' is-active' : '')}
                    onClick={() => jump(s.id)}
                  >
                    <span className="ds-nav-dot" aria-hidden />
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ds-main" ref={mainRef}>
            {/* ---------- 1 · Colour ---------- */}
            <section className="ds-section" id="colour">
              <div className="ds-section-head">
                <span className="ds-section-icon"><Palette size={17} strokeWidth={1.75} aria-hidden /></span>
                <div>
                  <h2 className="ds-section-title">Colour</h2>
                  <p className="ds-section-sub">
                    Orange is the single primary action. Teal is secondary, links and the shell.
                    Sentiment green/yellow/red appears only on status. There is no blue in this brand.
                  </p>
                </div>
              </div>
              <div className="ds-section-body">
                <div className="ds-ramp-grid">
                  {RAMPS.map(ramp => (
                    <div className="card card-pad" key={ramp.name}>
                      <span className="ds-code ds-ramp-name">--{ramp.name}-*</span>
                      <div className="ds-swatch-row">
                        {ramp.steps.map(step => {
                          const token = `--${ramp.name}-${step}`
                          return (
                            <div className="ds-swatch" key={token}>
                              <span className="ds-swatch-tile" style={{ background: `var(${token})` }} aria-hidden />
                              <div className="ds-swatch-meta">
                                <span className="ds-code">{token}</span>
                                <span className="ds-swatch-hex">{resolve(token)}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <p className="ds-swatch-note">{ramp.note}</p>
                    </div>
                  ))}
                </div>

                <div className="ds-alias-block">
                  <p className="ds-alias-lead">
                    Screens never use ramp primitives directly for roles — they use these aliases,
                    so a retune stays a one-file change.
                  </p>
                  <div className="card ds-alias-table-wrap">
                    <table className="table ds-alias-table">
                      <thead>
                        <tr><th>Alias</th><th>Swatch</th><th>Resolves to</th><th>Role</th></tr>
                      </thead>
                      <tbody>
                        {ALIASES.map(a => (
                          <tr key={a.token}>
                            <td><span className="ds-code">{a.token}</span></td>
                            <td>
                              {a.ring ? (
                                <span className="ds-alias-ring-demo" aria-hidden />
                              ) : a.dark ? (
                                <span className="ds-alias-tile ds-alias-tile-dark" aria-hidden>
                                  <span className="ds-alias-tile-dot" style={{ background: 'var(--orange-400)' }} />
                                </span>
                              ) : (
                                <span className="ds-alias-tile" style={{ background: `var(${a.token})` }} aria-hidden />
                              )}
                            </td>
                            <td><span className="ds-alias-chain">{resolve(a.token)}</span></td>
                            <td><span className="ds-alias-note">{a.role}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* ---------- 2 · Typography ---------- */}
            <section className="ds-section" id="type">
              <div className="ds-section-head">
                <span className="ds-section-icon"><Type size={17} strokeWidth={1.75} aria-hidden /></span>
                <div>
                  <h2 className="ds-section-title">Typography</h2>
                  <p className="ds-section-sub">
                    Montserrat medium for headings, Roboto for body. Numbers always take
                    Montserrat with tabular figures so columns align.
                  </p>
                </div>
              </div>
              <div className="ds-section-body">
                <div className="card card-pad ds-type-ladder">
                  <div className="ds-type-row">
                    <div className="ds-type-sample screen-title" style={{ fontSize: 22, lineHeight: '30px' }}>Screen title</div>
                    <div className="ds-type-spec">
                      <span className="ds-type-label">.screen-title</span>
                      <span className="ds-type-note">Montserrat 500 · 22/30 · one per screen</span>
                    </div>
                  </div>
                  <div className="ds-type-row">
                    <div className="ds-type-sample card-title" style={{ fontSize: 17 }}>Card title</div>
                    <div className="ds-type-spec">
                      <span className="ds-type-label">.card-title</span>
                      <span className="ds-type-note">Montserrat 500 · 15–17px</span>
                    </div>
                  </div>
                  <div className="ds-type-row">
                    <div className="ds-type-sample" style={{ fontSize: 14 }}>
                      Body copy carries the clinical detail — Roboto at 13–14px with a 1.5 line height.
                    </div>
                    <div className="ds-type-spec">
                      <span className="ds-type-label">body</span>
                      <span className="ds-type-note">Roboto 400 · 14/21 default, 13.5 in tables</span>
                    </div>
                  </div>
                  <div className="ds-type-row">
                    <div className="ds-type-sample" style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
                      Secondary detail and help text sit one step down and one shade lighter.
                    </div>
                    <div className="ds-type-spec">
                      <span className="ds-type-label">small</span>
                      <span className="ds-type-note">Roboto 400 · 12–12.5px · var(--ink-soft)</span>
                    </div>
                  </div>
                  <div className="ds-type-row">
                    <div className="ds-type-sample card-kicker">Uppercase kicker</div>
                    <div className="ds-type-spec">
                      <span className="ds-type-label">.card-kicker</span>
                      <span className="ds-type-note">10.5px · 500 · 0.09em tracking · labels groups, never sentences</span>
                    </div>
                  </div>
                </div>

                <div className="card card-pad">
                  <div className="ds-tabular-cols">
                    <div className="ds-tabular-col">
                      <span className="ds-tabular-col-title">Numbers — display + tabular</span>
                      <span className="ds-tabular-value" style={{ fontFamily: 'var(--font-display)', fontVariantNumeric: 'tabular-nums' }}>1,024.50</span>
                      <span className="ds-tabular-value" style={{ fontFamily: 'var(--font-display)', fontVariantNumeric: 'tabular-nums' }}>8,111.00</span>
                    </div>
                    <div className="ds-tabular-col">
                      <span className="ds-tabular-col-title">Body font — proportional</span>
                      <span className="ds-tabular-value">1,024.50</span>
                      <span className="ds-tabular-value">8,111.00</span>
                    </div>
                  </div>
                  <p className="ds-tabular-note">
                    Left: <span className="ds-code">font-family: var(--font-display)</span> +{' '}
                    <span className="ds-code">font-variant-numeric: tabular-nums</span> keeps digits
                    on a grid. Right: proportional digits drift — never use them in stat tiles or tables.
                  </p>
                </div>
              </div>
            </section>

            {/* ---------- 3 · Space, radius, elevation ---------- */}
            <section className="ds-section" id="space">
              <div className="ds-section-head">
                <span className="ds-section-icon"><Ruler size={17} strokeWidth={1.75} aria-hidden /></span>
                <div>
                  <h2 className="ds-section-title">Space · radius · elevation</h2>
                  <p className="ds-section-sub">
                    8px rhythm; cards pad 18–20px and sit 14px apart. Radius steps map to component
                    scale; shadows stay soft and cool.
                  </p>
                </div>
              </div>
              <div className="ds-section-body">
                <div className="card card-pad ds-subblock">
                  <span className="card-kicker">Radius</span>
                  <div className="ds-radius-grid">
                    {(['--r-xs', '--r-sm', '--r-md', '--r-lg', '--r-xl', '--r-pill'] as const).map(r => (
                      <div className="ds-radius-cell" key={r}>
                        <span className="ds-radius-box" style={{ borderRadius: `var(${r})` }} aria-hidden />
                        <span className="ds-code">{r}</span>
                        <span className="ds-swatch-hex">{resolve(r)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="ds-note">
                    xs 8 = small controls · sm 12 = inputs, drawers, nav items · md 16 = cards ·
                    lg/xl = hero surfaces · pill = every button and chip.
                  </p>
                </div>
                <div className="card card-pad ds-subblock">
                  <span className="card-kicker">Elevation</span>
                  <div className="ds-shadow-grid">
                    {(['--shadow-1', '--shadow-2', '--shadow-3', '--shadow-pop'] as const).map(s => (
                      <div className="ds-shadow-cell" key={s}>
                        <span className="ds-shadow-card" style={{ boxShadow: `var(${s})` }} aria-hidden />
                        <span className="ds-code">{s}</span>
                      </div>
                    ))}
                  </div>
                  <p className="ds-note">
                    1 = resting cards · 2 = hover lift and the Requirements rail · 3 = rarely, large
                    raised surfaces · pop = drawers, popovers, the palette.
                  </p>
                </div>
                <div className="card card-pad ds-subblock">
                  <span className="card-kicker">Spacing rhythm</span>
                  <div className="ds-space-list">
                    {[4, 8, 12, 14, 20, 24, 32].map(px => (
                      <div className="ds-space-row" key={px}>
                        <span className="ds-space-bar" style={{ width: px * 4 }} aria-hidden />
                        <span className="ds-space-label">{px}px{px === 14 ? ' — gap between cards' : px === 20 ? ' — card padding' : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ---------- 4 · Buttons ---------- */}
            <section className="ds-section" id="buttons">
              <div className="ds-section-head">
                <span className="ds-section-icon"><MousePointer2 size={17} strokeWidth={1.75} aria-hidden /></span>
                <div>
                  <h2 className="ds-section-title">Buttons</h2>
                  <p className="ds-section-sub">
                    Pills, per the CI core-buttons board. One orange primary per screen; teal for
                    secondary emphasis; outline and ghost below that.
                  </p>
                </div>
              </div>
              <div className="ds-section-body">
                <div className="card card-pad">
                  <div className="ds-btn-row">
                    <span className="ds-btn-row-label ds-type-label">Variants</span>
                    <div className="ds-btn-row-items">
                      <button className="btn btn-primary">Primary</button>
                      <button className="btn btn-teal">Teal</button>
                      <button className="btn btn-secondary">Secondary</button>
                      <button className="btn btn-outline-accent">Outline accent</button>
                      <button className="btn btn-ghost">Ghost</button>
                      <button className="btn-inline">Inline action</button>
                    </div>
                  </div>
                  <div className="ds-btn-row">
                    <span className="ds-btn-row-label ds-type-label">Sizes</span>
                    <div className="ds-btn-row-items">
                      <button className="btn btn-primary btn-sm">Small</button>
                      <button className="btn btn-primary">Default</button>
                      <button className="btn btn-primary btn-lg">Large</button>
                    </div>
                  </div>
                  <div className="ds-btn-row">
                    <span className="ds-btn-row-label ds-type-label">States</span>
                    <div className="ds-btn-state-row">
                      <button className="btn btn-primary">Hover me</button>
                      <button className="btn btn-primary" disabled>Disabled</button>
                      <button className="btn btn-secondary">Focus me (Tab)</button>
                    </div>
                  </div>
                  <div className="ds-btn-row">
                    <span className="ds-btn-row-label ds-type-label">Icon buttons</span>
                    <div className="ds-icon-btn-row">
                      <button className="icon-btn" aria-label="Notifications — 3 unread">
                        <Bell size={18} strokeWidth={1.75} />
                        <span className="icon-btn-badge">3</span>
                      </button>
                      <button className="icon-btn" aria-label="Search">
                        <Search size={18} strokeWidth={1.75} />
                      </button>
                      <span className="ds-note" style={{ maxWidth: '38ch' }}>
                        Icon-only buttons always carry an aria-label.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ---------- 5 · Chips & status ---------- */}
            <section className="ds-section" id="chips">
              <div className="ds-section-head">
                <span className="ds-section-icon"><Tag size={17} strokeWidth={1.75} aria-hidden /></span>
                <div>
                  <h2 className="ds-section-title">Chips & status</h2>
                  <p className="ds-section-sub">
                    Chips label; StatusChip judges. Status is never colour alone — every tone pairs
                    an icon with a text label.
                  </p>
                </div>
              </div>
              <div className="ds-section-body">
                <div className="card card-pad ds-subblock">
                  <span className="card-kicker">Chip classes</span>
                  <div className="ds-chip-row">
                    <span className="chip chip-outline">chip-outline</span>
                    <span className="chip chip-brand">chip-brand</span>
                    <span className="chip chip-teal">chip-teal</span>
                    <span className="chip chip-good">chip-good</span>
                    <span className="chip chip-warn">chip-warn</span>
                    <span className="chip chip-bad">chip-bad</span>
                    <span className="chip chip-neutral">chip-neutral</span>
                  </div>
                </div>
                <div className="card card-pad ds-subblock">
                  <span className="card-kicker">StatusChip tones</span>
                  <div className="ds-status-row">
                    <StatusChip tone="good">Signed</StatusChip>
                    <StatusChip tone="warn">Pending signature</StatusChip>
                    <StatusChip tone="bad">Blocked</StatusChip>
                    <StatusChip tone="progress">In progress</StatusChip>
                    <StatusChip tone="neutral">Draft</StatusChip>
                  </div>
                  <p className="ds-note">
                    An incomplete gate is never rendered good/green. When in doubt between warn and
                    bad: bad blocks something downstream, warn needs attention.
                  </p>
                </div>
              </div>
            </section>

            {/* ---------- 6 · Kit components ---------- */}
            <section className="ds-section" id="kit">
              <div className="ds-section-head">
                <span className="ds-section-icon"><Package size={17} strokeWidth={1.75} aria-hidden /></span>
                <div>
                  <h2 className="ds-section-title">Kit components</h2>
                  <p className="ds-section-sub">
                    Live instances from src/ui — reach for these before writing new CSS.
                  </p>
                </div>
              </div>
              <div className="ds-section-body">
                <div className="ds-kit-grid">
                  <StatCard icon={<Package size={16} strokeWidth={1.75} />} kicker="Teal accent" value={<>82<small>%</small></>} sub="With a meter" accent="teal" meter={{ pct: 82 }} />
                  <StatCard icon={<Package size={16} strokeWidth={1.75} />} kicker="Orange accent" value="4" sub="Plain value" accent="orange" />
                  <StatCard icon={<Package size={16} strokeWidth={1.75} />} kicker="Good accent" value={<>11<small> / 13</small></>} sub="Fraction with meter" accent="good" meter={{ pct: 84.6 }} />
                  <StatCard icon={<Package size={16} strokeWidth={1.75} />} kicker="Warn accent" value="0 / 349" sub="A gap shown as a gap" accent="warn" />
                </div>

                <div className="card card-pad ds-subblock">
                  <span className="card-kicker">Progress</span>
                  <div className="ds-progress-demo-row">
                    {[25, 60, 90].map(p => (
                      <div className="ds-progress-demo" key={p}>
                        <ProgressBar pct={p} />
                        <span className="ds-swatch-hex">{p}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="ds-ring-row">
                    <ProgressRing pct={33} size={56} />
                    <ProgressRing pct={66} size={64} />
                    <ProgressRing pct={95} size={72} color="var(--green-300)" />
                  </div>
                </div>

                <div className="card card-pad ds-subblock">
                  <span className="card-kicker">Tabs — interactive</span>
                  <Tabs
                    items={[
                      { key: 'overview', label: 'Overview' },
                      { key: 'details', label: 'Details', count: 4 },
                      { key: 'history', label: 'History', count: 12 },
                    ]}
                    active={tab}
                    onChange={setTab}
                  />
                  <p className="ds-note">Active tab: <span className="ds-code">{tab}</span></p>
                </div>

                <div className="card card-pad ds-subblock">
                  <span className="card-kicker">Avatars</span>
                  <div className="ds-avatar-grid">
                    {(['teal', 'apricot', 'plum', 'sage', 'sand'] as const).map(tone => (
                      <div className="ds-avatar-cell" key={tone}>
                        <PatientAvatar first="Elena" last="Martinez" tone={tone} />
                        <span className="ds-code">{tone}</span>
                      </div>
                    ))}
                    <div className="ds-avatar-cell">
                      <PatientAvatar first="Elena" last="Martinez" tone="teal" size="lg" />
                      <span className="ds-code">lg</span>
                    </div>
                    <div className="ds-avatar-cell">
                      <PatientAvatar first="Elena" last="Martinez" tone="teal" size="sm" />
                      <span className="ds-code">sm</span>
                    </div>
                  </div>
                </div>

                <div className="card card-pad ds-subblock">
                  <span className="card-kicker">Sparkline — always direct-labelled</span>
                  <div className="ds-sparkline-row">
                    <Sparkline points={[88, 90, 86, 92, 95]} label="95%" />
                    <Sparkline points={[3, 2, 4, 2, 1]} color="var(--viz-2)" label="1 MTD" />
                  </div>
                </div>

                <div className="card">
                  <EmptyState
                    icon={<Package size={26} strokeWidth={1.5} />}
                    title="EmptyState"
                    sub="Every filterable view needs one for the zero-results case."
                  />
                </div>

                <div className="card card-pad ds-subblock">
                  <span className="card-kicker">Drawer</span>
                  <div>
                    <button className="btn btn-secondary" onClick={() => setDrawerOpen(true)}>Open drawer demo</button>
                  </div>
                  <Drawer
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    title="Drawer detail"
                    sub="Detail-in-context — keeps the list behind it"
                  >
                    <p style={{ fontSize: 13, lineHeight: 1.6 }}>
                      Use a Drawer for record detail where navigation would lose the user's place —
                      order detail, referral detail, note preview. Close restores the trigger context.
                    </p>
                  </Drawer>
                </div>
              </div>
            </section>

            {/* ---------- 7 · Forms ---------- */}
            <section className="ds-section" id="forms">
              <div className="ds-section-head">
                <span className="ds-section-icon"><TextCursorInput size={17} strokeWidth={1.75} aria-hidden /></span>
                <div>
                  <h2 className="ds-section-title">Forms</h2>
                  <p className="ds-section-sub">
                    The .field pattern from the CI fields board: label above, optional icons, help
                    text below, error state in red with an explanation.
                  </p>
                </div>
              </div>
              <div className="ds-section-body">
                <div className="card card-pad ds-form-grid">
                  <div className="field">
                    <label className="field-label">Default</label>
                    <div className="field-input">
                      <Search size={15} strokeWidth={1.75} aria-hidden />
                      <input placeholder="Placeholder" aria-label="Default demo field" />
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">With help text</label>
                    <div className="field-input">
                      <input placeholder="MRN" aria-label="Help text demo field" />
                    </div>
                    <span className="field-help">Format CI-000000 — help is optional except on errors.</span>
                  </div>
                  <div className="field is-error">
                    <label className="field-label">Error</label>
                    <div className="field-input">
                      <input defaultValue="CI-1042" aria-label="Error demo field" aria-invalid="true" />
                    </div>
                    <span className="field-help">MRN must be six digits — errors always explain the fix.</span>
                  </div>
                  <div className="field">
                    <label className="field-label">Focus (click in)</label>
                    <div className="field-input">
                      <input placeholder="Teal border + ring on focus" aria-label="Focus demo field" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ---------- 8 · Tables ---------- */}
            <section className="ds-section" id="tables">
              <div className="ds-section-head">
                <span className="ds-section-icon"><Table2 size={17} strokeWidth={1.75} aria-hidden /></span>
                <div>
                  <h2 className="ds-section-title">Tables</h2>
                  <p className="ds-section-sub">
                    Tables live inside cards, wrapped in overflow-x auto — the page body never
                    scrolls horizontally.
                  </p>
                </div>
              </div>
              <div className="ds-section-body">
                <div className="card ds-table-card">
                  <div className="ds-table-wrap">
                    <table className="table ds-table">
                      <thead>
                        <tr><th>Order</th><th>Patient</th><th>Due</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        <tr className="is-clickable">
                          <td>Plan of care — initial certification</td>
                          <td>Elena Martinez</td>
                          <td>In 4 hours</td>
                          <td><StatusChip tone="warn">Pending signature</StatusChip></td>
                        </tr>
                        <tr className="is-clickable">
                          <td>BMP + BNP — draw at next visit</td>
                          <td>Walter Feld</td>
                          <td>Aug 5</td>
                          <td><StatusChip tone="progress">Sent</StatusChip></td>
                        </tr>
                        <tr className="is-clickable">
                          <td>PT evaluation and treatment</td>
                          <td>Elena Martinez</td>
                          <td>—</td>
                          <td><StatusChip tone="good">Signed</StatusChip></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* ---------- 9 · Layout patterns ---------- */}
            <section className="ds-section" id="patterns">
              <div className="ds-section-head">
                <span className="ds-section-icon"><LayoutGrid size={17} strokeWidth={1.75} aria-hidden /></span>
                <div>
                  <h2 className="ds-section-title">Layout patterns</h2>
                  <p className="ds-section-sub">
                    Copy these from the screen named on each card rather than reinventing them.
                  </p>
                </div>
              </div>
              <div className="ds-section-body">
                <div className="ds-pattern-grid">
                  <div className="card card-pad">
                    <div className="ds-pattern-title">Stat strip</div>
                    <div className="ds-mini-stats">
                      {[['82%', 'SOC'], ['4', 'Orders'], ['11/13', 'Checks']].map(([v, l]) => (
                        <div className="ds-mini-stat" key={l}>
                          <span className="ds-mini-stat-value">{v}</span>
                          <span className="ds-mini-stat-label">{l}</span>
                        </div>
                      ))}
                    </div>
                    <p className="ds-pattern-note">4-up StatCard grid — copy from today.css (.today-stats).</p>
                  </div>
                  <div className="card card-pad">
                    <div className="ds-pattern-title">Card grid</div>
                    <div className="ds-mini-cardgrid">
                      {[1, 2, 3, 4, 5, 6].map(n => <span className="ds-mini-card" key={n}>{n}</span>)}
                    </div>
                    <p className="ds-pattern-note">repeat(auto-fill, minmax(…)) — copy from rep.css / today.css (.visit-strip).</p>
                  </div>
                  <div className="card card-pad">
                    <div className="ds-pattern-title">Content + rail</div>
                    <div className="ds-mini-twocol">
                      <div className="ds-mini-main">main</div>
                      <div className="ds-mini-rail">rail</div>
                    </div>
                    <p className="ds-pattern-note">Two-column with fixed rail — copy from today.css (.today-columns) or sched.css.</p>
                  </div>
                  <div className="card card-pad">
                    <div className="ds-pattern-title">Kanban board</div>
                    <div className="ds-mini-kanban">
                      {['New', 'Verify'].map(col => (
                        <div className="ds-mini-kanban-col" key={col}>
                          <span className="ds-mini-kanban-head">{col}</span>
                          <span className="ds-mini-kanban-card">Card</span>
                        </div>
                      ))}
                    </div>
                    <p className="ds-pattern-note">Stage columns — copy from intake.css (.intake-column*) or req.css sprint board.</p>
                  </div>
                  <div className="card card-pad">
                    <div className="ds-pattern-title">Filter chip row</div>
                    <div className="ds-mini-filter-row">
                      <span className="ds-mini-filter-chip is-active">All <span className="ds-mini-filter-count">8</span></span>
                      <span className="ds-mini-filter-chip">High risk <span className="ds-mini-filter-count">3</span></span>
                    </div>
                    <p className="ds-pattern-note">Client-side filters with live counts — copy from pts.css (.pts-chip*).</p>
                  </div>
                  <div className="card card-pad">
                    <div className="ds-pattern-title">Workspace side nav</div>
                    <div className="ds-mini-twocol">
                      <div className="ds-mini-rail" style={{ background: 'var(--sidebar-bg)', color: 'var(--sidebar-ink-dim)', border: 'none' }}>nav</div>
                      <div className="ds-mini-main">workspace</div>
                    </div>
                    <p className="ds-pattern-note">Full-height dark rail — copy from req.css (.req-rail*).</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ---------- 10 · Data visualisation ---------- */}
            <section className="ds-section" id="viz">
              <div className="ds-section-head">
                <span className="ds-section-icon"><LineChart size={17} strokeWidth={1.75} aria-hidden /></span>
                <div>
                  <h2 className="ds-section-title">Data visualisation</h2>
                  <p className="ds-section-sub">
                    A two-colour system, validated with the six-checks palette validator.
                  </p>
                </div>
              </div>
              <div className="ds-section-body">
                <div className="card card-pad ds-subblock">
                  <div className="ds-viz-row">
                    <div className="ds-viz-swatch">
                      <span className="ds-swatch-tile" style={{ background: 'var(--viz-1)' }} aria-hidden />
                      <span className="ds-code">--viz-1</span>
                      <span className="ds-swatch-hex">{resolve('--viz-1')}</span>
                    </div>
                    <div className="ds-viz-swatch">
                      <span className="ds-swatch-tile" style={{ background: 'var(--viz-2)' }} aria-hidden />
                      <span className="ds-code">--viz-2</span>
                      <span className="ds-swatch-hex">{resolve('--viz-2')}</span>
                    </div>
                    <div className="ds-viz-swatch">
                      <span className="ds-swatch-tile" style={{ background: 'var(--viz-other)' }} aria-hidden />
                      <span className="ds-code">--viz-other</span>
                      <span className="ds-swatch-hex">{resolve('--viz-other')}</span>
                    </div>
                  </div>
                  <p className="ds-note">
                    The pair passes all six checks with a contrast WARN on the teal — which obligates
                    a <strong>direct label on every chart</strong>. More than two series folds into
                    gray “Other” or facets. Sequential data uses the teal ramp light→dark. Never a
                    rainbow, never a dual axis; a legend whenever two or more series share a plot.
                  </p>
                  <div className="ds-sparkline-row">
                    <Sparkline points={[62, 68, 66, 74, 79]} label="79% · series 1" />
                    <Sparkline points={[41, 44, 40, 47, 52]} color="var(--viz-2)" label="52% · series 2" />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
