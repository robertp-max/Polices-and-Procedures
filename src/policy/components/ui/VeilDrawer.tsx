import { type ReactNode, useEffect, useState } from 'react';
import { BottomSheetDrawer } from './BottomSheetDrawer';
import { RightDrawer } from './RightDrawer';

export interface VeilDrawerProps {
  open: boolean;
  onClose: () => void;
  layer?: 1 | 2;
  eyebrow?: string;
  title?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
}

export function VeilDrawer({
  open,
  onClose,
  layer = 2,
  eyebrow,
  title,
  headerActions,
  footer,
  children,
  width = layer === 1 ? 'md' : 'lg',
}: VeilDrawerProps) {
  const isMobile = useIsMobileVeil();

  if (isMobile) {
    return (
      <BottomSheetDrawer
        open={open}
        onClose={onClose}
        layer={layer}
        height="lg"
        eyebrow={eyebrow}
        title={title}
        headerActions={headerActions}
        footer={footer}
      >
        {children}
      </BottomSheetDrawer>
    );
  }

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      layer={layer}
      width={width}
      eyebrow={eyebrow}
      title={title}
      headerActions={headerActions}
      footer={footer}
    >
      {children}
    </RightDrawer>
  );
}

function useIsMobileVeil(): boolean {
  const [isMobile, setIsMobile] = useState(() => (
    typeof window === 'undefined' ? false : window.matchMedia('(max-width: 767px)').matches
  ));

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const query = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(query.matches);
    onChange();
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
