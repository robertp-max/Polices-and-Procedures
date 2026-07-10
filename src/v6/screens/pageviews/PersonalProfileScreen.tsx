import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { cx } from '../../utils/classNames';
import { PersonalStandaloneLayout } from '../../shell/PersonalStandaloneLayout';
import {
  type BasicUserProfile,
  type ProfileVisibility,
  getBasicUserProfile,
  setProfileVisibility,
  canViewCommunityProfile,
  COMMUNITY_PROFILE_TODO,
} from '../../utils/communityProfileAdapter';
import { useThreadStore } from '@/policy/help-center/threads';
import { buildThreadList } from '@/policy/help-center/threads/threadView';
import { ThreadCard } from '@/policy/help-center/threads/ThreadCard';
import { useJourneyProfileAchievements } from '../../utils/journeyProfileAdapter';
import { getCommendations, getUserBadges, giveCommendation, COMMEND_CATEGORIES, type CommendationCategory } from '../../utils/communityBadges';
import { isAdminRole } from '../../utils/adminRoleHelper';
import { Badge } from '../../primitives';
import { PHI_FIELD_WARNING, scanForPhi, type PhiScanResult } from '@/policy/help-center/threads/threadPhiGuard';
import { workspaceCompactTabClass, workspaceTabActiveClass, workspaceTabInactiveClass } from './workspaceTabChrome';

// Re-export for backward compat with previous work
export type { BasicUserProfile, ProfileVisibility };

type TabKey = 'overview' | 'threads' | 'community' | 'availability' | 'credentials';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'threads', label: 'Threads' },
  { key: 'community', label: 'Community activity' },
  { key: 'availability', label: 'Availability' },
  { key: 'credentials', label: 'Credentials / Competencies' },
];

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        workspaceCompactTabClass,
        active ? workspaceTabActiveClass : workspaceTabInactiveClass,
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-hairline bg-surface p-6 text-center">
      <div className="text-sm font-medium text-ink">{title}</div>
      {children && <div className="mt-2 text-xs text-muted">{children}</div>}
    </div>
  );
}

