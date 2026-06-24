import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import type { WorkflowInstance } from './workflowInstance';
import type { DependencyCheck } from './dependencyCheck';
import { AUDIT_STATE_LABEL, type AuditState } from './auditState';

/* ═══════════════════════════════════════════════════════════════
   Workflow Audit Packet  (12-section regulator format)
   ----------------------------------------------------------------
   A printable, structured, defensible record of one workflow
   instance. Section order is fixed so every surveyor reads the
   same structure every time:

     1.  Cover Summary
     2.  Compliance Summary
     3.  Workflow Source Snapshot
     4.  Step Completion Record
     5.  Required Forms and Evidence
     6.  Approvals Record
     7.  Minutes and Governing Evidence
     8.  SLA and Timing Analysis
     9.  Dependency Validation
     10. Audit Trail
     11. Deficiency Summary          (only when not compliant)
     12. Certification Record

   Two renderers:
     packetToSurveyMarkdown(packet) — regulator markdown, print-ready
     packetToSurveyHtml(packet)     — standalone HTML → Save as PDF

   buildSurveyPacket is pure: only the WorkflowInstance is needed.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Packet type ────────────────────────────────────────────── */

export interface SurveyPacket {
  eventId:       string;
  generatedAtISO: string;

  /* Section 1 — Cover Summary */
  cover: {
    title:            string;
    eventId:          string;
    domain:           string;
    category?:        string;
    cadence:          string;
    date:             string;
    owner:            string;
    ownerRole:        string;
    regulatoryDriver?: string;
    citation?:        string;
    mandateType?:     string;
    auditStateLabel:  string;
    isCertified:      boolean;
  };

  /* Section 2 — Compliance Summary */
  summary: {
    auditState:              AuditState;
    readyForCertification:   boolean;
    checklistPassed:         number;
    checklistTotal:          number;
    slaDaysPastDue:          number;
    documentsCount:          number;
    stepsCompleteRatio:      string;
    formsCompleteRatio:      string;
    approvalsSatisfiedRatio: string;
    /** Exact checklist rows in spec order. */
    checklistRows: Array<{ label: string; passed: boolean; detail?: string }>;
  };

  /* Section 3 — Workflow Source Snapshot */
  workflowSnapshot: {
    processOverview?:   string;
    trigger:            string;
    responsibleRoles:   string[];
    outputs:            string[];
    slaDays?:           number;
    escalationLogic?:   string;
    failureConditions:  string[];
    auditRequirements?: string;
  };

  /* Section 4 — Step Completion Record */
  steps: Array<{ id: string; label: string; status: string; expectedOutput?: string }>;

  /* Section 5 — Required Forms and Evidence */
  forms: Array<{
    id:        string;
    label:     string;
    formRef?:  string;
    status:    string;
    documents: Array<{ id: string; label: string; uploadedAt?: string; uploader?: string; sizeLabel?: string }>;
  }>;
  evidence: Array<{
    id:           string;
    label:        string;
    kind?:        string;
    uploadedAt?:  string;
    uploader?:    string;
    linkedFormId?: string;
    sizeLabel?:   string;
    note?:        string;
  }>;

  /* Section 6 — Approvals Record */
  approvals: Array<{
    target:       string;
    targetKind:   string;
    approverRole?: string;
    required:     boolean;
    status:       string;
    approver?:    string;
    decidedAt?:   string;
  }>;

  /* Section 7 — Minutes and Governing Evidence */
  minutesEvidence: {
    required:          boolean;
    status:            string;   // 'finalized' | 'draft' | 'missing' | 'not-required'
    finalizedOn?:      string;
    dueOffsetDays?:    number;
    requiredSections?: string[];
    signOffRoles?:     string[];
  };

  /* Section 8 — SLA and Timing Analysis */
  sla: {
    dueDate:      string;
    completedAt?: string;
    daysPastDue:  number;
    onTime:       boolean;
    overdueAfterDays?: number;
  };

  /* Section 9 — Dependency Validation */
  dependencies: DependencyCheck;

  /* Section 10 — Audit Trail */
  auditTrail: Array<{
    ts:      string;
    actor?:  string;
    action:  string;
    target?: string;
    reason?: string;
  }>;

  /* Section 11 — Deficiency Summary (only populated when not compliant) */
  deficiencies: Array<{
    type:        string;   // e.g. 'Missing Form', 'Missing Evidence', 'SLA Violation'
    description: string;
    whyItMatters: string;
    action:      string;
  }>;

  /* Section 12 — Certification Record */
  certification: {
    status:          'certified' | 'ready' | 'not-ready';
    certifiedBy?:    string;
    certifierRole?:  string;
    certifiedAtISO?: string;
    certifierNote?:  string;
    auditPacketRef?: string;
    snapshot?: {
      stepsComplete:      number;
      stepsTotal:         number;
      formsComplete:      number;
      formsTotal:         number;
      approvalsApproved:  number;
      approvalsRequired:  number;
      slaDaysPastDue:     number;
    };
  };
}

/* ═══════════════════════════════════════════════════════════════
   buildSurveyPacket — pure assembler from WorkflowInstance
   ═══════════════════════════════════════════════════════════════ */
