/**
 * QapiBoardView.tsx
 *
 * Governing Body QAPI oversight view — a self-contained V3 component.
 *
 * Renders the Board's quarterly QAPI oversight record (Q1/Q2, live) and, behind
 * an explicit "Enter Tabletop Exercise" control, a practice-only rehearsal
 * surface for Q3/Q4. Live quarters pair each GB Escalation Item with the
 * Board's own decision (motion/vote/directive) from ./gbDecisions, or offer a
 * "Record Board decision" action when none exists yet. Tabletop quarters
 * present their actions[] as interactive rehearsal cards. Nothing in this
 * component persists anywhere — session-only React state throughout.
 *
 * Data sources (all bundled, all overridable via props for tests/demos):
 *   ./qapiData        — QUARTERS (Q1/Q2 live KPI/PIP/CAP/AE/complaint/escalation record)
 *   ./tabletopData     — TABLETOP_QUARTERS (Q3/Q4 practice record + actions[])
 *   ./gbDecisions      — GB_DECISIONS_BY_QUARTER (the Board's own motions/directives)
 *
 * Scope discipline: this view intentionally shows only what a Governing Body
 * needs for oversight judgment. It does not reproduce patient census,
 * clinician caseloads, or feeder-audit line items — matching the scope
 * discipline already established in ./qapiData.ts and ./tabletopData.ts.
 */
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Beaker,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Gavel,
  MinusCircle,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Vote,
  X,
} from 'lucide-react';
import './qapi.css';
import {
  QUARTERS,
  type QapiAdverseEvent,
  type QapiCap,
  type QapiComplaintEscalated,
  type QapiGbEscalationItem,
  type QapiKpi,
  type QapiKpiStatus,
  type QapiPipTrigger,
  type QapiQuarterData,
  type QapiQuarterKey,
} from './qapiData';
import {
  TABLETOP_MODE_LABEL,
  TABLETOP_QUARTERS,
  type TabletopAction,
  type TabletopQuarterData,
  type TabletopQuarterKey,
} from './tabletopData';
import {
  GB_DECISIONS_BY_QUARTER,
  type GbDirective,
  type GbMotion,
  type GbQuarterCode,
  type GbQuarterDecisionRecord,
} from './gbDecisions';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type QapiAnyQuarterKey = QapiQuarterKey | TabletopQuarterKey;

export interface QapiRecordedDecisionEvent {
  quarterKey: QapiQuarterKey;
  escalationId: string;
  directive: string;
  owner: string;
  dueDate: string;
}

export interface QapiTabletopAnswerEvent {
  quarterKey: TabletopQuarterKey;
  actionId: string;
  chosenOption: string;
  matchesModelAnswer: boolean;
}

export interface QapiBoardViewProps {
  /** Live quarter selected when the component first mounts. Defaults to 'Q2', the most recent live quarter. */
  initialQuarter?: QapiQuarterKey;
  /** Fires whenever the visible quarter changes — live (Q1/Q2) or, while in the tabletop exercise, Q3/Q4. */
  onQuarterChange?: (quarter: QapiAnyQuarterKey) => void;
  /** Fires when the user enters or exits Board Tabletop Exercise (practice) mode. */
  onTabletopModeChange?: (active: boolean) => void;
  /**
   * Fires when the Board records a decision, in this browser session, for an escalation item
   * that had none on file. The component always keeps its own in-memory record regardless of
   * whether this is provided — nothing is persisted to a server or to gbDecisions.ts.
   */
  onRecordDecision?: (event: QapiRecordedDecisionEvent) => void;
  /** Fires when the user picks an option for a Board Tabletop Exercise rehearsal action. */
  onTabletopAnswer?: (event: QapiTabletopAnswerEvent) => void;
  /** Test/demo override for the live Q1/Q2 record. Defaults to the bundled QUARTERS export. */
  quarters?: Record<QapiQuarterKey, QapiQuarterData>;
  /** Test/demo override for the Q3/Q4 tabletop record. Defaults to the bundled TABLETOP_QUARTERS export. */
  tabletopQuarters?: Record<TabletopQuarterKey, TabletopQuarterData>;
  /** Test/demo override for the Board's own decision record. Defaults to the bundled GB_DECISIONS_BY_QUARTER export. */
  gbDecisions?: Record<GbQuarterCode, GbQuarterDecisionRecord>;
}

// -----------------------------------------------------------------------------
// Internal helpers
// -----------------------------------------------------------------------------

