import type { FormInstanceRow } from './store.js';

export type State = FormInstanceRow['state'];

/** Allowed forward transitions. Out-of-order moves are blocked at API. */
const FORWARD: Record<State, State[]> = {
  created:        ['disclosed', 'voided'],
  disclosed:      ['verified', 'voided'],
  verified:       ['reviewed', 'voided'],
  reviewed:       ['attested', 'voided'],
  attested:       ['signed_locked', 'voided'],
  signed_locked:  [],            // terminal
  voided:         [],            // terminal
  expired:        [],
};

export function canTransition(from: State, to: State): boolean {
  return FORWARD[from]?.includes(to) ?? false;
}

export function assertTransition(from: State, to: State): void {
  if (!canTransition(from, to)) {
    const err = new Error(`INVALID_STATE_TRANSITION: ${from} → ${to}`);
    (err as Error & { code: string; status: number }).code = 'INVALID_STATE_TRANSITION';
    (err as Error & { code: string; status: number }).status = 409;
    throw err;
  }
}

/** Evaluate whether an instance is fully signed (all required signers). */
export function allRequiredSigned(
  required: FormInstanceRow['required_signers'],
  signedFields: Set<string>,
): boolean {
  return required.every(r => signedFields.has(r.field_id));
}
