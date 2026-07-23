import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileLock2,
  Gavel,
  Landmark,
  Layers3,
  LockKeyhole,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import MeetingModule from './MeetingModule';
import ExecutiveModuleView from './ExecutiveModule';
import { CASE_MODULES, MODULES } from './academyData';
import type { AcademyModuleSummary } from './academyTypes';
import { getOfficialEvidence } from '../compliance/complianceStore';
import { MODULE_MASTERY_STANDARD } from '../compliance/complianceCatalog';

// Completion is NEVER inferred from a submitted attempt. A module is complete
// only when a connected evidence service holds a passing, attested,
// zero-critical-error official record. In a disconnected dev build this is
// always false — which is the honest state.
function readCompletion(module: AcademyModuleSummary) {
  return getOfficialEvidence().some(
    (r) =>
      r.assignmentId === `gb:module:${module.id}` &&
      r.completedAt !== null &&
      r.attestedAt !== null &&
      r.criticalErrors.length === 0 &&
      (r.score ?? 0) >= MODULE_MASTERY_STANDARD,
  );
}

export default function Academy({ onExitJourney, initialModuleId = null }: { onExitJourney: () => void; initialModuleId?: string | null }) {
  const [activeId, setActiveId] = useState<string | null>(initialModuleId);
  const open = (id: string) => {
    setActiveId(id);
    window.scrollTo({ top: 0 });
  };
  const close = () => {
    setActiveId(null);
    window.scrollTo({ top: 0 });
  };

  let content;
  if (activeId === 'GB-003') content = <MeetingModule onExit={close} />;
  else if (activeId && CASE_MODULES[activeId]) content = <ExecutiveModuleView key={activeId} module={CASE_MODULES[activeId]} onExit={close} />;
  else content = <AcademyHome onOpen={open} onExitJourney={onExitJourney} />;
  return <div className="gb-academy-root">{content}</div>;
}

