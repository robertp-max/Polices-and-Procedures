/**
 * LVN-007 — Wound Care: LVN Scope
 * Version 5.0 | CONTENT COMPLETE — MIGRATION/TECH QA PENDING
 * Track: LVN — Licensed Vocational Nurse
 * Regulatory: 42 CFR § 484.60 | CA B&P § 2859 | Agency policy: CL-SD-011
 * Pages: 7 | Quiz: 10 | Pass: 80%
 *
 * Standalone SC04-style module: left rich content (~55%) + right instructional SVG (~45%).
 * Quiz validates knowledge only — observed demonstration and authorized sign-off remain separate.
 * LVN does not independently stage wounds, modify orders, complete OASIS, or develop the Plan of Care.
 */
import React, { useCallback, useMemo, useState } from 'react';
import { LVNLessonNavigation, LVNNarrationFooter } from './shared/LVNModuleShell';

// ─── MODULE META ─────────────────────────────────────────────────────────────
const MODULE_META = {
  id: 'LVN-007',
  title: 'Wound Care: LVN Scope',
  track: 'LVN — Licensed Vocational Nurse',
  version: '5.0',
  status: 'CONTENT COMPLETE — MIGRATION/TECH QA PENDING',
  pages: 7,
  passing: 80,
  quizCount: 10,
  cms: '42 CFR § 484.60',
  policy: 'CL-SD-011',
  california: 'CA B&P § 2859',
  recordId: '6a558b8b3463cd690af8d632',
} as const;

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Hotspot {
  id: string;
  label: string;
  x: number;
  y: number;
  info: string;
}

interface KeyPoint {
  icon: string;
  title: string;
  detail: string;
}

interface PageData {
  id: number;
  title: string;
  subtitle: string;
  narration: string[];
  keyPoints: KeyPoint[];
  clinicalTip: string;
  hotspots: Hotspot[];
  scene: string;
  scopeNote?: string;
}

interface QuizQuestion {
  id: number;
  stem: string;
  options: string[];
  correct: number; // 0=A, 1=B, 2=C, 3=D
  rationale: string;
}

// ─── THEME ───────────────────────────────────────────────────────────────────
const THEME = {
  primary: '#DC2626',
  primaryDark: '#B91C1C',
  secondary: '#FEF2F2',
  accent: '#F59E0B',
  dark: '#1E293B',
  muted: '#64748B',
  success: '#10B981',
  danger: '#DC2626',
  warn: '#D97706',
  bg: '#FFF5F5',
  panel: '#FFFFFF',
  border: '#FECACA',
  blue: '#3B82F6',
  orange: '#F97316',
  purple: '#7C3AED',
  teal: '#0D9488',
  green: '#059669',
};

