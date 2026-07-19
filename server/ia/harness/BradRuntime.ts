import crypto from 'node:crypto';
import type {
  HarnessConfig, BradModelAdapter, BradRuntimeMode, RuntimeBadge,
  BradPhiReadinessResult, RelayOutcome, BradReference,
  BradRuntimeStatus, BradDiagnosticCode,
} from './types.js';
import { readHarnessConfig, BRAD_SYSTEM_PROMPT } from './config.js';
import { MockBradAdapter } from './modelAdapters/MockBradAdapter.js';
import { ClaudeCliBradAdapter } from './modelAdapters/ClaudeCliBradAdapter.js';
import { CodexCliBradAdapter } from './modelAdapters/CodexCliBradAdapter.js';
import { VertexBradAdapter } from './modelAdapters/VertexBradAdapter.js';
import { OllamaBradAdapter } from './modelAdapters/OllamaBradAdapter.js';
import { evaluateBradPhiReadiness } from './BradPhiReadinessGate.js';
import { scanForPhiEgress } from './PhiEgressGuard.js';
import { BradNolanRelay, type BradResearchIntent } from './BradNolanRelay.js';
import { agentAuditLog } from './AgentAuditLogger.js';
import { routeCriticalIncident } from '../brad/criticalIncidentRouter.js';
import { composeInternalBradAnswer } from '../brad/bradInternalResponder.js';

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
  /** Structured internal references the UI renders as clickable document links. */
  references?: BradReference[];
  /** Broad critical-incident track the message routed to. */
  track?: string;
}

export interface BradRuntimeDescription {
  configuredMode: BradRuntimeMode;
  /** The SELECTED provider's mode — e.g. an explicitly-chosen Ollama stays
      'oss-nonphi' even when unavailable. It is NEVER relabeled 'mock' on
      failure (see runtimeStatus/failClosed for health). */
  effectiveMode: BradRuntimeMode;
  /** Health of the selected provider — the machine-readable failure signal. */
  runtimeStatus: BradRuntimeStatus;
  badge: RuntimeBadge;
  phiPermitted: boolean;
  /** Configured inference provider (mock | claude | codex | ollama | vertex). */
  provider: string;
  modelId: string;
  /** Type-level guarantee surfaced for diagnostics — Brad never browses. */
  canReachInternet: boolean;
  /** True when a selected live engine could not initialize (requests throw). */
  failClosed: boolean;
  /** Typed, safe code for the failure state ('OK' when ready). */
  diagnosticCode: BradDiagnosticCode;
  /** Sanitized one-line reason when not ready (no secrets/paths/stack traces). */
  diagnosticReason?: string;
  readiness: BradPhiReadinessResult;
  nolanEnabled: boolean;
}

/** Redact anything sensitive from an adapter's failure reason before it enters
    diagnostics: strip newlines/stack frames, filesystem paths, and obvious
    secret tokens; cap length. Loopback URLs and model names are safe to keep. */
