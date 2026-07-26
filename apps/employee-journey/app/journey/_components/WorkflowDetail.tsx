"use client";

import Link from "next/link";
import { ArrowLeft, Info, Workflow } from "lucide-react";
import { getWorkflowById, assignedWorkflowsForPersona } from "../_data/fixtures";
import { usePreview } from "./PreviewContext";
import { PageHeader } from "./shared";

export function WorkflowDetail({ workflowId }: { workflowId: string }) {
  const { persona, withPersona } = usePreview();
  const wf = getWorkflowById(workflowId);

  if (!wf) {
    return (
      <div className="workspace">
        <PageHeader eyebrow="WORKFLOWS" title="Workflow not found" description={`No canonical workflow "${workflowId}" exists in the approved register.`} />
        <Link className="text-link" href={withPersona("/journey/workflows")}>
          <ArrowLeft aria-hidden="true" /> Back to the workflow library
        </Link>
      </div>
    );
  }

  const isAssigned = assignedWorkflowsForPersona(persona).some((w) => w.id === wf.id);

  return (
    <div className="workspace">
      <PageHeader eyebrow={`WORKFLOW · ${wf.domain.toUpperCase()}`} title={`${wf.id} — ${wf.title}`} description={`Domain: ${wf.domain}. ${isAssigned ? "This workflow is in your role's required set." : "Reference only for your role — browse, not assigned."}`} />

      <div className="wf-detail-crumb">
        <Link className="text-link" href={withPersona("/journey/workflows")}>
          <ArrowLeft aria-hidden="true" /> Workflow library
        </Link>
        <span className={`status-badge ${isAssigned ? "status-complete" : "status-waiting"}`}>
          {isAssigned ? "Assigned to your role" : "Reference only"}
        </span>
      </div>

      <div className="wf-detail-card">
        <Workflow aria-hidden="true" />
        <dl className="wf-detail-meta">
          <div><dt>Workflow ID</dt><dd>{wf.id}</dd></div>
          <div><dt>Title</dt><dd>{wf.title}</dd></div>
          <div><dt>Domain</dt><dd>{wf.domain}</dd></div>
        </dl>
      </div>

      <div className="truth-note" role="note">
        <Info aria-hidden="true" />
        <p>
          The canonical control detail for this workflow — trigger, cadence, roles/owners, steps,
          decision points, required policies/forms/evidence, signatures, escalation, and downstream
          workflows — is sourced from the controlled workflow registry and is <strong>not yet wired
          into this employee view</strong>. This page is a reference stub; it does not fabricate
          control metadata. No operational workflow state is changed here.
        </p>
      </div>
    </div>
  );
}
