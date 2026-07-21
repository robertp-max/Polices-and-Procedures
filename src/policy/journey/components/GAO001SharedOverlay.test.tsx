import React, { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import GAO001SharedOverlay, { type Hotspot } from "./GAO001SharedOverlay";
import { GaoLegacyNodeProgressProvider } from "./gao/nodes/GaoLegacyNodeProgressContext";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

const hotspots: Hotspot[] = [
  {
    id: "first",
    x: 30,
    y: 50,
    label: "First point",
    fieldNotes: { title: "First observation", content: "First authored field note." },
  },
  {
    id: "second",
    x: 70,
    y: 50,
    label: "Second point",
    fieldNotes: { title: "Second observation", content: "Second authored field note." },
  },
];

function Harness({ custom = false }: { custom?: boolean }) {
  const [completedNodeIds, setCompletedNodeIds] = useState<string[]>([]);
  return (
    <GaoLegacyNodeProgressProvider
      value={{
        appLocation: "GAO-001.lesson.l1.delivery",
        completedNodeIds,
        onProgressChange: setCompletedNodeIds,
        onReset: () => setCompletedNodeIds([]),
      }}
    >
      <div style={{ width: 800, height: 650 }}>
        <GAO001SharedOverlay
          imageSrc="/test.png"
          altText="Test GAO-001 scene"
          objective="Review the scene"
          hotspots={hotspots}
          linear
          renderCustomModal={
            custom
              ? ({ complete }) => (
                  <div role="dialog" aria-label="Custom activity">
                    <button type="button" onClick={complete}>Finish custom activity</button>
                  </div>
                )
              : undefined
          }
        />
      </div>
    </GaoLegacyNodeProgressProvider>
  );
}

describe("GAO001SharedOverlay compatibility", () => {
  it("guides one node, advances persisted progress, and resets the current scene", () => {
    render(<Harness />);
    const first = screen.getByRole("button", { name: "Review First point" });
    const second = screen.getByRole("button", { name: "Review Second point" });
    expect(first.className).toContain("gao001-guided-pulse");
    expect(second.className).not.toContain("gao001-guided-pulse");

    fireEvent.click(first);
    fireEvent.click(screen.getByRole("button", { name: "Mark observed" }));
    expect(screen.getByText("1 of 2 scene nodes observed")).toBeTruthy();
    expect(screen.getByRole("button", { name: "First point — observed" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Review Second point" }).className).toContain(
      "gao001-guided-pulse",
    );

    fireEvent.click(screen.getByRole("button", { name: "Reset current lesson node progress" }));
    expect(screen.getByText("0 of 2 scene nodes observed")).toBeTruthy();
  });

  it("preserves custom activity rendering and completion hooks", () => {
    render(<Harness custom />);
    fireEvent.click(screen.getByRole("button", { name: "Review First point" }));
    expect(screen.getByRole("dialog", { name: "Custom activity" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Finish custom activity" }));
    expect(screen.getByText("1 of 2 scene nodes observed")).toBeTruthy();
  });

  it("installs a reduced-motion override without runtime font imports", () => {
    render(<Harness />);
    const styles = document.getElementById("gao001-shared-styles")?.textContent ?? "";
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).not.toContain("@import");
    expect(styles).not.toContain("fonts.googleapis.com");
  });
});
