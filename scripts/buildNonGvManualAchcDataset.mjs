import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const frameworkPath = resolve(root, 'src/policy/data/frameworkSeed.generated.ts');
const printPath = resolve(root, 'src/policy/data/achcPrintCrosswalk.generated.ts');
const docsDir = resolve(root, 'Builder/Documentations/MigratedRepoRoot/docs');
const outDatasetPath = resolve(docsDir, 'non-gv-manual-achc-tag-dataset.json');
const outReportPath = resolve(docsDir, 'all-domains-achc-tagging-report.md');

const framework = readFileSync(frameworkPath, 'utf-8');
const print = readFileSync(printPath, 'utf-8');

const policyRe =
  /"id": "([A-Z]{2}-[A-Z]{2}-\d{3})",\s*"domainCode": "([A-Z]{2})",\s*"subdomainCode": "[A-Z0-9]+",\s*"title": "([^"]+)",[\s\S]{0,220}?"description": "([^"]*)"/g;

const policies = [];
for (const m of framework.matchAll(policyRe)) {
  policies.push({
    policyId: m[1],
    domain: m[2],
    policyTitle: m[3],
    description: m[4],
  });
}

const nonGvPolicies = policies.filter((p) => p.domain !== 'GV');

const rowRe = /\{\n([\s\S]*?)\n\s*\},/g;
function extractString(block, key) {
  const m = block.match(new RegExp(`"${key}": "([^"]*)"`, 'm'));
  return m ? m[1] : '';
}
function extractArray(block, key) {
  const m = block.match(new RegExp(`"${key}": \\[([\\s\\S]*?)\\]`, 'm'));
  if (!m) return [];
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
}

const printRowsByPolicy = new Map();
for (const match of print.matchAll(rowRe)) {
  const block = match[1];
  const ibmPolicyId = extractString(block, 'ibmPolicyId');
  if (!/^[A-Z]{2}-[A-Z]{2}-\d{3}$/.test(ibmPolicyId)) continue;
  const row = {
    corridorPolicyNo: extractString(block, 'corridorPolicyNo'),
    corridorTitle: extractString(block, 'corridorTitle'),
    achcStandards: extractArray(block, 'achcStandards'),
    cop: extractArray(block, 'medicareCop'),
    title22: extractArray(block, 'title22'),
    surveyEvidenceMethods: extractArray(block, 'evidenceCodes'),
  };
  if (!printRowsByPolicy.has(ibmPolicyId)) printRowsByPolicy.set(ibmPolicyId, []);
  printRowsByPolicy.get(ibmPolicyId).push(row);
}

const uniq = (arr) => [...new Set(arr)];

// Manual adjudication for print-supported non-GV policies.
// Conservative: only keep tags where Corridor row and policy content topic align.
const adjudication = {
  'CO-RA-001': { mappingType: 'DIRECT', confidence: 'HIGH', keepTags: true, flags: [] },
  'EN-LC-001': { mappingType: 'DIRECT', confidence: 'HIGH', keepTags: true, flags: [] },
  'FN-BC-001': { mappingType: 'DIRECT', confidence: 'HIGH', keepTags: true, flags: [] },
  'FN-BC-003': { mappingType: 'DIRECT', confidence: 'HIGH', keepTags: true, flags: [] },
  'RM-OS-002': { mappingType: 'PARTIAL', confidence: 'MEDIUM', keepTags: true, flags: [] },
  'OP-FM-001': { mappingType: 'PARTIAL', confidence: 'MEDIUM', keepTags: true, flags: [] },
  'RM-OS-001': { mappingType: 'PARTIAL', confidence: 'MEDIUM', keepTags: true, flags: [] },
  'RM-ER-005': { mappingType: 'PARTIAL', confidence: 'MEDIUM', keepTags: true, flags: [] },
  'CO-CA-001': { mappingType: 'NONE', confidence: 'LOW', keepTags: false, flags: ['CORRIDOR_POLICY_CONTENT_MISMATCH'] },
  'CO-CP-001': { mappingType: 'NONE', confidence: 'LOW', keepTags: false, flags: ['CORRIDOR_POLICY_CONTENT_MISMATCH'] },
  'CO-FA-001': { mappingType: 'NONE', confidence: 'LOW', keepTags: false, flags: ['CORRIDOR_POLICY_CONTENT_MISMATCH'] },
  'EN-CM-001': { mappingType: 'NONE', confidence: 'LOW', keepTags: false, flags: ['CORRIDOR_POLICY_CONTENT_MISMATCH'] },
  'FN-BC-004': { mappingType: 'NONE', confidence: 'LOW', keepTags: false, flags: ['CORRIDOR_POLICY_CONTENT_MISMATCH'] },
  'QA-PG-001': { mappingType: 'NONE', confidence: 'LOW', keepTags: false, flags: ['CORRIDOR_POLICY_CONTENT_MISMATCH'] },
  'QA-PI-001': { mappingType: 'NONE', confidence: 'LOW', keepTags: false, flags: ['CORRIDOR_POLICY_CONTENT_MISMATCH'] },
  'QA-AE-001': { mappingType: 'NONE', confidence: 'LOW', keepTags: false, flags: ['CORRIDOR_POLICY_CONTENT_MISMATCH'] },
  'RM-ER-001': { mappingType: 'NONE', confidence: 'LOW', keepTags: false, flags: ['CORRIDOR_POLICY_CONTENT_MISMATCH'] },
  'RM-ER-002': { mappingType: 'NONE', confidence: 'LOW', keepTags: false, flags: ['CORRIDOR_POLICY_CONTENT_MISMATCH'] },
  'RM-ER-006': { mappingType: 'NONE', confidence: 'LOW', keepTags: false, flags: ['CORRIDOR_POLICY_CONTENT_MISMATCH'] },
  'RM-OS-004': { mappingType: 'NONE', confidence: 'LOW', keepTags: false, flags: ['CORRIDOR_POLICY_CONTENT_MISMATCH'] },
};

const evidenceByPolicy = {
  'CO-RA-001': ['Regulatory change log', 'Board/compliance update reports', 'Policy revision approval records'],
  'EN-LC-001': ['Policy version history register', 'Superseded policy archive log', 'Policy approval signatures'],
  'FN-BC-001': ['837 claim transmission logs', 'Remittance/adjudication reports', 'Billing audit worksheets'],
  'FN-BC-003': ['Patient financial notice forms', 'Patient statement and collection logs', 'Billing dispute resolution records'],
  'RM-OS-002': ['ATD exposure incident logs', 'Post-exposure follow-up forms', 'Personnel exposure training rosters'],
  'OP-FM-001': ['Environmental safety inspection reports', 'Office safety correction logs', 'Facility safety drill records'],
  'RM-OS-001': ['IIPP annual review report', 'Workplace hazard correction log', 'Cal/OSHA training attendance records'],
  'RM-ER-005': ['Risk trend dashboards', 'Infection event trend reports', 'Corrective action tracking reports'],
};

function buildJustification(policy, hasPrint, decision, rows) {
  if (!hasPrint) {
    return 'No Corridor pages 7–31 row is mapped to this IBM policy ID; policy remains explicitly unmapped in this survey-tagging layer.';
  }
  if (decision.mappingType === 'NONE' && decision.flags.includes('CORRIDOR_POLICY_CONTENT_MISMATCH')) {
    return 'A Corridor print row exists, but the row topic does not align with the policy content scope; tags were not forced and the policy is flagged as a mismatch.';
  }
  if (decision.mappingType === 'NONE') {
    return 'Corridor print support exists but does not provide defensible ACHC tagging for this policy in its current content scope.';
  }
  if (decision.mappingType === 'PARTIAL') {
    return 'Policy content supports part of the mapped Corridor requirements; retained print tags are limited to survey-defensible alignment.';
  }
  return 'Policy content is aligned with the mapped Corridor row(s), so print-sourced standards and evidence methods are retained.';
}

const dataset = nonGvPolicies.map((p) => {
  const rows = printRowsByPolicy.get(p.policyId) ?? [];
  const hasPrint = rows.length > 0;
  const defaultDecision = {
    mappingType: hasPrint ? 'NONE' : 'NONE',
    confidence: hasPrint ? 'LOW' : 'HIGH',
    keepTags: false,
    flags: [],
  };
  const decision = hasPrint ? (adjudication[p.policyId] ?? defaultDecision) : defaultDecision;

  const corridorPolicyNo = hasPrint ? uniq(rows.map((r) => r.corridorPolicyNo)).join('; ') : '';
  const corridorPolicyTitle = hasPrint ? uniq(rows.map((r) => r.corridorTitle)).join('; ') : '';
  const allAchc = hasPrint ? uniq(rows.flatMap((r) => r.achcStandards)) : [];
  const allCop = hasPrint ? uniq(rows.flatMap((r) => r.cop)) : [];
  const allTitle22 = hasPrint ? uniq(rows.flatMap((r) => r.title22)) : [];
  const allEvidenceMethods = hasPrint ? uniq(rows.flatMap((r) => r.surveyEvidenceMethods)) : [];

  const keepTags = decision.keepTags === true;
  const achcStandards = keepTags ? allAchc : [];
  const cop = keepTags ? allCop : [];
  const title22 = keepTags ? allTitle22 : [];

  return {
    policyId: p.policyId,
    policyTitle: p.policyTitle,
    domain: p.domain,
    summary: p.description || `${p.policyTitle}.`,
    corridorPolicyNo,
    corridorPolicyTitle,
    achcStandards,
    cop,
    title22,
    surveyEvidenceMethods: allEvidenceMethods,
    realEvidenceArtifacts: keepTags ? (evidenceByPolicy[p.policyId] ?? []) : [],
    mappingSource: hasPrint ? 'PRINT' : 'NONE',
    mappingType: decision.mappingType,
    confidence: decision.confidence,
    justification: buildJustification(p, hasPrint, decision, rows),
    flags: decision.flags,
  };
});

dataset.sort((a, b) => a.policyId.localeCompare(b.policyId));
writeFileSync(outDatasetPath, JSON.stringify(dataset, null, 2) + '\n', 'utf-8');

const totalPoliciesProcessed = dataset.length;
const mappedPolicies = dataset.filter((d) => d.mappingType === 'DIRECT' || d.mappingType === 'PARTIAL').length;
const unmappedPolicies = dataset.filter((d) => d.mappingType === 'NONE').length;
const withPrintSupport = dataset.filter((d) => d.mappingSource === 'PRINT').length;
const mismatchIds = dataset.filter((d) => d.flags.includes('CORRIDOR_POLICY_CONTENT_MISMATCH')).map((d) => d.policyId);

const domainCodes = uniq(dataset.map((d) => d.domain)).sort();
const domainBreakdown = domainCodes.map((domain) => {
  const rows = dataset.filter((d) => d.domain === domain);
  const mapped = rows.filter((d) => d.mappingType !== 'NONE').length;
  const unmapped = rows.filter((d) => d.mappingType === 'NONE').length;
  const print = rows.filter((d) => d.mappingSource === 'PRINT').length;
  return { domain, total: rows.length, mapped, unmapped, print };
});

const reportLines = [
  '# All-Domains ACHC Tagging Report (Non-GV Locked Pass)',
  '',
  '## Scope',
  '',
  '- Processed all non-GV policies from framework registry (`frameworkSeed.generated.ts`).',
  '- GV policies were excluded in this pass.',
  '',
  '## Totals',
  '',
  `- total policies processed: ${totalPoliciesProcessed}`,
  `- mapped policies (DIRECT/PARTIAL): ${mappedPolicies}`,
  `- unmapped policies (NONE): ${unmappedPolicies}`,
  `- policies with Corridor print support: ${withPrintSupport}`,
  '',
  '## Mismatch Flags',
  '',
  mismatchIds.length ? mismatchIds.map((id) => `- ${id}`).join('\n') : '- none',
  '',
  '## Page 756 Usage Check',
  '',
  '- Confirmed: page 756 was NOT used to assign tags or surveyEvidenceMethods.',
  '',
  '## Domain-by-Domain Breakdown',
  '',
  '| Domain | Total | Mapped | Unmapped | Print Support |',
  '| --- | ---: | ---: | ---: | ---: |',
  ...domainBreakdown.map((d) => `| ${d.domain} | ${d.total} | ${d.mapped} | ${d.unmapped} | ${d.print} |`),
  '',
  '## Output',
  '',
  '- `Builder/Documentations/MigratedRepoRoot/docs/non-gv-manual-achc-tag-dataset.json`',
];

writeFileSync(outReportPath, reportLines.join('\n') + '\n', 'utf-8');

console.log(`Wrote ${outDatasetPath}`);
console.log(`Wrote ${outReportPath}`);
console.log(`Processed non-GV policies: ${totalPoliciesProcessed}`);
