import { useState } from "react";
import { Stethoscope, AlertTriangle, StopCircle, Plus, CheckCircle2 } from "lucide-react";
import { useLearner } from "@/policy/journey/lib/learnerState";
import { appCopy, contentV2 } from "@/policy/journey/data/contentV2Adapter";
import { JourneyLearningShell } from "./JourneyLearningShell";
import { ReviewerToolsPanel } from "@/policy/journey/components/ReviewerToolsPanel";
import { useJourneyStore } from "@/policy/journey/stores/journeyStore";
import type { SupervisedVisit, SignatureRecord } from "@/policy/journey/types/journey";
import { modulesForRole } from "@/policy/journey/data/modules";

export function PhiWarningBlock() {
  return (
    <div
      className="bg-tone-red-bg border border-tone-red-border rounded-lg p-4 flex items-start sm:items-center gap-3"
      role="note"
      aria-label="No protected health information warning"
    >
      <StopCircle size={20} className="text-tone-red-text shrink-0" aria-hidden="true" />
      <p className="text-sm font-bold text-tone-red-text">
        STOP:{" "}
        <span className="font-normal text-tone-red-text">
          Do not enter Protected Health Information (PHI), real patient names, or facility data.
          Use simulated case data only.
        </span>
      </p>
    </div>
  );
}

