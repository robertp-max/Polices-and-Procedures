/**
 * Phase 2B closure, commit 2 — versioned allowlisted codec tests.
 * Decoders validate the full V1 schema, reject unversioned/credential-shaped/
 * malformed data (fail closed 503), and return fresh allowlisted objects.
 */
import { describe, expect, it } from 'vitest';
import {
  decodeLifecycleRecord, encodeLifecycleRecord,
  decodeLifecycleOperation, encodeLifecycleOperation,
  decodeLifecycleIdempotencyClaim, encodeLifecycleIdempotencyClaim,
} from './codecs.js';
import { SUSPEND_STEP_ORDER, REACTIVATE_STEP_ORDER, type SemanticLifecycleStep } from './semantics.js';

const HEX = 'a'.repeat(64);
const HEX2 = 'b'.repeat(64);
const T0 = '2027-01-01T00:00:00.000Z';
const T1 = '2027-01-02T00:00:00.000Z';
const UID = 'usr-1';

const lifeV1 = (over: Record<string, unknown> = {}) => ({
  schemaVersion: 1, canonicalUserId: UID, provider: 'cognito', providerUsername: 'c1',
  normalizedEmail: 'robertp+phase7uat@careindeed.com', status: 'active', version: 1,
  initializationSource: 'verified_legacy_active', createdAt: T0, createdBy: 'admin', updatedAt: T0, updatedBy: 'admin', ...over,
});
const opV1 = (over: Record<string, unknown> = {}) => ({
  schemaVersion: 1, operationId: 'op-1', idempotencyKeyHash: HEX, requestFingerprint: HEX2, action: 'suspend',
  targetUserId: UID, actorUserId: 'admin', actorEmailSnapshot: 'admin@careindeed.com', reason: 'policy violation',
  status: 'running', operationVersion: 1, expectedLifecycleVersion: 1, beforeStatus: 'active',
  transitionalStatus: 'suspending', desiredStatus: 'suspended', completedSteps: ['intent_recorded', 'global_deny_committed'],
  correlationId: 'corr-1', createdAt: T0, updatedAt: T0, ...over,
});
const claimV1 = (over: Record<string, unknown> = {}) => ({ schemaVersion: 1, operationId: 'op-1', requestFingerprint: HEX, ...over });
const SUSPEND_FULL = [...SUSPEND_STEP_ORDER] as SemanticLifecycleStep[];
const afterCanonical = ['intent_recorded', 'global_deny_committed', 'canonical_transition_projected'];

