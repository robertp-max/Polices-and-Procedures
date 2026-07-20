/**
 * LVN-003 — RN Co-Signature & Supervision Requirements
 * Version: 5.4.0-RECOVERY
 * Policy: CL-CD-003 (14-day co-signature), CL-CD-004 (24h completion), 42 CFR § 484.115(e)
 * Agency intervals are training baselines; the current signed policy controls.
 * Interaction: Observe → Identify → Decide → Document → Feedback → Complete
 * Practical competency remains separate.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Compass, Eye, FileText, MessageSquare, RotateCcw,
  ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/lvn-003/lesson-01-why-co-sign.png';
import img02 from './assets/lvn-003/lesson-02-workflow.png';
import img03 from './assets/lvn-003/lesson-03-rn-review.png';
import img04 from './assets/lvn-003/lesson-04-supervision.png';
import img05 from './assets/lvn-003/lesson-05-flagged-notes.png';
import img06 from './assets/lvn-003/lesson-06-metrics.png';
import img07 from './assets/lvn-003/lesson-07-practice.png';

const CI = {
  teal: '#0F5B54', tealSoft: '#EEF4F3', tealMuted: '#C8DFDC',
  orange: '#B94718', orangeDark: '#A94018', ink: '#2D3748',
  muted: '#64748B', slate: '#64748B', border: '#E2E8F0', red: '#EF4444',
  white: '#FFFFFF', bg: '#F8FAFC', gold: '#C9A227',
} as const;

type ZoneKind = 'authorized' | 'conditional' | 'prohibited' | 'neutral';
type ScenarioStage = 'observe' | 'identify' | 'decide' | 'document' | 'feedback' | 'complete';

interface ScenarioChoice {
  id: string;
  label: string;
  correct: boolean;
  rationale: string;
}

interface ClinicalFeedbackData {
  observed: string;
  meaning: string;
  action: string;
  notify: string;
  document: string;
  policyRefs: string[];
}

interface Hotspot {
  id: string;
  label: string;
  shortLabel: string;
  ariaLabel?: string;
  x: number;
  y: number;
  zone: ZoneKind;
  leftAnchorId?: string;
  observe: string;
  identifyChoices: ScenarioChoice[];
  decideChoices: ScenarioChoice[];
  documentChoices: ScenarioChoice[];
  feedback: ClinicalFeedbackData;
  /** @deprecated legacy fields retained for transition */
  info?: string;
  meaning?: string;
  action?: string;
  notify?: string;
  document?: string;
  policyRefs?: string[];
}
interface KeyPoint { icon: string; title: string; detail: string; }
interface PageData {
  id: number; shortName: string; title: string; subtitle: string;
  narration: string[]; keyPoints: KeyPoint[]; clinicalTip: string;
  sourceLabels: { kind: string; text: string }[]; sceneImage: string; hotspots: Hotspot[];
}
interface QuizQuestion { id: number; stem: string; options: string[]; correct: number; rationale: string; }

const ZONE: Record<ZoneKind, { label: string; color: string; soft: string }> = {
  authorized: { label: 'Authorized', color: CI.teal, soft: CI.tealSoft },
  conditional: { label: 'Conditional', color: CI.orange, soft: '#FFF3EC' },
  prohibited: { label: 'Prohibited', color: CI.red, soft: '#FEF2F2' },
  neutral: { label: 'Guidance', color: CI.muted, soft: '#F1F5F9' },
};

const MODULE_META = { id: 'LVN-003', title: 'RN Co-Signature & Supervision Requirements', pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  'LVN submits a de-identified home-health visit note for RN co-signature review on a tablet.',
  'Supervising RN reviews a de-identified queue of submitted LVN visit notes.',
  'RN checks a de-identified LVN note and flags documentation areas needing review.',
  'RN and LVN correct a de-identified flagged visit note and prepare it for resubmission.',
  'Supervising RN co-signs a corrected de-identified LVN note and the record moves toward lock.',
  'De-identified dashboard shows a locked clinical record separated from a later addendum trail.',
  'RN and LVN review a de-identified oversight metrics dashboard for co-signature compliance.',
] as const;

