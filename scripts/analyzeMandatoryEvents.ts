/* Reconciliation analysis (read-only): enumerate the live 2026 CES calendar
   to ground the mandatory-events ledger in actual data, not assumptions. */
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const weekday = (iso: string) => WD[new Date(iso + 'T00:00:00').getDay()];

const evs = REGULATORY_EVENTS.filter(e => e.date >= '2026-01-01' && e.date <= '2026-12-31');
console.log('TOTAL 2026 events:', evs.length);

// by domain
const byDomain: Record<string, number> = {};
const byCadence: Record<string, number> = {};
const byWeekday: Record<string, number> = {};
for (const e of evs) {
  byDomain[e.domain] = (byDomain[e.domain] || 0) + 1;
  byCadence[e.cadence] = (byCadence[e.cadence] || 0) + 1;
  byWeekday[weekday(e.date)] = (byWeekday[weekday(e.date)] || 0) + 1;
}
console.log('\nBY DOMAIN:', JSON.stringify(byDomain));
console.log('BY CADENCE:', JSON.stringify(byCadence));
console.log('BY WEEKDAY:', JSON.stringify(byWeekday));

const tueThu = evs.filter(e => ['Tue', 'Thu'].includes(weekday(e.date)));
console.log(`\nTUE/THU compliance: ${tueThu.length}/${evs.length} = ${Math.round(100 * tueThu.length / evs.length)}%`);
console.log('NON-Tue/Thu events:', evs.filter(e => !['Tue', 'Thu'].includes(weekday(e.date))).map(e => `${e.date}(${weekday(e.date)}) ${e.id}`).join('\n  '));

// scope coverage
const noScope = evs.filter(e => !e.scopeLabel && !e.scopeType);
console.log(`\nEvents WITHOUT scopeLabel/scopeType: ${noScope.length}`);

// dependency coverage
const withDeps = evs.filter(e => e.dependencies?.dependsOn?.length);
console.log(`Events WITH dependsOn: ${withDeps.length}`);

// QAPI family chain
const qapi = evs.filter(e => e.domain === 'QAPI').sort((a, b) => a.date.localeCompare(b.date));
console.log(`\nQAPI events (${qapi.length}):`);
for (const e of qapi) console.log(`  ${e.date}(${weekday(e.date)}) [${e.cadence}] ${e.id}  deps=${JSON.stringify(e.dependencies?.dependsOn || [])} scope="${e.scopeLabel || e.scopeType || ''}"`);

// monthly coverage check: which months have a QAPI monthly event?
const qapiMonthly = qapi.filter(e => e.cadence === 'Monthly');
console.log('\nQAPI Monthly months present:', [...new Set(qapiMonthly.map(e => e.date.slice(0, 7)))].sort().join(', '));

// budget October check
const budget = evs.filter(e => /budget/i.test(e.title) || /budget/i.test(e.id));
console.log('\nBudget events:', budget.map(e => `${e.date}(${weekday(e.date)}) ${e.id} "${e.title}" scope="${e.scopeLabel || ''}"`).join('\n  ') || 'NONE');

// broken refs: events with no workflowId
const noWf = evs.filter(e => !e.workflowId);
console.log(`\nEvents WITHOUT workflowId: ${noWf.length}`, noWf.slice(0, 10).map(e => e.id));
