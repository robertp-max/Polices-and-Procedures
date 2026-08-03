// Governing Body Boardroom Simulation (2026) — Tabletop Hub.
//
// The session picker / program landing screen. Ground-up build for
// tabletop2026/ — does NOT import or copy the old v33/tabletop/* layout.
// Reads the five CasePacks (Q1–Q4 + FY2026 Annual capstone) written in
// data/*.ts and renders them as premium session cards, matching the
// "high-end board portal / legal decision room" language captured in
// tabletop2026.css (.bs-* classes). Chrome that has no equivalent in the
// shared stylesheet yet (top command nav, left icon rail, breadcrumb,
// program-level right rail) is added here as a scoped, additive <style>
// block under new `.bs-hub-*` class names so it can never collide with
// classes other tabletop2026 screens (session/results/group) add to the
// shared tabletop2026.css file.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  ExternalLink,
  FileText,
  HelpCircle,
  Info,
  Landmark,
  LayoutGrid,
  RotateCcw,
  Settings,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';

import type { CasePack, GvWorkflowId } from './engine/caseTypes';
import { ALL_GV_WORKFLOW_IDS, ANNUAL_PASS_SCORE, QUARTERLY_PASS_SCORE } from './engine/caseTypes';
import { Q1_CASE_PACK } from './data/q1Case';
import { Q2_2026_CASE } from './data/q2Case';
import { Q3_2026_CASE } from './data/q3Case';
import { Q4_CASE_PACK } from './data/q4Case';
import { ANNUAL_2026_CASE } from './data/annualCase';

import { DEFAULT_LEARNER_ID } from '../compliance/complianceCatalog';
import { useLearnerId } from '../compliance/complianceIdentity';
import {
  clearDraft,
  readDraft,
  getOfficialEvidence,
  subscribe,
  type ComplianceDraft,
} from '../compliance/complianceStore';
import {
  getDisconnectedNotice,
  isEvidenceServiceConnected,
} from '../compliance/complianceEvidenceAdapter';
import type { ComplianceEvidenceRecord } from '../compliance/complianceTypes';
import {
  isPrivilegedAccessMode,
  logPrivilegedTabletopAccess,
  type PrivilegedAccessMode,
} from '../compliance/accessMode';
import PrivilegedAccessBanner from './PrivilegedAccessBanner';
import TabletopReadinessGateModal from './TabletopReadinessGateModal';
import type { TabletopLaunchGate } from './tabletopLaunchGate';
import { useTabletopLaunchGate } from './useTabletopLaunchGate';
import {
  fetchTabletopPacketArtifacts,
  formatPacketGeneratedAt,
  openProtectedPacket,
  type TabletopPacketArtifact,
} from './tabletopPacketArtifacts';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TabletopHubProps {
  onExit: () => void;
  onLaunch: (caseId: string, mode: 'solo' | 'group') => void;
  /** Test/preview override. Defaults to the authenticated learner identity. */
  learnerId?: string;
  /**
   * Called INSTEAD of `onLaunch` when the authoritative launch gate blocks the
   * attempt. The parent should push `overlay=readiness-gate:{caseId}:{mode}`
   * into governance history so Back/Forward behave, and (optionally) drive
   * `gateOverlay` back down. The Hub still renders the modal itself, so a
   * parent that ignores this callback is still correctly gated.
   */
  onBlockedLaunch?: (caseId: string, mode: 'solo' | 'group', gate: TabletopLaunchGate) => void;
  /** Primary modal action — navigate to My Compliance. Defaults to `onExit`. */
  onGoToCompliance?: () => void;
  /** Deep-link handler for an individual blocker's canonical hash destination. */
  onNavigateToBlocker?: (destination: string) => void;
  /** Close the route-owned readiness overlay (Escape/Return = Browser Back). */
  onCloseGate?: () => void;
  /**
   * Restores the readiness-gate overlay from browser history
   * (`overlay=readiness-gate:{caseId}:{mode}`). Null/undefined = no overlay.
   */
  gateOverlay?: { caseId: string; mode: 'solo' | 'group' } | null;
  /**
   * Test/preview override for the launch gate. Production always uses the one
   * authoritative selector via `useTabletopLaunchGate`.
   */
  launchGateOverride?: TabletopLaunchGate;
}

// ---------------------------------------------------------------------------
// Static program data
// ---------------------------------------------------------------------------

/** Assignment-id convention every tabletop2026 surface (Hub, Session, Results)
 *  should use for this pack's draft/evidence bookkeeping, so local-draft and
 *  (once connected) official-evidence lookups line up across screens. */
function assignmentIdFor(packId: string): string {
  return `gb:tabletop2026:${packId}`;
}

