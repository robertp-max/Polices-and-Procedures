# UI State Matrix

| Workspace | State / filter | Employee-facing behavior | Official-record behavior |
|---|---|---|---|
| Home | Clearance blocker | Highest focus priority; links to relevant workspace | None |
| Home | Overdue | Second focus priority | None |
| Home | Due soon | Third focus priority | None |
| Home | Waiting | Explains the other person or review dependency | None |
| Home | Continue | Opens the approved GAO preview route | Session-only preview position |
| Training | Required now | Shows open in-progress, required, due-soon, and unavailable assignments | None |
| Training | Onboarding / role / annual / policy / competency / drill / completed | Filters assignment cards | None |
| Training | Unavailable | Disabled action; `Content not yet available` and `No employee action required` | None |
| Policies | Read now / in progress / due soon / complete | Filters learner actions | None |
| Policies | Waiting for publication | No employee action; no internal hold/conflict detail | None |
| Policies | Awareness / no action | View summary only | None |
| Documents | All / action needed / expiring / under review / current | Filters eleven fixture document families | None |
| Documents | Renewal drawer | Local form preview and optional local file selector | No transmission or submission |
| Competencies | Upcoming / scheduled / waiting / completed / follow-up / remediation | Shows only fixture-applicable examples | No validation record |
| Performance | 30 / 60 / 90 / annual / IDP / coaching / improvement / follow-up | Read-only reviewer-owned decisions; employee review action only | No score edit or approval |
| History | Transcript / certificates / acknowledgments / competency / milestones | Read-only synthetic history | Official evidence deferred until connected |
| Support | Prompt suggestion | Places preview text in Nolan response area | No request opened |
| Support | Contact choice | Announces `Preview opened. No official record was changed.` | No ticket, call, or message |
| GAO | Cover | Starts approved scene content | No completion record |
| GAO | Hotspot / knowledge check | Practice interaction and local overlay state | No official score |
| GAO | Badge | Static synthetic photo, optional local image preview, keyboard completion | No camera request or upload |
| GAO | Practice completion | `Practice point completed in this preview` | No official completion or score |

## Status communication

Every visible status badge includes text and an icon. Error/attention, waiting, complete/current, and neutral states use different wording and iconography in addition to color.

