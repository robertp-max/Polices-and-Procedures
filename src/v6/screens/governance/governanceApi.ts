import { apiRoot, bearerAuthHeader } from '@/auth/apiClient';

export interface GovernanceApiError {
  code: string;
  message: string;
  status: number;
}

interface Envelope<T> {
  schemaVersion: 2;
  correlationId: string;
  data: T;
}

export interface AuthorityProfileView {
  id: string;
  sourceBylawVersion: string;
  effectiveAt: string;
  approvalStatus: string;
  authorizedSeatIds: string[];
}

export interface MeetingView {
  id: string;
  version: number;
  title: string;
  meetingType: string;
  scheduledStart: string;
  timezone: string;
  status: string;
  noticeVersion: number;
  agendaId: string | null;
  boardBookId: string | null;
  minutesId: string | null;
}

export interface BoardBookView {
  id: string;
  meetingId: string;
  status: string;
  sectionIds: string[];
  manifestId: string | null;
  lockedAt: string | null;
}

export interface DecisionView {
  id: string;
  title: string;
  question: string;
  status: string;
  origin: string;
  sourceMetadataIds: string[];
  conditions: string[];
}

export interface ActionView {
  id: string;
  title: string;
  ownerId: string;
  status: string;
  dueAt: string;
  evidenceArtifactIds: string[];
  effectivenessDisposition: string | null;
}

export interface AcademyAssignmentView {
  id: string;
  memberId: string;
  moduleId: string;
  contentVersion: string;
  dueAt: string;
  status: string;
}

export interface GovernanceProjectionView {
  generatedAt: string;
  organizationId: string;
  sourcePosture: 'live' | 'partial' | 'unavailable';
  authorityProfile: AuthorityProfileView | null;
  readinessBlockers: string[];
  assignments: Array<{ type: string; id: string; title: string; dueAt: string | null; status: string }>;
  meetings: MeetingView[];
  boardBooks: BoardBookView[];
  decisions: DecisionView[];
  actions: ActionView[];
  academyAssignments: AcademyAssignmentView[];
}

export interface AcademyCatalogItem {
  id: string;
  sequence: number;
  title: string;
  shortTitle: string;
  domain: string;
  durationMinutes: number;
  contentVersion: string;
  sceneCount: number;
  executableTaskCount: number;
}

export interface PublicAcademyModule {
  id: string;
  sequence: number;
  title: string;
  shortTitle: string;
  domain: string;
  durationMinutes: number;
  contentVersion: string;
  policyVersionIds: string[];
  requiredStageIds: string[];
  minimumActiveSeconds: number;
  sceneBriefs: Array<{ id: string; title: string; body: string }>;
  questions: Array<{
    id: string;
    stageId: string;
    prompt: string;
    answers: Array<{ id: string; text: string }>;
  }>;
  executableTaskIds: string[];
}

export interface AcademyAttemptView {
  id: string;
  version: number;
  assignmentId: string;
  memberId: string;
  moduleId: string;
  status: string;
  attemptNumber: number;
  activeSeconds: number;
  completedStageIds: string[];
  answerEventIds: string[];
  taskEventIds: string[];
  score: number | null;
  criticalError: boolean | null;
  passed: boolean | null;
  cooldownUntil: string | null;
  completionEvidenceArtifactId: string | null;
}

export interface MeetingSurfaceView {
  surface: 'notice' | 'agenda' | 'board-book' | 'attendance' | 'conflicts' | 'session' | 'minutes';
  meeting: MeetingView & Record<string, unknown>;
  related: Record<string, unknown> | null;
  deliveredContentSha256: string;
}

function randomKey(prefix: string): string {
  const value = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}:${value}`;
}

async function request<T>(
  path: string,
  options: { method?: 'GET' | 'POST'; body?: unknown; signal?: AbortSignal; idempotencyKey?: string } = {},
): Promise<T> {
  const method = options.method ?? 'GET';
  const response = await fetch(`${apiRoot()}/governance${path}`, {
    method,
    signal: options.signal,
    headers: {
      ...bearerAuthHeader(),
      ...(method === 'POST' ? {
        'Content-Type': 'application/json',
        'Idempotency-Key': options.idempotencyKey ?? randomKey(path),
      } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const payload = await response.json().catch(() => null) as Envelope<T> | { error?: { code?: string; message?: string } } | null;
  if (!response.ok) {
    const error = payload && 'error' in payload ? payload.error : undefined;
    throw {
      code: error?.code ?? 'network_error',
      message: error?.message ?? 'The Governing Body service is unavailable.',
      status: response.status,
    } satisfies GovernanceApiError;
  }
  return (payload as Envelope<T>).data;
}

export const GovernanceApi = {
  office(signal?: AbortSignal) {
    return request<GovernanceProjectionView>('/office', { signal });
  },

  academyCatalog(signal?: AbortSignal) {
    return request<AcademyCatalogItem[]>('/academy/catalog', { signal });
  },

  meetingSurface(meetingId: string, surface: MeetingSurfaceView['surface'], signal?: AbortSignal) {
    return request<MeetingSurfaceView>(`/meetings/${encodeURIComponent(meetingId)}/${surface}`, { signal });
  },

  academyModule(moduleId: string, signal?: AbortSignal) {
    return request<PublicAcademyModule>(`/academy/modules/${encodeURIComponent(moduleId)}`, { signal });
  },

  startAcademyAttempt(assignmentId: string, idempotencyKey?: string) {
    return request<{ attempt: AcademyAttemptView; module: PublicAcademyModule }>('/academy/attempts', {
      method: 'POST',
      idempotencyKey,
      body: { schemaVersion: 2, assignmentId },
    });
  },

  answerAcademyQuestion(input: {
    attemptId: string;
    expectedVersion: number;
    stageId: string;
    questionId: string;
    answerId: string;
  }) {
    return request<{ attempt: AcademyAttemptView }>('/academy/answers', {
      method: 'POST',
      body: { ...input, schemaVersion: 2, occurredAt: new Date().toISOString() },
    });
  },

  academyTask(input: {
    attemptId: string;
    expectedVersion: number;
    stageId: string;
    taskId: string;
    eventType: string;
    payload: Record<string, string | number | boolean | null>;
  }) {
    return request<{ attempt: AcademyAttemptView }>('/academy/tasks', {
      method: 'POST',
      body: { ...input, schemaVersion: 2, occurredAt: new Date().toISOString() },
    });
  },

  academyHeartbeat(input: {
    attemptId: string;
    expectedVersion: number;
    visible: boolean;
    focused: boolean;
    recentActivity: boolean;
  }, signal?: AbortSignal) {
    return request<AcademyAttemptView>('/academy/heartbeat', {
      method: 'POST',
      signal,
      body: { ...input, schemaVersion: 2, occurredAt: new Date().toISOString() },
    });
  },

  submitAcademy(input: { attemptId: string; expectedVersion: number }) {
    return request<{
      attempt: AcademyAttemptView;
      evidence: { id: string; evidenceSha256: string } | null;
    }>('/academy/submit', {
      method: 'POST',
      body: { ...input, schemaVersion: 2 },
    });
  },

  search(query: string, signal?: AbortSignal) {
    return request<{
      queryHash: string;
      algorithm: 'HMAC-SHA-256';
      results: Array<{ type: string; id: string; title: string; status: string; route: string }>;
    }>(`/search?q=${encodeURIComponent(query)}&limit=20`, { signal });
  },
};
