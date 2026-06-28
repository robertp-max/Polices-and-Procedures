import { describe, it, expect } from 'vitest';
import {
  runAdmissionPacketSelfTests, validateAdmissionPacket, renderPatientFacingText,
  buildPatientFacingSections, buildAdmissionPacketPages, buildAdmissionPacketExportPlan,
  sampleAdmissionPacketData, type AdmissionPacketData,
} from './patientAdmissionPacket';

describe('Patient Admission Packet v3 — template self-tests', () => {
  for (const t of runAdmissionPacketSelfTests()) {
    it(t.name, () => { expect(t.pass, t.details).toBe(true); });
  }
});

describe('Patient Admission Packet v3 — integration guards', () => {
  it('renders exactly one payer-route section (no leakage of others)', () => {
    const out = renderPatientFacingText({ ...sampleAdmissionPacketData, paymentRoute: 'PRIVATE_PAY', fields: { privatePayRate: '$125/visit' } } as AdmissionPacketData);
    expect(out).toMatch(/Selected Payer Route - Private Pay/);
    expect(out).not.toMatch(/Selected Payer Route - Medi-Cal/);
    expect(out).not.toMatch(/Selected Payer Route - Original Medicare/);
  });
  it('builds multiple semantic pages for DefenCIble export', () => {
    const pages = buildAdmissionPacketPages(sampleAdmissionPacketData);
    expect(pages).toHaveLength(13);
    expect(pages[0].pageId).toBe('cover');
    expect(pages.at(-1)?.pageId).toBe('final-signature');
  });
  it('blocks final PDF/export when validation has blockers', () => {
    expect(() =>
      buildAdmissionPacketExportPlan(sampleAdmissionPacketData, {
        querySelectorAll: () => [] as unknown as NodeListOf<HTMLElement>,
      } as unknown as ParentNode),
    ).toThrow(/blocked/i);
  });
  it('never exposes internal-only sections in patient-facing text', () => {
    const sections = buildPatientFacingSections({ ...sampleAdmissionPacketData, paymentRoute: 'PENDING_VERIFICATION' });
    expect(sections.some((s) => s.internalOnly)).toBe(false);
  });
  it('blocks finalization when payment route missing', () => {
    const r = validateAdmissionPacket({ ...sampleAdmissionPacketData, paymentRoute: undefined });
    expect(r.validForProductionFinalization).toBe(false);
    expect(r.blockers.some((b) => b.code === 'MISSING_PAYMENT_ROUTE')).toBe(true);
  });
});
