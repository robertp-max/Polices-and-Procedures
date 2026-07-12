import { useMemo } from "react";
import type { CSSProperties } from "react";
import type * as PacketContracts from "@/policy/packets/contracts";
import * as packetRendererModule from "@/policy/packets/render/renderPacketModel";

export type PreviewContractModule = typeof PacketContracts;

export type PreviewPanelProps = {
  readonly packet: unknown;
  readonly selectedOutlineId?: string;
};

type RecordLike = Record<string, unknown>;
type RenderPacketModel = (packet: unknown) => unknown;

const styles: Record<string, CSSProperties> = {
  root: {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    height: "100%",
    minHeight: 0,
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 14px",
    borderBottom: "1px solid #d9dee7",
    background: "#ffffff",
    color: "#263244",
    fontSize: 13,
    fontWeight: 700,
  },
  outlineSignal: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 500,
  },
  frameWrap: {
    minHeight: 0,
    padding: 14,
  },
  frame: {
    width: "100%",
    height: "100%",
    minHeight: 520,
    border: "1px solid #cfd7e3",
    background: "#ffffff",
  },
};

export function PreviewPanel({ packet, selectedOutlineId }: PreviewPanelProps) {
  const srcDoc = useMemo(() => buildPreviewHtml(packet), [packet]);

  return (
    <section style={styles.root} aria-label="live packet preview">
      <div style={styles.toolbar}>
        <span>Live preview</span>
        {selectedOutlineId ? <span style={styles.outlineSignal}>{selectedOutlineId}</span> : null}
      </div>
      <div style={styles.frameWrap}>
        <iframe
          title="packet live preview"
          sandbox=""
          referrerPolicy="no-referrer"
          srcDoc={srcDoc}
          style={styles.frame}
        />
      </div>
    </section>
  );
}

export function buildPreviewHtml(packet: unknown): string {
  const renderer = resolveRenderer();
  if (!renderer) {
    return wrapHtml("<p>Renderer unavailable.</p>");
  }

  try {
    return ensureHtmlDocument(normalizeRenderedHtml(renderer(packet)));
  } catch (error) {
    return wrapHtml(
      `<h1>Preview unavailable</h1><pre>${escapeHtml(error instanceof Error ? error.message : String(error))}</pre>`,
    );
  }
}

function resolveRenderer(): RenderPacketModel | undefined {
  const moduleRecord = packetRendererModule as unknown as {
    readonly renderPacketModel?: RenderPacketModel;
    readonly default?: RenderPacketModel;
  };
  return moduleRecord.renderPacketModel ?? moduleRecord.default;
}

function ensureHtmlDocument(renderedHtml: string): string {
  return /<!doctype\s+html|<html[\s>]/i.test(renderedHtml) ? renderedHtml : wrapHtml(renderedHtml);
}

function normalizeRenderedHtml(rendered: unknown): string {
  if (typeof rendered === "string") {
    return rendered;
  }

  const record = asRecord(rendered);
  if (!record) {
    return `<pre>${escapeHtml(stringifyUnknown(rendered))}</pre>`;
  }

  const directHtml =
    readString(record.html) ??
    readString(record.documentHtml) ??
    readString(record.srcDoc) ??
    readString(record.markup);
  if (directHtml) {
    return directHtml;
  }

  if (Array.isArray(record.pages)) {
    return record.pages.map((page) => normalizeRenderedHtml(page)).join("\n");
  }

  if (Array.isArray(record.sections)) {
    return record.sections.map((section) => normalizeRenderedHtml(section)).join("\n");
  }

  return `<pre>${escapeHtml(stringifyUnknown(rendered))}</pre>`;
}

function wrapHtml(body: string): string {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root { color: #162033; background: #ffffff; font-family: Arial, sans-serif; }
    body { margin: 0; padding: 24px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #d9dee7; padding: 6px 8px; text-align: left; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; }
  </style>
</head>
<body>${body}</body>
</html>`;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function stringifyUnknown(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function asRecord(value: unknown): RecordLike | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as RecordLike)
    : undefined;
}
