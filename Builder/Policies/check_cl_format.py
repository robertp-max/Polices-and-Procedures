with open('Builder/Policies/extracted_full/DOMAIN\u2014 CL \u2014 Clinical Operations (6).md', encoding='utf-8') as f:
    lines = f.readlines()
print('Total lines:', len(lines))
for i in range(40):
    print(str(i+1) + ': ' + lines[i].rstrip())
