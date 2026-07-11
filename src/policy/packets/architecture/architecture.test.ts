/**
 * WP-1.7 — No-bespoke-renderer architecture test (Wave 1).
 *
 * Runs every static architecture rule against the worktree and includes
 * negative self-tests (one fixture per R1 heuristic; R4 side-effect import)
 * so the suite is not vacuous.
 *
 * PRD: §9.1, §25.6, §29 #16.
 */
// @vitest-environment node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import {
  ARCHITECTURE_RULES,
  LEGACY_ALLOWLIST,
  buildScanContext,
  formatRuleFailure,
  hasAtPageLetter,
  hasMinHeight11in,
  hasPacketPageCompositionSignature,
  hasPageBreakAfterInTemplateLiteral,
  hasPatientAdmissionPacketCssMarker,
  hasPgCssBlock,
  hasV6Import,
  patientAdmissionPacketCssMarker,
  ruleNoCopiedChrome,
  ruleNoJsInSrc,
  ruleNoNewPageRenderers,
  rulePacketsNamespacePurity,
  runAllArchitectureRules,
  type RuleFailure,
  type ScanContext,
} from './rules';

// ─── Fixture builders (parts joined so this file never self-flags R1/R2) ─────

function parts(...xs: string[]): string {
  return xs.join('');
}

/** R1 heuristic fixtures — each embeds exactly one composition signal (F5). */
function fixturePageBreakAfterInTemplateLiteral(): string {
  const pba = parts('page-break-', 'after:always');
  return ['export const css = `', '.sheet{' + pba + '}', '`;'].join('\n');
}

function fixturePgCssBlock(): string {
  const pg = parts('.', 'pg{');
  return 'const s = "' + pg + 'margin:0;}"';
}

function fixtureMinHeight11in(): string {
  const minH = parts('min-height:', '11in');
  return 'const s = ".' + 'page{' + minH + '}"';
}

function fixtureAtPageLetter(): string {
  const atPage = parts('@page{', 'size:letter;margin:0;}');
  return 'const s = "' + atPage + '"';
}

function fixtureCopiedChrome(): string {
  return `export const ${patientAdmissionPacketCssMarker()} = '.ci-admission-page{}';`;
}

function fixtureV6NamedImport(): string {
  return [
    "import { Something } from '",
    parts('@/', 'v6/screens/evidence/StudioLanding'),
    "';",
  ].join('');
}

function fixtureV6SideEffectImport(): string {
  return ["import '", parts('@/', 'v6/screens/evidence/bootstrap'), "';"].join(
    '',
  );
}

function fixtureV6Require(): string {
  return [
    "const m = require('",
    parts('@/', 'v6/screens/evidence/StudioLanding'),
    "');",
  ].join('');
}

function fixtureV6ImportMeta(): string {
  return [
    "const mods = import.meta.glob('",
    parts('@/', 'v6/screens/**/*.tsx'),
    "');",
  ].join('');
}

function expectFailureMessageNamesFiles(failure: RuleFailure): void {
  const msg = formatRuleFailure(failure);
  expect(msg).toMatch(/§25\.6/);
  expect(msg).toContain(failure.ruleId);
  for (const f of failure.files) {
    expect(msg).toContain(f);
  }
}

function makeTempRepo(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'wp17-arch-'));
}

function writeTemp(repoRoot: string, relPosix: string, content: string): string {
  const abs = path.join(repoRoot, ...relPosix.split('/'));
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, 'utf8');
  return abs;
}

const tempRoots: string[] = [];
afterEach(() => {
  while (tempRoots.length > 0) {
    const root = tempRoots.pop();
    if (!root) break;
    try {
      fs.rmSync(root, { recursive: true, force: true });
    } catch {
      // best-effort cleanup
    }
  }
});

// ─── Allowlist freeze ────────────────────────────────────────────────────────

describe('LEGACY_ALLOWLIST freeze (must not grow silently)', () => {
  it('snapshot-asserts the exact allowlist contents', () => {
    expect([...LEGACY_ALLOWLIST]).toEqual([
      'src/policy/qapi/renderQapiPacket.ts',
      'src/policy/admission/patientAdmissionPacket.tsx',
      'src/v6/screens/evidence/alpha/*',
      'public/care_indeed_pdf_studio.html',
      'server/admissionPacketPdf.ts',
      'src/policy/audit/surveyPacket.ts',
      'src/v6/screens/evidence/StudioLanding.tsx',
      'src/v6/screens/evidence/SignatureTracker.tsx',
      'src/v6/screens/evidence/Defensible2StudioLanding.tsx',
    ]);
  });
});

// ─── Negative self-tests (prove each detector / rule can fire) ───────────────