export function buildSurveyPacket(instance: WorkflowInstance): SurveyPacket {
  const { event, completionChecklist: cl, dependencies, certificationRecord } = instance;
  const cert = certificationRecord;

  const stepsComplete      = instance.steps.filter(s => s.status === 'complete').length;
  const formsComplete      = instance.forms.filter(f => f.status === 'complete').length;
  const approvalsRequired  = instance.approvals.filter(a => a.required).length;
  const approvalsApproved  = instance.approvals.filter(a => a.required && a.status === 'approved').length;

  /* ── Section 2 — Compliance Summary checklist rows (exact spec labels) ── */
  const minutesCheckItem = cl.items.find(i => i.id === 'minutes');
  const checklistRows: SurveyPacket['summary']['checklistRows'] = [
    { label: 'Steps Complete',          passed: cl.items.find(i => i.id === 'steps')?.passed     ?? false, detail: cl.items.find(i => i.id === 'steps')?.detail },
    { label: 'Forms Complete',          passed: cl.items.find(i => i.id === 'forms')?.passed     ?? true,  detail: cl.items.find(i => i.id === 'forms')?.detail },
    { label: 'Evidence Complete',       passed: cl.items.find(i => i.id === 'evidence')?.passed  ?? true,  detail: cl.items.find(i => i.id === 'evidence')?.detail },
    { label: 'Approvals Complete',      passed: cl.items.find(i => i.id === 'approvals')?.passed ?? true,  detail: cl.items.find(i => i.id === 'approvals')?.detail },
    { label: 'Minutes Complete',        passed: minutesCheckItem?.passed ?? (event.minutes === undefined), detail: minutesCheckItem?.detail },
    { label: 'SLA Compliant',           passed: cl.items.find(i => i.id === 'sla')?.passed       ?? true,  detail: cl.items.find(i => i.id === 'sla')?.detail },
    { label: 'Dependencies Satisfied',  passed: dependencies.posture !== 'hard-block',   detail: dependencies.posture === 'hard-block' ? dependencies.blockers[0] : dependencies.summary },
    { label: 'Certification Eligible',  passed: instance.readyForCertification,           detail: instance.readyForCertification ? 'All conditions satisfied' : 'One or more conditions not met' },
  ];

  /* ── Section 3 — Workflow Source Snapshot ── */
  const responsibleRoles = Array.from(new Set([
    event.ownerRole,
    ...(event.approvals ?? []).map(r => r.approverRole).filter(Boolean),
  ])) as string[];

  const outputs = event.processFlow
    .filter(s => s.expectedOutput)
    .map(s => `${s.label}: ${s.expectedOutput}`);

  const escalationParts: string[] = [];
  for (const fu of event.followUps ?? []) {
    if (fu.escalationDays && fu.escalateToRole) {
      escalationParts.push(`${fu.label} escalates to ${fu.escalateToRole} after ${fu.escalationDays}d`);
    }
  }

  const failureConditions: string[] = [];
  if (event.complianceFlags?.missingEvidenceIf?.length) {
    failureConditions.push(`Missing evidence trigger: ${event.complianceFlags.missingEvidenceIf.join(', ')}`);
  }
  if (event.complianceFlags?.auditRisk === 'critical' || event.complianceFlags?.auditRisk === 'high') {
    failureConditions.push(`Audit risk: ${event.complianceFlags.auditRisk}`);
  }
  if (event.complianceFlags?.surveyorNote) {
    failureConditions.push(event.complianceFlags.surveyorNote);
  }

  /* ── Section 7 — Minutes and Governing Evidence ── */
  const minutesCheckPassed = minutesCheckItem?.passed ?? (event.minutes === undefined);
  const minutesStatus: string = !event.minutes
    ? 'not-required'
    : minutesCheckPassed ? 'finalized'
    : (event.minutes.status === 'finalized' ? 'finalized'
       : event.minutes.status === 'draft' ? 'draft'
       : 'missing');

  /* ── Section 11 — Deficiency Summary ── */
  const deficiencies: SurveyPacket['deficiencies'] = [];
  if (!cl.allPassed || !instance.readyForCertification) {
    for (const row of checklistRows) {
      if (row.passed) continue;
      deficiencies.push(buildDeficiency(row.label, row.detail ?? ''));
    }
  }

  return {
    eventId:        event.id,
    generatedAtISO: new Date().toISOString(),

    cover: {
      title:            event.title,
      eventId:          event.id,
      domain:           event.domain,
      category:         event.category,
      cadence:          event.cadence,
      date:             event.date,
      owner:            event.owner,
      ownerRole:        event.ownerRole,
      regulatoryDriver: event.regulatoryDriver,
      citation:         event.complianceFlags?.citation,
      mandateType:      event.mandateType,
      auditStateLabel:  AUDIT_STATE_LABEL[instance.auditState],
      isCertified:      instance.isCertified,
    },

    summary: {
      auditState:              instance.auditState,
      readyForCertification:   instance.readyForCertification,
      checklistPassed:         cl.passedCount,
      checklistTotal:          cl.totalCount,
      slaDaysPastDue:          cl.slaDaysPastDue,
      documentsCount:          instance.documents.length,
      stepsCompleteRatio:      `${stepsComplete}/${instance.steps.length}`,
      formsCompleteRatio:      `${formsComplete}/${instance.forms.length}`,
      approvalsSatisfiedRatio: `${approvalsApproved}/${approvalsRequired}`,
      checklistRows,
    },

    workflowSnapshot: {
      processOverview:   event.summary ?? event.regulatoryDriver,
      trigger:           `${event.cadence}${event.mandateType ? ` · ${event.mandateType}` : ''}`,
      responsibleRoles,
      outputs,
      slaDays:           event.complianceFlags?.overdueAfterDays,
      escalationLogic:   escalationParts.length ? escalationParts.join('; ') : undefined,
      failureConditions,
      auditRequirements: event.complianceFlags?.citation ?? event.regulatoryDriver,
    },

    steps: instance.steps.map(s => ({
      id:             s.id,
      label:          s.label,
      status:         s.status,
      expectedOutput: event.processFlow.find(p => p.id === s.id)?.expectedOutput,
    })),

    forms: instance.forms.map(f => ({
      id:        f.id,
      label:     f.label,
      formRef:   f.formRef,
      status:    f.status,
      documents: f.documents.map(d => ({
        id:         d.id,
        label:      d.name,
        uploadedAt: d.uploadedAt,
        uploader:   d.uploadedBy,
        sizeLabel:  d.sizeLabel,
      })),
    })),

    evidence: instance.documents.map(d => ({
      id:           d.id,
      label:        d.name,
      kind:         d.kind,
      uploadedAt:   d.uploadedAt,
      uploader:     d.uploadedBy,
      linkedFormId: d.linkedFormId,
      sizeLabel:    d.sizeLabel,
      note:         d.note,
    })),

    approvals: instance.approvals.map(a => ({
      target:       a.targetLabel,
      targetKind:   a.targetKind,
      approverRole: a.approverRole,
      required:     a.required,
      status:       a.status,
      approver:     a.approver,
      decidedAt:    a.decidedAt,
    })),

    minutesEvidence: {
      required:         !!event.minutes,
      status:           minutesStatus,
      finalizedOn:      event.minutes?.finalizedOn,
      dueOffsetDays:    event.minutes?.dueOffsetDays,
      requiredSections: event.minutes?.requiredSections,
      signOffRoles:     event.minutes?.signOffRoles,
    },

    sla: {
      dueDate:          event.date,
      completedAt:      instance.isComplete && cert ? cert.certifiedAt : undefined,
      daysPastDue:      cl.slaDaysPastDue,
      onTime:           cl.slaDaysPastDue === 0,
      overdueAfterDays: event.complianceFlags?.overdueAfterDays,
    },

    dependencies,

    auditTrail: instance.auditTrail
      .slice()
      .sort((a, b) => a.ts.localeCompare(b.ts))
      .map(a => ({
        ts:     a.ts,
        actor:  a.actor,
        action: auditActionLabel(a.action),
        target: a.targetKind ? `${a.targetKind}${a.targetId ? `:${a.targetId}` : ''}` : undefined,
        reason: a.reason,
      })),

    deficiencies,

    certification: cert
      ? {
          status:          'certified',
          certifiedBy:     cert.certifiedBy,
          certifierRole:   cert.certifierRole,
          certifiedAtISO:  cert.certifiedAt,
          certifierNote:   cert.certifierNote,
          auditPacketRef:  cert.auditPacketRef,
          snapshot:        cert.snapshot,
        }
      : {
          status: instance.readyForCertification ? 'ready' : 'not-ready',
        },
  };
}

