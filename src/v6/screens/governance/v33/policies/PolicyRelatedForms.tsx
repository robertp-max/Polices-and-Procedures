import { useMemo } from 'react';
import { ExternalLink, FileSignature, FileText, Library, PenLine } from 'lucide-react';
import type { PolicyContentSection } from '../types';
import { getRelatedFormsForPolicy } from './policyFormProjection';
import { splitAppendixIntoReferenceBlocks, tableRows } from './policyTextUtils';

function ReferenceBody({ body }: { body: string }) {
  const rows = tableRows(body);
  if (rows?.length) {
    return (
      <div className="pv3-ref-table-wrap">
        <table>
          <thead><tr>{rows[0].map((cell, i) => <th key={i}>{cell}</th>)}</tr></thead>
          <tbody>{rows.slice(1).map((row, ri) => <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
  }
  const paragraphs = body.split(/\n\s*\n/).map((p) => p.replace(/^###?\s*/, '').trim()).filter(Boolean);
  return <div className="pv3-ref-prose">{paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>;
}

export default function PolicyRelatedForms({ policyId, policyTitle, sections }: {
  policyId: string;
  policyTitle: string;
  sections: readonly PolicyContentSection[];
}) {
  const forms = useMemo(() => getRelatedFormsForPolicy(policyId), [policyId]);

  const referenceBlocks = useMemo(() => {
    const appendixSection = sections.find((s) => /appendi/i.test(s.title));
    if (!appendixSection) return [];
    return splitAppendixIntoReferenceBlocks(appendixSection.body, forms.map((f) => f.record.name));
  }, [sections, forms]);

  return (
    <div className="pv3-related-forms">
      <header className="pv3-related-forms-head">
        <span><Library size={13} /> RELATED FORMS &amp; RECORDS</span>
        <h2>What this policy requires you to file.</h2>
        <p>Sourced directly from the Forms Library entry for {policyId} — {policyTitle}. Nothing here is fabricated; every record links to its real, canonical Forms Library page.</p>
      </header>

      {forms.length === 0 && (
        <p className="pv3-forms-empty">No canonical form is linked to this policy in the current Forms Library.</p>
      )}

      {forms.length > 0 && (
        <ul className="pv3-forms-list">
          {forms.map((form) => (
            <li key={form.record.id} className="pv3-form-card">
              <div className="pv3-form-card-main">
                <span className="pv3-form-id">{form.record.id}</span>
                <strong>{form.record.name}</strong>
                <p className="pv3-form-purpose">{form.content.purpose}</p>
                <p className="pv3-form-reason"><FileText size={12} /> {form.linkReason}</p>
              </div>
              <div className="pv3-form-card-actions">
                <a className="pv3-form-action" href={form.viewRoute}>
                  <ExternalLink size={13} /> Open form
                </a>
                {form.esignRoute && (
                  <a className="pv3-form-action pv3-form-action-esign" href={form.esignRoute}>
                    <FileSignature size={13} /> E-sign
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {referenceBlocks.length > 0 && (
        <section className="pv3-reference-material">
          <header><PenLine size={13} /> <h3>Reference material</h3></header>
          <p className="pv3-reference-note">Substantive content from the controlled policy appendix that is not itself a Forms Library record.</p>
          {referenceBlocks.map((block) => (
            <article key={block.id} className="pv3-reference-block">
              {block.heading && <h4>{block.heading}</h4>}
              <ReferenceBody body={block.body} />
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
