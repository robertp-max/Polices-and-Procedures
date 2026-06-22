# 10 - Forms Library, Form Viewer, eCIgn Workspace / Signing UI

**View Registrations:**
- `forms-library` (group: "Taxonomy") — Route: `/forms`, Template: `matrix`, Icon: `clipboard-list`
- `form-viewer` (group: "Taxonomy") — Route: `/forms/:formId`, Template: `form-viewer`, Icon: `clipboard-list`
- `ecign-workspace` (group: "Taxonomy") — Route: `/forms/:formId/esign`, Template: `ecign`, Icon: `pen-line`

**PNG Confirmation:** 
- `Reference/V6/10-forms-ecign.png` confirmed (96,948 bytes, LastWriteTime 2026-06-19 5:20:47 PM).
- Visuals (from image read + prototypes) capture forms library grid/table, form viewer with labeled fields/sections, eCIgn signing panel/sequence (signer states, document preview, signature input, attestation), sidebar nav + Brad overlay common to shell.
- MD describes tables (library), form fields/sections, signing UI lifecycle based on PNG references + FormViewerPrototype + EcignPrototype + prod components (FormsPage.tsx, FormViewer.tsx, FormSigningWorkspace.tsx as ECIgnWorkspace, FormSignatureContext.tsx, useEcignInstance).

## Layout & Structure

**forms-library:**
- Production (FormsPage.tsx): 
  - V32PageHeader: "Enterprise Forms Library", "361 canonical artifacts..."
  - Domain filter pills (ALL + 10 domains: GV, CL, QA, HR, CO, FN, OP, IT, RM, EN) with icons.
  - Classification chips: Master Template, Audit Critical, Shared Enterprise, High Risk, Digital Candidate (toggleable).
  - Responsive grid (1-5 cols): `GlassPanel` cards.
    - Header: form.id (mono, colored by domain) + type.
    - Name (hover teal).
    - Footer: classification badges (first 2) + "# policies" count.
  - Click card → navigate `/forms/${form.id}`
- Prototype: `MatrixPrototype` + DataTable using `formRecords`:
  - Headers: `['Form ID', 'Form title', 'Type', 'Status']`
  - Sample rows: EN-FM-001 Universal Policy Acknowledgment Form Attestation Ready, GV-FM-006 Conflict of Interest Disclosure Form Attestation Interactive, etc.
- Metrics (prototype): Runtime records 410, Canonical 361, Domains 10, Digital candidates 74 (eCIgn ready).
- Cards in rail: Classification filters, Linked policy count, Signature readiness.

**form-viewer (FormViewerPrototype + FormViewer.tsx):**
- 3-column layout (prototype xl:1-3-2):
  - **Left sidebar**: Sections list (clickable).
    - Default: `['Identity', 'Disclosure', 'Reviewer', 'Signature', 'Audit']`
  - **Center form renderer** (white bordered card):
    - Header: ToneBadge "Interactive form", title (e.g. GV-FM-006 - Conflict of Interest Disclosure), desc.
    - Badge: "2 fields need review"
    - Fields list: each in rounded border bg-neutral p-4.
      - Small uppercase label + ToneBadge (Complete / Review / Required).
      - Input (text/textarea readonly in proto) or interactive in prod.
  - **Right rail**:
    - SurfaceCards (Linked policy, Validation summary).
    - Required signers: list with name + check/circle icon.
- Real FormViewer.tsx (rich impl):
  - Uses `buildFormContent(formId)` → FormContent (id, title, sections, signerSlots).
  - Sections layouts (SectionLayout):
    - 'grid': key/value fields in cols.
    - 'table': log with columns + rowCount.
    - 'checklist': items + checkboxes (optionally sectionAck).
    - 'attestation': body + acknowledgments list.
    - 'narrative': long textarea.
    - 'matrix': rows x cols.
    - 'signature': dedicated block.
  - Field types (FieldType): text, date, select, checkbox, radio, textarea, number, signature, email, tel.
  - Special sections e.g. OrgChart (GV-FM-003) with TreeNode cards (Governing Body, Administrator, Compliance Officer, etc.).
  - Integrates: FormSignatureContext, FormSignatureFlow, ECIgnWorkspace (FormSigningWorkspace).
  - Print via printForm, evidence recording on submit.
  - Classification, linked policies, version/effective footer.
- Sample formFields (prototype):
  ```
  ['Full legal name', 'Thomas Parker', 'Complete'],
  ['Organization role', 'Compliance Officer', 'Complete'],
  ['Disclosure status', 'Potential relationship disclosed', 'Review'],
  ['Related entity', 'Care vendor consulting relationship', 'Review'],
  ['Reviewer notes', 'Route to administrator before board packet close.', 'Required'],
  ```
- Identity block defaults: Form Completed By (Full Name), Title/Role, Department/Branch, Date Completed.
- Signature rows use underline styles (SIG_INPUT_CLS / SIG_DASHED_CLS), Printed Name / Signature / Date per role.

