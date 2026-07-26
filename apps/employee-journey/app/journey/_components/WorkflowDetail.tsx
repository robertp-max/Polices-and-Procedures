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
          {detail.cadence ? (
            <section className="wf-detail-section">
              <h2>Cadence / SLA</h2>
              <p>{detail.cadence}{detail.sla ? ` · ${detail.sla}` : ""}</p>
            </section>
          ) : null}
          {detail.steps.length ? (
            <section className="wf-detail-section">
              <h2>Step-by-step execution</h2>
              <div className="wf-steps-wrap">
                <table className="wf-steps">
                  <thead><tr><th>#</th><th>Action</th><th>Role</th><th>Form</th><th>Deadline</th></tr></thead>
                  <tbody>
                    {detail.steps.map((s) => (
                      <tr key={s.order}>
                        <td>{s.order}</td>
                        <td>{s.action}</td>
                        <td>{s.role}</td>
                        <td>{s.formIds.join(", ") || "—"}</td>
                        <td>{s.deadline || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
          {detail.requiredForms.length ? (
            <section className="wf-detail-section">
              <h2>Required forms</h2>
              <span className="policy-chip-row">
                {detail.requiredForms.map((f) => <span className="policy-chip" key={f}>{f}</span>)}
              </span>
            </section>
          ) : null}
          {detail.approvals.length ? (
            <section className="wf-detail-section">
              <h2>Approvals / signatures</h2>
              <ul>{detail.approvals.map((a) => <li key={a}>{a}</li>)}</ul>
            </section>
          ) : null}
          {detail.outputs ? (
            <section className="wf-detail-section"><h2>Outputs</h2><p>{detail.outputs}</p></section>
          ) : null}
          {detail.escalation ? (
            <section className="wf-detail-section"><h2>Escalation</h2><p>{detail.escalation}</p></section>
          ) : null}
          {detail.upstream.length ? (
            <section className="wf-detail-section">
              <h2>Upstream dependencies</h2>
              <ul>{detail.upstream.map((u) => <li key={u.id}><strong>{u.id}</strong> — {u.reason}</li>)}</ul>
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
              Employee-safe reference view, sourced verbatim from the canonical workflow registry
              (<code>{detail.sourcePath || "workflows.generated.ts"}</code>). This view changes no
              operational state; the authoritative record lives in the controlled workflow system.
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
