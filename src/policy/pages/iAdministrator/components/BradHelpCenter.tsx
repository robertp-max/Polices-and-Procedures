import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  AlertTriangle,
  Info,
  ShieldCheck,
  Activity,
  Zap,
  Terminal,
  BookOpen,
  Search,
  ClipboardCheck,
  ChevronRight,
  Radio,
  Lock,
  CheckCircle2,
  FileText,
  Users,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   BradHelpCenter — production-quality embedded documentation panel.

   Layout:
     overlay  : fixed backdrop (click-outside closes)
     panel    : right-side slide-in, max 980px
     sidebar  : sticky section navigation (~220px)
     content  : scrollable section body

   Light mode only. All colors fixed — no theme switching.
   ═══════════════════════════════════════════════════════════════ */

// ── Design tokens ────────────────────────────────────────────────────
const C = {
  bg:            '#FAF9F8',
  surface:       '#FFFFFF',
  surfaceAlt:    '#F7F6F5',
  border:        '#E5E4E3',
  borderLight:   '#F0EEEC',
  text:          '#1F1C1B',
  textMuted:     '#747474',
  textSub:       '#52404B',
  accent:        '#C74601',
  accentLight:   '#FFF7ED',
  accentBorder:  '#FFD5BF',
  danger:        '#991B1B',
  dangerMid:     '#B91C1C',
  dangerBg:      '#FEF2F2',
  dangerBorder:  '#FECACA',
  warning:       '#B45309',
  warningBg:     '#FFFBEB',
  warningBorder: '#FDE68A',
  success:       '#047857',
  successBg:     '#F0FDF4',
  successBorder: '#BBF7D0',
  mono:  "'JetBrains Mono', monospace",
  head:  "'Outfit', 'Inter', system-ui, sans-serif",
} as const;

// ── Section registry ─────────────────────────────────────────────────
type SectionGroup = 'Overview' | 'Modes' | 'Reference';

interface NavSection {
  id: string;
  label: string;
  group: SectionGroup;
  badge?: 'critical' | 'important';
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

const NAV: NavSection[] = [
  { id: 'what-is-brad',           label: 'What is Brad',           group: 'Overview',   icon: Info },
  { id: 'how-to-use',             label: 'How to Use Brad',         group: 'Overview',   icon: Users },
  { id: 'survey-mode',            label: 'Survey Mode',             group: 'Modes',      badge: 'critical', icon: ShieldCheck },
  { id: 'context-assist',         label: 'Context Assist',          group: 'Modes',      icon: Zap },
  { id: 'operational-monitoring', label: 'Operational Monitoring',  group: 'Modes',      icon: Activity },
  { id: 'reading-results',        label: 'Reading Results',         group: 'Reference',  icon: Search },
  { id: 'regulatory-awareness',   label: 'Regulatory Awareness',    group: 'Reference',  icon: Radio },
  { id: 'limitations',            label: 'Limitations',             group: 'Reference',  badge: 'important', icon: Lock },
  { id: 'best-practices',         label: 'Best Practices',          group: 'Reference',  icon: CheckCircle2 },
  { id: 'quick-commands',         label: 'Quick Commands',          group: 'Reference',  icon: Terminal },
];

const GROUPS: SectionGroup[] = ['Overview', 'Modes', 'Reference'];

// ── Shared sub-components ─────────────────────────────────────────────

function SectionHead({ icon: Icon, title, subtitle }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: C.accent, display: 'flex' }}><Icon size={16} strokeWidth={1.75} /></span>
        <h2 style={{ fontFamily: C.head, fontSize: 20, fontWeight: 600, color: C.text, margin: 0 }}>{title}</h2>
      </div>
      <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6, margin: 0 }}>{subtitle}</p>
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: `1px solid ${C.border}`, margin: '24px 0' }} />;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: C.mono, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.28em', color: C.textMuted, marginBottom: 8 }}>
      {children}
    </div>
  );
}

