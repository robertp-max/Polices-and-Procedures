/* ═══════════════════════════════════════════════════════════════
   generateWorkflowCatalog.ts — BUILD-TIME PIPELINE (run via tsx)

   Reads the CANONICAL workflow registry (src/policy/data/workflows.generated.ts,
   the source of record — 206 workflows across 10 domains) and bakes a compact,
   employee-safe projection into the Employee Journey app. Replaces the hand-copied
   166-line workflow string that previously lived inside fixtures.ts (§4).

   Writes:
     app/journey/_generated/workflowCatalog.generated.ts
     app/journey/_generated/workflowSourceManifest.generated.json

   Usage (from apps/employee-journey):
     npx tsx --tsconfig ../../tsconfig.json scripts/generateWorkflowCatalog.ts
   (wired as `npm run journey:workflows:generate`).
   ═══════════════════════════════════════════════════════════════ */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { WORKFLOW_LIST } from "../../../src/policy/data/workflows.generated";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(APP_ROOT, "../..");
const OUT_DIR = path.join(APP_ROOT, "app/journey/_generated");
const SOURCE_REL = "src/policy/data/workflows.generated.ts";
const SOURCE_ABS = path.join(REPO_ROOT, SOURCE_REL);

const DOMAIN_LABELS: Record<string, string> = {
  CL: "Clinical", CO: "Compliance", EN: "Enterprise", FN: "Finance", GV: "Governance",
  HR: "Human Resources", IT: "IT / Security", OP: "Operations", QA: "QAPI", RM: "Risk Management",
};

interface WorkflowCatalogItem {
  id: string;
  title: string;
  domainCode: string;
  domain: string;
  processOverview: string;
  triggers: string[];
  primaryRoles: string[];
  approvalRoles: string[];
  policyRefs: string[];
  regulatoryAnchors: string[];
  sourcePath: string;
}

const catalog: WorkflowCatalogItem[] = WORKFLOW_LIST.map((w) => ({
  id: w.id,
  title: w.title,
  domainCode: w.domain,
  domain: DOMAIN_LABELS[w.domain] ?? w.domain,
  processOverview: w.processOverview ?? "",
  triggers: (w.triggers ?? []).map((t) => t.description).filter(Boolean),
  primaryRoles: w.roles?.primary ?? [],
  approvalRoles: w.roles?.approval ?? [],
  policyRefs: w.policyRefs ?? [],
  regulatoryAnchors: w.regulatoryAnchors ?? [],
  sourcePath: w.sourcePath ?? "",
})).sort((a, b) => a.id.localeCompare(b.id));

// Integrity: unique ids, every item has a title + a recognized domain.
const ids = new Set<string>();
for (const w of catalog) {
  if (ids.has(w.id)) throw new Error(`[workflows] duplicate workflow id ${w.id}`);
  ids.add(w.id);
  if (!w.title) throw new Error(`[workflows] workflow ${w.id} has no title`);
  if (!DOMAIN_LABELS[w.domainCode]) throw new Error(`[workflows] workflow ${w.id} has unknown domain ${w.domainCode}`);
}

const domainCounts: Record<string, number> = {};
for (const w of catalog) domainCounts[w.domain] = (domainCounts[w.domain] ?? 0) + 1;

fs.mkdirSync(OUT_DIR, { recursive: true });
const sha = crypto.createHash("sha256").update(fs.readFileSync(SOURCE_ABS)).digest("hex");

const HEADER = `/* ═══════════════════════════════════════════════════════════════
   AUTO-GENERATED — DO NOT EDIT
   File: workflowCatalog.generated.ts
   Generator: apps/employee-journey/scripts/generateWorkflowCatalog.ts
   Source: ${SOURCE_REL} (canonical workflow registry)
   Source SHA-256: ${sha}
   Workflow count: ${catalog.length}
   Domain counts: ${JSON.stringify(domainCounts)}
   Regenerate: npm run journey:workflows:generate
   ═══════════════════════════════════════════════════════════════ */
`;

fs.writeFileSync(
  path.join(OUT_DIR, "workflowCatalog.generated.ts"),
  HEADER +
    `
export interface WorkflowCatalogItem {
  id: string;
  title: string;
  domainCode: string;
  domain: string;
  processOverview: string;
  triggers: string[];
  primaryRoles: string[];
  approvalRoles: string[];
  policyRefs: string[];
  regulatoryAnchors: string[];
  sourcePath: string;
}

export const WORKFLOW_CATALOG: WorkflowCatalogItem[] = JSON.parse(${JSON.stringify(
      JSON.stringify(catalog),
    )}) as WorkflowCatalogItem[];

export const WORKFLOW_CATALOG_COUNT = ${catalog.length};

export function getWorkflowCatalogItem(id: string): WorkflowCatalogItem | undefined {
  return WORKFLOW_CATALOG.find((w) => w.id === id);
}
`,
  "utf8",
);

fs.writeFileSync(
  path.join(OUT_DIR, "workflowSourceManifest.generated.json"),
  JSON.stringify(
    {
      note: "AUTO-GENERATED — DO NOT EDIT",
      sourcePath: SOURCE_REL,
      sourceSha256: sha,
      generatedAt: "GENERATED_AT_BUILD",
      workflowCount: catalog.length,
      domainCounts,
      unresolvedCount: 0,
    },
    null,
    2,
  ) + "\n",
  "utf8",
);

console.log(`[journey:workflows:generate] ${catalog.length} workflows across ${Object.keys(domainCounts).length} domains → ${OUT_DIR}`);
console.log(JSON.stringify(domainCounts, null, 2));
