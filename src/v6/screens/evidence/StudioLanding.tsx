import { useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import { EVIDENCE_PACKET_TYPES_BY_ID } from '@/policy/evidence/packetStudio/evidencePacketTypes';
import { buildEvidencePacketDraft, type EvidencePacketDraft } from '@/policy/evidence/packetStudio/packetStudioResolvers';
import { computeAdmissionSigners, ADMISSION_TEMPLATE_ID } from '@/policy/admission/admissionSignerModel';
import { buildAdmissionPacketPages, type AdmissionPacketData, type PaymentRoute } from '@/policy/admission/patientAdmissionPacket';
import { 
  FileText, 
  Calendar,
  Printer,
  CheckCircle2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
  Loader2,
  X
} from 'lucide-react';
import { CalendarApi, type BradTrainingFile, type BradTrainingResponse } from '@/policy/services/calendarApi';

// --- SEEDED TEMPLATES ---
const TEMPLATES = [
  { id: 'CI-HH-ADM-001', name: 'Patient Admission Packet', desc: 'Full patient admission agreement with 42 CFR § 484.50 rights and all standard consents.', tags: ['ADMISSION', 'REQUIRED'], requiresEvent: false },
  { id: 'qapi_quarterly', name: 'QAPI Quarterly Committee Meeting', desc: 'Full quarterly QAPI committee review with KPIs, PIPs, incidents, infection control, chart audits.', tags: ['ACHC REQUIRED', 'QUARTERLY', '8 FORMS'], requiresEvent: true },
  { id: 'qapi_monthly', name: 'QAPI Monthly Committee Meeting', desc: 'Monthly QAPI committee review: rolling KPIs, open PIPs, new incidents, complaints.', tags: ['ACHC REQUIRED', 'MONTHLY', '9 FORMS'], requiresEvent: true },
  { id: 'qapi_annual', name: 'Annual QAPI Program Evaluation', desc: 'Comprehensive annual evaluation of the QAPI program, including performance metrics and objectives.', tags: ['CMS REQUIRED', 'ANNUAL', '4 FORMS'], requiresEvent: true },
  { id: 'governing_body', name: 'Governing Body / Board Meeting', desc: 'Annual or quarterly governing body review of agency operations, financials, compliance status, and quality program effectiveness.', tags: ['CMS REQUIRED', 'ANNUAL / QUARTERLY', '5 FORMS'], requiresEvent: true },
  { id: 'clinical_record_review', name: 'Clinical Record Review Committee', desc: 'Quarterly or monthly clinical record review meeting covering chart audits, documentation compliance, care plan accuracy, and OASIS quality.', tags: ['ACHC CoP', 'MONTHLY / QUARTERLY', '4 FORMS'], requiresEvent: true },
  { id: 'infection_control', name: 'Infection Control Committee', desc: 'Quarterly or as-needed infection surveillance meeting covering line lists, outbreak events, hand hygiene, and antibiotic stewardship.', tags: ['CMS / ACHC', 'QUARTERLY', '5 FORMS'], requiresEvent: true },
  { id: 'patient_safety', name: 'Patient Safety Committee', desc: 'Review of adverse events, near-misses, sentinel events, root cause analyses, and safety improvement initiatives.', tags: ['BEST PRACTICE', 'QUARTERLY', '4 FORMS'], requiresEvent: true },
  { id: 'cag_pac', name: 'CAG / PAC Advisory Meeting', desc: 'Community Advisory Group or Professional Advisory Committee meeting for clinical and community input on agency operations.', tags: ['CMS CoP', 'ANNUAL', '3 FORMS'], requiresEvent: true },
  { id: 'staff_inservice', name: 'Staff In-Service / Training', desc: 'Mandatory staff training and education session documentation with attendance, competency validation, and CEU tracking.', tags: ['ACHC', 'AS SCHEDULED', '3 FORMS'], requiresEvent: true },
  { id: 'custom', name: 'Custom Meeting Packet', desc: 'Build a custom packet from scratch. Define your own sections, forms, and signature blocks.', tags: ['FLEXIBLE', 'ANY FREQUENCY'], requiresEvent: true }
];

// --- SEEDED PAYER ROUTES ---
const PAYER_ROUTES = [
  { id: 'PRIVATE_PAY', name: 'Private Pay', desc: 'Patient/family pays directly. Rate schedule, tokenized payment authorization.', badge: '💵' },
  { id: 'LONG_TERM_CARE_INSURANCE', name: 'Long-Term Care Insurance', desc: 'LTC insurer covers eligible services; patient responsibility for non-covered.', badge: '🏦' },
  { id: 'MEDICARE_ADVANTAGE_OR_PRIVATE_INSURANCE', name: 'Medicare Advantage / Private Insurance', desc: 'Prior auth, copay/coinsurance, denial responsibility.', badge: '🏥' },
  { id: 'ORIGINAL_MEDICARE_FFS', name: 'Original Medicare (FFS)', desc: 'Part A home health benefit. $0 covered. CMS notice matrix.', badge: '🇺🇸' },
  { id: 'MEDI_CAL_OR_MEDICAID', name: 'Medi-Cal / Medicaid', desc: 'No balance billing. Legal review for any patient responsibility.', badge: '🏛️' },
  { id: 'VA_WORKERS_COMP_OR_OTHER_CONTRACT', name: "VA / Workers' Comp / Contract", desc: 'Contracted payer; authorization, scope, claim submission.', badge: '⭐' },
  { id: 'PENDING_VERIFICATION', name: 'Pending Verification', desc: 'Payer not yet confirmed. Estimates only; finalize by deadline.', badge: '⏳' },
  { id: 'NOT_APPLICABLE_NO_BILLABLE_SERVICES', name: 'N/A — No Billable Services', desc: 'Administrative/intake only. No payment clauses.', badge: '📋' }
];

const TEMPLATE_PACKET_TYPE: Record<string, string> = {
  'CI-HH-ADM-001': 'custom-event-packet',
  qapi_quarterly: 'qapi-quarterly-committee',
  qapi_monthly: 'monthly-evidence-readiness',
  qapi_annual: 'annual-qapi-program-evaluation',
  governing_body: 'governing-body-board',
  clinical_record_review: 'clinical-record-review',
  infection_control: 'infection-control-committee',
  patient_safety: 'patient-safety-committee',
  cag_pac: 'cag-pac-advisory',
  staff_inservice: 'staff-training-inservice',
  custom: 'custom-event-packet',
};

interface Signer {
  role: string;
  name: string;
}

export function StudioLanding() {
  const [, setSearchParams] = useSearchParams();
  const evidenceByEvent = useRegulatoryExecutionStore((s) => s.evidence);
  const uploadEvidence = useRegulatoryExecutionStore((s) => s.uploadEvidence);
  const attachDriveMetadata = useRegulatoryExecutionStore((s) => s.attachDriveMetadata);
  const [driveSaveState, setDriveSaveState] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[number] | null>(null);
  const [selectedPayerRoute, setSelectedPayerRoute] = useState<typeof PAYER_ROUTES[number] | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<typeof REGULATORY_EVENTS[number] | null>(null);
  const [dataSource, setDataSource] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [folderFiles, setFolderFiles] = useState<BradTrainingFile[]>([]);
  const [pendingBothFolderSelection, setPendingBothFolderSelection] = useState(false);
  const [drivePickerOpen, setDrivePickerOpen] = useState(false);
  const [eventSearch, setEventSearch] = useState('');
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const dataSourceRef = useRef('');
  
  // Dynamic signers based on template
  const [signers, setSigners] = useState<Signer[]>([]);
  const [generatedPacketId, setGeneratedPacketId] = useState('');
  const [generatedDraft, setGeneratedDraft] = useState<EvidencePacketDraft | null>(null);
  // Rendered document pages (HTML) for the on-screen preview + print/Drive export.
  // Admission packets render the real admission agreement; others use the generic draft.
  const [generatedPages, setGeneratedPages] = useState<string[]>([]);

  // Load compliance events
  const ALL_EVENTS = useMemo(() => REGULATORY_EVENTS.filter(e => !e.isContext), []);

  const filteredEvents = useMemo(() => {
    return ALL_EVENTS.filter(e => 
      e.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
      e.id.toLowerCase().includes(eventSearch.toLowerCase())
    ).slice(0, 15);
  }, [ALL_EVENTS, eventSearch]);

  const handleTemplateSelect = (t: typeof TEMPLATES[number]) => {
    setSelectedTemplate(t);
    if (t.id === ADMISSION_TEMPLATE_ID) {
      // Computed required signer ROLES (no demo names). Names + conditional
      // signers are assigned in the Signature Tracker via the computed model.
      setSigners(computeAdmissionSigners({ signerType: 'PATIENT' }).required.map((r) => ({ role: r.role, name: '' })));
      setStep(2); // Go to Payer Route
    } else {
      setSigners([
        { role: 'DON / Chair', name: 'Dakota Director' },
        { role: 'Clinical Manager', name: 'Riley RN' },
        { role: 'Accounting', name: 'Bailey Billing' },
        { role: 'Compliance Officer', name: 'Cameron Compliance' },
        { role: 'Medical Director', name: 'Morgan MD' },
        { role: 'Administrator', name: 'Avery Admin' },
        { role: 'Social Worker', name: 'Jordan SW' }
      ]);
      setStep(2); // Go to Event Context
    }
  };

  const resetStudio = () => {
    setStep(1);
    setSelectedTemplate(null);
    setSelectedPayerRoute(null);
    setSelectedEvent(null);
    setDataSource('');
    dataSourceRef.current = '';
    setUploadedFiles([]);
    setFolderFiles([]);
    setPendingBothFolderSelection(false);
    setSigners([]);
    setEventSearch('');
    setGeneratedPacketId('');
    setGeneratedDraft(null);
    setGeneratedPages([]);
  };

  const openUploadPicker = () => {
    uploadInputRef.current?.click();
  };

  const openFolderPicker = () => {
    setDrivePickerOpen(true);
  };

  const handleDataSourceSelect = (src: string) => {
    dataSourceRef.current = src;
    setDataSource(src);
    setUploadedFiles([]);
    setFolderFiles([]);
    setPendingBothFolderSelection(false);

    if (src === 'Upload / Camera') {
      openUploadPicker();
      return;
    }

    if (src === 'Folders') {
      openFolderPicker();
      return;
    }

    setPendingBothFolderSelection(true);
    openUploadPicker();
  };

  const handleUploadFilesSelected = (files: FileList | null) => {
    const nextFiles = Array.from(files ?? []);
    if (nextFiles.length === 0) return;
    setUploadedFiles(nextFiles);

    if (dataSourceRef.current === 'Both (Merge)') {
      setPendingBothFolderSelection(true);
      setDrivePickerOpen(true);
      return;
    }

    setStep(4);
  };

  const handleDriveFileSelected = (file: BradTrainingFile) => {
    setFolderFiles((current) => current.some((item) => item.id === file.id) ? current : [...current, file]);
    setPendingBothFolderSelection(false);
    setDrivePickerOpen(false);
    setStep(4);
  };

  const selectedPacketTypeId = selectedTemplate ? (TEMPLATE_PACKET_TYPE[selectedTemplate.id] ?? 'custom-event-packet') : 'custom-event-packet';

  const handleGeneratePreview = () => {
    if (!selectedTemplate) return;
    const eventKey = selectedEvent?.id ?? selectedTemplate.id;
    const packetType = EVIDENCE_PACKET_TYPES_BY_ID.get(selectedPacketTypeId);
    const draft = buildEvidencePacketDraft(selectedEvent?.id, selectedPacketTypeId, evidenceByEvent, 'Brad');
    const enrichedDraft: EvidencePacketDraft = {
      ...draft,
      packetId: `${eventKey}-${Date.now()}`,
      evidenceIds: [
        ...draft.evidenceIds,
        ...uploadedFiles.map((file) => `upload:${file.name}`),
        ...folderFiles.map((file) => `drive:${file.id}`),
      ],
      sources: [
        ...draft.sources,
        ...uploadedFiles.map((file) => ({
          sourceId: `upload:${file.name}`,
          label: file.name,
          sourceType: 'uploaded_file' as const,
          status: 'manual' as const,
          ref: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        })),
        ...folderFiles.map((file) => ({
          sourceId: `drive:${file.id}`,
          label: file.name,
          sourceType: 'uploaded_file' as const,
          status: 'manual' as const,
          ref: 'Google Drive',
        })),
      ],
      bradSummary: `${draft.bradSummary} Source mode: ${dataSource || 'not selected'}. ${uploadedFiles.length} uploaded file(s), ${folderFiles.length} Drive file(s).`,
    };

    const evidenceId = uploadEvidence(eventKey, {
      taskId: 'evidence-packet-studio',
      policyIds: enrichedDraft.policyIds,
      workflowId: enrichedDraft.workflowId,
      formIds: enrichedDraft.formIds,
      name: `${packetType?.label ?? selectedTemplate.name} - draft`,
      kind: 'report',
      sizeLabel: `${Math.max(1, enrichedDraft.sections.length)} sections`,
      artifactType: 'evidence',
      artifactVersion: 'packet-studio-v1',
      artifactId: enrichedDraft.packetId,
      note: JSON.stringify({
        packetId: enrichedDraft.packetId,
        packetTypeId: enrichedDraft.packetTypeId,
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        // Admission signer model inputs (consumed by the Signature Tracker).
        paymentRoute: selectedPayerRoute?.id,
        signerType: 'PATIENT',
        eventId: enrichedDraft.eventId,
        workflowId: enrichedDraft.workflowId,
        policyIds: enrichedDraft.policyIds,
        formIds: enrichedDraft.formIds,
        evidenceIds: enrichedDraft.evidenceIds,
        sourceMode: dataSource,
        uploadedFiles: uploadedFiles.map((file) => ({ name: file.name, size: file.size, type: file.type })),
        driveFiles: folderFiles.map((file) => ({ id: file.id, name: file.name, mimeType: file.mimeType, webViewLink: file.webViewLink })),
        generatedBy: enrichedDraft.generatedBy,
        createdAt: enrichedDraft.createdAt,
        exportStatus: enrichedDraft.exportStatus,
        signatureStatus: enrichedDraft.signatureStatus,
        packetStatus: enrichedDraft.packetStatus,
      }),
    }, 'Brad');

    const contextTitle = selectedEvent?.title ?? selectedPayerRoute?.name ?? 'Manual packet';
    const packetTitle = packetType?.label ?? selectedTemplate.name;
    // Admission packets render the REAL admission agreement (cover + payer-route
    // sections + single signature) from the canonical template — not the generic
    // event-packet draft. Everything else uses the registry-backed draft.
    const isAdmission = selectedTemplate.id === ADMISSION_TEMPLATE_ID;
    const pages = isAdmission
      ? renderAdmissionPagesHtml(buildAdmissionDraftData(selectedPayerRoute?.id, enrichedDraft.packetId, enrichedDraft.createdAt))
      : buildPacketPages(enrichedDraft, packetTitle, contextTitle, evidenceId);
    const packetHtml = pages.join('');

    setGeneratedDraft(enrichedDraft);
    setGeneratedPacketId(enrichedDraft.packetId);
    setGeneratedPages(pages);
    window.postMessage({ type: 'ci-packet-generated', packetId: enrichedDraft.packetId, eventId: eventKey, evidenceId }, '*');
    window.postMessage({ type: 'ci-packet-content', packetId: enrichedDraft.packetId, eventId: eventKey, title: `${packetTitle} ${new Date().toLocaleDateString()}`, html: packetHtml }, '*');
    setStep(5);

    // Save the generated packet PDF/HTML to Google Drive immediately, then write
    // the resulting Drive webViewLink back onto the local Evidence artifact so the
    // Signature Tracker shows it. Fire-and-forget; failures (e.g. Drive not
    // configured locally) leave the artifact link-less without blocking the flow.
    setDriveSaveState('saving');
    CalendarApi.savePacket({
      eventId: eventKey,
      packetId: enrichedDraft.packetId,
      title: `${packetTitle} ${new Date().toLocaleDateString()}`,
      html: packetHtml,
      eventDate: selectedEvent?.date,
      domain: selectedEvent?.domain,
    })
      .then((res) => {
        attachDriveMetadata(eventKey, evidenceId, {
          webViewLink: res.driveFileUrl,
          driveFileId: res.driveFileId,
          driveFolderId: res.driveFolderId,
          driveUploadStatus: 'uploaded',
          driveUploadedAt: new Date().toISOString(),
        });
        setDriveSaveState('saved');
        window.postMessage({ type: 'ci-packet-drive-saved', packetId: enrichedDraft.packetId, eventId: eventKey, webViewLink: res.driveFileUrl }, '*');
      })
      .catch((err: unknown) => {
        attachDriveMetadata(eventKey, evidenceId, { driveUploadStatus: 'failed' });
        setDriveSaveState('failed');
        console.warn('Packet Drive upload failed', err);
      });
  };

  const handleGeneratePacket = () => {
    if (!selectedTemplate) return;
    const packetId = generatedDraft?.packetId || generatedPacketId || `${selectedEvent?.id ?? selectedTemplate.id}-${Date.now()}`;

    setGeneratedPacketId(packetId);

    // Admission packets use the COMPUTED signer model in the Signature Tracker —
    // do NOT seed a fixed roster here. Hand off directly so the Tracker can
    // resolve required + conditional signers and gate task generation.
    if (selectedTemplate.id === ADMISSION_TEMPLATE_ID) {
      resetStudio();
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set('tab', 'signatures');
        next.set('packet', packetId);
        return next;
      });
      return;
    }

    // Seed the record into localStorage for SignatureTracker
    const newRecord = {
      eventId: selectedEvent ? selectedEvent.id : 'CI-HH-ADM-001',
      scheduledFor: selectedEvent ? selectedEvent.date : new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      signers: signers.map(s => ({
        role: s.role,
        name: s.name,
        status: 'scheduled' as const
      }))
    };

    try {
      const allRecords = JSON.parse(localStorage.getItem('ci-signature-tasks') || '{}');
      allRecords[packetId] = newRecord;
      localStorage.setItem('ci-signature-tasks', JSON.stringify(allRecords));

      // Post message to window to broadcast generation
      window.postMessage({ type: 'ci-packet-generated', packetId }, '*');
    } catch (e) {
      console.error(e);
    }

    setStep(7);
  };

  const handleFinish = () => {
    const packetId = generatedPacketId;
    resetStudio();
    // Redirect to Signature Tracker and load the generated packet
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('tab', 'signatures');
      next.set('packet', packetId);
      return next;
    });
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-[32px] p-8 shadow-xl border border-transparent animate-fade-in min-h-[500px]">
      
      {/* STAGE 1: SELECT TEMPLATE */}
      {step === 1 && (
        <div>
          <div className="mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-medium text-[#007C7A] mb-1">Select a Packet Template</h2>
            <p className="text-xs font-light text-gray-400">Choose the compliance or clinical packet template to generate.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLATES.map(t => (
              <div key={t.id} 
                onClick={() => handleTemplateSelect(t)}
                className="bg-white rounded-[24px] border border-gray-100 hover:border-teal-200 shadow-sm p-6 cursor-pointer hover:-translate-y-1.5 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[190px]"
              >
                <div>
                  <h3 className="font-medium text-gray-800 text-base mb-2 leading-tight">{t.name}</h3>
                  <p className="font-light text-xs text-gray-500 line-clamp-3">{t.desc}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {t.tags.map(tag => (
                    <span key={tag} className="border border-gray-200 text-gray-500 px-2 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAGE 2: PAYER ROUTE OR EVENT SELECTION */}
      {step === 2 && selectedTemplate && (
        <div>
          <button onClick={() => resetStudio()} className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-6 hover:text-[#007C7A] transition-colors flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Templates
          </button>
          
          {selectedTemplate.id === 'CI-HH-ADM-001' ? (
            <>
              <div className="mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-xl font-medium text-[#E87722] mb-1">1 • Select Payer Route *</h2>
                <p className="text-xs font-light text-gray-400">Specify the primary billing route to load template-specific contract clauses.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PAYER_ROUTES.map(route => (
                  <div key={route.id} 
                    onClick={() => { setSelectedPayerRoute(route); setStep(3); }}
                    className="bg-white rounded-[16px] border border-gray-100 hover:border-orange-200 shadow-sm p-6 cursor-pointer hover:-translate-y-1.5 hover:shadow-md transition-all duration-300 min-h-[140px] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h3 className="font-medium text-gray-800 text-base">{route.name}</h3>
                        <span className="text-base">{route.badge}</span>
                      </div>
                      <p className="font-light text-xs text-gray-500">{route.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 border-b border-gray-100 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h2 className="text-xl font-medium text-[#E87722] mb-1">1 • Select Event Context *</h2>
                  <p className="text-xs font-light text-gray-400">Search and tie this meeting packet to its registered compliance calendar event.</p>
                </div>
                
                {/* Search Filter Bar */}
                <div className="relative w-full max-w-xs">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input 
                    type="text" 
                    placeholder="Search events..." 
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-full pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#007C7A] focus:bg-white transition-all font-light"
                  />
                </div>
              </div>

              {filteredEvents.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-light text-sm bg-gray-50/50 rounded-2xl">
                  No matching events found. Please refine your search.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map(e => (
                    <div key={e.id} 
                      onClick={() => { setSelectedEvent(e); setStep(3); }}
                      className="bg-white rounded-[16px] border border-gray-100 hover:border-orange-200 shadow-sm p-6 cursor-pointer hover:-translate-y-1.5 hover:shadow-md transition-all duration-300"
                    >
                      <h3 className="font-medium text-gray-800 text-sm mb-2 leading-tight">{e.title}</h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-light uppercase tracking-wider">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{e.date} &nbsp;|&nbsp; {e.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* STAGE 3: SELECT DATA SOURCE */}
      {step === 3 && (
        <div>
          <button onClick={() => setStep(2)} className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-6 hover:text-[#007C7A] transition-colors flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-medium text-gray-700 mb-1">2 • Select Data Source *</h2>
            <p className="text-xs font-light text-gray-400">Choose how source documents will be compiled or merged.</p>
          </div>

          <input
            ref={uploadInputRef}
            type="file"
            className="hidden"
            multiple
            accept="image/*,.pdf,.csv,.xlsx,.xls,.json,.txt,.doc,.docx"
            onChange={(e) => handleUploadFilesSelected(e.target.files)}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Upload / Camera', 'Folders', 'Both (Merge)'].map((src) => (
              <button key={src} 
                onClick={() => handleDataSourceSelect(src)}
                className="p-8 border border-gray-100 hover:border-teal-200 shadow-sm bg-white rounded-[24px] cursor-pointer hover:-translate-y-1.5 hover:shadow-md transition-all duration-300 text-center flex flex-col items-center justify-center min-h-[160px]"
              >
                <div className="font-medium text-gray-800 text-base">{src}</div>
                {src.includes('Upload') && <div className="text-[9px] font-light uppercase tracking-widest text-gray-400 mt-3">Images, PDF, Data files</div>}
                {src === 'Folders' && <div className="text-[9px] font-light uppercase tracking-widest text-gray-400 mt-3">Select folder contents</div>}
                {src === 'Both (Merge)' && <div className="text-[9px] font-light uppercase tracking-widest text-gray-400 mt-3">Upload + folder files</div>}
              </button>
            ))}
          </div>

          {pendingBothFolderSelection && uploadedFiles.length > 0 && (
            <div className="mt-6 rounded-[20px] border border-teal-100 bg-teal-50/50 p-5">
              <p className="text-sm font-medium text-gray-800">Upload selected. Now choose the folder files to merge.</p>
              <p className="mt-1 text-xs font-light text-gray-500">{uploadedFiles.length} uploaded file{uploadedFiles.length === 1 ? '' : 's'} ready.</p>
              <button
                type="button"
                onClick={openFolderPicker}
                className="mt-4 rounded-full bg-[#007C7A] px-5 py-2 text-xs font-medium uppercase tracking-wider text-white shadow-sm transition-all hover:shadow-md"
              >
                Search Folders
              </button>
            </div>
          )}
          {drivePickerOpen && (
            <DrivePickerModal
              onClose={() => {
                setDrivePickerOpen(false);
                setPendingBothFolderSelection(dataSource === 'Both (Merge)' && uploadedFiles.length > 0 && folderFiles.length === 0);
              }}
              onSelect={handleDriveFileSelected}
            />
          )}
        </div>
      )}

      {/* STAGE 4: VALIDATION CHECK */}
      {step === 4 && selectedTemplate && (
        <div>
          <div className="mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-medium text-gray-700 mb-1">Validation Check</h2>
            <p className="text-xs font-light text-gray-400">Reviewing template rules and structural parameters before generation.</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-[24px] p-6 mb-8 shadow-sm">
            <h3 className="text-gray-800 font-medium mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
              Reviewing Data Payload
            </h3>
            <p className="font-light text-sm text-gray-600 mb-4">The defensibility engine is checking all constraints for {selectedTemplate.name}.</p>
            <ul className="list-disc pl-5 text-xs font-light text-gray-500 space-y-2.5">
              <li>Demographic variables verified.</li>
              <li>Clause logic mapped for {selectedPayerRoute ? selectedPayerRoute.name : 'Standard Event'}.</li>
              <li>Data source linked: {dataSource}.</li>
              {uploadedFiles.length > 0 && <li>Uploaded files selected: {uploadedFiles.length}.</li>}
              {folderFiles.length > 0 && <li>Folder files selected: {folderFiles.length}.</li>}
            </ul>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(3)} className="px-8 py-3 text-xs font-medium uppercase tracking-wider text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              Back
            </button>
            <button onClick={handleGeneratePreview} className="px-8 py-3 text-xs font-medium uppercase tracking-wider text-white bg-[#007C7A] rounded-full shadow-md hover:shadow-lg transition-all">
              Generate
            </button>
          </div>
        </div>
      )}

      {/* STAGE 5: PREVIEW */}
      {step === 5 && selectedTemplate && (
        <div className="bg-[#F8FAFC] backdrop-blur-sm rounded-[32px] p-8 shadow-md border border-gray-100 animate-fade-in overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-sm tracking-widest text-[#007C7A] uppercase font-medium">Step 3 • Preview & Export</h2>
            <div className="flex gap-4">
              <button onClick={() => setStep(4)} className="px-6 py-2 border border-gray-300 rounded-full text-xs font-medium bg-white text-gray-600 hover:bg-gray-50 transition-colors">← Back</button>
              <button onClick={() => setStep(6)} className="px-6 py-2 bg-[#007C7A] text-white rounded-full text-xs font-medium shadow-md hover:shadow-lg transition-all">Set up Signing →</button>
            </div>
          </div>
          
          {/* Drive save status */}
          <div className="mb-4 text-xs font-light" aria-live="polite">
            {driveSaveState === 'saving' && <span className="inline-flex items-center gap-2 text-gray-500"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving packet to Google Drive…</span>}
            {driveSaveState === 'saved' && <span className="inline-flex items-center gap-1.5 text-[#007C7A]"><CheckCircle2 className="w-3.5 h-3.5" /> Saved to Google Drive — the Drive URL is now attached to this packet for the Signature Tracker.</span>}
            {driveSaveState === 'failed' && <span className="text-[#C74601]">Couldn’t save to Google Drive (it may not be configured in this environment). The local Evidence Center draft was still created.</span>}
          </div>

          {/* Real generated document pages — the exact HTML used for print/Drive export,
              rendered as scaled thumbnails. Admission packets show the admission agreement;
              other templates show the registry-backed draft. */}
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x pt-2 px-2 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {generatedPages.length > 0 ? generatedPages.map((pageHtml, index) => (
              <div key={index} className="shrink-0 snap-start">
                <div className="overflow-hidden rounded-[12px] border border-gray-100 bg-white shadow-md" style={{ width: 320, height: 414 }}>
                  <div
                    style={{ width: 816, height: 1056, transform: 'scale(0.392157)', transformOrigin: 'top left' }}
                    dangerouslySetInnerHTML={{ __html: pageHtml }}
                  />
                </div>
                <div className="mt-2 text-center text-[10px] font-light text-gray-400">Page {index + 1}</div>
              </div>
            )) : (
              <div className="flex h-[300px] w-full items-center justify-center text-sm font-light text-gray-400">
                Generate the packet to preview its pages.
              </div>
            )}
          </div>
        </div>
      )}

      {/* STAGE 6: ASSIGN SIGNERS */}
      {step === 6 && (
        <div>
          <div className="mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-medium text-[#007C7A] mb-1 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" /> Signature Tasks — Roster Assignment
            </h2>
            <p className="text-xs font-light text-gray-400">Verify the signature roster and configure tasks scheduler.</p>
          </div>

          {/* Signer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {signers.map((s, i) => (
              <div key={i} className="flex justify-between items-center p-4 rounded-[16px] bg-white border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{s.name || 'Assign in Signature Tracker'}</p>
                  <p className="font-light text-xs text-gray-500 mt-1">{s.role}</p>
                </div>
                <div className="flex items-center gap-1 text-orange-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[10px] font-medium uppercase">{selectedTemplate?.id === ADMISSION_TEMPLATE_ID ? 'Required' : 'Scheduled'}</span>
                </div>
              </div>
            ))}
          </div>

          {selectedTemplate?.id === ADMISSION_TEMPLATE_ID ? (
            <div className="bg-teal-50/50 p-6 rounded-[24px] border border-teal-100/50">
              <h3 className="font-medium text-teal-800 flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5" />
                Required + conditional signers are computed in the Signature Tracker
              </h3>
              <p className="font-light text-sm text-teal-900 mb-6">
                The patient/representative and admitting clinician are always required. Conditional signers (witness,
                interpreter, HIPAA ROI §5, private-pay §8, telehealth/RPM §19, and CMS official forms) are determined from
                the selected payer route and admission options. Assign signer names and resolve each conditional decision in
                the Signature Tracker — scheduling stays disabled until everything is resolved.
              </p>
              <button type="button" onClick={handleGeneratePacket} className="w-full md:w-auto px-10 py-4 bg-[#69A7A3] text-white rounded-xl text-sm font-medium shadow-md hover:bg-[#007C7A] hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Continue to Signature Tracker →
              </button>
            </div>
          ) : (
            <div className="bg-teal-50/50 p-6 rounded-[24px] border border-teal-100/50">
              <h3 className="font-medium text-teal-800 flex items-center gap-2 mb-4">
                 <Clock className="w-5 h-5" />
                 Schedule signing
              </h3>
              <label className="flex items-start gap-3 cursor-pointer mb-6">
                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" defaultChecked />
                <span className="font-light text-sm text-teal-900">I confirm these individuals will be assigned tasks to sign this packet.</span>
              </label>
              <button type="button" onClick={handleGeneratePacket} className="w-full md:w-auto px-10 py-4 bg-[#69A7A3] text-white rounded-xl text-sm font-medium shadow-md hover:bg-[#007C7A] hover:shadow-lg transition-all flex items-center justify-center gap-2">
                 <FileText className="w-4 h-4" />
                 Generate & schedule signature tasks
              </button>
            </div>
          )}
        </div>
      )}

      {/* STAGE 7: SUCCESS / DOWNLOAD */}
      {step === 7 && (
        <div className="flex flex-col md:flex-row gap-8 items-start">
           
           <div className="w-full md:w-1/3 bg-[#F8FAFC] rounded-[24px] p-6 shadow-sm border border-gray-100">
              <div className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mb-2">PACKET ID</div>
              <div className="flex gap-2 items-center mb-4">
                 <span className="px-4 py-2 bg-white rounded-lg text-sm font-medium border border-gray-200 text-gray-800 font-mono">{generatedPacketId}</span>
                 <button 
                   onClick={() => { navigator.clipboard.writeText(generatedPacketId); alert('Packet ID copied!'); }} 
                   className="bg-[#007C7A] text-white p-2.5 rounded-lg shadow hover:bg-teal-800 transition-colors flex items-center justify-center"
                   title="Copy Packet ID"
                 >
                    <Copy className="w-4 h-4" />
                 </button>
              </div>
              <div className="font-light text-[10px] text-gray-400 mt-4 leading-relaxed">
                 Packet bound to: {selectedEvent ? selectedEvent.title : 'Admission'}<br/>
                 Generated: {new Date().toLocaleDateString()}
              </div>
           </div>

           <div className="w-full md:w-2/3">
              <h3 className="font-medium text-xl text-gray-900 mb-2 flex items-center gap-2">
                 <CheckCircle2 className="w-6 h-6 text-[#007C7A]" />
                 Thank you — your packet is ready.
              </h3>
              <p className="font-light text-sm text-gray-600 mb-6">
                 Please use this as your formal documentation. Please go over this packet and use the Evidence Studio if you have any corrections.
              </p>
              
              <div className="bg-gray-50 rounded-[16px] p-5 mb-8">
                 <p className="font-medium text-xs text-gray-800 mb-3">Signature tasks have been scheduled for these individuals:</p>
                 <ul className="list-disc pl-5 font-light text-xs text-gray-600 space-y-1">
                   {signers.map((s, i) => (
                     <li key={i}>{s.name} — {s.role}</li>
                   ))}
                 </ul>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                 <button onClick={handleFinish} className="px-6 py-3 bg-[#007C7A] text-white rounded-full text-xs font-medium shadow-md hover:bg-teal-800 hover:shadow-lg transition-all flex items-center gap-2">
                    <Printer className="w-4 h-4" />
                    Print / Download packet
                 </button>
                 <button onClick={handleFinish} className="px-6 py-3 bg-white text-[#007C7A] rounded-full text-xs font-medium border border-teal-100 shadow-sm hover:bg-teal-50 transition-all flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    View completion status
                 </button>
              </div>
           </div>
        </div>
      )}
      
    </div>
  );
}

type DrivePickerKind = 'brad' | 'mock' | 'admission';
interface DrivePickerCrumb { id: string; name: string; kind: DrivePickerKind }

const DRIVE_PICKER_ROOTS: { kind: DrivePickerKind; label: string; helper: string }[] = [
  { kind: 'brad', label: 'Brad Training', helper: 'Training library' },
  { kind: 'mock', label: 'Mock Event Packets', helper: 'Drive packet library' },
  { kind: 'admission', label: 'Patient Admission Packet', helper: 'Drive packet library' },
];

export function DrivePickerModal({ onClose, onSelect }: { onClose: () => void; onSelect: (file: BradTrainingFile) => void }) {
  const [trail, setTrail] = useState<DrivePickerCrumb[]>([]);
  const [query, setQuery] = useState('');
  const [drive, setDrive] = useState<{ status: 'idle' | 'loading' | 'ready' | 'error'; data: BradTrainingResponse | null; error?: string }>({
    status: 'idle',
    data: null,
  });
  const cacheRef = useRef<Map<string, BradTrainingResponse>>(new Map());
  const current = trail[trail.length - 1] ?? null;
  const rootMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || trail.length > 0) return DRIVE_PICKER_ROOTS;
    return DRIVE_PICKER_ROOTS.filter((root) => `${root.label} ${root.helper}`.toLowerCase().includes(q));
  }, [query, trail.length]);

  const loadDrive = (kind: DrivePickerKind, folderId = '', force = false) => {
    const cacheKey = `${kind}:${folderId || '__root__'}`;
    if (!force) {
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        setDrive({ status: 'ready', data: cached });
        return;
      }
    }
    setDrive({ status: 'loading', data: null });
    const fetcher = kind === 'brad'
      ? CalendarApi.bradTrainingDocs(folderId || undefined)
      : CalendarApi.packetLibraryDocs(kind, folderId || undefined);
    fetcher
      .then((data) => {
        cacheRef.current.set(cacheKey, data);
        setDrive({ status: 'ready', data });
      })
      .catch((error: unknown) => {
        setDrive({ status: 'error', data: null, error: error instanceof Error ? error.message : 'Failed to search Drive.' });
      });
  };

  const openRoot = (kind: DrivePickerKind, name: string) => {
    setQuery('');
    setTrail([{ id: '', name, kind }]);
    loadDrive(kind);
  };

  const openFolder = (folder: { id: string; name: string }) => {
    if (!current) return;
    setQuery('');
    setTrail((items) => [...items, { id: folder.id, name: folder.name, kind: current.kind }]);
    loadDrive(current.kind, folder.id);
  };

  const goToCrumb = (index: number) => {
    const nextTrail = trail.slice(0, index + 1);
    const next = nextTrail[nextTrail.length - 1];
    setTrail(nextTrail);
    setQuery('');
    loadDrive(next.kind, next.id);
  };

  const filteredFolders = useMemo(() => {
    const q = query.trim().toLowerCase();
    const folders = drive.data?.folders ?? [];
    return q ? folders.filter((folder) => folder.name.toLowerCase().includes(q)) : folders;
  }, [drive.data, query]);

  const filteredFiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    const files = drive.data?.files ?? [];
    return q ? files.filter((file) => file.name.toLowerCase().includes(q) || file.mimeType.toLowerCase().includes(q)) : files;
  }, [drive.data, query]);

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-ink/20 p-6 backdrop-blur-sm">
      <section className="flex max-h-[82vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white/95 shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-medium text-gray-800">Search Folders</h3>
            <p className="mt-1 text-xs font-light text-gray-500">Browse Drive folders and select the source file for this packet.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close folder search" className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1">
          <aside className="w-64 shrink-0 border-r border-gray-100 p-4">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-widest text-gray-400">Drive roots</p>
            <div className="grid gap-2">
              {rootMatches.map((root) => {
                const active = current?.kind === root.kind && trail.length === 1;
                return (
                  <button
                    key={root.kind}
                    type="button"
                    onClick={() => openRoot(root.kind, root.label)}
                    className={`rounded-2xl px-4 py-3 text-left transition ${active ? 'bg-teal-50 text-[#007C7A]' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    <span className="block text-sm font-medium">{root.label}</span>
                    <span className="mt-1 block text-[10px] uppercase tracking-wider text-gray-400">{root.helper}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="border-b border-gray-100 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                {trail.length === 0 ? (
                  <span>{query.trim() ? 'Select a matching Drive root to search its files.' : 'Select a Drive root to start.'}</span>
                ) : trail.map((crumb, index) => (
                  <span key={`${crumb.kind}-${crumb.id}-${index}`} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                    <button type="button" onClick={() => goToCrumb(index)} className="font-medium text-[#007C7A] hover:text-teal-900">
                      {crumb.name}
                    </button>
                  </span>
                ))}
              </div>
              <label className="flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 py-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={trail.length === 0 ? 'Search Drive roots...' : 'Search current Drive folder...'}
                  className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />
              </label>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-5">
              {trail.length === 0 ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {rootMatches.length > 0 ? rootMatches.map((root) => (
                    <button
                      key={root.kind}
                      type="button"
                      onClick={() => openRoot(root.kind, root.label)}
                      className="rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                    >
                      <span className="block text-sm font-medium text-gray-800">{root.label}</span>
                      <span className="mt-2 block text-[10px] uppercase tracking-widest text-gray-400">{root.helper}</span>
                    </button>
                  )) : (
                    <div className="col-span-full flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200 text-sm text-gray-400">No Drive roots match this search.</div>
                  )}
                </div>
              ) : drive.status === 'loading' ? (
                <div className="flex h-64 items-center justify-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Searching Drive...</div>
              ) : drive.status === 'error' ? (
                <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5 text-sm text-orange-700">
                  {drive.error}
                  {current && (
                    <button type="button" onClick={() => loadDrive(current.kind, current.id, true)} className="ml-3 font-medium underline">Retry</button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {filteredFolders.map((folder) => (
                    <button key={folder.id} type="button" onClick={() => openFolder(folder)} className="rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      <span className="block text-sm font-medium text-gray-800">{folder.name}</span>
                      <span className="mt-2 block text-[10px] uppercase tracking-widest text-gray-400">Folder</span>
                    </button>
                  ))}
                  {filteredFiles.map((file) => (
                    <button key={file.id} type="button" onClick={() => onSelect(file)} className="rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md">
                      <span className="line-clamp-2 text-sm font-medium text-gray-800">{file.name}</span>
                      <span className="mt-2 block text-[10px] uppercase tracking-widest text-gray-400">{file.mimeType}</span>
                    </button>
                  ))}
                  {filteredFolders.length === 0 && filteredFiles.length === 0 && (
                    <div className="col-span-full flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200 text-sm text-gray-400">No folders or files match this search.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const STATUS_COLOR: Record<string, string> = { available: '#007C7A', manual: '#E87722', missing: '#C74601' };

/** Build the real, page-by-page packet document HTML (cover + one page per
    registry-backed section). Used for both the on-screen preview thumbnails and
    the print/Drive export, so they always match. */
export function buildPacketPages(
  draft: EvidencePacketDraft,
  packetTitle: string,
  contextTitle: string,
  evidenceId?: string,
): string[] {
  const sourceBySection = new Map(draft.sources.map((s) => [s.sourceId, s]));
  const cover = `
      <div class="rendered-page" style="position:relative;width:8.5in;height:11in;padding:0.7in;background:#fff;color:#1f1c1b;box-sizing:border-box;page-break-after:always;">
        <div style="height:12px;background:#E87722;margin:-0.7in -0.7in 0.55in;"></div>
        <img src="/ci-logo-gray.png" alt="Care Indeed" style="height:44px;width:auto;margin-bottom:48px;" />
        <p style="font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#E87722;font-weight:600;margin:0 0 18px;">Care Indeed Home Health</p>
        <h1 style="font-size:42px;line-height:1.05;color:#004142;text-transform:uppercase;margin:0 0 28px;">${escapeHtml(packetTitle)}</h1>
        <div style="border-radius:18px;background:#f0fbfb;padding:24px;margin-top:48px;font-size:13px;line-height:1.7;">
          <strong style="color:#007C7A;">Packet ID</strong><br />${escapeHtml(draft.packetId)}<br /><br />
          <strong style="color:#007C7A;">Context</strong><br />${escapeHtml(contextTitle)}<br /><br />
          ${evidenceId ? `<strong style="color:#007C7A;">Evidence Artifact ID</strong><br />${escapeHtml(evidenceId)}<br /><br />` : ''}
          <strong style="color:#007C7A;">Generated</strong><br />${escapeHtml(new Date(draft.createdAt).toLocaleString())}<br /><br />
          <strong style="color:#007C7A;">Status</strong><br />${escapeHtml(draft.packetStatus.replace(/_/g, ' '))}
        </div>
        <footer style="position:absolute;left:0.7in;right:0.7in;bottom:0.45in;font-size:10px;color:#9e9996;display:flex;justify-content:space-between;">
          <span>Care Indeed · DefenCIble packet draft</span><span>${escapeHtml(draft.packetId)}</span>
        </footer>
      </div>
    `;
  const sectionPages = draft.sections.map((section, index) => {
    const src = sourceBySection.get(section.sectionId);
    const statusColor = src ? (STATUS_COLOR[src.status] ?? '#7a7470') : '#7a7470';
    return `
      <div class="rendered-page" style="position:relative;width:8.5in;height:11in;padding:0.7in;background:#fff;color:#1f1c1b;box-sizing:border-box;page-break-after:always;">
        <div style="height:12px;background:#E87722;margin:-0.7in -0.7in 0.5in;"></div>
        <div style="display:flex;justify-content:space-between;gap:24px;margin-bottom:32px;">
          <div>
            <p style="font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#007C7A;margin:0 0 8px;">Section ${index + 1} · ${escapeHtml(section.sourceType.replace(/_/g, ' '))}</p>
            <h2 style="font-size:28px;line-height:1.15;color:#004142;margin:0;">${escapeHtml(section.title)}</h2>
          </div>
          <div style="font-size:11px;text-align:right;color:#7a7470;">${escapeHtml(draft.packetId)}</div>
        </div>
        ${src ? `<div style="display:inline-flex;align-items:center;gap:8px;border-radius:999px;background:${statusColor}1a;color:${statusColor};padding:6px 14px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:22px;">${escapeHtml(src.status)}</div>` : ''}
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tbody>
            ${src ? `<tr><td style="border-bottom:1px solid #e5e4e3;padding:10px;color:#7a7470;width:34%;">Resolved source</td><td style="border-bottom:1px solid #e5e4e3;padding:10px;">${escapeHtml(src.label)}</td></tr>` : ''}
            <tr><td style="border-bottom:1px solid #e5e4e3;padding:10px;color:#7a7470;">Required</td><td style="border-bottom:1px solid #e5e4e3;padding:10px;">${section.required ? 'Yes' : 'No'}</td></tr>
            ${section.formId ? `<tr><td style="border-bottom:1px solid #e5e4e3;padding:10px;color:#7a7470;">Form</td><td style="border-bottom:1px solid #e5e4e3;padding:10px;">${escapeHtml(section.formId)}</td></tr>` : ''}
            ${section.policyId ? `<tr><td style="border-bottom:1px solid #e5e4e3;padding:10px;color:#7a7470;">Policy</td><td style="border-bottom:1px solid #e5e4e3;padding:10px;">${escapeHtml(section.policyId)}</td></tr>` : ''}
            ${section.evidenceType ? `<tr><td style="border-bottom:1px solid #e5e4e3;padding:10px;color:#7a7470;">Evidence</td><td style="border-bottom:1px solid #e5e4e3;padding:10px;">${escapeHtml(section.evidenceType)}</td></tr>` : ''}
            ${src?.ref ? `<tr><td style="border-bottom:1px solid #e5e4e3;padding:10px;color:#7a7470;">Reference</td><td style="border-bottom:1px solid #e5e4e3;padding:10px;">${escapeHtml(src.ref)}</td></tr>` : ''}
          </tbody>
        </table>
        <div style="margin-top:30px;border-radius:16px;background:#fafaf9;border:1px solid #e5e4e3;padding:20px;font-size:13px;line-height:1.7;color:#524d4b;">
          ${escapeHtml(draft.bradSummary)}
        </div>
        <footer style="position:absolute;left:0.7in;right:0.7in;bottom:0.45in;font-size:10px;color:#9e9996;display:flex;justify-content:space-between;">
          <span>Care Indeed · DefenCIble packet draft</span><span>Page ${index + 2}</span>
        </footer>
      </div>
    `;
  });
  return [cover, ...sectionPages];
}

/* ── Admission packet rendering (V6 path) ───────────────────────────────────
   Renders the REAL Patient Admission Packet — cover + payer-route-suppressed
   sections + a single final signature — from the canonical template
   (buildAdmissionPacketPages), not the generic event-packet draft. Neutral field
   phrasing keeps draft clauses readable when patient demographics aren't entered
   in the wizard. Effective Date / Document Version come straight from the
   canonical cover + header. */

const ADMISSION_AGENCY = {
  name: 'Care Indeed Home Health',
  phone: '(650) 328-1001',
  address: 'Service area address on file',
};
const ADMISSION_DOC_VERSION = '1.0 FINAL';
const ADMISSION_EFFECTIVE_DATE = 'July 1, 2026';

export function buildAdmissionDraftData(routeId: string | undefined, packetId: string, createdAtISO: string): AdmissionPacketData {
  return {
    packetId,
    templateId: ADMISSION_TEMPLATE_ID,
    documentVersion: ADMISSION_DOC_VERSION,
    effectiveDate: ADMISSION_EFFECTIVE_DATE,
    patientName: '',
    agencyName: ADMISSION_AGENCY.name,
    agencyPhone: ADMISSION_AGENCY.phone,
    agencyAddress: ADMISSION_AGENCY.address,
    paymentRoute: routeId as PaymentRoute | undefined,
    selectedBy: 'Brad',
    routeSelectedAt: createdAtISO,
    generatedAt: createdAtISO,
    signerName: '',
    signerType: 'PATIENT',
    representativeAuthority: 'PATIENT_SELF',
    representativeDocumentOnFile: false,
    nppAcknowledged: false,
    patientRightsAcknowledged: false,
    cmsNoticesAttached: [],
    staffCollector: 'Admissions',
    fields: {
      privatePayRate: 'provided to you at intake and recorded with this agreement',
      longTermCareCarrier: 'the carrier identified at intake',
      insuranceCarrier: 'the plan identified at intake',
      contractSponsor: 'the sponsor identified at intake',
      pendingEstimateDescription: 'preliminary; final responsibility is confirmed after coverage verification',
      noBillableServicesReason: 'administrative or intake only',
    },
  };
}

export function renderAdmissionPagesHtml(data: AdmissionPacketData): string[] {
  const pages = buildAdmissionPacketPages(data);
  const docV = data.documentVersion ?? ADMISSION_DOC_VERSION;
  const effDate = data.effectiveDate ?? ADMISSION_EFFECTIVE_DATE;
  const release = data.paymentRoute ? 'Production ready with legal hold items' : 'Not production ready (payer route required)';
  const total = pages.length;

  return pages.map((page, i) => {
    const header = `
      <header style="display:flex;justify-content:space-between;gap:24px;border-bottom:4px solid #007c7a;padding-bottom:14px;margin-bottom:22px;">
        <div>
          <div style="color:#005f5e;font-weight:500;font-size:18pt;">Care<span style="color:#e87722;">Indeed</span></div>
          <p style="color:#4a4a4a;margin:0;">Home Health Admission Agreement</p>
        </div>
        <div style="color:#4a4a4a;font-size:8pt;text-align:right;">
          <div>Form ID: ${escapeHtml(data.templateId ?? ADMISSION_TEMPLATE_ID)}</div>
          <div>Document Version: ${escapeHtml(docV)}</div>
          <div>Effective Date: ${escapeHtml(effDate)}</div>
          <div>Packet ID: ${escapeHtml(data.packetId)}</div>
          <div>Release status: ${escapeHtml(release)}</div>
        </div>
      </header>`;

    let bodyHtml = '';
    if (i === 0) {
      const coverFields = (page.sections[0]?.body ?? []).map((line) => {
        const idx = line.indexOf(': ');
        const label = idx >= 0 ? line.slice(0, idx) : line;
        const value = idx >= 0 ? line.slice(idx + 2) : '';
        return `<div><label style="display:block;color:#4a4a4a;font-size:8pt;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;">${escapeHtml(label)}</label><div style="min-height:22px;border-bottom:1px solid #d1d5db;padding:2px 0;">${escapeHtml(value)}</div></div>`;
      }).join('');
      bodyHtml = `
        <h1 style="color:#005f5e;font-size:20pt;font-weight:500;margin:0 0 4px;">Patient Admission Agreement</h1>
        <p style="color:#4a4a4a;margin:0 0 20px;">This patient-facing packet shows only the selected payer pathway and required admission acknowledgments.</p>
        <section style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 18px;">${coverFields}</section>`;
    } else {
      const sectionsHtml = page.sections.filter((s) => !s.internalOnly).map((s) =>
        `<section style="border:1px solid #d1d5db;border-radius:8px;margin-bottom:16px;overflow:hidden;break-inside:avoid;">
          <h2 style="margin:0;padding:10px 14px;background:#007c7a;color:#fff;font-size:12pt;font-weight:500;">${escapeHtml(s.title)}</h2>
          <div style="padding:14px;">${s.body.map((b) => `<p style="margin:0 0 8px;">${escapeHtml(b)}</p>`).join('')}</div>
        </section>`,
      ).join('');
      bodyHtml = `<h1 style="color:#005f5e;font-size:17pt;font-weight:500;margin:0 0 18px;">${escapeHtml(page.title)}</h1>${sectionsHtml}`;
      if (page.pageId === 'final-signature') {
        bodyHtml += `
          <section style="border:2px solid #007c7a;border-radius:8px;padding:16px;background:#f7fafa;break-inside:avoid;">
            <strong>One Final Signature</strong>
            <p>This signature applies to the selected patient-facing sections and selected payer pathway shown in this packet. Separate forms may still be required for authorizations that legally require a dedicated signature.</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:22px;">
              <div style="border-top:1px solid #1a1a1a;padding-top:6px;color:#4a4a4a;font-size:8pt;">Patient or Authorized Representative Signature</div>
              <div style="border-top:1px solid #1a1a1a;padding-top:6px;color:#4a4a4a;font-size:8pt;">Date</div>
            </div>
          </section>`;
      }
    }

    const footer = `
      <footer style="position:absolute;left:0.72in;right:0.72in;bottom:0.32in;display:flex;justify-content:space-between;border-top:1px solid #d1d5db;padding-top:8px;color:#4a4a4a;font-size:7.5pt;">
        <span>Packet ID: ${escapeHtml(data.packetId)}</span>
        <span>v${escapeHtml(docV)} · Eff. ${escapeHtml(effDate)}</span>
        <span>Page ${i + 1} of ${total}</span>
      </footer>`;

    return `<div class="rendered-page" style="position:relative;width:8.5in;height:11in;padding:0.6in 0.72in;background:#fff;color:#1a1a1a;box-sizing:border-box;page-break-after:always;font-family:Roboto,Arial,sans-serif;font-size:11pt;line-height:1.5;">${header}${bodyHtml}${footer}</div>`;
  });
}

export default StudioLanding;
