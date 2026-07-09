import { Router, type Request, type Response, type NextFunction } from 'express';
import { ApiError } from '../errors.js';
import {
  composeNolanTutorAnswer,
  NOLAN_TUTOR_PROMPT_VERSION,
  type NolanTutorContext,
} from '../ia/nolan/nolanTutorResponder.js';

/* ═══════════════════════════════════════════════════════════════════════════
   /api/nolan/* — Nolan, the Nurse Onboarding & Learning Assistant (Training
   Module tutor). USER-FACING and deterministic: grounded in the module catalog
   only — no internet, no PHI, no model call in 'deterministic' mode (default).

   This surface is intentionally DISJOINT from Nolan's research-retriever role
   (BradNolanRelay → NolanRuntime): the tutor cannot reach the relay, and the
   relay is never exposed to users. NOLAN_TUTOR_MODE=disabled turns this router
   into honest 503s.
   ═══════════════════════════════════════════════════════════════════════════ */

type NolanTutorMode = 'deterministic' | 'disabled';
function tutorMode(): NolanTutorMode {
  return process.env.NOLAN_TUTOR_MODE === 'disabled' ? 'disabled' : 'deterministic';
}

function asyncH(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}

function requireActor(req: Request): { userId: string } {
  const a = req.actor;
  if (!req.session?.authenticated || a?.type !== 'user' || !a.user_id) {
    throw new ApiError('auth_error', 'Authenticated user required.', 401);
  }
  return { userId: a.user_id };
}

export function createNolanRouter(): Router {
  const router = Router();

  router.get('/tutor/health', (_req, res) => {
    res.json({ ok: true, mode: tutorMode(), promptVersion: NOLAN_TUTOR_PROMPT_VERSION });
  });

  router.post('/tutor/ask', asyncH(async (req, res) => {
    requireActor(req);
    if (tutorMode() === 'disabled') {
      throw new ApiError('nolan_disabled', 'Nolan tutor is disabled in this environment.', 503);
    }
    const question = typeof req.body?.question === 'string' ? req.body.question : '';
    if (!question.trim()) throw new ApiError('bad_request', 'question is required.', 400);
    if (question.length > 4000) throw new ApiError('bad_request', 'question too long.', 400);

    // Optional lesson/learner context — every field validated + capped; only
    // non-sensitive training-material text and the already-sent display name.
    const raw = req.body?.context ?? {};
    const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : undefined);
    const context: NolanTutorContext = {
      moduleId: str(raw.moduleId, 24),
      lessonTitle: str(raw.lessonTitle, 200),
      lessonText: str(raw.lessonText, 12000),
      learnerName: str(raw.learnerName, 80),
      role: str(raw.role, 40),
      completedModuleIds: Array.isArray(raw.completedModuleIds)
        ? raw.completedModuleIds.filter((x: unknown): x is string => typeof x === 'string').slice(0, 300)
        : undefined,
      startDateIso: str(raw.startDateIso, 40),
      licenseExpiryIso: str(raw.licenseExpiryIso, 40),
      appendixFCleared: typeof raw.appendixFCleared === 'boolean' ? raw.appendixFCleared : undefined,
    };

    const answer = composeNolanTutorAnswer(question, context);
    res.json({
      text: answer.text,
      matched: answer.matched,
      moduleIds: answer.moduleIds,
      // Diagnostics for logging/QA only — the UI must not render this.
      path: answer.path,
    });
  }));

  return router;
}
