import { useState, useMemo, type ReactNode, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShieldCheck, Layers, Cpu, AlertTriangle, GitBranch,
  Cloud, DollarSign, ListChecks, AlertOctagon, Award, Sparkles,
  CheckCircle2, XCircle, Lock, Eye, Server, Building2, Activity,
} from 'lucide-react';

/* ═════════════════════════════════════════════════════════════════
   Brad 2.0 — Executive Project Proposal
   Premium, glassmorphic, executive-grade single-view dashboard.
   Accessed via hidden double-click trigger on iAdministrator page.
   ═════════════════════════════════════════════════════════════════ */

// ── Brand tokens (Care Indeed Design System) ────────────────────
const T = {
  orange:      '#C74601',
  orangeDark:  '#421700',
  orangeSoft:  '#FFE7D7',
  teal:        '#007970',
  tealDark:    '#004142',
  tealSoft:    '#D4ECEA',
  charcoal:    '#1F1C1B',
  gray:        '#52404B',
  graySoft:    '#E5E4E3',
  surface:     '#FAFBF8',
  white:       '#FFFFFF',
  success:     '#008540',
  warning:     '#FFC700',
  error:       '#D70101',
  head:        "'Outfit', 'Montserrat', system-ui, sans-serif",
  mono:        "'JetBrains Mono', monospace",
  body:        "'Roboto', system-ui, sans-serif",
};

type SectionId =
  | 'summary' | 'problem' | 'solution' | 'differentiators' | 'architecture'
  | 'security' | 'saas-reality' | 'cost' | 'implementation' | 'risk'
  | 'recommendation' | 'closing';

interface Section {
  id: SectionId;
  num: string;
  title: string;
  icon: typeof ShieldCheck;
}

const SECTIONS: Section[] = [
  { id: 'summary',         num: '01', title: 'Executive Summary',     icon: Sparkles },
  { id: 'problem',         num: '02', title: 'Problem Statement',     icon: AlertTriangle },
  { id: 'solution',        num: '03', title: 'Solution Overview',     icon: Cpu },
  { id: 'differentiators', num: '04', title: 'Key Differentiators',   icon: Award },
  { id: 'architecture',    num: '05', title: 'Architecture Strategy', icon: Layers },
  { id: 'security',        num: '06', title: 'Security & Compliance', icon: ShieldCheck },
  { id: 'saas-reality',    num: '07', title: 'SaaS Reality',          icon: Cloud },
  { id: 'cost',            num: '08', title: 'Cost & Value',          icon: DollarSign },
  { id: 'implementation',  num: '09', title: 'Implementation Plan',   icon: ListChecks },
  { id: 'risk',            num: '10', title: 'Risk & Mitigation',     icon: AlertOctagon },
  { id: 'recommendation',  num: '11', title: 'Recommendation',        icon: GitBranch },
  { id: 'closing',         num: '12', title: 'Closing Statement',     icon: Building2 },
];

export function BradProposalPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState<SectionId>('summary');
  const section = useMemo(() => SECTIONS.find(s => s.id === active)!, [active]);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        background: `radial-gradient(circle at 15% 0%, ${T.orangeSoft}55 0%, transparent 45%),
                     radial-gradient(circle at 85% 100%, ${T.tealSoft}66 0%, transparent 50%),
                     linear-gradient(180deg, ${T.surface} 0%, #F1F2EE 100%)`,
        fontFamily: T.body,
        color: T.charcoal,
      }}
    >
      {/* Decorative glass orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full"
          style={{ background: `radial-gradient(circle, ${T.teal}22 0%, transparent 70%)`, filter: 'blur(40px)' }} />
        <div className="absolute -bottom-32 -right-20 w-[520px] h-[520px] rounded-full"
          style={{ background: `radial-gradient(circle, ${T.orange}1a 0%, transparent 70%)`, filter: 'blur(60px)' }} />
      </div>

      <div className="relative h-full flex flex-col">
        {/* ── Top bar ─────────────────────────────────────────── */}
        <header className="flex items-center justify-between px-8 py-4 border-b"
          style={{ borderColor: `${T.graySoft}cc`, background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(18px)' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/iadministrator')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-[0.18em] transition-all hover:bg-white/80"
              style={{ color: T.gray, fontFamily: T.mono, border: `1px solid ${T.graySoft}` }}
            >
              <ArrowLeft size={13} strokeWidth={2.2} /> Return
            </button>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: T.teal, fontFamily: T.mono }}>
                Confidential · Board Proposal
              </span>
              <span className="text-[18px] font-bold" style={{ fontFamily: T.head, color: T.charcoal, letterSpacing: '-0.01em' }}>
                Brad 2.0 — Business Risk &amp; Analytics Director
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Pill color={T.teal} bg={T.tealSoft} icon={<CheckCircle2 size={12} />}>100/100 Validated</Pill>
            <Pill color={T.orange} bg={T.orangeSoft} icon={<Lock size={12} />}>Self-Hosted</Pill>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: T.charcoal, color: T.white, fontFamily: T.mono }}>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Care Indeed</span>
            </div>
          </div>
        </header>

        {/* ── Main grid: nav rail + content ────────────────────── */}
        <main className="flex-1 grid min-h-0" style={{ gridTemplateColumns: '260px 1fr' }}>
          {/* Section rail */}
          <nav className="px-5 py-6 overflow-y-auto custom-scrollbar border-r"
            style={{ borderColor: `${T.graySoft}88`, background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(14px)' }}>
            <div className="text-[9px] font-bold uppercase tracking-[0.3em] mb-3 px-2"
              style={{ color: T.gray, fontFamily: T.mono }}>
              Proposal Index
            </div>
            <ul className="space-y-1">
              {SECTIONS.map(s => {
                const Icon = s.icon;
                const isActive = active === s.id;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => setActive(s.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                      style={{
                        background: isActive ? T.white : 'transparent',
                        border: `1px solid ${isActive ? T.graySoft : 'transparent'}`,
                        boxShadow: isActive ? '0 8px 24px -12px rgba(31,28,27,0.18)' : 'none',
                      }}
                    >
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg"
                        style={{ background: isActive ? T.orange : T.graySoft + '88', color: isActive ? T.white : T.gray }}>
                        <Icon size={13} strokeWidth={2.2} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[9px] font-bold uppercase tracking-[0.18em]"
                          style={{ color: isActive ? T.orange : T.gray, fontFamily: T.mono }}>{s.num}</span>
                        <span className="block text-[12.5px] font-semibold truncate"
                          style={{ color: isActive ? T.charcoal : T.gray, fontFamily: T.head }}>{s.title}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Standing theme card */}
            <div className="mt-6 p-4 rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${T.charcoal} 0%, ${T.tealDark} 100%)`,
                color: T.white,
                boxShadow: '0 20px 40px -20px rgba(0,65,66,0.6)',
              }}>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} style={{ color: T.warning }} />
                <span className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ fontFamily: T.mono, color: T.warning }}>
                  Operating Principle
                </span>
              </div>
              <p className="text-[11.5px] leading-relaxed" style={{ color: '#EDEDED' }}>
                <strong style={{ color: T.white }}>HIPAA-eligible ≠ HIPAA compliant.</strong>
                <br/>SaaS reduces operational burden — not regulatory liability. Misconfiguration in any architecture is the organization&apos;s responsibility.
              </p>
            </div>
          </nav>

          {/* Content panel */}
          <section className="overflow-hidden flex flex-col">
            <div className="px-10 py-6 flex items-end justify-between border-b"
              style={{ borderColor: `${T.graySoft}66` }}>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em]"
                    style={{ color: T.orange, fontFamily: T.mono }}>Section {section.num}</span>
                  <span className="h-px w-8" style={{ background: T.orange }} />
                </div>
                <h1 className="text-[28px] font-bold tracking-tight" style={{ fontFamily: T.head, color: T.charcoal }}>
                  {section.title}
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-[0.24em]"
                style={{ color: T.gray, fontFamily: T.mono }}>
                <span>v1.0</span><span>·</span><span>Apr 2026</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-10 py-6">
              <SectionContent id={active} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   Section content router
   ═════════════════════════════════════════════════════════════════ */
