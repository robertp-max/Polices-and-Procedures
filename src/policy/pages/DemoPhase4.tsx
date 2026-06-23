import {
  ArrowLeft,
  Cloud,
  ShieldCheck,
  Rocket,
  RefreshCw,
  Gauge,
  Database,
  Lock,
  Eye,
  GitBranch,
  CheckCircle2,
  Undo2,
  Globe,
  Bell,
  TimerReset,
} from 'lucide-react';

interface FrontendDeploymentPresentationProps {
  onBack: () => void;
}

const regionPlacement = [
  {
    title: 'Application Data Plane',
    scope: 'S3 frontend origin + logs + all app data services',
    region: 'us-west-2',
    note: 'Primary CA/West region. All data-bearing resources stay here.',
    accent: '#00d1bf',
  },
  {
    title: 'Edge Delivery Plane',
    scope: 'CloudFront distribution + response header policy',
    region: 'Global (Edge)',
    note: 'Global cache and TLS termination at edge PoPs only.',
    accent: '#34d399',
  },
  {
    title: 'Control-Plane Exception',
    scope: 'CloudFront alarm stack + CloudFront metric namespace',
    region: 'us-east-1',
    note: 'AWS hard requirement for CloudFront metrics and alarms.',
    accent: '#f97316',
  },
];

const releaseFlow = [
  {
    id: '01',
    title: 'Build & Verify',
    detail: 'GitHub Actions builds Vite dist and validates index.html before touching AWS.',
    icon: Rocket,
    accent: '#C74601',
  },
  {
    id: '02',
    title: 'Upload Hashed Assets First',
    detail: 'Upload /assets/* with 1-year immutable cache so every hashed URL already exists.',
    icon: Database,
    accent: '#00d1bf',
  },
  {
    id: '03',
    title: 'Atomic Switch',
    detail: 'Upload index.html last with no-cache headers; this is the zero-downtime cutover point.',
    icon: RefreshCw,
    accent: '#3b82f6',
  },
  {
    id: '04',
    title: 'Snapshot + Minimal Invalidation',
    detail: 'Store releases/<sha>/ rollback snapshot, invalidate only /index.html, keep edge caches warm.',
    icon: Undo2,
    accent: '#eab308',
  },
];

const controls = [
  {
    title: 'Origin Hardening',
    body: 'Private S3 + OAC SigV4 + HTTPS-only + block public access.',
    icon: Lock,
    tone: 'teal',
  },
  {
    title: 'Security Headers',
    body: 'HSTS, CSP, Referrer-Policy, X-Frame-Options, Permissions-Policy at CloudFront edge.',
    icon: ShieldCheck,
    tone: 'orange',
  },
  {
    title: 'Observability',
    body: 'CloudFront access logs in S3 + 4xx/5xx alarms in us-east-1.',
    icon: Eye,
    tone: 'blue',
  },
  {
    title: 'Recovery Path',
    body: 'One-command rollback to prior SHA using versioned release snapshots.',
    icon: TimerReset,
    tone: 'gold',
  },
];

const fortnightWorkstreams = [
  {
    id: '01',
    title: 'Security and Compliance Hardening',
    accent: '#00d1bf',
    icon: ShieldCheck,
    completed: [
      'Finalized hardening blueprint and control-baseline documentation.',
      'Published HIPAA/SOC2 control-matrix artifacts for implementation alignment.',
      'Completed penetration-test reporting and remediation tracking package.',
      'Closed infrastructure policy gaps for execution and audit readiness.',
    ],
    evidence: 'Builder/Documentations/05-Hardening-Blueprint.md',
  },
  {
    id: '02',
    title: 'UI/UX Reconstruction and Accessibility',
    accent: '#C74601',
    icon: Eye,
    completed: [
      'Started mobile-first reconstruction strategy across core surfaces.',
      'Consolidated design-system and cross-surface consistency baselines.',
      'Completed accessibility edge-case audit pass with implementation reports.',
      'Produced responsive parity and motion/theme validation reports.',
    ],
    evidence: '_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/UIUX_ACCESSIBILITY_AUDIT.md',
  },
  {
    id: '03',
    title: 'Executive Risk and Architecture Documentation',
    accent: '#3b82f6',
    icon: Globe,
    completed: [
      'Delivered executive security summary for program stakeholders.',
      'Published SaaS architecture alternatives and trade-off analysis.',
      'Completed cost and deployment model comparisons for next-stage planning.',
      'Aligned business-risk narrative with compliance and delivery workstreams.',
    ],
    evidence: 'Builder/Documentations/Brad2-11-SaaS-Architecture-Alternatives.md',
  },
  {
    id: '04',
    title: 'Knowledge Base and Ingestion Expansion',
    accent: '#eab308',
    icon: Database,
    completed: [
      'Built master system documentation package for ingestion workflows.',
      'Updated documentation inventory and conceptual map structures.',
      'Improved discoverability for architecture, controls, and operating guides.',
      'Standardized references used by policy and execution subsystems.',
    ],
    evidence: 'Builder/System-Documentation-for-Ingestion/MASTER-SYSTEM-DOCUMENTATION.md',
  },
  {
    id: '05',
    title: 'Production Integrity and Reporting',
    accent: '#34d399',
    icon: Gauge,
    completed: [
      'Generated canonical policy-view consolidation and integrity reports.',
      'Published approved-user and production-surface governance reports.',
      'Tracked failure/restart patterns to improve operational resilience.',
      'Packaged readiness artifacts for staged execution reviews.',
    ],
    evidence: '_Heavy/Fix-2026-05-14/CANONICAL_POLICY_VIEW_CONSOLIDATION_REPORT.md',
  },
  {
    id: '06',
    title: 'AWS Frontend Migration and Safe Deploy',
    accent: '#8b5cf6',
    icon: Cloud,
    completed: [
      'Implemented S3 + CloudFront + OAC frontend infrastructure stacks.',
      'Added branch-aware GitHub Actions deploy workflow with rollback snapshots.',
      'Shipped CloudFront alarming with us-east-1 metrics exception handling.',
      'Deployed staging endpoint and validated index invalidation path.',
    ],
    evidence: 'infra/frontend-cdk/lib/frontend-stack.ts',
  },
];

