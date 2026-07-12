import type { CSSProperties } from "react";
import type {
  PacketEnvelope,
  PacketSignerTask,
  SignatureLifecycleStatus,
} from "@/policy/packets/contracts";
import {
  normalizeSignatureStatus,
  signatureStatusLabel,
  signatureTrackingCounts,
} from "./SignatureTracking";

export interface EnvelopePreparationProps {
  readonly envelope: PacketEnvelope | null;
  readonly signerTasks?: readonly PacketSignerTask[];
  readonly packetTitle?: string;
  readonly previewUrl?: string | null;
  readonly isBusy?: boolean;
  readonly onSendNow?: () => void;
  readonly onScheduleSend?: () => void;
  readonly onSavePrepared?: () => void;
  readonly onCancelBeforeSend?: () => void;
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
  summary: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 8,
  },
  field: {
    border: "1px solid #d9dee7",
    background: "#f8fafc",
    minWidth: 0,
    padding: 10,
  },
  label: {
    display: "block",
    color: "#64748b",
    fontSize: 12,
    marginBottom: 5,
  },
  value: {
    display: "block",
    color: "#172033",
    fontSize: 13,
    fontWeight: 700,
    overflowWrap: "anywhere",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  button: {
    border: "1px solid #1d4ed8",
    background: "#1d4ed8",
    color: "#ffffff",
    cursor: "pointer",
    font: "inherit",
    fontSize: 13,
    fontWeight: 700,
    padding: "8px 10px",
  },
  secondaryButton: {
    background: "#ffffff",
    color: "#1d4ed8",
  },
  destructiveButton: {
    borderColor: "#be123c",
    background: "#ffffff",
    color: "#9f1239",
  },
  disabledButton: {
    borderColor: "#cbd5e1",
    background: "#e2e8f0",
    color: "#64748b",
    cursor: "not-allowed",
  },
  tableWrap: {
    overflowX: "auto",
    border: "1px solid #d9dee7",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 840,
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
  preview: {
    border: "1px solid #d9dee7",
    background: "#f8fafc",
    minHeight: 120,
    padding: 12,
  },
  previewLink: {
    color: "#1d4ed8",
    fontSize: 13,
    fontWeight: 700,
  },
  empty: {
    border: "1px solid #d9dee7",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: 13,
    padding: 12,
  },
};

export function EnvelopePreparation({
  envelope,
  signerTasks,
  packetTitle,
  previewUrl,
  isBusy = false,
  onSendNow,
  onScheduleSend,
  onSavePrepared,
  onCancelBeforeSend,
}: EnvelopePreparationProps) {
  const status = normalizeSignatureStatus(envelope?.status);
  const tasks = signerTasks ?? envelope?.signerTasks;
  const counts = signatureTrackingCounts(tasks);
  const canPrepareAction = isPreparedEnvelopeActionEnabled(status, isBusy);

  return (
    <section style={styles.root} aria-label="eCIgn envelope preparation">
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>Envelope preparation</h2>
          <div style={styles.subtext}>{packetTitle ?? "Packet title unknown"}</div>
        </div>
        <span style={styles.badge}>{signatureStatusLabel(status)}</span>
      </header>

      <div style={styles.summary} aria-label="prepared envelope binding">
        <SummaryField label="Envelope ID" value={readEnvelopeId(envelope)} />
        <SummaryField label="Approved version" value={readApprovedVersion(envelope)} />
        <SummaryField label="Content hash" value={readContentHash(envelope)} />
        <SummaryField label="Signer tasks" value={formatCount(counts.total)} />
      </div>

      <div style={styles.actions} aria-label="prepared envelope actions">
        <ActionButton disabled={!canPrepareAction || onSendNow === undefined} onClick={onSendNow}>
          Send now
        </ActionButton>
        <ActionButton secondary disabled={!canPrepareAction || onScheduleSend === undefined} onClick={onScheduleSend}>
          Schedule send
        </ActionButton>
        <ActionButton secondary disabled={isBusy || onSavePrepared === undefined} onClick={onSavePrepared}>
          Save prepared envelope
        </ActionButton>
        <ActionButton destructive disabled={!canPrepareAction || onCancelBeforeSend === undefined} onClick={onCancelBeforeSend}>
          Cancel before send
        </ActionButton>
      </div>

      {previewUrl ? (
        <div style={styles.preview}>
          <a href={previewUrl} rel="noreferrer" style={styles.previewLink} target="_blank">
            Envelope preview
          </a>
        </div>
      ) : (
        <div style={styles.preview}>Envelope preview unavailable.</div>
      )}

      {tasks === undefined ? (
        <div style={styles.empty}>Signer confirmation status is unknown.</div>
      ) : (
        <SignerConfirmationTable tasks={tasks} />
      )}
    </section>
  );
}

export function isPreparedEnvelopeActionEnabled(
  status: SignatureLifecycleStatus | "unknown",
  isBusy: boolean,
): boolean {
  return status === "PREPARED" && !isBusy;
}

function SummaryField({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div style={styles.field}>
      <span style={styles.label}>{label}</span>
      <span style={styles.value}>{value}</span>
    </div>
  );
}

function ActionButton({
  children,
  destructive = false,
  disabled,
  onClick,
  secondary = false,
}: {
  readonly children: string;
  readonly destructive?: boolean;
  readonly disabled: boolean;
  readonly onClick?: () => void;
  readonly secondary?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        ...styles.button,
        ...(secondary ? styles.secondaryButton : undefined),
        ...(destructive ? styles.destructiveButton : undefined),
        ...(disabled ? styles.disabledButton : undefined),
      }}
      type="button"
    >
      {children}
    </button>
  );
}

