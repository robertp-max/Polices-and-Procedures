import { useParams } from 'react-router-dom';
import { Printer, AlertTriangle } from 'lucide-react';
import { getPolicyContent } from '@/policy/data/policyContentMap';
import { usePolicyStore } from '@/policy/stores/policyStore';
import type { PolicyContentSection } from '@/policy/types';

// ─── MARKDOWN RENDERER (same as PolicyDetailModal/PolicyDetailPage) ──────────
function GfmTable({ text }: { text: string }) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines[0]?.startsWith('|')) return null;
  const parseRow = (line: string) =>
    line.split('|').map(c => c.trim().replace(/\\_/g, '_')).filter((_, i, a) => i > 0 && i < a.length - 1);
  const headers = parseRow(lines[0]);
  const dataLines = lines.slice(2);
  return (
    <table className="w-full text-left border-collapse text-xs mb-5 print-color-exact">
      <thead>
        <tr style={{ backgroundColor: '#D4AF37', color: '#ffffff' }}>
          {headers.map((h, i) => (
            <th key={i} style={{ border: '1px solid #004d47', padding: '6px 10px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {dataLines.map((row, i) => (
          <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#FAFBF8' }}>
            {parseRow(row).map((cell, j) => (
              <td key={j} style={{ border: '1px solid #E5E4E3', padding: '6px 10px', verticalAlign: 'top', lineHeight: '1.4', fontSize: '11px' }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PrintMarkdownBody({ text }: { text: string }) {
  if (!text || text.trim() === '---') return null;
  return (
    <div>
      {text.split(/\n\n+/).map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed || trimmed === '---') return null;
        if (trimmed.startsWith('|') && trimmed.includes('\n')) return <GfmTable key={i} text={trimmed} />;
        if (/^[*\-] /m.test(trimmed)) {
          const items = trimmed.split('\n').map(l => l.replace(/^[*\-]\s+/, '').trim()).filter(Boolean);
          return (
            <ul key={i} style={{ paddingLeft: '20px', marginBottom: '12px' }}>
              {items.map((item, j) => (
                <li key={j} style={{ fontSize: '12px', lineHeight: '1.6', color: '#1F1C1B', marginBottom: '4px' }}>{item}</li>
              ))}
            </ul>
          );
        }
        return <p key={i} style={{ fontSize: '12px', lineHeight: '1.7', color: '#1F1C1B', marginBottom: '8px' }}>{trimmed}</p>;
      })}
    </div>
  );
}

function PrintSectionPanel({ section, isTopLevel }: { section: PolicyContentSection; isTopLevel: boolean }) {
  const cleanTitle = section.title.replace(/\\\./g, '.').replace(/\\/g, '');
  const isEmpty = !section.body || section.body.trim() === '' || section.body.trim() === '---';
  const indent = section.level >= 3 ? '16px' : '0';

  return (
    <div style={{ marginBottom: '20px', paddingLeft: indent, pageBreakInside: 'avoid' }}>
      {section.level > 1 && (
        <h3 style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: section.level === 2 ? 800 : 700,
          fontSize: section.level === 2 ? '13px' : section.level === 3 ? '11px' : '10px',
          color: section.level === 2 ? '#1F1C1B' : '#D4AF37',
          borderBottom: isTopLevel ? '1px solid #E5E4E3' : 'none',
          paddingBottom: isTopLevel ? '6px' : '0',
          marginBottom: '8px',
          marginTop: isTopLevel ? '20px' : '0',
          textTransform: section.level >= 4 ? 'uppercase' : 'none',
          letterSpacing: section.level >= 4 ? '0.05em' : 'normal',
        }}>
          {cleanTitle}
        </h3>
      )}
      {!isEmpty && <PrintMarkdownBody text={section.body} />}
    </div>
  );
}

// ─── PAGE COMPONENT ──────────────────────────────────────────────────────────
export function PrintPage() {
  const params = useParams<{ policyId: string }>();
  const policy = usePolicyStore(state =>
    state.policies.find(item => item.id === params.policyId),
  );

  if (!policy) {
    return (
      <div className="rounded-xl border border-[#D70101]/30 bg-[#D70101]/5 p-6 text-sm text-[#D70101] font-roboto">
        Policy not found.
      </div>
    );
  }

  const isOfficialVersion =
    policy.lifecycleStatus === 'Approved' || policy.lifecycleStatus === 'Published';
  const isDraft = !isOfficialVersion;

  const content = getPolicyContent(policy.id);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Filter out the level-1 title section (order=1, body="---") from the document body
  const printSections = content
    ? content.sections.filter(s => !(s.order === 1 || (s.level === 1 && s.body.trim() === '---')))
    : [];

  return (
    <div className="bg-[#E5E4E3] py-8 print:bg-white print:p-0">
      <style>{`
        @media print {
          @page { size: letter; margin: 0.6in 0.75in; }
          body { background: white !important; }
          .no-print { display: none !important; }
          .avoid-break { page-break-inside: avoid; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print-document { box-shadow: none !important; margin: 0 !important; max-width: none !important; }
        }
      `}</style>

      {/* PRINT ACTION BAR */}
      <div className="no-print mx-auto mb-6 flex max-w-[850px] items-center justify-between px-2">
        <div className="flex items-center gap-3">
          {isDraft && (
            <div className="flex items-center gap-2 rounded-lg border border-[#C74600]/30 bg-[#C74600]/5 px-4 py-2">
              <AlertTriangle size={14} className="text-[#C74600]" />
              <span className="text-xs font-montserrat font-bold text-[#C74600]">
                Draft — Not for official use
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg bg-ci-teal px-5 py-2.5 text-sm font-montserrat font-bold text-white shadow-sm hover:bg-ci-teal-dark transition-colors"
        >
          <Printer size={16} /> Print / Save PDF
        </button>
      </div>

      {/* DOCUMENT CONTAINER */}
      <article className="print-document mx-auto max-w-[850px] bg-white shadow-xl print:max-w-full print:shadow-none">

        {/* COVER BLOCK */}
        <div className="avoid-break" style={{ backgroundColor: '#D4AF37', padding: '40px 48px', color: '#ffffff' }}>
          {isDraft && (
            <div style={{ marginBottom: '16px', display: 'inline-block', backgroundColor: 'rgba(199,70,0,0.9)', padding: '4px 12px', borderRadius: '4px', fontSize: '10px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              DRAFT — NOT FOR OFFICIAL USE
            </div>
          )}
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '26px', fontWeight: 900, lineHeight: '1.25', letterSpacing: '-0.02em', marginBottom: '12px', color: '#ffffff' }}>
            {policy.title}
          </h1>
          <span style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 14px', borderRadius: '999px', fontSize: '12px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, marginBottom: '24px' }}>
            ID: {policy.id}
          </span>
          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: '24px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '12px' }}>
            {[
              ['Domain', policy.domainCode],
              ['Subdomain', policy.subdomainCode],
              ['Owner / Steward', policy.ownerSteward],
              ['Status', policy.lifecycleStatus],
              ['Version', policy.currentVersion],
              ['Tier', policy.tier],
              ['Access', policy.accessTier],
              ['Review Cycle', policy.reviewCycle],
              ['Print Date', today],
            ].map(([label, value]) => (
              <div key={label}>
                <span style={{ display: 'block', fontSize: '9px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.55)', marginBottom: '3px' }}>
                  {label}
                </span>
                <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500, color: '#ffffff' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* POLICY BODY */}
        <div style={{ padding: '40px 48px' }}>
          {content && printSections.length > 0 ? (
            printSections.map(section => (
              <PrintSectionPanel
                key={section.id}
                section={section}
                isTopLevel={section.level === 2}
              />
            ))
          ) : (
            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#524048', fontStyle: 'italic' }}>
              Full policy document content has not yet been provisioned for this policy. Canonical metadata is available in the cover block above.
            </p>
          )}
        </div>

        {/* FOOTER */}
        <footer className="no-print" style={{ borderTop: '1px solid #E5E4E3', padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '10px', color: '#524048' }}>
            {isDraft ? '⚠ DRAFT — Not for official use' : 'For official use only.'}
          </span>
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '10px', color: '#524048' }}>
            Care Indeed Home Health Care, Inc. · Printed: {today}
          </span>
        </footer>

      </article>
    </div>
  );
}

