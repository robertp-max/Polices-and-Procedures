import type { CSSProperties } from "react";
import type * as PacketContracts from "@/policy/packets/contracts";
import type { WorkspaceTabProps } from "../WorkspaceShell";

export type ValidationContractModule = typeof PacketContracts;

export type ValidationCount = number | "unknown";

export type ValidationCounts = {
  readonly errors: ValidationCount;
  readonly warnings: ValidationCount;
  readonly info: ValidationCount;
  readonly total: ValidationCount;
};

type ValidationIssueRow = {
  readonly id: string;
  readonly severity: string;
  readonly message: string;
  readonly path: string;
};

type RecordLike = Record<string, unknown>;

const styles: Record<string, CSSProperties> = {
  root: {
    display: "grid",
    gap: 14,
    padding: 14,
  },
  status: {
    color: "#334155",
    fontSize: 13,
    fontWeight: 700,
  },
  counts: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 8,
  },
  countBox: {
    border: "1px solid #d9dee7",
    background: "#f8fafc",
    padding: 9,
  },
  countValue: {
    display: "block",
    color: "#162033",
    fontSize: 18,
    fontWeight: 800,
    fontVariantNumeric: "tabular-nums",
  },
  countLabel: {
    color: "#64748b",
    fontSize: 12,
  },
  list: {
    display: "grid",
    gap: 8,
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  issue: {
    border: "1px solid #d9dee7",
    padding: 10,
  },
  severity: {
    color: "#334155",
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
  },
  message: {
    color: "#263244",
    fontSize: 13,
    marginTop: 4,
  },
  path: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
  },
  empty: {
    color: "#64748b",
    fontSize: 13,
  },
};

export function ValidationTab({ context }: WorkspaceTabProps) {
  const counts = getValidationCounts(context.validationResult);
  const issues = getValidationIssueRows(context.validationResult);
  const status = readValidationStatus(context.validationResult);

  return (
    <section style={styles.root} aria-label="packet validation">
      <div style={styles.status}>Status: {status ?? "unknown"}</div>
      <div style={styles.counts} aria-label="validation counts">
        <CountBox label="errors" value={counts.errors} testId="validation-errors-count" />
        <CountBox label="warnings" value={counts.warnings} testId="validation-warnings-count" />
        <CountBox label="info" value={counts.info} testId="validation-info-count" />
        <CountBox label="total" value={counts.total} testId="validation-total-count" />
      </div>
      {issues.length > 0 ? (
        <ul style={styles.list}>
          {issues.map((issue) => (
            <li key={issue.id} style={styles.issue}>
              <div style={styles.severity}>{issue.severity}</div>
              <div style={styles.message}>{issue.message}</div>
              <div style={styles.path}>{issue.path}</div>
            </li>
          ))}
        </ul>
      ) : (
        <div style={styles.empty}>No validation issues available.</div>
      )}
    </section>
  );
}

export function getValidationCounts(validationResult: unknown): ValidationCounts {
  const record = asRecord(validationResult);
  if (!record) {
    return unknownCounts();
  }

  const explicitCounts = readCounts(record.counts) ?? readCounts(record.summary);
  if (explicitCounts) {
    return explicitCounts;
  }

  const issues = record.issues;
  if (!Array.isArray(issues)) {
    return unknownCounts();
  }

  let errors = 0;
  let warnings = 0;
  let info = 0;
  for (const issue of issues) {
    const severity = readString(asRecord(issue)?.severity)?.toLowerCase();
    if (severity === "error" || severity === "errors") {
      errors += 1;
    } else if (severity === "warning" || severity === "warnings") {
      warnings += 1;
    } else {
      info += 1;
    }
  }

  return {
    errors,
    warnings,
    info,
    total: issues.length,
  };
}

function CountBox({
  label,
  value,
  testId,
}: {
  readonly label: string;
  readonly value: ValidationCount;
  readonly testId: string;
}) {
  return (
    <div style={styles.countBox}>
      <span style={styles.countValue} data-testid={testId}>
        {formatCount(value)}
      </span>
      <span style={styles.countLabel}>{label}</span>
    </div>
  );
}

function readCounts(value: unknown): ValidationCounts | undefined {
  const record = asRecord(value);
  if (!record) {
    return undefined;
  }
  const errors = readNumber(record.errors) ?? readNumber(record.errorCount);
  const warnings = readNumber(record.warnings) ?? readNumber(record.warningCount);
  const info = readNumber(record.info) ?? readNumber(record.information) ?? readNumber(record.infoCount);
  const total = readNumber(record.total) ?? readNumber(record.issueCount);
  if (
    errors === undefined &&
    warnings === undefined &&
    info === undefined &&
    total === undefined
  ) {
    return undefined;
  }

  return {
    errors: errors ?? "unknown",
    warnings: warnings ?? "unknown",
    info: info ?? "unknown",
    total: total ?? sumKnown(errors, warnings, info) ?? "unknown",
  };
}

function getValidationIssueRows(validationResult: unknown): readonly ValidationIssueRow[] {
  const issues = asRecord(validationResult)?.issues;
  if (!Array.isArray(issues)) {
    return [];
  }

  return issues.map((issue, index) => {
    const record = asRecord(issue);
    return {
      id: readString(record?.id) ?? readString(record?.code) ?? `issue-${index + 1}`,
      severity: readString(record?.severity) ?? "unknown",
      message: readString(record?.message) ?? readString(record?.detail) ?? "unknown",
      path: readString(record?.path) ?? readString(record?.fieldPath) ?? "unknown",
    };
  });
}

function readValidationStatus(validationResult: unknown): string | undefined {
  const record = asRecord(validationResult);
  return readString(record?.status) ?? readString(record?.validationStatus);
}

function unknownCounts(): ValidationCounts {
  return {
    errors: "unknown",
    warnings: "unknown",
    info: "unknown",
    total: "unknown",
  };
}

function sumKnown(...values: readonly (number | undefined)[]): number | undefined {
  if (values.some((value) => value === undefined)) {
    return undefined;
  }
  return values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
}

function formatCount(count: ValidationCount): string {
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