describe('negative self-tests (detector can fire)', () => {
  describe('R1: each page-composition heuristic fires standalone (F1/F5)', () => {
    it('page-break-after in a template literal alone triggers the composite', () => {
      const fixture = fixturePageBreakAfterInTemplateLiteral();
      expect(hasPageBreakAfterInTemplateLiteral(fixture)).toBe(true);
      expect(hasPgCssBlock(fixture)).toBe(false);
      expect(hasMinHeight11in(fixture)).toBe(false);
      expect(hasAtPageLetter(fixture)).toBe(false);
      expect(hasPacketPageCompositionSignature(fixture)).toBe(true);
    });

    it('.pg{ CSS block alone triggers the composite', () => {
      const fixture = fixturePgCssBlock();
      expect(hasPgCssBlock(fixture)).toBe(true);
      expect(hasPageBreakAfterInTemplateLiteral(fixture)).toBe(false);
      expect(hasMinHeight11in(fixture)).toBe(false);
      expect(hasAtPageLetter(fixture)).toBe(false);
      expect(hasPacketPageCompositionSignature(fixture)).toBe(true);
    });

    it('min-height:11in alone triggers the composite', () => {
      const fixture = fixtureMinHeight11in();
      expect(hasMinHeight11in(fixture)).toBe(true);
      expect(hasPageBreakAfterInTemplateLiteral(fixture)).toBe(false);
      expect(hasPgCssBlock(fixture)).toBe(false);
      expect(hasAtPageLetter(fixture)).toBe(false);
      expect(hasPacketPageCompositionSignature(fixture)).toBe(true);
    });

    it('@page{size:letter alone triggers the composite', () => {
      const fixture = fixtureAtPageLetter();
      expect(hasAtPageLetter(fixture)).toBe(true);
      expect(hasPageBreakAfterInTemplateLiteral(fixture)).toBe(false);
      expect(hasPgCssBlock(fixture)).toBe(false);
      expect(hasMinHeight11in(fixture)).toBe(false);
      expect(hasPacketPageCompositionSignature(fixture)).toBe(true);
    });

    it('clean control has no composition signature', () => {
      expect(hasPacketPageCompositionSignature('export const x = 1;')).toBe(
        false,
      );
    });

    it('rule runner names the offending file and PRD §25.6', () => {
      const root = makeTempRepo();
      tempRoots.push(root);
      const rel = 'src/policy/evil/bespokeRenderer.ts';
      // Use a single-heuristic fixture so the runner path is proven too
      writeTemp(root, rel, fixtureMinHeight11in());
      const ctx: ScanContext = {
        repoRoot: root,
        files: [path.join(root, ...rel.split('/'))],
      };
      const failure = ruleNoNewPageRenderers.run(ctx);
      expect(failure).not.toBeNull();
      expect(failure!.ruleId).toBe('no-new-page-renderers');
      expect(failure!.files).toContain(rel);
      expectFailureMessageNamesFiles(failure!);
    });
  });

  it('R2: admission chrome marker detector fires on fixture', () => {
    const fixture = fixtureCopiedChrome();
    expect(hasPatientAdmissionPacketCssMarker(fixture)).toBe(true);
    expect(hasPatientAdmissionPacketCssMarker('const css = ".other{}"')).toBe(
      false,
    );
  });

  it('R2: rule runner names the offending file and PRD §25.6', () => {
    const root = makeTempRepo();
    tempRoots.push(root);
    const rel = 'src/policy/evil/copiedChrome.ts';
    writeTemp(root, rel, fixtureCopiedChrome());
    const ctx: ScanContext = {
      repoRoot: root,
      files: [path.join(root, ...rel.split('/'))],
    };
    const failure = ruleNoCopiedChrome.run(ctx);
    expect(failure).not.toBeNull();
    expect(failure!.ruleId).toBe('no-copied-chrome');
    expect(failure!.files).toContain(rel);
    expectFailureMessageNamesFiles(failure!);
  });

  it('R2: marker under packets/render/ (non-profile) is an offender', () => {
    const root = makeTempRepo();
    tempRoots.push(root);
    const rel = 'src/policy/packets/render/evilChrome.ts';
    writeTemp(root, rel, fixtureCopiedChrome());
    const ctx: ScanContext = {
      repoRoot: root,
      files: [path.join(root, ...rel.split('/'))],
    };
    const failure = ruleNoCopiedChrome.run(ctx);
    expect(failure).not.toBeNull();
    expect(failure!.files).toContain(rel);
  });

  it('R2: marker under render/profiles/ is allowed', () => {
    const root = makeTempRepo();
    tempRoots.push(root);
    const rel = 'src/policy/packets/render/profiles/admission.ts';
    writeTemp(root, rel, fixtureCopiedChrome());
    const ctx: ScanContext = {
      repoRoot: root,
      files: [path.join(root, ...rel.split('/'))],
    };
    expect(ruleNoCopiedChrome.run(ctx)).toBeNull();
  });

  it('R2: marker in registries/renderingProfiles.ts is allowed', () => {
    const root = makeTempRepo();
    tempRoots.push(root);
    const rel = 'src/policy/packets/registries/renderingProfiles.ts';
    writeTemp(root, rel, fixtureCopiedChrome());
    const ctx: ScanContext = {
      repoRoot: root,
      files: [path.join(root, ...rel.split('/'))],
    };
    expect(ruleNoCopiedChrome.run(ctx)).toBeNull();
  });

  it('R3: no-js-in-src rule fails for .js under src/ and names the file', () => {
    const root = makeTempRepo();
    tempRoots.push(root);
    const jsRel = 'src/policy/evil/shadow.js';
    const tsRel = 'src/policy/evil/ok.ts';
    const serverRel = 'server/ok.js';
    writeTemp(root, jsRel, 'export const x = 1;');
    writeTemp(root, tsRel, 'export const x = 1;');
    writeTemp(root, serverRel, 'export const x = 1;');
    const ctx: ScanContext = {
      repoRoot: root,
      files: [
        path.join(root, ...jsRel.split('/')),
        path.join(root, ...tsRel.split('/')),
        path.join(root, ...serverRel.split('/')),
      ],
    };
    const failure = ruleNoJsInSrc.run(ctx);
    expect(failure).not.toBeNull();
    expect(failure!.ruleId).toBe('no-js-in-src');
    expect(failure!.files).toContain(jsRel);
    expect(failure!.files).not.toContain(serverRel);
    expectFailureMessageNamesFiles(failure!);
  });

  describe('R4: v6 dependency detectors (including side-effect / require / import.meta)', () => {
    it('named from-import fires', () => {
      expect(hasV6Import(fixtureV6NamedImport())).toBe(true);
      expect(hasV6Import("import { x } from './identity';")).toBe(false);
      expect(hasV6Import("import { x } from 'some-v6-helper';")).toBe(false);
    });

    it('side-effect import (no from clause) fires (F4/F5)', () => {
      expect(hasV6Import(fixtureV6SideEffectImport())).toBe(true);
      expect(hasV6Import("import './local-side-effect';")).toBe(false);
    });

    it('require() of a v6 path fires (F4)', () => {
      expect(hasV6Import(fixtureV6Require())).toBe(true);
      expect(hasV6Import("require('./identity')")).toBe(false);
    });

    it('import.meta.* of a v6 path fires (F4)', () => {
      expect(hasV6Import(fixtureV6ImportMeta())).toBe(true);
      expect(hasV6Import("import.meta.glob('./local/**/*.ts')")).toBe(false);
    });

    it('rule runner names the offending file and PRD §25.6', () => {
      const root = makeTempRepo();
      tempRoots.push(root);
      const rel = 'src/policy/packets/contracts/evil.ts';
      writeTemp(root, rel, fixtureV6SideEffectImport());
      const ctx: ScanContext = {
        repoRoot: root,
        files: [path.join(root, ...rel.split('/'))],
      };
      const failure = rulePacketsNamespacePurity.run(ctx);
      expect(failure).not.toBeNull();
      expect(failure!.ruleId).toBe('packets-namespace-purity');
      expect(failure!.files).toContain(rel);
      expectFailureMessageNamesFiles(failure!);
    });
  });
});

