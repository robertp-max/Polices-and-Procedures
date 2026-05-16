/**
 * MVP-P1-PRINT-001 (Wave 5A) — Canonical React print frame.
 *
 * Wraps any printable content with:
 *   1. Injected @media print CSS (from buildCanonicalPrintCss)
 *   2. Standard Care Indeed print header (logo + document title + meta strip)
 *   3. The children (printable body)
 *   4. Optional standard footer (page chrome / confidentiality strip)
 *
 * Behind feature flag `print_unified_chrome` (default ON in Wave 5A).
 * When the flag is OFF, PrintFrame is a TRANSPARENT PASSTHROUGH: it renders
 * only `{children}` — no <style>, no header, no footer. This is the instant
 * rollback handle so a misbehaving migrated page can fall back to its
 * previous inline-CSS chrome by flipping one flag.
 *
 * NOT YET ADOPTED in Wave 5A: PrintPage, GVGBPrintDocument, GVGBAppendixPrint
 * (FROZEN — Wave 5b), eCign buildPrintablePacketHtml (PROTECTED — Wave 5b
 * under eCign sign-off).
 */

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { getFlag } from '@/policy/pm/featureFlags';
import type { PrintPageSize, PrintVisibilityIsolation } from './printStyles';
import { buildCanonicalPrintCss } from './printStyles';
import { usePrintTheme } from './usePrintTheme';

export interface PrintFrameMetaRow {
  /** Short label shown in small caps (e.g. "VERSION"). */
  label: string;
  /** Value shown next to the label. */
  value: string;
}

export type PrintFrameAutoPrint =
  | false           // never auto-print
  | true            // always auto-print after mount (~700ms delay)
  | 'queryParam';   // auto-print only when URL has ?autoprint=1 (PrintPage / GVGB style)

export interface PrintFrameProps {
  /** Document title shown in the header strip. */
  documentTitle: string;
  /** Document id shown next to the title (e.g. policy id, form id). */
  documentId?: string;
  /** Version label (e.g. 'v2.1'). */
  documentVersion?: string;
  /** Date string (already formatted by caller). */
  documentDate?: string;
  /** Type tag rendered as a colored chip (e.g. 'POLICY', 'FORM', 'SIGNED PACKET'). */
  documentKind?: string;
  /** Extra meta rows in the header strip. */
  metaRows?: readonly PrintFrameMetaRow[];
  /**
   * Footer config:
   *   - 'standard' (default): renders the standard CI confidentiality footer
   *   - 'none': no footer
   *   - ReactNode: custom footer
   */
  footer?: 'standard' | 'none' | ReactNode;
  /** Page size. Default 'letter'. */
  pageSize?: PrintPageSize;
  /** Orientation. Default 'portrait'. */
  orientation?: 'portrait' | 'landscape';
  /** Page margin in inches. Default 0.5. */
  marginInches?: number;
  /**
   * Selector to scope table avoid-break rules to. Default '.ci-print-scope'
   * (PrintFrame adds this class to its body wrapper automatically).
   */
  contentScopeSelector?: string | null;
  /** Visibility isolation strategy. Default 'none'. */
  visibilityIsolation?: PrintVisibilityIsolation;
  /** Required when visibilityIsolation === 'has-root'. */
  visibilityRootSelector?: string;
  /**
   * Auto-print behavior. Default false.
   *   - true: auto-print on mount after 700ms, UNLESS embedded in iframe
   *     (window.top !== window.self — matches FormPrintView's existing guard).
   *   - 'queryParam': read `?autoprint=1` from URL and auto-print after 250ms
   *     if present.
   */
  autoPrint?: PrintFrameAutoPrint;
  /** Printable content. */
  children: ReactNode;
}

