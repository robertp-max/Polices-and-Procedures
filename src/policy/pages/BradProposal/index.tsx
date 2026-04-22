import { useState, useMemo, useEffect, type ReactNode, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, ArrowLeft, Cpu, DollarSign, Map as MapIcon, Gavel, FileSearch,
  ChevronRight, Radio, Lock, Eye, EyeOff, Skull, Building2,
  Crosshair, AlertOctagon, ChevronDown, Layers, Activity, Server, ShieldCheck,
  TrendingDown, TrendingUp, CheckCircle2, AlertCircle, Clock, Zap,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════
   CI BRAND TOKEN SYSTEM — light · expensive · flat · cohesive
   Ref: WORKFLOW_LIBRARY_ARCHITECTURE.md §7 — UI/UX Design System
═══════════════════════════════════════════════════════════════════════ */
const C = {
  vp:       '#F2F2F0',   // viewport background (outside card)
  s0:       '#FFFFFF',   // surface — card interior
  s1:       '#FAFBF8',   // soft surface — alt row, subdued panel
  si:       '#F7FEFF',   // info tint — hover row, selected
  sw:       '#FFFAF7',   // warn tint — attention panel
  teal:     '#007970',   // brand primary — active, ok, link
  tealDeep: '#004142',   // emphasis teal
  tealTint: '#E5FEFF',   // teal pill/tag background
  orange:   '#C74600',   // action — CTA, required, critical, overdue
  orangeTp: '#A83B00',   // orange hover
  orangeTint:'#FFFAF7',  // orange panel bg
  b0:       '#E5E4E3',   // border rest
  b1:       '#C8C6C5',   // border strong
  t0:       '#1F1C1B',   // text primary
  t1:       '#524D4B',   // text secondary
  t2:       '#747470',   // text meta
  ok:       '#007970',   // complete / compliant (teal = ok)
  risk:     '#C74600',   // overdue / critical (orange = risk)
  warn:     '#D97706',   // at-risk / warning (amber)
  H: "'Montserrat', system-ui, sans-serif",
  B: "'Roboto', system-ui, sans-serif",
} as const;

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATION SYSTEM — 777+ instances across the component tree
   Principles: subtle, purposeful, 120–300ms, cubic-bezier(0.16,1,0.3,1)
═══════════════════════════════════════════════════════════════════════ */

/** Rise entrance: opacity 0→1, translateY 6px→0. Apply to every meaningful element. */
const rise = (delay = 0, dur = 280): CSSProperties => ({
  animation: `bradRise ${dur}ms cubic-bezier(0.16, 1, 0.3, 1) both`,
  animationDelay: `${delay}ms`,
});

/** Bar fill from scaleX(0)→scaleX(1). Apply to fill bars. */
const barAnim = (delay = 0, dur = 700): CSSProperties => ({
  animation: `bradBarFill ${dur}ms cubic-bezier(0.16, 1, 0.3, 1) both`,
  animationDelay: `${delay}ms`,
  transformOrigin: 'left center',
});

/** Smooth numeric counter: 0 → target */
function useCountUp(target: number, startDelay = 250, duration = 1000) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const id = setTimeout(() => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setN(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, startDelay);
    return () => clearTimeout(id);
  }, [target, startDelay, duration]);
  return n;
}

/* ═══════════════════════════════════════════════════════════════════════
   DATA MODEL (unchanged from original)
═══════════════════════════════════════════════════════════════════════ */
type TabId = 'brief' | 'threat' | 'arch' | 'liability' | 'cost' | 'roadmap' | 'decision' | 'audit';
interface Tab { id: TabId; code: string; label: string; icon: typeof ShieldCheck }
const TABS: Tab[] = [
  { id: 'brief',     code: 'BRF', label: 'Mission Brief',    icon: Radio       },
  { id: 'threat',    code: 'THR', label: 'Threat Surface',   icon: Crosshair   },
  { id: 'arch',      code: 'ARC', label: 'Architectures',    icon: Layers      },
  { id: 'liability', code: 'LIA', label: 'Responsibility',   icon: Gavel       },
  { id: 'cost',      code: 'FIN', label: 'Cost Behavior',    icon: DollarSign  },
  { id: 'roadmap',   code: 'OPS', label: 'Roadmap',          icon: MapIcon     },
  { id: 'decision',  code: 'DEC', label: 'Decision Engine',  icon: Cpu         },
  { id: 'audit',     code: 'AUD', label: 'Audit Console',    icon: FileSearch  },
];

interface DrillDown {
  id: string; eyebrow: string; title: string; summary: string; detail: string;
  evidence: string[]; failure: string; owner: string; consequence: string;
  severity: 'critical' | 'high' | 'medium' | 'info';
  tone?: 'orange' | 'teal' | 'warning' | 'error' | 'success';
}

const BRIEF_TILES: DrillDown[] = [
  {
    id: 'brf-1', eyebrow: 'CORE THESIS', title: 'Architecture Cannot Transfer Liability',
    summary: 'Every architecture leaves the organization fully accountable.',
    detail: 'There is no SaaS, BAA, certification, or vendor agreement that removes the organization\'s legal duty to protect PHI. The architecture only changes WHERE failures originate — not WHO answers for them. OCR, state regulators, and plaintiffs name the covered entity, not the vendor.',
    evidence: ['HIPAA §164.308(b)(1) — covered entity retains accountability', 'HHS OCR enforcement actions 2019–2025 — 87% name covered entity primarily', 'State AG actions follow the data, not the platform'],
    failure: 'Leadership assumes vendor BAA = compliance.', owner: 'CEO + Compliance Officer',
    consequence: 'Settlement, CAP, brand collapse, possible exclusion from federal programs.',
    severity: 'critical', tone: 'orange',
  },
  {
    id: 'brf-2', eyebrow: 'PRIMARY RECOMMENDATION', title: 'Self-Hosted on Hardened Linux',
    summary: 'Single source of truth for PHI. Vendor adjacencies isolated.',
    detail: 'Operate the policy and PHI core on self-hosted Linux with full audit, key custody, and offline failover. Permitted SaaS adjacencies live in a non-PHI zone with strict egress filtering.',
    evidence: ['Files 01–10 — hardened blueprint, threat model, 100-pass simulation', 'File 17 — final recommendation with conditions'],
    failure: 'Treating self-host as "set and forget."', owner: 'Platform Engineering Lead',
    consequence: 'Drift erodes the control plane within 18 months.',
    severity: 'high', tone: 'teal',
  },
  {
    id: 'brf-3', eyebrow: 'NON-NEGOTIABLES', title: 'Five Floors That Cannot Be Crossed',
    summary: 'Identity, encryption, audit, key custody, egress — all org-owned.',
    detail: 'Five controls must remain inside organizational custody regardless of architecture: workforce identity, key management, immutable audit, network egress policy, and incident response authority. Any vendor that requires giving these up is disqualified.',
    evidence: ['NIST SP 800-66r2 §4.4 — control retention', 'SOC 2 CC6.x — logical access controls'],
    failure: 'Vendor sells "managed identity" and we accept.', owner: 'CISO',
    consequence: 'We lose forensic ground truth and key recovery.',
    severity: 'critical', tone: 'orange',
  },
  {
    id: 'brf-4', eyebrow: 'OUTCOME', title: '100/100 Breach Simulation Pass',
    summary: 'Hardened blueprint survived 100 consecutive red-team passes.',
    detail: 'The 100-pass simulation (file 06) executed deterministic threat scenarios across phishing, lateral movement, supply chain, insider, and ransomware vectors. Final manifest (file 08) closed all gaps observed.',
    evidence: ['File 06 — Breach Simulation 100-Pass log', 'File 09 — Penetration test report'],
    failure: 'Skipping continuous re-validation.', owner: 'Security Engineering',
    consequence: 'Score becomes a snapshot. Threat landscape moves on.',
    severity: 'medium', tone: 'success',
  },
];

const THREAT_TILES: DrillDown[] = [
  {
    id: 'thr-1', eyebrow: 'VECTOR 01', title: 'Vendor Compromise Spillover',
    summary: 'Upstream vendor breach reaches our PHI through trusted integration.',
    detail: 'A SaaS vendor with valid BAA is breached. Their incident timeline is opaque. Our PHI flows are caught in their blast radius. We must notify under HIPAA §164.404 — within 60 days from THEIR discovery, which we may not learn for weeks.',
    evidence: ['Change Healthcare 2024 — 100M records, downstream notifications still ongoing', 'OCR breach portal — 38% of 2023–2024 breaches involved business associates'],
    failure: 'No contractual requirement for vendor breach notification < 24h.', owner: 'Vendor Risk Manager',
    consequence: 'We breach notification timelines. Regulators see negligence, not bad luck.',
    severity: 'critical', tone: 'error',
  },
  {
    id: 'thr-2', eyebrow: 'VECTOR 02', title: 'Misconfiguration in Shared Responsibility',
    summary: 'Vendor secures the infra. WE misconfigure the tenant.',
    detail: 'Every major cloud breach root-causes to customer-side misconfiguration: open buckets, over-permissive IAM, disabled logging, default keys. The vendor\'s SOC 2 does not cover OUR configuration.',
    evidence: ['Verizon DBIR 2024 — 82% of cloud breaches = misconfig', 'AWS Shared Responsibility Model — customer owns IAM, data, network rules'],
    failure: 'Treating SOC 2 report as our compliance.', owner: 'Cloud Engineering',
    consequence: 'Full organizational liability with no vendor offset.',
    severity: 'critical', tone: 'orange',
  },
  {
    id: 'thr-3', eyebrow: 'VECTOR 03', title: 'Derived & De-identified Data Use',
    summary: 'Default vendor terms permit training and analytics on derived data.',
    detail: 'Many SaaS BAAs reserve the right to use de-identified or aggregated data. Once data leaves your tenant — even "de-identified" — re-identification risk and downstream model contamination become impossible to audit.',
    evidence: ['OpenAI / Anthropic enterprise terms — opt-out required, not default', 'NIST SP 800-188 — de-identification ≠ anonymization'],
    failure: 'Procurement signs default master terms.', owner: 'Legal + Procurement',
    consequence: 'PHI derivatives become training data. Permanent.',
    severity: 'high', tone: 'warning',
  },
  {
    id: 'thr-4', eyebrow: 'VECTOR 04', title: 'Insider via Privileged SaaS Console',
    summary: 'A vendor admin can read your data. Their controls are not yours.',
    detail: 'Vendor support engineers with break-glass access can — and historically have — accessed customer tenants. You see only what their audit chooses to expose. Your DLP cannot see their console.',
    evidence: ['Microsoft 2024 Midnight Blizzard — internal mailbox access via legacy auth', 'Okta 2023 — support case file exposure'],
    failure: 'No customer-side BYOK + key revocation drill.', owner: 'CISO',
    consequence: 'Forensic ground truth lives on vendor systems. You ask permission.',
    severity: 'high', tone: 'error',
  },
  {
    id: 'thr-5', eyebrow: 'VECTOR 05', title: 'Service Outage During Incident',
    summary: 'When SaaS goes down, your IR runbook goes with it.',
    detail: 'If SIEM, ticketing, identity, and chat all live in SaaS, a regional cloud event cripples your response. You cannot investigate a breach using systems that are themselves degraded.',
    evidence: ['CrowdStrike outage July 2024 — 8.5M endpoints down', 'AWS us-east-1 outages — 2021, 2023, 2025'],
    failure: 'No offline IR pack. No paper runbook. No out-of-band comms.', owner: 'Incident Response Lead',
    consequence: 'RTO breaches. Regulators see chaos in the timeline.',
    severity: 'high', tone: 'warning',
  },
  {
    id: 'thr-6', eyebrow: 'VECTOR 06', title: 'Model & Prompt Injection',
    summary: 'LLM tools become attack surface for PHI exfiltration.',
    detail: 'Any AI assistant that touches PHI — vendor or self-hosted — opens prompt injection, jailbreak, and data exfiltration paths. Vendor "guardrails" are opaque. Our content policy must be enforced at OUR boundary.',
    evidence: ['OWASP LLM Top 10 — LLM01 Prompt Injection, LLM06 Sensitive Info Disclosure', 'File 04 — threat model AI surface'],
    failure: 'Trusting vendor safety filters as the only line.', owner: 'AI Platform Engineer',
    consequence: 'Single crafted prompt can exfiltrate PHI through a "safe" tool.',
    severity: 'high', tone: 'error',
  },
];

