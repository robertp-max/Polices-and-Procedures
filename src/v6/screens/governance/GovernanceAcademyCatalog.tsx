import { useEffect, useState } from 'react';
import { ArrowUpRight, Clock3, Layers3, LockKeyhole, ShieldCheck } from 'lucide-react';
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

  useEffect(() => {
    const controller = new AbortController();
    GovernanceApi.academyCatalog(controller.signal)
      .then(setCatalog)
      .catch((reason: GovernanceApiError) => {
        if (reason?.code !== 'AbortError') setError(reason);
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
    <section className="gb-academy-grid" aria-label="Governance Institute modules">
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
  );
}
