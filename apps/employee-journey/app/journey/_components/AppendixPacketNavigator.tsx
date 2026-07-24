"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, FileText, Info, Lock } from "lucide-react";
import type { AppendixCrosswalkEntry } from "../_generated/appendixFormCrosswalk.generated";
import { getAppendixForm } from "../_generated/appendixForms.generated";
import { PageHeader, StatusBadge } from "./shared";
import { usePreview } from "./PreviewContext";

/**
 * Employee-safe status values shown for every pre-hire packet item. These are
 * intentionally coarse — status only, never report contents — so the
 * employee-facing view never exposes confidential background-check,
 * exclusion-screening, or health information. Allowed values only:
 */
type PacketStatus =
  | "Cleared"
  | "Under review"
  | "Action required"
  | "Waiting on HR"
  | "Not applicable";

interface PacketItem {
  key: string;
  label: string;
  status: PacketStatus;
  formId?: string;
  note: string;
}

interface PacketGroup {
  key: string;
  title: string;
  items: PacketItem[];
}

/**
 * Fixed packet map for HR-TA-001 Appendix F (Pre-Employment Screening
 * Checklist), grouped so Appendix F reads as a composite pre-hire packet
 * rather than a flat list. Only items with a `formId` correspond to a real
 * baked FormContent record verified against
 * src/policy/data/formsLibraryDataset.ts (see
 * appendixFormCrosswalk.generated.ts) — HR-FM-018, HR-FM-005, HR-FM-006, and
 * HR-FM-007. The remaining packet components are real steps in
 * pre-employment screening but have no dedicated fillable form in
 * FORMS_DATASET; they are rendered as safe, non-clickable, employee-safe
 * status rows so nothing is fabricated and no private report content
 * (background-check results, exclusion hits, health details) is exposed.
 */
const PACKET_GROUPS: PacketGroup[] = [
  {
    key: "screening",
    title: "Background & compliance screening",
    items: [
      {
        key: "background-auth",
        label: "Background check authorization",
        status: "Cleared",
        formId: "HR-FM-018",
        note: "Applicant-signed authorization and FCRA disclosures.",
      },
      {
        key: "oig-sam",
        label: "OIG / SAM exclusion screening",
        status: "Cleared",
        formId: "HR-FM-005",
        note: "Monthly OIG LEIE / SAM.gov / state exclusion verification log.",
      },
      {
        key: "license",
        label: "License & certification verification",
        status: "Cleared",
        formId: "HR-FM-006",
        note: "Primary-source verification of required credentials.",
      },
      {
        key: "reference",
        label: "Reference checks",
        status: "Cleared",
        note: "Completed by HR — no fillable employee form in this packet.",
      },
      {
        key: "driving",
        label: "Driving record (MVR) check",
        status: "Not applicable",
        note: "Tracked by HR for driving-required roles only — no fillable employee form in this packet.",
      },
    ],
  },
  {
    key: "eligibility-health",
    title: "Eligibility & health clearance",
    items: [
      {
        key: "i9",
        label: "Form I-9 — Employment Eligibility Verification",
        status: "Cleared",
        note: "Federal I-9 is completed and retained by HR outside this system.",
      },
      {
        key: "health-tb",
        label: "Health screening / TB clearance",
        status: "Cleared",
        note: "Tracked by HR / Compliance — no fillable employee form in this packet.",
      },
    ],
  },
  {
    key: "offer-onboarding",
    title: "Offer & onboarding sign-off",
    items: [
      {
        key: "offer",
        label: "Offer letter",
        status: "Cleared",
        note: "Issued and retained by HR outside this system.",
      },
      {
        key: "jd-ack",
        label: "Job description acknowledgment",
        status: "Action required",
        note: "Captured on the onboarding checklist signature block.",
      },
      {
        key: "checklist",
        label: "New hire onboarding & orientation checklist",
        status: "Under review",
        formId: "HR-FM-007",
        note: "Full orientation checklist and sign-off.",
      },
      {
        key: "hr-signoff",
        label: "HR final sign-off",
        status: "Waiting on HR",
        note: "Captured on the onboarding checklist signature block.",
      },
    ],
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
          This packet is a composite view of every pre-hire screening step —
          {" "}
          {entry.formIds.length} of them backed by a real controlled form you
          can open below. Each row shows an employee-safe status only; no
          private screening reports, background-check results, exclusion
          hits, or health information are ever shown here.
        </p>
      </div>

      {PACKET_GROUPS.map((group) => (
        <section
          key={group.key}
          className="packet-group"
          aria-labelledby={`packet-group-${group.key}`}
        >
          <h2 id={`packet-group-${group.key}`} className="packet-group-title">
            {group.title}
          </h2>
          <ul className="packet-navigator-list">
            {group.items.map((item) => {
              const form = item.formId
                ? getAppendixForm(item.formId)
                : undefined;
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
                  <StatusBadge status={item.status} />
                  {form ? (
                    <Link
                      className="button button-secondary"
                      href={withPersona(`/journey/forms/${form.id}`)}
                    >
                      Open form
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