/* ─── Helper: map AuditAction enum to readable timeline labels ── */
function auditActionLabel(action: string): string {
  switch (action) {
    case 'step.status.changed':  return 'Step Completed';
    case 'form.status.changed':  return 'Form Uploaded';
    case 'minutes.status.changed': return 'Minutes Updated';
    case 'evidence.uploaded':    return 'Evidence Added';
    case 'evidence.removed':     return 'Evidence Removed';
    case 'approval.requested':   return 'Approval Requested';
    case 'approval.decided':     return 'Approval Completed';
    case 'event.completed':      return 'Instance Closed';
    case 'event.reopened':       return 'Instance Reopened';
    case 'event.locked':         return 'Certified & Locked';
    case 'event.unlocked':       return 'Certification Revoked';
    case 'escalation.raised':    return 'Escalation Raised';
    case 'escalation.resolved':  return 'Escalation Resolved';
    case 'mutation.blocked':     return 'Certification Blocked';
    // exec / form / task / evidence actions (from regulatoryExecutionStore taskAudit)
    case 'task.create': return 'Task Created';
    case 'task.update': return 'Task Updated';
    case 'task.generate_from_form': return 'Task Generated from Form';
    case 'task.generate_from_workflow_step': return 'Task Generated from Step';
    case 'FORM_INSTANCE_CREATED': return 'Form Instance Created';
    case 'FORM_INSTANCE_STATUS': return 'Form Instance Status Changed';
    case 'FORM_INSTANCE_SUPERSEDED': return 'Form Instance Superseded';
    case 'EVIDENCE_UPLOADED': return 'Evidence Uploaded';
    case 'DRIVE_METADATA_ATTACHED': return 'Drive Metadata Attached';
    case 'EVIDENCE_SUPERSEDED': return 'Evidence Superseded';
    case 'VALIDATION_FAILED': return 'Validation Failed';
    case 'ACCESS_DENIED': return 'Access Denied';
    case 'FILE_REJECTED': return 'File Rejected';
    case 'event_instance.create_manual': return 'Event Instance Created';
    case 'event_instance.update': return 'Event Instance Updated';
    case 'event_instance.certify': return 'Event Certified';
    case 'event_instance.cancel': return 'Event Instance Canceled';
    default: return action;
  }
}

