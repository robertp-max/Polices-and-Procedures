"use client";

import { Eye, ShieldCheck, Stethoscope } from "lucide-react";
import {
  getRoleOversight,
  getOigSamStatus,
  type OigSamState,
} from "../_data/supervisedVisitation";

const OIG_STATE_CLASS: Record<OigSamState, string> = {
  cleared: "status-complete",
  "under-review": "status-in-progress",
  "action-required": "status-unavailable",
  "waiting-hr": "status-in-progress",
  "not-applicable": "status-waiting",
};

export function SupervisedVisitationPanel({ roleCode }: { roleCode: string }) {
  const oversight = getRoleOversight(roleCode);
  const oigSam = getOigSamStatus(roleCode);

  return (
    <section className="oversight-panel" aria-label="Supervised visitation and clinical oversight">
      <div className="annual-subheading">
        <Stethoscope aria-hidden="true" />
        <div>
          <h2>Supervised visits & clinical oversight</h2>
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
        </div>
      </div>

      {oversight ? (
        <>
          <p className="oversight-intro">{oversight.intro}</p>
          <div className="oversight-clock-grid">
            {oversight.clocks.map((clock) => (
              <article className="oversight-clock-card" key={clock.label}>
                <div className="oversight-clock-cadence">
                  <Eye aria-hidden="true" />
                  <span>{clock.cadence}</span>
                </div>
                <h3>{clock.label}</h3>
                <p>{clock.detail}</p>
                <p className="oversight-clock-basis">Basis: {clock.basis}</p>
              </article>
            ))}
          </div>
          {oversight.notes.map((note) => (
            <p className="oversight-note" key={note}>
              {note}
            </p>
          ))}
        </>
      ) : (
        <p className="oversight-intro">
          No clinical supervised-visit cadence applies to this role. OIG/SAM status above reflects
          your screening applicability.
        </p>
      )}
    </section>
  );
}