interface ArchProfile {
  id: 'sh' | 'a' | 'b' | 'c'; code: string; name: string; oneLine: string;
  fiveYearTCO: string; controlIndex: number; vendorPct: number;
  liabilityPct: 100; rto: string; blastRadius: string;
  recommended: boolean; tone: 'teal' | 'orange' | 'warning' | 'error';
  pros: string[]; cons: string[]; failureMode: string; consequence: string; owner: string;
}
const ARCHITECTURES: ArchProfile[] = [
  {
    id: 'sh', code: 'SH', name: 'Self-Hosted Hardened Linux',
    oneLine: 'Single source of truth. Org owns every floor.',
    fiveYearTCO: '$1.35M', controlIndex: 96, vendorPct: 12, liabilityPct: 100,
    rto: '< 4h', blastRadius: 'Org-only', recommended: true, tone: 'teal',
    pros: ['Full key custody (BYOK + HSM)', 'Immutable on-prem audit chain', 'Offline IR pack; no SaaS dependency', 'No vendor-side data use clauses', 'Deny-by-default egress enforced'],
    cons: ['Requires platform engineering staffing', 'Patch and drift discipline non-negotiable', 'Hardware refresh on 5-yr cycle'],
    failureMode: 'Skipped patch cycles — known-CVE drift.',
    consequence: 'Ransomware via unpatched kernel. Self-host failed because operations failed.',
    owner: 'Platform Engineering Lead',
  },
  {
    id: 'a', code: 'A', name: 'Hyperscaler PaaS + BAA',
    oneLine: 'Vendor runs infra. You run identity, keys, configs.',
    fiveYearTCO: '$5.5M', controlIndex: 78, vendorPct: 55, liabilityPct: 100,
    rto: '< 1h', blastRadius: 'Hyperscaler region', recommended: false, tone: 'warning',
    pros: ['Elastic scale; managed patching at infra layer', 'Mature compliance attestations (SOC 2, HITRUST)', 'Faster provisioning of new workloads'],
    cons: ['Customer-side IAM and config = breach root cause', 'Egress costs scale with usage', 'Region-wide outages cripple IR'],
    failureMode: 'IAM misconfiguration on a Friday push.',
    consequence: 'Public S3-style exposure of PHI. Vendor SOC 2 does not cover you.',
    owner: 'Cloud Engineering Lead',
  },
  {
    id: 'b', code: 'B', name: 'Healthcare-Vertical SaaS',
    oneLine: 'Pre-built workflows. Vendor owns operations.',
    fiveYearTCO: '$4.8M', controlIndex: 62, vendorPct: 78, liabilityPct: 100,
    rto: 'Vendor SLA', blastRadius: 'All vendor tenants', recommended: false, tone: 'orange',
    pros: ['Fastest go-live for COTS workflows', 'Pre-built HIPAA workflows and forms', 'Vendor-managed updates'],
    cons: ['Multi-tenant noisy-neighbor risk', 'Limited audit visibility (their logs, their schema)', 'Vendor lock-in; export friction at end-of-life'],
    failureMode: 'Vendor breach. We learn weeks late.',
    consequence: 'Breach notification clock starts late. Regulators see negligence.',
    owner: 'Vendor Risk Manager + CISO',
  },
  {
    id: 'c', code: 'C', name: 'Multi-SaaS Best-of-Breed',
    oneLine: 'Stitched stack. Most surface area. Most contracts.',
    fiveYearTCO: '$7.4M', controlIndex: 41, vendorPct: 88, liabilityPct: 100,
    rto: 'Variable', blastRadius: 'N vendor tenants', recommended: false, tone: 'error',
    pros: ['Best-in-class per function (in theory)', 'Independent vendor failure isolation per workload'],
    cons: ['N vendors = N BAAs, N audits, N breach surfaces', 'Integration glue becomes its own attack surface', 'No single throat to choke during incident', 'Identity sprawl; SSO becomes the keystone risk', 'Highest 5-yr TCO'],
    failureMode: 'SSO/IdP compromise cascades across all vendors.',
    consequence: 'One credential = total ecosystem breach.',
    owner: 'CISO + Vendor Risk Manager',
  },
];

interface LiabilityRow {
  layer: string;
  shVendor: number; shOrg: number;
  aVendor: number; aOrg: number;
  bVendor: number; bOrg: number;
  cVendor: number; cOrg: number;
  liabilityNote: string;
}
const LIABILITY_LAYERS: LiabilityRow[] = [
  { layer: 'Physical / DC',          shVendor: 30, shOrg: 70, aVendor: 100, aOrg: 0,  bVendor: 100, bOrg: 0,  cVendor: 100, cOrg: 0,  liabilityNote: 'Vendor operates floor; org still names parties on breach.' },
  { layer: 'Network / Egress',       shVendor: 0,  shOrg: 100, aVendor: 40, aOrg: 60, bVendor: 80,  bOrg: 20, cVendor: 60,  cOrg: 40, liabilityNote: 'Egress policy is YOUR breach surface regardless of vendor.' },
  { layer: 'Identity / IAM',         shVendor: 0,  shOrg: 100, aVendor: 20, aOrg: 80, bVendor: 50,  bOrg: 50, cVendor: 30,  cOrg: 70, liabilityNote: 'Identity is the keystone. Always organizational.' },
  { layer: 'Key Management',         shVendor: 0,  shOrg: 100, aVendor: 30, aOrg: 70, bVendor: 70,  bOrg: 30, cVendor: 60,  cOrg: 40, liabilityNote: 'Loss of key custody = loss of forensic ground truth.' },
  { layer: 'Application Logic',      shVendor: 0,  shOrg: 100, aVendor: 0,  aOrg: 100, bVendor: 90, bOrg: 10, cVendor: 85,  cOrg: 15, liabilityNote: 'Bugs in vendor app still trigger YOUR breach notification.' },
  { layer: 'Audit & Logging',        shVendor: 0,  shOrg: 100, aVendor: 30, aOrg: 70, bVendor: 70,  bOrg: 30, cVendor: 65,  cOrg: 35, liabilityNote: 'You cannot prove what you do not log yourself.' },
  { layer: 'Incident Response',      shVendor: 0,  shOrg: 100, aVendor: 10, aOrg: 90, bVendor: 40,  bOrg: 60, cVendor: 25,  cOrg: 75, liabilityNote: 'Vendor will not lead YOUR notification. Ever.' },
  { layer: 'Workforce Training',     shVendor: 0,  shOrg: 100, aVendor: 0,  aOrg: 100, bVendor: 0,  bOrg: 100, cVendor: 0,  cOrg: 100, liabilityNote: 'Always 100% organizational. No exceptions.' },
  { layer: 'Regulatory Notification',shVendor: 0,  shOrg: 100, aVendor: 0,  aOrg: 100, bVendor: 0,  bOrg: 100, cVendor: 0,  cOrg: 100, liabilityNote: 'OCR names the covered entity. Period.' },
];

interface CostScenario { id: string; label: string; desc: string; sh: number; a: number; b: number; c: number; hidden: string }
const COST_SCENARIOS: CostScenario[] = [
  { id: 'base',   label: 'Baseline 5-yr',     desc: 'Stated TCO at signed terms.',                                              sh: 1.35, a: 5.5,  b: 4.8,  c: 7.4,  hidden: 'Excludes hidden costs below.' },
  { id: 'hidden', label: '+ Hidden Costs',     desc: 'Egress, integration glue, IR retainer, audit overhead, lock-in exit.',    sh: 1.65, a: 7.8,  b: 7.2,  c: 11.4, hidden: 'Vendor adds compound at year 3+.' },
  { id: 'breach', label: '+ One Breach Event', desc: 'Add expected breach cost (OCR + remediation + notification).',            sh: 3.15, a: 9.6,  b: 9.4,  c: 14.2, hidden: 'Probability rises with vendor surface area.' },
  { id: 'scale2x',label: '2x Scale',           desc: 'Patient population doubles.',                                             sh: 2.10, a: 11.4, b: 9.6,  c: 14.8, hidden: 'SaaS scales linearly; SH scales sub-linearly.' },
];

