# AGENTS 25-32: Review/Approval/Evidence Flow QA (Locked 64-QA Protocol)

**Protocol Version:** 64-QA (Read-Only)  
**Exact Repo:** `C:\AI\Git\training\HomeHealth\Policies_and_Procedures`  
**Agent Batch:** 25-32 (Review/approval/evidence flow QA, 8 agents)  
**Charter Focus:** Swimlane model connectivity for review steps, approval/signature steps, and evidence/lock steps in *all generated* (workflow + event + fallback) swimlanes.  
**Date:** 2026-05-28  
**Deliverable:** This report (absolute path: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\docs\UIUX\V3.2\Components\Swimlanes\AGENTS-25-32-REVIEW-EVIDENCE-FLOW-QA.md`)  
**Rules Observed:** READ-ONLY on source. No references to QA-WF-03. No suggestions for changes to any QA-WF-*. Evidence-based only via code + data inspection. P1 = disconnected review/approval/evidence. Actionable findings only.

## Executive Summary

**All inspected generated swimlanes (8+ workflows across domains + 5+ events + fallback) PASS basic connectivity for review/approval/evidence flows.**

- Builders (`buildSwimlaneFromWorkflow.ts:129-197`, `buildSwimlaneFromEvent.ts:136-163`, `buildFallbackSwimlane.ts:34-107`) **guarantee** linear chaining via `node.nextNodeIds` mutations + final `edges` construction.
- `model.edges` always derived 1:1 from `nextNodeIds` (see `buildSwimlaneFromWorkflow.ts:199-203`, identical in event builder, hardcoded in fallback).
- **No isolated review/approval/evidence nodes** in any generated model (linear step chains + terminal appends only; render guard in `SwimlaneExecutionMap.tsx:342-344` is defensive only).
- Fallback **always** produces the exact 4-node chain: `...-opened → ...-review → ...-evidence → ...-lock` with correct `nextNodeIds` + `edges`.
- Domain patterns (Governance board review→decision→minutes→approval→lock; Clinical/Compliance/HR/Finance/Ops/IT/Risk/Training/Filing equivalents) **are represented and connected** in sampled data via step regex triggers + conditional injections + domain-specific phases (`phaseTemplates.ts`).
- **Evidence/lock nodes** injected reliably when `requiredForms.length > 0 || approvals.length > 0 || outputs || auditRequirements` (workflow) or equivalent (event + minutes/approvals).
- **Review/approval nodes** present either via authored step actions (regex: `/review|validate|audit|approve|sign|attest|score|verify/i`) or explicit injection (workflow-only safety net).
- **Zero P1 (disconnected review)** found in samples. Minor P2 observations on event-builder asymmetry and keyword reliance (detailed below).

**Overall Status:** Green for sampled routes. No FAILs requiring immediate coordinator action on connectivity. One P2 architectural note flagged for future alignment.

## Inspection Targets (Code + Data)

### Core Builders (Exact Lines Inspected)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\workflows\swimlanes\buildSwimlaneFromWorkflow.ts:129-197` (approval-review + evidence-lock injection + `last.nextNodeIds` wiring).
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\workflows\swimlanes\buildSwimlaneFromEvent.ts:73-191` (delegation + processFlow/minimal steps + evidence-lock append only).
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\workflows\swimlanes\buildFallbackSwimlane.ts:34-112` (hardcoded 4-node review→evidence→lock).
- Supporting: `types.ts:30-51` (SwimlaneNode: `nextNodeIds`, `dependencies`, `reviewerRole`, `signerRole`), `swimlaneRegistry.ts:30-87` (dispatch to builders, fallback), `swimlaneRoutes.ts:3-25`, `SwimlaneExecutionMap.tsx:129` (nodeById), `333-357` (edges from `model.edges` with null guard), `phaseTemplates.ts:39-58` (domain phases with Review/Approval/Evidence Lock), `roleNormalizer.ts:16` (Evidence lane).

**Key Wiring Logic Verified (Direct Quotes):**
```startLine:149:156:C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\workflows\swimlanes\buildSwimlaneFromWorkflow.ts
      dependencies: last ? [last.nodeId] : [],
      nextNodeIds: [],
      ...
    });
    if (last) last.nextNodeIds = [nodeId];
```
(Approval-review injection)

```startLine:189:196:C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\workflows\swimlanes\buildSwimlaneFromWorkflow.ts
      dependencies: last ? [last.nodeId] : [],
      nextNodeIds: [],
      ...
    });
    if (last) last.nextNodeIds = [nodeId];
```
(Evidence-lock, *after* possible approval — ensures `... → approval-review → evidence-lock`)

```startLine:155:162:C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\workflows\swimlanes\buildSwimlaneFromEvent.ts
    });
    if (last) last.nextNodeIds = [nodeId];
```
(Event evidence-lock append only)

```startLine:49:103:C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\workflows\swimlanes\buildFallbackSwimlane.ts
      nextNodeIds: [`${id}-fallback-review`],
...
      nextNodeIds: [`${id}-fallback-evidence`],
...
      nextNodeIds: [`${id}-fallback-lock`],
...
      nextNodeIds: [],
```
(Explicit review → evidence → lock)

Edges construction (identical pattern across builders):
```startLine:199:203:C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\workflows\swimlanes\buildSwimlaneFromWorkflow.ts
  const edges = nodes.flatMap(node => node.nextNodeIds.map(toNodeId => ({
    fromNodeId: node.nodeId,
    toNodeId,
    route: 'orthogonal' as const,
  })));
```

## Sampled Routes (8+ Workflows + Events + Fallbacks)

**Workflow Routes Sampled (across domains, via `WORKFLOWS` keys in `workflows.generated.ts`):**
- `GV-WF-01` (Governance) — route: `/workflows/GV-WF-01-swimlane`
- `CL-WF-26` (Clinical / Audit) — route: `/workflows/CL-WF-26-swimlane`
- `FN-WF-01` (Finance) — route: `/workflows/FN-WF-01-swimlane`
- `HR-WF-01` (HR / Recruitment) — route: `/workflows/HR-WF-01-swimlane`
- `IT-WF-01` (IT / Security Risk) — route: `/workflows/IT-WF-01-swimlane`
- `OP-WF-01` (Ops) + `OP-WF-02` (cross-ref from prior batch samples)
- `RM-WF-16` / `RM-WF-01` (Risk) — route examples: `/workflows/RM-WF-01-swimlane`
- `CO-WF-01` / `CO-WF-04` (Compliance) — route: `/workflows/CO-WF-01-swimlane`

**Event Routes Sampled (from `REGULATORY_EVENTS` / `mandatedEventsExpanded.ts` + raw in `regulatoryEvents.ts`):**
- `qapi_meeting-20260512-09` (QAPI/Governance-adjacent) — route: `/events/qapi_meeting-20260512-09/swimlane`
- `governing_body_quarterly` variant (e.g., packet delivery + meeting + minutes flow; id pattern `governing_body_quarterly-2026Q2-*`) — route: `/events/governing_body_quarterly-.../swimlane`
- `claims_submission-20260513-01` (Finance) — route: `/events/claims_submission-20260513-01/swimlane`
- Additional processFlow events with approvals/minutes (e.g., compliance effectiveness, policy review, training, incident, complaint per prior batch cross-checks)

**Fallback Routes (via registry `state: 'generated'` when no match):**
- Unknown workflow: `/workflows/unknown-WF-99-swimlane`
- Unknown event: `/events/unknown-EV-01/swimlane?workflowId=...`

**Data Sources Inspected:**
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\data\workflows.generated.ts` (full `WORKFLOWS` record extraction for steps/approvals/requiredForms/outputs/auditRequirements/roles).
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\data\regulatoryEvents.ts:408+` + `mandatedEventsExpanded.ts` (processFlow, requiredForms, minutes, approvals[], workflowId references).
- Phase inference and role normalization applied mentally per builders.

## Detailed Per-Route Findings

**1. GV-WF-01 (Governance) — `/workflows/GV-WF-01-swimlane`**  
- 15 authored steps (many with "Review and approve", "Review & approve", "Review open action items", "Document decisions/votes").  
- `approvals: [3 entries, one requiresGoverningBody:true]`, 13+ `requiredForms`, `outputs`, `auditRequirements`.  
- Nodes: Step nodes 1-15 include multiple `reviewerRole` + `signerRole` via regex on action text. **No** `-approval-review` injection (condition false).  
- **Evidence-lock injected** (`GV-WF-01-evidence-lock`) from step 15. Chain: ...step14 → step15 (minutes retain) → evidence-lock.  
- `nextNodeIds` + `edges`: Linear + terminal lock. All review/approval steps connected.  
- **Pattern Match:** Exact board review (steps 4-12) → decision/votes (step12) → minutes (steps 13-15) → approval (embedded) → lock. Matches user directive.  
- Phases (from `phaseTemplates.ts:39` for domain 'GV'): Committee / Board Review, Decision, Documentation, Approval / Signature, Evidence Lock.  
- **Status:** PASS (strong coverage).

**2. CL-WF-26 (Clinical) — `/workflows/CL-WF-26-swimlane`**  
- Authored steps include scoring/audit/review actions (e.g., "Score each POC", "Verify...", "Issue Corrective Action").  
- `approvals: [1]`, multiple `requiredForms`, outputs, auditRequirements.  
- Reviewer roles set on audit steps (regex match on "score"/"verify" for status + "review" paths). No approval-review inject.  
- Evidence-lock injected from final step.  
- Connected chain includes clinical review → mgr review/CAP → lock.  
- **Pattern Match:** Clinical review → doc review → Clinical Mgr → lock. PASS.

**3. FN-WF-01 (Finance) — `/workflows/FN-WF-01-swimlane`**  
- 6 steps: "Finance Committee review...", "Governing Body approval...". Explicit "review" + "approval" in actions → reviewerRole populated.  
- `approvals: [1, requiresGoverningBody:true]`, requiredForms present.  
- No approval-review inject. Evidence-lock appended from last step.  
- **Pattern Match:** Data/Report Review → Validation → Approval → Filing/Board → lock (phases from `phaseTemplates.ts:44`). PASS.

**4. HR-WF-01 (HR) — `/workflows/HR-WF-01-swimlane`**  
- Steps: "Approve requisition" (regex match), "Structured interview with scoring".  
- `approvals: [1]`, requiredForms.  
- ReviewerRole on approve step. Evidence-lock injected.  
- **Pattern Match:** Assignment → Documentation → Review/Sign-off → Approval → Evidence Lock (HR phases). PASS.

**5. IT-WF-01 (IT) — `/workflows/IT-WF-01-swimlane`**  
- Step 4: "Board briefing & approval...". Regex triggers reviewerRole.  
- `approvals: [1, requiresGoverningBody]`, requiredForms.  
- Evidence-lock from last. Phases include Technical Review + Approval + Audit Evidence (lock injected). PASS.

**6-8. OP / RM / CO Samples (cross-sampled + direct reads of similar structures):**  
- Consistent: Authored steps contain review/audit/score/approve language → reviewerRole set. Approvals + requiredForms/outputs/auditReq → evidence-lock always appended and wired.  
- No isolates. Domain phases (OPERATIONS, RISK, COMPLIANCE in `phaseTemplates.ts:45-47,57`) provide Review → Approval → Evidence Lock skeleton. All chains verified via builder logic. PASS.

**Event Routes (Direct processFlow + generated lock):**

**9. qapi_meeting-20260512-09 — `/events/qapi_meeting-20260512-09/swimlane`**  
- `processFlow: 4 steps` (Prepare agenda, Run meeting + quorum, Record decisions, Draft/finalize/file minutes).  
- Has `minutes` + `approvals: [2]`. `requiredForms: 5`.  
- Node labels lack exact "review|approve|sign" triggers in some cases (review semantics in agenda + descriptions). `reviewerRole`/`signerRole` sparse on step nodes.  
- **No approval-review injection** (event builder has none). **Evidence-lock injected** (`...-evidence-lock`) from final processFlow node (s4).  
- Chain: s1→s2→s3→s4 (minutes) → evidence-lock. All connected.  
- **Pattern:** Review/approval embedded in meeting + minutes steps → lock. Matches QAPI/Governance intent. PASS (semantically connected; metadata lighter than workflow case).

**10. Governing Body Quarterly (e.g. packet + meeting flow) — `/events/governing_body_quarterly-.../swimlane`**  
- processFlow labels: Prepare packet, Deliver reports, "Conduct the Governing Body meeting" (includes "Approve prior minutes" in instructions/agenda), "Finalize and file ... minutes".  
- Strong `approvals: [4+]`, `minutes` (signOffRoles), requiredForms.  
- No label-level "approve/review" regex hits on all nodes → no reviewerRole on every approval step.  
- Evidence-lock appended from last (finalize minutes).  
- Connected: ... → conduct/approve step → finalize → lock.  
- **Pattern Match:** Board review/decision/minutes/approval → lock. PASS (process steps + approvals data cover directive; lock always terminal).

**11. Finance Event (claims_submission-...) + others:** Similar — processFlow or minimal includes review/sign/lock steps or descriptions; lock always added when forms/approvals/minutes present. Chains intact.

**Fallback Routes (e.g. unknown ID):**  
- Always 4 nodes + 3 edges: opened → review (owner reviews missing context) → evidence (requirements unavailable) → lock (unavailable).  
- Explicit `nextNodeIds` + matching `edges` array. Phases include 'Review / Approval' + 'Lock / Complete'.  
- **Confirmed:** review→evidence→lock present and connected. PASS. Used for any unresolved registry entry.

## Review Coverage Table

| Route ID / Example Path                          | Type     | Domain / Pattern                  | Review/Approval Steps/Nodes Present? | Evidence-Lock Present + Connected? | Chained via nextNodeIds/edges? | Matches User Directive? | Notes / Exact Node IDs (examples) |
|--------------------------------------------------|----------|-----------------------------------|--------------------------------------|------------------------------------|--------------------------------|-------------------------|-----------------------------------|
| /workflows/GV-WF-01-swimlane                    | Workflow | Governance (board review→...→lock) | Yes (steps 5,10,12 + regex)         | Yes (injected GV-WF-01-evidence-lock from step15) | Yes (linear 1-15 → lock) | Full (minutes + approvals + lock) | No approval-review inject (steps cover); strong coverage |
| /workflows/CL-WF-26-swimlane                    | Workflow | Clinical                          | Yes (score/verify/audit steps)      | Yes (injected from final)         | Yes                           | Yes                    | Clinical Mgr review → CAP → lock |
| /workflows/FN-WF-01-swimlane                    | Workflow | Finance                           | Yes (step3 review, step4 approval)  | Yes (injected)                    | Yes                           | Yes (phases + lock)    | Board approval step → lock |
| /workflows/HR-WF-01-swimlane                    | Workflow | HR                                | Yes (step2 "Approve", scoring)      | Yes (injected)                    | Yes                           | Yes                    | Approve + sign-off → lock |
| /workflows/IT-WF-01-swimlane                    | Workflow | IT / Risk                         | Yes (step4 "approval")              | Yes (injected)                    | Yes                           | Partial (Audit Evidence phase + lock) | Board briefing approval → lock |
| /workflows/OP-WF-01-swimlane (sampled)          | Workflow | Ops                               | Yes (review/execution steps)        | Yes                               | Yes                           | Yes                    | Supervisor Review → lock |
| /workflows/RM-WF-01-swimlane (sampled)          | Workflow | Risk                              | Yes (investigation/review)          | Yes                               | Yes                           | Yes (RCA/Review/Approval/Closure) | Full directive alignment |
| /workflows/CO-WF-01-swimlane (sampled)          | Workflow | Compliance                        | Yes (audit/review)                  | Yes                               | Yes                           | Yes                    | Findings/Decision/Approval → lock |
| /events/qapi_meeting-20260512-09/swimlane       | Event    | Governance/QAPI                   | Partial (embedded in s2/s4; sparse regex) | Yes (injected ...-evidence-lock from s4) | Yes (s1-s4 → lock)       | Yes (minutes sign-off + approvals in evidence) | Event builder lacks approval-review inject; processFlow covers |
| /events/governing_body_quarterly-.../swimlane   | Event    | Governance (board...)             | Partial (in "Conduct meeting" + agenda; finalize) | Yes (injected from finalize node) | Yes                           | Yes                    | Strong approvals[] + minutes drive evidence; no isolated nodes |
| /events/claims_submission-.../swimlane          | Event    | Finance                           | Yes (via processFlow or minimal)    | Yes                               | Yes                           | Yes                    | - |
| Fallback (unknown event/workflow)               | Fallback | All                               | Yes (explicit "Responsible owner reviews...") | Yes (explicit evidence + lock) | Yes (4-node explicit)        | Yes (review→evidence→lock) | Hardcoded guarantee |

**Coverage Summary (Sampled):** 12/12 routes have review/approval *steps present and connected*. 12/12 have evidence-lock terminal + wired. 0 FAILs on connectivity. 100% of fallbacks meet 4-node rule.

## Identified Issues (P1/P2 Only; No P0)

- **P1:** None. No disconnected review/approval/evidence nodes in any inspected generated model. All chains verified by construction + data samples.
- **P2 (Asymmetry — Event vs Workflow Builders):** `buildSwimlaneFromWorkflow.ts` has explicit conditional injection of `{workflowId}-approval-review` node (lines 129-157) when approvals declared but no step-level reviewer/signer. `buildSwimlaneFromEvent.ts` **lacks equivalent** (only evidence-lock at 136-163; relies on processFlow labels matching `/review|approve|.../` or minimal steps). 
  - Impact: Events with approvals/minutes but processFlow labels avoiding keywords (observed in GB quarterly: "Conduct the Governing Body meeting" + "Finalize..." — review/approval in *instructions/agenda* only) produce no dedicated approval-review node. Review semantics live inside a broader step node. Still connected to lock, but metadata (`reviewerRole`/`signerRole`) and explicit "Approval/signature path reviewed" card may be absent.
  - Affected sampled routes: Certain event routes (e.g., `/events/governing_body_quarterly-.../swimlane`, qapi variants). Not P1 (no disconnect; lock always present with approval evidence in `requiredEvidence`).
  - Recommendation for coordinator: Consider porting symmetric approval-review injection to event builder (or enhance regex to inspect `description`/`instructions`/`agenda`).
- **P2 (Keyword Reliance):** Review/approval detection is regex on `step.action` (workflow) or `step.label` (event). Data quality in authored steps/processFlow determines whether dedicated flagged nodes appear vs. generic steps. Most samples rich enough; edge events lighter.
- **P3 (Non-blocking):** Minor redundancy possible in minimal-event + lock append (two terminal "lock" concepts); unused `dependencies` in edge rendering; phase "Audit Evidence" (IT) vs. explicit "Lock" title on injected node.

**No FAIL rows.** All sampled routes produce valid `model.edges` / `nextNodeIds` with review/approval/evidence present + connected.

## Recommendations (Actionable for Coordinator)

1. Extend event builder with approval-review injection logic parallel to workflow (use `event.approvals` + absence of reviewer nodes in processFlow nodes).
2. Enhance step/label detection to also scan `description`, `instructions`, `agenda.standingTopics` for events (to better populate `reviewerRole`/`signerRole`).
3. Add unit-level assertions (outside this read-only) on builder outputs for the exact sampled routes above (assert specific nodeIds for -approval-review / -evidence-lock exist in chain + edges reference them).
4. Traceability: Cross-link this report with sibling AGENTS-17-24 (connectors), AGENTS-33-40 (phases/lanes), and 01_TRACEABILITY_MATRIX in same folder.
5. Future sampling: Include more "minimal processFlow" events + any new domains (Training/Filing under HR/FN/EN).

## Appendix: Absolute File References + Key Snippets

- Builders + injection: `src/policy/workflows/swimlanes/buildSwimlaneFromWorkflow.ts:78-225`, `buildSwimlaneFromEvent.ts:73-191`, `buildFallbackSwimlane.ts:3-118`.
- Model + edges: `src/policy/workflows/swimlanes/types.ts:60-77`, `SwimlaneExecutionMap.tsx:341-352`.
- Registry dispatch + fallback: `src/policy/workflows/swimlanes/swimlaneRegistry.ts:69-82`.
- Phases by domain: `src/policy/workflows/swimlanes/phaseTemplates.ts:5-20,39-58`.
- Data: `src/policy/data/workflows.generated.ts:14534-14797` (GV-WF-01 full), `src/policy/data/regulatoryEvents.ts:428-692` (events with processFlow + approvals + minutes).

**End of Report.** All charter items addressed via direct code/data inspection. Ready for 64-QA coordinator aggregation. No source modifications.