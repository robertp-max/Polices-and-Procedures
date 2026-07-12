import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { PacketModel } from "@/policy/packets/contracts";
import { OutlinePanel } from "./OutlinePanel";
import { PreviewPanel } from "./PreviewPanel";
import { EditTab } from "./tabs/EditTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { SourcesTab } from "./tabs/SourcesTab";
import { ValidationTab } from "./tabs/ValidationTab";

export type WorkspaceTabId = "edit" | "sources" | "validation" | "history";

export type WorkspaceEditIntent =
  | "narrative"
  | "commentary"
  | "decisions"
  | "actions"
  | "owners"
  | "mark-unknown"
  | "reject-finding"
  | "confirm-reject-trigger";

export type WorkspaceEditSubmission = {
  readonly fieldPath: string;
  readonly value: string;
  readonly intent: WorkspaceEditIntent;
  readonly targetId?: string;
  readonly owner?: string;
  readonly comment?: string;
};

export type WorkspaceEditResult = {
  readonly accepted: boolean;
  readonly reason?: string;
  readonly message?: string;
  readonly edit?: WorkspaceEditSubmission;
  readonly packetModel?: unknown;
  readonly validationResult?: unknown;
  readonly updatedAt?: string;
  readonly auditId?: string;
};

export type WorkspaceTabContext = {
  readonly packetId: string;
  readonly packet: unknown;
  readonly sources: unknown;
  readonly validationResult: unknown;
  readonly history: unknown;
  readonly readOnly: boolean;
  readonly onSubmitEdit?: (
    edit: WorkspaceEditSubmission,
  ) => Promise<WorkspaceEditResult | void> | WorkspaceEditResult | void;
  readonly onPacketChange?: (packetModel: unknown, validationResult?: unknown) => void;
};

export type WorkspaceTabProps = {
  readonly context: WorkspaceTabContext;
};

export type WorkspaceShellProps = {
  readonly initialPacket?: unknown;
  readonly initialSources?: unknown;
  readonly initialValidationResult?: unknown;
  readonly initialHistory?: unknown;
  readonly initialTab?: WorkspaceTabId;
  readonly readOnly?: boolean;
  readonly onSubmitEdit?: (
    edit: WorkspaceEditSubmission,
  ) => Promise<WorkspaceEditResult | void> | WorkspaceEditResult | void;
};

type TabDefinition = {
  readonly id: WorkspaceTabId;
  readonly label: string;
};

type WorkspaceHistoryEntry = {
  readonly id: string;
  readonly timestamp: string;
  readonly actor: string;
  readonly fieldPath: string;
  readonly summary: string;
};

type WorkspaceValidationResult = {
  readonly status: string;
  readonly counts: {
    readonly errors: number;
    readonly warnings: number;
    readonly info: number;
    readonly total: number;
  };
  readonly issues: readonly {
    readonly id: string;
    readonly severity: string;
    readonly message: string;
    readonly path: string;
  }[];
};

export const WORKSPACE_TABS: readonly TabDefinition[] = [
  { id: "edit", label: "Edit" },
  { id: "sources", label: "Sources" },
  { id: "validation", label: "Validation" },
  { id: "history", label: "History" },
];

