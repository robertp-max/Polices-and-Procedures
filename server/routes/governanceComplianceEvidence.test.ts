import { describe, expect, it } from 'vitest';
import type { Actor } from '../identity/session.js';
import {
  isDeeUatReviewerActor,
  validateGovernanceEvidenceWrite,
} from './governanceComplianceEvidence.js';

function actor(patch: Partial<Actor> = {}): Actor {
  return {
    type: 'user',
    user_id: 'usr-gb-member',
    email: 'member@careindeed.com',
    roles: ['grp-user'],
    attributes: { branches: [], service_lines: [], access_classes: [] },
    mfa_enrolled: true,
    identity_assurance: 2,
    ...patch,
  };
}

describe('server-side Governing Body evidence boundary', () => {
  it('resolves Dee from immutable authenticated identity', () => {
    expect(isDeeUatReviewerActor(actor({ user_id: 'usr-deeb-admin' }))).toBe(true);
    expect(isDeeUatReviewerActor(actor({ user_id: 'other', email: 'DEEB@careindeed.com' }))).toBe(true);
    expect(isDeeUatReviewerActor(actor({ display_name: 'Dee Bustos' }))).toBe(false);
  });

  it('rejects Dee even when the client omits reviewer mode', () => {
    const verdict = validateGovernanceEvidenceWrite(
      actor({ user_id: 'usr-deeb-admin', email: 'deeb@careindeed.com' }),
      { learnerId: 'usr-deeb-admin' },
    );
    expect(verdict).toMatchObject({
      allowed: false,
      status: 403,
      code: 'PRIVILEGED_REVIEW_EVIDENCE_REJECTED',
    });
  });

  it('rejects a privileged payload and a cross-user learner id', () => {
    expect(
      validateGovernanceEvidenceWrite(actor(), {
        learnerId: 'usr-gb-member',
        privilegedAccessMode: 'uat_reviewer',
      }),
    ).toMatchObject({ allowed: false, status: 403 });
    expect(
      validateGovernanceEvidenceWrite(actor(), { learnerId: 'someone-else' }),
    ).toMatchObject({
      allowed: false,
      status: 403,
      code: 'CROSS_USER_EVIDENCE_REJECTED',
    });
  });

  it('allows only the actor or an actor-namespaced group participant to reach the repository', () => {
    expect(
      validateGovernanceEvidenceWrite(actor(), { learnerId: 'usr-gb-member' }),
    ).toEqual({ allowed: true, actorSubjectId: 'usr-gb-member' });
    expect(
      validateGovernanceEvidenceWrite(actor(), {
        learnerId: 'usr-gb-member:participant-2',
      }),
    ).toEqual({ allowed: true, actorSubjectId: 'usr-gb-member' });
  });
});
