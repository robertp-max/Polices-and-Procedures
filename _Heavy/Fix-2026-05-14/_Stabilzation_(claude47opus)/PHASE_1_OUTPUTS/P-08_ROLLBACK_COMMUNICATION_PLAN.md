# P-08: Rollback Communication Plan

**Date:** 2026-05-16  
**Scope:** Stabilization Precursor Phase only (internal UAT / training prep)  
**Audience:** ~100 internal training users (mostly office staff) + engineering/stakeholder leads

---

## 1. Purpose & Scope

This plan defines how rollback decisions and status are communicated during Stabilization. It triggers for:

- Live rollback executions (any trigger from the Rollback Trigger Matrix).
- Scheduled rollback drills (per §7 of the Rollback Playbook).

It covers **only** Stabilization-phase rollbacks for the Care Indeed Home Health system. It does **not** replace full incident response, external customer communications, or status pages.

---

## 2. Communication Tiers

### Tier 1 – Internal Engineering (Immediate)
- **Channel:** Slack/Teams engineering channel (#stabilization or #eng-alerts)
- **Timing:** Within 2 minutes of rollback decision
- **Content:** Flash notice with trigger, scope, and owner
- **Owner:** DevOps or the executing engineer

### Tier 2 – Stakeholder Leads (15 minutes)
- **Recipients:** Stabilization Lead, Engineering Lead, Architecture Lead, Compliance (if Protected Subsystem involved), DevOps Lead
- **Channel:** Dedicated Slack/Teams thread or direct message group
- **Timing:** Within 15 minutes of rollback decision
- **Content:** Brief with impact assessment and next-step timeline
- **Owner:** Stabilization Lead (or delegate)

### Tier 3 – End Users (~100 training users) (30 minutes, only if user-visible)
- **Channel:** In-app banner (preferred) + email to training cohort list
- **Timing:** Within 30 minutes of rollback decision **and before users encounter the issue**
- **Content:** Short, calm notice (see template below)
- **Owner:** Stabilization Lead (coordinates with training coordinator)

---

## 3. Decision Matrix

Use the **Rollback Trigger Matrix** in `STABILIZATION_ROLLBACK_PLAYBOOK.md` §2 to determine severity and required owners.

- **Critical / High severity** (eCign, Evidence, navigation, data loss): Activate Tiers 1 + 2 immediately; Tier 3 if user-facing.
- **Medium severity** (design drift, drill failure): Tiers 1 + 2 only, unless user-visible.
- **Protected Subsystems** (eCign, Evidence Center, CES identity): Always include Compliance in Tier 2.

Cross-reference the matrix for exact trigger conditions and primary owners — do not restate here.

---

## 4. Pre-written Templates

### a. Tier 1 – Internal Flash Notice (Slack/Teams)

```
[URGENT] ROLLBACK INITIATED – [Affected Area/Wave] – [Timestamp]

Trigger: [Exact condition from Rollback Trigger Matrix]
Scope: [Specific changes / commits being reverted]
Owner: [Role executing rollback, e.g., DevOps]
ETA to stable: [e.g., 15–30 min]
Next update: [Time or "after validation"]
Thread: [Link to Tier 2 thread if exists]
```

### b. Tier 2 – Stakeholder Briefing (Slack/Teams or email)

```
Subject: [STABILIZATION] Rollback Executed – [Affected Area] – [Date/Time]

What: Rollback of [specific wave / changes] triggered by [matrix condition].
Why: [One-sentence root cause or trigger; e.g., "eCign signer chain integrity check failing post-deploy"].
Impact: [Protected Subsystem? User-visible? Training cohort affected?]
Status: Rollback complete. Post-rollback validation in progress (see P-07 checklist).
Next steps: [e.g., Root-cause investigation by [Owner], fix ETA, re-deploy plan].
Protected Subsystem note: [If applicable – Compliance notified].
Contact: [Stabilization Lead Slack handle]
```

### c. Tier 3 – User-Facing Banner / Email (Short & Calm)

**Banner (in-app, max 2 lines):**
```
Training environment update: We rolled back a recent change to keep everything stable for your sessions. No action needed. We'll notify you when resolved.
```

**Email (to training cohort list):**
```
Subject: Quick update on today's training environment

Hi team,

We performed a quick rollback on the training system to ensure a smooth experience for your sessions next week. Everything is back to the previous stable state.

No action is required from you. We'll send an all-clear note once full validation completes.

Thank you for your patience,
Stabilization Team
```

### d. Rollback Complete / All-Clear Notice

**Subject:** [ALL CLEAR] Rollback Complete – [Affected Area] – [Date/Time]

```
Rollback of [area/wave] is complete and validated.

- Affected users: [None / Training cohort only / Specific teams]
- Validation passed: [Key items from P-07 checklist – e.g., "Core flows, eCign signing, data integrity confirmed"]
- Root cause: [Brief, e.g., "Navigation persistence regression introduced in Wave 2"]
- Fix path: [e.g., "Fix in progress; re-deploy targeted for [date/time] or next wave"]
- Next training impact: [None expected / Minor delay in one flow – details below]

Thank you,
Stabilization Lead
```

---

## 5. Channels Matrix

| Tier | Primary Channel          | Secondary / Fallback     | Notes |
|------|--------------------------|--------------------------|-------|
| 1    | Slack/Teams #eng-alerts  | Direct DM to leads       | Instant, low noise |
| 2    | Slack/Teams thread       | Email to leads group     | Keep in one thread for history |
| 3    | In-app banner + email    | Training coordinator DM  | Only if user-visible; banner first |
| All-Clear | Same as triggering tier | Email summary to all     | Include link to retrospective note |

---

## 6. Quiet-Period Rules

- **No rollback communications during scheduled training sessions** unless the failure is user-visible.
- If a rollback is required and user-visible: **Tier 3 notice must be sent BEFORE users encounter the issue** (priority over quiet period).
- During drills: Use Tier 1 + 2 only; no Tier 3 unless the drill itself becomes user-visible.
- Training coordinator is notified in advance of any planned drill that could affect sessions.

---

## 7. Communication Owners

| Tier / Action              | Owner Role                  | Backup                  |
|----------------------------|-----------------------------|-------------------------|
| Tier 1 flash notice        | DevOps / Executing Engineer | Frontend Lead           |
| Tier 2 stakeholder briefing| Stabilization Lead          | Engineering Lead        |
| Tier 3 user notice         | Stabilization Lead          | Training Coordinator    |
| All-clear notice           | Stabilization Lead          | Engineering Lead        |
| Post-rollback retrospective| Stabilization Lead          | Architecture Lead       |

---

## 8. Post-Rollback Retrospective Comms

After validation completes (P-07 checklist passed):

- Send a short follow-up note (same channels as all-clear) summarizing:
  - Confirmed root cause (1–2 sentences)
  - Fix path and re-deployment timeline
  - Any process or test improvements identified
- Keep it factual and forward-looking; no blame.
- Link to the updated tracking board entry.

This note closes the communication loop for the rollback event.

---

**Status: Ready for Phase 1 close-out**  
**Date: 2026-05-16**