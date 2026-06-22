# Mock Generator Scripts

This directory houses the automation scripts for compiling, testing, and outputting mock compliance events and evidence metadata.

## Expected Generator Location & Signature

All future mock generators (such as Mock 6) should follow a unified command-line interface:

```powershell
npx tsx scripts/mock/generateMockPacket.ts --mock MOCK6 --year 2026 --period H2
```

## Generator Obligations

Any mock generation script must perform the following tasks:
1. **Read Mock Records**: Load raw input CSV/JSON files from `Mock_Records`.
2. **Use Actual Forms**: Match compliance requirements to official Care Indeed templates (e.g. `CO-FM-021`).
3. **Preserve Identifiers**: Map and print provided patient Medical Numbers (MRNs) and diagnoses exactly.
4. **Write Dry-Run Artifacts**: Output the generated markdown documents under the month/category subfolders.
5. **Write Evidence Metadata**: Create evidence records in `.cache/ces-metadata/evidence/**`.
6. **Update Snapshot**: Compile all metadata files into `.cache/ces-metadata/snapshots/full.json`.
7. **Self-Validate**: Check that the generated folder paths start with the correct year (e.g. `2026 / Mock 6 / Brad Training Mock Test`) and that the output document count matches the target.

## Mandatory Validation Commands

Before staging or committing any code/data changes, the following checks must run and pass cleanly:

```powershell
npx tsc -p tsconfig.app.json --noEmit
npm run build
git diff --check
git status --short
```
