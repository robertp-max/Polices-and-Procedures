import { useRef } from 'react';
import {
  ArrowUpRight,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { MODULES } from './academyData';
import { canonicalTitle } from './moduleTitles';
import type { AcademyModuleSummary } from './academyTypes';
import './AcademyCarousel.css';

export interface AcademyCarouselProps {
  /**
   * Called with the module id (e.g. "GB-001", "GB-CAPSTONE") when a card is activated.
   * The parent owns navigation — it should wire this to the existing V2 player launch
   * (see gb-academy/Academy.tsx, which already routes GB-003 to MeetingModule and every
   * other id to ExecutiveModule). This component never renders lesson content itself.
   */
  onOpen: (moduleId: string) => void;
}

const COVER_SUFFIX: Record<string, string> = {
  'GB-001': 'authority',
  'GB-002': 'structure',
  'GB-003': 'meetings',
  'GB-004': 'leadership',
  'GB-005': 'qapi',
  'GB-006': 'compliance',
  'GB-007': 'fiscal',
  'GB-008': 'strategy',
  'GB-009': 'risk',
  'GB-010': 'contracts',
  'GB-011': 'survey',
  'GB-012': 'ethics',
};

/**
 * Local copy of V1's GovernanceAcademyCatalog.coverFor(). Kept independent on purpose —
 * this carousel renders its own card design from the same /public/gb-visuals assets and
 * must not import from the V1 catalog module.
 */
function coverFor(moduleId: string): string {
  if (moduleId === 'GB-CAPSTONE') return '/gb-visuals/gb-capstone-pressure.png';
  const suffix = COVER_SUFFIX[moduleId];
  return `/gb-visuals/${moduleId.toLowerCase()}-${suffix ?? 'authority'}.png`;
}

/**
 * Mirrors Academy.tsx's readCompletion() so a card can offer "Review lab" once a local
 * practice attempt has been submitted. Best-effort read of localStorage — never throws,
 * and returns false in any environment without a window (SSR-safe).
 */
function readCompletion(moduleId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const key = `care-indeed:${moduleId.toLowerCase()}:academy:v3`;
    return Boolean(JSON.parse(localStorage.getItem(key) || '{}').submitted);
  } catch {
    return false;
  }
}

/**
 * Horizontal, scroll-snapped cover-thumbnail carousel for the 13 Governing Body Academy
 * modules (GB-001…GB-012 + GB-CAPSTONE). Visually modeled on V1's GovernanceAcademyCatalog
 * carousel, rebuilt against the V2 MODULES summary data (academyData.ts) so it can live
 * inside the v33 premium office. Fully self-contained: it reads its own data, renders its
 * own cards, and only ever calls onOpen(moduleId) — the parent is responsible for actually
 * launching the existing player.
 */
export function AcademyCarousel({ onOpen }: AcademyCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Instant scroll on purpose: this app's smooth scrollIntoView/scrollTo silently no-ops
  // on some scrollers, so — like V1 — the track is moved by ~85% of its own width per click.
  const scrollTrack = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.85) });
  };

  return (
    <div className="gb-academy-carousel">
      <div className="gb-academy-carousel-head">
        <div className="gb-academy-carousel-lead">
          <GraduationCap size={16} aria-hidden="true" />
          <div>
            <strong>Select a case to begin.</strong>
            <small>12 executive case laboratories + 1 integrated capstone.</small>
          </div>
        </div>
        <div className="gb-academy-carousel-nav">
          <button type="button" className="gb-carousel-arrow" onClick={() => scrollTrack(-1)} aria-label="Previous modules">
            <ChevronLeft aria-hidden="true" />
          </button>
          <button type="button" className="gb-carousel-arrow" onClick={() => scrollTrack(1)} aria-label="More modules">
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="gb-academy-grid" ref={trackRef} role="list" aria-label="Governing Body Academy modules">
        {MODULES.map((module) => (
          <AcademyCarouselCard key={module.id} module={module} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

function AcademyCarouselCard({ module, onOpen }: { module: AcademyModuleSummary; onOpen: (moduleId: string) => void }) {
  const capstone = module.id === 'GB-CAPSTONE';
  const title = canonicalTitle(module.id) ?? module.title;
  const completed = readCompletion(module.id);
  const tagCount = module.achc.length;

  return (
    <article className={`gb-academy-card ${capstone ? 'capstone' : ''}`} role="listitem">
      <button
        type="button"
        className="gb-academy-card-hit"
        onClick={() => onOpen(module.id)}
        aria-label={`${completed ? 'Review' : 'Open'} ${module.id}: ${title}`}
      >
        <div className="gb-academy-card-image">
          <img src={coverFor(module.id)} alt="" loading="lazy" />
          <span>{capstone ? 'FINAL' : String(module.sequence).padStart(2, '0')}</span>
        </div>
        <div className="gb-academy-card-body">
          <div className="gb-academy-meta">
            <span>{module.id}</span>
            <span>{module.domain}</span>
          </div>
          <h3>{title}</h3>
          <div className="gb-academy-facts">
            <span><Clock3 aria-hidden="true" /> {module.duration}</span>
            <span><BookOpenCheck aria-hidden="true" /> {module.difficulty}</span>
            <span><ShieldCheck aria-hidden="true" /> {tagCount} ACHC crosswalk {tagCount === 1 ? 'tag' : 'tags'}</span>
          </div>
          <span className="gb-academy-card-cta">
            {completed ? 'Review lab' : 'Open executive lab'}
            <ArrowUpRight aria-hidden="true" />
          </span>
        </div>
      </button>
    </article>
  );
}

export default AcademyCarousel;
