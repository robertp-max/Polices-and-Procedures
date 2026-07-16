/**
 * LVN-009 — Pain Assessment & Management
 * Care Indeed LMS | SC04-pattern standalone module
 * Version: 5.0 | Status: CONTENT COMPLETE — MIGRATION/TECH QA PENDING
 * Record: 6a558c693463cd690af8d634
 * Regulatory: 42 CFR § 484.60 | Policy: CL-SD-014
 * Pages: 7 | Quiz: 10 | Pass: 80%
 *
 * Scope note: LVN assesses, documents, implements ordered interventions,
 * reassesses, and reports pain within LVN scope. LVN does NOT independently
 * change medication orders, modify the Plan of Care, diagnose, or prescribe.
 * Passing this quiz validates knowledge only — not practical competency alone.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LVNLessonNavigation, LVNNarrationFooter } from './shared/LVNModuleShell';

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface HotspotInfo {
  id: string;
  label: string;
  detail: string;
}

interface PageData {
  id: number;
  title: string;
  subtitle: string;
  paragraphs: string[];
  keyPoints: string[];
  clinicalTip: string;
  decisionFrame: string[];
  scopeNote?: string;
}

interface QuizQuestion {
  id: number;
  stem: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  rationale: string;
}

// ─── MODULE META ─────────────────────────────────────────────────────────────

const MODULE_META = {
  id: 'LVN-009',
  title: 'Pain Assessment & Management',
  track: 'LVN — Licensed Vocational Nurse',
  version: '5.0',
  status: 'CONTENT COMPLETE — MIGRATION/TECH QA PENDING',
  pages: 7,
  passing: 80,
  quizCount: 10,
  cms: '42 CFR § 484.60',
  policy: 'CL-SD-014 — Pain Assessment & Management',
  estimatedMinutes: 35,
  competencyMethod: 'Case study + observed demonstration (separate from quiz)',
};

const THEME = {
  primary: '#7C3AED',
  primaryDark: '#5B21B6',
  secondary: '#F5F3FF',
  accent: '#F59E0B',
  dark: '#1E293B',
  muted: '#64748B',
  success: '#10B981',
  danger: '#DC2626',
  warn: '#F97316',
  info: '#3B82F6',
  bg: '#FAF5FF',
  white: '#FFFFFF',
  border: '#E9D5FF',
};

// ─── PAGE CONTENT (Level 5 corrected) ────────────────────────────────────────

const PAGES: PageData[] = [
  {
    id: 1,
    title: 'Pain as the Fifth Vital Sign',
    subtitle: 'Assess · Document · Address at every visit',
    paragraphs: [
      'Welcome to Module LVN-009: Pain Assessment & Management. Pain assessment and management is a fundamental component of every home health visit at Care Indeed Home Health Care. Under agency policy CL-SD-014 (Pain Assessment & Management), Care Indeed treats pain as the fifth vital sign—assessed, documented, and addressed at every patient encounter. CMS addresses pain management in the context of the plan of care under 42 CFR § 484.60, requiring that patients receive services in accordance with a plan of care that addresses identified needs, including pain management when applicable.',
      'Pain in home health is often multifactorial. Many patients experience pain related to their primary diagnosis, comorbid conditions, or procedures performed during visits. Uncontrolled pain can impair mobility, disrupt sleep, increase fall risk, reduce appetite, contribute to mood changes, and limit participation in care and rehabilitation. Your assessment data informs the RN and physician; it does not authorize you to rewrite the plan of care on your own.',
      'As an LVN, your pain responsibilities include: using standardized assessment tools at every visit; documenting pain scores as a vital sign; implementing pharmacological interventions only as ordered on the POC; applying non-pharmacological techniques within LVN scope and agency policy; reassessing after interventions; and communicating uncontrolled or changing pain to your supervising RN. You do not independently change medication orders, add new analgesics, or modify the POC—those require RN coordination and authorized clinician/physician orders.',
      'The Numeric Rating Scale (NRS 0–10) is the primary tool for cognitively intact adults. The Wong-Baker FACES scale is an alternative for patients with cognitive impairment, language barriers, or difficulty using numeric ratings. Use the scale appropriate to the patient. Pain is subjective—the patient’s self-report is the gold standard for patients who can self-report. You do not judge whether pain is “real” or “exaggerated.” You assess, document, intervene within orders and scope, reassess, and communicate.',
    ],
    keyPoints: [
      'Agency policy (CL-SD-014): pain is treated as the 5th vital sign—assess and document at every visit',
      'Federal context: 42 CFR § 484.60 — services furnished per plan of care addressing identified needs',
      'NRS (0–10) primary; Wong-Baker FACES when numeric scale is not appropriate',
      'Patient self-report is the gold standard—never dismiss reported pain',
      'LVN implements ordered interventions; does not independently change med orders or the POC',
    ],
    clinicalTip:
      'Ask about pain BEFORE starting procedures. If a patient rates 7/10 before wound care, check whether a PRN analgesic is ordered and whether timing per the order would allow administration before the procedure. Document findings and notify the RN if the POC does not address procedural pain—do not invent a new order.',
    decisionFrame: [
      'First: obtain self-report with the appropriate scale before procedures',
      'Continue: implement interventions already ordered on the POC',
      'Stop: do not give unprescribed medications or invent new PRN orders',
      'Notify: RN when pain is uncontrolled, new, or changing in character',
      'Document: score, context (rest vs activity), scale used, response',
    ],
    scopeNote:
      'LVN scope: assess, report, implement ordered care. RN/physician: POC changes and new medication orders.',
  },
  {
    id: 2,
    title: 'Comprehensive Pain Assessment — OPQRSTUV',
    subtitle: 'Severity alone is not enough',
    paragraphs: [
      'A pain score alone is insufficient for clinical decision-making. The number describes severity but not character, pattern, or impact. Care Indeed expects a comprehensive pain assessment using the OPQRSTUV framework at initial assessment and whenever pain characteristics change (agency policy CL-SD-014). Report significant changes to the supervising RN so the plan of care can be reviewed.',
      'O — Onset: When did the pain begin? Sudden or gradual? What were you doing when it started? New sudden pain may be a reportable clinical change requiring RN/physician notification per agency escalation pathways.',
      'P — Provocation/Palliation: What makes it worse or better? Activities, positions, medications, and time-of-day patterns guide intervention planning within the ordered POC.',
      'Q — Quality: Sharp, dull, burning, throbbing, aching, cramping, shooting, stabbing, pressure? Quality helps classify nociceptive vs neuropathic features and informs communication with the RN and physician about treatment response.',
      'R — Region/Radiation: Where exactly? Does it travel? Radiation may suggest nerve involvement or referred pain—document precisely and compare to prior notes.',
      'S — Severity: 0–10 at rest and with activity/procedures. A patient at 3/10 at rest and 8/10 during wound care has a procedural pain problem that may need RN review of pre-procedure orders—not an LVN-created order.',
      'T — Timing: Constant or intermittent? Related to medication timing? Pattern identification supports anticipatory management using existing orders.',
      'U — Understanding: What does the patient believe causes the pain? Correct misconceptions while respecting perspective; document teaching.',
      'V — Values/Goals: What pain level would be acceptable? Not every patient expects zero. The patient’s goal is your benchmark for effectiveness and for deciding when to escalate to the RN.',
    ],
    keyPoints: [
      'OPQRSTUV: Onset, Provocation, Quality, Region, Severity, Timing, Understanding, Values',
      'Full framework at baseline and when pain character changes (agency policy)',
      'Document severity at REST and during ACTIVITY/PROCEDURES separately',
      'Patient pain goal (V) is the effectiveness benchmark—and the escalation trigger',
    ],
    clinicalTip:
      'The V (Values) question is commonly missed. Always ask: “What number would your pain need to be for you to feel comfortable functioning?” This creates a measurable target and demonstrates patient-centered care in documentation.',
    decisionFrame: [
      'First: complete OPQRSTUV when pain is present or changed',
      'Continue: compare to prior visit and patient’s stated goal',
      'Stop: do not skip reassessment after intervention',
      'Notify: RN for new, radiating, or goal-exceeding pain',
      'Document: each OPQRSTUV element in the visit note',
    ],
  },
  {
    id: 3,
    title: 'Pain Classification — Nociceptive vs Neuropathic',
    subtitle: 'Quality words guide classification and reporting',
    paragraphs: [
      'Understanding pain type improves assessment documentation and communication with the supervising RN and physician about treatment effectiveness. Classification is a clinical description based on patient report and context—not an independent medical diagnosis by the LVN.',
      'Nociceptive pain relates to actual or potential tissue damage. Somatic nociceptive pain (skin, bone, muscle, joints) is typically well-localized—sharp, aching, or throbbing—and often worsens with movement or palpation (e.g., surgical incision, arthritis, fracture-related pain). Visceral nociceptive pain (internal organs) is poorly localized—deep, cramping, or pressure—and may be referred (e.g., abdominal organ pain).',
      'Neuropathic pain relates to nervous system damage or dysfunction. Descriptors often include burning, shooting, electric, tingling, or numbness, often along a nerve distribution. Allodynia (pain from light touch) may be present. Examples include diabetic neuropathy and post-herpetic neuralgia. Neuropathic pain often responds poorly to standard analgesics alone and may require adjuvant medications ordered by the physician (e.g., gabapentinoids)—the LVN does not start these agents without orders.',
      'Mixed pain is common in home health—for example, a diabetic foot wound may combine nociceptive wound pain and neuropathic neuropathy. Document both components and communicate the distinction to the RN; treatment approaches differ and POC adjustments are RN/physician decisions.',
    ],
    keyPoints: [
      'Nociceptive: tissue-related — somatic (localized/sharp/aching) or visceral (deep/cramping/referred)',
      'Neuropathic: nerve-related — burning/shooting/tingling; may need adjuvant meds (ordered only)',
      'Mixed pain is common—document both components when present',
      'Quality descriptors are your classification and reporting tool—not a license to diagnose',
    ],
    clinicalTip:
      'When a patient says “burning,” “shooting,” or “electric,” flag a possible neuropathic component in documentation and notify the RN. This may prompt physician review for adjuvant therapy—you do not add gabapentin or change the regimen yourself.',
    decisionFrame: [
      'First: capture quality words in the patient’s own language',
      'Continue: classify features as nociceptive, neuropathic, or mixed for reporting',
      'Stop: do not label a formal diagnosis or start unlisted adjuvants',
      'Notify: RN when descriptors suggest poorly controlled neuropathic pain',
      'Document: quality, distribution, and response to ordered treatments',
    ],
    scopeNote:
      'Medication selection and regimen changes are physician-ordered; LVN reports response data to the RN.',
  },
  {
    id: 4,
    title: 'Non-Pharmacological Pain Interventions',
    subtitle: 'Within LVN scope — complement, do not replace, ordered meds',
    paragraphs: [
      'Non-pharmacological pain management is within LVN scope when consistent with the POC, patient condition, and agency policy. These interventions complement—not replace—pharmacological treatment. CL-SD-014 expects documentation of non-pharmacological interventions attempted and their effectiveness (agency policy). CMS expects comprehensive pain management as part of care under the plan of care.',
      'Cold therapy (cryotherapy): often used for acute pain, swelling, and inflammatory flares. Typical clinical guidance is cold packs wrapped in a cloth barrier for about 15–20 minutes (follow agency policy and manufacturer guidance). Do not apply directly to skin. Contraindications may include peripheral vascular disease, Raynaud’s phenomenon, and impaired sensation—use clinical judgment and the POC.',
      'Heat therapy: may reduce muscle spasm, chronic stiffness, and joint pain. Warm (not hot) packs for about 15–20 minutes per clinical guidance/agency policy. Avoid heat on acute injuries, infected wounds, or areas with impaired sensation unless ordered and safe.',
      'Positioning and elevation: redistribute pressure, support alignment, elevate edematous extremities when appropriate. Distraction (conversation, music, guided imagery) and slow deep breathing (e.g., 4-count inhale / 4-count hold / 4-count exhale) can reduce perceived procedural pain.',
      'Document every non-pharmacological intervention, patient response, and effectiveness. “Non-pharmacological interventions offered; patient declined” is acceptable when the patient refuses. Do not substitute non-pharm measures for ordered medications the patient needs—use both as ordered/indicated.',
    ],
    keyPoints: [
      'Non-pharm interventions are expected documentation when pain is present (agency policy)',
      'Cold: acute pain/swelling ~15–20 min with barrier; avoid PVD/impaired sensation as indicated',
      'Heat: chronic stiffness/spasm; not on acute/infected/impaired-sensation areas unless appropriate',
      'Breathing (e.g., 4-4-4), positioning, and distraction are high-value, low-cost tools',
    ],
    clinicalTip:
      'Before wound care, guide three slow deep breaths. It takes seconds, costs nothing, and often lowers procedural pain scores when combined with ordered pre-procedure analgesia.',
    decisionFrame: [
      'First: review POC for allowed interventions and contraindications',
      'Continue: combine non-pharm with ordered meds as appropriate',
      'Stop: do not apply heat/cold when sensation or vascular status is unsafe',
      'Notify: RN if pain remains above goal despite ordered measures',
      'Document: technique, duration, and effectiveness',
    ],
  },
  {
    id: 5,
    title: 'The Pain Management Cycle',
    subtitle: 'Assess → Document → Intervene → Reassess → Document → Escalate?',
    paragraphs: [
      'Pain management is a continuous cycle—not a single checkbox. Follow this loop at every visit where pain is present:',
      'Step 1 — ASSESS: NRS (or FACES) plus OPQRSTUV as indicated. Capture baseline before intervention.',
      'Step 2 — DOCUMENT: Record baseline score as a vital sign with location, quality, and functional impact.',
      'Step 3 — INTERVENE: Pharmacological steps only as ordered (verify scheduled meds taken; administer ordered PRNs per parameters). Add non-pharmacological measures within scope.',
      'Step 4 — REASSESS: After pharmacological intervention, reassess within the timeframe specified by agency policy and clinical appropriateness (commonly cited guidance is about 30–60 minutes for many oral analgesics—confirm agency policy and route-specific expectations). After non-pharm measures, reassess promptly.',
      'Step 5 — DOCUMENT: Post-intervention score, interventions used, effectiveness vs patient goal.',
      'Step 6 — ESCALATE IF NEEDED: If pain remains above the patient’s goal after appropriate ordered interventions, notify the supervising RN. Uncontrolled pain may require POC review and physician notification for possible order changes—the LVN does not independently change medication orders.',
      'Reassessment is frequently missed. Surveyors look for pre- and post-intervention scores. A note that documents 7/10 and PRN administration without a post score is deficient—there is no evidence the intervention worked or that pain was managed.',
      'Escalate (examples): pain consistently above the patient’s goal despite POC adherence; new-onset pain; pain that changes character or location; frequent PRN use that may indicate need for scheduled regimen review by the authorized clinician.',
    ],
    keyPoints: [
      'Six-step cycle: Assess → Document → Intervene → Reassess → Document → Escalate?',
      'Pre- AND post-intervention scores must both appear when interventions are given',
      'Reassessment timing follows agency policy and clinical context (often ~30–60 min oral PRN)',
      'Escalate to RN when pain consistently exceeds the patient’s stated goal—LVN does not rewrite orders',
    ],
    clinicalTip:
      'After giving an ordered PRN analgesic, set a reminder for the agency’s reassessment window. When it fires, reassess and document. This habit closes the most common pain-documentation gap.',
    decisionFrame: [
      'First: baseline score before intervention',
      'Continue: ordered meds + non-pharm within scope',
      'Stop: do not skip post-intervention reassessment',
      'Notify: RN when goal not met or pain is new/changing',
      'Document: paired scores, interventions, response, notification',
    ],
  },
  {
    id: 6,
    title: 'Pain Documentation Standards',
    subtitle: 'What surveyors and the care team need to see',
    paragraphs: [
      'Pain documentation must meet clinical and regulatory expectations. Surveyors review assessment completion, interventions, reassessment evidence, and education. Thorough documentation also supports skilled-need justification and continuity across the interdisciplinary team.',
      'Essential elements for visit notes when pain is assessed/managed include: scale used; score at rest and with activity/procedures; location (anatomically specific); quality; onset/timing; aggravating/alleviating factors; patient pain goal; pharmacological interventions (name, dose, route, time—only as ordered); non-pharmacological interventions; pre- and post-intervention scores; education provided; and RN notification when escalation criteria are met.',
      '“Pain 6/10” is incomplete. Prefer: “Pain 6/10 at rest; 8/10 during wound care (NRS).” New locations compared with prior visits are reportable findings (e.g., right knee previously; now knee + hip).',
      'Paired pre/post scores prove management, not just identification. Education topics may include medication timing per orders, positioning, when to contact the agency for breakthrough pain, non-pharm self-management, and realistic functional goals (zero pain may not be achievable).',
      'Document the patient’s goal and whether it was achieved this visit. That creates a measurable, patient-centered outcome trail.',
    ],
    keyPoints: [
      'Score WITH context: rest + activity/procedures; name the scale',
      'Paired pre/post intervention scores are mandatory when you intervene',
      'Document meds only as ordered (name/dose/route/time) + non-pharm techniques',
      'Education + goal achievement status complete the note',
    ],
    clinicalTip:
      'Strong example: “Patient’s pain goal is 3/10. Pre-intervention 7/10. After ordered acetaminophen 650 mg PO and elevation with cold pack × 15 min, post-intervention 4/10 at 45 minutes. Goal not yet achieved; will reassess next visit and notify RN if remains uncontrolled.”',
    decisionFrame: [
      'First: write baseline with context',
      'Continue: record every intervention and paired reassessment',
      'Stop: do not leave “gave PRN” without a post score',
      'Notify: document whom you called, when, and response',
      'Document: goal vs actual outcome',
    ],
  },
  {
    id: 7,
    title: 'Module Completion — Practice Ready Knowledge',
    subtitle: 'Knowledge quiz next; practical competency is separate',
    paragraphs: [
      'You have completed the instructional content for LVN-009: Pain Assessment & Management. You reviewed standardized scales (NRS and FACES), the OPQRSTUV framework, nociceptive vs neuropathic features, non-pharmacological interventions, the six-step management cycle, and documentation standards aligned with CL-SD-014 and care planning expectations under 42 CFR § 484.60.',
      'Remember your scope boundary: the LVN assesses, documents, implements ordered interventions, reassesses, educates, and reports. The LVN does not independently diagnose, prescribe, change medication orders, complete OASIS, or modify the Plan of Care. Uncontrolled or changing pain is escalated to the supervising RN for POC review and physician communication as indicated.',
      'Practical competency is not established by this quiz alone. Observed demonstration, case-based evaluation, and authorized sign-off (per agency competency processes) remain separate requirements. Passing the knowledge quiz confirms understanding of concepts and decision rules—not standalone clinical competency.',
      'Proceed to the 10-question knowledge check. You must score 80% or higher to complete the knowledge portion of this module. You may review rationales and retry if needed.',
    ],
    keyPoints: [
      'Knowledge focus: scales, OPQRSTUV, pain types, non-pharm, 6-step cycle, documentation',
      'Policies/refs: CL-SD-014 (agency); 42 CFR § 484.60 (federal care-planning context)',
      'Escalate uncontrolled/new/changing pain to RN—do not rewrite orders yourself',
      'Quiz pass = knowledge only; observed competency sign-off is separate',
    ],
    clinicalTip:
      'Practice OPQRSTUV aloud on a mock patient. After a few repetitions the sequence becomes automatic and you will miss fewer elements under time pressure.',
    decisionFrame: [
      'First: always obtain self-report with the right scale',
      'Continue: full cycle through reassessment',
      'Stop: outside scope actions (new meds, POC edits)',
      'Notify: RN for escalation triggers',
      'Document: complete, paired, goal-linked notes',
    ],
    scopeNote:
      'Quiz validates knowledge only. Practical competency requires observed performance and authorized sign-off per agency policy.',
  },
];

// ─── QUIZ (10 items; distribution A=2 B=3 C=3 D=2) ───────────────────────────

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: 'At Care Indeed, per CL-SD-014, pain is treated as which of the following at every visit?',
    options: [
      'The fifth vital sign—assessed and documented each encounter',
      'An optional field only when the patient complains first',
      'A physician-only assessment the LVN must never document',
      'A one-time start-of-care item that is never repeated',
    ],
    correct: 0, // A
    rationale:
      'Agency policy CL-SD-014 treats pain as the fifth vital sign—assessed and documented at every visit. The LVN documents scores; POC changes still go through RN/physician pathways.',
  },
  {
    id: 2,
    stem: 'During OPQRSTUV assessment, a patient says, “I’d be okay functioning if my pain stayed at 3.” Which element did you just capture?',
    options: [
      'Onset only—when the pain first started',
      'Values/Goals—the patient’s acceptable pain level benchmark',
      'Quality only—the word description of the pain',
      'Region only—the anatomic location of the pain',
    ],
    correct: 1, // B
    rationale:
      'V = Values/Goals. The patient’s stated acceptable level is your effectiveness benchmark and a key trigger for escalating to the RN when not met.',
  },
  {
    id: 3,
    stem: 'A patient with diabetes describes foot pain as “burning and electric, worse at night.” Which classification best fits these descriptors for reporting purposes?',
    options: [
      'Purely somatic nociceptive pain from joint movement only',
      'Visceral nociceptive pain from an abdominal organ only',
      'Neuropathic features suggesting nerve-related pain',
      'Non-pain sensation that should be ignored in the note',
    ],
    correct: 2, // C
    rationale:
      'Burning, shooting, and electric descriptors are characteristic of neuropathic features. Document and report; do not independently start adjuvant medications.',
  },
  {
    id: 4,
    stem: 'You plan cold therapy for acute swelling after checking sensation and vascular status. Which application approach best matches standard clinical guidance used with agency policy?',
    options: [
      'Ice directly on bare skin for 60 continuous minutes',
      'Heat pack first for 45 minutes, then ice with no barrier',
      'Cold for 5 minutes only, regardless of response',
      'Cold pack with cloth barrier for about 15–20 minutes (per guidance/policy)',
    ],
    correct: 3, // D
    rationale:
      'Typical guidance is cold with a cloth barrier for about 15–20 minutes. Avoid direct skin contact and follow agency policy/contraindications (e.g., impaired sensation, PVD).',
  },
  {
    id: 5,
    stem: 'You administer an ordered oral PRN analgesic. What is the best next action regarding effectiveness?',
    options: [
      'Reassess pain within the agency/clinical reassessment window (often ~30–60 minutes for many oral agents) and document the post score',
      'Assume it worked and skip reassessment until the next calendar week',
      'Change the dose yourself if the patient still has pain in 10 minutes',
      'Document only the pre-score; post-scores are optional for surveyors',
    ],
    correct: 0, // A
    rationale:
      'Paired pre/post scores are essential. Reassessment timing follows agency policy and clinical context (commonly ~30–60 minutes for many oral PRNs). LVNs do not independently change doses.',
  },
  {
    id: 6,
    stem: 'A cognitively intact adult rates pain 8/10. Your objective exam shows calm behavior. What is the gold-standard basis for your documented pain intensity?',
    options: [
      'Family opinion overrides the patient',
      'Patient self-report—document the 8/10 and your objective observations separately if needed',
      'Always average the nurse’s guess with the patient’s number',
      'Leave intensity blank because behavior looks comfortable',
    ],
    correct: 1, // B
    rationale:
      'Patient self-report is the gold standard for patients who can report. You may document objective findings, but you do not replace the patient’s report with a judgment that pain is not real.',
  },
  {
    id: 7,
    stem: 'Which visit-note pattern is deficient for pain management documentation?',
    options: [
      'NRS with rest and activity scores plus OPQRSTUV elements',
      'Pre-score, ordered PRN given, non-pharm used, post-score, goal comparison',
      'Pain 7/10 and “PRN given” with no post-intervention reassessment score',
      'Patient goal of 3/10 documented with education on when to call the agency',
    ],
    correct: 2, // C
    rationale:
      'Identifying pain and giving a PRN without documenting reassessment shows no evidence of effectiveness—this is a common documentation deficiency.',
  },
  {
    id: 8,
    stem: 'The physician orders gabapentin for burning neuropathic pain. How should the LVN correctly understand this medication’s role?',
    options: [
      'It is a non-pharmacological intervention the LVN invented',
      'It replaces the need to ever reassess pain again',
      'It is an over-the-counter remedy the LVN may start without orders',
      'It is an adjuvant medication used for neuropathic pain—as ordered only; LVN does not independently add it',
    ],
    correct: 3, // D
    rationale:
      'Gabapentin is an adjuvant often used for neuropathic pain. The LVN administers only as ordered and reports response; the LVN does not independently initiate or change the regimen.',
  },
  {
    id: 9,
    stem: 'Despite ordered meds and non-pharm measures, a patient’s pain remains 7/10 for several visits against a stated goal of 3/10. What should the LVN do?',
    options: [
      'Wait until the score is 10/10 before telling anyone',
      'Escalate/notify the supervising RN for POC review—do not independently change medication orders',
      'Silently double the opioid dose to meet the goal faster',
      'Discharge the patient from service for noncompliance',
    ],
    correct: 1, // B
    rationale:
      'Escalate when pain consistently exceeds the patient’s goal despite POC adherence. Order changes require authorized clinician/physician pathways via RN coordination—not independent LVN changes.',
  },
  {
    id: 10,
    stem: 'You coach a patient through slow breathing before a dressing change. Which count pattern matches the module’s guided technique?',
    options: [
      '2-count inhale, no hold, immediate forced exhale only',
      '10-10-10 breath-holding until dizzy',
      '4-count inhale, 4-count hold, 4-count exhale',
      'Skip breathing if any pain is present',
    ],
    correct: 2, // C
    rationale:
      'The module teaches a 4-4-4 breathing pattern to support parasympathetic activation and reduce perceived procedural pain, used with—not instead of—ordered interventions.',
  },
];

// Distribution check: A=0,0 → Q1,Q5; B=1 → Q2,Q6,Q9; C=2 → Q3,Q7,Q10; D=3 → Q4,Q8  => A2 B3 C3 D2

// ─── HOTSPOT FEEDBACK PANELS ─────────────────────────────────────────────────

function FeedbackPanel({
  title,
  body,
  onClose,
}: {
  title: string;
  body: string;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 12,
        background: 'rgba(15,23,42,0.94)',
        color: THEME.white,
        borderRadius: 12,
        padding: '12px 14px',
        border: `1px solid ${THEME.primary}`,
        boxShadow: '0 8px 28px rgba(124,58,237,0.35)',
        zIndex: 5,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <strong style={{ color: '#C4B5FD', fontSize: 13 }}>{title}</strong>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          ✕
        </button>
      </div>
      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: '#E2E8F0' }}>{body}</p>
    </div>
  );
}

// ─── SCENE 1: NRS GAUGE ──────────────────────────────────────────────────────

function SceneNRSGauge({
  activeId,
  setActiveId,
  phase,
}: {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  phase: number;
}) {
  const score = Math.min(10, Math.max(0, Math.round(((Math.sin(phase / 40) + 1) / 2) * 10)));
  const colorFor = (n: number) =>
    n <= 3 ? '#10B981' : n <= 6 ? '#F59E0B' : n <= 8 ? '#F97316' : '#DC2626';

  const spots: HotspotInfo[] = [
    {
      id: 'nrs',
      label: 'NRS 0–10',
      detail:
        'Ask: “On a scale of 0 to 10, with 0 no pain and 10 the worst imaginable, what is your pain now?” Document at rest and with activity/procedures.',
    },
    {
      id: 'faces',
      label: 'Wong-Baker FACES',
      detail:
        'Use FACES when numeric rating is not reliable (cognitive, language, or communication barriers). Match the face the patient chooses to your documentation scale consistently.',
    },
    {
      id: 'gold',
      label: 'Self-report standard',
      detail:
        'Patient self-report is the gold standard for those who can report. Do not dismiss the number because behavior “looks fine.” Document and treat within orders.',
    },
    {
      id: 'scope',
      label: 'LVN boundary',
      detail:
        'You assess and implement ordered interventions. You do not independently change medication orders or rewrite the POC when the score is high—notify the RN.',
    },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 420 360" width="100%" height="100%" role="img" aria-label="Numeric pain scale gauge">
        <defs>
          <linearGradient id="nrsBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E1B4B" />
            <stop offset="100%" stopColor="#312E81" />
          </linearGradient>
        </defs>
        <rect width="420" height="360" rx="16" fill="url(#nrsBg)" />
        <text x="210" y="32" textAnchor="middle" fill="#E9D5FF" fontSize="15" fontWeight="700">
          Numeric Rating Scale (NRS)
        </text>
        <text x="210" y="52" textAnchor="middle" fill="#A5B4FC" fontSize="11">
          Animated demo score — practice reading color bands
        </text>

        {/* Arc ticks 0-10 */}
        {Array.from({ length: 11 }).map((_, i) => {
          const a = Math.PI + (i / 10) * Math.PI;
          const x1 = 210 + Math.cos(a) * 118;
          const y1 = 200 + Math.sin(a) * 118;
          const x2 = 210 + Math.cos(a) * 138;
          const y2 = 200 + Math.sin(a) * 138;
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={colorFor(i)} strokeWidth="4" />
              <text
                x={210 + Math.cos(a) * 155}
                y={200 + Math.sin(a) * 155}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#F8FAFC"
                fontSize="11"
                fontWeight="700"
              >
                {i}
              </text>
            </g>
          );
        })}

        {/* Needle */}
        {(() => {
          const a = Math.PI + (score / 10) * Math.PI;
          const x = 210 + Math.cos(a) * 100;
          const y = 200 + Math.sin(a) * 100;
          return (
            <g>
              <line x1="210" y1="200" x2={x} y2={y} stroke={colorFor(score)} strokeWidth="4" strokeLinecap="round" />
              <circle cx="210" cy="200" r="10" fill={colorFor(score)} stroke="#fff" strokeWidth="2" />
              <text x="210" y="230" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="800">
                {score}
              </text>
              <text x="210" y="250" textAnchor="middle" fill="#C4B5FD" fontSize="11">
                / 10 current demo
              </text>
            </g>
          );
        })()}

        {/* FACES row */}
        {[0, 2, 4, 6, 8, 10].map((n, idx) => {
          const cx = 50 + idx * 64;
          const mouth =
            n <= 2 ? 'M -10 6 Q 0 14 10 6' : n <= 4 ? 'M -10 8 L 10 8' : n <= 6 ? 'M -10 10 Q 0 6 10 10' : 'M -10 12 Q 0 2 10 12';
          return (
            <g key={n} transform={`translate(${cx}, 300)`} style={{ cursor: 'pointer' }} onClick={() => setActiveId('faces')}>
              <circle r="22" fill="#FEF3C7" stroke={colorFor(n)} strokeWidth="2" />
              <circle cx="-7" cy="-4" r="2.5" fill="#1E293B" />
              <circle cx="7" cy="-4" r="2.5" fill="#1E293B" />
              <path d={mouth} stroke="#1E293B" strokeWidth="2" fill="none" />
              <text y="36" textAnchor="middle" fill="#E2E8F0" fontSize="10">
                {n}
              </text>
            </g>
          );
        })}

        {/* Hotspot buttons */}
        {spots.map((s, i) => (
          <g
            key={s.id}
            transform={`translate(${24 + (i % 2) * 200}, ${70 + Math.floor(i / 2) * 28})`}
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveId(activeId === s.id ? null : s.id)}
          >
            <rect
              width="170"
              height="22"
              rx="11"
              fill={activeId === s.id ? THEME.primary : 'rgba(255,255,255,0.12)'}
              stroke="#C4B5FD"
            />
            <text x="85" y="15" textAnchor="middle" fill="#F8FAFC" fontSize="11" fontWeight="600">
              {s.label}
            </text>
          </g>
        ))}
      </svg>
      {activeId && spots.find((s) => s.id === activeId) && (
        <FeedbackPanel
          title={spots.find((s) => s.id === activeId)!.label}
          body={spots.find((s) => s.id === activeId)!.detail}
          onClose={() => setActiveId(null)}
        />
      )}
    </div>
  );
}

