import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  ArrowRight, FileSignature, FileText, Pill, Sparkles,
} from 'lucide-react'
import { getPatient } from '../data/patients'
import { Drawer, EmptyState, PatientAvatar, StatusChip, Tabs } from '../ui'
import type { StatusTone } from '../ui'
import './clin.css'

/* ---------- Worklist data model ---------- */

type WorkKind = 'documentation' | 'assessment' | 'medication'
type TabKey = 'needs-attention' | 'drafts' | 'completed' | 'all'

interface WorkItem {
  id: string
  patientId: string
  kind: WorkKind
  title: string
  meta: string
  disciplineLabel: string
  statusTone: StatusTone
  statusLabel: string
  bradDraft?: boolean
  progressPct?: number
  cta: { label: string; kind: 'link'; to: string } | { label: string; kind: 'drawer' }
  tab: 'needs-attention' | 'drafts' | 'completed'
}

// Synthetic worklist, cross-referenced to today's visits / assessments / medications.
const WORK_ITEMS: WorkItem[] = [
  {
    id: 'raymond-pt-note',
    patientId: 'pt-raymond',
    kind: 'documentation',
    title: 'Physical therapy · gait training',
    meta: 'Today · 9:00 – 9:45 AM · Marcus Webb, PT',
    disciplineLabel: 'PT',
    statusTone: 'warn',
    statusLabel: 'Note due · visit ended 9:45 AM',
    cta: { label: 'Open note', kind: 'drawer' },
    tab: 'needs-attention',
  },
  {
    id: 'elena-soc-assessment',
    patientId: 'pt-elena',
    kind: 'assessment',
    title: 'OASIS-E2 · Start of care assessment',
    meta: 'Window Jul 29 – Aug 2 · 7 items need clinician confirmation',
    disciplineLabel: 'RN',
    statusTone: 'warn',
    statusLabel: '82% complete',
    progressPct: 82,
    cta: { label: 'Resume assessment', kind: 'link', to: '/patients/pt-elena/assessments' },
    tab: 'needs-attention',
  },
  {
    id: 'elena-metoprolol',
    patientId: 'pt-elena',
    kind: 'medication',
    title: 'Metoprolol tartrate — dose reconciliation',
    meta: 'Discharge list 25 mg BID vs bottle labeled 50 mg BID',
    disciplineLabel: 'Medication',
    statusTone: 'bad',
    statusLabel: 'High-risk · unresolved',
    cta: { label: 'Review medication', kind: 'link', to: '/patients/pt-elena/medications' },
    tab: 'needs-attention',
  },
  {
    id: 'elena-soc-followup',
    patientId: 'pt-elena',
    kind: 'documentation',
    title: 'Skilled nursing · SOC follow-up',
    meta: 'Today · 2:30 PM · Taylor Brooks, RN',
    disciplineLabel: 'SN',
    statusTone: 'progress',
    statusLabel: 'Scheduled · 2:30 PM',
    bradDraft: true,
    cta: { label: 'Open note', kind: 'drawer' },
    tab: 'drafts',
  },
  {
    id: 'walter-sn-note',
    patientId: 'pt-walter',
    kind: 'documentation',
    title: 'Skilled nursing · CHF check',
    meta: 'Today · 11:00 – 11:45 AM · Taylor Brooks, RN',
    disciplineLabel: 'SN',
    statusTone: 'good',
    statusLabel: 'Signed',
    cta: { label: 'Open note', kind: 'drawer' },
    tab: 'completed',
  },
]

const NEEDS_ATTENTION_COUNT = WORK_ITEMS.filter(i => i.tab === 'needs-attention').length

const TABS: { key: TabKey; label: string; count?: number }[] = [
  { key: 'needs-attention', label: 'Needs attention', count: NEEDS_ATTENTION_COUNT },
  { key: 'drafts', label: 'Drafts' },
  { key: 'completed', label: 'Completed today' },
  { key: 'all', label: 'All' },
]

