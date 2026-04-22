import { useState, useMemo, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, ArrowLeft, ShieldCheck, Cpu, DollarSign,
  Map as MapIcon, Gavel, FileSearch, ChevronRight, Radio, Lock,
  Activity, Eye, EyeOff, Skull, Server, Building2, Crosshair,
  AlertOctagon, ChevronDown, Layers,
} from 'lucide-react';

/* ═════════════════════════════════════════════════════════════════
   Brad 2.0 — INTERACTIVE DECISION SYSTEM
   Mission-control aesthetic. Dark canvas, neon accents.
   No scrolling. Tabs + drawers + modals + audit mode.
   Theme enforcement: Organization owns 100% of compliance liability.
   ═════════════════════════════════════════════════════════════════ */

// ── Care Indeed Brand Tokens ────────────────────────────────────
const T = {
  orange:     '#C74601',
  orangeHot:  '#FF6A1A',
  orangeDark: '#421700',
  orangeSoft: '#FFE7D7',
  teal:       '#007970',
  tealBright: '#1FB5A8',
  tealDark:   '#004142',
  tealSoft:   '#D4ECEA',
  charcoal:   '#1F1C1B',
  void:       '#0B0908',
  panel:      '#15110F',
  panel2:     '#1C1715',
  line:       '#2A2320',
  line2:      '#3A2F2A',
  ash:        '#6E5F58',
  fog:        '#A8978E',
  bone:       '#E5DDD7',
  surface:    '#FAFBF8',
  success:    '#2ECC71',
  warning:    '#FFC700',
  error:      '#FF3B30',
  errorDeep:  '#A00000',
  head:       "'Outfit', 'Montserrat', system-ui, sans-serif",
  mono:       "'JetBrains Mono', 'IBM Plex Mono', monospace",
  body:       "'Roboto', system-ui, sans-serif",
};

/* ═════════════════════════════════════════════════════════════════
   DOMAIN MODEL
   ═════════════════════════════════════════════════════════════════ */

type TabId = 'brief' | 'threat' | 'arch' | 'liability' | 'cost' | 'roadmap' | 'decision' | 'audit';

interface Tab { id: TabId; code: string; label: string; icon: typeof ShieldCheck; }

const TABS: Tab[] = [
  { id: 'brief',     code: 'BRF', label: 'Mission Brief',     icon: Radio },
  { id: 'threat',    code: 'THR', label: 'Threat Surface',    icon: Crosshair },
  { id: 'arch',      code: 'ARC', label: 'Architectures',     icon: Layers },
  { id: 'liability', code: 'LIA', label: 'Responsibility',    icon: Gavel },
  { id: 'cost',      code: 'FIN', label: 'Cost Behavior',     icon: DollarSign },
  { id: 'roadmap',   code: 'OPS', label: 'Roadmap',           icon: MapIcon },
  { id: 'decision',  code: 'DEC', label: 'Decision Engine',   icon: Cpu },
  { id: 'audit',     code: 'AUD', label: 'Audit Console',     icon: FileSearch },
];

/** Generic interactive tile with progressive disclosure */
interface DrillDown {
  id: string;
  eyebrow: string;       // L1 - tag
  title: string;         // L1 - summary
  summary: string;       // L1 - 1 line
  detail: string;        // L2 - paragraph
  evidence: string[];    // L3 - logs/citations
  failure: string;       // failure mode
  owner: string;         // who's responsible
  consequence: string;   // what happens if it fails
  severity: 'critical' | 'high' | 'medium' | 'info';
  tone?: 'orange' | 'teal' | 'warning' | 'error' | 'success';
}

/* ═════════════════════════════════════════════════════════════════
   CONTENT
   ═════════════════════════════════════════════════════════════════ */

const BRIEF_TILES: DrillDown[] = [
  {
    id: 'brf-1', eyebrow: 'CORE THESIS', title: 'Architecture Cannot Transfer Liability',
    summary: 'Every architecture leaves the organization fully accountable.',
    detail: 'There is no SaaS, BAA, certification, or vendor agreement that removes the organization\'s legal duty to protect PHI. The architecture only changes WHERE failures originate — not WHO answers for them. OCR, state regulators, and plaintiffs name the covered entity, not the vendor.',
    evidence: [
      'HIPAA §164.308(b)(1) — covered entity retains accountability',
      'HHS OCR enforcement actions 2019–2025 — 87% name covered entity primarily',
      'State AG actions follow the data, not the platform',
    ],
    failure: 'Leadership assumes vendor BAA = compliance.',
    owner: 'CEO + Compliance Officer',
    consequence: 'Settlement, CAP, brand collapse, possible exclusion from federal programs.',
    severity: 'critical', tone: 'orange',
  },
  {
    id: 'brf-2', eyebrow: 'PRIMARY RECOMMENDATION', title: 'Self-Hosted on Hardened Linux',
    summary: 'Single source of truth for PHI. Vendor adjacencies isolated.',
    detail: 'Operate the policy and PHI core on self-hosted Linux with full audit, key custody, and offline failover. Permitted SaaS adjacencies (e.g. Workday) live in a non-PHI zone with strict egress filtering.',
    evidence: [
      'Files 01–10 — hardened blueprint, threat model, 100-pass simulation',
      'File 17 — final recommendation with conditions',
    ],
    failure: 'Treating self-host as "set and forget."',
    owner: 'Platform Engineering Lead',
    consequence: 'Drift erodes the control plane within 18 months.',
    severity: 'high', tone: 'teal',
  },
  {
    id: 'brf-3', eyebrow: 'NON-NEGOTIABLES', title: 'Five Floors That Cannot Be Crossed',
    summary: 'Identity, encryption, audit, key custody, egress — all org-owned.',
    detail: 'Five controls must remain inside organizational custody regardless of architecture: workforce identity, key management, immutable audit, network egress policy, and incident response authority. Any vendor that requires giving these up is disqualified.',
    evidence: [
      'NIST SP 800-66r2 §4.4 — control retention',
      'SOC 2 CC6.x — logical access controls',
    ],
    failure: 'Vendor sells "managed identity" and we accept.',
    owner: 'CISO',
    consequence: 'We lose forensic ground truth and key recovery.',
    severity: 'critical', tone: 'orange',
  },
  {
    id: 'brf-4', eyebrow: 'OUTCOME', title: '100/100 Breach Simulation Pass',
    summary: 'Hardened blueprint survived 100 consecutive red-team passes.',
    detail: 'The 100-pass simulation (file 06) executed deterministic threat scenarios across phishing, lateral movement, supply chain, insider, and ransomware vectors. Final manifest (file 08) closed all gaps observed.',
    evidence: [
      'File 06 — Breach Simulation 100-Pass log',
      'File 09 — Penetration test report',
    ],
    failure: 'Skipping continuous re-validation.',
    owner: 'Security Engineering',
    consequence: 'Score becomes a snapshot. Threat landscape moves on.',
    severity: 'medium', tone: 'success',
  },
];

const THREAT_TILES: DrillDown[] = [
  {
    id: 'thr-1', eyebrow: 'VECTOR 01', title: 'Vendor Compromise Spillover',
    summary: 'Upstream vendor breach reaches our PHI through trusted integration.',
    detail: 'A SaaS vendor with valid BAA is breached. Their incident timeline is opaque. Our PHI flows are caught in their blast radius. We must notify under HIPAA §164.404 — within 60 days from THEIR discovery, which we may not learn for weeks.',
    evidence: [
      'Change Healthcare 2024 — 100M records, downstream notifications still ongoing',
      'OCR breach portal — 38% of 2023–2024 breaches involved business associates',
    ],
    failure: 'No contractual requirement for vendor breach notification < 24h.',
    owner: 'Vendor Risk Manager',
    consequence: 'We breach notification timelines. Regulators see negligence, not bad luck.',
    severity: 'critical', tone: 'error',
  },
  {
    id: 'thr-2', eyebrow: 'VECTOR 02', title: 'Misconfiguration in Shared Responsibility',
    summary: 'Vendor secures the infra. WE misconfigure the tenant.',
    detail: 'Every major cloud breach root-causes to customer-side misconfiguration: open buckets, over-permissive IAM, disabled logging, default keys. The vendor\'s SOC 2 does not cover OUR configuration.',
    evidence: [
      'Verizon DBIR 2024 — 82% of cloud breaches = misconfig',
      'AWS Shared Responsibility Model — customer owns IAM, data, network rules',
    ],
    failure: 'Treating SOC 2 report as our compliance.',
    owner: 'Cloud Engineering',
    consequence: 'Full organizational liability with no vendor offset.',
    severity: 'critical', tone: 'orange',
  },
  {
    id: 'thr-3', eyebrow: 'VECTOR 03', title: 'Derived & De-identified Data Use',
    summary: 'Default vendor terms permit training and analytics on derived data.',
    detail: 'Many SaaS BAAs reserve the right to use de-identified or aggregated data. Once data leaves your tenant — even "de-identified" — re-identification risk and downstream model contamination become impossible to audit.',
    evidence: [
      'OpenAI / Anthropic enterprise terms — opt-out required, not default',
      'NIST SP 800-188 — de-identification ≠ anonymization',
    ],
    failure: 'Procurement signs default master terms.',
    owner: 'Legal + Procurement',
    consequence: 'PHI derivatives become training data. Permanent.',
    severity: 'high', tone: 'warning',
  },
  {
    id: 'thr-4', eyebrow: 'VECTOR 04', title: 'Insider via Privileged SaaS Console',
    summary: 'A vendor admin can read your data. Their controls aren\'t yours.',
    detail: 'Vendor support engineers with break-glass access can — and historically have — accessed customer tenants. You see only what their audit chooses to expose. Your DLP cannot see their console.',
    evidence: [
      'Microsoft 2024 Midnight Blizzard — internal mailbox access via legacy auth',
      'Okta 2023 — support case file exposure',
    ],
    failure: 'No customer-side BYOK + key revocation drill.',
    owner: 'CISO',
    consequence: 'Forensic ground truth lives on vendor systems. You ask permission.',
    severity: 'high', tone: 'error',
  },
  {
    id: 'thr-5', eyebrow: 'VECTOR 05', title: 'Service Outage During Incident',
    summary: 'When SaaS goes down, your IR runbook goes with it.',
    detail: 'If SIEM, ticketing, identity, and chat all live in SaaS, a regional cloud event cripples your response. You cannot investigate a breach using systems that are themselves degraded.',
    evidence: [
      'CrowdStrike outage July 2024 — 8.5M endpoints down',
      'AWS us-east-1 outages — 2021, 2023, 2025',
    ],
    failure: 'No offline IR pack. No paper runbook. No out-of-band comms.',
    owner: 'Incident Response Lead',
    consequence: 'RTO breaches. Regulators see chaos in the timeline.',
    severity: 'high', tone: 'warning',
  },
  {
    id: 'thr-6', eyebrow: 'VECTOR 06', title: 'Model & Prompt Injection (AI Surface)',
    summary: 'LLM tools become attack surface for PHI exfiltration.',
    detail: 'Any AI assistant that touches PHI — vendor or self-hosted — opens prompt injection, jailbreak, and data exfiltration paths. Vendor "guardrails" are opaque. Our content policy must be enforced at OUR boundary.',
    evidence: [
      'OWASP LLM Top 10 — LLM01 Prompt Injection, LLM06 Sensitive Info Disclosure',
      'File 04 — threat model AI surface',
    ],
    failure: 'Trusting vendor safety filters as the only line.',
    owner: 'AI Platform Engineer',
    consequence: 'Single crafted prompt can exfiltrate PHI through a "safe" tool.',
    severity: 'high', tone: 'error',
  },
];

