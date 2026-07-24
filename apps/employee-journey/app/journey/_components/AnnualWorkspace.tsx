"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Info,
  LockKeyhole,
  ShieldCheck,
  Siren,
} from "lucide-react";
import {
  getAchcBundle,
  getAgencyAnnualPlan,
  getAnnualCompetency,
  getEmergencyDrills,
  getPolicyUpdates,
  formatBucketHours,
  formatDuration,
  type AnnualModuleView,
} from "../_data/annualAdvancedCatalog";
import { usePreview } from "./PreviewContext";
import { MainAppLink } from "./MainAppLink";
import { PageHeader, RequirementCard } from "./shared";
import { WorkspaceTabs, workspaceTabId, type TabOption } from "./ui";

type AnnualTab =
  | "Agency Annual Plan"
  | "ACHC Field Worker Bundle"
  | "Annual Competency"
  | "Emergency Drills / Live"
  | "Policy Updates";

const tabs: TabOption<AnnualTab>[] = [
  { id: "Agency Annual Plan", label: "Agency Annual Plan" },
  { id: "ACHC Field Worker Bundle", label: "ACHC Field Worker Bundle" },
  { id: "Annual Competency", label: "Annual Competency" },
  { id: "Emergency Drills / Live", label: "Emergency Drills / Live" },
  { id: "Policy Updates", label: "Policy Updates" },
];

