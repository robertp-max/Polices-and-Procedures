import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  FileCheck2,
  FileSearch,
  Files,
  Gavel,
  Landmark,
  LockKeyhole,
  Menu,
  NotebookPen,
  PanelLeftClose,
  RotateCcw,
  Scale,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  X,
  XCircle,
} from 'lucide-react';
import type { CaseEvidence, ExecutiveCaseModule } from './academyTypes';
import { challengeOrder } from './challengeOrder';
import { ActiveTimeCard, formatActiveTime, useActiveLearningClock } from './ActiveLearningClock';
import LearningChapter, { LEARNING_PANEL_IDS } from './LearningChapter';

// QA bypasses are available only to a Vite test build. A production build can
// never enable them through a public environment variable or browser state.
const QA_MODE = import.meta.env.MODE === 'test';

const CHAPTERS = [
  { id: 0, eyebrow: 'Brief', title: 'The decisive duty', icon: Landmark },
  { id: 1, eyebrow: 'Learn', title: 'Rule + worked example', icon: Scale },
  { id: 2, eyebrow: 'Evidence', title: 'Interrogate the record', icon: Files },
  { id: 3, eyebrow: 'Decide', title: 'Classify and direct', icon: Gavel },
  { id: 4, eyebrow: 'Record', title: 'Create the directive', icon: FileCheck2 },
  { id: 5, eyebrow: 'Defend', title: 'Face the surveyor', icon: ShieldAlert },
];

type Progress = {
  chapter: number;
  learningPanels: string[];
  inspected: string[];
  selectedEvidence: string[];
  selectedFindings: string[];
  decision: string;
  clauses: string[];
  defense: Record<string, number>;
  submitted: boolean;
  transfer: number | null;
};

