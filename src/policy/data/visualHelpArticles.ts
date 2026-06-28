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
      src: '/assets/media/evidence-upload-hero.jpg',
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
  }
};

export default VISUAL_HELP_ARTICLES;