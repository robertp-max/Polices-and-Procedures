import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  Clock3,
  FileCheck2,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  GovernanceApi,
  type AcademyAttemptView,
  type GovernanceApiError,
  type PublicAcademyModule,
} from './governanceApi';

// The "-cards-fixed-v27.png" repair images were byte-identical duplicates of the canonical
// scene files and were removed during ZIP integration (65 canonical scenes preserved), so
// every scene resolves to its canonical "<sceneId>.png" which is present on disk.
function sceneImage(moduleId: string, sceneId: string): string {
  return `/gb-visuals/scenes/${moduleId.toLowerCase()}/${sceneId}.png`;
}

function readableTask(taskId: string): string {
  return taskId
    .replace(/^gb-\d+-/, '')
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isAbort(reason: unknown): boolean {
  return reason instanceof DOMException && reason.name === 'AbortError';
}

export function GovernanceAcademyPlayer() {
  const navigate = useNavigate();
  const { moduleId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('assignment');
  const [module, setModule] = useState<PublicAcademyModule | null>(null);
  const [attempt, setAttempt] = useState<AcademyAttemptView | null>(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [error, setError] = useState<GovernanceApiError | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const attemptRef = useRef<AcademyAttemptView | null>(null);
  const mutationInFlight = useRef(false);
  const lastActivityAt = useRef(Date.now());

  useEffect(() => {
    attemptRef.current = attempt;
  }, [attempt]);

  useEffect(() => {
    const controller = new AbortController();
    setError(null);
    setAttempt(null);
    setSceneIndex(0);
    const load = assignmentId
      ? GovernanceApi.startAcademyAttempt(assignmentId, `academy-start:${assignmentId}`)
          .then((result) => {
            setModule(result.module);
            setAttempt(result.attempt);
          })
      : GovernanceApi.academyModule(moduleId, controller.signal).then(setModule);
    load.catch((reason: GovernanceApiError) => {
      if (!isAbort(reason)) setError(reason);
    });
    return () => controller.abort();
  }, [assignmentId, moduleId]);

  useEffect(() => {
    const activity = () => { lastActivityAt.current = Date.now(); };
    const events: Array<keyof WindowEventMap> = ['keydown', 'pointerdown', 'pointermove', 'scroll'];
    events.forEach((event) => window.addEventListener(event, activity, { passive: true }));
    return () => events.forEach((event) => window.removeEventListener(event, activity));
  }, []);

  const attemptId = attempt?.id;
  const attemptStatus = attempt?.status;

  useEffect(() => {
    if (!attemptId || attemptStatus !== 'in_progress') return undefined;
    const controller = new AbortController();
    const timer = window.setInterval(() => {
      const current = attemptRef.current;
      if (!current || mutationInFlight.current || current.status !== 'in_progress') return;
      mutationInFlight.current = true;
      GovernanceApi.academyHeartbeat({
        attemptId: current.id,
        expectedVersion: current.version,
        visible: document.visibilityState === 'visible',
        focused: document.hasFocus(),
        recentActivity: Date.now() - lastActivityAt.current < 90_000,
      }, controller.signal)
        .then((nextAttempt) => setAttempt(nextAttempt))
        .catch((reason: GovernanceApiError) => {
          if (!isAbort(reason) && reason.status !== 409) setNotice(reason.message);
        })
        .finally(() => { mutationInFlight.current = false; });
    }, 30_000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [attemptId, attemptStatus]);

  const scene = module?.sceneBriefs[sceneIndex] ?? null;
  const question = module?.questions.find((candidate) => candidate.stageId === scene?.id) ?? null;
  const taskIds = module?.executableTaskIds ?? [];
  const nextTask = attempt ? taskIds[attempt.taskEventIds.length] ?? null : null;
  const progress = module && attempt
    ? Math.round((attempt.completedStageIds.length / module.requiredStageIds.length) * 100)
    : 0;
  const resultLabel = useMemo(() => {
    if (!attempt || attempt.passed === null) return null;
    return attempt.passed ? 'Standard met' : 'Remediation required';
  }, [attempt]);

  const answerQuestion = async () => {
    if (!attempt || !question || !scene || !selectedAnswer || mutationInFlight.current) return;
    setBusy(true);
    setNotice(null);
    mutationInFlight.current = true;
    try {
      const result = await GovernanceApi.answerAcademyQuestion({
        attemptId: attempt.id,
        expectedVersion: attempt.version,
        stageId: scene.id,
        questionId: question.id,
        answerId: selectedAnswer,
      });
      setAttempt(result.attempt);
      setSelectedAnswer(null);
      setNotice('Response sealed to the server-side attempt record. Correctness remains undisclosed until submission.');
    } catch (reason) {
      setError(reason as GovernanceApiError);
    } finally {
      mutationInFlight.current = false;
      setBusy(false);
    }
  };

  const completeTask = async () => {
    if (!attempt || !scene || !nextTask || mutationInFlight.current) return;
    setBusy(true);
    setNotice(null);
    mutationInFlight.current = true;
    try {
      const result = await GovernanceApi.academyTask({
        attemptId: attempt.id,
        expectedVersion: attempt.version,
        stageId: scene.id,
        taskId: nextTask,
        eventType: 'learner_executed',
        payload: { acknowledged: true, scene: scene.id },
      });
      setAttempt(result.attempt);
      setNotice(`${readableTask(nextTask)} recorded. The server controls task order and completion evidence.`);
    } catch (reason) {
      setError(reason as GovernanceApiError);
    } finally {
      mutationInFlight.current = false;
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!attempt || mutationInFlight.current) return;
    setBusy(true);
    setNotice(null);
    mutationInFlight.current = true;
    try {
      const result = await GovernanceApi.submitAcademy({ attemptId: attempt.id, expectedVersion: attempt.version });
      setAttempt(result.attempt);
      setNotice(result.evidence
        ? `Completion evidence sealed: ${result.evidence.evidenceSha256.slice(0, 16)}…`
        : 'The server returned a remediation result. No completion evidence was issued.');
    } catch (reason) {
      setError(reason as GovernanceApiError);
    } finally {
      mutationInFlight.current = false;
      setBusy(false);
    }
  };

  if (error && !module) {
    return (
      <main className="gb-player gb-player--centered">
        <section className="gb-player-error" role="alert">
          <LockKeyhole aria-hidden="true" />
          <p className="gb-eyebrow">Governance Institute</p>
          <h1>This case cannot be opened.</h1>
          <p>{error.message}</p>
          <button type="button" onClick={() => navigate('/governance/academy')}>Return to the Institute</button>
        </section>
      </main>
    );
  }

  if (!module || !scene) {
    return <main className="gb-player gb-player--centered"><p role="status">Opening the controlled case record…</p></main>;
  }

  return (
    <main className="gb-player">
      <header className="gb-player-header">
        <button className="gb-icon-button" type="button" onClick={() => navigate('/governance/academy')} aria-label="Return to Governance Institute">
          <ArrowLeft aria-hidden="true" />
        </button>
        <img src="/logo-careindeed-orange.png" alt="Care Indeed" />
        <div className="gb-player-header-title">
          <span>{module.id} · Case {String(module.sequence).padStart(2, '0')}</span>
          <strong>{module.shortTitle}</strong>
        </div>
        <div className="gb-player-status">
          <span><Clock3 aria-hidden="true" /> {attempt ? `${Math.floor(attempt.activeSeconds / 60)} active min` : `${module.durationMinutes} min`}</span>
          <span><ShieldCheck aria-hidden="true" /> {attempt ? 'Server record active' : 'Syllabus preview'}</span>
        </div>
      </header>

      <div className="gb-player-layout">
        <aside className="gb-player-rail" aria-label="Case scenes">
          <p className="gb-eyebrow">Five-part case</p>
          <h1>{module.title}</h1>
          <p className="gb-player-domain">{module.domain}</p>
          <ol>
            {module.sceneBriefs.map((candidate, index) => {
              const complete = attempt?.completedStageIds.includes(candidate.id) ?? false;
              return (
                <li key={candidate.id}>
                  <button type="button" className={index === sceneIndex ? 'is-active' : ''} onClick={() => { setSceneIndex(index); setSelectedAnswer(null); setNotice(null); }}>
                    <span>{complete ? <Check aria-hidden="true" /> : String(index + 1).padStart(2, '0')}</span>
                    {candidate.title}
                  </button>
                </li>
              );
            })}
          </ol>
          {attempt && (
            <div className="gb-player-progress" aria-label={`${progress}% of required stages recorded`}>
              <span style={{ width: `${progress}%` }} />
              <small>{progress}% stage record</small>
            </div>
          )}
          <p className="gb-player-version">Content {module.contentVersion}<br />Policy set {module.policyVersionIds.join(' · ')}</p>
        </aside>

        <section className="gb-player-stage">
          <div className="gb-scene-visual">
            <img src={sceneImage(module.id, scene.id)} alt={`${module.shortTitle}: ${scene.title}`} />
            <span>{String(sceneIndex + 1).padStart(2, '0')} / 05</span>
          </div>
          <article className="gb-scene-brief">
            <p className="gb-eyebrow">{scene.title}</p>
            <h2>{scene.body}</h2>
            <p>The Board record must preserve authority, source lineage, the decision path, and the evidence required to revisit effectiveness.</p>
          </article>

          {question && attempt && attempt.status === 'in_progress' && (
            <fieldset className="gb-question">
              <legend>{question.prompt}</legend>
              <p>Choose the most defensible answer. The server withholds correctness until formal submission.</p>
              {question.answers.map((answer) => (
                <label key={answer.id} className={selectedAnswer === answer.id ? 'is-selected' : ''}>
                  <input type="radio" name={question.id} value={answer.id} checked={selectedAnswer === answer.id} onChange={() => setSelectedAnswer(answer.id)} />
                  <span>{answer.text}</span>
                </label>
              ))}
              <button type="button" disabled={!selectedAnswer || busy} onClick={answerQuestion}>Seal response</button>
            </fieldset>
          )}

          {attempt && attempt.status === 'in_progress' && nextTask && scene.id === 'field-guide' && (
            <section className="gb-executable-task">
              <FileCheck2 aria-hidden="true" />
              <div>
                <p className="gb-eyebrow">Executable record task {attempt.taskEventIds.length + 1} of {taskIds.length}</p>
                <h3>{readableTask(nextTask)}</h3>
                <p>This event is written to the attempt record. For GB-003, the server enforces the complete notice-to-minutes sequence.</p>
              </div>
              <button type="button" disabled={busy} onClick={completeTask}>Execute task</button>
            </section>
          )}

          {notice && <p className="gb-player-notice" role="status">{notice}</p>}
          {error && module && <p className="gb-player-notice gb-player-notice--error" role="alert">{error.message}</p>}

          {resultLabel && attempt && (
            <section className={`gb-result ${attempt.passed ? 'is-pass' : 'is-remediation'}`}>
              <BookOpenCheck aria-hidden="true" />
              <div><p className="gb-eyebrow">Server-assessed result</p><h3>{resultLabel}</h3><p>Score {attempt.score}% · Active time {Math.floor(attempt.activeSeconds / 60)} minutes · Critical error {attempt.criticalError ? 'recorded' : 'none'}</p></div>
            </section>
          )}

          <footer className="gb-player-controls">
            <button type="button" disabled={sceneIndex === 0} onClick={() => { setSceneIndex((value) => value - 1); setSelectedAnswer(null); }}><ArrowLeft aria-hidden="true" /> Previous</button>
            {sceneIndex < module.sceneBriefs.length - 1 ? (
              <button type="button" onClick={() => { setSceneIndex((value) => value + 1); setSelectedAnswer(null); }}>Next scene <ArrowRight aria-hidden="true" /></button>
            ) : attempt && attempt.status === 'in_progress' ? (
              <button type="button" disabled={busy} onClick={submit}>Submit for server assessment <ShieldCheck aria-hidden="true" /></button>
            ) : (
              <button type="button" onClick={() => navigate('/governance/academy')}>Return to Institute <ArrowRight aria-hidden="true" /></button>
            )}
          </footer>
        </section>
      </div>
    </main>
  );
}
