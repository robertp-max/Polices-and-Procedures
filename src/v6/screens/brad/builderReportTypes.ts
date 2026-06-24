/* Client mirror of the server's reusable report types (server source of truth:
   server/ia/brad/builder.ts REUSABLE_REPORT_TYPES). Kept as a plain client
   constant so the Builder UI never imports server-only modules. */
export const REUSABLE_REPORT_TYPES = [
  'Event Readiness Report',
  'QAPI Meeting Packet Report',
  'Cross-Walk Defensibility Report',
  'Staff Training Gap Report',
  'Evidence Readiness Report',
  'Policy Update Review Report',
  'Generated Object Activity Report',
  'Cloud Change Activity Report',
] as const;
