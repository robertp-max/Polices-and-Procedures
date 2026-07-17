/**
 * P1-D Phase 3/4 — dedicated, fail-closed Firestore emulator acceptance gate.
 *
 *   npm run test:audit-firestore-emulator
 *
 * Starts the real gcloud Firestore emulator on a free loopback port with an
 * isolated emulator-only project, sets the emulator env (AUDIT_STORE_BACKEND=
 * firestore, AUDIT_EMULATOR_GATE=1), runs ONLY the emulator suites, then stops
 * the emulator. Exits nonzero when: Java is missing, the emulator cannot start,
 * the project id is missing, or any test fails OR is skipped. Never falls back
 * to the in-memory fake, never to JSONL, never contacts real Firestore.
 */
import { spawn, spawnSync } from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const PROJECT = 'careindeed-audit-emulator';
const TMP = path.join(os.tmpdir(), 'careindeed-firestore-emulator');
const LOG = path.join(TMP, 'emulator.log');
const PORTABLE_JRE = 'C:\\Users\\razer\\tools\\jdk-21\\jdk-21.0.11+10-jre';
fs.mkdirSync(TMP, { recursive: true });

function fail(msg) { console.error(`\n[emulator-gate] FAIL: ${msg}\n`); process.exit(1); }

// ── Java resolution (portable JRE, session-scoped only) ──────────────────────
function ensureJava() {
  const probe = spawnSync('java', ['-version'], { shell: true });
  if (probe.status === 0) return;
  const home = process.env.JAVA_HOME || PORTABLE_JRE;
  const javaBin = path.join(home, 'bin');
  if (!fs.existsSync(path.join(javaBin, 'java.exe'))) {
    fail(`no usable Java runtime (java not on PATH and none at ${javaBin}). Approve/point JAVA_HOME to a portable JRE.`);
  }
  process.env.JAVA_HOME = home;
  process.env.PATH = `${javaBin}${path.delimiter}${process.env.PATH}`;
  const probe2 = spawnSync('java', ['-version'], { shell: true });
  if (probe2.status !== 0) fail('portable Java present but `java -version` failed.');
}

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => resolve(p)); });
  });
}

function waitForPort(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve) => {
    const tryOnce = () => {
      const s = net.connect(port, '127.0.0.1');
      s.on('connect', () => { s.destroy(); resolve(true); });
      s.on('error', () => { s.destroy(); if (Date.now() > deadline) resolve(false); else setTimeout(tryOnce, 500); });
    };
    tryOnce();
  });
}

function killTree(pid) {
  if (!pid) return;
  try { spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { shell: true }); } catch { /* ignore */ }
}

async function main() {
  ensureJava();
  const jv = spawnSync('java', ['-version'], { shell: true, encoding: 'utf8' });
  console.log(`[emulator-gate] java: ${(jv.stderr || jv.stdout || '').split('\n')[0].trim()}`);

  const port = await freePort();
  const host = `127.0.0.1:${port}`;
  console.log(`[emulator-gate] starting Firestore emulator on ${host} (project ${PROJECT})`);
  fs.writeFileSync(LOG, '');
  const out = fs.openSync(LOG, 'a');
  const emu = spawn(
    'gcloud',
    ['emulators', 'firestore', 'start', `--host-port=${host}`, '--database-mode=firestore-native', `--project=${PROJECT}`, '--quiet'],
    { shell: true, stdio: ['ignore', out, out], detached: false },
  );
  emu.on('error', (e) => fail(`emulator spawn error: ${e.message}`));

  const ready = await waitForPort(port, 90_000);
  if (!ready) { console.error(fs.readFileSync(LOG, 'utf8')); killTree(emu.pid); fail('emulator did not become reachable within 90s'); }
  // Small settle so the gRPC/REST layer is fully up.
  await new Promise(r => setTimeout(r, 3000));
  console.log(`[emulator-gate] emulator reachable (launcher pid ${emu.pid}); log: ${LOG}`);

  const env = {
    ...process.env,
    FIRESTORE_EMULATOR_HOST: host,
    GOOGLE_CLOUD_PROJECT: PROJECT,
    AUDIT_STORE_BACKEND: 'firestore',
    AUDIT_EMULATOR_GATE: '1',
  };
  delete env.GOOGLE_APPLICATION_CREDENTIALS;

  const vitest = spawnSync(
    'npx',
    ['vitest', 'run', '--config', 'vitest.firestore-emulator.config.ts', '--reporter=verbose'],
    { stdio: 'inherit', shell: true, env },
  );
  killTree(emu.pid);

  const code = vitest.status ?? 1;
  console.log(`\n[emulator-gate] vitest exit code: ${code}`);
  process.exit(code);
}

main().catch((e) => fail(e?.stack ?? String(e)));
