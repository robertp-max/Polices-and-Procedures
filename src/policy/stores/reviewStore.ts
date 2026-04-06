import { create } from 'zustand';
import { useAuditorModeStore } from '@/policy/stores/auditorModeStore';
import { guardCannotModifyInAuditorMode } from '@/policy/utils/lifecycleGuards';
import type { ApprovalDecision, ReviewComment } from '@/policy/types';

interface ReviewState {
  comments: ReviewComment[];
  decisions: ApprovalDecision[];
  addComment: (
    comment: Omit<ReviewComment, 'id' | 'timestamp' | 'resolutionStatus'>,
  ) => { ok: boolean; message: string; commentId?: string };
  resolveComment: (commentId: string) => { ok: boolean; message: string };
  addDecision: (decision: Omit<ApprovalDecision, 'id' | 'timestamp'>) => { ok: boolean; message: string };
  unresolvedRequiredComments: (policyId: string) => number;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  comments: [],
  decisions: [],
  addComment: comment => {
    const guard = guardCannotModifyInAuditorMode(useAuditorModeStore.getState().enabled);
    if (!guard.ok) {
      return { ok: false, message: guard.message };
    }

    const commentId = `COM-${get().comments.length + 1}`;
    set(state => ({
      comments: [
        {
          id: commentId,
          timestamp: new Date().toISOString(),
          resolutionStatus: 'Open',
          ...comment,
        },
        ...state.comments,
      ],
    }));
    return { ok: true, message: 'Comment added.', commentId };
  },
  resolveComment: commentId => {
    const guard = guardCannotModifyInAuditorMode(useAuditorModeStore.getState().enabled);
    if (!guard.ok) {
      return { ok: false, message: guard.message };
    }

    set(state => ({
      comments: state.comments.map(comment =>
        comment.id === commentId
          ? {
              ...comment,
              resolutionStatus: 'Resolved',
            }
          : comment,
      ),
    }));
    return { ok: true, message: 'Comment resolved.' };
  },
  addDecision: decision => {
    const guard = guardCannotModifyInAuditorMode(useAuditorModeStore.getState().enabled);
    if (!guard.ok) {
      return { ok: false, message: guard.message };
    }

    set(state => ({
      decisions: [
        {
          id: `DEC-${state.decisions.length + 1}`,
          timestamp: new Date().toISOString(),
          ...decision,
        },
        ...state.decisions,
      ],
    }));
    return { ok: true, message: 'Decision logged.' };
  },
  unresolvedRequiredComments: policyId =>
    get().comments.filter(
      comment =>
        comment.policyId === policyId &&
        comment.commentType === 'Required' &&
        comment.resolutionStatus !== 'Resolved',
    ).length,
}));
