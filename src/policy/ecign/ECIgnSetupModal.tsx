import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ShieldCheck, PenLine, Eraser, ChevronDown, ChevronRight } from 'lucide-react';
import { useEcignSignerIdentity } from './signerIdentity';
import { resolveUserPermissionRoles } from './permissionRoles';
import { ECIGN_AGREEMENT_TEXT, ECIGN_AGREEMENT_VERSION } from './ecignAgreement';
import { useEcignConsentStore } from './ecignConsentStore';
import { useEcignSignatureProfileStore } from './ecignSignatureProfileStore';
import type { ECIgnSignatureMethod } from './types';

/* ═══════════════════════════════════════════════════════════════════
   ECIgnSetupModal — one-time eCIgn enrollment.

   Appears ONLY when the signer has no active consent profile / signature
   profile at the current agreement version, or when consent/profile is
   missing/revoked/superseded. It fully explains the eCIgn process, records a
   manually-accepted consent profile, and captures a reusable signature/initials
   profile. It never auto-consents and never signs a document.
   ═══════════════════════════════════════════════════════════════════ */

const CI_TEAL = '#00797D';
const CI_INK = '#1F1C1B';
const CI_MUTED = '#747470';
const CI_LINE = '#E5E4E3';

type CaptureMode = 'draw' | 'type';

/** Emits the current PNG data URL (or null when empty) after each stroke/clear. */
function SignaturePad({ onCapture, ariaLabel }: { onCapture: (dataUrl: string | null) => void; ariaLabel: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);

  const getCtx = () => canvasRef.current?.getContext('2d') ?? null;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = CI_INK;
  }, []);

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (e.currentTarget.width / rect.width),
      y: (e.clientY - rect.top) * (e.currentTarget.height / rect.height),
    };
  };

  const handleDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = getCtx();
    if (!ctx) return;
    drawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = pointFromEvent(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = pointFromEvent(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    hasInk.current = true;
  };

  const handleUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (hasInk.current && canvasRef.current) onCapture(canvasRef.current.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasInk.current = false;
    onCapture(null);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={520}
        height={140}
        aria-label={ariaLabel}
        role="img"
        className="w-full touch-none rounded-lg border border-dashed bg-[#FAFBFB]"
        style={{ borderColor: CI_LINE, height: 140 }}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerLeave={handleUp}
      />
      <button
        type="button"
        onClick={clear}
        className="mt-2 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] text-[#747470] hover:bg-[#F8FAF9]"
        style={{ borderColor: CI_LINE }}
      >
        <Eraser size={12} /> Clear
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t pt-4" style={{ borderColor: CI_LINE }}>
      <h4 className="font-montserrat text-[12px] font-bold uppercase tracking-[0.08em]" style={{ color: CI_INK }}>{title}</h4>
      <div className="mt-1.5 font-roboto text-[12px] leading-6" style={{ color: CI_MUTED }}>{children}</div>
    </section>
  );
}

export interface ECIgnSetupModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after consent + signature profile are saved. */
  onComplete?: () => void;
}

