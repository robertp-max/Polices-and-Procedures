import { CheckCircle2, Clock3, ShieldAlert } from 'lucide-react';
import type { DemoCriticalEmergencyState } from '../lib/demoCriticalEmergency';
import { resolveIaReference, warnUnresolvedIaReference } from '../lib/referenceResolver';

export interface DemoCriticalOrchestrationPanelProps {
  state: DemoCriticalEmergencyState;
  isLight: boolean;
  onOpenForm: (id: string) => void;
  onOpenPolicy: (id: string) => void;
}

export function DemoCriticalOrchestrationPanel({
  state,
  isLight,
  onOpenForm,
  onOpenPolicy,
}: DemoCriticalOrchestrationPanelProps) {
  const border = isLight ? 'border-[#E5E4E3]' : 'border-white/10';
  const surface = isLight ? 'bg-white' : 'bg-white/[0.03]';
  const text = isLight ? 'text-[#1F1C1B]' : 'text-[#E0E0E0]';
  const muted = isLight ? 'text-[#6B6B6B]' : 'text-white/60';

  const resolvedForms = state.forms.filter((form) => {
    const resolved = resolveIaReference({
      id: form.id,
      claimedType: 'form',
      title: form.title,
      source: 'DemoCriticalOrchestrationPanel.forms',
    });
    if (resolved.resolved && resolved.resolvedType === 'form') return true;
    warnUnresolvedIaReference(resolved);
    return false;
  });
  const resolvedPolicies = state.policies.filter((policy) => {
    const resolved = resolveIaReference({
      id: policy.id,
      claimedType: 'policy',
      title: policy.title,
      source: 'DemoCriticalOrchestrationPanel.policies',
    });
    if (resolved.resolved && resolved.resolvedType === 'policy') return true;
    warnUnresolvedIaReference(resolved);
    return false;
  });
  const selectedForm = resolvedForms.find((item) => item.id === state.selectedItemId);
  const selectedPolicy = resolvedPolicies.find((item) => item.id === state.selectedItemId);

  return (
    <aside className={`h-full rounded-2xl ${surface} border ${border} overflow-hidden flex flex-col`}>
      <div className={`px-4 py-3 border-b ${border}`}>
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#DC2626] font-mono">Workflow Triggered</p>
        <div className="flex items-center gap-2 mt-1">
          <ShieldAlert size={16} className="text-[#DC2626]" />
          <h3 className={`text-[14px] font-semibold ${text}`}>Critical Safety Event — ACTIVE</h3>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar">
        <div className={`rounded-xl border ${border} p-3 ${isLight ? 'bg-[#FAFAFA]' : 'bg-white/[0.02]'}`}>
          <div className="grid grid-cols-1 gap-2 text-[12px]">
            <MetaRow label="Event ID" value={state.eventId} valueClass="text-[#DC2626]" />
            <MetaRow label="Status" value={state.workflowStatus} valueClass="text-[#F59E0B]" />
            <MetaRow label="Priority" value={state.priority} valueClass="text-[#DC2626]" />
            <MetaRow label="Workflow" value={state.workflowId} valueClass={text} />
          </div>
        </div>

        <section>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#DC2626] font-mono mb-2">System Actions (AUTO)</h4>
          <div className="space-y-2">
            {state.systemActions.map((action) => (
              <div key={action.id} className={`rounded-lg border ${border} p-2.5 flex items-start gap-2 ${isLight ? 'bg-[#FDFDFD]' : 'bg-white/[0.02]'}`}>
                {action.status === 'completed' ? (
                  <CheckCircle2 size={14} className="text-[#16A34A] mt-0.5" />
                ) : (
                  <Clock3 size={14} className="text-[#F59E0B] mt-0.5" />
                )}
                <div>
                  <p className={`text-[12px] font-medium ${text}`}>{action.label}</p>
                  <p className={`text-[10px] ${muted}`}>{new Date(action.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C74601] font-mono mb-2">Required Forms (Clickable)</h4>
          <div className="space-y-2">
            {resolvedForms.map((form) => (
              <button
                key={form.id}
                type="button"
                onClick={() => onOpenForm(form.id)}
                disabled={!state.acknowledged}
                className={`w-full text-left rounded-lg border ${border} p-2.5 transition-colors ${state.acknowledged ? (isLight ? 'bg-[#FAFAFA] hover:border-[#C74601]' : 'bg-white/[0.02] hover:border-[#FFC107]/50') : (isLight ? 'bg-[#F5F5F5] opacity-70 cursor-not-allowed' : 'bg-white/[0.02] opacity-60 cursor-not-allowed')}`}
              >
                <p className={`text-[12px] font-semibold ${text}`}>{form.title}</p>
                <p className={`text-[10px] ${muted}`}>Instance: {form.instanceId} · Linked to {form.eventId}</p>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C74601] font-mono mb-2">Policy References (Linked)</h4>
          <div className="space-y-2">
            {resolvedPolicies.map((policy) => (
              <button
                key={policy.id}
                type="button"
                onClick={() => onOpenPolicy(policy.id)}
                disabled={!state.acknowledged}
                className={`w-full text-left rounded-lg border ${border} p-2.5 transition-colors ${state.acknowledged ? (isLight ? 'bg-[#FAFAFA] hover:border-[#C74601]' : 'bg-white/[0.02] hover:border-[#FFC107]/50') : (isLight ? 'bg-[#F5F5F5] opacity-70 cursor-not-allowed' : 'bg-white/[0.02] opacity-60 cursor-not-allowed')}`}
              >
                <p className={`text-[12px] font-semibold ${text}`}>{policy.id} — {policy.title}</p>
                <p className={`text-[10px] ${muted}`}>Safety-first clause highlighted</p>
              </button>
            ))}
          </div>
        </section>

        <section className={`rounded-xl border ${border} p-3 ${isLight ? 'bg-[#FFF8F4]' : 'bg-[#FFC107]/[0.08]'}`}>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C74601] font-mono mb-2">Audit Visibility</h4>
          <p className={`text-[12px] font-semibold ${text}`}>Audit Trail Active (Immutable)</p>
          <p className={`text-[11px] ${muted}`}>Timestamp started: {new Date(state.startedAt).toLocaleString()}</p>
          <p className={`text-[11px] ${muted}`}>Actor: {state.actor}</p>
          <p className={`text-[11px] ${muted}`}>Event linkage: {state.eventId} · {state.auditTrailId}</p>
        </section>

        {(selectedForm || selectedPolicy) && (
          <section className={`rounded-xl border ${border} p-3 ${isLight ? 'bg-[#FFFFFF]' : 'bg-white/[0.04]'}`}>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0EA5E9] font-mono mb-2">Active Detail</h4>
            {selectedForm && (
              <div className="space-y-1">
                <p className={`text-[12px] font-semibold ${text}`}>{selectedForm.title}</p>
                <p className={`text-[11px] ${muted}`}>Form ID: {selectedForm.id}</p>
                <p className={`text-[11px] ${muted}`}>Instance: {selectedForm.instanceId}</p>
                <p className={`text-[11px] ${muted}`}>Workflow binding: {selectedForm.workflowId}</p>
                <p className={`text-[11px] ${muted}`}>Event binding: {selectedForm.eventId}</p>
              </div>
            )}
            {selectedPolicy && (
              <div className="space-y-1">
                <p className={`text-[12px] font-semibold ${text}`}>{selectedPolicy.id} — {selectedPolicy.title}</p>
                <p className="text-[11px] text-[#DC2626] font-semibold">Safety-first clause:</p>
                <p className={`text-[11px] ${text}`}>{selectedPolicy.clause}</p>
              </div>
            )}
          </section>
        )}

        <section>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#16A34A] font-mono mb-2">Append-Only Audit Trail</h4>
          <div className="space-y-2">
            {state.auditTrail.map((entry) => (
              <div key={entry.id} className={`rounded-lg border ${border} p-2 ${isLight ? 'bg-[#FAFAFA]' : 'bg-white/[0.02]'}`}>
                <p className={`text-[11px] font-medium ${text}`}>{entry.action}</p>
                <p className={`text-[10px] ${muted}`}>{new Date(entry.timestamp).toLocaleString()} · {entry.actor} · {entry.id}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}

function MetaRow({ label, value, valueClass }: { label: string; value: string; valueClass: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50 font-mono">{label}</span>
      <span className={`text-[12px] font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}
