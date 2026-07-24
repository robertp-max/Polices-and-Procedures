"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Info,
  Layers,
  Siren,
  Stethoscope,
  Wrench,
} from "lucide-react";
import {
  getAnnualRequirements,
  type AnnualRequirementItem,
  type AnnualRequirementsView,
} from "../_data/annualRequirements";
import {
  formatDuration,
  pathwayForRoleCode,
  type AnnualModuleView,
} from "../_data/annualAdvancedCatalog";
import { usePreview } from "./PreviewContext";
import { MainAppLink } from "./MainAppLink";
import { PageHeader, RequirementCard } from "./shared";

interface SectionDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  show: (v: AnnualRequirementsView) => boolean;
}

const SECTIONS: SectionDef[] = [
  { id: "achc", label: "ACHC Clinical Bundle", icon: Stethoscope, show: (v) => v.achc.assignedToRole },
  { id: "advanced", label: "Advanced Training", icon: GraduationCap, show: (v) => v.advanced.length > 0 },
  { id: "role-specific", label: "Role-Specific", icon: Layers, show: (v) => v.roleSpecific.length > 0 },
  { id: "hha-hours", label: "HHA In-Service Hours", icon: CalendarClock, show: (v) => v.hhaInService !== null },
  { id: "drills", label: "Drills / Live", icon: Siren, show: (v) => v.drills.length > 0 },
  { id: "policy-updates", label: "Policy Updates", icon: FileText, show: (v) => v.policyUpdates.length > 0 },
  { id: "credentials", label: "Credentials", icon: BadgeCheck, show: () => true },
  { id: "performance", label: "Performance Review", icon: ClipboardCheck, show: () => true },
];

function methodLabel(method: string): string {
  return method === "None" ? "Read & acknowledge" : method;
}