/* ---------- Note preview content (Drawer) ---------- */

const VITALS = [
  { label: 'BP', value: '128/76' },
  { label: 'HR', value: '72' },
  { label: 'RR', value: '16' },
  { label: 'SpO2', value: '97%' },
  { label: 'Temp', value: '98.1°F' },
]

interface NotePreview {
  visitLabel: string
  clinician: string
  signed?: { by: string; when: string }
  subjective: string
  objective: string
  assessment: string
  plan: string
}

const NOTE_PREVIEWS: Record<string, NotePreview> = {
  'raymond-pt-note': {
    visitLabel: 'Physical therapy · gait training',
    clinician: 'Marcus Webb, PT',
    subjective: 'Patient reports left knee pain 3/10 at rest and 5/10 with stair negotiation, feeling stronger than last week and tolerating the full session without rest breaks.',
    objective: 'Gait 40 ft with front-wheeled walker and a minimal antalgic pattern. Knee flexion 0–105°, quadriceps strength 4/5.',
    assessment: 'Progressing steadily toward the independent-ambulation goal; pain is well controlled with the current regimen.',
    plan: 'Continue PT twice weekly, advance to stair training next visit, and reinforce the home exercise program.',
  },
  'elena-soc-followup': {
    visitLabel: 'Skilled nursing · SOC follow-up',
    clinician: 'Taylor Brooks, RN',
    subjective: 'Patient reports incisional soreness improving and better sleep since starting scheduled acetaminophen. No new falls or dizziness.',
    objective: 'Incision clean, dry, and intact with staples in place. Ambulates 20 ft with a front-wheeled walker, steady gait.',
    assessment: 'Post-op recovery on track; metoprolol dose discrepancy remains open pending physician clarification.',
    plan: 'Continue SN twice weekly, reinforce fall-precaution teaching, and follow up on medication reconciliation before the next dose.',
  },
  'walter-sn-note': {
    visitLabel: 'Skilled nursing · CHF check',
    clinician: 'Taylor Brooks, RN',
    signed: { by: 'Taylor Brooks, RN', when: 'Today · 11:38 AM' },
    subjective: 'Denies shortness of breath or chest pain today. Reports good adherence to the low-sodium diet and daily weights.',
    objective: 'Lungs clear bilaterally, trace lower-extremity edema, weight stable at 182 lb (no change from yesterday).',
    assessment: 'CHF stable with no signs of exacerbation; medication adherence confirmed.',
    plan: 'Continue the current diuretic regimen, telehealth check-in scheduled Aug 7, and reinforce daily weight monitoring.',
  },
}

