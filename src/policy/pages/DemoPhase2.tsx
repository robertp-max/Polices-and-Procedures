import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Monitor, AlertTriangle, Layers, GitBranch,
  Brain, Calendar, Settings, Sparkles, Shield, FileText, Users,
  CheckCircle, Play, Lock, RefreshCw,
  BookOpen, Database, Bell, Activity, ShieldCheck,
  ExternalLink, ChevronRight, HelpCircle,
  Landmark, Scale, Gavel, Target,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & CONSTANTS
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
  { id: 1, number: '01', label: 'System Overview',     subtitle: 'What This Is',              icon: Monitor },
  { id: 2, number: '02', label: 'The Challenge',       subtitle: 'Why It Matters',            icon: AlertTriangle },
  { id: 3, number: '03', label: 'Policy Architecture', subtitle: 'The Foundation',            icon: Layers },
  { id: 4, number: '04', label: 'Authority Model',     subtitle: 'Governance Engine',         icon: GitBranch },
  { id: 5, number: '05', label: 'Surveyor AI',         subtitle: 'Compliance Intelligence',   icon: Brain },
  { id: 6, number: '06', label: 'Compliance Calendar', subtitle: 'Operational Control',       icon: Calendar },
  { id: 7, number: '07', label: 'Execution Layer',     subtitle: 'Workflows & Forms',         icon: Settings },
  { id: 8, number: '08', label: 'This Week',           subtitle: 'Major Upgrades',            icon: Sparkles },
];

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

function SectionTag({ text, color = '#007970', bg = '#E5FEFF' }: { text: string; color?: string; bg?: string }) {
  return (
    <div
      className="inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-bold tracking-[0.25em] uppercase font-montserrat mb-3"
      style={{ color, background: bg }}
    >
      {text}
    </div>
  );
}

function ChapterHeading({ number, subtitle, title }: { number: string; subtitle: string; title: string }) {
  return (
    <div className="mb-8">
      <SectionTag text={`${number} — ${subtitle}`} />
      <h1 className="text-[38px] font-light text-[#1F1C1B] font-montserrat leading-tight tracking-tight">{title}</h1>
    </div>
  );
}

