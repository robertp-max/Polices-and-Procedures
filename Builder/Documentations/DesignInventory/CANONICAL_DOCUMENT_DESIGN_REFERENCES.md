# Canonical document design references (locked)

**Purpose:** Single source of truth for **approved** policy / form / print visual language.  
**Do not** reintroduce legacy gold/mustard (`#D4AF37`, `#B8860b`, misnamed `teal` → gold) for **print** or **document chrome**.

## Canonical policy document stack (Builder — locked trio)

Reconciliation targets for **on-screen policy viewing**, **print / Save as PDF**, and **federal regulation references (inline eCFR overlay UX)**. Runtime implementations should trace back to these three together—not alternate experimental layouts.

| Role | Path |
|------|------|
| **Policy viewer (light)** — single-card editorial reader | `Builder/Policies/PolicyViewerDesignLight.html` |
| **Policy print / download (light)** — publication print companion | `Builder/Policies/PolicyPrintDownloadDesignLight.html` |
| **eCFR reference viewer (light)** — references table + inline overlay pattern | `Builder/Policies/PolicyViewer_eCFRReferenceDesignLight.html` |

Together they define: flat white editorial layout, Montserrat + Roboto, restrained teal/orange accents, thin `#E5E4E3` separators, dense readable body type, and **inline** regulation viewing (proxy-backed HTML in overlay—not losing library context).

## Locked print/PDF references (user documents — policies & forms)

These PDFs are the **authoritative** layout for **print preview**, **browser print**, and **Save as PDF** for the GV-GB-001 publication path and (forms) the eCIgn signature packet. Runtime library viewers remain separate.

| Document | Path |
|----------|------|
| GV-GB-001 — Governing Body Authority & Responsibilities (policy print) | `c:\Users\razer\Documents\GV-GB-001 — Governing Body Authority & Responsibilities.pdf` |
| EN-FM-005 — eCIgn Signature Packet (forms print) | `c:\Users\razer\Documents\EN-FM-005 - eCIgn Signature Packet.pdf` |

## Other approved static references (Builder)

| Artifact | Path |
|----------|------|
| Forms print (light) — forms family, not policy card | `Builder/Policies/FormsPrintLightDesign.html` |

The policy trio above is repeated here only by implication; do not treat forms print HTML as the policy viewer source of truth.

**Brand kit (tokens / narrative):** `Builder/Policies/CIHHCBRANDKIT.HTML`, `Builder/Policies/CI Brand.md` (supporting docs).

## Approved token usage (runtime — print & document surfaces)

| Token role | Hex | Notes |
|------------|-----|--------|
| Primary accent (teal) | `#007970` | Tables, borders, primary pills on print/PDF. |
| Dark teal (chrome) | `#004142` / `#004d47` | Hover, table edge, dark teal borders. |
| Primary orange (CTA / warning) | `#C74600` / `#C74601` | Rust / draft / critical — per brand kit. |
| Ink / body | `#1F1C1B`, `#524048` | Headings / subheads. |
| Hairline / border | `#E5E4E3` | Cards, rules. |
| Paper wash | `#FAFBF8`, `#E5FEFF` | Light fills. |

## Runtime owners (do not fork without updating this list)

| Surface | Primary implementation |
|---------|------------------------|
| Generic policy print (any `policyId`) | `src/policy/pages/PrintPage.tsx` |
| In-shell policy print (carousel hidden; sequential print tree) | `src/policy/components/SharedPolicyDetailView.tsx` (`.policy-print-only`) + global print rules in `src/index.css` |
| GV-GB-001 full document print | `src/policy/pages/GVGBPrintDocument.tsx` — accent constant `PRINT_ACCENT = '#007970'` |
| GV-GB-001 appendix print | `src/policy/pages/GVGBAppendixPrint.tsx` — same `PRINT_ACCENT` |
| Forms print (dedicated route + iframe) | `src/policy/pages/FormPrintView.tsx`, `src/policy/utils/printForm.ts`, `src/policy/components/FormViewer.tsx` (`FormBody`) |
| eCIgn signed packet (print/PDF) | `src/policy/components/FormSigningWorkspace.tsx`, `server/ecign/pdf.ts` — **separate** navy/orange eCIgn brand (do not conflate with policy light kit). |

## Tailwind (`tailwind.config.js`)

- **`ci.teal` / `ci-teal-dark`** must remain **real teal** (`#007970` / `#004142`). Never alias them to gold.
- **Gold** remains under `ci.gold`, `ci-gold-dark`, etc.

## eCIgn specification (non-policy document family)

Design and template contracts: `Builder/eCIgn/*.md` (especially outputs / watermarks). Do not merge eCIgn certificate visuals into policy print CSS without an explicit design decision.
