import { ShieldCheck, FileText } from 'lucide-react';
import { Badge } from '../../primitives';

export function SurveyorViewerScreen() {
  return (
    <section
      className="grid gap-xl"
      data-group="Admin"
      data-hash-id="surveyor-viewer"
      data-route="/surveyor/policy/:policyId"
      data-template="detail"
    >
      <section className="grid gap-xl desktop:grid-cols-12">
        <div className="grid content-start gap-lg desktop:col-span-8">
          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md">Policy Body Text</h3>
            <div className="rounded-md border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg text-sm text-secondary leading-relaxed max-h-[400px] overflow-y-auto">
              <h4 className="font-medium text-ink mb-sm">CL-SD-012 Medication Management Policy</h4>
              <p className="mb-md"><strong>Purpose:</strong> Ensure all patients receive safe medication reconciliation sweeps within 48 hours of intake.</p>
              <p className="mb-md"><strong>Procedure:</strong> Clinicians reconcile all discharge records, enter list reconciliation in EHR, and report exceptions to clinical supervisor immediately.</p>
              <p><strong>Verification:</strong> Completed signatures are audited monthly by quality assurance stewards.</p>
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-4" aria-label="Survey checklist">
          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <ShieldCheck aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Compliance Checklist
            </h3>
            <p className="text-sm text-secondary mb-md">
              Surveyor compliance checkpoints mapped to State regulations.
            </p>
            <div className="grid gap-sm">
              <div className="rounded-md bg-tone-green-bg p-md text-sm text-tone-green-text flex items-center justify-between">
                <span>CMS 42 CFR 484.115</span>
                <Badge variant="count">Passed</Badge>
              </div>
              <div className="rounded-md bg-tone-green-bg p-md text-sm text-tone-green-text flex items-center justify-between">
                <span>ACHC Standard HC-11A</span>
                <Badge variant="count">Passed</Badge>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <FileText aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Policy Metadata
            </h3>
            <div className="text-sm text-secondary grid gap-xs">
              <p><strong>Owner:</strong> Clinical Manager</p>
              <p><strong>Effective Date:</strong> 2026-06-01</p>
              <p><strong>Approval Stamp:</strong> Committee Consensus V6-Approved</p>
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}