const EMPTY: Progress = {
  chapter: 0,
  learningPanels: [],
  inspected: [],
  selectedEvidence: [],
  selectedFindings: [],
  decision: '',
  clauses: [],
  defense: {},
  submitted: false,
  transfer: null,
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function ExecutiveModuleView({ module, onExit }: { module: ExecutiveCaseModule; onExit: () => void }) {
  const storageKey = `care-indeed:${module.id.toLowerCase()}:academy:v3`;
  const [progress, setProgress] = useState<Progress>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [activeEvidence, setActiveEvidence] = useState<CaseEvidence | null>(null);
  const [railOpen, setRailOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [gateNotice, setGateNotice] = useState('');
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const clock = useActiveLearningClock({ storageKey: `${storageKey}:active-time`, chapter: progress.chapter, capstone: module.id === 'GB-CAPSTONE' });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) setProgress({ ...EMPTY, ...JSON.parse(raw) });
        setNotes(localStorage.getItem(`${storageKey}:notes`) || '');
      } catch { /* Keep a clean local attempt if storage is unavailable. */ }
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [storageKey]);

  useEffect(() => { if (hydrated) localStorage.setItem(storageKey, JSON.stringify(progress)); }, [hydrated, progress, storageKey]);
  useEffect(() => { if (hydrated) localStorage.setItem(`${storageKey}:notes`, notes); }, [hydrated, notes, storageKey]);
  useEffect(() => {
    if (!activeEvidence && !notesOpen && !railOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const container = document.querySelector<HTMLElement>(activeEvidence || notesOpen ? '.modal-layer [role="dialog"]' : '.chapter-rail.is-open');
        const focusable = container ? Array.from(container.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')) : [];
        if (focusable.length > 0) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
        return;
      }
      if (event.key !== 'Escape') return;
      if (activeEvidence) setActiveEvidence(null);
      else if (notesOpen) setNotesOpen(false);
      else setRailOpen(false);
      window.setTimeout(() => returnFocusRef.current?.focus(), 0);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activeEvidence, notesOpen, railOpen]);

  const scores = useMemo(() => {
    const essential = module.evidence.filter((item) => item.essential).map((item) => item.id);
    const evidenceHits = essential.filter((id) => progress.selectedEvidence.includes(id)).length;
    const irrelevant = progress.selectedEvidence.filter((id) => module.evidence.find((item) => item.id === id)?.relevant === false).length;
    const evidence = Math.max(0, Math.round((evidenceHits / essential.length) * 20) - irrelevant * 3);

    const correctFindings = module.findings.filter((item) => item.correct);
    const findingHits = correctFindings.filter((item) => progress.selectedFindings.includes(item.id)).length;
    const wrongFindings = module.findings.filter((item) => !item.correct && progress.selectedFindings.includes(item.id)).length;
    const analysis = Math.max(0, Math.round((findingHits / correctFindings.length) * 20) - wrongFindings * 4);

    const selectedDecision = module.decisions.find((item) => item.id === progress.decision);
    const decision = selectedDecision?.correct ? 25 : selectedDecision?.critical ? 0 : progress.decision ? 8 : 0;

    const correctClauses = module.clauses.filter((item) => item.correct);
    const clauseHits = correctClauses.filter((item) => progress.clauses.includes(item.id)).length;
    const wrongClauses = module.clauses.filter((item) => !item.correct && progress.clauses.includes(item.id)).length;
    const record = Math.max(0, Math.round((clauseHits / correctClauses.length) * 20) - wrongClauses * 5);

    const defenseHits = module.defense.filter((item) => progress.defense[item.id] === item.correct).length;
    const defense = Math.round((defenseHits / module.defense.length) * 15);
    const criticalErrors: string[] = [];
    const diagnostics: Diagnostic[] = [];
    module.evidence
      .filter((item) => item.essential && !progress.selectedEvidence.includes(item.id))
      .forEach((item) => {
        criticalErrors.push(`Omitted indispensable evidence: ${item.title}.`);
        diagnostics.push({ stage: 'Evidence', issue: `The decision chain omitted “${item.title}.”`, repair: 'Reopen the artifact, identify the fact it alone supplies, and connect that fact to a specific finding before choosing a disposition.' });
      });
    module.evidence
      .filter((item) => item.relevant === false && progress.selectedEvidence.includes(item.id))
      .forEach((item) => diagnostics.push({ stage: 'Evidence precision', issue: `“${item.title}” was treated as decision evidence.`, repair: 'State the exact inference the artifact supports. If it supplies context but cannot prove the decisive duty, remove it from the minimum sufficient chain.' }));
    if (selectedDecision?.critical) criticalErrors.push(`Selected a critical disposition: ${selectedDecision.title}.`);
    module.findings
      .filter((item) => item.correct && !progress.selectedFindings.includes(item.id))
      .forEach((item) => {
        if (item.critical) criticalErrors.push(`Missed a critical finding: ${item.statement}`);
        diagnostics.push({ stage: 'Classification', issue: `A supported finding was missed: ${item.statement}`, repair: 'Trace the statement back to the time-specific source fact, then classify authority and risk separately from the desired outcome.' });
      });
    module.findings
      .filter((item) => !item.correct && progress.selectedFindings.includes(item.id))
      .forEach((item) => diagnostics.push({ stage: 'Classification precision', issue: `An unsupported inference was elevated to a finding: ${item.statement}`, repair: 'Identify the missing premise or overreach. Narrow the conclusion to what the supplied record actually establishes.' }));
    if (selectedDecision && !selectedDecision.correct) diagnostics.push({ stage: 'Disposition', issue: `The selected direction—“${selectedDecision.title}”—was not the narrowest complete response.`, repair: module.remediation.repair });
    module.clauses
      .filter((item) => item.correct && !progress.clauses.includes(item.id))
      .forEach((item) => diagnostics.push({ stage: 'Official record', issue: `The directive omitted: ${item.text}`, repair: 'Add the missing control without rewriting history, then verify that an owner, trigger, return point, or effectiveness test is preserved where applicable.' }));
    module.clauses
      .filter((item) => !item.correct && progress.clauses.includes(item.id))
      .forEach((item) => {
        if (item.critical) criticalErrors.push(`Preserved a critical record defect: ${item.text}`);
        diagnostics.push({ stage: 'Record integrity', issue: `The directive included: ${item.text}`, repair: 'Remove language that overstates authority, certainty, or historical facts; replace it with a prospective, attributable, and verifiable action.' });
      });
    module.defense
      .filter((item) => progress.defense[item.id] !== item.correct)
      .forEach((item) => diagnostics.push({ stage: 'Surveyor defense', issue: `The response did not survive: “${item.prompt}”`, repair: 'Rebuild the answer from the decisive duty and the minimum sufficient evidence chain, then state the limitation or unresolved fact explicitly.' }));
    return { evidence, analysis, decision, record, defense, total: evidence + analysis + decision + record + defense, criticalErrors, diagnostics };
  }, [module, progress]);

  const scoreEligible = progress.submitted && clock.minimumMet && scores.total >= 92 && scores.criticalErrors.length === 0;
  const passed = scoreEligible && progress.transfer === module.transfer.correct;
  const update = (next: Partial<Progress>) => setProgress((current) => ({ ...current, ...next }));
  const toggle = (key: 'selectedEvidence' | 'selectedFindings' | 'clauses', id: string) => setProgress((current) => {
    if (!QA_MODE && current.submitted) return current;
    const values = current[key] as string[];
    return { ...current, [key]: values.includes(id) ? values.filter((item) => item !== id) : [...values, id] };
  });
  const taskBlocker = (stage: number) => {
    if (stage === 1 && !LEARNING_PANEL_IDS.every((id) => progress.learningPanels.includes(id))) return `review all ${LEARNING_PANEL_IDS.length} guided learning sections`;
    if (stage === 2 && progress.inspected.length !== module.evidence.length) return `inspect all ${module.evidence.length} evidence artifacts`;
    if (stage === 2 && progress.selectedEvidence.length === 0) return 'select the minimum sufficient evidence set';
    if (stage === 3 && progress.selectedFindings.length === 0) return 'classify at least one supported finding';
    if (stage === 3 && !progress.decision) return 'choose one governing disposition';
    if (stage === 4 && progress.clauses.length !== 5) return 'select exactly five clauses for the official record';
    if (stage === 5 && Object.keys(progress.defense).length !== module.defense.length) return `answer all ${module.defense.length} surveyor defenses`;
    return '';
  };
  // Required interactions unlock navigation. Active time is enforced only at
  // final completion so learners are never stranded after finishing a stage.
  const stageBlocker = (stage: number) => QA_MODE ? '' : taskBlocker(stage);
  const chapterAccessible = (chapter: number) => QA_MODE
    || chapter <= progress.chapter
    || (chapter === progress.chapter + 1 && !taskBlocker(progress.chapter));
  const showGate = (message: string) => {
    setGateNotice(message);
    setRailOpen(false);
  };
  const go = (chapter: number) => {
    if (!chapterAccessible(chapter)) {
      const blocker = taskBlocker(progress.chapter);
      showGate(blocker ? `Complete the current chapter first: ${blocker}.` : 'Complete the current chapter before continuing.');
      return;
    }
    update({ chapter });
    setGateNotice('');
    setRailOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => mainRef.current?.focus(), 0);
  };
  const rememberFocus = () => { returnFocusRef.current = document.activeElement as HTMLElement | null; };
  const openRail = () => { rememberFocus(); setRailOpen(true); };
  const closeRail = () => { setRailOpen(false); window.setTimeout(() => returnFocusRef.current?.focus(), 0); };
  const openNotes = () => { rememberFocus(); setNotesOpen(true); };
  const closeNotes = () => { setNotesOpen(false); window.setTimeout(() => returnFocusRef.current?.focus(), 0); };
  const inspect = (item: CaseEvidence) => {
    rememberFocus();
    setActiveEvidence(item);
    if (!progress.inspected.includes(item.id)) update({ inspected: [...progress.inspected, item.id] });
  };
  const reset = () => {
    if (!window.confirm(`Reset the ${module.id} attempt and remove saved progress?`)) return;
    setProgress(EMPTY);
    setNotes('');
    setGateNotice('');
    clock.reset();
  };
  const submitAttempt = () => {
    if (QA_MODE) { update({ submitted: true }); return; }
    const blocker = stageBlocker(5);
    if (blocker) { showGate(`Defense is not ready to lock: ${blocker}.`); return; }
    if (!clock.minimumMet) { showGate(`${formatActiveTime(clock.totalRemaining)} of required active mastery time remains.`); return; }
    update({ submitted: true });
  };

  return (
    <div className="app-shell" data-role-theme="gb">
      <header className="command-bar">
        <div className="brand-lockup">
          <button className="icon-button mobile-only" onClick={openRail} aria-label="Open chapter navigation"><Menu size={19} /></button>
          <button className="icon-button academy-back" onClick={onExit} aria-label="Return to academy"><ArrowLeft size={17} /></button>
          <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>
          <div><div className="brand-name">CARE INDEED</div><div className="brand-product">Governing Body Academy</div></div>
        </div>
        <div className="module-lockup"><span>{module.id}</span><strong>{module.title}</strong></div>
        <div className="command-actions">
          <div className="save-state"><CheckCircle2 size={15} /> Required Governing Body compliance · official evidence on pass</div>
          <button className="quiet-button" onClick={openNotes}><NotebookPen size={16} /> Notebook</button>
          <button className="icon-button mobile-notebook" onClick={openNotes} aria-label="Open board notebook"><NotebookPen size={17} /></button>
          <button className="icon-button" onClick={reset} aria-label="Reset attempt"><RotateCcw size={17} /></button>
        </div>
      </header>

      <div className="workspace">
        <aside className={cx('chapter-rail', railOpen && 'is-open')} aria-label="Module chapters">
          <div className="rail-mobile-head"><span>Module chapters</span><button className="icon-button" onClick={closeRail} aria-label="Close navigation" autoFocus={railOpen}><PanelLeftClose size={18} /></button></div>
          <div className="rail-progress"><span>EXECUTIVE LAB</span><strong>{progress.chapter + 1}<small>/ {CHAPTERS.length}</small></strong><div className="progress-track" role="progressbar" aria-label="Module progress" aria-valuemin={1} aria-valuemax={CHAPTERS.length} aria-valuenow={progress.chapter + 1}><i style={{ width: `${((progress.chapter + 1) / CHAPTERS.length) * 100}%` }} /></div></div>
          <nav>{CHAPTERS.map((chapter) => {
            const Icon = chapter.icon;
            const active = chapter.id === progress.chapter;
            const complete = clock.stageComplete(chapter.id) && !taskBlocker(chapter.id);
            const accessible = chapterAccessible(chapter.id);
            return <button key={chapter.id} className={cx('rail-link', active && 'active', !accessible && 'locked')} onClick={() => go(chapter.id)} aria-current={active ? 'step' : undefined} aria-label={`${chapter.eyebrow}: ${chapter.title}${accessible ? '' : ' · locked'}`}><span className="rail-icon">{complete ? <Check size={15} /> : !accessible ? <LockKeyhole size={14} /> : <Icon size={16} />}</span><span><small>{chapter.eyebrow}</small>{chapter.title}</span>{active && <ChevronRight size={15} />}</button>;
          })}</nav>
          <ActiveTimeCard clock={clock} chapter={progress.chapter} />
          <div className="rail-source-lock"><LockKeyhole size={17} /><div><strong>{module.postureLabel}</strong><span>{module.posture === 'verified' ? 'Validated source set' : 'Required Governing Body compliance · official evidence on pass'}</span></div></div>
        </aside>
        {railOpen && <button className="scrim" onClick={closeRail} aria-label="Close navigation" />}

        <main className="main-canvas" ref={mainRef} tabIndex={-1} aria-live="polite">
          {progress.chapter === 0 && <ModuleBrief module={module} onBegin={() => go(1)} />}
          {progress.chapter === 1 && <Doctrine module={module} visited={progress.learningPanels} onVisit={(id) => setProgress((current) => current.learningPanels.includes(id) ? current : { ...current, learningPanels: [...current.learningPanels, id] })} onContinue={() => go(2)} />}
          {progress.chapter === 2 && <EvidenceDesk module={module} progress={progress} onInspect={inspect} onToggle={(id) => toggle('selectedEvidence', id)} onContinue={() => go(3)} />}
          {progress.chapter === 3 && <DecisionLab module={module} progress={progress} onToggle={(id) => toggle('selectedFindings', id)} onDecision={(id) => { if (QA_MODE || !progress.submitted) update({ decision: id }); }} onContinue={() => go(4)} />}
          {progress.chapter === 4 && <RecordLab module={module} selected={progress.clauses} locked={!QA_MODE && progress.submitted} onToggle={(id) => toggle('clauses', id)} onContinue={() => go(5)} />}
          {progress.chapter === 5 && <DefenseLab module={module} progress={progress} scores={scores} scoreEligible={scoreEligible} passed={passed} onAnswer={(id, value) => { if (QA_MODE || !progress.submitted) update({ defense: { ...progress.defense, [id]: value } }); }} onSubmit={submitAttempt} onTransfer={(value) => setProgress((current) => QA_MODE || current.transfer === null ? { ...current, transfer: value } : current)} onReturn={() => go(2)} onReset={reset} />}
        </main>
      </div>

      {gateNotice && <section className="mastery-gate-notice" role="status"><LockKeyhole size={18} /><div><strong>Mastery gate</strong><p>{gateNotice}</p><small>Time counts only while this tab is visible, focused, and active.</small></div><button onClick={() => setGateNotice('')} aria-label="Dismiss mastery gate"><X size={16} /></button></section>}

      {activeEvidence && <EvidenceDrawer item={activeEvidence} selected={progress.selectedEvidence.includes(activeEvidence.id)} locked={!QA_MODE && progress.submitted} onClose={() => { setActiveEvidence(null); window.setTimeout(() => returnFocusRef.current?.focus(), 0); }} onToggle={() => toggle('selectedEvidence', activeEvidence.id)} />}
      {notesOpen && <div className="modal-layer" role="presentation"><button className="modal-scrim" onClick={closeNotes} aria-label="Close notebook" /><section className="notebook" role="dialog" aria-modal="true" aria-labelledby="module-notebook-title"><div className="drawer-head"><div><span>PRIVATE WORKSPACE</span><h2 id="module-notebook-title">Board notebook</h2></div><button className="icon-button" onClick={closeNotes} aria-label="Close notebook"><X size={19} /></button></div><p>Your notes stay in this browser training environment and are not part of the official record.</p><textarea aria-label="Private board notebook notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Capture evidence conflicts, unresolved duties, and the rationale you need to defend..." autoFocus /><div className="notebook-foot"><span>{notes.length} characters</span><button className="primary-button" onClick={closeNotes}>Save notebook</button></div></section></div>}
    </div>
  );
}