**ecign-workspace / Signing UI (EcignPrototype + FormSigningWorkspace / ECIgnWorkspace):**
- Prototype layout (xl grid 2-2-2):
  - **Left (Signing sequence)**: numbered cards per signer.
    - Name, "Signer N", ToneBadge (Signed teal, Awaiting signature orange, Queued slate).
    - "Send reminder" button.
  - **Center (Document preview)**:
    - ToneBadge "Document preview".
    - Title (e.g. Conflict of Interest Disclosure).
    - Document lines (attestation statements as white cards).
    - Signature block: name + timestamp.
  - **Right (Typed signature + actions)**:
    - "Typed signature" card: label + input (readonly in proto).
    - Attestation box (orange soft): text.
    - "Seal signature" button (orange).
    - SurfaceCard: Signature certificate (hash, signer, timestamp, IP, linked form).
- Real eCIgn Signing (FormSigningWorkspace.tsx):
  - Brand: Navy #1A3778 + Orange #F04B22 (eCIgn logo).
  - Strict flow via `useEcignInstance` + UI_STEPS (no skip):
    ```
    UI_STEPS = [
      { key: 'CONSENT', label: 'Consent', backend: 'created' },
      { key: 'IDENTITY_VERIFIED', label: 'Identity', backend: 'disclosed' },
      { key: 'REVIEW_ACK', label: 'Review', backend: 'verified' },
      { key: 'SIGNED', label: 'Signature', backend: 'reviewed' },
      { key: 'ATTESTED', label: 'Attestation', backend: 'attested' },
      { key: 'LOCKED', label: 'Finalize', backend: 'signed_locked' },
    ]
    ```
  - Steps UI: progress indicators, StepConnector, active state.
  - Step 1 (Sign/CONSENT): E-SIGN Act consent checkbox + drawn signature (SignaturePad or canvas) or typed.
  - Identity: photo verify optional, signer profile.
  - Review: document + acknowledgments.
  - Signature: apply (hash captured).
  - Attestation + options: Download, Print, Save, 2nd-Signature request.
  - No terminal "Done"; action-driven (e.g. generate package).
  - Certificate / Audit: buildAuditTrailHtml, buildSignerRosterHtml, document hash + manifest hash, network/geo/IP/device capture, chain.
  - Second sig support: SecondSignatureModal (tier-based approvers), FormSignatureFlow.
  - Evidence: recordEsignEvidence, snapshot capture (captureSignedFormSnapshot), lock.
  - Backend states map to UI; integrates ecignApi, signerAuthority (deriveCanonicalSignerRequirements, requiredSignerPayloads, rolesMatchForLock).
- FormSignatureContext: signatures Map, requestSign, autoFills for Printed Name/Date, Signer slots, GeoInfo, FieldEdit.
- Related: eCIgnSetupModal, ECIgnSignatureField, policy link validation.

## Form Fields & Sections (Canonical)

From formsLibraryContent.ts + templates:
- Common: identityBlock() (4 fields grid), signatureSection(roles) (printed + sig + date per signer), attestationSection, checklist(), logTable(), narrative.
- signerSlots / SignatureBlock: role, includeName/Title/Date.
- Per-form overrides populate sections array.
- 361 artifacts across datasets (EN 37, GV 25, HR 75+...).
- Classifications drive eCIgn readiness ("digital_candidate").

## Tables (Forms Library)

- Prototype DataTable same as policy: ID (teal mono), title, type/status badges.
- Production: card grid (no traditional table, but filterable/searchable).
- Crosswalk / linked: policies per form.

## Signing UI Details

- Sequence / roster: current signer highlighted, queued/awaiting/complete states.
- Inputs: full legal name (typed), canvas signature (dataUrl stored), date auto or manual.
- Attestation: explicit text + confirmation.
- Cert output: hash chain, IP posture, timestamps, linked policy/form refs, audit events.
- Locks: form instance + artifact after final signer(s).

## Styling & Tokens

- Form paper: `.ci-form-viewer-paper` (ink #263C3D, borders #E5E4E3, focus teal #007970).
- eCIgn: navy/orange specific (distinct from core teal/orange).
- Fields: consistent 8px rounded, labels montserrat uppercase tracking.
- Badges, glass panels, hover states mirror policy views.
- Signature visual: rendered img from dataUrl + timestamp + check.

**PNG Visual Confirmation Notes:**
- Forms library: grid or table rows (ID/Title/Type/Status), domain filters.
- Form viewer panel: fields with status badges (Complete/Review/Required), sections nav.
- eCIgn side or modal: signer sequence list, document lines, signature input area, "Seal signature", cert notes.
- Consistent shell (sidebar "Taxonomy", search, user avatar).
- Highlights "digital candidates" / "Awaiting signature".

**Related Production Files:**
- FormsPage.tsx, FormViewer.tsx, FormSigningWorkspace.tsx (ECIgnWorkspace), FormSignatureFlow.tsx, FormSignatureContext.tsx
- Data: formsLibraryDataset.ts, formsLibraryContent.ts (and split _*.ts), formsLibraryContent*.ts
- eCign/: useEcignInstance.ts, api.ts, signerAuthority.ts, signerIdentity.ts, hhcEvidence.ts
- Routes: `/forms/:formId` is the read/fill form viewer; `/forms/:formId/esign` is the canonical eCIgn signing workspace protected by eCIgn access.
- Ties to PolicyViewer (linked forms) and Lifecycle (policy approvals may trigger forms/eCign)

**Cross-refs:** See 09-policy-library-viewer.md (library tables, linked forms from policies, viewer sections). Forms feed into eCIgn for attestation/signature packets; eCIgn outputs feed evidence/audit/lock for governance.
