import { CheckCircle2, FileText, Info, Link2, ListChecks } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { ToneBadge } from '../../primitives';
import { ToneTag } from '../../components';
import { cx } from '../../utils/classNames';
import { getPolicyContent } from '@/policy/data/policyContentMap';
import { getCorpusPolicy, DOMAIN_LABEL, type CorpusPolicy } from '@/policy/data/policyCorpus';
import type { PolicyContent, PolicyContentSection } from '@/policy/types';
import { openPolicyPrintRoute } from '@/policy/utils/openPolicyPrintRoute';

const routeMarker = {
  group: 'Taxonomy',
  hashId: 'policy-detail',
  path: '/library/:policyId',
  template: 'detail',
} as const;

// Deterministic real fallback when the route param is empty. GV-GB-001 is a
// canonical corpus + content record, so the screen always resolves real data.
const DEFAULT_POLICY_ID = 'GV-GB-001';

// ─── Dependency-free markdown rendering ──────────────────────────────────
// The policy `body` fields are MARKDOWN: paragraphs, `#`/`##`/`###` headings,
// GitHub-style pipe tables, bullet lists, and `---` rules. We render the
// supported constructs structurally and fall back to preserved-whitespace
// text for anything else — never dropping source content. No markdown library.

type MdBlock =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'table'; header: string[]; rows: string[][] }
  | { kind: 'list'; items: string[] }
  | { kind: 'rule' }
  | { kind: 'paragraph'; text: string };

/** A markdown table row is a line that starts and ends with a pipe. */
function isTableRow(line: string): boolean {
  const t = line.trim();
  return t.startsWith('|') && t.endsWith('|') && t.length > 1;
}

/** A separator row such as `| :---- | :---- |` (only dashes/colons/pipes). */
function isTableSeparator(line: string): boolean {
  return isTableRow(line) && /^\|?[\s:|-]+\|?$/.test(line.trim()) && line.includes('-');
}

function splitTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map((cell) => cell.trim());
}

