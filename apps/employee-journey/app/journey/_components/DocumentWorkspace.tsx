"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileUp, Info } from "lucide-react";
import {
  getDocuments,
  type DocumentFixture,
} from "../_data/fixtures";
import { PreviewDrawer } from "./PreviewDrawer";
import { usePreview } from "./PreviewContext";
import { PageHeader, RequirementCard } from "./shared";
import { WorkspaceTabs, workspaceTabId, type TabOption } from "./ui";

type DocumentFilter =
  | "All"
  | "Action needed"
  | "Expiring"
  | "Under review"
  | "Current";

const filters: TabOption<DocumentFilter>[] = [
  { id: "All", label: "All" },
  { id: "Action needed", label: "Action needed" },
  { id: "Expiring", label: "Expiring" },
  { id: "Under review", label: "Under review" },
  { id: "Current", label: "Current" },
];

export function DocumentWorkspace() {
  const { persona, announce, withPersona } = usePreview();
  const [active, setActive] = useState<DocumentFilter>("All");
  const [selected, setSelected] = useState<DocumentFixture | null>(null);
  const documents = useMemo(() => getDocuments(persona), [persona]);
  const visible =
    active === "All"
      ? documents
      : documents.filter((document) => document.verificationStatus === active);
  const tabs = filters.map((filter) => ({
    ...filter,
    count:
      filter.id === "All"
        ? documents.length
        : documents.filter(
            (document) => document.verificationStatus === filter.id,
          ).length,
  }));

  return (
    <div className="workspace">
      <PageHeader
        eyebrow="DOCUMENTS"
        title="Documents & credentials"
        description="Every identifier and verification state below is masked synthetic preview data."
        action={
          <button
            className="button button-primary"
            type="button"
            onClick={() => setSelected(documents[0])}
          >
            <FileUp aria-hidden="true" />
            Upload / renew preview
          </button>
        }
      />

      <div className="truth-note" role="note">
        <Info aria-hidden="true" />
        <p>
          Preview formats: PDF, JPG, or PNG. Files are not transmitted or
          stored. Verification status is synthetic preview data.
        </p>
      </div>

      <WorkspaceTabs
        label="Document status filters"
        tabs={tabs}
        active={active}
        onChange={setActive}
        panelId="documents-panel"
      />

      <section
        id="documents-panel"
        className="requirement-grid document-grid"
        role="tabpanel"
        aria-labelledby={workspaceTabId("documents-panel", active)}
        aria-label={`${active} documents`}
      >
        {visible.map((document) => (
          <RequirementCard
            key={document.id}
            title={document.name}
            status={document.verificationStatus}
            className={
              document.verificationStatus === "Not assigned"
                ? "is-unavailable"
                : ""
            }
            fields={[
              { label: "Masked identifier", value: document.maskedIdentifier },
              { label: "Issued date", value: document.issuedDate },
              { label: "Expiration date", value: document.expirationDate },
              { label: "Days remaining", value: document.daysRemaining },
              { label: "Last verified", value: document.lastVerified },
              { label: "Reviewer", value: document.reviewer },
              { label: "Policy basis", value: document.policyBasis },
              { label: "Accepted formats", value: document.acceptedFormats },
              { label: "Applicability", value: document.applicableTo },
            ]}
            footer={
              document.verificationStatus === "Not assigned" ? (
                <p className="no-action-copy">No employee action required.</p>
              ) : document.href ? (
                <Link
                  className="button button-secondary"
                  href={withPersona(document.href)}
                >
                  {document.primaryAction}
                </Link>
              ) : (
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() =>
                    document.primaryAction.includes("renewal") ||
                    document.primaryAction.includes("clearance")
                      ? setSelected(document)
                      : announce(
                          "Preview opened. No official record was changed.",
                        )
                  }
                >
                  {document.primaryAction}
                </button>
              )
            }
          />
        ))}
      </section>

      <PreviewDrawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? "document"}
        acceptedFormats={selected?.acceptedFormats ?? "PDF, JPG, or PNG"}
      />
    </div>
  );
}
