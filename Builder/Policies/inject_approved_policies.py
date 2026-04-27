"""
inject_approved_policies.py
============================
Replaces/inserts sections in ALL_POLICIES.md using the individually approved
.md policy files from Builder/ root as the authoritative source of truth.

Rules:
  - For EN-TG-001, EN-LC-001, EN-CM-001, RM-EP-001: replace existing sections
  - For RM-OS-101: replace with RM-OS-001 and add RM-OS-002/003/004 after it
  - For CO-CA-001: add after the CO domain's last CO-CP section (CO-CP-008)
  - Do NOT modify the individual approved .md files
"""

import re
import os
import sys

BUILDER_ROOT = os.path.join(os.path.dirname(__file__), "..")
POLICIES_DIR = os.path.dirname(__file__)
ALL_POLICIES = os.path.join(POLICIES_DIR, "ALL_POLICIES.md")
OUTPUT_FILE  = os.path.join(POLICIES_DIR, "ALL_POLICIES.md")

# ---------------------------------------------------------------------------
# Approved policy files — relative to BUILDER_ROOT
# ---------------------------------------------------------------------------
APPROVED_FILES = [
    "EN-TG-001.md",
    "EN-LC-001.md",
    "EN-CM-001.md",
    "RM-EP-001.md",
    "RM-OS-001.md",
    "RM-OS-002.md",
    "RM-OS-003.md",
    "RM-OS-004.md",
    "CO-CA-001.md",
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def read_file(path: str) -> str:
    with open(path, encoding="utf-8") as f:
        return f.read()


def extract_policy_id(content: str) -> str:
    """Extract policy ID from the Policy Header table in an approved .md file."""
    m = re.search(r"\|\s*Policy ID\s*\|\s*([A-Z]{2}-[A-Z]{2}-\d{3}[A-Z_]*)\s*\|", content)
    if m:
        return m.group(1).strip()
    raise ValueError("Could not find Policy ID in file")


def extract_policy_title(content: str) -> str:
    """Extract the top-level h1 title from an approved .md file."""
    m = re.match(r"^#\s+(.+)", content, re.MULTILINE)
    if m:
        return m.group(1).strip()
    raise ValueError("Could not find h1 title in file")


def format_approved_content(policy_id: str, title: str, body: str) -> str:
    """
    Reformat the approved policy body for ALL_POLICIES.md:
      - Replace the first h1 line with the canonical '# POLICY-ID — Title' format
    """
    # Remove the opening h1 + optional separator (--- line) so we can replace them
    # Pattern: first line is '# Title', optionally followed by '---'
    body = body.strip()
    # Replace the first h1 heading
    body = re.sub(r"^#\s+.+", f"# {policy_id} — {title}", body, count=1, flags=re.MULTILINE)
    # Remove a separator line immediately after the old title if present
    body = re.sub(r"^(# [^\n]+)\n\n---\n", r"\1\n\n", body, count=1, flags=re.MULTILINE)
    return "\n" + body.strip() + "\n"


def find_section_bounds(content: str, pattern: str):
    """
    Return (start, end) character indices for the section beginning with 'pattern'.
    'end' is the start of the NEXT h1 heading (or EOF).
    Returns None if not found.
    """
    idx = content.find(pattern)
    if idx == -1:
        return None
    # Find next h1 (newline + '# ') after the current section start
    next_h1 = content.find("\n# ", idx + len(pattern))
    end = next_h1 if next_h1 != -1 else len(content)
    return (idx, end)


def build_section_pattern(policy_id: str, content: str) -> str:
    """
    Try several heading formats that ALL_POLICIES.md may use for a given policy ID.
    Returns the first matching pattern string, or None.
    """
    candidates = [
        f"# {policy_id} —",
        f"# POLICY {policy_id} —",
        f"# {policy_id}—",
    ]
    for c in candidates:
        if c in content:
            return c
    return None


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print(f"Reading ALL_POLICIES.md ({os.path.getsize(ALL_POLICIES):,} bytes) …")
    base = read_file(ALL_POLICIES)

    # Load all approved policy files
    approved = {}  # policy_id -> {'id', 'title', 'raw', 'formatted'}
    for fname in APPROVED_FILES:
        fpath = os.path.join(BUILDER_ROOT, fname)
        if not os.path.exists(fpath):
            print(f"  WARNING: {fname} not found at {fpath} — skipping")
            continue
        raw = read_file(fpath)
        pid = extract_policy_id(raw)
        title = extract_policy_title(raw)
        formatted = format_approved_content(pid, title, raw)
        approved[pid] = {"id": pid, "title": title, "raw": raw, "formatted": formatted, "fname": fname}
        print(f"  Loaded: {pid} — {title} ({len(raw):,} bytes from {fname})")

    modified = base

    # ------------------------------------------------------------------
    # 1. Replace sections that EXIST in ALL_POLICIES.md
    # ------------------------------------------------------------------
    REPLACE_IDS = ["EN-TG-001", "EN-LC-001", "EN-CM-001", "RM-EP-001"]

    for pid in REPLACE_IDS:
        if pid not in approved:
            print(f"  SKIP (not loaded): {pid}")
            continue
        pat = build_section_pattern(pid, modified)
        if pat is None:
            print(f"  NOT FOUND in ALL_POLICIES.md: {pid} — will append at end")
            modified += "\n" + approved[pid]["formatted"]
            continue
        bounds = find_section_bounds(modified, pat)
        if bounds is None:
            print(f"  BOUNDS ERROR for {pid}")
            continue
        start, end = bounds
        old_section = modified[start:end]
        new_section = approved[pid]["formatted"]
        modified = modified[:start] + new_section + modified[end:]
        delta = len(new_section) - len(old_section)
        print(f"  REPLACED {pid}: old={len(old_section):,} chars, new={len(new_section):,} chars, delta={delta:+,}")

    # ------------------------------------------------------------------
    # 2. Replace RM-OS-101 with RM-OS-001 + RM-OS-002 + RM-OS-003 + RM-OS-004
    # ------------------------------------------------------------------
    RM_OS_OLD_PAT = "# POLICY RM-OS-101 —"
    if RM_OS_OLD_PAT not in modified:
        # Try alternate format
        RM_OS_OLD_PAT = "# RM-OS-101 —"
    if RM_OS_OLD_PAT in modified:
        bounds = find_section_bounds(modified, RM_OS_OLD_PAT)
        if bounds:
            start, end = bounds
            old_len = end - start
            new_block = ""
            for pid in ["RM-OS-001", "RM-OS-002", "RM-OS-003", "RM-OS-004"]:
                if pid in approved:
                    new_block += approved[pid]["formatted"] + "\n"
                else:
                    print(f"  WARNING: {pid} not loaded — skipping")
            modified = modified[:start] + new_block + modified[end:]
            print(f"  REPLACED RM-OS-101 with RM-OS-001/002/003/004: old={old_len:,}, new={len(new_block):,} chars")
    else:
        # RM-OS-101 not found — check if RM-OS-001 already exists; if not, append
        print("  RM-OS-101 not found; checking for RM-OS-001 …")
        for pid in ["RM-OS-001", "RM-OS-002", "RM-OS-003", "RM-OS-004"]:
            if pid not in approved:
                continue
            pat = build_section_pattern(pid, modified)
            if pat:
                bounds = find_section_bounds(modified, pat)
                if bounds:
                    start, end = bounds
                    old_section = modified[start:end]
                    new_section = approved[pid]["formatted"]
                    modified = modified[:start] + new_section + modified[end:]
                    print(f"  REPLACED existing {pid}")
                continue
            # Not found — need to add
            # For RM-OS-001 add before RM domain epilogue or after last RM policy
            # Strategy: insert before the HR domain
            insert_marker = "\n# DOMAIN: HR" if "\n# DOMAIN: HR" in modified else None
            if insert_marker is None:
                insert_marker = "\n# HR-" if "\n# HR-" in modified else None
            if insert_marker:
                idx = modified.find(insert_marker)
                modified = modified[:idx] + "\n" + approved[pid]["formatted"] + modified[idx:]
                print(f"  ADDED {pid} before HR domain")
            else:
                modified += "\n" + approved[pid]["formatted"]
                print(f"  APPENDED {pid} at end (no HR domain found)")

    # ------------------------------------------------------------------
    # 3. Add CO-CA-001 (currently missing from ALL_POLICIES.md)
    # ------------------------------------------------------------------
    if "CO-CA-001" in approved:
        pid = "CO-CA-001"
        pat = build_section_pattern(pid, modified)
        if pat:
            bounds = find_section_bounds(modified, pat)
            if bounds:
                start, end = bounds
                old_section = modified[start:end]
                new_section = approved[pid]["formatted"]
                modified = modified[:start] + new_section + modified[end:]
                print(f"  REPLACED existing CO-CA-001 (unexpected): old={len(old_section):,}, new={len(new_section):,}")
        else:
            # Insert after CO-CP-008 section
            insert_after = "# CO-CP-008 —"
            if insert_after not in modified:
                insert_after = "# POLICY CO-CP-008 —"
            if insert_after in modified:
                # Find the end of the CO-CP-008 section (start of next h1)
                bounds_cp008 = find_section_bounds(modified, insert_after)
                if bounds_cp008:
                    _, insert_pos = bounds_cp008
                    new_section = approved[pid]["formatted"]
                    modified = modified[:insert_pos] + "\n" + new_section + modified[insert_pos:]
                    print(f"  ADDED CO-CA-001 after CO-CP-008 (+{len(new_section):,} chars)")
            else:
                # Fallback: insert at end of CO domain (before next domain)
                # Find end of last CO- policy
                last_co_match = None
                for m in re.finditer(r"\n# (?:POLICY )?CO-", modified):
                    last_co_match = m
                if last_co_match:
                    # find end of that section
                    sec_start_pos = last_co_match.start() + 1  # skip leading \n
                    bounds_co = find_section_bounds(modified, modified[sec_start_pos:sec_start_pos+30])
                    if bounds_co:
                        _, insert_pos = bounds_co
                        new_section = approved[pid]["formatted"]
                        modified = modified[:insert_pos] + "\n" + new_section + modified[insert_pos:]
                        print(f"  ADDED CO-CA-001 at end of CO domain (+{len(new_section):,} chars)")
                else:
                    modified += "\n" + approved[pid]["formatted"]
                    print(f"  APPENDED CO-CA-001 at end of file")

    # ------------------------------------------------------------------
    # Write output
    # ------------------------------------------------------------------
    print(f"\nWriting updated ALL_POLICIES.md ({len(modified):,} bytes) …")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(modified)
    print("Done.")
    print(f"  Input size:  {len(base):,} bytes")
    print(f"  Output size: {len(modified):,} bytes")
    print(f"  Delta:       {len(modified) - len(base):+,} bytes")


if __name__ == "__main__":
    main()
