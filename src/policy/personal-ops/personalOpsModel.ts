import type { DemoUser } from '@/auth/api';
import type { Task } from '@/policy/pm/types';
import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import type { ApprovalRequest, EvidenceDoc } from '@/policy/stores/regulatoryExecutionStore';
import type { User } from '@/policy/security/identity/types';

export type PersonalOpsItemKind = 'task' | 'signature' | 'evidence' | 'approval' | 'calendar' | 'security';
export type PersonalOpsOpenKind = 'task' | 'calendar' | 'evidence' | 'route' | 'none';
export type PersonalOpsPriority = 'low' | 'medium' | 'high' | 'critical';

export interface PersonalOpsDisplayItem {
  id: string;
  kind: PersonalOpsItemKind;
  title: string;
  description: string;
  source: string;
  status: string;
  priority: PersonalOpsPriority;
  dueDate?: string;
  assignedTo?: string;
  openKind: PersonalOpsOpenKind;
  openTarget?: string;
  taskId?: string;
  eventId?: string;
  evidenceId?: string;
}

export interface PersonalOpsWorkQueueGroup {
  id: 'signature' | 'evidence' | 'assigned' | 'approvals' | 'blocked';
  title: string;
  count: number;
  items: PersonalOpsDisplayItem[];
}

export interface PersonalOpsIdentity {
  userId: string;
  displayName: string;
  initials: string;
  subtitle: string;
  email?: string;
  roleLabel: string;
  groupNames: string[];
  status: 'active' | 'pending' | 'suspended' | 'unknown';
  sessionStatus: string;
  permissionPosture: string;
}

export interface PersonalOpsSecurity {
  secureStatus: string;
  clearance: string;
  permissionPosture: string;
  handshakeStatus: string;
  noPhiNotice: string;
  lastSyncLabel: string;
}

export interface PersonalOpsModel {
  identity: PersonalOpsIdentity;
  isLimited: boolean;
  outstandingControls: PersonalOpsDisplayItem[];
  workQueueGroups: PersonalOpsWorkQueueGroup[];
  calendarItems: PersonalOpsDisplayItem[];
  security: PersonalOpsSecurity;
  counts: {
    outstanding: number;
    workQueue: number;
    calendar: number;
    evidenceRecords: number;
  };
}

export interface PersonalOpsFeatureAccess {
  canViewCes: boolean;
  canViewTasks: boolean;
  canViewCalendar: boolean;
  canViewEvidence: boolean;
  canViewBrad: boolean;
  canViewHelp: boolean;
}

export interface BuildPersonalOpsModelInput {
  currentUser: DemoUser | null;
  registryUser?: User;
  groupNames: string[];
  groupPermissions: string[];
  tasks: Task[];
  events: RegulatoryEvent[];
  evidence: EvidenceDoc[];
  approvals: ApprovalRequest[];
  featureAccess: PersonalOpsFeatureAccess;
  currentUserId: string;
  now?: Date;
  lastSyncAt?: string;
}

const EMPTY_GROUPS: PersonalOpsWorkQueueGroup[] = [];
const PHI_HINT_RE = /\b(patient|client|mrn|medical record|date of birth|dob|diagnosis|address|visit note|visit notes|care plan|oasis|episode|medication|wound|therapy|case)\b/i;
const TASK_DONE = new Set(['done', 'complete', 'completed', 'signed_locked', 'archived']);
const OVERSIGHT_GROUPS = new Set(['Super Admin', 'Admin', 'Compliance', 'QAPI', 'Director', 'Executive', 'Administrator', 'Clinical Manager', 'Compliance Officer', 'Governing Body']);