const PAGES: PageData[] = [
  {
    "id": 0,
    "shortName": "Why Co-Sign",
    "title": "Why Co-Signatures Matter",
    "subtitle": "Three pillars of documentation oversight",
    "narration": [
      "Welcome to Module LVN-003. This module addresses the supervision and co-signature requirements that govern clinical documentation you produce as an LVN at Care Indeed. If LVN-002 defined the legal boundaries of what you may perform, this module defines the oversight structure that keeps documentation aligned with the plan of care and the standard of care.",
      "Co-signature requirements rest on three pillars. First, federal Conditions of Participation for home health agencies require that licensed practical/vocational nursing services be provided within an RN-supervised framework. CMS surveyors evaluate whether agencies maintain adequate professional supervision and personnel qualifications. Persistent gaps in supervision documentation can place an agency under heightened survey scrutiny. Exact deficiency levels and outcomes depend on the full survey record—not on any single missing signature alone.",
      "Second, co-signatures protect you. When a supervising RN reviews and co-signs your note, a second clinical eye has evaluated your observations, interventions, and plan-related narrative. If questions later arise about the appropriateness of care or documentation, the co-signed record shows that supervisory review occurred. That review is a professional safety net—not a substitute for your own accurate charting.",
      "Third, co-signatures protect patients. A structured second review helps catch incomplete vitals, weak clinical reasoning, interventions that do not match the authorized plan of care, and missed escalation cues. The co-signature step is a quality-assurance checkpoint in the continuum of care.",
      "Agency authentication standards are defined in CL-CD-003 (Clinical Record Authentication & Signature Requirements). Supervising RN co-signature on applicable LVN entries is due within 14 calendar days of the entry date. Visit-note completion timing follows CL-CD-004 (24-hour completion standard)."
    ],
    "keyPoints": [
      {
        "icon": "§",
        "title": "CMS framework",
        "detail": "42 CFR § 484.115(e) — LVN personnel qualifications within home health CoP supervision structure"
      },
      {
        "icon": "🛡",
        "title": "LVN protection",
        "detail": "RN review documents supervisory oversight of your clinical documentation"
      },
      {
        "icon": "♥",
        "title": "Patient safety",
        "detail": "Second clinical review catches incomplete, unclear, or misaligned documentation"
      },
      {
        "icon": "📋",
        "title": "Agency policy CL-CD-003",
        "detail": "Defines co-signature window, queues, and on-time target (agency policy—not a universal federal deadline)"
      }
    ],
    "clinicalTip": "Submit complete notes promptly so RN co-signature can occur within 14 calendar days (CL-CD-003).",
    "sourceLabels": [
      {
        "kind": "Federal",
        "text": "42 CFR § 484.115(e) — RN-supervised LVN services"
      },
      {
        "kind": "Agency",
        "text": "CL-CD-003 Authentication and co-signature"
      },
      {
        "kind": "Agency",
        "text": "CL-CD-004 Timely documentation"
      }
    ],
    "sceneImage": img01,
    "hotspots": [
      {
        "id": "pillar-cms",
        "label": "CMS framework",
        "shortLabel": "CMS framework",
        "ariaLabel": "Investigate CMS framework",
        "x": 55,
        "y": 55,
        "zone": "conditional",
        "leftAnchorId": "kp-0-0",
        "observe": "Federal CoPs require LVN services within an RN-supervised structure. Surveyors review supervision evidence; treat missing oversight documentation as a compliance risk, not a technicality.",
        "identifyChoices": [
          {
            "id": "i1",
            "label": "RN oversight of this LVN entry is part of the federal supervision evidence trail.",
            "correct": true,
            "rationale": "Correct. Co-signature supports the supervision evidence trail; it does not replace complete LVN charting."
          },
          {
            "id": "i2",
            "label": "Treat CMS framework as optional and skip the review requirement.",
            "correct": false,
            "rationale": "CMS framework is an agency supervision control, not an optional shortcut."
          },
          {
            "id": "i3",
            "label": "Assume RN co-signature will automatically repair any CMS framework defect.",
            "correct": false,
            "rationale": "Co-signature documents review; it does not silently repair incomplete or inaccurate LVN charting."
          }
        ],
        "decideChoices": [
          {
            "id": "d1",
            "label": "Proceed only after the entry is complete and ready for RN review under agency policy.",
            "correct": true,
            "rationale": "Correct. Complete a survey-ready note, then submit it for RN co-signature."
          },
          {
            "id": "d2",
            "label": "Proceed past CMS framework without resolving the identified gap.",
            "correct": false,
            "rationale": "Unresolved gaps must be corrected or escalated before the workflow advances."
          },
          {
            "id": "d3",
            "label": "Record RN approval before the RN has completed the review.",
            "correct": false,
            "rationale": "Never pre-document review, co-signature, or approval."
          }
        ],
        "documentChoices": [
          {
            "id": "doc1",
            "label": "Record a complete clinical entry and the submission timestamp for RN review.",
            "correct": true,
            "rationale": "Correct. Record clinician identity, complete visit facts, skilled care, patient response, and submission time."
          },
          {
            "id": "doc2",
            "label": "Document only that CMS framework was completed, without dates, findings, people, or disposition.",
            "correct": false,
            "rationale": "An unsupported completion statement is not an auditable supervision record."
          }
        ],
        "feedback": {
          "observed": "Federal CoPs require LVN services within an RN-supervised structure. Surveyors review supervision evidence; treat missing oversight documentation as a compliance risk, not a technicality.",
          "meaning": "Co-signature supports the supervision evidence trail; it does not replace complete LVN charting.",
          "action": "Complete a survey-ready note, then submit it for RN co-signature.",
          "notify": "Escalate to the RN or DON during the same shift if the entry cannot be made review-ready.",
          "document": "Record clinician identity, complete visit facts, skilled care, patient response, and submission time.",
          "policyRefs": [
            "CL-CD-003",
            "42 CFR § 484.115(e)"
          ]
        }
      },
      {
        "id": "pillar-lvn",
        "label": "LVN protection",
        "shortLabel": "LVN protection",
        "ariaLabel": "Investigate LVN protection",
        "x": 22,
        "y": 48,
        "zone": "conditional",
        "leftAnchorId": "kp-0-1",
        "observe": "A co-signed note shows a supervising RN reviewed your documentation. Keep your original note accurate—co-signature does not repair weak charting.",
        "identifyChoices": [
          {
            "id": "i1",
            "label": "RN review protects the oversight chain but cannot repair missing or unclear LVN documentation.",
            "correct": true,
            "rationale": "Correct. The LVN owns the original entry; co-signature is review, not silent rewriting."
          },
          {
            "id": "i2",
            "label": "Treat LVN protection as optional and skip the review requirement.",
            "correct": false,
            "rationale": "LVN protection is an agency supervision control, not an optional shortcut."
          },
          {
            "id": "i3",
            "label": "Assume RN co-signature will automatically repair any LVN protection defect.",
            "correct": false,
            "rationale": "Co-signature documents review; it does not silently repair incomplete or inaccurate LVN charting."
          }
        ],
        "decideChoices": [
          {
            "id": "d1",
            "label": "Hold submission until vitals, assessment, plan alignment, and notifications are complete.",
            "correct": true,
            "rationale": "Correct. Self-check the note, correct omissions, and then route it to the RN."
          },
          {
            "id": "d2",
            "label": "Proceed past LVN protection without resolving the identified gap.",
            "correct": false,
            "rationale": "Unresolved gaps must be corrected or escalated before the workflow advances."
          },
          {
            "id": "d3",
            "label": "Record RN approval before the RN has completed the review.",
            "correct": false,
            "rationale": "Never pre-document review, co-signature, or approval."
          }
        ],
        "documentChoices": [
          {
            "id": "doc1",
            "label": "Enter a complete LVN note that can stand on its own before RN review.",
            "correct": true,
            "rationale": "Correct. Record full findings, reasoning, ordered care, response, and notification details."
          },
          {
            "id": "doc2",
            "label": "Document only that LVN protection was completed, without dates, findings, people, or disposition.",
            "correct": false,
            "rationale": "An unsupported completion statement is not an auditable supervision record."
          }
        ],
        "feedback": {
          "observed": "A co-signed note shows a supervising RN reviewed your documentation. Keep your original note accurate—co-signature does not repair weak charting.",
          "meaning": "The LVN owns the original entry; co-signature is review, not silent rewriting.",
          "action": "Self-check the note, correct omissions, and then route it to the RN.",
          "notify": "Notify the covering RN promptly if a required element cannot be completed before shift end.",
          "document": "Record full findings, reasoning, ordered care, response, and notification details.",
          "policyRefs": [
            "CL-CD-003",
            "CL-CD-004"
          ]
        }
      },
      {
        "id": "pillar-safety",
        "label": "Patient safety",
        "shortLabel": "Patient safety",
        "ariaLabel": "Investigate Patient safety",
        "x": 78,
        "y": 72,
        "zone": "conditional",
        "leftAnchorId": "kp-0-2",
        "observe": "RN review looks for incomplete vitals, weak Assessment reasoning, POC misalignment, and missed RN notifications that could affect care continuity.",
        "identifyChoices": [
          {
            "id": "i1",
            "label": "RN review checks for incomplete vitals, weak assessment, POC mismatch, and missed notification.",
            "correct": true,
            "rationale": "Correct. The co-signature checkpoint can intercept specific documentation gaps that threaten continuity."
          },
          {
            "id": "i2",
            "label": "Treat Patient safety as optional and skip the review requirement.",
            "correct": false,
            "rationale": "Patient safety is an agency supervision control, not an optional shortcut."
          },
          {
            "id": "i3",
            "label": "Assume RN co-signature will automatically repair any Patient safety defect.",
            "correct": false,
            "rationale": "Co-signature documents review; it does not silently repair incomplete or inaccurate LVN charting."
          }
        ],
        "decideChoices": [
          {
            "id": "d1",
            "label": "Stop and correct any safety gap before routing; escalate unstable findings immediately.",
            "correct": true,
            "rationale": "Correct. Run a safety check on vitals, assessment, POC match, and notifications before submit."
          },
          {
            "id": "d2",
            "label": "Proceed past Patient safety without resolving the identified gap.",
            "correct": false,
            "rationale": "Unresolved gaps must be corrected or escalated before the workflow advances."
          },
          {
            "id": "d3",
            "label": "Record RN approval before the RN has completed the review.",
            "correct": false,
            "rationale": "Never pre-document review, co-signature, or approval."
          }
        ],
        "documentChoices": [
          {
            "id": "doc1",
            "label": "Record complete vitals, scoped assessment, POC-linked care, response, and notification details.",
            "correct": true,
            "rationale": "Correct. Record values, assessment evidence, interventions, response, recipient, notification time, and instructions."
          },
          {
            "id": "doc2",
            "label": "Document only that Patient safety was completed, without dates, findings, people, or disposition.",
            "correct": false,
            "rationale": "An unsupported completion statement is not an auditable supervision record."
          }
        ],
        "feedback": {
          "observed": "RN review looks for incomplete vitals, weak Assessment reasoning, POC misalignment, and missed RN notifications that could affect care continuity.",
          "meaning": "The co-signature checkpoint can intercept specific documentation gaps that threaten continuity.",
          "action": "Run a safety check on vitals, assessment, POC match, and notifications before submit.",
          "notify": "Notify the supervising RN immediately for unstable findings or a missed time-sensitive report.",
          "document": "Record values, assessment evidence, interventions, response, recipient, notification time, and instructions.",
          "policyRefs": [
            "CL-CD-003",
            "CL-CD-004"
          ]
        }
      }
    ]
  },
  {
    "id": 1,
    "shortName": "Workflow",
    "title": "The Co-Signature Workflow",
    "subtitle": "From visit note to locked record — six steps",
    "narration": [
      "The co-signature workflow at Care Indeed creates an auditable documentation chain. Understanding each step helps you submit complete notes the first time and avoid avoidable revision cycles.",
      "Step 1 — Complete the visit note. Use the agency EHR note structure (commonly SOAP). Populate required fields, document vital signs with method notes when required, record time-in/time-out, and write a clinical narrative that shows skilled observation and reasoning tied to the authorized plan of care. Do not claim RN-only actions (for example, independent plan-of-care changes, OASIS completion, diagnosis, or prescribing).",
      "Step 2 — Submit for RN review. Submission locks the note from casual editing, records a permanent submission timestamp, and routes the note to the assigned supervising RN’s review queue. Under CL-CD-003, this timestamp starts the agency co-signature review window (14 calendar days from the entry date).",
      "Step 3 — RN notification. The supervising RN receives EHR and/or email notification with patient identifiers, visit date, and your name. Pending notes are typically prioritized by age so older submissions are reviewed first."
    ],
    "keyPoints": [
      {
        "icon": "1",
        "title": "Complete & submit",
        "detail": "Full note → Submit locks note and starts the CL-CD-003 14-calendar-day co-signature window"
      },
      {
        "icon": "2",
        "title": "RN notified",
        "detail": "Dashboard/email alert; queue typically ordered by age"
      },
      {
        "icon": "3",
        "title": "RN reviews",
        "detail": "ID, vitals, SOAP quality, POC alignment, scope, timeliness"
      },
      {
        "icon": "4",
        "title": "Co-sign & lock",
        "detail": "Legal attestation → immutable record; addendum only for later corrections"
      }
    ],
    "clinicalTip": "Submit complete notes promptly so RN co-signature can occur within 14 calendar days (CL-CD-003).",
    "sourceLabels": [
      {
        "kind": "Agency",
        "text": "CL-CD-003 Authentication and co-signature"
      },
      {
        "kind": "Agency",
        "text": "CL-CD-004 Timely documentation"
      }
    ],
    "sceneImage": img02,
    "hotspots": [
      {
        "id": "step-submit",
        "label": "Submit",
        "shortLabel": "Submit",
        "ariaLabel": "Investigate Submit",
        "x": 50,
        "y": 55,
        "zone": "conditional",
        "leftAnchorId": "kp-1-0",
        "observe": "Submit locks the note and starts the agency co-signature clock. Final-check vitals, SOAP, time-in/out, RN notifications, and POC-linked interventions first.",
        "identifyChoices": [
          {
            "id": "i1",
            "label": "The final check is complete and the note is ready to lock, route, and start the agency clock.",
            "correct": true,
            "rationale": "Correct. Submission is the auditable handoff into the agency co-signature workflow."
          },
          {
            "id": "i2",
            "label": "Treat Submit as optional and skip the review requirement.",
            "correct": false,
            "rationale": "Submit is an agency supervision control, not an optional shortcut."
          },
          {
            "id": "i3",
            "label": "Assume RN co-signature will automatically repair any Submit defect.",
            "correct": false,
            "rationale": "Co-signature documents review; it does not silently repair incomplete or inaccurate LVN charting."
          }
        ],
        "decideChoices": [
          {
            "id": "d1",
            "label": "Proceed to submit only after identity, vitals, SOAP, POC, scope, and timing checks pass.",
            "correct": true,
            "rationale": "Correct. Complete the final check, submit, and confirm routing to the RN queue."
          },
          {
            "id": "d2",
            "label": "Proceed past Submit without resolving the identified gap.",
            "correct": false,
            "rationale": "Unresolved gaps must be corrected or escalated before the workflow advances."
          },
          {
            "id": "d3",
            "label": "Record RN approval before the RN has completed the review.",
            "correct": false,
            "rationale": "Never pre-document review, co-signature, or approval."
          }
        ],
        "documentChoices": [
          {
            "id": "doc1",
            "label": "Record submitter identity, submission time, and destination RN queue.",
            "correct": true,
            "rationale": "Correct. Record final-check completion, submission date/time, clinician identity, and RN queue."
          },
          {
            "id": "doc2",
            "label": "Document only that Submit was completed, without dates, findings, people, or disposition.",
            "correct": false,
            "rationale": "An unsupported completion statement is not an auditable supervision record."
          }
        ],
        "feedback": {
          "observed": "Submit locks the note and starts the agency co-signature clock. Final-check vitals, SOAP, time-in/out, RN notifications, and POC-linked interventions first.",
          "meaning": "Submission is the auditable handoff into the agency co-signature workflow.",
          "action": "Complete the final check, submit, and confirm routing to the RN queue.",
          "notify": "Notify the covering RN promptly if clinical urgency requires review faster than the routine queue.",
          "document": "Record final-check completion, submission date/time, clinician identity, and RN queue.",
          "policyRefs": [
            "CL-CD-003"
          ]
        }
      },
      {
        "id": "step-review",
        "label": "RN reviews",
        "shortLabel": "RN reviews",
        "ariaLabel": "Investigate RN reviews",
        "x": 70,
        "y": 70,
        "zone": "conditional",
        "leftAnchorId": "kp-1-1",
        "observe": "RN checks identity, logistics, vitals, narrative quality, POC match, scope boundaries, and submission timeliness. Expect real clinical scrutiny.",
        "identifyChoices": [
          {
            "id": "i1",
            "label": "RN review covers identity, logistics, vitals, SOAP quality, POC alignment, scope, and timeliness.",
            "correct": true,
            "rationale": "Correct. Structured RN review determines whether the note can be co-signed or must be returned."
          },
          {
            "id": "i2",
            "label": "Treat RN reviews as optional and skip the review requirement.",
            "correct": false,
            "rationale": "RN reviews is an agency supervision control, not an optional shortcut."
          },
          {
            "id": "i3",
            "label": "Assume RN co-signature will automatically repair any RN reviews defect.",
            "correct": false,
            "rationale": "Co-signature documents review; it does not silently repair incomplete or inaccurate LVN charting."
          }
        ],
        "decideChoices": [
          {
            "id": "d1",
            "label": "Proceed to co-sign only when every review domain passes; otherwise hold and return with specific feedback.",
            "correct": true,
            "rationale": "Correct. Complete the review and either co-sign or return the note with actionable feedback."
          },
          {
            "id": "d2",
            "label": "Proceed past RN reviews without resolving the identified gap.",
            "correct": false,
            "rationale": "Unresolved gaps must be corrected or escalated before the workflow advances."
          },
          {
            "id": "d3",
            "label": "Record RN approval before the RN has completed the review.",
            "correct": false,
            "rationale": "Never pre-document review, co-signature, or approval."
          }
        ],
        "documentChoices": [
          {
            "id": "doc1",
            "label": "Record the RN review result, domain-specific correction items, reviewer, and time.",
            "correct": true,
            "rationale": "Correct. Record domains checked, pass/return result, feedback, RN identity, and review timestamp."
          },
          {
            "id": "doc2",
            "label": "Document only that RN reviews was completed, without dates, findings, people, or disposition.",
            "correct": false,
            "rationale": "An unsupported completion statement is not an auditable supervision record."
          }
        ],
        "feedback": {
          "observed": "RN checks identity, logistics, vitals, narrative quality, POC match, scope boundaries, and submission timeliness. Expect real clinical scrutiny.",
          "meaning": "Structured RN review determines whether the note can be co-signed or must be returned.",
          "action": "Complete the review and either co-sign or return the note with actionable feedback.",
          "notify": "Notify the LVN promptly when a note is returned so the agency correction window remains usable.",
          "document": "Record domains checked, pass/return result, feedback, RN identity, and review timestamp.",
          "policyRefs": [
            "CL-CD-003",
            "CL-CD-004"
          ]
        }
      },
      {
        "id": "step-lock",
        "label": "Locked record",
        "shortLabel": "Locked record",
        "ariaLabel": "Investigate Locked record",
        "x": 30,
        "y": 40,
        "zone": "authorized",
        "leftAnchorId": "kp-1-2",
        "observe": "After co-signature the record is locked. Corrections use a formal addendum with its own timestamp trail—never overwrite the original.",
        "identifyChoices": [
          {
            "id": "i1",
            "label": "After co-signature, the original record is immutable except through a formal addendum.",
            "correct": true,
            "rationale": "Correct. Locking preserves the original supervised record and its audit trail."
          },
          {
            "id": "i2",
            "label": "Treat Locked record as optional and skip the review requirement.",
            "correct": false,
            "rationale": "Locked record is an agency supervision control, not an optional shortcut."
          },
          {
            "id": "i3",
            "label": "Assume RN co-signature will automatically repair any Locked record defect.",
            "correct": false,
            "rationale": "Co-signature documents review; it does not silently repair incomplete or inaccurate LVN charting."
          }
        ],
        "decideChoices": [
          {
            "id": "d1",
            "label": "Proceed to lock after co-sign; stop informal edits and use a timestamped addendum for later correction.",
            "correct": true,
            "rationale": "Correct. Finalize the lock; use a formal addendum rather than overwriting the original."
          },
          {
            "id": "d2",
            "label": "Proceed past Locked record without resolving the identified gap.",
            "correct": false,
            "rationale": "Unresolved gaps must be corrected or escalated before the workflow advances."
          },
          {
            "id": "d3",
            "label": "Record RN approval before the RN has completed the review.",
            "correct": false,
            "rationale": "Never pre-document review, co-signature, or approval."
          }
        ],
        "documentChoices": [
          {
            "id": "doc1",
            "label": "Record co-sign/lock time and any later addendum as a separate attributed entry.",
            "correct": true,
            "rationale": "Correct. Record RN identity, lock time, and addendum author, time, reason, and corrected facts."
          },
          {
            "id": "doc2",
            "label": "Document only that Locked record was completed, without dates, findings, people, or disposition.",
            "correct": false,
            "rationale": "An unsupported completion statement is not an auditable supervision record."
          }
        ],
        "feedback": {
          "observed": "After co-signature the record is locked. Corrections use a formal addendum with its own timestamp trail—never overwrite the original.",
          "meaning": "Locking preserves the original supervised record and its audit trail.",
          "action": "Finalize the lock; use a formal addendum rather than overwriting the original.",
          "notify": "Notify the RN and DON the same shift if an addendum changes safety-critical content.",
          "document": "Record RN identity, lock time, and addendum author, time, reason, and corrected facts.",
          "policyRefs": [
            "CL-CD-003"
          ]
        }
      }
    ]
  },
  {
    "id": 2,
    "shortName": "RN Review",
    "title": "What the RN Reviews",
    "subtitle": "The 10-point clinical review protocol",
    "narration": [
      "Knowing what the supervising RN looks for helps you produce documentation that passes on the first attempt. Care Indeed RNs follow a standardized 10-point review protocol for every LVN note they co-sign (agency protocol under CL-CD-003).",
      "Points 1–3: Patient identification, visit logistics, and vital signs. The RN verifies correct patient name/MRN/DOB match, actual visit times, and required vital-sign parameters with appropriate methodology notes.",
      "Point 4: Note structure compliance. Sections must be complete—no blank required fields and no generic placeholder language that fails to show skilled observation.",
      "Point 5: Assessment quality. This is typically the most intensively reviewed element. The Assessment must show clinical reasoning—not merely restate objective data. Connect patient-reported symptoms to observations, identify trends (improving, declining, stable), and justify continued need for skilled services within your LVN scope. You do not diagnose or independently revise the plan of care."
    ],
    "keyPoints": [
      {
        "icon": "✓",
        "title": "ID + logistics + vitals",
        "detail": "Correct patient, visit times, complete vital signs"
      },
      {
        "icon": "✓",
        "title": "Structure + Assessment",
        "detail": "Complete sections; Assessment shows clinical reasoning and trends"
      },
      {
        "icon": "✓",
        "title": "POC alignment",
        "detail": "Interventions match orders; patient response documented"
      },
      {
        "icon": "✓",
        "title": "Scope + timeliness",
        "detail": "No out-of-scope claims; submitted per agency time standards"
      }
    ],
    "clinicalTip": "Submit complete notes promptly so RN co-signature can occur within 14 calendar days (CL-CD-003).",
    "sourceLabels": [
      {
        "kind": "Agency",
        "text": "CL-CD-003 RN review workflow"
      },
      {
        "kind": "Agency",
        "text": "CL-CD-004 Timely documentation"
      }
    ],
    "sceneImage": img03,
    "hotspots": [
      {
        "id": "review-assessment",
        "label": "Assessment quality",
        "shortLabel": "Assessment q…",
        "ariaLabel": "Investigate Assessment quality",
        "x": 40,
        "y": 50,
        "zone": "authorized",
        "leftAnchorId": "kp-2-0",
        "observe": "Most scrutinized element. Strong Assessment: finding → interpretation → evidence → trend vs prior visit → why skilled services remain necessary (within LVN scope).",
        "identifyChoices": [
          {
            "id": "i1",
            "label": "Assessment must connect finding, interpretation, evidence, trend, and skilled need within LVN scope.",
            "correct": true,
            "rationale": "Correct. A defensible Assessment demonstrates scoped reasoning rather than repeating measurements."
          },
          {
            "id": "i2",
            "label": "Treat Assessment quality as optional and skip the review requirement.",
            "correct": false,
            "rationale": "Assessment quality is an agency supervision control, not an optional shortcut."
          },
          {
            "id": "i3",
            "label": "Assume RN co-signature will automatically repair any Assessment quality defect.",
            "correct": false,
            "rationale": "Co-signature documents review; it does not silently repair incomplete or inaccurate LVN charting."
          }
        ],
        "decideChoices": [
          {
            "id": "d1",
            "label": "Hold co-sign and return the note when that reasoning chain is missing or out of scope.",
            "correct": true,
            "rationale": "Correct. Complete the reasoning chain before RN co-signature."
          },
          {
            "id": "d2",
            "label": "Proceed past Assessment quality without resolving the identified gap.",
            "correct": false,
            "rationale": "Unresolved gaps must be corrected or escalated before the workflow advances."
          },
          {
            "id": "d3",
            "label": "Record RN approval before the RN has completed the review.",
            "correct": false,
            "rationale": "Never pre-document review, co-signature, or approval."
          }
        ],
        "documentChoices": [
          {
            "id": "doc1",
            "label": "Record each link: finding, interpretation, evidence, trend comparison, and skilled need.",
            "correct": true,
            "rationale": "Correct. Record findings, interpretation, supporting evidence, prior trend, skilled need, and RN direction."
          },
          {
            "id": "doc2",
            "label": "Document only that Assessment quality was completed, without dates, findings, people, or disposition.",
            "correct": false,
            "rationale": "An unsupported completion statement is not an auditable supervision record."
          }
        ],
        "feedback": {
          "observed": "Most scrutinized element. Strong Assessment: finding → interpretation → evidence → trend vs prior visit → why skilled services remain necessary (within LVN scope).",
          "meaning": "A defensible Assessment demonstrates scoped reasoning rather than repeating measurements.",
          "action": "Complete the reasoning chain before RN co-signature.",
          "notify": "Notify the RN during the visit or shift for concerning trends or changed skilled needs.",
          "document": "Record findings, interpretation, supporting evidence, prior trend, skilled need, and RN direction.",
          "policyRefs": [
            "CL-CD-003",
            "CL-CD-004"
          ]
        }
      },
      {
        "id": "review-poc",
        "label": "POC alignment",
        "shortLabel": "POC alignment",
        "ariaLabel": "Investigate POC alignment",
        "x": 60,
        "y": 55,
        "zone": "conditional",
        "leftAnchorId": "kp-2-1",
        "observe": "Interventions must match the authorized plan of care. If needs change, notify the RN—do not independently rewrite the POC.",
        "identifyChoices": [
          {
            "id": "i1",
            "label": "Documented interventions must match the authorized POC; changes require RN direction.",
            "correct": true,
            "rationale": "Correct. POC review verifies that charted care was authorized and that changes were not made independently."
          },
          {
            "id": "i2",
            "label": "Treat POC alignment as optional and skip the review requirement.",
            "correct": false,
            "rationale": "POC alignment is an agency supervision control, not an optional shortcut."
          },
          {
            "id": "i3",
            "label": "Assume RN co-signature will automatically repair any POC alignment defect.",
            "correct": false,
            "rationale": "Co-signature documents review; it does not silently repair incomplete or inaccurate LVN charting."
          }
        ],
        "decideChoices": [
          {
            "id": "d1",
            "label": "Proceed when care matches the POC; hold and escalate any mismatch before claiming a change.",
            "correct": true,
            "rationale": "Correct. Compare each intervention with the current POC and route needed changes to the RN."
          },
          {
            "id": "d2",
            "label": "Proceed past POC alignment without resolving the identified gap.",
            "correct": false,
            "rationale": "Unresolved gaps must be corrected or escalated before the workflow advances."
          },
          {
            "id": "d3",
            "label": "Record RN approval before the RN has completed the review.",
            "correct": false,
            "rationale": "Never pre-document review, co-signature, or approval."
          }
        ],
        "documentChoices": [
          {
            "id": "doc1",
            "label": "Tie each intervention to the authorized POC and record RN direction for any variance.",
            "correct": true,
            "rationale": "Correct. Record intervention, POC reference, variance, notification time, person reached, and direction."
          },
          {
            "id": "doc2",
            "label": "Document only that POC alignment was completed, without dates, findings, people, or disposition.",
            "correct": false,
            "rationale": "An unsupported completion statement is not an auditable supervision record."
          }
        ],
        "feedback": {
          "observed": "Interventions must match the authorized plan of care. If needs change, notify the RN—do not independently rewrite the POC.",
          "meaning": "POC review verifies that charted care was authorized and that changes were not made independently.",
          "action": "Compare each intervention with the current POC and route needed changes to the RN.",
          "notify": "Notify the RN the same shift, or sooner for safety risk, when a POC change or variance is identified.",
          "document": "Record intervention, POC reference, variance, notification time, person reached, and direction.",
          "policyRefs": [
            "CL-CD-003",
            "CL-CD-004"
          ]
        }
      },
      {
        "id": "review-scope",
        "label": "Scope check",
        "shortLabel": "Scope check",
        "ariaLabel": "Investigate Scope check",
        "x": 75,
        "y": 70,
        "zone": "conditional",
        "leftAnchorId": "kp-2-2",
        "observe": "RN screens for language implying RN-only or unauthorized acts. Accurate scope language protects your license and the agency.",
        "identifyChoices": [
          {
            "id": "i1",
            "label": "The note must not claim RN-only or otherwise unauthorized actions.",
            "correct": true,
            "rationale": "Correct. Co-signature cannot authorize practice outside LVN scope."
          },
          {
            "id": "i2",
            "label": "Treat Scope check as optional and skip the review requirement.",
            "correct": false,
            "rationale": "Scope check is an agency supervision control, not an optional shortcut."
          },
          {
            "id": "i3",
            "label": "Assume RN co-signature will automatically repair any Scope check defect.",
            "correct": false,
            "rationale": "Co-signature documents review; it does not silently repair incomplete or inaccurate LVN charting."
          }
        ],
        "decideChoices": [
          {
            "id": "d1",
            "label": "Stop and revise an out-of-scope claim; escalate immediately if an out-of-scope act occurred.",
            "correct": true,
            "rationale": "Correct. Correct scope language and obtain RN direction before the note advances."
          },
          {
            "id": "d2",
            "label": "Proceed past Scope check without resolving the identified gap.",
            "correct": false,
            "rationale": "Unresolved gaps must be corrected or escalated before the workflow advances."
          },
          {
            "id": "d3",
            "label": "Record RN approval before the RN has completed the review.",
            "correct": false,
            "rationale": "Never pre-document review, co-signature, or approval."
          }
        ],
        "documentChoices": [
          {
            "id": "doc1",
            "label": "Use LVN-scope language and attribute RN determinations or orders to the RN.",
            "correct": true,
            "rationale": "Correct. Record corrected wording, RN direction, time, and required incident follow-up."
          },
          {
            "id": "doc2",
            "label": "Document only that Scope check was completed, without dates, findings, people, or disposition.",
            "correct": false,
            "rationale": "An unsupported completion statement is not an auditable supervision record."
          }
        ],
        "feedback": {
          "observed": "RN screens for language implying RN-only or unauthorized acts. Accurate scope language protects your license and the agency.",
          "meaning": "Co-signature cannot authorize practice outside LVN scope.",
          "action": "Correct scope language and obtain RN direction before the note advances.",
          "notify": "Notify the RN or DON immediately when a scope breach or uncertainty is identified.",
          "document": "Record corrected wording, RN direction, time, and required incident follow-up.",
          "policyRefs": [
            "CL-CD-003",
            "CL-CD-004",
            "42 CFR § 484.115(e)"
          ]
        }
      }
    ]
  },
  {
    "id": 3,
    "shortName": "Supervision",
    "title": "Supervision Beyond Co-Signatures",
    "subtitle": "The full LVN oversight framework (agency policy layers)",
    "narration": [
      "Co-signature review is one layer of LVN oversight. Federal home health rules require skilled services under appropriate professional supervision; Care Indeed implements a multi-layer schedule in agency policy CL-CD-003. Treat the intervals below as agency policy—not as invented universal federal visit minima.",
      "Layer 1 — Every-visit documentation review: Each LVN visit note receives RN co-signature review within the agency window (14 calendar days from the entry date under CL-CD-003). This creates a continuous, auditable supervision trail for clinical encounters.",
      "Layer 2 — Bi-weekly supervisory visit (every 14 days per CL-CD-003): The supervising RN accompanies you on a patient visit for direct observation of assessment technique, communication, clinical decision-making within scope, and documentation habits. The RN documents a supervisory visit note against competency criteria.",
      "Layer 3 — Monthly competency/documentation check (every 30 days per CL-CD-003): Formal review of documentation quality trends, recurring flag themes, and targeted coaching. High-risk skills may require re-demonstration per agency competency policy."
    ],
    "keyPoints": [
      {
        "icon": "①",
        "title": "Every visit",
        "detail": "Co-signature review within agency 14-calendar-day window — continuous oversight"
      },
      {
        "icon": "②",
        "title": "Every 14 days",
        "detail": "RN supervisory visit with direct observation (CL-CD-003)"
      },
      {
        "icon": "③",
        "title": "Every 30 days",
        "detail": "Documentation quality review + targeted skills coaching (CL-CD-003)"
      },
      {
        "icon": "④",
        "title": "90-day / ongoing",
        "detail": "Comprehensive competency evaluation — observed sign-off remains separate"
      }
    ],
    "clinicalTip": "Submit complete notes promptly so RN co-signature can occur within 14 calendar days (CL-CD-003).",
    "sourceLabels": [
      {
        "kind": "Federal",
        "text": "42 CFR § 484.115(e) — RN supervision"
      },
      {
        "kind": "Agency",
        "text": "CL-CD-003 Supervision cadence; current signed policy controls"
      },
      {
        "kind": "Agency",
        "text": "CL-CD-004 Quality review"
      }
    ],
    "sceneImage": img04,
    "hotspots": [
      {
        "id": "layer-1",
        "label": "Every visit",
        "shortLabel": "Every visit",
        "ariaLabel": "Investigate Every visit",
        "x": 72,
        "y": 38,
        "zone": "authorized",
        "leftAnchorId": "kp-3-0",
        "observe": "Co-signature is the minimum documentation oversight for each LVN clinical encounter under agency policy. No visit note is “exempt.”",
        "identifyChoices": [
          {
            "id": "i1",
            "label": "Every visit note enters RN co-sign review under the agency policy window.",
            "correct": true,
            "rationale": "Correct. Every-visit co-signature is the first agency supervision layer; current signed policy controls."
          },
          {
            "id": "i2",
            "label": "Treat Every visit as optional and skip the review requirement.",
            "correct": false,
            "rationale": "Every visit is an agency supervision control, not an optional shortcut."
          },
          {
            "id": "i3",
            "label": "Assume RN co-signature will automatically repair any Every visit defect.",
            "correct": false,
            "rationale": "Co-signature documents review; it does not silently repair incomplete or inaccurate LVN charting."
          }
        ],
        "decideChoices": [
          {
            "id": "d1",
            "label": "Proceed with every-visit routing; escalate before the agency deadline if co-signature is at risk.",
            "correct": true,
            "rationale": "Correct. Submit every finalized visit note and track it through RN co-signature."
          },
          {
            "id": "d2",
            "label": "Proceed past Every visit without resolving the identified gap.",
            "correct": false,
            "rationale": "Unresolved gaps must be corrected or escalated before the workflow advances."
          },
          {
            "id": "d3",
            "label": "Record RN approval before the RN has completed the review.",
            "correct": false,
            "rationale": "Never pre-document review, co-signature, or approval."
          }
        ],
        "documentChoices": [
          {
            "id": "doc1",
            "label": "Record submission and co-sign timestamps against the agency 14-calendar-day baseline.",
            "correct": true,
            "rationale": "Correct. Record entry ID, policy reference point, submission time, reviewer, and co-sign time."
          },
          {
            "id": "doc2",
            "label": "Document only that Every visit was completed, without dates, findings, people, or disposition.",
            "correct": false,
            "rationale": "An unsupported completion statement is not an auditable supervision record."
          }
        ],
        "feedback": {
          "observed": "Co-signature is the minimum documentation oversight for each LVN clinical encounter under agency policy. No visit note is “exempt.”",
          "meaning": "Every-visit co-signature is the first agency supervision layer; current signed policy controls.",
          "action": "Submit every finalized visit note and track it through RN co-signature.",
          "notify": "Notify the RN or DON before a co-signature deadline is missed.",
          "document": "Record entry ID, policy reference point, submission time, reviewer, and co-sign time.",
          "policyRefs": [
            "CL-CD-003"
          ]
        }
      },
      {
        "id": "layer-2",
        "label": "Bi-weekly visit",
        "shortLabel": "Bi-weekly vi…",
        "ariaLabel": "Investigate Bi-weekly visit",
        "x": 55,
        "y": 58,
        "zone": "conditional",
        "leftAnchorId": "kp-3-1",
        "observe": "Direct observation visit. Schedule proactively with your supervising RN. Observation feedback accelerates safe skill growth.",
        "identifyChoices": [
          {
            "id": "i1",
            "label": "Direct supervisory observation is separate from chart review and follows the agency cadence.",
            "correct": true,
            "rationale": "Correct. Direct observation is an agency supervision layer; the current signed policy controls the cadence."
          },
          {
            "id": "i2",
            "label": "Treat Bi-weekly visit as optional and skip the review requirement.",
            "correct": false,
            "rationale": "Bi-weekly visit is an agency supervision control, not an optional shortcut."
          },
          {
            "id": "i3",
            "label": "Assume RN co-signature will automatically repair any Bi-weekly visit defect.",
            "correct": false,
            "rationale": "Co-signature documents review; it does not silently repair incomplete or inaccurate LVN charting."
          }
        ],
        "decideChoices": [
          {
            "id": "d1",
            "label": "Proceed to schedule the agency 14-day observation baseline; escalate before a missed interval.",
            "correct": true,
            "rationale": "Correct. Schedule, complete, and document supervisory observation under agency policy."
          },
          {
            "id": "d2",
            "label": "Proceed past Bi-weekly visit without resolving the identified gap.",
            "correct": false,
            "rationale": "Unresolved gaps must be corrected or escalated before the workflow advances."
          },
          {
            "id": "d3",
            "label": "Record RN approval before the RN has completed the review.",
            "correct": false,
            "rationale": "Never pre-document review, co-signature, or approval."
          }
        ],
        "documentChoices": [
          {
            "id": "doc1",
            "label": "Record observation date, RN observer, skills observed, findings, coaching, and follow-up.",
            "correct": true,
            "rationale": "Correct. Record due/completed dates, observer, competencies, outcome, and corrective plan."
          },
          {
            "id": "doc2",
            "label": "Document only that Bi-weekly visit was completed, without dates, findings, people, or disposition.",
            "correct": false,
            "rationale": "An unsupported completion statement is not an auditable supervision record."
          }
        ],
        "feedback": {
          "observed": "Direct observation visit. Schedule proactively with your supervising RN. Observation feedback accelerates safe skill growth.",
          "meaning": "Direct observation is an agency supervision layer; the current signed policy controls the cadence.",
          "action": "Schedule, complete, and document supervisory observation under agency policy.",
          "notify": "Notify the scheduling RN or DON before the observation interval closes if completion is at risk.",
          "document": "Record due/completed dates, observer, competencies, outcome, and corrective plan.",
          "policyRefs": [
            "CL-CD-003",
            "42 CFR § 484.115(e)"
          ]
        }
      },
      {
        "id": "layer-3",
        "label": "Monthly check",
        "shortLabel": "Monthly check",
        "ariaLabel": "Investigate Monthly check",
        "x": 30,
        "y": 70,
        "zone": "conditional",
        "leftAnchorId": "kp-3-2",
        "observe": "Trend review of flags, documentation quality, and skills needing re-check. Bring questions and examples of difficult notes.",
        "identifyChoices": [
          {
            "id": "i1",
            "label": "Monthly quality review looks for trends in flags, documentation, and coaching needs.",
            "correct": true,
            "rationale": "Correct. Trend review can reveal repeated risks that individual co-signatures do not show."
          },
          {
            "id": "i2",
            "label": "Treat Monthly check as optional and skip the review requirement.",
            "correct": false,
            "rationale": "Monthly check is an agency supervision control, not an optional shortcut."
          },
          {
            "id": "i3",
            "label": "Assume RN co-signature will automatically repair any Monthly check defect.",
            "correct": false,
            "rationale": "Co-signature documents review; it does not silently repair incomplete or inaccurate LVN charting."
          }
        ],
        "decideChoices": [
          {
            "id": "d1",
            "label": "Proceed with monthly review; escalate recurring safety or competency patterns to the DON.",
            "correct": true,
            "rationale": "Correct. Review co-sign timeliness, flags, and observation outcomes each month under agency policy."
          },
          {
            "id": "d2",
            "label": "Proceed past Monthly check without resolving the identified gap.",
            "correct": false,
            "rationale": "Unresolved gaps must be corrected or escalated before the workflow advances."
          },
          {
            "id": "d3",
            "label": "Record RN approval before the RN has completed the review.",
            "correct": false,
            "rationale": "Never pre-document review, co-signature, or approval."
          }
        ],
        "documentChoices": [
          {
            "id": "doc1",
            "label": "Record the review period, metrics, themes, coaching, actions, and reassessment date.",
            "correct": true,
            "rationale": "Correct. Record sample/metrics, themes, coached staff, action owners, and follow-up date."
          },
          {
            "id": "doc2",
            "label": "Document only that Monthly check was completed, without dates, findings, people, or disposition.",
            "correct": false,
            "rationale": "An unsupported completion statement is not an auditable supervision record."
          }
        ],
        "feedback": {
          "observed": "Trend review of flags, documentation quality, and skills needing re-check. Bring questions and examples of difficult notes.",
          "meaning": "Trend review can reveal repeated risks that individual co-signatures do not show.",
          "action": "Review co-sign timeliness, flags, and observation outcomes each month under agency policy.",
          "notify": "Notify the RN or DON promptly when recurring high-risk themes appear.",
          "document": "Record sample/metrics, themes, coached staff, action owners, and follow-up date.",
          "policyRefs": [
            "CL-CD-003",
            "CL-CD-004"
          ]
        }
      }
    ]
  },
  {
    "id": 4,
    "shortName": "Flagged Notes",
    "title": "When Your Note Is Flagged",
    "subtitle": "Revision workflow — feedback into better documentation",
    "narration": [
      "Some LVN notes are returned (flagged) during co-signature review. A flag means the RN identified one or more elements that need strengthening before co-signature—not that you are “failed.” Flagging is a quality-improvement tool.",
      "When flagged, the system unlocks the note for correction and sends notification with specific feedback. Common reasons include: Assessment lacks clinical reasoning (most frequent theme), incomplete vital signs, generic language that does not show skilled observation, missing RN-notification documentation, and interventions not clearly aligned with the plan of care.",
      "Your responsibility: read the feedback carefully, correct the root issue, and re-submit within the agency revision window (24 hours under CL-CD-003). Do not merely add one vague sentence—rewrite the weak section so it meets the review standard.",
      "After re-submission, the RN focuses review on flagged elements. Adequate correction leads to co-signature and lock. Persistent issues may produce a second flag. Under CL-CD-003, recurring documentation flags are escalated through the agency quality review process with the supervising RN and Director of Nursing (agency escalation procedure)."
    ],
    "keyPoints": [
      {
        "icon": "⚑",
        "title": "Flag = improve",
        "detail": "Quality tool with specific feedback—not a punitive label"
      },
      {
        "icon": "✎",
        "title": "Correct thoroughly",
        "detail": "Fix the root cause of the feedback, not just a token sentence"
      },
      {
        "icon": "⏱",
        "title": "24-hour revision",
        "detail": "Re-submit within CL-CD-003 revision window after a flag"
      },
      {
        "icon": "🎯",
        "title": "Pattern coaching",
        "detail": ">2 flags on one note → mandatory RN/DON coaching (agency policy)"
      }
    ],
    "clinicalTip": "Submit complete notes promptly so RN co-signature can occur within 14 calendar days (CL-CD-003).",
    "sourceLabels": [
      {
        "kind": "Agency",
        "text": "CL-CD-003 Flag, correction, and coaching workflow"
      },
      {
        "kind": "Agency",
        "text": "CL-CD-004 Timely documentation"
      }
    ],
    "sceneImage": img05,
    "hotspots": [
      {
        "id": "approved-path",
        "label": "Approved path",
        "shortLabel": "Approved path",
        "ariaLabel": "Investigate Approved path",
        "x": 55,
        "y": 50,
        "zone": "authorized",
        "leftAnchorId": "kp-4-0",
        "observe": "First-pass co-signature when all review criteria are met. This is the target path—complete, specific, in-scope notes.",
        "identifyChoices": [
          {
            "id": "i1",
            "label": "The note meets identity, clinical, POC, scope, and timeliness criteria on first review.",
            "correct": true,
            "rationale": "Correct. First-pass approval is appropriate only for a complete, specific, in-scope note."
          },
          {
            "id": "i2",
            "label": "Treat Approved path as optional and skip the review requirement.",
            "correct": false,
            "rationale": "Approved path is an agency supervision control, not an optional shortcut."
          },
          {
            "id": "i3",
            "label": "Assume RN co-signature will automatically repair any Approved path defect.",
            "correct": false,
            "rationale": "Co-signature documents review; it does not silently repair incomplete or inaccurate LVN charting."
          }
        ],
        "decideChoices": [
          {
            "id": "d1",
            "label": "Proceed to RN co-signature and lock when all criteria pass.",
            "correct": true,
            "rationale": "Correct. Co-sign and lock the complete note without unnecessary return."
          },
          {
            "id": "d2",
            "label": "Proceed past Approved path without resolving the identified gap.",
            "correct": false,
            "rationale": "Unresolved gaps must be corrected or escalated before the workflow advances."
          },
          {
            "id": "d3",
            "label": "Record RN approval before the RN has completed the review.",
            "correct": false,
            "rationale": "Never pre-document review, co-signature, or approval."
          }
        ],
        "documentChoices": [
          {
            "id": "doc1",
            "label": "Record approval, RN identity, co-sign time, and record-lock time.",
            "correct": true,
            "rationale": "Correct. Record review approval, RN identity, co-sign/lock times, and existing clinical communications."
          },
          {
            "id": "doc2",
            "label": "Document only that Approved path was completed, without dates, findings, people, or disposition.",
            "correct": false,
            "rationale": "An unsupported completion statement is not an auditable supervision record."
          }
        ],
        "feedback": {
          "observed": "First-pass co-signature when all review criteria are met. This is the target path—complete, specific, in-scope notes.",
          "meaning": "First-pass approval is appropriate only for a complete, specific, in-scope note.",
          "action": "Co-sign and lock the complete note without unnecessary return.",
          "notify": "No workflow notice is needed for clean approval; complete any separate clinical notification already indicated.",
          "document": "Record review approval, RN identity, co-sign/lock times, and existing clinical communications.",
          "policyRefs": [
            "CL-CD-003"
          ]
        }
      },
      {
        "id": "flagged-path",
        "label": "Flagged path",
        "shortLabel": "Flagged path",
        "ariaLabel": "Investigate Flagged path",
        "x": 70,
        "y": 40,
        "zone": "conditional",
        "leftAnchorId": "kp-4-1",
        "observe": "Note returned with RN feedback. Correct thoroughly and re-submit within 24 hours (CL-CD-003).",
        "identifyChoices": [
          {
            "id": "i1",
            "label": "The note was returned with specific feedback and requires thorough correction within the agency 24-hour window.",
            "correct": true,
            "rationale": "Correct. A flag is a quality-control return, not permission for a token sentence or silent edit."
          },
          {
            "id": "i2",
            "label": "Treat Flagged path as optional and skip the review requirement.",
            "correct": false,
            "rationale": "Flagged path is an agency supervision control, not an optional shortcut."
          },
          {
            "id": "i3",
            "label": "Assume RN co-signature will automatically repair any Flagged path defect.",
            "correct": false,
            "rationale": "Co-signature documents review; it does not silently repair incomplete or inaccurate LVN charting."
          }
        ],
        "decideChoices": [
          {
            "id": "d1",
            "label": "Hold co-sign, return with actionable feedback, and escalate if the agency correction window is missed.",
            "correct": true,
            "rationale": "Correct. Correct the root issue within the agency 24-hour baseline and resubmit; current signed policy controls."
          },
          {
            "id": "d2",
            "label": "Proceed past Flagged path without resolving the identified gap.",
            "correct": false,
            "rationale": "Unresolved gaps must be corrected or escalated before the workflow advances."
          },
          {
            "id": "d3",
            "label": "Record RN approval before the RN has completed the review.",
            "correct": false,
            "rationale": "Never pre-document review, co-signature, or approval."
          }
        ],
        "documentChoices": [
          {
            "id": "doc1",
            "label": "Record flag reasons, return time, required corrections, resubmission time, and final outcome.",
            "correct": true,
            "rationale": "Correct. Record feedback, return timestamp, corrected content, resubmit timestamp, reviewer, and disposition."
          },
          {
            "id": "doc2",
            "label": "Document only that Flagged path was completed, without dates, findings, people, or disposition.",
            "correct": false,
            "rationale": "An unsupported completion statement is not an auditable supervision record."
          }
        ],
        "feedback": {
          "observed": "Note returned with RN feedback. Correct thoroughly and re-submit within 24 hours (CL-CD-003).",
          "meaning": "A flag is a quality-control return, not permission for a token sentence or silent edit.",
          "action": "Correct the root issue within the agency 24-hour baseline and resubmit; current signed policy controls.",
          "notify": "Notify the LVN promptly on return and the DON if the correction deadline is missed.",
          "document": "Record feedback, return timestamp, corrected content, resubmit timestamp, reviewer, and disposition.",
          "policyRefs": [
            "CL-CD-003",
            "CL-CD-004"
          ]
        }
      },
      {
        "id": "coaching-path",
        "label": "Coaching path",
        "shortLabel": "Coaching path",
        "ariaLabel": "Investigate Coaching path",
        "x": 25,
        "y": 60,
        "zone": "conditional",
        "leftAnchorId": "kp-4-2",
        "observe": "More than two flags on the same note triggers mandatory coaching with RN and DON under agency escalation policy.",
        "identifyChoices": [
          {
            "id": "i1",
            "label": "Recurring flags or more than two flags on one note trigger RN/DON coaching under agency policy.",
            "correct": true,
            "rationale": "Correct. Repeated returns indicate a competency pattern beyond a single-note correction."
          },
          {
            "id": "i2",
            "label": "Treat Coaching path as optional and skip the review requirement.",
            "correct": false,
            "rationale": "Coaching path is an agency supervision control, not an optional shortcut."
          },
          {
            "id": "i3",
            "label": "Assume RN co-signature will automatically repair any Coaching path defect.",
            "correct": false,
            "rationale": "Co-signature documents review; it does not silently repair incomplete or inaccurate LVN charting."
          }
        ],
        "decideChoices": [
          {
            "id": "d1",
            "label": "Escalate to RN/DON coaching and hold release until a corrective plan is established.",
            "correct": true,
            "rationale": "Correct. Open a documented coaching plan and verify improvement."
          },
          {
            "id": "d2",
            "label": "Proceed past Coaching path without resolving the identified gap.",
            "correct": false,
            "rationale": "Unresolved gaps must be corrected or escalated before the workflow advances."
          },
          {
            "id": "d3",
            "label": "Record RN approval before the RN has completed the review.",
            "correct": false,
            "rationale": "Never pre-document review, co-signature, or approval."
          }
        ],
        "documentChoices": [
          {
            "id": "doc1",
            "label": "Record flag history, coaching trigger, participants, plan, and reassessment method/date.",
            "correct": true,
            "rationale": "Correct. Record note IDs, flag reasons/count, coaching date, competencies addressed, and follow-up."
          },
          {
            "id": "doc2",
            "label": "Document only that Coaching path was completed, without dates, findings, people, or disposition.",
            "correct": false,
            "rationale": "An unsupported completion statement is not an auditable supervision record."
          }
        ],
        "feedback": {
          "observed": "More than two flags on the same note triggers mandatory coaching with RN and DON under agency escalation policy.",
          "meaning": "Repeated returns indicate a competency pattern beyond a single-note correction.",
          "action": "Open a documented coaching plan and verify improvement.",
          "notify": "Notify the supervising RN and DON the same day when the coaching threshold is met.",
          "document": "Record note IDs, flag reasons/count, coaching date, competencies addressed, and follow-up.",
          "policyRefs": [
            "CL-CD-003",
            "CL-CD-004"
          ]
        }
      }
    ]
  },
  {
    "id": 5,
    "shortName": "Metrics",
    "title": "Co-Signature Compliance Metrics",
    "subtitle": "How the agency dashboard frames shared accountability",
    "narration": [
      "Care Indeed tracks co-signature compliance on a supervisory dashboard. Metrics exist to support patient safety and survey readiness—not to rank clinicians publicly. Understanding them clarifies how your documentation habits affect the agency’s compliance posture.",
      "Metric 1 — On-time co-signature rate: Percentage of LVN notes co-signed within the agency window (14 calendar days from the entry date under CL-CD-003). Agency target: 100%. Late co-signatures often follow late LVN submissions that compress the RN review window—timely submission is your primary lever.",
      "Metric 2 — Average review time: How quickly RNs complete review after submission. Notes submitted late evening or on weekends may wait longer for RN availability; plan documentation timing accordingly when operationally possible.",
      "Metric 3 — Flag rate: Percentage of notes returned for revision. Agency goal is a low rate with continuous improvement. Elevated individual flag rates typically trigger coaching—not automatic discipline. Consistently clean first-pass notes are recognized in performance conversations."
    ],
    "keyPoints": [
      {
        "icon": "📊",
        "title": "On-time rate",
        "detail": "Target 100% within CL-CD-003 window — driven heavily by timely LVN submission"
      },
      {
        "icon": "⏱",
        "title": "Review time",
        "detail": "RN turnaround after submission; weekend/evening notes may wait longer"
      },
      {
        "icon": "⚑",
        "title": "Flag rate",
        "detail": "Returned-note percentage — coaching focus when elevated"
      },
      {
        "icon": "🤝",
        "title": "Supervisory visits",
        "detail": "Shared LVN/RN duty to schedule and document observation visits"
      }
    ],
    "clinicalTip": "Submit complete notes promptly so RN co-signature can occur within 14 calendar days (CL-CD-003).",
    "sourceLabels": [
      {
        "kind": "Agency",
        "text": "CL-CD-003 Co-signature and observation metrics"
      },
      {
        "kind": "Agency",
        "text": "CL-CD-004 Documentation quality"
      }
    ],
    "sceneImage": img06,
    "hotspots": [
      {
        "id": "metric-ontime",
        "label": "On-time rate",
        "shortLabel": "On-time rate",
        "ariaLabel": "Investigate On-time rate",
        "x": 70,
        "y": 40,
        "zone": "conditional",
        "leftAnchorId": "kp-5-0",
        "observe": "Agency target is 100% co-signature within the policy window. Submit complete notes promptly so RNs retain full review time.",
        "identifyChoices": [
          {
            "id": "i1",
            "label": "The agency target is 100% co-signature inside its policy window, supported by timely LVN submission.",
            "correct": true,
            "rationale": "Correct. Accurate timestamps show whether shared LVN/RN workflow met the agency target."
          },
          {
            "id": "i2",
            "label": "Treat On-time rate as optional and skip the review requirement.",
            "correct": false,
            "rationale": "On-time rate is an agency supervision control, not an optional shortcut."
          },
          {
            "id": "i3",
            "label": "Assume RN co-signature will automatically repair any On-time rate defect.",
            "correct": false,
            "rationale": "Co-signature documents review; it does not silently repair incomplete or inaccurate LVN charting."
          }
        ],
        "decideChoices": [
          {
            "id": "d1",
            "label": "Proceed with timely submission/review and escalate any likely deadline breach before it occurs.",
            "correct": true,
            "rationale": "Correct. Submit promptly and review the causes of any missed policy window."
          },
          {
            "id": "d2",
            "label": "Proceed past On-time rate without resolving the identified gap.",
            "correct": false,
            "rationale": "Unresolved gaps must be corrected or escalated before the workflow advances."
          },
          {
            "id": "d3",
            "label": "Record RN approval before the RN has completed the review.",
            "correct": false,
            "rationale": "Never pre-document review, co-signature, or approval."
          }
        ],
        "documentChoices": [
          {
            "id": "doc1",
            "label": "Track submission time, co-sign time, timely status, late reason, and corrective action.",
            "correct": true,
            "rationale": "Correct. Record denominator, on-time numerator, late notes, causes, owners, and corrective actions."
          },
          {
            "id": "doc2",
            "label": "Document only that On-time rate was completed, without dates, findings, people, or disposition.",
            "correct": false,
            "rationale": "An unsupported completion statement is not an auditable supervision record."
          }
        ],
        "feedback": {
          "observed": "Agency target is 100% co-signature within the policy window. Submit complete notes promptly so RNs retain full review time.",
          "meaning": "Accurate timestamps show whether shared LVN/RN workflow met the agency target.",
          "action": "Submit promptly and review the causes of any missed policy window.",
          "notify": "Notify the RN or DON before a note becomes overdue.",
          "document": "Record denominator, on-time numerator, late notes, causes, owners, and corrective actions.",
          "policyRefs": [
            "CL-CD-003"
          ]
        }
      },
      {
        "id": "metric-flags",
        "label": "Flag rate",
        "shortLabel": "Flag rate",
        "ariaLabel": "Investigate Flag rate",
        "x": 50,
        "y": 55,
        "zone": "conditional",
        "leftAnchorId": "kp-5-1",
        "observe": "Flags highlight documentation opportunities. Strengthen Assessment reasoning and complete RN notifications to reduce returns.",
        "identifyChoices": [
          {
            "id": "i1",
            "label": "Flag rate measures returned notes and the reasons, especially assessment and notification gaps.",
            "correct": true,
            "rationale": "Correct. Theme-level review makes the flag metric useful for improvement rather than blame."
          },
          {
            "id": "i2",
            "label": "Treat Flag rate as optional and skip the review requirement.",
            "correct": false,
            "rationale": "Flag rate is an agency supervision control, not an optional shortcut."
          },
          {
            "id": "i3",
            "label": "Assume RN co-signature will automatically repair any Flag rate defect.",
            "correct": false,
            "rationale": "Co-signature documents review; it does not silently repair incomplete or inaccurate LVN charting."
          }
        ],
        "decideChoices": [
          {
            "id": "d1",
            "label": "Proceed with targeted coaching when themes rise; escalate persistent safety patterns to the DON.",
            "correct": true,
            "rationale": "Correct. Analyze assessment and notification returns and target the underlying skill gap."
          },
          {
            "id": "d2",
            "label": "Proceed past Flag rate without resolving the identified gap.",
            "correct": false,
            "rationale": "Unresolved gaps must be corrected or escalated before the workflow advances."
          },
          {
            "id": "d3",
            "label": "Record RN approval before the RN has completed the review.",
            "correct": false,
            "rationale": "Never pre-document review, co-signature, or approval."
          }
        ],
        "documentChoices": [
          {
            "id": "doc1",
            "label": "Record flag rate, reason categories, recurring themes, and coaching actions.",
            "correct": true,
            "rationale": "Correct. Record counts, reasons, affected workflow, corrective coaching, and reassessment result."
          },
          {
            "id": "doc2",
            "label": "Document only that Flag rate was completed, without dates, findings, people, or disposition.",
            "correct": false,
            "rationale": "An unsupported completion statement is not an auditable supervision record."
          }
        ],
        "feedback": {
          "observed": "Flags highlight documentation opportunities. Strengthen Assessment reasoning and complete RN notifications to reduce returns.",
          "meaning": "Theme-level review makes the flag metric useful for improvement rather than blame.",
          "action": "Analyze assessment and notification returns and target the underlying skill gap.",
          "notify": "Notify the RN or DON promptly when a safety-significant pattern emerges.",
          "document": "Record counts, reasons, affected workflow, corrective coaching, and reassessment result.",
          "policyRefs": [
            "CL-CD-003",
            "CL-CD-004"
          ]
        }
      },
      {
        "id": "metric-visits",
        "label": "Supervisory visits",
        "shortLabel": "Supervisory …",
        "ariaLabel": "Investigate Supervisory visits",
        "x": 25,
        "y": 55,
        "zone": "conditional",
        "leftAnchorId": "kp-5-2",
        "observe": "Bi-weekly observation visits must be scheduled and documented. Missing documentation is a compliance risk even if the visit occurred.",
        "identifyChoices": [
          {
            "id": "i1",
            "label": "This metric verifies that supervisory observation visits were both scheduled and documented.",
            "correct": true,
            "rationale": "Correct. An undocumented observation cannot demonstrate the agency supervision event."
          },
          {
            "id": "i2",
            "label": "Treat Supervisory visits as optional and skip the review requirement.",
            "correct": false,
            "rationale": "Supervisory visits is an agency supervision control, not an optional shortcut."
          },
          {
            "id": "i3",
            "label": "Assume RN co-signature will automatically repair any Supervisory visits defect.",
            "correct": false,
            "rationale": "Co-signature documents review; it does not silently repair incomplete or inaccurate LVN charting."
          }
        ],
        "decideChoices": [
          {
            "id": "d1",
            "label": "Proceed to recover overdue observations and escalate backlog before the quality period closes.",
            "correct": true,
            "rationale": "Correct. Maintain a complete schedule and evidence file for supervisory visits."
          },
          {
            "id": "d2",
            "label": "Proceed past Supervisory visits without resolving the identified gap.",
            "correct": false,
            "rationale": "Unresolved gaps must be corrected or escalated before the workflow advances."
          },
          {
            "id": "d3",
            "label": "Record RN approval before the RN has completed the review.",
            "correct": false,
            "rationale": "Never pre-document review, co-signature, or approval."
          }
        ],
        "documentChoices": [
          {
            "id": "doc1",
            "label": "Record due dates, completed dates, observer, outcome, overdue reason, and recovery plan.",
            "correct": true,
            "rationale": "Correct. Record due/completed status, observer, skills reviewed, outcome, and recovery action."
          },
          {
            "id": "doc2",
            "label": "Document only that Supervisory visits was completed, without dates, findings, people, or disposition.",
            "correct": false,
            "rationale": "An unsupported completion statement is not an auditable supervision record."
          }
        ],
        "feedback": {
          "observed": "Bi-weekly observation visits must be scheduled and documented. Missing documentation is a compliance risk even if the visit occurred.",
          "meaning": "An undocumented observation cannot demonstrate the agency supervision event.",
          "action": "Maintain a complete schedule and evidence file for supervisory visits.",
          "notify": "Notify the scheduling RN or DON when observation completion falls behind agency cadence.",
          "document": "Record due/completed status, observer, skills reviewed, outcome, and recovery action.",
          "policyRefs": [
            "CL-CD-003",
            "42 CFR § 484.115(e)"
          ]
        }
      }
    ]
  },
  {
    "id": 6,
    "shortName": "Practice",
    "title": "Module Summary & Knowledge Check Prep",
    "subtitle": "Co-signature & supervision mastery — knowledge only",
    "narration": [
      "You have completed the didactic portion of LVN-003. Consolidate the framework before the knowledge assessment.",
      "Why co-signatures exist: CMS/home health supervision framework, professional protection for LVNs through documented RN review, and patient safety via second-clinician quality checks.",
      "Six-step workflow: complete note → submit (lock + timestamp) → RN notified → RN comprehensive review → RN co-signs → record permanently locked (addendum for later corrections). The agency 14-calendar-day co-signature window starts at submission (CL-CD-003).",
      "Ten-point review with special weight on Assessment quality: reasoning, trends, and skilled-service justification within LVN scope—never independent POC changes, OASIS, diagnosis, or prescribing."
    ],
    "keyPoints": [
      {
        "icon": "★",
        "title": "Three pillars",
        "detail": "CMS framework + LVN protection + patient safety"
      },
      {
        "icon": "★",
        "title": "6-step workflow",
        "detail": "Complete → Submit → Notify → Review → Co-sign → Lock"
      },
      {
        "icon": "★",
        "title": "10-point review",
        "detail": "Assessment quality and POC/scope alignment are critical"
      },
      {
        "icon": "★",
        "title": "Quiz = knowledge",
        "detail": "Observed visits + authorized sign-off determine practical competency"
      }
    ],
    "clinicalTip": "Submit complete notes promptly so RN co-signature can occur within 14 calendar days (CL-CD-003).",
    "sourceLabels": [
      {
        "kind": "Federal",
        "text": "42 CFR § 484.115(e) — RN-supervised LVN services"
      },
      {
        "kind": "Agency",
        "text": "CL-CD-003 Authentication and competency oversight"
      },
      {
        "kind": "Agency",
        "text": "CL-CD-004 Timely documentation"
      }
    ],
    "sceneImage": img07,
    "hotspots": [
      {
        "id": "sum-workflow",
        "label": "Workflow",
        "shortLabel": "Workflow",
        "ariaLabel": "Investigate Workflow",
        "x": 55,
        "y": 50,
        "zone": "conditional",
        "leftAnchorId": "kp-6-0",
        "observe": "Submission starts the agency co-signature clock. Complete notes protect the full 14-calendar-day RN review window.",
        "identifyChoices": [
          {
            "id": "i1",
            "label": "The complete workflow is finish, submit, notify, review, co-sign, and lock.",
            "correct": true,
            "rationale": "Correct. Each workflow stage preserves supervision continuity and record integrity."
          },
          {
            "id": "i2",
            "label": "Treat Workflow as optional and skip the review requirement.",
            "correct": false,
            "rationale": "Workflow is an agency supervision control, not an optional shortcut."
          },
          {
            "id": "i3",
            "label": "Assume RN co-signature will automatically repair any Workflow defect.",
            "correct": false,
            "rationale": "Co-signature documents review; it does not silently repair incomplete or inaccurate LVN charting."
          }
        ],
        "decideChoices": [
          {
            "id": "d1",
            "label": "Proceed only in sequence; stop shortcuts that bypass notification, review, or lock.",
            "correct": true,
            "rationale": "Correct. Follow the full sequence for every applicable LVN entry."
          },
          {
            "id": "d2",
            "label": "Proceed past Workflow without resolving the identified gap.",
            "correct": false,
            "rationale": "Unresolved gaps must be corrected or escalated before the workflow advances."
          },
          {
            "id": "d3",
            "label": "Record RN approval before the RN has completed the review.",
            "correct": false,
            "rationale": "Never pre-document review, co-signature, or approval."
          }
        ],
        "documentChoices": [
          {
            "id": "doc1",
            "label": "Record a timestamped trail for completion, submission, communications, review, co-sign, and lock.",
            "correct": true,
            "rationale": "Correct. Record completion, submit time, notifications, review result, co-sign, lock, and addendum if needed."
          },
          {
            "id": "doc2",
            "label": "Document only that Workflow was completed, without dates, findings, people, or disposition.",
            "correct": false,
            "rationale": "An unsupported completion statement is not an auditable supervision record."
          }
        ],
        "feedback": {
          "observed": "Submission starts the agency co-signature clock. Complete notes protect the full 14-calendar-day RN review window.",
          "meaning": "Each workflow stage preserves supervision continuity and record integrity.",
          "action": "Follow the full sequence for every applicable LVN entry.",
          "notify": "Notify the RN for clinical/POC issues and escalate any broken workflow according to risk.",
          "document": "Record completion, submit time, notifications, review result, co-sign, lock, and addendum if needed.",
          "policyRefs": [
            "CL-CD-003",
            "CL-CD-004"
          ]
        }
      },
      {
        "id": "sum-scope",
        "label": "Scope boundary",
        "shortLabel": "Scope boundary",
        "ariaLabel": "Investigate Scope boundary",
        "x": 25,
        "y": 55,
        "zone": "conditional",
        "leftAnchorId": "kp-6-1",
        "observe": "LVN documents under RN supervision. Do not claim RN-only actions in notes or in practice.",
        "identifyChoices": [
          {
            "id": "i1",
            "label": "LVN documentation and practice remain under RN supervision without RN-only claims.",
            "correct": true,
            "rationale": "Correct. Role-accurate documentation is required throughout the supervision workflow."
          },
          {
            "id": "i2",
            "label": "Treat Scope boundary as optional and skip the review requirement.",
            "correct": false,
            "rationale": "Scope boundary is an agency supervision control, not an optional shortcut."
          },
          {
            "id": "i3",
            "label": "Assume RN co-signature will automatically repair any Scope boundary defect.",
            "correct": false,
            "rationale": "Co-signature documents review; it does not silently repair incomplete or inaccurate LVN charting."
          }
        ],
        "decideChoices": [
          {
            "id": "d1",
            "label": "Stop any RN-only claim or act; proceed only within LVN scope and obtain RN direction at the boundary.",
            "correct": true,
            "rationale": "Correct. Practice and chart within LVN scope; escalate uncertainty before acting."
          },
          {
            "id": "d2",
            "label": "Proceed past Scope boundary without resolving the identified gap.",
            "correct": false,
            "rationale": "Unresolved gaps must be corrected or escalated before the workflow advances."
          },
          {
            "id": "d3",
            "label": "Record RN approval before the RN has completed the review.",
            "correct": false,
            "rationale": "Never pre-document review, co-signature, or approval."
          }
        ],
        "documentChoices": [
          {
            "id": "doc1",
            "label": "Chart LVN actions accurately and attribute RN decisions and directions to the RN.",
            "correct": true,
            "rationale": "Correct. Record LVN care, RN orders/direction, notification time, and follow-up for any boundary issue."
          },
          {
            "id": "doc2",
            "label": "Document only that Scope boundary was completed, without dates, findings, people, or disposition.",
            "correct": false,
            "rationale": "An unsupported completion statement is not an auditable supervision record."
          }
        ],
        "feedback": {
          "observed": "LVN documents under RN supervision. Do not claim RN-only actions in notes or in practice.",
          "meaning": "Role-accurate documentation is required throughout the supervision workflow.",
          "action": "Practice and chart within LVN scope; escalate uncertainty before acting.",
          "notify": "Notify the RN or DON immediately for scope uncertainty or breach.",
          "document": "Record LVN care, RN orders/direction, notification time, and follow-up for any boundary issue.",
          "policyRefs": [
            "CL-CD-003",
            "CL-CD-004",
            "42 CFR § 484.115(e)"
          ]
        }
      },
      {
        "id": "sum-competency",
        "label": "Competency",
        "shortLabel": "Competency",
        "ariaLabel": "Investigate Competency",
        "x": 75,
        "y": 60,
        "zone": "authorized",
        "leftAnchorId": "kp-6-2",
        "observe": "This quiz measures knowledge only. Practical competency requires observation and authorized sign-off.",
        "identifyChoices": [
          {
            "id": "i1",
            "label": "Quiz success demonstrates knowledge only; observed competency sign-off remains separate.",
            "correct": true,
            "rationale": "Correct. Knowledge and observed performance are distinct evidence in the competency file."
          },
          {
            "id": "i2",
            "label": "Treat Competency as optional and skip the review requirement.",
            "correct": false,
            "rationale": "Competency is an agency supervision control, not an optional shortcut."
          },
          {
            "id": "i3",
            "label": "Assume RN co-signature will automatically repair any Competency defect.",
            "correct": false,
            "rationale": "Co-signature documents review; it does not silently repair incomplete or inaccurate LVN charting."
          }
        ],
        "decideChoices": [
          {
            "id": "d1",
            "label": "Proceed to supervised observation after the quiz; hold any independent competency claim until authorized sign-off.",
            "correct": true,
            "rationale": "Correct. Complete the quiz, then complete observed sign-off under RN supervision."
          },
          {
            "id": "d2",
            "label": "Proceed past Competency without resolving the identified gap.",
            "correct": false,
            "rationale": "Unresolved gaps must be corrected or escalated before the workflow advances."
          },
          {
            "id": "d3",
            "label": "Record RN approval before the RN has completed the review.",
            "correct": false,
            "rationale": "Never pre-document review, co-signature, or approval."
          }
        ],
        "documentChoices": [
          {
            "id": "doc1",
            "label": "Record quiz completion separately from observation date, evaluator, skills, and sign-off outcome.",
            "correct": true,
            "rationale": "Correct. Record quiz result/date, observer, competencies verified, restrictions, and release status."
          },
          {
            "id": "doc2",
            "label": "Document only that Competency was completed, without dates, findings, people, or disposition.",
            "correct": false,
            "rationale": "An unsupported completion statement is not an auditable supervision record."
          }
        ],
        "feedback": {
          "observed": "This quiz measures knowledge only. Practical competency requires observation and authorized sign-off.",
          "meaning": "Knowledge and observed performance are distinct evidence in the competency file.",
          "action": "Complete the quiz, then complete observed sign-off under RN supervision.",
          "notify": "Notify the RN preceptor or DON when observation sign-off is due or overdue.",
          "document": "Record quiz result/date, observer, competencies verified, restrictions, and release status.",
          "policyRefs": [
            "CL-CD-003",
            "42 CFR § 484.115(e)"
          ]
        }
      }
    ]
  }
];

