import type {
  CorpusDoc,
  IntentKind,
  StudioOutputType,
} from './types.js';
import type { ScoredChunk } from './index/search.js';

/* ═══════════════════════════════════════════════════════════════
   Prompt assembly.

   The compliance intelligence engine is NOT a chatbot. Every prompt:
     - states the authority boundary (corpus is the only source)
     - enumerates numbered passages the model may cite by passage id
     - commands the model to return ONLY the JSON schema we specify
     - forbids hallucinated sources

   Mode-specific instructions steer tone and the `studioOutputType`
   slot without changing the fundamental response shape.
   ═══════════════════════════════════════════════════════════════ */

export const JSON_SCHEMA_BLOCK = `{
  "governingPolicyId": "string|null — the single primary policy ID (XX-XX-NNN) that establishes authority for this answer. null only if no specific governing policy exists in the passages.",
  "directAnswer": "string — 1-3 sentences, plain English, operational. When a governing policy exists, begin with: 'Per [policyId], ...' or 'Under [policyId], ...'",
  "operationalRequirement": "string — what the corpus explicitly requires of the agency. Be specific and cite the policy section.",
  "requiredArtifacts": ["policy/form IDs (XX-XX-NNN format) explicitly required by the passages"],
  "complianceRisk": "string — specific regulatory / survey risk if requirement is not met",
  "riskLevel": "none|low|moderate|high|critical",
  "confidence": "high|medium|low",
  "complianceImpact": "string — exact consequence if not addressed: survey deficiency citation, claim denial, CoP violation, civil monetary penalty, license suspension. Cite regulatory basis when passages support it (e.g., 42 CFR 484.105).",
  "enforcementLevel": "condition_level|standard_level|none — condition_level for CoP-level deficiencies (life safety, patient rights, clinical care), standard_level for routine compliance gaps",
  "surveyFocus": ["string — 2-4 items: exactly what a CMS surveyor checks: specific documents, records, processes, or observations. Start each with an action verb: 'Evidence of...', 'Review of...', 'Observation of...'"],
  "commonFailurePoints": ["string — 2-4 documented failure patterns from the corpus that cause deficiencies or denials. Start each with a specific failure: 'Missing...', 'Unsigned...', 'Inconsistent...', 'Undocumented...'"],
  "requirementsSnapshot": [
    { "label": "string", "status": "required|recommended|warning", "sourcePolicyId": "string", "sourceSection": "string" }
  ],
  "citations": [
    { "passageId": "integer — the [P#] number from the CORPUS block", "excerpt": "string — <=220 chars quoted or paraphrased" }
  ],
  "noAnswerFound": "boolean — true ONLY if the corpus genuinely does not address this topic. Also true if directAnswer would require outside knowledge.",
  "noAnswerReason": "string — ONLY set when noAnswerFound is true. One sentence explaining what is missing from the corpus."
}`;

const SYSTEM_BASE = `You are the Compliance Intelligence engine for Care Indeed Home Health Care, Inc.

Operating rules (non-negotiable):
- The ONLY authoritative sources are the numbered CORPUS passages supplied in the user message.
- Never rely on outside knowledge, web content, prior training, or invented policies.
- Never greet, apologize, or chat. Output is machine-consumed by a compliance UI.
- Every factual statement must be traceable to a passage id. If you cannot trace it, omit it.
- If the corpus does not support an answer, set "noAnswerFound": true. Do NOT set noAnswerFound=false and then write "not explicitly stated" — that is a contradiction. Either the corpus supports it or it does not.
- Keep prose tight, operational, and survey-ready. Avoid hedging phrases ("might", "perhaps").
- Respond with ONE JSON object matching the schema. No markdown, no commentary, no code fences.
- OUTPUT THE JSON OBJECT IMMEDIATELY. Do not write any text, explanation, or preamble before the opening { brace.
- riskLevel is REQUIRED. Derive from evidence: none=compliant, low=minor gap, moderate=documented gap, high=survey exposure risk, critical=immediate CoP deficiency. Auto-elevate to high/critical when passages cite 42 CFR 484, CoP conditions, HIPAA, or False Claims Act.
- enforcementLevel: set condition_level when passages reference Conditions of Participation (CoP), 42 CFR 484, patient rights, clinical care requirements, or billing fraud. Set standard_level for documentation gaps, training requirements, or administrative non-compliance.
- requiredArtifacts MUST include every form/policy ID (XX-XX-NNN) the passages identify as required, mandatory, essential, or must-complete. Empty array only when no specific documents are cited.
- citations MUST reference only [P#] passage numbers that were provided. Never invent citations.
- governingPolicyId: the single policy ID that establishes primary authority. When set, directAnswer MUST open with "Per [id], ..." or "Under [id], ...".
- surveyFocus and commonFailurePoints MUST be derived from audit sections, compliance indicators, and failure patterns in the passages. Empty arrays only if passages contain no audit content.
- citations in the output MUST use valid policy/form IDs only (XX-XX-NNN format). Never output a passage header or filename as a policyId.`;

