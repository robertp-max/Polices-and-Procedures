import path from 'node:path';
import type { CorpusDoc, DocumentType, SectionRef } from '../types.js';

/* ═══════════════════════════════════════════════════════════════
   Metadata extraction.

   The corpus uses two broad patterns:
     1) Policy markdown / docx exports with a "Policy Header" table
        (Policy ID, Domain, Subdomain, Access Tier, Review Cycle, ...).
     2) Form .txt exports with KEY: VALUE front-matter (FORM ID, DOMAIN,
        USAGE, EFFECTIVE DATE, LINKED POLICIES, SECTION N: ...).

   This module extracts canonical metadata from either shape. Anything
   it can't determine falls back to filename-derived defaults so a
   document is always indexable even if poorly-tagged.
   ═══════════════════════════════════════════════════════════════ */

const DOMAIN_NAMES: Record<string, string> = {
  EN: 'Enterprise Control',
  GV: 'Governance',
  CO: 'Compliance & Regulatory',
  QA: 'QAPI',
  CL: 'Clinical Operations',
  HR: 'Human Resources',
  FN: 'Finance',
  IT: 'Information Technology',
  OP: 'Operations',
  RM: 'Risk Management & Safety',
};

const REG_TAG_HINTS: Array<{ tag: string; match: RegExp }> = [
  { tag: '42 CFR §484', match: /42 CFR §?484/i },
  { tag: '42 CFR §484.65 QAPI', match: /§?484\.65|QAPI/i },
  { tag: 'HIPAA', match: /HIPAA|45 CFR §?164/i },
  { tag: 'CMIA', match: /CMIA|Civil Code §?56/i },
  { tag: 'OIG', match: /\bOIG\b|Office of Inspector General/i },
  { tag: 'CDPH', match: /CDPH|Title 22/i },
  { tag: 'CMS', match: /\bCMS\b|Medicare/i },
  { tag: 'COP', match: /Condition of Participation|\bCoP\b/i },
  { tag: 'Governing Body', match: /Governing Body|§?484\.105/i },
  { tag: 'Plan of Care', match: /Plan of Care|§?484\.60/i },
  { tag: 'Billing', match: /\bbilling\b|claims submission|PDGM/i },
];

export interface ParsedHeader {
  id: string | null;
  title: string | null;
  domain: string | null;
  subdomain: string | null;
  ownerSteward: string | null;
  reviewCycle: string | null;
  accessTier: string | null;
  version: string | null;
  effectiveDate: string | null;
  nextReviewDate: string | null;
  description: string | null;
}

/* ─────────────────────────────────────────────────────────────
   Policy / appendix header parsing (markdown table or docx text).
   ───────────────────────────────────────────────────────────── */
