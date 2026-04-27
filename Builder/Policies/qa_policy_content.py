#!/usr/bin/env python3
"""
QA script: Compare source .md character counts vs app-generated TypeScript content.
- Per-policy character count comparison (source text vs what the app renders)
- Flags any policy with >5% delta
- Word-by-word diff for flagged policies
- Reports format/header consistency vs GV-GB-001 gold standard
- Saves output to Builder/Policies/QA-REPORT-<timestamp>.md
"""

import re
import os
import json as _json
import difflib
from datetime import datetime

# ─── PATHS ──────────────────────────────────────────────────────────────────
BASE = os.path.dirname(os.path.abspath(__file__))
EXTRACTED_DIR = os.path.join(BASE, 'extracted_full')
GENERATED_TS = os.path.join(BASE, '..', '..', 'src', 'policy', 'data',
                             'allPoliciesContent.generated.ts')
SPECIMEN_TS  = os.path.join(BASE, '..', '..', 'src', 'policy', 'data',
                             'specimenContent.generated.ts')
OUTPUT_DIR   = BASE   # Builder/Policies/

THRESHOLD = 0.05   # 5% character count delta triggers word diff

# ─── GOLD STANDARD SECTION TITLES (from GV-GB-001) ──────────────────────────
GOLD_SECTION_TITLES = {
    2: '1\\. Policy Header',
    3: '2\\. Purpose',
    4: '3\\. Scope',
    5: '4\\. Policy Statement',
    6: '5\\. Definitions',
    7: '6\\. Procedures',
    19: '7\\. Documentation Requirements',
    20: '8\\. Compliance & Audit Considerations',
    24: '9\\. References',
    29: '10\\. Training & Acknowledgment Requirements',
    30: '11\\. Version Control',
    31: 'APPENDICES',
}

# Gold standard requires these sections at minimum
REQUIRED_ORDERS = {2, 3, 4, 5, 6, 7}

POLICY_ID_RE = re.compile(r'\|\s*Policy ID\s*\|\s*([A-Z]{2}-[A-Z]{2}-\d{3})[^|]*\|')

