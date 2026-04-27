import re, os

# What's in the generated TS app
with open('src/policy/data/allPoliciesContent.generated.ts', encoding='utf-8') as f:
    ts = f.read()
app_ids = set(re.findall(r'policyId:\s*"([A-Z]{2,3}-[A-Z]{2,3}-\d{3})"', ts))

# What's in ALL_POLICIES.md (table + heading)
with open('Builder/Policies/ALL_POLICIES.md', encoding='utf-8') as f:
    src = f.read()
table_ids = set(re.findall(r'\|\s*Policy ID\s*\|\s*([A-Z]{2,3}-[A-Z]{2,3}-\d{3})', src))
heading_ids = set(re.findall(r'^#\s+(?:POLICY\s+)?([A-Z]{2,3}-[A-Z]{2,3}-\d{3})\b', src, re.MULTILINE))
source_ids = table_ids | heading_ids

print(f'App IDs:    {len(app_ids)}')
print(f'Source IDs (ALL_POLICIES.md): {len(source_ids)}')

missing_from_app = sorted(source_ids - app_ids)
extra_in_app = sorted(app_ids - source_ids)
all_in_text = set(re.findall(r'\b([A-Z]{2,3}-[A-Z]{2,3}-\d{3})\b', src))
cross_ref_only = sorted(all_in_text - source_ids)

print(f'\nMissing from APP (in source, not in app): {len(missing_from_app)}')
for i in missing_from_app:
    print(f'  {i}')

print(f'\nExtra in APP (not in ALL_POLICIES.md as full policy): {len(extra_in_app)}')
for i in extra_in_app:
    print(f'  {i}')

print(f'\nReferenced in ALL_POLICIES.md text only (no full content written): {len(cross_ref_only)}')
for i in cross_ref_only:
    print(f'  {i}')

print(f'\nSummary: Source={len(source_ids)}, App={len(app_ids)}, Cross-ref-only={len(cross_ref_only)}, Total mentioned in source={len(source_ids)+len(cross_ref_only)}')


# What's in ALL_POLICIES.md (table + heading)
with open('Builder/Policies/ALL_POLICIES.md', encoding='utf-8') as f:
    src = f.read()
table_ids = set(re.findall(r'\|\s*Policy ID\s*\|\s*([A-Z]{2,3}-[A-Z]{2,3}-\d{3})', src))
heading_ids = set(re.findall(r'^#\s+(?:POLICY\s+)?([A-Z]{2,3}-[A-Z]{2,3}-\d{3})\b', src, re.MULTILINE))
source_ids = table_ids | heading_ids

print(f'App IDs:    {len(app_ids)}')
print(f'Source IDs (ALL_POLICIES.md): {len(source_ids)}')
missing_from_app = sorted(source_ids - app_ids)
extra_in_app = sorted(app_ids - source_ids)
print(f'Missing from APP: {missing_from_app}')
print(f'Extra in APP:     {extra_in_app}')

# IDs referenced in source but with no full policy content
all_in_text = set(re.findall(r'\b([A-Z]{2,3}-[A-Z]{2,3}-\d{3})\b', src))
cross_ref_only = sorted(all_in_text - source_ids)
print(f'\nReferenced in text only (no policy content in ALL_POLICIES.md): {cross_ref_only}')

# Check individual Builder/*.md files for policies not in ALL_POLICIES.md
print()
print('=== Separate .md files in Builder/ with policy content ===')
for root, dirs, files in os.walk('Builder'):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.git']]
    for fn in files:
        if fn.endswith('.md') and fn != 'ALL_POLICIES.md':
            path = os.path.join(root, fn)
            try:
                with open(path, encoding='utf-8', errors='ignore') as f:
                    txt = f.read()
                ids = set(re.findall(r'\|\s*Policy ID\s*\|\s*([A-Z]{2,3}-[A-Z]{2,3}-\d{3})', txt))
                h_ids = set(re.findall(r'^#\s+(?:POLICY\s+)?([A-Z]{2,3}-[A-Z]{2,3}-\d{3})\b', txt, re.MULTILINE))
                all_f = ids | h_ids
                if all_f:
                    new = sorted(all_f - source_ids)
                    in_src = sorted(all_f & source_ids)
                    print(f'  {path}')
                    print(f'    IDs in file: {sorted(all_f)}')
                    print(f'    NEW (not in ALL_POLICIES): {new}')
            except Exception as e:
                print(f'  ERROR {path}: {e}')
