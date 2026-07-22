/* ═══════════════════════════════════════════════════════════════════════════
   LIVE-SURFACE PROTECTION GATE
   ----------------------------------------------------------------------------
   Fails (exit 1) if Brad, Nolan, the packet reader, or Google Drive lose a
   critical contract that has SILENTLY REGRESSED before. Source-level assertions
   only (no running server), so it is safe to run in CI and pre-deploy.

   Run: npm run verify:surface-protection
   ═══════════════════════════════════════════════════════════════════════════ */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p: string): string => {
  try { return readFileSync(path.join(ROOT, p), 'utf8'); }
  catch { return ''; }
};

const pass: string[] = [];
const fail: string[] = [];
const check = (label: string, cond: boolean): void => { (cond ? pass : fail).push(label); };

const indexTs = read('server/index.ts');
const cloudrunTs = read('server/cloudrun.ts');
const nolanRoute = read('server/routes/nolan.ts');
const nolanResponder = read('server/ia/nolan/nolanTutorResponder.ts');
const srcExtract = read('server/sourceExtraction.ts');
const calendar = read('server/routes/calendar.ts');
const envTs = read('server/env.ts');

/* ── Brad + Nolan: mounted on BOTH entrypoints, behind the auth boundary ──── */
check('Brad route mounted (server/index.ts)', /app\.use\('\/api\/brad'/.test(indexTs));
check('Brad route mounted (server/cloudrun.ts)', /app\.use\('\/api\/brad'/.test(cloudrunTs));
check('Nolan route mounted (server/index.ts)', /app\.use\('\/api\/nolan'/.test(indexTs));
check('Nolan route mounted (server/cloudrun.ts)', /app\.use\('\/api\/nolan'/.test(cloudrunTs));
check('cloudrun.ts installs the requireApiAuth boundary', /requireApiAuth\(\)/.test(cloudrunTs));
check('cloudrun.ts fails closed if required mounts fail', /required_mounts_failed/.test(cloudrunTs));

/* ── Nolan: tutor endpoints + deterministic grounding present ─────────────── */
check('Nolan tutor/ask endpoint present', /\/tutor\/ask/.test(nolanRoute));
check('Nolan tutor/health endpoint present', /\/tutor\/health/.test(nolanRoute));
check('Nolan deterministic catalog grounding present', /ALL_MODULES|modulesForRole/.test(nolanResponder));

/* ── Packets: default/admission reader = Opus primary → ChatGPT fallback ──── */
check('packet reader default: Opus(Claude) primary, CLI-gated', /const claudeOk = await claudeCliAvailable\(\)/.test(srcExtract));
check('packet reader default: ChatGPT(Codex) fallback', /if \(codexOk\) return runCodex/.test(srcExtract));
check('packet reader availability NOT solely BRAD_PROVIDER-gated', /return \(await claudeCliAvailable\(\)\)\s*\|\|\s*\(await codexCliAvailable\(\)\)/.test(srcExtract));
check('patient admission packet template handled', /'admission'/.test(calendar));

/* ── Drive: evidence lock defined + enforced ──────────────────────────────── */
check('Drive evidence lock defined (DRIVE_EVIDENCE_LOCK)', /DRIVE_EVIDENCE_LOCK\s*=/.test(envTs));
check('Drive lock enforced at startup (assertDriveEvidenceLock)', /assertDriveEvidenceLock/.test(envTs) && /assertDriveEvidenceLock/.test(indexTs));
check('Drive locked SA is careindeed-drive-evidence', /careindeed-drive-evidence@orbital-stage-443721-v1/.test(envTs));

/* ── report ───────────────────────────────────────────────────────────────── */
console.log(`\nLive-surface protection gate — ${pass.length} passed, ${fail.length} failed\n`);
for (const p of pass) console.log(`  ✓ ${p}`);
if (fail.length) {
  console.log('\nFAILED contracts (a protected surface regressed):');
  for (const f of fail) console.log(`  ✗ ${f}`);
  process.exit(1);
}
console.log('\n✅ All Brad / Nolan / packet / Drive contracts intact.\n');
