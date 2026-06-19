import { Fragment, type ReactNode } from 'react';
import { FileText } from 'lucide-react';
import type { PolicyViewer32Section } from './PolicyViewer32Types';

interface MarkdownBlock {
  kind: 'paragraph' | 'list' | 'table' | 'heading';
  lines: string[];
}

function isTableLine(line: string): boolean {
  return line.trim().startsWith('|') && line.trim().endsWith('|');
}

function isSeparatorLine(line: string): boolean {
  return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(line);
}

function isListLine(line: string): boolean {
  return /^\s*(?:[-*]|[0-9]+[.)])\s+/.test(line);
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const tokenPattern = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`)/g;
  let lastIndex = 0;

  for (const match of text.matchAll(tokenPattern)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    const [token, , linkLabel, linkHref, boldText, codeText] = match;
    if (linkLabel && linkHref) {
      const external = /^[a-z]+:\/\//i.test(linkHref);
      nodes.push(
        <a
          key={`${keyPrefix}-${start}`}
          href={linkHref}
          target={external ? '_blank' : undefined}
          rel={external ? 'noreferrer' : undefined}
          className="font-medium text-[#007970] underline decoration-[#7ECFCC] underline-offset-2 transition-colors hover:text-[#004142] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007970]"
        >
          {linkLabel}
        </a>,
      );
    } else if (boldText) {
      nodes.push(<strong key={`${keyPrefix}-${start}`} className="font-semibold text-[#004142]">{boldText}</strong>);
    } else if (codeText) {
      nodes.push(
        <code key={`${keyPrefix}-${start}`} className="rounded bg-[#EEF9F9] px-1 py-0.5 font-mono text-[0.9em] text-[#004142]">
          {codeText}
        </code>,
      );
    } else {
      nodes.push(token);
    }

    lastIndex = start + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function listText(line: string): string {
  return line.replace(/^\s*(?:[-*]|[0-9]+[.)])\s+/, '').trim();
}

function tableCells(line: string): string[] {
  return line
    .split('|')
    .map(cell => cell.trim())
    .filter(Boolean);
}

function buildBlocks(body: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = body.split('\n');
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line || !line.trim()) {
      index += 1;
      continue;
    }

    if (line.trim().startsWith('#')) {
      blocks.push({ kind: 'heading', lines: [line.replace(/^#+\s*/, '')] });
      index += 1;
      continue;
    }

    if (isTableLine(line)) {
      const tableLines: string[] = [];
      while (index < lines.length && isTableLine(lines[index] ?? '')) {
        const tableLine = lines[index] ?? '';
        if (!isSeparatorLine(tableLine)) tableLines.push(tableLine);
        index += 1;
      }
      blocks.push({ kind: 'table', lines: tableLines });
      continue;
    }

    if (isListLine(line)) {
      const listLines: string[] = [];
      while (index < lines.length && isListLine(lines[index] ?? '')) {
        listLines.push(lines[index] ?? '');
        index += 1;
      }
      blocks.push({ kind: 'list', lines: listLines });
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      index < lines.length &&
      lines[index]?.trim() &&
      !isTableLine(lines[index] ?? '') &&
      !isListLine(lines[index] ?? '') &&
      !lines[index]?.trim().startsWith('#')
    ) {
      paragraphLines.push(lines[index] ?? '');
      index += 1;
    }
    blocks.push({ kind: 'paragraph', lines: paragraphLines });
  }

  return blocks;
}

export function PolicyViewer32EmptyState({ title = 'No content available' }: { title?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center opacity-75">
      <FileText size={28} className="mb-3 text-[#6E8888]" aria-hidden="true" />
      <h3 className="text-sm font-medium text-[#315B5C]">{title}</h3>
    </div>
  );
}

export function PolicyViewer32Markdown({ body }: { body: string }) {
  const blocks = buildBlocks(body);
  if (blocks.length === 0) {
    // Avoid injecting large empty blocks inside section content flows.
    // Return a very subtle placeholder only (or nothing).
    return <div className="py-2 text-[10px] italic text-[#6E8888]">—</div>;
  }

  return (
    <div className="space-y-4 text-[#263C3D]">
      {blocks.map((block, index) => {
        if (block.kind === 'heading') {
          return (
            <h4 key={index} className="text-sm font-semibold tracking-wide text-[#004142]">
              {renderInline(block.lines.join(' ').trim(), `heading-${index}`)}
            </h4>
          );
        }

        if (block.kind === 'list') {
          const listItems = block.lines.map(l => listText(l));

          // Heuristic: many policy responsibility / requirement lists are short bullets.
          // Render them as a compact print-style one-column table.
          const looksLikeSimpleList = listItems.every(item => item.length < 140 && !/[.]{2,}/.test(item));
          if (looksLikeSimpleList && listItems.length > 0) {
            return (
              <div key={index} className="overflow-hidden border border-[#D8E2E2] bg-white">
                <table className="min-w-full text-left border-collapse">
                  <tbody className="divide-y divide-[#E4EAEA]">
                    {listItems.map((item, itemIndex) => (
                      <tr key={itemIndex}>
                        <td className="px-3.5 py-2 text-sm leading-relaxed text-[#263C3D]">
                          {renderInline(item, `list-table-${index}-${itemIndex}`)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          // Default bullet rendering for longer / more narrative lists
          return (
            <ul key={index} className="space-y-2">
              {listItems.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-3 text-sm leading-relaxed text-[#263C3D]">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#007970] flex-shrink-0" aria-hidden="true" />
                  <span className="whitespace-pre-line">{renderInline(item, `list-${index}-${itemIndex}`)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.kind === 'table') {
          const [header, ...rows] = block.lines;
          const headerCells = header ? tableCells(header) : [];
          return (
            <div key={index} className="overflow-x-auto border border-[#D8E2E2] bg-white">
              <table className="min-w-full text-left border-collapse">
                {headerCells.length > 0 && (
                  <thead>
                    <tr className="border-b border-[#D8E2E2] bg-[#F7FAFA]">
                      {headerCells.map((cell, cellIndex) => (
                        <th key={cellIndex} className="px-3.5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#426768]">
                          {renderInline(cell, `table-head-${index}-${cellIndex}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody className="divide-y divide-[#E4EAEA]">
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {tableCells(row).map((cell, cellIndex) => (
                        <td key={cellIndex} className="break-words px-3.5 py-3 align-top text-xs leading-relaxed text-[#365657]">
                          {renderInline(cell, `table-cell-${index}-${rowIndex}-${cellIndex}`)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <p key={index} className="text-sm leading-7 text-[#263C3D] whitespace-pre-line">
            {block.lines.map((line, lineIndex) => (
              <Fragment key={`paragraph-${index}-${lineIndex}`}>
                {lineIndex > 0 ? '\n' : null}
                {renderInline(line, `paragraph-${index}-${lineIndex}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export function PolicyViewer32SectionList({ sections }: { sections: PolicyViewer32Section[] }) {
  if (sections.length === 0) {
    // In tab content flows we prefer silence over a big empty state.
    return null;
  }

  return (
    <div className="max-w-6xl space-y-7">
      {sections.map(section => (
        <section key={section.id} className="space-y-3">
          <h4 className="border-b border-[#007970] pb-2 text-[17px] font-semibold tracking-tight text-[#1F2F31]">{section.title}</h4>
          <PolicyViewer32Markdown body={section.body} />
        </section>
      ))}
    </div>
  );
}
