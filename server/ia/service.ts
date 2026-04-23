import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { log } from '../logger.js';
import type {
  ChatMessage,
  ChatRequest,
  CorpusChunk,
  CorpusDoc,
  IndexManifest,
  IndexStatus,
  QueryRequest,
  ReferencePreview,
  StructuredResponse,
} from './types.js';
import { OllamaClient, type OllamaConfig } from './ollama.js';
import { IndexStore } from './index/store.js';
import { LexicalIndex } from './index/search.js';
import { ingestCorpus } from './ingest/index.js';
import { embedChunks } from './index/embeddings.js';
import { retrieve } from './retrieval.js';
import { generateStructuredResponse } from './responder.js';
import { operationalService } from './operational/service.js';
import { regulatoryMatcher } from './regulatory/matcher.js';
import { classifyScenario, isHighStakesScenario } from './scenarioClassifier.js';
import { sessionStore } from './session/store.js';
import { processTurn, recordAssistantTurn, toSessionSummary } from './session/manager.js';
import { buildContextEnvelope } from './session/envelope.js';
import { recordAuditEntry } from './session/audit.js';
import { buildChatSystemPrompt } from './prompt.js';
import type { SessionSummary } from './session/types.js';

/* ═══════════════════════════════════════════════════════════════
   Top-level service. Owns:
     - index load / rebuild lifecycle
     - the lexical BM25 companion (rebuilt on (re)load)
     - the shared Ollama client
     - a single `answer()` method the HTTP layer calls

   Designed so the HTTP routes never need to know about ingestion,
   embedding, or prompt assembly.
   ═══════════════════════════════════════════════════════════════ */

export interface IaServiceOptions {
  repoRoot: string;
  indexRoot: string;
  ollama: OllamaConfig;
  requireEmbeddings: boolean; // fail rebuild if embeddings unavailable
}

interface LoadedState {
  manifest: IndexManifest;
  docs: Map<string, CorpusDoc>;
  chunks: CorpusChunk[];
  lexical: LexicalIndex;
  embeddingsReady: boolean;
}

/** Phase-1 retrieval metadata — emitted over SSE before the LLM responds. */
export interface Phase1Event {
  intent: string;
  chunkCount: number;
  embeddingsReady: boolean;
  topDocId: string | null;
  topDocIds: string[];
}

/** Chat phase-1 event — session classified before LLM responds. */
export interface ChatPhase1Event {
  threadId: string;
  mode: string;
  urgency: string;
  lifeSafetyFlag: boolean;
  incidentType: string | null;
  intent: string;
  chunkCount: number;
  topDocId: string | null;
}

/** Full chat turn result. */
export interface ChatTurnResult {
  threadId: string;
  message: ChatMessage;
  sessionSummary: SessionSummary;
}

export class IaService {
  private state: LoadedState | null = null;
  private readonly store: IndexStore;
  private readonly ollama: OllamaClient;
  private rebuildLock = false;

  constructor(private readonly opts: IaServiceOptions) {
    this.store = new IndexStore(opts.indexRoot);
    this.ollama = new OllamaClient(opts.ollama);
  }

  /** Load an existing index from disk. Does NOT trigger a rebuild. */
  loadIfExists(): boolean {
    const snapshot = this.store.load();
    if (!snapshot) return false;

    const embeddingsReady = snapshot.chunks.some(c => Array.isArray(c.embedding) && c.embedding.length > 0);
    this.state = {
      manifest: snapshot.manifest,
      docs: snapshot.docs,
      chunks: snapshot.chunks,
      lexical: new LexicalIndex(snapshot.chunks),
      embeddingsReady,
    };
    log.info('ia.index.loaded', {
      builtAt: snapshot.manifest.builtAt,
      docs: snapshot.manifest.docCount,
      chunks: snapshot.manifest.chunkCount,
      embeddingsReady,
    });
    return true;
  }

  status(): IndexStatus {
    if (!this.state) {
      return {
        ready: false,
        builtAt: null,
        embedModel: null,
        embedDim: null,
        docCount: 0,
        chunkCount: 0,
        corpusRoot: this.opts.repoRoot,
        missing: this.missingCorpusHints(),
      };
    }
    const m = this.state.manifest;
    return {
      ready: true,
      builtAt: m.builtAt,
      embedModel: m.embedModel,
      embedDim: m.embedDim,
      docCount: m.docCount,
      chunkCount: m.chunkCount,
      corpusRoot: m.corpusRoot,
      missing: this.missingCorpusHints(),
    };
  }

  async pingOllama() {
    return this.ollama.ping();
  }

