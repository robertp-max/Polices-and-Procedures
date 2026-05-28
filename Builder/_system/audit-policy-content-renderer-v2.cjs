/**
 * IMPROVED RUTHLESS AUDITOR v2 - More robust extraction for the massive generated file
 */
const fs = require('fs');
const path = require('path');

const GENERATED_FILE = path.join(process.cwd(), 'src/policy/data/allPoliciesContent.generated.ts');
const OUTPUT_REPORT = path.join(process.cwd(), 'Builder/_system/audit-policy-content-renderer-REPORT-v2.md');

console.log('=== RUTHLESS POLICY CONTENT AUDIT v2 (Improved Parser) ===');

const raw = fs.readFileSync(GENERATED_FILE, 'utf8');

// Strategy: Find every policyId, then collect all "title" entries until the next policyId
const policyIdRegex = /"policyId"\s*:\s*"([^"]+)"/g;
const policies = [];
let lastIndex = 0;
let match;

const policyStarts = [];
while ((match = policyIdRegex.exec(raw)) !== null) {
  policyStarts.push({ id: match[1], index: match.index });
}

console.log('Found', policyStarts.length, 'policy start points');

for (let i = 0; i < policyStarts.length; i++) {
  const start = policyStarts[i].index;
  const end = i + 1 < policyStarts.length ? policyStarts[i + 1].index : raw.length;
  const chunk = raw.substring(start, end);

  const titles = [];
  const titleRegex = /"title"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let t;
  while ((t = titleRegex.exec(chunk)) !== null) {
    titles.push(t[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
  }

  // Also try to capture some body length for "substantive content" check
  const bodyLengths = [];
  const bodyRegex = /"body"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let b;
  while ((b = bodyRegex.exec(chunk)) !== null) {
    const cleaned = b[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\').trim();
    bodyLengths.push(cleaned.length);
  }

  policies.push({
    id: policyStarts[i].id,
    sectionTitles: titles,
    sectionCount: titles.length,
    bodyLengths: bodyLengths,
    hasSubstantiveContent: bodyLengths.some(l => l > 80)
  });
}

console.log('Parsed', policies.length, 'policies');

// Analysis
const report = {
  totalPolicies: policies.length,
  totalSections: policies.reduce((sum, p) => sum + p.sectionCount, 0),
  policiesWithZeroSections: policies.filter(p => p.sectionCount === 0).map(p => p.id),
  policiesWithVeryFewSections: policies.filter(p => p.sectionCount > 0 && p.sectionCount <= 2),
  policiesWithNoSubstantiveContent: policies.filter(p => !p.hasSubstantiveContent && p.sectionCount > 0).map(p => p.id),
  averageSectionsPerPolicy: (policies.reduce((sum, p) => sum + p.sectionCount, 0) / policies.length).toFixed(1)
};

let md = `# RUTHLESS FULL POLICY CONTENT AUDIT REPORT v2
**Date:** ${new Date().toISOString()}
**Source file:** src/policy/data/allPoliciesContent.generated.ts (6.77 MB)
**Parser:** Builder/_system/audit-policy-content-renderer-v2.cjs

## Core Metrics (Every Policy Parsed)

- **Total policies found:** ${report.totalPolicies}
- **Total sections across all policies:** ${report.totalSections}
- **Average sections per policy:** ${report.averageSectionsPerPolicy}
- **Policies with ZERO sections:** ${report.policiesWithZeroSections.length}
- **Policies with 1-2 sections only:** ${report.policiesWithVeryFewSections.length}
- **Policies with no substantive content (all bodies <80 chars):** ${report.policiesWithNoSubstantiveContent.length}

## Policies With Zero Sections
${report.policiesWithZeroSections.length > 0 ? report.policiesWithZeroSections.map(id => `- ${id}`).join('\n') : 'None'}

## Policies With Extremely Low Section Count (1-2 sections)
${report.policiesWithVeryFewSections.slice(0, 25).map(p => `- ${p.id} (${p.sectionCount} sections)`).join('\n')}
${report.policiesWithVeryFewSections.length > 25 ? `... +${report.policiesWithVeryFewSections.length - 25} more` : ''}

## Policies With No Substantive Content
${report.policiesWithNoSubstantiveContent.slice(0, 30).map(id => `- ${id}`).join('\n')}
${report.policiesWithNoSubstantiveContent.length > 30 ? `... +${report.policiesWithNoSubstantiveContent.length - 30} more` : ''}

## Sample Policy IDs (first 30)
${policies.slice(0, 30).map(p => p.id).join(', ')}

**This is ground-truth data from the generated file. Any claim about "every policy" must reference these numbers.**
`;

fs.writeFileSync(OUTPUT_REPORT, md);
console.log('Report written to', OUTPUT_REPORT);
console.log('=== v2 AUDIT COMPLETE ===');