const QUIZ: QuizQuestion[] = [
  {
    "id": 1,
    "stem": "Which CMS citation is the federal personnel-qualifications reference used in this module for the LVN home health framework?",
    "options": [
      "42 CFR § 484.115(e)",
      "42 CFR § 484.55 (comprehensive assessment only)",
      "42 CFR § 484.70 (infection prevention only)",
      "42 CFR § 482.23 (hospital nursing services)"
    ],
    "correct": 0,
    "rationale": "This module’s CMS basis is 42 CFR § 484.115(e), the home health personnel-qualifications provision addressing the LPN/LVN. Co-signature operations also sit inside the broader CoP supervision structure and agency policy CL-CD-003."
  },
  {
    "id": 2,
    "stem": "According to Care Indeed teaching in this module, co-signatures exist primarily for which three reasons?",
    "options": [
      "Cost reduction, staffing efficiency, and marketing",
      "CMS/supervision compliance framework, LVN professional protection, and patient safety",
      "Physician convenience, insurance advertising, and termination decisions",
      "Billing speed, supply inventory, and HR scheduling only"
    ],
    "correct": 1,
    "rationale": "The three pillars are: compliance with the home health supervision/personnel framework, professional protection via documented RN review, and patient safety through a second clinical quality check."
  },
  {
    "id": 3,
    "stem": "According to agency policy used in this training, what is the maximum time allowed for RN co-signature of an applicable LVN entry?",
    "options": [
      "Within 7 calendar days as a federal CMS mandate",
      "Within 14 calendar days of the applicable entry/submission reference defined by current CL-CD-003",
      "Within 30 calendar days only if the note was not flagged",
      "No time frame applies after LVN completion"
    ],
    "correct": 1,
    "rationale": "The 14-calendar-day maximum is an agency policy baseline under CL-CD-003, not a federal interval mandate. The current signed agency policy controls the applicable reference point and deadline."
  },
  {
    "id": 4,
    "stem": "Which element of the visit note is MOST often the focus when an RN flags an LVN note for weak clinical reasoning?",
    "options": [
      "The font size of the printed copy",
      "The mileage field only",
      "The Assessment section",
      "The insurance authorization number"
    ],
    "correct": 2,
    "rationale": "Assessment quality is the most frequently emphasized flag theme: RNs expect interpretation, trend, and skilled-service justification—not a bare restatement of vitals."
  },
  {
    "id": 5,
    "stem": "How often does this training’s agency baseline require direct supervisory observation of the LVN, and what controls if policy is updated?",
    "options": [
      "Every 7 days by federal rule",
      "Every 14 days per the supplied training baseline, with the current signed agency policy controlling",
      "Monthly only, with no direct observation expectation",
      "Only after a failed co-signature"
    ],
    "correct": 1,
    "rationale": "The supplied agency training baseline schedules direct RN observation every 14 days. This is agency policy; the current signed policy controls if the cadence is updated."
  },
  {
    "id": 6,
    "stem": "If your note is flagged by the RN, what is your deadline under CL-CD-003 for making corrections and re-submitting?",
    "options": [
      "Whenever you next see the patient",
      "Within 14 days",
      "Before annual competency only",
      "Within 24 hours"
    ],
    "correct": 3,
    "rationale": "Flagged notes must be corrected thoroughly and re-submitted within 24 hours under CL-CD-003. Address the specific feedback, not a token one-line add-on."
  },
  {
    "id": 7,
    "stem": "When recurring flags occur, or more than two flags appear on the same note, what is the required next supervision step under agency policy?",
    "options": [
      "Ignore the pattern if the note is eventually co-signed",
      "Automatic termination without coaching documentation",
      "RN/DON coaching under agency policy",
      "Extend the correction window to 14 days without coaching"
    ],
    "correct": 2,
    "rationale": "Recurring flags, or more than two flags on one note, trigger RN/DON coaching under agency policy so the underlying competency gap is addressed."
  },
  {
    "id": 8,
    "stem": "After the RN applies an electronic co-signature, what is the correct status of the clinical record?",
    "options": [
      "It remains freely editable by any clinician for 30 days",
      "It is emailed to the patient portal for rewriting",
      "It is permanently locked; later changes require a formal timestamped addendum",
      "It can be silently overwritten if the LVN remembers a detail"
    ],
    "correct": 2,
    "rationale": "Co-signature locks the record to preserve integrity. Corrections use a formal, dated/timed addendum that preserves the original entry—never silent alteration."
  },
  {
    "id": 9,
    "stem": "What is Care Indeed’s stated target for on-time co-signature rate under CL-CD-003?",
    "options": [
      "75%",
      "100%",
      "50% if census is high",
      "No target is defined"
    ],
    "correct": 1,
    "rationale": "The agency target is 100% on-time co-signature within the policy window. Timely, complete LVN submission is a primary driver of meeting that target."
  },
  {
    "id": 10,
    "stem": "During a CMS survey focused on LVN oversight, which documentation set best matches what surveyors may review?",
    "options": [
      "Only the marketing brochure",
      "Only the LVN’s lunch receipts",
      "Only unsigned draft notes kept on paper at home",
      "Co-signature records, supervisory visit notes, competency evaluations, and compliance metrics"
    ],
    "correct": 3,
    "rationale": "Surveyors may examine the full supervision trail: co-signatures, supervisory visit documentation, competency evaluations, and related compliance evidence—not a single artifact in isolation."
  }
];