interface ArchProfile {
  id: 'sh' | 'a' | 'b' | 'c';
  code: string;
  name: string;
  oneLine: string;
  fiveYearTCO: string;
  controlIndex: number;     // 0-100
  vendorPct: number;        // shared-responsibility split
  liabilityPct: 100;        // ALWAYS 100. THEME ENFORCEMENT.
  rto: string;
  blastRadius: string;
  recommended: boolean;
  tone: 'teal' | 'orange' | 'warning' | 'error';
  pros: string[];
  cons: string[];
  failureMode: string;
  consequence: string;
  owner: string;
}

const ARCHITECTURES: ArchProfile[] = [
  {
    id: 'sh', code: 'SH', name: 'Self-Hosted Hardened Linux',
    oneLine: 'Single source of truth. Org owns every floor.',
    fiveYearTCO: '$1.35M', controlIndex: 96, vendorPct: 12, liabilityPct: 100,
    rto: '< 4h', blastRadius: 'Org-only', recommended: true, tone: 'teal',
    pros: [
      'Full key custody (BYOK + HSM)',
      'Immutable on-prem audit chain',
      'Offline IR pack; no SaaS dependency in incident',
      'No vendor-side data use clauses',
      'Egress filtering enforced at perimeter',
    ],
    cons: [
      'Requires platform engineering staffing',
      'Patch and drift discipline is non-negotiable',
      'Hardware refresh on 5-yr cycle',
    ],
    failureMode: 'Skipped patch cycles → known-CVE drift.',
    consequence: 'Ransomware via unpatched kernel. Self-host failed because operations failed.',
    owner: 'Platform Engineering Lead',
  },
  {
    id: 'a', code: 'A', name: 'Hyperscaler PaaS + BAA',
    oneLine: 'Vendor runs infra. You run identity, keys, configs.',
    fiveYearTCO: '$5.5M', controlIndex: 78, vendorPct: 55, liabilityPct: 100,
    rto: '< 1h', blastRadius: 'Hyperscaler region', recommended: false, tone: 'warning',
    pros: [
      'Elastic scale; managed patching at infra layer',
      'Mature compliance attestations (SOC 2, HITRUST)',
      'Faster provisioning of new workloads',
    ],
    cons: [
      'Customer-side IAM and config = breach root cause',
      'Egress costs scale with usage',
      'Shared responsibility constantly redrawn by vendor',
      'Region-wide outages cripple IR',
    ],
    failureMode: 'IAM misconfiguration on a Friday push.',
    consequence: 'Public S3-style exposure of PHI. Vendor SOC 2 does not cover you.',
    owner: 'Cloud Engineering Lead',
  },
  {
    id: 'b', code: 'B', name: 'Healthcare-Vertical SaaS',
    oneLine: 'Pre-built workflows. Vendor owns operations.',
    fiveYearTCO: '$4.8M', controlIndex: 62, vendorPct: 78, liabilityPct: 100,
    rto: 'Vendor SLA', blastRadius: 'All vendor tenants', recommended: false, tone: 'orange',
    pros: [
      'Fastest go-live for COTS workflows',
      'Pre-built HIPAA workflows and forms',
      'Vendor-managed updates',
    ],
    cons: [
      'Multi-tenant noisy-neighbor & spillover risk',
      'Limited audit visibility (their logs, their schema)',
      'Vendor lock-in; export friction at end-of-life',
      'Customization limits map our policy to their model',
    ],
    failureMode: 'Vendor breach. We learn weeks late.',
    consequence: 'Breach notification clock starts late. Regulators see negligence.',
    owner: 'Vendor Risk Manager + CISO',
  },
  {
    id: 'c', code: 'C', name: 'Multi-SaaS Best-of-Breed',
    oneLine: 'Stitched stack. Most surface area. Most contracts.',
    fiveYearTCO: '$7.4M', controlIndex: 41, vendorPct: 88, liabilityPct: 100,
    rto: 'Variable', blastRadius: 'N vendor tenants', recommended: false, tone: 'error',
    pros: [
      'Best-in-class per function (in theory)',
      'Independent vendor failure isolation per workload',
    ],
    cons: [
      'N vendors = N BAAs, N audits, N breach surfaces',
      'Integration glue becomes its own attack surface',
      'No single throat to choke during incident',
      'Identity sprawl; SSO becomes the keystone risk',
      'Highest 5-yr TCO and highest operational tax',
    ],
    failureMode: 'SSO/IdP compromise cascades across all vendors.',
    consequence: 'One credential = total ecosystem breach.',
    owner: 'CISO + Vendor Risk Manager',
  },
];

interface LiabilityRow {
  layer: string;
  shVendor: number; shOrg: number;   // %
  aVendor: number;  aOrg: number;
  bVendor: number;  bOrg: number;
  cVendor: number;  cOrg: number;
  liabilityNote: string;
}

const LIABILITY_LAYERS: LiabilityRow[] = [
  { layer: 'Physical / DC',         shVendor: 30, shOrg: 70, aVendor: 100, aOrg: 0,  bVendor: 100, bOrg: 0,  cVendor: 100, cOrg: 0,  liabilityNote: 'Vendor operates floor; org still names parties on breach.' },
  { layer: 'Network / Egress',      shVendor: 0,  shOrg: 100, aVendor: 40, aOrg: 60, bVendor: 80,  bOrg: 20, cVendor: 60,  cOrg: 40, liabilityNote: 'Egress policy is YOUR breach surface regardless of vendor.' },
  { layer: 'Identity / IAM',        shVendor: 0,  shOrg: 100, aVendor: 20, aOrg: 80, bVendor: 50,  bOrg: 50, cVendor: 30,  cOrg: 70, liabilityNote: 'Identity is the keystone. Always organizational.' },
  { layer: 'Key Management',        shVendor: 0,  shOrg: 100, aVendor: 30, aOrg: 70, bVendor: 70,  bOrg: 30, cVendor: 60,  cOrg: 40, liabilityNote: 'Loss of key custody = loss of forensic ground truth.' },
  { layer: 'Application Logic',     shVendor: 0,  shOrg: 100, aVendor: 0,  aOrg: 100, bVendor: 90, bOrg: 10, cVendor: 85,  cOrg: 15, liabilityNote: 'Bugs in vendor app still trigger YOUR breach notification.' },
  { layer: 'Audit & Logging',       shVendor: 0,  shOrg: 100, aVendor: 30, aOrg: 70, bVendor: 70,  bOrg: 30, cVendor: 65,  cOrg: 35, liabilityNote: 'You cannot prove what you do not log yourself.' },
  { layer: 'Incident Response',     shVendor: 0,  shOrg: 100, aVendor: 10, aOrg: 90, bVendor: 40,  bOrg: 60, cVendor: 25,  cOrg: 75, liabilityNote: 'Vendor will not lead YOUR notification. Ever.' },
  { layer: 'Workforce Training',    shVendor: 0,  shOrg: 100, aVendor: 0,  aOrg: 100, bVendor: 0,  bOrg: 100, cVendor: 0,   cOrg: 100, liabilityNote: 'Always 100% organizational. No exceptions.' },
  { layer: 'Regulatory Notification', shVendor: 0, shOrg: 100, aVendor: 0, aOrg: 100, bVendor: 0,  bOrg: 100, cVendor: 0,   cOrg: 100, liabilityNote: 'OCR names the covered entity. Period.' },
];

interface CostScenario {
  id: string;
  label: string;
  desc: string;
  sh: number; a: number; b: number; c: number;  // 5-yr $M
  hidden: string;
}

