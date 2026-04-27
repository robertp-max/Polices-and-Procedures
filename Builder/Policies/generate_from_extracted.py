#!/usr/bin/env python3
"""
Parse extracted_full/*.md files to generate allPoliciesContent.generated.ts
with REAL full policy content from the source docx extractions.

Handles all format variants found in the extracted files:
  Format A: ## XX-XX-NNN — Title        (H2 with ID, subsections at ###)
  Format B: ## 1. Policy Header         (H2 section numbers, GV file style)
  Format C: # XX-XX-NNN — Title         (H1 with ID, sections at ##)
            # POLICY: XX-XX-NNN — Title
            # IT-SC-001: Title
            # POLICY XX-XX-NNN — Title

Section title keyword -> order mapping (format-agnostic):
  policy header      -> 2  (overview)
  purpose            -> 3  (overview)
  scope              -> 4  (overview)
  policy statement   -> 5  (overview)
  definitions        -> 6  (overview)
  procedures         -> 7  (procedures, subsections 8-18)
  documentation      -> 19 (documentation)
  compliance / audit -> 20 (compliance)
  references         -> 24 (references)
  training           -> 29 (admin)
  version / acknowledgment -> 30 (admin)
  appendices         -> 31 (appendices)

Tab order mapping (PolicyDetailPage.tsx getTabId):
  order 1      -> __skip__ (title/cover)
  order 2-6    -> overview
  order 7-18   -> procedures
  order 19     -> documentation
  order 20-23  -> compliance
  order 24-28  -> references
  order 29-30  -> admin
  order 31+    -> appendices
"""

import re
import os
import json as _json

EXTRACTED_DIR = os.path.join(os.path.dirname(__file__), 'extracted_full')
OUTPUT_TS = os.path.join(os.path.dirname(__file__),
                         '..', '..', 'src', 'policy', 'data',
                         'allPoliciesContent.generated.ts')

POLICY_ID_RE = re.compile(r'\|\s*Policy ID\s*\|\s*([A-Z]{2}-[A-Z]{2}-\d{3})[^|]*\|')
POLICY_TITLE_RE = re.compile(r'\|\s*Policy Title\s*\|\s*(.+?)\s*\|')

# Policy boundary patterns
H1_POLICY_A = re.compile(r'^# ([A-Z]{2}-[A-Z]{2}-\d{3})[: —]+(.+)$')
H1_POLICY_B = re.compile(r'^# POLICY:?\s+([A-Z]{2}-[A-Z]{2}-\d{3})[: —]+(.+)$')
H2_POLICY_C = re.compile(r'^## ([A-Z]{2}-[A-Z]{2}-\d{3}) — (.+)$')
# Format D: ## POLICY: XX-XX-NNN ù/— Title  (ù = U+00F9 encoding artifact for em-dash)
H2_POLICY_D = re.compile(r'^## POLICY:\s+([A-Z]{2}-[A-Z]{2}-\d{3})\s+[\u00f9\u2014]\s+(.+)$')
H2_SECTION1 = re.compile(r'^## 1\. Policy Header', re.IGNORECASE)

# Section heading patterns (used inside policy blocks)
SECTION_ANY_H2 = re.compile(r'^## (\d+(?:\.\d+)?)\. (.+)$')
SECTION_ANY_H3 = re.compile(r'^### (\d+(?:\.\d+)?)\. (.+)$')
SECTION_UNNUMBERED_H2 = re.compile(r'^## (Policy Header|APPENDICES)$', re.IGNORECASE)
SECTION_UNNUMBERED_H3 = re.compile(r'^### (Policy Header|APPENDICES)$', re.IGNORECASE)

# Subsection patterns (within procedures)
SUBSEC_H3 = re.compile(r'^### (\d+\.\d+(?:\.\d+)?) (?:—\s*)?(.+)$')
SUBSEC_H4 = re.compile(r'^#### (\d+\.\d+(?:\.\d+)?) (?:—\s*)?(.+)$')

APPENDICES_ANY = re.compile(r'^#{1,4} APPENDICES', re.IGNORECASE)


def slugify(text: str) -> str:
    t = re.sub(r'[^a-z0-9\s-]', '', text.lower())
    t = re.sub(r'\s+', '-', t.strip())
    return t[:70]


