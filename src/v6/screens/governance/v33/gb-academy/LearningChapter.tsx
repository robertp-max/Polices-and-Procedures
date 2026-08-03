import { useState } from 'react';
import Image from '../nextImageShim';
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  Check,
  ClipboardCheck,
  Eye,
  FileSearch,
  Lightbulb,
  LockKeyhole,
  Scale,
  ShieldAlert,
  X,
} from 'lucide-react';
import { LEARNING_PANEL_IDS, sceneVisualFor, type LearningPanelId } from './sceneVisuals';

export { LEARNING_PANEL_IDS } from './sceneVisuals';

type DoctrineItem = { number: string; title: string; body: string };
type RemediationModel = { duty: string; trap: string; repair: string; transferRule: string };

type LearningChapterProps = {
  moduleId: string;
  domain: string;
  title: string;
  caseContext: string;
  decisiveDuty: string;
  doctrine: DoctrineItem[];
  remediation: RemediationModel;
  sources: string[];
  visited: string[];
  onVisit: (id: string) => void;
  onContinue: () => void;
};

const PANELS = [
  { id: 'orientation', label: 'Orientation', sublabel: 'Duty + objectives', icon: BookOpenCheck },
  { id: 'control-model', label: 'Control model', sublabel: 'How to reason', icon: Scale },
  { id: 'worked-example', label: 'Worked example', sublabel: 'See the method', icon: BrainCircuit },
  { id: 'failure-patterns', label: 'Failure patterns', sublabel: 'Avoid the traps', icon: ShieldAlert },
  { id: 'field-guide', label: 'Field guide', sublabel: 'Use on the job', icon: ClipboardCheck },
] as const;

type VisualHotspot = { id: string; title: string; detail: string; x: number; y: number };

function panelHotspots(activeId: LearningPanelId, positions: Array<[number, number]>, caseContext: string, decisiveDuty: string, doctrine: DoctrineItem[], remediation: RemediationModel): VisualHotspot[] {
  const content: Array<{ title: string; detail: string }> = activeId === 'orientation' ? [
    { title: 'Retained authority', detail: decisiveDuty },
    { title: 'Decision context', detail: caseContext },
    { title: 'Minimum sufficient evidence', detail: 'Identify the few verified facts that actually change the governing decision; polish and confidence are not evidence.' },
    { title: 'Return for effectiveness', detail: 'Name the owner, clock, escalation trigger, and evidence that must return before closure.' },
  ] : activeId === 'control-model' ? doctrine.slice(0, 4).map((item) => ({ title: item.title, detail: item.body })) : activeId === 'worked-example' ? [
    { title: 'Start with duty', detail: `Begin with the retained obligation: ${decisiveDuty}` },
    { title: 'Separate fact from inference', detail: 'Preserve the verified conflict without promoting an untested inference into a conclusion.' },
    { title: 'Choose the narrowest complete action', detail: 'Defer or correct only what the record cannot support, while preserving safe and supported operations.' },
    { title: 'Write the future audit trail', detail: 'Record evidence, limitation, direction, owner, deadline, escalation trigger, and effectiveness measure.' },
  ] : activeId === 'failure-patterns' ? [
    { title: 'The duty', detail: remediation.duty },
    { title: 'The tempting trap', detail: remediation.trap },
    { title: 'The repair', detail: remediation.repair },
    { title: 'The transfer rule', detail: remediation.transferRule },
  ] : [
    { title: 'Authority + retained duty', detail: 'What exact source governs, and which accountability remains with the Governing Body?' },
    { title: 'Evidence + uncertainty', detail: 'What is the minimum sufficient proof, and what remains unknown or contradictory?' },
    { title: 'Narrow direction', detail: 'What is the smallest complete action that protects patients, integrity, and lawful operations?' },
    { title: 'Effectiveness return', detail: 'How and when will the Board know the direction worked, and where will that proof be recorded?' },
  ];

  return content.map((item, index) => ({ id: `${activeId}-${index + 1}`, ...item, x: positions[index][0], y: positions[index][1] }));
}

