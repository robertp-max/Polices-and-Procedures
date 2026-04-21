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
    <div className="flex-1 w-full h-full flex relative z-10 font-sans animate-in fade-in duration-500 overflow-hidden p-8 md:p-12 lg:p-16 gap-10">
      <div className="w-72 flex flex-col" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <div
          className="px-4 pb-3 mb-2"
          style={{ borderBottom: '1px solid rgba(var(--ci-accent-rgb),0.22)' }}
        >
          <h3 className="text-[12px] font-montserrat font-bold text-white uppercase tracking-[0.18em]">Review Queue ({reviewQueue.length})</h3>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {reviewQueue.map(policy => (
            <button
              key={policy.id}
              type="button"
              onClick={() => setSelectedPolicyId(policy.id)}
              className={`block w-full border-b border-white/5 px-4 py-3 text-left transition-colors hover:bg-white/[0.02] ${
                selectedPolicyId === policy.id ? 'border-l-2 border-l-[#FFC107] bg-white/[0.03]' : 'border-l-2 border-l-transparent'
              }`}
            >
              <div className="font-montserrat font-bold text-[#FFC107] text-[12px] tracking-[0.06em]">{policy.id}</div>
              <div className="text-[11px] text-white/55 mt-1 font-roboto uppercase tracking-[0.12em]">{policy.lifecycleStatus}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <h2 className="font-outfit font-light text-white mb-8 leading-tight" style={{ fontSize: 28, letterSpacing: '-0.01em' }}>Review Workspace</h2>
        {selected ? (
          <div className="space-y-8">
            <div
              className="pl-5 py-4"
              style={{ borderLeft: '2px solid rgba(var(--ci-accent-rgb),0.45)' }}
            >
              <p className="font-montserrat font-bold text-white text-[15px] tracking-[0.04em]">{selected.id} — {selected.title}</p>
              <p className="mt-2 text-[12px] text-white/60 font-roboto">Status: <span className="text-white/85">{selected.lifecycleStatus}</span></p>
              <p className="mt-2 text-[12px] text-white/60 font-roboto flex items-center gap-2">
                Unresolved Required Comments:
                <span className="inline-block rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-montserrat font-bold text-amber-300 tracking-wider">{unresolvedRequiredComments(selected.id)}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-montserrat font-bold text-white/60 uppercase tracking-widest">Suggested Replacement Text</label>
              <textarea
                className="mt-2 min-h-[120px] w-full rounded-xl border border-white/10 bg-transparent p-3 text-sm text-white placeholder-white/30 focus:border-[#FFC107]/50 focus:outline-none transition-colors"
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
              <button type="button" className="glass-interactive rounded-xl px-4 py-2 text-sm font-montserrat font-bold text-[#FFC107] border border-[#FFC107]/30 disabled:opacity-30" onClick={approvePolicy} disabled={isAuditorMode}>Approve</button>
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-white/40">Select a policy from the queue to begin review.</p>
        )}
      </div>
    </div>
  );
}
