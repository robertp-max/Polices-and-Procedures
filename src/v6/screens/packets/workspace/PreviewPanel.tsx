import { useCallback, useMemo } from "react";
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
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  button: {
    minHeight: 32,
    padding: "0 12px",
    borderRadius: 6,
    border: "1px solid #007c7a",
    background: "#007c7a",
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  buttonGhost: {
    minHeight: 32,
    padding: "0 12px",
    borderRadius: 6,
    border: "1px solid #007c7a",
    background: "#ffffff",
    color: "#007c7a",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
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
  const fileName = useMemo(() => packetFileName(packet), [packet]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([srcDoc], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, [srcDoc, fileName]);

  const handlePrint = useCallback(() => {
    printPacketHtml(srcDoc);
  }, [srcDoc]);

  return (
    <section style={styles.root} aria-label="live packet preview">
      <div style={styles.toolbar}>
        <span>Live preview</span>
        <div style={styles.actions}>
          {selectedOutlineId ? <span style={styles.outlineSignal}>{selectedOutlineId}</span> : null}
          <button type="button" style={styles.buttonGhost} onClick={handleDownload}>
            Download HTML
          </button>
          <button type="button" style={styles.button} onClick={handlePrint}>
            Print / Save as PDF
          </button>
        </div>
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

export function printPacketHtml(srcDoc: string): void {
  const printWindow = window.open("", "_blank", "popup,width=900,height=1100");
  if (printWindow && writePrintDocument(printWindow, srcDoc)) {
    try {
      printWindow.opener = null;
    } catch {
      // Some browsers expose opener as read-only for special window contexts.
    }
    queuePrint(printWindow);
    return;
  }

  printPacketHtmlInFrame(srcDoc);
}

function writePrintDocument(targetWindow: Window, srcDoc: string): boolean {
  try {
    targetWindow.document.open();
    targetWindow.document.write(srcDoc);
    targetWindow.document.close();
    return true;
  } catch {
    try {
      targetWindow.close();
    } catch {
      // Ignore close failures; the iframe fallback still handles print.
    }
    return false;
  }
}

function printPacketHtmlInFrame(srcDoc: string): void {
  const existing = document.getElementById("packet-preview-print-frame");
  existing?.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "packet-preview-print-frame";
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";

  const cleanup = () => {
    try {
      iframe.remove();
    } catch {
      // The frame may already be gone if the browser fires afterprint twice.
    }
  };

  document.body.appendChild(iframe);
  const frameWindow = iframe.contentWindow;
  if (!frameWindow || !writePrintDocument(frameWindow, srcDoc)) {
    cleanup();
    return;
  }
  queuePrint(frameWindow, cleanup);
}

function queuePrint(targetWindow: Window, cleanup?: () => void): void {
  let printed = false;
  const triggerPrint = () => {
    if (printed) return;
    printed = true;
    try {
      targetWindow.focus();
      targetWindow.print();
      if (cleanup) {
        targetWindow.addEventListener("afterprint", cleanup, { once: true });
        window.setTimeout(cleanup, 60_000);
      }
    } catch {
      cleanup?.();
    }
  };

  const targetDocument = targetWindow.document;
  const fontReady = readFontReady(targetDocument);
  const imagePromises = Array.from(targetDocument.images ?? [])
    .filter((image) => !image.complete)
    .map(
      (image) =>
        new Promise<void>((resolve) => {
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        }),
    );

  void Promise.allSettled([fontReady, ...imagePromises]).then(() => {
    window.setTimeout(triggerPrint, 100);
  });
  window.setTimeout(triggerPrint, 1200);
}

function readFontReady(documentRef: Document): Promise<unknown> {
  const fonts = (documentRef as Document & { readonly fonts?: { readonly ready?: Promise<unknown> } }).fonts;
  return fonts?.ready ?? Promise.resolve();
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

function packetFileName(packet: unknown): string {
  const record = asRecord(packet);
  const identity = record ? asRecord(record.identity) : undefined;
  const packetId =
    (identity ? readString(identity.packetId) : undefined) ??
    (record ? readString(record.packetId) : undefined) ??
    (record ? readString(record.title) : undefined);
  const safe = (packetId ?? "packet").replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return `${safe || "packet"}.html`;
}

function asRecord(value: unknown): RecordLike | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as RecordLike)
    : undefined;
}