export default function LearningChapter({ moduleId, domain, title, caseContext, decisiveDuty, doctrine, remediation, sources, visited, onVisit, onContinue }: LearningChapterProps) {
  const qaMode = true;
  const [activeId, setActiveId] = useState<LearningPanelId>('orientation');
  const [observed, setObserved] = useState<Record<string, string[]>>({});
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const activeIndex = LEARNING_PANEL_IDS.indexOf(activeId);
  const visual = sceneVisualFor(moduleId, activeId);
  const hotspots = panelHotspots(activeId, visual.positions, caseContext, decisiveDuty, doctrine, remediation);
  const observedIds = observed[activeId] ?? [];
  const panelComplete = hotspots.every((hotspot) => observedIds.includes(hotspot.id));
  const reviewed = new Set([...visited, ...(panelComplete ? [activeId] : [])]);
  const allReviewed = LEARNING_PANEL_IDS.every((id) => reviewed.has(id));
  const selectedHotspot = hotspots.find((hotspot) => hotspot.id === activeHotspot) ?? null;

  const openPanel = (id: LearningPanelId) => {
    if (panelComplete) onVisit(activeId);
    setActiveId(id);
    setActiveHotspot(null);
  };

  const revealHotspot = (hotspot: VisualHotspot) => {
    const nextObserved = observedIds.includes(hotspot.id) ? observedIds : [...observedIds, hotspot.id];
    setObserved((current) => ({ ...current, [activeId]: nextObserved }));
    setActiveHotspot(hotspot.id);
    if (nextObserved.length === hotspots.length) onVisit(activeId);
  };

  const nextPanel = () => {
    onVisit(activeId);
    if (activeIndex < LEARNING_PANEL_IDS.length - 1) {
      openPanel(LEARNING_PANEL_IDS[activeIndex + 1]);
      return;
    }
    onContinue();
  };

  return (
    <div className="page learning-chapter visual-learning-chapter">
      <header className="visual-learning-header">
        <div><span>GUIDED LEARNING · {moduleId}</span><strong>{title}</strong></div>
        <nav aria-label="Guided learning sections">
          {PANELS.map((panel, index) => {
            const Icon = panel.icon;
            const active = panel.id === activeId;
            const complete = visited.includes(panel.id) || (active && panelComplete);
            return <button key={panel.id} className={active ? 'active' : ''} onClick={() => openPanel(panel.id)} aria-current={active ? 'step' : undefined}><span>{complete ? <Check size={13} /> : <Icon size={14} />}</span><small>{String(index + 1).padStart(2, '0')}</small><strong>{panel.label}</strong></button>;
          })}
        </nav>
        <div className="visual-observed"><Eye size={14} /><strong>{observedIds.length}/{hotspots.length}</strong><span>observed</span></div>
      </header>

      <div className="visual-learning-panels">
        <article className="visual-learning-copy">
          <div className="visual-copy-scroll">
          {activeId === 'orientation' && <Orientation moduleId={moduleId} title={title} domain={domain} caseContext={caseContext} decisiveDuty={decisiveDuty} doctrine={doctrine} remediation={remediation} sources={sources} />}
          {activeId === 'control-model' && <ControlModel moduleId={moduleId} domain={domain} caseContext={caseContext} doctrine={doctrine} decisiveDuty={decisiveDuty} remediation={remediation} sources={sources} />}
          {activeId === 'worked-example' && <WorkedExample moduleId={moduleId} domain={domain} caseContext={caseContext} decisiveDuty={decisiveDuty} doctrine={doctrine} remediation={remediation} sources={sources} />}
          {activeId === 'failure-patterns' && <FailurePatterns moduleId={moduleId} caseContext={caseContext} decisiveDuty={decisiveDuty} doctrine={doctrine} remediation={remediation} sources={sources} />}
          {activeId === 'field-guide' && <FieldGuide moduleId={moduleId} caseContext={caseContext} decisiveDuty={decisiveDuty} doctrine={doctrine} remediation={remediation} sources={sources} />}
          </div>
        </article>

        <section
          className="visual-learning-scene"
          aria-label={`${moduleId} interactive executive scene`}
          aria-live="polite"
          data-module-id={moduleId}
          data-scene-id={activeId}
          data-scene-src={visual.src}
        >
          <div className="visual-scene-content">
            <Image
              key={`${moduleId}:${activeId}:${visual.src}`}
              src={visual.src}
              alt={visual.alt}
              fill
              priority={activeId === 'orientation'}
              unoptimized
              sizes="(max-width: 700px) 100vw, 65vw"
            />
            <div className="visual-scene-shade" />
            {hotspots.map((hotspot, index) => <button key={hotspot.id} className={`visual-hotspot ${observedIds.includes(hotspot.id) ? 'observed' : ''} ${activeHotspot === hotspot.id ? 'selected' : ''}`} style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }} onClick={() => revealHotspot(hotspot)} aria-label={`Inspect ${hotspot.title}`}><span>{observedIds.includes(hotspot.id) ? <Check size={14} /> : index + 1}</span><small>{hotspot.title}</small></button>)}
          </div>
          <div className="visual-scene-label"><span>{PANELS[activeIndex].sublabel.toUpperCase()}</span><strong>{PANELS[activeIndex].label}</strong></div>
          {selectedHotspot && <aside className="visual-hotspot-card" role="status"><button onClick={() => setActiveHotspot(null)} aria-label="Close hotspot detail"><X size={15} /></button><span>EXECUTIVE OBSERVATION</span><h3>{selectedHotspot.title}</h3><p>{selectedHotspot.detail}</p></aside>}
          <div className="visual-scene-instruction"><Eye size={15} /><span>Inspect every hotspot. These observations teach the decision model; they are not scored.</span></div>
        </section>
      </div>

      <footer className="visual-learning-footer">
        <div><span>{reviewed.size}/{LEARNING_PANEL_IDS.length} LESSONS REVIEWED</span><p>{qaMode ? 'QA mode · all lesson navigation is unlocked.' : panelComplete ? (allReviewed ? 'Instruction complete. Active-time and challenge gates still apply.' : 'All observations captured. Continue when ready.') : `Inspect ${hotspots.length - observedIds.length} remaining hotspot${hotspots.length - observedIds.length === 1 ? '' : 's'} to complete this lesson.`}</p></div>
        <button className="primary-button" onClick={nextPanel}>{activeIndex === LEARNING_PANEL_IDS.length - 1 ? 'Enter the evidence challenge' : `Next · ${PANELS[activeIndex + 1].label}`} <ArrowRight size={16} /></button>
      </footer>
    </div>
  );
}

