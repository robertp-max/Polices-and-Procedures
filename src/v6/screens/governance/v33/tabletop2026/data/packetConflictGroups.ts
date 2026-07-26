import type { PacketConflictGroup } from '../engine/caseTypes';

export const Q1_PACKET_CONFLICT_GROUPS: PacketConflictGroup[] = [
  {
    id: 'q1-cap-status',
    title: 'CAP status does not reconcile',
    plainLanguageQuestion:
      'Does “remediated” prove CAP closure, or only that the overdue tracker condition was corrected?',
    exhibitIds: ['EX-Q1-016', 'EX-Q1-037'],
    conflictingFields: [
      {
        label: 'Status language',
        values: [
          { exhibitId: 'EX-Q1-016', value: '2 overdue items remediated by April 2' },
          { exhibitId: 'EX-Q1-037', value: 'CAP-Q1-002 status: Open' },
        ],
      },
      {
        label: 'What was demonstrated',
        values: [
          { exhibitId: 'EX-Q1-016', value: 'Tracker timeliness corrected' },
          { exhibitId: 'EX-Q1-037', value: 'Effectiveness not yet demonstrated' },
        ],
      },
    ],
    whyItMatters:
      'Treating tracker remediation as CAP closure would let the Board rely on an outcome the source does not establish.',
    affectedMatterIds: ['M-CAP-BUDGET', 'M-PIP-RISK'],
    workflowIds: ['GV-WF-07'],
    formIds: ['GB-FORM-CAP-EFFECTIVENESS'],
    sourceCutoff: '2026-04-09',
  },
  {
    id: 'q1-quorum-records',
    title: 'The attendance records describe different bodies',
    plainLanguageQuestion:
      'Does the QAPI Committee attendance record prove that the Governing Body itself can convene?',
    exhibitIds: ['EX-Q1-002', 'EX-Q1-003'],
    conflictingFields: [
      {
        label: 'Body',
        values: [
          { exhibitId: 'EX-Q1-002', value: 'QAPI Committee' },
          { exhibitId: 'EX-Q1-003', value: 'Governing Body' },
        ],
      },
      {
        label: 'Attendance and threshold',
        values: [
          { exhibitId: 'EX-Q1-002', value: '9 of 9 present; committee quorum is 5' },
          { exhibitId: 'EX-Q1-003', value: '6 seated directors present; Board threshold applies' },
        ],
      },
    ],
    whyItMatters:
      'The Board may not rely on a feeder committee roster to prove its own legal authority to convene.',
    affectedMatterIds: ['M-GOVERNANCE'],
    workflowIds: ['GV-WF-01'],
    formIds: ['GB-FORM-ATTENDANCE-QUORUM'],
    sourceCutoff: '2026-04-09',
  },
  {
    id: 'q1-wound-rate',
    title: 'Wound-rate figures use different evidence frames',
    plainLanguageQuestion:
      'Can the monthly rate points be treated as resolving the quarter-close systemic trigger?',
    exhibitIds: ['EX-Q1-008', 'EX-Q1-029'],
    conflictingFields: [
      {
        label: 'Reported rate',
        values: [
          { exhibitId: 'EX-Q1-008', value: '0.7%, 3.3%, and 2.9% by month' },
          { exhibitId: 'EX-Q1-029', value: '10–13% systemic spike' },
        ],
      },
      {
        label: 'Evidence frame',
        values: [
          { exhibitId: 'EX-Q1-008', value: 'Monthly rate points; denominator unresolved' },
          { exhibitId: 'EX-Q1-029', value: 'Three-clinician cluster linked to sepsis' },
        ],
      },
    ],
    whyItMatters:
      'A favorable-looking monthly series cannot erase a separately supported systemic cluster and patient-safety trigger.',
    affectedMatterIds: ['M-PIP-RISK', 'M-QUALITY'],
    workflowIds: ['GV-WF-06', 'GV-WF-08'],
    formIds: ['GB-FORM-PIP-AUTHORIZATION'],
    sourceCutoff: '2026-04-09',
  },
  {
    id: 'q1-missing-board-record',
    title: 'The escalation has no completed Board decision record',
    plainLanguageQuestion:
      'May a blank synthetic motion shell be treated as proof that the Board already acted?',
    exhibitIds: ['EX-Q1-005', 'EX-Q1-007'],
    conflictingFields: [
      {
        label: 'What the record proves',
        values: [
          { exhibitId: 'EX-Q1-005', value: 'Four matters were escalated to the Board' },
          { exhibitId: 'EX-Q1-007', value: 'Blank motion shell for tonight’s deliberation' },
        ],
      },
      {
        label: 'Decision status',
        values: [
          { exhibitId: 'EX-Q1-005', value: 'No motion, vote, or directive recorded' },
          { exhibitId: 'EX-Q1-007', value: 'Synthetic UAT supplement; not a completed outcome' },
        ],
      },
    ],
    whyItMatters:
      'The packet may prove that matters reached the Board without proving what the Board decided.',
    affectedMatterIds: ['M-GOVERNANCE', 'M-COMPLAINT', 'M-PERSONNEL'],
    workflowIds: ['GV-WF-05', 'GV-WF-09'],
    formIds: ['GB-FORM-QAPI-PACKET-REVIEW'],
    sourceCutoff: '2026-04-09',
  },
];