function AlertBox({ tone, children }: { tone: 'danger' | 'warning' | 'info' | 'success'; children: React.ReactNode }) {
  const cfg = {
    danger:  { bg: C.dangerBg,   border: C.dangerBorder,  text: C.dangerMid, icon: AlertTriangle },
    warning: { bg: C.warningBg,  border: C.warningBorder, text: C.warning,   icon: AlertTriangle },
    info:    { bg: C.accentLight,border: C.accentBorder,  text: C.accent,    icon: Info },
    success: { bg: C.successBg,  border: C.successBorder, text: C.success,   icon: CheckCircle2 },
  }[tone];
  const Icon = cfg.icon;
  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, marginBottom: 12 }}>
      <Icon size={14} strokeWidth={2} style={{ color: cfg.text, flexShrink: 0, marginTop: 2 }} />
      <div style={{ fontSize: 13, color: C.text, lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

function Badge({ label, tone }: { label: string; tone: 'danger' | 'warning' | 'neutral' | 'success' }) {
  const cfg = {
    danger:  { bg: C.dangerBg,   text: C.dangerMid, border: C.dangerBorder },
    warning: { bg: C.warningBg,  text: C.warning,   border: C.warningBorder },
    neutral: { bg: C.surfaceAlt, text: C.textMuted,  border: C.border },
    success: { bg: C.successBg,  text: C.success,   border: C.successBorder },
  }[tone];
  return (
    <span style={{ fontFamily: C.mono, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: cfg.text, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 4, padding: '2px 6px' }}>
      {label}
    </span>
  );
}

function CodeChip({ children }: { children: React.ReactNode }) {
  return (
    <code style={{ fontFamily: C.mono, fontSize: 11, color: C.accent, background: C.accentLight, border: `1px solid ${C.accentBorder}`, borderRadius: 4, padding: '2px 6px' }}>
      {children}
    </code>
  );
}

function ProseP({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, marginBottom: 12 }}>{children}</p>;
}

function BulletList({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ul style={{ paddingLeft: 0, listStyle: 'none', marginBottom: 12 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: C.text, lineHeight: 1.65, marginBottom: 6 }}>
          <ChevronRight size={13} strokeWidth={2.5} style={{ color: C.accent, flexShrink: 0, marginTop: 3 }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function NumList({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ol style={{ paddingLeft: 0, listStyle: 'none', marginBottom: 12 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: C.text, lineHeight: 1.65, marginBottom: 8 }}>
          <span style={{ fontFamily: C.mono, fontSize: 10, fontWeight: 700, color: C.accent, flexShrink: 0, minWidth: 20, marginTop: 3 }}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

function InfoRow({ label, value, tone }: { label: string; value: string | React.ReactNode; tone?: 'danger' | 'warning' | 'success' | 'neutral' }) {
  const valueColor = tone === 'danger' ? C.dangerMid : tone === 'warning' ? C.warning : tone === 'success' ? C.success : C.text;
  return (
    <div style={{ display: 'flex', gap: 12, paddingBottom: 10, paddingTop: 10, borderBottom: `1px solid ${C.borderLight}`, alignItems: 'flex-start' }}>
      <div style={{ fontFamily: C.mono, fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.2em', minWidth: 140, paddingTop: 2, flexShrink: 0 }}>{label}</div>
      <div style={{ fontSize: 13, color: valueColor, lineHeight: 1.6, flex: 1 }}>{value}</div>
    </div>
  );
}

function CommandExample({ query, intent, description }: { query: string; intent: string; description: string }) {
  return (
    <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
        <Terminal size={13} strokeWidth={2} style={{ color: C.accent, flexShrink: 0, marginTop: 2 }} />
        <code style={{ fontFamily: C.mono, fontSize: 12, color: C.text, lineHeight: 1.5 }}>{query}</code>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Badge label={intent} tone="neutral" />
        <span style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{description}</span>
      </div>
    </div>
  );
}

function RoleBlock({ role, examples }: { role: string; examples: string[] }) {
  return (
    <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
      <div style={{ fontFamily: C.mono, fontSize: 10, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: 10 }}>
        {role}
      </div>
      {examples.map((ex, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < examples.length - 1 ? 6 : 0 }}>
          <ChevronRight size={12} strokeWidth={2.5} style={{ color: C.accent, flexShrink: 0, marginTop: 3 }} />
          <code style={{ fontFamily: C.mono, fontSize: 11, color: C.textSub, lineHeight: 1.6 }}>{ex}</code>
        </div>
      ))}
    </div>
  );
}

// ── Section content components ────────────────────────────────────────

function SectionWhatIsBrad() {
  return (
    <section id="help-what-is-brad">
      <SectionHead icon={Info} title="What is Brad" subtitle="Brad's identity, authority model, and design purpose." />

      <ProseP>
        Brad is the compliance intelligence engine inside iAdministrator. It is not a general-purpose AI assistant — it is a purpose-built system that reasons over the Care Indeed Home Health internal corpus and behaves like a CMS surveyor evaluating your organization for deficiencies.
      </ProseP>

      <AlertBox tone="info">
        Brad answers only from the internal corpus — policies, procedures, forms, and appendices. It does not search the web, does not access external databases, and does not generate answers outside the documented materials.
      </AlertBox>

      <Divider />
      <Label>Three core functions</Label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { icon: ShieldCheck, title: 'Compliance Decision Engine', body: 'Evaluates whether a given state, process, or condition is compliant based on internal policy and applicable regulations.' },
          { icon: ClipboardCheck, title: 'Surveyor Simulation System', body: 'Replicates the evaluation logic of a CMS surveyor — assuming non-compliance by default and requiring evidence to prove otherwise.' },
          { icon: Activity, title: 'Operational Monitoring Tool', body: 'Surfaces overdue tasks, missing artifacts, unsigned forms, blocked workflows, and policies in incomplete lifecycle states.' },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
              <Icon size={14} strokeWidth={1.75} style={{ color: C.accent }} />
              <span style={{ fontFamily: C.head, fontSize: 12, fontWeight: 600, color: C.text }}>{title}</span>
            </div>
            <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, margin: 0 }}>{body}</p>
          </div>
        ))}
      </div>

      <Divider />
      <Label>What Brad is NOT</Label>
      <BulletList items={[
        'Not a chatbot — Brad does not hold conversation history. Each command is independent.',
        'Not a general AI assistant — Brad will not answer questions outside its corpus.',
        'Not an LMS or training tool — Brad is an operational compliance tool, not a learning platform.',
        'Not a substitute for legal counsel — Brad surfaces regulatory risk; legal decisions require qualified review.',
        'Not connected to your EHR by default — EHR-layer data requires Phase 3 integration.',
      ]} />

      <Divider />
      <Label>Authority model</Label>
      <ProseP>
        Every answer Brad produces is anchored to a <strong>Governing Policy ID</strong> from the corpus. If no governing policy can be identified, Brad downgrades the confidence score automatically and flags the gap. Brad never invents policies, forms, or data.
      </ProseP>
      <ProseP>
        When a query touches a regulatory tag — <CodeChip>CoP</CodeChip>, <CodeChip>HIPAA</CodeChip>, <CodeChip>FCA</CodeChip>, <CodeChip>OIG</CodeChip> — Brad automatically elevates the risk level in the response.
      </ProseP>
    </section>
  );
}

function SectionHowToUse() {
  return (
    <section id="help-how-to-use">
      <SectionHead icon={Users} title="How to Use Brad" subtitle="Step-by-step guidance by role and common use patterns." />

      <Label>Issuing a command</Label>
      <NumList items={[
        'Type your query in the command bar at the top of the iAdministrator page.',
        <>Select the appropriate output tab before submitting: <CodeChip>Answer</CodeChip>, <CodeChip>Pre-Survey Audit</CodeChip>, <CodeChip>Action Plan</CodeChip>, <CodeChip>Governing Body</CodeChip>, <CodeChip>QAPI Digest</CodeChip>, or <CodeChip>Knowledge Article</CodeChip>.</>,
        'Press Enter or click Run. Brad will retrieve relevant corpus passages and generate a structured response.',
        'Review the structured answer, confidence score, risk level, and any operational gaps surfaced.',
        'Click any Governing Policy ID or artifact chip to open the full document in the right panel.',
        'Use the Available Actions section to generate additional outputs (audit checklists, action plans, etc.).',
      ]} />

      <Divider />
      <Label>By role</Label>

      <RoleBlock role="Administrator" examples={[
        'Run pre-survey audit',
        'Which policies are pending approval?',
        'What is the governing body meeting requirement?',
        'Create governing body brief for CMIA risk',
        'Show lifecycle status for all HR policies',
      ]} />

      <RoleBlock role="Compliance Officer" examples={[
        'Are we ready for survey?',
        'What would fail survey in QAPI today?',
        'Identify compliance gaps in infection control',
        'What is missing for a Medicare claim to be billable?',
        'Show all policies overdue for review',
      ]} />

      <RoleBlock role="Human Resources" examples={[
        'Who is overdue for OIG screening?',
        'What forms are required for new employee onboarding?',
        'What is required before an employee can be placed in service?',
        'Show missing pre-employment items',
        'What are the background check requirements?',
      ]} />

      <RoleBlock role="Clinical Staff" examples={[
        'What is required on a plan of care?',
        'What documentation is required for wound care visits?',
        'Open CO-HP-001 §4',
        'What are the physician order signature requirements?',
        'What constitutes a missed visit under Medicare conditions?',
      ]} />

      <Divider />
      <Label>Switching output modes</Label>
      <ProseP>
        After submitting a query, you can switch the output tab to re-run the same query under a different intent without retyping. For example:
      </ProseP>
      <BulletList items={[
        <>Submit "Are we ready for survey?" on the <CodeChip>Answer</CodeChip> tab for a direct compliance assessment.</>,
        <>Switch to <CodeChip>Pre-Survey Audit</CodeChip> to get a structured checklist of deficiencies.</>,
        <>Switch to <CodeChip>Action Plan</CodeChip> to receive prioritized corrective steps.</>,
        <>Switch to <CodeChip>Governing Body</CodeChip> to generate an executive-ready brief.</>,
      ]} />

      <Divider />
      <Label>Referencing specific documents</Label>
      <ProseP>
        Quoting a document ID anchors Brad to that specific source. Use this to get precise answers:
      </ProseP>
      <BulletList items={[
        <><CodeChip>HR-FM-020</CodeChip> — opens or references a specific form directly</>,
        <><CodeChip>CO-HP-001 §4</CodeChip> — references a specific section of a policy</>,
        <>Combine IDs with questions: <CodeChip>What does HR-FM-020 require for completion?</CodeChip></>,
      ]} />
    </section>
  );
}

function SectionSurveyMode() {
  return (
    <section id="help-survey-mode">
      <SectionHead icon={ShieldCheck} title="Survey Mode" subtitle="How Brad simulates a CMS surveyor. The most important mode to understand." />

      <AlertBox tone="danger">
        Survey Mode is Brad's default evaluation posture. Brad assumes your organization is non-compliant unless the corpus and operational data provide evidence to the contrary. This is by design — surveyors do not assume compliance.
      </AlertBox>

      <Divider />
      <Label>The surveyor posture</Label>
      <ProseP>
        A CMS surveyor arrives with one question: <em>what will fail today?</em> Brad is designed to think the same way. It evaluates requirements against actual documented state, not against intent or assumption. If evidence cannot be found in the corpus or operational data, Brad reports the gap explicitly.
      </ProseP>
      <BulletList items={[
        'Brad requires documentation and artifacts — not assertions.',
        'Brad identifies deficiencies explicitly, without softening language.',
        'Brad evaluates against Conditions of Participation (CoPs), HIPAA, and FCA where applicable.',
        'Brad never assumes that a missing record means compliance.',
      ]} />

      <Divider />
      <Label>Survey result status meanings</Label>

      {[
        { label: 'Compliant', tone: 'success' as const, desc: 'Corpus and operational data provide sufficient evidence that the requirement is met. All artifacts are present, up to date, and properly executed.' },
        { label: 'At Risk', tone: 'warning' as const, desc: 'Requirements exist but evidence of consistent execution is incomplete. A surveyor would likely flag this for closer examination. Corrective action is needed before survey.' },
        { label: 'Non-Compliant', tone: 'danger' as const, desc: 'A clear deficiency exists. Documentation, signatures, or required processes are missing or overdue. This would result in a survey citation if found during inspection.' },
        { label: 'No Data Available', tone: 'warning' as const, desc: 'Brad cannot evaluate this domain because operational data is not present (e.g. EHR not connected, Phase 3 not active). The absence of data is reported — never assumed compliant.' },
      ].map(({ label, tone, desc }) => (
        <div key={label} style={{ display: 'flex', gap: 12, paddingBottom: 12, paddingTop: 12, borderBottom: `1px solid ${C.borderLight}` }}>
          <div style={{ minWidth: 130, flexShrink: 0 }}>
            <Badge label={label} tone={tone} />
          </div>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.65, margin: 0 }}>{desc}</p>
        </div>
      ))}

      <Divider />
      <Label>Enforcement levels</Label>
      <InfoRow label="Condition-Level" tone="danger" value="The highest CMS enforcement tier. Failure at this level can result in termination of Medicare/Medicaid participation. Brad automatically elevates risk when CoP tags are detected." />
      <InfoRow label="Standard-Level" tone="warning" value="A deficiency that creates survey risk but does not reach the condition-level threshold. Still requires corrective action before survey." />
      <InfoRow label="No Enforcement Flag" tone="neutral" value="No regulatory enforcement tag applies. The issue is still a policy gap but does not carry direct CMS citation risk." />

      <Divider />
      <Label>How to respond to survey findings</Label>
      <NumList items={[
        'Do not dismiss findings because they feel unexpected. The system is designed to be strict.',
        'Open the Governing Policy ID to review the exact requirement.',
        'Generate an Action Plan using the studio tab to get prioritized corrective steps.',
        'Resolve the highest-severity gaps (critical and high) before addressing moderate and low items.',
        'Re-run the same query after corrective action to verify the gap is resolved.',
        'Use the Governing Body tab to prepare executive briefings on critical findings.',
      ]} />

      <Divider />
      <Label>Internal evaluation order</Label>
      <ProseP>Brad processes every query in the following order. Understanding this helps you interpret why Brad returns a particular finding.</ProseP>
      <NumList items={[
        <><strong>Survey Result</strong> — Compliant / At Risk / Non-Compliant determination</>,
        <><strong>Deficiencies</strong> — explicit gaps, no softened language</>,
        <><strong>Current State</strong> — what exists in policy and operational data</>,
        <><strong>Gap Analysis</strong> — what is missing, overdue, or blocked</>,
        <><strong>Compliance Impact</strong> — regulatory, billing, and survey consequences</>,
        <><strong>Corrective Action</strong> — exact steps to resolve the deficiency</>,
        <><strong>Ownership</strong> — responsible role for each corrective step</>,
        <><strong>Supporting References</strong> — policy IDs, forms, and workflows</>,
      ]} />
    </section>
  );
}

