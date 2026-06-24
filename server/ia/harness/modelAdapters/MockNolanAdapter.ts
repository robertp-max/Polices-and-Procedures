import type { NolanModelAdapter, NolanResearchRequest, NolanResearchResponse } from '../types.js';

/* Deterministic mock Nolan adapter. Returns a public-research answer with
   official-tier citations + retrieval timestamps (so the verified-flag path is
   exercised). It does NOT actually browse; canReachInternet:false reflects that
   the mock performs no real egress. */
export class MockNolanAdapter implements NolanModelAdapter {
  readonly id = 'mock-nolan';
  readonly canReachInternet = false;
  constructor(private readonly modelId: string) {}

  async validateAvailability(): Promise<{ available: boolean; reason?: string }> {
    return { available: true };
  }

  async research(req: NolanResearchRequest): Promise<NolanResearchResponse> {
    const now = new Date().toISOString();
    return {
      requestId: req.requestId,
      answer:
        `[Mock public research] Re: ${req.sanitizedQuestion} — Public federal guidance for ` +
        `Medicare-certified home health agencies is published by CMS (Conditions of Participation, 42 CFR 484). ` +
        `Verify the current effective text before relying on it.`,
      retrievedAt: now,
      sources: [
        {
          title: 'Medicare and Medicaid Programs: CoPs for Home Health Agencies (42 CFR 484)',
          publisher: 'U.S. Centers for Medicare & Medicaid Services',
          url: 'https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-484',
          publishedAt: '2024-01-01',
          retrievedAt: now,
          sourceTier: 'primary',
          contentHash: 'mock-hash-484',
        },
        {
          title: 'Home Health Agency Center',
          publisher: 'CMS.gov',
          url: 'https://www.cms.gov/medicare/health-safety-standards/conditions-participation-coverage/home-health-agency-center',
          retrievedAt: now,
          sourceTier: 'official',
          contentHash: 'mock-hash-hhac',
        },
      ],
      webSearchQueries: [req.sanitizedQuestion],
      warnings: [],
      safetyScan: { promptInjectionDetected: false, unsafeSourceCount: 0 },
    };
  }
}