function AcademyHome({ onOpen, onExitJourney }: { onOpen: (id: string) => void; onExitJourney: () => void }) {
  const [completed, setCompleted] = useState(0);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setCompleted(MODULES.filter(readCompletion).length));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const groups = [
    { label: 'Foundation', range: '01–03', modules: MODULES.filter((module) => module.sequence <= 3) },
    { label: 'Executive control', range: '04–08', modules: MODULES.filter((module) => module.sequence >= 4 && module.sequence <= 8) },
    { label: 'Assurance', range: '09–12', modules: MODULES.filter((module) => module.sequence >= 9 && module.sequence <= 12) },
    { label: 'Integrated defense', range: 'CAPSTONE', modules: MODULES.filter((module) => module.id === 'GB-CAPSTONE') },
  ];

  return (
    <div className="app-shell academy-shell" data-role-theme="gb">
      <header className="command-bar academy-command">
        <div className="brand-lockup"><button className="icon-button academy-back" onClick={onExitJourney} aria-label="Return to Governing Body Office"><ArrowLeft size={18} /></button><div className="brand-mark" aria-hidden="true"><span /><span /><span /></div><div><div className="brand-name">CARE INDEED</div><div className="brand-product">Governance Institute</div></div></div>
        <div className="module-lockup"><span>GB</span><strong>Executive Governance Curriculum</strong></div>
        <div className="command-actions"><div className="save-state"><CheckCircle2 size={15} /> Required for your Governing Body compliance</div><div className="academy-version">CURRICULUM v1.0</div></div>
      </header>

      <main className="academy-canvas">
        <section className="academy-hero">
          <div className="academy-hero-copy"><div className="page-kicker"><Sparkles size={15} /> Governing Body Institute</div><span className="chapter-code">DIRECTORS · PHYSICIANS · SENIOR EXECUTIVES</span><h1>Authority is not a title.<br /><em>It is an evidence trail.</em></h1><p>Advanced Governing Body education built around decisions, imperfect records, competing duties, and survey-level defense. Every lab requires you to observe, interrogate, classify, decide, draft, defend, and remediate.</p><div className="hero-actions"><button className="primary-button large" onClick={() => onOpen('GB-001')}>Enter the Institute <ArrowRight size={17} /></button><span>12 case laboratories + integrated capstone</span></div></div>
          <div className="academy-seal" aria-label="Governing Body Academy visual mark"><div className="academy-orbit orbit-one" /><div className="academy-orbit orbit-two" /><div className="academy-orbit orbit-three" /><div className="academy-seal-core"><Landmark size={44} /><span>GB</span><small>EXECUTIVE<br />GOVERNANCE</small></div></div>
        </section>

        <section className="academy-metrics" aria-label="Academy standards">
          <article><Scale size={20} /><div><strong>12+1</strong><span>Modules + capstone</span></div></article>
          <article><Target size={20} /><div><strong>92%</strong><span>Mastery standard</span></div></article>
          <article><ShieldCheck size={20} /><div><strong>0</strong><span>Critical errors allowed</span></div></article>
          <article><Layers3 size={20} /><div><strong>7</strong><span>Reasoning stages</span></div></article>
          <article><Award size={20} /><div><strong>{completed}</strong><span>Modules officially complete</span></div></article>
        </section>

        <section className="academy-source-gate"><FileLock2 size={23} /><div><span>OFFICIAL COMPLETION POSTURE</span><h2>This training is a required Governing Body compliance item.</h2><p>A module is complete only when every required stage is finished, the mastery threshold is met with zero critical errors, the changed-facts transfer is passed, attestation is completed, and the official evidence record is saved. If the compliance evidence service is not connected in this build, completion is unavailable — the reasoning is fully exercised, but no official record is created and your compliance progress does not advance.</p></div><div className="gate-status"><LockKeyhole size={17} /><span>Official evidence required</span></div></section>

        <section className="curriculum-head"><div><span>CURRICULUM</span><h2>The Governing Body decision system</h2></div><p>Difficulty comes from realistic ambiguity and cross-source reconciliation—not trivia, trick grammar, or unsupported rules.</p></section>

        <div className="curriculum-groups">{groups.map((group) => <section className="curriculum-group" key={group.label}><header><div><span>{group.range}</span><h3>{group.label}</h3></div><small>{group.modules.length} {group.modules.length === 1 ? 'experience' : 'modules'}</small></header><div className="module-grid">{group.modules.map((module) => <ModuleCard key={module.id} module={module} completed={readCompletion(module)} onOpen={() => onOpen(module.id)} />)}</div></section>)}</div>

        <section className="academy-method"><div><span>THE CHALLENGE ENGINE</span><h2>One discipline. Seven escalating moves.</h2></div><ol>{['Observe the situation without premature judgment', 'Interrogate the source and its limitations', 'Classify authority, risk, evidence, and dependency', 'Decide the narrowest complete response', 'Draft the official governance record', 'Defend every conclusion under follow-up questioning', 'Remediate the reasoning and prove transfer'].map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p></li>)}</ol></section>
      </main>
    </div>
  );
}

function ModuleCard({ module, completed, onOpen }: { module: AcademyModuleSummary; completed: boolean; onOpen: () => void }) {
  const capstone = module.id === 'GB-CAPSTONE';
  return <article
    className={`module-card ${capstone ? 'capstone' : ''}`}
    data-module-id={module.id}
    role="button"
    tabIndex={0}
    aria-label={`${completed ? 'Review' : 'Open'} ${module.id}: ${module.title}`}
    onClick={onOpen}
    onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen(); } }}
  ><div className="module-card-top"><span className="module-number">{capstone ? 'FINAL' : String(module.sequence).padStart(2, '0')}</span><span className={`posture-badge ${module.posture}`}>{completed ? 'ATTEMPT SCORED' : module.postureLabel}</span></div><div className="module-card-icon">{capstone ? <Award size={21} /> : <Gavel size={21} />}</div><small>{module.id} · {module.domain}</small><h3>{module.title}</h3><p>{module.lede}</p><div className="module-meta"><span><Clock3 size={13} /> {module.duration}</span><span><BookOpenCheck size={13} /> {module.difficulty}</span></div><div className="module-tags">{module.achc.slice(0, 3).map((item) => <i key={item}>{item}</i>)}</div><span className="module-card-action">{completed ? 'Review lab' : 'Open executive lab'} <ChevronRight size={16} /></span></article>;
}
