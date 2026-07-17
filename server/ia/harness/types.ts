/* ═══════════════════════════════════════════════════════════════════════════
   Brad + Nolan dual-agent harness — shared contract (single source of truth)
   ----------------------------------------------------------------------------
   Brad  = internal home-health operations agent (NO internet; PHI only behind
           the production readiness gate).
   Nolan = public regulatory/clinical research agent (internet-enabled; NEVER
           receives or processes PHI; NO internal-system access).
   The only bridge between them is the audited `BradNolanRelay`.
   These types are imported by every harness module so boundaries stay aligned.
   ═══════════════════════════════════════════════════════════════════════════ */

export type BradRuntimeMode = 'mock' | 'cli-nonphi' | 'oss-nonphi' | 'vertex-nonphi' | 'vertex-phi';
export type NolanRuntimeMode = 'disabled' | 'mock' | 'vertex-public-web';
export type BradProvider = 'mock' | 'claude' | 'codex' | 'vertex' | 'ollama';

export type RuntimeBadge =
  | 'MVP Harness — Mock Data'
  | 'Claude CLI — PHI Disabled'
  | 'Codex CLI — PHI Disabled'
  | 'Open-Source (Ollama) — PHI Disabled'
  | 'Vertex Connected — PHI Disabled'
  | 'Vertex Connected — PHI Enabled'
  | 'Configuration Error — Fail Closed';

/* ─── Configuration (server-side only; never shipped to the browser) ─────── */

export interface BradConfig {
  runtimeMode: BradRuntimeMode;
  provider: BradProvider;     // BRAD_PROVIDER — 'claude'/'codex' (CLI) | 'ollama' (OSS, local) | 'vertex' | 'mock'
  modelId: string;            // BRAD_MODEL_ID, e.g. 'sonnet' (claude), a gguf tag (ollama), 'gemini-3.5-flash' (vertex)
  vertexProjectId: string;
  vertexLocation: string;
  phiEnabled: boolean;        // BRAD_PHI_ENABLED — advisory only; gate decides
  serviceAccount?: string;    // Brad's dedicated SA email (separate from Nolan)
  /* Open-source local inference engine (Ollama). Used only when provider==='ollama'.
     Local HTTP only — never the internet (canReachInternet stays false). */
  ollamaBaseUrl: string;      // OLLAMA_BASE_URL, e.g. http://127.0.0.1:11434
  ollamaChatModel: string;    // OLLAMA_CHAT_MODEL, e.g. llama3.1:8b-instruct-q4_K_M
  ollamaTimeoutMs: number;    // OLLAMA_TIMEOUT_MS
  promptVersion: string;
  promptHash: string;
}

export interface NolanConfig {
  runtimeMode: NolanRuntimeMode;
  modelId: string;            // NOLAN_MODEL_ID
  vertexProjectId: string;    // MUST differ from Brad's
  vertexLocation: string;
  webGroundingEnabled: boolean;
  serviceAccount?: string;    // Nolan's dedicated SA email (separate from Brad)
  promptVersion: string;
  promptHash: string;
}

export interface HarnessConfig {
  brad: BradConfig;
  nolan: NolanConfig;
}

/* ─── PHI egress scanning ────────────────────────────────────────────────── */

export type PhiCategory =
  | 'person-name' | 'dob' | 'identifying-date' | 'address' | 'phone' | 'email'
  | 'mrn' | 'account-number' | 'ssn' | 'license-cert' | 'device-id'
  | 'identifying-url' | 'ip-address' | 'salesforce-id' | 'internal-user-id'
  | 'drive-id' | 'event-packet' | 'raw-patient-json' | 'clinical-note'
  | 'encoded-content' | 'obfuscation' | 'image-biometric';

export interface EgressFinding {
  category: PhiCategory;
  evidence: string;   // short, redacted snippet — never the full value
  severity: 'critical' | 'high' | 'medium';
}

export interface EgressScanResult {
  /** true → safe to send to Nolan; false → block. Default outcome is block. */
  allowed: boolean;
  findings: EgressFinding[];
  /** Categories removed/normalized during sanitation (obfuscation stripped). */
  removedCategories: PhiCategory[];
  /** Normalized text (obfuscation stripped) used for the decision; not a pseudonym map. */
  normalizedQuery: string;
}

/* ─── Nolan relay request / response (Brad → Relay → Nolan → Relay → Brad) ── */

