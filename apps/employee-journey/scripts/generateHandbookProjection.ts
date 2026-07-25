/* ═══════════════════════════════════════════════════════════════
   generateHandbookProjection.ts — BUILD-TIME INGESTION (run via tsx)

   Reads the CONTROLLED, UNCHANGED 2026 counsel-review package under
     apps/employee-journey/content/handbook/2026-review/source/
   (+ manifest/HANDBOOK_SOURCE_MANIFEST.json), verifies every source file's
   SHA-256 against the manifest (fails closed on mismatch), and writes a
   structured, generated APP PROJECTION under
     apps/employee-journey/content/handbook/2026-review/generated/

   The original package is never edited. This projection is what the native
   handbook player renders — the counsel HTML is not shown as raw source, and
   the app never imports the main-app src at runtime.

   Usage (from apps/employee-journey):
     npx tsx scripts/generateHandbookProjection.ts
   (wired as `npm run handbook:projection:generate`).
   ═══════════════════════════════════════════════════════════════ */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ROOT = path.resolve(__dirname, ".."); // apps/employee-journey
const HB_ROOT = path.join(APP_ROOT, "content/handbook/2026-review");
const SOURCE_DIR = path.join(HB_ROOT, "source");
const MANIFEST_PATH = path.join(HB_ROOT, "manifest/HANDBOOK_SOURCE_MANIFEST.json");
const OUT_DIR = path.join(HB_ROOT, "generated");

const HTML_FILE = "Care_Indeed_Employee_Field_Workforce_Handbook_2026_Counsel_Review_Draft.html";
const CROSSWALK_FILE = "Care_Indeed_Handbook_Policy_Form_Crosswalk.csv";

fs.mkdirSync(OUT_DIR, { recursive: true });

function sha256(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

// ── 1. INTEGRITY GATE: verify every source file hash vs the manifest ──────────
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const manifestFiles: Record<string, { sha256: string; bytes: number }> = manifest.files;
const integrity: { file: string; ok: boolean; expected: string; actual: string }[] = [];
for (const [file, meta] of Object.entries(manifestFiles)) {
  const abs = path.join(SOURCE_DIR, file);
  if (!fs.existsSync(abs)) throw new Error(`[handbook] source file missing: ${file}`);
  const actual = sha256(fs.readFileSync(abs));
  const ok = actual === meta.sha256;
  integrity.push({ file, ok, expected: meta.sha256, actual });
  if (!ok) {
    throw new Error(
      `[handbook] INTEGRITY FAILURE for ${file}: expected ${meta.sha256}, got ${actual}. ` +
        `The controlled source has been altered — refusing to generate.`,
    );
  }
}

const html = fs.readFileSync(path.join(SOURCE_DIR, HTML_FILE), "utf8");
const htmlSha = sha256(Buffer.from(html, "utf8"));

// ── 2. Minimal CSV parser (handles quoted fields + BOM) ───────────────────────
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  const s = text.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === "\r") { /* skip */ }
    else field += c;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((cell) => cell.trim().length > 0));
}

const crosswalkRows = parseCsv(fs.readFileSync(path.join(SOURCE_DIR, CROSSWALK_FILE), "utf8"));
const crosswalkHeader = crosswalkRows[0].map((h) => h.trim());
const idx = (name: string) => crosswalkHeader.indexOf(name);
interface CrosswalkEntry {
  policyIds: string[];
  formIds: string[];
  externalAuthorities: string[];
  owner: string;
  employeeAction: string;
}
const splitIds = (v: string) => (v ? v.split(";").map((x) => x.trim()).filter(Boolean) : []);
const crosswalk = new Map<string, CrosswalkEntry>();
for (const r of crosswalkRows.slice(1)) {
  const id = (r[idx("section_id")] ?? "").trim();
  if (!id) continue;
  crosswalk.set(id, {
    policyIds: splitIds(r[idx("policy_ids")] ?? ""),
    formIds: splitIds(r[idx("form_ids")] ?? ""),
    externalAuthorities: splitIds(r[idx("external_authorities")] ?? ""),
    owner: (r[idx("owner")] ?? "").trim(),
    employeeAction: (r[idx("employee_action")] ?? "").trim(),
  });
}

// ── 3. Parse handbook sections from the controlled HTML ───────────────────────
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&mdash;/g, "—")
    .replace(/&nbsp;/g, " ")
    .trim();
}

interface HandbookSection {
  id: string;
  order: number;
  number: string;
  eyebrow: string;
  title: string;
  lead: string;
  bodyHtml: string;
  owner: string;
  policyIds: string[];
  formIds: string[];
  externalAuthorities: string[];
  employeeAction: string;
}

