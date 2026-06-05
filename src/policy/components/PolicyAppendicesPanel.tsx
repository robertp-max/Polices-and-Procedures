import { useMemo, useState } from 'react';
import { ExternalLink, LayoutList, Printer } from 'lucide-react';
import { FormViewer } from '@/policy/components/FormViewer';
import { VeilModal } from '@/policy/components/ui/VeilModal';
import { printForm } from '@/policy/utils/printForm';
import { getFormsForPolicy } from '@/policy/utils/policyFormLinks';

export type ExtraAppendix = {
  id: string;
  title: string;
  label?: string;
  render: React.ReactNode;
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

export function PolicyAppendicesPanel({
  policyId,
}: {
  policyId: string;
  extraAppendices?: ExtraAppendix[];
}) {
  const forms = useMemo(() => getFormsForPolicy(policyId), [policyId]);
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const active = forms.find(form => form.id === activeFormId) ?? null;

  if (forms.length === 0) {
    return (
      <div className="rounded-xl border border-[#E5E4E3] bg-[#FAFBF8] p-8 text-center">
        <LayoutList className="mx-auto mb-4 text-[#E5E4E3]" size={48} />
        <p className="text-lg font-montserrat font-bold text-[#9E9D9A]">No appendices linked</p>
        <p className="text-sm text-[#9E9D9A] mt-2">No forms are currently attached to this policy.</p>
      </div>
    );
  }

  return (
    <section className="appendices-panel max-w-[1200px] animate-fadeIn relative pb-12">
      <div className="no-print mb-6">
        <h2 className="font-montserrat font-semibold text-[13px] tracking-[0.22em] uppercase text-[#1F1C1B] mb-3 flex items-center w-full">
          <LayoutList className="mr-3 shrink-0 text-[#007970]" size={20} />
          <span className="shrink-0">Appendices</span>
          <span className="flex-grow h-px bg-[#007970] ml-4" />
        </h2>
        <p className="font-roboto text-sm text-[#524048] max-w-3xl">
          Attached appendix forms open from the live Enterprise Forms Library in a centered viewer modal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {forms.map((form, idx) => (
          <button
            key={form.id}
            type="button"
            onClick={() => setActiveFormId(form.id)}
            className="text-left rounded-xl border border-[#E5E4E3] bg-white p-4 shadow-sm hover:border-[#007970]/50 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#007970]/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#007970] mb-2">
                  Appendix {appendixCode(idx)} · {form.id}
                </div>
                <h3 className="font-montserrat text-sm font-bold text-[#1F1C1B] leading-snug">{form.name || form.id}</h3>
                <p className="mt-2 font-roboto text-[11px] uppercase tracking-[0.14em] text-[#747470]">
                  {form.type} · {form.frequency}
                </p>
              </div>
              <span className="rounded-full border border-[#007970]/30 bg-[#007970]/10 px-2 py-1 font-mono text-[10px] text-[#007970]">
                Attached
              </span>
            </div>
            <span className="mt-4 inline-flex items-center gap-2 font-roboto text-xs font-semibold text-[#007970]">
              Open attached form <ExternalLink size={12} aria-hidden="true" />
            </span>
          </button>
        ))}
      </div>

      <VeilModal
        open={Boolean(active)}
        onClose={() => setActiveFormId(null)}
        size="xl"
        eyebrow={active?.id}
        title={active?.name || 'Attached appendix form'}
        headerActions={active && (
          <button
            type="button"
            onClick={() => printForm(active.id)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 hover:border-[#007970]/60 hover:bg-[#007970]/15 transition-colors"
          >
            <Printer size={14} /> Print Form
          </button>
        )}
      >
        {active && (
          <div className="max-h-[72vh] overflow-y-auto rounded-xl bg-white p-4">
            <FormViewer formId={active.id} enableEmbeddedSigning formSource="policy_viewer" />
          </div>
        )}
      </VeilModal>
    </section>
  );
}
