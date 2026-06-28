import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, ClipboardCheck, ExternalLink, Loader2, PenLine, Printer } from 'lucide-react';
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';
import { useRegulatoryExecutionStore, type EvidenceDoc } from '@/policy/stores/regulatoryExecutionStore';
import { Button } from '@/v6/primitives';
import {
  computeAdmissionSigners,
  buildAdmissionSignerTasks,
  ADMISSION_TEMPLATE_ID,
  type AdmissionSignerInput,
  type SignerRoleId,
} from '@/policy/admission/admissionSignerModel';
import type { PaymentRoute, RepresentativeAuthority } from '@/policy/admission/patientAdmissionPacket';

/* ════════════════════════════════════════════════════════════════
   Signature Tracker — enter a packet ID to (a) generate eCIgn signature
   tasks for the currently-assigned signer roster, scheduled to be assigned
   after the meeting event, and (b) review signature completion.
   Tasks persist locally keyed by packet ID so the two views stay in sync.
   ════════════════════════════════════════════════════════════════ */

const PACKET_ID_RE = /^.+-\d+$/;

/** Currently-assigned governance signer roster (name · signer role). */
const DEFAULT_ROSTER: { role: string; name: string }[] = [
  { role: 'DON / Chair', name: 'Dakota Director' },
  { role: 'Clinical Manager', name: 'Riley RN' },
  { role: 'Accounting', name: 'Bailey Billing' },
  { role: 'Compliance Officer', name: 'Cameron Compliance' },
  { role: 'Medical Director', name: 'Morgan MD' },
  { role: 'Administrator', name: 'Avery Admin' },
  { role: 'Social Worker', name: 'Jordan SW' },
];

interface SignerTask { role: string; name: string; status: 'scheduled' | 'signed'; signedAt?: string; tier?: 'required' | 'conditional'; separateWorkflow?: boolean }
interface PacketSignatureRecord {
  eventId: string;
  scheduledFor: string;
  createdAt: string;
  signers: SignerTask[];
  /** Marks records produced by the computed admission signer model. */
  model?: 'admission';
  /** Audit trail of the generated eCIgn tasks (admission packets only). */
  audit?: { packetHash: string; paymentRoute?: string; taskIds: string[]; artifactId: string };
}
interface PacketArtifactNote {
  packetId?: string;
  templateId?: string;
  paymentRoute?: string;
  signerType?: 'PATIENT' | 'REPRESENTATIVE';
  driveFiles?: { id: string; name: string; mimeType?: string; webViewLink?: string }[];
}

const LS_KEY = 'ci-signature-tasks';
function loadAll(): Record<string, PacketSignatureRecord> {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
}
function saveAll(m: Record<string, PacketSignatureRecord>) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(m)); } catch { /* ignore */ }
}
function parsePacketNote(note?: string): PacketArtifactNote {
  try { return note ? JSON.parse(note) as PacketArtifactNote : {}; } catch { return {}; }
}

/** Admission packets use the computed signer model; governance packets keep the
 *  fixed roster. Detect via the artifact template id, then the packet-id prefix. */
function isAdmissionPacket(loadedId: string | null, note: PacketArtifactNote): boolean {
  if (note.templateId === ADMISSION_TEMPLATE_ID) return true;
  const id = loadedId ?? '';
  return id.startsWith(ADMISSION_TEMPLATE_ID) || id.startsWith('ADM-');
}