export type ResearchPurpose =
  | 'regulatory-research' | 'public-clinical-guidance' | 'vendor-documentation'
  | 'public-app-documentation' | 'general-public-research';

export type SourceTier = 'official' | 'primary' | 'peer-reviewed' | 'vendor' | 'other';

export interface NolanResearchRequest {
  requestId: string;
  purpose: ResearchPurpose;
  sanitizedQuestion: string;
  jurisdiction?: string;
  effectiveDateNeeded?: string;
  preferredSourceTiers: Array<'official' | 'primary' | 'peer-reviewed' | 'vendor'>;
  allowedDomains?: string[];
  excludedDomains?: string[];
  maximumResults: number;
  requestedByBradActionId: string;
}

export interface NolanSource {
  title: string;
  publisher: string;
  url: string;
  publishedAt?: string;
  retrievedAt: string;
  sourceTier: SourceTier;
  contentHash?: string;
}

export interface NolanResearchResponse {
  requestId: string;
  answer: string;
  retrievedAt: string;
  sources: NolanSource[];
  webSearchQueries?: string[];
  warnings: string[];
  safetyScan: {
    promptInjectionDetected: boolean;
    unsafeSourceCount: number;
  };
}

/** What Brad sees after the relay. Nolan output is ALWAYS untrusted external data. */
export interface RelayOutcome {
  status: 'completed' | 'blocked-egress' | 'nolan-disabled' | 'error';
  requestId: string;
  /** Present only when status === 'completed'. */
  research?: NolanResearchResponse;
  /** Why a request was blocked (egress findings) — for audit + honest UI. */
  egress: EgressScanResult;
  /** Brad must NOT auto-act on this; informational-only flag. */
  trust: 'untrusted-external';
  /** True only when citations + retrieval timestamps are present. */
  verified: boolean;
  warnings: string[];
}

/* ─── PHI production-readiness gate ──────────────────────────────────────── */

export interface BradPhiReadinessResult {
  ready: boolean;
  checkedAt: string;
  projectId?: string;
  modelId?: string;
  failures: Array<{
    controlId: string;
    message: string;
    severity: 'critical' | 'high' | 'medium';
  }>;
}

/* ─── Web content safety (Nolan-side, on retrieved pages) ────────────────── */

export interface WebSafetyResult {
  promptInjectionDetected: boolean;
  quarantinedInstructions: string[];
  strippedHtml: boolean;
  unsafeSourceCount: number;
  cleanedText: string;
}

/* ─── Model adapters ─────────────────────────────────────────────────────── */

export interface ModelChatArgs {
  system: string;
  user: string;
  requestId: string;
}
export interface ModelChatResult {
  content: string;
  modelId: string;
  runtimeMode: BradRuntimeMode | NolanRuntimeMode;
  /** Mock adapters set this so the UI never presents mock output as live Gemini. */
  synthetic: boolean;
  /** Structured internal references the UI renders as clickable document links. */
  references?: BradReference[];
  /** Broad critical-incident track the message routed to (diagnostics + UI hint). */
  track?: string;
}

/* ─── Internal reference (clickable document link metadata) ──────────────────
   Brad attaches these so the chat UI can render references as interactive links
   that resolve to a real policy/workflow/form/help/event document. The UI
   resolver decides if each is openable; unresolved ones render as plain text. */
export type BradReferenceType = 'policy' | 'workflow' | 'form' | 'help' | 'event';

export interface BradReference {
  /** Resolver hint — the document family this reference belongs to. */
  type: BradReferenceType;
  /** Representative document ID (resolver tries exact-ID then title match). */
  id: string;
  /** Human title shown in the link. */
  title: string;
  /** Optional section/anchor within the document. */
  section?: string;
  /** Human reference-family label (e.g. "Incident Reporting"). */
  family?: string;
}

export interface BradModelAdapter {
  readonly id: string;
  readonly canReachInternet: false;   // type-level guarantee Brad never browses
  chat(args: ModelChatArgs): Promise<ModelChatResult>;
  /** Throws on misconfiguration (fail-closed) — never silently downgrades. */
  validateAvailability(): Promise<{ available: boolean; reason?: string }>;
}

export interface NolanModelAdapter {
  readonly id: string;
  readonly canReachInternet: boolean;
  research(req: NolanResearchRequest): Promise<NolanResearchResponse>;
  validateAvailability(): Promise<{ available: boolean; reason?: string }>;
}
