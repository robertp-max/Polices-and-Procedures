/**
 * VeilModal — Premium centered modal primitive for V3 dark glass aesthetic.
 *
 * Expensive, luxurious feel matching the V3 Veil Glass spec:
 * - Exact matte slate-carbon glass gradient + 32px blur + saturate(140%)
 * - Sacred 0.33 border contract with hover elevation to 0.45
 * - Opacity/blur-only motion per the V3 flat-design rules
 * - Luminous catchlight edge
 * - Refined teal micro-interactions on close
 * - Generous breathing room, premium typography
 *
 * Designed for CES workflows, evidence approvals, task confirmations,
 * form signing overlays, and future decluttering of legacy modals (e.g. ModalShell).
 *
 * Usage (V3):
 *   <VeilModal open={open} onClose={close} glassVariant="v3-veil" title="..." size="lg">
 *     ...
 *   </VeilModal>
 *
 * Backward compatible with CI-ION glass too.
 */

import { type ReactNode } from 'react';
import { GlobalModalBridge } from '@/contexts/ModalContext';

export interface VeilModalProps {
  open: boolean;
  onClose: () => void;
  /** Modal content width tier */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Optional small uppercase label above title (JetBrains Mono) */
  eyebrow?: string;
  /** Primary title */
  title?: ReactNode;
  /** Optional right-side actions in header */
  headerActions?: ReactNode;
  /** Sticky footer (actions, etc.) */
  footer?: ReactNode;
  /** Main content */
  children: ReactNode;
  /**
   * Glass variant — defaults to premium V3 veil for new expensive surfaces.
   * Use 'ci-ion' only for transitional legacy contexts.
   */
  glassVariant?: 'v3-veil' | 'ci-ion';
  /** Disable Escape-to-close (rare) */
  disableEscape?: boolean;
  /** Hide the close button (controlled externally via headerActions) */
  hideClose?: boolean;
}

const SIZE_CLASSNAME: Record<NonNullable<VeilModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
};

/**
 * VeilModal — the expensive, high-end V3 modal.
 * Renders via fixed portal overlay. Respects reduced motion.
 */
export function VeilModal({
  open,
  onClose,
  size = 'md',
  eyebrow,
  title,
  headerActions,
  footer,
  children,
  glassVariant = 'v3-veil',
  disableEscape = false,
  hideClose = false,
}: VeilModalProps) {
  return (
    <GlobalModalBridge
      open={open}
      onClose={onClose}
      config={{
        title,
        subtitle: undefined,
        eyebrow,
        headerActions,
        footer,
        content: children,
        hideClose,
        disableEscape,
        maxWidthClassName: SIZE_CLASSNAME[size],
        panelClassName: glassVariant === 'v3-veil' ? 'v3-veil-glass-panel' : 'ci-glass-panel',
        spotlightColor: glassVariant === 'v3-veil' ? 'rgba(0, 121, 112, 0.15)' : 'rgba(226, 232, 240, 0.12)',
        bodyClassName: 'p-7',
      }}
    />
  );
}

export default VeilModal;
