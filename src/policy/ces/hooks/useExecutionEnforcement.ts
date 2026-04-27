/* ═══════════════════════════════════════════════════════════════
   useExecutionEnforcement
   Pure rules engine for CES state transitions.
   UI must call canTransition() before any drag/drop or button click.
   ═══════════════════════════════════════════════════════════════ */

import { useCallback } from 'react';
import type {
  ExecutionUnit, ComplianceState, WorkflowPhase,
} from '../types';
import { COMPLIANCE_STATE_ORDER, WORKFLOW_PHASE_ORDER } from '../types';

export interface EnforcementVerdict {
  allowed: boolean;
  /** Surveyor-grade reason. Empty when allowed. */
  reason: string;
  /** UI hint for the inline warning. */
  shortReason: string;
}

const ALLOW: EnforcementVerdict = { allowed: true, reason: '', shortReason: '' };

function deny(short: string, full: string): EnforcementVerdict {
  return { allowed: false, reason: full, shortReason: short };
}

/* ── Adjacency map: which target states are legal from each source ── */
const STATE_TRANSITIONS: Record<ComplianceState, ComplianceState[]> = {
  upcoming:           ['ready', 'blocked'],
  ready:              ['in_progress', 'blocked'],
  in_progress:        ['awaiting_signature', 'blocked'],
  awaiting_signature: ['completed', 'blocked'],
  blocked:            ['ready', 'in_progress', 'awaiting_signature'], // can resume into the prior lane after unblock
  completed:          [],
};

export function useExecutionEnforcement() {
  /* ── Phase advancement (internal) ─────────────────────── */
  const canAdvancePhase = useCallback((unit: ExecutionUnit, target: WorkflowPhase): EnforcementVerdict => {
    const cur  = WORKFLOW_PHASE_ORDER.indexOf(unit.workflowPhase);
    const next = WORKFLOW_PHASE_ORDER.indexOf(target);
    if (next === -1 || cur === -1) return deny('Invalid phase', `Unknown phase "${target}".`);
    if (next === cur) return ALLOW;
    if (next < cur)  return deny('Cannot rewind phase', 'Workflow phases cannot move backward — open a corrective execution unit instead.');
    if (next > cur + 1) return deny('Cannot skip phases', `Cannot skip from ${unit.workflowPhase} to ${target}. Phases must advance one step at a time.`);
    return ALLOW;
  }, []);

  /* ── Board state transition (drag-and-drop) ───────────── */
  const canTransitionState = useCallback((unit: ExecutionUnit, target: ComplianceState): EnforcementVerdict => {
    const legal = STATE_TRANSITIONS[unit.complianceState];
    if (target === unit.complianceState) return ALLOW;
    if (!legal.includes(target)) {
      return deny('Invalid transition', `Cannot move from "${unit.complianceState}" to "${target}". Allowed: ${legal.join(', ') || 'none'}.`);
    }

    // Hard rules: completed requires evidence + signatures + audit index
    if (target === 'completed') {
      const ev = unit.evidenceStatus;
      if (ev.requiredFormsComplete < ev.requiredFormsTotal) {
        const missing = ev.missingFormIds.length ? ` Missing: ${ev.missingFormIds.join(', ')}.` : '';
        return deny('Evidence incomplete', `Cannot complete: required forms not filed (${ev.requiredFormsComplete}/${ev.requiredFormsTotal}).${missing}`);
      }
      if (ev.signaturesComplete < ev.signaturesRequired) {
        return deny('Signatures required before completion', `Cannot complete: signatures pending (${ev.signaturesComplete}/${ev.signaturesRequired}).`);
      }
      if (!ev.auditIndexCreated) {
        return deny('Audit index not created', 'Cannot complete: audit index entry has not been generated.');
      }
    }

    // Cannot leave blocked without a resolved blocker (mock: requires UI to clear blockedReason first)
    if (unit.complianceState === 'blocked' && unit.blockedReason) {
      return deny('Resolve blocker first', `Cannot move blocked unit: ${unit.blockedReason.label}.`);
    }

    // Cannot move to awaiting_signature unless all required forms are filed
    if (target === 'awaiting_signature') {
      const ev = unit.evidenceStatus;
      if (ev.requiredFormsComplete < ev.requiredFormsTotal) {
        const missing = ev.missingFormIds.length ? ` Upload ${ev.missingFormIds.join(', ')} to advance.` : '';
        return deny('Evidence incomplete', `Cannot request signatures: required forms not filed.${missing}`);
      }
    }

    return ALLOW;
  }, []);

  /* ── Button-level checks for Drawer actions ───────────── */
  const canMarkBlocked   = useCallback((u: ExecutionUnit): EnforcementVerdict =>
    u.complianceState === 'completed' ? deny('Already completed', 'Completed units cannot be re-blocked. Open a corrective unit.') : ALLOW,
  []);

  const canRequestSignature = useCallback((u: ExecutionUnit): EnforcementVerdict => {
    if (u.evidenceStatus.requiredFormsComplete < u.evidenceStatus.requiredFormsTotal) {
      const miss = u.evidenceStatus.missingFormIds.join(', ') || 'required forms';
      return deny('Upload required forms first', `Upload ${miss} to advance.`);
    }
    return canTransitionState(u, 'awaiting_signature');
  }, [canTransitionState]);

  const canCloseUnit = useCallback((u: ExecutionUnit): EnforcementVerdict =>
    canTransitionState(u, 'completed'), [canTransitionState]);

  return {
    canAdvancePhase,
    canTransitionState,
    canMarkBlocked,
    canRequestSignature,
    canCloseUnit,
    legalTargets: (state: ComplianceState): ComplianceState[] => STATE_TRANSITIONS[state],
    COMPLIANCE_STATE_ORDER,
  };
}