function Orientation({ moduleId, title, domain, caseContext, decisiveDuty, doctrine, remediation, sources }: { moduleId: string; title: string; domain: string; caseContext: string; decisiveDuty: string; doctrine: DoctrineItem[]; remediation: RemediationModel; sources: string[] }) {
  return <section className="learning-panel" data-content-kind="instruction"><div className="learning-kicker"><BookOpenCheck size={17} /> ORIENTATION · {domain}</div><h2>{title}</h2><p className="learning-lede">{caseContext}</p><div className="duty-callout"><span>THE DECISIVE DUTY</span><h3>{decisiveDuty}</h3><p>This sentence is the control point for the entire module. When facts compete, return to the retained duty before deciding what the Board may approve, delegate, defer, correct, or verify.</p></div><div className="objective-grid"><h3>By the end of this module, you will be able to:</h3><ol><li><strong>Locate authority.</strong><span>Separate the Governing Body’s retained accountability from management execution.</span></li><li><strong>Test the evidence.</strong><span>Distinguish decisive proof from context, confidence, and administrative polish.</span></li><li><strong>Direct a bounded response.</strong><span>Choose the narrowest complete action with an owner, clock, and return condition.</span></li><li><strong>Defend the record.</strong><span>Explain what was known, what remained uncertain, what was decided, and how effectiveness will be verified.</span></li></ol></div>
    <section className="instruction-depth" aria-label={`${moduleId} expanded orientation`}>
      <header><span>DEEP INSTRUCTION · GOVERNANCE SCOPE</span><h3>Understand the work before entering the exercise.</h3><p>The Board’s job is not to perform every operational task. Its job is to establish a reliable decision system: identify the controlling duty, require sufficient evidence, set a bounded direction, assign accountable execution, and demand proof that the response worked.</p></header>
      <div className="instruction-depth-grid">
        <article><span>WHAT THE BOARD RETAINS</span><h4>Judgment, accountability, and verification</h4><p>Management may assemble the packet, investigate facts, recommend options, and execute an approved plan. The Governing Body still owns the judgment that the evidence is sufficient, the response is proportionate, and the follow-through protects lawful and safe operations.</p><p>For this module, keep returning to one question: <strong>What part of “{decisiveDuty}” cannot disappear through delegation?</strong></p></article>
        <article><span>WHAT MAY BE ASSIGNED</span><h4>Execution with explicit boundaries</h4><p>A defensible assignment identifies the qualified owner, the exact work, the deadline, the limits of authority, the escalation trigger, and the evidence that must return. “Management will handle it” is not a control because it leaves both scope and verification undefined.</p><p>The owner may change; the Board’s obligation to monitor the outcome does not.</p></article>
        <article><span>WHAT PROOF MUST RETURN</span><h4>A closed loop, not a verbal assurance</h4><p>Closure requires more than confirmation that a task occurred. The return record should show what changed, which measure was tested, whether risk decreased, what remains unresolved, and who accepted the residual risk. A clean status color cannot substitute for the underlying proof.</p><p>The governing record must let a later reviewer reconstruct the decision without relying on memory.</p></article>
      </div>
      <div className="module-concept-map">
        <span>THE {moduleId} REASONING MAP</span>
        {doctrine.map((item, index) => <article key={`${item.number}-${item.title}`}><strong>{item.number} · {item.title}</strong><p>{item.body}</p><small>{index === 0 ? 'Establish the lawful starting point.' : index === doctrine.length - 1 ? 'Complete the return-and-verification loop.' : 'Carry the evidence chain into the next control.'}</small></article>)}
      </div>
      <div className="instruction-evidence-standard"><FileSearch size={18} /><div><span>SOURCE DISCIPLINE</span><h4>Use a source ladder, not a source pile.</h4><p>Begin with the controlling authority or policy, then reconcile the time-specific operational record, then use summaries and explanations as context. If those layers conflict, preserve the conflict and resolve it before the Board treats the conclusion as established.</p><small>Learning anchors: {sources.slice(0, 4).join(' · ')}{sources.length > 4 ? ` · +${sources.length - 4} more` : ''}</small></div></div>
      <div className="instruction-trap"><ShieldAlert size={18} /><div><span>THE TRAP TO RECOGNIZE</span><p>{remediation.trap} The learning goal is to recognize why that shortcut feels reasonable, identify the proof it omits, and replace it with a decision path that remains defensible under later review.</p></div></div>
    </section>
    <aside className="learning-note"><Lightbulb size={18} /><p><strong>This is not memorization.</strong> Survey readiness depends on reconstructable reasoning: duty → facts → decision → record → follow-through.</p></aside></section>;
}

