import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Clock,
  ShieldAlert,
  CheckCircle2,
  ChevronDown,
  Repeat,
  BookOpenCheck

} from "lucide-react";

import { useLearner } from "@/policy/journey/lib/learnerState";
import { cms485Cases } from "@/policy/journey/data/advancedTraining/cms485PlanOfCareCases.data";
import type { CaseField } from "@/policy/journey/data/advancedTraining/cms485PlanOfCareCases.data";


export function Cms485AssessmentQuizPage() {
  const navigate = useNavigate();
  const { setState, recordRemediation } = useLearner();

  // Active Case Index
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const currentCase = cms485Cases[activeCaseIdx];

  // Selected Answers: Map of Field ID to Array of Selected Option IDs
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  
  // Audited Fields: Map of Field ID to Boolean (whether Audited/Checked)
  const [auditedFields, setAuditedFields] = useState<Record<string, boolean>>({});

  // Active tab on the clinical evidence panel
  const [evidenceTab, setEvidenceTab] = useState<"overview" | "narratives" | "meds" | "oasis" | "safety">("overview");

  // Expanded option reviews in audited cards
  const [expandedOptionReviews, setExpandedOptionReviews] = useState<Record<string, boolean>>({});

  if (!currentCase) {
    return (
      <div className="bg-surface-glass border border-hairline rounded-xl p-6 text-secondary shadow-rest backdrop-blur-xl">
        No case study simulator data available.
      </div>
    );
  }

  // Check if a field is fully compliant (correct answers selected)
  const isFieldCompliant = (field: CaseField) => {
    const selected = selections[field.id] || [];
    const correct = field.correctAnswerIds;
    if (field.type === "single-select") {
      return selected.length === 1 && selected[0] === correct[0];
    } else {
      return (
        selected.length === correct.length &&
        selected.every((id) => correct.includes(id))
      );
    }
  };

  const compliantCount = currentCase.fields.filter(isFieldCompliant).length;
  const isCaseFullyCompliant = compliantCount === currentCase.fields.length;

  const handleSelectOption = (field: CaseField, optionId: string) => {
    // Prevent editing if already audited and correct
    if (auditedFields[field.id] && isFieldCompliant(field)) return;

    // Reset audited status for this field since selection changed
    setAuditedFields((prev) => ({ ...prev, [field.id]: false }));

    if (field.type === "single-select") {
      setSelections((prev) => ({ ...prev, [field.id]: [optionId] }));
    } else {
      const currentSelected = selections[field.id] || [];
      const newSelected = currentSelected.includes(optionId)
        ? currentSelected.filter((id) => id !== optionId)
        : [...currentSelected, optionId];
      setSelections((prev) => ({ ...prev, [field.id]: newSelected }));
    }
  };

  const handleAuditField = (fieldId: string) => {
    setAuditedFields((prev) => ({ ...prev, [fieldId]: true }));
    const field = currentCase.fields.find((f) => f.id === fieldId);
    if (field && !isFieldCompliant(field)) {
      recordRemediation(`CMS-485 Case ${activeCaseIdx + 1}: ${field.label} Audited Deficient`);
    }
  };

  const handleNextCase = () => {
    if (activeCaseIdx < cms485Cases.length - 1) {
      setActiveCaseIdx((prev) => prev + 1);
      setSelections({});
      setAuditedFields({});
      setEvidenceTab("overview");
      setExpandedOptionReviews({});
    } else {
      // Complete module!
      setState((s) => ({
        ...s,
        moduleQuizPassed: { ...s.moduleQuizPassed, "cms-485": true }
      }));
    }
  };

  const handleClose = () => {
    navigate("/journey");
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 text-left">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
        <button
          onClick={handleClose}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-teal hover:text-brand-teal-deep transition-colors"
        >
          <ArrowLeft size={14} /> Exit Simulator
        </button>
        <div className="flex items-center gap-4 text-xs font-mono text-secondary">
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-brand-orange" />
            CMS-485 Advanced Audit Lab
          </span>
          <span>•</span>
          <span className="text-brand-teal font-semibold">
            Case {activeCaseIdx + 1} of {cms485Cases.length}
          </span>
        </div>
      </div>

      {/* Case Tabs / Progress */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-hairline bg-white overflow-x-auto shadow-sm">
        {cms485Cases.map((c, idx) => {
          const isActive = idx === activeCaseIdx;
          const isDone = idx < activeCaseIdx;
          return (
            <div key={c.id} className="flex items-center gap-3 shrink-0 mx-2">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold ${
                  isActive
                    ? "bg-brand-orange border-brand-orange text-white"
                    : isDone
                    ? "bg-tone-teal-bg text-brand-teal border-tone-teal-border"
                    : "bg-white border-hairline text-muted"
                }`}
              >
                {isDone ? <Check size={10} /> : idx + 1}
              </div>
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider ${
                  isActive ? "text-brand-orange" : "text-muted"
                }`}
              >
                {c.evidence.patientName}
              </span>
              {idx < cms485Cases.length - 1 && <div className="w-8 h-px bg-hairline" />}
            </div>
          );
        })}
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0D4F4F] to-[#0A3A3A] text-white p-6 rounded-xl shadow-md">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#FCD34D] font-mono block mb-1">
          {currentCase.title}
        </span>
        <h1 className="text-2xl font-bold tracking-tight">{currentCase.subtitle}</h1>
        <p className="text-xs text-slate-200 mt-2 max-w-3xl leading-relaxed">
          Verify the CMS-485 Plan of Care against the clinical evidence below. Correct all 8 deficiencies to align the plan with CMS Conditions of Participation and pass the audit.
        </p>
      </div>

      {/* Split Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANE: Patient Evidence Folder (5 columns) */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-hairline rounded-xl shadow-sm overflow-hidden flex flex-col h-[750px]">
          {/* Document Folder Tab Header */}
          <div className="bg-slate-50 border-b border-hairline p-2 flex gap-1 overflow-x-auto">
            <button
              onClick={() => setEvidenceTab("overview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider shrink-0 transition-colors ${
                evidenceTab === "overview"
                  ? "bg-brand-teal text-white"
                  : "text-secondary hover:bg-slate-100"
              }`}
            >
              Overview &amp; Vitals
            </button>
            <button
              onClick={() => setEvidenceTab("narratives")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider shrink-0 transition-colors ${
                evidenceTab === "narratives"
                  ? "bg-brand-teal text-white"
                  : "text-secondary hover:bg-slate-100"
              }`}
            >
              Narrative &amp; Notes
            </button>
            <button
              onClick={() => setEvidenceTab("meds")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider shrink-0 transition-colors ${
                evidenceTab === "meds"
                  ? "bg-brand-teal text-white"
                  : "text-secondary hover:bg-slate-100"
              }`}
            >
              Meds &amp; Risks
            </button>
            <button
              onClick={() => setEvidenceTab("oasis")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider shrink-0 transition-colors ${
                evidenceTab === "oasis"
                  ? "bg-brand-teal text-white"
                  : "text-secondary hover:bg-slate-100"
              }`}
            >
              OASIS Findings
            </button>
            <button
              onClick={() => setEvidenceTab("safety")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider shrink-0 transition-colors ${
                evidenceTab === "safety"
                  ? "bg-brand-teal text-white"
                  : "text-secondary hover:bg-slate-100"
              }`}
            >
              Safety &amp; Wound
            </button>
          </div>

          {/* Folder Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {evidenceTab === "overview" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs uppercase font-bold text-brand-teal font-mono tracking-wider mb-2">Patient Demographics</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-hairline font-mono text-secondary">
                    <div><span className="text-muted">Name:</span> <strong className="text-slate-800">{currentCase.evidence.patientName}</strong></div>
                    <div><span className="text-muted">Age / Sex:</span> <strong className="text-slate-800">{currentCase.evidence.age} / {currentCase.evidence.gender}</strong></div>
                    <div><span className="text-muted">HIC / Medicare ID:</span> <strong className="text-slate-800">{currentCase.evidence.patientHIC}</strong></div>
                    <div><span className="text-muted">MRN:</span> <strong className="text-slate-800">{currentCase.evidence.medicalRecordNumber}</strong></div>
                    <div><span className="text-muted">SOC Date:</span> <strong className="text-slate-800">{currentCase.evidence.socDate}</strong></div>
                    <div><span className="text-muted">Cert Period:</span> <strong className="text-slate-800">{currentCase.evidence.certPeriod}</strong></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase font-bold text-brand-teal font-mono tracking-wider mb-2">Start of Care Vital Signs</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {currentCase.evidence.vitals.map((v) => (
                      <div
                        key={v.label}
                        className={`p-3 rounded-lg border flex flex-col text-xs transition-colors ${
                          v.alert
                            ? "bg-orange-50/50 border-orange-200 text-orange-950"
                            : "bg-white border-hairline text-secondary"
                        }`}
                      >
                        <span className="text-[10px] text-muted font-mono">{v.label}</span>
                        <strong className="text-sm mt-0.5 font-mono">{v.value}</strong>
                        {v.alert && (
                          <span className="text-[8px] uppercase tracking-wider font-bold text-brand-orange mt-1">
                            ⚠️ Clinical Trigger
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase font-bold text-brand-teal font-mono tracking-wider mb-2">Discharge Summary Reference</h3>
                  <div className="bg-slate-50 border border-hairline p-4 rounded-lg text-xs leading-relaxed text-secondary whitespace-pre-line">
                    {currentCase.evidence.dischargeSummary}
                  </div>
                </div>
              </div>
            )}

            {evidenceTab === "narratives" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs uppercase font-bold text-brand-teal font-mono tracking-wider mb-2">Start of Care (SOC) Narrative</h3>
                  <div className="bg-slate-50 border border-hairline p-4 rounded-lg text-xs leading-relaxed text-secondary whitespace-pre-line font-serif italic">
                    "{currentCase.evidence.socNarrative}"
                  </div>
                </div>

                {currentCase.evidence.functionalStatus && (
                  <div>
                    <h3 className="text-xs uppercase font-bold text-brand-teal font-mono tracking-wider mb-2">Functional Status &amp; Mobility</h3>
                    <div className="bg-slate-50 border border-hairline p-4 rounded-lg text-xs leading-relaxed text-secondary">
                      {currentCase.evidence.functionalStatus}
                    </div>
                  </div>
                )}

                {currentCase.evidence.socialEnvironmental && (
                  <div>
                    <h3 className="text-xs uppercase font-bold text-brand-teal font-mono tracking-wider mb-2">Social &amp; Environmental Factors</h3>
                    <div className="bg-slate-50 border border-hairline p-4 rounded-lg text-xs leading-relaxed text-secondary">
                      {currentCase.evidence.socialEnvironmental}
                    </div>
                  </div>
                )}
              </div>
            )}

            {evidenceTab === "meds" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs uppercase font-bold text-brand-teal font-mono tracking-wider mb-2">Medication Reconciliation List</h3>
                  <div className="space-y-3">
                    {currentCase.evidence.medications.map((med, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-hairline rounded-lg text-xs space-y-1.5">
                        <div className="flex justify-between items-start">
                          <strong className="text-slate-800">{med.name} {med.dose}</strong>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-white border border-hairline uppercase text-brand-teal">
                            {med.route} · {med.frequency}
                          </span>
                        </div>
                        <div className="text-[11px] text-secondary">
                          <span className="font-semibold text-slate-600">Indication:</span> {med.indication}
                        </div>
                        {med.reconciliationNote && (
                          <div className="text-[11px] p-1.5 rounded bg-orange-50 border border-orange-100 text-orange-950 font-mono">
                            <span className="font-semibold text-brand-orange">Audit Note:</span> {med.reconciliationNote}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase font-bold text-brand-teal font-mono tracking-wider mb-2">Documented Safety Risks</h3>
                  <div className="space-y-2">
                    {currentCase.evidence.safetyRisks.map((risk, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                          risk.severity === "critical"
                            ? "bg-red-50 border-red-200 text-red-950"
                            : risk.severity === "moderate"
                            ? "bg-orange-50 border-orange-200 text-orange-950"
                            : "bg-slate-50 border-hairline text-secondary"
                        }`}
                      >
                        <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold capitalize text-[10px] font-mono tracking-wider">
                            {risk.severity} Risk
                          </p>
                          <p className="mt-0.5 leading-relaxed">{risk.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {evidenceTab === "oasis" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs uppercase font-bold text-brand-teal font-mono tracking-wider mb-2">OASIS Data Mismatch Review</h3>
                  <p className="text-[11px] text-muted mb-3 leading-relaxed">
                    Compare OASIS clinical selections below with the narrative assessment to identify conflicts.
                  </p>
                  <div className="space-y-3.5">
                    {currentCase.evidence.oasisFindings.map((finding, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-hairline rounded-lg text-xs space-y-1.5">
                        <div>
                          <strong className="text-slate-800">{finding.item}</strong>
                          <p className="text-brand-teal-deep font-semibold mt-0.5">{finding.response}</p>
                        </div>
                        {finding.conflictNote && (
                          <div className="p-2 rounded bg-orange-50 border border-orange-100 text-orange-950 font-mono text-[10px] leading-relaxed">
                            <span className="font-bold text-brand-orange uppercase block text-[8px] tracking-wider mb-0.5">
                              ⚠️ Compliance Audit Conflict
                            </span>
                            {finding.conflictNote}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {evidenceTab === "safety" && (
              <div className="space-y-5">
                {currentCase.evidence.woundAssessment && (
                  <div>
                    <h3 className="text-xs uppercase font-bold text-brand-teal font-mono tracking-wider mb-2">Wound Assessment Profile</h3>
                    <div className="bg-slate-50 border border-hairline p-4 rounded-lg text-xs leading-relaxed text-secondary whitespace-pre-line font-mono">
                      {currentCase.evidence.woundAssessment}
                    </div>
                  </div>
                )}

                {currentCase.evidence.mentalStatus && (
                  <div>
                    <h3 className="text-xs uppercase font-bold text-brand-teal font-mono tracking-wider mb-2">Cognitive &amp; Mental Status</h3>
                    <div className="bg-slate-50 border border-hairline p-4 rounded-lg text-xs leading-relaxed text-secondary">
                      {currentCase.evidence.mentalStatus}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-xs uppercase font-bold text-brand-teal font-mono tracking-wider mb-2">Physician Collaboration Record</h3>
                  <div className="bg-slate-50 border border-hairline p-4 rounded-lg text-xs leading-relaxed text-secondary font-mono">
                    {currentCase.evidence.physicianCollaboration}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Hidden clues footer helper */}
          <div className="bg-slate-50 border-t border-hairline p-3 text-[10px] text-muted font-mono leading-relaxed flex items-center gap-2">
            <BookOpenCheck size={14} className="text-brand-teal shrink-0" />
            <span>Examine all tabs to locate hidden audit traps. Options labeled first in source are correct.</span>
          </div>
        </div>

        {/* RIGHT PANE: CMS-485 Auditor Form (7 columns) */}
        <div className="col-span-12 lg:col-span-7 bg-[#F1F5F9] border border-hairline rounded-xl p-5 shadow-sm space-y-6 overflow-y-auto h-[750px]">
          
          <div className="flex justify-between items-center bg-white p-3.5 rounded-lg border border-hairline shadow-sm">
            <div>
              <span className="text-[9px] font-bold text-brand-orange uppercase tracking-wider font-mono">
                Audit Progress
              </span>
              <h2 className="text-sm font-semibold text-slate-800">Plan of Care Compliance Checklist</h2>
            </div>
            <div className="font-mono text-xs text-secondary bg-slate-100 px-3 py-1 rounded border border-hairline">
              Compliant Boxes: <strong className="text-brand-teal">{compliantCount}</strong> / 8
            </div>
          </div>

          <div className="space-y-4">
            {currentCase.fields.map((field) => {
              const selectedIds = selections[field.id] || [];
              const isAudited = auditedFields[field.id];
              const compliant = isFieldCompliant(field);
              
              return (
                <div
                  key={field.id}
                  className={`bg-white rounded-xl border transition-all overflow-hidden ${
                    isAudited
                      ? compliant
                        ? "border-[#10B981] shadow-sm shadow-[#10B981]/15"
                        : "border-[#F97316] shadow-sm shadow-[#F97316]/15"
                      : "border-[#E2E8F0] shadow-sm"
                  }`}
                >
                  {/* Field Header Card */}
                  <div className="p-4 border-b border-[#E2E8F0] flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-800 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded tracking-wide">
                          {field.formBoxNumber}
                        </span>
                        <span className="text-xs text-slate-500 font-mono capitalize">
                          {field.domain.replace("-", " ")}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#0D4F4F] mt-1.5">{field.label}</h3>
                    </div>

                    {isAudited && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          compliant
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-orange-50 border-orange-200 text-orange-700"
                        }`}
                      >
                        {compliant ? "Compliant" : "Deficient"}
                      </span>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="p-4 space-y-2 bg-[#FAFBFD]">
                    <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider block mb-1">
                      {field.type === "single-select" ? "Select the single compliant entry:" : "Select all compliant entries:"}
                    </span>

                    {field.options.map((opt) => {
                      const isSelected = selectedIds.includes(opt.id);
                      
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(field, opt.id)}
                          className={`w-full text-left p-3.5 rounded-lg border text-xs flex items-start gap-3 transition-all ${
                            isSelected
                              ? "bg-[#E0F7FA] border-brand-teal text-[#0D4F4F] font-semibold"
                              : "bg-white border-hairline hover:border-brand-teal/20 text-slate-600 shadow-sm"
                          }`}
                        >
                          <div
                            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              isSelected
                                ? "bg-brand-teal text-white border-brand-teal"
                                : "border-hairline text-slate-300"
                            }`}
                          >
                            {field.type === "single-select" ? (
                              <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-white" : ""}`} />
                            ) : (
                              isSelected && <Check size={10} />
                            )}
                          </div>
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Action or Feedback Area */}
                  <div className="p-4 border-t border-hairline bg-slate-50 flex flex-col gap-3">
                    {!isAudited ? (
                      <button
                        type="button"
                        onClick={() => handleAuditField(field.id)}
                        disabled={selectedIds.length === 0}
                        className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold py-2 px-4 rounded text-xs uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-center"
                      >
                        Audit Selection
                      </button>
                    ) : (
                      <div className="space-y-3">
                        {/* Audit Note & Verdict */}
                        <div className="p-3 bg-white border border-hairline rounded-lg text-xs leading-relaxed text-secondary">
                          <span className="font-bold text-slate-800 font-mono block uppercase text-[9px] tracking-wider mb-0.5">
                            Audit Clinician Note:
                          </span>
                          {field.auditNote}
                        </div>

                        {/* Selected Option Deep-dive */}
                        {field.options
                          .filter((o) => selectedIds.includes(o.id))
                          .map((opt) => (
                            <div
                              key={opt.id}
                              className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                                opt.isCorrect
                                  ? "bg-green-50 border-green-200 text-green-950"
                                  : "bg-orange-50 border-orange-200 text-orange-950"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-bold font-mono">
                                  Choice {opt.id}: {opt.isCorrect ? "✅ Compliance Compliant" : "⚠️ Audit Warning"}
                                </span>
                                {opt.trapTags && opt.trapTags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {opt.trapTags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-white border border-hairline uppercase text-[#F97316]"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <p className="leading-relaxed">
                                <span className="font-semibold">Rationale:</span> {opt.rationale}
                              </p>

                              {!opt.isCorrect && (
                                <>
                                  <p className="leading-relaxed">
                                    <span className="font-semibold text-brand-orange">Why tempting:</span> {opt.whyTempting}
                                  </p>
                                  <p className="leading-relaxed">
                                    <span className="font-semibold text-brand-orange">Failure reason:</span> {opt.failureReason}
                                  </p>
                                  <div className="p-2 rounded bg-white border border-orange-100 text-orange-950 leading-relaxed">
                                    <span className="font-bold uppercase text-[9px] text-red-600 block mb-0.5">
                                      Real-World Consequence:
                                    </span>
                                    {opt.realWorldConsequence}
                                  </div>
                                </>
                              )}
                            </div>
                          ))}

                        {/* Option Review toggle helper for other options */}
                        <div className="pt-1.5 border-t border-hairline/60">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedOptionReviews((prev) => ({
                                ...prev,
                                [field.id]: !prev[field.id],
                              }))
                            }
                            className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-brand-teal hover:underline uppercase font-mono"
                          >
                            <ChevronDown
                              size={12}
                              className={`transition-transform ${
                                expandedOptionReviews[field.id] ? "rotate-180" : ""
                              }`}
                            />
                            {expandedOptionReviews[field.id] ? "Hide" : "Show"} All Option Explanations
                          </button>

                          {expandedOptionReviews[field.id] && (
                            <div className="mt-2.5 space-y-2">
                              {field.options.map((opt) => (
                                <div
                                  key={opt.id}
                                  className="p-3 bg-white border border-hairline rounded-lg text-xs leading-relaxed text-secondary"
                                >
                                  <div className="flex justify-between items-center">
                                    <strong className="text-slate-800">
                                      Option {opt.id} {opt.isCorrect && "(Correct)"}
                                    </strong>
                                    {opt.trapTags && opt.trapTags.length > 0 && (
                                      <span className="text-[8px] font-mono text-brand-orange">
                                        #{opt.trapTags.join(" #")}
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-1">{opt.rationale}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Retry interface */}
                        {!compliant && (
                          <div className="flex items-center justify-between pt-2 border-t border-hairline/60">
                            <span className="text-[10px] text-slate-500 italic leading-none">
                              This box remains deficient. Please adjust your selections.
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelections((prev) => ({ ...prev, [field.id]: [] }));
                                setAuditedFields((prev) => ({ ...prev, [field.id]: false }));
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 border border-tone-orange-border text-brand-orange rounded text-[10px] font-bold uppercase hover:bg-orange-50 transition-colors"
                            >
                              <Repeat size={10} /> Reset Box
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit/Next Case Button */}
          {isCaseFullyCompliant && (
            <div className="bg-[#E0F7FA] border border-brand-teal p-5 rounded-xl space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={24} className="text-[#10B981] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-[#0D4F4F]">
                    Case Completed Successfully!
                  </h3>
                  <p className="text-xs text-[#0D4F4F] mt-1 leading-relaxed">
                    You have successfully corrected all 8 Plan of Care deficiencies for {currentCase.evidence.patientName}. Every box is now fully compliant and audit-proof under Conditions of Participation.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextCase}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3 px-6 rounded-lg text-xs uppercase tracking-wider transition-colors text-center shadow-md"
              >
                {activeCaseIdx < cms485Cases.length - 1
                  ? "Proceed to Next Clinical Case"
                  : "Complete Advanced Training Course"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Cms485AssessmentQuizPage;
