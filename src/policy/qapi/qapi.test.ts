import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import {
  buildQapiDateWindow, validateDateWindow, isWithinWindow, parseLooseDate,
  extractQapiRollup, buildPersonnelAddendum, buildAddendumReference, needsPersonnelAddendum,
  validateQapiPacketForLock, renderQapiPacketHtml, type ClinicalDump,
} from './index';

const DUMP_PATH = 'output/clients.q1q2-2026.mock.json';
function loadDump(): ClinicalDump | null {
  if (!existsSync(DUMP_PATH)) return null;
  return JSON.parse(readFileSync(DUMP_PATH, 'utf8')) as ClinicalDump;
}

// ───────────────────────── PHASE 1: date window ─────────────────────────
describe('Phase 1 — date window', () => {
  it('May 7 meeting is INTERIM, capped at the meeting date (no final-Q2-with-June)', () => {
    const w = buildQapiDateWindow('2026-05-07');
    expect(w.packetType).toBe('interim');
    expect(w.quarterEnd).toBe('2026-06-30');
    expect(w.dataThroughDate).toBe('2026-05-07');
    expect(w.title).toMatch(/Interim Q2 2026/);
  });

  it('a June source event on a May-7 packet triggers INVALID_DATE_WINDOW', () => {
    const w = buildQapiDateWindow('2026-05-07');
    const v = validateDateWindow(w, [{ id: 'INC-1', date: '2026-06-19', kind: 'incident' }, { id: 'INC-2', date: '2026-05-03', kind: 'incident' }]);
    expect(v).toHaveLength(1);
    expect(v[0].code).toBe('INVALID_DATE_WINDOW');
    expect(v[0].sourceArtifactId).toBe('INC-1');
  });

  it('May-7 interim excludes post-May-7 events', () => {
    const w = buildQapiDateWindow('2026-05-07');
    expect(isWithinWindow(w, '2026-05-03')).toBe(true);
    expect(isWithinWindow(w, '2026-06-08')).toBe(false);
  });

  it('post-quarter (July) meeting reviewing Q2 is FINAL and includes full Apr–Jun', () => {
    const w = buildQapiDateWindow('2026-07-10', { reviewQuarter: '2026-Q2' });
    expect(w.packetType).toBe('final');
    expect(w.dataThroughDate).toBe('2026-06-30');
    expect(isWithinWindow(w, '2026-06-30')).toBe(true);
    expect(validateDateWindow(w, [{ id: 'X', date: '2026-06-15' }])).toHaveLength(0);
  });

  it('parses messy dates and rejects invalid ones', () => {
    expect(parseLooseDate('04/18/2026')).toBe('2026-04-18');
    expect(parseLooseDate('2026/05/30')).toBe('2026-05-30');
    expect(parseLooseDate('2026-13-02')).toBeNull();
    expect(parseLooseDate('02/30/1950')).toBeNull();
    expect(parseLooseDate('')).toBeNull();
  });
});

// ───────────────────────── PHASE 2: lock gates ─────────────────────────
describe('Phase 2 — validateQapiPacketForLock', () => {
  const base = {
    packetId: 'P1',
    governanceRoles: [{ role: 'DON', name: 'Dakota Director', authorityConfirmed: true }],
    rollups: { activeCensus: 40, recertCounts: 8, highRiskRollupPresent: true, priorPeriodComparisonPresent: true, claimsTrend: true },
    signatures: [{ role: 'DON', rendered: true, signerRecord: { signerId: 's1', signerName: 'Dakota', signerRole: 'DON', authorityBasis: 'role', timestamp: '2026-07-10T10:00:00Z', evidenceId: 'ev1', artifactHash: 'h' } }],
    addendum: { required: false },
  };
  it('passes a clean packet', () => {
    expect(validateQapiPacketForLock({ ...base, html: 'All real content.' }).pass).toBe(true);
  });
  it('blocks on "Please use Evidence Studio"', () => {
    const r = validateQapiPacketForLock({ ...base, html: 'Please use Evidence Studio to add metrics.' });
    expect(r.pass).toBe(false);
    expect(r.findings.some((x) => /Evidence Studio/.test(x.reason))).toBe(true);
  });
  it('blocks on TBD required role', () => {
    const r = validateQapiPacketForLock({ ...base, html: 'ok', governanceRoles: [{ role: 'DON', name: 'TBD', authorityConfirmed: true }] });
    expect(r.pass).toBe(false);
  });
  it('blocks on unconfirmed approver authority', () => {
    const r = validateQapiPacketForLock({ ...base, html: 'ok', governanceRoles: [{ role: 'DON', name: 'Dakota', authorityConfirmed: false }] });
    expect(r.pass).toBe(false);
    expect(r.findings.some((x) => /authority/i.test(x.path))).toBe(true);
  });
  it('blocks a rendered checkmark without a signer record (no fake signatures)', () => {
    const r = validateQapiPacketForLock({ ...base, html: 'ok', signatures: [{ role: 'DON', rendered: true, signerRecord: null }] });
    expect(r.pass).toBe(false);
    expect(r.findings.some((x) => /signature\.DON/.test(x.path))).toBe(true);
  });
  it('blocks when a required addendum was not generated', () => {
    const r = validateQapiPacketForLock({ ...base, html: 'ok', addendum: { required: true, generatedId: null } });
    expect(r.pass).toBe(false);
  });
  it('blocks when high-risk rollup missing', () => {
    const r = validateQapiPacketForLock({ ...base, html: 'ok', rollups: { ...base.rollups, highRiskRollupPresent: false } });
    expect(r.pass).toBe(false);
  });
});

