#!/usr/bin/env python3
"""Accurate per-tab coverage diagnostic — uses the same mapOrderToTab logic
the renderer uses, and counts only NON-EMPTY sections (matches what users
see after the empty-parent-skip filter).
"""
import re, os
GEN = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'policy', 'data', 'allPoliciesContent.generated.ts')
text = open(GEN, encoding='utf-8').read()

blocks = re.split(r'^  // ([A-Z]{2}-[A-Z]{2}-\d{3}) — (.+)$', text, flags=re.MULTILINE)

def map_order(o):
    if o == 1: return 'skip'
    if 2 <= o <= 6: return 'overview'
    if 7 <= o <= 18: return 'procedures'
    if o == 19: return 'documentation'
    if 20 <= o <= 23: return 'compliance'
    if 24 <= o <= 30: return 'references'
    return 'appendices'

SECTION_RE = re.compile(
    r'\{\s*id:\s*"[^"]+",\s*title:\s*"([^"]*)",\s*level:\s*(\d+),\s*order:\s*(\d+),\s*body:\s*"((?:\\.|[^"\\])*)"',
    re.S,
)

results = []
for i in range(1, len(blocks), 3):
    pid = blocks[i]; title = blocks[i+1]; body = blocks[i+2]
    secs = []
    for m in SECTION_RE.finditer(body):
        secs.append({'order': int(m.group(3)), 'body': m.group(4)})
    tab_real = {}
    for s in secs:
        t = map_order(s['order'])
        if t == 'skip':
            continue
        b = s['body'].strip()
        if b and b != '---':
            tab_real[t] = tab_real.get(t, 0) + 1
        else:
            tab_real.setdefault(t, 0)
    results.append({'id': pid, 'title': title, 'tabs': tab_real, 'total': len(secs)})

print(f'Total policies: {len(results)}\n')

no_proc = [r for r in results if r['tabs'].get('procedures', 0) == 0]
print(f'Policies with EMPTY Procedures tab: {len(no_proc)}')
for r in no_proc:
    print(f'  {r["id"]}  total={r["total"]}  tabs={r["tabs"]}')

no_comp = [r for r in results if r['tabs'].get('compliance', 0) == 0]
print(f'\nPolicies with EMPTY Compliance tab: {len(no_comp)}')
for r in no_comp[:25]:
    print(f'  {r["id"]}  total={r["total"]}')
if len(no_comp) > 25: print(f'  ... +{len(no_comp)-25} more')

no_ref = [r for r in results if r['tabs'].get('references', 0) == 0]
print(f'\nPolicies with EMPTY References tab: {len(no_ref)}')
for r in no_ref[:25]:
    print(f'  {r["id"]}  total={r["total"]}')
if len(no_ref) > 25: print(f'  ... +{len(no_ref)-25} more')

from collections import Counter
print('\nNon-empty Procedures-tab section counts:')
dist = Counter(r['tabs'].get('procedures', 0) for r in results)
for n in sorted(dist):
    print(f'  {n:3} : {dist[n]} policies')