const DEFAULT_RENDER_PAYLOAD = {
  roll: {
    window: {
      eventDate: "2026-07-10",
      quarterStart: "2026-04-01",
      quarterEnd: "2026-06-30",
      dataThroughDate: "2026-06-30",
      packetType: "final",
      title: "Q2 2026 QAPI Review (Final)",
      quarterLabel: "Q2 2026",
    },
    census: {
      patientsInScope: 12,
      activeCensus: 9,
      discharged: 2,
      recertDue: 3,
      highAcuity: 4,
      uniquePatients: 11,
      duplicateClientIds: ["PT-002"],
    },
    highRisk: {
      immediateActionCases: 1,
      qapiRequiredCases: 2,
      topFlags: [{ flag: "fall_with_injury", count: 1 }],
      systemicThemes: [],
    },
    incidents: {
      total: 2,
      byCategory: { fall: 1, medication: 1 },
      openRca: 1,
      unreported: 0,
      excludedFutureDated: 0,
    },
    infections: {
      total: 1,
      healthcareAssociated: 1,
      communityAcquired: 0,
      unreportedToState: 0,
      excludedFutureDated: 0,
    },
    labs: {
      criticalTotal: 1,
      criticalUnreported: 1,
    },
    documentation: {
      oasisLateSoc: 1,
      pocMissingF2F: 1,
      pocUnsignedOrMissingSignature: 0,
      homeboundNotJustified: 1,
      medReconMismatch: 0,
      pressureInjuryNoWoundOrders: 0,
      therapyNeedNoOrder: 0,
    },
    exceptions: [],
  },
  ref: {
    addendumId: "QAPI-HR-ADDENDUM-2026-Q2",
    hash: "hash-001",
    personnelActionReviewsOpened: 1,
    countByCategory: { unreported_critical_labs: 1 },
    statusSummary: "Confidential personnel action review opened.",
    confidentialityStatement: "Confidential personnel details retained under restricted access.",
  },
  packetId: "QAPI-PKT-Q2-2026",
  eventId: "QAPI-2026-Q2",
  workflowId: "QA-WF-03",
  preparedBy: "Packet system",
  reviewer: "Quality reviewer",
  chair: "Director of Nursing",
  recorder: "QA coordinator",
  policyIds: ["QA-PP-001"],
  approvers: [{ role: "DON", name: "Dakota Director", authorityConfirmed: true }],
  quorumOverride: null,
  attendanceNote: null,
  derivedNotice: null,
  unknownPaths: [],
  syntheticWatermark: "SYNTHETIC UAT DATA - NO REAL PHI - NOT FOR PRODUCTION",
  sourceAgency: "Northwind Synthetic Home Health Agency",
  datasetId: "QAPI-Q2-DS-001",
  addendumRequired: true,
  attendeesExpected: ["Director of Nursing", "Administrator", "QA Coordinator"],
  attendeesPresent: ["Director of Nursing", "Administrator", "QA Coordinator"],
  lock: {
    pass: false,
    statusText: "NOT LOCKABLE - 2 blocking item(s)",
    findings: [],
  },
};

export const DEFAULT_WORKSPACE_VALIDATION: WorkspaceValidationResult = {
  status: "blocked",
  counts: {
    errors: 2,
    warnings: 1,
    info: 0,
    total: 3,
  },
  issues: [
    {
      id: "val-blocker-signature",
      severity: "error",
      message: "Administrator signature is missing.",
      path: "signatures.administrator",
    },
    {
      id: "val-blocker-minutes",
      severity: "error",
      message: "Minutes approval evidence is missing.",
      path: "sources.minutesApproval",
    },
    {
      id: "val-warning-date",
      severity: "warning",
      message: "One source was updated after packet generation.",
      path: "sources.dashboard",
    },
  ],
};

export const DEFAULT_WORKSPACE_SOURCES = [
  {
    id: "src-minutes",
    title: "QAPI minutes",
    status: "attached",
    location: "drive://qapi/q2/minutes",
  },
  {
    id: "src-dashboard",
    title: "Quality KPI dashboard",
    status: "attached",
    location: "drive://qapi/q2/dashboard",
  },
] as const;

export const DEFAULT_WORKSPACE_HISTORY: readonly WorkspaceHistoryEntry[] = [
  {
    id: "hist-created",
    timestamp: "2026-07-12T08:00:00.000Z",
    actor: "Packet system",
    fieldPath: "workspace",
    summary: "Workspace opened.",
  },
];