  /** Rebuild the full index. Safe to call concurrently — second caller waits. */
  async rebuild(
    onProgress?: (stage: string, done: number, total: number) => void,
  ): Promise<IndexStatus> {
    if (this.rebuildLock) {
      throw new Error('ia.index.rebuild_in_progress');
    }
    this.rebuildLock = true;
    try {
      log.info('ia.index.rebuild.start', { corpusRoot: this.opts.repoRoot });
      const { docs, chunks, sources, skipped } = await ingestCorpus(this.opts.repoRoot);
      log.info('ia.index.ingest.done', {
        docs: docs.length,
        chunks: chunks.length,
        skipped: skipped.length,
      });
      if (onProgress) onProgress('ingest', docs.length, docs.length);

      let embedDim = 0;
      let embedModel = this.opts.ollama.embedModel;
      let embeddingsReady = false;

      try {
        const pinged = await this.ollama.ping();
        if (!pinged.ok) throw new Error(`ollama unreachable: ${pinged.error}`);
        const r = await embedChunks(this.ollama, chunks, (done, total) => {
          if (onProgress) onProgress('embed', done, total);
        });
        embedDim = r.embedDim;
        embeddingsReady = true;
      } catch (err) {
        log.warn('ia.index.embed.failed_continue_lexical_only', {
          message: (err as Error).message,
          requireEmbeddings: this.opts.requireEmbeddings,
        });
        if (this.opts.requireEmbeddings) {
          throw err;
        }
        // Continue with a lexical-only index.
        embedModel = '(none — lexical-only)';
      }

      const manifest: IndexManifest = {
        builtAt: new Date().toISOString(),
        embedModel,
        embedDim,
        corpusRoot: this.opts.repoRoot,
        docCount: docs.length,
        chunkCount: chunks.length,
        sources,
      };
      const docMap = new Map<string, CorpusDoc>();
      for (const d of docs) docMap.set(d.id, d);

      this.store.save({ manifest, docs: docMap, chunks });

      this.state = {
        manifest,
        docs: docMap,
        chunks,
        lexical: new LexicalIndex(chunks),
        embeddingsReady,
      };

      log.info('ia.index.rebuild.done', {
        docs: docs.length,
        chunks: chunks.length,
        embedDim,
        skipped: skipped.length,
      });

      return this.status();
    } finally {
      this.rebuildLock = false;
    }
  }

  /** Answer a compliance command. Main entry point for /api/ia/query.
   *  Optional `onPhase1` callback fires immediately after retrieval so the
   *  SSE route can push the right-panel preview before the LLM responds. */
  async answer(
    req: QueryRequest,
    onPhase1?: (event: Phase1Event) => void,
  ): Promise<StructuredResponse> {
    if (!this.state) {
      throw Object.assign(new Error('ia.index.not_ready'), { code: 'not_ready' });
    }

    // ── Scenario Normalization (runs BEFORE retrieval) ───────────────
    // Classify the input against the compliance scenario taxonomy so
    // Brad always returns an actionable answer — even when the corpus
    // has no literal match (murder, sentinel event, breach, etc.).
    const scenario = classifyScenario(req.input);

    const { hits, query, directMatches } = await retrieve({
      input: req,
      chunks: this.state.chunks,
      lexical: this.state.lexical,
      docs: this.state.docs,
      ollama: this.ollama,
      embeddingsReady: this.state.embeddingsReady,
    });

    const directMatchDocIds = Array.from(new Set(directMatches.map(c => c.docId)));

    if (onPhase1) {
      const VALID_ID = /^[A-Z]{2}-[A-Z]{1,3}-\d{3,4}$/;
      const topDocIds = Array.from(new Set(hits.map(h => h.chunk.docId)))
        .filter(id => VALID_ID.test(id))
        .slice(0, 5);
      onPhase1({
        intent: query.intent,
        chunkCount: hits.length,
        embeddingsReady: this.state.embeddingsReady,
        topDocId: directMatchDocIds[0] ?? topDocIds[0] ?? null,
        topDocIds,
      });
    }

    // ── Operational context (Phase 1+) ──────────────────────────────
    const opCtx = operationalService.getContextForQuery(req.input, query.intent);
    const corpusPolicyIds = Array.from(new Set(hits.map(h => h.chunk.docId)));
    const regUpdates = regulatoryMatcher.getRelevantUpdates(
      req.input,
      query.intent,
      corpusPolicyIds,
    );
    const regulatoryContext = regulatoryMatcher.buildPromptSummary(regUpdates);

    return generateStructuredResponse({
      input: req.input,
      intent: query.intent,
      hits,
      directMatchDocIds,
      docs: this.state.docs,
      ollama: this.ollama,
      activeDocId: req.activeDocId,
      operationalContext: opCtx.summaryForPrompt || undefined,
      regulatoryContext: regulatoryContext || undefined,
      // Pass structured data so responder can attach them to the response
      operationalGaps: opCtx.gaps,
      lifecycleAlerts: opCtx.lifecycleAlerts,
      regulatoryAlerts: regUpdates,
      // Scenario playbook — suppresses "No Answer Found" for high-stakes inputs.
      scenario,
      forceScenarioAnswer: isHighStakesScenario(scenario),
    });
  }

