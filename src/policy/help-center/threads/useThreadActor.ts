import { useAuth } from '@/auth/AuthProvider';

/** The current user as the Threads feature sees them. */
export type ThreadActor = {
  userId: string;
  displayName: string;
  isAdmin: boolean;
};

/** Resolve the current actor from the demo AuthProvider. */
export function useThreadActor(): ThreadActor {
  const { user } = useAuth();
  const role = (user?.role ?? '').toLowerCase();
  return {
    userId: user?.id ?? 'demo-user',
    displayName: user?.name ?? user?.email ?? 'Demo User',
    isAdmin: role.includes('admin') || role.includes('super'),
  };
}
