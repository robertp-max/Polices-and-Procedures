import { Menu, Search } from 'lucide-react';
import { IconButton } from '../primitives';

export function Topbar() {
  return (
    <div className="flex h-topbar items-center justify-between border-b border-hairline bg-surface px-lg text-ink">
      <div className="flex items-center gap-sm">
        <IconButton aria-label="Open navigation drawer placeholder" icon={<Menu aria-hidden="true" className="h-icon-sm w-icon-sm" />} />
        <span className="text-sm font-light text-muted">V6 Shell Skeleton</span>
      </div>
      <button
        className="inline-flex min-h-tap items-center gap-sm rounded-md border border-card bg-surface px-md text-sm font-light text-secondary transition duration-fast ease-standard hover:bg-surface-hover focus-visible:outline-none focus-visible:shadow-focus"
        type="button"
      >
        <Search aria-hidden="true" className="h-icon-sm w-icon-sm" />
        Search placeholder
      </button>
    </div>
  );
}
