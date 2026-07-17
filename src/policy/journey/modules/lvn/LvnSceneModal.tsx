import React, { useEffect, useRef } from 'react';

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
  const zoneColors: Record<string, { color: string; label: string; bg: string }> = {
    authorized: { color: '#007970', label: 'Authorized Skill', bg: '#E5FEFF' },
    conditional: { color: '#C74601', label: 'Conditional Practice', bg: '#FFF7ED' },
    prohibited: { color: '#991B1B', label: 'Prohibited Practice', bg: '#FEF2F2' },
    neutral: { color: '#004142', label: 'Information', bg: '#FAFBF8' },
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
        ref={modalRef}
        style={modalContainerStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Color stripe for zone */}
        <div style={{ ...zoneStripeStyle, background: currentZone.color }} />
        
        <div style={modalHeaderStyle}>
          <div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: currentZone.color,
                background: currentZone.bg,
                padding: '2px 8px',
                borderRadius: 4,
                display: 'inline-block',
                marginBottom: 6,
              }}
            >
              {currentZone.label}
            </span>
            <h2 id="lvn-modal-title" style={modalTitleStyle}>
              {title}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={closeButtonStyle}
          >
            &times;
          </button>
        </div>

        <div style={modalBodyStyle}>
          <p style={modalInfoStyle}>{info}</p>
        </div>

        {(zone === 'conditional' || zone === 'prohibited') && (
          <div style={{ ...calloutContainerStyle, borderLeftColor: currentZone.color, background: currentZone.bg }}>
            <span style={{ fontWeight: 700, color: currentZone.color, display: 'block', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              {zone === 'conditional' ? 'Escalation requirement' : 'Scope warning'}
            </span>
            <span style={{ fontSize: 12, lineHeight: 1.45, color: '#1F1C1B' }}>
              {zone === 'conditional'
                ? 'Requires supervising RN oversight, POC authorization, and current validated competency check-off. Escalate details immediately.'
                : 'This is RN-only or advanced clinician territory. Do NOT perform this action. Document findings and escalate to RN/DON immediately.'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(31, 28, 27, 0.45)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
};

const modalContainerStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 16,
  border: '1px solid #E5E4E3',
  width: '90%',
  maxWidth: 480,
  maxHeight: '85vh',
  boxShadow: '0 24px 64px rgba(31, 28, 27, 0.15)',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
};

const zoneStripeStyle: React.CSSProperties = {
  height: 6,
  width: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
};

const modalHeaderStyle: React.CSSProperties = {
  padding: '24px 24px 16px',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 16,
  borderBottom: '1px solid #FAFBF8',
  marginTop: 6,
};

const modalTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: '#1F1C1B',
  lineHeight: 1.3,
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: 24,
  lineHeight: 1,
  color: '#747470',
  cursor: 'pointer',
  padding: '0 4px',
  borderRadius: 4,
  transition: 'background 0.15s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const modalBodyStyle: React.CSSProperties = {
  padding: '0 24px 24px',
  overflowY: 'auto',
};

const modalInfoStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.6,
  color: '#524C4B',
};

const calloutContainerStyle: React.CSSProperties = {
  margin: '0 24px 24px',
  padding: 12,
  borderRadius: 8,
  borderLeft: '4px solid',
};
