/**
 * Identity / Session model
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight session + actor representation. The session is derived from
 * request headers in the local-dev configuration; in production this is
 * intended to be backed by an SSO/IdP integration (out of scope here).
 *
 * Headers used (dev/local convention):
 *   x-user-id            : ULID-ish string identifying the user
 *   x-user-display-name  : optional display name
 *   x-user-roles         : comma-separated role IDs (e.g., "compliance_officer,administrator")
 *   x-user-branches      : comma-separated branch IDs (ABAC scope attribute)
 *   x-user-service-lines : comma-separated service line IDs
 *   x-user-mfa           : "true" | "false"
 *   x-user-ial           : "1" | "2" | "3"
 *   x-session-id         : ULID-ish session identifier (auto-derived if missing)
 *   x-correlation-id     : request correlation; auto-derived if missing
 *
 * If `x-user-id` is missing, the request is treated as anonymous and only
 * routes that explicitly allow anonymous access will pass the PEP.
 */
import { randomBytes } from 'node:crypto';

export type RoleId = string;

export interface UserAttributes {
  branches: string[];
  service_lines: string[];
  access_classes: string[];
  employment_type?: string;
  cost_center?: string;
}

export interface Actor {
  type: 'user' | 'service' | 'system';
  user_id?: string;
  service_id?: string;
  display_name?: string;
  /** Verified email of the canonical user (server-derived; COG-2). */
  email?: string;
  roles: RoleId[];
  attributes: UserAttributes;
  mfa_enrolled: boolean;
  identity_assurance: 1 | 2 | 3;
}

export interface SessionContext {
  session_id: string;
  request_id: string;
  correlation_id: string;
  actor: Actor;
  authenticated: boolean;
  auth_age_seconds: number;
  ip?: string;
  user_agent?: string;
  device_id?: string;
}

export const ANONYMOUS_ACTOR: Actor = {
  type: 'system',
  service_id: 'anonymous',
  display_name: 'anonymous',
  roles: [],
  attributes: { branches: [], service_lines: [], access_classes: [] },
  mfa_enrolled: false,
  identity_assurance: 1,
};

export function ulid(): string {
  return `${Date.now().toString(36)}_${randomBytes(8).toString('hex')}`;
}

/** Parse a comma-separated header into a string[] (trimmed, non-empty). */
export function parseList(h: string | string[] | undefined): string[] {
  if (!h) return [];
  const v = Array.isArray(h) ? h.join(',') : h;
  return v.split(',').map(s => s.trim()).filter(Boolean);
}
