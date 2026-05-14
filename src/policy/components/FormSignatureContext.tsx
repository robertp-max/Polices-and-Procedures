import { createContext, useContext } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   FormSignatureContext
   Shared types, demo session data, and React context for the
   CI-App internal signature flow.
   ═══════════════════════════════════════════════════════════════════ */

// ── Core types ───────────────────────────────────────────────────────

export interface DemoUser {
  id:    string;
  name:  string;
  role:  string;
  email: string;
  tier:  number; // 1 = highest authority
}

export interface SignatureRecord {
  fieldId:          string;
  signerName:       string;
  signerRole:       string;
  signerEmail:      string;
  signedAt:         string; // ISO 8601
  signatureDataUrl: string; // PNG data URL from canvas
}

export interface SecondSigTask {
  taskId:         string;
  type:           'signature_request';
  formInstanceId: string;
  assignedTo:     string; // DemoUser.id
  assignedBy:     string; // DemoUser.id
  status:         'pending';
  createdAt:      string; // ISO 8601
  dueDate?:       string; // ISO 8601
  /** Phase 11 — Required policy/procedure links inherited from the parent artifact. */
  linkedPolicyIds: string[];
  /** Optional source-policy context for audit traceability. */
  sourcePolicyContext?: {
    source:        'policy_viewer' | 'task' | 'forms_library' | 'workflow';
    parentTaskId?: string;
  };
}

/** Resolver for determining who fills a signer slot. */
export type SignerResolver =
  | 'self'
  | { role_id: string }
  | { tier_above: number }
  | { user_id: string };

/** Per-form signer slot definition from form template. */
export interface FormSignerSlot {
  field_id: string;
  role: string;
  tier: number;
  required: boolean;
  resolver: SignerResolver;
  sequence_group: number;
}

/** Generalized signer task (replaces SecondSigTask for multi-signer flows). */
export interface SignerTask {
  taskId: string;
  type: 'signature_request';
  formInstanceId: string;
  formId: string;
  eventId: string;
  assignedTo: string;
  assignedToName?: string;
  assignedToRole?: string;
  assignedBy: string;
  status: 'pending' | 'opened' | 'signed' | 'declined' | 'expired';
  createdAt: string;
  dueDate?: string;
  escalationAt?: string;
  slotFieldId: string;
  sequenceGroup: number;
  signerIndex: number;
  totalSigners: number;
  declineReason?: string;
  linkedPolicyIds: string[];
  sourcePolicyContext?: {
    source: 'policy_viewer' | 'task' | 'forms_library' | 'workflow';
    parentTaskId?: string;
  };
}

export type SignFlowState = 'unsigned' | 'signed' | 'pending_second' | 'pending_next_signer' | 'all_signed' | 'completed';

// ── Geo / network info ──

export interface GeoInfo {
  ip:      string;
  city:    string;
  region:  string;   // state / province
  country: string;   // full country name
  postal:  string;   // zip / postal code
  org?:    string;   // network organization / ISP
  loading: boolean;
  error?:  string;
}

// ── Field edit tracking ──────────────────────────────────────────────

export interface FieldEdit {
  seq:        number;
  fieldLabel: string;
  oldValue:   string;
  newValue:   string;
  changedAt:  string; // ISO 8601
  changedBy:  string; // signer name
}

// ── Demo session & staff directory ───────────────────────────────────

export const DEMO_SESSION: DemoUser = {
  id:    'user_vance',
  name:  'JD Vance',
  role:  'Administrator Designee',
  email: 'jvance@careindeed.com',
  tier:  2,
};

export const DEMO_STAFF: DemoUser[] = [
  { id: 'user_trump',   name: 'Donald Trump',  role: 'Administrator',          email: 'dtrump@careindeed.com',   tier: 1 },
  { id: 'user_vance',   name: 'JD Vance',      role: 'Administrator Designee', email: 'jvance@careindeed.com',   tier: 2 },
  { id: 'user_rubio',   name: 'Marco Rubio',   role: 'Compliance Officer',     email: 'mrubio@careindeed.com',   tier: 3 },
  { id: 'user_hegseth', name: 'Pete Hegseth',  role: 'Clinical Manager',       email: 'phegseth@careindeed.com', tier: 4 },
  { id: 'user_bondi',   name: 'Pam Bondi',     role: 'Compliance Liaison',     email: 'pbondi@careindeed.com',   tier: 4 },
  { id: 'user_noem',    name: 'Kristi Noem',   role: 'Staff RN',               email: 'knoem@careindeed.com',    tier: 5 },
  { id: 'user_rollins', name: 'Brooke Rollins', role: 'CHHA Supervisor',       email: 'brollins@careindeed.com', tier: 5 },
];

// ── Utilities ────────────────────────────────────────────────────────

export function signerNanoid(len = 12): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: len }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

export function fmtSignTs(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

// ── React context ────────────────────────────────────────────────────
// `enabled` is false in embedded mode (policy appendices) to preserve
// the static dashed-underline behavior for signature fields.
// `autoFills` carries values to auto-populate adjacent form fields
// (Printed Name, Date) after a signature is confirmed.

export interface SignatureCtxValue {
  enabled:     boolean;
  signatures:  Map<string, SignatureRecord>;
  requestSign: (fieldId: string) => void;
  autoFills:   Map<string, string>;
}

export const SignatureCtx = createContext<SignatureCtxValue>({
  enabled:     false,
  signatures:  new Map(),
  requestSign: () => {},
  autoFills:   new Map(),
});

export function useSignatureCtx(): SignatureCtxValue {
  return useContext(SignatureCtx);
}