function ModuleBrief({ module, onBegin }: { module: ExecutiveCaseModule; onBegin: () => void }) {
  return <div className="page page-brief"><div className="page-kicker"><Sparkles size={15} /> Executive decision laboratory</div><section className="hero-grid"><div className="hero-copy"><span className="chapter-code">{module.id.replace('-', '—')} / {module.domain}</span><h1>{module.caseTitle.split(' ').slice(0, 2).join(' ')} <em>{module.caseTitle.split(' ').slice(2).join(' ')}</em></h1><p className="hero-lede">{module.caseContext}</p><div className="hero-actions"><button className="primary-button large" onClick={onBegin}>Enter the briefing <ArrowRight size={17} /></button><span>{module.duration} · {module.id === 'GB-CAPSTONE' ? '30' : '20'} min active minimum · autosaves</span></div></div><div><article className="briefing-cover"><div className="cover-top"><span>DECISION RECORD</span><div className="cover-seal"><Landmark size={20} /></div></div><div className="cover-main"><small>GOVERNING BODY</small><strong>{module.shortTitle}</strong><p>{module.caseDate}</p></div><div className="cover-bottom"><span>{module.evidence.length} artifacts</span><span>{module.findings.length} findings</span><span>1 official record</span></div></article></div></section><section className="brief-stats"><article><Target size={20} /><div><strong>92%</strong><span>Pass threshold</span></div><p>No critical error may survive.</p></article><article><FileSearch size={20} /><div><strong>{module.evidence.length}</strong><span>Evidence artifacts</span></div><p>Some prove. Some distract.</p></article><article><ShieldAlert size={20} /><div><strong>{module.defense.length}</strong><span>Surveyor defenses</span></div><p>Every answer needs a chain.</p></article></section><div className="source-banner"><div><LockKeyhole size={17} /> Training source posture</div><p>{module.posture === 'gated' ? 'This lab is available for design and reasoning validation; certification remains gated pending controlled-policy reconciliation.' : 'Federal anchors and public checklist identifiers are used where verified. Agency-policy scoring remains provisional until controlled-source validation.'}</p></div></div>;
}

