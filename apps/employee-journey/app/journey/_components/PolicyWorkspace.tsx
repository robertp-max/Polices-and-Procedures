"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, Info } from "lucide-react";
import {
  POLICY_ASSIGNMENTS,
  type PolicyAssignment,
} from "../_data/fixtures";
import { usePreview } from "./PreviewContext";
import { PageHeader, RequirementCard } from "./shared";
import { WorkspaceTabs, workspaceTabId, type TabOption } from "./ui";

type PolicyFilter =
  | "All"
  | "Read now"
  | "Due soon"
  | "Complete"
  | "No action required";

const filters: TabOption<PolicyFilter>[] = [
  { id: "All", label: "All" },
  { id: "Read now", label: "Read now" },
  { id: "Due soon", label: "Due soon" },
  { id: "Complete", label: "Complete" },
  { id: "No action required", label: "No action" },
];

function groupByCourse(assignments: PolicyAssignment[]) {
  const groups = new Map<string, PolicyAssignment[]>();
  for (const assignment of assignments) {
    const key = `${assignment.pathway} · ${assignment.courseId} · ${assignment.courseTitle}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(assignment);
  }
  return Array.from(groups.entries());
}

export function PolicyWorkspace() {
  const { persona, withPersona } = usePreview();
  const [active, setActive] = useState<PolicyFilter>("All");

  const assignments = useMemo(() => POLICY_ASSIGNMENTS(persona), [persona]);
  const visible =
    active === "All"
      ? assignments
      : assignments.filter((policy) => policy.status === active);
  const grouped = useMemo(() => groupByCourse(visible), [visible]);
  const overview = useMemo(() => {
    const count = (status: PolicyFilter) =>
      assignments.filter((policy) => policy.status === status).length;
    return [
      { key: "read", label: "Read now", value: count("Read now"), tone: "urgent" },
      { key: "due", label: "Due soon", value: count("Due soon"), tone: "warn" },
      { key: "done", label: "Complete", value: count("Complete"), tone: "done" },
      { key: "total", label: "Total assigned", value: assignments.length, tone: "neutral" },
    ];
  }, [assignments]);
  const tabs = filters.map((filter) => ({
    ...filter,
    count:
      filter.id === "All"
        ? assignments.length
        : assignments.filter((policy) => policy.status === filter.id).length,
  }));

  return (
    <div className="workspace">
      <PageHeader
        eyebrow="POLICIES"
        title="Policy actions"
        description={`The full assigned policy set for the ${persona.role} pathway (${assignments.length} assignment${assignments.length === 1 ? "" : "s"}), grouped by course, with each policy's release and awareness state.`}
      />

      <div className="policy-overview" aria-label="Policy action summary">
        {overview.map((stat) => (
          <div key={stat.key} className={`policy-overview-stat tone-${stat.tone}`}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="truth-note" role="note">
        <Info aria-hidden="true" />
        <p>
          Change details are shown only when supplied. This preview does not
          invent policy diffs, acknowledgments, or scores. Version/effective
          date reflect the canonical policy&rsquo;s current version date
          only - not a per-employee acknowledgment history.
        </p>
      </div>

      <WorkspaceTabs
        label="Policy status filters"
        tabs={tabs}
        active={active}
        onChange={setActive}
        panelId="policy-panel"
      />

      <section
        id="policy-panel"
        role="tabpanel"
        aria-labelledby={workspaceTabId("policy-panel", active)}
        aria-label={`${active} policy assignments`}
      >
        {grouped.map(([courseKey, courseAssignments]) => (
          <div className="quarter-section" key={courseKey}>
            <div className="quarter-heading">
              <strong>{courseKey}</strong>
              <span>
                {courseAssignments.length} polic
                {courseAssignments.length === 1 ? "y" : "ies"}
              </span>
            </div>
            <div className="requirement-grid">
              {courseAssignments.map((policy) => (
                <RequirementCard
                  key={policy.assignmentId}
                  id={policy.id}
                  title={policy.title}
                  status={policy.status}
                  fields={[
                    { label: "Tier", value: policy.tier },
                    { label: "Version / effective date", value: policy.version },
                    { label: "What changed", value: policy.whatChanged },
                    { label: "Changed sections", value: policy.changedSections },
                    { label: "Why assigned", value: policy.whyAssigned },
                    { label: "Estimated reading time", value: policy.readingTime },
                    { label: "Due date", value: policy.dueDate },
                    { label: "Required action", value: policy.actionType },
                    {
                      label: "Scope",
                      value: policy.inherited
                        ? "Inherited from the General pathway"
                        : `${policy.pathway} pathway`,
                    },
                  ]}
                  footer={
                    <div className="card-actions">
                      <Link
                        className="button button-primary"
                        href={withPersona(`/journey/policies/${policy.assignmentId}`)}
                      >
                        <BookOpenCheck aria-hidden="true" />
                        Open policy
                        <ArrowRight aria-hidden="true" />
                      </Link>
                      {policy.quizRequired ? (
                        <Link
                          className="button button-secondary"
                          href={withPersona(`/journey/policies/${policy.assignmentId}/quiz`)}
                        >
                          Knowledge check
                        </Link>
                      ) : null}
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        ))}
        {!visible.length ? (
          <div className="empty-state">
            <strong>No policies in this filter</strong>
            <p>No employee action is required for this synthetic persona.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
