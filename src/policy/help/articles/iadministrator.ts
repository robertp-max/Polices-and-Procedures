import type { HelpArticle } from './index';

export const IADMINISTRATOR_ARTICLES: HelpArticle[] = [
  {
    slug: 'iadministrator-overview',
    title: 'Brad iAdministrator — Overview',
    category: 'iadministrator',
    purpose:
      'Brad iAdministrator (/iadministrator) is an AI-assisted compliance query interface using a local RAG (Retrieval-Augmented Generation) pipeline grounded in your agency\'s loaded policy content.',
    whenToUse:
      'When a coordinator, manager, or compliance officer needs to quickly answer a specific compliance question (e.g., "What are the OSHA requirements for home health?") without searching through individual policy documents.',
    systemBehavior:
      'Brad uses /api/ia/query to submit natural language questions. The server\'s RAG pipeline retrieves the most relevant policy sections (by cosine similarity over the vector store) and synthesizes an answer with source citations. The pipeline operates on policy content loaded at server startup — it does not query external sources. All queries are logged for audit purposes (question, actor, timestamp).',
    complianceImpact:
      'Brad is advisory only. His responses do not constitute legal, regulatory, or clinical guidance. Always verify critical compliance decisions against the primary source policy. Brad is a productivity tool, not a compliance oracle.',
    evidence:
      'All queries are logged: user_id, question (not the answer), timestamp, queryId. Feedback submissions are also logged.',
    related: {
      components: ['CommandCenterLayout'],
      endpoints: ['POST /api/ia/query', 'GET /api/ia/status'],
    },
    complianceRequirement:
      'iAdministrator supports compliance knowledge management but is not itself a regulated function. It is a decision-support tool that accelerates policy lookup. The underlying policies it references are governed by CMS CoP 42 CFR Part 484 and the agency\'s compliance program.',
    enforcementRules: [
      'Brad cannot create, update, or delete policy records.',
      'Brad cannot approve compliance events or certify records.',
      'Brad\'s answers are grounded only in policy content loaded at server startup — stale content may produce outdated answers.',
      'If the RAG pipeline is not initialized (GET /api/ia/status returns ready: false), Brad will not function.',
    ],
    requiredActions: [
      'Review Brad\'s answer and the cited source sections before acting.',
      'If Brad cites a policy, verify the policy is in Published state in the Policy Library.',
      'Report incorrect answers using the feedback button — this improves the system.',
    ],
    auditLogging:
      'user_id, timestamp, queryId logged on each query. Question text is logged (not the generated answer). Feedback submissions log user_id, queryId, rating, timestamp.',
    failureImpact:
      'If Brad provides an incorrect answer and the user acts on it without verification, a compliance action may be taken based on wrong information. This is a process risk, not a system enforcement risk — Brad has no ability to modify compliance records.',
    traceability: {
      policy_id:   'cited in response sources (if RAG returns a match)',
      audit_id:    'generated per query (queryId)',
    },
  },
  {
    slug: 'iadministrator-howto',
    title: 'How to Use Brad iAdministrator',
    category: 'iadministrator',
    purpose: 'Step-by-step guide to getting reliable answers from Brad.',
    whenToUse: 'Any time you need a quick policy reference or compliance procedure clarification.',
    steps: [
      'Navigate to /iadministrator.',
      'Type your question in the query box. Be specific: include the domain (e.g., "Clinical"), the requirement (e.g., "supervisory visit frequency"), and context (e.g., "home health aide").',
      'Review the answer. Check the Sources panel at the bottom for the policy sections cited.',
      'Click a source to navigate to the full policy in the Policy Library.',
      'If the answer seems wrong or incomplete, click "Submit Feedback" and rate it.',
      'Do not use Brad\'s answer as the sole basis for a compliance decision — verify against the source policy.',
    ],
    systemBehavior:
      'Query is sent to POST /api/ia/query. Response includes: answer text, sources array (policyId, section, relevanceScore), queryId, processingTimeMs. If relevanceScore < 0.7 on all sources, Brad will indicate low confidence.',
    complianceImpact:
      'Brad improves compliance response time and reduces policy lookup burden on coordinators and managers.',
    evidence:
      'queryId logged to server audit log for each question asked.',
    related: {
      endpoints: ['POST /api/ia/query', 'POST /api/ia/feedback'],
    },
  },
];