function SignerConfirmationTable({ tasks }: { readonly tasks: readonly PacketSignerTask[] }) {
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
            <th style={styles.th}>Attachment access</th>
            <th style={styles.th}>Due date</th>
            <th style={styles.th}>Expiration</th>
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
              <td style={styles.td}>{task.attachmentAccessGranted ? "granted" : "not granted"}</td>
              <td style={styles.td}>{task.dueDate ?? "unknown"}</td>
              <td style={styles.td}>{task.expiresAt ?? "unknown"}</td>
              <td style={styles.td}>{signatureStatusLabel(normalizeSignatureStatus(task.status))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function readEnvelopeId(envelope: PacketEnvelope | null): string {
  return readString(envelope, ["envelopeId", "id"]) ?? "unknown";
}

function readApprovedVersion(envelope: PacketEnvelope | null): string {
  const version = readNumber(envelope, ["frozenPacketVersion"]);
  if (version !== undefined) return `v${version}`;
  return readString(envelope, ["packetVersionId", "versionId"]) ?? "unknown";
}

function readContentHash(envelope: PacketEnvelope | null): string {
  return readString(envelope, ["contentHash", "packetVersionHash"]) ?? "unknown";
}

function readString(record: unknown, keys: readonly string[]): string | undefined {
  if (record === null || typeof record !== "object") return undefined;
  const values = record as Record<string, unknown>;
  for (const key of keys) {
    const value = values[key];
    if (typeof value === "string" && value.trim().length > 0) return value;
  }
  return undefined;
}

function readNumber(record: unknown, keys: readonly string[]): number | undefined {
  if (record === null || typeof record !== "object") return undefined;
  const values = record as Record<string, unknown>;
  for (const key of keys) {
    const value = values[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

function formatSigner(task: PacketSignerTask): string {
  const name = task.signerName ?? "unknown";
  const email = task.signerEmail ?? "unknown";
  const role = task.signerRole ?? "unknown";
  return `${name} | ${email} | ${role}`;
}

function formatCount(value: number | "unknown"): string {
  return value === "unknown" ? "unknown" : String(value);
}