function ControlModel({ moduleId, domain, caseContext, doctrine, decisiveDuty, remediation, sources }: { moduleId: string; domain: string; caseContext: string; doctrine: DoctrineItem[]; decisiveDuty: string; remediation: RemediationModel; sources: string[] }) {
  return <section className="learning-panel" data-content-kind="instruction"><div className="learning-kicker"><Scale size={17} /> CONTROL MODEL · {moduleId}</div><h2>Use one reasoning spine for every governance decision.</h2><p className="learning-lede">The subject changes; the control logic does not. Read each element as a job the Governing Body must complete and be able to prove later.</p><div className="doctrine-lessons">{doctrine.map((item, index) => <article key={`${item.number}-${item.title}`}><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.body}</p><small><strong>Boardroom question:</strong> {index === 0 ? `What gives us authority—and what part of “${decisiveDuty}” remains ours?` : index === doctrine.length - 1 ? 'What evidence will tell us the response worked, and when must it return?' : `What fact, source, and limitation must the record preserve at the ${item.title.toLowerCase()} step?`}</small><div className="doctrine-depth"><p><strong>Evidence standard.</strong> Start with {sources[index % Math.max(1, sources.length)] ?? 'the controlling source'}, then reconcile it to the time-specific record. A summary is acceptable for navigation, but the Board should be able to reach the source facts that support the decisive inference.</p><p><strong>Record output.</strong> The official record should identify what was reviewed, the material limitation, the direction taken, the accountable owner, the return date, and the effectiveness measure created at this step.</p></div></div></article>)}</div><div className="reasoning-chain" aria-label="Governance reasoning sequence"><div><strong>01</strong><span>Name the retained duty</span></div><i /><div><strong>02</strong><span>Reconcile reliable facts</span></div><i /><div><strong>03</strong><span>Choose bounded action</span></div><i /><div><strong>04</strong><span>Assign + verify effect</span></div></div>
    <section className="control-application" aria-label="Control model application">
      <header><span>APPLY THE MODEL · {domain.toUpperCase()}</span><h3>Move from information to a controlled decision.</h3><p>{caseContext} The model below prevents urgency, status, or presentation quality from replacing the Board’s own evidence-based judgment.</p></header>
      <div className="control-application-grid">
        <article><span>BEFORE THE MEETING</span><h4>Define the decision object</h4><p>State exactly what the Board is being asked to approve, defer, correct, monitor, or acknowledge. Confirm the version, effective date, scope, and authority. If the decision object cannot be stated in one accurate sentence, the packet is not ready for consent.</p><ul><li>Identify the controlling duty and decision owner.</li><li>List the minimum evidence needed to decide.</li><li>Mark conflicts, exclusions, and stale data.</li></ul></article>
        <article><span>DURING DELIBERATION</span><h4>Expose the reasoning chain</h4><p>Ask which facts are verified, which are inferences, and which remain unknown. Compare the proposed action to the retained duty. Narrow the action until it protects patients and operations without claiming more certainty or authority than the record supports.</p><ul><li>Separate immediate protection from final adjudication.</li><li>Test delegation, conflicts, and decision rights.</li><li>Name the consequence of doing nothing.</li></ul></article>
        <article><span>AFTER THE DECISION</span><h4>Engineer the return loop</h4><p>Assign a qualified owner, deadline, escalation threshold, and required return evidence. The Board should know in advance what success, partial success, failure, and recurrence will look like. Closure is a later decision supported by evidence—not an automatic result of task completion.</p><ul><li>Preserve the limitation and rationale in minutes.</li><li>Align forms, systems, training, and workflow.</li><li>Schedule effectiveness review before adjournment.</li></ul></article>
      </div>
      <div className="control-boundary"><LockKeyhole size={17} /><div><span>DELEGATION BOUNDARY</span><p><strong>{decisiveDuty}</strong> Expertise can strengthen execution, but it cannot erase the retained accountability that requires the Governing Body to understand, direct, and verify the result.</p></div></div>
      <div className="control-repair"><ShieldAlert size={17} /><div><span>WHEN THE CHAIN BREAKS</span><p>{remediation.repair} Repair should be prospective, attributable, time-bound, and honest about the historical record; it should never manufacture evidence that did not exist.</p></div></div>
    </section>
  </section>;
}