interface SprintRow { id: string; sprint: string; epic: string; owner: string; status: 'done' | 'active' | 'next' | 'queued'; detail: string; failure: string; consequence: string }
const ROADMAP: SprintRow[] = [
  { id: 'S1',  sprint: 'S1',  epic: 'Foundation: Identity, Keys, Audit',   owner: 'CISO + PE',   status: 'done',   detail: 'Stand up IdP with phishing-resistant MFA, BYOK + HSM, immutable audit chain.', failure: 'MFA bypass via legacy auth.',              consequence: 'Identity becomes single point of failure.' },
  { id: 'S2',  sprint: 'S2',  epic: 'Hardened Linux Baseline',             owner: 'PE + SE',     status: 'done',   detail: 'CIS Level 2, eBPF runtime telemetry, SELinux enforcing, signed kernels.',       failure: 'Drift from baseline within 90 days.',       consequence: 'Audit gap on next assessment.' },
  { id: 'S3',  sprint: 'S3',  epic: 'PHI Zoning + Egress Policy',          owner: 'PE + Sec',    status: 'done',   detail: 'Z-PHI, Z-NPHI, Z-PUBLIC zones with default-deny egress and DNS allow-list.',   failure: 'Allow-list rot.',                          consequence: 'Silent egress to typo-squat domain.' },
  { id: 'S4',  sprint: 'S4',  epic: 'Application Stack + RBAC',            owner: 'AE + PO',     status: 'active', detail: 'Brad shell, policy engine, role model, session classifier, audit envelope.',   failure: 'Role explosion; least-privilege erodes.',   consequence: 'Auditor-flagged over-entitlement.' },
  { id: 'S5',  sprint: 'S5',  epic: 'AI Surface Hardening',                owner: 'MLE + Sec',   status: 'active', detail: 'Prompt isolation, content policy at boundary, output filtering, jailbreak telemetry.', failure: 'Trusting vendor safety filters.',      consequence: 'PHI exfiltration via crafted prompt.' },
  { id: 'S6',  sprint: 'S6',  epic: 'Vendor Risk + Permitted Adjacencies', owner: 'VRM + Legal', status: 'next',   detail: 'Workday on Z-NPHI, BAA + 24h breach clause, derived-data prohibition.',       failure: 'Default master terms accepted.',           consequence: 'Derived PHI used in vendor training.' },
  { id: 'S7',  sprint: 'S7',  epic: '100-Pass Breach Simulation',          owner: 'Sec + QA',    status: 'next',   detail: 'Deterministic red-team: phishing, lateral, ransomware, supply chain, insider.', failure: 'Treating pass as permanent.',             consequence: 'Threat landscape moves; defenses do not.' },
  { id: 'S8',  sprint: 'S8',  epic: 'Penetration Test + Remediation',      owner: 'Sec + PE',    status: 'queued', detail: 'Third-party pen test; remediate to zero criticals before go-live.',             failure: 'Accepting medium findings.',               consequence: 'Mediums chain into critical paths.' },
  { id: 'S9',  sprint: 'S9',  epic: 'IR Drill + Offline Runbook',          owner: 'IR + Ops',    status: 'queued', detail: 'Tabletop + live drill; offline runbook; OOB comms; legal notification flow.',  failure: 'No offline IR pack.',                     consequence: 'IR collapses when SaaS is degraded.' },
  { id: 'S10', sprint: 'S10', epic: 'SOC 2 Type II Window Open',            owner: 'CO + Sec',    status: 'queued', detail: 'Begin 6-month observation window with full evidence pipeline.',               failure: 'Evidence not auto-collected.',             consequence: 'Manual scramble at audit time.' },
];

interface ControlRow { ctrl: string; family: string; name: string; mapping: string; evidence: string; status: 'pass' | 'partial' | 'gap'; failureMode: string; owner: string }
const CONTROLS: ControlRow[] = [
  { ctrl: 'AC-2',  family: 'Access',     name: 'Account Management',     mapping: 'HIPAA §164.308(a)(4); SOC2 CC6.1',    evidence: 'IdP audit + quarterly access review',     status: 'pass',    failureMode: 'Stale accounts.',                  owner: 'CISO'     },
  { ctrl: 'AU-2',  family: 'Audit',      name: 'Audit Events',           mapping: 'HIPAA §164.312(b); SOC2 CC7.2',        evidence: 'Immutable on-prem audit chain',           status: 'pass',    failureMode: 'Log gaps in upgrade window.',      owner: 'PE'       },
  { ctrl: 'CM-6',  family: 'Config',     name: 'Configuration Settings', mapping: 'HIPAA §164.308(a)(1); SOC2 CC8.1',     evidence: 'CIS L2 scan + drift dashboard',          status: 'partial', failureMode: 'Manual change w/o ticket.',        owner: 'PE'       },
  { ctrl: 'IA-2',  family: 'Identity',   name: 'Authentication',         mapping: 'HIPAA §164.312(d); SOC2 CC6.1',        evidence: 'Phishing-resistant MFA enforced',        status: 'pass',    failureMode: 'Legacy auth path enabled.',        owner: 'CISO'     },
  { ctrl: 'IR-4',  family: 'Incident',   name: 'Incident Handling',      mapping: 'HIPAA §164.308(a)(6); SOC2 CC7.4',     evidence: 'IR plan + tabletop logs',                status: 'partial', failureMode: 'No offline runbook.',              owner: 'IR Lead'  },
  { ctrl: 'SC-12', family: 'CryptoKey',  name: 'Key Establishment',      mapping: 'HIPAA §164.312(a)(2)(iv); CC6.7',      evidence: 'BYOK + HSM custody report',              status: 'pass',    failureMode: 'Keys held by vendor.',             owner: 'CISO'     },
  { ctrl: 'SC-7',  family: 'Boundary',   name: 'Boundary Protection',    mapping: 'HIPAA §164.312(e)(1); SOC2 CC6.6',     evidence: 'Default-deny egress + DNS allow-list',   status: 'pass',    failureMode: 'Allow-list rot.',                  owner: 'PE'       },
  { ctrl: 'CP-9',  family: 'Continuity', name: 'Information Backup',     mapping: 'HIPAA §164.308(a)(7); SOC2 A1.2',      evidence: 'Air-gapped immutable snapshots',         status: 'pass',    failureMode: 'Restore drill skipped.',           owner: 'PE'       },
  { ctrl: 'AT-2',  family: 'Awareness',  name: 'Workforce Training',     mapping: 'HIPAA §164.308(a)(5); SOC2 CC2.2',     evidence: 'Annual + role-based training records',   status: 'partial', failureMode: 'Phishing rate above 5%.',          owner: 'HSO'      },
  { ctrl: 'RA-5',  family: 'Risk',       name: 'Vulnerability Scanning', mapping: 'HIPAA §164.308(a)(1)(ii)(A); CC7.1',   evidence: 'Continuous scanning + SLA dashboard',    status: 'pass',    failureMode: 'SLAs missed quietly.',             owner: 'Sec'      },
];

/* ═══════════════════════════════════════════════════════════════════════
   TOKEN HELPERS
═══════════════════════════════════════════════════════════════════════ */
const toneColor = (t?: DrillDown['tone']): string =>
  t === 'orange' ? C.orange : t === 'teal' ? C.teal : t === 'warning' ? C.warn :
  t === 'error' ? C.risk : t === 'success' ? C.ok : C.t2;

const sevColor = (s: DrillDown['severity']): string =>
  s === 'critical' ? C.risk : s === 'high' ? C.warn : s === 'medium' ? C.warn : C.teal;

const archColor = (t: ArchProfile['tone']): string =>
  t === 'teal' ? C.teal : t === 'warning' ? C.warn : t === 'orange' ? C.orange : C.risk;

const statusColor = (s: SprintRow['status']): string =>
  s === 'done' ? C.ok : s === 'active' ? C.orange : s === 'next' ? C.warn : C.t2;

const controlColor = (s: ControlRow['status']): string =>
  s === 'pass' ? C.ok : s === 'partial' ? C.warn : C.risk;

/* ═══════════════════════════════════════════════════════════════════════
   PRIMITIVE COMPONENTS
   Each element receives rise() animation + hover transitions = 777+ total
═══════════════════════════════════════════════════════════════════════ */

/** Section label: Montserrat 11px 600 0.22em tracking UPPERCASE — signature CI move */
function Label({ children, color = C.t2, style: extra }: { children: ReactNode; color?: string; style?: CSSProperties }) {
  return (
    <span style={{
      fontFamily: C.H, fontSize: 11, fontWeight: 600, letterSpacing: '0.22em',
      textTransform: 'uppercase', color, display: 'block', lineHeight: 1,
      ...extra,
    }}>
      {children}
    </span>
  );
}

/** Category eyebrow: Montserrat 10px 600 0.16em — for card eyebrows and tags */
function Eyebrow({ children, color = C.teal }: { children: ReactNode; color?: string }) {
  return (
    <span style={{
      fontFamily: C.H, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em',
      textTransform: 'uppercase', color, lineHeight: 1,
    }}>
      {children}
    </span>
  );
}

/** Pill/tag — flat, tinted, no shadow */
function Tag({ children, color = C.teal, filled }: { children: ReactNode; color?: string; filled?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 8px', borderRadius: 4,
      fontFamily: C.B, fontSize: 11, fontWeight: 500, letterSpacing: '0.02em',
      background: filled ? color : `${color}18`,
      color: filled ? '#fff' : color,
      border: filled ? 'none' : `1px solid ${color}44`,
      whiteSpace: 'nowrap', lineHeight: 1.4,
    }}>
      {children}
    </span>
  );
}

/** KPI number — large animated counter */
function KpiStat({ value, label, color = C.t0, delay = 0 }: { value: number; label: string; color?: string; delay?: number }) {
  const count = useCountUp(value, delay + 200);
  return (
    <div style={{ ...rise(delay), textAlign: 'center' }}>
      <div style={{ fontFamily: C.H, fontSize: 36, fontWeight: 700, color, letterSpacing: '-0.01em', lineHeight: 1 }}>
        {count}
      </div>
      <Label color={C.t2} style={{ marginTop: 6, letterSpacing: '0.16em' }}>{label}</Label>
    </div>
  );
}

/** KPI badge — compact, used in arch detail header */
function KpiBadge({ label, value, color = C.teal, delay = 0 }: { label: string; value: string; color?: string; delay?: number }) {
  return (
    <div style={{
      ...rise(delay),
      padding: '8px 12px', borderRadius: 8, minWidth: 80, textAlign: 'center',
      background: C.s1, border: `1px solid ${C.b0}`,
    }}>
      <Label color={color} style={{ letterSpacing: '0.16em', marginBottom: 4 }}>{label}</Label>
      <div style={{ fontFamily: C.H, fontWeight: 700, fontSize: 15, color: C.t0, marginTop: 4 }}>{value}</div>
    </div>
  );
}

/** Animated horizontal bar — grows from left on mount */
function Bar({ value, total = 100, color = C.teal, height = 6, delay = 0 }: {
  value: number; total?: number; color?: string; height?: number; delay?: number;
}) {
  const pct = Math.min((value / total) * 100, 100);
  return (
    <div style={{ height, background: C.s1, borderRadius: height / 2, overflow: 'hidden', border: `1px solid ${C.b0}` }}>
      <div style={{
        height: '100%', width: `${pct}%`, background: color, borderRadius: height / 2,
        ...barAnim(delay),
      }} />
    </div>
  );
}

/** Dual responsibility bar: vendor (teal) + org (orange) */
function DualBar({ vendor, org, label, delay = 0 }: { vendor: number; org: number; label?: string; delay?: number }) {
  return (
    <div style={{ ...rise(delay), display: 'flex', alignItems: 'center', gap: 10 }}>
      {label && (
        <div style={{ fontFamily: C.B, fontSize: 12, color: C.t1, width: 120, flexShrink: 0 }}>{label}</div>
      )}
      <div style={{ flex: 1, height: 8, background: C.s1, borderRadius: 4, overflow: 'hidden', border: `1px solid ${C.b0}`, display: 'flex' }}>
        <div style={{ width: `${vendor}%`, background: C.teal, ...barAnim(delay + 50) }} />
        <div style={{ width: `${org}%`, background: C.orange, ...barAnim(delay + 100) }} />
      </div>
      <div style={{ fontFamily: C.B, fontSize: 11, color: C.t2, minWidth: 70, textAlign: 'right' }}>
        <span style={{ color: C.teal }}>{vendor}%</span>
        <span style={{ color: C.b1 }}> / </span>
        <span style={{ color: C.orange }}>{org}%</span>
      </div>
    </div>
  );
}

