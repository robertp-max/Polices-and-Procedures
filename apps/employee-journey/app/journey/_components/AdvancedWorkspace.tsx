"use client";

import { useMemo } from "react";
import { AlertTriangle, ArrowRight, LockKeyhole } from "lucide-react";
import {
  getAdvancedCollection,
  formatDuration,
} from "../_data/annualAdvancedCatalog";
import { usePreview } from "./PreviewContext";
import { MainAppLink } from "./MainAppLink";
import { PageHeader, RequirementCard } from "./shared";

export function AdvancedWorkspace() {
  const { persona } = usePreview();
  const modules = useMemo(() => getAdvancedCollection(persona.roleCode), [persona.roleCode]);
  const assignedModules = modules.filter((m) => m.assignedToRole);

  return (
    <div className="workspace">
      <PageHeader
        eyebrow="ADVANCED TRAINING"
        title="Advanced training collection"
        description="Clinical-leadership-grade modules beyond the standard onboarding and annual plan: CMS-485 plans of care, QAPI, OASIS-E2, and documentation defensibility."
      />

      {!assignedModules.length ? (
        <div className="not-assigned-card">
          <strong>Not assigned to this role</strong>
          <p>
            No advanced-training module is currently scoped to this persona&apos;s role. The
            collection floor is PT, RN, DON, and ADM, with OASIS-E2 and documentation modules
            reaching additional canonical roles per module.
          </p>
        </div>
      ) : (
        <section className="requirement-grid">
          {assignedModules.map((item) => {
            const showAdmScopeWarning = item.scopeWarning && persona.roleCode === "ADM";
            const fields = [
              {
                label: "Canonical audience",
                value: item.canonical.join(", "),
              },
              {
                label: "Owner-added audience",
                value: item.ownerAdded.length ? item.ownerAdded.join(", ") : "None",
              },
              { label: "Method", value: item.method },
              { label: "Duration", value: formatDuration(item.durationMinutes) },
              {
                label: "Pass threshold",
                value:
                  item.passThreshold != null
                    ? `${Math.round(item.passThreshold * 100)}%`
                    : "Not scored",
              },
              {
                label: "Policy basis",
                value: item.policyRefs.length ? (
                  <span className="policy-chip-row">
                    {item.policyRefs.map((ref) => (
                      <span className="policy-chip" key={ref.id} title={ref.title ?? undefined}>
                        {ref.id}
                      </span>
                    ))}
                  </span>
                ) : (
                  "None on file"
                ),
              },
            ];

            return (
              <div key={item.moduleId}>
                {showAdmScopeWarning ? (
                  <div className="scope-warning-banner scope-warning-banner-stacked">
                    <AlertTriangle aria-hidden="true" />
                    <div>
                      <strong>Leadership / oversight assignment</strong>
                      <p>
                        Completing this module is for administrative oversight only — it does not
                        expand ADM&apos;s clinical scope of practice.
                      </p>
                    </div>
                  </div>
                ) : null}
                <RequirementCard
                  id={item.moduleId}
                  title={item.title}
                  status={item.playerAvailable ? "Required now" : "Unavailable"}
                  className={!item.playerAvailable ? "is-unavailable" : ""}
                  fields={fields}
                  footer={
                    item.playerAvailable && item.launchRef ? (
                      <MainAppLink className="button button-primary" path={item.launchRef}>
                        Launch module
                        <ArrowRight aria-hidden="true" />
                      </MainAppLink>
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
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
