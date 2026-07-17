/**
 * LVN-002 — LVN Scope of Practice — CA B&P § 2859
 * Version: 5.0
 * Status: CONTENT COMPLETE — MIGRATION/TECH QA PENDING
 * Record ID: 6a5589133463cd690af8d62d
 * Track: LVN — Licensed Vocational Nurse
 * CMS: 42 CFR § 484.115(c) | CA: B&P § 2859 | 16 CCR § 2518
 * Shell: SC04 split-panel (rich content ~55% / instructional SVG ~45%)
 * Pages: 7 | Quiz: 10 | Pass: 80%
 *
 * Knowledge assessment only — does not certify practical clinical competency.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { LvnGaoPlayer } from './LvnGaoPlayer';

// ─── META ───────────────────────────────────────────────────────────────────

const MODULE_META = {
  id: 'LVN-002',
  title: 'LVN Scope of Practice — CA B&P § 2859',
  track: 'LVN — Licensed Vocational Nurse',
  version: '5.0',
  status: 'CONTENT COMPLETE — MIGRATION/TECH QA PENDING',
  pages: 7,
  passing: 80,
  quizCount: 10,
  cms: '42 CFR § 484.115(c)',
  policy: 'CA B&P Code § 2859 | 16 CCR § 2518',
  duration: '~35 min',
  themeColor: '#7C3AED',
  gradient: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
  recordId: '6a5589133463cd690af8d62d',
};

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface KeyPoint {
  icon: string;
  title: string;
  detail: string;
}

interface Hotspot {
  id: string;
  label: string;
  cx: number;
  cy: number;
  r?: number;
  info: string;
  zone?: 'authorized' | 'conditional' | 'prohibited' | 'neutral';
}

interface PageData {
  id: number;
  title: string;
  subtitle: string;
  narration: string[];
  keyPoints: KeyPoint[];
  clinicalTip: string;
  scene: string;
  hotspots: Hotspot[];
  sourceLabels: { kind: string; text: string }[];
}

interface QuizQuestion {
  id: number;
  stem: string;
  options: string[];
  correct: number;
  rationale: string;
}

// ─── CONTENT PAGES ──────────────────────────────────────────────────────────

const PAGES: PageData[] = [
  {
    id: 0,
    title: 'The LVN License: Authority, Boundaries & Accountability',
    subtitle: 'Understanding what your license authorizes — and what it does not',
    narration: [
      'Your Licensed Vocational Nurse credential is a state-issued grant of authority. It defines what you are legally permitted to do in direct patient care — and just as precisely, what you are not. In California home health, LVN practice is codified in Business & Professions Code § 2859, further elaborated in 16 CCR § 2518, and operationalized through agency policy and federal Conditions of Participation at 42 CFR § 484.115(c).',
      'The LVN scope in home health is narrower in operational risk than many acute-care settings because the home environment demands a different accountability framework. You will often be the only clinician in the patient\'s home. The RN who co-signs your documentation is not physically present. The physician who ordered the Plan of Care is not on site. Scope adherence is therefore not only a regulatory obligation — it is a primary patient-safety control.',
      'This module maps four layers of guidance that must stay distinct in your daily reasoning: (1) California law (B&P § 2859 / BVNPT rules), (2) federal CoP requirements for home health personnel qualifications, (3) agency policy (authorization matrices, co-signature workflows, escalation paths), and (4) professional judgment within those boundaries. Law and CoPs set hard floors; agency policy may be stricter; judgment never expands legal scope.',
      'By the end of this module you will apply a real-time three-zone analysis — authorized, conditional, or prohibited — and know what to do first, when you may continue, when you must stop, whom to notify, and what to document. Passing the knowledge quiz confirms understanding only; observed demonstration and authorized sign-off remain separate competency steps.',
    ],
    keyPoints: [
      {
        icon: '⚖️',
        title: 'Legal authority source',
        detail:
          'CA B&P § 2859 grants LVN practice authority. Scope violations risk license action and patient harm.',
      },
      {
        icon: '🏠',
        title: 'Home health context',
        detail:
          'Solo visits elevate accountability — no on-site RN backup changes the risk calculus, not the legal scope itself.',
      },
      {
        icon: '📋',
        title: 'Three practice zones',
        detail:
          'Authorized (within license + orders + competency), Conditional (RN oversight/co-signature/agency gate), Prohibited (RN/NP/MD only).',
      },
      {
        icon: '🔗',
        title: 'Federal overlay',
        detail:
          '42 CFR § 484.115(c) requires agencies to ensure personnel practice only within authorized qualifications — CoP deficiency risk if violated.',
      },
    ],
    clinicalTip:
      'Safety-first rule: if you must ask whether something is within your scope, treat it as conditional — contact the supervising RN before proceeding. Never invent authority from urgency alone.',
    scene: 'license-authority',
    hotspots: [
      {
        id: 'law',
        label: 'CA B&P § 2859',
        cx: 90,
        cy: 120,
        info: 'California law defines LVN authorized services. Statute + BVNPT regulations set the legal ceiling for practice.',
        zone: 'neutral',
      },
      {
        id: 'cop',
        label: '42 CFR § 484.115(c)',
        cx: 250,
        cy: 90,
        info: 'Federal CoP: agencies must use personnel who meet qualifications and practice within authorized roles.',
        zone: 'neutral',
      },
      {
        id: 'agency',
        label: 'Agency policy',
        cx: 250,
        cy: 200,
        info: 'Agency P&P may be stricter than law (competency lists, co-signature timers, escalation trees). Follow the stricter rule.',
        zone: 'conditional',
      },
      {
        id: 'zones',
        label: 'Three zones',
        cx: 410,
        cy: 150,
        info: 'Authorized / Conditional / Prohibited. Map every field task into one zone before you act.',
        zone: 'authorized',
      },
    ],
    sourceLabels: [
      { kind: 'California law', text: 'B&P § 2859; 16 CCR § 2518' },
      { kind: 'Federal', text: '42 CFR § 484.115(c)' },
      { kind: 'Agency policy', text: 'LVN authorization matrix & escalation protocol' },
    ],
  },
  {
    id: 1,
    title: 'Authorized Practice: The LVN Competency Constellation',
    subtitle: 'Skills you may perform — with orders, competency, and accountability',
    narration: [
      'California Business & Professions Code § 2859 authorizes LVNs to perform defined nursing services under the direction of a licensed physician or registered nurse. In home health, “general supervision” typically means the supervising RN has reviewed the Plan of Care, is available for consultation, and performs supervisory activities required by regulation and agency policy — physical presence during every visit is not required for all authorized skills.',
      'Common authorized home health skills (when ordered, within competency, and not otherwise restricted) include: vital sign assessment and trending; wound care under established orders (dressing changes, irrigation, measurement and documentation, ostomy care as ordered); medication administration by oral, topical, subcutaneous, and intramuscular routes when authorized; catheter care and catheterization per order and policy; specimen collection; gastric tube feeding management under established protocols; ADL support when clinically indicated; and patient/family education on ordered regimens.',
      'Critical qualifier: LVNs implement a current Plan of Care — they do not independently develop or revise it. If a wound changes and needs a different approach, you document findings, notify the RN, and await updated orders before changing the intervention. You do not independently complete the OASIS comprehensive assessment, formulate nursing diagnoses, prescribe, stage wounds when staging is reserved to the RN/authorized clinician, change medication orders, or make discharge judgments.',
      'Competency is the second pillar. Legal authorization ≠ validated skill. If a skill is legally within LVN scope but not on your agency competency checklist (or you lack current IV certification where required), you must decline and escalate. Knowledge from this module does not replace skills check-offs.',
    ],
    keyPoints: [
      {
        icon: '💉',
        title: 'Medication administration',
        detail:
          'Oral, topical, SQ, IM per order and policy. IV push and central-line management remain outside LVN home-health authority.',
      },
      {
        icon: '🩹',
        title: 'Wound care (implement, not plan)',
        detail:
          'Dressing changes, irrigation, measurement, ostomy care per written orders. New protocol changes and care-plan revisions require RN/physician process.',
      },
      {
        icon: '🩺',
        title: 'Assessment vs evaluation',
        detail:
          'LVNs collect data and assess status. Initial comprehensive evaluation, nursing diagnosis, and POC development/modification are RN-led.',
      },
      {
        icon: '📊',
        title: 'OASIS boundary',
        detail:
          'LVNs may contribute observations under direction. Independent completion of OASIS start-of-care / comprehensive assessment is not LVN scope.',
      },
    ],
    clinicalTip:
      'Three-yes gate before acting: (1) written order / current POC? (2) skill on my validated competency list? (3) patient condition still within expected parameters? Any “no” → stop and call RN.',
    scene: 'competency-constellation',
    hotspots: [
      {
        id: 'wound',
        label: 'Wound care',
        cx: 250,
        cy: 55,
        info: 'Authorized when ordered: dressing change, measure, document. Do not independently stage or redesign the plan.',
        zone: 'authorized',
      },
      {
        id: 'meds',
        label: 'Med admin',
        cx: 380,
        cy: 110,
        info: 'Oral/topical/SQ/IM per order. Never change dose/route/frequency without a new authorized order.',
        zone: 'authorized',
      },
      {
        id: 'vitals',
        label: 'Vital signs',
        cx: 400,
        cy: 220,
        info: 'Assess and trend. Significant variance from baseline → document + escalate per agency protocol.',
        zone: 'authorized',
      },
      {
        id: 'cath',
        label: 'Catheter care',
        cx: 250,
        cy: 285,
        info: 'Per order and competency. Unexpected obstruction, trauma, or infection signs → RN notification.',
        zone: 'authorized',
      },
      {
        id: 'edu',
        label: 'Education',
        cx: 100,
        cy: 220,
        info: 'Teach ordered regimens and reinforce the POC. Do not invent new treatments or discharge plans.',
        zone: 'authorized',
      },
      {
        id: 'spec',
        label: 'Specimens',
        cx: 100,
        cy: 110,
        info: 'Collect specimens per order/protocol. Interpretation that changes the plan remains RN/physician.',
        zone: 'authorized',
      },
    ],
    sourceLabels: [
      { kind: 'California law', text: 'B&P § 2859 authorized vocational nursing services' },
      { kind: 'Agency policy', text: 'Competency checklist & skills matrix' },
      { kind: 'Professional guidance', text: 'Implement POC; do not invent orders' },
    ],
  },
  {
    id: 2,
    title: 'Prohibited Territory: The RN-Only Practice Zone',
    subtitle: 'Hard boundaries — no exceptions for staffing pressure',
    narration: [
      'California’s nursing practice framework draws a hard line between LVN and RN practice because certain functions require the advanced assessment synthesis, independent clinical judgment, and legal accountability conferred by the RN license. These are not bureaucratic niceties — they reflect education, reasoning scope, and liability design.',
      'In home health, RN-only (or physician/advanced practitioner) territory includes: comprehensive initial nursing assessment and start-of-care evaluation; formulation of nursing diagnoses; development, revision, and closure of the nursing Plan of Care; independent OASIS comprehensive assessment completion; IV push medications; blood product administration; PICC/central venous device insertion and management; complex debridement beyond LVN authorization; and clinical triage/decision-making for new, unresolved, or rapidly unstable conditions.',
      'OASIS start-of-care is not “just paperwork.” It is a comprehensive assessment that establishes the clinical baseline, quality measures, and care trajectory for the episode. Completing it requires RN (or other CMS-qualified clinician) accountability. An LVN who independently completes OASIS, stages wounds when staging is reserved, changes medication orders, diagnoses, or makes discharge judgments is practicing outside license.',
      'When you encounter an RN-only need: do not attempt the task even if you believe you have the technical skill. Document findings, notify the supervising RN (or on-call/DON per agency escalation), and communicate what you observed and why escalation is required. That is professional accountability — not a failure of competence.',
    ],
    keyPoints: [
      {
        icon: '🚫',
        title: 'Initial assessment & OASIS',
        detail:
          'Start-of-care comprehensive assessment and independent OASIS completion are not LVN functions. No staffing workaround.',
      },
      {
        icon: '🩸',
        title: 'IV / central lines',
        detail:
          'IV push, transfusions, PICC/central management are outside LVN home-health scope. Do not accept informal workarounds.',
      },
      {
        icon: '🧠',
        title: 'Care plan authority',
        detail:
          'Only authorized clinicians develop/modify/close the POC. LVNs contribute data and implement ordered interventions.',
      },
      {
        icon: '⚠️',
        title: 'Unstable / new conditions',
        detail:
          'Triage and care-planning for unstable change = escalate. Your role: safety measures within orders, document, notify RN.',
      },
    ],
    clinicalTip:
      'If a patient or family asks for an RN-only task, be direct: “That is outside the scope of my license. I am contacting my supervising nurse now to arrange the right care.” Never apologize for scope adherence.',
    scene: 'prohibited-zone-map',
    hotspots: [
      {
        id: 'oasis',
        label: 'OASIS SOC',
        cx: 120,
        cy: 90,
        info: 'PROHIBITED for independent LVN completion. Comprehensive start-of-care assessment requires qualified clinician accountability.',
        zone: 'prohibited',
      },
      {
        id: 'poc',
        label: 'POC develop',
        cx: 250,
        cy: 70,
        info: 'PROHIBITED: developing or modifying the Plan of Care. LVN implements and reports; RN/physician process revises.',
        zone: 'prohibited',
      },
      {
        id: 'dx',
        label: 'Nursing diagnosis',
        cx: 380,
        cy: 90,
        info: 'PROHIBITED: formulating nursing diagnoses. Report objective findings; do not assign diagnostic labels that drive plan changes.',
        zone: 'prohibited',
      },
      {
        id: 'ivpush',
        label: 'IV push / blood',
        cx: 140,
        cy: 220,
        info: 'PROHIBITED in LVN home-health practice. Escalate and protect patient safety within current orders.',
        zone: 'prohibited',
      },
      {
        id: 'picc',
        label: 'PICC / central',
        cx: 250,
        cy: 250,
        info: 'PROHIBITED: PICC insertion/management as LVN. Family LVN license does not create on-site authority for you to facilitate.',
        zone: 'prohibited',
      },
      {
        id: 'dc',
        label: 'Discharge judgment',
        cx: 370,
        cy: 220,
        info: 'PROHIBITED: independent discharge decisions. Contribute observations; authorized clinicians determine discharge.',
        zone: 'prohibited',
      },
    ],
    sourceLabels: [
      { kind: 'California law', text: 'LVN vs RN practice boundaries (B&P framework)' },
      { kind: 'Federal', text: 'Qualified clinician requirements for comprehensive assessment' },
      { kind: 'Clinical judgment', text: 'Escalate; never improvise RN-only acts' },
    ],
  },
  {
    id: 3,
    title: 'Conditional Practice: Supervised & Co-Signature Zone',
    subtitle: 'Skills you perform — but not without RN oversight structures',
    narration: [
      'Between clearly authorized and clearly prohibited work sits the conditional zone: functions LVNs may perform only with defined RN oversight — co-signature, consultation, supervisory visit, or agency-specific gate. Rules here are contextual; agency policy often sets the operational clock and workflow.',
      'In California home health practice, LVN clinical documentation commonly requires RN co-signature as the supervisory review mechanism. The co-signature affirms that documented care is consistent with the Plan of Care and that findings needing evaluation have been recognized. Exact timing windows (for example, same-day vs next-business-day review) are agency policy — not universal free-standing law. Follow your agency’s documented standard; if policy is silent, escalate rather than invent a deadline.',
      'Supervisory structures also include RN availability for consultation and in-home supervisory activities required by federal CoPs and agency policy for skilled services and aide oversight. Treat stated intervals in training materials as guidance that must be reconciled to current agency policy and applicable Medicare CoP requirements — do not invent a personal schedule.',
      'Complex procedures (certain wound technologies, high-risk meds, rarely performed skills) may sit in the conditional zone via the agency authorization matrix even when generically within vocational nursing. When in doubt: assess, document, call before you leave the home if findings are unexpected.',
    ],
    keyPoints: [
      {
        icon: '✍️',
        title: 'Co-signature workflow',
        detail:
          'RN review of LVN documentation is an oversight control. Exact timeframes = agency policy — follow the published standard.',
      },
      {
        icon: '👁️',
        title: 'Supervisory structures',
        detail:
          'RN consultation availability + required supervisory activities per CoP and agency policy. Confirm current intervals in P&P.',
      },
      {
        icon: '📞',
        title: 'Consultation protocol',
        detail:
          'Change from baseline, unexpected finding, or patient-expressed concern → contact supervising RN before leaving when clinically indicated.',
      },
      {
        icon: '📁',
        title: 'Authorization matrix',
        detail:
          'Agency P&P lists conditional procedures and who may perform them after competency. Review at onboarding and annually.',
      },
    ],
    clinicalTip:
      'Write notes as if the co-signing RN will ask: “What did you see? What did you do? Why? What needs follow-up?” Complete documentation protects the patient, the RN, and you.',
    scene: 'conditional-zone',
    hotspots: [
      {
        id: 'cosign',
        label: 'RN co-sign',
        cx: 120,
        cy: 140,
        info: 'Conditional control: documentation review. Time window is agency policy — never skip because you are “experienced.”',
        zone: 'conditional',
      },
      {
        id: 'consult',
        label: 'RN consult',
        cx: 250,
        cy: 90,
        info: 'Unexpected findings → call before improvising. Use on-call/DON if primary RN unreachable (agency escalation).',
        zone: 'conditional',
      },
      {
        id: 'super',
        label: 'Supervisory visit',
        cx: 380,
        cy: 140,
        info: 'In-home supervisory activities follow CoP + agency policy. Purpose is care quality/safety review, not peer gossip.',
        zone: 'conditional',
      },
      {
        id: 'matrix',
        label: 'Auth matrix',
        cx: 250,
        cy: 240,
        info: 'Conditional skills may require extra competency or dual presence. Check matrix before rare procedures.',
        zone: 'conditional',
      },
    ],
    sourceLabels: [
      { kind: 'Agency policy', text: 'Co-signature timeframe & escalation tree' },
      { kind: 'Federal', text: 'Home health supervision / personnel CoPs' },
      { kind: 'California law', text: 'Practice under direction of RN/physician' },
    ],
  },
  {
    id: 4,
    title: 'Delegation Principles: What You May Assign and to Whom',
    subtitle: 'LVN authority over unlicensed personnel — and its strict limits',
    narration: [
      'Delegation is a regulated clinical function. LVNs may assign certain non-nursing assistive tasks to unlicensed personnel such as Home Health Aides — only when conditions are met, and only for tasks that are not reserved nursing acts.',
      'Use a five-check framework before any delegation: (1) the task is within the UAP/HHA authorized role and the patient’s plan; (2) the aide is trained and currently competent for that task; (3) the patient’s condition is stable and predictable; (4) the outcome is reasonably foreseeable; (5) you remain available for supervision and follow-up appropriate to the setting. If any check fails, do not delegate — perform the task yourself or escalate to the RN.',
      'Common home health pattern: HHA performs personal care, bathing, and exercise programs under the plan while the LVN assigns, observes when possible, and documents outcomes. LVNs do not delegate assessment, medication administration (except narrow self-administration frameworks under policy — never casual “they know how”), wound care, IV-related tasks, or any work requiring clinical judgment.',
      'Practical rule: LVNs delegate tasks, not judgment. If correct performance requires a clinical decision — even a small one — the task stays with the licensed nurse. When an HHA reports a finding, the LVN evaluates the information and determines the clinical response.',
    ],
    keyPoints: [
      {
        icon: '✅',
        title: 'Delegatable tasks',
        detail:
          'Personal hygiene, bathing, exercise programs, positioning, ambulation assistance — to trained, competent HHA per plan.',
      },
      {
        icon: '❌',
        title: 'Non-delegatable',
        detail:
          'Assessment, med administration, wound care, IV-related care, clinical decision-making — licensed nurse minimum.',
      },
      {
        icon: '5️⃣',
        title: 'Five-check rule',
        detail:
          'Role scope ✓ | Competency ✓ | Stability ✓ | Predictability ✓ | Supervision available ✓ — all required.',
      },
      {
        icon: '📝',
        title: 'Document delegation',
        detail:
          'Record task, to whom, patient status, and outcome. Silence in the note is a risk, not efficiency.',
      },
    ],
    clinicalTip:
      'Never feel pressured to delegate because of time constraints. If you cannot safely supervise a delegation, perform the task yourself and notify your supervisor about the workload concern.',
    scene: 'delegation-tree',
    hotspots: [
      {
        id: 'c1',
        label: '1 Scope',
        cx: 80,
        cy: 100,
        info: 'Is the task within HHA role and the patient plan? Nursing acts fail this check immediately.',
        zone: 'neutral',
      },
      {
        id: 'c2',
        label: '2 Competency',
        cx: 165,
        cy: 100,
        info: 'Is this aide currently competent for THIS task? Longevity on service ≠ universal competence.',
        zone: 'neutral',
      },
      {
        id: 'c3',
        label: '3 Stability',
        cx: 250,
        cy: 100,
        info: 'Is the patient stable and predictable today? Unstable patients stop delegation.',
        zone: 'conditional',
      },
      {
        id: 'c4',
        label: '4 Predictable',
        cx: 335,
        cy: 100,
        info: 'Is the outcome reasonably foreseeable? High uncertainty → licensed nurse performs.',
        zone: 'neutral',
      },
      {
        id: 'c5',
        label: '5 Supervise',
        cx: 420,
        cy: 100,
        info: 'Are you available for appropriate supervision/follow-up? If not, do not delegate.',
        zone: 'neutral',
      },
      {
        id: 'block',
        label: 'Judgment block',
        cx: 250,
        cy: 240,
        info: 'If the task requires clinical judgment, delegation is inappropriate even when other checks pass.',
        zone: 'prohibited',
      },
    ],
    sourceLabels: [
      { kind: 'California law / BVNPT', text: 'Limits on LVN delegation to UAPs' },
      { kind: 'Agency policy', text: 'HHA assignment & supervision procedures' },
      { kind: 'Professional guidance', text: 'Delegate tasks, never judgment' },
    ],
  },
  {
    id: 5,
    title: 'Scope Violations: Consequences, Reporting & Recovery',
    subtitle: 'What happens when boundaries are crossed — and how to respond',
    narration: [
      'Scope violations create simultaneous regulatory, legal, and institutional risk. Understanding all three is not about fear — it is about making scope adherence a non-negotiable professional standard.',
      'Regulatory: The California Board of Vocational Nursing and Psychiatric Technicians (BVNPT) investigates complaints and may impose discipline ranging from reprimand to probation, suspension, or license revocation. Scope violations causing patient harm are treated with maximum seriousness. Public license records can reflect board actions.',
      'Legal: Performing an act outside your scope — even if you are “technically capable” — is practicing beyond your license. Patient harm can create personal malpractice exposure; professional liability coverage may exclude out-of-scope acts. Agency carriers may also disclaim coverage for unauthorized practice.',
      'Institutional: Agencies conduct incident review, corrective action, and mandatory reporting where required. Federal survey risk attaches when personnel practice outside qualifications (CoP). Self-protection protocol under pressure: refuse clearly → document the request and your refusal → notify supervisor/DON → leave a complete clinical record. Do not silently comply and hope no one notices.',
    ],
    keyPoints: [
      {
        icon: '🏛️',
        title: 'BVNPT discipline',
        detail:
          'Reprimand through revocation. Harm-linked scope violations carry highest license risk.',
      },
      {
        icon: '⚖️',
        title: 'Malpractice exposure',
        detail:
          'Out-of-scope acts may be uninsured. Stay inside license and orders.',
      },
      {
        icon: '📢',
        title: 'Reporting pathways',
        detail:
          'Agency incident systems; board reporting when required; survey implications for CoP personnel standards.',
      },
      {
        icon: '🛡️',
        title: 'Self-protection protocol',
        detail:
          'Refuse → Document → Notify → Clear clinical record. Documentation is your defense.',
      },
    ],
    clinicalTip:
      'If a supervisor or family member pressures an out-of-scope act, state: “I cannot safely perform that within my scope of practice. I will document this and notify my DON.” Then do exactly that.',
    scene: 'consequences-map',
    hotspots: [
      {
        id: 'bvnpt',
        label: 'BVNPT',
        cx: 110,
        cy: 120,
        info: 'California licensing board for LVNs — investigation and discipline authority for scope violations.',
        zone: 'prohibited',
      },
      {
        id: 'civil',
        label: 'Civil risk',
        cx: 250,
        cy: 80,
        info: 'Personal liability risk if patient harm follows out-of-scope practice; coverage may not apply.',
        zone: 'prohibited',
      },
      {
        id: 'agency',
        label: 'Agency action',
        cx: 390,
        cy: 120,
        info: 'Incident report, RCA, corrective action, possible termination, and required external reports.',
        zone: 'conditional',
      },
      {
        id: 'shield',
        label: 'Protect path',
        cx: 250,
        cy: 230,
        info: 'Refuse + document + escalate. Protects patient, license, and organization simultaneously.',
        zone: 'authorized',
      },
    ],
    sourceLabels: [
      { kind: 'California law', text: 'BVNPT disciplinary authority' },
      { kind: 'Federal', text: 'CoP personnel qualification enforcement' },
      { kind: 'Agency policy', text: 'Incident reporting & chain of command' },
    ],
  },
  {
    id: 6,
    title: 'Field Application: Scope Analysis in Real Scenarios',
    subtitle: 'Putting the boundary map to work — case-by-case practice',
    narration: [
      'Clinical competence in scope means rapid, accurate determinations in real field conditions — patient in front of you, family asking questions, status changing. Practice the three-zone analysis on every unexpected request.',
      'Scenario A — Changed wound: You arrive for ordered dressing change and find marked deterioration (depth, extent, malodorous exudate new since last visit). Family wants “more aggressive” products from the bag. Analysis: performing the ordered dressing may be authorized, but significant change requires RN notification before modifying the protocol. Assess and document parameters, call supervising RN, await guidance. Do not redesign wound care or stage beyond your authorized role.',
      'Scenario B — PCA request: Family asks you to adjust morphine PCA because “it keeps beeping and pain is uncontrolled.” Analysis: categorically prohibited. Assess pain, airway, and respiratory status; silence alarm only as device policy allows for safety; document; escalate immediately to RN/physician. Do not change controlled-analgesia programming.',
      'Scenario C — HHA med request: Long-term HHA asks to apply prescribed topical antibiotic “because she knows how.” Analysis: medication application is a nursing act — not delegated casually. Decline, perform the application yourself, document the request and response, and coach the HHA on role limits. Passing a knowledge quiz never replaces observed competency for high-risk skills.',
    ],
    keyPoints: [
      {
        icon: '🔍',
        title: 'Scenario A: changed wound',
        detail:
          'Authorized to assess/document ordered care. Prohibited from modifying orders. Required to escalate change.',
      },
      {
        icon: '💊',
        title: 'Scenario B: PCA adjustment',
        detail:
          'Prohibited. Safety assessment → document → escalate to RN/MD immediately.',
      },
      {
        icon: '🤝',
        title: 'Scenario C: HHA request',
        detail:
          'Topical medication = nursing act. Cannot delegate. Perform, document, explain scope.',
      },
      {
        icon: '🎯',
        title: 'Universal field rule',
        detail:
          'When in doubt → Assess → Document → Escalate. Never improvise outside the authorized zone.',
      },
    ],
    clinicalTip:
      'Field three-question check: (1) Do I have a written order/current POC item? (2) Is this skill on my validated competency list? (3) Is the patient still within expected/stable parameters? All yes → proceed. Any no → stop and call.',
    scene: 'scenario-field-lab',
    hotspots: [
      {
        id: 'sa',
        label: 'A Wound change',
        cx: 100,
        cy: 150,
        info: 'Document + RN call before changing protocol. Implement only ordered care pending guidance.',
        zone: 'conditional',
      },
      {
        id: 'sb',
        label: 'B PCA request',
        cx: 250,
        cy: 150,
        info: 'Refuse adjustment. Assess safety, document, escalate. Medication order changes are not LVN acts.',
        zone: 'prohibited',
      },
      {
        id: 'sc',
        label: 'C HHA meds',
        cx: 400,
        cy: 150,
        info: 'Decline delegation of topical antibiotic. LVN performs and documents teaching about role limits.',
        zone: 'authorized',
      },
      {
        id: 'rule',
        label: '3-question gate',
        cx: 250,
        cy: 260,
        info: 'Order? Competency? Stability? Missing any one → stop / escalate.',
        zone: 'neutral',
      },
    ],
    sourceLabels: [
      { kind: 'Clinical judgment', text: 'Three-zone field analysis' },
      { kind: 'Agency policy', text: 'Escalation & on-call procedures' },
      { kind: 'California law', text: 'Stay within B&P § 2859 authority' },
    ],
  },
];

// ─── QUIZ (balanced A3 B3 C2 D2) ─────────────────────────────────────────────
// correct indices: 0,2,0,1,1,0,2,3,3,1 → A=3 B=3 C=2 D=2

const QUIZ: QuizQuestion[] = [
  {
    id: 0,
    stem: 'An LVN in home health is visiting a patient who has a scheduled wound dressing change. Upon assessment, the LVN notes significant wound deterioration not present at the last visit. What is the PRIORITY action?',
    options: [
      'Document the wound assessment, call the supervising RN, and await updated orders before modifying the intervention',
      'Change the dressing using a more aggressive wound care product from the supply bag',
      'Instruct the family to take the patient to urgent care without notifying the agency',
      'Skip the dressing change and return tomorrow without documenting the change',
    ],
    correct: 0,
    rationale:
      'Significant change from baseline requires RN notification before modifying the care approach. The LVN assesses, documents, and escalates. Redesigning wound care without updated orders exceeds LVN authority (POC development/modification is not an LVN function). Knowledge of this rule is not a substitute for observed wound-care competency sign-off.',
  },
  {
    id: 1,
    stem: 'Which of the following is WITHIN the authorized scope of LVN practice in California home health (assuming order, competency, and policy are met)?',
    options: [
      'Completing the OASIS start-of-care assessment independently',
      'Formulating nursing diagnoses for a newly admitted patient',
      'Administering a scheduled subcutaneous insulin injection per physician order',
      'Initiating IV push medication for breakthrough pain',
    ],
    correct: 2,
    rationale:
      'Subcutaneous medication administration per physician order is within LVN scope when competency and policy allow. Independent OASIS start-of-care completion, nursing diagnosis formulation, and IV push administration are outside LVN home-health authority.',
  },
  {
    id: 2,
    stem: 'Under California home health practice structures, LVN clinical documentation typically requires:',
    options: [
      'RN co-signature within the agency-defined timeframe',
      'Physician counter-signature of every nursing note within 24 hours as a universal statute',
      'No co-signature if the LVN has two or more years of experience',
      'BVNPT review before the note may be filed in the chart',
    ],
    correct: 0,
    rationale:
      'RN co-signature is the standard supervisory review mechanism for LVN documentation in home health. Exact timing is agency policy, not a free pass based on experience. Physician countersignature rules apply to orders, not as a substitute for nursing oversight; BVNPT does not pre-clear visit notes.',
  },
  {
    id: 3,
    stem: 'An LVN considers delegating a task to an HHA. Which condition must be met BEFORE delegation is appropriate?',
    options: [
      'The LVN has worked with the HHA for at least six months',
      'The patient’s condition is stable and predictable',
      'The task requires clinical judgment appropriate to LVN level',
      'The RN has pre-approved each individual minute of the visit',
    ],
    correct: 1,
    rationale:
      'One of the five required delegation conditions is that the patient’s condition is stable and predictable. Tasks requiring clinical judgment are not delegable to unlicensed personnel. Tenure with an aide and blanket RN “pre-approval” of every minute are not substitutes for the five-check framework.',
  },
  {
    id: 4,
    stem: 'A patient’s family member — who is also a licensed LVN — asks to manage the patient’s PICC line during the home visit. The visiting agency LVN should:',
    options: [
      'Allow it since both parties are LVNs and the family knows the patient best',
      'Decline — PICC line management is outside LVN home-health authority and cannot be authorized by informal family license status',
      'Allow it if the family LVN shows a current wallet card',
      'Obtain a verbal physician OK by phone and then hand supplies to the family LVN',
    ],
    correct: 1,
    rationale:
      'PICC/central line management is outside LVN home-health scope. A relative’s LVN license does not create an employment/practice relationship that authorizes the agency LVN to facilitate out-of-scope care. Verbal workarounds do not expand license.',
  },
  {
    id: 5,
    stem: 'Which statement BEST describes the difference between “assessment” (LVN-authorized data collection) and “evaluation” (RN-level care-planning function) in home health?',
    options: [
      'Assessment involves systematic data collection; evaluation interprets data to form diagnoses and modify the care plan',
      'Assessment is faster; evaluation simply takes longer',
      'LVNs may evaluate fully if an RN is somewhere in the county',
      'There is no practical difference in home health documentation',
    ],
    correct: 0,
    rationale:
      'Assessment = systematic data collection (vitals, wound measurements, pain scores, observations). Evaluation that drives nursing diagnoses, POC modification, or discharge decisions requires RN (or other authorized clinician) accountability.',
  },
  {
    id: 6,
    stem: 'An LVN’s supervising RN is unreachable when the LVN discovers a significant unexpected finding during a home visit. What is the APPROPRIATE next action?',
    options: [
      'Proceed without any notification because RN oversight always happens after the visit',
      'Leave immediately without documenting and hope the next nurse notices',
      'Contact the on-call RN or DON using the agency’s emergency escalation protocol',
      'Ask the patient’s family whether they think the finding is serious enough to call 911 only',
    ],
    correct: 2,
    rationale:
      'Agency policy defines emergency escalation when the primary RN is unavailable. Use on-call RN/DON pathways. Do not rely on family clinical judgment as your supervision structure, and do not omit documentation.',
  },
  {
    id: 7,
    stem: 'A supervisor tells an LVN that due to short-staffing, the LVN must complete the OASIS start-of-care assessment independently today. The LVN should:',
    options: [
      'Complete the OASIS to help the team — it is only data entry',
      'Complete comfortable sections and leave the rest blank for later',
      'Ask the patient to complete clinical OASIS items from memory',
      'Decline clearly, document the request and refusal, and escalate to the DON',
    ],
    correct: 3,
    rationale:
      'Independent OASIS start-of-care / comprehensive assessment completion is not an LVN function. Staffing pressure never authorizes a scope violation. Decline, document, and escalate. Quiz knowledge ≠ practical authorization to perform comprehensive assessment.',
  },
  {
    id: 8,
    stem: 'Which body has authority to investigate LVN scope-of-practice violations in California and impose license discipline, including revocation?',
    options: [
      'California Department of Public Health (CDPH) alone as the LVN licensing board',
      'California Board of Registered Nursing (BRN) for all nursing licenses including LVN',
      'Centers for Medicare & Medicaid Services (CMS) as the day-to-day LVN licensing board',
      'California Board of Vocational Nursing and Psychiatric Technicians (BVNPT)',
    ],
    correct: 3,
    rationale:
      'BVNPT is the California licensing authority for LVNs and may investigate and discipline. CDPH regulates health facilities/agencies; BRN regulates RNs; CMS oversees federal CoP compliance — none of those replace BVNPT as the LVN licensing board.',
  },
  {
    id: 9,
    stem: 'Under the five-check delegation framework, which scenario makes delegation to an HHA INAPPROPRIATE even if other conditions appear met?',
    options: [
      'The patient has been on service for less than 30 days',
      'Completing the task correctly requires the HHA to make a clinical judgment',
      'The LVN will be in the home at the time of the task',
      'The patient prefers the HHA to perform the task',
    ],
    correct: 1,
    rationale:
      'Delegation covers tasks, not judgment. If performance requires clinical assessment or decision-making, the task stays with the licensed nurse regardless of patient preference, length of stay, or LVN presence.',
  },
];

// Verify distribution at module load (dev safety)
const _dist = QUIZ.reduce(
  (acc, q) => {
    acc[q.correct] = (acc[q.correct] || 0) + 1;
    return acc;
  },
  {} as Record<number, number>,
);
if (typeof console !== 'undefined') {
  // A3 B3 C2 D2 expected
  void _dist;
}

// ─── STYLES ─────────────────────────────────────────────────────────────────

const shell: React.CSSProperties = {
  fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
  color: '#E5E7EB',
  background: '#0B1020',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
};

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: 14,
};

// ─── SCENE COMPONENTS ───────────────────────────────────────────────────────

function FeedbackBanner({
  title,
  body,
  zone,
}: {
  title: string;
  body: string;
  zone?: Hotspot['zone'];
}) {
  const colors: Record<string, string> = {
    authorized: '#10B981',
    conditional: '#F59E0B',
    prohibited: '#EF4444',
    neutral: '#8B5CF6',
  };
  const c = colors[zone || 'neutral'];
  return (
    <div
      style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 12,
        background: 'rgba(15,23,42,0.94)',
        border: `1px solid ${c}`,
        borderRadius: 10,
        padding: '10px 12px',
        boxShadow: `0 0 24px ${c}33`,
        zIndex: 5,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800, color: c, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, lineHeight: 1.45, color: '#E5E7EB' }}>{body}</div>
    </div>
  );
}

function HotspotDot({
  hs,
  active,
  onSelect,
  pulse,
}: {
  hs: Hotspot;
  active: boolean;
  onSelect: (id: string) => void;
  pulse?: boolean;
}) {
  const zoneColor: Record<string, string> = {
    authorized: '#10B981',
    conditional: '#F59E0B',
    prohibited: '#EF4444',
    neutral: '#A78BFA',
  };
  const fill = zoneColor[hs.zone || 'neutral'];
  return (
    <g
      onClick={() => onSelect(hs.id)}
      style={{ cursor: 'pointer' }}
      role="button"
      aria-label={hs.label}
    >
      <circle
        cx={hs.cx}
        cy={hs.cy}
        r={(hs.r || 16) + (active ? 4 : 0)}
        fill={`${fill}33`}
        stroke={fill}
        strokeWidth={active ? 3 : 2}
      >
        {pulse ? (
          <animate attributeName="r" values="14;20;14" dur="2.2s" repeatCount="indefinite" />
        ) : null}
      </circle>
      <circle cx={hs.cx} cy={hs.cy} r={5} fill={fill} />
      <text
        x={hs.cx}
        y={hs.cy + 28}
        textAnchor="middle"
        fill="#F8FAFC"
        fontSize={10}
        fontWeight={700}
      >
        {hs.label}
      </text>
    </g>
  );
}

function SceneFrame({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 360,
        background:
          'radial-gradient(ellipse at 30% 20%, rgba(124,58,237,0.25), transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(79,70,229,0.2), transparent 45%), #0F172A',
        borderRadius: 16,
        border: '1px solid rgba(167,139,250,0.25)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 12,
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 0.6,
          color: '#C4B5FD',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function LicenseAuthorityScene({
  hotspots,
  activeId,
  onSelect,
}: {
  hotspots: Hotspot[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const active = hotspots.find((h) => h.id === activeId);
  return (
    <SceneFrame title="Scope Boundary Stack">
      <svg viewBox="0 0 500 320" width="100%" height="100%" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="stackGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {/* Authority pillars */}
        <rect x="40" y="50" width="140" height="200" rx="12" fill="url(#stackGrad)" opacity="0.35" />
        <rect x="180" y="50" width="140" height="200" rx="12" fill="#1E293B" stroke="#6366F1" />
        <rect x="320" y="50" width="140" height="200" rx="12" fill="#1E293B" stroke="#10B981" />
        <text x="110" y="75" textAnchor="middle" fill="#DDD6FE" fontSize="11" fontWeight="700">
          Law
        </text>
        <text x="250" y="75" textAnchor="middle" fill="#A5B4FC" fontSize="11" fontWeight="700">
          Federal CoP
        </text>
        <text x="390" y="75" textAnchor="middle" fill="#6EE7B7" fontSize="11" fontWeight="700">
          Agency + Zones
        </text>
        {/* Connecting flow */}
        <path
          d="M110 180 H390"
          stroke="#A78BFA"
          strokeWidth="2"
          strokeDasharray="6 4"
          fill="none"
        >
          <animate attributeName="stroke-dashoffset" values="0;20" dur="2s" repeatCount="indefinite" />
        </path>
        <text x="250" y="300" textAnchor="middle" fill="#94A3B8" fontSize="10">
          Tap markers — stricter rule wins when layers differ
        </text>
        {hotspots.map((hs) => (
          <HotspotDot key={hs.id} hs={hs} active={activeId === hs.id} onSelect={onSelect} pulse />
        ))}
      </svg>
      {active && <FeedbackBanner title={active.label} body={active.info} zone={active.zone} />}
    </SceneFrame>
  );
}