function WorkedExample({ moduleId, domain, caseContext, decisiveDuty, doctrine, remediation, sources }: { moduleId: string; domain: string; caseContext: string; decisiveDuty: string; doctrine: DoctrineItem[]; remediation: RemediationModel; sources: string[] }) {
  return <section className="learning-panel" data-content-kind="instruction"><div className="learning-kicker"><BrainCircuit size={17} /> WORKED EXAMPLE · UNGRADED</div><h2>Watch the method before you perform it.</h2><p className="learning-lede">This simplified example teaches the reasoning process without revealing the scored case.</p><div className="example-brief"><span>ILLUSTRATIVE SITUATION</span><h3>A polished {domain.toLowerCase()} recommendation reaches the Board with unanimous management support, but one source artifact conflicts with the headline conclusion and the follow-up measure is undefined.</h3><p>The weak move is to approve the recommendation because experienced leaders agree. The equally weak opposite is to reject everything because one discrepancy exists. Governance requires a narrower analysis.</p></div><div className="walkthrough-steps"><article><span>STEP 1</span><h3>Start with duty, not preference</h3><p>{decisiveDuty} That retained duty determines which uncertainty must be resolved before action and which detail may be assigned to management.</p></article><article><span>STEP 2</span><h3>Separate fact from inference</h3><p>Verified fact: one source conflicts with the summary. Inference: the entire recommendation is wrong. The Board should preserve the fact, investigate the conflict, and avoid promoting the inference into a conclusion.</p></article><article><span>STEP 3</span><h3>Choose the narrowest complete action</h3><p>Defer only the affected decision, name the missing proof, assign a qualified owner, set a return date, and preserve unaffected operations where the record supports them.</p></article><article><span>STEP 4</span><h3>Write the future audit trail</h3><p>The record should state the evidence reviewed, the conflict found, the Board’s direction, the accountable owner, the deadline, and the effectiveness test—not simply “discussion held” or “approved as presented.”</p></article></div><aside className="model-answer"><FileSearch size={19} /><div><span>MODEL REASONING</span><p><strong>Because</strong> the retained duty requires a reliable basis, <strong>and because</strong> the source conflict affects the proposed conclusion, <strong>the Board directs</strong> targeted reconciliation before approval, <strong>assigns</strong> an owner and return date, and <strong>will verify</strong> the result against a defined measure.</p><small>The wording changes by module. The chain remains: duty → evidence → limitation → direction → verification.</small></div></aside>
    <section className="worked-analysis" aria-label={`${moduleId} expanded worked example`}>
      <header><span>FULL REASONING WALKTHROUGH · {moduleId}</span><h3>Compare three plausible paths before choosing one.</h3><p>The purpose is not to memorize a preferred answer. It is to see how the same facts produce different levels of defensibility depending on how the Board handles authority, uncertainty, proportionality, documentation, and follow-through.</p></header>
      <div className="worked-paths">
        <article className="weak"><span>PATH A · PREMATURE APPROVAL</span><h4>Trust the polished recommendation</h4><p>The Board accepts the headline because the presenters are experienced and the packet appears complete. This path is fast, but it converts an unresolved source conflict into an unsupported official conclusion. It also leaves no defined effectiveness measure, so later closure cannot be distinguished from optimism.</p><strong>Why it fails</strong><p>Expertise and presentation quality are context. Neither proves the decisive fact or discharges the retained duty.</p></article>
        <article className="weak"><span>PATH B · UNBOUNDED REJECTION</span><h4>Treat one conflict as proof that everything failed</h4><p>The Board rejects the entire recommendation and orders a broad restart. This appears cautious, yet it overstates what the discrepancy establishes, disrupts supported operations, and may consume resources without addressing the precise missing proof.</p><strong>Why it fails</strong><p>A contradiction creates a duty to reconcile; it does not automatically establish fraud, total unreliability, or the need to discard unaffected work.</p></article>
        <article className="strong"><span>PATH C · BOUNDED DIRECTION</span><h4>Isolate the affected decision and close the loop</h4><p>The Board identifies the exact inference the conflicting source affects, preserves supported operations, directs targeted reconciliation, names a conflict-free owner, sets a return date, and defines what evidence will permit approval or require further action.</p><strong>Why it works</strong><p>The direction is proportionate to verified facts and produces a future record capable of confirming whether the response worked.</p></article>
      </div>
      <div className="worked-decision-ledger">
        <span>BUILD THE DECISION LEDGER</span>
        {doctrine.map((item, index) => <article key={`${item.number}-${item.title}-ledger`}><strong>{item.title}</strong><p>{index === 0 ? `Authority and duty: ${item.body}` : index === doctrine.length - 1 ? `Effectiveness and return: ${item.body}` : `Evidence and bounded action: ${item.body}`}</p><small>{index === 0 ? 'Write the controlling authority and retained responsibility.' : index === 1 ? 'Record the verified fact, source, and material limitation.' : index === 2 ? 'State the narrow direction, owner, deadline, and escalation trigger.' : 'Define the measure and the date evidence returns to the Board.'}</small></article>)}
      </div>
      <div className="sample-directive"><FileSearch size={18} /><div><span>SAMPLE GOVERNANCE RECORD · TRAINING ONLY</span><p>After reviewing the controlling source, the conflicting operational record, and the stated limitation, the Governing Body does not treat the headline conclusion as established. It directs targeted reconciliation by a qualified owner, preserves unaffected operations, requires escalation if the conflict expands, and schedules return review against a defined effectiveness measure. The record identifies the decision object and does not rewrite facts that were unknown at the time.</p><small>Source ladder for this example: {sources.slice(0, 3).join(' → ') || 'controlling authority → operational record → verified return evidence'}.</small></div></div>
      <div className="example-transfer"><Lightbulb size={18} /><div><span>TRANSFER THE METHOD</span><p>{caseContext} Do not import the sample conclusion into that case. Import the method: begin with duty, reconcile the decisive evidence, preserve uncertainty, choose the narrowest complete action, and define the return loop.</p><p><strong>Known trap:</strong> {remediation.trap}</p></div></div>
    </section>
    {doctrine.length > 0 && <p className="example-bridge"><strong>Bridge to your case:</strong> In the challenge, each of the {doctrine.length} control-model elements must be supported by the supplied record. A confident narrative never substitutes for a missing link.</p>}
  </section>;
}

