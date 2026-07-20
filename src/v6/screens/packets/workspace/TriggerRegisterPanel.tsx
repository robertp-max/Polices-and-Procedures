import { useMemo } from 'react';
import {
  buildTriggerRegisterRows,
  type MaterialNonTriggerDecision,
  type TriggerRegisterRow,
} from '@/policy/packets/analysis/triggers/triggerRegister';
import type {
  PacketFinding,
  WorkflowDecisionState,
  WorkflowTriggerEvaluation,
} from '@/policy/packets/contracts';

export interface TriggerRegisterPanelProps {
  findings?: readonly PacketFinding[];
  evaluations?: readonly WorkflowTriggerEvaluation[];
  materialNonTriggerDecisions?: readonly MaterialNonTriggerDecision[];
  rows?: readonly TriggerRegisterRow[];
}

interface DisplayRow {
  finding: string | null;
  triggerRule: string | null;
  workflowIdTitle: string | null;
  decisionState: WorkflowDecisionState | null;
  existingNew: TriggerRegisterRow['existingNew'] | null;
  owner: string | null;
  approver: readonly string[];
  dueDate: string | null;
  requiredForms: readonly string[];
  dependenciesBlockers: readonly string[];
  rationale: string | null;
  attachment: readonly string[];
}

const UNKNOWN = 'unknown';
const EMPTY_FINDINGS: readonly PacketFinding[] = [];
const EMPTY_EVALUATIONS: readonly WorkflowTriggerEvaluation[] = [];
const EMPTY_NON_TRIGGER_DECISIONS: readonly MaterialNonTriggerDecision[] = [];

function textOrUnknown(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : UNKNOWN;
}

function listOrUnknown(values: readonly string[] | null | undefined): string {
  if (!values || values.length === 0) return UNKNOWN;
  const present = values.map((value) => value.trim()).filter(Boolean);
  return present.length === 0 ? UNKNOWN : present.join(', ');
}

function decisionClass(decisionState: WorkflowDecisionState | null): string {
  switch (decisionState) {
    case 'ACTIVATED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    case 'LINKED TO EXISTING ACTIVE WORKFLOW':
    case 'CONTINUED FROM PRIOR PERIOD':
      return 'border-sky-200 bg-sky-50 text-sky-800';
    case 'CONFIRMED — NOT YET ACTIVATED':
    case 'PENDING AUTHORIZED REVIEW':
      return 'border-amber-200 bg-amber-50 text-amber-900';
    case 'BLOCKED':
    case 'ESCALATED':
    case 'WORKFLOW UNRESOLVED':
      return 'border-rose-200 bg-rose-50 text-rose-800';
    case 'SUSTAINMENT MONITORING':
    case 'CLOSED':
      return 'border-violet-200 bg-violet-50 text-violet-800';
    case 'NOT TRIGGERED':
    case 'CANDIDATE — NEEDS VALIDATION':
      return 'border-slate-200 bg-slate-50 text-slate-700';
    case null:
      return 'border-slate-200 bg-slate-50 text-slate-600';
  }
}

function toDisplayRow(row: TriggerRegisterRow): DisplayRow {
  return {
    finding: row.finding,
    triggerRule: row.triggerRule,
    workflowIdTitle: row.workflowIdTitle,
    decisionState: row.decisionState,
    existingNew: row.existingNew,
    owner: row.owner,
    approver: row.approver,
    dueDate: row.dueDate,
    requiredForms: row.requiredForms,
    dependenciesBlockers: row.dependenciesBlockers,
    rationale: row.rationale,
    attachment: row.attachment,
  };
}

function deriveRows(props: TriggerRegisterPanelProps): DisplayRow[] {
  if (props.rows) {
    return props.rows.map(toDisplayRow);
  }
  return buildTriggerRegisterRows(
    [...(props.findings ?? EMPTY_FINDINGS)],
    [...(props.evaluations ?? EMPTY_EVALUATIONS)],
    [...(props.materialNonTriggerDecisions ?? EMPTY_NON_TRIGGER_DECISIONS)],
  ).map(toDisplayRow);
}

export default function TriggerRegisterPanel(props: TriggerRegisterPanelProps) {
  const displayRows = useMemo(() => deriveRows(props), [props]);
  const hasRows = displayRows.length > 0;

  return (
    <section className="flex flex-col gap-md rounded-md border border-hairline bg-surface px-md py-md text-ink">
      <header className="flex flex-col gap-xs border-b border-hairline pb-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">
            Triggered Workflow and Dependency Register
          </h2>
          <p className="text-sm text-muted">
            Rows: {displayRows.length}
          </p>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-[1280px] table-fixed border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs font-semibold uppercase text-muted">
              <th className="w-[150px] px-sm py-xs">Finding</th>
              <th className="w-[150px] px-sm py-xs">Trigger rule</th>
              <th className="w-[190px] px-sm py-xs">Workflow ID/title</th>
              <th className="w-[170px] px-sm py-xs">Decision state</th>
              <th className="w-[110px] px-sm py-xs">Existing/new</th>
              <th className="w-[130px] px-sm py-xs">Owner</th>
              <th className="w-[150px] px-sm py-xs">Approver</th>
              <th className="w-[110px] px-sm py-xs">Due date</th>
              <th className="w-[150px] px-sm py-xs">Required forms</th>
              <th className="w-[180px] px-sm py-xs">Dependencies/blockers</th>
              <th className="w-[220px] px-sm py-xs">Rationale</th>
              <th className="w-[150px] px-sm py-xs">Attachment</th>
            </tr>
          </thead>
          <tbody>
            {hasRows ? displayRows.map((row, index) => (
              <tr
                key={`${row.finding ?? UNKNOWN}:${row.triggerRule ?? UNKNOWN}:${String(index)}`}
                className="border-b border-hairline last:border-b-0"
              >
                <td className="break-words px-sm py-sm align-top">{textOrUnknown(row.finding)}</td>
                <td className="break-words px-sm py-sm align-top">{textOrUnknown(row.triggerRule)}</td>
                <td className="break-words px-sm py-sm align-top">{textOrUnknown(row.workflowIdTitle)}</td>
                <td className="px-sm py-sm align-top">
                  <span className={`inline-flex max-w-full rounded-md border px-xs py-[2px] text-xs font-semibold ${decisionClass(row.decisionState)}`}>
                    <span className="break-words">{textOrUnknown(row.decisionState)}</span>
                  </span>
                </td>
                <td className="break-words px-sm py-sm align-top">{textOrUnknown(row.existingNew)}</td>
                <td className="break-words px-sm py-sm align-top">{textOrUnknown(row.owner)}</td>
                <td className="break-words px-sm py-sm align-top">{listOrUnknown(row.approver)}</td>
                <td className="break-words px-sm py-sm align-top">{textOrUnknown(row.dueDate)}</td>
                <td className="break-words px-sm py-sm align-top">{listOrUnknown(row.requiredForms)}</td>
                <td className="break-words px-sm py-sm align-top">{listOrUnknown(row.dependenciesBlockers)}</td>
                <td className="break-words px-sm py-sm align-top">{textOrUnknown(row.rationale)}</td>
                <td className="break-words px-sm py-sm align-top">{listOrUnknown(row.attachment)}</td>
              </tr>
            )) : (
              <tr>
                <td className="px-sm py-lg text-center text-muted" colSpan={12}>
                  {UNKNOWN}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
