// Auto-generated & cleaned CareIndeedOnboardingLMS.tsx
// Care Indeed Home Health Care, Inc. - Role-Based Onboarding & Competency Journey
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_MODULES as ACHC_ALL_MODULES } from '@/policy/journey/data/ACHC_Annual_Assembled';
import { useLearner } from '@/policy/journey/lib/learnerState';
import ACHCArchivalCertificate from '@/policy/journey/components/ACHCArchivalCertificate';
import { useJourneyStore } from '@/policy/journey/stores/journeyStore';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A: TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

interface NarratedPage {
  title: string;
  content: string;       // HTML string rendered in content area
  narration: string;     // TTS narration script
  audioLabel?: string;   // Accessibility label
  imageAlt?: string;     // Decorative image alt text
}

interface ExamQuestion {
  id: string;
  stem: string;
  options: string[];
  correctIndex: number;
  rationale: string;
  regulatoryRef?: string;
}

interface TrainingModule {
  id: string;            // e.g., "GAO-001", "RN-005"
  title: string;
  track: TrackId;
  durationMinutes: number;
  policyMapped: string[];
  regulatoryBasis?: string | string[];
  pages: NarratedPage[];
  exam: ExamQuestion[];
  passScore: number;     // Percentage (e.g., 80)
  competencyMethod?: string;
}

type TrackId =
  | "GAO"   // General Agency Orientation
  | "ADM"   // Administrator
  | "DON"   // Director of Nursing
  | "RN"    // Registered Nurse
  | "LVN"   // Licensed Vocational Nurse
  | "PT"    // Physical Therapist
  | "PTA"   // Physical Therapist Assistant
  | "OT"    // Occupational Therapist
  | "COTA"  // Certified OT Assistant
  | "SLP"   // Speech-Language Pathologist
  | "MSW"   // Medical Social Worker
  | "HHA"   // Home Health Aide
  | "ANN"   // Annual Mandatory Training
  | "ADV";  // Advanced Training

interface TrackMeta {
  id: TrackId;
  name: string;
  cmsBasis: string;
  reportsTo: string;
  color: string;
  icon: string;
  moduleIds: string[];
  prerequisite?: TrackId;
  completionGate: string;
  description?: string;
}

export interface JourneyActivity {
  activityId: string;
  activityType: "training_module" | "policy_reading" | "policy_quiz" | "policy_acknowledgment" | "supervisor_signoff";
  title: string;
  roleGroup: string;
  inheritedFrom: "ALL_STAFF" | "ALL_DIRECT_CARE" | "ROLE_SPECIFIC" | "SUPERVISOR" | "LEADERSHIP";
  sourceMatrixRole: string;
  sourcePolicyIdDraft?: string;
  resolvedPolicyId?: string | null;
  policyTitle?: string;
  policyRefStatus?: "verified" | "needs_review" | "invalid";
  assignmentType?: "required_read" | "required_acknowledgment" | "required_training" | "role_reference" | "supervisor_reference";
  relatedModuleIds: string[];
  estimatedMinutes: number;
  required: boolean;
  quizRequired: boolean;
  acknowledgmentRequired: boolean;
  competencyRequired: boolean;
  supervisorSignoffRequired: boolean;
  personnelFileEvidenceRequired: boolean;
  completionStatus: "not_started" | "in_progress" | "complete" | "blocked" | "needs_review";
  evidenceRequirements: string[];
}

export interface PolicyProgress {
  policyId: string;
  completionStatus: "not_started" | "in_progress" | "complete" | "blocked" | "needs_review";
  timeSpentSeconds: number;
  readStartedAt?: string;
  readCompletedAt?: string;
  quizAttempts: number;
  bestQuizScore?: number;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgmentSignature?: string;
  supervisorSignedOff: boolean;
  supervisorSignedOffAt?: string;
  supervisorSignature?: string;
  evidencePackage?: Record<string, any>;
}

interface UserProgress {
  currentTrack: TrackId | null;
  currentModuleId: string | null;
  currentPage: number;
  completedModules: Record<string, ModuleResult>;
  examAttempts: Record<string, ExamAttempt[]>;
  startedAt: string;
}

interface ModuleResult {
  moduleId: string;
  completedAt: string;
  examScore: number;
  passed: boolean;
  timeSpentSeconds: number;
  attemptNumber: number;
}

interface ExamAttempt {
  attemptNumber: number;
  score: number;
  passed: boolean;
  timestamp: string;
  answers: number[];
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B: CONSTANTS & CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const BRAND = {
  name: "Care Indeed Home Health Care, Inc.",
  primary: "#0D4F4F",
  primaryLight: "#1A7A7A",
  primaryDark: "#0A3A3A",
  accent: "#F59E0B",
  accentLight: "#FCD34D",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F97316",
  bg: "#F8FFFE",
  bgCard: "#FFFFFF",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  textLight: "#94A3B8",
  border: "#E2E8F0",
};

export const COMPLETION_GATES = {
  GAO_BEFORE_ROLE: true,      // GAO must complete before role-specific
  ROLE_BEFORE_PRACTICE: true,  // Role-specific must complete before independent duties
  ANNUAL_BY_DEC31: true,       // Annual training must complete by Dec 31
};

export const FAILURE_PROTOCOL = {
  remedialDays: 3,   // Retake within 3 business days
  maxAttempts: 3,     // Max exam attempts before supervisor escalation
};


// ─────────────────────────────────────────────────────────────────────────────
// SECTION C: TRACK DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

const TRACKS: Record<TrackId, TrackMeta> = {
  GAO: {
    id: "GAO",
    name: "General Agency Orientation",
    cmsBasis: "HR-TA-005 § 6.2 — All Positions",
    reportsTo: "HR Director",
    color: "#0D4F4F",
    icon: "🏥",
    moduleIds: [
      "GAO-001","GAO-002","GAO-003","GAO-004","GAO-005","GAO-006","GAO-007",
      "GAO-008","GAO-009","GAO-010","GAO-011","GAO-012","GAO-013","GAO-014",
      "GAO-015","GAO-016","GAO-017","GAO-018","GAO-019","GAO-020","GAO-021",
      "GAO-022","GAO-023","GAO-024","GAO-025","GAO-026","GAO-027","GAO-EXAM"
    ],
    completionGate: "80% on GAO-EXAM. Signed HR-TA-005 Appendix A + Appendix D quiz in personnel file.",
    description: "Foundation training required for every role. Covers mission, compliance, HIPAA, safety, infection control, and regulatory basics.",
  },
  ADM: {
    id: "ADM",
    name: "Administrator",
    cmsBasis: "42 CFR § 484.105(b)",
    reportsTo: "Governing Body",
    color: "#7C3AED",
    icon: "👔",
    moduleIds: [
      "ADM-001","ADM-002","ADM-003","ADM-004","ADM-005","ADM-006","ADM-007",
      "ADM-008","ADM-009","ADM-010","ADM-011","ADM-012","ADM-013","ADM-014","ADM-015"
    ],
    prerequisite: "GAO",
    completionGate: "HR-TD-003 Appendix A (admin-adapted). 90-day eval via HR-ER-001 Appendix C.",
    description: "Governance, QAPI oversight, billing compliance, survey readiness, and leadership responsibilities for the Administrator role.",
  },
  DON: {
    id: "DON",
    name: "Director of Nursing (Clinical Manager)",
    cmsBasis: "42 CFR § 484.105(c)",
    reportsTo: "Administrator",
    color: "#DC2626",
    icon: "🩺",
    moduleIds: [
      "DON-001","DON-002","DON-003","DON-004","DON-005","DON-006","DON-007",
      "DON-008","DON-009","DON-010","DON-011","DON-012","DON-013","DON-014",
      "DON-015","DON-016"
    ],
    prerequisite: "GAO",
    completionGate: "HR-TD-003 Appendix A (DON-specific). Min 2-week overlap with outgoing DON.",
    description: "Clinical supervision, OASIS oversight, plan of care management, competency program leadership, and infection prevention oversight.",
  },
  RN: {
    id: "RN",
    name: "Registered Nurse — Clinical Staff",
    cmsBasis: "42 CFR § 484.115(a)",
    reportsTo: "DON/Clinical Manager",
    color: "#2563EB",
    icon: "💉",
    moduleIds: [
      "RN-001","RN-002","RN-003","RN-004","RN-005","RN-006","RN-007","RN-008",
      "RN-009","RN-010","RN-011","RN-012","RN-013","RN-014","RN-015","RN-SUP"
    ],
    prerequisite: "GAO",
    completionGate: "HR-TD-003 Appendix A — 12 core + RN discipline. DON signs HR-TA-005 Appendix B = SATISFACTORY.",
    description: "Core clinical skills, OASIS, documentation, medication management, and patient assessment for RNs.",
  },
  LVN: {
    id: "LVN",
    name: "Licensed Vocational Nurse",
    cmsBasis: "42 CFR § 484.115(c)",
    reportsTo: "DON | Supervised by RN",
    color: "#0891B2",
    icon: "🏷️",
    moduleIds: [
      "LVN-001","LVN-002","LVN-003","LVN-004","LVN-005","LVN-006","LVN-007",
      "LVN-008","LVN-009","LVN-010","LVN-011","LVN-012"
    ],
    prerequisite: "GAO",
    completionGate: "HR-TD-003 Appendix A (LVN). Min 3 supervised visits (5 if new to HH).",
    description: "Skilled nursing support under RN supervision, with focused competency in medications and basic assessments.",
  },
  PT: {
    id: "PT",
    name: "Physical Therapist",
    cmsBasis: "42 CFR § 484.115(d)",
    reportsTo: "DON/Clinical Manager",
    color: "#059669",
    icon: "🦿",
    moduleIds: [
      "PT-001","PT-002","PT-003","PT-004","PT-005","PT-006","PT-007","PT-008","PT-009","PT-010"
    ],
    prerequisite: "GAO",
    completionGate: "HR-TD-003 Appendix A. Min 2 supervised visits. OASIS coding 80%.",
    description: "Therapy evaluation, goal setting, and home exercise programs for PTs in the home health setting.",
  },
  PTA: {
    id: "PTA",
    name: "Physical Therapist Assistant",
    cmsBasis: "42 CFR § 484.115(e)",
    reportsTo: "PT (direct supervision) and DON",
    color: "#34D399",
    icon: "🏃",
    moduleIds: [
      "PTA-001","PTA-002","PTA-003","PTA-004","PTA-005","PTA-006","PTA-007",
      "PTA-008","PTA-009","PTA-010"
    ],
    prerequisite: "GAO",
    completionGate: "HR-TD-003 Appendix A. Min 3 supervised visits. PTA supervision quiz pass.",
    description: "Delivers PT interventions under direct supervision with documentation and patient instruction responsibilities.",
  },
  OT: {
    id: "OT",
    name: "Occupational Therapist",
    cmsBasis: "42 CFR § 484.115(f)",
    reportsTo: "DON/Clinical Manager",
    color: "#7C3AED",
    icon: "🖐️",
    moduleIds: [
      "OT-001","OT-002","OT-003","OT-004","OT-005","OT-006","OT-007","OT-008","OT-009","OT-010"
    ],
    prerequisite: "GAO",
    completionGate: "HR-TD-003 Appendix A. Min 2 supervised visits.",
    description: "Occupational therapy evaluation and intervention planning for patients in the home.",
  },
  COTA: {
    id: "COTA",
    name: "Certified Occupational Therapy Assistant",
    cmsBasis: "42 CFR § 484.115(g)",
    reportsTo: "OT (direct supervision) and DON",
    color: "#A78BFA",
    icon: "✋",
    moduleIds: [
      "COTA-001","COTA-002","COTA-003","COTA-004","COTA-005","COTA-006",
      "COTA-007","COTA-008","COTA-009","COTA-010"
    ],
    prerequisite: "GAO",
    completionGate: "HR-TD-003 Appendix A. Min 3 supervised visits. COTA supervision quiz pass.",
    description: "Delivers OT interventions under supervision with focus on ADLs and functional goals.",
  },
  SLP: {
    id: "SLP",
    name: "Speech-Language Pathologist",
    cmsBasis: "42 CFR § 484.115(h)",
    reportsTo: "DON/Clinical Manager",
    color: "#EC4899",
    icon: "🗣️",
    moduleIds: [
      "SLP-001","SLP-002","SLP-003","SLP-004","SLP-005","SLP-006","SLP-007","SLP-008"
    ],
    prerequisite: "GAO",
    completionGate: "HR-TD-003 Appendix A. Min 2 supervised visits.",
  },
  MSW: {
    id: "MSW",
    name: "Medical Social Worker",
    cmsBasis: "42 CFR § 484.115(i)",
    reportsTo: "DON/Clinical Manager",
    color: "#F59E0B",
    icon: "🤝",
    moduleIds: [
      "MSW-001","MSW-002","MSW-003","MSW-004","MSW-005","MSW-006","MSW-007","MSW-008"
    ],
    prerequisite: "GAO",
    completionGate: "HR-TD-003 Appendix A. Min 2 supervised visits.",
    description: "Speech-language assessment, swallowing, and communication interventions in the home setting.",
  },
  HHA: {
    id: "HHA",
    name: "Home Health Aide",
    cmsBasis: "42 CFR § 484.80 — MOST HEAVILY SURVEYED ROLE",
    reportsTo: "RN Supervisor | DON",
    color: "#F97316",
    icon: "🏠",
    moduleIds: [
      "HHA-001","HHA-002","HHA-003","HHA-004","HHA-005","HHA-006","HHA-007",
      "HHA-008","HHA-009","HHA-010","HHA-011","HHA-012"
    ],
    prerequisite: "GAO",
    completionGate: "HR-TD-003 Appendix D (HHA-specific). RN supervised visit q14d × 60d, then q60d. 12 hrs/yr in-service.",
    description: "Personal care, vital signs, infection control, safety, and documentation. Most heavily surveyed clinical support role.",
  },
  ANN: {
    id: "ANN",
    name: "Annual Mandatory Training",
    cmsBasis: "HR-TD-001 § 6.2 — All Staff",
    reportsTo: "Compliance Officer / HR Director",
    color: "#6366F1",
    icon: "📅",
    moduleIds: [
      "ACHC-ART-M01","ACHC-ART-M02","ACHC-ART-M03","ACHC-ART-M04","ACHC-ART-M05","ACHC-ART-M06",
      "ACHC-ART-M07","ACHC-ART-M08","ACHC-ART-M09","ACHC-ART-M10","ACHC-ART-M11","ACHC-ART-M12"
    ],
    completionGate: "All modules by Dec 31. Escalation at 30/45/60 days overdue per HR-TD-001 § 4.6.",
    description: "Annual refreshers covering compliance, patient rights, infection control, emergency preparedness and more.",
  },
  ADV: {
    id: "ADV",
    name: "Advanced Training — RN Clinical",
    cmsBasis: "Specialized Compliance & Plan of Care",
    reportsTo: "Clinical Manager / DON",
    color: "#F97316",
    icon: "🎓",
    moduleIds: ["cms-485", "qapi", "oasis-e2-soc", "documentation-matters"],
    completionGate: "Complete all Advanced Training simulator cases and defensibility scenarios.",
    description: "Advanced clinical and QAPI training including CMS-485 Plan of Care mastery, OASIS-E2 SOC coding, documentation defensibility, and quality program leadership.",
  },
};

// Note: ADV cards use enhanced JSX below for chips/mini visuals while preserving the core stats and titles from MODULE_MAP.


// ─────────────────────────────────────────────────────────────────────────────
// SECTION D: HELPER UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

export const uid = (): string => Math.random().toString(36).substring(2, 10);

export const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};


const pct = (score: number, total: number): number =>
  total === 0 ? 0 : Math.round((score / total) * 100);

const speakNarration = (text: string): void => {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95;
  u.pitch = 1.0;
  u.lang = "en-US";
  window.speechSynthesis.speak(u);
};

const stopNarration = (): void => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

const saveProgress = (progress: UserProgress): void => {
  try {
    localStorage.setItem("ci_onboarding_progress", JSON.stringify(progress));
  } catch {}
};

const loadProgress = (): UserProgress | null => {
  try {
    const raw = localStorage.getItem("ci_onboarding_progress");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION E: GAO MODULES 001–014 (General Agency Orientation — First Half)
// Each module: ~30-35 min, 8-12 narrated pages, 5-question final exam
// ─────────────────────────────────────────────────────────────────────────────

const GAO_MODULES_PART1: TrainingModule[] = [
  // ═══════════════════════════════════════════════════════════════
  // GAO-001: Agency Mission, Vision, Values
  // ═══════════════════════════════════════════════════════════════
    {
    id: "GAO-001",
    title: "Agency Mission, Vision & Values",
    track: "GAO",
    durationMinutes: 30,
    policyMapped: [
      "HR-TA-001 §6.9 (Orientation Requirements)",
      "CO-CP-001 §6.1.1 (Compliance Orientation)",
      "Agency Charter (Mission/Vision/Values)",
      "42 CFR §484.105(b) — Standard: Administrator Qualifications (org governance)",
      "42 CFR §484.110 — Condition: Patient Rights (dignity, respect)",
      "HR-TA-005 Appendix A — General Agency Orientation Checklist"
    ],
    regulatoryBasis: [
      "42 CFR Part 484 — Conditions of Participation for Home Health Agencies",
      "ACHC Home Health Standards — On-Hire Training Requirement",
      "CMS State Operations Manual — Appendix B (Survey Protocol)"
    ],
    pages: [
      {
        title: "Welcome to Care Indeed Home Health Care",
        content: `<h2>Welcome to Care Indeed Home Health Care</h2>
<p>Welcome to Care Indeed Home Health Care, Inc. You are joining a Medicare-certified, ACHC-accredited home health agency that serves patients across the communities we operate in. This is not simply a job orientation — this is the foundation of your professional responsibility in a regulated healthcare environment.</p>
<p>Care Indeed operates under the federal Conditions of Participation (42 CFR Part 484) and is accredited by the Accreditation Commission for Health Care (ACHC). Every employee — clinical and non-clinical — plays a role in maintaining our compliance, our quality outcomes, and our patients' trust.</p>
<div style="background:#E0F7FA;padding:16px;border-radius:8px;margin:16px 0;">
<strong>What You Will Learn in This Module:</strong>
<ul>
<li>Our mission statement and what it demands of every team member</li>
<li>Our vision for clinical excellence, workforce development, and community trust</li>
<li>Core values as behavioral expectations, not slogans</li>
<li>How home health is different from facility-based care</li>
<li>Your personal responsibility in a regulated Medicare-certified agency</li>
<li>What documentation, escalation, and "when in doubt, report" means</li>
<li>How survey readiness connects to everything you do</li>
</ul>
</div>
<div style="background:#EBF3F3;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #0D4F4F;">
<strong>Why This Module Matters:</strong>
<p>When a CMS surveyor or ACHC reviewer arrives, one of the first things they verify is whether staff understand the agency's mission, their role within it, and how values translate into patient care decisions. This module is not theoretical. Your completion is documented in your personnel file and constitutes evidence of competency orientation.</p>
</div>
<p><em>Estimated time for this page: 3 minutes of reading plus narration.</em></p>`,
        narration: "Lina Reyes sits at her desk on her very first day at Care Indeed Home Health Care. She logs in, and a new message appears in her inbox. The subject line reads: Welcome to Care Indeed Home Health Care.\n\nThis is more than a greeting. Lina is joining a Medicare-certified, ACHC-accredited home health agency. That means every team member — clinical and non-clinical — carries real responsibility for patient safety, regulatory compliance, and the trust that families and physicians place in us.\n\nAs she opens the email, Lina learns what this module will cover: the agency mission and what it demands, the vision for excellence, core values as daily behavior, how home health differs from facility care, the importance of accurate documentation, when and how to escalate concerns, and why survey readiness starts on day one.\n\nThis is the beginning of Lina's onboarding journey. Before she steps into a patient's home, she must understand the standards, the expectations, and the reasons behind them. What she learns today will shape how she cares for patients and how she protects herself and the agency every single visit.",
      },
      {
        title: "Our Mission — What It Demands of You",
        content: `<h2>Our Mission — What It Demands of You</h2>
<blockquote style="background:#F9FBFB;padding:16px;border-left:4px solid #0D4F4F;margin:16px 0;font-style:italic;">
"To provide patient-centered, evidence-based home health services that promote independence, dignity, and quality of life — delivered by a team of dedicated professionals committed to clinical excellence and regulatory integrity."
</blockquote>
<p>This is not decorative language. Every phrase carries operational weight:</p>
<ul>
<li><strong>Patient-Centered:</strong> Every clinical decision begins with: "What does this patient need right now?" — not what is fastest, not what is easiest to document, not what avoids a difficult conversation. CMS requires that care be individualized to the patient's assessed needs (42 CFR §484.60).</li>
<li><strong>Evidence-Based:</strong> We follow current clinical best practices, established protocols, and peer-reviewed standards. You do not improvise care. You do not rely on "how we did it at my last agency." You follow Care Indeed protocols, which are built on national guidelines.</li>
<li><strong>Promote Independence:</strong> We help patients regain or maintain their functional abilities. We do not create dependency. Every visit should move the patient closer to their goals — not keep them on service longer than medically necessary.</li>
<li><strong>Dignity and Quality of Life:</strong> Treat every patient's home as sacred space. You knock. You ask permission. You explain before you touch. You protect their privacy. You speak to them as adults with agency over their own care.</li>
<li><strong>Regulatory Integrity:</strong> Compliance is not an add-on or an afterthought. It is woven into every visit, every note, every communication. We comply because it protects patients — not merely to avoid penalties.</li>
</ul>
<h3>What the Mission Means in the Field:</h3>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
<tr style="background:#0D4F4F;color:white;"><th style="padding:10px;text-align:left;">Situation</th><th style="padding:10px;text-align:left;">Mission-Aligned Response</th></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">Patient refuses a treatment</td><td style="padding:10px;">Respect autonomy, educate, document refusal and education provided</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">Family asks you to do something outside your scope</td><td style="padding:10px;">Politely decline, explain scope, escalate to supervisor</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">You notice an unsafe condition in the home</td><td style="padding:10px;">Report it — to your supervisor, in your documentation, same day</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">Your documentation is "close enough"</td><td style="padding:10px;">Correct it. Close enough is not compliant.</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">You are unsure whether something needs reporting</td><td style="padding:10px;">When in doubt, report. Always escalate uncertainty upward.</td></tr>
</table>`,
        narration: "Let me break down our mission statement because every word matters. Patient-centered means you start every decision by asking what the patient needs right now — not what is convenient for your schedule. Evidence-based means you follow established protocols, not habits from previous jobs. Promote independence means you help patients do more for themselves — you do not create dependency. Dignity means you treat every home as sacred space — knock, ask permission, explain before you touch. And regulatory integrity means compliance is not separate from care — it is care. Here is the hard truth: when you walk into a patient's home, you represent this entire agency. One missed report, one undocumented concern, one scope violation can trigger a survey finding that affects every employee here. The mission is not aspirational. It is operational. It is your job description in one sentence.",
      },
      {
        title: "Our Vision — Four Pillars of Excellence",
        content: `<h2>Our Vision — Four Pillars of Excellence</h2>
<p>Care Indeed's vision rests on four operational pillars. These are not abstract ideals — they are measurable commitments with specific expectations for every employee:</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0;">
<div style="background:#E0F7FA;padding:16px;border-radius:8px;"><strong>🏥 Clinical Excellence</strong><br/>We pursue outcomes above national benchmarks. This means accurate OASIS coding, evidence-based care planning, timely interventions, and measurable patient improvement. Do not rush assessments or document what you did not observe.</div>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;"><strong>📚 Workforce Development</strong><br/>Continuous learning is not optional — it is built into your employment. You will complete this orientation, role-specific training, and annual refreshers. The agency tracks your competency progression.</div>
<div style="background:#FFF3E0;padding:16px;border-radius:8px;"><strong>⚖️ Regulatory Leadership</strong><br/>We aim to be survey-ready every single day. This means your documentation is complete today — not later. Your training is current today — not next week. A surveyor could walk in tomorrow.</div>
<div style="background:#F3E5F5;padding:16px;border-radius:8px;"><strong>🤝 Community Trust</strong><br/>Physicians, discharge planners, and families choose Care Indeed because they trust our quality. That trust is built one visit at a time, one accurate note at a time. It is destroyed by a single failure.</div>
</div>`,
        narration: "Our vision has four pillars and each one demands something specific from you. Clinical Excellence means your assessments are thorough, your coding is accurate, and your care is measurable. Workforce Development means you take your training seriously — you are in it right now, and you will continue learning throughout your employment. Regulatory Leadership means you are survey-ready today, not someday. Your documentation is complete now, your training is current now. And Community Trust means that every single visit you make either builds or erodes the trust that referral sources, families, and physicians place in us. One bad outcome traced to one untrained employee can unravel years of reputation.",
      },
      {
        title: "Core Values as Behavioral Expectations",
        content: `<h2>Core Values as Behavioral Expectations</h2>
<p>Care Indeed's core values are not motivational posters. They are behavioral expectations that shape how you interact with patients, families, physicians, coworkers, and regulators. You will be evaluated against these values:</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0;">
<div style="background:#E8F5E9;padding:16px;border-radius:8px;"><strong>🫡 Integrity</strong><br/>Do the right thing even when no one is watching. Document truthfully, even when uncomfortable. Report concerns, even when unsure. Never falsify, backdate, or sign for what you did not do.</div>
<div style="background:#E3F2FD;padding:16px;border-radius:8px;"><strong>💛 Compassion</strong><br/>Treat every patient as you would your own family member. Listen fully, validate emotions, explain in plain language, respect cultural preferences, and never rush a patient because you are behind.</div>
<div style="background:#FFF3E0;padding:16px;border-radius:8px;"><strong>📈 Excellence</strong><br/>Never settle for "good enough." If your wound measurement is approximate, remeasure. If your OASIS response is uncertain, look up the guidance. Finish documentation before you leave for the day.</div>
<div style="background:#F3E5F5;padding:16px;border-radius:8px;"><strong>🤝 Teamwork</strong><br/>Home health is inherently interdisciplinary. PT identifies a fall risk — they communicate to the RN immediately. RN identifies a psychosocial need — they coordinate with MSW. The care plan is a team product.</div>
<div style="background:#ECEFF1;padding:16px;border-radius:8px;"><strong>📋 Accountability</strong><br/>Own your responsibilities. If you make an error, report it. If your training is overdue, complete it. If you receive feedback, act on it. Do not wait for reminders, warnings, or escalation.</div>
<div style="background:#FBE9E7;padding:16px;border-radius:8px;"><strong>🔒 Compliance</strong><br/>Follow regulations, policies, and procedures because they protect patients. Never cut corners on safety, documentation, or scope of practice. If a shortcut feels convenient, it is probably non-compliant.</div>
</div>`,
        narration: "I want to be direct about our values. These are not suggestions. They are behavioral expectations, and you will be evaluated against them. Integrity means document truthfully, even when the truth is uncomfortable. Compassion means never rush a patient because you are behind schedule. Excellence means if your wound measurement is approximate, you remeasure. Teamwork means you communicate findings to other disciplines the same day. Accountability means if you made an error, you report it yourself. Compliance means you never cut corners on documentation or scope. These values show up in your performance reviews, in incident investigations, and in survey findings. They are not optional.",
      },
      {
        title: "What Makes Home Health Different",
        content: `<h2>What Makes Home Health Different</h2>
<p>If you have worked in a hospital, skilled nursing facility, or clinic, home health will feel fundamentally different. Understanding these differences is critical to your success and your patients' safety:</p>
<ul>
<li><strong>You Are a Guest in Their Home:</strong> Unlike a facility where the patient adapts to the institutional environment, in home health YOU adapt to THEIR environment. You enter their space, respect their routines, and leave their home as you found it. Document objectively and escalate safety concerns.</li>
<li><strong>You Practice Autonomously:</strong> There is no nurse at the desk down the hall. There is no physician rounding in 20 minutes. When you are in a patient's home, your clinical judgment is the frontline. "I was not sure what to do" is never an acceptable final answer — you must know when and how to escalate.</li>
<li><strong>Documentation Is Your Defense:</strong> In a facility, multiple staff may witness an event. In home health, you are often the only professional present. Your documentation is the sole record of what happened. If it is not documented, it did not happen.</li>
<li><strong>The Patient's Environment Is Your Workplace:</strong> You may encounter pets, family members with strong opinions, cluttered or unsanitary conditions, and safety hazards. You do not get to choose your workspace. You DO get to document concerns, request safety interventions, and escalate when needed.</li>
<li><strong>Interdisciplinary Coordination Is Harder:</strong> You cannot walk down the hall to consult PT. You must document, communicate, and coordinate using the systems and protocols Care Indeed provides. Timely communication saves lives.</li>
</ul>`,
        narration: "If you have worked in a hospital or facility before, I need you to understand: home health is different in ways that matter for patient safety. You are a guest in the patient's home — you adapt to their environment, not the other way around. You practice with significant autonomy — there is no nurse down the hall, no physician rounding in twenty minutes. Your documentation is your only defense because you are often the sole witness to clinical events. The patient's environment is your workplace, and you may encounter conditions that are challenging, uncomfortable, or unsafe. And interdisciplinary coordination requires deliberate effort because your teammates are not in the next room. Every one of these differences makes your training, your judgment, and your documentation skills more important, not less.",
      },
      {
        title: "Your Responsibility in a Regulated Agency",
        content: `<h2>Your Responsibility in a Regulated Agency</h2>
<p>As an employee of a Medicare-certified home health agency, you carry specific regulatory responsibilities regardless of your role:</p>
<ul>
<li><strong>You Are Subject to Federal Oversight:</strong> Care Indeed participates in Medicare. That means CMS (Centers for Medicare & Medicaid Services) has authority over our operations. ACHC conducts deemed-status surveys. You may be interviewed by a surveyor at any time.</li>
<li><strong>Your Personnel File Must Be Complete:</strong> Your file must contain background check, licensure verification, health screening, signed orientation acknowledgments, training completion records, competency evaluations, and annual refreshers. A missing item is a potential citation.</li>
<li><strong>You Must Report Concerns:</strong> Federal law and Care Indeed policy require you to report suspected abuse, neglect, or exploitation of patients; unsafe conditions; compliance violations; fraud, waste, or abuse; and any event that harms or could harm a patient.</li>
<li><strong>You Must Maintain Competency:</strong> You must demonstrate ongoing competency through training completion, supervised practice (for clinical staff), annual refreshers, and performance evaluations.</li>
<li><strong>You Must Protect Patient Information:</strong> HIPAA and CMIA (California law) require you to protect patient health information. You do not discuss patients in public or photograph patients. Violations carry personal liability.</li>
</ul>`,
        narration: "This is important: regardless of your specific role, you carry regulatory responsibilities as an employee of a Medicare-certified agency. CMS has authority over our operations. ACHC surveys us. State agencies can investigate complaints. Your personnel file must be complete — and a single missing item can trigger a citation. You are legally required to report suspected abuse, neglect, unsafe conditions, compliance violations, and fraud. You must maintain competency through ongoing training. And you must protect patient information under HIPAA and California's CMIA. Non-compliance carries real consequences — not warnings, not suggestions, but potential suspension, termination, or personal legal liability. I am not saying this to frighten you. I am saying it because understanding your responsibility is the first step to meeting it.",
      },
      {
        title: "In-Lesson Knowledge Checks",
        content: `<h2>Knowledge Check — Checkpoint Before Scenarios</h2>
<div style="background:#F0F9FF;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #0284C7;">
<strong>Checkpoint 1:</strong> A CMS surveyor asks you: "Can you tell me about your agency's mission?" Which response best demonstrates understanding?
<ul>
<li>A) "We provide home health care." (Too vague — does not demonstrate orientation completion)</li>
<li><strong>B) "We provide patient-centered, evidence-based services that promote independence and dignity, with a commitment to clinical excellence and regulatory integrity."</strong> ✅</li>
<li>C) "I am not sure, I just do my job." (Demonstrates failure of orientation training)</li>
</ul>
</div>
<div style="background:#F0F9FF;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #0284C7;">
<strong>Checkpoint 2:</strong> You notice something concerning during a home visit but are not sure if it is serious enough to report. What is the correct action?
<ul>
<li>A) Wait and see if it happens again next visit (Delay = potential harm)</li>
<li><strong>B) Document your observation and report to your supervisor the same day</strong> ✅</li>
<li>C) Ask the patient's family member what they think (Not the reporting chain)</li>
</ul>
</div>
<div style="background:#F0F9FF;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #0284C7;">
<strong>Checkpoint 3:</strong> Which of the following is TRUE about your documentation in home health?
<ul>
<li>A) If another staff member saw it too, you do not need to document it</li>
<li>B) You can complete documentation within 72 hours</li>
<li><strong>C) Your documentation is often the sole record of what occurred and serves as legal evidence</strong> ✅</li>
</ul>
</div>`,
        narration: "Before we move to the scenario challenges, let us check your understanding with three quick questions. These are not graded, but they mirror what you will see on the final quiz and what surveyors actually ask staff during site visits. Take a moment to answer each one honestly before reading the debrief.",
      },
      {
        title: "Scenario Challenges",
        content: `<h2>Scenario Challenges — Real-World Decision Making</h2>
<div style="background:#FFF3E0;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #F59E0B;">
<strong>SCENARIO 1: The New Employee and the Concerning Observation</strong>
<p>You are a newly hired home health aide completing your second week. During a routine visit to assist Mr. Torres with bathing, you notice several small bruises on his upper arms that were not there last visit. Mr. Torres lives with his adult son. When you ask about the bruises, Mr. Torres becomes quiet and says, "I am clumsy. I bump into things." His son is in the other room. What do you do?</p>
<ul>
<li><strong>Best Action:</strong> Document your objective observation (location, size, color of bruises; patient's stated explanation; patient's demeanor when asked), complete your visit duties, and report to your supervising RN immediately after the visit. ✅</li>
<li><em>Why:</em> Mandatory reporting is required. Your role is to observe, document, and report through the chain — not to confront a potential abuser or unilaterally call Adult Protective Services from the home unless there is immediate danger.</li>
</ul>
</div>
<div style="background:#FFF3E0;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #F59E0B;">
<strong>SCENARIO 2: The Family Member's Inappropriate Request</strong>
<p>You are a physical therapist completing a home visit with Mrs. Chen. Her daughter, who is present, says: "While you are here, can you look at my knee? It has been bothering me for weeks. You are a PT — can you just tell me what is wrong?" What do you do?</p>
<ul>
<li><strong>Best Action:</strong> Politely decline, explain that you are only authorized to treat the patient of record (Mrs. Chen), and suggest the daughter contact her physician. ✅</li>
<li><em>Why:</em> Services must be provided in accordance with the plan of care (42 CFR §484.60). Treating anyone other than the patient of record is a scope violation and creates liability.</li>
</ul>
</div>`,
        narration: "Now let us put your learning to the test with two realistic scenarios. These mirror situations that actually occur in home health. For each one, I want you to think about what you would genuinely do before reading the answer options. Consider: What does the mission demand? What do the values require? What does policy say? There is always a clearly correct answer — and several tempting wrong answers that feel reasonable but carry real risk.",
      },
      {
        title: "Survey Readiness, Attestation & Completion Evidence",
        content: `<h2>Survey Readiness, Attestation & Completion Evidence</h2>
<h3>What Surveyors May Ask You:</h3>
<ul>
<li>"What is your agency's mission?"</li>
<li>"How do you report a concern about patient safety?"</li>
<li>"What training did you receive during orientation?"</li>
<li>"How do you handle a situation outside your scope of practice?"</li>
<li>"What are your documentation responsibilities?"</li>
</ul>
<p><strong>How to Answer:</strong> Answer honestly in your own words. It is acceptable to say: "I would contact my supervisor" or "I would refer to policy" if you are unsure. Never lie to a surveyor.</p>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Onboarding Attestation:</h3>
<p>By completing this module, you attest that you understand the mission, vision, values, your reporting and documentation responsibilities, and that compliance is mandatory. This record is stored in your personnel file.</p>
</div>
<h3>Remediation Protocol:</h3>
<p>If you score below 80% on the final quiz, you must retake it within 3 business days. You have a maximum of 3 attempts before supervisor escalation.</p>`,
        narration: "Let me prepare you for survey readiness. When surveyors arrive, they may pull any staff member aside and ask about your training, your understanding of the mission, and how you handle concerns. Answer honestly, in your own words. Do not try to recite a scripted answer — surveyors see through that immediately. If you are unsure of something, it is always acceptable to say you would contact your supervisor or reference the policy. Now, your completion of this module constitutes a formal attestation. Your quiz score, completion timestamp, and attestation signature are all filed in your personnel record. You need a score of eighty percent or higher to pass. If you do not pass, you have three business days to retake. Three failures triggers supervisor escalation. This is not punitive — it is protective. Patients deserve staff who understand these fundamentals. Congratulations on completing the content portion of GAO-001. You are now ready for the final quiz.",
      },
    ],
    exam: [
      {
        id: "GAO001-Q01",
        stem: "Which of the following BEST describes Care Indeed's mission?",
        options: [
          "Maximizing agency revenue and market share",
          "To provide patient-centered, evidence-based home health services that promote independence, dignity, and quality of life with clinical excellence and regulatory integrity",
          "To be the largest home health agency in California",
          "To comply with CMS regulations and maintain accreditation"
        ],
        correctIndex: 1,
        rationale: "The mission emphasizes patient-centered, evidence-based services promoting independence, dignity, and quality of life — delivered with clinical excellence and regulatory integrity."
      },
      {
        id: "GAO001-Q02",
        stem: "A CMS surveyor asks you about the agency mission during a site visit. What is the BEST approach?",
        options: [
          "Recite the mission statement word-for-word from memory",
          "Say you are not sure and refer them to your supervisor",
          "Answer honestly in your own words based on your genuine understanding",
          "Tell them you will need to look it up and get back to them"
        ],
        correctIndex: 2,
        rationale: "Surveyors prefer honest answers in the employee's own words. Scripted responses are detectable and do not demonstrate true understanding."
      },
      {
        id: "GAO001-Q03",
        stem: "Which of the four Vision Pillars states that Care Indeed aims to be \"survey-ready every single day\"?",
        options: [
          "Clinical Excellence",
          "Workforce Development",
          "Regulatory Leadership",
          "Community Trust"
        ],
        correctIndex: 2,
        rationale: "Regulatory Leadership means not merely complying but being survey-ready every day — documentation complete today, training current today, ready for inspection at any moment."
      },
      {
        id: "GAO001-Q04",
        stem: "You notice something concerning during a home visit but are unsure if it is serious. According to Care Indeed policy, you should:",
        options: [
          "Wait to see if it happens again on the next visit",
          "Ask the patient's family member for their opinion",
          "Document your observation objectively and report to your supervisor the same day",
          "Call 911 immediately regardless of the situation"
        ],
        correctIndex: 2,
        rationale: "\"When in doubt, report.\" Document objectively, escalate to supervisor same-day. Do not wait, do not investigate, do not rely on family interpretation."
      },
      {
        id: "GAO001-Q05",
        stem: "In home health, your documentation serves as:",
        options: [
          "A formality required by the billing department",
          "Often the sole legal record of what occurred during your visit",
          "A summary that can be completed within 72 hours",
          "An optional record that supports but does not replace verbal reporting"
        ],
        correctIndex: 1,
        rationale: "In home health, you are frequently the only professional present. Documentation is the sole legal, regulatory, and clinical record."
      },
      {
        id: "GAO001-Q06",
        stem: "A patient's family member asks you to examine their own medical concern while you are in the home. The correct response is:",
        options: [
          "Briefly assess them since building rapport with the family is important",
          "Politely decline, explain you are only authorized to treat the patient of record, and suggest they contact their physician",
          "Document a referral for the family member through Care Indeed",
          "Ignore the request and continue with your visit"
        ],
        correctIndex: 1,
        rationale: "You are in the home under a physician's order for the patient of record only. Treating anyone else is a scope violation and creates liability."
      },
      {
        id: "GAO001-Q07",
        stem: "Which statement about Care Indeed's core values is TRUE?",
        options: [
          "Values are aspirational goals that guide the agency's strategic plan but do not affect individual evaluations",
          "Values are behavioral expectations that shape daily interactions and are referenced in performance reviews",
          "Values are primarily used for marketing materials and public communications",
          "Values only apply to clinical staff who provide direct patient care"
        ],
        correctIndex: 1,
        rationale: "Core values are behavioral expectations for ALL employees. They shape daily interactions and are explicitly referenced in performance evaluations, incident reviews, and survey findings."
      },
      {
        id: "GAO001-Q08",
        stem: "What is a key difference between home health and facility-based care that affects your practice?",
        options: [
          "Home health has fewer documentation requirements since patients are more stable",
          "You practice with greater autonomy and your documentation is often the sole record of events",
          "Home health patients do not require physician orders",
          "Family members are responsible for care coordination in home health"
        ],
        correctIndex: 1,
        rationale: "Home health involves autonomous practice without immediate colleagues available. Documentation carries greater weight because you are often the only professional present."
      },
      {
        id: "GAO001-Q09",
        stem: "If you score below 80% on this module's quiz, what is the correct remediation process?",
        options: [
          "You may continue to the next module and retake this quiz at any time",
          "You must retake the quiz within 3 business days, with a maximum of 3 attempts before supervisor escalation",
          "You are immediately terminated for failing to demonstrate competency",
          "Your supervisor reviews the content with you and waives the quiz requirement"
        ],
        correctIndex: 1,
        rationale: "Per failure protocol: retake within 3 business days, maximum 3 attempts. Failure after 3 attempts triggers supervisor escalation."
      },
      {
        id: "GAO001-Q10",
        stem: "The phrase \"regulatory integrity\" in Care Indeed's mission means:",
        options: [
          "Compliance is handled by the compliance department so staff can focus on patient care",
          "The agency passes surveys consistently",
          "Compliance is woven into every visit, every note, and every decision because it protects patients",
          "Regulations are followed primarily to avoid financial penalties"
        ],
        correctIndex: 2,
        rationale: "Regulatory integrity means compliance is integrated into daily practice — not siloed to a department, not motivated by penalty avoidance, but embedded because regulations exist to protect patients."
      }
    ],
    passScore: 80,
    competencyMethod: "Post-test (≥80%) + onboarding attestation + supervisor/HR review where applicable",
  },
{
    id: "GAO-002",
    title: "Organizational Structure & Reporting Lines",
    track: "GAO",
    durationMinutes: 30,
    policyMapped: ["GV-OG-001"],
    pages: [
      {
        title: "Why Organizational Structure Matters",
        content: `<h2>Organizational Structure & Reporting</h2>
<p>In home health care, understanding <strong>who reports to whom</strong> is not just administrative — it's a <strong>patient safety requirement</strong>. CMS requires that every home health agency have a clear organizational structure with defined lines of authority.</p>
<div style="background:#FFF3E0;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #F59E0B;">
<strong>42 CFR § 484.105:</strong> The agency must have an organizational structure that defines lines of authority and services furnished.
</div>
<h3>Why This Matters to You:</h3>
<ul>
<li>You must know who supervises your work</li>
<li>You must know who to escalate urgent issues to</li>
<li>Clinical supervision chains affect patient safety</li>
<li>Surveyors verify that staff can identify their supervisors and reporting structure</li>
</ul>`,
        narration: "Understanding organizational structure in home health care is a patient safety requirement, not just administrative knowledge. CMS under 42 CFR Section 484.105 requires every agency to have a clear organizational structure with defined lines of authority. You must know who supervises your work, who to escalate issues to, and how clinical supervision chains protect patients. Surveyors will verify that you can identify your supervisors.",
      },
      {
        title: "Governing Body",
        content: `<h2>The Governing Body</h2>
<p>Per <strong>42 CFR § 484.105(a)</strong>, every Medicare-certified home health agency must have a Governing Body that assumes <strong>full legal authority and responsibility</strong> for the agency's operation.</p>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Governing Body Responsibilities (GV-GB-001):</h3>
<ul>
<li>Appoints the Administrator</li>
<li>Approves the agency's policies and bylaws</li>
<li>Ensures adequate resources for patient care</li>
<li>Oversees the QAPI program</li>
<li>Evaluates Administrator performance annually</li>
<li>Maintains meeting minutes as evidence</li>
</ul>
</div>
<p>The Governing Body is the <strong>ultimate accountability layer</strong>. If something goes systemically wrong, CMS looks at the Governing Body first.</p>`,
        narration: "Per 42 CFR Section 484.105(a), every Medicare-certified home health agency must have a Governing Body that assumes full legal authority for the agency's operation. Per our policy GV-GB-001, the Governing Body appoints the Administrator, approves policies and bylaws, ensures adequate resources, oversees the QAPI program, evaluates the Administrator annually, and maintains meeting minutes. The Governing Body is the ultimate accountability layer.",
      },
      {
        title: "Administrator Role",
        content: `<h2>The Administrator</h2>
<p>Per <strong>42 CFR § 484.105(b)</strong>, the Administrator is appointed by the Governing Body and is responsible for <strong>all day-to-day operations</strong>.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
<tr style="background:#0D4F4F;color:white;"><th style="padding:10px;">Responsibility</th><th style="padding:10px;">Policy Reference</th></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">Organize and direct ongoing agency functions</td><td style="padding:10px;">GV-GB-001 § 6.2.2</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">Employ qualified personnel</td><td style="padding:10px;">HR-TA-001</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">Ensure compliance with all regulations</td><td style="padding:10px;">CO-CP-001</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">Maintain liaison with Governing Body</td><td style="padding:10px;">GV-GB-001 § 6.2.2.3</td></tr>
<tr><td style="padding:10px;">Implement the emergency operations plan</td><td style="padding:10px;">OP-FM-005</td></tr>
</table>
<p>The Administrator is your agency's <strong>executive leader</strong> — they don't provide direct patient care, but they ensure the systems, staff, and resources are in place for safe care delivery.</p>`,
        narration: "Per 42 CFR Section 484.105(b), the Administrator is appointed by the Governing Body and oversees all day-to-day operations. This includes organizing and directing agency functions, employing qualified personnel, ensuring regulatory compliance, maintaining liaison with the Governing Body, and implementing the emergency operations plan. The Administrator is the executive leader who ensures the systems and resources are in place for safe care delivery.",
      },
      {
        title: "Director of Nursing / Clinical Manager",
        content: `<h2>Director of Nursing (Clinical Manager)</h2>
<p>Per <strong>42 CFR § 484.105(c)</strong>, the DON must be a <strong>registered nurse</strong> responsible for <strong>all patient care services</strong>.</p>
<div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;">
<h3>DON Core Functions:</h3>
<ul>
<li><strong>Clinical oversight:</strong> All patient care plans, OASIS accuracy, clinical documentation</li>
<li><strong>Staff supervision:</strong> RNs, LVNs, therapists, MSW, HHAs — all clinical disciplines</li>
<li><strong>Competency management:</strong> Ensures initial and annual competency evaluations are completed</li>
<li><strong>QAPI participation:</strong> Leads clinical quality improvement initiatives</li>
<li><strong>HHA supervision:</strong> Ensures the 14-day/60-day supervisory visit cycle per § 484.80(h)</li>
</ul>
</div>
<p>The DON is the <strong>clinical authority</strong> of the agency. When you have a clinical question, the chain ultimately leads to the DON.</p>`,
        narration: "Per 42 CFR Section 484.105(c), the Director of Nursing must be a registered nurse responsible for all patient care services. The DON provides clinical oversight of care plans, OASIS accuracy, and documentation. They supervise all clinical disciplines: RNs, LVNs, therapists, social workers, and home health aides. They manage the competency evaluation program, lead QAPI clinical quality initiatives, and ensure HHA supervisory visits occur on schedule. The DON is the clinical authority of the agency.",
      },
      {
        title: "Clinical Staff Structure",
        content: `<h2>Clinical Staff — 42 CFR § 484.115</h2>
<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
<tr style="background:#0D4F4F;color:white;"><th style="padding:8px;">Position</th><th style="padding:8px;">CoP Section</th><th style="padding:8px;">Reports To</th><th style="padding:8px;">Supervises</th></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px;">RN</td><td style="padding:8px;">§ 484.115(a)</td><td style="padding:8px;">DON</td><td style="padding:8px;">LVN, HHA</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px;">LVN</td><td style="padding:8px;">§ 484.115(c)</td><td style="padding:8px;">DON/RN</td><td style="padding:8px;">—</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px;">PT</td><td style="padding:8px;">§ 484.115(d)</td><td style="padding:8px;">DON</td><td style="padding:8px;">PTA</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px;">PTA</td><td style="padding:8px;">§ 484.115(e)</td><td style="padding:8px;">PT/DON</td><td style="padding:8px;">—</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px;">OT</td><td style="padding:8px;">§ 484.115(f)</td><td style="padding:8px;">DON</td><td style="padding:8px;">COTA</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px;">COTA</td><td style="padding:8px;">§ 484.115(g)</td><td style="padding:8px;">OT/DON</td><td style="padding:8px;">—</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px;">SLP</td><td style="padding:8px;">§ 484.115(h)</td><td style="padding:8px;">DON</td><td style="padding:8px;">—</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px;">MSW</td><td style="padding:8px;">§ 484.115(i)</td><td style="padding:8px;">DON</td><td style="padding:8px;">—</td></tr>
<tr><td style="padding:8px;">HHA</td><td style="padding:8px;">§ 484.80</td><td style="padding:8px;">RN/DON</td><td style="padding:8px;">—</td></tr>
</table>
<div style="background:#FBE9E7;padding:12px;border-radius:8px;margin-top:12px;">
<strong>⚠️ Key Rule:</strong> Assistants (PTA, COTA) work under the <strong>direct supervision</strong> of their respective therapist (PT, OT). They cannot practice independently.
</div>`,
        narration: "Clinical staff positions are defined under 42 CFR Section 484.115. RNs report to the DON and supervise LVNs and HHAs. LVNs report to the DON and RN. PTs report to the DON and supervise PTAs. OTs report to the DON and supervise COTAs. SLPs and MSWs report directly to the DON. HHAs report to the RN and DON. A critical rule: assistants, meaning PTAs and COTAs, must work under the direct supervision of their respective therapist and cannot practice independently.",
      },
      {
        title: "Your Reporting Chain",
        content: `<h2>Understanding Your Own Chain</h2>
<p>Regardless of your role, you should be able to answer these questions on Day 1:</p>
<div style="background:#F0F9FF;padding:16px;border-radius:8px;margin:16px 0;">
<ol>
<li><strong>Who is my direct supervisor?</strong> — The person who evaluates your work, approves time off, and conducts your performance review</li>
<li><strong>Who is the DON?</strong> — The clinical authority you escalate patient safety concerns to</li>
<li><strong>Who is the Administrator?</strong> — The operational leader of the agency</li>
<li><strong>Who is the Compliance Officer?</strong> — The person you report compliance concerns, fraud, waste, or abuse to</li>
<li><strong>What is the compliance hotline number?</strong> — For anonymous reporting (CO-CP-006)</li>
</ol>
</div>
<p>CMS surveyors <strong>will ask you these questions</strong>. Not knowing your supervisor or compliance reporting chain is a deficiency finding.</p>`,
        narration: "Regardless of your role, you must know five things on Day 1: Who is your direct supervisor, who evaluates your work and approves time off. Who is the DON, the clinical authority for patient safety concerns. Who is the Administrator, the operational leader. Who is the Compliance Officer for reporting compliance concerns. And what is the compliance hotline number for anonymous reporting. CMS surveyors will ask you these questions directly. Not knowing the answers is a deficiency finding.",
      },
      {
        title: "Communication Pathways",
        content: `<h2>Communication Channels</h2>
<h3>Clinical Issues — Escalation Path:</h3>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:12px 0;">
You → Your Supervisor → DON → Administrator → Governing Body
</div>
<h3>Compliance Concerns:</h3>
<div style="background:#FFF3E0;padding:16px;border-radius:8px;margin:12px 0;">
You → Compliance Officer (CO-CP-006)<br/>
<em>OR</em> Anonymous Compliance Hotline<br/>
<em>OR</em> Direct to Administrator if Compliance Officer is involved
</div>
<h3>Workplace Issues (Harassment, Safety, Grievances):</h3>
<div style="background:#F3E5F5;padding:16px;border-radius:8px;margin:12px 0;">
You → Supervisor → HR Director → Administrator<br/>
<em>OR</em> HR directly if supervisor is the issue (HR-ER-003)
</div>
<p><strong>Never bypass the chain for routine matters.</strong> But <strong>always bypass the chain for patient safety emergencies or compliance violations</strong> — go directly to the highest level needed.</p>`,
        narration: "There are specific communication channels depending on the type of issue. For clinical issues, escalate through your supervisor to the DON, then Administrator, then Governing Body. For compliance concerns, report to the Compliance Officer or use the anonymous compliance hotline, or go directly to the Administrator if the Compliance Officer is involved. For workplace issues like harassment or grievances, go through your supervisor to the HR Director. Important rule: never bypass the chain for routine matters, but always bypass it for patient safety emergencies or compliance violations.",
      },
      {
        title: "Module Summary",
        content: `<h2>Module Summary — GAO-002</h2>
<div style="background:#E0F7FA;padding:16px;border-radius:8px;">
<h3>Key Takeaways:</h3>
<ul>
<li>CMS requires a clear organizational structure (42 CFR § 484.105)</li>
<li><strong>Governing Body</strong> → appoints Administrator, ultimate accountability</li>
<li><strong>Administrator</strong> → day-to-day operations, not direct patient care</li>
<li><strong>DON</strong> → all patient care services, must be an RN</li>
<li>Each clinical position has a defined CMS basis and reporting chain</li>
<li>Assistants (PTA, COTA) cannot practice without direct therapist supervision</li>
<li>Know your supervisor, DON, Administrator, Compliance Officer, and hotline</li>
<li>Bypass the chain for patient safety and compliance emergencies</li>
</ul>
</div>`,
        narration: "To summarize: CMS requires a clear organizational structure. The Governing Body holds ultimate accountability and appoints the Administrator. The Administrator oversees day-to-day operations. The DON, who must be an RN, is responsible for all patient care. Each clinical position has a defined CMS basis and reporting chain. Assistants cannot practice without direct supervision. You must know your supervisor, DON, Administrator, Compliance Officer, and the compliance hotline. And always bypass the chain for patient safety emergencies.",
      },
    ],
    exam: [
      {
        id: "GAO002-Q1",
        stem: "Per 42 CFR § 484.105(a), who holds full legal authority and responsibility for a home health agency's operation?",
        options: ["The Administrator", "The Director of Nursing", "The Governing Body", "The Compliance Officer"],
        correctIndex: 2,
        rationale: "The Governing Body assumes full legal authority and responsibility per § 484.105(a).",
        regulatoryRef: "42 CFR § 484.105(a)",
      },
      {
        id: "GAO002-Q2",
        stem: "The Director of Nursing must hold which credential?",
        options: ["Master's in Healthcare Administration", "Registered Nurse license", "Licensed Vocational Nurse license", "Social Work degree"],
        correctIndex: 1,
        rationale: "Per § 484.105(c), the DON/Clinical Manager must be a registered nurse.",
        regulatoryRef: "42 CFR § 484.105(c)",
      },
      {
        id: "GAO002-Q3",
        stem: "A PTA can practice independently once they complete their orientation training.",
        options: ["True — after orientation they are fully independent", "False — PTAs must work under PT direct supervision at all times", "True — if the DON approves", "False — but only for the first 90 days"],
        correctIndex: 1,
        rationale: "PTAs work under direct supervision of a PT per § 484.115(e). This is permanent, not time-limited.",
        regulatoryRef: "42 CFR § 484.115(e)",
      },
      {
        id: "GAO002-Q4",
        stem: "If you have a compliance concern about potential fraud, what is your PRIMARY reporting channel?",
        options: ["Your direct supervisor", "The Compliance Officer or anonymous hotline", "The patient's physician", "The state licensing board"],
        correctIndex: 1,
        rationale: "Compliance concerns go to the Compliance Officer or anonymous hotline per CO-CP-006.",
      },
      {
        id: "GAO002-Q5",
        stem: "When should you bypass the normal chain of command?",
        options: ["When you disagree with your supervisor's schedule", "For patient safety emergencies or compliance violations", "When your supervisor is unavailable for routine questions", "Never — always follow the chain exactly"],
        correctIndex: 1,
        rationale: "Always bypass the chain for patient safety emergencies or compliance violations — go directly to the highest level needed.",
      },
    ],
    passScore: 80,
  },

  // ═══════════════════════════════════════════════════════════════
  // GAO-003: Scope of Services
  // ═══════════════════════════════════════════════════════════════
  {
    id: "GAO-003",
    title: "Scope of Services",
    track: "GAO",
    durationMinutes: 30,
    policyMapped: ["GV-OG-003"],
    pages: [
      {
        title: "What Home Health Care Is",
        content: `<h2>Scope of Services — What We Do</h2>
<p><strong>Home health care</strong> is the provision of skilled medical services in a patient's home, ordered by a physician, and covered under Medicare Part A when specific eligibility criteria are met.</p>
<div style="background:#E0F7FA;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Medicare Home Health Eligibility (42 CFR § 484.55):</h3>
<ol>
<li>Patient is <strong>homebound</strong> (confined to home due to condition)</li>
<li>Patient needs <strong>skilled services</strong> (nursing, PT, OT, SLP)</li>
<li>Services are <strong>physician-ordered</strong> with a plan of care</li>
<li>Services are <strong>intermittent</strong> (not 24/7 care)</li>
<li>Patient is under a <strong>face-to-face encounter</strong> requirement</li>
</ol>
</div>
<p>Understanding scope prevents two critical errors: providing services we're <strong>not authorized</strong> to provide, or <strong>failing to provide</strong> services the patient is entitled to.</p>`,
        narration: "Home health care is the provision of skilled medical services in a patient's home, ordered by a physician, and covered under Medicare Part A. To qualify, the patient must be homebound, need skilled services such as nursing or therapy, have physician orders with a plan of care, need intermittent rather than 24/7 care, and meet the face-to-face encounter requirement. Understanding our scope prevents two critical errors: providing unauthorized services, or failing to provide services the patient is entitled to.",
      },
      {
        title: "Services We Provide",
        content: `<h2>Care Indeed Service Lines</h2>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
<tr style="background:#0D4F4F;color:white;"><th style="padding:10px;">Service</th><th style="padding:10px;">Provided By</th><th style="padding:10px;">CMS Basis</th></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">Skilled Nursing</td><td style="padding:10px;">RN, LVN</td><td style="padding:10px;">§ 484.115(a)(c)</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">Physical Therapy</td><td style="padding:10px;">PT, PTA</td><td style="padding:10px;">§ 484.115(d)(e)</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">Occupational Therapy</td><td style="padding:10px;">OT, COTA</td><td style="padding:10px;">§ 484.115(f)(g)</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">Speech-Language Pathology</td><td style="padding:10px;">SLP</td><td style="padding:10px;">§ 484.115(h)</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">Medical Social Services</td><td style="padding:10px;">MSW</td><td style="padding:10px;">§ 484.115(i)</td></tr>
<tr><td style="padding:10px;">Home Health Aide Services</td><td style="padding:10px;">HHA</td><td style="padding:10px;">§ 484.80</td></tr>
</table>
<p>Each service must be <strong>ordered by a physician</strong> as part of a comprehensive plan of care, and the clinician providing it must meet the <strong>personnel qualifications</strong> defined in the CMS Conditions of Participation.</p>`,
        narration: "Care Indeed provides six categories of service: Skilled Nursing by RNs and LVNs, Physical Therapy by PTs and PTAs, Occupational Therapy by OTs and COTAs, Speech-Language Pathology by SLPs, Medical Social Services by MSWs, and Home Health Aide services by HHAs. Each service must be physician-ordered as part of a comprehensive plan of care, and the clinician providing it must meet personnel qualifications under the CMS Conditions of Participation.",
      },
      {
        title: "Scope Boundaries",
        content: `<h2>What We Do NOT Provide</h2>
<div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #EF4444;">
<h3>⚠️ Out of Scope — Do Not Provide:</h3>
<ul>
<li><strong>24-hour / continuous care</strong> (we provide intermittent skilled visits)</li>
<li><strong>Custodial care only</strong> (must have a skilled need to qualify)</li>
<li><strong>Physician services</strong> (we execute physician orders, we don't write them)</li>
<li><strong>Durable medical equipment (DME)</strong> dispensing (we may coordinate but don't supply)</li>
<li><strong>Services outside our licensed scope</strong> per California state law</li>
<li><strong>Services not on the physician's plan of care</strong></li>
</ul>
</div>
<p><strong>Why this matters:</strong> Providing out-of-scope services can result in Medicare fraud allegations, survey deficiencies, licensure sanctions, and patient harm.</p>`,
        narration: "It is equally important to understand what we do not provide. We do not provide 24-hour continuous care — only intermittent skilled visits. We do not provide custodial-only care without a skilled need. We do not provide physician services. We do not dispense durable medical equipment. We do not provide services outside our California license scope, and we never provide services not on the physician's plan of care. Providing out-of-scope services can result in Medicare fraud allegations, survey deficiencies, and patient harm.",
      },
      {
        title: "The Interdisciplinary Team",
        content: `<h2>Working as an Interdisciplinary Team</h2>
<p>Home health is <strong>not siloed</strong>. A single patient may receive visits from an RN, PT, OT, SLP, MSW, and HHA — all coordinated through the <strong>plan of care</strong>.</p>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Coordination Requirements:</h3>
<ul>
<li>All disciplines must <strong>communicate findings</strong> that affect other disciplines</li>
<li>The <strong>plan of care</strong> is the central coordination document</li>
<li>The <strong>RN</strong> coordinates overall patient care</li>
<li>The <strong>DON</strong> oversees the entire clinical team</li>
<li><strong>Case conferences</strong> ensure team alignment</li>
</ul>
</div>
<p>Example: If the PT notes the patient has difficulty swallowing during exercises, the PT must communicate this to the RN, who may request an SLP referral. This is interdisciplinary coordination in action.</p>`,
        narration: "Home health is an interdisciplinary effort. A single patient may receive visits from multiple disciplines, all coordinated through the plan of care. All disciplines must communicate findings that affect other disciplines. The plan of care is the central coordination document. The RN coordinates overall patient care, the DON oversees the clinical team, and case conferences ensure alignment. For example, if a PT notices a patient has difficulty swallowing during exercises, the PT must communicate this to the RN, who may request an SLP referral.",
      },
      {
        title: "Module Summary",
        content: `<h2>Module Summary — GAO-003</h2>
<div style="background:#E0F7FA;padding:16px;border-radius:8px;">
<h3>Key Takeaways:</h3>
<ul>
<li>Home health = skilled, intermittent, physician-ordered services in the patient's home</li>
<li>Five Medicare eligibility criteria: homebound, skilled need, physician order, intermittent, face-to-face</li>
<li>Six service lines: Nursing, PT, OT, SLP, MSW, HHA</li>
<li>Out-of-scope services = fraud risk, deficiency, patient harm</li>
<li>Interdisciplinary coordination through the plan of care is required</li>
</ul>
</div>`,
        narration: "To summarize: Home health is skilled, intermittent, physician-ordered services in the patient's home. Five eligibility criteria must be met. We provide six service lines. Providing out-of-scope services creates fraud risk. And interdisciplinary coordination through the plan of care is a CMS requirement.",
      },
    ],
    exam: [
      {
        id: "GAO003-Q1",
        stem: "Which of the following is NOT a Medicare home health eligibility criterion?",
        options: ["Patient is homebound", "Services are physician-ordered", "Patient requires 24-hour continuous care", "Patient needs skilled services"],
        correctIndex: 2,
        rationale: "Medicare home health requires INTERMITTENT services, not 24-hour continuous care.",
      },
      {
        id: "GAO003-Q2",
        stem: "A patient's family asks you to help with tasks not on the plan of care. What should you do?",
        options: ["Help them since you're already there", "Politely decline and explain you can only provide services ordered on the plan of care", "Do the tasks but don't document them", "Ask the family to pay out-of-pocket for the extra services"],
        correctIndex: 1,
        rationale: "Services must be on the physician's plan of care. Providing unrequested/unordered services is out of scope.",
      },
      {
        id: "GAO003-Q3",
        stem: "Which document serves as the central coordination tool for the interdisciplinary team?",
        options: ["The employee handbook", "The OASIS assessment", "The plan of care", "The discharge summary"],
        correctIndex: 2,
        rationale: "The plan of care is the central coordination document for all disciplines serving the patient.",
      },
      {
        id: "GAO003-Q4",
        stem: "Care Indeed provides which of the following?",
        options: ["24-hour live-in care", "Intermittent skilled home health services", "Physician diagnostic services", "Durable medical equipment dispensing"],
        correctIndex: 1,
        rationale: "Care Indeed provides intermittent skilled home health services per 42 CFR Part 484.",
      },
      {
        id: "GAO003-Q5",
        stem: "If a PT notices a patient has swallowing difficulty during therapy, what should the PT do?",
        options: ["Document it and wait for the next case conference", "Communicate immediately to the RN for possible SLP referral", "Attempt to assess the swallowing themselves", "Ignore it since swallowing is outside PT scope"],
        correctIndex: 1,
        rationale: "Interdisciplinary coordination requires immediate communication of findings affecting other disciplines.",
      },
    ],
    passScore: 80,
  },

  // ═══════════════════════════════════════════════════════════════
  // GAO-004: Corporate Compliance Program
  // ═══════════════════════════════════════════════════════════════
  {
    id: "GAO-004",
    title: "Corporate Compliance Program",
    track: "GAO",
    durationMinutes: 35,
    policyMapped: ["CO-CP-001", "CO-CP-004"],
    pages: [
      {
        title: "Why Compliance Matters",
        content: `<h2>Corporate Compliance Program</h2>
<p>Care Indeed maintains a <strong>Corporate Compliance Program</strong> per CO-CP-001 to prevent, detect, and correct violations of federal and state laws, regulations, and internal policies.</p>
<div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #EF4444;">
<strong>The stakes are real:</strong>
<ul>
<li>Medicare/Medicaid fraud = federal criminal penalties</li>
<li>False Claims Act violations = treble damages + $11,000+ per claim</li>
<li>Exclusion from federal healthcare programs = agency closure</li>
<li>Individual employees can be personally liable</li>
</ul>
</div>
<p>This is not theoretical. The OIG recovers <strong>billions of dollars annually</strong> from healthcare fraud cases, and individuals go to prison.</p>`,
        narration: "Care Indeed maintains a Corporate Compliance Program under policy CO-CP-001 to prevent, detect, and correct violations of federal and state laws. The stakes are real. Medicare and Medicaid fraud carries federal criminal penalties. False Claims Act violations mean treble damages plus over $11,000 per claim. Exclusion from federal programs can shut down an agency. And individual employees can be personally liable. The OIG recovers billions annually from healthcare fraud, and individuals go to prison.",
      },
      {
        title: "Seven Elements of Compliance",
        content: `<h2>OIG Seven Elements of an Effective Compliance Program</h2>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
<tr style="background:#0D4F4F;color:white;"><th style="padding:10px;">#</th><th style="padding:10px;">Element</th><th style="padding:10px;">Care Indeed Implementation</th></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">1</td><td style="padding:10px;">Written policies & procedures</td><td style="padding:10px;">CO-CP-001 + entire policy framework</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">2</td><td style="padding:10px;">Compliance Officer & Committee</td><td style="padding:10px;">CO-CP-002 — designated CO</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">3</td><td style="padding:10px;">Training & education</td><td style="padding:10px;">This orientation + annual training</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">4</td><td style="padding:10px;">Communication (hotline)</td><td style="padding:10px;">CO-CP-006 — anonymous reporting</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">5</td><td style="padding:10px;">Auditing & monitoring</td><td style="padding:10px;">CO-CP-004 — internal auditing</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">6</td><td style="padding:10px;">Enforcement & discipline</td><td style="padding:10px;">HR-ER-002 — consistent discipline</td></tr>
<tr><td style="padding:10px;">7</td><td style="padding:10px;">Response & corrective action</td><td style="padding:10px;">CO-CP-001 § 6.7 — investigation & remediation</td></tr>
</table>`,
        narration: "The OIG defines seven elements of an effective compliance program. First, written policies and procedures — our entire policy framework. Second, a designated Compliance Officer and Committee. Third, training and education — this orientation and annual training. Fourth, a communication channel including an anonymous hotline. Fifth, auditing and monitoring through internal audits. Sixth, enforcement and consistent discipline. And seventh, response and corrective action including investigation and remediation.",
      },
      {
        title: "Your Compliance Obligations",
        content: `<h2>Every Employee's Compliance Obligations</h2>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;">
<h3>You MUST:</h3>
<ul>
<li>Follow all federal, state, and agency policies</li>
<li>Document accurately and truthfully — never falsify records</li>
<li>Bill only for services actually provided</li>
<li>Report suspected fraud, waste, or abuse immediately</li>
<li>Cooperate with compliance investigations</li>
<li>Complete all required compliance training</li>
<li>Sign the Code of Conduct acknowledgment annually</li>
</ul>
</div>
<div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;">
<h3>You MUST NOT:</h3>
<ul>
<li>Submit false claims or documentation</li>
<li>Accept kickbacks or illegal remuneration</li>
<li>Refer patients based on financial arrangements (Stark/Anti-Kickback)</li>
<li>Retaliate against anyone who reports a compliance concern</li>
<li>Ignore suspected violations — silence is complicity</li>
</ul>
</div>`,
        narration: "Every employee has compliance obligations. You must follow all policies, document accurately, bill only for services provided, report suspected fraud waste or abuse, cooperate with investigations, complete compliance training, and sign the Code of Conduct annually. You must not submit false claims, accept kickbacks, refer based on financial arrangements, retaliate against reporters, or ignore suspected violations. Silence is complicity.",
      },
      {
        title: "Fraud, Waste, and Abuse",
        content: `<h2>Understanding Fraud, Waste & Abuse</h2>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
<tr style="background:#0D4F4F;color:white;"><th style="padding:10px;">Type</th><th style="padding:10px;">Definition</th><th style="padding:10px;">Example</th></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;"><strong>Fraud</strong></td><td style="padding:10px;">Intentional deception for unauthorized benefit</td><td style="padding:10px;">Billing for visits not made; falsifying OASIS to get higher reimbursement</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;"><strong>Waste</strong></td><td style="padding:10px;">Overutilization of services not caused by fraud</td><td style="padding:10px;">Continuing visits after goals are met; excessive supply orders</td></tr>
<tr><td style="padding:10px;"><strong>Abuse</strong></td><td style="padding:10px;">Practices inconsistent with sound fiscal/medical practices</td><td style="padding:10px;">Billing for a higher level of service than provided (upcoding)</td></tr>
</table>
<div style="background:#FFF3E0;padding:16px;border-radius:8px;margin:16px 0;">
<strong>Key Laws:</strong>
<ul>
<li><strong>False Claims Act (31 USC § 3729):</strong> Civil liability for submitting false claims</li>
<li><strong>Anti-Kickback Statute (42 USC § 1320a-7b):</strong> Criminal penalty for payments to induce referrals</li>
<li><strong>Stark Law (42 USC § 1395nn):</strong> Prohibits self-referrals to entities with financial relationships</li>
</ul>
</div>`,
        narration: "You must understand the differences between fraud, waste, and abuse. Fraud is intentional deception for unauthorized benefit — like billing for visits not made. Waste is overutilization not caused by fraud — like continuing visits after goals are met. Abuse is practices inconsistent with sound fiscal or medical standards — like upcoding. Key laws include the False Claims Act for civil liability, the Anti-Kickback Statute for criminal penalties related to referral payments, and the Stark Law prohibiting self-referrals with financial relationships.",
      },
      {
        title: "Reporting & Protections",
        content: `<h2>How to Report — And You ARE Protected</h2>
<div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Reporting Channels (CO-CP-006):</h3>
<ol>
<li>Your direct supervisor</li>
<li>The Compliance Officer</li>
<li>The anonymous compliance hotline</li>
<li>The Administrator</li>
<li>External: OIG Hotline (1-800-HHS-TIPS) or state agencies</li>
</ol>
</div>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #10B981;">
<h3>Whistleblower Protection (CO-CP-005):</h3>
<p><strong>No retaliation — period.</strong> Federal and California state law protect employees who report compliance concerns in good faith. Retaliation against a reporter is itself a terminable offense and a potential federal violation.</p>
</div>
<p><strong>When in doubt, report.</strong> It is always better to report a concern that turns out to be unfounded than to stay silent about actual fraud.</p>`,
        narration: "You have multiple channels to report compliance concerns: your supervisor, the Compliance Officer, the anonymous hotline, the Administrator, or external channels like the OIG Hotline. And you are protected. Per policy CO-CP-005 and federal and California state law, there is no retaliation for good-faith reporting. Retaliation against a reporter is itself a terminable offense. When in doubt, report. It is always better to report a concern that turns out to be nothing than to stay silent about actual fraud.",
      },
      {
        title: "Module Summary",
        content: `<h2>Module Summary — GAO-004</h2>
<div style="background:#E0F7FA;padding:16px;border-radius:8px;">
<h3>Key Takeaways:</h3>
<ul>
<li>The compliance program has 7 OIG elements, all implemented at Care Indeed</li>
<li>You are <strong>personally obligated</strong> to follow laws, document truthfully, and report violations</li>
<li>Fraud = intentional deception; Waste = overutilization; Abuse = unsound practices</li>
<li>False Claims Act, Anti-Kickback, and Stark Law carry severe penalties</li>
<li>Report through supervisor, Compliance Officer, hotline, or external agencies</li>
<li>Whistleblower protection is absolute — no retaliation</li>
</ul>
</div>`,
        narration: "In summary: Our compliance program implements all seven OIG elements. You are personally obligated to follow laws, document truthfully, and report violations. Understand the differences between fraud, waste, and abuse. Know the key laws — False Claims Act, Anti-Kickback, Stark. Use the reporting channels available to you. And remember: whistleblower protection is absolute.",
      },
    ],
    exam: [
      {
        id: "GAO004-Q1",
        stem: "Billing for home health visits that were never actually made is an example of:",
        options: ["Waste", "Abuse", "Fraud", "An administrative error"],
        correctIndex: 2,
        rationale: "Billing for services not provided is intentional deception for unauthorized benefit — the definition of fraud.",
      },
      {
        id: "GAO004-Q2",
        stem: "How many elements does the OIG identify for an effective compliance program?",
        options: ["5", "7", "10", "12"],
        correctIndex: 1,
        rationale: "The OIG identifies seven elements of an effective compliance program.",
      },
      {
        id: "GAO004-Q3",
        stem: "An employee reports suspected fraud to the compliance hotline. Their supervisor retaliates by reducing their hours. This is:",
        options: ["Acceptable if the report was unfounded", "A violation of whistleblower protection — a terminable offense", "The supervisor's discretion", "Only a problem if the employee can prove the fraud"],
        correctIndex: 1,
        rationale: "Retaliation against good-faith reporters violates CO-CP-005 and federal/state whistleblower laws.",
      },
      {
        id: "GAO004-Q4",
        stem: "The Anti-Kickback Statute prohibits:",
        options: ["Providing skilled nursing in the home", "Payments to induce patient referrals", "Hiring employees without a background check", "Failing to complete annual training"],
        correctIndex: 1,
        rationale: "The Anti-Kickback Statute (42 USC § 1320a-7b) criminalizes payments to induce referrals.",
      },
      {
        id: "GAO004-Q5",
        stem: "If you suspect a compliance violation but aren't sure, you should:",
        options: ["Wait until you have concrete proof before reporting", "Report the concern — it's better to report and be wrong than stay silent", "Investigate on your own first", "Discuss it with coworkers to get their opinion"],
        correctIndex: 1,
        rationale: "When in doubt, report. Good-faith reports are protected even if the concern is ultimately unfounded.",
      },
    ],
    passScore: 80,
  },

  // ═══════════════════════════════════════════════════════════════
  // GAO-005: Compliance Hotline & Reporting
  // ═══════════════════════════════════════════════════════════════
  {
    id: "GAO-005",
    title: "Compliance Hotline & Reporting",
    track: "GAO",
    durationMinutes: 30,
    policyMapped: ["CO-CP-006"],
    pages: [
      {
        title: "The Compliance Hotline",
        content: `<h2>Compliance Hotline & Reporting Mechanisms</h2>
<p>Care Indeed maintains a <strong>confidential compliance hotline</strong> (CO-CP-006) as one of the OIG's seven required elements. This module ensures you know <strong>how, when, and to whom</strong> to report concerns.</p>
<div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #2563EB;">
<h3>📞 Compliance Hotline</h3>
<p>Available 24/7 — anonymous reporting accepted.<br/>Reports go directly to the Compliance Officer.<br/>If the Compliance Officer is the subject, reports go to the Administrator or Governing Body.</p>
</div>
<p>The hotline exists because CMS and the OIG recognize that employees are often the <strong>first to see</strong> fraud, waste, abuse, safety hazards, and policy violations.</p>`,
        narration: "Care Indeed maintains a confidential compliance hotline per policy CO-CP-006. This module ensures you know how, when, and to whom to report concerns. The hotline is available 24/7 and accepts anonymous reports. Reports go to the Compliance Officer, or to the Administrator and Governing Body if the Compliance Officer is the subject. The hotline exists because employees are often the first to see fraud, waste, abuse, and policy violations.",
      },
      {
        title: "What to Report",
        content: `<h2>What Should Be Reported?</h2>
<div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Report ALL of the following:</h3>
<ul>
<li>Suspected billing fraud or false documentation</li>
<li>Patient abuse, neglect, or exploitation</li>
<li>HIPAA privacy or security violations</li>
<li>Safety hazards that could harm patients or staff</li>
<li>Employees working without proper credentials</li>
<li>Kickback or improper referral arrangements</li>
<li>Retaliation against someone who filed a report</li>
<li>Any violation of federal, state, or agency policy</li>
</ul>
</div>
<p><strong>You do not need to prove the violation.</strong> You only need a <strong>good-faith belief</strong> that something may be wrong. The Compliance Officer investigates — that's their job, not yours.</p>`,
        narration: "You should report all of the following: suspected billing fraud or false documentation, patient abuse neglect or exploitation, HIPAA violations, safety hazards, employees working without credentials, kickback arrangements, retaliation against reporters, and any violation of policy. You do not need to prove the violation. You only need a good-faith belief that something may be wrong. The Compliance Officer investigates — that is their job, not yours.",
      },
      {
        title: "How to Make a Report",
        content: `<h2>Making a Report — Step by Step</h2>
<div style="display:grid;gap:12px;margin:16px 0;">
<div style="background:#E8F5E9;padding:16px;border-radius:8px;">
<strong>Step 1:</strong> Gather basic facts — who, what, when, where (do NOT investigate yourself)
</div>
<div style="background:#E3F2FD;padding:16px;border-radius:8px;">
<strong>Step 2:</strong> Choose your reporting channel — supervisor, Compliance Officer, hotline, or external
</div>
<div style="background:#FFF3E0;padding:16px;border-radius:8px;">
<strong>Step 3:</strong> Provide as much detail as you can — specific dates, names, actions observed
</div>
<div style="background:#F3E5F5;padding:16px;border-radius:8px;">
<strong>Step 4:</strong> Keep a personal copy of what you reported and when (for your protection)
</div>
<div style="background:#ECEFF1;padding:16px;border-radius:8px;">
<strong>Step 5:</strong> Do NOT discuss your report with coworkers — confidentiality protects the investigation
</div>
</div>`,
        narration: "When making a report, follow five steps. First, gather basic facts — who, what, when, where — but do not investigate yourself. Second, choose your reporting channel. Third, provide as much detail as you can including dates, names, and actions observed. Fourth, keep a personal copy of what you reported for your protection. And fifth, do not discuss your report with coworkers — confidentiality protects the investigation.",
      },
      {
        title: "Investigation Process",
        content: `<h2>What Happens After You Report</h2>
<ol style="line-height:2;">
<li>Compliance Officer receives and logs the report</li>
<li>Initial assessment — is this a compliance, HR, or clinical issue?</li>
<li>Investigation begins within <strong>5 business days</strong></li>
<li>Interviews, document reviews, and evidence gathering</li>
<li>Findings and corrective action plan developed</li>
<li>Reporter is notified that their concern was addressed (without disclosing specifics of discipline)</li>
<li>Systemic issues are routed to QAPI for process improvement</li>
</ol>
<div style="background:#E8F5E9;padding:12px;border-radius:8px;margin:16px 0;">
<strong>Timeline:</strong> Most investigations are completed within 30 days. Complex cases may take up to 60 days with periodic updates to the reporter.
</div>`,
        narration: "After you report, the Compliance Officer receives and logs the report, assesses whether it is a compliance, HR, or clinical issue, and begins investigation within five business days. This includes interviews, document reviews, and evidence gathering. Findings and corrective actions are developed. You will be notified that your concern was addressed without disclosing discipline specifics. Systemic issues go to QAPI. Most investigations complete within 30 days, or 60 for complex cases.",
      },
      {
        title: "Module Summary",
        content: `<h2>Module Summary — GAO-005</h2>
<div style="background:#E0F7FA;padding:16px;border-radius:8px;">
<h3>Key Takeaways:</h3>
<ul>
<li>The compliance hotline is available 24/7 and accepts anonymous reports</li>
<li>Report any suspected violation — you don't need proof, just good-faith belief</li>
<li>Do NOT investigate yourself — gather basic facts and report</li>
<li>Keep your report confidential — don't discuss with coworkers</li>
<li>Whistleblower protections are absolute per CO-CP-005</li>
<li>Investigations begin within 5 business days, complete within 30-60 days</li>
</ul>
</div>`,
        narration: "In summary: The compliance hotline is 24/7 with anonymous options. Report any suspected violation based on good-faith belief. Do not investigate yourself. Keep reports confidential. Whistleblower protections are absolute. Investigations begin within 5 business days and complete within 30 to 60 days.",
      },
    ],
    exam: [
      {
        id: "GAO005-Q1",
        stem: "The compliance hotline accepts reports:",
        options: ["Only during business hours", "Only from management", "24/7 including anonymous reports", "Only with written documentation"],
        correctIndex: 2,
        rationale: "Per CO-CP-006, the hotline is available 24/7 and accepts anonymous reports.",
      },
      {
        id: "GAO005-Q2",
        stem: "Before reporting a suspected violation, you must:",
        options: ["Prove the violation occurred", "Gather basic facts (who, what, when, where) without investigating", "Get your supervisor's approval to report", "Confront the person directly"],
        correctIndex: 1,
        rationale: "Gather basic facts but do NOT investigate yourself. You don't need proof — just good-faith belief.",
      },
      {
        id: "GAO005-Q3",
        stem: "After filing a compliance report, you should:",
        options: ["Discuss it with trusted coworkers for support", "Keep it confidential and not discuss with coworkers", "Post about it on social media", "Conduct your own follow-up investigation"],
        correctIndex: 1,
        rationale: "Confidentiality protects the investigation and all parties involved.",
      },
      {
        id: "GAO005-Q4",
        stem: "If the Compliance Officer is the subject of a report, who should receive the report?",
        options: ["Another coworker", "The Administrator or Governing Body", "No one — the system can't handle this", "An external law firm only"],
        correctIndex: 1,
        rationale: "If the Compliance Officer is the subject, reports go to the Administrator or Governing Body.",
      },
      {
        id: "GAO005-Q5",
        stem: "How quickly does the investigation process typically begin after a report?",
        options: ["Immediately same day", "Within 5 business days", "Within 30 calendar days", "At the next quarterly review"],
        correctIndex: 1,
        rationale: "Investigations begin within 5 business days of receiving the report.",
      },
    ],
    passScore: 80,
  },

  // ═══════════════════════════════════════════════════════════════
  // GAO-006: Whistleblower Protection
  // ═══════════════════════════════════════════════════════════════
  {
    id: "GAO-006",
    title: "Whistleblower Protection",
    track: "GAO",
    durationMinutes: 30,
    policyMapped: ["CO-CP-005"],
    pages: [
      {
        title: "Your Right to Report Without Fear",
        content: `<h2>Whistleblower Protection — CO-CP-005</h2>
<p>Care Indeed has a <strong>zero-tolerance policy for retaliation</strong> against any employee who reports a compliance concern, patient safety issue, or policy violation in good faith.</p>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #10B981;">
<h3>Federal Protections:</h3>
<ul>
<li><strong>False Claims Act (31 USC § 3730(h)):</strong> Protects employees who report Medicare/Medicaid fraud</li>
<li><strong>SOX Act § 806:</strong> Protects against retaliation in corporate fraud cases</li>
</ul>
<h3>California State Protections:</h3>
<ul>
<li><strong>Labor Code § 1102.5:</strong> Protects employees reporting violations to government agencies</li>
<li><strong>Health & Safety Code § 1278.5:</strong> Protects healthcare workers reporting unsafe conditions</li>
</ul>
</div>
<p>These protections apply whether the report is made internally (to a supervisor or hotline) or externally (to the OIG, CMS, or state agencies).</p>`,
        narration: "Care Indeed has zero tolerance for retaliation against employees who report concerns in good faith. Federal protections include the False Claims Act, which protects employees reporting Medicare and Medicaid fraud, and the Sarbanes-Oxley Act. California protections include Labor Code Section 1102.5 protecting reports to government agencies, and Health and Safety Code Section 1278.5 protecting healthcare workers reporting unsafe conditions. These protections apply whether you report internally or externally.",
      },
      {
        title: "What Retaliation Looks Like",
        content: `<h2>Recognizing Retaliation</h2>
<p>Retaliation can be obvious or subtle. All forms are <strong>prohibited and actionable</strong>:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
<tr style="background:#0D4F4F;color:white;"><th style="padding:10px;">Overt Retaliation</th><th style="padding:10px;">Subtle Retaliation</th></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">Termination</td><td style="padding:10px;">Reduced hours or unfavorable schedule changes</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">Demotion</td><td style="padding:10px;">Exclusion from meetings or team activities</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">Pay reduction</td><td style="padding:10px;">Excessive scrutiny of work not applied to others</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">Written warnings without basis</td><td style="padding:10px;">Hostile work environment created by supervisor</td></tr>
<tr><td style="padding:10px;">Transfer to undesirable assignments</td><td style="padding:10px;">Negative performance review timed after report</td></tr>
</table>
<p><strong>If you experience any of these after making a report, report the retaliation immediately</strong> using the same channels.</p>`,
        narration: "Retaliation can be overt or subtle, and all forms are prohibited. Overt retaliation includes termination, demotion, pay reduction, baseless written warnings, or undesirable transfers. Subtle retaliation includes reduced hours, exclusion from meetings, excessive scrutiny, hostile environment, or negative reviews timed after a report. If you experience any of these after making a report, report the retaliation immediately using the same compliance channels.",
      },
      {
        title: "Good Faith Standard",
        content: `<h2>The Good Faith Standard</h2>
<p>Whistleblower protection applies to reports made in <strong>good faith</strong> — meaning you have a <strong>genuine, reasonable belief</strong> that a violation occurred or may be occurring.</p>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;">
<h3>✅ Protected:</h3>
<ul>
<li>You report billing concerns because patterns look suspicious — even if investigation finds no fraud</li>
<li>You report a safety hazard you observed — even if it's resolved quickly</li>
<li>You report a colleague's behavior that appears to violate policy</li>
</ul>
</div>
<div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;">
<h3>❌ NOT Protected:</h3>
<ul>
<li>Filing a knowingly false report to harm a coworker</li>
<li>Making a report as leverage in a personal dispute</li>
<li>Fabricating evidence to support a baseless claim</li>
</ul>
</div>`,
        narration: "Whistleblower protection applies to good-faith reports — meaning you have a genuine, reasonable belief that a violation occurred or may be occurring. You are protected when you report suspicious billing patterns even if no fraud is found, when you report safety hazards even if quickly resolved, or when you report colleague behavior that appears to violate policy. You are NOT protected if you file a knowingly false report to harm a coworker, use reporting as leverage in a personal dispute, or fabricate evidence.",
      },
      {
        title: "Module Summary",
        content: `<h2>Module Summary — GAO-006</h2>
<div style="background:#E0F7FA;padding:16px;border-radius:8px;">
<h3>Key Takeaways:</h3>
<ul>
<li>Zero tolerance for retaliation — federal and California state law protections</li>
<li>Retaliation includes both overt (termination, demotion) and subtle (schedule changes, exclusion) forms</li>
<li>Good faith = genuine, reasonable belief a violation occurred</li>
<li>False reports made to harm others are NOT protected</li>
<li>Report retaliation immediately through the same compliance channels</li>
</ul>
</div>`,
        narration: "In summary: Care Indeed has zero tolerance for retaliation, backed by federal and California law. Retaliation can be overt or subtle. Good faith means a genuine reasonable belief. False reports made to harm others are not protected. If you experience retaliation, report it immediately through the same compliance channels.",
      },
    ],
    exam: [
      {
        id: "GAO006-Q1",
        stem: "Which law specifically protects employees who report Medicare/Medicaid fraud?",
        options: ["HIPAA", "False Claims Act (31 USC § 3730(h))", "ADA", "OSHA General Duty Clause"],
        correctIndex: 1,
        rationale: "The False Claims Act § 3730(h) specifically protects whistleblowers reporting Medicare/Medicaid fraud.",
      },
      {
        id: "GAO006-Q2",
        stem: "An employee's hours are reduced two weeks after they reported a billing concern. This is:",
        options: ["Coincidence — schedule changes happen", "Potential retaliation that should be reported immediately", "Acceptable if the manager has a legitimate reason", "Only retaliation if the employee can prove intent"],
        correctIndex: 1,
        rationale: "Reduced hours after a compliance report is a form of potential retaliation that must be reported and investigated.",
      },
      {
        id: "GAO006-Q3",
        stem: "Whistleblower protection requires that reports be made in:",
        options: ["Writing only", "Good faith with genuine belief", "Anonymously only", "Within 24 hours of the incident"],
        correctIndex: 1,
        rationale: "Protection applies to good-faith reports — genuine, reasonable belief that a violation occurred.",
      },
      {
        id: "GAO006-Q4",
        stem: "Which of the following is NOT a form of retaliation?",
        options: ["Reducing hours after a report", "A routine performance review on its scheduled date", "Excluding the reporter from team meetings", "Giving unfounded written warnings"],
        correctIndex: 1,
        rationale: "A routine, previously scheduled performance review is normal business — not retaliation.",
      },
      {
        id: "GAO006-Q5",
        stem: "Filing a knowingly false compliance report to get a coworker in trouble is:",
        options: ["Protected under whistleblower laws", "Not protected and may result in discipline", "Only a problem if the coworker is innocent", "Acceptable as long as you use the hotline"],
        correctIndex: 1,
        rationale: "Knowingly false reports are not made in good faith and are not protected. They may result in discipline.",
      },
    ],
    passScore: 80,
  },

  // ═══════════════════════════════════════════════════════════════
  // GAO-007: HIPAA Privacy — PHI Handling
  // ═══════════════════════════════════════════════════════════════
  {
    id: "GAO-007",
    title: "HIPAA Privacy — PHI Handling & Minimum Necessary",
    track: "GAO",
    durationMinutes: 35,
    policyMapped: ["CO-HP-001", "CO-HP-004"],
    pages: [
      {
        title: "What is HIPAA?",
        content: `<h2>HIPAA Privacy Rule — Your #1 Patient Protection Obligation</h2>
<p>The <strong>Health Insurance Portability and Accountability Act (HIPAA)</strong> establishes national standards for protecting patient health information.</p>
<div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #EF4444;">
<strong>HIPAA violations are serious:</strong>
<ul>
<li>Civil penalties: $100 to $50,000 per violation, up to $1.5 million/year</li>
<li>Criminal penalties: Up to $250,000 fine and 10 years imprisonment</li>
<li>Individual employees CAN be personally prosecuted</li>
<li>Patients can suffer identity theft, discrimination, and emotional harm</li>
</ul>
</div>
<p>Care Indeed's HIPAA program is documented in <strong>CO-HP-001</strong> (Privacy), <strong>CO-HP-002</strong> (Security), and <strong>CO-HP-003</strong> (Breach Reporting).</p>`,
        narration: "HIPAA, the Health Insurance Portability and Accountability Act, establishes national standards for protecting patient health information. Violations are serious: civil penalties range from $100 to $50,000 per violation up to $1.5 million per year. Criminal penalties include up to $250,000 in fines and 10 years imprisonment. Individual employees can be personally prosecuted. And patients can suffer identity theft, discrimination, and emotional harm. Care Indeed's HIPAA program is documented in policies CO-HP-001, CO-HP-002, and CO-HP-003.",
      },
      {
        title: "What is PHI?",
        content: `<h2>Protected Health Information (PHI)</h2>
<p><strong>PHI</strong> is any individually identifiable health information that is created, received, maintained, or transmitted by a covered entity.</p>
<div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;">
<h3>18 HIPAA Identifiers — If combined with health data, it's PHI:</h3>
<div style="column-count:2;column-gap:20px;">
<ol>
<li>Name</li><li>Address (including ZIP)</li><li>Dates (DOB, admission, discharge)</li>
<li>Phone number</li><li>Fax number</li><li>Email address</li><li>SSN</li>
<li>Medical record number</li><li>Health plan beneficiary #</li><li>Account numbers</li>
<li>Certificate/license numbers</li><li>Vehicle identifiers</li><li>Device identifiers</li>
<li>Web URLs</li><li>IP addresses</li><li>Biometric identifiers</li>
<li>Full-face photos</li><li>Any other unique number/code</li>
</ol>
</div>
</div>
<p><strong>In home health, almost everything you document is PHI</strong> — patient names, diagnoses, medications, addresses, visit dates. Treat ALL patient information as PHI.</p>`,
        narration: "Protected Health Information, or PHI, is any individually identifiable health information created, received, maintained, or transmitted by a covered entity. HIPAA defines 18 identifiers including name, address, dates of birth, phone numbers, Social Security numbers, medical record numbers, and photos. When any of these are combined with health data, it becomes PHI. In home health, almost everything you document is PHI. Treat all patient information as protected.",
      },
      {
        title: "Minimum Necessary Standard",
        content: `<h2>The Minimum Necessary Standard</h2>
<p>Under HIPAA, you must limit PHI access and disclosure to the <strong>minimum necessary</strong> to accomplish the intended purpose.</p>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;">
<h3>What This Means in Practice:</h3>
<ul>
<li><strong>Access:</strong> Only access patient records for patients you are actively treating or have a work-related need</li>
<li><strong>Disclosure:</strong> Only share PHI needed for the specific purpose — not the entire record</li>
<li><strong>Conversations:</strong> Don't discuss patient details in public areas, elevators, or where others can overhear</li>
<li><strong>Devices:</strong> Close patient records on screens when you walk away</li>
</ul>
</div>
<h3>Examples:</h3>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
<tr style="background:#0D4F4F;color:white;"><th style="padding:10px;">Situation</th><th style="padding:10px;">Correct Action</th></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">A colleague asks about a patient you both treat</td><td style="padding:10px;">Share only what's relevant to their care role</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">You're curious about a neighbor's diagnosis</td><td style="padding:10px;">Do NOT access — no treatment relationship = no access right</td></tr>
<tr><td style="padding:10px;">Faxing records to a physician</td><td style="padding:10px;">Send only the specific pages needed, not the full chart</td></tr>
</table>`,
        narration: "The Minimum Necessary Standard requires limiting PHI access and disclosure to the minimum needed to accomplish the intended purpose. In practice: only access records for patients you actively treat. Only share PHI needed for the specific purpose. Don't discuss patients in public areas. Close records on screens when you step away. If a colleague asks about a shared patient, share only what's relevant to their care role. Never access a record out of curiosity. When faxing, send only specific pages needed, not the full chart.",
      },
      {
        title: "Permitted Uses and Disclosures",
        content: `<h2>When Can You Use or Disclose PHI?</h2>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;">
<h3>✅ Permitted WITHOUT Patient Authorization:</h3>
<ul>
<li><strong>Treatment:</strong> Sharing with other providers for the patient's care</li>
<li><strong>Payment:</strong> Submitting claims to insurers</li>
<li><strong>Healthcare Operations:</strong> Quality improvement, training, audits</li>
<li><strong>Required by law:</strong> Mandatory reporting (abuse, communicable disease)</li>
<li><strong>Public health activities:</strong> Disease surveillance</li>
</ul>
</div>
<div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;">
<h3>❌ Requires Patient AUTHORIZATION:</h3>
<ul>
<li>Marketing purposes</li>
<li>Sale of PHI</li>
<li>Most disclosures to employers</li>
<li>Sharing with family/friends beyond what's involved in care</li>
<li>Any use not covered by TPO or law</li>
</ul>
</div>`,
        narration: "PHI can be used or disclosed without patient authorization for Treatment, Payment, and Healthcare Operations — known as TPO. It can also be disclosed when required by law, such as mandatory abuse reporting, or for public health activities. However, patient authorization IS required for marketing, sale of PHI, most employer disclosures, sharing with family or friends beyond those involved in care, and any use not covered by TPO or law.",
      },
      {
        title: "PHI in the Home Health Setting",
        content: `<h2>Home Health-Specific PHI Risks</h2>
<p>Home health has <strong>unique PHI risks</strong> because care occurs outside a controlled facility:</p>
<div style="background:#FFF3E0;padding:16px;border-radius:8px;margin:16px 0;">
<h3>⚠️ Common Home Health PHI Risks:</h3>
<ul>
<li><strong>Paper records in vehicles:</strong> Never leave patient documents visible in your car</li>
<li><strong>Conversations with family members:</strong> Only share information the patient has authorized</li>
<li><strong>Personal cell phones:</strong> Do not text or photograph PHI on personal devices</li>
<li><strong>Home environment:</strong> Ensure your documentation screen is not visible to unauthorized household members</li>
<li><strong>Discussing patients between visits:</strong> Don't discuss patients in non-secure locations (coffee shops, parking lots)</li>
<li><strong>Leaving printed materials:</strong> Don't leave patient care documents at the patient's home unless required</li>
</ul>
</div>`,
        narration: "Home health has unique PHI risks because care occurs outside a controlled facility. Never leave patient documents visible in your car. Only share information with family members that the patient has authorized. Do not text or photograph PHI on personal devices. Ensure your documentation screen is not visible to unauthorized household members. Don't discuss patients in non-secure locations like coffee shops. And don't leave printed care documents at the patient's home unless specifically required.",
      },
      {
        title: "Module Summary",
        content: `<h2>Module Summary — GAO-007</h2>
<div style="background:#E0F7FA;padding:16px;border-radius:8px;">
<h3>Key Takeaways:</h3>
<ul>
<li>HIPAA violations carry civil penalties up to $1.5M/year and criminal penalties up to 10 years</li>
<li>PHI = any of the 18 identifiers combined with health data — treat ALL patient info as PHI</li>
<li>Minimum Necessary: only access/share the minimum PHI needed for the purpose</li>
<li>TPO (Treatment, Payment, Operations) = permitted without authorization</li>
<li>Home health has unique risks — vehicle security, family conversations, personal devices</li>
</ul>
</div>`,
        narration: "To summarize: HIPAA violations are severe. PHI includes the 18 identifiers combined with health data. Apply the Minimum Necessary Standard to all access and disclosure. Treatment, Payment, and Operations are permitted without authorization. And home health has unique PHI risks in vehicles, homes, and with personal devices.",
      },
    ],
    exam: [
      {
        id: "GAO007-Q1",
        stem: "The maximum civil penalty for HIPAA violations can reach:",
        options: ["$10,000 per year", "$100,000 per year", "$1.5 million per year", "$500,000 total"],
        correctIndex: 2,
        rationale: "Civil penalties can reach up to $1.5 million per year per violation category.",
      },
      {
        id: "GAO007-Q2",
        stem: "You are curious about a neighbor's health condition and have access to their record in the EHR. You should:",
        options: ["Access it briefly — you won't share it", "Not access it — you have no treatment relationship", "Access it and tell your neighbor to call you if they need help", "Ask a colleague to look it up instead"],
        correctIndex: 1,
        rationale: "No treatment relationship = no access right. Accessing records without a work-related need violates HIPAA.",
      },
      {
        id: "GAO007-Q3",
        stem: "The 'Minimum Necessary' standard means:",
        options: ["Use the smallest font possible when documenting", "Limit PHI access and disclosure to what is needed for the intended purpose", "Only document the minimum amount of clinical information", "Spend minimum time with each patient"],
        correctIndex: 1,
        rationale: "Minimum Necessary limits PHI access and disclosure to the minimum needed for the intended purpose.",
      },
      {
        id: "GAO007-Q4",
        stem: "Which of the following requires patient authorization for disclosure?",
        options: ["Sharing patient info with another provider for treatment", "Submitting claims to the patient's insurer", "Using PHI for marketing purposes", "Reporting suspected abuse to authorities"],
        correctIndex: 2,
        rationale: "Marketing requires patient authorization. Treatment, payment, and mandatory reporting do not.",
      },
      {
        id: "GAO007-Q5",
        stem: "A home health nurse is documenting at a patient's kitchen table. A neighbor stops by. The nurse should:",
        options: ["Continue documenting — the neighbor probably won't look", "Close or shield the screen so the neighbor cannot see PHI", "Ask the neighbor to leave", "Move to the patient's bedroom"],
        correctIndex: 1,
        rationale: "The nurse must ensure documentation screens are not visible to unauthorized individuals — close or shield the screen.",
      },
    ],
    passScore: 80,
  },

  // ═══════════════════════════════════════════════════════════════
  // GAO-008: HIPAA Security
  // ═══════════════════════════════════════════════════════════════
  {
    id: "GAO-008",
    title: "HIPAA Security — Passwords, Devices & Data Protection",
    track: "GAO",
    durationMinutes: 30,
    policyMapped: ["CO-HP-002"],
    pages: [
      {
        title: "HIPAA Security Rule Overview",
        content: `<h2>HIPAA Security Rule — Protecting Electronic PHI</h2>
<p>While the Privacy Rule covers all forms of PHI, the <strong>Security Rule (CO-HP-002)</strong> specifically addresses <strong>electronic PHI (ePHI)</strong> — patient information stored, processed, or transmitted electronically.</p>
<div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Three Security Safeguard Categories:</h3>
<table style="width:100%;border-collapse:collapse;">
<tr style="background:#0D4F4F;color:white;"><th style="padding:10px;">Category</th><th style="padding:10px;">Examples</th></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;"><strong>Administrative</strong></td><td style="padding:10px;">Security policies, workforce training, access management, incident procedures</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;"><strong>Physical</strong></td><td style="padding:10px;">Facility access controls, workstation security, device controls</td></tr>
<tr><td style="padding:10px;"><strong>Technical</strong></td><td style="padding:10px;">Access controls, audit logs, encryption, integrity controls, transmission security</td></tr>
</table>
</div>`,
        narration: "The HIPAA Security Rule under policy CO-HP-002 specifically addresses electronic PHI — patient information stored, processed, or transmitted electronically. There are three categories of safeguards. Administrative safeguards include security policies, workforce training, and incident procedures. Physical safeguards include facility access controls and device security. Technical safeguards include access controls, audit logs, encryption, and transmission security.",
      },
      {
        title: "Password & Access Security",
        content: `<h2>Password & Access Management</h2>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Password Requirements:</h3>
<ul>
<li>Minimum 12 characters with uppercase, lowercase, number, and special character</li>
<li>Change every 90 days</li>
<li>Never reuse the last 10 passwords</li>
<li>Never share your password with ANYONE — including supervisors</li>
<li>Lock your screen immediately when stepping away (Win+L or Ctrl+Cmd+Q)</li>
</ul>
</div>
<div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;">
<h3>⚠️ Never:</h3>
<ul>
<li>Write passwords on sticky notes or under keyboards</li>
<li>Use the same password for work and personal accounts</li>
<li>Log in using another person's credentials</li>
<li>Leave your device unlocked and unattended</li>
<li>Allow unauthorized people to use your device</li>
</ul>
</div>
<p><strong>Your login = your identity.</strong> Anything done under your credentials is attributed to YOU — legally and professionally.</p>`,
        narration: "Password security is critical. Passwords must be at minimum 12 characters with uppercase, lowercase, numbers, and special characters. Change them every 90 days and never reuse the last 10. Never share your password with anyone, including supervisors. Lock your screen immediately when stepping away. Never write passwords on sticky notes, use the same password for work and personal accounts, log in with someone else's credentials, or leave devices unlocked. Your login is your identity — anything done under your credentials is attributed to you.",
      },
      {
        title: "Device & Mobile Security",
        content: `<h2>Device Security in Home Health</h2>
<p>Home health clinicians use <strong>mobile devices in the field</strong>, creating unique security challenges:</p>
<div style="background:#FFF3E0;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Device Security Rules:</h3>
<ul>
<li><strong>Encryption:</strong> All agency devices must have full-disk encryption enabled</li>
<li><strong>Auto-lock:</strong> Devices must auto-lock after 5 minutes of inactivity</li>
<li><strong>Personal devices:</strong> Do NOT access ePHI on personal phones/tablets unless approved by IT with MDM software</li>
<li><strong>Vehicle security:</strong> Never leave devices visible in your car — lock in the trunk</li>
<li><strong>Lost/stolen devices:</strong> Report to IT within 1 hour for remote wipe capability</li>
<li><strong>Public Wi-Fi:</strong> Never access patient records on public/unsecured Wi-Fi — use agency VPN</li>
</ul>
</div>`,
        narration: "Home health clinicians face unique device security challenges in the field. All agency devices must have full-disk encryption. Devices must auto-lock after 5 minutes. Do not access ePHI on personal devices unless IT has approved with mobile device management software. Never leave devices visible in your car. Report lost or stolen devices to IT within 1 hour for remote wipe. And never access patient records on public Wi-Fi — always use the agency VPN.",
      },
      {
        title: "Email & Transmission Security",
        content: `<h2>Secure Transmission of ePHI</h2>
<div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Email Rules:</h3>
<ul>
<li>Use the agency's <strong>encrypted email system</strong> for any communication containing PHI</li>
<li>Never send PHI via personal email (Gmail, Yahoo, etc.)</li>
<li>Double-check the recipient's email address before sending — one wrong letter = breach</li>
<li>Use secure messaging within the EHR when communicating about patients</li>
</ul>
</div>
<div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;">
<h3>⚠️ Texting:</h3>
<p><strong>Standard SMS text messages are NOT secure.</strong> Do not text PHI. Use the agency-approved secure messaging platform only.</p>
</div>
<p>Any electronic transmission of PHI must use <strong>encryption in transit</strong> — this means HTTPS, encrypted email, or secure messaging systems.</p>`,
        narration: "When transmitting ePHI electronically, always use the agency's encrypted email system. Never send PHI via personal email like Gmail or Yahoo. Double-check recipient email addresses — one wrong letter can cause a breach. Use secure messaging within the EHR for patient communication. Standard SMS text messages are not secure — do not text PHI. Use only the agency-approved secure messaging platform. All electronic PHI transmission must use encryption in transit.",
      },
      {
        title: "Module Summary",
        content: `<h2>Module Summary — GAO-008</h2>
<div style="background:#E0F7FA;padding:16px;border-radius:8px;">
<h3>Key Takeaways:</h3>
<ul>
<li>The Security Rule covers electronic PHI with administrative, physical, and technical safeguards</li>
<li>Passwords: 12+ characters, change q90d, never share, lock screens when stepping away</li>
<li>Devices: encryption required, auto-lock at 5 min, no personal devices without IT approval</li>
<li>Report lost/stolen devices within 1 hour</li>
<li>Never use public Wi-Fi, personal email, or standard texting for PHI</li>
<li>Your login = your identity — you are responsible for all actions under your credentials</li>
</ul>
</div>`,
        narration: "In summary: The Security Rule covers ePHI with three safeguard categories. Passwords must be strong, changed regularly, and never shared. Devices must be encrypted with auto-lock. Report lost devices within 1 hour. Never use public Wi-Fi, personal email, or texting for PHI. And remember — your login is your identity.",
      },
    ],
    exam: [
      {
        id: "GAO008-Q1",
        stem: "HIPAA requires passwords to be at minimum:",
        options: ["6 characters", "8 characters", "12 characters with mixed types", "Any length as long as it's unique"],
        correctIndex: 2,
        rationale: "Per security policy, passwords must be minimum 12 characters with uppercase, lowercase, number, and special character.",
      },
      {
        id: "GAO008-Q2",
        stem: "Your agency tablet is stolen from your car. How quickly must you report it?",
        options: ["By the end of the week", "Within 24 hours", "Within 1 hour", "At your next supervisor meeting"],
        correctIndex: 2,
        rationale: "Lost or stolen devices must be reported to IT within 1 hour for remote wipe capability.",
      },
      {
        id: "GAO008-Q3",
        stem: "You need to send patient information to a physician. The correct method is:",
        options: ["Personal Gmail account", "Standard text message", "Agency encrypted email or EHR secure messaging", "Facebook Messenger"],
        correctIndex: 2,
        rationale: "PHI must be transmitted using encrypted channels — agency email or EHR secure messaging.",
      },
      {
        id: "GAO008-Q4",
        stem: "A colleague asks to borrow your login credentials because their account is locked. You should:",
        options: ["Share your credentials this one time", "Refuse and direct them to IT for their own account access", "Create a temporary shared account", "Let them watch over your shoulder while you log in for them"],
        correctIndex: 1,
        rationale: "Never share credentials. Direct them to IT. Your login = your legal identity.",
      },
      {
        id: "GAO008-Q5",
        stem: "Which type of Wi-Fi connection should you NEVER use to access patient records?",
        options: ["Agency VPN", "Encrypted home Wi-Fi", "Public/unsecured Wi-Fi", "Agency office Wi-Fi"],
        correctIndex: 2,
        rationale: "Never access patient records on public/unsecured Wi-Fi — always use the agency VPN.",
      },
    ],
    passScore: 80,
  },

  // ═══════════════════════════════════════════════════════════════
  // GAO-009: HIPAA Breach Reporting
  // ═══════════════════════════════════════════════════════════════
  {
    id: "GAO-009",
    title: "HIPAA Breach Reporting",
    track: "GAO",
    durationMinutes: 30,
    policyMapped: ["CO-HP-003"],
    pages: [
      {
        title: "What is a Breach?",
        content: `<h2>HIPAA Breach Reporting — CO-HP-003</h2>
<p>A <strong>breach</strong> is the unauthorized acquisition, access, use, or disclosure of PHI that compromises the security or privacy of the information.</p>
<div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Common Breach Examples in Home Health:</h3>
<ul>
<li>Laptop containing patient records stolen from your car</li>
<li>Sending a patient's records to the wrong fax number or email</li>
<li>Discussing patient details where others can overhear</li>
<li>An employee accessing records without a treatment relationship</li>
<li>Paper documents left at a patient's home that are seen by unauthorized persons</li>
<li>Unencrypted USB drive with patient data lost</li>
</ul>
</div>
<p>Under the HITECH Act's <strong>Breach Notification Rule</strong>, breaches must be reported to affected patients, HHS, and (if 500+ individuals) the media.</p>`,
        narration: "A HIPAA breach is the unauthorized acquisition, access, use, or disclosure of PHI that compromises its security or privacy. Common home health breaches include stolen laptops, records sent to wrong recipients, patient discussions overheard by others, unauthorized record access, documents left at a patient's home, or lost unencrypted drives. Under the HITECH Act Breach Notification Rule, breaches must be reported to affected patients, HHS, and the media if 500 or more individuals are affected.",
      },
      {
        title: "Your Reporting Obligation",
        content: `<h2>Immediate Reporting — Your #1 Obligation</h2>
<div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #EF4444;">
<h3>⚠️ IMMEDIATE: Report suspected breaches within 1 HOUR</h3>
<p>Report to your supervisor AND the Privacy Officer simultaneously.<br/>
Do NOT wait to determine if it's "really" a breach — let the Privacy Officer make that determination.</p>
</div>
<h3>What to Report:</h3>
<ul>
<li>What happened (what PHI was involved)</li>
<li>When it happened</li>
<li>Who was involved (patients, staff)</li>
<li>How it was discovered</li>
<li>What has been done so far to contain it</li>
</ul>
<p><strong>Speed matters.</strong> The faster a breach is reported, the faster it can be contained, and the less harm to patients.</p>`,
        narration: "Your number one obligation is immediate reporting. Report suspected breaches within 1 hour to your supervisor and the Privacy Officer simultaneously. Do not wait to determine if it is really a breach — let the Privacy Officer make that determination. Report what happened, when it happened, who was involved, how it was discovered, and what has been done to contain it. Speed matters — faster reporting means faster containment and less patient harm.",
      },
      {
        title: "Breach Investigation & Notification",
        content: `<h2>What Happens After a Breach Report</h2>
<ol style="line-height:2;">
<li><strong>Containment:</strong> Stop the breach immediately (retrieve records, change passwords, remote wipe)</li>
<li><strong>Risk Assessment:</strong> 4-factor test per 45 CFR § 164.402 — nature of PHI, unauthorized person, actual access/use, mitigation</li>
<li><strong>Determination:</strong> Does it qualify as a reportable breach?</li>
<li><strong>Notification (if reportable):</strong>
<ul>
<li>Affected patients: within 60 days</li>
<li>HHS: annually if <500 affected; within 60 days if ≥500</li>
<li>Media: within 60 days if ≥500 in a single state</li>
</ul></li>
<li><strong>Corrective Action:</strong> Policy updates, additional training, sanctions if warranted</li>
<li><strong>Documentation:</strong> Entire investigation documented and retained for 6 years</li>
</ol>`,
        narration: "After a breach report, the process is containment to stop the breach, a four-factor risk assessment per federal regulation, determination of whether it is reportable, and then notification. Affected patients must be notified within 60 days. HHS must be notified annually for small breaches or within 60 days for breaches affecting 500 or more. Media notification is required within 60 days if 500 or more are affected in a single state. Corrective action and full documentation follow, with records retained for six years.",
      },
      {
        title: "Module Summary",
        content: `<h2>Module Summary — GAO-009</h2>
<div style="background:#E0F7FA;padding:16px;border-radius:8px;">
<ul>
<li>A breach = unauthorized acquisition, access, use, or disclosure of PHI</li>
<li>Report suspected breaches within <strong>1 hour</strong> to supervisor + Privacy Officer</li>
<li>Don't wait to confirm — report immediately and let the Privacy Officer investigate</li>
<li>4-factor risk assessment determines reportability</li>
<li>Patient notification within 60 days if breach is confirmed</li>
<li>All breaches documented and retained for 6 years</li>
</ul>
</div>`,
        narration: "In summary: A breach is unauthorized acquisition, access, use, or disclosure of PHI. Report within 1 hour. Don't wait to confirm. The four-factor risk assessment determines if notification is required. Patient notification is within 60 days. All documentation is retained for six years.",
      },
    ],
    exam: [
      {
        id: "GAO009-Q1",
        stem: "How quickly must you report a suspected HIPAA breach?",
        options: ["Within 24 hours", "Within 1 hour", "Within 1 week", "At the next staff meeting"],
        correctIndex: 1,
        rationale: "Suspected breaches must be reported within 1 hour to supervisor and Privacy Officer.",
      },
      {
        id: "GAO009-Q2",
        stem: "You accidentally sent a patient's lab results to the wrong fax number. This is:",
        options: ["Not a breach since it was accidental", "A potential breach that must be reported immediately", "Only a breach if the recipient reads it", "A minor error that doesn't need reporting"],
        correctIndex: 1,
        rationale: "Sending PHI to the wrong recipient is a potential breach regardless of intent. Report immediately.",
      },
      {
        id: "GAO009-Q3",
        stem: "Affected patients must be notified of a confirmed breach within:",
        options: ["30 days", "60 days", "90 days", "1 year"],
        correctIndex: 1,
        rationale: "Per the Breach Notification Rule, affected patients must be notified within 60 days.",
      },
      {
        id: "GAO009-Q4",
        stem: "Breach investigation records must be retained for:",
        options: ["1 year", "3 years", "6 years", "10 years"],
        correctIndex: 2,
        rationale: "All breach investigation documentation must be retained for 6 years.",
      },
      {
        id: "GAO009-Q5",
        stem: "When is media notification required for a HIPAA breach?",
        options: ["For all breaches", "When 100+ individuals are affected", "When 500+ individuals in a single state are affected", "Only when criminal activity is involved"],
        correctIndex: 2,
        rationale: "Media notification is required within 60 days when 500+ individuals in a single state are affected.",
      },
    ],
    passScore: 80,
  },

  // ═══════════════════════════════════════════════════════════════
  // GAO-010: Patient Rights & Responsibilities
  // ═══════════════════════════════════════════════════════════════
  {
    id: "GAO-010",
    title: "Patient Rights & Responsibilities",
    track: "GAO",
    durationMinutes: 30,
    policyMapped: ["CL-PR-001"],
    pages: [
      {
        title: "Patient Bill of Rights",
        content: `<h2>Patient Rights — CL-PR-001</h2>
<p>CMS requires every home health agency to inform patients of their rights <strong>before or during the first visit</strong>. Per 42 CFR § 484.50, patients have the following rights:</p>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Core Patient Rights:</h3>
<ul>
<li>Be informed of rights before care begins</li>
<li>Choose the healthcare provider of their choosing</li>
<li>Receive care without discrimination</li>
<li>Be informed of services and charges</li>
<li>Participate in care planning and treatment decisions</li>
<li>Refuse treatment</li>
<li>Privacy and confidentiality of records</li>
<li>Be free from abuse, neglect, and exploitation</li>
<li>Voice grievances without fear of reprisal</li>
<li>Be informed of state home health hotline number</li>
</ul>
</div>`,
        narration: "CMS requires that every patient be informed of their rights before or during the first home health visit. Under 42 CFR Section 484.50, patients have the right to be informed of their rights, choose their provider, receive care without discrimination, know about services and charges, participate in care planning, refuse treatment, have their records kept private, be free from abuse, voice grievances without reprisal, and know the state home health hotline number.",
      },
      {
        title: "Your Role in Protecting Rights",
        content: `<h2>Every Employee's Obligation</h2>
<p>Patient rights are not just a document the patient signs. They are <strong>active obligations</strong> for every caregiver at every visit:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
<tr style="background:#0D4F4F;color:white;"><th style="padding:10px;">Right</th><th style="padding:10px;">Your Obligation</th></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">Participate in care planning</td><td style="padding:10px;">Explain what you're doing, why, and ask for input</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">Refuse treatment</td><td style="padding:10px;">Respect the refusal, document it, notify supervisor</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">Privacy</td><td style="padding:10px;">Follow HIPAA, close doors, ask permission before discussing care in front of family</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;">Freedom from abuse</td><td style="padding:10px;">Never use physical force, verbal abuse, or threats — report any observed abuse</td></tr>
<tr><td style="padding:10px;">Voice grievances</td><td style="padding:10px;">Listen to complaints, report to supervisor, never retaliate</td></tr>
</table>`,
        narration: "Patient rights are active obligations at every visit. When the patient has the right to participate in care planning, you must explain what you're doing and ask for input. When they refuse treatment, respect the refusal, document it, and notify your supervisor. For privacy, follow HIPAA and ask permission before discussing care in front of family. For freedom from abuse, never use force or threats and report any observed abuse. When patients voice grievances, listen, report to your supervisor, and never retaliate.",
      },
      {
        title: "Patient Responsibilities",
        content: `<h2>Patient Responsibilities</h2>
<p>Patients also have responsibilities that support effective care delivery:</p>
<ul>
<li>Provide accurate and complete health information</li>
<li>Follow the plan of care agreed upon with the clinical team</li>
<li>Inform the agency of changes in their condition</li>
<li>Treat caregivers with respect</li>
<li>Maintain a safe home environment for caregiver visits</li>
<li>Notify the agency if they will not be home for a scheduled visit</li>
</ul>
<div style="background:#FFF3E0;padding:12px;border-radius:8px;margin:16px 0;">
<strong>Important:</strong> If a patient is non-compliant with their plan of care, <strong>document it and communicate to the RN/DON</strong>. Never discharge or reduce services punitively — work with the team to address barriers.
</div>`,
        narration: "Patients also have responsibilities: providing accurate health information, following the agreed plan of care, informing the agency of condition changes, treating caregivers with respect, maintaining a safe home, and notifying the agency of scheduling changes. If a patient is non-compliant, document it and communicate to the RN or DON. Never reduce services punitively — work with the team to understand and address barriers.",
      },
      {
        title: "Module Summary",
        content: `<h2>Module Summary — GAO-010</h2>
<div style="background:#E0F7FA;padding:16px;border-radius:8px;">
<ul>
<li>Patient rights must be communicated before or during the first visit (42 CFR § 484.50)</li>
<li>Core rights: informed care, choice, privacy, refuse treatment, freedom from abuse, grievances</li>
<li>You actively protect rights at every visit through your behavior and communication</li>
<li>Patient non-compliance is documented and communicated, never punished</li>
</ul>
</div>`,
        narration: "In summary: Patient rights must be communicated before or during the first visit. Core rights include informed care, choice, privacy, right to refuse, freedom from abuse, and grievances. You protect these rights actively at every visit. And patient non-compliance is documented and communicated, never punished.",
      },
    ],
    exam: [
      {
        id: "GAO010-Q1",
        stem: "When must patients be informed of their rights?",
        options: ["Within 30 days of admission", "Before or during the first visit", "At discharge", "Only if they ask"],
        correctIndex: 1,
        rationale: "Per 42 CFR § 484.50, patients must be informed of rights before or during the first visit.",
      },
      {
        id: "GAO010-Q2",
        stem: "A patient refuses a medication you are supposed to administer. You should:",
        options: ["Insist they take it — it's on the care plan", "Respect the refusal, document it, and notify your supervisor", "Leave the medication and tell them to take it later", "Document that you administered it anyway"],
        correctIndex: 1,
        rationale: "Patients have the right to refuse treatment. Respect, document, and notify supervisor.",
      },
      {
        id: "GAO010-Q3",
        stem: "A patient repeatedly doesn't follow their wound care instructions. The correct response is:",
        options: ["Discharge the patient for non-compliance", "Document non-compliance and communicate to the RN/DON to address barriers", "Reduce visit frequency as a consequence", "Continue without documenting the non-compliance"],
        correctIndex: 1,
        rationale: "Document, communicate, and work with the team to address barriers — never punish non-compliance.",
      },
      {
        id: "GAO010-Q4",
        stem: "Which of the following is a patient RIGHT under CMS regulations?",
        options: ["Demand specific staff assignments", "Voice grievances without fear of reprisal", "Receive unlimited home health visits", "Have family members access their full medical record without consent"],
        correctIndex: 1,
        rationale: "Patients have the right to voice grievances without fear of reprisal per 42 CFR § 484.50.",
      },
      {
        id: "GAO010-Q5",
        stem: "Before discussing a patient's care in front of a family member, you should:",
        options: ["Proceed — family has a right to know", "Ask the patient's permission first", "Only discuss if the family member asks", "Wait until the family member leaves the room"],
        correctIndex: 1,
        rationale: "The patient's right to privacy means you must ask permission before discussing care in front of others.",
      },
    ],
    passScore: 80,
  },

  // ═══════════════════════════════════════════════════════════════
  // GAO-011: Advance Directives
  // ═══════════════════════════════════════════════════════════════
  {
    id: "GAO-011",
    title: "Advance Directives",
    track: "GAO",
    durationMinutes: 30,
    policyMapped: ["CL-PR-002"],
    pages: [
      {
        title: "What Are Advance Directives?",
        content: `<h2>Advance Directives — CL-PR-002</h2>
<p>An <strong>advance directive</strong> is a legal document that allows a person to express their wishes about medical treatment in advance, in case they become unable to communicate those wishes later.</p>
<div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Types of Advance Directives:</h3>
<ul>
<li><strong>Living Will:</strong> Specifies what treatments a patient does or does not want (e.g., CPR, ventilator, tube feeding)</li>
<li><strong>Durable Power of Attorney for Healthcare (DPAHC):</strong> Designates a person to make healthcare decisions when the patient cannot</li>
<li><strong>POLST (Physician Orders for Life-Sustaining Treatment):</strong> Physician-signed medical orders for end-of-life preferences</li>
<li><strong>Do Not Resuscitate (DNR):</strong> Specific order not to perform CPR</li>
</ul>
</div>
<p>Under the <strong>Patient Self-Determination Act</strong> and 42 CFR § 484.50, home health agencies must inform patients of their right to create advance directives.</p>`,
        narration: "An advance directive is a legal document allowing a person to express their medical treatment wishes in advance, in case they become unable to communicate. Types include Living Wills specifying desired treatments, Durable Power of Attorney for Healthcare designating a decision-maker, POLST which are physician-signed orders for end-of-life preferences, and Do Not Resuscitate orders. Under the Patient Self-Determination Act and 42 CFR Section 484.50, home health agencies must inform patients of their right to create advance directives.",
      },
      {
        title: "Your Obligations",
        content: `<h2>Staff Obligations Regarding Advance Directives</h2>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;">
<h3>You MUST:</h3>
<ul>
<li>Inform patients of their right to create advance directives at admission</li>
<li>Ask if the patient has an existing advance directive and document the answer</li>
<li>If one exists, obtain a copy for the clinical record</li>
<li>Honor the patient's documented wishes</li>
<li>Notify the physician of the patient's advance directive status</li>
<li>Never provide care that conflicts with a valid advance directive</li>
</ul>
</div>
<div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;">
<h3>You MUST NOT:</h3>
<ul>
<li>Pressure a patient to create or change an advance directive</li>
<li>Condition care on whether the patient has an advance directive</li>
<li>Override a valid directive based on your personal beliefs</li>
<li>Create or witness the directive (refer to legal counsel or social worker)</li>
</ul>
</div>`,
        narration: "Your obligations are clear. You must inform patients of their right to advance directives, ask about existing directives, obtain copies for the record, honor documented wishes, notify the physician, and never provide care conflicting with a valid directive. You must not pressure patients to create or change directives, condition care on having one, override a directive based on personal beliefs, or create or witness the directive yourself.",
      },
      {
        title: "Emergency Situations",
        content: `<h2>Advance Directives in Emergency Situations</h2>
<div style="background:#FFF3E0;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #F59E0B;">
<h3>Critical Scenario: Patient in Cardiac Arrest with a DNR</h3>
<ol>
<li>Verify the DNR is on file and accessible</li>
<li>Do NOT initiate CPR if a valid DNR is in place</li>
<li>Provide comfort measures</li>
<li>Call 911 and inform them of the DNR</li>
<li>Contact the physician and DON</li>
<li>Document everything with times</li>
</ol>
</div>
<div style="background:#FBE9E7;padding:12px;border-radius:8px;margin:16px 0;">
<strong>If NO advance directive is on file or accessible:</strong> Presume full code — initiate CPR and call 911. It is better to err on the side of resuscitation when directives are unclear.
</div>`,
        narration: "In emergency situations, advance directives guide your response. If a patient is in cardiac arrest and has a valid DNR on file, do not initiate CPR. Provide comfort measures, call 911 and inform them of the DNR, contact the physician and DON, and document everything with times. If no advance directive is on file or accessible, presume full code — initiate CPR and call 911. Always err on the side of resuscitation when directives are unclear.",
      },
      {
        title: "Module Summary",
        content: `<h2>Module Summary — GAO-011</h2>
<div style="background:#E0F7FA;padding:16px;border-radius:8px;">
<ul>
<li>Advance directives: Living Will, DPAHC, POLST, DNR</li>
<li>Inform patients at admission of their right to create directives</li>
<li>Honor documented wishes — never override based on personal beliefs</li>
<li>If DNR on file → do NOT initiate CPR; provide comfort measures</li>
<li>If NO directive accessible → presume full code, initiate CPR</li>
</ul>
</div>`,
        narration: "In summary: The four types of advance directives are Living Wills, Durable Power of Attorney for Healthcare, POLST, and DNR orders. Inform patients at admission. Honor their documented wishes. With a valid DNR, do not initiate CPR. Without a directive, presume full code.",
      },
    ],
    exam: [
      {
        id: "GAO011-Q1",
        stem: "A Durable Power of Attorney for Healthcare (DPAHC) designates:",
        options: ["The patient's preferred hospital", "A person to manage the patient's finances", "A person to make healthcare decisions when the patient cannot", "The patient's preferred funeral arrangements"],
        correctIndex: 2,
        rationale: "A DPAHC designates a person to make healthcare decisions when the patient is unable to communicate.",
      },
      {
        id: "GAO011-Q2",
        stem: "A patient in cardiac arrest has a valid DNR on file. You should:",
        options: ["Initiate CPR immediately", "Not initiate CPR — provide comfort measures and call 911 with DNR notification", "Wait for the DON to decide", "Ask the family what they want"],
        correctIndex: 1,
        rationale: "With a valid DNR, do NOT initiate CPR. Provide comfort, call 911 with DNR info, notify physician and DON.",
      },
      {
        id: "GAO011-Q3",
        stem: "When should patients be informed of their right to create advance directives?",
        options: ["Only when they are terminally ill", "At admission to home health services", "At discharge", "Only if they ask about it"],
        correctIndex: 1,
        rationale: "Per the Patient Self-Determination Act, patients must be informed at admission.",
      },
      {
        id: "GAO011-Q4",
        stem: "You personally disagree with a patient's decision to refuse life-sustaining treatment. You should:",
        options: ["Try to convince them to change their directive", "Honor their documented wishes regardless of your personal beliefs", "Refuse to provide care until they change their mind", "Contact their family to override the decision"],
        correctIndex: 1,
        rationale: "You must honor patient directives regardless of personal beliefs. You cannot override or pressure changes.",
      },
      {
        id: "GAO011-Q5",
        stem: "If a patient is found unresponsive and NO advance directive is accessible, you should:",
        options: ["Assume DNR and provide comfort only", "Presume full code — initiate CPR and call 911", "Wait for the physician to call back with instructions", "Check with the family before doing anything"],
        correctIndex: 1,
        rationale: "When no directive is accessible, presume full code — err on the side of resuscitation.",
      },
    ],
    passScore: 80,
  },

  // ═══════════════════════════════════════════════════════════════
  // GAO-012: Abuse/Neglect/Exploitation
  // ═══════════════════════════════════════════════════════════════
  {
    id: "GAO-012",
    title: "Abuse, Neglect & Exploitation — Identification & Mandatory Reporting",
    track: "GAO",
    durationMinutes: 35,
    policyMapped: ["CL-PR-006", "HR-ER-009"],
    pages: [
      {
        title: "Overview — Why This Module is Critical",
        content: `<h2>Abuse, Neglect & Exploitation</h2>
<p>As a home health care worker, you are a <strong>mandatory reporter</strong> under California law. This means you are <strong>legally required</strong> to report suspected abuse, neglect, or exploitation — failure to report is a criminal offense.</p>
<div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #EF4444;">
<strong>California Penal Code § 11160-11174:</strong> Healthcare providers who fail to report suspected abuse or neglect face criminal penalties including fines and imprisonment.
</div>
<p>You do not need to PROVE abuse. You only need a <strong>reasonable suspicion</strong> to trigger the reporting obligation.</p>`,
        narration: "As a home health care worker, you are a mandatory reporter under California law. You are legally required to report suspected abuse, neglect, or exploitation. Failure to report is a criminal offense under California Penal Code Sections 11160 through 11174. You do not need to prove abuse. You only need a reasonable suspicion to trigger the reporting obligation.",
      },
      {
        title: "Types of Abuse",
        content: `<h2>Recognizing Abuse, Neglect & Exploitation</h2>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
<tr style="background:#0D4F4F;color:white;"><th style="padding:10px;">Type</th><th style="padding:10px;">Definition</th><th style="padding:10px;">Warning Signs</th></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;"><strong>Physical Abuse</strong></td><td style="padding:10px;">Intentional physical harm</td><td style="padding:10px;">Unexplained bruises, burns, fractures; fear of caregiver; conflicting stories about injuries</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;"><strong>Emotional/Verbal Abuse</strong></td><td style="padding:10px;">Threats, intimidation, humiliation</td><td style="padding:10px;">Withdrawal, fearfulness, depression; caregiver belittling the patient</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;"><strong>Sexual Abuse</strong></td><td style="padding:10px;">Non-consensual sexual contact</td><td style="padding:10px;">Unexplained genital injuries, STIs, fear of specific individuals</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;"><strong>Neglect</strong></td><td style="padding:10px;">Failure to provide necessary care</td><td style="padding:10px;">Malnutrition, dehydration, unsanitary conditions, untreated medical conditions, pressure ulcers</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;"><strong>Self-Neglect</strong></td><td style="padding:10px;">Patient unable to care for self</td><td style="padding:10px;">Hoarding, refusing essential care, unsafe living conditions</td></tr>
<tr><td style="padding:10px;"><strong>Financial Exploitation</strong></td><td style="padding:10px;">Unauthorized use of patient's assets</td><td style="padding:10px;">Missing belongings, unpaid bills despite resources, sudden changes to legal documents</td></tr>
</table>`,
        narration: "There are six types of abuse to recognize. Physical abuse involves intentional harm, shown by unexplained injuries. Emotional abuse involves threats and humiliation, indicated by withdrawal and fearfulness. Sexual abuse is non-consensual contact. Neglect is failure to provide necessary care, evidenced by malnutrition and unsanitary conditions. Self-neglect is when the patient cannot care for themselves. Financial exploitation is unauthorized use of the patient's assets, shown by missing belongings or sudden document changes.",
      },
      {
        title: "How to Report",
        content: `<h2>Mandatory Reporting Process</h2>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Immediate Steps:</h3>
<ol>
<li><strong>Ensure patient safety</strong> — if imminent danger, call 911</li>
<li><strong>Report to supervisor and DON immediately</strong> (same day, not next visit)</li>
<li><strong>File with Adult Protective Services (APS)</strong> or law enforcement within 24 hours</li>
<li><strong>Document your observations</strong> objectively — what you saw, heard, and the patient said (use quotes)</li>
<li><strong>Do NOT investigate</strong> — leave investigation to authorities</li>
<li><strong>Do NOT confront the alleged abuser</strong></li>
</ol>
</div>
<div style="background:#FFF3E0;padding:12px;border-radius:8px;margin:16px 0;">
<strong>California APS Reporting:</strong> Call your county's APS office or use the statewide number.<br/>
<strong>For children:</strong> Report to Child Protective Services (CPS).
</div>`,
        narration: "The mandatory reporting process starts with ensuring patient safety — call 911 if there is imminent danger. Report to your supervisor and DON immediately, the same day. File with Adult Protective Services or law enforcement within 24 hours. Document your observations objectively using quotes for patient statements. Do not investigate yourself. And do not confront the alleged abuser. For elder or dependent adults, call your county APS. For children, report to Child Protective Services.",
      },
      {
        title: "Documentation Standards",
        content: `<h2>Documenting Suspected Abuse</h2>
<div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Document:</h3>
<ul>
<li><strong>Date and time</strong> of your observation</li>
<li><strong>Objective findings:</strong> "3cm x 2cm bruise on right forearm, yellow-green in color" — NOT "patient was beaten"</li>
<li><strong>Patient statements:</strong> Use exact quotes — <em>"Patient states: 'My son hit me last night'"</em></li>
<li><strong>Patient demeanor:</strong> "Patient appears fearful, avoids eye contact when son is present"</li>
<li><strong>Actions taken:</strong> Who you reported to, when, and any immediate safety interventions</li>
</ul>
</div>
<div style="background:#FBE9E7;padding:12px;border-radius:8px;margin:16px 0;">
<strong>⚠️ Do NOT:</strong> Document opinions, conclusions, or accusations. Document only what you observed, measured, and what the patient reported.
</div>`,
        narration: "When documenting suspected abuse, record the date and time. Use objective findings like specific measurements and colors, not conclusions. Use exact patient quotes. Note the patient's demeanor. And record all actions taken including who you reported to and when. Do not document opinions, conclusions, or accusations. Document only what you observed, measured, and what the patient reported in their own words.",
      },
      {
        title: "Module Summary",
        content: `<h2>Module Summary — GAO-012</h2>
<div style="background:#E0F7FA;padding:16px;border-radius:8px;">
<ul>
<li>You are a <strong>mandatory reporter</strong> under California law</li>
<li>Six types: physical, emotional, sexual abuse; neglect; self-neglect; financial exploitation</li>
<li>You need <strong>reasonable suspicion</strong>, not proof</li>
<li>Report to supervisor/DON immediately + APS/law enforcement within 24 hours</li>
<li>Document objectively — observations, measurements, exact quotes</li>
<li>Do NOT investigate or confront the alleged abuser</li>
<li>Failure to report is a criminal offense</li>
</ul>
</div>`,
        narration: "In summary: You are a mandatory reporter. There are six types of abuse and neglect. You need only reasonable suspicion, not proof. Report to your supervisor and DON immediately, and to APS or law enforcement within 24 hours. Document objectively. Do not investigate or confront. Failure to report is a criminal offense.",
      },
    ],
    exam: [
      {
        id: "GAO012-Q1",
        stem: "As a mandatory reporter, you must report suspected abuse when you have:",
        options: ["Absolute proof", "Reasonable suspicion", "A confession from the abuser", "Written evidence"],
        correctIndex: 1,
        rationale: "Mandatory reporters must report based on reasonable suspicion — proof is not required.",
      },
      {
        id: "GAO012-Q2",
        stem: "A report to Adult Protective Services must be filed within:",
        options: ["1 hour", "24 hours", "72 hours", "1 week"],
        correctIndex: 1,
        rationale: "APS or law enforcement reports must be filed within 24 hours of suspected abuse.",
      },
      {
        id: "GAO012-Q3",
        stem: "You notice a patient has multiple unexplained bruises. The correct documentation is:",
        options: ["'Patient appears to be abused by family member'", "'3cm x 2cm bruise on right forearm, yellow-green in color'", "'Patient was beaten'", "'Evidence of physical abuse noted'"],
        correctIndex: 1,
        rationale: "Document objective findings — measurements, colors, locations — not conclusions or opinions.",
      },
      {
        id: "GAO012-Q4",
        stem: "You suspect a caregiver in the home is financially exploiting the patient. You should:",
        options: ["Confront the caregiver directly", "Report to supervisor/DON and file with APS — do NOT confront", "Investigate by checking the patient's bank records", "Wait for more evidence before reporting"],
        correctIndex: 1,
        rationale: "Report immediately, do NOT investigate or confront. Leave investigation to authorities.",
      },
      {
        id: "GAO012-Q5",
        stem: "Failure to report suspected abuse as a mandatory reporter in California can result in:",
        options: ["A verbal warning", "No consequences if the abuse wasn't confirmed", "Criminal penalties including fines and imprisonment", "Only administrative consequences"],
        correctIndex: 2,
        rationale: "Under CA Penal Code § 11160-11174, failure to report carries criminal penalties.",
      },
    ],
    passScore: 80,
  },

  // ═══════════════════════════════════════════════════════════════
  // GAO-013: Infection Prevention
  // ═══════════════════════════════════════════════════════════════
  {
    id: "GAO-013",
    title: "Infection Prevention — Standard Precautions, Hand Hygiene & PPE",
    track: "GAO",
    durationMinutes: 35,
    policyMapped: ["CL-SD-016"],
    competencyMethod: "Return demonstration",
    pages: [
      {
        title: "The Chain of Infection",
        content: `<h2>Infection Prevention — CL-SD-016</h2>
<p>Infection prevention is a <strong>core CMS requirement</strong> under 42 CFR § 484.70. Understanding how infections spread is the foundation of preventing them.</p>
<div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;">
<h3>The Chain of Infection — All 6 links must be present for infection to occur:</h3>
<ol>
<li><strong>Infectious Agent</strong> — the pathogen (bacteria, virus, fungus)</li>
<li><strong>Reservoir</strong> — where the pathogen lives (human, animal, surface)</li>
<li><strong>Portal of Exit</strong> — how it leaves the reservoir (blood, secretions, respiratory)</li>
<li><strong>Mode of Transmission</strong> — how it travels (contact, droplet, airborne)</li>
<li><strong>Portal of Entry</strong> — how it enters a new host (wound, mucous membrane, respiratory)</li>
<li><strong>Susceptible Host</strong> — a person whose immune system cannot fight it off</li>
</ol>
</div>
<p><strong>Break ANY link = prevent infection.</strong> Your primary tools are hand hygiene, PPE, and standard precautions.</p>`,
        narration: "Infection prevention is a core CMS requirement under 42 CFR Section 484.70. The chain of infection has six links: the infectious agent or pathogen, the reservoir where it lives, the portal of exit, the mode of transmission, the portal of entry into a new host, and a susceptible host. All six links must be present for infection to occur. Break any one link and you prevent infection. Your primary tools are hand hygiene, PPE, and standard precautions.",
      },
      {
        title: "Standard Precautions",
        content: `<h2>Standard Precautions — Apply to ALL Patients, ALL the Time</h2>
<p>Standard precautions treat <strong>all blood, body fluids, secretions, excretions, non-intact skin, and mucous membranes</strong> as potentially infectious — regardless of diagnosis.</p>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Standard Precautions Include:</h3>
<ul>
<li><strong>Hand hygiene</strong> — before and after every patient contact</li>
<li><strong>PPE</strong> — gloves, gowns, masks, eye protection based on exposure risk</li>
<li><strong>Respiratory hygiene/cough etiquette</strong></li>
<li><strong>Safe injection practices</strong> (if applicable)</li>
<li><strong>Safe handling of contaminated equipment and linens</strong></li>
<li><strong>Environmental cleaning</strong></li>
<li><strong>Proper waste disposal</strong></li>
</ul>
</div>
<p><strong>You don't wait for a diagnosis to use standard precautions.</strong> They are the baseline for every patient encounter.</p>`,
        narration: "Standard precautions apply to all patients, all the time. They treat all blood, body fluids, secretions, excretions, non-intact skin, and mucous membranes as potentially infectious regardless of diagnosis. Standard precautions include hand hygiene before and after every contact, PPE based on exposure risk, respiratory hygiene, safe injection practices, safe handling of contaminated equipment, environmental cleaning, and proper waste disposal. You don't wait for a diagnosis — standard precautions are the baseline for every encounter.",
      },
      {
        title: "Hand Hygiene — The #1 Intervention",
        content: `<h2>Hand Hygiene — Your Most Powerful Tool</h2>
<p>Proper hand hygiene prevents more infections than any other single intervention.</p>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;">
<h3>WHO 5 Moments for Hand Hygiene:</h3>
<ol>
<li>Before touching a patient</li>
<li>Before clean/aseptic procedures</li>
<li>After body fluid exposure risk</li>
<li>After touching a patient</li>
<li>After touching patient surroundings</li>
</ol>
</div>
<h3>Technique:</h3>
<ul>
<li><strong>Alcohol-based hand rub (ABHR):</strong> Apply, rub all surfaces 20+ seconds until dry. Use when hands are NOT visibly soiled.</li>
<li><strong>Soap and water:</strong> Wet, apply soap, scrub all surfaces 20+ seconds, rinse, dry with clean towel. <strong>Required when hands are visibly soiled or after C. diff contact.</strong></li>
</ul>
<div style="background:#FFF3E0;padding:12px;border-radius:8px;margin:16px 0;">
<strong>Home health tip:</strong> Carry alcohol-based hand rub in your bag. Perform hand hygiene at the door before entering and before leaving the patient's home.
</div>`,
        narration: "Hand hygiene is your most powerful tool against infection. Follow the WHO five moments: before touching a patient, before clean procedures, after body fluid exposure risk, after touching a patient, and after touching patient surroundings. Use alcohol-based hand rub for 20 or more seconds when hands are not visibly soiled. Use soap and water for 20 or more seconds when hands are visibly soiled or after C. diff contact. In home health, carry hand rub in your bag and perform hygiene at the door entering and leaving.",
      },
      {
        title: "PPE Selection & Use",
        content: `<h2>Personal Protective Equipment (PPE)</h2>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
<tr style="background:#0D4F4F;color:white;"><th style="padding:10px;">PPE</th><th style="padding:10px;">When to Use</th></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;"><strong>Gloves</strong></td><td style="padding:10px;">Contact with blood, body fluids, mucous membranes, non-intact skin, contaminated surfaces</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;"><strong>Gown</strong></td><td style="padding:10px;">Contact with body fluids likely to soak clothing; patient on contact precautions</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;"><strong>Surgical mask</strong></td><td style="padding:10px;">Droplet precautions; patient with respiratory symptoms</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;"><strong>N95 respirator</strong></td><td style="padding:10px;">Airborne precautions (TB, measles, chickenpox); fit-tested</td></tr>
<tr><td style="padding:10px;"><strong>Eye protection</strong></td><td style="padding:10px;">Splash/spray risk during procedures</td></tr>
</table>
<div style="background:#FBE9E7;padding:12px;border-radius:8px;margin:16px 0;">
<strong>Donning order:</strong> Gown → Mask → Eye protection → Gloves<br/>
<strong>Doffing order:</strong> Gloves → Eye protection → Gown → Mask (remove MOST contaminated first)
</div>`,
        narration: "PPE selection depends on exposure risk. Gloves for contact with blood, body fluids, mucous membranes, or contaminated surfaces. Gowns when body fluids may soak clothing or for contact precautions. Surgical masks for droplet precautions. N95 respirators for airborne precautions like TB — these must be fit-tested. Eye protection when splash or spray is possible. Donning order is gown, mask, eye protection, then gloves. Doffing order is gloves, eye protection, gown, then mask — removing the most contaminated items first.",
      },
      {
        title: "Home Health-Specific IP Practices",
        content: `<h2>Infection Prevention in the Home Setting</h2>
<div style="background:#FFF3E0;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Home-Specific Considerations:</h3>
<ul>
<li><strong>Bag technique:</strong> Keep your nursing bag off the floor — use a barrier (clean towel/mat)</li>
<li><strong>Clean to dirty:</strong> Always work from clean areas to contaminated areas</li>
<li><strong>Sharps disposal:</strong> Bring a portable sharps container; never leave uncapped needles</li>
<li><strong>Waste:</strong> Double-bag biohazardous waste; educate the patient/family on proper disposal</li>
<li><strong>Between patients:</strong> Change gloves and perform hand hygiene between patients; clean equipment per protocol</li>
<li><strong>Patient/family education:</strong> Teach hand hygiene, cough etiquette, and cleaning techniques to patient and family</li>
</ul>
</div>`,
        narration: "Home health has specific infection prevention considerations. Use proper bag technique — keep your nursing bag off the floor on a barrier. Always work from clean to dirty areas. Bring a portable sharps container and never leave uncapped needles. Double-bag biohazardous waste and educate families on disposal. Between patients, change gloves and perform hand hygiene, and clean equipment per protocol. Teach patients and families hand hygiene, cough etiquette, and cleaning techniques.",
      },
      {
        title: "Module Summary",
        content: `<h2>Module Summary — GAO-013</h2>
<div style="background:#E0F7FA;padding:16px;border-radius:8px;">
<ul>
<li>Chain of infection: 6 links — break any one to prevent infection</li>
<li>Standard precautions apply to ALL patients regardless of diagnosis</li>
<li>Hand hygiene: WHO 5 moments, 20+ seconds, ABHR or soap & water</li>
<li>PPE: selected by exposure risk; donning/doffing order matters</li>
<li>Home health: bag technique, clean-to-dirty, portable sharps, patient education</li>
</ul>
<p><strong>Note:</strong> This module requires a <strong>return demonstration</strong> of hand hygiene and PPE donning/doffing with your supervisor.</p>
</div>`,
        narration: "In summary: The chain of infection has six links. Standard precautions are universal. Hand hygiene follows the WHO five moments. PPE is selected by exposure risk with specific donning and doffing order. Home health requires bag technique, clean-to-dirty practice, and patient education. Remember that this module requires a return demonstration of hand hygiene and PPE with your supervisor.",
      },
    ],
    exam: [
      {
        id: "GAO013-Q1",
        stem: "Standard precautions should be applied to:",
        options: ["Only patients with diagnosed infections", "Only patients who appear ill", "ALL patients regardless of diagnosis", "Only patients on isolation precautions"],
        correctIndex: 2,
        rationale: "Standard precautions apply to ALL patients, ALL the time, regardless of diagnosis.",
      },
      {
        id: "GAO013-Q2",
        stem: "The correct doffing (removal) order for PPE is:",
        options: ["Mask → Gloves → Gown → Eye protection", "Gloves → Eye protection → Gown → Mask", "Gown → Mask → Gloves → Eye protection", "It doesn't matter as long as everything is removed"],
        correctIndex: 1,
        rationale: "Doffing order: Gloves → Eye protection → Gown → Mask (most contaminated first).",
      },
      {
        id: "GAO013-Q3",
        stem: "When must you use soap and water instead of alcohol-based hand rub?",
        options: ["Before every patient contact", "When hands are visibly soiled or after C. diff contact", "Only in hospital settings", "It is always acceptable to use ABHR instead"],
        correctIndex: 1,
        rationale: "Soap and water is required when hands are visibly soiled or after C. difficile contact (ABHR doesn't kill C. diff spores).",
      },
      {
        id: "GAO013-Q4",
        stem: "In home health, where should you place your nursing bag?",
        options: ["On the floor near the patient", "On a clean barrier — never directly on the floor", "Anywhere that's convenient", "On the patient's bed"],
        correctIndex: 1,
        rationale: "Bag technique: Keep nursing bags off the floor using a clean barrier (towel/mat).",
      },
      {
        id: "GAO013-Q5",
        stem: "How many links are in the chain of infection, and how many must you break to prevent infection?",
        options: ["6 links; break all 6", "6 links; break any 1", "4 links; break any 2", "3 links; break all 3"],
        correctIndex: 1,
        rationale: "The chain of infection has 6 links. Breaking ANY single link prevents infection transmission.",
      },
    ],
    passScore: 80,
  },

  // ═══════════════════════════════════════════════════════════════
  // GAO-014: Bloodborne Pathogen Exposure Control
  // ═══════════════════════════════════════════════════════════════
  {
    id: "GAO-014",
    title: "Bloodborne Pathogen Exposure Control",
    track: "GAO",
    durationMinutes: 35,
    policyMapped: ["OSHA 29 CFR 1910.1030"],
    pages: [
      {
        title: "Bloodborne Pathogens — Overview",
        content: `<h2>Bloodborne Pathogen Exposure Control</h2>
<p>OSHA's Bloodborne Pathogens Standard (<strong>29 CFR 1910.1030</strong>) requires employers to protect employees from occupational exposure to blood and other potentially infectious materials (OPIM).</p>
<div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Key Bloodborne Pathogens:</h3>
<ul>
<li><strong>Hepatitis B (HBV):</strong> Transmitted through blood/body fluids; vaccine available and required</li>
<li><strong>Hepatitis C (HCV):</strong> Most common bloodborne infection in the US; no vaccine</li>
<li><strong>HIV:</strong> Transmitted through blood, semen, vaginal fluids, breast milk</li>
</ul>
</div>
<p><strong>Other Potentially Infectious Materials (OPIM):</strong> Semen, vaginal secretions, cerebrospinal fluid, synovial fluid, pleural fluid, peritoneal fluid, amniotic fluid, saliva in dental procedures, any body fluid visibly contaminated with blood.</p>`,
        narration: "OSHA's Bloodborne Pathogens Standard, 29 CFR 1910.1030, requires employers to protect employees from occupational exposure to blood and other potentially infectious materials. The key bloodborne pathogens are Hepatitis B, which is vaccine-preventable; Hepatitis C, the most common bloodborne infection in the US with no vaccine; and HIV. Other potentially infectious materials include semen, vaginal secretions, cerebrospinal fluid, and any body fluid visibly contaminated with blood.",
      },
      {
        title: "Exposure Prevention",
        content: `<h2>Engineering & Work Practice Controls</h2>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Engineering Controls (reduce exposure at the source):</h3>
<ul>
<li><strong>Safety-engineered sharps:</strong> Use needles with safety mechanisms; never use conventional needles when safety alternatives exist</li>
<li><strong>Sharps containers:</strong> Use puncture-resistant, labeled containers; do NOT overfill</li>
<li><strong>Self-sheathing needles:</strong> Activate safety mechanism immediately after use</li>
</ul>
</div>
<div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Work Practice Controls (change HOW you perform tasks):</h3>
<ul>
<li><strong>Never recap needles</strong> — use one-handed scoop technique ONLY if absolutely necessary</li>
<li><strong>Never bend, break, or shear needles</strong></li>
<li><strong>Place sharps in containers immediately after use</strong> — not on the bedside table "for now"</li>
<li><strong>Minimize splashing, spraying, and aerosolizing</strong> blood/OPIM</li>
<li><strong>Hand hygiene</strong> immediately after removing gloves</li>
</ul>
</div>`,
        narration: "Prevention uses two types of controls. Engineering controls reduce exposure at the source: use safety-engineered sharps, puncture-resistant sharps containers that are not overfilled, and activate safety mechanisms immediately after use. Work practice controls change how you perform tasks: never recap needles, never bend or break needles, place sharps in containers immediately, minimize splashing and spraying of blood, and perform hand hygiene immediately after removing gloves.",
      },
      {
        title: "Post-Exposure Protocol",
        content: `<h2>What to Do If You Are Exposed</h2>
<div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #EF4444;">
<h3>⚠️ IMMEDIATE Post-Exposure Steps:</h3>
<ol>
<li><strong>Wash the area immediately:</strong>
<ul>
<li>Needlestick/cut: Wash with soap and water for 5 minutes</li>
<li>Mucous membrane (eyes, nose, mouth): Flush with water for 15 minutes</li>
<li>Non-intact skin: Wash with soap and water</li>
</ul></li>
<li><strong>Report to your supervisor IMMEDIATELY</strong></li>
<li><strong>Seek medical evaluation within 2 hours</strong> — post-exposure prophylaxis (PEP) is time-sensitive</li>
<li><strong>Complete an incident report</strong> (HR-WM-004)</li>
<li><strong>Source patient testing</strong> — the agency will coordinate with the patient's physician</li>
<li><strong>Follow-up testing</strong> — at baseline, 6 weeks, 12 weeks, and 6 months</li>
</ol>
</div>
<p><strong>TIME IS CRITICAL.</strong> HIV PEP must start within 72 hours (ideally within 2 hours) to be effective.</p>`,
        narration: "If you are exposed, take immediate action. For a needlestick or cut, wash with soap and water for 5 minutes. For mucous membrane exposure, flush with water for 15 minutes. Report to your supervisor immediately. Seek medical evaluation within 2 hours because post-exposure prophylaxis is time-sensitive. Complete an incident report. Source patient testing will be coordinated. Follow-up testing occurs at baseline, 6 weeks, 12 weeks, and 6 months. Time is critical — HIV PEP must start within 72 hours, ideally within 2 hours.",
      },
      {
        title: "Hepatitis B Vaccination",
        content: `<h2>Hepatitis B Vaccination Requirement</h2>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;">
<h3>OSHA Requirements:</h3>
<ul>
<li>Hepatitis B vaccine must be <strong>offered free of charge</strong> to all employees with occupational exposure risk</li>
<li>Offered within <strong>10 working days</strong> of initial assignment</li>
<li>Three-dose series: 0, 1 month, 6 months</li>
<li>Employees may decline but must sign a <strong>declination form</strong></li>
<li>Employees who initially decline can request the vaccine later at no cost</li>
</ul>
</div>
<p>The Hepatitis B vaccine is one of the most effective vaccines available — over 95% protection after the complete series.</p>`,
        narration: "OSHA requires the Hepatitis B vaccine be offered free to all employees with occupational exposure risk, within 10 working days of assignment. It's a three-dose series at zero, one month, and six months. Employees may decline but must sign a declination form, and can request the vaccine later at no cost. The vaccine provides over 95 percent protection after the complete series.",
      },
      {
        title: "Module Summary",
        content: `<h2>Module Summary — GAO-014</h2>
<div style="background:#E0F7FA;padding:16px;border-radius:8px;">
<ul>
<li>Key BBPs: HBV (vaccine available), HCV (no vaccine), HIV</li>
<li>Engineering controls: safety sharps, sharps containers, self-sheathing needles</li>
<li>Work practice: never recap needles, immediate sharps disposal, hand hygiene after gloves</li>
<li>Post-exposure: wash/flush immediately → report → medical eval within 2 hours → incident report</li>
<li>HIV PEP is time-critical — within 72 hours, ideally 2 hours</li>
<li>HBV vaccine offered free within 10 days of assignment</li>
</ul>
</div>`,
        narration: "To summarize: The key bloodborne pathogens are HBV, HCV, and HIV. Use engineering and work practice controls to prevent exposure. In a post-exposure event, wash immediately, report, seek medical evaluation within 2 hours, and complete an incident report. HIV PEP is time-critical. And the HBV vaccine must be offered free within 10 days of assignment.",
      },
    ],
    exam: [
      {
        id: "GAO014-Q1",
        stem: "After a needlestick injury, the FIRST thing you should do is:",
        options: ["File an incident report", "Call your supervisor", "Wash the area with soap and water for 5 minutes", "Continue caring for the patient"],
        correctIndex: 2,
        rationale: "Immediate washing is step 1 — then report to supervisor and seek medical evaluation.",
      },
      {
        id: "GAO014-Q2",
        stem: "Post-exposure prophylaxis (PEP) for HIV must ideally be started within:",
        options: ["24 hours", "2 hours", "1 week", "72 hours (but ideally 2 hours)"],
        correctIndex: 3,
        rationale: "HIV PEP must start within 72 hours but is most effective when started within 2 hours.",
      },
      {
        id: "GAO014-Q3",
        stem: "OSHA requires the Hepatitis B vaccine to be offered within how many working days of assignment?",
        options: ["5 days", "10 days", "30 days", "90 days"],
        correctIndex: 1,
        rationale: "The HBV vaccine must be offered within 10 working days of initial assignment to at-risk duties.",
      },
      {
        id: "GAO014-Q4",
        stem: "Which of the following is NEVER acceptable?",
        options: ["Using safety-engineered sharps", "Placing sharps in containers immediately after use", "Recapping a used needle with both hands", "Activating the safety mechanism on a needle after use"],
        correctIndex: 2,
        rationale: "Never recap needles — especially not with both hands. This is a primary cause of needlestick injuries.",
      },
      {
        id: "GAO014-Q5",
        stem: "Follow-up testing after a bloodborne pathogen exposure occurs at:",
        options: ["Only if symptoms develop", "Baseline, 6 weeks, 12 weeks, and 6 months", "One time at 6 months", "Annually for 5 years"],
        correctIndex: 1,
        rationale: "Follow-up testing occurs at baseline, 6 weeks, 12 weeks, and 6 months post-exposure.",
      },
    ],
    passScore: 80,
  },
];



const GAO_MODULES_PART2: TrainingModule[] = [
  // ═══════════════════════════════════════════════════════════════
  // GAO-015: Emergency Preparedness
  // ═══════════════════════════════════════════════════════════════
  {
    id: "GAO-015",
    title: "Emergency Preparedness — Plan, Role & Communications",
    track: "GAO",
    durationMinutes: 35,
    policyMapped: ["OP-FM-005", "CL-PR-005"],
    regulatoryBasis: "42 CFR § 484.102",
    pages: [
      {
        title: "Emergency Preparedness Overview",
        content: `<h2>Emergency Preparedness — 42 CFR § 484.102</h2>
<p>CMS requires every home health agency to maintain a comprehensive <strong>Emergency Preparedness Program</strong> addressing natural disasters, pandemics, infrastructure failures, and security incidents.</p>
<div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #EF4444;">
<strong>Four Required Elements (CMS Emergency Preparedness Rule):</strong>
<ol>
<li><strong>Emergency Plan:</strong> Risk assessment, strategies, continuity of operations</li>
<li><strong>Policies & Procedures:</strong> Subsistence, shelter, patient tracking, evacuation, alternate care</li>
<li><strong>Communication Plan:</strong> Staff notification, patient notification, coordination with authorities</li>
<li><strong>Training & Testing:</strong> Annual training + 2 drills/year (1 may be tabletop)</li>
</ol>
</div>
<p>As a home health worker, you must know <strong>your specific role</strong> in the agency's emergency plan — not just that one exists.</p>`,
        narration: "CMS requires every home health agency to maintain a comprehensive Emergency Preparedness Program under 42 CFR Section 484.102. Four elements are required: an emergency plan with risk assessment, policies covering subsistence and evacuation, a communication plan for staff and patients, and annual training plus two drills per year. You must know your specific role in the emergency plan.",
      },
      {
        title: "Your Role in Emergencies",
        content: `<h2>Your Emergency Responsibilities</h2>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;">
<h3>During ANY Emergency:</h3>
<ol>
<li><strong>Ensure your own safety first</strong> — you cannot help patients if you are incapacitated</li>
<li><strong>Check your phone/email</strong> for agency emergency communications</li>
<li><strong>Contact the agency hotline</strong> per the communication plan</li>
<li><strong>Account for your assigned patients</strong> — prioritize high-acuity and technology-dependent patients</li>
<li><strong>Follow agency instructions</strong> — do NOT freelance emergency response</li>
<li><strong>Document everything</strong> — patient contacts, status, actions taken</li>
</ol>
</div>
<h3>Patient Prioritization During Emergencies:</h3>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
<tr style="background:#EF4444;color:white;"><td style="padding:10px;"><strong>Priority 1:</strong></td><td style="padding:10px;">Ventilator/oxygen-dependent, IV therapy, unstable conditions</td></tr>
<tr style="background:#F59E0B;color:white;"><td style="padding:10px;"><strong>Priority 2:</strong></td><td style="padding:10px;">Wound care, insulin-dependent, recent surgery</td></tr>
<tr style="background:#10B981;color:white;"><td style="padding:10px;"><strong>Priority 3:</strong></td><td style="padding:10px;">Stable chronic conditions, PT/OT in progress</td></tr>
</table>`,
        narration: "During any emergency, ensure your own safety first. Check for agency communications and contact the agency hotline. Account for your assigned patients, prioritizing high-acuity and technology-dependent patients first. Follow agency instructions — do not freelance your response. Document everything including patient contacts and actions taken. Patients are triaged: Priority 1 includes ventilator-dependent and unstable patients, Priority 2 includes wound care and insulin-dependent patients, and Priority 3 includes stable chronic conditions.",
      },
      {
        title: "Communication During Emergencies",
        content: `<h2>Emergency Communication Plan</h2>
<div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Communication Chain:</h3>
<ul>
<li><strong>Administrator</strong> activates the emergency plan and leads agency response</li>
<li><strong>DON</strong> coordinates clinical response and patient prioritization</li>
<li><strong>Supervisors</strong> contact their assigned staff via call tree</li>
<li><strong>You</strong> respond to check-in, report your status, and await instructions</li>
</ul>
</div>
<h3>What You Must Know:</h3>
<ul>
<li>Your supervisor's contact information (primary + backup)</li>
<li>The agency emergency hotline number</li>
<li>How to access the patient priority list for your caseload</li>
<li>Alternate communication methods if phones/internet are down</li>
<li>Local emergency management contact information</li>
</ul>`,
        narration: "The emergency communication chain starts with the Administrator activating the plan, the DON coordinating clinical response, supervisors contacting staff via call tree, and you responding to check-in with your status. You must know your supervisor's contact information, the agency emergency hotline, how to access your caseload priority list, alternate communication methods, and local emergency management contacts.",
      },
      {
        title: "Module Summary",
        content: `<h2>Module Summary — GAO-015</h2>
<div style="background:#E0F7FA;padding:16px;border-radius:8px;">
<ul>
<li>CMS requires 4 emergency preparedness elements under § 484.102</li>
<li>Know YOUR specific role — ensure safety, check-in, account for patients, follow instructions</li>
<li>Prioritize patients: technology-dependent → acute needs → stable conditions</li>
<li>2 drills per year required — participation is mandatory and documented</li>
<li>Know the communication chain and your supervisor's backup contacts</li>
</ul>
</div>`,
        narration: "In summary: CMS requires four emergency preparedness elements. Know your specific role. Prioritize technology-dependent patients first. Participate in both annual drills. And memorize the communication chain including backup contacts.",
      },
    ],
    exam: [
      { id: "GAO015-Q1", stem: "How many emergency preparedness drills does CMS require per year?", options: ["1", "2", "4", "Monthly"], correctIndex: 1, rationale: "CMS requires 2 drills per year; one may be a tabletop exercise.", regulatoryRef: "42 CFR § 484.102" },
      { id: "GAO015-Q2", stem: "Which patients should be contacted FIRST during an emergency?", options: ["Patients closest to your location", "Technology-dependent and unstable patients (Priority 1)", "Patients scheduled for visits that day", "All patients simultaneously"], correctIndex: 1, rationale: "Priority 1 patients (ventilator, O2-dependent, unstable) are contacted first." },
      { id: "GAO015-Q3", stem: "During an emergency, your FIRST action should be:", options: ["Contact all assigned patients", "Ensure your own safety", "Drive to the office", "Start documenting"], correctIndex: 1, rationale: "Ensure your own safety first — you cannot help patients if incapacitated." },
      { id: "GAO015-Q4", stem: "Who activates the agency's emergency preparedness plan?", options: ["Any staff member", "The Administrator", "The DON only", "FEMA"], correctIndex: 1, rationale: "The Administrator activates the emergency plan and leads agency response." },
      { id: "GAO015-Q5", stem: "Emergency drill participation is:", options: ["Optional but recommended", "Required for clinical staff only", "Mandatory for all staff and documented", "Only required in the first year"], correctIndex: 2, rationale: "Drill participation is mandatory for all staff with documented attendance." },
    ],
    passScore: 80,
  },

  // ═══════════════════════════════════════════════════════════════
  // GAO-016: Personal Safety During Home Visits
  // ═══════════════════════════════════════════════════════════════
  {
    id: "GAO-016",
    title: "Personal Safety During Home Visits",
    track: "GAO",
    durationMinutes: 30,
    policyMapped: ["RM-SS-001"],
    pages: [
      {
        title: "Home Visit Safety Awareness",
        content: `<h2>Personal Safety — RM-SS-001</h2>
<p>Home health clinicians work <strong>alone in unfamiliar environments</strong>. Unlike hospital settings, you do not have security personnel, controlled access, or colleagues nearby. Your safety depends on <strong>awareness, preparation, and protocol adherence</strong>.</p>
<div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Risk Factors in Home Health:</h3>
<ul>
<li>Unfamiliar neighborhoods and isolated locations</li>
<li>Aggressive pets or household members</li>
<li>Substance abuse in the home</li>
<li>Unsanitary or structurally unsafe environments</li>
<li>Weapons in the home</li>
<li>Driving in variable weather and traffic conditions</li>
</ul>
</div>`,
        narration: "Home health clinicians work alone in unfamiliar environments without security or nearby colleagues. Your safety depends on awareness, preparation, and protocol adherence. Risk factors include unfamiliar neighborhoods, aggressive pets or household members, substance abuse, unsafe environments, weapons in the home, and driving conditions.",
      },
      {
        title: "Before, During, and After Visits",
        content: `<h2>Safety Protocol — Before, During & After</h2>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:12px 0;">
<h3>Before the Visit:</h3>
<ul>
<li>Review the patient record for any safety alerts or precautions</li>
<li>Ensure your phone is charged and GPS is working</li>
<li>Share your schedule with the office — they should know where you are</li>
<li>Park in a well-lit area facing outward for quick exit</li>
<li>Assess the neighborhood before exiting your vehicle</li>
</ul>
</div>
<div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:12px 0;">
<h3>During the Visit:</h3>
<ul>
<li>Keep your belongings with you — don't leave your bag/keys in another room</li>
<li>Position yourself between the patient and the exit</li>
<li>Trust your instincts — if you feel unsafe, leave and report</li>
<li>Do not challenge aggressive behavior — de-escalate or exit</li>
</ul>
</div>
<div style="background:#FFF3E0;padding:16px;border-radius:8px;margin:12px 0;">
<h3>After the Visit:</h3>
<ul>
<li>Check-in with the office upon leaving the patient's home</li>
<li>Report any safety concerns for future visits</li>
<li>Document environmental hazards in the patient record</li>
</ul>
</div>`,
        narration: "Before a visit, review safety alerts, ensure your phone is charged, share your schedule, park facing outward, and assess the neighborhood. During the visit, keep belongings with you, position yourself near the exit, trust your instincts, and de-escalate rather than confront aggression. After the visit, check in with the office, report safety concerns, and document environmental hazards.",
      },
      {
        title: "When to Leave",
        content: `<h2>When to Leave — Your Right and Obligation</h2>
<div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #EF4444;">
<h3>⚠️ Leave Immediately If:</h3>
<ul>
<li>You feel physically threatened by anyone in the home</li>
<li>Active violence or domestic disturbance is occurring</li>
<li>Active substance use is occurring and you feel unsafe</li>
<li>Weapons are visible and you feel threatened</li>
<li>The environment poses an immediate health risk (gas leak, structural collapse)</li>
</ul>
<p><strong>Your safety takes priority over the visit.</strong> Leave, then report to your supervisor immediately. The agency will coordinate alternate arrangements.</p>
</div>`,
        narration: "You have the right and obligation to leave immediately if you feel physically threatened, if violence is occurring, if active substance use makes you unsafe, if weapons are visible and threatening, or if the environment is immediately dangerous. Your safety takes priority over the visit. Leave first, then report to your supervisor immediately.",
      },
      {
        title: "Module Summary",
        content: `<h2>Module Summary — GAO-016</h2>
<div style="background:#E0F7FA;padding:16px;border-radius:8px;">
<ul>
<li>Home health workers face unique safety risks — preparation is essential</li>
<li>Before: review alerts, charged phone, share schedule, park strategically</li>
<li>During: stay near exits, keep belongings close, trust instincts</li>
<li>After: check-in, report concerns, document hazards</li>
<li><strong>Leave immediately if you feel unsafe — your safety comes first</strong></li>
</ul>
</div>`,
        narration: "In summary: Preparation is essential for home visit safety. Follow before, during, and after protocols. And always leave immediately if you feel unsafe — your safety is the top priority.",
      },
    ],
    exam: [
      { id: "GAO016-Q1", stem: "When parking for a home visit, you should:", options: ["Park as close to the home as possible", "Park in a well-lit area facing outward for quick exit", "Park in the driveway", "It doesn't matter where you park"], correctIndex: 1, rationale: "Park facing outward in a well-lit area for quick exit if needed." },
      { id: "GAO016-Q2", stem: "During a visit, you notice the patient's family member is becoming increasingly agitated and aggressive. You should:", options: ["Confront the behavior directly", "De-escalate or exit — do not challenge aggressive behavior", "Ignore it and continue the visit", "Call 911 from the patient's kitchen"], correctIndex: 1, rationale: "De-escalate or exit. Do not challenge aggressive behavior." },
      { id: "GAO016-Q3", stem: "Your safety during a home visit is:", options: ["Secondary to completing the visit", "The agency's responsibility, not yours", "Your top priority — leave if you feel unsafe", "Only a concern in high-crime areas"], correctIndex: 2, rationale: "Your safety always takes priority over completing the visit." },
      { id: "GAO016-Q4", stem: "Where should you position yourself during a home visit?", options: ["In the room farthest from the door", "Between the patient and the exit", "Wherever the patient tells you to sit", "It doesn't matter"], correctIndex: 1, rationale: "Position yourself between the patient and the exit for safety." },
      { id: "GAO016-Q5", stem: "After leaving a patient's home, you should:", options: ["Drive to the next patient immediately", "Check in with the office", "Wait 30 minutes before calling in", "Only check in if there was a problem"], correctIndex: 1, rationale: "Check in with the office upon leaving every patient's home." },
    ],
    passScore: 80,
  },

  // ═══════════════════════════════════════════════════════════════
  // GAO-017: Workplace Violence Prevention
  // ═══════════════════════════════════════════════════════════════
  {
    id: "GAO-017",
    title: "Workplace Violence Prevention",
    track: "GAO",
    durationMinutes: 30,
    policyMapped: ["RM-SS-002"],
    pages: [
      {
        title: "Workplace Violence in Healthcare",
        content: `<h2>Workplace Violence Prevention — RM-SS-002</h2>
<p>Healthcare workers face <strong>4x higher rates</strong> of workplace violence than other industries. Home health workers are especially vulnerable because they work alone in patients' homes.</p>
<div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Types of Workplace Violence:</h3>
<ul>
<li><strong>Type I — Criminal intent:</strong> Robbery, assault by someone with no relationship to the agency</li>
<li><strong>Type II — Patient/visitor:</strong> Violence from patients, family members, or visitors (MOST COMMON in healthcare)</li>
<li><strong>Type III — Worker-on-worker:</strong> Violence between employees</li>
<li><strong>Type IV — Personal relationship:</strong> Domestic violence that spills into the workplace</li>
</ul>
</div>
<p>Care Indeed has a <strong>zero-tolerance policy</strong> for workplace violence. All threats, incidents, and near-misses must be reported.</p>`,
        narration: "Healthcare workers face four times higher rates of workplace violence than other industries. There are four types: criminal intent from strangers, patient or visitor violence which is the most common in healthcare, worker-on-worker violence, and personal relationship violence. Care Indeed has zero tolerance for workplace violence. All threats, incidents, and near-misses must be reported.",
      },
      {
        title: "De-escalation & Response",
        content: `<h2>De-escalation Techniques</h2>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;">
<h3>De-escalation Steps:</h3>
<ol>
<li><strong>Stay calm</strong> — lower your voice, slow your speech</li>
<li><strong>Listen actively</strong> — acknowledge the person's feelings without arguing</li>
<li><strong>Maintain safe distance</strong> — at least arm's length, don't corner yourself</li>
<li><strong>Use open body language</strong> — uncrossed arms, palms visible, non-threatening posture</li>
<li><strong>Offer choices</strong> — "Would you like to take a break?" gives them control</li>
<li><strong>Set limits calmly</strong> — "I want to help you, but I can't stay if I feel unsafe"</li>
<li><strong>Exit if escalation continues</strong> — leave and call for help</li>
</ol>
</div>
<div style="background:#FBE9E7;padding:12px;border-radius:8px;margin:12px 0;">
<strong>Never:</strong> Argue, threaten, touch an aggressive person, turn your back on them, or try to physically restrain them (unless trained and authorized).
</div>`,
        narration: "De-escalation follows seven steps: stay calm with a low voice, listen actively and acknowledge feelings, maintain safe distance, use open body language, offer choices to give them control, set calm limits, and exit if escalation continues. Never argue, threaten, touch an aggressive person, turn your back, or attempt physical restraint unless trained and authorized.",
      },
      {
        title: "Module Summary",
        content: `<h2>Module Summary — GAO-017</h2>
<div style="background:#E0F7FA;padding:16px;border-radius:8px;">
<ul>
<li>Healthcare workers face 4x higher violence rates; home health workers are especially vulnerable</li>
<li>Four types of violence — Type II (patient/visitor) is most common in healthcare</li>
<li>De-escalation: stay calm, listen, maintain distance, offer choices, exit if needed</li>
<li>Zero tolerance — report ALL threats, incidents, and near-misses</li>
</ul>
</div>`,
        narration: "In summary: Healthcare workers face elevated violence risk. Type II patient and visitor violence is most common. Use de-escalation techniques. And report all incidents under the zero-tolerance policy.",
      },
    ],
    exam: [
      { id: "GAO017-Q1", stem: "The most common type of workplace violence in healthcare is:", options: ["Type I — Criminal intent", "Type II — Patient/visitor", "Type III — Worker-on-worker", "Type IV — Personal relationship"], correctIndex: 1, rationale: "Type II (patient/visitor violence) is the most common in healthcare settings." },
      { id: "GAO017-Q2", stem: "During de-escalation, you should:", options: ["Argue your point to show authority", "Lower your voice and acknowledge the person's feelings", "Turn your back and walk away silently", "Physically restrain the person"], correctIndex: 1, rationale: "Stay calm, lower voice, acknowledge feelings — key de-escalation techniques." },
      { id: "GAO017-Q3", stem: "Care Indeed's policy on workplace violence is:", options: ["Tolerance for first offenses", "Zero tolerance — all incidents and threats must be reported", "Only physical violence is reportable", "Only report if you are injured"], correctIndex: 1, rationale: "Zero tolerance — report ALL threats, incidents, and near-misses." },
      { id: "GAO017-Q4", stem: "When should you exit a potentially violent situation?", options: ["Only after the patient is stabilized", "If de-escalation fails and you feel unsafe", "Only if your supervisor authorizes it", "Never — completing the visit is priority"], correctIndex: 1, rationale: "Exit when de-escalation fails — your safety is the priority." },
      { id: "GAO017-Q5", stem: "Open body language during de-escalation includes:", options: ["Crossed arms and stern expression", "Hands in pockets", "Uncrossed arms, palms visible, non-threatening posture", "Pointing at the person"], correctIndex: 2, rationale: "Open, non-threatening body language helps de-escalate tension." },
    ],
    passScore: 80,
  },

  // ═══════════════════════════════════════════════════════════════
  // GAO-018: Workplace Injury Reporting
  // ═══════════════════════════════════════════════════════════════
  {
    id: "GAO-018",
    title: "Workplace Injury Reporting",
    track: "GAO",
    durationMinutes: 30,
    policyMapped: ["HR-WM-004"],
    pages: [
      {
        title: "Reporting Workplace Injuries",
        content: `<h2>Workplace Injury Reporting — HR-WM-004</h2>
<p>All workplace injuries, illnesses, and exposures must be reported <strong>immediately</strong> regardless of severity. This includes injuries sustained during home visits, driving between patients, or at the office.</p>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Reporting Steps:</h3>
<ol>
<li>Seek immediate medical attention if needed (call 911 for emergencies)</li>
<li>Report to your supervisor within 1 hour</li>
<li>Complete an incident/injury report form the same day</li>
<li>Workers' compensation claim initiated by HR within 24 hours</li>
<li>Follow up with occupational health as directed</li>
</ol>
</div>
<div style="background:#FBE9E7;padding:12px;border-radius:8px;margin:12px 0;">
<strong>Common home health injuries:</strong> Needlestick injuries, back injuries from patient transfers, slip/trip/fall in patient homes, vehicle accidents, dog bites, exposure to infectious agents.
</div>`,
        narration: "All workplace injuries must be reported immediately regardless of severity. Seek medical attention first if needed, report to your supervisor within 1 hour, complete the incident report the same day, workers' compensation is initiated within 24 hours, and follow up with occupational health. Common home health injuries include needlesticks, back injuries, falls, vehicle accidents, dog bites, and infectious exposures.",
      },
      {
        title: "Module Summary",
        content: `<h2>Module Summary — GAO-018</h2>
<div style="background:#E0F7FA;padding:16px;border-radius:8px;">
<ul>
<li>Report ALL injuries immediately — within 1 hour to supervisor</li>
<li>Complete incident report the same day</li>
<li>Workers' comp initiated within 24 hours by HR</li>
<li>Seek medical attention first when needed</li>
<li>Includes injuries during home visits, driving, and office work</li>
</ul>
</div>`,
        narration: "In summary: Report all injuries within 1 hour. Complete the incident report same day. Workers' compensation starts within 24 hours. And always seek medical attention first when needed.",
      },
    ],
    exam: [
      { id: "GAO018-Q1", stem: "How quickly must you report a workplace injury to your supervisor?", options: ["By end of shift", "Within 1 hour", "Within 24 hours", "Within 1 week"], correctIndex: 1, rationale: "Report to supervisor within 1 hour of the injury." },
      { id: "GAO018-Q2", stem: "The incident report should be completed:", options: ["Within 1 week", "The same day as the injury", "Only if you seek medical treatment", "At the next staff meeting"], correctIndex: 1, rationale: "Incident reports must be completed the same day." },
      { id: "GAO018-Q3", stem: "Workplace injury reporting applies to:", options: ["Only injuries requiring hospitalization", "Only injuries at the office", "All injuries including those during home visits and driving", "Only clinical injuries"], correctIndex: 2, rationale: "Reporting covers all injuries — home visits, driving, office work." },
      { id: "GAO018-Q4", stem: "If you are seriously injured during a home visit, your FIRST action is:", options: ["Complete the incident report", "Call your supervisor", "Seek immediate medical attention / call 911", "Finish the patient visit"], correctIndex: 2, rationale: "Medical attention comes first — then report." },
      { id: "GAO018-Q5", stem: "Workers' compensation claims are initiated by HR within:", options: ["1 hour", "24 hours", "1 week", "30 days"], correctIndex: 1, rationale: "HR initiates workers' comp within 24 hours of the reported injury." },
    ],
    passScore: 80,
  },

  // ═══════════════════════════════════════════════════════════════
  // GAO-019: Anti-Harassment & Non-Discrimination
  // ═══════════════════════════════════════════════════════════════
  {
    id: "GAO-019",
    title: "Anti-Harassment & Non-Discrimination",
    track: "GAO",
    durationMinutes: 35,
    policyMapped: ["HR-ER-004"],
    pages: [
      {
        title: "Zero Tolerance Policy",
        content: `<h2>Anti-Harassment & Non-Discrimination — HR-ER-004</h2>
<p>Care Indeed maintains a <strong>zero-tolerance policy</strong> for harassment and discrimination. This applies to all employees, contractors, patients, and visitors.</p>
<div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Protected Categories (Federal + California):</h3>
<p>Race, color, national origin, religion, sex, gender identity, sexual orientation, age (40+), disability, pregnancy, marital status, military/veteran status, genetic information, medical condition, and any other category protected by state or local law.</p>
</div>
<h3>Types of Harassment:</h3>
<ul>
<li><strong>Quid Pro Quo:</strong> Employment benefits conditioned on sexual favors</li>
<li><strong>Hostile Work Environment:</strong> Conduct so severe/pervasive it creates an intimidating or offensive work environment</li>
</ul>
<div style="background:#FBE9E7;padding:12px;border-radius:8px;margin:12px 0;">
<strong>California AB 1825/SB 1343:</strong> Requires 2 hours of harassment prevention training for supervisors and 1 hour for non-supervisory employees every 2 years.
</div>`,
        narration: "Care Indeed has zero tolerance for harassment and discrimination covering all protected categories under federal and California law. This includes race, sex, gender identity, age, disability, and many other categories. Harassment includes quid pro quo, where employment benefits are conditioned on favors, and hostile work environment, where conduct is severe enough to create an intimidating atmosphere. California law requires 2 hours of training for supervisors and 1 hour for employees every 2 years.",
      },
      {
        title: "Reporting & Investigation",
        content: `<h2>How to Report Harassment</h2>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Reporting Channels:</h3>
<ul>
<li>Your direct supervisor (unless they are the harasser)</li>
<li>HR Director</li>
<li>Administrator</li>
<li>Compliance hotline (anonymous)</li>
<li>External: California DFEH / Federal EEOC</li>
</ul>
</div>
<p><strong>Investigation begins within 5 business days.</strong> Both parties are interviewed. Confidentiality is maintained to the extent possible. Retaliation is prohibited and itself a terminable offense.</p>
<p><strong>Bystander obligation:</strong> If you witness harassment, you have an obligation to report it — even if the victim does not.</p>`,
        narration: "Report harassment to your supervisor, HR Director, Administrator, the compliance hotline, or externally to the California DFEH or EEOC. Investigation begins within 5 business days. Confidentiality is maintained. Retaliation is prohibited and terminable. If you witness harassment, you have a bystander obligation to report it even if the victim does not.",
      },
      {
        title: "Module Summary",
        content: `<h2>Module Summary — GAO-019</h2>
<div style="background:#E0F7FA;padding:16px;border-radius:8px;">
<ul>
<li>Zero tolerance for harassment and discrimination — all protected categories</li>
<li>Two types: quid pro quo and hostile work environment</li>
<li>California requires specific training hours (2 hrs supervisors, 1 hr employees)</li>
<li>Report to supervisor, HR, Administrator, hotline, or external agencies</li>
<li>Bystander obligation: report what you witness</li>
<li>Retaliation = terminable offense</li>
</ul>
</div>`,
        narration: "In summary: Zero tolerance covers all protected categories. Understand quid pro quo and hostile work environment. California mandates training hours. Multiple reporting channels exist. Report what you witness as a bystander. Retaliation is terminable.",
      },
    ],
    exam: [
      { id: "GAO019-Q1", stem: "Quid pro quo harassment involves:", options: ["Offensive jokes in the workplace", "Employment benefits conditioned on sexual favors", "Disagreements between coworkers", "Constructive criticism from a supervisor"], correctIndex: 1, rationale: "Quid pro quo = employment benefits conditioned on sexual favors." },
      { id: "GAO019-Q2", stem: "California law requires non-supervisory employees to complete harassment prevention training every:", options: ["1 year", "2 years", "5 years", "Only at hire"], correctIndex: 1, rationale: "SB 1343 requires 1 hour every 2 years for non-supervisory employees." },
      { id: "GAO019-Q3", stem: "If you witness harassment but the victim doesn't report it, you should:", options: ["Respect their decision and stay silent", "Report it — you have a bystander obligation", "Only report if it happens again", "Talk to the harasser privately"], correctIndex: 1, rationale: "Bystanders have an obligation to report witnessed harassment." },
      { id: "GAO019-Q4", stem: "Retaliation against someone who reports harassment is:", options: ["Understandable if the report is false", "A terminable offense", "Only prohibited for supervisors", "Not covered by agency policy"], correctIndex: 1, rationale: "Retaliation is prohibited and is itself a terminable offense." },
      { id: "GAO019-Q5", stem: "How quickly does a harassment investigation begin after a report?", options: ["Immediately same day", "Within 5 business days", "Within 30 days", "At the next HR meeting"], correctIndex: 1, rationale: "Investigations begin within 5 business days of the report." },
    ],
    passScore: 80,
  },

  // ═══════════════════════════════════════════════════════════════
  // GAO-020 through GAO-027: Remaining General Orientation
  // Condensed modules — each with 2-3 pages + 5 exam questions
  // ═══════════════════════════════════════════════════════════════
  {
    id: "GAO-020",
    title: "Substance Abuse / Drug-Free Workplace",
    track: "GAO", durationMinutes: 30, policyMapped: ["HR-ER-005"],
    pages: [
      { title: "Drug-Free Workplace Policy", content: `<h2>Drug-Free Workplace — HR-ER-005</h2><p>Care Indeed maintains a drug-free workplace. Reporting to work under the influence of alcohol, illegal drugs, or misused prescription medications is prohibited. Testing may occur pre-employment, for-cause (reasonable suspicion), post-accident, and random (where legally permitted).</p><div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;"><h3>Consequences:</h3><ul><li>Positive test or refusal to test = disciplinary action up to termination</li><li>For-cause testing when supervisor documents specific observable behaviors</li><li>Employees may self-refer to EAP for assistance without automatic discipline</li></ul></div>`, narration: "Care Indeed maintains a drug-free workplace. Working under the influence of alcohol, illegal drugs, or misused prescriptions is prohibited. Testing may occur pre-employment, for-cause, post-accident, and randomly. Positive results lead to discipline up to termination. Employees may self-refer to the Employee Assistance Program for help." },
      { title: "Module Summary", content: `<h2>Summary — GAO-020</h2><div style="background:#E0F7FA;padding:16px;border-radius:8px;"><ul><li>Drug-free workplace — zero tolerance for impairment on duty</li><li>Testing: pre-employment, for-cause, post-accident, random</li><li>Self-referral to EAP is encouraged and not automatically disciplinary</li></ul></div>`, narration: "In summary: zero tolerance for impairment. Multiple testing types. EAP self-referral is encouraged." },
    ],
    exam: [
      { id: "GAO020-Q1", stem: "For-cause drug testing is triggered by:", options: ["Random selection", "Documented observable behaviors suggesting impairment", "Annual physical exam", "Employee request"], correctIndex: 1, rationale: "For-cause testing requires documented specific observable behaviors." },
      { id: "GAO020-Q2", stem: "Refusing a drug test is treated as:", options: ["No consequence", "Equivalent to a positive result", "A request for EAP referral", "A personal choice"], correctIndex: 1, rationale: "Refusal to test = treated as positive result with disciplinary consequences." },
      { id: "GAO020-Q3", stem: "Self-referring to EAP for substance abuse assistance:", options: ["Results in automatic termination", "Is encouraged and not automatically disciplinary", "Requires supervisor approval", "Is only available after a positive test"], correctIndex: 1, rationale: "Self-referral to EAP is encouraged without automatic discipline." },
      { id: "GAO020-Q4", stem: "Reporting to work under the influence of prescription medication that impairs function is:", options: ["Acceptable with a doctor's note", "Prohibited under the drug-free workplace policy", "Only prohibited for clinical staff", "The employee's personal decision"], correctIndex: 1, rationale: "Impairment is impairment regardless of the substance source." },
      { id: "GAO020-Q5", stem: "Drug testing may occur at which of these times?", options: ["Only pre-employment", "Pre-employment, for-cause, post-accident, and random", "Only when an employee requests it", "Only annually"], correctIndex: 1, rationale: "Testing may occur pre-employment, for-cause, post-accident, and random." },
    ],
    passScore: 80,
  },
  {
    id: "GAO-021",
    title: "Disciplinary Process Overview",
    track: "GAO", durationMinutes: 30, policyMapped: ["HR-ER-002"],
    pages: [
      { title: "Progressive Discipline", content: `<h2>Disciplinary Process — HR-ER-002</h2><p>Care Indeed follows a <strong>progressive discipline</strong> model: verbal counseling → written warning → final written warning → suspension → termination. However, <strong>serious offenses may result in immediate termination</strong> without progression.</p><div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;"><h3>Immediate Termination Offenses Include:</h3><ul><li>Patient abuse, neglect, or exploitation</li><li>HIPAA violation with malicious intent</li><li>Falsification of records or credentials</li><li>Theft</li><li>Working under the influence</li><li>Violence or threats of violence</li><li>OIG/SAM exclusion</li></ul></div><p>All disciplinary actions are documented and placed in the personnel file. Employees may respond in writing.</p>`, narration: "Care Indeed uses progressive discipline from verbal counseling through termination. Serious offenses such as patient abuse, malicious HIPAA violations, record falsification, theft, impairment, violence, or exclusion may result in immediate termination. All actions are documented and employees may respond in writing." },
      { title: "Module Summary", content: `<h2>Summary — GAO-021</h2><div style="background:#E0F7FA;padding:16px;border-radius:8px;"><ul><li>Progressive: verbal → written → final → suspension → termination</li><li>Serious offenses may skip to immediate termination</li><li>All actions documented; employee may respond in writing</li></ul></div>`, narration: "Summary: Progressive discipline with documentation. Serious offenses may result in immediate termination." },
    ],
    exam: [
      { id: "GAO021-Q1", stem: "Progressive discipline at Care Indeed follows this order:", options: ["Written warning → Termination", "Verbal → Written → Final Written → Suspension → Termination", "Suspension → Warning → Termination", "Counseling → Termination"], correctIndex: 1, rationale: "The standard progression is verbal → written → final written → suspension → termination." },
      { id: "GAO021-Q2", stem: "Which offense may result in IMMEDIATE termination without progressive steps?", options: ["Being late to a meeting", "Patient abuse", "Forgetting to sign a form", "Minor documentation error"], correctIndex: 1, rationale: "Patient abuse is a serious offense warranting immediate termination." },
      { id: "GAO021-Q3", stem: "An employee who receives disciplinary action:", options: ["Has no right to respond", "May respond in writing", "Must accept the action without comment", "Should contact a lawyer immediately"], correctIndex: 1, rationale: "Employees may respond in writing to any disciplinary action." },
      { id: "GAO021-Q4", stem: "Falsification of clinical records may result in:", options: ["Verbal counseling", "Written warning only", "Immediate termination", "Retraining only"], correctIndex: 2, rationale: "Falsification of records is a serious offense = immediate termination." },
      { id: "GAO021-Q5", stem: "Where are disciplinary actions documented?", options: ["Supervisor's personal notes only", "The employee's personnel file", "The compliance hotline log", "Nowhere — they are verbal only"], correctIndex: 1, rationale: "All disciplinary actions are documented in the personnel file." },
    ],
    passScore: 80,
  },
  {
    id: "GAO-022",
    title: "Employee Grievance Process",
    track: "GAO", durationMinutes: 30, policyMapped: ["HR-ER-003"],
    pages: [
      { title: "Filing a Grievance", content: `<h2>Grievance Process — HR-ER-003</h2><p>Employees have the right to raise workplace concerns through a formal grievance process. Grievances may address working conditions, policy application, discipline disagreements, or interpersonal conflicts.</p><div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;"><h3>Steps:</h3><ol><li><strong>Informal resolution</strong> — discuss with supervisor first</li><li><strong>Written grievance</strong> — submit to HR Director within 10 business days</li><li><strong>HR review</strong> — investigation and response within 15 business days</li><li><strong>Appeal</strong> — to Administrator within 5 business days of HR decision</li><li><strong>Final decision</strong> — Administrator's decision is final</li></ol></div><p><strong>No retaliation</strong> for filing a grievance in good faith.</p>`, narration: "Employees can raise workplace concerns through the formal grievance process. Start with informal supervisor discussion, then submit a written grievance to HR within 10 business days. HR responds within 15 business days. Appeals go to the Administrator within 5 days. The Administrator's decision is final. No retaliation for good-faith grievances." },
      { title: "Module Summary", content: `<h2>Summary — GAO-022</h2><div style="background:#E0F7FA;padding:16px;border-radius:8px;"><ul><li>Informal resolution first → Written grievance → HR review → Appeal to Administrator</li><li>Written grievance within 10 business days; HR responds within 15</li><li>No retaliation for good-faith grievances</li></ul></div>`, narration: "Summary: Start informally, escalate formally. HR responds within 15 days. No retaliation." },
    ],
    exam: [
      { id: "GAO022-Q1", stem: "The first step in the grievance process is:", options: ["Filing a written complaint with HR", "Calling a lawyer", "Informal resolution with your supervisor", "Contacting the Governing Body"], correctIndex: 2, rationale: "Start with informal resolution with your supervisor." },
      { id: "GAO022-Q2", stem: "Written grievances must be submitted within:", options: ["5 business days", "10 business days", "30 calendar days", "No time limit"], correctIndex: 1, rationale: "Written grievances must be submitted within 10 business days." },
      { id: "GAO022-Q3", stem: "HR must respond to a written grievance within:", options: ["5 business days", "10 business days", "15 business days", "30 business days"], correctIndex: 2, rationale: "HR responds within 15 business days." },
      { id: "GAO022-Q4", stem: "Appeals of the HR decision go to:", options: ["The Governing Body", "The Administrator", "The Compliance Officer", "An outside arbitrator"], correctIndex: 1, rationale: "Appeals go to the Administrator within 5 business days of the HR decision." },
      { id: "GAO022-Q5", stem: "Filing a good-faith grievance results in:", options: ["Automatic negative performance review", "No retaliation — grievances are protected", "Probationary status", "Transfer to a different location"], correctIndex: 1, rationale: "No retaliation for good-faith grievances." },
    ],
    passScore: 80,
  },
  {
    id: "GAO-023",
    title: "IT Acceptable Use — Email & Social Media",
    track: "GAO", durationMinutes: 30, policyMapped: ["IT-UP-001", "IT-UP-002", "IT-UP-003"],
    pages: [
      { title: "IT Acceptable Use", content: `<h2>IT Acceptable Use — IT-UP-001 through IT-UP-003</h2><p>Agency technology resources (computers, email, phones, internet) are for <strong>business purposes</strong>. Limited personal use is permitted if it doesn't interfere with work or violate policy.</p><div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;"><h3>Prohibited:</h3><ul><li>Accessing inappropriate content (pornography, hate speech, gambling)</li><li>Installing unauthorized software</li><li>Using agency email for personal business ventures</li><li>Sharing confidential information via personal email or social media</li><li>Posting about patients, cases, or proprietary information on social media</li><li>Using agency logos or representing the agency without authorization</li></ul></div><div style="background:#E8F5E9;padding:12px;border-radius:8px;margin:12px 0;"><strong>Social media rule:</strong> Never post patient information, photos, or any content that could identify a patient. Even "de-identified" posts can violate HIPAA if the patient can be identified from context.</div>`, narration: "Agency technology is for business purposes. Prohibited activities include accessing inappropriate content, installing unauthorized software, sharing confidential information on personal channels, and posting about patients on social media. Never post any content that could identify a patient — even supposedly de-identified posts can violate HIPAA." },
      { title: "Module Summary", content: `<h2>Summary — GAO-023</h2><div style="background:#E0F7FA;padding:16px;border-radius:8px;"><ul><li>Agency technology = business use; limited personal use acceptable</li><li>Never share PHI via personal email or social media</li><li>Never post patient-identifiable content on any platform</li><li>No unauthorized software installation</li></ul></div>`, narration: "Summary: Business use for technology. Never share PHI on personal channels or social media. No unauthorized software." },
    ],
    exam: [
      { id: "GAO023-Q1", stem: "Posting a 'de-identified' patient story on your personal social media:", options: ["Is acceptable since no name is used", "May still violate HIPAA if the patient can be identified from context", "Is allowed with supervisor permission", "Is only a problem if the patient complains"], correctIndex: 1, rationale: "Even de-identified posts can violate HIPAA if context allows identification." },
      { id: "GAO023-Q2", stem: "Installing personal software on an agency computer is:", options: ["Allowed if it's free software", "Prohibited without IT authorization", "Your personal choice", "Only prohibited for games"], correctIndex: 1, rationale: "No unauthorized software installation on agency devices." },
      { id: "GAO023-Q3", stem: "Sending patient information via your personal Gmail is:", options: ["Acceptable in emergencies", "Always prohibited — use agency encrypted email", "Okay if you delete it afterward", "Acceptable for non-sensitive information"], correctIndex: 1, rationale: "PHI must never be sent via personal email — always use encrypted agency systems." },
      { id: "GAO023-Q4", stem: "Limited personal use of agency technology is:", options: ["Strictly prohibited", "Permitted if it doesn't interfere with work or violate policy", "Unlimited", "Only during lunch breaks"], correctIndex: 1, rationale: "Limited personal use is permitted if it doesn't interfere with work or violate policy." },
      { id: "GAO023-Q5", stem: "Using agency logos on personal social media without authorization is:", options: ["Fine for promoting the company", "Prohibited per IT-UP-003", "Acceptable for LinkedIn only", "Encouraged for marketing"], correctIndex: 1, rationale: "Representing the agency on social media requires authorization." },
    ],
    passScore: 80,
  },
  {
    id: "GAO-024",
    title: "Security Awareness — Phishing & Passwords",
    track: "GAO", durationMinutes: 30, policyMapped: ["IT-UP-004"],
    competencyMethod: "Phishing simulation",
    pages: [
      { title: "Phishing & Social Engineering", content: `<h2>Security Awareness — IT-UP-004</h2><p><strong>Phishing</strong> is the #1 method attackers use to breach healthcare organizations. It uses deceptive emails, texts, or calls to trick you into revealing credentials, clicking malicious links, or downloading malware.</p><div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;"><h3>Red Flags:</h3><ul><li>Urgent tone: "Your account will be locked in 24 hours!"</li><li>Sender address doesn't match the organization</li><li>Generic greeting: "Dear User" instead of your name</li><li>Suspicious links (hover to check before clicking)</li><li>Unexpected attachments</li><li>Requests for credentials, SSN, or financial information</li></ul></div><div style="background:#E8F5E9;padding:12px;border-radius:8px;margin:12px 0;"><strong>If you suspect phishing:</strong> Do NOT click links or open attachments. Report to IT immediately. Forward the suspicious email to the IT security team.</div>`, narration: "Phishing is the number one attack method in healthcare. It uses deceptive messages to trick you into revealing credentials or clicking malicious links. Red flags include urgent language, mismatched sender addresses, generic greetings, suspicious links, unexpected attachments, and credential requests. If you suspect phishing, do not click anything — report to IT immediately." },
      { title: "Module Summary", content: `<h2>Summary — GAO-024</h2><div style="background:#E0F7FA;padding:16px;border-radius:8px;"><ul><li>Phishing = #1 healthcare breach method</li><li>Check for red flags: urgency, sender mismatch, suspicious links</li><li>Never click suspicious links or open unexpected attachments</li><li>Report phishing to IT immediately</li><li>This module includes a phishing simulation assessment</li></ul></div>`, narration: "Summary: Phishing is the top threat. Check red flags. Never click suspicious content. Report to IT." },
    ],
    exam: [
      { id: "GAO024-Q1", stem: "The #1 method attackers use to breach healthcare organizations is:", options: ["Physical break-in", "Phishing emails", "USB drives", "Insider threats"], correctIndex: 1, rationale: "Phishing is the #1 attack vector in healthcare." },
      { id: "GAO024-Q2", stem: "A red flag for a phishing email includes:", options: ["The email is from a known colleague about a scheduled meeting", "Urgent language threatening account lockout with a suspicious link", "A routine company newsletter", "An email from IT about a planned system update"], correctIndex: 1, rationale: "Urgent threats with suspicious links are classic phishing indicators." },
      { id: "GAO024-Q3", stem: "If you receive a suspicious email, you should:", options: ["Click the link to verify if it's real", "Forward it to colleagues to check", "Report it to IT without clicking links or attachments", "Delete it silently"], correctIndex: 2, rationale: "Report to IT immediately without interacting with the email content." },
      { id: "GAO024-Q4", stem: "Hovering over a link in an email helps you:", options: ["Activate the link safely", "See the actual URL destination before clicking", "Scan the link for viruses", "Send the link to IT automatically"], correctIndex: 1, rationale: "Hovering reveals the actual destination URL to check for legitimacy." },
      { id: "GAO024-Q5", stem: "An email asks you to 'verify your password by clicking here.' This is:", options: ["Standard IT procedure", "Likely a phishing attempt — legitimate IT never asks for passwords via email", "Safe if it comes from an internal email address", "Required for annual security compliance"], correctIndex: 1, rationale: "Legitimate IT departments never ask for passwords via email." },
    ],
    passScore: 80,
  },
  {
    id: "GAO-025",
    title: "Documentation Standards Overview",
    track: "GAO", durationMinutes: 30, policyMapped: ["CL-CD-001"],
    pages: [
      { title: "Clinical Documentation Principles", content: `<h2>Documentation Standards — CL-CD-001</h2><p>In home health, <strong>"if it wasn't documented, it didn't happen."</strong> Documentation is the legal record of care, the basis for reimbursement, and the primary evidence surveyors review.</p><div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;"><h3>Documentation Must Be:</h3><ul><li><strong>Accurate:</strong> Reflects what actually occurred</li><li><strong>Complete:</strong> All required elements are addressed</li><li><strong>Timely:</strong> Completed at the point of care or same day</li><li><strong>Legible:</strong> Readable by anyone who accesses the record</li><li><strong>Objective:</strong> Facts and measurements, not opinions</li><li><strong>Patient-specific:</strong> Individualized, not template boilerplate</li></ul></div><div style="background:#FBE9E7;padding:12px;border-radius:8px;margin:12px 0;"><strong>Never:</strong> Pre-date, post-date, copy-paste without review, use prohibited abbreviations, document care you didn't provide, or alter records after the fact without proper amendment procedures.</div>`, narration: "In home health, if it wasn't documented, it didn't happen. Documentation must be accurate, complete, timely, legible, objective, and patient-specific. Never pre-date or post-date, copy-paste without review, use prohibited abbreviations, document care you didn't provide, or alter records improperly." },
      { title: "Module Summary", content: `<h2>Summary — GAO-025</h2><div style="background:#E0F7FA;padding:16px;border-radius:8px;"><ul><li>"If it wasn't documented, it didn't happen"</li><li>Accurate, complete, timely, legible, objective, patient-specific</li><li>Document at point of care or same day</li><li>Never falsify, pre/post-date, or alter without proper amendment</li></ul></div>`, narration: "Summary: Documentation is the legal record. Follow the six standards. Complete at point of care. Never falsify." },
    ],
    exam: [
      { id: "GAO025-Q1", stem: "The most important principle of clinical documentation is:", options: ["Making it as brief as possible", "If it wasn't documented, it didn't happen", "Using as many abbreviations as possible", "Copying notes from previous visits"], correctIndex: 1, rationale: "The cardinal rule of documentation in healthcare." },
      { id: "GAO025-Q2", stem: "Documentation should be completed:", options: ["Within 1 week of the visit", "At the point of care or same day", "During the next staff meeting", "When you have free time"], correctIndex: 1, rationale: "Timely documentation means at the point of care or same day." },
      { id: "GAO025-Q3", stem: "Copy-pasting from a previous visit note is:", options: ["Always acceptable for efficiency", "Prohibited unless reviewed and individualized for the current visit", "Required for consistency", "Only acceptable for HHAs"], correctIndex: 1, rationale: "Copy-paste must be reviewed and individualized — template boilerplate is unacceptable." },
      { id: "GAO025-Q4", stem: "To correct an error in a clinical record, you should:", options: ["Delete the original entry", "Use white-out", "Follow proper amendment procedures per policy", "Create a new record from scratch"], correctIndex: 2, rationale: "Follow proper amendment procedures — never delete or obscure original entries." },
      { id: "GAO025-Q5", stem: "Documenting care you did NOT provide is:", options: ["Acceptable if it was on the care plan", "Falsification — grounds for immediate termination and potential fraud", "Okay if you planned to do it", "Only a problem if audited"], correctIndex: 1, rationale: "Documenting unperformed care is falsification — terminable and potentially criminal." },
    ],
    passScore: 80,
  },
  {
    id: "GAO-026",
    title: "Time & Attendance",
    track: "GAO", durationMinutes: 30, policyMapped: [],
    pages: [
      { title: "Time & Attendance", content: `<h2>Time & Attendance</h2><p>Accurate time reporting is essential for payroll, compliance, and productivity tracking.</p><div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;"><h3>Key Rules:</h3><ul><li>Clock in/out for all shifts using the designated system</li><li>Record actual time worked — no rounding or estimates</li><li>Overtime requires prior supervisor approval</li><li>Report absences to your supervisor as early as possible per policy</li><li>Falsifying time records = disciplinary action up to termination</li><li>Meal and rest breaks per California law (30-min meal by 5th hour; 10-min rest per 4 hours)</li></ul></div>`, narration: "Accurate time reporting is required. Clock in and out using the designated system. Record actual time, not estimates. Get prior approval for overtime. Report absences early. Falsifying time records is terminable. Follow California meal and rest break requirements." },
      { title: "Module Summary", content: `<h2>Summary — GAO-026</h2><div style="background:#E0F7FA;padding:16px;border-radius:8px;"><ul><li>Record actual time worked — no falsification</li><li>Overtime requires prior approval</li><li>California: 30-min meal by 5th hour, 10-min rest per 4 hours</li></ul></div>`, narration: "Summary: Accurate time reporting. Prior overtime approval. California break laws." },
    ],
    exam: [
      { id: "GAO026-Q1", stem: "Overtime at Care Indeed requires:", options: ["No approval needed", "Prior supervisor approval", "Only DON approval", "Administrator approval only"], correctIndex: 1, rationale: "Overtime requires prior supervisor approval." },
      { id: "GAO026-Q2", stem: "California law requires a meal break by the:", options: ["3rd hour", "4th hour", "5th hour", "6th hour"], correctIndex: 2, rationale: "California requires a 30-minute meal break by the 5th hour." },
      { id: "GAO026-Q3", stem: "Falsifying time records results in:", options: ["Verbal warning", "Disciplinary action up to termination", "Pay reduction", "Retraining only"], correctIndex: 1, rationale: "Time falsification = disciplinary action up to termination." },
      { id: "GAO026-Q4", stem: "You should report an absence:", options: ["After your shift ends", "As early as possible per policy", "Only if it's more than one day", "Via text to a coworker"], correctIndex: 1, rationale: "Report absences to your supervisor as early as possible." },
      { id: "GAO026-Q5", stem: "Rest breaks in California are:", options: ["Not required", "10 minutes per every 4 hours worked", "30 minutes per every 4 hours", "Only for full-time employees"], correctIndex: 1, rationale: "California requires a 10-minute rest break per 4 hours worked." },
    ],
    passScore: 80,
  },
  {
    id: "GAO-027",
    title: "Benefits Overview & Enrollment",
    track: "GAO", durationMinutes: 30, policyMapped: [],
    pages: [
      { title: "Benefits Overview", content: `<h2>Benefits Overview & Enrollment</h2><p>Care Indeed offers a comprehensive benefits package to eligible employees.</p><div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;"><h3>Benefit Categories:</h3><ul><li><strong>Health insurance:</strong> Medical, dental, vision — enrollment within 30 days of hire</li><li><strong>Paid time off (PTO):</strong> Accrued based on tenure and position</li><li><strong>Workers' compensation:</strong> Coverage for work-related injuries</li><li><strong>Employee Assistance Program (EAP):</strong> Confidential counseling and support</li><li><strong>Continuing education support:</strong> Per HR-TD-002</li><li><strong>Retirement plan:</strong> If applicable, per plan documents</li></ul></div><p>Detailed benefits information is available from HR. <strong>Enrollment deadlines are firm</strong> — missing the 30-day window requires waiting for open enrollment.</p>`, narration: "Care Indeed offers comprehensive benefits including health insurance, PTO, workers' compensation, EAP, continuing education support, and retirement plans. Enroll within 30 days of hire — missing the deadline means waiting for open enrollment." },
      { title: "Module Summary", content: `<h2>Summary — GAO-027</h2><div style="background:#E0F7FA;padding:16px;border-radius:8px;"><ul><li>Health insurance enrollment: within 30 days of hire</li><li>PTO accrual based on tenure</li><li>EAP: confidential counseling available</li><li>CE support per HR-TD-002</li></ul></div>`, narration: "Summary: Enroll in benefits within 30 days. EAP is available. CE support provided." },
    ],
    exam: [
      { id: "GAO027-Q1", stem: "Health insurance enrollment must occur within:", options: ["10 days of hire", "30 days of hire", "60 days of hire", "Any time during the year"], correctIndex: 1, rationale: "Enrollment within 30 days of hire; otherwise wait for open enrollment." },
      { id: "GAO027-Q2", stem: "The Employee Assistance Program provides:", options: ["Financial bonuses", "Confidential counseling and support services", "Extra vacation days", "Medical equipment"], correctIndex: 1, rationale: "EAP provides confidential counseling and support." },
      { id: "GAO027-Q3", stem: "Missing the 30-day enrollment window means:", options: ["HR makes an exception", "Waiting for the next open enrollment period", "Automatic enrollment at the basic level", "No benefits for the entire year"], correctIndex: 1, rationale: "Missed deadlines require waiting for open enrollment." },
      { id: "GAO027-Q4", stem: "PTO accrual is based on:", options: ["Job title only", "Tenure and position", "Number of patients seen", "Supervisor discretion"], correctIndex: 1, rationale: "PTO accrues based on tenure and position." },
      { id: "GAO027-Q5", stem: "Workers' compensation covers:", options: ["Personal injuries at home", "Work-related injuries and illnesses", "All medical expenses regardless of cause", "Only injuries requiring hospitalization"], correctIndex: 1, rationale: "Workers' comp covers work-related injuries and illnesses." },
    ],
    passScore: 80,
  },

  // ═══════════════════════════════════════════════════════════════
  // GAO-EXAM: Comprehensive General Orientation Final Exam
  // ═══════════════════════════════════════════════════════════════
  {
    id: "GAO-EXAM",
    title: "General Orientation — Comprehensive Final Exam",
    track: "GAO", durationMinutes: 45, policyMapped: ["HR-TA-005 Appendix D"],
    pages: [
      { title: "Final Exam Instructions", content: `<h2>General Orientation Competency Exam</h2><div style="background:#FFF3E0;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #F59E0B;"><h3>📋 Exam Details:</h3><ul><li><strong>20 questions</strong> covering all 27 orientation modules</li><li><strong>Pass score: 80% (16/20)</strong></li><li>Per HR-TA-005 Appendix D</li><li>Failure: remedial review + retake within 3 business days</li><li>Maximum 3 attempts before supervisor escalation</li></ul></div><div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;"><h3>Topics Covered:</h3><p>Mission/Values, Org Structure, Compliance, HIPAA (Privacy/Security/Breach), Patient Rights, Advance Directives, Abuse/Neglect Reporting, Infection Prevention, BBP Exposure, Emergency Preparedness, Safety, Workplace Violence, Anti-Harassment, Documentation, IT Security</p></div><p style="text-align:left;font-size:18px;font-weight:700;margin-top:24px;">When ready, proceed to the exam. Good luck! 🍀</p>`, narration: "This is the General Orientation Comprehensive Final Exam — 20 questions covering all 27 orientation modules. You need 80 percent to pass. Failure requires remedial review and retake within 3 business days. Maximum 3 attempts. Topics span mission and values through IT security. When you're ready, proceed." },
    ],
    exam: [
      { id: "GAOEXAM-Q1", stem: "Care Indeed's mission centers on:", options: ["Revenue maximization", "Patient-centered, evidence-based home health services", "Expanding to hospital-based care", "Competing with other agencies"], correctIndex: 1, rationale: "Mission: patient-centered, evidence-based home health services." },
      { id: "GAOEXAM-Q2", stem: "The Governing Body's primary responsibility is:", options: ["Direct patient care", "Full legal authority and responsibility for agency operations", "Hiring all clinical staff", "Marketing the agency"], correctIndex: 1, rationale: "Per § 484.105(a), the Governing Body has full legal authority." },
      { id: "GAOEXAM-Q3", stem: "The OIG compliance program has how many required elements?", options: ["5", "7", "10", "3"], correctIndex: 1, rationale: "Seven elements of an effective compliance program." },
      { id: "GAOEXAM-Q4", stem: "HIPAA's Minimum Necessary Standard requires:", options: ["Sharing all PHI for thoroughness", "Limiting access/disclosure to what's needed for the purpose", "Minimum documentation in charts", "Using the smallest files possible"], correctIndex: 1, rationale: "Minimum Necessary = limit access/disclosure to what's needed." },
      { id: "GAOEXAM-Q5", stem: "A suspected HIPAA breach must be reported within:", options: ["24 hours", "1 hour", "1 week", "End of shift"], correctIndex: 1, rationale: "Report suspected breaches within 1 hour." },
      { id: "GAOEXAM-Q6", stem: "Patients must be informed of their rights:", options: ["At discharge", "Before or during the first visit", "Within 30 days", "Only if they ask"], correctIndex: 1, rationale: "Per § 484.50, rights communicated before/during first visit." },
      { id: "GAOEXAM-Q7", stem: "If no advance directive is on file and a patient is unresponsive:", options: ["Assume DNR", "Presume full code — initiate CPR and call 911", "Wait for physician orders", "Ask the family"], correctIndex: 1, rationale: "No directive = presume full code." },
      { id: "GAOEXAM-Q8", stem: "As a mandatory reporter, you need ___ to report suspected abuse:", options: ["Concrete proof", "Reasonable suspicion", "A confession", "Physical evidence"], correctIndex: 1, rationale: "Reasonable suspicion triggers the mandatory reporting obligation." },
      { id: "GAOEXAM-Q9", stem: "Standard precautions apply to:", options: ["Only diagnosed patients", "ALL patients regardless of diagnosis", "Only patients on isolation", "Only during procedures"], correctIndex: 1, rationale: "Standard precautions = universal for all patients." },
      { id: "GAOEXAM-Q10", stem: "The correct PPE doffing order starts with:", options: ["Mask", "Gown", "Gloves", "Eye protection"], correctIndex: 2, rationale: "Doff gloves first (most contaminated)." },
      { id: "GAOEXAM-Q11", stem: "After a needlestick, HIV PEP should ideally start within:", options: ["2 hours", "24 hours", "1 week", "72 hours only"], correctIndex: 0, rationale: "HIV PEP ideally within 2 hours (must be within 72)." },
      { id: "GAOEXAM-Q12", stem: "CMS requires how many emergency drills per year?", options: ["1", "2", "4", "Monthly"], correctIndex: 1, rationale: "2 drills per year per § 484.102." },
      { id: "GAOEXAM-Q13", stem: "During a home visit, if you feel unsafe you should:", options: ["Complete the visit quickly", "Leave immediately — your safety comes first", "Call your supervisor from the home", "Wait for the situation to resolve"], correctIndex: 1, rationale: "Leave immediately — safety is the top priority." },
      { id: "GAOEXAM-Q14", stem: "Workplace violence is most commonly Type:", options: ["I — Criminal", "II — Patient/visitor", "III — Worker-on-worker", "IV — Personal"], correctIndex: 1, rationale: "Type II (patient/visitor) is most common in healthcare." },
      { id: "GAOEXAM-Q15", stem: "Whistleblower protection applies to reports made in:", options: ["Writing only", "Good faith", "Anonymously only", "Within 24 hours"], correctIndex: 1, rationale: "Good-faith reports are protected." },
      { id: "GAOEXAM-Q16", stem: "Falsifying clinical documentation may result in:", options: ["Verbal counseling", "Retraining", "Immediate termination and potential criminal liability", "Written warning"], correctIndex: 2, rationale: "Falsification = immediate termination + potential fraud prosecution." },
      { id: "GAOEXAM-Q17", stem: "The False Claims Act penalizes:", options: ["Incomplete charting", "Submitting false claims to federal programs", "Late documentation", "Missing training deadlines"], correctIndex: 1, rationale: "FCA penalizes submitting false claims to Medicare/Medicaid." },
      { id: "GAOEXAM-Q18", stem: "A lost agency laptop must be reported to IT within:", options: ["24 hours", "1 hour", "End of day", "1 week"], correctIndex: 1, rationale: "Report within 1 hour for remote wipe capability." },
      { id: "GAOEXAM-Q19", stem: "Phishing emails are best identified by:", options: ["Professional formatting", "Urgent language, suspicious links, mismatched sender", "Short length", "Lack of images"], correctIndex: 1, rationale: "Red flags: urgency, suspicious links, sender mismatch." },
      { id: "GAOEXAM-Q20", stem: "Anti-harassment training in California is required every:", options: ["1 year", "2 years", "5 years", "Only at hire"], correctIndex: 1, rationale: "CA SB 1343: every 2 years." },
    ],
    passScore: 80,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION K: ROLE-SPECIFIC TRACKS — ALL 11 ROLES
// Each module: 30-45 min, 3-6 pages, 5-question final exam
// ─────────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════
// ADMINISTRATOR TRACK (ADM-001 through ADM-015)
// Condensed: 5 composite modules covering all 15 topics
// ═══════════════════════════════════════════════════════════════

const ADM_MODULES: TrainingModule[] = [
  {
    id: "ADM-001", title: "Governing Body Structure, Authority & Bylaws", track: "ADM", durationMinutes: 35, policyMapped: ["GV-GB-001"],
    pages: [
      { title: "Governing Body Authority", content: `<h2>ADM-001: Governing Body</h2><p>As Administrator, you are appointed by and accountable to the Governing Body. Per 42 CFR § 484.105(b), you are responsible for day-to-day operations while the Governing Body maintains ultimate legal authority.</p><div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;"><h3>Key Knowledge Areas:</h3><ul><li>Bylaws structure, amendment procedures, meeting requirements</li><li>Governing Body composition and quorum rules</li><li>Your appointment authority and delegation limits</li><li>Annual evaluation of agency performance by Governing Body</li><li>Documentation requirements: meeting minutes, resolutions, policy approvals</li></ul></div>`, narration: "As Administrator, you are appointed by and accountable to the Governing Body. You must understand bylaws, composition, quorum rules, your delegation limits, annual performance evaluation, and documentation requirements." },
      { title: "Administrator Authority & Delegations", content: `<h2>Your Authority & Its Limits</h2><div style="background:#FFF3E0;padding:16px;border-radius:8px;margin:16px 0;"><h3>Per GV-GB-001 § 6.2.2:</h3><ul><li>You organize and direct all ongoing agency functions</li><li>You employ qualified personnel and ensure training compliance</li><li>You implement policies approved by the Governing Body</li><li>You may delegate tasks but NOT accountability</li><li>You serve as liaison between the Governing Body and day-to-day operations</li></ul><h3>Cannot Delegate:</h3><ul><li>Final hiring/termination decisions for key positions</li><li>Regulatory compliance oversight</li><li>Survey response leadership</li><li>Governing Body reporting obligations</li></ul></div>`, narration: "Your authority includes directing agency functions, employing staff, and implementing policies. You may delegate tasks but never accountability. Final decisions on key hires, compliance oversight, survey response, and Governing Body reporting cannot be delegated." },
      { title: "Module Summary", content: `<h2>Summary — ADM-001</h2><div style="background:#E0F7FA;padding:16px;border-radius:8px;"><ul><li>Governing Body = ultimate legal authority; Administrator = day-to-day operations</li><li>Know bylaws, quorum rules, meeting documentation requirements</li><li>Delegate tasks, not accountability</li><li>Maintain liaison with Governing Body</li></ul></div>`, narration: "Summary: Governing Body holds ultimate authority. You manage daily operations. Delegate tasks but not accountability." },
    ],
    exam: [
      { id: "ADM001-Q1", stem: "The Administrator is appointed by:", options: ["The DON", "The Governing Body", "The Compliance Officer", "Self-appointed"], correctIndex: 1, rationale: "Per § 484.105(b), the Governing Body appoints the Administrator." },
      { id: "ADM001-Q2", stem: "The Administrator may delegate:", options: ["Tasks but not accountability", "All responsibilities to the DON", "Governing Body reporting", "Compliance oversight"], correctIndex: 0, rationale: "Tasks can be delegated; accountability remains with the Administrator." },
      { id: "ADM001-Q3", stem: "Governing Body meetings require:", options: ["No documentation", "Meeting minutes and resolutions", "Audio recordings only", "Informal notes"], correctIndex: 1, rationale: "Meeting minutes and resolutions must be maintained as evidence." },
      { id: "ADM001-Q4", stem: "Who holds ultimate legal authority for the agency?", options: ["Administrator", "DON", "Governing Body", "Compliance Officer"], correctIndex: 2, rationale: "Governing Body holds full legal authority per § 484.105(a)." },
      { id: "ADM001-Q5", stem: "Annual evaluation of agency performance is conducted by:", options: ["The Administrator self-evaluates", "The Governing Body", "CMS surveyors only", "The DON"], correctIndex: 1, rationale: "Governing Body evaluates agency performance annually." },
    ],
    passScore: 80,
  },
  {
    id: "ADM-002", title: "Administrator Authorities & Delegations", track: "ADM", durationMinutes: 30, policyMapped: ["GV-GB-001 § 6.2.2"],
    pages: [
      { title: "Delegation Framework", content: `<h2>ADM-002: Delegation & Accountability</h2><p>Effective delegation requires clarity, monitoring, and accountability. As Administrator, you must maintain a <strong>delegation log</strong> documenting what was delegated, to whom, authority limits, and monitoring schedule.</p><div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;"><h3>Case Study:</h3><p>You delegate infection control oversight to the DON. During a survey, the surveyor finds gaps in IP training documentation. Even though the DON was responsible for execution, <strong>you remain accountable</strong> for ensuring the system was in place and monitored.</p></div>`, narration: "Effective delegation requires a log documenting what was delegated, to whom, authority limits, and monitoring. Even when you delegate execution, you remain accountable for system oversight." },
    ],
    exam: [
      { id: "ADM002-Q1", stem: "A delegation log should include:", options: ["Only the delegate's name", "Task, delegate, authority limits, and monitoring schedule", "Just the date of delegation", "Nothing formal is needed"], correctIndex: 1, rationale: "Delegation logs must be comprehensive: task, delegate, limits, monitoring." },
      { id: "ADM002-Q2", stem: "If a delegated task results in a survey deficiency:", options: ["Only the delegate is responsible", "The Administrator remains accountable", "Neither party is responsible", "CMS penalizes the Governing Body only"], correctIndex: 1, rationale: "The Administrator is accountable even for delegated tasks." },
      { id: "ADM002-Q3", stem: "Which cannot be delegated by the Administrator?", options: ["Staff scheduling", "Supply ordering", "Final compliance oversight", "Meeting coordination"], correctIndex: 2, rationale: "Regulatory compliance oversight cannot be delegated." },
      { id: "ADM002-Q4", stem: "Monitoring delegated tasks requires:", options: ["Trust that the delegate will perform", "Regular check-ins and documentation", "Annual review only", "No specific process"], correctIndex: 1, rationale: "Regular monitoring with documentation ensures delegated tasks are completed." },
      { id: "ADM002-Q5", stem: "The purpose of delegation is:", options: ["To avoid accountability", "To distribute workload while maintaining oversight", "To reduce your responsibilities", "To shift blame"], correctIndex: 1, rationale: "Delegation distributes workload while Administrator maintains oversight and accountability." },
    ],
    passScore: 80,
  },
  {
    id: "ADM-003", title: "Corporate Compliance Program — Detailed", track: "ADM", durationMinutes: 35, policyMapped: ["CO-CP-001", "CO-CP-002"],
    pages: [
      { title: "Administrator Compliance Oversight", content: `<h2>ADM-003: Compliance Program Oversight</h2><p>As Administrator, you oversee the entire compliance program. You work closely with the Compliance Officer but maintain ultimate operational responsibility.</p><div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;"><h3>Your Compliance Responsibilities:</h3><ul><li>Ensure the Compliance Officer has sufficient authority and resources</li><li>Review compliance reports and audit findings</li><li>Approve corrective action plans for identified deficiencies</li><li>Report compliance program status to the Governing Body</li><li>Ensure all seven OIG elements are actively maintained</li><li>Foster a culture where employees report concerns without fear</li></ul></div>`, narration: "As Administrator, you oversee the compliance program and work with the Compliance Officer. You ensure they have resources, review audit findings, approve corrective actions, report to the Governing Body, maintain all seven OIG elements, and foster a reporting culture." },
    ],
    exam: [
      { id: "ADM003-Q1", stem: "The Administrator's role in compliance is:", options: ["The same as the Compliance Officer", "Operational oversight and ensuring the CO has resources", "Only involved when violations occur", "Advisory only"], correctIndex: 1, rationale: "The Administrator provides operational oversight and ensures the CO has sufficient resources." },
      { id: "ADM003-Q2", stem: "Compliance program status is reported to:", options: ["Employees only", "The Governing Body", "External auditors only", "No one — it's confidential"], correctIndex: 1, rationale: "Administrator reports compliance status to the Governing Body." },
      { id: "ADM003-Q3", stem: "Corrective action plans for audit findings are approved by:", options: ["The employee who committed the violation", "The Administrator", "Only the Compliance Officer", "CMS directly"], correctIndex: 1, rationale: "The Administrator approves corrective action plans." },
      { id: "ADM003-Q4", stem: "A 'culture of compliance' means:", options: ["Punishing every minor error", "Employees feel safe reporting concerns without fear", "Only senior staff follow compliance rules", "Compliance is optional for experienced staff"], correctIndex: 1, rationale: "A compliance culture encourages reporting without fear of retaliation." },
      { id: "ADM003-Q5", stem: "The Compliance Officer must have:", options: ["A law degree", "Sufficient authority and resources to execute the program", "Unlimited budget", "No other responsibilities"], correctIndex: 1, rationale: "The CO needs sufficient authority and resources — ensured by the Administrator." },
    ],
    passScore: 80,
  },
  {
    id: "ADM-004", title: "Compliance Officer Role & Coordination", track: "ADM", durationMinutes: 30, policyMapped: ["CO-CP-002"],
    pages: [{ title: "CO Coordination", content: `<h2>ADM-004: Working with the Compliance Officer</h2><p>The Compliance Officer reports to the Administrator and has direct access to the Governing Body when needed. They are responsible for day-to-day compliance program execution while you provide oversight.</p><div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;"><h3>Coordination Points:</h3><ul><li>Monthly compliance meetings</li><li>Quarterly reporting to Governing Body</li><li>Immediate notification of any OIG/SAM exclusion or fraud allegation</li><li>Joint review of audit findings and corrective actions</li><li>Annual compliance program effectiveness assessment</li></ul></div>`, narration: "The Compliance Officer reports to you and has Governing Body access. Coordinate through monthly meetings, quarterly reports, immediate notifications for serious issues, joint audit reviews, and annual effectiveness assessments." }],
    exam: [
      { id: "ADM004-Q1", stem: "The Compliance Officer reports to:", options: ["The DON", "The Administrator with direct Governing Body access", "HR only", "External counsel"], correctIndex: 1, rationale: "CO reports to Administrator with direct Governing Body access when needed." },
      { id: "ADM004-Q2", stem: "How often should compliance meetings occur?", options: ["Annually", "Monthly", "Only when violations occur", "Quarterly only"], correctIndex: 1, rationale: "Monthly compliance meetings between Administrator and CO." },
      { id: "ADM004-Q3", stem: "An OIG exclusion of an employee requires notification:", options: ["At the next staff meeting", "Immediately — within 24 hours", "Within 30 days", "Only at annual review"], correctIndex: 1, rationale: "OIG/SAM exclusion requires immediate notification per HR-TA-003 § 6.3." },
      { id: "ADM004-Q4", stem: "Annual compliance program effectiveness assessment includes:", options: ["Just checking completion rates", "Comprehensive review of all seven OIG elements", "Only reviewing complaints", "Budget review only"], correctIndex: 1, rationale: "Annual assessment reviews all seven OIG compliance elements." },
      { id: "ADM004-Q5", stem: "Governing Body compliance reports are due:", options: ["Monthly", "Quarterly", "Annually", "Only when requested"], correctIndex: 1, rationale: "Quarterly compliance reporting to the Governing Body." },
    ],
    passScore: 80,
  },
  // ADM-005 through ADM-015 — Remaining Administrator modules
  ...[
    { id: "ADM-005", title: "QAPI Program Governance", pm: ["QA-PG-001"] },
    { id: "ADM-006", title: "Financial Management & Billing Compliance", pm: ["FN-BC-001"] },
    { id: "ADM-007", title: "Risk Management Program", pm: ["RM-ER-001"] },
    { id: "ADM-008", title: "Emergency Operations Plan", pm: ["OP-FM-005"] },
    { id: "ADM-009", title: "HR Oversight — Recruitment, Discipline, Separation", pm: ["HR-TA-001", "HR-ER-002", "HR-ER-006"] },
    { id: "ADM-010", title: "Patient Referral & Intake Management", pm: ["OP-RI-001"] },
    { id: "ADM-011", title: "Plan of Care Oversight", pm: ["CL-CP-001"] },
    { id: "ADM-012", title: "IT Security Program Oversight", pm: ["IT-SC-001"] },
    { id: "ADM-013", title: "Survey Readiness & Deficiency Response", pm: ["QA-AE-002", "QA-AE-003"] },
    { id: "ADM-014", title: "Privacy Program Oversight", pm: ["CO-HP-001"] },
    { id: "ADM-015", title: "Enterprise Policy Taxonomy & Governance", pm: ["EN-TG-001"] },
  ].map((m) => ({
    id: m.id, title: m.title, track: "ADM" as TrackId, durationMinutes: 30, policyMapped: m.pm,
    pages: [
      { title: m.title, content: `<h2>${m.id}: ${m.title}</h2><p>This module covers the Administrator's role in <strong>${m.title.toLowerCase()}</strong> per policies ${m.pm.join(", ")}.</p><div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;"><h3>As Administrator, you must:</h3><ul><li>Understand the regulatory basis and policy framework</li><li>Ensure adequate resources and qualified personnel</li><li>Monitor outcomes and approve corrective actions</li><li>Report status to the Governing Body as required</li><li>Maintain survey-ready documentation at all times</li></ul></div>`, narration: `This module covers the Administrator's role in ${m.title.toLowerCase()} per policies ${m.pm.join(", ")}. You must understand the regulatory framework, ensure resources, monitor outcomes, report to the Governing Body, and maintain survey readiness.` },
    ],
    exam: [
      { id: `${m.id}-Q1`, stem: `The Administrator's primary role in ${m.title.toLowerCase()} is:`, options: ["Direct execution of all tasks", "Oversight, resource allocation, and accountability", "Delegation without monitoring", "Advisory only"], correctIndex: 1, rationale: "The Administrator provides oversight and ensures resources while maintaining accountability." },
      { id: `${m.id}-Q2`, stem: "Survey readiness for this area requires:", options: ["Preparing only when notified of a survey", "Documentation and compliance maintained at ALL times", "Annual review only", "Verbal assurance from staff"], correctIndex: 1, rationale: "Survey readiness means compliance maintained at all times, not just before surveys." },
      { id: `${m.id}-Q3`, stem: "Deficiencies found in this area are reported to:", options: ["No one", "The Governing Body with corrective action plans", "Only the affected department", "External auditors first"], correctIndex: 1, rationale: "Deficiencies reported to Governing Body with corrective action plans." },
      { id: `${m.id}-Q4`, stem: "Resources for this area are ensured by:", options: ["The DON", "The Administrator through budgeting and staffing", "CMS directly", "Individual employees"], correctIndex: 1, rationale: "The Administrator ensures adequate resources through budgeting and staffing." },
      { id: `${m.id}-Q5`, stem: "Monitoring of this area should occur:", options: ["Annually", "On an ongoing basis with regular reporting", "Only during surveys", "When problems arise"], correctIndex: 1, rationale: "Ongoing monitoring with regular reporting — not reactive." },
    ],
    passScore: 80,
  })),
];

// ═══════════════════════════════════════════════════════════════
// HELPER: Generate Role-Specific Module Templates
// Used for DON, RN, LVN, PT, PTA, OT, COTA, SLP, MSW, HHA
// ═══════════════════════════════════════════════════════════════

function generateRoleModule(
  id: string, title: string, track: TrackId, policyMapped: string[],
  contentHtml: string, narration: string, examQuestions: ExamQuestion[],
  duration: number = 30, competencyMethod?: string
): TrainingModule {
  return {
    id, title, track, durationMinutes: duration, policyMapped, competencyMethod,
    pages: [
      { title, content: contentHtml, narration },
      { title: "Key Competencies & Evidence", content: `<h2>${id}: Competency Requirements</h2><div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;"><h3>Competency Evidence Trail:</h3><ul><li>LMS module completion timestamp</li><li>Final exam score (80%+ pass)</li><li>${competencyMethod || "Quiz assessment"}</li><li>Supervisor sign-off per HR-TD-003 Appendix A</li><li>Documented in personnel file for survey readiness</li></ul></div><div style="background:#FFF3E0;padding:12px;border-radius:8px;margin:12px 0;"><strong>Survey Trigger:</strong> CMS surveyors will pull your file and verify completion of this exact training. Your completion record is the agency's evidence.</div>`, narration: `Competency evidence for this module includes LMS completion, exam score, ${competencyMethod || "quiz assessment"}, and supervisor sign-off per HR-TD-003. Your completion record is survey evidence.` },
    ],
    exam: examQuestions,
    passScore: 80,
  };
}

// ═══════════════════════════════════════════════════════════════
// DON TRACK (DON-001 through DON-016)
// ═══════════════════════════════════════════════════════════════

const DON_MODULES: TrainingModule[] = [
  generateRoleModule("DON-001", "Clinical Manager CMS CoP Requirements", "DON", ["§ 484.105(c)", "§ 484.115"],
    `<h2>DON-001: CMS Requirements for the Clinical Manager</h2><p>Per 42 CFR § 484.105(c), you must be a <strong>registered nurse</strong> responsible for <strong>all patient care services</strong>. This is the most clinically critical leadership role in the agency.</p><div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;"><h3>Your CMS-Defined Responsibilities:</h3><ul><li>Supervision of all clinical disciplines: RN, LVN, PT/PTA, OT/COTA, SLP, MSW, HHA</li><li>Ensuring care is delivered per the plan of care</li><li>OASIS accuracy and timely submission</li><li>Clinical documentation compliance</li><li>Competency evaluation program management</li><li>Quality assurance — QAPI clinical measures</li><li>HHA supervisory visit schedule compliance (§ 484.80(h))</li></ul></div>`,
    "As DON, you must be a registered nurse responsible for all patient care services per 42 CFR Section 484.105(c). Your responsibilities include supervising all clinical disciplines, ensuring care per the plan, OASIS accuracy, documentation compliance, competency management, QAPI, and HHA supervision.",
    [
      { id: "DON001-Q1", stem: "The DON must hold which credential?", options: ["LVN", "RN", "NP", "PA"], correctIndex: 1, rationale: "Per § 484.105(c), the DON must be a registered nurse." },
      { id: "DON001-Q2", stem: "The DON is responsible for:", options: ["Only nursing services", "All patient care services across all disciplines", "Only HHA supervision", "Financial management"], correctIndex: 1, rationale: "DON is responsible for ALL patient care services." },
      { id: "DON001-Q3", stem: "HHA supervisory visits must occur every:", options: ["7 days for 30 days", "14 days for 60 days, then every 60 days", "30 days indefinitely", "Only at admission and discharge"], correctIndex: 1, rationale: "Per § 484.80(h): every 14 days for first 60 days, then every 60 days." },
      { id: "DON001-Q4", stem: "OASIS accuracy is the responsibility of:", options: ["Billing department only", "The DON with oversight of all OASIS clinicians", "Only the clinician completing the OASIS", "CMS"], correctIndex: 1, rationale: "The DON has oversight responsibility for OASIS accuracy agency-wide." },
      { id: "DON001-Q5", stem: "The DON's QAPI role includes:", options: ["No involvement in quality", "Leading clinical quality improvement initiatives", "Only attending meetings", "Delegating all quality to staff"], correctIndex: 1, rationale: "The DON leads clinical quality improvement as part of QAPI." },
    ], 35, "Quiz (80%)"),
  ...["DON-002","DON-003","DON-004","DON-005","DON-006","DON-007","DON-008","DON-009","DON-010","DON-011","DON-012","DON-013","DON-014","DON-015","DON-016"].map((id, i) => {
    const titles = ["Clinical Supervision Framework","HHA Supervision Requirements","Plan of Care Development & Physician Orders","OASIS Oversight & Accuracy","Clinical Documentation Standards & Audit","Evidence Hierarchy for Documentation","Competency Evaluation Program Management","QAPI — Clinical Quality Measures, HHQRP","Infection Prevention Program Oversight","Medication Management Oversight","Patient Safety Events — ID, Reporting, RCA","Referral & Intake Clinical Screening","Discharge Planning & Transfer Coordination","EHR System — Clinical Management Functions","Preceptor Program Management"];
    const policies = [["§ 484.115"],["§ 484.80(h)"],["CL-CP-001 through CL-CP-009"],["CL-OA series"],["CL-CD-001 through CL-CD-004"],["CL-OA-006"],["HR-TD-003"],["QA-PG-001"],["CL-SD-016"],["CL-SD-012","CL-SD-013"],["QA-AE-001","QA-AE-002"],["OP-RI-001"],["CL-CP-006","CL-CP-007"],["EHR"],["HR-TA-005 § 6.1.2"]];
    return generateRoleModule(id, titles[i], "DON", policies[i],
      `<h2>${id}: ${titles[i]}</h2><p>This module covers the DON's oversight responsibilities for <strong>${titles[i].toLowerCase()}</strong>.</p><div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;"><h3>Key Areas:</h3><ul><li>Regulatory basis and policy requirements</li><li>Supervision and monitoring responsibilities</li><li>Documentation and evidence requirements</li><li>Common deficiency findings in this area</li><li>Corrective action procedures</li></ul></div>`,
      `This module covers DON oversight of ${titles[i].toLowerCase()} per ${policies[i].join(", ")}.`,
      [
        { id: `${id}-Q1`, stem: `The DON's primary role in ${titles[i].toLowerCase()} is:`, options: ["Direct execution only", "Oversight, quality assurance, and staff competency", "No involvement", "Billing review only"], correctIndex: 1, rationale: "The DON provides oversight and ensures quality across all clinical areas." },
        { id: `${id}-Q2`, stem: "Documentation for this area must be:", options: ["Informal", "Complete, accurate, and survey-ready at all times", "Annual only", "Optional"], correctIndex: 1, rationale: "All clinical documentation must be survey-ready at all times." },
        { id: `${id}-Q3`, stem: "When deficiencies are identified in this area:", options: ["Ignore if minor", "Implement corrective action within defined timeframes", "Wait for survey to address", "Blame the staff member"], correctIndex: 1, rationale: "Corrective actions must be implemented promptly per policy." },
        { id: `${id}-Q4`, stem: "Staff competency in this area is validated through:", options: ["Self-reporting", "HR-TD-003 Appendix A with supervisor verification", "Annual survey only", "No validation needed"], correctIndex: 1, rationale: "Competency validated per HR-TD-003 Appendix A with supervisor sign-off." },
        { id: `${id}-Q5`, stem: "Survey readiness for this area means:", options: ["Preparing when notified", "Continuous compliance with documentation available", "Annual preparation", "Having a plan to address after survey"], correctIndex: 1, rationale: "Survey readiness = continuous compliance, not reactive preparation." },
      ]);
  }),
];

// ═══════════════════════════════════════════════════════════════
// RN TRACK (RN-001 through RN-SUP)
// ═══════════════════════════════════════════════════════════════

const RN_MODULES: TrainingModule[] = [
  generateRoleModule("RN-001", "EHR System — Full Navigation & Documentation", "RN", ["EHR"],
    `<h2>RN-001: EHR System Training</h2><p>As an RN, you will use the Electronic Health Record (EHR) system for <strong>all clinical documentation</strong>. Mastery of this system is essential for care quality, compliance, and reimbursement.</p><div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;"><h3>EHR Competencies Required:</h3><ul><li>Patient chart navigation — demographics, diagnoses, medications, care plan</li><li>Visit documentation — OASIS, clinical notes, physician orders</li><li>Medication reconciliation documentation</li><li>Communication tools — secure messaging, physician notification</li><li>Scheduling and visit verification</li><li>Report generation for quality and compliance</li></ul></div><div style="background:#FBE9E7;padding:12px;border-radius:8px;margin:12px 0;"><strong>⚠️ EHR Rule:</strong> Document at point of care. Never pre-chart or post-chart from memory. Copy-paste is prohibited without individualization.</div>`,
    "As an RN, you must master the EHR for all clinical documentation. Required competencies include chart navigation, visit documentation, medication reconciliation, communication tools, scheduling, and report generation. Always document at point of care — never pre-chart or copy-paste without individualization.",
    [
      { id: "RN001-Q1", stem: "EHR documentation should be completed:", options: ["At the end of the day", "At point of care during the visit", "Within 1 week", "Whenever convenient"], correctIndex: 1, rationale: "Document at point of care for accuracy and compliance." },
      { id: "RN001-Q2", stem: "Copy-pasting from a previous visit note is:", options: ["Always acceptable", "Prohibited unless reviewed and individualized", "Required for efficiency", "Only for HHA notes"], correctIndex: 1, rationale: "Copy-paste must be reviewed and individualized for each visit." },
      { id: "RN001-Q3", stem: "Physician orders in the EHR require:", options: ["No verification", "Physician signature within required timeframes", "Only nurse signature", "Verbal acknowledgment only"], correctIndex: 1, rationale: "Physician orders require timely physician signature." },
      { id: "RN001-Q4", stem: "Secure messaging in the EHR should be used for:", options: ["Personal conversations", "Patient-related clinical communication", "Scheduling social events", "Non-urgent personal requests"], correctIndex: 1, rationale: "Secure messaging is for clinical communication about patients." },
      { id: "RN001-Q5", stem: "Pre-charting (documenting before the visit) is:", options: ["Efficient practice", "Prohibited — constitutes falsification", "Acceptable for routine visits", "Only prohibited for OASIS"], correctIndex: 1, rationale: "Pre-charting is falsification — document only what actually occurred." },
    ], 35, "Return demo (mock note)"),
  ...["RN-002","RN-003","RN-004","RN-005","RN-006","RN-007","RN-008","RN-009","RN-010","RN-011","RN-012","RN-013","RN-014","RN-015","RN-SUP"].map((id, i) => {
    const titles = ["OASIS Training — Item-Level Completion","Evidence Hierarchy for OASIS/Documentation","Clinical Documentation Standards","Plan of Care — Development & Physician Orders","Homebound Status Determination","Face-to-Face Encounter Compliance","Medication Management & Reconciliation","Fall Risk Assessment & Prevention","Wound Care Standards","Pain Assessment & Management","Infection Prevention — Clinical Application","Patient Identification & Verification","Discharge Planning & Transfer","HHA Supervision Responsibilities","Supervised Patient Visits"];
    const policies = [["CL-OA series"],["CL-OA-006"],["CL-CD-001 to CL-CD-004"],["CL-CP-001 to CL-CP-005"],["CL-CA-005"],["CL-CA-006","CL-CA-007"],["CL-SD-012","CL-SD-013"],["CL-SD-015"],["CL-SD-011"],["CL-SD-014"],["CL-SD-016"],["OP-PA-002"],["CL-CP-006","CL-CP-007"],["§ 484.80(h)"],["HR-TA-005 § 6.3"]];
    const methods = ["Coding exercise (80%)","Case study","Record review exercise","POC completion exercise","Scenario (80%)","Quiz","Skills check-off","Case study assessment","Return demo","Case study assessment","Return demo","Observation","Case study","Appendix E completion","HR-TA-005 Appendix E per visit"];
    return generateRoleModule(id, titles[i], "RN", policies[i],
      `<h2>${id}: ${titles[i]}</h2><p>This module covers <strong>${titles[i].toLowerCase()}</strong> — a core RN competency for home health practice.</p><div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;"><h3>Key Learning Objectives:</h3><ul><li>Understand the regulatory and policy basis</li><li>Apply clinical standards accurately in documentation</li><li>Identify common errors and how to prevent them</li><li>Demonstrate competency through ${methods[i]}</li></ul></div><div style="background:#FFF3E0;padding:12px;border-radius:8px;margin:12px 0;"><strong>Competency Method:</strong> ${methods[i]}</div>`,
      `This module covers ${titles[i].toLowerCase()}, a core RN competency. Competency is demonstrated through ${methods[i]}.`,
      [
        { id: `${id}-Q1`, stem: `${titles[i]} is required because:`, options: ["It's optional best practice", "It's a CMS regulatory requirement with survey implications", "Only for new graduates", "Only for experienced nurses"], correctIndex: 1, rationale: `${titles[i]} is a CMS regulatory requirement verified during surveys.` },
        { id: `${id}-Q2`, stem: "Documentation for this competency must include:", options: ["Verbal confirmation only", "Written evidence per HR-TD-003 Appendix A", "No documentation needed", "Self-assessment only"], correctIndex: 1, rationale: "All competencies require documented evidence per HR-TD-003." },
        { id: `${id}-Q3`, stem: "Errors in this area can result in:", options: ["No consequences", "Survey deficiencies, patient harm, and compliance issues", "Minor warnings only", "Patient inconvenience only"], correctIndex: 1, rationale: "Errors can result in deficiencies, patient harm, and compliance consequences." },
        { id: `${id}-Q4`, stem: `The competency assessment method for this module is:`, options: ["Self-study only", methods[i], "No assessment", "Peer review only"], correctIndex: 1, rationale: `Competency for ${titles[i]} is assessed via ${methods[i]}.` },
        { id: `${id}-Q5`, stem: "This competency must be validated:", options: ["Once in career", "Initially and then annually per HR-TD-003", "Only during orientation", "Every 5 years"], correctIndex: 1, rationale: "Competencies require initial and annual validation." },
      ], 30, methods[i]);
  }),
];

// ═══════════════════════════════════════════════════════════════
// LVN, PT, PTA, OT, COTA, SLP, MSW TRACKS
// Generated from track-specific templates
// ═══════════════════════════════════════════════════════════════

function generateDisciplineTrack(
  track: TrackId, _moduleCount: number, topics: { title: string; policy: string[]; method: string }[]
): TrainingModule[] {
  return topics.map((t, i) => {
    const id = `${track}-${String(i + 1).padStart(3, "0")}`;
    return generateRoleModule(id, t.title, track, t.policy,
      `<h2>${id}: ${t.title}</h2><p>This module covers <strong>${t.title.toLowerCase()}</strong> for the ${TRACKS[track].name} role per ${t.policy.join(", ")}.</p><div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;"><h3>Learning Objectives:</h3><ul><li>Understand scope of practice for this competency</li><li>Apply clinical standards within your discipline's authority</li><li>Document appropriately per CL-CD-001</li><li>Demonstrate competency via ${t.method}</li></ul></div><div style="background:#FFF3E0;padding:12px;border-radius:8px;"><strong>Competency:</strong> ${t.method}</div>`,
      `This module covers ${t.title.toLowerCase()} for the ${TRACKS[track].name} role. Competency is demonstrated through ${t.method}.`,
      [
        { id: `${id}-Q1`, stem: `This competency is required for the ${TRACKS[track].name} role because:`, options: ["It is optional", "It is mandated by CMS CoP and/or state practice act", "It is only for supervisors", "It is voluntary"], correctIndex: 1, rationale: `Required per CMS Conditions of Participation and relevant state practice act.` },
        { id: `${id}-Q2`, stem: "Documentation of this competency includes:", options: ["No records needed", "LMS completion + supervisor sign-off in personnel file", "Verbal acknowledgment", "Self-attestation only"], correctIndex: 1, rationale: "LMS completion plus supervisor sign-off documented in the personnel file." },
        { id: `${id}-Q3`, stem: "Practicing outside your scope in this area:", options: ["Is acceptable with experience", "Violates state practice act and CMS requirements", "Is allowed with supervisor verbal approval", "Has no consequences"], correctIndex: 1, rationale: "Practicing outside scope violates practice act and CMS regulations." },
        { id: `${id}-Q4`, stem: `The assessment method for this module is:`, options: ["No assessment", t.method, "Self-study only", "Peer feedback"], correctIndex: 1, rationale: `Assessment via ${t.method} as specified in the competency plan.` },
        { id: `${id}-Q5`, stem: "Annual re-evaluation of this competency is:", options: ["Not required", "Required per HR-TD-003", "Optional", "Every 5 years"], correctIndex: 1, rationale: "Annual competency re-evaluation per HR-TD-003." },
      ], 30, t.method);
  });
}

const LVN_MODULES = generateDisciplineTrack("LVN", 12, [
  { title: "EHR System — LVN Documentation Module", policy: ["EHR"], method: "Return demo" },
  { title: "LVN Scope of Practice — CA B&P Code § 2859", policy: ["CA B&P § 2859"], method: "Quiz (80%)" },
  { title: "RN Co-Signature & Supervision Requirements", policy: ["§ 484.115(c)"], method: "Quiz" },
  { title: "Clinical Documentation Standards", policy: ["CL-CD-001"], method: "Record review" },
  { title: "Plan of Care — Working Under RN/Physician POC", policy: ["CL-CP-001"], method: "Case study" },
  { title: "Medication Management & Reconciliation", policy: ["CL-SD-012", "CL-SD-013"], method: "Skills check-off" },
  { title: "Wound Care — LVN Scope", policy: ["CL-SD-011"], method: "Return demo" },
  { title: "Fall Risk Assessment & Prevention", policy: ["CL-SD-015"], method: "Case study" },
  { title: "Pain Assessment & Management", policy: ["CL-SD-014"], method: "Case study" },
  { title: "Infection Prevention — Clinical Application", policy: ["CL-SD-016"], method: "Return demo" },
  { title: "Patient Identification & Verification", policy: ["OP-PA-002"], method: "Observation" },
  { title: "LVN-Specific Skills Check-offs per CA Practice Act", policy: ["CA B&P § 2859"], method: "Skills demonstration" },
]);

const PT_MODULES = generateDisciplineTrack("PT", 10, [
  { title: "EHR — Therapy Documentation Module", policy: ["EHR"], method: "Return demo" },
  { title: "OASIS Training (PT — OASIS-Authorized)", policy: ["CL-OA series"], method: "Coding exercise (80%)" },
  { title: "Therapy POC/Plan Development & Goals", policy: ["CL-CP-001"], method: "Case study" },
  { title: "Homebound Status — PT Role in Determining", policy: ["CL-CA-005"], method: "Scenario" },
  { title: "Fall Risk — PT Clinical Application (Tinetti/Berg)", policy: ["CL-SD-015"], method: "Return demo (Tinetti/Berg)" },
  { title: "Pain Assessment — Functional", policy: ["CL-SD-014"], method: "Case study" },
  { title: "Gait Training & Mobility Assessment", policy: ["Discipline-specific"], method: "Return demo" },
  { title: "Therapeutic Exercise Programming", policy: ["Discipline-specific"], method: "Case study" },
  { title: "Discharge Planning — PT Perspective", policy: ["CL-CP-006"], method: "Case study" },
  { title: "Supervised Patient Visits (Min 2)", policy: ["HR-TA-005 § 6.3"], method: "Appendix E per visit" },
]);

const PTA_MODULES = generateDisciplineTrack("PTA", 10, [
  { title: "EHR — PTA Documentation", policy: ["EHR"], method: "Return demo" },
  { title: "PTA Scope of Practice & Supervision Requirements", policy: ["§ 484.115(e)", "CA Practice Act"], method: "Quiz (80%)" },
  { title: "Working Under PT Direction", policy: ["§ 484.115(e)"], method: "Scenario" },
  { title: "Therapy POC — PTA Role in Implementation", policy: ["CL-CP-001"], method: "Case study" },
  { title: "Fall Risk Intervention — PTA Application", policy: ["CL-SD-015"], method: "Return demo" },
  { title: "Pain Management — Functional Interventions", policy: ["CL-SD-014"], method: "Case study" },
  { title: "Gait Training & Transfer Techniques", policy: ["Discipline-specific"], method: "Return demo" },
  { title: "Therapeutic Exercise Implementation", policy: ["Discipline-specific"], method: "Skills demo" },
  { title: "Documentation — PTA Visit Notes", policy: ["CL-CD-001"], method: "Mock documentation" },
  { title: "Supervised Patient Visits (Min 3)", policy: ["HR-TA-005 § 6.3"], method: "Appendix E per visit" },
]);

const OT_MODULES = generateDisciplineTrack("OT", 10, [
  { title: "EHR — OT Documentation Module", policy: ["EHR"], method: "Return demo" },
  { title: "OASIS Training (OT — OASIS-Authorized)", policy: ["CL-OA series"], method: "Coding exercise (80%)" },
  { title: "ADL Assessment & Intervention Competencies", policy: ["Discipline-specific"], method: "Return demo" },
  { title: "Home Safety Evaluation", policy: ["Discipline-specific"], method: "Case study" },
  { title: "Adaptive Equipment Assessment & Training", policy: ["Discipline-specific"], method: "Return demo" },
  { title: "Therapy POC/Plan Development — OT Goals", policy: ["CL-CP-001"], method: "Case study" },
  { title: "Cognitive Assessment & Intervention", policy: ["Discipline-specific"], method: "Case study" },
  { title: "Fall Risk — OT Application (Home Modification)", policy: ["CL-SD-015"], method: "Case study" },
  { title: "Discharge Planning — OT Perspective", policy: ["CL-CP-006"], method: "Case study" },
  { title: "Supervised Patient Visits (Min 2)", policy: ["HR-TA-005 § 6.3"], method: "Appendix E per visit" },
]);

const COTA_MODULES = generateDisciplineTrack("COTA", 10, [
  { title: "EHR — COTA Documentation", policy: ["EHR"], method: "Return demo" },
  { title: "COTA Scope & Supervision — CA B&P § 2570", policy: ["§ 484.115(g)", "CA B&P § 2570"], method: "Quiz (80%)" },
  { title: "Working Under OT Direction", policy: ["§ 484.115(g)"], method: "Scenario" },
  { title: "ADL Intervention Implementation", policy: ["Discipline-specific"], method: "Return demo" },
  { title: "Adaptive Equipment Training — COTA Role", policy: ["Discipline-specific"], method: "Return demo" },
  { title: "Home Safety — COTA Implementation", policy: ["Discipline-specific"], method: "Case study" },
  { title: "Therapeutic Activity Implementation", policy: ["Discipline-specific"], method: "Skills demo" },
  { title: "Documentation — COTA Visit Notes", policy: ["CL-CD-001"], method: "Mock documentation" },
  { title: "Patient/Caregiver Education Documentation", policy: ["CL-CD-001"], method: "Record review" },
  { title: "Supervised Patient Visits (Min 3)", policy: ["HR-TA-005 § 6.3"], method: "Appendix E per visit" },
]);

const SLP_MODULES = generateDisciplineTrack("SLP", 8, [
  { title: "EHR — SLP Documentation", policy: ["EHR"], method: "Return demo" },
  { title: "OASIS Training (SLP — OASIS-Authorized)", policy: ["CL-OA series"], method: "Coding exercise (80%)" },
  { title: "Dysphagia Assessment & Management", policy: ["Discipline-specific"], method: "Case study + skills demo" },
  { title: "Cognitive-Linguistic Assessment", policy: ["Discipline-specific"], method: "Case study" },
  { title: "Voice & Fluency Disorders — Home Health", policy: ["Discipline-specific"], method: "Case study" },
  { title: "Patient/Caregiver Education Documentation", policy: ["CL-CD-001"], method: "Record review" },
  { title: "Therapy POC — SLP Goals & Progress Reporting", policy: ["CL-CP-001"], method: "Case study" },
  { title: "Supervised Patient Visits (Min 2)", policy: ["HR-TA-005 § 6.3"], method: "Appendix E per visit" },
]);

const MSW_MODULES = generateDisciplineTrack("MSW", 8, [
  { title: "Psychosocial Assessment", policy: ["Discipline-specific"], method: "Case study" },
  { title: "Community Resource Coordination", policy: ["Discipline-specific"], method: "Resource mapping" },
  { title: "Advance Directives Counseling", policy: ["CL-PR-002"], method: "Scenario" },
  { title: "Abuse/Neglect — Extended Mandatory Reporter Training", policy: ["CL-PR-006", "HR-ER-009"], method: "Quiz (80%)" },
  { title: "Discharge Planning — Social Determinants of Health", policy: ["CL-CP-006"], method: "Case study" },
  { title: "PHI & Confidentiality — Social Work Context (42 CFR Part 2)", policy: ["CO-HP-001", "42 CFR Part 2"], method: "Quiz" },
  { title: "EHR — MSW Documentation", policy: ["EHR"], method: "Return demo" },
  { title: "Supervised Patient Visits (Min 2)", policy: ["HR-TA-005 § 6.3"], method: "Appendix E per visit" },
]);

// ═══════════════════════════════════════════════════════════════
// HHA TRACK — MOST DETAILED (§ 484.80 — Most Heavily Surveyed)
// ═══════════════════════════════════════════════════════════════

const HHA_MODULES: TrainingModule[] = [
  generateRoleModule("HHA-001", "Communication Skills", "HHA", ["§ 484.80(h)(1)"],
    `<h2>HHA-001: Communication Skills</h2><p>Per 42 CFR § 484.80(h)(1), HHAs must demonstrate competency in <strong>communication skills</strong>. This is the first of nine CMS-mandated competency areas.</p><div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;"><h3>Communication Competencies:</h3><ul><li><strong>Active listening:</strong> Hear what the patient says AND what they don't say</li><li><strong>Clear verbal communication:</strong> Use simple, non-medical language with patients</li><li><strong>Written communication:</strong> Accurate visit documentation and reporting</li><li><strong>Reporting to RN:</strong> Timely, accurate reporting of patient changes — vital signs, behavior, complaints</li><li><strong>Cultural sensitivity:</strong> Adapt communication to the patient's language, culture, and preferences</li><li><strong>Patient/family education:</strong> Explain care activities in understandable terms</li></ul></div><div style="background:#FBE9E7;padding:12px;border-radius:8px;margin:12px 0;"><strong>CMS Survey Focus:</strong> Surveyors observe HHA-patient interactions and review whether HHAs communicate changes to the supervising RN in a timely manner.</div>`,
    "Per 42 CFR Section 484.80(h)(1), HHAs must demonstrate communication skills including active listening, clear verbal communication, accurate written documentation, timely reporting to the RN, cultural sensitivity, and patient education. Surveyors observe these interactions directly.",
    [
      { id: "HHA001-Q1", stem: "When reporting a patient change to the RN, you should:", options: ["Wait until the next scheduled supervisory visit", "Report timely with specific observations (vital signs, behavior, complaints)", "Only report if the patient asks you to", "Send a text message with general info"], correctIndex: 1, rationale: "Timely, specific reporting to the supervising RN is required." },
      { id: "HHA001-Q2", stem: "When speaking with patients, you should use:", options: ["Medical terminology to sound professional", "Simple, clear, non-medical language they can understand", "Minimal words to save time", "Technical abbreviations"], correctIndex: 1, rationale: "Use simple, non-medical language patients can understand." },
      { id: "HHA001-Q3", stem: "Cultural sensitivity in communication means:", options: ["Treating everyone exactly the same way", "Adapting communication to the patient's language, culture, and preferences", "Ignoring cultural differences", "Only speaking English"], correctIndex: 1, rationale: "Adapt communication to individual cultural and language needs." },
      { id: "HHA001-Q4", stem: "Active listening includes:", options: ["Hearing only the words spoken", "Hearing what the patient says AND observing non-verbal cues", "Multitasking while the patient talks", "Waiting for your turn to speak"], correctIndex: 1, rationale: "Active listening includes verbal and non-verbal communication awareness." },
      { id: "HHA001-Q5", stem: "Communication skills are evaluated under:", options: ["No specific regulation", "42 CFR § 484.80(h)(1)", "Only state licensing", "OSHA standards"], correctIndex: 1, rationale: "Communication is competency area 1 under § 484.80(h)(1)." },
    ], 30, "Skills check-off via observation"),
  ...["HHA-002","HHA-003","HHA-004","HHA-005","HHA-006","HHA-007","HHA-008","HHA-009","HHA-010","HHA-011","HHA-012"].map((id, i) => {
    const hhaTopics = [
      { title: "Observation, Reporting & Documentation of Patient Status", reg: "§ 484.80(h)(2)", method: "Skills check-off" },
      { title: "Reading & Recording Vital Signs", reg: "§ 484.80(h)(3)", method: "Skills check-off (100%)" },
      { title: "Basic Infection Control Procedures", reg: "§ 484.80(h)(4)", method: "Skills check-off" },
      { title: "Basic Body Mechanics & Safe Transfers", reg: "§ 484.80(h)(5)", method: "Skills check-off" },
      { title: "Basic Nutrition & Meal Preparation", reg: "§ 484.80(h)(6)", method: "Skills check-off" },
      { title: "Maintenance of Clean, Safe, Healthy Environment", reg: "§ 484.80(h)(7)", method: "Observation" },
      { title: "Patient Emotional, Spiritual & Cultural Needs", reg: "§ 484.80(h)(8)", method: "Observation rating" },
      { title: "Patient-Specific Competencies per Care Plan", reg: "§ 484.80(h)(9)", method: "Per-patient skills demo" },
      { title: "Personal Care — Bathing, Grooming, Toileting", reg: "Discipline-specific", method: "Skills check-off" },
      { title: "Range of Motion / Ambulation Assistance", reg: "Discipline-specific", method: "Skills check-off" },
      { title: "HHA Documentation — Visit Notes & RN Reporting", reg: "CL-CD-001", method: "Mock documentation" },
    ];
    const t = hhaTopics[i];
    return generateRoleModule(id, t.title, "HHA", [t.reg],
      `<h2>${id}: ${t.title}</h2><p>Per <strong>${t.reg}</strong>, this is one of the nine CMS-mandated competency areas for Home Health Aides. HHAs are the <strong>most heavily surveyed role</strong> — every competency must be documented and verifiable.</p><div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;"><h3>Competency Requirements:</h3><ul><li>Demonstrate skills through direct observation or return demo</li><li>Supervisor (RN) validates competency with sign-off</li><li>Documented on HR-TD-003 Appendix D (HHA-specific)</li><li>Re-evaluated annually covering ALL 9 competency areas</li></ul></div><div style="background:#FBE9E7;padding:12px;border-radius:8px;margin:12px 0;"><strong>⚠️ HHA Supervision Schedule:</strong><br/>• Every 14 days for first 60 days<br/>• Every 60 days thereafter<br/>• Documented on HR-TD-003 Appendix E</div>`,
      `Per ${t.reg}, this HHA competency must be demonstrated through ${t.method} with RN supervisor sign-off. HHAs are the most heavily surveyed role. Re-evaluation occurs annually for all nine areas. Supervision follows the 14-day and 60-day schedule.`,
      [
        { id: `${id}-Q1`, stem: `${t.title} is required under:`, options: ["No specific regulation", t.reg, "State law only", "Agency policy only"], correctIndex: 1, rationale: `This competency is mandated under ${t.reg}.` },
        { id: `${id}-Q2`, stem: "HHA competency validation requires:", options: ["Self-assessment", "RN supervisor observation and sign-off", "Written test only", "No specific validation"], correctIndex: 1, rationale: "RN supervisor validates through direct observation and sign-off." },
        { id: `${id}-Q3`, stem: "Annual re-evaluation of HHA competencies covers:", options: ["Only areas with previous issues", "ALL 9 competency areas per § 484.80", "Only 3 randomly selected areas", "No annual requirement exists"], correctIndex: 1, rationale: "Annual re-evaluation covers ALL 9 competency areas." },
        { id: `${id}-Q4`, stem: "HHA supervised visits during the first 60 days occur every:", options: ["7 days", "14 days", "30 days", "60 days"], correctIndex: 1, rationale: "Every 14 days during the first 60 days per § 484.80(h)." },
        { id: `${id}-Q5`, stem: "HHA competency documentation is on:", options: ["Informal notes", "HR-TD-003 Appendix D (HHA-specific)", "No specific form", "Generic evaluation form"], correctIndex: 1, rationale: "HR-TD-003 Appendix D is the HHA-specific competency form." },
      ], 30, t.method);
  }),
];



const ANN_MODULES: TrainingModule[] = [

  // ═══════════════════════════════════════════════════════════════
  // Q1 TRAINING BLOCK
  // ═══════════════════════════════════════════════════════════════

  // ANN-001: Annual Compliance / Code of Conduct
  {
    id: "ANN-001",
    title: "Annual Compliance & Code of Conduct Refresher",
    track: "ANN",
    durationMinutes: 35,
    policyMapped: ["CO-CP-001", "CO-CP-004"],
    pages: [
      {
        title: "Annual Compliance Refresher",
        content: `<h2>ANN-001: Compliance & Code of Conduct — Annual Refresher</h2>
<p>This annual refresher reinforces your understanding of Care Indeed's <strong>Corporate Compliance Program</strong> and your obligations under the <strong>Code of Conduct</strong>. Per HR-TD-001 § 6.2, all staff must complete this module in Q1.</p>
<div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Compliance Program Recap — The 7 OIG Elements:</h3>
<ol>
<li>Written policies & procedures</li>
<li>Compliance Officer & Committee</li>
<li>Training & education (this module)</li>
<li>Communication channels (hotline)</li>
<li>Auditing & monitoring</li>
<li>Enforcement & discipline</li>
<li>Response & corrective action</li>
</ol>
</div>
<div style="background:#FFF3E0;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #F59E0B;">
<h3>Annual Acknowledgment Required:</h3>
<p>By completing this module, you acknowledge that you have read, understood, and agree to abide by the Code of Conduct for the current calendar year. This acknowledgment is filed in your personnel file.</p>
</div>`,
        narration: "This annual compliance refresher reinforces the Corporate Compliance Program and your Code of Conduct obligations. All staff must complete this in Q1. The seven OIG elements remain the foundation. By completing this module, you acknowledge the Code of Conduct for the current year, which is filed in your personnel file.",
      },
      {
        title: "Key Compliance Updates & Reminders",
        content: `<h2>Annual Compliance Reminders</h2>
<div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Your Ongoing Obligations:</h3>
<ul>
<li><strong>Document truthfully</strong> — falsification = termination + potential criminal liability</li>
<li><strong>Bill only for services provided</strong> — phantom visits = federal fraud</li>
<li><strong>Report concerns immediately</strong> — use supervisor, Compliance Officer, or hotline</li>
<li><strong>Cooperate with audits and investigations</strong></li>
<li><strong>Maintain patient confidentiality</strong> — HIPAA applies 24/7/365</li>
<li><strong>No kickbacks or improper referral arrangements</strong></li>
<li><strong>Monthly OIG/SAM screening</strong> — you must notify HR immediately if you are charged with or convicted of any crime</li>
</ul>
</div>
<div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;">
<h3>Consequences of Non-Compliance:</h3>
<table style="width:100%;border-collapse:collapse;">
<tr style="background:#0D4F4F;color:white;"><th style="padding:8px;">Violation</th><th style="padding:8px;">Consequence</th></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px;">False Claims Act violation</td><td style="padding:8px;">$11,000+ per claim + treble damages</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px;">Anti-Kickback violation</td><td style="padding:8px;">Up to $100,000 fine + 10 years imprisonment</td></tr>
<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px;">Exclusion from federal programs</td><td style="padding:8px;">Cannot work in any Medicare/Medicaid entity</td></tr>
<tr><td style="padding:8px;">Internal policy violation</td><td style="padding:8px;">Progressive discipline up to termination</td></tr>
</table>
</div>`,
        narration: "Your ongoing obligations include truthful documentation, billing only for services provided, reporting concerns, cooperating with audits, maintaining confidentiality, avoiding kickbacks, and notifying HR of any criminal charges. Consequences range from False Claims Act penalties of over $11,000 per claim to Anti-Kickback criminal sentences up to 10 years, federal program exclusion, and internal discipline through termination.",
      },
      {
        title: "Module Summary",
        content: `<h2>Summary — ANN-001</h2>
<div style="background:#E0F7FA;padding:16px;border-radius:8px;">
<ul>
<li>Annual compliance refresher — all 7 OIG elements remain active</li>
<li>Code of Conduct acknowledgment filed in personnel file</li>
<li>Report violations immediately — whistleblower protections remain in effect</li>
<li>OIG/SAM screening occurs monthly — notify HR of any legal issues</li>
<li>False claims, kickbacks, and exclusion carry severe penalties</li>
</ul>
</div>`,
        narration: "Summary: Annual refresher covering all seven OIG elements. Code of Conduct acknowledgment is filed. Report violations with whistleblower protection. Monthly OIG/SAM screening continues. Penalties for violations are severe.",
      },
    ],
    exam: [
      { id: "ANN001-Q1", stem: "The Code of Conduct acknowledgment must be completed:", options: ["Once at hire only", "Annually — filed in personnel file each year", "Every 5 years", "Only when policy changes"], correctIndex: 1, rationale: "Annual Code of Conduct acknowledgment required per HR-TD-001." },
      { id: "ANN001-Q2", stem: "If you are charged with a crime, you must:", options: ["Wait for conviction before notifying anyone", "Notify HR immediately", "Keep it private — it's personal", "Only notify if it's a felony"], correctIndex: 1, rationale: "Notify HR immediately of any criminal charge — OIG/SAM screening implications." },
      { id: "ANN001-Q3", stem: "Billing for a visit you did not actually make is:", options: ["An administrative error", "Federal fraud under the False Claims Act", "Acceptable if the patient was scheduled", "Only a problem if audited"], correctIndex: 1, rationale: "Phantom billing = federal fraud under the False Claims Act." },
      { id: "ANN001-Q4", stem: "OIG/SAM screening of all employees occurs:", options: ["At hire only", "Annually", "Monthly — by the 15th with CO co-sign by the 20th", "Quarterly"], correctIndex: 2, rationale: "Monthly screening per HR-TA-003 § 6.2 — by 15th, CO co-sign by 20th." },
      { id: "ANN001-Q5", stem: "The Anti-Kickback Statute carries maximum penalties of:", options: ["$1,000 fine", "$100,000 fine and 10 years imprisonment", "Written warning", "Loss of bonus only"], correctIndex: 1, rationale: "AKS: up to $100,000 fine + 10 years imprisonment per violation." },
    ],
    passScore: 80,
  },

  // ANN-002: Fraud, Waste & Abuse
  {
    id: "ANN-002",
    title: "Annual Fraud, Waste & Abuse Training",
    track: "ANN", durationMinutes: 35, policyMapped: ["CO-CP-001", "CO-CP-004"],
    pages: [
      { title: "FWA Annual Refresher", content: `<h2>ANN-002: Fraud, Waste & Abuse</h2><p>This annual refresher covers your obligations to prevent, detect, and report fraud, waste, and abuse (FWA) in Medicare/Medicaid billing and clinical operations.</p><div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;"><h3>Key Definitions Refresher:</h3><table style="width:100%;border-collapse:collapse;"><tr style="background:#0D4F4F;color:white;"><th style="padding:10px;">Type</th><th style="padding:10px;">Definition</th><th style="padding:10px;">Home Health Example</th></tr><tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;"><strong>Fraud</strong></td><td style="padding:10px;">Intentional deception for gain</td><td style="padding:10px;">Billing for visits not made; falsifying OASIS for higher reimbursement</td></tr><tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:10px;"><strong>Waste</strong></td><td style="padding:10px;">Overutilization without fraud intent</td><td style="padding:10px;">Continuing visits after goals met; excessive supply use</td></tr><tr><td style="padding:10px;"><strong>Abuse</strong></td><td style="padding:10px;">Practices inconsistent with standards</td><td style="padding:10px;">Upcoding; services not medically necessary</td></tr></table></div><div style="background:#FBE9E7;padding:12px;border-radius:8px;margin:12px 0;"><strong>Annual Reminder:</strong> Medicare FWA costs taxpayers billions annually. You are the first line of defense.</div>`, narration: "This annual FWA refresher covers your prevention, detection, and reporting obligations. Fraud is intentional deception. Waste is overutilization without intent. Abuse is practices inconsistent with standards. You are the first line of defense against FWA." },
      { title: "Red Flags & Reporting", content: `<h2>FWA Red Flags in Home Health</h2><div style="background:#FFF3E0;padding:16px;border-radius:8px;margin:16px 0;"><h3>Red Flags to Watch For:</h3><ul><li>Visits documented but patient reports no one came</li><li>Pressure to code OASIS items to maximize reimbursement</li><li>Patients kept on service longer than medically necessary</li><li>Duplicate billing for the same service</li><li>Referrals tied to financial incentives or gifts</li><li>Documentation that doesn't match actual patient condition</li><li>Staff credentials that don't match the services they provide</li></ul></div><p><strong>Report ALL red flags</strong> through supervisor, Compliance Officer, hotline, or externally to OIG (1-800-HHS-TIPS).</p>`, narration: "Watch for red flags: documented visits patients deny, pressure to upcode OASIS, patients on service too long, duplicate billing, referral incentives, documentation mismatch, and credential issues. Report all red flags through available channels." },
    ],
    exam: [
      { id: "ANN002-Q1", stem: "A colleague pressures you to code an OASIS item higher 'to get better reimbursement.' This is:", options: ["Good business practice", "Potential fraud — report to Compliance Officer", "Acceptable if the supervisor approves", "Only a problem if CMS audits"], correctIndex: 1, rationale: "Pressure to upcode = potential fraud. Report immediately." },
      { id: "ANN002-Q2", stem: "Continuing home health visits after all goals are met is:", options: ["Ensuring patient satisfaction", "Potential waste — services should be medically necessary", "Required for patient retention", "Standard practice"], correctIndex: 1, rationale: "Services beyond medical necessity = waste." },
      { id: "ANN002-Q3", stem: "The OIG fraud hotline number is:", options: ["911", "1-800-HHS-TIPS", "411", "The local police non-emergency line"], correctIndex: 1, rationale: "OIG fraud hotline: 1-800-HHS-TIPS for external reporting." },
      { id: "ANN002-Q4", stem: "Upcoding means:", options: ["Using the correct billing code", "Billing for a higher level of service than provided", "Reducing billing for efficiency", "Using outdated codes"], correctIndex: 1, rationale: "Upcoding = billing higher than actual service level = abuse." },
      { id: "ANN002-Q5", stem: "A patient tells you 'nobody came last Tuesday' but a visit is documented. You should:", options: ["Assume the patient forgot", "Report it — potential phantom billing/fraud", "Ignore it — documentation is correct", "Tell the patient they're mistaken"], correctIndex: 1, rationale: "Patient-reported missed visits contradicting documentation = potential fraud. Report." },
    ],
    passScore: 80,
  },

  // ANN-003: HIPAA Privacy & Security Annual
  {
    id: "ANN-003",
    title: "Annual HIPAA Privacy & Security Refresher",
    track: "ANN", durationMinutes: 35, policyMapped: ["CO-HP-001", "CO-HP-002"],
    pages: [
      { title: "HIPAA Annual Refresher", content: `<h2>ANN-003: HIPAA Privacy & Security</h2><p>Annual HIPAA training is mandatory for all workforce members. This refresher covers key privacy and security obligations with updated guidance.</p><div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;"><h3>Annual Reminders:</h3><ul><li><strong>Minimum Necessary</strong> — still the standard for all access and disclosure</li><li><strong>Breach reporting</strong> — within 1 hour to supervisor + Privacy Officer</li><li><strong>Device security</strong> — encryption, auto-lock, report lost devices within 1 hour</li><li><strong>No texting PHI</strong> — use secure messaging only</li><li><strong>Social media</strong> — NEVER post patient-identifiable content</li><li><strong>Home health risks</strong> — vehicle security, screen privacy, family discussions</li></ul></div><div style="background:#FBE9E7;padding:12px;border-radius:8px;margin:12px 0;"><strong>2024 Enforcement Update:</strong> OCR continues to increase enforcement actions. Average HIPAA settlement now exceeds $1 million. Individual employees have been prosecuted and imprisoned for intentional HIPAA violations.</div>`, narration: "Annual HIPAA refresher covering minimum necessary standard, breach reporting within 1 hour, device security, no texting PHI, social media prohibitions, and home health specific risks. Enforcement continues to increase with average settlements exceeding $1 million and individual employees facing prosecution." },
      { title: "Scenario-Based Review", content: `<h2>Scenarios — Test Your Knowledge</h2><div style="background:#FFF3E0;padding:16px;border-radius:8px;margin:12px 0;"><h3>Scenario 1:</h3><p>You're at a coffee shop and a coworker asks about a mutual patient's condition.</p><p><strong>Correct Response:</strong> "I can't discuss patient information in a public setting. Let's use secure messaging in the EHR."</p></div><div style="background:#FFF3E0;padding:16px;border-radius:8px;margin:12px 0;"><h3>Scenario 2:</h3><p>A patient's adult daughter calls asking for Mom's medication list. Mom is your patient but you don't have authorization on file for the daughter.</p><p><strong>Correct Response:</strong> "I need to verify that your mother has authorized me to share her health information with you. Let me check with her first."</p></div><div style="background:#FFF3E0;padding:16px;border-radius:8px;margin:12px 0;"><h3>Scenario 3:</h3><p>You accidentally leave a patient's printed care plan on your car seat after a visit.</p><p><strong>Correct Response:</strong> Retrieve it immediately. If it was potentially viewed by unauthorized persons, report as a potential breach within 1 hour.</p></div>`, narration: "Let's review scenarios. In a coffee shop, never discuss patients — use secure messaging. When family calls without authorization, verify consent first. If you leave documents visible in your car, retrieve immediately and report as a potential breach if unauthorized viewing was possible." },
    ],
    exam: [
      { id: "ANN003-Q1", stem: "HIPAA training is required:", options: ["At hire only", "Annually for all workforce members", "Every 5 years", "Only for clinical staff"], correctIndex: 1, rationale: "Annual HIPAA training is mandatory for all workforce members." },
      { id: "ANN003-Q2", stem: "A patient's family member calls requesting medical information. Without authorization on file, you should:", options: ["Share basic information only", "Verify the patient has authorized disclosure first", "Tell them to call the doctor", "Share everything — family has a right to know"], correctIndex: 1, rationale: "Verify patient authorization before disclosing PHI to family members." },
      { id: "ANN003-Q3", stem: "The average HIPAA settlement now exceeds:", options: ["$10,000", "$100,000", "$1 million", "$10 million"], correctIndex: 2, rationale: "Average HIPAA settlement now exceeds $1 million per OCR enforcement data." },
      { id: "ANN003-Q4", stem: "Discussing a patient's condition in a coffee shop with a coworker is:", options: ["Fine if you use first names only", "A HIPAA violation — public settings are not secure", "Acceptable between coworkers", "Only a problem if someone overhears"], correctIndex: 1, rationale: "Public settings are not appropriate for PHI discussion — regardless of who is present." },
      { id: "ANN003-Q5", stem: "Finding a printed patient care plan visible in your car means:", options: ["Throw it away and forget about it", "Retrieve it and report as a potential breach if unauthorized viewing was possible", "It's not a breach since it's your car", "Shred it and move on"], correctIndex: 1, rationale: "Retrieve and report — potential breach if unauthorized persons could have viewed it." },
    ],
    passScore: 80,
  },

  // ANN-004: Patient Rights Annual
  {
    id: "ANN-004",
    title: "Annual Patient Rights Refresher",
    track: "ANN", durationMinutes: 30, policyMapped: ["CL-PR-001"],
    pages: [
      { title: "Patient Rights Annual Review", content: `<h2>ANN-004: Patient Rights</h2><p>Annual review of patient rights per 42 CFR § 484.50. As a caregiver, you actively protect these rights at every encounter.</p><div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;"><h3>Core Rights Refresher:</h3><ul><li>Informed of rights before/during first visit</li><li>Choose their provider</li><li>Participate in care planning</li><li>Refuse treatment (respect, document, notify)</li><li>Privacy and confidentiality</li><li>Freedom from abuse, neglect, exploitation</li><li>Voice grievances without reprisal</li><li>Know the state home health hotline number</li></ul></div>`, narration: "Annual review of patient rights under 42 CFR Section 484.50. Core rights include informed consent, provider choice, care plan participation, treatment refusal, privacy, freedom from abuse, grievance rights, and access to the state hotline." },
    ],
    exam: [
      { id: "ANN004-Q1", stem: "A patient refuses a wound dressing change. You should:", options: ["Do it anyway — it's on the care plan", "Respect the refusal, document, notify supervisor", "Leave without documenting", "Argue until they agree"], correctIndex: 1, rationale: "Right to refuse treatment: respect, document, notify." },
      { id: "ANN004-Q2", stem: "Patients must be informed of the state home health hotline:", options: ["Only if they complain", "At admission — it's a CMS requirement", "Never — it's internal information", "At discharge only"], correctIndex: 1, rationale: "Patients must know the state hotline number per § 484.50." },
      { id: "ANN004-Q3", stem: "Patient grievances should be handled:", options: ["By ignoring them", "Listened to, reported, without retaliation", "By the patient's family", "Only if written"], correctIndex: 1, rationale: "Listen, report to supervisor, no retaliation — grievance right is protected." },
      { id: "ANN004-Q4", stem: "Patients have the right to participate in:", options: ["Agency board meetings", "Their own care planning and treatment decisions", "Hiring decisions", "Budget discussions"], correctIndex: 1, rationale: "Patients have the right to participate in care planning and treatment decisions." },
      { id: "ANN004-Q5", stem: "Patient rights must be communicated:", options: ["Annually", "Before or during the first visit", "Only when requested", "At discharge"], correctIndex: 1, rationale: "Per § 484.50: before or during the first visit." },
    ],
    passScore: 80,
  },

  // ANN-005: Abuse/Neglect Reporting Annual
  {
    id: "ANN-005",
    title: "Annual Abuse/Neglect Reporting Refresher",
    track: "ANN", durationMinutes: 30, policyMapped: ["CL-PR-006", "HR-ER-009"],
    pages: [
      { title: "Mandatory Reporting Annual Refresher", content: `<h2>ANN-005: Abuse/Neglect Reporting</h2><p>Annual mandatory reporter refresher. You remain a mandatory reporter under California Penal Code § 11160-11174 at all times.</p><div style="background:#FBE9E7;padding:16px;border-radius:8px;margin:16px 0;"><h3>Annual Reminders:</h3><ul><li>6 types: physical, emotional, sexual abuse; neglect; self-neglect; financial exploitation</li><li>Reasonable suspicion — not proof — triggers reporting obligation</li><li>Report to supervisor/DON immediately + APS within 24 hours</li><li>Document objectively: observations, measurements, exact patient quotes</li><li>Do NOT investigate or confront alleged abuser</li><li>Failure to report = criminal offense</li></ul></div>`, narration: "Annual mandatory reporter refresher. Six types of abuse and neglect. Reasonable suspicion triggers reporting. Report to supervisor and DON immediately, APS within 24 hours. Document objectively. Do not investigate. Failure to report is criminal." },
    ],
    exam: [
      { id: "ANN005-Q1", stem: "Your mandatory reporter obligation:", options: ["Ends after orientation", "Continues for as long as you work in healthcare", "Only applies to clinical staff", "Expires after 1 year"], correctIndex: 1, rationale: "Mandatory reporter status is ongoing in healthcare." },
      { id: "ANN005-Q2", stem: "Financial exploitation includes:", options: ["Patient spending their own money", "Unauthorized use of patient's assets", "Family paying for patient's groceries", "Patient donating to charity"], correctIndex: 1, rationale: "Financial exploitation = unauthorized use of patient's assets." },
      { id: "ANN005-Q3", stem: "APS reporting must occur within:", options: ["1 hour", "24 hours", "1 week", "30 days"], correctIndex: 1, rationale: "APS/law enforcement report within 24 hours." },
      { id: "ANN005-Q4", stem: "You suspect a caregiver is verbally abusing a patient. You should:", options: ["Confront the caregiver", "Report to supervisor/DON immediately — do not confront", "Wait to see if it happens again", "Ask the patient to file their own report"], correctIndex: 1, rationale: "Report immediately. Do NOT confront the alleged abuser." },
      { id: "ANN005-Q5", stem: "When documenting suspected abuse, use:", options: ["Your personal opinion", "Objective observations, measurements, and exact patient quotes", "Conclusions about who did it", "General statements like 'patient appears abused'"], correctIndex: 1, rationale: "Objective documentation only: observations, measurements, quotes." },
    ],
    passScore: 80,
  },

  // ═══════════════════════════════════════════════════════════════
  // Q2 TRAINING BLOCK
  // ═══════════════════════════════════════════════════════════════

  // ANN-006 through ANN-009
  ...([
    { id: "ANN-006", title: "Annual Infection Prevention Refresher", staff: "Clinical", pm: ["CL-SD-016"], method: "Return demo",
      focus: "Hand hygiene (WHO 5 moments), PPE donning/doffing, standard precautions, home health bag technique, patient/family education. Annual return demonstration required." },
    { id: "ANN-007", title: "Annual Bloodborne Pathogen Refresher", staff: "Exposure staff", pm: ["OSHA 29 CFR 1910.1030"], method: "Quiz 80%",
      focus: "BBP risks (HBV, HCV, HIV), engineering controls, work practice controls, post-exposure protocol (wash → report → eval within 2 hrs), HBV vaccine status verification." },
    { id: "ANN-008", title: "Emergency Preparedness Drill #1", staff: "All", pm: ["OP-FM-005", "§ 484.102"], method: "Participation",
      focus: "Tabletop or functional drill. Review your role, communication chain, patient prioritization. Document participation on HR-TD-005 Appendix B + After Action Report." },
    { id: "ANN-009", title: "Annual Workplace Safety Refresher", staff: "All", pm: ["RM-SS-001", "RM-SS-002", "HR-WM-004"], method: "Quiz",
      focus: "Home visit safety, workplace violence prevention, injury reporting, vehicle safety, environmental hazards, de-escalation techniques." },
  ] as const).map((m) => ({
    id: m.id, title: m.title, track: "ANN" as TrackId, durationMinutes: 30, policyMapped: [...m.pm],
    pages: [
      { title: m.title, content: `<h2>${m.id}: ${m.title}</h2><p><strong>Applicable Staff:</strong> ${m.staff} | <strong>Quarter:</strong> Q2 | <strong>Assessment:</strong> ${m.method}</p><div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;"><h3>Annual Review Focus:</h3><p>${m.focus}</p></div><div style="background:#FFF3E0;padding:12px;border-radius:8px;margin:12px 0;"><strong>Completion Deadline:</strong> End of Q2 (June 30). Escalation per HR-TD-001 § 4.6 at 30/45/60 days overdue.</div>`, narration: `${m.title}. Applicable to ${m.staff}. Due by end of Q2. Focus areas: ${m.focus}` },
    ],
    exam: [
      { id: `${m.id}-Q1`, stem: `This annual training is required for:`, options: ["New hires only", `${m.staff}`, "Only management", "Volunteers only"], correctIndex: 1, rationale: `Required for ${m.staff} per HR-TD-001 § 6.2.` },
      { id: `${m.id}-Q2`, stem: "This module must be completed by:", options: ["End of Q1", "End of Q2 (June 30)", "End of year", "Any time"], correctIndex: 1, rationale: "Q2 modules due by June 30." },
      { id: `${m.id}-Q3`, stem: "Escalation for overdue training begins at:", options: ["10 days", "30 days overdue", "90 days", "No escalation"], correctIndex: 1, rationale: "Per HR-TD-001 § 4.6: escalation at 30/45/60 days overdue." },
      { id: `${m.id}-Q4`, stem: "At 60 days overdue, clinical staff are:", options: ["Given a final reminder", "Suspended from patient care", "Terminated immediately", "Put on probation"], correctIndex: 1, rationale: "60 days overdue = clinical staff suspended from patient care per HR-TD-001." },
      { id: `${m.id}-Q5`, stem: "Training completion is documented in:", options: ["Personal notes", "HR-TD-001 Appendix B dashboard + Appendix C attendance records", "Email confirmation only", "No documentation needed"], correctIndex: 1, rationale: "Documented via Appendix B (dashboard) and Appendix C (attendance)." },
    ],
    passScore: 80,
  })),

  // ═══════════════════════════════════════════════════════════════
  // Q3 TRAINING BLOCK
  // ═══════════════════════════════════════════════════════════════

  // ANN-010 through ANN-013
  ...([
    { id: "ANN-010", title: "Annual Anti-Harassment Training (2 hrs CA Law)", staff: "All", pm: ["HR-ER-004"], method: "Quiz 80%",
      focus: "CA AB 1825/SB 1343 compliance. Quid pro quo, hostile work environment, protected categories, reporting channels, bystander obligation, investigation process, retaliation prohibition. 2 hours for supervisors, 1 hour for non-supervisory." },
    { id: "ANN-011", title: "Annual Pain Assessment Refresher", staff: "Clinical", pm: ["CL-SD-014"], method: "Case study",
      focus: "Pain assessment scales, patient self-report as gold standard, cultural considerations, documentation requirements, pain management plan integration, reassessment timelines." },
    { id: "ANN-012", title: "Annual Fall Risk Prevention Refresher", staff: "Clinical", pm: ["CL-SD-015"], method: "Case study",
      focus: "Fall risk screening tools, environmental assessment, medication review (fall-risk drugs), patient/caregiver education, fall prevention plan, documentation of interventions, post-fall assessment protocol." },
    { id: "ANN-013", title: "Annual Medication Safety Refresher", staff: "Clinical", pm: ["CL-SD-012", "CL-SD-013"], method: "Quiz 80%",
      focus: "Medication reconciliation at every visit, high-risk medication identification, adverse drug reaction reporting, patient education on medications, storage/disposal, 5 Rights of medication administration." },
  ] as const).map((m) => ({
    id: m.id, title: m.title, track: "ANN" as TrackId, durationMinutes: m.id === "ANN-010" ? 45 : 30, policyMapped: [...m.pm],
    pages: [
      { title: m.title, content: `<h2>${m.id}: ${m.title}</h2><p><strong>Applicable Staff:</strong> ${m.staff} | <strong>Quarter:</strong> Q3 | <strong>Assessment:</strong> ${m.method}</p><div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;"><h3>Annual Review Focus:</h3><p>${m.focus}</p></div>${m.id === "ANN-010" ? '<div style="background:#FBE9E7;padding:12px;border-radius:8px;margin:12px 0;"><strong>CA Law Requirement:</strong> Supervisors = 2 hours; Non-supervisory = 1 hour. Must be interactive with examples. Every 2 years minimum but Care Indeed requires annually.</div>' : ''}`, narration: `${m.title}. Applicable to ${m.staff}. Due in Q3. Focus areas: ${m.focus}` },
    ],
    exam: [
      { id: `${m.id}-Q1`, stem: `This Q3 annual training is required for:`, options: ["New hires only", `${m.staff}`, "Only management", "Volunteers"], correctIndex: 1, rationale: `Required for ${m.staff}.` },
      { id: `${m.id}-Q2`, stem: "Completion deadline for Q3 training:", options: ["March 31", "June 30", "September 30", "December 31"], correctIndex: 2, rationale: "Q3 modules due by September 30." },
      { id: `${m.id}-Q3`, stem: "Failure to complete annual training by deadline results in:", options: ["No consequence", "Escalation: 30-day reminder → 45-day meeting → 60-day suspension/HR action", "Automatic termination", "Pay dock only"], correctIndex: 1, rationale: "Escalation per HR-TD-001 § 4.6 at 30/45/60 days overdue." },
      { id: `${m.id}-Q4`, stem: "This competency is re-evaluated:", options: ["Once in career", "Annually per HR-TD-001", "Every 5 years", "Only if deficiency found"], correctIndex: 1, rationale: "Annual re-evaluation per HR-TD-001 § 6.2." },
      { id: `${m.id}-Q5`, stem: "Competency evidence for this module includes:", options: ["Self-attestation only", "LMS completion + assessment score + supervisor verification", "Verbal confirmation", "No evidence needed"], correctIndex: 1, rationale: "LMS completion, assessment score, and supervisor verification." },
    ],
    passScore: 80,
  })),

  // ═══════════════════════════════════════════════════════════════
  // Q4 TRAINING BLOCK
  ...([
    { id: "ANN-018", title: "Annual Advance Directives Refresher", staff: "Clinical", pm: ["CL-PR-002"], method: "Scenario",
      focus: "Types of directives, communication at admission, honoring documented wishes, emergency response with/without directives, documentation requirements." },
  ] as const).map((m) => ({
    id: m.id, title: m.title, track: "ANN" as TrackId, durationMinutes: 30, policyMapped: [...m.pm],
    pages: [
      { title: m.title, content: `<h2>${m.id}: ${m.title}</h2><p><strong>Applicable Staff:</strong> ${m.staff} | <strong>Quarter:</strong> Q4 | <strong>Assessment:</strong> ${m.method}</p><div style="background:#E3F2FD;padding:16px;border-radius:8px;margin:16px 0;"><h3>Annual Review Focus:</h3><p>${m.focus}</p></div><div style="background:#FBE9E7;padding:12px;border-radius:8px;margin:12px 0;"><strong>⚠️ FINAL DEADLINE: December 31.</strong> All annual training must be complete by year-end. Clinical staff 60 days overdue are suspended from patient care per HR-TD-001 § 4.6.</div>`, narration: `${m.title}. Applicable to ${m.staff}. Due in Q4 with a hard deadline of December 31. Focus: ${m.focus}. Clinical staff 60 days overdue are suspended from patient care.` },
    ],
    exam: [
      { id: `${m.id}-Q1`, stem: `This Q4 training applies to:`, options: ["Administrative staff only", `${m.staff}`, "New hires only", "Contract workers only"], correctIndex: 1, rationale: `Required for ${m.staff}.` },
      { id: `${m.id}-Q2`, stem: "The hard deadline for ALL annual training is:", options: ["March 31", "June 30", "September 30", "December 31"], correctIndex: 3, rationale: "All annual training must be completed by December 31." },
      { id: `${m.id}-Q3`, stem: "Clinical staff suspended from patient care at:", options: ["30 days overdue", "45 days overdue", "60 days overdue", "90 days overdue"], correctIndex: 2, rationale: "60 days overdue = suspended from patient care per HR-TD-001 § 4.6." },
      { id: `${m.id}-Q4`, stem: "Annual training completion is tracked via:", options: ["Honor system", "HR-TD-001 Appendix B dashboard", "No tracking required", "Manager memory"], correctIndex: 1, rationale: "HR-TD-001 Appendix B dashboard tracks all annual training completion." },
      { id: `${m.id}-Q5`, stem: "CMS surveyors verify annual training by:", options: ["Asking employees verbally", "Pulling personnel files and checking completion records", "Not checking annual training", "Only checking new hire training"], correctIndex: 1, rationale: "Surveyors pull files and verify completion records for annual training." },
    ],
    passScore: 80,
  })),
];



const mappedACHCAnnualModules: TrainingModule[] = ACHC_ALL_MODULES.map((m) => ({
  id: m.moduleId,
  title: m.title,
  track: "ANN" as TrackId,
  durationMinutes: m.minimumRequiredMinutes,
  policyMapped: [],
  pages: m.pages.map((p) => {
    let content = p.contentHtml;
    if (p.challenge) {
      content += `<div style="background:#FFF3E0;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #F59E0B;text-align:left;">
        <h3>Scenario Challenge: ${p.challenge.title}</h3>
        <p><strong>Scenario:</strong> ${p.challenge.scenario}</p>
        <p><strong>Question:</strong> ${p.challenge.prompt}</p>
        <ul>
          ${p.challenge.options.map(o => `<li>${o.text} ${o.isBestPractice ? '<strong>(Best Practice)</strong>' : ''}</li>`).join('')}
        </ul>
        <p><strong>Teaching Point:</strong> ${p.challenge.teachingPoint}</p>
      </div>`;
    }
    return {
      title: p.title,
      content,
      narration: p.narrationText,
      audioLabel: p.title,
      imageAlt: p.media.mediaInstruction || p.title,
    };
  }),
  exam: m.finalAssessmentQuestions.map((q) => ({
    id: q.questionId,
    stem: q.questionText,
    options: q.options.map(o => o.text),
    correctIndex: q.options.findIndex(o => o.isCorrect),
    rationale: q.options.find(o => o.isCorrect)?.rationale || "Correct.",
  })),
  passScore: m.passingScore || 80,
}));

// ─────────────────────────────────────────────────────────────────────────────
// ALL_MODULES ARRAY (Assembled)
// ─────────────────────────────────────────────────────────────────────────────
const cms485OnboardingModule: TrainingModule = {
  id: "cms-485",
  title: "CMS-485 Plan of Care and Compliance Integration",
  track: "ADV",
  durationMinutes: 120,
  policyMapped: ["CL-PR-001"],
  pages: [
    { title: "Overview", content: "<h2>CMS-485 Plan of Care</h2><p>Foundation for compliant POC documentation.</p>", narration: "Overview of CMS-485 Plan of Care requirements." },
    { title: "Orders & Goals", content: "<h2>Orders and Goals</h2><p>Specific, measurable, patient-centered.</p>", narration: "Building specific orders and measurable goals." },
  ],
  exam: [
    { id: "cms485-q1", stem: "The CMS-485 is the:", options: ["Physician order form", "Home Health Certification and Plan of Care", "Billing invoice", "Discharge summary"], correctIndex: 1, rationale: "It is the Plan of Care document." },
    { id: "cms485-q2", stem: "POC documentation should be:", options: ["Vague and general", "Specific and traceable", "Completed after discharge", "Optional for Medicare"], correctIndex: 1, rationale: "Must be specific and traceable for compliance and payment." },
  ],
  passScore: 80,
  regulatoryBasis: "42 CFR §484.60",
};

const qapiOnboardingModule: TrainingModule = {
  id: "qapi",
  title: "Quality Assessment and Performance Improvement (QAPI) Training",
  track: "ADV",
  durationMinutes: 180,
  policyMapped: ["QA-PG-001"],
  pages: [
    { title: "QAPI Framework", content: "<h2>QAPI Program Structure</h2><p>Performance improvement and data-driven quality.</p>", narration: "Introduction to QAPI framework and requirements." },
    { title: "PIP and RCA", content: "<h2>Performance Improvement Projects</h2><p>Identify, analyze, correct using RCA/CAPA.</p>", narration: "Using PIPs and root cause analysis." },
  ],
  exam: [
    { id: "qapi-q1", stem: "QAPI stands for:", options: ["Quality and Performance Improvement", "Quality Assessment and Performance Improvement", "Quarterly Audit Program", "Quality Assurance Protocol"], correctIndex: 1, rationale: "Quality Assessment and Performance Improvement." },
    { id: "qapi-q2", stem: "A key QAPI tool is:", options: ["RCA / CAPA", "Only financial audit", "Staff satisfaction survey only", "Marketing plan"], correctIndex: 0, rationale: "Root cause analysis and corrective action." },
  ],
  passScore: 80,
  regulatoryBasis: "42 CFR §484.65",
};

const oasisSocModule: TrainingModule = {
  id: "oasis-e2-soc",
  title: "OASIS-E2 Start of Care Assessment",
  track: "ADV",
  durationMinutes: 150,
  policyMapped: ["CL-CP-001"],
  pages: [
    { title: "SOC Assessment", content: "<h2>OASIS-E2 SOC</h2><p>Accurate item coding at start of care.</p>", narration: "OASIS-E2 Start of Care assessment process." },
    { title: "Item Coding", content: "<h2>Key Items</h2><p>GG, wounds, behaviors, medications.</p>", narration: "Accurate coding of functional and clinical items." },
  ],
  exam: [
    { id: "oasis-q1", stem: "OASIS-E2 is used for:", options: ["Only billing", "Quality measurement and payment", "Physician orders", "HR records"], correctIndex: 1, rationale: "OASIS data drives quality reporting and case mix." },
    { id: "oasis-q2", stem: "SOC stands for:", options: ["Start of Care", "Summary of Charges", "Service Outcome Check", "Survey of Compliance"], correctIndex: 0, rationale: "Start of Care." },
  ],
  passScore: 80,
  regulatoryBasis: "OASIS-E2 CMS Guidance + 42 CFR 484",
};

const docMattersModule: TrainingModule = {
  id: "documentation-matters",
  title: "CMS Documentation Matters / Documentation Defensibility",
  track: "ADV",
  durationMinutes: 120,
  policyMapped: ["CL-CD-001"],
  pages: [
    { title: "Defensible Notes", content: "<h2>Defensible Documentation</h2><p>Weak vs strong examples.</p>", narration: "Principles of defensibility in clinical notes." },
    { title: "Surveyor Lens", content: "<h2>How Surveyors Review</h2><p>Timeline, consistency, specificity.</p>", narration: "Viewing documentation through the surveyor's lens." },
  ],
  exam: [
    { id: "doc-q1", stem: "Defensible documentation is:", options: ["Vague and timely", "Specific, accurate, and traceable", "Copied from prior notes", "Completed days later"], correctIndex: 1, rationale: "Specific, accurate, traceable." },
    { id: "doc-q2", stem: "A common documentation pitfall is:", options: ["Using teach-back", "Copy-paste without review", "Objective measurements", "Patient quotes"], correctIndex: 1, rationale: "Copy-paste without clinical review creates risk." },
  ],
  passScore: 80,
  regulatoryBasis: "42 CFR §484.60 / CL-CP-001",
};

const ALL_MODULES: TrainingModule[] = [
  ...GAO_MODULES_PART1,     // GAO 001-014
  ...GAO_MODULES_PART2,     // GAO 015-EXAM
  ...ADM_MODULES,           // Administrator
  ...DON_MODULES,           // Director of Nursing
  ...RN_MODULES,            // Registered Nurse
  ...LVN_MODULES,           // Licensed Vocational Nurse
  ...PT_MODULES,            // Physical Therapist
  ...PTA_MODULES,           // PT Assistant
  ...OT_MODULES,            // Occupational Therapist
  ...COTA_MODULES,          // OT Assistant
  ...SLP_MODULES,           // Speech-Language Path
  ...MSW_MODULES,           // Medical Social Worker
  ...HHA_MODULES,           // Home Health Aide
  ...mappedACHCAnnualModules, // Mapped ACHC Annual Curriculum
  cms485OnboardingModule,
  qapiOnboardingModule,
  oasisSocModule,
  docMattersModule,
];

const MODULE_MAP: Record<string, TrainingModule> = {};
ALL_MODULES.forEach((m) => { MODULE_MAP[m.id] = m; });

// SECTION G: CORE UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// --- Inline Styles (no external CSS) ---
const styles = {
  app: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: BRAND.bg,
    minHeight: "100vh",
    color: BRAND.textPrimary,
  } as React.CSSProperties,
  header: {
    background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`,
    color: "white",
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  } as React.CSSProperties,
  headerTitle: {
    fontSize: "20px",
    fontWeight: 700,
    margin: 0,
  } as React.CSSProperties,
  headerSub: {
    fontSize: "12px",
    opacity: 0.85,
    margin: 0,
  } as React.CSSProperties,
  main: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "24px",
  } as React.CSSProperties,
  card: {
    background: BRAND.bgCard,
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "none",
    padding: "20px",
    marginBottom: "16px",
  } as React.CSSProperties,
  btn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
    transition: "all 0.2s",
  } as React.CSSProperties,
  btnPrimary: {
    background: BRAND.primary,
    color: "white",
  } as React.CSSProperties,
  btnAccent: {
    background: BRAND.accent,
    color: "white",
  } as React.CSSProperties,
  btnOutline: {
    background: "transparent",
    color: BRAND.primary,
    border: `2px solid ${BRAND.primary}`,
  } as React.CSSProperties,
  progressBar: {
    width: "100%",
    height: "8px",
    background: "#E2E8F0",
    borderRadius: "4px",
    overflow: "hidden",
  } as React.CSSProperties,
  progressFill: (pctVal: number, color: string = BRAND.primary) => ({
    height: "100%",
    width: `${pctVal}%`,
    background: color,
    borderRadius: "4px",
    transition: "width 0.4s ease",
  }) as React.CSSProperties,
  badge: (color: string) => ({
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: 600,
    background: `${color}15`,
    color: color,
  }) as React.CSSProperties,
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION H: VIEW COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// --- Track Selection Dashboard ---
const TrackSelector: React.FC<{
  onSelectTrack: (t: TrackId) => void;
  progress: UserProgress;
}> = ({ onSelectTrack, progress }) => {
  const trackOrder: TrackId[] = [
    "GAO","ADM","DON","RN","LVN","PT","PTA","OT","COTA","SLP","MSW","HHA"
  ];

  const getTrackProgress = (trackId: TrackId): number => {
    const track = TRACKS[trackId];
    const completed = track.moduleIds.filter((id) => progress.completedModules[id]?.passed).length;
    return pct(completed, track.moduleIds.length);
  };

  // isLocked kept for future but disabled for full admin/demo unlock
  // const isLocked = ... (disabled)

  const completedCount = Object.values(progress.completedModules).filter((m) => m.passed).length;
  const rewards = [
    { label: "Orientation Spark", unlock: 1, theme: "Copper Accent Theme", desc: "Unlocks a warm copper visual accent package." },
    { label: "Consistency Core", unlock: 5, theme: "Teal Pulse Theme", desc: "Unlocks a teal pulse UI treatment for progress cards." },
    { label: "Compliance Climber", unlock: 10, theme: "Graphite Minimal Theme", desc: "Unlocks a minimalist graphite visual skin." },
    { label: "Policy Pathfinder", unlock: 20, theme: "Emerald Audit Theme", desc: "Unlocks an emerald high-contrast compliance style." },
    { label: "Mastery Architect", unlock: 35, theme: "Obsidian Prestige Theme", desc: "Unlocks a prestige-level obsidian cosmetic pack." },
    { label: "Custom Reward Slot", unlock: 50, theme: "TBD by Team", desc: "Reserved slot for your custom reward definition." },
  ];
  const unlockedCount = rewards.filter((r) => completedCount >= r.unlock).length;

  return (
    <div>
      {/* Badge Rewards Grid */}
      <div style={{ ...styles.card, padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>Badge Rewards</h2>
          <span style={{ fontSize: "12px", fontWeight: 600, color: BRAND.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {unlockedCount}/{rewards.length} unlocked
          </span>
        </div>
        <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: BRAND.textSecondary }}>
          Completed trainings: <span style={{ fontWeight: 600, color: BRAND.textPrimary }}>{completedCount}</span>. Cosmetic rewards unlock automatically as you complete modules.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "12px" }}>
          {rewards.map(reward => {
            const unlocked = completedCount >= reward.unlock;
            return (
              <div
                key={reward.label}
                className="rounded-lg bg-surface-glass shadow-glass-inset p-3 transition"
                style={{ background: unlocked ? "#E8F5E9" : undefined }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: unlocked ? "#10B981" : "#64748B" }}>
                    {unlocked ? "Unlocked" : "Locked"}
                  </span>
                  <span style={{ fontSize: "10px", color: BRAND.textSecondary, fontFamily: "monospace" }}>
                    {reward.unlock} complete
                  </span>
                </div>
                <h3 style={{ margin: "0 0 2px 0", fontSize: "14px", fontWeight: 600 }}>{reward.label}</h3>
                <p style={{ margin: "0 0 6px 0", fontSize: "11px", fontWeight: 600, color: BRAND.primaryLight }}>{reward.theme}</p>
                <p style={{ margin: 0, fontSize: "11px", color: BRAND.textSecondary, lineHeight: 1.4 }}>{reward.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-lg tablet-l:grid-cols-2 laptop:grid-cols-3">
        {trackOrder.map((tid) => {
          const track = TRACKS[tid];
          // Demo states for MVP visual (some complete, some in progress, some 0)
          let prog = getTrackProgress(tid);
          if (tid === "GAO") prog = 100;
          if (tid === "ADM") prog = 68;
          if (tid === "DON") prog = 42;
          if (tid === "RN") prog = 0;
          if (tid === "HHA") prog = 100;

          const moduleCount = track.moduleIds.length;
          const completedCount = Math.round((prog / 100) * moduleCount);

          const barColor = prog === 100 
            ? "bg-brand-teal" 
            : prog > 0 
              ? "bg-brand-orange" 
              : "bg-muted";

          return (
            <article
              key={tid}
              onClick={() => onSelectTrack(tid)}
              className="grid min-h-[240px] content-between gap-lg rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest transition duration-fast ease-standard hover:shadow-hover cursor-pointer"
            >
              <div className="grid gap-md">
                <div>
                  <h3 className="text-h3 font-medium text-ink">{track.name}</h3>
                  <p className="mt-xs text-xs text-muted">{track.cmsBasis}</p>
                  <p className="mt-2 text-xs text-secondary leading-snug">{track.description || "Role-specific competency and regulatory training per CMS CoPs."}</p>
                </div>

                <div className="grid grid-cols-3 gap-sm">
                  <div className="rounded-md bg-surface-glass p-sm shadow-glass-inset">
                    <div className="text-h3 text-ink">{completedCount}</div>
                    <div className="text-tag text-muted">Done</div>
                  </div>
                  <div className="rounded-md bg-surface-glass p-sm shadow-glass-inset">
                    <div className="text-h3 text-ink">{moduleCount}</div>
                    <div className="text-tag text-muted">Modules</div>
                  </div>
                  <div className="rounded-md bg-surface-glass p-sm shadow-glass-inset">
                    <div className="text-h3 text-ink">{prog}%</div>
                    <div className="text-tag text-muted">Progress</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-1.5 bg-surface-glass rounded overflow-hidden shadow-glass-inset">
                  <div className={`h-full transition-all ${barColor}`} style={{ width: `${prog}%` }} />
                </div>

                {prog === 100 && (
                  <div className="text-[10px] text-tone-green flex items-center gap-1">
                    <span>✓ Certificate available</span>
                  </div>
                )}
                {prog > 0 && prog < 100 && (
                  <div className="text-[10px] text-brand-orange">In progress — keep going</div>
                )}
                {prog === 0 && (
                  <div className="text-[10px] text-muted">Not started</div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Certificates of Completion (MVP) */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-ink">Certificates of Completion</h3>
          <span className="text-xs text-muted">2 earned</span>
        </div>
        <div className="grid gap-3 tablet-l:grid-cols-2 laptop:grid-cols-3">
          {/* Example completed certificates */}
          <div className="rounded-lg bg-surface-glass shadow-rest p-4 border border-transparent">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted">Certificate</div>
                <div className="font-medium text-ink mt-0.5">General Agency Orientation</div>
                <div className="text-xs text-muted mt-1">Completed • 100% • HR-TA-005</div>
              </div>
              <button 
                onClick={() => alert('Certificate downloaded (MVP placeholder)')}
                className="text-xs px-3 py-1 rounded bg-tone-green-bg text-tone-green-text hover:bg-tone-green-bg/80"
              >
                Download PDF
              </button>
            </div>
          </div>
          <div className="rounded-lg bg-surface-glass shadow-rest p-4 border border-transparent">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted">Certificate</div>
                <div className="font-medium text-ink mt-0.5">Home Health Aide Orientation</div>
                <div className="text-xs text-muted mt-1">Completed • 100% • HR-TD-003</div>
              </div>
              <button 
                onClick={() => alert('Certificate downloaded (MVP placeholder)')}
                className="text-xs px-3 py-1 rounded bg-tone-green-bg text-tone-green-text hover:bg-tone-green-bg/80"
              >
                Download PDF
              </button>
            </div>
          </div>
          <div className="rounded-lg bg-surface-glass shadow-rest p-4 opacity-60 border border-transparent">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted">Certificate</div>
              <div className="font-medium text-ink mt-0.5">Administrator Track</div>
              <div className="text-xs text-muted mt-1">Locked — 68% complete</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Module List for a Track ---
const ModuleList: React.FC<{
  trackId: TrackId;
  progress: UserProgress;
  onSelectModule: (moduleId: string) => void;
  onBack: () => void;
}> = ({ trackId, progress, onSelectModule, onBack }) => {
  const track = TRACKS[trackId];

  return (
    <div>
      {trackId !== "ANN" && trackId !== "ADV" && (
        <button
          className="mb-4 rounded-lg bg-surface-glass px-4 py-2 text-sm text-brand-teal shadow-glass-inset"
          onClick={onBack}
        >
          ← Back to Tracks
        </button>
      )}

      {/* Main track header card (borderless + shadow) */}
      <article className="mb-lg rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest">
        <div className="mb-md">
          <h2 className="text-h2 font-medium text-ink">{track.name}</h2>
          <p className="text-sm text-muted">{track.cmsBasis} • Reports to {track.reportsTo}</p>
        </div>
        <div className="rounded-md bg-surface-glass p-3 text-sm shadow-glass-inset">
          <strong>Completion Gate:</strong> {track.completionGate}
        </div>
      </article>

      {/* Modules as Framework-style cards grid (no borders, shadows, avoid long list) */}
      <div className="grid gap-lg tablet-l:grid-cols-2 laptop:grid-cols-3">
        {track.moduleIds.map((mid, idx) => {
          const mod = MODULE_MAP[mid];
          const result = progress.completedModules[mid];
          const isAvailable = mod !== undefined;
          const progPct = result?.passed ? 100 : 0;

          return (
            <article
              key={mid}
              onClick={() => isAvailable && onSelectModule(mid)}
              className="grid min-h-[180px] content-between gap-lg rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest transition duration-fast hover:shadow-hover cursor-pointer"
              style={{ opacity: isAvailable ? 1 : 0.5 }}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted">RN-ADV-{String(idx+1).padStart(2,'0')}</div>
                    <h3 className="text-h3 font-medium text-ink mt-1">{isAvailable ? mod.title : `Module ${mid}`}</h3>
                  </div>
                  {result?.passed && <span className="text-[10px] px-2 py-0.5 rounded bg-tone-green-bg text-tone-green-text">Passed</span>}
                </div>
                {isAvailable && (
                  <p className="mt-3 text-xs text-muted">{mod.durationMinutes} min • {(mod.pages?.length ?? 0)} pages • {(mod.exam?.length ?? 0)} questions</p>
                )}
                {track.id === "ADV" && (
                  <div className="mt-2 text-[10px] text-muted space-x-1">
                    <span>Role: Clinical</span> • <span>Policy: {mod.policyMapped?.[0] || '—'}</span>
                    <span className="ml-2">Mapped narration ✓</span>
                    <span>Evidence ✓</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-surface-glass p-2 shadow-glass-inset text-xs">
                  <div className="text-h3 text-ink">{progPct}%</div>
                  <div className="text-tag text-muted">Complete</div>
                </div>
                <div className="rounded-md bg-surface-glass p-2 shadow-glass-inset text-xs">
                  <div className="text-h3 text-ink">{isAvailable ? mod.exam.length : '—'}</div>
                  <div className="text-tag text-muted">Questions</div>
                </div>
                <div className="rounded-md bg-surface-glass p-2 shadow-glass-inset text-xs">
                  <div className="text-h3 text-ink">{result?.examScore ?? '—'}{result ? '%' : ''}</div>
                  <div className="text-tag text-muted">Best Score</div>
                </div>
              </div>
              {track.id === "ADV" && (
                <div className="text-[10px] mt-1 p-1 bg-white/50 rounded text-muted" style={{fontSize:'9px'}}>
                  {mid === 'cms-485' && 'Assessment → Orders → Goals → Freq → Signature'}
                  {mid === 'qapi' && 'KPI • PIP • RCA/CAPA • Committee'}
                  {mid === 'oasis-e2-soc' && 'SOC Rail • Item Card • Evidence • Rationale'}
                  {mid === 'documentation-matters' && 'Weak vs Defensible • Surveyor Lens • Timeline'}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};

// --- Module Player (Pages + Exam) ---
const ModulePlayer: React.FC<{
  moduleId: string;
  progress: UserProgress;
  onComplete: (result: ModuleResult) => void;
  onBack: () => void;
}> = ({ moduleId, progress, onComplete, onBack }) => {
  const mod = MODULE_MAP[moduleId];
  const [currentPage, setCurrentPage] = useState(0);
  const [isExamMode, setIsExamMode] = useState(false);
  const [examAnswers, setExamAnswers] = useState<(number | null)[]>([]);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState(0);
  const [isNarrating, setIsNarrating] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    return () => stopNarration();
  }, []);

  useEffect(() => {
    setIsNarrating(false);
    stopNarration();
  }, [currentPage]);

  if (!mod) {
    return (
      <div style={styles.card}>
        <p>Module <strong>{moduleId}</strong> will be available in Parts 2-4.</p>
        <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={onBack}>← Back</button>
      </div>
    );
  }

  const pagesSafe = mod.pages ?? [];
  const examSafe = mod.exam ?? [];
  const totalPages = pagesSafe.length;
  const pageProgress = pct(currentPage + 1, totalPages);

  const handleNarrate = () => {
    if (isNarrating) {
      stopNarration();
      setIsNarrating(false);
    } else {
      const page = pagesSafe[currentPage] ?? { narration: 'No narration available.' };
      speakNarration(page.narration);
      setIsNarrating(true);
    }
  };

  const handleStartExam = () => {
    setIsExamMode(true);
    setExamAnswers(new Array(examSafe.length).fill(null));
    setExamSubmitted(false);
    stopNarration();
  };

  const handleExamAnswer = (qIdx: number, optIdx: number) => {
    if (examSubmitted) return;
    const updated = [...examAnswers];
    updated[qIdx] = optIdx;
    setExamAnswers(updated);
  };

  const handleSubmitExam = () => {
    const correct = examSafe.reduce((acc, q, idx) => acc + (examAnswers[idx] === q.correctIndex ? 1 : 0), 0);
    const score = pct(correct, examSafe.length);
    setExamScore(score);
    setExamSubmitted(true);

    if (score >= mod.passScore) {
      const elapsed = Math.round((Date.now() - startTime.current) / 1000);
      const attemptNum = (progress.examAttempts[moduleId]?.length || 0) + 1;
      onComplete({
        moduleId,
        completedAt: new Date().toISOString(),
        examScore: score,
        passed: true,
        timeSpentSeconds: elapsed,
        attemptNumber: attemptNum,
      });
      try {
        const j = useJourneyStore.getState();
        j.recordLearnerCompletion(j.currentEmployeeId, moduleId, true, score);
      } catch (e) {}
    } else {
      try {
        const j = useJourneyStore.getState();
        j.recordLearnerCompletion(j.currentEmployeeId, moduleId, false, score);
      } catch (e) {}
    }
  };

  // --- EXAM VIEW ---
  if (isExamMode) {
    return (
      <div>
        <div style={{ ...styles.card, background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryLight})`, color: "white" }}>
          <h2 style={{ margin: 0 }}>📝 Final Exam — {mod.id}: {mod.title}</h2>
          <p style={{ margin: "4px 0 0 0", opacity: 0.9 }}>
            {examSafe.length} questions · {mod.passScore ?? 80}% to pass
          </p>
        </div>

        {examSafe.map((q, qIdx) => (
          <div key={q.id} style={{ ...styles.card }}>
            <p style={{ fontWeight: 600, marginBottom: "12px" }}>
              {qIdx + 1}. {q.stem}
            </p>
            {q.options.map((opt, optIdx) => {
              const isSelected = examAnswers[qIdx] === optIdx;
              const isCorrect = optIdx === q.correctIndex;
              let bg = "transparent";
              let border = BRAND.border;
              if (examSubmitted) {
                if (isCorrect) { bg = "#D1FAE5"; border = BRAND.success; }
                else if (isSelected && !isCorrect) { bg = "#FEE2E2"; border = BRAND.error; }
              } else if (isSelected) {
                bg = "#E0F7FA"; border = BRAND.primary;
              }

              return (
                <div
                  key={optIdx}
                  onClick={() => handleExamAnswer(qIdx, optIdx)}
                  style={{
                    padding: "10px 14px",
                    margin: "6px 0",
                    borderRadius: "8px",
                    border: `2px solid ${border}`,
                    background: bg,
                    cursor: examSubmitted ? "default" : "pointer",
                    transition: "all 0.2s",
                    fontSize: "14px",
                  }}
                >
                  {String.fromCharCode(65 + optIdx)}. {opt}
                </div>
              );
            })}
            {examSubmitted && (
              <div style={{
                marginTop: "8px", padding: "10px", borderRadius: "6px",
                background: examAnswers[qIdx] === q.correctIndex ? "#D1FAE5" : "#FEF3C7",
                fontSize: "13px",
              }}>
                <strong>Rationale:</strong> {q.rationale}
                {q.regulatoryRef && <span style={{ display: "block", marginTop: "4px", color: BRAND.textSecondary }}>Ref: {q.regulatoryRef}</span>}
              </div>
            )}
          </div>
        ))}

        {!examSubmitted ? (
          <button
            style={{
              ...styles.btn, ...styles.btnPrimary,
              width: "100%",
              padding: "14px",
              fontSize: "16px",
              opacity: examAnswers.some((a) => a === null) ? 0.5 : 1,
            }}
            disabled={examAnswers.some((a) => a === null)}
            onClick={handleSubmitExam}
          >
            Submit Exam
          </button>
        ) : (
          <div style={{
            ...styles.card,
            textAlign: "left",
            background: examScore >= mod.passScore ? "#D1FAE5" : "#FEE2E2",

          }}>
            <h2 style={{ margin: "0 0 8px 0" }}>
              {examScore >= mod.passScore ? "🎉 PASSED!" : "❌ Not Yet — Remediation Required"}
            </h2>
            <p style={{ fontSize: "24px", fontWeight: 700, margin: "8px 0" }}>
              Score: {examScore}% {examScore >= mod.passScore ? `(Passing: ${mod.passScore}%)` : `(Need: ${mod.passScore}%)`}
            </p>
            {examScore < mod.passScore && (
              <p style={{ fontSize: "14px", color: BRAND.textSecondary }}>
                Per HR-TA-005: Retake within 3 business days. Review the module content and try again.
              </p>
            )}
            <button
              style={{ ...styles.btn, ...(examScore >= mod.passScore ? styles.btnPrimary : styles.btnAccent), marginTop: "12px" }}
              onClick={onBack}
            >
              {examScore >= mod.passScore ? "← Back to Module List" : "← Review & Retry"}
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- PAGE VIEW ---
  const page = mod.pages[currentPage];

  return (
    <div>
      {/* Module header */}
      <div style={{ ...styles.card, background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryLight})`, color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "18px" }}>{mod.id}: {mod.title}</h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", opacity: 0.85 }}>
              {mod.durationMinutes} min · {mod.policyMapped.join(", ")}
            </p>
          </div>
          <button style={{ ...styles.btn, background: "rgba(255,255,255,0.2)", color: "white" }} onClick={onBack}>
            ✕ Exit
          </button>
        </div>
        <div style={{ marginTop: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
            <span>Page {currentPage + 1} of {totalPages}</span>
            <span>{pageProgress}%</span>
          </div>
          <div style={{ ...styles.progressBar, background: "rgba(255,255,255,0.2)" }}>
            <div style={styles.progressFill(pageProgress, BRAND.accentLight)} />
          </div>
        </div>
      </div>

      {/* Page content */}
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 style={{ margin: 0, color: BRAND.primary }}>{page.title}</h3>
          <button
            style={{ ...styles.btn, ...(isNarrating ? styles.btnAccent : styles.btnOutline), fontSize: "13px", padding: "6px 14px" }}
            onClick={handleNarrate}
          >
            {isNarrating ? "⏹ Stop Narration" : "🔊 Narrate"}
          </button>
        </div>
        <div
          style={{ lineHeight: 1.7, fontSize: "15px" }}
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
        <button
          style={{ ...styles.btn, ...styles.btnOutline, flex: 1, opacity: currentPage === 0 ? 0.4 : 1 }}
          disabled={currentPage === 0}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          ← Previous
        </button>
        {currentPage < totalPages - 1 ? (
          <button
            style={{ ...styles.btn, ...styles.btnPrimary, flex: 1 }}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next →
          </button>
        ) : (
          <button
            style={{ ...styles.btn, ...styles.btnAccent, flex: 1 }}
            onClick={handleStartExam}
          >
            📝 Start Final Exam
          </button>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION I: APP ROOT
// ─────────────────────────────────────────────────────────────────────────────

type LmsCategory = 'onboarding' | 'annual' | 'advanced' | 'certificates';

type ViewState =
  | { view: "tracks" }
  | { view: "modules"; trackId: TrackId }
  | { view: "player"; moduleId: string; trackId: TrackId };

const LMS_CATEGORY_TABS: Array<{ id: LmsCategory; label: string; count?: string }> = [
  { id: 'onboarding', label: 'Onboarding Training', count: '41' },
  { id: 'annual', label: 'ACHC Training', count: '12' },
  { id: 'advanced', label: 'Advanced Training', count: '1' },
  { id: 'certificates', label: 'My Certificates' },
];

const isLmsCategory = (value: string | null): value is LmsCategory =>
  value === 'onboarding' || value === 'annual' || value === 'advanced' || value === 'certificates';

const CareIndeedLmsHeader: React.FC<{
  activeCategory: LmsCategory;
  onTabChange: (tab: LmsCategory) => void;
}> = ({ activeCategory, onTabChange }) => (
  <header
    aria-label="Learning header"
    style={{
      position: "sticky",
      top: "12px",
      zIndex: 30,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "24px",
      flexWrap: "wrap",
      marginBottom: "24px",
      padding: "20px 22px",
      borderRadius: "8px",
      background: "rgba(255, 255, 255, 0.88)",
      border: `1px solid ${BRAND.border}`,
      boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
      backdropFilter: "blur(18px)",
    }}
  >
    <div style={{ minWidth: "260px" }}>
      <h1
        style={{
          margin: 0,
          fontSize: "20px",
          lineHeight: 1.2,
          fontWeight: 650,
          color: BRAND.textPrimary,
        }}
      >
        Role-Based Onboarding &amp; Competency Journey
      </h1>
      <p style={{ margin: "6px 0 0 0", fontSize: "14px", color: BRAND.textLight }}>
        42 CFR Part 484 • CMS CoP Alignment • Survey-Ready • LMS-Trackable
      </p>
    </div>

    <nav
      aria-label="Learning category navigation"
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        gap: "10px 28px",
        flex: "1 1 520px",
        flexWrap: "wrap",
      }}
    >
      {LMS_CATEGORY_TABS.map((tab) => {
        const isActive = activeCategory === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            aria-current={isActive ? "page" : undefined}
            style={{
              padding: "0 0 10px 0",
              fontSize: "14px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              border: "none",
              borderBottom: isActive ? `3px solid ${BRAND.primary}` : "3px solid transparent",
              background: "transparent",
              cursor: "pointer",
              color: isActive ? BRAND.primary : BRAND.textSecondary,
              outline: "none",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
            {tab.count && (
              <span
                style={{
                  marginLeft: "6px",
                  background: "#F1F5F9",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "10px",
                  color: BRAND.textSecondary,
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  </header>
);

const CareIndeedOnboardingLMS: React.FC = () => {
  const navigate = useNavigate();
  const { state: learnerState } = useLearner();
  const [activeCategory, setActiveCategory] = useState<LmsCategory>(() => {
    const saved = localStorage.getItem("ci_lms_active_tab");
    return isLmsCategory(saved) ? saved : 'onboarding';
  });

  const [viewState, setViewState] = useState<ViewState>(() => {
    const savedTab = localStorage.getItem("ci_lms_active_tab");
    if (savedTab === 'annual') {
      return { view: "modules", trackId: "ANN" };
    }
    if (savedTab === 'advanced') {
      return { view: "modules", trackId: "ADV" };
    }
    return { view: "tracks" };
  });

  const [rawProgress, setRawProgress] = useState<UserProgress>(() => {
    const saved = loadProgress();
    return saved || {
      currentTrack: null,
      currentModuleId: null,
      currentPage: 0,
      completedModules: {},
      examAttempts: {},
      startedAt: new Date().toISOString(),
    };
  });

  useEffect(() => {
    saveProgress(rawProgress);
  }, [rawProgress]);

  const progress = React.useMemo(() => {
    const completed = { ...rawProgress.completedModules };
    
    Object.entries(learnerState.moduleQuizPassed).forEach(([mid, passed]) => {
      if (passed) {
        if (mid.startsWith("m") && !mid.includes("-")) {
          const num = parseInt(mid.slice(1), 10);
          if (!isNaN(num)) {
            const achcId = `ACHC-ART-M${String(num).padStart(2, "0")}`;
            completed[achcId] = {
              moduleId: achcId,
              completedAt: new Date().toISOString(),
              examScore: 100,
              passed: true,
              timeSpentSeconds: 1200,
              attemptNumber: 1
            };
          }
        } else {
          completed[mid] = {
            moduleId: mid,
            completedAt: new Date().toISOString(),
            examScore: 100,
            passed: true,
            timeSpentSeconds: 1200,
            attemptNumber: 1
          };
        }
      }
    });

    return {
      ...rawProgress,
      completedModules: completed
    };
  }, [rawProgress, learnerState.moduleQuizPassed]);

  const handleModuleComplete = useCallback((result: ModuleResult) => {
    setRawProgress((prev) => ({
      ...prev,
      completedModules: { ...prev.completedModules, [result.moduleId]: result },
    }));
  }, []);

  const handleTabChange = (tab: LmsCategory) => {
    setActiveCategory(tab);
    localStorage.setItem("ci_lms_active_tab", tab);
    if (tab === 'onboarding') {
      setViewState({ view: "tracks" });
    } else if (tab === 'annual') {
      setViewState({ view: "modules", trackId: "ANN" });
    } else if (tab === 'advanced') {
      setViewState({ view: "modules", trackId: "ADV" });
    }
  };

  return (
    <div className="theme-ci-light-orange bg-canvas min-h-screen p-6 md:p-8" style={{ color: 'var(--text-primary)' }}>
      <CareIndeedLmsHeader activeCategory={activeCategory} onTabChange={handleTabChange} />

      {activeCategory === 'annual' && viewState.view === 'modules' && (
        <div style={{ background: "#F0FAFA", padding: "16px 20px", borderRadius: "8px", marginBottom: "24px", fontSize: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, fontWeight: 600, color: BRAND.primaryLight, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "12px" }}>ACHC Required — Field Worker Edition</p>
          <p style={{ margin: "4px 0 0 0", color: BRAND.textSecondary }}>
            12 modules · On hire + annually · 80% passing threshold · All modules include TTS narration and scenario-based challenges.
          </p>
        </div>
      )}

      {activeCategory === 'advanced' && viewState.view === 'modules' && (
        <div style={{ background: "#FFFBF0", padding: "16px 20px", borderRadius: "8px", marginBottom: "24px", fontSize: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, fontWeight: 600, color: BRAND.warning, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "12px" }}>Advanced Training — Plan of Care &amp; Compliance</p>
          <p style={{ margin: "4px 0 0 0", color: BRAND.textSecondary }}>
            Advanced compliance training covering establishment, specificity, defensibility, and clinical alignment of the CMS-485 Plan of Care.
          </p>
        </div>
      )}

      {activeCategory === 'certificates' ? (
        <MyCertificatesView />
      ) : (
        <main style={{ padding: "12px 0" }}>
          {viewState.view === "tracks" && (
            <TrackSelector
              onSelectTrack={(t) => setViewState({ view: "modules", trackId: t })}
              progress={progress}
            />
          )}
          {viewState.view === "modules" && (
            <ModuleList
              trackId={viewState.trackId}
              progress={progress}
              onSelectModule={(mid) => {
                let standardId = mid;
                if (mid.toUpperCase().startsWith("ACHC-ART-")) {
                  const match = mid.match(/M(\d+)/i);
                  standardId = match ? `m${Number(match[1])}` : mid;
                }
                navigate(`/journey/module/${standardId}`);
              }}
              onBack={() => {
                if (activeCategory === 'annual' || activeCategory === 'advanced') {
                  handleTabChange('onboarding');
                } else {
                  setViewState({ view: "tracks" });
                }
              }}
            />
          )}
          {viewState.view === "player" && (
            <ModulePlayer
              moduleId={viewState.moduleId}
              progress={progress}
              onComplete={handleModuleComplete}
              onBack={() => setViewState({ view: "modules", trackId: viewState.trackId })}
            />
          )}
        </main>
      )}
    </div>
  );
};



// ─────────────────────────────────────────────────────────────────────────────
// MY CERTIFICATES VIEW
// ─────────────────────────────────────────────────────────────────────────────

const MyCertificatesView: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(2026);
  const [modalCert, setModalCert] = useState<any>(null);

  type Cert = {
    id: string;
    title: string;
    year: number;
    completionPct: number;
    type: 'standard' | 'advanced';
    track: string;
    issued?: string;
  };

  // Demo data with mixed states for MVP
  const allCerts: Cert[] = [
    // 2026
    { id: 'c26-1', title: 'General Agency Orientation', year: 2026, completionPct: 100, type: 'standard', track: 'GAO', issued: 'June 12, 2026' },
    { id: 'c26-2', title: 'ACHC Infection Control', year: 2026, completionPct: 100, type: 'standard', track: 'ACHC', issued: 'June 15, 2026' },
    { id: 'c26-3', title: 'CMS-485 Plan of Care Mastery', year: 2026, completionPct: 100, type: 'advanced', track: 'ADV', issued: 'July 3, 2026' },
    { id: 'c26-4', title: 'HIPAA Privacy & Security', year: 2026, completionPct: 85, type: 'standard', track: 'GAO' },
    // 2027
    { id: 'c27-1', title: 'General Agency Orientation (Annual)', year: 2027, completionPct: 100, type: 'standard', track: 'GAO', issued: 'Jan 10, 2027' },
    { id: 'c27-2', title: 'QAPI Program Leadership', year: 2027, completionPct: 100, type: 'advanced', track: 'ADV', issued: 'Mar 22, 2027' },
    { id: 'c27-3', title: 'Home Health Aide Competency', year: 2027, completionPct: 60, type: 'standard', track: 'HHA' },
    { id: 'c27-4', title: 'Emergency Drill & Response', year: 2027, completionPct: 100, type: 'standard', track: 'ACHC' },
    // 2028 (future / partial)
    { id: 'c28-1', title: 'General Agency Orientation (Annual)', year: 2028, completionPct: 40, type: 'standard', track: 'GAO' },
    { id: 'c28-2', title: 'Advanced Compliance & Ethics', year: 2028, completionPct: 100, type: 'advanced', track: 'ADV' },
    { id: 'c28-3', title: 'Clinical Documentation Standards', year: 2028, completionPct: 0, type: 'standard', track: 'GAO' },
  ];

  const filteredCerts = selectedYear === 'all' 
    ? allCerts 
    : allCerts.filter(c => c.year === selectedYear);

  const years = [2026, 2027, 2028] as const;

  const openCertificate = (cert: Cert) => {
    if (cert.completionPct === 100) {
      setModalCert(cert);
    }
  };

  const closeModal = () => setModalCert(null);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-ink">My Certificates</h2>
        <p className="text-sm text-muted mt-1">Archived certificates by year. Full color = 100% complete. Greyed out = in progress.</p>
      </div>

      {/* Year Folders */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setSelectedYear('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedYear === 'all' ? 'bg-brand-teal text-white shadow-rest' : 'bg-surface-glass hover:bg-surface-hover text-muted'}`}
        >
          All Years
        </button>
        {years.map(y => (
          <button
            key={y}
            onClick={() => setSelectedYear(y)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${selectedYear === y ? 'bg-brand-teal text-white shadow-rest' : 'bg-surface-glass hover:bg-surface-hover text-muted'}`}
          >
            📁 {y}
            <span className="text-[10px] px-1.5 py-px rounded bg-white/50">{allCerts.filter(c => c.year === y).length}</span>
          </button>
        ))}
      </div>

      {/* Certificates Grid */}
      <div className="grid gap-4 grid-cols-1 tablet-l:grid-cols-2 laptop:grid-cols-3">
        {filteredCerts.map(cert => {
          const isComplete = cert.completionPct === 100;
          const isAdvanced = cert.type === 'advanced';

          const card = (
            <div
              onClick={() => openCertificate(cert)}
              className={`group relative rounded-xl p-4 transition-all cursor-pointer shadow-glass-inset bg-surface-glass ${isComplete ? 'hover:shadow-hover' : 'opacity-60 grayscale-[0.4]'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="uppercase tracking-widest text-[10px] text-muted font-bold">{cert.track}</div>
                  <div className="font-semibold text-ink mt-0.5 leading-tight">{cert.title}</div>
                </div>
                <div className={`text-xs font-mono px-2 py-0.5 rounded-full ${isComplete ? 'bg-tone-green-bg text-tone-green-text' : 'bg-surface-glass text-muted'}`}>
                  {cert.completionPct}%
                </div>
              </div>

              <div className="text-xs text-muted">
                {cert.year} • {cert.issued || 'In progress'}
              </div>

              {isAdvanced && isComplete && (
                <div className="mt-2 text-[10px] text-brand-teal font-medium">Advanced • Glowing</div>
              )}

              {!isComplete && (
                <div className="mt-2 h-1 bg-surface-glass rounded overflow-hidden">
                  <div className="h-1 bg-muted" style={{ width: `${cert.completionPct}%` }} />
                </div>
              )}
            </div>
          );

          if (isAdvanced && isComplete) {
            return (
              <div key={cert.id} className="relative">
                {/* Rainbow glow like Brad chat box */}
                <div className="absolute -inset-1.5 z-0 rounded-[20px] brad-rainbow-glow blur-xl opacity-60 group-hover:opacity-90 transition-all" aria-hidden />
                <div className="relative z-10">
                  {card}
                </div>
              </div>
            );
          }

          return <div key={cert.id}>{card}</div>;
        })}
      </div>

      {filteredCerts.length === 0 && (
        <div className="text-center text-muted py-10">No certificates for this year yet.</div>
      )}

      {/* Certificate Detail Modal */}
      {modalCert && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4" onClick={closeModal}>
          <div className="w-full max-w-4xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <button onClick={closeModal} className="text-white text-sm px-3 py-1">Close</button>
            </div>
            {/* Use the provided beautiful certificate component for 100% ones */}
            <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
              <ACHCArchivalCertificate />
            </div>
            <div className="text-center mt-3 text-xs text-white/70">Certificate ID: {modalCert.id.toUpperCase()}-{modalCert.year}</div>
          </div>
        </div>
      )}
    </div>
  );
};

const SCORM_METADATA = {
  courseTitle: "Care Indeed — Role-Based Onboarding & Competency Journey",
  courseVersion: "1.0.0",
  organization: "Care Indeed Home Health Care, Inc.",
  regulatoryBasis: "42 CFR Part 484 | CMS Conditions of Participation",
  trackingFields: [
    "Employee ID",
    "Module ID",
    "Completion date/time",
    "Assessment score",
    "Pass/Fail status",
    "Time spent",
    "Attempt number",
  ],
  completionGates: {
    gaoBeforeRole: "GAO series must complete before any role-specific track",
    roleBeforePractice: "Role-specific must complete before independent practice/duties",
    annualByDec31: "Annual series must complete by Dec 31",
    escalation: "30-day reminder → 45-day supervisor meeting → 60-day suspension (clinical)/HR action (all)",
  },
  totalModules: {
    GAO: 28,
    ADM: 15,
    DON: 16,
    RN: 16,
    LVN: 12,
    PT: 10,
    PTA: 10,
    OT: 10,
    COTA: 10,
    SLP: 8,
    MSW: 8,
    HHA: 12,
    ANN: 18,
    GRAND_TOTAL: "173 unique modules",
  },
  evidenceMap: {
    surveyorPulls: [
      "Pre-employment screening (Appendix F) — all PASS before Day 1",
      "Orientation completion (HR-TA-005 Appendix A + B) — dual signed",
      "Competency evaluations (HR-TD-003 Appendix A) — per employee per year",
      "HHA deep dive (HR-TD-003 Appendix D + E) — all 9 areas + supervision",
      "Annual training compliance (HR-TD-001 Appendix B + C)",
      "Job descriptions current (HR-TA-006 Appendix A + C)",
      "Licensure verification (HR-TA-004 Appendix B)",
      "OIG/SAM screening logs (HR-TA-003 Appendix A + C)",
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION P: COMPLIANCE LIFECYCLE CALENDAR (Reference Data)
// ─────────────────────────────────────────────────────────────────────────────

const COMPLIANCE_CALENDAR = {
  monthly: [
    { task: "OIG LEIE + SAM screening — all staff", deadline: "15th of each month", coSign: "Compliance Officer by 20th", policy: "HR-TA-003 § 6.2" },
  ],
  quarterly: [
    { quarter: "Q1", training: ["ANN-001: Compliance", "ANN-002: FWA", "ANN-003: HIPAA", "ANN-004: Patient Rights", "ANN-005: Abuse Reporting"], staff: "All", deadline: "March 31" },
    { quarter: "Q2", training: ["ANN-006: Infection Prevention", "ANN-007: BBP", "ANN-008: Emergency Drill #1", "ANN-009: Workplace Safety"], staff: "See module specs", deadline: "June 30" },
    { quarter: "Q3", training: ["ANN-010: Anti-Harassment", "ANN-011: Pain Assessment", "ANN-012: Fall Risk", "ANN-013: Medication Safety"], staff: "See module specs", deadline: "September 30" },
    { quarter: "Q4", training: ["ANN-014: OASIS Updates", "ANN-015: IT Security", "ANN-016: Emergency Drill #2", "ANN-017: Documentation", "ANN-018: Advance Directives"], staff: "See module specs", deadline: "December 31" },
  ],
  ongoing: [
    { activity: "Licensure verification", frequency: "At hire, renewal, annual", policy: "HR-TA-004" },
    { activity: "CE tracking", frequency: "Ongoing, 120-day pre-renewal check", policy: "HR-TD-002" },
    { activity: "Background re-screening", frequency: "Every 3 years", policy: "HR-TA-002" },
    { activity: "Annual competency evaluation", frequency: "Feb 1 – Oct 31", policy: "HR-TD-003" },
    { activity: "Performance evaluation", frequency: "Anniversary date + 30 days", policy: "HR-ER-001" },
    { activity: "90-day introductory evaluation", frequency: "Before Day 90", policy: "HR-ER-001" },
    { activity: "HHA in-service training", frequency: "12 hours/year", policy: "§ 484.80(d), HR-TD-001" },
    { activity: "Emergency drill participation", frequency: "2x/year", policy: "HR-TD-005, § 484.102" },
  ],
  escalation: [
    { trigger: "Employee starts before screening complete", timeline: "Immediate", action: "Admin leave, incident documented", policy: "HR-TA-001 § 6.7" },
    { trigger: "Clinical staff assigned before orientation complete", timeline: "Immediate", action: "Removed from schedule, DON notified", policy: "HR-TA-005 § 8.2" },
    { trigger: "Annual training 30 days overdue", timeline: "Day 30", action: "Written reminder to employee + supervisor", policy: "HR-TD-001 § 4.6" },
    { trigger: "Annual training 45 days overdue", timeline: "Day 45", action: "Second notice, supervisor meeting", policy: "HR-TD-001 § 4.6" },
    { trigger: "Annual training 60 days overdue", timeline: "Day 60", action: "Clinical: suspended. All: HR-ER-002", policy: "HR-TD-001 § 4.6" },
    { trigger: "Competency deficit identified", timeline: "Within 7 days", action: "Remediation plan, 60-day max resolution", policy: "HR-TD-003 § 6.3" },
    { trigger: "License expires", timeline: "Expiration date", action: "Immediate removal from clinical duties", policy: "HR-TA-004 § 6.2.5" },
    { trigger: "OIG/SAM exclusion confirmed", timeline: "Immediate", action: "Remove, terminate, CO notified <24 hrs", policy: "HR-TA-003 § 6.3" },
  ],
};



export { SCORM_METADATA, COMPLIANCE_CALENDAR, ANN_MODULES, ALL_MODULES };
export default CareIndeedOnboardingLMS;
