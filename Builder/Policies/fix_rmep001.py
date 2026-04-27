"""
fix_rmep001.py
==============
Fixes two issues from inject_approved_policies.py run:
1. Removes the wrongly appended RM-EP-001 section at end of ALL_POLICIES.md
2. Replaces the actual '# POLICY: RM-EP-001' section with approved content
"""

import re
import os

POLICIES_DIR = os.path.dirname(__file__)
BUILDER_ROOT = os.path.join(POLICIES_DIR, "..")
ALL_POLICIES = os.path.join(POLICIES_DIR, "ALL_POLICIES.md")
APPROVED_FILE = os.path.join(BUILDER_ROOT, "RM-EP-001.md")


def read_file(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def format_content(policy_id, title, raw):
    raw = raw.strip()
    raw = re.sub(r"^#\s+.+", f"# {policy_id} — {title}", raw, count=1, flags=re.MULTILINE)
    raw = re.sub(r"^(# [^\n]+)\n\n---\n", r"\1\n\n", raw, count=1, flags=re.MULTILINE)
    return "\n" + raw.strip() + "\n"


def find_section_bounds(content, pattern):
    idx = content.find(pattern)
    if idx == -1:
        return None
    next_h1 = content.find("\n# ", idx + len(pattern))
    end = next_h1 if next_h1 != -1 else len(content)
    return (idx, end)


def main():
    content = read_file(ALL_POLICIES)
    print(f"File size: {len(content):,} bytes")

    # Load approved RM-EP-001
    raw = read_file(APPROVED_FILE)
    title_m = re.match(r"^#\s+(.+)", raw, re.MULTILINE)
    title = title_m.group(1).strip() if title_m else "Emergency Preparedness Program"
    approved_section = format_content("RM-EP-001", title, raw)
    print(f"Approved RM-EP-001: {len(approved_section):,} chars")

    # -----------------------------------------------------------------
    # Step 1: Remove the appended duplicate '# RM-EP-001 —' at the end
    # -----------------------------------------------------------------
    # The wrongly-appended section uses heading: "# RM-EP-001 — Emergency Preparedness Program"
    dup_pat = "\n# RM-EP-001 — Emergency Preparedness Program"
    dup_idx = content.rfind(dup_pat)  # rfind to get the LAST occurrence
    if dup_idx != -1:
        # Check there's another one earlier (the original we want to keep/replace)
        first_ep = content.find("RM-EP-001")
        if first_ep < dup_idx:
            # Remove from dup_idx to end of file (it was appended at end)
            bounds = find_section_bounds(content, content[dup_idx+1:dup_idx+60])
            if bounds:
                start, end = bounds
                # Since it was appended at the end, end == len(content)
                removed_len = end - start
                content = content[:start] + content[end:]
                print(f"  Removed appended duplicate RM-EP-001 section ({removed_len:,} chars)")
    else:
        print("  No appended duplicate found — checking alternate pattern")
        dup_pat2 = "\n# RM-EP-001"
        # find last occurrence
        idx = content.rfind(dup_pat2)
        first_idx = content.find(dup_pat2)
        if idx != first_idx and idx != -1:
            bounds = find_section_bounds(content, content[idx+1:idx+30])
            if bounds:
                start, end = bounds
                content = content[:start] + content[end:]
                print(f"  Removed appended duplicate RM-EP-001 ({end-start:,} chars)")

    # -----------------------------------------------------------------
    # Step 2: Replace '# POLICY: RM-EP-001' section with approved content
    # -----------------------------------------------------------------
    old_pat = "# POLICY: RM-EP-001"
    bounds = find_section_bounds(content, old_pat)
    if bounds:
        start, end = bounds
        old_len = end - start
        content = content[:start] + approved_section + content[end:]
        print(f"  Replaced '# POLICY: RM-EP-001' section: old={old_len:,}, new={len(approved_section):,}")
    else:
        print("  WARNING: '# POLICY: RM-EP-001' not found in file")
        # Try to add it in a sensible place
        # Find after RM-EP domain or before HR domain
        insert_marker = "\n# DOMAIN: HR"
        if insert_marker not in content:
            insert_marker = "\n# HR-TR-101"
        if insert_marker in content:
            idx = content.find(insert_marker)
            content = content[:idx] + "\n" + approved_section + content[idx:]
            print(f"  Added RM-EP-001 before HR section")
        else:
            content += "\n" + approved_section
            print("  Appended RM-EP-001 at end (fallback)")

    # -----------------------------------------------------------------
    # Write
    # -----------------------------------------------------------------
    print(f"\nWriting updated ALL_POLICIES.md ({len(content):,} bytes) …")
    with open(ALL_POLICIES, "w", encoding="utf-8") as f:
        f.write(content)
    print("Done.")


if __name__ == "__main__":
    main()
