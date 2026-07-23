import { useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { cx } from '../utils/classNames';

interface MobileNavItem {
  id: string;
  icon: ReactNode;
  label: string;
  ariaLabel?: string;
  onClick: () => void;
  isActive?: boolean;
}

interface MobileNavDrawerProps {
  items: MobileNavItem[];
  bradItem?: Pick<MobileNavItem, 'icon' | 'onClick'>;
}

export function MobileNavDrawer({ items, bradItem }: MobileNavDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='tablet-l:hidden'>
      <button
        type='button'
        onClick={() => setIsOpen(true)}
        className='fixed left-4 top-4 z-popover grid h-11 w-11 place-items-center rounded-full bg-white shadow-rest text-ink'
        aria-label='Open navigation'
      >
        <Menu className='h-6 w-6' />
      </button>

      {/* Backdrop */}
      <div
        className={cx(
          'fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsOpen(false)}
        aria-hidden='true'
      />

      {/* Drawer */}
      <div
        className={cx(
          'fixed left-0 top-0 bottom-0 z-[70] w-64 bg-white shadow-xl transition-transform duration-300 ease-out flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className='flex items-center justify-between p-4 border-b border-hairline'>
          <span className='font-montserrat font-semibold text-brand-teal-deep tracking-wider text-sm'>MENU</span>
          <button
            type='button'
            onClick={() => setIsOpen(false)}
            className='p-2 -mr-2 text-muted hover:text-ink'
            aria-label='Close navigation'
          >
            <X className='h-5 w-5' />
          </button>
        </div>
        <nav className='flex-1 overflow-y-auto p-4 flex flex-col gap-2'>
          {bradItem && (
            <button
              type='button'
              onClick={() => {
                bradItem.onClick();
                setIsOpen(false);
              }}
              className='flex items-center gap-4 p-3 rounded-lg text-left transition-colors hover:bg-surface-hover text-brand-teal'
            >
              {bradItem.icon}
              <span className='text-sm font-medium'>Brad iAdministrator</span>
            </button>
          )}
          {items.map(item => (
            <button
              key={item.id}
              type='button'
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              aria-label={item.ariaLabel ?? item.label}
              aria-current={item.isActive ? 'page' : undefined}
              className={cx(
                'flex items-center gap-4 p-3 rounded-lg text-left transition-colors',
                item.isActive ? 'bg-brand-teal-deep text-on-brand' : 'hover:bg-surface-hover text-ink'
              )}
            >
              {item.icon}
              <span className='text-sm font-medium'>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
