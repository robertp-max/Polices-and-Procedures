import { Badge } from '@/v6/primitives';
import { sourceKindLabel } from './threadView';
import type { HelpThreadSource } from './types';

/** Small badge naming where a thread was started from. */
export function ThreadSourceBadge({ source }: { source: HelpThreadSource }) {
  return <Badge size="sm">{sourceKindLabel(source)}</Badge>;
}

export default ThreadSourceBadge;
