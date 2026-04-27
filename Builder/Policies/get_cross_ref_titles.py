"""Extract titles for cross-ref-only policy IDs from ALL_POLICIES.md cross-reference tables."""
import re

with open('Builder/Policies/ALL_POLICIES.md', encoding='utf-8') as f:
    txt = f.read()

cross_ref_ids = [
    'CL-CD-002','CL-CD-003','CL-CD-004',
    'CL-PR-001','CL-PR-002','CL-PR-003','CL-PR-004',
    'HR-ER-006','HR-ER-009',
    'HR-JD-000','HR-JD-001','HR-JD-002','HR-JD-003','HR-JD-004','HR-JD-007','HR-JD-011',
    'HR-WM-001','HR-WM-002','HR-WM-003','HR-WM-004','HR-WM-005','HR-WM-006','HR-WM-007',
    'RM-EP-002','RM-EP-003',
    'RM-OS-101',
]

results = {}
for pid in cross_ref_ids:
    # Look for table rows like | RM-EP-002 | Title | description |
    patterns = [
        re.compile(r'\|\s*' + re.escape(pid) + r'\s*\|\s*(.+?)\s*\|'),
        re.compile(re.escape(pid) + r'\s*[—ù]\s*([^\n|]+)'),
        re.compile(re.escape(pid) + r':\s*([^\n|,;.]+)'),
    ]
    found = None
    for pat in patterns:
        m = pat.search(txt)
        if m:
            title = m.group(1).strip()
            # Filter out things that look like descriptions not titles
            if len(title) < 100 and not title.startswith('|'):
                found = title
                break
    results[pid] = found or 'TITLE NOT FOUND'

for pid, title in results.items():
    print(pid + ' | ' + title)
