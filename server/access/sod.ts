/**
 * Separation-of-Duties rules
 * ─────────────────────────────────────────────────────────────────────────────
 * Implements the hard SoD predicates from
 * `Builder/Enterprise/01-Enterprise-Access-Control.md` §6.
 *
 * Each rule receives the AccessRequest and returns a violation reason or null.
 * The PDP applies rules whose `applies_to` matches the requested permission.
 */
import type { AccessRequest } from './pdp.js';

export interface SodRule {
  id: string;
  description: string;
  applies_to: (req: AccessRequest) => boolean;
  evaluate: (req: AccessRequest) => string | null; // violation reason or null
}

const isApprove = (req: AccessRequest) => req.action === 'approve';
const isOverrideApprove = (req: AccessRequest) =>
  req.resource.type === 'OverrideRecord' && req.action === 'approve';
const isOverrideCountersign = (req: AccessRequest) =>
  req.resource.type === 'OverrideRecord' && req.action === 'countersign';

export const SOD_RULES: SodRule[] = [
  {
    id: 'no_create_and_approve_same_artifact',
    description: 'Same actor cannot create and approve the same artifact.',
    applies_to: isApprove,
    evaluate: (req) => {
      const createdBy = req.resource_attributes?.created_by_user_id as string | undefined;
      if (createdBy && req.actor.user_id && createdBy === req.actor.user_id) {
        return 'sod:created_and_approving_same_artifact';
      }
      return null;
    },
  },
  {
    id: 'cannot_validate_own_competency',
    description: 'Subject of a competency cannot finalize it.',
    applies_to: (req) => req.action === 'finalize' && req.resource.type === 'CompetencyArtifact',
    evaluate: (req) => {
      const subject = req.resource_attributes?.subject_user_id as string | undefined;
      if (subject && req.actor.user_id && subject === req.actor.user_id) {
        return 'sod:self_competency_finalize';
      }
      return null;
    },
  },
  {
    id: 'cannot_override_own_gate',
    description: 'Subject affected by a gate failure cannot request/approve override on themselves.',
    applies_to: (req) => req.resource.type === 'OverrideRecord' &&
      (req.action === 'request' || req.action === 'approve' || req.action === 'countersign'),
    evaluate: (req) => {
      const affected = req.resource_attributes?.affected_subject_user_id as string | undefined;
      if (affected && req.actor.user_id && affected === req.actor.user_id) {
        return 'sod:self_override';
      }
      return null;
    },
  },
  {
    id: 'cannot_countersign_own_request',
    description: 'Override requestor cannot be the countersigner.',
    applies_to: (req) => isOverrideApprove(req) || isOverrideCountersign(req),
    evaluate: (req) => {
      const requestedBy = req.resource_attributes?.requested_by_user_id as string | undefined;
      if (requestedBy && req.actor.user_id && requestedBy === req.actor.user_id) {
        return 'sod:countersign_own_request';
      }
      return null;
    },
  },
  {
    id: 'cannot_approve_own_evidence',
    description: 'Evidence creator cannot approve it.',
    applies_to: (req) => req.resource.type === 'EvidenceObject' && req.action === 'approve',
    evaluate: (req) => {
      const createdBy = req.resource_attributes?.created_by_user_id as string | undefined;
      if (createdBy && req.actor.user_id && createdBy === req.actor.user_id) {
        return 'sod:approve_own_evidence';
      }
      return null;
    },
  },
  {
    id: 'policy_publish_different_actor_than_author',
    description: 'Policy publisher must differ from author.',
    applies_to: (req) => req.resource.type === 'PolicyVersion' && req.action === 'publish',
    evaluate: (req) => {
      const author = req.resource_attributes?.authored_by_user_id as string | undefined;
      if (author && req.actor.user_id && author === req.actor.user_id) {
        return 'sod:publisher_equals_author';
      }
      return null;
    },
  },
  {
    id: 'auditor_actions_view_only',
    description: 'Auditor roles may only view/list/search/export/replay.',
    applies_to: () => true,
    evaluate: (req) => {
      const auditorRoles = ['auditor_internal', 'auditor_external'];
      const isAuditor = req.actor.roles.some(r => auditorRoles.includes(r));
      const otherRoles = req.actor.roles.filter(r => !auditorRoles.includes(r));
      if (!isAuditor || otherRoles.length > 0) return null; // mixed roles bypass
      const allowedAuditorActions = new Set(['view', 'list', 'search', 'export', 'replay']);
      if (!allowedAuditorActions.has(req.action)) return 'sod:auditor_non_read_action';
      return null;
    },
  },
];
