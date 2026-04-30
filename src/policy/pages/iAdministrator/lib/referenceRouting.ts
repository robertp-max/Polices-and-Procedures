export type ResolvedReferenceType = 'policy' | 'form' | 'workflow' | 'event' | 'task' | 'viewer';

export interface ResolvedReferenceRoute {
  type: ResolvedReferenceType;
  route: string;
}

const REFERENCE_ID_REGEX = /\b[A-Z]{2,}(?:-[A-Z0-9]{2,}){1,4}-\d{3,}\b/g;

export function extractReferenceIds(text: string): string[] {
  if (!text) return [];
  return text.match(REFERENCE_ID_REGEX) ?? [];
}

function detectReferenceType(id: string): ResolvedReferenceType {
  const normalized = id.trim().toUpperCase();
  const parts = normalized.split('-');

  if (parts.includes('PR')) return 'policy';
  if (parts.includes('FM') || parts.includes('FRM') || parts.includes('QI')) return 'form';
  if (parts.includes('WF')) return 'workflow';
  if (parts.includes('EV') || normalized.startsWith('EVT-') || normalized.startsWith('EVENT-')) return 'event';
  if (parts.includes('TSK') || normalized.startsWith('TASK-')) return 'task';
  return 'viewer';
}

export function resolveReferenceRoute(id: string): ResolvedReferenceRoute {
  const normalized = id.trim().toUpperCase();
  const type = detectReferenceType(normalized);

  if (type === 'policy') return { type, route: `/policies/${encodeURIComponent(normalized)}` };
  if (type === 'form') return { type, route: `/forms/${encodeURIComponent(normalized)}` };
  if (type === 'workflow') return { type, route: `/workflows/${encodeURIComponent(normalized)}` };
  if (type === 'event') return { type, route: `/events/${encodeURIComponent(normalized)}` };
  if (type === 'task') return { type, route: `/tasks/${encodeURIComponent(normalized)}` };
  return { type: 'viewer', route: `/viewer/${encodeURIComponent(normalized)}` };
}

export function resolveReferenceKindLabel(type: ResolvedReferenceType): string {
  if (type === 'policy') return 'Policy';
  if (type === 'form') return 'Form';
  if (type === 'workflow') return 'Workflow';
  if (type === 'event') return 'Event';
  if (type === 'task') return 'Task';
  return 'Reference';
}

export function openReferenceInNewTab(id: string): void {
  const { route } = resolveReferenceRoute(id);
  window.open(route, '_blank', 'noopener,noreferrer');
}