function ProfileHeader({ profile, badges = [] }: { profile: BasicUserProfile & { visibility?: ProfileVisibility }; badges?: Array<{ id: string; label: string; hidden?: boolean }> }) {
  const vis = profile.visibility ?? 'private';
  // badges passed already filtered by getUserBadges(isOwnerOrAdmin); owner/admin see hidden-flagged too if applicable.
  const displayBadges = badges;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-teal/10 text-2xl font-semibold text-brand-teal-deep ring-1 ring-inset ring-brand-teal/20"
          aria-hidden
        >
          {profile.initials}
        </div>
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-brand-teal">Personal profile</div>
          <h1 className="text-3xl font-medium tracking-[-0.01em] text-ink">{profile.displayName}</h1>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-muted">
            {profile.jobTitle && <span>{profile.jobTitle}</span>}
            {profile.department && <span className="text-hairline">•</span>}
            {profile.department && <span>{profile.department}</span>}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-teal/10 px-2.5 py-0.5 text-[10px] font-medium tracking-wider text-brand-teal-deep ring-1 ring-inset ring-brand-teal/15">
              Internal profile
            </span>
            {profile.accessLevel && (
              <span className="rounded-full border border-hairline px-2.5 py-0.5 text-[10px] font-medium tracking-wider text-ink/70">
                {profile.accessLevel}
              </span>
            )}
            {profile.isCurrentUser && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">You</span>
            )}
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider ${vis === 'private' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {vis === 'private' ? 'Private' : 'Public'}
            </span>
          </div>
          {/* Real badges on Profile header (subtle chips; use Badge component; respect visibility from getUserBadges call) */}
          {displayBadges.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {displayBadges.slice(0, 3).map((b) => (
                <Badge key={b.id} size="sm">{b.label}</Badge>
              ))}
              {displayBadges.length > 3 && <Badge size="sm" variant="count">+{displayBadges.length - 3}</Badge>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IdentityCard({ profile }: { profile: BasicUserProfile & { visibility?: ProfileVisibility } }) {
  const rows = [
    { label: 'Name', value: profile.displayName },
    { label: 'Job title', value: profile.jobTitle || '—' },
    { label: 'Department', value: profile.department || '—' },
    { label: 'Access / role', value: profile.accessLevel || profile.role || '—' },
    { label: 'Profile visibility', value: (profile.visibility ?? 'private') === 'private' ? 'Private' : 'Public' },
  ];
  return (
    <div className="mt-6 rounded-2xl border border-hairline bg-white p-5 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wider text-muted mb-3">Identity</div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-col">
            <dt className="text-[10px] uppercase tracking-wider text-muted">{r.label}</dt>
            <dd className="text-sm font-medium text-ink mt-px">{r.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 text-[11px] text-muted">Only fields available from current user model are shown. Rich profile data is not yet connected.</div>
    </div>
  );
}

function OverviewTab({ profile }: { profile: BasicUserProfile & { visibility?: ProfileVisibility } }) {
  return (
    <div className="space-y-6">
      <IdentityCard profile={profile} />

      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-muted mb-2">About</div>
        <EmptyState title="No profile bio added yet." />
      </div>

      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-muted mb-2">Skills &amp; specialties</div>
        <EmptyState title="No skills listed yet." />
      </div>

      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-muted mb-2">Community stats</div>
        <EmptyState title="Community stats will appear here once activity is available." />
      </div>
    </div>
  );
}

function ThreadsTab({ userId, isSelf = false }: { userId: string; isSelf?: boolean }) {
  const navigate = useNavigate();
  const threads = useThreadStore((s) => s.threads);
  const messages = useThreadStore((s) => s.messages);

  const authoredThreads = useMemo(() => {
    const list = buildThreadList(threads, {
      filter: 'all',
      sort: 'recent',
      search: '',
      userId,
      isAdmin: false,
      includeDuplicates: false,
    });
    return list.filter((t) => t.createdByUserId === userId).slice(0, 8);
  }, [threads, userId]);

  // Collect threads where this user replied (via messages)
  const repliedThreadIds = useMemo(() => {
    const ids = new Set<string>();
    messages
      .filter((m) => m.authorUserId === userId && (m.authorType === 'user' || m.authorType === 'admin'))
      .forEach((m) => ids.add(m.threadId));
    return Array.from(ids);
  }, [messages, userId]);

  const repliedThreads = useMemo(() => {
    return threads
      .filter((t) => repliedThreadIds.includes(t.id) && !authoredThreads.some((at) => at.id === t.id))
      .slice(0, 6);
  }, [threads, repliedThreadIds, authoredThreads]);

  const openThread = (id: string) => navigate(`/help/threads/${id}`);

  if (authoredThreads.length === 0 && repliedThreads.length === 0) {
    return (
      <EmptyState title="Thread activity will appear here once this user participates in threads.">
        {isSelf ? (
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            <button onClick={() => navigate('/help/threads/new')} className="text-xs px-2 py-1 border rounded hover:bg-surface min-h-tap">Start a thread</button>
            <button onClick={() => navigate('/community')} className="text-xs px-2 py-1 border rounded hover:bg-surface min-h-tap">Visit Community</button>
          </div>
        ) : null}
        <div className="mt-1">Phase 1 uses real thread sources only. No fabricated activity. Threads remain public internally.</div>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-4">
      {authoredThreads.length > 0 && (
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted mb-2">Threads started</div>
          <div className="grid gap-2">
            {authoredThreads.map((t) => (
              <ThreadCard key={t.id} thread={t} onOpen={openThread} />
            ))}
          </div>
        </div>
      )}

      {repliedThreads.length > 0 && (
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted mb-2">Threads with your replies</div>
          <div className="grid gap-2">
            {repliedThreads.map((t) => (
              <ThreadCard key={t.id} thread={t} onOpen={openThread} />
            ))}
          </div>
        </div>
      )}
      <div className="text-[11px] text-muted">Real data from Help Center thread store. Click thread to open full discussion (threads are public internally).</div>
    </div>
  );
}

function CommunityActivityTab({ userId, isSelf, isAdmin = false }: { userId: string; isSelf: boolean; isAdmin?: boolean }) {
  const navigate = useNavigate();
  const threads = useThreadStore((s) => s.threads);
  const messages = useThreadStore((s) => s.messages);

  const started = threads.filter((t) => t.createdByUserId === userId).length;
  const replied = new Set(messages.filter((m) => m.authorUserId === userId).map((m) => m.threadId)).size;

  const isOwnerOrAdmin = isSelf || isAdmin;
  const badges = getUserBadges(userId, isOwnerOrAdmin);
  const comms = getCommendations(userId, isOwnerOrAdmin).filter((c: any) => c.status === 'approved');
  const journey = useJourneyProfileAchievements(userId);

  const totalBadges = badges.length;
  const totalComms = comms.length;
  const totalJourney = journey.length;

  if (started === 0 && replied === 0 && totalBadges === 0 && totalComms === 0 && totalJourney === 0) {
    return (
      <EmptyState title="No community activity yet.">
        {isSelf ? (
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            <button onClick={() => navigate('/help/threads/new')} className="text-xs px-2 py-1 border rounded hover:bg-surface min-h-tap">Start a thread</button>
            <button onClick={() => navigate('/community')} className="text-xs px-2 py-1 border rounded hover:bg-surface min-h-tap">Visit Community</button>
          </div>
        ) : null}
        <div className="mt-1 text-[10px]">Real activity only (threads, badges from approved sources, Journey). No fabricated data.</div>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>Threads started: <span className="font-medium">{started}</span></div>
        <div>Threads replied: <span className="font-medium">{replied}</span></div>
        <div>Badges earned: <span className="font-medium">{totalBadges}</span></div>
        <div>Commendations received: <span className="font-medium">{totalComms}</span></div>
        <div>Journey achievements: <span className="font-medium">{totalJourney}</span></div>
      </div>
      {isSelf && (
        <div className="text-[11px] text-muted mt-1">
          Real aggregates from threads, badges, and mapped Journey data only.
        </div>
      )}
    </div>
  );
}

function AvailabilityTab({ isSelf }: { isSelf: boolean }) {
  return (
    <div className="space-y-3">
      <EmptyState title="No availability posted yet." />
      {isSelf ? (
        <div className="text-center text-[11px] text-muted">Availability management coming soon.</div>
      ) : null}
    </div>
  );
}

function CredentialsTab({ profileUserId }: { profileUserId: string }) {
  const achievements = useJourneyProfileAchievements(profileUserId);

  if (achievements.length === 0) {
    return (
      <EmptyState title="Credentials and competencies are not connected yet.">
        Real training, license, and competency data will appear here when wired.
        <div className="mt-1 text-[11px]">Journey achievements appear only for mapped positive completions (no deficiencies, no fakes).</div>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs font-medium uppercase tracking-wider text-muted mb-2">Journey achievements (positive only)</div>
      <div className="grid gap-2">
        {achievements.map((a) => (
          <div key={a.id} className="rounded-lg border border-hairline bg-white p-3 text-sm flex items-start gap-3">
            <div className="mt-0.5 text-brand-teal">★</div>
            <div>
              <div className="font-medium text-ink">{a.label}</div>
              {a.detail && <div className="text-xs text-muted">{a.detail}</div>}
              {a.completedAt && <div className="text-[10px] text-muted mt-0.5">Completed {new Date(a.completedAt).toLocaleDateString()}</div>}
              <div className="text-[10px] text-muted mt-1">Source: {a.source}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-[10px] text-muted">Only verified positive completions from Journey. Identity mapping between users and training records is a known gap (see adapter).</div>
    </div>
  );
}

export function PersonalProfileScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ userId?: string }>();
  const { user } = useAuth();

  const viewerId = user?.id || 'demo-user';
  const viewerRole = user?.role;

  // Phase 2A commend state for this profile
  const [showCommend, setShowCommend] = useState(false);
  const [commendMsg, setCommendMsg] = useState('');
  const [commendCat, setCommendCat] = useState<CommendationCategory>('Helpful teammate');
  const [commendMsgFeedback, setCommendMsgFeedback] = useState('');
  const [commendPhi, setCommendPhi] = useState<PhiScanResult | null>(null);

  const routeUserId = params.userId || 'demo-user';
  // Use adapter for profile (visibility + fields). For /personal/profile we treat "me" as demo-user or route param.
  const baseProfile = getBasicUserProfile(routeUserId, viewerId);

  const canView = canViewCommunityProfile({ userId: viewerId, role: viewerRole }, baseProfile.userId, baseProfile.visibility);

  // Effective profile for rendering (still limited real data)
  const profile: BasicUserProfile = {
    ...baseProfile,
    isCurrentUser: baseProfile.userId === viewerId,
  };

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [localVis, setLocalVis] = useState<ProfileVisibility>(profile.visibility);

  const from = (location.state as { from?: string } | null)?.from;
  const goBackToApp = () => {
    if (from && from !== location.pathname) {
      navigate(from);
    } else {
      navigate('/dashboard');
    }
  };

  const isSelf = profile.isCurrentUser;
  const isAdminViewer = isAdminRole(viewerRole);

  // Real badges + commends for header + recognition. Use helpers; owner/admin see hidden, public views respect visibility.
  const isOwnerOrAdminForBadges = isSelf || isAdminViewer;
  const profileBadges = getUserBadges(profile.userId, isOwnerOrAdminForBadges);
  const profileComms = getCommendations(profile.userId, isOwnerOrAdminForBadges);

  const handleVisibilityChange = (newVis: ProfileVisibility) => {
    if (!isSelf && !isAdminViewer) return;
    setLocalVis(newVis);
    setProfileVisibility(profile.userId, newVis);
    // Re-read to reflect
    // (in real app would refetch; here trigger small re-render by state)
  };

  // Phase 2A: give commendation (positive only, PHI check)
  const submitProfileCommend = () => {
    if (!profile || isSelf) return;
    if (!commendMsg.trim()) {
      setCommendMsgFeedback('Message required.');
      return;
    }
    // Use scanForPhi where input (PHASE 9 safety for commend composer)
    const scan = scanForPhi(commendMsg);
    setCommendPhi(scan.hasPhi ? scan : null);
    if (scan.hasPhi) {
      setCommendMsgFeedback('PHI detected. Edit to remove.');
      return;
    }
    const res = giveCommendation(
      { userId: profile.userId, displayName: profile.displayName },
      { userId: viewerId, displayName: user?.name || 'You' },
      commendMsg,
      commendCat
    );
    if (res.ok) {
      setCommendMsgFeedback('Sent!');
      setCommendPhi(null);
      setTimeout(() => { setShowCommend(false); setCommendMsg(''); setCommendMsgFeedback(''); }, 900);
    } else {
      if (res.reason === 'phi' && res.phi) {
        setCommendMsgFeedback('PHI detected (' + (res.phi.findings?.[0]?.category || 'sensitive') + '). Blocked.');
      } else {
        setCommendMsgFeedback(res.reason === 'phi' ? 'PHI-like content blocked.' : 'Could not send.');
      }
    }
  };

  // If cannot view private profile (and not owner/admin), show limited state
  if (!canView) {
    return (
      <PersonalStandaloneLayout>
        <div className="mx-auto w-full max-w-3xl px-5 pt-14 pb-20 sm:pt-16">
          <div className="rounded-2xl border border-hairline bg-surface p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-teal/10 text-2xl text-brand-teal-deep">
              {profile.initials}
            </div>
            <h1 className="text-xl font-medium text-ink">This profile is private.</h1>
            <p className="mt-3 text-sm text-muted max-w-md mx-auto">
              Only the owner and connected users (or administrators) can view this profile.
            </p>
            <p className="mt-4 text-xs text-muted max-w-md mx-auto">
              Thread posts remain public to Care Indeed employees.
            </p>
            <button
              type="button"
              onClick={goBackToApp}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-hairline bg-white px-4 py-2 text-sm font-medium hover:bg-surface-glass"
            >
              Back to app
            </button>
          </div>
          <div className="mt-4 text-center text-[10px] text-muted">{COMMUNITY_PROFILE_TODO}</div>
        </div>
      </PersonalStandaloneLayout>
    );
  }

  const effectiveVisibility = localVis; // reflects live toggle

  return (
    <PersonalStandaloneLayout>
      <div className="mx-auto w-full max-w-3xl px-5 pt-14 pb-20 sm:pt-16">
        <div className="flex items-start justify-between gap-4">
          <ProfileHeader profile={{ ...profile, visibility: effectiveVisibility }} badges={profileBadges} />
        </div>

        {/* Visibility control / badge + note about threads */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-3 py-1 text-xs">
            <span className="font-medium text-ink">Profile visibility:</span>
            <span className={`rounded px-2 py-0.5 text-[10px] font-semibold tracking-wider ${effectiveVisibility === 'private' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {effectiveVisibility === 'private' ? 'Private' : 'Public'}
            </span>
          </div>

          {(isSelf || isAdminViewer) && (
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleVisibilityChange('private')}
                className={`rounded border px-2.5 py-1 min-h-tap transition ${effectiveVisibility === 'private' ? 'border-brand-teal bg-brand-teal/10 text-brand-teal-deep' : 'border-hairline hover:bg-surface-glass'}`}
                aria-pressed={effectiveVisibility === 'private'}
              >
                Private
              </button>
              <button
                type="button"
                onClick={() => handleVisibilityChange('public')}
                className={`rounded border px-2.5 py-1 min-h-tap transition ${effectiveVisibility === 'public' ? 'border-brand-teal bg-brand-teal/10 text-brand-teal-deep' : 'border-hairline hover:bg-surface-glass'}`}
                aria-pressed={effectiveVisibility === 'public'}
              >
                Public
              </button>
            </div>
          )}

          <div className="text-[10px] text-muted max-w-prose">
            {effectiveVisibility === 'private'
              ? 'Only you and connected users can view your profile.'
              : 'Care Indeed employees can view your profile.'}
            {' '}Thread posts remain public to Care Indeed employees.
          </div>
        </div>

        {/* Focused actions (only real, non-dead actions) */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={goBackToApp}
            className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-surface-glass"
          >
            Back to app
          </button>
          {!isSelf && (
            <button
              type="button"
              onClick={() => { const next = !showCommend; setShowCommend(next); if (!next) { setCommendPhi(null); setCommendMsg(''); setCommendMsgFeedback(''); } }}
              className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-surface-glass"
            >
              Commend teammate
            </button>
          )}
        </div>

        {/* Phase 2A commend composer */}
        {showCommend && !isSelf && (
          <div className="mt-3 rounded border border-hairline bg-surface p-3 text-sm">
            <div className="rounded-md border border-tone-amber-border bg-tone-amber-bg p-sm text-xs text-tone-amber-text mb-1">
              {PHI_FIELD_WARNING}
            </div>
            <select value={commendCat} onChange={e => setCommendCat(e.target.value as any)} className="mb-2 text-sm border p-1">
              {COMMEND_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea value={commendMsg} onChange={e => { const v = e.target.value; setCommendMsg(v); setCommendPhi(scanForPhi(v).hasPhi ? scanForPhi(v) : null); }} className="w-full border p-1 h-16 text-sm" placeholder="What did they do well?" />
            {commendPhi && <div className="rounded-md border border-tone-red-border bg-tone-red-bg p-1 text-xs text-tone-red-text mt-1">Possible PHI. Edit to remove before send.</div>}
            {commendMsgFeedback && <div className="text-xs text-brand-teal">{commendMsgFeedback}</div>}
            <div className="mt-2 flex flex-wrap gap-2">
              <button onClick={submitProfileCommend} disabled={!!commendPhi} className="px-3 py-1 border rounded text-sm min-h-tap">Send</button>
              <button onClick={() => {setShowCommend(false); setCommendMsg(''); setCommendMsgFeedback(''); setCommendPhi(null);}} className="px-3 py-1 border rounded text-sm min-h-tap">Cancel</button>
            </div>
          </div>
        )}

        {/* Tabs (only shown when authorized) */}
        <div className="mt-8 border-b border-hairline">
          <div className="flex max-w-full items-stretch overflow-x-auto font-montserrat">
            {TABS.map((t) => (
              <TabButton
                key={t.key}
                active={activeTab === t.key}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </TabButton>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="mt-6">
          {activeTab === 'overview' && <OverviewTab profile={{ ...profile, visibility: effectiveVisibility }} />}
          {activeTab === 'threads' && <ThreadsTab userId={profile.userId} isSelf={isSelf} />}
          {activeTab === 'community' && <CommunityActivityTab userId={profile.userId} isSelf={isSelf} isAdmin={isAdminViewer} />}
          {activeTab === 'availability' && <AvailabilityTab isSelf={isSelf} />}
          {activeTab === 'credentials' && <CredentialsTab profileUserId={profile.userId} />}
        </div>

        {/* Phase 2A: Recognition / Commendations + Badges display — now uses Badge component for subtle chips */}
        <div className="mt-8">
          <div className="text-xs font-medium uppercase tracking-wider text-muted mb-2">Recognition</div>
          {(() => {
            // Use precomputed which respect visibility (owner/admin passed true)
            const comms = profileComms;
            const badges = profileBadges;
            if (comms.length === 0 && badges.length === 0) {
              return <div className="text-sm text-muted">No commendations yet. Recognize helpful teammates from their profile or member card.</div>;
            }
            // For owner/admin: include any hidden-flagged (getUserBadges returns them); for others already filtered. Show all returned.
            const displayBadges = badges; // no extra !hidden filter (respects what helper returned)
            return (
              <div className="space-y-2">
                {displayBadges.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {displayBadges.map((b: any) => (
                      <Badge key={b.id} size="sm">
                        {b.label}{b.hidden ? ' (hidden)' : ''}
                      </Badge>
                    ))}
                  </div>
                )}
                {comms.filter(c => c.status === 'approved').slice(0, 3).map((c: any) => (
                  <div key={c.id} className="text-sm border rounded p-2 bg-surface">
                    <span className="font-medium">{c.category}</span> — {c.message}
                    <div className="text-[10px] text-muted">from {c.senderDisplayName}</div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        <div className="mt-10 text-center text-[10px] text-muted tracking-wider">
          Phase 1 profile shell — uses only fields available from the current user model. No invented data. {COMMUNITY_PROFILE_TODO}
        </div>
      </div>
    </PersonalStandaloneLayout>
  );
}

export default PersonalProfileScreen;
