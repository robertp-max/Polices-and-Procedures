import { Router, type Request, type Response, type NextFunction } from 'express';
import { ApiError } from '../errors.js';
import { buildDemoAuthServiceFromEnv } from '../auth/service.js';

export const authRouter: Router = Router();

authRouter.post('/register-request', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const email = String(req.body?.email || '');
  const result = await service.registerRequest(email);
  res.json(result);
}));

authRouter.post('/resend-setup-link', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const email = String(req.body?.email || '');
  const result = await service.resendSetupLink(email);
  res.json(result);
}));

authRouter.post('/setup-account', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const { token, firstName, lastName, password } = req.body ?? {};
  const result = await service.setupAccount({
    token: String(token || ''),
    firstName: String(firstName || ''),
    lastName: String(lastName || ''),
    password: String(password || ''),
  });
  res.json(result);
}));

authRouter.post('/login', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const email = String(req.body?.email || '');
  const password = String(req.body?.password || '');
  const result = await service.login(email, password);
  res.json(result);
}));

authRouter.post('/refresh', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const refreshToken = String(req.body?.refreshToken || '');
  const session = await service.refresh(refreshToken);
  res.json({ session });
}));

authRouter.post('/logout', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const auth = req.header('authorization') ?? '';
  const accessToken = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
  await service.logout(accessToken);
  res.status(204).end();
}));

authRouter.get('/me', asyncHandler(async (req, res) => {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const auth = req.header('authorization') ?? '';
  const accessToken = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
  if (!accessToken) {
    throw new ApiError('auth_error', 'Not authenticated.', 401);
  }
  const user = await service.getCurrentUser(accessToken);
  res.json({ user });
}));

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}
