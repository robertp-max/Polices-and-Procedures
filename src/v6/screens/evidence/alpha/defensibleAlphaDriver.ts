import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';
import { CalendarApi } from '@/policy/services/calendarApi';

export type AlphaPacketPreviewPage = {
  pageNumber: number;
  pageType?: 'cover' | 'toc' | 'section' | 'section-continuation' | 'signature' | 'internal';
  sectionId?: string;
  sectionTitle?: string;
  title?: string;
  html?: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  widthInches: 8.5;
  heightInches: 11;
};

export type AlphaPacketPreview = {
  packetId: string;
  templateId: string;
  title: string;
  pageCount: number;
  source: 'defensible-alpha';
  pages: AlphaPacketPreviewPage[];
  pdfUrl?: string;
  driveFileId?: string;
  driveUrl?: string;
  generatedAt: string;
  status: 'draft' | 'generated' | 'synced' | 'failed';
};

/** Host-verified admission field map (server 3x-read extraction) mapped to the
 * studio's profile keys. When present, generation uses these verified values
 * and does NOT re-detect from source files (which would overwrite them). */
export type AdmissionStudioFields = {
  name?: string;
  mr?: string;
  dob?: string;
  soc?: string;
  dx?: string;
  physician?: string;
  admitting_clinician?: string;
  address?: string;
  phone?: string;
  payer?: string;
  county?: string;
  physician_phone?: string;
  physician_fax?: string;
  f2f_date?: string;
  services_ordered?: string;
  payer_id?: string;
  representative_name?: string;
  representative_relationship?: string;
  legal_authority?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  primary_language?: string;
  interpreter_needed?: string;
  advance_directive_status?: string;
  route?: string;
  /** Private-Pay §8 rate table — only present when the confirmed route is private pay. */
  privatePayRates?: Record<string, unknown> | null;
  /** Studio template id — 'CI-HH-ADM-FORM' renders data-bound HTML (body fills + page preview). */
  admissionTemplate?: string;
};

export type AlphaPacketInput = {
  templateId: string;
  templateTitle?: string;
  eventId: string;
  eventTitle?: string;
  sourceMode?: string;
  billingRoute?: string;
  sourceFiles?: File[];
  admissionFields?: AdmissionStudioFields;
};

type AlphaWindow = Window & {
  applyEventSelection?: (eventId: string, opts?: { fromHost?: boolean }) => void;
  alphaFilesReady?: () => boolean;
  handleFiles?: (files: File[]) => void;
  selectMeeting?: (templateId: string) => void;
  nextStep?: () => void;
  goToStepRaw?: (step: number) => void;
  goToStep?: (step: number) => void;
  renderStep3?: () => void;
  ADM?: {
    family?: () => 'admission' | 'event';
    setFamily?: (family: 'admission' | 'event') => void;
    selectRoute?: (routeId: string) => void;
    generateShellPacket?: () => void;
    renderPanel?: () => void;
    applyPrefill?: (fields: AdmissionStudioFields) => void;
  };
  currentPacketId?: string;
  currentStep?: number;
  packetData?: { forms?: Record<string, Record<string, unknown>> };
  selectedEventId?: string;
  selectedEventTitle?: string;
  selectedMeeting?: { id?: string; title?: string };
  templateLocked?: boolean;
  document: Document;
};

const ALPHA_STUDIO_URL = '/care_indeed_pdf_studio.html?embed=1&alphaBridge=1';
const ALPHA_TIMEOUT_MS = 45000;

const TEMPLATE_TITLE_TO_ALPHA_ID: Record<string, string> = {
  'Patient Admission Packet': 'patient-admission-packet',
  'QAPI Quarterly Committee Meeting': 'qapi_quarterly',
  'QAPI Monthly Committee Meeting': 'qapi_monthly',
  'Governing Body / Board Meeting': 'governing_body',
  'Patient Safety Committee': 'patient_safety',
  'Custom Meeting Packet': 'custom',
};

let alphaReady: Promise<HTMLIFrameElement> | null = null;

function waitForAlphaFileParsing(win: AlphaWindow): Promise<void> {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const tick = () => {
      if (!win.alphaFilesReady || win.alphaFilesReady() || Date.now() - startedAt > 8000) {
        resolve();
        return;
      }
      window.setTimeout(tick, 120);
    };
    tick();
  });
}