export const Q2_PACKET_CONFLICT_GROUPS: PacketConflictGroup[] = [
  {
    id: 'q2-census-boundary',
    title: 'The Q1 close and Q2 opening census do not reconcile',
    plainLanguageQuestion:
      'Which census value may support a cross-quarter rate when the 20-patient gap is unexplained?',
    exhibitIds: ['q2-ex-population-q1', 'q2-ex-population-q2'],
    conflictingFields: [
      {
        label: 'Active patients',
        values: [
          { exhibitId: 'q2-ex-population-q1', value: 'Q1 close: 120' },
          { exhibitId: 'q2-ex-population-q2', value: 'Q2 opening: 100' },
        ],
      },
    ],
    whyItMatters:
      'Using either value without the limitation can distort cross-quarter population-based rates.',
    affectedMatterIds: ['q2-2026-packet-trust'],
    workflowIds: ['GV-WF-05'],
    formIds: ['GB-FORM-RECORD-CORRECTION'],
    sourceCutoff: '2026-07-10',
  },
  {
    id: 'q2-complaint-cover',
    title: 'The cover memo understates open complaints',
    plainLanguageQuestion:
      'Can an unsigned cover memo override a sourced complaint record that remains open?',
    exhibitIds: ['q2-ex-decoy-cover-memo', 'q2-ex-cmp-006-q1'],
    conflictingFields: [
      {
        label: 'Complaint status',
        values: [
          { exhibitId: 'q2-ex-decoy-cover-memo', value: 'Two complaints; all resolved' },
          { exhibitId: 'q2-ex-cmp-006-q1', value: 'Carried-forward complaint remains open' },
        ],
      },
      {
        label: 'Source',
        values: [
          { exhibitId: 'q2-ex-decoy-cover-memo', value: 'Unsigned and unattributed' },
          { exhibitId: 'q2-ex-cmp-006-q1', value: 'Recovered complaint record' },
        ],
      },
    ],
    whyItMatters:
      'The Board’s reliance scope changes if an open complaint is hidden by an unattributed summary.',
    affectedMatterIds: ['q2-2026-packet-trust'],
    workflowIds: ['GV-WF-05', 'GV-WF-06'],
    formIds: ['GB-FORM-QAPI-PACKET-REVIEW'],
    sourceCutoff: '2026-07-10',
  },
  {
    id: 'q2-signoff-substitution',
    title: 'Q1 sign-offs cannot substitute for missing Q2 sign-offs',
    plainLanguageQuestion:
      'Does a complete prior-quarter sign-off bundle validate the current Q2 packet?',
    exhibitIds: ['q2-ex-signoff-status', 'q2-ex-q1-signoffs'],
    conflictingFields: [
      {
        label: 'Sign-off period',
        values: [
          { exhibitId: 'q2-ex-signoff-status', value: 'Q2: zero of three recovered' },
          { exhibitId: 'q2-ex-q1-signoffs', value: 'Q1: three of three complete' },
        ],
      },
    ],
    whyItMatters:
      'A prior-period approval does not establish review or validation of the current packet.',
    affectedMatterIds: ['q2-2026-packet-trust'],
    workflowIds: ['GV-WF-05'],
    formIds: ['GB-FORM-PACKET-READINESS'],
    sourceCutoff: '2026-07-10',
  },
];

