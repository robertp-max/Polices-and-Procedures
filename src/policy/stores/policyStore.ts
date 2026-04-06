import { create } from 'zustand';
import { loadFrameworkSeed } from '@/policy/adapters/frameworkSeedAdapter';
import { useAuditorModeStore } from '@/policy/stores/auditorModeStore';
import { useReviewStore } from '@/policy/stores/reviewStore';
import {
  guardCannotApproveWithUnresolvedComments,
  guardCannotModifyInAuditorMode,
  guardCannotPublishIfNotApproved,
  guardCannotEditLockedVersion,
  guardLifecycleTransition,
} from '@/policy/utils/lifecycleGuards';
import type {
  AuditTrailEvent,
  LifecycleStatus,
  Policy,
  PolicyAssignment,
  PolicyVersion,
  PublishJob,
} from '@/policy/types';

const seed = loadFrameworkSeed();

interface PolicyState {
  policies: Policy[];
  versions: PolicyVersion[];
  assignments: PolicyAssignment[];
  publishJobs: PublishJob[];
  auditTrail: AuditTrailEvent[];
  setLifecycleStatus: (policyId: string, status: LifecycleStatus, actor: string, reason: string) => { ok: boolean; message: string };
  beginDraftEdit: (policyId: string, actor: string, reason: string) => { ok: boolean; message: string; version?: string };
  createPublishJob: (policyId: string, target: PublishJob['target'], actor: string) => { ok: boolean; message: string };
}

function now() {
  return new Date().toISOString();
}

function pushAudit(
  list: AuditTrailEvent[],
  event: Omit<AuditTrailEvent, 'id' | 'timestamp'>,
): AuditTrailEvent[] {
  return [
    {
      id: `AUD-${list.length + 1}`,
      timestamp: now(),
      ...event,
    },
    ...list,
  ];
}

function parseVersionNumber(version: string): number {
  const parsed = Number(version.replace(/^v/i, ''));
  return Number.isFinite(parsed) ? parsed : 1;
}

function nextDraftVersion(version: string): string {
  const next = (parseVersionNumber(version) + 0.1).toFixed(1);
  return `v${next}`;
}

function buildAssignments(policies: Policy[]): PolicyAssignment[] {
  const assignments: PolicyAssignment[] = [];
  policies.forEach(policy => {
    assignments.push({
      id: `ASN-${policy.id}-Admin`,
      policyId: policy.id,
      role: 'Admin',
      trainingModuleId: null,
      attestationRequired: true,
      status: 'Assigned',
    });

    if (policy.domainCode === 'CL') {
      assignments.push({
        id: `ASN-${policy.id}-RN`,
        policyId: policy.id,
        role: 'RN',
        trainingModuleId: null,
        attestationRequired: true,
        status: 'Assigned',
      });
      assignments.push({
        id: `ASN-${policy.id}-LVN`,
        policyId: policy.id,
        role: 'LVN',
        trainingModuleId: null,
        attestationRequired: true,
        status: 'Assigned',
      });
    }
  });

  return assignments;
}