export function buildPersonalOpsModel(input: BuildPersonalOpsModelInput): PersonalOpsModel {
  const now = input.now ?? new Date();
  const identity = buildIdentity(input);
  const isPending = identity.status !== 'active' || input.groupNames.includes('Pending User');
  const canSeeOperationalItems = input.featureAccess.canViewCes && input.featureAccess.canViewTasks && !isPending;
  const includeOversightItems = input.groupNames.some(name => OVERSIGHT_GROUPS.has(name));

  if (!canSeeOperationalItems) {
    return buildLimitedModel(input, identity, isPending);
  }

  const taskItems = input.tasks
    .filter(task => !TASK_DONE.has(task.status))
    .filter(task => isTaskRelevant(task, input, includeOversightItems))
    .map(task => taskToItem(task, now));

  const approvalItems = input.approvals
    .filter(approval => approval.status === 'pending')
    .filter(approval => isApprovalRelevant(approval, input, includeOversightItems))
    .map(approvalToItem);

  const signatureItems = taskItems.filter(item => item.kind === 'signature');
  const evidenceItems = taskItems.filter(item => item.kind === 'evidence');
  const assignedItems = taskItems.filter(item => item.kind === 'task');
  const reviewItems = [
    ...taskItems.filter(item => item.status === 'In Review' || item.kind === 'approval'),
    ...approvalItems,
  ];
  const blockedItems = taskItems.filter(item => ['Blocked', 'Returned', 'Rejected', 'Overdue'].includes(item.status));

  const outstandingControls = uniqueItems([
    ...blockedItems,
    ...signatureItems,
    ...evidenceItems,
    ...approvalItems,
    ...assignedItems,
  ])
    .sort((a, b) => comparePersonalOpsItems(a, b, now))
    .slice(0, 6);

  const workQueueGroups = [
    buildGroup('signature', 'Needs Signature', signatureItems, now),
    buildGroup('evidence', 'Needs Evidence', evidenceItems, now),
    buildGroup('assigned', 'Assigned Tasks', assignedItems, now),
    buildGroup('approvals', 'Reviews / Approvals', reviewItems, now),
    buildGroup('blocked', 'Blocked / Returned', blockedItems, now),
  ].filter(group => group.count > 0);

  const calendarItems = input.featureAccess.canViewCalendar
    ? input.events
        .filter(event => !event.isContext)
        .filter(event => isEventRelevant(event, input, includeOversightItems))
        .filter(event => daysUntilYmd(event.date, now) >= 0 && daysUntilYmd(event.date, now) <= 45)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5)
        .map(eventToItem)
    : [];

  return {
    identity,
    isLimited: false,
    outstandingControls,
    workQueueGroups: workQueueGroups.length ? workQueueGroups : EMPTY_GROUPS,
    calendarItems,
    security: buildSecurity(input, identity),
    counts: {
      outstanding: outstandingControls.length,
      workQueue: workQueueGroups.reduce((sum, group) => sum + group.count, 0),
      calendar: calendarItems.length,
      evidenceRecords: input.evidence.length,
    },
  };
}

function buildLimitedModel(input: BuildPersonalOpsModelInput, identity: PersonalOpsIdentity, isPending: boolean): PersonalOpsModel {
  const status = isPending ? 'Access Pending' : 'Limited Access';
  const limitedItem: PersonalOpsDisplayItem = {
    id: 'identity:limited-access',
    kind: 'security',
    title: isPending ? 'Access setup required' : 'Personal operations limited',
    description: isPending
      ? 'Role, group, or page access assignment is pending. Operational previews are hidden.'
      : 'Your current role does not include Personal Operations task/calendar visibility.',
    source: 'Identity Registry',
    status,
    priority: 'medium',
    openKind: input.featureAccess.canViewHelp ? 'route' : 'none',
    openTarget: input.featureAccess.canViewHelp ? '/help' : undefined,
  };

  return {
    identity,
    isLimited: true,
    outstandingControls: [limitedItem],
    workQueueGroups: EMPTY_GROUPS,
    calendarItems: [],
    security: buildSecurity(input, identity),
    counts: {
      outstanding: 1,
      workQueue: 0,
      calendar: 0,
      evidenceRecords: input.evidence.length,
    },
  };
}

function buildIdentity(input: BuildPersonalOpsModelInput): PersonalOpsIdentity {
  const displayName = getDisplayName(input.currentUser, input.registryUser);
  const email = input.currentUser?.email || input.registryUser?.email;
  const roleLabel = input.groupNames[0] ?? formatRole(input.currentUser?.role) ?? 'User';
  const status = input.registryUser?.status ?? (input.currentUser ? 'active' : 'unknown');
  const permissionCount = new Set(input.groupPermissions).size;

  return {
    userId: input.currentUserId,
    displayName,
    initials: initialsFor(displayName),
    subtitle: email || 'CareIndeed Clinical Division',
    email,
    roleLabel,
    groupNames: input.groupNames,
    status,
    sessionStatus: input.currentUser ? 'Session Active' : 'Session Unknown',
    permissionPosture: permissionCount > 0 ? `${permissionCount} permissions via active groups` : 'No operational permissions assigned',
  };
}

function buildSecurity(input: BuildPersonalOpsModelInput, identity: PersonalOpsIdentity): PersonalOpsSecurity {
  return {
    secureStatus: 'Secure Cryptographic Logs',
    clearance: identity.roleLabel,
    permissionPosture: identity.permissionPosture,
    handshakeStatus: input.currentUser ? 'Perfect Handshake' : 'Session unavailable',
    noPhiNotice: 'No PHI previewed in collapsed/personal panel views.',
    lastSyncLabel: input.lastSyncAt ? `Last sync ${formatDateTime(input.lastSyncAt)}` : 'Last sync unavailable',
  };
}

