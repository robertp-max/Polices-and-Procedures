"""Fix H1 headings for RM-SS-003 and RM-PS-001-005 so the generator picks them up."""

with open('Builder/Policies/ALL_POLICIES.md', encoding='utf-8') as f:
    txt = f.read()

fixes = [
    ('## POLICY: RM-SS-003 — Motor Vehicle Safety & Accident Reporting',
     '# POLICY: RM-SS-003 — Motor Vehicle Safety & Accident Reporting'),
    ('## SUBDOMAIN: RM-PS — PATIENT & ENVIRONMENTAL SAFETY\n## POLICY: RM-PS-001 — Environmental Safety Assessment',
     '## SUBDOMAIN: RM-PS — PATIENT & ENVIRONMENTAL SAFETY\n# POLICY: RM-PS-001 — Environmental Safety Assessment'),
    ('## POLICY: RM-PS-002 — Hazardous Materials & Waste Management',
     '# POLICY: RM-PS-002 — Hazardous Materials & Waste Management'),
    ('## POLICY: RM-PS-003 — Product & Equipment Safety Recall Management',
     '# POLICY: RM-PS-003 — Product & Equipment Safety Recall Management'),
    ('## POLICY: RM-PS-004 — Patient Elopement & Wandering Risk',
     '# POLICY: RM-PS-004 — Patient Elopement & Wandering Risk'),
    ('## POLICY: RM-PS-005 — High-Risk Medication Safety',
     '# POLICY: RM-PS-005 — High-Risk Medication Safety'),
]

for old, new in fixes:
    if old in txt:
        txt = txt.replace(old, new, 1)
        print('FIXED: ' + old[:60])
    else:
        print('NOT FOUND: ' + old[:60])

with open('Builder/Policies/ALL_POLICIES.md', 'w', encoding='utf-8') as f:
    f.write(txt)
print('Done.')
