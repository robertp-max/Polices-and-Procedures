
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FlaskConical,
  Menu,
  RotateCcw,
  Scale,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { PolicyJourneyRequirement } from '../generated/policyJourney.types';
import type { PolicyContentSection } from '../types';
import { governingBodyPolicyContentMap } from './governingBodyPolicyContent';
import { cleanTitle, stripGeneratorArtifacts, tableRows } from './policyTextUtils';
import PolicyContentsRail from './PolicyContentsRail';
import PolicyBoardLens from './PolicyBoardLens';
import PolicyRelatedForms from './PolicyRelatedForms';
import { readDraft, writeDraft, commitEvidence, getOfficialEvidence } from '../compliance/complianceStore';
import { useLearnerId } from '../compliance/complianceIdentity';
import { integrityHash } from '../assessments/assessmentUtils';
import { hasAuthoredBank } from '../assessments/courseAssessmentBank';
import './policyPlayer.css';

function PolicyBody({ section }: { section: PolicyContentSection }) {
  const body = stripGeneratorArtifacts(section.body);
  const rows = tableRows(body);
  if (rows?.length) return <div className="pv3-table-wrap"><table><thead><tr>{rows[0].map((cell, index) => <th key={`${cell}-${index}`}>{cell}</th>)}</tr></thead><tbody>{rows.slice(1).map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, index) => <td key={`${rowIndex}-${index}`}>{cell}</td>)}</tr>)}</tbody></table></div>;
  const paragraphs = body.split(/\n\s*\n/).map((value) => value.replace(/^---$|^---\n|\n---$/g, '').trim()).filter(Boolean);
  return <div className="pv3-prose">{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>;
}

// ---- Developer-preview knowledge check -------------------------------------
// EXTRACTIVE only (sentences pulled verbatim from the controlled text). This
// quiz is a non-gating developer preview: it never calls commitEvidence and
// never implies official course credit. Real course credit comes from the
// separately scored Course Assessment (reviewed question bank).

type PreviewQuestion = {
  id: string;
  prompt: string;
  answers: string[];
  correct: number;
  sourceTitle: string;
  controllingRule: string;
};

