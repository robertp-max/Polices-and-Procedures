/**
 * WP-1.7 — No-bespoke-renderer architecture rules (Wave 1).
 *
 * Data-driven static scanners over the repo source tree (node fs/path only).
 * PRD refs: §9.1 (no-bespoke-renderer), §25.6 (architecture test triggers), §29 #16.
 *
 * Wave-1 is file-scan only. Rules that need runtime registries land in a later WP.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ─── Paths / walk ────────────────────────────────────────────────────────────

/** Repo-root-relative, POSIX-style path. */
export type RepoRelPath = string;

/**
 * Frozen legacy allowlist for pre-existing page-composition sites under PRD §9.1.
 *
 * Includes the required-reading legacy packet renderers plus additional pre-Wave-1
 * sites that independently match R1 heuristics (studio print chrome / audit HTML).
 * The list must not grow silently — `architecture.test.ts` snapshot-asserts the
 * exact contents of this export.
 *
 * Paths are repo-root-relative with forward slashes. A trailing `/*` entry
 * allowlists every file under that directory prefix (recursive).
 */
export const LEGACY_ALLOWLIST = [
  // Required-reading legacy packet composers
  'src/policy/qapi/renderQapiPacket.ts',
  'src/policy/admission/patientAdmissionPacket.tsx',
  'src/v6/screens/evidence/alpha/*',
  'public/care_indeed_pdf_studio.html',
  'server/admissionPacketPdf.ts',
  // Pre-existing sites that match independent R1 heuristics (Wave-1 freeze)
  'src/policy/audit/surveyPacket.ts',
  'src/v6/screens/evidence/StudioLanding.tsx',
  'src/v6/screens/evidence/SignatureTracker.tsx',
  'src/v6/screens/evidence/Defensible2StudioLanding.tsx',
  // Imported governance V3 reference artifact; served verbatim, not a packet renderer.
  'server/assets/governance-references/patient-admission-packet-letter-form.html',
] as const;

export type LegacyAllowlistEntry = (typeof LEGACY_ALLOWLIST)[number];

/** Approved home for platform page renderers (not subject to R1). */
export const APPROVED_RENDER_PREFIX = 'src/policy/packets/render/';

/**
 * Architecture scanner lives here. Excluded from R1 only (meta / fixture
 * builders may mention heuristic substrings via concatenation). R2 must pass
 * on this tree without exclusion — marker strings are built dynamically (F3).
 */
export const ARCHITECTURE_PREFIX = 'src/policy/packets/architecture/';

/** Packets subtrees excluded from R4 dependency-direction checks. */
export const PACKETS_PURITY_EXCLUDED_PREFIXES = [
  'src/policy/packets/testing/',
  'src/policy/packets/architecture/',
] as const;

/** Admission module — sole pre-platform owner of admission design tokens. */
export const ADMISSION_MODULE_PREFIX = 'src/policy/admission/';

/**
 * Packets rendering-PROFILE namespace only (F2).
 * Not the whole `packets/render/` tree — chrome tokens may live only in:
 * - the concrete registry file `registries/renderingProfiles.ts`
 * - a future `render/profiles/` path
 */
export const PACKETS_RENDERING_PROFILE_ALLOWLIST = [
  'src/policy/packets/registries/renderingProfiles.ts',
  'src/policy/packets/render/profiles/',
] as const;

const SCAN_ROOTS = ['src', 'server'] as const;

/** Source extensions that can embed page-composition HTML/CSS. */
const COMPOSITION_SOURCE_EXT = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.html',
  '.mjs',
  '.cjs',
]);

const SKIP_DIR_NAMES = new Set(['node_modules', '.git', 'dist', 'coverage']);

export function resolveRepoRoot(
  fromFile: string = fileURLToPath(import.meta.url),
): string {
  // src/policy/packets/architecture/<file> → repo root (4 levels up)
  return path.resolve(path.dirname(fromFile), '..', '..', '..', '..');
}

export function toRepoRelPosix(repoRoot: string, absPath: string): RepoRelPath {
  const rel = path.relative(repoRoot, absPath);
  return rel.split(path.sep).join('/');
}

export function isUnderPrefix(relPosix: string, prefix: string): boolean {
  return relPosix === prefix.replace(/\/$/, '') || relPosix.startsWith(prefix);
}

export function isLegacyAllowlisted(relPosix: string): boolean {
  for (const entry of LEGACY_ALLOWLIST) {
    if (entry.endsWith('/*')) {
      const prefix = entry.slice(0, -1); // keep trailing slash
      if (relPosix.startsWith(prefix)) return true;
    } else if (relPosix === entry) {
      return true;
    }
  }
  return false;
}

