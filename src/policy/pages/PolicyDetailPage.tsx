import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PolicyViewer32 } from '@/policy/components/policy-viewer/PolicyViewer32';
import { usePolicyStore } from '@/policy/stores/policyStore';

export function PolicyDetailPage() {
  const params = useParams<{ policyId: string }>();
  const navigate = useNavigate();
  const policyId = params.policyId;

  const policy = usePolicyStore((state) =>
    state.policies.find((item) => item.id === policyId),
  );

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [policyId]);

  if (!policy) {
    return (
      <div className="rounded-xl border border-rose-400/40 bg-rose-50 p-6 text-sm text-rose-700 font-roboto">
        Policy not found.
      </div>
    );
  }

  return (
    <PolicyViewer32
      policyId={policy.id}
      embedded={false}
      onBack={() => navigate('/library')}
    />
  );
}