export function SupervisorScreen() {
  const { state, setOptionalClinical } = useLearner();
  const journey = useJourneyStore();
  const [inputText, setInputText] = useState("");

  // P0-005: Supervised Visit Logging state (minimal functional path)
  const [selectedEmpId, setSelectedEmpId] = useState(journey.currentEmployeeId);
  const [visitForm, setVisitForm] = useState({
    visitDate: new Date().toISOString().slice(0, 10),
    visitType: 'INITIAL' as SupervisedVisit['visitType'],
    rating: 'SATISFACTORY' as SupervisedVisit['rating'],
    comments: '',
    supervisorName: 'Elena Navarro, RN DON',
    supervisorRole: 'DON' as SignatureRecord['role'],
    followUp: false,
  });
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const o = state.optionalClinical;
  const interactions = [o.hub, o.skills, o.confidence, o.documentation, o.help].filter(Boolean).length;

  const employees = journey.employees;
  const currentEmp = employees.find(e => e.id === selectedEmpId) || employees[0];
  const visits = journey.supervisedVisits.filter(v => v.employeeId === selectedEmpId);

  const roleModules = modulesForRole(currentEmp.role);
  const supRequiredModules = roleModules.filter(m => (m.supervisedVisitsRequired ?? 0) > 0);
  const requiredCount = supRequiredModules.reduce((sum, m) => sum + (m.supervisedVisitsRequired ?? 0), 0);
  const satisfactoryVisits = visits.filter(v => v.rating === 'SATISFACTORY').length;
  const canClear = satisfactoryVisits >= requiredCount && requiredCount > 0;
  const cleared = currentEmp.clearedForIndependentWork;

  function saveSupervisedVisit() {
    setSaveMsg(null);
    if (!visitForm.comments.trim()) {
      setSaveMsg('Comments required.');
      return;
    }
    const sig: SignatureRecord = {
      name: visitForm.supervisorName,
      role: visitForm.supervisorRole,
      pngDataUrl: '',
      signedAt: new Date().toISOString(),
    };
    const visit: Omit<SupervisedVisit, 'id' | 'createdAt'> = {
      employeeId: selectedEmpId,
      supervisorId: 'SUP-001', // placeholder
      visitDate: visitForm.visitDate,
      visitType: visitForm.visitType,
      rating: visitForm.rating,
      comments: visitForm.comments.trim(),
      signatures: [sig],
      patientInitials: undefined,
    };
    journey.addSupervisedVisit(visit);
    setSaveMsg(`Saved ${visitForm.rating} visit for ${currentEmp.name}. Total satisfactory: ${satisfactoryVisits + (visitForm.rating === 'SATISFACTORY' ? 1 : 0)}`);
    // reset comments for next
    setVisitForm(f => ({ ...f, comments: '' }));
  }

  function attemptClearForIndependentWork() {
    setSaveMsg(null);
    if (!canClear) {
      setSaveMsg(`Requires ${requiredCount} satisfactory supervised visits. Current: ${satisfactoryVisits}.`);
      return;
    }
    const sig: SignatureRecord = {
      name: visitForm.supervisorName,
      role: visitForm.supervisorRole,
      pngDataUrl: '',
      signedAt: new Date().toISOString(),
    };
    const res = journey.clearForIndependentWork(selectedEmpId, sig);
    setSaveMsg(res.message);
  }

  return (
    <JourneyLearningShell
      title="Clinical Hub"
      subtitle="Access supplementary nursing guides, return demonstrations, and de-identified charting practices. This section is entirely optional and does not affect required course hours."
    >
      <div className="space-y-6">
        {/* Reviewer Tools */}
        <ReviewerToolsPanel />

        <div className="bg-surface-glass border border-hairline rounded-xl p-6 md:p-8 shadow-rest backdrop-blur-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-hairline">
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-orange font-mono flex items-center gap-1.5">
                <Stethoscope size={12} /> {appCopy.clinicalHub.eyebrow}
              </span>
              <h1 className="text-2xl font-bold text-brand-teal-deep mt-1">{appCopy.clinicalHub.title}</h1>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-tone-orange-bg text-brand-orange border border-tone-orange-border font-mono shrink-0">
              {appCopy.clinicalHub.badge}
            </span>
          </div>

          <div className="bg-tone-orange-bg/15 border border-tone-orange-border/30 rounded-lg p-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-brand-orange shrink-0 mt-0.5" />
              <p className="text-[11px] text-brand-orange/90 leading-relaxed font-mono font-semibold">
                <strong>Regulatory Warning:</strong> {appCopy.clinicalHub.warning}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appCopy.clinicalHub.scenarios.map((scenario, index) => (
              <div key={scenario.title} className="p-5 rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset border border-hairline hover:border-brand-teal/20 transition-all shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-teal-deep mb-2 font-mono">{scenario.title}</h3>
                <p className="text-xs text-secondary leading-relaxed mb-4">{scenario.body}</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] text-muted font-mono">
                    {index === 0 ? `${contentV2.clinical_support.units.length} Units` : `${contentV2.clinical_support.confidence_checks.length} Checks`}
                  </span>
                  <button
                    onClick={() => setOptionalClinical(index === 0 ? "skills" : "confidence", true)}
                    className="bg-brand-orange hover:bg-brand-orange/95 text-white font-bold px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-colors shadow-pill-action"
                  >
                    {scenario.action}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {interactions > 0 && (
            <div className="p-4 rounded-lg border border-tone-teal-border/30 bg-tone-teal-bg/10 text-brand-teal-deep text-xs font-mono flex justify-between items-center shadow-sm">
              <span>Optional practice engaged (does not affect certificate progress):</span>
              <strong className="text-brand-orange">{interactions} session{interactions === 1 ? "" : "s"}</strong>
            </div>
          )}

          {/* Documentation support (practice) */}
          <div className="bg-surface-glass backdrop-blur-md shadow-glass-inset border border-hairline rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-brand-teal-deep mb-6">{appCopy.clinicalHub.documentation_title}</h2>

            <div className="mb-6 space-y-3">
              <PhiWarningBlock />
              <p className="text-[11px] text-muted font-mono">{appCopy.clinicalHub.documentation_warning}</p>
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold text-brand-teal-deep">Practice note — fictional / de-identified details only</label>
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full bg-surface-glass backdrop-blur-md shadow-glass-inset border border-hairline rounded-lg p-4 text-xs text-secondary focus:outline-none focus:border-brand-teal shadow-sm resize-none"
                placeholder="Do not type patient or resident identifiers. Use fictional practice notes only."
              />
            </div>

            <button disabled className="px-6 py-3 rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset border border-hairline text-muted font-semibold text-xs uppercase tracking-wider cursor-not-allowed">
              Mock upload disabled
            </button>
          </div>

          {/* P0-005: Supervised Visit Logging & Clearance - actual working path */}
          <div className="bg-surface-glass border border-hairline rounded-xl p-6 md:p-8 shadow-rest backdrop-blur-xl space-y-6" id="supervised-visit-logger">
            <div className="flex items-center gap-2 border-b border-hairline pb-3">
              <CheckCircle2 size={18} className="text-brand-teal" />
              <h2 className="text-lg font-bold text-brand-teal-deep">Supervised Visit Logging &amp; Clearance (HR-TA-005 / HR-TD-003)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-muted block mb-1">Employee</label>
                <select
                  value={selectedEmpId}
                  onChange={e => setSelectedEmpId(e.target.value)}
                  className="w-full border border-hairline rounded p-2 text-sm bg-surface-glass"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-muted pt-6">
                Required satisfactory visits for {currentEmp.role}: <strong className="text-brand-teal">{requiredCount}</strong><br />
                Current satisfactory: <strong>{satisfactoryVisits}</strong> &nbsp;
                {canClear && !cleared && <span className="text-green-600">Ready for clearance</span>}
                {cleared && <span className="text-green-700 font-bold">CLEARED FOR INDEPENDENT PRACTICE</span>}
              </div>
            </div>

            <div className="border border-hairline rounded p-4 bg-surface-glass/50">
              <div className="font-mono text-[10px] uppercase text-brand-orange mb-2">Record New Supervised Visit</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <label className="text-xs block">Visit Date</label>
                  <input type="date" value={visitForm.visitDate} onChange={e => setVisitForm(f => ({...f, visitDate: e.target.value}))} className="border p-1 w-full" />
                </div>
                <div>
                  <label className="text-xs block">Visit Type</label>
                  <select value={visitForm.visitType} onChange={e => setVisitForm(f => ({...f, visitType: e.target.value as any}))} className="border p-1 w-full">
                    <option value="INITIAL">INITIAL</option>
                    <option value="HHA_14_DAY">HHA_14_DAY</option>
                    <option value="HHA_60_DAY">HHA_60_DAY</option>
                    <option value="COMPETENCY_VALIDATION">COMPETENCY_VALIDATION</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs block">Rating</label>
                  <select value={visitForm.rating} onChange={e => setVisitForm(f => ({...f, rating: e.target.value as any}))} className="border p-1 w-full">
                    <option value="SATISFACTORY">SATISFACTORY</option>
                    <option value="NEEDS_IMPROVEMENT">NEEDS_IMPROVEMENT</option>
                    <option value="UNSATISFACTORY">UNSATISFACTORY</option>
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <label className="text-xs block">Comments / Observed Skills</label>
                <textarea rows={2} value={visitForm.comments} onChange={e => setVisitForm(f => ({...f, comments: e.target.value}))} className="w-full border p-2 text-xs" placeholder="Specific skills observed, patient response, areas of strength..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                <div>
                  <label className="text-xs block">Supervisor Name</label>
                  <input value={visitForm.supervisorName} onChange={e => setVisitForm(f => ({...f, supervisorName: e.target.value}))} className="border p-1 w-full text-xs" />
                </div>
                <div>
                  <label className="text-xs block">Supervisor Role</label>
                  <select value={visitForm.supervisorRole} onChange={e => setVisitForm(f => ({...f, supervisorRole: e.target.value as any}))} className="border p-1 w-full text-xs">
                    <option value="DON">DON</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="RN">RN</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="text-xs flex items-center gap-2">
                    <input type="checkbox" checked={visitForm.followUp} onChange={e => setVisitForm(f => ({...f, followUp: e.target.checked}))} /> Follow-up required
                  </label>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button onClick={saveSupervisedVisit} className="px-4 py-1.5 rounded bg-brand-teal text-white text-xs font-bold flex items-center gap-1">
                  <Plus size={14} /> Save Supervised Visit
                </button>
                <button onClick={attemptClearForIndependentWork} disabled={!canClear || cleared} className="px-4 py-1.5 rounded border border-brand-teal text-brand-teal text-xs font-bold disabled:opacity-40">
                  Clear for Independent Practice
                </button>
              </div>
              {saveMsg && <div className="text-xs mt-1 text-brand-orange font-mono">{saveMsg}</div>}
            </div>

            <div>
              <div className="text-xs font-bold mb-1">Saved Visits for {currentEmp.name} (persists on refresh)</div>
              {visits.length === 0 && <div className="text-xs text-muted">No visits logged yet.</div>}
              <ul className="text-xs space-y-1">
                {visits.map(v => (
                  <li key={v.id} className="border-l-2 pl-2 border-brand-teal">
                    {v.visitDate} • {v.visitType} • {v.rating} • {v.comments.slice(0,80)}{v.comments.length > 80 ? '...' : ''} • signed by {v.signatures?.[0]?.name || '—'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </JourneyLearningShell>
  );
}

export default SupervisorScreen;
