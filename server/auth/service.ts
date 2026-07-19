import crypto from 'node:crypto';
import {
  AdminCreateUserCommand,
  AdminEnableUserCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  ConfirmForgotPasswordCommand,
  CognitoIdentityProviderClient,
  ForgotPasswordCommand,
  GetUserCommand,
  GlobalSignOutCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { ApiError } from '../errors.js';
import { log } from '../logger.js';
import type { AuthSession, DemoUser, RegistrationRecord, RegistrationStatus, TokenRecord } from './types.js';
import { findApprovedUser, findApprovedUserByEmail, getLoadError, isAllowlistAvailable, normalizeEmail as normalizeApprovedEmail, normalizeSfOrgId } from './approvedUsers.js';
import type { DirectSetupAuditSink } from './directSetupAudit.js';

interface DemoAuthConfig {
  region: string;
  userPoolId: string;
  clientId: string;
  fromEmail: string;
  appBaseUrl: string;
  tableName: string;
  setupTokenTtlMinutes: number;
  autoApprovedDomain: string;
  autoApprovedEmails: string[];
  protectedAuthEmails: string[];
  adminManualPasswordEmails: string[];
}

interface RegisterResult {
  requiresApproval: boolean;
  message: string;
  debug?: {
    setupLink?: string;
    emailDelivery?: { ok: boolean; errCode?: string; errMessage?: string };
  };
}

/**
 * Typed outcome of an administrator-initiated invitation. The status is explicit
 * so callers/UI never conflate "created" with "delivered":
 *   - invited_and_delivered  — new user created AND the setup link was delivered
 *   - created_delivery_pending — new user created but delivery did not occur
 *   - already_pending        — target already had a pending invitation (re-sent)
 *   - already_active         — target already has an active account (no-op)
 */
export type AdminInviteStatus =
  | 'invited_and_delivered'
  | 'created_delivery_pending'
  | 'already_pending'
  | 'already_active';

/**
 * Result of an administrator-initiated invitation. Deliberately carries NO
 * credential, setup token, or setup link — only the resolved actor (for audit
 * attribution at the route layer), the normalized target, the typed outcome,
 * whether setup-link delivery succeeded, and whether a Cognito user was
 * provisioned/ensured by this call.
 */
export interface AdminInviteResult {
  actorEmail: string;
  targetEmail: string;
  status: AdminInviteStatus;
  emailDelivered: boolean;
  provisioned: boolean;
}

type LoginResult =
  | { session: AuthSession; user: DemoUser }
  | { challenge: 'NEW_PASSWORD_REQUIRED'; challengeName: 'NEW_PASSWORD_REQUIRED'; session: string; email: string };

const DEFAULT_REGISTER_MESSAGE = 'If your email is eligible, we sent a setup link. Please check your inbox.';

/**
 * COG-1 fail-closed session gate: an authenticated Cognito token is necessary
 * but NOT sufficient — the bound application account must also be active. A
 * user suspended/disabled at the application level (registration status flipped
 * away from 'active') is rejected on every token-validating call, so a session
 * cannot outlive the account's active state until token expiry. Mirrors the
 * active-account check that `login()` already enforces at sign-in.
 */
export function assertRegistrationActiveForSession(
  registration: Pick<RegistrationRecord, 'status'> | null | undefined,
): void {
  if (!registration || registration.status !== 'active') {
    throw new ApiError('auth_error', 'Account is not active.', 403);
  }
}

export class DemoAuthService {
  private readonly cognito: CognitoIdentityProviderClient;
  private readonly dynamo: DynamoDBDocumentClient;
  private readonly ses: SESClient;
  private readonly cfg: DemoAuthConfig;

  constructor(cfg: DemoAuthConfig) {
    this.cfg = cfg;
    const region = cfg.region;
    this.cognito = new CognitoIdentityProviderClient({ region });
    this.ses = new SESClient({ region });
    const ddb = new DynamoDBClient({ region });
    this.dynamo = DynamoDBDocumentClient.from(ddb, {
      marshallOptions: { removeUndefinedValues: true },
    });
  }

  normalizeEmail(emailRaw: string): string {
    return String(emailRaw || '').trim().toLowerCase();
  }

  private emailDomain(email: string): string {
    const idx = email.lastIndexOf('@');
    if (idx === -1) return '';
    return email.slice(idx + 1);
  }

  private registrationKey(email: string) {
    return { pk: `EMAIL#${email}`, sk: 'REGISTRATION' as const };
  }

  private tokenKey(tokenHash: string) {
    return { pk: `TOKEN#${tokenHash}`, sk: 'SETUP' as const };
  }

  private nowIso(): string {
    return new Date().toISOString();
  }

  private nowEpochSeconds(): number {
    return Math.floor(Date.now() / 1000);
  }

  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  private generateSetupToken(): { token: string; tokenHash: string; expiresAt: number } {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);
    const expiresAt = this.nowEpochSeconds() + this.cfg.setupTokenTtlMinutes * 60;
    return { token, tokenHash, expiresAt };
  }

  private validatePassword(password: string): void {
    // Server-authoritative password policy (single source of truth; the setup UI
    // displays the same rules). The password value is never echoed in the error.
    const pw = String(password ?? '');
    const problems: string[] = [];
    if (pw.length < 8) problems.push('at least 8 characters');
    if (!/[a-z]/.test(pw)) problems.push('a lowercase letter');
    if (!/[A-Z]/.test(pw)) problems.push('an uppercase letter');
    if (!/[0-9]/.test(pw)) problems.push('a number');
    if (!/[^A-Za-z0-9]/.test(pw)) problems.push('a symbol');
    if (pw.length > 256) problems.push('no more than 256 characters'); // oversized-payload guard
    if (problems.length > 0) {
      throw new ApiError('validation_error', `Password must include ${problems.join(', ')}.`, 400);
    }
  }

  private isProtectedAuthEmail(emailRaw: string): boolean {
    return this.cfg.protectedAuthEmails.includes(this.normalizeEmail(emailRaw));
  }

  private assertNotProtectedAuthEmail(actorEmail: string, targetEmail: string, action: string): void {
    if (!this.isProtectedAuthEmail(targetEmail)) return;
    log.warn('auth.protected_account.blocked', { actorEmail, targetEmail, action });
    throw new ApiError(
      'protected_account',
      'This account is protected and cannot be changed from the admin password tools.',
      403,
    );
  }

  private async getRegistration(email: string): Promise<RegistrationRecord | null> {
    const result = await this.dynamo.send(new GetCommand({
      TableName: this.cfg.tableName,
      Key: this.registrationKey(email),
    }));
    return (result.Item as RegistrationRecord | undefined) ?? null;
  }

  private async writeRegistration(record: RegistrationRecord): Promise<void> {
    await this.dynamo.send(new PutCommand({
      TableName: this.cfg.tableName,
      Item: record,
    }));
  }

  private async writeTokenRecord(tokenHash: string, email: string, createdAt: string, expiresAt: number): Promise<void> {
    const tokenRecord: TokenRecord = {
      ...this.tokenKey(tokenHash),
      email,
      status: 'pending_setup',
      createdAt,
      expiresAt,
    };
    await this.dynamo.send(new PutCommand({
      TableName: this.cfg.tableName,
      Item: tokenRecord,
    }));
  }

  private async deleteToken(tokenHash: string): Promise<void> {
    await this.dynamo.send(new DeleteCommand({
      TableName: this.cfg.tableName,
      Key: this.tokenKey(tokenHash),
    }));
  }

  private async ensureCognitoUser(email: string): Promise<void> {
    try {
      await this.cognito.send(new AdminGetUserCommand({
        UserPoolId: this.cfg.userPoolId,
        Username: email,
      }));
    } catch {
      await this.cognito.send(new AdminCreateUserCommand({
        UserPoolId: this.cfg.userPoolId,
        Username: email,
        MessageAction: 'SUPPRESS',
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'false' },
        ],
      }));
    }
  }

  private async sendSetupEmail(email: string, token: string): Promise<void> {
    const setupLink = `${this.cfg.appBaseUrl.replace(/\/$/, '')}/setup-account?token=${encodeURIComponent(token)}`;
    await this.ses.send(new SendEmailCommand({
      Source: this.cfg.fromEmail,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: 'Set up your Care Indeed Compliance Demo account' },
        Body: {
          Text: {
            Data: [
              'Hello,',
              '',
              'Your access request has been accepted.',
              '',
              `Please complete setup using this secure link: ${setupLink}`,
              '',
              `This link expires in ${this.cfg.setupTokenTtlMinutes} minutes and can only be used once.`,
            ].join('\n'),
          },
        },
      },
    }));
  }

  private shouldThrottle(previous: RegistrationRecord | null): boolean {
    if (!previous) return false;
    const updatedAtMs = Date.parse(previous.updatedAt);
    if (Number.isNaN(updatedAtMs)) return false;
    return Date.now() - updatedAtMs < 30_000;
  }

  async registerRequest(emailRaw: string): Promise<RegisterResult> {
    const email = this.normalizeEmail(emailRaw);
    if (!email || !email.includes('@')) {
      throw new ApiError('validation_error', 'Please enter a valid email address.', 400);
    }

    const emailDomain = this.emailDomain(email);
    log.info('auth.register_request.incoming', {
      email,
      emailDomain,
      allowedDomain: this.cfg.autoApprovedDomain,
    });

    if (emailDomain !== this.cfg.autoApprovedDomain && !this.cfg.autoApprovedEmails.includes(email)) {
      throw new ApiError(
        'validation_error',
        `Only @${this.cfg.autoApprovedDomain} email addresses are allowed.`,
        403,
      );
    }

    const now = this.nowIso();
    const existing = await this.getRegistration(email);

    if (this.shouldThrottle(existing)) {
      return {
        requiresApproval: false,
        message: DEFAULT_REGISTER_MESSAGE,
      };
    }

    const { token, tokenHash, expiresAt } = this.generateSetupToken();

    if (existing?.setupTokenHash) {
      await this.deleteToken(existing.setupTokenHash);
    }

    try {
      await this.ensureCognitoUser(email);
      log.info('auth.register_request.cognito_ok', { email });

      const record: RegistrationRecord = {
        ...(existing?.pk ? existing : this.registrationKey(email)),
        email,
        emailDomain,
        cognitoUsername: email,
        status: 'pending_setup',
        setupTokenHash: tokenHash,
        setupTokenExpiresAt: expiresAt,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };

      await this.writeRegistration(record);
      await this.writeTokenRecord(tokenHash, email, now, expiresAt);

      try {
        await this.sendSetupEmail(email, token);
        log.info('auth.register_request.email_sent', { email });
        return { requiresApproval: false, message: DEFAULT_REGISTER_MESSAGE };
      } catch (sesErr) {
        const errCode = String((sesErr as { name?: string; code?: string })?.name || (sesErr as { code?: string })?.code || 'unknown');
        const errMessage = (sesErr as Error)?.message || 'Unknown email delivery failure';
        log.warn('auth.register_request.email_send_failed', { email, errCode, errMessage });
        const setupLink = `${this.cfg.appBaseUrl.replace(/\/$/, '')}/setup-account?token=${encodeURIComponent(token)}`;
        return {
          requiresApproval: false,
          message: 'Registration accepted, but setup email delivery is pending. Contact administrator.',
          debug: {
            setupLink,
            emailDelivery: { ok: false, errCode, errMessage },
          },
        };
      }
    } catch (err) {
      const errCode = (err as { name?: string; code?: string })?.name || (err as { code?: string })?.code || 'unknown';
      const errMessage = (err as Error)?.message || 'Unknown registration failure';
      log.warn('auth.register_request.failed', { email, errCode, errMessage });
      throw new ApiError('internal_error', 'Registration failed due to a system error. Please try again shortly.', 500);
    }
  }

  async resendSetupLink(emailRaw: string): Promise<{ message: string }> {
    const email = this.normalizeEmail(emailRaw);
    if (!email || !email.includes('@')) {
      throw new ApiError('validation_error', 'Please enter a valid email address.', 400);
    }

    const registration = await this.getRegistration(email);
    if (!registration || registration.status !== 'pending_setup') {
      return { message: DEFAULT_REGISTER_MESSAGE };
    }

    const { token, tokenHash, expiresAt } = this.generateSetupToken();
    const now = this.nowIso();

    if (registration.setupTokenHash) {
      await this.deleteToken(registration.setupTokenHash);
    }

    await this.writeRegistration({
      ...registration,
      setupTokenHash: tokenHash,
      setupTokenExpiresAt: expiresAt,
      updatedAt: now,
    });

    await this.writeTokenRecord(tokenHash, email, now, expiresAt);

    try {
      await this.sendSetupEmail(email, token);
      return { message: DEFAULT_REGISTER_MESSAGE };
    } catch (sesErr) {
      const errCode = String((sesErr as { name?: string; code?: string })?.name || (sesErr as { code?: string })?.code || 'unknown');
      const errMessage = (sesErr as Error)?.message || 'Unknown email delivery failure';
      log.warn('auth.resend_setup_link.email_send_failed', { email, errCode, errMessage });
      return { message: 'Setup email delivery is currently unavailable. Please contact your administrator.' };
    }
  }

  async setupAccount(input: {
    token: string;
    firstName: string;
    lastName: string;
    password: string;
  }): Promise<{ success: true }> {
    const tokenHash = this.hashToken(String(input.token || ''));
    const firstName = String(input.firstName || '').trim();
    const lastName = String(input.lastName || '').trim();

    if (!tokenHash || tokenHash.length < 8) {
      throw new ApiError('validation_error', 'Invalid setup token.', 400);
    }
    if (!firstName || !lastName) {
      throw new ApiError('validation_error', 'First name and last name are required.', 400);
    }
    this.validatePassword(input.password);

    const tokenItemResult = await this.dynamo.send(new GetCommand({
      TableName: this.cfg.tableName,
      Key: this.tokenKey(tokenHash),
    }));

    const tokenRecord = (tokenItemResult.Item as TokenRecord | undefined) ?? null;
    if (!tokenRecord) {
      throw new ApiError('validation_error', 'This setup link is invalid or has already been used.', 400);
    }
    if (tokenRecord.expiresAt <= this.nowEpochSeconds()) {
      await this.deleteToken(tokenHash);
      throw new ApiError('validation_error', 'This setup link has expired.', 400);
    }

    const email = tokenRecord.email;
    const registration = await this.getRegistration(email);
    if (!registration || registration.status !== 'pending_setup') {
      await this.deleteToken(tokenHash);
      throw new ApiError('validation_error', 'This setup link is no longer valid.', 400);
    }

    await this.ensureCognitoUser(email);
    await this.cognito.send(new AdminSetUserPasswordCommand({
      UserPoolId: this.cfg.userPoolId,
      Username: email,
      Password: input.password,
      Permanent: true,
    }));

    await this.cognito.send(new AdminUpdateUserAttributesCommand({
      UserPoolId: this.cfg.userPoolId,
      Username: email,
      UserAttributes: [
        { Name: 'given_name', Value: firstName },
        { Name: 'family_name', Value: lastName },
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'true' },
      ],
    }));

    await this.cognito.send(new AdminEnableUserCommand({
      UserPoolId: this.cfg.userPoolId,
      Username: email,
    }));

    const now = this.nowIso();
    await this.dynamo.send(new UpdateCommand({
      TableName: this.cfg.tableName,
      Key: this.registrationKey(email),
      UpdateExpression: 'SET #status = :active, setupCompletedAt = :setupCompletedAt, updatedAt = :updatedAt REMOVE setupTokenHash, setupTokenExpiresAt',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':active': 'active' as RegistrationStatus,
        ':setupCompletedAt': now,
        ':updatedAt': now,
      },
    }));

    await this.deleteToken(tokenHash);
    return { success: true };
  }

  async login(emailRaw: string, password: string): Promise<LoginResult> {
    const email = this.normalizeEmail(emailRaw);
    if (!email || !password) {
      throw new ApiError('validation_error', 'Email and password are required.', 400);
    }

    const registration = await this.getRegistration(email);
    if (!registration || registration.status !== 'active') {
      throw new ApiError('auth_error', 'Account is not active.', 403);
    }

    try {
      const response = await this.cognito.send(new InitiateAuthCommand({
        ClientId: this.cfg.clientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      }));

      if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED' && response.Session) {
        return {
          challenge: 'NEW_PASSWORD_REQUIRED',
          challengeName: 'NEW_PASSWORD_REQUIRED',
          session: response.Session,
          email,
        };
      }

      const auth = response.AuthenticationResult;
      if (!auth?.AccessToken || !auth.IdToken || !auth.RefreshToken || !auth.ExpiresIn || !auth.TokenType) {
        throw new ApiError('auth_error', 'Login failed. Please try again.', 401);
      }

      const user = await this.getCurrentUser(auth.AccessToken);
      return {
        session: {
          accessToken: auth.AccessToken,
          idToken: auth.IdToken,
          refreshToken: auth.RefreshToken,
          expiresIn: auth.ExpiresIn,
          tokenType: auth.TokenType,
        },
        user,
      };
    } catch (err) {
      log.warn('auth.login.failed', { email, err: (err as Error).message });
      throw new ApiError('auth_error', 'Invalid email or password.', 401);
    }
  }

  async respondToNewPasswordChallenge(
    emailRaw: string,
    sessionRaw: string,
    newPasswordRaw: string,
  ): Promise<{ session: AuthSession; user: DemoUser }> {
    const email = this.normalizeEmail(emailRaw);
    const session = String(sessionRaw || '');
    const newPassword = String(newPasswordRaw || '');

    if (!email || !email.includes('@')) {
      throw new ApiError('validation_error', 'Email is required.', 400);
    }
    if (!session) {
      throw new ApiError('validation_error', 'Challenge session is required.', 400);
    }
    this.validatePassword(newPassword);

    const registration = await this.getRegistration(email);
    if (!registration || registration.status !== 'active') {
      throw new ApiError('auth_error', 'Account is not active.', 403);
    }

    try {
      const response = await this.cognito.send(new RespondToAuthChallengeCommand({
        ClientId: this.cfg.clientId,
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        Session: session,
        ChallengeResponses: {
          USERNAME: email,
          NEW_PASSWORD: newPassword,
        },
      }));

      if (response.ChallengeName) {
        throw new ApiError('auth_error', 'Password challenge requires an unsupported follow-up challenge.', 401);
      }

      const auth = response.AuthenticationResult;
      if (!auth?.AccessToken || !auth.IdToken || !auth.RefreshToken || !auth.ExpiresIn || !auth.TokenType) {
        throw new ApiError('auth_error', 'Unable to complete password challenge.', 401);
      }

      const user = await this.getCurrentUser(auth.AccessToken);
      return {
        session: {
          accessToken: auth.AccessToken,
          idToken: auth.IdToken,
          refreshToken: auth.RefreshToken,
          expiresIn: auth.ExpiresIn,
          tokenType: auth.TokenType,
        },
        user,
      };
    } catch (err) {
      const errCode = String((err as { name?: string; code?: string })?.name || (err as { code?: string })?.code || 'unknown');
      log.warn('auth.respond_challenge.failed', { email, errCode });
      throw new ApiError('auth_error', 'Unable to complete password challenge.', 401);
    }
  }

  async refresh(refreshToken: string): Promise<AuthSession> {
    if (!refreshToken) {
      throw new ApiError('auth_error', 'Missing refresh token.', 401);
    }
    const response = await this.cognito.send(new InitiateAuthCommand({
      ClientId: this.cfg.clientId,
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: { REFRESH_TOKEN: refreshToken },
    }));

    const auth = response.AuthenticationResult;
    if (!auth?.AccessToken || !auth?.IdToken || !auth?.ExpiresIn || !auth?.TokenType) {
      throw new ApiError('auth_error', 'Session refresh failed.', 401);
    }

    // COG-1 fail-closed: validate the refreshed access token through the same
    // getCurrentUser seam used by /me, which enforces the active-registration
    // gate. A user suspended/disabled mid-session therefore cannot obtain a
    // refreshed session (it throws 403), rather than extending access to the
    // next token lifetime.
    await this.getCurrentUser(auth.AccessToken);

    return {
      accessToken: auth.AccessToken,
      idToken: auth.IdToken,
      refreshToken,
      expiresIn: auth.ExpiresIn,
      tokenType: auth.TokenType,
    };
  }

  async logout(accessToken: string): Promise<void> {
    if (!accessToken) return;
    try {
      await this.cognito.send(new GlobalSignOutCommand({ AccessToken: accessToken }));
    } catch {
      // Best effort logout for demo flows.
    }
  }

  async getCurrentUser(accessToken: string): Promise<DemoUser> {
    let me;
    try {
      me = await this.cognito.send(new GetUserCommand({ AccessToken: accessToken }));
    } catch (err) {
      // A rejected token is a 401, not a 500. Cognito reports missing / malformed
      // / expired / revoked / wrong-issuer / invalid-signature access tokens via
      // these client faults. Anything else (provider outage, throttling, network)
      // is a genuine upstream failure and must surface as a 5xx — rethrown as-is.
      // The 401 leaks no stack, token, or header — only a generic message.
      const name = (err as { name?: string })?.name ?? '';
      const TOKEN_FAULTS = new Set([
        'NotAuthorizedException',
        'UserNotFoundException',
        'TokenExpiredException',
        'InvalidParameterException',
        'ExpiredTokenException',
      ]);
      if (TOKEN_FAULTS.has(name)) {
        throw new ApiError('auth_error', 'Not authenticated.', 401);
      }
      throw err;
    }
    const attrs = Object.fromEntries((me.UserAttributes ?? []).map(a => [a.Name ?? '', a.Value ?? '']));
    const firstName = attrs.given_name;
    const lastName = attrs.family_name;
    const name = attrs.name || [firstName, lastName].filter(Boolean).join(' ').trim() || undefined;
    const authSubject = attrs.sub || me.Username;
    const email = attrs.email ?? '';
    // COG-1 fail-closed: reject suspended/disabled application users even when
    // the Cognito token itself is still valid. Without this, a user suspended
    // mid-session keeps access until the access token expires.
    const registration = email ? await this.getRegistration(email) : null;
    assertRegistrationActiveForSession(registration);
    // COG-1: enrich the verified Cognito identity with the server-side
    // allowlist role/department. The client can only display this — the
    // server derives it fresh on every /me call, so no client edit
    // (localStorage/payload/header) can elevate a role.
    const approved = email ? findApprovedUserByEmail(email) : null;
    return {
      id: authSubject,
      authSubject,
      provider: 'cognito',
      email,
      name,
      firstName,
      lastName,
      emailVerified: attrs.email_verified === 'true',
      role: approved?.role,
      department: approved?.department,
    };
  }

  /**
   * Server-authoritative administrator predicate — the SINGLE source of truth
   * for "is this email an administrator": membership in the configured admin
   * allowlist (ADMIN_MANUAL_PASSWORD_EMAILS). Both `assertAdminAccessToken`
   * (route guards) and `resolveCapabilities` (the /capabilities contract) derive
   * admin authority from here, so the UI capability and the enforced server
   * boundary cannot drift. Never consults client-supplied role/headers/storage.
   */
  isAdminEmail(emailRaw: string | null | undefined): boolean {
    const email = this.normalizeEmail(emailRaw ?? '');
    return !!email && this.cfg.adminManualPasswordEmails.includes(email);
  }

  async assertAdminAccessToken(actorAccessToken: string): Promise<string> {
    const accessToken = String(actorAccessToken || '').trim();
    if (!accessToken) {
      throw new ApiError('auth_error', 'Not authenticated.', 401);
    }

    const actor = await this.getCurrentUser(accessToken);
    const actorEmail = this.normalizeEmail(actor.email);
    if (!this.isAdminEmail(actorEmail)) {
      log.warn('auth.admin_access.forbidden', { actorEmail });
      throw new ApiError('forbidden', 'You do not have permission to manage user access.', 403);
    }

    return actorEmail;
  }

  /**
   * Server-derived capability contract for the authenticated actor. Requires a
   * valid access token — `getCurrentUser` throws 401 for a missing, malformed,
   * expired, or revoked token. `manageUsers` is derived from the SAME server
   * authority as the admin route guards (`isAdminEmail`), never from a
   * client-supplied role, header, or browser-stored value. Exposes no admin
   * allowlist contents and no Cognito subject.
   */
  async resolveCapabilities(actorAccessToken: string): Promise<{ manageUsers: boolean; manageUserStatus: boolean }> {
    const accessToken = String(actorAccessToken || '').trim();
    if (!accessToken) {
      throw new ApiError('auth_error', 'Not authenticated.', 401);
    }
    const actor = await this.getCurrentUser(accessToken);
    const isAdmin = this.isAdminEmail(actor.email);
    // manageUserStatus (suspend/reactivate) shares the approved-admin authority;
    // the server endpoint additionally honors canonical admin-group actors.
    return { manageUsers: isAdmin, manageUserStatus: isAdmin };
  }

  async forgotPassword(emailRaw: string): Promise<{ message: string }> {
    const email = this.normalizeEmail(emailRaw);
    if (!email || !email.includes('@')) {
      throw new ApiError('validation_error', 'Please enter a valid email address.', 400);
    }

    try {
      await this.cognito.send(new ForgotPasswordCommand({
        ClientId: this.cfg.clientId,
        Username: email,
      }));
    } catch (err) {
      // Keep behavior non-enumerating; callers receive a generic success message.
      log.warn('auth.forgot_password.failed', { email, err: (err as Error).message });
    }

    return { message: 'If the account exists, a reset code has been sent.' };
  }

  async resetPassword(emailRaw: string, codeRaw: string, newPasswordRaw: string): Promise<{ message: string }> {
    const email = this.normalizeEmail(emailRaw);
    const code = String(codeRaw || '').trim();
    const newPassword = String(newPasswordRaw || '');

    if (!email || !email.includes('@')) {
      throw new ApiError('validation_error', 'Please enter a valid email address.', 400);
    }
    if (!code) {
      throw new ApiError('validation_error', 'Reset code is required.', 400);
    }
    this.validatePassword(newPassword);

    await this.cognito.send(new ConfirmForgotPasswordCommand({
      ClientId: this.cfg.clientId,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    }));

    return { message: 'Password reset successfully.' };
  }

  async adminSetUserPassword(
    actorAccessToken: string,
    targetEmailRaw: string,
    newPasswordRaw: string,
  ): Promise<{ message: string }> {
    const actorEmail = await this.assertAdminAccessToken(actorAccessToken);
    const targetEmail = this.normalizeEmail(targetEmailRaw);

    if (!targetEmail || !targetEmail.includes('@')) {
      throw new ApiError('validation_error', 'Please enter a valid user email address.', 400);
    }
    this.assertNotProtectedAuthEmail(actorEmail, targetEmail, 'admin_set_password');

    const newPassword = String(newPasswordRaw || '');
    this.validatePassword(newPassword);

    try {
      await this.cognito.send(new AdminGetUserCommand({
        UserPoolId: this.cfg.userPoolId,
        Username: targetEmail,
      }));
    } catch (err) {
      const name = (err as { name?: string })?.name;
      if (name === 'UserNotFoundException' || name === 'ResourceNotFoundException') {
        throw new ApiError('validation_error', 'Target user was not found.', 404);
      }
      throw err;
    }

    await this.cognito.send(new AdminSetUserPasswordCommand({
      UserPoolId: this.cfg.userPoolId,
      Username: targetEmail,
      Password: newPassword,
      Permanent: true,
    }));

    await this.cognito.send(new AdminEnableUserCommand({
      UserPoolId: this.cfg.userPoolId,
      Username: targetEmail,
    }));

    const now = this.nowIso();
    const registration = await this.getRegistration(targetEmail);
    if (registration) {
      await this.dynamo.send(new UpdateCommand({
        TableName: this.cfg.tableName,
        Key: this.registrationKey(targetEmail),
        UpdateExpression: 'SET #status = :active, updatedAt = :updatedAt',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':active': 'active' as RegistrationStatus,
          ':updatedAt': now,
        },
      }));
    }

    log.info('auth.admin_set_password.success', {
      actorEmail,
      targetEmail,
    });

    return { message: 'Password updated successfully.' };
  }

  async adminGrantUserAccess(
    actorAccessToken: string,
    targetEmailRaw: string,
    newPasswordRaw: string,
  ): Promise<{ message: string }> {
    const actorEmail = await this.assertAdminAccessToken(actorAccessToken);
    const targetEmail = this.normalizeEmail(targetEmailRaw);
    if (!targetEmail || !targetEmail.includes('@')) {
      throw new ApiError('validation_error', 'Please enter a valid user email address.', 400);
    }
    this.assertNotProtectedAuthEmail(actorEmail, targetEmail, 'admin_grant_access');

    const newPassword = String(newPasswordRaw || '');
    this.validatePassword(newPassword);

    await this.ensureCognitoUser(targetEmail);
    await this.cognito.send(new AdminSetUserPasswordCommand({
      UserPoolId: this.cfg.userPoolId,
      Username: targetEmail,
      Password: newPassword,
      Permanent: true,
    }));
    await this.cognito.send(new AdminUpdateUserAttributesCommand({
      UserPoolId: this.cfg.userPoolId,
      Username: targetEmail,
      UserAttributes: [
        { Name: 'email', Value: targetEmail },
        { Name: 'email_verified', Value: 'true' },
      ],
    }));
    await this.cognito.send(new AdminEnableUserCommand({
      UserPoolId: this.cfg.userPoolId,
      Username: targetEmail,
    }));

    const now = this.nowIso();
    const existing = await this.getRegistration(targetEmail);
    const record: RegistrationRecord = {
      ...(existing?.pk ? existing : this.registrationKey(targetEmail)),
      email: targetEmail,
      emailDomain: this.emailDomain(targetEmail),
      cognitoUsername: targetEmail,
      status: 'active',
      setupCompletedAt: existing?.setupCompletedAt ?? now,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      approvedAt: existing?.approvedAt ?? now,
      approvedBy: actorEmail,
    };
    delete (record as Partial<RegistrationRecord>).setupTokenHash;
    delete (record as Partial<RegistrationRecord>).setupTokenExpiresAt;

    await this.writeRegistration(record);

    log.info('auth.admin_grant_access.success', {
      actorEmail,
      targetEmail,
    });

    return { message: 'Access granted successfully.' };
  }

  /**
   * Administrator-only user invitation. Distinct from the unauthenticated,
   * self-service `registerRequest` path: the caller MUST present a valid admin
   * access token, the administrator actor is derived from that token (never from
   * the request body), and the target email is only the invitation target. The
   * Cognito user is created idempotently and a pending_setup registration is
   * written, then the approved setup-link is sent via the existing SES mechanism
   * (best-effort). This method NEVER returns a setup token, setup link, or any
   * credential. Email normalization is trim+lowercase only, so a plus-tagged
   * address (e.g. `robertp+phase7uat@…`) stays distinct from the base address
   * (`robertp@…`) — no identity collapse. An already-active account is not
   * re-provisioned and no duplicate canonical user is created.
   */
  async adminInviteUser(actorAccessToken: string, targetEmailRaw: string): Promise<AdminInviteResult> {
    const actorEmail = await this.assertAdminAccessToken(actorAccessToken);
    const targetEmail = this.normalizeEmail(targetEmailRaw);
    if (!targetEmail || !targetEmail.includes('@')) {
      throw new ApiError('validation_error', 'Please enter a valid user email address.', 400);
    }
    this.assertNotProtectedAuthEmail(actorEmail, targetEmail, 'admin_invite');

    const existing = await this.getRegistration(targetEmail);
    if (existing?.status === 'active') {
      // Idempotent: an already-active account is neither re-invited nor
      // duplicated. Report the existing state so the caller can surface a
      // conflict-style message.
      log.info('auth.admin_invite.already_active', { actorEmail, targetEmail });
      return { actorEmail, targetEmail, status: 'already_active', emailDelivered: false, provisioned: false };
    }
    const wasPending = existing?.status === 'pending_setup';

    const now = this.nowIso();
    const { token, tokenHash, expiresAt } = this.generateSetupToken();
    if (existing?.setupTokenHash) {
      await this.deleteToken(existing.setupTokenHash);
    }

    // ensureCognitoUser is idempotent (AdminGetUser → create only if absent), so a
    // retry after a partial failure re-ensures rather than duplicating the user.
    await this.ensureCognitoUser(targetEmail);

    const record: RegistrationRecord = {
      ...(existing?.pk ? existing : this.registrationKey(targetEmail)),
      email: targetEmail,
      emailDomain: this.emailDomain(targetEmail),
      cognitoUsername: targetEmail,
      status: 'pending_setup',
      setupTokenHash: tokenHash,
      setupTokenExpiresAt: expiresAt,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      approvedAt: existing?.approvedAt ?? now,
      approvedBy: actorEmail,
    };
    await this.writeRegistration(record);
    await this.writeTokenRecord(tokenHash, targetEmail, now, expiresAt);

    let emailDelivered = false;
    try {
      await this.sendSetupEmail(targetEmail, token);
      emailDelivered = true;
    } catch (sesErr) {
      // Delivery may be unavailable (e.g. SES not yet approved for this account).
      // The invitation still stands as pending_setup; never surface the token/link.
      log.warn('auth.admin_invite.email_send_failed', {
        actorEmail,
        targetEmail,
        errCode: String((sesErr as { name?: string; code?: string })?.name || (sesErr as { code?: string })?.code || 'unknown'),
      });
    }

    const status: AdminInviteStatus = wasPending
      ? 'already_pending'
      : (emailDelivered ? 'invited_and_delivered' : 'created_delivery_pending');
    log.info('auth.admin_invite.result', { actorEmail, targetEmail, status, emailDelivered });
    return { actorEmail, targetEmail, status, emailDelivered, provisioned: true };
  }

  async verifyRegistration(emailRaw: string, sfOrgIdRaw: string): Promise<{
    verified: true;
    approvedUser: { fullName: string; role: string; department: string };
  }> {
    // Fail closed if allowlist not loaded.
    if (!isAllowlistAvailable()) {
      log.error('auth.verify_registration.allowlist_unavailable', { error: getLoadError() });
      throw new ApiError('auth_error', 'Registration verification failed. Please contact your administrator.', 403);
    }

    const email = normalizeApprovedEmail(emailRaw);
    // sfOrgId is normalized but never logged.
    const sfOrgId = normalizeSfOrgId(sfOrgIdRaw);

    if (!email || !email.includes('@')) {
      throw new ApiError('validation_error', 'Registration verification failed. Please contact your administrator.', 403);
    }
    if (!sfOrgId) {
      throw new ApiError('validation_error', 'Registration verification failed. Please contact your administrator.', 403);
    }

    log.info('auth.verify_registration.attempt', { email });

    // Block if account already fully registered.
    const existingReg = await this.getRegistration(email);
    if (existingReg?.status === 'active') {
      log.warn('auth.verify_registration.already_registered', { email });
      throw new ApiError('duplicate', 'Account already registered. Please change your password.', 409);
    }

    const approved = findApprovedUser(email, sfOrgId);
    if (!approved) {
      log.warn('auth.verify_registration.denied', { email });
      throw new ApiError('auth_error', 'Registration verification failed. Please contact your administrator.', 403);
    }

    // Log outcome only: email + role. Never log the SF Org ID or password.
    log.info('auth.verify_registration.approved', { email, role: approved.role });
    return {
      verified: true,
      approvedUser: {
        fullName: approved.fullName,
        role: approved.role,
        department: approved.department,
      },
    };
  }

  /**
   * Complete allowlist + activation-code account setup with audit reconciliation.
   *
   * `audit` is a REQUIRED, phase-aware sink: `setup_started` is written before any
   * irreversible mutation (a failure aborts before Cognito), and `setup_complete`
   * is written AFTER the Cognito mutation but BEFORE the registration is marked
   * active. The registration is persisted as `pending_setup` before the success
   * audit, so if that audit fails the account stays non-active — the session gate
   * (`assertRegistrationActiveForSession`) denies login, and a retry re-ensures
   * (never duplicates) the user and reconciles the audit + activation. No
   * distributed transaction is claimed across Cognito and JSONL; the invariant is
   * "no activated account is normally usable while its activation audit is absent".
   */
  async setupAccountDirect(input: {
    email: string;
    sfOrgId: string;
    firstName: string;
    lastName: string;
    password: string;
  }, audit: DirectSetupAuditSink): Promise<{ success: true }> {
    // Fail closed if allowlist not loaded.
    if (!isAllowlistAvailable()) {
      log.error('auth.setup_account_direct.allowlist_unavailable', { error: getLoadError() });
      throw new ApiError('auth_error', 'Registration verification failed. Please contact your administrator.', 403);
    }

    const email = normalizeApprovedEmail(input.email);
    // sfOrgId is normalized but never logged.
    const sfOrgId = normalizeSfOrgId(input.sfOrgId);

    // Re-verify against allowlist (prevents bypass if verify step was skipped).
    const approved = findApprovedUser(email, sfOrgId);
    if (!approved) {
      log.warn('auth.setup_account_direct.not_approved', { email });
      throw new ApiError('auth_error', 'Registration verification failed. Please contact your administrator.', 403);
    }

    // Prevent duplicate account creation (fully completed activation is replay-safe).
    const existing = await this.getRegistration(email);
    if (existing?.status === 'active') {
      log.warn('auth.setup_account_direct.duplicate', { email });
      throw new ApiError('duplicate', 'Account already registered. Please change your password.', 409);
    }

    const firstName = String(input.firstName || '').trim();
    const lastName  = String(input.lastName  || '').trim();
    if (!firstName || !lastName) {
      throw new ApiError('validation_error', 'First name and last name are required.', 400);
    }
    // validatePassword never logs the password value.
    this.validatePassword(input.password);

    // (1) Durable intent audit BEFORE any irreversible mutation. A failure here
    // throws (503) and no Cognito mutation occurs.
    await audit('setup_started');

    // (2) Irreversible identity mutation (ensureCognitoUser is idempotent).
    await this.ensureCognitoUser(email);
    await this.cognito.send(new AdminSetUserPasswordCommand({
      UserPoolId: this.cfg.userPoolId,
      Username: email,
      Password: input.password,
      Permanent: true,
    }));
    await this.cognito.send(new AdminUpdateUserAttributesCommand({
      UserPoolId: this.cfg.userPoolId,
      Username: email,
      UserAttributes: [
        { Name: 'given_name', Value: firstName },
        { Name: 'family_name', Value: lastName },
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'true' },
      ],
    }));
    await this.cognito.send(new AdminEnableUserCommand({
      UserPoolId: this.cfg.userPoolId,
      Username: email,
    }));

    const now = this.nowIso();
    const emailDomain = this.emailDomain(email);
    const base: RegistrationRecord = {
      ...(existing?.pk ? existing : this.registrationKey(email)),
      email,
      emailDomain,
      cognitoUsername: email,
      status: 'pending_setup' as RegistrationStatus,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      approvedBy: 'sf-org-id-verification',
    };
    delete (base as Partial<RegistrationRecord>).setupTokenHash;
    delete (base as Partial<RegistrationRecord>).setupTokenExpiresAt;

    // (3) Persist a NON-active record first: a crash or audit failure now leaves
    // the account not-normally-usable (session gate denies non-active).
    await this.writeRegistration({ ...base, status: 'pending_setup' });

    // (4) Required success audit AFTER mutation, BEFORE activation. A failure here
    // throws (500); the account stays pending_setup and a retry reconciles.
    await audit('setup_complete');

    // (5) Only now mark the account active / normally usable.
    await this.writeRegistration({ ...base, status: 'active' as RegistrationStatus, setupCompletedAt: now });

    // Log outcome only: email + role. Never log SF Org ID or password.
    log.info('auth.setup_account_direct.complete', { email, role: approved.role });
    return { success: true };
  }
}