/** True when a path may hold admission chrome markers under R2. */
export function isAdmissionChromeAllowedPath(relPosix: string): boolean {
  if (isUnderPrefix(relPosix, ADMISSION_MODULE_PREFIX)) return true;
  for (const entry of PACKETS_RENDERING_PROFILE_ALLOWLIST) {
    if (entry.endsWith('/')) {
      if (isUnderPrefix(relPosix, entry)) return true;
    } else if (relPosix === entry) {
      return true;
    }
  }
  return false;
}

/**
 * Recursive walk of `src/` and `server/` under the repo root.
 * Skips `node_modules` and other build/VCS directories. No new deps.
 */
export function walkRepoSourceFiles(repoRoot: string): string[] {
  const out: string[] = [];

  const walkDir = (dirAbs: string): void => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dirAbs, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const full = path.join(dirAbs, ent.name);
      if (ent.isDirectory()) {
        if (SKIP_DIR_NAMES.has(ent.name)) continue;
        if (ent.name.startsWith('.')) continue;
        walkDir(full);
      } else if (ent.isFile()) {
        out.push(full);
      }
    }
  };

  for (const root of SCAN_ROOTS) {
    const abs = path.join(repoRoot, root);
    if (fs.existsSync(abs)) walkDir(abs);
  }

  return out;
}

export function readFileUtf8(absPath: string): string {
  return fs.readFileSync(absPath, 'utf8');
}

// ─── Heuristic detectors (pure; exported for negative self-tests) ────────────

/**
 * `page-break-after` appearing inside a template literal (backtick string).
 * Pair-aware scan (skips quotes/comments) so a closing backtick is not treated
 * as the open of the next span across non-template code.
 * Triggers R1 on its own (F1) — not only when combined with other heuristics.
 */
