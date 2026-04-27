"""
Compile ALL_POLICIES.md from the fully-extracted docx source files.
Produces a single, non-duplicated master policy document.
"""
import os

EXTRACTED_DIR = r'C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\Policies\extracted_full'
OUT_FILE = r'C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\Policies\ALL_POLICIES.md'

# Order: domain logical sequence
# File basenames (without .md) in compilation order
FILE_ORDER = [
    'Governing Body Authority & Responsibilities (3)',
    'EN — ENTERPRISE CONTROL DOMAIN_ COMPLETE POLICY SUITE',
    'CO-CP-001 — Corporate Compliance Program',
    'additional PPs',
    'CL-OA-006 — Documentation Hierarchy and Evidence Source Prioritization (1)',
    'DOMAIN_ CL — Clinical Operations (6)',
    'FN-BC-001 — Medicare Billing & Claims Submission',
    'HR Policy',
    'IT Domain Policy Development — Complete Enterprise Package',
    'OP — OPERATIONS DOMAIN_ COMPLETE POLICY MANUAL',
    'QA',
    'RM — RISK MANAGEMENT & SAFETY DOMAIN (2)',
    'HOME HEALTH AGENCY ENTERPRISE POLICY TAXONOMY & CLASSIFICATION FRAMEWORK',
]

DOMAIN_LABELS = {
    'Governing Body Authority & Responsibilities (3)':
        '# DOMAIN: GOVERNING BODY (GV)\n\n---\n',
    'EN — ENTERPRISE CONTROL DOMAIN_ COMPLETE POLICY SUITE':
        '\n\n---\n\n# DOMAIN: ENTERPRISE CONTROLS (EN)\n\n---\n',
    'CO-CP-001 — Corporate Compliance Program':
        '\n\n---\n\n# DOMAIN: CORPORATE COMPLIANCE (CO)\n\n---\n',
    'additional PPs':
        '\n\n---\n\n## COMPLIANCE SUPPLEMENTAL POLICIES (CO-101 SERIES)\n\n---\n',
    'CL-OA-006 — Documentation Hierarchy and Evidence Source Prioritization (1)':
        '\n\n---\n\n# DOMAIN: CLINICAL OPERATIONS (CL)\n\n---\n',
    'DOMAIN_ CL — Clinical Operations (6)':
        '\n\n---\n\n## CLINICAL OPERATIONS — COMPLETE POLICY SUITE\n\n---\n',
    'FN-BC-001 — Medicare Billing & Claims Submission':
        '\n\n---\n\n# DOMAIN: FINANCE & BILLING (FN)\n\n---\n',
    'HR Policy':
        '\n\n---\n\n# DOMAIN: HUMAN RESOURCES (HR)\n\n---\n',
    'IT Domain Policy Development — Complete Enterprise Package':
        '\n\n---\n\n# DOMAIN: INFORMATION TECHNOLOGY (IT)\n\n---\n',
    'OP — OPERATIONS DOMAIN_ COMPLETE POLICY MANUAL':
        '\n\n---\n\n# DOMAIN: OPERATIONS (OP)\n\n---\n',
    'QA':
        '\n\n---\n\n# DOMAIN: QUALITY ASSURANCE (QA)\n\n---\n',
    'RM — RISK MANAGEMENT & SAFETY DOMAIN (2)':
        '\n\n---\n\n# DOMAIN: RISK MANAGEMENT & SAFETY (RM)\n\n---\n',
    'HOME HEALTH AGENCY ENTERPRISE POLICY TAXONOMY & CLASSIFICATION FRAMEWORK':
        '\n\n---\n\n# ENTERPRISE POLICY TAXONOMY & CLASSIFICATION FRAMEWORK\n\n---\n',
}

def main():
    parts = []
    parts.append('# CARE INDEED HOME HEALTH CARE, INC.\n# ENTERPRISE POLICY LIBRARY\n\n')
    parts.append('> **Master Policy Document** — All domains compiled from authoritative source documents.\n')
    parts.append('> Generated: April 2026 | Reference Standard: GV-GB-001\n\n')
    parts.append('---\n\n')

    total_bytes = 0
    for basename in FILE_ORDER:
        md_path = os.path.join(EXTRACTED_DIR, basename + '.md')
        if not os.path.exists(md_path):
            print(f'WARNING: File not found: {md_path}')
            continue

        label = DOMAIN_LABELS.get(basename, f'\n\n---\n\n## {basename}\n\n---\n')
        parts.append(label)

        with open(md_path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
        
        parts.append('\n\n' + content + '\n')
        total_bytes += len(content)
        print(f'  Added: {basename} ({len(content):,} chars)')

    full_doc = '\n'.join(parts) if False else ''.join(parts)

    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        f.write(full_doc)

    out_size = os.path.getsize(OUT_FILE)
    print(f'\nDone! ALL_POLICIES.md written: {out_size:,} bytes ({out_size/1024/1024:.2f} MB)')
    print(f'Total source content: {total_bytes:,} chars')


if __name__ == '__main__':
    main()