function Doctrine({ module, visited, onVisit, onContinue }: { module: ExecutiveCaseModule; visited: string[]; onVisit: (id: string) => void; onContinue: () => void }) {
  return <LearningChapter moduleId={module.id} domain={module.domain} title={module.title} caseContext={module.caseContext} decisiveDuty={module.decisiveDuty} doctrine={module.doctrine} remediation={module.remediation} sources={[...module.sources, ...module.achc]} visited={visited} onVisit={onVisit} onContinue={onContinue} />;
}

function EvidenceDesk({ module, progress, onInspect, onToggle, onContinue }: { module: ExecutiveCaseModule; progress: Progress; onInspect: (item: CaseEvidence) => void; onToggle: (id: string) => void; onContinue: () => void }) {
  const orderedEvidence = challengeOrder(module.evidence, `${module.id}:evidence`, (item) => item.id);
  const inspectionComplete = progress.inspected.length === module.evidence.length;
  const canContinue = inspectionComplete && progress.selectedEvidence.length > 0;
  const hint = !inspectionComplete ? `Inspect ${module.evidence.length - progress.inspected.length} remaining artifact${module.evidence.length - progress.inspected.length === 1 ? '' : 's'}` : progress.selectedEvidence.length === 0 ? 'Select at least one artifact' : undefined;
  return <div className="page"><div className="case-banner"><div><span>LIVE BOARD PACKET</span><h2>{module.caseTitle}</h2><p>{module.caseDate}</p></div><div className="case-meter"><strong>{progress.inspected.length}/{module.evidence.length}</strong><span>INSPECTED</span></div></div><div className="evidence-toolbar"><div><Search size={17} /><span>Inspect broadly. Select only evidence that belongs in your decision chain.</span></div><div className="selected-count">{progress.selectedEvidence.length} selected</div></div><section className="evidence-grid">{orderedEvidence.map(({ value: item }) => <article key={item.id} className={cx('evidence-card', progress.selectedEvidence.includes(item.id) && 'selected')}><div className="evidence-card-top"><span className={cx('evidence-status', item.status)}>{item.status}</span>{progress.inspected.includes(item.id) && <span className="inspected"><Check size={12} /> INSPECTED</span>}</div><div className="evidence-icon"><FileSearch size={19} /></div><small>{item.code} · {item.kind}</small><h3>{item.title}</h3><p>{item.summary}</p><div className="evidence-actions"><button onClick={() => onInspect(item)}>Inspect <ArrowRight size={13} /></button><label className="select-control"><input type="checkbox" checked={progress.selectedEvidence.includes(item.id)} disabled={!QA_MODE && progress.submitted} onChange={() => onToggle(item.id)} /><span><Check size={12} /></span>Use</label></div></article>)}</section><div className="coach-note"><CircleHelp size={18} /><p><strong>Selection discipline is scored.</strong> Every artifact must be inspected; selecting context that cannot support the decisive inference weakens the chain.</p></div><PageFooter previous="Control model" next="Classify the record" onNext={onContinue} disabled={!canContinue} hint={hint} /></div>;
}