const PERIOD_LABEL: Record<CasePack['quarter'], string> = {
  Q1: 'Jan – Mar 2026',
  Q2: 'Apr – Jun 2026',
  Q3: 'Jul – Sep 2026',
  Q4: 'Oct – Dec 2026',
  FY2026: 'Full Fiscal Year 2026',
};

const PACKS: CasePack[] = [Q1_CASE_PACK, Q2_2026_CASE, Q3_2026_CASE, Q4_CASE_PACK, ANNUAL_2026_CASE];

const CRITICAL_STANDARDS: string[] = [
  `Quarterly sessions require a total score of at least ${QUARTERLY_PASS_SCORE} of 1000, with zero critical-failure results.`,
  `The FY2026 Annual capstone requires at least ${ANNUAL_PASS_SCORE} of 1000, and every one of the 14 Governing Body workflows must be exercised soundly at least once across the attempt.`,
  'A single critical failure — an executive-session confidentiality breach, board overreach recorded publicly, premature public disclosure of unconfirmed findings, or acting outside a licensed scope of services — fails the attempt regardless of total score.',
  "Evidence dated after a matter's source cutoff may never be treated as controlling at decision time.",
];

const LEFT_RAIL_ITEMS: { key: string; label: string; icon: typeof LayoutGrid; active?: boolean }[] = [
  { key: 'hub', label: 'Tabletop Hub', icon: LayoutGrid, active: true },
  { key: 'progress', label: 'My Progress', icon: TrendingUp },
  { key: 'pnp', label: 'P&Ps Library', icon: BookOpen },
  { key: 'standards', label: 'Standards Matrix', icon: ClipboardList },
  { key: 'reports', label: 'Reports & Insights', icon: BarChart3 },
  { key: 'admin', label: 'Admin Center', icon: Settings },
  { key: 'help', label: 'Need Help', icon: HelpCircle },
];

const TOP_NAV_ITEMS: { key: string; label: string; active?: boolean }[] = [
  { key: 'hub', label: 'Tabletop Hub', active: true },
  { key: 'standards', label: 'Standards' },
  { key: 'pnp', label: 'Policies & Procedures' },
  { key: 'reports', label: 'Reports' },
  { key: 'library', label: 'Resource Library' },
];

// ---------------------------------------------------------------------------
// Derived attempt-state helpers
// ---------------------------------------------------------------------------

interface AttemptInfo {
  assignmentId: string;
  draft: ComplianceDraft | null;
  official: ComplianceEvidenceRecord | undefined;
  officiallyComplete: boolean;
}

function deriveAttemptInfo(
  learnerId: string,
  pack: CasePack,
  connected: boolean,
  officialRecords: readonly ComplianceEvidenceRecord[],
): AttemptInfo {
  const assignmentId = assignmentIdFor(pack.id);
  const draft = readDraft(learnerId, assignmentId);
  const official = connected
    ? officialRecords.find(
        (r) =>
          r.assignmentId === assignmentId &&
          r.learnerId === learnerId &&
          r.sourceType === 'tabletop' &&
          r.outcome === 'passed' &&
          r.attestedAt !== null &&
          !isPrivilegedAccessMode(r.privilegedAccessMode),
      )
    : undefined;
  const officiallyComplete =
    !!official &&
    official.completedAt !== null &&
    official.score !== null &&
    official.score >= pack.passScore &&
    official.criticalErrors.length === 0;
  return { assignmentId, draft, official, officiallyComplete };
}

