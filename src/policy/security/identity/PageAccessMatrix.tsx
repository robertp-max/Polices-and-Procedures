/**
 * PageAccessMatrix — Salesforce-style page-access editor.
 *
 * Renders inside the User Assignments page as the "Page View Access"
 * tab. Lets authorized admins:
 *   - pick a user
 *   - expand component groups
 *   - toggle component on/off
 *   - bulk-set component level (None / Read / Read+Write)
 *   - set per-page level (None / Read / Read+Write)
 *
 * Read-only for users who are not page-access managers.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { ChevronDown, ChevronRight, Eye, EyeOff, Pencil, RotateCcw, ShieldAlert } from 'lucide-react';
import { useUserAssignmentsStore } from './userAssignmentsStore';
import { persistPageAccessToServer, usePageAccessStore } from './pageAccessStore';
import { COMPONENT_GROUPS, getOrderedComponentGroups, getPagesForComponent, PAGE_BY_ID } from './pageRegistry';
import { canManagePageAccess } from './pageAccess';
import { useAuth } from '@/auth/AuthProvider';
import type { ComponentId, PageAccessLevel } from './pageAccessTypes';

// ─── Protected target identities ─────────────────────────────
// These users have seed-managed grants that get re-applied on every
// page load. We surface that to the admin instead of allowing silent
// edits that snap back on reload.
const PROTECTED_TARGET_USER_IDS = new Set(['demo-user-careindeed', 'usr-marites']);

const LEVEL_LABELS: Record<PageAccessLevel, string> = {
  none: 'No Access',
  read: 'Read',
  write: 'Read + Write',
};

const LEVEL_BADGE: Record<PageAccessLevel, string> = {
  none:  'bg-slate-100 text-slate-500 border-slate-200',
  read:  'bg-sky-50 text-sky-700 border-sky-200',
  write: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function LevelSelect({
  value,
  onChange,
  disabled,
  ariaLabel,
}: {
  value: PageAccessLevel;
  onChange: (next: PageAccessLevel) => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as PageAccessLevel)}
      disabled={disabled}
      aria-label={ariaLabel ?? 'Access level'}
      className={`text-xs rounded border px-2 py-1 font-semibold ${
        disabled
          ? 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
          : `border-slate-300 ${LEVEL_BADGE[value]}`
      }`}
    >
      <option value="none">No Access</option>
      <option value="read">Read</option>
      <option value="write">Read + Write</option>
    </select>
  );
}

interface ComponentRowProps {
  componentId: ComponentId;
  label: string;
  description?: string;
  targetUserId: string;
  targetEmail: string;
  actorEmail: string;
  canEdit: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
}

function ComponentRow({
  componentId,
  label,
  description,
  targetUserId,
  targetEmail,
  actorEmail,
  canEdit,
  expanded,
  onToggleExpand,
}: ComponentRowProps) {
  const access = usePageAccessStore(s => s.access[targetUserId]);
  const setComponentEnabled = usePageAccessStore(s => s.setComponentEnabled);
  const setComponentBulkAccess = usePageAccessStore(s => s.setComponentBulkAccess);
  const setPageAccess = usePageAccessStore(s => s.setPageAccess);

  const grant = access?.components.find(c => c.componentId === componentId);
  const pages = useMemo(() => getPagesForComponent(componentId), [componentId]);
  const enabled = grant?.enabled ?? false;
  const defaultLevel = grant?.defaultAccess ?? 'none';

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-3 py-2 bg-slate-50">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center gap-1.5 text-left flex-1 min-w-0"
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${label}`}
        >
          {expanded
            ? <ChevronDown size={14} className="text-slate-500 shrink-0" />
            : <ChevronRight size={14} className="text-slate-500 shrink-0" />}
          <span className="font-semibold text-sm text-slate-800 truncate">{label}</span>
          {description && (
            <span className="text-xs text-slate-400 truncate hidden md:inline">— {description}</span>
          )}
        </button>

        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-1.5 text-xs text-slate-600 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={e => setComponentEnabled(actorEmail, targetUserId, targetEmail, componentId, e.target.checked)}
              disabled={!canEdit}
              className="rounded border-slate-300 text-[#0f766e]"
            />
            {enabled
              ? <Eye size={12} className="text-emerald-600" />
              : <EyeOff size={12} className="text-slate-400" />}
            <span>{enabled ? 'Visible' : 'Hidden'}</span>
          </label>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">Bulk</span>
            <LevelSelect
              value={defaultLevel}
              onChange={lvl => setComponentBulkAccess(actorEmail, targetUserId, targetEmail, componentId, lvl)}
              disabled={!canEdit}
              ariaLabel={`Bulk access for ${label}`}
            />
          </div>
        </div>
      </div>

      {expanded && (
        <div className="divide-y divide-slate-100">
          {pages.map(p => {
            const pageEntry = grant?.pages.find(pp => pp.pageId === p.pageId);
            const effective: PageAccessLevel = enabled
              ? (pageEntry?.access ?? defaultLevel)
              : 'none';
            return (
              <div
                key={p.pageId}
                className={`flex items-center gap-3 px-3 py-2 text-sm ${
                  enabled ? 'bg-white' : 'bg-slate-50/60'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-700 truncate">{p.label}</div>
                  <div className="text-xs text-slate-400 font-mono truncate">{p.routePattern}</div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${LEVEL_BADGE[effective]}`}>
                  {LEVEL_LABELS[effective]}
                </span>
                <LevelSelect
                  value={pageEntry?.access ?? defaultLevel}
                  onChange={lvl => setPageAccess(actorEmail, targetUserId, targetEmail, componentId, p.pageId, lvl)}
                  disabled={!canEdit || !enabled}
                  ariaLabel={`Access for ${p.label}`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface AuditPreviewProps {
  targetEmail: string;
}

function AuditPreview({ targetEmail }: AuditPreviewProps) {
  const audit = usePageAccessStore(s => s.audit);
  const recent = useMemo(
    () => [...audit]
      .filter(e => e.targetEmail.toLowerCase() === targetEmail.toLowerCase())
      .slice(-10)
      .reverse(),
    [audit, targetEmail],
  );

  if (recent.length === 0) {
    return (
      <div className="text-xs text-slate-400 italic py-2">No page-access changes yet for this user.</div>
    );
  }

  return (
    <ul className="space-y-1 text-xs">
      {recent.map((e, idx) => {
        const target = e.pageId ? PAGE_BY_ID[e.pageId]?.label ?? e.pageId : null;
        const component = e.componentId ? e.componentId.replace('cmp-', '') : null;
        return (
          <li key={`${e.timestamp}-${idx}`} className="text-slate-600 font-mono">
            <span className="text-slate-400">{e.timestamp.slice(11, 19)}</span>{' '}
            <span className="text-slate-700">{e.actorEmail.split('@')[0]}</span>{' '}
            <span className="text-slate-400">→</span>{' '}
            <span>
              {target ?? component ?? 'user'}{' '}
              <span className="text-slate-400">
                ({e.oldAccess ?? '—'} → {e.newAccess ?? '—'})
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export interface PageAccessMatrixProps {
  /** Pre-selected target user id (defaults to the current admin). */
  initialTargetUserId?: string;
}