function SectionContent({ id }: { id: SectionId }) {
  switch (id) {
    case 'summary':         return <SummaryView />;
    case 'problem':         return <ProblemView />;
    case 'solution':        return <SolutionView />;
    case 'differentiators': return <DifferentiatorsView />;
    case 'architecture':    return <ArchitectureView />;
    case 'security':        return <SecurityView />;
    case 'saas-reality':    return <SaasRealityView />;
    case 'cost':            return <CostView />;
    case 'implementation':  return <ImplementationView />;
    case 'risk':            return <RiskView />;
    case 'recommendation':  return <RecommendationView />;
    case 'closing':         return <ClosingView />;
  }
}

/* ─── 01 Executive Summary ──────────────────────────────────── */
function SummaryView() {
  return (
    <div className="grid grid-cols-12 gap-5 h-full">
      <GlassCard className="col-span-12 lg:col-span-8 p-7">
        <Eyebrow>What Brad 2.0 Is</Eyebrow>
        <h2 className="text-[26px] font-bold leading-tight mb-3" style={{ fontFamily: T.head, color: T.charcoal }}>
          A self-hosted AI platform for compliance, clinical risk, and operational intelligence — built for home health, owned by Care Indeed.
        </h2>
        <p className="text-[14px] leading-relaxed mb-5" style={{ color: T.gray }}>
          Brad 2.0 unifies chart review, QAPI, PIP support, and policy training inside an environment Care Indeed
          operates end-to-end. PHI never leaves the building. Every action is auditable. Every model behavior is bounded.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <Metric label="Validation Iterations" value="247" sub="simulated attacks" />
          <Metric label="Final Pass Run" value="100/100" sub="consecutive scenarios" accent />
          <Metric label="PHI Exposure Events" value="0" sub="across all runs" />
        </div>
      </GlassCard>

      <GlassCard className="col-span-12 lg:col-span-4 p-6 flex flex-col">
        <Eyebrow color={T.teal}>Decision</Eyebrow>
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-[44px] font-extrabold leading-none mb-2"
            style={{ fontFamily: T.head, color: T.teal, letterSpacing: '-0.02em' }}>GO</div>
          <p className="text-[13px] font-semibold mb-3" style={{ color: T.charcoal }}>
            Self-hosted Brad 2.0 as the primary system.
          </p>
          <p className="text-[12px] leading-relaxed" style={{ color: T.gray }}>
            Conditional on the operational regime: 1.0 FTE DevSecOps, 0.25 FTE HIPAA Security Officer,
            quarterly drills, monthly access reviews.
          </p>
        </div>
      </GlassCard>

      <CalloutCard
        className="col-span-12"
        tone="critical"
        title="The single most important sentence in this proposal"
        body="In every architecture evaluated, Care Indeed remains the Covered Entity. SaaS reduces operational labor; it does not transfer regulatory accountability. HIPAA-eligibility is a vendor checkbox. HIPAA compliance is an organizational practice."
      />
    </div>
  );
}

