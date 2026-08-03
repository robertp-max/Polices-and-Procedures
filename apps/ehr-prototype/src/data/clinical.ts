import type {
  VisitEvent, Order, Medication, ActionItem, IntegrityCheck, TimelineEntry,
  Referral, Claim, PatientDocument, Assessment, Notification, BradSuggestion,
} from './types'

// All records are synthetic — design prototype only.

export const todayVisits: VisitEvent[] = [
  { id: 'v-1', patientId: 'pt-walter', date: 'Today', time: '11:00 AM', durationMin: 45, discipline: 'SN', type: 'Skilled nursing · CHF check', clinician: 'Taylor Brooks, RN', status: 'completed', location: 'home' },
  { id: 'v-2', patientId: 'pt-elena', date: 'Today', time: '2:30 PM', durationMin: 60, discipline: 'SN', type: 'Skilled nursing · SOC follow-up', clinician: 'Taylor Brooks, RN', status: 'scheduled', location: 'home' },
  { id: 'v-3', patientId: 'pt-margaret', date: 'Today', time: '4:15 PM', durationMin: 45, discipline: 'SN', type: 'Wound care', clinician: 'Iris Duan, RN', status: 'scheduled', location: 'home' },
  { id: 'v-4', patientId: 'pt-raymond', date: 'Today', time: '9:00 AM', durationMin: 45, discipline: 'PT', type: 'Physical therapy · gait training', clinician: 'Marcus Webb, PT', status: 'documentation-due', location: 'home' },
]

export const weekVisits: VisitEvent[] = [
  ...todayVisits,
  { id: 'v-5', patientId: 'pt-harold', date: 'Tomorrow', time: '9:30 AM', durationMin: 120, discipline: 'SN', type: 'Start of care · OASIS-E2', clinician: 'Taylor Brooks, RN', status: 'scheduled', location: 'home' },
  { id: 'v-6', patientId: 'pt-june', date: 'Aug 5', time: '1:00 PM', durationMin: 45, discipline: 'ST', type: 'Speech therapy', clinician: 'Amaia Ross, ST', status: 'scheduled', location: 'home' },
  { id: 'v-7', patientId: 'pt-raymond', date: 'Aug 5', time: '10:00 AM', durationMin: 45, discipline: 'PT', type: 'Physical therapy', clinician: 'Marcus Webb, PT', status: 'scheduled', location: 'home' },
  { id: 'v-8', patientId: 'pt-samuel', date: 'Aug 5', time: '3:45 PM', durationMin: 45, discipline: 'SN', type: 'Skilled nursing · INR draw', clinician: 'Dana Whitfield, RN', status: 'scheduled', location: 'home' },
  { id: 'v-9', patientId: 'pt-dorothy', date: 'Aug 6', time: '11:30 AM', durationMin: 90, discipline: 'SN', type: 'Recertification assessment', clinician: 'Iris Duan, RN', status: 'scheduled', location: 'home' },
  { id: 'v-10', patientId: 'pt-walter', date: 'Aug 7', time: '10:30 AM', durationMin: 30, discipline: 'SN', type: 'Telehealth check-in', clinician: 'Dana Whitfield, RN', status: 'scheduled', location: 'telehealth' },
]