export function parsePolicyHeader(text: string): ParsedHeader {
  // Support both markdown table rows ("| Policy ID | XX |") and docx
  // flattened lines ("Policy ID XX"). We key off the label word.
  const rowPatterns: Record<keyof ParsedHeader, RegExp[]> = {
    id: [
      /^\|\s*Policy ID\s*\|\s*([A-Z]{2}-[A-Z]{2,3}-\d{3,4})\s*\|/im,
      /Policy ID\s*[:|]\s*([A-Z]{2}-[A-Z]{2,3}-\d{3,4})/i,
    ],
    title: [
      /^\|\s*Policy Title\s*\|\s*([^|\n]+?)\s*\|/im,
      /Policy Title\s*[:|]\s*([^\n]+)/i,
    ],
    domain: [
      /^\|\s*Domain\s*\|\s*([^|\n]+?)\s*\|/im,
      /Domain\s*[:|]\s*([^\n]+)/i,
    ],
    subdomain: [
      /^\|\s*Subdomain\s*\|\s*([^|\n]+?)\s*\|/im,
      /Subdomain\s*[:|]\s*([^\n]+)/i,
    ],
    ownerSteward: [
      /^\|\s*Policy Owner[^|]*\|\s*([^|\n]+?)\s*\|/im,
      /Policy Owner[^:|]*[:|]\s*([^\n]+)/i,
    ],
    reviewCycle: [
      /^\|\s*Review Cycle\s*\|\s*([^|\n]+?)\s*\|/im,
      /Review Cycle\s*[:|]\s*([^\n]+)/i,
    ],
    accessTier: [
      /^\|\s*Access Tier\s*\|\s*([^|\n]+?)\s*\|/im,
      /Access Tier\s*[:|]\s*([^\n]+)/i,
    ],
    version: [
      /^\|\s*Version\s*\|\s*([^|\n]+?)\s*\|/im,
      /Version\s*[:|]\s*([^\n]+)/i,
    ],
    effectiveDate: [
      /^\|\s*Effective Date\s*\|\s*([^|\n]+?)\s*\|/im,
      /Effective Date\s*[:|]\s*([^\n]+)/i,
    ],
    nextReviewDate: [
      /^\|\s*Next Review Date\s*\|\s*([^|\n]+?)\s*\|/im,
      /Next Review Date\s*[:|]\s*([^\n]+)/i,
    ],
    description: [],
  };

  const out: ParsedHeader = {
    id: null,
    title: null,
    domain: null,
    subdomain: null,
    ownerSteward: null,
    reviewCycle: null,
    accessTier: null,
    version: null,
    effectiveDate: null,
    nextReviewDate: null,
    description: null,
  };

  for (const key of Object.keys(rowPatterns) as Array<keyof ParsedHeader>) {
    for (const pattern of rowPatterns[key]) {
      const m = text.match(pattern);
      if (m && m[1]) {
        out[key] = m[1].trim();
        break;
      }
    }
  }

  // Top-of-doc H1 is often the title when no header table is present.
  if (!out.title) {
    const h1 = text.match(/^#\s+(.+)$/m);
    if (h1) out.title = h1[1].trim();
  }

  // Purpose section gives us a solid description fallback.
  const purpose = text.match(
    /^##?\s*\d*\.?\s*Purpose\s*\n+([\s\S]{20,800}?)(?:\n##|\n---|\n\n\n|$)/im,
  );
  if (purpose && purpose[1]) {
    out.description = purpose[1]
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 400);
  }

  return out;
}

/* ─────────────────────────────────────────────────────────────
   Form header parsing (KEY: VALUE front-matter in .txt exports).
   ───────────────────────────────────────────────────────────── */
export interface ParsedFormHeader {
  id: string | null;
  title: string | null;
  domain: string | null;
  usage: string | null;
  frequency: string | null;
  version: string | null;
  effectiveDate: string | null;
  nextReviewDate: string | null;
  classifications: string[];
  linkedPolicies: string[];
  purpose: string | null;
}