function SectionContextAssist() {
  return (
    <section id="help-context-assist">
      <SectionHead icon={Zap} title="Context Assist" subtitle="Role-aware, workflow-specific in-app guidance for step-by-step task completion." />

      <AlertBox tone="info">
        Context Assist is a separate mode from Survey Mode. Survey Mode evaluates compliance. Context Assist guides users through completing work correctly inside a specific workflow.
      </AlertBox>

      <Divider />
      <Label>What Context Assist does</Label>
      <ProseP>
        When a user is inside a specific workflow — onboarding, form completion, approval routing, policy review — Context Assist detects the current app context and active role, then provides direct next-step instructions. It tells users what to click, what to open, what to sign, and what is blocking their progress.
      </ProseP>
      <BulletList items={[
        'Detects the current module, page, and workflow the user is in.',
        'Detects the current user role (HR, Compliance, Clinical, etc.) when available.',
        'Identifies incomplete or blocked required steps.',
        'Provides direct, short, action-oriented guidance — not general help text.',
        'Explains why each step is required before the user can move forward.',
        'Prevents users from unknowingly skipping required steps.',
      ]} />

      <Divider />
      <Label>Guidance priority order</Label>
      <NumList items={[
        'Required next step — what must be done before anything else',
        'Blocked item — what is preventing progress',
        'Missing evidence — forms, documents, or signatures absent',
        'Missing signature — items requiring authorization',
        'Overdue item — tasks past their due date',
        'Optional supporting guidance — helpful but not blocking',
      ]} />

      <Divider />
      <Label>Example — HR onboarding workflow</Label>
      <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontFamily: C.mono, fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: 12 }}>
          Context: HR user — new employee onboarding
        </div>
        {[
          { step: '01', text: 'Complete OIG screening first. Placement in service before OIG clearance is a compliance violation.' },
          { step: '02', text: 'Open HR-FM-020 and complete the employee demographic form before proceeding.' },
          { step: '03', text: 'Upload the signed I-9 and employment eligibility documentation.' },
          { step: '04', text: 'Confirm background check has been ordered and cleared.' },
          { step: '05', text: 'Do not submit for approval until all required pre-employment fields are complete.' },
        ].map(({ step, text }) => (
          <div key={step} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <span style={{ fontFamily: C.mono, fontSize: 10, fontWeight: 700, color: C.accent, flexShrink: 0, marginTop: 2 }}>{step}</span>
            <span style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{text}</span>
          </div>
        ))}
      </div>

      <Label>Example — form completion workflow</Label>
      <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontFamily: C.mono, fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: 12 }}>
          Context: Clinical user — form completion
        </div>
        {[
          { step: '01', text: 'This form requires a physician signature before submission. Do not submit without it.' },
          { step: '02', text: 'Section 3 is required — the visit date field cannot be blank for Medicare billing.' },
          { step: '03', text: 'Review the plan of care against current clinical notes before signing.' },
        ].map(({ step, text }) => (
          <div key={step} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <span style={{ fontFamily: C.mono, fontSize: 10, fontWeight: 700, color: C.accent, flexShrink: 0, marginTop: 2 }}>{step}</span>
            <span style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{text}</span>
          </div>
        ))}
      </div>

      <Divider />
      <Label>Triggering Context Assist</Label>
      <ProseP>
        Ask Brad directly about your current workflow context:
      </ProseP>
      <BulletList items={[
        <><CodeChip>What do I need to do to complete onboarding for a new employee?</CodeChip></>,
        <><CodeChip>What is required before I can submit this form?</CodeChip></>,
        <><CodeChip>What step comes after OIG screening in HR onboarding?</CodeChip></>,
        <><CodeChip>What is blocking the approval for this policy?</CodeChip></>,
      ]} />
    </section>
  );
}

