import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Printer, Download, Building2, User, Briefcase, HeartPulse, Info, CheckCircle2, Shield, ShieldCheck } from 'lucide-react';
import ciLogoGray from '@/assets/ci-logo-gray.png';
import { useShellStore } from '@/policy/stores/uiStore';
import {
  buildFormContent,
  type FormContent,
  type FormSection,
  type FormField,
} from '../data/formsLibraryContent';
import { FORMS_DATASET } from '../data/formsLibraryDataset';
import { printForm } from '../utils/printForm';
import { recordFormSubmission, harvestFormFields } from '@/policy/services/hhcFormEvidence';
import eCIgnLogo from '@/assets/eCIgn.png';
import { FormSignatureFlow } from './FormSignatureFlow';
import { eCIgnWorkspace as ECIgnWorkspace } from './FormSigningWorkspace';
import { PolicyLinkSelector } from './PolicyLinkSelector';
import {
  SignatureCtx,
  useSignatureCtx,
  type SignatureRecord,
  type SecondSigTask,
  type SignFlowState,
  type GeoInfo,
  type FieldEdit,
  DEMO_STAFF,
  signerNanoid,
  fmtSignTs,
} from './FormSignatureContext';
import {
  emitPolicyLinkAudit,
  resolvePolicyMetaList,
  validateAcknowledgmentLinks,
} from '@/policy/services/policyLinkService';
import { ecignApi } from '@/policy/ecign/api';
import { useEcignSignerIdentity } from '@/policy/ecign/signerIdentity';

// ─── FormCertificatePage ───────────────────────────────────────────
// CI-App Internal Attestation Certificate.
// Rendered below the form card on screen after signing.
// Includes geo/network data and document edit trail.

interface FormCertificatePageProps {
  certId:         string;   // lifted from FormViewer so workspace can share it
  formId:         string;
  formTitle:      string;
  formVersion:    string;
  formInstanceId: string;
  signatures:     Map<string, SignatureRecord>;
  secondSigTask:  SecondSigTask | null;
  policies:       string[];
  geoInfo:        GeoInfo;
  fieldEdits:     FieldEdit[];
}