const LIVE_QUARTER_KEYS: QapiQuarterKey[] = ['Q1', 'Q2'];
const TABLETOP_QUARTER_KEYS: TabletopQuarterKey[] = ['Q3', 'Q4'];
const QUARTER_SEQUENCE: QapiAnyQuarterKey[] = ['Q1', 'Q2', 'Q3', 'Q4'];

function parseMetricNumber(raw: string): number | null {
  // Prefer a percentage figure if present (e.g. "9 hospitalizations (5.3%)" -> 5.3).
  const pctMatch = raw.match(/(-?\d+(?:\.\d+)?)\s*%/);
  if (pctMatch) return parseFloat(pctMatch[1]);
  const anyMatch = raw.match(/-?\d+(?:\.\d+)?/);
  return anyMatch ? parseFloat(anyMatch[0]) : null;
}

type ThresholdDirection = 'higher-better' | 'lower-better' | null;

function thresholdDirection(threshold: string): ThresholdDirection {
  const trimmed = threshold.trim();
  if (trimmed.startsWith('≥') || trimmed.startsWith('>')) return 'higher-better';
  if (trimmed.startsWith('≤') || trimmed.startsWith('<')) return 'lower-better';
  return null;
}

type TrendTone = 'good' | 'bad' | 'neutral';
interface TrendArrow {
  tone: TrendTone;
  icon: 'up' | 'down' | 'flat';
  label: string;
}

function compareValues(prevRaw: string, currRaw: string, direction: ThresholdDirection, prevLabel: string): TrendArrow | null {
  const prev = parseMetricNumber(prevRaw);
  const curr = parseMetricNumber(currRaw);
  if (prev === null || curr === null) return null;
  const delta = Math.round((curr - prev) * 10) / 10;
  if (delta === 0) return { tone: 'neutral', icon: 'flat', label: `Flat vs ${prevLabel}` };
  const rising = delta > 0;
  const dir = direction ?? 'higher-better';
  const improved = dir === 'higher-better' ? rising : !rising;
  const sign = rising ? '+' : '−';
  return { tone: improved ? 'good' : 'bad', icon: rising ? 'up' : 'down', label: `${sign}${Math.abs(delta)} vs ${prevLabel}` };
}

function intraQuarterTrend(kpi: QapiKpi): TrendArrow | null {
  if (kpi.monthly.length < 2) return null;
  const first = kpi.monthly[0];
  const last = kpi.monthly[kpi.monthly.length - 1];
  return compareValues(first.value, last.value, thresholdDirection(kpi.threshold), first.month);
}

/** Finds the same-named KPI in the immediately preceding quarter (live or tabletop), if any. */
function findPreviousQuarterKpi(
  currentKey: QapiAnyQuarterKey,
  indicator: string,
  liveMap: Record<QapiQuarterKey, QapiQuarterData>,
  tabletopMap: Record<TabletopQuarterKey, TabletopQuarterData>,
): { data: QapiQuarterData; kpi: QapiKpi } | null {
  const idx = QUARTER_SEQUENCE.indexOf(currentKey);
  if (idx <= 0) return null;
  const prevKey = QUARTER_SEQUENCE[idx - 1];
  const prevData: QapiQuarterData | undefined = (LIVE_QUARTER_KEYS as string[]).includes(prevKey)
    ? liveMap[prevKey as QapiQuarterKey]
    : tabletopMap[prevKey as TabletopQuarterKey];
  if (!prevData) return null;
  const prevKpi = prevData.kpis.find((candidate) => candidate.indicator === indicator);
  return prevKpi ? { data: prevData, kpi: prevKpi } : null;
}

const STATUS_LABEL: Record<QapiKpiStatus, string> = { good: 'On target', warn: 'Monitor', bad: 'Off target' };

function severityTone(severity: string): 'good' | 'warn' | 'bad' | 'neutral' {
  const s = severity.toLowerCase();
  if (s.includes('critical') || s.includes('level 3')) return 'bad';
  if (s.includes('high') || s.includes('level 2') || s.includes('moderate')) return 'warn';
  if (s.includes('low') || s.includes('level 1')) return 'good';
  return 'neutral';
}

function lifecycleTone(status: string): 'good' | 'warn' | 'neutral' {
  const s = status.toLowerCase();
  if (s.startsWith('closed') || s.includes('resolved')) return 'good';
  if (s.startsWith('active') || s.startsWith('open') || s.includes('initiated') || s.includes('in progress')) return 'warn';
  return 'neutral';
}