function CompetencyConstellationScene({
  hotspots,
  activeId,
  onSelect,
}: {
  hotspots: Hotspot[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const active = hotspots.find((h) => h.id === activeId);
  const cx = 250;
  const cy = 160;
  return (
    <SceneFrame title="Authorized Skill Constellation">
      <svg viewBox="0 0 500 320" width="100%" height="100%" style={{ display: 'block' }}>
        <circle cx={cx} cy={cy} r="36" fill="#7C3AED" opacity="0.9" />
        <text x={cx} y={cy + 4} textAnchor="middle" fill="white" fontSize="12" fontWeight="800">
          LVN
        </text>
        {hotspots.map((hs, i) => (
          <g key={hs.id}>
            <line
              x1={cx}
              y1={cy}
              x2={hs.cx}
              y2={hs.cy}
              stroke="#34D399"
              strokeWidth="1.5"
              opacity="0.55"
            >
              <animate
                attributeName="opacity"
                values="0.25;0.8;0.25"
                dur={`${2 + (i % 3)}s`}
                repeatCount="indefinite"
              />
            </line>
            <HotspotDot hs={hs} active={activeId === hs.id} onSelect={onSelect} pulse />
          </g>
        ))}
        <text x="250" y="310" textAnchor="middle" fill="#94A3B8" fontSize="10">
          Green zone = implement with order + competency — not invent
        </text>
      </svg>
      {active && <FeedbackBanner title={active.label} body={active.info} zone={active.zone} />}
    </SceneFrame>
  );
}

function ProhibitedZoneScene({
  hotspots,
  activeId,
  onSelect,
}: {
  hotspots: Hotspot[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const active = hotspots.find((h) => h.id === activeId);
  return (
    <SceneFrame title="RN-Only / Prohibited Map">
      <svg viewBox="0 0 500 320" width="100%" height="100%" style={{ display: 'block' }}>
        <rect
          x="50"
          y="45"
          width="400"
          height="230"
          rx="16"
          fill="rgba(239,68,68,0.08)"
          stroke="#EF4444"
          strokeDasharray="8 6"
        >
          <animate
            attributeName="stroke-opacity"
            values="0.4;1;0.4"
            dur="1.8s"
            repeatCount="indefinite"
          />
        </rect>
        <text x="250" y="38" textAnchor="middle" fill="#FCA5A5" fontSize="12" fontWeight="800">
          DO NOT CROSS — license boundary
        </text>
        {/* Barrier bars */}
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={80 + i * 90}
            y="160"
            width="50"
            height="10"
            rx="3"
            fill="#EF4444"
            opacity="0.7"
          />
        ))}
        {hotspots.map((hs) => (
          <HotspotDot key={hs.id} hs={hs} active={activeId === hs.id} onSelect={onSelect} pulse />
        ))}
        <text x="250" y="300" textAnchor="middle" fill="#94A3B8" fontSize="10">
          Staffing pressure never rewrites B&P § 2859 or CoPs
        </text>
      </svg>
      {active && <FeedbackBanner title={active.label} body={active.info} zone={active.zone} />}
    </SceneFrame>
  );
}

function ConditionalZoneScene({
  hotspots,
  activeId,
  onSelect,
}: {
  hotspots: Hotspot[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const active = hotspots.find((h) => h.id === activeId);
  return (
    <SceneFrame title="Conditional Oversight Circuit">
      <svg viewBox="0 0 500 320" width="100%" height="100%" style={{ display: 'block' }}>
        <rect x="70" y="60" width="360" height="180" rx="18" fill="rgba(245,158,11,0.08)" stroke="#F59E0B" />
        <path
          d="M120 140 C180 60, 320 60, 380 140 C320 220, 180 220, 120 140"
          fill="none"
          stroke="#FBBF24"
          strokeWidth="2"
          strokeDasharray="5 5"
        >
          <animate attributeName="stroke-dashoffset" values="0;30" dur="2.5s" repeatCount="indefinite" />
        </path>
        <circle cx="250" cy="140" r="28" fill="#78350F" stroke="#F59E0B" strokeWidth="2" />
        <text x="250" y="144" textAnchor="middle" fill="#FDE68A" fontSize="10" fontWeight="800">
          LVN+RN
        </text>
        {hotspots.map((hs) => (
          <HotspotDot key={hs.id} hs={hs} active={activeId === hs.id} onSelect={onSelect} pulse />
        ))}
        <text x="250" y="300" textAnchor="middle" fill="#94A3B8" fontSize="10">
          Amber = proceed only with required oversight controls
        </text>
      </svg>
      {active && <FeedbackBanner title={active.label} body={active.info} zone={active.zone} />}
    </SceneFrame>
  );
}

function DelegationTreeScene({
  hotspots,
  activeId,
  onSelect,
}: {
  hotspots: Hotspot[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const active = hotspots.find((h) => h.id === activeId);
  return (
    <SceneFrame title="Five-Check Delegation Gate">
      <svg viewBox="0 0 500 320" width="100%" height="100%" style={{ display: 'block' }}>
        <rect x="30" y="55" width="440" height="90" rx="12" fill="rgba(99,102,241,0.12)" stroke="#818CF8" />
        <text x="250" y="48" textAnchor="middle" fill="#C7D2FE" fontSize="11" fontWeight="700">
          All five checks must pass
        </text>
        {/* Flow arrow to outcome */}
        <path d="M250 150 L250 200" stroke="#A78BFA" strokeWidth="3" markerEnd="url(#arrow)" />
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#A78BFA" />
          </marker>
        </defs>
        <rect x="150" y="205" width="200" height="50" rx="10" fill="rgba(16,185,129,0.15)" stroke="#10B981" />
        <text x="250" y="235" textAnchor="middle" fill="#6EE7B7" fontSize="12" fontWeight="700">
          Delegate task only
        </text>
        <rect x="150" y="265" width="200" height="28" rx="8" fill="rgba(239,68,68,0.15)" stroke="#EF4444" />
        <text x="250" y="284" textAnchor="middle" fill="#FCA5A5" fontSize="11" fontWeight="700">
          Never delegate judgment
        </text>
        {hotspots.map((hs) => (
          <HotspotDot key={hs.id} hs={hs} active={activeId === hs.id} onSelect={onSelect} pulse />
        ))}
      </svg>
      {active && <FeedbackBanner title={active.label} body={active.info} zone={active.zone} />}
    </SceneFrame>
  );
}

function ConsequencesMapScene({
  hotspots,
  activeId,
  onSelect,
}: {
  hotspots: Hotspot[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const active = hotspots.find((h) => h.id === activeId);
  return (
    <SceneFrame title="Violation Impact Triangle">
      <svg viewBox="0 0 500 320" width="100%" height="100%" style={{ display: 'block' }}>
        <polygon
          points="250,50 420,240 80,240"
          fill="rgba(239,68,68,0.08)"
          stroke="#F87171"
          strokeWidth="2"
        />
        <circle cx="250" cy="160" r="40" fill="#7C3AED" opacity="0.85" />
        <text x="250" y="156" textAnchor="middle" fill="white" fontSize="11" fontWeight="800">
          Scope
        </text>
        <text x="250" y="172" textAnchor="middle" fill="white" fontSize="11" fontWeight="800">
          breach
        </text>
        {hotspots.map((hs) => (
          <HotspotDot key={hs.id} hs={hs} active={activeId === hs.id} onSelect={onSelect} pulse />
        ))}
        <text x="250" y="300" textAnchor="middle" fill="#94A3B8" fontSize="10">
          Regulatory · Civil · Institutional — protect with refuse/document/escalate
        </text>
      </svg>
      {active && <FeedbackBanner title={active.label} body={active.info} zone={active.zone} />}
    </SceneFrame>
  );
}

function ScenarioFieldLabScene({
  hotspots,
  activeId,
  onSelect,
}: {
  hotspots: Hotspot[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const active = hotspots.find((h) => h.id === activeId);
  const panels = [
    { x: 40, label: 'A', color: '#F59E0B', title: 'Wound' },
    { x: 190, label: 'B', color: '#EF4444', title: 'PCA' },
    { x: 340, label: 'C', color: '#10B981', title: 'HHA' },
  ];
  return (
    <SceneFrame title="Field Scenario Lab">
      <svg viewBox="0 0 500 320" width="100%" height="100%" style={{ display: 'block' }}>
        {panels.map((p) => (
          <g key={p.label}>
            <rect
              x={p.x}
              y="70"
              width="120"
              height="120"
              rx="14"
              fill={`${p.color}22`}
              stroke={p.color}
              strokeWidth="2"
            />
            <text x={p.x + 60} y="100" textAnchor="middle" fill={p.color} fontSize="22" fontWeight="800">
              {p.label}
            </text>
            <text x={p.x + 60} y="125" textAnchor="middle" fill="#E2E8F0" fontSize="12" fontWeight="700">
              {p.title}
            </text>
          </g>
        ))}
        <rect x="120" y="230" width="260" height="40" rx="10" fill="rgba(124,58,237,0.2)" stroke="#A78BFA" />
        <text x="250" y="255" textAnchor="middle" fill="#DDD6FE" fontSize="12" fontWeight="700">
          Order · Competency · Stability
        </text>
        {hotspots.map((hs) => (
          <HotspotDot key={hs.id} hs={hs} active={activeId === hs.id} onSelect={onSelect} pulse />
        ))}
      </svg>
      {active && <FeedbackBanner title={active.label} body={active.info} zone={active.zone} />}
    </SceneFrame>
  );
}

function renderScene(
  scene: string,
  hotspots: Hotspot[],
  activeId: string | null,
  onSelect: (id: string) => void,
) {
  switch (scene) {
    case 'license-authority':
      return <LicenseAuthorityScene hotspots={hotspots} activeId={activeId} onSelect={onSelect} />;
    case 'competency-constellation':
      return (
        <CompetencyConstellationScene hotspots={hotspots} activeId={activeId} onSelect={onSelect} />
      );
    case 'prohibited-zone-map':
      return <ProhibitedZoneScene hotspots={hotspots} activeId={activeId} onSelect={onSelect} />;
    case 'conditional-zone':
      return <ConditionalZoneScene hotspots={hotspots} activeId={activeId} onSelect={onSelect} />;
    case 'delegation-tree':
      return <DelegationTreeScene hotspots={hotspots} activeId={activeId} onSelect={onSelect} />;
    case 'consequences-map':
      return <ConsequencesMapScene hotspots={hotspots} activeId={activeId} onSelect={onSelect} />;
    case 'scenario-field-lab':
      return <ScenarioFieldLabScene hotspots={hotspots} activeId={activeId} onSelect={onSelect} />;
    default:
      return (
        <SceneFrame title="Instructional scene">
          <div style={{ padding: 24, color: '#FCA5A5' }}>Scene configuration missing for: {scene}</div>
        </SceneFrame>
      );
  }
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

const LVN002ScopeOfPractice: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(true);

  const page = PAGES[currentPage];

  useEffect(() => {
    setActiveHotspot(null);
  }, [currentPage, quizMode]);

  const score = useMemo(() => {
    if (!quizSubmitted) return 0;
    const correctCount = QUIZ.reduce(
      (n, q, i) => n + (quizAnswers[i] === q.correct ? 1 : 0),
      0,
    );
    return Math.round((correctCount / QUIZ.length) * 100);
  }, [quizAnswers, quizSubmitted]);

  const passed = score >= MODULE_META.passing;
  const answeredCount = Object.keys(quizAnswers).length;
  const progressPct = quizMode
    ? 100
    : Math.round(((currentPage + 1) / PAGES.length) * 100);

  const selectHotspot = (id: string) => {
    setActiveHotspot((prev) => (prev === id ? null : id));
  };

  const restartModule = () => {
    setQuizSubmitted(false);
    setQuizAnswers({});
    setQuizMode(false);
    setCurrentPage(0);
    setActiveHotspot(null);
    setReviewOpen(true);
  };

  const retryQuiz = () => {
    setQuizSubmitted(false);
    setQuizAnswers({});
    setReviewOpen(true);
  };

  // ─── QUIZ UI ────────────────────────────────────────────────────────────
  if (quizMode) {
    if (quizSubmitted) {
      return (
        <div style={shell}>
          <header
            style={{
              padding: '16px 20px',
              background: MODULE_META.gradient,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>LVN-002 · Knowledge Assessment Results</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>
                Knowledge only — not practical competency certification
              </div>
            </div>
            <div style={{ fontWeight: 800, fontSize: 22 }}>{score}%</div>
          </header>

          <main style={{ flex: 1, padding: 20, maxWidth: 900, margin: '0 auto', width: '100%' }}>
            <div
              style={{
                ...card,
                textAlign: 'center',
                marginBottom: 16,
                borderColor: passed ? 'rgba(16,185,129,0.5)' : 'rgba(245,158,11,0.5)',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>{passed ? '✓' : '↻'}</div>
              <h2 style={{ margin: '0 0 8px', color: '#F8FAFC' }}>
                {passed ? 'Knowledge Check Passed' : 'Review & Retry'}
              </h2>
              <p style={{ margin: 0, color: '#CBD5E1', fontSize: 14, lineHeight: 1.5 }}>
                {passed
                  ? `You scored ${score}% (pass threshold ${MODULE_META.passing}%). This validates knowledge of LVN scope boundaries only. Observed demonstration, skills check-offs, and authorized sign-off remain separate requirements for practical competency.`
                  : `Score ${score}% is below the ${MODULE_META.passing}% knowledge pass threshold. Review rationales and module pages, then retry the assessment.`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setReviewOpen((v) => !v)}
              style={{
                marginBottom: 12,
                padding: '8px 14px',
                background: 'rgba(124,58,237,0.25)',
                color: '#E9D5FF',
                border: '1px solid #7C3AED',
                borderRadius: 8,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {reviewOpen ? 'Hide' : 'Show'} answer review
            </button>

            {reviewOpen &&
              QUIZ.map((q, i) => {
                const ua = quizAnswers[i];
                const ok = ua === q.correct;
                return (
                  <div
                    key={q.id}
                    style={{
                      ...card,
                      marginBottom: 10,
                      borderColor: ok ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)',
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 6, color: '#F1F5F9' }}>
                      {i + 1}. {q.stem}
                    </div>
                    <div style={{ fontSize: 13, color: ok ? '#6EE7B7' : '#FCA5A5' }}>
                      Your answer: {typeof ua === 'number' ? q.options[ua] : '(not answered)'}
                    </div>
                    {!ok && (
                      <div style={{ fontSize: 13, color: '#6EE7B7', marginTop: 4 }}>
                        Correct: {q.options[q.correct]}
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 8, lineHeight: 1.45 }}>
                      <strong style={{ color: '#C4B5FD' }}>Rationale:</strong> {q.rationale}
                    </div>
                  </div>
                );
              })}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
              {!passed && (
                <button
                  type="button"
                  onClick={retryQuiz}
                  style={{
                    padding: '12px 24px',
                    background: '#7C3AED',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Retry Quiz
                </button>
              )}
              <button
                type="button"
                onClick={restartModule}
                style={{
                  padding: '12px 24px',
                  background: passed ? '#059669' : '#334155',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {passed ? 'Review Module Again' : 'Restart Module'}
              </button>
            </div>
          </main>
        </div>
      );
    }

    return (
      <div style={shell}>
        <header style={{ padding: '16px 20px', background: MODULE_META.gradient }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>LVN-002 — Knowledge Assessment</div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>
            10 questions · {MODULE_META.passing}% pass · scope knowledge only (not skills sign-off)
          </div>
        </header>
        <main style={{ flex: 1, padding: 20, maxWidth: 900, margin: '0 auto', width: '100%' }}>
          {QUIZ.map((q, i) => (
            <div key={q.id} style={{ ...card, marginBottom: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#F8FAFC' }}>
                {i + 1}. {q.stem}
              </div>
              {q.options.map((opt, oi) => {
                const selected = quizAnswers[i] === oi;
                const letter = String.fromCharCode(65 + oi);
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => setQuizAnswers((prev) => ({ ...prev, [i]: oi }))}
                    style={{
                      display: 'flex',
                      width: '100%',
                      textAlign: 'left',
                      gap: 10,
                      padding: '10px 12px',
                      marginBottom: 6,
                      borderRadius: 8,
                      cursor: 'pointer',
                      border: `1px solid ${selected ? '#7C3AED' : 'rgba(255,255,255,0.1)'}`,
                      background: selected ? 'rgba(124,58,237,0.28)' : 'rgba(255,255,255,0.03)',
                      color: '#E5E7EB',
                      fontSize: 13,
                      lineHeight: 1.4,
                    }}
                  >
                    <span
                      style={{
                        minWidth: 22,
                        height: 22,
                        borderRadius: 6,
                        background: selected ? '#7C3AED' : '#334155',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 11,
                      }}
                    >
                      {letter}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          ))}
          <button
            type="button"
            disabled={answeredCount < QUIZ.length}
            onClick={() => {
              if (answeredCount === QUIZ.length) setQuizSubmitted(true);
            }}
            style={{
              width: '100%',
              padding: 16,
              background: answeredCount === QUIZ.length ? '#7C3AED' : '#374151',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontWeight: 800,
              cursor: answeredCount === QUIZ.length ? 'pointer' : 'not-allowed',
              fontSize: 16,
              marginTop: 8,
            }}
          >
            Submit Assessment ({answeredCount}/{QUIZ.length} answered)
          </button>
          <button
            type="button"
            onClick={() => setQuizMode(false)}
            style={{
              marginTop: 10,
              background: 'transparent',
              border: '1px solid #475569',
              color: '#94A3B8',
              borderRadius: 8,
              padding: '8px 14px',
              cursor: 'pointer',
            }}
          >
            ← Back to content
          </button>
        </main>
      </div>
    );
  }

  // ─── CONTENT UI ─────────────────────────────────────────────────────────
  return (
    <LvnGaoPlayer
      pages={PAGES}
      pageIndex={currentPage}
      onSelectPage={(index) => {
        setCurrentPage(index);
        setActiveHotspot(null);
      }}
      onPrevious={() => {
        setCurrentPage((p) => Math.max(0, p - 1));
        setActiveHotspot(null);
      }}
      onNext={() => {
        if (currentPage < PAGES.length - 1) {
          setCurrentPage((p) => p + 1);
          setActiveHotspot(null);
        } else {
          setQuizMode(true);
        }
      }}
      nextLabel={currentPage < PAGES.length - 1 ? 'Next Lesson →' : 'Take Quiz →'}
      renderLeft={(currentPageData) => (
        <>
          <div style={{ fontSize: 11, color: '#A78BFA', fontWeight: 700, marginBottom: 6 }}>
            Page {currentPage + 1} of {PAGES.length}
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: 22, lineHeight: 1.25, color: '#F8FAFC' }}>
            {currentPageData.title}
          </h1>
          <p style={{ margin: '0 0 14px', color: '#C4B5FD', fontSize: 14 }}>{currentPageData.subtitle}</p>

          {currentPageData.narration.map((para, i) => (
            <p
              key={i}
              style={{
                margin: '0 0 12px',
                fontSize: 14,
                lineHeight: 1.6,
                color: '#D1D5DB',
              }}
            >
              {para}
            </p>
          ))}

          <h3 style={{ margin: '18px 0 10px', fontSize: 13, color: '#A78BFA', letterSpacing: 0.4 }}>
            KEY POINTS
          </h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {currentPageData.keyPoints.map((kp) => (
              <div key={kp.title} style={{ ...card, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18 }} aria-hidden>
                  {kp.icon}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#F1F5F9' }}>{kp.title}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.45 }}>{kp.detail}</div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 12,
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.35)',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: '#6EE7B7', marginBottom: 4 }}>
              CLINICAL TIP
            </div>
            <div style={{ fontSize: 13, color: '#D1FAE5', lineHeight: 1.5 }}>{currentPageData.clinicalTip}</div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {currentPageData.sourceLabels.map((s) => (
              <span
                key={s.kind + s.text}
                style={{
                  fontSize: 10,
                  padding: '4px 8px',
                  borderRadius: 99,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#CBD5E1',
                }}
              >
                <strong style={{ color: '#C4B5FD' }}>{s.kind}:</strong> {s.text}
              </span>
            ))}
          </div>
        </>
      )}
      renderRight={(currentPageData) => (
        <>
          <div style={{ flex: 1, minHeight: 360 }}>
            {renderScene(currentPageData.scene, currentPageData.hotspots, activeHotspot, selectHotspot)}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: '#64748B', textAlign: 'center' }}>
            Interactive hotspots reveal zone-specific instructional feedback
          </div>
        </>
      )}
    />
  );

  return (
    <div style={shell}>
      <header
        style={{
          padding: '12px 16px',
          background: MODULE_META.gradient,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>
            {MODULE_META.id} | {MODULE_META.title}
          </div>
          <div style={{ fontSize: 11, opacity: 0.92 }}>
            v{MODULE_META.version} · {MODULE_META.track} · {MODULE_META.cms} · {MODULE_META.policy}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {PAGES.map((_, i) => (
            <button
              key={i}
              type="button"
              title={`Page ${i + 1}`}
              onClick={() => setCurrentPage(i)}
              style={{
                width: i === currentPage ? 18 : 8,
                height: 8,
                borderRadius: 99,
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                background: i === currentPage ? '#F8FAFC' : i < currentPage ? '#A78BFA' : 'rgba(255,255,255,0.35)',
                transition: 'all 0.2s',
              }}
            />
          ))}
          <span style={{ fontSize: 11, fontWeight: 700, marginLeft: 6 }}>{progressPct}%</span>
        </div>
      </header>

      {/* progress bar */}
      <div style={{ height: 3, background: '#1E293B' }}>
        <div
          style={{
            height: '100%',
            width: `${progressPct}%`,
            background: 'linear-gradient(90deg,#A78BFA,#34D399)',
            transition: 'width 0.25s',
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 55fr) minmax(0, 45fr)',
          gap: 0,
          minHeight: 0,
        }}
        className="lvn002-split"
      >
        {/* LEFT */}
        <section
          style={{
            padding: '18px 20px 88px',
            overflow: 'auto',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            background: 'linear-gradient(180deg, #0B1020 0%, #111827 100%)',
          }}
        >
          <div style={{ fontSize: 11, color: '#A78BFA', fontWeight: 700, marginBottom: 6 }}>
            Page {currentPage + 1} of {PAGES.length}
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: 22, lineHeight: 1.25, color: '#F8FAFC' }}>
            {page.title}
          </h1>
          <p style={{ margin: '0 0 14px', color: '#C4B5FD', fontSize: 14 }}>{page.subtitle}</p>

          {page.narration.map((para, i) => (
            <p
              key={i}
              style={{
                margin: '0 0 12px',
                fontSize: 14,
                lineHeight: 1.6,
                color: '#D1D5DB',
              }}
            >
              {para}
            </p>
          ))}

          <h3 style={{ margin: '18px 0 10px', fontSize: 13, color: '#A78BFA', letterSpacing: 0.4 }}>
            KEY POINTS
          </h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {page.keyPoints.map((kp) => (
              <div key={kp.title} style={{ ...card, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18 }} aria-hidden>
                  {kp.icon}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#F1F5F9' }}>{kp.title}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.45 }}>{kp.detail}</div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 12,
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.35)',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: '#6EE7B7', marginBottom: 4 }}>
              CLINICAL TIP
            </div>
            <div style={{ fontSize: 13, color: '#D1FAE5', lineHeight: 1.5 }}>{page.clinicalTip}</div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {page.sourceLabels.map((s) => (
              <span
                key={s.kind + s.text}
                style={{
                  fontSize: 10,
                  padding: '4px 8px',
                  borderRadius: 99,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#CBD5E1',
                }}
              >
                <strong style={{ color: '#C4B5FD' }}>{s.kind}:</strong> {s.text}
              </span>
            ))}
          </div>
        </section>

        {/* RIGHT */}
        <section
          style={{
            padding: '16px',
            background: '#020617',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 400,
          }}
        >
          <div style={{ flex: 1, minHeight: 360 }}>
            {renderScene(page.scene, page.hotspots, activeHotspot, selectHotspot)}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: '#64748B', textAlign: 'center' }}>
            Interactive hotspots reveal zone-specific instructional feedback
          </div>
        </section>
      </div>

      {/* FOOTER NAV */}
      <footer
        style={{
          position: 'sticky',
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '12px 16px',
          background: 'rgba(15,23,42,0.96)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          disabled={currentPage === 0}
          style={{
            padding: '8px 18px',
            background: currentPage === 0 ? '#374151' : '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          ← Prev
        </button>
        <div style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center' }}>
          {MODULE_META.cms} · {MODULE_META.policy}
          <div style={{ color: '#64748B' }}>
            Status: {MODULE_META.status}
          </div>
        </div>
        {currentPage < PAGES.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentPage((p) => p + 1)}
            style={{
              padding: '8px 18px',
              background: '#7C3AED',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setQuizMode(true)}
            style={{
              padding: '8px 18px',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Take Quiz ✓
          </button>
        )}
      </footer>

      <style>{`
        @media (max-width: 960px) {
          .lvn002-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LVN002ScopeOfPractice;
