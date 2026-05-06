export interface EventFolderPaths {
  root: string;
  metadata: string;
  tasksDir: string;
  formsRequiredDir: string;
  formsCompletedDir: string;
  evidenceDir: string;
  approvalsDir: string;
  auditLog: string;
}

export interface EventFolderMetadata {
  eventId: string;
  folderPath: string;
  paths: EventFolderPaths;
}

const clean = (v: string) => v.replace(/[^A-Za-z0-9._-]/g, '_');

export function resolveEventFolder(eventId: string): EventFolderMetadata {
  const safeEventId = clean(eventId);
  const root = `/events/${safeEventId}`;
  return {
    eventId,
    folderPath: root,
    paths: {
      root,
      metadata: `${root}/metadata.json`,
      tasksDir: `${root}/tasks`,
      formsRequiredDir: `${root}/forms/required`,
      formsCompletedDir: `${root}/forms/completed`,
      evidenceDir: `${root}/evidence`,
      approvalsDir: `${root}/approvals`,
      auditLog: `${root}/audit/audit-log.jsonl`,
    },
  };
}

export function buildTaskObjectPath(eventId: string, taskId: string): string {
  return `${resolveEventFolder(eventId).paths.tasksDir}/${clean(taskId)}.json`;
}

export function buildRequiredFormObjectPath(eventId: string, formId: string): string {
  return `${resolveEventFolder(eventId).paths.formsRequiredDir}/${clean(formId)}.json`;
}

export function buildCompletedFormObjectPath(eventId: string, formInstanceId: string): string {
  return `${resolveEventFolder(eventId).paths.formsCompletedDir}/${clean(formInstanceId)}.json`;
}

export function buildApprovalObjectPath(eventId: string, approvalId: string): string {
  return `${resolveEventFolder(eventId).paths.approvalsDir}/${clean(approvalId)}.json`;
}

export function buildEvidenceMetadataPath(eventId: string, evidenceId: string): string {
  return `${resolveEventFolder(eventId).paths.evidenceDir}/${clean(evidenceId)}/metadata.json`;
}

export function buildS3EvidenceObjectPath(args: {
  policyId: string;
  workflowId: string;
  eventId: string;
  evidenceId: string;
  filename: string;
}): string {
  const { policyId, workflowId, eventId, evidenceId, filename } = args;
  return [
    'evidence',
    clean(policyId),
    clean(workflowId),
    clean(eventId),
    clean(evidenceId),
    clean(filename),
  ].join('/');
}
