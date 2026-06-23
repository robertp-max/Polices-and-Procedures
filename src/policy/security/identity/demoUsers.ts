import type { DemoUser as AuthDemoUser } from '@/auth/api';
import type { User } from './types';
import { getUserStableKey, normalizeUserEmail } from './identityNormalization';

export const DEMO_USERS: User[] = [
  { id: 'demo-user-careindeed', email: 'robertp@careindeed.com', name: 'TJ Padilla', status: 'active', source: 'seed' },
  { id: 'usr-marites', email: 'maritesa@careindeed.com', name: 'Marites Arzaga', status: 'active', source: 'seed' },
  { id: 'usr-admin', email: 'admin@careindeed.com', name: 'Alicia Admin', status: 'active', source: 'seed' },
  { id: 'usr-deeb-admin', email: 'deeb@careindeed.com', name: 'Deeb Admin', status: 'active', source: 'seed' },
  { id: 'usr-dagny', email: 'dagnyy@careindeed.com', name: 'Dagny Yenko', status: 'active', source: 'seed' },
  { id: 'usr-janine', email: 'janinec@careindeed.com', name: 'Janine Catanghal', status: 'active', source: 'seed' },
  { id: 'usr-reden', email: 'redenv@careindeed.com', name: 'Reden Valerio', status: 'active', source: 'seed' },
  { id: 'usr-monserat', email: 'monseratz@careindeed.com', name: 'Monserat Zapanta', status: 'active', source: 'seed' },
  { id: 'usr-rn', email: 'rn@careindeed.com', name: 'Riley RN', status: 'active' },
  { id: 'usr-lvn', email: 'lvn@careindeed.com', name: 'Logan LVN', status: 'active' },
  { id: 'usr-chha', email: 'chha@careindeed.com', name: 'Casey CHHA', status: 'active' },
  { id: 'usr-compliance', email: 'compliance@careindeed.com', name: 'Cameron Compliance', status: 'active' },
  { id: 'usr-auditor', email: 'auditor@careindeed.com', name: 'Alex Auditor', status: 'active' },
  { id: 'usr-onboarding', email: 'onboarding@careindeed.com', name: 'Olivia Onboarding', status: 'active' },
  { id: 'usr-billing', email: 'billing@careindeed.com', name: 'Bailey Billing', status: 'active' },
  { id: 'usr-director', email: 'director@careindeed.com', name: 'Dakota Director', status: 'active' },
  { id: 'usr-executive', email: 'executive@careindeed.com', name: 'Emerson Executive', status: 'active' },
  { id: 'usr-suspended', email: 'suspended@careindeed.com', name: 'Sam Suspended', status: 'suspended' },
];

const AUTH_ROLE_TO_USER_ID: Record<string, string> = {
  super_admin: 'demo-user-careindeed',
  admin: 'usr-admin',
  rn: 'usr-rn',
  lvn: 'usr-lvn',
  chha: 'usr-chha',
  compliance: 'usr-compliance',
  auditor: 'usr-auditor',
  onboarding: 'usr-onboarding',
  billing: 'usr-billing',
  director: 'usr-director',
  executive: 'usr-executive',
};

export function getDemoUserById(userId: string): User | undefined {
  return DEMO_USERS.find(user => user.id === userId);
}

export function resolveUserIdFromAuth(authUser: AuthDemoUser | null): string {
  if (!authUser) {
    return 'anonymous';
  }

  if (authUser.id && getDemoUserById(authUser.id)) {
    return authUser.id;
  }

  const email = normalizeUserEmail(authUser.email);
  if (email) {
    const byEmail = DEMO_USERS.find(user => normalizeUserEmail(user.email) === email);
    if (byEmail) return byEmail.id;
  }

  const role = authUser.role?.toLowerCase();
  if (role && AUTH_ROLE_TO_USER_ID[role]) {
    return AUTH_ROLE_TO_USER_ID[role];
  }

  return getUserStableKey(authUser) || 'anonymous';
}
