# D06 — LVN — Documents & signatures in field workflow
- Routes: `/documents`, `/forms`, `/orders`, `/legal-evidence`
- Persona: LVN (field nurse · daily signature chase, form lookup, order countersign awareness)
- Base: http://127.0.0.1:5194/# (HashRouter) · worktree `ehr_phase1` · app `apps/ehr-prototype`
- Method: Source-level QA of screen TSX/CSS + nav/data modules (live `127.0.0.1` fetch blocked in this agent environment; rubric allows TSX/CSS when browser unavailable)
- Verdict: **CONDITIONAL**
- Summary: The pending-signature queue is easy for an LVN to find (sidebar badge, status filter, StatCards, Orders tab, work-queue cross-links) and is **not** parked behind a “rail” substitute. Forms library is a usable catalog with search/filters and honest “sample not 349/349” framing. Honesty is strong on Documents and Legal evidence (visual-only capture/seal with footnotes), weaker on Orders (primary actions look live with no visual-only footnote; drawer “Continue in” is hard-coded to one work-queue item).

## Checks

| Check | Result | Notes |
|-------|--------|-------|
| Routes load / registered | OK | All four routes in `App.tsx`; HashRouter → `#/documents` etc. |
| Pending signature queue findable | OK | Nav **Records → Documents & signatures** (`status: 'built'`, badge `2`); filter **Pending signature**; StatCard “Pending signature”; Orders tab + StatCard; work-queue item *Order countersignature* links to Signature queue |
| Forms library usable | OK | Search by title / semantic ID / owner; status filters; list + inspector with version pins; Continue-in links; Start form instance is title-flagged visual-only |
| Not blocked by rail language | OK | Documents, Forms, Legal evidence are **built** in-app (no `planned` / `substitute` / “rail” badge). Subcopy explicitly: “in-app design, not external eCign rail” / “not Policy Suite rail”. eCign named only as future candidate, not as nav wall |
| RelatedNav present | OK | `/documents` → Forms, Orders, Legal evidence; `/forms` → Documents, Evidence, Notices; `/orders` → Signatures, etc.; `/legal-evidence` → Documents, QAPI, Orders, DOC-005 |
| StatCards | OK | Docs: count / pending / signed / draft. Forms: sample / current / draft / linked. Orders: pending / sent / signed / draft. Legal: packages / holds / hash mismatches / pending sigs |
| Filters + inspector | OK | Status filters on all four; purpose filters + detail tabs on Legal; Orders drawer; Docs/Forms side inspectors |
| Cross-links sensible | CONDITIONAL | Docs/Forms/Legal related maps are coherent for field chase. **Orders drawer always pulls `wq-2` related links** for every order (not order-specific) |
| Honesty (sign/seal not false-complete) | CONDITIONAL | Docs + Legal: banners, disabled seal when blocked, footnotes. Orders: **New order / Send reminder / Edit order** lack visual-only titles/footnotes |
| LVN field relevance | OK / P2 | Signature chase path is clear; catalog light on SN visit / med-admin field forms; demo shell user is RN case manager |

## Findings

### P0
- None. No false seal of legal packages when incomplete; pending signatures stay visibly pending; no silent legal hold/seal write path claimed as production.

### P1
1. **Orders drawer “Continue in” is hard-coded to work-queue `wq-2`.**  
   `OrdersScreen.tsx` always does `WORK_QUEUE.find(w => w.id === 'wq-2')?.related`, so every order (lab, DME, med, draft) surfaces the same Signature queue / Order authority package links. LVN chasing a non-countersign order gets misleading destinations.  
   **Fix direction:** Derive related links from order category/status (or per-order related map), not a single WQ id.

2. **Orders primary actions lack prototype honesty treatment.**  
   Documents uses `title="Visual only · no signature is captured"` + footnote; Legal disables seal with reason + footnote. Orders **New order**, **Send reminder**, and **Edit order** render as full primary/secondary buttons with no visual-only title, disabled state, or screen footnote—easy for a field nurse (or surveyor watching UAT) to assume live mutation.  
   **Fix direction:** Match Documents pattern (title + short footnote under drawer actions / screen head).

### P2
1. **Controlled document `void` status exists in data model but has no filter chip** on `/documents` (only All / Pending / Signed / Draft)—minor polish if voids appear in sample later.
2. **Shell demo identity is “Taylor Brooks, RN · Case manager”**—not an LVN field persona. Does not block routes, but weakens role-lens walkthroughs for LVN agents.
3. **Forms sample set is thin for LVN field day** (consents, CMS-485, safety, HHABN, incident)—no SN visit note / skilled nursing note / med observation form in catalog. Honesty banner (“not 349/349”) mitigates false completeness.
4. **Legal evidence is HIM/compliance-weight** for a typical LVN shift; still useful when chasing order authority packages (PKG-8844) from documents/orders—acceptable as secondary surface.

## Route notes (persona lens)

### `/documents` — Documents & signatures
- Title + kicker Domain DOC; synthetic banner; RelatedNav; four StatCards.
- **Pending signature** is a first-class filter and metric—LVN can open queue in one click from Records nav (badge 2 aligns with sample pending docs: CMS-485 + verbal order).
- Inspector: signer, pages, patient → chart, Continue in, Capture signature (disabled when signed/void) + honest footnote.
- Request signature button is visual-only via title attribute.
- Explicitly **not** an eCign wall—“this screen owns the EHR operator experience.”

### `/forms` — Forms library
- Catalog with semantic IDs (e.g. CL-FM-029 CMS-485), version chips, owner/use, status Current/Draft/Retired.
- Usable for “what form do I need?” during/after a visit; cross-nav to Documents / Notices / Evidence / Field visits on items.
- Start form instance: visual-only (title + inspector footnote). Not blocked by Policy Suite rail language.

### `/orders` — Orders
- Strong pending-signature StatCard + tab; urgent due chips; patient jump to chart orders tab.
- Header shortcut **Signature queue** → `/documents`; **Legal evidence** → `/legal-evidence`.
- Drawer timeline + physician contact good for “who do I nudge?” field workflow.
- Gaps: honesty on mutating buttons; generic Continue-in (P1s above). No flask/synthetic banner on this screen (unlike Docs/Forms/Legal).

### `/legal-evidence` — Legal evidence packages
- Rich registry (status + purpose filters), inspector tabs (Overview / Artifacts / Custody / Exports), seal blocked with reasons (hold, hash, pending sigs, completeness).
- Signature chain and “Open signature queue” from assemble wizard connect back to Documents.
- eCign appears only as artifact **source** label / future rail note—not a nav substitute that blocks the LVN.

## What works
- Signature work is **first-class in-app under Records**, not hidden or labeled “rail.”
- Multiple entry points for an LVN: sidebar badge, Orders pending tab, work-queue “Order countersignature” → Signature queue, Command palette “Documents & signatures” hint “Signature queue.”
- Cross-workspace wiring among Documents ↔ Forms ↔ Orders ↔ Legal evidence is deliberate and mostly correct.
- Strong honesty culture on Documents and Legal evidence (synthetic banners, disabled seal, no false completeness).
- Forms library communicates catalog incompleteness (“Not 349/349 yet”) instead of faking a full programme.

## Persona quote
> “I can find my pending signatures without getting bounced to some external rail, but Orders still feels like a live system—and every order drawer points me at the same countersignature package.”