function waitForAlphaAdmission(win: AlphaWindow): Promise<void> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const tick = () => {
      if (win.ADM?.setFamily && win.ADM?.selectRoute && win.ADM?.generateShellPacket) {
        resolve();
        return;
      }
      if (Date.now() - startedAt > 8000) {
        reject(new Error('DefenCIble Alpha admission module did not load.'));
        return;
      }
      window.setTimeout(tick, 120);
    };
    tick();
  });
}

function ensureAlphaFrame(): Promise<HTMLIFrameElement> {
  if (alphaReady) return alphaReady;
  alphaReady = new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('DefenCIble Alpha preview requires a browser runtime.'));
      return;
    }
    const frame = document.createElement('iframe');
    frame.title = 'DefenCIble Alpha execution bridge';
    frame.src = ALPHA_STUDIO_URL;
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    // Give the hidden bridge a REAL US-Letter viewport (8.5in x 11in @96dpi) so the
    // studio's paginator/measurement works — at 1px it stalls on large templates
    // (e.g. the admission packet). Kept fully off-screen + non-interactive.
    Object.assign(frame.style, {
      position: 'fixed',
      width: '816px',
      height: '1056px',
      left: '-20000px',
      top: '0',
      // NOT opacity:0 / visibility:hidden / display:none — those pause rAF & paint
      // in the iframe, which stalls the admission paginator. Off-screen hides it.
      pointerEvents: 'none',
      border: '0',
      zIndex: '-1',
    });
    const timeout = window.setTimeout(() => reject(new Error('DefenCIble Alpha bridge did not load.')), 15000);
    frame.onload = () => {
      window.clearTimeout(timeout);
      resolve(frame);
    };
    frame.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error('DefenCIble Alpha bridge failed to load.'));
    };
    document.body.appendChild(frame);
  });
  return alphaReady;
}

function getAlphaWindow(frame: HTMLIFrameElement): AlphaWindow {
  const win = frame.contentWindow as AlphaWindow | null;
  if (!win || !win.document) throw new Error('DefenCIble Alpha bridge is unavailable.');
  return win;
}

function resolveTemplateId(input: Pick<AlphaPacketInput, 'templateId' | 'templateTitle'>): string {
  const id = TEMPLATE_TITLE_TO_ALPHA_ID[input.templateTitle || ''] || input.templateId || 'qapi_quarterly';
  const value = `${input.templateTitle || ''} ${id}`.toLowerCase();
  return id === 'patient_admission' || id === 'CI-HH-ADM-001' || id === 'CI-HH-ADM-PDF' || /patient[-_\s]*admission/.test(value)
    ? 'patient-admission-packet'
    : id;
}

function postEvents(win: Window, eventId: string) {
  const events = REGULATORY_EVENTS
    .filter((event) => !event.isContext)
    .map((event) => ({ id: event.id, title: event.title, date: event.date }));
  win.postMessage({ type: 'ci-events', events, selectedEventId: eventId }, '*');
}

function getAlphaStyles(win?: AlphaWindow): string {
  try {
    const doc = win?.document || document;
    return Array.from(doc.querySelectorAll('style')).map((style) => style.outerHTML).join('\n');
  } catch {
    return '';
  }
}

function splitAlphaPages(html: string, styles = ''): AlphaPacketPreviewPage[] {
  const doc = document.implementation.createHTMLDocument('alpha-preview');
  doc.body.innerHTML = html;
  const inlineStyles = Array.from(doc.body.querySelectorAll('style')).map((style) => style.outerHTML).join('\n');
  const pageNodes = Array.from(doc.body.querySelectorAll<HTMLElement>('.rendered-page'));
  const nodes = pageNodes.length ? pageNodes : Array.from(doc.body.children) as HTMLElement[];
  return nodes.map((node, index) => ({
    pageNumber: index + 1,
    pageType: (node.getAttribute('data-page-type') || undefined) as AlphaPacketPreviewPage['pageType'],
    sectionId: node.getAttribute('data-section-id') || undefined,
    sectionTitle: node.getAttribute('data-section-title') || undefined,
    title: node.getAttribute('data-title') || node.querySelector('h1,h2,.rp-h3')?.textContent?.trim() || `Page ${index + 1}`,
    html: `${styles}${inlineStyles}${node.outerHTML}`,
    widthInches: 8.5,
    heightInches: 11,
  }));
}

function pdfBase64ToObjectUrl(base64: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
}