export const DEFAULT_WORKSPACE_PACKET = {
  identity: {
    packetInstanceId: "QAPI-PKT-Q2-2026",
    packetId: "QAPI-PKT-Q2-2026",
    packetVersion: 1,
    contentHash: null,
    agencyId: "Northwind Synthetic Home Health Agency",
    eventFamilyId: "qapi_meeting",
    eventInstanceId: "QAPI-2026-Q2",
    workflowId: "QA-WF-03",
    workflowInstanceId: "QA-WF-03:2026-Q2",
    packetTemplateId: "qapi-quarterly",
    archetypeId: "analytical-report",
    subtype: "final",
    reportingPeriodStart: "2026-04-01",
    reportingPeriodEnd: "2026-06-30",
    dataThroughDate: "2026-06-30",
    status: "DRAFT_GENERATED",
  },
  renderingProfileId: "qapi-analytical",
  classification: "synthetic-uat",
  handlingNotice: "Synthetic UAT packet for workspace verification.",
  modules: [
    {
      moduleInstanceId: "QAPI-PKT-Q2-2026:qapi-cover-page",
      moduleId: "qapi-cover-page",
      title: "QAPI cover page",
      order: 1,
      status: "complete",
      payload: DEFAULT_RENDER_PAYLOAD,
      contentHash: null,
    },
  ],
  pagePlan: null,
  kpis: [{ id: "completion-rate", label: "KPI completion rate", value: "95%" }],
  findings: [{ id: "finding-critical-lab", severity: "blocker" }],
  workflows: [{ id: "QA-WF-03", status: "active" }],
  decisions: [{ id: "decision-committee-review", status: "pending" }],
  forms: [{ id: "form-qapi-minutes", status: "complete" }],
  attachments: DEFAULT_WORKSPACE_SOURCES,
  confidentialAddendums: [{ id: "QAPI-HR-ADDENDUM-2026-Q2", status: "restricted" }],
  signatures: [{ id: "administrator", status: "missing" }],
  validationStatus: "blocked",
} satisfies PacketModel & Record<string, unknown>;

const styles: Record<string, CSSProperties> = {
  root: {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    minHeight: 720,
    height: "100%",
    background: "#f8fafc",
    color: "#162033",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "14px 16px",
    borderBottom: "1px solid #d9dee7",
    background: "#ffffff",
  },
  title: {
    margin: 0,
    fontSize: 18,
    lineHeight: 1.2,
  },
  status: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  panels: {
    display: "grid",
    gridTemplateColumns: "240px minmax(360px, 1fr) 360px",
    minHeight: 0,
  },
  panel: {
    minWidth: 0,
    minHeight: 0,
    borderRight: "1px solid #d9dee7",
    background: "#ffffff",
  },
  previewPanel: {
    minWidth: 0,
    minHeight: 0,
    borderRight: "1px solid #d9dee7",
    background: "#eef2f7",
  },
  tabsPanel: {
    minWidth: 0,
    minHeight: 0,
    background: "#ffffff",
    display: "grid",
    gridTemplateRows: "auto 1fr",
  },
  tabs: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    borderBottom: "1px solid #d9dee7",
  },
  tab: {
    border: 0,
    borderRight: "1px solid #e3e7ee",
    background: "#f8fafc",
    color: "#334155",
    cursor: "pointer",
    font: "inherit",
    fontSize: 13,
    fontWeight: 700,
    padding: "11px 8px",
  },
  activeTab: {
    background: "#ffffff",
    color: "#0f172a",
    boxShadow: "inset 0 -2px 0 #1d4ed8",
  },
  tabPanel: {
    minHeight: 0,
    overflow: "auto",
  },
};

export function cloneWorkspacePacket<T>(packet: T): T {
  return JSON.parse(JSON.stringify(packet)) as T;
}

export function getWorkspacePacketId(packet: unknown): string {
  const record = asRecord(packet);
  const identity = asRecord(record?.identity);
  return readString(identity?.packetId) ?? readString(record?.packetId) ?? "workspace-packet";
}

export function getWorkspacePacketTitle(packet: unknown): string {
  const record = asRecord(packet);
  const identity = asRecord(record?.identity);
  return (
    readString(record?.title) ??
    readString(identity?.packetId) ??
    readString(record?.packetId) ??
    "Packet workspace"
  );
}

