import re

with open('Builder/Policies/ALL_POLICIES.md', encoding='utf-8') as f:
    lines = f.readlines()

targets = {'RM-PS-001','RM-PS-002','RM-PS-003','RM-PS-004','RM-PS-005','RM-SS-003'}
for i, line in enumerate(lines):
    for pid in list(targets):
        if pid in line and 'Policy ID' in line:
            targets.discard(pid)
            h1_line = None
            for j in range(i, -1, -1):
                if lines[j].startswith('# ') and not lines[j].startswith('## '):
                    h1_line = j
                    break
            h1_text = lines[h1_line].strip() if h1_line is not None else 'NOT FOUND'
            print(pid + ' at line ' + str(i+1) + ', prev H1 line ' + str((h1_line+1) if h1_line is not None else -1) + ':')
            print('  H1: ' + h1_text)
            # Print 4 lines before Policy ID table entry
            for k in range(max(0,i-4), min(len(lines),i+2)):
                print('  ' + str(k+1) + ': ' + lines[k].rstrip())
            print()
