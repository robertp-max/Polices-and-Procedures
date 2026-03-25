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
  { label: 'Approve', nextStatus: 'Approved', icon: CheckCircle2, color: 'text-emerald-700 border-emerald-300 hover:bg-emerald-50' },
  { label: 'Request Revision', nextStatus: 'Revision Requested', icon: RefreshCw, color: 'text-orange-700 border-orange-300 hover:bg-orange-50' },
  { label: 'Reject', nextStatus: 'Rejected', icon: XCircle, color: 'text-red-700 border-red-300 hover:bg-red-50' },
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
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search policies…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-gray-700 text-xs focus:outline-none focus:border-[#007970]/40 placeholder:text-gray-300"
            />
          </div>
          {/* Status filter tabs */}
          <div className="flex items-center gap-1 mb-1">
            <Filter className="w-3 h-3 text-gray-400 mr-1" />
            {(['Under Review', 'Revision Requested', 'All'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as PolicyStatus | 'All')}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                  statusFilter === s
                    ? 'bg-[#007970]/10 text-[#007970] border border-[#007970]/30'
                    : 'text-gray-400 hover:text-gray-600 border border-transparent'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </GlassCard>

        <div className="text-gray-400 text-[10px] uppercase tracking-wider px-1">
          {filtered.length} polic{filtered.length === 1 ? 'y' : 'ies'}
        </div>

        {/* Policy list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-8">No policies match.</div>
          ) : (
            filtered.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`w-full text-left rounded-xl border p-3 transition-all ${
                  selectedId === p.id
                    ? 'bg-[#007970]/5 border-[#007970]/30'
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[#007970] text-[10px] font-bold">{p.policyId}</span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="text-gray-700 text-xs font-medium leading-snug line-clamp-2">{p.title}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <TierBadge tier={p.tier} />
                  {p.reviewerComments.filter(c => c.status === 'Open').length > 0 && (
                    <span className="text-[9px] text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-1.5 py-0.5">
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
              <ChevronRight className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Select a policy from the queue to begin review.</p>
            </div>
          </GlassCard>
        ) : (
          <>
            {/* Policy header */}
            <GlassCard className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-[#007970] text-sm font-bold">{selected.policyId}</span>
                    <TierBadge tier={selected.tier} />
                    <StatusBadge status={selected.status} />
                  </div>
                  <h2 className="text-gray-800 font-semibold text-base leading-snug">{selected.title}</h2>
                  <p className="text-gray-500 text-xs mt-1">{selected.briefDescription}</p>
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
              <h3 className="text-gray-500 font-semibold text-xs uppercase tracking-wider mb-3">Policy Body</h3>
              <div className="text-gray-600 text-sm leading-relaxed italic">{selected.policyBody}</div>
            </GlassCard>

            {/* Comment section */}
            <GlassCard className="p-5">
              <h3 className="text-gray-700 font-semibold text-sm uppercase tracking-wider mb-4">Add Comment</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-gray-400 text-[10px] uppercase tracking-wider block mb-1">Reviewer</label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={e => setReviewerName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-xs px-3 py-2 focus:outline-none focus:border-[#007970]/40"
                  />
                </div>
              </div>
              <textarea
                rows={2}
                placeholder="Enter review comment…"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-xs px-3 py-2 focus:outline-none focus:border-[#007970]/40 resize-none mb-3"
              />
              <textarea
                rows={2}
                placeholder="Suggested change (optional)…"
                value={newSuggestion}
                onChange={e => setNewSuggestion(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-xs px-3 py-2 focus:outline-none focus:border-[#007970]/40 resize-none mb-3"
              />
              <button
                onClick={addComment}
                disabled={!newComment.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#007970]/40 text-[#007970] text-xs font-semibold hover:bg-[#007970]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-3 h-3" /> Add Comment
              </button>
            </GlassCard>

            {/* Existing comments */}
            {selected.reviewerComments.length > 0 && (
              <GlassCard className="p-5">
                <h3 className="text-gray-700 font-semibold text-sm uppercase tracking-wider mb-4">
                  Comment History ({selected.reviewerComments.length})
                </h3>
                <div className="space-y-3">
                  {selected.reviewerComments.map(c => (
                    <div key={c.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 font-semibold text-xs">{c.reviewerName}</span>
                          <span className="text-gray-400 text-[10px]">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-1">
                          {(['Open', 'Accepted', 'Resolved'] as CommentStatus[]).filter(s => s !== c.status).map(s => (
                            <button
                              key={s}
                              onClick={() => resolveComment(c.id, s)}
                              className="px-2 py-0.5 rounded text-[9px] border border-gray-200 text-gray-400 hover:text-gray-600 transition-all"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-xs">{c.commentText}</p>
                      {c.suggestedChange && (
                        <p className="text-[#007970]/70 text-[10px] italic mt-1 pl-2 border-l border-[#007970]/20">{c.suggestedChange}</p>
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
