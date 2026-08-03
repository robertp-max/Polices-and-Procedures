// Synthetic design-prototype data model. No PHI — every record is fictional.

export type RiskLevel = 'low' | 'moderate' | 'high'

export interface Patient {
  id: string
  mrn: string
  firstName: string
  lastName: string
  age: number
  pronouns: string
  payer: 'Medicare' | 'Medi-Cal' | 'Managed care' | 'Private'
  city: string
  primaryDx: { code: string; label: string }
  allergies: { substance: string; reaction: string }[]
  episode: { socDate: string; day: number; length: number; status: 'active' | 'pending-soc' | 'discharge-planned' }
  flags: string[]
  riskLevel: RiskLevel
  team: { role: string; name: string }[]
  nextVisit?: { date: string; time: string; type: string; clinician: string }
  socCompletion: number
  openOrders: number
  integrity: { passed: number; total: number }
  photoTone: string // avatar background tone key
}

export interface VisitEvent {
  id: string
  patientId: string
  date: string
  time: string
  durationMin: number
  discipline: 'SN' | 'PT' | 'OT' | 'ST' | 'MSW' | 'HHA'
  type: string
  clinician: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'missed' | 'documentation-due'
  location: 'home' | 'telehealth'
}

export interface Order {
  id: string
  patientId: string
  summary: string
  category: 'medication' | 'plan-of-care' | 'lab' | 'dme' | 'referral'
  orderedBy: string
  date: string
  status: 'draft' | 'sent' | 'pending-signature' | 'signed' | 'declined'
  due?: string
  urgent?: boolean
}

export interface Medication {
  id: string
  patientId: string
  name: string
  dose: string
  route: string
  frequency: string
  startDate: string
  status: 'active' | 'held' | 'discontinued' | 'needs-review'
  highRisk?: boolean
  note?: string
}

export interface ActionItem {
  id: string
  title: string
  detail: string
  patientId?: string
  due: string
  kind: 'assessment' | 'signature' | 'medication' | 'scheduling' | 'quality'
  blocking?: string
  done?: boolean
}

export interface IntegrityCheck {
  id: string
  label: string
  status: 'passed' | 'attention' | 'blocked'
  detail: string
}

export interface TimelineEntry {
  id: string
  patientId: string
  when: string
  title: string
  detail: string
  actor: string
  kind: 'referral' | 'intake' | 'soc' | 'visit' | 'order' | 'document' | 'quality' | 'billing'
}

export interface Referral {
  id: string
  name: string
  age: number
  source: string
  diagnosis: string
  payer: string
  received: string
  stage: 'new' | 'insurance-verification' | 'scheduling-soc' | 'soc-scheduled' | 'non-admit'
  slaHoursLeft: number
  owner: string
}

export interface Claim {
  id: string
  patientId: string
  period: string
  type: 'RAP/NOA' | 'Final'
  amount: number
  status: 'claim-ready' | 'holds' | 'submitted' | 'paid' | 'denied'
  holds: string[]
}

export interface PatientDocument {
  id: string
  patientId: string
  title: string
  category: 'consent' | 'assessment' | 'physician' | 'plan-of-care' | 'billing'
  date: string
  status: 'final' | 'pending-signature' | 'draft'
  pages: number
}

export interface Assessment {
  id: string
  patientId: string
  name: string
  discipline: string
  window: string
  status: 'complete' | 'in-progress' | 'not-started' | 'due-soon'
  completion: number
  items?: { section: string; done: number; total: number }[]
}

export interface Notification {
  id: string
  title: string
  detail: string
  when: string
  kind: 'order' | 'schedule' | 'quality' | 'message'
  unread?: boolean
}

export interface BradSuggestion {
  id: string
  title: string
  body: string
  sources: string[]
  confidence: 'needs-confirmation' | 'suggested' | 'verified'
}