export function buildDemoAuthServiceFromEnv(envLike: NodeJS.ProcessEnv): DemoAuthService {
  const region = envLike.AWS_REGION || envLike.AWS_DEFAULT_REGION || '';
  const userPoolId = envLike.COGNITO_USER_POOL_ID || '';
  const clientId = envLike.COGNITO_CLIENT_ID || '';
  const fromEmail = envLike.FROM_EMAIL || '';
  const appBaseUrl = envLike.APP_BASE_URL || 'http://localhost:5173';
  const tableName = envLike.REGISTRATION_TABLE_NAME || '';
  const setupTokenTtlMinutes = Number(envLike.SETUP_TOKEN_TTL_MINUTES || 60);
  const autoApprovedDomain = (envLike.AUTO_APPROVED_DOMAIN || 'careindeed.com').toLowerCase();
  const autoApprovedEmails = String(envLike.AUTO_APPROVED_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
  const defaultProtectedAuthEmails = [
    'robertp@careindeed.com',
    'tjpadilla@careindeed.com',
    'tj@careindeed.com',
    'maritesa@careindeed.com',
    'marites@careindeed.com',
    'deeb@careindeed.com',
    'dee@careindeed.com',
  ].join(',');
  const protectedAuthEmails = String(envLike.PROTECTED_AUTH_EMAILS || defaultProtectedAuthEmails)
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
  const adminManualPasswordEmails = String(
    envLike.ADMIN_MANUAL_PASSWORD_EMAILS || 'robertp@careindeed.com,maritesa@careindeed.com,marites@careindeed.com',
  )
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);

  if (!region || !userPoolId || !clientId || !fromEmail || !tableName) {
    throw new ApiError('internal_error', 'Auth environment is not configured.', 500);
  }

  return new DemoAuthService({
    region,
    userPoolId,
    clientId,
    fromEmail,
    appBaseUrl,
    tableName,
    setupTokenTtlMinutes,
    autoApprovedDomain,
    autoApprovedEmails,
    protectedAuthEmails,
    adminManualPasswordEmails,
  });
}
