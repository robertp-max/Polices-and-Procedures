import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Printer, Download, Building2, User, Briefcase, HeartPulse, Info, CheckCircle2, ShieldCheck } from 'lucide-react';
// Document logo - imported for data URL compatibility in forms.
import ciLogoGray from '@/assets/ci-logo-gray.png';
import { useShellStore } from '@/policy/stores/uiStore';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import {
  buildFormContent,
  type FormContent,
  type FormSection,
  type FormField,
} from '../data/formsLibraryContent';
import { FORMS_DATASET } from '../data/formsLibraryDataset';
import { resolveCanonicalFormId } from '../data/formIdAliases';
import { printForm } from '../utils/printForm';
import { recordFormSubmission, harvestFormFields } from '@/policy/services/hhcFormEvidence';
import eCIgnLogo from '@/assets/eCIgn.png';
import { FormSignatureFlow } from './FormSignatureFlow';
import { ECIgnWorkspace } from './FormSigningWorkspace';
import { PolicyLinkSelector } from './PolicyLinkSelector';
import { resolveCesRole, isDonAssistant } from '@/policy/ces/cesRoles';
import { getCesReviewRole } from '@/policy/ces/cesReviewMode';
import {
  SignatureCtx,
  useSignatureCtx,
  type SignatureRecord,
  type SecondSigTask,
  type FormSignerSlot,
  type SignFlowState,
  type GeoInfo,
  type FieldEdit,
  signerNanoid,
  fmtSignTs,
} from './FormSignatureContext';
import {
  deriveCanonicalSignerRequirements,
  minTierForRequiredSlot,
} from '@/policy/ecign/signerAuthority';
import {
  emitPolicyLinkAudit,
  validateAcknowledgmentLinks,
} from '@/policy/services/policyLinkService';
import { ecignApi } from '@/policy/ecign/api';
import { useEcignSignerIdentity } from '@/policy/ecign/signerIdentity';

function isCanonicalCesFormInstanceId(value: string, eventId: string, formId: string): boolean {
  if (!value || value.startsWith('fi_')) return false;
  return value.startsWith(`${eventId}-${formId}-`);
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
  <div className="bg-[#00797D] rounded-[16px] p-4 w-48 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-lg border border-[#004142]/20">
    <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
    <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-black/10 rounded-full blur-2xl" />
    <Building2 size={22} className="text-[#E5FEFF] mb-2 opacity-90" />
    <h2 className="text-white font-montserrat font-bold text-[13px] tracking-[0.12em] mb-3 leading-tight">GOVERNING BODY</h2>
    <div className="bg-[#E5FEFF] text-[#00797D] rounded-full px-3 py-1 text-[9px] font-montserrat font-bold tracking-wide uppercase shadow-sm leading-tight">
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
    <h3 className="font-montserrat font-bold text-[#004142] text-[11px] tracking-widest mb-3 leading-tight">COMPLIANCE OFFICER</h3>
    <input type="text" placeholder="Enter Name..." className="mt-auto w-full text-center border-b-2 border-[#E5E4E3] pb-1 text-[#263C3D] focus:outline-none focus:border-[#C74601] transition-colors bg-transparent placeholder-[#747470] font-roboto text-[11px]" />
  </div>
);

const ClinicalManagerCard = () => (
  <div className="bg-white rounded-[12px] p-3 w-40 text-center border border-[#E5E4E3] flex flex-col">
    <h4 className="font-montserrat font-bold text-[#00797D] text-[11px] tracking-wide mb-3 leading-tight">CLINICAL MANAGER</h4>
    <input type="text" placeholder="Enter Name..." className="w-full text-center border-b-2 border-[#E5E4E3] pb-1 text-[#263C3D] focus:outline-none focus:border-[#00797D] transition-colors bg-transparent placeholder-[#747470] mb-3 font-roboto text-[11px]" />
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
    <input type="text" placeholder="Enter Name..." className="w-full mt-auto text-center border-b-2 border-[#E5E4E3] pb-1 text-[#263C3D] focus:outline-none focus:border-[#004142] transition-colors bg-transparent placeholder-[#747470] text-[11px] font-roboto" />
  </div>
);

const BusinessOpsCard = () => (
  <div className="bg-white rounded-[12px] p-3 w-40 text-center border border-[#E5E4E3] flex flex-col">
    <div className="bg-[#004142] text-white rounded-md py-1.5 px-2 mb-3 mx-auto shadow-sm">
      <h4 className="font-montserrat font-bold text-[9px] tracking-widest uppercase">BUSINESS OPS</h4>
    </div>
    <input type="text" placeholder="Enter Name..." className="w-full text-center border-b-2 border-[#E5E4E3] pb-1 text-[#263C3D] focus:outline-none focus:border-[#004142] transition-colors bg-transparent placeholder-[#747470] mb-3 text-[11px] font-roboto" />
    <div className="mt-auto bg-[#FAFBF8] border border-[#E5E4E3] rounded-md py-1.5 px-2 text-[9px] font-medium tracking-wide text-[#524D4B] font-roboto leading-tight">
      HR, Finance, Intake, Scheduling
    </div>
  </div>
);