function SectionOperationalMonitoring() {
  return (
    <section id="help-operational-monitoring">
      <SectionHead icon={Activity} title="Operational Monitoring" subtitle="How Brad tracks and surfaces gaps, blocked workflows, and policy lifecycle issues." />

      <ProseP>
        Operational monitoring data appears automatically below Brad's structured answer when relevant gaps are detected. These records are not LLM-generated — they come from structured app state (Phase 1 seed data and Phase 2+ live adapters).
      </ProseP>

      <Divider />
      <Label>Data layers (phases)</Label>
      <InfoRow label="Phase 1" value="Seed operational data — pre-loaded compliance gaps, lifecycle alerts, and known issues baked into the application at build time. Always available." tone="success" />
      <InfoRow label="Phase 2" value="Live app adapter — connects to real-time task management, form state, and policy lifecycle data. Available when the live adapter is active." tone="neutral" />
      <InfoRow label="Phase 3" value="EHR-derived assessment — pulls clinical documentation gaps, unsigned orders, and plan-of-care mismatches from the connected EHR system. Requires EHR integration." tone="warning" />

      <Divider />
      <Label>Gap types and what they mean</Label>
      {[
        { type: 'overdue_task',     desc: 'A required task has passed its due date without completion. Creates direct survey risk if the task is tied to a CoP requirement.' },
        { type: 'missing_artifact', desc: 'A required document, form, or evidence file is absent. Surveyors require artifacts — their absence is treated as non-compliance.' },
        { type: 'unsigned_form',    desc: 'A form exists but has not been signed by the required party (employee, clinician, or supervisor). Unsigned forms have no legal standing.' },
        { type: 'pending_approval', desc: 'A policy or document is awaiting approval and cannot be used as governing authority until the approval cycle is complete.' },
        { type: 'blocked_workflow', desc: 'A workflow cannot advance because a prerequisite step is incomplete. The blocking condition is identified and must be resolved first.' },
        { type: 'incomplete_form',  desc: 'A form has been started but contains empty required fields. Cannot be submitted or used as evidence until complete.' },
        { type: 'overdue_event',    desc: 'A calendar event (governing body meeting, QAPI review, in-service training) is past due. Creates lifecycle and survey risk.' },
        { type: 'ehr_gap',          desc: 'An EHR-derived gap — unsigned physician order, missing documentation, or plan-of-care mismatch. Requires Phase 3 EHR integration.' },
      ].map(({ type, desc }) => (
        <div key={type} style={{ display: 'flex', gap: 12, paddingBottom: 10, paddingTop: 10, borderBottom: `1px solid ${C.borderLight}` }}>
          <code style={{ fontFamily: C.mono, fontSize: 10, color: C.accent, background: C.accentLight, border: `1px solid ${C.accentBorder}`, borderRadius: 4, padding: '2px 6px', minWidth: 130, height: 'fit-content', flexShrink: 0 }}>
            {type.replace(/_/g, '_')}
          </code>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6, margin: 0 }}>{desc}</p>
        </div>
      ))}

      <Divider />
      <Label>Policy lifecycle states</Label>
      {[
        { state: 'draft',                    desc: 'Policy is in development. Cannot be cited as governing authority until approved and published.' },
        { state: 'under_review',             desc: 'Policy is in the review cycle. Edits may still occur. Not yet finalized.' },
        { state: 'pending_approval',         desc: 'Review is complete. Awaiting approver sign-off. Cannot be published until approved.' },
        { state: 'overdue_review',           desc: 'Policy has passed its scheduled review date without a completed review cycle. Creates compliance risk.' },
        { state: 'approved_unpublished',     desc: 'Approval is complete but the policy has not been published to staff. Staff cannot be held accountable to unpublished policy.' },
        { state: 'awaiting_acknowledgment',  desc: 'Policy is published but staff acknowledgments are incomplete. Acknowledgment tracking is required by CMS.' },
        { state: 'missing_linked_artifact',  desc: 'Policy references a form, workflow, or document that does not exist in the corpus. Creates a broken reference chain.' },
      ].map(({ state, desc }) => (
        <div key={state} style={{ display: 'flex', gap: 12, paddingBottom: 10, paddingTop: 10, borderBottom: `1px solid ${C.borderLight}` }}>
          <code style={{ fontFamily: C.mono, fontSize: 10, color: C.textSub, background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 4, padding: '2px 6px', minWidth: 150, height: 'fit-content', flexShrink: 0 }}>
            {state}
          </code>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6, margin: 0 }}>{desc}</p>
        </div>
      ))}

      <Divider />
      <Label>Severity levels</Label>
      <InfoRow label="Critical" tone="danger" value="Immediate action required. This gap creates direct survey deficiency risk or blocks compliant operations today." />
      <InfoRow label="High" tone="danger" value="Significant risk. Must be resolved before any survey preparation is considered complete." />
      <InfoRow label="Moderate" tone="warning" value="Elevated risk. Does not represent immediate deficiency risk but should be resolved within the current compliance cycle." />
      <InfoRow label="Low" tone="neutral" value="Informational. Track and address during routine policy maintenance. Not a survey risk at current severity." />
    </section>
  );
}

