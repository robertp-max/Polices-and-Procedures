/**
 * PM Feature Flags.
 *
 * Spec: Builder/Compliance-Execution-Sprints/PM-Implementation-Plan.md §2
 *
 * Each PM phase ships behind a flag. Flags persist in localStorage so a
 * developer can toggle them at runtime via window.__pm.setFlag(name, true)
 * without a rebuild.
 *
 *   pm_layer_v1               → Phase 0/1 surfaces (My Tasks, Drawer, Filter, Card)
 *   pm_kanban                 → Phase 2 (DnD Kanban)
 *   pm_gantt                  → Phase 5 (Gantt + dependencies)
 *   composite_form_signers    → Wave 2 / MVP-P0-TASK-001 (composite Form + Signers
 *                               view-only collapse in WorkflowExecutionPanel).
 *                               Default ON. Flip OFF for instant rollback per
 *                               MVP plan L1208 ("flag.composite-form-signers —
 *                               flip off for instant rollback").
 *   supersede_form_instance   → Wave 3 / MVP-P0-ECIGN-001 (form-instance supersede
 *                               chain mutation). Default ON. Consumers
 *                               (FormSigningWorkspace correction flows) MUST
 *                               check this flag before calling
 *                               `regulatoryExecutionStore.supersedeFormInstance`.
 *                               Flip OFF to fall back to legacy resign
 *                               behavior (in-place status mutation, no chain).
 *   signed_snapshot_capture   → Wave 3 / MVP-P0-ECIGN-002 (stored HTML snapshot
 *                               capture at sign time + IDB prefetch on
 *                               ArtifactViewerPage). Default ON. Flip OFF to
 *                               suppress IDB prefetch and revert to
 *                               memory+localStorage-only resolution (pre-Wave-3
 *                               cold-reload behavior). Note: the snapshot
 *                               UPLOAD itself happens unconditionally in
 *                               FormSigningWorkspace.finalize — this flag
 *                               controls cold-reload retrieval guarantees.
 */

import { useSyncExternalStore } from 'react';

export type PmFeatureFlag =
  | 'pm_layer_v1'
  | 'pm_kanban'
  | 'pm_gantt'
  | 'composite_form_signers'
  | 'supersede_form_instance'
  | 'signed_snapshot_capture'
  | 'trainer_route_blocking'
  | 'signer_role_recheck_before_lock'
  | 'required_fields_lock_gate'
  | 'print_unified_chrome';

const STORAGE_KEY = 'pm-feature-flags-v1';

/** All flags default ON in dev, ON in prod once architecture is stable. */
const DEFAULTS: Record<PmFeatureFlag, boolean> = {
  pm_layer_v1: true,
  pm_kanban: true,
  pm_gantt: true,
  composite_form_signers: true,
  supersede_form_instance: true,
  signed_snapshot_capture: true,
  /* Wave 4 / MVP-P1-PERMS-001 — gate Trainer role from restricted admin routes.
   * Default ON. Flip OFF to revert to pre-Wave-4 unguarded behavior. The
   * gate is also a no-op when the user's role cannot be determined (see
   * `src/policy/auth/permissions.ts` for the identity gap documentation). */
  trainer_route_blocking: true,
  /* Wave 4 / MVP-P1-ECIGN-003 — re-verify actor role at lock time matches
   * the role captured at sign-start. Blocks the LOCKED status transition
   * when roles diverge, emits a `FORM_LOCK_BLOCKED_ROLE_MISMATCH` audit row,
   * and surfaces an inline banner so the operator can resign with the
   * correct role. Default ON. Flip OFF to revert to legacy behavior. */
  signer_role_recheck_before_lock: true,
  /* Wave 4 / MVP-P1-ECIGN-004 — verify all required fields are filled
   * before the LOCKED status transition. Blocks lock + emits a
   * `FORM_LOCK_BLOCKED_REQUIRED_FIELDS` audit row when fields are missing.
   * Uses DOM-anchored `aria-required="true"` lookup (Wave 3 A11Y-001
   * preserved aria-required attributes on the canonical Field renderer).
   * Default ON. Flip OFF to revert to legacy behavior. */
  required_fields_lock_gate: true,
  /* Wave 5A / MVP-P1-PRINT-001 — opt-in unified print chrome.
   * When ON, <PrintFrame> injects the canonical @media print CSS,
   * standard Care Indeed header, and optional standard footer on the
   * print routes that have been migrated to the shared utils (Wave 5A:
   * FormPrintView only; Wave 5b will add PrintPage, GVGBPrintDocument,
   * and the eCign packet path under explicit owner sign-off).
   * When OFF, <PrintFrame> is a transparent passthrough that renders
   * only `{children}` — every migrated page falls back to its previous
   * inline-CSS chrome. This is the instant rollback handle.
   * Default ON. */
  print_unified_chrome: true,
};

const subscribers = new Set<() => void>();
let cache: Record<PmFeatureFlag, boolean> | null = null;

function read(): Record<PmFeatureFlag, boolean> {
  if (cache) return cache;
  if (typeof window === 'undefined') {
    cache = { ...DEFAULTS };
    return cache;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Record<PmFeatureFlag, boolean>) } : { ...DEFAULTS };
  } catch {
    cache = { ...DEFAULTS };
  }
  return cache;
}

function write(next: Record<PmFeatureFlag, boolean>): void {
  cache = next;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
  }
  subscribers.forEach(fn => fn());
}

export function getFlag(flag: PmFeatureFlag): boolean {
  return read()[flag];
}

export function setFlag(flag: PmFeatureFlag, value: boolean): void {
  const next = { ...read(), [flag]: value };
  write(next);
}

export function getAllFlags(): Record<PmFeatureFlag, boolean> {
  return { ...read() };
}

function subscribe(fn: () => void): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

/** React hook: returns the live boolean for the flag. */
export function usePmFlag(flag: PmFeatureFlag): boolean {
  return useSyncExternalStore(
    subscribe,
    () => read()[flag],
    () => DEFAULTS[flag],
  );
}

/* Expose a tiny dev console hook. */
if (typeof window !== 'undefined') {
  (window as unknown as { __pm?: { getFlag: typeof getFlag; setFlag: typeof setFlag; getAllFlags: typeof getAllFlags } }).__pm = {
    getFlag,
    setFlag,
    getAllFlags,
  };
}
