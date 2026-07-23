
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Check,
  CheckCircle2,
  FileCheck2,
  RotateCcw,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import type { PolicyJourneyRequirement } from '../generated/policyJourney.types';
import type { PolicyContentSection } from '../types';
import { governingBodyPolicyContentMap } from './governingBodyPolicyContent';

function cleanTitle(title: string) {
  return title.replace(/\\\./g, '.').replace(/^\d+(?:\.\d+)*\.?\s*/, '').trim();
}

function tableRows(body: string) {
  const lines = body.split('\n').map((line) => line.trim()).filter((line) => line.startsWith('|'));
  if (lines.length < 2) return null;
  return lines
    .filter((line) => !/^\|?\s*:?-{3,}/.test(line))
    .map((line) => line.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()));
}

function PolicyBody({ section }: { section: PolicyContentSection }) {
  const rows = tableRows(section.body);
  if (rows?.length) return <div className="gbp-table-wrap"><table><thead><tr>{rows[0].map((cell, index) => <th key={`${cell}-${index}`}>{cell}</th>)}</tr></thead><tbody>{rows.slice(1).map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, index) => <td key={`${rowIndex}-${index}`}>{cell}</td>)}</tr>)}</tbody></table></div>;
  const paragraphs = section.body.split(/\n\s*\n/).map((value) => value.replace(/^---$|^---\n|\n---$/g, '').trim()).filter(Boolean);
  return <div className="gbp-prose">{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>;
}

type ExecutiveQuestion = {
  id: string;
  prompt: string;
  answers: string[];
  correct: number;
  sourceTitle: string;
  controllingRule: string;
};

function sentenceCandidates(sections: PolicyContentSection[]) {
  return sections.flatMap((section) => section.body
    .replace(/\|/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((value) => ({ section, value: value.replace(/\s+/g, ' ').replace(/^---|---$/g, '').trim() })))
    .filter(({ value }) => value.length >= 70 && value.length <= 440 && /\b(shall|must|required|prohibited|within|before|approval)\b/i.test(value));
}

function buildExecutiveQuiz(policyId: string, sections: PolicyContentSection[]): ExecutiveQuestion[] {
  const candidates = sentenceCandidates(sections);
  const count = Math.min(5, Math.max(1, candidates.length));
  if (!candidates.length) {
    return [{
      id: `${policyId}-identity`,
      prompt: 'Which identity must remain bound to the Governing Body learning record?',
      answers: [policyId, 'The current meeting quarter only', 'The director’s title only', 'The latest page viewed'],
      correct: 0,
      sourceTitle: 'Controlled identity',
      controllingRule: `The evidence record must preserve the controlled policy identity ${policyId}.`,
    }];
  }
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
      id: `${policyId}-executive-${index + 1}`,
      prompt: `The Board is acting under “${cleanTitle(section.title)}.” Which direction is defensible?`,
      answers,
      correct: answers.indexOf(value),
      sourceTitle: cleanTitle(section.title),
      controllingRule: value,
    };
  });
}