export function ECIgnSetupModal({ open, onClose, onComplete }: ECIgnSetupModalProps) {
  const signer = useEcignSignerIdentity();
  const recordConsent = useEcignConsentStore(s => s.recordConsent);
  const saveSignatureProfile = useEcignSignatureProfileStore(s => s.saveSignatureProfile);

  const permissionRoles = useMemo(() => resolveUserPermissionRoles(signer.role), [signer.role]);

  const [agreed, setAgreed] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [sigMode, setSigMode] = useState<CaptureMode>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [drawnSignatureUrl, setDrawnSignatureUrl] = useState<string | null>(null);
  const [initialsMode, setInitialsMode] = useState<CaptureMode>('type');
  const [typedInitials, setTypedInitials] = useState('');
  const [drawnInitialsUrl, setDrawnInitialsUrl] = useState<string | null>(null);
  const [showAgreement, setShowAgreement] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Reset to a clean, non-consented state every time it opens.
    setAgreed(false);
    setDisplayName(signer.name);
    setLegalName('');
    setSigMode('draw');
    setTypedSignature('');
    setDrawnSignatureUrl(null);
    setInitialsMode('type');
    setTypedInitials(signer.initials ?? '');
    setDrawnInitialsUrl(null);
    setShowAgreement(false);
  }, [open, signer.name, signer.initials]);

  const signatureCaptured = sigMode === 'draw' ? Boolean(drawnSignatureUrl) : typedSignature.trim().length > 0;
  const identityPresent = displayName.trim().length > 0;
  const canAccept = agreed && signatureCaptured && identityPresent;

  const handleAccept = useCallback(() => {
    if (!canAccept) return;

    const consent = recordConsent({
      userId: signer.id,
      signerDisplayName: displayName.trim(),
      signerLegalName: legalName.trim() || undefined,
      requiredPermissionRoles: permissionRoles,
      consentAcceptedUserAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    });

    const signatureMethod: ECIgnSignatureMethod = sigMode === 'draw' ? 'drawn' : 'typed';
    const signatureImageDataUrl = sigMode === 'draw' ? drawnSignatureUrl ?? undefined : undefined;
    const initialsImageDataUrl = initialsMode === 'draw' ? drawnInitialsUrl ?? undefined : undefined;
    const typedInitialsText = initialsMode === 'type' && typedInitials.trim() ? typedInitials.trim() : undefined;
    const hasInitials = Boolean(initialsImageDataUrl || typedInitialsText);

    saveSignatureProfile({
      userId: signer.id,
      signerDisplayName: displayName.trim(),
      signerLegalName: legalName.trim() || undefined,
      signatureImageDataUrl,
      typedSignatureText: sigMode === 'type' ? typedSignature.trim() : undefined,
      initialsImageDataUrl,
      typedInitialsText,
      signatureMethod,
      initialsMethod: hasInitials ? (initialsMode === 'draw' ? 'drawn' : 'typed') : undefined,
      consentProfileId: consent.consentProfileId,
      consentVersion: consent.consentVersion,
    });

    onComplete?.();
    onClose();
  }, [
    canAccept, recordConsent, signer.id, displayName, legalName, permissionRoles,
    sigMode, typedSignature, drawnSignatureUrl, initialsMode, drawnInitialsUrl, typedInitials,
    saveSignatureProfile, onComplete, onClose,
  ]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Set Up eCIgn Electronic Signature">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl border bg-white shadow-xl" style={{ borderColor: CI_LINE }}>
        {/* Header */}
        <div className="flex items-center gap-3 border-b px-6 py-4" style={{ borderColor: CI_LINE }}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: '#E5FEFF', color: CI_TEAL }}>
            <ShieldCheck size={18} />
          </span>
          <div>
            <h2 className="font-montserrat text-[15px] font-bold" style={{ color: CI_INK }}>Set Up eCIgn Electronic Signature</h2>
            <p className="font-roboto text-[11px]" style={{ color: CI_MUTED }}>
              One-time enrollment · Agreement {ECIGN_AGREEMENT_VERSION}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="ml-auto flex h-8 w-8 items-center justify-center rounded-md border text-lg leading-none text-[#747470] hover:bg-[#F8FAF9]" style={{ borderColor: CI_LINE }}>×</button>
        </div>

        {/* Body */}
        <div className="space-y-4 overflow-y-auto px-6 py-4">
          <p className="font-roboto text-[12px] leading-6" style={{ color: CI_INK }}>
            This is a <strong>one-time eCIgn enrollment</strong>. After you accept, you can apply future signatures by clicking the
            eCIgn icon or signature field on assigned documents — as long as your consent profile, signature profile, and permission
            role remain valid.
          </p>

          <Section title="1. What eCIgn Means">
            eCIgn allows you to apply your electronic signature, approval, attestation, acknowledgment, or review to assigned documents,
            forms, evidence packets, and workflow records inside this system. When you sign, the system records your identity, assigned
            role, eCIgn permission role, date/time, document context, and audit metadata.
          </Section>

          <Section title="2. One-Time Agreement">
            This setup records your agreement to use eCIgn for documents you are authorized to sign. You will not be asked to review this
            agreement every time you sign unless the agreement changes, your consent expires or is revoked, your signature profile is
            missing or revoked, or your account/signing authority changes.
          </Section>

          <Section title="3. What Happens When You Click the eCIgn Icon">
            After setup, clicking an eCIgn icon or signature field on a document means you intend to apply your electronic signature to
            that specific document or form instance. The system will check your identity, signer assignment, eCIgn permission role, active
            consent profile, active signature profile, form instance, event, workflow, and task context before applying the signature.
          </Section>

          <Section title="4. What the System Records">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px]">
              {[
                'Signer name', 'User ID', 'Signer role', 'Required eCIgn permission role',
                'Consent profile ID', 'Consent version', 'Consent text hash', 'Consent accepted timestamp',
                'Signature profile ID', 'Signature profile hash', 'Signature method', 'Signature timestamp',
                'Event ID (if applicable)', 'Workflow ID (if applicable)', 'Task ID', 'Form ID',
                'Form instance ID', 'Document hash (where available)', 'IP / device / user agent', 'Signature intent (icon or field)',
              ].map(item => <li key={item} className="list-disc pl-1 marker:text-[#cbd5e1]">{item}</li>)}
            </ul>
          </Section>

          <Section title="5. Your Responsibility">
            You are responsible for keeping your login credentials secure. Do not allow another person to sign using your account. Do not
            click the eCIgn icon unless you intend to sign the displayed document in your assigned role. Report suspected account
            compromise or unauthorized signing immediately.
          </Section>

          <Section title="6. Permission Requirement">
            Being listed as a signer is not enough by itself. You must also have the required eCIgn permission role. If you do not have the
            required permission, the system will block the signature and show a missing-permission message.
            <div className="mt-2 font-roboto text-[11px]" style={{ color: CI_INK }}>
              Your eCIgn permission role{permissionRoles.length > 1 ? 's' : ''}: <strong>{permissionRoles.join(', ') || 'None'}</strong>
            </div>
          </Section>

          <Section title="7. Certificate Statement">
            Each completed eCIgn signature will generate or contribute to a signature certificate. The certificate will state that you had
            an active eCIgn consent profile, identify the agreement version you accepted, identify the active signature profile used, and
            record that you clicked the eCIgn icon or signature field for the specific document.
          </Section>

          <Section title="8. Event / Form Context">
            For event-related forms, the form instance must already exist before signing. eCIgn does not create a new form instance when you
            click the signature icon. Your signature applies only to the specific form instance, task, workflow, and event shown in the
            signing context.
          </Section>

          {/* Create signature profile */}
          <section className="rounded-xl border p-4" style={{ borderColor: CI_LINE, background: '#FAFBFB' }}>
            <h4 className="flex items-center gap-1.5 font-montserrat text-[13px] font-bold" style={{ color: CI_INK }}>
              <PenLine size={14} /> Create Your eCIgn Signature
            </h4>
            <p className="mt-1 font-roboto text-[11px] leading-5" style={{ color: CI_MUTED }}>
              Your signature profile will be used as your consistent visual signature across documents you are authorized to sign. This does
              not sign any document by itself. Each document is signed only when you click the eCIgn icon or signature field for that specific
              document.
            </p>

            {/* Confirm signer name */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="font-roboto text-[10px] uppercase tracking-[0.1em]" style={{ color: CI_MUTED }}>Signer name</span>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="mt-1 w-full rounded-md border px-2.5 py-1.5 font-roboto text-[12px]" style={{ borderColor: CI_LINE }} />
              </label>
              <label className="block">
                <span className="font-roboto text-[10px] uppercase tracking-[0.1em]" style={{ color: CI_MUTED }}>Legal name (optional)</span>
                <input value={legalName} onChange={e => setLegalName(e.target.value)} className="mt-1 w-full rounded-md border px-2.5 py-1.5 font-roboto text-[12px]" style={{ borderColor: CI_LINE }} />
              </label>
            </div>

            {/* Signature capture */}
            <div className="mt-3">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="font-roboto text-[10px] uppercase tracking-[0.1em]" style={{ color: CI_MUTED }}>Signature</span>
                <div className="ml-auto flex gap-1">
                  {(['draw', 'type'] as CaptureMode[]).map(m => (
                    <button key={m} type="button" onClick={() => setSigMode(m)}
                      className="rounded-md border px-2 py-0.5 text-[10px] capitalize"
                      style={{ borderColor: sigMode === m ? CI_TEAL : CI_LINE, color: sigMode === m ? CI_TEAL : CI_MUTED, background: sigMode === m ? '#E5FEFF' : 'white' }}>
                      {m === 'draw' ? 'Draw' : 'Type'}
                    </button>
                  ))}
                </div>
              </div>
              {sigMode === 'draw' ? (
                <SignaturePad ariaLabel="Draw your signature" onCapture={setDrawnSignatureUrl} />
              ) : (
                <div>
                  <input value={typedSignature} onChange={e => setTypedSignature(e.target.value)} placeholder="Type your full name as your signature"
                    className="w-full rounded-md border px-3 py-2 font-roboto text-[12px]" style={{ borderColor: CI_LINE }} />
                  {typedSignature.trim() && (
                    <div className="mt-2 rounded-md border bg-white px-3 py-3 text-center" style={{ borderColor: CI_LINE }}>
                      <span style={{ fontFamily: 'Brush Script MT, cursive', fontSize: 26, color: CI_INK }}>{typedSignature}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Initials capture (optional) */}
            <div className="mt-3">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="font-roboto text-[10px] uppercase tracking-[0.1em]" style={{ color: CI_MUTED }}>Initials (optional)</span>
                <div className="ml-auto flex gap-1">
                  {(['type', 'draw'] as CaptureMode[]).map(m => (
                    <button key={m} type="button" onClick={() => setInitialsMode(m)}
                      className="rounded-md border px-2 py-0.5 text-[10px] capitalize"
                      style={{ borderColor: initialsMode === m ? CI_TEAL : CI_LINE, color: initialsMode === m ? CI_TEAL : CI_MUTED, background: initialsMode === m ? '#E5FEFF' : 'white' }}>
                      {m === 'draw' ? 'Draw' : 'Type'}
                    </button>
                  ))}
                </div>
              </div>
              {initialsMode === 'draw' ? (
                <SignaturePad ariaLabel="Draw your initials" onCapture={setDrawnInitialsUrl} />
              ) : (
                <input value={typedInitials} onChange={e => setTypedInitials(e.target.value)} placeholder="Initials"
                  className="w-32 rounded-md border px-3 py-2 font-roboto text-[12px] uppercase" style={{ borderColor: CI_LINE }} maxLength={6} />
              )}
            </div>
          </section>

          {/* View full agreement */}
          <button type="button" onClick={() => setShowAgreement(v => !v)} className="flex items-center gap-1 font-roboto text-[11px] font-medium" style={{ color: CI_TEAL }}>
            {showAgreement ? <ChevronDown size={14} /> : <ChevronRight size={14} />} View Full Agreement Text
          </button>
          {showAgreement && (
            <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border bg-[#FAFBFB] p-3 font-roboto text-[11px] leading-5" style={{ borderColor: CI_LINE, color: CI_MUTED }}>
              {ECIGN_AGREEMENT_TEXT.trim()}
            </pre>
          )}

          {/* Enrollment checkbox */}
          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border p-3" style={{ borderColor: agreed ? CI_TEAL : CI_LINE, background: agreed ? '#F0FDFC' : 'white' }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#00797D]" />
            <span className="font-roboto text-[12px] leading-5" style={{ color: CI_INK }}>
              I have read and agree to use eCIgn electronic signatures as described above. I understand that clicking an eCIgn icon or
              signature field on an assigned document is my intent to electronically sign that specific document.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t px-6 py-4" style={{ borderColor: CI_LINE }}>
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 font-roboto text-[12px] text-[#747470] hover:bg-[#F8FAF9]" style={{ borderColor: CI_LINE }}>Cancel</button>
          <button type="button" onClick={handleAccept} disabled={!canAccept}
            className="rounded-lg px-5 py-2 font-roboto text-[12px] font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: CI_TEAL }}>
            Accept &amp; Save Signature Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default ECIgnSetupModal;
