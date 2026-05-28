import { useState, useCallback } from 'react';
import eCignLogo from '@/assets/eCIgn.png';
import {
  CheckCircle2, Clock, Send, Printer,
  Save, User, Lock,
} from 'lucide-react';
import {
  type SecondSigTask,
  type SignFlowState,
  type DemoUser,
  DEMO_STAFF,
  signerNanoid,
} from './FormSignatureContext';
import { useAuth } from '@/auth/AuthProvider';
import { authorizeForAuthUser } from '@/policy/security/identity';
import { useEcignSignerIdentity } from '@/policy/ecign/signerIdentity';
import { isDonAssistant } from '@/policy/ces/cesRoles';

/* ═══════════════════════════════════════════════════════════════════
   FormSignatureFlow — CI-App Internal Signature Flow
   Light mode only.  Action banner + second signature modal.

   Sign buttons live inside each signature field in the form.
   This component handles post-sign actions:
     • Send for Second Signature
     • Print / Download
     • Save Draft
   ═══════════════════════════════════════════════════════════════════ */

const CI_TEAL   = '#007970';
const CI_MUTED  = '#747470';
const CI_AMBER  = '#B45309';

// ── Second Signature Modal ───────────────────────────────────────────

interface SecondSigModalProps {
  formInstanceId: string;
  onConfirm:      (task: SecondSigTask) => void;
  onClose:        () => void;
}