function FormCertificatePage({
  certId, formId, formTitle, formVersion, formInstanceId,
  signatures, secondSigTask, policies, geoInfo, fieldEdits,
}: FormCertificatePageProps) {
  const certAt  = useMemo(() => new Date().toISOString(), []);
  const sigList = Array.from(signatures.values());
  if (sigList.length === 0) return null;

  // Phase 11 — resolve linked policies to their full meta for display.
  const linkedPolicyMeta = resolvePolicyMetaList(policies);

  const metaRows: [string, string][] = [
    ['Certificate ID',   certId],
    ['Form ID',          formId],
    ['Form Version',     `v${formVersion}`],
    ['Form Title',       formTitle],
    ['Form Instance ID', formInstanceId],
    ['System',           'CI-App'],
    ['Certified At',     fmtSignTs(certAt)],
  ];
  if (linkedPolicyMeta.length > 0) metaRows.push(['Linked Policies', `${linkedPolicyMeta.length} selected`]);
  if (secondSigTask)               metaRows.push(['Task ID',         secondSigTask.taskId]);

  const LabelCls = 'font-montserrat font-semibold text-[9px] uppercase tracking-[0.14em] text-[#747470] mb-0.5';
  const ValueCls = 'font-roboto text-[13px] text-[#1F1C1B] break-all';

  return (
    <div
      className="bg-white border border-[#E5E4E3] rounded-[12px] px-8 py-10 md:px-12 md:py-12 avoid-break"
      style={{ borderLeft: '4px solid #007970', breakBefore: 'page' }}
    >
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#E5FEFF', color: '#007970' }}>
            <Shield size={14} />
          </div>
          <span className="font-montserrat font-semibold text-[10px] tracking-[0.2em] uppercase text-[#007970]">CI-App · Internal Attestation</span>
        </div>
        <h2 className="font-montserrat font-bold text-[22px] text-[#1F1C1B] leading-tight">CI-App Internal Attestation Certificate</h2>
        <p className="font-roboto text-[13px] text-[#747470] mt-2 leading-relaxed">
          This certificate records completion, acknowledgment, and signature activity captured within the CI-App workflow system.
        </p>
      </div>

      {/* Certificate metadata */}
      <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-5 pb-8 border-b border-[#E5E4E3] mb-8">
        {metaRows.map(([label, value]) => (
          <div key={label} className="flex flex-col">
            <dt className={LabelCls}>{label}</dt>
            <dd className={ValueCls}>{value}</dd>
          </div>
        ))}
      </dl>

      {/* Phase 11 — Linked Policies / Procedures */}
      {linkedPolicyMeta.length > 0 && (
        <div className="mb-8 pb-8 border-b border-[#E5E4E3]">
          <h3 className="font-montserrat font-semibold text-[11px] uppercase tracking-[0.18em] text-[#1F1C1B] mb-4">
            Linked Policies / Procedures ({linkedPolicyMeta.length})
          </h3>
          <div className="overflow-x-auto rounded-lg border border-[#E5E4E3]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAFBF8] border-b border-[#E5E4E3]">
                  <th className="px-3 py-2 font-montserrat font-bold text-[9px] uppercase tracking-[0.1em] text-[#747470]">Policy ID</th>
                  <th className="px-3 py-2 font-montserrat font-bold text-[9px] uppercase tracking-[0.1em] text-[#747470]">Title</th>
                  <th className="px-3 py-2 font-montserrat font-bold text-[9px] uppercase tracking-[0.1em] text-[#747470]">Version</th>
                  <th className="px-3 py-2 font-montserrat font-bold text-[9px] uppercase tracking-[0.1em] text-[#747470]">Effective Date</th>
                </tr>
              </thead>
              <tbody>
                {linkedPolicyMeta.map(m => (
                  <tr key={m.id} className="border-b last:border-0 border-[#F0F0EE]">
                    <td className="px-3 py-2 font-mono text-[11px] text-[#1A3778] font-bold">{m.id}</td>
                    <td className="px-3 py-2 font-roboto text-[12px] text-[#1F1C1B]">{m.title}</td>
                    <td className="px-3 py-2 font-roboto text-[11px] text-[#747470]">{m.version}</td>
                    <td className="px-3 py-2 font-roboto text-[11px] text-[#747470]">{m.effectiveDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Signature records */}
      <div className="mb-8 pb-8 border-b border-[#E5E4E3]">
        <h3 className="font-montserrat font-semibold text-[11px] uppercase tracking-[0.18em] text-[#1F1C1B] mb-5">
          Signature Record{sigList.length > 1 ? 's' : ''}
        </h3>
        <div className="space-y-6">
          {sigList.map(sig => (
            <div key={sig.fieldId} className="flex flex-col sm:flex-row sm:items-start gap-6 pb-6 border-b border-[#E5E4E3] last:border-0 last:pb-0">
              <div className="shrink-0 border border-[#E5E4E3] rounded-lg p-3 bg-[#FAFBF8] w-[200px]">
                <img src={sig.signatureDataUrl} alt={`Signature of ${sig.signerName}`} className="w-full h-12 object-contain object-left" />
              </div>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-2 flex-1">
                {([['Signer', sig.signerName], ['Role', sig.signerRole], ['Email', sig.signerEmail], ['Signed At', fmtSignTs(sig.signedAt)]] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="flex flex-col">
                    <dt className={LabelCls}>{label}</dt>
                    <dd className="font-roboto text-[12px] text-[#1F1C1B]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>

      {/* Location & Network */}
      {!geoInfo.loading && !geoInfo.error && geoInfo.ip && (
        <div className="mb-8 pb-8 border-b border-[#E5E4E3]">
          <h3 className="font-montserrat font-semibold text-[11px] uppercase tracking-[0.18em] text-[#1F1C1B] mb-4">Location &amp; Network</h3>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
            {([
              ['IP Address',     geoInfo.ip],
              ['City',          geoInfo.city],
              ['State / Region', geoInfo.region],
              ['Country',       geoInfo.country],
              ['ZIP / Postal',  geoInfo.postal],
              ...(geoInfo.org ? [['Network Org', geoInfo.org]] as [string, string][] : []),
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="flex flex-col">
                <dt className={LabelCls}>{label}</dt>
                <dd
                  className="font-roboto font-mono text-[11px] text-[#1F1C1B]"
                  style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
                >
                  {value || '—'}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Second signature task */}
      {secondSigTask && (
        <div className="mb-8 pb-8 border-b border-[#E5E4E3]">
          <h3 className="font-montserrat font-semibold text-[11px] uppercase tracking-[0.18em] text-[#1F1C1B] mb-3">Second Signature Request</h3>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3">
            {([
              ['Task ID',     secondSigTask.taskId],
              ['Assigned To', DEMO_STAFF.find(u => u.id === secondSigTask.assignedTo)?.name ?? secondSigTask.assignedTo],
              ['Assigned By', DEMO_STAFF.find(u => u.id === secondSigTask.assignedBy)?.name ?? secondSigTask.assignedBy],
              ['Status',      secondSigTask.status],
              ['Created At',  fmtSignTs(secondSigTask.createdAt)],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="flex flex-col">
                <dt className={LabelCls}>{label}</dt>
                <dd className="font-roboto text-[12px] text-[#1F1C1B]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Document edit trail */}
      {fieldEdits.length > 0 && (
        <div className="mb-8 pb-8 border-b border-[#E5E4E3]">
          <h3 className="font-montserrat font-semibold text-[11px] uppercase tracking-[0.18em] text-[#1F1C1B] mb-3">
            Document Edit Trail ({fieldEdits.length} change{fieldEdits.length !== 1 ? 's' : ''})
          </h3>
          <div className="overflow-x-auto rounded-[8px] border border-[#E5E4E3]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAFBF8] border-b border-[#E5E4E3]">
                  {['#', 'Field', 'Previous Value', 'New Value', 'Changed At', 'Changed By'].map(h => (
                    <th key={h} className="px-3 py-2 font-montserrat font-semibold text-[9px] uppercase tracking-[0.1em] text-[#747470]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fieldEdits.map(e => (
                  <tr key={e.seq} className="border-b border-[#F0F0EE] last:border-0 hover:bg-[#FAFBF8]">
                    <td className="px-3 py-2 font-mono text-[10px] text-[#747470]">{e.seq}</td>
                    <td className="px-3 py-2 font-roboto text-[11px] text-[#1F1C1B]">{e.fieldLabel}</td>
                    <td className="px-3 py-2 font-roboto text-[11px] text-[#747470]">{e.oldValue || '—'}</td>
                    <td className="px-3 py-2 font-roboto text-[11px] text-[#1F1C1B]">{e.newValue || '—'}</td>
                    <td className="px-3 py-2 font-roboto text-[10px] text-[#747470]">{fmtSignTs(e.changedAt)}</td>
                    <td className="px-3 py-2 font-roboto text-[11px] text-[#747470]">{e.changedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* eCIgn print stamp — fixed footer visible only @media print */}
      {sigList.length > 0 && (() => {
        const sig = sigList[0];
        return (
          <div
            className="ecign-print-stamp hidden print:flex fixed bottom-0 left-0 right-0 items-center gap-3 px-5"
            style={{
              height:      '36px',
              background:  'white',
              borderTop:   '2px solid #F04B22',
              fontSize:    '9px',
              color:       '#1A3778',
              zIndex:      9999,
            }}
          >
            <img src={eCIgnLogo} alt="eCIgn" style={{ height: 18, objectFit: 'contain' }} />
            <span style={{ color: '#F04B22' }}>·</span>
            <span className="font-mono text-[9px]">{certId}</span>
            <span style={{ color: '#F04B22' }}>·</span>
            <span>{sig.signerName}</span>
            <span style={{ color: '#F04B22' }}>·</span>
            <span>{fmtSignTs(sig.signedAt)}</span>
          </div>
        );
      })()}
    </div>
  );
}

function DocumentAuditStamp({
  certId,
  signerName,
  signedAt,
}: {
  certId: string;
  signerName: string;
  signedAt: string;
}) {
  return (
    <div
      className="mt-6 rounded-[10px] border bg-white px-4 py-3 flex flex-wrap items-center gap-3 print:hidden"
      style={{ borderColor: '#E5E4E3', borderLeft: '4px solid #F04B22' }}
    >
      <img src={eCIgnLogo} alt="eCIgn" className="h-6 w-auto object-contain" />
      <span style={{ color: '#F04B22' }}>·</span>
      <span className="font-mono text-[10px]" style={{ color: '#1A3778' }}>{certId}</span>
      <span style={{ color: '#F04B22' }}>·</span>
      <span className="font-roboto text-[11px]" style={{ color: '#1A3778' }}>{signerName}</span>
      <span style={{ color: '#F04B22' }}>·</span>
      <span className="font-roboto text-[11px]" style={{ color: '#1A3778' }}>{fmtSignTs(signedAt)}</span>
    </div>
  );
}

// ─── Org Chart Components (GV-FM-003 Section 2) ───────────────────

function TreeRow({ children }: { children: React.ReactNode }) {
  const count = React.Children.count(children);
  return (
    <div className="flex flex-row justify-center items-start w-full">
      {React.Children.map(children, (child, index) => {
        const isFirst = index === 0;
        const isLast = index === count - 1;
        const isOnly = count === 1;
        return (
          <div className="relative flex flex-col items-center px-1 sm:px-2">
            {!isOnly && (
              <>
                <div className={`absolute top-0 h-6 w-1/2 left-0 ${!isFirst ? 'border-t-2 border-[#E5E4E3]' : ''}`} />
                <div className={`absolute top-0 h-6 w-1/2 right-0 ${!isLast ? 'border-t-2 border-[#E5E4E3]' : ''}`} />
              </>
            )}
            <div className="absolute top-0 w-[2px] h-6 bg-[#E5E4E3]" />
            <div className="mt-6 z-10 w-full flex justify-center">{child}</div>
          </div>
        );
      })}
    </div>
  );
}

function TreeNode({ card, children }: { card: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      <div className="z-10">{card}</div>
      {children && (
        <>
          <div className="w-[2px] h-6 bg-[#E5E4E3]" />
          <TreeRow>{children}</TreeRow>
        </>
      )}
    </div>
  );
}

const GoverningBodyCard = () => (
  <div className="bg-[#007970] rounded-[16px] p-4 w-48 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-lg border border-[#004142]/20">
    <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
    <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-black/10 rounded-full blur-2xl" />
    <Building2 size={22} className="text-[#E5FEFF] mb-2 opacity-90" />
    <h2 className="text-white font-montserrat font-bold text-[13px] tracking-[0.12em] mb-3 leading-tight">GOVERNING BODY</h2>
    <div className="bg-[#E5FEFF] text-[#007970] rounded-full px-3 py-1 text-[9px] font-montserrat font-bold tracking-wide uppercase shadow-sm leading-tight">
      Ultimate Legal Authority
    </div>
  </div>
);

const AdministratorCard = () => (
  <div className="bg-[#C74601] rounded-[16px] p-4 w-44 text-center shadow-md relative overflow-hidden border border-[#421700]/10">
    <div className="absolute top-0 right-0 p-6 bg-white/5 rounded-bl-full" />
    <div className="flex justify-center mb-2">
      <div className="bg-white/20 p-1.5 rounded-full text-white"><User size={15} /></div>
    </div>
    <h3 className="text-white font-montserrat font-bold text-[12px] tracking-widest mb-3 leading-tight">ADMINISTRATOR</h3>
    <input type="text" placeholder="Enter Name..." className="w-full text-center border-b-2 border-[#FFD5BF]/50 pb-1 text-white focus:outline-none focus:border-white transition-colors bg-transparent placeholder-white/70 font-roboto font-medium text-[11px]" />
  </div>
);

const ComplianceOfficerCard = () => (
  <div className="bg-white rounded-[16px] p-4 w-44 text-center shadow-sm border border-[#E5E4E3] flex flex-col">
    <div className="flex justify-center mb-2">
      <div className="bg-[#FAFBF8] border border-[#E5E4E3] p-1.5 rounded-full text-[#524D4B]"><Briefcase size={15} /></div>
    </div>
    <h3 className="font-montserrat font-bold text-[#1F1C1B] text-[11px] tracking-widest mb-3 leading-tight">COMPLIANCE OFFICER</h3>
    <input type="text" placeholder="Enter Name..." className="mt-auto w-full text-center border-b-2 border-[#E5E4E3] pb-1 text-[#1F1C1B] focus:outline-none focus:border-[#C74601] transition-colors bg-transparent placeholder-[#747470] font-roboto text-[11px]" />
  </div>
);

const ClinicalManagerCard = () => (
  <div className="bg-white rounded-[12px] p-3 w-40 text-center border border-[#E5E4E3] flex flex-col">
    <h4 className="font-montserrat font-bold text-[#007970] text-[11px] tracking-wide mb-3 leading-tight">CLINICAL MANAGER</h4>
    <input type="text" placeholder="Enter Name..." className="w-full text-center border-b-2 border-[#E5E4E3] pb-1 text-[#1F1C1B] focus:outline-none focus:border-[#007970] transition-colors bg-transparent placeholder-[#747470] mb-3 font-roboto text-[11px]" />
    <div className="mt-auto bg-[#FAFBF8] border border-[#E5E4E3] rounded-md py-1.5 px-2 text-[9px] font-medium tracking-wide text-[#524D4B] font-roboto leading-tight">
      RN, PT, OT, ST, MSW, CHHA
    </div>
  </div>
);

const MedicalDirectorCard = () => (
  <div className="bg-white rounded-[12px] p-3 w-40 text-center border border-[#E5E4E3] flex flex-col">
    <div className="bg-[#004142] text-white rounded-md py-1.5 px-2 mb-3 mx-auto shadow-sm flex items-center gap-1.5">
      <HeartPulse size={11} />
      <h4 className="font-montserrat font-bold text-[9px] tracking-widest uppercase">MEDICAL DIRECTOR</h4>
    </div>
    <input type="text" placeholder="Enter Name..." className="w-full mt-auto text-center border-b-2 border-[#E5E4E3] pb-1 text-[#1F1C1B] focus:outline-none focus:border-[#004142] transition-colors bg-transparent placeholder-[#747470] text-[11px] font-roboto" />
  </div>
);

const BusinessOpsCard = () => (
  <div className="bg-white rounded-[12px] p-3 w-40 text-center border border-[#E5E4E3] flex flex-col">
    <div className="bg-[#1F1C1B] text-white rounded-md py-1.5 px-2 mb-3 mx-auto shadow-sm">
      <h4 className="font-montserrat font-bold text-[9px] tracking-widest uppercase">BUSINESS OPS</h4>
    </div>
    <input type="text" placeholder="Enter Name..." className="w-full text-center border-b-2 border-[#E5E4E3] pb-1 text-[#1F1C1B] focus:outline-none focus:border-[#1F1C1B] transition-colors bg-transparent placeholder-[#747470] mb-3 text-[11px] font-roboto" />
    <div className="mt-auto bg-[#FAFBF8] border border-[#E5E4E3] rounded-md py-1.5 px-2 text-[9px] font-medium tracking-wide text-[#524D4B] font-roboto leading-tight">
      HR, Finance, Intake, Scheduling
    </div>
  </div>
);

function OrgChartSection({ sectionTitle }: { sectionTitle: string }) {
  return (
    <section className="mb-12 avoid-break">
      <h3 className="font-montserrat font-semibold text-[13px] text-[#1F1C1B] tracking-[0.22em] uppercase mb-6 flex items-center gap-4">
        <span className="shrink-0">{sectionTitle}</span>
        <span className="flex-grow h-px bg-[#007970]" />
      </h3>

      {/* Info callout */}
      <div className="bg-white border border-[#E5E4E3] rounded-[16px] p-5 mb-8 flex items-start gap-4 shadow-sm">
        <div className="bg-[#E5FEFF] p-2.5 rounded-full text-[#007970] shrink-0 mt-0.5">
          <Info size={18} strokeWidth={2.5} />
        </div>
        <p className="text-[#524D4B] leading-relaxed text-[14px] font-roboto">
          <strong className="font-montserrat font-bold text-[#1F1C1B] tracking-wide mr-1">Agency Organizational Structure:</strong>
          This chart illustrates the reporting relationships and accountability framework from the Governing Body through senior administrative and clinical leadership, as required by 42 CFR § 484.105.
        </p>
      </div>

      {/* Org chart tree — responsive, fits within Letter portrait (6.5in) */}
      <div className="w-full pb-6 avoid-break">
        <div className="flex justify-center pt-4">
          <TreeNode card={<GoverningBodyCard />}>
            <TreeNode card={<ComplianceOfficerCard />} />
            <TreeNode card={<AdministratorCard />}>
              <TreeNode card={<ClinicalManagerCard />} />
              <TreeNode card={<MedicalDirectorCard />} />
              <TreeNode card={<BusinessOpsCard />} />
            </TreeNode>
          </TreeNode>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FormViewer — Care Indeed Enterprise Forms Library
   Visual spec: Builder/Policies/FormsViewerLightDesign.html
   ═══════════════════════════════════════════════════════════════════ */

// ─── Brand tokens (light-mode) ────────────────────────────────────
const CI_TEAL   = '#007970';
const CI_ORANGE = '#C74601';
const CI_INK    = '#1F1C1B';
const CI_MUTED  = '#747470';

// ─── Shared CSS class tokens ──────────────────────────────────────
// Every label and input references these so all elements share one
// left edge and one visual rhythm (matches FormsViewerLightDesign.html).

/** Small all-caps label above every field */
const LABEL_CLS =
  'font-montserrat font-semibold text-[11px] text-[#52404B] mb-2 ' +
  'uppercase tracking-[0.12em] leading-tight block';

/** Full-border box input — regular field sections */
const INPUT_CLS =
  'w-full h-11 border border-[#E5E4E3] rounded-[8px] px-3 bg-white ' +
  'font-roboto text-[14px] text-[#1F1C1B] ' +
  'focus:border-[#007970] focus:ring-1 focus:ring-[#007970] ' +
  'outline-none transition-all';

/** Underline-only input — signature rows, Printed Name column */
const SIG_INPUT_CLS =
  'w-full h-8 border-b border-[#C8C6C5] px-0 bg-transparent ' +
  'font-roboto text-[14px] text-[#1F1C1B] ' +
  'focus:border-[#007970] outline-none transition-all';

/** Dashed underline — signature rows, Signature column */
const SIG_DASHED_CLS =
  'w-full h-8 border-b border-dashed border-[#C8C6C5] px-0 bg-transparent ' +
  'font-roboto text-[14px] text-[#1F1C1B] ' +
  'focus:border-[#007970] outline-none transition-all';

// ─── Field ────────────────────────────────────────────────────────
// sig=true  → signature-row mode:
//   • label gets min-h-[2.6em] so all 3 columns always have the same
//     label zone height → input underlines land on one baseline
//   • uses SIG_INPUT_CLS / SIG_DASHED_CLS instead of INPUT_CLS
//
// autoFills context map: when the user confirms a signature, the
// parent sets values for adjacent Printed Name / Date fieldIds so
// they auto-populate without requiring controlled inputs throughout.
function Field({ f, sig = false, fieldId }: { f: FormField; sig?: boolean; fieldId?: string }) {
  const { enabled, signatures, requestSign, autoFills } = useSignatureCtx();

  // Auto-fill support: when a signature is confirmed, adjacent fields
  // (Printed Name, Date) receive values via the autoFills context map.
  const autoFillValue = fieldId ? (autoFills.get(fieldId) ?? undefined) : undefined;
  const textInputRef  = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const el = textInputRef.current;
    if (!el || autoFillValue === undefined) return;
    // Use native setter so React-uncontrolled inputs reflect the value
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setter?.call(el, autoFillValue);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, [autoFillValue]);

  const colSpan =
    { 1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4' }[
      f.col ?? 2
    ];

  const labelCls = LABEL_CLS + (sig ? ' min-h-[2.6em]' : '');
  const inputCls = sig ? SIG_INPUT_CLS : INPUT_CLS;

  const renderSignatureField = () => {
    if (!enabled) return <div className={SIG_DASHED_CLS} />;
    const fId    = fieldId ?? 'sig-unknown';
    const sigRec = signatures.get(fId);
    if (sigRec) {
      return (
        <div className="h-8 flex items-center gap-3">
          <img
            src={sigRec.signatureDataUrl}
            alt={`Signature of ${sigRec.signerName}`}
            className="h-7 max-w-[200px] object-contain object-left"
          />
          <span className="font-roboto text-[10px] text-[#747470]">{fmtSignTs(sigRec.signedAt)}</span>
          <CheckCircle2 size={13} className="text-[#007970] shrink-0" />
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={() => requestSign(fId)}
        className="h-14 w-full flex items-center justify-center px-3 rounded-md transition-colors"
        style={{
          border:     '1px dashed #007970',
          background: 'transparent',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#F0FFFE')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <img src={eCIgnLogo} alt="Sign with eCign" className="h-10 w-auto object-contain pointer-events-none" />
      </button>
    );
  };

  return (
    <div className={`${colSpan} flex flex-col`}>
      <label className={labelCls}>
        {f.label}
        {f.required && <span className="text-[#C74601] ml-1">*</span>}
      </label>

      {f.type === 'textarea' ? (
        <textarea
          rows={3}
          placeholder={f.placeholder}
          data-field-id={fieldId}
          className={
            INPUT_CLS +
            ' h-auto min-h-[70px] resize-y pt-2 leading-relaxed'
          }
        />
      ) : f.type === 'select' ? (
        <select className={INPUT_CLS} data-field-id={fieldId}>
          <option value="">— Select —</option>
          {f.options?.map(o => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : f.type === 'checkbox' ? (
        <input
          type="checkbox"
          data-field-id={fieldId}
          className="w-5 h-5 accent-[#007970] mt-1"
        />
      ) : f.type === 'radio' ? (
        <div className="flex gap-4 flex-wrap mt-1">
          {f.options?.map(o => (
            <label key={o} className="flex items-center gap-2 text-[12px]">
              <input
                type="radio"
                name={f.label}
                data-field-id={fieldId}
                className="w-4 h-4 accent-[#007970]"
              />{' '}
              {o}
            </label>
          ))}
        </div>
      ) : f.type === 'signature' ? (
        renderSignatureField()
      ) : (
        <input
          ref={textInputRef}
          type={f.type}
          placeholder={f.placeholder}
          data-field-id={fieldId}
          className={inputCls}
        />
      )}

      {f.help && (
        <p className="font-roboto text-[10px] text-[#747470] italic mt-1">
          {f.help}
        </p>
      )}
    </div>
  );
}

// ─── Section renderer ─────────────────────────────────────────────
function SectionRenderer({ s, idx }: { s: FormSection; idx: number }) {
  return (
    <section className="mb-12 avoid-break">
      {/* Section header — title + teal flex-grow rule (design spec) */}
      <h3
        className="font-montserrat font-semibold text-[13px] text-[#1F1C1B]
                   tracking-[0.22em] uppercase mb-4 flex items-center gap-4"
      >
        <span className="shrink-0">{s.title || `Section ${idx + 1}`}</span>
        <span className="flex-grow h-px bg-[#007970]" />
      </h3>

      {s.description && (
        <p className="font-roboto text-[12px] text-[#52404B] mb-4 leading-relaxed">
          {s.description}
        </p>
      )}

      {/* ── grid layout (identification-style fields) ── */}
      {s.layout === 'grid' && s.fields && (
        <div className="grid grid-cols-4 gap-x-8 gap-y-5">
          {s.fields.map((f, i) => (
            <Field key={i} f={f} fieldId={`${idx}-grid-${i}`} />
          ))}
        </div>
      )}

      {/* ── table layout ── */}
      {s.layout === 'table' && s.columns && (
        <div className="overflow-x-auto rounded-[8px] border border-[#E5E4E3]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFBF8] border-b border-[#E5E4E3]">
                {s.columns.map(c => (
                  <th
                    key={c}
                    className="py-3 px-3 font-montserrat font-semibold text-[10px]
                               text-[#52404B] uppercase tracking-[0.12em] whitespace-nowrap"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: s.rowCount ?? 12 }).map((_, r) => (
                <tr
                  key={r}
                  className="border-b border-[#E5E4E3] last:border-0 hover:bg-[#F7FEFF] transition-colors"
                >
                  {s.columns!.map((_, c) => (
                    <td key={c} className="py-3 px-3 h-11 border-b border-[#E5E4E3] last:border-b-0">
                      <input
                        className="w-full bg-transparent font-roboto text-[13px]
                                   text-[#1F1C1B] focus:outline-none"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── checklist layout ── */}
      {s.layout === 'checklist' && s.items && (
        <ul className="space-y-2">
          {s.items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 p-2 border-b border-[#E5E4E3]"
            >
              <input
                type="checkbox"
                className="w-5 h-5 mt-0.5 accent-[#007970] shrink-0"
              />
              <div className="flex-1">
                <span className="font-roboto text-[12px] text-[#1F1C1B] leading-relaxed">
                  {item}
                </span>
                <div className="grid grid-cols-3 gap-3 mt-1.5">
                  <input
                    placeholder="Date completed"
                    className="font-roboto text-[10px] border-b border-[#E5E4E3]
                               bg-transparent focus:outline-none focus:border-[#007970]"
                  />
                  <input
                    placeholder="Initials"
                    className="font-roboto text-[10px] border-b border-[#E5E4E3]
                               bg-transparent focus:outline-none focus:border-[#007970]"
                  />
                  <input
                    placeholder="Notes"
                    className="font-roboto text-[10px] border-b border-[#E5E4E3]
                               bg-transparent focus:outline-none focus:border-[#007970]"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ── attestation layout ── */}
      {s.layout === 'attestation' && (
        <div>
          {s.body && (
            <p className="font-roboto text-[12px] text-[#1F1C1B] mb-4 leading-relaxed font-medium">
              {s.body}
            </p>
          )}
          {s.acknowledgments && (
            <ol className="list-decimal list-outside ml-6 space-y-3 font-roboto text-[12px] text-[#1F1C1B]">
              {s.acknowledgments.map((a, i) => (
                <li key={i} className="leading-relaxed pl-2">
                  {a}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* ── signature layout ──────────────────────────────────────────
          items-end + min-h-[2.6em] labels: every input underline in the
          row lands on the same baseline even when labels wrap differently. */}
      {s.layout === 'signature' && s.fields && (
        <div className="grid grid-cols-4 gap-x-8 gap-y-8 pt-4 border-t border-[#E5E4E3] items-end">
          {s.fields.map((f, i) => (
            <Field key={i} f={f} sig fieldId={`${idx}-sig-${i}`} />
          ))}
        </div>
      )}

      {/* ── narrative (free text) layout ── */}
      {s.layout === 'narrative' && (
        <textarea
          rows={8}
          className={
            INPUT_CLS +
            ' h-auto min-h-[180px] resize-y pt-3 leading-relaxed'
          }
        />
      )}

      {/* ── matrix layout ── */}
      {s.layout === 'matrix' && s.matrixRows && s.matrixCols && (
        <div className="overflow-x-auto rounded-[8px] border border-[#E5E4E3]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFBF8] border-b border-[#E5E4E3]">
                <th
                  className="py-3 px-3 font-montserrat font-semibold text-[10px]
                             text-[#52404B] uppercase tracking-[0.12em]"
                >
                  Item
                </th>
                {s.matrixCols.map(c => (
                  <th
                    key={c}
                    className="py-3 px-3 font-montserrat font-semibold text-[10px]
                               text-[#52404B] uppercase tracking-[0.12em]"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.matrixRows.map((row, r) => (
                <tr
                  key={r}
                  className="border-b border-[#E5E4E3] last:border-0 hover:bg-[#F7FEFF] transition-colors"
                >
                  <td className="px-3 py-2 font-roboto text-[12px] font-medium text-[#1F1C1B]">
                    {row}
                  </td>
                  {s.matrixCols!.map((_, c) => (
                    <td key={c} className="border-b border-[#E5E4E3] last:border-0 p-1.5">
                      <input
                        className="w-full bg-transparent font-roboto text-[12px] focus:outline-none"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ─── Shared form body (used in both standalone + embedded modes) ──
export function FormBody({ content, isEmbedded = false }: { content: FormContent; isEmbedded?: boolean }) {
  return (
    <>
      {/* ── HEADER, RULE, TITLE, METADATA, PURPOSE, INSTRUCTIONS ──
           Shown in standalone mode only. Embedded mode renders just
           the content sections so the host panel controls the chrome. */}
      {!isEmbedded && (
        <>
          {/* ── HEADER: logo left, library info right ── */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <img
              src={ciLogoGray}
              alt="Care Indeed — The Heart of Home Health"
              className="h-12 w-auto select-none"
              draggable={false}
            />
            <div className="flex flex-col sm:items-end">
              <span
                className="font-montserrat font-semibold text-[10px] tracking-[0.2em] uppercase"
                style={{ color: CI_MUTED }}
              >
                Enterprise Forms Library
              </span>
              <span className="font-roboto font-medium text-[13px] mt-0.5" style={{ color: CI_INK }}>
                {content.id} · v{content.version}
              </span>
            </div>
          </header>

          {/* Solid teal rule */}
          <div className="h-px w-full mb-10" style={{ background: CI_TEAL }} />

          {/* ── TITLE & METADATA ── */}
          <section className="mb-10">
            <h1
              className="font-montserrat font-semibold leading-tight mb-1"
              style={{ fontSize: 'clamp(22px, 4vw, 32px)', color: CI_INK }}
            >
              {content.title}
            </h1>
            <p
              className="font-montserrat font-medium text-[11px] tracking-[0.22em] uppercase mb-8"
              style={{ color: CI_TEAL }}
            >
              {content.type} · Form {content.id}
            </p>

            <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-5 mb-6">
              {[
                ['Form ID', content.id],
                ['Version', `v${content.version}`],
                ['Effective', content.effectiveDate],
                ['Next Review', content.revisionDate],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col">
                  <dt
                    className="font-montserrat font-semibold text-[10px] tracking-[0.16em] uppercase mb-1"
                    style={{ color: CI_MUTED }}
                  >
                    {k}
                  </dt>
                  <dd className="font-roboto text-[14px]" style={{ color: CI_INK }}>{v}</dd>
                </div>
              ))}
            </dl>

          </section>

          {/* ── PURPOSE callout ── */}
          <div
            className="rounded-r-[8px] px-5 py-4 mb-4 avoid-break"
            style={{ background: '#F7FEFF', borderLeft: `4px solid ${CI_TEAL}` }}
          >
            <h3
              className="font-montserrat font-bold text-[11px] tracking-[0.22em] uppercase mb-2"
              style={{ color: CI_TEAL }}
            >
              Purpose
            </h3>
            <p className="font-roboto text-[13.5px] leading-relaxed" style={{ color: CI_INK }}>
              {content.purpose}
            </p>
          </div>

          {/* ── INSTRUCTIONS callout ── */}
          <div
            className="rounded-r-[8px] px-5 py-4 mb-12 avoid-break"
            style={{ background: '#FFFAF7', borderLeft: `4px solid ${CI_ORANGE}` }}
          >
            <h3
              className="font-montserrat font-bold text-[11px] tracking-[0.22em] uppercase mb-2"
              style={{ color: CI_ORANGE }}
            >
              Instructions
            </h3>
            <p className="font-roboto text-[13.5px] leading-relaxed" style={{ color: CI_INK }}>
              {content.instructions}
            </p>
          </div>
        </>
      )}

      {/* ── CONTENT SECTIONS ── */}
      {content.sections.map((s, i) => {
        if (content.id === 'GV-FM-003' && i === 1) {
          return <OrgChartSection key={i} sectionTitle={s.title || 'Section 2 — Organizational Chart'} />;
        }
        return <SectionRenderer key={i} s={s} idx={i} />;
      })}

      {/* ── FOOTER — standalone only ── */}
      {!isEmbedded && (
        <footer className="mt-10 pt-5 border-t border-[#E5E4E3]">
          <div
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 font-roboto text-[10px]"
            style={{ color: CI_MUTED }}
          >
            <div className="flex flex-col gap-1">
              {content.footerNotes?.map((n, i) => <p key={i}>{n}</p>)}
            </div>
            <p className="font-roboto font-mono" style={{ color: CI_MUTED }}>
              {content.id} · v{content.version}
            </p>
          </div>
        </footer>
      )}
    </>
  );
}

// ─── Main view ────────────────────────────────────────────────────
export interface FormViewerProps {
  formId?:               string;
  enableEmbeddedSigning?: boolean;
  /** Phase 11 — origin context for the Linked Policy / Procedure auto-link rule. */
  formSource?:           'policy_viewer' | 'task' | 'forms_library' | 'workflow';
  /** Phase 11 — parent task ID, when opened from a Task/Obligation. */
  parentTaskId?:         string;
  /** HHC Phase 1 — regulatory/calendar event_id to bind eSign evidence to. */
  hhcEventId?:           string;
  /** HHC Phase 1 — workflow_id context for eSign evidence. */
  hhcWorkflowId?:        string;
}

export function FormViewer({ formId, enableEmbeddedSigning = false, formSource, parentTaskId, hhcEventId, hhcWorkflowId }: FormViewerProps) {
  const { formId: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const signer = useEcignSignerIdentity();
  // If formId prop is supplied → embedded inside a parent panel (no shell)
  const isEmbedded = formId !== undefined;
  const signatureEnabled = !isEmbedded || enableEmbeddedSigning;
  // Phase 11 — derive source default: embedded => Policy Viewer, otherwise Forms Library.
  const effectiveSource: 'policy_viewer' | 'task' | 'forms_library' | 'workflow' =
    formSource ?? (isEmbedded ? 'policy_viewer' : 'forms_library');
  const id = formId ?? routeId;
  const queryInstanceId = searchParams.get('instance') ?? undefined;
  const queryEventId = searchParams.get('event') ?? undefined;
  const queryWorkflowId = searchParams.get('workflow') ?? undefined;
  const setDetailMode = useShellStore(s => s.setDetailMode);

  useEffect(() => {
    const prev = document.title;
    document.title = 'Care Indeed Home Health Care, Inc. - Policies and Procedures';
    setDetailMode(true);
    return () => {
      document.title = prev;
      setDetailMode(false);
    };
  }, [setDetailMode]);

  const content: FormContent | null = useMemo(() => {
    if (!id) return null;
    const rec = FORMS_DATASET.find(f => f.id === id);
    if (!rec) return null;
    return buildFormContent(rec);
  }, [id]);

  // ── Signature state (standalone mode only) ────────────────────────
  // All hooks must be called before any early returns.
  const [formInstanceId]  = useState(() => queryInstanceId ?? `fi_${signerNanoid(12)}`);
  const [certId]          = useState(() => `CERT-${id ?? 'fm'}-${signerNanoid(8)}`);
  const [signatures,      setSignatures]    = useState<Map<string, SignatureRecord>>(new Map());
  const [activeFieldId,   setActiveFieldId] = useState<string | null>(null);
  const [flowState,       setFlowState]     = useState<SignFlowState>('unsigned');
  const [secondSigTask,   setSecondSigTask] = useState<SecondSigTask | null>(null);
  const [autoFills,       setAutoFills]     = useState<Map<string, string>>(new Map());
  const [enfmLinkedPolicyIds, setEnfmLinkedPolicyIds] = useState<string[]>([]);
  const [enfmPolicyError, setEnfmPolicyError] = useState<string | null>(null);

  // ── HHC compliance form-submission state ─────────────────────
  const formRootRef = useRef<HTMLDivElement | null>(null);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [submitMsg,  setSubmitMsg]  = useState<string | null>(null);
  const [submitErr,  setSubmitErr]  = useState<string | null>(null);
  const hasSigned = signatures.size > 0;
  const isEnfm001Standalone = !isEmbedded && id === 'EN-FM-001';
  const enfmPolicyValidation = useMemo(
    () => validateAcknowledgmentLinks(enfmLinkedPolicyIds),
    [enfmLinkedPolicyIds],
  );

  useEffect(() => {
    if (id !== 'EN-FM-001') {
      setEnfmLinkedPolicyIds([]);
      setEnfmPolicyError(null);
    }
  }, [id]);

  // ── IP / Geolocation (fetched on form open) ───────────────────────
  const [geoInfo, setGeoInfo] = useState<GeoInfo>({
    ip: '', city: '', region: '', country: '', postal: '', loading: true,
  });
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const networkInfo = await ecignApi.getNetworkInfo();

        if (cancelled) return;
        if (import.meta.env.DEV) {
          console.info('[ecign.network] network_info_received', {
            ip: networkInfo.ip,
            lookupStatus: networkInfo.lookupStatus,
            city: networkInfo.city,
            region: networkInfo.region,
            country: networkInfo.country,
            postal: networkInfo.postal,
            org: networkInfo.org,
            reason: networkInfo.failureReason,
          });
        }
        setGeoInfo({
          ip: networkInfo.ip || 'Unavailable',
          city: networkInfo.city || 'Unavailable',
          region: networkInfo.region || 'Unavailable',
          country: networkInfo.country || 'Unavailable',
          postal: networkInfo.postal || 'Unavailable',
          org: networkInfo.org || 'Unavailable',
          loading: false,
        });
      } catch (error) {
        if (cancelled) return;
        if (import.meta.env.DEV) {
          console.warn('[ecign.network] network_info_request_failed', error);
        }
        setGeoInfo({
          ip: 'Unavailable',
          city: 'Unavailable',
          region: 'Unavailable',
          country: 'Unavailable',
          postal: 'Unavailable',
          org: 'Unavailable',
          loading: false,
          error: 'network_info_unavailable',
        });
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Document edit tracking ────────────────────────────────────────
  // Listens to focusin (capture old value) + change (record diff).
  const [fieldEdits, setFieldEdits] = useState<FieldEdit[]>([]);
  const formPaperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const paper = formPaperRef.current;
    if (!paper) return;
    const oldValues = new Map<EventTarget, string>();
    const onFocus = (e: FocusEvent) => {
      const el = e.target as HTMLInputElement;
      if (el && 'value' in el) oldValues.set(el, el.value);
    };
    const onChange = (e: Event) => {
      const el = e.target as HTMLInputElement;
      if (!el || !('value' in el)) return;
      const oldVal = oldValues.get(el) ?? '';
      const newVal = el.value;
      if (oldVal === newVal) return;
      // Resolve a human-readable label from closest parent label element
      const label =
        el.closest('.flex.flex-col')?.querySelector('label')?.textContent?.trim()
        ?? el.placeholder
        ?? (el as HTMLInputElement).dataset?.fieldId
        ?? 'Field';
      setFieldEdits(prev => [
        ...prev,
        {
          seq:        prev.length + 1,
          fieldLabel: label,
          oldValue:   oldVal,
          newValue:   newVal,
          changedAt:  new Date().toISOString(),
          changedBy:  signer.name,
        },
      ]);
      oldValues.delete(el);
    };
    paper.addEventListener('focusin', onFocus);
    paper.addEventListener('change',  onChange);
    return () => {
      paper.removeEventListener('focusin', onFocus);
      paper.removeEventListener('change',  onChange);
    };
  }, [signer.name]);

  // ── Signature handlers ────────────────────────────────────────────
  const handleRequestSign = useCallback((fid: string) => {
    if (isEnfm001Standalone) {
      const v = validateAcknowledgmentLinks(enfmLinkedPolicyIds);
      if (!v.ok) {
        setEnfmPolicyError(v.error);
        emitPolicyLinkAudit({
          action: 'POLICY_LINK_VALIDATED',
          target: { artifactId: formInstanceId, artifactKind: 'acknowledgment', parentId: parentTaskId },
          policyIds: enfmLinkedPolicyIds,
          source: 'forms_library',
          validationResult: v,
        });
        return;
      }
      setEnfmPolicyError(null);
    }
    setActiveFieldId(fid);
  }, [isEnfm001Standalone, enfmLinkedPolicyIds, formInstanceId, parentTaskId]);

  const handleConfirmSign = useCallback((rec: SignatureRecord) => {
    setSignatures(prev => { const m = new Map(prev); m.set(rec.fieldId, rec); return m; });

    const today    = new Date().toISOString().split('T')[0];
    const newFills = new Map<string, string>();

    // 1. Auto-fill Printed Name (pos 0) and Date (pos 2) in the
    //    same signature section (fieldId pattern: {sectionIdx}-sig-{pos}).
    const sigSectionIdx = rec.fieldId.split('-')[0];
    newFills.set(`${sigSectionIdx}-sig-0`, signer.name);
    newFills.set(`${sigSectionIdx}-sig-2`, today);

    // 2. Auto-fill identification fields in grid sections.
    //    Scan all sections for labels matching name / title / date patterns.
    if (content) {
      content.sections.forEach((section, sIdx) => {
        if (section.layout !== 'grid' || !section.fields) return;
        section.fields.forEach((field, fIdx) => {
          const lbl = (field.label ?? '').toLowerCase();
          const fid = `${sIdx}-grid-${fIdx}`;
          if (lbl.includes('completed by') || lbl.includes('full name') || lbl === 'name') {
            newFills.set(fid, signer.name);
          } else if (
            (lbl.includes('title') || lbl.includes('role')) &&
            !lbl.includes('approval') && !lbl.includes('supervisor')
          ) {
            newFills.set(fid, signer.role);
          } else if (
            field.type === 'date' &&
            (lbl.includes('date') || lbl.includes('completed'))
          ) {
            newFills.set(fid, today);
          }
        });
      });
    }

    setAutoFills(prev => {
      const next = new Map(prev);
      newFills.forEach((v, k) => next.set(k, v));
      return next;
    });

    // DO NOT call setActiveFieldId(null) — eCIgnWorkspace stays open
    // until the user clicks "Done" or the X button.
    setFlowState('signed');
  }, [content, signer.name, signer.role]);

  // Close / cancel closes the workspace
  const handleCancelSign    = useCallback(() => setActiveFieldId(null), []);
  const handleRequestSecond = useCallback((task: SecondSigTask) => {
    setSecondSigTask(task);
    setFlowState('pending_second');
  }, []);

  // Top-bar Print after eCIgn includes full rendered form + certificate sections.
  const handlePrint = useCallback(() => window.print(), []);

  const getPrintableFormHtml = useCallback(() => {
    const root = formPaperRef.current;
    if (!root) return '';
    const clone = root.cloneNode(true) as HTMLDivElement;

    const liveInputs = Array.from(root.querySelectorAll('input, textarea, select'));
    const clonedInputs = Array.from(clone.querySelectorAll('input, textarea, select'));

    liveInputs.forEach((liveNode, idx) => {
      const cloneNode = clonedInputs[idx];
      if (!cloneNode) return;

      if (liveNode instanceof HTMLInputElement && cloneNode instanceof HTMLInputElement) {
        if (liveNode.type === 'checkbox' || liveNode.type === 'radio') {
          cloneNode.checked = liveNode.checked;
          if (liveNode.checked) cloneNode.setAttribute('checked', 'checked');
          else cloneNode.removeAttribute('checked');
        } else {
          cloneNode.value = liveNode.value;
          cloneNode.setAttribute('value', liveNode.value);
        }
      } else if (liveNode instanceof HTMLTextAreaElement && cloneNode instanceof HTMLTextAreaElement) {
        cloneNode.value = liveNode.value;
        cloneNode.textContent = liveNode.value;
      } else if (liveNode instanceof HTMLSelectElement && cloneNode instanceof HTMLSelectElement) {
        cloneNode.value = liveNode.value;
        Array.from(cloneNode.options).forEach(option => {
          option.selected = option.value === liveNode.value;
          if (option.selected) option.setAttribute('selected', 'selected');
          else option.removeAttribute('selected');
        });
      }
    });

    // Replace unsigned eCIgn sign-buttons with blank placeholders — prevents logo injection into print output
    Array.from(clone.querySelectorAll('button')).forEach(btn => {
      if (btn.querySelector('img[alt="Sign with eCign"]')) {
        const ph = document.createElement('div');
        ph.setAttribute('style', 'height:56px;border:1px solid #E5E4E3;border-radius:6px;background:transparent;');
        btn.replaceWith(ph);
      }
    });

    return clone.outerHTML;
  }, []);

  const ctxValue = useMemo(
    () => ({ enabled: signatureEnabled, signatures, requestSign: handleRequestSign, autoFills }),
    [signatureEnabled, signatures, handleRequestSign, autoFills],
  );

  if (!id) return null;
  if (!content) {
    return (
      <div className={`flex items-center justify-center ${isEmbedded ? 'w-full h-full' : 'min-h-screen bg-ci-bg'}`}>
        <div className="p-8 text-center">
          <h2 className="font-montserrat font-bold text-xl text-ci-text-primary">Form Not Found</h2>
          <p className="font-roboto text-sm text-ci-text-subtle mt-2">Form ID "{id}" is not in the Enterprise Forms Library.</p>
          {!isEmbedded && (
            <button
              onClick={() => navigate('/forms')}
              className="mt-4 px-4 py-2 rounded-[8px] bg-ci-accent text-white font-roboto text-sm hover:brightness-95 transition-colors"
            >
              Return to Forms Library
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── EMBEDDED MODE: no outer shell, no action bar, no card border ────────
  if (isEmbedded) {
    return (
      <SignatureCtx.Provider value={ctxValue}>
        <div
          ref={formPaperRef}
          className="w-full h-full overflow-y-auto px-8 py-8 md:px-10 md:py-10 font-roboto text-ci-text-primary"
        >
          <FormBody content={content} isEmbedded={true} />
        </div>

        {signatureEnabled && activeFieldId !== null && (
          <ECIgnWorkspace
            certId={certId}
            fieldId={activeFieldId}
            formId={content.id}
            formTitle={content.title}
            formVersion={content.version}
            formInstanceId={formInstanceId}
            geoInfo={geoInfo}
            fieldEdits={fieldEdits}
            signatures={signatures}
            secondSigTask={secondSigTask}
            linkedPolicyIds={content.id === 'EN-FM-001' ? enfmLinkedPolicyIds : content.policies}
            policies={content.policies}
            formSource={effectiveSource}
            parentTaskId={parentTaskId}
            hhcEventId={hhcEventId}
            hhcWorkflowId={hhcWorkflowId}
            getPrintableFormHtml={getPrintableFormHtml}
            onConfirm={handleConfirmSign}
            onClose={handleCancelSign}
            onRequestSecond={handleRequestSecond}
          />
        )}
      </SignatureCtx.Provider>
    );
  }

  // ── STANDALONE MODE: full shell with action bar + paper card ─────────────
  const orientation = content.orientation;
  const maxW = orientation === 'landscape' ? 'max-w-[11in]' : 'max-w-[8.5in]';

  return (
    <SignatureCtx.Provider value={ctxValue}>
      <div className="min-h-screen overflow-auto bg-[#F2F2F0] font-roboto text-[#1F1C1B]">
        {/* ── No-print action bar ── */}
        <div className={`no-print flex items-center justify-between px-6 md:px-10 pt-5 pb-3 mx-auto ${maxW}`}>
          <button
            type="button"
            onClick={() => navigate('/forms')}
            className="flex items-center gap-2 text-[12px] font-semibold text-[#1F1C1B] hover:text-[#007970] transition-colors"
          >
            <ChevronLeft size={15} /> Return to Forms Library
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#747470] font-mono">{content.id} · v{content.version}</span>
            <button
              type="button"
              onClick={() => {
                if (hasSigned) {
                  handlePrint();
                  return;
                }
                printForm(content.id);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#007970] hover:brightness-95 text-white text-[12px] font-semibold transition-colors"
            >
              <Printer size={14} /> Print
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!content) return;
                setSubmitErr(null);
                setSubmitMsg(null);
                setSubmitBusy(true);
                try {
                  const root = formRootRef.current ?? document.body;
                  const fields = harvestFormFields(root);
                  // Mirror current autoFills (signature side-effects) into the snapshot.
                  for (const [k, v] of autoFills.entries()) fields[k] = v;
                  const r = await recordFormSubmission({
                    policy_id:        content.policies[0],
                    workflow_id:      hhcWorkflowId ?? queryWorkflowId,
                    event_id:         hhcEventId ?? queryEventId,
                    form_id:          content.id,
                    form_instance_id: formInstanceId,
                    fields,
                    requires_signature: signatureEnabled && !hasSigned,
                    source_system:    'hhc',
                  });
                  setSubmitMsg(
                    `Saved (${r.status}) \u2014 evidence_id=${r.evidence_id}, sha256=${r.sha256.slice(0, 12)}\u2026`
                  );
                } catch (e) {
                  setSubmitErr((e as Error).message);
                } finally {
                  setSubmitBusy(false);
                }
              }}
              disabled={submitBusy}
              className="flex items-center gap-2 px-4 py-2 rounded-[8px] border border-[#C4C2C0] text-[#1F1C1B] text-[12px] font-semibold hover:bg-[#EAEAE8] disabled:opacity-50 transition-colors"
              title="Capture this form's current field values as compliance evidence (writes S3 + DDB + audit)"
            >
              <ShieldCheck size={14} /> {submitBusy ? 'Saving…' : 'Save as Evidence'}
            </button>
            <button
              type="button"
              onClick={() => {
                const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${content.id}.html`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-[8px] border border-[#E5E4E3] text-[#1F1C1B] text-[12px] font-semibold hover:bg-white transition-colors"
            >
              <Download size={14} /> Download
            </button>
          </div>
        </div>

        {/* Submission status banner */}
        {(submitMsg || submitErr) && (
          <div className={`no-print mx-auto ${maxW} px-6 md:px-10`}>
            {submitMsg && (
              <div className="rounded-[8px] border border-emerald-300 bg-emerald-50 text-emerald-800 px-3 py-2 text-[12px] flex items-center justify-between">
                <span>{submitMsg}</span>
                <button onClick={() => setSubmitMsg(null)} className="text-emerald-700 hover:text-emerald-900" title="Dismiss" aria-label="Dismiss">{'×'}</button>
              </div>
            )}
            {submitErr && (
              <div className="rounded-[8px] border border-rose-300 bg-rose-50 text-rose-800 px-3 py-2 text-[12px] flex items-center justify-between">
                <span>{submitErr}</span>
                <button onClick={() => setSubmitErr(null)} className="text-rose-700 hover:text-rose-900" title="Dismiss" aria-label="Dismiss">{'×'}</button>
              </div>
            )}
          </div>
        )}

        {/* ── Signature flow action banner ── */}
        <FormSignatureFlow
          formId={content.id}
          formTitle={content.title}
          formVersion={content.version}
          formInstanceId={formInstanceId}
          maxW={maxW}
          flowState={flowState}
          hasSigned={hasSigned}
          secondSigTask={secondSigTask}
          onRequestSecond={handleRequestSecond}
          onPrint={handlePrint}
        />

        {isEnfm001Standalone && (
          <div className={`mx-auto ${maxW} px-4 md:px-8 pb-4`}>
            <div
              className={`rounded-[10px] border bg-white px-4 py-3 ${enfmPolicyValidation.ok ? 'border-[#E5E4E3]' : 'border-rose-300'}`}
            >
              <PolicyLinkSelector
                value={enfmLinkedPolicyIds}
                onChange={(ids) => {
                  setEnfmLinkedPolicyIds(ids);
                  setEnfmPolicyError(null);
                }}
                artifactId={formInstanceId}
                artifactKind="acknowledgment"
                source="forms_library"
                label="Linked Policy / Procedure"
                required
              />
              {enfmPolicyError && (
                <div className="mt-2 px-3 py-2 rounded-lg font-roboto text-[12px] bg-rose-50 text-rose-800 border border-rose-300" role="alert">
                  {enfmPolicyError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Screen shell (paper gutter) ── */}
        <div className={`screen-shell mx-auto ${maxW} px-4 py-6 md:px-8 md:py-10`}>
          <div
            ref={formPaperRef}
            className="form-page bg-white border border-[#E5E4E3] rounded-[12px] shadow-sm px-8 py-10 md:px-12 md:py-14 text-[#1F1C1B]"
          >
            <FormBody content={content} />
            {hasSigned && Array.from(signatures.values())[0] && (
              <DocumentAuditStamp
                certId={certId}
                signerName={Array.from(signatures.values())[0].signerName}
                signedAt={Array.from(signatures.values())[0].signedAt}
              />
            )}
          </div>
        </div>

        {hasSigned && (
          <div className={`mx-auto ${maxW} px-4 md:px-8 pb-10`}>
            <FormCertificatePage
              certId={certId}
              formId={content.id}
              formTitle={content.title}
              formVersion={content.version}
              formInstanceId={formInstanceId}
              signatures={signatures}
              secondSigTask={secondSigTask}
              policies={isEnfm001Standalone ? enfmLinkedPolicyIds : content.policies}
              geoInfo={geoInfo}
              fieldEdits={fieldEdits}
            />
          </div>
        )}
      </div>

      {/* ── eCIgn full-screen signing workspace ── */}
      {activeFieldId !== null && (
        <ECIgnWorkspace
          certId={certId}
          fieldId={activeFieldId}
          formId={content.id}
          formTitle={content.title}
          formVersion={content.version}
          formInstanceId={formInstanceId}
          geoInfo={geoInfo}
          fieldEdits={fieldEdits}
          signatures={signatures}
          secondSigTask={secondSigTask}
          linkedPolicyIds={isEnfm001Standalone ? enfmLinkedPolicyIds : content.policies}
          policies={content.policies}
          formSource={effectiveSource}
          parentTaskId={parentTaskId}
          hhcEventId={hhcEventId}
          hhcWorkflowId={hhcWorkflowId}
          getPrintableFormHtml={getPrintableFormHtml}
          onConfirm={handleConfirmSign}
          onClose={handleCancelSign}
          onRequestSecond={handleRequestSecond}
        />
      )}
    </SignatureCtx.Provider>
  );
}

export default FormViewer;