function MetricTile({
  value, label, sub, accent = false,
}: { value: string; label: string; sub: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? 'bg-[#E5FEFF] border-[#007970]/20' : 'bg-white border-[#E5E4E3]'}`}>
      <div className={`text-[32px] font-light font-montserrat leading-none mb-2 ${accent ? 'text-[#007970]' : 'text-[#1F1C1B]'}`}>{value}</div>
      <div className="text-[12px] font-semibold text-[#1F1C1B] font-montserrat mb-0.5">{label}</div>
      <div className="text-[10px] text-[#747474] uppercase tracking-wider font-montserrat">{sub}</div>
    </div>
  );
}

function AppLink({ to, label, navigate }: { to: string; label: string; navigate: ReturnType<typeof useNavigate> }) {
  return (
    <button
      onClick={() => navigate(to)}
      className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#007970] hover:text-[#006360] uppercase tracking-[0.15em] font-montserrat transition-colors"
    >
      <ExternalLink size={11} />
      {label}
    </button>
  );
}

function Divider() {
  return <div className="my-6 border-t border-[#E5E4E3]" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER 1 — SYSTEM OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────

function Ch01SystemOverview({
  navigate,
  onGoToPhase1,
}: {
  navigate: ReturnType<typeof useNavigate>;
  onGoToPhase1: () => void;
}) {
  const capabilities = [
    {
      icon: FileText,
      title: 'Policy Authority System',
      desc: 'Complete governance lifecycle from draft to active. Role-based access tiers. Regulatory cross-reference for every artifact.',
      primary: true,
    },
    {
      icon: Brain,
      title: 'Surveyor Intelligence',
      desc: 'AI that evaluates compliance as a CMS surveyor would. Detects gaps, identifies deficiencies, prescribes corrective action.',
      primary: false,
    },
    {
      icon: Calendar,
      title: 'Compliance Engine',
      desc: 'Mandated-events calendar tied directly to federal regulations. Survey-ready evidence bundles. Automated deadline tracking.',
      primary: false,
    },
    {
      icon: Layers,
      title: 'Execution Workspace',
      desc: 'Forms, onboarding journeys, draft-to-publish workflows. Operational execution — not just policy storage.',
      primary: false,
    },
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto pres-chapter-enter">
      <ChapterHeading number="01" subtitle="System Overview" title="Compliance Operating System" />

      <p className="text-[16px] text-[#52404B] leading-relaxed mb-8 max-w-[640px] font-roboto">
        A purpose-built compliance operating system for Medicare-certified home health agencies.
        Not a document library. Not a generic workflow tool. A system designed to operate exactly
        as your agency must operate.
      </p>

      {/* Key metrics */}
      <div className="grid grid-cols-4 gap-3 mb-10">
        <MetricTile value="269" label="Managed Policies" sub="Enterprise-grade" accent />
        <MetricTile value="10"  label="Policy Domains"  sub="Fully structured" />
        <MetricTile value="7"   label="Regulatory Frameworks" sub="Mapped & aligned" />
        <MetricTile value="300+" label="Operational Forms" sub="Policy-connected" />
      </div>

      {/* Capability grid */}
      <div className="mb-4">
        <div className="text-[10px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-4">Core Capabilities</div>
        <div className="grid grid-cols-2 gap-4">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div
                key={i}
                className={`rounded-2xl border p-5 transition-shadow hover:shadow-sm ${
                  cap.primary ? 'bg-[#007970] border-[#007970]' : 'bg-white border-[#E5E4E3]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                    cap.primary ? 'bg-white/20' : 'bg-[#E5FEFF] text-[#007970]'
                  }`}
                >
                  <Icon size={16} className={cap.primary ? 'text-white' : 'text-[#007970]'} />
                </div>
                <h3 className={`text-[13px] font-semibold font-montserrat mb-1.5 ${cap.primary ? 'text-white' : 'text-[#1F1C1B]'}`}>
                  {cap.title}
                </h3>
                <p className={`text-[12px] leading-relaxed ${cap.primary ? 'text-white/75' : 'text-[#52404B]'}`}>
                  {cap.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <Divider />

      {/* The shift */}
      <div className="bg-[#1F1C1B] rounded-2xl p-6 flex items-center justify-between gap-6">
        <div>
          <div className="text-[9px] text-white/35 tracking-[0.3em] uppercase font-montserrat mb-3">The Core Shift</div>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-white/30 text-[15px] font-light line-through decoration-white/20">Policy Library</span>
            <span className="text-white/25 text-[13px]">→</span>
            <span className="text-[#007970] text-[19px] font-semibold font-montserrat tracking-tight">
              Compliance Operating System
            </span>
          </div>
          <p className="text-white/40 text-[12px] max-w-lg leading-relaxed">
            Every policy connects to regulatory requirements, evidence standards, forms, and operational workflows.
            The system doesn't store compliance — it enforces it.
          </p>
        </div>
        <button
          onClick={onGoToPhase1}
          className="shrink-0 flex items-center gap-2 bg-[#C74601] text-white px-5 py-3 rounded-xl text-[10px] font-bold tracking-[0.15em] uppercase font-montserrat hover:bg-[#a83a00] transition-colors whitespace-nowrap"
        >
          <Play size={13} />
          Live Demo
        </button>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <AppLink to="/library"    label="Policy Library"   navigate={navigate} />
        <span className="text-[#D1D1D1]">·</span>
        <AppLink to="/forms"      label="Forms"            navigate={navigate} />
        <span className="text-[#D1D1D1]">·</span>
        <AppLink to="/dashboard"  label="Command Center"   navigate={navigate} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER 2 — THE CHALLENGE
// ─────────────────────────────────────────────────────────────────────────────

function Ch02TheChallenge() {
  const painPoints = [
    {
      icon: Landmark,
      number: '01',
      title: 'Regulatory Complexity at Scale',
      body: 'Medicare-certified home health agencies must simultaneously comply with 42 CFR Part 484, Title 22 (California), HIPAA Privacy & Security, OIG Compliance Guidance, False Claims Act, and Cal-OSHA. Each framework has its own documentation requirements, audit standards, and enforcement consequences.',
      stat: '7 overlapping regulatory frameworks',
      color: '#C74601',
      bg: '#FFEEE5',
    },
    {
      icon: Shield,
      number: '02',
      title: 'Survey Exposure Without Warning',
      body: 'CMS surveyors arrive unannounced and audit against Conditions of Participation. Condition-level deficiencies can result in Plans of Correction, billing holds, or Medicare decertification. Agencies are judged on documentation that should have been created months — or years — earlier.',
      stat: 'Condition-level = existential risk',
      color: '#D70101',
      bg: '#FBE6E6',
    },
    {
      icon: Activity,
      number: '03',
      title: 'Operational Blind Spots',
      body: 'Missing physician signatures, overdue OASIS assessments, unsigned care plans, lapsed competency evaluations — all invisible in a document-based system. By the time they surface, they are already survey deficiencies.',
      stat: 'Most citations are documentation failures',
      color: '#007970',
      bg: '#E5FEFF',
    },
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto pres-chapter-enter">
      <ChapterHeading number="02" subtitle="The Challenge" title="Why It Matters" />

      <p className="text-[16px] text-[#52404B] leading-relaxed mb-8 max-w-[640px] font-roboto">
        Home health compliance is not a paperwork problem. It is an operational risk problem. The agencies
        that fail survey are not the ones with bad intentions — they are the ones with broken visibility.
      </p>

      <div className="space-y-4 mb-8">
        {painPoints.map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-[#E5E4E3] p-6 flex gap-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: p.bg }}
              >
                <Icon size={22} style={{ color: p.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] font-bold text-[#747474] tracking-[0.2em] font-montserrat">{p.number}</span>
                  <h3 className="text-[14px] font-semibold text-[#1F1C1B] font-montserrat">{p.title}</h3>
                </div>
                <p className="text-[13px] text-[#52404B] leading-relaxed mb-3">{p.body}</p>
                <span
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-[9px] font-bold font-montserrat tracking-wider uppercase"
                  style={{ background: p.bg, color: p.color }}
                >
                  {p.stat}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* The standard */}
      <div className="rounded-2xl border-l-4 border-[#007970] bg-[#E5FEFF] p-6">
        <div className="text-[9px] font-bold text-[#007970] tracking-[0.25em] uppercase font-montserrat mb-2">
          The Guiding Principle
        </div>
        <p className="text-[16px] text-[#1F1C1B] font-montserrat font-light leading-snug">
          "Surveyors look for evidence, not interpretation. If it isn't documented, it didn't happen."
        </p>
        <p className="text-[12px] text-[#52404B] mt-2 leading-relaxed">
          This system is built on that principle — and enforces it at every layer.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER 3 — POLICY ARCHITECTURE
// ─────────────────────────────────────────────────────────────────────────────

function Ch03PolicyArchitecture({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const domains = [
    { code: 'GV', name: 'Governance',     count: 20, color: '#00e59b' },
    { code: 'CL', name: 'Clinical Ops',   count: 57, color: '#ef4444' },
    { code: 'QA', name: 'QAPI',           count: 16, color: '#06b6d4' },
    { code: 'HR', name: 'Human Resources',count: 45, color: '#8b5cf6' },
    { code: 'CO', name: 'Compliance',     count: 32, color: '#3b82f6' },
    { code: 'FN', name: 'Finance',        count: 19, color: '#10b981' },
    { code: 'OP', name: 'Operations',     count: 20, color: '#f97316' },
    { code: 'IT', name: 'IT & Security',  count: 19, color: '#6366f1' },
    { code: 'RM', name: 'Risk Mgmt',      count: 15, color: '#eab308' },
    { code: 'EN', name: 'Enterprise Ctrl',count:  6, color: '#ec4899' },
  ];

  const frameworks = [
    { name: 'Title 22 (California)', icon: Landmark,   color: '#b45309' },
    { name: '42 CFR Part 484',       icon: Scale,       color: '#007970' },
    { name: 'CMS State Operations',  icon: ShieldCheck, color: '#6d28d9' },
    { name: 'HIPAA P&S',             icon: Lock,        color: '#1d4ed8' },
    { name: 'OSHA / Cal-OSHA',       icon: Shield,      color: '#b45309' },
    { name: 'OIG Guidance',          icon: Target,      color: '#7c3aed' },
    { name: 'False Claims Act',       icon: Gavel,       color: '#9333ea' },
  ];

  const archLevels = [
    { level: 'L1', title: 'Regulatory Foundation', desc: 'Federal & state compliance frameworks — 7 mapped authorities' },
    { level: 'L2', title: '10 Strategic Domains',  desc: 'Top-level organizational categories (GV, CL, QA, HR, CO, FN, OP, IT, RM, EN)' },
    { level: 'L3', title: '44 Subdomains',          desc: 'Structural pillars within each domain (e.g., CL-PA, CL-CP, CL-SD)' },
    { level: 'L4', title: '269 Policies',           desc: 'Managed policy artifacts with full metadata, lifecycle, and regulatory tags' },
    { level: 'L5', title: 'Forms & Appendices',     desc: '300+ operational forms connected directly to governing policies' },
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto pres-chapter-enter">
      <ChapterHeading number="03" subtitle="Policy Architecture" title="The Foundation" />

      <p className="text-[15px] text-[#52404B] leading-relaxed mb-8 max-w-[620px] font-roboto">
        269 managed policies organized into 10 strategic domains, each mapped to federal and state
        regulatory frameworks. Every artifact has an owner, a lifecycle, a review cycle, and
        regulatory cross-references.
      </p>

      <div className="grid grid-cols-4 gap-3 mb-8">
        <MetricTile value="10"   label="Strategic Domains"    sub="Top-level categories" accent />
        <MetricTile value="44"   label="Subdomains"            sub="Structural pillars" />
        <MetricTile value="269"  label="Total Policies"        sub="Managed artifacts" />
        <MetricTile value="100%" label="Governance Alignment"  sub="Framework coverage" accent />
      </div>

      {/* Regulatory layer */}
      <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5 mb-5">
        <div className="text-[10px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-3 flex items-center gap-2">
          <ShieldCheck size={12} className="text-[#007970]" />
          Regulatory Compliance Foundation
        </div>
        <div className="flex flex-wrap gap-2">
          {frameworks.map((r, i) => {
            const Icon = r.icon;
            return (
              <span
                key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-bold font-montserrat uppercase tracking-wider"
                style={{ borderColor: `${r.color}35`, background: `${r.color}0D`, color: r.color }}
              >
                <Icon size={10} />
                {r.name}
              </span>
            );
          })}
        </div>
      </div>

      {/* Domain grid */}
      <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5 mb-5">
        <div className="text-[10px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-4">
          10 Policy Domains
        </div>
        <div className="grid grid-cols-5 gap-2">
          {domains.map((d, i) => (
            <div key={i} className="p-3 rounded-xl border border-[#E5E4E3] hover:border-[#D1D1D1] transition-colors">
              <div className="text-[16px] font-bold font-mono mb-0.5" style={{ color: d.color }}>{d.code}</div>
              <div className="text-[9px] text-[#52404B] font-medium mb-1 leading-tight">{d.name}</div>
              <div className="text-[12px] font-semibold text-[#1F1C1B]">{d.count}</div>
              <div className="text-[8px] text-[#747474] uppercase tracking-wider">policies</div>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture levels */}
      <div className="bg-[#FAFBF8] rounded-2xl border border-[#E5E4E3] p-5 mb-6">
        <div className="text-[10px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-4">
          Architecture Hierarchy
        </div>
        <div className="space-y-3">
          {archLevels.map((level, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-[#E5FEFF] border border-[#007970]/15 flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-[#007970] font-mono">{level.level}</span>
              </div>
              <div className="flex-1">
                <div className="text-[12px] font-semibold text-[#1F1C1B] font-montserrat">{level.title}</div>
                <div className="text-[10px] text-[#747474] leading-snug">{level.desc}</div>
              </div>
              {i < archLevels.length - 1 && (
                <ChevronRight size={12} className="text-[#D1D1D1] shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <AppLink to="/library"    label="Explore Policy Library" navigate={navigate} />
        <span className="text-[#D1D1D1]">·</span>
        <AppLink to="/framework"  label="Framework View"          navigate={navigate} />
        <span className="text-[#D1D1D1]">·</span>
        <AppLink to="/forms"      label="Forms Library"           navigate={navigate} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER 4 — AUTHORITY MODEL
// ─────────────────────────────────────────────────────────────────────────────

function Ch04AuthorityModel({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const lifecycle = [
    { state: 'DRAFT',        desc: 'Initial creation',          color: '#f97316', bg: '#FFF7ED' },
    { state: 'REVIEW',       desc: 'Stakeholder review',        color: '#3b82f6', bg: '#EFF6FF' },
    { state: 'APPROVED',     desc: 'Governing Body approval',   color: '#8b5cf6', bg: '#F5F3FF' },
    { state: 'ACTIVE',       desc: 'Published & enforced',      color: '#007970', bg: '#E5FEFF' },
    { state: 'UNDER REVIEW', desc: 'Scheduled revision',        color: '#eab308', bg: '#FEFCE8' },
  ];

  const roles = [
    { tier: 'T1', role: 'Governing Body',    access: 'Full authority + final approval',    color: '#007970' },
    { tier: 'T2', role: 'Administrator',     access: 'Edit, submit, delegate',             color: '#3b82f6' },
    { tier: 'T3', role: 'Clinical Manager',  access: 'Review, annotate, escalate',         color: '#8b5cf6' },
    { tier: 'T4', role: 'Staff',             access: 'Read-only, acknowledgment required', color: '#747474' },
  ];

  const versionChecks = [
    'Every revision creates a versioned record',
    'Superseded versions are archived — not deleted',
    'Approval history is immutable and time-stamped',
    'Re-acknowledgment required within 14 days of revision',
    'Only the current approved version is operationally active',
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto pres-chapter-enter">
      <ChapterHeading number="04" subtitle="Authority Model" title="The Governance Engine" />

      <p className="text-[15px] text-[#52404B] leading-relaxed mb-8 max-w-[620px] font-roboto">
        Every policy follows a governed lifecycle. No policy can be active without proper authorization.
        No change occurs without version tracking. No access proceeds without role-based permission.
      </p>

      {/* Lifecycle flow */}
      <div className="bg-white rounded-2xl border border-[#E5E4E3] p-6 mb-5">
        <div className="text-[10px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-5">
          Policy Lifecycle
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {lifecycle.map((step, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <div
                className="text-center px-4 py-3 rounded-xl border min-w-[100px]"
                style={{ background: step.bg, borderColor: `${step.color}25` }}
              >
                <div
                  className="text-[9px] font-bold tracking-[0.15em] font-montserrat mb-1"
                  style={{ color: step.color }}
                >
                  {step.state}
                </div>
                <div className="text-[10px] text-[#52404B]">{step.desc}</div>
              </div>
              {i < lifecycle.length - 1 && (
                <ChevronRight size={16} className="text-[#D1D1D1] shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Role-based access */}
        <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#E5FEFF] rounded-lg flex items-center justify-center">
              <Users size={15} className="text-[#007970]" />
            </div>
            <div className="text-[12px] font-semibold text-[#1F1C1B] font-montserrat">Role-Based Access</div>
          </div>
          <div className="space-y-2.5">
            {roles.map((t, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-[#F0F0F0] last:border-0">
                <span
                  className="w-7 h-7 rounded-md flex items-center justify-center text-[8px] font-bold font-mono shrink-0"
                  style={{ background: `${t.color}10`, color: t.color, border: `1px solid ${t.color}20` }}
                >
                  {t.tier}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-[#1F1C1B]">{t.role}</div>
                  <div className="text-[10px] text-[#747474] truncate">{t.access}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Version control */}
        <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#E5FEFF] rounded-lg flex items-center justify-center">
              <RefreshCw size={15} className="text-[#007970]" />
            </div>
            <div className="text-[12px] font-semibold text-[#1F1C1B] font-montserrat">Version Control</div>
          </div>
          <div className="space-y-2.5">
            {versionChecks.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle size={13} className="text-[#007970] mt-0.5 shrink-0" />
                <span className="text-[12px] text-[#52404B] leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Required metadata */}
      <div className="bg-[#FAFBF8] rounded-2xl border border-[#E5E4E3] p-5 mb-6">
        <div className="text-[10px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-3">
          Required Metadata — Every Policy
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            'Policy ID (XX-XX-NNN format)',
            'Domain & Subdomain',
            'Owner (role-based)',
            'Status',
            'Version',
            'Effective Date',
            'Next Review Date',
            'Approved By',
            'Regulatory Tags',
          ].map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#007970] shrink-0" />
              <span className="text-[11px] text-[#52404B]">{m}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <AppLink to="/drafts"  label="Draft Policies"  navigate={navigate} />
        <span className="text-[#D1D1D1]">·</span>
        <AppLink to="/review"  label="Review Queue"    navigate={navigate} />
        <span className="text-[#D1D1D1]">·</span>
        <AppLink to="/publish" label="Publish Pipeline" navigate={navigate} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER 5 — SURVEYOR INTELLIGENCE
// ─────────────────────────────────────────────────────────────────────────────

function Ch05SurveyorIntelligence({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const evalLayers = [
    { layer: 'L1', title: 'Policy Authority',  desc: 'Corpus-anchored requirement with policy ID reference',      color: '#007970' },
    { layer: 'L2', title: 'Operational State', desc: 'Tasks, forms, workflows, calendar events',                  color: '#3b82f6' },
    { layer: 'L3', title: 'Lifecycle State',   desc: 'Draft, pending approval, overdue for review',              color: '#8b5cf6' },
    { layer: 'L4', title: 'Regulatory State',  desc: 'CMS / OIG updates and recent guidance changes',            color: '#f97316' },
    { layer: 'L5', title: 'EHR State',         desc: 'Unsigned orders, missing documentation, overdue assessments', color: '#eab308' },
  ];

  const surveyorPoints = [
    'Compliant / At Risk / Non-Compliant verdict',
    'Explicit deficiency identification — no soft language',
    'Compliance impact assessment per response',
    'Required corrective actions with ownership',
    'System confidence score (0–100)',
    'Survey focus: evidence surveyors will request',
  ];

  const assistPoints = [
    'Detects current app context and page',
    'Detects user role when available',
    'Identifies incomplete required steps',
    'Provides direct next-step guidance',
    'Guides users to click, open, sign, start correct items',
    'Prevents users from skipping required steps unknowingly',
  ];

  const sampleQueries = [
    '"Are we ready for survey?"',
    '"Who is overdue for OIG screening?"',
    '"What is missing for QAPI compliance?"',
    '"Which policies are pending approval?"',
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto pres-chapter-enter">
      <ChapterHeading number="05" subtitle="Surveyor AI" title="Compliance Intelligence" />

      <p className="text-[15px] text-[#52404B] leading-relaxed mb-8 max-w-[620px] font-roboto">
        Brad operates as a real-time CMS surveyor inside the system. Not a chatbot. Not a general assistant.
        A compliance enforcement engine with two operating modes: Surveyor and Context Assist.
      </p>

      {/* Two modes */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border-2 border-[#D70101] bg-white p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-[#FBE6E6] rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-[#D70101]" />
            </div>
            <div>
              <div className="text-[9px] text-[#D70101] font-bold tracking-[0.2em] font-montserrat uppercase">Primary Mode</div>
              <div className="text-[14px] font-semibold text-[#1F1C1B] font-montserrat">CMS Surveyor</div>
            </div>
          </div>
          <p className="text-[12px] text-[#52404B] mb-4 leading-relaxed">
            Assumes non-compliance until evidence proves otherwise. Requires documentation artifacts.
            Evaluates against Conditions of Participation.
          </p>
          <div className="space-y-1.5">
            {surveyorPoints.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D70101] mt-1.5 shrink-0" />
                <span className="text-[11px] text-[#52404B]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border-2 border-[#007970] bg-white p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-[#E5FEFF] rounded-xl flex items-center justify-center">
              <HelpCircle size={18} className="text-[#007970]" />
            </div>
            <div>
              <div className="text-[9px] text-[#007970] font-bold tracking-[0.2em] font-montserrat uppercase">Secondary Mode</div>
              <div className="text-[14px] font-semibold text-[#1F1C1B] font-montserrat">Context Assist</div>
            </div>
          </div>
          <p className="text-[12px] text-[#52404B] mb-4 leading-relaxed">
            Role-aware, context-aware in-app guide. Appears inside active workflows to tell users
            exactly what to do next — in the correct order.
          </p>
          <div className="space-y-1.5">
            {assistPoints.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#007970] mt-1.5 shrink-0" />
                <span className="text-[11px] text-[#52404B]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Evaluation layers */}
      <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5 mb-5">
        <div className="text-[10px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-4">
          5-Layer Evaluation Model
        </div>
        <div className="space-y-3">
          {evalLayers.map((layer, i) => (
            <div key={i} className="flex items-center gap-4 py-2 border-b border-[#F5F5F5] last:border-0">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[9px] font-bold font-mono"
                style={{ background: `${layer.color}10`, color: layer.color, border: `1px solid ${layer.color}20` }}
              >
                {layer.layer}
              </div>
              <div className="flex-1">
                <div className="text-[12px] font-semibold text-[#1F1C1B] font-montserrat">{layer.title}</div>
                <div className="text-[10px] text-[#747474]">{layer.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample queries */}
      <div className="bg-[#1F1C1B] rounded-2xl p-5 mb-6">
        <div className="text-[9px] text-white/35 tracking-[0.25em] uppercase font-montserrat mb-3">
          Sample Questions Brad Answers
        </div>
        <div className="grid grid-cols-2 gap-2">
          {sampleQueries.map((q, i) => (
            <div
              key={i}
              className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-[12px] text-white/70 font-mono"
            >
              {q}
            </div>
          ))}
        </div>
      </div>

      <AppLink to="/iadministrator" label="Open iAdministrator" navigate={navigate} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER 6 — COMPLIANCE CALENDAR
// ─────────────────────────────────────────────────────────────────────────────

function Ch06ComplianceCalendar({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const eventBuckets = [
    {
      freq: 'Annual',
      color: '#007970',
      bg: '#E5FEFF',
      events: [
        'Annual Governance Review Packet',
        'Annual Home Health Aide In-Service Training (12 hrs)',
        'Annual Skilled-Patient Aide Direct Observation',
        'Annual Emergency Exercise',
        'Annual HHCAHPS Participation Decision',
        'Annual QAPI PIP',
      ],
    },
    {
      freq: 'Biennial',
      color: '#3b82f6',
      bg: '#EFF6FF',
      events: [
        'Emergency Program Review & Update',
        'Emergency-Preparedness Staff Training',
      ],
    },
    {
      freq: 'Semiannual',
      color: '#8b5cf6',
      bg: '#F5F3FF',
      events: [
        'Aide-Only Patient Direct Observation',
      ],
    },
    {
      freq: 'Quarterly',
      color: '#f97316',
      bg: '#FFF7ED',
      events: [
        'QAPI Governance Review',
        'Compliance Status Report to Governing Body',
        'Financial Performance Review',
      ],
    },
  ];

  const coreConcepts = [
    {
      icon: Calendar,
      title: 'Mandated Events',
      desc: 'Federal requirements converted to scheduled events with due-date logic and dependencies',
      color: '#007970',
    },
    {
      icon: Database,
      title: 'Evidence Bundles',
      desc: 'Each event generates required documentation packages, responsible owners, and approvers',
      color: '#3b82f6',
    },
    {
      icon: Bell,
      title: 'Deadline Intelligence',
      desc: 'Layered reminders (60/30/14/7/1 days) with blocking dependencies tracked automatically',
      color: '#f97316',
    },
  ];

  const reminderPattern = ['60 days', '30 days', '14 days', '7 days', '1 day', 'Day of'];

  return (
    <div className="p-8 max-w-[960px] mx-auto pres-chapter-enter">
      <ChapterHeading number="06" subtitle="Compliance Calendar" title="Operational Control" />

      <p className="text-[15px] text-[#52404B] leading-relaxed mb-8 max-w-[620px] font-roboto">
        A rules-based compliance engine that converts federal mandates into scheduled events. Each event
        generates a survey-ready evidence bundle with required documentation, responsible roles,
        deadlines, and an immutable audit trail.
      </p>

      {/* Core concepts */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {coreConcepts.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-[#E5E4E3] p-5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                style={{ background: `${card.color}10` }}
              >
                <Icon size={16} style={{ color: card.color }} />
              </div>
              <h3 className="text-[12px] font-semibold text-[#1F1C1B] font-montserrat mb-1.5">{card.title}</h3>
              <p className="text-[11px] text-[#52404B] leading-relaxed">{card.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Event buckets */}
      <div className="bg-white rounded-2xl border border-[#E5E4E3] p-5 mb-5">
        <div className="text-[10px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-4">
          Mandated Events by Frequency
        </div>
        <div className="space-y-4">
          {eventBuckets.map((bucket, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="shrink-0 pt-0.5">
                <span
                  className="inline-flex px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-wider uppercase font-montserrat whitespace-nowrap"
                  style={{ background: bucket.bg, color: bucket.color }}
                >
                  {bucket.freq}
                </span>
              </div>
              <div className="flex-1 flex flex-wrap gap-1.5">
                {bucket.events.map((ev, j) => (
                  <span
                    key={j}
                    className="px-2.5 py-1 rounded-lg border border-[#E5E4E3] text-[10px] text-[#52404B] bg-[#FAFBF8]"
                  >
                    {ev}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reminder pattern */}
      <div className="bg-[#FAFBF8] rounded-2xl border border-[#E5E4E3] p-5 mb-6">
        <div className="text-[10px] font-bold text-[#747474] tracking-[0.2em] uppercase font-montserrat mb-4">
          Standard Reminder Pattern — Applied to Every Event
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {reminderPattern.map((day, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E4E3] text-[10px] font-semibold text-[#1F1C1B] font-mono">
                {day}
              </div>
              {i < reminderPattern.length - 1 && (
                <ChevronRight size={11} className="text-[#D1D1D1]" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <AppLink to="/calendar"   label="Open Compliance Calendar" navigate={navigate} />
        <span className="text-[#D1D1D1]">·</span>
        <AppLink to="/governance" label="Governance Report"        navigate={navigate} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER 7 — EXECUTION LAYER
// ─────────────────────────────────────────────────────────────────────────────

function Ch07ExecutionLayer({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const formDomains = [
    { code: 'CL', name: 'Clinical',    count: '57' },
    { code: 'HR', name: 'HR',          count: '39' },
    { code: 'CO', name: 'Compliance',  count: '39' },
    { code: 'GV', name: 'Governance',  count: '25' },
    { code: 'OP', name: 'Operations',  count: '20' },
  ];

  const journeyModules = [
    'Employee Journey', 'Supervisor View', 'Admin Dashboard',
    'Module Player', 'Appendix F Assessment',
  ];

  const pipelineSteps = [
    'Draft', 'Stakeholder Review', 'Compliance Check', 'GB Approval', 'Published Active',
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto pres-chapter-enter">
      <ChapterHeading number="07" subtitle="Workflows & Forms" title="The Execution Layer" />

      <p className="text-[15px] text-[#52404B] leading-relaxed mb-8 max-w-[620px] font-roboto">
        Knowing policy requirements is not enough. The system must support the actual work.
        Three operational layers ensure policy intent is executed — not just documented.
      </p>

      <div className="space-y-4 mb-6">
        {/* Forms system */}
        <div className="bg-white rounded-2xl border border-[#E5E4E3] p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-[#E5FEFF] rounded-xl flex items-center justify-center shrink-0">
              <FileText size={20} className="text-[#007970]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-[#1F1C1B] font-montserrat">Forms System</h3>
                <AppLink to="/forms" label="Open Forms Library" navigate={navigate} />
              </div>
              <p className="text-[12px] text-[#52404B] mt-1">
                300+ operational forms mapped directly to their governing policies and regulatory requirements.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {formDomains.map((d, i) => (
              <div key={i} className="text-center p-2.5 rounded-xl border border-[#E5E4E3] bg-[#FAFBF8]">
                <div className="text-[15px] font-semibold text-[#007970] font-mono">{d.count}</div>
                <div className="text-[8px] text-[#747474] uppercase tracking-wider font-montserrat">{d.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Onboarding journey */}
        <div className="bg-white rounded-2xl border border-[#E5E4E3] p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center shrink-0">
              <BookOpen size={20} className="text-[#3b82f6]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-[#1F1C1B] font-montserrat">
                  Onboarding & Competency Journey
                </h3>
                <AppLink to="/journey" label="Open Journey" navigate={navigate} />
              </div>
              <p className="text-[12px] text-[#52404B] mt-1">
                Role-based competency modules with tracked progress, supervisor review, and policy acknowledgment workflows.
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {journeyModules.map((item, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-lg border border-[#E5E4E3] bg-[#FAFBF8] text-[10px] text-[#52404B]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Draft → Publish pipeline */}
        <div className="bg-white rounded-2xl border border-[#E5E4E3] p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-[#FFF7ED] rounded-xl flex items-center justify-center shrink-0">
              <GitBranch size={20} className="text-[#f97316]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-[#1F1C1B] font-montserrat">
                  Draft → Review → Publish Pipeline
                </h3>
                <div className="flex items-center gap-3">
                  <AppLink to="/drafts"  label="Drafts"  navigate={navigate} />
                  <AppLink to="/publish" label="Publish" navigate={navigate} />
                </div>
              </div>
              <p className="text-[12px] text-[#52404B] mt-1">
                Controlled authoring pipeline with change tracking, stakeholder review,
                approval gates, and version history.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {pipelineSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-[#FAFBF8] border border-[#E5E4E3] text-[10px] text-[#52404B]">
                  {step}
                </div>
                {i < pipelineSteps.length - 1 && (
                  <ChevronRight size={10} className="text-[#D1D1D1]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER 8 — THIS WEEK'S UPGRADES
// ─────────────────────────────────────────────────────────────────────────────

function Ch08ThisWeek({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const upgrades = [
    {
      tag: 'NEW CAPABILITY',
      tagColor: '#007970',
      tagBg: '#E5FEFF',
      title: 'Brad: CMS Surveyor Mode',
      desc: 'Brad upgraded from general AI assistant to a dedicated CMS survey simulation engine. Now assumes non-compliance, identifies deficiencies explicitly, and evaluates against Conditions of Participation — as a real surveyor would.',
      impact: 'HIGH',
      impactColor: '#D70101',
      bullets: [
        'Survey Result: Compliant / At Risk / Non-Compliant',
        'Explicit deficiency identification with no hedging',
        'Compliance impact included per response',
        'Required corrective actions with assigned ownership',
      ],
      links: [{ label: 'Open iAdministrator', to: '/iadministrator' }],
    },
    {
      tag: 'NEW CAPABILITY',
      tagColor: '#3b82f6',
      tagBg: '#EFF6FF',
      title: 'Brad: Context Assist Mode',
      desc: 'New secondary mode that makes Brad a role-aware, context-aware in-app guide. Detects the user\'s current position in the app, their role, and what is incomplete — then provides direct next-step instructions inside the active workflow.',
      impact: 'HIGH',
      impactColor: '#D70101',
      bullets: [
        'Context-aware and role-aware guidance',
        'Step-by-step instructions inside real workflows',
        'Guides users to click, open, sign, and start correct items',
        'Prevents users from skipping required steps unknowingly',
      ],
      links: [],
    },
    {
      tag: 'UPGRADE',
      tagColor: '#f97316',
      tagBg: '#FFF7ED',
      title: 'Regulatory Planner & Compliance Calendar',
      desc: 'Calendar redesigned into a rules-based compliance engine. Federal mandates converted to scheduled events with evidence bundles, dependency tracking, and reminder logic. Q1 2026 prototype schedule implemented.',
      impact: 'HIGH',
      impactColor: '#D70101',
      bullets: [
        'Annual, biennial, semiannual, and quarterly event categories',
        'Evidence bundles with required documentation per event',
        '60/30/14/7/1-day layered reminder pattern',
        'Q1 2026 prototype compliance schedule live',
      ],
      links: [{ label: 'Open Calendar', to: '/calendar' }],
    },
    {
      tag: 'UPGRADE',
      tagColor: '#8b5cf6',
      tagBg: '#F5F3FF',
      title: 'Confidence Scoring + Compliance Impact Framework',
      desc: 'Every Brad response now includes a structured output layer: confidence score (0–100), enforcement-language compliance impact, survey focus points showing what auditors will request, and common failure patterns from real audit data.',
      impact: 'MEDIUM',
      impactColor: '#f97316',
      bullets: [
        'systemConfidenceScore: 0–100 per response',
        'complianceImpact: enforcement language per answer',
        'surveyFocus: exact evidence surveyors will request',
        'commonFailurePoints: failure intelligence per domain',
      ],
      links: [],
    },
    {
      tag: 'DOCUMENTATION',
      tagColor: '#52404B',
      tagBg: '#F5F0F0',
      title: 'iAdministrator Manual & Operator Guide',
      desc: 'Full documentation shipped: iAdministrator manual and operator guide document the system architecture, authority model, evaluation layers, and operational procedures for administrators and operators.',
      impact: 'MEDIUM',
      impactColor: '#f97316',
      bullets: [
        'iAdministrator Manual — full feature documentation',
        'Operator Guide — system architecture and authority model',
        'Evaluation layer documentation',
        'Deployment and configuration procedures',
      ],
      links: [{ label: 'Open iAdministrator', to: '/iadministrator' }],
    },
  ];

  return (
    <div className="p-8 max-w-[960px] mx-auto pres-chapter-enter">
      <ChapterHeading number="08" subtitle="What Changed" title="This Week's Upgrades" />

      <p className="text-[15px] text-[#52404B] leading-relaxed mb-8 max-w-[620px] font-roboto">
        Five major upgrades shipped this week. The cumulative effect is a fundamental shift: from a capable
        compliance tool to a genuine compliance operating system with enforcement intelligence built in.
      </p>

      <div className="space-y-4 mb-8">
        {upgrades.map((u, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E5E4E3] p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className="inline-flex px-2.5 py-1 rounded-lg text-[8px] font-bold tracking-[0.2em] uppercase font-montserrat"
                  style={{ background: u.tagBg, color: u.tagColor }}
                >
                  {u.tag}
                </span>
                <h3 className="text-[14px] font-semibold text-[#1F1C1B] font-montserrat">{u.title}</h3>
              </div>
              <span
                className="inline-flex px-2 py-0.5 rounded text-[8px] font-bold tracking-wider font-montserrat shrink-0 ml-2"
                style={{ color: u.impactColor, background: `${u.impactColor}12` }}
              >
                {u.impact} IMPACT
              </span>
            </div>
            <p className="text-[12px] text-[#52404B] leading-relaxed mb-3">{u.desc}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mb-3">
              {u.bullets.map((b, j) => (
                <div key={j} className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-[#007970]" />
                  <span className="text-[10px] text-[#747474]">{b}</span>
                </div>
              ))}
            </div>
            {u.links.length > 0 && (
              <div className="flex gap-4 pt-2.5 border-t border-[#F0F0F0]">
                {u.links.map((link, j) => (
                  <AppLink key={j} to={link.to} label={link.label} navigate={navigate} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Closing statement */}
      <div className="bg-[#1F1C1B] rounded-2xl p-8 text-center">
        <div className="text-[9px] text-white/30 tracking-[0.35em] uppercase font-montserrat mb-4">
          The Cumulative Result
        </div>
        <div className="text-[24px] font-light text-white font-montserrat leading-snug mb-3">
          A system that tells leadership where they will fail
          <br />
          <span className="text-[#007970]">before CMS does.</span>
        </div>
        <p className="text-white/35 text-[12px] max-w-md mx-auto leading-relaxed mb-6">
          This is not a documentation system. This is a compliance enforcement engine with a direct
          connection to the regulatory frameworks that govern your agency's existence.
        </p>
        <div className="flex items-center justify-center gap-4">
          <AppLink to="/dashboard"      label="Command Center"  navigate={navigate} />
          <span className="text-white/20">·</span>
          <AppLink to="/iadministrator" label="iAdministrator"  navigate={navigate} />
          <span className="text-white/20">·</span>
          <AppLink to="/calendar"       label="Compliance Calendar" navigate={navigate} />
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
      case 1: return <Ch01SystemOverview navigate={navigate} onGoToPhase1={onBack} />;
      case 2: return <Ch02TheChallenge />;
      case 3: return <Ch03PolicyArchitecture navigate={navigate} />;
      case 4: return <Ch04AuthorityModel navigate={navigate} />;
      case 5: return <Ch05SurveyorIntelligence navigate={navigate} />;
      case 6: return <Ch06ComplianceCalendar navigate={navigate} />;
      case 7: return <Ch07ExecutionLayer navigate={navigate} />;
      case 8: return <Ch08ThisWeek navigate={navigate} />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#FAFBF8] overflow-hidden">
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Sidebar ── */}
        <div className="w-[220px] shrink-0 bg-white border-r border-[#E5E4E3] flex flex-col overflow-hidden">
          {/* Sidebar header */}
          <div className="px-4 pt-5 pb-4 border-b border-[#E5E4E3]">
            <div className="text-[8px] font-bold tracking-[0.3em] text-[#747474] uppercase font-montserrat mb-1">
              Executive Presentation
            </div>
            <div className="text-[12px] font-semibold text-[#1F1C1B] font-montserrat leading-tight">
              Care Indeed CI-OS
            </div>
            <div className="text-[10px] text-[#747474] mt-0.5">
              {CHAPTERS.length} chapters
            </div>
          </div>

          {/* Chapter list */}
          <div className="flex-1 overflow-y-auto py-2">
            {CHAPTERS.map(ch => {
              const Icon = ch.icon;
              const isActive = ch.id === chapter;
              return (
                <button
                  key={ch.id}
                  onClick={() => setChapter(ch.id)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all ${
                    isActive
                      ? 'bg-[#E5FEFF] border-l-[3px] border-[#007970]'
                      : 'border-l-[3px] border-transparent hover:bg-[#F5F5F5]'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'bg-[#007970]' : 'bg-[#F0F0F0]'
                    }`}
                  >
                    <Icon size={12} className={isActive ? 'text-white' : 'text-[#747474]'} />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`text-[10px] font-bold font-montserrat tracking-[0.08em] leading-tight ${
                        isActive ? 'text-[#007970]' : 'text-[#1F1C1B]'
                      }`}
                    >
                      {ch.label}
                    </div>
                    <div className="text-[9px] text-[#747474] truncate">{ch.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Back to Phase 1 */}
          <div className="p-4 border-t border-[#E5E4E3]">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-[9px] font-bold text-[#747474] hover:text-[#1F1C1B] uppercase tracking-[0.15em] font-montserrat transition-colors w-full"
            >
              <ArrowLeft size={11} />
              Back to Live Demo
            </button>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Scrollable chapter content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar" key={chapter}>
            {renderChapter()}
          </div>

          {/* ── Footer navigation ── */}
          <div className="shrink-0 flex items-center justify-between px-8 py-3.5 bg-white border-t border-[#E5E4E3]">
            <button
              onClick={goPrev}
              disabled={chapter === 1}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.12em] font-montserrat transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-[#E5E4E3] text-[#52404B] hover:border-[#D1D1D1] hover:bg-[#FAFBF8] enabled:cursor-pointer"
            >
              <ArrowLeft size={12} />
              Previous
            </button>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {CHAPTERS.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setChapter(ch.id)}
                  className={`rounded-full transition-all duration-200 ${
                    ch.id === chapter
                      ? 'bg-[#007970] w-5 h-2'
                      : 'bg-[#D1D1D1] hover:bg-[#007970]/40 w-2 h-2'
                  }`}
                  title={ch.label}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              disabled={chapter === CHAPTERS.length}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.12em] font-montserrat transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#007970] text-white hover:bg-[#006360] enabled:cursor-pointer"
            >
              Next
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
