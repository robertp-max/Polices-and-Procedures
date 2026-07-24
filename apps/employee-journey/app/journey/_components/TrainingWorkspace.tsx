"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import {
  getTrainingAssignments,
  type TrainingAssignment,
} from "../_data/fixtures";
import { usePreview } from "./PreviewContext";
import { MainAppLink } from "./MainAppLink";
import { PageHeader, RequirementCard } from "./shared";
import { WorkspaceTabs, workspaceTabId, type TabOption } from "./ui";

type TrainingFilter = TrainingAssignment["category"];

const filters: TabOption<TrainingFilter>[] = [
  { id: "Required now", label: "Required now" },
  { id: "Onboarding", label: "Onboarding" },
  { id: "Role-specific", label: "Role-specific" },
  { id: "Annual", label: "Annual" },
  { id: "Policy quiz", label: "Policy quiz" },
  { id: "Competency", label: "Competency" },
  { id: "Drill / live", label: "Drill / live" },
  { id: "Completed", label: "Completed" },
];

export function TrainingWorkspace() {
  const { persona, withPersona, announce } = usePreview();
  const [active, setActive] = useState<TrainingFilter>("Required now");
  const assignments = useMemo(() => getTrainingAssignments(persona), [persona]);
  const visible = assignments.filter(
    (assignment) =>
      assignment.category === active ||
      (active === "Required now" &&
        ["Required now", "In progress", "Due soon", "Unavailable"].includes(
          assignment.status,
        )),
  );
  const tabs = filters.map((filter) => ({
    ...filter,
    count:
      filter.id === "Required now"
        ? assignments.filter((assignment) =>
            ["Required now", "In progress", "Due soon", "Unavailable"].includes(
              assignment.status,
            ),
          ).length
        : assignments.filter((assignment) => assignment.category === filter.id)
            .length,
  }));

  return (
    <div className="workspace">
      <PageHeader
        eyebrow="TRAINING"
        title="Assigned training"
        description="Every card explains why the assignment appears, what validates it, and whether approved content is actually available."
      />

      <WorkspaceTabs
        label="Training filters"
        tabs={tabs}
        active={active}
        onChange={setActive}
        panelId="training-panel"
      />

      <section
        id="training-panel"
        className="requirement-grid"
        role="tabpanel"
        aria-labelledby={workspaceTabId("training-panel", active)}
        aria-label={`${active} training assignments`}
      >
        {visible.map((assignment) => (
          <RequirementCard
            key={assignment.id}
            id={assignment.id}
            title={assignment.title}
            status={assignment.status}
            className={!assignment.available ? "is-unavailable" : ""}
            fields={[
              { label: "Why assigned", value: assignment.whyAssigned },
              { label: "Role / audience", value: assignment.audience },
              { label: "Due date", value: assignment.dueDate },
              { label: "Duration", value: assignment.duration },
              { label: "Progress", value: assignment.progress },
              { label: "Prerequisite", value: assignment.prerequisite },
              { label: "Validation rule", value: assignment.validation },
            ]}
            footer={
              assignment.available ? (
                assignment.href && assignment.hrefKind === "external" ? (
                  <MainAppLink className="button button-primary" path={assignment.href}>
                    {assignment.action}
                    <ArrowRight aria-hidden="true" />
                  </MainAppLink>
                ) : assignment.href ? (
                  <Link
                    className="button button-primary"
                    href={withPersona(assignment.href)}
                  >
                    {assignment.action}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                ) : (
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={() =>
                      announce(
                        "Preview opened. No official record was changed.",
                      )
                    }
                  >
                    {assignment.action}
                  </button>
                )
              ) : (
                <div className="unavailable-action">
                  <LockKeyhole aria-hidden="true" />
                  <div>
                    <strong>Content not yet available</strong>
                    <span>No employee action required</span>
                  </div>
                  <button type="button" disabled>
                    Unavailable
                  </button>
                </div>
              )
            }
          />
        ))}
        {!visible.length ? (
          <div className="empty-state">
            <strong>No assignments in this filter</strong>
            <p>No employee action is required for this synthetic persona.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
