import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { PolicyViewer32 } from '@/policy/components/policy-viewer/PolicyViewer32';

export function SurveyorPolicyViewerPage() {
  const navigate = useNavigate();
  const { policyId } = useParams<{ policyId: string }>();
  const decodedPolicyId = useMemo(() => decodeURIComponent(policyId ?? ''), [policyId]);
  return (
    <div className="h-full overflow-hidden bg-[#0B0F15]">
      <div className="absolute right-4 top-4 z-[60]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded border border-[#cbd5e1] bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <X size={14} /> Close
        </button>
      </div>
      <PolicyViewer32
        policyId={decodedPolicyId}
        embedded
      />
    </div>
  );
}

export default SurveyorPolicyViewerPage;