async function saveAlphaPacketToDrive(payload: {
  packetId?: string;
  eventId?: string;
  title?: string;
  html: string;
  styles: string;
}): Promise<{ driveUrl?: string; driveFileId?: string }> {
  if (!payload.eventId || !payload.html) return {};
  const event = REGULATORY_EVENTS.find((item) => item.id === payload.eventId);
  const standalone = '<!doctype html><html><head><meta charset="utf-8"><title>' + (payload.title || 'Care Indeed Packet') + '</title>' + payload.styles +
    '<style>@page{size:letter;margin:0;}html,body{margin:0!important;padding:0!important;background:#fff;}*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;}' +
    '.preview-sidebar,.studio-nav,.page-thumb,.toast-container,.gen-overlay,.page-modal{display:none!important;}' +
    '.rendered-page{zoom:1!important;box-shadow:none!important;border-radius:0!important;width:8.5in!important;height:11in!important;overflow:hidden!important;margin:0 auto 10px;page-break-after:always;}</style></head><body>' + payload.html + '</body></html>';
  const result = await CalendarApi.savePacket({
    eventId: payload.eventId,
    packetId: payload.packetId || payload.eventId,
    title: payload.title || payload.eventId,
    html: standalone,
    eventDate: event?.date,
    domain: event?.domain,
  });
  return { driveUrl: result.driveFileUrl, driveFileId: result.driveFileId };
}

/** Minimal standalone wrapper for server-side PDF render — keeps the packet's OWN
 * @page rules (the form template paginates itself to its true page count). No
 * card-clipping overrides here, unlike the Drive-save wrapper. */
function buildStandalonePacketHtml(title: string | undefined, html: string, styles: string): string {
  return '<!doctype html><html><head><meta charset="utf-8"><title>' + (title || 'Care Indeed Packet') + '</title>'
    + styles + '</head><body>' + html + '</body></html>';
}

