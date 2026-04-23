import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Printer, Download, Building2, User, Briefcase, HeartPulse, Info } from 'lucide-react';
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
const CI_MID    = '#52404B';
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
function Field({ f, sig = false }: { f: FormField; sig?: boolean }) {
  const colSpan =
    { 1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4' }[
      f.col ?? 2
    ];

  const labelCls = LABEL_CLS + (sig ? ' min-h-[2.6em]' : '');
  const inputCls = sig ? SIG_INPUT_CLS : INPUT_CLS;

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
          className={
            INPUT_CLS +
            ' h-auto min-h-[70px] resize-y pt-2 leading-relaxed'
          }
        />
      ) : f.type === 'select' ? (
        <select className={INPUT_CLS}>
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
          className="w-5 h-5 accent-[#007970] mt-1"
        />
      ) : f.type === 'radio' ? (
        <div className="flex gap-4 flex-wrap mt-1">
          {f.options?.map(o => (
            <label key={o} className="flex items-center gap-2 text-[12px]">
              <input
                type="radio"
                name={f.label}
                className="w-4 h-4 accent-[#007970]"
              />{' '}
              {o}
            </label>
          ))}
        </div>
      ) : f.type === 'signature' ? (
        // Dashed line — same h-8 as the sig inputs so all three columns
        // have identical underline heights
        <div className={SIG_DASHED_CLS} />
      ) : (
        <input
          type={f.type}
          placeholder={f.placeholder}
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
            <Field key={i} f={f} />
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
            <Field key={i} f={f} sig />
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

            {content.policies.length > 0 && (
              <div>
                <span
                  className="block font-montserrat font-semibold text-[10px] tracking-[0.16em] uppercase mb-2"
                  style={{ color: CI_MUTED }}
                >
                  Linked Policy IDs
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {content.policies.map(p => (
                    <span
                      key={p}
                      className="inline-block font-roboto font-medium text-xs px-3 py-1.5 rounded-[4px]"
                      style={{ background: '#E5FEFF', color: CI_TEAL }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
export function FormViewer({ formId }: { formId?: string }) {
  const { formId: routeId } = useParams();
  const navigate = useNavigate();
  // If formId prop is supplied → embedded inside a parent panel (no shell)
  const isEmbedded = formId !== undefined;
  const id = formId ?? routeId;
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

  if (!id) return null;
  if (!content) {
    return (
      <div className={`flex items-center justify-center ${isEmbedded ? 'w-full h-full' : 'min-h-screen bg-[#F2F2F0]'}`}>
        <div className="p-8 text-center">
          <h2 className="font-montserrat font-bold text-xl" style={{ color: CI_INK }}>Form Not Found</h2>
          <p className="font-roboto text-sm text-[#747470] mt-2">Form ID "{id}" is not in the Enterprise Forms Library.</p>
          {!isEmbedded && (
            <button
              onClick={() => navigate('/forms')}
              className="mt-4 px-4 py-2 rounded-[8px] bg-[#007970] text-white font-roboto text-sm hover:bg-[#005751] transition-colors"
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
      <div
        className="w-full h-full overflow-y-auto px-8 py-8 md:px-10 md:py-10"
        style={{ color: CI_INK, fontFamily: "'Roboto','Open Sans',sans-serif" }}
      >
        <FormBody content={content} isEmbedded={true} />
      </div>
    );
  }

  // ── STANDALONE MODE: full shell with action bar + paper card ─────────────
  const orientation = content.orientation;
  const maxW = orientation === 'landscape' ? 'max-w-[11in]' : 'max-w-[8.5in]';

  return (
    <div
      className="min-h-screen overflow-auto"
      style={{ background: '#F2F2F0', fontFamily: "'Roboto','Open Sans',sans-serif" }}
    >
      {/* ── No-print action bar ── */}
      <div className={`no-print flex items-center justify-between px-6 md:px-10 pt-5 pb-3 mx-auto ${maxW}`}>
        <button
          type="button"
          onClick={() => navigate('/forms')}
          className="flex items-center gap-2 font-roboto text-[12px] font-semibold text-[#1F1C1B] hover:text-[#007970] transition-colors"
        >
          <ChevronLeft size={15} /> Return to Forms Library
        </button>
        <div className="flex items-center gap-3">
          <span className="font-roboto text-[11px] text-[#747470] font-mono">{content.id} · v{content.version}</span>
          <button
            type="button"
            onClick={() => printForm(content.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#007970] hover:bg-[#005751] text-white font-roboto text-[12px] font-semibold transition-colors"
          >
            <Printer size={14} /> Print
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
            className="flex items-center gap-2 px-4 py-2 rounded-[8px] border border-[#E5E4E3] text-[#1F1C1B] font-roboto text-[12px] font-semibold hover:bg-white transition-colors"
          >
            <Download size={14} /> Download
          </button>
        </div>
      </div>

      {/* ── Screen shell (paper gutter) ── */}
      <div className={`screen-shell mx-auto ${maxW} px-4 py-6 md:px-8 md:py-10`}>
        <div
          className="form-page bg-white border border-[#E5E4E3] rounded-[12px] shadow-sm px-8 py-10 md:px-12 md:py-14"
          style={{ color: CI_INK }}
        >
          <FormBody content={content} />
        </div>
      </div>{/* end screen-shell */}
    </div>
  );
}

export default FormViewer;
