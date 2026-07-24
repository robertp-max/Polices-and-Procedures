"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  SearchX,
} from "lucide-react";
import type {
  AppendixClassification,
  AppendixCrosswalkEntry,
} from "../_generated/appendixFormCrosswalk.generated";
import { PageHeader } from "./shared";
import { usePreview } from "./PreviewContext";

const NOTICE_COPY: Record<
  Exclude<AppendixClassification, "EXACT_FORM" | "COMPOSITE_PACKET">,
  { icon: typeof AlertTriangle; heading: string; statusLine: string }
> = {
  FORM_MAPPING_REVIEW_REQUIRED: {
    icon: AlertTriangle,
    heading: "Form mapping under review",
    statusLine: "status: REVIEW_REQUIRED · employee action: none",
  },
  QUIZ_NOT_FORM: {
    icon: ClipboardCheck,
    heading: "This appendix is a scored quiz, not a fillable form",
    statusLine: "status: QUIZ_NOT_FORM · employee action: complete the linked training quiz",
  },
  NO_FORM_REQUIRED: {
    icon: CheckCircle2,
    heading: "No evidence appendix required",
    statusLine: "status: NO_FORM_REQUIRED · employee action: none",
  },
};

export function AppendixStatusNotice({
  entry,
  appendixKey,
}: {
  entry?: AppendixCrosswalkEntry;
  appendixKey: string;
}) {
  const { withPersona } = usePreview();

  if (!entry) {
    return (
      <div className="workspace">
        <Link className="appendix-back-link" href={withPersona("/journey")}>
          <ArrowLeft aria-hidden="true" />
          Back
        </Link>
        <PageHeader
          eyebrow="EVIDENCE APPENDIX"
          title="Appendix not found"
          description={`No evidence appendix "${appendixKey}" is registered in the journey crosswalk. Nothing was fabricated to fill this gap.`}
        />
        <div className="empty-state appendix-status-empty">
          <SearchX aria-hidden="true" />
          <strong>Unregistered appendix key</strong>
          <p>
            status: REVIEW_REQUIRED · employee action: none. Report this
            appendix key to Compliance for crosswalk review.
          </p>
        </div>
      </div>
    );
  }

  const copy = NOTICE_COPY[
    entry.classification as keyof typeof NOTICE_COPY
  ] ?? {
    icon: AlertTriangle,
    heading: "This evidence appendix could not be rendered",
    statusLine: "status: REVIEW_REQUIRED · employee action: none",
  };

  return (
    <div className="workspace">
      <Link className="appendix-back-link" href={withPersona("/journey")}>
        <ArrowLeft aria-hidden="true" />
        Back
      </Link>

      <PageHeader
        eyebrow={`EVIDENCE APPENDIX ${entry.appendixKey}`}
        title={entry.label}
        description={copy.heading}
      />

      <div className={`appendix-status-panel appendix-status-${entry.classification.toLowerCase()}`}>
        <copy.icon aria-hidden="true" />
        <div>
          <p className="appendix-status-line">{copy.statusLine}</p>
          <p>{entry.note}</p>
        </div>
      </div>
    </div>
  );
}
