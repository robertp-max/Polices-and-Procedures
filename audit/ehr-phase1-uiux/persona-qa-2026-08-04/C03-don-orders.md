# C03 — DON — Orders & physician signature path
- Routes: `/orders`, `/documents`, `/legal-evidence`, `/billing`
- Verdict: **CONDITIONAL**
- Summary: The prototype gives a DON a credible **pending-signature control center** on Orders (urgency chips, due warn states, timeline “viewed by physician,” links into Documents and Legal Evidence) and a strong **non-silent** signature/seal story on Documents and Legal Evidence (banners, disabled seal, visual-only tooltips). Countersignature is modeled best on Legal Evidence **PKG-8844** (verbal order · physician pending · cannot seal) rather than as a first-class Orders status. Gaps for DON ops: Orders action buttons lack honesty footnotes, no aging/escalation buckets for physician follow-up, synthetic work-queue patient/detail mismatch for CMS-485 vs Walter, and Billing holds deep-link only to `/orders` (not the specific CMS-485 / package).

**Method:** Source-code review of `apps/ehr-prototype` screens + synthetic data (live app at `http://127.0.0.1:5194` per assignment; HashRouter). Report-only — no app source changes.

**Persona lens:** Director of Nursing — needs to see what is unsigned, how urgent it is, who to chase, how verbal orders countersign, and that nothing is “signed” or claim-ready by accident.

---

## Checks

| Check | Result | Notes |
|-------|--------|-------|
| `/orders` loads with title, stats, filters, drawer inspector | **OK** | Title “Orders”; StatCards (Pending / Sent / Signed / Draft); Tabs by status; table + Drawer with timeline, physician contact, Continue in |
| RelatedNav on `/orders` | **OK** | Related → Signatures (`/documents`), Medications, Order packages (`/legal-evidence`); header also has Signature queue + Legal evidence |
| Pending signature urgency visible | **OK** | StatCard “Pending signature” sub “1 overdue in 4 hours”; screen-sub “4 open · 1 signature overdue soon”; `urgent` chips (CMS-485, O2); `DUE_WARN` chips for “In 4 hours” / “Today” / “Before SOC”; ord-1 timeline “Viewed by Dr. Cho” |
| Countersign path clear | **PARTIAL** | Legal Evidence **PKG-8844** Order authority: read-back signed, physician countersign pending, seal blocked; Documents `cdoc-3` Verbal order pending; Work queue `wq-2` titled “Order countersignature.” Orders status is only generic `pending-signature` (no distinct countersign label or VO vs POC path) |
| Links Orders ↔ Documents ↔ Legal | **OK** | Bidirectional RelatedNav + header/inspector actions; document related includes Orders / PKG-8844 / claim holds; legal Related includes Documents + Orders |
| Billing blocks on unsigned POC / links to resolve | **OK** | Elena claim holds: “POC signature outstanding”; `holdResolution` → “Resolve in Orders”; readiness checklist “Orders signed” pending; RelatedNav Billing → Orders |
| No silent sign / seal / legal write | **OK** (Docs/Legal) · **PARTIAL** (Orders) | Documents banner + “Capture/Request signature” `title` + footnote; Legal banner, seal disabled with reason, export blocked on pending sig; Orders **New order / Send reminder / Edit order** have no visual-only disclaimer |
| Incomplete work never looks complete | **OK** | Pending stays warn tone; signed is separate; Legal completeness &lt; 100% and pending signatures block seal; Billing on-hold not claim-ready |
| Inspector / Continue-in cross-links sensible | **OK** | Order drawer uses `wq-2.related` (Signature queue, Order authority PKG-8844) + Documents; Docs inspector related per packet; Billing continue-in includes Orders |
| Synthetic honesty overall | **OK** | Flask banners on Documents/Legal; Legal “no durable write”; Docs “nothing is signed or sealed” |

---

## Findings

### P0
_None for prototype honesty on signature capture/seal — Documents and Legal Evidence explicitly prevent silent legal action. No production signing rail is implied as live._

### P1

1. **Orders primary actions lack “visual only” honesty (DON can misread ops capability)**  
   - **Where:** `OrdersScreen.tsx` — **New order**, drawer **Send reminder**, **Edit order** (no `title`, no footnote, no disabled pattern).  
   - **Why DON cares:** Reminder/edit/new order look production-actionable next to carefully footnoted Documents/Legal signature controls. Rubric: incomplete/prototype actions must not look complete or real.  
   - **Contrast:** Documents “Capture signature” / Legal “Seal package” always disclose visual-only and/or disable with reason.

2. **No first-class physician-signature aging / escalation view for DON**  
   - **Where:** `/orders` list shows per-row due text and a single “overdue in 4 hours” stat, but no age buckets (0–7 / 8–14 / 15–21 / 21+ days), no escalation owner chain (Clinical Mgr → DON → Admin), no monthly “physician signature tracking” worklist.  
   - **Why DON cares:** CoP/ops practice for outstanding POC/orders requires systematic follow-up (agency often treats this as a critical monthly cycle). Prototype shows urgency for **today’s** samples but not the **management** pattern a DON runs.

