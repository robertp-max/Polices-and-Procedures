"use client";

import { useMemo, useState } from "react";
import { Eye, ShieldCheck, Stethoscope } from "lucide-react";
import {
  getRoleOversight,
  getOigSamStatus,
  type OigSamState,
  type OversightClock,
} from "../_data/supervisedVisitation";

const OIG_STATE_CLASS: Record<OigSamState, string> = {
  current: "status-complete",
  "under-review": "status-in-progress",
  "waiting-hr": "status-in-progress",
  "action-required": "status-unavailable",
  "not-applicable-approved": "status-waiting",
  "review-required": "status-in-progress",
};

type Scenario = "skilled" | "aide-only" | "mixed";

const SCENARIO_OPTIONS: { id: Scenario; label: string }[] = [
  { id: "skilled", label: "Patient also receives skilled services" },
  { id: "aide-only", label: "Aide-only patient" },
  { id: "mixed", label: "Mixed active caseload" },
];

/** Clocks that apply to the selected active assignment scenario. `all`-scenario
 * clocks (e.g. in-service hours) always apply; a "mixed" caseload shows every clock. */
function clocksForScenario(clocks: OversightClock[], scenario: Scenario): OversightClock[] {
  return clocks.filter((c) => {
    const s = c.scenario ?? "all";
    if (s === "all") return true;
    if (scenario === "mixed") return true;
    return s === scenario;
  });
}

function ClockCard({ clock, showBasis = true }: { clock: OversightClock; showBasis?: boolean }) {
  return (
    <article className="oversight-clock-card">
      <div className="oversight-clock-cadence">
        <Eye aria-hidden="true" />
        <span>{clock.cadence}</span>
      </div>
      <h3>{clock.label}</h3>
      <p>{clock.detail}</p>
      {showBasis ? <p className="oversight-clock-basis">Basis: {clock.basis}</p> : null}
    </article>
  );
}

export function SupervisedVisitationPanel({ roleCode }: { roleCode: string }) {
  const oversight = getRoleOversight(roleCode);
  const oigSam = getOigSamStatus(roleCode);
  const hasScenarios = useMemo(
    () => !!oversight?.clocks.some((c) => c.scenario === "skilled" || c.scenario === "aide-only"),
    [oversight],
  );
  const [scenario, setScenario] = useState<Scenario>("skilled");
  const activeClocks = useMemo(
    () => (oversight && hasScenarios ? clocksForScenario(oversight.clocks, scenario) : oversight?.clocks ?? []),
    [oversight, hasScenarios, scenario],
  );

  return (
    <section className="oversight-panel" aria-label="Supervised visitation and clinical oversight">
      <div className="annual-subheading">
        <Stethoscope aria-hidden="true" />
        <div>
          <h2>Supervised visits &amp; clinical oversight</h2>
          <p>Role- and assignment-specific oversight clocks. These run independently — they are never merged.</p>
        </div>
      </div>

      {/* OIG/SAM status tile (HR/Compliance-owned, employee-safe) */}
      <div className="oigsam-tile">
        <ShieldCheck aria-hidden="true" />
        <div>
          <div className="oigsam-head">
            <strong>OIG/SAM exclusion status</strong>
            <span className={`status-badge ${OIG_STATE_CLASS[oigSam.state]}`}>{oigSam.label}</span>
          </div>
          <p>{oigSam.note}</p>
          <p className="oigsam-basis">Basis: {oigSam.basis}</p>
        </div>
      </div>

      {!oversight ? (
        <p className="oversight-intro">
          No clinical supervised-visit cadence applies to this role. The OIG/SAM status above
          reflects your screening applicability.
        </p>
      ) : hasScenarios ? (
        <>
          <p className="oversight-intro">{oversight.intro}</p>

          {/* Rules that MAY apply — reference (cadence only, no due date) */}
          <div className="annual-subheading oversight-subhead">
            <div>
              <h2>Rules that may apply (HHA)</h2>
              <p>The full set of home-health-aide oversight rules. Which apply depends on your active assignment.</p>
            </div>
          </div>
          <ul className="oversight-rule-list">
            {oversight.clocks.map((c) => (
              <li key={c.label}>
                <strong>{c.cadence}</strong> — {c.label}
                <span className="oversight-rule-scenario">
                  {c.scenario === "skilled"
                    ? "when the patient also receives skilled services"
                    : c.scenario === "aide-only"
                      ? "when the patient receives aide services only"
                      : "all HHA assignments"}
                </span>
              </li>
            ))}
          </ul>

          {/* Active assignment clocks — only the applicable scenario */}
          <div className="annual-subheading oversight-subhead">
            <div>
              <h2>Your active assignment clocks</h2>
              <p>Select the active assignment scenario to see only the clocks that apply to it.</p>
            </div>
          </div>
          <div className="oversight-scenario-tabs" role="tablist" aria-label="Active assignment scenario">
            {SCENARIO_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                role="tab"
                aria-selected={scenario === opt.id}
                onClick={() => setScenario(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="oversight-clock-grid">
            {activeClocks.map((clock) => (
              <ClockCard clock={clock} key={clock.label} />
            ))}
          </div>
          <p className="oversight-note">
            Clocks start from an assignment start date and last-completed date. This synthetic
            preview does not hold those dates, so no employee due date is shown — cadence only.
          </p>
          {oversight.notes.map((note) => (
            <p className="oversight-note" key={note}>{note}</p>
          ))}
        </>
      ) : (
        <>
          <p className="oversight-intro">{oversight.intro}</p>
          <div className="oversight-clock-grid">
            {activeClocks.map((clock) => (
              <ClockCard clock={clock} key={clock.label} />
            ))}
          </div>
          {oversight.notes.map((note) => (
            <p className="oversight-note" key={note}>{note}</p>
          ))}
        </>
      )}
    </section>
  );
}
