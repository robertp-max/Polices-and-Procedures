import { env } from './env.js';

/* ═══════════════════════════════════════════════════════════════
   Server-side app route builders for CES Calendar enrichment.
   Paths derived from src/App.tsx route definitions.
   ═══════════════════════════════════════════════════════════════ */

function base(): string {
  return env.appBaseUrl.replace(/\/$/, '');
}

function abs(path: string): string {
  return `${base()}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildEventWorkspacePath(eventId: string): string {
  return `/calendar/event/${encodeURIComponent(eventId)}`;
}

export function buildEventWorkflowPath(eventId: string): string {
  return `/calendar/event/${encodeURIComponent(eventId)}/workflow`;
}

export function buildEventSwimlanePath(eventId: string, workflowId?: string): string {
  const path = `/events/${encodeURIComponent(eventId)}/swimlane`;
  if (!workflowId) return path;
  const q = new URLSearchParams({ workflowId });
  return `${path}?${q.toString()}`;
}

export function buildWorkflowSwimlanePath(workflowId: string, eventId?: string): string {
  const path = `/workflows/${encodeURIComponent(workflowId)}-swimlane`;
  if (!eventId) return path;
  const q = new URLSearchParams({ eventId });
  return `${path}?${q.toString()}`;
}

export function buildEvidenceCenterPath(eventId?: string): string {
  if (!eventId) return '/evidence';
  const q = new URLSearchParams({ eventId });
  return `/evidence?${q.toString()}`;
}

export function buildAuditModePath(eventId?: string): string {
  if (!eventId) return '/audit';
  const q = new URLSearchParams({ eventId });
  return `/audit?${q.toString()}`;
}

export function buildPolicyPath(policyId: string): string {
  return `/library/${encodeURIComponent(policyId)}`;
}

export function absEventWorkspaceUrl(eventId: string): string {
  return abs(buildEventWorkspacePath(eventId));
}

export function absEventSwimlaneUrl(eventId: string, workflowId?: string): string {
  return abs(buildEventSwimlanePath(eventId, workflowId));
}

export function absWorkflowUrl(workflowId: string, eventId?: string): string {
  return abs(buildWorkflowSwimlanePath(workflowId, eventId));
}

export function absEvidenceCenterUrl(eventId?: string): string {
  return abs(buildEvidenceCenterPath(eventId));
}

export function absAuditModeUrl(eventId?: string): string {
  return abs(buildAuditModePath(eventId));
}

export function absPolicyUrl(policyId: string): string {
  return abs(buildPolicyPath(policyId));
}