function FailurePatterns({ moduleId, caseContext, decisiveDuty, doctrine, remediation, sources }: { moduleId: string; caseContext: string; decisiveDuty: string; doctrine: DoctrineItem[]; remediation: RemediationModel; sources: string[] }) {
  return <section className="learning-panel" data-content-kind="instruction"><div className="learning-kicker"><ShieldAlert size={17} /> FAILURE PATTERNS · {moduleId}</div><h2>Learn why smart boards still choose weak answers.</h2><p className="learning-lede">The hardest distractors are partly right. They solve a visible symptom while leaving the retained duty, evidence conflict, or verification loop open.</p><div className="failure-grid"><article><span>THE DUTY</span><h3>{remediation.duty}</h3><p>Use this as the non-negotiable test. If a proposed action cannot coexist with the duty, polish and urgency do not rescue it.</p></article><article><span>THE TEMPTING TRAP</span><h3>{remediation.trap}</h3><p>The trap works because it offers speed, certainty, deference, or apparent closure. Ask which proof it quietly skips.</p></article><article><span>THE REPAIR</span><h3>{remediation.repair}</h3><p>A strong repair is prospective and attributable. It identifies the missing control without rewriting the historical record.</p></article><article><span>THE TRANSFER RULE</span><h3>{remediation.transferRule}</h3><p>Carry this rule to changed facts. Mastery means applying the principle when the surface details no longer look familiar.</p></article></div><div className="move-comparison"><div><span>WEAK GOVERNANCE MOVE</span><p>Accept a headline, overreact to one defect, delegate the judgment, or approve now and document later.</p></div><ArrowRight size={20} /><div><span>DEFENSIBLE GOVERNANCE MOVE</span><p>Reconcile the decisive evidence, isolate the affected action, direct a bounded cure, and define how effectiveness returns to the Board.</p></div></div>
    <section className="failure-diagnostics" aria-label={`${moduleId} failure diagnostics`}>
      <header><span>DIAGNOSTIC PRACTICE</span><h3>Catch the weak move before it becomes the official record.</h3><p>{caseContext} Each diagnostic below connects a module-specific control to the early warning signs, questions, and repair evidence the Governing Body should use.</p></header>
      <div className="failure-diagnostic-list">
        {doctrine.map((item, index) => <article key={`${item.number}-${item.title}-diagnostic`}><div><span>{item.number}</span><h4>{item.title}</h4></div><p>{item.body}</p><dl><div><dt>Early warning</dt><dd>{index === 0 ? 'The packet assumes authority, scope, or responsibility instead of proving it.' : index === 1 ? 'A summary resolves a conflict that remains visible in the source record.' : index === 2 ? 'The proposed action is broader, narrower, or more certain than the verified facts support.' : 'The action has an owner but no defined return evidence, threshold, or closure decision.'}</dd></div><div><dt>Board test</dt><dd>{index === 0 ? `Which source establishes our authority, and what part of “${decisiveDuty}” remains with us?` : index === 1 ? `Which fact is verified by ${sources[index % Math.max(1, sources.length)] ?? 'the source record'}, and what is still only an inference?` : index === 2 ? 'What is the smallest complete direction that addresses the established risk without rewriting uncertainty?' : 'What measure, date, and escalation trigger will tell the Board whether the response worked?'}</dd></div><div><dt>Repair evidence</dt><dd>{index === 0 ? 'Controlling authority reconciled to the exact decision object and accountable role.' : index === 1 ? 'Source facts, exclusions, contradictions, and limits preserved in a decision-ready analysis.' : index === 2 ? 'A bounded directive with qualified owner, authority limit, deadline, and escalation path.' : 'Effectiveness results returned to the Governing Body and explicitly accepted, extended, or reopened.'}</dd></div></dl></article>)}
      </div>
      <div className="failure-sequence">
        <article><span>FAILURE 1</span><h4>Headline substitution</h4><p>A dashboard, memo, or executive assurance is treated as though it were the underlying evidence. The cure is not more slides; it is traceability from each decisive claim to a reliable source fact.</p></article>
        <article><span>FAILURE 2</span><h4>Delegation without return</h4><p>The Board assigns the work and assumes the assignment closes the duty. The cure is an explicit owner, deadline, escalation trigger, effectiveness measure, and scheduled return decision.</p></article>
        <article><span>FAILURE 3</span><h4>Historical sanitizing</h4><p>Later knowledge is written into earlier minutes, or a prospective correction is described as though the original control existed. The cure is a truthful chronology that separates original facts, discovery, correction, and verification.</p></article>
        <article><span>FAILURE 4</span><h4>Activity mistaken for effect</h4><p>Training, policy revision, investigation, or monitoring occurred, but nobody tested whether the original risk changed. The cure is a predeclared outcome measure and a Board decision on residual risk.</p></article>
      </div>
      <aside className="failure-counterfactual"><BrainCircuit size={18} /><div><span>COUNTERFACTUAL TEST</span><p>Change one surface fact: make the presenter more senior, the deadline shorter, or the outcome favorable. If the decision rule changes without a change in authority, evidence, or risk, the Board may be reacting to status or hindsight instead of governing.</p><strong>{remediation.transferRule}</strong></div></aside>
    </section>
  </section>;
}