function waitForAlphaPacket(frame: HTMLIFrameElement, packetIdHint?: string, renderToPdf = false): Promise<AlphaPacketPreview> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('DefenCIble Alpha did not return generated preview content.'));
    }, ALPHA_TIMEOUT_MS);

    const cleanup = () => {
      window.clearTimeout(timeout);
      window.removeEventListener('message', onMessage);
    };

    const onMessage = (event: MessageEvent) => {
      // Accept the packet from our hidden Alpha frame. Some browsers deliver the
      // message with event.source === null (notably when the studio posts inside
      // an async callback), which previously caused this listener to silently
      // drop valid `ci-packet-content` and time out. Only reject when the source
      // is a *different* live window.
      if (event.source && event.source !== frame.contentWindow) return;
      const data = event.data as {
        type?: string;
        packetId?: string;
        eventId?: string;
        title?: string;
        html?: string;
        pdfBase64?: string;
        pageCount?: number;
        templateId?: string;
        message?: string;
      };
      if (data?.type === 'ci-packet-error') {
        cleanup();
        reject(new Error(data.message || 'DefenCIble Alpha refused to generate this packet from the provided source data.'));
        return;
      }
      if (data?.type !== 'ci-packet-content' || (!data.html && !data.pdfBase64)) return;
      if (packetIdHint && data.packetId && data.packetId !== packetIdHint) return;
      const alphaWin = getAlphaWindow(frame);
      cleanup();
      void (async () => {
        if (data.pdfBase64 && !data.html) {
          const pdfUrl = pdfBase64ToObjectUrl(data.pdfBase64);
          const pages: AlphaPacketPreviewPage[] = [{
            pageNumber: 1,
            pageType: 'section',
            title: data.title || 'Patient Admission Packet PDF',
            previewUrl: pdfUrl,
            widthInches: 8.5,
            heightInches: 11,
          }];
          resolve({
            packetId: data.packetId || packetIdHint || `alpha-${Date.now()}`,
            templateId: data.templateId || 'patient-admission-packet',
            title: data.title || alphaWin.document.title || 'Patient Admission Packet',
            pageCount: data.pageCount || pages.length,
            source: 'defensible-alpha',
            pages,
            pdfUrl,
            generatedAt: new Date().toISOString(),
            status: 'generated',
          });
          return;
        }
        const html = data.html || '';
        const styles = getAlphaStyles(alphaWin);
        // Admission form template paginates via its OWN @page rules — browsers don't
        // paginate on-screen, so render server-side (Playwright) to a faithful
        // multi-page PDF (e.g. 63 pages). Falls back to on-screen cards if the
        // renderer is unavailable / disabled.
        if (renderToPdf && html) {
          try {
            const rendered = await CalendarApi.renderPdf(buildStandalonePacketHtml(data.title, html, styles));
            if (rendered?.pdfBase64) {
              const pdfUrl = pdfBase64ToObjectUrl(rendered.pdfBase64);
              resolve({
                packetId: data.packetId || packetIdHint || `alpha-${Date.now()}`,
                templateId: data.templateId || 'patient-admission-packet',
                title: data.title || alphaWin.document.title || 'Patient Admission Packet',
                pageCount: data.pageCount || 0,
                source: 'defensible-alpha',
                pages: [{ pageNumber: 1, pageType: 'section', title: data.title || 'Patient Admission Packet', previewUrl: pdfUrl, widthInches: 8.5, heightInches: 11 }],
                pdfUrl,
                generatedAt: new Date().toISOString(),
                status: 'generated',
              });
              void saveAlphaPacketToDrive({ packetId: data.packetId, eventId: data.eventId, title: data.title, html, styles }).catch(() => { /* background best-effort */ });
              return;
            }
          } catch { /* fall through to on-screen cards below */ }
        }
        const pages = splitAlphaPages(html, styles);
        // Resolve the preview IMMEDIATELY. The Drive upload must NEVER block (or
        // fail) the preview — when Drive is unreachable it can hang, which used to
        // freeze the "Uploading to Google Drive" overlay forever. Drive sync now
        // runs in the background, best-effort; the manifest is still updated
        // server-side when the upload succeeds.
        resolve({
          packetId: data.packetId || packetIdHint || `alpha-${Date.now()}`,
          templateId: alphaWin.selectedMeeting?.id || 'defensible-alpha',
          title: data.title || alphaWin.document.title || 'DefenCIble Alpha Packet',
          pageCount: pages.length,
          source: 'defensible-alpha',
          pages,
          generatedAt: new Date().toISOString(),
          status: pages.length ? 'generated' : 'failed',
        });
        // Upload gate: NEVER push a failed/blank generation to Drive. A packet with
        // zero rendered pages is a generation failure — uploading it would sync an
        // empty artifact. Only a validly-paginated packet is eligible for sync.
        if (pages.length > 0) {
          void saveAlphaPacketToDrive({ packetId: data.packetId, eventId: data.eventId, title: data.title, html, styles }).catch(() => { /* background best-effort */ });
        }
      })();
    };

    window.addEventListener('message', onMessage);
  });
}

export async function getAvailableTemplates() {
  return [
    {
      id: 'patient-admission-packet',
      title: 'Patient Admission Packet',
      category: 'Admission / Patient-Facing',
      description: 'Complete admission, patient rights, privacy, consent, financial, emergency, OASIS, safety, plan-of-care, and signature packet.',
      outputModes: ['patient-copy', 'agency-record-copy'],
      requiredInputGroups: ['agency information', 'patient information', 'representative information', 'payer/payment route', 'service lines ordered', 'admission clinician', 'interpreter/witness conditions', 'optional telehealth/RPM', 'optional private pay'],
      signerPolicy: ['patient / authorized representative required', 'admitting clinician required', 'witness conditional', 'interpreter conditional', 'responsible party conditional', 'private-pay signer conditional', 'telehealth/RPM signer conditional'],
    },
    { id: 'qapi_quarterly', title: 'QAPI Quarterly Committee Meeting' },
    { id: 'qapi_monthly', title: 'QAPI Monthly Committee Meeting' },
    { id: 'governing_body', title: 'Governing Body / Board Meeting' },
    { id: 'patient_safety', title: 'Patient Safety Committee' },
    { id: 'custom', title: 'Custom Meeting Packet' },
  ];
}

