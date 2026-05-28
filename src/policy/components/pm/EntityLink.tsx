import { type ReactElement } from 'react';
import { Link } from 'react-router-dom';

export type EntityKind =
  | 'event'
  | 'workflow'
  | 'policy'
  | 'form'
  | 'form_instance'
  | 'task';

export interface EntityLinkProps {
  kind: EntityKind;
  id: string;
  label?: string;
  subLabel?: string;
  className?: string;
  title?: string;
  onSelectTask?: (taskId: string) => void;
  formContext?: {
    eventId?: string;
    workflowId?: string;
    instanceId?: string;
    sourceFormId?: string;
  };
}

function hrefFor(kind: EntityKind, id: string, formContext?: EntityLinkProps['formContext']): string {
  const normalizedId = id.trim();
  if (kind === 'event') return `/calendar?event=${encodeURIComponent(normalizedId)}`;
  if (kind === 'workflow') return `/workflows/${encodeURIComponent(normalizedId)}`;
  if (kind === 'policy') {
    const policyId = normalizedId.toUpperCase();
    return `/library/${encodeURIComponent(policyId)}`;
  }
  if (kind === 'form') return `/forms/${encodeURIComponent(normalizedId)}`;
  if (kind === 'form_instance') {
    const sourceFormId = formContext?.sourceFormId?.trim() || normalizedId.split('--').slice(1).join('--');
    const params = new URLSearchParams();
    params.set('instance', normalizedId);
    params.set('form_instance_id', normalizedId);
    if (formContext?.eventId) params.set('event', formContext.eventId);
    if (formContext?.eventId) params.set('event_id', formContext.eventId);
    if (formContext?.workflowId) params.set('workflow', formContext.workflowId);
    if (formContext?.workflowId) params.set('workflow_id', formContext.workflowId);
    return `/forms/${encodeURIComponent(sourceFormId)}?${params.toString()}`;
  }
  return '#';
}

export function EntityLink({
  kind,
  id,
  label,
  subLabel,
  className,
  title,
  onSelectTask,
  formContext,
}: EntityLinkProps): ReactElement {
  const text = label ?? id;
  const meta = subLabel;
  // Theme-safe link colour. Uses the new --ci-link token (resolves per
  // brand × mode); legacy `text-cyan-300` fallback is kept only when
  // a caller explicitly overrides via `className`.
  const fallbackClass = className ?? 'ci-link';

  if (kind === 'task') {
    if (!onSelectTask) {
      return (
        <span className={fallbackClass} title={title ?? id}>
          {text}
          {meta ? <span className="ml-1 text-[10px] opacity-70">{meta}</span> : null}
        </span>
      );
    }
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelectTask(id);
        }}
        className={fallbackClass}
        title={title ?? id}
      >
        {text}
        {meta ? <span className="ml-1 text-[10px] opacity-70">{meta}</span> : null}
      </button>
    );
  }

  const to = hrefFor(kind, id, formContext);
  return (
    <Link
      to={to}
      onClick={(e) => e.stopPropagation()}
      className={fallbackClass}
      title={title ?? id}
    >
      {text}
      {meta ? <span className="ml-1 text-[10px] opacity-70">{meta}</span> : null}
    </Link>
  );
}
