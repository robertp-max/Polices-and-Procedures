import { useEffect, useMemo, useState, type ComponentType, type SVGProps } from 'react';
import {
  AlertTriangle,
  Archive,
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Command,
  FileKey2,
  FileStack,
  Gauge,
  Gavel,
  Landmark,
  LockKeyhole,
  Menu,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GovernanceAcademyCatalog } from './GovernanceAcademyCatalog';
import {
  GovernanceApi,
  type GovernanceApiError,
  type GovernanceProjectionView,
  type MeetingSurfaceView,
} from './governanceApi';

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

interface OfficeNavItem {
  path: string;
  label: string;
  eyebrow: string;
  icon: Icon;
}

const NAV_ITEMS: OfficeNavItem[] = [
  { path: '/governance', label: 'Executive Brief', eyebrow: '01', icon: Landmark },
  { path: '/governance/my-work', label: 'My Work', eyebrow: '02', icon: ClipboardCheck },
  { path: '/governance/meetings', label: 'Meetings', eyebrow: '03', icon: UsersRound },
  { path: '/governance/board-books', label: 'Board Books', eyebrow: '04', icon: FileStack },
  { path: '/governance/decisions', label: 'Decision Docket', eyebrow: '05', icon: Gavel },
  { path: '/governance/qapi', label: 'QAPI', eyebrow: '06', icon: Gauge },
  { path: '/governance/oversight', label: 'Oversight', eyebrow: '07', icon: ShieldCheck },
  { path: '/governance/risk', label: 'Enterprise Risk', eyebrow: '08', icon: ShieldAlert },
  { path: '/governance/policies', label: 'Policies', eyebrow: '09', icon: BookOpen },
  { path: '/governance/academy', label: 'Governance Institute', eyebrow: '10', icon: Sparkles },
  { path: '/governance/records', label: 'Records', eyebrow: '11', icon: Archive },
  { path: '/governance/calendar', label: 'Calendar', eyebrow: '12', icon: CalendarDays },
];

const MEETING_SURFACES: Array<{ id: MeetingSurfaceView['surface']; label: string; description: string }> = [
  { id: 'notice', label: 'Notice', description: 'Versioned notice artifact and verified distribution.' },
  { id: 'agenda', label: 'Agenda', description: 'Published agenda, amendments, and authority basis.' },
  { id: 'board-book', label: 'Board book', description: 'Packet Studio artifacts and frozen hash manifest.' },
  { id: 'attendance', label: 'Attendance', description: 'Presence, appointment, term, and eligibility events.' },
  { id: 'conflicts', label: 'Conflicts', description: 'Disclosure, restriction, recusal, and access consequences.' },
  { id: 'session', label: 'Live session', description: 'Item-level quorum, motions, seconds, votes, and outcome.' },
  { id: 'minutes', label: 'Minutes', description: 'Event-derived record through eCIgn close and retention.' },
];

function isAbort(reason: unknown): boolean {
  return reason instanceof DOMException && reason.name === 'AbortError';
}

function formatDate(value: string | null): string {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid source date';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }).format(date);
}

function humanStatus(value: string): string {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function EmptyState({ title, body, icon: Icon = FileKey2 }: { title: string; body: string; icon?: Icon }) {
  return (
    <section className="gb-empty" role="status">
      <Icon aria-hidden="true" />
      <div><h3>{title}</h3><p>{body}</p></div>
    </section>
  );
}

function PageIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <header className="gb-page-intro">
      <p className="gb-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{body}</p>
    </header>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className="gb-metric"><p>{label}</p><strong>{value}</strong><span>{note}</span></article>;
}