// ─── SCENE 2: OPQRSTUV WHEEL ─────────────────────────────────────────────────

function SceneOPQRSTUV({
  activeId,
  setActiveId,
  phase,
}: {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  phase: number;
}) {
  const segments = [
    { id: 'O', letter: 'O', label: 'Onset', prompt: 'When did it start? Sudden or gradual?', color: '#DC2626' },
    { id: 'P', letter: 'P', label: 'Provocation', prompt: 'What makes it worse or better?', color: '#F97316' },
    { id: 'Q', letter: 'Q', label: 'Quality', prompt: 'Sharp? Dull? Burning? Shooting?', color: '#F59E0B' },
    { id: 'R', letter: 'R', label: 'Region', prompt: 'Where? Does it radiate?', color: '#84CC16' },
    { id: 'S', letter: 'S', label: 'Severity', prompt: '0–10 at rest and with activity?', color: '#10B981' },
    { id: 'T', letter: 'T', label: 'Timing', prompt: 'Constant or intermittent? Pattern?', color: '#06B6D4' },
    { id: 'U', letter: 'U', label: 'Understanding', prompt: 'What do you think causes it?', color: '#3B82F6' },
    { id: 'V', letter: 'V', label: 'Values', prompt: 'What is your acceptable pain goal?', color: '#8B5CF6' },
  ];

  const rot = (phase / 8) % 360;
  const cx = 210;
  const cy = 175;
  const r = 120;
  const active = segments.find((s) => s.id === activeId) || null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 420 360" width="100%" height="100%" role="img" aria-label="OPQRSTUV assessment wheel">
        <rect width="420" height="360" rx="16" fill="#0F172A" />
        <text x="210" y="28" textAnchor="middle" fill="#E9D5FF" fontSize="14" fontWeight="700">
          OPQRSTUV Assessment Wheel
        </text>
        <text x="210" y="46" textAnchor="middle" fill="#94A3B8" fontSize="10">
          Click a letter to reveal the interview prompt
        </text>
        <g transform={`rotate(${rot * 0.05} ${cx} ${cy})`}>
          {segments.map((seg, i) => {
            const start = (i / 8) * Math.PI * 2 - Math.PI / 2;
            const end = ((i + 1) / 8) * Math.PI * 2 - Math.PI / 2;
            const x1 = cx + Math.cos(start) * r;
            const y1 = cy + Math.sin(start) * r;
            const x2 = cx + Math.cos(end) * r;
            const y2 = cy + Math.sin(end) * r;
            const large = 0;
            const mid = start + (end - start) / 2;
            const lx = cx + Math.cos(mid) * (r * 0.68);
            const ly = cy + Math.sin(mid) * (r * 0.68);
            const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
            const selected = activeId === seg.id;
            return (
              <g key={seg.id} style={{ cursor: 'pointer' }} onClick={() => setActiveId(selected ? null : seg.id)}>
                <path
                  d={d}
                  fill={seg.color}
                  opacity={selected ? 1 : 0.75}
                  stroke="#0F172A"
                  strokeWidth="2"
                />
                <circle cx={lx} cy={ly} r={selected ? 16 : 14} fill="#0F172A" opacity="0.35" />
                <text x={lx} y={ly + 1} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="13" fontWeight="800">
                  {seg.letter}
                </text>
              </g>
            );
          })}
        </g>
        <circle cx={cx} cy={cy} r="36" fill="#1E293B" stroke="#C4B5FD" strokeWidth="2" />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#E9D5FF" fontSize="11" fontWeight="700">
          PAIN
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#A5B4FC" fontSize="9">
          INTERVIEW
        </text>
        {active && (
          <g>
            <rect x="40" y="310" width="340" height="36" rx="8" fill={active.color} opacity="0.95" />
            <text x="210" y="325" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">
              {active.letter} — {active.label}
            </text>
            <text x="210" y="340" textAnchor="middle" fill="#fff" fontSize="11">
              {active.prompt}
            </text>
          </g>
        )}
      </svg>
      {active && (
        <FeedbackPanel
          title={`${active.letter} — ${active.label}`}
          body={`${active.prompt} Capture this element at baseline and when pain changes. Escalate new or worsening findings to the RN.`}
          onClose={() => setActiveId(null)}
        />
      )}
    </div>
  );
}