function getDisplayName(currentUser: DemoUser | null, registryUser?: User): string {
  const first = currentUser?.firstName?.trim();
  const last = currentUser?.lastName?.trim();
  if (first || last) return [first, last].filter(Boolean).join(' ');
  if (currentUser?.name?.trim()) return currentUser.name.trim();
  if (registryUser?.name?.trim()) return registryUser.name.trim();
  const emailLocal = (currentUser?.email || registryUser?.email || '').split('@')[0];
  if (!emailLocal) return 'Account';
  return emailLocal
    .split(/[._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ') || 'Account';
}

function initialsFor(displayName: string): string {
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
  return initials || 'AC';
}

function formatRole(role: string | undefined): string | undefined {
  if (!role?.trim()) return undefined;
  return role
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

function taskToItem(task: Task, now: Date): PersonalOpsDisplayItem {
  const kind = inferTaskKind(task);
  const dueStatus = task.due_date && daysUntilYmd(task.due_date, now) < 0 && task.status !== 'done' ? 'Overdue' : statusLabel(task.status);
  const safeTitle = safeLabel(kind, task.title);
  const description = descriptionForKind(kind, task);

  return {
    id: `task:${task.task_id}`,
    kind,
    title: safeTitle,
    description,
    source: kind === 'signature' ? 'eCIgn' : kind === 'evidence' ? 'Evidence Center' : 'CES / PM',
    status: dueStatus,
    priority: normalizePriority(task.priority ?? task.risk),
    dueDate: task.due_date,
    assignedTo: task.assignee || task.owner || getAssignedUserId(task),
    openKind: 'task',
    openTarget: task.task_id,
    taskId: task.task_id,
    eventId: task.event_id,
    evidenceId: getEvidenceId(task),
  };
}

function approvalToItem(approval: ApprovalRequest): PersonalOpsDisplayItem {
  return {
    id: `approval:${approval.id}`,
    kind: 'approval',
    title: safeLabel('approval', approval.targetLabel || 'Review / approval requiring action'),
    description: 'Pending approval from the existing CES approval flow.',
    source: 'CES Approvals',
    status: 'Pending',
    priority: 'high',
    dueDate: approval.requestedAt?.slice(0, 10),
    assignedTo: approval.approver,
    openKind: 'calendar',
    openTarget: `/calendar?event=${encodeURIComponent(approval.eventId)}&workflow=1`,
    eventId: approval.eventId,
  };
}

function eventToItem(event: RegulatoryEvent): PersonalOpsDisplayItem {
  return {
    id: `calendar:${event.id}`,
    kind: 'calendar',
    title: safeLabel('calendar', event.title),
    description: 'Upcoming compliance calendar item from the existing event projection.',
    source: 'Calendar',
    status: statusLabel(event.urgency),
    priority: normalizePriority(event.complianceFlags?.auditRisk ?? event.urgency),
    dueDate: event.date,
    assignedTo: event.ownerRole || event.owner,
    openKind: 'calendar',
    openTarget: `/calendar?event=${encodeURIComponent(event.id)}&workflow=1`,
    eventId: event.id,
  };
}

function buildGroup(
  id: PersonalOpsWorkQueueGroup['id'],
  title: string,
  items: PersonalOpsDisplayItem[],
  now: Date,
): PersonalOpsWorkQueueGroup {
  const sorted = uniqueItems(items).sort((a, b) => comparePersonalOpsItems(a, b, now));
  return {
    id,
    title,
    count: sorted.length,
    items: sorted.slice(0, 4),
  };
}

function inferTaskKind(task: Task): PersonalOpsItemKind {
  const text = `${task.task_type} ${task.title} ${'packet_status' in task ? task.packet_status : ''}`.toLowerCase();
  if (text.includes('signature') || text.includes('ecign') || text.includes('awaiting_signature') || task.task_type === 'form_completion') return 'signature';
  if (text.includes('evidence') || task.task_type === 'evidence') return 'evidence';
  if (task.task_type === 'approval' || task.task_type === 'form_review') return 'approval';
  return 'task';
}

function descriptionForKind(kind: PersonalOpsItemKind, task: Task): string {
  if (kind === 'signature') return 'Unsigned form/signature task from the existing eCIgn flow.';
  if (kind === 'evidence') return 'Evidence request requiring action. Open the protected task or Evidence Center flow.';
  if (kind === 'approval') return 'Review or approval task from the existing CES workflow.';
  if (task.blockers.length > 0) return 'Assigned control has blockers in the existing task projection.';
  return 'Assigned task from the existing CES / PM task projection.';
}

function safeLabel(kind: PersonalOpsItemKind, raw: string): string {
  if (!raw.trim()) return fallbackLabel(kind);
  if (!PHI_HINT_RE.test(raw)) return raw;
  return fallbackLabel(kind);
}

function fallbackLabel(kind: PersonalOpsItemKind): string {
  if (kind === 'signature') return 'Signature packet requiring action';
  if (kind === 'evidence') return 'Evidence request requiring action';
  if (kind === 'approval') return 'Review / approval requiring action';
  if (kind === 'calendar') return 'Compliance event requiring attention';
  if (kind === 'security') return 'Access posture requiring attention';
  return 'Assigned patient-care task';
}

function statusLabel(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase()) || 'Pending';
}

function normalizePriority(value: string | undefined): PersonalOpsPriority {
  if (value === 'critical' || value === 'overdue' || value === 'blocked') return 'critical';
  if (value === 'high' || value === 'due-soon' || value === 'missing-evidence') return 'high';
  if (value === 'medium' || value === 'in_review') return 'medium';
  return 'low';
}

function isTaskRelevant(task: Task, input: BuildPersonalOpsModelInput, includeOversightItems: boolean): boolean {
  if (includeOversightItems) return true;
  const identities = identityTokens(input);
  const fields = [
    getAssignedUserId(task),
    'owner_user_id' in task ? task.owner_user_id : undefined,
    task.assignee,
    task.owner,
    task.event_title,
    task.workflow_title,
  ];
  return fields.some(field => tokenMatches(field, identities));
}

function isApprovalRelevant(approval: ApprovalRequest, input: BuildPersonalOpsModelInput, includeOversightItems: boolean): boolean {
  if (includeOversightItems) return true;
  return tokenMatches(approval.approver, identityTokens(input));
}

function isEventRelevant(event: RegulatoryEvent, input: BuildPersonalOpsModelInput, includeOversightItems: boolean): boolean {
  if (includeOversightItems) return true;
  const identities = identityTokens(input);
  return [event.owner, event.ownerRole, event.category, event.domain].some(field => tokenMatches(field, identities));
}

function identityTokens(input: BuildPersonalOpsModelInput): string[] {
  return [
    input.currentUserId,
    input.currentUser?.id,
    input.currentUser?.email,
    input.currentUser?.name,
    input.registryUser?.id,
    input.registryUser?.email,
    input.registryUser?.name,
    ...input.groupNames,
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .map(normalizeToken);
}

function tokenMatches(value: string | undefined, tokens: string[]): boolean {
  if (!value?.trim()) return false;
  const normalized = normalizeToken(value);
  return tokens.some(token => normalized === token || normalized.includes(token) || token.includes(normalized));
}

function normalizeToken(value: string): string {
  return value.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
}

function getAssignedUserId(task: Task): string | undefined {
  return 'assigned_user_id' in task ? task.assigned_user_id : undefined;
}

function getEvidenceId(task: Task): string | undefined {
  return 'evidence_id' in task ? task.evidence_id : undefined;
}

function comparePersonalOpsItems(a: PersonalOpsDisplayItem, b: PersonalOpsDisplayItem, now: Date): number {
  const priorityDelta = priorityRank(b.priority) - priorityRank(a.priority);
  if (priorityDelta !== 0) return priorityDelta;
  const aDue = dueRank(a.dueDate, now);
  const bDue = dueRank(b.dueDate, now);
  if (aDue !== bDue) return aDue - bDue;
  return a.title.localeCompare(b.title);
}

function priorityRank(priority: PersonalOpsPriority): number {
  if (priority === 'critical') return 4;
  if (priority === 'high') return 3;
  if (priority === 'medium') return 2;
  return 1;
}

function dueRank(dueDate: string | undefined, now: Date): number {
  if (!dueDate) return 9999;
  return daysUntilYmd(dueDate, now);
}

function daysUntilYmd(dateIso: string, now: Date): number {
  const date = new Date(`${dateIso.slice(0, 10)}T00:00:00`);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((date.getTime() - today.getTime()) / 86_400_000);
}

function uniqueItems(items: PersonalOpsDisplayItem[]): PersonalOpsDisplayItem[] {
  const seen = new Set<string>();
  const result: PersonalOpsDisplayItem[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
  }
  return result;
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'recently';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
