import type { CSSProperties } from "react";
import type * as PacketContracts from "@/policy/packets/contracts";

export type OutlineContractModule = typeof PacketContracts;

const outlineLabels = [
  "sections",
  "KPIs",
  "findings",
  "workflows",
  "decisions",
  "forms",
  "attachments",
  "confidential addendums",
  "signatures",
  "validation status",
] as const;

export type WorkspaceOutlineLabel = (typeof outlineLabels)[number];

export type WorkspaceOutlineItem = {
  readonly id: string;
  readonly label: WorkspaceOutlineLabel;
  readonly count: number | "unknown";
  readonly status?: string;
};

export type OutlinePanelProps = {
  readonly packet: unknown;
  readonly validationResult?: unknown;
  readonly selectedId?: string;
  readonly onSelect?: (outlineId: string) => void;
};

type RecordLike = Record<string, unknown>;

const styles: Record<string, CSSProperties> = {
  root: {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    height: "100%",
    minHeight: 0,
  },
  heading: {
    margin: 0,
    padding: "14px 14px 10px",
    fontSize: 13,
    fontWeight: 700,
    color: "#263244",
    borderBottom: "1px solid #e3e7ee",
  },
  list: {
    display: "grid",
    alignContent: "start",
    gap: 4,
    listStyle: "none",
    margin: 0,
    padding: 10,
    overflow: "auto",
  },
  button: {
    width: "100%",
    border: "1px solid transparent",
    background: "transparent",
    color: "#263244",
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 8,
    alignItems: "center",
    padding: "9px 10px",
    textAlign: "left",
    font: "inherit",
    fontSize: 13,
  },
  selectedButton: {
    background: "#eef4ff",
    borderColor: "#c7d7fe",
  },
  count: {
    color: "#64748b",
    fontVariantNumeric: "tabular-nums",
  },
  status: {
    gridColumn: "1 / -1",
    color: "#64748b",
    fontSize: 12,
  },
};

export function buildWorkspaceOutline(
  packet: unknown,
  validationResult?: unknown,
): readonly WorkspaceOutlineItem[] {
  return outlineLabels.map((label) => ({
    id: label.replace(/\s+/g, "-").toLowerCase(),
    label,
    count: label === "validation status" ? getValidationIssueCount(validationResult) : countForLabel(packet, label),
    status: label === "validation status" ? readStatus(validationResult, packet) : undefined,
  }));
}

export function OutlinePanel({
  packet,
  validationResult,
  selectedId,
  onSelect,
}: OutlinePanelProps) {
  const outline = buildWorkspaceOutline(packet, validationResult);

  return (
    <nav style={styles.root} aria-label="packet outline">
      <h2 style={styles.heading}>Outline</h2>
      <ul style={styles.list}>
        {outline.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <li key={item.id}>
              <button
                type="button"
                data-outline-id={item.id}
                aria-current={isSelected ? "true" : undefined}
                style={{
                  ...styles.button,
                  ...(isSelected ? styles.selectedButton : undefined),
                }}
                onClick={() => onSelect?.(item.id)}
              >
                <span>{item.label}</span>
                <span style={styles.count}>{formatCount(item.count)}</span>
                {item.status ? <span style={styles.status}>{item.status}</span> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function countForLabel(packet: unknown, label: WorkspaceOutlineLabel): number | "unknown" {
  if (label === "validation status") {
    return "unknown";
  }

  const keysByLabel: Record<Exclude<WorkspaceOutlineLabel, "validation status">, readonly string[]> = {
    sections: ["sections", "packetSections", "renderSections", "modules"],
    KPIs: ["kpis", "KPIs", "kpiDashboard", "kpiSummaries", "metrics"],
    findings: ["findings", "findingRegister", "trendFindings"],
    workflows: ["workflows", "workflowStates", "routingWorkflows"],
    decisions: ["decisions", "decisionsRequested", "determinations"],
    forms: ["forms", "formPages", "formPackets"],
    attachments: ["attachments", "attachmentManifest", "sourceAttachments"],
    "confidential addendums": [
      "confidentialAddendums",
      "confidentialAddenda",
      "restrictedAddendums",
      "addendums",
      "addenda",
      "supplementalAddendums",
    ],
    signatures: ["signatures", "signatureStatus", "approvalSignatures"],
  };

  return countFirstPresent(packet, keysByLabel[label]);
}

function countFirstPresent(source: unknown, keys: readonly string[]): number | "unknown" {
  const record = asRecord(source);
  if (!record) {
    return "unknown";
  }

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      return countKnownCollection(record[key]);
    }
  }

  return "unknown";
}

function countKnownCollection(value: unknown): number | "unknown" {
  if (Array.isArray(value)) {
    return value.length;
  }
  const record = asRecord(value);
  if (record) {
    return Object.keys(record).length;
  }
  return "unknown";
}

function getValidationIssueCount(validationResult: unknown): number | "unknown" {
  const record = asRecord(validationResult);
  if (!record) {
    return "unknown";
  }
  const issues = record.issues;
  if (Array.isArray(issues)) {
    return issues.length;
  }
  const counts = asRecord(record.counts);
  if (counts) {
    const total = readNumber(counts.total);
    if (total !== undefined) {
      return total;
    }
  }
  return "unknown";
}

function readStatus(validationResult: unknown, packet: unknown): string | undefined {
  const validation = asRecord(validationResult);
  const validationStatus = readString(validation?.status) ?? readString(validation?.validationStatus);
  if (validationStatus) {
    return validationStatus;
  }

  const packetRecord = asRecord(packet);
  return readString(packetRecord?.validationStatus);
}

function formatCount(count: number | "unknown"): string {
  return count === "unknown" ? "unknown" : String(count);
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asRecord(value: unknown): RecordLike | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as RecordLike)
    : undefined;
}
