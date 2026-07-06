import { Info, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { cx } from '../../utils/classNames';
import { getPolicyContent } from '@/policy/data/policyContentMap';
import { getCorpusPolicy, DOMAIN_LABEL, type CorpusPolicy } from '@/policy/data/policyCorpus';
import { FORMS_DATASET, type FormRecord } from '@/policy/data/formsLibraryDataset';
import type { PolicyContent, PolicyContentSection } from '@/policy/types';
import { CareIndeedCard } from '@/components/theme/CareIndeedCard';
import { CareIndeedButton } from '@/components/theme/CareIndeedButton';
import { CareIndeedTabs } from '@/components/theme/CareIndeedTabs';
import { CareIndeedEyebrow } from '@/components/theme/CareIndeedEyebrow';
import { CareIndeedDataBlock } from '@/components/theme/CareIndeedDataBlock';

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

function isMarkdownStructuralLine(line: string): boolean {
  return (
    /^(#{1,6})\s+/.test(line) ||
    /^[-*•]\s+/.test(line) ||
    /^-{3,}$/.test(line) ||
    /^\*{3,}$/.test(line) ||
    isTableRow(line) ||
    isTableSeparator(line)
  );
}

function isPlainListIntro(line: string): boolean {
  const cleaned = cleanInline(line);
  if (!cleaned.endsWith(':')) return false;
  return /(?:applies to|following|include|includes|including|requirements|responsibilities|consist of|consists of):$/i.test(cleaned);
}

function collectPlainListItems(lines: string[], introIndex: number): { items: string[]; lastIndex: number } | null {
  if (!isPlainListIntro(lines[introIndex].trim())) return null;

  const items: string[] = [];
  let lastIndex = introIndex;
  for (let j = introIndex + 1; j < lines.length; j += 1) {
    const candidate = lines[j].trim();
    if (
      !candidate ||
      isMarkdownStructuralLine(candidate) ||
      candidate.endsWith(':') ||
      /^This policy does not apply/i.test(candidate) ||
      /^\d+(?:\\?\.\d+)*\\?\./.test(candidate)
    ) {
      break;
    }
    items.push(candidate);
    lastIndex = j;
  }

  return items.length >= 2 ? { items, lastIndex } : null;
}

/** "6.2.1 — Legal Authority" → "Legal Authority"; "4. Policy Statement" → "Policy Statement". */
function stripNumbering(title: string): string {
  return cleanInline(title).replace(/^\d+(?:\.\d+)*[.\s—–-]*\s*/, '').trim();
}

/** Document numbering from the section title itself: "6.2.1 — …" → "6.2.1". */
function numberOf(title: string): string | null {
  const m = cleanInline(title).match(/^(\d+(?:\.\d+)*)/);
  return m ? m[1] : null;
}

/** Heading-only separator sections ("---" or empty bodies) are not cards. */
function isSeparatorSection(s: PolicyContentSection): boolean {
  const b = (s.body || '').trim();
  return b === '' || b === '---';
}

/** One-word nav label per the reference design ("4. Policy Statement" → "Statement"). */
function shortNavLabel(title: string): string {
  const t = stripNumbering(title).toLowerCase();
  if (t.includes('documentation')) return 'Documentation';
  if (t.includes('training') || t.includes('acknowledgment')) return 'Training';
  if (t.includes('version') || t.includes('control')) return 'Control';
  if (t.includes('statement')) return 'Statement';
  if (t.includes('consideration') || t.includes('compliance')) return 'Considerations';
  if (t.includes('reference')) return 'References';
  if (t.includes('procedure')) return 'Procedures';
  if (t.includes('definition')) return 'Definitions';
  if (t.includes('scope')) return 'Scope';
  if (t.includes('purpose')) return 'Purpose';
  return stripNumbering(title).split(/\s+/)[0] || title;
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

    const plainList = collectPlainListItems(lines, i);
    if (plainList) {
      flushParagraph();
      flushList();
      blocks.push({ kind: 'paragraph', text: cleanInline(line) });
      blocks.push({ kind: 'list', items: plainList.items.map(cleanInline) });
      i = plainList.lastIndex;
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

const PREMIUM_BULLETS_CSS = `
  .premium-bullets {
    list-style: none;
    padding-left: 0;
  }
  .premium-bullets li {
    position: relative;
    padding-left: 2.25rem;
    margin-bottom: 1rem;
    line-height: 1.65;
  }
  .premium-bullets li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.4rem;
    width: 1.25rem;
    height: 1.25rem;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%230D7A75'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-size: contain;
  }
`;

function MarkdownBody({ body }: { body: string }) {
  // Trailing "---" separators end most section bodies in the source; the
  // reference design shows no rule at the bottom of a card.
  const blocks = parseMarkdown(body).filter(
    (b, i, all) => !(b.kind === 'rule' && i === all.length - 1),
  );
  if (!blocks.length) return null;

  return (
    <div className="space-y-4">
      {blocks.some((block) => block.kind === 'list') && <style>{PREMIUM_BULLETS_CSS}</style>}
      {blocks.map((block, index) => {
        const key = `${block.kind}-${index}`;
        switch (block.kind) {
          case 'heading': {
            const cls =
              block.level <= 2
                ? 'text-base font-semibold text-ink leading-relaxed'
                : 'text-sm font-medium uppercase tracking-wide text-muted';
            return (
              <p className={cls} key={key}>
                {block.text}
              </p>
            );
          }
          case 'rule':
            return <hr className="border-0 border-t border-gray-100 my-2" key={key} />;
          case 'list': {
            return (
              <ul className="premium-bullets pl-2 text-sm text-secondary" key={key}>
                {block.items.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`}>{item}</li>
                ))}
              </ul>
            );
          }
          case 'table': {
            const isCompact = block.header.length >= 5;
            const tableText = isCompact ? 'text-xs' : 'text-sm';
            const cellPy = isCompact ? 'py-4' : 'py-5';
            return (
              <div className="overflow-x-auto" key={key}>
                <table className={`w-full ${tableText} text-left`}>
                  <thead>
                    <tr>
                      {block.header.map((cell, cellIndex) => (
                        <th
                          className="pb-4 font-semibold text-disabled uppercase text-xs pr-4 last:pr-0"
                          key={`${key}-h-${cellIndex}`}
                          scope="col"
                        >
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-secondary">
                    {block.rows.map((row, rowIndex) => (
                      <tr key={`${key}-r-${rowIndex}`}>
                        {row.map((cell, cellIndex) => (
                          <td
                            className={`${cellPy} align-top pr-4 last:pr-0`}
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
          }
          case 'paragraph':
          default:
            return (
              <p className="text-secondary leading-relaxed text-sm md:text-base" key={key}>
                {block.text}
              </p>
            );
        }
      })}
    </div>
  );
}

// ─── Section model ─────────────────────────────────────────────────────────
// Sections group into top-level entries (level 2) with their sub-sections
// (level ≥ 3). One card shows at a time. Section numbers come from the
// document's own titles ("6.2.1 — …"); the flat "N OF TOTAL" counter walks
// the document order, counting the Policy Overview as 1 and appendix
// sub-sections at the end (which render via the Appendices modal, not cards).

interface SectionGroup {
  top: PolicyContentSection;
  children: PolicyContentSection[];
  isAppendices: boolean;
}

type FlatCard =
  | { kind: 'overview' }
  | { kind: 'section'; section: PolicyContentSection; group: SectionGroup };

export function PolicyDetailScreen() {
  const params = useParams<{ policyId?: string }>();
  const policyId = params.policyId?.trim() || DEFAULT_POLICY_ID;
  const [searchParams] = useSearchParams();
  // Reference / print view only — never pulls CES execution state, stores, or V3 seeds.
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

  const sections = useMemo(
    () => (content ? [...content.sections].sort((a, b) => a.order - b.order) : []),
    [content],
  );

  // The "1. Policy Header" section's field/value table feeds the Policy
  // Overview card (Section 1) and is not rendered as its own card.
  const headerSection = useMemo(
    () => sections.find((s) => /^policy\s*header$/i.test(stripNumbering(s.title))) ?? null,
    [sections],
  );

  const groups = useMemo(() => {
    const out: SectionGroup[] = [];
    for (const s of sections) {
      if (s.level <= 1) continue; // document title block
      if (headerSection && s.id === headerSection.id) continue;
      if (s.level === 2) {
        out.push({ top: s, children: [], isAppendices: /appendices/i.test(stripNumbering(s.title)) });
      } else if (out.length) {
        out[out.length - 1].children.push(s);
      }
    }
    return out;
  }, [sections, headerSection]);

  const navGroups = useMemo(() => groups.filter((g) => !g.isAppendices), [groups]);
  const appendixGroup = useMemo(() => groups.find((g) => g.isAppendices) ?? null, [groups]);

  const flatCards = useMemo(() => {
    const cards: FlatCard[] = [{ kind: 'overview' }];
    for (const g of navGroups) {
      if (!isSeparatorSection(g.top)) cards.push({ kind: 'section', section: g.top, group: g });
      for (const c of g.children) {
        if (!isSeparatorSection(c)) cards.push({ kind: 'section', section: c, group: g });
      }
    }
    return cards;
  }, [navGroups]);

  // Appendix sub-sections count toward the document total (they live in the
  // Appendices modal, so the last card ends with a disabled FINISH).
  const totalCount =
    flatCards.length + (appendixGroup ? appendixGroup.children.filter((c) => !isSeparatorSection(c)).length : 0);

  const [flatIndex, setFlatIndex] = useState(0);
  useEffect(() => { setFlatIndex(0); }, [policyId]);
  const boundedIndex = Math.min(flatIndex, Math.max(0, flatCards.length - 1));
  const current: FlatCard = flatCards[boundedIndex] ?? { kind: 'overview' };
  const currentGroup = current.kind === 'section' ? current.group : null;
  const isLastCard = boundedIndex === flatCards.length - 1;

  const firstCardIndexOf = (g: SectionGroup) =>
    flatCards.findIndex((c) => c.kind === 'section' && c.group === g);

  // Policy Overview metadata — parsed from the Policy Header field/value table.
  const headerKV = useMemo(() => {
    const map = new Map<string, string>();
    if (!headerSection) return map;
    const table = parseMarkdown(headerSection.body).find((b) => b.kind === 'table');
    if (table && table.kind === 'table') {
      for (const row of table.rows) {
        if (row[0] && row[1]) map.set(row[0].trim().toLowerCase(), cleanInline(row[1]));
      }
    }
    return map;
  }, [headerSection]);
  const kv = (key: string) => headerKV.get(key) ?? null;

  // Overview intro — the Purpose paragraph, trimmed at the regulation cite.
  const overviewIntro = useMemo(() => {
    const purpose = navGroups.find((g) => /purpose/i.test(stripNumbering(g.top.title)));
    const firstPara = (purpose?.top.body ?? '').split(/\n\s*\n/)[0]?.trim() ?? '';
    if (!firstPara) return null;
    const cut = firstPara.indexOf(' — Condition');
    return cleanInline(cut > 0 ? `${firstPara.slice(0, cut)}.` : firstPara);
  }, [navGroups]);

  const version = kv('version')?.replace(/^v/i, '') ?? null;
  const overviewCards: { label: string; lines: string[]; highlight?: boolean }[] = [
    { label: 'Domain & Subdomain', lines: [kv('domain'), kv('subdomain')].filter(Boolean) as string[] },
    { label: 'Status & Version', lines: [kv('status'), version ? `Version ${version}` : null].filter(Boolean) as string[] },
    { label: 'Review Cycle', lines: [kv('review cycle'), kv('next review date') ? `Next: ${kv('next review date')}` : null].filter(Boolean) as string[] },
    { label: 'Access Tier', lines: [kv('access tier')].filter(Boolean) as string[] },
    { label: 'Policy Owner / Steward', lines: [kv('policy owner / steward')].filter(Boolean) as string[] },
    { label: 'Effective Date', lines: [kv('effective date')].filter(Boolean) as string[], highlight: true },
  ].filter((c) => c.lines.length > 0);

  const [appendicesOpen, setAppendicesOpen] = useState(false);
  // A selected appendix opens the ACTUAL form workspace (/forms/:id?embed=1)
  // inside the modal.
  const [openedForm, setOpenedForm] = useState<FormRecord | null>(null);

  // Appendices — the ACTUAL forms linked to this policy in the Forms Library.
  const linkedForms: FormRecord[] = useMemo(
    () => FORMS_DATASET.filter((f) => f.policies.includes(policyId)),
    [policyId],
  );

  // Close the appendices modal on Escape.
  useEffect(() => {
    if (!appendicesOpen) return undefined;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setAppendicesOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [appendicesOpen]);

  // Auto-name the saved PDF "{policy name} {YYYY-MM-DD}" (document.title is the
  // browser's default Save-as filename) and auto-trigger print on dedicated
  // print routes. Restores the prior title on cleanup.
  useEffect(() => {
    if (!isPrintRoute || typeof window === 'undefined') return undefined;
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

  const goTo = (idx: number) => setFlatIndex(Math.max(0, Math.min(flatCards.length - 1, idx)));

  // Sub-navigation items for the active group (Procedures → pills;
  // Considerations / References → underline tabs), exactly per the reference.
  const subNavItems = currentGroup
    ? flatCards
        .map((c, idx) => ({ card: c, idx }))
        .filter((e) => e.card.kind === 'section' && e.card.group === currentGroup)
    : [];
  const showSubNav = subNavItems.length > 1;
  const subNavAsPills = currentGroup ? /procedure/i.test(stripNumbering(currentGroup.top.title)) : false;

  const cardFooter = (
    <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-100">
      <button
        type="button"
        onClick={() => goTo(boundedIndex - 1)}
        className={cx(
          'text-muted hover:text-gray-900 text-sm font-medium px-4 py-2 transition-colors',
          boundedIndex === 0 && 'invisible',
        )}
      >
        &larr; Previous
      </button>
      <span className="text-xs text-disabled font-medium tracking-widest">{boundedIndex + 1} OF {totalCount}</span>
      {isLastCard ? (
        <CareIndeedButton
          variant="primary"
          shape="pill"
          disabled
        >
          FINISH
        </CareIndeedButton>
      ) : (
        <CareIndeedButton
          variant="primary"
          shape="pill"
          onClick={() => goTo(boundedIndex + 1)}
          className="flex items-center gap-2"
        >
          NEXT &rarr;
        </CareIndeedButton>
      )}
    </div>
  );

  return (
    <section
      aria-labelledby="policy-detail-title"
      className="grid gap-xl"
      data-hash-id={routeMarker.hashId}
      data-route={routeMarker.path}
      data-template={routeMarker.template}
    >
      <article className={cx(
        'relative isolate overflow-visible',
        !isPrintRoute && 'p-0',
        isPrintRoute && 'rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset overflow-hidden shadow-rest backdrop-blur-xl ci-premium-print-document ci-premium-policy-document bg-white text-[#1F1C1B]'
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
            {sections
              .filter((s) => s.level > 1 && !isSeparatorSection(s))
              .map((s) => (
                <section className="ci-premium-section" key={s.id}>
                  <h3>{cleanInline(s.title)}</h3>
                  <MarkdownBody body={s.body} />
                </section>
              ))}
            <footer className="ci-premium-footer">
              <span>Care Indeed Home Health Care, Inc.</span>
              <span>{headerId} · Corporate Policy Document</span>
            </footer>
          </>
        )}

        {!isPrintRoute && (
          <div id="overview" className="theme-ci-light-orange bg-canvas min-h-screen">
            <style>{`
              @keyframes pdFadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes pdSectionIn {
                from { opacity: 0; transform: translateX(28px); }
                to { opacity: 1; transform: translateX(0); }
              }
            `}</style>

            {/* Page header — kicker + title, Policy Library top right */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm pt-8 pb-4 px-6 md:px-12 lg:px-16 border-b border-card">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <CareIndeedEyebrow className="mb-2">
                      POLICY LIBRARY &bull; {headerId}
                    </CareIndeedEyebrow>
                    <h1 className="text-3xl md:text-4xl font-bold text-brand-teal-deep tracking-tight" id="policy-detail-title">
                      {cleanInline(headerTitle)}
                    </h1>
                  </div>
                  <Link
                    to="/library"
                    className="shrink-0 self-start md:self-end text-xs font-bold uppercase tracking-wider text-brand-orange border border-brand-orange rounded-full px-5 py-2.5 transition-all hover:bg-brand-orange hover:text-white bg-white shadow-sm"
                  >
                    Policy Library
                  </Link>
                </div>
              </div>
            </header>

            {/* Section nav — one-word labels + Appendices (opens the modal) */}
            <div className="px-6 md:px-12 lg:px-16 bg-canvas border-b border-card sticky top-[108px] z-40">
              <div className="max-w-7xl mx-auto">
                <CareIndeedTabs
                  tabs={[
                    { id: 'overview', label: 'Header' },
                    ...navGroups.map((g) => ({ id: g.top.id, label: shortNavLabel(g.top.title) })),
                    { id: 'appendices', label: 'Appendices' },
                  ]}
                  activeTabId={current.kind === 'overview' ? 'overview' : currentGroup?.top.id || ''}
                  onChange={(id) => {
                    if (id === 'overview') {
                      goTo(0);
                    } else if (id === 'appendices') {
                      setAppendicesOpen(true);
                    } else {
                      const g = navGroups.find((group) => group.top.id === id);
                      if (g) {
                        goTo(firstCardIndexOf(g));
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* One section card at a time */}
            {content && (
              <main className="px-6 md:px-12 lg:px-16 py-8">
                <div className="max-w-7xl mx-auto" key={boundedIndex} style={{ animation: 'pdFadeIn 0.3s ease-in-out' }}>
                  {showSubNav && subNavAsPills && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {subNavItems.map(({ card, idx }) => card.kind === 'section' && (
                        <button
                          key={card.section.id}
                          type="button"
                          onClick={() => goTo(idx)}
                          className={cx(
                            'px-4 py-2 rounded-full text-xs cursor-pointer transition-colors',
                            idx === boundedIndex
                              ? 'bg-surface-hover text-brand-teal-deep border border-brand-teal/30 font-semibold shadow-sm'
                              : 'bg-white border border-card text-secondary hover:bg-gray-50',
                          )}
                        >
                          {stripNumbering(card.section.title)}
                        </button>
                      ))}
                    </div>
                  )}
                  {showSubNav && !subNavAsPills && (
                    <div className="flex space-x-6 border-b border-card mb-6 px-2 text-sm overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                      {subNavItems.map(({ card, idx }) => card.kind === 'section' && (
                        <button
                          key={card.section.id}
                          type="button"
                          onClick={() => goTo(idx)}
                          className={cx(
                            'pb-3 border-b-2 cursor-pointer transition-colors',
                            idx === boundedIndex
                              ? 'border-brand-teal-deep text-brand-teal-deep font-semibold'
                              : 'border-transparent text-muted hover:text-brand-teal',
                          )}
                        >
                          {stripNumbering(card.section.title)}
                        </button>
                      ))}
                    </div>
                  )}

                  <CareIndeedCard variant="container" className="md:p-10">
                    {current.kind === 'overview' ? (
                      <>
                        <div className="flex justify-between items-center mb-8">
                          <h2 className="text-2xl font-semibold text-brand-teal-deep">Policy Overview</h2>
                          <CareIndeedEyebrow>SECTION 1</CareIndeedEyebrow>
                        </div>
                        {overviewIntro && (
                          <p className="text-secondary leading-relaxed mb-8">{overviewIntro}</p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                          {overviewCards.map((card) => (
                            <CareIndeedDataBlock
                              key={card.label}
                              label={card.label}
                              value={card.lines.join(' • ')}
                            />
                          ))}
                        </div>
                        {cardFooter}
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-8">
                          <h2 className="text-2xl font-semibold text-brand-teal-deep">{stripNumbering(current.section.title)}</h2>
                          <CareIndeedEyebrow>
                            SECTION {numberOf(current.section.title) ?? boundedIndex + 1}
                          </CareIndeedEyebrow>
                        </div>
                        <MarkdownBody body={current.section.body} />
                        {cardFooter}
                      </>
                    )}
                  </CareIndeedCard>
                </div>
              </main>
            )}

            {!content && (
              <div className="px-6 md:px-12 lg:px-16 py-8">
                <CareIndeedCard variant="container" className="max-w-7xl mx-auto p-10 text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gray-50 text-disabled">
                    <Info aria-hidden="true" className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-2xl font-semibold text-brand-teal-deep">Policy content unavailable</h3>
                  <p className="mx-auto mt-2 max-w-xl text-sm text-secondary">
                    No policy content is published for {headerId} in the policy content source.
                  </p>
                </CareIndeedCard>
              </div>
            )}
          </div>
        )}
      </article>

      {/* Appendices modal — the ACTUAL forms from the Forms Library */}
      {appendicesOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Appendices — forms linked to ${headerId}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-lg"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { setAppendicesOpen(false); setOpenedForm(null); }}
          />
          <div
            className={cx(
              'relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm',
              openedForm ? 'h-[92vh] w-full max-w-5xl' : 'max-h-[82vh] w-full max-w-3xl'
            )}
            style={{ animation: 'pdSectionIn 260ms cubic-bezier(0.2, 0, 0, 1)' }}
          >
            <div className="flex items-start justify-between gap-md border-b border-gray-200 p-8 pb-6">
              <div className="grid gap-xs">
                <span className="w-fit rounded-full border border-[#0D7A75]/25 bg-[#0D7A75]/5 px-3 py-1 text-xs font-bold tracking-widest uppercase text-[#0D7A75]">
                  Appendices • {headerId}
                </span>
                {openedForm ? (
                  <>
                    <h3 className="text-2xl font-semibold text-[#0B4E45]">{openedForm.id} — {openedForm.name}</h3>
                    <button
                      type="button"
                      onClick={() => setOpenedForm(null)}
                      className="w-fit text-sm text-[#0D7A75] hover:text-[#0B4E45]"
                    >
                      &larr; Back to all appendices
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-semibold text-[#0B4E45]">Linked forms from the Forms Library</h3>
                    <p className="text-sm text-secondary">
                      {linkedForms.length > 0
                        ? `${linkedForms.length} form${linkedForms.length === 1 ? '' : 's'} reference this policy. Select one to open the actual form.`
                        : 'No Forms Library records reference this policy.'}
                    </p>
                  </>
                )}
              </div>
              <button
                type="button"
                aria-label="Close appendices"
                onClick={() => { setAppendicesOpen(false); setOpenedForm(null); }}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gray-200 text-muted hover:border-[#0D7A75] hover:text-[#0D7A75]"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
            {openedForm ? (
              <iframe
                src={`/forms/${encodeURIComponent(openedForm.id)}?embed=1`}
                title={`${openedForm.id} — ${openedForm.name}`}
                className="w-full flex-1 border-0 bg-white"
              />
            ) : (
              <div className="grid gap-sm overflow-y-auto p-8 pt-6">
                {linkedForms.map((form) => (
                  <button
                    key={form.id}
                    type="button"
                    onClick={() => setOpenedForm(form)}
                    className="group flex items-center justify-between gap-md rounded-xl border border-gray-100 bg-white p-6 text-left transition hover:border-[#0D7A75]/40 hover:bg-[#0D7A75]/5"
                  >
                    <div className="grid gap-xs">
                      <div className="flex flex-wrap items-center gap-sm">
                        <span className="text-xs font-bold tracking-widest text-[#0D7A75]">{form.id}</span>
                        <span className="rounded-full border border-gray-200 px-2 py-[1px] text-[11px] text-muted">{form.type}</span>
                      </div>
                      <span className="text-sm font-medium text-[#0B4E45]">{form.name}</span>
                      <span className="text-xs text-secondary">{form.usage} • {form.frequency}</span>
                    </div>
                    <span className="text-[#0D7A75] group-hover:translate-x-0.5 transition">→</span>
                  </button>
                ))}
                {linkedForms.length === 0 && (
                  <p className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-secondary">
                    No linked forms found for {headerId}.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default PolicyDetailScreen;
