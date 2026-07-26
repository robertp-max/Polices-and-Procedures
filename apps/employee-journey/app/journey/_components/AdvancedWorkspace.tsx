"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, GraduationCap } from "lucide-react";
import { getAdvancedTraining } from "../_data/advancedTraining";
import { formatDuration } from "../_data/annualAdvancedCatalog";
import { usePreview } from "./PreviewContext";
import { MainAppLink } from "./MainAppLink";
import { PageHeader } from "./shared";

export function AdvancedWorkspace() {
  const { persona, withPersona } = usePreview();
  const view = useMemo(() => getAdvancedTraining(persona.roleCode), [persona.roleCode]);

  // Not one of the four Advanced-Training roles → no "Advanced" surface for this persona
  // (no disabled / not-assigned tab). Route landing shows a brief redirect note only.
  if (!view.visible) {
    return (
      <div className="workspace">
        <PageHeader
          eyebrow="ADVANCED TRAINING"
          title="Advanced Training is not part of your role's plan"
          description="Advanced Training is scoped to PT, RN, DON, and Administrator. Any advanced clinical content that applies to your role appears under Role-Specific or Annual & Recurring requirements."
        />
        <Link className="text-link" href={withPersona("/journey/training")}>
          <ArrowLeft aria-hidden="true" /> Back to Training
        </Link>
      </div>
    );
  }

  return (
    <div className="workspace adv-workspace">
      <PageHeader
        eyebrow="ADVANCED TRAINING"
        title="Four advanced modules for your role"
        description={view.scopeNote}
      />

      <div className="adv-meta-row">
        <span><strong>{view.role}</strong> · onboarding / role development</span>
        <span>{view.modules.length} modules{view.totalMinutes != null ? ` · ~${Math.round(view.totalMinutes / 60 * 10) / 10}h` : ""}</span>
      </div>

      <div className="requirement-grid">
        {view.modules.map((m) => (
          <article className="adv-card" key={m.id}>
            <header>
              <h2>{m.title}</h2>
              <span className={`status-badge ${m.playerAvailable ? "status-complete" : "status-waiting"}`}>
                {m.playerAvailable ? "Available" : "Player review required"}
              </span>
            </header>
            <p className="adv-purpose">{m.purpose}</p>
            <div className="adv-firstline">
              <span>{formatDuration(m.durationMinutes)}</span>
              {m.playerAvailable && m.launchRef ? (
                <MainAppLink className="button button-primary" path={m.launchRef}>
                  Launch module
                  <ArrowRight aria-hidden="true" />
                </MainAppLink>
              ) : (
                <span className="adv-review">Player mapping review required</span>
              )}
            </div>
            <details className="adv-details">
              <summary>Details</summary>
              <dl>
                <div><dt>Module ID</dt><dd>{m.id}</dd></div>
                <div><dt>Prerequisites</dt><dd>{m.prerequisites.length ? m.prerequisites.join(", ") : "None"}</dd></div>
                <div><dt>Pass threshold</dt><dd>{m.passThreshold != null ? `${Math.round(m.passThreshold * 100)}%` : "Not scored"}</dd></div>
                <div>
                  <dt>Policy basis</dt>
                  <dd>
                    {m.policyRefs.length ? (
                      <span className="policy-chip-row">
                        {m.policyRefs.map((r) => <span className="policy-chip" key={r.id} title={r.title ?? undefined}>{r.id}</span>)}
                      </span>
                    ) : "None on file"}
                  </dd>
                </div>
                <div><dt>Scope note</dt><dd>{m.scopeNote}</dd></div>
              </dl>
            </details>
          </article>
        ))}
      </div>

      <p className="no-action-copy adv-context-note">
        <GraduationCap aria-hidden="true" /> The same four modules also appear as a recurring
        assignment on your{" "}
        <Link className="text-link" href={withPersona("/journey/training/annual")}>Annual &amp; Recurring</Link>{" "}
        plan — same canonical module, different assignment context.
      </p>
    </div>
  );
}
