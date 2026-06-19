import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COMPLIANCE_ACTION_MAP } from '../src/policy/pages/iAdministrator/lib/complianceActionMap';
import { createDemoCriticalEmergencyState } from '../src/policy/pages/iAdministrator/lib/demoCriticalEmergency';
import { resolveIaReference, type IaReferenceType } from '../src/policy/pages/iAdministrator/lib/referenceResolver';
import { WORKFLOWS } from '../src/policy/data/workflows.generated';

type RuntimeSurface = 'rendered' | 'hidden' | 'docs-only';

interface ReferenceCheck {
  id: string;
  claimedType: IaReferenceType | 'any';
  sourceFile: string;
  sourceDetail: string;
  runtimeSurface: RuntimeSurface;
}

interface ReferenceResult extends ReferenceCheck {
  resolvedType: string;
  status: 'PASS' | 'FAIL' | 'HIDDEN' | 'DOCS';
  reason: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const checks: ReferenceCheck[] = [];
const bannedIds = ['WF-EMER-001', 'CE-FRM-101'];

function add(
  id: string,
  claimedType: ReferenceCheck['claimedType'],
  sourceFile: string,
  sourceDetail: string,
  runtimeSurface: RuntimeSurface = 'rendered',
): void {
  checks.push({
    id: id.trim().toUpperCase(),
    claimedType,
    sourceFile,
    sourceDetail,
    runtimeSurface,
  });
}

function collectComplianceActionMap(): void {
  for (const definition of Object.values(COMPLIANCE_ACTION_MAP)) {
    for (const id of definition.relatedPolicyIds) {
      add(id, 'policy', 'src/policy/pages/iAdministrator/lib/complianceActionMap.ts', `${definition.id}.relatedPolicyIds`);
    }
    for (const id of definition.relatedFormIds) {
      add(id, 'form', 'src/policy/pages/iAdministrator/lib/complianceActionMap.ts', `${definition.id}.relatedFormIds`);
    }
    for (const id of definition.relatedWorkflowIds) {
      add(id, 'workflow', 'src/policy/pages/iAdministrator/lib/complianceActionMap.ts', `${definition.id}.relatedWorkflowIds`);
      collectWorkflowRequirements(id, `${definition.id}.workflowRequirements`);
    }
    for (const item of definition.needsMappings ?? []) {
      add(item.id, item.type, 'src/policy/pages/iAdministrator/lib/complianceActionMap.ts', `${definition.id}.needsMappings`, 'hidden');
    }
  }
}

function collectWorkflowRequirements(workflowId: string, sourceDetail: string): void {
  const workflow = WORKFLOWS[workflowId];
  if (!workflow) return;
  for (const id of workflow.requiredForms) {
    add(id, 'form', 'src/policy/data/workflows.generated.ts', `${sourceDetail}.requiredForms`);
  }
  for (const id of workflow.policyRefs) {
    add(id, 'any', 'src/policy/data/workflows.generated.ts', `${sourceDetail}.policyRefs`, 'hidden');
  }
}

function collectDemoCriticalFixture(): void {
  const state = createDemoCriticalEmergencyState('validate reference integrity');
  if (state.workflowId) {
    add(state.workflowId, 'workflow', 'src/policy/pages/iAdministrator/lib/demoCriticalEmergency.ts', 'workflowId');
    collectWorkflowRequirements(state.workflowId, 'demoCritical.workflowRequirements');
  }
  for (const policy of state.policies) {
    add(policy.id, 'policy', 'src/policy/pages/iAdministrator/lib/demoCriticalEmergency.ts', 'policies');
  }
  for (const form of state.forms) {
    add(form.id, 'form', 'src/policy/pages/iAdministrator/lib/demoCriticalEmergency.ts', 'forms');
  }
}

function collectMockBradCitations(): void {
  const sourceFile = 'src/services/mockBradEngine.ts';
  const abs = path.join(ROOT, sourceFile);
  const text = fs.readFileSync(abs, 'utf8');
  for (const match of text.matchAll(/policyId:\s*'([^']+)'/g)) {
    add(match[1], 'policy', sourceFile, 'minimalCitations');
  }
}

function collectServerScenarioTemplates(): void {
  const sourceFile = 'server/ia/scenarioClassifier.ts';
  const abs = path.join(ROOT, sourceFile);
  const lines = fs.readFileSync(abs, 'utf8').split(/\r?\n/);
  let section: 'requiredWorkflows' | 'relatedPolicies' | null = null;
  let category = 'UNKNOWN';

  for (const line of lines) {
    const categoryMatch = line.match(/^\s{2}([A-Z_]+):\s*\{/);
    if (categoryMatch) category = categoryMatch[1];
    if (line.includes('requiredWorkflows: [')) section = 'requiredWorkflows';
    if (line.includes('relatedPolicies: [')) section = 'relatedPolicies';
    if (section) {
      const idMatch = line.match(/id:\s*'([^']+)'/);
      if (idMatch) {
        add(
          idMatch[1],
          section === 'requiredWorkflows' ? 'workflow' : 'policy',
          sourceFile,
          `${category}.${section}`,
          'hidden',
        );
      }
      if (line.includes('],')) section = null;
    }
  }
}