function DecisionLab({ module, progress, onToggle, onDecision, onContinue }: { module: ExecutiveCaseModule; progress: Progress; onToggle: (id: string) => void; onDecision: (id: string) => void; onContinue: () => void }) {
  const orderedFindings = challengeOrder(module.findings, `${module.id}:findings`, (item) => item.id);
  const orderedDecisions = challengeOrder(module.decisions, `${module.id}:decisions`, (item) => item.id);
  return <div className="page"><PageHead eyebrow="CLASSIFY + DIRECT" title="Separate supported defects from plausible noise." lede="Select every finding supported by the supplied record, then choose the narrowest complete disposition." /><section className="decision-section"><div className="section-label"><span>01</span><div><h2>Classify the record</h2><p>Unsupported concerns reduce the analysis score.</p></div></div><div className="defect-list">{orderedFindings.map(({ value: item }) => <label key={item.id} className={cx('defect-row', progress.selectedFindings.includes(item.id) && 'selected')}><input type="checkbox" checked={progress.selectedFindings.includes(item.id)} disabled={progress.submitted} onChange={() => onToggle(item.id)} /><span className="box"><Check size={13} /></span><span className="defect-type">{item.type}</span><p>{item.statement}</p></label>)}</div></section><section className="decision-section"><div className="section-label"><span>02</span><div><h2>Direct the enterprise</h2><p>Choose one disposition. Broadness is not the same as strength.</p></div></div><div className="decision-grid">{orderedDecisions.map(({ value: item }, index) => <label key={item.id} className={cx('decision-card', progress.decision === item.id && 'selected')}><input type="radio" name={`${module.id}-decision`} checked={progress.decision === item.id} disabled={progress.submitted} onChange={() => onDecision(item.id)} /><span className="risk-pill">Disposition {String.fromCharCode(65 + index)}</span><h3>{item.title}</h3><p>{item.body}</p><span className="radio">{progress.decision === item.id && <i />}</span></label>)}</div></section><PageFooter previous="Evidence room" next="Draft the directive" onNext={onContinue} disabled={!progress.decision} hint={!progress.decision ? 'Choose a disposition' : undefined} /></div>;
}

