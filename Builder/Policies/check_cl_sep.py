import os, re

# Find CL file
for f in os.listdir('Builder/Policies/extracted_full/'):
    if 'CL' in f and 'DOMAIN' in f:
        cl_fname = f
        break

with open('Builder/Policies/extracted_full/' + cl_fname, encoding='utf-8') as fh:
    lines = fh.readlines()

H2_POLICY_C = re.compile(r'^## ([A-Z]{2}-[A-Z]{2}-\d{3}) \u2014 (.+)$')
H2_POLICY_D = re.compile(r'^## POLICY:\s+([A-Z]{2}-[A-Z]{2}-\d{3})\s+[\u00f9\u2014]\s+(.+)$')

# Check first few ## headings
count_c = 0
count_d = 0
no_match = 0
for l in lines:
    if l.startswith('## ') and re.match(r'^## [A-Z]{2}-', l):
        mc = H2_POLICY_C.match(l.rstrip())
        md = H2_POLICY_D.match(l.rstrip())
        if mc:
            count_c += 1
        elif md:
            count_d += 1
        else:
            no_match += 1
            print('NO MATCH:', repr(l.rstrip()[:80]))

print(f'Matched H2_POLICY_C: {count_c}')
print(f'Matched H2_POLICY_D: {count_d}')
print(f'No match: {no_match}')

# Check specific separator char in first policy heading
for l in lines:
    if l.startswith('## CL-CP-001'):
        print('Separator char: ' + repr(l[11]))
        break
