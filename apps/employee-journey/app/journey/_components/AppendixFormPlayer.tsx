"use client";

import Link from "next/link";
import { ArrowLeft, FlaskConical, ShieldCheck, UserCheck } from "lucide-react";
import type { FormContent } from "../_generated/sharedTypes.generated";
import { getGeneratedPolicy } from "../_generated/policyCatalog.generated";
import type { AppendixCrosswalkEntry } from "../_generated/appendixFormCrosswalk.generated";
import { ControlledFormRenderer } from "./ControlledFormRenderer";
import { usePreview } from "./PreviewContext";

const EMPLOYEE_SIGNER_PATTERN = /employee|new hire|applicant/i;

function PolicyChip({ policyId, withPersona }: { policyId: string; withPersona: (href: string) => string }) {
  const policy = getGeneratedPolicy(policyId);
  return (
    <Link href={withPersona("/journey/policies")} className="policy-chip">
      <span className="policy-chip-id">{policyId}</span>
      <span className="policy-chip-title">
        {policy?.title ?? "Policy on file"}
      </span>
    </Link>
  );
}

export function AppendixFormPlayer({
  form,
  appendixEntry,
  backHref = "/journey",
  backLabel = "Back",
}: {
  form: FormContent;
  appendixEntry?: AppendixCrosswalkEntry;
  backHref?: string;
  backLabel?: string;
}) {
  const { withPersona, announce } = usePreview();

  const isEmployeeFacing = (form.signatures ?? []).some((signature) =>
    EMPLOYEE_SIGNER_PATTERN.test(signature.role),
  );

  return (
    <div className="workspace controlled-form-page">
      <Link className="appendix-back-link" href={withPersona(backHref)}>
        <ArrowLeft aria-hidden="true" />
        {backLabel}
      </Link>

      {appendixEntry ? (
        <p className="appendix-context-note">
          <ShieldCheck aria-hidden="true" />
          Evidence appendix <strong>{appendixEntry.appendixKey}</strong> ·{" "}
          {appendixEntry.label}
        </p>
      ) : null}

      <div className="truth-note" role="note">
        <FlaskConical aria-hidden="true" />
        <p>
          This is a read-only structural preview of the controlled form. No
          data entered here is submitted, saved, or transmitted.
        </p>
      </div>

      <article className="controlled-doc" data-orientation={form.orientation}>
        <div className="controlled-doc-rule" aria-hidden="true" />

        <header className="controlled-doc-head">
          <div className="controlled-doc-identity">
            <p className="canonical-id">{form.id}</p>
            <h1>{form.title}</h1>
            <div className="controlled-doc-badges">
              <span className="doc-badge doc-badge-type">{form.type}</span>
              <span className="doc-badge doc-badge-domain">{form.domainCode}</span>
              <span className="doc-badge doc-badge-orientation">
                {form.orientation}
              </span>
            </div>
          </div>
          <dl className="controlled-doc-meta">
            <div>
              <dt>Version</dt>
              <dd>{form.version}</dd>
            </div>
            <div>
              <dt>Effective date</dt>
              <dd>{form.effectiveDate}</dd>
            </div>
            <div>
              <dt>Last revised</dt>
              <dd>{form.revisionDate}</dd>
            </div>
          </dl>
        </header>

        <div className="controlled-doc-intro">
          <p className="controlled-doc-purpose">{form.purpose}</p>
          <p className="controlled-doc-instructions">
            <strong>Completion instructions:</strong> {form.instructions}
          </p>
        </div>

        {form.policies.length ? (
          <div className="controlled-doc-policies">
            <span>Linked policies</span>
            <div className="controlled-doc-policy-list">
              {form.policies.map((policyId) => (
                <PolicyChip key={policyId} policyId={policyId} withPersona={withPersona} />
              ))}
            </div>
          </div>
        ) : null}

        <div
          className={`employee-action-banner ${
            isEmployeeFacing ? "is-employee" : "is-hr-managed"
          }`}
        >
          <UserCheck aria-hidden="true" />
          <p>
            {isEmployeeFacing
              ? "Employee action: you review, complete, and sign this record as part of your onboarding or competency file. This preview is read-only."
              : "No employee action required. This record is completed and maintained by HR / Compliance and is shown here for transparency into your file."}
          </p>
        </div>

        <ControlledFormRenderer form={form} />

        {form.signatures?.length ? (
          <div className="controlled-doc-signer-roles">
            <h3>Signer roles on this record</h3>
            <ul>
              {form.signatures.map((signature) => (
                <li key={signature.role}>
                  <strong>{signature.role}</strong>
                  <span>
                    {[
                      signature.includeName ? "printed name" : null,
                      signature.includeTitle ? "title" : null,
                      signature.includeDate ? "date" : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {form.footerNotes?.length ? (
          <footer className="controlled-doc-footer">
            {form.footerNotes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </footer>
        ) : null}
      </article>

      <div className="card-actions controlled-doc-actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={() =>
            announce(
              "Preview reviewed. No official acknowledgment or submission was recorded.",
            )
          }
        >
          Mark reviewed (preview only)
        </button>
      </div>
    </div>
  );
}
