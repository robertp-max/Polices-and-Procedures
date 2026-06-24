/* Runtime badge for the Brad UI. Reflects the VERIFIED runtime state — never
   shows "PHI Enabled" merely because an env var exists; the value must come from
   BradRuntime.describe() (server-evaluated readiness gate).

   NOTE: the interactive Brad / iAdministrator chat UI was pruned on the
   `evidence` branch (only a static BradScreen remains), so this component is
   provided as a ready-to-mount, dependency-free unit rather than wired in. */

export type AgentRuntimeBadgeValue =
  | 'MVP Harness — Mock Data'
  | 'Claude CLI — PHI Disabled'
  | 'Vertex Connected — PHI Disabled'
  | 'Vertex Connected — PHI Enabled'
  | 'Configuration Error — Fail Closed';

export interface AgentRuntimeBadgeProps {
  badge: AgentRuntimeBadgeValue;
  modelId?: string;
}

const STYLES: Record<AgentRuntimeBadgeValue, { dot: string; cls: string }> = {
  'MVP Harness — Mock Data': { dot: '#64748b', cls: 'border-slate-300 bg-slate-50 text-slate-700' },
  'Claude CLI — PHI Disabled': { dot: '#7c3aed', cls: 'border-violet-300 bg-violet-50 text-violet-800' },
  'Vertex Connected — PHI Disabled': { dot: '#2f8f7a', cls: 'border-teal-300 bg-teal-50 text-teal-800' },
  'Vertex Connected — PHI Enabled': { dot: '#b45309', cls: 'border-amber-300 bg-amber-50 text-amber-900' },
  'Configuration Error — Fail Closed': { dot: '#b91c1c', cls: 'border-rose-300 bg-rose-50 text-rose-800' },
};

export function AgentRuntimeBadge({ badge, modelId }: AgentRuntimeBadgeProps) {
  const s = STYLES[badge];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${s.cls}`}
      role="status"
      aria-label={`Brad runtime: ${badge}`}
      title={modelId ? `Model: ${modelId}` : undefined}
    >
      <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: s.dot }} />
      {badge}
      {modelId ? <span className="opacity-60">· {modelId}</span> : null}
    </span>
  );
}

export default AgentRuntimeBadge;
