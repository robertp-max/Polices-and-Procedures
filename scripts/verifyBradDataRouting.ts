import { runBradQuery } from '@/services/mockBradEngine';

const PROMPTS = [
  'Run pre-survey audit',
  'Identify compliance gaps in QAPI',
  'Show missing forms for governing body',
  'Open plan of care policy',
  'Create governing body brief for CMIA risk',
  'What is required before billing a Medicare claim?',
];

const NO_MATCH_MESSAGE = 'No direct match was found in the current application data. Please rephrase with a policy, form, workflow, event, task, or compliance topic.';

async function main() {
  let failures = 0;

  for (const prompt of PROMPTS) {
    const result = await runBradQuery(prompt, { currentUserRole: 'iAdministrator' });
    const usedFallback = result.answer.trim() === NO_MATCH_MESSAGE;
    const citationCount = result.citations?.length ?? 0;
    const hasAnswer = result.answer.trim().length > 0;

    if (usedFallback || !hasAnswer || citationCount === 0) {
      failures += 1;
      console.log(`FAIL: ${prompt}`);
      console.log(`  fallback=${usedFallback} citations=${citationCount} hasAnswer=${hasAnswer}`);
      continue;
    }

    console.log(`PASS: ${prompt}`);
    console.log(`  citations=${citationCount}`);
    console.log(`  preview=${result.answer.split('\n').slice(0, 2).join(' | ')}`);
  }

  if (failures > 0) {
    console.error(`\nVerification failed: ${failures} prompt(s) did not produce grounded output.`);
    process.exitCode = 1;
    return;
  }

  console.log('\nVerification succeeded: all prompts produced grounded, source-routed responses.');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Verification crashed: ${message}`);
  process.exitCode = 1;
});