describe('lifecycle codec', () => {
  it('1. valid round trip', () => { expect(decodeLifecycleRecord(lifeV1(), UID)).toMatchObject({ canonicalUserId: UID, status: 'active' }); });
  it('2. schemaVersion added on encode', () => { const { schemaVersion, ...noVer } = lifeV1(); void schemaVersion; expect(encodeLifecycleRecord(noVer as never).schemaVersion).toBe(1); });
  it('3. missing schemaVersion rejected', () => { const { schemaVersion, ...noVer } = lifeV1(); void schemaVersion; expect(() => decodeLifecycleRecord(noVer, UID)).toThrow(); });
  it('4. unsupported version rejected', () => { expect(() => decodeLifecycleRecord(lifeV1({ schemaVersion: 2 }), UID)).toThrow(); });
  it('5. canonical ID mismatch rejected', () => { expect(() => decodeLifecycleRecord(lifeV1(), 'other')).toThrow(); });
  it('6. active + currentOperationId rejected', () => { expect(() => decodeLifecycleRecord(lifeV1({ currentOperationId: 'op-1' }), UID)).toThrow(); });
  it('7. suspending without operation rejected', () => { expect(() => decodeLifecycleRecord(lifeV1({ status: 'suspending' }), UID)).toThrow(); });
  it('8. manual reconciliation without operation accepted', () => { expect(decodeLifecycleRecord(lifeV1({ status: 'reconciliation_required', initializationSource: 'manual_reconciliation' }), UID).status).toBe('reconciliation_required'); });
  it('9. non-manual reconciliation without operation rejected', () => { expect(() => decodeLifecycleRecord(lifeV1({ status: 'reconciliation_required' }), UID)).toThrow(); });
  it('10. unnormalized email rejected', () => { expect(() => decodeLifecycleRecord(lifeV1({ normalizedEmail: 'MixedCase@X.com' }), UID)).toThrow(); });
  it('11. plus-tag normalized email accepted', () => { expect(decodeLifecycleRecord(lifeV1({ normalizedEmail: 'robertp+phase7uat@careindeed.com' }), UID).normalizedEmail).toBe('robertp+phase7uat@careindeed.com'); });
  it('12. invalid version rejected', () => { expect(() => decodeLifecycleRecord(lifeV1({ version: 0 }), UID)).toThrow(); expect(() => decodeLifecycleRecord(lifeV1({ version: 1.5 }), UID)).toThrow(); });
  it('13. invalid timestamp rejected', () => { expect(() => decodeLifecycleRecord(lifeV1({ createdAt: 'not-a-date' }), UID)).toThrow(); expect(() => decodeLifecycleRecord(lifeV1({ createdAt: '2027-01-01' }), UID)).toThrow(); });
  it('14. createdAt after updatedAt rejected', () => { expect(() => decodeLifecycleRecord(lifeV1({ createdAt: T1, updatedAt: T0 }), UID)).toThrow(); });
  it('15. unknown property not returned', () => { const d = decodeLifecycleRecord(lifeV1({ extraJunk: 'x' }), UID); expect((d as Record<string, unknown>).extraJunk).toBeUndefined(); });
  it('16. prohibited credential key rejected', () => {
    expect(() => decodeLifecycleRecord(lifeV1({ accessToken: 'x' }), UID)).toThrow();
    expect(() => decodeLifecycleRecord(lifeV1({ access_token: 'x' }), UID)).toThrow();
    expect(() => decodeLifecycleRecord(lifeV1({ authSubject: 'x' }), UID)).toThrow();
  });
  it('17. UTF-8 byte limit enforced', () => { expect(() => decodeLifecycleRecord(lifeV1({ providerUsername: 'x'.repeat(257) }), UID)).toThrow(); });
});

