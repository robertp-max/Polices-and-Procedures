import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, MessageSquare, Shield, ArrowRight } from 'lucide-react';
import { Button, Badge } from '../../primitives';
import { useThreadStore } from '@/policy/help-center/threads';
import { buildThreadList } from '@/policy/help-center/threads/threadView';
import { ThreadCard } from '@/policy/help-center/threads/ThreadCard';
import { useThreadActor } from '@/policy/help-center/threads/useThreadActor';
import {
  listCommunityUsers,
  getProfileVisibility,
  canViewCommunityProfile,
} from '../../utils/communityProfileAdapter';
import {
  getUserBadges,
  BADGES_TODO,
  giveCommendation,
  getCommendations,
  COMMEND_CATEGORIES,
  type CommendationCategory,
} from '../../utils/communityBadges';
import { PHI_FIELD_WARNING, scanForPhi, type PhiScanResult } from '@/policy/help-center/threads/threadPhiGuard';
import { useAuth } from '@/auth/AuthProvider';

/**
 * Community hub screen.
 * Connects existing Threads (Help Center store), Profile visibility adapter, and future Journey achievements.
 * No fake posts or members. Uses real adapter + persisted thread data only.
 * /community = hub + recent threads + members preview + guidelines
 * /community/members focuses on directory.
 */
