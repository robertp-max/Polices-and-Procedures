import crypto from 'node:crypto';
import type {
  HarnessConfig, BradModelAdapter, BradRuntimeMode, RuntimeBadge,
  BradPhiReadinessResult, RelayOutcome,
} from './types.js';
import { readHarnessConfig, BRAD_SYSTEM_PROMPT } from './config.js';
import { MockBradAdapter } from './modelAdapters/MockBradAdapter.js';
import { ClaudeCliBradAdapter } from './modelAdapters/ClaudeCliBradAdapter.js';
import { VertexBradAdapter } from './modelAdapters/VertexBradAdapter.js';
import { evaluateBradPhiReadiness } from './BradPhiReadinessGate.js';
import { scanForPhiEgress } from './PhiEgressGuard.js';
import { BradNolanRelay, type BradResearchIntent } from './BradNolanRelay.js';
import { agentAuditLog } from './AgentAuditLogger.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Brad Runtime — internal operations agent.
   ----------------------------------------------------------------------------
   • NO internet/web/search/browser tools (adapter is canReachInternet:false; the
     only outward path is the audited relay, which de-identifies + treats output
     as untrusted).
   • vertex-phi mode activates ONLY when the readiness gate passes — otherwise it
     fails closed to non-PHI/mock and PHI prompts are blocked from model calls.
   • The model can never override the gate.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface BradAnswer {
  text: string;
  synthetic: boolean;
  blocked: boolean;
  reason?: string;
}

export interface BradRuntimeDescription {
  configuredMode: BradRuntimeMode;
  effectiveMode: BradRuntimeMode;
  badge: RuntimeBadge;
  phiPermitted: boolean;
  modelId: string;
  readiness: BradPhiReadinessResult;
  nolanEnabled: boolean;
}

export class BradRuntime {
  readonly cfg: HarnessConfig;
  private readonly adapter: BradModelAdapter;
  private readonly relay: BradNolanRelay;

  constructor(cfg?: HarnessConfig) {
    this.cfg = cfg ?? readHarnessConfig();
    const mode = this.cfg.brad.runtimeMode;
    this.adapter = mode === 'mock'
      ? new MockBradAdapter(this.cfg.brad.modelId)
      : mode === 'cli-nonphi'
        ? new ClaudeCliBradAdapter(this.cfg.brad)
        : new VertexBradAdapter(this.cfg.brad);
    this.relay = new BradNolanRelay(this.cfg); // relay owns Nolan (capability-gated bridge)
  }

  readiness(): BradPhiReadinessResult {
    return evaluateBradPhiReadiness(this.cfg);
  }

  /** PHI is permitted ONLY in verified vertex-phi mode (sync; no model/network call).
      cli-nonphi/mock/vertex-nonphi are always PHI-disabled. */
  isPhiPermitted(): boolean {
    return this.cfg.brad.runtimeMode === 'vertex-phi' && this.readiness().ready;
  }

  async describe(): Promise<BradRuntimeDescription> {
    const configuredMode = this.cfg.brad.runtimeMode;
    const readiness = this.readiness();
    const avail = await this.adapter.validateAvailability();

    let effectiveMode: BradRuntimeMode;
    let badge: RuntimeBadge;
    let phiPermitted = false;

    if (configuredMode === 'mock') {
      effectiveMode = 'mock';
      badge = 'MVP Harness — Mock Data';
    } else if (!avail.available) {
      // Configured for a live provider but adapter/model/CLI unavailable → fail closed.
      effectiveMode = 'mock';
      badge = 'Configuration Error — Fail Closed';
    } else if (configuredMode === 'cli-nonphi') {
      effectiveMode = 'cli-nonphi';
      badge = 'Claude CLI — PHI Disabled';
    } else if (configuredMode === 'vertex-phi' && readiness.ready) {
      effectiveMode = 'vertex-phi';
      badge = 'Vertex Connected — PHI Enabled';
      phiPermitted = true;
    } else {
      // vertex available but PHI gate not passed (or configured non-phi).
      effectiveMode = 'vertex-nonphi';
      badge = 'Vertex Connected — PHI Disabled';
    }

    return {
      configuredMode, effectiveMode, badge, phiPermitted,
      modelId: this.cfg.brad.modelId, readiness, nolanEnabled: this.relay.isNolanEnabled(),
    };
  }

  /** Answer from approved internal sources. PHI prompts are blocked unless PHI mode is verified-ready. */
  async answer(userText: string, actorId = 'system', role = 'user'): Promise<BradAnswer> {
    const phiPermitted = this.isPhiPermitted();
    const phiPresent = !scanForPhiEgress(userText).allowed;

    if (phiPresent && !phiPermitted) {
      agentAuditLog.logBrad({
        requestId: crypto.randomUUID(), actorId, role, action: 'phi-prompt-blocked',
        modelId: this.cfg.brad.modelId, promptVersion: this.cfg.brad.promptVersion,
        phiMode: false, result: 'blocked: PHI present, PHI mode not verified-ready',
      });
      return { text: 'This request contains PHI and cannot be processed in the current mode (PHI mode is not verified-ready). It was not sent to any model.', synthetic: true, blocked: true, reason: 'phi-not-permitted' };
    }

    const res = await this.adapter.chat({ system: BRAD_SYSTEM_PROMPT, user: userText, requestId: crypto.randomUUID() });
    agentAuditLog.logBrad({
      requestId: crypto.randomUUID(), actorId, role, action: 'answer',
      modelId: res.modelId, promptVersion: this.cfg.brad.promptVersion,
      phiMode: phiPermitted, result: 'ok', toolCalls: [],
    });
    return { text: res.content, synthetic: res.synthetic, blocked: false };
  }

  /** Public research via the ONLY bridge. Result is untrusted external data. */
  async research(intent: BradResearchIntent): Promise<RelayOutcome> {
    return this.relay.requestResearch(intent);
  }

  /** Brad has no internet — expose this for assertions/tests. */
  get canReachInternet(): false { return this.adapter.canReachInternet; }
}

let singleton: BradRuntime | null = null;
export function getBradRuntime(): BradRuntime {
  if (!singleton) singleton = new BradRuntime();
  return singleton;
}
