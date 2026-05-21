# CES the fucking Evidence and fucking Tasks Right Panel fucking pages that fucking will be removed including the folder icons etc from the long list you gave

**Date:** 2026-05-20  
**Context:** V3 Veil Glass reskin (matching APP_Screenshots.pdf exactly). Legacy CES Evidence and Tasks right panels are being removed. These are the drawers that must be implemented/updated in V3 style to provide the replacement right panel functionality inside the full V3 shell (no more legacy separate right panels).

## Drawers to Implement / Update for V3 CES Evidence and Tasks Right Panels

1. **GlobalTaskDrawer.tsx** (src/policy/components/pm/GlobalTaskDrawer.tsx)
   - Current legacy Tasks right panel/drawer.
   - Must be updated to full V3 shell treatment (veil glass, correct borders, no-scrollbar, teal accents, transitions).
   - Will serve as the V3 Tasks right panel replacement in CES flows (My Tasks, calendar, execution).

2. **WorkflowDrawer.tsx** (src/policy/ces/components/details/WorkflowDrawer.tsx)
   - CES-specific workflow/tasks/evidence drawer.
   - Update to V3 style (integrated with new shell, rich content from real mocks, limited glows if applicable, exact PDF layout for right rail in CES Evidence/Tasks).
   - Used in SprintExecutionBoard and CES execution views.

3. **RightDrawer.tsx** (src/policy/components/ui/RightDrawer.tsx)
   - General base right drawer component.
   - Implement V3 version with exact veil glass, 0.33 borders, glassmorphic treatment, 0.7s transitions per ClaudeX2 spec.
   - Base for all new V3 Evidence and Tasks right panels in CES.

4. **BottomSheetDrawer.tsx** (src/policy/components/ui/BottomSheetDrawer.tsx)
   - Mobile drawer replacement.
   - Update to V3 mobile treatment matching PDF (for Evidence and Tasks right panels on mobile in CES).

5. **New V3 EvidencePanel** (to replace src/policy/components/regulatory/EvidencePanel.tsx)
   - Create/implement V3 version inside the shell (no separate legacy file).
   - Must match PDF screenshots for Evidence right panel in CES (WorkflowExecutionPanel, EventWorkspace, etc.): full rich content, V3 tokens, no red, correct layout.

6. **New V3 TaskDetailRightPanel** (to replace src/policy/components/pm/TaskDetailRightPanel.tsx)
   - Create/implement V3 version (integrated, not legacy file).
   - For Tasks right panel in CES (MasterCalendar, MyTasks, EventTaskList, etc.): exact PDF data, badges, V3 styling, full shell integration.

7. **Integration points that must use the new V3 drawers** (update these pages to use the implemented V3 drawers instead of removed legacy ones):
   - MasterCalendarPage.tsx (replace all TaskDetailRightPanel / SprintTaskPanel / EmptyRightPanel with new V3 drawers)
   - MyTasksPmPage.tsx
   - WorkflowExecutionPanel.tsx (for Evidence)
   - EventWorkspace.tsx (for Evidence)
   - MobileIncidentExecutionPage.tsx
   - CesBoardPage.tsx / CesDashboardPage.tsx / other CES pages with right rails
   - iAdministrator RightPanelPreview (update or remove legacy preview)

## Rules for Implementation
- All new V3 drawers must use the full V3 shell (v3-canvas, v3-main-card where applicable, correct watermark, 0.33 borders, limited glows only on Command Center/Workspace, 0.7s CSS transitions via V3PageWrapper patterns).
- No more separate legacy right panels – everything inside the new V3 full-bleed shell as shown in PDF screenshots.
- Pull real data from CES mocks (as done in S15).
- Exact match to PDF for layout, typography, badges, tables in the right panels for Evidence and Tasks in CES.

This is the companion to the removals doc. These are the fucking drawers that need to be implemented.

No legacy right panels left in CES Evidence/Tasks after this.

