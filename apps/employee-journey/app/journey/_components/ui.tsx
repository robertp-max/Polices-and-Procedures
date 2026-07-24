"use client";

import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { X } from "lucide-react";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function useDialogFocus(
  open: boolean,
  onClose: () => void,
  containerRef: RefObject<HTMLElement | null>,
) {
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const container = containerRef.current;
    const initial = container?.querySelector<HTMLElement>(
      "[data-autofocus], button:not([disabled]), a[href], input:not([disabled]), select:not([disabled])",
    );
    window.requestAnimationFrame(() => initial?.focus());

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !container) return;
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((element) => !element.hasAttribute("hidden"));
      if (!focusable.length) {
        event.preventDefault();
        container.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreRef.current?.focus();
    };
  }, [containerRef, onClose, open]);
}

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className = "",
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocus(open, onClose, ref);
  if (!open) return null;

  return (
    <div className="dialog-layer" data-testid="modal-layer">
      <button
        className="dialog-backdrop"
        type="button"
        onClick={onClose}
        aria-label={`Close ${title}`}
      />
      <div
        ref={ref}
        className={`modal-surface ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        <button
          className="icon-button dialog-close"
          type="button"
          onClick={onClose}
          aria-label={`Close ${title}`}
          data-autofocus
        >
          <X aria-hidden="true" />
        </button>
        <div className="dialog-heading">
          <h2 id={titleId}>{title}</h2>
          {description ? <p id={descriptionId}>{description}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  className = "",
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const ref = useRef<HTMLElement>(null);
  useDialogFocus(open, onClose, ref);
  if (!open) return null;

  return (
    <div className="dialog-layer" data-testid="drawer-layer">
      <button
        className="dialog-backdrop"
        type="button"
        onClick={onClose}
        aria-label={`Close ${title}`}
      />
      <aside
        ref={ref}
        className={`drawer-surface ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        <button
          className="icon-button dialog-close"
          type="button"
          onClick={onClose}
          aria-label={`Close ${title}`}
          data-autofocus
        >
          <X aria-hidden="true" />
        </button>
        <div className="dialog-heading">
          <h2 id={titleId}>{title}</h2>
          {description ? <p id={descriptionId}>{description}</p> : null}
        </div>
        {children}
      </aside>
    </div>
  );
}

export type TabOption<T extends string> = {
  id: T;
  label: string;
  count?: number;
};

export function workspaceTabId(panelId: string, tabId: string) {
  const safeId = tabId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${panelId}-${safeId}-tab`;
}

export function WorkspaceTabs<T extends string>({
  label,
  tabs,
  active,
  onChange,
  panelId,
}: {
  label: string;
  tabs: TabOption<T>[];
  active: T;
  onChange: (value: T) => void;
  panelId: string;
}) {
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else return;
    event.preventDefault();
    const next = tabs[nextIndex];
    onChange(next.id);
    document.getElementById(workspaceTabId(panelId, next.id))?.focus();
  }

  return (
    <div className="workspace-tabs-wrap">
      <div className="workspace-tabs" role="tablist" aria-label={label}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            id={workspaceTabId(panelId, tab.id)}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={panelId}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.label}
            {typeof tab.count === "number" ? <span>{tab.count}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LiveRegion({ message }: { message: string }) {
  return (
    <div className="preview-toast" role="status" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  );
}