function OrgChartSection({ sectionTitle }: { sectionTitle: string }) {
  return (
    <section className="mb-12 avoid-break">
      <h3 className="font-montserrat font-semibold text-[13px] text-[#004142] tracking-[0.22em] uppercase mb-6 flex items-center gap-4">
        <span className="shrink-0">{sectionTitle}</span>
        <span className="flex-grow h-px bg-[#00797D]" />
      </h3>

      {/* Info callout */}
      <div className="bg-white border border-[#E5E4E3] rounded-[16px] p-5 mb-8 flex items-start gap-4 shadow-sm">
        <div className="bg-[#E5FEFF] p-2.5 rounded-full text-[#00797D] shrink-0 mt-0.5">
          <Info size={18} strokeWidth={2.5} />
        </div>
        <p className="text-[#524D4B] leading-relaxed text-[14px] font-roboto">
          <strong className="font-montserrat font-bold text-[#004142] tracking-wide mr-1">Agency Organizational Structure:</strong>
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
const CI_TEAL   = '#00797D';
const CI_ORANGE = '#C74601';
const CI_INK    = '#263C3D';
const CI_MUTED  = '#607C7D';

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
  'font-roboto text-[14px] text-[#263C3D] ' +
  'focus:border-[#00797D] focus:ring-1 focus:ring-[#00797D] ' +
  'outline-none transition-all';

/** Underline-only input — signature rows, Printed Name column */
const SIG_INPUT_CLS =
  'w-full h-8 border-b border-[#C8C6C5] px-0 bg-transparent ' +
  'font-roboto text-[14px] text-[#263C3D] ' +
  'focus:border-[#00797D] outline-none transition-all';

/** Dashed underline — signature rows, Signature column */
const SIG_DASHED_CLS =
  'w-full h-8 border-b border-dashed border-[#C8C6C5] px-0 bg-transparent ' +
  'font-roboto text-[14px] text-[#263C3D] ' +
  'focus:border-[#00797D] outline-none transition-all';

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

  /* ─── MVP-P0-A11Y-001 — label / control association (Wave 3) ──────────
   * Each control gets a stable id derived from its fieldId so the wrapping
   * <label> can use htmlFor (programmatic association for screen readers).
   * Help text gets a stable id and is referenced via aria-describedby.
   * Required fields get aria-required="true" in addition to the visible
   * asterisk. Radio groups are rendered with <fieldset>/<legend> below.
   * Signature buttons keep their existing aria-label and add
   * aria-labelledby to expose the visible question label too.
   *
   * data-field-id is preserved for the existing form persistence layer
   * (the focusin/change listeners in FormViewer query by data-field-id).
   */
  const inputId = fieldId ? `f-${fieldId}` : undefined;
  const helpId = (inputId && f.help) ? `${inputId}-help` : undefined;
  const ariaRequired = f.required ? true : undefined;

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
          <CheckCircle2 size={13} className="text-[#00797D] shrink-0" />
        </div>
      );
    }
    return (
      <button
        type="button"
        data-testid="ecign-sign-btn"
        data-field-id={fId}
        aria-label="Sign with eCIgn"
        onClick={() => requestSign(fId)}
        className="h-14 w-full flex items-center justify-center gap-2 px-3 rounded-md transition-colors"
        style={{
          border:     '1px dashed #00797D',
          background: 'transparent',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#F0FFFE')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <img src={eCIgnLogo} alt="Sign with eCign" className="h-10 w-auto object-contain pointer-events-none" />
        <span className="text-[11px] font-semibold text-[#00797D] pointer-events-none">Sign</span>
      </button>
    );
  };

  // Radio is a GROUP — render with <fieldset>/<legend> for proper a11y semantics.
  if (f.type === 'radio') {
    const radioGroupName = inputId ?? f.label;
    return (
      <fieldset className={`${colSpan} flex flex-col border-0 m-0 p-0`}>
        <legend className={labelCls}>
          {f.label}
          {f.required && <span className="text-[#C74601] ml-1">*</span>}
        </legend>
        <div className="flex gap-4 flex-wrap mt-1">
          {f.options?.map(o => (
            <label key={o} className="flex items-center gap-2 text-[12px]">
              <input
                type="radio"
                name={radioGroupName}
                value={o}
                data-field-id={fieldId}
                aria-required={ariaRequired}
                aria-describedby={helpId}
                className="w-4 h-4 accent-[#00797D]"
              />{' '}
              {o}
            </label>
          ))}
        </div>
        {f.help && (
          <p id={helpId} className="font-roboto text-[10px] text-[#747470] italic mt-1">
            {f.help}
          </p>
        )}
      </fieldset>
    );
  }

  // Signature — visible label kept as a styled span so it can be referenced
  // by aria-labelledby on the eCign button (the button also has its own
  // aria-label in renderSignatureField for direct discoverability).
  if (f.type === 'signature') {
    const labelId = inputId ? `${inputId}-label` : undefined;
    return (
      <div className={`${colSpan} flex flex-col`}>
        <span id={labelId} className={labelCls}>
          {f.label}
          {f.required && <span className="text-[#C74601] ml-1">*</span>}
        </span>
        <div aria-labelledby={labelId}>{renderSignatureField()}</div>
        {f.help && (
          <p id={helpId} className="font-roboto text-[10px] text-[#747470] italic mt-1">
            {f.help}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`${colSpan} flex flex-col`}>
      <label htmlFor={inputId} className={labelCls}>
        {f.label}
        {f.required && <span className="text-[#C74601] ml-1">*</span>}
      </label>

      {f.type === 'textarea' ? (
        <textarea
          id={inputId}
          rows={3}
          placeholder={f.placeholder}
          data-field-id={fieldId}
          aria-required={ariaRequired}
          aria-describedby={helpId}
          className={
            INPUT_CLS +
            ' h-auto min-h-[70px] resize-y pt-2 leading-relaxed'
          }
        />
      ) : f.type === 'select' ? (
        <select
          id={inputId}
          className={INPUT_CLS}
          data-field-id={fieldId}
          aria-required={ariaRequired}
          aria-describedby={helpId}
        >
          <option value="">— Select —</option>
          {f.options?.map(o => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : f.type === 'checkbox' ? (
        <input
          id={inputId}
          type="checkbox"
          data-field-id={fieldId}
          aria-required={ariaRequired}
          aria-describedby={helpId}
          className="w-5 h-5 accent-[#00797D] mt-1"
        />
      ) : (
        <input
          ref={textInputRef}
          id={inputId}
          type={f.type}
          placeholder={f.placeholder}
          data-field-id={fieldId}
          aria-required={ariaRequired}
          aria-describedby={helpId}
          className={inputCls}
        />
      )}

      {f.help && (
        <p id={helpId} className="font-roboto text-[10px] text-[#747470] italic mt-1">
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
        className="font-montserrat font-semibold text-[13px] text-[#004142]
                   tracking-[0.22em] uppercase mb-4 flex items-center gap-4"
      >
        <span className="shrink-0">{s.title || `Section ${idx + 1}`}</span>
        <span className="flex-grow h-px bg-[#00797D]" />
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
                                   text-[#263C3D] focus:outline-none"
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
        <>
          <ul className="space-y-1">
            {s.items.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 py-2 border-b border-[#E5E4E3]"
              >
                <span
                  className="shrink-0 mt-[3px] w-[6px] h-[6px] rounded-full bg-[#00797D]"
                  aria-hidden="true"
                />
                <span className="font-roboto text-[12px] text-[#263C3D] leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ul>
          {s.sectionAck && (
            <div className="mt-4 pt-4 border-t border-[#E5E4E3] flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 font-roboto text-[12px] text-[#52404B] cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 accent-[#00797D] shrink-0" />
                <span>Section reviewed and acknowledged</span>
              </label>
              <div className="flex flex-col">
                <span className={LABEL_CLS}>Initials</span>
                <input
                  placeholder="___"
                  className="w-16 font-roboto text-[12px] border-b border-[#C8C6C5] bg-transparent focus:outline-none focus:border-[#00797D] text-center"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* ── attestation layout ── */}
      {s.layout === 'attestation' && (
        <div>
          {s.body && (
            <p className="font-roboto text-[12px] text-[#263C3D] mb-4 leading-relaxed font-medium">
              {s.body}
            </p>
          )}
          {s.acknowledgments && (
            <ol className="list-decimal list-outside ml-6 space-y-3 font-roboto text-[12px] text-[#263C3D]">
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
                  <td className="px-3 py-2 font-roboto text-[12px] font-medium text-[#263C3D]">
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
          {/* Print-aligned document header for the screen viewer. */}
          <header className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <img
                src={ciLogoGray}
                alt="Care Indeed - The Heart of Home Health"
                className="h-12 w-auto select-none object-contain"
                draggable={false}
              />
              <div className="sm:text-right">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#607C7D]">Enterprise Forms Library</div>
                <div className="mt-1 font-mono text-[11px] font-semibold text-[#00797D]">{content.id} · v{content.version}</div>
              </div>
            </div>
            <div className="mt-5 h-px w-full" style={{ background: CI_TEAL }} />
            <div className="mt-7">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#607C7D]">{content.domainCode || 'Enterprise Form'}</div>
              <h1 className="mt-1 font-roboto text-3xl font-semibold tracking-tight text-[#004142]">
                {content.title}
              </h1>
              <div className="mt-2 flex items-center gap-2.5 text-[11px] font-mono text-[#00797D]">
                <span>FORM {content.id}</span>
                <span className="inline-block h-3 w-px bg-slate-300" />
                <span>v{content.version}</span>
                {content.type && (
                  <>
                    <span className="inline-block h-3 w-px bg-slate-300" />
                    <span className="uppercase tracking-wider text-[#356D70]">{content.type}</span>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* ── TITLE & METADATA (simplified for V5 clarity) ── */}
          <section className="mb-8">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 mb-6 text-sm">
              {[
                ['Form ID', content.id],
                ['Version', `v${content.version}`],
                ['Effective', content.effectiveDate],
                ['Next Review', content.revisionDate],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col">
                  <dt
                    className="font-semibold text-[10px] tracking-[0.16em] uppercase mb-0.5"
                    style={{ color: CI_MUTED }}
                  >
                    {k}
                  </dt>
                  <dd className="font-medium" style={{ color: CI_INK }}>{v}</dd>
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
  formInstanceId?:       string;
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

export function FormViewer({ formId, formInstanceId: formInstanceIdProp, enableEmbeddedSigning = false, formSource, parentTaskId, hhcEventId, hhcWorkflowId }: FormViewerProps) {
  const { formId: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const signer = useEcignSignerIdentity();
  const getOrCreateFormInstance = useRegulatoryExecutionStore(state => state.getOrCreateFormInstance);
  const signerTasksByFormInstanceId = useRegulatoryExecutionStore(state => state.signerTasksByFormInstanceId);
  // If formId prop is supplied → embedded inside a parent panel (no shell)
  const isEmbedded = formId !== undefined;
  const signatureEnabled = !isEmbedded || enableEmbeddedSigning;
  // Phase 11 — derive source default: embedded => Policy Viewer, otherwise Forms Library.
  const effectiveSource: 'policy_viewer' | 'task' | 'forms_library' | 'workflow' =
    formSource ?? (isEmbedded ? 'policy_viewer' : 'forms_library');
  const id = formId ?? routeId;
  const canonicalId = resolveCanonicalFormId(id);
  const queryInstanceId =
    formInstanceIdProp
    ?? searchParams.get('form_instance_id')
    ?? searchParams.get('instance')
    ?? undefined;
  const queryEventId = searchParams.get('event') ?? undefined;
  const queryWorkflowId = searchParams.get('workflow') ?? undefined;
  const queryEventIdV2 = searchParams.get('event_id') ?? undefined;
  const queryTaskId = searchParams.get('task_id') ?? undefined;
  const queryFormId = searchParams.get('form_id') ?? undefined;
  const queryPolicyId = searchParams.get('policy_id') ?? undefined;
  const queryWorkflowIdV2 = searchParams.get('workflow_id') ?? undefined;
  const queryRequirementId = searchParams.get('requirement_id') ?? undefined;
  const effectiveEventContext = hhcEventId ?? queryEventIdV2 ?? queryEventId;
  const effectiveWorkflowContext = hhcWorkflowId ?? queryWorkflowIdV2 ?? queryWorkflowId;
  const hasTaskLinkedContext = Boolean(queryEventIdV2 || queryTaskId || queryRequirementId);
  const setDetailMode = useShellStore(s => s.setDetailMode);

  useEffect(() => {
    if (isEmbedded) return;
    const prev = document.title;
    document.title = 'Care Indeed Home Health Care, Inc. - Policies and Procedures';
    setDetailMode(true);
    return () => {
      document.title = prev;
      setDetailMode(false);
    };
  }, [isEmbedded, setDetailMode]);

  const content: FormContent | null = useMemo(() => {
    if (!canonicalId) return null;
    const rec = FORMS_DATASET.find(f => f.id === canonicalId);
    if (!rec) return null;
    return buildFormContent(rec);
  }, [canonicalId]);

  // ── Signature state (standalone mode only) ────────────────────────
  // All hooks must be called before any early returns.
  const [formInstanceId, setFormInstanceId] = useState(() => queryInstanceId ?? `fi_${signerNanoid(12)}`);
  const [certId]          = useState(() => `CERT-${canonicalId ?? id ?? 'fm'}-${signerNanoid(8)}`);
  const [signatures,      setSignatures]    = useState<Map<string, SignatureRecord>>(new Map());
  const [activeFieldId,   setActiveFieldId] = useState<string | null>(null);
  const [flowState,       setFlowState]     = useState<SignFlowState>('unsigned');
  const [secondSigTask,   setSecondSigTask] = useState<SecondSigTask | null>(null);
  const [autoFills,       setAutoFills]     = useState<Map<string, string>>(new Map());
  const [enfmLinkedPolicyIds, setEnfmLinkedPolicyIds] = useState<string[]>([]);
  const [enfmPolicyError, setEnfmPolicyError] = useState<string | null>(null);
  const activeSignerTasks = signerTasksByFormInstanceId[formInstanceId] ?? [];
  const activeSignerTask = useMemo(() => {
    return activeSignerTasks
      .filter(task => task.status === 'pending' || task.status === 'opened')
      .find(task => task.assignedTo === signer.id);
  }, [activeSignerTasks, signer.id]);

  const resolvedSignerSlots = useMemo<FormSignerSlot[]>(() => {
    if (!content?.id) return [];
    if (content.signerSlots?.length) {
      return content.signerSlots.map(slot => ({
        ...slot,
        tier: minTierForRequiredSlot(slot.role, slot.tier),
      }));
    }
    if (!effectiveEventContext) return [];
    const requirements = deriveCanonicalSignerRequirements({
      formId: content.id,
      workflowId: effectiveWorkflowContext,
      eventId: effectiveEventContext,
      taskId: parentTaskId ?? queryTaskId ?? undefined,
      domain: content.domainCode,
    });
    if (requirements.length <= 1) return [];
    return requirements.map((requirement, index) => ({
      field_id: index === 0 && activeFieldId ? activeFieldId : requirement.slotFieldId,
      role: requirement.allowedRoles[0] ?? requirement.slotPurpose,
      tier: requirement.minTier,
      required: requirement.required,
      resolver: index === 0 ? 'self' : { role_id: requirement.allowedRoles[0] ?? requirement.slotPurpose },
      sequence_group: requirement.slotOrder,
    }));
  }, [
    activeFieldId,
    content?.domainCode,
    content?.id,
    content?.signerSlots,
    effectiveEventContext,
    effectiveWorkflowContext,
    parentTaskId,
    queryTaskId,
  ]);

  useEffect(() => {
    if (!content?.id) return;
    if (!effectiveEventContext) return;
    if (isCanonicalCesFormInstanceId(formInstanceId, effectiveEventContext, content.id)) return;
    const canonical = getOrCreateFormInstance({
      eventId: effectiveEventContext,
      formId: content.id,
      taskId: parentTaskId ?? queryTaskId ?? undefined,
      requirementId: queryRequirementId ?? (parentTaskId || queryTaskId ? `${parentTaskId ?? queryTaskId}::FORM_COMPLETION::${content.id}` : undefined),
      policyIds: queryPolicyId ? [queryPolicyId] : (content.policies?.length ? content.policies : ['UNASSIGNED-POLICY']),
      workflowId: effectiveWorkflowContext ?? undefined,
    });
    if (canonical?.id && canonical.id !== formInstanceId) {
      setFormInstanceId(canonical.id);
    }
  }, [
    content?.id,
    content?.policies,
    effectiveEventContext,
    effectiveWorkflowContext,
    formInstanceId,
    getOrCreateFormInstance,
    parentTaskId,
    queryPolicyId,
    queryRequirementId,
    queryTaskId,
  ]);

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

  // ── Canonical logo data URL (base64) ─────────────────────────────
  // The Vite asset URL (e.g. /assets/ci-logo-gray-abc123.png) is
  // localhost-relative and breaks in saved-HTML packets. We convert it
  // to a base64 data URL once at mount so it embeds inline in the packet.
  const ciLogoDataUrlRef = useRef<string>(ciLogoGray);
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          ciLogoDataUrlRef.current = canvas.toDataURL('image/png');
        }
      } catch { /* keep original URL on CORS failure */ }
    };
    img.src = ciLogoGray;
    return () => { cancelled = true; };
  }, []);

  // ── Document edit tracking ────────────────────────────────────────
  // Listens to focusin (capture old value) + change (record diff).
  const [fieldEdits, setFieldEdits] = useState<FieldEdit[]>([]);
  const formPaperRef = useRef<HTMLDivElement>(null);
  const requiredFieldCount = useMemo(() => {
    if (!content) return 0;
    return content.sections.reduce((total, section) => (
      total + (section.fields?.filter(field => field.required).length ?? 0)
    ), 0);
  }, [content]);
  const signatureFieldCount = useMemo(() => {
    if (!content) return 0;
    return content.sections.reduce((total, section) => (
      total + (section.fields?.filter(field => field.type === 'signature').length ?? 0)
    ), 0);
  }, [content]);
  const completionPercent = useMemo(() => {
    if (hasSigned) return 100;
    const denominator = Math.max(requiredFieldCount + signatureFieldCount, 1);
    const visibleProgress = fieldEdits.length + signatures.size;
    return Math.min(96, Math.max(18, Math.round((visibleProgress / denominator) * 100)));
  }, [fieldEdits.length, hasSigned, requiredFieldCount, signatureFieldCount, signatures.size]);
  const validationSummary = hasSigned
    ? 'Signed artifact available from the signed package viewer'
    : requiredFieldCount > 0
      ? `${requiredFieldCount} required field${requiredFieldCount === 1 ? '' : 's'} tracked`
      : 'No required fields flagged';
  const signerSummary = resolvedSignerSlots.length > 1
    ? `${resolvedSignerSlots.length} signer sequence`
    : signatureFieldCount > 0
      ? `${signatureFieldCount} signature field${signatureFieldCount === 1 ? '' : 's'}`
      : 'No signature required';

  // ── Form field persistence (localStorage keyed by form_instance_id) ──
  // On mount: restore previously-saved field values into the DOM.
  // On change: save snapshot to localStorage for cross-refresh continuity.
  const PERSIST_KEY = `ci_form_fields_${formInstanceId}`;

  // Restore saved field values when the form mounts or instance ID changes.
  useEffect(() => {
    const paper = formPaperRef.current;
    if (!paper || !formInstanceId) return;
    try {
      const raw = localStorage.getItem(PERSIST_KEY);
      if (!raw) return;
      const saved: Record<string, string> = JSON.parse(raw);
      // Delay slightly to ensure React has rendered all controlled fields
      const timer = setTimeout(() => {
        Object.entries(saved).forEach(([name, value]) => {
          const el = paper.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
            `[name="${name}"], [data-field-id="${name}"]`
          );
          if (!el) return;
          const setter = Object.getOwnPropertyDescriptor(
            el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype :
            el instanceof HTMLSelectElement   ? HTMLSelectElement.prototype   :
                                               HTMLInputElement.prototype,
            'value'
          )?.set;
          setter?.call(el, value);
          el.dispatchEvent(new Event('input',  { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }, 200);
      return () => clearTimeout(timer);
    } catch { /* noop — corrupted storage */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PERSIST_KEY]);

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

      // Persist all field values to localStorage on every change
      try {
        const allInputs = Array.from(
          paper.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
            'input, textarea, select'
          )
        );
        const snapshot: Record<string, string> = {};
        allInputs.forEach(inp => {
          const key = inp.getAttribute('name') || inp.getAttribute('data-field-id') || inp.id;
          if (key && inp.value) snapshot[key] = inp.value;
        });
        localStorage.setItem(PERSIST_KEY, JSON.stringify(snapshot));
      } catch { /* noop — storage quota exceeded */ }
    };
    paper.addEventListener('focusin', onFocus);
    paper.addEventListener('change',  onChange);
    return () => {
      paper.removeEventListener('focusin', onFocus);
      paper.removeEventListener('change',  onChange);
    };
  }, [signer.name, PERSIST_KEY]);

  // ── CES signing role gate ─────────────────────────────────────────
  const [cesSignBlock, setCesSignBlock] = useState<string | null>(null);
  const activeCesRole = useMemo(() => {
    if (effectiveSource !== 'task') return null;
    const reviewRole = getCesReviewRole(signer.email);
    if (reviewRole) return reviewRole;
    return resolveCesRole(signer.role);
  }, [effectiveSource, signer.email, signer.role]);

  // ── Signature handlers ────────────────────────────────────────────
  const handleRequestSign = useCallback((fid: string) => {
    if (effectiveSource === 'task' && activeCesRole && isDonAssistant(activeCesRole)) {
      setCesSignBlock('DON Assistant cannot sign, approve, or certify forms. Switch to an authorized signer role.');
      return;
    }
    setCesSignBlock(null);
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
  }, [isEnfm001Standalone, enfmLinkedPolicyIds, formInstanceId, parentTaskId, effectiveSource, activeCesRole]);

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

    /* MVP-P1-A11Y-005 (Wave 4) — preserve ARIA semantics on sign-button placeholders.
     *
     * The eCIgn sign-button is replaced with a blank <div> in the printable
     * snapshot to prevent localhost logo injection. Previously this stripped
     * ALL accessibility metadata from that slot, leaving screen readers with
     * an anonymous decorative div. We now carry the button's accessible name
     * onto the placeholder via role="img" + aria-label so AT users still
     * understand "a signature field belongs here" when consuming the saved
     * artifact HTML. The visible layout (height/border) is unchanged — this
     * is ARIA preservation only, NOT Wave 5 print-fidelity work. */
    Array.from(clone.querySelectorAll('button')).forEach(btn => {
      if (btn.querySelector('img[alt="Sign with eCign"]')) {
        const ph = document.createElement('div');
        ph.setAttribute('style', 'height:56px;border:1px solid #E5E4E3;border-radius:6px;background:transparent;');
        const ariaLabel = (
          btn.getAttribute('aria-label')
            ?? btn.getAttribute('title')
            ?? (() => {
              const labelledBy = btn.getAttribute('aria-labelledby');
              if (labelledBy) {
                const ids = labelledBy.split(/\s+/).filter(Boolean);
                const texts = ids
                  .map(id => clone.querySelector(`#${CSS.escape(id)}`)?.textContent?.trim())
                  .filter((t): t is string => !!t);
                if (texts.length > 0) return texts.join(' ');
              }
              return '';
            })()
        ) || 'Signature placeholder';
        ph.setAttribute('role', 'img');
        ph.setAttribute('aria-label', ariaLabel);
        btn.replaceWith(ph);
      }
    });

    // Preserve the actual Forms Library DOM. Only inline the logo asset so
    // downloaded/saved eCIgn packets do not depend on localhost asset URLs.
    Array.from(clone.querySelectorAll('img')).forEach(img => {
      if (img.getAttribute('src') === ciLogoGray || img.alt.includes('Care Indeed')) {
        img.setAttribute('src', ciLogoDataUrlRef.current);
      }
    });

    return clone.outerHTML;
  }, [content]);

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
        <style>{`.ci-form-viewer-paper > section > h3 { color: #004142 !important; }`}</style>
        <div
          ref={formPaperRef}
          className="ci-form-viewer-paper form-frame px-8 py-10 md:px-12 md:py-14 font-roboto"
          style={{ backgroundColor: '#FFFFFF', color: '#263C3D' }}
        >
          <FormBody content={content} />
          {cesSignBlock && (
            <div className="mx-4 my-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-[12px] text-amber-900">
              <div className="font-semibold mb-1">Signing Blocked</div>
              <div>{cesSignBlock}</div>
              {activeCesRole && <div className="mt-1 text-[10px] text-amber-700">Active CES role: <strong>{activeCesRole}</strong></div>}
              <button type="button" onClick={() => setCesSignBlock(null)} className="mt-2 text-[10px] underline text-amber-700 hover:text-amber-900">Dismiss</button>
            </div>
          )}
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
            parentTaskId={parentTaskId ?? queryTaskId ?? undefined}
            hhcEventId={effectiveEventContext}
            hhcWorkflowId={effectiveWorkflowContext}
            getPrintableFormHtml={getPrintableFormHtml}
            onConfirm={handleConfirmSign}
            onClose={handleCancelSign}
            onRequestSecond={handleRequestSecond}
            signerSlots={resolvedSignerSlots.length > 1 ? resolvedSignerSlots : undefined}
            signerIndex={activeSignerTask?.signerIndex ?? 1}
            totalSigners={resolvedSignerSlots.length || 1}
          />
        )}
      </SignatureCtx.Provider>
    );
  }

  // ── STANDALONE MODE: full shell with action bar + paper card ─────────────
  const orientation = content.orientation;
  const maxW = orientation === 'landscape' ? 'max-w-[11in]' : 'max-w-[8.5in]';

  const standaloneDocument = (
    <SignatureCtx.Provider value={ctxValue}>
      <style>{`
        .ci-form-viewer-paper > section > h3 { color: #004142 !important; }
        .ci-form-shell-bg {
          background:
            radial-gradient(circle at 78% -8%, rgba(255,255,255,0.95), transparent 30%),
            radial-gradient(circle at 8% 8%, rgba(0,121,112,0.08), transparent 34%),
            linear-gradient(135deg, #EEF9F9 0%, #F8FFFF 52%, #F2FAFA 100%);
        }
        .ci-form-utility {
          background: rgba(255,255,255,0.84);
          border: 1px solid rgba(184,220,220,0.74);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 18px 42px -34px rgba(0,65,66,0.42);
          backdrop-filter: blur(18px) saturate(1.08);
        }
        .ci-form-page-shell {
          animation: ciFormEnter 220ms cubic-bezier(.22,1,.36,1) both;
        }
        .ci-form-page {
          min-height: 11in;
          border: 1px solid #D7E0E0;
          box-shadow: 0 30px 80px -52px rgba(0,65,66,0.54);
        }
        .ci-form-action {
          transition: transform 160ms cubic-bezier(.22,1,.36,1), box-shadow 160ms cubic-bezier(.22,1,.36,1), border-color 160ms cubic-bezier(.22,1,.36,1), background-color 160ms cubic-bezier(.22,1,.36,1);
        }
        .ci-form-action:hover { transform: translateY(-1px); box-shadow: 0 16px 34px -28px rgba(0,65,66,0.45); }
        .ci-form-action:active { transform: scale(.985); }
        @keyframes ciFormEnter {
          from { opacity: 0; transform: translateY(7px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ci-form-page-shell,
          .ci-form-action,
          .ci-form-action:hover,
          .ci-form-action:active {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }
        }
        @media print {
          .ci-form-shell-bg { background: #fff !important; }
          .ci-form-page { border: 0 !important; box-shadow: none !important; }
        }
      `}</style>
      <div
        data-form-shell
        className="ci-form-shell-bg fixed inset-0 z-[80] min-h-screen overflow-auto font-roboto text-[#263C3D]"
      >
        {effectiveSource === 'task' && !parentTaskId && !queryTaskId && (
          <div className={`no-print mx-auto ${maxW} px-4 md:px-8 pt-5`}>
            <div className="rounded-[12px] border border-rose-300 bg-rose-50 px-3 py-2 text-[12px] text-rose-800">
              <div className="font-semibold">Missing taskId — form/evidence/signature operations blocked.</div>
              <div className="mt-1 text-[11px]">
                event_id={effectiveEventContext || '—'} · form_id={content.id} · formSource=task
                <br />No parentTaskId or query task_id found. Backfill by linking this form to its CES event task.
              </div>
            </div>
          </div>
        )}
        {hasTaskLinkedContext && (
          <div className={`no-print mx-auto ${maxW} px-4 md:px-8 pt-5`}>
            <div className="rounded-[12px] border border-[#B8E9E7] bg-[#F0FBFB] px-3 py-2 text-[12px] text-[#004142]">
              <div className="font-semibold">Task-linked form context detected.</div>
              <div className="mt-1 text-[11px] text-[#426768]">
                event_id={queryEventIdV2 || effectiveEventContext || '—'} · task_id={queryTaskId || parentTaskId || '—'} · form_id={queryFormId || content.id} · policy_id={queryPolicyId || content.policies[0] || '—'} · workflow_id={queryWorkflowIdV2 || effectiveWorkflowContext || '—'} · requirement_id={queryRequirementId || '—'}
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => {
                    const eventForRoute = queryEventIdV2 || effectiveEventContext;
                    if (!eventForRoute) {
                      navigate('/calendar');
                      return;
                    }
                    const q = new URLSearchParams();
                    if (queryTaskId) q.set('task_id', queryTaskId);
                    if (queryRequirementId) q.set('requirement_id', queryRequirementId);
                    navigate(`/calendar/event/${encodeURIComponent(eventForRoute)}${q.toString() ? `?${q.toString()}` : ''}`);
                  }}
                  className="rounded-[8px] border border-[#B8E9E7] bg-white px-2 py-1 text-[11px] font-semibold text-[#00797D] hover:bg-[#E9FAFA]"
                >
                  Return to Event Task Workspace
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="no-print sticky top-0 z-20 px-4 pt-4 md:px-8">
          <div className={`ci-form-utility mx-auto ${maxW} rounded-[18px] px-4 py-3 md:px-5`}>
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/forms')}
                  className="ci-form-action flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#DDEBEB] bg-white/78 text-[#00797D] hover:border-[#B8E9E7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00797D]"
                  aria-label="Return to Forms Library"
                >
                  <ChevronLeft size={17} />
                </button>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#B8E9E7] bg-[#F0FBFB] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#00797D]">{content.id} · v{content.version}</span>
                    <span className="rounded-full border border-[#DDEBEB] bg-white/72 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#426768]">{content.type}</span>
                  </div>
                  <h1 className="mt-1 truncate font-montserrat text-lg font-semibold tracking-tight text-[#004142]">{content.title}</h1>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-[#607C7D]">
                    <span>{submitBusy ? 'Saving...' : submitMsg ? 'Saved just now' : 'Draft saved locally'}</span>
                    <span>{validationSummary}</span>
                    <span>{signerSummary}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="mr-1 min-w-[132px]">
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-[#607C7D]">
                    <span>Completion</span>
                    <span>{completionPercent}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#DDEBEB]">
                    <div className="h-full rounded-full bg-[#00797D] transition-[width] duration-[520ms]" style={{ width: `${completionPercent}%` }} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const target = formPaperRef.current?.querySelector<HTMLElement>('[data-testid="ecign-sign-btn"]');
                    target?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
                    target?.focus();
                  }}
                  className="ci-form-action flex items-center gap-2 rounded-full border border-[#B8E9E7] bg-white/78 px-3.5 py-2 text-[12px] font-semibold text-[#00797D] hover:bg-[#F0FBFB]"
                >
                  {hasSigned ? 'Signature Status' : 'Continue Signing'}
                </button>
            <button
              type="button"
              onClick={() => {
                if (hasSigned) {
                  handlePrint();
                  return;
                }
                printForm(content.id);
              }}
                  className="ci-form-action flex items-center gap-2 rounded-full bg-[#00797D] px-4 py-2 text-[12px] font-semibold text-white shadow-[0_14px_28px_-18px_rgba(0,121,112,0.8)] hover:bg-[#00696A]"
            >
                  <Printer size={14} /> Print Form
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
                    workflow_id:      effectiveWorkflowContext,
                    event_id:         effectiveEventContext,
                    form_id:          content.id,
                    form_instance_id: formInstanceId,
                    fields,
                    requires_signature: signatureEnabled && !hasSigned,
                    source_system:    'hhc',
                  });
                  setSubmitMsg(
                    `Saved as compliance evidence (${r.status}).`
                  );
                } catch (e) {
                  setSubmitErr((e as Error).message);
                } finally {
                  setSubmitBusy(false);
                }
              }}
              disabled={submitBusy}
                  className="ci-form-action flex items-center gap-2 rounded-full border border-[#DDEBEB] bg-white/78 px-3.5 py-2 text-[12px] font-semibold text-[#426768] hover:border-[#B8E9E7] hover:text-[#004142] disabled:opacity-50"
              title="Capture this form's current field values as compliance evidence."
            >
                  <ShieldCheck size={14} /> {submitBusy ? 'Saving...' : 'Save Evidence'}
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
                  className="ci-form-action flex items-center gap-2 rounded-full border border-[#DDEBEB] bg-white/78 px-3.5 py-2 text-[12px] font-semibold text-[#426768] hover:border-[#B8E9E7] hover:text-[#004142]"
            >
                  <Download size={14} /> Download
            </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submission status banner — MVP-P0-A11Y-001: announce save outcomes
            to screen readers via role+aria-live. Success uses polite (status),
            error uses assertive (alert) so it interrupts. */}
        {(submitMsg || submitErr) && (
          <div className={`no-print mx-auto ${maxW} px-4 md:px-8`}>
            {submitMsg && (
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="rounded-[8px] border border-emerald-300 bg-emerald-50 text-emerald-800 px-3 py-2 text-[12px] flex items-center justify-between"
              >
                <span>{submitMsg}</span>
                <button onClick={() => setSubmitMsg(null)} className="text-emerald-700 hover:text-emerald-900" title="Dismiss" aria-label="Dismiss">{'×'}</button>
              </div>
            )}
            {submitErr && (
              <div
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                className="rounded-[8px] border border-rose-300 bg-rose-50 text-rose-800 px-3 py-2 text-[12px] flex items-center justify-between"
              >
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
              className={`rounded-[10px] border bg-white px-4 py-3 shadow-xl ${enfmPolicyValidation.ok ? 'border-[#E5E4E3]' : 'border-rose-300'}`}
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

        {/* ── Screen document root ── */}
        <div ref={formRootRef} className={`screen-shell ci-form-page-shell mx-auto ${maxW} px-4 py-8 md:px-8`}>
          <div
            ref={formPaperRef}
            className="ci-form-viewer-paper ci-form-page form-page w-full rounded-[4px] px-8 py-10 md:px-12 md:py-14"
            style={{ backgroundColor: '#FFFFFF', color: '#263C3D' }}
          >
            <FormBody content={content} />
          </div>
        </div>
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
          parentTaskId={parentTaskId ?? queryTaskId ?? undefined}
          hhcEventId={effectiveEventContext}
          hhcWorkflowId={effectiveWorkflowContext}
          getPrintableFormHtml={getPrintableFormHtml}
          onConfirm={handleConfirmSign}
          onClose={handleCancelSign}
          onRequestSecond={handleRequestSecond}
          signerSlots={resolvedSignerSlots.length > 1 ? resolvedSignerSlots : undefined}
          signerIndex={activeSignerTask?.signerIndex ?? 1}
          totalSigners={resolvedSignerSlots.length || 1}
        />
      )}
    </SignatureCtx.Provider>
  );

  return typeof document === 'undefined'
    ? standaloneDocument
    : createPortal(standaloneDocument, document.body);
}

export default FormViewer;