export const orders: Order[] = [
  { id: 'ord-1', patientId: 'pt-elena', summary: 'Plan of care (CMS-485) — initial certification', category: 'plan-of-care', orderedBy: 'Dr. Susan Cho', date: 'Jul 29', status: 'pending-signature', due: 'In 4 hours', urgent: true },
  { id: 'ord-2', patientId: 'pt-elena', summary: 'Metoprolol tartrate — dose clarification 25 vs 50 mg BID', category: 'medication', orderedBy: 'Dr. Susan Cho', date: 'Jul 29', status: 'sent', due: 'Today', urgent: true },
  { id: 'ord-3', patientId: 'pt-elena', summary: 'PT evaluation and treatment 2w9', category: 'referral', orderedBy: 'Dr. Susan Cho', date: 'Jul 30', status: 'signed' },
  { id: 'ord-4', patientId: 'pt-elena', summary: 'Front-wheeled walker — DME delivery', category: 'dme', orderedBy: 'Dr. Susan Cho', date: 'Jul 30', status: 'sent', due: 'Aug 6' },
  { id: 'ord-5', patientId: 'pt-walter', summary: 'BMP + BNP — draw at next SN visit', category: 'lab', orderedBy: 'Dr. Leo Vance', date: 'Aug 1', status: 'pending-signature', due: 'Aug 5' },
  { id: 'ord-6', patientId: 'pt-margaret', summary: 'Wound care supplies — foam dressing, saline', category: 'dme', orderedBy: 'Dr. Priya Raman', date: 'Jul 31', status: 'signed' },
  { id: 'ord-7', patientId: 'pt-margaret', summary: 'Sliding scale insulin adjustment', category: 'medication', orderedBy: 'Dr. Priya Raman', date: 'Aug 2', status: 'sent', due: 'Aug 5' },
  { id: 'ord-8', patientId: 'pt-harold', summary: 'Home oxygen 2L via nasal cannula — continuous', category: 'dme', orderedBy: 'Dr. Marcus Oh', date: 'Aug 2', status: 'pending-signature', due: 'Before SOC', urgent: true },
  { id: 'ord-9', patientId: 'pt-dorothy', summary: 'Recertification plan of care — cert period 2', category: 'plan-of-care', orderedBy: 'Dr. Susan Cho', date: 'Aug 2', status: 'draft', due: 'Aug 8' },
  { id: 'ord-10', patientId: 'pt-samuel', summary: 'Warfarin 5 mg daily — INR target 2.0–3.0', category: 'medication', orderedBy: 'Dr. Susan Cho', date: 'Aug 1', status: 'signed' },
]

export const medications: Medication[] = [
  { id: 'med-1', patientId: 'pt-elena', name: 'Metoprolol tartrate', dose: '25 mg', route: 'PO', frequency: 'BID', startDate: 'Jul 29', status: 'needs-review', highRisk: true, note: 'Discharge list shows 25 mg; medication bottle labeled 50 mg. Confirm with Dr. Cho before next dose.' },
  { id: 'med-2', patientId: 'pt-elena', name: 'Apixaban', dose: '2.5 mg', route: 'PO', frequency: 'BID', startDate: 'Jul 29', status: 'active', highRisk: true, note: 'DVT prophylaxis, 35-day post-op course.' },
  { id: 'med-3', patientId: 'pt-elena', name: 'Acetaminophen', dose: '650 mg', route: 'PO', frequency: 'Q6H PRN pain', startDate: 'Jul 29', status: 'active' },
  { id: 'med-4', patientId: 'pt-elena', name: 'Oxycodone', dose: '5 mg', route: 'PO', frequency: 'Q8H PRN severe pain', startDate: 'Jul 29', status: 'active', highRisk: true, note: 'Taper plan documented; reassess at day 14.' },
  { id: 'med-5', patientId: 'pt-elena', name: 'Docusate sodium', dose: '100 mg', route: 'PO', frequency: 'BID', startDate: 'Jul 29', status: 'active' },
  { id: 'med-6', patientId: 'pt-elena', name: 'Atorvastatin', dose: '20 mg', route: 'PO', frequency: 'QHS', startDate: 'Jul 29', status: 'active' },
  { id: 'med-7', patientId: 'pt-walter', name: 'Furosemide', dose: '40 mg', route: 'PO', frequency: 'QAM', startDate: 'Jul 12', status: 'active', highRisk: true },
  { id: 'med-8', patientId: 'pt-walter', name: 'Carvedilol', dose: '12.5 mg', route: 'PO', frequency: 'BID', startDate: 'Jul 12', status: 'active' },
  { id: 'med-9', patientId: 'pt-margaret', name: 'Insulin glargine', dose: '18 units', route: 'SubQ', frequency: 'QHS', startDate: 'Jul 22', status: 'active', highRisk: true },
  { id: 'med-10', patientId: 'pt-samuel', name: 'Warfarin', dose: '5 mg', route: 'PO', frequency: 'Daily', startDate: 'Aug 1', status: 'active', highRisk: true, note: 'Next INR draw Aug 5.' },
]

