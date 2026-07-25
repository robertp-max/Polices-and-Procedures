"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Landmark, ScrollText } from "lucide-react";
import {
  externalAuthorityIndex,
  formHref,
  formReferenceIndex,
  policyHref,
  policyReferenceIndex,
  HANDBOOK_META,
} from "../_lib/handbook";
import { usePreview } from "./PreviewContext";
import { MainAppLink } from "./MainAppLink";
import { PageHeader } from "./shared";
import { HandbookDraftBanner } from "./HandbookDraftBanner";

type Tab = "policies" | "forms" | "authorities";

export function HandbookReferences() {
  const { withPersona } = usePreview();
  const [tab, setTab] = useState<Tab>("policies");
  const policies = policyReferenceIndex();
  const forms = formReferenceIndex();
  const authorities = externalAuthorityIndex();

  return (
    <div className="workspace">
      <PageHeader
        eyebrow="HANDBOOK · REFERENCES"
        title="Policy, form & authority index"
        description={`${policies.length} policies · ${forms.length} forms/records · ${authorities.length} external authorities cited across the handbook.`}
      />
      <HandbookDraftBanner />

      <div className="hb-reader-crumb">
        <Link className="text-link" href={withPersona("/journey/handbook")}>
          <ArrowLeft aria-hidden="true" /> Handbook home
        </Link>
      </div>

      <div className="hb-ref-tabs" role="tablist" aria-label="Reference type">
        <button role="tab" aria-selected={tab === "policies"} onClick={() => setTab("policies")}>
          <ScrollText aria-hidden="true" /> Policies ({policies.length})
        </button>
        <button role="tab" aria-selected={tab === "forms"} onClick={() => setTab("forms")}>
          <FileText aria-hidden="true" /> Forms ({forms.length})
        </button>
        <button role="tab" aria-selected={tab === "authorities"} onClick={() => setTab("authorities")}>
          <Landmark aria-hidden="true" /> Authorities ({authorities.length})
        </button>
      </div>

      <div className="hb-ref-index">
        {(tab === "policies" ? policies : tab === "forms" ? forms : authorities).map((entry) => {
          const href = tab === "policies" ? policyHref(entry.id) : tab === "forms" ? formHref(entry.id) : null;
          const path = tab === "policies" ? `/library/${entry.id}` : `/forms/${entry.id}`;
          return (
            <article className="hb-ref-index-row" key={entry.id}>
              <div className="hb-ref-index-id">
                {href ? (
                  <MainAppLink className="hb-ref-chip" path={path}>{entry.id}</MainAppLink>
                ) : (
                  <span className="hb-ref-chip is-static">{entry.id}</span>
                )}
              </div>
              <div className="hb-ref-index-sections">
                {entry.sections.map((s, i) => (
                  <span key={s.id}>
                    <Link href={withPersona(`/journey/handbook/section/${s.id}`)}>{s.title}</Link>
                    {i < entry.sections.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <p className="no-action-copy hb-ref-footnote">
        Reference counts here reflect the sections actually parsed from the controlled draft; the
        package manifest reports {HANDBOOK_META.policyReferenceCount} policy and{" "}
        {HANDBOOK_META.formReferenceCount} form references in total.
      </p>
    </div>
  );
}
