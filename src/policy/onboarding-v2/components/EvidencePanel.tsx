import { useState } from 'react';
import { Upload, FileText, RefreshCw } from 'lucide-react';
import type { EvidenceObject, EvidenceObjectType, EvidenceRequirement, OnboardingExecutionUnit } from '../types';
import { StatusPill } from './StatusPill';
import { useOnboardingV2Store } from '../store/onboardingV2Store';
import { PolicyVersionLink } from './PolicyVersionLink';

interface Props {
  unit: OnboardingExecutionUnit;
  evidence: EvidenceObject[];
}

export function EvidencePanel({ unit, evidence }: Props) {
  const captureEvidence = useOnboardingV2Store(s => s.captureEvidence);
  const rejectEvidence  = useOnboardingV2Store(s => s.rejectEvidence);
  const [filename, setFilename] = useState('');
  const [type, setType] = useState<EvidenceObjectType>(unit.evidenceRequired[0]?.objectType ?? 'FileUpload');

  const required: EvidenceRequirement[] = unit.evidenceRequired;

  function handleCapture() {
    if (!filename) return;
    captureEvidence(unit.id, type, filename, sourceFor(type));
    setFilename('');
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Required evidence list */}
      <div className="col-span-5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-2">Required evidence</div>
        <ul className="space-y-2">
          {required.length === 0 && (
            <li className="text-[12px] text-[#6B7280] italic">No evidence required for this unit.</li>
          )}
          {required.map((r, i) => {
            const matches = evidence.filter(e => e.objectType === r.objectType);
            const status = matches.find(e => e.status === 'Valid') ? 'Valid'
                          : matches.find(e => e.status === 'Pending') ? 'Pending'
                          : matches.find(e => e.status === 'Rejected') ? 'Rejected'
                          : 'Pending';
            return (
              <li key={i} className="border border-[#E5E7EB] rounded-[8px] p-3 bg-white">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[12px] font-semibold text-[#0B1220]">{r.objectType}</div>
                  <StatusPill status={status} />
                </div>
                <div className="text-[11px] text-[#4B5563] mt-1">
                  Fields: <span className="font-mono">{r.requiredFields.join(', ')}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Capture region */}
      <div className="col-span-7">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-2">Capture evidence</div>
        <div className="border border-dashed border-[#E5E7EB] rounded-[10px] p-4 bg-[#F7F8FA]">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[11px] text-[#4B5563]">Object type</span>
              <select
                value={type}
                onChange={e => setType(e.target.value as EvidenceObjectType)}
                className="mt-1 w-full text-[12px] border border-[#E5E7EB] rounded-md px-2 py-1.5 bg-white"
              >
                {required.map((r, i) => (
                  <option key={i} value={r.objectType}>{r.objectType}</option>
                ))}
                {required.length === 0 && <option value="FileUpload">FileUpload</option>}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] text-[#4B5563]">Filename</span>
              <input
                value={filename}
                onChange={e => setFilename(e.target.value)}
                placeholder="e.g., RN-License-CA-PSV-2026-04.pdf"
                className="mt-1 w-full text-[12px] border border-[#E5E7EB] rounded-md px-2 py-1.5 bg-white"
              />
            </label>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="text-[10px] text-[#6B7280]">
              Saved as immutable, hash-bound to subject + unit + policy version.
            </div>
            <button
              type="button"
              onClick={handleCapture}
              disabled={!filename}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-md bg-[#0B2545] text-white disabled:bg-[#9CA3AF] hover:bg-[#13355E]"
            >
              <Upload size={14} /> Capture
            </button>
          </div>
        </div>

        <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-2">Captured artifacts</div>
        {evidence.length === 0 ? (
          <div className="text-[12px] text-[#6B7280] italic">No evidence captured yet.</div>
        ) : (
          <ul className="space-y-2">
            {evidence.map(e => (
              <li key={e.id} className="flex items-center justify-between gap-3 border border-[#E5E7EB] rounded-[8px] px-3 py-2.5 bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={16} className="text-[#13355E]" />
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold text-[#0B1220] truncate">{e.filename}</div>
                    <div className="text-[10px] text-[#6B7280] tabular-nums">
                      {e.objectType} · {e.contentHash.slice(0, 22)}… · {new Date(e.createdAt).toLocaleString()}
                    </div>
                    {e.policyVersionRef && (
                      <div className="mt-1"><PolicyVersionLink policy={e.policyVersionRef} compact /></div>
                    )}
                    {e.rejectionReason && (
                      <div className="text-[11px] text-[#B42318] mt-1">Rejected: {e.rejectionReason}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusPill status={e.status} />
                  {e.status === 'Valid' && (
                    <button
                      type="button"
                      onClick={() => rejectEvidence(e.id, 'Rejected by reviewer')}
                      className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-[#B42318] hover:underline"
                    >
                      <RefreshCw size={12} /> Reject
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function sourceFor(t: EvidenceObjectType): EvidenceObject['source'] {
  switch (t) {
    case 'TrainingRecord':       return 'ExternalAPI';
    case 'FormSubmission':       return 'FormSubmission';
    case 'ExternalSystemRecord': return 'ExternalAPI';
    case 'ScreeningResult':      return 'ExternalAPI';
    case 'PSVResult':            return 'ExternalAPI';
    case 'CompetencyArtifact':   return 'FormSubmission';
    case 'SignedPolicy':         return 'SystemAttestation';
    case 'FileUpload':           return 'UserUpload';
  }
}