function FieldGuide({ moduleId, caseContext, decisiveDuty, doctrine, remediation, sources }: { moduleId: string; caseContext: string; decisiveDuty: string; doctrine: DoctrineItem[]; remediation: RemediationModel; sources: string[] }) {
  return <section className="learning-panel" data-content-kind="instruction"><div className="learning-kicker"><ClipboardCheck size={17} /> FIELD GUIDE</div><h2>Carry this six-question check into the challenge—and the boardroom.</h2><p className="learning-lede">Before approving, closing, ratifying, delegating, or correcting, make the record answer each question below.</p>
    <section className="field-horizons" aria-label={`${moduleId} boardroom practice guide`}>
      <header><span>THREE PRACTICE HORIZONS · {moduleId}</span><h3>Prepare, deliberate, and close with the same evidence discipline.</h3><p>{caseContext} Use these horizons to keep the Board’s review proportionate while preventing important gaps from being hidden by agenda pressure or polished presentation.</p></header>
      <div>
        <article><span>PRE-READ</span><h4>Make the decision object visible</h4><p>Confirm the exact request, authority, version, scope, affected patients or operations, and decision deadline. Require the packet to identify source facts, exclusions, conflicts, prior Board direction, responsible leaders, and the proposed effectiveness measure.</p><ul><li>Return an incomplete packet before it reaches consent.</li><li>Separate required evidence from helpful context.</li><li>Identify conflicts and recusal needs early.</li></ul></article>
        <article><span>DELIBERATION</span><h4>Test the material inference</h4><p>Ask which fact changes the decision, where that fact came from, and what remains unknown. Compare each option with the retained duty. If immediate protection is necessary, distinguish it from final findings and preserve due process, continuity, and evidence integrity.</p><ul><li>State uncertainty rather than filling it with confidence.</li><li>Test the narrowest complete action.</li><li>Confirm who may decide and who may execute.</li></ul></article>
        <article><span>CLOSEOUT</span><h4>Create a verifiable return condition</h4><p>Record the decision, evidence, limitation, rationale, owner, authority boundary, deadline, escalation trigger, measure, and return date. When results return, decide explicitly whether the response was effective, must continue, needs modification, or requires a new corrective action.</p><ul><li>Never treat task completion as automatic effectiveness.</li><li>Reconcile minutes to the approved decision object.</li><li>Preserve the chronology when new facts emerge.</li></ul></article>
      </div>
    </section>
    <ol className="field-checklist"><li><span>01</span><div><strong>What exact authority governs this action?</strong><p>Name the legal, accreditation, bylaw, or controlled-policy source and distinguish it from custom.</p></div></li><li><span>02</span><div><strong>What duty remains with the Governing Body?</strong><p>{decisiveDuty}</p></div></li><li><span>03</span><div><strong>What is the minimum sufficient evidence?</strong><p>Identify the facts that change the decision and exclude material that cannot support the decisive inference.</p></div></li><li><span>04</span><div><strong>What remains unknown or contradictory?</strong><p>State the limitation openly; do not allow confidence, averages, summaries, or urgency to fill an evidence gap.</p></div></li><li><span>05</span><div><strong>What is the narrowest complete direction?</strong><p>Preserve what the evidence supports, repair what it does not, and assign an owner, deadline, escalation trigger, and return point.</p></div></li><li><span>06</span><div><strong>How will the Board know the response worked?</strong><p>Define the effectiveness measure before closure and preserve the decision trail in the official record.</p></div></li></ol>
    <section className="minutes-anatomy" aria-label="Anatomy of a defensible record"><header><span>ANATOMY OF THE OFFICIAL RECORD</span><h3>Make the minutes reconstructable without turning them into a transcript.</h3></header><div>{[
      ['Authority', 'Identify the governing source, decision right, quorum or recusal condition, and exact object placed before the Board.'],
      ['Evidence', 'Name the decisive records reviewed and preserve material conflicts, exclusions, limitations, and unavailable information.'],
      ['Reasoning', 'Connect the verified facts to the retained duty and explain why the chosen direction is proportionate.'],
      ['Direction', 'State the action, affected scope, qualified owner, delegated authority, deadline, and escalation trigger.'],
      ['Verification', 'Define the outcome measure, evidence that must return, review date, and person accountable for reporting.'],
      ['Integrity', 'Record recusals, dissent, abstentions, corrections, and later-discovered facts without sanitizing history.'],
    ].map(([title, body], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><h4>{title}</h4><p>{body}</p></div></article>)}</div></section>
    <section className="field-doctrine-rehearsal"><span>{moduleId} CONTROL REHEARSAL</span>{doctrine.map((item) => <article key={`${item.number}-${item.title}-rehearsal`}><strong>{item.title}</strong><p>{item.body}</p><small>Say aloud what evidence would prove this control operated and what record would show the Board verified it.</small></article>)}</section>
    <aside className="field-repair"><ShieldAlert size={18} /><div><span>IF THE ANSWER IS “WE DO NOT KNOW”</span><p>Do not force closure. Protect immediate safety, preserve the known facts, identify the exact missing proof, assign a qualified owner, control the decision clock, and return the matter when the record is sufficient.</p><strong>{remediation.repair}</strong></div></aside>
    <details className="teach-back"><summary><Lightbulb size={17} /> Pause and teach it back: what makes a decision defensible?</summary><p>A defensible decision is within authority, based on reconciled and sufficient evidence, explicit about limitations, proportionate to the established facts, assigned for execution, recorded accurately, and returned to the Governing Body for effectiveness verification.</p><p><strong>Transfer rule:</strong> {remediation.transferRule}</p></details><div className="learning-sources"><LockKeyhole size={15} /><span>LEARNING SOURCE SET</span>{sources.map((source) => <i key={source}>{source}</i>)}<i>{moduleId} controlled module record</i></div></section>;
}
