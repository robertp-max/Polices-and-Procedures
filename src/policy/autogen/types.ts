import type {
  RegulatoryEvent, RegulatoryDomain, UrgencyLevel, EventCadence, MandateType,
  EventProcessStep, EventEvidenceItem,
  AgendaTemplate, ApprovalRule, ComplianceFlags, FollowUpSpec, EventDependencies,
} from '@/policy/data/regulatoryEvents';

/* ═══════════════════════════════════════════════════════════════
   Auto-Generation Engine — Types
   ----------------------------------------------------------------
   A Template is an event definition minus the concrete date. The
   scheduler combines a template with a recurrence rule to emit
   concrete RegulatoryEvent instances across a date range.
   ═══════════════════════════════════════════════════════════════ */

export type RecurrenceFrequency =
  | 'weekly'
  | 'bi-weekly'
  | 'monthly'
  | 'quarterly'
  | 'semi-annual'
  | 'annual'
  | 'biennial'
  | 'trigger';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  nth?: number;
  anchorMonth?: number;
  quarterMonths?: number[];
  time?: string;
  timeEnd?: string;
  durationMin?: number;
  flexDays?: number;
  timezone?: string;
}

export interface TriggerDefinition {
  kind: 'incident' | 'sentinel' | 'missed-deadline' | 'complaint' | 'survey-notice';
  daysFromTrigger: number;
  minSeverity?: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

/** Step spec on a template — status is seeded to 'pending' when materialized. */
export type TemplateStep = Omit<EventProcessStep, 'status'>;
/** Form spec on a template — status is seeded to 'pending' when materialized. */
export type TemplateForm = Omit<EventEvidenceItem, 'status'>;

export interface TemplateMinutes {
  dueOffsetDays: number;
  requiredSections?: string[];
  signOffRoles?: string[];
  assignee?: string;
}

export interface EventTemplate {
  id: string;
  title: string;
  domain: RegulatoryDomain;
  category?: string;
  cadence: EventCadence;
  regulatoryDriver?: string;
  policyRefs: string[];
  owner: string;
  ownerRole: string;
  urgency: UrgencyLevel;
  summary: string;
  narrative?: string;
  location?: string;
  allDay?: boolean;
  mandateType?: MandateType;

  recurrence: RecurrenceRule;
  trigger?: TriggerDefinition;

  processFlow: TemplateStep[];
  requiredForms: TemplateForm[];
  minutes?: TemplateMinutes;
  agenda?: AgendaTemplate;
  approvals?: ApprovalRule[];
  complianceFlags?: ComplianceFlags;
  followUps?: FollowUpSpec[];
  dependencies?: EventDependencies;

  decorate?: (instance: RegulatoryEvent, date: Date) => RegulatoryEvent;
}

export interface GenerationRequest {
  templates: EventTemplate[];
  rangeStart: string;
  rangeEnd: string;
  existingEvents?: RegulatoryEvent[];
  dryRun?: boolean;
}

export interface GenerationResult {
  generated: RegulatoryEvent[];
  skipped: { templateId: string; date: string; reason: string }[];
  conflicts: { eventId: string; collidesWith: string; shiftedTo?: string }[];
  summary: {
    totalTemplates: number;
    totalEmitted: number;
    totalSkipped: number;
    totalConflicts: number;
    byDomain: Record<string, number>;
    byFrequency: Record<string, number>;
  };
}