// ─── Full worktree scan (must pass on current tree) ──────────────────────────

describe('architecture rules against current worktree', () => {
  const ctx = buildScanContext();

  it('exposes all four Wave-1 rules', () => {
    expect(ARCHITECTURE_RULES.map((r) => r.id)).toEqual([
      'no-new-page-renderers',
      'no-copied-chrome',
      'no-js-in-src',
      'packets-namespace-purity',
    ]);
  });

  it('R1 no-new-page-renderers: passes (legacy allowlisted)', () => {
    const failure = ruleNoNewPageRenderers.run(ctx);
    if (failure) throw new Error(formatRuleFailure(failure));
    expect(failure).toBeNull();
  });

  it('R2 no-copied-chrome: passes (marker only in admission / profile paths)', () => {
    const failure = ruleNoCopiedChrome.run(ctx);
    if (failure) throw new Error(formatRuleFailure(failure));
    expect(failure).toBeNull();
  });

  it('R3 no-js-in-src: passes (zero .js under src/)', () => {
    const failure = ruleNoJsInSrc.run(ctx);
    if (failure) throw new Error(formatRuleFailure(failure));
    expect(failure).toBeNull();
  });

  it('R4 packets-namespace-purity: passes (no packets → v6 imports)', () => {
    const failure = rulePacketsNamespacePurity.run(ctx);
    if (failure) throw new Error(formatRuleFailure(failure));
    expect(failure).toBeNull();
  });

  it('runAllArchitectureRules: zero failures on current tree', () => {
    const failures = runAllArchitectureRules(ctx);
    if (failures.length > 0) {
      throw new Error(failures.map(formatRuleFailure).join('\n\n'));
    }
    expect(failures).toEqual([]);
  });
});

// ─── F3: architecture sources must not embed the contiguous chrome marker ────

describe('architecture source hygiene (F3)', () => {
  it('rules.ts and architecture.test.ts do not contain the contiguous marker', () => {
    const marker = patientAdmissionPacketCssMarker();
    const here = path.dirname(fileURLToPath(import.meta.url));
    for (const name of ['rules.ts', 'architecture.test.ts']) {
      const src = fs.readFileSync(path.join(here, name), 'utf8');
      expect(src.includes(marker)).toBe(false);
    }
  });
});
