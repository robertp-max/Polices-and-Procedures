import re

fname = 'Builder/Policies/extracted_full/RM \u2014 RISK MANAGEMENT & SAFETY DOMAIN (2).md'
with open(fname, encoding='utf-8') as f:
    lines = f.readlines()

targets = ['RM-PS-001','RM-PS-002','RM-PS-003','RM-PS-004','RM-PS-005','RM-SS-003']
print(f'Total lines: {len(lines)}')
for i, line in enumerate(lines):
    for pid in targets:
        if pid in line:
            print(str(i+1) + ': ' + line.rstrip())
            break
