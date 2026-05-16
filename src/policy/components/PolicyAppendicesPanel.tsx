import { useMemo, useState } from 'react';
import { LayoutList, Printer } from 'lucide-react';
import { FormViewer } from '@/policy/components/FormViewer';
import { printForm } from '@/policy/utils/printForm';
import { getFormsForPolicy } from '@/policy/utils/policyFormLinks';

export type ExtraAppendix = {
  id: string;
  title: string;
  label?: string;
  render: React.ReactNode;
  printAction?: () => void;
};

type AppendixItem = {
  key: string;
  appendixLabel: string;
  sidebarLabel: string;
  title: string;
  formId?: string;
  render?: React.ReactNode;
  printAction?: () => void;
};

function appendixCode(index: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let n = index;
  let out = '';
  do {
    out = alphabet[n % 26] + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return out;
}

function shortLabel(title: string): string {
  return title.replace(/\bform\b/gi, '').replace(/\s+/g, ' ').trim();
}

function buildAppendices(policyId: string, extraAppendices: ExtraAppendix[]): AppendixItem[] {
  const forms = getFormsForPolicy(policyId);
  const formItems: AppendixItem[] = forms.map((form, idx) => {
    const code = appendixCode(idx);
    const label = `Appendix ${code}`;
    const shortTitle = shortLabel(form.name || form.id);
    return {
      key: `form:${form.id}`,
      appendixLabel: label,
      sidebarLabel: `Appx ${code}: ${shortTitle}`,
      title: form.name || form.id,
      formId: form.id,
      printAction: () => printForm(form.id),
    };
  });

  const offset = formItems.length;
  const extras: AppendixItem[] = extraAppendices.map((appx, idx) => {
    const code = appendixCode(offset + idx);
    const label = `Appendix ${code}`;
    const shortTitle = shortLabel(appx.label || appx.title);
    return {
      key: `custom:${appx.id}`,
      appendixLabel: label,
      sidebarLabel: `Appx ${code}: ${shortTitle}`,
      title: appx.title,
      render: appx.render,
      printAction: appx.printAction,
    };
  });

  return [...formItems, ...extras];
}

export function PolicyAppendicesPanel({
  policyId,
  extraAppendices = [],
}: {
  policyId: string;
  extraAppendices?: ExtraAppendix[];
}) {
  const items = useMemo(
    () => buildAppendices(policyId, extraAppendices),
    [policyId, extraAppendices],
  );

  const [activeIdx, setActiveIdx] = useState(0);
  const active = items[Math.min(activeIdx, items.length - 1)];

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-[#E5E4E3] bg-[#FAFBF8] p-8 text-center">
        <LayoutList className="mx-auto mb-4 text-[#E5E4E3]" size={48} />
        <p className="text-lg font-montserrat font-bold text-[#9E9D9A]">No appendices linked</p>
        <p className="text-sm text-[#9E9D9A] mt-2">No forms are currently attached to this policy.</p>
      </div>
    );
  }

  return (
    <section className="flex flex-col md:flex-row gap-12 animate-fadeIn relative pb-12 max-w-[1200px]">
      <div className="w-full md:w-64 flex-shrink-0 no-print">
        <div className="sticky top-6">
          <h2 className="font-montserrat font-semibold text-[13px] tracking-[0.22em] uppercase text-[#1F1C1B] mb-6 flex items-center w-full">
            <LayoutList className="mr-3 shrink-0 text-[#007970]" size={20} />
            <span className="shrink-0">Appendices</span>
            <span className="flex-grow h-px bg-[#007970] ml-4" />
          </h2>

          <div className="flex flex-col">
            {items.map((appx, idx) => (
              <button
                key={appx.key}
                onClick={() => setActiveIdx(idx)}
                className={`text-left px-4 py-3 font-montserrat font-semibold text-[13px] transition-all duration-200 border-l-[3px] ${
                  idx === activeIdx
                    ? 'text-[#C74601] border-[#C74601] bg-white'
                    : 'bg-white text-[#524048] border-transparent hover:text-[#1F1C1B] hover:border-[#E5E4E3]'
                }`}
                title={appx.title}
              >
                {appx.sidebarLabel}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-2">
            {active?.printAction && (
              <button
                onClick={active.printAction}
                className="flex items-center gap-2 text-[#524048] font-montserrat font-semibold text-[12px] hover:text-[#1F1C1B] transition-colors"
              >
                <Printer size={14} /> Print Form
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="appendices-panel flex-1 relative min-h-[600px] max-h-[80vh] overflow-hidden rounded-[8px] border border-[#E5E4E3] bg-white">
        <div className="pointer-events-none absolute top-0 inset-x-0 h-20 z-10 no-print bg-gradient-to-b from-white to-transparent" />

        <div className="appendices-scroll w-full h-full overflow-y-auto">
          {active.formId ? (
            <FormViewer formId={active.formId} enableEmbeddedSigning />
          ) : (
            <div className="px-6 py-6">
              <p className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-[#747470]">{active.appendixLabel}</p>
              <h3 className="font-montserrat text-lg font-bold text-[#1F1C1B] mt-1 mb-4">{active.title}</h3>
              <div>{active.render}</div>
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-20 z-10 no-print bg-gradient-to-t from-white to-transparent" />
      </div>
    </section>
  );
}