function directiveTone(status: GbDirective['status']): 'good' | 'warn' | 'neutral' {
  if (status === 'Closed') return 'good';
  if (status === 'Open') return 'warn';
  return 'neutral';
}

interface ResolvedDecision {
  motion: GbMotion;
  directive?: GbDirective;
}

/**
 * Pairs each of this quarter's gbEscalationItems with the Board's own motion/directive from
 * gbDecisions, where one exists. Handles two real record shapes seen in the data:
 *   - Q2-style: each item id (GBE-001..005) matches a motion's escalationId exactly.
 *   - Q1-style: a single bundled escalationId (GB-Q1-001) covers several motions, and the
 *     per-item ids (GB-Q1-001-1..4) are a later split with no per-item escalationId of their
 *     own — resolved positionally, in authored order, against that bundle's motions.
 * Falls back to an empty map (every item "unacted") when no decision record is available,
 * which is exactly the state a real not-yet-decided quarter would be in.
 */
function resolveDecisionsForQuarter(
  items: QapiGbEscalationItem[],
  decisions: GbQuarterDecisionRecord | undefined,
): Record<string, ResolvedDecision> {
  const result: Record<string, ResolvedDecision> = {};
  if (!decisions) return result;

  const stripSuffix = (id: string) => id.replace(/-\d+$/, '');
  const positionalGroups = new Map<string, string[]>();
  for (const item of items) {
    const hasExact = decisions.motions.some((motion) => motion.escalationId === item.id);
    if (hasExact) continue;
    const base = stripSuffix(item.id);
    const list = positionalGroups.get(base) ?? [];
    list.push(item.id);
    positionalGroups.set(base, list);
  }

  for (const item of items) {
    const exactMotion = decisions.motions.find((motion) => motion.escalationId === item.id);
    let motion: GbMotion | undefined = exactMotion;
    if (!motion) {
      const base = stripSuffix(item.id);
      const siblingOrder = positionalGroups.get(base) ?? [];
      const position = siblingOrder.indexOf(item.id);
      const motionsForBase = decisions.motions.filter((candidate) => candidate.escalationId === base);
      motion = position >= 0 ? motionsForBase[position] : undefined;
    }
    if (motion) {
      const directiveId = motion.relatedDirectiveIds[0];
      const directive = directiveId ? decisions.directives.find((candidate) => candidate.id === directiveId) : undefined;
      result[item.id] = { motion, directive };
    }
  }
  return result;
}

interface ResolvedEscalation {
  item: QapiGbEscalationItem;
  motion?: GbMotion;
  directive?: GbDirective;
}

function jumpTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' });
}

// -----------------------------------------------------------------------------
// Small presentational pieces
// -----------------------------------------------------------------------------

function TrendIcon({ icon }: { icon: TrendArrow['icon'] }) {
  if (icon === 'up') return <TrendingUp size={12} aria-hidden="true" />;
  if (icon === 'down') return <TrendingDown size={12} aria-hidden="true" />;
  return <MinusCircle size={12} aria-hidden="true" />;
}

function KpiCard({ kpi, arrow }: { kpi: QapiKpi; arrow: TrendArrow | null }) {
  return (
    <article className={`qapi-metric-card qapi-metric-card--${kpi.status}`}>
      <span className="qapi-metric-label">{kpi.indicator}</span>
      <strong className="qapi-metric-value">{kpi.qValue}</strong>
      <div className="qapi-metric-row">
        <span className={`qapi-pill qapi-pill--${kpi.status}`}>{STATUS_LABEL[kpi.status]}</span>
        <span className="qapi-metric-threshold">Threshold {kpi.threshold}</span>
      </div>
      {arrow && (
        <span className={`qapi-trend qapi-trend--${arrow.tone}`}>
          <TrendIcon icon={arrow.icon} />
          {arrow.label}
        </span>
      )}
      <p className="qapi-metric-note">{kpi.trend}</p>
    </article>
  );
}

function Collapsible({ text, limit = 190 }: { text: string; limit?: number }) {
  const [open, setOpen] = useState(false);
  if (text.length <= limit) return <p className="qapi-motion-text">{text}</p>;
  return (
    <div className="qapi-collapsible">
      <p className="qapi-motion-text">{open ? text : `${text.slice(0, limit).trimEnd()}…`}</p>
      <button type="button" className="qapi-collapsible-toggle" onClick={() => setOpen((value) => !value)}>
        {open ? 'Show less' : 'Read full motion'}
        <ChevronDown size={12} aria-hidden="true" className={open ? 'is-open' : ''} />
      </button>
    </div>
  );
}

function RecordDecisionForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (directive: string, owner: string, dueDate: string) => void;
}) {
  const [directive, setDirective] = useState('');
  const [owner, setOwner] = useState('');
  const [dueDate, setDueDate] = useState('');
  const canSave = directive.trim().length > 0;
  return (
    <form
      className="qapi-record-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSave) onSave(directive.trim(), owner.trim(), dueDate);
      }}
    >
      <label>
        <span>Board directive</span>
        <textarea
          value={directive}
          onChange={(event) => setDirective(event.target.value)}
          rows={3}
          placeholder="What is the Board directing management to do about this item?"
          required
        />
      </label>
      <div className="qapi-record-form-row">
        <label>
          <span>Owner</span>
          <input value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="Name / role" />
        </label>
        <label>
          <span>Due date</span>
          <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </label>
      </div>
      <p className="qapi-record-form-note">Saved to this browser session only — not written to the official minutes.</p>
      <div className="qapi-record-form-actions">
        <button type="button" className="qapi-btn-quiet" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="qapi-btn-primary" disabled={!canSave}>
          Save decision (this session)
        </button>
      </div>
    </form>
  );
}

function TabletopActionCard({
  action,
  chosen,
  onChoose,
}: {
  action: TabletopAction;
  chosen?: string;
  onChoose: (option: string) => void;
}) {
  const revealed = Boolean(chosen);
  const matches = chosen === action.modelAnswer;
  return (
    <article className="qapi-action-card" id={`qapi-action-${action.id}`}>
      <span className="qapi-action-id">{action.id}</span>
      <p className="qapi-action-prompt">{action.prompt}</p>
      <div className="qapi-action-options">
        {action.options.map((option) => {
          const isChosen = chosen === option;
          const isModel = revealed && option === action.modelAnswer;
          return (
            <button
              key={option}
              type="button"
              className={`qapi-action-option ${isChosen ? 'is-chosen' : ''} ${isModel ? 'is-model' : ''} ${revealed && isChosen && !isModel ? 'is-miss' : ''}`}
              onClick={() => onChoose(option)}
            >
              <span>{option}</span>
              {isModel && <CheckCircle2 size={14} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className={`qapi-action-reveal ${matches ? 'is-match' : 'is-miss'}`}>
          <strong>{matches ? 'That matches the Board’s recommended action.' : 'The Board’s recommended action differs.'}</strong>
          {!matches && (
            <p className="qapi-action-model">
              <span>Recommended:</span> {action.modelAnswer}
            </p>
          )}
          <p>{action.rationale}</p>
        </div>
      )}
    </article>
  );
}

// -----------------------------------------------------------------------------
// Judgment banner
// -----------------------------------------------------------------------------

function JudgmentBanner({
  tabletopActive,
  needsDecision,
  needsMonitoring,
  pendingActions,
}: {
  tabletopActive: boolean;
  needsDecision: ResolvedEscalation[];
  needsMonitoring: ResolvedEscalation[];
  pendingActions: TabletopAction[];
}) {
  if (tabletopActive) {
    if (pendingActions.length === 0) {
      return (
        <div className="qapi-judgment-banner is-clear" role="status">
          <ShieldCheck size={20} aria-hidden="true" />
          <div>
            <strong>You&rsquo;ve rehearsed every Board decision in this exercise.</strong>
            <p>Switch quarters above, or exit the tabletop exercise to return to the live Q1&ndash;Q2 record.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="qapi-judgment-banner" role="status">
        <Beaker size={20} aria-hidden="true" />
        <div>
          <strong>What the Board is asked to rehearse this session</strong>
          <p>
            {pendingActions.length} tabletop {pendingActions.length === 1 ? 'decision' : 'decisions'} below still need a practice
            choice.
          </p>
          <ul>
            {pendingActions.map((action) => (
              <li key={action.id}>
                <span>{action.prompt.length > 130 ? `${action.prompt.slice(0, 127).trimEnd()}…` : action.prompt}</span>
                <button type="button" onClick={() => jumpTo(`qapi-action-${action.id}`)}>
                  Rehearse now <ChevronRight size={13} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (needsDecision.length === 0 && needsMonitoring.length === 0) {
    return (
      <div className="qapi-judgment-banner is-clear" role="status">
        <ShieldCheck size={20} aria-hidden="true" />
        <div>
          <strong>Every Board escalation this quarter has a recorded decision.</strong>
          <p>Nothing is waiting on the Board right now &mdash; the full record is below for reference.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="qapi-judgment-banner" role="status">
      <Gavel size={20} aria-hidden="true" />
      <div>
        <strong>What needs the Board&rsquo;s judgment this quarter</strong>
        {needsDecision.length > 0 && (
          <>
            <p className="qapi-judgment-kicker">Needs a Board decision ({needsDecision.length})</p>
            <ul>
              {needsDecision.map(({ item }) => (
                <li key={item.id}>
                  <span>{item.text}</span>
                  <button type="button" onClick={() => jumpTo(`qapi-escalation-${item.id}`)}>
                    Review now <ChevronRight size={13} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        {needsMonitoring.length > 0 && (
          <>
            <p className="qapi-judgment-kicker">Awaiting closure &mdash; continue monitoring ({needsMonitoring.length})</p>
            <ul>
              {needsMonitoring.map(({ item, directive }) => (
                <li key={item.id}>
                  <span>
                    {item.text} <i>&mdash; directive {directive?.status.toLowerCase()}</i>
                  </span>
                  <button type="button" onClick={() => jumpTo(`qapi-escalation-${item.id}`)}>
                    View <ChevronRight size={13} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Section renderers (shared by live + tabletop quarters)
// -----------------------------------------------------------------------------

function KpiSection({
  quarterData,
  quarterKey,
  liveMap,
  tabletopMap,
}: {
  quarterData: QapiQuarterData;
  quarterKey: QapiAnyQuarterKey;
  liveMap: Record<QapiQuarterKey, QapiQuarterData>;
  tabletopMap: Record<TabletopQuarterKey, TabletopQuarterData>;
}) {
  return (
    <section className="qapi-section">
      <div className="qapi-section-head">
        <h2>Quality indicators</h2>
        <p>Quarter-end reading against the approved threshold, with a trend arrow versus the prior quarter where the same indicator was tracked.</p>
      </div>
      <div className="qapi-kpi-grid">
        {quarterData.kpis.map((kpi) => {
          const prevMatch = findPreviousQuarterKpi(quarterKey, kpi.indicator, liveMap, tabletopMap);
          const crossArrow = prevMatch
            ? compareValues(prevMatch.kpi.qValue, kpi.qValue, thresholdDirection(kpi.threshold), prevMatch.data.quarterLabel.split(' ')[0])
            : null;
          const arrow = crossArrow ?? intraQuarterTrend(kpi);
          return <KpiCard key={kpi.indicator} kpi={kpi} arrow={arrow} />;
        })}
      </div>
    </section>
  );
}

function PipCapSection({ pipTriggers, caps }: { pipTriggers: QapiPipTrigger[]; caps: QapiCap[] }) {
  return (
    <section className="qapi-section">
      <div className="qapi-section-head">
        <h2>Performance improvement &amp; corrective action</h2>
        <p>Every active PIP trigger this quarter, paired with the corrective action plan tracking it.</p>
      </div>
      <div className="qapi-table-scroll">
        <table className="qapi-table">
          <caption>Performance Improvement Plan triggers</caption>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Trigger</th>
              <th scope="col">Severity</th>
              <th scope="col">Status</th>
              <th scope="col">Finding summary</th>
            </tr>
          </thead>
          <tbody>
            {pipTriggers.map((trigger) => (
              <tr key={trigger.id}>
                <td><code>{trigger.id}</code></td>
                <td>{trigger.title}</td>
                <td><span className={`qapi-pill qapi-pill--${severityTone(trigger.severity)}`}>{trigger.severity}</span></td>
                <td><span className={`qapi-pill qapi-pill--${lifecycleTone(trigger.status)}`}>{trigger.status}</span></td>
                <td className="qapi-table-note">{trigger.findingSummary ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="qapi-table-scroll">
        <table className="qapi-table">
          <caption>Corrective Action Plans</caption>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Description</th>
              <th scope="col">Owner</th>
              <th scope="col">Due</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {caps.map((cap) => (
              <tr key={cap.id}>
                <td><code>{cap.id}</code></td>
                <td className="qapi-table-note">{cap.description}</td>
                <td><code>{cap.owner}</code></td>
                <td>{cap.dueDate}</td>
                <td><span className={`qapi-pill qapi-pill--${lifecycleTone(cap.status)}`}>{cap.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AdverseEventSection({ adverseEvents }: { adverseEvents: QapiAdverseEvent[] }) {
  return (
    <section className="qapi-section">
      <div className="qapi-section-head">
        <h2>Adverse events &amp; root-cause analysis</h2>
        <p>Every adverse event logged this quarter and the status of its root-cause analysis.</p>
      </div>
      <div className="qapi-table-scroll">
        <table className="qapi-table">
          <caption>Adverse events</caption>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Event</th>
              <th scope="col">Severity</th>
              <th scope="col">RCA status</th>
              <th scope="col">Date</th>
            </tr>
          </thead>
          <tbody>
            {adverseEvents.map((event) => (
              <tr key={event.id}>
                <td><code>{event.id}</code></td>
                <td>{event.type}</td>
                <td><span className={`qapi-pill qapi-pill--${severityTone(event.severity)}`}>{event.severity}</span></td>
                <td className="qapi-table-note">{event.rcaStatus}</td>
                <td>{event.date ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ComplaintsSection({ complaintsEscalated }: { complaintsEscalated: QapiComplaintEscalated[] }) {
  return (
    <section className="qapi-section">
      <div className="qapi-section-head">
        <h2>Complaints escalated to the Governing Body</h2>
        <p>Complaints the QAPI Committee&rsquo;s own record explicitly marks as escalated to the Board.</p>
      </div>
      {complaintsEscalated.length === 0 ? (
        <p className="qapi-empty-note">
          No complaint this quarter is explicitly marked &ldquo;escalated to Governing Body&rdquo; in the source complaint log.
          That reflects the underlying record, not a gap in this view.
        </p>
      ) : (
        <div className="qapi-callout-list">
          {complaintsEscalated.map((complaint) => (
            <div className="qapi-callout qapi-callout--warn" key={complaint.id}>
              <span className="qapi-callout-title">{complaint.id}</span>
              <p>{complaint.summary}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// -----------------------------------------------------------------------------
// Main component
// -----------------------------------------------------------------------------

export default function QapiBoardView({
  initialQuarter = 'Q2',
  onQuarterChange,
  onTabletopModeChange,
  onRecordDecision,
  onTabletopAnswer,
  quarters = QUARTERS,
  tabletopQuarters = TABLETOP_QUARTERS,
  gbDecisions = GB_DECISIONS_BY_QUARTER,
}: QapiBoardViewProps) {
  const [tabletopActive, setTabletopActive] = useState(false);
  const [liveQuarterKey, setLiveQuarterKey] = useState<QapiQuarterKey>(initialQuarter);
  const [tabletopQuarterKey, setTabletopQuarterKey] = useState<TabletopQuarterKey>('Q3');
  const [chosenOptions, setChosenOptions] = useState<Record<string, string>>({});
  const [sessionDecisions, setSessionDecisions] = useState<Record<string, { directive: string; owner: string; dueDate: string }>>({});
  const [openFormId, setOpenFormId] = useState<string | null>(null);

  const activeQuarterKey: QapiAnyQuarterKey = tabletopActive ? tabletopQuarterKey : liveQuarterKey;
  const quarterData: QapiQuarterData = tabletopActive ? tabletopQuarters[tabletopQuarterKey] : quarters[liveQuarterKey];
  const tabletopData: TabletopQuarterData | null = tabletopActive ? tabletopQuarters[tabletopQuarterKey] : null;
  const decisionsForLiveQuarter = !tabletopActive ? gbDecisions[liveQuarterKey] : undefined;

  const resolvedMap = useMemo(
    () => resolveDecisionsForQuarter(quarterData.gbEscalationItems, decisionsForLiveQuarter),
    [quarterData, decisionsForLiveQuarter],
  );

  const resolvedEscalations: ResolvedEscalation[] = useMemo(
    () =>
      quarterData.gbEscalationItems.map((item) => ({
        item,
        motion: resolvedMap[item.id]?.motion,
        directive: resolvedMap[item.id]?.directive,
      })),
    [quarterData, resolvedMap],
  );

  const needsDecision = !tabletopActive
    ? resolvedEscalations.filter((entry) => !entry.motion && !sessionDecisions[entry.item.id])
    : [];
  const needsMonitoring = !tabletopActive
    ? resolvedEscalations.filter((entry) => entry.motion && entry.directive && entry.directive.status !== 'Closed')
    : [];
  const pendingActions = tabletopData ? tabletopData.actions.filter((action) => !chosenOptions[action.id]) : [];

  const packageReceiptNote = decisionsForLiveQuarter?.acknowledgments.find((ack) => ack.id.endsWith('-ACK-000'))?.statement;

  const selectLiveQuarter = (key: QapiQuarterKey) => {
    setLiveQuarterKey(key);
    onQuarterChange?.(key);
  };
  const selectTabletopQuarter = (key: TabletopQuarterKey) => {
    setTabletopQuarterKey(key);
    onQuarterChange?.(key);
  };
  const enterTabletop = () => {
    setTabletopActive(true);
    onTabletopModeChange?.(true);
    onQuarterChange?.(tabletopQuarterKey);
  };
  const exitTabletop = () => {
    setTabletopActive(false);
    onTabletopModeChange?.(false);
    onQuarterChange?.(liveQuarterKey);
  };
  const chooseOption = (action: TabletopAction, option: string) => {
    setChosenOptions((prev) => ({ ...prev, [action.id]: option }));
    onTabletopAnswer?.({
      quarterKey: tabletopQuarterKey,
      actionId: action.id,
      chosenOption: option,
      matchesModelAnswer: option === action.modelAnswer,
    });
  };
  const saveDecision = (item: QapiGbEscalationItem, directive: string, owner: string, dueDate: string) => {
    setSessionDecisions((prev) => ({ ...prev, [item.id]: { directive, owner, dueDate } }));
    setOpenFormId(null);
    onRecordDecision?.({ quarterKey: liveQuarterKey, escalationId: item.id, directive, owner, dueDate });
  };

  return (
    <section className="qapi-root">
      <header className="qapi-header">
        <span className="qapi-eyebrow">Governing Body &middot; QAPI oversight &middot; 42 CFR 484.65</span>
        <h1 className="qapi-title">Quality Assurance &amp; Performance Improvement</h1>
        <p className="qapi-subtitle">
          The Board&rsquo;s quarterly oversight record: performance indicators, corrective action, adverse events, and every item
          escalated for the Governing Body&rsquo;s judgment.
        </p>
        <div className="qapi-meta-row">
          <span className="qapi-meta-item">
            <CalendarClock size={13} aria-hidden="true" /> {quarterData.periodLabel}
          </span>
          <span className="qapi-meta-item">Reviewed {quarterData.meetingDate}</span>
        </div>
      </header>

      <div className="qapi-switcher">
        <div className="qapi-switcher-group" role="tablist" aria-label="Reporting quarter">
          {!tabletopActive &&
            LIVE_QUARTER_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={liveQuarterKey === key}
                className={`qapi-switcher-btn ${liveQuarterKey === key ? 'is-active' : ''}`}
                onClick={() => selectLiveQuarter(key)}
              >
                {quarters[key].quarterLabel}
                <small>Live record</small>
              </button>
            ))}
          {tabletopActive &&
            TABLETOP_QUARTER_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tabletopQuarterKey === key}
                className={`qapi-switcher-btn is-tabletop ${tabletopQuarterKey === key ? 'is-active' : ''}`}
                onClick={() => selectTabletopQuarter(key)}
              >
                {tabletopQuarters[key].quarterLabel}
                <small>Practice</small>
              </button>
            ))}
        </div>
        {!tabletopActive ? (
          <button type="button" className="qapi-tabletop-enter" onClick={enterTabletop}>
            <Beaker size={15} aria-hidden="true" />
            Enter Tabletop Exercise
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        ) : (
          <button type="button" className="qapi-tabletop-exit" onClick={exitTabletop}>
            <X size={15} aria-hidden="true" />
            Exit Tabletop Exercise &mdash; return to live records
          </button>
        )}
      </div>

      {tabletopActive && (
        <div className="qapi-practice-banner" role="status">
          <Beaker size={16} aria-hidden="true" />
          <div>
            <strong>PRACTICE &mdash; {TABLETOP_MODE_LABEL} &middot; not a live record</strong>
            <span>Q3&ndash;Q4 here are a rehearsal surface built on real figures. Choices are session-only and never change an official Board record.</span>
          </div>
        </div>
      )}

      <JudgmentBanner
        tabletopActive={tabletopActive}
        needsDecision={needsDecision}
        needsMonitoring={needsMonitoring}
        pendingActions={pendingActions}
      />

      <KpiSection quarterData={quarterData} quarterKey={activeQuarterKey} liveMap={quarters} tabletopMap={tabletopQuarters} />
      <PipCapSection pipTriggers={quarterData.pipTriggers} caps={quarterData.caps} />
      <AdverseEventSection adverseEvents={quarterData.adverseEvents} />
      <ComplaintsSection complaintsEscalated={quarterData.complaintsEscalated} />

      <section className="qapi-section">
        <div className="qapi-section-head">
          <h2>Governing Body escalation items</h2>
          <p>
            {tabletopActive
              ? 'Reference only in this exercise — practice the Board’s response in Tabletop Rehearsal Actions below.'
              : 'Every item the QAPI Committee escalated to the Board this quarter, paired with the Board’s own decision.'}
          </p>
          {!tabletopActive && packageReceiptNote && <p className="qapi-package-note">{packageReceiptNote}</p>}
        </div>
        <div className="qapi-escalation-list">
          {quarterData.gbEscalationItems.map((item) => {
            const resolved = resolvedMap[item.id];
            const draft = sessionDecisions[item.id];
            return (
              <article className="qapi-escalation-card" id={`qapi-escalation-${item.id}`} key={item.id}>
                <div className="qapi-escalation-head">
                  <code>{item.id}</code>
                  <p>{item.text}</p>
                </div>
                <p className="qapi-escalation-directive">{item.directive}</p>

                {tabletopActive ? null : resolved ? (
                  <div className="qapi-decision-block">
                    <div className="qapi-decision-top">
                      <span className="qapi-decision-label">
                        <Vote size={13} aria-hidden="true" /> Board decision &mdash; {resolved.motion.subject}
                      </span>
                      <span className={`qapi-pill ${resolved.motion.vote.toLowerCase().includes('approved') ? 'qapi-pill--good' : 'qapi-pill--neutral'}`}>
                        {resolved.motion.vote}
                      </span>
                    </div>
                    <Collapsible text={resolved.motion.motionText} />
                    <p className="qapi-decision-meta">
                      Moved by {resolved.motion.mover} &middot; seconded by {resolved.motion.second}
                    </p>
                    <p className="qapi-decision-outcome">{resolved.motion.outcome}</p>
                    {resolved.directive && (
                      <div className="qapi-directive-block">
                        <span className="qapi-directive-label">Directive</span>
                        <p>{resolved.directive.directive}</p>
                        <div className="qapi-directive-meta">
                          <span>Owner: {resolved.directive.owner}</span>
                          <span>Due: {resolved.directive.dueDate}</span>
                          <span className={`qapi-pill qapi-pill--${directiveTone(resolved.directive.status)}`}>{resolved.directive.status}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : draft ? (
                  <div className="qapi-decision-block qapi-decision-block--draft">
                    <span className="qapi-session-badge">Recorded this session &mdash; not yet in approved minutes</span>
                    <p>{draft.directive}</p>
                    <div className="qapi-directive-meta">
                      {draft.owner && <span>Owner: {draft.owner}</span>}
                      {draft.dueDate && <span>Due: {draft.dueDate}</span>}
                    </div>
                    <button type="button" className="qapi-btn-quiet" onClick={() => setOpenFormId(item.id)}>
                      Edit
                    </button>
                  </div>
                ) : openFormId === item.id ? (
                  <RecordDecisionForm onCancel={() => setOpenFormId(null)} onSave={(directive, owner, dueDate) => saveDecision(item, directive, owner, dueDate)} />
                ) : (
                  <button type="button" className="qapi-cta-record" onClick={() => setOpenFormId(item.id)}>
                    <ShieldAlert size={14} aria-hidden="true" />
                    Record Board decision
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {tabletopData && (
        <section className="qapi-section" aria-label="Tabletop rehearsal actions">
          <div className="qapi-section-head">
            <h2>Tabletop rehearsal actions</h2>
            <p>Choose the Board&rsquo;s response to each item, then compare it against the recommended action and rationale.</p>
          </div>
          <div className="qapi-action-list">
            {tabletopData.actions.map((action) => (
              <TabletopActionCard key={action.id} action={action} chosen={chosenOptions[action.id]} onChoose={(option) => chooseOption(action, option)} />
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
