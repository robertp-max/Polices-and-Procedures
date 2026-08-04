# Care Indeed Home Health EHR Prototype (static local mirror)

Standalone **static** mirror of the deployed Care Indeed Home Health EHR prototype.

- **Local URL:** `http://127.0.0.1:5191/`
- **Verified title:** Care Indeed Home Health EHR Prototype
- **Source of this copy:** local Temp mirror at  
  `%LOCALAPPDATA%\Temp\care-indeed-ehr-prototype-local`  
  (pulled from the deployed prototype — not from any policy-repo worktree)

## Isolation rules

- This is a **standalone static app**. Do not wire it into the policy app runtime.
- No backend integrations, auth wiring, API calls, or shared state with V6/compliance.
- **Not** Fable’s `EHR_Prototype` worktree  
  (`Policies_and_Procedures_V2_worktrees\EHR_Prototype` must never be used as a source).

## Serve locally

From this directory (or the merge worktree root):

```bash
npx --yes serve apps/ehr-prototype-static -l 5191
```

Or from inside this folder:

```bash
npx --yes serve . -l 5191
```

This mirror is a fallback only. Reception opens the canonical editable EHR app
at `http://127.0.0.1:5194/`; port 5191 remains available only when the static
snapshot itself needs to be inspected.

## Contents

- `index.html`
- `favicon.svg`
- `assets/` (bundled JS/CSS/fonts)
