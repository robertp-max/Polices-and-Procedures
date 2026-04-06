import type { LifecycleStatus, PolicyVersion } from '@/policy/types';

export interface GuardResult {
  ok: boolean;
  code: string;
  message: string;
}

export function passGuard(): GuardResult {
  return { ok: true, code: 'OK', message: 'Allowed.' };
}

export function failGuard(code: string, message: string): GuardResult {
  return { ok: false, code, message };
}

export function guardCannotModifyInAuditorMode(isAuditorMode: boolean): GuardResult {
  if (isAuditorMode) {
    return failGuard('AUDITOR_MODE_BLOCK', 'Action blocked in auditor mode.');
  }
  return passGuard();
}

export function guardCannotApproveWithUnresolvedComments(
  unresolvedRequiredComments: number,
): GuardResult {
  if (unresolvedRequiredComments > 0) {
    return failGuard(
      'UNRESOLVED_REQUIRED_COMMENTS',
      'Cannot approve while required comments are unresolved.',
    );
  }
  return passGuard();
}

export function guardCannotPublishIfNotApproved(
  lifecycleStatus: LifecycleStatus,
): GuardResult {
  if (lifecycleStatus !== 'Approved') {
    return failGuard('NOT_APPROVED', 'Cannot publish policy unless current version is approved.');
  }
  return passGuard();
}

export function guardCannotEditLockedVersion(version: PolicyVersion | undefined): GuardResult {
  if (!version) {
    return failGuard('VERSION_NOT_FOUND', 'Policy version does not exist.');
  }

  if (version.isLocked) {
    return failGuard(
      'VERSION_LOCKED',
      'Approved, published, or archived versions are immutable and cannot be edited.',
    );
  }

  return passGuard();
}

const allowedTransitions: Record<LifecycleStatus, LifecycleStatus[]> = {
  Draft: ['Under Review', 'Archived'],
  'Under Review': ['Revision Requested', 'Approved', 'Rejected', 'Archived'],
  'Revision Requested': ['Under Review', 'Archived'],
  Approved: ['Published', 'Archived'],
  Rejected: ['Under Review', 'Archived'],
  Published: ['Archived'],
  Archived: [],
};

export function guardLifecycleTransition(
  currentStatus: LifecycleStatus,
  nextStatus: LifecycleStatus,
): GuardResult {
  if (currentStatus === nextStatus) {
    return passGuard();
  }

  if (!allowedTransitions[currentStatus].includes(nextStatus)) {
    return failGuard(
      'INVALID_TRANSITION',
      `Transition ${currentStatus} -> ${nextStatus} is not allowed.`,
    );
  }

  return passGuard();
}