// ───────────────────── PHASE 4: personnel addendum ─────────────────────
describe('Phase 4 — confidential personnel addendum', () => {
  const dump: ClinicalDump = {
    meta: { quarter: '2026-Q2' },
    patients: [],
    clinicians: [
      { clinician_id: 'CLN-001', name: 'Pat Problem', role: 'RN', triggers: [{ category: 'expired_license', risk_level: 'critical', detail: 'care under expired license', client_id: 'MOCK-PT-Q2-0009' }] },
      { clinician_id: 'CLN-002', name: '', role: 'LVN', triggers: [{ category: 'beyond_scope', risk_level: 'critical', detail: 'LVN did SOC assessment' }] },
      { clinician_id: 'CLN-003', name: 'Sam Slip', role: 'RN', triggers: [{ category: 'falsified_visits', risk_level: 'critical', detail: 'visit time mismatch' }] },
      { clinician_id: 'CLN-004', name: 'Lee Late', role: 'HHA', triggers: [{ category: 'hha_no_supervision', risk_level: 'high', detail: 'no 14-day supervisory visit' }] },
      { clinician_id: 'CLN-005', name: 'PIP Person', role: 'RN', triggers: [{ category: 'failed_pip_pending_termination', risk_level: 'high', detail: 'failed PIP, high-risk caseload' }] },
      { clinician_id: 'CLN-006', name: 'Lab Misser', role: 'RN', triggers: [{ category: 'unreported_critical_labs', risk_level: 'critical', detail: 'critical INR not reported' }] },
    ],
  };
  const add = buildPersonnelAddendum(dump);

  it('creates one action per trigger with the right review flags', () => {
    expect(add.actions).toHaveLength(6);
    const lic = add.actions.find((a) => a.triggerCategory === 'expired_license')!;
    expect(lic.credentialingReviewRequired).toBe(true);
    expect(lic.patientImpactReviewRequired).toBe(true);
    expect(lic.billingClaimsReviewRequired).toBe(true);
    const fals = add.actions.find((a) => a.triggerCategory === 'falsified_visits')!;
    expect(fals.billingClaimsReviewRequired).toBe(true);
    const scope = add.actions.find((a) => a.triggerCategory === 'beyond_scope')!;
    expect(scope.requiredImmediateAction.join(' ')).toMatch(/scope-of-practice/i);
    const hha = add.actions.find((a) => a.triggerCategory === 'hha_no_supervision')!;
    expect(hha.requiredImmediateAction.join(' ')).toMatch(/supervision corrective action/i);
    const pip = add.actions.find((a) => a.triggerCategory === 'failed_pip_pending_termination')!;
    expect(pip.requiredImmediateAction.join(' ')).toMatch(/assignment restriction/i);
    const lab = add.actions.find((a) => a.triggerCategory === 'unreported_critical_labs')!;
    expect(lab.reportabilityReviewRequired).toBe(true);
  });

  it('uses staff ID when the clinician name is not authoritative', () => {
    const noName = add.actions.find((a) => a.sourceClinicianId === 'CLN-002')!;
    expect(noName.staffName).toBe('Staff CLN-002');
  });

  it('never fabricates a final disposition', () => {
    expect(add.actions.every((a) => a.finalHrDisposition === '')).toBe(true);
  });

  it('reference exposes counts/hash but NOT personnel details', () => {
    const ref = buildAddendumReference(add);
    expect(ref.personnelActionReviewsOpened).toBe(6);
    expect(ref.addendumId).toBe('QAPI-HR-ADDENDUM-2026-Q2');
    expect(ref.confidentialityStatement).toMatch(/Confidential personnel details retained/);
    // the reference object must not carry any staff name / trigger detail
    const json = JSON.stringify(ref);
    expect(json).not.toMatch(/Pat Problem|Sam Slip|expired license|visit time mismatch/);
  });

  it('hash is deterministic for identical input', () => {
    expect(buildPersonnelAddendum(dump).hash).toBe(add.hash);
  });
});

