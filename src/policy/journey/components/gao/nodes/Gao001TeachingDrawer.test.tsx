import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React, { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";

import type { Hotspot } from "../../GAO001SharedOverlay";
import { Gao001TeachingDrawer } from "./Gao001TeachingDrawer";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

const decisionHotspot: Hotspot = {
  id: "observe",
  x: 25,
  y: 40,
  label: "Observe",
  fieldNotes: {
    title: "Notice the immediate environment",
    content: "Use the authored scene details to identify the safest response.",
  },
  question: {
    prompt: "What should you do first?",
    choices: [
      { id: "unsafe", text: "Assume the scene is safe.", isCorrect: false, feedback: "Review the visible risks first." },
      { id: "safe", text: "Observe the immediate safety risks.", isCorrect: true, feedback: "Correct." },
    ],
  },
};

function DrawerHarness({
  hotspot = decisionHotspot,
  trigger,
}: {
  hotspot?: Hotspot;
  trigger: HTMLButtonElement;
}) {
  const [open, setOpen] = useState(true);
  return open ? (
    <Gao001TeachingDrawer
      hotspot={hotspot}
      trigger={trigger}
      onClose={() => setOpen(false)}
      onComplete={() => setOpen(false)}
    />
  ) : null;
}

afterEach(() => {
  document.querySelectorAll("#legacy-trigger").forEach((trigger) => trigger.remove());
});

describe("Gao001TeachingDrawer", () => {
  it("requires the correct response and returns focus after completion", async () => {
    const trigger = document.createElement("button");
    trigger.id = "legacy-trigger";
    document.body.appendChild(trigger);
    trigger.focus();

    render(<DrawerHarness trigger={trigger} />);
    const complete = screen.getByRole("button", { name: "Complete teaching point" });
    expect((complete as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole("radio", { name: "Assume the scene is safe." }));
    expect((complete as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText("Review the visible risks first.")).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: "Observe the immediate safety risks." }));
    expect((complete as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(complete);

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it("closes with Escape and traps focus within the dialog", async () => {
    const trigger = document.createElement("button");
    trigger.id = "legacy-trigger";
    document.body.appendChild(trigger);
    trigger.focus();

    render(<DrawerHarness trigger={trigger} hotspot={{ ...decisionHotspot, question: undefined }} />);
    const close = screen.getByRole("button", { name: "Close teaching point" });
    const markObserved = screen.getByRole("button", { name: "Mark observed" });
    await waitFor(() => expect(document.activeElement).toBe(close));

    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(markObserved);
    fireEvent.keyDown(markObserved, { key: "Tab" });
    expect(document.activeElement).toBe(close);

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it("keeps background scrolling locked only while open", () => {
    const trigger = document.createElement("button");
    trigger.id = "legacy-trigger";
    document.body.appendChild(trigger);
    const { unmount } = render(<DrawerHarness trigger={trigger} />);
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
    trigger.remove();
  });
});
