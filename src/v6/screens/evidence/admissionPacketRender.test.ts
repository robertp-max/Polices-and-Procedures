// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildAdmissionDraftData, renderAdmissionPagesHtml } from './StudioLanding';

/* Guards the V6 Create-Packet bug fix: the admission template must render the REAL
   Patient Admission Agreement (not the generic "Custom Event Packet" draft). */
describe('V6 admission packet rendering', () => {
  const data = buildAdmissionDraftData('PRIVATE_PAY', 'CI-HH-ADM-001-123', '2026-06-27T12:00:00.000Z');
  const pages = renderAdmissionPagesHtml(data);
  const html = pages.join('');

  it('renders the real admission agreement, not the generic event-packet draft', () => {
    expect(html).toContain('Patient Admission Agreement');
    expect(html).toContain('Patient Rights and Responsibilities');
    expect(html).toContain('One Final Signature');
    expect(html).not.toContain('Event metadata and packet cover');
    expect(html).not.toMatch(/Custom Event Packet draft/i);
    expect(html).not.toContain('MISSING');
  });

  it('shows Effective Date July 1, 2026 and Document Version 1.0 FINAL', () => {
    expect(html).toContain('July 1, 2026');
    expect(html).toContain('1.0 FINAL');
  });

  it('renders only the selected payer route (Private Pay), suppressing others', () => {
    expect(html).toContain('Private Pay');
    expect(html).not.toContain('Original Medicare');
    expect(html).not.toContain('Medi-Cal');
  });

  it('produces the 13 canonical admission pages', () => {
    expect(pages.length).toBe(13);
  });
});
