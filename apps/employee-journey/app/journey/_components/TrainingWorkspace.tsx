"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarClock, CheckCircle2, ClipboardCheck, GraduationCap, LockKeyhole, Route } from "lucide-react";
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
  { id: "Workflows", label: "Workflows" },
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
        assignment.category !== "Workflows" &&
        ["Required now", "In progress", "Due soon", "Unavailable"].includes(
          assignment.status,
        )),
  );
  const workflowAssignments = assignments.filter(
    (assignment) => assignment.category === "Workflows",
  );
  const workflowDomains = Array.from(
    new Set(workflowAssignments.map((assignment) => assignment.workflowDomain ?? "Workflow")),
  );
  const tabs = filters.map((filter) => ({
    ...filter,
    count:
      filter.id === "Required now"
        ? assignments.filter((assignment) =>
            assignment.category !== "Workflows" &&
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

      <div className="training-links-row" aria-label="Related training workspaces">
        <Link className="annual-link-card" href={withPersona("/journey/training/advanced")}>
          <GraduationCap aria-hidden="true" />
          <div>
            <strong>Advanced training →</strong>
            <span>
              CMS-485, QAPI, OASIS-E2, Documentation Defensibility — advanced clinical/leadership
              modules.
            </span>
          </div>
          <ArrowRight aria-hidden="true" />
        </Link>
        <Link className="annual-link-card" href={withPersona("/journey/training/annual")}>
          <CalendarClock aria-hidden="true" />
          <div>
            <strong>Annual & recurring training →</strong>
            <span>Plan-year requirements, in-service hours, and recurring re-attestations.</span>
          </div>
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>

      <WorkspaceTabs
        label="Training filters"
        tabs={tabs}
        active={active}
        onChange={setActive}
        panelId="training-panel"
      />

      {active === "Workflows" ? (
        <section className="workflow-training-hero" aria-labelledby="workflow-training-title">
          <div className="workflow-training-mark" aria-hidden="true">
            <Route />
          </div>
          <div>
            <p className="eyebrow">MANDATED WORKFLOW LIBRARY</p>
            <h2 id="workflow-training-title">All required workflow assignments</h2>
            <p>
              This tab lists the full approved workflow set from the source library. CL-WF-26
              remains the launchable Plan of Care audit simulation; the rest are required
              workflow-control library items for review and assignment visibility.
            </p>
            <div className="workflow-lane-strip" aria-label="Workflow domains">
              {workflowDomains.map((domain) => (
                <span key={domain}>
                  <CheckCircle2 aria-hidden="true" />
                  {domain}
                </span>
              ))}
            </div>
          </div>
          <div className="workflow-training-stat">
            <ClipboardCheck aria-hidden="true" />
            <strong>{workflowAssignments.length}</strong>
            <span>mandated workflows</span>
          </div>
        </section>
      ) : null}

      <section
        id="training-panel"
        className={`requirement-grid${active === "Workflows" ? " workflow-training-grid" : ""}`}
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
                <div className={assignment.category === "Workflows" ? "workflow-module-footer" : undefined}>
                  {assignment.category === "Workflows" ? (
                    <div className="workflow-card-summary" aria-label={`${assignment.id} workflow summary`}>
                      <span>{assignment.workflowDomain}</span>
                      <strong>{assignment.relationshipNote}</strong>
                    </div>
                  ) : null}
                  {assignment.href && assignment.hrefKind === "external" ? (
                    <MainAppLink className="button button-primary" path={assignment.href}>
                      {assignment.action}
                      <ArrowRight aria-hidden="true" />
                    </MainAppLink>
                  ) : assignment.href ? (
                    <Link
                      className={assignment.category === "Workflows" ? "button button-primary workflow-start-button" : "button button-primary"}
                      href={withPersona(assignment.href)}
                    >
                      {assignment.action}
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  ) : (
                    <button
                      className={assignment.category === "Workflows" ? "button button-primary" : "button button-secondary"}
                      type="button"
                      onClick={() =>
                        announce(
                          assignment.category === "Workflows"
                            ? `${assignment.id} workflow requirement opened in preview mode. No official record was changed.`
                            : "Preview opened. No official record was changed.",
                        )
                      }
                    >
                      {assignment.action}
                    </button>
                  )}
                </div>
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