/* ─── Helper: build a deficiency row from a failed checklist label ── */
function buildDeficiency(
  label: string,
  detail: string,
): SurveyPacket['deficiencies'][number] {
  const lower = label.toLowerCase();

  if (lower.includes('steps'))   return {
    type: 'Missing Form',
    description: detail || 'One or more workflow steps are not complete.',
    whyItMatters: 'Incomplete steps indicate the workflow was not executed per protocol.',
    action: 'Open Workflow',
  };
  if (lower.includes('forms'))   return {
    type: 'Missing Form',
    description: detail || 'One or more required forms are not complete.',
    whyItMatters: 'Missing forms break the evidence chain required for survey compliance.',
    action: 'Complete Form',
  };
  if (lower.includes('evidence')) return {
    type: 'Missing Evidence',
    description: detail || 'Required evidence artifacts are missing.',
    whyItMatters: 'Without attached evidence, the workflow cannot be verified during survey.',
    action: 'Upload Evidence',
  };
  if (lower.includes('approval')) return {
    type: 'Missing Approval',
    description: detail || 'A required approval has not been recorded.',
    whyItMatters: 'Unapproved workflows indicate governance failure.',
    action: 'Request Approval',
  };
  if (lower.includes('minutes'))  return {
    type: 'Missing Minutes',
    description: detail || 'Meeting minutes are not finalized.',
    whyItMatters: 'Finalized minutes are the primary evidence of meeting execution for CoP compliance.',
    action: 'Complete Form',
  };
  if (lower.includes('sla'))      return {
    type: 'SLA Violation',
    description: detail || 'The closure deadline has passed.',
    whyItMatters: 'Overdue workflows signal systemic compliance risk to surveyors.',
    action: 'Open Workflow',
  };
  if (lower.includes('dependenc')) return {
    type: 'Dependency Block',
    description: detail || 'A required upstream workflow is not complete.',
    whyItMatters: 'Certifying without upstream completion hides incomplete evidence chains.',
    action: 'Resolve Blocker',
  };
  return {
    type: 'Certification Blocker',
    description: detail || label,
    whyItMatters: 'This condition must be satisfied before the instance can be certified.',
    action: 'Review Dependency',
  };
}

/* ═══════════════════════════════════════════════════════════════
   packetToSurveyMarkdown — 12-section regulator-facing format
   ═══════════════════════════════════════════════════════════════ */
