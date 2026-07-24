"use client";

/**
 * Minimal, dependency-free renderer for the markdown subset used inside baked
 * policy section text (src/policy/data/allPoliciesContent.generated.ts via
 * policyCatalog.generated.ts): pipe tables, #-headings, "- " / numbered lists,
 * "---" rules, **bold**, and [text](url) links. Renders the ACTUAL baked text
 * faithfully — no summarizing, no stripping of source oddities.
 */
import { useMemo, type ReactNode } from "react";

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "hr" }
  | { type: "table"; header: string[]; rows: string[][] }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "clause"; number: string; text: string }
  | { type: "paragraph"; text: string };

const ESCAPE_RE = /\\([.\-*_`[\]()#+!>])/g;

export function unescapeMarkdown(raw: string): string {
  return raw.replace(ESCAPE_RE, "$1");
}

function isSeparatorRow(cells: string[]): boolean {
  return cells.length > 0 && cells.every((c) => /^:?-{1,}:?$/.test(c.trim()));
}

function parseMarkdownBlocks(text: string): Block[] {
  const lines = text.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (trimmed === "") {
      i += 1;
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      i += 1;
      continue;
    }

    if (/^-{3,}$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    if (trimmed.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i += 1;
      }
      const rows = tableLines.map((line) =>
        line
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((cell) => cell.trim()),
      );
      let header: string[] = [];
      let bodyRows: string[][] = rows;
      if (rows.length >= 2 && isSeparatorRow(rows[1])) {
        header = rows[0];
        bodyRows = rows.slice(2);
      } else if (rows.length >= 1) {
        header = rows[0];
        bodyRows = rows.slice(1);
      }
      blocks.push({ type: "table", header, rows: bodyRows });
      continue;
    }

    // Bulleted list: "- " or "* " (group consecutive items).
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "list", ordered: false, items });
      continue;
    }

    // Numbered sub-clause: "4.1 …", "10.2 …" (a policy statement, not a list item).
    // Rendered with the clause number set apart so long policies read as structured
    // clauses instead of a wall of text.
    const clauseMatch = /^(\d+\.\d+(?:\.\d+)*)\s+(.*)$/.exec(trimmed);
    if (clauseMatch) {
      blocks.push({ type: "clause", number: clauseMatch[1], text: clauseMatch[2].trim() });
      i += 1;
      continue;
    }

    // Ordered list: "1. " / "1) " single-level (group consecutive items).
    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }

    blocks.push({ type: "paragraph", text: trimmed });
    i += 1;
  }

  return blocks;
}

function renderInline(raw: string, keyPrefix: string): ReactNode[] {
  const text = unescapeMarkdown(raw);
  const nodes: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = re.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-b-${idx}`}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      nodes.push(
        <a
          key={`${keyPrefix}-l-${idx}`}
          href={match[3]}
          className="policy-inline-link"
          rel={/^https?:\/\//.test(match[3]) ? "noopener noreferrer" : undefined}
        >
          {match[2]}
        </a>,
      );
    }
    idx += 1;
    lastIndex = re.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes.length > 0 ? nodes : [text];
}

const HEADING_TAGS = ["h4", "h5", "h6", "h6", "h6", "h6"] as const;

export function cleanHeading(title: string): string {
  return unescapeMarkdown(title);
}

export function PolicyMarkdown({ text }: { text: string }) {
  const blocks = useMemo(() => parseMarkdownBlocks(text), [text]);

  return (
    <>
      {blocks.map((block, index) => {
        const key = `blk-${index}`;
        switch (block.type) {
          case "heading": {
            const Tag = HEADING_TAGS[Math.min(block.level, 6) - 1] ?? "h6";
            return (
              <Tag key={key} className="policy-heading">
                {renderInline(block.text, key)}
              </Tag>
            );
          }
          case "hr":
            return <hr key={key} className="policy-hr" />;
          case "table":
            return (
              <div className="policy-table-wrap" key={key}>
                <table className="policy-table">
                  <thead>
                    <tr>
                      {block.header.map((cell, hi) => (
                        <th key={hi}>{renderInline(cell, `${key}-h${hi}`)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td key={ci}>{renderInline(cell, `${key}-${ri}-${ci}`)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "list": {
            const ListTag = block.ordered ? "ol" : "ul";
            return (
              <ListTag
                className={block.ordered ? "policy-list policy-list-ordered" : "policy-list"}
                key={key}
              >
                {block.items.map((item, ii) => (
                  <li key={ii}>{renderInline(item, `${key}-${ii}`)}</li>
                ))}
              </ListTag>
            );
          }
          case "clause":
            return (
              <p key={key} className="policy-clause">
                <span className="policy-clause-number">{block.number}</span>
                <span className="policy-clause-text">{renderInline(block.text, key)}</span>
              </p>
            );
          case "paragraph":
          default:
            if (!block.text) return null;
            return (
              <p key={key} className="policy-paragraph">
                {renderInline(block.text, key)}
              </p>
            );
        }
      })}
    </>
  );
}
