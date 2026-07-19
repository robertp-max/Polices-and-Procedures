import { Router, type Request, type Response, type NextFunction } from 'express';
import { ApiError } from '../errors.js';
import { appendEvent } from '../audit/writer.js';
import { recordInviteAudit, inviteResultMessage } from '../auth/inviteAudit.js';
import { buildDemoAuthServiceFromEnv } from '../auth/service.js';
import {
  getAllowlistStatus,
  reloadApprovedUsers,
  validateAllowlistCsv,
} from '../auth/approvedUsers.js';
import { getPageAccessPersistence } from '../auth/pageAccessPersistence.js';
import {
  getAppIdentityPersistence,
  syncActiveRegistrationsIntoIdentityRegistry,
  upsertAuthenticatedIdentity,
} from '../auth/appIdentityPersistence.js';

export const authRouter: Router = Router();

// ─── New allowlist-gated registration (SF Org ID) ────────────────────────────

authRouter.post('/verify-registration', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const email   = String(req.body?.email   || '');
  const sfOrgId = String(req.body?.sfOrgId || '');
  const result  = await service.verifyRegistration(email, sfOrgId);
  res.json(result);
}));

authRouter.post('/setup-account-direct', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const { email, sfOrgId, firstName, lastName, password } = req.body ?? {};
  const result = await service.setupAccountDirect({
    email:     String(email     || ''),
    sfOrgId:   String(sfOrgId   || ''),
    firstName: String(firstName || ''),
    lastName:  String(lastName  || ''),
    password:  String(password  || ''),
  });
  res.json(result);
}));

// ─── Allowlist status (no auth required — returns public-safe boolean only) ──

authRouter.get('/allowlist-status', (_req, res) => {
  const status = getAllowlistStatus();
  // Return only the public-safe available flag. Internal details (path, error
  // text, counts) must not be exposed to unauthenticated callers.
  res.json({ available: status.available });
});

// ─── Admin: reload allowlist from disk ───────────────────────────────────────
// Requires ADMIN_RELOAD_SECRET env var to be set and matched.

authRouter.post('/reload-allowlist', (req, res) => {
  const secret = process.env.ADMIN_RELOAD_SECRET;
  if (!secret || req.header('x-admin-secret') !== secret) {
    res.status(403).json({ error: { code: 'forbidden', message: 'Forbidden.' } });
    return;
  }
  const status = reloadApprovedUsers();
  // Return full status summary to the authenticated admin caller.
  res.json({
    available:     status.available,
    totalDataRows: status.totalDataRows,
    malformedRows: status.malformedRows,
    activeRows:    status.activeRows,
    error:         status.error,
  });
});

// ─── Admin: dry-run CSV validation ───────────────────────────────────────────

authRouter.post('/validate-allowlist-csv', (req, res) => {
  const secret = process.env.ADMIN_RELOAD_SECRET;
  if (!secret || req.header('x-admin-secret') !== secret) {
    res.status(403).json({ error: { code: 'forbidden', message: 'Forbidden.' } });
    return;
  }
  const overridePath = typeof req.body?.path === 'string' ? req.body.path : undefined;
  const status = validateAllowlistCsv(overridePath);
  res.json({
    available:     status.available,
    path:          status.path,
    totalDataRows: status.totalDataRows,
    malformedRows: status.malformedRows,
    activeRows:    status.activeRows,
    error:         status.error,
  });
});

// ─── Legacy email-invite registration routes — TEMPORARILY DISABLED ──────────
// These endpoints rely on email verification/invite delivery. Keep them blocked
// until this app is added to the company AWS account with approved SES setup.

authRouter.post('/register-request', (_req, res) => {
  res.status(503).json({
    error: {
      code: 'auth_error',
      message: 'Email verification workflow is temporarily disabled. Please use direct registration.',
    },
  });
});

authRouter.post('/resend-setup-link', (_req, res) => {
  res.status(503).json({
    error: {
      code: 'auth_error',
      message: 'Email verification workflow is temporarily disabled. Please use direct registration.',
    },
  });
});

authRouter.post('/setup-account', (_req, res) => {
  res.status(503).json({
    error: {
      code: 'auth_error',
      message: 'Email verification workflow is temporarily disabled. Please use direct registration.',
    },
  });
});

// ─── Login, session, and account management (unchanged) ──────────────────────

authRouter.post('/login', asyncHandler(async (req, res) => {
  const service  = buildDemoAuthServiceFromEnv(process.env);
  const email    = String(req.body?.email    || '');
  const password = String(req.body?.password || '');
  const result   = await service.login(email, password);
  if (!('challenge' in result)) {
    try {
      await upsertAuthenticatedIdentity(result.user);
    } catch {
      // The explicit identity-sync endpoint can retry; do not block login.
    }
  }
  res.json(result);
}));

authRouter.post('/respond-challenge', asyncHandler(async (req, res) => {
  const service      = buildDemoAuthServiceFromEnv(process.env);
  const email        = String(req.body?.email       || '');
  const session      = String(req.body?.session     || '');
  const newPassword  = String(req.body?.newPassword || '');
  const result       = await service.respondToNewPasswordChallenge(email, session, newPassword);
  try {
    await upsertAuthenticatedIdentity(result.user);
  } catch {
    // The explicit identity-sync endpoint can retry; do not block challenge completion.
  }
  res.json(result);
}));

authRouter.post('/forgot-password', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const email = String(req.body?.email || '');
  const result = await service.forgotPassword(email);
  res.json(result);
}));

authRouter.post('/reset-password', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const email = String(req.body?.email || '');
  const code = String(req.body?.code || '');
  const newPassword = String(req.body?.newPassword || '');
  const result = await service.resetPassword(email, code, newPassword);
  res.json(result);
}));