/** Liability badge — always 100% — permanent orange pill */
function LiabilityBadge({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const s = size === 'md' ? 52 : 38;
  return (
    <div style={{
      width: s, height: s, borderRadius: '50%', flexShrink: 0,
      background: C.orangeTint, border: `2px solid ${C.orange}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: C.H, fontWeight: 700, fontSize: size === 'md' ? 12 : 10,
      color: C.orange, letterSpacing: '-0.01em',
      animation: 'bradPulse 3s ease-in-out infinite',
    }}
      title="Organizational liability is always 100% — non-transferable."
    >
      100%
    </div>
  );
}

/** Failure/owner/consequence cell */
function InfoCell({ icon: Icon, label, body, color, delay = 0 }: {
  icon: typeof Skull; label: string; body: string; color: string; delay?: number;
}) {
  return (
    <div style={{
      ...rise(delay),
      background: `${color}0D`, border: `1px solid ${color}33`,
      borderRadius: 8, padding: '10px 12px',
      display: 'flex', gap: 10, alignItems: 'flex-start',
    }}>
      <Icon size={14} color={color} style={{ marginTop: 2, flexShrink: 0 }} />
      <div>
        <Eyebrow color={color}>{label}</Eyebrow>
        <div style={{ fontFamily: C.B, fontSize: 12, color: C.t0, marginTop: 4, lineHeight: 1.45 }}>{body}</div>
      </div>
    </div>
  );
}

/** Pros/cons list */
function ProsList({ title, color, items, delay = 0 }: { title: string; color: string; items: string[]; delay?: number }) {
  return (
    <div style={{ ...rise(delay), background: C.s0, border: `1px solid ${C.b0}`, borderRadius: 8, padding: 14, height: '100%' }}>
      <Label color={color} style={{ marginBottom: 10 }}>{title}</Label>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item, i) => (
          <li key={i} style={{ ...rise(delay + i * 40), display: 'flex', alignItems: 'flex-start', gap: 6, fontFamily: C.B, fontSize: 12, color: C.t1, lineHeight: 1.4 }}>
            <span style={{ color, marginTop: 1, flexShrink: 0 }}>{color === C.ok ? '▲' : '▼'}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TILE — interactive card with progressive disclosure trigger
═══════════════════════════════════════════════════════════════════════ */
function Tile({ tile, onOpen, audit, delay = 0 }: { tile: DrillDown; onOpen: () => void; audit: boolean; delay?: number }) {
  const accent = toneColor(tile.tone);
  return (
    <button
      type="button" onClick={onOpen}
      style={{
        ...rise(delay),
        textAlign: 'left', cursor: 'pointer', width: '100%',
        background: C.s0, borderRadius: 8,
        border: `1px solid ${C.b0}`, borderLeft: `3px solid ${accent}`,
        padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 8,
        transition: 'border-color 120ms ease-out, background 120ms ease-out, transform 120ms ease-out',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${accent}88`;
        e.currentTarget.style.background = C.si;
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = C.b0;
        e.currentTarget.style.background = C.s0;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Row 1: eyebrow + severity */}
      <div style={{ ...rise(delay + 40), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Eyebrow color={accent}>{tile.eyebrow}</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: sevColor(tile.severity), flexShrink: 0 }} />
          <Eyebrow color={sevColor(tile.severity)}>{tile.severity}</Eyebrow>
        </div>
      </div>
      {/* Row 2: title */}
      <div style={{ ...rise(delay + 70), fontFamily: C.H, fontSize: 14, fontWeight: 600, color: C.t0, lineHeight: 1.25 }}>
        {tile.title}
      </div>
      {/* Row 3: summary */}
      <div style={{ ...rise(delay + 100), fontFamily: C.B, fontSize: 12, color: C.t1, lineHeight: 1.5 }}>
        {tile.summary}
      </div>
      {/* Audit overlay */}
      {audit && (
        <div style={{ ...rise(delay + 130), marginTop: 2, paddingTop: 8, borderTop: `1px solid ${C.b0}`, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Skull size={10} color={C.risk} />
            <span style={{ fontFamily: C.B, fontSize: 11, color: C.risk }}>Fail: {tile.failure}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Building2 size={10} color={C.teal} />
            <span style={{ fontFamily: C.B, fontSize: 11, color: C.teal }}>Owner: {tile.owner}</span>
          </div>
        </div>
      )}
      {/* CTA row */}
      <div style={{ ...rise(delay + 130), display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
        <Eyebrow color={C.t2}>Open detail</Eyebrow>
        <ChevronRight size={13} color={accent} />
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DRAWER — right-slide detail panel
═══════════════════════════════════════════════════════════════════════ */
function Drawer({ tile, onClose }: { tile: DrillDown | null; onClose: () => void }) {
  const [showEvidence, setShowEvidence] = useState(false);
  useEffect(() => { setShowEvidence(false); }, [tile?.id]);
  if (!tile) return null;
  const accent = toneColor(tile.tone);

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        background: 'rgba(31, 28, 27, 0.22)',
        display: 'flex', justifyContent: 'flex-end',
        animation: 'bradFadeIn 160ms ease',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(520px, 90vw)', height: '100%',
          background: C.s0, borderLeft: `1px solid ${C.b0}`,
          padding: '20px 24px', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 16,
          animation: 'bradSlideRight 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div style={{ ...rise(0), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color={accent} filled>{tile.eyebrow}</Tag>
            <Tag color={sevColor(tile.severity)}>{tile.severity}</Tag>
          </div>
          <button
            type="button" onClick={onClose}
            style={{
              background: C.s0, border: `1px solid ${C.b0}`, color: C.t1,
              cursor: 'pointer', padding: 6, borderRadius: 6,
              transition: 'border-color 120ms ease-out',
              display: 'flex', alignItems: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.b0; }}
          >
            <X size={15} />
          </button>
        </div>

        {/* L1 title */}
        <div style={rise(40)}>
          <Label color={C.t2} style={{ marginBottom: 4 }}>Level 1 — Summary</Label>
          <div style={{ fontFamily: C.H, fontSize: 22, fontWeight: 700, color: C.t0, letterSpacing: '-0.01em', lineHeight: 1.2, marginTop: 4 }}>
            {tile.title}
          </div>
          <div style={{ fontFamily: C.B, fontSize: 13, color: C.t1, marginTop: 6, lineHeight: 1.55 }}>{tile.summary}</div>
        </div>

        {/* L2 detail */}
        <div style={{ ...rise(80), background: C.s1, border: `1px solid ${C.b0}`, borderRadius: 8, padding: '12px 14px' }}>
          <Label color={C.t2} style={{ marginBottom: 6 }}>Level 2 — Detail</Label>
          <p style={{ fontFamily: C.B, fontSize: 13, color: C.t0, lineHeight: 1.6, margin: 0 }}>{tile.detail}</p>
        </div>

        {/* Failure / Owner / Consequence */}
        <div style={{ ...rise(120), display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <InfoCell icon={Skull} label="Failure Mode" body={tile.failure} color={C.risk} />
          <InfoCell icon={Building2} label="Owner" body={tile.owner} color={C.teal} />
          <InfoCell icon={AlertOctagon} label="Consequence" body={tile.consequence} color={C.warn} />
        </div>

        {/* L3 evidence */}
        <div style={{ ...rise(160), background: C.s1, border: `1px solid ${C.b0}`, borderRadius: 8, padding: '10px 14px' }}>
          <button
            type="button" onClick={() => setShowEvidence(v => !v)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: 0,
              transition: 'opacity 120ms',
            }}
          >
            <Label color={C.teal} style={{ letterSpacing: '0.16em' }}>Level 3 — Evidence ({tile.evidence.length})</Label>
            <ChevronDown size={14} color={C.teal} style={{ transform: showEvidence ? 'rotate(180deg)' : 'none', transition: 'transform 160ms ease-out' }} />
          </button>
          {showEvidence && (
            <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {tile.evidence.map((ev, i) => (
                <li key={i} style={{ ...rise(i * 60), display: 'flex', alignItems: 'flex-start', gap: 8, fontFamily: C.B, fontSize: 12, color: C.t0, lineHeight: 1.5 }}>
                  <ChevronRight size={12} color={C.teal} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Liability constant */}
        <div style={{ ...rise(200), marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: C.sw, border: `1px solid ${C.orange}33`, borderRadius: 8 }}>
          <LiabilityBadge />
          <div style={{ fontFamily: C.B, fontSize: 12, color: C.t0, lineHeight: 1.45 }}>
            <strong style={{ color: C.orange }}>Organizational liability remains 100%.</strong>
            <br />No vendor agreement reduces this number.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TAB VIEWS
═══════════════════════════════════════════════════════════════════════ */

function BriefView({ openTile, audit }: { openTile: (t: DrillDown) => void; audit: boolean }) {
  const passes = useCountUp(100, 300);
  const iterations = useCountUp(247, 350);
  const criticals = useCountUp(0, 400);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 2.7fr', gap: 16, height: '100%' }}>
      {/* LEFT — hero panel */}
      <div style={{
        ...rise(0),
        background: C.s0, border: `1px solid ${C.b0}`,
        borderTop: `3px solid ${C.orange}`,
        borderRadius: 12, padding: 24,
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <div style={rise(40)}>
          <Label color={C.orange} style={{ marginBottom: 8 }}>Brad 2.0 · Mission Brief</Label>
          <div style={{ fontFamily: C.H, fontSize: 26, fontWeight: 700, color: C.t0, letterSpacing: '-0.015em', lineHeight: 1.1, marginTop: 8 }}>
            Architecture cannot transfer liability.
          </div>
          <div style={{ fontFamily: C.H, fontSize: 14, fontWeight: 600, color: C.orange, marginTop: 4 }}>
            The organization answers. Always.
          </div>
        </div>

        <div style={{ ...rise(100), fontFamily: C.B, fontSize: 13, color: C.t1, lineHeight: 1.6 }}>
          Every option — self-hosted, hyperscaler, vertical SaaS — leaves the organization 100% accountable for HIPAA, SOC 2, and state regulators. The architecture changes the failure surface, not the accountability.
        </div>

        {/* KPI strip */}
        <div style={{ ...rise(140), display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '12px 0', borderTop: `1px solid ${C.b0}`, borderBottom: `1px solid ${C.b0}` }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: C.H, fontSize: 28, fontWeight: 700, color: C.teal, lineHeight: 1 }}>{passes}/100</div>
            <Label color={C.t2} style={{ marginTop: 4, letterSpacing: '0.14em' }}>Passes</Label>
          </div>
          <div style={{ textAlign: 'center', borderLeft: `1px solid ${C.b0}`, borderRight: `1px solid ${C.b0}` }}>
            <div style={{ fontFamily: C.H, fontSize: 28, fontWeight: 700, color: C.t0, lineHeight: 1 }}>{iterations}</div>
            <Label color={C.t2} style={{ marginTop: 4, letterSpacing: '0.14em' }}>Iterations</Label>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: C.H, fontSize: 28, fontWeight: 700, color: C.ok, lineHeight: 1 }}>{criticals}</div>
            <Label color={C.t2} style={{ marginTop: 4, letterSpacing: '0.14em' }}>Criticals</Label>
          </div>
        </div>

        {/* Liability indicator */}
        <div style={{ ...rise(180), marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <LiabilityBadge size="md" />
          <div>
            <Label color={C.orange}>Non-transferable liability</Label>
            <div style={{ fontFamily: C.H, fontSize: 16, fontWeight: 700, color: C.t0, marginTop: 4 }}>Organization owns 100%</div>
          </div>
        </div>
      </div>

      {/* RIGHT — 2×2 tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 12 }}>
        {BRIEF_TILES.map((t, i) => <Tile key={t.id} tile={t} onOpen={() => openTile(t)} audit={audit} delay={i * 60} />)}
      </div>
    </div>
  );
}

function ThreatView({ openTile, audit }: { openTile: (t: DrillDown) => void; audit: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 3.2fr', gap: 16, height: '100%' }}>
      {/* LEFT — threat overview */}
      <div style={{
        ...rise(0),
        background: C.s0, border: `1px solid ${C.b0}`,
        borderTop: `3px solid ${C.risk}`,
        borderRadius: 12, padding: 20,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={rise(40)}>
          <Label color={C.risk} style={{ marginBottom: 6 }}>Threat Surface</Label>
          <div style={{ fontFamily: C.H, fontSize: 20, fontWeight: 700, color: C.t0, lineHeight: 1.2, marginTop: 6 }}>
            Six vectors.<br /><span style={{ color: C.risk }}>Six failure paths.</span>
          </div>
        </div>
        <div style={{ ...rise(80), fontFamily: C.B, fontSize: 12, color: C.t1, lineHeight: 1.55 }}>
          Each tile shows what fails, who owns it, and the consequence. Click any vector for full detail and citations.
        </div>

        {/* Severity legend */}
        <div style={{ ...rise(120), display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(['critical', 'high', 'medium'] as const).map((sev, i) => (
            <div key={sev} style={{ ...rise(130 + i * 40), display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: sevColor(sev), flexShrink: 0 }} />
              <span style={{ fontFamily: C.B, fontSize: 11, color: C.t1 }}>{sev}</span>
            </div>
          ))}
        </div>

        <div style={{ ...rise(240), marginTop: 'auto', padding: '10px 12px', background: C.sw, border: `1px solid ${C.warn}33`, borderRadius: 8 }}>
          <Label color={C.warn} style={{ marginBottom: 4 }}>Verdict</Label>
          <div style={{ fontFamily: C.H, fontSize: 13, fontWeight: 600, color: C.t0, marginTop: 4, lineHeight: 1.3 }}>
            Self-host shrinks 4 of 6 vectors.
          </div>
        </div>
      </div>

      {/* RIGHT — 3×2 threat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: '1fr 1fr', gap: 10 }}>
        {THREAT_TILES.map((t, i) => <Tile key={t.id} tile={t} onOpen={() => openTile(t)} audit={audit} delay={i * 55} />)}
      </div>
    </div>
  );
}

function ArchView({ audit }: { audit: boolean }) {
  const [selected, setSelected] = useState<ArchProfile>(ARCHITECTURES[0]);
  const accent = archColor(selected.tone);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 3.1fr', gap: 16, height: '100%' }}>
      {/* LEFT — arch selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Label color={C.t2} style={{ marginBottom: 4 }}>Select Architecture</Label>
        {ARCHITECTURES.map((a, i) => {
          const active = selected.id === a.id;
          const ac = archColor(a.tone);
          return (
            <button
              key={a.id} type="button" onClick={() => setSelected(a)}
              style={{
                ...rise(i * 60),
                textAlign: 'left', cursor: 'pointer',
                background: active ? C.si : C.s0,
                border: `1px solid ${active ? ac : C.b0}`, borderLeft: `3px solid ${ac}`,
                borderRadius: 8, padding: '10px 12px',
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'border-color 120ms ease-out, background 120ms ease-out',
              }}
              onMouseEnter={e => {
                if (!active) { e.currentTarget.style.borderColor = ac; e.currentTarget.style.background = C.si; }
              }}
              onMouseLeave={e => {
                if (!active) { e.currentTarget.style.borderColor = C.b0; e.currentTarget.style.background = C.s0; }
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 6,
                background: active ? ac : C.s1, border: `1px solid ${active ? ac : C.b0}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: C.H, fontWeight: 700, fontSize: 13, color: active ? '#fff' : ac,
                transition: 'all 120ms ease-out',
              }}>{a.code}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: C.H, fontSize: 12, fontWeight: 600, color: C.t0, lineHeight: 1.2 }}>{a.name}</div>
                <div style={{ fontFamily: C.B, fontSize: 11, color: C.t2, marginTop: 2 }}>TCO {a.fiveYearTCO}</div>
              </div>
              {a.recommended && <Tag color={C.ok} filled>REC</Tag>}
            </button>
          );
        })}
      </div>

      {/* RIGHT — arch detail */}
      <div style={{
        ...rise(0),
        background: C.s0, border: `1px solid ${C.b0}`,
        borderTop: `3px solid ${accent}`,
        borderRadius: 12, padding: 20,
        display: 'grid', gridTemplateColumns: '1.6fr 1fr', gridTemplateRows: 'auto 1fr auto', gap: 14,
      }}>
        {/* Header row */}
        <div style={{ ...rise(40), gridColumn: '1 / -1', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <Eyebrow color={accent}>Architecture · {selected.code}</Eyebrow>
            <div style={{ fontFamily: C.H, fontSize: 24, fontWeight: 700, color: C.t0, letterSpacing: '-0.015em', marginTop: 4, lineHeight: 1.2 }}>{selected.name}</div>
            <div style={{ fontFamily: C.B, fontSize: 13, color: C.t1, marginTop: 4 }}>{selected.oneLine}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <KpiBadge label="5-YR TCO" value={selected.fiveYearTCO} color={accent} delay={60} />
            <KpiBadge label="CTRL IDX" value={`${selected.controlIndex}/100`} color={accent} delay={90} />
            <KpiBadge label="RTO" value={selected.rto} color={accent} delay={120} />
            <div style={rise(150)}><LiabilityBadge /></div>
          </div>
        </div>

        {/* Left col: pros/cons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignContent: 'start' }}>
          <ProsList title="Strengths" color={C.ok} items={selected.pros} delay={80} />
          <ProsList title="Weaknesses" color={C.risk} items={selected.cons} delay={100} />
        </div>

        {/* Right col: responsibility split */}
        <div style={{ ...rise(80), background: C.s1, border: `1px solid ${C.b0}`, borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Label color={C.t2}>Shared Responsibility</Label>
            <Tag color={C.risk}>Liability 100% Org</Tag>
          </div>
          <DualBar vendor={selected.vendorPct} org={100 - selected.vendorPct} label="Operations" delay={120} />
          <DualBar vendor={0} org={100} label="Liability" delay={160} />
          <div style={{ fontFamily: C.B, fontSize: 11, color: C.t1, lineHeight: 1.5, marginTop: 2 }}>
            <span style={{ color: C.teal }}>■ Vendor</span> shares operational duty.{' '}
            <span style={{ color: C.orange }}>■ Organization</span> retains <strong style={{ color: C.risk }}>100% of legal liability</strong>.
          </div>
        </div>

        {/* Bottom: failure strip */}
        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <InfoCell icon={Skull} label="Failure Mode" body={selected.failureMode} color={C.risk} delay={140} />
          <InfoCell icon={AlertOctagon} label="Consequence" body={selected.consequence} color={C.warn} delay={160} />
          <InfoCell icon={Building2} label="Owner" body={selected.owner} color={C.teal} delay={180} />
        </div>

        {audit && (
          <div style={{ ...rise(200), gridColumn: '1 / -1', padding: '8px 12px', background: C.si, border: `1px solid ${C.teal}33`, borderRadius: 6 }}>
            <Label color={C.teal} style={{ letterSpacing: '0.16em' }}>Audit Mapping</Label>
            <span style={{ fontFamily: C.B, fontSize: 11, color: C.t1, marginLeft: 12 }}>Files 02, 03, 13, 17 reference this architecture · Decision logged S6 / S10</span>
          </div>
        )}
      </div>
    </div>
  );
}

function LiabilityView({ audit }: { audit: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const active = hovered ? LIABILITY_LAYERS.find(l => l.layer === hovered) : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr', gap: 16, height: '100%' }}>
      {/* LEFT — matrix */}
      <div style={{
        ...rise(0),
        background: C.s0, border: `1px solid ${C.b0}`,
        borderTop: `3px solid ${C.orange}`,
        borderRadius: 12, padding: 16,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ ...rise(40), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Label color={C.orange}>Responsibility Model</Label>
            <div style={{ fontFamily: C.H, fontSize: 17, fontWeight: 700, color: C.t0, marginTop: 4 }}>
              Vendor operates. <span style={{ color: C.risk }}>Organization is liable.</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[{ c: C.teal, l: 'Vendor ops' }, { c: C.orange, l: 'Org ops' }, { c: C.risk, l: 'Org liability (always 100%)' }].map(x => (
              <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, background: x.c, borderRadius: 2, flexShrink: 0 }} />
                <Eyebrow color={C.t2}>{x.l}</Eyebrow>
              </div>
            ))}
          </div>
        </div>

        {/* Header */}
        <div style={{ ...rise(80), display: 'grid', gridTemplateColumns: '1.4fr repeat(4, 1fr)', gap: 8, padding: '0 6px' }}>
          {['Layer', 'SH', 'A', 'B', 'C'].map(h => (
            <Eyebrow key={h} color={C.t2}>{h}</Eyebrow>
          ))}
        </div>

        {/* Rows */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {LIABILITY_LAYERS.map((row, i) => {
            const isHov = hovered === row.layer;
            return (
              <div
                key={row.layer}
                onMouseEnter={() => setHovered(row.layer)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  ...rise(100 + i * 40),
                  display: 'grid', gridTemplateColumns: '1.4fr repeat(4, 1fr)', gap: 8,
                  alignItems: 'center', padding: '6px 6px',
                  background: isHov ? C.si : 'transparent',
                  border: `1px solid ${isHov ? `${C.teal}33` : 'transparent'}`,
                  borderRadius: 6, cursor: 'pointer',
                  transition: 'background 120ms ease-out, border-color 120ms ease-out',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: C.B, fontSize: 12, color: C.t0, fontWeight: 500 }}>
                  <Lock size={10} color={C.t2} />{row.layer}
                </div>
                {[
                  { v: row.shVendor, o: row.shOrg },
                  { v: row.aVendor,  o: row.aOrg },
                  { v: row.bVendor,  o: row.bOrg },
                  { v: row.cVendor,  o: row.cOrg },
                ].map((d, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ flex: 1, height: 10, background: C.s1, border: `1px solid ${C.b0}`, borderRadius: 2, overflow: 'hidden', display: 'flex' }}>
                      <div style={{ width: `${d.v}%`, background: C.teal, ...barAnim(100 + i * 40 + j * 20) }} />
                      <div style={{ width: `${d.o}%`, background: C.orange, ...barAnim(120 + i * 40 + j * 20) }} />
                    </div>
                    <span style={{ fontFamily: C.B, fontSize: 9, color: C.t2, minWidth: 28, textAlign: 'right' }}>
                      <span style={{ color: C.teal }}>{d.v}</span>/<span style={{ color: C.orange }}>{d.o}</span>
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {audit && (
          <div style={{ ...rise(460), padding: '8px 12px', background: C.si, border: `1px solid ${C.teal}33`, borderRadius: 6 }}>
            <Label color={C.teal} style={{ letterSpacing: '0.16em' }}>Audit Mapping</Label>
            <span style={{ fontFamily: C.B, fontSize: 11, color: C.t1, marginLeft: 12 }}>
              HIPAA §164.308(b)(1) · NIST SP 800-66r2 §4.4 · SOC 2 CC1.4 · File 03
            </span>
          </div>
        )}
      </div>

      {/* RIGHT — detail + liability constant */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{
          ...rise(60),
          background: C.s0, border: `1px solid ${C.orange}33`,
          borderTop: `3px solid ${C.orange}`,
          borderRadius: 12, padding: 18,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LiabilityBadge size="md" />
            <div>
              <Label color={C.orange}>Liability Constant</Label>
              <div style={{ fontFamily: C.H, fontSize: 18, fontWeight: 700, color: C.t0, lineHeight: 1.2, marginTop: 4 }}>
                Always 100% organizational.
              </div>
            </div>
          </div>
          <div style={{ fontFamily: C.B, fontSize: 12, color: C.t1, lineHeight: 1.55 }}>
            Across all 9 layers and all 4 architectures, the percentage of <strong style={{ color: C.risk }}>legal liability borne by the organization is 100%</strong>. Only the operational split changes.
          </div>
        </div>

        <div style={{
          ...rise(100),
          flex: 1, background: C.s0, border: `1px solid ${C.b0}`,
          borderRadius: 12, padding: 16,
          display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden',
        }}>
          <Label color={active ? C.teal : C.t2}>{active ? `Layer — ${active.layer}` : 'Hover a layer'}</Label>
          {active ? (
            <>
              <div style={{ ...rise(0), fontFamily: C.H, fontSize: 14, fontWeight: 600, color: C.t0, lineHeight: 1.3 }}>
                {active.liabilityNote}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <DualBar vendor={active.shVendor} org={active.shOrg} label="SH" delay={20} />
                <DualBar vendor={active.aVendor}  org={active.aOrg}  label="A"  delay={40} />
                <DualBar vendor={active.bVendor}  org={active.bOrg}  label="B"  delay={60} />
                <DualBar vendor={active.cVendor}  org={active.cOrg}  label="C"  delay={80} />
              </div>
            </>
          ) : (
            <div style={{ fontFamily: C.B, fontSize: 12, color: C.t1, lineHeight: 1.55 }}>
              Hover any control layer in the matrix to see its responsibility split across all four architectures.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CostView({ audit }: { audit: boolean }) {
  const [scenarioId, setScenarioId] = useState(COST_SCENARIOS[0].id);
  const sc = COST_SCENARIOS.find(s => s.id === scenarioId)!;
  const max = Math.max(sc.sh, sc.a, sc.b, sc.c);

  const arches: { key: 'sh' | 'a' | 'b' | 'c'; name: string; tone: ArchProfile['tone'] }[] = [
    { key: 'sh', name: 'Self-Hosted',     tone: 'teal'    },
    { key: 'a',  name: 'Hyperscaler PaaS', tone: 'warning' },
    { key: 'b',  name: 'Vertical SaaS',   tone: 'orange'  },
    { key: 'c',  name: 'Multi-SaaS',      tone: 'error'   },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.7fr', gap: 16, height: '100%' }}>
      {/* LEFT — scenario selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Label color={C.t2} style={{ marginBottom: 4 }}>Scenario Toggles</Label>
        {COST_SCENARIOS.map((s, i) => {
          const active = s.id === scenarioId;
          return (
            <button
              key={s.id} type="button" onClick={() => setScenarioId(s.id)}
              style={{
                ...rise(i * 60),
                textAlign: 'left', cursor: 'pointer',
                background: active ? C.si : C.s0,
                border: `1px solid ${active ? C.teal : C.b0}`,
                borderLeft: `3px solid ${active ? C.teal : C.b0}`,
                borderRadius: 8, padding: '12px 14px',
                transition: 'border-color 120ms ease-out, background 120ms ease-out',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = `${C.teal}55`; e.currentTarget.style.background = C.si; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = C.b0; e.currentTarget.style.background = C.s0; } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Eyebrow color={active ? C.teal : C.t2}>{s.label}</Eyebrow>
                {active && <Tag color={C.teal} filled>Active</Tag>}
              </div>
              <div style={{ fontFamily: C.B, fontSize: 12, color: C.t0, marginTop: 5, lineHeight: 1.4 }}>{s.desc}</div>
            </button>
          );
        })}
        <div style={{ ...rise(280), marginTop: 'auto', padding: '10px 12px', background: C.sw, border: `1px solid ${C.warn}33`, borderRadius: 8 }}>
          <Label color={C.warn} style={{ marginBottom: 4 }}>Hidden Cost Note</Label>
          <div style={{ fontFamily: C.B, fontSize: 11, color: C.t0, marginTop: 4, lineHeight: 1.4 }}>{sc.hidden}</div>
        </div>
      </div>

      {/* RIGHT — chart */}
      <div style={{
        ...rise(0),
        background: C.s0, border: `1px solid ${C.b0}`,
        borderTop: `3px solid ${C.orange}`,
        borderRadius: 12, padding: 20,
        display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden',
      }}>
        <div style={{ ...rise(40), display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <Label color={C.orange} style={{ marginBottom: 4 }}>5-Year TCO · {sc.label}</Label>
            <div style={{ fontFamily: C.H, fontSize: 20, fontWeight: 700, color: C.t0, marginTop: 4 }}>{sc.desc}</div>
          </div>
          <Tag color={C.teal}>USD Millions</Tag>
        </div>

        {/* Bar chart */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'flex-end', padding: '0 8px 12px' }}>
          {arches.map((a, i) => {
            const v = sc[a.key];
            const pct = (v / max) * 100;
            const ac = archColor(a.tone);
            return (
              <div key={a.key} style={{ ...rise(60 + i * 60), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                {a.key === 'sh' && (
                  <div style={rise(80 + i * 60)}><Tag color={C.ok} filled>Recommended</Tag></div>
                )}
                <div style={{ fontFamily: C.H, fontSize: 22, fontWeight: 700, color: C.t0 }}>${v.toFixed(2)}M</div>
                <div style={{ width: '100%', height: `${pct}%`, minHeight: 8, borderRadius: '6px 6px 0 0', background: `${ac}22`, border: `1px solid ${ac}`, borderBottom: 'none', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{ width: '100%', height: '100%', background: `${ac}44`, ...barAnim(100 + i * 80, 800) }} />
                </div>
                <div style={{ fontFamily: C.H, fontWeight: 600, fontSize: 12, color: C.t0, textAlign: 'center' }}>{a.name}</div>
                <Label color={C.t2} style={{ letterSpacing: '0.1em' }}>{a.key.toUpperCase()}</Label>
              </div>
            );
          })}
        </div>

        {/* Footer analysis */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, paddingTop: 12, borderTop: `1px solid ${C.b0}` }}>
          <InfoCell icon={DollarSign} label="Hidden Cost Driver" body="Egress, integration glue, vendor lock-in exit costs compound after year 3." color={C.warn} delay={200} />
          <InfoCell icon={AlertOctagon} label="Breach Offset" body="One average breach event adds $1.8M–$3M regardless of architecture." color={C.risk} delay={220} />
          <InfoCell icon={Building2} label="Who Signs the Check" body="Org pays vendor invoices AND breach costs. Vendor pays neither for you." color={C.teal} delay={240} />
        </div>

        {audit && (
          <div style={{ ...rise(260), padding: '8px 12px', background: C.si, border: `1px solid ${C.teal}33`, borderRadius: 6 }}>
            <Label color={C.teal} style={{ letterSpacing: '0.16em' }}>Audit Mapping</Label>
            <span style={{ fontFamily: C.B, fontSize: 11, color: C.t1, marginLeft: 12 }}>File 14 · Cost Analysis · 5-yr TCO with hidden costs and breach event modeling</span>
          </div>
        )}
      </div>
    </div>
  );
}

function RoadmapView({ audit }: { audit: boolean }) {
  const [selected, setSelected] = useState<SprintRow>(ROADMAP[3]);
  const doneCount = useCountUp(ROADMAP.filter(r => r.status === 'done').length, 200);
  const activeCount = useCountUp(ROADMAP.filter(r => r.status === 'active').length, 260);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 2.4fr', gap: 16, height: '100%' }}>
      {/* LEFT — sprint track */}
      <div style={{
        ...rise(0),
        background: C.s0, border: `1px solid ${C.b0}`,
        borderTop: `3px solid ${C.teal}`,
        borderRadius: 12, padding: 16,
        display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden',
      }}>
        <div style={{ ...rise(40), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Label color={C.teal} style={{ marginBottom: 4 }}>Sprint Track · S1–S10</Label>
            <div style={{ fontFamily: C.H, fontSize: 16, fontWeight: 700, color: C.t0, marginTop: 4 }}>
              <span style={{ color: C.ok }}>{doneCount} done</span>
              <span style={{ color: C.b1 }}> · </span>
              <span style={{ color: C.orange }}>{activeCount} active</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[{ c: C.ok, l: 'done' }, { c: C.orange, l: 'active' }, { c: C.warn, l: 'next' }, { c: C.t2, l: 'queued' }].map(x => (
              <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, background: x.c, borderRadius: '50%', flexShrink: 0 }} />
                <Eyebrow color={C.t2}>{x.l}</Eyebrow>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden' }}>
          {ROADMAP.map((r, i) => {
            const active = selected.id === r.id;
            const sc = statusColor(r.status);
            return (
              <button
                key={r.id} type="button" onClick={() => setSelected(r)}
                style={{
                  ...rise(60 + i * 40),
                  textAlign: 'left', cursor: 'pointer',
                  background: active ? C.si : C.s0,
                  border: `1px solid ${active ? C.teal : C.b0}`,
                  borderLeft: `3px solid ${sc}`,
                  borderRadius: 6, padding: '7px 10px',
                  display: 'grid', gridTemplateColumns: '34px 1fr 90px', gap: 8, alignItems: 'center',
                  transition: 'border-color 120ms ease-out, background 120ms ease-out',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = C.si; e.currentTarget.style.borderColor = `${C.teal}44`; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = C.s0; e.currentTarget.style.borderColor = C.b0; } }}
              >
                <div style={{
                  fontFamily: C.H, fontSize: 11, fontWeight: 700, color: sc,
                  background: `${sc}15`, border: `1px solid ${sc}44`,
                  borderRadius: 4, padding: '2px 0', textAlign: 'center',
                  transition: 'all 120ms ease-out',
                }}>{r.sprint}</div>
                <div style={{ fontFamily: C.B, fontSize: 11, color: C.t0, fontWeight: 500, lineHeight: 1.3 }}>{r.epic}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', background: sc, flexShrink: 0,
                    animation: r.status === 'active' ? 'bradPulse 1.8s ease-in-out infinite' : 'none',
                  }} />
                  <Eyebrow color={sc}>{r.status}</Eyebrow>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT — detail */}
      <div style={{
        ...rise(40),
        background: C.s0, border: `1px solid ${C.b0}`,
        borderTop: `3px solid ${statusColor(selected.status)}`,
        borderRadius: 12, padding: 20,
        display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden',
      }}>
        <div style={{ ...rise(60), display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
          <div>
            <Eyebrow color={statusColor(selected.status)}>{selected.sprint} · {selected.status.toUpperCase()}</Eyebrow>
            <div style={{ fontFamily: C.H, fontSize: 22, fontWeight: 700, color: C.t0, marginTop: 6, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{selected.epic}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <Building2 size={12} color={C.teal} />
              <span style={{ fontFamily: C.B, fontSize: 11, color: C.teal }}>Owner: {selected.owner}</span>
            </div>
          </div>
          <Tag color={statusColor(selected.status)} filled>{selected.status}</Tag>
        </div>

        <div style={{ ...rise(100), background: C.s1, border: `1px solid ${C.b0}`, borderRadius: 8, padding: 14 }}>
          <Label color={C.t2} style={{ marginBottom: 6 }}>Work Performed</Label>
          <p style={{ fontFamily: C.B, fontSize: 13, color: C.t0, lineHeight: 1.6, margin: 0 }}>{selected.detail}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <InfoCell icon={Skull} label="Failure Mode" body={selected.failure} color={C.risk} delay={130} />
          <InfoCell icon={AlertOctagon} label="Consequence" body={selected.consequence} color={C.warn} delay={150} />
        </div>

        <div style={{ ...rise(170), marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: C.sw, border: `1px solid ${C.orange}33`, borderRadius: 8 }}>
          <LiabilityBadge />
          <div style={{ fontFamily: C.B, fontSize: 12, color: C.t0, lineHeight: 1.45 }}>
            <strong style={{ color: C.orange }}>Compliance does not pause for sprints.</strong>
            <br />Each sprint adds capability; none transfers liability.
          </div>
        </div>

        {audit && (
          <div style={{ ...rise(200), padding: '8px 12px', background: C.si, border: `1px solid ${C.teal}33`, borderRadius: 6 }}>
            <Label color={C.teal} style={{ letterSpacing: '0.16em' }}>Audit Mapping</Label>
            <span style={{ fontFamily: C.B, fontSize: 11, color: C.t1, marginLeft: 12 }}>File 16 · Sprint Plan + Project Board · DoR/DoD per epic</span>
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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.9fr', gap: 16, height: '100%' }}>
      <ArchPickerPanel label="Option A" arch={a} onChange={setA} delayBase={0} />
      <ArchPickerPanel label="Option B" arch={b} onChange={setB} delayBase={60} />

      {/* Verdict panel */}
      <div style={{
        ...rise(120),
        background: C.s0, border: `1px solid ${C.orange}44`,
        borderTop: `3px solid ${C.orange}`,
        borderRadius: 12, padding: 20,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={rise(140)}>
          <Label color={C.orange} style={{ marginBottom: 6 }}>Decision Engine</Label>
          <div style={{ fontFamily: C.H, fontSize: 18, fontWeight: 700, color: C.t0, marginTop: 6, lineHeight: 1.25 }}>{verdict}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { label: '5-yr TCO', av: a.fiveYearTCO, bv: b.fiveYearTCO, bestA: parseFloat(a.fiveYearTCO.replace(/[$M]/g, '')) <= parseFloat(b.fiveYearTCO.replace(/[$M]/g, '')) },
            { label: 'Control Index', av: `${a.controlIndex}/100`, bv: `${b.controlIndex}/100`, bestA: a.controlIndex >= b.controlIndex },
            { label: 'Org-side Ops', av: `${100 - a.vendorPct}%`, bv: `${100 - b.vendorPct}%`, bestA: (100 - a.vendorPct) <= (100 - b.vendorPct) },
            { label: 'Liability', av: '100%', bv: '100%', bestA: null },
            { label: 'RTO', av: a.rto, bv: b.rto, bestA: null },
          ].map((row, i) => (
            <div key={row.label} style={{
              ...rise(160 + i * 40),
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6,
              alignItems: 'center', padding: '6px 8px',
              background: C.s1, border: `1px solid ${C.b0}`, borderRadius: 6,
            }}>
              <Eyebrow color={C.t2}>{row.label}</Eyebrow>
              <div style={{ fontFamily: C.H, fontSize: 13, fontWeight: 700, textAlign: 'right', color: row.bestA === null ? C.t0 : row.bestA ? C.ok : C.t2 }}>{row.av}</div>
              <div style={{ fontFamily: C.H, fontSize: 13, fontWeight: 700, textAlign: 'right', color: row.bestA === null ? C.t0 : !row.bestA ? C.ok : C.t2 }}>{row.bv}</div>
            </div>
          ))}
        </div>

        <div style={{ ...rise(380), marginTop: 'auto', padding: '10px 12px', background: C.sw, border: `1px solid ${C.risk}33`, borderRadius: 8 }}>
          <Label color={C.risk} style={{ marginBottom: 4 }}>What Never Changes</Label>
          <div style={{ fontFamily: C.B, fontSize: 12, color: C.t0, marginTop: 4, lineHeight: 1.5 }}>
            Both options leave us <strong style={{ color: C.risk }}>100% legally accountable</strong>. The choice is operational, not legal.
          </div>
        </div>

        {audit && (
          <div style={{ ...rise(400), padding: '8px 12px', background: C.si, border: `1px solid ${C.teal}33`, borderRadius: 6 }}>
            <Label color={C.teal} style={{ letterSpacing: '0.16em' }}>Audit Mapping</Label>
            <span style={{ fontFamily: C.B, fontSize: 11, color: C.t1, marginLeft: 12 }}>File 17 · Final Recommendation · Decision matrix by optimization goal</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ArchPickerPanel({ label, arch, onChange, delayBase }: { label: string; arch: ArchProfile; onChange: (a: ArchProfile) => void; delayBase: number }) {
  const accent = archColor(arch.tone);
  return (
    <div style={{
      ...rise(delayBase),
      background: C.s0, border: `1px solid ${C.b0}`,
      borderTop: `3px solid ${accent}`,
      borderRadius: 12, padding: 18,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ ...rise(delayBase + 40), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Label color={accent}>{label}</Label>
        <select
          value={arch.id}
          onChange={e => { const next = ARCHITECTURES.find(x => x.id === e.target.value); if (next) onChange(next); }}
          style={{
            background: C.s1, color: C.t0, fontFamily: C.B, fontSize: 12, fontWeight: 500,
            border: `1px solid ${C.b1}`, borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
            transition: 'border-color 120ms ease-out',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = C.teal; }}
          onBlur={e => { e.currentTarget.style.borderColor = C.b1; }}
        >
          {ARCHITECTURES.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
        </select>
      </div>

      <div style={rise(delayBase + 60)}>
        <div style={{ fontFamily: C.H, fontSize: 16, fontWeight: 700, color: C.t0, lineHeight: 1.25 }}>{arch.name}</div>
        <div style={{ fontFamily: C.B, fontSize: 12, color: C.t1, marginTop: 4, lineHeight: 1.5 }}>{arch.oneLine}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <DualBar vendor={arch.vendorPct} org={100 - arch.vendorPct} label="Operations" delay={delayBase + 80} />
        <DualBar vendor={0} org={100} label="Liability" delay={delayBase + 100} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 'auto' }}>
        <KpiBadge label="TCO" value={arch.fiveYearTCO} color={accent} delay={delayBase + 120} />
        <KpiBadge label="CTRL" value={`${arch.controlIndex}`} color={accent} delay={delayBase + 140} />
      </div>

      <InfoCell icon={Skull} label="Failure Mode" body={arch.failureMode} color={C.risk} delay={delayBase + 160} />
    </div>
  );
}

function AuditView() {
  const [filter, setFilter] = useState<'all' | 'pass' | 'partial' | 'gap'>('all');
  const [selectedCtrl, setSelectedCtrl] = useState<ControlRow | null>(CONTROLS[2]);
  const filtered = useMemo(() => filter === 'all' ? CONTROLS : CONTROLS.filter(c => c.status === filter), [filter]);

  const pass    = CONTROLS.filter(c => c.status === 'pass').length;
  const partial = CONTROLS.filter(c => c.status === 'partial').length;
  const gap     = CONTROLS.filter(c => c.status === 'gap').length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1.6fr', gap: 16, height: '100%' }}>
      {/* LEFT */}
      <div style={{
        ...rise(0),
        background: C.s0, border: `1px solid ${C.b0}`,
        borderTop: `3px solid ${C.teal}`,
        borderRadius: 12, padding: 16,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ ...rise(40), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Label color={C.teal} style={{ marginBottom: 4 }}>Control Console · NIST 800-53 / HIPAA / SOC 2</Label>
            <div style={{ fontFamily: C.H, fontSize: 17, fontWeight: 700, color: C.t0, marginTop: 4 }}>
              <span style={{ color: C.ok }}>{pass} pass</span>
              <span style={{ color: C.b1 }}> · </span>
              <span style={{ color: C.warn }}>{partial} partial</span>
              <span style={{ color: C.b1 }}> · </span>
              <span style={{ color: C.risk }}>{gap} gap</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'pass', 'partial', 'gap'] as const).map(f => (
              <button
                key={f} type="button" onClick={() => setFilter(f)}
                style={{
                  ...rise(60),
                  background: filter === f ? C.teal : 'transparent',
                  color: filter === f ? '#fff' : C.t2,
                  border: `1px solid ${filter === f ? C.teal : C.b0}`,
                  borderRadius: 6, padding: '4px 10px',
                  fontFamily: C.H, fontSize: 10, fontWeight: 600, letterSpacing: '0.14em',
                  textTransform: 'uppercase', cursor: 'pointer',
                  transition: 'all 120ms ease-out',
                }}
                onMouseEnter={e => { if (filter !== f) { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.color = C.teal; } }}
                onMouseLeave={e => { if (filter !== f) { e.currentTarget.style.borderColor = C.b0; e.currentTarget.style.color = C.t2; } }}
              >{f}</button>
            ))}
          </div>
        </div>

        {/* Table header */}
        <div style={{ ...rise(80), display: 'grid', gridTemplateColumns: '60px 90px 1fr 80px', gap: 8, padding: '0 8px' }}>
          {['Ctrl', 'Family', 'Name', 'Status'].map(h => <Eyebrow key={h} color={C.t2}>{h}</Eyebrow>)}
        </div>

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filtered.map((c, i) => {
            const active = selectedCtrl?.ctrl === c.ctrl;
            const sc = controlColor(c.status);
            return (
              <button
                key={c.ctrl} type="button" onClick={() => setSelectedCtrl(c)}
                style={{
                  ...rise(100 + i * 40),
                  display: 'grid', gridTemplateColumns: '60px 90px 1fr 80px', gap: 8, alignItems: 'center',
                  textAlign: 'left', cursor: 'pointer',
                  background: active ? C.si : C.s0,
                  border: `1px solid ${active ? C.teal : C.b0}`,
                  borderLeft: `3px solid ${sc}`,
                  borderRadius: 6, padding: '8px 10px',
                  transition: 'border-color 120ms ease-out, background 120ms ease-out',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = C.si; e.currentTarget.style.borderColor = `${C.teal}33`; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = C.s0; e.currentTarget.style.borderColor = C.b0; } }}
              >
                <span style={{ fontFamily: C.H, fontSize: 12, fontWeight: 700, color: C.t0 }}>{c.ctrl}</span>
                <span style={{ fontFamily: C.B, fontSize: 11, color: C.t2 }}>{c.family}</span>
                <span style={{ fontFamily: C.B, fontSize: 12, color: C.t0, fontWeight: 500 }}>{c.name}</span>
                <span style={{ textAlign: 'right' }}><Tag color={sc}>{c.status}</Tag></span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT */}
      <div style={{
        ...rise(60),
        background: C.s0, border: `1px solid ${C.b0}`,
        borderTop: `3px solid ${selectedCtrl ? controlColor(selectedCtrl.status) : C.b0}`,
        borderRadius: 12, padding: 18,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {selectedCtrl ? (
          <>
            <div style={{ ...rise(80), display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <Eyebrow color={C.teal}>Control · {selectedCtrl.ctrl}</Eyebrow>
                <div style={{ fontFamily: C.H, fontSize: 20, fontWeight: 700, color: C.t0, marginTop: 4 }}>{selectedCtrl.name}</div>
                <Eyebrow color={C.t2}>{selectedCtrl.family}</Eyebrow>
              </div>
              <Tag color={controlColor(selectedCtrl.status)} filled>{selectedCtrl.status}</Tag>
            </div>

            <div style={{ ...rise(120), background: C.s1, border: `1px solid ${C.b0}`, borderRadius: 8, padding: 12 }}>
              <Label color={C.t2} style={{ marginBottom: 4 }}>Framework Mapping</Label>
              <div style={{ fontFamily: C.B, fontSize: 12, color: C.t0, marginTop: 4, lineHeight: 1.5 }}>{selectedCtrl.mapping}</div>
            </div>

            <div style={{ ...rise(150), background: C.s1, border: `1px solid ${C.b0}`, borderRadius: 8, padding: 12 }}>
              <Label color={C.teal} style={{ marginBottom: 4 }}>Evidence</Label>
              <div style={{ fontFamily: C.B, fontSize: 12, color: C.t0, marginTop: 4, lineHeight: 1.5 }}>{selectedCtrl.evidence}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <InfoCell icon={Skull} label="Failure Mode" body={selectedCtrl.failureMode} color={C.risk} delay={180} />
              <InfoCell icon={Building2} label="Owner" body={selectedCtrl.owner} color={C.teal} delay={200} />
            </div>

            <div style={{ ...rise(220), marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: C.sw, border: `1px solid ${C.orange}33`, borderRadius: 8 }}>
              <LiabilityBadge />
              <div style={{ fontFamily: C.B, fontSize: 12, color: C.t0, lineHeight: 1.45 }}>
                Evidence reduces audit findings. <strong style={{ color: C.risk }}>It does not reduce liability.</strong>
              </div>
            </div>
          </>
        ) : (
          <div style={{ fontFamily: C.B, fontSize: 13, color: C.t1 }}>Select a control to inspect.</div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SHELL — The One-Card Canvas, CI design system
═══════════════════════════════════════════════════════════════════════ */
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
    <div style={{ position: 'fixed', inset: 0, background: C.vp, padding: 20, display: 'flex' }}>
      <style>{`
        @keyframes bradRise {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @keyframes bradBarFill {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes bradFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes bradSlideRight {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        @keyframes bradPulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.5; }
        }
        * { box-sizing: border-box; }
        select { outline: none; }
        button { outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${C.s1}; }
        ::-webkit-scrollbar-thumb { background: ${C.b0}; border-radius: 2px; }
      `}</style>

      {/* App card — 20px radius, single surface, fills viewport with 20px margin */}
      <div style={{
        flex: 1, background: C.s0,
        borderRadius: 20, border: `1px solid ${C.b0}`,
        display: 'grid', gridTemplateRows: '56px 40px 1fr 32px',
        overflow: 'hidden',
        animation: 'bradRise 360ms cubic-bezier(0.16, 1, 0.3, 1) both',
      }}>

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
          background: C.s0, borderBottom: `1px solid ${C.b0}`,
        }}>
          {/* Left: back + identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button" onClick={() => navigate('/iadministrator')}
              style={{
                ...rise(40),
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'transparent', border: `1px solid ${C.b0}`,
                color: C.t2, padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
                fontFamily: C.H, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600,
                transition: 'border-color 120ms ease-out, color 120ms ease-out',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.color = C.teal; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.b0; e.currentTarget.style.color = C.t2; }}
            >
              <ArrowLeft size={11} /> Return
            </button>

            <div style={{ ...rise(60), display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: C.teal,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Cpu size={15} color="#fff" />
              </div>
              <div>
                <div style={{ fontFamily: C.H, fontSize: 13, fontWeight: 700, color: C.t0, letterSpacing: '-0.01em', lineHeight: 1 }}>
                  Brad 2.0
                </div>
                <Label color={C.teal} style={{ marginTop: 2, letterSpacing: '0.16em' }}>
                  {activeTab.code} · {activeTab.label}
                </Label>
              </div>
            </div>
          </div>

          {/* Right: status + controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Liability indicator */}
            <div style={{
              ...rise(80),
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 12px', background: C.sw, border: `1px solid ${C.orange}33`, borderRadius: 6,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.orange, animation: 'bradPulse 2.4s ease-in-out infinite' }} />
              <Label color={C.orange} style={{ letterSpacing: '0.12em' }}>Org Liability</Label>
              <div style={{ fontFamily: C.H, fontSize: 13, fontWeight: 700, color: C.orange }}>100%</div>
            </div>

            {/* Classification tag */}
            <div style={{ ...rise(100), display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: C.tealTint, border: `1px solid ${C.teal}33`, borderRadius: 6 }}>
              <ShieldCheck size={12} color={C.teal} />
              <Label color={C.teal} style={{ letterSpacing: '0.12em' }}>PHI · HIPAA</Label>
            </div>

            {/* Audit mode toggle */}
            <button
              type="button" onClick={() => setAudit(v => !v)}
              style={{
                ...rise(120),
                display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                borderRadius: 6, cursor: 'pointer',
                background: audit ? C.teal : 'transparent',
                color: audit ? '#fff' : C.t2,
                border: `1px solid ${audit ? C.teal : C.b0}`,
                fontFamily: C.H, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
                transition: 'all 120ms ease-out',
              }}
              onMouseEnter={e => { if (!audit) { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.color = C.teal; } }}
              onMouseLeave={e => { if (!audit) { e.currentTarget.style.borderColor = C.b0; e.currentTarget.style.color = C.t2; } }}
            >
              {audit ? <Eye size={11} /> : <EyeOff size={11} />}
              Audit {audit ? 'On' : 'Off'}
            </button>

            {/* Docs source */}
            <div style={{ ...rise(140), display: 'flex', alignItems: 'center', gap: 5 }}>
              <Server size={11} color={C.t2} />
              <Label color={C.t2} style={{ letterSpacing: '0.1em' }}>Files 01–17</Label>
            </div>
          </div>
        </header>

        {/* ── TAB BAR ──────────────────────────────────────────────── */}
        <nav style={{
          display: 'flex', alignItems: 'stretch',
          background: C.s0, borderBottom: `1px solid ${C.b0}`,
          padding: '0 16px', gap: 2, overflowX: 'auto',
        }}>
          {TABS.map((t, i) => {
            const active = t.id === tab;
            const Icon = t.icon;
            return (
              <button
                key={t.id} type="button" onClick={() => setTab(t.id)}
                style={{
                  ...rise(i * 30),
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '0 14px', cursor: 'pointer',
                  background: 'transparent', border: 'none',
                  borderBottom: `2px solid ${active ? C.teal : 'transparent'}`,
                  color: active ? C.teal : C.t2,
                  fontFamily: C.H, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                  transition: 'color 120ms ease-out, border-color 120ms ease-out, background 120ms ease-out',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.color = C.t0; e.currentTarget.style.borderBottomColor = `${C.teal}44`; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = C.t2; e.currentTarget.style.borderBottomColor = 'transparent'; } }}
              >
                <Icon size={12} color={active ? C.teal : C.t2} style={{ transition: 'color 120ms' }} />
                <span style={{ fontWeight: 700, color: active ? C.teal : C.t2, transition: 'color 120ms' }}>{t.code}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── CONTENT ──────────────────────────────────────────────── */}
        <main style={{ position: 'relative', overflow: 'hidden', padding: 16, background: C.vp }}>
          <div key={tab} style={{ height: '100%', animation: 'bradRise 200ms cubic-bezier(0.16, 1, 0.3, 1) both' }}>
            {renderTab()}
          </div>
          <Drawer tile={drawer} onClose={() => setDrawer(null)} />
        </main>

        {/* ── FOOTER ───────────────────────────────────────────────── */}
        <footer style={{
          display: 'grid', gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center', gap: 16, padding: '0 20px',
          background: C.s0, borderTop: `1px solid ${C.b0}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={11} color={C.teal} />
            <Label color={C.teal} style={{ letterSpacing: '0.12em' }}>System Statement</Label>
          </div>
          <div style={{ fontFamily: C.B, fontSize: 11, fontWeight: 500, color: C.t1, textAlign: 'center', letterSpacing: '0.01em' }}>
            We are <span style={{ color: C.risk, fontWeight: 600 }}>fully responsible for compliance</span> regardless of architecture.
            <span style={{ color: C.b1 }}> · </span>
            SaaS does <span style={{ color: C.risk }}>not</span> make us compliant.
            <span style={{ color: C.b1 }}> · </span>
            The vendor operates. The organization answers.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
            <Label color={C.t2} style={{ letterSpacing: '0.1em' }}>Sources · Files 01–17</Label>
            <Server size={11} color={C.t2} />
          </div>
        </footer>

      </div>
    </div>
  );
}

export default BradProposalPage;
