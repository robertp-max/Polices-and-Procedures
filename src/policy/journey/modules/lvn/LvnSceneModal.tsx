import React, { useEffect, useRef } from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

export interface LvnSceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  info: string;
  zone?: 'authorized' | 'conditional' | 'prohibited' | 'neutral';
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export function LvnSceneModal({
  isOpen,
  onClose,
  title,
  info,
  zone,
  triggerRef,
}: LvnSceneModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Inject modal spring animation
  useEffect(() => {
    if (!document.getElementById('lvn-modal-styles')) {
      const style = document.createElement('style');
      style.id = 'lvn-modal-styles';
      style.innerHTML = `
        @keyframes lvnModalSpring {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          60% { opacity: 1; transform: scale(1.02) translateY(-5px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-lvn-modal-spring {
          animation: lvnModalSpring 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap & Return focus
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();

      // Trap focus
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        function trapFocus(e: KeyboardEvent) {
          if (e.key === 'Tab') {
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
              }
            } else {
              if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
              }
            }
          }
        }

        window.addEventListener('keydown', trapFocus);
        return () => window.removeEventListener('keydown', trapFocus);
      }
    } else {
      if (triggerRef && triggerRef.current) {
        triggerRef.current.focus();
      }
    }
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  // Zone specific styles/colors
  const zoneColors: Record<string, { color: string; label: string; bg: string; border: string; icon: React.ReactNode }> = {
    authorized: {
      color: '#007970',
      label: 'Authorized Practice',
      bg: '#E5FEFF',
      border: '#B2F5F7',
      icon: <CheckCircle2 size={32} className="text-[#007970]" />
    },
    conditional: {
      color: '#C74601',
      label: 'Conditional Practice',
      bg: '#FFF7ED',
      border: '#FED7AA',
      icon: <AlertTriangle size={32} className="text-[#C74601]" />
    },
    prohibited: {
      color: '#991B1B',
      label: 'Prohibited Practice',
      bg: '#FEF2F2',
      border: '#FCA5A5',
      icon: <XCircle size={32} className="text-[#991B1B]" />
    },
    neutral: {
      color: '#007970',
      label: 'Clinical Guidance',
      bg: '#E5FEFF',
      border: '#B2F5F7',
      icon: <Info size={32} className="text-[#007970]" />
    },
  };

  const currentZone = zoneColors[zone || 'neutral'];

  return (
    <div
      style={overlayStyle}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="lvn-modal-title"
    >
      <div
        className="w-full max-w-2xl relative px-4 md:px-8 max-h-[100dvh] my-auto"
        style={{ display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button placed outside card to match GAO-001 exactly */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          style={closeButtonStyle}
          aria-label="Close dialog"
        >
          <X size={24} strokeWidth={2.5} />
        </button>

        {/* Card Body */}
        <div
          ref={modalRef}
          className="animate-lvn-modal-spring"
          style={modalCardStyle}
        >
          {/* Card Header */}
          <div style={modalHeaderStyle}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: currentZone.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: `1px solid ${currentZone.border}`,
              boxShadow: '0 8px 16px rgba(0,121,112,0.12)'
            }}>
              {currentZone.icon}
            </div>
            <div style={{ paddingTop: 6 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#F06923',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                {currentZone.label}
              </span>
              <h2 id="lvn-modal-title" style={modalTitleStyle}>
                {title}
              </h2>
            </div>
          </div>

          {/* Card Content */}
          <div style={modalBodyStyle}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: 24,
              padding: 24,
              borderLeft: `6px solid ${currentZone.color}`,
              boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <p style={modalInfoStyle}>{info}</p>
            </div>

            {(zone === 'conditional' || zone === 'prohibited') && (
              <div style={{
                marginTop: 20,
                padding: 16,
                borderRadius: 12,
                borderLeft: `4px solid ${currentZone.color}`,
                background: currentZone.bg,
                boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
              }}>
                <span style={{
                  fontWeight: 700,
                  color: currentZone.color,
                  display: 'block',
                  fontSize: 11,
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {zone === 'conditional' ? 'Escalation requirement' : 'Scope warning'}
                </span>
                <span style={{ fontSize: 13, lineHeight: 1.5, color: '#1F1C1B' }}>
                  {zone === 'conditional'
                    ? 'Requires supervising RN oversight, Plan of Care (POC) authorization, and current validated competency check-off. Escalate details immediately.'
                    : 'This is RN-only or advanced clinician territory. Do NOT perform this action. Document findings and escalate to RN/DON immediately.'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(31, 28, 27, 0.5)',
  backdropFilter: 'blur(12px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
};

const closeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: -48,
  right: 16,
  background: 'rgba(0, 0, 0, 0.4)',
  border: 'none',
  borderRadius: '50%',
  color: '#FFFFFF',
  cursor: 'pointer',
  padding: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.3s, color 0.3s',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  zIndex: 110,
};

const modalCardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 32,
  border: '1px solid #E5E4E3',
  width: '100%',
  maxHeight: '85vh',
  boxShadow: '0 32px 80px rgba(0, 0, 0, 0.2)',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
};

const modalHeaderStyle: React.CSSProperties = {
  padding: '40px 40px 24px',
  display: 'flex',
  alignItems: 'flex-start',
  gap: 20,
  borderBottom: '1px solid #E5E4E3',
  background: '#FFFFFF',
  flexShrink: 0,
};

const modalTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 700,
  color: '#007970',
  lineHeight: 1.25,
  fontFamily: "'Montserrat', sans-serif",
};

const modalBodyStyle: React.CSSProperties = {
  padding: '32px 40px 40px',
  overflowY: 'auto',
  // @ts-ignore
  flex1: 1,
  background: '#FAFAF7',
  display: 'flex',
  flexDirection: 'column',
};

const modalInfoStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  lineHeight: 1.6,
  color: '#524C4B',
  fontFamily: "'Roboto', sans-serif",
};