SOURCE_FILES = [
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

# ─── APPROVED INDIVIDUAL FILES ───────────────────────────────────────────────
APPROVED_DIR = os.path.dirname(BASE)   # Builder/
APPROVED_NAMES = [
    'CO-CA-001.md', 'EN-CM-001.md', 'EN-LC-001.md', 'EN-TG-001.md',
    'RM-EP-001.md', 'RM-OS-001.md', 'RM-OS-002.md', 'RM-OS-003.md', 'RM-OS-004.md',
]


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1: Extract raw policy text from source .md files
# ═══════════════════════════════════════════════════════════════════════════════

H1_POLICY_B = re.compile(r'^# ([A-Z]{2}-[A-Z]{2}-\d{3})[: —]+.+$')
H1_POLICY_C = re.compile(r'^# POLICY:?\s+([A-Z]{2}-[A-Z]{2}-\d{3})[: —]+.+$')
H2_POLICY_A = re.compile(r'^## ([A-Z]{2}-[A-Z]{2}-\d{3}) — .+$')
H2_SECTION1 = re.compile(r'^## 1\. Policy Header', re.IGNORECASE)


def is_policy_boundary(line: str) -> bool:
    return bool(H1_POLICY_B.match(line) or H1_POLICY_C.match(line)
                or H2_POLICY_A.match(line) or H2_SECTION1.match(line))


def extract_source_texts(file_lines: list[str]) -> dict[str, str]:
    """Split a source .md file into {policy_id: raw_text} blocks."""
    blocks: dict[str, list[str]] = {}
    current: list[str] = []
    cur_id: str | None = None

    def save():
        if cur_id and current:
            text = '\n'.join(current)
            # extract actual policy ID from content (header table)
            actual_id = None
            for ln in current[:50]:
                m = POLICY_ID_RE.match(ln.strip())
                if m:
                    actual_id = m.group(1)
                    break
            key = actual_id or cur_id
            blocks[key] = blocks.get(key, '') + text + '\n'

    for raw in file_lines:
        line = raw.rstrip('\n')
        if is_policy_boundary(line):
            save()
            current = [line]
            # Try to get ID from the heading itself
            for pat in (H1_POLICY_C, H1_POLICY_B, H2_POLICY_A):
                m = pat.match(line)
                if m:
                    cur_id = m.group(1)
                    break
            else:
                cur_id = '__pending__'
        elif cur_id is not None:
            current.append(line)

    save()
    return blocks


def load_all_source_texts() -> dict[str, str]:
    all_texts: dict[str, str] = {}
    for fname in SOURCE_FILES:
        fpath = os.path.join(EXTRACTED_DIR, fname)
        if not os.path.exists(fpath):
            continue
        with open(fpath, encoding='utf-8') as f:
            lines = f.readlines()
        blocks = extract_source_texts(lines)
        for pid, text in blocks.items():
            if pid and pid != '__pending__':
                all_texts[pid] = text   # later files override
    # Approved files override everything
    for fname in APPROVED_NAMES:
        fpath = os.path.join(APPROVED_DIR, fname)
        if not os.path.exists(fpath):
            continue
        with open(fpath, encoding='utf-8') as f:
            lines = f.readlines()
        blocks = extract_source_texts(lines)
        for pid, text in blocks.items():
            if pid:
                all_texts[pid] = text
    return all_texts


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 2: Extract policy content from generated TypeScript
# ═══════════════════════════════════════════════════════════════════════════════

TS_POLICY_ID_RE = re.compile(r'policyId:\s*"([^"]+)"')
TS_BODY_RE = re.compile(r'body:\s*("(?:[^"\\]|\\.)+")')
TS_TITLE_RE = re.compile(r'title:\s*("(?:[^"\\]|\\.)+")')
TS_ORDER_RE = re.compile(r'order:\s*(\d+)')
TS_LEVEL_RE = re.compile(r'level:\s*(\d+)')


def unescape_json_str(s: str) -> str:
    try:
        return _json.loads(s)
    except Exception:
        return s


def parse_generated_ts(filepath: str) -> dict[str, dict]:
    """
    Returns {policy_id: {sections: [{title, order, level, body}], raw_text: str}}
    """
    with open(filepath, encoding='utf-8') as f:
        content = f.read()

    # Split by policy entries (each starts with "  {" after a policyId comment)
    entries = re.split(r'\n  // [A-Z]{2}-[A-Z]{2}-\d{3}', content)

    policies: dict[str, dict] = {}
    for entry in entries[1:]:  # skip header
        pid_m = TS_POLICY_ID_RE.search(entry)
        if not pid_m:
            continue
        pid = pid_m.group(1)

        # Extract all sections from this entry
        # Sections are delimited by { ... } blocks inside sections: [...]
        sections_match = re.search(r'sections:\s*\[(.*?)\],\s*\}', entry, re.DOTALL)
        if not sections_match:
            continue

        sections_text = sections_match.group(1)
        sections = []
        # Parse individual section objects
        sec_blocks = re.split(r'\s*\},\s*\{', sections_text)
        for sb in sec_blocks:
            title_m = TS_TITLE_RE.search(sb)
            body_m = TS_BODY_RE.search(sb)
            order_m = TS_ORDER_RE.search(sb)
            level_m = TS_LEVEL_RE.search(sb)
            if not title_m:
                continue
            title = unescape_json_str(title_m.group(1))
            body = unescape_json_str(body_m.group(1)) if body_m else ''
            order = int(order_m.group(1)) if order_m else 0
            level = int(level_m.group(1)) if level_m else 2
            sections.append({
                'title': title,
                'order': order,
                'level': level,
                'body': body,
            })

        # Build the full rendered text (what a user sees)
        rendered = '\n\n'.join(
            f"{s['title']}\n{s['body']}"
            for s in sections if s['order'] != 1  # skip cover
        )
        policies[pid] = {
            'sections': sections,
            'rendered': rendered,
        }

    return policies


def load_specimen() -> dict:
    """Load GV-GB-001 from specimenContent.generated.ts."""
    with open(SPECIMEN_TS, encoding='utf-8') as f:
        content = f.read()
    sections = []
    sec_blocks = re.split(r'\s*\},?\s*\{', content)
    for sb in sec_blocks:
        title_m = TS_TITLE_RE.search(sb)
        body_m = TS_BODY_RE.search(sb)
        order_m = TS_ORDER_RE.search(sb)
        level_m = TS_LEVEL_RE.search(sb)
        if not title_m:
            continue
        title = unescape_json_str(title_m.group(1))
        body = unescape_json_str(body_m.group(1)) if body_m else ''
        order = int(order_m.group(1)) if order_m else 0
        level = int(level_m.group(1)) if level_m else 2
        sections.append({'title': title, 'order': order, 'level': level, 'body': body})
    rendered = '\n\n'.join(
        f"{s['title']}\n{s['body']}"
        for s in sections if s['order'] != 1
    )
    return {'sections': sections, 'rendered': rendered}


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 3: Word-level diff
# ═══════════════════════════════════════════════════════════════════════════════

def word_diff(source: str, app: str) -> tuple[list[str], list[str]]:
    """Returns (missing_words, added_words)."""
    src_words = re.split(r'\s+', source.strip())
    app_words = re.split(r'\s+', app.strip())
    sm = difflib.SequenceMatcher(None, src_words, app_words, autojunk=False)
    missing, added = [], []
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'delete':
            missing.extend(src_words[i1:i2])
        elif tag == 'insert':
            added.extend(app_words[j1:j2])
        elif tag == 'replace':
            missing.extend(src_words[i1:i2])
            added.extend(app_words[j1:j2])
    return missing, added


def format_word_list(words: list[str], max_words: int = 80) -> str:
    """Format a word list for display, truncating if too long."""
    if not words:
        return '*(none)*'
    chunks = []
    current = []
    for w in words[:max_words]:
        current.append(w)
        if len(' '.join(current)) > 200:
            chunks.append(' '.join(current))
            current = []
    if current:
        chunks.append(' '.join(current))
    result = '\n  > '.join(chunks)
    if len(words) > max_words:
        result += f'\n  ... ({len(words) - max_words} more words not shown)'
    return '  > ' + result


# ═══════════════════════════════════════════════════════════════════════════════
# STEP 4: Header/format consistency check vs GV-GB-001
# ═══════════════════════════════════════════════════════════════════════════════

def check_format_consistency(pid: str, sections: list[dict]) -> list[str]:
    """Check a policy's sections against GV-GB-001 gold standard format."""
    issues = []
    orders_present = {s['order'] for s in sections}
    
    # Check required sections exist
    for req in REQUIRED_ORDERS:
        if req not in orders_present:
            orders_present_list = sorted(orders_present - {1})
            sec_name = GOLD_SECTION_TITLES.get(req, f'order={req}')
            issues.append(f'MISSING required section: {sec_name}')
    
    for sec in sections:
        order = sec['order']
        title = sec['title']
        
        # Check title format matches gold standard
        expected_title = GOLD_SECTION_TITLES.get(order)
        if expected_title and sec['level'] == 2 and order not in (1, 31):
            if title != expected_title:
                issues.append(f'TITLE MISMATCH order={order}: got "{title}" expected "{expected_title}"')
        
        # Check body has content (not empty for non-procedures parent)
        if order in {3, 4, 5, 6} and (not sec['body'] or sec['body'].strip() == '---'):
            issues.append(f'EMPTY BODY in section order={order} ("{title}")')
        
        # Check table alignment style (gold uses :---- not ---)
        if sec['body'] and '| --- |' in sec['body'] and order not in (1,):
            issues.append(f'TABLE FORMAT: order={order} uses "| --- |" (gold standard uses "| :---- |")')
    
    return issues


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    ts_start = datetime.now()
    print('Loading source texts...')
    source_texts = load_all_source_texts()
    print(f'  {len(source_texts)} source policies found')

    print('Loading generated TypeScript...')
    generated = parse_generated_ts(os.path.normpath(GENERATED_TS))
    # Add GV-GB-001 from specimen
    generated['GV-GB-001'] = load_specimen()
    print(f'  {len(generated)} app policies found')

    # ── Build comparison table ─────────────────────────────────────────────
    all_ids = sorted(set(source_texts) | set(generated))
    
    results = []   # list of dicts
    flagged = []   # policy IDs with >5% delta
    missing_in_app = []
    missing_in_source = []

    # GV-GB-001 uses its own dedicated view (GVGBDetailView) — exclude from delta comparison
    SKIP_COMPARISON = {'GV-GB-001'}

    for pid in all_ids:
        if pid in SKIP_COMPARISON:
            continue
        src_text = source_texts.get(pid, '')
        app_data = generated.get(pid)
        app_text = app_data['rendered'] if app_data else ''

        src_chars = len(re.sub(r'\s+', '', src_text))   # non-whitespace chars
        app_chars = len(re.sub(r'\s+', '', app_text))

        if src_chars == 0 and app_chars == 0:
            continue
        if not src_text:
            missing_in_source.append(pid)
            delta_pct = None
        elif not app_text:
            missing_in_app.append(pid)
            delta_pct = -1.0
        else:
            delta_pct = (app_chars - src_chars) / src_chars if src_chars > 0 else 0.0

        fmt_issues = []
        if app_data:
            fmt_issues = check_format_consistency(pid, app_data['sections'])

        results.append({
            'pid': pid,
            'src_chars': src_chars,
            'app_chars': app_chars,
            'delta_pct': delta_pct,
            'fmt_issues': fmt_issues,
            'src_text': src_text,
            'app_text': app_text,
        })
        if delta_pct is not None and abs(delta_pct) > THRESHOLD:
            flagged.append(pid)

    # ── Generate markdown report ────────────────────────────────────────────
    ts_label = ts_start.strftime('%Y%m%d-%H%M%S')
    report_path = os.path.join(OUTPUT_DIR, f'QA-REPORT-{ts_label}.md')
    
    lines = []
    lines.append(f'# Policy Content QA Report')
    lines.append(f'**Generated:** {ts_start.strftime("%Y-%m-%d %H:%M:%S")}  ')
    lines.append(f'**Gold Standard:** GV-GB-001 (specimenContent.generated.ts)  ')
    lines.append(f'**Threshold:** >{THRESHOLD*100:.0f}% character delta triggers word diff  ')
    lines.append(f'**Source policies found:** {len(source_texts)}  ')
    lines.append(f'**App policies found:** {len(generated) - 1} (excl. GV-GB-001)  ')
    lines.append(f'**Flagged (>5% delta):** {len(flagged)}  ')
    lines.append('')

    # ── Summary table ───────────────────────────────────────────────────────
    lines.append('## Summary Table')
    lines.append('')
    lines.append('| Policy ID | Source Chars | App Chars | Delta % | Format Issues | Status |')
    lines.append('| :-------- | -----------: | --------: | ------: | :-----------: | :----- |')

    for r in results:
        pid = r['pid']
        sc = f"{r['src_chars']:,}" if r['src_chars'] else '—'
        ac = f"{r['app_chars']:,}" if r['app_chars'] else '—'
        dp = r['delta_pct']
        if dp is None:
            dp_str = 'N/A'
        elif dp == -1.0:
            dp_str = '**MISSING**'
        else:
            dp_str = f'{dp*100:+.1f}%'
        fi = str(len(r['fmt_issues'])) if r['fmt_issues'] else '0'
        
        if pid in missing_in_app:
            status = '❌ NOT IN APP'
        elif pid in missing_in_source:
            status = '⚠ NO SOURCE'
        elif abs(dp) > THRESHOLD:
            status = '🔴 >5% DELTA'
        elif len(r['fmt_issues']) > 0:
            status = '🟡 FMT ISSUES'
        else:
            status = '✅ OK'
        lines.append(f'| {pid} | {sc} | {ac} | {dp_str} | {fi} | {status} |')

    lines.append('')

    # ── Missing in app ───────────────────────────────────────────────────────
    if missing_in_app:
        lines.append('## Policies Missing from App')
        lines.append('')
        for pid in missing_in_app:
            lines.append(f'- **{pid}** — has source content but NOT in allPoliciesContent.generated.ts')
        lines.append('')

    # ── Missing source ───────────────────────────────────────────────────────
    if missing_in_source:
        lines.append('## Policies in App with No Matched Source')
        lines.append('')
        for pid in missing_in_source:
            lines.append(f'- **{pid}** — in app but no source .md found (may be from ALL_POLICIES.md)')
        lines.append('')

    # ── Format issues summary ─────────────────────────────────────────────────
    fmt_policies = [r for r in results if r['fmt_issues']]
    if fmt_policies:
        lines.append('## Format / Header Issues vs GV-GB-001 Gold Standard')
        lines.append('')
        lines.append('> Gold standard expects: section titles `1\\. Policy Header`, `2\\. Purpose`, etc.;')
        lines.append('> table alignment `| :---- |`; all required sections (orders 2-7) present.')
        lines.append('')
        for r in fmt_policies:
            pid = r['pid']
            lines.append(f'### {pid}')
            for issue in r['fmt_issues'][:20]:   # cap to avoid mega-report
                lines.append(f'- {issue}')
            if len(r['fmt_issues']) > 20:
                lines.append(f'- *...and {len(r["fmt_issues"]) - 20} more issues*')
            lines.append('')

    # ── Word diff for flagged policies ────────────────────────────────────────
    if flagged:
        lines.append('## Word-Level Diff for Flagged Policies (>5% Delta)')
        lines.append('')
        lines.append('> Only showing first 80 missing/added words per policy. Full source and app')
        lines.append('> texts are the non-whitespace character representations.')
        lines.append('')
        for pid in flagged:
            r = next(x for x in results if x['pid'] == pid)
            if r['delta_pct'] == -1.0:
                continue   # not in app, already covered
            missing_words, added_words = word_diff(r['src_text'], r['app_text'])
            src_c = r['src_chars']
            app_c = r['app_chars']
            dp = r['delta_pct'] * 100
            lines.append(f'### {pid} — Delta: {dp:+.1f}% ({src_c:,} src → {app_c:,} app)')
            lines.append('')
            lines.append(f'**Words in source NOT in app ({len(missing_words)} words):**')
            lines.append(format_word_list(missing_words))
            lines.append('')
            lines.append(f'**Words in app NOT in source ({len(added_words)} words):**')
            lines.append(format_word_list(added_words))
            lines.append('')
            # Show section-level breakdown
            if r.get('app_text') and r.get('src_text'):
                lines.append('**Section body char counts (app):**')
                if pid in generated:
                    for sec in generated[pid]['sections']:
                        bc = len(re.sub(r'\s+', '', sec['body']))
                        empty = ' *(EMPTY)*' if bc == 0 else ''
                        lines.append(f'- order={sec["order"]} level={sec["level"]} `{sec["title"]}` → {bc:,} chars{empty}')
                lines.append('')

    # ── Gold standard format spec ─────────────────────────────────────────────
    lines.append('## Gold Standard Format Reference (GV-GB-001)')
    lines.append('')
    lines.append('All policies should match this section structure:')
    lines.append('')
    lines.append('| Order | Level | Title | Tab | Required |')
    lines.append('| ----: | ----: | :---- | :-- | :------: |')
    lines.append('| 1 | 1 | `{Policy Title}` | (cover) | ✓ |')
    for order, title in GOLD_SECTION_TITLES.items():
        tab = {2:'Overview',3:'Overview',4:'Overview',5:'Overview',6:'Overview',
               7:'Procedures',19:'Documentation',20:'Compliance',24:'References',
               29:'Admin',30:'Admin',31:'Appendices'}.get(order, '?')
        req = '✓' if order in REQUIRED_ORDERS else '○'
        lines.append(f'| {order} | 2 | `{title}` | {tab} | {req} |')
    lines.append('')
    lines.append('**Table format:** `| :---- | :---- |` (left-align markers in header separator row)')
    lines.append('')
    lines.append('**Section body separator:** each section body ends with `\\n\\n---`')
    lines.append('')

    # ── Statistics ────────────────────────────────────────────────────────────
    total = len([r for r in results if r['delta_pct'] is not None and r['delta_pct'] != -1.0])
    ok = len([r for r in results if r['delta_pct'] is not None and r['delta_pct'] != -1.0 and abs(r['delta_pct']) <= THRESHOLD and not r['fmt_issues']])
    lines.append('## Statistics')
    lines.append('')
    lines.append(f'| Metric | Count |')
    lines.append(f'| :----- | ----: |')
    lines.append(f'| Total source policies | {len(source_texts)} |')
    lines.append(f'| Total app policies | {len(generated)} |')
    lines.append(f'| Policies compared | {total} |')
    lines.append(f'| ✅ OK (≤5% delta, no fmt issues) | {ok} |')
    lines.append(f'| 🔴 >5% delta | {len(flagged)} |')
    lines.append(f'| 🟡 Format issues only | {len([r for r in results if not r["fmt_issues"] == [] and (r["delta_pct"] is None or abs(r["delta_pct"]) <= THRESHOLD)])} |')
    lines.append(f'| ❌ Missing from app | {len(missing_in_app)} |')
    lines.append(f'| ⚠ No source found | {len(missing_in_source)} |')
    lines.append('')
    
    report_text = '\n'.join(lines)
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report_text)

    elapsed = (datetime.now() - ts_start).total_seconds()
    print(f'\nQA Report saved -> {report_path}')
    print(f'Elapsed: {elapsed:.1f}s')
    print(f'\nSummary:')
    print(f'  Source policies:  {len(source_texts)}')
    print(f'  App policies:     {len(generated)}')
    print(f'  Flagged (>5%):    {len(flagged)}')
    print(f'  Missing from app: {len(missing_in_app)}')
    print(f'  No source found:  {len(missing_in_source)}')

    # Print flagged list to terminal
    if flagged:
        print(f'\n[FLAGGED] Flagged policies (>5% delta):')
        for pid in flagged:
            r = next(x for x in results if x['pid'] == pid)
            dp = r['delta_pct'] * 100 if r['delta_pct'] is not None else 0
            print(f'  {pid}: {dp:+.1f}%  (src={r["src_chars"]:,} app={r["app_chars"]:,})')
    if missing_in_app:
        print(f'\n[MISSING] Missing from app:')
        for pid in missing_in_app:
            print(f'  {pid}')

    return results, flagged, missing_in_app


if __name__ == '__main__':
    main()
