/* ═══════════════════════════════════════════════════════════════
   PolicyLifecyclePage — unified Policy Lifecycle Workspace
   Single route /policy-lifecycle (and /policy-lifecycle/:policyId)
   replacing the legacy Drafts / Review / Publishing screens.

   Three-pane layout per Builder/Policies/Lifecycle/05-…UIUX.md:
     · Left rail   — queues grouped by canonical state
     · Center      — policy header + history timeline
     · Right rail  — mode-aware action card

   The canonical 5 states are DRAFT, REVIEW, APPROVED, PUBLISHED,
   and ARCHIVED.
   ═══════════════════════════════════════════════════════════════ */

import { useMemo, useState, Fragment } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  FileEdit, CheckSquare, ShieldCheck, Send, Archive,
  ArrowRight, ArrowLeft, RotateCcw, Clock, User, Hash,
  AlertTriangle, ChevronRight,
  ClipboardCheck, FileSignature, ListChecks, History as HistoryIcon,
  Rocket, Users, Database,
} from 'lucide-react';
import {
  getCorpusPolicy,
  CORPUS_PROVENANCE,
  CORPUS_EMPTY_MESSAGE,
  LIFECYCLE_DOMAIN_ORDER,
  DOMAIN_LABEL,
  type CorpusPolicy,
} from '@/policy/data/policyCorpus';
import { PolicyViewer32 } from '@/policy/components/policy-viewer/PolicyViewer32';
import { useAuditorModeStore } from '@/policy/stores/auditorModeStore';
import { useAuth } from '@/auth/AuthProvider';
import { authorizeForAuthUser, type PermissionId } from '@/policy/security/identity';
import { PermissionGate } from '@/policy/security/features/PermissionGate';
import {
  usePolicyLifecycleStore,
  TJ_PADILLA,
  STATE_ORDER,
  STATE_LABEL,
  STATE_COLOR,
  legalIntents,
  MODES_BY_STATE,
} from '@/policy/lifecycle';
import type {
  LifecycleIntent,
  LifecycleState,
  WorkspaceMode,
  PolicyLifecycleEnvelope,
} from '@/policy/lifecycle';
import { PageHeader, SurfaceCard, Tabs, SearchField } from '@/policy/components/ui';

const INTENT_LABEL: Record<LifecycleIntent, string> = {
  submitForReview:   'Submit for Review',
  requestRevision:   'Request Revision',
  approve:           'Approve',
  reject:            'Reject',
  publish:           'Publish',
  archive:           'Archive',
  reopenForRevision: 'Reopen for Revision',
};

const INTENT_ICON: Record<LifecycleIntent, typeof CheckSquare> = {
  submitForReview:   ArrowRight,
  requestRevision:   ArrowLeft,
  approve:           ShieldCheck,
  reject:            ArrowLeft,
  publish:           Send,
  archive:           Archive,
  reopenForRevision: RotateCcw,
};

const STATE_ICON: Record<LifecycleState, typeof FileEdit> = {
  DRAFT:     FileEdit,
  REVIEW:    CheckSquare,
  APPROVED:  ShieldCheck,
  PUBLISHED: Send,
  ARCHIVED:  Archive,
};

// ─── Demo reviewer/approver. In production this is the signed-in user.
const DEMO_REVIEWER = {
  userId: 'usr-demo-reviewer',
  name:   'Demo Reviewer',
  email:  'reviewer@careindeed.com',
  role:   'Compliance Officer',
};