function cutoffShortLabel(sourceCutoff: string): string {
  const match = sourceCutoff.match(/^\S+/);
  return match ? match[0].replace(/[.,]$/, '') : sourceCutoff;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TabletopHub({
  onExit,
  onLaunch,
  learnerId: learnerIdProp,
  onBlockedLaunch,
  onGoToCompliance,
  onNavigateToBlocker,
  onCloseGate,
  gateOverlay,
  launchGateOverride,
}: TabletopHubProps): React.ReactElement {
  const authLearnerId = useLearnerId();
  const learnerId = learnerIdProp ?? authLearnerId;
  const [, forceTick] = useState(0);
  const [restartPackId, setRestartPackId] = useState<string | null>(null);
  const [packetArtifacts, setPacketArtifacts] = useState<TabletopPacketArtifact[]>([]);
  const [packetNotice, setPacketNotice] = useState('Loading controlled packet artifacts...');

  useEffect(() => {
    const unsubscribe = subscribe(() => forceTick((n) => n + 1));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchTabletopPacketArtifacts(controller.signal)
      .then((payload) => {
        setPacketArtifacts(payload.artifacts);
        setPacketNotice(
          payload.artifacts.length
            ? payload.classification
            : (payload.notice ?? 'No controlled packet artifact has been generated.'),
        );
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setPacketArtifacts([]);
        setPacketNotice(
          error instanceof Error ? error.message : 'Controlled packet artifacts are unavailable.',
        );
      });
    return () => controller.abort();
  }, []);

  // ── The ONE authoritative launch gate ────────────────────────────────────
  // Cards are NEVER dimmed, hidden, or locked by this. It gates the launch
  // ACTION only: Solo, Facilitated Group, Resume, Start over, a deep link, and
  // a browser-Forward restore all route through `attemptLaunch` below.
  const resolvedGate = useTabletopLaunchGate(learnerIdProp);
  const gate = launchGateOverride ?? resolvedGate;
  const privilegedMode: PrivilegedAccessMode | null = isPrivilegedAccessMode(gate.accessMode)
    ? gate.accessMode
    : null;

  /** The scenario whose launch was blocked; drives the modal + card highlight. */
  const [blockedLaunch, setBlockedLaunch] = useState<{ caseId: string; mode: 'solo' | 'group' } | null>(
    gateOverlay ?? null,
  );
  /** Stays set after the modal closes so the scenario remains highlighted. */
  const [selectedPackId, setSelectedPackId] = useState<string | null>(gateOverlay?.caseId ?? null);
  /** The control that opened the gate — focus returns here on close. */
  const launchControlRefs = useRef(new Map<string, HTMLButtonElement | null>());
  const lastLaunchControlKey = useRef<string | null>(null);

  // Browser Back/Forward restore of `overlay=readiness-gate:{caseId}:{mode}`.
  // Re-verified against the gate: a restored overlay never bypasses it, and a
  // now-eligible learner does NOT get auto-launched — the overlay just closes.
  useEffect(() => {
    if (!gateOverlay) {
      setBlockedLaunch(null);
      return;
    }
    setSelectedPackId(gateOverlay.caseId);
    setBlockedLaunch(gate.allowed ? null : { caseId: gateOverlay.caseId, mode: gateOverlay.mode });
  }, [gateOverlay, gate.allowed]);

  /**
   * Single entry point for EVERY launch attempt. Opening the gate performs no
   * writes: no attempt, timer, draft, score, or evidence record is created.
   */
  const attemptLaunch = useCallback(
    (caseId: string, mode: 'solo' | 'group', controlKey?: string) => {
      setSelectedPackId(caseId);
      if (controlKey) lastLaunchControlKey.current = controlKey;
      if (!gate.allowed) {
        setBlockedLaunch({ caseId, mode });
        onBlockedLaunch?.(caseId, mode, gate);
        return;
      }
      if (privilegedMode) {
        // Auditable, clearly non-official privileged session.
        logPrivilegedTabletopAccess({ accessMode: privilegedMode, subjectId: learnerId, caseId, mode });
      }
      onLaunch(caseId, mode);
    },
    [gate, onBlockedLaunch, onLaunch, privilegedMode, learnerId],
  );

  const closeGate = useCallback(() => {
    setBlockedLaunch(null);
    onCloseGate?.();
    // Focus returns to the launch control that opened the gate. The scenario
    // stays selected; there is deliberately NO auto-launch once prerequisites
    // complete — the user must explicitly start again.
    const key = lastLaunchControlKey.current;
    if (key) {
      window.requestAnimationFrame(() => launchControlRefs.current.get(key)?.focus());
    }
  }, [onCloseGate]);

  const gatePack = blockedLaunch ? PACKS.find((p) => p.id === blockedLaunch.caseId) : undefined;
  const gateOpen = Boolean(blockedLaunch && gatePack);

  const connected = isEvidenceServiceConnected();
  const officialRecords = getOfficialEvidence();

  const attempts = useMemo(
    () => new Map(PACKS.map((pack) => [pack.id, deriveAttemptInfo(learnerId, pack, connected, officialRecords)])),
    // officialRecords is a snapshot array from the store; a new reference arrives
    // whenever the store emits, and the tick above forces this memo to re-run.
    [connected, officialRecords, learnerId],
  );
  const packetsByCase = useMemo(
    () => new Map(packetArtifacts.map((artifact) => [artifact.caseId, artifact])),
    [packetArtifacts],
  );

  const coverage = useMemo(() => {
    const union = new Set<GvWorkflowId>();
    PACKS.forEach((pack) => pack.requiredWorkflows.forEach((w) => union.add(w)));
    const total = ALL_GV_WORKFLOW_IDS.length;
    const covered = union.size;
    const pct = total === 0 ? 0 : Math.round((covered / total) * 100);
    return { covered, total, pct };
  }, []);

  const completedCount = useMemo(
    () => PACKS.filter((pack) => attempts.get(pack.id)?.officiallyComplete).length,
    [attempts],
  );
  const draftInProgressCount = useMemo(
    () => PACKS.filter((pack) => !attempts.get(pack.id)?.officiallyComplete && attempts.get(pack.id)?.draft).length,
    [attempts],
  );

  const donutRadius = 46;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutOffset = donutCircumference * (1 - coverage.pct / 100);

  return (
    <>
    {/* Background is inert while the readiness gate is open. */}
    <div className="bs-root bs-hub-shell" inert={gateOpen || undefined} aria-hidden={gateOpen || undefined}>
      <style>{HUB_STYLE}</style>

      <header className="bs-hub-topbar">
        <div className="bs-hub-brand">
          <span className="bs-hub-crest" aria-hidden="true">
            <Landmark size={16} />
          </span>
          <div className="bs-hub-brand-copy">
            <strong>Governing Body Boardroom Simulation</strong>
            <span>QAPI Oversight for Home Health Agencies</span>
          </div>
        </div>

        <nav className="bs-hub-topnav" aria-label="Primary">
          {TOP_NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={item.active ? 'active' : undefined}
              aria-current={item.active ? 'page' : undefined}
              onClick={item.active ? undefined : onExit}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="bs-hub-user-chip">
          <span className="bs-hub-user-avatar" aria-hidden="true">
            <User size={14} />
          </span>
          <div>
            <strong>GB Chair</strong>
            <span title={DEFAULT_LEARNER_ID}>Local Development Identity</span>
          </div>
        </div>
      </header>

      <div className="bs-hub-body">
        <aside className="bs-hub-icon-rail" aria-label="Sections">
          {LEFT_RAIL_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                className={item.active ? 'active' : undefined}
                aria-current={item.active ? 'page' : undefined}
                onClick={item.active ? undefined : onExit}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        <main className="bs-hub-main">
          <nav className="bs-hub-breadcrumb" aria-label="Breadcrumb">
            <span>Governance</span>
            <ChevronRight size={12} aria-hidden="true" />
            <span aria-current="page">Tabletop Hub</span>
          </nav>

          <PrivilegedAccessBanner mode={privilegedMode} />

          <div className="bs-hub-head">
            <div>
              <h1 className="bs-editorial">Tabletop Hub</h1>
              <p>
                Five facilitated Governing Body matters — one per 2026 quarter plus the FY2026 Annual
                capstone — each built from the same normalized QAPI record the Board would actually see.
                Work a session solo to build judgment, or convene it as a facilitated group to rehearse a
                real quorum, motion, and vote.
              </p>
            </div>
            <div className="bs-hub-notice-pill" role="note">
              <Info size={14} aria-hidden="true" />
              <span>
                Mandatory: every Governing Body member completes one attempt per quarter (Q1–Q4) plus the
                Annual capstone each fiscal year.
              </span>
            </div>
          </div>

          <div className="bs-pack-grid">
            {PACKS.map((pack) => {
              const isAnnual = pack.quarter === 'FY2026';
              const attempt = attempts.get(pack.id);
              const packetArtifact = packetsByCase.get(pack.id);
              // NOTE: cards are never dimmed, hidden, or locked by the launch
              // gate. `selected` is a highlight only — it persists after the
              // readiness modal closes so the user keeps their place.
              const selected = selectedPackId === pack.id;
              const cardClass = [
                'bs-pack-card',
                isAnnual ? 'annual' : '',
                selected ? 'bs-hub-pack-selected' : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <article key={pack.id} className={cardClass} data-selected={selected || undefined}>
                  <header>
                    <span>{isAnnual ? 'Annual Capstone' : `${pack.quarter} · Quarterly Matter`}</span>
                    <strong>
                      <CalendarDays size={15} aria-hidden="true" className="bs-hub-pack-cal" />
                      {pack.title}
                    </strong>
                    <small>{PERIOD_LABEL[pack.quarter]}</small>
                  </header>

                  <div className="bs-pack-body">
                    <p className="bs-hub-pack-subtitle">{pack.subtitle}</p>

                    <div className="bs-pack-facts">
                      <div className="bs-hub-fact" title={`${pack.estMinutes} minutes estimated`}>
                        <b>{pack.estMinutes}</b>
                        <span>
                          <Clock size={10} aria-hidden="true" /> min est.
                        </span>
                      </div>
                      <div className="bs-hub-fact" title={`${pack.exhibits.length} Board Book exhibits`}>
                        <b>{pack.exhibits.length}</b>
                        <span>
                          <FileText size={10} aria-hidden="true" /> exhibits
                        </span>
                      </div>
                      <div className="bs-hub-fact" title={`${pack.decisionNodes.length} facilitated decisions`}>
                        <b>{pack.decisionNodes.length}</b>
                        <span>
                          <ClipboardList size={10} aria-hidden="true" /> decisions
                        </span>
                      </div>
                      <div className="bs-hub-fact" title={pack.sourceCutoff}>
                        <b>{cutoffShortLabel(pack.sourceCutoff)}</b>
                        <span>
                          <Award size={10} aria-hidden="true" /> cutoff
                        </span>
                      </div>
                    </div>

                    <section className="bs-hub-packet-artifact" aria-label={`${pack.title} packet artifact`}>
                      <div>
                        <strong>Board packet</strong>
                        {packetArtifact ? (
                          <span>
                            {packetArtifact.status.replaceAll('_', ' ')} · v{packetArtifact.version} ·{' '}
                            {packetArtifact.pageCount} pages
                          </span>
                        ) : (
                          <span>Unavailable</span>
                        )}
                      </div>
                      <p>
                        {packetArtifact
                          ? `Source cutoff ${packetArtifact.sourceCutoff}. Last generated ${formatPacketGeneratedAt(packetArtifact.generatedAt)} by ${packetArtifact.generatedBy}; human review remains required.`
                          : packetNotice}
                      </p>
                      {packetArtifact && (
                        <div className="bs-hub-packet-actions">
                          <button
                            type="button"
                            className="outline"
                            onClick={() => openProtectedPacket(packetArtifact)}
                          >
                            <FileText size={12} aria-hidden="true" />
                            Review Packet
                          </button>
                          <button
                            type="button"
                            className="outline"
                            onClick={() => openProtectedPacket(packetArtifact)}
                          >
                            <ExternalLink size={12} aria-hidden="true" />
                            Open Packet in New Tab
                          </button>
                        </div>
                      )}
                    </section>

                    {attempt?.officiallyComplete && (
                      <p className="bs-hub-attempt-flag done">
                        <CheckCircle2 size={12} aria-hidden="true" /> Completed — {attempt.official?.score}/1000
                      </p>
                    )}
                    {!attempt?.officiallyComplete && attempt?.draft && (
                      <p className="bs-hub-attempt-flag progress">
                        <Clock size={12} aria-hidden="true" /> In progress — attempt{' '}
                        {attempt.draft.attemptNumber}, {attempt.draft.progressPercent}% through
                      </p>
                    )}
                  </div>

                  <footer className="bs-hub-pack-footer">
                    <div className="bs-hub-pack-buttons">
                      <button
                        type="button"
                        ref={(el) => {
                          launchControlRefs.current.set(`${pack.id}:solo`, el);
                        }}
                        onClick={() => attemptLaunch(pack.id, 'solo', `${pack.id}:solo`)}
                        aria-label={
                          attempt?.draft
                            ? `Resume ${pack.title} solo draft`
                            : `Start ${pack.title} as a solo attempt`
                        }
                      >
                        <User size={13} aria-hidden="true" />{' '}
                        {attempt?.draft ? 'Resume' : 'Solo'}
                      </button>
                      <button
                        type="button"
                        className="outline"
                        ref={(el) => {
                          launchControlRefs.current.set(`${pack.id}:group`, el);
                        }}
                        onClick={() => attemptLaunch(pack.id, 'group', `${pack.id}:group`)}
                        aria-label={`Start ${pack.title} as a facilitated group session`}
                      >
                        <Users size={13} aria-hidden="true" /> Facilitated Group
                      </button>
                    </div>
                    {attempt?.draft && restartPackId !== pack.id && (
                      <button
                        type="button"
                        className="bs-hub-start-over"
                        onClick={() => setRestartPackId(pack.id)}
                      >
                        <RotateCcw size={12} aria-hidden="true" />
                        Start over
                      </button>
                    )}
                    {attempt?.draft && restartPackId === pack.id && (
                      <div
                        className="bs-hub-restart-confirm"
                        role="group"
                        aria-label={`Start ${pack.title} over`}
                      >
                        <span>Discard this saved draft?</span>
                        <button
                          type="button"
                          className="outline"
                          autoFocus
                          onClick={() => setRestartPackId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => {
                            // Gate FIRST: a blocked "Start over" must not
                            // destroy the saved draft it cannot relaunch.
                            if (!gate.allowed) {
                              setRestartPackId(null);
                              attemptLaunch(pack.id, 'solo', `${pack.id}:solo`);
                              return;
                            }
                            clearDraft(learnerId, attempt.assignmentId);
                            setRestartPackId(null);
                            attemptLaunch(pack.id, 'solo', `${pack.id}:solo`);
                          }}
                        >
                          Start over
                        </button>
                      </div>
                    )}
                    <small>{attempt?.draft ? 'Draft saved' : 'Ready to start'}</small>
                  </footer>
                </article>
              );
            })}
          </div>
        </main>

        <aside className="bs-hub-right-rail" aria-label="Program overview">
          <section className="bs-rail-card">
            <header>
              <strong>Workflow Coverage</strong>
            </header>
            <div className="bs-hub-donut-row">
              <svg className="bs-score-donut bs-hub-donut" viewBox="0 0 120 120" role="img" aria-label={`${coverage.covered} of ${coverage.total} workflows covered`}>
                <circle className="track" cx="60" cy="60" r={donutRadius} />
                <circle
                  className="value"
                  cx="60"
                  cy="60"
                  r={donutRadius}
                  strokeDasharray={donutCircumference}
                  strokeDashoffset={donutOffset}
                />
                <text x="60" y="56" textAnchor="middle" className="bs-score-donut-label">
                  {coverage.covered}/{coverage.total}
                </text>
                <text x="60" y="72" textAnchor="middle" className="bs-hub-donut-sublabel">
                  workflows
                </text>
              </svg>
              <p>
                Across the five sessions in this program, {coverage.covered} of the {coverage.total} Governing
                Body workflows (GV-WF-01 – GV-WF-14) are exercised at least once; the FY2026 capstone alone
                requires all {coverage.total}.
              </p>
            </div>
          </section>

          <section className="bs-rail-card">
            <header>
              <strong>Critical Standards</strong>
            </header>
            <ul className="bs-hub-standards-list">
              {CRITICAL_STANDARDS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>

          <section className="bs-rail-card">
            <header>
              <strong>Attempt History</strong>
            </header>
            {!connected && (
              <p className="bs-hub-disconnected-note">
                <AlertTriangle size={12} aria-hidden="true" /> {getDisconnectedNotice()}
              </p>
            )}
            <ul className="bs-hub-history-list">
              {PACKS.map((pack) => {
                const attempt = attempts.get(pack.id);
                let statusText = 'Not started';
                let statusClass = 'not-started';
                if (attempt?.officiallyComplete) {
                  statusText = `Completed — ${attempt.official?.score}/1000`;
                  statusClass = 'done';
                } else if (attempt?.draft) {
                  statusText = `Attempt ${attempt.draft.attemptNumber} in progress`;
                  statusClass = 'progress';
                }
                return (
                  <li key={pack.id}>
                    <span className="bs-hub-history-title">{pack.quarter === 'FY2026' ? 'Annual' : pack.quarter}</span>
                    <span className={`bs-hub-history-status ${statusClass}`}>{statusText}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="bs-rail-card">
            <header>
              <strong>Readiness Status</strong>
            </header>
            {connected ? (
              <p className="bs-hub-readiness-text">
                {completedCount} of {PACKS.length} sessions officially complete for this fiscal year.
              </p>
            ) : (
              <p className="bs-hub-readiness-text">
                Preview only — official readiness cannot be determined because the compliance evidence
                service is not connected. {draftInProgressCount} of {PACKS.length} sessions have a local
                draft in progress.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>

    {gateOpen && gatePack && blockedLaunch && (
      <TabletopReadinessGateModal
        caseId={blockedLaunch.caseId}
        caseTitle={gatePack.title}
        mode={blockedLaunch.mode}
        gate={gate}
        onGoToCompliance={() => {
          setBlockedLaunch(null);
          (onGoToCompliance ?? onExit)();
        }}
        onClose={closeGate}
        onNavigate={onNavigateToBlocker}
      />
    )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Scoped chrome styles — additive only, never edits the shared tabletop2026.css.
// All new selectors are prefixed bs-hub- (or scoped under .bs-hub-shell) so
// they cannot collide with classes other tabletop2026 screens introduce.
// ---------------------------------------------------------------------------

const HUB_STYLE = `
.bs-hub-shell { display: flex; flex-direction: column; gap: 16px; min-height: 100%; }

.bs-hub-topbar {
  display: flex; align-items: center; justify-content: space-between; gap: 18px; flex-wrap: wrap;
  padding: 14px 22px; color: #e7ede9;
  background: linear-gradient(120deg, var(--bs-forest-dark), var(--bs-forest) 60%, var(--bs-forest-mid));
  border-radius: var(--bs-radius); box-shadow: var(--bs-shadow-sm);
}
.bs-hub-brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
.bs-hub-crest {
  width: 32px; height: 32px; flex: none; display: grid; place-items: center; color: var(--bs-gold);
  border: 1px solid rgba(213,194,148,.45); border-radius: 50%;
}
.bs-hub-brand-copy { display: grid; gap: 2px; min-width: 0; }
.bs-hub-brand-copy strong { font-family: var(--font-editorial); font-size: 16px; font-weight: 400; color: #fff; }
.bs-hub-brand-copy span { color: #a9bab2; font-size: 9px; letter-spacing: .04em; }

.bs-hub-topnav { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.bs-hub-topnav button {
  padding: 8px 13px; border: 1px solid transparent; border-radius: 999px; background: transparent;
  color: #c3d0ca; font-size: 10.5px; font-weight: 500; letter-spacing: .02em;
}
.bs-hub-topnav button:hover { color: #fff; }
.bs-hub-topnav button.active { color: var(--bs-forest-dark); background: var(--bs-gold); }

.bs-hub-user-chip { display: flex; align-items: center; gap: 10px; }
.bs-hub-user-avatar {
  width: 28px; height: 28px; display: grid; place-items: center; border-radius: 50%;
  background: rgba(255,255,255,.12); color: var(--bs-gold); flex: none;
}
.bs-hub-user-chip > div { display: grid; gap: 1px; }
.bs-hub-user-chip strong { font-size: 11px; font-weight: 600; color: #fff; }
.bs-hub-user-chip span { font-size: 8.5px; color: #a9bab2; }

.bs-hub-body { display: grid; grid-template-columns: 96px minmax(0, 1fr) 300px; gap: 16px; align-items: start; }

.bs-hub-icon-rail {
  position: sticky; top: 14px; display: flex; flex-direction: column; gap: 4px; padding: 12px 8px;
  background: var(--bs-paper-glass); border: 1px solid var(--bs-line); border-radius: var(--bs-radius);
  box-shadow: var(--bs-shadow-sm);
}
.bs-hub-icon-rail button {
  display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 10px 4px;
  border: 1px solid transparent; border-radius: 7px; background: transparent; color: var(--bs-muted);
  text-align: center;
}
.bs-hub-icon-rail button span { font-size: 7.5px; font-weight: 500; letter-spacing: .01em; line-height: 1.2; }
.bs-hub-icon-rail button:hover { background: var(--bs-canvas); color: var(--bs-forest); }
.bs-hub-icon-rail button.active { background: var(--bs-forest); color: #fff; box-shadow: var(--bs-shadow-sm); }

.bs-hub-breadcrumb { display: flex; align-items: center; gap: 6px; color: var(--bs-muted); font-size: 10px; }
.bs-hub-breadcrumb [aria-current="page"] { color: var(--bs-forest); font-weight: 600; }

.bs-hub-notice-pill {
  display: flex; align-items: flex-start; gap: 9px; max-width: 320px; padding: 12px 14px;
  color: #7b5a1c; background: #f5ecd7; border: 1px solid #e6d5ad; border-radius: 8px; font-size: 10px; line-height: 1.5;
}
.bs-hub-notice-pill svg { flex: none; margin-top: 1px; color: var(--bs-bronze); }

.bs-hub-pack-cal { color: var(--bs-gold); margin-right: 7px; vertical-align: -2px; }
.bs-hub-pack-subtitle { color: var(--bs-ink); font-size: 11px; line-height: 1.55; }

.bs-hub-fact { display: flex; flex-direction: column; gap: 2px; min-width: 64px; }
.bs-hub-fact span { display: flex; align-items: center; gap: 4px; color: var(--bs-muted); font-size: 8px; letter-spacing: .04em; text-transform: uppercase; }

.bs-hub-attempt-flag {
  display: flex; align-items: center; gap: 6px; padding: 6px 9px; border-radius: 6px; font-size: 9.5px; font-weight: 600;
}
.bs-hub-attempt-flag.done { color: var(--bs-success); background: #e9efec; }
.bs-hub-attempt-flag.progress { color: #8a6a1f; background: #f7edd4; }

.bs-hub-packet-artifact {
  padding-top: 10px;
  border-top: 1px solid var(--bs-line);
}
.bs-hub-packet-artifact > div:first-child {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.bs-hub-packet-artifact strong { color: var(--bs-forest); font-size: 10px; }
.bs-hub-packet-artifact span {
  color: var(--bs-muted);
  font-size: 8px;
  text-transform: capitalize;
}
.bs-hub-packet-artifact p {
  margin: 5px 0 8px;
  color: var(--bs-muted);
  font-size: 8.5px;
  line-height: 1.45;
}
.bs-hub-packet-actions { display: flex; flex-wrap: wrap; gap: 6px; }
.bs-hub-packet-actions button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 30px;
  padding: 5px 8px;
  color: var(--bs-forest);
  background: transparent;
  border: 1px solid var(--bs-forest);
  border-radius: 6px;
  font-size: 8.5px;
  font-weight: 600;
}
.bs-hub-packet-actions button:hover { background: var(--bs-canvas); }

/* Selection highlight only — the launch gate never dims, hides, or locks a card. */
.bs-hub-pack-selected { outline: 2px solid var(--bs-forest); outline-offset: 2px; }

.bs-pack-card.annual { border-color: var(--bs-gold); box-shadow: 0 0 0 1px var(--bs-gold), var(--bs-shadow-md); }
.bs-pack-card.annual > header { background: linear-gradient(150deg, #2c2410, var(--bs-forest) 55%, #6b5423); }

.bs-pack-card > footer.bs-hub-pack-footer {
  display: flex; flex-direction: column; align-items: stretch; gap: 8px;
}
.bs-hub-pack-buttons { display: flex; gap: 8px; }
.bs-hub-pack-buttons button { flex: 1; justify-content: center; }
.bs-pack-card > footer.bs-hub-pack-footer button.outline {
  color: var(--bs-forest); background: transparent; border-color: var(--bs-forest);
}
.bs-pack-card > footer.bs-hub-pack-footer button.outline:hover { background: var(--bs-canvas); }
.bs-pack-card > footer.bs-hub-pack-footer .bs-hub-start-over {
  align-self: flex-start; gap: 5px; padding: 3px 0; color: var(--bs-muted);
  border: 0; background: transparent; font-size: 9.5px; font-weight: 600;
}
.bs-pack-card > footer.bs-hub-pack-footer .bs-hub-start-over:hover { color: var(--bs-forest); }
.bs-hub-restart-confirm {
  display: flex; align-items: center; gap: 7px; flex-wrap: wrap;
  padding-top: 8px; border-top: 1px solid var(--bs-line);
}
.bs-hub-restart-confirm span { margin-right: auto; color: var(--bs-ink); font-size: 9.5px; font-weight: 600; }
.bs-hub-restart-confirm button { min-height: 32px; padding: 5px 9px; font-size: 9px; }
.bs-pack-card > footer.bs-hub-pack-footer .bs-hub-restart-confirm button.danger {
  color: #fff; border-color: #8f332b; background: #8f332b;
}
.bs-pack-card > footer.bs-hub-pack-footer .bs-hub-restart-confirm button.danger:hover { background: #70271f; }
.bs-hub-pack-footer small { align-self: flex-end; }

.bs-hub-right-rail { position: sticky; top: 14px; display: flex; flex-direction: column; gap: 14px; }

.bs-hub-donut-row { display: flex; align-items: center; gap: 14px; }
.bs-hub-donut { width: 92px; height: 92px; flex: none; }
.bs-hub-donut-row p { color: var(--bs-muted); font-size: 10px; line-height: 1.55; }
.bs-hub-donut-sublabel { font-size: 7px; letter-spacing: .08em; text-transform: uppercase; fill: var(--bs-muted); }

.bs-hub-standards-list { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 8px; }
.bs-hub-standards-list li { color: var(--bs-ink); font-size: 10.5px; line-height: 1.5; }

.bs-hub-disconnected-note {
  display: flex; align-items: flex-start; gap: 7px; padding: 8px 10px; margin-bottom: 4px;
  color: #765613; background: #f7edd4; border: 1px solid #ecdba8; border-radius: 6px; font-size: 9.5px; line-height: 1.5;
}
.bs-hub-disconnected-note svg { flex: none; margin-top: 1px; }

.bs-hub-history-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 7px; }
.bs-hub-history-list li { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 7px 0; border-top: 1px solid var(--bs-line); font-size: 10.5px; }
.bs-hub-history-list li:first-child { border-top: 0; }
.bs-hub-history-title { color: var(--bs-forest); font-weight: 600; }
.bs-hub-history-status { color: var(--bs-muted); font-size: 9.5px; text-align: right; }
.bs-hub-history-status.done { color: var(--bs-success); font-weight: 600; }
.bs-hub-history-status.progress { color: #8a6a1f; font-weight: 600; }

.bs-hub-readiness-text { color: var(--bs-ink); font-size: 10.5px; line-height: 1.55; }

@media (max-width: 1280px) {
  .bs-hub-body { grid-template-columns: 84px minmax(0, 1fr) 270px; }
}
@media (max-width: 1024px) {
  .bs-hub-body { grid-template-columns: 1fr; }
  .bs-hub-icon-rail { position: static; flex-direction: row; flex-wrap: wrap; }
  .bs-hub-icon-rail button { flex: 1; min-width: 84px; }
  .bs-hub-right-rail { position: static; }
}
@media (max-width: 640px) {
  .bs-hub-topbar { flex-direction: column; align-items: flex-start; }
  .bs-hub-pack-buttons { flex-direction: column; }
}
`;
