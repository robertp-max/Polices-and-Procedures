import { Fragment } from 'react';
import { ReferenceLink } from './ReferenceLink';
import { extractReferenceIds } from '../lib/referenceRouting';

const REFERENCE_CAPTURE = /(\b[A-Z]{2,}(?:-[A-Z0-9]{2,}){1,4}-\d{3,}\b)/g;

export function ReferenceText({
  text,
  isLight,
}: {
  text: string;
  isLight: boolean;
}) {
  if (!text) return null;

  const ids = extractReferenceIds(text);
  if (ids.length === 0) return <>{text}</>;

  const parts = text.split(REFERENCE_CAPTURE);
  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;
        if (ids.includes(part)) {
          return (
            <ReferenceLink key={`${part}-${index}`} id={part} isLight={isLight}>
              {part}
            </ReferenceLink>
          );
        }
        return <Fragment key={`text-${index}`}>{part}</Fragment>;
      })}
    </>
  );
}
