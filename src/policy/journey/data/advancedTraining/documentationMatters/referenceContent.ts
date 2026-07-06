/**
 * Reference Materials — 10 practical checklists, job aids, and quick guides
 * for daily clinical, supervisory, and QA documentation workflows.
 */

export interface ReferenceItem {
  id: string
  icon: string
  title: string
  audience: string
  description: string
  items: string[]
}

export const referenceMaterials: ReferenceItem[] = [
  {
    id: 'doc-quality',
    icon: '✅',
    title: 'Documentation Quality Checklist',
    audience: 'All Clinicians',
    description:
      'Use this checklist after every visit note to verify your documentation meets defensibility standards before submission.',
    items: [
      'Does the note identify the specific skilled service provided?',
      'Is the patient\'s response to the intervention documented?',
      'Are measurable, objective clinical findings recorded (vitals, wound measurements, functional data)?',
      'Is the patient\'s homebound status substantiated with functional language?',
      'Does the note reflect individualized care — not copy-forward language?',
      'Is the note contemporaneous (documented at or near the time of the visit)?',
      'Does the documentation align with the current plan of care (485)?',
      'Are goals and progress toward goals addressed?',
      'Is physician communication documented with content and response?',
      'Is the note properly authenticated (signed, dated, attributed to rendering clinician)?',
      'Would an external auditor reading only this note conclude the visit was medically necessary?',
    ],
  },
  {
    id: 'skilled-need',
    icon: '🩺',
    title: 'Skilled Need Support Checklist',
    audience: 'Clinicians & Supervisors',
    description:
      'Verify that each visit note establishes why a licensed professional was required to provide the service.',
    items: [
      'Is the specific skilled intervention clearly described (not just "assessment" or "monitoring")?',
      'Does the note explain why the intervention requires professional-level skill, training, or judgment?',
      'Could the described service be safely delegated to a home health aide? If not, is that clear?',
      'For teaching visits: is the teaching content specific, and is the patient\'s comprehension documented?',
      'For assessment visits: are the assessment findings complex enough to require licensed interpretation?',
      'For wound care: is the wound assessment detailed (measurement, bed characteristics, treatment applied)?',
      'For therapy: does the note describe skilled therapeutic techniques, not just exercise?',
      'Does the note support that continued skilled care is needed (not just "continue per POC")?',
    ],
  },
  {
    id: 'medical-necessity',
    icon: '📋',
    title: 'Medical Necessity Support Checklist',
    audience: 'Clinicians & QA Reviewers',
    description:
      'Ensure every encounter documents why the patient needs continued skilled home health services.',
    items: [
      'Does the note establish that the patient has an active medical condition requiring skilled intervention?',
      'Is there documented expectation of improvement, or justification for maintenance/prevention of decline?',
      'Are changes in patient status documented that support the continued need for skilled care?',
      'Does the visit frequency match the clinical acuity documented?',
      'Is the relationship between the diagnosis, the intervention, and the expected outcome clear?',
      'Does the note avoid language that suggests the patient is stable and needs no further skilled care?',
      'Are relevant lab results, vital signs, or clinical data included to substantiate acuity?',
      'Is coordination with the physician documented for changes in condition or plan modifications?',
    ],
  },
  {
    id: 'visit-note-defensibility',
    icon: '🛡️',
    title: 'Visit Note Defensibility Checklist',
    audience: 'All Clinicians',
    description:
      'Run this mental checklist before signing every visit note. If any answer is "no," revise before submitting.',
    items: [
      'Could someone who was not present at the visit reconstruct what happened by reading this note?',
      'Does the note clearly support the specific CPT/HCPCS code being billed?',
      'Is the note internally consistent (no contradictions with prior visits or the 485)?',
      'Does the note use specific clinical language, not vague terms ("stable," "doing well," "no change")?',
      'Is the patient identified correctly throughout (name, date, rendering clinician)?',
      'If this note were pulled for an ADR, would it survive review without additional explanation?',
      'Does the note document the plan for the next visit, including focus areas?',
    ],
  },
  {
    id: 'denial-triggers',
    icon: '🚨',
    title: 'Common Denial Triggers Quick Reference',
    audience: 'All Staff',
    description:
      'The most frequent reasons home health claims are denied. Know these and prevent them in every chart.',
    items: [
      'Missing or insufficient face-to-face encounter documentation (top denial reason nationally)',
      'Homebound status not documented or documented with only "patient is homebound"',
      'Medical necessity not supported — notes describe stable patient with no need for skilled care',
      'Visit notes do not align with the plan of care (wrong frequency, unauthorized services)',
      'No skilled service documented — note describes only vitals, monitoring, or non-skilled tasks',
      'Copy-forward language suggesting no individualized assessment was performed',
      'Late documentation (notes created days/weeks after the visit, flagged by EMR timestamps)',
      'Missing patient response to interventions — what was done but not how patient responded',
      'Physician orders missing or unsigned for services provided',
      'Authentication issues — unsigned notes, wrong clinician signature, or missing dates',
      'Contradictory documentation across disciplines on the same date of service',
    ],
  },
  {
    id: 'qa-chart-review',
    icon: '🔍',
    title: 'QA Chart Review Checklist',
    audience: 'QA Reviewers & Supervisors',
    description:
      'Structured review tool for internal chart audits. Use this for concurrent and retrospective reviews.',
    items: [
      'Is the face-to-face encounter properly documented and within required timeframes?',
      'Does the 485 accurately reflect current diagnoses, medications, and functional status?',
      'Are visit notes filed within the agency\'s required timeframe?',
      'Does each visit note document a skilled service and patient response?',
      'Is homebound status substantiated in every visit note?',
      'Do visit notes align with ordered frequency and disciplines on the 485?',
      'Are physician communications documented with content and responses?',
      'Is there evidence of copy-forward that could indicate non-individualized care?',
      'Are OASIS assessments consistent with visit note documentation?',
      'Are all notes properly authenticated by the rendering clinician?',
      'Have any missed visits been documented with explanation?',
      'Does the chart support the payment grouping (diagnoses, functional levels, comorbidities)?',
    ],
  },
  {
    id: 'cap-guide',
    icon: '📝',
    title: 'Corrective Action Plan Quick Guide',
    audience: 'Supervisors & Compliance Staff',
    description:
      'How to write an effective CAP when documentation deficiencies are identified.',
    items: [
      'Step 1: Define the specific deficiency clearly (what was wrong, how many charts affected)',
      'Step 2: Determine the root cause — is it a training gap, workflow issue, or system limitation?',
      'Step 3: Define corrective action(s) — specific, measurable, and actionable steps',
      'Step 4: Assign responsible parties and deadlines for each corrective action',
      'Step 5: Define the monitoring plan — how will you verify the fix is working?',
      'Step 6: Set re-evaluation date — when will you review compliance?',
      'Step 7: Document baseline metrics and improvement targets',
      'Tip: Address systemic root causes, not just individual clinician behavior',
      'Tip: Include education/re-training as part of corrective actions when knowledge gaps exist',
      'Tip: Keep CAPs focused — do not try to fix everything at once',
    ],
  },
  {
    id: 'root-cause',
    icon: '🔬',
    title: 'Root Cause Analysis Worksheet',
    audience: 'Supervisors & QA Staff',
    description:
      'A structured framework for identifying why documentation deficiencies occur. Use the "5 Whys" method.',
    items: [
      'What is the documentation deficiency? (Describe the specific finding)',
      'Why did it occur? (First Why — immediate cause)',
      'Why did that happen? (Second Why — contributing factor)',
      'Why did that happen? (Third Why — process breakdown)',
      'Why did that happen? (Fourth Why — systemic factor)',
      'Why did that happen? (Fifth Why — root cause)',
      'Is the root cause related to: Training? Workflow design? EMR configuration? Staffing? Communication?',
      'Has this same root cause produced other deficiencies? (Look for patterns)',
      'What systemic change would prevent recurrence? (Not just "re-educate the clinician")',
      'How will you verify the root cause was correctly identified? (Track the corrective action results)',
    ],
  },
  {
    id: 'clinician-self-audit',
    icon: '📊',
    title: 'Clinician Documentation Self-Audit Guide',
    audience: 'Field Clinicians',
    description:
      'A self-assessment tool for clinicians to review their own documentation habits and identify improvement areas.',
    items: [
      'Pull 5 of your recent visit notes at random. For each note, answer:',
      'Does the note clearly identify what skilled service I provided?',
      'Did I document the patient\'s response to my intervention?',
      'Is my homebound justification specific and functional (not just "homebound")?',
      'Would an auditor understand why this visit was medically necessary?',
      'Did I individualize the note, or does it read like my other notes?',
      'Did I document my communication with the physician (if applicable)?',
      'Was the note completed within 24 hours of the visit?',
      'Scoring: Count "yes" answers. Below 80% across your 5 notes = improvement needed.',
      'Action: For any "no" answer, review that documentation element in the course modules.',
    ],
  },
  {
    id: 'supervisor-audit-readiness',
    icon: '🏥',
    title: 'Supervisor Audit-Readiness Guide',
    audience: 'Supervisors & Directors',
    description:
      'Prepare your team and charts for MAC reviews, ADRs, UPIC investigations, and accreditation surveys.',
    items: [
      'Verify all active charts have a signed, current 485 with matching visit frequencies',
      'Confirm face-to-face encounters are documented and within required timeframes',
      'Run a random sample QA review: pull 10% of charts and review against the QA checklist',
      'Check that all visit notes are filed within agency timeframes — flag late documentation',
      'Review EMR audit trails for copy-forward patterns and late entries',
      'Verify all clinician credentials, licensure, and competency documentation is current',
      'Ensure OASIS assessments are consistent with visit note documentation',
      'Confirm policies and procedures manuals are current and accessible',
      'Prepare your ADR response workflow: who pulls charts, who reviews, who submits',
      'Brief your clinical team on audit expectations and documentation standards',
      'Document your internal QA review findings and any corrective actions taken',
      'Maintain an audit-readiness binder or digital folder with key compliance documents',
    ],
  },
]