// ───────────────── PHASE 3 + integration over the real mock dump ─────────────────
describe('Phase 3 — extraction over the generated mock dump', () => {
  const dump = loadDump();
  it('(dump present)', () => { expect(dump, `generate it first: node scripts/generateMockClinicalDump.mjs`).not.toBeNull(); });
  if (!dump) return;

  it('excludes post-meeting (June) events for a May-7 interim window', () => {
    const roll = extractQapiRollup(dump, '2026-05-07');
    expect(roll.window.packetType).toBe('interim');
    expect(roll.incidents.excludedFutureDated + roll.infections.excludedFutureDated).toBeGreaterThan(0);
  });

  it('surfaces data-quality exceptions (does not hide messiness)', () => {
    const roll = extractQapiRollup(dump, '2026-07-10');
    expect(roll.exceptions.length).toBeGreaterThan(0);
    expect(roll.census.duplicateClientIds.length).toBeGreaterThan(0);
  });

  it('a final packet still flags any post-quarter event as INVALID_DATE_WINDOW', () => {
    const w = buildQapiDateWindow('2026-07-10', { reviewQuarter: '2026-Q2' });
    const events = (dump.incidents ?? []).map((i) => ({ id: i.incident_id, date: i.date_of_incident }));
    // none should be after 06-30 in this dataset's quarter; if any are, they must be caught
    const after = events.filter((e) => { const d = parseLooseDate(e.date); return d && d > '2026-06-30'; });
    expect(validateDateWindow(w, events).length).toBe(after.length);
  });

  it('requires an addendum and it is non-empty (triggers exist in the dump)', () => {
    expect(needsPersonnelAddendum(dump)).toBe(true);
    const add = buildPersonnelAddendum(dump);
    expect(add.actions.length).toBeGreaterThan(0);
  });
});

// ───────────────── PHASE 5: rendered packet output is correct ─────────────────
describe('Phase 5 — rendered QAPI packet output', () => {
  const dump = loadDump();
  it('(dump present)', () => { expect(dump).not.toBeNull(); });
  if (!dump) return;
  const opts = { reviewQuarter: '2026-Q2', approvers: [{ role: 'DON', name: 'Dakota', authorityConfirmed: true }] };

  it('May-7 packet is titled INTERIM and states the data-through date', () => {
    const html = renderQapiPacketHtml(dump, '2026-05-07', opts);
    expect(html).toMatch(/Interim Q2 2026 QAPI/);
    expect(html).toMatch(/Data-through date/);
    expect(html).toMatch(/2026-05-07/);
  });

  it('contains NO unresolved placeholders', () => {
    const html = renderQapiPacketHtml(dump, '2026-07-10', opts);
    expect(html).not.toMatch(/Please use Evidence Studio/i);
    expect(html).not.toMatch(/required missing information/i);
    expect(html).not.toMatch(/\bTBD\b/);
    expect(html).not.toMatch(/\[(?:Physician|Diagnosis|MR#|Census)\]/);
  });

  it('references the sealed addendum but EXPOSES no personnel details', () => {
    const html = renderQapiPacketHtml(dump, '2026-07-10', opts);
    expect(html).toMatch(/QAPI-HR-ADDENDUM-2026-Q2/);
    expect(html).toMatch(/Confidential personnel details retained/);
    // no clinician names / trigger detail text from the addendum leak into the main packet
    const add = buildPersonnelAddendum(dump);
    const leaked = add.actions.filter((a) => a.staffName && !/^Staff /.test(a.staffName) && html.includes(a.staffName));
    expect(leaked).toHaveLength(0);
    expect(html).not.toMatch(/care under expired license|visit time mismatch/);
  });

  it('renders real census numbers (numerator/denominator), not blanks', () => {
    const roll = extractQapiRollup(dump, '2026-07-10', { reviewQuarter: '2026-Q2' });
    const html = renderQapiPacketHtml(dump, '2026-07-10', opts);
    expect(html).toMatch(new RegExp(`Active census`));
    expect(html).toContain(String(roll.census.activeCensus));
  });
});
