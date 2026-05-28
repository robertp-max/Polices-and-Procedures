/**
 * POLICY_VIEWER_V3_2_HH_EVIDENCE_VALIDATOR.cjs
 * Data integrity + CMS ACHC HH Evidence Mapping validator (Phase 5)
 * Surgical enhancement over audit-achc-hh-evidence-mapping.cjs
 * Locked scope: references only achcHhEvidenceMap.ts + allPoliciesContent.generated.ts + policy_hh_section_map.csv
 * No edits to generated files. Read-only on source data. No broad prints.
 */
const fs = require('fs');
const path = require('path');

const GENERATED = path.join(process.cwd(), 'src/policy/data/allPoliciesContent.generated.ts');
const CSV = path.join(process.cwd(), 'src/policy/data/policy_hh_section_map.csv');
const OUT_DIR = path.join(process.cwd(), 'Builder/_system');
const REPORT = path.join(OUT_DIR, `POLICY_VIEWER_V3_2_HH_EVIDENCE_VALIDATION_REPORT_${new Date().toISOString().slice(0,10)}.md`);

function normalizeTitle(t) {
  if (!t) return '';
  return t.replace(/\\\./g, '.').replace(/\s+/g, ' ').trim().toLowerCase();
}

function extractPoliciesAndSections(raw) {
  const policies = new Map(); // policyId -> { sections: [{id, title, body}], rawBlock }
  const policyIdRegex = /"policyId"\s*:\s*"([^"]+)"/g;
  let match;
  const positions = [];
  while ((match = policyIdRegex.exec(raw)) !== null) {
    positions.push({ id: match[1], index: match.index });
  }

  for (let i = 0; i < positions.length; i++) {
    const { id: policyId, index: start } = positions[i];
    const end = (i + 1 < positions.length) ? positions[i + 1].index : raw.length;
    const block = raw.slice(start, end);

    const sections = [];
    // Extract sections within this policy block
    const secRegex = /\{\s*"id"\s*:\s*"([^"]+)"\s*,\s*"title"\s*:\s*"([^"]*(?:\\.[^"]*)*)"[\s\S]*?"body"\s*:\s*"([\s\S]*?)"\s*,\s*"scormChunkHint"/g;
    let s;
    while ((s = secRegex.exec(block)) !== null) {
      const sid = s[1];
      let stitle = s[2] || '';
      let body = s[3] || '';
      // Unescape common JSON escapes in title/body samples
      stitle = stitle.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      body = body.replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\n/g, '\n');
      sections.push({ id: sid, title: stitle, body: body.trim() });
    }
    policies.set(policyId, { sections });
  }
  return policies;
}

function parseCsvSimple(raw) {
  // Minimal robust enough for this CSV: first 5 cols are key (policyId, title, hh, sectionId, sectionTitle)
  // supporting_content and later may contain commas but we stop early.
  const rows = [];
  const lines = raw.split(/\r?\n/);
  for (let i = 1; i < lines.length; i++) { // skip header
    const line = lines[i].trim();
    if (!line) continue;
    // Split but respect basic quotes for first few fields only
    const cols = [];
    let cur = '';
    let inQ = false;
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') {
        inQ = !inQ;
        continue;
      }
      if (ch === ',' && !inQ) {
        cols.push(cur.trim());
        cur = '';
        if (cols.length >= 5) break; // we only need first 5
      } else {
        cur += ch;
      }
    }
    cols.push(cur.trim());
    const policyId = cols[0] || '';
    const sectionId = cols[3] || '';
    const sectionTitle = cols[4] || '';
    if (policyId && sectionId) {
      rows.push({ policyId, sectionId, sectionTitle });
    }
  }
  return rows;
}

console.log('=== POLICY_VIEWER_V3_2 HH EVIDENCE VALIDATOR (Phase 5) ===');

const rawGenerated = fs.readFileSync(GENERATED, 'utf8');
const csvRaw = fs.readFileSync(CSV, 'utf8');

const policies = extractPoliciesAndSections(rawGenerated);
const totalPolicies = policies.size;

let totalSections = 0;
const duplicatePolicyIds = [];
const duplicateSectionIdsPerPolicy = [];
const emptyBodySections = []; // samples {policyId, sectionId, title}

for (const [pid, data] of policies.entries()) {
  totalSections += data.sections.length;
  // dups within policy
  const seen = new Set();
  const dups = [];
  for (const sec of data.sections) {
    if (seen.has(sec.id)) dups.push(sec.id);
    seen.add(sec.id);
    if (!sec.body || sec.body.length < 5) {
      if (emptyBodySections.length < 8) emptyBodySections.push({ policyId: pid, sectionId: sec.id, title: sec.title });
    }
  }
  if (dups.length > 0) {
    duplicateSectionIdsPerPolicy.push({ policyId: pid, dups });
  }
}

// Check global policyId dups (should be 0)
const allPidMatches = rawGenerated.match(/"policyId"\s*:\s*"([^"]+)"/g) || [];
if (allPidMatches.length !== totalPolicies) {
  // crude secondary check
  duplicatePolicyIds.push('Count mismatch between regex and map (possible dups)');
}

const hhRows = parseCsvSimple(csvRaw);
const mapPolicyIds = new Set(hhRows.map(r => r.policyId));
const totalMapRows = hhRows.length;
const uniqueMapPolicies = mapPolicyIds.size;