export function packetToSurveyMarkdown(packet: SurveyPacket): string {
  const c   = packet.cover;
  const s   = packet.summary;
  const ws  = packet.workflowSnapshot;
  const dep = packet.dependencies;
  const cert = packet.certification;
  const me  = packet.minutesEvidence;
  const sla = packet.sla;

  const ln: string[] = [];

  /* ── Page title ── */
  ln.push('# Workflow Audit Packet');
  ln.push('');
  ln.push(`**${c.title}**`);
  ln.push(`_${c.auditStateLabel}${c.isCertified ? ' — CERTIFIED & LOCKED' : ''}_`);
  ln.push('');
  ln.push(`> Exported: ${new Date(packet.generatedAtISO).toLocaleString()}  `);
  ln.push(`> Packet ID: \`${packet.eventId}-${packet.generatedAtISO.slice(0,10)}\``);
  ln.push('');
  ln.push('---');
  ln.push('');

  /* ── Section 1: Cover Summary ── */
  ln.push('## 1. Cover Summary');
  ln.push('');
  ln.push('| Field | Value |');
  ln.push('|-------|-------|');
  ln.push(`| Workflow Title | ${esc(c.title)} |`);
  ln.push(`| Workflow ID | \`${c.eventId}\` |`);
  ln.push(`| Domain | ${esc(c.domain)}${c.category ? ` — ${esc(c.category)}` : ''} |`);
  ln.push(`| Cadence | ${esc(c.cadence)} |`);
  ln.push(`| Scheduled Date | ${c.date} |`);
  ln.push(`| Owner | ${esc(c.owner)} (${esc(c.ownerRole)}) |`);
  if (c.regulatoryDriver) ln.push(`| Regulatory Driver | ${esc(c.regulatoryDriver)} |`);
  if (c.citation)         ln.push(`| Regulatory Citation | ${esc(c.citation)} |`);
  if (c.mandateType)      ln.push(`| Mandate Type | ${esc(c.mandateType)} |`);
  ln.push(`| Current Audit State | **${esc(c.auditStateLabel)}** |`);
  ln.push(`| Certification State | ${c.isCertified ? '**CERTIFIED & LOCKED**' : cert.status === 'ready' ? 'Ready to Certify' : 'Not Certified'} |`);
  if (cert.status === 'certified') {
    ln.push(`| Certified By | ${esc(cert.certifiedBy ?? '—')}${cert.certifierRole ? ` (${esc(cert.certifierRole)})` : ''} |`);
    ln.push(`| Certification Timestamp | ${cert.certifiedAtISO ? new Date(cert.certifiedAtISO).toLocaleString() : '—'} |`);
  }
  ln.push('');

  /* ── Section 2: Compliance Summary ── */
  ln.push('## 2. Compliance Summary');
  ln.push('');
  ln.push(`Validation: **${s.checklistPassed} of ${s.checklistTotal}** checks passed.`);
  if (s.slaDaysPastDue > 0) ln.push(`> **SLA OVERDUE by ${s.slaDaysPastDue} day(s)**`);
  ln.push('');
  ln.push('| Requirement | Status | Detail |');
  ln.push('|-------------|--------|--------|');
  for (const row of s.checklistRows) {
    ln.push(`| ${esc(row.label)} | ${row.passed ? '✓ Pass' : '✗ Fail'} | ${esc(row.detail ?? '—')} |`);
  }
  ln.push('');

  /* ── Section 3: Workflow Source Snapshot ── */
  ln.push('## 3. Workflow Source Snapshot');
  ln.push('');
  if (ws.processOverview) {
    ln.push(`**Overview:** ${esc(ws.processOverview)}`);
    ln.push('');
  }
  ln.push(`- **Trigger:** ${esc(ws.trigger)}`);
  ln.push(`- **Responsible Roles:** ${ws.responsibleRoles.map(esc).join(', ') || '—'}`);
  if (ws.slaDays !== undefined) ln.push(`- **SLA (overdue after):** ${ws.slaDays} day(s)`);
  if (ws.escalationLogic) ln.push(`- **Escalation:** ${esc(ws.escalationLogic)}`);
  if (ws.auditRequirements) ln.push(`- **Audit Requirements:** ${esc(ws.auditRequirements)}`);
  if (ws.failureConditions.length) {
    ln.push('- **Failure Conditions:**');
    ws.failureConditions.forEach(fc => ln.push(`  - ${esc(fc)}`));
  }
  if (ws.outputs.length) {
    ln.push('');
    ln.push('**Workflow Outputs:**');
    ws.outputs.forEach(o => ln.push(`- ${esc(o)}`));
  }
  ln.push('');

  /* ── Section 4: Step Completion Record ── */
  ln.push('## 4. Step Completion Record');
  ln.push('');
  if (!packet.steps.length) {
    ln.push('_No process steps defined for this workflow._');
  } else {
    ln.push('| # | Step | Status | Expected Output |');
    ln.push('|---|------|--------|-----------------|');
    packet.steps.forEach((st, i) => {
      ln.push(`| ${i + 1} | ${esc(st.label)} | ${st.status === 'complete' ? '✓ Complete' : st.status === 'in-progress' ? '→ In Progress' : '○ Pending'} | ${esc(st.expectedOutput ?? '—')} |`);
    });
  }
  ln.push('');

  /* ── Section 5: Required Forms and Evidence ── */
  ln.push('## 5. Required Forms and Evidence');
  ln.push('');
  if (!packet.forms.length) {
    ln.push('_No required forms for this workflow._');
  } else {
    ln.push('| Form | Form Ref | Required | Status | Documents |');
    ln.push('|------|----------|----------|--------|-----------|');
    packet.forms.forEach(f => {
      const docCount = f.documents.length;
      const docLabel = docCount === 0 ? '**No documents**' : `${docCount} attached`;
      ln.push(`| ${esc(f.label)} | ${f.formRef ?? '—'} | Yes | ${esc(f.status)} | ${docLabel} |`);
    });
  }
  ln.push('');
  if (packet.evidence.length > 0) {
    ln.push('**Supporting Evidence Files:**');
    ln.push('');
    ln.push('| Artifact | Kind | Uploaded | By | Linked Form |');
    ln.push('|----------|------|----------|----|-------------|');
    packet.evidence.forEach(e => {
      ln.push(`| ${esc(e.label)} | ${esc(e.kind ?? '—')} | ${e.uploadedAt ? fmtDate(e.uploadedAt) : '—'} | ${esc(e.uploader ?? '—')} | ${e.linkedFormId ?? '—'} |`);
    });
    ln.push('');
  } else {
    ln.push('_No evidence files uploaded._');
    ln.push('');
  }

  /* ── Section 6: Approvals Record ── */
  ln.push('## 6. Approvals Record');
  ln.push('');
  if (!packet.approvals.length) {
    ln.push('_No approvals required for this workflow._');
  } else {
    ln.push('| Approval Role | Scope | Required | Status | Approver | Timestamp |');
    ln.push('|---------------|-------|----------|--------|----------|-----------|');
    packet.approvals.forEach(a => {
      const role = esc(a.approverRole ?? '—');
      const ts   = a.decidedAt ? fmtDate(a.decidedAt) : '—';
      ln.push(`| ${role} | ${esc(a.target)} (${esc(a.targetKind)}) | ${a.required ? 'Yes' : 'No'} | ${esc(a.status)} | ${esc(a.approver ?? '—')} | ${ts} |`);
    });
  }
  ln.push('');

  /* ── Section 7: Minutes and Governing Evidence ── */
  ln.push('## 7. Minutes and Governing Evidence');
  ln.push('');
  ln.push('| Field | Value |');
  ln.push('|-------|-------|');
  ln.push(`| Minutes Required | ${me.required ? 'Yes' : 'No'} |`);
  ln.push(`| Minutes Status | ${esc(me.status)} |`);
  if (me.required) {
    ln.push(`| Due Offset | ${me.dueOffsetDays !== undefined ? `${me.dueOffsetDays} days after event` : '—'} |`);
    if (me.finalizedOn) ln.push(`| Finalized On | ${me.finalizedOn} |`);
    if (me.signOffRoles?.length) ln.push(`| Sign-off Roles | ${me.signOffRoles.map(esc).join(', ')} |`);
    if (me.requiredSections?.length) {
      ln.push(`| Required Sections | ${me.requiredSections.map(esc).join('; ')} |`);
    }
  }
  ln.push('');

  /* ── Section 8: SLA and Timing Analysis ── */
  ln.push('## 8. SLA and Timing Analysis');
  ln.push('');
  ln.push('| Field | Value |');
  ln.push('|-------|-------|');
  ln.push(`| Due Date | ${sla.dueDate} |`);
  if (sla.overdueAfterDays !== undefined) ln.push(`| SLA Window | Overdue after ${sla.overdueAfterDays} day(s) |`);
  ln.push(`| Days Past Due | ${sla.daysPastDue === 0 ? '0 (on time)' : `**${sla.daysPastDue} day(s) PAST DUE**`} |`);
  ln.push(`| SLA Status | ${sla.onTime ? '**ON TIME**' : '**PAST DUE**'} |`);
  if (sla.completedAt) ln.push(`| Completed At | ${new Date(sla.completedAt).toLocaleString()} |`);
  ln.push('');

  /* ── Section 9: Dependency Validation ── */
  ln.push('## 9. Dependency Validation');
  ln.push('');
  ln.push(`**Posture:** ${dep.posture.toUpperCase()} — ${esc(dep.summary)}`);
  ln.push('');
  if (dep.upstream.length) {
    ln.push('### Upstream Dependencies');
    ln.push('');
    ln.push('| Workflow | Title | Status | Complete | Certified | Blocks Certification |');
    ln.push('|----------|-------|--------|----------|-----------|----------------------|');
    dep.upstream.forEach(u => {
      const blocks = u.required && !u.isComplete;
      ln.push(`| ${u.eventId} | ${esc(u.title)} | ${u.auditState} | ${u.isComplete ? 'Yes' : '**No**'} | ${u.isCertified ? 'Yes' : 'No'} | ${blocks ? '**YES — Blocking**' : 'No'} |`);
    });
    ln.push('');
  }
  if (dep.downstream.length) {
    ln.push('### Downstream Impact');
    ln.push('');
    ln.push('| Workflow | Title | Relation |');
    ln.push('|----------|-------|----------|');
    dep.downstream.forEach(d => {
      ln.push(`| ${d.eventId} | ${esc(d.title)} | ${d.relation} |`);
    });
    ln.push('');
  }
  if (!dep.upstream.length && !dep.downstream.length) {
    ln.push('_No cross-workflow dependencies declared._');
    ln.push('');
  }

  /* ── Section 10: Audit Trail ── */
  ln.push('## 10. Audit Trail');
  ln.push('');
  if (!packet.auditTrail.length) {
    ln.push('_No logged activity for this instance._');
  } else {
    ln.push('| Timestamp | Actor | Action | Target | Reason |');
    ln.push('|-----------|-------|--------|--------|--------|');
    packet.auditTrail.forEach(a => {
      ln.push(`| ${new Date(a.ts).toLocaleString()} | ${esc(a.actor ?? '—')} | ${esc(a.action)} | ${esc(a.target ?? '—')} | ${esc(a.reason ?? '—')} |`);
    });
  }
  ln.push('');

  /* ── Section 11: Deficiency Summary (only when not compliant) ── */
  if (packet.deficiencies.length) {
    ln.push('## 11. Deficiency Summary');
    ln.push('');
    ln.push('> This workflow instance has outstanding compliance deficiencies. The following items must be resolved before certification.');
    ln.push('');
    packet.deficiencies.forEach((d, i) => {
      ln.push(`### Deficiency ${i + 1}: ${esc(d.type)}`);
      ln.push('');
      ln.push(`**Description:** ${esc(d.description)}`);
      ln.push('');
      ln.push(`**Why it matters:** ${esc(d.whyItMatters)}`);
      ln.push('');
      ln.push(`**Required action:** ${esc(d.action)}`);
      ln.push('');
    });
  }

  /* ── Section 12: Certification Record ── */
  ln.push('## 12. Certification Record');
  ln.push('');
  if (cert.status === 'certified') {
    ln.push('> **CERTIFIED & LOCKED**');
    ln.push('');
    ln.push('| Field | Value |');
    ln.push('|-------|-------|');
    ln.push(`| Certified By | ${esc(cert.certifiedBy ?? '—')}${cert.certifierRole ? ` (${esc(cert.certifierRole)})` : ''} |`);
    ln.push(`| Certified At | ${cert.certifiedAtISO ? new Date(cert.certifiedAtISO).toLocaleString() : '—'} |`);
    if (cert.snapshot) {
      ln.push(`| Steps at Certification | ${cert.snapshot.stepsComplete}/${cert.snapshot.stepsTotal} |`);
      ln.push(`| Forms at Certification | ${cert.snapshot.formsComplete}/${cert.snapshot.formsTotal} |`);
      ln.push(`| Approvals at Certification | ${cert.snapshot.approvalsApproved}/${cert.snapshot.approvalsRequired} |`);
      ln.push(`| SLA at Certification | ${cert.snapshot.slaDaysPastDue === 0 ? 'On time' : `${cert.snapshot.slaDaysPastDue}d past due`} |`);
    }
    if (cert.certifierNote) {
      ln.push('');
      ln.push(`**Certifier Note:** _${esc(cert.certifierNote)}_`);
    }
    if (cert.auditPacketRef) {
      ln.push('');
      ln.push(`**Packet Reference:** \`${cert.auditPacketRef}\``);
    }
  } else if (cert.status === 'ready') {
    ln.push('> **READY TO CERTIFY** — All validation items have passed. Awaiting authorized sign-off.');
  } else {
    ln.push('> **NOT CERTIFIED** — This instance does not meet certification requirements.');
    ln.push('> See Section 11 (Deficiency Summary) for specific failing items.');
  }
  ln.push('');
  ln.push('---');
  ln.push('');
  ln.push(`_End of Workflow Audit Packet — ${packet.cover.eventId} — ${packet.generatedAtISO.slice(0, 10)}_`);

  return ln.join('\n');
}

