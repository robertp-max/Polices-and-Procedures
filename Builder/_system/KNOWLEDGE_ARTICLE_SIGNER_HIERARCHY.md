# Knowledge Article: Canonical Signer Hierarchy

## Summary
The swimlane system now resolves signer paths from a canonical hierarchy instead of ad hoc UI actions or weak per-form guesses.

## Key rules
- Every signer task must be generated from canonical execution context.
- Signer tasks are deterministic.
- The eCIgn system lane never replaces a human signer.
- Reviewer and final-approver paths are explicit, not implied.

## Deterministic signer task identity
Signer task format:

`SIGN-{eventId}-{workflowId}-{parentTaskId}-{formId}-{signatureSlot}-{signerRoleSlug}`

This prevents duplicate signer tasks during regeneration or reopen scenarios.

## Domain defaults
- Governance routes to Governing Body approval.
- Clinical routes to Clinical Manager and, when needed, Director of Nursing.
- QAPI routes through QAPI Chair plus clinical/compliance/infection/data reviewers as applicable.
- Compliance routes through Compliance Officer.
- HR routes through employee, supervisor, HR, or administrator depending on the task.
- Finance, Operations, IT / Security, and Risk use their own owner/reviewer/approver defaults.

## QAPI-specific behavior
QAPI reviewer inference uses the task context:
- dashboards and metrics -> `Data Analyst / Quality Source`
- RCAs, care-quality issues, and clinical findings -> `Clinical Manager`
- complaints, sanctions, exclusions, regulatory exposure -> `Compliance Officer`
- infection findings -> `Infection Preventionist`
- committee minutes and voting items -> `Committee / Voting Members`

## Form metadata precedence
Signature requirements are resolved in this order:
1. explicit form `signerSlots`
2. event/workflow approval rules
3. acknowledgment/attestation heuristics
4. domain hierarchy fallback

## What is no longer allowed
- creating signer tasks from button clicks
- creating signer tasks from form-status side effects
- using random IDs or weak `eventId + formId + signerRole` IDs
- using the evidence lane as a human signer substitute
