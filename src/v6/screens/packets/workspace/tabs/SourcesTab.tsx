import type { CSSProperties } from "react";
import type * as PacketContracts from "@/policy/packets/contracts";
import type { WorkspaceTabProps } from "../WorkspaceShell";

export type SourcesContractModule = typeof PacketContracts;

type SourceRow = {
  readonly id: string;
  readonly title: string;
  readonly status: string;
  readonly location: string;
};

type RecordLike = Record<string, unknown>;

const styles: Record<string, CSSProperties> = {
  root: {
    display: "grid",
    gap: 12,
    padding: 14,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  header: {
    color: "#334155",
    fontSize: 12,
    textAlign: "left",
    borderBottom: "1px solid #d9dee7",
    padding: "7px 6px",
  },
  cell: {
    borderBottom: "1px solid #eef1f5",
    color: "#263244",
    padding: "8px 6px",
    verticalAlign: "top",
  },
  empty: {
    color: "#64748b",
    fontSize: 13,
  },
};

export function SourcesTab({ context }: WorkspaceTabProps) {
  const rows = buildSourceRows(context.sources ?? context.packet);

  return (
    <section style={styles.root} aria-label="packet sources">
      {rows.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.header}>ID</th>
              <th style={styles.header}>Source</th>
              <th style={styles.header}>Status</th>
              <th style={styles.header}>Location</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td style={styles.cell}>{row.id}</td>
                <td style={styles.cell}>{row.title}</td>
                <td style={styles.cell}>{row.status}</td>
                <td style={styles.cell}>{row.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={styles.empty}>No sources available.</div>
      )}
    </section>
  );
}

export function buildSourceRows(sourceInput: unknown): readonly SourceRow[] {
  const sourceList = Array.isArray(sourceInput)
    ? sourceInput
    : firstArrayAtKeys(sourceInput, ["sources", "sourceUtilization", "evidence", "attachments"]);

  return sourceList.map((source, index) => {
    const record = asRecord(source);
    return {
      id: readString(record?.id) ?? readString(record?.sourceId) ?? `source-${index + 1}`,
      title: readString(record?.title) ?? readString(record?.name) ?? readString(record?.label) ?? "unknown",
      status: readString(record?.status) ?? readString(record?.validationStatus) ?? "unknown",
      location: readString(record?.location) ?? readString(record?.url) ?? readString(record?.path) ?? "unknown",
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