export const nextBestActions: ActionItem[] = [
  { id: 'act-1', title: 'Review remaining SOC assessment items', detail: '7 responses need clinician confirmation before signature', patientId: 'pt-elena', due: 'Required before signature', kind: 'assessment' },
  { id: 'act-2', title: 'Follow up on plan-of-care signature', detail: 'CMS-485 sent to Dr. Cho · no response in 18 hours', patientId: 'pt-elena', due: 'Due in 4 hours', kind: 'signature', blocking: 'Blocks claim readiness' },
  { id: 'act-3', title: 'Resolve metoprolol dose discrepancy', detail: 'Discharge list 25 mg vs bottle 50 mg — confirm with physician', patientId: 'pt-elena', due: 'Before 2:30 PM visit', kind: 'medication', blocking: 'High-risk medication' },
]

export const integrityChecks: IntegrityCheck[] = [
  { id: 'chk-1', label: 'Referral documentation complete', status: 'passed', detail: 'Hospital discharge summary and demographics on file' },
  { id: 'chk-2', label: 'Face-to-face encounter documented', status: 'passed', detail: 'Dr. Cho encounter Jul 26 · within 90-day window' },
  { id: 'chk-3', label: 'Insurance eligibility verified', status: 'passed', detail: 'Medicare Part A active · verified Jul 28' },
  { id: 'chk-4', label: 'OASIS-E2 SOC assessment', status: 'attention', detail: '7 items need clinician confirmation' },
  { id: 'chk-5', label: 'Medication reconciliation', status: 'attention', detail: 'Metoprolol dose discrepancy unresolved' },
  { id: 'chk-6', label: 'Plan of care physician signature', status: 'blocked', detail: 'CMS-485 awaiting Dr. Cho signature' },
  { id: 'chk-7', label: 'Consents and privacy notices', status: 'passed', detail: 'Signed at SOC visit Jul 29' },
  { id: 'chk-8', label: 'Emergency preparedness plan', status: 'passed', detail: 'Level 2 · caregiver contact confirmed' },
  { id: 'chk-9', label: 'Home safety evaluation', status: 'passed', detail: 'Completed at SOC · grab bars recommended' },
  { id: 'chk-10', label: 'Fall risk assessment (MAHC-10)', status: 'passed', detail: 'Score 6 · high-risk protocol active' },
  { id: 'chk-11', label: 'Visit frequency matches orders', status: 'passed', detail: 'SN 2w9, PT 2w9 scheduled' },
  { id: 'chk-12', label: 'Advance directive on file', status: 'passed', detail: 'POLST uploaded Jul 29' },
  { id: 'chk-13', label: 'Primary diagnosis coded and sequenced', status: 'passed', detail: 'Z47.1 with 6 secondary codes' },
]

export const elenaTimeline: TimelineEntry[] = [
  { id: 'tl-1', patientId: 'pt-elena', when: 'Jul 26 · 9:14 AM', title: 'Referral received', detail: 'Regional Medical Center discharge planner · s/p right hip replacement', actor: 'Fax intake', kind: 'referral' },
  { id: 'tl-2', patientId: 'pt-elena', when: 'Jul 26 · 11:02 AM', title: 'Insurance verified', detail: 'Medicare Part A active · HMO check negative', actor: 'Gloria Sandoval', kind: 'intake' },
  { id: 'tl-3', patientId: 'pt-elena', when: 'Jul 26 · 3:40 PM', title: 'SOC scheduled', detail: 'Jul 29 window 1–3 PM accepted by patient’s daughter', actor: 'Scheduling', kind: 'intake' },
  { id: 'tl-4', patientId: 'pt-elena', when: 'Jul 29 · 1:15 PM', title: 'Start of care visit', detail: 'OASIS-E2 SOC assessment started in home · vitals stable', actor: 'Taylor Brooks, RN', kind: 'soc' },
  { id: 'tl-5', patientId: 'pt-elena', when: 'Jul 29 · 2:50 PM', title: 'Consents signed', detail: 'Service agreement, privacy notices, patient rights', actor: 'Taylor Brooks, RN', kind: 'document' },
  { id: 'tl-6', patientId: 'pt-elena', when: 'Jul 29 · 5:20 PM', title: 'Plan of care drafted', detail: 'CMS-485 generated from assessment · sent for physician signature', actor: 'Brad · reviewed by T. Brooks', kind: 'order' },
  { id: 'tl-7', patientId: 'pt-elena', when: 'Jul 30 · 8:05 AM', title: 'Medication flag raised', detail: 'Metoprolol dose discrepancy detected across sources', actor: 'Brad clinical assist', kind: 'quality' },
  { id: 'tl-8', patientId: 'pt-elena', when: 'Jul 30 · 10:30 AM', title: 'PT evaluation completed', detail: 'Gait 15 ft with FWW · plan 2w9 established', actor: 'Marcus Webb, PT', kind: 'visit' },
  { id: 'tl-9', patientId: 'pt-elena', when: 'Aug 1 · 9:00 AM', title: 'HHA plan assigned', detail: 'Personal care 3w9 · aide Priya Natarajan', actor: 'Scheduling', kind: 'intake' },
  { id: 'tl-10', patientId: 'pt-elena', when: 'Aug 3 · 7:45 AM', title: 'Claim-readiness check', detail: '11 of 13 record-integrity checks passing · POC signature outstanding', actor: 'Revenue cycle', kind: 'billing' },
]