const COST_SCENARIOS: CostScenario[] = [
  { id: 'base',    label: 'Baseline 5-yr',    desc: 'Stated TCO at signed terms.',     sh: 1.35, a: 5.5,  b: 4.8,  c: 7.4,  hidden: 'Excludes hidden costs below.' },
  { id: 'hidden',  label: '+ Hidden Costs',    desc: 'Egress, integration glue, IR retainer, audit overhead, lock-in exit.', sh: 1.65, a: 7.8,  b: 7.2,  c: 11.4, hidden: 'Vendor adds compound at year 3+.' },
  { id: 'breach',  label: '+ One Breach Event', desc: 'Add expected breach cost (OCR+remediation+notification at industry mean).', sh: 3.15, a: 9.6,  b: 9.4,  c: 14.2, hidden: 'Probability rises with vendor surface area.' },
  { id: 'scale2x', label: '2× Scale',          desc: 'Patient population doubles.',     sh: 2.10, a: 11.4, b: 9.6,  c: 14.8, hidden: 'SaaS scales linearly with seats; SH scales sub-linearly.' },
];

interface SprintRow {
  id: string; sprint: string; epic: string; owner: string; status: 'done' | 'active' | 'next' | 'queued';
  detail: string; failure: string; consequence: string;
}

const ROADMAP: SprintRow[] = [
  { id: 'S1', sprint: 'S1', epic: 'Foundation: Identity, Keys, Audit',         owner: 'CISO + PE',   status: 'done',   detail: 'Stand up IdP with phishing-resistant MFA, BYOK + HSM, immutable audit chain.', failure: 'MFA bypass via legacy auth.', consequence: 'Identity becomes single point of failure.' },
  { id: 'S2', sprint: 'S2', epic: 'Hardened Linux Baseline',                    owner: 'PE + SE',     status: 'done',   detail: 'CIS Level 2, eBPF runtime telemetry, SELinux enforcing, signed kernels.', failure: 'Drift from baseline within 90 days.', consequence: 'Audit gap on next assessment.' },
  { id: 'S3', sprint: 'S3', epic: 'PHI Zoning + Egress Policy',                 owner: 'PE + Sec',    status: 'done',   detail: 'Z-PHI, Z-NPHI, Z-PUBLIC zones with default-deny egress and DNS allow-list.', failure: 'Allow-list rot.', consequence: 'Silent egress to typo-squat domain.' },
  { id: 'S4', sprint: 'S4', epic: 'Application Stack + RBAC',                   owner: 'AE + PO',     status: 'active', detail: 'Brad shell, policy engine, role model, session classifier, audit envelope.', failure: 'Role explosion; least-privilege erodes.', consequence: 'Auditor-flagged over-entitlement.' },
  { id: 'S5', sprint: 'S5', epic: 'AI Surface Hardening',                       owner: 'MLE + Sec',   status: 'active', detail: 'Prompt isolation, content policy at boundary, output filtering, jailbreak telemetry.', failure: 'Trusting vendor safety filters.', consequence: 'PHI exfiltration via crafted prompt.' },
  { id: 'S6', sprint: 'S6', epic: 'Vendor Risk + Permitted Adjacencies',        owner: 'VRM + Legal', status: 'next',   detail: 'Workday on Z-NPHI, BAA + 24h breach clause, derived-data prohibition.', failure: 'Default master terms accepted.', consequence: 'Derived PHI used in vendor training.' },
  { id: 'S7', sprint: 'S7', epic: '100-Pass Breach Simulation',                 owner: 'Sec + QA',    status: 'next',   detail: 'Deterministic red-team; phishing, lateral, ransomware, supply chain, insider.', failure: 'Treating pass as permanent.', consequence: 'Threat landscape moves; defenses do not.' },
  { id: 'S8', sprint: 'S8', epic: 'Penetration Test + Remediation',             owner: 'Sec + PE',    status: 'queued', detail: 'Third-party pen test; remediate to zero criticals before go-live.', failure: 'Accepting medium findings.', consequence: 'Mediums chain into critical paths.' },
  { id: 'S9', sprint: 'S9', epic: 'IR Drill + Offline Runbook',                 owner: 'IR + Ops',    status: 'queued', detail: 'Tabletop + live drill; offline runbook; OOB comms; legal notification flow.', failure: 'No offline IR pack.', consequence: 'IR collapses when SaaS is degraded.' },
  { id: 'S10', sprint: 'S10', epic: 'SOC 2 Type II Window Open',                owner: 'CO + Sec',    status: 'queued', detail: 'Begin 6-month observation window with full evidence pipeline.', failure: 'Evidence not auto-collected.', consequence: 'Manual scramble at audit time.' },
];

interface ControlRow {
  ctrl: string; family: string; name: string; mapping: string; evidence: string; status: 'pass' | 'partial' | 'gap';
  failureMode: string; owner: string;
}

const CONTROLS: ControlRow[] = [
  { ctrl: 'AC-2',  family: 'Access',     name: 'Account Management',       mapping: 'HIPAA §164.308(a)(4); SOC2 CC6.1', evidence: 'IdP audit + quarterly access review', status: 'pass',    failureMode: 'Stale accounts.', owner: 'CISO' },
  { ctrl: 'AU-2',  family: 'Audit',      name: 'Audit Events',             mapping: 'HIPAA §164.312(b); SOC2 CC7.2',    evidence: 'Immutable on-prem audit chain', status: 'pass',    failureMode: 'Log gaps in upgrade window.', owner: 'PE' },
  { ctrl: 'CM-6',  family: 'Config',     name: 'Configuration Settings',   mapping: 'HIPAA §164.308(a)(1); SOC2 CC8.1', evidence: 'CIS L2 scan + drift dashboard', status: 'partial', failureMode: 'Manual change w/o ticket.', owner: 'PE' },
  { ctrl: 'IA-2',  family: 'Identity',   name: 'Authentication',           mapping: 'HIPAA §164.312(d); SOC2 CC6.1',    evidence: 'Phishing-resistant MFA enforced', status: 'pass',    failureMode: 'Legacy auth path enabled.', owner: 'CISO' },
  { ctrl: 'IR-4',  family: 'Incident',   name: 'Incident Handling',        mapping: 'HIPAA §164.308(a)(6); SOC2 CC7.4', evidence: 'IR plan + tabletop logs', status: 'partial', failureMode: 'No offline runbook.', owner: 'IR Lead' },
  { ctrl: 'SC-12', family: 'CryptoKey',  name: 'Key Establishment',        mapping: 'HIPAA §164.312(a)(2)(iv); CC6.7',  evidence: 'BYOK + HSM custody report', status: 'pass',    failureMode: 'Keys held by vendor.', owner: 'CISO' },
  { ctrl: 'SC-7',  family: 'Boundary',   name: 'Boundary Protection',      mapping: 'HIPAA §164.312(e)(1); SOC2 CC6.6', evidence: 'Default-deny egress + DNS allow-list', status: 'pass',    failureMode: 'Allow-list rot.', owner: 'PE' },
  { ctrl: 'CP-9',  family: 'Continuity', name: 'Information Backup',       mapping: 'HIPAA §164.308(a)(7); SOC2 A1.2',  evidence: 'Air-gapped immutable snapshots', status: 'pass',    failureMode: 'Restore drill skipped.', owner: 'PE' },
  { ctrl: 'AT-2',  family: 'Awareness',  name: 'Workforce Training',       mapping: 'HIPAA §164.308(a)(5); SOC2 CC2.2', evidence: 'Annual + role-based training records', status: 'partial', failureMode: 'Phishing rate above 5%.', owner: 'HSO' },
  { ctrl: 'RA-5',  family: 'Risk',       name: 'Vulnerability Scanning',   mapping: 'HIPAA §164.308(a)(1)(ii)(A); CC7.1', evidence: 'Continuous scanning + SLA dashboard', status: 'pass',    failureMode: 'SLAs missed quietly.', owner: 'Sec' },
];

/* ═════════════════════════════════════════════════════════════════
   PRIMITIVES
   ═════════════════════════════════════════════════════════════════ */

const sevColor = (s: DrillDown['severity']) =>
  s === 'critical' ? T.error : s === 'high' ? T.orangeHot : s === 'medium' ? T.warning : T.tealBright;

const toneColor = (t?: DrillDown['tone']) =>
  t === 'orange' ? T.orange : t === 'teal' ? T.teal : t === 'warning' ? T.warning :
  t === 'error' ? T.error : t === 'success' ? T.success : T.fog;