export const usePolicyStore = create<PolicyState>((set, get) => ({
  policies: seed.policies,
  versions: seed.policyVersions,
  assignments: buildAssignments(seed.policies),
  publishJobs: [],
  auditTrail: [],
  setLifecycleStatus: (policyId, status, actor, reason) => {
    const auditorGuard = guardCannotModifyInAuditorMode(
      useAuditorModeStore.getState().enabled,
    );
    if (!auditorGuard.ok) {
      return { ok: false, message: auditorGuard.message };
    }

    const state = get();
    const policy = state.policies.find(item => item.id === policyId);
    if (!policy) {
      return { ok: false, message: 'Policy not found.' };
    }

    const currentVersion = state.versions.find(
      item => item.policyId === policyId && item.version === policy.currentVersion,
    );

    if (!currentVersion) {
      return { ok: false, message: 'Current version not found.' };
    }

    const transitionGuard = guardLifecycleTransition(policy.lifecycleStatus, status);
    if (!transitionGuard.ok) {
      return { ok: false, message: transitionGuard.message };
    }

    if (status === 'Approved') {
      const unresolved = useReviewStore.getState().unresolvedRequiredComments(policyId);
      const approveGuard = guardCannotApproveWithUnresolvedComments(unresolved);
      if (!approveGuard.ok) {
        return { ok: false, message: approveGuard.message };
      }
    }

    if (status === 'Published') {
      const publishGuard = guardCannotPublishIfNotApproved(policy.lifecycleStatus);
      if (!publishGuard.ok) {
        return { ok: false, message: publishGuard.message };
      }
    }

    set(state => {
      const policies = state.policies.map(policy => {
        if (policy.id !== policyId) {
          return policy;
        }

        const isPublished = status === 'Published';

        return {
          ...policy,
          lifecycleStatus: status,
          isPublished,
          publishedVersion: isPublished ? policy.currentVersion : policy.publishedVersion,
          updatedAt: now(),
        };
      });

      const versions = state.versions.map(version => {
        if (version.policyId !== policyId || version.version !== policy.currentVersion) {
          return version;
        }

        const lockNow = status === 'Approved' || status === 'Published' || status === 'Archived';
        return {
          ...version,
          lifecycleStatus: status,
          isLocked: lockNow,
          approvedBy: status === 'Approved' ? actor : version.approvedBy,
          approvedDate: status === 'Approved' ? now() : version.approvedDate,
          updatedAt: now(),
        };
      });

      return {
        policies,
        versions,
        auditTrail: pushAudit(state.auditTrail, {
          entityType: 'Policy',
          entityId: policyId,
          action: 'StatusChange',
          actor,
          reason,
          payload: { status },
        }),
      };
    });
    return { ok: true, message: 'Status updated.' };
  },
  beginDraftEdit: (policyId, actor, reason) => {
    const auditorGuard = guardCannotModifyInAuditorMode(
      useAuditorModeStore.getState().enabled,
    );
    if (!auditorGuard.ok) {
      return { ok: false, message: auditorGuard.message };
    }

    const state = get();
    const policy = state.policies.find(item => item.id === policyId);
    if (!policy) {
      return { ok: false, message: 'Policy not found.' };
    }

    const currentVersion = state.versions.find(
      item => item.policyId === policyId && item.version === policy.currentVersion,
    );

    const editGuard = guardCannotEditLockedVersion(currentVersion);
    if (editGuard.ok) {
      return { ok: true, message: 'Current draft version is editable.', version: policy.currentVersion };
    }

    const createdVersion = nextDraftVersion(policy.currentVersion);
    set(prev => ({
      versions: [
        {
          policyId,
          version: createdVersion,
          lifecycleStatus: 'Draft',
          isLocked: false,
          effectiveDate: null,
          approvedBy: null,
          approvedDate: null,
          supersedes: policy.currentVersion,
          contentRef: currentVersion ? currentVersion.contentRef : policy.contentRef,
          changeSummary: 'Created editable draft from locked approved/published version.',
          createdBy: actor,
          createdAt: now(),
          updatedAt: now(),
        },
        ...prev.versions,
      ],
      policies: prev.policies.map(item =>
        item.id === policyId
          ? {
              ...item,
              currentVersion: createdVersion,
              lifecycleStatus: 'Draft',
              isPublished: false,
              updatedAt: now(),
            }
          : item,
      ),
      auditTrail: pushAudit(prev.auditTrail, {
        entityType: 'PolicyVersion',
        entityId: `${policyId}:${createdVersion}`,
        action: 'DraftVersionCreated',
        actor,
        reason,
        payload: { supersedes: policy.currentVersion },
      }),
    }));

    return {
      ok: true,
      message: 'Created new draft version from immutable version.',
      version: createdVersion,
    };
  },
  createPublishJob: (policyId, target, actor) => {
    const auditorGuard = guardCannotModifyInAuditorMode(
      useAuditorModeStore.getState().enabled,
    );
    if (!auditorGuard.ok) {
      return { ok: false, message: auditorGuard.message };
    }

    const policy = get().policies.find(item => item.id === policyId);
    if (!policy) {
      return { ok: false, message: 'Policy not found.' };
    }

    const publishGuard = guardCannotPublishIfNotApproved(policy.lifecycleStatus);
    if (!publishGuard.ok) {
      return { ok: false, message: publishGuard.message };
    }

    set(state => ({
      publishJobs: [
        {
          id: `PUB-${state.publishJobs.length + 1}`,
          policyId,
          version: policy.currentVersion,
          target,
          status: 'Queued',
          createdAt: now(),
          createdBy: actor,
        },
        ...state.publishJobs,
      ],
      auditTrail: pushAudit(state.auditTrail, {
        entityType: 'PublishJob',
        entityId: policyId,
        action: 'PublishJobCreated',
        actor,
        reason: 'Manual publish request',
        payload: { target },
      }),
    }));

    return { ok: true, message: 'Publish job queued.' };
  },
}));