function simpleHash(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function fmtTime(t?: string): string {
  if (!t) return '10:00 AM';
  const m = /^(\d{1,2}):(\d{2})/.exec(t);
  if (!m) return t;
  let h = parseInt(m[1], 10); const min = m[2];
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${min} ${ap}`;
}
function addMinutes(t: string | undefined, mins: number): string {
  const m = /^(\d{1,2}):(\d{2})/.exec(t || '10:00');
  let total = (m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : 600) + mins;
  total = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60), min = String(total % 60).padStart(2, '0');
  return fmtTime(`${h}:${min}`);
}
function fmtDate(d?: string): string {
  if (!d) return 'TBD';
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(d) ? d + 'T00:00:00' : d;
  const dt = new Date(iso);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function SignatureTracker({ incomingPacketId }: { incomingPacketId?: string | null }) {
  const evidenceByEvent = useRegulatoryExecutionStore((s) => s.evidence);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [record, setRecord] = useState<PacketSignatureRecord | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<'schedule' | 'review'>('schedule');

  // The Studio hands off the packet here before printing/downloading.
  useEffect(() => {
    if (!incomingPacketId || !PACKET_ID_RE.test(incomingPacketId)) return;
    setLoadedId(incomingPacketId);
    setConfirmed(false);
    const existing = loadAll()[incomingPacketId] ?? null;
    setRecord(existing);
    setView(existing ? 'review' : 'schedule');
  }, [incomingPacketId]);

  // Print/Download the packet AFTER signing is set up. Runs in the host window
  // (same-origin as the studio iframe), so a direct button click can open the
  // clean print window in the same user gesture — only the packet pages, the
  // studio's page rules, and the "EVENT NAME DATE" title (no app chrome).
  const printPacket = () => {
    if (packetArtifact?.webViewLink) {
      const driveWindow = window.open(packetArtifact.webViewLink, '_blank', 'noopener,noreferrer');
      if (!driveWindow) {
        window.alert('Pop-up blocked — allow pop-ups for this site to open the Google Drive PDF.');
        return;
      }
      window.setTimeout(() => {
        try {
          driveWindow.focus();
          driveWindow.print();
        } catch {
          window.alert('The Google Drive PDF opened in a new window. Use Ctrl+P on Windows or Cmd+P on Mac to print/download it.');
        }
      }, 1000);
      return;
    }

    if (packetArtifact) {
      window.alert('This generated packet does not have a Google Drive PDF URL yet. Upload/link the packet PDF to Google Drive before printing from Signature Tracker.');
      return;
    }

    window.alert('No Google Drive PDF URL is attached to this packet yet.');
  };

  const eventInfo = useMemo(() => {
    const id = (loadedId ?? '').replace(/-\d+$/, '');
    if (id === 'mock-training') return { id, name: 'Mock Event (for training)', date: '', time: '', durationMin: 120 };
    const ev = REGULATORY_EVENTS.find((e) => e.id === id);
    const evWithDuration = ev as (typeof ev & { durationMin?: unknown });
    const durationMin = typeof evWithDuration?.durationMin === 'number' ? evWithDuration.durationMin : 120;
    return ev ? { id, name: ev.title, date: ev.date, time: ev.time, durationMin } : { id, name: id || '(unknown event)', date: '', time: '', durationMin: 120 };
  }, [loadedId]);

  const endTime = useMemo(() => addMinutes(eventInfo.time, eventInfo.durationMin), [eventInfo]);
  const scheduledForLabel = `${fmtDate(eventInfo.date)} at ${endTime}`;

  const generate = () => {
    if (!loadedId || !confirmed) return;
    setBusy(true);
    const rec: PacketSignatureRecord = {
      eventId: eventInfo.id,
      scheduledFor: scheduledForLabel,
      createdAt: new Date().toISOString(),
      signers: DEFAULT_ROSTER.map((r) => ({ role: r.role, name: r.name, status: 'scheduled' })),
    };
    const all = loadAll(); all[loadedId] = rec; saveAll(all);
    setRecord(rec);
    setBusy(false);
  };

  const markSigned = (i: number) => {
    if (!loadedId || !record) return;
    const next = { ...record, signers: record.signers.map((s, j) => j === i ? { ...s, status: 'signed' as const, signedAt: new Date().toISOString() } : s) };
    const all = loadAll(); all[loadedId] = next; saveAll(all);
    setRecord(next);
  };

  const signedCount = record?.signers.filter((s) => s.status === 'signed').length ?? 0;
  const total = record?.signers.length ?? 0;
  const packetArtifact = useMemo(() => {
    if (!loadedId) return null;
    const docs = Object.values(evidenceByEvent).flat() as EvidenceDoc[];
    return docs.find((doc) => {
      if (doc.artifactId === loadedId) return true;
      const note = parsePacketNote(doc.note);
      return note.packetId === loadedId;
    }) ?? null;
  }, [evidenceByEvent, loadedId]);
  const packetArtifactNote = useMemo(() => parsePacketNote(packetArtifact?.note), [packetArtifact]);
  const driveSourceFiles = packetArtifactNote.driveFiles?.filter((file) => file.webViewLink) ?? [];
  const isAdmission = useMemo(() => isAdmissionPacket(loadedId, packetArtifactNote), [loadedId, packetArtifactNote]);

  return (
    <section className="grid gap-md" data-hash-id="signature-tracker" data-route="/evidence" data-template="evidence">
      {!loadedId && (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-card bg-surface-glass backdrop-blur-md p-lg text-sm text-muted">
          Generate a packet in Create Packet to schedule signatures or review completion.
        </div>
      )}

      {loadedId && (
        <>
          <div className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest">
            <div className="flex flex-wrap items-start justify-between gap-md">
              <div>
                <h2 className="text-sm font-medium text-ink">Google Drive URL</h2>
                <p className="mt-xs text-xs text-muted">
                  {packetArtifact?.webViewLink
                    ? 'Packet artifact is linked to Google Drive.'
                    : driveSourceFiles.length > 0
                      ? 'Packet source document URLs selected from Google Drive.'
                      : 'No Google Drive URL is attached to this generated packet yet.'}
                </p>
              </div>
              {packetArtifact?.webViewLink && (
                <a
                  href={packetArtifact.webViewLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-xs rounded-full bg-brand-teal px-md py-sm text-xs font-medium text-on-brand shadow-rest hover:bg-brand-teal-deep"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open packet in Drive
                </a>
              )}
            </div>
            {packetArtifact?.webViewLink && (
              <p className="mt-md break-all rounded-md bg-white/60 px-md py-sm font-mono text-xs text-brand-teal-deep">{packetArtifact.webViewLink}</p>
            )}
            {driveSourceFiles.length > 0 && (
              <div className="mt-md grid gap-xs">
                {driveSourceFiles.map((file) => (
                  <a
                    key={file.id}
                    href={file.webViewLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-md rounded-md bg-white/60 px-md py-sm text-xs text-secondary hover:text-brand-teal-deep"
                  >
                    <span className="min-w-0 truncate">{file.name}</span>
                    <span className="shrink-0 inline-flex items-center gap-xs font-medium text-brand-teal"><ExternalLink className="h-3.5 w-3.5" /> Open</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {isAdmission && (
            <AdmissionSignerPanel
              loadedId={loadedId}
              note={packetArtifactNote}
              scheduledForLabel={scheduledForLabel}
              eventName={eventInfo.name}
              artifactId={packetArtifact?.artifactId ?? loadedId}
              onPrint={printPacket}
            />
          )}

          {!isAdmission && (
          <>
          {/* View toggle */}
          {record && (
            <div className="flex justify-start">
              <div className="flex rounded-lg border border-hairline bg-surface-glass backdrop-blur-md p-xs gap-xs">
                <button
                  type="button"
                  onClick={() => setView('schedule')}
                  className={`px-lg py-sm text-xs font-heading font-medium uppercase tracking-wider rounded-md transition-all duration-fast ${
                    view === 'schedule'
                      ? 'bg-brand-teal text-on-brand shadow-rest'
                      : 'text-brand-teal-deep hover:bg-surface-hover hover:text-brand-teal'
                  }`}
                >
                  Tasks &amp; schedule
                </button>
                <button
                  type="button"
                  onClick={() => setView('review')}
                  className={`px-lg py-sm text-xs font-heading font-medium uppercase tracking-wider rounded-md transition-all duration-fast ${
                    view === 'review'
                      ? 'bg-brand-teal text-on-brand shadow-rest'
                      : 'text-brand-teal-deep hover:bg-surface-hover hover:text-brand-teal'
                  }`}
                >
                  Completion review
                </button>
              </div>
            </div>
          )}

          {/* SCHEDULE / GENERATE — two-card panel (roster left, confirm/thank-you right) */}
          {view === 'schedule' && (
            <div className="grid items-start gap-md desktop:grid-cols-2">
              {/* Card 1 — signer roster + schedule note */}
              <div className="grid content-start gap-md rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest">
                <div className="flex items-center gap-sm">
                  <ClipboardCheck className="h-icon-sm w-icon-sm text-brand-teal" />
                  <h2 className="text-sm font-medium text-ink">Signature tasks · currently assigned signer roster</h2>
                </div>
                <RosterTable signers={(record?.signers ?? DEFAULT_ROSTER.map((r) => ({ ...r, status: 'scheduled' as const })))} />
                <div className="flex items-center gap-xs rounded-lg border border-tone-teal-border bg-tone-teal-bg px-md py-sm text-xs text-brand-teal-deep">
                  <CalendarClock className="h-4 w-4" />
                  Signature tasks are scheduled to be assigned <strong>after the meeting</strong> — on {scheduledForLabel}.
                </div>
              </div>

              {/* Card 2 — confirm + generate (pre) OR thank-you (post) */}
              {!record ? (
                <div className="grid content-start gap-md rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest">
                  <div className="flex items-center gap-sm">
                    <PenLine className="h-icon-sm w-icon-sm text-brand-teal" />
                    <h2 className="text-sm font-medium text-ink">Schedule signing</h2>
                  </div>
                  <label className="flex items-start gap-sm text-sm text-ink">
                    <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--brand-teal,#00897B)]" />
                    I confirm these individuals will be assigned tasks to sign this packet after the scheduled meeting event.
                  </label>
                  <Button
                    onClick={generate}
                    disabled={!confirmed || busy}
                    variant="primary"
                    size="sm"
                    iconLeft={busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />}
                  >
                    Generate &amp; schedule signature tasks
                  </Button>
                </div>
              ) : (
                <ThankYou eventName={eventInfo.name} dateLabel={fmtDate(eventInfo.date)} timeLabel={fmtTime(eventInfo.time)} scheduledFor={record.scheduledFor} signers={record.signers} onReview={() => setView('review')} onPrint={printPacket} />
              )}
            </div>
          )}

          {/* COMPLETION REVIEW */}
          {view === 'review' && record && (
            <div className="grid gap-md rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest">
              <div className="flex flex-wrap items-center justify-between gap-sm">
                <div className="flex items-center gap-sm">
                  <CheckCircle2 className="h-icon-sm w-icon-sm text-brand-teal" />
                  <h2 className="text-sm font-medium text-ink">Signature completion</h2>
                </div>
                <span className={`rounded-full px-md py-xs text-xs font-medium ${signedCount === total ? 'bg-tone-teal-bg text-brand-teal-deep' : 'bg-tone-orange-bg text-tone-orange-text'}`}>
                  {signedCount} of {total} signed{signedCount === total ? ' · complete' : ''}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-tone-slate-bg">
                <div className="h-full rounded-full bg-brand-teal transition-all" style={{ width: `${total ? (signedCount / total) * 100 : 0}%` }} />
              </div>
              <RosterTable signers={record.signers} onMarkSigned={markSigned} />
              <div className="flex flex-wrap items-center justify-between gap-sm">
                <p className="text-[11px] text-muted">Signing happens in eCIgn after the meeting. Use “Mark signed” to record completion here, or open the packet’s forms to sign.</p>
                <Button
                  onClick={printPacket}
                  variant="primary"
                  size="sm"
                  iconLeft={<Printer className="h-4 w-4" />}
                >
                  Print / Download packet
                </Button>
              </div>
            </div>
          )}

          {view === 'review' && !record && (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-card bg-surface-glass backdrop-blur-md p-lg text-sm text-muted">
              No signature tasks scheduled for this packet yet. Switch to “Tasks &amp; schedule” to generate them.
            </div>
          )}
          </>
          )}
        </>
      )}
    </section>
  );
}

function RosterTable({ signers, onMarkSigned }: { signers: SignerTask[]; onMarkSigned?: (i: number) => void }) {
  return (
    <div className="overflow-hidden rounded-lg border border-card bg-surface-glass shadow-glass-inset">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-tone-slate-bg text-left text-[10px] uppercase tracking-tag text-muted">
            <th className="px-md py-sm">Name</th>
            <th className="px-md py-sm">Signer role</th>
            <th className="px-md py-sm">Status</th>
            {onMarkSigned && <th className="px-md py-sm"></th>}
          </tr>
        </thead>
        <tbody>
          {signers.map((s, i) => (
            <tr key={`${s.role}-${i}`} className="border-t border-hairline">
              <td className="px-md py-sm text-ink">{s.name}</td>
              <td className="px-md py-sm text-secondary">{s.role}</td>
              <td className="px-md py-sm">
                {s.status === 'signed' ? (
                  <span className="flex items-center gap-xs text-brand-teal-deep"><CheckCircle2 className="h-3.5 w-3.5" /> Signed{s.signedAt ? ` · ${new Date(s.signedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}</span>
                ) : (
                  <span className="flex items-center gap-xs text-tone-orange-text"><CalendarClock className="h-3.5 w-3.5" /> Scheduled</span>
                )}
              </td>
              {onMarkSigned && (
                <td className="px-md py-sm text-right">
                  {s.status !== 'signed' && (
                    <Button
                      onClick={() => onMarkSigned(i)}
                      variant="secondary"
                      size="sm"
                      className="px-md py-xs text-xs"
                    >
                      Mark signed
                    </Button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ThankYou({ eventName, dateLabel, timeLabel, scheduledFor, signers, onReview, onPrint }: { eventName: string; dateLabel: string; timeLabel: string; scheduledFor: string; signers: SignerTask[]; onReview: () => void; onPrint: () => void }) {
  return (
    <div className="grid gap-sm rounded-lg border border-tone-teal-border bg-tone-teal-bg p-lg text-sm text-brand-teal-deep shadow-rest">
      <div className="flex items-center gap-sm font-medium"><CheckCircle2 className="h-5 w-5" /> Thank you — your meeting packet is ready.</div>
      <p>Please use this as your agenda for the upcoming <strong>{eventName}</strong> on <strong>{dateLabel}</strong> at <strong>{timeLabel}</strong>. Please go over this packet and use the Evidence Studio if you have any corrections.</p>
      <p>Signature tasks are scheduled to be assigned to these individuals on <strong>{scheduledFor}</strong>:</p>
      <ul className="grid gap-xs pl-md">
        {signers.map((s, i) => <li key={i} className="list-disc">{s.name} — {s.role}</li>)}
      </ul>
      <p className="text-[11px] text-brand-teal-deep/80">An eCIgn process has been scheduled to assign these signing tasks at the meeting’s end time.</p>
      <div className="mt-xs flex flex-wrap gap-sm">
        <Button
          onClick={onPrint}
          variant="primary"
          size="sm"
          iconLeft={<Printer className="h-4 w-4" />}
        >
          Print / Download packet
        </Button>
        <Button
          onClick={onReview}
          variant="secondary"
          size="sm"
          iconLeft={<CheckCircle2 className="h-4 w-4" />}
        >
          View completion status
        </Button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Admission packet — COMPUTED signer requirement panel.
   Required (Patient/Representative + Admitting Clinician) and conditional
   signers (witness, interpreter, HIPAA ROI §5, private-pay §8, telehealth/RPM
   §19, CMS official forms) are derived from the packet route + selected options.
   "Generate & schedule" stays disabled until everything is resolved.
   ════════════════════════════════════════════════════════════════ */

const PAYMENT_ROUTE_LABELS: Record<string, string> = {
  PRIVATE_PAY: 'Private Pay',
  LONG_TERM_CARE_INSURANCE: 'Long-Term Care Insurance',
  MEDICARE_ADVANTAGE_OR_PRIVATE_INSURANCE: 'Medicare Advantage / Private Insurance',
  ORIGINAL_MEDICARE_FFS: 'Original Medicare (FFS)',
  MEDI_CAL_OR_MEDICAID: 'Medi-Cal / Medicaid',
  VA_WORKERS_COMP_OR_OTHER_CONTRACT: "VA / Workers' Comp / Contract",
  PENDING_VERIFICATION: 'Pending Verification',
  NOT_APPLICABLE_NO_BILLABLE_SERVICES: 'N/A — No Billable Services',
};

const REP_AUTHORITIES: { id: RepresentativeAuthority; label: string }[] = [
  { id: 'POWER_OF_ATTORNEY', label: 'Power of Attorney' },
  { id: 'LEGAL_GUARDIAN', label: 'Legal Guardian' },
  { id: 'HEALTH_CARE_SURROGATE', label: 'Health Care Surrogate' },
  { id: 'AUTHORIZED_REPRESENTATIVE', label: 'Authorized Representative' },
];

type Tri = boolean | 'undecided';

function TriToggle({ value, onYes, onNo }: { value: Tri; onYes: () => void; onNo: () => void }) {
  return (
    <div className="flex gap-xs">
      {([['Yes', true, onYes], ['No', false, onNo]] as const).map(([label, v, fn]) => (
        <button
          key={label}
          type="button"
          onClick={fn}
          className={`rounded-full px-md py-xs text-xs font-medium transition ${value === v ? 'bg-brand-teal text-on-brand shadow-rest' : 'bg-surface-hover text-secondary hover:text-brand-teal'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function AdmissionSignerPanel({
  loadedId,
  note,
  scheduledForLabel,
  eventName,
  artifactId,
  onPrint,
}: {
  loadedId: string;
  note: PacketArtifactNote;
  scheduledForLabel: string;
  eventName: string;
  artifactId: string;
  onPrint: () => void;
}) {
  const paymentRoute = note.paymentRoute as PaymentRoute | undefined;
  const [signerType, setSignerType] = useState<'PATIENT' | 'REPRESENTATIVE'>(note.signerType ?? 'PATIENT');
  const [repAuthority, setRepAuthority] = useState<RepresentativeAuthority>('POWER_OF_ATTORNEY');
  const [repDocOnFile, setRepDocOnFile] = useState(false);
  const [interpreterUsed, setInterpreterUsed] = useState<Tri>('undecided');
  const [hipaaRoi, setHipaaRoi] = useState<Tri>('undecided');
  const [telehealth, setTelehealth] = useState<Tri>('undecided');
  const [witness, setWitness] = useState<Tri>('undecided');
  const [assignNames, setAssignNames] = useState<Partial<Record<SignerRoleId, string>>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [record, setRecord] = useState<PacketSignatureRecord | null>(() => {
    const existing = loadAll()[loadedId];
    return existing && existing.model === 'admission' ? existing : null;
  });
  const [view, setView] = useState<'schedule' | 'review'>(record ? 'review' : 'schedule');

  const assignments = useMemo(() => {
    const a: NonNullable<AdmissionSignerInput['assignments']> = {};
    (Object.keys(assignNames) as SignerRoleId[]).forEach((id) => {
      a[id] = { assigneeName: assignNames[id] };
    });
    return a;
  }, [assignNames]);

  const model = useMemo(
    () =>
      computeAdmissionSigners({
        templateId: ADMISSION_TEMPLATE_ID,
        paymentRoute,
        signerType,
        representativeAuthority: signerType === 'REPRESENTATIVE' ? repAuthority : 'PATIENT_SELF',
        representativeDocumentOnFile: repDocOnFile,
        interpreterUsed,
        hipaaRoiRequested: hipaaRoi,
        telehealthRpmEnrolled: telehealth,
        witnessRequired: witness,
        privatePayResponsiblePartyName: assignNames.PRIVATE_PAY_RESPONSIBLE_PARTY,
        assignments,
      }),
    [paymentRoute, signerType, repAuthority, repDocOnFile, interpreterUsed, hipaaRoi, telehealth, witness, assignNames, assignments],
  );

  const setName = (id: SignerRoleId, name: string) => setAssignNames((prev) => ({ ...prev, [id]: name }));

  const generate = () => {
    if (!model.canGenerate || !confirmed) return;
    setBusy(true);
    const generatedAt = new Date().toISOString();
    const allActive = [...model.required, ...model.conditional.filter((r) => r.decision === 'included' || (r.decisionLocked && r.required))];
    const excluded = model.conditional.filter((r) => !(r.decision === 'included' || (r.decisionLocked && r.required)));
    const packetHash = simpleHash(`${loadedId}|${paymentRoute ?? 'NO_ROUTE'}|${signerType}|${allActive.map((r) => `${r.id}:${r.assigneeName ?? ''}`).join('|')}`);
    const tasks = buildAdmissionSignerTasks(model, {
      packetId: loadedId,
      formInstanceId: loadedId,
      artifactId,
      packetHash,
      paymentRoute,
      renderedSectionIds: allActive.map((r) => r.formRef ?? r.id),
      suppressedSectionIds: excluded.map((r) => r.id),
      generatedAt,
    });
    const rec: PacketSignatureRecord = {
      eventId: loadedId.replace(/-\d+$/, ''),
      scheduledFor: scheduledForLabel,
      createdAt: generatedAt,
      model: 'admission',
      signers: tasks.map((t) => ({ role: t.role, name: t.assigneeName, status: 'scheduled' as const, tier: t.tier, separateWorkflow: t.separateWorkflow })),
      audit: { packetHash, paymentRoute, taskIds: tasks.map((t) => t.taskId), artifactId },
    };
    const all = loadAll();
    all[loadedId] = rec;
    saveAll(all);
    setRecord(rec);
    setView('review');
    setBusy(false);
  };

  const markSigned = (i: number) => {
    if (!record) return;
    const next = { ...record, signers: record.signers.map((s, j) => (j === i ? { ...s, status: 'signed' as const, signedAt: new Date().toISOString() } : s)) };
    const all = loadAll();
    all[loadedId] = next;
    saveAll(all);
    setRecord(next);
  };

  const signedCount = record?.signers.filter((s) => s.status === 'signed').length ?? 0;
  const total = record?.signers.length ?? 0;
  const routeLabel = paymentRoute ? PAYMENT_ROUTE_LABELS[paymentRoute] ?? paymentRoute : 'Not selected';

  return (
    <div className="grid gap-md">
      {record && (
        <div className="flex justify-start">
          <div className="flex rounded-lg border border-hairline bg-surface-glass backdrop-blur-md p-xs gap-xs">
            {(['schedule', 'review'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`px-lg py-sm text-xs font-heading font-medium uppercase tracking-wider rounded-md transition-all duration-fast ${
                  view === v ? 'bg-brand-teal text-on-brand shadow-rest' : 'text-brand-teal-deep hover:bg-surface-hover hover:text-brand-teal'
                }`}
              >
                {v === 'schedule' ? 'Signers & schedule' : 'Completion review'}
              </button>
            ))}
          </div>
        </div>
      )}

      {view === 'schedule' && (
        <>
          {/* Admission context + conditional triggers */}
          <div className="grid content-start gap-md rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest">
            <div className="flex items-center gap-sm">
              <ClipboardCheck className="h-icon-sm w-icon-sm text-brand-teal" />
              <h2 className="text-sm font-medium text-ink">Admission signer requirements · {routeLabel}</h2>
            </div>
            <div className="grid gap-md tablet:grid-cols-2">
              <label className="grid gap-xs text-xs text-secondary">
                Signer type
                <select
                  value={signerType}
                  onChange={(e) => setSignerType(e.target.value as 'PATIENT' | 'REPRESENTATIVE')}
                  className="rounded-md border border-card bg-white/70 px-md py-sm text-sm text-ink"
                >
                  <option value="PATIENT">Patient signs</option>
                  <option value="REPRESENTATIVE">Authorized representative signs</option>
                </select>
              </label>
              {signerType === 'REPRESENTATIVE' && (
                <label className="grid gap-xs text-xs text-secondary">
                  Representative authority
                  <select
                    value={repAuthority}
                    onChange={(e) => setRepAuthority(e.target.value as RepresentativeAuthority)}
                    className="rounded-md border border-card bg-white/70 px-md py-sm text-sm text-ink"
                  >
                    {REP_AUTHORITIES.map((a) => (
                      <option key={a.id} value={a.id}>{a.label}</option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            {signerType === 'REPRESENTATIVE' && (
              <label className="flex items-center gap-sm text-xs text-ink">
                <input type="checkbox" checked={repDocOnFile} onChange={(e) => setRepDocOnFile(e.target.checked)} className="h-4 w-4 accent-[var(--brand-teal,#00897B)]" />
                Documented representative authority is on file.
              </label>
            )}
            <div className="grid gap-sm tablet:grid-cols-2">
              {signerType === 'PATIENT' && (
                <div className="flex items-center justify-between gap-sm rounded-md bg-white/50 px-md py-sm text-xs text-secondary">
                  Witness required? <TriToggle value={witness} onYes={() => setWitness(true)} onNo={() => setWitness(false)} />
                </div>
              )}
              <div className="flex items-center justify-between gap-sm rounded-md bg-white/50 px-md py-sm text-xs text-secondary">
                Interpreter used? <TriToggle value={interpreterUsed} onYes={() => setInterpreterUsed(true)} onNo={() => setInterpreterUsed(false)} />
              </div>
              <div className="flex items-center justify-between gap-sm rounded-md bg-white/50 px-md py-sm text-xs text-secondary">
                HIPAA ROI requested (§5)? <TriToggle value={hipaaRoi} onYes={() => setHipaaRoi(true)} onNo={() => setHipaaRoi(false)} />
              </div>
              <div className="flex items-center justify-between gap-sm rounded-md bg-white/50 px-md py-sm text-xs text-secondary">
                Telehealth / RPM (§19)? <TriToggle value={telehealth} onYes={() => setTelehealth(true)} onNo={() => setTelehealth(false)} />
              </div>
            </div>
          </div>

          {/* Required signers */}
          <div className="grid content-start gap-sm rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest">
            <h2 className="text-sm font-medium text-ink">Required signers</h2>
            {model.required.map((r) => (
              <SignerRow key={r.id} role={r.role} reason={r.reason} badge="Required" badgeTone="teal" name={assignNames[r.id] ?? ''} onName={(v) => setName(r.id, v)} />
            ))}
          </div>

          {/* Conditional signers */}
          <div className="grid content-start gap-sm rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest">
            <h2 className="text-sm font-medium text-ink">Conditional signers</h2>
            {model.conditional.map((r) => {
              const active = r.decision === 'included' || (r.decisionLocked && r.required);
              const undecided = !r.decisionLocked && (!r.decision || r.decision === 'undecided');
              const badge = undecided ? 'Decision needed' : active ? 'Required' : 'Not required';
              const tone: 'teal' | 'orange' | 'slate' = undecided ? 'orange' : active ? 'teal' : 'slate';
              return (
                <SignerRow
                  key={r.id}
                  role={r.role}
                  reason={r.reason}
                  badge={badge}
                  badgeTone={tone}
                  separateWorkflow={r.separateWorkflow}
                  name={assignNames[r.id] ?? ''}
                  onName={active && !r.separateWorkflow ? (v) => setName(r.id, v) : undefined}
                />
              );
            })}
          </div>

          {/* Gating + generate */}
          <div className="grid content-start gap-md rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest">
            <div className="flex items-center gap-sm">
              <PenLine className="h-icon-sm w-icon-sm text-brand-teal" />
              <h2 className="text-sm font-medium text-ink">Schedule signing</h2>
            </div>
            {model.unresolved.length > 0 ? (
              <div className="grid gap-xs rounded-lg border border-tone-orange-border bg-tone-orange-bg px-md py-sm text-xs text-tone-orange-text">
                <span className="font-medium">Resolve before scheduling:</span>
                <ul className="grid gap-xs pl-md">
                  {model.unresolved.map((u) => (
                    <li key={u} className="list-disc">{u}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex items-center gap-xs rounded-lg border border-tone-teal-border bg-tone-teal-bg px-md py-sm text-xs text-brand-teal-deep">
                <CalendarClock className="h-4 w-4" />
                All required signers assigned and conditional decisions resolved. Tasks will be assigned after the meeting — {scheduledForLabel}.
              </div>
            )}
            <label className="flex items-start gap-sm text-sm text-ink">
              <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} disabled={!model.canGenerate} className="mt-0.5 h-4 w-4 accent-[var(--brand-teal,#00897B)]" />
              I confirm these signers will be assigned eCIgn tasks for this admission packet.
            </label>
            <Button
              onClick={generate}
              disabled={!model.canGenerate || !confirmed || busy}
              variant="primary"
              size="sm"
              iconLeft={busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />}
            >
              Generate &amp; schedule signature tasks
            </Button>
          </div>
        </>
      )}

      {view === 'review' && record && (
        <div className="grid gap-md rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest">
          <div className="flex flex-wrap items-center justify-between gap-sm">
            <div className="flex items-center gap-sm">
              <CheckCircle2 className="h-icon-sm w-icon-sm text-brand-teal" />
              <h2 className="text-sm font-medium text-ink">Signature completion · {eventName}</h2>
            </div>
            <span className={`rounded-full px-md py-xs text-xs font-medium ${signedCount === total ? 'bg-tone-teal-bg text-brand-teal-deep' : 'bg-tone-orange-bg text-tone-orange-text'}`}>
              {signedCount} of {total} signed{signedCount === total ? ' · complete' : ''}
            </span>
          </div>
          <RosterTable signers={record.signers} onMarkSigned={markSigned} />
          <div className="flex flex-wrap items-center justify-between gap-sm">
            <p className="text-[11px] text-muted">Tasks are bound to packet {loadedId}. Signing happens in eCIgn after the meeting; use “Mark signed” to record completion here.</p>
            <Button onClick={onPrint} variant="primary" size="sm" iconLeft={<Printer className="h-4 w-4" />}>
              Print / Download packet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SignerRow({
  role,
  reason,
  badge,
  badgeTone,
  separateWorkflow,
  name,
  onName,
}: {
  role: string;
  reason: string;
  badge: string;
  badgeTone: 'teal' | 'orange' | 'slate';
  separateWorkflow?: boolean;
  name: string;
  onName?: (v: string) => void;
}) {
  const toneClass =
    badgeTone === 'teal' ? 'bg-tone-teal-bg text-brand-teal-deep' : badgeTone === 'orange' ? 'bg-tone-orange-bg text-tone-orange-text' : 'bg-tone-slate-bg text-muted';
  return (
    <div className="grid gap-xs rounded-lg border border-hairline bg-white/50 p-md">
      <div className="flex flex-wrap items-center justify-between gap-sm">
        <span className="text-sm font-medium text-ink">{role}</span>
        <span className="flex items-center gap-xs">
          {separateWorkflow && <span className="rounded-full bg-tone-slate-bg px-sm py-xs text-[10px] font-medium uppercase tracking-tag text-muted">Separate workflow</span>}
          <span className={`rounded-full px-md py-xs text-[10px] font-medium uppercase tracking-tag ${toneClass}`}>{badge}</span>
        </span>
      </div>
      <p className="text-xs text-secondary">{reason}</p>
      {onName && (
        <input
          type="text"
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder="Assign signer name"
          className="rounded-md border border-card bg-white/80 px-md py-sm text-sm text-ink placeholder:text-muted"
        />
      )}
    </div>
  );
}

export default SignatureTracker;
