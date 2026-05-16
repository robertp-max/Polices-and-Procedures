# Next Execution Proposal — Recommended Options

**Purpose:** Translate the review into concrete, bounded, executable options for the next operator-led session.

**Constraint:** Same rules that held through Stabilization Phase 1 + Phase 2 hold here:
- Max 32 agents (16 Claude Sonnet 4.6 / Opus 4.6-or-lower + 16 Grok 4.3), 1 Claude Opus 4.7 orchestrator.
- Protected Subsystems (eCign, Evidence Center, CES identity chain, form_instance_id routing, audit artifacts) NEVER touched without explicit owner sign-off.
- Frozen-file edits require single lead editor (serialized).
- No scope expansion mid-session.
- Validation gates (tsc, build, verify:*, browser test where applicable) before merge.

---

## 1. Recommended Options (Ranked)

### Option A — Build the 4 missing mobile primitives (RECOMMENDED)

**Why first:** They unblock Waves 1–2 of the MVP plan and contain ZERO Protected Subsystem touch. Pure additive UI primitives. Easiest "real progress" win in the MVP backlog.

**Scope:**
- `src/policy/components/ui/BottomSheetDrawer.tsx` — adaptive drawer with drag handle, swipe-down dismiss, max-height `min(80vh, 80% safe viewport)`, backdrop close, persists state on interrupt. Per Lead 2 L120 + Lead 16 C4.
- `src/policy/components/ui/SignaturePad.tsx` — 320 px minimum canvas height, finger smoothing, undo, integration with `useFormDraft` for partial-stroke persistence. Per Lead 2 L124 + Lead 16 C5.
- `src/policy/components/ui/PhotoEvidenceCapture.tsx` — native camera `capture="environment"`, instant preview Accept/Retake. Per Lead 2 L123.
- `src/policy/components/ui/LoadingState.tsx` — single canonical Skeleton (list/card/form/signature variants) + Spinner with `role="status"` + `aria-live`. Per Lead 2 L131.

