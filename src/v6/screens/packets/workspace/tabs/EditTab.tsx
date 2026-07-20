import { useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import * as packetsApiModule from "@/policy/packets/api/packetsApi";
import type {
  WorkspaceEditIntent,
  WorkspaceEditResult,
  WorkspaceEditSubmission,
  WorkspaceTabProps,
} from "../WorkspaceShell";

export const workspaceEditIntents = [
  "narrative",
  "commentary",
  "decisions",
  "actions",
  "owners",
  "mark-unknown",
  "reject-finding",
  "confirm-reject-trigger",
] as const satisfies readonly WorkspaceEditIntent[];

const computedFieldMessage =
  "Users may NOT overwrite computed KPIs/rates/aggregates/trigger-outcomes/hashes/signature-status/evidence-validation — must correct the source and recompute.";

type WorkspaceEditApiCall = (...args: readonly unknown[]) => Promise<unknown> | unknown;

type WorkspaceEditApi = {
  readonly submitEdit?: WorkspaceEditApiCall;
  readonly submitPacketEdit?: WorkspaceEditApiCall;
  readonly createEdit?: WorkspaceEditApiCall;
  readonly postEdit?: WorkspaceEditApiCall;
  readonly edits?: {
    readonly create?: WorkspaceEditApiCall;
    readonly submit?: WorkspaceEditApiCall;
  };
};

type SubmitWorkspaceEditOptions = {
  readonly packetId?: string;
  readonly onSubmitEdit?: (edit: WorkspaceEditSubmission) => Promise<WorkspaceEditResult | void> | WorkspaceEditResult | void;
};

const styles: Record<string, CSSProperties> = {
  root: {
    display: "grid",
    gap: 14,
    padding: 14,
  },
  form: {
    display: "grid",
    gap: 12,
  },
  row: {
    display: "grid",
    gap: 6,
  },
  splitRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  label: {
    color: "#334155",
    fontSize: 12,
    fontWeight: 700,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cfd7e3",
    color: "#172033",
    font: "inherit",
    fontSize: 13,
    padding: "8px 9px",
  },
  textarea: {
    width: "100%",
    minHeight: 116,
    boxSizing: "border-box",
    border: "1px solid #cfd7e3",
    color: "#172033",
    font: "inherit",
    fontSize: 13,
    padding: "8px 9px",
    resize: "vertical",
  },
  submit: {
    justifySelf: "start",
    border: "1px solid #1d4ed8",
    background: "#1d4ed8",
    color: "#ffffff",
    cursor: "pointer",
    font: "inherit",
    fontSize: 13,
    fontWeight: 700,
    padding: "8px 12px",
  },
  disabledSubmit: {
    borderColor: "#cbd5e1",
    background: "#e2e8f0",
    color: "#64748b",
    cursor: "not-allowed",
  },
  message: {
    border: "1px solid #cfd7e3",
    background: "#f8fafc",
    color: "#334155",
    fontSize: 13,
    padding: 10,
  },
  blocked: {
    borderColor: "#fecaca",
    background: "#fff1f2",
    color: "#9f1239",
  },
};

export function EditTab({ context }: WorkspaceTabProps) {
  const [intent, setIntent] = useState<WorkspaceEditIntent>("narrative");
  const [fieldPath, setFieldPath] = useState("narrative");
  const [value, setValue] = useState("");
  const [targetId, setTargetId] = useState("");
  const [owner, setOwner] = useState("");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isBlocked = isComputedFieldPath(fieldPath);
  const isDisabled = context.readOnly || isSubmitting || isBlocked || fieldPath.trim().length === 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const edit: WorkspaceEditSubmission = {
      fieldPath: fieldPath.trim(),
      value,
      intent,
      targetId: targetId.trim() || undefined,
      owner: owner.trim() || undefined,
      comment: comment.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      const result = await submitWorkspaceEdit(edit, {
        packetId: context.packetId,
        onSubmitEdit: context.onSubmitEdit,
      });
      setMessage(result.message ?? (result.accepted ? "Edit accepted." : "Edit rejected."));
      if (result.accepted && result.packetModel !== undefined) {
        context.onPacketChange?.(result.packetModel, result.validationResult);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section style={styles.root} aria-label="direct packet edits">
      {isBlocked ? (
        <div role="alert" style={{ ...styles.message, ...styles.blocked }}>
          {computedFieldMessage}
        </div>
      ) : null}
      <form style={styles.form} onSubmit={handleSubmit}>
        <label style={styles.row}>
          <span style={styles.label}>Edit type</span>
          <select
            value={intent}
            style={styles.input}
            disabled={context.readOnly}
            onChange={(event) => setIntent(event.target.value as WorkspaceEditIntent)}
          >
            {workspaceEditIntents.map((editIntent) => (
              <option key={editIntent} value={editIntent}>
                {editIntent}
              </option>
            ))}
          </select>
        </label>
        <label style={styles.row}>
          <span style={styles.label}>Field path</span>
          <input
            value={fieldPath}
            style={styles.input}
            disabled={context.readOnly}
            onChange={(event) => setFieldPath(event.target.value)}
          />
        </label>
        <label style={styles.row}>
          <span style={styles.label}>Value</span>
          <textarea
            value={value}
            style={styles.textarea}
            disabled={context.readOnly}
            onChange={(event) => setValue(event.target.value)}
          />
        </label>
        <div style={styles.splitRow}>
          <label style={styles.row}>
            <span style={styles.label}>Target ID</span>
            <input
              value={targetId}
              style={styles.input}
              disabled={context.readOnly}
              onChange={(event) => setTargetId(event.target.value)}
            />
          </label>
          <label style={styles.row}>
            <span style={styles.label}>Owner</span>
            <input
              value={owner}
              style={styles.input}
              disabled={context.readOnly}
              onChange={(event) => setOwner(event.target.value)}
            />
          </label>
        </div>
        <label style={styles.row}>
          <span style={styles.label}>Comment</span>
          <textarea
            value={comment}
            style={{ ...styles.textarea, minHeight: 74 }}
            disabled={context.readOnly}
            onChange={(event) => setComment(event.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={isDisabled}
          style={{
            ...styles.submit,
            ...(isDisabled ? styles.disabledSubmit : undefined),
          }}
        >
          Submit edit
        </button>
      </form>
      {message ? <div style={styles.message}>{message}</div> : null}
    </section>
  );
}

export async function submitWorkspaceEdit(
  edit: WorkspaceEditSubmission,
  options: SubmitWorkspaceEditOptions = {},
): Promise<WorkspaceEditResult> {
  if (isComputedFieldPath(edit.fieldPath)) {
    return {
      accepted: false,
      reason: "computed-field-protected",
      message: computedFieldMessage,
      edit,
    };
  }

  if (options.onSubmitEdit) {
    const result = await options.onSubmitEdit(edit);
    return normalizeEditResult(result, edit);
  }

  const api = resolvePacketsApi();
  const apiCall =
    api.submitEdit ??
    api.submitPacketEdit ??
    api.createEdit ??
    api.postEdit ??
    api.edits?.create ??
    api.edits?.submit;

  if (!apiCall) {
    throw new Error("packetsApi edits endpoint is unavailable.");
  }

  const payload = options.packetId ? { packetId: options.packetId, edit } : edit;
  const result =
    options.packetId && apiCall.length >= 2
      ? await apiCall(options.packetId, edit)
      : await apiCall(payload);
  return normalizeEditResult(result, edit);
}

export function isComputedFieldPath(fieldPath: string): boolean {
  const normalized = fieldPath
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .trim();
  const segments = normalized.split(/[^a-z0-9]+/).filter(Boolean);
  const joined = segments.join("-");
  const protectedSegments = new Set([
    "kpi",
    "kpis",
    "rate",
    "rates",
    "aggregate",
    "aggregates",
    "trigger-outcome",
    "trigger-outcomes",
    "hash",
    "hashes",
    "signature-status",
    "evidence-validation",
    "validation-evidence",
  ]);

  if (protectedSegments.has(joined)) {
    return true;
  }

  return segments.some((segment, index) => {
    const pair = index < segments.length - 1 ? `${segment}-${segments[index + 1]}` : segment;
    return protectedSegments.has(segment) || protectedSegments.has(pair);
  });
}

function normalizeEditResult(result: WorkspaceEditResult | void | unknown, edit: WorkspaceEditSubmission): WorkspaceEditResult {
  if (!isRecord(result)) {
    return { accepted: true, edit };
  }
  const accepted = typeof result.accepted === "boolean" ? result.accepted : true;
  return {
    accepted,
    reason: readString(result.reason),
    message: readString(result.message),
    edit: isRecord(result.edit) ? (result.edit as WorkspaceEditSubmission) : edit,
    packetModel: result.packetModel,
    validationResult: result.validationResult,
    updatedAt: readString(result.updatedAt),
    auditId: readString(result.auditId),
  };
}

function resolvePacketsApi(): WorkspaceEditApi {
  const moduleRecord = packetsApiModule as unknown as {
    readonly packetsApi?: WorkspaceEditApi;
    readonly default?: WorkspaceEditApi;
  } & WorkspaceEditApi;
  return moduleRecord.packetsApi ?? moduleRecord.default ?? moduleRecord;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
