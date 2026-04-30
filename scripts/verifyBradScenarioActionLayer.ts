import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FORMS_DATASET } from '../src/policy/data/formsLibraryDataset';
import { POLICY_CORPUS } from '../src/policy/data/policyCorpus';
import { WORKFLOWS } from '../src/policy/data/workflows.generated';
import { classifyScenario } from '../src/policy/pages/iAdministrator/lib/classifyScenario';
import { getComplianceActionDefinition } from '../src/policy/pages/iAdministrator/lib/complianceActionMap';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const QUERY = 'caregiver called client is vomiting blood what do I tell her';
const EXPECTED_TRIGGER_TEXT = 'Emergency trigger matched: vomiting blood / blood in vomit.';

const priorityRank = {
  critical: 0,
  high: 1,
  medium: 2,
  routine: 3,
} as const;

type CheckResult = {
  name: string;
  ok: boolean;
  detail?: string;
};

function run(): number {
  const checks: CheckResult[] = [];

  const classification = classifyScenario(QUERY);
  checks.push({
    name: 'classifier returns clinical_emergency',
    ok: classification?.scenarioId === 'clinical_emergency',
    detail: classification ? `received=${classification.scenarioId}` : 'received=null',
  });

  checks.push({
    name: 'emergency trigger explanation appears',
    ok: classification?.emergencyTriggerExplanation === EXPECTED_TRIGGER_TEXT,
    detail: classification?.emergencyTriggerExplanation ?? 'missing',
  });

  const actionDefinition = getComplianceActionDefinition('clinical_emergency');
  const priorities = actionDefinition.requiredActions.map((action) => action.priority);
  const sortedByPriority = priorities.every((priority, index, arr) => {
    if (index === 0) return true;
    return priorityRank[priority] >= priorityRank[arr[index - 1]];
  });
  checks.push({
    name: 'priority ordering is critical -> high -> medium -> routine',
    ok: sortedByPriority,
    detail: priorities.join(', '),
  });

  const requiredActionText = actionDefinition.requiredActions.map((action) => action.text.toLowerCase());
  checks.push({
    name: 'critical emergency actions exist',
    ok:
      requiredActionText.some((text) => text.includes('call 911 immediately'))
      && requiredActionText.some((text) => text.includes('notify rn/supervisor immediately')),
  });

  const needsMappingTitles = actionDefinition.needsMapping.map((item) => item.title);
  checks.push({
    name: 'clinical emergency needs_mapping items exist',
    ok:
      needsMappingTitles.includes('Clinical Incident Report Form')
      && needsMappingTitles.includes('Clinical Escalation Workflow')
      && needsMappingTitles.includes('Emergency Change-in-Condition Workflow'),
    detail: needsMappingTitles.join(' | '),
  });

  const policyIds = new Set(POLICY_CORPUS.map((policy) => policy.id));
  const formIds = new Set(FORMS_DATASET.map((form) => form.id));
  const workflowIds = new Set(Object.values(WORKFLOWS).map((workflow) => workflow.id));

  const verifiedPolicyIds = actionDefinition.relatedPolicies.map((item) => item.id);
  const verifiedFormIds = actionDefinition.relatedForms.map((item) => item.id);
  const verifiedWorkflowIds = actionDefinition.relatedWorkflows.map((item) => item.id);

  checks.push({
    name: 'verified policy IDs resolve in registry',
    ok: verifiedPolicyIds.every((id) => policyIds.has(id)),
    detail: verifiedPolicyIds.join(', '),
  });
  checks.push({
    name: 'verified form IDs resolve in registry',
    ok: verifiedFormIds.every((id) => formIds.has(id)),
    detail: verifiedFormIds.join(', '),
  });
  checks.push({
    name: 'verified workflow IDs resolve in registry',
    ok: verifiedWorkflowIds.every((id) => workflowIds.has(id)),
    detail: verifiedWorkflowIds.join(', '),
  });

  const fakeVerified = actionDefinition.needsMapping.filter((item) => item.status === 'verified');
  checks.push({
    name: 'fake IDs are not marked verified',
    ok: fakeVerified.length === 0,
    detail: fakeVerified.map((item) => item.id).join(', '),
  });

  const indexPath = path.join(ROOT, 'src/policy/pages/iAdministrator/index.tsx');
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  const scenarioSectionPos = indexContent.indexOf('<ScenarioActionSections');
  const citationPos = indexContent.indexOf('<CitationChips');
  checks.push({
    name: 'citations render below scenario action layer',
    ok: scenarioSectionPos >= 0 && citationPos > scenarioSectionPos,
    detail: `scenarioPos=${scenarioSectionPos} citationPos=${citationPos}`,
  });

  const citationPath = path.join(ROOT, 'src/policy/pages/iAdministrator/components/CitationChips.tsx');
  const citationContent = fs.readFileSync(citationPath, 'utf8');
  checks.push({
    name: 'citations label is Reference Material',
    ok: citationContent.includes('Reference Material'),
  });

  console.log('Brad Scenario Action Layer Verifier');
  console.log('===================================');
  console.log(`Query: ${QUERY}`);
  console.log(`Classifier: ${classification?.scenarioId ?? 'null'}`);
  console.log(`Emergency trigger: ${classification?.emergencyTriggerExplanation ?? 'none'}`);
  console.log(`Verified policies: ${verifiedPolicyIds.join(', ')}`);
  console.log(`Verified forms: ${verifiedFormIds.join(', ')}`);
  console.log(`Verified workflows: ${verifiedWorkflowIds.join(', ')}`);
  console.log(`Needs mapping: ${needsMappingTitles.join(' | ')}`);
  console.log('---');

  let failCount = 0;
  for (const check of checks) {
    if (check.ok) {
      console.log(`PASS  ${check.name}`);
    } else {
      failCount += 1;
      console.error(`FAIL  ${check.name}${check.detail ? ` :: ${check.detail}` : ''}`);
    }
  }

  console.log('---');
  if (failCount === 0) {
    console.log('Verifier result: PASS');
    return 0;
  }

  console.error(`Verifier result: FAIL (${failCount})`);
  return 1;
}

process.exit(run());
