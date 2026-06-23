import { useCallback, useMemo, useState } from 'react';
import { PenTool, ShieldAlert, CheckCircle2, FileSignature, RefreshCw, Lock } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { useEcignSignerIdentity } from './signerIdentity';
import { resolveUserPermissionRoles } from './permissionRoles';
import { useEcignConsentStore } from './ecignConsentStore';
import { useEcignSignatureProfileStore } from './ecignSignatureProfileStore';
import { useEcignSignatureRecordStore, buildSignatureRecordId } from './ecignSignatureRecordStore';
import { evaluateSignReadiness, applyOneClickSignature, type SigningContext } from './ecignSigning';
import { ECIgnSetupModal } from './ECIgnSetupModal';
import type { ECIgnPermissionRole, ECIgnSignatureIntentMethod, SignerRole } from './types';

/* ═══════════════════════════════════════════════════════════════════
   ECIgnSignatureField — one-click document signing.

   After enrollment, clicking this field applies the stored signature to the
   specific form instance with a single intentional click. It never shows the
   agreement popup or signature pad again while consent + signature profile are
   active/current. It never creates a form instance or a signer task.
   ═══════════════════════════════════════════════════════════════════ */

const CI_TEAL = '#00797D';
const CI_INK = '#1F1C1B';
const CI_MUTED = '#747470';
const CI_LINE = '#E5E4E3';
const CI_RED = '#b91c1c';

export interface ECIgnSignatureFieldProps {
  taskId: string;
  formId: string;
  formInstanceId?: string;
  eventId?: string;
  workflowId?: string;
  signerRole: SignerRole;
  requiredPermissionRole: ECIgnPermissionRole;
  signatureSlot?: string;
  signatureRequirementId?: string;
  /** A signer task/requirement must already exist; defaults true when rendered from a resolved requirement. */
  hasSignerTask?: boolean;
  mode?: 'template' | 'event_execution';
  /** icon (compact button) or field (signature line). */
  variant?: 'icon' | 'field';
  intentMethod?: ECIgnSignatureIntentMethod;
  onSigned?: (result: { signatureId: string; certificateId: string }) => void;
}

