import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Lock,
  ShieldCheck,
  Download,
  Printer,
  ArrowLeft
} from 'lucide-react';
import { useLearner } from '@/policy/journey/lib/learnerState';
import { useUiState, formatHoursAndMins } from '@/policy/journey/lib/uiState';
import { activeTimeMet, requiredTheoryComplete } from '@/policy/journey/lib/moduleProgress';
import { summarizeGates, type GateStatus } from '@/policy/journey/lib/gates';
import { appCopy } from '@/policy/journey/data/contentV2Adapter';
import { JourneyLearningShell } from './JourneyLearningShell';
import { ReviewerToolsPanel } from '@/policy/journey/components/ReviewerToolsPanel';
import { useJourneyStore } from '@/policy/journey/stores/journeyStore';
import { APPENDIX_F_TEMPLATE } from '@/policy/journey/data/appendices';
import type { AppendixFItem, SignatureRecord } from '@/policy/journey/types/journey';

const LOGO_DARK = 'https://dovdry3t4njek.cloudfront.net/assets/ci-logo-gray-Dju7zS6k.png';
const SIGNATURE_SRC = 'image_be8721.png'; // Vanessa Valerio's Signature

function GateRow({ done, locked, title, detail }: { done: boolean; locked?: boolean; title: string; detail: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-surface-glass backdrop-blur-md shadow-glass-inset border border-hairline rounded-lg shadow-sm">
      <div className="mt-0.5 shrink-0">
        {done ? (
          <CheckCircle2 size={16} className="text-brand-teal" />
        ) : locked ? (
          <Lock size={16} className="text-muted" />
        ) : (
          <Circle size={16} className="text-muted" />
        )}
      </div>
      <div>
        <span className="text-[11px] font-bold text-brand-teal-deep block uppercase font-mono">{title}</span>
        <span className="text-[10px] text-secondary">{detail}</span>
      </div>
    </div>
  );
}

const statusLabel: Record<GateStatus, string> = {
  complete: "Met",
  pending: "Pending",
  blocked: "Blocked",
  "needs-review": "Needs review",
  "not-started": "Not started",
};

const achcTopics = [
  "Cultural Awareness",
  "Emergency / Disaster",
  "Complaints & Grievances",
  "HIPAA Compliance",
  "Infection Control",
  "Communication Barriers",
  "Workplace / Patient Safety (OSHA)",
  "Patient Rights & Responsibilities",
  "Corporate Compliance",
  "Ethics",
  "TB / Blood Borne Pathogens",
  "Medical Device Act"
];