describe('operation codec', () => {
  it('18. valid suspension op round trip', () => { expect(decodeLifecycleOperation(opV1(), UID, 'op-1').action).toBe('suspend'); });
  it('19. valid reactivation op round trip', () => {
    const d = decodeLifecycleOperation(opV1({ action: 'reactivate', beforeStatus: 'suspended', transitionalStatus: 'reactivating', desiredStatus: 'active' }), UID, 'op-1');
    expect(d.action).toBe('reactivate');
  });
  it('20. target ID mismatch rejected', () => { expect(() => decodeLifecycleOperation(opV1(), 'other', 'op-1')).toThrow(); });
  it('21. operation ID mismatch rejected', () => { expect(() => decodeLifecycleOperation(opV1(), UID, 'other-op')).toThrow(); });
  it('22. malformed idempotency hash rejected', () => { expect(() => decodeLifecycleOperation(opV1({ idempotencyKeyHash: 'nothex' }), UID, 'op-1')).toThrow(); expect(() => decodeLifecycleOperation(opV1({ idempotencyKeyHash: 'A'.repeat(64) }), UID, 'op-1')).toThrow(); });
  it('23. malformed fingerprint rejected', () => { expect(() => decodeLifecycleOperation(opV1({ requestFingerprint: 'xyz' }), UID, 'op-1')).toThrow(); });
  it('24. missing actor rejected', () => { expect(() => decodeLifecycleOperation(opV1({ actorUserId: '' }), UID, 'op-1')).toThrow(); });
  it('25. missing reason rejected', () => { expect(() => decodeLifecycleOperation(opV1({ reason: '' }), UID, 'op-1')).toThrow(); });
  it('26. missing correlation ID rejected', () => { expect(() => decodeLifecycleOperation(opV1({ correlationId: '' }), UID, 'op-1')).toThrow(); });
  it('27. missing timestamp rejected', () => { const o = opV1(); delete (o as Record<string, unknown>).createdAt; expect(() => decodeLifecycleOperation(o, UID, 'op-1')).toThrow(); });
  it('28. invalid action triple rejected', () => { expect(() => decodeLifecycleOperation(opV1({ transitionalStatus: 'reactivating' }), UID, 'op-1')).toThrow(); });
  it('29. duplicate step rejected', () => { expect(() => decodeLifecycleOperation(opV1({ completedSteps: ['intent_recorded', 'intent_recorded'] }), UID, 'op-1')).toThrow(); });
  it('30. out-of-order step rejected', () => { expect(() => decodeLifecycleOperation(opV1({ completedSteps: ['global_deny_committed', 'intent_recorded'] }), UID, 'op-1')).toThrow(); });
  it('31. opposite-action step rejected', () => { expect(() => decodeLifecycleOperation(opV1({ completedSteps: ['intent_recorded', 'global_deny_committed', 'provider_enabled'] }), UID, 'op-1')).toThrow(); });
  it('32. skipped prerequisite rejected', () => { expect(() => decodeLifecycleOperation(opV1({ completedSteps: ['intent_recorded', 'global_deny_committed', 'provider_disabled'] }), UID, 'op-1')).toThrow(); });
  it('33. running + final step rejected', () => { expect(() => decodeLifecycleOperation(opV1({ status: 'running', completedSteps: SUSPEND_FULL }), UID, 'op-1')).toThrow(); });
  it('34. reconciliation without failedStep rejected', () => { expect(() => decodeLifecycleOperation(opV1({ status: 'reconciliation_required', completedSteps: afterCanonical }), UID, 'op-1')).toThrow(); });
  it('35. reconciliation with already-completed failedStep rejected', () => { expect(() => decodeLifecycleOperation(opV1({ status: 'reconciliation_required', completedSteps: afterCanonical, failedStep: 'canonical_transition_projected', failureCode: 'X' }), UID, 'op-1')).toThrow(); });
  it('36. reconciliation with wrong next failedStep rejected', () => { expect(() => decodeLifecycleOperation(opV1({ status: 'reconciliation_required', completedSteps: afterCanonical, failedStep: 'provider_sessions_revoked', failureCode: 'X' }), UID, 'op-1')).toThrow(); });
  it('36b. reconciliation with correct next failedStep accepted', () => { expect(decodeLifecycleOperation(opV1({ status: 'reconciliation_required', completedSteps: afterCanonical, failedStep: 'provider_disabled', failureCode: 'COGNITO_DISABLE_FAILED' }), UID, 'op-1').failedStep).toBe('provider_disabled'); });
  it('37. completed without full sequence rejected', () => { expect(() => decodeLifecycleOperation(opV1({ status: 'completed', completedSteps: afterCanonical }), UID, 'op-1')).toThrow(); });
  it('37b. completed with full sequence accepted', () => { expect(decodeLifecycleOperation(opV1({ status: 'completed', completedSteps: SUSPEND_FULL }), UID, 'op-1').status).toBe('completed'); });
  it('38. completed retaining failure markers rejected', () => { expect(() => decodeLifecycleOperation(opV1({ status: 'completed', completedSteps: SUSPEND_FULL, failedStep: 'provider_disabled', failureCode: 'X' }), UID, 'op-1')).toThrow(); });
  it('39. failed_without_mutation rejected', () => { expect(() => decodeLifecycleOperation(opV1({ status: 'failed_without_mutation' }), UID, 'op-1')).toThrow(); });
  it('40. old completion_audited step rejected', () => { expect(() => decodeLifecycleOperation(opV1({ completedSteps: ['intent_recorded', 'global_deny_committed', 'completion_audited'] }), UID, 'op-1')).toThrow(); });
  it('41. unknown property not returned', () => { const d = decodeLifecycleOperation(opV1({ extra: 'x' }), UID, 'op-1'); expect((d as Record<string, unknown>).extra).toBeUndefined(); });
  it('42. prohibited credential key rejected', () => { expect(() => decodeLifecycleOperation(opV1({ refreshToken: 'x' }), UID, 'op-1')).toThrow(); });
});

