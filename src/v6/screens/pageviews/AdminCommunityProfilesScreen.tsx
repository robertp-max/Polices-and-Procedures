import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, SurfaceCard, type DataTableColumn } from '../../components';
import { Button, Badge } from '../../primitives';
import { cx } from '../../utils/classNames';
import {
  listCommunityUsers,
  getProfileVisibility,
  setProfileVisibility,
  type ProfileVisibility,
  COMMUNITY_PROFILE_TODO,
} from '../../utils/communityProfileAdapter';
import { useThreadStore } from '@/policy/help-center/threads';
import { getJourneyProfileAchievements } from '../../utils/journeyProfileAdapter';
import { useAuth } from '@/auth/AuthProvider';
import { canManageCommunityProfiles } from '../../utils/adminRoleHelper';
import { getUserBadges, getCommendations, setCommendationStatus } from '../../utils/communityBadges';

interface CommunityProfileRow {
  userId: string;
  name: string;
  jobTitle: string;
  department: string;
  access: string;
  visibility: ProfileVisibility;
  status: string;
  lastUpdated: string;
  threadActivity?: string;
  journeyBadges?: string;
}

export function AdminCommunityProfilesScreen() {
  const { user } = useAuth();

  if (!canManageCommunityProfiles(user)) {
    return (
      <section className="grid gap-xl" data-group="Admin" data-hash-id="admin-community-profiles">
        <div className="rounded-2xl border border-hairline bg-white p-8 text-center">
          <h1 className="text-xl font-medium text-ink mb-2">Access denied</h1>
          <p className="text-sm text-muted">
            Only administrators can manage Community Profiles visibility and directory.
          </p>
          <p className="text-xs text-muted mt-4">
            Thread posts remain public internally to authenticated Care Indeed employees.
          </p>
        </div>
      </section>
    );
  }

  return <AdminCommunityProfilesContent />;
}

