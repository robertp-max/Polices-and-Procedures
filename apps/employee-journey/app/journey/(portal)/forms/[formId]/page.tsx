import Link from "next/link";
import { SearchX } from "lucide-react";
import { getAppendixForm } from "../../../_generated/appendixForms.generated";
import { APPENDIX_FORM_CROSSWALK } from "../../../_generated/appendixFormCrosswalk.generated";
import { AppendixFormPlayer } from "../../../_components/AppendixFormPlayer";
import { PageHeader } from "../../../_components/shared";

export default async function StandaloneFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const form = getAppendixForm(formId);

  if (!form) {
    return (
      <div className="workspace">
        <PageHeader
          eyebrow="CONTROLLED FORM"
          title="Form not found"
          description={`No baked form record exists for "${formId}" in this journey app. Nothing was invented to fill this gap.`}
        />
        <div className="empty-state appendix-status-empty">
          <SearchX aria-hidden="true" />
          <strong>Unregistered form ID</strong>
          <p>
            status: REVIEW_REQUIRED · employee action: none. This form must be
            added to the journey mapping pipeline before it can render here.
          </p>
        </div>
        <Link className="button button-secondary" href="/journey">
          Back to Home
        </Link>
      </div>
    );
  }

  const appendixEntry = APPENDIX_FORM_CROSSWALK.find((candidate) =>
    candidate.formIds.includes(form.id),
  );

  return (
    <AppendixFormPlayer
      form={form}
      appendixEntry={appendixEntry}
      backHref="/journey"
      backLabel="Back"
    />
  );
}
