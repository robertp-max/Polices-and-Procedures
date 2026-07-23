
import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpenCheck, Check, CheckCircle2, FileCheck2, RotateCcw, ShieldCheck, Target } from 'lucide-react';
import { allPoliciesContent } from './allPoliciesContent.generated';
import type { PolicyActivity, PolicyContentSection } from '../types';

function cleanTitle(title: string) {
  return title.replace(/\\\./g, '.').replace(/^\d+(?:\.\d+)*\.?\s*/, '').trim();
}

function tableRows(body: string) {
  const lines = body.split('\n').map((line) => line.trim()).filter((line) => line.startsWith('|'));
  if (lines.length < 2) return null;
  const rows = lines
    .filter((line) => !/^\|?\s*:?-{3,}/.test(line))
    .map((line) => line.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()));
  return rows.length ? rows : null;
}

function PolicyBody({ section }: { section: PolicyContentSection }) {
  const rows = tableRows(section.body);
  if (rows) return <div className="pp-table-wrap"><table><thead><tr>{rows[0].map((cell, index) => <th key={`${cell}-${index}`}>{cell}</th>)}</tr></thead><tbody>{rows.slice(1).map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, index) => <td key={`${index}-${cell.slice(0, 20)}`}>{cell}</td>)}</tr>)}</tbody></table></div>;
  const paragraphs = section.body.split(/\n\s*\n/).map((text) => text.replace(/^---$\n?|\n?---$/g, '').trim()).filter(Boolean);
  if (!paragraphs.length) return <p className="pp-empty">Continue to the next policy section.</p>;
  return <div className="pp-prose">{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>;
}

type QuizQuestion = {
  id: string;
  prompt: string;
  answers: string[];
  correct: number;
  sourceTitle: string;
  remediation: string;
};

function buildQuiz(policyId: string, sections: PolicyContentSection[]): QuizQuestion[] {
  const candidates = sections.flatMap((section) => section.body
    .replace(/\|/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((text) => ({ section, text: text.replace(/\s+/g, ' ').replace(/^---|---$/g, '').trim() })))
    .filter(({ text }) => text.length >= 80 && text.length <= 420 && /\b(shall|must|required|prohibited|within|before)\b/i.test(text));
  const selected = Array.from({ length: Math.min(5, candidates.length) }, (_, index) => candidates[Math.floor((index * candidates.length) / Math.min(5, candidates.length))]);

  if (!selected.length) {
    return [{
      id: `${policyId}-identity`,
      prompt: `Which controlled identity must remain bound to this learning record?`,
      answers: [policyId, 'The learner job title only', 'The current library category', 'The most recent policy viewed'],
      correct: 0,
      sourceTitle: 'Policy Header',
      remediation: `The completion record must preserve the controlled policy identity ${policyId}.`,
    }];
  }

  return selected.map(({ section, text }, index) => {
    const softened = text.replace(/\bshall\b/gi, 'may').replace(/\bmust\b/gi, 'may').replace(/\brequired\b/gi, 'recommended');
    const deferred = text.replace(/\bwithin\s+\d+\s+(calendar\s+|business\s+)?(hours?|days?|weeks?|months?)\b/gi, 'at the next annual review').replace(/\bbefore\b/gi, 'after');
    const unrecorded = 'The responsible party may use verbal confirmation instead of the required controlled documentation when the operational outcome appears correct.';
    const options = Array.from(new Set([text, softened === text ? `Management may treat this requirement as discretionary when workload is high: ${text}` : softened, deferred === text ? `This action may be deferred until the next routine review: ${text}` : deferred, unrecorded])).slice(0, 4);
    while (options.length < 4) options.push(`A prior completion from another policy version automatically satisfies this requirement without a new record.`);
    const rotation = (policyId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) + index) % 4;
    const answers = [...options.slice(rotation), ...options.slice(0, rotation)];
    return {
      id: `${policyId}-q${index + 1}`,
      prompt: `Which statement is expressly supported by “${cleanTitle(section.title)}”?`,
      answers,
      correct: answers.indexOf(text),
      sourceTitle: cleanTitle(section.title),
      remediation: text,
    };
  });
}

