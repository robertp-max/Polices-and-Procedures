"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, FileText, Info, Lock } from "lucide-react";
import type { AppendixCrosswalkEntry } from "../_generated/appendixFormCrosswalk.generated";
import { getAppendixForm } from "../_generated/appendixForms.generated";
import { PageHeader } from "./shared";
import { usePreview } from "./PreviewContext";

/**
 * Fixed packet-item map for HR-TA-001 Appendix F (Pre-Employment Screening
 * Checklist). Only items with a `formId` correspond to a real baked
 * FormContent record verified against src/policy/data/formsLibraryDataset.ts
 * (see appendixFormCrosswalk.generated.ts). The remaining packet components
 * are real steps in pre-employment screening but have no dedicated fillable
 * form in FORMS_DATASET — they are rendered as safe, non-clickable status
 * rows so nothing is fabricated and no private report content is exposed.
 */
const PACKET_ITEMS: {
  key: string;
  label: string;
  formId?: string;
  note: string;
}[] = [
  {
    key: "background-auth",
    label: "Background check authorization",
    formId: "HR-FM-018",
    note: "Applicant-signed authorization and FCRA disclosures.",
  },
  {
    key: "oig-sam",
    label: "OIG / SAM exclusion screening",
    formId: "HR-FM-005",
    note: "Monthly OIG LEIE / SAM.gov / state exclusion verification log.",
  },
  {
    key: "license",
    label: "License & certification verification",
    formId: "HR-FM-006",
    note: "Primary-source verification of required credentials.",
  },
  {
    key: "reference",
    label: "Reference checks",
    note: "Completed by HR — no fillable employee form in this packet.",
  },
  {
    key: "i9",
    label: "Form I-9 — Employment Eligibility Verification",
    note: "Federal I-9 is completed and retained by HR outside this system.",
  },
  {
    key: "health-tb",
    label: "Health screening / TB clearance",
    note: "Tracked by HR / Compliance — no fillable employee form in this packet.",
  },
  {
    key: "driving",
    label: "Driving record (MVR) check",
    note: "Tracked by HR — no fillable employee form in this packet.",
  },
  {
    key: "offer",
    label: "Offer letter",
    note: "Issued and retained by HR outside this system.",
  },
  {
    key: "jd-ack",
    label: "Job description acknowledgment",
    note: "Captured on the onboarding checklist signature block.",
  },
  {
    key: "checklist",
    label: "New hire onboarding & orientation checklist",
    formId: "HR-FM-007",
    note: "Full orientation checklist and sign-off.",
  },
  {
    key: "hr-signoff",
    label: "HR final sign-off",
    note: "Captured on the onboarding checklist signature block.",
  },
];

export function AppendixPacketNavigator({
  entry,
}: {
  entry: AppendixCrosswalkEntry;
}) {
  const { withPersona } = usePreview();

  return (
    <div className="workspace controlled-packet-page">
      <Link className="appendix-back-link" href={withPersona("/journey")}>
        <ArrowLeft aria-hidden="true" />
        Back
      </Link>

      <PageHeader
        eyebrow={`EVIDENCE APPENDIX ${entry.appendixKey}`}
        title={entry.label}
        description={entry.note}
      />

      <div className="truth-note" role="note">
        <Info aria-hidden="true" />
        <p>
          This packet is a composite of {entry.formIds.length} real controlled
          forms plus the other pre-employment screening steps. No private
          screening reports, background-check results, or health information
          are shown — only the controlled form structure and completion
          status of each packet item.
        </p>
      </div>

      <ul className="packet-navigator-list">
        {PACKET_ITEMS.map((item) => {
          const form = item.formId ? getAppendixForm(item.formId) : undefined;
          return (
            <li
              key={item.key}
              className={`packet-item ${form ? "is-available" : "is-tracked"}`}
            >
              <div className="packet-item-icon" aria-hidden="true">
                {form ? <FileText /> : <Lock />}
              </div>
              <div className="packet-item-body">
                <strong>{item.label}</strong>
                <span>{item.note}</span>
              </div>
              {form ? (
                <Link
                  className="button button-secondary"
                  href={withPersona(`/journey/forms/${form.id}`)}
                >
                  Open form
                  <ArrowRight aria-hidden="true" />
                </Link>
              ) : (
                <span className="status-badge status-no-action-required">
                  HR-managed
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
