# OSS Engine Review — Flowable, Drools, ChatScript, Activiti

**Date:** 2026-07-09 · **Method:** shallow clones reviewed by four parallel architecture agents against real source (not memory), briefed on this codebase's context: Brad's deterministic responder, the 206-workflow expert, evidence/QAPI approval pipelines, CMS/ACHC audit needs.
**Clones:** scratchpad `oss-review/` (temp — flowable-engine 72M, drools 36M, ChatScript 1.1G, Activiti 6.x 17M). Delete when done.

**The four projects converge on one lesson for us:** everywhere we encode behavior as *ordered code* (regex array position, loop-breaks-on-first-match, inline side effects), the mature engines encode it as *data with declared semantics* (salience, mutex groups, hit policies, operation queues) plus *tooling that verifies the declarations*. The Brad stabbing-misroute bug was exactly the failure mode this architecture class exists to prevent.

---

## 1. Flowable (priority 1 — BPMN/DMN) — richest source of adoptable patterns

**Architecture:** three clean layers per artifact (pure data model ↛ XML converter ↛ engine); DMN hit policies as one strategy object per policy (`HitPolicyUnique/First/Priority/Collect/…` implementing narrow capability interfaces); execution as an **agenda/operation queue** (each operation does one step, pushes the next; wait state = the queue simply stops and an `ExecutionEntity` row persists — no live object between steps); async via persisted jobs; **deployments are immutable versioned bundles** (key + monotonic version, old versions stay resolvable); **`HistoryLevel` ordered enum** (`NONE<INSTANCE<TASK<ACTIVITY<AUDIT<FULL`) checked via `isAtLeast()` at every write site; every API call compiles to a Command through one executor.

**Adopt:**
1. **Hit-policy strategy objects** for the workflow expert's match resolution (first/priority/unique/collect as named, swappable, testable strategies — ambiguous matches become detectable instead of silent).
2. **Operation-queue with persisted wait states** for evidence/QAPI packet pipelines — "await approval" is the queue stopping; state is a serialized JSON instance document; resume is a new command.
3. **`HistoryLevel`-style single audit-depth knob** instead of scattered logging booleans — easy to prove to a surveyor.
4. **Command chokepoint + middleware** for every state-changing action (audit logging in one place).
5. **Immutable versioned definitions** — workflow/policy snapshots per key+version so historical records point at the exact version they were evaluated against. *Highest survey-defensibility value in the whole review.*

**Don't copy:** full BPMN node-type fidelity (multi-instance/compensation/event subprocesses), the module-per-concern ceremony, the multi-tenant DB/cache machinery.

## 2. Drools (priority 2 — rules/decision tables) — the diagnosis of our router bug class

**Architecture:** rules compile into a Rete/Phreak network; matching and firing are decoupled (matches queue as activations on an agenda); **conflict resolution is explicit metadata** — `salience` first, declaration order only as tiebreak; **activation-groups** are first-class mutual exclusion (one fires, the rest are actively cancelled); agenda-groups stage rules into phases; decision tables are rows-of-data transpiled to rules; `drools-verifier` exists because the project itself treats "are my priorities/overlaps actually right" as a distinct QA problem needing static analysis.

**Adopt:**
1. **Priority + mutex-group metadata on Brad's routing rules** — array position stops being the source of truth; safety-critical > domain > fallback tiers with declared mutex groups ("who is the victim" alternatives compete inside one named group). Reordering a file can no longer silently change routing.
2. **Decision-table-as-data with a declared hit policy per table** — the compliance layer's "which forms apply to this event" is a COLLECT table; incident classification is a PRIORITY table. Naming the policy (instead of burying it in loop code) is the lesson.
3. **Static overlap/shadow verification in CI** — flag: overlapping rules in one mutex group with no priority tiebreak; rules unreachable because a higher-priority pattern is a strict superset; safety-tagged categories with no mutex group. Catches the "patient stabbed me" class *before* anyone writes the regression test.

**Don't copy:** Rete/Phreak networks (wrong scale), FEEL as an expression language, truth-maintenance/belief systems.

## 3. ChatScript (priority 3 — deterministic dialog) — the fix for Brad's UX gaps

**Architecture:** topics with keyword gates; rule kinds (responders / gambits / **rejoinders** = follow-ups scoped to the next user turn); an ordered control pipeline (pending rejoinder → current topic → other keyword-matching topics → gambits → fallback) that degrades gracefully; **concept sets** (`~yes`, `~emotions` — composable canonical word/phrase unions with exclusions) instead of raw regex; per-user persisted variables + fact triples for structured memory; **`:verify` regression tooling** asserting every rule is still reachable and still fires on its sample inputs.

**Adopt (all four map straight onto Brad):**
1. **Concept sets** — named, reusable, canonicalized vocabulary units (`~affirmative`, `~weapon-violence`, `~self-symptom`) replacing scattered regex alternations; a light canonicalizer (lowercase, punctuation, small synonym/typo map), *not* a full NLP parser.
2. **Rejoinder / pending-follow-up state** — Brad asks "Are you safe right now?" and today a reply of "yes" dead-ends into workflow search. A `pendingFollowUp {parentIntent, ttlTurns, handlers: ~yes/~no/~unsure}` stack checked *first* in the routing pipeline turns safety checks into real multi-turn dialogs. **This is the single highest-impact Brad improvement in the whole review.**
3. **Named pipeline stages + active-topic bias** — formalize the existing order (identity → persona → follow-up → urgent → topics → workflow → fallback) as inspectable stages; keep a last-topic pointer to bias ambiguous mid-conversation messages.
4. **`:verify`-style intent regression** — every intent ships sample utterances (incl. typos); CI asserts each still wins. Complements the protection suites, same spirit as Drools' verifier.

**Don't copy:** the `.top` DSL and its interpreter, the bundled English parser/POS tagger, stringly global variables.

## 4. Activiti 6.x (priority 4 — reference only) — confirms the lineage

Classic 6.x is the exact codebase Flowable forked; its agenda/command/interceptor designs are the ancestors of Flowable's (verified in source: `impl/agenda/`, `impl/interceptor/CommandInvoker`, ~165 command classes, 41-value typed event enum). Takeaways are the same three shapes — command+middleware chokepoint, operation queue, wait-state-as-persisted-pointer + typed event enum. **Cautions:** frozen 2017-era legacy; loose task-lifecycle modeling (`DelegationState` scattered sub-states) — don't copy. When in doubt, read Flowable instead; use Activiti only to see the pattern in its simplest pre-elaboration form.

---

## Recommended adoption roadmap (proposals — each is its own effort)

| Phase | What | Source pattern | Size |
|---|---|---|---|
| 1a | Brad router: priority tiers + mutex groups on second-chance rules; verifier script (samples per rule + shadow/overlap detection) wired into `verify:brad-protection` | Drools salience/activation-groups/verifier, ChatScript `:verify` | S–M |
| 1b | Brad rejoinders: pending-follow-up stack + `~affirmative`/`~negative` concept sets ("Are you safe?" → "yes" works) | ChatScript rejoinders + concept sets | M |
| 2 | Workflow expert: declared hit policy per lookup pass; immutable version stamps on workflow/policy definitions | Flowable DMN + deployments | M |
| 3 | Evidence/QAPI pipelines: operation-queue instance model, persisted wait states for approval gates, HistoryLevel audit knob, command chokepoint | Flowable/Activiti agenda + command | L |

Nothing here requires embedding a Java engine — every adoption is a lightweight TypeScript re-interpretation of a *concept*, consistent with the codebase's deterministic, no-internet, protection-gated philosophy.