function toneClasses(tone: string) {
  if (tone === 'teal') {
    return 'border-[#00d1bf]/30 bg-[#00d1bf]/10 text-[#00d1bf]';
  }
  if (tone === 'orange') {
    return 'border-[#C74601]/30 bg-[#C74601]/10 text-[#C74601]';
  }
  if (tone === 'blue') {
    return 'border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#3b82f6]';
  }
  return 'border-[#eab308]/30 bg-[#eab308]/10 text-[#eab308]';
}

export function FrontendDeploymentPresentation({ onBack }: FrontendDeploymentPresentationProps) {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar relative text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 right-[-120px] w-[540px] h-[540px] rounded-full blur-[120px] bg-[#00d1bf]/10" />
        <div className="absolute top-[35%] left-[-160px] w-[520px] h-[520px] rounded-full blur-[120px] bg-[#C74601]/10" />
        <div className="absolute bottom-[-180px] right-[20%] w-[460px] h-[460px] rounded-full blur-[110px] bg-[#3b82f6]/10" />
      </div>

      <div className="relative z-10 p-6 md:p-8 lg:p-10">
        <div className="max-w-[1380px] mx-auto">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 hover:border-[#00d1bf]/45 hover:bg-[#00d1bf]/10 transition-colors font-montserrat text-[10px] tracking-[0.2em] uppercase font-bold text-[#00d1bf]"
            >
              <ArrowLeft size={14} />
              Back To Phase 1
            </button>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 bg-white/5 font-montserrat text-[9px] tracking-[0.22em] uppercase text-white/70">
              <Cloud size={12} className="text-[#3b82f6]" />
              Last 14 Days Delivery Ledger
            </div>
          </div>

          <section className="mb-8 rounded-[30px] border border-white/10 bg-black/20 backdrop-blur-xl p-6 md:p-8 lg:p-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#00d1bf]/15 to-transparent rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#C74601]/15 to-transparent rounded-full blur-2xl" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-[#C74601]/30 bg-[#C74601]/10 text-[#C74601] font-montserrat text-[9px] tracking-[0.2em] uppercase font-bold mb-4">
                  Preview Phase 4
                </div>
                <h1 className="font-montserrat text-[30px] md:text-[40px] leading-tight font-light tracking-tight mb-5">
                  Two-Week Delivery Ledger and
                  <span className="text-[#00d1bf]"> Frontend Migration</span>
                  <br />
                  To S3 + CloudFront
                </h1>
                <p className="text-white/70 text-[14px] md:text-[15px] leading-relaxed max-w-3xl">
                  This phase now captures all major work completed across the last 14 days,
                  then ties that delivery history into conservative release engineering:
                  immutable assets, atomic switch-over, deterministic rollback, and strict
                  CA/West data placement.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 mb-2">Primary Region</div>
                  <div className="text-2xl font-montserrat font-light text-[#00d1bf]">us-west-2</div>
                  <div className="text-[11px] text-white/50 mt-1">All data-bearing resources</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 mb-2">Rollback SLA</div>
                  <div className="text-2xl font-montserrat font-light text-[#eab308]">&lt; 2 min</div>
                  <div className="text-[11px] text-white/50 mt-1">Index-only invalidation path</div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 size={16} className="text-[#34d399]" />
              <h2 className="font-montserrat text-[12px] uppercase tracking-[0.22em] text-white/70 font-bold">Completed Work - Last 14 Days</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {fortnightWorkstreams.map(stream => {
                const Icon = stream.icon;
                return (
                  <article key={stream.id} className="rounded-2xl border border-white/10 bg-black/25 backdrop-blur-lg p-5 min-h-[290px]">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-[11px] font-bold tracking-[0.18em]" style={{ color: stream.accent }}>
                        STREAM {stream.id}
                      </span>
                      <Icon size={16} style={{ color: stream.accent }} />
                    </div>

                    <h3 className="font-montserrat text-[16px] font-semibold mb-3 leading-tight">{stream.title}</h3>

                    <ul className="space-y-2 mb-4">
                      {stream.completed.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-[12px] text-white/70 leading-relaxed">
                          <CheckCircle2 size={13} className="mt-[2px] shrink-0" style={{ color: stream.accent }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-3 border-t border-white/10">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-white/45 mb-1">Evidence</div>
                      <div className="text-[11px] text-white/70 break-all">{stream.evidence}</div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <GitBranch size={16} className="text-[#00d1bf]" />
              <h2 className="font-montserrat text-[12px] uppercase tracking-[0.22em] text-white/70 font-bold">Release Flight Plan</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {releaseFlow.map(step => {
                const Icon = step.icon;
                return (
                  <article
                    key={step.id}
                    className="rounded-2xl border border-white/10 bg-black/25 backdrop-blur-lg p-5 relative overflow-hidden min-h-[205px]"
                  >
                    <div
                      className="absolute right-[-26px] top-[-26px] w-24 h-24 rounded-full opacity-20"
                      style={{ background: step.accent }}
                    />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-mono text-[11px] font-bold tracking-[0.18em]" style={{ color: step.accent }}>
                          STEP {step.id}
                        </span>
                        <Icon size={16} style={{ color: step.accent }} />
                      </div>
                      <h3 className="font-montserrat text-[16px] font-semibold mb-3 leading-tight">{step.title}</h3>
                      <p className="text-white/65 text-[12px] leading-relaxed">{step.detail}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Globe size={16} className="text-[#3b82f6]" />
              <h2 className="font-montserrat text-[12px] uppercase tracking-[0.22em] text-white/70 font-bold">Region Integrity</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {regionPlacement.map(item => (
                <article key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: item.accent }}>
                    {item.title}
                  </div>
                  <div className="font-montserrat text-[21px] font-light mb-2" style={{ color: item.accent }}>
                    {item.region}
                  </div>
                  <p className="text-[12px] text-white/75 mb-2 leading-relaxed">{item.scope}</p>
                  <p className="text-[11px] text-white/55 leading-relaxed">{item.note}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck size={16} className="text-[#00d1bf]" />
              <h2 className="font-montserrat text-[12px] uppercase tracking-[0.22em] text-white/70 font-bold">Operational Guardrails</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {controls.map(control => {
                const Icon = control.icon;
                return (
                  <article key={control.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-start gap-4">
                      <div className={`shrink-0 p-2.5 rounded-xl border ${toneClasses(control.tone)}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <h3 className="font-montserrat text-[15px] font-semibold text-white mb-2">{control.title}</h3>
                        <p className="text-white/65 text-[12px] leading-relaxed">{control.body}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-[26px] border border-[#00d1bf]/25 bg-gradient-to-r from-[#001513] via-[#061c1a] to-[#131005] p-5 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
              <div className="md:col-span-2">
                <h2 className="font-montserrat text-[18px] md:text-[20px] font-light mb-2">
                  Deployment Confidence Loop
                </h2>
                <p className="text-[12px] text-white/70 leading-relaxed">
                  Build and upload safely, switch only index, monitor 4xx/5xx, and rollback by commit SHA without touching the distribution configuration.
                </p>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-1 gap-2 md:gap-3">
                <div className="rounded-xl border border-[#00d1bf]/30 px-3 py-2 text-center">
                  <div className="text-[11px] font-bold text-[#00d1bf]">OAC</div>
                  <div className="text-[10px] text-white/60">Origin locked</div>
                </div>
                <div className="rounded-xl border border-[#C74601]/30 px-3 py-2 text-center">
                  <div className="text-[11px] font-bold text-[#C74601]">CSP</div>
                  <div className="text-[10px] text-white/60">Edge headers</div>
                </div>
                <div className="rounded-xl border border-[#3b82f6]/30 px-3 py-2 text-center">
                  <div className="text-[11px] font-bold text-[#3b82f6]">/index</div>
                  <div className="text-[10px] text-white/60">Only invalidation</div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] text-white/70">
                <Gauge size={14} className="text-[#00d1bf]" />
                <span>CloudFront: immutable assets cache-hit optimized</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/70">
                <Bell size={14} className="text-[#eab308]" />
                <span>Alarms: 4xx &gt; 5%, 5xx &gt; 1% in CloudWatch us-east-1</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/70">
                <CheckCircle2 size={14} className="text-[#34d399]" />
                <span>Rollback: releases/&lt;sha&gt; + index swap script</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
