import type { CSSProperties } from "react";
import type {
  PacketEnvelope,
  PacketSignerTask,
  SignatureLifecycleStatus,
} from "@/policy/packets/contracts";

export const SIGNATURE_TRACKING_STATES = [
  { status: "PREPARED", label: "prepared" },
  { status: "SENT", label: "sent" },
  { status: "DELIVERED", label: "delivered" },
  { status: "VIEWED", label: "viewed" },
  { status: "PARTIALLY_SIGNED", label: "partially signed" },
  { status: "COMPLETED", label: "completed" },
  { status: "DECLINED", label: "declined" },
  { status: "EXPIRED", label: "expired" },
  { status: "VOIDED", label: "voided" },
  { status: "FAILED", label: "failed" },
] as const satisfies readonly {
  readonly status: SignatureLifecycleStatus;
  readonly label: string;
}[];

const MAIN_SIGNATURE_STATES = [
  "PREPARED",
  "SENT",
  "DELIVERED",
  "VIEWED",
  "PARTIALLY_SIGNED",
  "COMPLETED",
] as const satisfies readonly SignatureLifecycleStatus[];

const TERMINAL_SIGNATURE_STATES = new Set<SignatureLifecycleStatus>([
  "COMPLETED",
  "DECLINED",
  "EXPIRED",
  "VOIDED",
  "FAILED",
]);

export type SignatureTrackingStepState = "completed" | "current" | "pending";

export interface SignatureTrackingStep {
  readonly status: SignatureLifecycleStatus;
  readonly label: string;
  readonly state: SignatureTrackingStepState;
}

export interface SignatureTrackingCounts {
  readonly total: number | "unknown";
  readonly completed: number | "unknown";
  readonly pending: number | "unknown";
}

export interface SignatureTrackingProps {
  readonly envelope: PacketEnvelope | null;
  readonly signerTasks?: readonly PacketSignerTask[];
  readonly isBusy?: boolean;
  readonly onResend?: () => void;
  readonly onReminder?: () => void;
  readonly onReplaceSigner?: () => void;
  readonly onExtendExpiration?: () => void;
  readonly onVoid?: () => void;
  readonly onReturnForCorrection?: () => void;
}

const styles: Record<string, CSSProperties> = {
  root: {
    display: "grid",
    gap: 14,
    padding: 16,
    background: "#ffffff",
    color: "#172033",
  },
  header: {
    display: "flex",
    alignItems: "start",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    margin: 0,
    fontSize: 18,
    lineHeight: 1.25,
  },
  subtext: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 4,
  },
  badge: {
    border: "1px solid #cfd7e3",
    background: "#f8fafc",
    color: "#263244",
    fontSize: 12,
    fontWeight: 800,
    padding: "5px 8px",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 8,
  },
  metric: {
    border: "1px solid #d9dee7",
    background: "#f8fafc",
    padding: 10,
  },
  metricValue: {
    display: "block",
    fontSize: 18,
    fontWeight: 800,
    fontVariantNumeric: "tabular-nums",
  },
  metricLabel: {
    color: "#64748b",
    fontSize: 12,
  },
  steps: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(96px, 1fr))",
    gap: 8,
  },
  step: {
    border: "1px solid #d9dee7",
    background: "#ffffff",
    minHeight: 58,
    padding: 9,
  },
  stepCompleted: {
    borderColor: "#8bbda8",
    background: "#f0f9f5",
  },
  stepCurrent: {
    borderColor: "#1d4ed8",
    background: "#eff6ff",
  },
  stepState: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase",
  },
  stepLabel: {
    display: "block",
    marginTop: 5,
    color: "#172033",
    fontSize: 13,
    fontWeight: 700,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  button: {
    border: "1px solid #1f6f78",
    background: "#ffffff",
    color: "#155e63",
    cursor: "pointer",
    font: "inherit",
    fontSize: 13,
    fontWeight: 700,
    padding: "8px 10px",
  },
  destructive: {
    borderColor: "#be123c",
    color: "#9f1239",
  },
  disabledButton: {
    borderColor: "#cbd5e1",
    color: "#64748b",
    cursor: "not-allowed",
    opacity: 0.72,
  },
  tableWrap: {
    overflowX: "auto",
    border: "1px solid #d9dee7",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 760,
  },
  th: {
    background: "#f8fafc",
    borderBottom: "1px solid #d9dee7",
    color: "#334155",
    fontSize: 12,
    padding: "8px 10px",
    textAlign: "left",
  },
  td: {
    borderTop: "1px solid #eef2f7",
    color: "#263244",
    fontSize: 13,
    padding: "8px 10px",
    verticalAlign: "top",
  },
  empty: {
    border: "1px solid #d9dee7",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: 13,
    padding: 12,
  },
};

