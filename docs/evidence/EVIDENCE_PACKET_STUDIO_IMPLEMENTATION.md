# Evidence Packet Studio Implementation

## Location

Evidence Packet Studio is integrated inside Evidence Center, not as a top-level navigation item.

- Route: `/evidence/packet-studio`
- Main nav parent: Compliance / Evidence Center
- Subnav label: `Evidence Packet Studio`
- Entry from Evidence Center: `Open Evidence Packet Studio`

## Registry

Reusable packet definitions live in:

`src/policy/evidence/packetStudio/evidencePacketTypes.ts`

Resolver and draft-building helpers live in:

`src/policy/evidence/packetStudio/packetStudioResolvers.ts`

UI lives in:

`src/policy/evidence/packetStudio/EvidencePacketStudio.tsx`

## Supported Packet Types

The registry includes monthly, quarterly, annual, event-based, and custom packet families:

- QAPI Quarterly Committee Meeting Packet
- Governing Body / Board Meeting Packet
- Clinical Record Review Committee Packet
- Infection Control Committee Packet
- Patient Safety Committee Packet
- CAG / PAC Advisory Meeting Packet
- Staff In-Service / Training Packet
- Emergency Preparedness Drill Packet
- Annual HIPAA Training Completion Packet
- TB Screening / Employee Health Packet
- Annual Personnel File Audit Packet
- Annual OIG / SAM Exclusion Check Packet
- Annual Policy Review Packet
- Monthly Physician Signature Tracking Packet
- Plan of Care Audit Packet
- OASIS Accuracy Audit Packet
- Medication Reconciliation Audit Packet
- Incident / Adverse Event Review Packet
- Complaint / Grievance Investigation Packet
- Monthly Infection Surveillance Review Packet
- Vulnerability Scan / IT Security Packet
- Compliance Validation Checklist Packet
- Monthly Compliance Report Packet
- Monthly Claims Submission / Billing Compliance Packet
- Annual Competency Validation Packet
- Wound Protocol / Clinical Protocol Update Packet
- Audit Mode Survey Packet
- Annual QAPI Program Evaluation Packet
- Monthly Evidence Readiness Packet
- Custom Event Packet

## Known Partial Mappings

Packet definitions use `mappingStatus`:

- `ready`: sources are mapped to current app event/workflow/form/evidence concepts.
- `partial`: app source IDs exist for part of the packet but not every section is fully automated.
- `needs_mapping`: the packet is visible in the registry and UI, but source mapping must be completed before it can be Brad-ready.

Current `needs_mapping` packet types:

- CAG / PAC Advisory Meeting Packet
- Emergency Preparedness Drill Packet
- TB Screening / Employee Health Packet
- Annual Personnel File Audit Packet
- OASIS Accuracy Audit Packet
- Medication Reconciliation Audit Packet
- Complaint / Grievance Investigation Packet
- Compliance Validation Checklist Packet
- Wound Protocol / Clinical Protocol Update Packet
- Monthly Evidence Readiness Packet
- Custom Event Packet

## Brad-Assisted Workflow

The Studio represents Brad as a drafting assistant:

1. Select a source such as CES event, evidence set, signed forms, Brad draft, manual upload, or custom packet.
2. Select a packet type from the registry.
3. Resolve event metadata, workflow data, forms, signed packages, evidence, Brad summaries, audit logs, manual uploads, and appendices.
4. Show missing sources and recommended next actions.
5. Save the draft back into Evidence Center for human review.

Brad can draft and summarize, but the UI keeps human review explicit. Export and PDF download actions remain disabled until an approved export handler and review gate are wired.

## Evidence Output Model

The first implementation saves packet drafts through the existing `useRegulatoryExecutionStore().uploadEvidence()` path with:

- `artifactType: "evidence"`
- `artifactVersion: "packet-studio-v1"`
- `artifactId: packetId`
- `kind: "report"`
- JSON metadata in `note` containing packet ID, packet type, event/workflow/form/policy IDs, generatedBy, createdAt, exportStatus, signatureStatus, and packetStatus.

This avoids creating a competing evidence model while preserving packet metadata for future artifact viewer integration.

## Theme Notes

The Studio uses existing V2 classes and CSS variables:

- `bg-surface`
- `bg-surface-glass`
- `bg-tone-slate-bg`
- `border-hairline`
- `border-card`
- shared `ToneTag`, `ToneBadge`, `MetricGrid`, and `Button`

It inherits Morning, Noon, Afternoon, and Night from the app theme system and does not introduce a standalone PDF Studio theme.

## Verification Checklist

- `/evidence`
- `/evidence/packet-studio`
- `/ces/calendar`
- `/audit`
- Brad page `/iadministrator`
- Morning / Noon / Afternoon / Night theme surfaces
- TypeScript and production build