export const referrals: Referral[] = [
  { id: 'ref-1', name: 'Harold Nguyen', age: 88, source: 'Valley Medical Center', diagnosis: 'COPD exacerbation', payer: 'Medicare', received: 'Aug 2 · 2:10 PM', stage: 'soc-scheduled', slaHoursLeft: 18, owner: 'Gloria Sandoval' },
  { id: 'ref-2', name: 'Beatrice Kim', age: 81, source: 'Dr. Alvarez (community)', diagnosis: 'CHF, med management', payer: 'Medicare', received: 'Aug 3 · 8:20 AM', stage: 'insurance-verification', slaHoursLeft: 30, owner: 'Gloria Sandoval' },
  { id: 'ref-3', name: 'Frank Moreno', age: 73, source: 'Regional Medical Center', diagnosis: 's/p CABG', payer: 'Managed care', received: 'Aug 3 · 9:05 AM', stage: 'new', slaHoursLeft: 44, owner: 'Unassigned' },
  { id: 'ref-4', name: 'Lucille Barnes', age: 90, source: 'Mission Skilled Nursing', diagnosis: 'Debility, fall history', payer: 'Medicare', received: 'Aug 2 · 4:45 PM', stage: 'scheduling-soc', slaHoursLeft: 12, owner: 'Marcus Lee' },
  { id: 'ref-5', name: 'Peter Vasquez', age: 68, source: 'St. Luke’s ED', diagnosis: 'Cellulitis, IV antibiotics', payer: 'Medi-Cal', received: 'Aug 1 · 11:30 AM', stage: 'non-admit', slaHoursLeft: 0, owner: 'Gloria Sandoval' },
  { id: 'ref-6', name: 'Agnes Thornton', age: 85, source: 'Valley Medical Center', diagnosis: 's/p hip fracture ORIF', payer: 'Medicare', received: 'Aug 3 · 10:15 AM', stage: 'new', slaHoursLeft: 46, owner: 'Unassigned' },
]

export const claims: Claim[] = [
  { id: 'clm-1', patientId: 'pt-walter', period: 'Jul 12 – Aug 10', type: 'RAP/NOA', amount: 2412, status: 'submitted', holds: [] },
  { id: 'clm-2', patientId: 'pt-elena', period: 'Jul 29 – Sep 26', type: 'RAP/NOA', amount: 2861, status: 'holds', holds: ['POC signature outstanding', 'OASIS not finalized'] },
  { id: 'clm-3', patientId: 'pt-june', period: 'Jun 30 – Aug 28', type: 'RAP/NOA', amount: 2544, status: 'paid', holds: [] },
  { id: 'clm-4', patientId: 'pt-dorothy', period: 'Jun 12 – Aug 10', type: 'Final', amount: 4108, status: 'holds', holds: ['Recert POC in draft'] },
  { id: 'clm-5', patientId: 'pt-raymond', period: 'Jul 25 – Sep 22', type: 'RAP/NOA', amount: 2790, status: 'claim-ready', holds: [] },
  { id: 'clm-6', patientId: 'pt-samuel', period: 'Aug 1 – Aug 30', type: 'RAP/NOA', amount: 1980, status: 'claim-ready', holds: [] },
]

