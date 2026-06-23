export type RegistrationStatus =
  | 'pending_setup'
  | 'active'
  | 'pending_admin_approval'
  | 'disabled';

export interface RegistrationRecord {
  pk: string;
  sk: 'REGISTRATION';
  email: string;
  emailDomain: string;
  cognitoUsername?: string;
  status: RegistrationStatus;
  setupTokenHash?: string;
  setupTokenExpiresAt?: number;
  setupCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface TokenRecord {
  pk: string;
  sk: 'SETUP';
  email: string;
  status: 'pending_setup';
  createdAt: string;
  expiresAt: number;
}

export interface AuthSession {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface DemoUser {
  id?: string;
  authSubject?: string;
  provider?: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
}