/** Strip leading numbering escapes (`1\.` → `1.`) and surrounding whitespace. */
function cleanInline(text: string): string {
  return text.replace(/\\([.\-#|*_])/g, '$1').trim();
}

function parseMarkdown(body: string): MdBlock[] {
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const blocks: MdBlock[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: 'paragraph', text: cleanInline(paragraph.join(' ')) });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (listItems.length) {
      blocks.push({ kind: 'list', items: listItems.map(cleanInline) });
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const line = raw.trim();

    if (line === '') {
      flushParagraph();
      flushList();
      continue;
    }

    // Horizontal rule
    if (/^-{3,}$/.test(line) || /^\*{3,}$/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push({ kind: 'rule' });
      continue;
    }

    // Heading
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({ kind: 'heading', level: headingMatch[1].length, text: cleanInline(headingMatch[2]) });
      continue;
    }

    // Table — needs a header row followed by a separator row
    if (isTableRow(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      flushParagraph();
      flushList();
      const header = splitTableRow(line).map(cleanInline);
      const rows: string[][] = [];
      i += 2; // skip header + separator
      while (i < lines.length && isTableRow(lines[i]) && !isTableSeparator(lines[i])) {
        rows.push(splitTableRow(lines[i]).map(cleanInline));
        i += 1;
      }
      i -= 1; // step back; loop will increment
      blocks.push({ kind: 'table', header, rows });
      continue;
    }

    // Bullet list
    const bulletMatch = /^[-*•]\s+(.*)$/.exec(line);
    if (bulletMatch) {
      flushParagraph();
      listItems.push(bulletMatch[1]);
      continue;
    }

    // Default: accumulate paragraph text (single newlines treated as breaks)
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

function MarkdownBody({ body }: { body: string }) {
  const blocks = parseMarkdown(body);
  if (!blocks.length) return null;

  return (
    <div className="grid gap-md">
      {blocks.map((block, index) => {
        const key = `${block.kind}-${index}`;
        switch (block.kind) {
          case 'heading': {
            const cls =
              block.level <= 2
                ? 'text-h3 font-medium text-ink'
                : 'text-sm font-medium uppercase tracking-tag text-secondary';
            return (
              <p className={cls} key={key}>
                {block.text}
              </p>
            );
          }
          case 'rule':
            return <hr className="border-0 border-t border-hairline" key={key} />;
          case 'list':
            return (
              <ul className="grid gap-sm" key={key}>
                {block.items.map((item, itemIndex) => (
                  <li className="flex gap-sm text-body text-secondary" key={`${key}-${itemIndex}`}>
                    <CheckCircle2 aria-hidden="true" className="mt-xs h-icon-xs w-icon-xs shrink-0 text-brand-teal" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          case 'table':
            return (
              <div className="overflow-x-auto rounded-md border border-card" key={key}>
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-surface-glass backdrop-blur-md shadow-glass-inset">
                      {block.header.map((cell, cellIndex) => (
                        <th
                          className="border-b border-hairline px-md py-sm text-left text-tag uppercase tracking-tag text-muted"
                          key={`${key}-h-${cellIndex}`}
                          scope="col"
                        >
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr className="align-top" key={`${key}-r-${rowIndex}`}>
                        {row.map((cell, cellIndex) => (
                          <td
                            className="border-b border-hairline px-md py-sm text-secondary"
                            key={`${key}-r-${rowIndex}-c-${cellIndex}`}
                          >
                            {cell || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'paragraph':
          default:
            return (
              <p className="whitespace-pre-line text-body text-secondary" key={key}>
                {block.text}
              </p>
            );
        }
      })}
    </div>
  );
}

// ─── Section navigation ──────────────────────────────────────────────────
function buildAnchor(section: PolicyContentSection): string {
  return `section-${section.id}`;
}

// ─── Source-unavailable panel ──────────────────────────────────────────────
// The corpus + content sources do not carry per-policy linked forms, lifecycle
// progress, evidence ledgers, or readiness scores. Rather than fabricate them,
// we keep a tasteful shell that states the data is not in the policy content
// source. (Header metadata such as status/version lives inside the rendered
// "Policy Header" section as real content.)
function SourceUnavailable({
  title,
  description,
  icon: Icon = Info,
}: {
  title: string;
  description: string;
  icon?: typeof Info;
}) {
  return (
    <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg overflow-hidden shadow-rest" aria-label={title}>
      <div className="mb-md flex items-center gap-sm">
        <span className="grid h-tap w-tap place-items-center rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset text-muted">
          <Icon aria-hidden="true" className="h-icon-sm w-icon-sm" />
        </span>
        <h2 className="text-h2 font-medium text-ink">{title}</h2>
      </div>
      <div className="rounded-md border border-dashed border-card bg-surface-glass backdrop-blur-md shadow-glass-inset/60 p-lg">
        <ToneTag tone="slate">Not in policy content source</ToneTag>
        <p className="mt-sm text-sm text-secondary">{description}</p>
      </div>
    </section>
  );
}

export function PolicyDetailScreen() {
  const params = useParams<{ policyId?: string }>();
  const policyId = params.policyId?.trim() || DEFAULT_POLICY_ID;
  const location = useLocation();
  const [searchParams] = useSearchParams();
  // Reference / print view only — never pulls CES execution state, stores, or V3 seeds.
  // Matches V1 detail semantics: corpus metadata + rendered content sections + regulatory refs from source.
  const isPrintRoute = typeof window !== 'undefined' && (
    window.location.pathname.endsWith('/print') ||
    window.location.pathname.startsWith('/print/') ||
    searchParams.get('print') === '1'
  );

  const corpus: CorpusPolicy | undefined = getCorpusPolicy(policyId);
  const content: PolicyContent | null = getPolicyContent(policyId);

  const headerId = corpus?.id ?? policyId;
  const headerTitle = corpus?.title ?? content?.sections[0]?.title ?? policyId;
  const domainLabel = corpus ? DOMAIN_LABEL[corpus.domainCode] ?? corpus.domainCode : null;

  const headerFields: readonly (readonly [string, string])[] = [
    ['Policy ID', headerId],
    ['Domain', domainLabel ?? '—'],
    ['Tier', corpus?.tier ?? '—'],
    ['Steward (corpus metadata)', corpus?.ownerSteward ?? '—'],
  ];

  const sections = content ? [...content.sections].sort((a, b) => a.order - b.order) : [];
  const backState = location.state as { policyBackLabel?: string; policyBackTo?: string } | null;
  const backTo = backState?.policyBackTo || '/library';
  const backLabel = backState?.policyBackLabel || 'Policies';

  // Auto-name the saved PDF "{policy name} {YYYY-MM-DD}" (document.title is the
  // browser's default Save-as filename) and auto-trigger print on dedicated
  // print routes. Restores the prior title on cleanup.
  useEffect(() => {
    if (!isPrintRoute || typeof window === 'undefined') return undefined;
    // Force the NOON (default) theme so morning/afternoon/night palettes never
    // bleed into a printed policy.
    const el = document.documentElement;
    const prevTod = el.getAttribute('data-tod');
    el.setAttribute('data-tod', 'noon');
    const printDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, locale-stable
    const previousTitle = document.title;
    document.title = `${cleanInline(headerTitle)} ${printDate}`.replace(/\s+/g, ' ').trim();
    const t = window.setTimeout(() => {
      try { window.focus(); window.print(); } catch { /* noop */ }
    }, 650);
    return () => {
      window.clearTimeout(t);
      document.title = previousTitle;
      if (prevTod) el.setAttribute('data-tod', prevTod); else el.removeAttribute('data-tod');
    };
  }, [isPrintRoute, headerTitle]);

  return (
    <section
      aria-labelledby="policy-detail-title"
      className="grid gap-xl"
      data-hash-id={routeMarker.hashId}
      data-route={routeMarker.path}
      data-template={routeMarker.template}
    >
      <article className={cx(
        'relative isolate grid gap-xl overflow-visible rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest backdrop-blur-xl',
        isPrintRoute && 'ci-premium-print-document ci-premium-policy-document bg-white text-[#1F1C1B]'
      )}>
        {isPrintRoute && (
          <>
            <div className="ci-premium-top-rule" />
            <header className="ci-premium-header">
              <img className="ci-premium-logo" src="/ci-logo-gray.png" alt="Care Indeed" />
              <div className="ci-premium-header-meta">
                <strong>{headerId} · {corpus?.tier ?? 'Policy'}</strong>
                Corporate Policy Document<br />
                Print / Download View
              </div>
            </header>
            <section className="ci-premium-cover-block">
              <p className="ci-premium-kicker">Corporate Policy Document · {headerId}{corpus?.tier ? ` · ${corpus.tier}` : ''}</p>
              <h1>{cleanInline(headerTitle)}</h1>
              <div className="ci-premium-meta-grid">
                {headerFields.map(([label, value]) => (
                  <div key={label}><span>{label}</span><strong>{value}</strong></div>
                ))}
              </div>
              <p className="ci-premium-printed-on">Printed {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </section>
          </>
        )}
        <section className="grid scroll-mt-28 gap-xl" id="overview">
          {!isPrintRoute && <div className="grid gap-lg rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset/80 p-xl">
            <div className="flex flex-wrap items-start justify-between gap-lg border-b border-hairline pb-lg">
              <div className="grid gap-sm">
                <Link
                  className="w-fit text-xs font-medium uppercase tracking-tag text-brand-teal transition hover:text-brand-teal-deep"
                  to={backTo}
                >
                  &larr; Back to {backLabel}
                </Link>
                <div className="flex flex-wrap items-center gap-sm">
                  <ToneTag tone="teal">Policy ID: {headerId}</ToneTag>
                </div>
                <h2 className="text-[28px] font-medium leading-tight text-ink" id="policy-detail-title">
                  {cleanInline(headerTitle)}
                </h2>
                {!corpus && (
                  <p className="max-w-measure text-sm text-secondary">
                    No corpus record found for this policy ID. Header metadata is limited to the policy content source.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-sm">
                <ToneBadge size="sm" status="info" />
                <button
                  type="button"
                  onClick={() => openPolicyPrintRoute(`/print/${encodeURIComponent(policyId)}`)}
                  className="text-xs px-3 py-1 rounded border border-hairline hover:bg-surface-glass hover:backdrop-blur-md"
                >
                  Print / Download
                </button>
              </div>
            </div>

            <dl className="grid gap-lg tablet:grid-cols-2 desktop:grid-cols-4">
              {headerFields.map(([label, value]) => (
                <div className="min-h-row rounded-md border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset/80 p-md" key={label}>
                  <dt className="text-tag uppercase tracking-tag text-muted">{label}</dt>
                  <dd className={cx('mt-xs text-sm font-medium text-ink', label === 'Tier' && 'text-brand-orange')}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>}

          {content ? (
            <div className="grid gap-lg">
              {sections.map((section, index) => {
                // Match V1 print fidelity: keep ALL section headings (document
                // structure); drop only the order-1 title block and level-1
                // separator ("---") sections. The body renders when present.
                const _b = (section.body || '').trim();
                if (section.order === 1 || (section.level === 1 && (_b === '' || _b === '---'))) return null;
                // Heading-only section (body is a "---" separator): render a clean
                // structural heading, not an empty card (V1 print parity).
                if (_b === '' || _b === '---') {
                  return (
                    <div key={section.id} id={buildAnchor(section)} className={cx('scroll-mt-28', isPrintRoute && 'ci-premium-section')}>
                      <h3 className={cx('font-medium text-ink', section.level <= 2 ? 'text-h2' : 'text-h3')}>{cleanInline(section.title)}</h3>
                    </div>
                  );
                }
                return (
                <section
                  className={cx(
                    'scroll-mt-28 rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg overflow-hidden shadow-rest backdrop-blur-md',
                    isPrintRoute && 'ci-premium-section'
                  )}
                  id={buildAnchor(section)}
                  key={section.id}
                >
                  <div className="mb-md flex flex-wrap items-start justify-between gap-md">
                    <div className="flex items-center gap-sm">
                      <span className="grid h-tap w-tap place-items-center rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset text-brand-teal">
                        <FileText aria-hidden="true" className="h-icon-sm w-icon-sm" />
                      </span>
                      <div>
                        <p className="text-tag uppercase tracking-tag text-muted">Section {index + 1}</p>
                        <h3 className={cx('font-medium text-ink', section.level <= 2 ? 'text-h2' : 'text-h3')}>
                          {cleanInline(section.title)}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <MarkdownBody body={section.body} />
                </section>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl text-center shadow-rest backdrop-blur-md">
              <span className="mx-auto grid h-tap w-tap place-items-center rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset text-muted">
                <Info aria-hidden="true" className="h-icon-md w-icon-md" />
              </span>
              <h3 className="mt-md text-h2 font-medium text-ink">Policy content unavailable</h3>
              <p className="mx-auto mt-sm max-w-measure text-sm text-secondary">
                No policy content is published for {headerId} in the policy content source. The corpus header above
                reflects the available metadata.
              </p>
            </div>
          )}
        </section>
        {isPrintRoute && (
          <footer className="ci-premium-footer">
            <span>Care Indeed Home Health Care, Inc.</span>
            <span>{headerId} · Corporate Policy Document</span>
          </footer>
        )}
      </article>

      {!isPrintRoute && <section className="grid gap-xl desktop:grid-cols-2" aria-label="Related policy data">
        <SourceUnavailable
          icon={Link2}
          title="Linked Forms"
          description="Forms connected to this policy are not part of the policy content source. Form linkage is managed in the Forms Library and is not available from the policy detail content."
        />
        <SourceUnavailable
          icon={ListChecks}
          title="Lifecycle & Evidence"
          description="Lifecycle progress and evidence records are not carried in the policy content source. Status, version, and review dates appear as real content within the Policy Header section above."
        />
      </section>}

      {!isPrintRoute && <SourceUnavailable
        title="Readiness & Compliance Mapping"
        description="Survey-readiness scoring and standard-to-section mapping are not present in the policy content source and are not fabricated here. Regulatory references appear as real content within the policy's References section."
      />}
    </section>
  );
}

export default PolicyDetailScreen;