export const Q3_PACKET_CONFLICT_GROUPS: PacketConflictGroup[] = [
  {
    id: 'q3-hospitalization-frame',
    title: 'Monthly hospitalization rates mask the cumulative trigger',
    plainLanguageQuestion:
      'Do improving monthly points resolve a quarter-level hospitalization threshold breach?',
    exhibitIds: ['Q3-EX-07', 'Q3-EX-08'],
    conflictingFields: [
      {
        label: 'Rate frame',
        values: [
          { exhibitId: 'Q3-EX-07', value: 'Monthly trend appears within/watch' },
          { exhibitId: 'Q3-EX-08', value: 'Cumulative Q3: 9 of 170, or 5.3%' },
        ],
      },
    ],
    whyItMatters:
      'The Board must not let a favorable presentation frame hide a quarter-level patient-safety trigger.',
    affectedMatterIds: ['M-HOSP'],
    workflowIds: ['GV-WF-06', 'GV-WF-08'],
    formIds: ['GB-FORM-PIP-AUTHORIZATION'],
    sourceCutoff: '2026-10-08',
  },
  {
    id: 'q3-wound-closure',
    title: 'One qualifying month does not satisfy the PIP criterion',
    plainLanguageQuestion:
      'Does September’s improvement prove the wound-infection PIP is sustainably resolved?',
    exhibitIds: ['Q3-EX-10', 'Q3-EX-28'],
    conflictingFields: [
      {
        label: 'Closure evidence',
        values: [
          { exhibitId: 'Q3-EX-10', value: 'September is the first month at or below 5%' },
          { exhibitId: 'Q3-EX-28', value: 'Carry-forward criterion requires two consecutive quarters' },
        ],
      },
    ],
    whyItMatters:
      'Closing on one favorable month would replace the Board-approved sustainability test with a weaker standard.',
    affectedMatterIds: ['M-CARRYFORWARD'],
    workflowIds: ['GV-WF-06'],
    formIds: ['GB-FORM-PIP-CLOSURE'],
    sourceCutoff: '2026-10-08',
  },
  {
    id: 'q3-preventable-count',
    title: 'The “five preventable” count is not fully substantiated',
    plainLanguageQuestion:
      'May the Board rely on the audit’s working count before all event-level RCAs are complete?',
    exhibitIds: ['Q3-EX-13', 'Q3-EX-20'],
    conflictingFields: [
      {
        label: 'Supported count',
        values: [
          { exhibitId: 'Q3-EX-13', value: 'Audit characterizes five events as potentially preventable' },
          { exhibitId: 'Q3-EX-20', value: 'Only completed event records support a smaller final count' },
        ],
      },
    ],
    whyItMatters:
      'The Board can act on a risk signal without presenting an unfinished working count as a final finding.',
    affectedMatterIds: ['M-HOSP'],
    workflowIds: ['GV-WF-08'],
    formIds: ['GB-FORM-RCA-ESCALATION'],
    sourceCutoff: '2026-10-08',
  },
  {
    id: 'q3-complaint-before-rca',
    title: 'The complaint reached the Board before the RCA was complete',
    plainLanguageQuestion:
      'What may the Board rely on when the complaint is known but the event findings remain open?',
    exhibitIds: ['Q3-EX-23', 'Q3-EX-18'],
    conflictingFields: [
      {
        label: 'Record status',
        values: [
          { exhibitId: 'Q3-EX-23', value: 'Complaint escalated for Board awareness' },
          { exhibitId: 'Q3-EX-18', value: 'Underlying RCA remains pending' },
        ],
      },
    ],
    whyItMatters:
      'Awareness of a complaint does not authorize the Board to treat unfinished RCA findings as established fact.',
    affectedMatterIds: ['M-HOSP', 'M-NEWHIRE'],
    workflowIds: ['GV-WF-08', 'GV-WF-09'],
    formIds: ['GB-FORM-RCA-ESCALATION'],
    sourceCutoff: '2026-10-08',
  },
];