export function ECIgnSignatureField(props: ECIgnSignatureFieldProps) {
  const {
    taskId, formId, formInstanceId, eventId, workflowId,
    signerRole, requiredPermissionRole, signatureSlot, signatureRequirementId,
    hasSignerTask = true, mode = 'event_execution', variant = 'field',
    intentMethod = variant === 'icon' ? 'clicked_signature_icon' : 'clicked_signature_field',
    onSigned,
  } = props;

  const { user } = useAuth();
  const signer = useEcignSignerIdentity();
  const [showSetup, setShowSetup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to stores so readiness + signed state stay reactive.
  const consentProfiles = useEcignConsentStore(s => s.profiles);
  const signatureProfiles = useEcignSignatureProfileStore(s => s.profiles);
  const records = useEcignSignatureRecordStore(s => s.records);

  const permissionRoles = useMemo(() => resolveUserPermissionRoles(signer.role), [signer.role]);

  const signingContext: SigningContext = useMemo(() => ({
    authenticated: Boolean(user) || Boolean(signer.id),
    signer: { userId: signer.id, displayName: signer.name, permissionRoles },
    hasSignerTask,
    signerRole,
    requiredPermissionRole,
    taskId,
    formId,
    formInstanceId,
    eventId,
    workflowId,
    signatureSlot,
    signatureRequirementId,
    mode,
  }), [
    user, signer.id, signer.name, permissionRoles, hasSignerTask, signerRole, requiredPermissionRole,
    taskId, formId, formInstanceId, eventId, workflowId, signatureSlot, signatureRequirementId, mode,
  ]);

  const existingRecord = useMemo(() => {
    if (!formInstanceId) return null;
    const id = buildSignatureRecordId({ taskId, formInstanceId, signatureSlot, signerUserId: signer.id });
    return records.find(r => r.signatureId === id) ?? null;
    // consentProfiles/signatureProfiles intentionally not deps — record identity is stable
  }, [records, taskId, formInstanceId, signatureSlot, signer.id]);

  const activeProfile = useMemo(
    () => signatureProfiles.find(p => p.userId === signer.id && p.status === 'active') ?? null,
    [signatureProfiles, signer.id],
  );

  // Re-evaluate whenever stores change (consentProfiles referenced to satisfy reactivity).
  const readiness = useMemo(
    () => evaluateSignReadiness(signingContext),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signingContext, consentProfiles, signatureProfiles],
  );

  const handleSign = useCallback(() => {
    setError(null);
    const result = applyOneClickSignature({ ...signingContext, intentMethod });
    if (!result.ok) {
      if (result.readiness.needsSetup) {
        setShowSetup(true);
        return;
      }
      setError(result.readiness.message);
      return;
    }
    if (result.signatureId && result.certificateId) {
      onSigned?.({ signatureId: result.signatureId, certificateId: result.certificateId });
    }
  }, [signingContext, intentMethod, onSigned]);

  /* ── Already signed ─────────────────────────────────────────────── */
  if (existingRecord) {
    const signedProfile = signatureProfiles.find(p => p.signatureProfileId === existingRecord.signatureProfileId);
    return (
      <div className="rounded-lg border bg-[#F0FDFC] px-3 py-2.5" style={{ borderColor: '#86EFAC' }}>
        <div className="flex items-center gap-2 font-roboto text-[12px] font-medium" style={{ color: CI_TEAL }}>
          <CheckCircle2 size={14} /> Signed by {existingRecord.signerRole}
          <Lock size={12} className="ml-1 opacity-70" />
        </div>
        <div className="mt-1.5">
          {signedProfile?.signatureImageDataUrl ? (
            <img src={signedProfile.signatureImageDataUrl} alt="Applied signature" className="h-12 w-auto" />
          ) : (
            <span style={{ fontFamily: 'Brush Script MT, cursive', fontSize: 24, color: CI_INK }}>
              {signedProfile?.typedSignatureText ?? signer.name}
            </span>
          )}
        </div>
        <div className="mt-1 font-roboto text-[10px]" style={{ color: CI_MUTED }}>
          {new Date(existingRecord.signedAt).toLocaleString()} · Certificate {existingRecord.certificateId}
        </div>
      </div>
    );
  }

  /* ── Blocked: needs setup / permission / version / profile ──────── */
  if (!readiness.canSign) {
    const reason = readiness.blockReason;
    if (reason === 'template_mode') {
      return (
        <div className="rounded-lg border border-dashed px-3 py-2.5 font-roboto text-[11px]" style={{ borderColor: CI_LINE, color: CI_MUTED }}>
          <FileSignature size={13} className="mr-1 inline" /> Template preview — signing is available on the event form instance.
        </div>
      );
    }
    if (reason === 'missing_permission') {
      return (
        <div className="rounded-lg border px-3 py-2.5 font-roboto text-[11px]" style={{ borderColor: '#FCA5A5', color: CI_RED, background: '#FEF2F2' }}>
          <ShieldAlert size={13} className="mr-1 inline" /> {readiness.message}
        </div>
      );
    }
    if (reason === 'no_signature_profile') {
      return (
        <BlockedAction message="eCIgn signature profile required before signing." cta="Create Signature Profile" onClick={() => setShowSetup(true)} setupModal={showSetup} onCloseSetup={() => setShowSetup(false)} />
      );
    }
    if (reason === 'consent_version_changed') {
      return (
        <BlockedAction icon={<RefreshCw size={14} />} message="Updated eCIgn agreement requires review before signing." cta="Review Updated Agreement" onClick={() => setShowSetup(true)} setupModal={showSetup} onCloseSetup={() => setShowSetup(false)} />
      );
    }
    if (reason === 'no_consent_profile') {
      return (
        <BlockedAction message="eCIgn setup required before signing." cta="Complete eCIgn Setup" onClick={() => setShowSetup(true)} setupModal={showSetup} onCloseSetup={() => setShowSetup(false)} />
      );
    }
    // honest non-actionable states (missing form instance, no signer task, etc.)
    return (
      <div className="rounded-lg border border-dashed px-3 py-2.5 font-roboto text-[11px]" style={{ borderColor: CI_LINE, color: CI_MUTED }}>
        <FileSignature size={13} className="mr-1 inline" /> {readiness.message}
      </div>
    );
  }

  /* ── Ready: one-click signing ───────────────────────────────────── */
  if (variant === 'icon') {
    return (
      <>
        <button
          type="button"
          onClick={handleSign}
          title={`Click to sign as ${signerRole} (${requiredPermissionRole})`}
          aria-label={`Sign as ${signerRole}`}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-roboto text-[12px] font-semibold text-white"
          style={{ background: CI_TEAL }}
        >
          <PenTool size={14} /> Sign
        </button>
        {error && <span className="ml-2 font-roboto text-[10px]" style={{ color: CI_RED }}>{error}</span>}
        <ECIgnSetupModal open={showSetup} onClose={() => setShowSetup(false)} onComplete={() => setShowSetup(false)} />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleSign}
        className="group flex w-full items-center gap-3 rounded-lg border border-dashed px-3 py-3 text-left transition-colors hover:border-[#00797D]"
        style={{ borderColor: CI_LINE }}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: '#E5FEFF', color: CI_TEAL }}>
          <PenTool size={15} />
        </span>
        <span className="flex-1">
          <span className="block font-roboto text-[12px] font-semibold" style={{ color: CI_INK }}>Click to apply your eCIgn signature</span>
          <span className="block font-roboto text-[10px]" style={{ color: CI_MUTED }}>
            Sign as {signerRole} · {requiredPermissionRole}
            {activeProfile ? ' · reusing your signature profile' : ''}
          </span>
        </span>
        <span className="font-roboto text-[11px] font-semibold" style={{ color: CI_TEAL }}>Sign</span>
      </button>
      {error && <div className="mt-1 font-roboto text-[10px]" style={{ color: CI_RED }}>{error}</div>}
      <ECIgnSetupModal open={showSetup} onClose={() => setShowSetup(false)} onComplete={() => setShowSetup(false)} />
    </>
  );
}

function BlockedAction({ message, cta, onClick, setupModal, onCloseSetup, icon }: {
  message: string;
  cta: string;
  onClick: () => void;
  setupModal: boolean;
  onCloseSetup: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <>
      <div className="rounded-lg border px-3 py-2.5" style={{ borderColor: '#FDE68A', background: '#FFFBEB' }}>
        <div className="font-roboto text-[11px]" style={{ color: '#92400E' }}>{message}</div>
        <button type="button" onClick={onClick} className="mt-2 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-roboto text-[11px] font-semibold text-white" style={{ background: CI_TEAL }}>
          {icon ?? <PenTool size={13} />} {cta}
        </button>
      </div>
      <ECIgnSetupModal open={setupModal} onClose={onCloseSetup} onComplete={onCloseSetup} />
    </>
  );
}

export default ECIgnSignatureField;
