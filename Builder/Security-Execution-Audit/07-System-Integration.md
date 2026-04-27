# 07 — System Integration

**Layer:** Integration (INT). Adapters normalize inbound work to CEUs and route outbound state to AEL.

---

## 1. Onboarding Engine
- **Inbound:** new hire created → bundle of `Onboarding Step CEUs` (one per required step). Each step inherits required roles, evidence, signatures from the onboarding template version.
- **Outbound:** completion of onboarding bundle → `USER_PROVISIONED` event; identity layer enables relevant `RoleAssignment` rows; `field_clearance` gate becomes satisfiable.
- **Adapter responsibilities:** enforce template version pinning (no silent template drift); generate `correlationId = onboarding_<hireId>`.

---

## 2. CES (Compliance Execution Sprints)
- The CES board is a **view** over CEUs filtered by sprint membership (`bundleId = sprintId`).
- Sprint state transitions are computed from member CEUs (Doc 03 §8 parent derivation).
- Sprint-level actions (assign all, set due date) fan out to per-CEU mutations, each individually authorized and audited.
- Existing module: [src/policy/compliance-execution](src/policy/compliance-execution) is wrapped/aligned to CEU types via the adapter.

---

## 3. Policy Lifecycle
- **Inbound triggers:** draft created, version submitted for approval, version published, version retired.
- Each event produces the appropriate CEU(s):
  - Submit for approval → `Policy Approval CEU` per required approver.
  - Publish → `Policy Acknowledgement CEU` per affected role/user.
  - Retire → `Retirement Acknowledgement CEU` for owners of affected workflows.
- Every CEU pins `PolicyVersionRef` immutably.
- **Outbound:** `POLICY_APPROVED` / `POLICY_PUBLISHED` events feed CES dashboards and Survey readiness packets.

---

## 4. eCIgn (signatures)
- All signatures route through eCIgn. Adapter responsibilities:
  - Map a CEU's `SignatureRequirement[]` to eCIgn signing envelopes/templates.
  - Receive eCIgn callback (`SIGNATURE_COLLECTED`) and:
    - Verify callback signature.
    - Verify document hash matches the requirement.
    - Append `SignatureRecord` to CEU.
    - Emit `SIGNATURE_COLLECTED` audit event chained to `SIGNATURE_REQUESTED`.
  - Reject any direct write to `signatures.collected` not originating from a verified callback (`SIGNATURE_BYPASS_ATTEMPT`).
- Existing module: [src/policy/ecign](src/policy/ecign) provides the print/signing pipeline; adapter binds it to CEUs.

---

## 5. Calendar (scheduled compliance events)
- Calendar events with `compliance:` tag generate `Scheduled Compliance CEUs` ahead of the event window (default: SLA = event start; createdAt = start − 14d).
- Recurrence rules generate **separate CEU instances** per occurrence (no reuse, no silent rebase).
- Existing services: [server/googleCalendar.ts](server/googleCalendar.ts), [scripts/pushAllEvents.ts](scripts/pushAllEvents.ts).

---

## 6. Audit Mode (survey readiness)
- Reuses CEU + AEL primitives. No parallel data store.
- Survey packet builder ([src/policy/audit/surveyPacket.ts](src/policy/audit/surveyPacket.ts)) consumes:
  - CEUs filtered by survey scope (domain, date range).
  - AuditEvents for those CEUs (full chain).
  - Linked PolicyVersionRef snapshots and signature records.
- Output bundle is itself an audit event (`EXPORT_GENERATED`) with chain root and watermark.

---

## 7. Generic Adapter Contract

```
interface IntegrationAdapter<TInbound, TOutbound> {
  id: string                          // 'onboarding', 'ecign', 'calendar', ...
  ingest(input: TInbound, ctx: IntegrationContext): Promise<CeuId[]>
  applyCeuStateChange(ceu: CeuRef, change: CeuStateChange, ctx): Promise<void>
  verifyCallback(payload, signature): boolean
}
```

`IntegrationContext` carries `correlationId`, `actor` (always the integration's system identity), and `requestId`. All adapter calls flow through IAL/EUL/AEL like any other actor.

---

## 8. Integration Anti-Patterns (rejected)

- Adapter writing directly to `audit_events` outside the AEL service.
- Adapter mutating CEU fields without going through the state machine.
- Adapter bypassing `phi` flags when forwarding to external systems.
- Adapter retaining a private "tasks" table.
