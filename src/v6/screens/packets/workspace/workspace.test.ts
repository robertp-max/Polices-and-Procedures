import { createElement } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildWorkspaceOutline } from "./OutlinePanel";
import { buildPreviewHtml, printPacketHtml } from "./PreviewPanel";
import {
  DEFAULT_WORKSPACE_PACKET,
  DEFAULT_WORKSPACE_VALIDATION,
  WorkspaceShell,
  type WorkspaceEditSubmission,
} from "./WorkspaceShell";
import { isComputedFieldPath, submitWorkspaceEdit } from "./tabs/EditTab";

function renderWorkspace(props: Partial<Parameters<typeof WorkspaceShell>[0]> = {}) {
  return render(createElement(WorkspaceShell, props));
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  document.getElementById("packet-preview-print-frame")?.remove();
});

describe("WorkspaceShell packet workspace", () => {
  it("renders the FR-018 three-panel workspace with renderer-backed preview and four owned tabs", () => {
    renderWorkspace();

    expect(screen.getByRole("navigation", { name: "packet outline" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "live packet preview" })).toBeTruthy();
    expect(screen.getByTitle("packet live preview")).toBeTruthy();
    expect(screen.getByRole("tablist", { name: "Packet workspace tabs" })).toBeTruthy();

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(4);
    expect(tabs.map((tab) => tab.textContent)).toEqual(["Edit", "Sources", "Validation", "History"]);

    const outline = buildWorkspaceOutline(DEFAULT_WORKSPACE_PACKET, DEFAULT_WORKSPACE_VALIDATION);
    expect(outline.map((item) => item.label)).toEqual([
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
    ]);
    expect(outline.find((item) => item.label === "KPIs")?.count).toBe(1);
    expect(outline.find((item) => item.label === "validation status")?.count).toBe(3);

    const previewHtml = buildPreviewHtml(DEFAULT_WORKSPACE_PACKET);
    expect(previewHtml).toContain('data-module-id="qapi-cover-page"');
    expect(previewHtml).toContain("Q2 2026 QAPI Committee Packet");
  });

  it("rejects computed-field edit paths before any submit handler is called (FR-020)", async () => {
    const protectedPaths = [
      "kpis.completionRate",
      "metrics.thirtyDayRate",
      "aggregates.incidentTotal",
      "triggerOutcomes.pipRequired",
      "hashes.contentHash",
      "signatureStatus.administrator",
      "evidence.validationStatus",
    ];

    for (const fieldPath of protectedPaths) {
      const onSubmitEdit = vi.fn();
      const edit: WorkspaceEditSubmission = {
        fieldPath,
        value: "tampered value",
        intent: "narrative",
      };

      expect(isComputedFieldPath(fieldPath)).toBe(true);
      const result = await submitWorkspaceEdit(edit, { onSubmitEdit });

      expect(result.accepted).toBe(false);
      expect(result.reason).toBe("computed-field-protected");
      expect(result.message).toContain("computed KPIs/rates/aggregates");
      expect(onSubmitEdit).not.toHaveBeenCalled();
    }

    expect(isComputedFieldPath("evidence.sourceNote")).toBe(false);
    expect(isComputedFieldPath("sourceMappings.minutes")).toBe(false);
  });

  it("blocks computed-field paths in the Edit tab UI without invoking the edit integration", () => {
    const onSubmitEdit = vi.fn();
    renderWorkspace({ onSubmitEdit });

    fireEvent.change(screen.getByLabelText("Field path"), {
      target: { value: "signatureStatus.administrator" },
    });

    expect(screen.getByRole("alert").textContent).toContain("signature-status");
    expect((screen.getByRole("button", { name: "Submit edit" }) as HTMLButtonElement).disabled).toBe(true);
    expect(onSubmitEdit).not.toHaveBeenCalled();
  });

  it("submits an authorized narrative edit through the tab framework without Brad", async () => {
    const onSubmitEdit = vi.fn(async (edit: WorkspaceEditSubmission) => ({
      accepted: true,
      message: `Accepted ${edit.fieldPath}`,
      auditId: "audit-narrative",
      updatedAt: "2026-07-12T12:00:00.000Z",
    }));
    renderWorkspace({ onSubmitEdit });

    fireEvent.change(screen.getByLabelText("Value"), {
      target: { value: "Updated committee discussion and management commentary." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit edit" }));

    await waitFor(() =>
      expect(onSubmitEdit).toHaveBeenCalledWith({
        fieldPath: "narrative",
        value: "Updated committee discussion and management commentary.",
        intent: "narrative",
        targetId: undefined,
        owner: undefined,
        comment: undefined,
      }),
    );
    expect(await screen.findByText("Accepted narrative")).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: "History" }));
    expect(await screen.findByText("audit-narrative")).toBeTruthy();
    expect(screen.getByText("narrative")).toBeTruthy();
  });

  it("derives non-vacuous validation counts in the Validation tab", () => {
    renderWorkspace({
      initialValidationResult: {
        status: "blocked",
        issues: [
          { id: "err-1", severity: "error", message: "Missing signature.", path: "signatures" },
          { id: "warn-1", severity: "warning", message: "Late source.", path: "sources" },
          { id: "info-1", severity: "info", message: "Ready for reviewer.", path: "review" },
        ],
      },
    });

    fireEvent.click(screen.getByRole("tab", { name: "Validation" }));

    expect(screen.getByTestId("validation-errors-count").textContent).toBe("1");
    expect(screen.getByTestId("validation-warnings-count").textContent).toBe("1");
    expect(screen.getByTestId("validation-info-count").textContent).toBe("1");
    expect(screen.getByTestId("validation-total-count").textContent).toBe("3");
  });

  it("prints packet preview HTML from a writable print window", async () => {
    vi.useFakeTimers();
    const fakeDocument = {
      open: vi.fn(),
      write: vi.fn(),
      close: vi.fn(),
      images: [],
      fonts: { ready: Promise.resolve() },
    } as unknown as Document;
    const fakeWindow = {
      document: fakeDocument,
      focus: vi.fn(),
      print: vi.fn(),
      addEventListener: vi.fn(),
      close: vi.fn(),
      opener: {},
    } as unknown as Window;
    const openSpy = vi.spyOn(window, "open").mockReturnValue(fakeWindow);

    printPacketHtml("<!doctype html><html><body>Packet</body></html>");

    expect(openSpy).toHaveBeenCalledWith("", "_blank", "popup,width=900,height=1100");
    expect(fakeDocument.open).toHaveBeenCalledTimes(1);
    expect(fakeDocument.write).toHaveBeenCalledWith("<!doctype html><html><body>Packet</body></html>");
    expect(fakeDocument.close).toHaveBeenCalledTimes(1);

    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(100);

    expect(fakeWindow.focus).toHaveBeenCalledTimes(1);
    expect(fakeWindow.print).toHaveBeenCalledTimes(1);
  });
});
