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

const decisionOptions = [
  { id: "risk-a", label: "Risk A", isSafest: false, feedback: "Review the first risk." },
  { id: "risk-b", label: "Risk B", isSafest: false, feedback: "Review the second risk." },
  { id: "safe", label: "Safe", isSafest: true, feedback: "That is the safest response." },
];

function decisionScene(maxAttempts?: number, includeSecondNode = false): GaoNodeScene {
  const first = {
    ...testScene.nodes[0],
    microCheck: {
      prompt: "Choose the safest response",
      options: decisionOptions,
      ...(maxAttempts === undefined ? {} : { maxAttempts }),
    },
  };
  const second = {
    ...testScene.nodes[1],
    microCheck: {
      prompt: "Choose the second safest response",
      options: decisionOptions.map((option) => ({ ...option, id: `second-${option.id}` })),
      maxAttempts: 2,
    },
  };
  return { ...testScene, nodes: includeSecondNode ? [first, second] : [first] };
}

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

  it("shows authored feedback after the first incorrect attempt without entering remediation", () => {
    render(
      <GaoNodeStage
        scene={decisionScene(2)}
        imageSrc="/test.png"
        imageAlt="Test"
        completedNodeIds={[]}
        onProgressChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Review First teaching point" }));
    fireEvent.click(screen.getByRole("radio", { name: "Risk A" }));
    expect(screen.getByText("Review the first risk.")).toBeTruthy();
    expect(screen.queryByText(/Attempt limit reached/i)).toBeNull();
    expect((screen.getByRole("button", { name: "Complete teaching point" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("enters remediation after the maximum number of incorrect attempts", () => {
    render(
      <GaoNodeStage
        scene={decisionScene(2)}
        imageSrc="/test.png"
        imageAlt="Test"
        completedNodeIds={[]}
        onProgressChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Review First teaching point" }));
    fireEvent.click(screen.getByRole("radio", { name: "Risk A" }));
    fireEvent.click(screen.getByRole("radio", { name: "Risk B" }));
    expect(screen.getByRole("alert").textContent).toMatch(/select the safest response/i);
    expect((screen.getByRole("button", { name: "Complete teaching point" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("allows the safest response after remediation and then completes", () => {
    const onProgressChange = vi.fn();
    render(
      <GaoNodeStage
        scene={decisionScene(2)}
        imageSrc="/test.png"
        imageAlt="Test"
        completedNodeIds={[]}
        onProgressChange={onProgressChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Review First teaching point" }));
    fireEvent.click(screen.getByRole("radio", { name: "Risk A" }));
    fireEvent.click(screen.getByRole("radio", { name: "Risk B" }));
    fireEvent.click(screen.getByRole("radio", { name: "Safe" }));
    expect(screen.queryByRole("alert")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Complete teaching point" }));
    expect(onProgressChange).toHaveBeenCalledWith(["first"]);
  });

  it("completes after a correct first attempt without remediation", () => {
    const onProgressChange = vi.fn();
    render(
      <GaoNodeStage
        scene={decisionScene(2)}
        imageSrc="/test.png"
        imageAlt="Test"
        completedNodeIds={[]}
        onProgressChange={onProgressChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Review First teaching point" }));
    fireEvent.click(screen.getByRole("radio", { name: "Safe" }));
    expect(screen.queryByRole("alert")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Complete teaching point" }));
    expect(onProgressChange).toHaveBeenCalledWith(["first"]);
  });

  it("resets attempt and selection state when a different node opens", () => {
    render(
      <GaoNodeStage
        scene={decisionScene(2, true)}
        imageSrc="/test.png"
        imageAlt="Test"
        completedNodeIds={[]}
        onProgressChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Review First teaching point" }));
    fireEvent.click(screen.getByRole("radio", { name: "Risk A" }));
    fireEvent.click(screen.getByRole("radio", { name: "Risk B" }));
    expect(screen.getByRole("alert")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close teaching point" }));

    fireEvent.click(screen.getByRole("button", { name: "Review Second teaching point" }));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getAllByRole("radio").every((radio) => !(radio as HTMLInputElement).checked)).toBe(true);
  });

  it("allows unlimited teaching retries when maxAttempts is omitted", () => {
    render(
      <GaoNodeStage
        scene={decisionScene()}
        imageSrc="/test.png"
        imageAlt="Test"
        completedNodeIds={[]}
        onProgressChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Review First teaching point" }));
    fireEvent.click(screen.getByRole("radio", { name: "Risk A" }));
    fireEvent.click(screen.getByRole("radio", { name: "Risk B" }));
    fireEvent.click(screen.getByRole("radio", { name: "Risk A" }));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText("Review the first risk.")).toBeTruthy();
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