function RequirementCardView({ item }: { item: AnnualRequirementItem }) {
  const fields = [
    { label: "Quarter", value: item.quarter ?? "Not quarter-specific" },
    { label: "Method", value: methodLabel(item.method) },
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
  if (item.alsoSatisfies.length) {
    fields.push({
      label: "Also satisfies",
      value: (
        <span className="policy-chip-row">
          {item.alsoSatisfies.map((id) => (
            <span className="policy-chip policy-chip-soft" key={id}>
              {id}
            </span>
          ))}
        </span>
      ),
    });
  }

  return (
    <RequirementCard
      id={item.moduleId}
      title={item.title}
      status={item.state === "player-ready" ? "Required now" : "In development"}
      className={item.state === "in-development" ? "is-pending" : ""}
      fields={fields}
      footer={
        item.state === "player-ready" && item.launchRef ? (
          <MainAppLink className="button button-primary" path={item.launchRef}>
            Launch module
            <ArrowRight aria-hidden="true" />
          </MainAppLink>
        ) : (
          <div className="pending-action">
            <Wrench aria-hidden="true" />
            <div>
              <strong>Module content in development</strong>
              <span>
                This requirement is assigned. The interactive module is being built; the policy
                basis above is the current source of record.
              </span>
            </div>
          </div>
        )
      }
    />
  );
}

function AchcModuleCard({
  item,
  alsoSatisfies,
}: {
  item: AnnualModuleView;
  alsoSatisfies: string[];
}) {
  const asItem: AnnualRequirementItem = {
    moduleId: item.moduleId,
    title: item.title,
    quarter: item.quarter,
    method: item.method,
    durationMinutes: item.durationMinutes,
    passThreshold: item.passThreshold,
    policyRefs: item.policyRefs,
    cmsRefs: item.cmsRefs,
    launchRef: item.launchRef,
    state: item.playerAvailable ? "player-ready" : "in-development",
    alsoSatisfies,
  };
  return <RequirementCardView item={asItem} />;
}

function SectionHeader({
  icon: Icon,
  title,
  blurb,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  blurb: string;
}) {
  return (
    <div className="annual-subheading">
      <Icon aria-hidden="true" />
      <div>
        <h2>{title}</h2>
        <p>{blurb}</p>
      </div>
    </div>
  );
}

export function AnnualWorkspace() {
  const { persona, withPersona } = usePreview();
  const roleCode = persona.roleCode;
  const v = useMemo(() => getAnnualRequirements(roleCode), [roleCode]);

  const visibleSections = SECTIONS.filter((s) => s.show(v));
  const hasAny = v.summary.length > 0;

  return (
    <div className="workspace annual-workspace">
      <PageHeader
        eyebrow="ANNUAL & RECURRING"
        title="Annual & Recurring Requirements"
        description="Your recurring obligations for the plan year — the ACHC clinical bundle, advanced training, role-specific items, drills, policy re-attestations, credentials, and your performance review. Each requirement type is shown once, with its regulatory basis."
      />

      {!hasAny ? (
        <div className="empty-state">
          <strong>No recurring clinical requirements for this role</strong>
          <p>
            This persona has no ACHC, advanced, or role-specific annual training assignments.
            Agency-wide policy re-attestations, if any, appear under Policy Updates.
          </p>
        </div>
      ) : (
        <>
          {/* One concise status strip (§17) — no rolled-up count cards. */}
          <div className="annual-summary-strip" role="status" aria-label="Annual requirement summary">
            {v.summary.map((chip) => (
              <div className="annual-summary-chip" key={chip.label}>
                <span className="annual-summary-value">{chip.value}</span>
                <span className="annual-summary-label">{chip.label}</span>
              </div>
            ))}
          </div>

          <nav className="annual-section-nav" aria-label="Jump to requirement section">
            {visibleSections.map((s) => (
              <a key={s.id} href={`#annual-${s.id}`} className="annual-section-link">
                <s.icon aria-hidden="true" />
                {s.label}
              </a>
            ))}
          </nav>

          <div className="truth-note" role="note">
            <Info aria-hidden="true" />
            <p>
              Requirement types are not rolled up into a single percentage — a graded module, a
              supervisor competency, a live drill, a credential renewal, and a policy re-attestation
              are different obligations. Completion syncs from the agency training record; this
              preview does not create official records. Duration reads &ldquo;Not specified&rdquo;
              only where the source catalog omits it.
            </p>
          </div>
        </>
      )}

      {/* ACHC Clinical Bundle */}
      {v.achc.assignedToRole ? (
        <section id="annual-achc" className="annual-section">
          <SectionHeader
            icon={Stethoscope}
            title="ACHC Clinical Bundle"
            blurb="The 12-module ACHC field-worker in-service bundle (Q1–Q4). Complete all 12 within the plan year to earn the annual in-service certificate."
          />
          <div className="cert-gate-banner">
            <BadgeCheck aria-hidden="true" />
            <div>
              <strong>Certificate gate</strong>
              <p>
                All {v.achc.totalCount} modules across Q1–Q4 must be completed within the plan year
                to qualify for the annual ACHC field-worker in-service certificate.
              </p>
            </div>
          </div>
          <div className="requirement-grid">
            {v.achc.modules.map((m) => (
              <AchcModuleCard
                item={m}
                alsoSatisfies={v.achcAlsoSatisfies[m.moduleId] ?? []}
                key={m.moduleId}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Advanced Training */}
      {v.advanced.length ? (
        <section id="annual-advanced" className="annual-section">
          <SectionHeader
            icon={GraduationCap}
            title="Advanced Training"
            blurb="Advanced clinical/leadership modules that recur annually for your role. The same module also appears in your onboarding path — this is the recurring assignment instance."
          />
          <div className="requirement-grid">
            {v.advanced.map((a) => (
              <RequirementCard
                key={a.moduleId}
                id={a.moduleId}
                title={a.title}
                status={a.playerAvailable ? "Required now" : "In development"}
                className={!a.playerAvailable ? "is-pending" : ""}
                fields={[
                  { label: "Duration", value: formatDuration(a.durationMinutes) },
                  {
                    label: "Pass threshold",
                    value: a.passThreshold != null ? `${Math.round(a.passThreshold * 100)}%` : "Not scored",
                  },
                  { label: "Effective audience", value: a.effective.join(", ") },
                  ...(a.scopeWarning && roleCode === "ADM"
                    ? [{ label: "ADM scope", value: "Leadership / oversight learning — does not expand clinical scope or authorize OASIS assessment." }]
                    : []),
                ]}
                footer={
                  a.playerAvailable && a.launchRef ? (
                    <MainAppLink className="button button-primary" path={a.launchRef}>
                      Launch module
                      <ArrowRight aria-hidden="true" />
                    </MainAppLink>
                  ) : (
                    <div className="pending-action">
                      <Wrench aria-hidden="true" />
                      <div>
                        <strong>Module content in development</strong>
                        <span>Assigned; interactive module being built.</span>
                      </div>
                    </div>
                  )
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Role-Specific */}
      {v.roleSpecific.length ? (
        <section id="annual-role-specific" className="annual-section">
          <SectionHeader
            icon={Layers}
            title="Role-Specific Requirements"
            blurb="Recurring items that are distinct from the ACHC bundle — kept separate because each has its own legal duration, delivery method, or role-specific assessment."
          />
          <div className="requirement-grid">
            {v.roleSpecific.map((item) => (
              <RequirementCardView item={item} key={item.moduleId} />
            ))}
          </div>
        </section>
      ) : null}

      {/* HHA In-Service Hours */}
      {v.hhaInService ? (
        <section id="annual-hha-hours" className="annual-section">
          <SectionHeader
            icon={CalendarClock}
            title="HHA In-Service Hours"
            blurb="Home health aides must complete at least 12 hours of in-service education per 12-month period."
          />
          <div className="inservice-clock">
            <div className="inservice-clock-face">
              <strong>{v.hhaInService.loggedHours}</strong>
              <span>of {v.hhaInService.requiredHours} hours</span>
            </div>
            <div>
              <p className="inservice-clock-note">{v.hhaInService.note}</p>
              <p className="inservice-clock-basis">Basis: 42 CFR 484.80(d).</p>
            </div>
          </div>
        </section>
      ) : null}

      {/* Drills / Live */}
      {v.drills.length ? (
        <section id="annual-drills" className="annual-section">
          <SectionHeader
            icon={Siren}
            title="Drills / Live Activities"
            blurb="Emergency-preparedness drills and live tabletop activities, evidenced by an After-Action Review. A live activity is a distinct obligation from the emergency-preparedness training module."
          />
          <div className="requirement-grid">
            {v.drills.map((d) => (
              <RequirementCard
                key={d.moduleId}
                id={d.moduleId}
                title={d.title}
                status="Live activity"
                fields={[
                  { label: "Quarter", value: d.quarter ?? "Not quarter-specific" },
                  { label: "Method", value: methodLabel(d.method) },
                  { label: "Evidence", value: d.evidenceLabel ?? "After-Action Review" },
                ]}
                footer={
                  <div className="pending-action">
                    <Siren aria-hidden="true" />
                    <div>
                      <strong>Facilitated live activity</strong>
                      <span>Scheduled and documented by your supervisor / emergency-preparedness lead.</span>
                    </div>
                  </div>
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Policy Updates */}
      {v.policyUpdates.length ? (
        <section id="annual-policy-updates" className="annual-section">
          <SectionHeader
            icon={FileText}
            title="Policy Updates"
            blurb="Policies whose assignment calls for an annual review or re-attestation for your pathway. This reflects policy-level cadence, not module completion."
          />
          <div className="policy-update-list">
            {v.policyUpdates.map((row) => (
              <Link
                className="policy-update-row"
                key={`${row.policyId}__${row.courseId}`}
                href={withPersona(
                  `/journey/policies/${pathwayForRoleCode(roleCode)}__${row.courseId}__${row.policyId}`,
                )}
                aria-label={`${row.policyId} ${row.policyTitle}`}
              >
                <div>
                  <p className="canonical-id">{row.policyId}</p>
                  <strong>{row.policyTitle}</strong>
                  <span>{row.courseTitle}</span>
                </div>
                <span className={`status-badge status-${row.tier.toLowerCase()}`}>{row.tier}</span>
                <span className="policy-update-recurrence">{row.recurrence}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Credentials & Renewals → Documents */}
      <section id="annual-credentials" className="annual-section">
        <SectionHeader
          icon={BadgeCheck}
          title="Credentials & Renewals"
          blurb="License, certification, and health-clearance renewals are tracked in your Documents workspace."
        />
        <Link className="annual-link-card" href={withPersona("/journey/documents")}>
          <BadgeCheck aria-hidden="true" />
          <div>
            <strong>Open Documents & Credentials</strong>
            <span>Renewal dates, expiring items, and clearance status.</span>
          </div>
          <ArrowRight aria-hidden="true" />
        </Link>
      </section>

      {/* Performance Review → Performance */}
      <section id="annual-performance" className="annual-section">
        <SectionHeader
          icon={ClipboardCheck}
          title="Performance Review"
          blurb="Your annual performance evaluation and any check-ins are tracked in your Performance workspace, separate from training completion."
        />
        <Link className="annual-link-card" href={withPersona("/journey/performance")}>
          <ClipboardCheck aria-hidden="true" />
          <div>
            <strong>Open Performance</strong>
            <span>Annual evaluation and 30/60/90-day check-ins.</span>
          </div>
          <ArrowRight aria-hidden="true" />
        </Link>
      </section>

      {/* Competency lives in its own workspace (§5.3) — link, not a tab. */}
      {v.competencyCount > 0 ? (
        <div className="truth-note" role="note">
          <ClipboardCheck aria-hidden="true" />
          <p>
            {v.competencyCount} annual competency re-evaluation
            {v.competencyCount === 1 ? "" : "s"} require a supervisor skills checkoff and signature.
            Competencies are managed in the{" "}
            <Link className="text-link" href={withPersona("/journey/competencies")}>
              Competencies workspace
            </Link>
            , not here.
          </p>
        </div>
      ) : null}
    </div>
  );
}