// ─── PAGES (7) ───────────────────────────────────────────────────────────────
const PAGES: PageData[] = [
  {
    id: 1,
    title: 'Wound Anatomy & LVN Scope Boundaries',
    subtitle: 'Assess · Measure · Document · Report — within CA B&P § 2859',
    scene: 'anatomy',
    narration: [
      'Welcome to Module LVN-007: Wound Care within LVN Scope. This module defines what you can and cannot do when caring for patients with wounds in home health under California Business and Professions Code § 2859 and federal plan-of-care requirements at 42 CFR § 484.60. Agency wound-care clinical standards are operationalized in policy CL-SD-011.',
      'As a Licensed Vocational Nurse, you are a critical member of the wound care team. Your role centers on assessment observations, measurement, documentation, and timely reporting. You perform wound care procedures as delegated by the RN case manager or physician and only as ordered on the established Plan of Care. You do not independently change wound care orders, perform sharp debridement, diagnose, prescribe, complete OASIS, or develop or modify the Plan of Care.',
      'Pressure-injury staging systems (for example NPIAP stages) are clinical classification tools. Know what tissue findings mean so you can describe them accurately. Formal stage assignment, when required by agency policy or the comprehensive assessment process, is completed by the RN or other authorized clinician. Your job is precise description of what you see, consistent measurements, and immediate escalation when findings change or fall outside ordered care.',
      'Every wound tells a story. The difference between “the wound looks bad” and “wound bed approximately 80% yellow slough and 20% red granulation tissue, measuring 4.2 × 3.1 × 0.8 cm, moderate serous drainage, periwound erythema extending 1.5 cm from the edge” is the difference between usable clinical data and guesswork. Use the tissue-layer map on the right: click each layer for what to observe and when to escalate.',
    ],
    keyPoints: [
      {
        icon: '👁️',
        title: 'Core LVN role',
        detail: 'Observe, measure, document, report, and apply ordered wound care under RN/physician direction.',
      },
      {
        icon: '🚫',
        title: 'Outside independent scope',
        detail: 'No independent order changes, sharp debridement, POC/OASIS completion, diagnosis, or prescribing.',
      },
      {
        icon: '📜',
        title: 'Regulatory anchors',
        detail: 'Federal CoP plan of care: 42 CFR § 484.60. CA practice: B&P § 2859. Agency: CL-SD-011.',
      },
    ],
    clinicalTip:
      'Decision framing: continue ordered wound care when findings match the plan; stop and protect the wound if unexpected deeper structures appear; notify the RN case manager for deterioration, stall, or order mismatch; document objective tissue percentages, measurements, and notifications.',
    scopeNote:
      'Federal: services furnished in accordance with the plan of care (42 CFR § 484.60). California: LVN practice under B&P § 2859. Agency policy CL-SD-011 governs wound-care procedures, documentation, and co-signature timing. Clinical staging tools are guidance for accurate description—not a license for independent LVN staging decisions when agency policy assigns formal staging to the RN.',
    hotspots: [
      {
        id: 'epidermis',
        label: 'Epidermis',
        x: 50,
        y: 18,
        info: 'Outermost layer. Assess color, temperature, moisture, and turgor of intact skin and wound margins.',
      },
      {
        id: 'dermis',
        label: 'Dermis',
        x: 50,
        y: 32,
        info: 'Vessels, nerves, appendages. Note capillary refill, sensation, and partial-thickness tissue loss when present.',
      },
      {
        id: 'subcut',
        label: 'Subcutis',
        x: 50,
        y: 48,
        info: 'Adipose tissue. Measure depth; check for undermining/tunneling with sterile technique per order and policy.',
      },
      {
        id: 'fascia',
        label: 'Fascia',
        x: 50,
        y: 64,
        info: 'Exposed fascia is a major change. Cover protectively per protocol, stop further probing, notify RN promptly.',
      },
      {
        id: 'muscle',
        label: 'Muscle/bone',
        x: 50,
        y: 78,
        info: 'Visible muscle, tendon, or bone requires urgent RN/authorized clinician notification—do not independently restage and continue alone.',
      },
    ],
  },
  {
    id: 2,
    title: 'Wound Classification & Assessment',
    subtitle: 'Recognize patterns; escalate etiology-specific needs',
    scene: 'classify',
    narration: [
      'Home health patients commonly present with four wound pattern groups, each with distinct etiologies, presentations, and treatment pathways. Recognizing these patterns helps you escalate appropriately so the right ordered interventions reach the patient at the right time. Pattern recognition is observation—not independent diagnosis.',
      'Pressure injuries occur over bony prominences such as the sacrum, heels, ischial tuberosities, and greater trochanters. Classification systems describe Stage 1 non-blanchable erythema on intact skin; Stage 2 partial-thickness loss with exposed dermis; Stage 3 full-thickness loss with visible subcutaneous fat; Stage 4 full-thickness loss with exposed fascia, muscle, tendon, ligament, cartilage, or bone; unstageable wounds obscured by slough or eschar; and deep tissue pressure injury as persistent non-blanchable deep red, maroon, or purple discoloration. Describe what you observe; formal staging for the comprehensive assessment and POC updates is an RN/authorized clinician responsibility under agency policy.',
      'The Braden Scale is a commonly used pressure-injury risk screening tool. Lower scores indicate higher risk. Follow agency policy for which scores trigger preventive interventions and RN notification—do not invent universal cutoffs beyond what your agency adopts.',
      'Venous-pattern ulcers often appear on the lower legs (including the gaiter area and medial malleolus) with irregular shallow borders, moderate to heavy exudate, and hemosiderin staining. Compression is often central to treatment but requires an authorized order and confirmed adequate arterial flow (for example ABI) by the RN/authorized clinician pathway. Arterial-pattern ulcers often present distally with punched-out borders, pale or necrotic beds, minimal exudate, and significant pain—escalate promptly for vascular evaluation. Diabetic/neuropathic ulcers commonly appear on plantar surfaces with callused borders and may be painless due to neuropathy; careful inspection and monofilament testing when ordered are essential.',
    ],
    keyPoints: [
      {
        icon: '🦴',
        title: 'Pressure pattern',
        detail: 'Bony prominences; describe tissue depth findings; RN/authorized clinician formal staging per policy.',
      },
      {
        icon: '💧',
        title: 'Venous / arterial',
        detail: 'Venous: irregular, exudative, staining. Arterial: punched-out, pale, painful. Escalate vascular needs.',
      },
      {
        icon: '🦶',
        title: 'Neuropathic',
        detail: 'Plantar, callused borders, may be painless—inspect carefully; coordinate glucose/A1C with the care team.',
      },
    ],
    clinicalTip:
      'If pattern features conflict (for example mixed arterial-venous signs), do not force a single label. Document objective findings and notify the RN for comprehensive assessment and order review.',
    scopeNote:
      'Professional guidance (e.g., NPIAP staging definitions) informs accurate description. Agency policy and the RN comprehensive assessment process control formal classification for the Plan of Care. Compression, ABI, and vascular referrals require authorized orders/RN pathway—not independent LVN initiation.',
    hotspots: [
      {
        id: 'pressure',
        label: 'Pressure',
        x: 50,
        y: 22,
        info: 'Over bony prominences. Document non-blanchable color change, depth of tissue loss, and risk-tool findings per agency policy.',
      },
      {
        id: 'venous',
        label: 'Venous',
        x: 78,
        y: 48,
        info: 'Irregular borders, exudate, staining. Compression only with authorized order and adequate arterial status confirmed via RN pathway.',
      },
      {
        id: 'arterial',
        label: 'Arterial',
        x: 50,
        y: 74,
        info: 'Punched-out, pale/necrotic, painful. Escalate for vascular assessment—do not independently order ABI or alter perfusion-related care.',
      },
      {
        id: 'diabetic',
        label: 'Neuropathic',
        x: 22,
        y: 48,
        info: 'Plantar surfaces, callus, may be painless. Inspect fully; monofilament and care plan updates per orders/RN direction.',
      },
    ],
  },
  {
    id: 3,
    title: 'Wound Measurement & BWAT Scoring',
    subtitle: 'Clock method, tissue percentages, consistent technique',
    scene: 'bwat',
    narration: [
      'Precise wound measurement is the foundation of treatment-effectiveness tracking. Without accurate, consistent measurements, the care team cannot determine whether a wound is healing, stalled, or deteriorating. Your measurements feed RN and physician decisions—they do not authorize you to modify the Plan of Care yourself.',
      'The Bates-Jensen Wound Assessment Tool (BWAT) is a widely used structured wound evaluation framework. It scores multiple dimensions (commonly thirteen) on a 1-to-5 scale where 1 represents healthier tissue findings and 5 represents more impaired findings for that dimension. Use the interactive panel to explore dimensions conceptually. Follow agency forms and competency requirements for which tool and scoring process you use in production documentation.',
      'For linear measurements, the common clock method orients the body with 12 o’clock toward the head: length from 12 to 6, width from 3 to 9, regardless of wound location on the body. Depth is measured by gently inserting a sterile cotton-tipped applicator perpendicular to the deepest point of the bed, marking the surface level, then measuring tip to mark. Undermining is measured under intact edges and reported by clock position and centimeters (for example, “undermining 2.0 cm from 3 o’clock to 5 o’clock”).',
      'Wound-bed composition is reported as approximate percentages of red granulation, yellow slough, black eschar, and pink epithelial tissue when present. Use the same patient position, technique, and lighting whenever possible so visit-to-visit changes reflect biology, not measurement noise.',
    ],
    keyPoints: [
      {
        icon: '🕐',
        title: 'Clock method',
        detail: 'Length 12→6 (head–toe), width 3→9, depth at deepest point with sterile probe technique.',
      },
      {
        icon: '📊',
        title: 'BWAT-style scoring',
        detail: 'Lower dimension scores generally healthier; use agency-approved tool and form fields.',
      },
      {
        icon: '🎨',
        title: 'Tissue percentages',
        detail: 'Estimate granulation / slough / eschar / epithelium so the team sees the clinical story.',
      },
    ],
    clinicalTip:
      'If you cannot safely measure (severe pain, bleeding risk, unstable patient), stabilize per protocol, document the barrier, and notify the RN—do not invent measurements.',
    scopeNote:
      'Measurement and structured scoring support the care team. Tool selection, photo standards, and required fields follow agency policy CL-SD-011 and training competency—not personal preference. Scoring a tool is not the same as independently changing treatment orders.',
    hotspots: [
      {
        id: 'size',
        label: 'Size',
        x: 18,
        y: 30,
        info: 'L × W in cm using consistent orientation (commonly head-to-toe length).',
      },
      {
        id: 'depth',
        label: 'Depth',
        x: 50,
        y: 22,
        info: 'Deepest vertical depth with sterile applicator; report undermining/tunneling separately by clock position.',
      },
      {
        id: 'exudate',
        label: 'Exudate',
        x: 82,
        y: 30,
        info: 'Type and amount (serous, serosanguineous, purulent; scant to copious) after cleansing when policy requires.',
      },
      {
        id: 'granulation',
        label: 'Granulation',
        x: 30,
        y: 70,
        info: 'Healthy granulation is typically beefy red. Track percent change visit to visit.',
      },
      {
        id: 'necrotic',
        label: 'Necrotic',
        x: 70,
        y: 70,
        info: 'Slough and eschar percentages and adherence. Sharp debridement is not independent LVN practice.',
      },
    ],
  },
  {
    id: 4,
    title: 'Dressing Selection & Application',
    subtitle: 'Moisture balance principles — apply only what is ordered',
    scene: 'dressing',
    narration: [
      'Dressing strategy follows a moisture-management principle: maintain a moist wound healing environment without macerating periwound skin. Wounds that are too dry heal poorly; wounds that are too wet macerate and may enlarge. Understanding the principle helps you evaluate whether the ordered dressing is performing as intended.',
      'Dry or desiccated beds are often managed with moisture-donating products such as hydrogels (sheets, amorphous gels, or impregnated gauze), covered with a secondary dressing when ordered. Moderate exudate wounds commonly use foam dressings that absorb excess fluid while cushioning and insulating. Heavy exudate wounds may use alginates or hydrofiber dressings that gel as they absorb fluid and fill dead space; these generally require a secondary cover dressing when ordered.',
      'CRITICAL LVN SCOPE: You apply dressings per the physician or authorized clinician wound-care order on the Plan of Care—not by independent product substitution. If you observe excessive strike-through, maceration, desiccation, or frequent saturation that suggests the current product is mismatched, document objective findings and notify the RN case manager so the order can be reviewed. You may use standard nursing measures within policy and orders (for example, ordered skin protectant on periwound skin) to prevent maceration.',
      'Change frequency follows the order and product performance (saturation, adhesion, contamination). Do not extend wear time beyond the order for convenience. Brand examples (for example hydrofiber products) illustrate classes of dressings—the order controls what you apply.',
    ],
    keyPoints: [
      {
        icon: '💧',
        title: 'Dry bed',
        detail: 'Moisture-donating options (e.g., hydrogel class) when ordered—not self-selected.',
      },
      {
        icon: '🧽',
        title: 'Moderate exudate',
        detail: 'Foam-class dressings often ordered for balance of absorption and moisture retention.',
      },
      {
        icon: '🌿',
        title: 'Heavy exudate',
        detail: 'Alginate/hydrofiber classes absorb heavily; secondary dressing per order.',
      },
    ],
    clinicalTip:
      'First action when a dressing fails: protect the wound, document saturation/maceration/desiccation with photos if policy allows, notify RN for order review—do not swap product classes on your own.',
    scopeNote:
      'Agency policy CL-SD-011 and the Plan of Care govern products and change frequency. Knowledge of dressing classes supports observation and education; it does not authorize independent product selection or order changes.',
    hotspots: [
      {
        id: 'root',
        label: 'Exudate level',
        x: 50,
        y: 18,
        info: 'Start with ordered care; observe dry vs moderate vs heavy exudate to evaluate product performance.',
      },
      {
        id: 'hydrogel',
        label: 'Hydrogel class',
        x: 18,
        y: 72,
        info: 'Donates moisture to dry beds when ordered. Cover with secondary dressing as ordered.',
      },
      {
        id: 'foam',
        label: 'Foam class',
        x: 50,
        y: 72,
        info: 'Absorbs moderate exudate, cushions, insulates—use only the ordered product and frequency.',
      },
      {
        id: 'alginate',
        label: 'Alginate/HF',
        x: 82,
        y: 72,
        info: 'High absorption for heavy exudate when ordered; usually needs secondary cover dressing.',
      },
    ],
  },
  {
    id: 5,
    title: 'Healing Progression & Stall Recognition',
    subtitle: 'Track trajectory; escalate stalls and deterioration',
    scene: 'healing',
    narration: [
      'Wound healing generally progresses through overlapping phases: inflammatory, proliferative, and remodeling. Exact day ranges vary by patient, comorbidities, perfusion, infection, and nutrition. Your role is to track trajectory with consistent measurements and recognize when a wound diverges from expected improvement under the current ordered plan.',
      'Many clinical teaching frameworks highlight a two-week review point: if there is no measurable improvement after a reasonable trial of the ordered regimen, treat the situation as a potential stall requiring RN notification and likely Plan of Care review. Do not wait indefinitely “hoping” for change, and do not independently redesign therapy. Specific percent-reduction targets used in research or specialty guidance inform the care team; they are not LVN authority to change orders without RN/physician involvement.',
      'Expected improvement patterns include decreasing dimensions, increasing granulation percentage, decreasing slough/necrotic tissue, decreasing exudate, improving periwound skin, and often decreasing wound-related pain. Document trends visit over visit with the same measurement method.',
      'Deterioration requiring prompt escalation includes increasing size or depth, new exposure of deeper structures, increased or purulent drainage, new foul odor after cleansing, expanding necrotic tissue, periwound erythema/warmth extending outward, fever, tachycardia, altered mentation, or concerning glucose trends in patients with diabetes. You are the clinical eyes on a frequent visit cadence—timely reporting protects the patient.',
    ],
    keyPoints: [
      {
        icon: '📈',
        title: 'Track trends',
        detail: 'Same method each visit: size, tissue %, exudate, periwound, pain, photos per policy.',
      },
      {
        icon: '⚠️',
        title: 'Stall signal',
        detail: 'No measurable improvement after a reasonable ordered trial → document + notify RN (do not self-revise POC).',
      },
      {
        icon: '🚨',
        title: 'Deterioration',
        detail: 'Deeper structures, infection signs, rapid enlargement → stop unsafe steps, protect, escalate now.',
      },
    ],
    clinicalTip:
      'If systemic infection signs appear during a wound visit, prioritize patient safety and agency emergency/escalation pathways over completing a routine dressing change checklist.',
    scopeNote:
      'Healing-phase timelines and research benchmarks are clinical guidance for the team. Plan of Care revisions require authorized clinicians. LVN duty: accurate serial data and timely RN notification.',
    hotspots: [
      {
        id: 'w0',
        label: 'Baseline',
        x: 12,
        y: 48,
        info: 'Initial measurements, tissue description, photo (if policy/consent allow), and ordered plan confirmed.',
      },
      {
        id: 'w1',
        label: 'Early',
        x: 32,
        y: 48,
        info: 'Monitor inflammation and infection signs; reinforce offloading/nutrition teaching per plan.',
      },
      {
        id: 'w2',
        label: 'Stall check',
        x: 52,
        y: 48,
        info: 'No measurable improvement under ordered care → document and notify RN for comprehensive review.',
      },
      {
        id: 'w3',
        label: 'Progress',
        x: 72,
        y: 48,
        info: 'Granulation increase and size reduction support continuing ordered plan with ongoing monitoring.',
      },
      {
        id: 'w4',
        label: 'Epithelializing',
        x: 90,
        y: 48,
        info: 'Edge advancement and remodeling—still document fully; discharge judgments remain RN/physician.',
      },
    ],
  },
  {
    id: 6,
    title: 'Documentation & RN Co-Signature',
    subtitle: 'Eight field groups that survive survey scrutiny',
    scene: 'docs',
    narration: [
      'Wound documentation is among the most scrutinized areas in home health surveys. CMS surveyors look for complete, consistent, clinically accurate records that allow a reader who never saw the patient to understand wound status and the care provided. Your note must stand alone as objective clinical data.',
      'Required content commonly includes: precise location (anatomical landmark language, not “left leg”); dimensions L × W × D with undermining/tunneling by clock position; bed description with tissue percentages; periwound condition (color, temperature, moisture, maceration, induration, erythema extent); drainage type/amount/color; odor after cleansing; pain (0–10, timing, character, response to interventions); and clinical photographs when agency policy and consent allow, with consistent scale/lighting/angle.',
      'LVN wound documentation is reviewed and co-signed by the RN within the timeframe specified by current agency policy. Do not invent a universal co-signature clock for all agencies; follow Care Indeed policy CL-SD-011 and related documentation standards. Co-signature does not transfer your duty to write accurate contemporaneous notes.',
      'Documentation never includes assigning medical diagnosis codes as if you were coding for billing independently, rewriting the physician certification, or claiming you changed orders. If you notified the RN, document whom you contacted, when, what you reported, and any instructions received.',
    ],
    keyPoints: [
      {
        icon: '📍',
        title: 'Location & size',
        detail: 'Landmark language + L × W × D + undermining/tunneling by clock position.',
      },
      {
        icon: '🧪',
        title: 'Bed · drainage · periwound',
        detail: 'Tissue %, exudate character, surrounding skin findings with measurable extent when possible.',
      },
      {
        icon: '✍️',
        title: 'RN co-signature',
        detail: 'Per agency policy timeframe—not a substitute for accurate LVN contemporaneous charting.',
      },
    ],
    clinicalTip:
      'If EHR fields force incomplete choices, add a free-text objective description rather than omitting critical findings. Never leave blank required wound fields.',
    scopeNote:
      'Federal clinical-record expectations sit under home health CoPs (including plan-of-care and clinical-record integrity themes). Agency policy sets co-signature windows, photo rules, and form requirements. ICD-10 assignment and POC signature remain outside independent LVN scope.',
    hotspots: [
      {
        id: 'loc',
        label: 'Location',
        x: 20,
        y: 28,
        info: 'Anatomical landmark language (e.g., left medial malleolus, 3 cm superior to ankle joint).',
      },
      {
        id: 'dim',
        label: 'Dimensions',
        x: 50,
        y: 22,
        info: 'L × W × D cm; undermining/tunneling by clock position.',
      },
      {
        id: 'bed',
        label: 'Bed',
        x: 80,
        y: 28,
        info: 'Approximate % granulation, slough, eschar, epithelium.',
      },
      {
        id: 'peri',
        label: 'Periwound',
        x: 20,
        y: 58,
        info: 'Color, temp, maceration, induration, erythema extent.',
      },
      {
        id: 'drain',
        label: 'Drainage',
        x: 50,
        y: 64,
        info: 'Type, amount, color; odor after cleansing when applicable.',
      },
      {
        id: 'pain',
        label: 'Pain',
        x: 80,
        y: 58,
        info: '0–10 scale, timing, character, response to care.',
      },
      {
        id: 'photo',
        label: 'Photo',
        x: 35,
        y: 84,
        info: 'Per policy + consent; ruler for scale; consistent angle/lighting.',
      },
      {
        id: 'cosign',
        label: 'RN co-sign',
        x: 65,
        y: 84,
        info: 'RN review/co-signature within the timeframe required by current agency policy.',
      },
    ],
  },
  {
    id: 7,
    title: 'Decision Framework & Knowledge Check Prep',
    subtitle: 'First · continue · stop · notify · document — then prove knowledge',
    scene: 'mastery',
    narration: [
      'You have completed the instructional sequence for LVN-007: wound anatomy and scope, classification patterns, measurement and structured scoring concepts, dressing-class principles under orders, healing trajectory and stall recognition, and documentation with RN co-signature requirements.',
      'Use this decision frame on every wound visit: (1) What does the Plan of Care order today? (2) Do findings match the last note and expected trajectory? (3) May I continue ordered care safely? (4) Must I stop a step because of new exposure, bleeding, severe pain, or environmental risk? (5) Whom do I notify (RN case manager, physician pathway, emergency services per agency protocol)? (6) What objective data, notifications, and patient responses must I document?',
      'Knowledge alone is not practical competency. Passing the quiz in this module validates knowledge of LVN wound-care scope and standards. Observed demonstration, skills check-off per agency policy, and authorized sign-off remain separate requirements before independent wound-care performance is considered validated in practice.',
      'Key takeaways: assess, measure, document, report; apply only ordered products; describe tissue—do not independently restage or rewrite orders; escalate stalls and deterioration; co-signature follows agency policy; when in doubt, protect the patient and escalate.',
    ],
    keyPoints: [
      {
        icon: '🧭',
        title: 'Decision frame',
        detail: 'Orders → findings → continue/stop → notify → document.',
      },
      {
        icon: '🎓',
        title: 'Quiz = knowledge',
        detail: '80% pass validates knowledge only—not field competency alone.',
      },
      {
        icon: '✅',
        title: 'Practical sign-off',
        detail: 'Observed demo and authorized competency sign-off remain separate.',
      },
    ],
    clinicalTip:
      'Before the quiz, mentally walk one real patient scenario through first/continue/stop/notify/document. If any step requires RN authority, choose escalation—not improvisation.',
    scopeNote:
      'This page prepares the knowledge check. Practical wound-care competency is determined by observation and authorized sign-off under agency competency policy—not by quiz score alone.',
    hotspots: [
      {
        id: 'assess',
        label: 'Assess',
        x: 18,
        y: 40,
        info: 'Observe tissue, periwound, pain, and systemic signs within LVN assessment scope.',
      },
      {
        id: 'measure',
        label: 'Measure',
        x: 38,
        y: 28,
        info: 'Consistent L × W × D and tissue percentages using approved technique.',
      },
      {
        id: 'dress',
        label: 'Apply ordered',
        x: 62,
        y: 28,
        info: 'Perform ordered wound care only—no independent product swaps.',
      },
      {
        id: 'document',
        label: 'Document',
        x: 82,
        y: 40,
        info: 'Complete objective fields; RN co-signature per agency policy.',
      },
      {
        id: 'escalate',
        label: 'Escalate',
        x: 50,
        y: 72,
        info: 'Stalls, deeper structures, infection signs → notify RN/authorized pathway now.',
      },
    ],
  },
];