function esc(s: string): string {
  return s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function fmtDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return iso; }
}

/* ═══════════════════════════════════════════════════════════════
   packetToSurveyHtml — standalone printable HTML (→ Save as PDF)
   ----------------------------------------------------------------
   Regulator-clean design:
     - white background, dark text
     - teal for positive / section accents
     - orange for action-required
     - red for failed / missing / blocked
     - Montserrat for headings, system-ui for body
     - print header (agency + packet title) + footer (page / instance ID)
   ═══════════════════════════════════════════════════════════════ */
export function packetToSurveyHtml(packet: SurveyPacket): string {
  const md   = packetToSurveyMarkdown(packet);
  const body = markdownToHtmlBlocks(md);
  const title = `${escHtml(packet.cover.title)} — Workflow Audit Packet`;
  const packetRef = `${packet.eventId} · ${packet.generatedAtISO.slice(0, 10)}`;
  const statusClass =
    packet.cover.isCertified ? 'status-certified'
    : packet.summary.readyForCertification ? 'status-ready'
    : 'status-blocked';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>${title}</title>
  <style>
    /* ── Reset ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── Typography ── */
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      font-size: 11pt; line-height: 1.5; color: #0f172a;
      background: #fff; max-width: 900px; margin: 0 auto;
      padding: 1.5rem 2rem 4rem;
    }
    h1 { font-size: 18pt; font-weight: 700; margin: 0 0 6pt; letter-spacing: -0.01em; }
    h2 {
      font-size: 12pt; font-weight: 700; margin: 24pt 0 8pt;
      padding-bottom: 4pt; border-bottom: 2px solid #0f172a;
      text-transform: uppercase; letter-spacing: 0.06em; color: #0f172a;
    }
    h3 { font-size: 11pt; font-weight: 700; margin: 12pt 0 5pt; color: #334155; }
    p  { margin: 5pt 0; }
    ul { margin: 4pt 0 4pt 20pt; }
    li { margin: 2pt 0; }

    /* ── Tables ── */
    table { width: 100%; border-collapse: collapse; margin: 8pt 0; font-size: 10pt; }
    th, td { border: 1px solid #cbd5e1; padding: 5pt 7pt; text-align: left; vertical-align: top; }
    th { background: #f8fafc; font-weight: 700; font-size: 9.5pt; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; }
    tr:nth-child(even) td { background: #f8fafc; }

    /* ── Blockquotes ── */
    blockquote {
      margin: 8pt 0; padding: 8pt 14pt;
      border-left: 4px solid #14b8a6;
      background: #f0fdfb; color: #0d9488;
      font-weight: 600; font-size: 11pt;
    }
    blockquote.warn  { border-color: #f97316; background: #fff7ed; color: #c2410c; }
    blockquote.error { border-color: #ef4444; background: #fef2f2; color: #b91c1c; }

    /* ── Status classes ── */
    .status-certified { color: #7c3aed; font-weight: 700; }
    .status-ready     { color: #0d9488; font-weight: 700; }
    .status-blocked   { color: #dc2626; font-weight: 700; }
    .pass { color: #0d9488; }
    .fail { color: #dc2626; font-weight: 600; }
    code { background: #f1f5f9; padding: 1pt 4pt; border-radius: 3px; font-family: "Courier New", monospace; font-size: 9.5pt; }
    strong { font-weight: 700; }
    em     { font-style: italic; }
    hr     { border: none; border-top: 1px solid #e2e8f0; margin: 18pt 0; }

    /* ── Page cover header ── */
    .packet-cover {
      border-bottom: 3px solid #0f172a; padding-bottom: 14pt; margin-bottom: 18pt;
    }
    .packet-cover .agency {
      font-size: 9pt; text-transform: uppercase; letter-spacing: 0.12em;
      color: #64748b; margin-bottom: 6pt;
    }
    .packet-cover .packet-type {
      font-size: 10pt; text-transform: uppercase; letter-spacing: 0.10em;
      color: #14b8a6; font-weight: 700; margin-bottom: 4pt;
    }
    .packet-cover .status-badge {
      display: inline-block; padding: 3pt 10pt; border-radius: 3pt;
      font-size: 9.5pt; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; margin-top: 6pt;
    }
    .badge-certified { background: #ede9fe; color: #7c3aed; border: 1px solid #c4b5fd; }
    .badge-ready     { background: #f0fdfb; color: #0d9488; border: 1px solid #99f6e4; }
    .badge-blocked   { background: #fef2f2; color: #b91c1c; border: 1px solid #fca5a5; }
    .meta-line       { font-size: 10pt; color: #64748b; margin-top: 5pt; }

    /* ── Print ── */
    @media print {
      body { padding: 0; max-width: 100%; }
      h2 { page-break-before: always; }
      h2:first-of-type { page-break-before: avoid; }
      table { page-break-inside: avoid; }
      .packet-cover { page-break-after: avoid; }
    }
  </style>
</head>
<body>
  <div class="packet-cover">
    <div class="agency">Care Indeed — Home Health Agency</div>
    <div class="packet-type">Workflow Audit Packet</div>
    <h1>${escHtml(packet.cover.title)}</h1>
    <div class="meta-line">
      <strong>ID:</strong> <code>${escHtml(packet.cover.eventId)}</code>
      &nbsp;·&nbsp; <strong>Domain:</strong> ${escHtml(packet.cover.domain)}
      &nbsp;·&nbsp; <strong>Date:</strong> ${escHtml(packet.cover.date)}
      &nbsp;·&nbsp; <strong>Owner:</strong> ${escHtml(packet.cover.owner)}
    </div>
    <span class="status-badge ${statusClass === 'status-certified' ? 'badge-certified' : statusClass === 'status-ready' ? 'badge-ready' : 'badge-blocked'}">
      ${escHtml(packet.cover.auditStateLabel)}
    </span>
    <div class="meta-line" style="margin-top:8pt; font-size:9pt; color:#94a3b8;">
      Generated: ${escHtml(new Date(packet.generatedAtISO).toLocaleString())}
      &nbsp;·&nbsp; Packet Ref: <code>${escHtml(packetRef)}</code>
    </div>
  </div>
${body}
</body>
</html>`;
}

/* ─── Internal markdown → HTML converter ── */
function markdownToHtmlBlocks(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let i = 0;
  // Skip the title block (up to first hr) since the HTML cover replaces it
  while (i < lines.length && !/^---/.test(lines[i])) { i++; }
  if (i < lines.length) i++; // skip the ---

  while (i < lines.length) {
    const line = lines[i];
    if (/^## /.test(line))       { out.push(`<h2>${inline(line.slice(3))}</h2>`); i++; continue; }
    if (/^### /.test(line))      { out.push(`<h3>${inline(line.slice(4))}</h3>`); i++; continue; }
    if (/^> /.test(line)) {
      const text = line.slice(2);
      const cls = /NOT CERT|PAST DUE|Deficien/i.test(text) ? ' class="error"' : /READY TO CERTIFY/i.test(text) ? ' class="warn"' : '';
      out.push(`<blockquote${cls}>${inline(text)}</blockquote>`); i++; continue;
    }
    if (/^---/.test(line))       { out.push('<hr />'); i++; continue; }
    if (/^\| /.test(line) || /^\|[-|]+\|/.test(line)) {
      const tbl: string[] = [];
      while (i < lines.length && /^\|/.test(lines[i])) { tbl.push(lines[i]); i++; }
      out.push(renderTable(tbl));
      continue;
    }
    if (/^- /.test(line) || /^ {2}- /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && (/^- /.test(lines[i]) || /^ {2}- /.test(lines[i]))) {
        const lvl = lines[i].startsWith('  ') ? 'margin-left:1.5em;' : '';
        items.push(`<li style="${lvl}">${inline(lines[i].replace(/^  ?- /, ''))}</li>`);
        i++;
      }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }
    if (line.trim() === '') { i++; continue; }
    out.push(`<p>${inline(line)}</p>`);
    i++;
  }
  return out.join('\n');
}

function renderTable(tableLines: string[]): string {
  if (tableLines.length < 2) return escHtml(tableLines.join('\n'));
  const cells = (l: string) => l.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
  const header = cells(tableLines[0]);
  const rows   = tableLines.slice(2).map(cells);
  const thead  = `<thead><tr>${header.map(h => `<th>${inline(h)}</th>`).join('')}</tr></thead>`;
  const tbody  = `<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody>`;
  return `<table>${thead}${tbody}</table>`;
}

function inline(s: string): string {
  const out = escHtml(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    // Color pass/fail markers
    .replace(/✓ Pass/g, '<span class="pass">✓ Pass</span>')
    .replace(/✗ Fail/g, '<span class="fail">✗ Fail</span>');
  return out;
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ═══════════════════════════════════════════════════════════════
   Multi-instance survey roll-up
   ═══════════════════════════════════════════════════════════════ */
export interface SurveyRollupHeader {
  title: string;
  subtitle?: string;
  filterDescription?: string;
  total: number;
  certified: number;
  auditReady: number;
  atRisk: number;
  complianceRate: number;
}

export function rollupToSurveyMarkdown(
  header: SurveyRollupHeader,
  packets: SurveyPacket[],
  _events: RegulatoryEvent[],
): string {
  const ln: string[] = [];
  ln.push(`# ${header.title}`);
  if (header.subtitle) ln.push(`_${header.subtitle}_`);
  ln.push('');
  ln.push(`> Generated: ${new Date().toLocaleString()}${header.filterDescription ? `  \\  Filter: ${header.filterDescription}` : ''}`);
  ln.push('');
  ln.push('## Roll-up Summary');
  ln.push('');
  ln.push(`| Metric | Value |`);
  ln.push(`|--------|-------|`);
  ln.push(`| Total Instances | **${header.total}** |`);
  ln.push(`| Certified | ${header.certified} |`);
  ln.push(`| Audit Ready (Ready to Certify) | ${header.auditReady} |`);
  ln.push(`| At Risk | ${header.atRisk} |`);
  ln.push(`| Compliance Rate | **${header.complianceRate}%** |`);
  ln.push('');
  ln.push('## Instance Index');
  ln.push('');
  ln.push('| # | Workflow | ID | Domain | Date | Audit State | Certified |');
  ln.push('|---|----------|----|--------|------|-------------|-----------|');
  packets.forEach((p, i) => {
    ln.push(`| ${i + 1} | ${esc(p.cover.title)} | \`${p.eventId}\` | ${esc(p.cover.domain)} | ${p.cover.date} | ${AUDIT_STATE_LABEL[p.summary.auditState]} | ${p.cover.isCertified ? 'Yes' : 'No'} |`);
  });
  ln.push('');
  ln.push('---');
  ln.push('');
  packets.forEach((p, i) => {
    ln.push(`<!-- ======= PACKET ${i + 1} of ${packets.length} ======= -->`);
    ln.push('');
    ln.push(packetToSurveyMarkdown(p));
    ln.push('');
    ln.push('---');
    ln.push('');
  });
  return ln.join('\n');
}