function previewCandidates(sections: PolicyContentSection[]) {
  return sections.flatMap((section) => stripGeneratorArtifacts(section.body)
    .replace(/\|/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((value) => ({ section, value: value.replace(/\s+/g, ' ').replace(/^---|---$/g, '').trim() })))
    .filter(({ value }) => value.length >= 70 && value.length <= 440 && /\b(shall|must|required|prohibited|within|before|approval)\b/i.test(value));
}

function buildPreviewQuiz(policyId: string, sections: PolicyContentSection[]): PreviewQuestion[] {
  const candidates = previewCandidates(sections);
  if (!candidates.length) return [];
  const count = Math.min(5, candidates.length);
  const selected = Array.from({ length: count }, (_, index) => candidates[Math.floor(index * candidates.length / count)]);
  const shortcuts = [
    'Delegate the matter completely to management and record only that a report was received.',
    'Defer action to the annual review unless a regulator first identifies a deficiency.',
    'Approve the outcome verbally and reconstruct the supporting record if it is later requested.',
  ];
  return selected.map(({ section, value }, index) => {
    const rotation = (policyId.length + index) % 4;
    const options = [value, ...shortcuts];
    const answers = [...options.slice(rotation), ...options.slice(0, rotation)];
    return {
      id: `${policyId}-preview-${index + 1}`,
      prompt: `The Board is acting under "${cleanTitle(section.title)}." Which direction is defensible?`,
      answers,
      correct: answers.indexOf(value),
      sourceTitle: cleanTitle(section.title),
      controllingRule: value,
    };
  });
}

function useActiveTime(): () => number {
  const seconds = useRef(0);
  useEffect(() => {
    let visible = typeof document === 'undefined' ? true : document.visibilityState === 'visible';
    const onVis = () => { visible = document.visibilityState === 'visible'; };
    const id = window.setInterval(() => { if (visible) seconds.current += 1; }, 1000);
    document.addEventListener('visibilitychange', onVis);
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
  }, []);
  return () => seconds.current;
}

export default function GoverningBodyPolicyPlayer({ requirement, onExit }: { requirement: PolicyJourneyRequirement; onExit: () => void }) {
  const learnerId = useLearnerId();
  const policy = governingBodyPolicyContentMap.get(requirement.policyId);
  const allSections = useMemo(() => [...(policy?.sections ?? [])].sort((a, b) => a.order - b.order), [policy]);
  const appendixSection = useMemo(() => allSections.find((s) => /appendi/i.test(s.title)) ?? null, [allSections]);
  const readingSections = useMemo(() => allSections.filter((s) => s !== appendixSection), [allSections, appendixSection]);
  const formsPageIndex = readingSections.length;
  const totalPages = readingSections.length + 1;
  const assignmentId = `gb:policy:${requirement.requirementId}`;

  const previewQuestions = useMemo(() => buildPreviewQuiz(requirement.policyId, readingSections), [requirement.policyId, readingSections]);

  const [initialDraft] = useState(() => readDraft(learnerId, assignmentId));
  const resumeIndex = useMemo(() => {
    const idx = (initialDraft?.resume as { sectionIndex?: number } | undefined)?.sectionIndex;
    return typeof idx === 'number' && idx >= 0 && idx < totalPages ? idx : null;
  }, [initialDraft, totalPages]);

  const [stage, setStage] = useState<'read' | 'preview-quiz' | 'preview-result'>('read');
  const [sectionIndex, setSectionIndex] = useState<number>(() => resumeIndex ?? 0);
  const [visited, setVisited] = useState<Set<number>>(() => {
    const arr = (initialDraft?.resume as { visited?: number[] } | undefined)?.visited;
    const seeded = Array.isArray(arr) ? arr.filter((n) => n >= 0 && n < readingSections.length) : [];
    return new Set(seeded.length ? seeded : [0]);
  });
  const [readAttested, setReadAttested] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'preview_only'>('idle');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, number>>({});
  const [previewQuestionIndex, setPreviewQuestionIndex] = useState(0);
  const [previewAttempt, setPreviewAttempt] = useState(1);
  const [mobileRailOpen, setMobileRailOpen] = useState(false);
  const [mobileLensOpen, setMobileLensOpen] = useState(false);
  const getActiveSeconds = useActiveTime();

  useEffect(() => {
    const existing = getOfficialEvidence().find((r) => r.assignmentId === assignmentId && r.completedAt);
    if (existing) {
      setSaveState('saved');
      setReadAttested(true);
    }
    // Only meant to seed initial state from whatever snapshot is already in memory.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  if (!policy || !readingSections.length) {
    return (
      <div className="v33-scope pv3-shell">
        <div className="pv3-unavailable">
          <BookOpenCheck size={34} />
          <span>{requirement.policyId}</span>
          <h1>Controlled policy body unavailable.</h1>
          <p>This policy remains mapped, but the application will not fabricate content.</p>
          <button onClick={onExit}><ArrowLeft size={16} /> Return to register</button>
        </div>
      </div>
    );
  }

  const readingComplete = readingSections.every((_, index) => visited.has(index));
  const onFormsPage = sectionIndex === formsPageIndex;
  const activeSection = !onFormsPage ? readingSections[Math.min(sectionIndex, readingSections.length - 1)] : null;
  const bankAvailable = hasAuthoredBank(requirement.courseId);

  const visit = (next: number) => {
    const bounded = Math.max(0, Math.min(totalPages - 1, next));
    setSectionIndex(bounded);
    setVisited((current) => {
      if (bounded >= readingSections.length) return current;
      const nextSet = current.has(bounded) ? current : new Set(current).add(bounded);
      writeDraft(learnerId, {
        assignmentId,
        resume: { sectionIndex: bounded, visited: [...nextSet] },
        attemptNumber: 1,
        progressPercent: Math.round((nextSet.size / readingSections.length) * 100),
        submittedLocally: false,
        updatedAt: new Date().toISOString(),
      });
      return nextSet;
    });
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
    setMobileRailOpen(false);
  };

  const saveReadingAttestation = async () => {
    setSaveState('saving');
    const readingSatisfied = readingComplete && readAttested;
    const payload = {
      schemaVersion: 2,
      assignmentId,
      learnerId,
      role: 'GB' as const,
      sourceId: requirement.policyId,
      sourceType: 'policy' as const,
      sourceVersion: requirement.policyVersion,
      effectiveDate: requirement.policyEffectiveDate,
      readCompletedAt: new Date().toISOString(),
      attestedAt: readAttested ? new Date().toISOString() : null,
      answersSnapshot: null,
      // Policy reading is UNSCORED: no score/threshold/scale, and the outcome
      // is 'completed' (not 'passed') when the reading+attestation gate holds.
      score: null,
      scoreMaximum: null,
      passThreshold: null,
      scoreScale: null,
      outcome: readingSatisfied ? ('completed' as const) : ('failed' as const),
      criticalErrors: [] as string[],
      attemptNumber: 1,
      remediationPath: 'none' as const,
      activeTimeSeconds: getActiveSeconds(),
      completedAt: readingSatisfied ? new Date().toISOString() : null,
    };
    const saved = await commitEvidence(assignmentId, { ...payload, integrityHash: integrityHash(payload) } as never, { authenticatedSubjectId: learnerId });
    if (saved.ok) {
      setSaveState('saved');
      setSaveMessage(null);
    } else {
      setSaveState('preview_only');
      setSaveMessage(saved.message);
    }
  };

  const currentPreviewQuestion = previewQuestions[Math.min(previewQuestionIndex, previewQuestions.length - 1)];
  const previewEarned = previewQuestions.filter((q) => previewAnswers[q.id] === q.correct).length;
  const previewScore = previewQuestions.length ? Math.round((previewEarned / previewQuestions.length) * 100) : 0;

  const retryPreview = () => {
    setPreviewAttempt((v) => v + 1);
    setPreviewAnswers({});
    setPreviewQuestionIndex(0);
    setStage('preview-quiz');
  };

  return (
    <div className="v33-scope pv3-shell">
      <header className="pv3-header">
        <button onClick={onExit} aria-label="Return to policy register"><ArrowLeft size={18} /></button>
        <div className="pv3-brand"><img src="/logo-careindeed-orange.png" alt="Care Indeed" /><span>GOVERNING BODY OFFICE</span></div>
        <div className="pv3-header-title"><small>{requirement.courseId} · EXECUTIVE POLICY BRIEF</small><strong>{requirement.policyTitle.replace(' (absent from generated library)', '')}</strong></div>
        <div className="pv3-mobile-toggles">
          <button onClick={() => setMobileRailOpen(true)} aria-label="Open policy contents"><Menu size={15} /> Contents</button>
          <button onClick={() => setMobileLensOpen(true)} aria-label="Open Board lens"><ShieldCheck size={15} /> Board lens</button>
        </div>
        <div className="pv3-record-state">
          <ShieldCheck size={15} />
          <span>{saveState === 'saved' ? 'READING & ATTESTATION RECORDED' : 'REQUIRED · READING + ATTESTATION'}</span>
        </div>
      </header>

      {stage === 'read' && (
        <main className="pv3-reading-layout">
          <PolicyContentsRail
            policyId={requirement.policyId}
            policyVersion={requirement.policyVersion}
            courseTitle={requirement.courseTitle}
            sections={readingSections}
            activeIndex={sectionIndex}
            visited={visited}
            resumeIndex={resumeIndex}
            formsPageIndex={formsPageIndex}
            onSelect={visit}
          />

          <article className="pv3-document">
            {!onFormsPage && activeSection ? (
              <>
                <header>
                  <div><span>{requirement.policyId} · {requirement.courseTitle}</span><h1>{cleanTitle(activeSection.title)}</h1></div>
                  <small>SECTION {String(sectionIndex + 1).padStart(2, '0')} / {String(readingSections.length).padStart(2, '0')}</small>
                </header>
                <PolicyBody section={activeSection} />

                {sectionIndex === readingSections.length - 1 && (
                  <section className="pv3-reading-gate">
                    <BadgeCheck size={23} />
                    <div>
                      <span>{readingComplete ? 'READING COMPLETE' : 'READING INCOMPLETE'}</span>
                      <strong>{readingComplete ? 'Attest below to record your reading.' : `${readingSections.length - visited.size} sections remain unread.`}</strong>
                      <p>This policy is assigned to your Governing Body role. Reading, attestation, and the course assessment are required for completion.</p>

                      <label className={`pv3-attestation ${readAttested ? 'selected' : ''}`}>
                        <input type="checkbox" checked={readAttested} disabled={!readingComplete || saveState === 'saved'} onChange={(event) => setReadAttested(event.target.checked)} />
                        <span>{readAttested && <Check size={13} />}</span>
                        <p><strong>Director attestation</strong>I completed this controlled reading in full.</p>
                      </label>

                      <div className="pv3-save-row">
                        <button
                          className="pv3-save-button"
                          disabled={!readingComplete || !readAttested || saveState === 'saving' || saveState === 'saved'}
                          onClick={() => void saveReadingAttestation()}
                        >
                          <ClipboardCheck size={14} /> {saveState === 'saved' ? 'Reading & attestation recorded' : saveState === 'saving' ? 'Saving…' : 'Save reading & attestation'}
                        </button>
                        {saveState === 'preview_only' && saveMessage && (
                          <p className="pv3-preview-banner"><FlaskConical size={13} /> {saveMessage}</p>
                        )}
                      </div>

                      <div className="pv3-course-context">
                        <span>COURSE ASSESSMENT · {requirement.courseId}</span>
                        <p>{bankAvailable
                          ? 'A reviewed question bank exists for this course. Complete it from My Compliance once every policy in this course is read and attested.'
                          : 'Question bank pending review — no course assessment is available for this course yet.'}</p>
                      </div>
                    </div>
                  </section>
                )}

                <footer>
                  <button disabled={sectionIndex === 0} onClick={() => visit(sectionIndex - 1)}><ArrowLeft size={15} /> Previous</button>
                  <span>{cleanTitle(activeSection.title)}</span>
                  <button className="primary" onClick={() => visit(sectionIndex + 1)}>
                    {sectionIndex < readingSections.length - 1 ? <>Continue <ArrowRight size={15} /></> : <>Related forms &amp; records <ArrowRight size={15} /></>}
                  </button>
                </footer>
              </>
            ) : (
              <>
                <header>
                  <div><span>{requirement.policyId} · {requirement.courseTitle}</span><h1>Related forms &amp; records</h1></div>
                  <small>PAGE {String(totalPages).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}</small>
                </header>
                <PolicyRelatedForms policyId={requirement.policyId} policyTitle={requirement.policyTitle.replace(' (absent from generated library)', '')} sections={allSections} />
                <footer>
                  <button onClick={() => visit(readingSections.length - 1)}><ArrowLeft size={15} /> Back to policy text</button>
                  <span />
                  {previewQuestions.length > 0 && (
                    <button className="primary" onClick={() => setStage('preview-quiz')}><FlaskConical size={15} /> Developer preview: knowledge check</button>
                  )}
                </footer>
              </>
            )}
          </article>

          <PolicyBoardLens requirement={requirement} sections={allSections} onJumpToForms={() => visit(formsPageIndex)} />

          {(mobileRailOpen || mobileLensOpen) && (
            <div className="pv3-mobile-backdrop" onClick={() => { setMobileRailOpen(false); setMobileLensOpen(false); }}>
              <div className={`pv3-mobile-drawer ${mobileRailOpen ? 'pv3-mobile-drawer-rail' : 'pv3-mobile-drawer-lens'}`} onClick={(e) => e.stopPropagation()}>
                <button className="pv3-mobile-drawer-close" onClick={() => { setMobileRailOpen(false); setMobileLensOpen(false); }} aria-label="Close"><X size={16} /></button>
                {mobileRailOpen && (
                  <PolicyContentsRail
                    policyId={requirement.policyId}
                    policyVersion={requirement.policyVersion}
                    courseTitle={requirement.courseTitle}
                    sections={readingSections}
                    activeIndex={sectionIndex}
                    visited={visited}
                    resumeIndex={resumeIndex}
                    formsPageIndex={formsPageIndex}
                    onSelect={visit}
                  />
                )}
                {mobileLensOpen && (
                  <PolicyBoardLens requirement={requirement} sections={allSections} onJumpToForms={() => { visit(formsPageIndex); setMobileLensOpen(false); }} />
                )}
              </div>
            </div>
          )}
        </main>
      )}

      {stage === 'preview-quiz' && (
        <main className="pv3-quiz-stage">
          <section className="pv3-quiz-card">
            <header>
              <div>
                <span><FlaskConical size={13} /> DEVELOPER PREVIEW · NOT OFFICIAL CREDIT · {requirement.policyId}</span>
                <h1>Exercise judgment against the controlled text.</h1>
                <p>Auto-generated from the controlled sections above, for self-check only. This never creates a compliance record. Official course credit is scored separately in your Course Assessment, using a reviewed question bank.</p>
              </div>
            </header>
            <div className="pv3-question-progress">
              <span>ITEM {String(previewQuestionIndex + 1).padStart(2, '0')} OF {String(previewQuestions.length).padStart(2, '0')}</span>
              <i>{previewQuestions.map((q, index) => <b key={q.id} className={index < previewQuestionIndex || previewAnswers[q.id] !== undefined ? 'complete' : index === previewQuestionIndex ? 'active' : ''} />)}</i>
            </div>
            <fieldset>
              <legend>{currentPreviewQuestion?.prompt}</legend>
              <div>
                {currentPreviewQuestion?.answers.map((answer, index) => (
                  <label key={`${currentPreviewQuestion.id}-${index}`} className={previewAnswers[currentPreviewQuestion.id] === index ? 'selected' : ''}>
                    <input type="radio" name={currentPreviewQuestion.id} checked={previewAnswers[currentPreviewQuestion.id] === index} onChange={() => setPreviewAnswers((current) => ({ ...current, [currentPreviewQuestion.id]: index }))} />
                    <span>{String.fromCharCode(65 + index)}</span>
                    <p>{answer}</p>
                  </label>
                ))}
              </div>
            </fieldset>
            <footer>
              <button onClick={() => (previewQuestionIndex === 0 ? setStage('read') : setPreviewQuestionIndex((v) => v - 1))}><ArrowLeft size={15} /> {previewQuestionIndex === 0 ? 'Return to policy' : 'Previous item'}</button>
              {previewQuestionIndex < previewQuestions.length - 1 ? (
                <button className="primary" disabled={!currentPreviewQuestion || previewAnswers[currentPreviewQuestion.id] === undefined} onClick={() => setPreviewQuestionIndex((v) => v + 1)}>Next item <ArrowRight size={15} /></button>
              ) : (
                <button className="primary" disabled={!currentPreviewQuestion || previewAnswers[currentPreviewQuestion.id] === undefined} onClick={() => setStage('preview-result')}>See preview results <ArrowRight size={15} /></button>
              )}
            </footer>
          </section>
        </main>
      )}

      {stage === 'preview-result' && (
        <main className="pv3-result-stage">
          <section className="pv3-result">
            <header>
              <div className="pv3-score"><strong>{previewScore}%</strong><span>PREVIEW SCORE</span></div>
              <div>
                <span>DEVELOPER PREVIEW · ATTEMPT {previewAttempt} · {previewEarned}/{previewQuestions.length} SUPPORTED</span>
                <h1>Self-check only — not a compliance record.</h1>
                <p>This preview never saves an evidence record and is not required. Your real reading &amp; attestation record is saved from the policy reading gate; your real score comes from the Course Assessment.</p>
              </div>
            </header>
            <div className="pv3-result-list">
              {previewQuestions.map((question, index) => {
                const correct = previewAnswers[question.id] === question.correct;
                return (
                  <article key={question.id} className={correct ? 'correct' : 'missed'}>
                    <span>{correct ? <CheckCircle2 size={18} /> : <Scale size={18} />}</span>
                    <div>
                      <small>ITEM {String(index + 1).padStart(2, '0')} · {question.sourceTitle}</small>
                      <strong>{correct ? 'Defensible conclusion' : 'Controlling text'}</strong>
                      {!correct && <p><b>Your selection:</b> {question.answers[previewAnswers[question.id]]}</p>}
                      <p><b>Source rule:</b> {question.controllingRule}</p>
                    </div>
                  </article>
                );
              })}
            </div>
            <footer>
              <button onClick={() => setStage('read')}><BookOpenCheck size={15} /> Return to policy</button>
              <button className="primary" onClick={retryPreview}><RotateCcw size={15} /> Try again</button>
            </footer>
          </section>
        </main>
      )}
    </div>
  );
}
