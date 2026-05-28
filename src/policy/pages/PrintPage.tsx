import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Printer, AlertTriangle } from 'lucide-react';
import { getPolicyContent } from '@/policy/data/policyContentMap';
import { usePolicyStore } from '@/policy/stores/policyStore';
import { loadFrameworkSeed } from '@/policy/adapters/frameworkSeedAdapter';
import type { PolicyContentSection } from '@/policy/types';
import { achcSurveyByPolicyId } from '@/policy/data/achcSurveyProjection.generated';
import { formatAnchorRefsForDisplay, getSupportRefsForPolicy } from '@/policy/data/achcSupportAnchors';
import ciLogoGray from '@/assets/ci-logo-gray.png';

// Pre-load seed data for domain / subdomain name lookups and version metadata
const { domains, subdomains, policyVersions } = loadFrameworkSeed();

function domainName(code: string): string {
  const d = domains.find(x => x.code === code);
  return d ? `${d.code} — ${d.name}` : code;
}

function subdomainName(code: string): string {
  const s = subdomains.find(x => x.code === code);
  return s ? `${s.code} — ${s.name}` : code;
}

// ─── PRINT META CELL ─────────────────────────────────────────────────────────
function PrintMeta({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <span style={{
        display: 'block',
        fontSize: '9px',
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.12em',
        color: '#524048',
        marginBottom: '3px',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'Roboto, sans-serif',
        fontSize: '11px',
        fontWeight: 500,
        color: '#1F1C1B',
      }}>
        {value ?? '—'}
      </span>
    </div>
  );
}