export function PrintFrame(props: PrintFrameProps): React.ReactElement {
  const {
    documentTitle,
    documentId,
    documentVersion,
    documentDate,
    documentKind,
    metaRows = [],
    footer = 'standard',
    pageSize = 'letter',
    orientation = 'portrait',
    marginInches = 0.5,
    contentScopeSelector = '.ci-print-scope',
    visibilityIsolation = 'none',
    visibilityRootSelector,
    autoPrint = false,
    children,
  } = props;

  const theme = usePrintTheme();

  useEffect(() => {
    if (autoPrint === false) return;
    let cancelled = false;
    const isEmbedded = typeof window !== 'undefined' && window.top !== window.self;
    if (autoPrint === true) {
      if (isEmbedded) return; // matches FormPrintView's iframe-suppression guard
      const t = setTimeout(() => {
        if (!cancelled) window.print();
      }, 700);
      return () => {
        cancelled = true;
        clearTimeout(t);
      };
    }
    if (autoPrint === 'queryParam') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('autoprint') === '1') {
        const t = setTimeout(() => {
          if (!cancelled) window.print();
        }, 250);
        return () => {
          cancelled = true;
          clearTimeout(t);
        };
      }
    }
  }, [autoPrint]);

  if (!getFlag('print_unified_chrome')) {
    return <>{children}</>;
  }

  const css = buildCanonicalPrintCss({
    pageSize,
    orientation,
    marginInches,
    brandColor: theme.brandColor,
    contentScopeSelector,
    visibilityIsolation,
    visibilityRootSelector,
  });

  const renderFooter = () => {
    if (footer === 'none') return null;
    if (footer !== 'standard') return footer;
    return (
      <footer className="no-print mt-8 border-t border-[var(--ci-border)] pt-4 text-center text-xs text-[var(--ci-text-muted)] print:block print:mt-0 print:border-t print:pt-2">
        Care Indeed · Confidential
      </footer>
    );
  };

  return (
    <>
      <style>{css}</style>
      <div className="ci-print-scope">
        <header className="ci-print-header border-b border-[var(--ci-border)] pb-4 mb-6 print:pb-2 print:mb-4">
          <div
            className="ci-print-brand-stripe h-[10px] w-full mb-4"
            style={{ backgroundColor: theme.brandColor }}
          />
          <div className="flex items-start gap-4">
            <img
              src={theme.logoDataUrl}
              alt="Care Indeed"
              className="h-10 w-auto object-contain flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-montserrat text-xl font-semibold text-[var(--ci-text-primary)] m-0">
                  {documentTitle}
                </h1>
                {documentKind && (
                  <span className="inline-block px-2.5 py-0.5 text-[10px] font-montserrat font-bold tracking-[0.08em] uppercase rounded bg-[var(--ci-secondary-500)] text-white">
                    {documentKind}
                  </span>
                )}
              </div>
              {(documentId || documentVersion || documentDate) && (
                <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-[var(--ci-text-muted)]">
                  {documentId && (
                    <div className="flex items-center gap-1">
                      <dt className="uppercase tracking-[0.06em] text-[10px] font-semibold">ID</dt>
                      <dd className="font-mono text-[13px]">{documentId}</dd>
                    </div>
                  )}
                  {documentVersion && (
                    <div className="flex items-center gap-1">
                      <dt className="uppercase tracking-[0.06em] text-[10px] font-semibold">VERSION</dt>
                      <dd>{documentVersion}</dd>
                    </div>
                  )}
                  {documentDate && (
                    <div className="flex items-center gap-1">
                      <dt className="uppercase tracking-[0.06em] text-[10px] font-semibold">DATE</dt>
                      <dd>{documentDate}</dd>
                    </div>
                  )}
                </dl>
              )}
              {metaRows.length > 0 && (
                <dl className="mt-2 grid grid-cols-[auto,1fr] gap-x-3 gap-y-0.5 text-sm text-[var(--ci-text-muted)]">
                  {metaRows.map((row, idx) => (
                    <div key={idx} className="contents">
                      <dt className="uppercase tracking-[0.06em] text-[10px] font-semibold self-start pt-px">
                        {row.label}
                      </dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </div>
        </header>

        <main>{children}</main>

        {renderFooter()}
      </div>
    </>
  );
}
