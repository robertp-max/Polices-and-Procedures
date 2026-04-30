import type { CSSProperties, ReactNode } from 'react';
import {
  resolveReferenceKindLabel,
  resolveReferenceRoute,
  type ResolvedReferenceType,
} from '../lib/referenceRouting';

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
  const resolved = resolveReferenceRoute(id);
  const type = typeOverride ?? resolved.type;
  const label = resolveReferenceKindLabel(type);

  return (
    <a
      href={resolved.route}
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
