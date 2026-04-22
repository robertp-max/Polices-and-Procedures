import { useNavigate } from 'react-router-dom';
import { WORKFLOW_GRAPH } from '@/policy/data/workflowGraph.generated';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import { CI, DOMAIN_META } from '../brand';

/* ══════════════════════════════════════════════════════════════════
   LinkedWorkflows — drop-in panel for Policy and Forms detail pages.

   Given a policyId OR formId, shows which workflows reference it.
   Uses the compiled workflow graph, not a parallel index.
   ══════════════════════════════════════════════════════════════════ */

interface Props {
  policyId?: string;
  formId?: string;
  roleMatch?: string;
  title?: string;
  max?: number;
}

export function LinkedWorkflows({ policyId, formId, roleMatch, title, max = 8 }: Props) {
  const navigate = useNavigate();

  const ids = new Set<string>();
  if (policyId) for (const id of (WORKFLOW_GRAPH.byPolicy[policyId] ?? [])) ids.add(id);
  if (formId)   for (const id of (WORKFLOW_GRAPH.byForm[formId]     ?? [])) ids.add(id);
  if (roleMatch) for (const id of (WORKFLOW_GRAPH.byRole[roleMatch]  ?? [])) ids.add(id);

  const list = Array.from(ids).slice(0, max).map((id) => WORKFLOWS[id]).filter(Boolean);
  if (list.length === 0) return null;

  return (
    <section
      style={{
        background: CI.paper,
        border: `1px solid ${CI.line}`,
        borderRadius: 8,
        padding: 16,
      }}
    >
      <div
        style={{
          fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 600,
          color: CI.muted, textTransform: 'uppercase', letterSpacing: 0.8,
          marginBottom: 10,
        }}
      >
        {title ?? 'Referenced in workflows'}
      </div>
      <div className="flex flex-col gap-1">
        {list.map((w) => (
          <button
            key={w.id}
            onClick={() => navigate(`/workflows/${w.id}`)}
            className="text-left flex items-center gap-3"
            style={{
              padding: '8px 10px',
              borderRadius: 6,
              fontFamily: 'Roboto, sans-serif',
              fontSize: 12,
              color: CI.ink,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = CI.lineSoft; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 10, fontWeight: 600, letterSpacing: 0.8,
                color: CI.teal, minWidth: 72,
              }}
            >
              {w.id}
            </span>
            <span className="flex-1 truncate" style={{ color: CI.ink }}>
              {w.title}
            </span>
            <span
              style={{
                fontSize: 10, letterSpacing: 0.6, color: CI.muted,
                fontFamily: 'Montserrat, sans-serif', textTransform: 'uppercase',
              }}
            >
              {DOMAIN_META[w.domain].name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
