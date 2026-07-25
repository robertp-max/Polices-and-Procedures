"use client";

import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import {
  HANDBOOK_APPROVAL_BLOCK,
  HANDBOOK_RELEASE_GATES,
  gateCounts,
  releaseIsBlocked,
} from "../_data/handbookReleaseChecklist";
import { usePreview } from "./PreviewContext";
import { PageHeader } from "./shared";
import { HandbookDraftBanner } from "./HandbookDraftBanner";

export function HandbookReleaseStatus() {
  const { withPersona } = usePreview();
  const counts = gateCounts();
  const blocked = releaseIsBlocked();

  return (
    <div className="workspace">
      <PageHeader
        eyebrow="HANDBOOK · RELEASE"
        title="Release checklist & approval gates"
        description="Reviewer view. The handbook cannot become effective or enable acknowledgment while any required gate is OPEN, IN_REVIEW, or BLOCKED, or while any approval is unsigned."
      />
      <HandbookDraftBanner />

      <div className="hb-reader-crumb">
        <Link className="text-link" href={withPersona("/journey/handbook")}>
          <ArrowLeft aria-hidden="true" /> Handbook home
        </Link>
      </div>

      <div className={`hb-release-banner ${blocked ? "is-blocked" : "is-clear"}`} role="status">
        <ShieldAlert aria-hidden="true" />
        <div>
          <strong>{blocked ? "BLOCKED — not releasable" : "All gates closed"}</strong>
          <p>
            {counts.APPROVED} approved · {counts.IN_REVIEW} in review · {counts.OPEN} open ·{" "}
            {counts.BLOCKED} blocked · {counts.NOT_APPLICABLE} n/a of {HANDBOOK_RELEASE_GATES.length} gates.
            Approvals signed: {HANDBOOK_APPROVAL_BLOCK.filter((a) => a.status === "APPROVED").length} of{" "}
            {HANDBOOK_APPROVAL_BLOCK.length}.
          </p>
        </div>
      </div>

      <div className="hb-gate-list">
        {HANDBOOK_RELEASE_GATES.map((g) => (
          <article className="hb-gate-row" key={g.n}>
            <span className="hb-gate-n">{g.n}</span>
            <div className="hb-gate-body">
              <strong>{g.category}</strong>
              <p>{g.requirement}</p>
              <span className="hb-gate-owner">Owner: {g.owner}</span>
            </div>
            <span className={`hb-gate-status status-${g.status.toLowerCase()}`}>{g.status.replace(/_/g, " ")}</span>
          </article>
        ))}
      </div>

      <div className="annual-subheading">
        <ShieldAlert aria-hidden="true" />
        <div>
          <h2>Required approval block</h2>
          <p>Named approvals that must all be signed before the approved version can be published.</p>
        </div>
      </div>
      <div className="hb-approval-grid">
        {HANDBOOK_APPROVAL_BLOCK.map((a) => (
          <div className="hb-approval-slot" key={a.role}>
            <strong>{a.role}</strong>
            <span className={`hb-gate-status status-${a.status.toLowerCase()}`}>{a.status.replace(/_/g, " ")}</span>
            <span className="no-action-copy">{a.approver ?? "Unsigned"}{a.date ? ` · ${a.date}` : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
