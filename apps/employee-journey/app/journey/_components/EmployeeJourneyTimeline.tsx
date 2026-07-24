"use client";

import { getJourneyPhases } from "../_data/fixtures";
import { usePreview } from "./PreviewContext";
import { MilestoneCard, PageHeader } from "./shared";

export function EmployeeJourneyTimeline() {
  const { persona } = usePreview();
  const phases = getJourneyPhases(persona);

  return (
    <div className="workspace timeline-workspace">
      <PageHeader
        eyebrow="MY JOURNEY"
        title="Your journey, phase by phase"
        description={`Every lifecycle phase for ${persona.name} is shown separately. Dates and statuses are synthetic preview data.`}
      />

      <div className="journey-key" role="note">
        <strong>No single percentage defines this journey.</strong>
        <span>
          Training, policies, documents, competencies, and performance each keep
          their own status.
        </span>
      </div>

      <div className="timeline-list">
        {phases.map((phase, index) => (
          <MilestoneCard key={phase.id} phase={phase} index={index} />
        ))}
      </div>
    </div>
  );
}

