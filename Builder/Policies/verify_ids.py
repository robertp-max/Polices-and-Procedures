import re
with open('src/policy/data/allPoliciesContent.generated.ts', encoding='utf-8') as f:
    txt = f.read()
ids = re.findall(r'policyId:\s*"([A-Z]{2}-[A-Z]{2}-\d{3})"', txt)
print('Total:', len(ids))
for pid in ['RM-PS-001','RM-PS-002','RM-PS-003','RM-PS-004','RM-PS-005','RM-SS-003']:
    print(pid + ': ' + ('YES' if pid in ids else 'MISSING'))
