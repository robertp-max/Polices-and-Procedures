"use client";

import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import {
  getCompetencies,
  type CompetencyFixture,
} from "../_data/fixtures";
import { usePreview } from "./PreviewContext";
import { MainAppLink } from "./MainAppLink";
import { PageHeader, RequirementCard } from "./shared";
import { WorkspaceTabs, workspaceTabId, type TabOption } from "./ui";

type CompetencyFilter = CompetencyFixture["status"];

const filters: TabOption<CompetencyFilter>[] = [
  { id: "Upcoming", label: "Upcoming" },
  { id: "Scheduled", label: "Scheduled" },
  { id: "Waiting on evaluator", label: "Waiting on evaluator" },
  { id: "Completed", label: "Completed" },
  { id: "Needs follow-up", label: "Needs follow-up" },
  { id: "Remediation", label: "Remediation" },
];

export function CompetencyWorkspace() {
  const { persona, announce } = usePreview();
  const competencies = useMemo(() => getCompetencies(persona), [persona]);
  const initial =
    filters.find((filter) =>
      competencies.some((item) => item.status === filter.id),
    )?.id ?? "Upcoming";
  const [active, setActive] = useState<CompetencyFilter>(initial);
  const visible = competencies.filter((item) => item.status === active);
  const tabs = filters.map((filter) => ({
    ...filter,
    count: competencies.filter((item) => item.status === filter.id).length,
  }));

  return (
    <div className="workspace">
      <PageHeader
        eyebrow="COMPETENCIES"
        title="Competencies & supervised practice"
        description={`Only requirements applicable to the ${persona.role} synthetic fixture are rendered.`}
      />

      <div className="truth-note" role="note">
        <Info aria-hidden="true" />
        <p>
          Cadence is role and assignment specific. Return demonstrations,
          record reviews, simulations, and drills are validation methods - not
          universal recurring intervals.
        </p>
      </div>

      <WorkspaceTabs
        label="Competency status filters"
        tabs={tabs}
        active={active}
        onChange={setActive}
        panelId="competency-panel"
      />

      <section
        id="competency-panel"
        className="requirement-grid"
        role="tabpanel"
        aria-labelledby={workspaceTabId("competency-panel", active)}
        aria-label={`${active} competencies`}
      >
        {visible.map((item) => (
          <RequirementCard
            key={item.id}
            title={item.requirement}
            status={item.status}
            fields={[
              { label: "Cadence", value: item.cadence },
              { label: "Due date", value: item.dueDate },
              { label: "Evaluator", value: item.evaluator },
              { label: "Preparation", value: item.preparation },
              { label: "Next action", value: item.nextAction },
              { label: "Clearance impact", value: item.clearanceImpact },
              { label: "Policy / workflow basis", value: item.basis },
            ]}
            footer={
              item.href && item.hrefKind === "external" ? (
                <MainAppLink className="button button-secondary" path={item.href}>
                  {item.nextAction}
                </MainAppLink>
              ) : (
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() =>
                    announce("Preview opened. No official record was changed.")
                  }
                >
                  {item.nextAction}
                </button>
              )
            }
          />
        ))}
        {!visible.length ? (
          <div className="empty-state">
            <strong>No {active.toLowerCase()} items</strong>
            <p>No employee action is required for this synthetic role.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