function WorkCard({ item, onOpenNote }: { item: WorkItem; onOpenNote: (id: string) => void }) {
  const navigate = useNavigate()
  const patient = getPatient(item.patientId)
  const cta = item.cta
  if (!patient) return null

  return (
    <article className="card clin-card">
      <div className="clin-card-head">
        <button
          className="clin-card-patient"
          onClick={() => navigate(`/patients/${patient.id}`)}
          aria-label={`Open chart for ${patient.firstName} ${patient.lastName}`}
        >
          <PatientAvatar first={patient.firstName} last={patient.lastName} tone={patient.photoTone} />
          <span className="clin-card-name">{patient.firstName} {patient.lastName}</span>
        </button>

        <div className="clin-card-chips">
          <span className="chip chip-outline">{item.disciplineLabel}</span>
          {item.bradDraft && (
            <span className="chip chip-teal">
              <Sparkles size={11} strokeWidth={2} aria-hidden />
              Draft ready
            </span>
          )}
          <StatusChip tone={item.statusTone}>{item.statusLabel}</StatusChip>
        </div>
      </div>

      <div className="clin-card-main">
        <div className="clin-card-text">
          <div className="clin-card-title">{item.title}</div>
          <div className="clin-card-meta">{item.meta}</div>
          {item.progressPct != null && (
            <div className="clin-card-progress">
              <div className="progress" role="progressbar" aria-valuenow={item.progressPct} aria-valuemin={0} aria-valuemax={100}>
                <div className="progress-fill" style={{ width: `${item.progressPct}%`, ['--progress-color' as string]: 'var(--orange-400)' }} />
              </div>
            </div>
          )}
        </div>

        <div className="clin-card-actions">
          {cta.kind === 'drawer' ? (
            <button className="btn btn-secondary btn-sm" onClick={() => onOpenNote(item.id)}>
              <FileText size={14} strokeWidth={1.75} aria-hidden />
              {cta.label}
            </button>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(cta.to)}>
              {cta.label}
              <ArrowRight size={13} strokeWidth={2.25} aria-hidden />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function NoteSection({ label, body, children }: { label: string; body: string; children?: ReactNode }) {
  return (
    <div className="clin-note-section">
      <div className="clin-note-section-head">
        <span className="card-kicker">{label}</span>
        <span className="chip chip-outline">Pre-filled from assessment — review required</span>
      </div>
      {children}
      <p className="clin-note-text">{body}</p>
    </div>
  )
}

export default function ClinicalScreen() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabKey>('needs-attention')
  const [openNoteId, setOpenNoteId] = useState<string | null>(null)

  const visibleItems = useMemo(
    () => (activeTab === 'all' ? WORK_ITEMS : WORK_ITEMS.filter(i => i.tab === activeTab)),
    [activeTab],
  )

  const openItem = openNoteId ? WORK_ITEMS.find(i => i.id === openNoteId) : undefined
  const openPatient = openItem ? getPatient(openItem.patientId) : undefined
  const openPreview = openNoteId ? NOTE_PREVIEWS[openNoteId] : undefined

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">Clinical</h1>
          <div className="screen-sub">3 notes need attention</div>
        </div>
        <div className="screen-actions">
          <button className="btn btn-primary" onClick={() => setOpenNoteId('raymond-pt-note')}>
            <FileSignature size={15} strokeWidth={2} aria-hidden />
            Start visit documentation
          </button>
        </div>
      </div>

      <Tabs items={TABS} active={activeTab} onChange={key => setActiveTab(key as TabKey)} />

      <div className="clin-list">
        {visibleItems.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<Pill size={26} strokeWidth={1.5} aria-hidden />}
              title="Nothing here right now"
              sub="This queue clears as visits are documented."
            />
          </div>
        ) : (
          visibleItems.map(item => (
            <WorkCard key={item.id} item={item} onOpenNote={setOpenNoteId} />
          ))
        )}
      </div>

      <Drawer
        open={!!openNoteId}
        onClose={() => setOpenNoteId(null)}
        title={openPatient ? `${openPatient.firstName} ${openPatient.lastName}` : ''}
        sub={openItem && openPreview ? `${openPreview.visitLabel} · ${openPreview.clinician}` : undefined}
      >
        {openPreview && (
          <div className="clin-note">
            <NoteSection label="Subjective" body={openPreview.subjective} />
            <NoteSection label="Objective" body={openPreview.objective}>
              <div className="clin-vitals-grid">
                {VITALS.map(v => (
                  <div key={v.label} className="clin-vital">
                    <span className="clin-vital-label">{v.label}</span>
                    <span className="clin-vital-value">{v.value}</span>
                  </div>
                ))}
              </div>
            </NoteSection>
            <NoteSection label="Assessment" body={openPreview.assessment} />
            <NoteSection label="Plan" body={openPreview.plan} />

            <div className="clin-note-footer">
              {openPreview.signed ? (
                <div className="clin-note-signed">
                  <StatusChip tone="good">Signed</StatusChip>
                  <span>{openPreview.signed.by} · {openPreview.signed.when}</span>
                </div>
              ) : (
                <button className="btn btn-primary">
                  <FileSignature size={15} strokeWidth={2} aria-hidden />
                  Review &amp; sign
                </button>
              )}
              <p className="clin-note-footnote">Nothing files without clinician signature.</p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