// ─── QUIZ (10) — distribution A=2 B=3 C=3 D=2 ────────────────────────────────
const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: 'Under California LVN practice boundaries (B&P § 2859) as applied in home health wound care, which task is WITHIN LVN scope when ordered/authorized?',
    options: [
      'Measuring wound dimensions and documenting objective findings',
      'Performing sharp debridement of necrotic tissue with instruments',
      'Independently ordering a new primary dressing product line',
      'Changing a physician wound-care order without RN/physician involvement',
    ],
    correct: 0,
    rationale:
      'LVNs measure, observe, document, report, and perform ordered wound care. Sharp debridement, independent supply ordering as a medical order, and independent order changes are outside independent LVN scope.',
  },
  {
    id: 2,
    stem: 'Which description matches full-thickness tissue loss with visible subcutaneous fat (commonly taught as Stage 3 pressure injury tissue depth)?',
    options: [
      'Epidermis only with intact skin and non-blanchable erythema',
      'Partial-thickness loss limited to dermis',
      'Full-thickness loss exposing subcutaneous fat (not bone/tendon/muscle)',
      'Full-thickness loss with exposed muscle, tendon, or bone',
    ],
    correct: 2,
    rationale:
      'Stage 3-depth findings involve full-thickness loss to subcutaneous tissue without exposed fascia/muscle/tendon/bone (Stage 4). LVNs describe tissue observed; formal staging for the comprehensive assessment follows RN/authorized clinician and agency policy.',
  },
  {
    id: 3,
    stem: 'On a BWAT-style 1–5 dimension scale used in this module, a score of 1 in a dimension generally indicates:',
    options: [
      'Best / healthiest tissue findings for that dimension',
      'Worst possible impairment for that dimension',
      'Moderate impairment only',
      'That the LVN should independently change the dressing order',
    ],
    correct: 0,
    rationale:
      'Lower BWAT dimension scores (toward 1) reflect healthier findings; higher scores (toward 5) reflect more impairment. Tool scores inform the team—they do not authorize independent order changes.',
  },
  {
    id: 4,
    stem: 'Which wound pattern typically presents on the plantar surface with callused borders and may be relatively painless due to neuropathy?',
    options: [
      'Venous stasis ulcer of the gaiter area',
      'Classic arterial ulcer of the distal toes only',
      'Diabetic / neuropathic ulcer pattern',
      'Stage 2 pressure injury over the sacrum',
    ],
    correct: 2,
    rationale:
      'Diabetic/neuropathic ulcers commonly occur on plantar weight-bearing surfaces with callus and may lack pain due to sensory loss—making careful inspection essential.',
  },
  {
    id: 5,
    stem: 'Using the head-to-toe clock method taught in this module, how should the LVN measure wound length?',
    options: [
      'Horizontally across the widest point regardless of body orientation',
      'From 12 o’clock to 6 o’clock (head-to-toe orientation)',
      'Diagonally across the longest visible axis only',
      'In any consistent direction chosen anew each visit',
    ],
    correct: 1,
    rationale:
      'Standard clock orientation uses length from 12 (head) to 6 (toe) and width from 3 to 9 so serial measurements are comparable.',
  },
  {
    id: 6,
    stem: 'A wound shows no measurable improvement after a reasonable trial of the ordered regimen (commonly reviewed around two weeks). What should the LVN do FIRST?',
    options: [
      'Independently change the dressing product class',
      'Document objective findings and notify the RN case manager',
      'Discontinue wound-care visits without notice',
      'Apply an alternate cleanser not on the order to “try something new”',
    ],
    correct: 1,
    rationale:
      'Potential stalls require accurate documentation and RN notification for comprehensive review/possible POC change. The LVN does not independently redesign therapy or stop ordered services unilaterally.',
  },
  {
    id: 7,
    stem: 'Which dressing class is generally most appropriate for a heavily exudating wound when ordered on the Plan of Care?',
    options: [
      'Transparent film alone as the primary absorptive layer',
      'Hydrogel sheet intended mainly to donate moisture',
      'Alginate or hydrofiber absorptive dressing (with secondary cover as ordered)',
      'Dry gauze only with no absorptive capacity plan',
    ],
    correct: 2,
    rationale:
      'Alginate/hydrofiber classes are designed for high exudate absorption when ordered. Films and hydrogels suit different moisture needs; dry gauze alone is often a poor moist-healing choice for heavy drainage.',
  },
  {
    id: 8,
    stem: 'Which action is NOT part of LVN periwound assessment/observation within scope?',
    options: [
      'Noting color changes such as erythema or maceration',
      'Comparing local temperature to surrounding skin',
      'Checking for induration or edema near the wound',
      'Independently prescribing a new topical barrier cream order',
    ],
    correct: 3,
    rationale:
      'LVNs observe and document periwound findings and may apply ordered/protectant measures per policy. Prescribing or independently creating medication/treatment orders is outside LVN scope.',
  },
  {
    id: 9,
    stem: 'During a dressing change the LVN newly discovers exposed tendon that was not previously documented. What is the correct action?',
    options: [
      'Cover briefly with saline gauze and finish the visit without notification',
      'Protectively cover the wound, stop further aggressive probing, and notify the RN immediately',
      'Apply a silver dressing product not on the order and recheck next week',
      'Document as “Stage 3” independently and continue the prior protocol unchanged',
    ],
    correct: 1,
    rationale:
      'New exposure of deeper structures is a major change requiring protective covering and prompt RN/authorized clinician notification. Do not independently restage, substitute products, or continue as if nothing changed.',
  },
  {
    id: 10,
    stem: 'Wound-care documentation must typically include all of the following EXCEPT:',
    options: [
      'Wound dimensions (L × W × D) and undermining/tunneling when present',
      'Wound-bed description and drainage characteristics',
      'Patient pain level and response to care',
      'Independent medical diagnosis code assignment by the LVN for billing',
    ],
    correct: 3,
    rationale:
      'Dimensions, bed/drainage, pain, and related clinical fields are expected. Independent ICD coding/diagnosis assignment is not an LVN wound-note function.',
  },
];

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  root: {
    fontFamily: 'Inter, system-ui, Segoe UI, Roboto, sans-serif',
    color: THEME.dark,
    background: THEME.bg,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: `linear-gradient(135deg, ${THEME.primaryDark} 0%, ${THEME.primary} 55%, #F97316 100%)`,
    color: '#fff',
    padding: '14px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  headerLeft: { flex: '1 1 280px' },
  badgeRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  badge: {
    fontSize: 10,
    fontWeight: 600,
    background: 'rgba(255,255,255,0.18)',
    border: '1px solid rgba(255,255,255,0.28)',
    borderRadius: 999,
    padding: '3px 8px',
  },
  progressWrap: { minWidth: 160, textAlign: 'right' },
  progressBar: {
    marginTop: 6,
    height: 8,
    background: 'rgba(255,255,255,0.25)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#fff',
    borderRadius: 999,
    transition: 'width 0.25s ease',
  },
  body: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    alignItems: 'stretch',
  },
  left: {
    flex: '0 0 55%',
    maxWidth: '55%',
    padding: '18px 20px 28px',
    overflow: 'auto',
    background: THEME.panel,
    borderRight: `1px solid ${THEME.border}`,
  },
  right: {
    flex: '0 0 45%',
    maxWidth: '45%',
    padding: '16px',
    background: 'linear-gradient(180deg, #FFF7F7 0%, #FEF3C7 100%)',
    display: 'flex',
    flexDirection: 'column',
  },
  h1: { fontSize: 22, margin: '0 0 4px', color: THEME.primaryDark, lineHeight: 1.25 },
  h2: { fontSize: 14, margin: '0 0 14px', color: THEME.muted, fontWeight: 600 },
  para: { fontSize: 14, lineHeight: 1.6, margin: '0 0 12px', color: THEME.dark },
  kpGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 10,
    marginTop: 8,
  },
  kpCard: {
    display: 'flex',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    background: THEME.secondary,
    border: `1px solid ${THEME.border}`,
  },
  tip: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    background: '#FFFBEB',
    border: `1px solid #FDE68A`,
    fontSize: 13,
    lineHeight: 1.5,
  },
  scope: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    background: '#EFF6FF',
    border: '1px solid #BFDBFE',
    fontSize: 12,
    lineHeight: 1.5,
    color: THEME.dark,
  },
  feedback: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    background: '#fff',
    border: `2px solid ${THEME.accent}`,
    fontSize: 13,
    lineHeight: 1.5,
    boxShadow: '0 8px 24px rgba(220,38,38,0.08)',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderTop: `1px solid ${THEME.border}`,
    background: '#fff',
    flexWrap: 'wrap',
  },
  btn: {
    border: 'none',
    borderRadius: 10,
    padding: '10px 16px',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
  },
  btnPrimary: { background: THEME.primary, color: '#fff' },
  btnSecondary: { background: '#F1F5F9', color: THEME.dark },
  btnDisabled: { opacity: 0.45, cursor: 'not-allowed' },
  quizCard: {
    marginBottom: 14,
    padding: 14,
    borderRadius: 12,
    border: '1px solid #E2E8F0',
    background: '#FAFAFA',
  },
  option: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
    padding: '8px 10px',
    borderRadius: 8,
    marginBottom: 6,
  },
};