const STYLES = `
.lvn002,.lvn002 *{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box}
@keyframes lvn002-pop{0%{transform:scale(.96);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes lvn002-ping{75%,100%{transform:scale(1.75);opacity:0}}
@keyframes lvn002-slide{0%{transform:translateX(24px);opacity:0}100%{transform:translateX(0);opacity:1}}
.lvn002-shell{position:fixed;inset:0;display:flex;flex-direction:column;background:#F8FAFC;color:#2D3748;z-index:40}
.lvn002-top{height:64px;background:#fff;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;padding:0 20px;gap:12px;flex-shrink:0}
.lvn002-brand{display:flex;align-items:center;gap:8px;color:#0F5B54;font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase;flex-shrink:0}
.lvn002-tabs{display:flex;gap:6px;overflow-x:auto;flex:1;min-width:0;scrollbar-width:none}
.lvn002-tabs::-webkit-scrollbar{display:none}
.lvn002-tab{border:0;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;background:transparent;color:#64748B;min-height:44px}
.lvn002-tab.active{background:#0F5B54;color:#fff;box-shadow:0 6px 16px rgba(15,91,84,.2)}
.lvn002-tab.quiz-tab{border:1px solid #B94718;color:#B94718}
.lvn002-tab.quiz-tab.active{background:#B94718;color:#fff;border-color:#B94718}
.lvn002-exit{flex-shrink:0;border-radius:10px;border:1px solid #B94718;background:#fff;color:#B94718;padding:8px 16px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;min-height:44px}
.lvn002-work{flex:1;min-height:0;display:flex;gap:0;padding:16px}
.lvn002-left{width:42%;min-width:280px;max-width:520px;overflow:auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px 0 0 16px;padding:22px}
.lvn002-right{flex:1;min-width:0;background:#fff;border:1px solid #E2E8F0;border-left:0;border-radius:0 16px 16px 0;padding:12px;display:flex}
.lvn002-stage-wrap{width:100%;height:100%;min-height:0;display:grid;place-items:center}
.lvn002-stage{position:relative;width:min(100%,calc(100cqh * 16 / 13));max-width:100%;max-height:100%;aspect-ratio:16/13;overflow:hidden;border-radius:14px;border:1px solid #E2E8F0;background:#fff;box-shadow:0 12px 36px rgba(15,91,84,.1)}
@supports not (width:1cqh){.lvn002-stage{width:100%;height:auto;aspect-ratio:16/13;max-height:100%}}
.lvn002-stage img.scene{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.lvn002-hotspot{position:absolute;z-index:10;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:5px;border:0;background:transparent;cursor:pointer;padding:0;min-width:48px;min-height:48px}
.lvn002-hotspot .orb{position:relative;width:48px;height:48px;min-width:48px;min-height:48px;border-radius:50%;display:grid;place-items:center;border:3px solid #fff;box-shadow:0 8px 18px rgba(0,0,0,.18);color:#fff;font-weight:800}
.lvn002-hotspot .ping{position:absolute;inset:0;border-radius:50%;background:#B94718;animation:lvn002-ping 1.2s cubic-bezier(0,0,.2,1) 2;opacity:.5;pointer-events:none}
.lvn002-hotspot .tag{background:rgba(255,255,255,.96);padding:5px 9px;border-radius:8px;font-size:11px;font-weight:800;color:#0F5B54;border:1px solid #EEF4F3;box-shadow:0 3px 10px rgba(0,0,0,.08);white-space:nowrap;letter-spacing:.02em;max-width:140px;line-height:1.2}
.lvn002-hotspot:not(.done).guided{/* only next incomplete gets guided class */}
.lvn002-hotspot:focus-visible .orb{outline:3px solid #fff;outline-offset:3px;box-shadow:0 0 0 7px rgba(15,91,84,.4)}
.lvn002-drawer-bg{position:absolute;inset:0;z-index:30;background:rgba(15,91,84,.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;animation:lvn002-pop .3s cubic-bezier(.16,1,.3,1)}
.lvn002-drawer{width:min(460px,100%);max-height:min(88%,620px);overflow:auto;background:#fff;border-radius:16px;border:2px solid #EEF4F3;box-shadow:0 24px 60px rgba(0,0,0,.22)}
.lvn002-bot{height:80px;background:#fff;border-top:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;gap:12px}
.lvn002-bot button.nav{border:0;background:transparent;color:#64748B;font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:4px;min-height:44px;padding:0 8px}
.lvn002-bot button.nav:disabled{opacity:.35;cursor:not-allowed}
.lvn002-bot button.next{background:#B94718;color:#fff;border:0;border-radius:10px;padding:12px 20px;font-weight:800;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(242,109,51,.28);min-height:44px}
.lvn002-quiz-page{flex:1;min-height:0;overflow:auto;padding:20px;display:flex;justify-content:center}
.lvn002-quiz-card{width:min(760px,100%);animation:lvn002-slide .35s cubic-bezier(.16,1,.3,1)}
@media (max-width:900px){
  .lvn002-work{flex-direction:column;overflow:auto;padding:10px;gap:10px}
  .lvn002-left,.lvn002-right{width:100%;max-width:none;border-radius:12px;border:1px solid #E2E8F0}
  .lvn002-right{min-height:360px}
  .lvn002-left{max-height:42vh}
  .lvn002-top{padding:0 10px;gap:8px}
  .lvn002-tab{padding:8px 10px;font-size:12px}
  .lvn002-bot{padding:0 12px;height:72px}
  .lvn002-hotspot .tag{font-size:10px;max-width:92px;white-space:normal;text-align:center;line-height:1.15}
}
@media (max-width:420px){
  .lvn002-brand span.brand-text{display:none}
  .lvn002-exit{padding:8px 10px;font-size:11px}
  .lvn002-stage{border-radius:10px}
}
@media (prefers-reduced-motion:reduce){
  .lvn002-hotspot .ping,.lvn002-drawer-bg,.lvn002-quiz-card,.lvn002-path-step{animation:none!important}
  .lvn002-quiz-card{animation:none!important}
  .lvn002-rm-transition,.lvn002-complete-overlay{transition:none!important;animation:none!important}
}
.lvn002-path-overlay{position:absolute;left:8px;bottom:52px;z-index:9;display:flex;flex-direction:column;gap:6px;width:min(200px,42%);pointer-events:none}
.lvn002-path-card{padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.96);border:1px solid #E2E8F0;box-shadow:0 4px 14px rgba(0,0,0,.1);font-size:11px;line-height:1.35}
.lvn002-path-card strong{display:block;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-bottom:3px}
.lvn002-process-rail{position:absolute;left:8px;top:52px;z-index:7;display:flex;flex-direction:column;gap:6px;width:min(148px,36%);pointer-events:none}
.lvn002-zone-legend{position:absolute;left:50%;bottom:44px;transform:translateX(-50%);z-index:9;display:flex;gap:6px;justify-content:center;pointer-events:none;flex-wrap:wrap;max-width:94%}
.lvn002-zone-legend{position:absolute;left:10px;right:10px;bottom:48px;z-index:9;display:flex;gap:8px;justify-content:center;pointer-events:none;flex-wrap:wrap}
.lvn002-zone-chip{padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.95);border:1px solid #E2E8F0;font-size:11px;font-weight:800;display:inline-flex;align-items:center;gap:6px}

.lvn002-process-node{position:absolute;z-index:7;transform:translate(-50%,-50%);pointer-events:none;max-width:150px;padding:7px 9px;border-radius:10px;background:rgba(255,255,255,.96);border:1px solid #E2E8F0;box-shadow:0 4px 12px rgba(0,0,0,.1);font-size:12px;line-height:1.35;color:#2D3748;text-align:left}
.lvn002-process-node strong{display:block;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-bottom:3px;color:#0F5B54}
.lvn002-process-node ul{margin:0;padding-left:14px}
.lvn002-process-node li{margin:0}
.lvn002-gate-node{position:absolute;z-index:7;left:50%;bottom:8px;transform:translateX(-50%);pointer-events:none;display:flex;gap:6px;flex-wrap:wrap;justify-content:center;max-width:92%}
.lvn002-gate-chip{padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.96);border:1px solid #C8DFDC;font-size:11px;font-weight:800;color:#0F5B54;box-shadow:0 3px 10px rgba(0,0,0,.08)}
.lvn002-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.lvn002-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.lvn002-modal{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:flex-end;justify-content:center;background:rgba(15,23,42,.55);padding:12px;overscroll-behavior:contain}
.lvn002-modal-card{width:min(560px,100%);max-height:min(92dvh,760px);overflow:auto;overscroll-behavior:contain;background:#fff;border-radius:16px;border:1px solid #E2E8F0;box-shadow:0 16px 48px rgba(0,0,0,.22)}
@media (max-width:420px){
  .lvn002-top{height:auto;min-height:104px;align-content:center;flex-wrap:wrap;padding:6px 8px;gap:4px 8px}
  .lvn002-brand{font-size:9px;letter-spacing:.05em;max-width:240px}.lvn002-brand span.brand-text{display:inline}
  .lvn002-exit{margin-left:auto;padding:6px 8px;font-size:10px;min-height:36px}
  .lvn002-tabs{order:3;flex:0 0 100%;width:100%;padding-bottom:2px}.lvn002-tab{min-height:38px;padding:6px 9px;font-size:11px}
  .lvn002-work{padding:6px;gap:6px;overflow-y:auto;overflow-x:hidden}.lvn002-left{max-height:none;padding:14px}.lvn002-left>div>div[style*="grid-template-columns"]{grid-template-columns:1fr!important}
  .lvn002-right{min-height:314px;padding:4px}.lvn002-stage{border-radius:8px}.lvn002-hotspot .orb{width:40px;height:40px;min-width:40px;min-height:40px}.lvn002-hotspot .tag{font-size:9px;max-width:76px;overflow:hidden;text-overflow:ellipsis;padding:3px 5px}
  .lvn002-scene-title{max-width:62%!important;padding:5px 7px!important}.lvn002-scene-title>div:first-child{font-size:9px!important}.lvn002-scene-title>div:last-child{font-size:10px!important}
  .lvn002-bot{height:62px;padding:0 6px;gap:3px}.lvn002-bot button.nav,.lvn002-bot button.next{font-size:9px;letter-spacing:.03em;padding:6px;white-space:nowrap}.lvn002-bot button.next{max-width:118px}.lvn002-footer-status{min-width:0}.lvn002-footer-status span{font-size:8px!important;padding:5px!important;letter-spacing:.02em!important;text-align:center}
  .lvn002-modal{padding:0;align-items:flex-end}.lvn002-modal-card{border-radius:16px 16px 0 0;max-height:90dvh}
}
`;

