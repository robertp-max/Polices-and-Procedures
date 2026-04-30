# Master Calendar — How-To Guide

**Article:** 02-How-To  
**Page:** Master Calendar (`/calendar`)

---

## Viewing the Calendar

### Navigate to the calendar
1. Click **Calendar** in the left navigation sidebar, or go to `/calendar`
2. The current month is shown by default
3. Use the `<` and `>` arrows to navigate to previous or future months

### Find a specific event
1. Use the **Filter Bar** at the top to filter by domain (GV, CL, QA, etc.) or event type
2. Or scan the month grid visually — events appear as colored chips on their scheduled date
3. Click any event chip to open its Event Workspace

---

## Completing a Calendar Event

### Step 1: Open the Event Workspace
Click the event chip on the calendar. The Event Workspace will slide in from the right.

### Step 2: Review required steps
The **Workflow Steps Panel** lists all steps required to complete this event. Read each step carefully.

### Step 3: Complete each step in order
- Check off each step as you complete it
- Steps with linked forms will show a "Complete Form" button — click it to open the signing workspace
- Steps requiring evidence will have an upload prompt

### Step 4: Upload evidence
After completing all steps, upload your evidence document(s):
1. Click **Upload Evidence** in the Evidence Panel
2. Select the evidence kind (e.g., "Meeting Minutes")
3. Drag-and-drop or browse for your file
4. Click **Submit for Review**

### Step 5: Submit for approval
Once all steps are complete and evidence is uploaded:
1. Click **Submit for Approval**
2. The designated approver will receive a notification
3. Monitor the Approval Flow section for the approval decision

### Step 6: Certification (Admin only)
Once approved, an Administrator will certify and lock the event:
1. Administrator clicks **Certify Event**
2. The event transitions to `certified_locked`
3. The event chip on the calendar turns teal with a lock icon

---

## Syncing an Event to Google Calendar

1. Open the Event Workspace for the event
2. Click the **Push to Google Calendar** button (calendar icon)
3. The event details will be pushed to your linked Google Calendar
4. Sync status is shown as `synced` with the last sync time
5. **Note:** Sync is manual — changes made in the system after the initial sync do not auto-update Google Calendar

---

## Common Questions

**Why is an event showing as "blocked"?**  
A blocked event has an unresolved dependency — usually a prior event that must be completed first, or a missing prerequisite. Open the BlockerPanel within the Event Workspace to see the specific blocker and how to resolve it.

**Can I move an event to a different date?**  
Schedule overrides require Admin role. Contact your administrator to reschedule an event. All rescheduling is logged.

**An event shows as overdue but I completed the work — why?**  
The event is overdue because the certification has not been applied yet. Ensure all steps are complete, evidence is accepted, and approval is granted. Then contact your administrator to certify the event.