export const Q4_PACKET_CONFLICT_GROUPS: PacketConflictGroup[] = [];

export const ANNUAL_PACKET_CONFLICT_GROUPS: PacketConflictGroup[] = [
  {
    id: 'annual-census-boundary',
    title: 'The annual census boundary remains unreconciled',
    plainLanguageQuestion:
      'May the annual report combine Q1 and Q2 population rates while the opening and closing counts disagree?',
    exhibitIds: ['EX-Q1-POPULATION', 'EX-Q2-POPULATION'],
    conflictingFields: [
      {
        label: 'Active patients',
        values: [
          { exhibitId: 'EX-Q1-POPULATION', value: 'Q1 close: 120' },
          { exhibitId: 'EX-Q2-POPULATION', value: 'Q2 opening: 100' },
        ],
      },
    ],
    whyItMatters:
      'The annual record cannot present cross-quarter rates as reconciled while the population boundary remains open.',
    affectedMatterIds: ['M-CENSUS-TRAP', 'M-ANNUAL-CLOSURE'],
    workflowIds: ['GV-WF-05'],
    formIds: ['GB-FORM-RECORD-CORRECTION'],
    sourceCutoff: '2026-12-31',
  },
  {
    id: 'annual-wound-baseline',
    title: 'The wound-infection baseline uses conflicting rate frames',
    plainLanguageQuestion:
      'Which limitation must accompany the annual wound-infection trend?',
    exhibitIds: ['EX-Q1-QM-WOUND', 'EX-Q1-TRIG-006'],
    conflictingFields: [
      {
        label: 'Q1 rate frame',
        values: [
          { exhibitId: 'EX-Q1-QM-WOUND', value: 'Monthly points below 5%; denominator ambiguous' },
          { exhibitId: 'EX-Q1-TRIG-006', value: 'Quarter-close systemic spike of 10–13%' },
        ],
      },
    ],
    whyItMatters:
      'Annual conclusions must preserve the unresolved baseline limitation instead of selecting the more favorable frame.',
    affectedMatterIds: ['M-WOUND-PIP', 'M-ANNUAL-CLOSURE'],
    workflowIds: ['GV-WF-06', 'GV-WF-08'],
    formIds: ['GB-FORM-PIP-CLOSURE'],
    sourceCutoff: '2026-12-31',
  },
  {
    id: 'annual-missing-q1-decision',
    title: 'The Q1 escalation still lacks a real Board decision record',
    plainLanguageQuestion:
      'Can the annual record treat a synthetic motion shell as proof of a prior Board action?',
    exhibitIds: ['EX-Q1-GBESC-001', 'EX-Q1-SYN-MOTION'],
    conflictingFields: [
      {
        label: 'Governance record',
        values: [
          { exhibitId: 'EX-Q1-GBESC-001', value: 'Escalation is documented' },
          { exhibitId: 'EX-Q1-SYN-MOTION', value: 'Synthetic placeholder; no real vote recorded' },
        ],
      },
    ],
    whyItMatters:
      'The annual report must distinguish an escalation record from evidence of the Board’s actual disposition.',
    affectedMatterIds: ['M-PACKET-READY', 'M-ANNUAL-CLOSURE'],
    workflowIds: ['GV-WF-05', 'GV-WF-09'],
    formIds: ['GB-FORM-QAPI-PACKET-REVIEW'],
    sourceCutoff: '2026-12-31',
  },
];
