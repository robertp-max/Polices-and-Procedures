import type {
  MandatedEventPacketDefinition,
  PacketAttachmentInstance,
  PacketInstance,
  PacketValidationResult,
} from '@/policy/packets/contracts';
import type {
  PacketTemplateDefinition,
  PacketTemplateSelectionOutput,
} from '@/policy/packets/registries/templateRegistry';

export interface PacketInstanceRecord extends PacketInstance {
  revision: number;
  identityKey: string;
}

export interface PacketApiErrorPayload {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

export class PacketsApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly details: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'PacketsApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface PacketsApiOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  headers?: Record<string, string>;
}

export interface CreatePacketRequest {
  idempotencyKey: string;
  agencyId: string;
  eventFamilyId: string;
  eventInstanceId: string;
  archetypeId: string;
  archetypeVersion: string;
  packetTemplateId: string;
  workflowId: string;
  workflowInstanceId: string;
  packetId?: string;
  subtype?: string | null;
  reportingPeriodStart?: string | null;
  reportingPeriodEnd?: string | null;
  dataThroughDate?: string | null;
  blockerIds?: string[];
  warningIds?: string[];
  approvalIds?: string[];
  signatureIds?: string[];
  reason?: string | null;
}

export interface CreatePacketResponse {
  status: 'ok';
  created: boolean;
  idempotencyKey: string;
  packet: PacketInstanceRecord;
  clientHashTrusted: false;
  ignoredClientFields: string[];
}

export interface PacketResponse {
  status: 'ok';
  packet: PacketInstanceRecord;
}

export interface PatchPacketRequest {
  expectedRevision: number;
  patch: Partial<PacketInstanceRecord>;
  reason?: string | null;
}

export interface PatchPacketResponse extends PacketResponse {
  ignoredClientFields: string[];
  clientHashTrusted: false;
}

export interface PacketMutationRequest {
  expectedRevision: number;
  reason?: string | null;
}

export interface ValidatePacketResponse {
  status: 'ok' | 'blocked';
  packet: PacketInstanceRecord;
  validation: PacketValidationResult;
  blockers: PacketValidationResult['findings'];
}

export interface ApprovePacketResponse extends PacketResponse {
  validation: PacketValidationResult;
}

export interface AddPacketSourceRequest {
  expectedRevision: number;
  sourceType: string;
  title: string;
  sourceId?: string;
  mimeType?: string | null;
  evidenceId?: string | null;
  formInstanceId?: string | null;
  driveUrl?: string | null;
  confidentialityLevel?: string;
  attachmentTypeId?: string;
  clientHash?: string;
  contentHash?: string;
  hash?: string;
  reason?: string | null;
}

export interface AddPacketSourceResponse extends PacketResponse {
  source: PacketAttachmentInstance;
  clientHashTrusted: false;
  ignoredClientFields: string[];
}

export interface ListPacketTemplatesResponse {
  status: 'ok';
  templates: PacketTemplateDefinition[];
  selectionOutputs: PacketTemplateSelectionOutput[];
  eventFamilyIds: string[];
  count: number;
}

