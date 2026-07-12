import type { CSSProperties } from "react";
import type * as PacketContracts from "@/policy/packets/contracts";
import type { WorkspaceTabProps } from "../WorkspaceShell";

export type HistoryContractModule = typeof PacketContracts;

type HistoryRow = {
  readonly id: string;
  readonly timestamp: string;
  readonly actor: string;
  readonly fieldPath: string;
  readonly summary: string;
};

type RecordLike = Record<string, unknown>;

const styles: Record<string, CSSProperties> = {
  root: {
    display: "grid",
    gap: 10,
    padding: 14,
  },
  list: {
    display: "grid",
    gap: 8,
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  item: {
    border: "1px solid #d9dee7",
    padding: 10,
  },
  meta: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    color: "#64748b",
    fontSize: 12,
  },
  fieldPath: {
    color: "#334155",
    fontSize: 13,
    fontWeight: 700,
    marginTop: 5,
  },
  summary: {
    color: "#263244",
    fontSize: 13,
    marginTop: 5,
  },
  empty: {
    color: "#64748b",
    fontSize: 13,
  },
};

export function HistoryTab({ context }: WorkspaceTabProps) {
  const rows = buildHistoryRows(context.history ?? context.packet);

  return (
    <section style={styles.root} aria-label="packet edit history">
      {rows.length > 0 ? (
        <ul style={styles.list}>
          {rows.map((row) => (
            <li key={row.id} style={styles.item}>
              <div style={styles.meta}>
                <span>{row.id}</span>
                <span>{row.timestamp}</span>
                <span>{row.actor}</span>
              </div>
              <div style={styles.fieldPath}>{row.fieldPath}</div>
              <div style={styles.summary}>{row.summary}</div>
            </li>
          ))}
        </ul>
      ) : (
        <div style={styles.empty}>No edit history available.</div>
      )}
    </section>
  );
}

export function buildHistoryRows(historyInput: unknown): readonly HistoryRow[] {
  const entries = Array.isArray(historyInput)
    ? historyInput
    : firstArrayAtKeys(historyInput, ["history", "editHistory", "auditTrail", "edits"]);

  return entries.map((entry, index) => {
    const record = asRecord(entry);
    return {
      id: readString(record?.id) ?? readString(record?.auditId) ?? `history-${index + 1}`,
      timestamp: readString(record?.timestamp) ?? readString(record?.updatedAt) ?? readString(record?.createdAt) ?? "unknown",
      actor: readString(record?.actor) ?? readString(record?.user) ?? readString(record?.owner) ?? "unknown",
      fieldPath: readString(record?.fieldPath) ?? readString(record?.path) ?? "unknown",
      summary: readString(record?.summary) ?? readString(record?.message) ?? readString(record?.comment) ?? "unknown",
    };
  });
}

function firstArrayAtKeys(source: unknown, keys: readonly string[]): readonly unknown[] {
  const record = asRecord(source);
  if (!record) {
    return [];
  }
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value;
    }
  }
  return [];
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function asRecord(value: unknown): RecordLike | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as RecordLike)
    : undefined;
}