export function parseFormHeader(text: string): ParsedFormHeader {
  const get = (label: string): string | null => {
    const m = text.match(new RegExp(`^${label}:\\s*(.+)$`, 'im'));
    return m ? m[1].trim() : null;
  };

  const classifications = (get('CLASSIFICATIONS') || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  // Linked policies block appears as "LINKED POLICIES:\n- XX-YY-###\n..."
  const linkedBlock = text.match(
    /^LINKED POLICIES:\s*\n((?:-.*\n?)+)/im,
  );
  const linkedPolicies = linkedBlock
    ? linkedBlock[1]
        .split('\n')
        .map(l => l.replace(/^-/, '').trim())
        .filter(Boolean)
    : [];

  const purposeBlock = text.match(
    /^PURPOSE:\s*\n([\s\S]*?)(?:\n[A-Z][A-Z ]{2,}:|$)/m,
  );

  return {
    id: get('FORM ID'),
    title: get('TITLE'),
    domain: get('DOMAIN'),
    usage: get('USAGE'),
    frequency: get('FREQUENCY'),
    version: get('VERSION'),
    effectiveDate: get('EFFECTIVE DATE'),
    nextReviewDate: get('NEXT REVIEW DATE'),
    classifications,
    linkedPolicies,
    purpose: purposeBlock ? purposeBlock[1].trim().slice(0, 400) : null,
  };
}

/* ─────────────────────────────────────────────────────────────
   Section detection. Produces absolute offsets into the
   normalized text so the chunker and citation renderer can
   agree on byte boundaries.
   ───────────────────────────────────────────────────────────── */
export function detectSections(text: string, docType: DocumentType): SectionRef[] {
  const sections: SectionRef[] = [];
  const lines = text.split('\n');

  let offset = 0;
  interface RawHeading {
    id: string;
    title: string;
    level: number;
    start: number;
  }
  const headings: RawHeading[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let matched: RawHeading | null = null;

    // Markdown H1..H6
    const md = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (md) {
      const level = md[1].length;
      const title = md[2].trim();
      matched = {
        id: slugifySection(title, level),
        title,
        level,
        start: offset,
      };
    }

    // Numbered sections: "3. Scope", "3.2 Something"
    if (!matched) {
      const numbered = line.match(/^\s*(\d+(?:\.\d+){0,3})\.?\s+([A-Z][^\n]{2,})$/);
      if (numbered) {
        const num = numbered[1];
        const level = num.split('.').length;
        if (level <= 4) {
          matched = {
            id: num,
            title: `${num} ${numbered[2].trim()}`,
            level,
            start: offset,
          };
        }
      }
    }

    // Form .txt "SECTION N: ..." headings
    if (!matched && docType === 'form') {
      const formSec = line.match(/^SECTION\s+([^:]+):\s*(.+)$/i);
      if (formSec) {
        matched = {
          id: `section-${slugify(formSec[1])}`,
          title: line.trim(),
          level: 2,
          start: offset,
        };
      }
    }

    if (matched) headings.push(matched);
    offset += line.length + 1; // +1 for the \n
  }

  // Convert heading list into sections with end offsets.
  const total = text.length;
  for (let i = 0; i < headings.length; i++) {
    const h = headings[i];
    const end = i + 1 < headings.length ? headings[i + 1].start : total;
    sections.push({
      id: h.id,
      title: h.title,
      level: h.level,
      start: h.start,
      end,
    });
  }

  // If nothing was detected, index the whole doc as a single section.
  if (sections.length === 0) {
    sections.push({
      id: 'body',
      title: 'Body',
      level: 1,
      start: 0,
      end: total,
    });
  }

  return sections;
}

function slugifySection(title: string, level: number): string {
  const s = slugify(title);
  return level === 1 ? s : `s-${s}`;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/* ─────────────────────────────────────────────────────────────
   Regulatory-tag enrichment + inter-doc link harvesting.
   ───────────────────────────────────────────────────────────── */
export function enrichRegTags(text: string, existing: string[] = []): string[] {
  const set = new Set(existing);
  for (const { tag, match } of REG_TAG_HINTS) {
    if (match.test(text)) set.add(tag);
  }
  return Array.from(set);
}

/** Harvest any `XX-YY-###` or `XX-FM-###` references found in the body. */
export function harvestLinkedIds(text: string, selfId: string): string[] {
  const ids = new Set<string>();
  const re = /\b([A-Z]{2}-[A-Z]{2,3}-\d{3,4})\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m[1] !== selfId) ids.add(m[1]);
  }
  return Array.from(ids);
}

/* ─────────────────────────────────────────────────────────────
   Filename-derived defaults so every doc has stable fallbacks.
   ───────────────────────────────────────────────────────────── */