export function SignatureTracking({
  envelope,
  signerTasks,
  isBusy = false,
  onResend,
  onReminder,
  onReplaceSigner,
  onExtendExpiration,
  onVoid,
  onReturnForCorrection,
}: SignatureTrackingProps) {
  const status = normalizeSignatureStatus(envelope?.status);
  const tasks = signerTasks ?? envelope?.signerTasks;
  const counts = signatureTrackingCounts(tasks);
  const canAct = status !== "unknown" && !TERMINAL_SIGNATURE_STATES.has(status) && !isBusy;

  return (
    <section style={styles.root} aria-label="eCIgn signature tracking">
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>eCIgn tracking</h2>
          <div style={styles.subtext}>Envelope {readEnvelopeId(envelope)}</div>
        </div>
        <span style={styles.badge}>{signatureStatusLabel(status)}</span>
      </header>

      <div style={styles.grid} aria-label="signature task counts">
        <Metric label="total signer tasks" value={counts.total} />
        <Metric label="completed" value={counts.completed} />
        <Metric label="pending" value={counts.pending} />
      </div>

      <div style={styles.steps} aria-label="FR-028 eCIgn states">
        {buildSignatureStatusSteps(status).map((step) => (
          <div
            key={step.status}
            style={{
              ...styles.step,
              ...(step.state === "completed" ? styles.stepCompleted : undefined),
              ...(step.state === "current" ? styles.stepCurrent : undefined),
            }}
          >
            <span style={styles.stepState}>{step.state}</span>
            <span style={styles.stepLabel}>{step.label}</span>
          </div>
        ))}
      </div>

      <div style={styles.actions} aria-label="eCIgn tracking actions">
        <ActionButton disabled={!canAct || onResend === undefined} onClick={onResend}>
          Resend
        </ActionButton>
        <ActionButton disabled={!canAct || onReminder === undefined} onClick={onReminder}>
          Reminder
        </ActionButton>
        <ActionButton disabled={!canAct || onReplaceSigner === undefined} onClick={onReplaceSigner}>
          Replace signer
        </ActionButton>
        <ActionButton disabled={!canAct || onExtendExpiration === undefined} onClick={onExtendExpiration}>
          Extend expiration
        </ActionButton>
        <ActionButton disabled={!canAct || onReturnForCorrection === undefined} onClick={onReturnForCorrection}>
          Return for correction
        </ActionButton>
        <ActionButton destructive disabled={!canAct || onVoid === undefined} onClick={onVoid}>
          Void
        </ActionButton>
      </div>

      {tasks === undefined ? (
        <div style={styles.empty}>Signer task status is unknown.</div>
      ) : (
        <SignerTaskTable tasks={tasks} />
      )}
    </section>
  );
}

export function normalizeSignatureStatus(status: unknown): SignatureLifecycleStatus | "unknown" {
  if (typeof status !== "string" || status.trim().length === 0) return "unknown";
  const normalized = status.trim().toUpperCase().replace(/[-\s]+/g, "_");
  if (normalized === "FULLY_SIGNED" || normalized === "SIGNED_LOCKED" || normalized === "COMPLETE") {
    return "COMPLETED";
  }
  return SIGNATURE_TRACKING_STATES.some((entry) => entry.status === normalized)
    ? (normalized as SignatureLifecycleStatus)
    : "unknown";
}

