# Stabilization Rollback Playbook

**Purpose:** This document provides a clear, step-by-step process for executing a rollback during the Stabilization phase. It is designed to be practical and executable under time pressure.

**Scope:** This playbook applies to the Stabilization Precursor Phase only. It is separate from (and does not replace) any rollback procedures in the main UNIFIED_MVP_QA_UIUX_IMPLEMENTATION_PLAN.md.

---

## 1. Rollback Philosophy

- Rollback is a **safety tool**, not a failure.
- We would rather rollback early and cleanly than let a broken change affect training or protected systems.
- Protected Subsystems (eCign, Evidence Center, CES identity) have the highest rollback priority.
- Every wave must have a pre-defined rollback path before changes are deployed.

---

## 2. Rollback Trigger Matrix

Use this matrix to decide when to trigger a rollback.

| Trigger Condition | Severity | Rollback Decision | Owner to Notify | Notes |
|-------------------|----------|-------------------|------------------|-------|
| Navigation (global swipe or broken browser history) still present after Wave 0 | High | Immediate rollback of navigation changes | Frontend Lead + Stabilization Lead | Highest user pain |
| eCign signing flow broken or signer chain integrity fails | Critical | Immediate rollback + freeze on eCign changes | Architecture + Compliance + Engineering Lead | Legal / audit risk |
| Evidence upload or retrieval broken (data loss or audit trail broken) | Critical | Immediate rollback + freeze | Architecture + Compliance | Audit defensibility risk |
| Major form (eCign, Onboarding V2) loses draft state on refresh/interruption after persistence changes | High | Rollback of persistence changes | Frontend Lead | User trust risk |
| Rollback drill fails or takes too long (>30 min) | Medium | Pause further changes until fixed | DevOps + Stabilization Lead | Process not ready |
| Widespread visual or component drift after design system changes | Medium | Partial rollback of affected surfaces | Design Systems + Engineering | - |
| Any P0 Go/No-Go gate fails | High | Automatic hold + rollback decision within 2 hours | All Leads | - |

---

## 3. Rollback Authority & Ownership

| Subsystem / Area | Primary Rollback Owner | Backup Owner | Escalation Contact |
|------------------|------------------------|--------------|--------------------|
| Navigation & History | Frontend Engineering Lead | Stabilization Lead | - |
| eCign (signing, print, integrity) | Architecture Lead + Compliance | Engineering Lead | Project Lead |
| Evidence Center (capture, storage, retrieval) | Architecture Lead + Compliance | Engineering Lead | Project Lead |
| CES Identity & Task Continuity | Architecture Lead | CES Team Lead | - |
| Form Persistence (general) | Frontend Engineering Lead | - | - |
| Design System Changes | Design Systems Lead | - | - |
| Overall Wave Rollback Decision | Stabilization Lead | Project Lead | - |

---

## 4. Rollback Execution Checklist

Use this checklist when executing a rollback.

### Pre-Rollback (Before Starting)
- [ ] Confirm trigger condition from Rollback Trigger Matrix
- [ ] Notify all relevant owners (see Ownership table)
- [ ] Confirm rollback scope (which wave / which changes)
- [ ] Check if any Protected Subsystem is affected
- [ ] Notify users if necessary (especially during training week)

### Execution Steps
1. Identify the last known good state (commit, deployment tag, or configuration).
2. Revert code changes for the affected wave / subsystem.
3. Re-deploy the previous stable version.
4. Verify that the rollback was successful (use Post-Rollback Validation Checklist below).
5. Update status in tracking board and notify team.
6. Document what went wrong and root cause (even if brief).

### Post-Rollback Validation (Mandatory)
Use the **Post-Rollback Validation Checklist** (separate document or section below).

---

## 5. Post-Rollback Validation Checklist

After any rollback, the following must be verified before considering the rollback complete:

- [ ] Affected flows load without errors
- [ ] Browser back/forward works on impacted surfaces
- [ ] No data loss for in-progress work (forms, evidence, signatures)
- [ ] Protected Subsystems (eCign, Evidence, CES identity) are in a known good state
- [ ] Core UAT flows (CES task, Evidence capture, eCign signing) are functional
- [ ] No new console errors introduced by the rollback
- [ ] Team and stakeholders notified of rollback status

---

## 6. Rollback Communication Template

**Subject:** [URGENT] Rollback Executed – [Affected Area] – [Date/Time]

**Body:**
- What was rolled back: [specific changes or wave]
- Reason: [trigger from matrix]
- Current status: [e.g., Rollback completed, validation in progress]
- Impacted users: [e.g., All users, Training cohort, Specific teams]
- Next steps: [e.g., Investigation, fix timeline, re-deployment plan]
- Contact: [Your name + Slack/Teams]

---

## 7. Rollback Drill Requirements

Before any production or UAT-facing wave that touches Protected Subsystems:

- At least **one full rollback drill** must be completed on a non-critical surface.
- Drill must be timed and documented.
- Results must be reviewed by the Stabilization Lead and at least one Engineering Lead.

**Minimum drill success criteria:**
- Rollback completed in under 30 minutes
- All post-rollback validation checks passed
- Clear documentation of steps taken

---

## 8. When to Pause Instead of Rollback

In some cases, it may be better to **pause deployment** rather than rollback:

- When the issue is isolated to a small, non-critical feature
- When rollback would cause more disruption than the bug itself
- When the fix can be deployed faster than a rollback + re-deployment

Decision to pause vs rollback should involve the Stabilization Lead + relevant subsystem owner.

---

**Document Status:** Living. Update after every rollback drill or actual rollback event.

---

*This playbook is intentionally practical and lightweight so it can be used under time pressure during the Stabilization phase.*