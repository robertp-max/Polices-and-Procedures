import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Clock3, Layers3, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  GovernanceApi,
  type AcademyAssignmentView,
  type AcademyCatalogItem,
  type GovernanceApiError,
} from './governanceApi';

interface GovernanceAcademyCatalogProps {
  assignments: AcademyAssignmentView[];
}

function coverFor(moduleId: string): string {
  return moduleId === 'GB-CAPSTONE'
    ? '/gb-visuals/gb-capstone-pressure.png'
    : `/gb-visuals/${moduleId.toLowerCase()}-${({
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
    } as Record<string, string>)[moduleId]}.png`;
}

export function GovernanceAcademyCatalog({ assignments }: GovernanceAcademyCatalogProps) {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<AcademyCatalogItem[]>([]);
  const [error, setError] = useState<GovernanceApiError | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Instant scroll (the app's smooth-scroll is inert on some scrollers) by ~85% of the viewport.
  const scrollTrack = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.85) });
  };

  useEffect(() => {
    const controller = new AbortController();
    GovernanceApi.academyCatalog(controller.signal)
      .then(setCatalog)
      .catch((reason: unknown) => {
        // Ignore fetch aborts (StrictMode double-mount / unmount) — a raw DOMException
        // named 'AbortError', not a GovernanceApiError with a code. Matches GovernanceOffice.
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
        setError(reason as GovernanceApiError);
      });
    return () => controller.abort();
  }, []);

  if (error) {
    return (
      <section className="gb-unavailable" role="status">
        <LockKeyhole aria-hidden="true" />
        <div>
          <strong>The Governance Institute is unavailable.</strong>
          <p>{error.message}</p>
        </div>
      </section>
    );
  }

  return (
    <div className="gb-academy-carousel">
      <button type="button" className="gb-carousel-arrow gb-carousel-prev" onClick={() => scrollTrack(-1)} aria-label="Previous modules"><ChevronLeft aria-hidden="true" /></button>
      <button type="button" className="gb-carousel-arrow gb-carousel-next" onClick={() => scrollTrack(1)} aria-label="More modules"><ChevronRight aria-hidden="true" /></button>
      <section className="gb-academy-grid" ref={trackRef} aria-label="Governance Institute modules">
      {catalog.map((module) => {
        const assignment = assignments.find((candidate) => candidate.moduleId === module.id);
        const href = assignment
          ? `/governance/academy/modules/${module.id}?assignment=${encodeURIComponent(assignment.id)}`
          : `/governance/academy/modules/${module.id}`;
        return (
          <article className="gb-academy-card" key={module.id}>
            <div className="gb-academy-card-image">
              <img src={coverFor(module.id)} alt="" loading="lazy" />
              <span>{String(module.sequence).padStart(2, '0')}</span>
            </div>
            <div className="gb-academy-card-body">
              <div className="gb-academy-meta">
                <span>{module.id}</span>
                <span>{assignment?.status ?? 'Not assigned'}</span>
              </div>
              <h3>{module.title}</h3>
              <p>{module.domain}</p>
              <div className="gb-academy-facts">
                <span><Layers3 aria-hidden="true" /> {module.sceneCount} guided scenes</span>
                <span><Clock3 aria-hidden="true" /> {module.durationMinutes} min</span>
                <span><ShieldCheck aria-hidden="true" /> Server assessed</span>
              </div>
              <button type="button" onClick={() => navigate(href)}>
                {assignment ? 'Enter module' : 'Preview syllabus'}
                <ArrowUpRight aria-hidden="true" />
              </button>
            </div>
          </article>
        );
      })}
      </section>
    </div>
  );
}
