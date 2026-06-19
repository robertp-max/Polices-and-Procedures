import type { CSSProperties, ReactNode } from 'react';
import {
  resolveReferenceKindLabel,
  type ResolvedReferenceType,
} from '../lib/referenceRouting';
import { resolveIaReference, warnUnresolvedIaReference } from '../lib/referenceResolver';

export interface ReferenceLinkProps {
  id: string;
  isLight?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  typeOverride?: ResolvedReferenceType;
}

export function ReferenceLink({
  id,
  isLight,
  children,
  className,
  style,
  typeOverride,
}: ReferenceLinkProps) {
  const resolved = resolveIaReference({
    id,
    claimedType: typeOverride,
    source: 'ReferenceLink',
  });
  if (!resolved.resolved) {
    warnUnresolvedIaReference(resolved);
    return null;
  }
  const type: ResolvedReferenceType = resolved.resolvedType === 'appendix' ? 'viewer' : resolved.resolvedType;
  const label = resolveReferenceKindLabel(type);

  return (
    <a
      href={resolved.openRoute}
      target="_blank"
      rel="noopener noreferrer"
      title={`Open ${label}`}
      className={className}
      style={{
        color: isLight === undefined ? undefined : (isLight ? '#C74601' : '#FFC107'),
        textDecoration: 'underline',
        textUnderlineOffset: '2px',
        cursor: 'pointer',
        ...style,
      }}
    >
      {children ?? id}
    </a>
  );
}
