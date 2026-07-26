"use client";

import { useMemo, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { getPerformanceFixtures } from "../_data/fixtures";
import { usePreview } from "./PreviewContext";
import { PageHeader, RequirementCard } from "./shared";
import { WorkspaceTabs, workspaceTabId, type TabOption } from "./ui";

type PerformanceView =
  | "30-day check-in"
  | "60-day check-in"
  | "90-day evaluation"
  | "Annual evaluation"
  | "IDP / goals"
  | "Coaching"
  | "Improvement plan"
  | "Follow-up";

const views: TabOption<PerformanceView>[] = [
  { id: "30-day check-in", label: "30-day" },
  { id: "60-day check-in", label: "60-day" },
  { id: "90-day evaluation", label: "90-day" },
  { id: "Annual evaluation", label: "Annual" },
  { id: "IDP / goals", label: "IDP / goals" },
  { id: "Coaching", label: "Coaching" },
  { id: "Improvement plan", label: "Improvement plan" },
  { id: "Follow-up", label: "Follow-up" },
];

export function PerformanceWorkspace() {
  const { persona, announce } = usePreview();
  const fixtures = useMemo(() => getPerformanceFixtures(persona), [persona]);
  const initial = persona.stage.includes("Day 60")
    ? "60-day check-in"
    : persona.stage.includes("Day 90")
      ? "90-day evaluation"
      : persona.stage === "Annual"
        ? "Annual evaluation"
        : "30-day check-in";
  const [active, setActive] = useState<PerformanceView>(initial);
  const item = fixtures.find((fixture) => fixture.type === active) ?? fixtures[0];
  const activeIndex = views.findIndex((view) => view.id === active);

  return (
    <div className="workspace">
      <PageHeader
        eyebrow="PERFORMANCE"
        title="Check-ins & evaluations"
        description="Employee actions are limited to review, discussion topics, comments, and acknowledgment of receipt."
      />

      <div className="read-only-banner" role="note">
        <LockKeyhole aria-hidden="true" />
        <div>
          <strong>Reviewer-owned decisions are read-only</strong>
          <p>
            The employee cannot edit scores or approve an evaluation. An
            acknowledgment confirms receipt and discussion; it does not
            indicate agreement.
          </p>
        </div>
      </div>

      <ol className="performance-timeline" aria-label="Check-in and evaluation sequence">
        {views.map((view, i) => {
          const state = i < activeIndex ? "is-done" : i === activeIndex ? "is-active" : "is-future";
          return (
            <li key={view.id} className={`perf-node ${state}`}>
              <button
                type="button"
                className="perf-node-dot"
                onClick={() => setActive(view.id)}
                aria-current={i === activeIndex ? "step" : undefined}
              >
                {i < activeIndex ? "✓" : i + 1}
              </button>
              <span className="perf-node-label">{view.label}</span>
            </li>
          );
        })}
      </ol>

      <WorkspaceTabs
        label="Performance views"
        tabs={views}
        active={active}
        onChange={setActive}
        panelId="performance-panel"
      />

      <section
        id="performance-panel"
        role="tabpanel"
        aria-labelledby={workspaceTabId("performance-panel", active)}
        aria-label={active}
        className="performance-panel"
      >
        <RequirementCard
          title={item.type}
          status={item.status}
          fields={[
            { label: "Date", value: item.date },
            { label: "Reviewer", value: item.reviewer },
            { label: "Topics", value: item.topics },
            { label: "Employee actions", value: item.employeeActions },
            { label: "Acknowledgment", value: item.acknowledgment },
            { label: "Next review", value: item.nextReview },
          ]}
          footer={
            item.status === "No action required" ? (
              <p className="no-action-copy">No employee action required.</p>
            ) : (
              <button
                className="button button-secondary"
                type="button"
                onClick={() =>
                  announce("Preview opened. No official record was changed.")
                }
              >
                Open read-only preview
              </button>
            )
          }
        />

        <aside className="performance-explainer">
          <h2>What the employee can do here</h2>
          <ul>
            <li>Review scheduled dates, topics, and the named synthetic reviewer.</li>
            <li>Add discussion topics or employee comments in ephemeral UI state.</li>
            <li>See the next review without changing reviewer-owned fields.</li>
          </ul>
          <h2>What this preview never does</h2>
          <ul>
            <li>It does not change a score, approve a review, or create an official acknowledgment.</li>
            <li>It does not create a coaching, remediation, or improvement-plan record.</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
