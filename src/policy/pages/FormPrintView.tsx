import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, Printer } from 'lucide-react';
import { buildFormContent } from '@/policy/data/formsLibraryContent';
import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';
import { FormBody } from '@/policy/components/FormViewer';

export function FormPrintView() {
  const { formId } = useParams<{ formId: string }>();

  const content = useMemo(() => {
    if (!formId) return null;
    const rec = FORMS_DATASET.find(f => f.id === formId);
    return rec ? buildFormContent(rec) : null;
  }, [formId]);

  useEffect(() => {
    if (!content) return;
    const prev = document.title;
    document.title = `${content.id} — ${content.title}`;
    // When embedded in the hidden print iframe (window !== window.top), the
    // parent frame drives the print dialog via printForm(). Skip the
    // auto-print to avoid double dialogs.
    const isEmbedded = typeof window !== 'undefined' && window.top !== window.self;
    const timer = isEmbedded ? 0 : window.setTimeout(() => window.print(), 700);
    return () => {
      if (timer) window.clearTimeout(timer);
      document.title = prev;
    };
  }, [content]);

  if (!content) {
    return (
      <div className="min-h-screen bg-white p-8 text-[#1F1C1B] font-roboto">
        <h1 className="font-montserrat text-xl font-semibold">Form not found</h1>
        <p className="mt-2 text-sm text-[#524048]">Form ID: {formId}</p>
      </div>
    );
  }

  const paperWidth = content.orientation === 'landscape' ? '11in' : '8.5in';

  return (
    <div className="min-h-screen bg-[#F2F2F0] font-roboto text-[#1F1C1B]">
      <style>{`
        @page { size: Letter ${content.orientation === 'landscape' ? 'landscape' : 'portrait'}; margin: 0.5in; }

        @media print {
          html, body { background: #FFFFFF !important; margin: 0 !important; padding: 0 !important; }
          .screen-shell { background: #FFFFFF !important; padding: 0 !important; margin: 0 !important; max-width: none !important; }
          .form-frame {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
            width: 100% !important;
            background: #FFFFFF !important;
          }
          .no-print { display: none !important; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            transition: none !important;
          }
          /* Tables — fixed layout prevents right-edge truncation */
          .form-frame table {
            table-layout: fixed !important;
            width: 100% !important;
            max-width: 100% !important;
            border-collapse: collapse !important;
          }
          .form-frame table th,
          .form-frame table td {
            word-break: break-word !important;
            overflow-wrap: anywhere !important;
            white-space: normal !important;
          }
          .avoid-break { break-inside: avoid; page-break-inside: avoid; }
          thead { display: table-header-group; }
          tr, td, th { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      <div className="fixed top-0 left-0 right-0 bg-white border-b border-[#E5E4E3] z-50 p-4 shadow-sm flex justify-between items-center no-print">
        <button
          onClick={() => window.close()}
          className="flex items-center gap-2 text-[#524048] font-montserrat font-semibold text-xs uppercase tracking-wider hover:text-[#1F1C1B]"
        >
          <ChevronLeft size={14} /> Close
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-[#007970] text-white px-5 py-2 rounded-lg font-montserrat font-bold text-xs uppercase tracking-wider hover:bg-[#004142] transition-colors shadow-sm"
        >
          <Printer size={16} /> Save to PDF / Print
        </button>
      </div>

      <div className="screen-shell mx-auto px-4 py-8 md:px-8 md:py-12 pt-24" style={{ maxWidth: paperWidth }}>
        <div className="form-frame bg-white border border-[#E5E4E3] rounded-[12px] shadow-sm px-8 py-10 md:px-12 md:py-14">
          <FormBody content={content} />
        </div>
      </div>
    </div>
  );
}

export default FormPrintView;