describe('idempotency claim codec', () => {
  it('43. valid claim round trip', () => { expect(decodeLifecycleIdempotencyClaim(claimV1())).toMatchObject({ operationId: 'op-1', requestFingerprint: HEX }); });
  it('44. raw idempotency key never encoded', () => { const enc = encodeLifecycleIdempotencyClaim({ operationId: 'op-1', requestFingerprint: HEX }); expect(Object.keys(enc).sort()).toEqual(['operationId', 'requestFingerprint', 'schemaVersion']); });
  it('45. missing schemaVersion rejected', () => { expect(() => decodeLifecycleIdempotencyClaim({ operationId: 'op-1', requestFingerprint: HEX })).toThrow(); });
  it('46. invalid operationId rejected', () => { expect(() => decodeLifecycleIdempotencyClaim(claimV1({ operationId: '' })).toString()).toThrow(); });
  it('47. malformed fingerprint rejected', () => { expect(() => decodeLifecycleIdempotencyClaim(claimV1({ requestFingerprint: 'short' }))).toThrow(); });
  it('48. malformed claim does not become a 404', () => { let s: number | undefined; try { decodeLifecycleIdempotencyClaim(claimV1({ requestFingerprint: 'x' })); } catch (e) { s = (e as { status?: number }).status; } expect(s).toBe(503); });
  it('49. unknown property not returned', () => { const d = decodeLifecycleIdempotencyClaim(claimV1({ foo: 'bar' })); expect((d as Record<string, unknown>).foo).toBeUndefined(); });
  it('50. prohibited credential key rejected', () => { expect(() => decodeLifecycleIdempotencyClaim(claimV1({ sessionToken: 'x' }))).toThrow(); });
});

describe('codec safety invariants', () => {
  it('decoders return fresh objects, not raw references', () => { const raw = lifeV1(); expect(decodeLifecycleRecord(raw, UID)).not.toBe(raw); });
  it('mutating the input after decoding cannot alter the decoded result', () => {
    const raw = opV1();
    const d = decodeLifecycleOperation(raw, UID, 'op-1');
    (raw.completedSteps as string[]).push('provider_disabled');
    (raw as Record<string, unknown>).status = 'completed';
    expect(d.completedSteps).toEqual(['intent_recorded', 'global_deny_committed']);
    expect(d.status).toBe('running');
  });
  it('encoder output contains only allowlisted keys', () => {
    const { schemaVersion, ...noVer } = lifeV1(); void schemaVersion;
    const enc = encodeLifecycleRecord(noVer as never);
    const allowed = new Set(['schemaVersion', 'canonicalUserId', 'provider', 'providerUsername', 'normalizedEmail', 'status', 'version', 'currentOperationId', 'lastCompletedOperationId', 'reasonCode', 'initializationSource', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy']);
    for (const k of Object.keys(enc)) expect(allowed.has(k)).toBe(true);
  });
  it('encodeLifecycleOperation stamps schemaVersion and validates through the same rules', () => {
    const { schemaVersion, ...noVer } = opV1(); void schemaVersion;
    const enc = encodeLifecycleOperation(noVer as never);
    expect(enc.schemaVersion).toBe(1);
    expect(enc.action).toBe('suspend');
    // encode enforces the same invariants as decode
    expect(() => encodeLifecycleOperation({ ...noVer, status: 'completed', completedSteps: afterCanonical } as never)).toThrow();
  });
  it('reactivation full-sequence completion uses the reactivation order', () => {
    const d = decodeLifecycleOperation(opV1({ action: 'reactivate', beforeStatus: 'suspended', transitionalStatus: 'reactivating', desiredStatus: 'active', status: 'completed', completedSteps: [...REACTIVATE_STEP_ORDER] }), UID, 'op-1');
    expect(d.status).toBe('completed');
  });
});
