import crypto from 'node:crypto';
import type { HarnessConfig, RelayOutcome, ResearchPurpose, NolanResearchRequest } from './types.js';
import { scanForPhiEgress } from './PhiEgressGuard.js';
import { NolanRuntime } from './NolanRuntime.js';
import { agentAuditLog } from './AgentAuditLogger.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Brad ↔ Nolan Relay — the ONLY bridge.
   ----------------------------------------------------------------------------
   Flow: Brad intent → PHI Egress Guard (default block) → Nolan Relay → Nolan →
   response safety scan → back to Brad as UNTRUSTED external data.
   • Nolan never initiates; the relay is always called by Brad.
   • Nolan receives only a purpose-built, de-identified request envelope —
     never Brad's raw transcript.
   • Nolan output cannot trigger any action; it is data only. Corrective/PIP/
     disciplinary/admin/code actions require Brad's internal validation + human
     approval, which this relay deliberately does not expose.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface BradResearchIntent {
  bradActionId: string;
  purpose: ResearchPurpose;
  rawQuestion: string;        // may contain PHI — scanned/blocked here
  jurisdiction?: string;
  effectiveDateNeeded?: string;
  preferredSourceTiers?: Array<'official' | 'primary' | 'peer-reviewed' | 'vendor'>;
  allowedDomains?: string[];
  excludedDomains?: string[];
  maximumResults?: number;
}

export class BradNolanRelay {
  private readonly nolanKey = Symbol('brad-nolan-relay');
  private readonly nolan: NolanRuntime;
  constructor(private readonly cfg: HarnessConfig) {
    this.nolan = new NolanRuntime(cfg, this.nolanKey);
  }
  isNolanEnabled(): boolean { return this.nolan.isEnabled(); }

  async requestResearch(intent: BradResearchIntent): Promise<RelayOutcome> {
    const requestId = crypto.randomUUID();

    // 1) PHI Egress Guard — default block.
    const egress = scanForPhiEgress(intent.rawQuestion);
    if (!egress.allowed) {
      agentAuditLog.logRelay({
        requestId, bradActionId: intent.bradActionId,
        egressAllowed: false,
        fieldsRemoved: egress.removedCategories,
        egressFindings: egress.findings.map(f => `${f.category}:${f.severity}`),
        nolanResponseScan: 'not-run-blocked',
        correlationIds: [requestId, intent.bradActionId],
      });
      return { status: 'blocked-egress', requestId, egress, trust: 'untrusted-external', verified: false,
        warnings: ['Request blocked by PHI Egress Guard; Nolan was not called.'] };
    }

    // 2) Nolan disabled → honest outcome, no call.
    if (!this.nolan.isEnabled()) {
      agentAuditLog.logRelay({
        requestId, bradActionId: intent.bradActionId, egressAllowed: true,
        fieldsRemoved: egress.removedCategories, egressFindings: [],
        nolanResponseScan: 'nolan-disabled', correlationIds: [requestId, intent.bradActionId],
      });
      return { status: 'nolan-disabled', requestId, egress, trust: 'untrusted-external', verified: false,
        warnings: ['Nolan runtime is disabled.'] };
    }

    // 3) Purpose-built envelope (de-identified, NOT the raw transcript).
    const req: NolanResearchRequest = {
      requestId,
      purpose: intent.purpose,
      sanitizedQuestion: egress.normalizedQuery,
      jurisdiction: intent.jurisdiction,
      effectiveDateNeeded: intent.effectiveDateNeeded,
      preferredSourceTiers: intent.preferredSourceTiers ?? ['official', 'primary'],
      allowedDomains: intent.allowedDomains,
      excludedDomains: intent.excludedDomains,
      maximumResults: Math.min(intent.maximumResults ?? 5, 10),
      requestedByBradActionId: intent.bradActionId,
    };

    try {
      const research = await this.nolan.research(req, this.nolanKey);
      const verified = this.nolan.citationComplete(research);
      const warnings = [...research.warnings];
      if (!verified) warnings.push('No citations/timestamps — research is UNVERIFIED.');

      agentAuditLog.logRelay({
        requestId, bradActionId: intent.bradActionId, egressAllowed: true,
        fieldsRemoved: egress.removedCategories, egressFindings: [],
        nolanResponseScan: research.safetyScan.promptInjectionDetected ? 'injection-quarantined' : 'clean',
        correlationIds: [requestId, intent.bradActionId],
      });

      return { status: 'completed', requestId, research, egress, trust: 'untrusted-external', verified, warnings };
    } catch (err) {
      return { status: 'error', requestId, egress, trust: 'untrusted-external', verified: false,
        warnings: [`Nolan error: ${(err as Error).message}`] };
    }
  }
}
