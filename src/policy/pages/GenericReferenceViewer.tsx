import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  resolveReferenceKindLabel,
  resolveReferenceRoute,
} from '@/policy/pages/iAdministrator/lib/referenceRouting';

export function GenericReferenceViewer() {
  const { referenceId = '' } = useParams();

  const details = useMemo(() => {
    const resolved = resolveReferenceRoute(referenceId);
    return {
      id: referenceId,
      type: resolveReferenceKindLabel(resolved.type),
    };
  }, [referenceId]);

  return (
    <div className="min-h-full w-full px-6 md:px-8 py-6">
      <section
        className="rounded-2xl p-6 md:p-7"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E4E3',
          color: '#1F1C1B',
        }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-[0.24em]"
          style={{ color: '#C74601', fontFamily: "'JetBrains Mono', monospace" }}
        >
          Reference Viewer
        </p>
        <h1 className="mt-2 text-xl font-semibold" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
          {details.id}
        </h1>
        <p className="mt-2 text-sm" style={{ color: '#52404B' }}>
          Type: {details.type}
        </p>
        <p className="mt-4 text-sm" style={{ color: '#52404B' }}>
          Viewer under construction
        </p>
      </section>
    </div>
  );
}

export default GenericReferenceViewer;