authRouter.post('/admin/manual-password-reset', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const auth = req.header('authorization') ?? '';
  const accessToken = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
  const email = String(req.body?.email || '');
  const newPassword = String(req.body?.newPassword || '');
  const result = await service.adminSetUserPassword(accessToken, email, newPassword);
  res.json(result);
}));

authRouter.post('/admin/grant-access', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const auth = req.header('authorization') ?? '';
  const accessToken = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
  const email = String(req.body?.email || '');
  const newPassword = String(req.body?.newPassword || '');
  const result = await service.adminGrantUserAccess(accessToken, email, newPassword);
  res.json(result);
}));

authRouter.get('/page-access/me', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const auth = req.header('authorization') ?? '';
  const accessToken = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
  if (!accessToken) {
    throw new ApiError('auth_error', 'Not authenticated.', 401);
  }

  const actor = await service.getCurrentUser(accessToken);
  const actorEmail = String(actor.email || '').trim().toLowerCase();
  const access = await getPageAccessPersistence().getAll();
  res.json({
    actorEmail,
    record: actorEmail ? (access[actorEmail] ?? null) : null,
  });
}));

authRouter.get('/admin/page-access', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const auth = req.header('authorization') ?? '';
  const accessToken = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
  await service.assertAdminAccessToken(accessToken);
  const access = await getPageAccessPersistence().getAll();
  res.json({ access });
}));

authRouter.put('/admin/page-access', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const auth = req.header('authorization') ?? '';
  const accessToken = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
  await service.assertAdminAccessToken(accessToken);
  const access = (req.body?.access && typeof req.body.access === 'object')
    ? req.body.access as Record<string, unknown>
    : {};
  const saved = await getPageAccessPersistence().putAll(access);
  res.json({ access: saved });
}));

authRouter.post('/identity-sync/me', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const auth = req.header('authorization') ?? '';
  const accessToken = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
  if (!accessToken) {
    throw new ApiError('auth_error', 'Not authenticated.', 401);
  }

  const user = await service.getCurrentUser(accessToken);
  const registry = await upsertAuthenticatedIdentity(user);
  res.json(registry);
}));

authRouter.get('/admin/identity-registry', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const auth = req.header('authorization') ?? '';
  const accessToken = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
  await service.assertAdminAccessToken(accessToken);
  const registry = await getAppIdentityPersistence().getAll();
  res.json(registry);
}));

authRouter.put('/admin/identity-registry', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const auth = req.header('authorization') ?? '';
  const accessToken = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
  await service.assertAdminAccessToken(accessToken);
  const users = Array.isArray(req.body?.users) ? req.body.users : [];
  const assignments = Array.isArray(req.body?.assignments) ? req.body.assignments : [];
  const saved = await getAppIdentityPersistence().putAll({ users, assignments });
  res.json(saved);
}));

authRouter.post('/admin/identity-registry/sync-authenticated-users', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const auth = req.header('authorization') ?? '';
  const accessToken = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
  await service.assertAdminAccessToken(accessToken);
  const registry = await syncActiveRegistrationsIntoIdentityRegistry();
  res.json(registry);
}));

authRouter.post('/refresh', asyncHandler(async (req, res) => {
  const service      = buildDemoAuthServiceFromEnv(process.env);
  const refreshToken = String(req.body?.refreshToken || '');
  const session      = await service.refresh(refreshToken);
  res.json({ session });
}));

authRouter.post('/logout', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const auth    = req.header('authorization') ?? '';
  const accessToken = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
  await service.logout(accessToken);
  res.status(204).end();
}));

// ─── Server-authoritative capability contract ────────────────────────────────
// Display/navigation authority for the authenticated actor. Enforcement still
// happens on each protected endpoint; this only tells the UI what to render.

authRouter.get('/capabilities', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const auth = req.header('authorization') ?? '';
  const accessToken = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
  if (!accessToken) {
    throw new ApiError('auth_error', 'Not authenticated.', 401);
  }
  const capabilities = await service.resolveCapabilities(accessToken);
  res.json({ authenticated: true, authorization: { capabilities } });
}));

// ─── Administrator-only user invitation (authenticated; actor from token) ─────
// Distinct from the unauthenticated legacy /register-request. The admin actor is
// derived from the verified token, and the action is audited. Never returns a
// setup token or link.

authRouter.post('/admin/users/invite', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const auth = req.header('authorization') ?? '';
  const accessToken = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
  const email = String(req.body?.email || '');
  const result = await service.adminInviteUser(accessToken, email);

  // Audit the administrator-attributed action. The actor comes from the verified
  // token (adminInviteUser → assertAdminAccessToken), never the request body. No
  // credential, setup token, or link is recorded. Audit is NOT optional for this
  // identity mutation: a write failure yields a classified 500 (no success the
  // trail cannot corroborate), and a retry safely reconciles without duplicating.
  const correlationId = req.header('x-correlation-id') || req.header('x-request-id') || undefined;
  await recordInviteAudit(result, correlationId, appendEvent);

  res.json({
    status: result.status,
    email: result.targetEmail,
    emailDelivered: result.emailDelivered,
    provisioned: result.provisioned,
    message: inviteResultMessage(result),
  });
}));

authRouter.get('/me', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const auth    = req.header('authorization') ?? '';
  const accessToken = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
  if (!accessToken) {
    throw new ApiError('auth_error', 'Not authenticated.', 401);
  }
  const user = await service.getCurrentUser(accessToken);
  try {
    await upsertAuthenticatedIdentity(user);
  } catch {
    // Best-effort: /identity-sync/me can retry and local registry remains available.
  }
  res.json({ user });
}));

// ─── Utility ─────────────────────────────────────────────────────────────────

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}
