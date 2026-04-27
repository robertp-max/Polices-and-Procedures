# 04 · UI Components

Implements Phase 7. All five required UI components exist or are specified
below; each row maps to its source file and design tokens.

---

## 1. Signature Dashboard — `/forms`

**File:** [src/policy/pages/FormsPage.tsx](../../src/policy/pages/FormsPage.tsx)

| Region | Content |
|---|---|
| Header | Title, search, filter (status, governing policy, assignee) |
| Tabs | Pending · Completed · Expired · Voided |
| Risk indicators | Late (overdue), Missing required signer, Stale draft (> N days) |
| Row actions | Open · Send for 2nd Signature · Export Audit · Void & Re-issue |
| KPI strip | Total pending, % on-time, late count (last 30 days) |

> The dashboard reads from `formInstances` joined with `audit_events` to derive
> live state. No state is duplicated.

---

## 2. Document Viewer — `/forms/:formId`

**File:** [src/policy/components/FormViewer.tsx](../../src/policy/components/FormViewer.tsx)
combined with [FormSigningWorkspace.tsx](../../src/policy/components/FormSigningWorkspace.tsx).

```
┌────────────────────────────────────┬─────────────────────────────┐
│                                    │  AUDIT + SIGNER PANEL       │
│                                    │  ─────────────────────────  │
│                                    │  Signer:    JD Vance        │
│                                    │  Role:      Admin Designee  │
│                                    │  IP:        2601:647:...    │
│        FORM TEMPLATE               │  Geo:       Sunnyvale, CA   │
│        (read-only render of        │  Device:    LENOVO 83EY     │
│         EN-FM-033 etc.)            │  OS:        Win 11 Pro      │
│                                    │  ─────────────────────────  │
│        --- LOCKED LAYOUT ---       │  Doc Hash:  3f9c…b21a       │
│                                    │  Version:   v6.0            │
│                                    │  Policy:    EN-CM-001       │
│                                    │  Workflow:  wf_42           │
│                                    │  ─────────────────────────  │
│                                    │  STEPPER                    │
│                                    │  ① Sign   ② Verify          │
│                                    │  ③ Review ④ Options         │
└────────────────────────────────────┴─────────────────────────────┘
```

**Brand tokens** (single source — `FormSigningWorkspace.tsx`):

```ts
const NAVY        = '#1A3778';
const NAVY_DEEP   = '#122555';
const NAVY_SOFT   = '#EEF1FA';
const ORANGE      = '#F04B22';
const ORANGE_SOFT = '#FFF0EB';
const INK         = '#1F1C1B';
const MUTED       = '#747470';
const PAPER       = '#FAFBF8';
const BORDER      = '#E5E4E3';
```

---

## 3. Signature Panel

A vertical region inside the right rail (or a focused full-screen step on
mobile). Composed from the design's `SignatureStep`:

| Sub-component | Source |
|---|---|
| Mode toggle (Draw / Type / Upload) | `FormSigningWorkspace` |
| Canvas with clear / undo | `FormSigningWorkspace` |
| Identity status badge (verified / step-up needed) | `FormSigningWorkspace` |
| Required-actions checklist | derived from upstream audit events |
| Attestation checkbox + "Apply Signature" CTA | `FormSigningWorkspace` |
| Optional photo verification | `FormSigningWorkspace` (camera step) |

---

## 4. Audit Trail Viewer

**File:** [src/policy/audit/](../../src/policy/audit) — viewer surfaces in
`AuditModePage.tsx` and as the *Audit Trail* tab inside the document viewer.

Layout:

```
Filter bar:  [ Action kind ▾ ] [ Actor ▾ ] [ Date range ] [ Search ]
Timeline:
  ●  2026-04-24T17:05:11Z   consent.accepted          JD Vance
  │
  ●  2026-04-24T17:05:38Z   identity.verified         JD Vance · OTP
  │
  ●  2026-04-24T17:06:10Z   document.opened           JD Vance · v6.0
  │
  ●  2026-04-24T17:06:14Z   field.edited              "Subject" "" → "Pt #4421"
  │
  ●  2026-04-24T17:06:42Z   signature.applied         JD Vance · CERT-EN-FM-033-A4Df…
  │
  ●  2026-04-24T17:06:43Z   document.locked           hash=3f9c…b21a
  │
  ●  2026-04-24T17:06:43Z   compliance.transitioned   incomplete → audit_ready
Footer:    [ Export PDF ]  [ Export JSON evidence ]  [ Verify chain ]
```

`Verify chain` recomputes `prev_hash → hash` end-to-end and reports any
discrepancy with the offending event id.

---

## 5. Admin Compliance View — `/audit`

**File:** [src/policy/pages/AuditModePage.tsx](../../src/policy/pages/AuditModePage.tsx)

| Card | Drives |
|---|---|
| Missing signatures | Form instances where required signer set is incomplete |
| Expired documents | Past `retention_review_at` or past `valid_until` |
| Audit flags | Late-signature, blocked-billing, integrity-mismatch |
| Survey readiness % | Score from `riskScoring.ts` over the last quarter |
| One-click survey packet | `surveyPacket.ts` for a selected POC, employee, or QAPI event |

---

## Reference design

The visual language for the signing flow is captured in
[Builder/eCIgn/design](./design). Implementation details (mode tabs, canvas
behavior, success banner, final actions grid) are already realized in
`FormSigningWorkspace.tsx`. **Do not refactor the workspace beyond what is
required to wire the components above to live data.**
