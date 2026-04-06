import { useState } from 'react';
import { useAuditorModeStore } from '@/policy/stores/auditorModeStore';
import { usePolicyStore } from '@/policy/stores/policyStore';
import { useReviewStore } from '@/policy/stores/reviewStore';

export function ReviewPage() {
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [commentText, setCommentText] = useState('');
  const isAuditorMode = useAuditorModeStore(state => state.enabled);

  const policies = usePolicyStore(state => state.policies);
  const setLifecycleStatus = usePolicyStore(state => state.setLifecycleStatus);
  const addComment = useReviewStore(state => state.addComment);
  const unresolvedRequiredComments = useReviewStore(state => state.unresolvedRequiredComments);

  const reviewQueue = policies.filter(policy =>
    ['Draft', 'Under Review', 'Revision Requested', 'Approved', 'Rejected', 'Published', 'Archived'].includes(
      policy.lifecycleStatus,
    ),
  );

  const selected = reviewQueue.find(policy => policy.id === selectedPolicyId) || null;

  function requestRevision() {
    if (!selected) {
      return;
    }
    setLifecycleStatus(selected.id, 'Revision Requested', 'Reviewer', 'Revision requested from review workflow');
  }

  function rejectPolicy() {
    if (!selected) {
      return;
    }
    setLifecycleStatus(selected.id, 'Rejected', 'Reviewer', 'Rejected during review');
  }

  function approvePolicy() {
    if (!selected) {
      return;
    }
    setLifecycleStatus(selected.id, 'Approved', 'Reviewer', 'Approved during review');
  }

  function addRequiredComment() {
    if (!selected || !commentText.trim()) {
      return;
    }

    const result = addComment({
      policyId: selected.id,
      version: selected.currentVersion,
      reviewer: 'Reviewer',
      commentType: 'Required',
      selectedTextRef: null,
      suggestedRevision: commentText,
    });
    if (!result.ok) {
      return;
    }
    setCommentText('');
  }

  return (
    <div className="flex-1 w-full h-full flex relative z-10 font-sans animate-in fade-in duration-500 overflow-hidden p-8 md:p-12 lg:p-16 gap-8">
      <div className="w-80 border border-white/10 rounded-2xl flex flex-col">
        <div className="border-b border-white/5 px-6 py-5">
          <h3 className="text-base font-semibold text-white">Review Queue ({reviewQueue.length})</h3>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {reviewQueue.map(policy => (
            <button
              key={policy.id}
              type="button"
              onClick={() => setSelectedPolicyId(policy.id)}
              className={`glass-interactive block w-full border-b border-white/5 px-6 py-4 text-left transition-colors ${
                selectedPolicyId === policy.id ? 'border-l-2 border-l-[#00c2b4]' : ''
              }`}
            >
              <div className="font-semibold text-[#00c2b4]">{policy.id}</div>
              <div className="text-sm text-white/60 mt-1">{policy.lifecycleStatus}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <h2 className="text-3xl font-bold text-white mb-8">Review Workspace</h2>
        {selected ? (
          <div className="space-y-6">
            <div className="border border-white/10 rounded-2xl p-6">
              <p className="font-semibold text-white text-lg">{selected.id} - {selected.title}</p>
              <p className="mt-3 text-base text-white/60">Status: {selected.lifecycleStatus}</p>
              <p className="mt-2 text-base text-white/60">
                Unresolved Required Comments: <span className="inline-block rounded bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-sm font-semibold text-amber-300">{unresolvedRequiredComments(selected.id)}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-montserrat font-bold text-white/60 uppercase tracking-widest">Suggested Replacement Text</label>
              <textarea
                className="mt-2 min-h-[120px] w-full rounded-xl border border-white/10 bg-transparent p-3 text-sm text-white placeholder-white/30 focus:border-[#00c2b4]/50 focus:outline-none transition-colors"
                value={commentText}
                onChange={event => setCommentText(event.target.value)}
                placeholder="Enter your suggested replacement text here..."
                disabled={isAuditorMode}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" className="glass-interactive rounded-xl px-4 py-2 text-sm font-montserrat font-bold text-white/70 border border-white/10 disabled:opacity-30" onClick={addRequiredComment} disabled={isAuditorMode}>Add Required Comment</button>
              <button type="button" className="glass-interactive rounded-xl px-4 py-2 text-sm font-montserrat font-bold text-[#ff8e52] border border-[#ff8e52]/30 disabled:opacity-30" onClick={requestRevision} disabled={isAuditorMode}>Request Revision</button>
              <button type="button" className="glass-interactive rounded-xl px-4 py-2 text-sm font-montserrat font-bold text-[#DC2626] border border-[#DC2626]/30 disabled:opacity-30" onClick={rejectPolicy} disabled={isAuditorMode}>Reject</button>
              <button type="button" className="glass-interactive rounded-xl px-4 py-2 text-sm font-montserrat font-bold text-[#00c2b4] border border-[#00c2b4]/30 disabled:opacity-30" onClick={approvePolicy} disabled={isAuditorMode}>Approve</button>
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-white/40">Select a policy from the queue to begin review.</p>
        )}
      </div>
    </div>
  );
}