function RecordLab({ module, selected, locked, onToggle, onContinue }: { module: ExecutiveCaseModule; selected: string[]; locked: boolean; onToggle: (id: string) => void; onContinue: () => void }) {
  const requiredClauseCount = 5;
  const orderedClauses = challengeOrder(module.clauses, `${module.id}:clauses`, (item) => item.id);
  return <div className="page"><PageHead eyebrow="OFFICIAL RECORD" title="Draft the action that future evidence can defend." lede={module.recordPrompt} /><div className="minutes-workbench"><section className="paper-sheet"><div className="paper-head"><div><span>{module.id} / GOVERNING BODY</span><h2>Executive directive</h2></div><div><small>CONTROLLED DRAFT</small><strong>{module.caseDate}</strong></div></div><div className="paper-rule" /><p className="minutes-prompt">Select exactly five clauses you would preserve in the official record.</p><div className="clause-list">{orderedClauses.map(({ value: item }, index) => <label key={item.id} className={cx('clause', selected.includes(item.id) && 'selected')}><input type="checkbox" checked={selected.includes(item.id)} disabled={locked} onChange={() => onToggle(item.id)} /><span>{String(index + 1).padStart(2, '0')}</span><p>{item.text}</p><i>{selected.includes(item.id) && <Check size={13} />}</i></label>)}</div><div className="paper-signoff"><span>TRAINING RECORD · NOT AN APPROVAL</span><span>{selected.length} of {requiredClauseCount} clauses selected</span></div></section><aside className="minutes-aside"><BookOpenCheck size={20} /><span>RECORD RULE</span><h3>Accuracy before elegance.</h3><p>The record must preserve what happened, what the Board decided, why, who owns the response, and how effectiveness will be judged.</p><div><strong>Do not</strong><small>backdate · sanitize · invent consensus · conceal uncertainty</small></div></aside></div><PageFooter previous="Decision lab" next="Face the surveyor" onNext={onContinue} disabled={selected.length !== requiredClauseCount} hint={selected.length !== requiredClauseCount ? 'Select exactly five clauses' : undefined} /></div>;
}

