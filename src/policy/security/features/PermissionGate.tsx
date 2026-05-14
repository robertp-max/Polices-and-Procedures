import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import type { PermissionId, ResourceRef } from '../identity/types';
import { useFeatureAccess } from './useFeatureAccess';

interface PermissionGateProps {
  /** Phase A permission id to check (e.g. 'system.replay'). */
  permissionId: PermissionId;
  /** Optional resource scope to pass through to the authorize engine. */
  resource?: ResourceRef;
  /**
   * Behavior when permission is missing:
   * - 'hide'    (default) → render nothing (or the fallback, if provided)
   * - 'disable' → render the child but inject `disabled={true}` and a tooltip
   *
   * 'hide' is the safest default for write/delete buttons; 'disable' is
   * useful when you want users to discover that the action exists but
   * is gated.
   */
  mode?: 'hide' | 'disable';
  /** Optional fallback when in 'hide' mode and access is denied. */
  fallback?: ReactNode;
  /** Tooltip text used in 'disable' mode. */
  disabledTitle?: string;
  children: ReactElement;
}

/**
 * Wrap a single action element (button, link, menu item) and gate it
 * by a Phase A permission. Decision delegates to the existing
 * authorize() engine — there is no second permission system.
 *
 * Examples:
 *
 *   <PermissionGate permissionId="system.replay">
 *     <button onClick={resetSandbox}>Reset Sandbox</button>
 *   </PermissionGate>
 *
 *   <PermissionGate permissionId="policy.publish" mode="disable" disabledTitle="Requires Publisher role">
 *     <button onClick={publish}>Publish policy</button>
 *   </PermissionGate>
 */
export function PermissionGate({
  permissionId,
  resource,
  mode = 'hide',
  fallback = null,
  disabledTitle,
  children,
}: PermissionGateProps) {
  const { canPerformAction } = useFeatureAccess();
  const allowed = canPerformAction(permissionId, resource);

  if (allowed) return children;

  if (mode === 'disable' && isValidElement(children)) {
    const childProps = (children.props ?? {}) as Record<string, unknown> & {
      style?: React.CSSProperties;
      onClick?: unknown;
      title?: string;
    };
    const noopHandler = (e: React.SyntheticEvent) => { e.preventDefault(); e.stopPropagation(); };
    return cloneElement(children, {
      ...childProps,
      disabled: true,
      'aria-disabled': true,
      onClick: noopHandler,
      title: disabledTitle ?? `Requires permission: ${permissionId}`,
      style: {
        ...(childProps.style ?? {}),
        opacity: 0.45,
        cursor: 'not-allowed',
      },
    } as Record<string, unknown>);
  }

  return <>{fallback}</> as unknown as ReactElement;
}