export interface GetPacketTemplateResponse {
  status: 'ok';
  template: PacketTemplateDefinition;
  selectionOutput: PacketTemplateSelectionOutput;
  compatibleEventFamilies: Array<{
    eventFamilyId: string;
    definition: MandatedEventPacketDefinition | null;
  }>;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function encodePath(value: string): string {
  return encodeURIComponent(value);
}

function jsonHeaders(extra: Record<string, string> | undefined): Record<string, string> {
  return {
    'content-type': 'application/json',
    ...(extra ?? {}),
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const parsed = text ? (JSON.parse(text) as T | PacketApiErrorPayload) : ({} as T);
  if (!response.ok) {
    const payload = parsed as PacketApiErrorPayload;
    const message = payload.error?.message ?? `Packet API request failed with ${response.status}`;
    throw new PacketsApiError(
      message,
      response.status,
      payload.error?.code,
      payload.error?.details,
    );
  }
  return parsed as T;
}

export class PacketsApi {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly headers: Record<string, string> | undefined;

  constructor(options: PacketsApiOptions = {}) {
    this.baseUrl = normalizeBaseUrl(options.baseUrl ?? '/api');
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.headers = options.headers;
  }

  async listPacketTemplates(query: {
    eventFamilyId?: string;
    category?: string;
    availability?: string;
  } = {}): Promise<ListPacketTemplatesResponse> {
    const params = new URLSearchParams();
    if (query.eventFamilyId) params.set('eventFamilyId', query.eventFamilyId);
    if (query.category) params.set('category', query.category);
    if (query.availability) params.set('availability', query.availability);
    const qs = params.toString();
    return this.request<ListPacketTemplatesResponse>(
      `/packet-templates${qs ? `?${qs}` : ''}`,
      { method: 'GET' },
    );
  }

  async getPacketTemplate(templateId: string): Promise<GetPacketTemplateResponse> {
    return this.request<GetPacketTemplateResponse>(
      `/packet-templates/${encodePath(templateId)}`,
      { method: 'GET' },
    );
  }

  async createPacket(input: CreatePacketRequest): Promise<CreatePacketResponse> {
    const { idempotencyKey, ...body } = input;
    return this.request<CreatePacketResponse>('/packets', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body,
    });
  }

  async getPacket(packetInstanceId: string): Promise<PacketResponse> {
    return this.request<PacketResponse>(
      `/packets/${encodePath(packetInstanceId)}`,
      { method: 'GET' },
    );
  }

  async patchPacket(
    packetInstanceId: string,
    input: PatchPacketRequest,
  ): Promise<PatchPacketResponse> {
    return this.request<PatchPacketResponse>(
      `/packets/${encodePath(packetInstanceId)}`,
      { method: 'PATCH', body: input },
    );
  }

  async validatePacket(
    packetInstanceId: string,
    input: PacketMutationRequest,
  ): Promise<ValidatePacketResponse> {
    return this.request<ValidatePacketResponse>(
      `/packets/${encodePath(packetInstanceId)}/validate`,
      { method: 'POST', body: input },
    );
  }

  async returnForCorrection(
    packetInstanceId: string,
    input: PacketMutationRequest,
  ): Promise<PacketResponse> {
    return this.request<PacketResponse>(
      `/packets/${encodePath(packetInstanceId)}/return-for-correction`,
      { method: 'POST', body: input },
    );
  }

  async approvePacket(
    packetInstanceId: string,
    input: PacketMutationRequest,
  ): Promise<ApprovePacketResponse> {
    return this.request<ApprovePacketResponse>(
      `/packets/${encodePath(packetInstanceId)}/approve`,
      { method: 'POST', body: input },
    );
  }

  async rejectPacket(
    packetInstanceId: string,
    input: PacketMutationRequest,
  ): Promise<PacketResponse> {
    return this.request<PacketResponse>(
      `/packets/${encodePath(packetInstanceId)}/reject`,
      { method: 'POST', body: input },
    );
  }

  async addPacketSource(
    packetInstanceId: string,
    input: AddPacketSourceRequest,
  ): Promise<AddPacketSourceResponse> {
    return this.request<AddPacketSourceResponse>(
      `/packets/${encodePath(packetInstanceId)}/sources`,
      { method: 'POST', body: input },
    );
  }

  private async request<T>(
    path: string,
    init: {
      method: 'GET' | 'POST' | 'PATCH';
      body?: unknown;
      headers?: Record<string, string>;
    },
  ): Promise<T> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: init.method,
      headers: jsonHeaders({ ...(this.headers ?? {}), ...(init.headers ?? {}) }),
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    return parseResponse<T>(response);
  }
}

export const packetsApi = new PacketsApi();
