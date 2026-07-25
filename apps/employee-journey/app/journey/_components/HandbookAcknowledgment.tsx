"use client";

import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { HANDBOOK_META } from "../_lib/handbook";
import { releaseIsBlocked } from "../_data/handbookReleaseChecklist";
import { usePreview } from "./PreviewContext";
import { PageHeader } from "./shared";
import { HandbookDraftBanner } from "./HandbookDraftBanner";

/**
 * Acknowledgment surface — intentionally DISABLED while the handbook is a draft
 * (handbook plan §3/§8). It documents the attestation spec but cannot be
 * completed. A 2022 acknowledgment is never carried forward.
 */
export function HandbookAcknowledgment() {
  const { withPersona } = usePreview();
  const enabled = HANDBOOK_META.acknowledgmentEnabled && !releaseIsBlocked();

  return (
    <div className="workspace">
      <PageHeader
        eyebrow="HANDBOOK · ACKNOWLEDGMENT"
        title="Handbook acknowledgment"
        description="Acknowledgment confirms receipt of a specific approved handbook version — not a waiver of rights."
      />
      <HandbookDraftBanner />

      <div className="hb-reader-crumb">
        <Link className="text-link" href={withPersona("/journey/handbook")}>
          <ArrowLeft aria-hidden="true" /> Handbook home
        </Link>
      </div>

      <section className="hb-ack-locked hb-ack-locked-lg" role="alert">
        <Lock aria-hidden="true" />
        <div>
          <strong>Acknowledgment is not available for a draft</strong>
          <p>
            {HANDBOOK_META.documentId} · {HANDBOOK_META.version} is a counsel-review draft and is not
            effective. The app will not record an acknowledgment until every release gate is closed
            and the approved, version-bound build is published. A 2022 acknowledgment is never carried
            forward to this document.
          </p>
        </div>
      </section>

      <div className="annual-subheading">
        <div>
          <h2>Attestation (preview of the approved-version text)</h2>
          <p>Shown for review only. It cannot be submitted while the handbook is a draft.</p>
        </div>
      </div>

      <div className="hb-ack-spec">
        <ul>
          <li>I acknowledge receipt of the identified handbook version.</li>
          <li>I understand where to ask questions.</li>
          <li>I understand that acknowledgment confirms receipt, not a waiver of rights.</li>
          <li>I understand that separate controlled policies and benefit-plan documents may apply.</li>
        </ul>
        <label className="hb-ack-checkbox">
          <input type="checkbox" disabled aria-disabled="true" />
          <span>I acknowledge the above (disabled until approved).</span>
        </label>
        <button type="button" className="button button-primary" disabled aria-disabled="true">
          Submit acknowledgment
        </button>
        <p className="no-action-copy">
          On the approved version, the record binds: employee, handbook ID, version, effective date,
          content hash, language, dates presented/acknowledged, attestation-text version, and the
          eCign/signature reference. Material revisions require a new assignment.
        </p>
      </div>
    </div>
  );
}
