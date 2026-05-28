import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

export type ModalBounds = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type GlobalModalVariant = 'spotlight-shell' | 'custom-surface';

export interface GlobalModalConfig {
  id?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
  headerActions?: ReactNode;
  maxWidthClassName?: string;
  panelClassName?: string;
  bodyClassName?: string;
  overlayClassName?: string;
  spotlightColor?: string;
  hideClose?: boolean;
  disableEscape?: boolean;
  closeOnBackdrop?: boolean;
  requestClose?: () => void;
  bounds?: ModalBounds | null;
  variant?: GlobalModalVariant;
  panelStyle?: CSSProperties;
}

interface ModalRecord extends GlobalModalConfig {
  id: string;
  isOpen: boolean;
}

interface ModalContextValue {
  modal: ModalRecord | null;
  openModal: (config: GlobalModalConfig) => string;
  updateModal: (id: string, config: Partial<GlobalModalConfig>) => void;
  closeModal: (id?: string) => void;
  clearModal: (id?: string) => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

let modalSequence = 0;

function nextModalId() {
  modalSequence += 1;
  return `global-modal-${modalSequence}`;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalRecord | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const cancelCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const clearModal = useCallback((id?: string) => {
    cancelCloseTimer();
    setModal(current => {
      if (!current) return null;
      if (id && current.id !== id) return current;
      return null;
    });
  }, []);

  const closeModal = useCallback((id?: string) => {
    cancelCloseTimer();
    setModal(current => {
      if (!current) return null;
      if (id && current.id !== id) return current;
      return { ...current, isOpen: false };
    });
    closeTimerRef.current = window.setTimeout(() => {
      setModal(current => {
        if (!current) return null;
        if (id && current.id !== id) return current;
        return null;
      });
      closeTimerRef.current = null;
    }, 300);
  }, []);

  const openModal = useCallback((config: GlobalModalConfig) => {
    cancelCloseTimer();
    const id = config.id ?? nextModalId();
    setModal({
      id,
      isOpen: true,
      variant: 'spotlight-shell',
      closeOnBackdrop: true,
      maxWidthClassName: 'max-w-4xl',
      ...config,
    });
    return id;
  }, []);

  const updateModal = useCallback((id: string, config: Partial<GlobalModalConfig>) => {
    cancelCloseTimer();
    setModal(current => {
      if (!current || current.id !== id) return current;
      return {
        ...current,
        ...config,
        id,
      };
    });
  }, []);

  useEffect(() => () => cancelCloseTimer(), []);

  const value = useMemo<ModalContextValue>(() => ({
    modal,
    openModal,
    updateModal,
    closeModal,
    clearModal,
  }), [modal, openModal, updateModal, closeModal, clearModal]);

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
}

export function useGlobalModal() {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useGlobalModal must be used inside ModalProvider.');
  return context;
}

export function GlobalModalBridge({
  open,
  onClose,
  config,
}: {
  open: boolean;
  onClose: () => void;
  config: GlobalModalConfig;
}) {
  const { openModal, updateModal, closeModal, clearModal } = useGlobalModal();
  const idRef = useRef(config.id ?? nextModalId());

  useEffect(() => {
    if (!open) {
      closeModal(idRef.current);
      return;
    }

    const payload: GlobalModalConfig = {
      ...config,
      id: idRef.current,
      requestClose: onClose,
    };

    openModal(payload);
  }, [
    open,
    onClose,
    config,
    openModal,
    closeModal,
  ]);

  useEffect(() => {
    if (!open) return;
    updateModal(idRef.current, {
      ...config,
      requestClose: onClose,
    });
  }, [open, onClose, config, updateModal]);

  useEffect(() => () => {
    clearModal(idRef.current);
  }, [clearModal]);

  return null;
}