def json_str(s: str) -> str:
    return _json.dumps(s, ensure_ascii=False)


def section_title_to_order(title: str, num: str = '') -> int:
    """Map a section title (and optional number) to an order integer."""
    tl = title.lower().strip()
    # By keyword
    if 'policy header' in tl:
        return 2
    if 'purpose' in tl:
        return 3
    if tl.startswith('scope'):
        return 4
    if 'policy statement' in tl:
        return 5
    if 'definition' in tl:
        return 6
    if 'procedure' in tl:
        return 7
    if 'documentation' in tl:
        return 19
    if 'compliance' in tl or 'audit' in tl or 'measurement' in tl:
        return 20
    if 'reference' in tl:
        return 24
    if 'training' in tl or 'acknowledgment' in tl:
        return 29
    if 'version' in tl:
        return 30
    if 'appendix' in tl or 'appendices' in tl:
        return 31
    # Fallback: try numeric
    if num:
        try:
            n = int(num.split('.')[0])
            # rough mapping from position
            num_map = {1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 19, 8: 20, 9: 24, 10: 29, 11: 30}
            return num_map.get(n, 31)
        except Exception:
            pass
    return 31


def fix_table_alignment(text: str) -> str:
    """Replace | --- | separators with | :---- | to match gold standard."""
    # Replace any | ---+ | alignment cells with | :---- |
    return re.sub(r'\|\s*-{2,}\s*(?=\|)', '| :---- ', text)


def collect_body(lines: list[str]) -> str:
    while lines and not lines[-1].strip():
        lines.pop()
    while lines and not lines[0].strip():
        lines.pop(0)
    body = '\n'.join(lines)
    body = fix_table_alignment(body)
    return body


def split_into_blocks(lines: list[str]) -> list[tuple[str, list[str]]]:
    """
    Split file into (fmt, lines) blocks.
    fmt: 'C1' (H1 boundary) | 'A' (## ID boundary) | 'B' (## 1. Policy Header boundary)
    """
    blocks: list[tuple[str, list[str]]] = []
    current: list[str] = []
    current_fmt: str | None = None

    for raw in lines:
        line = raw.rstrip('\n')

        # Format C: H1 level policy boundary
        m = H1_POLICY_B.match(line)
        if not m:
            m = H1_POLICY_A.match(line)
        if m:
            if current and current_fmt:
                blocks.append((current_fmt, current))
            current = [line]
            current_fmt = 'C'
            continue

        # Format A: ## XX-XX-NNN — Title
        m2 = H2_POLICY_C.match(line)
        if not m2:
            m2 = H2_POLICY_D.match(line)
        if m2:
            if current and current_fmt:
                blocks.append((current_fmt, current))
            current = [line]
            current_fmt = 'A'
            continue

        # Format B: ## 1. Policy Header
        m3 = H2_SECTION1.match(line)
        if m3:
            if current and current_fmt:
                blocks.append((current_fmt, current))
            current = [line]
            current_fmt = 'B'
            continue

        if current_fmt is not None:
            current.append(line)

    if current and current_fmt:
        blocks.append((current_fmt, current))

    return blocks


def extract_policy_id(block_lines: list[str], fmt: str = '') -> str | None:
    # For format C, try the H1 heading first (policies like HR-ER-002 have no Policy ID table)
    if fmt == 'C' and block_lines:
        first = block_lines[0].strip()
        for pat in (H1_POLICY_B, H1_POLICY_A):
            m = pat.match(first)
            if m:
                return m.group(1)
    # For format A, also try H2_POLICY_D heading (## POLICY: ID ù Title)
    if fmt == 'A' and block_lines:
        first = block_lines[0].strip()
        m = H2_POLICY_D.match(first)
        if m:
            return m.group(1)
    # Search Policy ID table row (handles trailing __ corruption)
    for line in block_lines[:50]:
        m = POLICY_ID_RE.match(line.strip())
        if m:
            return m.group(1)
    return None


