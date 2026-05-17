# Phase 1 Decision Log

**Purpose:** Record all forced strategic decisions required by the Canonical UI System Spec (especially Sections 16, 17, and 15). These decisions are non-negotiable gates for Phase 1 completion.

**Rule:** No Phase 2 work may begin until the decisions below are recorded and approved.

---

## D-001: CES Parallel System Policy

**Spec Reference:** CANONICAL_UI_SYSTEM_SPEC.md Section 16

**Decision Date:** 2026-05-XX (Phase 1)

**Chosen Option:** Option B – Governed Permanent Exception (for now)

**Decision:**

CES will be granted a **governed, time-boxed exception** during Phase 2–3. 
It must still adopt the Constrained Page View Contract (Section 4) and a minimum set of canonical primitives (`GlassPanel`, `SurfaceCard`, `ActionButton`, `EmptyState`, `LoadingState`, `CiStatusBadge`).

All CES-specific colors must be registered as semantic tokens in `tokens.json` under a `ces.*` namespace.

Full consolidation to the main token system remains the long-term goal by end of Phase 3.

**Migration / Exception Conditions:**
- CES must use canonical primitives by end of Phase 2.
- No new CES-only component families allowed without approval.
- CES theme must be mapped into the main token system by Q3 2026.

**Owner:** [Engineering Lead] + [CES Team Lead]  
**Target Completion:** End of Phase 2 (exception review gate)  
**Status:** Recorded – Exception Approved

**Linked Drift Item:** D03

---

## D-002: Onboarding & Journey Fragmentation Resolution

**Spec Reference:** CANONICAL_UI_SYSTEM_SPEC.md Section 17

**Decision Date:** 2026-05-XX (Phase 1)

**Chosen Canonical Experience:** Onboarding V2 (Light Professional Audit-Grade)

**Decision:**

Onboarding V2 is the canonical long-term experience. It is more compliance-focused, mobile-friendly, and aligns better with the overall Care Indeed brand and Constrained Page View Contract.

Journey V1 cinematic patterns (absolute carousel, dark theatrical glass, high-production storytelling) are deprecated for new development.

**Migration / Deprecation Path for Journey V1:**
- Existing Journey V1 content can remain for current users until end of Phase 3.
- No new cinematic modules or absolute-position carousels are allowed.
- All future onboarding work must follow Onboarding V2 patterns + canonical primitives + 4-sided constrained frame.

**Owner:** [Onboarding Lead]  
**Target Completion:** End of Phase 2 (no new Journey V1 features)  
**Status:** Recorded – Onboarding V2 is canonical

**Linked Drift Items:** D07, D20

---

## D-003: Print & Legal Evidence Single Source Renderer

**Spec Reference:** CANONICAL_UI_SYSTEM_SPEC.md Section 15

**Decision Date:** 2026-05-XX (Phase 1)

**Chosen Primary Renderer:** `buildPrintablePacketHtml` in `FormSigningWorkspace.tsx`

**Decision:**

`buildPrintablePacketHtml` is the single source of truth for all signed compliance packets and major legal print outputs.

All other print paths (GVGBPrintDocument, FormPrintView, appendix printers) must converge on this renderer or adopt its header/footer system by end of Phase 2.

**Convergence Plan:**
- eCign signed packets: Already using it → baseline
- GVGB and FormPrintView: Must adopt the same `.ci-brand-header` + footer structure by end of Phase 2
- Visual regression baseline for the converged header/footer must be created

**Owner:** [Print/Compliance Lead]  
**Target Completion:** End of Phase 2 (full convergence)  
**Status:** Recorded – `buildPrintablePacketHtml` is the canonical renderer

**Linked Drift Items:** D09, D23, D24

---

## D-004: Token Pipeline Enforcement Model (Future)

**Spec Reference:** CANONICAL_UI_SYSTEM_SPEC.md Section 12

**Decision:** [To be recorded when generators are built]

---

*(Add more decisions here as they are forced during Phase 1)*