export function hasPageBreakAfterInTemplateLiteral(content: string): boolean {
  let i = 0;
  const n = content.length;
  while (i < n) {
    const ch = content[i];

    // Single- or double-quoted string
    if (ch === "'" || ch === '"') {
      const q = ch;
      i += 1;
      while (i < n) {
        if (content[i] === '\\') {
          i += 2;
          continue;
        }
        if (content[i] === q) {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }

    // Line comment
    if (ch === '/' && content[i + 1] === '/') {
      i += 2;
      while (i < n && content[i] !== '\n') i += 1;
      continue;
    }

    // Block comment
    if (ch === '/' && content[i + 1] === '*') {
      i += 2;
      while (i < n && !(content[i] === '*' && content[i + 1] === '/')) i += 1;
      i += 2;
      continue;
    }

    // Template literal
    if (ch === '`') {
      i += 1;
      let body = '';
      while (i < n) {
        if (content[i] === '\\') {
          body += content.slice(i, i + 2);
          i += 2;
          continue;
        }
        if (content[i] === '`') {
          i += 1;
          break;
        }
        // Rough ${...} skip so nested braces don't confuse the closer
        if (content[i] === '$' && content[i + 1] === '{') {
          body += '${';
          i += 2;
          let depth = 1;
          while (i < n && depth > 0) {
            if (content[i] === '{') depth += 1;
            else if (content[i] === '}') depth -= 1;
            body += content[i];
            i += 1;
          }
          continue;
        }
        body += content[i];
        i += 1;
      }
      if (body.includes('page-break-after')) return true;
      continue;
    }

    i += 1;
  }
  return false;
}

/** Classic QAPI multi-page sheet class block: `.pg{` / `.pg {`. */
export function hasPgCssBlock(content: string): boolean {
  return /\.pg\s*\{/.test(content);
}

/**
 * Letter-page body dimension used by flowing multi-page packet sheets.
 * Triggers R1 on its own (F1).
 */
export function hasMinHeight11in(content: string): boolean {
  return /min-height:\s*11in/.test(content);
}

/**
 * `@page{size:letter` letter-size at-page CSS string.
 * Case-sensitive `letter` matches the WP heuristic literal; triggers R1 alone (F1).
 */
export function hasAtPageLetter(content: string): boolean {
  return /@page\s*\{\s*size:\s*letter\b/.test(content);
}

/**
 * Packet-page composition signature (R1 composite).
 *
 * Each WP-1.7 heuristic flags independently (F1) — no AND combinations:
 * - `page-break-after` in a template literal
 * - `.pg{` CSS page block
 * - `min-height:11in` letter-page body
 * - `@page{size:letter` at-page size string
 */
export function hasPacketPageCompositionSignature(content: string): boolean {
  return (
    hasPageBreakAfterInTemplateLiteral(content) ||
    hasPgCssBlock(content) ||
    hasMinHeight11in(content) ||
    hasAtPageLetter(content)
  );
}

/**
 * Marker for the admission packet design-token / CSS block.
 * Built from parts so this architecture module never embeds the contiguous
 * marker string (R2 / F3).
 */
export function patientAdmissionPacketCssMarker(): string {
  return ['PATIENT_ADMISSION', '_PACKET_CSS'].join('');
}

export function hasPatientAdmissionPacketCssMarker(content: string): boolean {
  return content.includes(patientAdmissionPacketCssMarker());
}

/** True when a module specifier points at the V6 UI layer. */
export function isV6ModuleSpecifier(spec: string): boolean {
  const s = spec.trim();
  if (s === 'v6' || s.startsWith('v6/')) return true;
  if (s.startsWith('@/v6')) return true;
  if (s.startsWith('src/v6/') || s === 'src/v6') return true;
  // Relative / absolute path segment `…/v6/…` or trailing `/v6`
  if (/(?:^|\/)v6(?:\/|$)/.test(s)) return true;
  return false;
}

/**
 * True when a packets-domain module imports from the V6 UI layer.
 * Dependency direction: UI → domain, never domain → UI (PRD backbone).
 *
 * Covers (F4):
 * - `from '…'` / `from "…"`
 * - dynamic `import('…')`
 * - side-effect `import '…'` (no from clause)
 * - `require('…')`
 * - `import.meta.<fn>('…')` (glob / resolve / etc.)
 */
export function hasV6Import(content: string): boolean {
  const extractors: RegExp[] = [
    // from 'x' | import('x') | require('x')
    /(?:\bfrom\s+|\bimport\s*\(\s*|\brequire\s*\(\s*)['"]([^'"]+)['"]/g,
    // side-effect: import 'x' / import "x" (no binding, no from)
    /^\s*import\s+['"]([^'"]+)['"]\s*;?/gm,
    // import.meta.glob('…') / import.meta.resolve('…') / etc.
    /\bimport\.meta\.\w+\s*\(\s*['"]([^'"]+)['"]/g,
  ];

  for (const re of extractors) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      if (isV6ModuleSpecifier(m[1] ?? '')) return true;
    }
  }
  return false;
}

// ─── Rule model ──────────────────────────────────────────────────────────────

export type ArchitectureRuleId =
  | 'no-new-page-renderers'
  | 'no-copied-chrome'
  | 'no-js-in-src'
  | 'packets-namespace-purity';

export interface RuleFailure {
  ruleId: ArchitectureRuleId;
  /** PRD citation for failure messages (§25.6 architecture triggers). */
  prd: string;
  files: RepoRelPath[];
  message: string;
}

export interface ArchitectureRule {
  id: ArchitectureRuleId;
  title: string;
  prd: string;
  run: (ctx: ScanContext) => RuleFailure | null;
}

export interface ScanContext {
  repoRoot: string;
  /** Absolute paths from walkRepoSourceFiles. */
  files: string[];
}

export function formatRuleFailure(failure: RuleFailure): string {
  const list =
    failure.files.length === 0
      ? '(no files)'
      : failure.files.map((f) => `  - ${f}`).join('\n');
  return `[${failure.ruleId}] ${failure.message} (PRD ${failure.prd})\n${list}`;
}

// ─── Rules ───────────────────────────────────────────────────────────────────

/** R1 — no new bespoke packet page renderers outside the platform render home. */
export const ruleNoNewPageRenderers: ArchitectureRule = {
  id: 'no-new-page-renderers',
  title: 'No new packet page renderers outside packets/render + legacy allowlist',
  prd: '§25.6 / §9.1',
  run(ctx) {
    const offenders: RepoRelPath[] = [];
    for (const abs of ctx.files) {
      const rel = toRepoRelPosix(ctx.repoRoot, abs);
      if (isUnderPrefix(rel, APPROVED_RENDER_PREFIX)) continue;
      if (isUnderPrefix(rel, ARCHITECTURE_PREFIX)) continue;
      if (isLegacyAllowlisted(rel)) continue;
      const ext = path.extname(abs).toLowerCase();
      if (!COMPOSITION_SOURCE_EXT.has(ext)) continue;
      // Skip unit tests — they may mention signatures without being renderers.
      if (/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(rel)) continue;

      let content: string;
      try {
        content = readFileUtf8(abs);
      } catch {
        continue;
      }
      if (hasPacketPageCompositionSignature(content)) {
        offenders.push(rel);
      }
    }
    if (offenders.length === 0) return null;
    return {
      ruleId: 'no-new-page-renderers',
      prd: '§25.6 / §9.1',
      files: offenders.sort(),
      message:
        'New bespoke packet page renderer(s) detected outside src/policy/packets/render/ and LEGACY_ALLOWLIST',
    };
  },
};

/**
 * R2 — admission design chrome must not be copied outside admission module
 * and the packets rendering-PROFILE namespace specifically (F2).
 */
export const ruleNoCopiedChrome: ArchitectureRule = {
  id: 'no-copied-chrome',
  title:
    'Admission packet CSS/tokens only in admission + rendering-profile registry paths',
  prd: '§25.6',
  run(ctx) {
    const offenders: RepoRelPath[] = [];
    for (const abs of ctx.files) {
      const rel = toRepoRelPosix(ctx.repoRoot, abs);
      if (isAdmissionChromeAllowedPath(rel)) continue;
      const ext = path.extname(abs).toLowerCase();
      if (!COMPOSITION_SOURCE_EXT.has(ext) && ext !== '.css') continue;

      let content: string;
      try {
        content = readFileUtf8(abs);
      } catch {
        continue;
      }
      if (hasPatientAdmissionPacketCssMarker(content)) {
        offenders.push(rel);
      }
    }
    if (offenders.length === 0) return null;
    return {
      ruleId: 'no-copied-chrome',
      prd: '§25.6',
      files: offenders.sort(),
      message: `${patientAdmissionPacketCssMarker()} marker found outside admission module and packets rendering-profile namespace`,
    };
  },
};

/** R3 — no compiled `.js` under `src/` (repo AGENTS.md invariant). */
export const ruleNoJsInSrc: ArchitectureRule = {
  id: 'no-js-in-src',
  title: 'No .js files under src/',
  prd: '§25.6',
  run(ctx) {
    const offenders: RepoRelPath[] = [];
    for (const abs of ctx.files) {
      const rel = toRepoRelPosix(ctx.repoRoot, abs);
      if (!rel.startsWith('src/')) continue;
      if (path.extname(abs).toLowerCase() === '.js') {
        offenders.push(rel);
      }
    }
    if (offenders.length === 0) return null;
    return {
      ruleId: 'no-js-in-src',
      prd: '§25.6',
      files: offenders.sort(),
      message:
        'Compiled or stray .js file(s) under src/ (Vite resolves .js before .tsx — AGENTS.md)',
    };
  },
};

/** R4 — packets domain must not import from the V6 UI layer. */
export const rulePacketsNamespacePurity: ArchitectureRule = {
  id: 'packets-namespace-purity',
  title: 'src/policy/packets must not import from src/v6',
  prd: '§25.6',
  run(ctx) {
    const offenders: RepoRelPath[] = [];
    for (const abs of ctx.files) {
      const rel = toRepoRelPosix(ctx.repoRoot, abs);
      if (!rel.startsWith('src/policy/packets/')) continue;
      if (
        PACKETS_PURITY_EXCLUDED_PREFIXES.some((p) => isUnderPrefix(rel, p))
      ) {
        continue;
      }
      const ext = path.extname(abs).toLowerCase();
      if (ext !== '.ts' && ext !== '.tsx') continue;

      let content: string;
      try {
        content = readFileUtf8(abs);
      } catch {
        continue;
      }
      if (hasV6Import(content)) {
        offenders.push(rel);
      }
    }
    if (offenders.length === 0) return null;
    return {
      ruleId: 'packets-namespace-purity',
      prd: '§25.6',
      files: offenders.sort(),
      message:
        'Packets domain file(s) import from src/v6 (dependency direction: UI → domain only)',
    };
  },
};

/** All Wave-1 architecture rules, in stable order. */
export const ARCHITECTURE_RULES: readonly ArchitectureRule[] = [
  ruleNoNewPageRenderers,
  ruleNoCopiedChrome,
  ruleNoJsInSrc,
  rulePacketsNamespacePurity,
] as const;

export function buildScanContext(repoRoot: string = resolveRepoRoot()): ScanContext {
  return {
    repoRoot,
    files: walkRepoSourceFiles(repoRoot),
  };
}

export function runAllArchitectureRules(
  ctx: ScanContext = buildScanContext(),
): RuleFailure[] {
  const failures: RuleFailure[] = [];
  for (const rule of ARCHITECTURE_RULES) {
    const result = rule.run(ctx);
    if (result) failures.push(result);
  }
  return failures;
}
