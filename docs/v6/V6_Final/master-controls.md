# Master Controls (master-controls) - CES Matrix View

**View Registration:** `master-controls` (group: "Compliance Execution (CES)")
- Label: "Master Controls"
- Route: `/compliance/master-controls`
- Icon: `shield-check`
- Template: `matrix`
- Metrics (specific):
  ```js
  metric('Controls', '104', 'Inventory baseline', 'teal'),
  metric('High', '81', 'High-risk controls', 'orange'),
  metric('Material', '22', 'Material controls', 'teal'),
  metric('Low', '1', 'Low-risk control', 'green'),
  ```
- Table headers: ['Control ID', 'Control name', 'Risk tier', 'Source status']
- Cards: contextual (Synthetic overlay, Evidence retention, Control domains)

**PNG Confirmation:** Base reference `Reference/V6/04-ces-calendar.png` (96,948 bytes, 2026-06-19) or `Reference/V6/03-ces-kanban-board.png`. Captures shared shell/sidebar (CES section) + Brad modal overlay; the matrix table + side cards are JS-rendered at runtime via MatrixPrototype/DataTable (not in static PNG).

## Layout & Structure
- **Shared shell:** Metrics row (4 tiles) + TopBar (CES group badge, "Master Controls" heading + description) + main content.
- **MatrixPrototype (~4203-4210):** Same as workflows:
  - xl:col-span-3: DataTable
  - xl:col-span-2: SurfaceCards stack
- Uses identical DataTable rendering as other matrix views.

## Matrix View (DataTable + Cards)
- **DataTable:** CSS-grid based; ID bold teal, title teal-600, last col (status/risk) ToneBadge (keyword-driven color).
- **Records (masterControlRecords ~503-510):**
  ```js
  [
    ['MC-AH-001', 'After-hours on-call coverage', 'High', 'UNKNOWN'],
    ['MC-OA-014', 'OASIS QA and transmission control', 'High', 'UNKNOWN'],
    ['MC-PO-022', 'Physician orders signature control', 'High', 'UNKNOWN'],
    ['MC-IP-040', 'Infection prevention surveillance', 'High', 'UNKNOWN'],
    ['MC-EP-057', 'Emergency preparedness annual review', 'Material', 'UNKNOWN'],
    ['MC-OS-063', 'OSHA logs and workplace violence control', 'Material', 'UNKNOWN'],
  ]
  ```
- Note on UNKNOWN: "Source status is UNKNOWN in the inventory baseline; prototype overlays highlight high-risk operating examples." (from card).
- **SurfaceCards (cards config):**
  - 'Synthetic overlay' (orange, 'shield-check', 48%): "Source status is UNKNOWN in the inventory baseline; prototype overlays highlight high-risk operating examples."
  - 'Evidence retention' (teal, 'folder-lock', 88%): "Locked artifacts carry source policy, owner, timestamp, hash, and retention window."
  - 'Control domains' (teal, 'layers', 74%): "After-hours, OASIS, physician orders, infection prevention, emergency prep, and OSHA controls are visible."

## Master Controls Description
- Inventory of compliance controls mapped to risk tier (High/Material/Low) and source status.
- High-risk (81 of 104): After-hours, OASIS, physician orders, infection prevention, etc.
- Material (22): Emergency prep, OSHA.
- Ties directly to workflows: workflows (e.g. QA-WF-03, RM-WF-04) enforce and produce evidence for these controls.
- Evidence from swimlane execution (packet lock) feeds audit-ready state for these controls.
- "Master Controls" links in help and docs: `/help/master-controls-overview`.

## Comparison to Workflows Matrix
- Both use 'matrix' template + DataTable + right-hand SurfaceCards.
- Workflows: workflow ID/title/domain/status; focuses library of executable processes.
- Master Controls: control ID/name/risk tier/source status; focuses governance inventory + risk baseline.
- Shared visual language (teal/orange tones, progress, badges, grid split).

## Status Colors & Risk Visualization
- **teal**: Baseline count (104), Material (overlaps), retention positive states.
- **orange**: High-risk count (81), synthetic/overlay warnings.
- **green**: Low-risk (rare, 1).
- ToneBadge used for risk tiers; UNKNOWN treated as review/gap (orange-leaning).
- Consistent with entire CES surface: progress, dots, tiles.

## Integration with CES Architecture
- **Controls → Workflows → Swimlanes → Evidence → Audit**
  - Master controls define required coverage.
  - Workflow library (workflows view) lists the enforcement flows.
  - Swimlane (workflow-swimlane / calendar swimlane) executes the steps (intake-evidence-approval-lock).
  - Evidence-center / audit-mode surface the resulting artifacts.
- Referenced in framework (domains/subdomains map to controls), policy crosswalks, reports.
- Example domains from framework seed (~556): GV, CL, QA, HR, CO, FN, OP, IT, RM, EN — controls cut across these.
- Inces-board and reports aggregate control posture via card counts (blocked, certified).

## Other Related Elements
- In help contextual links.
- Cards/mentions in reports-governance and 16-reports-governance.png shell.
- Synthetic nature: prototype seeds UNKNOWN to demonstrate overlay/highlight behaviors in the matrix.
- Broader: Onboarding, journey, admin roles tie credentials and access to control compliance.

**Sources:** VIEW_GROUPS ~1265 (registration), masterControlRecords ~503, MatrixPrototype ~4203, DataTable ~1911, SurfaceCard ~1885, view() ~1035, frameworkDomains ~556 (related), tones ~129, render ~4241 (matrix default), CES group ~1215.