export function PolicyLifecyclePage() {
  const navigate = useNavigate();
  const params = useParams<{ policyId?: string }>();
  const [search, setSearch] = useSearchParams();
  const { user } = useAuth();

  const auditorMode = useAuditorModeStore(s => s.enabled);
  // ── Stable selectors only. Returning a NEW object/array from a Zustand
  //    selector on every render triggers React 18's
  //    "getSnapshot should be cached" warning and an infinite render loop.
  //    `envelopes` is the underlying record and only changes on mutation.
  const envelopes   = usePolicyLifecycleStore(s => s.envelopes);
  const apply       = usePolicyLifecycleStore(s => s.apply);

  // Derive counts here, NOT inside the selector.
  const counts = useMemo(() => {
    const c: Record<LifecycleState, number> = {
      DRAFT: 0, REVIEW: 0, APPROVED: 0, PUBLISHED: 0, ARCHIVED: 0,
    };
    Object.values(envelopes).forEach(e => { c[e.state]++; });
    return c;
  }, [envelopes]);

  const [stageFilter, setStageFilter] = useState<LifecycleState | 'ALL'>(
    (search.get('stage')?.toUpperCase() as LifecycleState) || 'ALL',
  );
  const [domainFilter, setDomainFilter] = useState<string>('ALL');
  const [query, setQuery] = useState('');

  // Domain counts (respects stage filter, used by domain dropdown)
  const domainCounts = useMemo(() => {
    const all = Object.values(envelopes);
    const stageMatched = stageFilter === 'ALL' ? all : all.filter(e => e.state === stageFilter);
    const counts: Record<string, number> = {};
    stageMatched.forEach(e => {
      const code = e.policyId.split('-')[0];
      counts[code] = (counts[code] || 0) + 1;
    });
    return counts;
  }, [envelopes, stageFilter]);

  const selectedId  = params.policyId ?? '';
  const envelope    = selectedId ? envelopes[selectedId] : undefined;
  // Look up from the authoritative corpus (same data as /library), not policyStore.
  const policy = useMemo(
    () => selectedId ? getCorpusPolicy(selectedId) : undefined,
    [selectedId],
  );

  const defaultMode: WorkspaceMode = envelope ? MODES_BY_STATE[envelope.state][0] : 'view';
  const modeParam = (search.get('mode') as WorkspaceMode) || defaultMode;
  const mode: WorkspaceMode = envelope && MODES_BY_STATE[envelope.state].includes(modeParam)
    ? modeParam : defaultMode;

  const queues = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = Object.values(envelopes);
    const stageMatched = stageFilter === 'ALL' ? all : all.filter(e => e.state === stageFilter);
    const domainMatched = domainFilter === 'ALL'
      ? stageMatched
      : stageMatched.filter(e => e.policyId.split('-')[0] === domainFilter);
    const searchMatched = q === '' ? domainMatched : domainMatched.filter(e => {
      const p = getCorpusPolicy(e.policyId);
      return (
        e.policyId.toLowerCase().includes(q) ||
        (p?.title ?? '').toLowerCase().includes(q) ||
        (p?.ownerSteward ?? '').toLowerCase().includes(q) ||
        (p?.subdomainCode ?? '').toLowerCase().includes(q) ||
        (p?.domainCode ?? '').toLowerCase().includes(q) ||
        e.createdBy.name.toLowerCase().includes(q)
      );
    });
    // Sort by framework domain order, then by policy ID within each domain
    const domainIdx = (policyId: string) => {
      const code = policyId.split('-')[0];
      const i = (LIFECYCLE_DOMAIN_ORDER as readonly string[]).indexOf(code);
      return i === -1 ? 99 : i;
    };
    const sorted = [...searchMatched].sort((a, b) => {
      const da = domainIdx(a.policyId);
      const db = domainIdx(b.policyId);
      if (da !== db) return da - db;
      return a.policyId.localeCompare(b.policyId);
    });
    return STATE_ORDER.map(state => ({
      state,
      items: sorted.filter(e => e.state === state),
    }));
  }, [envelopes, stageFilter, domainFilter, query]);

  function selectPolicy(id: string) {
    const env = envelopes[id];
    const m = env ? MODES_BY_STATE[env.state][0] : 'view';
    navigate(`/policy-lifecycle/${id}?mode=${m}`);
  }

  function changeMode(m: WorkspaceMode) {
    const sp = new URLSearchParams(search);
    sp.set('mode', m);
    setSearch(sp, { replace: true });
  }

  const [rationale,   setRationale]   = useState('');
  const [actionMsg,   setActionMsg]   = useState<{ ok: boolean; text: string } | null>(null);

  function runIntent(intent: LifecycleIntent) {
    if (!envelope) return;
    const intentToPermission: Partial<Record<LifecycleIntent, PermissionId>> = {
      submitForReview: 'policy.draft',
      requestRevision: 'policy.draft',
      approve: 'policy.approve',
      reject: 'policy.approve',
      publish: 'policy.publish',
      archive: 'policy.publish',
      reopenForRevision: 'policy.draft',
    };

    const mappedPermission = intentToPermission[intent];
    if (mappedPermission) {
      const decision = authorizeForAuthUser(user, mappedPermission, {
        kind: 'policy',
        id: envelope.policyId,
        scope: { organizationId: 'careindeed-demo' },
        meta: {
          draftAuthorUserId: envelope.createdBy.userId,
          isApprovedVersion: envelope.state === 'APPROVED',
        },
      });

      if (!decision.allow) {
        setActionMsg({
          ok: false,
          text: `ACCESS_DENIED (${decision.reasonCode}) — ${decision.reason}`,
        });
        return;
      }
    }

    const actor = user
      ? {
          userId: user.id ?? TJ_PADILLA.userId,
          name: user.name ?? TJ_PADILLA.name,
          email: user.email,
          role: user.role ?? TJ_PADILLA.role,
        }
      : (intent === 'approve' ? DEMO_REVIEWER : TJ_PADILLA);

    const result = apply(envelope.policyId, intent, actor, rationale);
    if (!result.ok) {
      setActionMsg({ ok: false, text: `${result.code} — ${result.message}` });
      return;
    }
    setRationale('');
    setActionMsg({ ok: true, text: `${intent} succeeded — now ${result.next.state}` });
  }

  return (
    <div className="h-full w-full flex flex-col" style={{ background: 'transparent' }}>
      <div className="px-6 pt-6">
        <PageHeader
          eyebrow="COMPLIANCE"
          title="Policy Lifecycle"
          description="Drafting · Review · Approval · Publish · Archive"
          actions={
            envelope ? (
              <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-[var(--v3-border-subtle)]">
                <div
                  className="px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-[0.14em] uppercase"
                  style={{
                    background: STATE_COLOR[envelope.state].bg,
                    color: STATE_COLOR[envelope.state].fg,
                    border: `1px solid ${STATE_COLOR[envelope.state].border}`,
                  }}
                >
                  {STATE_LABEL[envelope.state]}
                </div>
                <div className="text-xs leading-tight text-[var(--v3-text-secondary)]">
                  <div className="font-semibold tracking-tight truncate max-w-[240px] text-[var(--v3-text-primary)]">
                    {envelope.policyId} · {policy?.title ?? '—'}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--v3-text-tertiary)] mt-px">
                    <User size={10} /> {envelope.createdBy.name}
                  </div>
                </div>
              </div>
            ) : null
          }
        />

        {/* Premium corporate state filter pills */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {STATE_ORDER.map(s => {
            const C = STATE_COLOR[s];
            const isActive = stageFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStageFilter(prev => prev === s ? 'ALL' : s)}
                className="px-3 py-1 rounded-full text-xs font-semibold border tracking-[0.5px] transition"
                style={{
                  background: isActive ? C.fg : 'transparent',
                  color: isActive ? '#fff' : C.fg,
                  borderColor: C.border,
                }}
                title={`${counts[s]} in ${STATE_LABEL[s]}`}
              >
                {STATE_LABEL[s]} · {counts[s]}
              </button>
            );
          })}
          {stageFilter !== 'ALL' && (
            <button onClick={() => setStageFilter('ALL')} className="ml-1 text-xs text-[var(--v3-text-tertiary)] underline underline-offset-2">clear filter</button>
          )}
        </div>
      </div>

      {auditorMode && (
        <div className="mx-6 mb-2 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs" style={{ background: 'rgba(245,158,11,0.1)', color: '#b45309', border: '1px solid rgba(245,158,11,0.3)' }}>
          <AlertTriangle size={14} />
          Auditor Mode is on — every transition is blocked. Toggle off to enact changes.
        </div>
      )}

      {/* Provenance strip (premium token) */}
      <div className="mx-6 mb-2 px-3 py-1 flex items-center gap-2 text-[10px] rounded border" style={{ background: 'var(--v3-glass-card)', borderColor: 'var(--v3-border-subtle)', color: 'var(--v3-text-secondary)' }}>
        <Database size={11} />
        <span className="font-semibold tracking-wider text-[var(--v3-text-tertiary)]">SOURCE</span>
        <span>{Object.keys(envelopes).length > 0 ? CORPUS_PROVENANCE : CORPUS_EMPTY_MESSAGE}</span>
      </div>

      {/* ── Three-pane body (card grid + rails) ──────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] min-h-0 gap-4 px-6 pb-6 overflow-hidden">

        {/* Left rail: queues — SurfaceCard */}
        <SurfaceCard padding="sm" className="overflow-y-auto flex flex-col">
          <div className="sticky top-0 z-10 pb-2 bg-[var(--v3-glass-card)]">
            {/* Domain filter + search using ui primitives */}
            <div className="mb-2">
              <select
                value={domainFilter}
                onChange={e => setDomainFilter(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-lg border bg-transparent"
                style={{ borderColor: 'var(--v3-border-subtle)', color: 'var(--v3-text-primary)' }}
              >
                <option value="ALL">All domains</option>
                {LIFECYCLE_DOMAIN_ORDER.map(code => {
                  const count = domainCounts[code] ?? 0;
                  const label = DOMAIN_LABEL[code] ?? code;
                  return (
                    <option key={code} value={code}>
                      {code} — {label} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
            <SearchField
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search id · title · owner…"
              className="w-full"
            />
          </div>
          {queues.map(({ state, items }) => {
            const Icon = STATE_ICON[state];
            const C = STATE_COLOR[state];
            return (
              <section key={state} className="mb-2 last:mb-0">
                <div
                  className="px-3 py-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] rounded"
                  style={{ color: C.fg, background: C.bg + '22' }}
                >
                  <Icon size={13} />
                  {STATE_LABEL[state]}
                  <span className="ml-auto opacity-70 font-mono">{items.length}</span>
                </div>
                <ul>
                  {items.length === 0 && (
                    <li className="px-4 py-2 text-[11px] text-gray-400">— empty —</li>
                  )}
                  {(() => {
                    let lastDomain = '';
                    return items.map(env => {
                      const domainCode = env.policyId.split('-')[0];
                      const showDomainHeader = domainCode !== lastDomain;
                      lastDomain = domainCode;
                      const p = getCorpusPolicy(env.policyId);
                      const active = env.policyId === selectedId;
                      return (
                        <Fragment key={env.policyId}>
                          {showDomainHeader && (
                            <div className="px-3 py-1 text-[9.5px] font-bold uppercase tracking-[0.12em] text-gray-400 bg-gray-50 border-b border-gray-100">
                              {domainCode} — {DOMAIN_LABEL[domainCode] ?? domainCode}
                            </div>
                          )}
                          <li>
                            <button
                              onClick={() => selectPolicy(env.policyId)}
                              className={`w-full text-left px-3 py-2 flex items-start gap-2 hover:bg-gray-50 ${
                                active ? 'bg-gray-100' : ''
                              }`}
                            >
                              <ChevronRight size={12} className="mt-0.5 text-gray-400" />
                              <div className="min-w-0">
                                <div className="text-[12px] font-semibold text-gray-900 truncate">
                                  {env.policyId}
                                </div>
                                <div className="text-[11px] text-gray-500 truncate">
                                  {p?.title ?? '—'}
                                </div>
                              </div>
                            </button>
                          </li>
                        </Fragment>
                      );
                    });
                  })()}
                </ul>
              </section>
            );
          })}
        </SurfaceCard>

        {/* Center: header + history */}
        <main className="overflow-y-auto">
          {!envelope || !policy ? (
            <EmptyCenter isEmpty={Object.keys(envelopes).length === 0} />
          ) : (
            <PolicyDetailCenter envelope={envelope} policy={policy} mode={mode} onMode={changeMode} />
          )}
        </main>

        {/* Right rail: mode-aware actions — SurfaceCard */}
        <SurfaceCard padding="sm" className="overflow-y-auto">
          {!envelope ? (
            <div className="px-4 py-6 text-[12px] text-[var(--v3-text-tertiary)]">
              Select a policy to see available actions.
            </div>
          ) : (
            <ActionsRail
              envelope={envelope}
              mode={mode}
              rationale={rationale}
              setRationale={setRationale}
              onIntent={runIntent}
              message={actionMsg}
              clearMessage={() => setActionMsg(null)}
            />
          )}
        </SurfaceCard>
      </div>
    </div>
  );
}

/* ─── Center pane ─────────────────────────────────────────── */

function EmptyCenter({ isEmpty }: { isEmpty?: boolean }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 text-[var(--v3-text-tertiary)] text-[13px] px-8 text-center">
      {isEmpty ? (
        <>
          <Database size={28} style={{ color: 'var(--v3-text-muted)' }} />
          <div className="font-semibold text-[var(--v3-text-secondary)]">No lifecycle corpus loaded</div>
          <div className="text-xs text-[var(--v3-text-tertiary)]">
            No lifecycle-ready policies found. Import real policy corpus to begin.
          </div>
        </>
      ) : (
        'Select a policy from the left rail.'
      )}
    </div>
  );
}

function PolicyDetailCenter({
  envelope, policy, mode, onMode,
}: {
  envelope: PolicyLifecycleEnvelope;
  policy:   CorpusPolicy;
  mode:     WorkspaceMode;
  onMode:   (m: WorkspaceMode) => void;
}) {
  const C = STATE_COLOR[envelope.state];
  const allowedModes = MODES_BY_STATE[envelope.state];

  return (
    <div className="p-4 flex flex-col gap-4">

      {/* Header card — premium token surface */}
      <SurfaceCard padding="md" style={{ borderLeft: `4px solid ${C.border}` }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: C.fg }}>
              {STATE_LABEL[envelope.state]} · {policy.tier}
            </div>
            <div className="text-[15px] font-semibold tracking-tight mt-0.5 text-[var(--v3-text-primary)]">{policy.title}</div>
            <div className="text-xs text-[var(--v3-text-secondary)] mt-0.5">
              {policy.id} · Owner: {policy.ownerSteward}
            </div>
          </div>
          <div className="text-right text-xs text-[var(--v3-text-secondary)]">
            <div className="flex items-center gap-1 justify-end text-[var(--v3-text-primary)]">
              <User size={11} /> Created by {envelope.createdBy.name}
            </div>
            <div className="text-[10px]">{envelope.createdBy.role}</div>
            <div className="text-[10px]">{envelope.createdBy.email}</div>
          </div>
        </div>

        <div className="mt-3">
          <Tabs
            items={allowedModes.map(m => ({ id: m, label: m }))}
            value={mode}
            onChange={(m) => onMode(m as WorkspaceMode)}
            variant="segmented"
          />
        </div>
      </SurfaceCard>

      {/* Description is not in CorpusPolicy — omit section intentionally */}

      {/* Mode-aware center body */}
      <section>
        <SectionTitle>{mode === 'view' ? 'Read-only view' : `${mode} workspace`}</SectionTitle>
        <ModeBody mode={mode} envelope={envelope} />
      </section>

      {/* History */}
      <section>
        <SectionTitle>Lifecycle History · hash chain</SectionTitle>
        <ol className="border-l-2 border-gray-200 ml-1.5 pl-4 space-y-3">
          {[...envelope.history].reverse().map(ev => (
            <li key={ev.id} className="relative">
              <span
                className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full border-2 border-white"
                style={{ background: STATE_COLOR[ev.toState].border }}
              />
              <div className="text-[11.5px] text-gray-900">
                <span className="font-semibold">{ev.intent}</span>
                {' '}·{' '}
                <span className="text-gray-500">
                  {ev.fromState ?? '∅'} → {ev.toState}
                </span>
              </div>
              <div className="text-[11px] text-gray-600">
                {ev.actor.name} ({ev.actor.role}) · {new Date(ev.timestamp).toLocaleString()}
              </div>
              {ev.rationale && (
                <div className="text-[11px] text-gray-700 italic mt-0.5">"{ev.rationale}"</div>
              )}
              <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                <Hash size={10} /> {ev.chainHash}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Future-state placeholder panels (read-only). These exist so the
          design direction is verifiable; full wiring lands in subsequent
          phases per Builder/Policies/Lifecycle/09-Implementation-Roadmap.md. */}
      <FuturePanels envelope={envelope} />
    </div>
  );
}

function FuturePanels({ envelope }: { envelope: PolicyLifecycleEnvelope }) {
  return (
    <section>
      <SectionTitle>Compliance panels</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PlaceholderPanel
          icon={ClipboardCheck}
          title="Required Approvals"
          body={
            envelope.state === 'REVIEW' || envelope.state === 'APPROVED'
              ? 'Approver matrix renders here once the materialized approvals table is wired (PolicyApproval).'
              : 'No approvals required at this state.'
          }
        />
        <PlaceholderPanel
          icon={FileSignature}
          title="eCIgn Signatures"
          body="Signature ceremony, evidence ref, IP/timestamp, and signer fingerprint will be captured via eCIgn integration."
        />
        <PlaceholderPanel
          icon={ListChecks}
          title="Evidence Checklist"
          body="Required evidence artifacts (controls map, training deck, attestation forms) attach here before publish."
        />
        <PlaceholderPanel
          icon={HistoryIcon}
          title="Audit Trail"
          body="Auditor-mode evidence pack export, verifier of chain integrity, and retention horizon."
        />
        <PlaceholderPanel
          icon={Rocket}
          title="Publish Readiness"
          body="Effective-date gate, distribution channel checks (Drive, SCORM, intranet), and atomic Active/Superseded swap preview."
        />
        <PlaceholderPanel
          icon={Users}
          title="Acknowledgment Status"
          body="Audience size, % acknowledged, 14-day SLA countdown, and escalation list — lit up after publish."
        />
      </div>
    </section>
  );
}

function PlaceholderPanel({
  icon: Icon, title, body,
}: {
  icon: typeof ClipboardCheck;
  title: string;
  body: string;
}) {
  return (
    <SurfaceCard padding="sm" className="border border-dashed border-gray-300">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1a3357]">
        <Icon size={13} className="text-[#e6720a]" />
        {title}
      </div>
      <div className="mt-1 text-[11.5px] text-gray-600 leading-relaxed">{body}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">Pending wiring</div>
    </SurfaceCard>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">
      {children}
    </div>
  );
}

function ModeBody({ mode, envelope }: { mode: WorkspaceMode; envelope: PolicyLifecycleEnvelope }) {
  switch (mode) {
    case 'edit':
      return (
        <SurfaceCard padding="sm" className="text-[12px] text-gray-700">
          Section editor renders here when wired to <code>policyContentMap</code>.
          Author edits are auto-saved while the policy is in <strong>DRAFT</strong>.
        </SurfaceCard>
      );
    case 'review':
      return (
        <SurfaceCard padding="sm" className="text-[12px] text-gray-700">
          Highlight-to-comment overlay activates here. All required comments must be
          resolved before this policy can be approved.
        </SurfaceCard>
      );
    case 'approve':
      return (
        <SurfaceCard padding="sm" className="text-[12px] text-gray-700">
          Required signatures appear here. The original author cannot self-approve;
          a reviewer with appropriate authority must capture each signature via eCIgn.
        </SurfaceCard>
      );
    case 'publish':
      return (
        <SurfaceCard padding="sm" className="text-[12px] text-gray-700">
          Publish readiness checklist. Confirms effective date, distribution channels,
          and acknowledgment audience before atomic activation.
        </SurfaceCard>
      );
    case 'view':
    default: {
      // Render the same source-of-truth document used by /library, embedded
      // inside the lifecycle workspace. Do NOT navigate to /print.
      return (
        <div
          className="rounded-md border border-gray-200 bg-white overflow-hidden"
          style={{ height: 'calc(100vh - 320px)', minHeight: 600 }}
        >
          <PolicyViewer32 policyId={envelope.policyId} embedded />
        </div>
      );
    }
  }
}

/* ─── Right rail ─────────────────────────────────────────── */

function ActionsRail({
  envelope, mode, rationale, setRationale, onIntent, message, clearMessage,
}: {
  envelope:    PolicyLifecycleEnvelope;
  mode:        WorkspaceMode;
  rationale:   string;
  setRationale: (v: string) => void;
  onIntent:    (i: LifecycleIntent) => void;
  message:     { ok: boolean; text: string } | null;
  clearMessage: () => void;
}) {
  const intents = legalIntents(envelope);
  const C = STATE_COLOR[envelope.state];

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
          Current state
        </div>
        <div
          className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold text-[11px] tracking-wider"
          style={{ background: C.bg, color: C.fg, border: `1px solid ${C.border}` }}
        >
          {STATE_LABEL[envelope.state]}
        </div>
        <div className="text-[11px] text-gray-500 mt-1">Mode: {mode}</div>
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 block mb-1">
          Rationale (required for revision / reject / archive)
        </label>
        <textarea
          value={rationale}
          onChange={e => setRationale(e.target.value)}
          rows={3}
          placeholder="At least 8 characters..."
          className="w-full text-[12px] border border-gray-300 rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
          Available actions
        </div>
        {intents.length === 0 && (
          <div className="text-[11px] text-gray-400 italic">
            No transitions allowed — terminal state.
          </div>
        )}
        {intents.map(intent => {
          const Icon = INTENT_ICON[intent];
          // Map lifecycle intent → Phase A permission required to perform it.
          const intentPermission: PermissionId =
            intent === 'approve' || intent === 'reject'
              ? 'policy.approve'
              : intent === 'publish' || intent === 'archive'
                ? 'policy.publish'
                : 'policy.draft';
          return (
            <PermissionGate
              key={intent}
              permissionId={intentPermission}
              mode="disable"
              disabledTitle={`Requires ${intentPermission} — ask an admin to grant your role this permission.`}
            >
              <button
                onClick={() => onIntent(intent)}
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 bg-white text-[12px] font-semibold text-gray-800 hover:bg-gray-50 transition"
              >
                <Icon size={13} />
                {INTENT_LABEL[intent]}
              </button>
            </PermissionGate>
          );
        })}
      </div>

      {message && (
        <div
          onClick={clearMessage}
          className={`text-[11.5px] px-3 py-2 rounded-md cursor-pointer border ${
            message.ok
              ? 'bg-green-50 border-green-200 text-green-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {message.text}
          <div className="text-[10px] opacity-70 mt-1">click to dismiss</div>
        </div>
      )}

      <div className="mt-auto text-[10px] text-gray-400 flex items-center gap-1 pt-3 border-t border-gray-100">
        <Clock size={10} />
        State machine v1 · DRAFT · REVIEW · APPROVED · PUBLISHED · ARCHIVED
      </div>
    </div>
  );
}

export default PolicyLifecyclePage;
