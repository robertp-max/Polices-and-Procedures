import React, { useState } from 'react';
import { Send, CheckCircle2, XCircle, RefreshCw, ChevronRight, Filter, Search } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { TierBadge, StatusBadge } from '../components/StatusBadge';
import type { Policy, PolicyStatus, ReviewComment, CommentStatus } from '../types/policy';

interface AuditorReviewProps {
  policies: Policy[];
  onUpdatePolicy: (updated: Policy) => void;
}

const AUDITOR_STATUSES: PolicyStatus[] = ['Under Review', 'Revision Requested', 'Draft', 'Approved'];

const QUICK_ACTIONS: { label: string; nextStatus: PolicyStatus; icon: React.ElementType; color: string }[] = [
  { label: 'Approve', nextStatus: 'Approved', icon: CheckCircle2, color: 'text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10' },
  { label: 'Request Revision', nextStatus: 'Revision Requested', icon: RefreshCw, color: 'text-orange-300 border-orange-500/30 hover:bg-orange-500/10' },
  { label: 'Reject', nextStatus: 'Rejected', icon: XCircle, color: 'text-red-300 border-red-500/30 hover:bg-red-500/10' },
];

export default function AuditorReview({ policies, onUpdatePolicy }: AuditorReviewProps) {
  const [statusFilter, setStatusFilter] = useState<PolicyStatus | 'All'>('Under Review');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newSuggestion, setNewSuggestion] = useState('');
  const [reviewerName, setReviewerName] = useState('Auditor');

  const filtered = policies.filter(p => {
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.policyId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const selected = selectedId ? policies.find(p => p.id === selectedId) ?? null : null;

  function applyAction(policy: Policy, nextStatus: PolicyStatus) {
    onUpdatePolicy({ ...policy, status: nextStatus, lastUpdated: new Date().toISOString().split('T')[0] });
  }

  function addComment() {
    if (!selected || !newComment.trim()) return;
    const comment: ReviewComment = {
      id: `cmt-${Date.now()}`,
      reviewerName,
      reviewerRole: 'Auditor',
      commentText: newComment.trim(),
      suggestedChange: newSuggestion.trim(),
      status: 'Open',
      createdAt: new Date().toISOString(),
    };
    onUpdatePolicy({
      ...selected,
      reviewerComments: [...selected.reviewerComments, comment],
      lastUpdated: new Date().toISOString().split('T')[0],
    });
    setNewComment('');
    setNewSuggestion('');
  }

  function resolveComment(commentId: string, status: CommentStatus) {
    if (!selected) return;
    onUpdatePolicy({
      ...selected,
      reviewerComments: selected.reviewerComments.map(c =>
        c.id === commentId ? { ...c, status } : c
      ),
    });
  }

  return (
    <div className="flex gap-5 h-[calc(100vh-140px)]">
      {/* Left panel — queue */}
      <div className="w-[340px] flex flex-col gap-3 shrink-0">
        <GlassCard className="p-3">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
            <input
              type="text"
              placeholder="Search policies…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white/70 text-xs focus:outline-none focus:border-[#00F0FF]/40 placeholder:text-white/20"
            />
          </div>
          {/* Status filter tabs */}
          <div className="flex items-center gap-1 mb-1">
            <Filter className="w-3 h-3 text-white/25 mr-1" />
            {(['Under Review', 'Revision Requested', 'All'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as PolicyStatus | 'All')}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                  statusFilter === s
                    ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30'
                    : 'text-white/30 hover:text-white/50 border border-transparent'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </GlassCard>

        <div className="text-white/25 text-[10px] uppercase tracking-wider px-1">
          {filtered.length} polic{filtered.length === 1 ? 'y' : 'ies'}
        </div>

        {/* Policy list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center text-white/25 text-sm py-8">No policies match.</div>
          ) : (
            filtered.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`w-full text-left rounded-xl border p-3 transition-all ${
                  selectedId === p.id
                    ? 'bg-[#00F0FF]/[0.06] border-[#00F0FF]/30'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[#00F0FF] text-[10px] font-bold">{p.policyId}</span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="text-white/70 text-xs font-medium leading-snug line-clamp-2">{p.title}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <TierBadge tier={p.tier} />
                  {p.reviewerComments.filter(c => c.status === 'Open').length > 0 && (
                    <span className="text-[9px] text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 rounded px-1.5 py-0.5">
                      {p.reviewerComments.filter(c => c.status === 'Open').length} open
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel — detail */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        {!selected ? (
          <GlassCard className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <ChevronRight className="w-8 h-8 text-white/10 mx-auto mb-3" />
              <p className="text-white/25 text-sm">Select a policy from the queue to begin review.</p>
            </div>
          </GlassCard>
        ) : (
          <>
            {/* Policy header */}
            <GlassCard className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-[#00F0FF] text-sm font-bold">{selected.policyId}</span>
                    <TierBadge tier={selected.tier} />
                    <StatusBadge status={selected.status} />
                  </div>
                  <h2 className="text-white/90 font-semibold text-base leading-snug">{selected.title}</h2>
                  <p className="text-white/40 text-xs mt-1">{selected.briefDescription}</p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  {QUICK_ACTIONS.map(action => {
                    const Icon = action.icon;
                    const allowed = ({
                      'Draft': ['Under Review'],
                      'Under Review': ['Approved', 'Revision Requested', 'Rejected'],
                      'Revision Requested': ['Under Review'],
                      'Approved': ['Published', 'Archived'],
                      'Rejected': ['Draft'],
                      'Published': ['Archived'],
                      'Archived': [],
                    } as Record<PolicyStatus, PolicyStatus[]>)[selected.status];
                    if (!allowed.includes(action.nextStatus)) return null;
                    return (
                      <button
                        key={action.label}
                        onClick={() => applyAction(selected, action.nextStatus)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${action.color}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </GlassCard>

            {/* Policy body preview */}
            <GlassCard className="p-5">
              <h3 className="text-white/50 font-semibold text-xs uppercase tracking-wider mb-3">Policy Body</h3>
              <div className="text-white/45 text-sm leading-relaxed italic">{selected.policyBody}</div>
            </GlassCard>

            {/* Comment section */}
            <GlassCard className="p-5">
              <h3 className="text-white/70 font-semibold text-sm uppercase tracking-wider mb-4">Add Comment</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-white/30 text-[10px] uppercase tracking-wider block mb-1">Reviewer</label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={e => setReviewerName(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg text-white/70 text-xs px-3 py-2 focus:outline-none focus:border-[#00F0FF]/40"
                  />
                </div>
              </div>
              <textarea
                rows={2}
                placeholder="Enter review comment…"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg text-white/70 text-xs px-3 py-2 focus:outline-none focus:border-[#00F0FF]/40 resize-none mb-3"
              />
              <textarea
                rows={2}
                placeholder="Suggested change (optional)…"
                value={newSuggestion}
                onChange={e => setNewSuggestion(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg text-white/70 text-xs px-3 py-2 focus:outline-none focus:border-[#00F0FF]/40 resize-none mb-3"
              />
              <button
                onClick={addComment}
                disabled={!newComment.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#00F0FF]/40 text-[#00F0FF] text-xs font-semibold hover:bg-[#00F0FF]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-3 h-3" /> Add Comment
              </button>
            </GlassCard>

            {/* Existing comments */}
            {selected.reviewerComments.length > 0 && (
              <GlassCard className="p-5">
                <h3 className="text-white/70 font-semibold text-sm uppercase tracking-wider mb-4">
                  Comment History ({selected.reviewerComments.length})
                </h3>
                <div className="space-y-3">
                  {selected.reviewerComments.map(c => (
                    <div key={c.id} className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.06]">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-white/70 font-semibold text-xs">{c.reviewerName}</span>
                          <span className="text-white/25 text-[10px]">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-1">
                          {(['Open', 'Accepted', 'Resolved'] as CommentStatus[]).filter(s => s !== c.status).map(s => (
                            <button
                              key={s}
                              onClick={() => resolveComment(c.id, s)}
                              className="px-2 py-0.5 rounded text-[9px] border border-white/10 text-white/30 hover:text-white/55 transition-all"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-white/55 text-xs">{c.commentText}</p>
                      {c.suggestedChange && (
                        <p className="text-[#00F0FF]/50 text-[10px] italic mt-1 pl-2 border-l border-[#00F0FF]/20">{c.suggestedChange}</p>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </>
        )}
      </div>
    </div>
  );
}
