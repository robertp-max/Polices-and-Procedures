import crypto from 'node:crypto';
import {
  AdminCreateUserCommand,
  AdminEnableUserCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
  GetUserCommand,
  GlobalSignOutCommand,
  InitiateAuthCommand,
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
import { findApprovedUser, getLoadError, isAllowlistAvailable, normalizeEmail as normalizeApprovedEmail, normalizeSfOrgId } from './approvedUsers.js';

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
}

interface RegisterResult {
  requiresApproval: boolean;
  message: string;
  debug?: {
    setupLink?: string;
    emailDelivery?: { ok: boolean; errCode?: string; errMessage?: string };
  };
}

const DEFAULT_REGISTER_MESSAGE = 'If your email is eligible, we sent a setup link. Please check your inbox.';

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
    if (!password || password.length < 8) {
      throw new ApiError('validation_error', 'Password must be at least 8 characters.', 400);
    }
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

  async login(emailRaw: string, password: string): Promise<{ session: AuthSession; user: DemoUser }> {
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
    const me = await this.cognito.send(new GetUserCommand({ AccessToken: accessToken }));
    const attrs = Object.fromEntries((me.UserAttributes ?? []).map(a => [a.Name ?? '', a.Value ?? '']));
    return {
      email: attrs.email ?? '',
      firstName: attrs.given_name,
      lastName: attrs.family_name,
      emailVerified: attrs.email_verified === 'true',
    };
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
      throw new ApiError('auth_error', 'Registration verification failed. Please contact your administrator.', 403);
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

  async setupAccountDirect(input: {
    email: string;
    sfOrgId: string;
    firstName: string;
    lastName: string;
    password: string;
  }): Promise<{ success: true }> {
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

    // Prevent duplicate account creation.
    const existing = await this.getRegistration(email);
    if (existing?.status === 'active') {
      log.warn('auth.setup_account_direct.duplicate', { email });
      throw new ApiError('auth_error', 'Registration verification failed. Please contact your administrator.', 403);
    }

    const firstName = String(input.firstName || '').trim();
    const lastName  = String(input.lastName  || '').trim();
    if (!firstName || !lastName) {
      throw new ApiError('validation_error', 'First name and last name are required.', 400);
    }
    // validatePassword never logs the password value.
    this.validatePassword(input.password);

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

    const record: RegistrationRecord = {
      ...(existing?.pk ? existing : this.registrationKey(email)),
      email,
      emailDomain,
      cognitoUsername: email,
      status: 'active' as RegistrationStatus,
      setupCompletedAt: now,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      approvedBy: 'sf-org-id-verification',
    };
    delete (record as Partial<RegistrationRecord>).setupTokenHash;
    delete (record as Partial<RegistrationRecord>).setupTokenExpiresAt;

    await this.writeRegistration(record);

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
  });
}
