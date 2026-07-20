import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import React, { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { GaoNodeScene } from "../../../data/gaoNodes";
import { GaoNodeStage } from "./GaoNodeStage";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

const testScene: GaoNodeScene = {
  appLocation: "GAO-999.lesson.l1.delivery",
  sceneLabel: "Keyboard test",
  nodes: [
    {
      id: "first",
      label: "First teaching point",
      shortLabel: "First",
      x: 25,
      y: 50,
      tone: "guidance",
      kind: "observe",
      required: true,
      whatYouObserved: "An observation.",
      whyItMatters: "A reason.",
      whatYouShouldDo: "An action.",
      policyRefs: [],
    },
    {
      id: "second",
      label: "Second teaching point",
      shortLabel: "Second",
      x: 75,
      y: 50,
      tone: "safe",
      kind: "observe",
      required: true,
      whatYouObserved: "Another observation.",
      whyItMatters: "Another reason.",
      whatYouShouldDo: "Another action.",
      policyRefs: [],
    },
  ],
};

function Harness({ initial = [] }: { initial?: string[] }) {
  const [completed, setCompleted] = useState(initial);
  return (
    <GaoNodeStage
      scene={testScene}
      imageSrc="/test.png"
      imageAlt="Test scene"
      completedNodeIds={completed}
      onProgressChange={setCompleted}
    />
  );
}

describe("GaoNodeStage", () => {
  it("opens with keyboard, traps focus, closes with Escape, and returns focus", async () => {
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Review First teaching point" });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "Enter" });

    const dialog = screen.getByRole("dialog");
    const close = screen.getByRole("button", { name: "Close teaching point" });
    await waitFor(() => expect(document.activeElement).toBe(close));

    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Mark observed" }));

    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("announces progress and resets only the controlled scene", () => {
    render(<Harness initial={["first"]} />);
    expect(screen.getByText("1 of 2 scene nodes observed").getAttribute("aria-live")).toBe("polite");
    fireEvent.click(screen.getByRole("button", { name: "Reset current lesson node progress" }));
    expect(screen.getByText("0 of 2 scene nodes observed")).toBeTruthy();
  });

  it("requires the safest micro-check response before completion", () => {
    const sceneWithCheck: GaoNodeScene = {
      ...testScene,
      nodes: [
        {
          ...testScene.nodes[0],
          microCheck: {
            prompt: "Choose the safest response",
            options: [
              { id: "safe", label: "Safe", isSafest: true, feedback: "Correct" },
              { id: "risk", label: "Risk", isSafest: false, feedback: "Try again" },
            ],
          },
        },
      ],
    };
    const onProgressChange = vi.fn();
    render(
      <GaoNodeStage
        scene={sceneWithCheck}
        imageSrc="/test.png"
        imageAlt="Test"
        completedNodeIds={[]}
        onProgressChange={onProgressChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Review First teaching point" }));
    const complete = screen.getByRole("button", { name: "Complete teaching point" });
    expect((complete as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("radio", { name: "Risk" }));
    expect((complete as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("radio", { name: "Safe" }));
    expect((complete as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(complete);
    expect(onProgressChange).toHaveBeenCalledWith(["first"]);
  });

  it("disables guided pulse and entrance transitions for reduced motion", () => {
    const css = readFileSync(
      resolve(process.cwd(), "src/policy/journey/components/gao/nodes/GaoNodeStage.css"),
      "utf8",
    );
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain(".gao-node-orb-guided::before { animation: none !important; }");
    expect(css).toContain("transition: none !important");
  });
});
