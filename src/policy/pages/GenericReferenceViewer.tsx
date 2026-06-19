import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader, SurfaceCard } from '@/policy/components/ui';
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
      <PageHeader
        eyebrow="REFERENCE"
        title={details.id}
        description={`Type: ${details.type}`}
      />
      <SurfaceCard padding="lg">
        <p className="text-sm text-[var(--v3-text-secondary)]">
          Viewer under construction. Content will render using live registry data.
        </p>
      </SurfaceCard>
    </div>
  );
}

export default GenericReferenceViewer;
