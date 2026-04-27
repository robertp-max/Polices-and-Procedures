import os
fname = None
for f in os.listdir('Builder/Policies/extracted_full/'):
    if 'CL' in f and 'DOMAIN' in f:
        fname = f
        print('Found:', repr(f))
        break
if fname:
    with open('Builder/Policies/extracted_full/' + fname, encoding='utf-8') as fh:
        lines = fh.readlines()
    print('Total lines:', len(lines))
    for i in range(40):
        print(str(i+1) + ': ' + lines[i].rstrip())