export function WorkspaceShell({
  initialPacket = DEFAULT_WORKSPACE_PACKET,
  initialSources,
  initialValidationResult = DEFAULT_WORKSPACE_VALIDATION,
  initialHistory = DEFAULT_WORKSPACE_HISTORY,
  initialTab = "edit",
  readOnly = false,
  onSubmitEdit,
}: WorkspaceShellProps) {
  const [packet, setPacket] = useState(() => cloneWorkspacePacket(initialPacket));
  const [validationResult, setValidationResult] = useState(() =>
    cloneWorkspacePacket(initialValidationResult),
  );
  const [history, setHistory] = useState(() => cloneWorkspacePacket(initialHistory));
  const [activeTab, setActiveTab] = useState<WorkspaceTabId>(initialTab);
  const [selectedOutlineId, setSelectedOutlineId] = useState("sections");
  const packetId = getWorkspacePacketId(packet);
  const title = getWorkspacePacketTitle(packet);

  const context = useMemo<WorkspaceTabContext>(
    () => ({
      packetId,
      packet,
      sources: initialSources ?? packet,
      validationResult,
      history,
      readOnly,
      onSubmitEdit: async (edit) => {
        const result = await onSubmitEdit?.(edit);
        if (result === undefined || result.accepted !== false) {
          setHistory((current: ReturnType<typeof cloneWorkspacePacket>) => [
            {
              id: result?.auditId ?? `edit-${Date.now()}`,
              timestamp: result?.updatedAt ?? new Date().toISOString(),
              actor: "Workspace editor",
              fieldPath: edit.fieldPath,
              summary: result?.message ?? `${edit.intent} edit accepted.`,
            },
            ...historyRows(current),
          ]);
        }
        return result;
      },
      onPacketChange: (packetModel, nextValidationResult) => {
        setPacket(cloneWorkspacePacket(packetModel));
        if (nextValidationResult !== undefined) {
          setValidationResult(cloneWorkspacePacket(nextValidationResult));
        }
      },
    }),
    [history, initialSources, onSubmitEdit, packet, packetId, readOnly, validationResult],
  );

  return (
    <section style={styles.root} aria-label="Packet workspace">
      <header style={styles.header}>
        <h1 style={styles.title}>{title}</h1>
        <span style={styles.status}>{readValidationStatus(validationResult)}</span>
      </header>

      <div style={styles.panels}>
        <aside style={styles.panel}>
          <OutlinePanel
            packet={packet}
            validationResult={validationResult}
            selectedId={selectedOutlineId}
            onSelect={setSelectedOutlineId}
          />
        </aside>

        <main style={styles.previewPanel}>
          <PreviewPanel packet={packet} selectedOutlineId={selectedOutlineId} />
        </main>

        <aside style={styles.tabsPanel}>
          <nav aria-label="Packet workspace tabs" role="tablist" style={styles.tabs}>
            {WORKSPACE_TABS.map((tab) => (
              <button
                aria-controls={`workspace-panel-${tab.id}`}
                aria-selected={activeTab === tab.id}
                id={`workspace-tab-${tab.id}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                style={{
                  ...styles.tab,
                  ...(activeTab === tab.id ? styles.activeTab : undefined),
                }}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <section
            aria-labelledby={`workspace-tab-${activeTab}`}
            id={`workspace-panel-${activeTab}`}
            role="tabpanel"
            style={styles.tabPanel}
          >
            {activeTab === "edit" ? <EditTab context={context} /> : null}
            {activeTab === "sources" ? <SourcesTab context={context} /> : null}
            {activeTab === "validation" ? <ValidationTab context={context} /> : null}
            {activeTab === "history" ? <HistoryTab context={context} /> : null}
          </section>
        </aside>
      </div>
    </section>
  );
}

function historyRows(value: unknown): WorkspaceHistoryEntry[] {
  return Array.isArray(value) ? (value as WorkspaceHistoryEntry[]) : [];
}

function readValidationStatus(validationResult: unknown): string {
  const record = asRecord(validationResult);
  return readString(record?.status) ?? readString(record?.validationStatus) ?? "unknown";
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}
