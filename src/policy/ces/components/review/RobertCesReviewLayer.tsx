/* ═══════════════════════════════════════════════════════════════
   RobertCesReviewLayer — CES task assignment debug overlay.
   ---------------------------------------------------------------
   AUTHORIZED USER: robertp@careindeed.com ONLY.
   All other users: renders null.

   Shows:
   - Task assignedRole / accountableRole / reviewerRole / approverRole
   - Signer tasks generated for each required form
   - Why the task was assigned to that role
   - Parent-child links: Event → Form Task → Signer Task → Evidence → Gate

   To remove this entire feature:
     Delete this file + CesRoleReviewSwitcher.tsx + cesReviewMode.ts
   ═══════════════════════════════════════════════════════════════ */

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Shield, ClipboardList, PenLine, Lock } from 'lucide-react';
import { isRobertUser, useCesReviewMode } from '@/policy/ces/cesReviewMode';
import type { CesRole } from '@/policy/ces/cesRoles';
import { buildCesRoleAssignment, CES_ROLES } from '@/policy/ces/cesRoles';
import {
  generateAllSignerTasks,
  areAllSignerTasksComplete,
  areAllEventSignerTasksComplete,
  type CesSignerTask,
} from '@/policy/ces/signerTaskFactory';
import type { EventTask } from '@/policy/compliance-execution/types';

/* ─── Types ──────────────────────────────────────────────── */

interface TaskDebugInfo {
  task:            EventTask;
  roleAssignment:  ReturnType<typeof buildCesRoleAssignment>;
  signerTasks:     CesSignerTask[];
  assignmentReason: string;
}

interface Props {
  userEmail?:  string | null;
  userId?:     string | null;
  /** All form/event tasks for the current event context. */
  eventTasks?: EventTask[];
  /** Current event ID being inspected. */
  eventId?:    string;
  domain?:     string;
}

/* ─── Assignment reason helper ───────────────────────────── */

function describeAssignmentReason(task: EventTask, role: CesRole): string {
  if (task.ownerRole) {
    return `ownerRole field on event: "${task.ownerRole}" → resolved to ${role}`;
  }
  if (task.taskSourceType === 'approval') {
    return `Approval task type → Administrator (or DON for clinical domain)`;
  }
  if (task.taskSourceType === 'minutes') {
    return `Minutes task type → Admin Designee (scheduling/documentation support)`;
  }
  if (task.taskSourceType === 'requiredForm') {
    return `Required form → role derived from domain/form type (default: DON)`;
  }
  if (task.taskSourceType === 'processFlow') {
    return `Process flow step → role derived from domain (default: DON)`;
  }
  return `No ownerRole specified → DON (default for all ambiguous tasks)`;
}

/* ─── Sub-components ─────────────────────────────────────── */

function RolePill({ role, isSelf }: { role: CesRole; isSelf?: boolean }) {
  const bg = isSelf ? '#1E3A5F' : '#F1F5F9';
  const color = isSelf ? '#F9FAFB' : '#374151';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '1px 7px',
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 600,
        background: bg,
        color,
        letterSpacing: '0.04em',
        border: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      {role}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const palette: Record<string, { bg: string; color: string }> = {
    signed:  { bg: '#D1FAE5', color: '#065F46' },
    pending: { bg: '#FEF3C7', color: '#92400E' },
    overdue: { bg: '#FEE2E2', color: '#991B1B' },
  };
  const p = palette[status] ?? { bg: '#F1F5F9', color: '#374151' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '1px 7px',
        borderRadius: 4,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        ...p,
      }}
    >
      {status}
    </span>
  );
}

function SignerTaskRow({ st }: { st: CesSignerTask }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        borderRadius: 5,
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        fontSize: 11,
      }}
    >
      <PenLine size={12} style={{ color: '#64748B', flexShrink: 0 }} />
      <span style={{ flex: 1, color: '#1E293B', fontWeight: 500 }}>{st.title}</span>
      <RolePill role={st.signerRole} />
      <StatusPill status={st.status} />
      <span
        title="Signer Task ID"
        style={{ fontSize: 9, fontFamily: 'monospace', color: '#94A3B8', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {st.id}
      </span>
    </div>
  );
}