function SecondSignatureModal({ formInstanceId, onConfirm, onClose }: SecondSigModalProps) {
  const [selected, setSelected] = useState<DemoUser | null>(null);
  const signer = useEcignSignerIdentity();

  // Only users exactly one tier above current session user are valid approvers
  const isApprover = (u: DemoUser) => u.tier === signer.tier - 1;
  const isSelf     = (u: DemoUser) => u.id === signer.id;

  const handleConfirm = useCallback(() => {
    if (!selected) return;
    onConfirm({
      taskId:         `task_${signerNanoid(12)}`,
      type:           'signature_request',
      formInstanceId,
      assignedTo:     selected.id,
      assignedBy:     signer.id,
      status:         'pending',
      createdAt:      new Date().toISOString(),
      // Phase 11 — task-created flow does not have direct policy context here;
      // FormViewer/eCIgn workspace sets the authoritative linked policies on
      // the parent artifact and propagates them via the second-sig task it
      // builds in handleSelectApprover. This local fallback keeps the type
      // sound when the modal is opened outside that flow.
      linkedPolicyIds: [],
    });
  }, [formInstanceId, onConfirm, selected, signer.id]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Light backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div className="relative z-10 bg-white rounded-2xl border border-[#E5E4E3] shadow-lg w-full max-w-[480px] overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E4E3] flex items-center justify-between">
          <div>
            <h2 className="font-montserrat font-bold text-[14px] tracking-[0.06em] text-[#1F1C1B]">
              Send for Second Signature
            </h2>
            <p className="font-roboto text-[11px] text-[#747470] mt-0.5">
              Select an approver from the directory
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md border border-[#E5E4E3] flex items-center justify-center text-[#747470] hover:bg-[#F8FAF9] text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Info strip */}
        <div className="px-6 py-2.5 bg-[#F8FAF9] border-b border-[#E5E4E3]">
          <p className="font-roboto text-[11px] text-[#747470]">
            Signed as&nbsp;
            <strong className="font-semibold text-[#1F1C1B]">{signer.name}</strong>
            &nbsp;·&nbsp;{signer.role}. Only one-tier-above approvers are selectable.
          </p>
        </div>

        {/* Staff list */}
        <div className="px-4 py-3 max-h-[320px] overflow-y-auto">
          <p className="font-roboto text-[9px] text-[#747470] uppercase tracking-[0.12em] mb-2 px-2">
            Staff Directory
          </p>
          <ul className="space-y-1">
            {DEMO_STAFF.map(user => {
              const selectable = isApprover(user) && !isSelf(user);
              const self       = isSelf(user);
              const chosen     = selected?.id === user.id;

              return (
                <li key={user.id}>
                  <button
                    type="button"
                    disabled={!selectable}
                    onClick={() => selectable && setSelected(user)}
                    className={[
                      'w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors border',
                      selectable
                        ? chosen
                          ? 'bg-[#E5FEFF] border-[#007970]'
                          : 'hover:bg-[#F8FAF9] border-transparent'
                        : 'opacity-40 cursor-not-allowed border-transparent',
                    ].join(' ')}
                  >
                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-montserrat font-bold text-[11px] shrink-0"
                      style={{
                        background: selectable ? '#E5FEFF' : '#F2F2F0',
                        color:      selectable ? CI_TEAL   : CI_MUTED,
                      }}
                    >
                      {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>

                    {/* Name + role */}
                    <div className="flex-1 min-w-0">
                      <div className="font-roboto font-semibold text-[13px] text-[#1F1C1B] leading-tight">
                        {user.name}
                      </div>
                      <div className="font-roboto text-[11px] text-[#747470]">{user.role}</div>
                    </div>

                    {/* Radio indicator */}
                    {selectable && (
                      <div
                        className="shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors"
                        style={{
                          borderColor: chosen ? CI_TEAL  : '#C8C6C5',
                          background:  chosen ? CI_TEAL  : 'transparent',
                        }}
                      >
                        {chosen && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    )}
                    {self && (
                      <span className="font-roboto text-[9px] text-[#747470] bg-[#F2F2F0] px-2 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E4E3] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#E5E4E3] font-roboto text-[12px] text-[#747470] hover:bg-[#F8FAF9] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selected}
            className="px-5 py-2 rounded-lg font-roboto text-[12px] font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: CI_TEAL }}
          >
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Props ────────────────────────────────────────────────────────────

export interface FormSignatureFlowProps {
  formId:          string;
  formTitle:       string;
  formVersion:     string;
  formInstanceId:  string;
  maxW:            string;
  flowState:       SignFlowState;
  hasSigned:       boolean;
  secondSigTask:   SecondSigTask | null;
  onRequestSecond: (task: SecondSigTask) => void;
  onPrint:         () => void;
}

// ── Main export ──────────────────────────────────────────────────────

export function FormSignatureFlow({
  formId: _formId,
  formInstanceId,
  maxW,
  flowState,
  hasSigned,
  secondSigTask,
  onRequestSecond,
  onPrint,
}: FormSignatureFlowProps) {
  const { user } = useAuth();
  const signer = useEcignSignerIdentity();
  const [showSecondSig, setShowSecondSig] = useState(false);
  const [savedDraft,    setSavedDraft]    = useState(false);

  const handleSecondConfirm = useCallback((task: SecondSigTask) => {
    onRequestSecond(task);
    setShowSecondSig(false);
  }, [onRequestSecond]);

  const handleSaveDraft = () => {
    setSavedDraft(true);
    setTimeout(() => setSavedDraft(false), 2500);
  };

  const isPending  = flowState === 'pending_second';
  const isComplete = flowState === 'completed';
  const signDecision = authorizeForAuthUser(user, 'form.sign', {
    kind: 'form',
    id: formInstanceId,
    scope: { organizationId: 'careindeed-demo' },
    meta: {
      assignedByUserId: signer.id,
      selfAttestationAllowed: false,
    },
  });
  const donAssistantBlocked = isDonAssistant(signer.role);
  const effectiveSignDecision = donAssistantBlocked
    ? { allow: false, reason: 'DON Assistant may prepare forms but cannot apply or route legally binding signatures.' }
    : signDecision;

  return (
    <>
      <div className={`no-print mx-auto ${maxW} px-4 md:px-8 pb-4`}>
        <div
          className="rounded-[10px] border bg-white px-4 py-3 flex flex-wrap items-center gap-2"
          style={{ borderColor: isComplete ? '#86EFAC' : isPending ? '#FDE68A' : '#E5E4E3' }}
        >
          {/* ── State badge ── */}
          <div className="flex items-center gap-1.5 shrink-0">
            {flowState === 'unsigned' && (
              <span className="inline-flex items-center gap-1.5 font-roboto text-[11px]" style={{ color: CI_MUTED }}>
                <Clock size={12} /> Awaiting Signature
              </span>
            )}
            {flowState === 'signed' && (
              <span className="inline-flex items-center gap-1.5 font-roboto font-medium text-[11px]" style={{ color: CI_TEAL }}>
                <CheckCircle2 size={12} /> Signed
              </span>
            )}
            {isPending && (
              <span className="inline-flex items-center gap-1.5 font-roboto font-medium text-[11px]" style={{ color: CI_AMBER }}>
                <Clock size={12} /> Pending Second Signature
              </span>
            )}
            {isComplete && (
              <span className="inline-flex items-center gap-1.5 font-roboto font-medium text-[11px] text-green-700">
                <Lock size={12} /> Completed
              </span>
            )}
          </div>

          {hasSigned && <div className="w-px h-4 bg-[#E5E4E3] shrink-0" />}

          {/* ── Post-sign actions ── */}
          {hasSigned && (
            <>
              {/* Send for second signature — only in 'signed' state */}
              {flowState === 'signed' && (
                <button
                  type="button"
                  disabled={!effectiveSignDecision.allow}
                  onClick={() => setShowSecondSig(true)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-[7px] text-white font-roboto text-[12px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-45 disabled:cursor-not-allowed"
                  style={{ background: CI_TEAL }}
                  title={!effectiveSignDecision.allow ? effectiveSignDecision.reason : undefined}
                >
                  <Send size={13} /> Send for Second Signature
                </button>
              )}
              {flowState === 'signed' && !effectiveSignDecision.allow && (
                <span className="font-roboto text-[10px] text-[#b91c1c]">
                  {effectiveSignDecision.reason}
                </span>
              )}

              {/* Pending task summary */}
              {isPending && secondSigTask && (
                <div className="flex items-center gap-1.5 font-roboto text-[11px]" style={{ color: CI_AMBER }}>
                  <User size={12} />
                  <span>
                    Task&nbsp;<span className="font-mono text-[10px]">{secondSigTask.taskId}</span>
                    &nbsp;·&nbsp;Assigned to&nbsp;
                    <strong className="font-semibold">
                      {DEMO_STAFF.find(u => u.id === secondSigTask.assignedTo)?.name ?? secondSigTask.assignedTo}
                    </strong>
                  </span>
                </div>
              )}

              {/* Print / Download */}
              <button
                type="button"
                onClick={onPrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-[#E5E4E3] font-roboto text-[12px] text-[#1F1C1B] hover:bg-[#F8FAF9] transition-colors"
              >
                <Printer size={13} /> Print / Download
              </button>

              {/* Save Draft */}
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-[#E5E4E3] font-roboto text-[12px] text-[#1F1C1B] hover:bg-[#F8FAF9] transition-colors"
              >
                <Save size={13} /> {savedDraft ? 'Saved' : 'Save Draft'}
              </button>
            </>
          )}

          {/* ── Powered by eCign ── */}
          <div className="ml-auto flex items-center gap-1.5 shrink-0 pl-2">
            <span className="font-roboto text-[10px] select-none" style={{ color: CI_MUTED }}>
              Powered by
            </span>
            <img src={eCignLogo} alt="eCign" className="h-10 w-auto" />
          </div>
        </div>
      </div>

      {/* ── Second signature modal ── */}
      {showSecondSig && (
        <SecondSignatureModal
          formInstanceId={formInstanceId}
          onConfirm={handleSecondConfirm}
          onClose={() => setShowSecondSig(false)}
        />
      )}
    </>
  );
}

export default FormSignatureFlow;