function FeedbackBlock({ label, body, accent, icon }: { label: string; body: string; accent?: boolean; icon?: React.ReactNode }) {
  return (
    <div style={{ padding: 12, borderRadius: 12, border: `1px solid ${accent ? CI.tealMuted : CI.border}`, background: accent ? CI.tealSoft : CI.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: accent ? CI.teal : CI.muted, marginBottom: 6 }}>{icon}{label}</div>
      <div style={{ fontSize: 15.5, lineHeight: 1.6, color: CI.ink }}>{body}</div>
    </div>
  );
}

function ClinicalFeedbackOverlay({ hotspot, onClose, onComplete, triggerRef }: {
  hotspot: Hotspot; onClose: () => void; onComplete: () => void; triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const feedbackHeadingRef = useRef<HTMLHeadingElement>(null);
  const [stage, setStage] = useState<ScenarioStage>('observe');
  const [selectedIdentifyId, setSelectedIdentifyId] = useState<string | null>(null);
  const [selectedDecideId, setSelectedDecideId] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [identifyLocked, setIdentifyLocked] = useState(false);
  const [decideLocked, setDecideLocked] = useState(false);
  const [documentLocked, setDocumentLocked] = useState(false);
  const [rationale, setRationale] = useState<string | null>(null);

  const zoneColor = hotspot.zone === 'authorized' ? CI.teal : hotspot.zone === 'conditional' ? CI.orange : hotspot.zone === 'prohibited' ? CI.red : CI.slate;
  const restoreTriggerFocus = useCallback(() => window.requestAnimationFrame(() => triggerRef.current?.focus()), [triggerRef]);
  const closeAndRestore = useCallback(() => { onClose(); restoreTriggerFocus(); }, [onClose, restoreTriggerFocus]);

  useEffect(() => {
    closeRef.current?.focus();
  }, [hotspot.id]);

  useEffect(() => {
    if (stage === 'identify' || stage === 'decide' || stage === 'document') {
      dialogRef.current?.querySelector<HTMLElement>('[role="radio"]')?.focus();
    } else if (stage === 'feedback') {
      feedbackHeadingRef.current?.focus();
    }
  }, [stage]);

  useEffect(() => {
    const shell = document.querySelector<HTMLElement>('.lvn002-shell');
    const scrollNodes = Array.from(document.querySelectorAll<HTMLElement>('.lvn002-work,.lvn002-left,.lvn002-quiz-page'));
    const prior = scrollNodes.map((node) => ({ node, overflow: node.style.overflow, touchAction: node.style.touchAction }));
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    if (shell) { shell.inert = true; shell.setAttribute('aria-hidden', 'true'); }
    for (const { node } of prior) { node.style.overflow = 'hidden'; node.style.touchAction = 'none'; }
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const blockBackgroundScroll = (event: Event) => {
      if (!dialogRef.current?.contains(event.target as Node)) event.preventDefault();
    };
    const blockBackgroundKeys = (event: KeyboardEvent) => {
      if (['PageUp', 'PageDown', 'Home', 'End', ' ', 'ArrowUp', 'ArrowDown'].includes(event.key) && !dialogRef.current?.contains(event.target as Node)) event.preventDefault();
    };
    document.addEventListener('wheel', blockBackgroundScroll, { passive: false, capture: true });
    document.addEventListener('touchmove', blockBackgroundScroll, { passive: false, capture: true });
    document.addEventListener('keydown', blockBackgroundKeys, true);
    return () => {
      if (shell) { shell.inert = false; shell.removeAttribute('aria-hidden'); }
      for (const item of prior) { item.node.style.overflow = item.overflow; item.node.style.touchAction = item.touchAction; }
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
      document.removeEventListener('wheel', blockBackgroundScroll, true);
      document.removeEventListener('touchmove', blockBackgroundScroll, true);
      document.removeEventListener('keydown', blockBackgroundKeys, true);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeAndRestore(); return; }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (!focusables.length) return;
      const first = focusables[0]; const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [closeAndRestore, stage]);

  const pick = (choice: ScenarioChoice, setSelected: (id: string) => void, setLocked: (value: boolean) => void, locked: boolean, next: ScenarioStage) => {
    if (locked) return;
    setSelected(choice.id); setRationale(choice.rationale);
    if (choice.correct) {
      setLocked(true);
      window.setTimeout(() => { setRationale(null); setStage(next); }, 650);
    }
  };

  const renderChoices = (choices: ScenarioChoice[], selectedId: string | null, locked: boolean, onPick: (choice: ScenarioChoice) => void) => {
    const activeIndex = Math.max(0, choices.findIndex((choice) => choice.id === selectedId));
    const moveFocus = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      let next = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % choices.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + choices.length) % choices.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = choices.length - 1;
      else if (event.key === ' ') { event.preventDefault(); onPick(choices[index]); return; }
      else return;
      event.preventDefault();
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
    };
    return (
      <div role="radiogroup" aria-label={`${stage} choices`} style={{ display: 'grid', gap: 8 }}>
        {choices.map((choice, index) => {
          const selected = selectedId === choice.id;
          const wrong = selected && !choice.correct;
          const right = selected && choice.correct;
          return (
            <button key={choice.id} type="button" role="radio" aria-checked={selected} tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => onPick(choice)} onKeyDown={(event) => moveFocus(event, index)} disabled={locked && !selected}
              style={{ textAlign: 'left', minHeight: 48, padding: '10px 12px', borderRadius: 10, cursor: locked && !selected ? 'default' : 'pointer', border: `1.5px solid ${right ? CI.teal : wrong ? CI.red : selected ? CI.orange : CI.border}`, background: right ? CI.tealSoft : wrong ? '#FFF1F0' : '#fff', fontWeight: 600, fontSize: 15, lineHeight: 1.45, color: CI.ink, opacity: locked && !selected ? 0.55 : 1 }}>
              {choice.label}
            </button>
          );
        })}
        {rationale && <div role="status" aria-live="polite" style={{ fontSize: 14, lineHeight: 1.5, color: CI.muted, padding: '8px 10px', borderRadius: 8, background: CI.bg }}>{rationale}</div>}
      </div>
    );
  };

  const feedback = hotspot.feedback;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="lvn-scenario-title" ref={dialogRef} className="lvn002-modal"
      onClick={(event) => { if (event.target === event.currentTarget) closeAndRestore(); }}>
      <div className="lvn002-modal-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 14px', borderBottom: `1px solid ${CI.border}`, borderTop: `3px solid ${zoneColor}` }}>
          <div><div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: zoneColor }}>{stage === 'observe' ? '1 · Observe' : stage === 'identify' ? '2 · Identify' : stage === 'decide' ? '3 · Decide' : stage === 'document' ? '4 · Document' : '5 · Feedback'}</div>
            <h2 id="lvn-scenario-title" style={{ margin: 0, fontSize: 17, fontWeight: 800, color: CI.ink }}>{hotspot.label}</h2></div>
          <button ref={closeRef} type="button" aria-label="Close scenario" onClick={closeAndRestore} style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, borderRadius: '50%', border: `1px solid ${CI.border}`, background: CI.bg, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={18} /></button>
        </div>
        <div style={{ padding: 14, display: 'grid', gap: 12 }}>
          {stage === 'observe' && <><p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: CI.ink }}>{hotspot.observe}</p><button type="button" onClick={() => setStage('identify')} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.teal, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Continue to Identify</button></>}
          {stage === 'identify' && <><div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>What does this finding mean for LVN practice?</div>{renderChoices(hotspot.identifyChoices, selectedIdentifyId, identifyLocked, (choice) => pick(choice, setSelectedIdentifyId, setIdentifyLocked, identifyLocked, 'decide'))}</>}
          {stage === 'decide' && <><div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>What should the LVN do next?</div>{renderChoices(hotspot.decideChoices, selectedDecideId, decideLocked, (choice) => pick(choice, setSelectedDecideId, setDecideLocked, decideLocked, 'document'))}</>}
          {stage === 'document' && <><div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>How should this be documented?</div>{renderChoices(hotspot.documentChoices, selectedDocumentId, documentLocked, (choice) => pick(choice, setSelectedDocumentId, setDocumentLocked, documentLocked, 'feedback'))}</>}
          {stage === 'feedback' && <><h3 ref={feedbackHeadingRef} tabIndex={-1} style={{ margin: 0, fontSize: 18, color: CI.teal }}>Clinical feedback</h3><FeedbackBlock label="What you observed" body={feedback.observed} icon={<Eye size={14} />} /><FeedbackBlock label="What it means" body={feedback.meaning} icon={<AlertCircle size={14} />} /><FeedbackBlock label="What the LVN should do" body={feedback.action} icon={<CheckCircle2 size={14} />} /><FeedbackBlock label="Who must be notified" body={feedback.notify} icon={<MessageSquare size={14} />} /><FeedbackBlock label="What must be documented" body={feedback.document} icon={<FileText size={14} />} /><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{feedback.policyRefs.map((reference) => <span key={reference} style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 6, background: CI.tealSoft, color: CI.teal, border: `1px solid ${CI.tealMuted}` }}>{reference}</span>)}</div><button type="button" onClick={() => { onComplete(); restoreTriggerFocus(); }} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.orange, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Complete hotspot</button></>}
        </div>
      </div>
    </div>, document.body,
  );
}