export function inferFromFilename(filePath: string): {
  id: string;
  domain: string;
  subdomain: string;
} {
  const base = path.basename(filePath, path.extname(filePath));
  const idMatch = base.match(/^([A-Z]{2})-([A-Z]{2,3})-(\d{3,4})/);
  if (idMatch) {
    const [, domain, subdomain, num] = idMatch;
    return { id: `${domain}-${subdomain}-${num}`, domain, subdomain };
  }
  // Docx exports often have long names like "EN - ENTERPRISE CONTROL DOMAIN_...".
  const domainHint = base.match(/^([A-Z]{2})\b/);
  const domain = domainHint ? domainHint[1] : 'EN';
  return { id: base.replace(/\s+/g, '-'), domain, subdomain: '' };
}

export function domainLabel(code: string): string {
  return DOMAIN_NAMES[code] ?? code;
}

/** Final assembly: turn parsed pieces into a `CorpusDoc`. */
export function buildCorpusDoc(args: {
  docType: DocumentType;
  filePath: string;
  fileHash: string;
  content: string;
  header: ParsedHeader | null;
  formHeader: ParsedFormHeader | null;
}): CorpusDoc {
  const { docType, filePath, fileHash, content, header, formHeader } = args;
  const fallback = inferFromFilename(filePath);

  const id =
    (docType === 'form' ? formHeader?.id : header?.id) ??
    fallback.id;

  const title =
    (docType === 'form' ? formHeader?.title : header?.title) ??
    path.basename(filePath);

  const domainRaw =
    (docType === 'form' ? formHeader?.domain : header?.domain) ??
    fallback.domain;
  const domain = normalizeDomainCode(domainRaw);

  const subdomain = docType === 'policy'
    ? normalizeSubdomainCode(header?.subdomain ?? null, id, fallback.subdomain)
    : fallback.subdomain || '';

  const ownerSteward =
    (docType === 'form' ? '' : header?.ownerSteward) ?? '';
  const reviewCycle =
    (docType === 'form' ? (formHeader?.frequency ?? '') : (header?.reviewCycle ?? '')) ||
    '';
  const accessTier =
    (docType === 'form' ? '' : header?.accessTier) ?? '';

  const description =
    (docType === 'form' ? formHeader?.purpose : header?.description) ?? '';

  const regulatoryTags = enrichRegTags(content);
  const sections = detectSections(content, docType);
  const linkedIds = Array.from(
    new Set([
      ...(formHeader?.linkedPolicies ?? []),
      ...harvestLinkedIds(content, id),
    ]),
  );

  return {
    id,
    title,
    type: docType,
    domain,
    subdomain,
    ownerSteward,
    reviewCycle,
    accessTier,
    regulatoryTags,
    sourcePath: filePath,
    sourceHash: fileHash,
    content,
    sections,
    linkedIds,
    description: description || undefined,
    version:
      (docType === 'form' ? formHeader?.version : header?.version) ?? undefined,
    effectiveDate:
      (docType === 'form' ? formHeader?.effectiveDate : header?.effectiveDate) ??
      undefined,
    nextReviewDate:
      (docType === 'form' ? formHeader?.nextReviewDate : header?.nextReviewDate) ??
      undefined,
  };
}

function normalizeDomainCode(raw: string | null): string {
  if (!raw) return 'EN';
  // "GV — Governance" / "HR" / "HR Policy"
  const m = raw.match(/^([A-Z]{2})\b/);
  if (m) return m[1];
  for (const code of Object.keys(DOMAIN_NAMES)) {
    if (new RegExp(`\\b${DOMAIN_NAMES[code]}\\b`, 'i').test(raw)) return code;
  }
  return 'EN';
}

function normalizeSubdomainCode(
  raw: string | null,
  policyId: string,
  fallback: string,
): string {
  if (raw) {
    const m = raw.match(/^([A-Z]{2,3})\b/);
    if (m) return m[1];
  }
  // Derive from policy ID (XX-YY-###).
  const idMatch = policyId.match(/^[A-Z]{2}-([A-Z]{2,3})-/);
  if (idMatch) return idMatch[1];
  return fallback;
}
