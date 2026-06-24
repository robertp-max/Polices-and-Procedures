import { Link } from 'react-router-dom';
import { ChevronRight, Search, AlertTriangle } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   Canonical, reusable Public Research card.
   ----------------------------------------------------------------------------
   Used EVERYWHERE public-source context is shown (live chat, seeded messages,
   walkthroughs, representative screens). It never exposes the internal research
   agent name. External results are always labelled UNTRUSTED EXTERNAL and kept
   visually separate from Brad's internal analysis.

   States:
   • no excerpt + no citations  → safe empty state
   • excerpt present, NO citations → UNVERIFIED PUBLIC RESEARCH (do not use)
   • excerpt + citations         → cited excerpt with sources + retrieval dates
   ═══════════════════════════════════════════════════════════════════════════ */

export interface PublicResearchCitation {
  label: string;
  source?: string;
  url?: string;
  retrievedAt?: string; // ISO date — retrieval date is required for trusted use
}

export interface PublicResearchCardProps {
  /** A cited excerpt of external public-source context, if one exists. */
  excerpt?: string;
  /** Citations backing the excerpt. Required for the excerpt to be trustworthy. */
  citations?: PublicResearchCitation[];
  /** Destination for "Review to learn more →". Defaults to the Brad help article. */
  reviewTo?: string;
}

export const SAFE_EMPTY_STATE =
  'No public research result has been attached yet. Ask Brad to validate this topic against Care Indeed policies and request cited public research if needed.';

export function PublicResearchCard({ excerpt, citations, reviewTo = '/help/brad-how-brad-works' }: PublicResearchCardProps) {
  const hasExcerpt = !!excerpt && excerpt.trim().length > 0;
  const hasCitations = !!citations && citations.length > 0;
  const unverified = hasExcerpt && !hasCitations;

  return (
    <section
      className="relative overflow-hidden rounded-lg border border-hairline bg-tone-teal-bg p-lg shadow-rest"
      aria-label="Public regulatory research"
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-brand-teal" />

      <div className="flex items-center gap-2 text-brand-teal">
        <Search aria-hidden className="h-icon-sm w-icon-sm" />
        <h3 className="text-tag font-medium uppercase tracking-tag">Public Regulatory Research</h3>
      </div>
      <p className="mt-0.5 pl-7 text-tag uppercase tracking-tag text-muted">
        External public-source review. No patient data. No internal records.
      </p>

      {/* Body: cited excerpt, unverified notice, or safe empty state */}
      <div className="mt-md text-sm font-light leading-relaxed text-ink">
        {unverified ? (
          <div className="rounded-md border border-tone-orange-border bg-tone-orange-bg p-md">
            <p className="text-tag font-medium uppercase tracking-tag text-tone-orange-text">Unverified Public Research</p>
            <p className="mt-1 text-sm text-tone-orange-text">No citations returned. Do not use for compliance action.</p>
            {hasExcerpt && <p className="mt-2 whitespace-pre-wrap text-ink">{excerpt}</p>}
          </div>
        ) : hasExcerpt ? (
          <>
            <p className="whitespace-pre-wrap">{excerpt}</p>
            <ul className="mt-md grid gap-1.5">
              {citations!.map((c, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className="rounded border border-hairline bg-surface px-1.5 py-0.5 text-[10px]">Source</span>
                  {c.url ? (
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-teal hover:underline">
                      {c.label}
                    </a>
                  ) : (
                    <span className="font-medium text-ink">{c.label}</span>
                  )}
                  {c.source && <span>— {c.source}</span>}
                  {c.retrievedAt && <span className="text-[11px]">retrieved {new Date(c.retrievedAt).toLocaleDateString()}</span>}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-muted">{SAFE_EMPTY_STATE}</p>
        )}
      </div>

      {/* Untrusted-external footer — always shown */}
      <div className="mt-md flex items-start gap-2.5 rounded-md border border-tone-orange-border bg-tone-orange-bg p-md">
        <AlertTriangle aria-hidden className="mt-0.5 h-icon-sm w-icon-sm shrink-0 text-brand-orange" />
        <div>
          <p className="text-tag font-medium uppercase tracking-tag text-tone-orange-text">Untrusted External Research</p>
          <p className="text-xs leading-snug text-tone-orange-text">
            Public-source context only. Brad must validate internally before action.
          </p>
        </div>
      </div>

      <Link
        to={reviewTo}
        className="mt-md inline-flex w-fit items-center gap-1 text-xs font-medium text-brand-teal hover:underline focus-visible:outline-none focus-visible:shadow-focus"
      >
        Review to learn more <ChevronRight aria-hidden className="h-3.5 w-3.5" />
      </Link>
    </section>
  );
}

export default PublicResearchCard;