function LeftPanel({ page, pageIndex, total }: { page: PageData; pageIndex: number; total: number }) {
  const more = page.narration.length > 1;
  return (
    <div>
      <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 999, padding: '4px 10px', marginBottom: 14 }}>{page.shortName} · {pageIndex + 1} of {total}</div>
      <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, lineHeight: 1.25, color: '#1F1C1B' }}>{page.title}</h1>
      <p style={{ margin: '0 0 16px', color: CI.orange, fontSize: 15, fontWeight: 600 }}>{page.subtitle}</p>
      <p style={{ margin: '0 0 12px', fontSize: 17, lineHeight: 1.65, color: '#524C4B' }}>{page.narration[0]}</p>
      {more && (
        <details style={{ border: `1px solid ${CI.border}`, borderRadius: 12, background: '#FAFBF8', marginBottom: 16 }}>
          <summary style={{ padding: '12px 14px', fontWeight: 700, fontSize: 13, color: CI.teal, cursor: 'pointer' }}>View Full Lesson Details</summary>
          <div style={{ padding: 14, borderTop: `1px solid ${CI.border}`, background: '#fff' }}>
            {page.narration.slice(1).map((p, i) => <p key={i} style={{ margin: '0 0 10px', fontSize: 16, lineHeight: 1.65, color: '#524C4B' }}>{p}</p>)}
          </div>
        </details>
      )}
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.muted, marginBottom: 10 }}>Key Clinical Actions</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {page.keyPoints.map((kp, index) => (
          <div id={`kp-${page.id}-${index}`} key={`kp-${page.id}-${index}`} style={{ background: '#fff', border: `1px solid ${CI.border}`, borderRadius: 12, padding: 12, display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 18 }} aria-hidden>{kp.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1F1C1B', marginBottom: 2 }}>{kp.title}</div>
              <div style={{ fontSize: 14, color: CI.muted, lineHeight: 1.45 }}>{kp.detail}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: 14, borderRadius: 12, background: '#FAFBF8', border: `1px solid ${CI.border}`, borderLeft: `4px solid ${CI.orangeDark}`, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: CI.orangeDark, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Clinical Tip</div>
        <div style={{ fontSize: 15, color: '#524C4B', lineHeight: 1.55 }}>{page.clinicalTip}</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {page.sourceLabels.map((s) => (
          <span key={s.kind + s.text} style={{ fontSize: 11, padding: '5px 8px', borderRadius: 6, background: '#FAFBF8', border: `1px solid ${CI.border}`, color: CI.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{s.kind}: {s.text}</span>
        ))}
      </div>
    </div>
  );
}

function RightPanel({ page, completed, setCompleted, onGoQuiz }: {
  page: PageData; completed: string[]; setCompleted: (ids: string[]) => void; onGoQuiz?: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const active = page.hotspots.find((h) => h.id === activeId) ?? null;
  const done = page.hotspots.length > 0 && completed.length === page.hotspots.length;
  useEffect(() => { setActiveId(null); }, [page.id]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      page.hotspots.forEach((hotspot) => {
        if (!hotspot.leftAnchorId || !document.getElementById(hotspot.leftAnchorId)) {
          throw new Error(`[${MODULE_META.id}] Missing left anchor: ${hotspot.leftAnchorId ?? '(unset)'}`);
        }
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [page]);
  return (
    <div className="lvn002-stage-wrap">
      <div className="lvn002-stage" role="region" aria-label={`${page.title} interactive scene`}>
        <img className="scene" src={page.sceneImage} alt={SCENE_ALT[page.id]} draggable={false} />
        <div className="lvn002-scene-title" style={{ position: 'absolute', top: 10, left: 10, zIndex: 8, maxWidth: 'min(50%, 320px)', padding: '8px 10px', borderRadius: 12, background: 'rgba(255,255,255,.94)', border: `1px solid ${CI.border}`, pointerEvents: 'none' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.orange }}>{page.shortName}</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: CI.teal }}>{page.title.split(':')[0]}</div>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,.94)', border: `1px solid ${CI.border}`, fontSize: 11, fontWeight: 800, color: CI.teal, pointerEvents: 'none' }} aria-hidden="true">
          <Eye size={14} /> {completed.length} / {page.hotspots.length} observed
        </div>
        {page.hotspots.map((hs) => {
          const isDone = completed.includes(hs.id);
          const color = ZONE[hs.zone].color;
          const nextIncomplete = page.hotspots.find((h) => !completed.includes(h.id));
          const isGuided = !isDone && nextIncomplete?.id === hs.id;
          return (
            <button key={hs.id} type="button" className={`lvn002-hotspot ${isDone ? 'done' : ''} ${isGuided ? 'guided' : ''}`}
              style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
              aria-label={isDone ? `${hs.label} — observed` : `Investigate ${hs.label}`}
              aria-describedby={`lvn002-progress-${page.id}`}
              onClick={(e) => { triggerRef.current = e.currentTarget; setActiveId(hs.id); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  triggerRef.current = e.currentTarget;
                  setActiveId(hs.id);
                }
              }}>
              <div className="orb" style={{ background: isDone ? CI.teal : (hs.zone === 'neutral' ? CI.orange : color) }}>
                {isGuided && !isDone && <span className="ping" aria-hidden />}
                {isDone ? <Check size={16} strokeWidth={3} aria-hidden /> : <span style={{ fontSize: 15 }} aria-hidden>?</span>}
              </div>
              <span className="tag">{hs.shortLabel}</span>
              {isDone && <span className="lvn002-sr-only">Completed</span>}
            </button>
          );
        })}
        <div id={`lvn002-progress-${page.id}`} className="lvn002-live" aria-live="polite">
          {completed.length} of {page.hotspots.length} nodes observed
        </div>
        <button type="button" aria-label="Reset lesson progress" onClick={() => setCompleted([])}
          style={{ position: 'absolute', right: 10, bottom: 10, zIndex: 12, minHeight: 44, padding: '0 12px', borderRadius: 999, border: `1px solid ${CI.border}`, background: 'rgba(255,255,255,.94)', color: CI.teal, fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <RotateCcw size={13} /> Reset
        </button>
        {done && !activeId && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 25, background: 'rgba(15,91,84,.78)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: 20, animation: 'lvn002-pop .3s cubic-bezier(.16,1,.3,1)' }} className="lvn002-rm-transition">
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 380, width: '100%', textAlign: 'center', border: `4px solid ${CI.tealSoft}` }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: CI.tealSoft, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}><ShieldCheck size={32} color={CI.teal} /></div>
              <div style={{ fontSize: 18, fontWeight: 800, color: CI.teal, marginBottom: 6 }}>Scene Complete</div>
              <div style={{ fontSize: 13, color: CI.muted, lineHeight: 1.5, marginBottom: 14 }}>Scenario Practice Complete. Knowledge practice only — Practical Competency Remains Separate.</div>
              {onGoQuiz && page.id === PAGES.length - 1 && (
                <button type="button" onClick={onGoQuiz} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 12, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Go to Knowledge Check</button>
              )}
            </div>
          </div>
        )}
        {active && (
          <ClinicalFeedbackOverlay hotspot={active} onClose={() => setActiveId(null)}
            onComplete={() => { if (!completed.includes(active.id)) setCompleted([...completed, active.id]); setActiveId(null); }}
            triggerRef={triggerRef} />
        )}
      </div>
    </div>
  );
}

/** Dedicated single-panel Knowledge Check — progressive field cards + scope compass result */
function QuizPage({
  onBack,
  initialAnswers,
  initialIdx,
  initialFinished,
  initialSelected,
  initialSubmitted,
  onPersist,
}: {
  onBack: () => void;
  initialAnswers?: (number | null)[];
  initialIdx?: number;
  initialFinished?: boolean;
  initialSelected?: number | null;
  initialSubmitted?: boolean;
  onPersist: (state: { answers: (number | null)[]; idx: number; finished: boolean; selected: number | null; submitted: boolean }) => void;
}) {
  const [idx, setIdx] = useState(initialIdx ?? 0);
  const [selected, setSelected] = useState<number | null>(() => {
    if (initialSelected !== undefined) return initialSelected;
    if (initialAnswers && initialAnswers[initialIdx ?? 0] != null) return initialAnswers[initialIdx ?? 0];
    return null;
  });
  const [submitted, setSubmitted] = useState<boolean>(() => {
    if (initialSubmitted !== undefined) return !!initialSubmitted;
    return !!(initialAnswers && initialAnswers[initialIdx ?? 0] != null);
  });
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => initialAnswers ?? Array(QUIZ.length).fill(null),
  );
  const [finished, setFinished] = useState(!!initialFinished);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const q = QUIZ[idx];
  const isCorrect = selected === q.correct;
  const score = useMemo(
    () => answers.reduce<number>((n, a, i) => n + (a === QUIZ[i].correct ? 1 : 0), 0),
    [answers],
  );
  const pct = Math.round((score / QUIZ.length) * 100);
  const passed = pct >= MODULE_META.passing;
  const progress = ((idx + (submitted ? 1 : 0)) / QUIZ.length) * 100;
  const letters = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    onPersist({ answers, idx, finished, selected, submitted });
    // intentionally omit onPersist identity to avoid re-render loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, idx, finished, selected, submitted]);

  const focusOption = (i: number) => {
    setSelected(i);
    window.requestAnimationFrame(() => optionRefs.current[i]?.focus());
  };

  const submit = () => {
    if (selected === null) return;
    if (!submitted) {
      const next = [...answers];
      next[idx] = selected;
      setAnswers(next);
      setSubmitted(true);
      return;
    }
    if (idx >= QUIZ.length - 1) {
      setFinished(true);
      return;
    }
    const nextIdx = idx + 1;
    setIdx(nextIdx);
    setSelected(answers[nextIdx] != null ? answers[nextIdx] : null);
    setSubmitted(answers[nextIdx] != null);
  };

  if (finished) {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (pct / 100) * circumference;
    return (
      <div className="lvn002-quiz-page">
        <div className="lvn002-quiz-card" style={{ background: '#fff', borderRadius: 24, border: `1px solid ${CI.border}`, boxShadow: '0 24px 60px rgba(15,91,84,.12)', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: CI.teal, marginBottom: 8 }}>Knowledge Check Complete</div>
          <div style={{ position: 'relative', width: 140, height: 140, margin: '12px auto 18px' }}>
            <svg width="140" height="140" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }} aria-hidden>
              <circle cx="60" cy="60" r="45" fill="none" stroke={CI.tealSoft} strokeWidth="10" />
              <circle cx="60" cy="60" r="45" fill="none" stroke={passed ? CI.teal : CI.orange} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset} className="lvn002-rm-transition" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: passed ? CI.teal : CI.orange }}>{pct}%</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: CI.muted }}>{score}/{QUIZ.length}</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: CI.teal, marginBottom: 6 }}>{passed ? 'Knowledge Check Complete' : 'Keep sharpening judgment'}</div>
          <div style={{ fontSize: 14, color: CI.muted, lineHeight: 1.55, marginBottom: 22, maxWidth: 440, marginInline: 'auto' }}>
            Scenario Practice Complete. Practical Competency Remains Separate.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 22 }}>
            {[
              { label: 'Authorized', color: CI.teal, tip: 'Order + competency + expected' },
              { label: 'Conditional', color: CI.orange, tip: 'RN oversight required' },
              { label: 'Prohibited', color: CI.red, tip: 'Hard stop · escalate' },
            ].map((z) => (
              <div key={z.label} style={{ padding: 14, borderRadius: 14, background: CI.bg, border: `1px solid ${CI.border}` }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: z.color, margin: '0 auto 8px' }} />
                <div style={{ fontSize: 12, fontWeight: 800, color: CI.ink }}>{z.label}</div>
                <div style={{ fontSize: 11, color: CI.muted, marginTop: 4 }}>{z.tip}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: `1px solid ${CI.border}`, background: '#fff', color: CI.teal, fontWeight: 800, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Back to Practice</button>
            <button type="button" onClick={() => {
              setIdx(0); setSelected(null); setSubmitted(false);
              setAnswers(Array(QUIZ.length).fill(null)); setFinished(false);
            }} style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: 0, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Retake Check</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lvn002-quiz-page">
      <div className="lvn002-quiz-card" style={{ background: '#fff', borderRadius: 24, border: `1px solid ${CI.border}`, boxShadow: '0 24px 60px rgba(15,91,84,.12)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', background: `linear-gradient(135deg, ${CI.teal} 0%, #0a3d39 100%)`, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Compass size={18} />
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase' }}>Field Judgment Check</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, opacity: .9 }}>{idx + 1} / {QUIZ.length}</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,.18)', overflow: 'hidden' }}>
            <div className="lvn002-rm-transition" style={{ height: '100%', width: `${Math.max(progress, 6)}%`, borderRadius: 999, background: `linear-gradient(90deg, ${CI.orange}, #FFB088)`, transition: 'width .35s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', opacity: .85 }}>
            <span>Observe</span><span>Classify</span><span>Decide</span><span>Defend</span>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: CI.tealSoft, color: CI.teal, fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            <Sparkles size={13} /> Scenario {idx + 1}
          </div>
          <h2 style={{ margin: '0 0 18px', fontSize: 20, fontWeight: 800, color: CI.ink, lineHeight: 1.45 }}>{q.stem}</h2>

          <div role="radiogroup" aria-label="Answer choices" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            onKeyDown={(e) => {
              if (submitted) return;
              const max = q.options.length - 1;
              const cur = selected ?? 0;
              if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); focusOption(Math.min(max, cur + 1)); }
              else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); focusOption(Math.max(0, cur - 1)); }
              else if (e.key === 'Home') { e.preventDefault(); focusOption(0); }
              else if (e.key === 'End') { e.preventDefault(); focusOption(max); }
              else if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); if (selected !== null) submit(); }
            }}>
            {q.options.map((opt, i) => {
              const on = selected === i;
              let border: string = CI.border;
              let bg: string = '#fff';
              let letterBg: string = CI.bg;
              let letterColor: string = CI.muted;
              if (submitted && i === q.correct) { border = CI.teal; bg = CI.tealSoft; letterBg = CI.teal; letterColor = '#fff'; }
              else if (submitted && on && !isCorrect) { border = CI.red; bg = '#FEF2F2'; letterBg = CI.red; letterColor = '#fff'; }
              else if (on) { border = CI.teal; bg = '#F3FBFA'; letterBg = CI.teal; letterColor = '#fff'; }
              return (
                <button key={i} type="button" role="radio" aria-checked={on}
                  ref={(el) => { optionRefs.current[i] = el; }}
                  tabIndex={on || (selected === null && i === 0) ? 0 : -1}
                  disabled={submitted}
                  onClick={() => setSelected(i)}
                  style={{ padding: 14, borderRadius: 14, border: `2px solid ${border}`, background: bg, textAlign: 'left', cursor: submitted ? 'default' : 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start', transition: 'all .15s', minHeight: 48 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: letterBg, color: letterColor, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{letters[i]}</span>
                  <span style={{ fontWeight: 600, color: CI.ink, fontSize: 16, lineHeight: 1.5, paddingTop: 3 }}>{opt}</span>
                  {submitted && i === q.correct && <CheckCircle2 size={18} color={CI.teal} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                  {submitted && on && !isCorrect && <XCircle size={18} color={CI.red} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>

          {submitted && (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: isCorrect ? CI.tealSoft : '#FFF3EC', border: `1px solid ${isCorrect ? CI.tealMuted : '#F6C7A8'}` }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: isCorrect ? CI.teal : CI.orangeDark, marginBottom: 6 }}>
                {isCorrect ? 'Correct judgment' : 'Recalibrate'}
              </div>
              <div style={{ fontSize: 15.5, lineHeight: 1.6, color: CI.ink }}>{q.rationale}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 16px', borderRadius: 12, border: `1px solid ${CI.border}`, background: '#fff', color: CI.muted, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Exit</button>
            <button type="button" onClick={submit} disabled={selected === null}
              style={{ flex: 1, minHeight: 48, border: 0, borderRadius: 12, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase', cursor: selected === null ? 'not-allowed' : 'pointer', opacity: selected === null ? 0.5 : 1 }}>
              {submitted ? (idx >= QUIZ.length - 1 ? 'See scope results' : 'Next scenario') : 'Lock in answer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


const STORAGE_KEY = 'lvn-003-progress-v5415';

type Persisted = {
  pageIndex: number;
  mode: 'lessons' | 'quiz';
  completedByPage: Record<number, string[]>;
  quizAnswers?: (number | null)[];
  quizIdx?: number;
  quizFinished?: boolean;
  quizSelected?: number | null;
  quizSubmitted?: boolean;
};

function loadProgress(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Persisted;
  } catch {
    return null;
  }
}

function saveProgress(data: Persisted) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* private mode / quota */
  }
}

/** Static approved Care Indeed mark (non-interactive, non-animated) */
function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/assets/navigation/logo-careindeed-orange.png"
      alt="Care Indeed logo"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, pointerEvents: 'none', userSelect: 'none' }}
    />
  );
}

export default function LVN003() {
  const initial = loadProgress();
  const [mode, setMode] = useState<'lessons' | 'quiz'>(initial?.mode ?? 'lessons');
  const [pageIndex, setPageIndex] = useState(initial?.pageIndex ?? 0);
  const [completedByPage, setCompletedByPage] = useState<Record<number, string[]>>(initial?.completedByPage ?? {});
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(initial?.quizAnswers ?? Array(QUIZ.length).fill(null));
  const [quizIdx, setQuizIdx] = useState(initial?.quizIdx ?? 0);
  const [quizFinished, setQuizFinished] = useState(!!initial?.quizFinished);
  const [quizSelected, setQuizSelected] = useState<number | null>(initial?.quizSelected ?? null);
  const [quizSubmitted, setQuizSubmitted] = useState(!!initial?.quizSubmitted);
  const page = PAGES[Math.min(pageIndex, PAGES.length - 1)];
  const completed = completedByPage[page.id] ?? [];

  const persistAll = (patch?: Partial<Persisted>) => {
    saveProgress({
      pageIndex,
      mode,
      completedByPage,
      quizAnswers,
      quizIdx,
      quizFinished,
      quizSelected,
      quizSubmitted,
      ...patch,
    });
  };

  useEffect(() => {
    persistAll();
  }, [pageIndex, mode, completedByPage, quizAnswers, quizIdx, quizFinished, quizSelected, quizSubmitted]);

  const handleSaveExit = () => {
    persistAll();
    window.history.back();
  };

  const handleQuizPersist = useCallback((state: { answers: (number | null)[]; idx: number; finished: boolean; selected: number | null; submitted: boolean }) => {
    setQuizAnswers(state.answers);
    setQuizIdx(state.idx);
    setQuizFinished(state.finished);
    setQuizSelected(state.selected);
    setQuizSubmitted(state.submitted);
  }, []);

  return (
    <div className="lvn002 lvn002-shell">
      <style>{STYLES}</style>
      <header className="lvn002-top">
        <div className="lvn002-brand">
          <BrandMark size={32} />
          <span className="brand-text">LVN-003 — RN Co-Sign</span>
        </div>
        <div className="lvn002-tabs" role="tablist" aria-label="Lessons">
          {PAGES.map((p, i) => (
            <button key={p.id} type="button" role="tab" aria-selected={mode === 'lessons' && i === pageIndex}
              className={`lvn002-tab ${mode === 'lessons' && i === pageIndex ? 'active' : ''}`}
              onClick={() => { setMode('lessons'); setPageIndex(i); }}>
              {p.shortName}
            </button>
          ))}
          <button type="button" role="tab" aria-selected={mode === 'quiz'}
            className={`lvn002-tab quiz-tab ${mode === 'quiz' ? 'active' : ''}`}
            onClick={() => setMode('quiz')}>
            Knowledge Check
          </button>
        </div>
        <button type="button" className="lvn002-exit" onClick={handleSaveExit}>Save &amp; Exit</button>
      </header>

      {mode === 'quiz' ? (
        <QuizPage
          onBack={() => setMode('lessons')}
          initialAnswers={quizAnswers}
          initialIdx={quizIdx}
          initialFinished={quizFinished}
          initialSelected={quizSelected}
          initialSubmitted={quizSubmitted}
          onPersist={handleQuizPersist}
        />
      ) : (
        <div className="lvn002-work">
          <aside className="lvn002-left"><LeftPanel page={page} pageIndex={pageIndex} total={PAGES.length} /></aside>
          <section className="lvn002-right">
            <RightPanel page={page} completed={completed}
              setCompleted={(ids) => setCompletedByPage((prev) => ({ ...prev, [page.id]: ids }))}
              onGoQuiz={() => setMode('quiz')} />
          </section>
        </div>
      )}

      <footer className="lvn002-bot">
        <button type="button" className="nav" disabled={mode === 'lessons' && pageIndex === 0}
          onClick={() => {
            if (mode === 'quiz') setMode('lessons');
            else setPageIndex((i) => Math.max(0, i - 1));
          }}>
          <ChevronLeft size={16} /> Prev
        </button>
        <div className="lvn002-footer-status" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 8, padding: '8px 12px' }}>
            {mode === 'quiz' ? 'Knowledge Check · 10 items · 80% pass' : `Lesson ${pageIndex + 1} of ${PAGES.length} · ${page.shortName}`}
          </span>
        </div>
        {mode === 'quiz' ? (
          <button type="button" className="next" onClick={() => setMode('lessons')}>Back to Lessons <ChevronRight size={16} /></button>
        ) : pageIndex === PAGES.length - 1 ? (
          <button type="button" className="next" onClick={() => setMode('quiz')}>Knowledge Check <ChevronRight size={16} /></button>
        ) : (
          <button type="button" className="next" onClick={() => setPageIndex((i) => Math.min(PAGES.length - 1, i + 1))}>Next · {PAGES[pageIndex + 1]?.shortName} <ChevronRight size={16} /></button>
        )}
      </footer>
    </div>
  );
}