// ─── MARKDOWN RENDERER ───────────────────────────────────────────────────────
function GfmTable({ text }: { text: string }) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines[0]?.startsWith('|')) return null;
  const parseRow = (line: string) =>
    line.split('|').map(c => c.trim().replace(/\\_/g, '_')).filter((_, i, a) => i > 0 && i < a.length - 1);
  const headers = parseRow(lines[0]);
  const dataLines = lines.slice(2);
  return (
    <table className="w-full text-left border-collapse text-xs mb-5">
      <thead>
        <tr style={{ backgroundColor: '#007970', color: '#ffffff' }}>
          {headers.map((h, i) => (
            <th key={i} style={{ border: '1px solid #00594f', padding: '6px 10px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {dataLines.map((row, i) => (
          <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fffe' }}>
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
        if (/^[*-] /m.test(trimmed)) {
          const items = trimmed.split('\n').map(l => l.replace(/^[*-]\s+/, '').trim()).filter(Boolean);
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
          color: section.level === 2 ? '#1F1C1B' : '#524048',
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
  const paramId = params.policyId ?? '';
  const policy = usePolicyStore(state =>
    state.policies.find(
      item =>
        item.id === paramId ||
        item.id.toLowerCase() === paramId.toLowerCase(),
    ),
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autoprint') === '1') {
      window.setTimeout(() => window.print(), 250);
    }
  }, []);

  useEffect(() => {
    if (!policy) return;
    const prev = document.title;
    document.title = `${policy.id} - ${policy.title}`;
    return () => { document.title = prev; };
  }, [policy?.id, policy?.title]);

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

  // Version metadata (effectiveDate, approvedBy, nextReviewDate)
  const seedVersion = policyVersions.find(v => v.policyId === policy.id && v.version === policy.currentVersion)
    ?? policyVersions.find(v => v.policyId === policy.id);
  const effectiveDateRaw = seedVersion?.effectiveDate ?? null;
  const approvedByRaw = seedVersion?.approvedBy ?? null;

  // Compute next review from effectiveDate + reviewCycle
  function addYears(iso: string | null, years: number): string | null {
    if (!iso) return null;
    const d = new Date(iso);
    d.setFullYear(d.getFullYear() + years);
    return d.toISOString().slice(0, 10);
  }
  const reviewYears = policy.reviewCycle.includes('2') ? 2 : 1;
  const nextReviewDate = addYears(effectiveDateRaw, reviewYears);

  const content = getPolicyContent(policy.id);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const achcMeta = achcSurveyByPolicyId[policy.id] ?? null;
  const supportRefs = achcMeta ? getSupportRefsForPolicy(policy.id) : [];
  const supportRefLabel = supportRefs.length ? formatAnchorRefsForDisplay(supportRefs) : 'ANCHOR_REVIEW_REQUIRED';

  const printSections = content
    ? content.sections.filter(s => !(s.order === 1 || (s.level === 1 && s.body.trim() === '---')))
    : [];

  return (
    <div className="policy-print-page bg-[#E5E4E3] py-8 print:bg-white print:p-0">
      <style>{`
        @page { size: letter; margin: 0.5in; }
        @media print {
          body:has(.policy-print-page) * {
            visibility: hidden !important;
          }
          body:has(.policy-print-page) .policy-print-page,
          body:has(.policy-print-page) .policy-print-page * {
            visibility: visible !important;
          }
          body:has(.policy-print-page) .policy-print-page {
            position: static !important;
            inset: auto !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          body { background: white !important; }
          .no-print { display: none !important; }
          .avoid-break { page-break-inside: avoid; }
          .page-break { page-break-before: always; break-before: page; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print-document {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: none !important;
            width: 100% !important;
          }
          table {
            table-layout: fixed !important;
            width: 100% !important;
            max-width: 100% !important;
            border-collapse: collapse !important;
          }
          table th, table td {
            word-break: break-word !important;
            overflow-wrap: anywhere !important;
            white-space: normal !important;
          }
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
      <article className="print-document mx-auto max-w-[850px] bg-white shadow-xl print:max-w-full print:shadow-none px-12 py-16 text-[#1F1C1B]">

        {/* COVER BLOCK — matches PolicyPrintDocument / Documents PDF brand */}
        <div className="avoid-break" style={{ borderBottom: '2px solid #007970', paddingBottom: '32px', marginBottom: '40px' }}>

          {/* Logo + document type */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
            <img
              src={ciLogoGray}
              alt="Care Indeed — The Heart of Home Health"
              style={{ height: '40px', width: 'auto' }}
            />
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '0.18em', color: '#524048', marginBottom: '4px' }}>
                Corporate Policy Document
              </p>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '11px', color: '#524048' }}>
                Care Indeed Home Health Care, Inc.
              </p>
            </div>
          </div>

          {isDraft && (
            <div style={{ marginBottom: '12px', display: 'inline-block', backgroundColor: '#C74600', padding: '4px 12px', borderRadius: '4px', fontSize: '10px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#ffffff' }}>
              DRAFT — NOT FOR OFFICIAL USE
            </div>
          )}

          {/* Policy ID / status / tier badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' as const }}>
            <span style={{ color: '#007970', border: '1px solid rgba(0,121,112,0.3)', backgroundColor: '#E5FEFF', padding: '2px 10px', borderRadius: '999px', fontSize: '10px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>
              {policy.id}
            </span>
            <span style={{ color: '#ffffff', backgroundColor: '#007970', padding: '2px 10px', borderRadius: '999px', fontSize: '10px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>
              {policy.lifecycleStatus.replace('_', ' ')}
            </span>
            <span style={{ color: '#524048', border: '1px solid #E5E4E3', backgroundColor: '#ffffff', padding: '2px 10px', borderRadius: '999px', fontSize: '10px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>
              {policy.tier}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300, fontSize: '32px', lineHeight: '1.2', color: '#1F1C1B', marginBottom: '24px', letterSpacing: '-0.02em' }}>
            {policy.title}
          </h1>

          {/* Metadata grid */}
          <div style={{ borderTop: '1px solid #E5E4E3', paddingTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px 32px' }}>
            <PrintMeta label="Version" value={`v${policy.currentVersion}`} />
            <PrintMeta label="Effective" value={effectiveDateRaw} />
            <PrintMeta label="Last Reviewed" value={effectiveDateRaw} />
            <PrintMeta label="Next Review" value={nextReviewDate} />
            <PrintMeta label="Policy Owner" value={policy.ownerSteward} />
            <PrintMeta label="Subdomain" value={subdomainName(policy.subdomainCode)} />
            <div style={{ gridColumn: 'span 2' }}>
              <PrintMeta label="Domain" value={domainName(policy.domainCode)} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <PrintMeta label="Approved By" value={approvedByRaw ?? (policy.tier === 'REQUIRED' ? 'Governing Body Chair' : policy.ownerSteward)} />
            </div>
          </div>

          {/* ACHC Tags (if mapped) */}
          {achcMeta && (
            <div style={{ marginTop: '20px', borderTop: '1px solid #E5E4E3', paddingTop: '16px' }}>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '9.5px', textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: '#524048', marginBottom: '8px' }}>
                ACHC Tags
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px' }}>
                <span style={{ color: '#007970', border: '1px solid rgba(0,121,112,0.4)', backgroundColor: '#E5FEFF', padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>
                  {achcMeta.mappingType}
                </span>
                {achcMeta.achcStandards.slice(0, 8).map((standard) => (
                  <span key={standard} style={{ color: '#ea580c', border: '1px solid rgba(234,88,12,0.35)', backgroundColor: 'rgba(234,88,12,0.1)', padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
                    {standard}
                  </span>
                ))}
                <span style={{ color: '#0f766e', border: '1px solid rgba(15,118,110,0.35)', backgroundColor: 'rgba(15,118,110,0.1)', padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
                  {supportRefLabel}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* POLICY BODY — starts on page 2 */}
        <div className="page-break" />
        <div style={{ fontSize: '12px', lineHeight: '1.7', color: '#1F1C1B' }}>
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

        {/* FOOTER (screen only) */}
        <footer className="no-print" style={{ borderTop: '1px solid #E5E4E3', marginTop: '40px', padding: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