export function CommunityScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const actor = useThreadActor();

  const isMembersView = location.pathname === '/community/members' || location.pathname.endsWith('/members');

  const threads = useThreadStore((s) => s.threads);
  const viewer = user ? { userId: user.id || 'demo-user', role: user.role, displayName: user.name || user.email || 'You' } : null;

  // Recent non-duplicate threads (real persisted data only)
  const recentThreads = useMemo(() => {
    const list = buildThreadList(threads, {
      filter: 'all',
      sort: 'recent',
      search: '',
      userId: actor.userId,
      isAdmin: actor.isAdmin,
      includeDuplicates: false,
    });
    return list.slice(0, 6);
  }, [threads, actor.userId, actor.isAdmin]);

  // Members from existing adapter (demo seeds + visibility)
  const allMembers = useMemo(() => listCommunityUsers(), []);

  const visibleMembers = useMemo(
    () =>
      allMembers.filter((m) => {
        const vis = getProfileVisibility(m.userId);
        const allowed = canViewCommunityProfile(viewer, m.userId, vis) || m.userId === (viewer?.userId ?? '');
        return allowed;
      }),
    [allMembers, viewer],
  );

  // Real badge/commend data per visible member (respect visibility: owner/admin see all, others only public)
  const getMemberRecognition = (m: { userId: string }) => {
    const isOwnerOrAdmin = m.userId === actor.userId || actor.isAdmin;
    const bs = getUserBadges(m.userId, isOwnerOrAdmin);
    const cs = getCommendations(m.userId, isOwnerOrAdmin).filter((c: any) => c.status === 'approved');
    return { badges: bs, commCount: cs.length };
  };

  const openThread = (id: string) => navigate(`/help/threads/${id}`);
  const viewProfile = (userId: string) => navigate(`/community/users/${userId}`);
  const startThread = () => navigate('/help/threads/new');
  const viewAllMembers = () => navigate('/community/members');
  const viewAllThreads = () => navigate('/help/threads');

  // Phase 2A: Peer commendation composer state (lightweight)
  const [commendRecipient, setCommendRecipient] = useState<{ userId: string; displayName: string } | null>(null);
  const [commendMessage, setCommendMessage] = useState('');
  const [commendCategory, setCommendCategory] = useState<CommendationCategory>('Helpful teammate');
  const [commendFeedback, setCommendFeedback] = useState<string>('');
  const [commendPhi, setCommendPhi] = useState<PhiScanResult | null>(null);

  const openCommend = (userId: string, displayName: string) => {
    if (userId === (viewer?.userId ?? '')) return;
    setCommendRecipient({ userId, displayName });
    setCommendMessage('');
    setCommendFeedback('');
    setCommendPhi(null);
  };

  const submitCommend = () => {
    if (!commendRecipient || !viewer) return;
    if (!commendMessage.trim()) {
      setCommendFeedback('Message cannot be empty.');
      return;
    }
    // Use scanForPhi where input (PHASE 9)
    const scan = scanForPhi(commendMessage);
    setCommendPhi(scan.hasPhi ? scan : null);
    if (scan.hasPhi) {
      setCommendFeedback('PHI detected. Please edit to remove before sending.');
      return;
    }
    const res = giveCommendation(
      commendRecipient,
      { userId: viewer.userId || 'demo-user', displayName: viewer.displayName || 'You' },
      commendMessage,
      commendCategory
    );
    if (!res.ok) {
      if (res.reason === 'phi' && res.phi) {
        setCommendFeedback('PHI detected: ' + (res.phi.findings?.[0]?.category || 'sensitive content') + '. Blocked.');
      } else {
        setCommendFeedback(res.reason === 'phi' ? 'PHI-like content blocked.' : 'Could not submit.');
      }
      return;
    }
    setCommendFeedback('Commendation submitted for review. Thank you!');
    setCommendPhi(null);
    setTimeout(() => {
      setCommendRecipient(null);
      setCommendMessage('');
      setCommendFeedback('');
    }, 1200);
  };

  const cancelCommend = () => {
    setCommendRecipient(null);
    setCommendMessage('');
    setCommendFeedback('');
    setCommendPhi(null);
  };

  const Guidelines = (
    <div className="rounded-2xl border border-hairline bg-surface p-4 text-sm">
      <div className="flex items-center gap-2 text-brand-teal font-medium mb-2">
        <Shield className="h-4 w-4" /> Community Guidelines
      </div>
      <ul className="list-disc pl-5 space-y-1 text-muted text-[13px]">
        <li>No PHI. Never post patient names, IDs, clinical details, or any protected information.</li>
        <li>Internal Care Indeed staff only.</li>
        <li>Thread posts are visible to authenticated employees even if your profile is set to Private.</li>
        <li>Be constructive. Use Help Center threads for operational questions and improvements.</li>
        <li>Profile visibility controls who can see your full profile page (public vs private). Thread content stays public internally.</li>
      </ul>
    </div>
  );

  const MembersDirectory = (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Users className="h-5 w-5 text-brand-teal" /> Members
        </h3>
        {!isMembersView && (
          <Button size="sm" variant="secondary" onClick={viewAllMembers}>
            View all <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>

      {visibleMembers.length === 0 ? (
        <div className="text-sm text-muted">No members visible under current visibility rules.</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {visibleMembers.slice(0, isMembersView ? 50 : 4).map((m) => {
            const vis = getProfileVisibility(m.userId);
            // visibility already filtered above; this is just for display pill
            const rec = getMemberRecognition(m);
            return (
              <div
                key={m.userId}
                className="rounded-xl border border-hairline bg-white p-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
              >
                <div>
                  <div className="font-medium text-ink flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-teal/10 text-sm font-semibold text-brand-teal-deep ring-1 ring-inset ring-brand-teal/20">
                      {m.initials}
                    </span>
                    {m.displayName}
                    {m.isCurrentUser && <Badge size="sm">You</Badge>}
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    {m.jobTitle || '—'} {m.department ? `• ${m.department}` : ''}
                  </div>
                  <div className="text-[11px] text-muted mt-1">
                    {m.accessLevel || m.role || '—'}
                  </div>
                  {/* Real badges on Community member cards (subtle chips or count). Respect visibility. No fakes. */}
                  {(rec.badges.length > 0 || rec.commCount > 0) && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {rec.badges.slice(0, 2).map((b: any) => (
                        <Badge key={b.id} size="sm">{b.label}</Badge>
                      ))}
                      {rec.badges.length > 2 && (
                        <Badge size="sm" variant="count">+{rec.badges.length - 2}</Badge>
                      )}
                      {rec.commCount > 0 && (
                        <Badge size="sm" variant="count" title="approved commendations">{rec.commCount}</Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="sm:text-right text-xs">
                  <span className={`inline-block rounded px-2 py-0.5 ${vis === 'private' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {vis}
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button size="sm" variant="tertiary" onClick={() => viewProfile(m.userId)}>
                      View profile
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => openCommend(m.userId, m.displayName)}>
                      Commend
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="text-[11px] text-muted">Uses existing profile adapter. No fabricated bios, stats, or credentials. Private profiles limited to owner + admins.</div>
    </section>
  );

  const ThreadsFeed = (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-brand-teal" /> Recent Discussions
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={viewAllThreads}>
            All threads
          </Button>
          <Button size="sm" onClick={startThread}>
            Start thread
          </Button>
        </div>
      </div>

      {recentThreads.length === 0 ? (
        <div className="rounded-lg border border-hairline bg-surface p-6 text-center text-sm text-muted">
          No threads yet. Real data only — start the first discussion (no PHI).
          <div className="mt-3">
            <Button size="sm" onClick={startThread}>Start a thread</Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-2">
          {recentThreads.map((t) => (
            <ThreadCard key={t.id} thread={t} onOpen={openThread} />
          ))}
        </div>
      )}
      <div className="text-[11px] text-muted">Threads are real persisted data from the Help Center store. No sample posts.</div>
    </section>
  );

  return (
    <section className="grid gap-xl max-w-5xl mx-auto p-6" data-group="System" data-hash-id={isMembersView ? 'community-members' : 'community'} data-route={location.pathname}>
      <div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand-teal/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-brand-teal-deep" />
          </div>
          <div>
            <h1 className="text-2xl font-medium tracking-tight">Community</h1>
            <p className="text-sm text-muted">Staff hub — threads, members, and achievements. No PHI.</p>
          </div>
        </div>
      </div>

      {Guidelines}

      {!isMembersView && ThreadsFeed}

      {MembersDirectory}

      {isMembersView && (
        <div className="text-xs text-muted">Full member directory view. Return to <button className="underline" onClick={() => navigate('/community')}>Community hub</button>.</div>
      )}

      {/* Phase 2A: Commend composer (lightweight, shown when selected) */}
      {commendRecipient && (
        <section className="rounded-2xl border border-hairline bg-surface p-4">
          <div className="font-medium mb-2">Commend {commendRecipient.displayName}</div>
          <div className="rounded-md border border-tone-amber-border bg-tone-amber-bg p-sm text-xs text-tone-amber-text mb-2">
            {PHI_FIELD_WARNING}
          </div>
          <select
            value={commendCategory}
            onChange={(e) => setCommendCategory(e.target.value as CommendationCategory)}
            className="mb-2 block w-full rounded border p-1 text-sm"
          >
            {COMMEND_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <textarea
            value={commendMessage}
            onChange={(e) => { const v = e.target.value; setCommendMessage(v); setCommendPhi(scanForPhi(v).hasPhi ? scanForPhi(v) : null); }}
            placeholder="What did they do well? (keep positive and general)"
            className="w-full rounded border p-2 text-sm h-20"
          />
          {commendPhi && (
            <div className="rounded-md border border-tone-red-border bg-tone-red-bg p-sm text-xs text-tone-red-text mt-1">
              Possible PHI detected. Edit to remove.
            </div>
          )}
          {commendFeedback && <div className="text-xs mt-1 text-brand-teal">{commendFeedback}</div>}
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" onClick={submitCommend} disabled={!!commendPhi}>Send commendation</Button>
            <Button size="sm" variant="tertiary" onClick={cancelCommend}>Cancel</Button>
          </div>
        </section>
      )}

      {/* Phase 1 badge area - uses real sources only; currently empty unless awarded */}
      <section>
        <h3 className="text-sm font-medium mb-2">Recognition (badges)</h3>
        <div className="text-xs text-muted rounded border border-hairline p-3">
          Badges appear here when earned from real sources (Journey completions, helpful thread marks, peer commendations, admin awards).
          {' '}{BADGES_TODO}
          {visibleMembers.length > 0 && (() => {
            const viewerId = actor.userId;
            const sample = visibleMembers.find((mm) => mm.userId === viewerId) || visibleMembers[0];
            const count = sample ? getUserBadges(sample.userId, sample.userId === viewerId || actor.isAdmin).length : 0;
            return count === 0 ? ' No badges awarded yet in this session.' : '';
          })()}
        </div>
      </section>

      {/* Phase 2A: Recent recognition (approved commendations only) — real data from visible members + viewer, no hardcoded fakes */}
      <section>
        <h3 className="text-sm font-medium mb-2">Recent recognition</h3>
        {(() => {
          const recent: any[] = [];
          const idsToCheck = new Set<string>([actor.userId, ...visibleMembers.map((mm) => mm.userId)]);
          idsToCheck.forEach((id) => {
            const isOwnerOrAdmin = id === actor.userId || actor.isAdmin;
            const cs = getCommendations(id, isOwnerOrAdmin);
            cs.filter((c: any) => c.status === 'approved').slice(0, 1).forEach((c: any) => recent.push(c));
          });
          if (recent.length === 0) {
            return <div className="text-xs text-muted">No commendations yet. Recognize a teammate for helpful support.</div>;
          }
          return (
            <div className="grid gap-2 text-sm">
              {recent.slice(0, 4).map((c, i) => (
                <div key={i} className="border rounded p-2 bg-surface text-xs">"{c.message}" — {c.category} to {c.recipientDisplayName}</div>
              ))}
            </div>
          );
        })()}
      </section>

      <div className="pt-4 border-t text-[11px] text-muted">
        Community connects existing Profile visibility, Help Center Threads, and (future) Journey achievements. Profile privacy does not hide thread content.
      </div>
    </section>
  );
}

export default CommunityScreen;