function TaskDebugRow({ info }: { info: TaskDebugInfo }) {
  const [open, setOpen] = useState(false);
  const ra = info.roleAssignment;
  const formDone = areAllSignerTasksComplete(info.task.id, info.signerTasks);

  return (
    <div
      style={{
        border: '1px solid #E2E8F0',
        borderRadius: 7,
        overflow: 'hidden',
        marginBottom: 6,
      }}
    >
      {/* Header row */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '8px 12px',
          background: open ? '#F0F7FF' : '#FFFFFF',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#1E293B' }}>
          {info.task.title}
        </span>
        <RolePill role={ra.assignedRole} isSelf />
        <span style={{ fontSize: 9, color: '#64748B', fontFamily: 'monospace' }}>
          {info.task.taskSourceType}
        </span>
        {info.signerTasks.length > 0 && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: 4,
              background: formDone ? '#D1FAE5' : '#FEF3C7',
              color:      formDone ? '#065F46' : '#92400E',
            }}
          >
            {info.signerTasks.filter(s => s.status === 'signed').length}/{info.signerTasks.length} signed
          </span>
        )}
      </button>

      {open && (
        <div style={{ padding: '10px 14px', background: '#FAFCFF', borderTop: '1px solid #E2E8F0' }}>
          {/* Role assignment grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
            {[
              { label: 'Assigned',    role: ra.assignedRole },
              { label: 'Accountable', role: ra.accountableRole },
              { label: 'Reviewer',    role: ra.reviewerRole },
              { label: 'Approver',    role: ra.approverRole },
            ].map(({ label, role }) => (
              <div key={label}>
                <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 3 }}>
                  {label}
                </div>
                <RolePill role={role} isSelf={label === 'Assigned'} />
              </div>
            ))}
          </div>

          {/* Can-complete / can-review / can-approve */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
            {[
              { label: 'Can Complete', roles: ra.canCompleteRoles },
              { label: 'Can Review',   roles: ra.canReviewRoles },
              { label: 'Can Approve',  roles: ra.canApproveRoles },
            ].map(({ label, roles }) => (
              <div key={label}>
                <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 3 }}>
                  {label}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {roles.map(r => <RolePill key={r} role={r} />)}
                </div>
              </div>
            ))}
          </div>

          {/* Assignment reason */}
          <div style={{ marginBottom: 10, padding: '6px 10px', borderRadius: 5, background: '#F1F5F9', fontSize: 11, color: '#475569' }}>
            <strong style={{ color: '#1E293B' }}>Assignment reason: </strong>
            {info.assignmentReason}
          </div>

          {/* Task ID */}
          <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#94A3B8', marginBottom: info.signerTasks.length ? 10 : 0 }}>
            ID: {info.task.id}
          </div>

          {/* Signer tasks */}
          {info.signerTasks.length > 0 && (
            <div>
              <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 5 }}>
                Signer Tasks ({info.signerTasks.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {info.signerTasks.map(st => <SignerTaskRow key={st.id} st={st} />)}
              </div>
              {/* Completion gate */}
              <div
                style={{
                  marginTop: 8,
                  padding: '5px 10px',
                  borderRadius: 5,
                  background: formDone ? '#D1FAE5' : '#FEF3C7',
                  fontSize: 10,
                  fontWeight: 600,
                  color: formDone ? '#065F46' : '#92400E',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Lock size={11} />
                Form completion gate: {formDone ? 'UNLOCKED — all signers signed' : 'LOCKED — awaiting signatures'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */

export function RobertCesReviewLayer({ userEmail, userId, eventTasks = [], eventId, domain }: Props) {
  const allowed = isRobertUser(userEmail, userId);
  const { isEnabled, reviewRole } = useCesReviewMode(userEmail, userId);
  const [panelOpen, setPanelOpen] = useState(false);

  const debugInfos = useMemo((): TaskDebugInfo[] => {
    if (!allowed) return [];
    const allSignerTasks = generateAllSignerTasks(eventTasks, domain);

    return eventTasks.map(task => {
      const ra = buildCesRoleAssignment({
        domain,
        taskSourceType: task.taskSourceType,
        ownerRole:      task.ownerRole,
        title:          task.title,
        workflowId:     task.workflowId,
      });
      const taskSignerTasks = allSignerTasks.filter(st => st.parentFormTaskId === task.id);
      return {
        task,
        roleAssignment: ra,
        signerTasks:    taskSignerTasks,
        assignmentReason: describeAssignmentReason(task, ra.assignedRole),
      };
    });
  }, [allowed, eventTasks, domain]);

  const allSignerTasks = useMemo(() => generateAllSignerTasks(eventTasks, domain), [eventTasks, domain]);
  const eventCertGate  = eventId ? areAllEventSignerTasksComplete(eventId, allSignerTasks) : true;

  if (!allowed || !isEnabled) return null;

  return (
    <div
      data-robert-ces-review-layer=""
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        width: panelOpen ? 640 : 'auto',
        maxHeight: panelOpen ? '80vh' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #1E3A5F',
        boxShadow: '0 20px 48px rgba(0,0,0,0.25)',
        background: '#FFFFFF',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Header bar */}
      <button
        type="button"
        onClick={() => setPanelOpen(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          background: '#1E3A5F',
          color: '#F9FAFB',
          border: 'none',
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          flexShrink: 0,
        }}
      >
        <Shield size={13} />
        CES Debug Layer — Robert
        {reviewRole && (
          <span
            style={{
              marginLeft: 4,
              padding: '1px 7px',
              borderRadius: 4,
              background: '#FFC107',
              color: '#1A1A1A',
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: '0.1em',
            }}
          >
            {reviewRole}
          </span>
        )}
        <span style={{ marginLeft: 'auto', opacity: 0.7, fontSize: 10 }}>
          {panelOpen ? '▼ collapse' : '▲ expand'}
        </span>
      </button>

      {panelOpen && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
          {/* Event certification gate */}
          {eventId && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 12px',
                borderRadius: 7,
                background: eventCertGate ? '#D1FAE5' : '#FEF3C7',
                color:      eventCertGate ? '#065F46' : '#92400E',
                fontSize: 11,
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              <Lock size={13} />
              Event certification gate ({eventId}):&nbsp;
              {eventCertGate ? 'UNLOCKED' : `LOCKED — ${allSignerTasks.filter(s => s.status !== 'signed').length} signatures pending`}
            </div>
          )}

          {/* Role summary */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {CES_ROLES.map(role => {
              const count = debugInfos.filter(i => i.roleAssignment.assignedRole === role).length;
              return count > 0 ? (
                <div
                  key={role}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 9px',
                    borderRadius: 5,
                    background: '#F1F5F9',
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#374151',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <ClipboardList size={10} />
                  {role}: {count}
                </div>
              ) : null;
            })}
          </div>

          {/* Signer task summary */}
          {allSignerTasks.length > 0 && (
            <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 7, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
                Signer Tasks Summary
              </div>
              <div style={{ fontSize: 11, color: '#374151' }}>
                Total: {allSignerTasks.length} &nbsp;·&nbsp;
                Signed: {allSignerTasks.filter(s => s.status === 'signed').length} &nbsp;·&nbsp;
                Pending: {allSignerTasks.filter(s => s.status === 'pending').length} &nbsp;·&nbsp;
                Overdue: {allSignerTasks.filter(s => s.status === 'overdue').length}
              </div>
            </div>
          )}

          {/* Task list */}
          <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
            Task Role Assignments ({debugInfos.length})
          </div>
          {debugInfos.length === 0 ? (
            <p style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', padding: 24 }}>
              No event tasks loaded. Open an event drawer to inspect tasks.
            </p>
          ) : (
            debugInfos.map(info => <TaskDebugRow key={info.task.id} info={info} />)
          )}

          <p
            style={{
              marginTop: 16,
              fontSize: 9,
              color: '#CBD5E1',
              textAlign: 'center',
              letterSpacing: '0.1em',
            }}
          >
            ROBERT_REVIEW_MODE · Simulation only · Real permissions unchanged
          </p>
        </div>
      )}
    </div>
  );
}
