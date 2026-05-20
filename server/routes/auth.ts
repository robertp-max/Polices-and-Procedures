import { Router, type Request, type Response, type NextFunction } from 'express';
import { ApiError } from '../errors.js';
import { buildDemoAuthServiceFromEnv } from '../auth/service.js';
import {
  getAllowlistStatus,
  reloadApprovedUsers,
  validateAllowlistCsv,
} from '../auth/approvedUsers.js';

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
  res.json(result);
}));

authRouter.post('/respond-challenge', asyncHandler(async (req, res) => {
  const service      = buildDemoAuthServiceFromEnv(process.env);
  const email        = String(req.body?.email       || '');
  const session      = String(req.body?.session     || '');
  const newPassword  = String(req.body?.newPassword || '');
  const result       = await service.respondToNewPasswordChallenge(email, session, newPassword);
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

authRouter.get('/me', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const auth    = req.header('authorization') ?? '';
  const accessToken = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
  if (!accessToken) {
    throw new ApiError('auth_error', 'Not authenticated.', 401);
  }
  const user = await service.getCurrentUser(accessToken);
  res.json({ user });
}));

// ─── Utility ─────────────────────────────────────────────────────────────────

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}
