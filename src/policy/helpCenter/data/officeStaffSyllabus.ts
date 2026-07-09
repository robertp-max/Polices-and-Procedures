import type { SyllabusModule } from '../types';

// Office Staff End User Training Syllabus — 20 modules covering every
// non-admin user-facing workspace. Admin-only surfaces are excluded by design.
export const OFFICE_STAFF_SYLLABUS: SyllabusModule[] = [
  {
    "moduleId": "OS-01",
    "order": 1,
    "title": "Getting Around the App",
    "description": "Learn the V6 app shell: the persistent navigation dock and the dashboard that gets you to every daily tool in one or two clicks.",
    "badges": [
      "office-staff",
      "required",
      "no-phi",
      "basics"
    ],
    "lessons": [
      {
        "lessonId": "OS-01-L1",
        "title": "Navigate the Dashboard and App Shell Dock",
        "component": "V6Shell",
        "route": "/dashboard",
        "userGoal": "Understand the persistent navigation dock and use the dashboard to jump to daily tools.",
        "practiceAction": "From /dashboard, click each icon in the V6Shell side dock once (Home, Compliance, Evidence, Forms, Help) to see where each one lands, then click Home to return to the dashboard.",
        "relatedArticleIds": [
          "HC-GS-NAVIGATION",
          "HC-GS-OVERVIEW"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "basics",
          "no-phi"
        ],
        "screenshotTargets": [
          "img-personal-ops"
        ],
        "knowledgeCheck": {
          "question": "Which part of the screen stays visible no matter which page you're on, so you can jump to another tool?",
          "answer": "The V6Shell navigation dock (the icon rail/side dock) — it persists across pages and links to Dashboard, Compliance, Evidence, Forms, and Help."
        },
        "successCriteria": [
          "Learner can name at least three destinations reachable from the dock.",
          "Learner returns to /dashboard from another page without using the browser back button."
        ],
        "adminExcluded": false
      }
    ]
  },
  {
    "moduleId": "OS-02",
    "order": 2,
    "title": "Finding Help Fast",
    "description": "Use the Help Center to search articles, browse guided tours, and get unstuck without waiting on a teammate.",
    "badges": [
      "office-staff",
      "required",
      "no-phi",
      "quick-start"
    ],
    "lessons": [
      {
        "lessonId": "OS-02-L1",
        "title": "Search the Help Center for an Answer",
        "component": "HelpCenterScreen",
        "route": "/help",
        "userGoal": "Find a relevant help article or guided tour in under a minute using search or category browsing.",
        "practiceAction": "On /help, type a keyword like \"signature\" into the search box, open one of the returned articles, then go back and open the Guided Tours category instead.",
        "relatedArticleIds": [
          "HC-GS-FIND-HELP",
          "HC-TOURS-OVERVIEW",
          "HC-TS-OVERVIEW"
        ],
        "relatedTourIds": [
          "help_thread"
        ],
        "badges": [
          "office-staff",
          "quick-start",
          "no-phi"
        ],
        "screenshotTargets": [
          "img-help-home"
        ],
        "knowledgeCheck": {
          "question": "If searching doesn't turn up an answer, what are two other ways to get help from /help?",
          "answer": "Browse a category (like Guided Tours or Troubleshooting), or start a help thread to ask the community/Brad."
        },
        "successCriteria": [
          "Learner runs a search and opens a result article.",
          "Learner locates the Guided Tours category."
        ],
        "adminExcluded": false
      }
    ]
  },
  {
    "moduleId": "OS-03",
    "order": 3,
    "title": "Using Brad Safely",
    "description": "Learn how to ask Brad the AI assistant a question, read its citations, and understand what Brad's answers can and cannot be used for.",
    "badges": [
      "office-staff",
      "required",
      "no-phi",
      "not-attestation"
    ],
    "lessons": [
      {
        "lessonId": "OS-03-L1",
        "title": "Ask Brad a Question and Check Its Citations",
        "component": "BradWorkspace",
        "route": "/iadministrator",
        "userGoal": "Ask Brad a policy question, read the answer's citations, and understand that Brad's answers are not an official attestation.",
        "practiceAction": "On /iadministrator, type a sample question like \"What is the process for reporting an incident?\" into Brad's chat box, submit it, then open the citation link Brad provides underneath its answer.",
        "relatedArticleIds": [
          "HC-BRAD-OVERVIEW",
          "HC-BRAD-ASK",
          "HC-BRAD-SAFETY"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "brad",
          "no-phi",
          "not-attestation"
        ],
        "screenshotTargets": [
          "img-brad-workspace"
        ],
        "knowledgeCheck": {
          "question": "Can you treat Brad's answer as an official compliance attestation?",
          "answer": "No — Brad's answers are informational and cite source policies; a human must still review and sign off on anything compliance-related."
        },
        "successCriteria": [
          "Learner submits a question to Brad.",
          "Learner opens at least one citation link in Brad's response."
        ],
        "adminExcluded": false
      }
    ]
  },
  {
    "moduleId": "OS-04",
    "order": 4,
    "title": "Using Nolan for Training Help",
    "description": "Use Nolan, the learner assistant, inside the Journey Academy panel to get unstuck on a training module.",
    "badges": [
      "office-staff",
      "learner",
      "no-phi",
      "training-only"
    ],
    "lessons": [
      {
        "lessonId": "OS-04-L1",
        "title": "Ask Nolan a Training Question in the Journey Panel",
        "component": "NolanTutorPanel",
        "route": "/journey",
        "userGoal": "Open the Nolan panel inside Journey Academy and ask a training-related question.",
        "practiceAction": "On /journey, open the Nolan panel and ask \"What is this module about?\" to see Nolan respond with training-specific guidance.",
        "relatedArticleIds": [
          "HC-NOLAN-OVERVIEW",
          "HC-NOLAN-ASK"
        ],
        "relatedTourIds": [],
        "badges": [
          "learner",
          "nolan",
          "no-phi"
        ],
        "screenshotTargets": [
          "img-nolan-tutor"
        ],
        "knowledgeCheck": {
          "question": "What is Nolan scoped to help with, compared to Brad?",
          "answer": "Nolan is the learner/training assistant scoped to onboarding and course content in Journey Academy, while Brad answers broader policy and compliance questions."
        },
        "successCriteria": [
          "Learner opens the Nolan panel from /journey.",
          "Learner submits a training question and reads Nolan's reply."
        ],
        "adminExcluded": false
      }
    ]
  },
  {
    "moduleId": "OS-05",
    "order": 5,
    "title": "Working Events in CES",
    "description": "Start from the Compliance home to see how CES is organized, then read the events risk board to understand what's tracked there.",
    "badges": [
      "office-staff",
      "ces",
      "required",
      "no-phi"
    ],
    "lessons": [
      {
        "lessonId": "OS-05-L1",
        "title": "Start From the Compliance Home",
        "component": "ComplianceHomeScreen",
        "route": "/compliance",
        "userGoal": "Understand the CES home page layout and how it links to boards, calendar, and events.",
        "practiceAction": "On /compliance, click into each summary card (e.g., Open Events, Upcoming Tasks) once to see what it links to, then return to /compliance.",
        "relatedArticleIds": [
          "HC-CES-OVERVIEW"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "ces",
          "no-phi"
        ],
        "screenshotTargets": [
          "img-ces-board"
        ],
        "knowledgeCheck": {
          "question": "What is the Compliance home page (/compliance) used for?",
          "answer": "It's the entry point to CES — a dashboard summarizing open events, tasks, and links into the board, calendar, and events views."
        },
        "successCriteria": [
          "Learner opens at least two summary cards from /compliance."
        ],
        "adminExcluded": false
      },
      {
        "lessonId": "OS-05-L2",
        "title": "Read the Events Risk Board",
        "component": "EventsBoardScreen",
        "route": "/ces/events",
        "userGoal": "Read event entries on the risk board and understand severity and status indicators.",
        "practiceAction": "On /ces/events, open a sample event card and identify its status and risk level, then use the filter bar to narrow the list to one category.",
        "relatedArticleIds": [
          "HC-CES-EVENTS-BOARD"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "ces",
          "reference",
          "no-phi"
        ],
        "screenshotTargets": [
          "img-events-board"
        ],
        "knowledgeCheck": {
          "question": "What does the events risk board show at a glance?",
          "answer": "A filterable list of tracked events with their status and risk/severity indicators."
        },
        "successCriteria": [
          "Learner opens an event card.",
          "Learner applies a filter to the events board."
        ],
        "adminExcluded": false
      }
    ]
  },
  {
    "moduleId": "OS-06",
    "order": 6,
    "title": "Using the Calendar and Event Views",
    "description": "Use the CES calendar to see upcoming and past events by date and switch between calendar view modes.",
    "badges": [
      "office-staff",
      "ces",
      "no-phi"
    ],
    "lessons": [
      {
        "lessonId": "OS-06-L1",
        "title": "Browse Events on the CES Calendar",
        "component": "CalendarScreen",
        "route": "/ces/calendar",
        "userGoal": "Find events on a given date and switch between month and week views.",
        "practiceAction": "On /ces/calendar, switch from month view to week view, click a date with an event marker, and open that event's detail.",
        "relatedArticleIds": [
          "HC-CES-CALENDAR"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "ces",
          "workflow",
          "no-phi"
        ],
        "screenshotTargets": [
          "img-ces-calendar"
        ],
        "knowledgeCheck": {
          "question": "How do you see the details of an event shown on the calendar?",
          "answer": "Click the date/marker for that event to open its detail view."
        },
        "successCriteria": [
          "Learner switches calendar view mode.",
          "Learner opens an event from a calendar date."
        ],
        "adminExcluded": false
      }
    ]
  },
  {
    "moduleId": "OS-07",
    "order": 7,
    "title": "Completing Event Tasks",
    "description": "Work your assigned tasks from My Tasks, then see how those same tasks appear on the shared CES board.",
    "badges": [
      "office-staff",
      "ces",
      "required",
      "no-phi"
    ],
    "lessons": [
      {
        "lessonId": "OS-07-L1",
        "title": "Complete an Assigned Task in My Tasks",
        "component": "MyTasksScreen",
        "route": "/my-tasks",
        "userGoal": "Find a task assigned to you and mark it complete with a supporting note.",
        "practiceAction": "On /my-tasks, open a sample assigned task, add a completion note, and mark it done.",
        "relatedArticleIds": [
          "HC-CES-MY-TASKS"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "ces",
          "required",
          "no-phi"
        ],
        "screenshotTargets": [
          "img-my-tasks"
        ],
        "knowledgeCheck": {
          "question": "Where do you go to see only the tasks assigned to you?",
          "answer": "/my-tasks — it lists tasks assigned specifically to your account."
        },
        "successCriteria": [
          "Learner opens an assigned task.",
          "Learner marks a task complete."
        ],
        "adminExcluded": false
      },
      {
        "lessonId": "OS-07-L2",
        "title": "Find Your Tasks on the CES Board",
        "component": "BoardScreen",
        "route": "/ces/board",
        "userGoal": "Locate your own tasks on the shared CES board using the Mine filter.",
        "practiceAction": "On /ces/board, use the \"Mine\" filter to show only your own cards, then open one card to review its details.",
        "relatedArticleIds": [
          "HC-CES-BOARD"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "ces",
          "workflow",
          "no-phi"
        ],
        "screenshotTargets": [
          "img-ces-board"
        ],
        "knowledgeCheck": {
          "question": "What does the Mine filter on the CES board do, and what board actions are outside your role as office staff?",
          "answer": "Mine filters the board down to cards assigned to you; sign-off actions like control-register clearance are gated to leadership/supervisors, not office staff."
        },
        "successCriteria": [
          "Learner applies the Mine filter.",
          "Learner opens a card to view its details."
        ],
        "adminExcluded": false
      }
    ]
  },
  {
    "moduleId": "OS-08",
    "order": 8,
    "title": "Uploading and Reviewing Evidence",
    "description": "Upload supporting files in Evidence Intake and see how Brad helps suggest a classification for each one.",
    "badges": [
      "office-staff",
      "evidence",
      "required",
      "no-phi"
    ],
    "lessons": [
      {
        "lessonId": "OS-08-L1",
        "title": "Upload a File in Evidence Intake",
        "component": "BradEvidenceIntake",
        "route": "/evidence/intake",
        "userGoal": "Upload a sample document and confirm Brad's suggested classification before saving.",
        "practiceAction": "On /evidence/intake, upload a sample PDF or image, review Brad's suggested category/tag, and confirm or correct it before saving.",
        "relatedArticleIds": [
          "HC-EVID-OVERVIEW",
          "HC-EVID-UPLOAD",
          "HC-TS-UPLOAD"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "evidence",
          "upload",
          "no-phi"
        ],
        "screenshotTargets": [
          "img-evidence-intake"
        ],
        "knowledgeCheck": {
          "question": "After you upload a file, what should you check before saving it?",
          "answer": "Review Brad's suggested classification/tag and correct it if it's wrong before saving."
        },
        "successCriteria": [
          "Learner uploads a sample file.",
          "Learner reviews and confirms or corrects the suggested classification."
        ],
        "adminExcluded": false
      }
    ]
  },
  {
    "moduleId": "OS-09",
    "order": 9,
    "title": "Reviewing Evidence Packets",
    "description": "Assemble a packet in Evidence Studio, then open the finished packet in the Artifact Viewer to review its contents and checklist.",
    "badges": [
      "office-staff",
      "evidence",
      "no-phi"
    ],
    "lessons": [
      {
        "lessonId": "OS-09-L1",
        "title": "Assemble a Packet in Evidence Studio",
        "component": "EvidenceStudio",
        "route": "/evidence/packet-studio",
        "userGoal": "Add evidence items to a packet in Studio and understand the packet-builder layout.",
        "practiceAction": "On /evidence/packet-studio, drag a sample evidence item into the packet tray, reorder it, and save the draft packet.",
        "relatedArticleIds": [
          "HC-EVID-PACKET-STUDIO",
          "HC-TOUR-EVENT-PACKET"
        ],
        "relatedTourIds": [
          "event_packet"
        ],
        "badges": [
          "office-staff",
          "evidence",
          "workflow",
          "no-phi"
        ],
        "screenshotTargets": [
          "img-evidence-packet-studio"
        ],
        "knowledgeCheck": {
          "question": "What does Evidence Studio let you do with individual evidence items?",
          "answer": "Assemble, order, and save them together into a single evidence packet."
        },
        "successCriteria": [
          "Learner adds an item to a packet.",
          "Learner saves a draft packet."
        ],
        "adminExcluded": false
      },
      {
        "lessonId": "OS-09-L2",
        "title": "Review a Packet in the Artifact Viewer",
        "component": "ArtifactViewerScreen",
        "route": "/artifacts/:artifactId",
        "userGoal": "Open a saved packet's artifact view and review its checklist and contents.",
        "practiceAction": "From a saved packet in Evidence Studio, click \"View Artifact\" to open /artifacts/:artifactId, then step through its review checklist items.",
        "relatedArticleIds": [
          "HC-EVID-REVIEW-PACKET"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "evidence",
          "checklist",
          "no-phi"
        ],
        "screenshotTargets": [
          "img-artifact-viewer"
        ],
        "knowledgeCheck": {
          "question": "What can you check inside the Artifact Viewer for a packet?",
          "answer": "Its checklist items and included evidence, to confirm the packet is complete and correctly attached."
        },
        "successCriteria": [
          "Learner opens an artifact viewer page for a packet.",
          "Learner reviews at least one checklist item."
        ],
        "adminExcluded": false
      }
    ]
  },
  {
    "moduleId": "OS-10",
    "order": 10,
    "title": "Using eCign and Signature Status",
    "description": "Sign a form in the eCign workspace, then track signature status from the Studio Signature Tracker.",
    "badges": [
      "office-staff",
      "ecign",
      "signature",
      "no-phi"
    ],
    "lessons": [
      {
        "lessonId": "OS-10-L1",
        "title": "Sign a Form in the eCign Workspace",
        "component": "EcignWorkspaceScreen",
        "route": "/forms/:formId/esign",
        "userGoal": "Open a form's eCign workspace, review the document, and apply a signature.",
        "practiceAction": "On a sample form's /forms/:formId/esign page, scroll to the signature field, click \"Sign\", and apply your sample signature.",
        "relatedArticleIds": [
          "HC-ECIGN-OVERVIEW",
          "HC-ECIGN-WORKSPACE"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "ecign",
          "signature",
          "no-phi"
        ],
        "screenshotTargets": [
          "img-form-viewer"
        ],
        "knowledgeCheck": {
          "question": "What must you do before signing a form in eCign?",
          "answer": "Review the document content in the workspace so you know what you're signing before applying your signature."
        },
        "successCriteria": [
          "Learner opens a form's eCign page.",
          "Learner applies a sample signature."
        ],
        "adminExcluded": false
      },
      {
        "lessonId": "OS-10-L2",
        "title": "Track Signature Status in Evidence Studio",
        "component": "EvidenceStudio",
        "route": "/evidence/packet-studio",
        "userGoal": "Find the signature tracker in Evidence Studio and check whether a document is signed, pending, or overdue.",
        "practiceAction": "On /evidence/packet-studio, open the Signature Tracker panel and locate a sample document's status (Signed, Pending, or Overdue).",
        "relatedArticleIds": [
          "HC-ECIGN-STATUS"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "ecign",
          "signature",
          "workflow",
          "no-phi"
        ],
        "screenshotTargets": [
          "img-ecign-status"
        ],
        "knowledgeCheck": {
          "question": "What three statuses might you see for a document in the Signature Tracker?",
          "answer": "Signed, Pending, and Overdue."
        },
        "successCriteria": [
          "Learner opens the Signature Tracker panel.",
          "Learner identifies a document's current status."
        ],
        "adminExcluded": false
      }
    ]
  },
  {
    "moduleId": "OS-11",
    "order": 11,
    "title": "Finding, Viewing, Printing, and Downloading Forms",
    "description": "Learn to search the Forms Library for the form you need, open it to review its contents, and print or download a copy for office use.",
    "badges": [
      "office-staff",
      "required",
      "forms",
      "no-phi"
    ],
    "lessons": [
      {
        "lessonId": "OS-11-L1",
        "title": "Find a Form in the Forms Library",
        "component": "FormsLibraryScreen",
        "route": "/forms",
        "userGoal": "Locate the correct form quickly using search and category filters.",
        "practiceAction": "In the Forms Library at /forms, type \"consent\" into the search box and open the first demo consent form result.",
        "relatedArticleIds": [
          "HC-FORMS-OVERVIEW",
          "HC-FORMS-LIBRARY"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "forms",
          "no-phi"
        ],
        "screenshotTargets": [
          "img-forms-library"
        ],
        "knowledgeCheck": {
          "question": "Where do you go to browse and search all available forms?",
          "answer": "The Forms Library at /forms, using its search box and category filters."
        },
        "successCriteria": [
          "Learner opens the Forms Library",
          "Learner uses search or a category filter to narrow the list",
          "Learner opens a matching demo form to view it"
        ],
        "adminExcluded": false
      },
      {
        "lessonId": "OS-11-L2",
        "title": "View, Print, and Download a Form",
        "component": "FormWorkspaceScreen",
        "route": "/forms/:formId/print",
        "userGoal": "Open a form's viewer, then produce a print or downloadable copy without leaving demo data.",
        "practiceAction": "Open any demo form from the library, click Print/Download, and confirm the print preview shows the correct form title and version.",
        "relatedArticleIds": [
          "HC-FORMS-FILL",
          "HC-FORMS-PRINT"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "forms",
          "print"
        ],
        "screenshotTargets": [
          "img-form-viewer"
        ],
        "knowledgeCheck": {
          "question": "What should you check before printing a form?",
          "answer": "That the print preview shows the correct form title and current version before printing or downloading."
        },
        "successCriteria": [
          "Learner opens a form's viewer",
          "Learner triggers the print or download action",
          "Learner confirms the correct form and version appear in the print preview"
        ],
        "adminExcluded": false
      }
    ]
  },
  {
    "moduleId": "OS-12",
    "order": 12,
    "title": "Finding, Reading, and Printing Policies",
    "description": "Learn to search the Policy Library, open a policy to read its full text, and print a copy for reference.",
    "badges": [
      "office-staff",
      "required",
      "policies",
      "no-phi"
    ],
    "lessons": [
      {
        "lessonId": "OS-12-L1",
        "title": "Search the Policy Library and Read a Policy",
        "component": "PolicyMatrixScreen",
        "route": "/library/policies",
        "userGoal": "Find a specific policy using the library search and open it to read.",
        "practiceAction": "At /library/policies, filter by category \"Infection Control\" and open a demo policy to read its full text.",
        "relatedArticleIds": [
          "HC-POL-OVERVIEW",
          "HC-POL-LIBRARY",
          "HC-POL-READ"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "policies",
          "no-phi"
        ],
        "screenshotTargets": [
          "img-policy-library"
        ],
        "knowledgeCheck": {
          "question": "Where can you filter policies by category before opening one?",
          "answer": "The Policy Library at /library/policies."
        },
        "successCriteria": [
          "Learner opens the Policy Library",
          "Learner filters or searches by category",
          "Learner opens a demo policy and reads its detail page"
        ],
        "adminExcluded": false
      },
      {
        "lessonId": "OS-12-L2",
        "title": "Print a Policy",
        "component": "PolicyDetailScreen",
        "route": "/library/:policyId/print",
        "userGoal": "Generate a print-ready version of an open policy for reference.",
        "practiceAction": "From an open demo policy detail page, click Print and confirm the print view shows the policy title and effective date.",
        "relatedArticleIds": [
          "HC-POL-PRINT"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "policies",
          "print"
        ],
        "screenshotTargets": [
          "img-policy-detail"
        ],
        "knowledgeCheck": {
          "question": "What two details should you confirm on a policy's print preview?",
          "answer": "The policy title and its effective date."
        },
        "successCriteria": [
          "Learner opens a policy detail page",
          "Learner triggers the print action",
          "Learner confirms the correct title and effective date appear on the print preview"
        ],
        "adminExcluded": false
      }
    ]
  },
  {
    "moduleId": "OS-13",
    "order": 13,
    "title": "Reading QAPI & Reports",
    "description": "Learn to read CES sprint reports and navigate the other report views available to office staff.",
    "badges": [
      "office-staff",
      "reports",
      "no-phi"
    ],
    "lessons": [
      {
        "lessonId": "OS-13-L1",
        "title": "Read CES Sprint Reports",
        "component": "ReportsScreen",
        "route": "/ces/reports",
        "userGoal": "Understand what a CES sprint report shows and how to read its summary metrics.",
        "practiceAction": "Open /ces/reports and open the most recent demo sprint report to review its summary metrics.",
        "relatedArticleIds": [
          "HC-QAPI-OVERVIEW",
          "HC-QAPI-CES-REPORTS"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "reports",
          "no-phi"
        ],
        "screenshotTargets": [
          "img-qapi-reports"
        ],
        "knowledgeCheck": {
          "question": "Where do you find CES sprint reports?",
          "answer": "At /ces/reports, under the CES & Events area."
        },
        "successCriteria": [
          "Learner opens /ces/reports",
          "Learner opens a demo sprint report",
          "Learner identifies its summary metrics"
        ],
        "adminExcluded": false
      },
      {
        "lessonId": "OS-13-L2",
        "title": "Navigate Other Report Views",
        "component": "ReportPlaceholder",
        "route": "/reports/policy-review-aging",
        "userGoal": "Locate and read a specific report view such as policy review aging or training overdue.",
        "practiceAction": "Navigate to /reports/training-overdue and identify which demo staff records appear as overdue.",
        "relatedArticleIds": [
          "HC-QAPI-REPORT-VIEWS"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "reports",
          "reference"
        ],
        "screenshotTargets": [
          "img-qapi-reports"
        ],
        "knowledgeCheck": {
          "question": "Besides /ces/reports, where else can you find report views?",
          "answer": "Under /reports/*, such as /reports/policy-review-aging or /reports/training-overdue."
        },
        "successCriteria": [
          "Learner navigates to a /reports/* view",
          "Learner reads the report contents",
          "Learner identifies at least one demo record shown in the report"
        ],
        "adminExcluded": false
      }
    ]
  },
  {
    "moduleId": "OS-14",
    "order": 14,
    "title": "Using Audit & Survey Support Views",
    "description": "Learn to browse Audit Mode and the ACHC/HH Evidence Map reference views used to see how internal evidence maps to requirements.",
    "badges": [
      "office-staff",
      "audit-support",
      "survey-support",
      "no-phi"
    ],
    "lessons": [
      {
        "lessonId": "OS-14-L1",
        "title": "Use Audit Mode to Review Evidence",
        "component": "EvidenceScreen",
        "route": "/audit",
        "userGoal": "Browse Audit Mode to see how evidence is organized for internal review.",
        "practiceAction": "Open /audit and open a demo evidence item to see its linked policy and form references.",
        "relatedArticleIds": [
          "HC-AUDIT-OVERVIEW",
          "HC-AUDIT-MODE"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "audit-support",
          "no-phi"
        ],
        "screenshotTargets": [
          "img-audit-mode"
        ],
        "knowledgeCheck": {
          "question": "What can you see when you open a demo evidence item in Audit Mode?",
          "answer": "Its linked policy and form references."
        },
        "successCriteria": [
          "Learner opens /audit",
          "Learner opens a demo evidence item",
          "Learner identifies its linked policy or form references"
        ],
        "adminExcluded": false
      },
      {
        "lessonId": "OS-14-L2",
        "title": "Browse ACHC Alignment and HH Evidence Map Views",
        "component": "AchcScreen",
        "route": "/framework/achc-survey",
        "userGoal": "Browse the ACHC alignment and HH evidence map reference views to see how requirements map to internal evidence, for reference only.",
        "practiceAction": "Open /framework/achc-survey, then /framework/hh-evidence-map, and search for a demo tag to see which policies are linked to it.",
        "relatedArticleIds": [
          "HC-AUDIT-ACHC-VIEWS",
          "HC-AUDIT-EVIDENCE-MAP"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "survey-support",
          "reference"
        ],
        "screenshotTargets": [
          "img-achc-views"
        ],
        "knowledgeCheck": {
          "question": "Do these ACHC and evidence map views make a survey-readiness determination?",
          "answer": "No, they are reference views only; any survey or compliance determination is made by the compliance/leadership team."
        },
        "successCriteria": [
          "Learner opens the ACHC alignment view",
          "Learner opens the HH Evidence Map view",
          "Learner searches a demo tag and identifies its linked policies",
          "Learner states that these views are reference-only, not a compliance determination"
        ],
        "adminExcluded": false
      }
    ]
  },
  {
    "moduleId": "OS-15",
    "order": 15,
    "title": "Admission Packet End-User Workflow",
    "description": "Learn to preview the patient admission packet template and build a demo packet using the Payer Selector in Evidence Studio.",
    "badges": [
      "office-staff",
      "admission",
      "no-phi"
    ],
    "lessons": [
      {
        "lessonId": "OS-15-L1",
        "title": "Preview the Patient Admission Packet",
        "component": "AdmissionPacketPreviewScreen",
        "route": "/evidence/admission-packet-preview",
        "userGoal": "See how the admission packet template renders for a demo patient before it is used.",
        "practiceAction": "Open /evidence/admission-packet-preview and select a demo payer to see how the packet content changes.",
        "relatedArticleIds": [
          "HC-ADM-OVERVIEW",
          "HC-ADM-PREVIEW"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "admission",
          "no-phi"
        ],
        "screenshotTargets": [
          "img-admission-packet"
        ],
        "knowledgeCheck": {
          "question": "What changes when you select a different demo payer in the admission packet preview?",
          "answer": "The packet content shown, since packet contents adjust to the selected payer."
        },
        "successCriteria": [
          "Learner opens the admission packet preview",
          "Learner selects a demo payer",
          "Learner observes the packet content change accordingly"
        ],
        "adminExcluded": false
      },
      {
        "lessonId": "OS-15-L2",
        "title": "Build an Admission Packet with the Payer Selector",
        "component": "EvidenceStudio",
        "route": "/evidence/packet-studio",
        "userGoal": "Use the Payer Selector in Evidence Studio to assemble a demo admission packet.",
        "practiceAction": "In /evidence/packet-studio, choose a demo payer from the Payer Selector and add the admission packet template to a new packet draft.",
        "relatedArticleIds": [
          "HC-ADM-BUILD"
        ],
        "relatedTourIds": [
          "event_packet"
        ],
        "badges": [
          "office-staff",
          "admission",
          "workflow"
        ],
        "screenshotTargets": [
          "img-evidence-packet-studio"
        ],
        "knowledgeCheck": {
          "question": "Which tool in Evidence Studio determines which admission packet template is used?",
          "answer": "The Payer Selector."
        },
        "successCriteria": [
          "Learner opens Evidence Studio",
          "Learner uses the Payer Selector to choose a demo payer",
          "Learner adds the admission packet template to a new draft packet"
        ],
        "adminExcluded": false
      }
    ]
  },
  {
    "moduleId": "OS-16",
    "order": 16,
    "title": "Onboarding / Journey Learner Workflow",
    "description": "Learn to navigate the Training Academy, complete a module in the module player, and track Appendix F and new-hire gate progress.",
    "badges": [
      "office-staff",
      "learner",
      "training-only",
      "required"
    ],
    "lessons": [
      {
        "lessonId": "OS-16-L1",
        "title": "Navigate the Academy and Complete a Training Module",
        "component": "JourneyAcademyScreen",
        "route": "/journey",
        "userGoal": "Find an assigned module in the Academy and complete a lesson using the module player.",
        "practiceAction": "Open /journey, open a demo assigned module, and complete its first lesson in the module player, answering the Nolan checkpoint question.",
        "relatedArticleIds": [
          "HC-JRN-OVERVIEW",
          "HC-JRN-ACADEMY",
          "HC-JRN-MODULE-PLAYER"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "learner",
          "training-only"
        ],
        "screenshotTargets": [
          "img-journey-academy"
        ],
        "knowledgeCheck": {
          "question": "Where do you go to see your assigned training modules?",
          "answer": "The Training Academy at /journey."
        },
        "successCriteria": [
          "Learner opens /journey",
          "Learner opens a demo assigned module",
          "Learner completes a lesson in the module player and answers a checkpoint question"
        ],
        "adminExcluded": false
      },
      {
        "lessonId": "OS-16-L2",
        "title": "Complete Appendix F and Track New Hire Gates",
        "component": "AppendixFScreen",
        "route": "/journey/appendix-f",
        "userGoal": "Complete the Appendix F checklist and check progress on new-hire gates.",
        "practiceAction": "Open /journey/appendix-f, check off a demo checklist item, then open /journey/new-hire to see which gates are still open.",
        "relatedArticleIds": [
          "HC-JRN-APPENDIX-F",
          "HC-JRN-NEW-HIRE"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "learner",
          "checklist"
        ],
        "screenshotTargets": [
          "img-journey-academy"
        ],
        "knowledgeCheck": {
          "question": "Where can you see which new-hire gates are still open?",
          "answer": "The New Hire Gates screen at /journey/new-hire."
        },
        "successCriteria": [
          "Learner opens the Appendix F checklist and checks off a demo item",
          "Learner opens the new-hire gates screen",
          "Learner identifies which gates are still open"
        ],
        "adminExcluded": false
      }
    ]
  },
  {
    "moduleId": "OS-17",
    "order": 17,
    "title": "Community, Threads, and Feature Requests",
    "description": "Learn to participate in Community discussions, start and follow help threads, and submit a feature request.",
    "badges": [
      "office-staff",
      "community",
      "no-phi"
    ],
    "lessons": [
      {
        "lessonId": "OS-17-L1",
        "title": "Participate in Community Discussions",
        "component": "CommunityScreen",
        "route": "/community",
        "userGoal": "Browse Community, follow a discussion, and understand how your profile visibility works.",
        "practiceAction": "Open /community, open a demo discussion post, and add a reply to it.",
        "relatedArticleIds": [
          "HC-COM-OVERVIEW",
          "HC-COM-PARTICIPATE",
          "HC-COM-PROFILE"
        ],
        "relatedTourIds": [
          "community"
        ],
        "badges": [
          "office-staff",
          "community",
          "no-phi"
        ],
        "screenshotTargets": [
          "img-community-threads"
        ],
        "knowledgeCheck": {
          "question": "Where can office staff post and reply to discussions?",
          "answer": "The Community screen at /community."
        },
        "successCriteria": [
          "Learner opens /community",
          "Learner opens a demo discussion post",
          "Learner posts a reply"
        ],
        "adminExcluded": false
      },
      {
        "lessonId": "OS-17-L2",
        "title": "Start a Help Thread and Submit a Feature Request",
        "component": "ThreadComposer",
        "route": "/help/threads/new",
        "userGoal": "Start a help thread, understand Brad's thread replies, and submit and track a feature request.",
        "practiceAction": "Open /help/threads/new, start a demo thread titled \"Test question\", then go to the Help Center and submit a demo feature request.",
        "relatedArticleIds": [
          "HC-THR-OVERVIEW",
          "HC-THR-START",
          "HC-THR-FOLLOW",
          "HC-FR-OVERVIEW",
          "HC-FR-SUBMIT"
        ],
        "relatedTourIds": [
          "help_thread"
        ],
        "badges": [
          "office-staff",
          "community",
          "workflow"
        ],
        "screenshotTargets": [
          "img-community-threads"
        ],
        "knowledgeCheck": {
          "question": "Who or what may reply to a help thread you start?",
          "answer": "Other staff members or Brad, whose replies are shown as Brad thread replies."
        },
        "successCriteria": [
          "Learner opens /help/threads/new and starts a demo thread",
          "Learner locates the feature request option in the Help Center",
          "Learner submits a demo feature request"
        ],
        "adminExcluded": false
      }
    ]
  },
  {
    "moduleId": "OS-18",
    "order": 18,
    "title": "Notifications & Personal Panel",
    "description": "Learn to use the Personal Ops Panel on the dashboard to review notifications, tasks, and quick shortcuts.",
    "badges": [
      "office-staff",
      "required",
      "no-phi"
    ],
    "lessons": [
      {
        "lessonId": "OS-18-L1",
        "title": "Use the Personal Ops Panel",
        "component": "PersonalOpsPanel",
        "route": "/dashboard",
        "userGoal": "Check notifications, tasks, and shortcuts in the Personal Ops Panel on the dashboard.",
        "practiceAction": "On /dashboard, open the Personal Ops Panel and clear a demo notification.",
        "relatedArticleIds": [
          "HC-NP-OVERVIEW",
          "HC-NP-PANEL"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "core",
          "no-phi"
        ],
        "screenshotTargets": [
          "img-personal-ops"
        ],
        "knowledgeCheck": {
          "question": "Where do your notifications and personal task shortcuts appear?",
          "answer": "The Personal Ops Panel on the /dashboard."
        },
        "successCriteria": [
          "Learner opens the dashboard",
          "Learner opens the Personal Ops Panel",
          "Learner clears or acknowledges a demo notification"
        ],
        "adminExcluded": false
      }
    ]
  },
  {
    "moduleId": "OS-19",
    "order": 19,
    "title": "Troubleshooting Common Issues",
    "description": "Learn to use the Help Center to resolve common problems: can't-find and printing issues, evidence upload failures, stuck guided tours, and sign-in issues.",
    "badges": [
      "office-staff",
      "troubleshooting",
      "no-phi"
    ],
    "lessons": [
      {
        "lessonId": "OS-19-L1",
        "title": "Troubleshoot Can't-Find and Printing Problems",
        "component": "HelpCenterScreen",
        "route": "/help",
        "userGoal": "Use the Help Center to resolve common \"can't find\" and printing/download problems for forms and policies.",
        "practiceAction": "Open /help, search \"can't find a form\", read the troubleshooting steps, then confirm you can locate the same demo form from /forms.",
        "relatedArticleIds": [
          "HC-TS-OVERVIEW",
          "HC-TS-CANT-FIND",
          "HC-TS-PRINT"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "troubleshooting",
          "no-phi"
        ],
        "screenshotTargets": [
          "img-troubleshooting"
        ],
        "knowledgeCheck": {
          "question": "Where do you look first when you can't find a form or policy, or a print isn't working?",
          "answer": "The Help Center troubleshooting articles at /help."
        },
        "successCriteria": [
          "Learner opens the Help Center",
          "Learner searches for a troubleshooting topic",
          "Learner applies the steps to locate the demo form"
        ],
        "adminExcluded": false
      },
      {
        "lessonId": "OS-19-L2",
        "title": "Troubleshoot Evidence Uploads, Guided Tours, and Sign-In",
        "component": "BradEvidenceIntake",
        "route": "/evidence/intake",
        "userGoal": "Resolve evidence upload failures, a stuck guided tour, or a sign-in/session issue using Help Center guidance.",
        "practiceAction": "Open /help, search \"evidence upload fails\", then open /evidence/intake and retry uploading a demo file to confirm it classifies correctly.",
        "relatedArticleIds": [
          "HC-TS-UPLOAD",
          "HC-TS-TOUR-STUCK",
          "HC-TS-SESSION"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "troubleshooting",
          "evidence"
        ],
        "screenshotTargets": [
          "img-evidence-intake"
        ],
        "knowledgeCheck": {
          "question": "What should you do if a demo evidence file uploads but is misclassified?",
          "answer": "Follow the Help Center's evidence upload troubleshooting steps and retry the upload, checking the classification before continuing."
        },
        "successCriteria": [
          "Learner searches the Help Center for an upload troubleshooting article",
          "Learner opens /evidence/intake and retries a demo upload",
          "Learner confirms the demo file classifies correctly"
        ],
        "adminExcluded": false
      }
    ]
  },
  {
    "moduleId": "OS-20",
    "order": 20,
    "title": "Final Office Staff Competency Scenario",
    "description": "A capstone scenario chaining the skills from Modules 11-19 into one realistic office-staff workflow, using demo data only.",
    "badges": [
      "office-staff",
      "required",
      "checklist",
      "no-phi"
    ],
    "lessons": [
      {
        "lessonId": "OS-20-L1",
        "title": "Capstone Part 1: Locate, Print, and Report",
        "component": "DashboardScreen",
        "route": "/dashboard",
        "userGoal": "Chain together forms, policies, and reports skills to complete a realistic office-staff task end to end.",
        "practiceAction": "Starting at /dashboard, find and print a demo consent form, then find and print its related policy, then check /ces/reports to see the demo sprint report reflecting the activity.",
        "relatedArticleIds": [
          "HC-FORMS-PRINT",
          "HC-POL-PRINT",
          "HC-QAPI-CES-REPORTS"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "required",
          "checklist"
        ],
        "screenshotTargets": [
          "img-office-syllabus"
        ],
        "knowledgeCheck": {
          "question": "Which three earlier modules' skills does this scenario chain together?",
          "answer": "Forms (Module 11), Policies (Module 12), and QAPI & Reports (Module 13)."
        },
        "successCriteria": [
          "Learner finds and prints a demo form",
          "Learner finds and prints the related demo policy",
          "Learner checks the CES sprint report for related activity"
        ],
        "adminExcluded": false
      },
      {
        "lessonId": "OS-20-L2",
        "title": "Capstone Part 2: Build, Review, and Communicate",
        "component": "EvidenceStudio",
        "route": "/evidence/packet-studio",
        "userGoal": "Chain together admission packet building, audit review, and community communication skills into one workflow.",
        "practiceAction": "Build a demo admission packet in Evidence Studio, review it in Audit Mode at /audit, then post a summary of what you did as a new thread at /help/threads/new.",
        "relatedArticleIds": [
          "HC-ADM-BUILD",
          "HC-AUDIT-MODE",
          "HC-THR-START"
        ],
        "relatedTourIds": [],
        "badges": [
          "office-staff",
          "required",
          "checklist"
        ],
        "screenshotTargets": [
          "img-office-syllabus"
        ],
        "knowledgeCheck": {
          "question": "Which three earlier modules' skills does this second scenario chain together?",
          "answer": "Admission Packets (Module 15), Audit & Survey Support Views (Module 14), and Community/Threads (Module 17)."
        },
        "successCriteria": [
          "Learner builds a demo admission packet in Evidence Studio",
          "Learner reviews the packet in Audit Mode",
          "Learner posts a summary thread describing the completed workflow"
        ],
        "adminExcluded": false
      }
    ]
  }
];
