/* ═══════════════════════════════════════════════════════════════
   verifyWorkflowCatalog.ts — drift gate for the generated workflow catalog (§4).

     npm run journey:workflows:verify   (from apps/employee-journey)

   FAILS (exit 1) on: count drift, missing/extra id, title drift, domain drift,
   duplicate id, missing domain, or a stale generated file (manifest source hash
   no longer matches the live canonical registry).
   ═══════════════════════════════════════════════════════════════ */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { WORKFLOW_LIST } from "../../../src/policy/data/workflows.generated";
import { WORKFLOW_CATALOG } from "../app/journey/_generated/workflowCatalog.generated";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");
const MANIFEST = path.resolve(__dirname, "../app/journey/_generated/workflowSourceManifest.generated.json");
const SOURCE_ABS = path.join(REPO_ROOT, "src/policy/data/workflows.generated.ts");
const DOMAINS = new Set(["CL", "CO", "EN", "FN", "GV", "HR", "IT", "OP", "QA", "RM"]);

let failures = 0;
const fail = (m: string) => { failures++; console.error(`  ✗ ${m}`); };
const ok = (m: string) => console.log(`  ✓ ${m}`);

// 1. Count drift
if (WORKFLOW_CATALOG.length !== WORKFLOW_LIST.length) {
  fail(`count drift: catalog ${WORKFLOW_CATALOG.length} vs registry ${WORKFLOW_LIST.length}`);
} else ok(`count matches registry (${WORKFLOW_CATALOG.length})`);

// 2. Duplicates
const catIds = WORKFLOW_CATALOG.map((w) => w.id);
if (new Set(catIds).size !== catIds.length) fail("duplicate id(s) in catalog"); else ok("no duplicate ids");

// 3. Missing / extra / title / domain drift
const src = new Map(WORKFLOW_LIST.map((w) => [w.id, w]));
const cat = new Map(WORKFLOW_CATALOG.map((w) => [w.id, w]));
let idDrift = 0, titleDrift = 0, domainDrift = 0;
for (const [id, w] of src) {
  const c = cat.get(id);
  if (!c) { idDrift++; continue; }
  if (c.title !== w.title) titleDrift++;
  if (c.domainCode !== w.domain) domainDrift++;
}
for (const id of cat.keys()) if (!src.has(id)) idDrift++;
idDrift === 0 ? ok("every registry id present, no extras") : fail(`${idDrift} missing/extra id(s)`);
titleDrift === 0 ? ok("no title drift") : fail(`${titleDrift} title drift(s)`);
domainDrift === 0 ? ok("no domain drift") : fail(`${domainDrift} domain drift(s)`);

// 4. All 10 domains present
const present = new Set(WORKFLOW_CATALOG.map((w) => w.domainCode));
[...DOMAINS].every((d) => present.has(d)) ? ok("all 10 domains present") : fail("a domain is missing from the catalog");

// 5. Stale generated output (manifest hash vs live source)
const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const liveSha = crypto.createHash("sha256").update(fs.readFileSync(SOURCE_ABS)).digest("hex");
manifest.sourceSha256 === liveSha
  ? ok("generated output is current (manifest hash == live registry)")
  : fail("STALE generated output — registry changed since last generate; run journey:workflows:generate");

console.log("");
if (failures > 0) { console.error(`FAILED — ${failures} workflow-catalog drift issue(s).`); process.exit(1); }
console.log("Workflow catalog is in sync with the canonical registry.");