/* ─── 02 Problem Statement ──────────────────────────────────── */
function ProblemView() {
  const misconceptions = [
    { wrong: 'Vendor signed a BAA, so we are covered.', right: 'A BAA defines boundaries. It does not absolve misconfiguration or misuse.' },
    { wrong: 'HIPAA-eligible SKU = HIPAA-compliant deployment.', right: 'Eligibility is a checkbox. Compliance is a configuration + practice.' },
    { wrong: 'A vendor breach is the vendor\'s problem.', right: 'Patient breach notice is signed by Care Indeed, regardless of root cause.' },
    { wrong: 'Default terms protect our PHI.', right: 'Default terms may permit derived or de-identified use unless explicitly restricted.' },
  ];

  return (
    <div className="grid grid-cols-12 gap-5">
      <GlassCard className="col-span-12 lg:col-span-7 p-7">
        <Eyebrow>The Compliance Reality</Eyebrow>
        <h2 className="text-[22px] font-bold mb-3" style={{ fontFamily: T.head }}>
          Compliance is achieved through implementation — not vendor selection.
        </h2>
        <p className="text-[13.5px] leading-relaxed mb-4" style={{ color: T.gray }}>
          Healthcare leaders frequently inherit the assumption that purchasing a HIPAA-eligible product
          satisfies regulatory obligation. It does not. Most real-world breaches in modern healthcare
          stem not from vendor failure but from <strong style={{ color: T.charcoal }}>customer-side
          misconfiguration</strong>: open sharing, over-broad scopes, unmanaged endpoints, unmonitored AI behaviors.
        </p>
        <div className="space-y-2">
          {misconceptions.map((m, i) => (
            <div key={i} className="grid grid-cols-2 gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.55)', border: `1px solid ${T.graySoft}` }}>
              <div className="flex items-start gap-2">
                <XCircle size={14} style={{ color: T.error, marginTop: 2, flexShrink: 0 }} />
                <span className="text-[12px]" style={{ color: T.gray }}><span className="line-through">{m.wrong}</span></span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} style={{ color: T.success, marginTop: 2, flexShrink: 0 }} />
                <span className="text-[12px] font-semibold" style={{ color: T.charcoal }}>{m.right}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="col-span-12 lg:col-span-5 grid gap-5">
        <CalloutCard tone="warning"
          title="Default terms may allow derived or de-identified data use"
          body="Vendors are not selling PHI. But many master agreements permit de-identified or derived data use unless explicitly restricted. Care Indeed must read, negotiate, and document carve-outs." />
        <CalloutCard tone="critical"
          title="Misconfiguration = full organizational liability"
          body="Outside of supported architecture, there is no shared responsibility. The error is yours. The breach is yours. The notification is yours." />
      </div>
    </div>
  );
}

/* ─── 03 Solution Overview ──────────────────────────────────── */
function SolutionView() {
  return (
    <div className="grid grid-cols-12 gap-5">
      <GlassCard className="col-span-12 lg:col-span-5 p-7">
        <Eyebrow color={T.teal}>What Brad 2.0 Does</Eyebrow>
        <ul className="space-y-3 mt-3">
          {[
            ['Chart Review', 'AI-assisted analysis of charts with citations to chart sections and policy clauses.'],
            ['QAPI & PIP', 'Surface deficiencies, draft action plans, route to two-person approval.'],
            ['Policy Training', 'Grounded retrieval from internal policies — no hallucinated clinical guidance.'],
            ['Audit & Governance', 'Hash-chained, tamper-evident audit log of every PHI access and AI output.'],
          ].map(([h, p]) => (
            <li key={h} className="flex gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0"
                style={{ background: T.tealSoft, color: T.teal }}>
                <CheckCircle2 size={14} />
              </span>
              <div>
                <div className="text-[13px] font-bold" style={{ fontFamily: T.head, color: T.charcoal }}>{h}</div>
                <div className="text-[12px]" style={{ color: T.gray }}>{p}</div>
              </div>
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard className="col-span-12 lg:col-span-7 p-7">
        <Eyebrow>How It Works</Eyebrow>
        <h3 className="text-[18px] font-bold mb-4" style={{ fontFamily: T.head }}>Eight zones, one perimeter, zero leakage.</h3>
        <FlowChain steps={[
          { label: 'User',         note: 'OIDC + FIDO2',    icon: Eye },
          { label: 'Edge / VPN',   note: 'WireGuard',       icon: Lock },
          { label: 'App + Auth',   note: 'OPA + 2-person',  icon: ShieldCheck },
          { label: 'Inference',    note: 'Local LLM, isolated workers', icon: Cpu },
          { label: 'PHI Store',    note: 'Encrypted at rest', icon: Server },
          { label: 'Audit (WORM)', note: 'Hash-chained',    icon: Activity },
        ]} />
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Metric label="Security Zones" value="8" sub="+ isolated NPHI" />
          <Metric label="Controls Mapped" value="84" sub="HIPAA + SOC 2" accent />
          <Metric label="External Surface" value="1" sub="VPN endpoint" />
        </div>
      </GlassCard>
    </div>
  );
}

/* ─── 04 Differentiators ────────────────────────────────────── */
function DifferentiatorsView() {
  const diffs = [
    { icon: Lock,       title: 'Zero Secondary Data Use',  body: 'No vendor model training, no derived analytics, no de-identified telemetry — by design, not by negotiation.' },
    { icon: Server,     title: 'Full Control of PHI',      body: 'PHI never crosses the perimeter. Storage, inference, and audit are physically inside Care Indeed.' },
    { icon: Activity,   title: 'Audit-Ready Architecture', body: 'Every access, every output, every approval is hash-chained and offline-anchored hourly.' },
    { icon: ShieldCheck, title: 'Validated Security Model', body: '247 simulated attack iterations. 4 root-cause-driven restarts. Final 100/100 consecutive pass.' },
  ];
  return (
    <div className="grid grid-cols-12 gap-5">
      {diffs.map((d, i) => (
        <GlassCard key={i} className="col-span-6 p-6 hover:scale-[1.01] transition-transform">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ background: i % 2 === 0 ? T.orangeSoft : T.tealSoft, color: i % 2 === 0 ? T.orange : T.teal }}>
              <d.icon size={18} strokeWidth={2.2} />
            </span>
            <h3 className="text-[16px] font-bold" style={{ fontFamily: T.head }}>{d.title}</h3>
          </div>
          <p className="text-[12.5px] leading-relaxed" style={{ color: T.gray }}>{d.body}</p>
        </GlassCard>
      ))}
      <CalloutCard className="col-span-12" tone="success"
        title="Control vs Convenience — the strategic tradeoff"
        body="SaaS optimizes for convenience. Brad 2.0 optimizes for control, certainty, and auditability. In regulated healthcare, control is the strategic moat." />
    </div>
  );
}

/* ─── 05 Architecture Strategy ──────────────────────────────── */
function ArchitectureView() {
  return (
    <div className="grid grid-cols-12 gap-5">
      <GlassCard className="col-span-12 lg:col-span-7 p-7">
        <Eyebrow>Hybrid Pattern</Eyebrow>
        <h3 className="text-[20px] font-bold mb-4" style={{ fontFamily: T.head }}>
          Self-hosted core + bounded SaaS adjacencies.
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <ZonePanel
            title="PHI Side — Self-Hosted"
            tone="primary"
            items={['Chart Review', 'QAPI & PIP', 'Clinical Training', 'Audit · SIEM · Backup']}
          />
          <ZonePanel
            title="Z-NPHI — Permitted SaaS"
            tone="secondary"
            items={['Marketing (No PHI)', 'HR / Payroll', 'GRC Tooling', 'Public Training']}
          />
        </div>
        <div className="mt-4 p-4 rounded-xl text-center"
          style={{ background: `repeating-linear-gradient(135deg, ${T.graySoft}66 0px, ${T.graySoft}66 6px, transparent 6px, transparent 12px)`,
                   border: `1px dashed ${T.gray}` }}>
          <span className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: T.charcoal, fontFamily: T.mono }}>
            DLP-enforced gap · No PHI crosses · No SaaS reaches in
          </span>
        </div>
      </GlassCard>

      <div className="col-span-12 lg:col-span-5 grid gap-5">
        <CalloutCard tone="info"
          title="Why hybrid, not pure-SaaS"
          body="Pure-SaaS replacement increases 5-year cost, increases customization friction, and does not reduce HIPAA accountability. Hybrid keeps PHI close while letting SaaS handle non-PHI overhead." />
        <CalloutCard tone="critical"
          title="Outside the supported pattern = full liability"
          body="Putting PHI into a non-eligible SKU, an AppExchange add-on without an independent BAA, or a preview/lab feature flips full responsibility to Care Indeed." />
      </div>
    </div>
  );
}

/* ─── 06 Security & Compliance ──────────────────────────────── */
function SecurityView() {
  const passes = [
    { code: 'I-12', t: 'GPU VRAM remanence (canary tripped)', status: 'patched' },
    { code: 'I-31', t: 'Approval race condition (2 reviewers, same key)', status: 'patched' },
    { code: 'I-48', t: 'Backup operator prune attempt',           status: 'patched' },
    { code: 'I-56', t: 'Reverse proxy %2f admin bypass',          status: 'patched' },
  ];

  return (
    <div className="grid grid-cols-12 gap-5">
      <GlassCard className="col-span-12 lg:col-span-5 p-7">
        <Eyebrow>Validation</Eyebrow>
        <h3 className="text-[20px] font-bold mb-4" style={{ fontFamily: T.head }}>247 attempts. 4 fixes. 100 consecutive passes.</h3>
        <SimDonut passed={100} failed={0} restarts={4} />
        <p className="text-[12px] mt-4 leading-relaxed" style={{ color: T.gray }}>
          Each failure was treated as a forcing function: full root cause, patched control, re-baseline, and full re-run.
          The final 100/100 sequence stood on top of every prior fix.
        </p>
      </GlassCard>

      <GlassCard className="col-span-12 lg:col-span-7 p-7">
        <Eyebrow color={T.teal}>Restart Events</Eyebrow>
        <div className="space-y-2 mt-3">
          {passes.map(p => (
            <div key={p.code} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.7)', border: `1px solid ${T.graySoft}` }}>
              <span className="text-[10px] font-bold px-2 py-1 rounded"
                style={{ background: T.charcoal, color: T.warning, fontFamily: T.mono, letterSpacing: '0.1em' }}>
                {p.code}
              </span>
              <span className="text-[12.5px] flex-1" style={{ color: T.charcoal }}>{p.t}</span>
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: T.success, fontFamily: T.mono }}>
                <CheckCircle2 size={12} /> {p.status}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Metric label="Critical Findings" value="0" sub="residual" accent />
          <Metric label="Controls Mapped" value="84" sub="HIPAA + SOC 2" />
          <Metric label="Audit Retention" value="7 yr" sub="WORM + chain" />
        </div>
      </GlassCard>
    </div>
  );
}

/* ─── 07 SaaS Reality ───────────────────────────────────────── */
function SaasRealityView() {
  const rows = [
    ['Operational labor',     'Heavy', 'Moderate', 'Lower',  'Lowest'],
    ['HIPAA accountability',  'Full',  'Full',     'Full',   'Full'],
    ['PHI control',           'Maximum','Limited', 'Strong (if configured)', 'Minimal'],
    ['Customization',         'Maximum','Bounded', 'Maximum','Minimal'],
    ['Vendor lock-in',        'None',  'Severe',  'Moderate','Severe'],
    ['Time to deploy',        'Months','Weeks-mo','Months', 'Weeks'],
    ['5-yr cost @100 users',  '~$1.35M','~$5.5M', '~$4.8M', '~$7.4M'],
  ];
  return (
    <div className="grid grid-cols-12 gap-5">
      <GlassCard className="col-span-12 p-6">
        <Eyebrow>Honest Comparison</Eyebrow>
        <h3 className="text-[18px] font-bold mb-4" style={{ fontFamily: T.head }}>SaaS has real benefits — and real boundaries.</h3>
        <div className="overflow-hidden rounded-xl" style={{ border: `1px solid ${T.graySoft}` }}>
          <table className="w-full text-left text-[12px]">
            <thead style={{ background: T.charcoal, color: T.white }}>
              <tr>
                <th className="px-4 py-2.5 font-bold uppercase tracking-[0.14em] text-[10px]" style={{ fontFamily: T.mono }}>Dimension</th>
                <th className="px-4 py-2.5 font-bold uppercase tracking-[0.14em] text-[10px]" style={{ fontFamily: T.mono, color: T.warning }}>Self-Hosted</th>
                <th className="px-4 py-2.5 font-bold uppercase tracking-[0.14em] text-[10px]" style={{ fontFamily: T.mono }}>Salesforce</th>
                <th className="px-4 py-2.5 font-bold uppercase tracking-[0.14em] text-[10px]" style={{ fontFamily: T.mono }}>Azure HIPAA</th>
                <th className="px-4 py-2.5 font-bold uppercase tracking-[0.14em] text-[10px]" style={{ fontFamily: T.mono }}>Vertical SaaS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ background: i % 2 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.85)' }}>
                  <td className="px-4 py-2.5 font-semibold" style={{ color: T.charcoal }}>{r[0]}</td>
                  <td className="px-4 py-2.5 font-bold" style={{ color: T.teal }}>{r[1]}</td>
                  <td className="px-4 py-2.5" style={{ color: T.gray }}>{r[2]}</td>
                  <td className="px-4 py-2.5" style={{ color: T.gray }}>{r[3]}</td>
                  <td className="px-4 py-2.5" style={{ color: T.gray }}>{r[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <CalloutCard className="col-span-12" tone="warning"
        title="Vendor does NOT remove liability"
        body="Across all three SaaS architectures evaluated, HIPAA accountability remains 100% with Care Indeed. SaaS shifts where the work happens — never who answers for the breach." />
    </div>
  );
}

/* ─── 08 Cost & Value ───────────────────────────────────────── */
function CostView() {
  const data = [
    { label: 'Self-Hosted',  value: 1.35, color: T.teal },
    { label: 'Azure HIPAA',  value: 4.8,  color: T.gray },
    { label: 'Salesforce',   value: 5.5,  color: T.gray },
    { label: 'Vertical SaaS',value: 7.4,  color: T.gray },
  ];
  const max = 8;
  return (
    <div className="grid grid-cols-12 gap-5">
      <GlassCard className="col-span-12 lg:col-span-7 p-7">
        <Eyebrow>5-Year Total Cost of Ownership · 100 Users</Eyebrow>
        <h3 className="text-[20px] font-bold mb-5" style={{ fontFamily: T.head }}>Self-hosted is 2–4× cheaper at scale.</h3>
        <div className="space-y-3">
          {data.map(d => (
            <div key={d.label}>
              <div className="flex justify-between text-[11.5px] font-semibold mb-1" style={{ color: T.charcoal }}>
                <span>{d.label}</span>
                <span style={{ color: d.color, fontFamily: T.mono }}>${d.value.toFixed(2)}M</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: T.graySoft }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(d.value / max) * 100}%`,
                           background: `linear-gradient(90deg, ${d.color}, ${d.color}cc)` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] mt-4" style={{ color: T.gray }}>
          Includes loaded labor, hardware amortization, software, audit, and operations. Excludes breach cost (born by Care Indeed in all cases).
        </p>
      </GlassCard>

      <div className="col-span-12 lg:col-span-5 grid gap-5">
        <GlassCard className="p-6">
          <Eyebrow color={T.teal}>Long-Term Advantage</Eyebrow>
          <ul className="space-y-2.5 mt-3">
            {[
              ['Cost predictability', 'Fixed amortization + ops, not per-action AI fees.'],
              ['No vendor repricing', 'Care Indeed sets the budget envelope.'],
              ['No data exit cost',   'Termination cost = $0; data is already yours.'],
              ['Capability accrues',  'Every sprint compounds — no rebuy.'],
            ].map(([h, p]) => (
              <li key={h} className="flex gap-2 text-[12px]">
                <CheckCircle2 size={14} style={{ color: T.success, marginTop: 2, flexShrink: 0 }} />
                <span><strong style={{ color: T.charcoal }}>{h}.</strong> <span style={{ color: T.gray }}>{p}</span></span>
              </li>
            ))}
          </ul>
        </GlassCard>
        <CalloutCard tone="info"
          title="Cost is the easiest thing to get wrong"
          body="SaaS line items look small until you add admins, vendor risk management, data extraction tooling, and per-action AI fees. The only free thing in any architecture is the false assumption that the BAA absolves you." />
      </div>
    </div>
  );
}

/* ─── 09 Implementation Plan ────────────────────────────────── */
function ImplementationView() {
  const sprints = [
    { n: '01', t: 'Foundations',         w: 'Architecture lock, infra provisioning, BAAs, risk analysis' },
    { n: '02', t: 'Identity & Network',  w: 'OIDC + FIDO2, RBAC, VPN, conditional access, key vault' },
    { n: '03', t: 'Data + Audit Pipeline', w: 'CMK, WORM hash-chain, DLP, SIEM ingestion, backup' },
    { n: '04', t: 'App + Inference',     w: 'Brad API skeleton, OPA, vLLM workers, end-to-end review' },
    { n: '05', t: 'Approval Engine',     w: '2-person rule, DB constraints, property tests, break-glass' },
    { n: '06', t: 'Detection & Response',w: 'SIEM rules, on-call, IR runbook, tabletop, drift reconcile' },
    { n: '07', t: 'Backup, DR, BC',      w: 'Restore drill, vendor-down workflow, sandbox masking' },
    { n: '08', t: 'Pen Test Pass 1',     w: 'Scenarios 1–50, remediate, re-run to PASS' },
    { n: '09', t: 'Pen Test Pass 2',     w: 'Scenarios 51–100, external pentest, evidence pack' },
    { n: '10', t: 'Go-Live & Sign-off',  w: 'Risk acceptance, training, Go/No-Go, 30-day shadow' },
  ];
  return (
    <div className="grid grid-cols-12 gap-5">
      <GlassCard className="col-span-12 p-7">
        <div className="flex items-end justify-between mb-5">
          <div>
            <Eyebrow>10 Sprints · Disciplined Execution</Eyebrow>
            <h3 className="text-[20px] font-bold" style={{ fontFamily: T.head }}>Each sprint includes its own compliance Definition of Done.</h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.24em]"
            style={{ color: T.gray, fontFamily: T.mono }}>20 weeks · governance-gated</span>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {sprints.map((s, i) => (
            <div key={s.n} className="p-3 rounded-xl transition-all hover:scale-[1.02]"
              style={{
                background: i < 2 ? T.charcoal : i < 7 ? 'rgba(255,255,255,0.85)' : T.tealSoft,
                color: i < 2 ? T.white : T.charcoal,
                border: `1px solid ${i < 2 ? T.charcoal : T.graySoft}`,
                boxShadow: '0 8px 18px -10px rgba(31,28,27,0.12)',
              }}>
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5"
                style={{ color: i < 2 ? T.warning : T.orange, fontFamily: T.mono }}>Sprint {s.n}</div>
              <div className="text-[12px] font-bold mb-1" style={{ fontFamily: T.head }}>{s.t}</div>
              <div className="text-[10.5px] leading-snug" style={{ color: i < 2 ? '#CFCFCF' : T.gray }}>{s.w}</div>
            </div>
          ))}
        </div>
      </GlassCard>
      <CalloutCard className="col-span-12" tone="info"
        title="Shipping the sprint plan does not ship compliance"
        body="A green project board can still represent a non-compliant system if controls were not configured correctly or evidence was not collected. The sprint plan is a scaffold for compliance — not a substitute for it." />
    </div>
  );
}

/* ─── 10 Risk & Mitigation ──────────────────────────────────── */
function RiskView() {
  const risks = [
    { r: 'Loss of operational discipline', l: 'Med', i: 'Critical', m: 'Operational regime + monthly attestations + Go is revoked if cadence slips.' },
    { r: 'Talent gap (DevSecOps / HSO)',   l: 'High',i: 'High',     m: 'Identify partner / contractor backup pre-Sprint 1; cross-train.' },
    { r: 'Insider threat',                  l: 'Low', i: 'Critical', m: '2-person approval, WORM audit, FIDO2 only, quarterly access review.' },
    { r: 'Drift / configuration decay',    l: 'Med', i: 'High',     m: 'Nightly reconcile, drift alerts, GitOps with CAB review.' },
    { r: 'Vendor concentration (Z-NPHI)',  l: 'Low', i: 'Med',      m: 'Quarterly vendor risk re-evaluation; offline workflows documented.' },
    { r: 'Scope creep / off-pattern PHI',  l: 'Med', i: 'Critical', m: 'HSO sign-off required; off-pattern use blocks at policy gate.' },
  ];
  const tone = (v: string) => v === 'Critical' ? T.error : v === 'High' ? T.orange : v === 'Med' ? T.warning : T.success;
  return (
    <div className="grid grid-cols-12 gap-5">
      <GlassCard className="col-span-12 p-6">
        <Eyebrow>Risk Register · Top Six</Eyebrow>
        <div className="overflow-hidden rounded-xl mt-3" style={{ border: `1px solid ${T.graySoft}` }}>
          <table className="w-full text-left text-[12px]">
            <thead style={{ background: 'rgba(31,28,27,0.04)' }}>
              <tr>
                <th className="px-4 py-2.5 font-bold uppercase tracking-[0.14em] text-[10px]" style={{ fontFamily: T.mono, color: T.gray }}>Risk</th>
                <th className="px-3 py-2.5 font-bold uppercase tracking-[0.14em] text-[10px]" style={{ fontFamily: T.mono, color: T.gray }}>Likelihood</th>
                <th className="px-3 py-2.5 font-bold uppercase tracking-[0.14em] text-[10px]" style={{ fontFamily: T.mono, color: T.gray }}>Impact</th>
                <th className="px-4 py-2.5 font-bold uppercase tracking-[0.14em] text-[10px]" style={{ fontFamily: T.mono, color: T.gray }}>Mitigation</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((r, i) => (
                <tr key={i} style={{ background: i % 2 ? 'rgba(255,255,255,0.5)' : 'transparent', borderTop: `1px solid ${T.graySoft}` }}>
                  <td className="px-4 py-3 font-semibold" style={{ color: T.charcoal }}>{r.r}</td>
                  <td className="px-3 py-3"><Chip color={tone(r.l)}>{r.l}</Chip></td>
                  <td className="px-3 py-3"><Chip color={tone(r.i)}>{r.i}</Chip></td>
                  <td className="px-4 py-3" style={{ color: T.gray }}>{r.m}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

/* ─── 11 Recommendation ─────────────────────────────────────── */
function RecommendationView() {
  return (
    <div className="grid grid-cols-12 gap-5">
      <GlassCard className="col-span-12 lg:col-span-7 p-8"
        style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.92) 0%, ${T.tealSoft}aa 100%)` }}>
        <Eyebrow color={T.teal}>Final Recommendation</Eyebrow>
        <h2 className="text-[30px] font-extrabold leading-tight tracking-tight mb-4"
          style={{ fontFamily: T.head, color: T.charcoal }}>
          Adopt Brad 2.0 self-hosted as the primary system. Permit narrow, bounded SaaS only on the Z-NPHI side.
        </h2>
        <div className="space-y-3 mt-5">
          {[
            'Maintain 1.0 FTE DevSecOps + 0.25 FTE HIPAA Security Officer.',
            'Quarterly drills, monthly access reviews, annual external pentest.',
            'HSO sign-off on every change touching PHI or AI behavior.',
            'Annual architecture re-evaluation; SaaS pilot only under documented carve-out.',
          ].map((c, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold flex-shrink-0"
                style={{ background: T.teal, color: T.white, fontFamily: T.mono }}>{i + 1}</span>
              <span className="text-[13px] font-medium" style={{ color: T.charcoal }}>{c}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="col-span-12 lg:col-span-5 grid gap-4">
        <GlassCard className="p-6">
          <Eyebrow>What Would Flip the Recommendation</Eyebrow>
          <ul className="mt-3 space-y-2 text-[12px]" style={{ color: T.gray }}>
            <li>· Care Indeed cannot fund/staff the operational regime</li>
            <li>· Multi-state expansion within 12 months requiring elasticity</li>
            <li>· Ambient documentation becomes the primary clinical value</li>
          </ul>
        </GlassCard>
        <CalloutCard tone="critical"
          title="What never flips the recommendation"
          body="&quot;The vendor handles HIPAA.&quot; &quot;BAA = covered.&quot; &quot;HIPAA-eligible = compliant.&quot; None of these are true. None ever will be." />
      </div>
    </div>
  );
}

/* ─── 12 Closing ────────────────────────────────────────────── */
function ClosingView() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="max-w-3xl text-center px-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
          style={{ background: T.charcoal, color: T.warning, fontFamily: T.mono }}>
          <Sparkles size={12} />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Closing Statement</span>
        </div>
        <h2 className="text-[36px] font-extrabold leading-[1.15] tracking-tight mb-6"
          style={{ fontFamily: T.head, color: T.charcoal, letterSpacing: '-0.02em' }}>
          The hardest part of HIPAA compliance is not technology.
        </h2>
        <p className="text-[17px] leading-relaxed mb-6" style={{ color: T.gray }}>
          It is the discipline to configure it correctly, the integrity to operate it honestly, the courage to log every action,
          and the humility to accept that <strong style={{ color: T.charcoal }}>no vendor can carry that responsibility for us</strong>.
        </p>
        <div className="h-px w-24 mx-auto mb-6" style={{ background: T.orange }} />
        <p className="text-[15px] font-semibold leading-relaxed" style={{ color: T.teal, fontFamily: T.head }}>
          Care Indeed has built — and validated — a system that earns the right to that responsibility.
          Maintaining that right is a daily practice, not a quarterly project.
        </p>
        <div className="mt-10 inline-flex items-center gap-3 px-5 py-3 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.85)', border: `1px solid ${T.graySoft}`, backdropFilter: 'blur(10px)' }}>
          <Award size={16} style={{ color: T.orange }} />
          <span className="text-[12px] font-bold uppercase tracking-[0.24em]" style={{ color: T.charcoal, fontFamily: T.mono }}>
            Brad 2.0 · Approved for Production
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   Reusable building blocks
   ═════════════════════════════════════════════════════════════════ */
function GlassCard({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`rounded-2xl ${className}`}
      style={{
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${T.graySoft}aa`,
        boxShadow: '0 24px 60px -30px rgba(31,28,27,0.18), inset 0 1px 0 rgba(255,255,255,0.8)',
        ...style,
      }}>
      {children}
    </div>
  );
}

function Eyebrow({ children, color = T.orange }: { children: ReactNode; color?: string }) {
  return (
    <div className="text-[9px] font-bold uppercase tracking-[0.3em] mb-2"
      style={{ color, fontFamily: T.mono }}>
      {children}
    </div>
  );
}

function Pill({ children, color, bg, icon }: { children: ReactNode; color: string; bg: string; icon?: ReactNode }) {
  return (
    <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em]"
      style={{ background: bg, color, fontFamily: T.mono, border: `1px solid ${color}33` }}>
      {icon}{children}
    </div>
  );
}

function Chip({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em]"
      style={{ background: `${color}1f`, color, fontFamily: T.mono, border: `1px solid ${color}55` }}>
      {children}
    </span>
  );
}

function Metric({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className="rounded-xl p-3.5"
      style={{
        background: accent ? `linear-gradient(135deg, ${T.orange} 0%, ${T.orangeDark} 100%)` : 'rgba(255,255,255,0.85)',
        color: accent ? T.white : T.charcoal,
        border: `1px solid ${accent ? T.orangeDark : T.graySoft}`,
      }}>
      <div className="text-[8.5px] font-bold uppercase tracking-[0.22em] mb-1"
        style={{ color: accent ? '#FFE7D7' : T.gray, fontFamily: T.mono }}>{label}</div>
      <div className="text-[22px] font-extrabold leading-none" style={{ fontFamily: T.head }}>{value}</div>
      <div className="text-[10px] mt-1" style={{ color: accent ? '#FFE7D7' : T.gray }}>{sub}</div>
    </div>
  );
}

function CalloutCard({
  className = '', tone, title, body,
}: { className?: string; tone: 'critical' | 'warning' | 'info' | 'success'; title: string; body: string }) {
  const palette = {
    critical: { bg: '#FEF2F2', border: '#FECACA', text: T.error,   label: 'Critical Insight' },
    warning:  { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', label: 'Warning' },
    info:     { bg: T.tealSoft, border: T.teal,   text: T.tealDark, label: 'Strategic Insight' },
    success:  { bg: '#ECFDF5', border: '#A7F3D0', text: T.success,  label: 'Strategic Advantage' },
  }[tone];
  const Icon = tone === 'critical' ? AlertOctagon : tone === 'warning' ? AlertTriangle : tone === 'info' ? Eye : CheckCircle2;
  return (
    <div className={`rounded-2xl p-5 ${className}`}
      style={{ background: palette.bg, border: `1px solid ${palette.border}`, backdropFilter: 'blur(8px)' }}>
      <div className="flex items-start gap-3">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
          style={{ background: T.white, color: palette.text, border: `1px solid ${palette.border}` }}>
          <Icon size={16} strokeWidth={2.2} />
        </span>
        <div className="flex-1">
          <div className="text-[9px] font-bold uppercase tracking-[0.24em] mb-1"
            style={{ color: palette.text, fontFamily: T.mono }}>{palette.label}</div>
          <div className="text-[14px] font-bold leading-snug mb-1.5" style={{ fontFamily: T.head, color: T.charcoal }}>{title}</div>
          <div className="text-[12.5px] leading-relaxed" style={{ color: T.gray }}>{body}</div>
        </div>
      </div>
    </div>
  );
}

function FlowChain({ steps }: { steps: { label: string; note: string; icon: typeof Eye }[] }) {
  return (
    <div className="flex items-stretch gap-2 overflow-x-auto custom-scrollbar pb-2">
      {steps.map((s, i) => (
        <div key={i} className="flex items-stretch flex-shrink-0">
          <div className="w-[120px] p-3 rounded-xl flex flex-col items-center text-center"
            style={{ background: 'rgba(255,255,255,0.85)', border: `1px solid ${T.graySoft}` }}>
            <span className="flex items-center justify-center w-9 h-9 rounded-lg mb-1.5"
              style={{ background: T.tealSoft, color: T.teal }}>
              <s.icon size={14} strokeWidth={2.2} />
            </span>
            <div className="text-[11.5px] font-bold" style={{ fontFamily: T.head, color: T.charcoal }}>{s.label}</div>
            <div className="text-[9.5px] mt-0.5 leading-tight" style={{ color: T.gray, fontFamily: T.mono }}>{s.note}</div>
          </div>
          {i < steps.length - 1 && (
            <div className="flex items-center px-1">
              <div className="w-3 h-px" style={{ background: T.orange }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ZonePanel({ title, items, tone }: { title: string; items: string[]; tone: 'primary' | 'secondary' }) {
  const isPrimary = tone === 'primary';
  return (
    <div className="rounded-2xl p-5 h-full"
      style={{
        background: isPrimary
          ? `linear-gradient(135deg, ${T.charcoal} 0%, ${T.tealDark} 100%)`
          : 'rgba(255,255,255,0.85)',
        color: isPrimary ? T.white : T.charcoal,
        border: `1px solid ${isPrimary ? T.tealDark : T.graySoft}`,
      }}>
      <div className="flex items-center gap-2 mb-3">
        {isPrimary
          ? <Lock size={14} style={{ color: T.warning }} />
          : <Cloud size={14} style={{ color: T.teal }} />}
        <span className="text-[10px] font-bold uppercase tracking-[0.22em]"
          style={{ fontFamily: T.mono, color: isPrimary ? T.warning : T.teal }}>{title}</span>
      </div>
      <ul className="space-y-2">
        {items.map(it => (
          <li key={it} className="flex items-center gap-2 text-[12px]"
            style={{ color: isPrimary ? '#EDEDED' : T.charcoal }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: isPrimary ? T.warning : T.orange }} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SimDonut({ passed, failed, restarts }: { passed: number; failed: number; restarts: number }) {
  const total = passed + failed;
  const pct = total > 0 ? (passed / total) * 100 : 100;
  const r = 64;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="flex items-center gap-5">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} fill="none" stroke={T.graySoft} strokeWidth="14" />
        <circle cx="80" cy="80" r={r} fill="none" stroke={T.teal} strokeWidth="14"
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 80 80)" />
        <text x="80" y="76" textAnchor="middle" fontFamily={T.head} fontSize="32" fontWeight="800" fill={T.charcoal}>
          {passed}
        </text>
        <text x="80" y="96" textAnchor="middle" fontFamily={T.mono} fontSize="9" fill={T.gray} letterSpacing="2">
          / {total} PASS
        </text>
      </svg>
      <div className="space-y-2">
        <Stat dot={T.teal}    label="Final pass" value={`${passed}/${total}`} />
        <Stat dot={T.orange}  label="Restart events" value={String(restarts)} />
        <Stat dot={T.success} label="PHI exposure" value="0" />
      </div>
    </div>
  );
}

function Stat({ dot, label, value }: { dot: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: dot }} />
      <span className="text-[10.5px] uppercase tracking-[0.18em] font-bold" style={{ color: T.gray, fontFamily: T.mono }}>
        {label}
      </span>
      <span className="ml-auto text-[13px] font-bold" style={{ color: T.charcoal, fontFamily: T.head }}>{value}</span>
    </div>
  );
}
