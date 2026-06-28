/**
 * verifyBradSexualHarassmentResponse.ts
 * Exercises the REAL Brad answer path (composeInternalBradAnswer) for staff
 * questions about patient sexual advances, comments, harassment, inappropriate
 * touching, exposure, and boundary/unsafe-visit situations.
 *
 * Asserts Brad gives practical, protective, policy-grounded guidance and NEVER
 * the cold "not enough internal policy context" fallback for these topics.
 *
 * Run: npx tsx scripts/verifyBradSexualHarassmentResponse.ts   (exit 0/1)
 */
import {
  composeInternalBradAnswer,
  INSUFFICIENT_CONTEXT_FALLBACK,
} from '../server/ia/brad/bradInternalResponder.js';

const failures: string[] = [];
let passed = 0;
const check = (cond: unknown, msg: string) => {
  if (cond) passed++;
  else failures.push(msg);
};

const FORBIDDEN = [
  /\bMVP\b/i, /\bmock\b/i, /harness/i, /\bstub\b/i, /placeholder/i,
  /would answer/i, /live model/i, /as an ai\b/i, /language model/i, /\bllm\b/i,
];
// Must never victim-blame, tell staff to ignore it, or tell them to keep going.
const FORBIDDEN_TONE = [
  /just ignore/i, /ignore it/i, /brush it off/i, /your fault/i, /you (must|should) (continue|finish) the visit/i,
];

console.log('=== Brad sexual-harassment / boundary response verification ===\n');

function evaluate(
  prompt: string,
  expect: {
    profile: 'sexual_harassment' | 'sexual_assault';
    boundaryScript?: boolean;
    leaveGuidance?: boolean;
    report?: boolean;
    document?: boolean;
    controls?: boolean;
  },
) {
  const ans = composeInternalBradAnswer(prompt);
  const text = ans.text;
  const lower = text.toLowerCase();
  console.log(`Q: ${prompt}`);
  console.log(`   track=${ans.track} profile=${ans.diagnostics.incidentProfile} refs=${ans.references.length} matched=${ans.matched}\n`);

  // Hard rule for every sexual-misconduct topic: never the cold fallback.
  check(text !== INSUFFICIENT_CONTEXT_FALLBACK, `[${prompt}] must NOT be the cold fallback`);
  check(ans.matched === true, `[${prompt}] must be a matched (grounded) answer`);
  check(!/not enough internal policy context/i.test(text), `[${prompt}] must not say "not enough internal policy context"`);
  check(ans.diagnostics.incidentProfile === expect.profile, `[${prompt}] profile should be ${expect.profile} (got ${ans.diagnostics.incidentProfile})`);
  check(ans.references.length > 0, `[${prompt}] should attach internal references`);

  // Empathy first.
  check(/(i.?m sorry|i.?m so sorry|i.?m here to help|you did the right thing)/i.test(text), `[${prompt}] must open with empathy`);
  // Report to supervisor.
  check(/supervisor/i.test(text), `[${prompt}] must tell the worker to notify their supervisor`);

  if (expect.boundaryScript) {
    check(/stay professional/i.test(text) && /sexual (comments|advances)/i.test(text), `[${prompt}] must include a professional boundary script`);
  }
  if (expect.leaveGuidance) {
    check(/leave (immediately|now)/i.test(text), `[${prompt}] must tell the worker to leave if unsafe`);
    check(/911/.test(text), `[${prompt}] must name 911 for immediate danger`);
  }
  if (expect.document) {
    check(/document/i.test(lower), `[${prompt}] must instruct objective documentation`);
  }
  if (expect.controls) {
    check(/(safety plan|buddy visit|reassignment|discharge review|visit-boundary)/i.test(text), `[${prompt}] must mention future safety controls`);
  }

  for (const re of FORBIDDEN) check(!re.test(text), `[${prompt}] forbidden debug/model wording ${re}`);
  for (const re of FORBIDDEN_TONE) check(!re.test(text), `[${prompt}] forbidden victim-blaming / dismissive tone ${re}`);

  console.log(text);
  console.log('\n──────────────────────────────────────────\n');
}

// 1 — the exact reported failing prompt.
evaluate('how do i say no to patients sexual advances?', {
  profile: 'sexual_harassment',
  boundaryScript: true,
  leaveGuidance: true,
  report: true,
  document: true,
  controls: true,
});

// 2 — inappropriate touching → trauma-informed immediate safety/reporting.
evaluate('a patient touched me inappropriately during a visit, what do i do', {
  profile: 'sexual_assault',
  report: true,
});

// 3 — sexual comments → professional script + report/document, no fallback.
evaluate('my patient keeps making sexual comments to me', {
  profile: 'sexual_harassment',
  boundaryScript: true,
  document: true,
  controls: true,
});

// 4 — blocked exit after sexual comments → leave / 911 / supervisor.
evaluate('the patient blocked the door after making sexual comments', {
  profile: 'sexual_harassment',
  leaveGuidance: true,
  report: true,
});

// 5 — extra coverage: flirting / advances phrasing variants must not fall back.
for (const p of [
  'patient is flirting with me and it makes me uncomfortable',
  'client keeps hitting on me',
  'the patient exposed himself to me',
  'how do i set a boundary with a patient making sexual advances',
]) {
  const ans = composeInternalBradAnswer(p);
  check(ans.text !== INSUFFICIENT_CONTEXT_FALLBACK, `[${p}] must NOT be the cold fallback`);
  check(ans.diagnostics.incidentProfile === 'sexual_harassment' || ans.diagnostics.incidentProfile === 'sexual_assault',
    `[${p}] should route to a sexual-misconduct profile (got ${ans.diagnostics.incidentProfile})`);
}

console.log(`=== ${passed} checks passed, ${failures.length} failed ===`);
if (failures.length) {
  failures.forEach((f) => console.log('  - ' + f));
  process.exit(1);
}
console.log('\nALL SEXUAL-HARASSMENT / BOUNDARY RESPONSE CHECKS PASSED.');
