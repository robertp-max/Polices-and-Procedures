import type { VisualHelpArticle } from '../../v6/help/types/helpArticle';

export const VISUAL_HELP_ARTICLES: Record<string, VisualHelpArticle> = {
  'BRAD-HOW-BRAD-WORKS': {
    id: 'BRAD-HOW-BRAD-WORKS',
    slug: 'brad-how-brad-works',
    title: 'How Brad Works',
    shortTitle: 'Brad Basics',
    category: 'brad-ai',
    summary: 'Brad is your internal compliance assistant. It drafts from real policies but never acts without human review.',
    audience: ['all_staff', 'admin'],
    priority: 'P0',
    status: 'live',
    lastUpdated: '2026-06-26',
    sourceRoutes: ['/iadministrator'],
    sourceComponents: ['BradWorkspace.tsx'],
    tags: ['brad', 'ai', 'compliance'],
    hero: {
      type: 'screenshot',
      src: '/assets/media/noon-brad-workspace.png',
      alt: 'Brad iAdministrator workspace in noon mode',
      caption: 'Brad workspace screenshot captured in default (noon) theme.'
    },
    useWhen: ['Need a quick policy answer', 'Generate event packet draft', 'Find related forms or workflows'],
    beforeYouStart: ['Use demo data only in current MVP'],
    steps: [
      {
        id: '1',
        number: 1,
        title: 'Ask in plain language',
        body: 'Type your question. Brad searches internal policies, events, forms.',
        // image placeholder for step
      },
      {
        id: '2',
        number: 2,
        title: 'Review citations',
        body: 'Every answer links back to exact policy sections or forms.',
        // image placeholder for step
      },
      {
        id: '3',
        number: 3,
        title: 'Launch guided tour or packet',
        body: 'Brad can start a step-by-step tour or draft a packet for your review.',
        actionLabel: 'Try a guided tour',
        actionHref: '/help/guided-tours'
      }
    ],
    commonMistakes: [
      { mistake: 'Treating external research as final', fix: 'Always verify against internal corpus.' },
      { mistake: 'Assuming drafts are signed off', fix: 'Human must review and sign.' }
    ],
    screenshots: [
      { src: '/assets/media/noon-brad-workspace.png', alt: 'Brad in noon', caption: 'Full Brad workspace in noon mode.' }
    ],
    nonPhiReminder: true,
    relatedArticles: ['guided-tours', 'ces-events'],
    launchTourId: 'brad-basics'
  },
  'CES-EVIDENCE-PACKET': {
    id: 'CES-EVIDENCE-PACKET',
    slug: 'generate-event-packet',
    title: 'Generate an Event Packet',
    category: 'ces-events',
    summary: 'Use Evidence Studio to collect evidence, map forms, and export a ready packet.',
    audience: ['qapi', 'compliance', 'admin'],
    priority: 'P0',
    status: 'live',
    lastUpdated: '2026-06-26',
    sourceRoutes: ['/evidence/packet-studio'],
    sourceComponents: ['EvidenceStudio.tsx', 'BradEvidenceIntake.tsx'],
    tags: ['ces', 'packet', 'evidence'],
    hero: {
      type: 'screenshot',
      src: '/assets/media/noon-packet-studio.png',
      alt: 'Evidence Packet Studio in noon mode',
      caption: 'Packet Studio screenshot in noon theme.'
    },
    useWhen: ['Prepping for QAPI meeting', 'Audit packet due', 'CES sprint review'],
    steps: [
      { id: '1', number: 1, title: 'Open the event in Studio', body: 'Select event from CES board or calendar.' },
      { id: '2', number: 2, title: 'Map required forms', body: 'Studio shows missing evidence. Upload or link files.' },
      { id: '3', number: 3, title: 'Preview & export', body: 'Review compiled packet. Export PDF or push to Drive.' }
    ],
    commonMistakes: [
      { mistake: 'Missing signatures on critical items', fix: 'Check eCIgn status before export.' }
    ],
    screenshots: [
      { src: '/assets/media/packet-map.png', alt: 'Form mapping', caption: 'Map evidence to required forms.' }
    ],
    nonPhiReminder: true,
    launchTourId: 'event-packet-tour'
  },

  'EVIDENCE-UPLOAD': {
    id: 'EVIDENCE-UPLOAD',
    slug: 'upload-evidence',
    title: 'Upload Evidence in Studio',
    category: 'evidence-center',
    summary: 'Drop files or link exports. Studio classifies, dedupes, and files to the event.',
    audience: ['compliance', 'qapi', 'admin'],
    priority: 'P0',
    status: 'live',
    lastUpdated: '2026-06-26',
    sourceRoutes: ['/evidence/intake'],
    sourceComponents: ['BradEvidenceIntake.tsx'],
    tags: ['evidence', 'upload'],
    hero: {
      type: 'illustration',
      src: '/assets/media/noon-packet-studio.png',
      alt: 'Evidence upload drop zone'
    },
    useWhen: ['Event requires new evidence', 'After form completion'],
    steps: [
      { id: '1', number: 1, title: 'Drag files or paste link', body: 'Studio accepts exports, PDFs, images.' },
      { id: '2', number: 2, title: 'Review auto-classification', body: 'Confirm date, form type, patient context.' },
      { id: '3', number: 3, title: 'File to event', body: 'Link to the right swimlane step.' }
    ],
    commonMistakes: [
      { mistake: 'Uploading real PHI in demo', fix: 'Always use synthetic data.' }
    ],
    screenshots: [],
    nonPhiReminder: true
  },

  /* Getting Started */
  'GETTING-STARTED-BASICS': {
    id: 'GETTING-STARTED-BASICS',
    slug: 'getting-started-basics',
    title: 'Getting Started with the Platform',
    shortTitle: 'Platform Basics',
    category: 'getting-started',
    summary: 'Login, find your way around the shell, use the sidebar, topbar, and Brad for quick answers.',
    audience: ['all_staff'],
    priority: 'P0',
    status: 'live',
    lastUpdated: '2026-06-28',
    sourceRoutes: ['/'],
    sourceComponents: ['V6Shell.tsx'],
    tags: ['onboard', 'basics'],
    hero: {
      type: 'illustration',
      src: '/logomark.svg',
      alt: 'Care Indeed workspace overview'
    },
    useWhen: ['New to the app', 'Forgot where a feature lives'],
    steps: [
      { id: 's1', number: 1, title: 'Log in and pick role view', body: 'Use approved credentials. The shell adapts to your permissions.' },
      { id: 's2', number: 2, title: 'Use the dock and sidebar', body: 'Navigate to Tasks, Calendar, Evidence, Help, and more.' },
      { id: 's3', number: 3, title: 'Ask Brad anytime', body: 'Type questions in the assistant panel for instant internal guidance.' }
    ],
    commonMistakes: [],
    screenshots: [],
    nonPhiReminder: true
  },

  /* Forms */
  'FORMS-FIND-AND-FILL': {
    id: 'FORMS-FIND-AND-FILL',
    slug: 'find-and-complete-forms',
    title: 'Find and Complete Forms',
    category: 'forms',
    summary: 'Search the forms library, open the right template, fill fields, and capture signatures where required.',
    audience: ['all_staff', 'clinician'],
    priority: 'P1',
    status: 'live',
    lastUpdated: '2026-06-28',
    sourceRoutes: ['/forms'],
    sourceComponents: ['FormsLibraryScreen.tsx'],
    tags: ['forms', 'library'],
    hero: {
      type: 'screenshot',
      src: '/assets/media/googledrive_logo.png',
      alt: 'Forms library'
    },
    useWhen: ['Need a specific form for an event', 'Patient admission or visit'],
    steps: [
      { id: 'f1', number: 1, title: 'Search or browse library', body: 'Filter by domain or keyword to locate the exact form.' },
      { id: 'f2', number: 2, title: 'Open and fill', body: 'Complete required fields. Required items are highlighted.' },
      { id: 'f3', number: 3, title: 'Save or send for signature', body: 'Save draft or route via eCIgn when signature is needed.' }
    ],
    commonMistakes: [
      { mistake: 'Using an outdated form link', fix: 'Always start from the library or event context.' }
    ],
    screenshots: [],
    nonPhiReminder: true
  },

  /* Policies */
  'POLICIES-SEARCH-CITE': {
    id: 'POLICIES-SEARCH-CITE',
    slug: 'search-and-cite-policies',
    title: 'Search and Reference Policies',
    category: 'policies',
    summary: 'Locate the right policy, review sections, and cite accurately in notes, packets, and QAPI.',
    audience: ['all_staff', 'compliance'],
    priority: 'P1',
    status: 'live',
    lastUpdated: '2026-06-28',
    sourceRoutes: ['/policies'],
    sourceComponents: ['PolicyDetailScreen.tsx'],
    tags: ['policy', 'reference'],
    hero: {
      type: 'illustration',
      src: '/logomark.svg',
      alt: 'Policy search'
    },
    useWhen: ['Need authoritative guidance', 'Preparing a packet or report'],
    steps: [
      { id: 'p1', number: 1, title: 'Search by keyword or domain', body: 'Policies are full text searchable with section anchors.' },
      { id: 'p2', number: 2, title: 'Read the current version', body: 'Only published versions are authoritative for operations.' },
      { id: 'p3', number: 3, title: 'Cite the exact section', body: 'Copy reference or link for Brad, reports, and audit.' }
    ],
    commonMistakes: [],
    screenshots: [],
    nonPhiReminder: true
  },

  /* QAPI */
  'QAPI-DASH-AND-PACKETS': {
    id: 'QAPI-DASH-AND-PACKETS',
    slug: 'qapi-dashboard-and-packets',
    title: 'Using the QAPI Dashboard and Packets',
    category: 'qapi-reports',
    summary: 'Monitor indicators, prepare monthly packets, and roll up for the Governing Body.',
    audience: ['qapi', 'admin'],
    priority: 'P0',
    status: 'live',
    lastUpdated: '2026-06-28',
    sourceRoutes: ['/qapi'],
    sourceComponents: ['QapiWorkspace'],
    tags: ['qapi'],
    hero: {
      type: 'screenshot',
      src: '/assets/media/noon-brad-workspace.png',
      alt: 'QAPI tools'
    },
    useWhen: ['Monthly QAPI prep', 'Quarterly GB report'],
    steps: [
      { id: 'q1', number: 1, title: 'Review live indicators', body: 'Open dashboard to see thresholds and trends.' },
      { id: 'q2', number: 2, title: 'Build the packet', body: 'Use Packet Studio or Brad to compile evidence and minutes.' },
      { id: 'q3', number: 3, title: 'Submit and track actions', body: 'Record decisions and owners in the action tracker.' }
    ],
    commonMistakes: [],
    screenshots: [],
    nonPhiReminder: true
  },

  /* Admission */
  'ADMISSION-PACKET-FLOW': {
    id: 'ADMISSION-PACKET-FLOW',
    slug: 'admission-packet-workflow',
    title: 'Building an Admission Packet',
    category: 'admission-packets',
    summary: 'Select patient type and payer, generate required forms and agreements, collect signatures.',
    audience: ['clinician', 'admin'],
    priority: 'P1',
    status: 'live',
    lastUpdated: '2026-06-28',
    sourceRoutes: ['/admission'],
    sourceComponents: ['patientAdmissionPacket.tsx'],
    tags: ['admission'],
    hero: {
      type: 'screenshot',
      src: '/assets/media/noon-brad-workspace.png',
      alt: 'Admission packet preview'
    },
    useWhen: ['New patient admission', 'Payer or level of care change'],
    steps: [
      { id: 'a1', number: 1, title: 'Choose pathway', body: 'Select payer and program. Required documents update automatically.' },
      { id: 'a2', number: 2, title: 'Complete sections', body: 'Fill consents, rights, agreements. Use eCIgn for signatures.' },
      { id: 'a3', number: 3, title: 'Review and deliver', body: 'Generate final packet and record receipt.' }
    ],
    commonMistakes: [],
    screenshots: [],
    nonPhiReminder: true
  },

  /* Onboarding */
  'ONBOARDING-JOURNEY': {
    id: 'ONBOARDING-JOURNEY',
    slug: 'onboarding-journey-overview',
    title: 'Completing Your Onboarding Journey',
    category: 'onboarding-journey',
    summary: 'Progress through required modules, Appendix F, competency checks, and drills.',
    audience: ['all_staff'],
    priority: 'P1',
    status: 'live',
    lastUpdated: '2026-06-28',
    sourceRoutes: ['/journey'],
    sourceComponents: ['JourneyOverviewScreen.tsx'],
    tags: ['training', 'onboarding'],
    hero: {
      type: 'illustration',
      src: '/logomark.svg',
      alt: 'Journey learning'
    },
    useWhen: ['New hire or annual refresh'],
    steps: [
      { id: 'j1', number: 1, title: 'Start modules in order', body: 'Complete lessons, knowledge checks, and time requirements.' },
      { id: 'j2', number: 2, title: 'Finish Appendix F drills', body: 'Realistic scenarios with guided practice.' },
      { id: 'j3', number: 3, title: 'Track completion', body: 'Status updates in the journey shell and personal panel.' }
    ],
    commonMistakes: [],
    screenshots: [],
    nonPhiReminder: true
  },

  /* Troubleshooting */
  'TROUBLESHOOTING-COMMON': {
    id: 'TROUBLESHOOTING-COMMON',
    slug: 'common-issues-and-fixes',
    title: 'Common Issues and Quick Fixes',
    category: 'troubleshooting',
    summary: 'Resolve frequent blockers: calendar sync, signature holds, locked events, and missing evidence.',
    audience: ['all_staff'],
    priority: 'P2',
    status: 'live',
    lastUpdated: '2026-06-28',
    sourceRoutes: ['/help'],
    sourceComponents: [],
    tags: ['troubleshoot'],
    hero: {
      type: 'illustration',
      src: '/logomark.svg',
      alt: 'Troubleshoot'
    },
    useWhen: ['Something is red or blocked'],
    steps: [
      { id: 't1', number: 1, title: 'Check the status chips', body: 'Look at enforcement panel, sync indicators, and hold registers.' },
      { id: 't2', number: 2, title: 'Follow the blocker hints', body: 'Each blocker lists the exact next action.' },
      { id: 't3', number: 3, title: 'Ask Brad or open a thread', body: 'Describe the exact symptom for targeted help.' }
    ],
    commonMistakes: [],
    screenshots: [],
    nonPhiReminder: true
  }
};

export default VISUAL_HELP_ARTICLES;