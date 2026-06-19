import { useState } from 'react';
import {
  ArrowLeft, ArrowRight, Cloud, Server, Database, Shield, Layers,
  Globe, Activity, Lock, Eye, Zap, GitBranch, BarChart3,
  CheckCircle, AlertCircle, ChevronRight, Box, Cpu, Network,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface P3Chapter {
  id: number;
  number: string;
  label: string;
  subtitle: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

const P3_CHAPTERS: P3Chapter[] = [
  { id: 1, number: '01', label: 'AWS Architecture',         subtitle: 'System Overview',          icon: Cloud },
  { id: 2, number: '02', label: 'Serverless Design',        subtitle: 'Event-Driven System',      icon: Zap },
  { id: 3, number: '03', label: 'Data & Evidence Flow',     subtitle: 'Traceability Pipeline',    icon: GitBranch },
  { id: 4, number: '04', label: 'Security & HIPAA',         subtitle: 'Compliance Readiness',     icon: Shield },
  { id: 5, number: '05', label: 'Environment Strategy',     subtitle: 'Preview → Production',        icon: Layers },
  { id: 6, number: '06', label: 'Deployment & Scale',       subtitle: 'Global Infrastructure',    icon: Globe },
  { id: 7, number: '07', label: 'Operational Monitoring',   subtitle: 'Visibility & Alerts',      icon: Activity },
  { id: 8, number: '08', label: 'From System to Platform',  subtitle: 'Enterprise Close',         icon: BarChart3 },
];

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

function P3Tag({ text, color = '#1d4ed8', bg = '#EFF6FF' }: { text: string; color?: string; bg?: string }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-bold tracking-[0.25em] uppercase font-montserrat"
      style={{ color, background: bg }}
    >
      {text}
    </span>
  );
}

function P3Head({ number, subtitle, title, badge }: { number: string; subtitle: string; title: string; badge?: string }) {
  return (
    <div className="mb-7">
      <div className="flex items-center gap-2 mb-2">
        <P3Tag text={`${number} — ${subtitle}`} color="#1d4ed8" bg="#EFF6FF" />
        {badge && <P3Tag text={badge} color="#C74601" bg="#FFF0E8" />}
      </div>
      <h1 className="text-[36px] font-light text-[#1F1C1B] font-montserrat leading-tight tracking-tight">{title}</h1>
    </div>
  );
}

function P3Rule() { return <div className="my-6 border-t border-[#E5E4E3]" />; }

function P3BulletList({ items, color = '#1d4ed8' }: { items: string[]; color?: string }) {
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: color }} />
          <span className="text-[11px] text-[#52404B] leading-snug">{item}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ARCH DIAGRAM PRIMITIVE
// ─────────────────────────────────────────────────────────────────────────────

function ArchNode({ icon: Icon, label, sub, color = '#1d4ed8', size = 'md' }: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any; label: string; sub?: string; color?: string; size?: 'sm' | 'md' | 'lg';
}) {
  const sz = size === 'lg' ? 'w-14 h-14' : size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';
  const ic = size === 'lg' ? 22 : size === 'sm' ? 14 : 18;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`${sz} rounded-2xl flex items-center justify-center`} style={{ background: `${color}12`, border: `1.5px solid ${color}30` }}>
        <Icon size={ic} style={{ color }} />
      </div>
      <div className="text-center">
        <div className="text-[10px] font-semibold text-[#1F1C1B] font-montserrat leading-tight">{label}</div>
        {sub && <div className="text-[8px] text-[#747474] font-montserrat">{sub}</div>}
      </div>
    </div>
  );
}

