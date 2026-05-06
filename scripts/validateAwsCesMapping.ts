import fs from 'node:fs';
import path from 'node:path';

type Check = { name: string; ok: boolean; detail?: string };

function read(relPath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), relPath), 'utf8');
}

function exists(relPath: string): boolean {
  return fs.existsSync(path.resolve(process.cwd(), relPath));
}

function includesAll(source: string, tokens: string[]): boolean {
  return tokens.every(token => source.includes(token));
}

function run(): void {
  const checks: Check[] = [];

  const requiredDocs = [
    'Builder/Documentations/AWS-CES/AWS_CES_ARCHITECTURE.md',
    'Builder/Documentations/AWS-CES/AWS_CES_DATA_MODEL.md',
    'Builder/Documentations/AWS-CES/AWS_CES_API_CONTRACT.md',
    'Builder/Documentations/AWS-CES/AWS_CES_SECURITY_RULES.md',
    'Builder/Documentations/AWS-CES/AWS_CES_MIGRATION_PLAN.md',
  ];

  checks.push({
    name: 'all AWS CES deliverable docs exist',
    ok: requiredDocs.every(exists),
  });

  const architecture = read(requiredDocs[0]);
  const dataModel = read(requiredDocs[1]);
  const apiContract = read(requiredDocs[2]);
  const securityRules = read(requiredDocs[3]);
  const migrationPlan = read(requiredDocs[4]);
  const adapterSource = read('src/policy/services/complianceExecutionApi.ts');
  const typesSource = read('src/policy/compliance-execution/types.ts');
  const storeSource = read('src/policy/stores/regulatoryExecutionStore.ts');

  checks.push({
    name: 'architecture maps required AWS services',
    ok: includesAll(architecture, [
      'Cognito',
      'API Gateway HTTP API',
      'Lambda',
      'DynamoDB',
      'S3',
      'CloudWatch',
      'EventBridge Scheduler',
    ]),
  });

  checks.push({
    name: 'data model maps frontend entities to backend records',
    ok: includesAll(dataModel, [
      'EventInstance',
      'EventTask',
      'EventFormInstance',
      'EvidenceMetadata',
      'EventExecutionAudit',
      'recordVersion',
    ]),
  });

  checks.push({
    name: 'all required keys exist in mapping documents',
    ok: includesAll(dataModel, [
      'eventId',
      'sourceEventId',
      'taskId',
      'policyIds',
      'workflowId',
      'formIds',
      'status',
      'folderPath',
      'createdAt',
      'updatedAt',
      'createdBy',
      'recordVersion',
    ]),
  });

  checks.push({
    name: 'evidence object path mapping is valid',
    ok: includesAll(dataModel, [
      'evidence/{policy_id}/{workflow_id}/{event_id}/{evidence_id}/{filename}',
      'UNASSIGNED-POLICY',
      'UNASSIGNED-WORKFLOW',
    ]),
  });

  checks.push({
    name: 'API endpoints cover local mutation surface',
    ok: includesAll(apiContract, [
      'POST /events/ensure-instance',
      'POST /events/manual',
      'PATCH /events/{eventId}',
      'POST /events/{eventId}/cancel',
      'POST /events/{eventId}/certify',
      'POST /events/{eventId}/tasks',
      'PATCH /events/{eventId}/tasks/{taskId}',
      'POST /events/{eventId}/tasks/{taskId}/cancel',
      'POST /events/{eventId}/tasks/{taskId}/restore',
      'POST /events/{eventId}/forms/{formId}/generate',
      'PATCH /events/{eventId}/forms/{formInstanceId}',
      'POST /events/{eventId}/tasks/{taskId}/evidence/init-upload',
      'POST /events/{eventId}/tasks/{taskId}/evidence/{evidenceId}/complete-upload',
    ]),
  });

  checks.push({
    name: 'audit mapping supports hash chain',
    ok: includesAll(apiContract, ['prevHash', 'currentHash']) &&
      includesAll(dataModel, ['prevHash', 'currentHash']),
  });

  checks.push({
    name: 'security rules include role model and override controls',
    ok: includesAll(securityRules, [
      'SuperAdmin',
      'Administrator',
      'DON',
      'ComplianceOfficer',
      'QAPICommittee',
      'Clinician',
      'Auditor',
      'ReadOnly',
      'overrideReason',
      'append-only',
    ]),
  });

  checks.push({
    name: 'frontend adapter exposes demoLocal and awsRemote modes',
    ok: includesAll(adapterSource, [
      "export type ComplianceExecutionApiMode = 'demoLocal' | 'awsRemote';",
      'const LocalComplianceExecutionApi',
      'const AwsComplianceExecutionApi',
      'getComplianceExecutionApi',
    ]),
  });

  checks.push({
    name: 'frontend adapter maps required index endpoints',
    ok: includesAll(adapterSource, [
      '/policies/',
      '/workflows/',
      '/events/incomplete',
      '/audit/hash-chain/verify',
    ]),
  });

  checks.push({
    name: 'certified event snapshot supported by source model',
    ok: typesSource.includes('certificationSnapshot') &&
      storeSource.includes('certificationSnapshot'),
  });

  checks.push({
    name: 'required task enforcement represented in source model',
    ok: typesSource.includes('isRequired') &&
      typesSource.includes('requirementSource') &&
      storeSource.includes('required task(s) incomplete'),
  });

  const failed = checks.filter(check => !check.ok);
  for (const check of checks) {
    console.log(`[${check.ok ? 'PASS' : 'FAIL'}] ${check.name}${check.detail ? ` - ${check.detail}` : ''}`);
  }
  if (failed.length) {
    process.exitCode = 1;
  }
}

run();
