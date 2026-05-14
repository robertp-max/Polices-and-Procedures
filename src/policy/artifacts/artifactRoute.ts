export interface ArtifactRouteContext {
  eventId?: string;
  taskId?: string;
  formId?: string;
  formInstanceId?: string;
  evidenceId?: string;
  type?: string;
}

export function buildArtifactRoute(artifactId: string, context?: ArtifactRouteContext): string {
  const normalizedId = artifactId.trim();
  if (!normalizedId) return '/artifacts';

  const params = new URLSearchParams();
  if (context?.eventId) params.set('event_id', context.eventId);
  if (context?.taskId) params.set('task_id', context.taskId);
  if (context?.formId) params.set('form_id', context.formId);
  if (context?.formInstanceId) params.set('form_instance_id', context.formInstanceId);
  if (context?.evidenceId) params.set('evidence_id', context.evidenceId);
  if (context?.type) params.set('type', context.type);

  const query = params.toString();
  return `/artifacts/${encodeURIComponent(normalizedId)}${query ? `?${query}` : ''}`;
}
