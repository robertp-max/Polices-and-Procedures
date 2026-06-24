import { getComplianceActionDefinition } from './complianceActionMap';

export const DEMO_CRITICAL_TRIGGER = 'patient is having a heart attack with a loaded gun inside the house what do i do?';

export interface DemoWorkflowAction {
  id: string;
  label: string;
  status: 'completed' | 'active';
  timestamp: string;
}

export interface DemoAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  immutable: true;
}

export interface DemoPolicyLink {
  id: string;
  title: string;
  clause: string;
}

export interface DemoFormLink {
  id: string;
  title: string;
  instanceId: string;
  eventId: string;
  workflowId: string;
}

export interface DemoCriticalEmergencyState {
  triggerInput: string;
  eventId: string;
  workflowId: string;
  auditTrailId: string;
  workflowStatus: 'In Progress' | 'Acknowledged';
  priority: 'Critical';
  actor: string;
  startedAt: string;
  acknowledgedAt: string | null;
  acknowledged: boolean;
  selectedItemId: string | null;
  selectedItemType: 'form' | 'policy' | null;
  policies: DemoPolicyLink[];
  forms: DemoFormLink[];
  systemActions: DemoWorkflowAction[];
  auditTrail: DemoAuditEntry[];
}

function randomToken(length = 4): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function nowIso(): string {
  return new Date().toISOString();
}

function formatDateStamp(dateIso: string): string {
  const d = new Date(dateIso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function makeAuditEntry(actor: string, action: string): DemoAuditEntry {
  const ts = nowIso();
  return {
    id: `AUD-${formatDateStamp(ts)}-${randomToken(6)}`,
    timestamp: ts,
    actor,
    action,
    immutable: true,
  };
}

function resolveActor(): string {
  if (typeof localStorage !== 'undefined') {
    const candidates = ['auth.email', 'auth.user.email', 'demo.user.email', 'user.email'];
    for (const key of candidates) {
      const value = localStorage.getItem(key);
      if (value && value.trim()) return value.trim();
    }
  }
  return 'Current User';
}

export function normalizeDemoInput(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9\s?]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function isDemoCriticalTrigger(input: string): boolean {
  return normalizeDemoInput(input) === DEMO_CRITICAL_TRIGGER;
}

export function createDemoCriticalEmergencyState(input: string): DemoCriticalEmergencyState {
  const startedAt = nowIso();
  const actor = resolveActor();
  const eventId = `CSE-${formatDateStamp(startedAt)}-${randomToken(4)}`;
  const definition = getComplianceActionDefinition('clinical_emergency');
  const workflowId = definition.relatedWorkflows[0]?.id ?? '';
  const policies: DemoPolicyLink[] = definition.relatedPolicies.map((policy) => ({
    id: policy.id,
    title: policy.title,
    clause: 'Follow the current approved policy; safety-first emergency escalation takes priority before documentation.',
  }));
  const forms: DemoFormLink[] = definition.relatedForms.map((form, index) => ({
    id: form.id,
    title: form.title,
    instanceId: `FRM-${eventId}-${String(index + 1).padStart(2, '0')}`,
    eventId,
    workflowId,
  }));

  const actionLabels = [
    'Supervisor notified',
    'Compliance log initiated',
    'Audit trail started (append-only)',
    'Incident workflow launched',
  ];

  return {
    triggerInput: input,
    eventId,
    workflowId,
    auditTrailId: `ATL-${formatDateStamp(startedAt)}-${randomToken(5)}`,
    workflowStatus: 'In Progress',
    priority: 'Critical',
    actor,
    startedAt,
    acknowledgedAt: null,
    acknowledged: false,
    selectedItemId: null,
    selectedItemType: null,
    policies,
    forms,
    systemActions: actionLabels.map((label, index) => ({
      id: `ACT-${index + 1}`,
      label,
      status: index === actionLabels.length - 1 ? 'active' : 'completed',
      timestamp: nowIso(),
    })),
    auditTrail: [
      makeAuditEntry(actor, 'Critical Safety Event override activated'),
      makeAuditEntry(actor, 'Canonical clinical emergency workflow linked and compliance orchestration started'),
    ],
  };
}

export function appendDemoAudit(state: DemoCriticalEmergencyState, action: string): DemoCriticalEmergencyState {
  return {
    ...state,
    auditTrail: [...state.auditTrail, makeAuditEntry(state.actor, action)],
  };
}

export function acknowledgeDemoCriticalEmergency(state: DemoCriticalEmergencyState): DemoCriticalEmergencyState {
  const acknowledgedAt = nowIso();
  return {
    ...appendDemoAudit(state, 'User acknowledged safety-first enforcement gate'),
    acknowledged: true,
    acknowledgedAt,
    workflowStatus: 'Acknowledged',
  };
}

export function selectDemoItem(
  state: DemoCriticalEmergencyState,
  itemType: 'form' | 'policy',
  itemId: string,
): DemoCriticalEmergencyState {
  const action = itemType === 'form'
    ? `Opened required form ${itemId} linked to ${state.eventId}`
    : `Opened policy reference ${itemId} linked to ${state.eventId}`;

  return {
    ...appendDemoAudit(state, action),
    selectedItemType: itemType,
    selectedItemId: itemId,
  };
}