export const documents: PatientDocument[] = [
  { id: 'doc-1', patientId: 'pt-elena', title: 'Hospital discharge summary', category: 'physician', date: 'Jul 26', status: 'final', pages: 12 },
  { id: 'doc-2', patientId: 'pt-elena', title: 'Face-to-face encounter note', category: 'physician', date: 'Jul 26', status: 'final', pages: 2 },
  { id: 'doc-3', patientId: 'pt-elena', title: 'Service agreement & consents', category: 'consent', date: 'Jul 29', status: 'final', pages: 6 },
  { id: 'doc-4', patientId: 'pt-elena', title: 'OASIS-E2 SOC assessment', category: 'assessment', date: 'Jul 29', status: 'draft', pages: 28 },
  { id: 'doc-5', patientId: 'pt-elena', title: 'Plan of care · CMS-485', category: 'plan-of-care', date: 'Jul 29', status: 'pending-signature', pages: 4 },
  { id: 'doc-6', patientId: 'pt-elena', title: 'POLST', category: 'consent', date: 'Jul 29', status: 'final', pages: 1 },
  { id: 'doc-7', patientId: 'pt-elena', title: 'Home safety evaluation', category: 'assessment', date: 'Jul 29', status: 'final', pages: 3 },
  { id: 'doc-8', patientId: 'pt-elena', title: 'PT evaluation', category: 'assessment', date: 'Jul 30', status: 'final', pages: 5 },
]

export const assessments: Assessment[] = [
  {
    id: 'as-1', patientId: 'pt-elena', name: 'OASIS-E2 · Start of care', discipline: 'RN', window: 'Jul 29 – Aug 2', status: 'in-progress', completion: 82,
    items: [
      { section: 'Demographics & payer', done: 12, total: 12 },
      { section: 'Health conditions', done: 18, total: 18 },
      { section: 'Functional status (GG items)', done: 14, total: 17 },
      { section: 'Medications', done: 6, total: 8 },
      { section: 'Skin & wounds', done: 9, total: 9 },
      { section: 'Cognition & mood', done: 11, total: 13 },
    ],
  },
  { id: 'as-2', patientId: 'pt-elena', name: 'MAHC-10 fall risk', discipline: 'RN', window: 'Jul 29', status: 'complete', completion: 100 },
  { id: 'as-3', patientId: 'pt-elena', name: 'PHQ-2 mood screen', discipline: 'RN', window: 'Jul 29', status: 'complete', completion: 100 },
  { id: 'as-4', patientId: 'pt-elena', name: 'PT initial evaluation', discipline: 'PT', window: 'Jul 30', status: 'complete', completion: 100 },
  { id: 'as-5', patientId: 'pt-elena', name: 'Nutrition risk screen', discipline: 'RN', window: 'Due Aug 5', status: 'due-soon', completion: 0 },
]

export const notifications: Notification[] = [
  { id: 'n-1', title: 'Dr. Cho viewed the CMS-485', detail: 'Opened 22 minutes ago · not yet signed', when: '9:41 AM', kind: 'order', unread: true },
  { id: 'n-2', title: 'Visit reschedule request', detail: 'June Castellano’s daughter asked to move Aug 5 ST visit to afternoon', when: '8:55 AM', kind: 'schedule', unread: true },
  { id: 'n-3', title: 'OASIS warning cleared', detail: 'GG0170 response conflict resolved after PT note sync', when: 'Yesterday', kind: 'quality', unread: true },
  { id: 'n-4', title: 'New message · Marcus Webb, PT', detail: '“Elena did 20 ft with the walker today — big improvement.”', when: 'Yesterday', kind: 'message' },
]

export const bradSuggestions: BradSuggestion[] = [
  {
    id: 'brad-1',
    title: 'Confirm whether metoprolol is 25 mg or 50 mg twice daily.',
    body: 'The hospital discharge list and the medication bottle in the home disagree. This is a beta-blocker dose difference worth a physician call before tonight’s dose.',
    sources: ['Hospital discharge list · Jul 26', 'Patient medication bottle · photographed Jul 29'],
    confidence: 'needs-confirmation',
  },
  {
    id: 'brad-2',
    title: 'Draft SN visit note is ready from today’s assessment.',
    body: 'Vitals, wound observation, and teaching topics are pre-filled from your documentation. Review each section before signing — nothing files without you.',
    sources: ['Today’s visit documentation', 'Care plan goals'],
    confidence: 'suggested',
  },
]