export function PageAccessMatrix({ initialTargetUserId }: PageAccessMatrixProps) {
  const { user: authUser, getAccessToken } = useAuth();
  const { users } = useUserAssignmentsStore(useShallow(s => ({ users: s.users })));
  const resetUser = usePageAccessStore(s => s.resetUser);
  const access = usePageAccessStore(s => s.access);

  const isManager = canManagePageAccess(authUser);
  const actorEmail = authUser?.email ?? 'system';
  const skipFirstPersistRef = useRef(true);

  const [targetUserId, setTargetUserId] = useState<string>(() => initialTargetUserId ?? users[0]?.id ?? '');
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const c of COMPONENT_GROUPS) initial[c.componentId] = false;
    // Auto-expand User Management since it's the most-edited group in
    // this matrix and the most consequential one.
    initial['cmp-user-management'] = true;
    return initial;
  });

  const targetUser = users.find(u => u.id === targetUserId);
  const targetEmail = targetUser?.email ?? '';
  const isProtectedTarget = PROTECTED_TARGET_USER_IDS.has(targetUserId);

  const orderedGroups = useMemo(() => getOrderedComponentGroups(), []);

  useEffect(() => {
    if (!isManager) return;
    if (skipFirstPersistRef.current) {
      skipFirstPersistRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const accessToken = await getAccessToken();
          if (!accessToken) return;
          await persistPageAccessToServer(accessToken);
        } catch {
          // Keep local state intact; the next edit or refresh can retry the sync.
        }
      })();
    }, 350);

    return () => window.clearTimeout(timer);
  }, [access, getAccessToken, isManager]);

  if (!isManager) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldAlert size={14} /> Page View Access — read-only
        </div>
        <p className="mt-1">
          Only authorized administrators can modify page view access. You can request access from
          <span className="font-mono"> robertp@careindeed.com</span> or
          <span className="font-mono"> maritesa@careindeed.com</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-slate-700">Target user</span>
            <select
              value={targetUserId}
              onChange={e => setTargetUserId(e.target.value)}
              aria-label="Select target user"
              className="border border-slate-300 rounded-md px-2 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40 focus:border-[#0f766e]"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
              ))}
            </select>
          </label>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!targetUser) return;
                resetUser(actorEmail, targetUserId, targetEmail);
              }}
              disabled={!targetUser}
              title="Reset this user back to seed defaults"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <RotateCcw size={12} /> Reset to defaults
            </button>
          </div>
        </div>

        {isProtectedTarget && (
          <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
            <ShieldAlert size={14} className="shrink-0 mt-0.5" />
            <div>
              <strong>{targetUser?.name ?? 'This user'}</strong> is a page-access manager.
              Their grants are re-applied from the bootstrap seed on every page load to
              prevent accidental lockout — edits here are visible immediately but will be
              restored on refresh.
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {orderedGroups.map(c => (
          <ComponentRow
            key={c.componentId}
            componentId={c.componentId}
            label={c.label}
            description={c.description}
            targetUserId={targetUserId}
            targetEmail={targetEmail}
            actorEmail={actorEmail}
            canEdit={isManager}
            expanded={!!expanded[c.componentId]}
            onToggleExpand={() => setExpanded(s => ({ ...s, [c.componentId]: !s[c.componentId] }))}
          />
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
          <Pencil size={12} /> Recent page-access changes for this user
        </div>
        <AuditPreview targetEmail={targetEmail} />
      </div>
    </div>
  );
}

export default PageAccessMatrix;