3. **Countersignature path split / diluted on Orders**  
   - **Where:** Orders statuses = draft | sent | pending-signature | signed | declined only. Verbal-order countersign story lives on Legal **PKG-8844** + Documents `cdoc-3` + work-queue title, not in the order row.  
   - **Why DON cares:** DON asks “is the countersign still out?” — table does not distinguish VO countersign vs lab pending vs CMS-485 certification. Drawer does link to Order packages, but only via generic `wq-2` related map (same links for every order).

4. **Work-queue / story data inconsistency for CMS-485 vs Walter**  
   - **Where:** `WORK_QUEUE` `wq-2`: `patientId: 'pt-walter'`, detail “**CMS-485** and verbal diuretic change…”, related “Order authority PKG-8844”. Clinical data: CMS-485 / ord-1 / cdoc-1 are **Elena** (`pt-elena`); verbal diuretic package is Walter.  
   - **Why DON cares:** Following the “Order countersignature” queue item lands a mixed patient story — breaks trust in the signature path demo.

5. **Billing hold resolves to Orders list, not the blocking artifact**  
   - **Where:** `holdResolution` for signature/POC → `/orders` only; Elena hold “POC signature outstanding” does not open ord-1, cdoc-1, or PKG/legal package. Dorothy “Recert POC in draft” also maps to Orders.  
   - **Why DON cares:** From revenue hold, DON still has to hunt the CMS-485 row/document. Acceptable for prototype density, but weak for “follow the blocker” UX.

### P2

1. **Hardcoded Orders subtitle vs computed counts** — `screen-sub` is fixed string `"4 open · 1 signature overdue soon"` while StatCards use live `counts`; risk of drift as sample data changes.  
2. **Signed StatCard sub “Filed to the chart”** — slightly overclaims for a design prototype (Documents is clearer: “Intent recorded (sample)”).  
3. **“New order” has no click handler** — inert primary CTA; looks like an incomplete affordance.  
4. **Orders RelatedNav omits Billing** — revenue link is only from the other direction (Billing → Orders); DON often wants “what claims are blocked by these unsigned orders?” from the Orders surface.  
5. **No deep-link hash/query** — package labels (PKG-8844) navigate to `/legal-evidence` registry top, not pre-selected package id (PKG-8844 exists in data but selection is local state only).

---

## Route notes (persona walkthrough)

### `/orders` — Orders control center
- **Load:** Screen head + RelatedNav + 4 StatCards + status Tabs + clickable table + Drawer.  
- **Urgency:** `ord-1` CMS-485 pending, due “In 4 hours”, urgent; `ord-8` home O2 pending “Before SOC”, urgent; due chips for time-sensitive dues.  
- **Timeline honesty:** Illustrative only (comment in source); shows send → view → await/sign path.  
- **Continue in:** Signature queue, Order packages (via `wq-2`), Documents; meds if medication category.  
- **Gap:** No countersign-specific status; action honesty weaker than DOC domain screens.

### `/documents` — Signature queue
- **Load:** “Documents & signatures”; banner “nothing is signed or sealed”; RelatedNav Forms / Orders / Legal evidence.  
- **Pending:** StatCard “Pending signature” sub “Blocks claim / seal paths”; filter chip; sample `cdoc-1` CMS-485 + `cdoc-3` verbal order both pending for Dr. Cho.  
- **Sign path:** “Request signature” / “Capture signature” titled visual-only; disabled when signed/void; footnote “No certificate or intent is written.”  
- **Cross-links:** Per-document related → Orders, Chart, Forms, Claim holds, PKG-8844, Medications.

### `/legal-evidence` — Order authority & seal gates
- **Load:** Domain DOC banner; RelatedNav Documents / QAPI / Orders / DOC-005.  
- **Countersign exemplar:** **PKG-8844** “Order authority package” — purpose “verbal/telephone orders with read-back and countersignature path”; status `pending-signatures`; physician pending; export PDF **blocked** “Awaiting physician countersignature”; disposition “cannot seal with pending countersignature.”  
- **Seal honesty:** `sealDisabledReason` blocks hold, sealed, hash fail, pending signatures, completeness &lt; 100%; primary Seal disabled + footnote.  
- **Assemble wizard** purpose option for Order authority + step for signatures → link “Open signature queue.”

### `/billing` — Claim holds tied to orders
- **Load:** RelatedNav Authorizations / Orders / OASIS / Notices.  
- **Elena clm-2:** holds POC signature + OASIS; checklist shows Orders signed pending; inline “Resolve in Orders.”  
- **Note:** “nothing is submitted without biller review” — good revenue honesty; no silent claim submit primary.

---

## What works
- Pending-signature **urgency** is first-class on Orders (counts, warn due chips, urgent badges, “viewed not signed” timeline beat).  
- **Cross-workspace wiring** among Orders ↔ Documents ↔ Legal Evidence ↔ Billing is deliberate and labeled (RelatedNav + Continue in + hold resolution).  
- **No silent physician signature / package seal** on Documents and Legal Evidence — disabled seal, blocked export, flask banners, visual-only titles.  
- Verbal-order **countersign** story is narrative-complete on PKG-8844 (read-back → physician pending → no seal).  
- Billing treats unsigned POC as a **hold**, not claim-ready — correct CoP/RCM signal for DON oversight.

---

## Persona quote
> “I can see who is unsigned and how hot it is, and I can’t fake a seal — but I still need aging buckets and a real countersign label on the order itself so I’m not hopping three screens to run physician-signature follow-up.”
