# Audit Mode — How-To Guide

**Article:** 02-How-To  
**Page:** Audit Mode (`/audit`)

---

## Entering Audit Mode

1. Click the **Shield** icon in the left navigation sidebar
2. The application enters Audit Mode — a banner appears at the top of every page
3. All edit controls throughout the system are disabled

**Alternative:** Navigate directly to `/audit`

---

## Reviewing Compliance State

### View all events by domain
1. Events are displayed in a grid grouped by domain (GV, CL, QA, etc.)
2. Each row shows: Event name, `event_id`, due date, audit state badge, risk score
3. Color coding matches the audit state (green = ready, red = overdue, etc.)

### Expand an event for details
1. Click on any event row to expand it
2. The expanded view shows:
   - Workflow steps and their completion status
   - Evidence documents (with download links)
   - Approval history
   - Certification record (if certified)
3. This is the exact information a surveyor would review

### Check the Risk Score
1. The risk score panel in the top right shows the organization-wide score
2. Scores above 50 require attention
3. Click the risk score tile to see the breakdown by driver
4. Address the highest-weight drivers first (overdue events, evidence gaps)

---

## Exporting the Audit Report

1. Click the **Export** button at the top right of the Audit Mode page
2. Select format: CSV or JSON
3. Choose scope: All events, specific domain, or date range
4. Click **Generate Report**
5. The report downloads automatically to your computer
6. The export action is logged to the audit trail

---

## Preparing for a CMS Survey Visit

**Day before the survey:**
1. Enter Audit Mode
2. Check that all events in the current quarter are `certified_locked`
3. Verify risk score is below 20
4. Download audit reports for the key domains the survey is focused on

**During the survey:**
1. Navigate to `/audit` to show the surveyor the compliance state
2. Use the event filter to quickly locate specific events the surveyor requests
3. Open the event detail to show evidence directly to the surveyor
4. Download any requested documents from the evidence panel

---

## Exiting Audit Mode

1. Click the **Shield** icon again to toggle Audit Mode off
2. Or click the **Exit Audit Mode** button in the banner
3. The exit is logged with timestamp and actor