function collectBannedRuntimeIds(): void {
  for (const rel of ['src', 'server']) {
    const root = path.join(ROOT, rel);
    if (!fs.existsSync(root)) continue;
    for (const file of walk(root)) {
      if (!/\.(ts|tsx|js|jsx)$/.test(file)) continue;
      const text = fs.readFileSync(file, 'utf8');
      for (const id of bannedIds) {
        if (text.includes(id)) {
          add(id, 'any', path.relative(ROOT, file).replace(/\\/g, '/'), 'banned placeholder id', 'rendered');
        }
      }
    }
  }
}

function* walk(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

function evaluate(check: ReferenceCheck): ReferenceResult {
  const claimedType = check.claimedType === 'any' ? undefined : check.claimedType;
  const resolved = resolveIaReference({
    id: check.id,
    claimedType,
    source: `validateReferenceIntegrity:${check.sourceFile}:${check.sourceDetail}`,
  });
  const typeMatches =
    check.claimedType === 'any'
      ? resolved.resolved
      : resolved.resolved && resolved.resolvedType === check.claimedType;

  if (check.runtimeSurface === 'docs-only') {
    return {
      ...check,
      resolvedType: resolved.resolved ? resolved.resolvedType : '-',
      status: 'DOCS',
      reason: resolved.resolved ? 'docs-only example resolves' : 'docs-only example excluded from runtime rendering',
    };
  }

  if (check.runtimeSurface === 'hidden' && !typeMatches) {
    return {
      ...check,
      resolvedType: resolved.resolved ? resolved.resolvedType : '-',
      status: 'HIDDEN',
      reason: resolved.reasonIfUnresolved ?? 'hidden before production rendering',
    };
  }

  if (typeMatches) {
    return {
      ...check,
      resolvedType: resolved.resolvedType,
      status: 'PASS',
      reason: 'resolved',
    };
  }

  return {
    ...check,
    resolvedType: resolved.resolved ? resolved.resolvedType : '-',
    status: 'FAIL',
    reason: resolved.reasonIfUnresolved ?? `resolved as ${resolved.resolvedType}, expected ${check.claimedType}`,
  };
}

function printResults(results: ReferenceResult[]): void {
  const headers = ['status', 'id', 'claimed', 'resolved', 'source', 'reason'] as const;
  const rows = results.map(result => ({
    status: result.status,
    id: result.id,
    claimed: result.claimedType,
    resolved: result.resolvedType,
    source: `${result.sourceFile} ${result.sourceDetail}`,
    reason: result.reason,
  }));
  const widths = Object.fromEntries(headers.map((header) => [
    header,
    Math.min(
      64,
      Math.max(header.length, ...rows.map(row => String(row[header]).length)),
    ),
  ])) as Record<(typeof headers)[number], number>;

  const format = (row: Record<(typeof headers)[number], string | number>): string =>
    headers.map(header => String(row[header]).padEnd(widths[header])).join(' | ');

  console.log(format({
    status: 'status',
    id: 'id',
    claimed: 'claimed',
    resolved: 'resolved',
    source: 'source',
    reason: 'reason',
  }));
  console.log(headers.map(header => '-'.repeat(widths[header])).join('-|-'));
  for (const row of rows) console.log(format(row));
}

collectComplianceActionMap();
collectDemoCriticalFixture();
collectMockBradCitations();
collectServerScenarioTemplates();
collectBannedRuntimeIds();

const unique = new Map<string, ReferenceCheck>();
for (const check of checks) {
  unique.set(
    `${check.id}:${check.claimedType}:${check.sourceFile}:${check.sourceDetail}:${check.runtimeSurface}`,
    check,
  );
}

const results = Array.from(unique.values()).map(evaluate);
printResults(results);

const failCount = results.filter(result => result.status === 'FAIL').length;
const passCount = results.filter(result => result.status === 'PASS').length;
const hiddenCount = results.filter(result => result.status === 'HIDDEN').length;

console.log('---');
console.log(`Reference integrity: ${failCount === 0 ? 'PASS' : 'FAIL'} (${passCount} resolved, ${hiddenCount} hidden, ${failCount} failed)`);

if (failCount > 0) process.exit(1);