export function signatureStatusLabel(status: SignatureLifecycleStatus | "unknown"): string {
  if (status === "unknown") return "unknown";
  return SIGNATURE_TRACKING_STATES.find((entry) => entry.status === status)?.label ?? "unknown";
}

export function buildSignatureStatusSteps(
  currentStatus: SignatureLifecycleStatus | "unknown",
): readonly SignatureTrackingStep[] {
  const mainIndex = mainStatusIndex(currentStatus);
  return SIGNATURE_TRACKING_STATES.map((entry) => {
    const entryMainIndex = mainStatusIndex(entry.status);
    if (entry.status === currentStatus) {
      return { ...entry, state: "current" };
    }
    if (mainIndex >= 0 && entryMainIndex >= 0 && entryMainIndex < mainIndex) {
      return { ...entry, state: "completed" };
    }
    return { ...entry, state: "pending" };
  });
}

function mainStatusIndex(status: SignatureLifecycleStatus | "unknown"): number {
  return (MAIN_SIGNATURE_STATES as readonly SignatureLifecycleStatus[]).indexOf(
    status as SignatureLifecycleStatus,
  );
}

export function signatureTrackingCounts(
  tasks: readonly PacketSignerTask[] | undefined,
): SignatureTrackingCounts {
  if (tasks === undefined) {
    return {
      total: "unknown",
      completed: "unknown",
      pending: "unknown",
    };
  }
  const completed = tasks.filter((task) => normalizeSignatureStatus(task.status) === "COMPLETED").length;
  return {
    total: tasks.length,
    completed,
    pending: tasks.length - completed,
  };
}

function Metric({ label, value }: { readonly label: string; readonly value: number | "unknown" }) {
  return (
    <div style={styles.metric}>
      <span style={styles.metricValue}>{value === "unknown" ? "unknown" : String(value)}</span>
      <span style={styles.metricLabel}>{label}</span>
    </div>
  );
}

function ActionButton({
  children,
  destructive = false,
  disabled,
  onClick,
}: {
  readonly children: string;
  readonly destructive?: boolean;
  readonly disabled: boolean;
  readonly onClick?: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        ...styles.button,
        ...(destructive ? styles.destructive : undefined),
        ...(disabled ? styles.disabledButton : undefined),
      }}
      type="button"
    >
      {children}
    </button>
  );
}

function SignerTaskTable({ tasks }: { readonly tasks: readonly PacketSignerTask[] }) {
  if (tasks.length === 0) {
    return <div style={styles.empty}>No signer tasks are assigned.</div>;
  }
  return (
    <div style={styles.tableWrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Required capacity</th>
            <th style={styles.th}>Signer</th>
            <th style={styles.th}>Authority verified</th>
            <th style={styles.th}>Order</th>
            <th style={styles.th}>Required/optional</th>
            <th style={styles.th}>Dual-capacity rule</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.signerTaskId}>
              <td style={styles.td}>{task.requiredCapacity || "unknown"}</td>
              <td style={styles.td}>{formatSigner(task)}</td>
              <td style={styles.td}>{task.authorityVerified ? "verified" : "not verified"}</td>
              <td style={styles.td}>{Number.isFinite(task.order) ? String(task.order) : "unknown"}</td>
              <td style={styles.td}>{task.required ? "required" : "optional"}</td>
              <td style={styles.td}>{task.dualCapacityRuleId ?? "none"}</td>
              <td style={styles.td}>{signatureStatusLabel(normalizeSignatureStatus(task.status))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatSigner(task: PacketSignerTask): string {
  const name = task.signerName ?? "unknown";
  const email = task.signerEmail ?? "unknown";
  const role = task.signerRole ?? "unknown";
  return `${name} | ${email} | ${role}`;
}

function readEnvelopeId(envelope: PacketEnvelope | null): string {
  if (envelope === null) return "unknown";
  const record = envelope as unknown as Record<string, unknown>;
  const envelopeId = record["envelopeId"] ?? record["id"];
  return typeof envelopeId === "string" && envelopeId.trim().length > 0 ? envelopeId : "unknown";
}
