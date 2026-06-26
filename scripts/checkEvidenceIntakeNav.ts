/**
 * Brad Evidence Intake — navigation/route placement verification (Section 24).
 *
 *  23  No new TOP-LEVEL navigation item is introduced
 *      - Brad Evidence Intake lives ONLY inside the Evidence Center / CES
 *        workspace subnav, and the /evidence/intake route is registered.
 *
 * Run: tsx --tsconfig tsconfig.app.json scripts/checkEvidenceIntakeNav.ts
 */
import assert from 'node:assert/strict';

let passed = 0;
const ok = (label: string, cond: boolean) => { assert.ok(cond, label); passed++; console.log(`  ✓ ${label}`); };

async function main(): Promise<void> {
  const nav = await import('../src/v6/routing/navigationManifest');
  const { V6_ROUTES } = await import('../src/v6/routing/routeRegistry');

  // 23a — NO new top-level primary nav item points at /evidence/intake.
  const topLevelToIntake = nav.primaryNavItems.filter((n) => n.to === '/evidence/intake' || n.to.startsWith('/evidence/intake'));
  ok('23: no top-level primaryNavItem points to /evidence/intake', topLevelToIntake.length === 0);

  // 23b — exactly the same set of top-level primary nav ids as before (no growth
  //       beyond the known fixed set). The known top-level set excludes evidence.
  const topIds = nav.primaryNavItems.map((n) => n.id);
  ok('23: top-level nav does not contain an "evidence-intake" item', !topIds.includes('evidence-intake'));
  ok('23: Evidence is exposed under the existing "ces" (Compliance) top-level item', topIds.includes('ces'));

  // 23c — intake IS present in the CES workspace subnav.
  const cesSub = nav.workspaceSubnavItems.ces ?? [];
  ok('23: /evidence/intake present in CES workspace subnav', cesSub.some((n) => n.to === '/evidence/intake' && n.id === 'evidence-intake'));

  // 23d — the "ces" top-level item activates on the intake hashId (so the
  //       Compliance item highlights without a dedicated nav entry).
  const ces = nav.primaryNavItems.find((n) => n.id === 'ces');
  ok('23: ces hashIds include evidence-intake (activation, not a new item)', !!ces && ces.hashIds.includes('evidence-intake'));

  // route registered under the CES group with the evidence template.
  const route = V6_ROUTES.find((r) => r.path === '/evidence/intake');
  ok('route: /evidence/intake registered (CES group, evidence template)', !!route && route.group === 'CES' && route.hashId === 'evidence-intake');

  // sibling routes still present (no regression of evidence-center / packet-studio).
  ok('route: /evidence (Evidence Center) still registered', V6_ROUTES.some((r) => r.path === '/evidence'));
  ok('route: /evidence/packet-studio still registered', V6_ROUTES.some((r) => r.path === '/evidence/packet-studio'));

  console.log(`\nEvidence Intake NAV checks passed: ${passed}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