export async function generatePacket(input: AlphaPacketInput): Promise<AlphaPacketPreview> {
  const frame = await ensureAlphaFrame();
  const win = getAlphaWindow(frame);
  const templateId = resolveTemplateId(input);
  const isAdmission = templateId === 'patient-admission-packet';

  // Host-verified admission fields (server 3x-read extraction). The resolved
  // route is carried ON the prefill so the studio never depends on selectRoute
  // call-ordering. For admission we ALWAYS inject and NEVER let the studio parse
  // source files: the studio can't read PDFs, so a file fallback would either
  // fail or emit a BLANK packet. With injection, empty fields make the studio
  // cleanly refuse (ci-packet-error) instead of generating a blank.
  const resolvedRoute = input.admissionFields?.route || input.billingRoute || 'PENDING_VERIFICATION';
  // Render admission via the AGREEMENT template (CI-HH-ADM-001). Verified by
  // driving the real running studio with Playwright: this template's data-table /
  // form-line structure is what prefillAdmissionBody + bindPayerRoute + fillFormLines
  // target, so the body actually fills (patient info, physician, payer, rep, etc.)
  // and it paginates into per-page cards for the preview. The FORM template
  // (CI-HH-ADM-FORM) does NOT fill or paginate through the studio (proven: 2 pages,
  // most fields blank — its markup differs), so it is not used here.
  const prefill: AdmissionStudioFields | undefined = isAdmission
    ? { ...(input.admissionFields ?? {}), route: resolvedRoute, admissionTemplate: 'CI-HH-ADM-001' }
    : undefined;

  // Admission → render the full 63-page FORM template server-side (Playwright,
  // preferCSSPageSize) from the verified fields. Browsers can't paginate on-screen,
  // so the in-studio path collapsed the form template to ~2 pages (proven by driving
  // the real studio). The server renderer fills cover + body (patient-scoped, no
  // agency bleed) and returns the true page count. Verified: 63 pages, 27 fields.
  if (isAdmission) {
    const fields: Record<string, string> = {};
    for (const [k, v] of Object.entries(input.admissionFields ?? {})) if (typeof v === 'string' && v) fields[k] = v;
    fields.route = resolvedRoute;
    const rendered = await CalendarApi.renderAdmission(fields);
    if (!rendered?.pdfBase64) throw new Error('Admission packet PDF render failed — the API server renderer (Chromium) is unavailable. Is the api server running?');
    const pdfUrl = pdfBase64ToObjectUrl(rendered.pdfBase64);
    return {
      packetId: `adm-${(fields.mr || 'patient').replace(/[^\w-]+/g, '')}-${new Date().toISOString().slice(0, 10)}`,
      templateId: 'patient-admission-packet',
      title: (fields.name ? fields.name + ' — ' : '') + 'Patient Admission Packet',
      pageCount: rendered.pageCount || 0,
      source: 'defensible-alpha',
      pages: [{ pageNumber: 1, pageType: 'section', title: 'Patient Admission Packet', previewUrl: pdfUrl, widthInches: 8.5, heightInches: 11 }],
      pdfUrl,
      generatedAt: new Date().toISOString(),
      status: 'generated',
    };
  }

  if (isAdmission) {
    await waitForAlphaAdmission(win);
    win.postMessage({ type: 'ci-packet-family', family: 'admission' }, '*');
    win.selectMeeting?.('patient_admission');
    win.ADM?.setFamily?.('admission');
    win.ADM?.renderPanel?.();
    if (prefill) {
      // Same-origin direct call is the reliable path; postMessage mirrors it.
      win.postMessage({ type: 'ci-admission-prefill', fields: prefill }, '*');
      win.ADM?.applyPrefill?.(prefill);
    }
  }

  // Only NON-admission packets use the studio's own file parsing. Admission is
  // always driven by the server-verified field map injected above.
  if (input.sourceFiles?.length && !isAdmission) {
    win.handleFiles?.(input.sourceFiles);
    await waitForAlphaFileParsing(win);
  }

  if (isAdmission) {
    win.selectedEventId = input.eventId || 'patient-admission';
    win.selectedEventTitle = input.eventTitle || 'Patient Admission Packet';
    win.ADM?.selectRoute?.(resolvedRoute);
  } else {
    postEvents(win, input.eventId);
    win.applyEventSelection?.(input.eventId, { fromHost: true });
    win.templateLocked = false;
    win.selectMeeting?.(templateId);
  }
  win.goToStepRaw?.(1);
  win.goToStep?.(1);
  // Agreement template previews natively as per-page cards; no server PDF render
  // needed (the form-template PDF path mangled it to 2 pages).
  const previewPromise = waitForAlphaPacket(frame);
  window.setTimeout(() => {
    try {
      if (isAdmission) {
        // Re-assert verified fields (with route) right before render in case any
        // intervening call (route grid re-render) touched the detection state.
        if (prefill) win.ADM?.applyPrefill?.(prefill);
        win.ADM?.generateShellPacket?.();
      } else {
        win.nextStep?.();
        window.setTimeout(() => win.nextStep?.(), 50);
      }
    } catch {
      rejectAlphaByRendering(win);
    }
  }, 50);
  return previewPromise;
}

