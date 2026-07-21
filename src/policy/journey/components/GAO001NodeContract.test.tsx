import React from "react";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import CoreValuesInteractiveViewer from "./CoreValuesInteractiveViewer";
import GAO001Scene01WelcomeDesk from "./GAO001Scene01WelcomeDesk";
import GAO001Scene02MissionBriefing from "./GAO001Scene02MissionBriefing";
import GAO001Scene03VisionPillars from "./GAO001Scene03VisionPillars";
import GAO001Scene05HomeHealthDifference from "./GAO001Scene05HomeHealthDifference";
import GAO001Scene06ReportingEscalation from "./GAO001Scene06ReportingEscalation";
import GAO001Scene07PatientRefusal from "./GAO001Scene07PatientRefusal";
import GAO001Scene08EscalationPractice from "./GAO001Scene08EscalationPractice";
import GAO001Scene09ReadinessMap from "./GAO001Scene09ReadinessMap";
import { gao001NodeSceneRegistrations } from "../data/gaoNodes/GAO-001";

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: () => ({ user: { name: "Test Learner" } }),
}));

// Several legacy GAO-001 scene modules still use the classic JSX runtime.
(globalThis as typeof globalThis & { React: typeof React }).React = React;

const scenes = [
  GAO001Scene01WelcomeDesk,
  GAO001Scene02MissionBriefing,
  GAO001Scene03VisionPillars,
  CoreValuesInteractiveViewer,
  GAO001Scene05HomeHealthDifference,
  GAO001Scene06ReportingEscalation,
  GAO001Scene07PatientRefusal,
  GAO001Scene08EscalationPractice,
  GAO001Scene09ReadinessMap,
] as const;

afterEach(() => cleanup());

describe("GAO-001 rendered hotspot contract", () => {
  it.each(gao001NodeSceneRegistrations.map((registration, index) => [
    registration.appLocation,
    registration.requiredNodeIds,
    scenes[index],
  ] as const))(
    "%s renders exactly its registered required hotspot IDs",
    async (_appLocation, requiredNodeIds, Scene) => {
      const { container } = render(<Scene onComplete={vi.fn()} />);
      const coverButton = [...container.querySelectorAll("button")].find(
        (button) => button.textContent?.includes("Start Alex's Journey"),
      );
      if (coverButton) fireEvent.click(coverButton);

      await waitFor(() => {
        expect(container.querySelectorAll("[data-node-id]").length).toBe(requiredNodeIds.length);
      });
      const buttons = [...container.querySelectorAll<HTMLElement>("[data-node-id]")];
      const renderedIds = buttons.map((button) => button.dataset.nodeId);

      expect(renderedIds).toEqual([...requiredNodeIds]);
      expect(new Set(renderedIds).size).toBe(renderedIds.length);
      expect(renderedIds.length).toBeGreaterThanOrEqual(3);

      fireEvent.click(buttons[0]);
      expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    },
  );
});
