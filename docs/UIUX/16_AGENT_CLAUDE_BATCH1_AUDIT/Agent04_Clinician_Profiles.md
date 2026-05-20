# Agent 04 — Clinician Profiles (List + Detail) Auditor Report

**Agent ID:** 019e44e7-30f8-7981-80f5-039f7c40b514  
**Type:** explore  
**Duration:** 275.09s | Tool calls: 45 | Turns: 1  
**Task:** Clinician List+Detail fidelity (Claude vs Grok ui-staging vs prod)

---

## Sources Analyzed

- **Claude's promised V3**: `_Heavy/Fix-2026-05-14/___claudeMCP/gemini/Send_To_Claude/Claude_Resonse/ClaudeExecute1` (lines ~1475–1830 for the two pages + V3Tokens/V3PageTransition)
- **ui-staging ports**: `src/ui-staging/V3ClinicianListPreview.tsx` and `V3ClinicianDetailPreview.tsx` (both comment "EXACT PORT from ClaudeExecute1")
- **Real production**: `src/policy/staffing/pages/ClinicianListPage.tsx`, `ClinicianDetailPage.tsx` + `types.ts`, `data/mockClinicians.ts`, `stores/clinicianStore.ts`, `components/ClinicianCard.tsx`, `App.tsx`, `CommandCenterLayout.tsx`

---

## Claude's Promised V3 Version (from ClaudeExecute1)

**Data Model (List):**
- Interface with id, name, discipline, status, employment, competencies, assignments
- Exact 10 hardcoded clinicians (Amara Okonkwo RN Active W2, etc.)

**List:**
- PHASE 1 • READ-ONLY header
- Live filters (search + discipline + status selects)
- 7-column table (NAME/DISCIPLINE/STATUS/EMPLOYMENT/COMPETENCIES/ASSIGNMENTS/→)
- Row hover glass2, click → navigate to detail
- Status colors (tealLight for Active)
- Full V3 tokens + lucide icons

**Detail:**
- useParams + rich MOCK (Amara example with complianceItems, documents, assignments, competencies)
- Back button
- Header with avatar, name, discipline pill, status, ID
- 4 tabs: overview | compliance | assignments | documents
- Tab content wrapped in `<V3SubViewTransition>`
- Rich sections with icons, expiring logic, lists
- Uses V3 tokens, lucide, framer-motion subview transition (0.5s y+blur)

**Motion (global):**
- V3PageTransition (0.7s opacity/scale/blur cubic-bezier)
- V3SubViewTransition for tabs (0.5s)

---

## ui-staging vs Claude (1:1)

**V3ClinicianListPreview.tsx:**
- Data, 10 rows, filters, 7-col table, hover, statusColor, discipline pills: **100% identical**
- Grok changes: inlined V3 const, 🔍 emoji + "→" text instead of lucide, alert() instead of useNavigate, no shared tokens, added footer note
- **Fidelity: ~92–93%** (excellent visual port; only dep stripping + preview-safe changes)

**V3ClinicianDetailPreview.tsx:**
- Data model, 4 tabs structure, overview grid, compliance/assignments/documents lists, header/back: **~90%+ structural match**
- Grok changes: inlined V3, **no V3SubViewTransition** (plain conditional, zero motion on tabs), **zero lucide icons** (emojis only), no v3-invisible-glare classes, plain text tab buttons, static back div, no useParams, added footer
- **Fidelity: ~78–82%** (strong on tabs/data; heavy loss on motion, icons, polish, interactivity)

**What previous Grok did when porting:**
- Stripped all external deps (lucide, framer-motion, router hooks, shared V3Tokens)
- Real navigation → alerts/static
- Tab sub-animations completely removed
- Kept data/columns/tabs/sections high-fidelity (especially List)
- Made self-contained visual references, not executable code
- No integration with V3Shell / V3Router / global CSS

---

## Real Production vs Claude V3

**Data Model (real):**
- Much richer: nested credentials (with expiry/daysUntilExpiry/status), competencies as objects, FEHA accommodations (religious/ADA/pregnancy/FMLA), serviceAreas, connections via ClinicianPatientConnection, etc.
- 13+ disciplines, 6 statuses

**ClinicianListPage (real):**
- Zustand store + live filtering from connections
- PageHeader with "Phase 1 · Read-only" + synthetic data banner
- Search + selects + clear filters
- Responsive: mobile ClinicianCard stack, desktop DataGrid (not raw table)
- Columns: Name (link), DisciplineBadge, StatusBadge, Employment, competency count, assignmentCount
- Real navigate to `/clinicians/${id}`
- Uses `--ci-*` CSS vars + shared components
- **No exact "PHASE 1 • READ-ONLY" text, no V3 glass/teal pills, different focus**

**ClinicianDetailPage (real):**
- Store-driven (getClinicianById + connections + patientStore)
- Breadcrumb
- 5 tabs: overview | credentials & competencies | assignments | availability (disabled Phase 2) | history (disabled)
- Rich sections: Personal Information, Disciplines & Areas, **FEHA Compliance** (Claude had none), verified credentials with expiry math, level-colored competency badges, assignment rationale/overrides with links
- Dynamic cross-entity links, empty states, computed expiry
- No "compliance" or "documents" tabs, no V3SubView, no framer, minimal icons
- **Completely different tab set and data emphasis (staffing/compliance depth vs Claude's clinical mock)**

**Fidelity scores (content/structure/tabs/motion/visual tokens to Claude's exact V3):**

- **ui-staging vs Claude V3**:
  - List: **92%**
  - Detail: **80%**
  - Pair overall: **~86%** (high visual reference fidelity)

- **Real production vs Claude V3**:
  - List: **~15%**
  - Detail: **~12%**
  - Pair overall: **~13.5%** (functional richer system in its own design language — zero Veil Glass match)

- **ui-staging vs real**: Staging is far closer to Claude's promised V3 vision than production is.

---

## Summary

- Grok's ui-staging ports are **high-fidelity visual demos** of Claude's specific V3 promise (especially the List page). They are not full drop-in code.
- Real production pages are **not a port of Claude's V3 at all**. They are a live, richer, typed staffing module with different priorities (FEHA, verified credentials, connections, responsive components) using the existing non-V3 design system.
- No framer-motion or V3SubViewTransition exists anywhere for these surfaces in the current codebase.
- The "EXACT PORT" comments in the previews are largely accurate for the copied data/logic before the necessary stripping for standalone preview use.

All absolute paths provided for verification.

<subagent_meta>
id=019e44e7-30f8-7981-80f5-039f7c40b514
type=explore
tool_calls=45
turns=1
duration_ms=275091
</subagent_meta>
