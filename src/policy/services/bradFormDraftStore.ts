/* ═══════════════════════════════════════════════════════════════════════════
   Brad form draft store.
   ----------------------------------------------------------------------------
   Lightweight, client-side persistence for forms a user fills in from Brad's
   chat. A draft IS a form instance: it has a stable instanceId, the entered
   field values, and a status. Persisted to localStorage so values survive
   closing/reopening the right-panel form. Never auto-submits, certifies, locks,
   or signs — those are explicit user actions handled elsewhere (eCIgn).
   ═══════════════════════════════════════════════════════════════════════════ */

export type BradFormStatus = 'draft' | 'in_review';

export interface BradFormDraft {
  instanceId: string;
  formId: string;
  values: Record<string, string | boolean>;
  status: BradFormStatus;
  updatedAt: string;
}

const keyOf = (formId: string) => `brad.formDraft.${formId}`;

function newInstanceId(formId: string): string {
  const rand = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `inst-${formId}-${rand}`;
}

export function loadDraft(formId: string): BradFormDraft | null {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(keyOf(formId)) : null;
    if (!raw) return null;
    const d = JSON.parse(raw) as BradFormDraft;
    if (!d || d.formId !== formId || typeof d.values !== 'object') return null;
    return d;
  } catch {
    return null;
  }
}

/** Create or update the form instance for this form with the given values. */
export function saveDraft(
  formId: string,
  values: Record<string, string | boolean>,
  status: BradFormStatus = 'draft',
): BradFormDraft {
  const existing = loadDraft(formId);
  const draft: BradFormDraft = {
    instanceId: existing?.instanceId ?? newInstanceId(formId),
    formId,
    values,
    status,
    // Caller stamps a real time only when needed; keep deterministic-friendly here.
    updatedAt: new Date().toISOString(),
  };
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(keyOf(formId), JSON.stringify(draft));
  } catch {
    /* ignore quota/availability errors */
  }
  return draft;
}

export function clearDraft(formId: string): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(keyOf(formId));
  } catch {
    /* ignore */
  }
}
