import { ShieldCheck, FileText } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Badge } from '../../primitives';
import { getCorpusPolicy, type CorpusPolicy } from '@/policy/data/policyCorpus';
import { getPolicyContent } from '@/policy/data/policyContentMap';
import type { PolicyContent, PolicyContentSection } from '@/policy/types';

// Deterministic real fallback when the route param is empty. CL-SD-012 is the
// policy this surveyor view originally referenced and is a canonical corpus +
// content record, so the screen always resolves to real data.
const DEFAULT_POLICY_ID = 'CL-SD-012';

// Strip leading numbering escapes ("2\. Purpose" -> "Purpose") and whitespace.
function cleanTitle(text: string): string {
  return text
    .replace(/\\([.\-#|*_])/g, '$1')
    .replace(/^\d+\.\s*/, '')
    .trim();
}

// Collapse a section body to plain prose: drop markdown table rules/rows and
// horizontal rules, join remaining lines. Returns '' when nothing usable.
function bodyToText(body: string): string {
  return body
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !/^[-|:\s]+$/.test(line) && !line.startsWith('|'))
    .join(' ')
    .trim();
}

// Find the first real section whose (cleaned) title matches a keyword.
function findSection(
  sections: readonly PolicyContentSection[],
  keyword: RegExp,
): PolicyContentSection | undefined {
  return sections.find((s) => keyword.test(cleanTitle(s.title)));
}

// Pull a field value out of the "Policy Header" markdown table, e.g.
// "| Effective Date | 2025-07-10 |" -> "2025-07-10". Returns '' if absent.
function headerField(content: PolicyContent | null, field: RegExp): string {
  if (!content) return '';
  for (const section of content.sections) {
    const rows = section.body.replace(/\r\n/g, '\n').split('\n');
    for (const row of rows) {
      const cells = row.split('|').map((c) => c.trim());
      // Expect ['', label, value, ''] for "| label | value |"
      if (cells.length >= 4 && field.test(cells[1])) {
        return cells[2] || '';
      }
    }
  }
  return '';
}

export function SurveyorViewerScreen() {
  const params = useParams<{ policyId?: string }>();
  const policyId = params.policyId?.trim() || DEFAULT_POLICY_ID;

  const corpus: CorpusPolicy | undefined = getCorpusPolicy(policyId);
  const content: PolicyContent | null = getPolicyContent(policyId);
  const sections = content ? [...content.sections].sort((a, b) => a.order - b.order) : [];

  const bodyTitle = corpus ? `${corpus.id} ${corpus.title}` : policyId;

  const purpose = findSection(sections, /purpose/i);
  const procedure = findSection(sections, /procedure/i);
  const verification =
    findSection(sections, /verification|monitoring|audit|compliance/i) ??
    findSection(sections, /policy statement/i);

  const purposeText = purpose ? bodyToText(purpose.body) || '—' : '—';
  const procedureText = procedure ? bodyToText(procedure.body) || '—' : '—';
  const verificationText = verification ? bodyToText(verification.body) || '—' : '—';

  const owner = corpus?.ownerSteward ?? '—';
  const effectiveDate = headerField(content, /effective date/i) || '—';
  const approvalStamp = headerField(content, /approved by/i) || '—';

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
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md">Policy Body Text</h3>
            <div className="rounded-md border border-hairline bg-tone-slate-bg p-lg text-sm text-secondary leading-relaxed max-h-[400px] overflow-y-auto">
              <h4 className="font-medium text-ink mb-sm">{bodyTitle}</h4>
              <p className="mb-md"><strong>Purpose:</strong> {purposeText}</p>
              <p className="mb-md"><strong>Procedure:</strong> {procedureText}</p>
              <p><strong>Verification:</strong> {verificationText}</p>
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-4" aria-label="Survey checklist">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
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

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <FileText aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Policy Metadata
            </h3>
            <div className="text-sm text-secondary grid gap-xs">
              <p><strong>Owner:</strong> {owner}</p>
              <p><strong>Effective Date:</strong> {effectiveDate}</p>
              <p><strong>Approval Stamp:</strong> {approvalStamp}</p>
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}