export default function GoverningBodyPolicyPlayer({ requirement, onExit }: { requirement: PolicyJourneyRequirement; onExit: () => void }) {
  const policy = governingBodyPolicyContentMap.get(requirement.policyId);
  const sections = useMemo(() => [...(policy?.sections ?? [])].sort((a, b) => a.order - b.order), [policy]);
  const questions = useMemo(() => buildExecutiveQuiz(requirement.policyId, sections), [requirement.policyId, sections]);
  const [mode, setMode] = useState<'read' | 'quiz' | 'result'>('read');
  const [sectionIndex, setSectionIndex] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [attested, setAttested] = useState(false);
  const [attempt, setAttempt] = useState(1);

  if (!policy || !sections.length) return <div className="gbp-shell"><div className="gbp-unavailable"><BookOpenCheck size={34} /><span>{requirement.policyId}</span><h1>Controlled policy body unavailable.</h1><p>This policy remains mapped, but the application will not fabricate content.</p><button onClick={onExit}><ArrowLeft size={16} /> Return to register</button></div></div>;

  const activeSection = sections[Math.min(sectionIndex, sections.length - 1)];
  const currentQuestion = questions[Math.min(questionIndex, questions.length - 1)];
  const readPercent = Math.round((visited.size / sections.length) * 100);
  const readingComplete = visited.size === sections.length;
  const earned = questions.filter((question) => answers[question.id] === question.correct).length;
  const score = Math.round((earned / questions.length) * 100);
  const passed = score >= requirement.evidenceRequirements.passScorePercent;

  const visit = (next: number) => {
    const bounded = Math.max(0, Math.min(sections.length - 1, next));
    setSectionIndex(bounded);
    setVisited((current) => new Set([...current, bounded]));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const retry = () => {
    setAttempt((value) => value + 1);
    setAnswers({});
    setAttested(false);
    setQuestionIndex(0);
    setMode('quiz');
  };

  return <div className="gbp-shell">
    <header className="gbp-header">
      <button onClick={onExit} aria-label="Return to policy register"><ArrowLeft size={18} /></button>
      <div className="gbp-brand"><img src="/logo-careindeed-orange.png" alt="Care Indeed" /><span>GOVERNING BODY OFFICE</span></div>
      <div className="gbp-header-title"><small>{requirement.courseId} · EXECUTIVE POLICY BRIEF</small><strong>{requirement.policyTitle.replace(' (absent from generated library)', '')}</strong></div>
      <div className="gbp-record-state"><ShieldCheck size={15} /><span>PRACTICE · NO LMS CREDIT</span></div>
    </header>

    {mode === 'read' && <main className="gbp-reading-layout">
      <aside className="gbp-index">
        <div><span>CONTROLLED READING</span><strong>{requirement.policyId}</strong><small>{requirement.policyVersion ? `Version ${requirement.policyVersion}` : 'Source-restored v6.0'}</small></div>
        <nav aria-label="Policy section index">{sections.map((section, index) => <button key={section.id} className={sectionIndex === index ? 'active' : visited.has(index) ? 'visited' : ''} onClick={() => visit(index)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{cleanTitle(section.title)}</strong>{visited.has(index) && <Check size={12} />}</button>)}</nav>
        <footer><div><span>READING PROGRESS</span><strong>{readPercent}%</strong></div><i><b style={{ width: `${readPercent}%` }} /></i><small>{visited.size} of {sections.length} sections visited</small></footer>
      </aside>

      <article className="gbp-document">
        <header><div><span>{requirement.policyId} · {requirement.courseTitle}</span><h1>{cleanTitle(activeSection.title)}</h1></div><small>SECTION {String(sectionIndex + 1).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}</small></header>
        <PolicyBody section={activeSection} />
        {sectionIndex === sections.length - 1 && <section className="gbp-reading-gate"><BadgeCheck size={23} /><div><span>{readingComplete ? 'READING COMPLETE' : 'READING INCOMPLETE'}</span><strong>{readingComplete ? 'The executive knowledge check is available.' : `${sections.length - visited.size} sections remain unread.`}</strong><p>The practice result is source-linked but does not create an official completion, attestation, or training record.</p></div></section>}
        <footer><button disabled={sectionIndex === 0} onClick={() => visit(sectionIndex - 1)}><ArrowLeft size={15} /> Previous</button><span>{cleanTitle(activeSection.title)}</span>{sectionIndex < sections.length - 1 ? <button className="primary" onClick={() => visit(sectionIndex + 1)}>Continue <ArrowRight size={15} /></button> : <button className="primary" disabled={!readingComplete} onClick={() => setMode('quiz')}><Scale size={15} /> Begin executive quiz</button>}</footer>
      </article>

      <aside className="gbp-board-lens">
        <span>BOARD LENS</span><h2>Read for the decision.</h2>
        <ol><li><b>01</b><p>What authority is retained by the Governing Body?</p></li><li><b>02</b><p>What can be delegated—and what cannot?</p></li><li><b>03</b><p>Which evidence proves oversight occurred?</p></li><li><b>04</b><p>What deadline or escalation changes the posture?</p></li></ol>
        <div><FileCheck2 size={17} /><p><strong>Evidence standard</strong>Bind policy identity, source version, answers, score, attestation, attempt, and completion time.</p></div>
      </aside>
    </main>}

    {mode === 'quiz' && <main className="gbp-quiz-stage">
      <section className="gbp-quiz-card">
        <header><div><span>EXECUTIVE KNOWLEDGE CHECK · {requirement.policyId}</span><h1>Exercise judgment against the controlled text.</h1><p>Choose the narrowest direction the policy actually supports. Operational convenience is not authority.</p></div><div><strong>{requirement.evidenceRequirements.passScorePercent}%</strong><span>PASS STANDARD</span></div></header>
        <div className="gbp-question-progress"><span>QUESTION {String(questionIndex + 1).padStart(2, '0')} OF {String(questions.length).padStart(2, '0')}</span><i>{questions.map((question, index) => <b key={question.id} className={index < questionIndex || answers[question.id] !== undefined ? 'complete' : index === questionIndex ? 'active' : ''} />)}</i></div>
        <fieldset><legend>{currentQuestion.prompt}</legend><div>{currentQuestion.answers.map((answer, index) => <label key={`${currentQuestion.id}-${index}`} className={answers[currentQuestion.id] === index ? 'selected' : ''}><input type="radio" name={currentQuestion.id} checked={answers[currentQuestion.id] === index} onChange={() => setAnswers((current) => ({ ...current, [currentQuestion.id]: index }))} /><span>{String.fromCharCode(65 + index)}</span><p>{answer}</p></label>)}</div></fieldset>
        {questionIndex === questions.length - 1 && <label className={`gbp-attestation ${attested ? 'selected' : ''}`}><input type="checkbox" checked={attested} onChange={(event) => setAttested(event.target.checked)} /><span>{attested && <Check size={13} />}</span><p><strong>Director attestation</strong>I completed this controlled reading and practice check. I understand that only an identity- and version-bound production record may count as official completion.</p></label>}
        <footer><button onClick={() => questionIndex === 0 ? setMode('read') : setQuestionIndex((value) => value - 1)}><ArrowLeft size={15} /> {questionIndex === 0 ? 'Return to policy' : 'Previous question'}</button>{questionIndex < questions.length - 1 ? <button className="primary" disabled={answers[currentQuestion.id] === undefined} onClick={() => setQuestionIndex((value) => value + 1)}>Next question <ArrowRight size={15} /></button> : <button className="primary" disabled={answers[currentQuestion.id] === undefined || !attested} onClick={() => setMode('result')}>Lock practice answers <ArrowRight size={15} /></button>}</footer>
      </section>
    </main>}

    {mode === 'result' && <main className="gbp-result-stage">
      <section className={`gbp-result ${passed ? 'passed' : 'remediation'}`}>
        <header><div className="gbp-score"><strong>{score}%</strong><span>PRACTICE SCORE</span></div><div><span>{requirement.policyId} · ATTEMPT {attempt} · {earned}/{questions.length} SUPPORTED</span><h1>{passed ? 'The practice threshold is met.' : 'The record calls for remediation.'}</h1><p>{passed ? 'Your reasoning met the source-linked practice standard. No LMS credit or official attestation has been created.' : `Review each unsupported conclusion, then repeat the check. The required practice threshold is ${requirement.evidenceRequirements.passScorePercent}%.`}</p></div></header>
        <div className="gbp-result-list">{questions.map((question, index) => { const correct = answers[question.id] === question.correct; return <article key={question.id} className={correct ? 'correct' : 'missed'}><span>{correct ? <CheckCircle2 size={18} /> : <Scale size={18} />}</span><div><small>ITEM {String(index + 1).padStart(2, '0')} · {question.sourceTitle}</small><strong>{correct ? 'Defensible conclusion' : 'Controlling text'}</strong>{!correct && <p><b>Your selection:</b> {question.answers[answers[question.id]]}</p>}<p><b>Source rule:</b> {question.controllingRule}</p></div></article>; })}</div>
        <footer><button onClick={() => { setMode('read'); visit(0); }}><BookOpenCheck size={15} /> Reopen policy</button>{passed ? <button className="primary" onClick={onExit}><CheckCircle2 size={15} /> Return to policy register</button> : <button className="primary" onClick={retry}><RotateCcw size={15} /> Remediate & retry</button>}</footer>
      </section>
    </main>}
  </div>;
}
