import { useEffect, useRef } from 'react';
import { FileText, Printer, Loader2 } from 'lucide-react';
import type { ReferencePreview } from '../lib/responseTypes';
import { FormRenderer } from './FormRenderer';
import { RightDrawer, UtilityButton } from '@/policy/components/ui';
import { ReferenceLink } from './ReferenceLink';
import { ReferenceText } from './ReferenceText';

/* ═══════════════════════════════════════════════════════════════
   RightPanelPreview — compliance execution workspace.

   Renders a preview of a policy / form / appendix / workflow.
   Sections are collapsible; the top of the panel shows canonical
   metadata (domain, access tier, version, review date).

   Future expansion (stubs only for now):
     - form preview switches to field staging + auto-fill
     - workflow preview renders step cards
     - print/download actions become live PDF export
   ═══════════════════════════════════════════════════════════════ */

export interface RightPanelPreviewProps {
  reference: ReferencePreview | null;
  loading: boolean;
  error: string | null;
  isLight: boolean;
  onClose: () => void;
  onOpenLinked: (id: string) => void;
}

export function RightPanelPreview({
  reference,
  loading,
  error,
  isLight,
  onClose,
  onOpenLinked: _onOpenLinked,
}: RightPanelPreviewProps) {
  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const surface = isLight ? '#FFFFFF' : 'rgba(255,255,255,0.025)';
  const accent = isLight ? '#C74601' : '#FFC107';
  const muted = isLight ? '#747474' : 'rgba(255,255,255,0.45)';
  const text = isLight ? '#1F1C1B' : '#E0E0E0';

  // Scroll to top whenever a new reference loads.
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reference) scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [reference?.id]);

  return (
    <RightDrawer
      inline
      open
      onClose={onClose}
      eyebrow="Brad Workspace"
      title={reference ? `${reference.id} · ${reference.title}` : 'No reference loaded'}
      headerActions={
        <UtilityButton
          ariaLabel={reference?.type === 'form' ? 'Print form' : 'Print (forms only)'}
          onClick={() => window.print()}
          disabled={reference?.type !== 'form'}
        >
          <Printer size={14} strokeWidth={1.75} />
        </UtilityButton>
      }
    >
      <div className="h-full flex flex-col rounded-2xl overflow-hidden ci-glass-panel" style={{ background: surface, border: `1px solid ${border}` }}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
        {loading && <LoaderBlock isLight={isLight} />}
        {error && !loading && (
          <div className="p-5">
            <div
              className="text-sm rounded-xl px-3 py-2"
              style={{
                color: isLight ? '#B91C1C' : '#FCA5A5',
                background: isLight ? '#FEF2F2' : 'rgba(252,165,165,0.06)',
                border: `1px solid ${isLight ? '#FECACA' : 'rgba(252,165,165,0.2)'}`,
              }}
            >
              Could not load reference: {error}
            </div>
          </div>
        )}
        {!loading && !error && !reference && <EmptyState isLight={isLight} />}
        {!loading && !error && reference && (
          <div className="p-4 md:p-5">
            {/* Forms: metadata strip + interactive form renderer */}
            {reference.type === 'form' ? (
              <>
                <Metadata reference={reference} isLight={isLight} />
                <div className="mt-5">
                  <FormRenderer reference={reference} isLight={isLight} />
                </div>
              </>
            ) : (
              /* Policies / appendices / workflows: text rendering */
              <>
                <Metadata reference={reference} isLight={isLight} />
                {reference.sections.map((s, i) => (
                  <section key={s.id} className="mt-5">
                    <h3
                      className="text-[12px] font-bold uppercase tracking-[0.18em] mb-2"
                      style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {s.title}
                    </h3>
                    <div
                      className="text-[13.5px] leading-relaxed whitespace-pre-wrap"
                      style={{ color: text }}
                    >
                      <ReferenceText text={compactBody(s.body)} isLight={isLight} />
                    </div>
                    {i < reference.sections.length - 1 && (
                      <div className="mt-5 h-px" style={{ background: border }} />
                    )}
                  </section>
                ))}
              </>
            )}

            {reference.linkedIds.length > 0 && reference.type !== 'form' && (
              <section className="mt-6 pt-4" style={{ borderTop: `1px solid ${border}` }}>
                <h3
                  className="text-[10px] font-bold uppercase tracking-[0.24em] mb-2"
                  style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Linked from this document
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {reference.linkedIds.map(id => (
                    <ReferenceLink
                      key={id}
                      id={id}
                      isLight={isLight}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors"
                      style={{
                        color: isLight ? '#52404B' : 'rgba(255,255,255,0.75)',
                        background: isLight ? '#F7F6F5' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${border}`,
                        fontFamily: "'JetBrains Mono', monospace",
                        textDecoration: 'none',
                      }}
                    >
                      {id}
                    </ReferenceLink>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
      </div>
    </RightDrawer>
  );
}

function Metadata({ reference, isLight }: { reference: ReferencePreview; isLight: boolean }) {
  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const muted = isLight ? '#747474' : 'rgba(255,255,255,0.45)';
  const text = isLight ? '#1F1C1B' : '#E0E0E0';

  const rows: Array<{ label: string; value: string }> = [
    { label: 'Domain', value: `${reference.domain}${reference.subdomain ? ` · ${reference.subdomain}` : ''}` },
    { label: 'Access Tier', value: reference.accessTier || '—' },
    { label: 'Version', value: reference.version ?? '—' },
    { label: 'Effective', value: reference.effectiveDate ?? '—' },
    { label: 'Next Review', value: reference.nextReviewDate ?? '—' },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-0 rounded-xl overflow-hidden"
      style={{ border: `1px solid ${border}` }}
    >
      {rows.map((row, i) => (
        <div
          key={row.label}
          className="px-3 py-2"
          style={{
            background: i % 2 === 0
              ? (isLight ? '#FFFFFF' : 'rgba(255,255,255,0.02)')
              : (isLight ? '#FAFAFA' : 'rgba(255,255,255,0.035)'),
            borderRight: i % 2 === 0 ? `1px solid ${border}` : 'none',
            borderTop: i >= 2 ? `1px solid ${border}` : 'none',
          }}
        >
          <div
            className="text-[9px] font-bold uppercase tracking-[0.2em] mb-0.5"
            style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}
          >
            {row.label}
          </div>
          <div className="text-[12px]" style={{ color: text }}>{row.value}</div>
        </div>
      ))}
      {reference.regulatoryTags.length > 0 && (
        <div
          className="col-span-2 px-3 py-2"
          style={{
            borderTop: `1px solid ${border}`,
            background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.02)',
          }}
        >
          <div
            className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1"
            style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}
          >
            Regulatory Tags
          </div>
          <div className="flex flex-wrap gap-1">
            {reference.regulatoryTags.map(t => (
              <span
                key={t}
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                style={{
                  color: muted,
                  background: isLight ? '#F7F6F5' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${border}`,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LoaderBlock({ isLight }: { isLight: boolean }) {
  const muted = isLight ? '#747474' : 'rgba(255,255,255,0.45)';
  return (
    <div className="flex items-center justify-center py-10 gap-2" style={{ color: muted }}>
      <Loader2 size={14} className="animate-spin" />
      <span className="text-[11px] uppercase tracking-[0.24em]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Loading reference…
      </span>
    </div>
  );
}

function EmptyState({ isLight }: { isLight: boolean }) {
  const muted = isLight ? '#747474' : 'rgba(255,255,255,0.45)';
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <FileText size={26} strokeWidth={1.25} style={{ color: muted, opacity: 0.6, marginBottom: 12 }} />
      <p className="text-[12.5px] max-w-[32ch]" style={{ color: muted }}>
        Brad is referencing internal policies, forms, and compliance documents. Select a citation or reference to open it here.
      </p>
    </div>
  );
}

 

/** Trim runs of blank lines produced by docx extraction. */
function compactBody(body: string): string {
  return body.replace(/\n{3,}/g, '\n\n').trim();
}
