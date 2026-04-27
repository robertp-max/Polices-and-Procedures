# Policy Lifecycle Workspace — Architecture & Design

This folder is the **single, authoritative design package** for the unified Policy Lifecycle Workspace that replaces the legacy Draft Workspace, Review Workspace, and Publish Center.

## Read in order

1. [01 — Policy Lifecycle Truth Extraction](01-Policy-Lifecycle-Truth.md) — what the actual P&Ps require
2. [02 — Current System Gap Analysis](02-Current-System-Gaps.md) — how the legacy three-screen split fails
3. [03 — Target Architecture](03-Policy-Lifecycle-Architecture.md) — unified lifecycle, state machine, parallel-revision model, hard invariants
4. [04 — Efficiency-First Workflow Design](04-Efficiency-Workflow-Design.md) — click budgets, role-aware queues, inline everything
5. [05 — UI / UX Design Specification](05-Policy-Lifecycle-UIUX.md) — tokens, layout, modes, every panel
6. [06 — Compliance Enforcement Model](06-Compliance-Enforcement-Model.md) — the 20 hard rules + invariants
7. [07 — System Integration](07-System-Integration.md) — CES, Calendar, Audit Mode, eCIgn, Forms, Help Center
8. [08 — Policy Lifecycle Data Model](08-Policy-Lifecycle-Data-Model.md) — entities, fields, relationships, indexes
9. [09 — Implementation Roadmap](09-Implementation-Roadmap.md) — phased delivery plan
10. [10 — Developer Documentation](10-Developer-Documentation.md) — **shipped v1** module reference
11. [11 — End-User Manual v1](11-End-User-Manual-v1.md) — **shipped v1** practical guide
12. [End-User Manual (target architecture)](POLICY_LIFECYCLE_USER_MANUAL.md) — long-form future-state guide

## Status

**Implementation v1 is shipped.** The unified workspace lives at `/policy-lifecycle` with the canonical 5-state machine (DRAFT · REVIEW · APPROVED · PUBLISHED · ARCHIVED). All seeded policies are in DRAFT, created by TJ Padilla (`robertp@careindeed.com`, AI Researcher). Legacy `/drafts`, `/review`, `/publish` routes redirect here.

## Non-negotiables

- **No "Deprecated" state.** The lifecycle uses `Active`, `Under Revision`, `Superseded` (version-level), and `Archived` (only when legally required).
- **Exactly one Active version per policy** at every instant. Active↔Superseded swaps are atomic.
- **Every transition is guarded** by an explicit rule (R1–R20) and audited via the existing `ecign.audit_events` hash chain.
- **Single workspace, no route changes.** Drafting, reviewing, approving, and publishing all happen in `/policy-lifecycle` with mode-aware panels.