// ─── SVG HELPERS ─────────────────────────────────────────────────────────────
function HotspotDot({
  hx,
  hy,
  active,
  label,
  onClick,
}: {
  hx: number;
  hy: number;
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <g
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
    >
      <circle
        cx={`${hx}%`}
        cy={`${hy}%`}
        r={active ? 16 : 13}
        fill={active ? THEME.accent : THEME.primary}
        stroke="#fff"
        strokeWidth={3}
        opacity={0.95}
      >
        <animate attributeName="r" values="12;15;12" dur="2.2s" repeatCount="indefinite" />
      </circle>
      <text
        x={`${hx}%`}
        y={`${hy}%`}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontSize={9}
        fontWeight={700}
        style={{ pointerEvents: 'none' }}
      >
        {label.length > 8 ? label.slice(0, 7) + '…' : label}
      </text>
    </g>
  );
}

interface SceneProps {
  hotspots: Hotspot[];
  activeId: string | null;
  onHotspot: (id: string) => void;
}

// ─── SCENES ──────────────────────────────────────────────────────────────────
function SceneAnatomy({ hotspots, activeId, onHotspot }: SceneProps) {
  const layers = [
    { name: 'Epidermis', color: '#FECACA', y: 40, h: 36 },
    { name: 'Dermis', color: '#F87171', y: 76, h: 44 },
    { name: 'Subcutaneous', color: '#FCD34D', y: 120, h: 40 },
    { name: 'Fascia', color: '#A3A3A3', y: 160, h: 28 },
    { name: 'Muscle', color: '#991B1B', y: 188, h: 36 },
  ];
  return (
    <svg viewBox="0 0 400 340" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <defs>
        <linearGradient id="anatBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FEF2F2" />
          <stop offset="100%" stopColor="#FEF3C7" />
        </linearGradient>
      </defs>
      <rect width="400" height="340" rx="16" fill="url(#anatBg)" />
      <text x="200" y="24" textAnchor="middle" fontSize="14" fontWeight="700" fill={THEME.dark}>
        Wound Bed Anatomy Theater
      </text>
      <text x="200" y="42" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        Tap layers — describe tissue; escalate deeper exposure
      </text>
      {/* Cross-section wound crater */}
      <ellipse cx="200" cy="150" rx="92" ry="110" fill="#7F1D1D" opacity="0.15" />
      {layers.map((L) => (
        <g key={L.name}>
          <rect x="90" y={L.y} width="220" height={L.h} rx="6" fill={L.color} stroke="#fff" strokeWidth="1.5" />
          <text x="200" y={L.y + L.h / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={THEME.dark}>
            {L.name}
          </text>
        </g>
      ))}
      {/* Scope caution line near deep structures */}
      <line x1="70" y1="158" x2="330" y2="158" stroke={THEME.danger} strokeWidth="2.5" strokeDasharray="8 5" />
      <text x="200" y="154" textAnchor="middle" fontSize="9" fontWeight="700" fill={THEME.danger}>
        DEEPER STRUCTURES → PROTECT + NOTIFY RN
      </text>
      <rect x="70" y="250" width="260" height="56" rx="10" fill="#fff" stroke={THEME.primary} strokeWidth="1.5" />
      <text x="200" y="272" textAnchor="middle" fontSize="11" fontWeight="700" fill={THEME.primaryDark}>
        LVN: observe · measure · document · report
      </text>
      <text x="200" y="290" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        No independent staging decisions or order changes
      </text>
      {hotspots.map((h, i) => (
        <HotspotDot
          key={h.id}
          hx={h.x}
          hy={h.y}
          active={activeId === h.id}
          label={String(i + 1)}
          onClick={() => onHotspot(h.id)}
        />
      ))}
    </svg>
  );
}

function SceneClassify({ hotspots, activeId, onHotspot }: SceneProps) {
  const types = [
    { name: 'Pressure', color: THEME.danger, x: 200, y: 70 },
    { name: 'Venous', color: THEME.blue, x: 310, y: 160 },
    { name: 'Arterial', color: THEME.orange, x: 200, y: 250 },
    { name: 'Neuropathic', color: THEME.accent, x: 90, y: 160 },
  ];
  return (
    <svg viewBox="0 0 400 340" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <rect width="400" height="340" rx="16" fill="#EFF6FF" />
      <text x="200" y="26" textAnchor="middle" fontSize="14" fontWeight="700" fill={THEME.dark}>
        Wound Pattern Constellation
      </text>
      <text x="200" y="44" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        Recognize patterns · escalate etiology needs
      </text>
      <circle cx="200" cy="160" r="36" fill="#fff" stroke={THEME.purple} strokeWidth="3" />
      <text x="200" y="156" textAnchor="middle" fontSize="11" fontWeight="700" fill={THEME.purple}>
        Observe
      </text>
      <text x="200" y="172" textAnchor="middle" fontSize="9" fill={THEME.muted}>
        Describe
      </text>
      {types.map((t) => (
        <g key={t.name}>
          <line x1="200" y1="160" x2={t.x} y2={t.y} stroke={t.color} strokeWidth="2" opacity="0.5" />
          <circle cx={t.x} cy={t.y} r="34" fill={t.color} opacity="0.92" />
          <text x={t.x} y={t.y + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">
            {t.name}
          </text>
        </g>
      ))}
      <rect x="60" y="300" width="280" height="26" rx="8" fill="#FEF3C7" stroke={THEME.accent} />
      <text x="200" y="317" textAnchor="middle" fontSize="10" fontWeight="600" fill={THEME.dark}>
        Pattern recognition ≠ independent medical diagnosis
      </text>
      {hotspots.map((h, i) => (
        <HotspotDot
          key={h.id}
          hx={h.x}
          hy={h.y}
          active={activeId === h.id}
          label={String(i + 1)}
          onClick={() => onHotspot(h.id)}
        />
      ))}
    </svg>
  );
}

function SceneBwat({ hotspots, activeId, onHotspot }: SceneProps) {
  const dims = [
    'Size',
    'Depth',
    'Edges',
    'Undermining',
    'Necrotic type',
    'Necrotic amt',
    'Exudate type',
    'Exudate amt',
    'Skin color',
    'Edema',
    'Induration',
    'Granulation',
    'Epithelialization',
  ];
  return (
    <svg viewBox="0 0 400 340" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <rect width="400" height="340" rx="16" fill="#F0FDFA" />
      <text x="200" y="24" textAnchor="middle" fontSize="14" fontWeight="700" fill={THEME.dark}>
        Measurement & BWAT Dashboard
      </text>
      <text x="200" y="42" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        Clock method · 1 = healthier · 5 = more impaired
      </text>
      {/* Clock graphic */}
      <circle cx="90" cy="120" r="48" fill="#fff" stroke={THEME.teal} strokeWidth="2" />
      <text x="90" y="100" textAnchor="middle" fontSize="9" fontWeight="700" fill={THEME.teal}>
        12
      </text>
      <text x="125" y="125" textAnchor="middle" fontSize="9" fontWeight="700" fill={THEME.teal}>
        3
      </text>
      <text x="90" y="148" textAnchor="middle" fontSize="9" fontWeight="700" fill={THEME.teal}>
        6
      </text>
      <text x="55" y="125" textAnchor="middle" fontSize="9" fontWeight="700" fill={THEME.teal}>
        9
      </text>
      <line x1="90" y1="88" x2="90" y2="152" stroke={THEME.danger} strokeWidth="2" />
      <line x1="55" y1="120" x2="125" y2="120" stroke={THEME.blue} strokeWidth="2" />
      <text x="90" y="185" textAnchor="middle" fontSize="10" fontWeight="700" fill={THEME.dark}>
        L 12→6 · W 3→9
      </text>
      {/* Dimension chips */}
      {dims.map((d, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = 160 + col * 58;
        const y = 70 + row * 48;
        return (
          <g key={d}>
            <rect x={x} y={y} width="52" height="36" rx="8" fill="#fff" stroke={THEME.teal} strokeWidth="1.2" />
            <text x={x + 26} y={y + 15} textAnchor="middle" fontSize="7.5" fontWeight="700" fill={THEME.dark}>
              {d.split(' ')[0]}
            </text>
            <text x={x + 26} y={y + 27} textAnchor="middle" fontSize="7" fill={THEME.muted}>
              {d.split(' ').slice(1).join(' ') || '1–5'}
            </text>
          </g>
        );
      })}
      <rect x="40" y="270" width="320" height="44" rx="10" fill="#ECFDF5" stroke={THEME.success} />
      <text x="200" y="290" textAnchor="middle" fontSize="11" fontWeight="700" fill={THEME.green}>
        Consistent technique each visit
      </text>
      <text x="200" y="306" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        Scores inform RN/MD decisions — not independent POC edits
      </text>
      {hotspots.map((h, i) => (
        <HotspotDot
          key={h.id}
          hx={h.x}
          hy={h.y}
          active={activeId === h.id}
          label={String(i + 1)}
          onClick={() => onHotspot(h.id)}
        />
      ))}
    </svg>
  );
}

function SceneDressing({ hotspots, activeId, onHotspot }: SceneProps) {
  const nodes = [
    { label: 'Exudate?', x: 200, y: 60, color: THEME.purple },
    { label: 'Dry → Hydrogel*', x: 80, y: 150, color: THEME.blue },
    { label: 'Moderate → Foam*', x: 200, y: 150, color: THEME.green },
    { label: 'Heavy → Alginate/HF*', x: 320, y: 150, color: THEME.accent },
  ];
  return (
    <svg viewBox="0 0 400 340" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <rect width="400" height="340" rx="16" fill="#FFF7ED" />
      <text x="200" y="26" textAnchor="middle" fontSize="14" fontWeight="700" fill={THEME.dark}>
        Dressing Class Decision Tree
      </text>
      <text x="200" y="44" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        *Apply only products ordered on the Plan of Care
      </text>
      {nodes.map((n) => (
        <g key={n.label}>
          <rect
            x={n.x - 62}
            y={n.y - 22}
            width="124"
            height="44"
            rx="10"
            fill="#fff"
            stroke={n.color}
            strokeWidth="2"
          />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={THEME.dark}>
            {n.label}
          </text>
        </g>
      ))}
      <line x1="200" y1="82" x2="80" y2="128" stroke={THEME.muted} strokeWidth="2" />
      <line x1="200" y1="82" x2="200" y2="128" stroke={THEME.muted} strokeWidth="2" />
      <line x1="200" y1="82" x2="320" y2="128" stroke={THEME.muted} strokeWidth="2" />
      <rect x="40" y="210" width="320" height="90" rx="12" fill="#FEF2F2" stroke={THEME.danger} strokeWidth="2" />
      <text x="200" y="238" textAnchor="middle" fontSize="12" fontWeight="700" fill={THEME.danger}>
        LVN SCOPE LOCK
      </text>
      <text x="200" y="258" textAnchor="middle" fontSize="11" fill={THEME.dark}>
        Mismatch observed? Document + notify RN
      </text>
      <text x="200" y="278" textAnchor="middle" fontSize="11" fill={THEME.muted}>
        Do not independently substitute dressing classes
      </text>
      {hotspots.map((h, i) => (
        <HotspotDot
          key={h.id}
          hx={h.x}
          hy={h.y}
          active={activeId === h.id}
          label={String(i + 1)}
          onClick={() => onHotspot(h.id)}
        />
      ))}
    </svg>
  );
}

function SceneHealing({ hotspots, activeId, onHotspot }: SceneProps) {
  const pts = [
    { label: 'Baseline', color: THEME.danger },
    { label: 'Early', color: '#EF4444' },
    { label: 'Stall chk', color: THEME.accent },
    { label: 'Progress', color: '#84CC16' },
    { label: 'Epithelial', color: THEME.success },
  ];
  return (
    <svg viewBox="0 0 400 340" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <rect width="400" height="340" rx="16" fill="#ECFDF5" />
      <text x="200" y="26" textAnchor="middle" fontSize="14" fontWeight="700" fill={THEME.dark}>
        Healing Trajectory Timeline
      </text>
      <text x="200" y="44" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        Serial measures · escalate stalls & deterioration
      </text>
      <line x1="40" y1="160" x2="360" y2="160" stroke="#94A3B8" strokeWidth="3" />
      {pts.map((p, i) => {
        const x = 50 + i * 75;
        return (
          <g key={p.label}>
            <circle cx={x} cy="160" r="16" fill={p.color} stroke="#fff" strokeWidth="3" />
            <text x={x} y="200" textAnchor="middle" fontSize="10" fontWeight="700" fill={THEME.dark}>
              {p.label}
            </text>
          </g>
        );
      })}
      {/* Highlight stall checkpoint */}
      <rect x="155" y="70" width="90" height="50" rx="10" fill="#FEF3C7" stroke={THEME.accent} strokeWidth="2" />
      <text x="200" y="92" textAnchor="middle" fontSize="11" fontWeight="700" fill={THEME.warn}>
        STALL CHECK
      </text>
      <text x="200" y="108" textAnchor="middle" fontSize="9" fill={THEME.dark}>
        No improvement → RN
      </text>
      <path d="M200 120 L200 144" stroke={THEME.accent} strokeWidth="2" markerEnd="url(#arrow)" />
      <rect x="50" y="240" width="300" height="70" rx="12" fill="#fff" stroke={THEME.success} strokeWidth="1.5" />
      <text x="200" y="268" textAnchor="middle" fontSize="11" fontWeight="700" fill={THEME.green}>
        Improving: ↓ size · ↑ granulation · ↓ slough
      </text>
      <text x="200" y="290" textAnchor="middle" fontSize="11" fontWeight="700" fill={THEME.danger}>
        Worsening: ↑ size · deeper tissue · infection signs
      </text>
      {hotspots.map((h, i) => (
        <HotspotDot
          key={h.id}
          hx={h.x}
          hy={h.y}
          active={activeId === h.id}
          label={String(i + 1)}
          onClick={() => onHotspot(h.id)}
        />
      ))}
    </svg>
  );
}

function SceneDocs({ hotspots, activeId, onHotspot }: SceneProps) {
  const fields = [
    { t: 'Location', x: 70, y: 90 },
    { t: 'Dimensions', x: 200, y: 70 },
    { t: 'Bed %', x: 330, y: 90 },
    { t: 'Periwound', x: 70, y: 170 },
    { t: 'Drainage', x: 200, y: 190 },
    { t: 'Pain', x: 330, y: 170 },
    { t: 'Photo', x: 130, y: 260 },
    { t: 'RN co-sign', x: 270, y: 260 },
  ];
  return (
    <svg viewBox="0 0 400 340" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <rect width="400" height="340" rx="16" fill="#F8FAFC" />
      <text x="200" y="26" textAnchor="middle" fontSize="14" fontWeight="700" fill={THEME.dark}>
        Documentation Wound Map
      </text>
      <text x="200" y="44" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        Complete objective fields · co-sign per agency policy
      </text>
      <ellipse cx="200" cy="160" rx="70" ry="50" fill="#FEE2E2" stroke={THEME.primary} strokeWidth="2" />
      <text x="200" y="155" textAnchor="middle" fontSize="12" fontWeight="700" fill={THEME.primaryDark}>
        WOUND
      </text>
      <text x="200" y="172" textAnchor="middle" fontSize="9" fill={THEME.muted}>
        note must stand alone
      </text>
      {fields.map((f) => (
        <g key={f.t}>
          <rect x={f.x - 40} y={f.y - 14} width="80" height="28" rx="8" fill="#fff" stroke={THEME.primary} />
          <text x={f.x} y={f.y + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={THEME.dark}>
            {f.t}
          </text>
        </g>
      ))}
      {hotspots.map((h, i) => (
        <HotspotDot
          key={h.id}
          hx={h.x}
          hy={h.y}
          active={activeId === h.id}
          label={String(i + 1)}
          onClick={() => onHotspot(h.id)}
        />
      ))}
    </svg>
  );
}

function SceneMastery({ hotspots, activeId, onHotspot }: SceneProps) {
  const petals = ['Assess', 'Measure', 'Apply', 'Document', 'Escalate', 'Scope'];
  return (
    <svg viewBox="0 0 400 340" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <rect width="400" height="340" rx="16" fill="#FEF2F2" />
      <text x="200" y="26" textAnchor="middle" fontSize="14" fontWeight="700" fill={THEME.dark}>
        Wound Care Decision Seal
      </text>
      <text x="200" y="44" textAnchor="middle" fontSize="10" fill={THEME.muted}>
        Knowledge check next · practical sign-off separate
      </text>
      <circle cx="200" cy="170" r="42" fill={THEME.primary} />
      <text x="200" y="166" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">
        LVN-007
      </text>
      <text x="200" y="182" textAnchor="middle" fontSize="9" fill="#FEE2E2">
        Knowledge
      </text>
      {petals.map((p, i) => {
        const angle = (Math.PI * 2 * i) / petals.length - Math.PI / 2;
        const x = 200 + Math.cos(angle) * 100;
        const y = 170 + Math.sin(angle) * 90;
        return (
          <g key={p}>
            <circle cx={x} cy={y} r="30" fill="#fff" stroke={THEME.primary} strokeWidth="2" />
            <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={THEME.primaryDark}>
              {p}
            </text>
          </g>
        );
      })}
      <text x="200" y="320" textAnchor="middle" fontSize="11" fill={THEME.muted}>
        Quiz pass ≠ practical competency alone
      </text>
      {hotspots.map((h, i) => (
        <HotspotDot
          key={h.id}
          hx={h.x}
          hy={h.y}
          active={activeId === h.id}
          label={String(i + 1)}
          onClick={() => onHotspot(h.id)}
        />
      ))}
    </svg>
  );
}

function SceneQuizActive() {
  return (
    <svg viewBox="0 0 400 340" width="100%" height="100%" style={{ maxHeight: 420 }}>
      <rect width="400" height="340" rx="16" fill="#FEF2F2" />
      <text x="200" y="120" textAnchor="middle" fontSize="42">
        🩹
      </text>
      <text x="200" y="180" textAnchor="middle" fontSize="16" fontWeight="700" fill={THEME.primaryDark}>
        Knowledge Check Active
      </text>
      <text x="200" y="206" textAnchor="middle" fontSize="12" fill={THEME.muted}>
        10 questions · 80% to pass · review & retry available
      </text>
      <text x="200" y="232" textAnchor="middle" fontSize="11" fill={THEME.muted}>
        Passing validates knowledge only — not practical competency
      </text>
      <text x="200" y="258" textAnchor="middle" fontSize="11" fill={THEME.muted}>
        Observed demo & authorized sign-off remain separate
      </text>
    </svg>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const LVN007WoundCare: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [quizMode, setQuizMode] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showReview, setShowReview] = useState(false);

  const page = PAGES[pageIndex];
  const totalPages = PAGES.length;
  const passCount = Math.ceil((MODULE_META.passing / 100) * MODULE_META.quizCount);


  const activeInfo = useMemo(() => {
    if (!page || !activeHotspot) return null;
    return page.hotspots.find((h) => h.id === activeHotspot) ?? null;
  }, [page, activeHotspot]);

  const onHotspot = useCallback((id: string) => {
    setActiveHotspot((prev) => (prev === id ? null : id));
  }, []);

  const goPrev = () => {
    if (quizMode) {
      setQuizMode(false);
      setPageIndex(totalPages - 1);
      setActiveHotspot(null);
      return;
    }
    setPageIndex((p) => Math.max(0, p - 1));
    setActiveHotspot(null);
  };

  const goNext = () => {
    if (quizMode) return;
    if (pageIndex < totalPages - 1) {
      setPageIndex((p) => p + 1);
      setActiveHotspot(null);
    } else {
      setQuizMode(true);
      setActiveHotspot(null);
    }
  };

  const submitQuiz = () => {
    let s = 0;
    QUIZ.forEach((q, i) => {
      if (answers[i] === q.correct) s += 1;
    });
    setScore(s);
    setSubmitted(true);
    setShowReview(true);
  };

  const retryQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setShowReview(false);
  };

  const passed = submitted && score >= passCount;

  const renderScene = () => {
    if (quizMode) return <SceneQuizActive />;
    const props = {
      hotspots: page.hotspots,
      activeId: activeHotspot,
      onHotspot,
    };
    switch (page.scene) {
      case 'anatomy':
        return <SceneAnatomy {...props} />;
      case 'classify':
        return <SceneClassify {...props} />;
      case 'bwat':
        return <SceneBwat {...props} />;
      case 'dressing':
        return <SceneDressing {...props} />;
      case 'healing':
        return <SceneHealing {...props} />;
      case 'docs':
        return <SceneDocs {...props} />;
      case 'mastery':
        return <SceneMastery {...props} />;
      default:
        return <SceneQuizActive />;
    }
  };

  return (
    <div className="lvn-module-shell" style={styles.root} data-module={MODULE_META.id} data-version={MODULE_META.version}>
            <LVNLessonNavigation
        lessons={PAGES}
        activeIndex={quizMode ? -1 : pageIndex}
        onLessonChange={(index) => {
          setQuizMode(false);
          setPageIndex(index);
          setActiveHotspot(null);
        }}
      />

      <div style={styles.body} className="lvn007-body">
        <main style={styles.left}>
          {!quizMode ? (
            <>
              <h1 style={styles.h1}>{page.title}</h1>
              <p style={styles.h2}>{page.subtitle}</p>
              {page.narration.map((para, i) => (
                <p key={i} style={styles.para}>
                  {para}
                </p>
              ))}
              <div style={styles.kpGrid}>
                {page.keyPoints.map((kp) => (
                  <div key={kp.title} style={styles.kpCard}>
                    <div style={{ fontSize: 22, lineHeight: 1 }}>{kp.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: THEME.primaryDark }}>{kp.title}</div>
                      <div style={{ fontSize: 12, color: THEME.muted, marginTop: 2, lineHeight: 1.45 }}>
                        {kp.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={styles.tip}>
                <strong>Clinical tip: </strong>
                {page.clinicalTip}
              </div>
              {page.scopeNote && (
                <div style={styles.scope}>
                  <strong>Scope / authority note: </strong>
                  {page.scopeNote}
                </div>
              )}
              <div
                style={{
                  marginTop: 12,
                  fontSize: 11,
                  color: THEME.muted,
                  borderTop: `1px solid ${THEME.border}`,
                  paddingTop: 8,
                }}
              >
                Scope reminder: LVNs implement ordered wound care under the RN/physician Plan of Care. LVNs do not
                independently diagnose, prescribe, complete OASIS, stage wounds when that is an RN/authorized role, or
                modify the Plan of Care.
              </div>
            </>
          ) : (
            <>
              <h1 style={styles.h1}>Knowledge Check — Wound Care LVN Scope</h1>
              <p style={styles.h2}>
                10 application questions · {MODULE_META.passing}% ({passCount}/{MODULE_META.quizCount}) to pass ·
                Knowledge only — observed demonstration and authorized sign-off remain separate
              </p>

              {QUIZ.map((q, qi) => {
                const selected = answers[qi];
                const isCorrect = selected === q.correct;
                return (
                  <div key={q.id} style={styles.quizCard}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
                      {qi + 1}. {q.stem}
                    </div>
                    {q.options.map((opt, oi) => {
                      const letter = ['A', 'B', 'C', 'D'][oi];
                      let bg = '#fff';
                      let border = '#E2E8F0';
                      if (submitted && showReview) {
                        if (oi === q.correct) {
                          bg = '#D1FAE5';
                          border = THEME.success;
                        } else if (selected === oi && !isCorrect) {
                          bg = '#FEE2E2';
                          border = THEME.danger;
                        }
                      } else if (selected === oi) {
                        bg = THEME.secondary;
                        border = THEME.primary;
                      }
                      return (
                        <label
                          key={oi}
                          style={{
                            ...styles.option,
                            background: bg,
                            border: `1px solid ${border}`,
                            cursor: submitted ? 'default' : 'pointer',
                          }}
                        >
                          <input
                            type="radio"
                            name={`q-${qi}`}
                            checked={selected === oi}
                            disabled={submitted}
                            onChange={() =>
                              setAnswers((prev) => ({
                                ...prev,
                                [qi]: oi,
                              }))
                            }
                            style={{ marginTop: 2 }}
                          />
                          <span>
                            <strong>{letter}.</strong> {opt}
                          </span>
                        </label>
                      );
                    })}
                    {submitted && showReview && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: 10,
                          borderRadius: 8,
                          background: isCorrect ? '#ECFDF5' : '#FEF2F2',
                          fontSize: 12,
                          lineHeight: 1.5,
                          color: THEME.dark,
                        }}
                      >
                        <strong>{isCorrect ? 'Correct. ' : 'Not correct. '}</strong>
                        {q.rationale}
                      </div>
                    )}
                  </div>
                );
              })}

              {!submitted ? (
                <button
                  type="button"
                  onClick={submitQuiz}
                  disabled={Object.keys(answers).length < QUIZ.length}
                  style={{
                    ...styles.btn,
                    ...styles.btnPrimary,
                    ...(Object.keys(answers).length < QUIZ.length ? styles.btnDisabled : {}),
                    width: '100%',
                    marginTop: 8,
                  }}
                >
                  Submit Quiz ({Object.keys(answers).length}/{QUIZ.length})
                </button>
              ) : (
                <div
                  style={{
                    marginTop: 8,
                    padding: 16,
                    borderRadius: 12,
                    background: passed ? '#ECFDF5' : '#FEF2F2',
                    border: `2px solid ${passed ? THEME.success : THEME.danger}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: passed ? THEME.success : THEME.danger,
                      marginBottom: 8,
                    }}
                  >
                    {passed ? '✓ Knowledge check passed' : '✗ Knowledge check not passed'} — {score}/
                    {MODULE_META.quizCount} ({Math.round((score / MODULE_META.quizCount) * 100)}%)
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.55, margin: '0 0 12px' }}>
                    {passed
                      ? 'You met the knowledge threshold for this module. Practical wound-care competency still requires observed demonstration and authorized sign-off per agency policy.'
                      : 'Score below 80%. Review the rationales and instructional pages, then retry the knowledge check.'}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {!passed && (
                      <button type="button" onClick={retryQuiz} style={{ ...styles.btn, ...styles.btnPrimary }}>
                        Retry Quiz
                      </button>
                    )}
                    {passed && (
                      <button type="button" onClick={retryQuiz} style={{ ...styles.btn, ...styles.btnSecondary }}>
                        Retry for Practice
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowReview((v) => !v)}
                      style={{ ...styles.btn, ...styles.btnSecondary }}
                    >
                      {showReview ? 'Hide Review' : 'Show Review'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQuizMode(false);
                        setPageIndex(0);
                        setActiveHotspot(null);
                      }}
                      style={{ ...styles.btn, ...styles.btnSecondary }}
                    >
                      Review Content
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        <aside style={styles.right}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {renderScene()}
            {!quizMode && activeInfo && (
              <div style={styles.feedback} role="status" aria-live="polite">
                <div style={{ fontWeight: 700, color: THEME.primaryDark, marginBottom: 4 }}>
                  {activeInfo.label}
                </div>
                {activeInfo.info}
              </div>
            )}
            {!quizMode && !activeInfo && (
              <div
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: THEME.muted,
                  textAlign: 'center',
                }}
              >
                Tap numbered hotspots on the scene for clinical detail.
              </div>
            )}
          </div>
        </aside>
      </div>

            <LVNNarrationFooter
        currentIndex={quizMode ? totalPages - 1 : pageIndex}
        total={totalPages}
        onPrevious={goPrev}
        previousDisabled={!quizMode && pageIndex === 0}
        onNext={quizMode ? () => setQuizMode(false) : goNext}
        nextLabel={!quizMode ? (pageIndex < totalPages - 1 ? 'Next Lesson →' : 'Start Quiz →') : 'Back to Content'}
        centerLabel={quizMode ? 'Knowledge Check' : 'Lesson ' + (pageIndex + 1) + ' of ' + totalPages}
      />

      <style>{`
        @media (max-width: 900px) {
          .lvn007-body {
            flex-direction: column !important;
          }
          .lvn007-body > main,
          .lvn007-body > aside {
            flex: 1 1 auto !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LVN007WoundCare;