function SectionReadingResults() {
  return (
    <section id="help-reading-results">
      <SectionHead icon={Search} title="Reading Results" subtitle="How to interpret every field in Brad's structured response." />

      <ProseP>
        Brad produces a structured response — not a chat message. Every field has a specific meaning. Understanding each one allows you to make accurate compliance decisions from Brad's output.
      </ProseP>

      <Divider />
      <Label>Primary answer fields</Label>
      <InfoRow label="Direct Answer" value="Brad's primary response to your query. Authoritative and direct. Sourced from corpus. No hedging." />
      <InfoRow label="Operational Requirement" value="The specific operational action or documentation requirement that flows from the policy. What must actually be done, not just what the policy says." />
      <InfoRow label="Compliance Risk" value="A plain-language statement of what could go wrong if this requirement is not met. Framed in terms of survey, billing, or regulatory exposure." />
      <InfoRow label="Compliance Impact" value="The formal consequence of non-compliance — survey deficiency, claim denial, regulatory violation, or license risk." />

      <Divider />
      <Label>Confidence indicators</Label>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 10, paddingTop: 10, borderBottom: `1px solid ${C.borderLight}` }}>
          <div style={{ minWidth: 140, flexShrink: 0 }}>
            <Badge label="HIGH CONFIDENCE" tone="success" />
          </div>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.65, margin: 0 }}>Multiple corpus passages support the answer. A governing policy ID was found. Citations are primary-relevance. Score: 75–100.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 10, paddingTop: 10, borderBottom: `1px solid ${C.borderLight}` }}>
          <div style={{ minWidth: 140, flexShrink: 0 }}>
            <Badge label="MEDIUM CONFIDENCE" tone="warning" />
          </div>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.65, margin: 0 }}>Answer is supported but governing policy is indirect or citations are secondary. Additional verification recommended. Score: 45–74.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 10, paddingTop: 10, borderBottom: `1px solid ${C.borderLight}` }}>
          <div style={{ minWidth: 140, flexShrink: 0 }}>
            <Badge label="LOW CONFIDENCE" tone="danger" />
          </div>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.65, margin: 0 }}>Retrieval returned weak or tangential results. No clear governing policy. Do not rely on this answer without manual policy review. Score: 0–44.</p>
        </div>
      </div>

      <Label>System confidence score (0–100)</Label>
      <ProseP>
        The numeric score shown as a percentage beside the confidence label is calculated from three factors: retrieval quality (how relevant the returned corpus passages are), citation count (how many supporting passages were found), and governing policy presence (whether a direct policy anchor was identified). A score below 45 should prompt manual corpus verification.
      </ProseP>

      <Divider />
      <Label>Risk levels</Label>
      {[
        { level: 'none',     label: 'No Known Risk',   tone: 'success' as const, desc: 'No identified compliance risk in the evaluated domain.' },
        { level: 'low',      label: 'Low Risk',        tone: 'success' as const, desc: 'Minor gap that does not threaten survey compliance at this time.' },
        { level: 'moderate', label: 'Moderate Risk',   tone: 'warning' as const, desc: 'A real gap that needs attention before the next compliance cycle or survey window.' },
        { level: 'high',     label: 'High Risk',       tone: 'danger' as const,  desc: 'Significant deficiency. Would likely be cited in a survey. Requires corrective action.' },
        { level: 'critical', label: 'Critical Risk',   tone: 'danger' as const,  desc: 'Immediate deficiency. Survey citation is probable. May impact billing, certification, or licensing.' },
      ].map(({ level, label, tone, desc }) => (
        <div key={level} style={{ display: 'flex', gap: 12, paddingBottom: 10, paddingTop: 10, borderBottom: `1px solid ${C.borderLight}` }}>
          <div style={{ minWidth: 130, flexShrink: 0 }}>
            <Badge label={label} tone={tone} />
          </div>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.65, margin: 0 }}>{desc}</p>
        </div>
      ))}

      <Divider />
      <Label>Survey intelligence fields</Label>
      <InfoRow label="Governing Policy ID" value="The primary policy that anchors the answer. Click it to open the full policy document in the right panel. If absent, Brad's confidence is lowered automatically." />
      <InfoRow label="Survey Focus" value="A list of specific items a CMS surveyor would request during an on-site inspection. Use this to prepare your documentation package before survey." />
      <InfoRow label="Common Failure Points" value="Known audit failures in this domain, derived from policy audit logic. These represent the most frequent ways organizations are cited in this area." />
      <InfoRow label="Required Artifacts" value="Forms, documents, and evidence packages that must be present and complete. Clicking any artifact ID opens it in the right panel." />

      <Divider />
      <Label>Supporting evidence fields</Label>
      <InfoRow label="Citations" value="Source passages from the corpus that Brad used to generate the answer. Primary citations directly answer the question; secondary citations provide supporting context." />
      <InfoRow label="Requirements Snapshot" value="A quick-reference view of individual requirements surfaced by the query, each with a status (required, recommended, warning) and its source policy." />
      <InfoRow label="Linked References" value="Related documents that are relevant to the query — policies, forms, workflows — with their relationship type (required, supporting, related)." />
    </section>
  );
}