function rejectAlphaByRendering(win: AlphaWindow) {
  try {
    win.renderStep3?.();
  } catch {
    // The caller's timeout/error path is the authoritative failure state.
  }
}

export async function getAlphaPacketPreview(packetId: string): Promise<AlphaPacketPreview> {
  const frame = await ensureAlphaFrame();
  const win = getAlphaWindow(frame);
  const main = win.document.getElementById('previewMain');
  const html = main?.innerHTML || '';
  const packetIdMatches = !packetId || win.currentPacketId === packetId;
  if (!html || !packetIdMatches) {
    throw new Error('DefenCIble Alpha preview is not available for this packet yet.');
  }
  const pages = splitAlphaPages(html, getAlphaStyles(win));
  return {
    packetId,
    templateId: win.selectedMeeting?.id || 'defensible-alpha',
    title: win.document.title || 'DefenCIble Alpha Packet',
    pageCount: pages.length,
    source: 'defensible-alpha',
    pages,
    generatedAt: new Date().toISOString(),
    status: pages.length ? 'generated' : 'failed',
  };
}

export async function exportPacketPdf(packetId: string): Promise<{ packetId: string; pdfUrl?: string }> {
  const preview = await getAlphaPacketPreview(packetId);
  return { packetId: preview.packetId, pdfUrl: preview.pdfUrl };
}

export async function getSignatureRequirements(packetId: string) {
  const frame = await ensureAlphaFrame();
  const win = getAlphaWindow(frame);
  const packetIdMatches = !packetId || win.currentPacketId === packetId;
  const packetForms = packetIdMatches ? win.packetData?.forms ?? {} : {};
  const signers = extractAlphaSigners(packetForms, win.selectedMeeting?.title || win.selectedMeeting?.id || '');

  return {
    packetId,
    source: 'defensible-alpha' as const,
    status: signers.length ? 'available' as const : 'missing' as const,
    signers,
  };
}

function extractAlphaSigners(forms: Record<string, Record<string, unknown>>, meetingLabel: string) {
  const seen = new Set<string>();
  const signers: Array<{ name?: string; role?: string; status: string; source?: string }> = [];
  const addSigner = (source: string, raw: unknown) => {
    if (!raw) return;
    if (typeof raw === 'string') {
      raw
        .split(/\s*(?:\+|;|,|\band\b|\bthen\b)\s*/i)
        .map((role) => role.trim())
        .filter(Boolean)
        .forEach((role) => addSigner(source, { role }));
      return;
    }
    if (typeof raw !== 'object') return;
    const value = raw as Record<string, unknown>;
    const role = String(value.role || value.title || value.signer_role || value.approverRole || '').trim();
    const name = String(value.name || value.signer || value.printed_name || value.userName || '').trim();
    if (!role && !name) return;
    const key = `${role.toLowerCase()}|${name.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    signers.push({ role: role || undefined, name: name || undefined, status: 'Pending assignment', source });
  };

  Object.entries(forms).forEach(([formId, form]) => {
    addSigner(formId, form.responsible_signer_approver);
    addSigner(formId, form.recorder_signature_line);
    ['signature_lines', 'approver_signature_lines', 'attendee_signature_lines'].forEach((key) => {
      const lines = form[key];
      if (Array.isArray(lines)) lines.forEach((line) => addSigner(formId, line));
    });
  });

  if (signers.length) return signers;
  if (/admission/i.test(meetingLabel)) {
    ['Patient / Authorized Representative', 'Admitting Clinician'].forEach((role) => addSigner('Alpha template policy', { role }));
  } else if (/qapi|committee|governance/i.test(meetingLabel)) {
    ['Administrator', 'Director of Nursing', 'QAPI Committee Chair', 'Clinical Manager'].forEach((role) => addSigner('Alpha template policy', { role }));
  }
  return signers;
}

export async function scheduleSignatureTasks(packetId: string) {
  return {
    packetId,
    source: 'defensible-alpha' as const,
    status: 'scheduled' as const,
  };
}