export function sanitizeDiagnosticReason(reason: string | undefined): string | undefined {
  if (!reason) return undefined;
  let r = reason.replace(/\s+/g, ' ').trim();
  r = r.replace(/\bat [^\s]+:\d+:\d+/g, ''); // stack frames "at file:line:col"
  r = r.replace(/[A-Za-z]:\\[^\s"']{4,}/g, '<path>'); // Windows abs paths (keeps loopback URLs intact)
  r = r.replace(/\b(bearer|token|key|secret|password|authorization)\b\s*[:=]?\s*\S+/gi, '$1 <redacted>');
  r = r.replace(/\b(AKIA|ASIA)[A-Z0-9]{8,}\b/g, '<redacted>'); // AWS key ids
  return r.slice(0, 200).trim();
}

/** PURE diagnostic derivation — no I/O — so both the healthy and unavailable
    contracts are unit-assertable without a live engine (verify:brad-protection).
    Given the configured mode/provider, the adapter's availability result, and
    PHI readiness, returns the typed diagnostic view. */
export function computeRuntimeDiagnostics(input: {
  configuredMode: BradRuntimeMode;
  provider: string;
  available: boolean;
  reason?: string;
  readinessReady: boolean;
}): {
  effectiveMode: BradRuntimeMode;
  runtimeStatus: BradRuntimeStatus;
  badge: RuntimeBadge;
  phiPermitted: boolean;
  failClosed: boolean;
  diagnosticCode: BradDiagnosticCode;
  diagnosticReason?: string;
} {
  const { configuredMode, provider, available, reason, readinessReady } = input;

  if (configuredMode === 'mock') {
    return { effectiveMode: 'mock', runtimeStatus: 'ready', badge: 'MVP Harness — Mock Data',
      phiPermitted: false, failClosed: false, diagnosticCode: 'OK' };
  }

  // The selected provider's own mode — retained regardless of health.
  const selectedMode: BradRuntimeMode =
    configuredMode === 'oss-nonphi' ? 'oss-nonphi'
      : configuredMode === 'cli-nonphi' ? 'cli-nonphi'
        : configuredMode === 'vertex-phi' && readinessReady ? 'vertex-phi'
          : 'vertex-nonphi';

  if (!available) {
    // Explicitly selected live engine that cannot initialize → fail closed.
    // NEVER downgrade the label to 'mock': no mock response is served; normal
    // requests throw. Classify the typed status/code from the (sanitized) reason.
    const rl = (reason ?? '').toLowerCase();
    let runtimeStatus: BradRuntimeStatus = 'configuration-error';
    let diagnosticCode: BradDiagnosticCode = 'ENGINE_UNAVAILABLE';
    if (/unreachable|no response|timed out|timeout|abort|econn|refus|network/.test(rl)) {
      runtimeStatus = 'unavailable'; diagnosticCode = 'ENGINE_UNREACHABLE';
    } else if (/not pulled|not installed|\bpull\b/.test(rl)) {
      runtimeStatus = 'configuration-error'; diagnosticCode = 'MODEL_NOT_PULLED';
    } else if (/expected '|provider|mismatch/.test(rl)) {
      runtimeStatus = 'configuration-error'; diagnosticCode = 'PROVIDER_MISMATCH';
    }
    return {
      effectiveMode: selectedMode, runtimeStatus,
      badge: 'Configuration Error — Fail Closed',
      phiPermitted: false, failClosed: true, diagnosticCode,
      diagnosticReason: sanitizeDiagnosticReason(reason),
    };
  }

  // Selected live engine is available → ready.
  if (selectedMode === 'cli-nonphi') {
    return { effectiveMode: 'cli-nonphi', runtimeStatus: 'ready',
      badge: provider === 'codex' ? 'Codex CLI — PHI Disabled' : 'Claude CLI — PHI Disabled',
      phiPermitted: false, failClosed: false, diagnosticCode: 'OK' };
  }
  if (selectedMode === 'oss-nonphi') {
    return { effectiveMode: 'oss-nonphi', runtimeStatus: 'ready',
      badge: 'Open-Source (Ollama) — PHI Disabled',
      phiPermitted: false, failClosed: false, diagnosticCode: 'OK' };
  }
  if (selectedMode === 'vertex-phi') {
    return { effectiveMode: 'vertex-phi', runtimeStatus: 'ready',
      badge: 'Vertex Connected — PHI Enabled',
      phiPermitted: true, failClosed: false, diagnosticCode: 'OK' };
  }
  return { effectiveMode: 'vertex-nonphi', runtimeStatus: 'ready',
    badge: 'Vertex Connected — PHI Disabled',
    phiPermitted: false, failClosed: false, diagnosticCode: 'OK' };
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
      : mode === 'oss-nonphi'
        ? new OllamaBradAdapter(this.cfg.brad)
        : mode === 'cli-nonphi'
          ? this.cfg.brad.provider === 'codex'
            ? new CodexCliBradAdapter(this.cfg.brad)
            : new ClaudeCliBradAdapter(this.cfg.brad)
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

    const d = computeRuntimeDiagnostics({
      configuredMode,
      provider: this.cfg.brad.provider,
      available: avail.available,
      reason: avail.reason,
      readinessReady: readiness.ready,
    });

    return {
      configuredMode,
      effectiveMode: d.effectiveMode,
      runtimeStatus: d.runtimeStatus,
      badge: d.badge,
      phiPermitted: d.phiPermitted,
      provider: this.cfg.brad.provider,
      modelId: this.cfg.brad.modelId,
      canReachInternet: this.adapter.canReachInternet,
      failClosed: d.failClosed,
      diagnosticCode: d.diagnosticCode,
      diagnosticReason: d.diagnosticReason,
      readiness,
      nolanEnabled: this.relay.isNolanEnabled(),
    };
  }

  /** MVP override: when the environment is declared synthetic-data-only
      (BRAD_SYNTHETIC_DATA_ONLY=true), there is no real PHI to protect, so the
      PHI prompt-block is disabled. This is intended for the local laptop MVP
      (Claude CLI) where ALL data is fake; production PHI still flows only through
      the verified vertex-phi gate. Default (unset) keeps the gate ON. */
  private get syntheticDataOnly(): boolean {
    return process.env.BRAD_SYNTHETIC_DATA_ONLY === 'true';
  }

  /** Answer from approved internal sources (policies/procedures/workflows/forms/
      regulatory events/help articles) ONLY. This path is fully internal and
      NEVER reaches the internet — public research is a separate, non-PHI
      capability exposed via `research()` (the audited Brad→Nolan relay), which
      internal policy answers do not invoke. PHI prompts are blocked unless PHI
      mode is verified-ready OR the environment is declared synthetic-data-only. */
  async answer(userText: string, actorId = 'system', role = 'user'): Promise<BradAnswer> {
    const phiPermitted = this.isPhiPermitted();
    const phiPresent = !scanForPhiEgress(userText).allowed;

    if (phiPresent && !phiPermitted && !this.syntheticDataOnly) {
      agentAuditLog.logBrad({
        requestId: crypto.randomUUID(), actorId, role, action: 'phi-prompt-blocked',
        modelId: this.cfg.brad.modelId, promptVersion: this.cfg.brad.promptVersion,
        phiMode: false, result: 'blocked: PHI present, PHI mode not verified-ready',
      });
      return { text: 'This request contains PHI and cannot be processed in the current mode (PHI mode is not verified-ready). It was not sent to any model.', synthetic: true, blocked: true, reason: 'phi-not-permitted' };
    }

    // ── SAFETY ROUTING PRECEDES MODEL INFERENCE (agency-wide, provider-agnostic).
    // A critical incident (violence, clinical emergency, worker safety, abuse…)
    // bypasses the model ENTIRELY and returns deterministic, safety-first
    // guidance. The OSS/LLM (or any provider) is never consulted for an
    // emergency, so an unavailable or slow model can never delay a 911 answer.
    const route = routeCriticalIncident(userText);
    if (route.urgent) {
      const safe = composeInternalBradAnswer(userText);
      agentAuditLog.logBrad({
        requestId: crypto.randomUUID(), actorId, role, action: 'safety-bypass',
        modelId: this.cfg.brad.modelId, promptVersion: this.cfg.brad.promptVersion,
        phiMode: phiPermitted, result: `urgent:${route.track} — model inference bypassed`,
      });
      return { text: safe.text, synthetic: false, blocked: false, references: safe.references, track: safe.track ?? route.track };
    }

    const res = await this.adapter.chat({ system: BRAD_SYSTEM_PROMPT, user: userText, requestId: crypto.randomUUID() });
    agentAuditLog.logBrad({
      requestId: crypto.randomUUID(), actorId, role, action: 'answer',
      modelId: res.modelId, promptVersion: this.cfg.brad.promptVersion,
      phiMode: phiPermitted, result: 'ok', toolCalls: [],
    });
    return { text: res.content, synthetic: res.synthetic, blocked: false, references: res.references, track: res.track };
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
