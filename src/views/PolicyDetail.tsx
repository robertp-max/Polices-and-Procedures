import React, { useState } from 'react';
import { ArrowLeft, Edit3, Send, CheckCircle2, XCircle, RefreshCw, Archive, BookOpen, FileText } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { TierBadge, StatusBadge } from '../components/StatusBadge';
import type { Policy, PolicyStatus, ReviewComment, CommentStatus } from '../types/policy';

interface PolicyDetailProps {
  policy: Policy;
  onBack: () => void;
  onUpdatePolicy: (updated: Policy) => void;
}

const STATUS_TRANSITIONS: Record<PolicyStatus, PolicyStatus[]> = {
  'Draft': ['Under Review'],
  'Under Review': ['Revision Requested', 'Approved', 'Rejected'],
  'Revision Requested': ['Under Review'],
  'Approved': ['Published', 'Archived'],
  'Rejected': ['Draft'],
  'Published': ['Archived'],
  'Archived': [],
};

const STATUS_ACTIONS: Record<PolicyStatus, { label: string; icon: React.ElementType; color: string }> = {
  'Under Review': { label: 'Submit for Review', icon: Send, color: 'border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/10' },
  'Revision Requested': { label: 'Request Revision', icon: RefreshCw, color: 'border-orange-500/40 text-orange-300 hover:bg-orange-500/10' },
  'Approved': { label: 'Approve', icon: CheckCircle2, color: 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10' },
  'Rejected': { label: 'Reject', icon: XCircle, color: 'border-red-500/40 text-red-300 hover:bg-red-500/10' },
  'Published': { label: 'Publish', icon: BookOpen, color: 'border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/10' },
  'Archived': { label: 'Archive', icon: Archive, color: 'border-white/20 text-white/40 hover:bg-white/5' },
  'Draft': { label: 'Revert to Draft', icon: FileText, color: 'border-white/20 text-white/40 hover:bg-white/5' },
};

const COMMENT_STATUS_COLORS: Record<CommentStatus, string> = {
  Open: 'text-yellow-300 bg-yellow-500/15 border-yellow-500/30',
  Accepted: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
  Rejected: 'text-red-300 bg-red-500/15 border-red-500/30',
  Resolved: 'text-white/40 bg-white/5 border-white/15',
};

export default function PolicyDetail({ policy, onBack, onUpdatePolicy }: PolicyDetailProps) {
  const [activeTab, setActiveTab] = useState<'policy' | 'procedure' | 'review'>('policy');
  const [newComment, setNewComment] = useState('');
  const [newSuggestion, setNewSuggestion] = useState('');
  const [reviewerName, setReviewerName] = useState('Reviewer');

  const transitions = STATUS_TRANSITIONS[policy.status];

  function transitionStatus(newStatus: PolicyStatus) {
    onUpdatePolicy({
      ...policy,
      status: newStatus,
      lastUpdated: new Date().toISOString().split('T')[0],
      ...(newStatus === 'Approved' ? { approvedBy: reviewerName, approvedAt: new Date().toISOString() } : {}),
      ...(newStatus === 'Published' ? { publishToMasterFile: true } : {}),
    });
  }

  function addComment() {
    if (!newComment.trim()) return;
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
      ...policy,
      reviewerComments: [...policy.reviewerComments, comment],
      lastUpdated: new Date().toISOString().split('T')[0],
    });
    setNewComment('');
    setNewSuggestion('');
  }

  function updateCommentStatus(commentId: string, status: CommentStatus) {
    onUpdatePolicy({
      ...policy,
      reviewerComments: policy.reviewerComments.map(c =>
        c.id === commentId ? { ...c, status, resolvedAt: status === 'Resolved' ? new Date().toISOString() : c.resolvedAt } : c
      ),
    });
  }

  const tabs = [
    { id: 'policy' as const, label: 'Policy Body' },
    { id: 'procedure' as const, label: 'Procedures' },
    { id: 'review' as const, label: `Review (${policy.reviewerComments.length})` },
  ];

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Library
        </button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-[#00F0FF] text-sm font-bold">{policy.policyId}</span>
              <TierBadge tier={policy.tier} />
              <StatusBadge status={policy.status} />
            </div>
            <h1 className="text-xl font-bold text-white leading-snug">{policy.title}</h1>
            <p className="text-white/40 text-sm mt-1">{policy.briefDescription}</p>
          </div>

          {/* Status transition actions */}
          {transitions.length > 0 && (
            <div className="flex flex-wrap gap-2 shrink-0">
              {transitions.map(nextStatus => {
                const action = STATUS_ACTIONS[nextStatus];
                const Icon = action.icon;
                return (
                  <button
                    key={nextStatus}
                    onClick={() => transitionStatus(nextStatus)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${action.color}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <GlassCard className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
          {[
            { label: 'Domain', value: `${policy.domainCode} — ${policy.domain}` },
            { label: 'Subdomain', value: `${policy.subdomainCode} — ${policy.subdomain}` },
            { label: 'Version', value: `v${policy.version}` },
            { label: 'Last Updated', value: policy.lastUpdated },
            { label: 'Approved By', value: policy.approvedBy || '—' },
            { label: 'SCORM', value: policy.publishToScorm ? 'Queued' : 'Not queued' },
          ].map(item => (
            <div key={item.label}>
              <div className="text-white/30 uppercase tracking-wider text-[9px] font-semibold mb-0.5">{item.label}</div>
              <div className="text-white/70 font-medium">{item.value}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 pb-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-[#00F0FF] text-[#00F0FF]'
                : 'border-transparent text-white/40 hover:text-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'policy' && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/70 font-semibold text-sm uppercase tracking-wider">Policy Body</h3>
            <button className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-lg transition-all">
              <Edit3 className="w-3 h-3" /> Edit Content
            </button>
          </div>
          <div className="min-h-[200px] p-4 bg-white/[0.02] rounded-lg border border-white/[0.06] text-white/50 text-sm leading-relaxed italic">
            {policy.policyBody}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-white/70 font-semibold text-sm uppercase tracking-wider mb-3">Training Content</div>
            <div className="p-4 bg-white/[0.02] rounded-lg border border-white/[0.06] text-white/40 text-sm leading-relaxed italic">
              {policy.trainingContent}
            </div>
          </div>
        </GlassCard>
      )}

      {activeTab === 'procedure' && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/70 font-semibold text-sm uppercase tracking-wider">Procedures</h3>
            <button className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-lg transition-all">
              <Edit3 className="w-3 h-3" /> Edit Procedures
            </button>
          </div>
          <div className="min-h-[200px] p-4 bg-white/[0.02] rounded-lg border border-white/[0.06] text-white/50 text-sm leading-relaxed italic">
            {policy.procedureBody}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-white/70 font-semibold text-sm uppercase tracking-wider mb-3">Revision Notes</div>
            <div className="p-4 bg-white/[0.02] rounded-lg border border-white/[0.06] text-white/40 text-sm leading-relaxed">
              {policy.revisionNotes}
            </div>
          </div>
        </GlassCard>
      )}

      {activeTab === 'review' && (
        <div className="space-y-4">
          {/* Add comment */}
          <GlassCard className="p-5">
            <h3 className="text-white/70 font-semibold text-sm uppercase tracking-wider mb-4">Add Review Comment</h3>
            <div className="space-y-3">
              <div>
                <label className="text-white/35 text-[10px] uppercase tracking-wider font-semibold block mb-1">Reviewer Name</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={e => setReviewerName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg text-white/70 text-sm px-3 py-2 focus:outline-none focus:border-[#00F0FF]/40"
                />
              </div>
              <div>
                <label className="text-white/35 text-[10px] uppercase tracking-wider font-semibold block mb-1">Comment</label>
                <textarea
                  rows={3}
                  placeholder="Enter review comment…"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg text-white/70 text-sm px-3 py-2 focus:outline-none focus:border-[#00F0FF]/40 resize-none"
                />
              </div>
              <div>
                <label className="text-white/35 text-[10px] uppercase tracking-wider font-semibold block mb-1">Suggested Change <span className="normal-case text-white/25">(optional)</span></label>
                <textarea
                  rows={2}
                  placeholder="Describe the suggested change…"
                  value={newSuggestion}
                  onChange={e => setNewSuggestion(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg text-white/70 text-sm px-3 py-2 focus:outline-none focus:border-[#00F0FF]/40 resize-none"
                />
              </div>
              <button
                onClick={addComment}
                disabled={!newComment.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#00F0FF]/40 text-[#00F0FF] text-sm font-semibold hover:bg-[#00F0FF]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-3.5 h-3.5" /> Add Comment
              </button>
            </div>
          </GlassCard>

          {/* Existing comments */}
          {policy.reviewerComments.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <p className="text-white/25 text-sm">No review comments yet.</p>
            </GlassCard>
          ) : (
            policy.reviewerComments.map(comment => (
              <GlassCard key={comment.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white/70 font-semibold text-sm">{comment.reviewerName}</span>
                      <span className="text-white/30 text-xs">·</span>
                      <span className="text-white/30 text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${COMMENT_STATUS_COLORS[comment.status]}`}>
                        {comment.status}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">{comment.commentText}</p>
                    {comment.suggestedChange && (
                      <div className="mt-2 pl-3 border-l-2 border-[#00F0FF]/30">
                        <p className="text-[#00F0FF]/60 text-xs italic">{comment.suggestedChange}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {(['Open', 'Accepted', 'Rejected', 'Resolved'] as CommentStatus[])
                      .filter(s => s !== comment.status)
                      .map(s => (
                        <button
                          key={s}
                          onClick={() => updateCommentStatus(comment.id, s)}
                          className="px-2 py-1 rounded text-[10px] border border-white/10 text-white/35 hover:text-white/60 hover:border-white/25 transition-all"
                        >
                          {s}
                        </button>
                      ))}
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}
    </div>
  );
}
