import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Monitor, AlertTriangle, Layers, GitBranch,
  Brain, Calendar, Settings, Sparkles, Shield, FileText, Users,
  CheckCircle, Play, RefreshCw, BookOpen, Database, Bell,
  Activity, ShieldCheck, ExternalLink, ChevronRight, HelpCircle,
  Landmark, Scale, Gavel, Target, Lock, Columns3, LayoutList,
  ClipboardList, UploadCloud, FilePlus2, Workflow, BadgeCheck,
  FileWarning, Stethoscope, Flame, Ban, Download, Printer,
  GraduationCap, UserCheck, AlertCircle, BarChart3, Zap, Cpu,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface ChapterDef {
  id: number;
  number: string;
  label: string;
  subtitle: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

const CHAPTERS: ChapterDef[] = [
  { id:  1, number: '01', label: 'System Overview',         subtitle: 'What This Is',              icon: Monitor },
  { id:  2, number: '02', label: 'The Challenge',           subtitle: 'Why It Matters',            icon: AlertTriangle },
  { id:  3, number: '03', label: 'Policy Architecture',     subtitle: 'The Foundation',            icon: Layers },
  { id:  4, number: '04', label: 'Authority Model',         subtitle: 'Governance Engine',         icon: GitBranch },
  { id:  5, number: '05', label: 'Regulatory Command Ctr',  subtitle: 'Dashboard + Calendar',      icon: Calendar },
  { id:  6, number: '06', label: 'Event Execution Engine',  subtitle: 'Workspace + Enforcement',   icon: Workflow },
  { id:  7, number: '07', label: 'Intelligence Layer',      subtitle: 'iAdministrator + Audit',    icon: Brain },
  { id:  8, number: '08', label: 'Forms System',            subtitle: 'Fillable + Print + Export', icon: FileText },
  { id:  9, number: '09', label: 'Onboarding Journey',      subtitle: 'Role-Based Competency',     icon: GraduationCap },
  { id: 10, number: '10', label: 'This Week',               subtitle: 'Major Upgrades',            icon: Sparkles },
];

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

function Tag({ text, color = '#007970', bg = '#E5FEFF' }: { text: string; color?: string; bg?: string }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-bold tracking-[0.25em] uppercase font-montserrat"
      style={{ color, background: bg }}
    >
      {text}
    </span>
  );
}

function ChapterHead({ number, subtitle, title }: { number: string; subtitle: string; title: string }) {
  return (
    <div className="mb-7">
      <div className="flex items-center gap-2 mb-2">
        <Tag text={`${number} — ${subtitle}`} />
      </div>
      <h1 className="text-[36px] font-light text-[#1F1C1B] font-montserrat leading-tight tracking-tight">{title}</h1>
    </div>
  );
}

function Metric({ value, label, sub, hi = false }: { value: string; label: string; sub: string; hi?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${hi ? 'bg-[#E5FEFF] border-[#007970]/20' : 'bg-white border-[#E5E4E3]'}`}>
      <div className={`text-[30px] font-light font-montserrat leading-none mb-2 ${hi ? 'text-[#007970]' : 'text-[#1F1C1B]'}`}>{value}</div>
      <div className="text-[12px] font-semibold text-[#1F1C1B] font-montserrat mb-0.5">{label}</div>
      <div className="text-[9px] text-[#747474] uppercase tracking-wider font-montserrat">{sub}</div>
    </div>
  );
}

function Link({ to, label, navigate }: { to: string; label: string; navigate: ReturnType<typeof useNavigate> }) {
  return (
    <button
      onClick={() => navigate(to)}
      className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#007970] hover:text-[#006360] uppercase tracking-[0.12em] font-montserrat transition-colors"
    >
      <ExternalLink size={11} />
      {label}
    </button>
  );
}

function Rule() { return <div className="my-6 border-t border-[#E5E4E3]" />; }

function FeatureRow({ icon: Icon, title, desc, color = '#007970' }: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any; title: string; desc: string; color?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#F5F5F5] last:border-0">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}12` }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div>
        <div className="text-[12px] font-semibold text-[#1F1C1B] font-montserrat">{title}</div>
        <div className="text-[11px] text-[#747474] leading-snug">{desc}</div>
      </div>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: color }} />;
}

