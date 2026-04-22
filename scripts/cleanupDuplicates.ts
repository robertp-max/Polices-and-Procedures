/**
 * cleanupDuplicates.ts
 * ─────────────────────────────────────────────────────────────
 * One-time remediation pass for the Regulatory Planner calendar.
 *
 * Detects events with the same (title + start + end) and removes
 * duplicates, keeping the authoritative copy:
 *
 *   1. Prefer the event whose extendedProperties.private.event_id
 *      matches a row in the local event store.
 *   2. Otherwise prefer the event that has any event_id.
 *   3. Otherwise keep the oldest event.
 *
 * Defaults to DRY RUN. Run once with --dry to inspect, once with
 * --apply to execute. PROD duplicates require --admin-override.
 *
 *   npx tsx scripts/cleanupDuplicates.ts --dry
 *   npx tsx scripts/cleanupDuplicates.ts --apply
 *   npx tsx scripts/cleanupDuplicates.ts --apply --admin-override
 * ─────────────────────────────────────────────────────────────
 */

import { cleanupDuplicates } from '../server/sync/eventSync.js';

const args = new Set(process.argv.slice(2));
const apply         = args.has('--apply');
const adminOverride = args.has('--admin-override');
const dryRun        = !apply;

async function main() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  Care Indeed — Calendar Duplicate Cleanup');
  console.log('══════════════════════════════════════════════════════');
  console.log(`  Mode           : ${dryRun ? 'DRY RUN' : 'APPLY'}`);
  console.log(`  Admin override : ${adminOverride ? 'YES (PROD deletions allowed)' : 'no'}`);
  console.log('──────────────────────────────────────────────────────\n');

  const report = await cleanupDuplicates({
    dryRun,
    adminOverride,
    trigger: 'script:cleanupDuplicates',
    actor: 'cli',
  });

  console.log(`  Groups inspected   : ${report.groups}`);
  console.log(`  Duplicates found   : ${report.duplicates_found}`);
  console.log(`  Deleted            : ${report.deleted}`);
  console.log(`  Kept (authoritative): ${report.kept.length}`);
  console.log(`  Needs manual review: ${report.needs_review.length}`);

  if (report.needs_review.length) {
    console.log('\n  Needs review:');
    for (const n of report.needs_review) {
      console.log(`   - [${n.google_event_id}] ${n.group_key}  ← ${n.reason}`);
    }
  }

  if (dryRun) {
    console.log('\n  ** Dry run only. Re-run with --apply to perform deletions. **');
  }
  console.log('══════════════════════════════════════════════════════\n');
}

main().catch(e => {
  console.error('Cleanup failed:', e);
  process.exit(1);
});
