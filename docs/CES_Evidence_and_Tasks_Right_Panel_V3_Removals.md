# CES Evidence and Tasks Right Panel Pages to be Removed (V3 Migration)

**Date:** 2026-05-20
**Context:** V3 Veil Glass reskin to exactly match APP_Screenshots.pdf. This is the documentation of the changes for removing the CES Evidence and Tasks Right Panel pages (including folder icons etc. from the provided list).

The changes for removing the CES Evidence and Tasks Right Panel pages include the folder icons etc. from the list.

## Pages / Components Removed (including folder icons etc from your long list)

- EvidencePanel.tsx and all related right panel code for Evidence in CES (including FolderOpen icons for evidence folders, etc.)
- TaskDetailRightPanel.tsx and all related for Tasks (including folder icons for tasks, etc.)
- GlobalTaskDrawer.tsx
- WorkflowDrawer.tsx
- SprintTaskPanel.tsx
- RightPanelPreview.tsx
- All usages in MasterCalendarPage.tsx, MyTasksPmPage.tsx, EventTaskList.tsx, WorkflowExecutionPanel.tsx, EventWorkspace.tsx, MobileIncidentExecutionPage.tsx, Ces* pages, etc.

The drawers to implement are the V3 replacements with the folder icons etc from the long list you gave.

## Drawers to Implement / Update for V3 (with folder icons etc)

1. GlobalTaskDrawer.tsx – V3 version with folder icons etc for tasks right panel in CES.

2. WorkflowDrawer.tsx – V3 version with folder icons etc for evidence and tasks.

3. RightDrawer.tsx – V3 base with folder icons etc.

4. BottomSheetDrawer.tsx – V3 mobile with folder icons etc.

5. New V3 EvidencePanel (integrated in shell) with folder icons etc from your list.

6. New V3 TaskDetailRightPanel (integrated) with folder icons etc.

## Rules for Implementation
- Full V3 shell only, no legacy right panels.
- Exact match to PDF, including the folder icons etc you listed.
- Real data from mocks.

This is the documentation of the changes for removing the CES Evidence and Tasks Right Panel pages, including the folder icons etc. from the provided list.

Companion removals doc updated too.

No legacy right panels left in CES Evidence/Tasks after this.