def extract_policy_title(block_lines: list[str], fmt: str) -> str | None:
    if fmt in ('A', 'C'):
        first = block_lines[0].strip()
        for pat in (H1_POLICY_B, H1_POLICY_A, H2_POLICY_C, H2_POLICY_D):
            m = pat.match(first)
            if m:
                return m.group(2).strip()
    for line in block_lines[:50]:
        m = POLICY_TITLE_RE.match(line.strip())
        if m:
            return m.group(1).strip()
    return None


def parse_block(fmt: str, block_lines: list[str]) -> dict | None:
    policy_id = extract_policy_id(block_lines, fmt)
    if not policy_id:
        return None
    title = extract_policy_title(block_lines, fmt) or policy_id

    sections: list[dict] = [{
        'id': f'1-{slugify(title)}',
        'title': title,
        'level': 1,
        'order': 1,
        'body': '---',
        'scormChunkHint': 'module',
    }]

    # Determine heading level for top-level sections inside this block
    if fmt == 'A':
        top_sec_re = SECTION_ANY_H3
        top_unnumbered_re = SECTION_UNNUMBERED_H3
        sub_res = [SUBSEC_H4]
        start = 1
    elif fmt == 'B':
        top_sec_re = SECTION_ANY_H2
        top_unnumbered_re = SECTION_UNNUMBERED_H2
        sub_res = [SUBSEC_H3]
        start = 0
    else:  # fmt == 'C'
        top_sec_re = SECTION_ANY_H2
        top_unnumbered_re = SECTION_UNNUMBERED_H2
        sub_res = [SUBSEC_H3]
        start = 1  # skip the # POLICY-ID line

    cur_title: str | None = None
    cur_order: int = 0
    cur_level: int = 2
    cur_id: str = ''
    cur_hint: str = 'module'
    cur_body: list[str] = []
    proc_sub_order = 8
    in_procedures = False

    def flush():
        nonlocal cur_title, cur_order, cur_level, cur_id, cur_hint, cur_body
        if cur_title is not None:
            sections.append({
                'id': cur_id,
                'title': cur_title,
                'level': cur_level,
                'order': cur_order,
                'body': collect_body(list(cur_body)),
                'scormChunkHint': cur_hint,
            })
        cur_title = None
        cur_body = []

    for raw_line in block_lines[start:]:
        line = raw_line.rstrip('\n')
        stripped = line.strip()

        # APPENDICES
        if APPENDICES_ANY.match(stripped):
            flush()
            cur_title = 'APPENDICES'
            cur_order = 31
            cur_level = 2
            cur_id = '31-appendices'
            cur_hint = 'module'
            cur_body = []
            in_procedures = False
            continue

        # Unnumbered top-level section (e.g. ## Policy Header)
        mu = top_unnumbered_re.match(stripped)
        if mu:
            flush()
            sec_title_raw = mu.group(1).strip()
            order = section_title_to_order(sec_title_raw)
            in_procedures = (order == 7)
            if in_procedures:
                proc_sub_order = 8
            cur_title = sec_title_raw
            cur_order = order
            cur_level = 2
            cur_id = f'{order}-{slugify(sec_title_raw)}'
            cur_hint = 'module'
            cur_body = []
            continue

        # Numbered top-level section
        mt = top_sec_re.match(stripped)
        if mt:
            flush()
            sec_num = mt.group(1)
            sec_title_raw = mt.group(2).strip()
            order = section_title_to_order(sec_title_raw, sec_num)
            in_procedures = (order == 7)
            if in_procedures:
                proc_sub_order = 8
            cur_title = f'{sec_num}\\. {sec_title_raw}'
            cur_order = order
            cur_level = 2
            cur_id = f'{order}-{slugify(sec_title_raw)}'
            cur_hint = 'module'
            cur_body = []
            continue

        # Subsection heading (within procedures/compliance/etc range)
        # Special case: continuation blocks start with subsections before any ## heading;
        # auto-init the parent Procedures section when cur_order is still 0.
        for sub_re in sub_res:
            ms = sub_re.match(stripped)
            if ms:
                if cur_order == 0:
                    try:
                        parent_n = int(ms.group(1).split('.')[0])
                    except ValueError:
                        parent_n = 0
                    if parent_n == 6:
                        flush()
                        cur_title = '6\\. Procedures'
                        cur_order = 7
                        cur_level = 2
                        cur_id = '7-procedures'
                        cur_hint = 'module'
                        cur_body = []
                        in_procedures = True
                        proc_sub_order = 8
                if cur_order is not None and 7 <= cur_order <= 23:
                    flush()
                    sub_title_raw = ms.group(2).strip()
                    order = proc_sub_order
                    proc_sub_order = min(proc_sub_order + 1, 18)
                    cur_title = sub_title_raw
                    cur_order = order
                    cur_level = 3
                    cur_id = f'{order}-{slugify(sub_title_raw)}'
                    cur_hint = 'lesson'
                    cur_body = []
                break  # only one sub_re per format; avoid double-processing
        else:
            # No subsection match — add to current section body
            if cur_title is not None:
                cur_body.append(line)
            continue

        if cur_title is not None and cur_order is not None and not (7 <= cur_order <= 23):
            # subsec matched but we're not in a procedure range — treat as body
            cur_body.append(line)

    flush()
    return {'policyId': policy_id, 'title': title, 'sections': sections}