export default function PolicyLearningPlayer({ activity, onExit }: { activity: PolicyActivity; onExit: () => void }) {
  const policy = useMemo(() => allPoliciesContent.find((item) => item.policyId === activity.policyId), [activity.policyId]);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [visitedSections, setVisitedSections] = useState<Set<number>>(() => new Set([0]));
  const [mode, setMode] = useState<'read' | 'quiz' | 'result'>('read');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [attested, setAttested] = useState(false);
  const [attempt, setAttempt] = useState(1);
  const sections = useMemo(() => policy ? [...policy.sections].sort((a, b) => a.order - b.order) : [], [policy]);
  const questions = useMemo(() => buildQuiz(activity.policyId, sections), [activity.policyId, sections]);

  if (!policy) return <div className="pp-player pp-unavailable"><div className="pp-unavailable-card"><BookOpenCheck size={32} /><span>POLICY LIBRARY · {activity.policyId}</span><h1>Controlled policy content is not connected.</h1><p>The requirement remains mapped and reportable, but this preview cannot fabricate a policy body.</p><button onClick={onExit}><ArrowLeft size={17} /> Return to myJourney</button></div></div>;

  const active = sections[Math.min(sectionIndex, sections.length - 1)];
  const majorSections = sections.filter((section) => section.level <= 2 && cleanTitle(section.title) !== cleanTitle(sections[0].title));
  const progress = Math.round((visitedSections.size / sections.length) * 100);
  const metadata = tableRows(sections.find((section) => /policy header/i.test(section.title))?.body || '')?.slice(1) || [];
  const atEnd = sectionIndex === sections.length - 1;
  const earned = questions.filter((question) => answers[question.id] === question.correct).length;
  const score = Math.round((earned / questions.length) * 100);
  const passed = score >= activity.passScore;
  const answeredAll = questions.every((question) => answers[question.id] !== undefined);
  const readingComplete = visitedSections.size === sections.length;

  const visit = (next: number) => {
    const bounded = Math.max(0, Math.min(sections.length - 1, next));
    setSectionIndex(bounded);
    setVisitedSections((current) => new Set([...current, bounded]));
  };

  const selectMajor = (id: string) => {
    const next = sections.findIndex((section) => section.id === id);
    if (next >= 0) visit(next);
  };

  return <div className="pp-player">
    <header className="pp-titlebar">
      <button className="pp-back" onClick={onExit} aria-label="Return to myJourney"><ArrowLeft size={18} /></button>
      <div><span>{activity.courseTitle || 'POLICY LIBRARY'} · {activity.policyId}</span><h1>{activity.title}</h1></div>
      <span className="pp-library-chip"><BookOpenCheck size={15} /> CONTROLLED LESSON</span>
    </header>

    <nav className="pp-section-nav" aria-label="Policy sections">
      {majorSections.map((section) => <button key={section.id} className={active.id === section.id || (section.order <= active.order && !majorSections.some((candidate) => candidate.order > section.order && candidate.order <= active.order)) ? 'active' : ''} onClick={() => selectMajor(section.id)}>{cleanTitle(section.title)}</button>)}
    </nav>

    <main className="pp-canvas">
      <section className="pp-progress-band"><div><span>SECTIONS VISITED</span><strong>{progress}%</strong></div><div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><i style={{ width: `${progress}%` }} /></div><small>Read · quiz · attest · evidence</small></section>

      {mode === 'read' && <article className="pp-page-card">
        <header><div><span>{sectionIndex === 0 ? 'POLICY OVERVIEW' : cleanTitle(active.title).toUpperCase()}</span><h2>{cleanTitle(active.title)}</h2></div><span>SECTION {sectionIndex + 1}</span></header>
        {sectionIndex === 0 && metadata.length > 0 && <div className="pp-overview-copy"><PolicyBody section={active} /><div className="pp-meta-grid">{metadata.slice(0, 8).map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></div>}
        {sectionIndex !== 0 && <PolicyBody section={active} />}

        {atEnd && <section className="pp-completion-gate"><ShieldCheck size={24} /><div><span>{readingComplete ? 'POLICY READING COMPLETE' : 'READING CHECKPOINT'}</span><h3>{readingComplete ? 'The knowledge check is unlocked.' : `${sections.length - visitedSections.size} policy section${sections.length - visitedSections.size === 1 ? '' : 's'} remain.`}</h3><p>The production adapter records policy version, effective date, learner identity, read completion, course-quiz score, attestation, attempts, and remediation. Previewing this page creates no completion record.</p></div><div><small>{activity.passScore}% pass</small><strong>{questions.length} difficult source-linked items</strong><span><FileCheck2 size={14} /> Attestation required</span></div></section>}

        <footer className="pp-page-footer">
          <button className="pp-prev" disabled={sectionIndex === 0} onClick={() => visit(sectionIndex - 1)}><ArrowLeft size={16} /> Previous</button>
          <span>{sectionIndex + 1} OF {sections.length}</span>
          {!atEnd ? <button className="pp-next" onClick={() => visit(sectionIndex + 1)}>Next <ArrowRight size={16} /></button> : <button className="pp-next" disabled={!readingComplete} onClick={() => setMode('quiz')}><Target size={16} /> {readingComplete ? 'Begin quiz' : 'Visit all sections'}</button>}
        </footer>
      </article>}

      {mode === 'quiz' && <article className="pp-quiz-card">
        <header><div><span>CONTROLLED POLICY KNOWLEDGE CHECK · ATTEMPT {attempt}</span><h2>Defend the policy under pressure.</h2><p>Select the one answer supported by the controlled text. Plausible operational shortcuts are intentionally included.</p></div><div><strong>{activity.passScore}%</strong><span>PASS STANDARD</span></div></header>
        <div className="pp-quiz-list">{questions.map((question, index) => <fieldset key={question.id}><legend><span>{String(index + 1).padStart(2, '0')}</span>{question.prompt}</legend><div>{question.answers.map((answer, answerIndex) => <label key={`${question.id}-${answerIndex}`} className={answers[question.id] === answerIndex ? 'selected' : ''}><input type="radio" name={question.id} checked={answers[question.id] === answerIndex} onChange={() => setAnswers((current) => ({ ...current, [question.id]: answerIndex }))} /><span className="pp-radio">{answers[question.id] === answerIndex && <Check size={14} />}</span><p>{answer}</p></label>)}</div></fieldset>)}</div>
        <label className={`pp-attestation ${attested ? 'selected' : ''}`}><input type="checkbox" checked={attested} onChange={(event) => setAttested(event.target.checked)} /><span>{attested && <Check size={14} />}</span><p><strong>Learner attestation</strong>I completed the controlled reading and answered this knowledge check without assistance. The production record must bind my identity, the policy version, effective date, answers, score, attempt, and completion time.</p></label>
        <footer className="pp-quiz-footer"><button className="pp-prev" onClick={() => setMode('read')}><ArrowLeft size={16} /> Review policy</button><span>{Object.keys(answers).length} of {questions.length} answered · attestation {attested ? 'complete' : 'required'}</span><button className="pp-next" disabled={!answeredAll || !attested} onClick={() => setMode('result')}>Lock answers <ArrowRight size={16} /></button></footer>
      </article>}

      {mode === 'result' && <article className={`pp-result-card ${passed ? 'passed' : 'remediation'}`}>
        <header><div className="pp-score-orbit"><strong>{score}%</strong><span>PREVIEW</span></div><div><span>PREVIEW RESULT · NO LMS CREDIT · LOCAL ATTEMPT {attempt} · {earned}/{questions.length} CORRECT</span><h2>{passed ? 'Practice threshold met.' : 'Practice remediation recommended.'}</h2><p>{passed ? 'This source-derived preview creates no completion, mastery, attestation, or employee training record. Official scoring remains disabled until an approved question bank and identity/version-bound evidence adapter are connected.' : `This local preview did not meet the ${activity.passScore}% practice threshold. Review each missed item against its controlling section, then retry; no official attempt was recorded.`}</p></div></header>
        <section className="pp-remediation-list"><div><span>SOURCE-LINKED REMEDIATION</span><h3>{passed ? 'Why the answers hold' : 'Repair every missed inference'}</h3></div>{questions.map((question, index) => {
          const correct = answers[question.id] === question.correct;
          return <article key={question.id} className={correct ? 'correct' : 'missed'}><span>{correct ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}</span><div><small>ITEM {index + 1} · {question.sourceTitle}</small><strong>{correct ? 'Supported conclusion' : 'Return to the controlling text'}</strong>{!correct && <p className="pp-selected-answer"><b>Your selection:</b> {question.answers[answers[question.id]]}</p>}<p><b>Controlling rule:</b> {question.remediation}</p></div></article>;
        })}</section>
        <footer className="pp-result-footer"><button className="pp-prev" onClick={() => { setMode('read'); visit(0); }}><BookOpenCheck size={16} /> Reopen policy</button>{passed ? <button className="pp-next" onClick={onExit}><CheckCircle2 size={16} /> Return to journey</button> : <button className="pp-next" onClick={() => { setAttempt((value) => value + 1); setAnswers({}); setAttested(false); setMode('quiz'); }}><RotateCcw size={16} /> Remediate & retry</button>}</footer>
      </article>}
    </main>
  </div>;
}
