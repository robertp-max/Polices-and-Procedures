import { create } from 'zustand';
import { useAuditorModeStore } from '@/policy/stores/auditorModeStore';
import { usePolicyStore } from '@/policy/stores/policyStore';
import { guardCannotEditLockedVersion, guardCannotModifyInAuditorMode } from '@/policy/utils/lifecycleGuards';
import type { DraftWorkspace, PolicyContentSection } from '@/policy/types';

interface DraftState {
  workspaces: Record<string, DraftWorkspace>;
  initializeDraft: (policyId: string, version: string, sections: PolicyContentSection[]) => { ok: boolean; message: string };
  updateSectionBody: (policyId: string, sectionId: string, body: string, actor: string) => { ok: boolean; message: string };
  addValidationFlag: (policyId: string, message: string) => { ok: boolean; message: string };
  addUnresolvedComment: (policyId: string, commentId: string) => { ok: boolean; message: string };
}

function now() {
  return new Date().toISOString();
}

function canMutateDraft(policyId: string) {
  const auditorGuard = guardCannotModifyInAuditorMode(
    useAuditorModeStore.getState().enabled,
  );
  if (!auditorGuard.ok) {
    return auditorGuard;
  }

  const policyState = usePolicyStore.getState();
  const policy = policyState.policies.find(item => item.id === policyId);
  if (!policy) {
    return { ok: false, code: 'POLICY_NOT_FOUND', message: 'Policy not found.' };
  }

  const version = policyState.versions.find(
    item => item.policyId === policyId && item.version === policy.currentVersion,
  );
  return guardCannotEditLockedVersion(version);
}

export const useDraftStore = create<DraftState>(set => ({
  workspaces: {},
  initializeDraft: (policyId, version, sections) => {
    const guard = canMutateDraft(policyId);
    if (!guard.ok) {
      return { ok: false, message: guard.message };
    }

    set(state => ({
      workspaces: {
        ...state.workspaces,
        [policyId]: {
          policyId,
          version,
          sections,
          changeLog: [],
          unresolvedComments: [],
          unsavedChanges: false,
          validationFlags: [],
        },
      },
    }));
    return { ok: true, message: 'Draft workspace initialized.' };
  },
  updateSectionBody: (policyId, sectionId, body, actor) => {
    const guard = canMutateDraft(policyId);
    if (!guard.ok) {
      return { ok: false, message: guard.message };
    }

    set(state => {
      const workspace = state.workspaces[policyId];
      if (!workspace) {
        return state;
      }

      return {
        workspaces: {
          ...state.workspaces,
          [policyId]: {
            ...workspace,
            sections: workspace.sections.map(section =>
              section.id === sectionId ? { ...section, body } : section,
            ),
            changeLog: [
              {
                id: `CHG-${workspace.changeLog.length + 1}`,
                actor,
                timestamp: now(),
                summary: `Updated section ${sectionId}`,
              },
              ...workspace.changeLog,
            ],
            unsavedChanges: true,
          },
        },
      };
    });
    return { ok: true, message: 'Draft section updated.' };
  },
  addValidationFlag: (policyId, message) => {
    const guard = canMutateDraft(policyId);
    if (!guard.ok) {
      return { ok: false, message: guard.message };
    }

    set(state => {
      const workspace = state.workspaces[policyId];
      if (!workspace || workspace.validationFlags.includes(message)) {
        return state;
      }

      return {
        workspaces: {
          ...state.workspaces,
          [policyId]: {
            ...workspace,
            validationFlags: [...workspace.validationFlags, message],
          },
        },
      };
    });
    return { ok: true, message: 'Validation flag added.' };
  },
  addUnresolvedComment: (policyId, commentId) => {
    const guard = canMutateDraft(policyId);
    if (!guard.ok) {
      return { ok: false, message: guard.message };
    }

    set(state => {
      const workspace = state.workspaces[policyId];
      if (!workspace || workspace.unresolvedComments.includes(commentId)) {
        return state;
      }

      return {
        workspaces: {
          ...state.workspaces,
          [policyId]: {
            ...workspace,
            unresolvedComments: [...workspace.unresolvedComments, commentId],
          },
        },
      };
    });
    return { ok: true, message: 'Unresolved comment linked.' };
  },
}));