function ExecutiveBrief({ office, navigate }: { office: GovernanceProjectionView; navigate: ReturnType<typeof useNavigate> }) {
  const nextMeeting = office.meetings.find((meeting) => meeting.status !== 'closed' && meeting.status !== 'superseded');
  const openDecisions = office.decisions.filter((decision) => !['approved', 'denied', 'withdrawn', 'superseded'].includes(decision.status));
  const dueActions = office.actions.filter((action) => !['closed', 'effectiveness_accepted'].includes(action.status));
  const lockedBooks = office.boardBooks.filter((book) => book.status === 'locked');
  return (
    <>
      <PageIntro eyebrow="Private Office · Decision intelligence" title="Govern with evidence, not inference." body="Authority, source, deliberation, action, and effectiveness remain separate, traceable records throughout the Board lifecycle." />
      {office.readinessBlockers.length > 0 && (
        <section className="gb-readiness" aria-labelledby="readiness-title">
          <AlertTriangle aria-hidden="true" />
          <div><p className="gb-eyebrow">Truthful readiness</p><h2 id="readiness-title">Official-record use remains blocked.</h2><ul>{office.readinessBlockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul></div>
        </section>
      )}
      <section className="gb-metrics" aria-label="Current governance records">
        <Metric label="Open decisions" value={String(openDecisions.length)} note="From the authority-filtered decision repository" />
        <Metric label="Actions awaiting Board closure" value={String(dueActions.length)} note="Management completion is not Board closure" />
        <Metric label="Locked Board books" value={String(lockedBooks.length)} note="Only verified frozen manifests count" />
        <Metric label="My active requirements" value={String(office.assignments.length)} note="Filtered to the authenticated Board member" />
      </section>
      <section className="gb-feature-grid">
        <article className="gb-feature gb-feature--hero">
          <p className="gb-eyebrow">Next convening</p>
          {nextMeeting ? (
            <><h2>{nextMeeting.title}</h2><p>{formatDate(nextMeeting.scheduledStart)} · {humanStatus(nextMeeting.status)}</p><button type="button" onClick={() => navigate(`/governance/meetings/${nextMeeting.id}`)}>Open meeting control <ChevronRight aria-hidden="true" /></button></>
          ) : <><h2>No authorized meeting is scheduled.</h2><p>A meeting appears here only after it exists in the governance repository.</p></>}
        </article>
        <article className="gb-feature">
          <p className="gb-eyebrow">Source posture</p>
          <h2>{humanStatus(office.sourcePosture)}</h2>
          <p>Generated {formatDate(office.generatedAt)}. Draft, synthetic, held, conflicted, and unavailable inputs cannot silently become live evidence.</p>
        </article>
        <article className="gb-feature">
          <p className="gb-eyebrow">Authority profile</p>
          <h2>{office.authorityProfile ? humanStatus(office.authorityProfile.approvalStatus) : 'Unavailable'}</h2>
          <p>{office.authorityProfile ? `Effective ${formatDate(office.authorityProfile.effectiveAt)} · Bylaw ${office.authorityProfile.sourceBylawVersion}` : 'No approved profile is connected; governance actions fail closed.'}</p>
        </article>
      </section>
    </>
  );
}

function MyWork({ office, navigate }: { office: GovernanceProjectionView; navigate: ReturnType<typeof useNavigate> }) {
  return (
    <>
      <PageIntro eyebrow="Authority-filtered queue" title="My Governing Body work" body="Only work bound to the authenticated member is shown. A technical application role does not confer Board authority." />
      {office.assignments.length === 0 ? <EmptyState title="No assigned Board work is available." body="This is an empty authoritative state, not a completed-work claim." /> : (
        <div className="gb-list">
          {office.assignments.map((item) => (
            <article key={`${item.type}:${item.id}`}>
              <span className="gb-status">{humanStatus(item.status)}</span><h3>{item.title}</h3><p>{item.dueAt ? `Due ${formatDate(item.dueAt)}` : 'No source deadline recorded'}</p>
              {item.type === 'academy' && <button type="button" onClick={() => navigate(`/governance/academy?assignment=${encodeURIComponent(item.id)}`)}>Open Institute <ChevronRight aria-hidden="true" /></button>}
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function Meetings({ office, navigate }: { office: GovernanceProjectionView; navigate: ReturnType<typeof useNavigate> }) {
  return (
    <>
      <PageIntro eyebrow="Corporate action" title="Meetings" body="Notice, agenda, Board book, attendance, conflicts, session events, and final minutes are distinct records—not tabs over one mutable demo object." />
      {office.meetings.length === 0 ? <EmptyState title="No meeting records are available." body="Create and authorize meetings through the protected API after bylaws and Board membership have been approved." icon={UsersRound} /> : (
        <div className="gb-list">
          {office.meetings.map((meeting) => (
            <article key={meeting.id}><span className="gb-status">{humanStatus(meeting.status)}</span><h3>{meeting.title}</h3><p>{formatDate(meeting.scheduledStart)} · Version {meeting.version}</p><button type="button" onClick={() => navigate(`/governance/meetings/${meeting.id}`)}>Open meeting <ChevronRight aria-hidden="true" /></button></article>
          ))}
        </div>
      )}
    </>
  );
}

function MeetingControl({ office, meetingId, navigate }: { office: GovernanceProjectionView; meetingId: string; navigate: ReturnType<typeof useNavigate> }) {
  const meeting = office.meetings.find((candidate) => candidate.id === meetingId);
  if (!meeting) return <><PageIntro eyebrow="Meeting control" title="Meeting unavailable" body="The requested meeting is not present in the authority-filtered projection." /><EmptyState title="Record not delivered." body="The record may not exist or the authenticated member may not have access." icon={LockKeyhole} /></>;
  return (
    <>
      <PageIntro eyebrow={`${meeting.meetingType} meeting · ${humanStatus(meeting.status)}`} title={meeting.title} body={`${formatDate(meeting.scheduledStart)} · ${meeting.timezone} · Record version ${meeting.version}`} />
      <section className="gb-workflow-grid" aria-label="Meeting workflow">
        {MEETING_SURFACES.map((surface, index) => (
          <button key={surface.id} type="button" onClick={() => navigate(`/governance/meetings/${meeting.id}/${surface.id}`)}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{surface.label}</strong><small>{surface.description}</small></div><ChevronRight aria-hidden="true" /></button>
        ))}
      </section>
    </>
  );
}

function MeetingSurface({ meetingId, surface }: { meetingId: string; surface: MeetingSurfaceView['surface'] }) {
  const [data, setData] = useState<MeetingSurfaceView | null>(null);
  const [error, setError] = useState<GovernanceApiError | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    GovernanceApi.meetingSurface(meetingId, surface, controller.signal).then(setData).catch((reason: GovernanceApiError) => { if (!isAbort(reason)) setError(reason); });
    return () => controller.abort();
  }, [meetingId, surface]);
  const definition = MEETING_SURFACES.find((candidate) => candidate.id === surface);
  return (
    <>
      <PageIntro eyebrow="Meeting evidence chain" title={definition?.label ?? 'Meeting surface'} body={definition?.description ?? 'Controlled meeting record.'} />
      {error ? <EmptyState title="Record delivery denied or unavailable." body={error.message} icon={LockKeyhole} /> : !data ? <EmptyState title="Delivering the authority-filtered record…" body="Successful delivery will create an access-audit event." /> : (
        <section className="gb-record-dossier"><div><p className="gb-eyebrow">Delivered record</p><h2>{data.meeting.title}</h2><p>{humanStatus(data.meeting.status)} · Version {data.meeting.version}</p></div><dl><div><dt>Surface</dt><dd>{humanStatus(data.surface)}</dd></div><div><dt>Delivered content hash</dt><dd><code>{data.deliveredContentSha256}</code></dd></div><div><dt>Related record</dt><dd>{data.related ? 'Delivered under the same authority boundary' : 'No related authoritative record exists yet'}</dd></div></dl></section>
      )}
    </>
  );
}

function BoardBooks({ office }: { office: GovernanceProjectionView }) {
  return <><PageIntro eyebrow="Packet Studio authority" title="Board books" body="A Board book becomes decision-ready only after every required artifact, version, source owner certification, access class, and content hash verifies and the manifest is frozen." />{office.boardBooks.length === 0 ? <EmptyState title="No Board-book records are available." body="No sample packet is substituted for an absent Packet Studio artifact." icon={FileStack} /> : <div className="gb-list">{office.boardBooks.map((book) => <article key={book.id}><span className="gb-status">{humanStatus(book.status)}</span><h3>Board book {book.id}</h3><p>{book.sectionIds.length} verified section records · {book.manifestId ? 'Manifest recorded' : 'Manifest not frozen'}</p><code>{book.manifestId ?? 'No manifest hash authority'}</code></article>)}</div>}</>;
}

function Decisions({ office }: { office: GovernanceProjectionView }) {
  return <><PageIntro eyebrow="Decision doctrine" title="Decision docket" body="A recommendation, trigger, discussion, motion, vote, consent, disposition, management task, and effectiveness decision remain separate events." />{office.decisions.length === 0 ? <EmptyState title="No decision records are available." body="This workspace will not manufacture a docket from prototype cards." icon={Gavel} /> : <div className="gb-list">{office.decisions.map((decision) => <article key={decision.id}><span className="gb-status">{humanStatus(decision.status)}</span><h3>{decision.title}</h3><p>{decision.question}</p><small>{humanStatus(decision.origin)} · {decision.sourceMetadataIds.length} source record(s) · {decision.conditions.length} condition(s)</small></article>)}</div>}</>;
}

function Qapi({ office }: { office: GovernanceProjectionView }) {
  return (
    <>
      <PageIntro eyebrow="Quality governance" title="QAPI oversight" body="Denominator, source lineage, finding, trigger, authorized decision, action, management certification, Board return, and effectiveness disposition are preserved as distinct evidence." />
      <section className="gb-readiness"><AlertTriangle aria-hidden="true" /><div><p className="gb-eyebrow">Q2 packet control</p><h2>The supplied Q2 packet is a blocked reference test case.</h2><p>It is marked draft, synthetic UAT, low-confidence, and not lockable. It cannot become live evidence or enter a frozen Board book without a separately registered production source and owner certification.</p></div></section>
      <section className="gb-metrics"><Metric label="Current source posture" value={humanStatus(office.sourcePosture)} note="Calculated from registered source metadata" /><Metric label="QAPI-linked decisions" value={String(office.decisions.filter((decision) => decision.sourceMetadataIds.length > 0).length)} note="No claim is made that every linked source is QAPI" /><Metric label="Actions with evidence" value={String(office.actions.filter((action) => action.evidenceArtifactIds.length > 0).length)} note="Evidence presence is not effectiveness" /></section>
    </>
  );
}

function StaticControlView({ type }: { type: 'oversight' | 'risk' | 'policies' | 'records' }) {
  const content = {
    oversight: ['Enterprise oversight', 'Cross-domain quality, finance, compliance, contracts, leadership, emergency, workforce, licensure, and survey matters are projections over canonical services.', 'No domain score is shown until its source adapter and access classification are live.'],
    risk: ['Enterprise risk', 'Material risks require an owner, appetite threshold, control evidence, residual-risk assessment, escalation, and tested recovery.', 'No heat-map colors are manufactured from static prototype data.'],
    policies: ['Policy governance', 'The Governing Body Office reuses the controlled policy corpus, lifecycle, attestations, and approvals. Reading, training, approval, implementation, and effectiveness remain different events.', 'Open the canonical policy library to work with the controlled document—not a duplicated Board copy.'],
    records: ['Official records', 'View, download, print, and share actions are authority-checked and written to per-delivery access records after successful delivery.', 'The record index remains unavailable until the audit outbox and production persistence adapters are configured.'],
  }[type];
  // The portal is sealed: no control here navigates back to the main application.
  return <><PageIntro eyebrow="Controlled projection" title={content[0]} body={content[1]} /><EmptyState title="No authoritative projection is connected." body={content[2]} icon={type === 'risk' ? ShieldAlert : type === 'policies' ? BookOpen : Archive} /></>;
}

function Calendar({ office }: { office: GovernanceProjectionView }) {
  const entries = [
    ...office.meetings.map((meeting) => ({ id: `meeting:${meeting.id}`, date: meeting.scheduledStart, type: 'Meeting', title: meeting.title, status: meeting.status })),
    ...office.actions.map((action) => ({ id: `action:${action.id}`, date: action.dueAt, type: 'Action return', title: action.title, status: action.status })),
    ...office.academyAssignments.map((assignment) => ({ id: `academy:${assignment.id}`, date: assignment.dueAt, type: 'Institute', title: assignment.moduleId, status: assignment.status })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  return <><PageIntro eyebrow="Separate governance calendar" title="Calendar" body="Dates are derived from meeting, action-return, and Institute records. CES workflow scheduling remains canonical and is not copied into a static calendar." />{entries.length === 0 ? <EmptyState title="No dated governance records are available." body="The calendar is empty because the authoritative repositories contain no deliverable events for this member." icon={CalendarDays} /> : <div className="gb-timeline">{entries.map((entry) => <article key={entry.id}><time dateTime={entry.date}>{formatDate(entry.date)}</time><div><span>{entry.type}</span><h3>{entry.title}</h3><p>{humanStatus(entry.status)}</p></div></article>)}</div>}</>;
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ type: string; id: string; title: string; status: string; route: string }>>([]);
  const [message, setMessage] = useState('Searches are keyed with HMAC-SHA-256 and are not stored in plaintext.');
  useEffect(() => {
    if (query.trim().length < 2) return undefined;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      GovernanceApi.search(query, controller.signal)
        .then((response) => { setResults(response.results); setMessage(response.results.length ? `${response.results.length} authorized result(s)` : 'No authorized records matched.'); })
        .catch((reason: GovernanceApiError) => { if (!isAbort(reason)) setMessage(reason.message); });
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query]);
  return (
    <div className="gb-palette-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="gb-palette" role="dialog" aria-modal="true" aria-labelledby="gb-command-title">
        <header><Command aria-hidden="true" /><h2 id="gb-command-title">Search authorized records</h2><button type="button" onClick={onClose} aria-label="Close search"><X aria-hidden="true" /></button></header>
        <label><Search aria-hidden="true" /><span className="sr-only">Search records</span><input autoFocus value={query} onChange={(event) => { const value = event.target.value; setQuery(value); if (value.trim().length < 2) { setResults([]); setMessage('Searches are keyed with HMAC-SHA-256 and are not stored in plaintext.'); } }} placeholder="Decision, meeting, action, source…" /></label>
        <p>{message}</p>
        <div className="gb-palette-results">{results.map((result) => <button key={`${result.type}:${result.id}`} type="button" onClick={() => { const target = result.route.startsWith('/governance') ? result.route : '/governance'; navigate(target); onClose(); }}><span>{result.type}</span><strong>{result.title}</strong><small>{humanStatus(result.status)}</small></button>)}</div>
      </section>
    </div>
  );
}

export function GovernanceOffice() {
  const { pathname } = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const [office, setOffice] = useState<GovernanceProjectionView | null>(null);
  const [error, setError] = useState<GovernanceApiError | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    GovernanceApi.office(controller.signal).then(setOffice).catch((reason: GovernanceApiError) => { if (!isAbort(reason)) setError(reason); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setPaletteOpen(true); }
      if (event.key === 'Escape') { setPaletteOpen(false); setMenuOpen(false); }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  const activePath = useMemo(() => NAV_ITEMS.find((item) => item.path === pathname)?.path
    ?? NAV_ITEMS.find((item) => item.path !== '/governance' && pathname.startsWith(`${item.path}/`))?.path
    ?? '/governance', [pathname]);

  if (error) {
    return <main className="gb-office gb-office--unavailable"><EmptyState title="The Governing Body Office is unavailable." body={error.message} icon={LockKeyhole} /></main>;
  }
  if (!office) return <main className="gb-office gb-office--unavailable"><p role="status">Establishing the authenticated Governing Body context…</p></main>;

  const meetingSurfaceMatch = pathname.match(/^\/governance\/meetings\/([^/]+)\/(notice|agenda|board-book|attendance|conflicts|session|minutes)\/?$/);
  const meetingId = meetingSurfaceMatch?.[1] ?? params.meetingId ?? '';
  const meetingSurface = meetingSurfaceMatch?.[2] as MeetingSurfaceView['surface'] | undefined;
  let content;
  if (meetingSurface && meetingId) content = <MeetingSurface meetingId={meetingId} surface={meetingSurface} />;
  else if (/^\/governance\/meetings\/[^/]+\/?$/.test(pathname)) content = <MeetingControl office={office} meetingId={meetingId} navigate={navigate} />;
  else if (pathname === '/governance/my-work') content = <MyWork office={office} navigate={navigate} />;
  else if (pathname === '/governance/meetings') content = <Meetings office={office} navigate={navigate} />;
  else if (pathname === '/governance/board-books') content = <BoardBooks office={office} />;
  else if (pathname === '/governance/decisions') content = <Decisions office={office} />;
  else if (pathname === '/governance/qapi') content = <Qapi office={office} />;
  else if (pathname === '/governance/oversight') content = <StaticControlView type="oversight" />;
  else if (pathname === '/governance/risk') content = <StaticControlView type="risk" />;
  else if (pathname === '/governance/policies') content = <StaticControlView type="policies" />;
  else if (pathname === '/governance/academy') content = <><PageIntro eyebrow="Governance Institute" title="Thirteen cases. Sixty-five scenes. One standard." body="Every attempt is bound to the appointed member, content version, controlled policy set, server-measured activity, server-owned answers, executable tasks, remediation rules, and sealed completion evidence." /><GovernanceAcademyCatalog assignments={office.academyAssignments} /></>;
  else if (pathname === '/governance/records') content = <StaticControlView type="records" />;
  else if (pathname === '/governance/calendar') content = <Calendar office={office} />;
  else content = <ExecutiveBrief office={office} navigate={navigate} />;

  return (
    <main className="gb-office">
      <aside className={`gb-office-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Governing Body Office">
        <div className="gb-office-brand">
          <img src="/logo-careindeed-orange.png" alt="Care Indeed" />
          <div><span>Governing Body</span><strong>Private Office</strong></div>
        </div>
        <nav>{NAV_ITEMS.map((item) => { const Icon = item.icon; return <button key={item.path} type="button" className={activePath === item.path ? 'is-active' : ''} onClick={() => { navigate(item.path); setMenuOpen(false); }}><span>{item.eyebrow}</span><Icon aria-hidden="true" />{item.label}</button>; })}</nav>
        <footer><LockKeyhole aria-hidden="true" /><p>Authority-filtered<br /><strong>{office.organizationId}</strong></p></footer>
      </aside>
      {menuOpen && <button type="button" className="gb-nav-scrim" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
      <div className="gb-office-main">
        <header className="gb-topbar">
          <button type="button" className="gb-menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Open Governing Body navigation" aria-expanded={menuOpen}><Menu aria-hidden="true" /></button>
          <button type="button" className="gb-search-button" onClick={() => setPaletteOpen(true)}><Search aria-hidden="true" /><span>Search records</span><kbd>⌘ K</kbd></button>
          <div className={`gb-live-badge gb-live-badge--${office.sourcePosture}`}><span />{humanStatus(office.sourcePosture)}</div>
        </header>
        <section className="gb-office-content">{content}</section>
      </div>
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
    </main>
  );
}
