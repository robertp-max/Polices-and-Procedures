# CES Calendar Event Overview And Swimlane Routing Report

Generated: 2026-05-28T20:05:00Z

## Files Changed

- `src/policy/ces/components/calendar/CesEventInteraction.tsx`
- `src/policy/components/regulatory/TimelineMonth.tsx`
- `src/policy/pages/MasterCalendarPage.tsx`
- `Builder/_system/CES_CALENDAR_EVENT_OVERVIEW_AND_SWIMLANE_ROUTING_REPORT.md`

## Attendee / Participant Data Source

The CES Calendar event overview now restores participants from real event metadata already present on `RegulatoryEvent`:

- `event.owner` + `event.ownerRole` -> organizer / owner participant row
- `event.minutes.assignee` -> minutes assignee row when present
- `event.minutes.signOffRoles` -> required signer participant rows
- `event.approvals[].approverRole` -> reviewer / approval participant rows
- `event.agenda.standingTopics[].owner` -> agenda owner participant rows

No fake attendees were invented. No attendee fields were removed from the event data model.

Because the current event schema does not expose a dedicated `attendees[]` array, the overview uses those structured event fields as the participant model. If a future event lacks all participant-like metadata, the UI shows the honest empty state:

`No attendees configured for this event.`

## Hover Card Behavior

Desktop CES Calendar behavior now follows:

- Hover on a calendar event chip opens an event overview hover card.
- Keyboard focus on a calendar event chip opens the same overview card.
- The hover card remains open when the pointer moves from the event chip into the card.
- Escape closes the hover card.
- The hover card is clamped inside the viewport.
- Clicking inside the hover card does not close it unless the user activates the swimlane action.

The hover card includes:

- event title
- event ID
- status
- domain
- step count
- SLA state
- risk level
- audit readiness %
- audit state
- workflow ID
- date
- time
- owner role
- cadence
- regulatory driver
- short description
- attendees / participants
- required signer roles
- agenda owners
- `Click to open event swimlane`

## Click-To-Swimlane Behavior

Calendar click behavior now follows:

- Desktop calendar click -> open event-specific swimlane immediately
- Mobile first tap -> open event overview preview modal
- Mobile second tap on the same event, or the explicit action button -> open event-specific swimlane

The calendar no longer routes desktop event clicks into the old event preview/detail drill flow.

## Event ID Propagation

`MasterCalendarPage` now resolves the swimlane route through `getSwimlaneRegistryEntry({ workflowId, eventId, taskId })` and navigates using the returned route.

Verified examples:

- `QAPI Committee Meeting` -> `/workflows/QA-WF-03-swimlane?eventId=qapi_meeting-20260512-09`
- `Monthly Clinical Record Audit` -> `/events/clinical_record_audit-20260526-01/swimlane?workflowId=CL-WF-29`
- `Monthly OIG/SAM Exclusion Check` -> `/events/oig_sam_exclusion_check-20260505-01/swimlane?workflowId=CO-WF-15`
- `Governing Body Meeting` -> `/events/governing_body_meeting-20260514-01/swimlane?workflowId=GV-WF-01`
- `Annual HIPAA Workforce Training` -> `/events/hipaa_training-20260528-01/swimlane?workflowId=CO-WF-09`
- `Claims Submission Cycle` -> `/events/claims_submission-20260513-01/swimlane?workflowId=FN-WF-04`

In every sampled case, the route included the clicked `eventId`.

## Event-Specific Task / Form / Evidence Verification

Browser validation confirmed that clicking sampled calendar events opened rendered swimlane maps with event context preserved:

- `QAPI Committee Meeting` -> 13 swimlane cards
- `Monthly Clinical Record Audit` -> 7 swimlane cards
- `Monthly OIG/SAM Exclusion Check` -> 10 swimlane cards
- `Governing Body Meeting` -> 16 swimlane cards
- `Annual HIPAA Workforce Training` -> 8 swimlane cards
- `Claims Submission Cycle` -> 7 swimlane cards

This confirms the click path is landing on event-specific swimlanes rather than a blank route or a template-only workflow view without event context.

The calendar hover / preview changes themselves do not create form instances or signer tasks. They only navigate into the existing swimlane and form/evidence execution surfaces.

## Tested Events

Hover overview verified:

1. `QAPI Committee Meeting`
2. `Monthly Clinical Record Audit`
3. `Monthly OIG/SAM Exclusion Check`
4. `Governing Body Meeting`
5. `Annual HIPAA Workforce Training`
6. `Claims Submission Cycle`

For each sampled event:

- hover overview appeared
- attendees / participants section appeared
- participant content rendered from real event metadata
- click opened an event-specific swimlane route containing the event ID
- no console errors were produced during the test run

## Build Result

`npm run build` passed after the final changes.

Vite emitted only non-blocking chunk-size / plugin-timing warnings.

## Limitations

- The current event schema does not provide a first-class `attendees[]` array, so the overview composes participants from owner, signer, approval, minutes, and agenda-owner metadata.
- Some events only expose organizer-level participant metadata today; those events still show the participant section honestly without inventing additional attendees.
- The hover card is implemented for the desktop calendar grid. Mobile uses the preview modal so touch users can still access attendees before opening the swimlane.