  /** Chat-mode entry point. Maintains session state per thread.
   *  Optional `onPhase1` fires after classification (before LLM) for
   *  immediate SSE feedback to the UI (emergency banner, case panel update). */
  async answerInThread(
    req: ChatRequest,
    onPhase1?: (event: ChatPhase1Event) => void,
  ): Promise<ChatTurnResult> {
    if (!this.state) {
      throw Object.assign(new Error('ia.index.not_ready'), { code: 'not_ready' });
    }

    // Assign or create thread ID
    const threadId = req.threadId ?? randomUUID();

    // Session classification + state update
    const turnCtx = processTurn(threadId, req.input);

    // Use session-enhanced retrieval query
    const enhancedRequest: QueryRequest = {
      input: turnCtx.retrievalQuery,
      intent: undefined,  // let retrieval classify from the enhanced query
    };

    const { hits, query, directMatches } = await retrieve({
      input: enhancedRequest,
      chunks: this.state.chunks,
      lexical: this.state.lexical,
      docs: this.state.docs,
      ollama: this.ollama,
      embeddingsReady: this.state.embeddingsReady,
    });

    const directMatchDocIds = Array.from(new Set(directMatches.map(c => c.docId)));
    const VALID_ID = /^[A-Z]{2}-[A-Z]{1,3}-\d{3,4}$/;
    const topDocIds = Array.from(new Set(hits.map(h => h.chunk.docId)))
      .filter(id => VALID_ID.test(id))
      .slice(0, 5);

    // Fire phase1 event immediately
    if (onPhase1) {
      onPhase1({
        threadId,
        mode: turnCtx.sessionState.mode,
        urgency: turnCtx.sessionState.urgency,
        lifeSafetyFlag: turnCtx.sessionState.lifeSafetyFlag,
        incidentType: turnCtx.sessionState.detectedIncidentType,
        intent: query.intent,
        chunkCount: hits.length,
        topDocId: directMatchDocIds[0] ?? topDocIds[0] ?? null,
      });
    }

    // Build chat-mode system prompt
    const chatSystemPrompt = buildChatSystemPrompt({
      intent: query.intent,
      mode: turnCtx.sessionState.mode,
      urgency: turnCtx.sessionState.urgency,
      lifeSafetyFlag: turnCtx.sessionState.lifeSafetyFlag,
    });

    // Operational + regulatory context
    const opCtx = operationalService.getContextForQuery(req.input, query.intent);
    const corpusPolicyIds = Array.from(new Set(hits.map(h => h.chunk.docId)));
    const regUpdates = regulatoryMatcher.getRelevantUpdates(req.input, query.intent, corpusPolicyIds);

    // ── Context Envelope (unifies ALL context into ONE clean block) ──
    // Replaces separate operationalContext / regulatoryContext / sessionContext injections.
    // The LLM now sees a single prioritized envelope — no more reconciling 3+ blobs.
    const envelope = buildContextEnvelope({
      sessionState: turnCtx.sessionState,
      operationalGaps: opCtx.gaps,
      lifecycleAlerts: opCtx.lifecycleAlerts,
      regulatoryAlerts: regUpdates,
    });

    // Generate response with single envelope
    let response = await generateStructuredResponse({
      input: req.input,    // use original user input (not the expanded retrieval query)
      intent: query.intent,
      hits,
      directMatchDocIds,
      docs: this.state.docs,
      ollama: this.ollama,
      sessionContext: envelope.compiled,   // single unified block
      chatSystemPrompt,
      operationalGaps: opCtx.gaps,
      lifecycleAlerts: opCtx.lifecycleAlerts,
      regulatoryAlerts: regUpdates,
    });

    // ── Emergency Hard Enforcement ───────────────────────────────────
    // DO NOT trust the model to lead with emergency action.
    // Deterministically enforce it here.
    if (envelope.lifeSafetyActive) {
      const EMERGENCY_LEAD = 'EMERGENCY — Call 911 immediately. ';
      if (!response.directAnswer.startsWith('EMERGENCY')) {
        response = {
          ...response,
          directAnswer: EMERGENCY_LEAD + response.directAnswer,
          riskLevel: 'critical',
          enforcementLevel: 'condition_level',
          confidence: 'high',
        };
      }
    }

    // ── Confidence downgrade when operating on seed/partial data ────
    // If all operational/regulatory data is seed-only, cap confidence at medium.
    // This prevents false certainty — the UI will show a data quality note.
    if (envelope.dataQuality.allSeedData && !envelope.lifeSafetyActive) {
      if (response.confidence === 'high') {
        response = { ...response, confidence: 'medium' };
      }
    }
    // Attach data quality note to meta for UI display
    if (response.meta) {
      (response.meta as Record<string, unknown>)['dataQualityNote'] = envelope.dataQuality.note;
      (response.meta as Record<string, unknown>)['allSeedData'] = envelope.dataQuality.allSeedData;
    }

    // Update session with response data
    recordAssistantTurn(threadId, response);

    const updatedState = sessionStore.load(threadId);
    const sessionSummary = toSessionSummary(updatedState ?? turnCtx.sessionState);

    // ── Audit log ─────────────────────────────────────────────────
    const emergencyEnforced = envelope.lifeSafetyActive &&
      response.directAnswer.startsWith('EMERGENCY');
    recordAuditEntry({
      threadId,
      mode: turnCtx.sessionState.mode,
      urgency: turnCtx.sessionState.urgency,
      incidentType: turnCtx.sessionState.detectedIncidentType,
      userInput: req.input,
      response,
      operationalGaps: opCtx.gaps,
      regulatoryAlerts: regUpdates,
      lifeSafetyFlag: envelope.lifeSafetyActive,
      emergencyEnforced,
      caseStatus: sessionSummary.caseStatus,
    });

    const message: ChatMessage = {
      id: randomUUID(),
      role: 'brad',
      content: response.directAnswer,
      timestamp: new Date().toISOString(),
      structuredResponse: response,
    };

    log.info('ia.chat.turn', {
      threadId,
      mode: sessionSummary.mode,
      urgency: sessionSummary.urgency,
      intent: query.intent,
      lifeSafetyFlag: sessionSummary.lifeSafetyFlag,
    });

    return { threadId, message, sessionSummary };
  }

