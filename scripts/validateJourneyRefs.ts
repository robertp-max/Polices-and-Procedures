/* ═══════════════════════════════════════════════════════════════════════
   JOURNEY POLICY REFS VALIDATOR
   Loads allPoliciesContent, walks journey modules/lessons/quizzes (and
   embedded content) for policyRefs (arrays or inline mentions like
   "CL-CP-001" / "QA-PG-001 (Title)"), verifies each base policyId exists
   in the map (exact policyId or loose title match). Reports broken/outdated.
   Print summary. Safe, read-only; does not mutate app data.
   ═══════════════════════════════════════════════════════════════════════ */

import { allPoliciesContent } from '../src/policy/data/allPoliciesContent.generated.ts';
import { courseModules } from '../src/policy/journey/data/contentV2Adapter.ts';
import { ALL_MODULES } from '../src/policy/journey/data/modules.ts';
import { cms485PlanOfCareModule } from '../src/policy/journey/data/advancedTraining/cms485PlanOfCare.data.ts';
import { qapiModule } from '../src/policy/journey/data/advancedTraining/qapi.data.ts';
import * as appendices from '../src/policy/journey/data/appendices.ts';
import * as achcAssembled from '../src/policy/journey/data/ACHC_Annual_Assembled.ts';

type FoundRef = {
  ref: string;
  baseId: string;
  source: string;
  context?: string;
};

const POLICY_ID_RE = /\b([A-Z]{2,3}-[A-Z]{2,3}-\d{3})\b/g;

function extractBaseId(token: string): string {
  const m = token.match(/^([A-Z]{2,3}-[A-Z]{2,3}-\d{3})/);
  return m ? m[1] : token;
}

function collectFromValue(val: unknown, source: string, out: FoundRef[], seen: Set<string>) {
  if (val == null) return;
  if (typeof val === 'string') {
    let match: RegExpExecArray | null;
    while ((match = POLICY_ID_RE.exec(val)) !== null) {
      const raw = match[1];
      const base = extractBaseId(raw);
      const key = `${base}|${source}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ ref: raw, baseId: base, source, context: val.slice(Math.max(0, match.index - 20), match.index + 40) });
      }
    }
    return;
  }
  if (Array.isArray(val)) {
    for (const v of val) collectFromValue(v, source, out, seen);
    return;
  }
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    if (Array.isArray(obj.policyRefs)) {
      for (const r of obj.policyRefs as unknown[]) {
        if (typeof r === 'string') {
          const base = extractBaseId(r);
          const key = `${base}|${source}`;
          if (!seen.has(key)) {
            seen.add(key);
            out.push({ ref: r, baseId: base, source, context: 'policyRefs[]' });
          }
        }
      }
    }
    // also scan other likely fields + recurse
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'policyRefs') continue; // handled
      collectFromValue(v, `${source}.${k}`, out, seen);
    }
  }
}

function buildPolicyMap() {
  const byId = new Set<string>();
  const byTitle = new Map<string, string>(); // normalized title -> id
  for (const p of allPoliciesContent) {
    if (p.policyId) byId.add(p.policyId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = (p as any).title || (p.sections && p.sections.find((s: any) => s.title && s.title.includes('-'))?.title) || '';
    if (t) {
      byTitle.set(t.toLowerCase().trim(), p.policyId);
    }
  }
  return { byId, byTitle };
}

function verify(refBase: string, map: ReturnType<typeof buildPolicyMap>): { ok: boolean; matchedAs?: string } {
  if (map.byId.has(refBase)) return { ok: true, matchedAs: 'policyId' };
  // title match: see if any title contains the ref or ref looks like part of title
  for (const [title, id] of map.byTitle) {
    if (title.includes(refBase.toLowerCase()) || refBase.toLowerCase().includes(title.split(' ')[0]?.toLowerCase() || '')) {
      return { ok: true, matchedAs: `title~${id}` };
    }
  }
  return { ok: false };
}

function main() {
  console.log('=== Journey PolicyRefs Validator ===');
  const { byId, byTitle } = buildPolicyMap();
  console.log(`Loaded ${byId.size} policies from allPoliciesContent.`);

  const found: FoundRef[] = [];
  const seen = new Set<string>();

  // Walk primary journey structures
  collectFromValue(ALL_MODULES, 'modules.ts:ALL_MODULES', found, seen);
  collectFromValue(courseModules, 'contentV2Adapter:courseModules', found, seen);
  collectFromValue(cms485PlanOfCareModule, 'advancedTraining:cms485PlanOfCareModule', found, seen);
  collectFromValue(qapiModule, 'advancedTraining:qapiModule', found, seen);
  collectFromValue(appendices, 'appendices.ts', found, seen);
  collectFromValue(achcAssembled, 'ACHC_Annual_Assembled.ts', found, seen);

  // Also walk a few known lesson data files via their imports if top level exports have content
  // (lightweight: rely on stringify of above for embedded strings)

  // Dedup by baseId + source already via seen; now verify
  const broken: FoundRef[] = [];
  const valid: FoundRef[] = [];

  for (const f of found) {
    const res = verify(f.baseId, { byId, byTitle });
    if (res.ok) {
      valid.push(f);
    } else {
      broken.push(f);
    }
  }

  // Summary
  const uniqueBases = new Set(found.map(f => f.baseId));
  console.log(`Scanned sources. Found ${found.length} raw ref mentions across ${uniqueBases.size} unique base policy IDs.`);
  console.log(`Valid: ${valid.length}`);
  console.log(`Broken/outdated/missing: ${broken.length}`);

  if (broken.length > 0) {
    console.log('\n--- BROKEN / OUTDATED REFS ---');
    const grouped = new Map<string, FoundRef[]>();
    for (const b of broken) {
      if (!grouped.has(b.baseId)) grouped.set(b.baseId, []);
      grouped.get(b.baseId)!.push(b);
    }
    for (const [id, items] of grouped) {
      console.log(`  ${id} (referenced ${items.length} time(s))`);
      for (const it of items.slice(0, 2)) {
        console.log(`    - source: ${it.source} | context: ${it.context?.slice(0, 80) || ''}`);
      }
    }
    console.log('\nRecommendation: update to current policyId from allPoliciesContent (e.g. CL-CP-001, QA-PG-001) or remove stale ref.');
  } else {
    console.log('\nAll discovered policyRefs resolve to current policies (by policyId or title match).');
  }

  // Show a few examples of valid ones for inventory
  const sampleValidBases = [...new Set(valid.map(v => v.baseId))].slice(0, 8);
  console.log(`\nSample valid refs found: ${sampleValidBases.join(', ')} ...`);

  // Also list any generic 'agency policy' style still present in advanced (light inventory)
  const advancedText = JSON.stringify([cms485PlanOfCareModule, qapiModule]);
  const genericHits = (advancedText.match(/agency policy|Agency policy|internal policy|policy manual|written policy/g) || []).length;
  console.log(`\nLight inventory note: ${genericHits} generic policy mentions remain in advancedTraining content (some are intentional counter-examples in scenarios).`);

  console.log('\n=== Validation complete ===');
  if (broken.length > 0) {
    process.exitCode = 1;
  }
}

main();