function Mono({ children, color, size = 10 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <span style={{ fontFamily: T.mono, fontSize: size, color: color || T.fog, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>
      {children}
    </span>
  );
}

function Pill({ children, color = T.tealBright, solid }: { children: ReactNode; color?: string; solid?: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '3px 8px', borderRadius: 4,
        fontFamily: T.mono, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700,
        background: solid ? color : `${color}1A`,
        color: solid ? T.void : color,
        border: solid ? 'none' : `1px solid ${color}55`,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

/** Diagonal stripe bar — one row of the responsibility model */
function ResponsibilityBar({ vendor, org, label, height = 18 }: { vendor: number; org: number; label?: string; height?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {label && <div style={{ fontFamily: T.mono, fontSize: 10, color: T.bone, width: 110, letterSpacing: '0.08em' }}>{label}</div>}
      <div style={{ flex: 1, height, position: 'relative', borderRadius: 3, overflow: 'hidden', border: `1px solid ${T.line2}`, background: T.panel }}>
        <div style={{ position: 'absolute', inset: 0, left: 0, width: `${vendor}%`, background: `linear-gradient(90deg, ${T.tealDark} 0%, ${T.teal} 100%)` }} />
        <div style={{ position: 'absolute', inset: 0, left: `${vendor}%`, width: `${org}%`, background: `linear-gradient(90deg, ${T.orange} 0%, ${T.orangeHot} 100%)` }} />
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fog, minWidth: 80, textAlign: 'right' }}>
        <span style={{ color: T.tealBright }}>{vendor}%</span>
        <span style={{ opacity: 0.4 }}> / </span>
        <span style={{ color: T.orangeHot }}>{org}%</span>
      </div>
    </div>
  );
}

/** Liability rivet — always 100% org. Signature theme device. */
function LiabilityRivet({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const s = size === 'md' ? 56 : 40;
  return (
    <div
      style={{
        width: s, height: s, borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${T.error}, ${T.errorDeep})`,
        boxShadow: `0 0 0 2px ${T.void}, 0 0 0 3px ${T.error}, 0 0 18px ${T.error}66`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: T.mono, fontWeight: 800, fontSize: size === 'md' ? 14 : 11,
        color: T.bone, letterSpacing: '-0.02em',
      }}
      title="Organizational liability is always 100% — non-transferable."
    >
      100%
    </div>
  );
}

/** Interactive tile — clickable, opens detail drawer */
function Tile({ tile, onOpen, audit }: { tile: DrillDown; onOpen: () => void; audit: boolean }) {
  const accent = toneColor(tile.tone);
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        textAlign: 'left', cursor: 'pointer',
        background: `linear-gradient(180deg, ${T.panel2} 0%, ${T.panel} 100%)`,
        border: `1px solid ${T.line}`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: 8, padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 8,
        transition: 'transform 120ms ease, border-color 120ms ease, box-shadow 120ms ease',
        position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = accent;
        e.currentTarget.style.boxShadow = `0 8px 24px -8px ${accent}55, 0 0 0 1px ${accent}33`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = T.line;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Mono color={accent}>{tile.eyebrow}</Mono>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: sevColor(tile.severity), boxShadow: `0 0 8px ${sevColor(tile.severity)}` }} />
          <Mono color={sevColor(tile.severity)} size={9}>{tile.severity}</Mono>
        </span>
      </div>
      <div style={{ fontFamily: T.head, fontSize: 16, fontWeight: 700, color: T.bone, letterSpacing: '-0.01em', lineHeight: 1.25 }}>
        {tile.title}
      </div>
      <div style={{ fontFamily: T.body, fontSize: 12.5, color: T.fog, lineHeight: 1.5 }}>
        {tile.summary}
      </div>
      {audit && (
        <div style={{ marginTop: 4, paddingTop: 8, borderTop: `1px dashed ${T.line2}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Skull size={11} color={T.error} />
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.error }}>FAIL: {tile.failure}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Building2 size={11} color={T.tealBright} />
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.tealBright }}>OWNER: {tile.owner}</span>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <Mono color={T.ash} size={9}>CLICK TO OPEN ▸</Mono>
        <ChevronRight size={14} color={accent} />
      </div>
    </button>
  );
}

