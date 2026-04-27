# KB-017 — Reassigning a Unit

**Audience:** Workflow owners, managers. **Time to read:** 2 minutes.

You can reassign an execution unit to another qualified user. The new
owner must hold the role required by the workflow definition.

## How

1. Open the unit drawer.
2. Click the **Owner** chip near the top.
3. Pick a new owner from the searchable dropdown. Only users with the
   required role appear.
4. (Optional) write a handoff note in **Notes**.
5. Click **Confirm Reassignment**.

## What happens

- The new owner gets an in-app and email notice.
- The previous owner sees the unit drop off their **My Work** filter.
- An entry is written to the unit's Audit Trail with both user IDs.

## What you cannot reassign

- **Approver** and **Signature Owner** chips — these are role-bound by
  the workflow and only an Administrator can override (governance
  exception required).
- **Recurring units (R1–R8)** that are owned by `System`.
- **Certified & Locked** events — read-only.

## Bulk reassignment

If a team member is on extended leave, the Administrator can run a bulk
reassignment from **Workflows → Roster Management**. End users cannot
trigger this.

## Related

- [KB-002 — How to Complete an Execution Unit](KB-002-Complete-Execution-Unit.md)
- [KB-006 — Sending a Unit for Signature](KB-006-Send-For-Signature.md)
