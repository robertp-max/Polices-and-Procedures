/**
 * GVGBAppendixPrint.tsx
 * /print/GV-GB-001/appendix/:appendixId resolves to a Forms Library form using the
 * same policy→forms linkage as PolicyAppendicesPanel (getFormsForPolicy), then
 * reuses the canonical form print route (FormPrintView + FormBody + printForm.ts).
 */
import { useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { getFormsForPolicy } from '@/policy/utils/policyFormLinks';

const GVGB_POLICY_ID = 'GV-GB-001';

function appendixLetterFromIndex(index: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let n = index;
  let out = '';
  do {
    out = alphabet[n % 26] + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return out;
}

/** :appendixId may be a form id (e.g. GV-FM-011) or an appendix letter (A, B, …) matching getFormsForPolicy order. */
function resolveAppendixToFormId(raw: string | undefined): string | null {
  if (!raw) return null;
  const decoded = decodeURIComponent(raw.trim());
  const forms = getFormsForPolicy(GVGB_POLICY_ID);
  const direct = forms.find(f => f.id === decoded);
  if (direct) return direct.id;

  const upper = decoded.toUpperCase();
  if (/^[A-Z]$/.test(upper)) {
    const i = upper.charCodeAt(0) - 65;
    return forms[i]?.id ?? null;
  }

  const idx = forms.findIndex((_, i) => appendixLetterFromIndex(i) === upper);
  return idx >= 0 ? forms[idx]!.id : null;
}

export function GVGBAppendixPrint() {
  const { appendixId } = useParams<{ appendixId: string }>();
  const formId = useMemo(() => resolveAppendixToFormId(appendixId), [appendixId]);

  if (!formId) {
    return (
      <div className="min-h-screen bg-white p-10 font-roboto text-sm text-[#524048]">
        <p className="font-montserrat font-semibold text-[#1F1C1B] mb-2">Appendix not found</p>
        <p>No linked form matches this appendix parameter for GV-GB-001.</p>
      </div>
    );
  }

  return <Navigate to={`/forms/${encodeURIComponent(formId)}/print`} replace />;
}

export default GVGBAppendixPrint;