/** Right-sliding detail drawer with progressive disclosure */
function Drawer({ tile, onClose }: { tile: DrillDown | null; onClose: () => void }) {
  const [showEvidence, setShowEvidence] = useState(false);
  useEffect(() => { setShowEvidence(false); }, [tile?.id]);

  if (!tile) return null;
  const accent = toneColor(tile.tone);

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex', justifyContent: 'flex-end',
        animation: 'fadeIn 180ms ease',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(560px, 90vw)', height: '100%',
          background: `linear-gradient(180deg, ${T.panel2} 0%, ${T.void} 100%)`,
          borderLeft: `2px solid ${accent}`,
          padding: '20px 24px',
          display: 'flex', flexDirection: 'column', gap: 16,
          overflow: 'hidden',
          boxShadow: `-12px 0 48px ${accent}55`,
          animation: 'slideIn 220ms ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Pill color={accent} solid>{tile.eyebrow}</Pill>
            <Pill color={sevColor(tile.severity)}>{tile.severity}</Pill>
          </div>
          <button
            type="button" onClick={onClose}
            style={{ background: 'transparent', border: `1px solid ${T.line2}`, color: T.bone, cursor: 'pointer', padding: 6, borderRadius: 4 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* L1 Title */}
        <div>
          <Mono color={T.ash} size={9}>LEVEL 1 · SUMMARY</Mono>
          <div style={{ fontFamily: T.head, fontSize: 24, fontWeight: 800, color: T.bone, letterSpacing: '-0.015em', lineHeight: 1.2, marginTop: 4 }}>
            {tile.title}
          </div>
          <div style={{ fontFamily: T.body, fontSize: 14, color: T.fog, marginTop: 6 }}>{tile.summary}</div>
        </div>

        {/* L2 Detail */}
        <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 6, padding: '12px 14px' }}>
          <Mono color={T.ash} size={9}>LEVEL 2 · DETAIL</Mono>
          <p style={{ fontFamily: T.body, fontSize: 13, color: T.bone, lineHeight: 1.6, margin: '6px 0 0' }}>{tile.detail}</p>
        </div>

        {/* Failure / Owner / Consequence — assertive */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <div style={{ background: `${T.error}15`, border: `1px solid ${T.error}55`, borderRadius: 6, padding: 10 }}>
            <Mono color={T.error} size={9}>FAILURE MODE</Mono>
            <div style={{ fontFamily: T.body, fontSize: 11.5, color: T.bone, marginTop: 4, lineHeight: 1.4 }}>{tile.failure}</div>
          </div>
          <div style={{ background: `${T.tealBright}15`, border: `1px solid ${T.tealBright}55`, borderRadius: 6, padding: 10 }}>
            <Mono color={T.tealBright} size={9}>OWNER</Mono>
            <div style={{ fontFamily: T.body, fontSize: 11.5, color: T.bone, marginTop: 4, lineHeight: 1.4 }}>{tile.owner}</div>
          </div>
          <div style={{ background: `${T.orange}15`, border: `1px solid ${T.orange}55`, borderRadius: 6, padding: 10 }}>
            <Mono color={T.orange} size={9}>CONSEQUENCE</Mono>
            <div style={{ fontFamily: T.body, fontSize: 11.5, color: T.bone, marginTop: 4, lineHeight: 1.4 }}>{tile.consequence}</div>
          </div>
        </div>

        {/* L3 Evidence — collapsible */}
        <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 6, padding: '10px 14px' }}>
          <button
            type="button"
            onClick={() => setShowEvidence(v => !v)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 0,
            }}
          >
            <Mono color={T.tealBright} size={10}>LEVEL 3 · EVIDENCE / CITATIONS ({tile.evidence.length})</Mono>
            <ChevronDown size={14} color={T.tealBright} style={{ transform: showEvidence ? 'rotate(180deg)' : 'none', transition: 'transform 160ms' }} />
          </button>
          {showEvidence && (
            <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {tile.evidence.map((e, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontFamily: T.mono, fontSize: 11, color: T.bone, lineHeight: 1.5 }}>
                  <span style={{ color: T.tealBright, marginTop: 2 }}>▸</span>
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Liability rivet — always present */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: T.void, border: `1px dashed ${T.error}55`, borderRadius: 6 }}>
          <LiabilityRivet />
          <div style={{ fontFamily: T.body, fontSize: 12, color: T.bone, lineHeight: 1.45 }}>
            <strong style={{ color: T.error }}>Organizational liability remains 100%.</strong>
            <br />No vendor agreement reduces this number.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   TAB VIEWS
   ═════════════════════════════════════════════════════════════════ */

function BriefView({ openTile, audit }: { openTile: (t: DrillDown) => void; audit: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 2.6fr', gap: 14, height: '100%' }}>
      {/* LEFT — single hero callout */}
      <div style={{
        background: `radial-gradient(circle at 30% 20%, ${T.orange}40 0%, transparent 60%), linear-gradient(180deg, ${T.panel2} 0%, ${T.void} 100%)`,
        border: `1px solid ${T.orangeDark}`, borderRadius: 10, padding: 24,
        display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', overflow: 'hidden',
      }}>
        <Mono color={T.orangeHot} size={10}>BRAD 2.0 · OPERATIONS BRIEF</Mono>
        <div style={{ fontFamily: T.head, fontSize: 32, fontWeight: 800, color: T.bone, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
          We are responsible for compliance.
          <br /><span style={{ color: T.orangeHot }}>Architecture only changes the failure surface.</span>
        </div>
        <div style={{ fontFamily: T.body, fontSize: 13.5, color: T.fog, lineHeight: 1.6 }}>
          Every option in this dossier — self-hosted, hyperscaler, vertical SaaS, multi-vendor — leaves the organization 100% accountable for HIPAA, SOC 2, and state regulators. The only question is which surface gives us the best operational control.
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          <LiabilityRivet size="md" />
          <div>
            <Mono color={T.error}>NON-TRANSFERABLE LIABILITY</Mono>
            <div style={{ fontFamily: T.head, fontSize: 18, fontWeight: 700, color: T.bone, marginTop: 2 }}>Organization owns 100%</div>
          </div>
        </div>
      </div>

      {/* RIGHT — interactive brief tiles 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 12 }}>
        {BRIEF_TILES.map(t => <Tile key={t.id} tile={t} onOpen={() => openTile(t)} audit={audit} />)}
      </div>
    </div>
  );
}

function ThreatView({ openTile, audit }: { openTile: (t: DrillDown) => void; audit: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '0.85fr 3.15fr', gap: 14, height: '100%' }}>
      {/* LEFT — threat compass */}
      <div style={{
        background: `linear-gradient(180deg, ${T.panel2} 0%, ${T.void} 100%)`,
        border: `1px solid ${T.line}`, borderRadius: 10, padding: 18,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <Mono color={T.error}>SURFACE OVERVIEW</Mono>
        <div style={{ fontFamily: T.head, fontSize: 22, fontWeight: 800, color: T.bone, lineHeight: 1.15 }}>
          Six vectors. <span style={{ color: T.error }}>Six failure paths.</span>
        </div>
        <div style={{ fontFamily: T.body, fontSize: 12, color: T.fog, lineHeight: 1.55 }}>
          Each tile shows what fails, who owns it, and the consequence. Click any vector for full detail and citations.
        </div>
        <div style={{ marginTop: 'auto', padding: 12, background: T.panel, border: `1px solid ${T.line2}`, borderRadius: 6 }}>
          <Mono color={T.warning} size={9}>VERDICT</Mono>
          <div style={{ fontFamily: T.head, fontSize: 14, fontWeight: 700, color: T.bone, marginTop: 4, lineHeight: 1.3 }}>
            Self-host shrinks 4 of 6 vectors. SaaS expands 4 of 6.
          </div>
        </div>
      </div>

      {/* RIGHT — 6 threat tiles 3x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: '1fr 1fr', gap: 10 }}>
        {THREAT_TILES.map(t => <Tile key={t.id} tile={t} onOpen={() => openTile(t)} audit={audit} />)}
      </div>
    </div>
  );
}

function ArchView({ audit }: { audit: boolean }) {
  const [selected, setSelected] = useState<ArchProfile>(ARCHITECTURES[0]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '0.95fr 3.05fr', gap: 14, height: '100%' }}>
      {/* LEFT — selectable arch list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Mono color={T.ash}>SELECT ARCHITECTURE</Mono>
        {ARCHITECTURES.map(a => {
          const active = selected.id === a.id;
          const accent = toneColor(a.tone);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setSelected(a)}
              style={{
                textAlign: 'left', cursor: 'pointer',
                background: active ? `linear-gradient(135deg, ${accent}30 0%, ${T.panel} 100%)` : T.panel,
                border: `1px solid ${active ? accent : T.line}`,
                borderLeft: `4px solid ${accent}`,
                borderRadius: 6, padding: '10px 12px',
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'all 140ms ease',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 4, background: T.void, border: `1px solid ${accent}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: T.mono, fontWeight: 800, fontSize: 14, color: accent,
              }}>{a.code}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: T.head, fontSize: 13, fontWeight: 700, color: T.bone, lineHeight: 1.2 }}>{a.name}</div>
                <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.fog, marginTop: 2, letterSpacing: '0.05em' }}>
                  TCO {a.fiveYearTCO} · CTRL {a.controlIndex}
                </div>
              </div>
              {a.recommended && <Pill color={T.success} solid>REC</Pill>}
            </button>
          );
        })}
      </div>

      {/* RIGHT — selected arch detail */}
      <ArchDetail arch={selected} audit={audit} />
    </div>
  );
}

function ArchDetail({ arch, audit }: { arch: ArchProfile; audit: boolean }) {
  const accent = toneColor(arch.tone);
  return (
    <div style={{
      background: `linear-gradient(180deg, ${T.panel2} 0%, ${T.void} 100%)`,
      border: `1px solid ${T.line}`, borderTop: `2px solid ${accent}`,
      borderRadius: 10, padding: 18,
      display: 'grid', gridTemplateColumns: '1.5fr 1fr', gridTemplateRows: 'auto 1fr auto', gap: 14,
    }}>
      {/* Header row */}
      <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <Mono color={accent}>ARCHITECTURE · {arch.code}</Mono>
          <div style={{ fontFamily: T.head, fontSize: 26, fontWeight: 800, color: T.bone, letterSpacing: '-0.015em', marginTop: 2 }}>{arch.name}</div>
          <div style={{ fontFamily: T.body, fontSize: 13, color: T.fog, marginTop: 4 }}>{arch.oneLine}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <KpiBadge label="5-YR TCO" value={arch.fiveYearTCO} accent={accent} />
          <KpiBadge label="CTRL IDX" value={`${arch.controlIndex}/100`} accent={accent} />
          <KpiBadge label="RTO" value={arch.rto} accent={accent} />
          <LiabilityRivet />
        </div>
      </div>

      {/* Left col: pros/cons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <ProsConsList title="STRENGTHS" tone="success" items={arch.pros} />
        <ProsConsList title="WEAKNESSES" tone="error" items={arch.cons} />
      </div>

      {/* Right col: responsibility split */}
      <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 6, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Mono color={T.bone}>SHARED RESPONSIBILITY</Mono>
          <Pill color={T.error} solid>LIABILITY 100% ORG</Pill>
        </div>
        <ResponsibilityBar vendor={arch.vendorPct} org={100 - arch.vendorPct} label="Operations" />
        <ResponsibilityBar vendor={0} org={100} label="Liability" />
        <div style={{ marginTop: 4, fontFamily: T.body, fontSize: 11, color: T.fog, lineHeight: 1.5 }}>
          <span style={{ color: T.tealBright }}>■ Vendor</span> shares operational duty.
          <br /><span style={{ color: T.orangeHot }}>■ Organization</span> retains <strong style={{ color: T.error }}>100% of legal liability</strong>.
        </div>
      </div>

      {/* Bottom: failure mode strip — assertive */}
      <div style={{
        gridColumn: '1 / -1',
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
      }}>
        <FailCell icon={Skull} tone={T.error} label="FAILURE MODE" body={arch.failureMode} />
        <FailCell icon={AlertOctagon} tone={T.orange} label="CONSEQUENCE" body={arch.consequence} />
        <FailCell icon={Building2} tone={T.tealBright} label="OWNER" body={arch.owner} />
      </div>

      {audit && (
        <div style={{ gridColumn: '1 / -1', padding: '8px 12px', background: T.void, border: `1px dashed ${accent}66`, borderRadius: 6 }}>
          <Mono color={accent} size={9}>AUDIT TRAIL</Mono>
          <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fog, marginLeft: 10 }}>
            Files 02, 03, 13, 17 reference this architecture · Decision logged S6 / S10
          </span>
        </div>
      )}
    </div>
  );
}

function KpiBadge({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{
      padding: '6px 10px', borderRadius: 4,
      background: T.void, border: `1px solid ${accent}55`,
      minWidth: 72, textAlign: 'center',
    }}>
      <Mono color={accent} size={8}>{label}</Mono>
      <div style={{ fontFamily: T.head, fontWeight: 800, fontSize: 14, color: T.bone, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function ProsConsList({ title, tone, items }: { title: string; tone: 'success' | 'error'; items: string[] }) {
  const c = tone === 'success' ? T.success : T.error;
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 6, padding: 12, height: '100%' }}>
      <Mono color={c} size={10}>{title}</Mono>
      <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((i, idx) => (
          <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontFamily: T.body, fontSize: 11.5, color: T.bone, lineHeight: 1.4 }}>
            <span style={{ color: c, marginTop: 1 }}>{tone === 'success' ? '▲' : '▼'}</span>
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FailCell({ icon: Icon, tone, label, body }: { icon: typeof Skull; tone: string; label: string; body: string }) {
  return (
    <div style={{ background: `${tone}15`, border: `1px solid ${tone}55`, borderRadius: 6, padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <Icon size={16} color={tone} style={{ marginTop: 2, flexShrink: 0 }} />
      <div>
        <Mono color={tone} size={9}>{label}</Mono>
        <div style={{ fontFamily: T.body, fontSize: 11.5, color: T.bone, marginTop: 2, lineHeight: 1.4 }}>{body}</div>
      </div>
    </div>
  );
}

function LiabilityView({ audit }: { audit: boolean }) {
  const [hover, setHover] = useState<string | null>(null);
  const active = hover ? LIABILITY_LAYERS.find(l => l.layer === hover) : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1.6fr', gap: 14, height: '100%' }}>
      {/* LEFT — interactive layer matrix */}
      <div style={{
        background: `linear-gradient(180deg, ${T.panel2} 0%, ${T.void} 100%)`,
        border: `1px solid ${T.line}`, borderRadius: 10, padding: 16,
        display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Mono color={T.orangeHot}>RESPONSIBILITY MODEL</Mono>
            <div style={{ fontFamily: T.head, fontSize: 18, fontWeight: 700, color: T.bone, marginTop: 2 }}>
              Vendor operates. <span style={{ color: T.error }}>Organization is liable.</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Legend swatch={T.tealBright} label="Vendor ops" />
            <Legend swatch={T.orangeHot} label="Org ops" />
            <Legend swatch={T.error} label="Org liability (always 100%)" />
          </div>
        </div>

        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(4, 1fr)', gap: 8, fontFamily: T.mono, fontSize: 9.5, color: T.ash, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 6px' }}>
          <div>LAYER</div>
          <div>SH</div><div>A</div><div>B</div><div>C</div>
        </div>

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {LIABILITY_LAYERS.map(row => {
            const isActive = hover === row.layer;
            return (
              <div
                key={row.layer}
                onMouseEnter={() => setHover(row.layer)}
                onMouseLeave={() => setHover(null)}
                style={{
                  display: 'grid', gridTemplateColumns: '1.4fr repeat(4, 1fr)', gap: 8,
                  alignItems: 'center', padding: '6px 6px',
                  background: isActive ? `${T.orangeHot}15` : 'transparent',
                  border: `1px solid ${isActive ? T.orangeHot + '55' : 'transparent'}`,
                  borderRadius: 4, cursor: 'pointer', transition: 'all 120ms',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: T.body, fontSize: 12, color: T.bone, fontWeight: 600 }}>
                  <Lock size={11} color={T.ash} />{row.layer}
                </div>
                <MiniSplit v={row.shVendor} o={row.shOrg} />
                <MiniSplit v={row.aVendor}  o={row.aOrg}  />
                <MiniSplit v={row.bVendor}  o={row.bOrg}  />
                <MiniSplit v={row.cVendor}  o={row.cOrg}  />
              </div>
            );
          })}
        </div>

        {audit && (
          <div style={{ marginTop: 4, padding: 10, background: T.void, border: `1px dashed ${T.tealBright}55`, borderRadius: 6 }}>
            <Mono color={T.tealBright} size={9}>AUDIT MAPPING</Mono>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.fog, marginLeft: 10 }}>
              HIPAA §164.308(b)(1) · NIST SP 800-66r2 §4.4 · SOC 2 CC1.4 · See file 03
            </span>
          </div>
        )}
      </div>

      {/* RIGHT — selected detail / liability constant */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{
          background: `radial-gradient(circle at 70% 0%, ${T.error}25 0%, transparent 60%), linear-gradient(180deg, ${T.panel2} 0%, ${T.void} 100%)`,
          border: `1px solid ${T.errorDeep}`, borderRadius: 10, padding: 18,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LiabilityRivet size="md" />
            <div>
              <Mono color={T.error}>LIABILITY CONSTANT</Mono>
              <div style={{ fontFamily: T.head, fontSize: 20, fontWeight: 800, color: T.bone, lineHeight: 1.15, marginTop: 2 }}>
                Always 100% organizational.
              </div>
            </div>
          </div>
          <div style={{ fontFamily: T.body, fontSize: 12.5, color: T.fog, lineHeight: 1.55 }}>
            Across all 9 layers and all 4 architectures, the percentage of <strong style={{ color: T.error }}>legal liability borne by the organization is 100%</strong>. Only the operational split changes. SaaS does NOT make us compliant — it changes WHERE we must enforce compliance.
          </div>
        </div>

        <div style={{ flex: 1, background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
          <Mono color={T.tealBright}>{active ? `LAYER · ${active.layer.toUpperCase()}` : 'HOVER A LAYER'}</Mono>
          {active ? (
            <>
              <div style={{ fontFamily: T.head, fontSize: 16, fontWeight: 700, color: T.bone, lineHeight: 1.25 }}>
                {active.liabilityNote}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                <ResponsibilityBar vendor={active.shVendor} org={active.shOrg} label="SH" />
                <ResponsibilityBar vendor={active.aVendor}  org={active.aOrg}  label="A" />
                <ResponsibilityBar vendor={active.bVendor}  org={active.bOrg}  label="B" />
                <ResponsibilityBar vendor={active.cVendor}  org={active.cOrg}  label="C" />
              </div>
            </>
          ) : (
            <div style={{ fontFamily: T.body, fontSize: 12, color: T.fog, lineHeight: 1.55 }}>
              Hover any control layer in the matrix to see its responsibility split across all four architectures and the liability rule that governs it.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniSplit({ v, o }: { v: number; o: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 12, position: 'relative', borderRadius: 2, overflow: 'hidden', background: T.void, border: `1px solid ${T.line2}` }}>
        <div style={{ position: 'absolute', inset: 0, left: 0, width: `${v}%`, background: T.tealBright }} />
        <div style={{ position: 'absolute', inset: 0, left: `${v}%`, width: `${o}%`, background: T.orangeHot }} />
      </div>
      <span style={{ fontFamily: T.mono, fontSize: 9.5, color: T.fog, minWidth: 46, textAlign: 'right' }}>
        <span style={{ color: T.tealBright }}>{v}</span>/<span style={{ color: T.orangeHot }}>{o}</span>
      </span>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: T.mono, fontSize: 9, color: T.fog, letterSpacing: '0.08em' }}>
      <span style={{ width: 10, height: 10, background: swatch, borderRadius: 2, display: 'inline-block' }} />{label}
    </span>
  );
}

function CostView({ audit }: { audit: boolean }) {
  const [scenarioId, setScenarioId] = useState(COST_SCENARIOS[0].id);
  const sc = COST_SCENARIOS.find(s => s.id === scenarioId)!;
  const max = Math.max(sc.sh, sc.a, sc.b, sc.c);

  const arches: { key: 'sh' | 'a' | 'b' | 'c'; name: string; tone: ArchProfile['tone'] }[] = [
    { key: 'sh', name: 'Self-Hosted',     tone: 'teal' },
    { key: 'a',  name: 'Hyperscaler PaaS', tone: 'warning' },
    { key: 'b',  name: 'Vertical SaaS',    tone: 'orange' },
    { key: 'c',  name: 'Multi-SaaS',       tone: 'error' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 14, height: '100%' }}>
      {/* LEFT — scenario selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Mono color={T.ash}>SCENARIO TOGGLES</Mono>
        {COST_SCENARIOS.map(s => {
          const active = s.id === scenarioId;
          return (
            <button
              key={s.id} type="button" onClick={() => setScenarioId(s.id)}
              style={{
                textAlign: 'left', cursor: 'pointer',
                background: active ? `linear-gradient(135deg, ${T.orange}30 0%, ${T.panel} 100%)` : T.panel,
                border: `1px solid ${active ? T.orange : T.line}`,
                borderLeft: `4px solid ${active ? T.orangeHot : T.line2}`,
                borderRadius: 6, padding: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Mono color={active ? T.orangeHot : T.fog}>{s.label}</Mono>
                {active && <Pill color={T.orangeHot} solid>ACTIVE</Pill>}
              </div>
              <div style={{ fontFamily: T.body, fontSize: 11.5, color: T.bone, marginTop: 4, lineHeight: 1.4 }}>{s.desc}</div>
            </button>
          );
        })}
        <div style={{ marginTop: 'auto', padding: 12, background: T.void, border: `1px dashed ${T.warning}55`, borderRadius: 6 }}>
          <Mono color={T.warning} size={9}>HIDDEN COST NOTE</Mono>
          <div style={{ fontFamily: T.body, fontSize: 11.5, color: T.bone, marginTop: 4, lineHeight: 1.4 }}>{sc.hidden}</div>
        </div>
      </div>

      {/* RIGHT — chart */}
      <div style={{
        background: `linear-gradient(180deg, ${T.panel2} 0%, ${T.void} 100%)`,
        border: `1px solid ${T.line}`, borderRadius: 10, padding: 18,
        display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <Mono color={T.orangeHot}>5-YR TCO · {sc.label.toUpperCase()}</Mono>
            <div style={{ fontFamily: T.head, fontSize: 22, fontWeight: 800, color: T.bone, marginTop: 2 }}>{sc.desc}</div>
          </div>
          <Pill color={T.tealBright}>UNITS · USD MILLIONS</Pill>
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'flex-end', padding: '0 8px' }}>
          {arches.map(a => {
            const v = sc[a.key];
            const pct = (v / max) * 100;
            const accent = toneColor(a.tone);
            const isRecommended = a.key === 'sh';
            return (
              <div key={a.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontFamily: T.head, fontSize: 20, fontWeight: 800, color: T.bone }}>${v.toFixed(2)}M</div>
                <div style={{
                  width: '100%', height: `${pct}%`, minHeight: 8,
                  background: `linear-gradient(180deg, ${accent} 0%, ${accent}40 100%)`,
                  borderRadius: '4px 4px 0 0',
                  borderTop: `2px solid ${accent}`,
                  position: 'relative',
                  boxShadow: isRecommended ? `0 0 24px ${accent}66` : 'none',
                }}>
                  {isRecommended && (
                    <div style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)' }}>
                      <Pill color={T.success} solid>RECOMMENDED</Pill>
                    </div>
                  )}
                </div>
                <div style={{ fontFamily: T.head, fontWeight: 700, fontSize: 13, color: T.bone, textAlign: 'center' }}>{a.name}</div>
                <Mono color={T.fog} size={9}>{a.key.toUpperCase()}</Mono>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, paddingTop: 10, borderTop: `1px solid ${T.line2}` }}>
          <FailCell icon={DollarSign} tone={T.warning} label="HIDDEN COST DRIVER" body="Egress, integration glue, vendor lock-in exit costs compound after year 3." />
          <FailCell icon={AlertOctagon} tone={T.error} label="BREACH OFFSET" body="One average breach event adds $1.8M–$3M regardless of architecture." />
          <FailCell icon={Building2} tone={T.tealBright} label="WHO SIGNS THE CHECK" body="Org pays vendor invoices AND breach costs. Vendor pays neither for you." />
        </div>

        {audit && (
          <div style={{ padding: 8, background: T.void, border: `1px dashed ${T.tealBright}55`, borderRadius: 6 }}>
            <Mono color={T.tealBright} size={9}>AUDIT MAPPING</Mono>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.fog, marginLeft: 10 }}>
              File 14 · Cost Analysis · 5-yr TCO with hidden costs and breach event modeling
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function RoadmapView({ audit }: { audit: boolean }) {
  const [selected, setSelected] = useState<SprintRow>(ROADMAP[3]);
  const statusColor = (s: SprintRow['status']) =>
    s === 'done' ? T.success : s === 'active' ? T.orangeHot : s === 'next' ? T.warning : T.ash;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 2.4fr', gap: 14, height: '100%' }}>
      {/* LEFT — sprint timeline */}
      <div style={{
        background: `linear-gradient(180deg, ${T.panel2} 0%, ${T.void} 100%)`,
        border: `1px solid ${T.line}`, borderRadius: 10, padding: 16,
        display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Mono color={T.tealBright}>SPRINT TRACK · S1–S10</Mono>
          <div style={{ display: 'flex', gap: 8 }}>
            <Legend swatch={T.success} label="done" />
            <Legend swatch={T.orangeHot} label="active" />
            <Legend swatch={T.warning} label="next" />
            <Legend swatch={T.ash} label="queued" />
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden' }}>
          {ROADMAP.map(r => {
            const active = selected.id === r.id;
            return (
              <button
                key={r.id} type="button" onClick={() => setSelected(r)}
                style={{
                  textAlign: 'left', cursor: 'pointer',
                  background: active ? `${T.orange}20` : T.panel,
                  border: `1px solid ${active ? T.orange : T.line}`,
                  borderRadius: 5, padding: '8px 10px',
                  display: 'grid', gridTemplateColumns: '38px 1fr 110px 14px', gap: 10, alignItems: 'center',
                }}
              >
                <div style={{
                  fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: statusColor(r.status),
                  background: T.void, border: `1px solid ${statusColor(r.status)}55`, borderRadius: 3,
                  padding: '2px 0', textAlign: 'center', letterSpacing: '0.05em',
                }}>{r.sprint}</div>
                <div style={{ fontFamily: T.body, fontSize: 12, color: T.bone, fontWeight: 600, lineHeight: 1.3 }}>{r.epic}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor(r.status), boxShadow: `0 0 8px ${statusColor(r.status)}` }} />
                  <Mono color={statusColor(r.status)} size={9}>{r.status}</Mono>
                </div>
                <ChevronRight size={12} color={active ? T.orangeHot : T.ash} />
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT — selected sprint detail */}
      <div style={{
        background: `radial-gradient(circle at 70% 0%, ${T.orange}20 0%, transparent 60%), linear-gradient(180deg, ${T.panel2} 0%, ${T.void} 100%)`,
        border: `1px solid ${T.line}`, borderRadius: 10, padding: 18,
        display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
          <div>
            <Mono color={statusColor(selected.status)}>{selected.sprint} · {selected.status.toUpperCase()}</Mono>
            <div style={{ fontFamily: T.head, fontSize: 22, fontWeight: 800, color: T.bone, marginTop: 4, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{selected.epic}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <Building2 size={12} color={T.tealBright} />
              <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.tealBright }}>OWNER · {selected.owner}</span>
            </div>
          </div>
          <Pill color={statusColor(selected.status)} solid>{selected.status}</Pill>
        </div>

        <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 6, padding: 14 }}>
          <Mono color={T.ash} size={9}>WORK PERFORMED</Mono>
          <p style={{ fontFamily: T.body, fontSize: 13, color: T.bone, lineHeight: 1.6, margin: '6px 0 0' }}>{selected.detail}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <FailCell icon={Skull} tone={T.error} label="FAILURE MODE" body={selected.failure} />
          <FailCell icon={AlertOctagon} tone={T.orange} label="CONSEQUENCE" body={selected.consequence} />
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: T.void, border: `1px dashed ${T.error}55`, borderRadius: 6 }}>
          <LiabilityRivet />
          <div style={{ fontFamily: T.body, fontSize: 12, color: T.bone, lineHeight: 1.45 }}>
            <strong style={{ color: T.error }}>Compliance does not pause for sprints.</strong>
            <br />Each sprint adds capability; none transfers liability.
          </div>
        </div>

        {audit && (
          <div style={{ padding: 8, background: T.void, border: `1px dashed ${T.tealBright}55`, borderRadius: 6 }}>
            <Mono color={T.tealBright} size={9}>AUDIT MAPPING</Mono>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.fog, marginLeft: 10 }}>
              File 16 · Sprint Plan + Project Board · DoR/DoD per epic
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function DecisionView({ audit }: { audit: boolean }) {
  const [a, setA] = useState<ArchProfile>(ARCHITECTURES[0]);
  const [b, setB] = useState<ArchProfile>(ARCHITECTURES[2]);

  const verdict = a.controlIndex >= b.controlIndex
    ? `${a.code} retains more control. Recommend ${a.code}.`
    : `${b.code} retains more control. Recommend ${b.code}.`;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.85fr', gap: 14, height: '100%' }}>
      <ArchPicker label="OPTION A" arch={a} onChange={setA} />
      <ArchPicker label="OPTION B" arch={b} onChange={setB} />

      {/* Verdict panel */}
      <div style={{
        background: `radial-gradient(circle at 50% 0%, ${T.orange}30 0%, transparent 70%), linear-gradient(180deg, ${T.panel2} 0%, ${T.void} 100%)`,
        border: `1px solid ${T.orange}`, borderRadius: 10, padding: 18,
        display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden',
      }}>
        <div>
          <Mono color={T.orangeHot}>DECISION ENGINE</Mono>
          <div style={{ fontFamily: T.head, fontSize: 20, fontWeight: 800, color: T.bone, marginTop: 4, lineHeight: 1.2 }}>
            {verdict}
          </div>
        </div>

        <CompareRow label="5-yr TCO"      av={a.fiveYearTCO}    bv={b.fiveYearTCO}    bestA={parseFloat(a.fiveYearTCO.replace(/[$M]/g, '')) <= parseFloat(b.fiveYearTCO.replace(/[$M]/g, ''))} />
        <CompareRow label="Control Index" av={`${a.controlIndex}/100`} bv={`${b.controlIndex}/100`} bestA={a.controlIndex >= b.controlIndex} />
        <CompareRow label="Org-side Ops"  av={`${100 - a.vendorPct}%`} bv={`${100 - b.vendorPct}%`} bestA={(100 - a.vendorPct) <= (100 - b.vendorPct)} />
        <CompareRow label="Liability"     av="100%" bv="100%" bestA={null} />
        <CompareRow label="RTO"           av={a.rto} bv={b.rto} bestA={null} />

        <div style={{ marginTop: 'auto', padding: 12, background: T.void, border: `1px solid ${T.error}55`, borderRadius: 6 }}>
          <Mono color={T.error} size={10}>WHAT NEVER CHANGES</Mono>
          <div style={{ fontFamily: T.body, fontSize: 12, color: T.bone, marginTop: 4, lineHeight: 1.5 }}>
            Both options leave us <strong style={{ color: T.error }}>100% legally accountable</strong>. The choice is operational, not legal.
          </div>
        </div>

        {audit && (
          <div style={{ padding: 8, background: T.void, border: `1px dashed ${T.tealBright}55`, borderRadius: 6 }}>
            <Mono color={T.tealBright} size={9}>AUDIT MAPPING</Mono>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.fog, marginLeft: 10 }}>
              File 17 · Final Recommendation · Decision matrix by optimization goal
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function ArchPicker({ label, arch, onChange }: { label: string; arch: ArchProfile; onChange: (a: ArchProfile) => void }) {
  const accent = toneColor(arch.tone);
  return (
    <div style={{
      background: `linear-gradient(180deg, ${T.panel2} 0%, ${T.void} 100%)`,
      border: `1px solid ${T.line}`, borderTop: `2px solid ${accent}`,
      borderRadius: 10, padding: 16,
      display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Mono color={accent}>{label}</Mono>
        <select
          value={arch.id}
          onChange={(e) => {
            const next = ARCHITECTURES.find(x => x.id === e.target.value);
            if (next) onChange(next);
          }}
          style={{
            background: T.panel, color: T.bone, fontFamily: T.mono, fontSize: 11, fontWeight: 700,
            border: `1px solid ${T.line2}`, borderRadius: 4, padding: '4px 8px',
            cursor: 'pointer', letterSpacing: '0.06em',
          }}
        >
          {ARCHITECTURES.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
        </select>
      </div>

      <div>
        <div style={{ fontFamily: T.head, fontSize: 18, fontWeight: 800, color: T.bone, lineHeight: 1.2 }}>{arch.name}</div>
        <div style={{ fontFamily: T.body, fontSize: 12, color: T.fog, marginTop: 4, lineHeight: 1.5 }}>{arch.oneLine}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <ResponsibilityBar vendor={arch.vendorPct} org={100 - arch.vendorPct} label="Operations" />
        <ResponsibilityBar vendor={0} org={100} label="Liability" />
      </div>

      <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <KpiBadge label="TCO" value={arch.fiveYearTCO} accent={accent} />
        <KpiBadge label="CTRL" value={`${arch.controlIndex}`} accent={accent} />
      </div>

      <div style={{ background: `${T.error}15`, border: `1px solid ${T.error}55`, borderRadius: 6, padding: 10 }}>
        <Mono color={T.error} size={9}>FAILURE MODE</Mono>
        <div style={{ fontFamily: T.body, fontSize: 11.5, color: T.bone, marginTop: 4, lineHeight: 1.4 }}>{arch.failureMode}</div>
      </div>
    </div>
  );
}

function CompareRow({ label, av, bv, bestA }: { label: string; av: string; bv: string; bestA: boolean | null }) {
  const aColor = bestA === null ? T.bone : bestA ? T.success : T.fog;
  const bColor = bestA === null ? T.bone : !bestA ? T.success : T.fog;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', gap: 8, alignItems: 'center', padding: '6px 8px', background: T.panel, border: `1px solid ${T.line}`, borderRadius: 4 }}>
      <Mono color={T.fog} size={10}>{label}</Mono>
      <span style={{ fontFamily: T.head, fontSize: 13, fontWeight: 700, color: aColor, textAlign: 'right' }}>{av}</span>
      <span style={{ fontFamily: T.head, fontSize: 13, fontWeight: 700, color: bColor, textAlign: 'right' }}>{bv}</span>
    </div>
  );
}

function AuditView() {
  const [filter, setFilter] = useState<'all' | 'pass' | 'partial' | 'gap'>('all');
  const [selected, setSelected] = useState<ControlRow | null>(CONTROLS[2]);
  const filtered = useMemo(() => filter === 'all' ? CONTROLS : CONTROLS.filter(c => c.status === filter), [filter]);

  const pass    = CONTROLS.filter(c => c.status === 'pass').length;
  const partial = CONTROLS.filter(c => c.status === 'partial').length;
  const gap     = CONTROLS.filter(c => c.status === 'gap').length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1.6fr', gap: 14, height: '100%' }}>
      {/* LEFT — control table */}
      <div style={{
        background: `linear-gradient(180deg, ${T.panel2} 0%, ${T.void} 100%)`,
        border: `1px solid ${T.line}`, borderRadius: 10, padding: 16,
        display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Mono color={T.tealBright}>CONTROL CONSOLE · NIST 800-53 / HIPAA / SOC 2</Mono>
            <div style={{ fontFamily: T.head, fontSize: 18, fontWeight: 700, color: T.bone, marginTop: 2 }}>
              <span style={{ color: T.success }}>{pass} pass</span>
              <span style={{ color: T.ash }}> · </span>
              <span style={{ color: T.warning }}>{partial} partial</span>
              <span style={{ color: T.ash }}> · </span>
              <span style={{ color: T.error }}>{gap} gap</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['all', 'pass', 'partial', 'gap'] as const).map(f => (
              <button
                key={f} type="button" onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? T.tealBright : 'transparent',
                  color: filter === f ? T.void : T.fog,
                  border: `1px solid ${filter === f ? T.tealBright : T.line2}`,
                  borderRadius: 4, padding: '4px 10px',
                  fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', cursor: 'pointer',
                }}
              >{f}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '60px 90px 1fr 80px', gap: 8, fontFamily: T.mono, fontSize: 9.5, color: T.ash, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 8px' }}>
          <div>CTRL</div><div>FAMILY</div><div>NAME</div><div style={{ textAlign: 'right' }}>STATUS</div>
        </div>

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filtered.map(c => {
            const active = selected?.ctrl === c.ctrl;
            const sc = c.status === 'pass' ? T.success : c.status === 'partial' ? T.warning : T.error;
            return (
              <button
                key={c.ctrl} type="button" onClick={() => setSelected(c)}
                style={{
                  display: 'grid', gridTemplateColumns: '60px 90px 1fr 80px', gap: 8, alignItems: 'center',
                  textAlign: 'left', cursor: 'pointer',
                  background: active ? `${T.tealBright}15` : T.panel,
                  border: `1px solid ${active ? T.tealBright : T.line}`,
                  borderLeft: `3px solid ${sc}`,
                  borderRadius: 5, padding: '8px 10px',
                }}
              >
                <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.bone }}>{c.ctrl}</span>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.fog }}>{c.family}</span>
                <span style={{ fontFamily: T.body, fontSize: 12, color: T.bone, fontWeight: 500 }}>{c.name}</span>
                <span style={{ textAlign: 'right' }}>
                  <Pill color={sc}>{c.status}</Pill>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT — selected control */}
      <div style={{
        background: `linear-gradient(180deg, ${T.panel2} 0%, ${T.void} 100%)`,
        border: `1px solid ${T.line}`, borderRadius: 10, padding: 18,
        display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden',
      }}>
        {selected ? (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <Mono color={T.tealBright}>CONTROL · {selected.ctrl}</Mono>
                <div style={{ fontFamily: T.head, fontSize: 22, fontWeight: 800, color: T.bone, marginTop: 4 }}>{selected.name}</div>
                <Mono color={T.fog} size={10}>{selected.family}</Mono>
              </div>
              <Pill color={selected.status === 'pass' ? T.success : selected.status === 'partial' ? T.warning : T.error} solid>{selected.status}</Pill>
            </div>

            <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 6, padding: 12 }}>
              <Mono color={T.ash} size={9}>FRAMEWORK MAPPING</Mono>
              <div style={{ fontFamily: T.mono, fontSize: 11.5, color: T.bone, marginTop: 4, lineHeight: 1.5 }}>{selected.mapping}</div>
            </div>

            <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 6, padding: 12 }}>
              <Mono color={T.tealBright} size={9}>EVIDENCE</Mono>
              <div style={{ fontFamily: T.body, fontSize: 12, color: T.bone, marginTop: 4, lineHeight: 1.5 }}>{selected.evidence}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <FailCell icon={Skull} tone={T.error} label="FAILURE MODE" body={selected.failureMode} />
              <FailCell icon={Building2} tone={T.tealBright} label="OWNER" body={selected.owner} />
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: T.void, border: `1px dashed ${T.error}55`, borderRadius: 6 }}>
              <LiabilityRivet />
              <div style={{ fontFamily: T.body, fontSize: 12, color: T.bone, lineHeight: 1.45 }}>
                Evidence reduces audit findings. <strong style={{ color: T.error }}>It does not reduce liability.</strong>
              </div>
            </div>
          </>
        ) : (
          <div style={{ fontFamily: T.body, fontSize: 13, color: T.fog }}>Select a control to inspect.</div>
        )}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   SHELL
   ═════════════════════════════════════════════════════════════════ */

export function BradProposalPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>('brief');
  const [drawer, setDrawer] = useState<DrillDown | null>(null);
  const [audit, setAudit] = useState(false);

  const activeTab = TABS.find(t => t.id === tab)!;

  const renderTab = () => {
    switch (tab) {
      case 'brief':     return <BriefView openTile={setDrawer} audit={audit} />;
      case 'threat':    return <ThreatView openTile={setDrawer} audit={audit} />;
      case 'arch':      return <ArchView audit={audit} />;
      case 'liability': return <LiabilityView audit={audit} />;
      case 'cost':      return <CostView audit={audit} />;
      case 'roadmap':   return <RoadmapView audit={audit} />;
      case 'decision':  return <DecisionView audit={audit} />;
      case 'audit':     return <AuditView />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, overflow: 'hidden',
        background: `
          radial-gradient(circle at 12% 0%, ${T.orange}22 0%, transparent 35%),
          radial-gradient(circle at 88% 100%, ${T.teal}1F 0%, transparent 35%),
          linear-gradient(180deg, ${T.void} 0%, #050403 100%)
        `,
        fontFamily: T.body, color: T.bone,
        display: 'grid', gridTemplateRows: '60px 44px 1fr 38px',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideIn { from { transform: translateX(40px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
        @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 ${T.error}66 } 50% { box-shadow: 0 0 0 8px ${T.error}00 } }
      `}</style>

      {/* TOP HEADER */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
        background: `linear-gradient(180deg, ${T.panel2} 0%, ${T.panel} 100%)`,
        borderBottom: `1px solid ${T.line2}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button" onClick={() => navigate('/iadministrator')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'transparent', border: `1px solid ${T.line2}`,
              color: T.fog, padding: '6px 10px', borderRadius: 4, cursor: 'pointer',
              fontFamily: T.mono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700,
            }}
          >
            <ArrowLeft size={12} /> Return
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 6,
              background: `linear-gradient(135deg, ${T.orange} 0%, ${T.orangeDark} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 12px ${T.orange}88`,
            }}>
              <Cpu size={16} color={T.bone} />
            </div>
            <div>
              <div style={{ fontFamily: T.head, fontSize: 14, fontWeight: 800, color: T.bone, letterSpacing: '-0.01em', lineHeight: 1 }}>BRAD 2.0 · DECISION SYSTEM</div>
              <Mono color={T.orangeHot} size={9}>{activeTab.code} · {activeTab.label.toUpperCase()}</Mono>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* LIVE LIABILITY INDICATOR */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', background: T.void, border: `1px solid ${T.error}55`, borderRadius: 6,
            animation: 'pulse 2.4s infinite',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.error, boxShadow: `0 0 8px ${T.error}` }} />
            <Mono color={T.error} size={9}>ORG LIABILITY</Mono>
            <span style={{ fontFamily: T.head, fontSize: 14, fontWeight: 800, color: T.bone, letterSpacing: '-0.01em' }}>100%</span>
          </div>

          {/* AUDIT MODE TOGGLE */}
          <button
            type="button" onClick={() => setAudit(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
              background: audit ? T.tealBright : 'transparent',
              color: audit ? T.void : T.fog,
              border: `1px solid ${audit ? T.tealBright : T.line2}`,
              fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
            }}
          >
            {audit ? <Eye size={12} /> : <EyeOff size={12} />}
            Audit Mode {audit ? 'ON' : 'OFF'}
          </button>
        </div>
      </header>

      {/* TAB BAR */}
      <nav style={{
        display: 'flex', alignItems: 'stretch',
        background: T.panel,
        borderBottom: `1px solid ${T.line2}`,
        padding: '0 12px',
        overflowX: 'auto',
      }}>
        {TABS.map(t => {
          const active = t.id === tab;
          const Icon = t.icon;
          return (
            <button
              key={t.id} type="button" onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '0 16px', cursor: 'pointer',
                background: active ? `linear-gradient(180deg, transparent 0%, ${T.orange}25 100%)` : 'transparent',
                border: 'none',
                borderBottom: `2px solid ${active ? T.orangeHot : 'transparent'}`,
                color: active ? T.bone : T.fog,
                fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                transition: 'all 140ms ease',
              }}
            >
              <Icon size={13} color={active ? T.orangeHot : T.ash} />
              <span style={{ color: active ? T.orangeHot : T.ash, fontWeight: 800 }}>{t.code}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>

      {/* WORKSPACE */}
      <main style={{ position: 'relative', overflow: 'hidden', padding: 14 }}>
        {renderTab()}
        <Drawer tile={drawer} onClose={() => setDrawer(null)} />
      </main>

      {/* BOTTOM RESPONSIBILITY BAR — always present */}
      <footer style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 14,
        padding: '0 20px',
        background: `linear-gradient(180deg, ${T.panel} 0%, ${T.void} 100%)`,
        borderTop: `1px solid ${T.line2}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={12} color={T.tealBright} />
          <Mono color={T.tealBright} size={9}>SYSTEM STATEMENT</Mono>
        </div>
        <div style={{ fontFamily: T.head, fontSize: 12, fontWeight: 700, color: T.bone, letterSpacing: '0.02em', textAlign: 'center' }}>
          We are <span style={{ color: T.error }}>fully responsible for compliance</span> regardless of architecture.
          <span style={{ color: T.ash }}> · </span>
          SaaS does <span style={{ color: T.error }}>not</span> make us compliant.
          <span style={{ color: T.ash }}> · </span>
          The vendor operates. The organization answers.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
          <Mono color={T.fog} size={9}>SOURCES · FILES 01–17</Mono>
          <Server size={12} color={T.fog} />
        </div>
      </footer>
    </div>
  );
}

export default BradProposalPage;
