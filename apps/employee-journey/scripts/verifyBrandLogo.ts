/* ═══════════════════════════════════════════════════════════════
   verifyBrandLogo.ts — canonical-logo drift gate for app/

   Run with:
     npx tsx scripts/verifyBrandLogo.ts

   FAILS (process.exit(1)) if any employee-facing source file under
   app/ references a logo-looking asset path other than the one
   approved canonical file, or defines an inline <svg> that appears to
   be a hand-drawn Care Indeed brand mark.

   Canonical asset:  /assets/logo-careindeed-orange.png
   Canonical component: app/journey/_components/CareIndeedBrand.tsx

   This is a plain Node fs + regex scanner — no dependencies beyond the
   Node standard library, so it can run in CI without extra installs.
   ═══════════════════════════════════════════════════════════════ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_ROOT = path.resolve(__dirname, ".."); // apps/employee-journey
const SCAN_DIR = path.join(APP_ROOT, "app");

const CANONICAL_ASSET = "/assets/logo-careindeed-orange.png";
const CANONICAL_COMPONENT_BASENAME = "CareIndeedBrand.tsx";

const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css"]);

// Directories we never need to walk into.
const IGNORE_DIR_NAMES = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  ".git",
]);

interface Finding {
  file: string;
  line: number;
  snippet: string;
  reason: string;
}

const findings: Finding[] = [];

function listFilesRecursive(dir: string, out: string[] = []): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORE_DIR_NAMES.has(entry.name)) continue;
      listFilesRecursive(path.join(dir, entry.name), out);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (SCAN_EXTENSIONS.has(ext)) {
        out.push(path.join(dir, entry.name));
      }
    }
  }
  return out;
}

/**
 * Matches candidate logo references: img src="...", url(...) in CSS/JS,
 * or plain string literals containing "logo" (case-insensitive) that look
 * like a path (start with / or contain a file extension).
 */
const LOGO_PATH_PATTERN =
  /(?:src\s*=\s*["'{]?|url\(\s*["']?)([^"')\s;]*logo[^"')\s;]*)/gi;

/**
 * Matches an inline <svg ...> ... </svg> block so we can inspect its
 * contents for a hand-drawn Care Indeed wordmark.
 */
const INLINE_SVG_BLOCK_PATTERN = /<svg\b[\s\S]*?<\/svg>/gi;
const CARE_INDEED_TEXT_PATTERN = /care\s*indeed/i;

function isAllowlistedFile(absPath: string): boolean {
  return path.basename(absPath) === CANONICAL_COMPONENT_BASENAME;
}

function checkLogoPaths(absPath: string, relPath: string, content: string) {
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match: RegExpExecArray | null;
    LOGO_PATH_PATTERN.lastIndex = 0;
    while ((match = LOGO_PATH_PATTERN.exec(line)) !== null) {
      const candidate = match[1];
      if (!candidate) continue;
      // Only care about things that look like actual asset paths, not
      // identifiers like "logoUrl" being assigned from a variable.
      const looksLikePath = candidate.startsWith("/") || /\.[a-z0-9]{2,5}$/i.test(candidate);
      if (!looksLikePath) continue;
      if (candidate === CANONICAL_ASSET) continue;
      // A relative/self reference to the canonical file name is fine too.
      if (candidate.endsWith("logo-careindeed-orange.png")) continue;

      findings.push({
        file: relPath,
        line: i + 1,
        snippet: line.trim().slice(0, 160),
        reason: `Unapproved logo path "${candidate}" — only ${CANONICAL_ASSET} is allowed.`,
      });
    }
  }
}

function checkInlineSvgBrandMarks(absPath: string, relPath: string, content: string) {
  let match: RegExpExecArray | null;
  INLINE_SVG_BLOCK_PATTERN.lastIndex = 0;
  while ((match = INLINE_SVG_BLOCK_PATTERN.exec(content)) !== null) {
    const block = match[0];
    if (CARE_INDEED_TEXT_PATTERN.test(block)) {
      const upToMatch = content.slice(0, match.index);
      const line = upToMatch.split("\n").length;
      findings.push({
        file: relPath,
        line,
        snippet: block.trim().slice(0, 160).replace(/\s+/g, " "),
        reason:
          "Inline <svg> block appears to render a Care Indeed wordmark/brand mark. Use <CareIndeedBrand /> instead of a hand-drawn SVG logo.",
      });
    }
  }
}

function main() {
  if (!fs.existsSync(SCAN_DIR)) {
    console.error(`verifyBrandLogo: scan directory not found: ${SCAN_DIR}`);
    process.exit(1);
  }

  const files = listFilesRecursive(SCAN_DIR);

  for (const absPath of files) {
    if (isAllowlistedFile(absPath)) continue;

    const relPath = path.relative(APP_ROOT, absPath).replace(/\\/g, "/");
    const content = fs.readFileSync(absPath, "utf8");

    checkLogoPaths(absPath, relPath, content);
    checkInlineSvgBrandMarks(absPath, relPath, content);
  }

  console.log("── verifyBrandLogo ──────────────────────────────────");
  console.log(`Scanned ${files.length} files under ${path.relative(APP_ROOT, SCAN_DIR)}/`);
  console.log(`Canonical asset:     ${CANONICAL_ASSET}`);
  console.log(`Canonical component: app/journey/_components/${CANONICAL_COMPONENT_BASENAME}`);
  console.log("");

  if (findings.length === 0) {
    console.log("PASS — no unapproved logo references or inline brand-mark SVGs found.");
    process.exit(0);
  }

  console.log(`FAIL — ${findings.length} unapproved logo reference(s) found:\n`);
  for (const f of findings) {
    console.log(`  ${f.file}:${f.line}`);
    console.log(`    ${f.reason}`);
    console.log(`    > ${f.snippet}`);
    console.log("");
  }
  process.exit(1);
}

main();
