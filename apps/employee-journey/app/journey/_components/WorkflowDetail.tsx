"use client";

import Link from "next/link";
import { ArrowLeft, Info, Workflow } from "lucide-react";
import { getWorkflowById, assignedWorkflowsForPersona } from "../_data/fixtures";
import { getWorkflowCatalogItem } from "../_generated/workflowCatalog.generated";
import { usePreview } from "./PreviewContext";
import { PageHeader } from "./shared";

export function WorkflowDetail({ workflowId }: { workflowId: string }) {
  const { persona, withPersona } = usePreview();
  const wf = getWorkflowById(workflowId);
  const detail = getWorkflowCatalogItem(workflowId);

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

      {detail ? (
        <div className="wf-detail-body">
          {detail.processOverview ? (
            <section className="wf-detail-section">
              <h2>Process overview</h2>
              <p>{detail.processOverview}</p>
            </section>
          ) : null}
          {detail.triggers.length ? (
            <section className="wf-detail-section">
              <h2>Triggers</h2>
              <ul>{detail.triggers.map((t) => <li key={t}>{t}</li>)}</ul>
            </section>
          ) : null}
          {detail.primaryRoles.length || detail.approvalRoles.length ? (
            <section className="wf-detail-section">
              <h2>Responsible roles</h2>
              {detail.primaryRoles.length ? <p><strong>Primary:</strong> {detail.primaryRoles.join(", ")}</p> : null}
              {detail.approvalRoles.length ? <p><strong>Approval:</strong> {detail.approvalRoles.join(", ")}</p> : null}
            </section>
          ) : null}
          {detail.policyRefs.length || detail.regulatoryAnchors.length ? (
            <section className="wf-detail-section">
              <h2>Policy & regulatory basis</h2>
              <span className="policy-chip-row">
                {detail.policyRefs.map((p) => <span className="policy-chip" key={p}>{p}</span>)}
                {detail.regulatoryAnchors.map((r) => <span className="policy-chip policy-chip-soft" key={r}>{r}</span>)}
              </span>
            </section>
          ) : null}
          <div className="truth-note" role="note">
            <Info aria-hidden="true" />
            <p>
              Employee-safe reference view, sourced from the canonical workflow registry
              (<code>{detail.sourcePath || "workflows.generated.ts"}</code>). The full step-by-step
              execution table, forms, and signatures live in the controlled workflow record; this
              view changes no operational state.
            </p>
          </div>
        </div>
      ) : (
        <div className="truth-note" role="note">
          <Info aria-hidden="true" />
          <p>Canonical detail for this workflow was not found in the generated catalog.</p>
        </div>
      )}
    </div>
  );
}