function ArchArrow() {
  return (
    <div className="flex flex-col items-center justify-center px-1">
      <div className="w-px h-5 bg-[#D1D1D1]" />
      <div className="w-2 h-2 border-b-2 border-r-2 border-[#D1D1D1] rotate-45 -mt-1" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CH 01 — AWS ARCHITECTURE OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────

function P3Ch01() {
  const sideLayers = [
    { icon: Lock,     label: 'Cognito',     sub: 'Identity',    color: '#7c3aed' },
    { icon: Shield,   label: 'IAM',         sub: 'Permissions', color: '#059669' },
    { icon: Eye,      label: 'CloudWatch',  sub: 'Logs',        color: '#0284c7' },
    { icon: GitBranch,label: 'EventBridge', sub: 'Workflows',   color: '#d97706' },
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto">
      <P3Head number="01" subtitle="System Overview" title="Enterprise AWS Architecture" badge="PREVIEW ENVIRONMENT" />

      <p className="text-[15px] text-[#52404B] leading-relaxed mb-7 max-w-[620px] font-roboto">
        Serverless, scalable, and audit-ready infrastructure powering Care Indeed.
        Every component purpose-built for compliance workloads.
      </p>

      {/* Main diagram */}
      <div className="bg-white rounded-2xl border border-[#E5E4E3] p-6 mb-4">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4">

          {/* Primary stack — center column */}
          <div className="col-start-1 col-span-1 flex flex-col items-center gap-0">
            <ArchNode icon={Globe}    label="User"          sub="Browser / App"   color="#374151" size="sm" />
            <ArchArrow />
            <ArchNode icon={Network}  label="CloudFront"    sub="CDN + Edge"      color="#f97316" size="md" />
            <ArchArrow />
            <ArchNode icon={Box}      label="API Gateway"   sub="REST / GraphQL"  color="#3b82f6" size="md" />
            <ArchArrow />
            <ArchNode icon={Cpu}      label="Lambda"        sub="Execution Engine" color="#8b5cf6" size="lg" />
            <ArchArrow />
            <ArchNode icon={Database} label="DynamoDB"      sub="Operational Data" color="#059669" size="md" />
            <ArchArrow />
            <ArchNode icon={Cloud}    label="S3"            sub="Evidence Storage" color="#0284c7" size="md" />
            <ArchArrow />
            <ArchNode icon={Shield}   label="Audit Layer"   sub="Immutable Log"   color="#dc2626" size="md" />
          </div>

          {/* Spacer */}
          <div className="col-start-2 flex items-center justify-center">
            <div className="w-px h-full bg-[#F0F0F0]" />
          </div>

          {/* Side services — right column */}
          <div className="col-start-3 flex flex-col justify-center gap-4 pl-4">
            <div className="text-[8px] font-bold text-[#747474] tracking-[0.3em] uppercase font-montserrat mb-2">Supporting Services</div>
            {sideLayers.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#E5E4E3] hover:border-[#D1D1D1] transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${s.color}12`, border: `1px solid ${s.color}20` }}>
                    <Icon size={14} style={{ color: s.color }} />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#1F1C1B] font-montserrat">{s.label}</div>
                    <div className="text-[9px] text-[#747474]">{s.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Environment notice */}
      <div className="rounded-2xl bg-[#FFF8F5] border border-[#C74601]/15 p-4 flex items-start gap-3">
        <AlertCircle size={15} className="text-[#C74601] shrink-0 mt-0.5" />
        <div>
          <div className="text-[10px] font-bold text-[#C74601] tracking-[0.15em] uppercase font-montserrat mb-0.5">Current Environment</div>
          <p className="text-[11px] text-[#52404B] leading-relaxed">
            This environment demonstrates system behavior and architecture. Production deployment enforces full security and compliance controls.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CH 02 — SERVERLESS SYSTEM DESIGN
// ─────────────────────────────────────────────────────────────────────────────

function P3Ch02() {
  const traditional = [
    'Fixed server capacity',
    'Manual scaling required',
    'Always-on cost model',
    'Infrastructure maintenance burden',
    'Single point of failure risk',
    'Deployment downtime',
  ];
  const serverless = [
    'Auto-scales to zero when idle',
    'Event-driven execution model',
    'Pay-per-invocation pricing',
    'No infrastructure to manage',
    'Built-in fault tolerance',
    'Zero-downtime deployments',
  ];
  const benefits = [
    { icon: Zap,      label: 'Instant Scale',     desc: 'Handles 1 or 10,000 concurrent compliance events with identical response time', color: '#8b5cf6' },
    { icon: Database, label: 'Cost Efficiency',   desc: 'Zero cost when idle. Costs scale linearly with actual usage — not provisioned capacity', color: '#059669' },
    { icon: Shield,   label: 'Fault Tolerant',    desc: 'AWS managed redundancy. No single points of failure in the execution layer', color: '#dc2626' },
    { icon: Globe,    label: 'Global Reach',       desc: 'CloudFront edge network delivers the system globally without regional deployment', color: '#0284c7' },
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto">
      <P3Head number="02" subtitle="Event-Driven System" title="Serverless System Design" />
      <p className="text-[14px] text-[#52404B] leading-relaxed mb-7 max-w-[620px] font-roboto">
        No servers. No infrastructure management. The system responds to events,
        scales automatically, and costs nothing when not in use.
      </p>

      {/* Comparison cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-[#FBE6E6] rounded-lg flex items-center justify-center">
              <Server size={13} className="text-[#dc2626]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#1F1C1B] font-montserrat">Traditional Architecture</div>
              <div className="text-[9px] text-[#747474]">Server-based model</div>
            </div>
          </div>
          <P3BulletList items={traditional} color="#dc2626" />
        </div>

        <div className="bg-[#EFF6FF] rounded-2xl border border-[#1d4ed8]/15 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-[#1d4ed8] rounded-lg flex items-center justify-center">
              <Zap size={13} className="text-white" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#1F1C1B] font-montserrat">Serverless Architecture</div>
              <div className="text-[9px] text-[#1d4ed8]">What we built</div>
            </div>
          </div>
          <P3BulletList items={serverless} color="#1d4ed8" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {benefits.map((b, i) => {
          const Icon = b.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-[#E5E4E3] p-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5" style={{ background: `${b.color}12` }}>
                <Icon size={15} style={{ color: b.color }} />
              </div>
              <div className="text-[11px] font-bold text-[#1F1C1B] font-montserrat mb-1">{b.label}</div>
              <div className="text-[10px] text-[#52404B] leading-snug">{b.desc}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border-l-4 border-[#1d4ed8] bg-[#EFF6FF] p-5">
        <div className="text-[9px] font-bold text-[#1d4ed8] tracking-[0.25em] uppercase font-montserrat mb-1.5">Architecture Principle</div>
        <p className="text-[14px] text-[#1F1C1B] font-montserrat font-light leading-snug">
          "The infrastructure disappears — only compliance outcomes remain."
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CH 03 — DATA & EVIDENCE FLOW
// ─────────────────────────────────────────────────────────────────────────────

function P3Ch03() {
  const flowSteps = [
    { step: '01', label: 'User Action',         desc: 'Staff records a clinical event, form submission, or workflow completion', icon: Globe,    color: '#374151' },
    { step: '02', label: 'API Gateway',          desc: 'Request authenticated, validated, and routed to the execution layer', icon: Box,      color: '#3b82f6' },
    { step: '03', label: 'Lambda Execution',     desc: 'Business logic executed: event classified, metadata attached, state updated', icon: Cpu,      color: '#8b5cf6' },
    { step: '04', label: 'Data Persisted',       desc: 'DynamoDB stores operational record with policy_id, workflow_id, event_id', icon: Database, color: '#059669' },
    { step: '05', label: 'Evidence Generated',   desc: 'S3 stores the immutable evidence artifact with chain hash', icon: Cloud,    color: '#0284c7' },
    { step: '06', label: 'Audit Logged',         desc: 'Append-only audit trail written. Chain integrity verified automatically', icon: Shield,   color: '#dc2626' },
  ];

  const evidenceProps = [
    'policy_id — links evidence to governing policy',
    'workflow_id — traces to the specific workflow instance',
    'event_id — unique identifier per action',
    'user_id + actor_role — who performed the action',
    'timestamp (UTC ISO 8601) — immutable time record',
    'chain_hash — tamper-evident cryptographic link',
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto">
      <P3Head number="03" subtitle="Traceability Pipeline" title="Data & Evidence Flow" />
      <p className="text-[14px] text-[#52404B] leading-relaxed mb-7 max-w-[620px] font-roboto">
        Every user action generates a traceable, immutable evidence record.
        The flow is deterministic — surveyors can retrieve any action in under 5 minutes.
      </p>

      {/* Flow diagram */}
      <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5 mb-5">
        <div className="text-[9px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-4">Evidence Generation Pipeline</div>
        <div className="space-y-2">
          {flowSteps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}12`, border: `1.5px solid ${s.color}25` }}>
                    <Icon size={13} style={{ color: s.color }} />
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-[8px] font-bold text-[#747474] tracking-[0.2em] font-montserrat shrink-0">{s.step}</span>
                    <span className="text-[11px] font-semibold text-[#1F1C1B] font-montserrat shrink-0">{s.label}</span>
                    <span className="text-[10px] text-[#52404B]">{s.desc}</span>
                  </div>
                  {i < flowSteps.length - 1 && <CheckCircle size={12} style={{ color: s.color }} className="shrink-0" />}
                  {i === flowSteps.length - 1 && <CheckCircle size={14} className="text-[#059669] shrink-0" />}
                </div>
                {i < flowSteps.length - 1 && (
                  <div className="ml-3.5 w-px h-3 bg-[#E5E4E3]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5">
          <div className="text-[9px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-3">Required Evidence Metadata</div>
          <P3BulletList items={evidenceProps} color="#1d4ed8" />
        </div>

        <div className="bg-[#EFF6FF] rounded-2xl border border-[#1d4ed8]/15 p-5">
          <div className="text-[9px] font-bold text-[#1d4ed8] tracking-[0.2em] uppercase font-montserrat mb-3">Audit Guarantees</div>
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-3 border border-[#E5E4E3]">
              <div className="text-[20px] font-light text-[#1d4ed8] font-montserrat">≤ 5 min</div>
              <div className="text-[10px] font-semibold text-[#1F1C1B]">Audit Retrieval</div>
              <div className="text-[9px] text-[#747474]">Any single evidence record</div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-[#E5E4E3]">
              <div className="text-[20px] font-light text-[#1d4ed8] font-montserrat">≤ 60 min</div>
              <div className="text-[10px] font-semibold text-[#1F1C1B]">Surveyor Evidence Pack</div>
              <div className="text-[9px] text-[#747474]">Full policy-scope evidence export</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CH 04 — SECURITY & HIPAA READINESS
// ─────────────────────────────────────────────────────────────────────────────

function P3Ch04() {
  const demoControls = [
    'Cognito-based user authentication',
    'HTTPS transport encryption',
    'Role-based access control (RBAC)',
    'Session management + expiry',
    'Environment isolation',
  ];
  const prodControls = [
    { label: 'Encryption at rest (KMS)',         icon: Lock,    color: '#8b5cf6' },
    { label: 'Audit logging (CloudTrail)',        icon: Eye,     color: '#0284c7' },
    { label: 'Network isolation (VPC)',           icon: Shield,  color: '#059669' },
    { label: 'Secrets management (Secrets Mgr)', icon: Lock,    color: '#dc2626' },
    { label: 'Threat detection (GuardDuty)',      icon: Shield,  color: '#d97706' },
    { label: 'Automated backup (DLM)',            icon: Database,color: '#374151' },
    { label: 'Web Application Firewall (WAF)',    icon: Shield,  color: '#7c3aed' },
    { label: 'Compliance reporting (Security Hub)',icon: BarChart3,color:'#0284c7'},
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto">
      <P3Head number="04" subtitle="Compliance Readiness" title="Security & HIPAA Readiness" />
      <p className="text-[14px] text-[#52404B] leading-relaxed mb-7 max-w-[620px] font-roboto">
        The system is architected for HIPAA-ready deployment.
        The current environment demonstrates functionality — production enforces the full security control set.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Current demo */}
        <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-[#FFF8F5] rounded-lg flex items-center justify-center border border-[#C74601]/20">
              <AlertCircle size={11} className="text-[#C74601]" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#C74601] font-montserrat uppercase tracking-[0.12em]">Preview State</div>
              <div className="text-[9px] text-[#747474]">Current environment</div>
            </div>
          </div>
          <P3BulletList items={demoControls} color="#C74601" />
          <P3Rule />
          <div className="text-[9px] text-[#747474] leading-relaxed">
            Designed for feature validation and stakeholder demonstration.
            Not intended for PHI processing.
          </div>
        </div>

        {/* Production */}
        <div className="bg-[#F0FDF4] rounded-2xl border border-[#059669]/15 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-[#059669] rounded-lg flex items-center justify-center">
              <CheckCircle size={11} className="text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#059669] font-montserrat uppercase tracking-[0.12em]">Production Ready</div>
              <div className="text-[9px] text-[#747474]">HIPAA-aligned controls</div>
            </div>
          </div>
          <div className="space-y-2">
            {prodControls.map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className="flex items-center gap-2.5 py-1.5 border-b border-[#E5E4E3]/60 last:border-0">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: `${c.color}12` }}>
                    <Icon size={10} style={{ color: c.color }} />
                  </div>
                  <span className="text-[10px] text-[#1F1C1B] font-montserrat">{c.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Statement */}
      <div className="bg-[#1F1C1B] rounded-2xl p-6">
        <div className="text-[8px] text-white/30 tracking-[0.3em] uppercase font-montserrat mb-3">Compliance Position Statement</div>
        <p className="text-[15px] text-white font-montserrat font-light leading-relaxed max-w-2xl">
          "The system is architected for compliance. The current environment is for demonstration.
          Production deployment enforces HIPAA-aligned controls under a secure AWS architecture."
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CH 05 — ENVIRONMENT STRATEGY
// ─────────────────────────────────────────────────────────────────────────────

function P3Ch05() {
  const envs = [
    {
      stage: 'PREVIEW',
      label: 'Preview',
      purpose: 'Feature Validation',
      color: '#C74601',
      bg: '#FFF0E8',
      border: '#C74601',
      desc: 'Demonstrates system behavior and feature completeness for stakeholder review. No real PHI. Reduced security controls.',
      items: ['Stakeholder presentations', 'Feature walkthroughs', 'Architecture demonstration', 'Workflow validation'],
      current: true,
    },
    {
      stage: 'STAGING',
      label: 'Staging',
      purpose: 'QA / UAT',
      color: '#d97706',
      bg: '#FFFBEB',
      border: '#d97706',
      desc: 'Pre-production validation environment. Mirrors production configuration. Used for QA cycles and User Acceptance Testing.',
      items: ['Regression testing', 'User acceptance testing', 'Load & performance testing', 'Security scan gate'],
      current: false,
    },
    {
      stage: 'PRODUCTION',
      label: 'Production',
      purpose: 'Compliance Enforced',
      color: '#059669',
      bg: '#F0FDF4',
      border: '#059669',
      desc: 'Full HIPAA-aligned configuration. All security controls active. Audit trail immutable. PHI handled under BAA.',
      items: ['Full encryption at rest + in transit', 'CloudTrail + GuardDuty active', 'VPC network isolation', 'BAA in place for PHI'],
      current: false,
    },
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto">
      <P3Head number="05" subtitle="Preview → Production" title="Environment Strategy" />
      <p className="text-[14px] text-[#52404B] leading-relaxed mb-7 max-w-[620px] font-roboto">
        A structured three-stage path from demonstration to full production compliance enforcement.
        Each stage has a distinct purpose and control profile.
      </p>

      {/* Pipeline visual */}
      <div className="flex items-center gap-2 mb-6">
        {envs.map((env, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`flex-1 rounded-2xl border-2 p-4 ${env.current ? 'ring-2 ring-offset-2' : ''}`}
              style={{ borderColor: env.border, background: env.bg }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-bold tracking-[0.25em] uppercase font-montserrat" style={{ color: env.color }}>{env.stage}</span>
                {env.current && <span className="text-[7px] font-bold bg-[#C74601] text-white px-1.5 py-0.5 rounded-full tracking-wider">CURRENT</span>}
              </div>
              <div className="text-[13px] font-semibold text-[#1F1C1B] font-montserrat mb-0.5">{env.label}</div>
              <div className="text-[9px] font-semibold mb-2" style={{ color: env.color }}>{env.purpose}</div>
              <p className="text-[9px] text-[#52404B] leading-snug mb-3">{env.desc}</p>
              <div className="space-y-1">
                {env.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-1.5">
                    <div className="w-1 h-1 rounded-full shrink-0 mt-1.5" style={{ background: env.color }} />
                    <span className="text-[8.5px] text-[#52404B]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            {i < envs.length - 1 && (
              <ChevronRight size={16} className="text-[#D1D1D1] shrink-0" />
            )}
          </div>
        ))}
      </div>

      <div className="bg-[#EFF6FF] rounded-2xl border border-[#1d4ed8]/15 p-4 flex items-start gap-3">
        <CheckCircle size={14} className="text-[#1d4ed8] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#52404B] leading-relaxed">
          <span className="font-semibold text-[#1F1C1B]">Infrastructure parity: </span>
          All three environments use identical AWS service architecture. Moving to production requires security configuration changes — not architectural redesign.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CH 06 — DEPLOYMENT & SCALABILITY
// ─────────────────────────────────────────────────────────────────────────────

function P3Ch06() {
  const scaleFeatures = [
    { icon: Cpu,    title: 'Lambda Auto-Scaling',   desc: 'Execution layer scales from 0 to thousands of concurrent compliance events instantly. No pre-provisioning required.', metric: '0 → ∞', color: '#8b5cf6' },
    { icon: Globe,  title: 'CloudFront Global CDN', desc: 'Assets cached at edge locations worldwide. Users in any region receive the same sub-100ms load experience.', metric: '< 100ms', color: '#0284c7' },
    { icon: Database,title: 'DynamoDB On-Demand',   desc: 'Database scales automatically with read/write capacity. No table capacity planning or manual intervention.', metric: 'Auto', color: '#059669' },
    { icon: Cloud,  title: 'S3 Evidence Storage',   desc: 'Unlimited evidence artifact storage. 99.999999999% (11 nines) durability. Multi-AZ by default.', metric: '11 nines', color: '#f97316' },
  ];

  const deploySteps = [
    { n: '1', label: 'Code merged to main',          detail: 'CI/CD pipeline triggers automatically' },
    { n: '2', label: 'Vite build + asset hash',      detail: 'Optimized bundles with cache-busting fingerprints' },
    { n: '3', label: 'S3 sync with --delete',        detail: 'Only changed assets uploaded' },
    { n: '4', label: 'CloudFront invalidation',      detail: 'Cache cleared globally within 60 seconds' },
    { n: '5', label: 'Live worldwide',               detail: 'Zero downtime. No user interruption' },
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto">
      <P3Head number="06" subtitle="Global Infrastructure" title="Deployment & Scalability" />
      <p className="text-[14px] text-[#52404B] leading-relaxed mb-7 max-w-[620px] font-roboto">
        The system scales automatically across all layers. No infrastructure bottlenecks.
        Users across regions access the same system without local deployment.
      </p>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {scaleFeatures.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-[#E5E4E3] p-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5" style={{ background: `${f.color}12` }}>
                <Icon size={15} style={{ color: f.color }} />
              </div>
              <div className="text-[18px] font-light font-montserrat mb-0.5" style={{ color: f.color }}>{f.metric}</div>
              <div className="text-[10px] font-semibold text-[#1F1C1B] font-montserrat mb-1 leading-tight">{f.title}</div>
              <div className="text-[9px] text-[#52404B] leading-snug">{f.desc}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5 mb-4">
        <div className="text-[9px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-3">Deployment Pipeline (Current)</div>
        <div className="space-y-2">
          {deploySteps.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#1d4ed8] flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-white font-mono">{s.n}</span>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <span className="text-[11px] font-semibold text-[#1F1C1B] font-montserrat shrink-0">{s.label}</span>
                <span className="text-[10px] text-[#747474]">{s.detail}</span>
              </div>
              <CheckCircle size={12} className="text-[#059669] shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-[#EFF6FF] border border-[#1d4ed8]/15 p-4">
        <p className="text-[12px] text-[#1F1C1B] font-montserrat font-light italic">
          "Users across regions can access the system without local deployment — CloudFront delivers the same performance globally."
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CH 07 — OPERATIONAL MONITORING
// ─────────────────────────────────────────────────────────────────────────────

function P3Ch07() {
  const monitoringLayers = [
    {
      icon: Eye,
      title: 'Application Logs',
      sub: 'CloudWatch Logs',
      color: '#0284c7',
      items: ['Lambda invocation logs', 'API Gateway access logs', 'Error rate tracking', 'Custom compliance metrics'],
    },
    {
      icon: Activity,
      title: 'Alerts & Alarms',
      sub: 'CloudWatch Alarms',
      color: '#d97706',
      items: ['Error threshold breaches', 'Latency anomalies', 'Unusual access patterns', 'Billing threshold alerts'],
    },
    {
      icon: Shield,
      title: 'Audit Trails',
      sub: 'CloudTrail (Prod)',
      color: '#059669',
      items: ['All AWS API calls recorded', 'IAM activity logged', 'Resource configuration changes', 'Immutable log storage'],
    },
    {
      icon: BarChart3,
      title: 'System Visibility',
      sub: 'Dashboards',
      color: '#8b5cf6',
      items: ['Real-time service health', 'Compliance event volume', 'Evidence chain integrity', 'Audit readiness score'],
    },
  ];

  const kpis = [
    { label: 'System Uptime', value: '99.9%', sub: 'AWS SLA target', color: '#059669' },
    { label: 'Evidence Integrity', value: '100%', sub: 'Chain hash verified', color: '#1d4ed8' },
    { label: 'Audit Retrieval', value: '< 5m', sub: 'Any record', color: '#8b5cf6' },
    { label: 'Deployment Time', value: '< 2m', sub: 'Zero downtime', color: '#f97316' },
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto">
      <P3Head number="07" subtitle="Visibility & Alerts" title="Operational Monitoring" />
      <p className="text-[14px] text-[#52404B] leading-relaxed mb-7 max-w-[620px] font-roboto">
        Full-stack observability across infrastructure, application, and compliance layers.
        Operators and auditors see what they need, when they need it.
      </p>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E5E4E3] p-4 text-center">
            <div className="text-[24px] font-light font-montserrat mb-1" style={{ color: k.color }}>{k.value}</div>
            <div className="text-[10px] font-semibold text-[#1F1C1B] font-montserrat">{k.label}</div>
            <div className="text-[8px] text-[#747474] uppercase tracking-wider mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {monitoringLayers.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-[#E5E4E3] p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${m.color}12` }}>
                  <Icon size={14} style={{ color: m.color }} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-[#1F1C1B] font-montserrat">{m.title}</div>
                  <div className="text-[9px]" style={{ color: m.color }}>{m.sub}</div>
                </div>
              </div>
              <P3BulletList items={m.items} color={m.color} />
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border-l-4 border-[#1d4ed8] bg-[#EFF6FF] p-4">
        <div className="text-[9px] font-bold text-[#1d4ed8] tracking-[0.25em] uppercase font-montserrat mb-1.5">Infrastructure Maturity</div>
        <p className="text-[12px] text-[#52404B] leading-relaxed">
          Monitoring architecture is production-parity designed. This environment captures core metrics;
          full observability stack activates at production deployment without code changes.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CH 08 — FROM SYSTEM TO PLATFORM (CLOSING)
// ─────────────────────────────────────────────────────────────────────────────

function P3Ch08({ onBackToPhase1 }: { onBackToPhase1: () => void }) {
  const pillars = [
    { icon: Cloud,    label: 'Serverless AWS',       desc: 'Lambda, DynamoDB, S3, CloudFront', color: '#3b82f6' },
    { icon: Shield,   label: 'HIPAA-Ready Path',     desc: 'Architected for production compliance', color: '#059669' },
    { icon: Activity, label: 'Full Observability',   desc: 'Logs, alerts, audit trails, dashboards', color: '#8b5cf6' },
    { icon: Globe,    label: 'Global Scalability',   desc: 'Zero infrastructure bottlenecks', color: '#f97316' },
    { icon: Database, label: 'Immutable Evidence',   desc: 'Hash-chained, auditable, retrievable', color: '#dc2626' },
    { icon: Zap,      label: 'Auto-Scale Design',    desc: 'Event-driven, cost-efficient, resilient', color: '#d97706' },
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <P3Tag text="08 — Enterprise Close" color="#1d4ed8" bg="#EFF6FF" />
        </div>
        <h1 className="text-[40px] font-light text-[#1F1C1B] font-montserrat leading-tight tracking-tight mb-3">
          From System<br/>to Platform
        </h1>
        <p className="text-[16px] text-[#52404B] font-roboto leading-relaxed max-w-[640px]">
          What began as a compliance system is now a scalable, infrastructure-backed
          platform ready for enterprise deployment.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {pillars.map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-[#E5E4E3] p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${p.color}12` }}>
                <Icon size={14} style={{ color: p.color }} />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-[#1F1C1B] font-montserrat mb-0.5">{p.label}</div>
                <div className="text-[10px] text-[#52404B]">{p.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#1F1C1B] rounded-2xl p-8 mb-6">
        <div className="text-[8px] text-white/25 tracking-[0.4em] uppercase font-montserrat mb-4">Care Indeed — Infrastructure Position</div>
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-[32px] font-light text-[#3b82f6] font-montserrat mb-1">Serverless</div>
            <div className="text-[10px] text-white/50 font-montserrat uppercase tracking-wider">Architecture</div>
          </div>
          <div className="text-center">
            <div className="text-[32px] font-light text-[#059669] font-montserrat mb-1">HIPAA-Ready</div>
            <div className="text-[10px] text-white/50 font-montserrat uppercase tracking-wider">Compliance Path</div>
          </div>
          <div className="text-center">
            <div className="text-[32px] font-light text-[#f97316] font-montserrat mb-1">Enterprise</div>
            <div className="text-[10px] text-white/50 font-montserrat uppercase tracking-wider">Production Ready</div>
          </div>
        </div>
        <p className="text-white/40 text-[12px] max-w-2xl mx-auto text-center leading-relaxed font-roboto">
          The infrastructure is not a future plan — it exists today. This demo runs on the same
          AWS services that will power the production system. Scaling to full compliance enforcement
          is a configuration step, not an architectural rebuild.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[10px] text-[#747474] font-montserrat">
          Phase 3 complete · Infrastructure & Production Readiness
        </div>
        <button
          onClick={onBackToPhase1}
          className="flex items-center gap-2 bg-[#1d4ed8] text-white px-5 py-2.5 rounded-xl text-[10px] font-bold tracking-[0.12em] uppercase font-montserrat hover:bg-[#1e40af] transition-colors"
        >
          Back to Live System
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT — Phase 3 Executive Infrastructure Presentation
// ─────────────────────────────────────────────────────────────────────────────

export function InfrastructurePresentation({ onBack }: { onBack: () => void }) {
  const [chapter, setChapter] = useState(1);

  const goNext = () => setChapter(c => Math.min(c + 1, P3_CHAPTERS.length));
  const goPrev = () => setChapter(c => Math.max(c - 1, 1));

  const renderChapter = () => {
    switch (chapter) {
      case 1: return <P3Ch01 />;
      case 2: return <P3Ch02 />;
      case 3: return <P3Ch03 />;
      case 4: return <P3Ch04 />;
      case 5: return <P3Ch05 />;
      case 6: return <P3Ch06 />;
      case 7: return <P3Ch07 />;
      case 8: return <P3Ch08 onBackToPhase1={onBack} />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#FAFBF8] overflow-hidden">
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Sidebar ── */}
        <div className="w-[220px] shrink-0 bg-white border-r border-[#E5E4E3] flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-[#E5E4E3]">
            <div className="text-[8px] font-bold tracking-[0.3em] text-[#1d4ed8] uppercase font-montserrat mb-0.5">Phase 3</div>
            <div className="text-[11px] font-semibold text-[#1F1C1B] font-montserrat">Infrastructure & AWS</div>
            <div className="text-[9px] text-[#747474]">{P3_CHAPTERS.length} sections · {chapter} of {P3_CHAPTERS.length}</div>
          </div>

          <div className="flex-1 overflow-y-auto py-1.5">
            {P3_CHAPTERS.map(ch => {
              const Icon = ch.icon;
              const isActive = ch.id === chapter;
              return (
                <button key={ch.id} onClick={() => setChapter(ch.id)}
                  className={`w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 transition-all border-l-[3px] ${isActive ? 'bg-[#EFF6FF] border-[#1d4ed8]' : 'border-transparent hover:bg-[#F5F5F5]'}`}>
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-[#1d4ed8]' : 'bg-[#F0F0F0]'}`}>
                    <Icon size={11} className={isActive ? 'text-white' : 'text-[#747474]'} />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-[9px] font-bold font-montserrat tracking-[0.06em] leading-tight truncate ${isActive ? 'text-[#1d4ed8]' : 'text-[#1F1C1B]'}`}>{ch.label}</div>
                    <div className="text-[8px] text-[#747474] truncate">{ch.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3.5 border-t border-[#E5E4E3]">
            <button onClick={onBack}
              className="flex items-center gap-2 text-[9px] font-bold text-[#747474] hover:text-[#1F1C1B] uppercase tracking-[0.12em] font-montserrat transition-colors w-full">
              <ArrowLeft size={10} /> Back to Overview
            </button>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar" key={chapter}>
            {renderChapter()}
          </div>

          {/* Footer navigation */}
          <div className="shrink-0 flex items-center justify-between px-7 py-3 bg-white border-t border-[#E5E4E3]">
            <button onClick={goPrev} disabled={chapter === 1}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.1em] font-montserrat transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-[#E5E4E3] text-[#52404B] hover:enabled:border-[#D1D1D1] hover:enabled:bg-[#FAFBF8]">
              <ArrowLeft size={11} /> Previous
            </button>

            <div className="flex items-center gap-1">
              {P3_CHAPTERS.map(ch => (
                <button key={ch.id} onClick={() => setChapter(ch.id)}
                  className={`rounded-full transition-all duration-200 ${ch.id === chapter ? 'bg-[#1d4ed8] w-5 h-2' : 'bg-[#D1D1D1] hover:bg-[#1d4ed8]/40 w-2 h-2'}`}
                  title={ch.label} />
              ))}
            </div>

            <button onClick={goNext} disabled={chapter === P3_CHAPTERS.length}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.1em] font-montserrat transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#1d4ed8] text-white hover:enabled:bg-[#1e40af]">
              Next <ArrowRight size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
