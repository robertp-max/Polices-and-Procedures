/**
 * ADR-0002 §B11 — access-review campaign tests. The key guarantee: a campaign
 * cannot be scheduled without a named policyBasis (cadence is policy-owned).
 */
import { describe, expect, it } from 'vitest';
import { createCampaign, type CreateCampaignInput } from './accessReview.ts';

const NOW = '2027-01-01T00:00:00.000Z';
const input = (over: Partial<CreateCampaignInput> = {}): CreateCampaignInput => ({
  scope: 'org:careindeed',
  reviewType: 'phi_access_profile',
  startsAt: NOW,
  dueAt: '2028-01-01T00:00:00.000Z',
  requiredReviewers: ['usr-compliance'],
  policyBasis: 'CO-DG-101 §4.2',
  trigger: 'scheduled',
  createdBy: 'admin-1',
  ...over,
});

describe('createCampaign (policy-owned, fail-closed)', () => {
  it('creates a campaign with a valid policy basis', () => {
    const { list, campaign } = createCampaign([], input(), 'camp-1', NOW);
    expect(list).toHaveLength(1);
    expect(campaign).toMatchObject({ campaignId: 'camp-1', reviewType: 'phi_access_profile', policyBasis: 'CO-DG-101 §4.2', trigger: 'scheduled' });
  });

  it('REFUSES to schedule without a policyBasis', () => {
    expect(() => createCampaign([], input({ policyBasis: '' }), 'camp-2', NOW)).toThrow();
    expect(() => createCampaign([], input({ policyBasis: '   ' }), 'camp-3', NOW)).toThrow();
  });

  it('rejects an unknown reviewType or trigger (fail-closed)', () => {
    expect(() => createCampaign([], input({ reviewType: 'made_up' }), 'camp-4', NOW)).toThrow();
    expect(() => createCampaign([], input({ trigger: 'whenever' }), 'camp-5', NOW)).toThrow();
  });

  it('requires a scope', () => {
    expect(() => createCampaign([], input({ scope: '' }), 'camp-6', NOW)).toThrow();
  });

  it('supports event-triggered reviews (not just scheduled)', () => {
    const { campaign } = createCampaign([], input({ trigger: 'suspension_or_reactivation', reviewType: 'privileged_access' }), 'camp-7', NOW);
    expect(campaign.trigger).toBe('suspension_or_reactivation');
    expect(campaign.reviewType).toBe('privileged_access');
  });
});
