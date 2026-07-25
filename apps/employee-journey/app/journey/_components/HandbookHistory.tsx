"use client";

import Link from "next/link";
import { ArrowLeft, Archive, Ban, FileClock } from "lucide-react";
import { HANDBOOK_META } from "../_lib/handbook";
import { usePreview } from "./PreviewContext";
import { PageHeader } from "./shared";
import { HandbookDraftBanner } from "./HandbookDraftBanner";

/**
 * Handbook version history + retired-2022 tombstone (handbook plan §1/§5, Phase 1).
 * The retired document is presented as a restricted historical record — not
 * current policy, not distributable, no new acknowledgment.
 */
export function HandbookHistory() {
  const { withPersona } = usePreview();

  return (
    <div className="workspace">
      <PageHeader
        eyebrow="HANDBOOK · HISTORY"
        title="Handbook version history"
        description="The current controlled draft and the retired predecessor are kept as separately auditable records with distinct IDs and hashes."
      />
      <HandbookDraftBanner />

      <div className="hb-reader-crumb">
        <Link className="text-link" href={withPersona("/journey/handbook")}>
          <ArrowLeft aria-hidden="true" /> Handbook home
        </Link>
      </div>

      {/* Current */}
      <article className="hb-history-card is-current">
        <FileClock aria-hidden="true" />
        <div>
          <p className="eyebrow">CURRENT</p>
          <h2>{HANDBOOK_META.documentId} — Employee & Field Workforce Handbook</h2>
          <p>{HANDBOOK_META.statusLabel}. Effective date {HANDBOOK_META.proposedEffectiveDate}.</p>
          <dl className="hb-history-meta">
            <div><dt>Version</dt><dd>{HANDBOOK_META.version}</dd></div>
            <div><dt>Prepared</dt><dd>{HANDBOOK_META.preparedDate}</dd></div>
            <div><dt>Source hash</dt><dd className="hb-hash">{HANDBOOK_META.sourceHtmlSha256.slice(0, 24)}…</dd></div>
          </dl>
        </div>
      </article>

      {/* Retired 2022 tombstone */}
      <article className="hb-history-card is-retired hb-tombstone" role="note" aria-label="Retired historical document">
        <Archive aria-hidden="true" />
        <div>
          <p className="eyebrow">RETIRED · HISTORICAL EVIDENCE</p>
          <h2>{HANDBOOK_META.legacy.name}</h2>
          <div className="hb-tombstone-flags">
            <span><Ban aria-hidden="true" /> Not current policy</span>
            <span><Ban aria-hidden="true" /> Do not distribute</span>
            <span><Ban aria-hidden="true" /> No new acknowledgment permitted</span>
          </div>
          <p>
            Retired on 2026-07-25 and preserved as a historical employment record (legal-hold
            eligible). Superseded by {HANDBOOK_META.documentId} upon approval. Prior signed
            acknowledgments are preserved as evidence and are never carried forward to the 2026
            handbook.
          </p>
          <dl className="hb-history-meta">
            <div><dt>Legacy version</dt><dd>2022</dd></div>
            <div><dt>Status</dt><dd>{HANDBOOK_META.legacy.status}</dd></div>
            <div><dt>Historical source hash</dt><dd className="hb-hash">{HANDBOOK_META.legacy.sha256.slice(0, 24)}…</dd></div>
          </dl>
          <p className="no-action-copy">
            The archived PDF is retained in the controlled historical archive
            (content/handbook/legacy-2022/); it is not distributed to employees and cannot be
            newly acknowledged.
          </p>
        </div>
      </article>
    </div>
  );
}
