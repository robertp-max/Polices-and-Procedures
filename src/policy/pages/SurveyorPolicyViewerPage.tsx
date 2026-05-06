import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, Printer, X, CheckCircle } from 'lucide-react';
import { getPolicyContent } from '@/policy/data/policyContentMap';
import { usePolicyStore } from '@/policy/stores/policyStore';
import type { PolicyContentSection } from '@/policy/types';

const PRINT_CSS = `
@media print {
  body > * { visibility: hidden !important; }
  #surveyor-print-area, #surveyor-print-area * { visibility: visible !important; }
  #surveyor-print-area { position: fixed; left: 0; top: 0; width: 100%; padding: 24px; }
  .no-print-surveyor { display: none !important; }
}
`;

function renderDownloadText(policyId: string, title: string, sections: PolicyContentSection[]): string {
  const lines: string[] = [];
  lines.push(`${policyId} - ${title}`);
  lines.push('');
  for (const section of sections) {
    const levelPrefix = '#'.repeat(Math.max(section.level, 1));
    lines.push(`${levelPrefix} ${section.title}`);
    lines.push(section.body || '');
    lines.push('');
  }
  return lines.join('\n');
}

function DownloadButton({ policyId, title, sections }: { policyId: string; title: string; sections: PolicyContentSection[] }) {
  const onDownload = () => {
    const content = renderDownloadText(policyId, title, sections);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${policyId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      data-testid="viewer-download-btn"
      onClick={onDownload}
      className="inline-flex items-center gap-2 rounded bg-[#ea580c] px-3 py-2 text-xs font-semibold text-white hover:bg-[#c2410c]"
    >
      <Download size={14} /> Download
    </button>
  );
}

export function SurveyorPolicyViewerPage() {
  const navigate = useNavigate();
  const { policyId } = useParams<{ policyId: string }>();
  const [printFeedback, setPrintFeedback] = useState(false);
  const decodedPolicyId = useMemo(() => decodeURIComponent(policyId ?? ''), [policyId]);
  const policy = usePolicyStore((state) =>
    state.policies.find((item) => item.id === decodedPolicyId || item.id.toUpperCase() === decodedPolicyId.toUpperCase())
  );
  const content = policy ? getPolicyContent(policy.id) : null;
  const sections = content
    ? content.sections.filter((s) => !(s.order === 1 || (s.level === 1 && s.body.trim() === '---')))
    : [];

  const handlePrint = () => {
    setPrintFeedback(true);
    setTimeout(() => {
      window.focus();
      window.print();
      setTimeout(() => setPrintFeedback(false), 2500);
    }, 80);
  };

  if (!policy) {
    return (
      <div className="flex h-full items-center justify-center bg-white px-6">
        <div className="rounded border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#b91c1c]">
          Policy not found — ID: {decodedPolicyId}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-[#f8fafc] px-4 py-4">
      <style>{PRINT_CSS}</style>
      <div className="no-print-surveyor mx-auto mb-3 flex max-w-[920px] items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <X size={14} /> Close
        </button>
        <div className="flex items-center gap-2">
          {printFeedback && (
            <span className="inline-flex items-center gap-1.5 text-xs text-[#0f766e] font-semibold">
              <CheckCircle size={13} /> Print dialog opened
            </span>
          )}
          <button
            type="button"
            data-testid="viewer-print-btn"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded bg-[#0f766e] px-3 py-2 text-xs font-semibold text-white hover:bg-[#115e59]"
          >
            <Printer size={14} /> Print
          </button>
          <DownloadButton policyId={policy.id} title={policy.title} sections={sections} />
        </div>
      </div>

      <article id="surveyor-print-area" className="mx-auto max-w-[920px] rounded border border-[#e2e8f0] bg-white px-10 py-8 shadow-sm print:max-w-none print:border-none print:shadow-none">
        <header className="border-b border-[#e2e8f0] pb-4">
          <div className="text-xs font-mono text-slate-500">{policy.id}</div>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{policy.title}</h1>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600 md:grid-cols-4">
            <div><span className="font-semibold">Domain:</span> {policy.domainCode}</div>
            <div><span className="font-semibold">Subdomain:</span> {policy.subdomainCode}</div>
            <div><span className="font-semibold">Owner:</span> {policy.ownerSteward}</div>
            <div><span className="font-semibold">Status:</span> {policy.lifecycleStatus}</div>
          </div>
        </header>

        <div className="mt-6 space-y-6">
          {sections.length === 0 ? (
            <p className="text-sm text-slate-600">No print-safe policy body is available for this policy.</p>
          ) : (
            sections.map((section) => (
              <section key={section.id}>
                <h2 className="text-base font-semibold text-slate-900">{section.title}</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{section.body || '—'}</p>
              </section>
            ))
          )}
        </div>
      </article>
    </div>
  );
}

export default SurveyorPolicyViewerPage;