  /** Get session summary for a thread. */
  getSession(threadId: string): SessionSummary | null {
    const state = sessionStore.load(threadId);
    return state ? toSessionSummary(state) : null;
  }

  /** List recent sessions. */
  listSessions() {
    return sessionStore.list();
  }

  /** Close/reset a session. */
  closeSession(threadId: string): void {
    sessionStore.delete(threadId);
  }

  /** Resolve a case with a specific status (resolved, requires_followup, closed). */
  resolveSession(threadId: string, status: 'resolved' | 'requires_followup' | 'closed'): void {
    const state = sessionStore.load(threadId);
    if (!state) return;
    state.caseStatus = status;
    state.updatedAt = new Date().toISOString();
    sessionStore.save(state);
  }

  /** Fetch a document preview for the right-panel. */
  getReference(id: string): ReferencePreview | null {
    if (!this.state) return null;
    const doc = this.state.docs.get(id.toUpperCase());
    if (!doc) return null;

    const sections = doc.sections.map(s => ({
      id: s.id,
      title: s.title,
      level: s.level,
      body: doc.content.slice(s.start, s.end).trim(),
    }));

    return {
      id: doc.id,
      type: doc.type,
      title: doc.title,
      domain: doc.domain,
      subdomain: doc.subdomain,
      accessTier: doc.accessTier,
      regulatoryTags: doc.regulatoryTags,
      sections,
      linkedIds: doc.linkedIds,
      sourcePath: path.relative(this.opts.repoRoot, doc.sourcePath).replace(/\\/g, '/'),
      version: doc.version,
      effectiveDate: doc.effectiveDate,
      nextReviewDate: doc.nextReviewDate,
      description: doc.description,
    };
  }

  /** Lightweight metadata for the reference grid (used by the UI index list). */
  listReferences(opts: { domain?: string; type?: 'policy' | 'form' | 'appendix'; limit?: number }) {
    if (!this.state) return [];
    const limit = opts.limit ?? 200;
    const out: Array<{
      id: string;
      title: string;
      type: CorpusDoc['type'];
      domain: string;
      subdomain: string;
      accessTier: string;
      regulatoryTags: string[];
    }> = [];
    for (const d of this.state.docs.values()) {
      if (opts.domain && d.domain !== opts.domain) continue;
      if (opts.type && d.type !== opts.type) continue;
      out.push({
        id: d.id,
        title: d.title,
        type: d.type,
        domain: d.domain,
        subdomain: d.subdomain,
        accessTier: d.accessTier,
        regulatoryTags: d.regulatoryTags,
      });
      if (out.length >= limit) break;
    }
    return out.sort((a, b) => a.id.localeCompare(b.id));
  }

  private missingCorpusHints(): string[] {
    const hints: string[] = [];
    const builder = path.join(this.opts.repoRoot, 'Builder');
    if (!fs.existsSync(builder)) hints.push('Builder/ (corpus root)');
    if (!fs.existsSync(path.join(builder, 'Policies'))) hints.push('Builder/Policies');
    if (!fs.existsSync(path.join(builder, 'Forns'))) hints.push('Builder/Forns');
    return hints;
  }
}