def build_ts_entry(policy: dict) -> str:
    lines = [
        f'  // {policy["policyId"]} — {policy["title"]}',
        f'  {{',
        f'    policyId: {json_str(policy["policyId"])},',
        f'    sourceType: "markdown",',
        f'    sourceRef: "extracted_full",',
        f'    sections: [',
    ]
    for sec in policy['sections']:
        # Append \n\n--- separator to body (gold standard GV-GB-001 style)
        body_with_sep = sec['body'] + '\n\n---' if sec['body'] and sec['body'] != '---' else sec['body']
        lines += [
            f'      {{',
            f'        id: {json_str(sec["id"])},',
            f'        title: {json_str(sec["title"])},',
            f'        level: {sec["level"]},',
            f'        order: {sec["order"]},',
            f'        body: {json_str(body_with_sep)},',
            f'        scormChunkHint: {json_str(sec["scormChunkHint"])},',
            f'      }},',
        ]
    lines += ['    ],', '  },']
    return '\n'.join(lines)


def main():
    source_files = [
        'HOME HEALTH AGENCY ENTERPRISE POLICY TAXONOMY & CLASSIFICATION FRAMEWORK.md',
        'additional PPs.md',
        'EN — ENTERPRISE CONTROL DOMAIN_ COMPLETE POLICY SUITE.md',
        'Governing Body Authority & Responsibilities (3).md',
        'HR Policy.md',
        'IT Domain Policy Development — Complete Enterprise Package.md',
        'RM — RISK MANAGEMENT & SAFETY DOMAIN (2).md',
        'QA.md',
        'OP — OPERATIONS DOMAIN_ COMPLETE POLICY MANUAL.md',
        'FN-BC-001 — Medicare Billing & Claims Submission.md',
        'CO-CP-001 — Corporate Compliance Program.md',
        'DOMAIN_ CL — Clinical Operations (6).md',
        'CL-OA-006 — Documentation Hierarchy and Evidence Source Prioritization (1).md',
    ]

    # Approved individual .md files (highest priority — override anything)
    builder_dir = os.path.dirname(os.path.dirname(__file__))  # Builder/
    approved_names = [
        'CO-CA-001.md', 'EN-CM-001.md', 'EN-LC-001.md', 'EN-TG-001.md',
        'RM-EP-001.md', 'RM-OS-001.md', 'RM-OS-002.md', 'RM-OS-003.md', 'RM-OS-004.md',
    ]
    approved_files = [os.path.join(builder_dir, f) for f in approved_names
                      if os.path.exists(os.path.join(builder_dir, f))]

    all_policies: dict[str, dict] = {}

    for fname in source_files:
        fpath = os.path.join(EXTRACTED_DIR, fname)
        if not os.path.exists(fpath):
            print(f'  [SKIP] {fname}')
            continue
        print(f'  Parsing {fname}...')
        with open(fpath, encoding='utf-8') as f:
            lines = f.readlines()
        blocks = split_into_blocks(lines)
        found = 0
        for fmt, blk in blocks:
            pol = parse_block(fmt, blk)
            if pol:
                pid = pol['policyId']
                if pid in all_policies:
                    # Merge sections — duplicate ID means split content in source file
                    # Use ID-based dedup (not order) so continuation subsections aren't skipped
                    existing_ids = {s['id'] for s in all_policies[pid]['sections']}
                    new_secs = [s for s in pol['sections'] if s['id'] not in existing_ids]
                    if new_secs:
                        all_policies[pid]['sections'].extend(new_secs)
                        # Re-sort by order then id for stable ordering
                        all_policies[pid]['sections'].sort(key=lambda s: (s['order'], s['id']))
                else:
                    all_policies[pid] = pol
                found += 1
        print(f'    -> {found} policies found')

    for fpath in approved_files:
        fname = os.path.basename(fpath)
        print(f'  Approved: {fname}...')
        with open(fpath, encoding='utf-8') as f:
            lines = f.readlines()
        blocks = split_into_blocks(lines)
        for fmt, blk in blocks:
            pol = parse_block(fmt, blk)
            if pol:
                all_policies[pol['policyId']] = pol
                print(f'    -> {pol["policyId"]}')

    # ── BACKFILL from Builder/Policies/ALL_POLICIES.md ──────────
    # Master concatenation file. Use to:
    #   (a) ADD policies that the per-domain extracted_full files missed
    #   (b) BACKFILL sections (esp. Procedures) for sparse policies (<8 secs)
    # Never overwrites an existing rich policy or an approved override.
    POLICIES_DIR = os.path.dirname(__file__)
    master_file = os.path.join(POLICIES_DIR, 'ALL_POLICIES.md')
    if os.path.exists(master_file):
        print(f'  Backfill: ALL_POLICIES.md...')
        with open(master_file, encoding='utf-8') as f:
            lines = f.readlines()
        blocks = split_into_blocks(lines)
        added, backfilled = 0, 0
        approved_ids = set()
        for fpath in approved_files:
            with open(fpath, encoding='utf-8') as f:
                approved_ids.update(re.findall(r'([A-Z]{2}-[A-Z]{2}-\d{3})', f.read()))
        for fmt, blk in blocks:
            pol = parse_block(fmt, blk)
            if not pol:
                continue
            pid = pol['policyId']
            if pid in approved_ids:
                continue  # never overwrite approved files
            if pid not in all_policies:
                all_policies[pid] = pol
                added += 1
            else:
                # Sparse policy — try to backfill missing sections from master.
                existing = all_policies[pid]
                if len(existing['sections']) < 8:
                    existing_ids = {s['id'] for s in existing['sections']}
                    new_secs = [s for s in pol['sections'] if s['id'] not in existing_ids]
                    if new_secs:
                        existing['sections'].extend(new_secs)
                        existing['sections'].sort(key=lambda s: (s['order'], s['id']))
                        backfilled += 1
        print(f'    -> added {added} new policies, backfilled {backfilled} sparse policies')

    # GV-GB-001 has its own specialized view — exclude
    all_policies.pop('GV-GB-001', None)

    sorted_ids = sorted(all_policies.keys())
    print(f'\nTotal unique policies: {len(sorted_ids)}')
    # Debug: show any with very few sections
    for pid in sorted_ids:
        pol = all_policies[pid]
        n = len(pol['sections'])
        if n < 3:
            print(f'  [WARN] {pid} only {n} sections')

    ts_lines = [
        '/* Auto-generated by Builder/Policies/generate_from_extracted.py */',
        '/* DO NOT EDIT — re-run the generator to update */',
        "import type { PolicyContent } from '../types';",
        '',
        'export const allPoliciesContent: PolicyContent[] = [',
    ]
    for pid in sorted_ids:
        ts_lines.append(build_ts_entry(all_policies[pid]))
    ts_lines += [
        '];',
        '',
        'export const allPoliciesContentMap = new Map<string, PolicyContent>(',
        '  allPoliciesContent.map(p => [p.policyId, p])',
        ');',
        '',
    ]

    output = '\n'.join(ts_lines)
    out_path = os.path.normpath(OUTPUT_TS)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(output)
    print(f'\nWrote {len(output):,} chars -> {out_path}')


if __name__ == '__main__':
    main()
