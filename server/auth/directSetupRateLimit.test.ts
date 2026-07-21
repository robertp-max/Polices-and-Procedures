/**
 * Phase 7 — direct-setup rate limiting. Separate windows for verify and setup,
 * independent IP and identity dimensions, automatic reset, no sensitive keys.
 */
import { describe, it, expect } from 'vitest';
import {
  checkDirectSetupRate, hitWindow, VERIFY_LIMIT, SETUP_LIMIT, type RateStore, type RateLimitConfig,
} from './directSetupRateLimit.js';

const cfg: RateLimitConfig = { windowMs: 1000, max: 3 };

describe('directSetupRateLimit', () => {
  it('separate verify/setup limits are configured (setup tighter)', () => {
    expect(SETUP_LIMIT.max).toBeLessThan(VERIFY_LIMIT.max);
  });

  it('allows up to max then blocks with a Retry-After', () => {
    const store: RateStore = new Map();
    for (let i = 0; i < cfg.max; i++) expect(hitWindow(store, 'k', cfg, 0).allowed).toBe(true);
    const blocked = hitWindow(store, 'k', cfg, 0);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it('resets after the window elapses', () => {
    const store: RateStore = new Map();
    for (let i = 0; i < cfg.max; i++) hitWindow(store, 'k', cfg, 0);
    expect(hitWindow(store, 'k', cfg, 0).allowed).toBe(false);
    expect(hitWindow(store, 'k', cfg, cfg.windowMs + 1).allowed).toBe(true); // new window
  });

  it('isolates by IP: one IP hitting the limit does not block another IP', () => {
    const store: RateStore = new Map();
    for (let i = 0; i < cfg.max; i++) checkDirectSetupRate(store, 'verify', '1.1.1.1', 'a@x.com', cfg, 0);
    expect(checkDirectSetupRate(store, 'verify', '1.1.1.1', 'a@x.com', cfg, 0).allowed).toBe(false);
    expect(checkDirectSetupRate(store, 'verify', '2.2.2.2', 'a@x.com', cfg, 0).allowed).toBe(false); // identity window shared
    expect(checkDirectSetupRate(store, 'verify', '2.2.2.2', 'b@x.com', cfg, 0).allowed).toBe(true);  // fresh IP + identity
  });

  it('isolates by identity: exhausting one identity does not block a different identity from a new IP', () => {
    const store: RateStore = new Map();
    for (let i = 0; i < cfg.max; i++) checkDirectSetupRate(store, 'setup', '9.9.9.9', 'victim@x.com', cfg, 0);
    expect(checkDirectSetupRate(store, 'setup', '3.3.3.3', 'other@x.com', cfg, 0).allowed).toBe(true);
  });

  it('scopes are independent (verify budget does not consume setup budget)', () => {
    const store: RateStore = new Map();
    for (let i = 0; i < cfg.max; i++) checkDirectSetupRate(store, 'verify', '1.1.1.1', 'a@x.com', cfg, 0);
    expect(checkDirectSetupRate(store, 'setup', '1.1.1.1', 'a@x.com', cfg, 0).allowed).toBe(true);
  });

  it('does not use the activation code or password as a key (identity-only)', () => {
    const store: RateStore = new Map();
    checkDirectSetupRate(store, 'setup', '1.1.1.1', 'a@x.com', cfg, 0);
    const keys = [...store.keys()].join(' ');
    expect(keys).toContain('a@x.com');
    expect(keys).not.toMatch(/password|activation|sforgid|code/i);
  });
});
