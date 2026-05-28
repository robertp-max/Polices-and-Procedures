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

function cleanInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .trim();
}

function listText(line: string): string {
  return cleanInline(line.replace(/^\s*(?:[-*]|[0-9]+[.)])\s+/, ''));
}

function tableCells(line: string): string[] {
  return line
    .split('|')
    .map(cell => cleanInline(cell))
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
    <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
      <FileText size={42} className="text-[#5E6A7F] mb-4" aria-hidden="true" />
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-[#8A94A6]">This policy does not include content for this section.</p>
    </div>
  );
}

export function PolicyViewer32Markdown({ body }: { body: string }) {
  const blocks = buildBlocks(body);
  if (blocks.length === 0) return <PolicyViewer32EmptyState />;

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        if (block.kind === 'heading') {
          return (
            <h4 key={index} className="text-sm font-bold text-white tracking-wide">
              {cleanInline(block.lines.join(' '))}
            </h4>
          );
        }

        if (block.kind === 'list') {
          return (
            <ul key={index} className="space-y-2">
              {block.lines.map((line, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-3 text-sm text-[#E2E8F0] leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#007970] flex-shrink-0" aria-hidden="true" />
                  <span>{listText(line)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.kind === 'table') {
          const [header, ...rows] = block.lines;
          const headerCells = header ? tableCells(header) : [];
          return (
            <div key={index} className="rounded-xl border border-[#1C2433] bg-[#0F131A] overflow-x-auto">
              <table className="w-full min-w-[720px] text-left border-collapse">
                {headerCells.length > 0 && (
                  <thead>
                    <tr className="bg-[#141A23] border-b border-[#1C2433]">
                      {headerCells.map((cell, cellIndex) => (
                        <th key={cellIndex} className="py-3 px-4 text-[10px] font-bold text-[#5E6A7F] uppercase tracking-wider">
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody className="divide-y divide-[#1C2433]">
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-[#1C2433]/40 transition-colors group">
                      {tableCells(row).map((cell, cellIndex) => (
                        <td key={cellIndex} className="py-4 px-4 text-xs text-[#8A94A6] leading-relaxed align-top group-hover:text-[#E2E8F0] transition-colors">
                          {cell}
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
          <p key={index} className="text-sm text-[#E2E8F0] leading-relaxed">
            {cleanInline(block.lines.join(' '))}
          </p>
        );
      })}
    </div>
  );
}

export function PolicyViewer32SectionList({ sections }: { sections: PolicyViewer32Section[] }) {
  if (sections.length === 0) return <PolicyViewer32EmptyState />;

  return (
    <div className="space-y-6 max-w-6xl">
      {sections.map(section => (
        <section key={section.id} className="space-y-3">
          <h4 className="text-lg font-medium text-white">{section.title}</h4>
          <PolicyViewer32Markdown body={section.body} />
        </section>
      ))}
    </div>
  );
}