function BulletList({ items, color = '#007970' }: { items: string[]; color?: string }) {
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <Dot color={color} />
          <span className="text-[11px] text-[#52404B] leading-snug">{item}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CH 01 — SYSTEM OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────

function Ch01({ navigate, onGoToPhase1 }: { navigate: ReturnType<typeof useNavigate>; onGoToPhase1: () => void }) {
  const caps = [
    { icon: Shield,         title: 'Policy Authority System',      desc: '269 policies, 10 domains, governed lifecycle, role-based access, regulatory cross-reference.',  hi: true },
    { icon: Calendar,       title: 'Regulatory Command Center',    desc: 'Dashboard + Planner. 3 calendar views. Real-time KPIs. Workflow deep-links. Google Calendar sync.', hi: false },
    { icon: Workflow,       title: 'Event Execution Engine',       desc: 'EventWorkspace, WorkflowDrawer, enforcement engine, risk scoring, escalations, audit trail.',      hi: false },
    { icon: Brain,          title: 'Intelligence Layer',           desc: 'iAdministrator: streaming command bar, 6 intents, studio tabs, structured outputs. Audit export.',  hi: false },
    { icon: FileText,       title: 'Forms System',                 desc: '281 fillable forms. Section-level rendering. Print-ready. HTML download. Policy-linked.',          hi: false },
    { icon: GraduationCap,  title: 'Onboarding Journey',          desc: 'SCORM + Appendix F gate, supervisor clearance, SignaturePad, admin dashboard, escalation engine.',   hi: false },
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto pres-chapter-enter">
      <ChapterHead number="01" subtitle="System Overview" title="Compliance Operating System" />

      <p className="text-[15px] text-[#52404B] leading-relaxed mb-7 max-w-[620px] font-roboto">
        A purpose-built compliance operating system for Medicare-certified home health agencies.
        Six integrated layers — not a document library, not a generic tool. Built to operate exactly
        as your agency must.
      </p>

      <div className="grid grid-cols-4 gap-3 mb-8">
        <Metric value="269"  label="Managed Policies"      sub="Enterprise-grade"       hi />
        <Metric value="281"  label="Operational Forms"     sub="Fillable + printable"       />
        <Metric value="10"   label="Policy Domains"        sub="Fully structured"           />
        <Metric value="7"    label="Regulatory Frameworks" sub="Mapped & aligned"           />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-7">
        {caps.map((cap, i) => {
          const Icon = cap.icon;
          return (
            <div key={i} className={`rounded-2xl border p-4 ${cap.hi ? 'bg-[#007970] border-[#007970]' : 'bg-white border-[#E5E4E3]'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${cap.hi ? 'bg-white/20' : 'bg-[#E5FEFF]'}`}>
                <Icon size={15} className={cap.hi ? 'text-white' : 'text-[#007970]'} />
              </div>
              <h3 className={`text-[11px] font-bold font-montserrat mb-1 leading-tight ${cap.hi ? 'text-white' : 'text-[#1F1C1B]'}`}>{cap.title}</h3>
              <p className={`text-[10px] leading-relaxed ${cap.hi ? 'text-white/70' : 'text-[#52404B]'}`}>{cap.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-[#1F1C1B] rounded-2xl p-5 flex items-center justify-between gap-6">
        <div>
          <div className="text-[9px] text-white/30 tracking-[0.3em] uppercase font-montserrat mb-2">The Core Shift</div>
          <div className="flex items-center gap-3 mb-1.5">
            <span className="text-white/25 text-[14px] line-through font-light">Policy Library</span>
            <span className="text-white/20">→</span>
            <span className="text-[#007970] text-[18px] font-semibold font-montserrat">Compliance Operating System</span>
          </div>
          <p className="text-white/35 text-[12px] max-w-xl leading-relaxed">
            Every policy connects to events, evidence requirements, forms, enforcement logic, and workflows. The system doesn't store compliance — it enforces it.
          </p>
        </div>
        <button onClick={onGoToPhase1}
          className="shrink-0 flex items-center gap-2 bg-[#C74601] text-white px-4 py-2.5 rounded-xl text-[10px] font-bold tracking-[0.12em] uppercase font-montserrat hover:bg-[#a83a00] transition-colors whitespace-nowrap">
          <Play size={12} /> Live Demo
        </button>
      </div>

      <div className="mt-5 flex items-center gap-4 flex-wrap">
        <Link to="/dashboard"     label="Command Center"     navigate={navigate} />
        <span className="text-[#D1D1D1]">·</span>
        <Link to="/library"       label="Policy Library"     navigate={navigate} />
        <span className="text-[#D1D1D1]">·</span>
        <Link to="/forms"         label="Forms Library"      navigate={navigate} />
        <span className="text-[#D1D1D1]">·</span>
        <Link to="/iadministrator" label="iAdministrator"   navigate={navigate} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CH 02 — THE CHALLENGE
// ─────────────────────────────────────────────────────────────────────────────

function Ch02() {
  const pain = [
    { icon: Landmark, n: '01', title: 'Regulatory Complexity at Scale',
      body: 'Agencies must simultaneously comply with 42 CFR Part 484, Title 22 (California), HIPAA Privacy & Security, OIG Compliance Guidance, False Claims Act, and Cal-OSHA — each with its own documentation requirements, audit standards, and enforcement consequences.',
      stat: '7 overlapping frameworks', c: '#C74601', bg: '#FFEEE5' },
    { icon: Shield, n: '02', title: 'Survey Exposure Without Warning',
      body: 'CMS surveyors arrive unannounced and audit against Conditions of Participation. Condition-level deficiencies can result in Plans of Correction, billing holds, or Medicare decertification. Agencies are judged on documentation that should have existed months or years earlier.',
      stat: 'Condition-level = existential risk', c: '#D70101', bg: '#FBE6E6' },
    { icon: Activity, n: '03', title: 'Operational Blind Spots',
      body: 'Missing physician signatures, overdue OASIS assessments, unsigned care plans, lapsed competency evaluations — all invisible in a document-based system. By the time they surface, they are already survey deficiencies or billing risks.',
      stat: 'Most citations are documentation failures', c: '#007970', bg: '#E5FEFF' },
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto pres-chapter-enter">
      <ChapterHead number="02" subtitle="The Challenge" title="Why It Matters" />
      <p className="text-[15px] text-[#52404B] leading-relaxed mb-7 max-w-[620px] font-roboto">
        Home health compliance is not a paperwork problem. It is an operational risk problem.
        The agencies that fail survey are not the ones with bad intentions — they are the ones with broken visibility.
      </p>
      <div className="space-y-4 mb-7">
        {pain.map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-[#E5E4E3] p-5 flex gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: p.bg }}>
                <Icon size={20} style={{ color: p.c }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-[9px] font-bold text-[#747474] tracking-[0.2em] font-montserrat">{p.n}</span>
                  <h3 className="text-[13px] font-semibold text-[#1F1C1B] font-montserrat">{p.title}</h3>
                </div>
                <p className="text-[12px] text-[#52404B] leading-relaxed mb-2.5">{p.body}</p>
                <Tag text={p.stat} color={p.c} bg={p.bg} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="rounded-2xl border-l-4 border-[#007970] bg-[#E5FEFF] p-5">
        <div className="text-[9px] font-bold text-[#007970] tracking-[0.25em] uppercase font-montserrat mb-1.5">The Guiding Principle</div>
        <p className="text-[15px] text-[#1F1C1B] font-montserrat font-light leading-snug">
          "Surveyors look for evidence, not interpretation. If it isn't documented, it didn't happen."
        </p>
        <p className="text-[11px] text-[#52404B] mt-1.5">This system is built on that principle — and enforces it at every layer.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CH 03 — POLICY ARCHITECTURE
// ─────────────────────────────────────────────────────────────────────────────

function Ch03({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const domains = [
    { code: 'GV', name: 'Governance',      count: 20,  color: '#00e59b' },
    { code: 'CL', name: 'Clinical Ops',    count: 57,  color: '#ef4444' },
    { code: 'QA', name: 'QAPI',            count: 16,  color: '#06b6d4' },
    { code: 'HR', name: 'Human Resources', count: 45,  color: '#8b5cf6' },
    { code: 'CO', name: 'Compliance',      count: 32,  color: '#3b82f6' },
    { code: 'FN', name: 'Finance',         count: 19,  color: '#10b981' },
    { code: 'OP', name: 'Operations',      count: 20,  color: '#f97316' },
    { code: 'IT', name: 'IT & Security',   count: 19,  color: '#6366f1' },
    { code: 'RM', name: 'Risk Mgmt',       count: 15,  color: '#eab308' },
    { code: 'EN', name: 'Enterprise Ctrl', count:  6,  color: '#ec4899' },
  ];
  const fx = [
    { name: '42 CFR Part 484',    c: '#007970', Icon: Scale },
    { name: 'Title 22 (CA)',      c: '#b45309', Icon: Landmark },
    { name: 'HIPAA P&S',          c: '#1d4ed8', Icon: Lock },
    { name: 'CMS State Ops',      c: '#6d28d9', Icon: ShieldCheck },
    { name: 'OIG Guidance',       c: '#7c3aed', Icon: Target },
    { name: 'False Claims Act',   c: '#9333ea', Icon: Gavel },
    { name: 'OSHA / Cal-OSHA',    c: '#b45309', Icon: Shield },
  ];
  const levels = [
    { l: 'L1', t: 'Regulatory Foundation',  d: '7 federal & state frameworks — mapped & cross-referenced' },
    { l: 'L2', t: '10 Strategic Domains',   d: 'GV, CL, QA, HR, CO, FN, OP, IT, RM, EN' },
    { l: 'L3', t: '44 Subdomains',           d: 'Structural pillars within each domain (e.g. CL-PA, CL-CP, CL-OA)' },
    { l: 'L4', t: '269 Policies',            d: 'Full metadata: owner, version, status, lifecycle, regulatory tags' },
    { l: 'L5', t: '281 Forms & Appendices', d: 'Fillable operational forms connected directly to governing policies' },
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto pres-chapter-enter">
      <ChapterHead number="03" subtitle="Policy Architecture" title="The Foundation" />
      <p className="text-[14px] text-[#52404B] leading-relaxed mb-7 max-w-[600px] font-roboto">
        269 managed policies organized into 10 strategic domains, each mapped to 7 regulatory frameworks.
        Every artifact has an owner, lifecycle, review cycle, and regulatory cross-references.
      </p>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <Metric value="10"   label="Strategic Domains"    sub="Top-level" hi />
        <Metric value="44"   label="Subdomains"            sub="Structural pillars" />
        <Metric value="269"  label="Total Policies"        sub="Managed artifacts" />
        <Metric value="281"  label="Forms & Appendices"   sub="Policy-connected" hi />
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5 mb-4">
        <div className="text-[9px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-3">Regulatory Frameworks</div>
        <div className="flex flex-wrap gap-2">
          {fx.map((r, i) => (
            <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-bold font-montserrat uppercase tracking-wider"
              style={{ borderColor: `${r.c}35`, background: `${r.c}0D`, color: r.c }}>
              <r.Icon size={10} /> {r.name}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {domains.map((d, i) => (
          <div key={i} className="p-3 rounded-xl border border-[#E5E4E3] hover:border-[#D1D1D1] transition-colors">
            <div className="text-[15px] font-bold font-mono mb-0.5" style={{ color: d.color }}>{d.code}</div>
            <div className="text-[9px] text-[#52404B] font-medium mb-0.5 leading-tight">{d.name}</div>
            <div className="text-[12px] font-semibold text-[#1F1C1B]">{d.count}</div>
            <div className="text-[8px] text-[#747474] uppercase tracking-wider">policies</div>
          </div>
        ))}
      </div>

      <div className="bg-[#FAFBF8] rounded-2xl border border-[#E5E4E3] p-5 mb-5">
        <div className="text-[9px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-3">Architecture Hierarchy</div>
        <div className="space-y-2.5">
          {levels.map((lv, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-7 rounded-lg bg-[#E5FEFF] border border-[#007970]/15 flex items-center justify-center shrink-0">
                <span className="text-[8px] font-bold text-[#007970] font-mono">{lv.l}</span>
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-semibold text-[#1F1C1B] font-montserrat mr-2">{lv.t}</span>
                <span className="text-[10px] text-[#747474]">{lv.d}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <Link to="/library"   label="Policy Library"  navigate={navigate} />
        <span className="text-[#D1D1D1]">·</span>
        <Link to="/framework" label="Framework View"  navigate={navigate} />
        <span className="text-[#D1D1D1]">·</span>
        <Link to="/forms"     label="Forms Library"   navigate={navigate} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CH 04 — AUTHORITY MODEL
// ─────────────────────────────────────────────────────────────────────────────

function Ch04({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const lifecycle = [
    { s: 'DRAFT',        c: '#f97316', bg: '#FFF7ED', d: 'Initial creation' },
    { s: 'REVIEW',       c: '#3b82f6', bg: '#EFF6FF', d: 'Stakeholder review' },
    { s: 'APPROVED',     c: '#8b5cf6', bg: '#F5F3FF', d: 'GB approval' },
    { s: 'ACTIVE',       c: '#007970', bg: '#E5FEFF', d: 'Published & enforced' },
    { s: 'UNDER REVIEW', c: '#eab308', bg: '#FEFCE8', d: 'Scheduled revision' },
  ];
  const roles = [
    { tier: 'T1', role: 'Governing Body',    access: 'Full authority + final approval',    c: '#007970' },
    { tier: 'T2', role: 'Administrator',     access: 'Edit, submit, delegate',             c: '#3b82f6' },
    { tier: 'T3', role: 'Clinical Manager',  access: 'Review, annotate, escalate',         c: '#8b5cf6' },
    { tier: 'T4', role: 'Staff',             access: 'Read-only, acknowledgment required', c: '#747474' },
  ];
  const checks = [
    'Every revision creates a versioned record',
    'Superseded versions archived — never deleted',
    'Approval history immutable and time-stamped',
    'Re-acknowledgment required within 14 days of revision',
    'Only the current approved version is operationally active',
    'Policy-ID format enforced: XX-XX-NNN',
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto pres-chapter-enter">
      <ChapterHead number="04" subtitle="Authority Model" title="The Governance Engine" />
      <p className="text-[14px] text-[#52404B] leading-relaxed mb-7 max-w-[600px] font-roboto">
        No policy can be active without proper authorization. No change occurs without version tracking.
        No access proceeds without role-based permission.
      </p>

      <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5 mb-4">
        <div className="text-[9px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-4">Policy Lifecycle</div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {lifecycle.map((step, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <div className="text-center px-4 py-2.5 rounded-xl border min-w-[90px]" style={{ background: step.bg, borderColor: `${step.c}25` }}>
                <div className="text-[9px] font-bold tracking-[0.12em] font-montserrat" style={{ color: step.c }}>{step.s}</div>
                <div className="text-[9px] text-[#52404B] mt-0.5">{step.d}</div>
              </div>
              {i < lifecycle.length - 1 && <ChevronRight size={14} className="text-[#D1D1D1] shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-[#E5FEFF] rounded-lg flex items-center justify-center">
              <Users size={13} className="text-[#007970]" />
            </div>
            <div className="text-[11px] font-semibold text-[#1F1C1B] font-montserrat">Role-Based Access Tiers</div>
          </div>
          <div className="space-y-2">
            {roles.map((t, i) => (
              <div key={i} className="flex items-center gap-2.5 py-1.5 border-b border-[#F5F5F5] last:border-0">
                <span className="w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-bold font-mono shrink-0"
                  style={{ background: `${t.c}10`, color: t.c, border: `1px solid ${t.c}20` }}>{t.tier}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold text-[#1F1C1B]">{t.role}</div>
                  <div className="text-[9px] text-[#747474]">{t.access}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-[#E5FEFF] rounded-lg flex items-center justify-center">
              <RefreshCw size={13} className="text-[#007970]" />
            </div>
            <div className="text-[11px] font-semibold text-[#1F1C1B] font-montserrat">Version Control</div>
          </div>
          <BulletList items={checks} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/drafts"  label="Draft Policies"  navigate={navigate} />
        <span className="text-[#D1D1D1]">·</span>
        <Link to="/review"  label="Review Queue"    navigate={navigate} />
        <span className="text-[#D1D1D1]">·</span>
        <Link to="/publish" label="Publish Pipeline" navigate={navigate} />
        <span className="text-[#D1D1D1]">·</span>
        <Link to="/taxonomy" label="Taxonomy Admin"  navigate={navigate} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CH 05 — REGULATORY COMMAND CENTER
// ─────────────────────────────────────────────────────────────────────────────

function Ch05({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const kpis = [
    { icon: Flame,       label: 'Critical',         desc: 'Overdue or immediate-jeopardy events',        color: '#D70101', bg: '#FBE6E6' },
    { icon: Clock,       label: 'Due This Week',     desc: 'Events within 7 days requiring action',       color: '#f97316', bg: '#FFF7ED' },
    { icon: FileWarning, label: 'Missing Evidence',  desc: 'Events where required forms are absent',      color: '#eab308', bg: '#FEFCE8' },
    { icon: Landmark,    label: 'Governance',        desc: 'Active governing body actions required',      color: '#6366f1', bg: '#EEF2FF' },
    { icon: Stethoscope, label: 'Billing Risk',      desc: 'Events that affect revenue cycle compliance', color: '#3b82f6', bg: '#EFF6FF' },
    { icon: Ban,         label: 'Blocked',           desc: 'Dependency or enforcement-locked events',     color: '#52404B', bg: '#F5F0F0' },
  ];
  const views = [
    { icon: LayoutList, label: 'Month Grid',      desc: 'Calendar grid with domain-colored event chips and urgency indicators' },
    { icon: Columns3,   label: 'Agenda View',     desc: 'Linear event list with due dates, domain badges, and urgency status' },
    { icon: Settings,   label: 'Swimlane View',   desc: 'Domain-separated lanes showing parallel compliance tracks' },
  ];
  const quickActions = [
    { icon: ClipboardList, label: 'Schedule Event',      desc: 'Add event to calendar' },
    { icon: Workflow,      label: 'Start Workflow',       desc: 'Open WorkflowDrawer for step-by-step execution' },
    { icon: FilePlus2,     label: 'Create Task',          desc: 'Attach task to an event' },
    { icon: UploadCloud,   label: 'Upload Document',      desc: 'Attach evidence or minutes' },
    { icon: BarChart3,     label: 'Generate Report',      desc: 'Export audit packet or summary' },
    { icon: BadgeCheck,    label: 'Request Approval',     desc: 'Push to approval flow' },
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto pres-chapter-enter">
      <ChapterHead number="05" subtitle="Dashboard + Calendar" title="Regulatory Command Center" />

      <p className="text-[14px] text-[#52404B] leading-relaxed mb-7 max-w-[620px] font-roboto">
        The Dashboard and Calendar are a unified action surface — not a display, not a list.
        Every item is linked to workflows, enforcement state, evidence requirements, and approval flows.
      </p>

      {/* KPI tiles */}
      <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5 mb-4">
        <div className="text-[9px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-3 flex items-center gap-2">
          <BarChart3 size={11} className="text-[#007970]" /> Dashboard KPIs — Live Computed
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {kpis.map((k, i) => {
            const Icon = k.icon;
            return (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl border border-[#E5E4E3] hover:border-[#D1D1D1] transition-colors">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: k.bg }}>
                  <Icon size={13} style={{ color: k.color }} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#1F1C1B] font-montserrat">{k.label}</div>
                  <div className="text-[9px] text-[#747474] leading-snug">{k.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar views */}
      <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5 mb-4">
        <div className="text-[9px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-3 flex items-center gap-2">
          <Calendar size={11} className="text-[#007970]" /> Regulatory Planner — 3 Calendar Views
        </div>
        <div className="grid grid-cols-3 gap-3">
          {views.map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={i} className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E5E4E3]">
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon size={13} className="text-[#007970]" />
                  <span className="text-[11px] font-semibold text-[#1F1C1B] font-montserrat">{v.label}</span>
                </div>
                <p className="text-[10px] text-[#747474] leading-snug">{v.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {['Domain filter + legend', 'URL-driven filters (?q=overdue)', 'Autogen: generate full year', 'Google Calendar sync via backend', 'Event workspace panel on click'].map((item, i) => (
            <span key={i} className="px-2 py-1 rounded bg-[#E5FEFF] text-[9px] font-semibold text-[#007970] font-montserrat">{item}</span>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5 mb-5">
        <div className="text-[9px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-3 flex items-center gap-2">
          <Zap size={11} className="text-[#007970]" /> Quick Actions — Right Rail
        </div>
        <div className="grid grid-cols-3 gap-2">
          {quickActions.map((qa, i) => {
            const Icon = qa.icon;
            return (
              <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[#E5E4E3] bg-[#FAFBF8]">
                <Icon size={13} className="text-[#007970] shrink-0" />
                <div>
                  <div className="text-[10px] font-semibold text-[#1F1C1B]">{qa.label}</div>
                  <div className="text-[9px] text-[#747474]">{qa.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/dashboard" label="Open Dashboard"         navigate={navigate} />
        <span className="text-[#D1D1D1]">·</span>
        <Link to="/calendar"  label="Open Regulatory Planner" navigate={navigate} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CH 06 — EVENT EXECUTION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function Ch06({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const workspaceTabs = [
    { label: 'Process Flow',  desc: 'Step-by-step workflow with expand/collapse, form links, validate & complete' },
    { label: 'Forms',         desc: 'Required forms with status (complete / missing / pending)' },
    { label: 'Minutes',       desc: 'Meeting minutes capture and status tracking' },
    { label: 'Evidence',      desc: 'Document upload with status tracking' },
    { label: 'Help',          desc: 'Contextual help articles linked to the current event' },
  ];
  const enforcementOutputs = [
    { icon: Ban,          label: 'Blockers',           desc: 'Hard stops — missing required items that prevent completion',     c: '#D70101' },
    { icon: AlertTriangle, label: 'Warnings',          desc: 'Soft flags — items at risk of creating a deficiency',            c: '#f97316' },
    { icon: Clock,        label: 'Timeline Issues',    desc: 'Deadline violations or sequence problems',                       c: '#eab308' },
    { icon: ShieldCheck,  label: 'Approval Gaps',      desc: 'Required approvals that are pending or missing',                 c: '#8b5cf6' },
    { icon: Lock,         label: 'Lock State',          desc: 'Events locked due to dependency chain failures',                c: '#52404B' },
    { icon: Activity,     label: 'Risk Score',          desc: 'Computed risk level: critical / high / medium / low',           c: '#3b82f6' },
  ];
  const reminderTiers = ['60 days', '30 days', '14 days', '7 days', '1 day', 'Day of', 'Overdue'];

  return (
    <div className="p-8 max-w-[960px] mx-auto pres-chapter-enter">
      <ChapterHead number="06" subtitle="Workspace + Enforcement" title="Event Execution Engine" />

      <p className="text-[14px] text-[#52404B] leading-relaxed mb-7 max-w-[620px] font-roboto">
        Clicking an event doesn't just show details — it opens a live execution surface.
        Every event has a workspace, a step-by-step workflow, an enforcement layer, and a full audit trail.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Event Workspace */}
        <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-[#E5FEFF] rounded-lg flex items-center justify-center">
              <Workflow size={13} className="text-[#007970]" />
            </div>
            <div className="text-[12px] font-semibold text-[#1F1C1B] font-montserrat">Event Workspace (3-column)</div>
          </div>
          <div className="text-[10px] text-[#52404B] mb-3 leading-relaxed">
            Full execution surface with sync/mandate controls, completion + enforcement cards, and an approval flow panel.
          </div>
          <div className="space-y-1.5">
            {workspaceTabs.map((t, i) => (
              <div key={i} className="flex items-start gap-2 py-1 border-b border-[#F5F5F5] last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#007970] mt-1.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-semibold text-[#1F1C1B]">{t.label}: </span>
                  <span className="text-[10px] text-[#747474]">{t.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WorkflowDrawer */}
        <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-[#FFF7ED] rounded-lg flex items-center justify-center">
              <Settings size={13} className="text-[#f97316]" />
            </div>
            <div className="text-[12px] font-semibold text-[#1F1C1B] font-montserrat">WorkflowDrawer</div>
          </div>
          <div className="text-[10px] text-[#52404B] mb-3 leading-relaxed">
            Slide-out step-by-step execution panel. Opens via Quick Action or URL param <code className="text-[9px] bg-[#F5F5F5] px-1 py-0.5 rounded text-[#52404B]">?workflow=1</code>.
          </div>
          <BulletList color="#f97316" items={[
            'Expand/collapse individual steps',
            'Form links per step with completion state',
            'Validate step before marking complete',
            'Auto-advance on completion',
            'Enforcement check before final mark-complete',
          ]} />
        </div>
      </div>

      {/* Enforcement Engine */}
      <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-[#FBE6E6] rounded-lg flex items-center justify-center">
            <Shield size={13} className="text-[#D70101]" />
          </div>
          <div className="text-[12px] font-semibold text-[#1F1C1B] font-montserrat">Enforcement Engine — Pure Computation Layer</div>
        </div>
        <p className="text-[10px] text-[#52404B] mb-3 leading-relaxed">
          Stateless <code className="bg-[#F5F5F5] px-1 py-0.5 rounded text-[9px]">computeEnforcement()</code> function: locks, steps, forms, evidence, minutes, approvals, dependencies, and timeline → produces <code className="bg-[#F5F5F5] px-1 py-0.5 rounded text-[9px]">canComplete</code>, risk level, and summary. Used by UI and audit export identically.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {enforcementOutputs.map((e, i) => {
            const Icon = e.icon;
            return (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg border border-[#E5E4E3] bg-[#FAFBF8]">
                <Icon size={13} style={{ color: e.c }} className="shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-semibold text-[#1F1C1B]">{e.label}</div>
                  <div className="text-[9px] text-[#747474] leading-snug">{e.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reminder tiers + stores */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-[#FAFBF8] rounded-2xl border border-[#E5E4E3] p-4">
          <div className="text-[9px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-3">Reminder Engine — 7 Tiers</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {reminderTiers.map((t, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-semibold font-mono ${t === 'Overdue' ? 'bg-[#FBE6E6] border-[#D70101]/20 text-[#D70101]' : 'bg-white border-[#E5E4E3] text-[#1F1C1B]'}`}>{t}</span>
                {i < reminderTiers.length - 1 && <ChevronRight size={9} className="text-[#D1D1D1]" />}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#FAFBF8] rounded-2xl border border-[#E5E4E3] p-4">
          <div className="text-[9px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-3">Stores — Persistent State</div>
          <BulletList items={[
            'regulatoryExecutionStore: steps, forms, minutes, evidence, approvals',
            'enforcementStore: actor, 5000-cap audit log, locks, escalations',
            'calendarSyncStore: Google Calendar sync state',
            'autogenStore: generated events for the year',
          ]} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/calendar" label="Open Regulatory Planner" navigate={navigate} />
        <span className="text-[#D1D1D1]">·</span>
        <Link to="/audit"    label="Audit Export Mode"        navigate={navigate} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CH 07 — INTELLIGENCE LAYER
// ─────────────────────────────────────────────────────────────────────────────

function Ch07({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const intents = [
    { id: 'question',              label: 'Question',              desc: 'Policy Q&A anchored to corpus',              c: '#007970', bg: '#E5FEFF' },
    { id: 'pre_survey_audit',      label: 'Pre-Survey Audit',      desc: 'Full readiness assessment with risk rating',  c: '#D70101', bg: '#FBE6E6' },
    { id: 'action_plan',           label: 'Action Plan',           desc: 'Corrective action with ownership + timelines', c: '#f97316', bg: '#FFF7ED' },
    { id: 'governing_body_brief',  label: 'Governing Body Brief',  desc: 'Executive compliance brief format',           c: '#6366f1', bg: '#EEF2FF' },
    { id: 'qapi_digest',           label: 'QAPI Digest',           desc: 'Quality program status and PIP summary',      c: '#3b82f6', bg: '#EFF6FF' },
    { id: 'knowledge_article',     label: 'Knowledge Article',     desc: 'Long-form structured guidance output',        c: '#8b5cf6', bg: '#F5F3FF' },
  ];
  const responseOutputs = [
    'StructuredAnswer — formatted result with sections',
    'RequirementsSnapshot — extracted policy requirements',
    'CitationChips — linked policy IDs with preview',
    'ReferenceCards — full document cards with open action',
    'AvailableActions — one-click follow-up actions',
    'OperationalGaps — detected missing operational state',
    'RegulatoryAlerts — CMS/OIG update flags',
  ];
  const auditExport = [
    'Agency risk summary (Compliant / At Risk / Non-Compliant)',
    'Event drill-down: risk rationale + drivers',
    'BlockerPanel per event',
    'Workflow + required forms list',
    'Enforcement audit trail (append-only log)',
    'Export: Markdown + JSON audit bundle download',
    'Filters: immediate jeopardy, high, overdue, missing evidence, approval gap, locked',
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto pres-chapter-enter">
      <ChapterHead number="07" subtitle="iAdministrator + Audit Export" title="The Intelligence Layer" />

      <p className="text-[14px] text-[#52404B] leading-relaxed mb-7 max-w-[620px] font-roboto">
        The intelligence layer has two surfaces: the iAdministrator (live command workspace with streaming AI)
        and the Audit Mode (surveyor-style risk export). Both are backed by the enforcement engine.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* iAdministrator */}
        <div className="rounded-2xl border-2 border-[#007970] bg-white p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-[#E5FEFF] rounded-xl flex items-center justify-center">
              <Brain size={17} className="text-[#007970]" />
            </div>
            <div>
              <div className="text-[9px] text-[#007970] font-bold tracking-[0.2em] font-montserrat uppercase">Intelligence Workspace</div>
              <div className="text-[13px] font-semibold text-[#1F1C1B] font-montserrat">iAdministrator</div>
            </div>
          </div>
          <div className="space-y-1.5 mb-4">
            <FeatureRow icon={Zap}        title="Streaming Command Bar" desc="SSE-streamed responses. Phase-1 retrieval preloads top doc." color="#007970" />
            <FeatureRow icon={Cpu}        title="Studio Tabs → Intent"  desc="Tabs change query intent and re-run last command automatically" color="#3b82f6" />
            <FeatureRow icon={Settings}   title="Right Panel Preview"   desc="Document preview for citations — opens side-by-side" color="#8b5cf6" />
            <FeatureRow icon={HelpCircle} title="BradHelpCenter"        desc="In-app help with contextual guidance on using iAdministrator" color="#747474" />
          </div>
          <div className="text-[9px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-2">Response Outputs</div>
          <BulletList items={responseOutputs} />
        </div>

        {/* Audit Mode */}
        <div className="rounded-2xl border-2 border-[#D70101] bg-white p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-[#FBE6E6] rounded-xl flex items-center justify-center">
              <Shield size={17} className="text-[#D70101]" />
            </div>
            <div>
              <div className="text-[9px] text-[#D70101] font-bold tracking-[0.2em] font-montserrat uppercase">Survey Mode</div>
              <div className="text-[13px] font-semibold text-[#1F1C1B] font-montserrat">Audit Export Mode</div>
            </div>
          </div>
          <p className="text-[11px] text-[#52404B] mb-3 leading-relaxed">
            Dedicated surveyor-style view: agency-wide risk assessment, event drill-down with enforcement details, and downloadable audit bundle.
          </p>
          <BulletList color="#D70101" items={auditExport} />
        </div>
      </div>

      {/* Intents */}
      <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5 mb-5">
        <div className="text-[9px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-3">
          6 Query Intents — Studio Tabs
        </div>
        <div className="grid grid-cols-3 gap-2">
          {intents.map((intent, i) => (
            <div key={i} className="p-2.5 rounded-xl border border-[#E5E4E3]" style={{ borderColor: `${intent.c}20` }}>
              <Tag text={intent.label} color={intent.c} bg={intent.bg} />
              <div className="text-[9px] text-[#747474] mt-1.5 leading-snug">{intent.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample questions */}
      <div className="bg-[#1F1C1B] rounded-2xl p-5 mb-5">
        <div className="text-[9px] text-white/30 tracking-[0.25em] uppercase font-montserrat mb-2.5">Sample Queries</div>
        <div className="grid grid-cols-2 gap-2">
          {['"Are we ready for survey?"', '"Who is overdue for OIG screening?"', '"What is missing for QAPI compliance?"', '"Which policies are pending approval?"'].map((q, i) => (
            <div key={i} className="px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-[11px] text-white/65 font-mono">{q}</div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/iadministrator" label="Open iAdministrator" navigate={navigate} />
        <span className="text-[#D1D1D1]">·</span>
        <Link to="/audit"          label="Audit Export Mode"   navigate={navigate} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CH 08 — FORMS SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

function Ch08({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const sectionTypes = [
    { label: 'Grid Fields',          desc: 'Labeled inputs in responsive grid layout' },
    { label: 'Table Rows',           desc: 'Multi-column tabular data entry' },
    { label: 'Checklist',            desc: 'Items with date / initials / notes columns' },
    { label: 'Attestation',          desc: 'Policy statement + confirmation checkbox' },
    { label: 'Signature Block',      desc: 'Name, role, date, and signature placeholder' },
    { label: 'Narrative Textarea',   desc: 'Open-text clinical or administrative notes' },
    { label: 'Matrix',               desc: 'Multi-row / multi-column scoring tables' },
  ];
  const fieldTypes = [
    'Text', 'Textarea', 'Select', 'Checkbox', 'Radio', 'Signature placeholder',
  ];
  const formDomains = [
    { code: 'CL', name: 'Clinical',    count: 57,  color: '#ef4444' },
    { code: 'HR', name: 'HR',          count: 39,  color: '#8b5cf6' },
    { code: 'CO', name: 'Compliance',  count: 39,  color: '#3b82f6' },
    { code: 'GV', name: 'Governance',  count: 25,  color: '#00e59b' },
    { code: 'OP', name: 'Operations',  count: 20,  color: '#f97316' },
    { code: 'QA', name: 'QAPI',        count: 13,  color: '#06b6d4' },
    { code: 'IT', name: 'IT',          count: 30,  color: '#6366f1' },
    { code: 'RM', name: 'Risk',        count: 16,  color: '#eab308' },
    { code: 'FN', name: 'Finance',     count: 13,  color: '#10b981' },
    { code: 'EN', name: 'Enterprise',  count: 29,  color: '#ec4899' },
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto pres-chapter-enter">
      <ChapterHead number="08" subtitle="Fillable + Print + Export" title="The Forms System" />

      <p className="text-[14px] text-[#52404B] leading-relaxed mb-7 max-w-[620px] font-roboto">
        281 operational forms — not static PDFs. Every form is dynamically rendered with fillable fields,
        linked to its governing policy, and designed for both screen use and print submission.
      </p>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <Metric value="281"  label="Total Forms"      sub="Across all domains" hi />
        <Metric value="7"    label="Section Types"    sub="Rendered dynamically" />
        <Metric value="6"    label="Field Types"      sub="Fillable & typed" />
        <Metric value="10"   label="Domains Covered"  sub="Full coverage" hi />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* FormViewer */}
        <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-[#E5FEFF] rounded-lg flex items-center justify-center">
              <FileText size={13} className="text-[#007970]" />
            </div>
            <div className="text-[12px] font-semibold text-[#1F1C1B] font-montserrat">FormViewer — Live Renderer</div>
          </div>
          <div className="space-y-1.5 mb-4">
            <FeatureRow icon={Printer}    title="Print-Ready"         desc="window.print() with custom document.title for print headers; portrait and landscape support" color="#007970" />
            <FeatureRow icon={Download}   title="HTML Download"       desc="Saves complete rendered form as {id}.html — preserves all styles and layout" color="#3b82f6" />
            <FeatureRow icon={FileText}   title="Policy-Linked"       desc="Linked policy chips — click to open the governing policy in the library" color="#8b5cf6" />
            <FeatureRow icon={Settings}   title="Shell Integration"   desc="Sets detail-mode via useShellStore to hide nav chrome during form view" color="#747474" />
          </div>
          <div className="text-[9px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-2">Field Types</div>
          <div className="flex flex-wrap gap-1.5">
            {fieldTypes.map((f, i) => (
              <span key={i} className="px-2 py-1 rounded text-[9px] font-semibold font-montserrat bg-[#FAFBF8] border border-[#E5E4E3] text-[#52404B]">{f}</span>
            ))}
          </div>
        </div>

        {/* Section types */}
        <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-[#EFF6FF] rounded-lg flex items-center justify-center">
              <LayoutList size={13} className="text-[#3b82f6]" />
            </div>
            <div className="text-[12px] font-semibold text-[#1F1C1B] font-montserrat">7 Section Rendering Types</div>
          </div>
          <div className="space-y-1.5">
            {sectionTypes.map((s, i) => (
              <div key={i} className="flex items-start gap-2 py-1 border-b border-[#F5F5F5] last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-1.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-semibold text-[#1F1C1B]">{s.label}: </span>
                  <span className="text-[10px] text-[#747474]">{s.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Domain breakdown */}
      <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5 mb-5">
        <div className="text-[9px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-3">Forms by Domain</div>
        <div className="grid grid-cols-5 gap-2">
          {formDomains.map((d, i) => (
            <div key={i} className="text-center p-2.5 rounded-xl border border-[#E5E4E3]">
              <div className="text-[16px] font-semibold font-mono" style={{ color: d.color }}>{d.count}</div>
              <div className="text-[8px] text-[#52404B] uppercase tracking-wider font-montserrat">{d.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/forms"        label="Open Forms Library"  navigate={navigate} />
        <span className="text-[#D1D1D1]">·</span>
        <Link to="/forms/CL-FM-001" label="Open a Form"     navigate={navigate} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CH 09 — ONBOARDING JOURNEY
// ─────────────────────────────────────────────────────────────────────────────

function Ch09({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const phases = [
    { id: 'GAO',         label: 'General Agency Orientation',    desc: 'Agency overview, mission, values, regulatory baseline',              c: '#007970' },
    { id: 'Role',        label: 'Role-Specific Training',        desc: 'Discipline-specific policies, competencies, protocols',              c: '#3b82f6' },
    { id: 'Supervised',  label: 'Supervised Practice',           desc: 'Observed visits, mentor assignments, supervised competency demos',   c: '#8b5cf6' },
    { id: 'Clearance',   label: 'Clearance & Sign-Off',          desc: 'Supervisor signature (SignaturePad), DON clearance for independent work', c: '#f97316' },
    { id: 'Annual',      label: 'Annual/Drill Updates',          desc: 'Recurring competency validation, mandatory annual training',         c: '#D70101' },
  ];
  const stores = [
    'Persisted Zustand: employees, attempts, evidence',
    'Appendix F per employee + HR Director sign-off rules',
    'SCORM commits and pass/fail records',
    'Manual assessment evidence capture',
    'clearForIndependentWork + escalation recompute',
    'Supervised visit logs and remediation tracking',
  ];
  const views = [
    { icon: GraduationCap, title: 'Journey Home',     desc: 'Phase rail, module cards, gate banners, employee picker, guide link' },
    { icon: Play,          title: 'Module Player',    desc: 'SCORM player OR evidence capture for non-SCORM methods; pass/fail state' },
    { icon: UserCheck,     title: 'Supervisor View',  desc: 'Roster, clearance with SignaturePad, visit logs, remediation management' },
    { icon: BarChart3,     title: 'Admin Dashboard',  desc: 'Agency-wide KPIs, escalation table, evidence audit trail' },
    { icon: FileText,      title: 'Appendix F',       desc: 'Structured Appendix F gate with HR Director sign-off and compliance rules' },
    { icon: BookOpen,      title: 'User Guide',       desc: 'In-app guide for navigating the onboarding journey system' },
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto pres-chapter-enter">
      <ChapterHead number="09" subtitle="Role-Based Competency" title="Onboarding Journey" />

      <p className="text-[14px] text-[#52404B] leading-relaxed mb-7 max-w-[620px] font-roboto">
        A complete role-based onboarding and competency system — SCORM-capable, gate-enforced,
        supervisor-cleared, and fully tracked. Not an LMS. An operationally integrated compliance journey.
      </p>

      {/* Phases */}
      <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5 mb-4">
        <div className="text-[9px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-4">Journey Phases</div>
        <div className="flex flex-col gap-3">
          {phases.map((p, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold text-white font-mono" style={{ background: p.c }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="flex-1 py-0.5">
                <div className="text-[11px] font-semibold text-[#1F1C1B] font-montserrat">{p.label}</div>
                <div className="text-[10px] text-[#747474] leading-snug">{p.desc}</div>
              </div>
              {i < phases.length - 1 && <div className="shrink-0 mt-7 ml-[-17px]"><div className="w-px h-5 bg-[#E5E4E3] ml-3" /></div>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Key views */}
        <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5">
          <div className="text-[9px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-3">6 Journey Views</div>
          <div className="space-y-1.5">
            {views.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="flex items-start gap-2 py-1 border-b border-[#F5F5F5] last:border-0">
                  <Icon size={11} className="text-[#007970] mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-semibold text-[#1F1C1B]">{v.title}: </span>
                    <span className="text-[10px] text-[#747474]">{v.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data model */}
        <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5">
          <div className="text-[9px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-3">Journey Store</div>
          <BulletList items={stores} />
          <Rule />
          <div className="text-[9px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-2">Gate Logic</div>
          <BulletList color="#8b5cf6" items={[
            'canStartModule() — enforces phase gates',
            'GateBanner shown for locked modules',
            'Appendix F gate before clearance phase',
            'Escalation recompute on status change',
          ]} />
        </div>
      </div>

      {/* SCORM callout */}
      <div className="bg-[#1F1C1B] rounded-2xl p-5 mb-5 flex items-start gap-4">
        <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
          <GraduationCap size={18} className="text-white/80" />
        </div>
        <div>
          <div className="text-[9px] text-white/30 tracking-[0.25em] uppercase font-montserrat mb-1">SCORM Runtime</div>
          <div className="text-[13px] text-white font-montserrat font-light mb-1">Full SCORM runtime with ScormPlayer + ScormRuntime.ts</div>
          <p className="text-[11px] text-white/45 leading-relaxed">
            Supports SCORM modules OR alternate evidence capture paths. Commit, suspend, and resume. Pass/fail routed to journeyStore. Non-SCORM paths use EvidenceCapture component.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/journey"            label="Open Journey Home"    navigate={navigate} />
        <span className="text-[#D1D1D1]">·</span>
        <Link to="/journey/supervisor" label="Supervisor View"      navigate={navigate} />
        <span className="text-[#D1D1D1]">·</span>
        <Link to="/journey/admin"      label="Admin Dashboard"      navigate={navigate} />
        <span className="text-[#D1D1D1]">·</span>
        <Link to="/journey/appendix-f" label="Appendix F"           navigate={navigate} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CH 10 — THIS WEEK'S UPGRADES
// ─────────────────────────────────────────────────────────────────────────────

function Ch10({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const upgrades = [
    {
      tag: 'REDESIGN',   tagC: '#007970',  tagBg: '#E5FEFF',  impact: 'HIGH',   impC: '#D70101',
      title: 'Regulatory Command Center — Dashboard + Calendar',
      desc: 'Dashboard and Calendar redesigned into a unified compliance command surface. Replaced passive display with an action-oriented system: 6 real-time KPI tiles, 3 calendar views (month/agenda/swimlane), Google Calendar sync, autogen-year, URL-driven filters from dashboard to calendar.',
      points: ['computeKpis() + domainSummary() driving live KPI cards', '3 calendar views: MonthGrid, AgendaView, SwimlaneView', 'Quick Actions: schedule, start workflow, create task, upload, report, request approval', 'URL params: ?q=filter and ?event=id and ?workflow=1 for deep-linking'],
      links: [{ l: 'Dashboard', to: '/dashboard' }, { l: 'Calendar', to: '/calendar' }],
    },
    {
      tag: 'NEW',        tagC: '#3b82f6',  tagBg: '#EFF6FF',  impact: 'HIGH',   impC: '#D70101',
      title: 'Event Execution Engine — EventWorkspace + WorkflowDrawer + Enforcement',
      desc: 'Clicking a calendar event now opens a 3-column execution workspace with 5 content tabs (Process Flow, Forms, Minutes, Evidence, Help). The WorkflowDrawer provides step-by-step guided execution. The enforcement engine provides stateless blockers, warnings, risk scoring, and escalation resolution.',
      points: ['EventWorkspace: 3-column layout, ApprovalFlow, sync/mandate controls', 'WorkflowDrawer: slide-out step execution, URL-triggered via ?workflow=1', 'Enforcement engine: computeEnforcement() → canComplete + risk + blockers', 'Escalation engine + role hierarchy + 5000-cap append-only audit log'],
      links: [{ l: 'Regulatory Planner', to: '/calendar' }, { l: 'Audit Mode', to: '/audit' }],
    },
    {
      tag: 'NEW',        tagC: '#D70101',  tagBg: '#FBE6E6',  impact: 'HIGH',   impC: '#D70101',
      title: 'iAdministrator — Streaming Intelligence Workspace',
      desc: 'iAdministrator rebuilt as a streaming compliance intelligence workspace. Command bar with SSE-streamed responses, phase-1 retrieval, studio tabs that change query intent and re-run last command, and a right panel document preview. 6 structured intents produce rich formatted outputs.',
      points: ['Streaming via SSE — perceived fast response with phase-1 top doc preloading', '6 intents: question, pre_survey_audit, action_plan, governing_body_brief, qapi_digest, knowledge_article', 'ResponseStack: StructuredAnswer, RequirementsSnapshot, Citations, AvailableActions, OperationalGaps, RegulatoryAlerts', 'HealthStrip: corpus + model health, one-click index rebuild'],
      links: [{ l: 'iAdministrator', to: '/iadministrator' }],
    },
    {
      tag: 'NEW',        tagC: '#8b5cf6',  tagBg: '#F5F3FF',  impact: 'HIGH',   impC: '#D70101',
      title: 'Audit Export Mode — Agency-Wide Risk Assessment',
      desc: 'Dedicated audit view with agency-wide risk scoring, per-event drill-down, enforcement blockers, and downloadable Markdown + JSON audit bundle. Surveyor-style filters: immediate jeopardy, high, overdue, missing evidence, approval gap, locked.',
      points: ['computeRiskScore() + summarizeAgencyRisk() — agency-level scoring', 'useEnforcementBatch() wires enforcement engine to audit view', 'buildAuditBundle() / bundleToMarkdown() → Markdown + JSON export', 'Event drill-down: risk rationale, drivers, blockers, workflow, required forms'],
      links: [{ l: 'Audit Mode', to: '/audit' }],
    },
    {
      tag: 'NEW',        tagC: '#007970',  tagBg: '#E5FEFF',  impact: 'HIGH',   impC: '#D70101',
      title: 'FormViewer — Fillable, Printable, Downloadable Forms',
      desc: '281 forms now render dynamically in the FormViewer with 7 section types and 6 field types. Print via window.print() with correct document title. HTML download saves the complete rendered form. Every form links to its governing policy.',
      points: ['7 section types: grid fields, table rows, checklist, attestation, signature block, narrative, matrix', '6 field types: text, textarea, select, checkbox, radio, signature placeholder', 'Print-ready: custom title for print headers, portrait/landscape', 'HTML download: saves complete rendered form as {id}.html'],
      links: [{ l: 'Forms Library', to: '/forms' }],
    },
    {
      tag: 'NEW',        tagC: '#f97316',  tagBg: '#FFF7ED',  impact: 'HIGH',   impC: '#D70101',
      title: 'Onboarding & Competency Journey — Full SCORM System',
      desc: 'Complete role-based onboarding framework: 5 journey phases, SCORM runtime (ScormPlayer + ScormRuntime.ts), Appendix F gating with HR Director sign-off, supervisor clearance with SignaturePad, admin dashboard with agency KPIs and escalation table.',
      points: ['Phase rail: GAO → Role → Supervised → Clearance → Annual/Drill', 'SCORM runtime OR evidence capture paths with pass/fail tracking', 'Appendix F gate — must be completed before clearance phase', 'Supervisor clearance with SignaturePad, visit logs, remediation management'],
      links: [{ l: 'Journey', to: '/journey' }, { l: 'Admin', to: '/journey/admin' }],
    },
    {
      tag: 'UPGRADE',    tagC: '#52404B',  tagBg: '#F5F0F0',  impact: 'MEDIUM', impC: '#f97316',
      title: 'Brad: Surveyor Mode + Context Assist Mode',
      desc: 'Brad upgraded from general assistant to CMS surveyor simulation engine. Assumes non-compliance, identifies deficiencies explicitly, evaluates against CoPs. New Context Assist mode detects user role and current app context to provide step-by-step workflow guidance.',
      points: ['Survey Result: Compliant / At Risk / Non-Compliant verdict', 'systemConfidenceScore (0–100) per response', 'complianceImpact + surveyFocus + commonFailurePoints per answer', 'Context Assist: role-aware, context-aware in-app guidance'],
      links: [{ l: 'iAdministrator', to: '/iadministrator' }],
    },
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto pres-chapter-enter">
      <ChapterHead number="10" subtitle="What Changed" title="This Week's Upgrades" />

      <p className="text-[14px] text-[#52404B] leading-relaxed mb-7 max-w-[620px] font-roboto">
        Seven major system deliverables this week. The cumulative effect is a fundamental shift
        from a policy platform to a fully operational compliance system.
      </p>

      <div className="space-y-3 mb-8">
        {upgrades.map((u, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E5E4E3] p-5">
            <div className="flex items-start justify-between mb-2.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <Tag text={u.tag} color={u.tagC} bg={u.tagBg} />
                <h3 className="text-[13px] font-semibold text-[#1F1C1B] font-montserrat">{u.title}</h3>
              </div>
              <span className="inline-flex px-2 py-0.5 rounded text-[8px] font-bold tracking-wider font-montserrat shrink-0 ml-2"
                style={{ color: u.impC, background: `${u.impC}12` }}>{u.impact} IMPACT</span>
            </div>
            <p className="text-[11px] text-[#52404B] leading-relaxed mb-2.5">{u.desc}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2.5">
              {u.points.map((b, j) => (
                <div key={j} className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-[#007970]" />
                  <span className="text-[9px] text-[#747474]">{b}</span>
                </div>
              ))}
            </div>
            {u.links.length > 0 && (
              <div className="flex gap-4 pt-2 border-t border-[#F0F0F0]">
                {u.links.map((lk, j) => (
                  <Link key={j} to={lk.to} label={lk.l} navigate={navigate} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Closing */}
      <div className="bg-[#1F1C1B] rounded-2xl p-7 text-center">
        <div className="text-[9px] text-white/25 tracking-[0.35em] uppercase font-montserrat mb-3">The Cumulative Result</div>
        <div className="text-[22px] font-light text-white font-montserrat leading-snug mb-3">
          A system that tells leadership where they will fail<br />
          <span className="text-[#007970]">before CMS does.</span>
        </div>
        <p className="text-white/30 text-[12px] max-w-lg mx-auto leading-relaxed mb-5">
          From policy library to compliance operating system. Every policy enforced. Every event tracked.
          Every gap surfaced. Every workflow executable.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/dashboard"      label="Command Center"       navigate={navigate} />
          <span className="text-white/15">·</span>
          <Link to="/iadministrator" label="iAdministrator"       navigate={navigate} />
          <span className="text-white/15">·</span>
          <Link to="/calendar"       label="Regulatory Planner"   navigate={navigate} />
          <span className="text-white/15">·</span>
          <Link to="/audit"          label="Audit Export"         navigate={navigate} />
          <span className="text-white/15">·</span>
          <Link to="/journey"        label="Onboarding Journey"   navigate={navigate} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function ExecutivePresentation({ onBack }: { onBack: () => void }) {
  const [chapter, setChapter] = useState(1);
  const navigate = useNavigate();

  const goNext = () => setChapter(c => Math.min(c + 1, CHAPTERS.length));
  const goPrev = () => setChapter(c => Math.max(c - 1, 1));

  const renderChapter = () => {
    switch (chapter) {
      case  1: return <Ch01 navigate={navigate} onGoToPhase1={onBack} />;
      case  2: return <Ch02 />;
      case  3: return <Ch03 navigate={navigate} />;
      case  4: return <Ch04 navigate={navigate} />;
      case  5: return <Ch05 navigate={navigate} />;
      case  6: return <Ch06 navigate={navigate} />;
      case  7: return <Ch07 navigate={navigate} />;
      case  8: return <Ch08 navigate={navigate} />;
      case  9: return <Ch09 navigate={navigate} />;
      case 10: return <Ch10 navigate={navigate} />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#FAFBF8] overflow-hidden">
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Sidebar ── */}
        <div className="w-[220px] shrink-0 bg-white border-r border-[#E5E4E3] flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-[#E5E4E3]">
            <div className="text-[8px] font-bold tracking-[0.3em] text-[#747474] uppercase font-montserrat mb-0.5">Executive Presentation</div>
            <div className="text-[11px] font-semibold text-[#1F1C1B] font-montserrat">Care Indeed CI-OS</div>
            <div className="text-[9px] text-[#747474]">{CHAPTERS.length} chapters · {chapter} of {CHAPTERS.length}</div>
          </div>

          <div className="flex-1 overflow-y-auto py-1.5">
            {CHAPTERS.map(ch => {
              const Icon = ch.icon;
              const isActive = ch.id === chapter;
              return (
                <button key={ch.id} onClick={() => setChapter(ch.id)}
                  className={`w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 transition-all border-l-[3px] ${isActive ? 'bg-[#E5FEFF] border-[#007970]' : 'border-transparent hover:bg-[#F5F5F5]'}`}>
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-[#007970]' : 'bg-[#F0F0F0]'}`}>
                    <Icon size={11} className={isActive ? 'text-white' : 'text-[#747474]'} />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-[9px] font-bold font-montserrat tracking-[0.06em] leading-tight truncate ${isActive ? 'text-[#007970]' : 'text-[#1F1C1B]'}`}>{ch.label}</div>
                    <div className="text-[8px] text-[#747474] truncate">{ch.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3.5 border-t border-[#E5E4E3]">
            <button onClick={onBack}
              className="flex items-center gap-2 text-[9px] font-bold text-[#747474] hover:text-[#1F1C1B] uppercase tracking-[0.12em] font-montserrat transition-colors w-full">
              <ArrowLeft size={10} /> Back to Live Demo
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
              {CHAPTERS.map(ch => (
                <button key={ch.id} onClick={() => setChapter(ch.id)}
                  className={`rounded-full transition-all duration-200 ${ch.id === chapter ? 'bg-[#007970] w-5 h-2' : 'bg-[#D1D1D1] hover:bg-[#007970]/40 w-2 h-2'}`}
                  title={ch.label} />
              ))}
            </div>

            <button onClick={goNext} disabled={chapter === CHAPTERS.length}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.1em] font-montserrat transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#007970] text-white hover:enabled:bg-[#006360]">
              Next <ArrowRight size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