export function AppendixFScreen() {
  const { state, update } = useLearner();
  const journey = useJourneyStore();
  const { demoSeconds } = useUiState();
  const [viewingCert, setViewingCert] = useState(false);
  const [localItems, setLocalItems] = useState<AppendixFItem[] | null>(null);
  const [sigName, setSigName] = useState('');
  const [sigRole, setSigRole] = useState<'HRDirector' | 'Supervisor' | 'Other'>('HRDirector');
  const [sigMessage, setSigMessage] = useState<string | null>(null);

  const currentEmpId = journey.currentEmployeeId;
  const employee = journey.employees.find(e => e.id === currentEmpId) || journey.employees[0];
  const storedItems = journey.appendixF[currentEmpId] ?? APPENDIX_F_TEMPLATE.map(i => ({ ...i }));
  const items = localItems ?? storedItems;
  const allCleared = items.every(i => i.status === 'PASS' || i.status === 'NA');

  function updateItem(id: number, status: AppendixFItem['status'], notes?: string) {
    const updated = items.map(it => it.id === id ? { ...it, status, notes: notes ?? it.notes, completedAt: new Date().toISOString() } : it);
    setLocalItems(updated);
    journey.updateAppendixFItem(currentEmpId, id, status, notes);
  }

  function handleSignAppendixF() {
    setSigMessage(null);
    if (!allCleared) {
      setSigMessage('All 15 items must be PASS or NA.');
      return;
    }
    if (sigRole !== 'HRDirector') {
      setSigMessage('Signature requires HRDirector role.');
      return;
    }
    const sig: SignatureRecord = { name: sigName.trim() || employee.name, role: 'HRDirector', pngDataUrl: '', signedAt: new Date().toISOString() };
    const res = journey.signAppendixF(currentEmpId, sig);
    setSigMessage(res.message);
    if (res.ok) setLocalItems(null);
  }

  const legalReady = Boolean(state.legalFirstName.trim() && state.legalLastName.trim() && state.cnaNumber.trim());
  const hoursMet = activeTimeMet(state);
  const competency = requiredTheoryComplete(state) && state.finalExamPassed;
  const affidavit = state.affidavitComplete;
  const coreReady = legalReady && hoursMet && competency;
  const allReady = coreReady && affidavit;

  const summary = summarizeGates(state);

  const recipientName = `${state.legalFirstName} ${state.legalLastName}`;
  const completionDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const handleSigError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    img.style.display = 'none';
    const fallback = img.nextElementSibling as HTMLElement | null;
    if (fallback) fallback.style.display = 'block';
  };

  const handlePrint = () => {
    window.print();
  };

  if (viewingCert) {
    return (
      <div className="space-y-6">
        <style dangerouslySetInnerHTML={{__html: `
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700;900&display=swap');
          .font-serif { font-family: 'Playfair Display', serif; }
          .font-sans { font-family: 'Inter', sans-serif; }
          
          .cert-container { 
              aspect-ratio: 11 / 8.5; /* US Letter Landscape */
              max-width: 1100px;
              width: 100%;
          } 
          
          /* Clean Dark Signature Filter for Light Backgrounds */
          .clean-sig-dark { 
              filter: grayscale(100%) contrast(160%) brightness(115%);
              mix-blend-mode: multiply; 
          }

          /* Seamless Geometric Star Lattice (Deep Teal + Orange accents) */
          .bg-geometric-arabesque {
              background-color: #002a2b; /* Deep Premium Teal */
              background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23C74601' stroke-width='1.5' stroke-opacity='0.4'%3E%3Crect x='15' y='15' width='30' height='30' transform='rotate(45 30 30)' /%3E%3Crect x='15' y='15' width='30' height='30' /%3E%3Cpath d='M0 30 h15 M45 30 h15 M30 0 v15 M30 45 v15' /%3E%3Crect x='-15' y='-15' width='30' height='30' transform='rotate(45 0 0)' /%3E%3Crect x='-15' y='-15' width='30' height='30' /%3E%3Crect x='45' y='-15' width='30' height='30' transform='rotate(45 60 0)' /%3E%3Crect x='45' y='-15' width='30' height='30' /%3E%3Crect x='-15' y='45' width='30' height='30' transform='rotate(45 0 60)' /%3E%3Crect x='-15' y='45' width='30' height='30' /%3E%3Crect x='45' y='45' width='30' height='30' transform='rotate(45 60 60)' /%3E%3Crect x='45' y='45' width='30' height='30' /%3E%3C/g%3E%3C/svg%3E");
          }

          @media print {
            .no-print {
              display: none !important;
            }
            .cert-print-wrapper {
              position: fixed;
              left: 0;
              top: 0;
              width: 100vw;
              height: 100vh;
              z-index: 99999;
              background: white;
              padding: 0;
              margin: 0;
            }
            .cert-container {
              box-shadow: none !important;
              max-width: 100% !important;
              width: 100% !important;
              height: 100% !important;
              padding: 0 !important;
              aspect-ratio: 11 / 8.5 !important;
            }
          }
        `}} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-5xl ml-0 mr-auto w-full no-print">
          <button
            onClick={() => setViewingCert(false)}
            className="text-brand-teal hover:text-brand-teal-deep inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <ArrowLeft size={14} /> Back to Gate Checklist
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted italic">Watermarked Mock Preview</span>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface-glass backdrop-blur-md shadow-glass-inset border border-tone-teal-border text-brand-teal font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-surface-hover transition shadow-sm"
            >
              <Printer size={14} /> Print Certificate
            </button>
            <button
              disabled
              className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-white font-bold text-xs uppercase tracking-wider rounded-lg opacity-40 cursor-not-allowed"
              title="Official export is disabled for the prototype"
            >
              <Download size={14} /> Export PDF
            </button>
          </div>
        </div>

        <div className="w-full flex justify-center py-4 cert-print-wrapper">
          <div className="cert-container shadow-[0_30px_60px_-15px_rgba(0,65,66,0.6)] bg-geometric-arabesque p-10 md:p-14 relative flex items-center justify-center rounded-xl overflow-hidden">
            
            {/* watermark mock layer */}
            <div className="absolute inset-0 flex items-center justify-center rotate-[-15deg] select-none pointer-events-none opacity-5 z-20">
              <span className="text-5xl md:text-8xl font-black font-mono tracking-widest text-white">MOCK PREVIEW ONLY</span>
            </div>

            <div className="absolute select-none pointer-events-none z-30 opacity-40 border border-brand-orange bg-surface-glass backdrop-blur-md shadow-glass-inset px-3 py-1.5 text-center leading-none rounded shadow" style={{ left: "45%", top: "72%", transform: "translate(-50%, -50%) rotate(-10deg)" }}>
              <span className="text-[10px] font-bold text-brand-orange tracking-wider font-mono block">MOCK PREVIEW ONLY</span>
              <span className="text-[7px] font-mono text-secondary block mt-0.5 uppercase">Production issuance disabled</span>
            </div>

            {/* Outer White Matting Frame */}
            <div className="w-full h-full bg-[#FAF8F8] border-[3px] border-[#C74601]/50 p-2 md:p-3 shadow-2xl relative">
              
              {/* Layered Ornate Corner Accents */}
              {/* Top Left */}
              <div className="absolute top-3 left-3 md:top-4 md:left-4 w-8 h-8 md:w-12 md:h-12 border-t-[3px] border-l-[3px] border-[#004142]"></div>
              <div className="absolute top-5 left-5 md:top-6 md:left-6 w-5 h-5 md:w-8 md:h-8 border-t-[1px] border-l-[1px] border-[#E56E2E]"></div>
              
              {/* Top Right */}
              <div className="absolute top-3 right-3 md:top-4 md:right-4 w-8 h-8 md:w-12 md:h-12 border-t-[3px] border-r-[3px] border-[#004142]"></div>
              <div className="absolute top-5 right-5 md:top-6 md:right-6 w-5 h-5 md:w-8 md:h-8 border-t-[1px] border-r-[1px] border-[#E56E2E]"></div>

              {/* Bottom Left */}
              <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 w-8 h-8 md:w-12 md:h-12 border-b-[3px] border-l-[3px] border-[#004142]"></div>
              <div className="absolute bottom-5 left-5 md:bottom-6 md:left-6 w-5 h-5 md:w-8 md:h-8 border-b-[1px] border-l-[1px] border-[#E56E2E]"></div>

              {/* Bottom Right */}
              <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 w-8 h-8 md:w-12 md:h-12 border-b-[3px] border-r-[3px] border-[#004142]"></div>
              <div className="absolute bottom-5 right-5 md:bottom-6 md:right-6 w-5 h-5 md:w-8 md:h-8 border-b-[1px] border-r-[1px] border-[#E56E2E]"></div>

              {/* Inner Content Boundary */}
              <div className="w-full h-full border border-[#E9E5E3] flex flex-col items-center justify-between py-8 px-10 md:py-10 md:px-14 text-center relative z-10">
                
                {/* Header / Logo */}
                <img src={LOGO_DARK} alt="CareIndeed" className="h-8 md:h-10 opacity-90 object-contain" />

                {/* Core Certificate Copy */}
                <div className="flex-1 flex flex-col justify-center items-center w-full mt-2">
                  <h1 className="text-[#004142] font-serif text-4xl md:text-[3.5rem] leading-tight font-semibold tracking-wide">
                    Certificate of Completion
                  </h1>
                  
                  <p className="text-[#E56E2E] font-serif italic text-xl md:text-2xl mt-2 mb-4 md:mb-6">
                    This verifies that the requirements have been met by
                  </p>
                  
                  <h3 className="text-[#00797D] font-serif text-4xl md:text-5xl w-full max-w-2xl border-b-2 border-[#7A7470] pb-2 mb-4 md:mb-6 font-bold">
                    {recipientName}
                  </h3>
                  
                  {/* Context / Curriculum Integration */}
                  <div className="flex flex-col items-center w-full max-w-4xl">
                    <p className="text-[#7A7470] font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold mb-1">
                      For successfully completing the yearly
                    </p>
                    <h4 className="text-[#004142] font-serif text-2xl md:text-3xl font-bold uppercase tracking-widest mb-4">
                      ACHC Mandatory In-Services
                    </h4>

                    {/* ACHC Topics Matrix */}
                    <div className="w-full bg-[#F3F0EF]/50 border border-[#E9E5E3] p-4 md:p-5 rounded-sm">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-2 md:gap-y-3 text-left">
                        {achcTopics.map((topic, i) => (
                          <div key={i} className="flex items-start gap-2">
                             <span className="text-[#E56E2E] font-serif font-bold text-base md:text-lg leading-none mt-[-2px]">&bull;</span>
                             <span className="text-[#524D4B] font-sans text-[10px] md:text-[11px] uppercase tracking-wider font-semibold leading-tight">
                               {topic}
                             </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer / Signatures */}
                <div className="w-full flex justify-between items-end mt-4 md:mt-8 px-4 md:px-8">
                  
                  {/* Left Side Details */}
                  <div className="text-left font-sans text-[9px] md:text-[10px] text-[#7A7470] uppercase tracking-widest leading-loose mb-1">
                    <p className="border-b border-[#D9D6D5] pb-1 mb-2 w-48 md:w-56 flex justify-between">
                      <span className="font-bold text-[#004142]">Date Issued:</span> 
                      <span>{completionDate}</span>
                    </p>
                    <p className="border-b border-[#D9D6D5] pb-1 w-48 md:w-56 flex justify-between">
                      <span className="font-bold text-[#004142]">Certificate ID:</span> 
                      <span>ACHC-{new Date().getFullYear()}-001</span>
                    </p>
                    <p className="border-b border-[#D9D6D5] pb-1 w-48 md:w-56 flex justify-between">
                      <span className="font-bold text-[#004142]">CNA Cert #:</span> 
                      <span>{state.cnaNumber}</span>
                    </p>
                  </div>

                  {/* Right Side Signature */}
                  <div className="flex flex-col items-center">
                    <div className="h-12 md:h-14 relative w-48 md:w-64 flex justify-center items-end mb-1">
                      <img 
                        src={SIGNATURE_SRC} 
                        alt="Vanessa Valerio Signature" 
                        className="max-h-[140%] max-w-full object-contain z-10 -mb-2 clean-sig-dark"
                        onError={handleSigError}
                      />
                      {/* Fallback signature if image fails to load */}
                      <span className="hidden font-serif italic text-2xl md:text-3xl z-0 absolute bottom-1 text-[#004142]">
                        Vanessa Valerio
                      </span>
                    </div>
                    <div className="w-56 md:w-72 border-t-2 border-[#004142] pt-2 text-center">
                      <p className="font-serif font-bold text-base md:text-lg tracking-wide text-[#004142]">Vanessa Valerio</p>
                      <p className="text-[9px] md:text-[10px] font-sans font-bold tracking-[0.2em] uppercase mt-0.5 text-[#E56E2E]">Program Director</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <JourneyLearningShell
      title="Certificate Gate"
      subtitle="Verify your recertification credentials, accumulated learning hours, and pass requirements to unlock your formal ACHC certificate preview."
    >
      <div className="space-y-6">
        <ReviewerToolsPanel />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Required audit checklist */}
          <div className="w-full lg:w-[400px] shrink-0 space-y-6">
            <div className="bg-surface-glass border border-hairline rounded-xl p-5 shadow-rest backdrop-blur-xl">
              <h2 className="text-base font-bold text-brand-teal-deep mb-2 uppercase tracking-wider">
                {appCopy.certificate.checklist_title}
              </h2>
              <p className="text-xs text-secondary leading-relaxed mb-6">
                {appCopy.certificate.intro}
              </p>

              <div className="space-y-4">
                <GateRow done={legalReady} title="01. Legal Identity Verified" detail="Legal first/last name and CNA certificate number entered in Module 0." />
                <GateRow done={hoursMet} title="02. 12-Hour Study Time / Active-Time" detail={<>Active study time (demo threshold): <strong className="text-brand-orange font-mono font-semibold">{hoursMet ? "12h 00m (demo)" : formatHoursAndMins(demoSeconds)}</strong></>} />
                <GateRow done={competency} title="03. Competency Achieved" detail="Required ACHC Training Manual theory modules complete and final assessment passed." />

                {/* Affidavit check */}
                <div className={`p-4 rounded-lg border transition-colors ${affidavit ? "bg-tone-teal-bg/30 border-tone-teal-border text-brand-teal-deep" : "bg-tone-orange-bg/10 border-tone-orange-border/30 text-secondary"}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {affidavit ? <CheckCircle2 size={16} className="text-brand-teal" /> : <Circle size={16} className="text-muted" />}
                    </div>
                    <div className="w-full">
                      <span className="text-[11px] font-bold block uppercase font-mono">04. Professional Affidavit</span>
                      <p className="text-[10px] text-secondary mt-1 mb-3">{appCopy.certificate.affidavit_text}</p>
                      {coreReady ? (
                        <button
                          onClick={() => update("affidavitComplete", !affidavit)}
                          className={`w-full py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                            affidavit 
                              ? "bg-surface-glass backdrop-blur-md shadow-glass-inset border-hairline text-secondary hover:bg-surface-hover shadow-sm" 
                              : "bg-brand-orange border-brand-orange hover:bg-brand-orange/95 text-white shadow-pill-action"
                          }`}
                        >
                          {affidavit ? "Revoke Signature" : "Sign Draft Affidavit"}
                        </button>
                      ) : (
                        <span className="text-[9px] text-muted uppercase font-mono font-bold block py-1 border-t border-dashed border-hairline mt-1">Locked (Complete Steps 1–3 first)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Deeper compliance gate details */}
              <details className="mt-6 group border-t border-hairline pt-4">
                <summary className="cursor-pointer text-[10px] uppercase font-bold text-brand-teal font-mono tracking-wider hover:text-brand-teal-deep">
                  Full compliance details ({summary.passingCount}/{summary.totalCount} gates met)
                </summary>
                <div className="mt-3 space-y-1.5">
                  {summary.gates.map((g) => (
                    <div key={g.key} className="flex items-center justify-between gap-3 text-[10px] border-b border-hairline pb-1.5">
                      <span className="text-secondary font-medium">
                        {g.label}
                        {g.simulated ? <span className="text-brand-orange"> (simulated)</span> : null}
                        {!g.affectsCertificate ? <span className="text-muted"> · non-gating</span> : null}
                      </span>
                      <span className={`font-mono font-bold shrink-0 ${g.status === "complete" ? "text-brand-teal" : g.status === "blocked" ? "text-brand-orange" : "text-muted"}`}>
                        {statusLabel[g.status]}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            </div>

            {/* Appendix F — Pre-Employment Screening checklist + HR sign-off */}
            <div className="bg-surface-glass border border-hairline rounded-xl p-5 shadow-rest backdrop-blur-xl">
              <h2 className="text-base font-bold text-brand-teal-deep mb-2 uppercase tracking-wider">Appendix F · Pre-Employment Screening</h2>
              <p className="text-xs text-secondary leading-relaxed mb-4">Each item must be PASS or NA before the HR Director can sign off Appendix F.</p>
              <div className="space-y-2">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between gap-3 border-b border-hairline pb-2">
                    <span className="text-[11px] text-secondary font-medium">{it.id}. {it.label}</span>
                    <div className="flex gap-1 shrink-0">
                      {(['PASS', 'NA', 'FAIL'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => updateItem(it.id, st)}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border transition-colors ${
                            it.status === st
                              ? st === 'FAIL'
                                ? 'bg-tone-red-bg text-tone-red-text border-hairline'
                                : 'bg-brand-teal text-white border-brand-teal-deep'
                              : 'bg-white text-muted border-hairline hover:bg-surface-hover'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-hairline pt-4 space-y-3">
                <label className="block text-[10px] uppercase font-bold text-muted tracking-wider">HR Director sign-off</label>
                <input
                  type="text"
                  value={sigName}
                  onChange={(e) => setSigName(e.target.value)}
                  placeholder={employee.name}
                  className="w-full rounded-lg border border-hairline bg-white px-3 py-1.5 text-xs text-ink placeholder:text-muted"
                />
                <select
                  value={sigRole}
                  onChange={(e) => setSigRole(e.target.value as 'HRDirector' | 'Supervisor' | 'Other')}
                  aria-label="Appendix F sign-off role"
                  className="w-full rounded-lg border border-hairline bg-white px-3 py-1.5 text-xs text-ink"
                >
                  <option value="HRDirector">HR Director</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Other">Other</option>
                </select>
                <button
                  type="button"
                  onClick={handleSignAppendixF}
                  disabled={!allCleared}
                  className={`w-full py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                    allCleared
                      ? 'bg-brand-orange border-brand-orange text-white hover:bg-brand-orange/95 shadow-pill-action'
                      : 'bg-surface-hover border-hairline text-muted cursor-not-allowed'
                  }`}
                >
                  Sign Appendix F
                </button>
                {sigMessage && <p className="text-[10px] text-secondary">{sigMessage}</p>}
              </div>
            </div>
          </div>

          {/* Right: preview engine */}
          <div className="flex-1 space-y-6">
            <div className="bg-surface-glass border border-hairline rounded-xl p-6 relative overflow-hidden shadow-rest backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-hairline">
                <h3 className="font-bold text-brand-teal-deep text-xs uppercase tracking-wider">Preview Engine</h3>
                <span className="text-[10px] font-bold font-mono text-brand-orange bg-tone-orange-bg px-2 py-0.5 rounded border border-tone-orange-border">MOCK ONLY • PRODUCTION DISABLED</span>
              </div>

              {allReady ? (
                <div className="p-8 text-left space-y-6 bg-surface-glass backdrop-blur-md shadow-glass-inset border border-hairline rounded-xl shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-tone-teal-bg border border-tone-teal-border flex items-center justify-center mr-auto text-brand-teal shadow-sm">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-brand-teal-deep">Compliance Gates Cleared</h2>
                    <p className="text-xs text-secondary mt-2 max-w-md leading-relaxed">
                      {appCopy.certificate.ready_body}
                    </p>
                  </div>
                  <div className="pt-2 flex justify-start">
                    <button
                      onClick={() => setViewingCert(true)}
                      className="bg-brand-orange hover:bg-brand-orange/95 text-white font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-wider transition-all shadow-pill-action"
                    >
                      View Mock Certificate Preview
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-left space-y-6 bg-surface-glass backdrop-blur-md shadow-glass-inset border border-hairline rounded-xl shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-surface-glass backdrop-blur-md shadow-glass-inset border border-hairline flex items-center justify-center mr-auto text-muted">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-brand-teal-deep">Certificate Status Locked</h2>
                    <p className="text-xs text-secondary max-w-sm leading-relaxed mt-1">
                      {appCopy.certificate.locked_body}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 p-4 rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset/30 border border-hairline shadow-sm">
                <p className="text-xs text-secondary leading-relaxed">
                  <strong>Legal Restriction:</strong> {appCopy.certificate.restriction}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </JourneyLearningShell>
  );
}

export default AppendixFScreen;
