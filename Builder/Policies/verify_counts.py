import re
with open('src/policy/data/allPoliciesContent.generated.ts', encoding='utf-8') as f:
    txt = f.read()
ids = set(re.findall(r'policyId:\s*"([A-Z]{2,3}-[A-Z]{2,3}-\d{3})"', txt))
for pid in ['HR-JD-001','HR-JD-002','HR-JD-003','HR-JD-004','CL-PR-001','CL-CD-002','HR-WM-001']:
    print(pid + ': ' + ('IN APP' if pid in ids else 'NOT IN APP'))
print('Total IDs:', len(ids))

import re as re2
with open('Builder/Policies/ALL_POLICIES.md', encoding='utf-8') as f:
    src = f.read()
table_ids = set(re2.findall(r'\|\s*Policy ID\s*\|\s*([A-Z]{2,3}-[A-Z]{2,3}-\d{3})', src))
heading_ids = set(re2.findall(r'^#\s+(?:POLICY\s+)?([A-Z]{2,3}-[A-Z]{2,3}-\d{3})\b', src, re2.MULTILINE))
source_ids = table_ids | heading_ids
print('Source IDs in ALL_POLICIES.md:', len(source_ids))
print('HR-JD-001 in source_ids:', 'HR-JD-001' in source_ids)
print('HR-JD-001 in table_ids:', 'HR-JD-001' in table_ids)
print('HR-JD-001 in heading_ids:', 'HR-JD-001' in heading_ids)

# Extra in app (not in source)
extra = sorted(ids - source_ids)
missing = sorted(source_ids - ids)
print('Extra in app (not in source):', extra[:20])
print('Missing from app (in source):', missing[:10])