const INTENT_DIRECTIVES: Record<IntentKind, string> = {
  question:
    'MODE: direct answer. Produce the smallest precise answer that the operations team can act on today.',
  pre_survey_audit:
    'MODE: pre-survey audit. The directAnswer is a readiness summary (2-4 sentences). Populate requirementsSnapshot with the top gaps and controls; set status="warning" for failures, "required" for confirmed controls. riskLevel reflects aggregate readiness.',
  action_plan:
    'MODE: action plan. directAnswer is an executive-level framing. requirementsSnapshot becomes an ordered list of next steps (status="required" for deadline-driven items). Include deadlines only if explicitly stated in the passages.',
  governing_body_brief:
    'MODE: governing body brief. directAnswer is the executive summary. operationalRequirement enumerates approvals or documentation the board must see. Emphasize fiduciary and oversight framing.',
  qapi_digest:
    'MODE: QAPI digest. directAnswer summarizes the quality issue. operationalRequirement lists oversight implications. requiredArtifacts must include any QAPI-specific forms or records the corpus names.',
  knowledge_article:
    'MODE: knowledge article. directAnswer is a 1-paragraph explainer. operationalRequirement is what staff must do today.',
  artifact_lookup:
    'MODE: artifact lookup. directAnswer states what the artifact is and when it is used. complianceRisk may be an empty string. Focus citations on the specific policy/form passages.',
  missing_items:
    'MODE: missing items. directAnswer summarizes the gap. requirementsSnapshot lists each missing artifact as a separate row with status="warning" and the policy section that requires it.',
};

export function buildSystemPrompt(intent: IntentKind): string {
  return [
    SYSTEM_BASE,
    '',
    INTENT_DIRECTIVES[intent],
    '',
    'Respond with a JSON object of this shape:',
    JSON_SCHEMA_BLOCK,
  ].join('\n');
}

/** Fits a passage into ~`maxChars`, preserving the contextual header. */
function trimPassage(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).replace(/\s+\S*$/, '') + ' …';
}

export interface PromptBundle {
  system: string;
  user: string;
  passageMap: Array<{
    passageId: number;
    chunkId: string;
    docId: string;
    title: string;
    sectionId: string;
    sectionTitle: string;
    accessTier: string;
    domain: string;
    subdomain: string;
  }>;
}

/** Per-intent passage char budget. Audit/brief get more context per hit. */
function passageBudget(intent: IntentKind): number {
  switch (intent) {
    case 'pre_survey_audit':
    case 'action_plan':
    case 'governing_body_brief':
    case 'qapi_digest': return 1100;
    default: return 900;
  }
}

export function buildPrompt(args: {
  input: string;
  intent: IntentKind;
  hits: ScoredChunk[];
  docs: Map<string, CorpusDoc>;
  /** Soft limit per passage (chars). Defaults to intent-based budget. */
  passageMaxChars?: number;
  /** Compact operational state summary for context injection (Phase 1+). */
  operationalContext?: string;
  /** Compact regulatory update summary for context injection (Phase 2+). */
  regulatoryContext?: string;
}): PromptBundle {
  const { input, intent, hits, docs } = args;
  const passageMaxChars = args.passageMaxChars ?? passageBudget(intent);

  const passageMap: PromptBundle['passageMap'] = [];
  const corpusBlocks: string[] = [];

  hits.forEach((hit, i) => {
    const passageId = i + 1;
    const doc = docs.get(hit.chunk.docId);
    passageMap.push({
      passageId,
      chunkId: hit.chunk.id,
      docId: hit.chunk.docId,
      title: doc?.title ?? hit.chunk.title,
      sectionId: hit.chunk.sectionId,
      sectionTitle: hit.chunk.sectionTitle,
      accessTier: doc?.accessTier ?? hit.chunk.accessTier,
      domain: hit.chunk.domain,
      subdomain: hit.chunk.subdomain,
    });

    const header =
      `[P${passageId}] ${hit.chunk.docId} · ${doc?.title ?? hit.chunk.title} · ${hit.chunk.sectionTitle}`;
    corpusBlocks.push(
      `${header}\n${trimPassage(hit.chunk.text, passageMaxChars)}`,
    );
  });

  const contextBlocks: string[] = [];
  if (args.operationalContext) {
    contextBlocks.push(args.operationalContext);
  }
  if (args.regulatoryContext) {
    contextBlocks.push(args.regulatoryContext);
  }

  const userParts = [
    `COMMAND:\n${input.trim()}`,
    '',
    `CORPUS (authoritative, numbered):\n${corpusBlocks.join('\n\n---\n\n') || '(no passages)'}`,
  ];

  if (contextBlocks.length > 0) {
    userParts.push('');
    userParts.push(contextBlocks.join('\n\n'));
    userParts.push('');
    userParts.push(
      'OPERATIONAL CONTEXT RULES:',
      '- The OPERATIONAL STATE and REGULATORY UPDATES blocks above represent live/seed compliance state data. They are factual inputs, not to be cited as [P#] passages.',
      '- When operational gaps or lifecycle alerts are present, incorporate them into complianceRisk, surveyFocus, and commonFailurePoints where relevant.',
      '- When regulatory updates are present and impacted policies overlap with retrieved passages, reference them in complianceImpact.',
      '- Do NOT fabricate operational gaps not provided above.',
    );
  }

  userParts.push(
    '',
    'INSTRUCTION: Answer using ONLY the numbered passages above.',
    '- Cite using integer passageId numbers matching the [P#] labels.',
    '- Populate requiredArtifacts with every document ID (XX-XX-NNN) the passages require.',
    '- Assign riskLevel based on the gap severity evident in the passages.',
    '- Return ONLY the JSON object. No preamble, no trailing text, no markdown fences.',
  );

  return {
    system: buildSystemPrompt(intent),
    user: userParts.join('\n'),
    passageMap,
  };
}

/** Map an `IntentKind` to the exported `studioOutputType` label (or null). */
export function studioOutputForIntent(intent: IntentKind): StudioOutputType | null {
  switch (intent) {
    case 'pre_survey_audit': return 'audit_checklist';
    case 'action_plan': return 'action_plan';
    case 'governing_body_brief': return 'governing_body_brief';
    case 'qapi_digest': return 'qapi_digest';
    case 'knowledge_article': return 'knowledge_article';
    case 'question': return 'summary';
    default: return null;
  }
}
