# Evidence Center Accessibility Validation Report — Phase 3

**Surface:** Evidence Center  
**Phase 3 — Operational Surface Reconstruction**  
**Version:** 1.0  
**Date:** 2026-05-17  

**Traceability:** 
- `ACCESSIBILITY_GAP_LIST.md`
- `Evidence_Reconstruction_Plan.md`
- `Dashboard_Accessibility_Validation_Report.md` (reference template)
- `Responsive_Accessibility_Validation_Plan_Shell.md`

---

## 1. Purpose

Provide the accessibility validation plan and gap closure report for the Evidence Center, following the exact structure and standards established on Dashboard.

---

## 2. Scope

Covers accessibility for Evidence capture, list, detail, review, and packet assembly flows (surface level), assuming Phase 2 shell has passed its gates.

---

## 3. Key Risk Areas for Evidence

- Color-only status in evidence items and compliance indicators
- Complex multi-step capture flows (photo + signature + metadata)
- Upload progress and dynamic content updates
- Keyboard navigation in lists with many items
- Touch target sizes during mobile capture
- Labeling of media preview and signature components

---

## 4. Validation Requirements

### 4.1 Perceivable
- Color contrast on all text and status elements (≥4.5:1)
- Status must use `CiStatusBadge` or icon + text (never color alone)
- Proper alt text or labels for captured media previews

### 4.2 Operable
- All capture buttons and list items ≥44×44px
- Full keyboard support for capture flows, list navigation, and review actions
- Focus management in `BottomSheetDrawer` and `RightDrawer` during capture/review

### 4.3 Understandable
- Clear labels and instructions in capture wizards
- Proper heading hierarchy in detail and review views
- Live regions for upload progress and status changes

### 4.4 Robust
- ARIA roles and labels on capture components (`PhotoEvidenceCapture`, `SignaturePad`)
- Screen reader compatibility for mobile capture flows
- Reduced motion respected in transitions

---

## 5. Specific Implementation Requirements

- `PhotoEvidenceCapture` and `SignaturePad` must expose proper ARIA attributes and focus management.
- Evidence lists must use semantic list roles or `DataGrid` with proper keyboard handling.
- Progress during uploads must be announced via `AriaLiveRegion`.
- Review actions must be clearly labeled and keyboard accessible.

---

## 6. Testing Protocol

- Automated: axe-core + Lighthouse on key Evidence routes (capture, list, detail)
- Manual: Full keyboard + screen reader test on desktop and mobile capture flows
- Evidence: axe reports + screen reader notes + before/after focus management examples

---

## 7. Success Criteria

- No critical or serious axe violations on Evidence flows
- All original Evidence-related gaps from `ACCESSIBILITY_GAP_LIST.md` closed or waived
- Capture and review experience is excellent with keyboard and screen reader
- Report follows the Dashboard template structure

---

**End of Evidence Center Accessibility Validation Report**

**Evidence Center artifacts complete.**

**Next surface:** Audit Mode — starting with Audit_Reconstruction_Plan.md immediately.