# PM-Risks-and-Controls

**Phase:** Architecture only.
**Cross-refs:** all PM-* docs.

---

## 1. Purpose

Catalog the risks introduced by the PM Layer and the controls that mitigate them. Risks are grouped by category. Each risk has likelihood (L), impact (I), and a documented control.

---

## 2. Compliance Risks

| # | Risk | L | I | Control |
|---|---|---|---|---|
| C1 | PM "done" mistaken for compliance complete | M | H | Compliance KPI counts CES-validated `done` only; Kanban drag-to-done disabled for CES tasks; "Mark Done" never rendered for CES in drawer |
| C2 | Personal task counted in compliance | L | H | Source discriminator filtered server- and client-side; tests assert |
| C3 | PM overlay mutates CES state | L | C | Architectural rule: PM never imports CES write paths; lint rule + code review checklist |
| C4 | Weekend scheduling without justification | M | M | Weekend override requires reason; audit entry; report surfaces overrides |
| C5 | CES blocker not surfaced in PM views | M | H | Status mapping table exhaustive; CES change subscription drives projection |
| C6 | Approval routed wrongly via PM | L | C | Approver field read-only from CES; PM cannot create approvals |

L = likelihood, I = impact (L/M/H/C=Critical).

---

## 3. Data Integrity Risks

| # | Risk | L | I | Control |
|---|---|---|---|---|
| D1 | Orphan overlay rows after CES re-numbering | M | M | Stable `{event.id}-{NN}` IDs; orphan reaper job; alerts on unmatched IDs |
| D2 | Duplicate Task IDs | L | H | Construction rule guarantees uniqueness; DB unique index |
| D3 | Cycles in dependency graph | M | M | DFS cycle check on insert; server-side re-check on commit |
| D4 | Concurrent overlay writes overwrite | M | M | Last-write-wins on simple fields; explicit version stamp on critical fields (assignees, sprint_id) |
| D5 | Sprint window math error | L | H | Single pure function; tests across 2024–2030 |

---

## 4. Performance Risks

| # | Risk | L | I | Control |
|---|---|---|---|---|
| P1 | Gantt slow with thousands of tasks | M | M | Virtualization; viewport-only link rendering; server-side scoping |
| P2 | Kanban re-renders on every CES tick | M | M | Selector memoization; debounced projection recompute |
| P3 | Reports overload DB | M | M | Nightly snapshots; query timeouts; pagination |
| P4 | Bundle bloat from SVAR | M | M | Per-route lazy load; bundle budget enforced in CI |
| P5 | Notification storm on bulk ops | M | M | Coalescing per `(user, task, window)` |

---

## 5. Security & Privacy Risks

| # | Risk | L | I | Control |
|---|---|---|---|---|
| S1 | Permission leakage via shared filter URL | M | H | Permission filter applied at selector + endpoint; URL contains filters, not data |
| S2 | Personal task visible to managers without consent | M | M | Personal tab default-private; explicit visibility flag for opt-in |
| S3 | Notification reveals existence of restricted tasks | L | H | Audience computed via permission filter before notification creation |
| S4 | Audit trail tampering | L | H | `pm_audit` append-only, write-only API, periodic checksum job |
| S5 | XSS via task title/description | M | H | Sanitization on render; markdown allowlist; CSP headers |
| S6 | Mass-assignment via overlay endpoints | M | M | Endpoint validators with explicit allowlists |

---

## 6. Operational Risks

| # | Risk | L | I | Control |
|---|---|---|---|---|
| O1 | Feature flag mis-flip exposes incomplete view | M | M | Flag rollout staged; canary users first |
| O2 | Roll-over leaves tasks orphaned | L | M | Atomic transaction; verification step before commit |
| O3 | Email digest job lag | M | L | Job monitoring + retry with backoff |
| O4 | SVAR licensing change | L | M | Adapter pattern enables swap; license audit annually |
| O5 | Documentation drift | M | M | PM-* docs versioned; updated as part of phase exit checklist |

---

## 7. Vendor / Library Risks

| # | Risk | L | I | Control |
|---|---|---|---|---|
| V1 | SVAR PRO needed for advertised feature | M | M | Pre-implementation feature audit per phase; OSS-first design |
| V2 | SVAR breaking changes between versions | M | M | Pin major version; adapters absorb diffs; release-note review |
| V3 | Sub-dependency vulnerabilities | M | M | Dependabot/Renovate; CVE policy |
| V4 | Tree-shake failure inflates bundle | M | M | Bundle analyzer in CI |

---

## 8. UX Risks

| # | Risk | L | I | Control |
|---|---|---|---|---|
| U1 | View-to-view inconsistency in status | L | H | All views share canonical Task selector |
| U2 | Drag/drop a11y regression | M | M | Keyboard-equivalent menus; Axe + manual a11y audit |
| U3 | Information overload in drawer | M | M | Collapsible sections; defaults tuned |
| U4 | Notification fatigue | H | M | Daily digest default; quiet hours; snooze |

---

## 9. Controls Matrix Summary

- **Architectural:** strict directionality (CES write only via CES); adapter isolation; canonical selector.
- **Process:** phased rollout with flags; licensing audit gates; doc updates as phase exit.
- **Technical:** unique IDs, unique indexes, cycle detection, audit append-only, sanitization, permission filter at selector.
- **Operational:** monitoring, alerts, dependabot, bundle-budget CI gate.

---

## 10. Acceptance Criteria

- Every PM doc cross-references at least one risk here.
- Every "C" (compliance) and "S" (security) risk has explicit control.
- Bundle, performance, and a11y controls have automated gates.
- Audit trail is append-only and verifiable.

---

## 11. Verification Checklist

- [ ] Each control mapped to an owner.
- [ ] CI gates wired (bundle budget, perf, a11y).
- [ ] Permission filter unit tested.
- [ ] Audit append-only verified at the API layer.
- [ ] Annual licensing/dependency review scheduled.
- [ ] Drag-to-done disabled for CES tasks (RTL test).
