"use client";

import { useMemo, useState } from "react";
import { BookOpenCheck, Info } from "lucide-react";
import {
  POLICY_ASSIGNMENTS,
  type PolicyAssignment,
} from "../_data/fixtures";
import { usePreview } from "./PreviewContext";
import { PageHeader, RequirementCard } from "./shared";
import { Modal, WorkspaceTabs, workspaceTabId, type TabOption } from "./ui";

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

export function PolicyWorkspace() {
  const { persona, announce } = usePreview();
  const [active, setActive] = useState<PolicyFilter>("All");
  const [selected, setSelected] = useState<PolicyAssignment | null>(null);

  const assignments = useMemo(
    () =>
      POLICY_ASSIGNMENTS.filter(
        (policy) =>
          policy.id !== "EN-LC-001" || persona.id === "riley-administrator",
      ),
    [persona.id],
  );
  const visible =
    active === "All"
      ? assignments
      : assignments.filter((policy) => policy.status === active);
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
        description="Learner-friendly assignments replace giant policy-course bundles. Detailed publication blockers remain outside employee mode."
      />

      <div className="truth-note" role="note">
        <Info aria-hidden="true" />
        <p>
          Change details are shown only when supplied. This preview does not
          invent policy diffs, acknowledgments, or scores.
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
        className="requirement-grid"
        role="tabpanel"
        aria-labelledby={workspaceTabId("policy-panel", active)}
        aria-label={`${active} policy assignments`}
      >
        {visible.map((policy) => (
          <RequirementCard
            key={policy.id}
            id={policy.id}
            title={policy.title}
            status={policy.status}
            fields={[
              { label: "Version", value: policy.version },
              { label: "Effective date", value: policy.effectiveDate },
              { label: "What changed", value: policy.whatChanged },
              { label: "Changed sections", value: policy.changedSections },
              { label: "Why assigned", value: policy.whyAssigned },
              { label: "Estimated reading time", value: policy.readingTime },
              { label: "Due date", value: policy.dueDate },
              { label: "Required action", value: policy.actionType },
            ]}
            footer={
              <div className="card-actions">
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => setSelected(policy)}
                >
                  <BookOpenCheck aria-hidden="true" />
                  View assignment
                </button>
                {!["No employee action", "Awareness only"].includes(
                  policy.actionType,
                ) ? (
                  <button
                    className="button button-primary"
                    type="button"
                    onClick={() =>
                      announce(
                        policy.actionType === "Read + quiz"
                          ? "Practice quiz opened. No official score was recorded."
                          : "Acknowledgment preview opened. No official acknowledgment was recorded.",
                      )
                    }
                  >
                    {policy.actionType}
                  </button>
                ) : null}
              </div>
            }
          />
        ))}
      </section>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.id} · ${selected.title}` : "Policy assignment"}
        description="Employee-facing assignment summary"
      >
        {selected ? (
          <div className="policy-summary-modal">
            <dl>
              <div>
                <dt>Version / effective date</dt>
                <dd>{selected.version} · {selected.effectiveDate}</dd>
              </div>
              <div>
                <dt>What changed</dt>
                <dd>{selected.whatChanged}</dd>
              </div>
              <div>
                <dt>Changed sections</dt>
                <dd>{selected.changedSections}</dd>
              </div>
              <div>
                <dt>Your action</dt>
                <dd>{selected.actionType}</dd>
              </div>
            </dl>
            <div className="preview-callout">
              <strong>Preview only</strong>
              <p>
                Official controlled policy text and evidence will appear here
                when connected. No official record was changed.
              </p>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