function SectionRegulatoryAwareness() {
  return (
    <section id="help-regulatory-awareness">
      <SectionHead icon={Radio} title="Regulatory Awareness" subtitle="How Brad detects and surfaces CMS and OIG regulatory changes and maps them to internal policy." />

      <ProseP>
        Regulatory alerts appear in the response stack when Brad detects that a query involves a domain affected by a known CMS or OIG update. These alerts surface automatically — they do not require specific phrasing to trigger.
      </ProseP>

      <Divider />
      <Label>What Brad detects</Label>
      <BulletList items={[
        'New or updated CMS Conditions of Participation (CoPs)',
        'OIG Work Plan updates targeting home health agencies',
        'CMS transmittals affecting Medicare billing requirements',
        'Regulatory updates that impact existing internal policies',
        'Compliance deadlines for implementing new requirements',
      ]} />

      <Divider />
      <Label>Regulatory alert structure</Label>
      <InfoRow label="Source" value="The originating regulatory body (CMS, OIG, HHS) and the specific transmittal or publication ID." />
      <InfoRow label="Severity" value="Immediate / High / Moderate / Low — based on the compliance deadline and impact on agency operations." />
      <InfoRow label="Affected Area" value="The specific care domain or administrative function impacted (e.g., QAPI, infection control, personnel requirements)." />
      <InfoRow label="Impacted Policies" value="Internal policy IDs that need to be reviewed or updated in response to the regulatory change." />
      <InfoRow label="Review Recommendation" value="Brad's specific recommendation for what to review and how urgently." />
      <InfoRow label="Status" value="New / Under Review / Reviewed / Action Taken — tracks the response to the regulatory alert." />

      <Divider />
      <Label>How Brad maps regulatory changes to internal policy</Label>
      <NumList items={[
        "Brad matches the regulatory topic area to the internal corpus taxonomy (domain and subdomain tags).",
        "Policies with matching regulatory tags (CoP, HIPAA, FCA, OIG) are flagged as potentially impacted.",
        "Brad generates a review recommendation that identifies which policies need to be evaluated against the new requirement.",
        "When a regulatory alert status is 'New', treat it as requiring immediate review — do not defer.",
      ]} />

      <AlertBox tone="warning">
        Regulatory alert data in Phase 1 is seeded from known updates at the time of corpus build. For real-time regulatory tracking, Phase 2 integration with an external regulatory feed is required. Verify critical regulatory updates against direct CMS/OIG sources.
      </AlertBox>
    </section>
  );
}