**Out of scope (do NOT do in this session):**
- Wire these into any existing surface (that's Wave 1/Wave 2 work)
- Touch `FormSigningWorkspace.tsx` (eCign Protected — sign-off required)
- Touch existing Evidence Center surfaces (Protected per Phase 2 N-07 deferral)
- Build the IndexedDB adapter (P1-EVIDENCE-001 — separate larger package)

**Agent allocation:**
- 1 Claude Opus 4.7 orchestrator
- 4 parallel subagents (1 per primitive); model = Claude Sonnet 4.6 or Grok 4.3 (preference: Claude Sonnet 4.6 for SignaturePad due to canvas complexity, Grok 4.3 for the simpler 3)

**Validation:**
- `tsc -b --noEmit` (must be clean)
- `npm run build` (must be green)
- `npm run verify:ui` (no NEW WARN categories)
- ESLint on touched files (no new warnings)
- One simple Storybook-style mount in a throwaway test page (orchestrator-only; not committed)

**Estimated duration:** ~70–90 minutes (Phase 2 pattern: 1 orchestrator + 3–4 subagents in parallel).

**Output artifacts:**
- 4 new primitive files
- `_MVP_Review_(claude47opus)/EXEC_OUTPUTS/PRIMITIVES_BUILD_REPORT.md` — what was built, public API, integration points, intentional deferrals.

---

### Option B — Wave 0 reality check (execute 9 browser tests against `main`)

**Why this matters:** Lead 11 and Lead 12 both confirm zero of the 9 browser tests have ever been executed. The MVP plan correctly gates Wave 1 on this. Until Wave 0 is done, no agent should start Wave 1 work — because we don't actually know what baseline behavior is.

**Scope:** All 9 tests per `QA_UAT_TEST_PLAN.md`, executed sequentially against `main`, with full artifact capture (screenshots, console errors, network log) into `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/execution-logs/`.

**Critical caveat:** This is **borderline agent-doable**. The MVP plan implies real-browser execution with binary pass/fail confirmation by a human reviewer. An agent can:
- Run `npm run dev` and navigate the flows
- Capture screenshots via Playwright headless or manual scripting
- Document console output
- Apply each test's binary pass criteria mechanically

An agent **cannot** reliably confirm:
- "Looks identical to operator's intent" judgments
- Real-world weak-signal behavior (must be simulated)
- Audit-trail correctness without database introspection beyond what the dev server exposes

**Realistic agent role:** Wave 0 "first pass" — capture artifacts + raise any obvious failures + document blockers. Then a human reviewer validates pass/fail with the artifacts in hand.

**Agent allocation:** 1 Claude Opus 4.7 orchestrator (sole runner; tests must serialize — no parallelism).

**Estimated duration:** ~3–5 hours of focused execution + ~1 hour for artifact organization.

**Output artifacts:**
- `_MVP_Review_(claude47opus)/EXEC_OUTPUTS/WAVE_0_TEST_EXECUTION_LOG.md`
- One artifact folder per test under `QA_UAT_AUDIT/execution-logs/Test-N/`

**Recommend NOT doing this unsupervised.** Better as an operator-shadowed session.

---

### Option C — Ship MVP-P1-AUDIT-001 + MVP-P1-ARTIFACT-001 (Wave 2 low-risk pair)

**Why this pair:** Both are tightly scoped, both have explicit dual-write/fallback rollback paths (Lead 11 L1208), neither touches `FormSigningWorkspace.tsx`, and both unblock Browser Test 5.

**Scope:**
- **MVP-P1-AUDIT-001** — update audit emitter (`taskAuditEvent.ts` + `server/identity/...`) to populate top-level `targetKind` + `targetId`. Dual-write `after.*` for one release transition window. Update read sites in AuditModePage + ArtifactViewerPage links.
- **MVP-P1-ARTIFACT-001** — implement `cesFormInstanceId.fromArtifact(artifactId)` deterministic reverse lookup. Replace heuristic in ArtifactViewerPage. Keep legacy `--` heuristic as fallback for one release.

**Out of scope:**
- TASK-001 composite collapse (separate larger package; serializes with these)
- EVIDENCE-001 IndexedDB (separate; depends on PDF storage design from ECIGN-002)
- Browser Test 5 execution (handle as separate Option B work)

**Serialization:** Both packages touch `cesFormInstanceId.ts` (owner-led per Lead 16 C7) — **single lead editor** needed. Audit emitter can run in parallel.

**Agent allocation:**
- 1 Claude Opus 4.7 orchestrator (sole editor on `cesFormInstanceId.ts`)
- 1 subagent for audit emitter dual-write (Claude Sonnet 4.6 or Grok 4.3)
- 1 subagent for AuditModePage + read-site updates (Grok 4.3)

**Validation:**
- `tsc -b --noEmit`
- `npm run build`
- `npm run verify:task-identity` (must continue PASS)
- `npm run verify:alignment` (must continue PASS)
- `npm run check:evidence-phase235` (must continue PASS)
- Manual smoke: open ArtifactViewer with a known artifact, confirm deterministic resolution

**Estimated duration:** ~2.5–3.5 hours.

**Output artifacts:**
- Updated `cesFormInstanceId.ts` with `fromArtifact()` function
- Updated audit emitter with dual-write
- Updated ArtifactViewerPage + AuditModePage read sites
- `_MVP_Review_(claude47opus)/EXEC_OUTPUTS/WAVE_2_AUDIT_ARTIFACT_REPORT.md`

**Requires sign-off?** Soft yes (cesFormInstanceId.ts is owner-led, but the change is additive — new function alongside existing). Recommend a brief CES architecture courtesy ping.

---

### Option D — Ship MVP-P1-PERMS-001 (Trainer permission boundary)

**Why:** Smallest P1 package (~1.5 agent-days), unblocks Browser Test 9, touches no Protected files.

**Scope:**
- Hide `user.provision` from Trainer role in `permissionCatalog.ts` / `userGroups.ts`
- URL-guard `/admin/users`, `/admin/permissions`, systemDocumentation, publish/override from Trainer
- Re-run `verify-feature-access.mjs`
- Execute Browser Test 9 (or document as part of Wave 0 if combined with Option B)

**Agent allocation:** 1 Grok 4.3 subagent + orchestrator review.

**Estimated duration:** ~60–90 minutes.

**Output artifacts:** Code changes + `WAVE_4_PERMS_REPORT.md`.

---

### Option E — Documentation cleanup (lowest leverage, but bounded and safe)

**Why:** Three small but real documentation hygiene items the MVP plan needs before further execution:

1. **Resolve duplicate PART II** in `UNIFIED_MVP_QA_UIUX_IMPLEMENTATION_PLAN.md` (lines 753–880 and 882–1023 are near-identical). Recommend: keep `PART II — 19 Mandated Deliverables` (starts L1105) as the authoritative PART II; archive the two duplicate "Actionable Implementation Hardening" blocks into `_MVP_Review_(claude47opus)/EXEC_OUTPUTS/PART_II_DUPLICATE_ARCHIVE.md` and add a single header note in the main plan pointing to the authoritative section.

2. **Resolve `signerTaskFactory.ts` status** (Lead 4 open conflict). Grep confirms the file does NOT exist in `src/policy/compliance-execution/`. Either (a) it was renamed/inlined into another file and the plan needs a one-line correction, or (b) it was always referenced from the legacy MVP_QA_IMPLEMENTATION_PLAN as a planned-but-never-built artifact. Investigate via git log + write a memo into the canonical ownership map.

3. **30-day MVP execution roadmap** — convert the 8-wave plan into a calendar-anchored milestone list with named human gates (CES architecture sign-off, eCign architecture sign-off, executive sponsor sign-off for real-agency cohort, rollback owner assignment).

**Agent allocation:** 1 Claude Opus 4.7 orchestrator + 1 Grok 4.3 subagent for git archaeology.

**Estimated duration:** ~60–90 minutes.

**Output artifacts:**
- `_MVP_Review_(claude47opus)/EXEC_OUTPUTS/MVP_PLAN_DOC_CLEANUP_PROPOSAL.md`
- `_MVP_Review_(claude47opus)/EXEC_OUTPUTS/SIGNER_TASK_FACTORY_RESOLUTION.md`
- `_MVP_Review_(claude47opus)/EXEC_OUTPUTS/30_DAY_MVP_ROADMAP.md`

---

## 2. Combinations That Make Sense

Stabilization Phase 2 proved 4–5 effective agents in ~70 minutes is the sweet spot. Some combinations:

| Combo | Duration | Output | Why |
|---|---|---|---|
| **A + E** (primitives build + doc cleanup) | ~90 min | 4 primitives + 3 doc deliverables | A and E touch no overlapping files; perfect parallel run |
| **A + D** (primitives + Trainer perms) | ~90 min | 4 primitives + PERMS-001 shipped | No file overlap; PERMS-001 is small enough to add |
| **C + D** (audit/artifact pair + Trainer perms) | ~3 hours | 3 Wave 2/Wave 4 packages shipped | Concentrated MVP package velocity |
| **A + C + D** (max throughput, agent-rich session) | ~3–4 hours | 4 primitives + 3 packages | Approaches Phase 2 ceiling; manageable if orchestrator stays disciplined on serialization rules |

---

## 3. Combinations That DO NOT Make Sense

- **A + anything eCign** — primitives need to stay non-Protected.
- **B (Wave 0) + any code change** — Wave 0 must run against a stable `main`; running browser tests while edits land is invalid.
- **TASK-001 in a single session** — it's a 7-day package spanning 5 surfaces; not single-session-shippable.
- **EVIDENCE-001 in a single session** — it's 6.5 days of architecture work + browser matrix; not single-session-shippable.
- **Any ECIGN-001/002/003/004 work without architecture sign-off** — Protected Subsystem rule, Phase 1 precedent, legal-defensibility risk.

---

## 4. Strong Recommendation

**For the next session: Option A + Option E (primitives + doc cleanup).**

Rationale:
- Highest-leverage agent-doable work (4 primitives unblock 80%+ of mobile/Wave 1 work)
- Zero Protected Subsystem touch
- Bounded scope (~90 minutes)
- Matches the Phase 2 successful pattern (4 parallel subagents + orchestrator + 70 minutes)
- Doc cleanup removes blockers from the MVP plan itself
- Real, visible, mergeable artifacts at end of session
- Validation gates are all lightweight (no Compliance Lock regression needed — primitives are additive)

**For the session after that: Option B (Wave 0 reality check).**

Rationale:
- Must precede any Wave 1+ execution
- Borderline agent-doable; better as operator-shadowed
- Once done, every subsequent wave has a real baseline to regress against

**For the session after that: Option C (AUDIT-001 + ARTIFACT-001).**

Rationale:
- Highest-velocity Wave 2 progress without TASK-001 or EVIDENCE-001 complexity
- Low-risk (dual-write + fallback paths)
- Each package ships with its own Browser Test 5 gate

---

## 5. Anti-Recommendation: What NOT To Do

- **Do not** "just start Wave 1" without Wave 0 baseline.
- **Do not** apply the ECIGN-001 supersede patch unsupervised.
- **Do not** spin up 32 agents and "do the whole MVP." The serialization ceiling caps useful agent count at ~4–8 per session.
- **Do not** re-open any Phase 1/Phase 2 completed item. They're validated and shipped.
- **Do not** start TASK-001 or EVIDENCE-001 in a single session — both are multi-day packages requiring continuous architecture engagement.
- **Do not** touch Protected Subsystems (eCign / Evidence Center / CES identity / form_instance_id routing / audit artifacts) without explicit owner sign-off in the session prompt.

---

## 6. What This Review Cannot Decide

Two things only the human operator can decide:

1. **Which CES + eCign architecture reviewers will sign off on Protected file edits?** Without this, every P0 except A11Y-002/003 and AUTH-001/002 stalls.
2. **When and how is the real-agency cohort (Wave 7) scheduled?** This is the dominant calendar driver post-Wave 6.

These two human gates compress or expand the calendar by an order of magnitude. The agent-side work is well-defined; the human-side coordination is not.

---

## 7. Sign-Off

This review (`00`–`04` documents) is the deliverable. No source changes made in producing it. Operator decision required on which option (A, B, C, D, E, or a sensible combination) to execute next.

**Status:** REVIEW COMPLETE. Ready for operator green-light on next execution option.