function AdminCommunityProfilesContent() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  // Pull from adapter (real seed + persisted visibility)
  const baseProfiles = useMemo(() => {
    void refreshKey;
    return listCommunityUsers();
  }, [refreshKey]);
  const allThreads = useThreadStore((s) => s.threads);

  const rows: CommunityProfileRow[] = useMemo(() => baseProfiles.map((p) => {
    const vis = getProfileVisibility(p.userId);
    const status = vis === 'private' ? 'Private' : 'Active';

    // Real counts from existing stores (safe; no fakes)
    const threadCount = allThreads.filter((t) => t.createdByUserId === p.userId).length;
    const journeyAchievements = getJourneyProfileAchievements(p.userId).length;

    return {
      userId: p.userId,
      name: p.displayName,
      jobTitle: p.jobTitle || '—',
      department: p.department || '—',
      access: p.accessLevel || p.role || '—',
      visibility: vis,
      status,
      lastUpdated: '—',
      // Optional extra columns (real data or explicit gap)
      threadActivity: threadCount > 0 ? String(threadCount) : '—',
      journeyBadges: journeyAchievements > 0 ? String(journeyAchievements) : 'Not connected',
    };
  }), [baseProfiles, allThreads]);

  // PHASE 6 minimal pending commendation review — collect using getCommendations + filter status==='pending'
  // Only visible to admins (screen already guarded). Uses existing model; no new storage or PHI logic.
  const pendingComms = useMemo(() => {
    const pendings: any[] = [];
    baseProfiles.forEach((p) => {
      const cs = getCommendations(p.userId, true).filter((c: any) => c.status === 'pending');
      cs.forEach((c: any) => {
        pendings.push({ ...c, _recipientUserId: c.recipientUserId || p.userId });
      });
    });
    return pendings.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [baseProfiles]);

  const columns: readonly DataTableColumn<CommunityProfileRow>[] = [
    { key: 'name', label: 'Name' },
    { key: 'jobTitle', label: 'Job title' },
    { key: 'department', label: 'Department' },
    { key: 'access', label: 'Access / role' },
    {
      key: 'visibility',
      label: 'Profile visibility',
      render: (row) => (row.visibility === 'private' ? 'Private' : 'Public'),
    },
    { key: 'status', label: 'Community profile status' },
    { key: 'threadActivity', label: 'Thread activity' },
    { key: 'journeyBadges', label: 'Journey achievements' },
    { key: 'lastUpdated', label: 'Last updated' },
  ];

  return (
    <section
      className="grid gap-xl"
      data-group="Admin"
      data-hash-id="admin-community-profiles"
      data-route="/admin/community-profiles"
      data-template="matrix"
    >
      {/* No PageHeader — subnav already identifies the section (per cleanup task) */}
      <div className="sr-only">
        <h1>Community Profiles</h1>
      </div>

      <div className="text-sm text-muted mb-2">
        Manage visibility for internal clinician / staff community profiles. Thread activity remains public.
      </div>

      <div className="rounded-2xl border border-hairline bg-white p-4">
        <DataTable
          columns={columns as any}
          label="Community Profiles directory"
          rows={rows as any}
        />
      </div>

      {/* Admin actions (outside strict DataTable string render) */}
      <div className="grid gap-3">
        {rows.map((row) => (
          <div key={row.userId} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-hairline bg-surface p-3 text-sm">
            <div>
              <span className="font-medium">{row.name}</span>
              <span className="mx-2 text-muted">•</span>
              <span className={cx(row.visibility === 'private' ? 'text-orange-600' : 'text-emerald-600')}>
                {row.visibility}
              </span>
              <span className="ml-3 text-[11px] text-muted">Threads: {row.threadActivity || '—'} • Journey: {row.journeyBadges || '—'}</span>
              {/* Real badges on Admin rows. As admin use viewerIsOwnerOrAdmin=true to respect (see hidden if any). Use Badge component. Subtle chips/count. Also use getCommendations. */}
              {(() => {
                const bs = getUserBadges(row.userId, true);
                const cs = getCommendations(row.userId, true).filter((c: any) => c.status === 'approved').length;
                if (bs.length === 0 && cs === 0) return null;
                return (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {bs.slice(0, 2).map((b: any) => (
                      <Badge key={b.id} size="sm">{b.label}</Badge>
                    ))}
                    {bs.length > 2 && <Badge size="sm" variant="count">+{bs.length - 2}</Badge>}
                    {cs > 0 && <Badge size="sm" variant="count" title="approved commendations">{cs}</Badge>}
                  </div>
                );
              })()}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => navigate('/personal/profile/' + row.userId)}>
                View profile
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const current = getProfileVisibility(row.userId);
                  const next: ProfileVisibility = current === 'private' ? 'public' : 'private';
                  setProfileVisibility(row.userId, next);
                  setRefreshKey((k) => k + 1);
                }}
              >
                Toggle visibility
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* PHASE 6 minimal Admin pending commendation review — simple section below main list + per-profile actions */}
      <div className="mt-2 rounded-2xl border border-hairline bg-white p-4">
        <div className="text-sm font-medium mb-2">Pending Commendations (review)</div>
        <div className="rounded-md border border-tone-amber-border bg-tone-amber-bg p-1 text-[11px] text-tone-amber-text mb-2">All commendations are pre-scanned with scanForPhi at input and are positive-only. No PHI allowed. Threads always public internally.</div>
        {pendingComms.length === 0 ? (
          <div className="text-xs text-muted">No pending commendations at this time.</div>
        ) : (
          <div className="grid gap-3">
            {pendingComms.map((c: any) => (
              <div key={c.id} className="rounded-lg border border-hairline bg-surface p-3 text-sm">
                <div>
                  <span className="font-medium">{c.senderDisplayName}</span>
                  <span className="mx-1 text-muted">→</span>
                  <span className="font-medium">{c.recipientDisplayName}</span>
                </div>
                <div className="text-[11px] text-muted mt-0.5">
                  Category: {c.category} • Date: {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                </div>
                <div className="mt-1 text-sm">“{c.message}”</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setCommendationStatus(c._recipientUserId, c.id, 'approved');
                      setRefreshKey((k) => k + 1);
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setCommendationStatus(c._recipientUserId, c.id, 'removed');
                      setRefreshKey((k) => k + 1);
                    }}
                  >
                    Remove
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setCommendationStatus(c._recipientUserId, c.id, 'hidden');
                      setRefreshKey((k) => k + 1);
                    }}
                  >
                    Hide
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 text-[10px] text-muted">
          Uses getCommendations(..., true).filter(status==='pending'). Approve sets 'approved'; Remove/Hide use model statuses.
        </div>
      </div>

      <div className="text-[11px] text-muted">
        Only real available user fields shown. No invented bio, credentials, badges, availability or stats.
        <br />
        {COMMUNITY_PROFILE_TODO}
      </div>

      <SurfaceCard
        card={{
          title: 'Visibility rules',
          body: 'Private: owner + admins only (no connection model yet). Public: all authenticated internal users. Threads always visible. Owner/Admin can always view + change.',
          tone: 'teal',
        }}
      />

      {/* Phase 2A/6 admin alignment */}
      <div className="text-xs text-muted mt-2">
        Recognition review: minimal pending commendation queue + Approve/Remove/Hide now in admin view (below). Commendations created as approved continue to appear immediately; pending status supported for review flows.
        Badge/commend counts shown above only when real data exists.
      </div>
    </section>
  );
}

export default AdminCommunityProfilesScreen;