function SectionLimitations() {
  return (
    <section id="help-limitations">
      <SectionHead icon={Lock} title="Limitations" subtitle="What Brad does not do. Reading this section is required before making compliance decisions from Brad's output." />

      <AlertBox tone="danger">
        Brad is a corpus-constrained compliance tool. It does not have general knowledge, internet access, or connections to external databases in MVP. All outputs must be understood in the context of these limitations.
      </AlertBox>

      <Divider />

      {[
        {
          title: 'No hallucination guarantee requires corpus depth',
          body: 'Brad only answers from documents in the internal corpus. However, if the corpus lacks coverage for a specific topic, Brad may surface a low-confidence answer using adjacent content. Always check the confidence score. If the score is below 45 or "No Answer Found" is returned, do not rely on the answer without manual review.',
        },
        {
          title: 'Corpus-only answers — no external access (MVP)',
          body: 'Brad cannot access CMS.gov, OIG.hhs.gov, Federal Register, or any external resource. Regulatory alert data reflects what was seeded into the corpus at build time, not a live regulatory feed. For current CMS transmittals, verify directly with authoritative sources.',
        },
        {
          title: 'No EHR connection by default',
          body: 'EHR-layer compliance evaluation (unsigned orders, missing clinical documentation, plan-of-care mismatches) requires Phase 3 integration. Without EHR data, Brad cannot evaluate clinical documentation compliance. Gaps in this domain will show "No operational data available for EHR domain."',
        },
        {
          title: 'Phase 1 operational data is seeded, not live',
          body: 'The operational gaps and lifecycle alerts shown in Phase 1 are pre-loaded seed data. They represent realistic compliance scenarios but are not connected to your live task management system until Phase 2 adapters are active. Phase availability is shown in the Phase Status badges below each response.',
        },
        {
          title: 'No conversation memory',
          body: 'Brad does not maintain conversation history. Each command is evaluated independently. There is no follow-up context from previous queries. Reference specific IDs in your query to anchor Brad to a specific document.',
        },
        {
          title: 'Not a legal opinion',
          body: 'Brad identifies regulatory risk and surfaces policy requirements. It does not provide legal advice. Compliance decisions with significant organizational, financial, or licensing consequences should be reviewed by qualified legal counsel.',
        },
        {
          title: 'Confidence score is a retrieval signal, not a guarantee',
          body: 'A high confidence score means the corpus retrieval was strong and a governing policy was found. It does not guarantee the policy is current, correctly implemented, or that your organization is actually compliant. Use Brad to identify areas to investigate, not as a final compliance certification.',
        },
      ].map(({ title, body }) => (
        <div key={title} style={{ paddingBottom: 14, paddingTop: 14, borderBottom: `1px solid ${C.borderLight}` }}>
          <div style={{ fontFamily: C.head, fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>{title}</div>
          <p style={{ fontSize: 13, color: C.textSub, lineHeight: 1.65, margin: 0 }}>{body}</p>
        </div>
      ))}
    </section>
  );
}

function SectionBestPractices() {
  return (
    <section id="help-best-practices">
      <SectionHead icon={CheckCircle2} title="Best Practices" subtitle="How to get accurate results, prepare for survey using Brad, and validate outputs." />

      <Divider />
      <Label>Writing effective queries</Label>
      <BulletList items={[
        'Be specific — "What is the OIG screening requirement for new employees?" gets a better answer than "OIG".',
        'Reference document IDs when you know them — this anchors Brad to a specific policy and improves confidence.',
        'State the context — "What does the plan of care require for wound care under Medicare?" is more precise than "plan of care".',
        'Use the correct output tab — an audit checklist query on the Answer tab returns a less structured result than on the Pre-Survey Audit tab.',
        'Ask gap questions directly — "What is missing for QAPI?" surfaces gaps more reliably than "Tell me about QAPI".',
      ]} />

      <Divider />
      <Label>Preparing for survey using Brad</Label>
      <NumList items={[
        <>Run <CodeChip>Run pre-survey audit</CodeChip> on the Pre-Survey Audit tab to generate a structured deficiency checklist.</>,
        <>For each deficiency, click the Governing Policy ID to review the exact requirement language.</>,
        <>Generate an Action Plan for critical and high-severity findings using the Action Plan tab.</>,
        <>Check operational gaps for overdue tasks, missing artifacts, and unsigned forms.</>,
        <>Review all lifecycle alerts — policies in draft, under review, or overdue for review are not valid governing authority.</>,
        <>Generate a Governing Body brief to document your survey preparedness assessment for leadership.</>,
        <>Re-run the audit after corrective actions are completed to verify the gaps are resolved.</>,
      ]} />

      <Divider />
      <Label>Validating Brad's outputs</Label>
      <BulletList items={[
        'Always open the Governing Policy ID and review the cited section directly — do not rely on Brad\'s summary alone for high-stakes decisions.',
        'Check the confidence score — anything below 60 should trigger a manual corpus review.',
        'Verify that citations reference the correct policy section and that the excerpt is relevant to your query.',
        'When Brad says "No operational data available," do not interpret this as compliance — it means the data layer is not connected.',
        'For regulatory alerts, verify against the primary CMS or OIG source before taking corrective action.',
        'Use the Requirements Snapshot to cross-check individual requirements against your current documentation.',
      ]} />

      <Divider />
      <Label>When to escalate beyond Brad</Label>
      <BulletList items={[
        'When confidence score is below 45 and the decision has significant compliance consequences.',
        'When a query returns "No Answer Found" for a topic you believe is covered in policy.',
        'When regulatory alerts indicate immediate deadlines and external source verification is needed.',
        'When EHR-layer data is needed and Phase 3 is not yet active.',
        'When the finding involves potential legal liability, claim denial appeals, or licensing action.',
      ]} />
    </section>
  );
}

function SectionQuickCommands() {
  return (
    <section id="help-quick-commands">
      <SectionHead icon={Terminal} title="Quick Commands" subtitle="Ready-to-use queries organized by use case. Copy and submit directly." />

      <Divider />
      <Label>Survey readiness</Label>
      <CommandExample query="Run pre-survey audit" intent="Pre-Survey Audit" description="Generates a full deficiency checklist across all major CoP domains." />
      <CommandExample query="Are we ready for survey?" intent="Answer" description="Overall survey readiness assessment with gap summary." />
      <CommandExample query="What would fail survey in QAPI today?" intent="Pre-Survey Audit" description="QAPI-specific deficiency scan." />
      <CommandExample query="What are the biggest compliance risks right now?" intent="Answer" description="Prioritized risk overview across all domains." />

      <Divider />
      <Label>Compliance gaps</Label>
      <CommandExample query="Identify compliance gaps in infection control" intent="Pre-Survey Audit" description="Infection control domain gap analysis." />
      <CommandExample query="What is missing for QAPI?" intent="Answer" description="QAPI documentation and process gaps." />
      <CommandExample query="Show missing forms for governing body" intent="Operational" description="Governing body documentation gaps." />
      <CommandExample query="Which policies are pending approval?" intent="Answer" description="Policy lifecycle — pending approval status." />
      <CommandExample query="What is missing for a Medicare claim to be billable?" intent="Answer" description="Billing compliance — Medicare documentation requirements." />

      <Divider />
      <Label>Personnel and HR</Label>
      <CommandExample query="Who is overdue for OIG screening?" intent="Operational" description="OIG exclusion screening compliance status." />
      <CommandExample query="What forms are required for new employee onboarding?" intent="Answer" description="Complete onboarding documentation checklist." />
      <CommandExample query="What is required before an employee can be placed in service?" intent="Answer" description="Pre-placement compliance requirements." />
      <CommandExample query="What are the background check requirements?" intent="Answer" description="Background screening policy requirements." />

      <Divider />
      <Label>Policy management</Label>
      <CommandExample query="Which policies need approval?" intent="Operational" description="All policies currently in pending_approval state." />
      <CommandExample query="Show all policies overdue for review" intent="Operational" description="Policy lifecycle — overdue review status." />
      <CommandExample query="What policies does the governing body need to review?" intent="Governing Body" description="Governing body policy review requirements." />
      <CommandExample query="Show lifecycle status for all HR policies" intent="Operational" description="HR policy lifecycle overview." />

      <Divider />
      <Label>Clinical documentation</Label>
      <CommandExample query="What is required on a plan of care?" intent="Answer" description="Plan of care requirements under Medicare CoP." />
      <CommandExample query="What documentation is required for wound care visits?" intent="Answer" description="Visit documentation requirements — wound care." />
      <CommandExample query="What are the physician order signature requirements?" intent="Answer" description="Physician order authentication and timing requirements." />

      <Divider />
      <Label>Studio output modes</Label>
      <CommandExample query="Create governing body brief for CMIA risk" intent="Governing Body" description="Executive briefing on corporate integrity/CMIA risk." />
      <CommandExample query="Create QAPI digest for infection control" intent="QAPI Digest" description="QAPI-formatted performance improvement digest." />
      <CommandExample query="Create action plan for survey deficiencies" intent="Action Plan" description="Prioritized corrective action plan from deficiencies." />
      <CommandExample query="Create knowledge article for new hire orientation" intent="Knowledge Article" description="Staff-facing knowledge document from policy content." />
    </section>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────

function Sidebar({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <nav
      aria-label="Help section navigation"
      style={{
        width: 210,
        flexShrink: 0,
        paddingTop: 4,
        paddingRight: 20,
        position: 'sticky',
        top: 0,
        maxHeight: '100%',
        overflowY: 'auto',
      }}
    >
      {GROUPS.map(group => {
        const sections = NAV.filter(s => s.group === group);
        return (
          <div key={group} style={{ marginBottom: 20 }}>
            <div style={{
              fontFamily: C.mono,
              fontSize: 9,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              color: C.textMuted,
              marginBottom: 6,
              paddingLeft: 8,
            }}>
              {group}
            </div>
            {sections.map(s => {
              const isActive = active === s.id;
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelect(s.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    width: '100%',
                    textAlign: 'left',
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: 'none',
                    background: isActive ? C.accentLight : 'transparent',
                    color: isActive ? C.accent : C.textSub,
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'background 0.15s, color 0.15s',
                    fontFamily: C.head,
                    lineHeight: 1.4,
                    marginBottom: 1,
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = C.surfaceAlt;
                      e.currentTarget.style.color = C.text;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = C.textSub;
                    }
                  }}
                >
                  <Icon size={12} strokeWidth={2} />
                  <span style={{ flex: 1 }}>{s.label}</span>
                  {s.badge === 'critical' && (
                    <span style={{ fontFamily: C.mono, fontSize: 8, fontWeight: 700, color: C.dangerMid, background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, borderRadius: 3, padding: '1px 4px' }}>
                      CRIT
                    </span>
                  )}
                  {s.badge === 'important' && (
                    <span style={{ fontFamily: C.mono, fontSize: 8, fontWeight: 700, color: C.warning, background: C.warningBg, border: `1px solid ${C.warningBorder}`, borderRadius: 3, padding: '1px 4px' }}>
                      IMP
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

// ── Section renderers map ─────────────────────────────────────────────

const SECTION_RENDERERS: Record<string, () => React.ReactNode> = {
  'what-is-brad':           () => <SectionWhatIsBrad />,
  'how-to-use':             () => <SectionHowToUse />,
  'survey-mode':            () => <SectionSurveyMode />,
  'context-assist':         () => <SectionContextAssist />,
  'operational-monitoring': () => <SectionOperationalMonitoring />,
  'reading-results':        () => <SectionReadingResults />,
  'regulatory-awareness':   () => <SectionRegulatoryAwareness />,
  'limitations':            () => <SectionLimitations />,
  'best-practices':         () => <SectionBestPractices />,
  'quick-commands':         () => <SectionQuickCommands />,
};

// ── Main component ───────────────────────────────────────────────────

export interface BradHelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BradHelpCenter({ isOpen, onClose }: BradHelpCenterProps) {
  const [activeSection, setActiveSection] = useState('what-is-brad');
  const contentRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const scrollTo = useCallback((id: string) => {
    setActiveSection(id);
    const el = contentRef.current?.querySelector(`#help-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Scrollspy: update active section based on scroll position
  const handleScroll = useCallback(() => {
    const container = contentRef.current;
    if (!container) return;
    const containerTop = container.getBoundingClientRect().top;
    let closest = NAV[0].id;
    let closestDist = Infinity;
    for (const s of NAV) {
      const el = container.querySelector(`#help-${s.id}`);
      if (!el) continue;
      const dist = Math.abs(el.getBoundingClientRect().top - containerTop - 32);
      if (dist < closestDist) {
        closestDist = dist;
        closest = s.id;
      }
    }
    setActiveSection(closest);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Brad Help Center"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15,12,11,0.45)',
        }}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 980,
          height: '100%',
          background: C.bg,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: `1px solid ${C.border}`,
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: `1px solid ${C.border}`,
            background: C.surface,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={16} strokeWidth={1.75} style={{ color: C.accent }} />
            <div>
              <div style={{ fontFamily: C.head, fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1 }}>
                Brad Help Center
              </div>
              <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.28em', marginTop: 3 }}>
                Documentation · iAdministrator v1
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close help center"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              background: 'transparent',
              color: C.textMuted,
              cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.surfaceAlt; e.currentTarget.style.color = C.text; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.textMuted; }}
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Sidebar */}
          <div
            style={{
              padding: '24px 0 24px 20px',
              borderRight: `1px solid ${C.border}`,
              background: C.surface,
              overflowY: 'auto',
              flexShrink: 0,
            }}
          >
            <Sidebar active={activeSection} onSelect={scrollTo} />
          </div>

          {/* Content */}
          <div
            ref={contentRef}
            onScroll={handleScroll}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '32px 36px 64px 36px',
            }}
          >
            {/* Render all sections sequentially for scroll navigation */}
            {NAV.map((s, i) => (
              <div key={s.id}>
                {SECTION_RENDERERS[s.id]?.()}
                {i < NAV.length - 1 && (
                  <div style={{ borderTop: `2px solid ${C.border}`, margin: '40px 0', opacity: 0.6 }} />
                )}
              </div>
            ))}

            {/* Footer */}
            <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <FileText size={12} strokeWidth={1.75} style={{ color: C.textMuted }} />
                <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.28em' }}>
                  iAdministrator · Brad Documentation · Care Indeed Home Health
                </span>
              </div>
              <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, maxWidth: 600 }}>
                This documentation reflects Brad's behavior as defined in the FinalUpgradeBrad421 system configuration. Brad is corpus-constrained, non-hallucinating, and designed to behave with the rigor of a CMS surveyor. Report discrepancies between this documentation and observed behavior to your system administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BradHelpCenter;