const articleBlocks = html.split('<article class="handbook-section"').slice(1);
const sections: HandbookSection[] = [];
articleBlocks.forEach((raw, i) => {
  const block = '<article class="handbook-section"' + raw.split("</article>")[0];
  const id = /id="([^"]+)"/.exec(block)?.[1] ?? "";
  if (!id) return;
  const number = decodeEntities(/class="section-number">([\s\S]*?)</.exec(block)?.[1] ?? "");
  const eyebrow = decodeEntities(/class="eyebrow">([\s\S]*?)</.exec(block)?.[1] ?? "");
  const title = decodeEntities(/<h2>([\s\S]*?)<\/h2>/.exec(block)?.[1] ?? "");
  const lead = decodeEntities(/class="section-lead">([\s\S]*?)<\/p>/.exec(block)?.[1] ?? "");
  // body = between <div class="section-body"> and the trailing <div class="owner-line">
  let bodyHtml = "";
  const bodyMatch = /<div class="section-body">([\s\S]*?)<div class="owner-line">/.exec(block);
  if (bodyMatch) {
    bodyHtml = bodyMatch[1].replace(/\s*<\/div>\s*$/, "").trim(); // drop section-body's own closing div
  }
  const ownerFromHtml = decodeEntities(
    /class="owner-line"><span>[^<]*<\/span><strong>([\s\S]*?)<\/strong>/.exec(block)?.[1] ?? "",
  );
  const cw = crosswalk.get(id);
  sections.push({
    id,
    order: i + 1,
    number,
    eyebrow,
    title,
    lead,
    bodyHtml,
    owner: cw?.owner || ownerFromHtml,
    policyIds: cw?.policyIds ?? [],
    formIds: cw?.formIds ?? [],
    externalAuthorities: cw?.externalAuthorities ?? [],
    employeeAction: cw?.employeeAction ?? "",
  });
});

if (sections.length !== manifest.section_count) {
  throw new Error(
    `[handbook] parsed ${sections.length} sections but manifest says ${manifest.section_count}. Aborting to avoid a partial projection.`,
  );
}

// ── 4. Emit generated projection ──────────────────────────────────────────────
const GEN_HEADER = `/* ═══════════════════════════════════════════════════════════════
   AUTO-GENERATED — DO NOT EDIT. Controlled counsel-review draft projection.
   Generator: apps/employee-journey/scripts/generateHandbookProjection.ts
   Source: content/handbook/2026-review/source/ (SHA-256 verified vs manifest).
   Document: ${manifest.document_id} · ${manifest.version} · ${manifest.status}
   Regenerate: npm run handbook:projection:generate
   ═══════════════════════════════════════════════════════════════ */
`;

fs.writeFileSync(
  path.join(OUT_DIR, "handbookSections.generated.ts"),
  GEN_HEADER +
    `
export interface HandbookSection {
  id: string;
  order: number;
  number: string;
  eyebrow: string;
  title: string;
  lead: string;
  /** Baked, sanitized-at-source section body HTML from the controlled draft. */
  bodyHtml: string;
  owner: string;
  policyIds: string[];
  formIds: string[];
  externalAuthorities: string[];
  employeeAction: string;
}

// Emitted via JSON.parse to avoid TS2590 on the large baked-HTML literal array.
export const HANDBOOK_SECTIONS: HandbookSection[] = JSON.parse(${JSON.stringify(
      JSON.stringify(sections),
    )}) as HandbookSection[];

export function getHandbookSection(id: string): HandbookSection | undefined {
  return HANDBOOK_SECTIONS.find((s) => s.id === id);
}
`,
  "utf8",
);

const meta = {
  documentId: manifest.document_id,
  version: manifest.version,
  status: manifest.status,
  statusLabel: "Counsel-review draft — not effective",
  notEffective: true,
  acknowledgmentEnabled: false,
  watermark: "COUNSEL-REVIEW DRAFT · NOT EFFECTIVE · PENDING APPROVAL",
  preparedDate: manifest.generated_at,
  proposedEffectiveDate: "Pending approval",
  sectionCount: manifest.section_count,
  policyReferenceCount: manifest.policy_reference_count,
  formReferenceCount: manifest.form_reference_count,
  externalSourceCount: manifest.external_source_count,
  policyCorpusCount: manifest.policy_corpus_count,
  policyCorpusPastNextReviewCount: manifest.policy_corpus_past_next_review_count,
  citedPolicyPastNextReviewCount: manifest.cited_policy_past_next_review_count,
  sourceHtmlSha256: htmlSha,
  legacy: {
    name: manifest.source_legacy_handbook.name,
    sha256: manifest.source_legacy_handbook.sha256,
    status: "RETIRED",
  },
};

fs.writeFileSync(
  path.join(OUT_DIR, "handbookMeta.generated.ts"),
  GEN_HEADER +
    `
export interface HandbookMeta {
  documentId: string;
  version: string;
  status: string;
  statusLabel: string;
  notEffective: boolean;
  acknowledgmentEnabled: boolean;
  watermark: string;
  preparedDate: string;
  proposedEffectiveDate: string;
  sectionCount: number;
  policyReferenceCount: number;
  formReferenceCount: number;
  externalSourceCount: number;
  policyCorpusCount: number;
  policyCorpusPastNextReviewCount: number;
  citedPolicyPastNextReviewCount: number;
  sourceHtmlSha256: string;
  legacy: { name: string; sha256: string; status: string };
}

export const HANDBOOK_META: HandbookMeta = ${JSON.stringify(meta, null, 2)};
`,
  "utf8",
);

// Integrity summary (for the ingestion report)
fs.writeFileSync(
  path.join(OUT_DIR, "ingestionIntegrity.generated.json"),
  JSON.stringify(
    { verifiedAt: manifest.generated_at, htmlSha256: htmlSha, files: integrity, sectionsParsed: sections.length },
    null,
    2,
  ) + "\n",
  "utf8",
);

console.log(`[handbook:projection:generate] ${sections.length} sections, ${crosswalk.size} crosswalk rows.`);
console.log(`  integrity: ${integrity.every((x) => x.ok) ? "ALL VERIFIED" : "FAILURE"}`);
console.log(`  wrote ${OUT_DIR}`);