type Diagnostic = { stage: string; issue: string; repair: string };
type ScoreSet = { evidence: number; analysis: number; decision: number; record: number; defense: number; total: number; criticalErrors: string[]; diagnostics: Diagnostic[] };

function DefenseLab({ module, progress, scores, scoreEligible, passed, onAnswer, onSubmit, onTransfer, onReturn, onReset }: { module: ExecutiveCaseModule; progress: Progress; scores: ScoreSet; scoreEligible: boolean; passed: boolean; onAnswer: (id: string, value: number) => void; onSubmit: () => void; onTransfer: (value: number) => void; onReturn: () => void; onReset: () => void }) {
  if (progress.submitted) return <Results module={module} scores={scores} scoreEligible={scoreEligible} passed={passed} transfer={progress.transfer} onTransfer={onTransfer} onReturn={onReturn} onReset={onReset} />;
  const orderedQuestions = challengeOrder(module.defense, `${module.id}:defense-questions`, (item) => item.id);
  return <div className="page"><PageHead eyebrow="SURVEYOR DEFENSE" title="Every answer must survive the next question." lede="Answer from the evidence and control model—not from memory, confidence, or the desired outcome." /><div className="surveyor-stack">{orderedQuestions.map(({ value: question }, qIndex) => { const orderedAnswers = challengeOrder(question.answers, `${module.id}:${question.id}:answers`, (answer) => answer); return <section className="surveyor-card" key={question.id}><span>QUESTION {String(qIndex + 1).padStart(2, '0')}</span><h3>{question.prompt}</h3>{orderedAnswers.map(({ value: answer, originalIndex }, displayIndex) => <label key={answer} className={cx('answer-row', progress.defense[question.id] === originalIndex && 'selected')}><input type="radio" name={question.id} checked={progress.defense[question.id] === originalIndex} onChange={() => onAnswer(question.id, originalIndex)} /><i>{String.fromCharCode(65 + displayIndex)}</i><p>{answer}</p></label>)}</section>; })}</div><div className="lock-attempt"><div><LockKeyhole size={18} /><p><strong>Lock this attempt?</strong><span>Your work will be scored across five governance dimensions and a critical-error gate.</span></p></div><button className="primary-button large" disabled={!QA_MODE && Object.keys(progress.defense).length !== module.defense.length} onClick={onSubmit}>Lock and score <ArrowRight size={17} /></button></div></div>;
}

