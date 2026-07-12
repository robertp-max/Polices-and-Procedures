import { useMemo, type ReactNode } from 'react';
import { VeilDrawer } from '@/v6/components';
import { cx } from '@/v6/utils/classNames';
import {
  buildReadinessDrawerModel,
  type ReadinessActionId,
  type ReadinessDrawerAction,
  type ReadinessDrawerInput,
  type ReadinessDrawerModel,
} from './readinessModel';

export interface ReadinessDrawerProps {
  open: boolean;
  readiness: ReadinessDrawerInput | null;
  onClose: () => void;
  onGenerateNewPacket?: (model: ReadinessDrawerModel) => void;
  onOpenExistingDraft?: (model: ReadinessDrawerModel) => void;
  onContinueReview?: (model: ReadinessDrawerModel) => void;
  onTrackSignatures?: (model: ReadinessDrawerModel) => void;
  onViewSignedPacket?: (model: ReadinessDrawerModel) => void;
  onOpenInGoogleDrive?: (model: ReadinessDrawerModel) => void;
  onCreateAmendment?: (model: ReadinessDrawerModel) => void;
  onCreateSupersedingVersion?: (model: ReadinessDrawerModel) => void;
}

function FieldRow({ label, value }: { label: string; value: string }): ReactNode {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-sm border-b border-hairline py-sm text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className={cx('font-medium', value === 'unknown' ? 'text-muted italic' : 'text-ink')}>
        {value}
      </dd>
    </div>
  );
}

function handlerFor(
  actionId: ReadinessActionId,
  props: ReadinessDrawerProps,
): ((model: ReadinessDrawerModel) => void) | undefined {
  switch (actionId) {
    case 'generate_new_packet':
      return props.onGenerateNewPacket;
    case 'open_existing_draft':
      return props.onOpenExistingDraft;
    case 'continue_review':
      return props.onContinueReview;
    case 'track_signatures':
      return props.onTrackSignatures;
    case 'view_signed_packet':
      return props.onViewSignedPacket;
    case 'open_in_google_drive':
      return props.onOpenInGoogleDrive;
    case 'create_amendment':
      return props.onCreateAmendment;
    case 'create_superseding_version':
      return props.onCreateSupersedingVersion;
    case 'cancel':
      return undefined;
  }
}

function ActionButton({
  action,
  model,
  props,
}: {
  action: ReadinessDrawerAction;
  model: ReadinessDrawerModel;
  props: ReadinessDrawerProps;
}): ReactNode {
  const explicitHandler = handlerFor(action.id, props);
  const onClick = action.id === 'cancel'
    ? props.onClose
    : explicitHandler
      ? () => explicitHandler(model)
      : undefined;
  return (
    <button
      type="button"
      disabled={!action.enabled}
      title={!action.enabled && action.reason ? action.reason : undefined}
      onClick={onClick}
      className={cx(
        'min-h-tap rounded-md border px-md text-xs font-medium focus-visible:outline-none focus-visible:shadow-focus',
        action.enabled
          ? 'border-hairline bg-surface-glass text-brand-teal hover:bg-surface-hover'
          : 'cursor-not-allowed border-hairline text-muted opacity-60',
      )}
    >
      {action.label}
    </button>
  );
}

export function ReadinessDrawer(props: ReadinessDrawerProps): ReactNode {
  const { open, readiness, onClose } = props;
  const model = useMemo(
    () => (readiness ? buildReadinessDrawerModel(readiness) : null),
    [readiness],
  );

  if (!model) {
    return (
      <VeilDrawer open={false} onClose={onClose} eyebrow="Packet readiness" title="Select an event">
        {null}
      </VeilDrawer>
    );
  }

  return (
    <VeilDrawer
      open={open}
      onClose={onClose}
      eyebrow="Packet readiness"
      title={model.title}
      tone="teal"
      footer={
        <div className="flex flex-wrap gap-sm">
          {model.actions.map((action) => (
            <ActionButton
              key={action.id}
              action={action}
              model={model}
              props={props}
            />
          ))}
        </div>
      }
    >
      <dl className="grid gap-0" data-testid="packet-readiness-drawer-fields">
        {model.fields.map((item) => (
          <FieldRow key={item.label} label={item.label} value={item.value} />
        ))}
      </dl>
    </VeilDrawer>
  );
}

export default ReadinessDrawer;