function ModuleCard({ item }: { item: AnnualModuleView }) {
  const fields = [
    { label: "Quarter", value: item.quarter ?? "Not quarter-specific" },
    { label: "Method", value: item.method === "None" ? "Read & acknowledge" : item.method },
    { label: "Duration", value: formatDuration(item.durationMinutes) },
    {
      label: "Pass threshold",
      value: item.passThreshold != null ? `${Math.round(item.passThreshold * 100)}%` : "Not scored",
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
  if (item.evidenceLabel) {
    fields.push({ label: "Evidence / form basis", value: item.evidenceLabel });
  }

  return (
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
  );
}

function QuarterGroupedGrid({ items }: { items: AnnualModuleView[] }) {
  const groups = useMemo(() => {
    const byQuarter = new Map<string, AnnualModuleView[]>();
    for (const item of items) {
      const key = item.quarter ?? "Not quarter-specific";
      if (!byQuarter.has(key)) byQuarter.set(key, []);
      byQuarter.get(key)!.push(item);
    }
    return Array.from(byQuarter.entries());
  }, [items]);

  if (!items.length) {
    return (
      <div className="empty-state">
        <strong>Nothing assigned in this section</strong>
        <p>No employee action is required for this synthetic persona.</p>
      </div>
    );
  }

  return (
    <>
      {groups.map(([quarter, groupItems]) => (
        <div className="quarter-section" key={quarter}>
          <div className="quarter-heading">
            <strong>{quarter}</strong>
            <span>
              {groupItems.length} module{groupItems.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="requirement-grid">
            {groupItems.map((item) => (
              <ModuleCard item={item} key={item.moduleId} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export function AnnualWorkspace() {
  const { persona } = usePreview();
  const [active, setActive] = useState<AnnualTab>("Agency Annual Plan");
  const roleCode = persona.roleCode;

  const plan = useMemo(() => getAgencyAnnualPlan(roleCode), [roleCode]);
  const achc = useMemo(() => getAchcBundle(roleCode), [roleCode]);
  const competency = useMemo(() => getAnnualCompetency(roleCode), [roleCode]);
  const drills = useMemo(() => getEmergencyDrills(roleCode), [roleCode]);
  const policyUpdates = useMemo(() => getPolicyUpdates(roleCode), [roleCode]);

  return (
    <div className="workspace">
      <PageHeader
        eyebrow="ANNUAL"
        title="Annual training & compliance plan"
        description="The full-year assignment plan for this role: agency-wide annual items, the ACHC field-worker in-service bundle, annual competency re-evaluation, emergency drills, and policy re-attestation cadence."
      />

      <WorkspaceTabs
        label="Annual plan sections"
        tabs={tabs}
        active={active}
        onChange={setActive}
        panelId="annual-panel"
      />

      <section
        id="annual-panel"
        role="tabpanel"
        aria-labelledby={workspaceTabId("annual-panel", active)}
        aria-label={`${active} section`}
      >
        {active === "Agency Annual Plan" ? (
          <div>
            <div className="summary-grid">
              <article className="summary-card">
                <p>Online training</p>
                <strong>{plan.onlineTrainingSummary.count}</strong>
                <span>{formatBucketHours(plan.onlineTrainingSummary)} assigned</span>
              </article>
              <article className="summary-card">
                <p>Policy learning</p>
                <strong>{plan.policyLearningSummary.count}</strong>
                <span>{formatBucketHours(plan.policyLearningSummary)} assigned</span>
              </article>
              <article className="summary-card">
                <p>Competency</p>
                <strong>{plan.competencySummary.count}</strong>
                <span>Skills checkoff — see Annual Competency tab</span>
              </article>
              <article className="summary-card">
                <p>Drill / live activities</p>
                <strong>{plan.drillLiveSummary.count}</strong>
                <span>Tabletop / live — see Drills tab</span>
              </article>
            </div>

            <div className="truth-note" role="note">
              <Info aria-hidden="true" />
              <p>
                These four counts are reported separately by design — the annual plan is not a
                single rolled-up percentage. Duration is shown only where the catalog specifies it.
              </p>
            </div>

            <div className="annual-subheading">
              <div>
                <h2>Online training</h2>
                <p>Graded modules (quiz, return demonstration, case study, or coding exercise).</p>
              </div>
            </div>
            <QuarterGroupedGrid items={plan.onlineTraining} />

            <div className="annual-subheading">
              <div>
                <h2>Policy learning</h2>
                <p>Read-and-acknowledge items with no separate graded assessment.</p>
              </div>
            </div>
            <QuarterGroupedGrid items={plan.policyLearning} />
          </div>
        ) : null}

        {active === "ACHC Field Worker Bundle" ? (
          !achc.assignedToRole ? (
            <div className="not-assigned-card">
              <strong>Not assigned to this role</strong>
              <p>
                {achc.admSecondaryOnly
                  ? "ADM oversees and approves this bundle but is not a primary clinical audience member — the modules are not directly assigned to the Administrator role."
                  : "The ACHC in-service bundle is scoped to direct clinical field workers (DON, RN, LVN, HHA, PT, PTA, OT, COTA, SLP, MSW). This persona's role is not in that audience."}
              </p>
            </div>
          ) : (
            <div>
              <div className="cert-gate-banner">
                <BadgeCheck aria-hidden="true" />
                <div>
                  <strong>Certificate gate</strong>
                  <p>
                    All {achc.totalCount} modules across Q1–Q4 must be completed within the plan
                    year to qualify for the annual ACHC field-worker in-service certificate.
                  </p>
                </div>
              </div>
              <QuarterGroupedGrid items={achc.modules} />
            </div>
          )
        ) : null}

        {active === "Annual Competency" ? (
          <div>
            <div className="truth-note" role="note">
              <ShieldCheck aria-hidden="true" />
              <p>
                Competency re-evaluations require a supervisor skills checkoff and signature —
                they are not self-graded quizzes.
              </p>
            </div>
            <QuarterGroupedGrid items={competency} />
          </div>
        ) : null}

        {active === "Emergency Drills / Live" ? (
          <div>
            <div className="truth-note" role="note">
              <Siren aria-hidden="true" />
              <p>
                Tabletop / live emergency-preparedness activities twice per year, evidenced by an
                After-Action Review form.
              </p>
            </div>
            <QuarterGroupedGrid items={drills} />
          </div>
        ) : null}

        {active === "Policy Updates" ? (
          <div>
            <div className="truth-note" role="note">
              <Info aria-hidden="true" />
              <p>
                Policies whose assignment record calls for an annual review or re-attestation
                cycle, for this role&apos;s pathway. This is a policy-cadence reference, distinct
                from the training modules above — it does not track a personal completion state.
              </p>
            </div>
            {policyUpdates.length ? (
              <div className="policy-update-list">
                {policyUpdates.map((row) => (
                  <div className="policy-update-row" key={`${row.policyId}__${row.courseId}`}>
                    <div>
                      <p className="canonical-id">{row.policyId}</p>
                      <strong>{row.policyTitle}</strong>
                      <span>{row.courseTitle}</span>
                    </div>
                    <span className={`status-badge status-${row.tier.toLowerCase()}`}>{row.tier}</span>
                    <span className="policy-update-recurrence">{row.recurrence}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <strong>No annual policy re-attestations on file</strong>
                <p>No employee action is required for this synthetic persona.</p>
              </div>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}
