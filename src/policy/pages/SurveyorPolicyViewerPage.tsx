import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { PolicyLibraryDocumentView } from '@/policy/components/PolicyLibraryDocumentView';
import { achcSurveyByPolicyId } from '@/policy/data/achcSurveyProjection.generated';
import { getSupportRefsForPolicy } from '@/policy/data/achcSupportAnchors';

export function SurveyorPolicyViewerPage() {
  const navigate = useNavigate();
  const { policyId } = useParams<{ policyId: string }>();
  const decodedPolicyId = useMemo(() => decodeURIComponent(policyId ?? ''), [policyId]);
  const achcMeta = achcSurveyByPolicyId[decodedPolicyId] ?? null;

  return (
    <div className="h-full overflow-hidden bg-white">
      <div className="absolute right-4 top-4 z-[60]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <X size={14} /> Close
        </button>
      </div>
      <PolicyLibraryDocumentView
        policyId={decodedPolicyId}
        embedded
        achcContext={achcMeta
          ? {
              source: 'ACHC_MATRIX',
              metadata: achcMeta,
              supportRefs: getSupportRefsForPolicy(decodedPolicyId),
            }
          : undefined}
      />
    </div>
  );
}

export default SurveyorPolicyViewerPage;