function Results({ module, scores, scoreEligible, passed, transfer, onTransfer, onReturn, onReset }: { module: ExecutiveCaseModule; scores: ScoreSet; scoreEligible: boolean; passed: boolean; transfer: number | null; onTransfer: (value: number) => void; onReturn: () => void; onReset: () => void }) {
  const dimensions = [['Evidence', scores.evidence, 20], ['Analysis', scores.analysis, 20], ['Decision', scores.decision, 25], ['Record', scores.record, 20], ['Defense', scores.defense, 15]] as const;
  const orderedTransfer = challengeOrder(module.transfer.answers, `${module.id}:transfer`, (answer) => answer);
  const transferPending = scoreEligible && transfer === null;
  const status = passed ? 'MASTERY STANDARD MET' : transferPending ? 'TRANSFER CHECK REQUIRED' : 'TARGETED REMEDIATION REQUIRED';
  const summary = passed ? 'You built a defensible evidence chain and proved the rule on changed facts.' : transferPending ? 'Your scored work is eligible. Mastery remains locked until you solve the changed-facts case below.' : 'This attempt is not certificate-eligible. Reconstruct the reasoning, then take the counterfactual case.';
  return <div className="page results-page"><section className={cx('result-hero', passed ? 'pass' : transferPending ? 'pending' : 'fail')} aria-live="polite"><div className="result-symbol">{passed ? <CheckCircle2 size={30} /> : transferPending ? <Target size={30} /> : <AlertTriangle size={30} />}</div><div><span>{status}</span><h1>{scores.total}<small>/100</small></h1><p>{summary}</p></div><div className="threshold"><span>PASS</span><strong>92%</strong><small>+ zero critical errors + one-shot transfer</small></div></section><section className="score-grid">{dimensions.map(([label, value, max]) => <article key={label}><div><span>{label}</span><strong>{value}<small>/{max}</small></strong></div><div className="score-track" role="progressbar" aria-label={`${label} score`} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}><i style={{ width: `${(value / max) * 100}%` }} /></div></article>)}</section>{!scoreEligible && <section className="remediation-panel"><div className="remediation-head"><span>REASONING RECONSTRUCTION</span><h2>Repair the evidence chain</h2></div>{scores.criticalErrors.length > 0 && <div className="critical-box"><XCircle size={19} /><div><strong>Critical errors</strong>{scores.criticalErrors.map((error) => <p key={error}>{error}</p>)}</div></div>}<div className="diagnostic-list">{scores.diagnostics.map((item, index) => <article key={`${item.stage}-${item.issue}`}><span>{String(index + 1).padStart(2, '0')} · {item.stage}</span><h3>{item.issue}</h3><p>{item.repair}</p></article>)}</div><div className="remediation-grid"><article><span>DECISIVE DUTY</span><h3>{module.remediation.duty}</h3></article><article><span>WHY THE TRAP WORKED</span><h3>{module.remediation.trap}</h3></article><article><span>EVIDENCE REPAIR</span><h3>{module.remediation.repair}</h3></article><article><span>TRANSFER RULE</span><h3>{module.remediation.transferRule}</h3></article></div></section>}{scoreEligible && transfer !== null && !passed && <section className="remediation-panel transfer-remediation"><div className="remediation-head"><span>NOVEL-FACT FAILURE</span><h2>The original case was mastered; the rule did not transfer.</h2></div><div className="critical-box"><XCircle size={19} /><div><strong>One-shot transfer missed</strong><p>{module.transfer.rationale}</p><p>Start a new attempt. The prior answer remains locked so feedback cannot be brute-forced into mastery.</p></div></div></section>}<section className="transfer-check"><span>{scoreEligible ? 'FINAL TRANSFER GATE · ONE SHOT' : 'COUNTERFACTUAL CHECK · ONE SHOT'}</span><h3>{module.transfer.prompt}</h3>{orderedTransfer.map(({ value: answer, originalIndex }, displayIndex) => <label key={answer} className={cx('answer-row', transfer === originalIndex && 'selected', transfer !== null && originalIndex === module.transfer.correct && 'answer-correct', transfer !== null && transfer === originalIndex && originalIndex !== module.transfer.correct && 'answer-wrong')}><input type="radio" name={`${module.id}-transfer`} checked={transfer === originalIndex} disabled={transfer !== null} onChange={() => onTransfer(originalIndex)} /><i>{String.fromCharCode(65 + displayIndex)}</i><p>{answer}</p>{transfer !== null && originalIndex === module.transfer.correct && <CheckCircle2 size={18} />}</label>)}{transfer !== null && <p className="transfer-rationale">{module.transfer.rationale}</p>}</section><div className="results-actions"><button className="secondary-button" onClick={onReturn}><ArrowLeft size={17} /> Review evidence</button><button className="primary-button" onClick={onReset}>{passed ? 'Start fresh demonstration' : 'Start new attempt'} <RotateCcw size={16} /></button></div></div>;
}

function EvidenceDrawer({ item, selected, locked, onClose, onToggle }: { item: CaseEvidence; selected: boolean; locked: boolean; onClose: () => void; onToggle: () => void }) {
  return <div className="modal-layer" role="presentation"><button className="modal-scrim" onClick={onClose} aria-label="Close evidence" /><section className="evidence-drawer" role="dialog" aria-modal="true" aria-labelledby="generic-evidence-title"><div className="drawer-head"><div><span>{item.code} · {item.kind.toUpperCase()}</span><h2 id="generic-evidence-title">{item.title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close evidence" autoFocus><X size={19} /></button></div><div className="drawer-summary"><FileSearch size={21} /><p>{item.summary}</p></div><div className="artifact-paper"><div className="artifact-watermark">TRAINING</div>{item.details.map((detail, index) => <div className="artifact-line" key={detail}><span>{String(index + 1).padStart(2, '0')}</span><p>{detail}</p></div>)}</div><div className="drawer-source"><LockKeyhole size={15} /><span>{item.source}</span></div><div className="drawer-actions"><button className="secondary-button" onClick={onClose}>Close</button><button className={cx('primary-button', selected && 'selected-button')} onClick={onToggle} disabled={locked}>{selected ? <><Check size={16} /> Added to evidence set</> : <>Add to evidence set <ArrowRight size={16} /></>}</button></div></section></div>;
}

function PageHead({ eyebrow, title, lede }: { eyebrow: string; title: string; lede: string }) {
  return <header className="page-head"><span>{eyebrow}</span><h1>{title}</h1><p>{lede}</p></header>;
}

function PageFooter({ previous, next, onNext, disabled, hint }: { previous: string; next: string; onNext: () => void; disabled?: boolean; hint?: string }) {
  return <footer className="page-footer"><span><ArrowLeft size={15} /> {previous}</span><div>{!QA_MODE && hint && <small>{hint}</small>}<button className="primary-button" onClick={onNext} disabled={QA_MODE ? false : disabled}>{next} <ArrowRight size={16} /></button></div></footer>;
}