// ─── SCENE 3: PAIN TYPE CLASSIFICATION ───────────────────────────────────────

function ScenePainTypes({
  activeId,
  setActiveId,
}: {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}) {
  const cards = [
    {
      id: 'somatic',
      title: 'Somatic Nociceptive',
      color: '#3B82F6',
      points: ['Well-localized', 'Sharp / aching / throbbing', 'Skin, bone, muscle, joints'],
      detail:
        'Somatic pain is localized tissue-related pain (e.g., incision, arthritis). Document location precisely and intervene with ordered analgesics + non-pharm as appropriate.',
    },
    {
      id: 'visceral',
      title: 'Visceral Nociceptive',
      color: '#06B6D4',
      points: ['Poorly localized', 'Deep / cramping / pressure', 'May refer elsewhere'],
      detail:
        'Visceral pain is organ-related and may be referred. New or changing visceral pain warrants prompt RN notification—do not assume chronic baseline without comparison.',
    },
    {
      id: 'neuro',
      title: 'Neuropathic',
      color: '#A855F7',
      points: ['Burning / shooting / electric', 'Nerve distribution', 'May need adjuvants (ordered)'],
      detail:
        'Neuropathic descriptors should be flagged for the RN. Adjuvant medications (e.g., gabapentin) are physician-ordered only—LVN reports response, does not start therapy independently.',
    },
    {
      id: 'mixed',
      title: 'Mixed (common)',
      color: '#F59E0B',
      points: ['Both components present', 'Document each type', 'Different treatment paths'],
      detail:
        'Mixed pain is common in home health (e.g., wound + neuropathy). Document both components so the RN/physician can tailor the POC—LVN does not redesign the regimen alone.',
    },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 420 360" width="100%" height="100%" role="img" aria-label="Pain type classification">
        <rect width="420" height="360" rx="16" fill="#111827" />
        <text x="210" y="28" textAnchor="middle" fill="#E9D5FF" fontSize="14" fontWeight="700">
          Pain Type Classification
        </text>
        <text x="210" y="46" textAnchor="middle" fill="#94A3B8" fontSize="10">
          Click a card — quality words guide reporting (not LVN diagnosis)
        </text>
        {cards.map((c, i) => {
          const x = 18 + (i % 2) * 196;
          const y = 62 + Math.floor(i / 2) * 140;
          const selected = activeId === c.id;
          return (
            <g key={c.id} style={{ cursor: 'pointer' }} onClick={() => setActiveId(selected ? null : c.id)}>
              <rect
                x={x}
                y={y}
                width="188"
                height="126"
                rx="12"
                fill={selected ? c.color : '#1F2937'}
                stroke={c.color}
                strokeWidth="2"
              />
              <text x={x + 94} y={y + 28} textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">
                {c.title}
              </text>
              {c.points.map((p, pi) => (
                <text key={pi} x={x + 14} y={y + 54 + pi * 18} fill={selected ? '#fff' : '#D1D5DB'} fontSize="11">
                  • {p}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
      {activeId && cards.find((c) => c.id === activeId) && (
        <FeedbackPanel
          title={cards.find((c) => c.id === activeId)!.title}
          body={cards.find((c) => c.id === activeId)!.detail}
          onClose={() => setActiveId(null)}
        />
      )}
    </div>
  );
}

// ─── SCENE 4: NON-PHARM TOOLKIT ──────────────────────────────────────────────

function SceneNonPharm({
  activeId,
  setActiveId,
}: {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}) {
  const tools = [
    { id: 'cold', label: 'Cold', icon: '❄', detail: 'Acute pain/swelling. Barrier cloth ~15–20 min. Avoid PVD/impaired sensation as indicated. Document response.' },
    { id: 'heat', label: 'Heat', icon: '♨', detail: 'Chronic stiffness/spasm. Warm—not hot—packs ~15–20 min. Avoid acute injury/infection/unsafe sensation unless ordered/safe.' },
    { id: 'position', label: 'Position', icon: '🛏', detail: 'Reposition, pillow support, elevate edematous limbs when appropriate to reduce pressure and discomfort.' },
    { id: 'elevate', label: 'Elevate', icon: '↑', detail: 'Elevation can improve venous return and reduce throbbing in edematous extremities when not contraindicated.' },
    { id: 'distract', label: 'Distract', icon: '🎵', detail: 'Conversation, music, or guided imagery during procedures can gate pain perception.' },
    { id: 'breathe', label: 'Breathe', icon: '💨', detail: 'Coach 4-count inhale / 4-count hold / 4-count exhale before and during painful procedures.' },
    { id: 'imagery', label: 'Imagery', icon: '☁', detail: 'Guided imagery is a low-cost adjunct; document offer and patient preference.' },
    { id: 'massage', label: 'Massage*', icon: '🖐', detail: 'Only if within POC, training, and not contraindicated (e.g., avoid over infected/unstable areas). Follow agency policy.' },
    { id: 'edu', label: 'Education', icon: '📘', detail: 'Teach positioning, when to call for breakthrough pain, and realistic functional goals. Document teaching.' },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 420 360" width="100%" height="100%" role="img" aria-label="Non-pharmacological toolkit">
        <rect width="420" height="360" rx="16" fill="#0B1220" />
        <text x="210" y="28" textAnchor="middle" fill="#E9D5FF" fontSize="14" fontWeight="700">
          Non-Pharmacological Toolkit
        </text>
        <text x="210" y="46" textAnchor="middle" fill="#94A3B8" fontSize="10">
          Complements ordered meds — click each tool
        </text>
        {tools.map((t, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const x = 24 + col * 128;
          const y = 68 + row * 90;
          const selected = activeId === t.id;
          return (
            <g key={t.id} style={{ cursor: 'pointer' }} onClick={() => setActiveId(selected ? null : t.id)}>
              <rect
                x={x}
                y={y}
                width="116"
                height="76"
                rx="12"
                fill={selected ? THEME.primary : '#1E293B'}
                stroke="#A78BFA"
                strokeWidth="1.5"
              />
              <text x={x + 58} y={y + 34} textAnchor="middle" fontSize="22">
                {t.icon}
              </text>
              <text x={x + 58} y={y + 58} textAnchor="middle" fill="#F8FAFC" fontSize="12" fontWeight="700">
                {t.label}
              </text>
            </g>
          );
        })}
      </svg>
      {activeId && tools.find((t) => t.id === activeId) && (
        <FeedbackPanel
          title={tools.find((t) => t.id === activeId)!.label}
          body={tools.find((t) => t.id === activeId)!.detail}
          onClose={() => setActiveId(null)}
        />
      )}
    </div>
  );
}

// ─── SCENE 5: PAIN CYCLE ─────────────────────────────────────────────────────

function ScenePainCycle({
  activeId,
  setActiveId,
  phase,
}: {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  phase: number;
}) {
  const steps = [
    { id: 'assess', label: 'ASSESS', desc: 'NRS + OPQRSTUV', color: '#DC2626' },
    { id: 'doc1', label: 'DOCUMENT', desc: 'Baseline score', color: '#F59E0B' },
    { id: 'intervene', label: 'INTERVENE', desc: 'Ordered + non-pharm', color: '#10B981' },
    { id: 'reassess', label: 'REASSESS', desc: 'Per agency window', color: '#3B82F6' },
    { id: 'doc2', label: 'DOCUMENT', desc: 'Post score + effect', color: '#8B5CF6' },
    { id: 'escalate', label: 'ESCALATE?', desc: 'RN if over goal', color: '#EF4444' },
  ];
  const highlight = Math.floor(phase / 30) % steps.length;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 420 360" width="100%" height="100%" role="img" aria-label="Pain management cycle">
        <rect width="420" height="360" rx="16" fill="#0F172A" />
        <text x="210" y="28" textAnchor="middle" fill="#E9D5FF" fontSize="14" fontWeight="700">
          Pain Management Cycle
        </text>
        <text x="210" y="46" textAnchor="middle" fill="#94A3B8" fontSize="10">
          Continuous loop — click a step for LVN actions
        </text>
        {steps.map((s, i) => {
          const angle = -90 + i * 60;
          const rad = (angle * Math.PI) / 180;
          const x = 210 + Math.cos(rad) * 110;
          const y = 185 + Math.sin(rad) * 100;
          const on = activeId === s.id || highlight === i;
          return (
            <g key={s.id} style={{ cursor: 'pointer' }} onClick={() => setActiveId(activeId === s.id ? null : s.id)}>
              <circle cx={x} cy={y} r={on ? 34 : 30} fill={s.color} opacity={on ? 1 : 0.8} stroke="#fff" strokeWidth={on ? 3 : 1} />
              <text x={x} y={y - 4} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="800">
                {s.label}
              </text>
              <text x={x} y={y + 10} textAnchor="middle" fill="#fff" fontSize="8">
                {s.desc}
              </text>
            </g>
          );
        })}
        <circle cx="210" cy="185" r="40" fill="#1E293B" stroke="#C4B5FD" strokeWidth="2" />
        <text x="210" y="180" textAnchor="middle" fill="#E9D5FF" fontSize="11" fontWeight="700">
          EVERY
        </text>
        <text x="210" y="196" textAnchor="middle" fill="#A5B4FC" fontSize="11" fontWeight="700">
          VISIT
        </text>
        {/* arrows suggestion ring */}
        <circle cx="210" cy="185" r="72" fill="none" stroke="rgba(167,139,250,0.35)" strokeWidth="2" strokeDasharray="6 6" />
      </svg>
      {activeId && (
        <FeedbackPanel
          title={steps.find((s) => s.id === activeId)?.label || 'Step'}
          body={
            {
              assess: 'Obtain self-report with the right scale; complete OPQRSTUV when indicated. Baseline before you intervene.',
              doc1: 'Record baseline as a vital sign with location, quality, and functional impact.',
              intervene: 'Give only ordered medications; add non-pharm within scope. Never invent new orders.',
              reassess: 'Reassess after intervention per agency policy/clinical context (often ~30–60 min for many oral PRNs).',
              doc2: 'Write post score, interventions, and comparison to the patient’s goal.',
              escalate: 'If still above goal, new, or changing—notify RN. LVN does not independently change med orders or the POC.',
            }[activeId] || 'Follow the full cycle.'
          }
          onClose={() => setActiveId(null)}
        />
      )}
    </div>
  );
}

// ─── SCENE 6: DOCUMENTATION TEMPLATE ─────────────────────────────────────────

function SceneDocTemplate({
  activeId,
  setActiveId,
  phase,
}: {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  phase: number;
}) {
  const fields = [
    { id: 'scale', label: 'Scale used (NRS/FACES)' },
    { id: 'rest', label: 'Score at rest' },
    { id: 'activity', label: 'Score with activity/procedure' },
    { id: 'location', label: 'Anatomic location' },
    { id: 'quality', label: 'Quality descriptors' },
    { id: 'goal', label: 'Patient pain goal' },
    { id: 'pharm', label: 'Ordered meds given (dose/route/time)' },
    { id: 'nonpharm', label: 'Non-pharm interventions' },
    { id: 'post', label: 'Post-intervention score' },
    { id: 'effect', label: 'Effectiveness vs goal' },
    { id: 'edu', label: 'Education provided' },
    { id: 'notify', label: 'RN notification (if escalated)' },
  ];
  const reveal = Math.min(fields.length, 3 + Math.floor((phase / 20) % (fields.length + 1)));

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 420 360" width="100%" height="100%" role="img" aria-label="Pain documentation template">
        <rect width="420" height="360" rx="16" fill="#0F172A" />
        <text x="210" y="26" textAnchor="middle" fill="#E9D5FF" fontSize="14" fontWeight="700">
          Pain Documentation Checklist
        </text>
        <text x="210" y="44" textAnchor="middle" fill="#94A3B8" fontSize="10">
          Click any field — paired scores prove management
        </text>
        {fields.slice(0, reveal).map((f, i) => {
          const col = i < 6 ? 0 : 1;
          const row = i % 6;
          const x = 18 + col * 200;
          const y = 58 + row * 46;
          const selected = activeId === f.id;
          return (
            <g key={f.id} style={{ cursor: 'pointer' }} onClick={() => setActiveId(selected ? null : f.id)}>
              <rect
                x={x}
                y={y}
                width="186"
                height="38"
                rx="8"
                fill={selected ? THEME.primary : '#1E293B'}
                stroke={selected ? '#C4B5FD' : '#334155'}
              />
              <circle cx={x + 16} cy={y + 19} r="8" fill={selected ? THEME.success : '#475569'} />
              {selected && (
                <text x={x + 16} y={y + 23} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
                  ✓
                </text>
              )}
              <text x={x + 32} y={y + 23} fill="#F8FAFC" fontSize="10" fontWeight="600">
                {f.label}
              </text>
            </g>
          );
        })}
      </svg>
      {activeId && (
        <FeedbackPanel
          title={fields.find((f) => f.id === activeId)?.label || 'Field'}
          body={
            {
              scale: 'Name the scale so readers know how to interpret the number.',
              rest: 'Baseline at rest supports comparison and skilled-need narrative.',
              activity: 'Procedural/activity scores often drive pre-procedure planning with the RN.',
              location: 'Be anatomically specific; new sites vs prior visits are reportable.',
              quality: 'Patient’s words help classify nociceptive vs neuropathic features.',
              goal: 'Goal is the effectiveness benchmark and escalation trigger.',
              pharm: 'Only ordered meds—name, dose, route, time. No independent order changes.',
              nonpharm: 'List techniques and response; refusals may be documented as offered/declined.',
              post: 'Without a post score, there is no evidence of management effectiveness.',
              effect: 'State whether goal was met; if not, plan RN communication.',
              edu: 'Teach timing per orders, self-management, and when to call the agency.',
              notify: 'Document who was notified, when, and any instructions received.',
            }[activeId] || 'Complete documentation element.'
          }
          onClose={() => setActiveId(null)}
        />
      )}
    </div>
  );
}

// ─── SCENE 7: MASTERY BADGE ──────────────────────────────────────────────────

function SceneMastery({
  activeId,
  setActiveId,
  phase,
}: {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  phase: number;
}) {
  const pulse = 1 + Math.sin(phase / 12) * 0.04;
  const chips = [
    { id: 'knowledge', label: 'Knowledge quiz', detail: 'Passing at 80% validates knowledge only—not standalone practical competency.' },
    { id: 'observe', label: 'Observed skills', detail: 'Practical competency requires observed demonstration and authorized sign-off per agency policy.' },
    { id: 'scope', label: 'Scope boundary', detail: 'Assess, implement ordered care, reassess, report. Do not independently change med orders or the POC.' },
    { id: 'escalate', label: 'Escalation', detail: 'Uncontrolled, new, or changing pain → notify supervising RN for POC/physician pathway.' },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 420 360" width="100%" height="100%" role="img" aria-label="Module mastery summary">
        <defs>
          <radialGradient id="badgeGlow" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="420" height="360" rx="16" fill="#0F172A" />
        <circle cx="210" cy="150" r="120" fill="url(#badgeGlow)" />
        <g transform={`translate(210 140) scale(${pulse})`}>
          <circle r="58" fill="#7C3AED" stroke="#E9D5FF" strokeWidth="3" />
          <circle r="46" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 3" />
          <text y="-6" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="800">
            LVN-009
          </text>
          <text y="14" textAnchor="middle" fill="#E9D5FF" fontSize="10" fontWeight="700">
            PAIN READY
          </text>
        </g>
        <text x="210" y="230" textAnchor="middle" fill="#E2E8F0" fontSize="12" fontWeight="600">
          Knowledge complete → quiz next
        </text>
        {chips.map((c, i) => {
          const x = 24 + (i % 2) * 196;
          const y = 250 + Math.floor(i / 2) * 48;
          const selected = activeId === c.id;
          return (
            <g key={c.id} style={{ cursor: 'pointer' }} onClick={() => setActiveId(selected ? null : c.id)}>
              <rect x={x} y={y} width="180" height="38" rx="10" fill={selected ? THEME.primary : '#1E293B'} stroke="#A78BFA" />
              <text x={x + 90} y={y + 24} textAnchor="middle" fill="#F8FAFC" fontSize="11" fontWeight="700">
                {c.label}
              </text>
            </g>
          );
        })}
      </svg>
      {activeId && chips.find((c) => c.id === activeId) && (
        <FeedbackPanel
          title={chips.find((c) => c.id === activeId)!.label}
          body={chips.find((c) => c.id === activeId)!.detail}
          onClose={() => setActiveId(null)}
        />
      )}
    </div>
  );
}

// ─── MAIN MODULE ─────────────────────────────────────────────────────────────

const LVN009PainAssessment: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [mode, setMode] = useState<'learn' | 'quiz' | 'results'>('learn');
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [animPhase, setAnimPhase] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const t = window.setInterval(() => setAnimPhase((p) => (p + 1) % 3600), 50);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    setActiveHotspot(null);
  }, [pageIndex, mode]);

  const page = PAGES[pageIndex];
  const totalPages = PAGES.length;

  const score = useMemo(() => {
    return QUIZ.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);
  }, [answers]);

  const percent = Math.round((score / QUIZ.length) * 100);
  const passed = percent >= MODULE_META.passing;

  const submitQuiz = useCallback(() => {
    if (Object.keys(answers).length < QUIZ.length) return;
    setSubmitted(true);
    setMode('results');
    setShowReview(false);
  }, [answers]);

  const retryQuiz = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
    setShowReview(false);
    setMode('quiz');
  }, []);


  const renderScene = () => {
    const common = { activeId: activeHotspot, setActiveId: setActiveHotspot, phase: animPhase };
    switch (pageIndex) {
      case 0:
        return <SceneNRSGauge {...common} />;
      case 1:
        return <SceneOPQRSTUV {...common} />;
      case 2:
        return <ScenePainTypes activeId={activeHotspot} setActiveId={setActiveHotspot} />;
      case 3:
        return <SceneNonPharm activeId={activeHotspot} setActiveId={setActiveHotspot} />;
      case 4:
        return <ScenePainCycle {...common} />;
      case 5:
        return <SceneDocTemplate {...common} />;
      case 6:
      default:
        return <SceneMastery {...common} />;
    }
  };

  // ── LEARNING UI ──
  if (mode === 'learn') {
    return (
      <div
        className="lvn-module-shell"
        style={{
          minHeight: '100vh',
          background: THEME.bg,
          fontFamily: 'Inter, system-ui, Segoe UI, Roboto, sans-serif',
          color: THEME.dark,
        }}
      >
        {/* Header */}
                <LVNLessonNavigation
          lessons={PAGES}
          activeIndex={pageIndex}
          onLessonChange={(index) => {
            setMode('learn');
            setPageIndex(index);
            setActiveHotspot(null);
          }}
        />

        {/* Split panel */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.95fr)',
            gap: 16,
            padding: 16,
            maxWidth: 1280,
            margin: '0 auto',
          }}
        >
          {/* LEFT content */}
          <section
            style={{
              background: THEME.white,
              borderRadius: 16,
              border: `1px solid ${THEME.border}`,
              padding: 20,
              boxShadow: '0 8px 30px rgba(124,58,237,0.08)',
              minHeight: 520,
            }}
          >
            <div
              style={{
                display: 'inline-block',
                background: THEME.secondary,
                color: THEME.primaryDark,
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 999,
                marginBottom: 10,
              }}
            >
              {page.subtitle}
            </div>
            <h2 style={{ margin: '0 0 12px', fontSize: 22, color: THEME.primaryDark }}>{page.title}</h2>
            {page.paragraphs.map((p, i) => (
              <p key={i} style={{ margin: '0 0 12px', lineHeight: 1.6, fontSize: 14, color: '#334155' }}>
                {p}
              </p>
            ))}

            <div
              style={{
                background: '#F5F3FF',
                borderLeft: `4px solid ${THEME.primary}`,
                borderRadius: 8,
                padding: 12,
                marginTop: 8,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6, color: THEME.primaryDark }}>
                Key Points
              </div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {page.keyPoints.map((kp, i) => (
                  <li key={i} style={{ marginBottom: 6, fontSize: 13, lineHeight: 1.45, color: '#334155' }}>
                    {kp}
                  </li>
                ))}
              </ul>
            </div>

            <div
              style={{
                marginTop: 12,
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: 8,
                padding: 12,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 13, color: '#92400E', marginBottom: 4 }}>Clinical Tip</div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: '#78350F' }}>{page.clinicalTip}</p>
            </div>

            <div
              style={{
                marginTop: 12,
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: 8,
                padding: 12,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 13, color: '#065F46', marginBottom: 6 }}>
                Decision frame (First / Continue / Stop / Notify / Document)
              </div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {page.decisionFrame.map((d, i) => (
                  <li key={i} style={{ fontSize: 12.5, lineHeight: 1.45, color: '#064E3B', marginBottom: 4 }}>
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            {page.scopeNote && (
              <div
                style={{
                  marginTop: 12,
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 8,
                  padding: 10,
                  fontSize: 12.5,
                  color: '#7F1D1D',
                  lineHeight: 1.45,
                }}
              >
                <strong>Scope note: </strong>
                {page.scopeNote}
              </div>
            )}
          </section>

          {/* RIGHT scene */}
          <aside
            style={{
              background: THEME.white,
              borderRadius: 16,
              border: `1px solid ${THEME.border}`,
              padding: 10,
              minHeight: 520,
              boxShadow: '0 8px 30px rgba(124,58,237,0.08)',
              overflow: 'hidden',
            }}
          >
            <div style={{ height: '100%', minHeight: 500 }}>{renderScene()}</div>
          </aside>
        </div>

        {/* Footer nav */}
                <LVNNarrationFooter
          currentIndex={pageIndex}
          total={totalPages}
          onPrevious={() => setPageIndex((p) => Math.max(0, p - 1))}
          previousDisabled={pageIndex === 0}
          onNext={() => {
            if (pageIndex < totalPages - 1) {
              setPageIndex((p) => p + 1);
            } else {
              setMode('quiz');
              setSubmitted(false);
              setShowReview(false);
            }
          }}
          nextLabel={pageIndex < totalPages - 1 ? 'Next Lesson →' : 'Start Quiz →'}
          centerLabel={'Lesson ' + (pageIndex + 1) + ' of ' + totalPages}
        />
      </div>
    );
  }

  // ── QUIZ UI ──
  if (mode === 'quiz') {
    const allAnswered = Object.keys(answers).length === QUIZ.length;
    return (
      <div
        className="lvn-module-shell"
        style={{
          minHeight: '100vh',
          background: THEME.bg,
          fontFamily: 'Inter, system-ui, Segoe UI, Roboto, sans-serif',
          padding: 20,
        }}
      >
        <LVNLessonNavigation
          lessons={PAGES}
          activeIndex={-1}
          onLessonChange={(index) => {
            setMode('learn');
            setPageIndex(index);
            setActiveHotspot(null);
          }}
        />

        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${THEME.primaryDark}, ${THEME.primary})`,
              color: '#fff',
              borderRadius: 16,
              padding: 18,
              marginBottom: 16,
            }}
          >
            <h1 style={{ margin: 0, fontSize: 20 }}>LVN-009 Knowledge Quiz</h1>
            <p style={{ margin: '8px 0 0', fontSize: 13, opacity: 0.95, lineHeight: 1.5 }}>
              10 application questions · 80% to pass · This quiz validates <strong>knowledge only</strong>. Observed
              demonstration and authorized sign-off remain separate for practical competency.
            </p>
          </div>

          {QUIZ.map((q, qi) => (
            <div
              key={q.id}
              style={{
                background: THEME.white,
                borderRadius: 14,
                border: `1px solid ${THEME.border}`,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 14, color: THEME.primaryDark, marginBottom: 10 }}>
                {qi + 1}. {q.stem}
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {q.options.map((opt, oi) => {
                  const selected = answers[qi] === oi;
                  const letter = String.fromCharCode(65 + oi);
                  return (
                    <label
                      key={oi}
                      style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: selected ? `2px solid ${THEME.primary}` : '1px solid #E2E8F0',
                        background: selected ? THEME.secondary : '#F8FAFC',
                        cursor: 'pointer',
                        fontSize: 13,
                        lineHeight: 1.4,
                      }}
                    >
                      <input
                        type="radio"
                        name={`q-${qi}`}
                        checked={selected}
                        onChange={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                        style={{ marginTop: 3 }}
                      />
                      <span>
                        <strong>{letter}.</strong> {opt}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setMode('learn');
                setPageIndex(totalPages - 1);
              }}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                background: THEME.dark,
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ← Back to content
            </button>
            <button
              type="button"
              disabled={!allAnswered}
              onClick={submitQuiz}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: 'none',
                background: allAnswered ? THEME.success : '#94A3B8',
                color: '#fff',
                fontWeight: 700,
                cursor: allAnswered ? 'pointer' : 'not-allowed',
              }}
            >
              Submit quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS UI ──
  return (
    <div
      className="lvn-module-shell"
      style={{
        minHeight: '100vh',
        background: THEME.bg,
        fontFamily: 'Inter, system-ui, Segoe UI, Roboto, sans-serif',
        padding: 20,
      }}
    >
      <LVNLessonNavigation
        lessons={PAGES}
        activeIndex={-1}
        onLessonChange={(index) => {
          setMode('learn');
          setPageIndex(index);
          setActiveHotspot(null);
        }}
      />

      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div
          style={{
            background: passed
              ? 'linear-gradient(135deg, #065F46, #10B981)'
              : 'linear-gradient(135deg, #7F1D1D, #DC2626)',
            color: '#fff',
            borderRadius: 16,
            padding: 22,
            marginBottom: 16,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 22 }}>{passed ? 'Knowledge check passed' : 'Knowledge check not passed'}</h1>
          <p style={{ margin: '10px 0 0', fontSize: 15 }}>
            Score: <strong>{score}</strong> / {QUIZ.length} ({percent}%) · Threshold {MODULE_META.passing}%
          </p>
          <p style={{ margin: '10px 0 0', fontSize: 13, lineHeight: 1.5, opacity: 0.95 }}>
            {passed
              ? 'You met the knowledge standard for LVN-009. This does not by itself certify practical clinical competency. Observed demonstration and authorized sign-off remain separate per agency policy.'
              : 'Review the rationales, then retry. Focus on OPQRSTUV, paired reassessment, escalation to RN, and LVN scope limits on medication/POC changes.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setShowReview((v) => !v)}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              border: 'none',
              background: THEME.primary,
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {showReview ? 'Hide review' : 'Review answers'}
          </button>
          <button
            type="button"
            onClick={retryQuiz}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              border: 'none',
              background: THEME.accent,
              color: '#1E293B',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Retry quiz
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('learn');
              setPageIndex(0);
            }}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              border: 'none',
              background: THEME.dark,
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Review module content
          </button>
        </div>

        {showReview &&
          QUIZ.map((q, qi) => {
            const chosen = answers[qi];
            const ok = chosen === q.correct;
            return (
              <div
                key={q.id}
                style={{
                  background: THEME.white,
                  borderRadius: 12,
                  border: `1px solid ${ok ? '#A7F3D0' : '#FECACA'}`,
                  padding: 14,
                  marginBottom: 10,
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6, color: THEME.dark }}>
                  {qi + 1}. {q.stem}
                </div>
                <div style={{ fontSize: 12.5, marginBottom: 4 }}>
                  Your answer:{' '}
                  <strong style={{ color: ok ? THEME.success : THEME.danger }}>
                    {typeof chosen === 'number' ? `${String.fromCharCode(65 + chosen)}. ${q.options[chosen]}` : '—'}
                  </strong>
                </div>
                {!ok && (
                  <div style={{ fontSize: 12.5, marginBottom: 4 }}>
                    Correct:{' '}
                    <strong style={{ color: THEME.success }}>
                      {String.fromCharCode(65 + q.correct)}. {q.options[q.correct]}
                    </strong>
                  </div>
                )}
                <div style={{ fontSize: 12.5, color: THEME.muted, lineHeight: 1.45 }}>
                  <strong>Rationale:</strong> {q.rationale}
                </div>
              </div>
            );
          })}

        {submitted && passed && (
          <div
            style={{
              marginTop: 8,
              background: THEME.white,
              border: `1px solid ${THEME.border}`,
              borderRadius: 12,
              padding: 16,
              fontSize: 13,
              lineHeight: 1.55,
              color: '#334155',
            }}
          >
            <strong>Completion note:</strong> Knowledge module LVN-009 is complete at the quiz level. Continue agency
            competency processes (case study / observed practice / authorized sign-off) as required by policy. Remember:
            LVN assesses and reports pain within scope; RN/physician pathways handle POC and order changes.
          </div>
        )}
      </div>
    </div>
  );
};

export default LVN009PainAssessment;