const missingFromGenerated = [];
for (const pid of mapPolicyIds) {
  if (!policies.has(pid)) missingFromGenerated.push(pid);
}

const unresolvedAnchors = [];
for (const row of hhRows) {
  const p = policies.get(row.policyId);
  if (!p) continue; // already counted in missing
  let resolved = false;
  for (const sec of p.sections) {
    if (sec.id === row.sectionId) {
      resolved = true;
      break;
    }
    if (normalizeTitle(sec.title) === normalizeTitle(row.sectionTitle)) {
      resolved = true;
      break;
    }
  }
  if (!resolved) {
    unresolvedAnchors.push({
      policyId: row.policyId,
      sectionId: row.sectionId,
      sectionTitle: row.sectionTitle
    });
  }
}

const reportDate = new Date().toISOString();

let md = `# POLICY_VIEWER_V3_2 HH EVIDENCE VALIDATION REPORT
**Generated:** ${reportDate}
**Scope:** Builder/_system/ (references only achcHhEvidenceMap.ts + allPoliciesContent.generated.ts + policy_hh_section_map.csv)
**Rules:** No generated edits. Surgical. Read-only data access.

## Executive Summary
- Total policies in generated: **${totalPolicies}**
- Total sections across all policies: **${totalSections}**
- Unique policyIds in HH Evidence map (CSV): **${uniqueMapPolicies}**
- Total HH Evidence mapping rows: **${totalMapRows}**
- Policies referenced in map but MISSING from generated: **${missingFromGenerated.length}**
- Unresolved section anchors (no id match + no normalized title match): **${unresolvedAnchors.length}**
- Policies with duplicate sectionIds (within same policy): **${duplicateSectionIdsPerPolicy.length}**
- Global duplicate policyIds detected: **${duplicatePolicyIds.length}**
- Suspicious near-empty body sections sampled: **${emptyBodySections.length}** (examples below)

**ALL hhEvidenceRows policyIds present in generated?** ${missingFromGenerated.length === 0 ? 'YES — 100% coverage.' : 'NO — see missing list.'}

## Detailed Metrics

### Policy & Section Counts
- Generated policies: ${totalPolicies} (target 269)
- Total sections: ${totalSections} (avg ~${(totalSections / totalPolicies).toFixed(1)} per policy)

### Duplicate Detection
- Duplicate policyIds (global): ${duplicatePolicyIds.length === 0 ? '0 — PASS' : duplicatePolicyIds.join(', ')}
- Policies with internal duplicate sectionIds: ${duplicateSectionIdsPerPolicy.length === 0 ? '0 — PASS' : duplicateSectionIdsPerPolicy.length}
${duplicateSectionIdsPerPolicy.length > 0 ? duplicateSectionIdsPerPolicy.map(d => `  - ${d.policyId}: [${d.dups.join(', ')}]`).join('\n') : ''}

### Suspicious Empty / Near-Empty Bodies (sample)
${emptyBodySections.length > 0 ? emptyBodySections.map(e => `- ${e.policyId} :: ${e.sectionId} ("${e.title}")`).join('\n') : 'None detected in sampling.'}

### HH Evidence Map Policy Coverage
- Unique policies referenced: ${uniqueMapPolicies}
- Rows with policyId absent from generated: ${missingFromGenerated.length}
${missingFromGenerated.length > 0 ? 'Missing policyIds:\n' + missingFromGenerated.map(p => `- ${p}`).join('\n') : 'None — all referenced policy IDs exist in generated corpus.'}

### Unresolved Section Anchors (Exact IDs)
These rows in policy_hh_section_map.csv have a policyId that exists, but neither exact \`sectionId\` match nor normalized \`sectionTitle\` match in the policy's sections array.
${unresolvedAnchors.length === 0 ? '**None found.** All anchors resolve (id match or title normalization fallback).' : unresolvedAnchors.map(u => `- Policy: ${u.policyId} | sectionId: "${u.sectionId}" | sectionTitle: "${u.sectionTitle}"`).join('\n')}

## Validation Methodology (in this script)
1. Deep regex extraction of every policyId + its sections[] (id, title, body).
2. Per-policy duplicate sectionId scan + empty body detection.
3. CSV parse (first 5 columns; sufficient for policyId/sectionId/sectionTitle).
4. For every evidence row: policy existence check → sectionId exact OR normalizeTitle(title) match.
5. Aggregated counts + explicit lists (never hidden).

## Immediate Repair Guidance (if issues found)
- If unresolved >0: cross-check the exact policy section inventory in generated vs CSV row. Update CSV section_id or section_title (prefer id alignment).
- Empty bodies: expected for certain placeholder compliance/measurement sections (e.g. 20-*-considerations). No action unless content required.
- Duplicates: regeneration of allPoliciesContent.generated.ts required (do not hand-edit).
- Missing policies: source data reconciliation in Builder pipeline.

This report + the validator script (POLICY_VIEWER_V3_2_HH_EVIDENCE_VALIDATOR.cjs) provide ground truth for ACHC HH Evidence viewer integrity (Policy Viewer V3.2 / framework/achc-survey hh-evidence path).

---
*Validator created under locked Phase 5 scope. Re-run after any generated or CSV changes.*
`;

fs.writeFileSync(REPORT, md);
console.log('Report written to', REPORT);
console.log('=== HH EVIDENCE VALIDATION COMPLETE (0 prints of full data) ===');